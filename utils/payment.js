const axios = require('axios');
const cashfreeConfig = require('../config/cashfree');

const initiateWithdrawal = async (user, amount) => {
  try {
    const response = await axios.post(`${cashfreeConfig.apiUrl}/orders`, {
      orderId: `WD_${Date.now()}`,
      orderAmount: amount,
      orderCurrency: 'INR',
      customerDetails: {
        customerId: user._id.toString(),
        customerEmail: user.email,
        customerPhone: user.mobile,
      },
      orderNote: 'Withdrawal from DigiCoin',
    }, {
      headers: {
        'x-client-id': cashfreeConfig.appId,
        'x-client-secret': cashfreeConfig.secretKey,
        'x-api-version': '2022-01-01',
      },
    });

    return response.data;
  } catch (error) {
    console.error('Withdrawal error:', error.response?.data || error.message);
    throw new Error('Withdrawal failed');
  }
};

module.exports = { initiateWithdrawal };