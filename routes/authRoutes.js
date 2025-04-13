const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Register new user
router.post('/register', authController.register);

// Login user
router.post('/login', authController.login);

// Get user profile
router.get('/profile', require('../middleware/auth'), authController.getProfile);

//Logout user
router.post('/logout', require('../middleware/auth'),authController.logout)

module.exports = router;