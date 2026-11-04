import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import db from '../db.js';
import { JWT_SECRET, requireAdmin } from '../middleware/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbFilePath = path.resolve(__dirname, '../carboncalculator.db');

const router = express.Router();

// POST /api/admin/login
router.post('/login', (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const user = db.prepare('SELECT * FROM users WHERE email = ? AND role = ?').get(email.toLowerCase().trim(), 'admin');
    if (!user) {
      return res.status(401).json({ error: 'Invalid administrative credentials' });
    }

    const isMatch = bcrypt.compareSync(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid administrative credentials' });
    }

    db.prepare('UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE id = ?').run(user.id);

    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Admin access authorized',
      token,
      admin: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ error: 'Internal server error during admin login' });
  }
});

// POST /api/admin/bootstrap (Initial admin setup or password reset with secure key)
router.post('/bootstrap', (req, res) => {
  try {
    const { setupKey, email, password, name } = req.body;
    const SERVER_BOOTSTRAP_KEY = process.env.BOOTSTRAP_KEY || 'vast-energy-cell-2026-setup';

    if (setupKey !== SERVER_BOOTSTRAP_KEY) {
      return res.status(403).json({ error: 'Invalid setup key' });
    }

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password, salt);

    const existingAdmin = db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase().trim());
    if (existingAdmin) {
      db.prepare('UPDATE users SET password_hash = ?, role = ? WHERE id = ?').run(hash, 'admin', existingAdmin.id);
    } else {
      db.prepare(`
        INSERT INTO users (name, email, password_hash, role, category, institution_name, institution_type, district)
        VALUES (?, ?, ?, 'admin', 'NSS Volunteer', 'Vidya Academy of Science and Technology', 'College', 'Thrissur')
      `).run(name || 'Energy Cell Admin', email.toLowerCase().trim(), hash);
    }

    res.json({ message: 'Administrative credentials successfully configured' });
  } catch (error) {
    console.error('Admin bootstrap error:', error);
    res.status(500).json({ error: 'Failed to configure administrator' });
  }
});

// GET /api/admin/overview
router.get('/overview', requireAdmin, (req, res) => {
  try {
    const totalUsers = db.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'user'").get().count;
    const completedProfiles = db.prepare(`
      SELECT COUNT(*) as count FROM users
      WHERE role = 'user' AND institution_name IS NOT NULL AND institution_name != ''
        AND district IS NOT NULL AND district != ''
    `).get().count;
    const newRegistrations7d = db.prepare(`
      SELECT COUNT(*) as count FROM users
      WHERE role = 'user' AND created_at >= date('now', '-7 days')
    `).get().count;
    const newRegistrations30d = db.prepare(`
      SELECT COUNT(*) as count FROM users
      WHERE role = 'user' AND created_at >= date('now', '-30 days')
    `).get().count;
    const activeUsers7d = db.prepare(`
      SELECT COUNT(*) as count FROM users
      WHERE role = 'user' AND last_login_at IS NOT NULL AND last_login_at >= date('now', '-7 days')
    `).get().count;
    const activeUsers30d = db.prepare(`
      SELECT COUNT(*) as count FROM users
      WHERE role = 'user' AND last_login_at IS NOT NULL AND last_login_at >= date('now', '-30 days')
    `).get().count;
    const totalInstitutions = db.prepare(`
      SELECT COUNT(DISTINCT institution_name) as count FROM users
      WHERE role = 'user' AND institution_name IS NOT NULL AND institution_name != ''
    `).get().count;
    const totalCalculations = db.prepare('SELECT COUNT(*) as count FROM carbon_calculations').get().count;
    const calcsToday = db.prepare("SELECT COUNT(*) as count FROM carbon_calculations WHERE date(calculated_at) = date('now')").get().count;
    const calcsThisMonth = db.prepare("SELECT COUNT(*) as count FROM carbon_calculations WHERE calculated_at >= date('now', 'start of month')").get().count;
    const totalChallenges = db.prepare('SELECT COUNT(*) as count FROM user_challenge_completions').get().count;
    const uniqueChallengeUsers = db.prepare('SELECT COUNT(DISTINCT user_id) as count FROM user_challenge_completions').get().count;
    const totalEnquiries = db.prepare('SELECT COUNT(*) as count FROM enquiries').get().count;

    const pointsSum = db.prepare('SELECT SUM(total_points) as sum FROM user_points').get();
    const totalGreenPoints = pointsSum ? (pointsSum.sum || 0) : 0;

    // Categories
    const categories = db.prepare(`
      SELECT category, COUNT(*) as count FROM users
      WHERE role = 'user' GROUP BY category ORDER BY count DESC
    `).all();

    // Districts
    const districts = db.prepare(`
      SELECT district, COUNT(*) as count FROM users
      WHERE role = 'user' AND district IS NOT NULL AND district != ''
      GROUP BY district ORDER BY count DESC
    `).all();

    // Top Institutions: genuine registered & participating counts from DB
    const institutions = db.prepare(`
      SELECT
        u.institution_name,
        u.institution_type,
        u.district,
        COUNT(DISTINCT u.id) as registered_count,
        COUNT(DISTINCT CASE WHEN cc.id IS NOT NULL OR ucc.id IS NOT NULL THEN u.id END) as participating_count,
        COUNT(DISTINCT cc.id) as calculation_count,
        COALESCE(SUM(up.total_points), 0) as total_points
      FROM users u
      LEFT JOIN carbon_calculations cc ON u.id = cc.user_id
      LEFT JOIN user_challenge_completions ucc ON u.id = ucc.user_id
      LEFT JOIN user_points up ON u.id = up.user_id
      WHERE u.role = 'user' AND u.institution_name IS NOT NULL AND u.institution_name != ''
      GROUP BY u.institution_name, u.institution_type, u.district
      ORDER BY registered_count DESC, total_points DESC
      LIMIT 20
    `).all();

    res.json({
      stats: {
        totalUsers,
        completedProfiles,
        newRegistrations7d,
        newRegistrations30d,
        activeUsers7d,
        activeUsers30d,
        totalInstitutions,
        totalCalculations,
        calcsToday,
        calcsThisMonth,
        totalChallenges,
        uniqueChallengeUsers,
        totalGreenPoints,
        totalEnquiries
      },
      categories,
      districts,
      institutions
    });
  } catch (error) {
    console.error('Admin overview error:', error);
    res.status(500).json({ error: 'Failed to retrieve admin overview' });
  }
});

// GET /api/admin/users (Search, Filter, Pagination)
router.get('/users', requireAdmin, (req, res) => {
  try {
    const { search, district, institution, category, type, profile_status, page = 1, limit = 25 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    let baseQuery = `
      FROM users u
      LEFT JOIN user_points up ON u.id = up.user_id
      WHERE u.role = 'user'
    `;
    const params = [];

    if (search) {
      baseQuery += ` AND (LOWER(u.name) LIKE ? OR LOWER(u.email) LIKE ?)`;
      params.push(`%${search.toLowerCase()}%`, `%${search.toLowerCase()}%`);
    }

    if (district) {
      baseQuery += ` AND LOWER(u.district) = LOWER(?)`;
      params.push(district);
    }

    if (institution) {
      baseQuery += ` AND LOWER(u.institution_name) LIKE ?`;
      params.push(`%${institution.toLowerCase()}%`);
    }

    if (category) {
      baseQuery += ` AND u.category = ?`;
      params.push(category);
    }

    if (type) {
      baseQuery += ` AND u.institution_type = ?`;
      params.push(type);
    }

    if (profile_status === 'complete') {
      baseQuery += ` AND u.institution_name IS NOT NULL AND u.institution_name != '' AND u.district IS NOT NULL AND u.district != ''`;
    } else if (profile_status === 'incomplete') {
      baseQuery += ` AND (u.institution_name IS NULL OR u.institution_name = '' OR u.district IS NULL OR u.district = '')`;
    }

    const totalCount = db.prepare(`SELECT COUNT(*) as count ${baseQuery}`).get(...params).count;

    const users = db.prepare(`
      SELECT
        u.id, u.name, u.email, u.category, u.institution_name, u.institution_type,
        u.district, u.created_at, u.last_login_at,
        CASE
          WHEN u.institution_name IS NOT NULL AND u.institution_name != '' AND u.district IS NOT NULL AND u.district != ''
          THEN 1 ELSE 0
        END as is_profile_complete,
        COALESCE(up.total_points, 0) as total_points,
        (SELECT COUNT(*) FROM carbon_calculations cc WHERE cc.user_id = u.id) as calc_count,
        (SELECT COUNT(*) FROM user_challenge_completions ucc WHERE ucc.user_id = u.id) as challenge_count
      ${baseQuery}
      ORDER BY u.created_at DESC
      LIMIT ? OFFSET ?
    `).all(...params, Number(limit), offset);

    res.json({
      users,
      pagination: {
        total: totalCount,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.max(1, Math.ceil(totalCount / Number(limit)))
      }
    });
  } catch (error) {
    console.error('Admin users error:', error);
    res.status(500).json({ error: 'Failed to retrieve user records' });
  }
});

// DELETE /api/admin/users/:id (Account removal / data privacy request)
router.delete('/users/:id', requireAdmin, (req, res) => {
  try {
    const userId = parseInt(req.params.id, 10);
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.role === 'admin') {
      return res.status(403).json({ error: 'Administrator accounts cannot be deleted here' });
    }

    db.transaction(() => {
      db.prepare('DELETE FROM carbon_calculations WHERE user_id = ?').run(userId);
      db.prepare('DELETE FROM user_challenge_completions WHERE user_id = ?').run(userId);
      db.prepare('DELETE FROM user_points WHERE user_id = ?').run(userId);
      db.prepare('DELETE FROM user_badges WHERE user_id = ?').run(userId);
      db.prepare('DELETE FROM users WHERE id = ?').run(userId);
    })();

    res.json({ message: `User record #${userId} (${user.email}) successfully purged pursuant to data removal request.` });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// GET /api/admin/analytics
router.get('/analytics', requireAdmin, (req, res) => {
  try {
    // Calculations over time (last 30 days)
    const calcsOverTime = db.prepare(`
      SELECT date(calculated_at) as date, COUNT(*) as count, AVG(monthly_co2_kg) as avg_co2
      FROM carbon_calculations
      WHERE calculated_at >= date('now', '-30 days')
      GROUP BY date(calculated_at)
      ORDER BY date ASC
    `).all();

    // Challenge completion counts by challenge
    const challengeStats = db.prepare(`
      SELECT c.id, c.title, c.category, c.difficulty, COUNT(ucc.id) as completion_count
      FROM challenges c
      LEFT JOIN user_challenge_completions ucc ON c.id = ucc.challenge_id
      GROUP BY c.id
      ORDER BY completion_count DESC
    `).all();

    // Challenge participation by institution
    const challengeInstitutions = db.prepare(`
      SELECT u.institution_name, COUNT(ucc.id) as completion_count, COUNT(DISTINCT ucc.user_id) as participant_count
      FROM user_challenge_completions ucc
      JOIN users u ON ucc.user_id = u.id
      WHERE u.institution_name IS NOT NULL AND u.institution_name != ''
      GROUP BY u.institution_name
      ORDER BY completion_count DESC
      LIMIT 10
    `).all();

    // Emission category averages
    const categoryAverages = db.prepare(`
      SELECT
        COALESCE(AVG(electricity_co2_kg), 0) as avg_electricity,
        COALESCE(AVG(transport_co2_kg), 0) as avg_transport,
        COALESCE(AVG(food_co2_kg), 0) as avg_food,
        COALESCE(AVG(plastic_co2_kg), 0) as avg_plastic,
        COALESCE(AVG(waste_co2_kg), 0) as avg_waste,
        COALESCE(AVG(lifestyle_co2_kg), 0) as avg_lifestyle
      FROM carbon_calculations
    `).get();

    res.json({
      calcsOverTime,
      challengeStats,
      challengeInstitutions,
      categoryAverages
    });
  } catch (error) {
    console.error('Admin analytics error:', error);
    res.status(500).json({ error: 'Failed to retrieve analytics' });
  }
});

// GET /api/admin/enquiries
router.get('/enquiries', requireAdmin, (req, res) => {
  try {
    const enquiries = db.prepare('SELECT * FROM enquiries ORDER BY created_at DESC').all();
    res.json({ enquiries });
  } catch (error) {
    console.error('Admin enquiries error:', error);
    res.status(500).json({ error: 'Failed to retrieve enquiries' });
  }
});

// GET /api/admin/backup/db (Raw SQLite binary download)
router.get('/backup/db', requireAdmin, (req, res) => {
  try {
    if (!fs.existsSync(dbFilePath)) {
      return res.status(404).json({ error: 'Database file not found on server' });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `carboncalculator-backup-${timestamp}.db`;

    res.setHeader('Content-Type', 'application/x-sqlite3');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    const fileStream = fs.createReadStream(dbFilePath);
    fileStream.pipe(res);
  } catch (error) {
    console.error('DB backup error:', error);
    res.status(500).json({ error: 'Failed to stream database backup' });
  }
});

// GET /api/admin/backup/json (Complete JSON dump of all tables)
router.get('/backup/json', requireAdmin, (req, res) => {
  try {
    const users = db.prepare('SELECT id, name, email, role, category, institution_name, institution_type, district, created_at, last_login_at FROM users').all();
    const calculations = db.prepare('SELECT * FROM carbon_calculations').all();
    const challenges = db.prepare('SELECT * FROM challenges').all();
    const completions = db.prepare('SELECT * FROM user_challenge_completions').all();
    const points = db.prepare('SELECT * FROM user_points').all();
    const badges = db.prepare('SELECT * FROM user_badges').all();
    const enquiries = db.prepare('SELECT * FROM enquiries').all();
    const factors = db.prepare('SELECT * FROM emission_factors').all();

    const dump = {
      platform: 'CarbonCalculator - VAST Energy Cell',
      exported_at: new Date().toISOString(),
      tables: {
        users,
        carbon_calculations: calculations,
        challenges,
        user_challenge_completions: completions,
        user_points: points,
        user_badges: badges,
        enquiries,
        emission_factors: factors
      }
    };

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="carboncalculator-dump-${timestamp}.json"`);
    res.send(JSON.stringify(dump, null, 2));
  } catch (error) {
    console.error('JSON backup error:', error);
    res.status(500).json({ error: 'Failed to generate JSON backup' });
  }
});

// GET /api/admin/export/csv
router.get('/export/csv', requireAdmin, (req, res) => {
  try {
    const { type = 'users' } = req.query;
    let csv = '';
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

    if (type === 'users') {
      const rows = db.prepare(`
        SELECT u.id, u.name, u.email, u.category, u.institution_name, u.institution_type, u.district,
               u.created_at, u.last_login_at, COALESCE(up.total_points, 0) as green_points
        FROM users u
        LEFT JOIN user_points up ON u.id = up.user_id
        WHERE u.role = 'user'
        ORDER BY u.created_at DESC
      `).all();

      const headers = ['ID', 'Name', 'Email', 'Category', 'Institution', 'Institution Type', 'District', 'Registered At', 'Last Login', 'Green Points'];
      csv = headers.join(',') + '\n';
      for (const r of rows) {
        csv += [
          r.id,
          `"${(r.name || '').replace(/"/g, '""')}"`,
          `"${(r.email || '').replace(/"/g, '""')}"`,
          `"${r.category}"`,
          `"${(r.institution_name || '').replace(/"/g, '""')}"`,
          `"${r.institution_type}"`,
          `"${r.district}"`,
          `"${r.created_at}"`,
          `"${r.last_login_at || 'Never'}"`,
          r.green_points
        ].join(',') + '\n';
      }
    } else if (type === 'calculations') {
      const rows = db.prepare(`
        SELECT cc.id, cc.user_id, u.name, u.institution_name, u.district,
               cc.daily_co2_kg, cc.monthly_co2_kg, cc.annual_co2_tonnes,
               cc.electricity_co2_kg, cc.transport_co2_kg, cc.food_co2_kg,
               cc.plastic_co2_kg, cc.waste_co2_kg, cc.lifestyle_co2_kg,
               cc.calculated_at
        FROM carbon_calculations cc
        LEFT JOIN users u ON cc.user_id = u.id
        ORDER BY cc.calculated_at DESC
      `).all();

      const headers = ['ID', 'User ID', 'User Name', 'Institution', 'District', 'Daily CO2 (kg)', 'Monthly CO2 (kg)', 'Annual CO2 (tonnes)', 'Electricity (kg)', 'Transport (kg)', 'Food (kg)', 'Plastic (kg)', 'Waste (kg)', 'Lifestyle (kg)', 'Calculated At'];
      csv = headers.join(',') + '\n';
      for (const r of rows) {
        csv += [
          r.id,
          r.user_id || 'Guest',
          `"${(r.name || 'Anonymous').replace(/"/g, '""')}"`,
          `"${(r.institution_name || '').replace(/"/g, '""')}"`,
          `"${r.district || ''}"`,
          r.daily_co2_kg,
          r.monthly_co2_kg,
          r.annual_co2_tonnes,
          r.electricity_co2_kg,
          r.transport_co2_kg,
          r.food_co2_kg,
          r.plastic_co2_kg,
          r.waste_co2_kg,
          r.lifestyle_co2_kg,
          `"${r.calculated_at}"`
        ].join(',') + '\n';
      }
    } else if (type === 'institutions') {
      const rows = db.prepare(`
        SELECT u.institution_name, u.institution_type, u.district,
               COUNT(DISTINCT u.id) as participants,
               COALESCE(SUM(up.total_points), 0) as total_points,
               COUNT(DISTINCT cc.id) as calculations
        FROM users u
        LEFT JOIN user_points up ON u.id = up.user_id
        LEFT JOIN carbon_calculations cc ON u.id = cc.user_id
        WHERE u.institution_name != ''
        GROUP BY u.institution_name, u.institution_type, u.district
        ORDER BY total_points DESC
      `).all();

      const headers = ['Institution Name', 'Type', 'District', 'Participants', 'Green Points', 'Calculations'];
      csv = headers.join(',') + '\n';
      for (const r of rows) {
        csv += [
          `"${(r.institution_name || '').replace(/"/g, '""')}"`,
          `"${r.institution_type}"`,
          `"${r.district}"`,
          r.participants,
          r.total_points,
          r.calculations
        ].join(',') + '\n';
      }
    }

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="carboncalculator-${type}-${timestamp}.csv"`);
    res.send(csv);
  } catch (error) {
    console.error('CSV export error:', error);
    res.status(500).json({ error: 'Failed to generate CSV export' });
  }
});

// GET /api/admin/export/xlsx
router.get('/export/xlsx', requireAdmin, (req, res) => {
  try {
    const wb = XLSX.utils.book_new();

    // Sheet 1: Users
    const users = db.prepare(`
      SELECT u.id, u.name, u.email, u.category, u.institution_name, u.institution_type, u.district,
             u.created_at, u.last_login_at, COALESCE(up.total_points, 0) as green_points
      FROM users u
      LEFT JOIN user_points up ON u.id = up.user_id
      WHERE u.role = 'user'
      ORDER BY u.created_at DESC
    `).all();
    const wsUsers = XLSX.utils.json_to_sheet(users);
    XLSX.utils.book_append_sheet(wb, wsUsers, 'Users');

    // Sheet 2: Calculations
    const calcs = db.prepare(`
      SELECT cc.id, cc.user_id, u.name, u.institution_name, u.district,
             cc.daily_co2_kg, cc.monthly_co2_kg, cc.annual_co2_tonnes,
             cc.electricity_co2_kg, cc.transport_co2_kg, cc.food_co2_kg,
             cc.plastic_co2_kg, cc.waste_co2_kg, cc.lifestyle_co2_kg,
             cc.calculated_at
      FROM carbon_calculations cc
      LEFT JOIN users u ON cc.user_id = u.id
      ORDER BY cc.calculated_at DESC
    `).all();
    const wsCalcs = XLSX.utils.json_to_sheet(calcs);
    XLSX.utils.book_append_sheet(wb, wsCalcs, 'Calculations');

    // Sheet 3: Institutions
    const institutions = db.prepare(`
      SELECT u.institution_name, u.institution_type, u.district,
             COUNT(DISTINCT u.id) as participants,
             COALESCE(SUM(up.total_points), 0) as total_points,
             COUNT(DISTINCT cc.id) as calculations
      FROM users u
      LEFT JOIN user_points up ON u.id = up.user_id
      LEFT JOIN carbon_calculations cc ON u.id = cc.user_id
      WHERE u.institution_name != ''
      GROUP BY u.institution_name, u.institution_type, u.district
      ORDER BY total_points DESC
    `).all();
    const wsInstitutions = XLSX.utils.json_to_sheet(institutions);
    XLSX.utils.book_append_sheet(wb, wsInstitutions, 'Institutions');

    // Sheet 4: Challenges Engagement
    const challengeStats = db.prepare(`
      SELECT c.id, c.title, c.category, c.difficulty, c.points,
             COUNT(ucc.id) as completions_count
      FROM challenges c
      LEFT JOIN user_challenge_completions ucc ON c.id = ucc.challenge_id
      GROUP BY c.id
      ORDER BY completions_count DESC
    `).all();
    const wsChallenges = XLSX.utils.json_to_sheet(challengeStats);
    XLSX.utils.book_append_sheet(wb, wsChallenges, 'Challenges');

    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="carboncalculator-comprehensive-${timestamp}.xlsx"`);
    res.send(buffer);
  } catch (error) {
    console.error('XLSX export error:', error);
    res.status(500).json({ error: 'Failed to generate XLSX spreadsheet' });
  }
});

// GET /api/admin/export/pdf
router.get('/export/pdf', requireAdmin, (req, res) => {
  try {
    const doc = new jsPDF();
    const timestamp = new Date().toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    // Header & Title
    doc.setFontSize(20);
    doc.setTextColor(15, 56, 35); // Forest green
    doc.text('CarbonCalculator - Sustainability Report', 14, 22);

    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text('VAST Energy Cell | NSS Units 101, 200, 663 | APJAKTU NSS Cell', 14, 28);
    doc.text(`Generated on: ${timestamp}`, 14, 34);

    // Summary Statistics Box
    const totalUsers = db.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'user'").get().count;
    const totalCalculations = db.prepare('SELECT COUNT(*) as count FROM carbon_calculations').get().count;
    const totalChallenges = db.prepare('SELECT COUNT(*) as count FROM user_challenge_completions').get().count;
    const pointsSum = db.prepare('SELECT SUM(total_points) as sum FROM user_points').get();
    const totalPoints = pointsSum ? (pointsSum.sum || 0) : 0;
    const totalInsts = db.prepare("SELECT COUNT(DISTINCT institution_name) as count FROM users WHERE institution_name != ''").get().count;

    doc.setFontSize(12);
    doc.setTextColor(20, 20, 20);
    doc.text('Executive Platform Summary:', 14, 46);

    const summaryData = [
      ['Total Registered Participants', String(totalUsers)],
      ['Participating Educational Institutions', String(totalInsts)],
      ['Total Carbon Calculations Logged', String(totalCalculations)],
      ['Daily Green Challenges Completed', String(totalChallenges)],
      ['Collective Community Green Points', `${totalPoints} Points`]
    ];

    autoTable(doc, {
      startY: 50,
      head: [['Key Performance Metric', 'Platform Total']],
      body: summaryData,
      theme: 'striped',
      headStyles: { fillColor: [15, 56, 35] }
    });

    // Top Institutions Table
    const topInstitutions = db.prepare(`
      SELECT u.institution_name, u.district, COUNT(DISTINCT u.id) as participants,
             COALESCE(SUM(up.total_points), 0) as points
      FROM users u
      LEFT JOIN user_points up ON u.id = up.user_id
      WHERE u.institution_name != ''
      GROUP BY u.institution_name, u.district
      ORDER BY points DESC
      LIMIT 8
    `).all();

    const instRows = topInstitutions.map((i, idx) => [
      String(idx + 1),
      i.institution_name,
      i.district,
      String(i.participants),
      String(i.points)
    ]);

    const finalY1 = doc.lastAutoTable ? doc.lastAutoTable.finalY : 120;
    doc.text('Institutional Engagement Leaderboard:', 14, finalY1 + 12);

    autoTable(doc, {
      startY: finalY1 + 16,
      head: [['#', 'Institution Name', 'District', 'Students', 'Green Points']],
      body: instRows.length > 0 ? instRows : [['-', 'No institution records registered yet', '-', '-', '-']],
      theme: 'grid',
      headStyles: { fillColor: [16, 185, 129] }
    });

    const pdfBuffer = doc.output('arraybuffer');
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="carboncalculator-official-report-${new Date().toISOString().split('T')[0]}.pdf"`);
    res.send(Buffer.from(pdfBuffer));
  } catch (error) {
    console.error('PDF export error:', error);
    res.status(500).json({ error: 'Failed to generate PDF report' });
  }
});

export default router;
