

///---------------gameRoutes


const express = require('express');
const gameController = require('../controllers/gameController');
const authController = require('../controllers/authController');

const router = express.Router();

// Protect all routes
router.use(authController.protect);

router.get('/captcha', gameController.getCaptcha);
router.post('/submit', gameController.submitCaptcha);
router.get('/stats', gameController.getGameStats);

module.exports = router;