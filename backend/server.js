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
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth');
const contentRoutes = require('./routes/content');
const brandRoutes = require('./routes/brand');

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' })); // Allow larger payloads for content

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected successfully'))
  .catch(err => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/brand', brandRoutes);

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
