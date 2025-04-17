

const { Payouts } = require('cashfree-pg-sdk-nodejs');
const logger = require('../utils/logger');

// Verify Beneficiary
exports.verifyBeneficiary = async (beneficiaryDetails) => {
  try {
    const response = await Payouts.Beneficiary.Verify(beneficiaryDetails);
    return {
      success: response.status === 'SUCCESS',
      data: response,
    };
  } catch (err) {
    logger.error(`Cashfree beneficiary verification error: ${err.message}`);
    return {
      success: false,
      error: err.message,
    };
  }
};

// Process Payout
exports.processPayout = async (payoutDetails) => {
  try {
    const response = await Payouts.Transfer.Request(payoutDetails);
    return {
      success: response.status === 'SUCCESS',
      data: response,
    };
  } catch (err) {
    logger.error(`Cashfree payout error: ${err.message}`);
    return {
      success: false,
      error: err.message,
    };
  }
};

// Get Payout Status
exports.getPayoutStatus = async (transferId) => {
  try {
    const response = await Payouts.Transfer.Status(transferId);
    return {
      success: response.status === 'SUCCESS',
      data: response,
    };
  } catch (err) {
    logger.error(`Cashfree payout status error: ${err.message}`);
    return {
      success: false,
      error: err.message,
    };
  }
};
