import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import db from '../db.js';
import { authenticateToken, optionalToken } from '../middleware/auth.js';
import { computeImageHash, checkDuplicateSubmission } from '../services/duplicateDetector.js';
import { verifyEvidenceWithAI } from '../services/aiVerifier.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROOFS_DIR = path.resolve(__dirname, '../uploads/proofs');

// Ensure storage directory exists
if (!fs.existsSync(PROOFS_DIR)) {
  fs.mkdirSync(PROOFS_DIR, { recursive: true });
}

// Multer storage setup with secure randomized UUID filenames
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, PROOFS_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${crypto.randomUUID()}`;
    const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
    cb(null, `proof-${uniqueSuffix}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max file size
    files: 2 // Maximum 2 photos per submission
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (allowedMimes.includes(file.mimetype.toLowerCase())) {
      cb(null, true);
    } else {
      cb(new Error('Invalid image format. Only JPEG, PNG, and WebP are supported.'));
    }
  }
});

const router = express.Router();

/**
 * Checks and awards milestone and challenge-specific badges
 */
export function checkAndAwardBadges(userId, challenge) {
  const completedCount = db.prepare('SELECT COUNT(*) as count FROM user_challenge_completions WHERE user_id = ?').get(userId).count;
  const newBadges = [];

  const badgeCatalog = {
    eco_starter: { id: 'eco_starter', name: 'Eco Starter', desc: 'Completed your first green challenge', threshold: 1 },
    habit_former: { id: 'habit_former', name: 'Habit Former', desc: 'Completed 3 green challenges', threshold: 3 },
    green_champion: { id: 'green_champion', name: 'Green Champion', desc: 'Completed 5 green challenges', threshold: 5 },
    nss_warrior: { id: 'nss_warrior', name: 'NSS Eco Warrior', desc: 'Completed 10 green challenges', threshold: 10 }
  };

  for (const key of Object.keys(badgeCatalog)) {
    const b = badgeCatalog[key];
    if (completedCount >= b.threshold) {
      const hasBadge = db.prepare('SELECT id FROM user_badges WHERE user_id = ? AND badge_id = ?').get(userId, b.id);
      if (!hasBadge) {
        db.prepare(`
          INSERT INTO user_badges (user_id, badge_id, badge_name, badge_description)
          VALUES (?, ?, ?, ?)
        `).run(userId, b.id, b.name, b.desc);
        newBadges.push(b);
      }
    }
  }

  // Challenge-specific badge
  if (challenge && challenge.badge_award) {
    const hasSpecific = db.prepare('SELECT id FROM user_badges WHERE user_id = ? AND badge_id = ?').get(userId, challenge.badge_award);
    if (!hasSpecific) {
      const badgeName = challenge.title.split(':')[0].trim();
      db.prepare(`
        INSERT INTO user_badges (user_id, badge_id, badge_name, badge_description)
        VALUES (?, ?, ?, ?)
      `).run(userId, challenge.badge_award, badgeName, `Awarded for completing ${challenge.title}`);
      newBadges.push({ id: challenge.badge_award, name: badgeName, desc: `Awarded for completing ${challenge.title}` });
    }
  }

  return newBadges;
}

// GET /api/challenges
router.get('/', optionalToken, (req, res) => {
  try {
    const challenges = db.prepare(`
      SELECT id, slug, title, description, environmental_benefit, difficulty, category, points,
             action_steps, badge_award, evidence_guidance, acceptable_evidence, recommended_photos, privacy_guidance
      FROM challenges
      ORDER BY category, id
    `).all();

    if (!req.user) {
      return res.json({
        challenges: challenges.map(c => ({
          ...c,
          completedCurrentPeriod: false,
          submissionStatus: null
        }))
      });
    }

    const today = new Date().toISOString().split('T')[0];
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    // Completions map
    const completions = db.prepare(`
      SELECT challenge_id, completed_at FROM user_challenge_completions
      WHERE user_id = ?
    `).all(req.user.id);

    const completionMap = new Map();
    for (const c of completions) {
      if (!completionMap.has(c.challenge_id)) {
        completionMap.set(c.challenge_id, []);
      }
      completionMap.get(c.challenge_id).push(c.completed_at);
    }

    // Active submissions map (latest status for each challenge)
    const latestSubmissions = db.prepare(`
      SELECT cs.id, cs.challenge_id, cs.status, cs.created_at, cs.ai_reason, cs.review_reason
      FROM challenge_submissions cs
      INNER JOIN (
        SELECT challenge_id, MAX(id) as max_id
        FROM challenge_submissions
        WHERE user_id = ?
        GROUP BY challenge_id
      ) latest ON cs.id = latest.max_id
    `).all(req.user.id);

    const subMap = new Map();
    for (const s of latestSubmissions) {
      subMap.set(s.challenge_id, s);
    }

    const enhanced = challenges.map(c => {
      const dates = completionMap.get(c.id) || [];
      let isCompletedCurrent = false;

      if (c.category === 'daily') {
        isCompletedCurrent = dates.some(d => d.startsWith(today));
      } else {
        isCompletedCurrent = dates.some(d => d >= sevenDaysAgo);
      }

      const activeSub = subMap.get(c.id);

      return {
        ...c,
        completedCurrentPeriod: isCompletedCurrent,
        totalTimesCompleted: dates.length,
        latestSubmission: activeSub ? {
          id: activeSub.id,
          status: activeSub.status,
          createdAt: activeSub.created_at,
          aiReason: activeSub.ai_reason,
          reviewReason: activeSub.review_reason
        } : null
      };
    });

    res.json({ challenges: enhanced });
  } catch (error) {
    console.error('Fetch challenges error:', error);
    res.status(500).json({ error: 'Failed to retrieve challenges' });
  }
});

// POST /api/challenges/:id/submit (Photo Evidence Submission + AI Verification)
router.post('/:id/submit', authenticateToken, (req, res) => {
  upload.array('photos', 2)(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ error: err.message || 'Error processing uploaded photo evidence' });
    }

    const uploadedFiles = req.files || [];
    if (uploadedFiles.length === 0) {
      return res.status(400).json({ error: 'Please select or capture at least one photo showing your challenge evidence.' });
    }

    const challengeId = parseInt(req.params.id, 10);
    const { notes = '', evidenceConfirmed } = req.body;

    const challenge = db.prepare('SELECT * FROM challenges WHERE id = ?').get(challengeId);
    if (!challenge) {
      uploadedFiles.forEach(f => { try { fs.unlinkSync(f.path); } catch {} });
      return res.status(404).json({ error: 'Challenge not found' });
    }

    // Check recent completion limits
    const today = new Date().toISOString().split('T')[0];
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    if (challenge.category === 'daily') {
      const alreadyDone = db.prepare(`
        SELECT id FROM user_challenge_completions
        WHERE user_id = ? AND challenge_id = ? AND date(completed_at) = date('now')
      `).get(req.user.id, challengeId);

      if (alreadyDone) {
        uploadedFiles.forEach(f => { try { fs.unlinkSync(f.path); } catch {} });
        return res.status(400).json({ error: 'You have already completed this daily challenge today. Great job! Check back tomorrow.' });
      }
    } else {
      const alreadyDoneWeekly = db.prepare(`
        SELECT id FROM user_challenge_completions
        WHERE user_id = ? AND challenge_id = ? AND completed_at >= ?
      `).get(req.user.id, challengeId, sevenDaysAgo);

      if (alreadyDoneWeekly) {
        uploadedFiles.forEach(f => { try { fs.unlinkSync(f.path); } catch {} });
        return res.status(400).json({ error: 'You have already completed this weekly initiative within the past 7 days.' });
      }
    }

    // Check if user already has an active pending submission for this challenge
    const pendingSub = db.prepare(`
      SELECT id FROM challenge_submissions
      WHERE user_id = ? AND challenge_id = ? AND status IN ('submitted', 'verifying', 'needs_review')
    `).get(req.user.id, challengeId);

    if (pendingSub) {
      uploadedFiles.forEach(f => { try { fs.unlinkSync(f.path); } catch {} });
      return res.status(400).json({ error: 'You already have an evidence submission under review for this challenge. Please wait for coordinator review or outcome.' });
    }

    // Compute SHA-256 hashes of all uploaded files
    const fileHashes = uploadedFiles.map(f => computeImageHash(f.path));
    const fileNames = uploadedFiles.map(f => path.basename(f.path));

    // Duplicate Photo Anti-Fraud check
    const dupCheck = checkDuplicateSubmission(fileHashes, req.user.id);
    if (dupCheck.isDuplicate) {
      uploadedFiles.forEach(f => { try { fs.unlinkSync(f.path); } catch {} });
      return res.status(400).json({
        error: dupCheck.duplicateReason,
        code: 'DUPLICATE_IMAGE_DETECTED'
      });
    }

    // Insert submission in 'verifying' status
    const isConfirmed = evidenceConfirmed === 'true' || evidenceConfirmed === true || evidenceConfirmed === 1 ? 1 : 0;
    const insertSub = db.prepare(`
      INSERT INTO challenge_submissions (
        user_id, challenge_id, status, image_paths_json, image_hashes_json,
        user_notes, evidence_confirmed, ai_status
      )
      VALUES (?, ?, 'verifying', ?, ?, ?, ?, 'in_progress')
    `);

    const result = insertSub.run(
      req.user.id,
      challengeId,
      JSON.stringify(fileNames),
      JSON.stringify(fileHashes),
      notes,
      isConfirmed
    );
    const submissionId = result.lastInsertRowid;

    // Log verification event
    db.prepare(`
      INSERT INTO verification_events (submission_id, event_type, from_status, to_status, reason, metadata_json)
      VALUES (?, 'submitted', 'draft', 'verifying', 'User submitted photo evidence for AI verification', ?)
    `).run(submissionId, JSON.stringify({ fileCount: uploadedFiles.length, fileNames }));

    // Run AI Verification Service
    try {
      const aiResult = await verifyEvidenceWithAI(uploadedFiles, challenge, notes);

      if (aiResult.status === 'passed') {
        // High confidence verification passed! Award points atomically
        let newTotalPoints = 0;
        let newBadges = [];

        const awardTx = db.transaction(() => {
          // 1. Update submission
          db.prepare(`
            UPDATE challenge_submissions
            SET status = 'verified',
                ai_status = 'passed',
                ai_confidence = ?,
                ai_relevance = ?,
                ai_quality = ?,
                ai_reason = ?,
                ai_raw_json = ?,
                points_awarded = ?,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
          `).run(
            aiResult.confidence,
            aiResult.relevance,
            aiResult.quality,
            aiResult.reason,
            aiResult.rawJson || '',
            challenge.points,
            submissionId
          );

          // 2. Record completion
          db.prepare(`
            INSERT INTO user_challenge_completions (user_id, challenge_id, points_earned, notes)
            VALUES (?, ?, ?, ?)
          `).run(req.user.id, challengeId, challenge.points, notes);

          // 3. Transparent Points Ledger
          db.prepare(`
            INSERT INTO points_ledger (user_id, challenge_id, submission_id, points, transaction_type, description)
            VALUES (?, ?, ?, ?, 'challenge_completion', ?)
          `).run(
            req.user.id,
            challengeId,
            submissionId,
            challenge.points,
            `Verified completion of ${challenge.title}`
          );

          // 4. Update user points total
          db.prepare(`
            INSERT INTO user_points (user_id, total_points, updated_at)
            VALUES (?, ?, CURRENT_TIMESTAMP)
            ON CONFLICT(user_id) DO UPDATE SET
              total_points = total_points + excluded.total_points,
              updated_at = CURRENT_TIMESTAMP
          `).run(req.user.id, challenge.points);

          // 5. Verification audit event
          db.prepare(`
            INSERT INTO verification_events (submission_id, event_type, from_status, to_status, reason, metadata_json)
            VALUES (?, 'ai_verified', 'verifying', 'verified', ?, ?)
          `).run(
            submissionId,
            aiResult.reason,
            JSON.stringify({ confidence: aiResult.confidence, relevance: aiResult.relevance })
          );
        });

        awardTx();

        // Check for badges
        newBadges = checkAndAwardBadges(req.user.id, challenge);

        const pointsRec = db.prepare('SELECT total_points FROM user_points WHERE user_id = ?').get(req.user.id);
        newTotalPoints = pointsRec ? pointsRec.total_points : challenge.points;

        return res.json({
          status: 'verified',
          message: `Evidence accepted for this challenge! You earned +${challenge.points} Green Points.`,
          pointsEarned: challenge.points,
          totalPoints: newTotalPoints,
          newBadges,
          submissionId,
          aiFeedback: {
            confidence: Math.round(aiResult.confidence * 100),
            reason: aiResult.reason,
            description: aiResult.evidenceDescription
          }
        });
      } else if (aiResult.status === 'flagged' || aiResult.status === 'needs_review') {
        // Borderline or queued for coordinator review
        db.prepare(`
          UPDATE challenge_submissions
          SET status = 'needs_review',
              ai_status = 'flagged',
              ai_confidence = ?,
              ai_relevance = ?,
              ai_quality = ?,
              ai_reason = ?,
              ai_raw_json = ?,
              updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `).run(
          aiResult.confidence,
          aiResult.relevance,
          aiResult.quality,
          aiResult.reason,
          aiResult.rawJson || '',
          submissionId
        );

        db.prepare(`
          INSERT INTO verification_events (submission_id, event_type, from_status, to_status, reason, metadata_json)
          VALUES (?, 'needs_review', 'verifying', 'needs_review', ?, ?)
        `).run(submissionId, aiResult.reason, JSON.stringify({ confidence: aiResult.confidence }));

        return res.json({
          status: 'needs_review',
          message: 'Evidence queued for coordinator review. Your Green Points will be credited once verified by your institution coordinator.',
          pointsEarned: 0,
          submissionId,
          aiFeedback: {
            reason: aiResult.reason,
            confidence: Math.round(aiResult.confidence * 100)
          }
        });
      } else {
        // Verification failed (photo was clearly irrelevant, blank, or unsafe)
        db.prepare(`
          UPDATE challenge_submissions
          SET status = 'rejected',
              ai_status = 'failed',
              ai_confidence = ?,
              ai_relevance = ?,
              ai_quality = ?,
              ai_reason = ?,
              ai_raw_json = ?,
              updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `).run(
          aiResult.confidence,
          aiResult.relevance,
          aiResult.quality,
          aiResult.reason,
          aiResult.rawJson || '',
          submissionId
        );

        db.prepare(`
          INSERT INTO verification_events (submission_id, event_type, from_status, to_status, reason, metadata_json)
          VALUES (?, 'ai_rejected', 'verifying', 'rejected', ?, ?)
        `).run(submissionId, aiResult.reason, JSON.stringify({ confidence: aiResult.confidence }));

        return res.json({
          status: 'rejected',
          message: `Photo verification was not successful: ${aiResult.reason}. Please check the evidence requirements and try again with a clearer photo.`,
          pointsEarned: 0,
          submissionId,
          aiFeedback: {
            reason: aiResult.reason,
            confidence: Math.round(aiResult.confidence * 100)
          }
        });
      }
    } catch (verifError) {
      console.error('AI verification process error:', verifError);
      // Mark as needs_review rather than failing completely
      db.prepare(`
        UPDATE challenge_submissions
        SET status = 'needs_review',
            ai_status = 'skipped',
            ai_reason = 'Queued for coordinator review due to system verification latency',
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(submissionId);

      return res.json({
        status: 'needs_review',
        message: 'Your photo evidence has been safely uploaded and queued for coordinator review.',
        pointsEarned: 0,
        submissionId
      });
    }
  });
});

// GET /api/challenges/submissions (User's submissions history)
router.get('/submissions', authenticateToken, (req, res) => {
  try {
    const submissions = db.prepare(`
      SELECT cs.id, cs.challenge_id, cs.status, cs.image_paths_json, cs.user_notes,
             cs.ai_status, cs.ai_confidence, cs.ai_relevance, cs.ai_reason,
             cs.review_decision, cs.review_reason, cs.reviewed_at, cs.points_awarded,
             cs.created_at, cs.updated_at,
             c.title, c.category, c.difficulty, c.slug, c.points
      FROM challenge_submissions cs
      JOIN challenges c ON cs.challenge_id = c.id
      WHERE cs.user_id = ?
      ORDER BY cs.created_at DESC
      LIMIT 100
    `).all(req.user.id);

    const formatted = submissions.map(s => {
      let photos = [];
      try {
        photos = JSON.parse(s.image_paths_json || '[]');
      } catch {
        photos = [];
      }
      return {
        id: s.id,
        challengeId: s.challenge_id,
        title: s.title,
        category: s.category,
        difficulty: s.difficulty,
        points: s.points,
        pointsAwarded: s.points_awarded,
        status: s.status,
        photos,
        userNotes: s.user_notes,
        aiStatus: s.ai_status,
        aiConfidence: s.ai_confidence ? Math.round(s.ai_confidence * 100) : null,
        aiReason: s.ai_reason,
        reviewDecision: s.review_decision,
        reviewReason: s.review_reason,
        reviewedAt: s.reviewed_at,
        createdAt: s.created_at
      };
    });

    res.json({ submissions: formatted });
  } catch (error) {
    console.error('Fetch user submissions error:', error);
    res.status(500).json({ error: 'Failed to retrieve submissions' });
  }
});

// GET /api/challenges/proof/:filename (Authenticated Image Stream)
router.get('/proof/:filename', authenticateToken, (req, res) => {
  try {
    const filename = path.basename(req.params.filename); // Sanitize filename against traversal
    const filePath = path.join(PROOFS_DIR, filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Evidence photo not found' });
    }

    // Security check: Must be admin OR the user who submitted this photo
    if (req.user.role !== 'admin') {
      const match = db.prepare(`
        SELECT id FROM challenge_submissions
        WHERE user_id = ? AND image_paths_json LIKE ?
      `).get(req.user.id, `%${filename}%`);

      if (!match) {
        return res.status(403).json({ error: 'Access denied to this evidence photo' });
      }
    }

    // Determine content type
    const ext = path.extname(filename).toLowerCase();
    const mimeMap = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.webp': 'image/webp'
    };
    const contentType = mimeMap[ext] || 'image/jpeg';

    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'private, max-age=86400');
    fs.createReadStream(filePath).pipe(res);
  } catch (error) {
    console.error('Serve proof photo error:', error);
    res.status(500).json({ error: 'Failed to stream photo' });
  }
});

// GET /api/challenges/user-history (Legacy completed challenges list)
router.get('/user-history', authenticateToken, (req, res) => {
  try {
    const history = db.prepare(`
      SELECT ucc.id, ucc.completed_at, ucc.points_earned, ucc.notes,
             c.title, c.category, c.difficulty, c.slug
      FROM user_challenge_completions ucc
      JOIN challenges c ON ucc.challenge_id = c.id
      WHERE ucc.user_id = ?
      ORDER BY ucc.completed_at DESC
      LIMIT 50
    `).all(req.user.id);

    res.json({ history });
  } catch (error) {
    console.error('Fetch challenge history error:', error);
    res.status(500).json({ error: 'Failed to retrieve completion history' });
  }
});

export default router;
