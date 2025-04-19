const User = require('../models/User');
const Wallet = require('../models/Wallet');
const AppError = require('../utils/error');
const multer = require('multer');
const sharp = require('sharp');
const path = require('path');

// Multer storage configuration
const multerStorage = multer.memoryStorage();

// Multer filter to accept only images
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image! Please upload only images.', 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter
});

exports.uploadUserPhoto = upload.single('profileImage');

exports.resizeUserPhoto = async (req, res, next) => {
  try {
    if (!req.file) return next();
    
    req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;
    
    await sharp(req.file.buffer)
      .resize(500, 500)
      .toFormat('jpeg')
      .jpeg({ quality: 90 })
      .toFile(`public/img/users/${req.file.filename}`);
      
    next();
  } catch (err) {
    next(err);
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    // 1) Filter out unwanted fields
    const filteredBody = {
      name: req.body.name
    };
    
    // 2) Add profile image if uploaded
    if (req.file) filteredBody.profileImage = req.file.filename;
    
    // 3) Update user
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      filteredBody,
      { new: true, runValidators: true }
    );
    
    // Create profile image URL
    const profileImageUrl = `${req.protocol}://${req.get('host')}/img/users/${updatedUser.profileImage}`;
    
    res.status(200).json({
      status: 'success',
      data: {
        user: {
          ...updatedUser.toObject(),
          profileImageUrl
        }
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    const wallet = await Wallet.findOne({ user: req.user.id });

    // Create profile image URL
    const profileImageUrl = `${req.protocol}://${req.get('host')}/img/users/${user.profileImage}`;

    res.status(200).json({
      status: 'success',
      data: {
        user: {
          ...user.toObject(),
          profileImageUrl
        },
        wallet
      }
    });
  } catch (err) {
    next(err);
  }
};