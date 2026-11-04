import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { initDatabase } from './db.js';
import authRouter from './routes/auth.js';
import calculatorRouter from './routes/calculator.js';
import challengesRouter from './routes/challenges.js';
import communityRouter from './routes/community.js';
import contactRouter from './routes/contact.js';
import adminRouter from './routes/admin.js';

dotenv.config();

// Initialize database schema, indexes, official emission factors, and default admin
initDatabase();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for frontend clients
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// API Routes
app.use('/api/auth', authRouter);
app.use('/api/calculator', calculatorRouter);
app.use('/api/challenges', challengesRouter);
app.use('/api/community', communityRouter);
app.use('/api/contact', contactRouter);
app.use('/api/admin', adminRouter);

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    platform: 'CarbonCalculator - VAST Energy Cell',
    timestamp: new Date().toISOString()
  });
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const clientDistPath = path.resolve(__dirname, '../client/dist');

// Serve built frontend assets in production / single-service deployments
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  app.use((req, res, next) => {
    if (req.method === 'GET' && !req.path.startsWith('/api')) {
      return res.sendFile(path.join(clientDistPath, 'index.html'));
    }
    next();
  });
}

// Centralized error handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({ error: 'An unexpected internal server error occurred' });
});

app.listen(PORT, () => {
  console.log(`CarbonCalculator backend server running on http://localhost:${PORT}`);
});

export default app;
