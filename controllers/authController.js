




// //////--------------

// const User = require('../models/User');
// const Wallet = require('../models/Wallet');
// const jwt = require('jsonwebtoken');
// const { promisify } = require('util');
// const logger = require('../utils/logger');
// const AppError = require('../utils/error');
// const { createToken, setTokenCookie } = require('../utils/auth');

// // Sign token
// const signToken = id => {
//   return jwt.sign({ id }, process.env.JWT_SECRET, {
//     expiresIn: process.env.JWT_EXPIRE
//   });
// };

// // Register new user
// exports.register = async (req, res, next) => {
//   try {
//     const { name, email, password, mobile, referralCode } = req.body;

//     // Check if user exists
//     const existingUser = await User.findOne({ 
//       $or: [{ email }, { mobile }] 
//     });
    
//     if (existingUser) {
//       return next(new AppError('User with this email or mobile already exists', 400));
//     }

//     // Check referral code if provided
//     let referredBy = null;
//     if (referralCode) {
//       const referrer = await User.findOne({ referralCode });
//       if (!referrer) {
//         return next(new AppError('Invalid referral code', 400));
//       }
//       referredBy = referrer._id;
//     }

//     // Create user
//     const user = await User.create({
//       name,
//       email,
//       password,
//       mobile,
//       referredBy
//     });

//     // Create wallet for user
//     const wallet = await Wallet.createWallet(user._id);

//     // Add signup bonus (50 coins)
//     await wallet.addFunds(50, 'Signup bonus');

//     // Add referral bonus if applicable
//     if (referredBy) {
//       const referrerWallet = await Wallet.findOne({ user: referredBy });
//       await referrerWallet.addFunds(25, 'Referral bonus');
//       await wallet.addFunds(25, 'Referral bonus');
//     }

//     // Generate token
//     const token = signToken(user._id);
//     setTokenCookie(res, token);

//     // Remove sensitive data
//     user.password = undefined;

//     res.status(201).json({
//       status: 'success',
//       token,
//       data: {
//         user,
//         wallet
//       }
//     });

//   } catch (err) {
//     logger.error(`Registration error: ${err.message}`);
//     next(err);
//   }
// };

// // Login user
// exports.login = async (req, res, next) => {
//   try {
//     const { emailOrMobile, password } = req.body;

//     // 1) Check if email/mobile and password exist
//     if (!emailOrMobile || !password) {
//       return next(new AppError('Please provide email/mobile and password', 400));
//     }

//     // 2) Check if user exists and password is correct
//     const user = await User.findOne({
//       $or: [
//         { email: emailOrMobile },
//         { mobile: emailOrMobile }
//       ]
//     }).select('+password');

//     if (!user || !(await user.comparePassword(password))) {
//       return next(new AppError('Incorrect email/mobile or password', 401));
//     }

//     // 3) Generate token
//     const token = signToken(user._id);
//     setTokenCookie(res, token);

//     // 4) Get user's wallet
//     const wallet = await Wallet.findOne({ user: user._id });

//     // 5) Remove sensitive data
//     user.password = undefined;

//     res.status(200).json({
//       status: 'success',
//       token,
//       data: {
//         user,
//         wallet
//       }
//     });

//   } catch (err) {
//     logger.error(`Login error: ${err.message}`);
//     next(err);
//   }
// };

// // Get current user
// exports.getMe = async (req, res, next) => {
//   try {
//     const user = await User.findById(req.user.id);
//     const wallet = await Wallet.findOne({ user: req.user.id });

//     res.status(200).json({
//       status: 'success',
//       data: {
//         user,
//         wallet
//       }
//     });
//   } catch (err) {
//     next(err);
//   }
// };

// // Protect routes
// exports.protect = async (req, res, next) => {
//   try {
//     let token;
    
//     // 1) Get token from header or cookie
//     if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
//       token = req.headers.authorization.split(' ')[1];
//     } else if (req.cookies.token) {
//       token = req.cookies.token;
//     }

//     if (!token) {
//       return next(new AppError('You are not logged in! Please log in to get access.', 401));
//     }

//     // 2) Verify token
//     const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

//     // 3) Check if user still exists
//     const currentUser = await User.findById(decoded.id);
//     if (!currentUser) {
//       return next(new AppError('The user belonging to this token no longer exists.', 401));
//     }

//     // 4) Grant access to protected route
//     req.user = currentUser;
//     next();
//   } catch (err) {
//     next(err);
//   }
// };



////// authController.js
const User = require('../models/User');
const Wallet = require('../models/Wallet');
const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const logger = require('../utils/logger');
const AppError = require('../utils/error');
const { createToken, setTokenCookie } = require('../utils/auth');

// Sign token
const signToken = id => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

// Register new user
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, mobile, referralCode } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ 
      $or: [{ email }, { mobile }] 
    });
    
    if (existingUser) {
      return next(new AppError('User with this email or mobile already exists', 400));
    }

    // Check referral code if provided
    let referredBy = null;
    if (referralCode) {
      const referrer = await User.findOne({ referralCode });
      if (!referrer) {
        return next(new AppError('Invalid referral code', 400));
      }
      referredBy = referrer._id;
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      mobile,
      referredBy
    });

    // Create wallet for user
    const wallet = await Wallet.createWallet(user._id);

    // Add signup bonus (50 coins)
    await wallet.addFunds(50, 'Signup bonus');

    // Add referral bonus if applicable
    if (referredBy) {
      const referrerWallet = await Wallet.findOne({ user: referredBy });
      await referrerWallet.addFunds(25, 'Referral bonus');
      await wallet.addFunds(25, 'Referral bonus');
    }

    // Generate token
    const token = signToken(user._id);
    setTokenCookie(res, token);

    // Remove sensitive data
    user.password = undefined;

    // Create profile image URL
    const profileImageUrl = `${req.protocol}://${req.get('host')}/img/users/${user.profileImage}`;

    res.status(201).json({
      status: 'success',
      token,
      data: {
        user: {
          ...user.toObject(),
          profileImageUrl
        },
        wallet
      }
    });

  } catch (err) {
    logger.error(`Registration error: ${err.message}`);
    next(err);
  }
};

// Login user
exports.login = async (req, res, next) => {
  try {
    const { emailOrMobile, password } = req.body;

    // 1) Check if email/mobile and password exist
    if (!emailOrMobile || !password) {
      return next(new AppError('Please provide email/mobile and password', 400));
    }

    // 2) Check if user exists and password is correct
    const user = await User.findOne({
      $or: [
        { email: emailOrMobile },
        { mobile: emailOrMobile }
      ]
    }).select('+password');

    if (!user || !(await user.comparePassword(password))) {
      return next(new AppError('Incorrect email/mobile or password', 401));
    }

    // 3) Generate token
    const token = signToken(user._id);
    setTokenCookie(res, token);

    // 4) Get user's wallet
    const wallet = await Wallet.findOne({ user: user._id });

    // 5) Remove sensitive data
    user.password = undefined;

    // Create profile image URL
    const profileImageUrl = `${req.protocol}://${req.get('host')}/img/users/${user.profileImage}`;

    res.status(200).json({
      status: 'success',
      token,
      data: {
        user: {
          ...user.toObject(),
          profileImageUrl
        },
        wallet
      }
    });

  } catch (err) {
    logger.error(`Login error: ${err.message}`);
    next(err);
  }
};

// Protect routes
exports.protect = async (req, res, next) => {
  try {
    let token;
    
    // 1) Get token from header or cookie
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return next(new AppError('You are not logged in! Please log in to get access.', 401));
    }

    // 2) Verify token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    // 3) Check if user still exists
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return next(new AppError('The user belonging to this token no longer exists.', 401));
    }

    // 4) Grant access to protected route
    req.user = currentUser;
    next();
  } catch (err) {
    next(err);
  }
};