

// ////---------------

////// working without timer 7 second

// const Game = require('../models/Game');
// const Wallet = require('../models/Wallet');
// const User = require('../models/User');
// const captchas = require('../config/captchas');
// const AppError = require('../utils/error');
// const logger = require('../utils/logger');

// // Get random captcha
// exports.getCaptcha = async (req, res, next) => {
//   try {
//     const user = req.user;
    
//     // Check if user has pending captcha
//     const pendingCaptcha = await Game.findOne({
//       user: user._id,
//       isCompleted: false
//     }).sort({ createdAt: -1 });

//     if (pendingCaptcha) {
//       return res.status(200).json({
//         status: 'success',
//         data: {
//           captcha: pendingCaptcha.captcha,
//           isPending: true
//         }
//       });
//     }

//     // Get random captcha
//     const randomIndex = Math.floor(Math.random() * captchas.length);
//     const captcha = captchas[randomIndex];

//     // Create new game session
//     const gameSession = await Game.create({
//       user: user._id,
//       captcha
//     });

//     res.status(200).json({
//       status: 'success',
//       data: {
//         captcha: gameSession.captcha,
//         isPending: false
//       }
//     });

//   } catch (err) {
//     logger.error(`Get captcha error: ${err.message}`);
//     next(err);
//   }
// };

// // Submit captcha
// exports.submitCaptcha = async (req, res, next) => {
//   try {
//     const { captcha, userInput } = req.body;
//     const user = req.user;

//     if (!captcha || !userInput) {
//       return next(new AppError('Please provide captcha and user input', 400));
//     }

//     // Find the latest game session
//     const gameSession = await Game.findOne({
//       user: user._id,
//       captcha,
//       isCompleted: false
//     }).sort({ createdAt: -1 });

//     if (!gameSession) {
//       return next(new AppError('No active captcha session found', 404));
//     }

//     // Check if captcha is correct
//     const isCorrect = captcha === userInput;
//     gameSession.isCompleted = true;
//     gameSession.isCorrect = isCorrect;
//     gameSession.userInput = userInput;
//     gameSession.attempts = req.body.attempts || 1;

//     await gameSession.save();

//     // If correct, process reward
//     if (isCorrect) {
//       const wallet = await Wallet.findOne({ user: user._id });
//       if (!wallet) {
//         return next(new AppError('Wallet not found', 404));
//       }

//       // Check if user completed 5 captchas
//       const completedCaptchas = await Game.countDocuments({
//         user: user._id,
//         isCompleted: true,
//         isCorrect: true,
//         createdAt: { 
//           $gte: new Date(new Date().setHours(0, 0, 0, 0)) 
//         }
//       });

//       // Reward 10 coins for every 5 correct captchas
//       if (completedCaptchas % 5 === 0) {
//         await wallet.addFunds(10, 'Captcha game reward');
//         gameSession.reward = 10;
//         await gameSession.save();
//       }
//     }

//     res.status(200).json({
//       status: 'success',
//       data: {
//         isCorrect,
//         reward: gameSession.reward || 0
//       }
//     });

//   } catch (err) {
//     logger.error(`Submit captcha error: ${err.message}`);
//     next(err);
//   }
// };

// // Get game stats
// exports.getGameStats = async (req, res, next) => {
//   try {
//     const user = req.user;

//     // Today's stats
//     const todayStart = new Date(new Date().setHours(0, 0, 0, 0));
//     const todayEnd = new Date(new Date().setHours(23, 59, 59, 999));

//     const todayCompleted = await Game.countDocuments({
//       user: user._id,
//       isCompleted: true,
//       createdAt: { $gte: todayStart, $lte: todayEnd }
//     });

//     const todayCorrect = await Game.countDocuments({
//       user: user._id,
//       isCompleted: true,
//       isCorrect: true,
//       createdAt: { $gte: todayStart, $lte: todayEnd }
//     });

//     const todayEarnings = await Game.aggregate([
//       {
//         $match: {
//           user: user._id,
//           isCompleted: true,
//           isCorrect: true,
//           reward: { $gt: 0 },
//           createdAt: { $gte: todayStart, $lte: todayEnd }
//         }
//       },
//       {
//         $group: {
//           _id: null,
//           total: { $sum: '$reward' }
//         }
//       }
//     ]);

//     // All-time stats
//     const allTimeStats = await Game.aggregate([
//       {
//         $match: {
//           user: user._id,
//           isCompleted: true
//         }
//       },
//       {
//         $facet: {
//           totalCompleted: [
//             { $count: 'count' }
//           ],
//           totalCorrect: [
//             { $match: { isCorrect: true } },
//             { $count: 'count' }
//           ],
//           totalEarnings: [
//             { $match: { isCorrect: true, reward: { $gt: 0 } } },
//             { $group: { _id: null, total: { $sum: '$reward' } } }
//           ]
//         }
//       }
//     ]);

//     res.status(200).json({
//       status: 'success',
//       data: {
//         today: {
//           completed: todayCompleted,
//           correct: todayCorrect,
//           earnings: todayEarnings.length ? todayEarnings[0].total : 0
//         },
//         allTime: {
//           completed: allTimeStats[0].totalCompleted.length ? allTimeStats[0].totalCompleted[0].count : 0,
//           correct: allTimeStats[0].totalCorrect.length ? allTimeStats[0].totalCorrect[0].count : 0,
//           earnings: allTimeStats[0].totalEarnings.length ? allTimeStats[0].totalEarnings[0].total : 0
//         }
//       }
//     });

//   } catch (err) {
//     logger.error(`Get game stats error: ${err.message}`);
//     next(err);
//   }
// };







///////working with timer 7 second 
////////...........gameController
const Game = require('../models/Game');
const Wallet = require('../models/Wallet');
const User = require('../models/User');
const captchas = require('../config/captchas');
const AppError = require('../utils/error');
const logger = require('../utils/logger');

// Get random captcha with timer
exports.getCaptcha = async (req, res, next) => {
  try {
    const user = req.user;

    // Check if user has pending captcha
    const pendingCaptcha = await Game.findOne({
      user: user._id,
      isCompleted: false
    }).sort({ createdAt: -1 });

    if (pendingCaptcha) {
      return res.status(200).json({
        status: 'success',
        data: {
          captcha: pendingCaptcha.captcha,
          isPending: true
        }
      });
    }

    // Get random captcha
    const randomIndex = Math.floor(Math.random() * captchas.length);
    const captcha = captchas[randomIndex];

    // Create new game session with timer (start time)
    const gameSession = await Game.create({
      user: user._id,
      captcha,
      startTime: new Date(), // Captcha game starts now
      timeLimit: 7  // 7 seconds to solve
    });

    res.status(200).json({
      status: 'success',
      data: {
        captcha: gameSession.captcha,
        isPending: false,
        startTime: gameSession.startTime,
        timeLimit: gameSession.timeLimit
      }
    });

  } catch (err) {
    logger.error(`Get captcha error: ${err.message}`);
    next(err);
  }
};

// Submit captcha with timer check
exports.submitCaptcha = async (req, res, next) => {
  try {
    const { captcha, userInput } = req.body;
    const user = req.user;

    if (!captcha || !userInput) {
      return next(new AppError('Please provide captcha and user input', 400));
    }

    // Find the latest game session
    const gameSession = await Game.findOne({
      user: user._id,
      captcha,
      isCompleted: false
    }).sort({ createdAt: -1 });

    if (!gameSession) {
      return next(new AppError('No active captcha session found', 404));
    }

    // Calculate elapsed time (in seconds)
    const elapsedTime = (new Date() - gameSession.startTime) / 1000; // time in seconds

    // Check if time limit is exceeded
    if (elapsedTime > gameSession.timeLimit) {
      gameSession.isCompleted = true;
      gameSession.isCorrect = false;
      gameSession.userInput = userInput;
      gameSession.attempts = req.body.attempts || 1;
      await gameSession.save();

      return res.status(400).json({
        status: 'failed',
        message: `Time's up! You took too long to complete the captcha.`
      });
    }

    // Check if captcha is correct
    const isCorrect = captcha === userInput;
    gameSession.isCompleted = true;
    gameSession.isCorrect = isCorrect;
    gameSession.userInput = userInput;
    gameSession.attempts = req.body.attempts || 1;
    gameSession.endTime = new Date(); // Add end time once the user submits the captcha

    await gameSession.save();

    // If correct, process reward
    if (isCorrect) {
      const wallet = await Wallet.findOne({ user: user._id });
      if (!wallet) {
        return next(new AppError('Wallet not found', 404));
      }

      // Check if user completed 5 captchas
      const completedCaptchas = await Game.countDocuments({
        user: user._id,
        isCompleted: true,
        isCorrect: true,
        createdAt: { 
          $gte: new Date(new Date().setHours(0, 0, 0, 0)) 
        }
      });

      // Reward 10 coins for every 5 correct captchas
      if (completedCaptchas % 5 === 0) {
        await wallet.addFunds(10, 'Captcha game reward');
        gameSession.reward = 10;
        await gameSession.save();
      }
    }

    res.status(200).json({
      status: 'success',
      data: {
        isCorrect,
        reward: gameSession.reward || 0
      }
    });

  } catch (err) {
    logger.error(`Submit captcha error: ${err.message}`);
    next(err);
  }
};

// Get game stats (same as before)
exports.getGameStats = async (req, res, next) => {
  try {
    const user = req.user;

    // Today's stats
    const todayStart = new Date(new Date().setHours(0, 0, 0, 0));
    const todayEnd = new Date(new Date().setHours(23, 59, 59, 999));

    const todayCompleted = await Game.countDocuments({
      user: user._id,
      isCompleted: true,
      createdAt: { $gte: todayStart, $lte: todayEnd }
    });

    const todayCorrect = await Game.countDocuments({
      user: user._id,
      isCompleted: true,
      isCorrect: true,
      createdAt: { $gte: todayStart, $lte: todayEnd }
    });

    const todayEarnings = await Game.aggregate([
      {
        $match: {
          user: user._id,
          isCompleted: true,
          isCorrect: true,
          reward: { $gt: 0 },
          createdAt: { $gte: todayStart, $lte: todayEnd }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$reward' }
        }
      }
    ]);

    // All-time stats
    const allTimeStats = await Game.aggregate([
      {
        $match: {
          user: user._id,
          isCompleted: true
        }
      },
      {
        $facet: {
          totalCompleted: [
            { $count: 'count' }
          ],
          totalCorrect: [
            { $match: { isCorrect: true } },
            { $count: 'count' }
          ],
          totalEarnings: [
            { $match: { isCorrect: true, reward: { $gt: 0 } } },
            { $group: { _id: null, total: { $sum: '$reward' } } }
          ]
        }
      }
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        today: {
          completed: todayCompleted,
          correct: todayCorrect,
          earnings: todayEarnings.length ? todayEarnings[0].total : 0
        },
        allTime: {
          completed: allTimeStats[0].totalCompleted.length ? allTimeStats[0].totalCompleted[0].count : 0,
          correct: allTimeStats[0].totalCorrect.length ? allTimeStats[0].totalCorrect[0].count : 0,
          earnings: allTimeStats[0].totalEarnings.length ? allTimeStats[0].totalEarnings[0].total : 0
        }
      }
    });

  } catch (err) {
    logger.error(`Get game stats error: ${err.message}`);
    next(err);
  }
};
 