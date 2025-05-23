
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const validator = require('validator');  // Import validator package
const hpp = require('hpp');
const rateLimit = require('express-rate-limit');
const path = require('path');

// Import routes
const authRoutes = require('./routes/authRoutes');
const gameRoutes = require('./routes/gameRoutes');
const walletRoutes = require('./routes/walletRoutes');

// Import middleware
const errorHandler = require('./middleware/error');
const logger = require('./utils/logger');

// Initialize Express
const app = express();

// Database connection
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);  // Using the local database URI from .env
    logger.info(`MongoDB Connected: ${conn.connection.host}`);
  } catch (err) {
    logger.error(`MongoDB Connection Error: ${err.message}`);
    process.exit(1);
  }
};
connectDB();

// Middleware

// 1) Body parsing middleware (must come before input sanitization)
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));



// Add this after the middleware section
app.use(express.static(path.join(__dirname, 'public')));


app.set('trust proxy', 1);



// Add this after the middleware section
app.use(express.static(path.join(__dirname, 'public')));

app.set('trust proxy', 1);


// 2) Security middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
}));
app.use(helmet());
app.use(hpp());

// 3) Custom input sanitization using validator (no xss-clean)
app.use((req, res, next) => {
  // Sanitize body fields
  if (req.body) {
    for (const key in req.body) {
      if (typeof req.body[key] === 'string') {
        req.body[key] = validator.escape(req.body[key]);  // Escape special characters
      }
    }
  }

  // Sanitize query parameters (if needed)
  if (req.query) {
    for (const key in req.query) {
      if (typeof req.query[key] === 'string') {
        req.query[key] = validator.escape(req.query[key]);  // Escape special characters
      }
    }
  }

  // Sanitize params (if needed)
  if (req.params) {
    for (const key in req.params) {
      if (typeof req.params[key] === 'string') {
        req.params[key] = validator.escape(req.params[key]);  // Escape special characters
      }
    }
  }

  next();
});

// 4) Rate limiting
const limiter = rateLimit({
  windowMs: process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000,  //15 minets
  max: process.env.RATE_LIMIT_MAX || 100,   // max 100 requests per IP
  message: "Too many requests from this IP, please try again after 15 minutes."
});
app.use(limiter);

// 5) Logging (only in development mode)
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/game', gameRoutes);
app.use('/api/v1/wallet', walletRoutes);

// Error handling middleware
app.use(errorHandler);

// Server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  logger.info(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  logger.error(`Error: ${err.message}`);
  server.close(() => process.exit(1));
});

module.exports = app;
