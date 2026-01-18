require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');
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

// Ensure uploads directories exist
const uploadsDir = path.join(__dirname, '../uploads');
const restaurantsDir = path.join(uploadsDir, 'restaurants');
if (!require('fs').existsSync(uploadsDir)) {
  require('fs').mkdirSync(uploadsDir, { recursive: true });
}
if (!require('fs').existsSync(restaurantsDir)) {
  require('fs').mkdirSync(restaurantsDir, { recursive: true });
}

// Serve uploaded images statically
// Images accessible at: http://localhost:4000/uploads/filename.jpg
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

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
const startServer = async () => {
  try {
    // Connect to MongoDB first
    await connectDB();
    
    // Start Express server after successful DB connection
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
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1); // Exit with failure code
  }
};

// Start the server
startServer();

module.exports = app;
