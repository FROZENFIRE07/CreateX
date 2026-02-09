/**
 * SACO Backend Server
 * Systemic AI Content Orchestrator - Main Entry Point
 * 
 * This server implements the "Systemic AI" approach:
 * - Multi-agent orchestration for content transformation
 * - COPE (Create Once, Publish Everywhere) pipeline
 * - Vector DB integration for semantic memory (RAG)
 */

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth');
const contentRoutes = require('./routes/content');
const brandRoutes = require('./routes/brand');
const managerRoutes = require('./routes/manager');

const app = express();

// CORS configuration - must be before routes
app.use(cors({
  origin: ['http://localhost:3000', 'https://create-x-6mvj.vercel.app'],
  credentials: true
}));

// Middleware
app.use(express.json({ limit: '10mb' })); // Allow larger payloads for content

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected successfully'))
  .catch(err => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });

// Serve static files for uploaded images (with CORS headers already applied)
// Note: uploads folder is at project root, so we need to go up one level from backend/
app.use('/api/images', express.static(path.join(__dirname, '../uploads/images')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/brand', brandRoutes);
app.use('/api/manager', managerRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'SACO Backend'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`
🚀 SACO Backend running on port ${PORT}
📊 API Health: http://localhost:${PORT}/api/health
🎯 Mode: ${process.env.NODE_ENV || 'development'}
  `);
});
