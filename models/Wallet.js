
// //------------Wallet models
// const mongoose = require('mongoose');

// const walletSchema = new mongoose.Schema({
//   user: {
//     type: mongoose.Schema.ObjectId,
//     ref: 'User',
//     required: [true, 'Wallet must belong to a user'],
//     unique: true
//   },
//   balance: {
//     type: Number,
//     default: 0,
//     min: [0, 'Balance cannot be negative']
//   },
//   totalEarned: {
//     type: Number,
//     default: 0
//   },
//   totalWithdrawn: {
//     type: Number,
//     default: 0
//   },
//   pendingWithdrawals: {
//     type: Number,
//     default: 0
//   },
//   lastTransaction: {
//     type: Date
//   },
//   createdAt: {
//     type: Date,
//     default: Date.now
//   },
//   updatedAt: {
//     type: Date,
//     default: Date.now
//   }
// });

// // Update timestamp on update
// walletSchema.pre('findOneAndUpdate', function(next) {
//   this.set({ updatedAt: new Date() });
//   next();
// });

// // Create wallet for new user
// walletSchema.statics.createWallet = async function(userId) {
//   const wallet = await this.create({ user: userId });
//   return wallet;
// };

// // Add funds to wallet
// walletSchema.methods.addFunds = async function(amount, description) {
//   this.balance += amount;
//   this.totalEarned += amount;
//   this.lastTransaction = new Date();
//   await this.save();
  
//   // Create transaction record
//   await mongoose.model('Transaction').create({
//     user: this.user,
//     amount,
//     type: 'credit',
//     description,
//     status: 'completed'
//   });
  
//   return this;
// };

// // Deduct funds from wallet
// walletSchema.methods.deductFunds = async function(amount, description) {
//   if (this.balance < amount) {
//     throw new Error('Insufficient balance');
//   }
  
//   this.balance -= amount;
//   this.lastTransaction = new Date();
//   await this.save();
  
//   // Create transaction record
//   await mongoose.model('Transaction').create({
//     user: this.user,
//     amount,
//     type: 'debit',
//     description,
//     status: 'completed'
//   });
  
//   return this;
// };

// // Initiate withdrawal
// walletSchema.methods.initiateWithdrawal = async function(amount) {
//   if (this.balance < amount) {
//     throw new Error('Insufficient balance');
//   }
  
//   this.balance -= amount;
//   this.pendingWithdrawals += amount;
//   this.lastTransaction = new Date();
//   await this.save();
  
//   return this;
// };

// // Complete withdrawal
// walletSchema.methods.completeWithdrawal = async function(amount) {
//   this.pendingWithdrawals -= amount;
//   this.totalWithdrawn += amount;
//   await this.save();
  
//   return this;
// };

// module.exports = mongoose.model('Wallet', walletSchema);







// new changes code starts
const mongoose = require('mongoose');

const walletSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Wallet must belong to a user'],
    unique: true
  },
  balance: {
    type: Number, // Coin balance (100 coins = 1 rupee)
    default: 0,
    min: [0, 'Balance cannot be negative']
  },
  realMoneyBalance: { // New field for rupees
    type: Number,
    default: 0,
    min: [0, 'Balance cannot be negative']
  },
  totalEarned: {
    type: Number, // Total coins earned
    default: 0
  },
  totalWithdrawn: {
    type: Number, // Total rupees withdrawn
    default: 0
  },
  pendingWithdrawals: {
    type: Number, // Rupees pending withdrawal
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

// Add funds to wallet (in coins)
walletSchema.methods.addFunds = async function(amount, description, isRealMoney = false) {
  if (isRealMoney) {
    this.realMoneyBalance += amount;
  } else {
    this.balance += amount;
    this.totalEarned += amount;
    
    // Convert coins to rupees when reaching 100 coins
    if (this.balance >= 100) {
      const rupeesToAdd = Math.floor(this.balance / 100);
      this.realMoneyBalance += rupeesToAdd;
      this.balance -= rupeesToAdd * 100;
      
      // Create transaction record for rupee conversion
      await mongoose.model('Transaction').create({
        user: this.user,
        amount: rupeesToAdd,
        type: 'credit',
        description: `Coin conversion (${rupeesToAdd * 100} coins to ${rupeesToAdd} rupees)`,
        currency: 'INR',
        status: 'completed'
      });
    }
  }
  
  this.lastTransaction = new Date();
  await this.save();
  
  // Create transaction record
  await mongoose.model('Transaction').create({
    user: this.user,
    amount,
    type: 'credit',
    description,
    currency: isRealMoney ? 'INR' : 'COIN',
    status: 'completed'
  });
  
  return this;
};

// Deduct funds from wallet
walletSchema.methods.deductFunds = async function(amount, description, isRealMoney = false) {
  if (isRealMoney) {
    if (this.realMoneyBalance < amount) {
      throw new Error('Insufficient balance');
    }
    this.realMoneyBalance -= amount;
  } else {
    if (this.balance < amount) {
      throw new Error('Insufficient balance');
    }
    this.balance -= amount;
  }
  
  this.lastTransaction = new Date();
  await this.save();
  
  // Create transaction record
  await mongoose.model('Transaction').create({
    user: this.user,
    amount,
    type: 'debit',
    description,
    currency: isRealMoney ? 'INR' : 'COIN',
    status: 'completed'
  });
  
  return this;
};

// Initiate withdrawal (in rupees)
walletSchema.methods.initiateWithdrawal = async function(amount) {
  if (this.realMoneyBalance < amount) {
    throw new Error('Insufficient balance');
  }
  
  this.realMoneyBalance -= amount;
  this.pendingWithdrawals += amount;
  this.lastTransaction = new Date();
  await this.save();
  
  return this;
};

// Complete withdrawal (in rupees)
walletSchema.methods.completeWithdrawal = async function(amount) {
  this.pendingWithdrawals -= amount;
  this.totalWithdrawn += amount;
  await this.save();
  
  return this;
};

module.exports = mongoose.model('Wallet', walletSchema);