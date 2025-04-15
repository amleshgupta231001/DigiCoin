const express = require('express');
const router = express.Router();
const gameController = require('../controllers/gameController');
const auth = require('../middleware/auth');

// Game management
router.post('/create', auth, gameController.createGame);
router.post('/join', auth, gameController.joinGame);
router.post('/submit', auth, gameController.submitCaptcha);
router.get('/status/:gameId', auth, gameController.getGameStatus);

// Game history & stats
router.get('/history', auth, gameController.getGameHistory);
router.get('/leaderboard', auth, gameController.getLeaderboard);
router.get('/stats/:userId', auth, gameController.getPlayerStats);

// Withdrawal
router.post('/withdraw', auth, gameController.withdrawFunds);

module.exports = router;