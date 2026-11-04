import express from 'express';
import db from '../db.js';

const router = express.Router();

// POST /api/contact
router.post('/', (req, res) => {
  try {
    const { name, email, category = 'General', message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Name, email, and message are required' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Valid email address is required' });
    }

    const result = db.prepare(`
      INSERT INTO enquiries (name, email, category, message, status)
      VALUES (?, ?, ?, ?, 'new')
    `).run(name.trim(), email.toLowerCase().trim(), category, message.trim());

    res.status(201).json({
      message: 'Thank you for reaching out! Your message has been received by the VAST Energy Cell coordinators.',
      id: result.lastInsertRowid
    });
  } catch (error) {
    console.error('Contact submission error:', error);
    res.status(500).json({ error: 'Failed to submit enquiry' });
  }
});

export default router;
