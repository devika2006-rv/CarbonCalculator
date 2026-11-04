import express from 'express';
import db from '../db.js';

const router = express.Router();

// GET /api/community/overview
router.get('/overview', (req, res) => {
  try {
    const totalUsers = db.prepare('SELECT COUNT(*) as count FROM users WHERE role = ?').get('user').count;

    const totalInstitutions = db.prepare(`
      SELECT COUNT(DISTINCT institution_name) as count
      FROM users
      WHERE institution_name IS NOT NULL AND institution_name != ''
    `).get().count;

    const totalCalculations = db.prepare('SELECT COUNT(*) as count FROM carbon_calculations').get().count;

    const totalChallengesCompleted = db.prepare('SELECT COUNT(*) as count FROM user_challenge_completions').get().count;

    const totalPointsRecord = db.prepare('SELECT SUM(total_points) as sum FROM user_points').get();
    const totalGreenPoints = totalPointsRecord ? (totalPointsRecord.sum || 0) : 0;

    // Category breakdown
    const categoryCounts = db.prepare(`
      SELECT category, COUNT(*) as count
      FROM users
      WHERE role = 'user'
      GROUP BY category
      ORDER BY count DESC
    `).all();

    // District breakdown
    const districtCounts = db.prepare(`
      SELECT district, COUNT(*) as user_count
      FROM users
      WHERE district IS NOT NULL AND district != ''
      GROUP BY district
      ORDER BY user_count DESC
      LIMIT 10
    `).all();

    res.json({
      overview: {
        totalUsers,
        totalInstitutions,
        totalCalculations,
        totalChallengesCompleted,
        totalGreenPoints
      },
      categoryCounts,
      districtCounts
    });
  } catch (error) {
    console.error('Community overview error:', error);
    res.status(500).json({ error: 'Failed to retrieve community statistics' });
  }
});

// GET /api/community/institutions
router.get('/institutions', (req, res) => {
  try {
    const { district, type } = req.query;

    let query = `
      SELECT
        u.institution_name,
        u.institution_type,
        u.district,
        COUNT(DISTINCT u.id) as participant_count,
        COALESCE(SUM(up.total_points), 0) as total_points,
        COUNT(DISTINCT cc.id) as calculations_count
      FROM users u
      LEFT JOIN user_points up ON u.id = up.user_id
      LEFT JOIN carbon_calculations cc ON u.id = cc.user_id
      WHERE u.institution_name IS NOT NULL AND u.institution_name != ''
    `;

    const params = [];

    if (district) {
      query += ` AND LOWER(u.district) = LOWER(?)`;
      params.push(district);
    }

    if (type) {
      query += ` AND LOWER(u.institution_type) = LOWER(?)`;
      params.push(type);
    }

    query += `
      GROUP BY u.institution_name, u.institution_type, u.district
      ORDER BY total_points DESC, participant_count DESC
      LIMIT 50
    `;

    const institutions = db.prepare(query).all(...params);

    res.json({ institutions });
  } catch (error) {
    console.error('Community institutions error:', error);
    res.status(500).json({ error: 'Failed to retrieve institution data' });
  }
});

// GET /api/community/districts
router.get('/districts', (req, res) => {
  try {
    const districts = db.prepare(`
      SELECT
        u.district,
        COUNT(DISTINCT u.id) as user_count,
        COUNT(DISTINCT u.institution_name) as institution_count,
        COALESCE(SUM(up.total_points), 0) as total_points
      FROM users u
      LEFT JOIN user_points up ON u.id = up.user_id
      WHERE u.district IS NOT NULL AND u.district != ''
      GROUP BY u.district
      ORDER BY user_count DESC
    `).all();

    res.json({ districts });
  } catch (error) {
    console.error('Districts error:', error);
    res.status(500).json({ error: 'Failed to retrieve district data' });
  }
});

export default router;
