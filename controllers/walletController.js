




//////////------------------------


const Wallet = require('../models/Wallet');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const AppError = require('../utils/error');
const logger = require('../utils/logger');
const cashfree = require('../config/cashfree');

// Get wallet balance
exports.getWallet = async (req, res, next) => {
  try {
    const wallet = await Wallet.findOne({ user: req.user.id });
    
    if (!wallet) {
      return next(new AppError('Wallet not found', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        wallet
      }
    });
  } catch (err) {
    logger.error(`Get wallet error: ${err.message}`);
    next(err);
  }
};

// Withdraw funds
exports.withdrawFunds = async (req, res, next) => {
  try {
    const { amount, bankAccount } = req.body;
    const user = req.user;

    // Validate amount (minimum ₹10 which is 1000 coins)
    if (amount < 10) {
      return next(new AppError('Minimum withdrawal amount is ₹10', 400));
    }

    // Convert rupees to coins (100 coins = 1 rupee)
    const coinsAmount = amount * 100;

    // Get wallet
    const wallet = await Wallet.findOne({ user: user._id });
    if (!wallet) {
      return next(new AppError('Wallet not found', 404));
    }

    // Check balance
    if (wallet.balance < coinsAmount) {
      return next(new AppError('Insufficient balance', 400));
    }

    // Initiate withdrawal (deduct from balance)
    await wallet.initiateWithdrawal(coinsAmount);

    // Process payment via Cashfree
    try {
      const payoutResponse = await cashfree.payouts.requestTransfer({
        beneId: bankAccount.beneficiaryId, // Should be saved during bank account addition
        amount: amount.toString(),
        transferId: `WD${Date.now()}`,
        transferMode: 'banktransfer',
        remarks: `Withdrawal for ${user.email}`
      });

      if (payoutResponse.status === 'SUCCESS') {
        // Complete withdrawal
        await wallet.completeWithdrawal(coinsAmount);

        // Create transaction record
        await Transaction.create({
          user: user._id,
          amount: coinsAmount,
          type: 'debit',
          description: `Withdrawal of ₹${amount}`,
          status: 'completed',
          reference: payoutResponse.referenceId,
          metadata: {
            payoutDetails: payoutResponse
          }
        });

        return res.status(200).json({
          status: 'success',
          message: 'Withdrawal processed successfully',
          data: {
            payoutReference: payoutResponse.referenceId
          }
        });
      } else {
        // Revert withdrawal if payout fails
        await Wallet.findOneAndUpdate(
          { user: user._id },
          { 
            $inc: { 
              balance: coinsAmount,
              pendingWithdrawals: -coinsAmount 
            } 
          }
        );

        // Create failed transaction record
        await Transaction.create({
          user: user._id,
          amount: coinsAmount,
          type: 'debit',
          description: `Failed withdrawal of ₹${amount}`,
          status: 'failed',
          metadata: {
            payoutResponse
          }
        });

        return next(new AppError('Withdrawal failed. Please try again.', 400));
      }
    } catch (err) {
      // Revert withdrawal if payout fails
      await Wallet.findOneAndUpdate(
        { user: user._id },
        { 
          $inc: { 
            balance: coinsAmount,
            pendingWithdrawals: -coinsAmount 
          } 
        }
      );

      // Create failed transaction record
      await Transaction.create({
        user: user._id,
        amount: coinsAmount,
        type: 'debit',
        description: `Failed withdrawal of ₹${amount}`,
        status: 'failed',
        metadata: {
          error: err.message
        }
      });

      logger.error(`Cashfree payout error: ${err.message}`);
      return next(new AppError('Withdrawal processing failed. Please try again later.', 500));
    }

  } catch (err) {
    logger.error(`Withdraw funds error: ${err.message}`);
    next(err);
  }
};

// Get transaction history
exports.getTransactions = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const transactions = await Transaction.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Transaction.countDocuments({ user: req.user.id });

    res.status(200).json({
      status: 'success',
      results: transactions.length,
      total,
      data: {
        transactions
      }
    });
  } catch (err) {
    logger.error(`Get transactions error: ${err.message}`);
    next(err);
  }
};