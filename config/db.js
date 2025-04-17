

const mongoose = require('mongoose');
const logger = require('../utils/logger');



const connectDB = async () => {
  try {
    const conn = await mongoose.connect(
      process.env.MONGODB_URI, // Local MongoDB connection from .env
      {
        useNewUrlParser: true,
        useUnifiedTopology: true
      }
    );
    logger.info(`MongoDB Connected: ${conn.connection.host}`);
  } catch (err) {
    logger.error(`MongoDB Connection Error: ${err.message}`);
    process.exit(1);
  }
};


// Close DB connection gracefully
const closeDB = async () => {
  try {
    await mongoose.connection.close();
    logger.info('MongoDB connection closed');
  } catch (err) {
    logger.error('Error closing MongoDB connection:', err);
  }
};

module.exports = { connectDB, closeDB };
