require('dotenv').config();
const express = require('express');
const cors = require('cors');
const apiRoutes = require('./routes/index');
const { errorHandler, notFoundHandler } = require('./middlewares/error.middleware');

const app = express();
const PORT = process.env.PORT || 4000;

// ===========================
// Middleware Configuration
// ===========================

// Enable CORS (Cross-Origin Resource Sharing)
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
  credentials: true
}));

// Parse JSON request bodies
app.use(express.json());

// Parse URL-encoded request bodies
app.use(express.urlencoded({ extended: true }));

// Request logging (simple console log for development)
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// ===========================
// API Routes
// ===========================

// Mount all API routes under /api
app.use('/api', apiRoutes);

// Root endpoint (informational)
app.get('/', (req, res) => {
  res.json({
    message: 'Healthy Meal Platform API',
    version: '1.0.0',
    documentation: '/api/health'
  });
});

// ===========================
// Error Handling
// ===========================

// 404 Handler (must be after all routes)
app.use(notFoundHandler);

// Global error handler (must be last)
app.use(errorHandler);

// ===========================
// Start Server
// ===========================

app.listen(PORT, () => {
  console.log('');
  console.log('🚀 Healthy Meal Platform - Backend API');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`📡 Server running on port: ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`✅ Health check: http://localhost:${PORT}/api/health`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('');
});

module.exports = app;
