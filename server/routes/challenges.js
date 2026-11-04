import express from 'express';
import db from '../db.js';
import { authenticateToken, optionalToken } from '../middleware/auth.js';

const router = express.Router();

// GET /api/challenges
router.get('/', optionalToken, (req, res) => {
  try {
    const challenges = db.prepare('SELECT * FROM challenges ORDER BY category, id').all();

    if (!req.user) {
      return res.json({
        challenges: challenges.map(c => ({ ...c, completedToday: false }))
      });
    }

    // Check completion status for logged-in user
    const today = new Date().toISOString().split('T')[0];
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

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

    const enhanced = challenges.map(c => {
      const dates = completionMap.get(c.id) || [];
      let isCompletedCurrent = false;

      if (c.category === 'daily') {
        // Completed today?
        isCompletedCurrent = dates.some(d => d.startsWith(today));
      } else {
        // Completed within last 7 days?
        isCompletedCurrent = dates.some(d => d >= sevenDaysAgo);
      }

      return {
        ...c,
        completedCurrentPeriod: isCompletedCurrent,
        totalTimesCompleted: dates.length
      };
    });

    res.json({ challenges: enhanced });
  } catch (error) {
    console.error('Fetch challenges error:', error);
    res.status(500).json({ error: 'Failed to retrieve challenges' });
  }
});

// POST /api/challenges/:id/complete
router.post('/:id/complete', authenticateToken, (req, res) => {
  try {
    const challengeId = parseInt(req.params.id, 10);
    const { notes = '' } = req.body;

    const challenge = db.prepare('SELECT * FROM challenges WHERE id = ?').get(challengeId);
    if (!challenge) {
      return res.status(404).json({ error: 'Challenge not found' });
    }

    const today = new Date().toISOString().split('T')[0];
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    // Check if already completed recently
    if (challenge.category === 'daily') {
      const alreadyDone = db.prepare(`
        SELECT id FROM user_challenge_completions
        WHERE user_id = ? AND challenge_id = ? AND date(completed_at) = date('now')
      `).get(req.user.id, challengeId);

      if (alreadyDone) {
        return res.status(400).json({ error: 'You have already completed this daily challenge today. Great job! Check back tomorrow.' });
      }
    } else {
      const alreadyDoneWeekly = db.prepare(`
        SELECT id FROM user_challenge_completions
        WHERE user_id = ? AND challenge_id = ? AND completed_at >= ?
      `).get(req.user.id, challengeId, sevenDaysAgo);

      if (alreadyDoneWeekly) {
        return res.status(400).json({ error: 'You have already completed this weekly challenge within the past 7 days.' });
      }
    }

    // Record completion in transaction
    const completeTransaction = db.transaction(() => {
      db.prepare(`
        INSERT INTO user_challenge_completions (user_id, challenge_id, points_earned, notes)
        VALUES (?, ?, ?, ?)
      `).run(req.user.id, challengeId, challenge.points, notes);

      // Update points
      db.prepare(`
        INSERT INTO user_points (user_id, total_points, updated_at)
        VALUES (?, ?, CURRENT_TIMESTAMP)
        ON CONFLICT(user_id) DO UPDATE SET
          total_points = total_points + excluded.total_points,
          updated_at = CURRENT_TIMESTAMP
      `).run(req.user.id, challenge.points);
    });

    completeTransaction();

    // Fetch updated points
    const pointsRecord = db.prepare('SELECT total_points FROM user_points WHERE user_id = ?').get(req.user.id);
    const newTotalPoints = pointsRecord ? pointsRecord.total_points : 0;

    // Badge triggers
    const completedCount = db.prepare('SELECT COUNT(*) as count FROM user_challenge_completions WHERE user_id = ?').get(req.user.id).count;
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
        const hasBadge = db.prepare('SELECT id FROM user_badges WHERE user_id = ? AND badge_id = ?').get(req.user.id, b.id);
        if (!hasBadge) {
          db.prepare(`
            INSERT INTO user_badges (user_id, badge_id, badge_name, badge_description)
            VALUES (?, ?, ?, ?)
          `).run(req.user.id, b.id, b.name, b.desc);
          newBadges.push(b);
        }
      }
    }

    // Challenge-specific badge
    if (challenge.badge_award) {
      const hasSpecific = db.prepare('SELECT id FROM user_badges WHERE user_id = ? AND badge_id = ?').get(req.user.id, challenge.badge_award);
      if (!hasSpecific) {
        const badgeName = challenge.title.split(':')[0].trim();
        db.prepare(`
          INSERT INTO user_badges (user_id, badge_id, badge_name, badge_description)
          VALUES (?, ?, ?, ?)
        `).run(req.user.id, challenge.badge_award, badgeName, `Awarded for completing ${challenge.title}`);
        newBadges.push({ id: challenge.badge_award, name: badgeName, desc: `Awarded for completing ${challenge.title}` });
      }
    }

    res.json({
      message: `Challenge completed! You earned +${challenge.points} Green Points.`,
      pointsEarned: challenge.points,
      totalPoints: newTotalPoints,
      newBadges
    });
  } catch (error) {
    console.error('Complete challenge error:', error);
    res.status(500).json({ error: 'Failed to record challenge completion' });
  }
});

// GET /api/challenges/user-history
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
