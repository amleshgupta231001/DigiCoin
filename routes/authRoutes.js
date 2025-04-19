
// ////-------------


// const express = require('express');
// const authController = require('../controllers/authController');

// const router = express.Router();

// router.post('/register', authController.register);
// router.post('/login', authController.login);
// router.get('/me', authController.protect, authController.getMe);

// module.exports = router;




const express = require('express');
const authController = require('../controllers/authController');
const profileController = require('../controllers/profileController');

const router = express.Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/me', authController.protect, profileController.getProfile);
router.patch(
  '/update-profile',
  authController.protect,
  profileController.uploadUserPhoto,
  profileController.resizeUserPhoto,
  profileController.updateProfile
);

module.exports = router;