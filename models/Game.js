// const mongoose = require('mongoose');

// const GameSchema = new mongoose.Schema({
//   player1: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User',
//     required: true,
//   },
//   player2: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User',
//   },
//   status: {
//     type: String,
//     enum: ['waiting', 'active', 'completed', 'cancelled'],
//     default: 'waiting',
//   },
//   captchaDifficulty: {
//     type: String,
//     enum: ['easy', 'medium', 'hard'],
//     default: 'easy',
//   },
//   captchas: [
//     {
//       value: String,
//       answeredBy: mongoose.Schema.Types.ObjectId,
//       isCorrect: Boolean,
//       timestamp: Date,
//     },
//   ],
//   startTime: Date,
//   endTime: Date,
//   winner: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User',
//   },
//   createdAt: {
//     type: Date,
//     default: Date.now,
//   },
// });

// module.exports = mongoose.model('Game', GameSchema);









const mongoose = require('mongoose');

const GameSchema = new mongoose.Schema({
  player1: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  player2: {
    type: mongoose.Schema.Types.Mixed, // Changed to Mixed to allow both ObjectId and string
    ref: 'User',
  },
  isBotGame: {
    type: Boolean,
    default: false,
  },
  botDifficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
  },
  status: {
    type: String,
    enum: ['waiting', 'active', 'completed', 'cancelled'],
    default: 'waiting',
  },
  captchaDifficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'easy',
  },
  captchas: [
    {
      value: String,
      answeredBy: mongoose.Schema.Types.Mixed, // Changed to Mixed
      answer: String,
      isCorrect: Boolean,
      responseTime: Number,
      timestamp: Date,
    },
  ],
  player1Score: {
    type: Number,
    default: 0,
  },
  player2Score: {
    type: Number,
    default: 0,
  },
  startTime: Date,
  endTime: Date,
  winner: {
    type: mongoose.Schema.Types.Mixed, // Changed to Mixed
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Game', GameSchema);