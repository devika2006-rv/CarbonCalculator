import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../db.js';
import { JWT_SECRET, authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Helper to sanitize user object
function sanitizeUser(user) {
  const { password_hash, ...safeUser } = user;
  return safeUser;
}

// POST /api/auth/register
router.post('/register', (req, res) => {
  try {
    const {
      name,
      email,
      password,
      category = 'Student',
      institution_name = '',
      institution_type = 'College',
      district = 'Thrissur'
    } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Full name, email, and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Please provide a valid email address' });
    }

    // Check duplicate
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase().trim());
    if (existing) {
      return res.status(409).json({ error: 'An account with this email address already exists. Please login instead.' });
    }

    const salt = bcrypt.genSaltSync(10);
    const password_hash = bcrypt.hashSync(password, salt);

    const result = db.prepare(`
      INSERT INTO users (name, email, password_hash, role, category, institution_name, institution_type, district, last_login_at, login_count)
      VALUES (?, ?, ?, 'user', ?, ?, ?, ?, CURRENT_TIMESTAMP, 1)
    `).run(
      name.trim(),
      email.toLowerCase().trim(),
      password_hash,
      category,
      institution_name.trim(),
      institution_type,
      district.trim()
    );

    const newUserId = result.lastInsertRowid;

    // Log the registration login event
    try {
      db.prepare(`
        INSERT INTO user_login_logs (user_id, email, name, auth_method, ip_address, user_agent)
        VALUES (?, ?, ?, 'register', ?, ?)
      `).run(newUserId, email.toLowerCase().trim(), name.trim(), req.ip || '', req.headers['user-agent'] || '');
    } catch {}

    // Initialize user points record
    db.prepare('INSERT OR IGNORE INTO user_points (user_id, total_points) VALUES (?, 0)').run(newUserId);

    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(newUserId);
    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name, role: user.role },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.status(201).json({
      message: 'Account created successfully',
      token,
      user: sanitizeUser(user)
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error during registration' });
  }
});

// POST /api/auth/login
router.post('/login', (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase().trim());
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isMatch = bcrypt.compareSync(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Update last login and increment count
    db.prepare('UPDATE users SET last_login_at = CURRENT_TIMESTAMP, login_count = COALESCE(login_count, 0) + 1 WHERE id = ?').run(user.id);

    // Record login audit event
    try {
      db.prepare(`
        INSERT INTO user_login_logs (user_id, email, name, auth_method, ip_address, user_agent)
        VALUES (?, ?, ?, 'email', ?, ?)
      `).run(user.id, user.email, user.name, req.ip || '', req.headers['user-agent'] || '');
    } catch {}

    // Fetch updated user with fresh last_login_at
    const updatedUser = db.prepare('SELECT * FROM users WHERE id = ?').get(user.id);

    const token = jwt.sign(
      { id: updatedUser.id, email: updatedUser.email, name: updatedUser.name, role: updatedUser.role },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.json({
      message: 'Logged in successfully',
      token,
      user: sanitizeUser(updatedUser)
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error during login' });
  }
});

// POST /api/auth/google
router.post('/google', (req, res) => {
  try {
    const { email, name, category, institution_name, institution_type, district } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Google email is required' });
    }

    let user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase().trim());

    if (!user) {
      // Create new user with Google identity
      const dummyPassword = bcrypt.hashSync(Math.random().toString(36) + 'GoogleAuth@2026', 10);
      const result = db.prepare(`
        INSERT INTO users (name, email, password_hash, role, category, institution_name, institution_type, district, last_login_at, login_count)
        VALUES (?, ?, ?, 'user', ?, ?, ?, ?, CURRENT_TIMESTAMP, 1)
      `).run(
        name || 'Google User',
        email.toLowerCase().trim(),
        dummyPassword,
        category || 'Student',
        institution_name || '',
        institution_type || 'College',
        district || 'Thrissur'
      );
      user = db.prepare('SELECT * FROM users WHERE id = ?').get(result.lastInsertRowid);
      db.prepare('INSERT OR IGNORE INTO user_points (user_id, total_points) VALUES (?, 0)').run(user.id);
    } else {
      db.prepare('UPDATE users SET last_login_at = CURRENT_TIMESTAMP, login_count = COALESCE(login_count, 0) + 1 WHERE id = ?').run(user.id);
      user = db.prepare('SELECT * FROM users WHERE id = ?').get(user.id);
    }

    // Record login audit event
    try {
      db.prepare(`
        INSERT INTO user_login_logs (user_id, email, name, auth_method, ip_address, user_agent)
        VALUES (?, ?, ?, 'google', ?, ?)
      `).run(user.id, user.email, user.name, req.ip || '', req.headers['user-agent'] || '');
    } catch {}

    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name, role: user.role },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.json({
      message: 'Authenticated with Google successfully',
      token,
      user: sanitizeUser(user),
      needsProfileCompletion: !user.institution_name
    });
  } catch (error) {
    console.error('Google auth error:', error);
    res.status(500).json({ error: 'Internal server error during Google sign in' });
  }
});

// GET /api/auth/me
router.get('/me', authenticateToken, (req, res) => {
  try {
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Fetch points & stats
    const pointsRecord = db.prepare('SELECT total_points FROM user_points WHERE user_id = ?').get(user.id);
    const totalPoints = pointsRecord ? pointsRecord.total_points : 0;

    const calcCount = db.prepare('SELECT COUNT(*) as count FROM carbon_calculations WHERE user_id = ?').get(user.id).count;
    const challengeCount = db.prepare('SELECT COUNT(*) as count FROM user_challenge_completions WHERE user_id = ?').get(user.id).count;
    const badges = db.prepare('SELECT * FROM user_badges WHERE user_id = ? ORDER BY awarded_at DESC').all(user.id);

    // Latest calculation
    const latestCalc = db.prepare(`
      SELECT * FROM carbon_calculations WHERE user_id = ? ORDER BY calculated_at DESC LIMIT 1
    `).get(user.id);

    res.json({
      user: sanitizeUser(user),
      stats: {
        totalPoints,
        calcCount,
        challengeCount,
        badgesCount: badges.length,
        badges,
        latestCalc: latestCalc ? {
          ...latestCalc,
          inputs: JSON.parse(latestCalc.inputs_json || '{}')
        } : null
      }
    });
  } catch (error) {
    console.error('Fetch me error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/auth/profile
router.put('/profile', authenticateToken, (req, res) => {
  try {
    const { name, category, institution_name, institution_type, district } = req.body;

    db.prepare(`
      UPDATE users
      SET name = COALESCE(?, name),
          category = COALESCE(?, category),
          institution_name = COALESCE(?, institution_name),
          institution_type = COALESCE(?, institution_type),
          district = COALESCE(?, district)
      WHERE id = ?
    `).run(name, category, institution_name, institution_type, district, req.user.id);

    const updatedUser = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
    res.json({
      message: 'Profile updated successfully',
      user: sanitizeUser(updatedUser)
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Internal server error updating profile' });
  }
});

// PUT /api/auth/change-password
router.put('/change-password', authenticateToken, (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current password and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters' });
    }

    const user = db.prepare('SELECT password_hash FROM users WHERE id = ?').get(req.user.id);
    const isMatch = bcrypt.compareSync(currentPassword, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Current password does not match' });
    }

    const salt = bcrypt.genSaltSync(10);
    const newHash = bcrypt.hashSync(newPassword, salt);

    db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(newHash, req.user.id);

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Internal server error changing password' });
  }
});

export default router;
