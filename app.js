const express = require('express');
const mongoose = require('mongoose');
// const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const gameRoutes = require('./routes/gameRoutes');
const { notFound, errorHandler } = require('./middleware/error');

dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middleware
// app.use(cors());

const cors = require('cors');

// Add this before your routes
app.use(cors({
  origin: ['http://localhost:19006', 'http://10.0.2.2:19006'],
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/game', gameRoutes);

// Error handling
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 3000; 

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});