const mongoose = require('mongoose');

/**
 * Connect to MongoDB using Mongoose
 * 
 * @returns {Promise<void>}
 * @throws {Error} If MONGODB_URI is not defined or connection fails
 */
const connectDB = async () => {
  try {
    // Validate environment variable
    const mongoURI = process.env.MONGODB_URI;
    
    if (!mongoURI) {
      throw new Error(
        'MONGODB_URI is not defined in environment variables. ' +
        'Please check your .env file.'
      );
    }

    // Connect to MongoDB
    await mongoose.connect(mongoURI);

    console.log('✅ MongoDB connected successfully');
    console.log(`📦 Database: ${mongoose.connection.name}`);
    
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    throw error; // Re-throw to be handled by caller
  }
};

// Handle connection events
mongoose.connection.on('disconnected', () => {
  console.warn('⚠️  MongoDB disconnected');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB error:', err.message);
});

module.exports = connectDB;
