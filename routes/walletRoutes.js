

///////-----------------walletRoutes


const express = require('express');
const walletController = require('../controllers/walletController');
const authController = require('../controllers/authController');

const router = express.Router();

// Protect all routes
router.use(authController.protect);

router.get('/', walletController.getWallet);
router.post('/withdraw', walletController.withdrawFunds);
router.get('/transactions', walletController.getTransactions);

module.exports = router;