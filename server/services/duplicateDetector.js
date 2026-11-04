import crypto from 'crypto';
import fs from 'fs';
import db from '../db.js';

/**
 * Computes SHA-256 hash of a file on disk or a buffer
 * @param {string|Buffer} source File path or buffer
 * @returns {string} Hexadecimal SHA-256 hash
 */
export function computeImageHash(source) {
  const hash = crypto.createHash('sha256');
  if (Buffer.isBuffer(source)) {
    hash.update(source);
  } else if (typeof source === 'string') {
    const fileBuffer = fs.readFileSync(source);
    hash.update(fileBuffer);
  } else {
    throw new Error('Unsupported source for hash calculation');
  }
  return hash.digest('hex');
}

/**
 * Checks if any of the given hashes were previously submitted in challenge_submissions
 * @param {string[]} hashes Array of SHA-256 hashes
 * @param {number|null} currentUserId User submitting the photos
 * @returns {{ isDuplicate: boolean, duplicateReason: string|null, previousSubmission: object|null }}
 */
export function checkDuplicateSubmission(hashes, currentUserId = null) {
  if (!hashes || hashes.length === 0) {
    return { isDuplicate: false, duplicateReason: null, previousSubmission: null };
  }

  // Fetch recent approved or pending submissions (last 1000 to be fast and thorough)
  const submissions = db.prepare(`
    SELECT id, user_id, challenge_id, status, image_hashes_json, created_at
    FROM challenge_submissions
    WHERE status IN ('verified', 'submitted', 'needs_review')
    ORDER BY id DESC
    LIMIT 1000
  `).all();

  for (const sub of submissions) {
    let subHashes = [];
    try {
      subHashes = JSON.parse(sub.image_hashes_json || '[]');
    } catch {
      subHashes = [];
    }

    for (const h of hashes) {
      if (subHashes.includes(h)) {
        const isSameUser = sub.user_id === currentUserId;
        const duplicateReason = isSameUser
          ? 'Duplicate photo detected: you have already submitted this exact image in a previous challenge submission.'
          : 'Duplicate photo detected: this identical image was already submitted by another user.';
        return {
          isDuplicate: true,
          duplicateReason,
          previousSubmission: sub
        };
      }
    }
  }

  return { isDuplicate: false, duplicateReason: null, previousSubmission: null };
}
