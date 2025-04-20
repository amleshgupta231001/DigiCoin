

// ///------------

// const mongoose = require('mongoose');

// const gameSchema = new mongoose.Schema({
//   user: {
//     type: mongoose.Schema.ObjectId,
//     ref: 'User',
//     required: [true, 'Game session must belong to a user']
//   },
//   captcha: {
//     type: String,
//     required: [true, 'Game session must have a captcha']
//   },
//   userInput: {
//     type: String
//   },
//   isCompleted: {
//     type: Boolean,
//     default: false
//   },
//   isCorrect: {
//     type: Boolean
//   },
//   reward: {
//     type: Number,
//     default: 0
//   },
//   attempts: {
//     type: Number,
//     default: 1
//   },
//   createdAt: {
//     type: Date,
//     default: Date.now
//   },
//   completedAt: {
//     type: Date
//   }
// });

// // Calculate completion time
// gameSchema.pre('save', function(next) {
//   if (this.isModified('isCompleted') && this.isCompleted) {
//     this.completedAt = new Date();
//   }
//   next();
// });

// // Indexes for faster queries
// gameSchema.index({ user: 1 });
// gameSchema.index({ isCompleted: 1 });
// gameSchema.index({ createdAt: -1 });

// module.exports = mongoose.model('Game', gameSchema);





///////working with timer 7 second 
//game models
const mongoose = require('mongoose');

const gameSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Game session must belong to a user']
  },
  captcha: {
    type: String,
    required: [true, 'Game session must have a captcha']
  },
  userInput: {
    type: String
  },
  isCompleted: {
    type: Boolean,
    default: false
  },
  isCorrect: {
    type: Boolean,
    default: false
  },
  reward: {
    type: Number,
    default: 0
  },
  attempts: {
    type: Number,
    default: 1
  },
  createdAt: {  
    type: Date,
    default: Date.now
  },
  completedAt: {
    type: Date
  },
  startTime: {
    type: Date // Captcha game start time
  },
  endTime: {
    type: Date // Captcha game end time
  },
  timeLimit: {
    type: Number,
    default: 7 // 7 seconds time limit for solving the captcha
  }
});

// Calculate completion time (when game is marked as completed)
gameSchema.pre('save', function(next) {
  if (this.isModified('isCompleted') && this.isCompleted) {
    this.completedAt = new Date();
  }
  next();
});

// Indexes for faster queries
gameSchema.index({ user: 1 });
gameSchema.index({ isCompleted: 1 });
gameSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Game', gameSchema);
