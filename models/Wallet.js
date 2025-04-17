
//------------
const mongoose = require('mongoose');

const walletSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Wallet must belong to a user'],
    unique: true
  },
  balance: {
    type: Number,
    default: 0,
    min: [0, 'Balance cannot be negative']
  },
  totalEarned: {
    type: Number,
    default: 0
  },
  totalWithdrawn: {
    type: Number,
    default: 0
  },
  pendingWithdrawals: {
    type: Number,
    default: 0
  },
  lastTransaction: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update timestamp on update
walletSchema.pre('findOneAndUpdate', function(next) {
  this.set({ updatedAt: new Date() });
  next();
});

// Create wallet for new user
walletSchema.statics.createWallet = async function(userId) {
  const wallet = await this.create({ user: userId });
  return wallet;
};

// Add funds to wallet
walletSchema.methods.addFunds = async function(amount, description) {
  this.balance += amount;
  this.totalEarned += amount;
  this.lastTransaction = new Date();
  await this.save();
  
  // Create transaction record
  await mongoose.model('Transaction').create({
    user: this.user,
    amount,
    type: 'credit',
    description,
    status: 'completed'
  });
  
  return this;
};

// Deduct funds from wallet
walletSchema.methods.deductFunds = async function(amount, description) {
  if (this.balance < amount) {
    throw new Error('Insufficient balance');
  }
  
  this.balance -= amount;
  this.lastTransaction = new Date();
  await this.save();
  
  // Create transaction record
  await mongoose.model('Transaction').create({
    user: this.user,
    amount,
    type: 'debit',
    description,
    status: 'completed'
  });
  
  return this;
};

// Initiate withdrawal
walletSchema.methods.initiateWithdrawal = async function(amount) {
  if (this.balance < amount) {
    throw new Error('Insufficient balance');
  }
  
  this.balance -= amount;
  this.pendingWithdrawals += amount;
  this.lastTransaction = new Date();
  await this.save();
  
  return this;
};

// Complete withdrawal
walletSchema.methods.completeWithdrawal = async function(amount) {
  this.pendingWithdrawals -= amount;
  this.totalWithdrawn += amount;
  await this.save();
  
  return this;
};

module.exports = mongoose.model('Wallet', walletSchema);