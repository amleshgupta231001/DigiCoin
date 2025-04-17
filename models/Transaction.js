


const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Transaction must belong to a user']
  },
  amount: {
    type: Number,
    required: [true, 'Transaction must have an amount'],
    min: [0, 'Amount cannot be negative']
  },
  type: {
    type: String,
    enum: ['credit', 'debit'],
    required: [true, 'Transaction must have a type']
  },
  description: {
    type: String,
    required: [true, 'Transaction must have a description'],
    trim: true
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'cancelled'],
    default: 'completed'
  },
  reference: {
    type: String,
    unique: true  // This already creates a unique index
  },
  metadata: {
    type: Object
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Generate reference before saving
transactionSchema.pre('save', function(next) {
  if (!this.reference) {
    this.reference = `TXN${Date.now()}${Math.floor(Math.random() * 1000)}`;
  }
  next();
});

// Indexes for faster queries
transactionSchema.index({ user: 1 });
transactionSchema.index({ createdAt: -1 });
// Removed the duplicate reference index declaration

module.exports = mongoose.model('Transaction', transactionSchema);
