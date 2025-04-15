
const Game = require('../models/Game');
const User = require('../models/User');
const Wallet = require('../models/Wallet');
const Transaction = require('../models/Transaction');
const { generateCaptcha } = require('../utils/captchaGenerator');
const { initiateWithdrawal } = require('../utils/payment');

// Game matching queue with timestamps
const gameQueue = {
  easy: new Map(), // Stores user IDs and their queue entry time
  medium: new Map(),
  hard: new Map(),
};

// Active games tracking with enhanced data
const activeGames = new Map();

// Bot profiles
const BOTS = {
  easy: { name: "Bot-Easy", difficulty: 'easy', responseTime: 3000, accuracy: 0.6 },
  medium: { name: "Bot-Medium", difficulty: 'medium', responseTime: 2000, accuracy: 0.75 },
  hard: { name: "Bot-Hard", difficulty: 'hard', responseTime: 1500, accuracy: 0.9 }
};

// Utility function to get bot response
const getBotResponse = (captcha, difficulty) => {
  const bot = BOTS[difficulty];
  const isCorrect = Math.random() < bot.accuracy;
  return {
    answer: isCorrect ? captcha.toString() : (captcha + 1).toString(),
    responseTime: bot.responseTime * (0.8 + Math.random() * 0.4) // Random variation
  };
};




// const createGame = async (req, res) => {
//   try {
//     const { captchaDifficulty = 'easy' } = req.body;
//     const user = req.user;
 
//     if (!user || !user._id) {
//       throw new Error('User authentication failed');
//     }

//     console.log(`[${new Date().toISOString()}] [CREATE GAME] User ${user._id} requesting ${captchaDifficulty} game`);

//     // Ensure the queue exists for this difficulty
//     if (!gameQueue[captchaDifficulty]) {
//       gameQueue[captchaDifficulty] = new Map();
//     }

//     // Check if user is already in queue
//     if (gameQueue[captchaDifficulty].has(user._id.toString())) {
//       return res.status(400).json({ error: 'You are already in queue' });
//     }

//     // Check if user is in any active game
//     for (const [_, game] of activeGames) {
//       if (game.player1 === user._id.toString() || game.player2 === user._id.toString()) {
//         return res.status(400).json({ error: 'You are already in a game' });
//       }
//     }

//     // Add user to queue
//     gameQueue[captchaDifficulty].set(user._id.toString(), new Date());

//     // Immediate matchmaking check
//     if (gameQueue[captchaDifficulty].size >= 2) {
//       const [player1Id, player2Id] = Array.from(gameQueue[captchaDifficulty].keys());
      
//       // Remove both players from queue
//       gameQueue[captchaDifficulty].delete(player1Id);
//       gameQueue[captchaDifficulty].delete(player2Id);
      
//       // Create the game
//       const game = new Game({
//         player1: player1Id,
//         player2: player2Id,
//         captchaDifficulty,
//         status: 'active',
//         startTime: new Date()
//       });
      
//       await game.save();
      
//       // Generate first captcha
//       const captcha = generateCaptcha(captchaDifficulty);
//       activeGames.set(game._id.toString(), {
//         ...game.toObject(),
//         currentCaptcha: captcha,
//         captchaStartTime: new Date(),
//         player1Score: 0,
//         player2Score: 0,
//         captchas: []
//       });
      
//       return res.json({ 
//         message: 'Game started!', 
//         gameId: game._id,
//         opponent: player1Id === user._id.toString() ? player2Id : player1Id,
//         difficulty: captchaDifficulty,
//         isBot: false
//       });
//     }

//     // Set timeout for bot matchmaking (10 seconds)
//     const botTimeout = setTimeout(async () => {
//       if (gameQueue[captchaDifficulty]?.has(user._id.toString())) {
//         gameQueue[captchaDifficulty].delete(user._id.toString());
        
//         // Create game with bot
//         const bot = BOTS[captchaDifficulty];
//         const game = new Game({
//           player1: user._id,
//           player2: bot.id,
//           player2Name: bot.name,
//           isBotGame: true,
//           botDifficulty: captchaDifficulty,
//           status: 'active', 
//           startTime: new Date()
//         });
        
//         await game.save();
        
//         const captcha = generateCaptcha(captchaDifficulty);
//         activeGames.set(game._id.toString(), {
//           ...game.toObject(),
//           currentCaptcha: captcha,
//           captchaStartTime: new Date(),
//           player1Score: 0,
//           player2Score: 0,
//           captchas: [],
//           botResponseTimer: null
//         });
        
//         simulateBotResponse(game._id.toString(), captchaDifficulty);
//       }
//     }, 10000);

//     res.json({ 
//       message: 'Searching for opponent...', 
//       difficulty: captchaDifficulty,
//       queuePosition: gameQueue[captchaDifficulty].size,
//       timeout: 10000
//     });

//   } catch (error) {
//     console.error('Error in createGame:', error);
//     res.status(500).json({ error: error.message });
//   }
// };


// Enhanced bot response simulation




// const createGame = async (req, res) => {
//   try {
//     const { captchaDifficulty = 'easy' } = req.body;
//     const user = req.user;

//     if (!user || !user._id) {
//       throw new Error('User authentication failed');
//     }

//     console.log(`[${new Date().toISOString()}] [CREATE GAME] User ${user._id} requesting ${captchaDifficulty} game`);

//     // Ensure the queue exists for this difficulty
//     if (!gameQueue[captchaDifficulty]) {
//       gameQueue[captchaDifficulty] = new Map();
//     }

//     // Check if user is already in queue
//     if (gameQueue[captchaDifficulty].has(user._id.toString())) {
//       return res.status(400).json({ 
//         error: 'You are already in queue',
//         code: 'ALREADY_IN_QUEUE'
//       });
//     }

//     // Check if user is in any active game
//     for (const [_, game] of activeGames) {
//       if (game.player1 === user._id.toString() || game.player2 === user._id.toString()) {
//         return res.status(400).json({ 
//           error: 'You are already in a game',
//           code: 'ALREADY_IN_GAME',
//           currentGameId: game._id.toString(),
//           opponent: game.player1 === user._id.toString() ? game.player2 : game.player1
//         });
//       }
//     }

//     // Add user to queue with timestamp
//     gameQueue[captchaDifficulty].set(user._id.toString(), new Date());
//     const queuePosition = gameQueue[captchaDifficulty].size;

//     // Immediate matchmaking check
//     if (gameQueue[captchaDifficulty].size >= 2) {
//       const [player1Id, player2Id] = Array.from(gameQueue[captchaDifficulty].keys());
      
//       // Remove both players from queue
//       gameQueue[captchaDifficulty].delete(player1Id);
//       gameQueue[captchaDifficulty].delete(player2Id);
      
//       // Create the game
//       const game = new Game({
//         player1: player1Id,
//         player2: player2Id,
//         captchaDifficulty,
//         status: 'active',
//         startTime: new Date()
//       });
      
//       await game.save();
      
//       // Generate first captcha
//       const captcha = generateCaptcha(captchaDifficulty);
//       activeGames.set(game._id.toString(), {
//         ...game.toObject(),
//         currentCaptcha: captcha,
//         captchaStartTime: new Date(),
//         player1Score: 0,
//         player2Score: 0,
//         captchas: []
//       });
      
//       // Return success response with all necessary data
//       return res.json({ 
//         success: true,
//         message: 'Game started with real player!',
//         gameId: game._id,
//         opponent: player1Id === user._id.toString() ? player2Id : player1Id,
//         difficulty: captchaDifficulty,
//         isBot: false,
//         queuePosition: 0, // No queue since match was immediate
//         timeout: 0,
//         gameStatus: 'active'
//       });
//     }

//     // Create a temporary game document for the waiting player
//     const tempGame = new Game({
//       player1: user._id,
//       status: 'waiting',
//       captchaDifficulty,
//       createdAt: new Date()
//     });
    
//     await tempGame.save();

//     // Set timeout for bot matchmaking (10 seconds)
//     const botTimeout = setTimeout(async () => {
//       if (gameQueue[captchaDifficulty]?.has(user._id.toString())) {
//         gameQueue[captchaDifficulty].delete(user._id.toString());
        
//         // Create game with bot
//         const bot = BOTS[captchaDifficulty];
//         const game = new Game({
//           player1: user._id,
//           player2: bot.id,
//           player2Name: bot.name,
//           isBotGame: true,
//           botDifficulty: captchaDifficulty,
//           status: 'active', 
//           startTime: new Date()
//         });
        
//         await Game.findByIdAndDelete(tempGame._id); // Remove temp game
//         await game.save();
        
//         const captcha = generateCaptcha(captchaDifficulty);
//         activeGames.set(game._id.toString(), {
//           ...game.toObject(),
//           currentCaptcha: captcha,
//           captchaStartTime: new Date(),
//           player1Score: 0,
//           player2Score: 0,
//           captchas: [],
//           botResponseTimer: null
//         });
        
//         simulateBotResponse(game._id.toString(), captchaDifficulty);
//       }
//     }, 10000);

//     // Clean up timeout if request fails
//     res.on('finish', () => {
//       if (res.statusCode !== 200) {
//         clearTimeout(botTimeout);
//         gameQueue[captchaDifficulty].delete(user._id.toString());
//         Game.findByIdAndDelete(tempGame._id).catch(console.error);
//       }
//     });

//     // Return waiting response with all queue information
//     res.json({ 
//       success: true,
//       message: 'Searching for opponent...', 
//       difficulty: captchaDifficulty,
//       queuePosition,
//       timeout: 10000,
//       gameId: tempGame._id, // Return the temporary game ID
//       isBot: false,
//       gameStatus: 'waiting'
//     });

//   } catch (error) {
//     console.error('Error in createGame:', error);
    
//     // Clean up any partial state
//     if (gameQueue[captchaDifficulty]?.has(user._id.toString())) {
//       gameQueue[captchaDifficulty].delete(user._id.toString());
//     }
    
//     res.status(500).json({ 
//       success: false,
//       error: error.message,
//       code: 'CREATE_GAME_ERROR'
//     });
//   }
// };




const createGame = async (req, res) => {
  try {
    const { captchaDifficulty = 'easy' } = req.body;
    const user = req.user;

    if (!user || !user._id) {
      throw new Error('User authentication failed');
    }

    console.log(`[${new Date().toISOString()}] [CREATE GAME] User ${user._id} requesting ${captchaDifficulty} game`);

    // Check for existing active game first
    const activeGame = await Game.findOne({
      $or: [{ player1: user._id }, { player2: user._id }],
      status: { $in: ['waiting', 'active'] }
    });

    if (activeGame) {
      return res.status(200).json({
        success: true,
        message: 'Existing game found',
        gameId: activeGame._id,
        status: activeGame.status,
        isBot: activeGame.isBotGame || false,
        opponent: activeGame.player1.equals(user._id) ? activeGame.player2 : activeGame.player1
      });
    }

    // Check queue position
    const queueSize = gameQueue[captchaDifficulty]?.size || 0;

    // Immediate match if possible
    if (queueSize >= 1) {
      const opponentId = Array.from(gameQueue[captchaDifficulty].keys())[0];
      gameQueue[captchaDifficulty].delete(opponentId);

      const game = new Game({
        player1: user._id,
        player2: opponentId,
        captchaDifficulty,
        status: 'active',
        startTime: new Date()
      });

      await game.save();

      const captcha = generateCaptcha(captchaDifficulty);
      activeGames.set(game._id.toString(), {
        ...game.toObject(),
        currentCaptcha: captcha,
        captchaStartTime: new Date(),
        player1Score: 0,
        player2Score: 0,
        captchas: []
      });

      return res.json({
        success: true,
        message: 'Game started with real player!',
        gameId: game._id,
        status: 'active',
        opponent: opponentId,
        difficulty: captchaDifficulty,
        isBot: false
      });
    }

    // Add to queue
    gameQueue[captchaDifficulty].set(user._id.toString(), new Date());

    // Create temporary game record
    const tempGame = new Game({
      player1: user._id,
      status: 'waiting',
      captchaDifficulty,
      createdAt: new Date()
    });
    await tempGame.save();

    // Set bot timeout
    const botTimeout = setTimeout(async () => {
      if (gameQueue[captchaDifficulty]?.has(user._id.toString())) {
        gameQueue[captchaDifficulty].delete(user._id.toString());
        
        const bot = BOTS[captchaDifficulty];
        const game = new Game({
          player1: user._id,
          player2: bot.id,
          player2Name: bot.name,
          isBotGame: true,
          botDifficulty: captchaDifficulty,
          status: 'active',
          startTime: new Date()
        });
        
        await Game.findByIdAndDelete(tempGame._id);
        await game.save();
        
        const captcha = generateCaptcha(captchaDifficulty);
        activeGames.set(game._id.toString(), {
          ...game.toObject(),
          currentCaptcha: captcha,
          captchaStartTime: new Date(),
          player1Score: 0,
          player2Score: 0,
          captchas: [],
          botResponseTimer: null
        });
        
        simulateBotResponse(game._id.toString(), captchaDifficulty);
      }
    }, 10000);

    res.json({
      success: true,
      message: 'Searching for opponent...',
      gameId: tempGame._id,
      status: 'waiting',
      difficulty: captchaDifficulty,
      queuePosition: queueSize + 1,
      timeout: 10000,
      isBot: false
    });

  } catch (error) {
    console.error('Error in createGame:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      code: 'CREATE_GAME_ERROR'
    });
  }
};

// Add this new endpoint to check active game
const getActiveGame = async (req, res) => {
  try {
    const user = req.user;
    const game = await Game.findOne({
      $or: [{ player1: user._id }, { player2: user._id }],
      status: { $in: ['waiting', 'active'] }
    }).select('_id status player1 player2 isBotGame captchaDifficulty');

    if (!game) {
      return res.status(404).json({
        success: true,
        hasActiveGame: false
      });
    }

    res.json({
      success: true,
      hasActiveGame: true,
      gameId: game._id,
      status: game.status,
      isBot: game.isBotGame || false,
      difficulty: game.captchaDifficulty,
      opponent: game.player1.equals(user._id) ? game.player2 : game.player1
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};




const simulateBotResponse = (gameId, difficulty) => {
  if (!activeGames.has(gameId)) return;
  
  const game = activeGames.get(gameId);
  if (!game.isBotGame) return;
  
  // Clear any existing timer
  if (game.botResponseTimer) {
    clearTimeout(game.botResponseTimer);
  }
  
  const botResponse = getBotResponse(game.currentCaptcha, difficulty);
  
  game.botResponseTimer = setTimeout(() => {
    if (!activeGames.has(gameId)) return;
    
    const currentGame = activeGames.get(gameId);
    console.log(`[BOT MOVE] Bot ${currentGame.player2Name} responding to captcha in game ${gameId}`);
    
    // Prepare bot submission data
    const botSubmission = {
      gameId,
      answer: botResponse.answer,
      isBot: true
    };
    
    // Process bot submission directly without HTTP
    processBotSubmission(gameId, botSubmission, currentGame.player2, currentGame.player2Name);
  }, botResponse.responseTime);
  
  activeGames.set(gameId, game);
};

// Process bot submissions directly
const processBotSubmission = async (gameId, submission, botId, botName) => {
  try {
    if (!activeGames.has(gameId)) {
      console.warn(`[BOT SUBMIT ERROR] Game ${gameId} not active`);
      return;
    }

    const game = activeGames.get(gameId);
    const isPlayer2 = game.player2 === botId;

    if (!isPlayer2) {
      console.warn(`[BOT UNAUTHORIZED] Bot ${botId} not part of game ${gameId}`);
      return;
    }

    // Validate answer format
    if (typeof submission.answer !== 'string' || !/^\d+$/.test(submission.answer)) {
      console.warn(`[BOT INVALID ANSWER] Bot ${botId} submitted malformed answer`);
      return;
    }

    // Check if answer is correct
    const isCorrect = parseInt(submission.answer) === game.currentCaptcha;
    const now = new Date();
    const responseTime = now - game.captchaStartTime;

    console.log(`[BOT ANSWER] Bot ${botName} answered ${submission.answer} (correct: ${game.currentCaptcha}) - ${isCorrect ? 'CORRECT' : 'WRONG'}`);

    // Record the answer
    game.captchas.push({
      value: game.currentCaptcha,
      answeredBy: botId,
      answer: submission.answer,
      isCorrect,
      responseTime,
      timestamp: now
    });

    // Update score
    if (isCorrect) {
      game.player2Score++;
    }

    // Check if game time is up (1 minute)
    const gameDuration = now - game.startTime;
    if (gameDuration > 60000) {
      return endGame(gameId);
    }

    // Generate new captcha
    game.currentCaptcha = generateCaptcha(game.captchaDifficulty);
    game.captchaStartTime = now;
    activeGames.set(gameId, game);

    // For bot games, simulate next bot response
    if (game.isBotGame) {
      simulateBotResponse(gameId, game.captchaDifficulty);
    }

  } catch (error) {
    console.error(`[BOT SUBMIT ERROR] Game ${gameId}:`, error);
  }
};


// Enhanced join game logic
const joinGame = async (req, res) => {
  try {
    const { gameId } = req.body;
    const user = req.user;

    console.log(`[JOIN GAME] User ${user._id} attempting to join game ${gameId}`);

    const game = await Game.findById(gameId);
    if (!game) {
      console.warn(`[GAME NOT FOUND] Game ${gameId} not found`);
      return res.status(404).json({ error: 'Game not found' });
    }

    if (game.player2 && game.player2 !== user._id.toString()) {
      console.warn(`[GAME FULL] Game ${gameId} already has two players`);
      return res.status(400).json({ error: 'Game is full' });
    }

    if (game.player1.toString() === user._id.toString()) {
      console.warn(`[SELF JOIN] User ${user._id} tried to join their own game`);
      return res.status(400).json({ error: 'Cannot join your own game' });
    }

    // Check if user is already in another game
    for (const [activeGameId, activeGame] of activeGames) {
      if (activeGame.player1 === user._id.toString() || activeGame.player2 === user._id.toString()) {
        console.warn(`[ALREADY IN GAME] User ${user._id} already in game ${activeGameId}`);
        return res.status(400).json({ 
          error: 'You are already in a game',
          currentGameId: activeGameId,
          opponent: activeGame.player1 === user._id.toString() ? activeGame.player2 : activeGame.player1
        });
      }
    }

    // Add player to game
    game.player2 = user._id;
    game.status = 'active';
    game.startTime = new Date();
    await game.save();

    // Generate first captcha
    const captcha = generateCaptcha(game.captchaDifficulty);
    activeGames.set(game._id.toString(), {
      ...game.toObject(),
      currentCaptcha: captcha,
      captchaStartTime: new Date(),
      player1Score: 0,
      player2Score: 0,
      captchas: []
    });

    console.log(`[GAME JOINED] User ${user._id} joined game ${gameId} with ${game.player1}`);
    res.json({ 
      message: 'Game started with real player!', 
      gameId: game._id,
      opponent: game.player1,
      difficulty: game.captchaDifficulty,
      isBot: false
    });
  } catch (error) {
    console.error(`[JOIN ERROR] User ${req.user?._id} game ${req.body.gameId}:`, error);
    res.status(500).json({ error: 'Failed to join game', details: error.message });
  }
};

// Premium captcha submission logic
// const submitCaptcha = async (req, res) => {
//   try {
//     const { gameId, answer } = req.body;
//     const user = req.user;

//     console.log(`[CAPTCHA SUBMIT] User ${user._id} submitting answer to game ${gameId}`);

//     if (!activeGames.has(gameId)) {
//       console.warn(`[INACTIVE GAME] Game ${gameId} not active`);
//       return res.status(404).json({ error: 'Game not found or already ended' });
//     }

//     const game = activeGames.get(gameId);
//     const isPlayer1 = game.player1.toString() === user._id.toString();
//     const isPlayer2 = game.player2.toString() === user._id.toString();

//     if (!isPlayer1 && !isPlayer2) {
//       console.warn(`[UNAUTHORIZED] User ${user._id} not part of game ${gameId}`);
//       return res.status(403).json({ error: 'You are not part of this game' });
//     }

//     // Validate answer format
//     if (typeof answer !== 'string' || !/^\d+$/.test(answer)) {
//       console.warn(`[INVALID ANSWER] User ${user._id} submitted malformed answer`);
//       return res.status(400).json({ error: 'Invalid answer format' });
//     }

//     // Check if answer is correct
//     const isCorrect = parseInt(answer) === game.currentCaptcha;
//     const now = new Date();
//     const responseTime = now - game.captchaStartTime;

//     console.log(`[ANSWER EVAL] User ${user._id} answered ${answer} (correct: ${game.currentCaptcha}) - ${isCorrect ? 'CORRECT' : 'WRONG'}`);

//     // Record the answer
//     game.captchas.push({
//       value: game.currentCaptcha,
//       answeredBy: user._id,
//       answer,
//       isCorrect,
//       responseTime,
//       timestamp: now
//     });

//     // Update score
//     if (isCorrect) {
//       if (isPlayer1) game.player1Score++;
//       if (isPlayer2) game.player2Score++;
//     }

//     // Check if game time is up (1 minute)
//     const gameDuration = now - game.startTime;
//     if (gameDuration > 60000) {
//       return endGame(gameId, res);
//     }

//     // Generate new captcha
//     game.currentCaptcha = generateCaptcha(game.captchaDifficulty);
//     game.captchaStartTime = now;
//     activeGames.set(gameId, game);

//     // For bot games, simulate bot response
//     if (game.isBotGame && isPlayer1) {
//       simulateBotResponse(gameId, game.captchaDifficulty);
//     }

//     console.log(`[NEXT CAPTCHA] Game ${gameId} new captcha generated for ${user._id}`);
//     res.json({ 
//       message: isCorrect ? 'Correct answer!' : 'Wrong answer!',
//       isCorrect,
//       player1Score: game.player1Score,
//       player2Score: game.player2Score,
//       timeLeft: Math.max(0, 60000 - gameDuration),
//       responseTime
//     });
//   } catch (error) {
//     console.error(`[SUBMIT ERROR] User ${req.user?._id} game ${req.body.gameId}:`, error);
//     res.status(500).json({ error: 'Failed to process captcha', details: error.message });
//   }
// };




const submitCaptcha = async (req, res) => {
  try {
    const { gameId, answer } = req.body;
    const user = req.user;

    console.log(`[CAPTCHA SUBMIT] User ${user._id} submitting answer to game ${gameId}`);

    if (!activeGames.has(gameId)) {
      console.warn(`[INACTIVE GAME] Game ${gameId} not active`);
      return res.status(404).json({ error: 'Game not found or already ended' });
    }

    const game = activeGames.get(gameId);
    const isPlayer1 = game.player1 === user._id.toString();
    const isPlayer2 = game.player2 === user._id.toString();

    if (!isPlayer1 && !isPlayer2) {
      console.warn(`[UNAUTHORIZED] User ${user._id} not part of game ${gameId}`);
      return res.status(403).json({ error: 'You are not part of this game' });
    }

    // Validate answer format
    if (typeof answer !== 'string' || !/^\d+$/.test(answer)) {
      console.warn(`[INVALID ANSWER] User ${user._id} submitted malformed answer`);
      return res.status(400).json({ error: 'Invalid answer format' });
    }

    // Check if answer is correct
    const isCorrect = parseInt(answer) === game.currentCaptcha;
    const now = new Date();
    const responseTime = now - game.captchaStartTime;

    console.log(`[ANSWER EVAL] User ${user._id} answered ${answer} (correct: ${game.currentCaptcha}) - ${isCorrect ? 'CORRECT' : 'WRONG'}`);

    // Record the answer
    game.captchas.push({
      value: game.currentCaptcha,
      answeredBy: user._id,
      answer,
      isCorrect,
      responseTime,
      timestamp: now
    });

    // Update score
    if (isCorrect) {
      if (isPlayer1) game.player1Score++;
      if (isPlayer2) game.player2Score++;
    }

    // Check if game time is up (1 minute)
    const gameDuration = now - game.startTime;
    if (gameDuration > 60000) {
      return endGame(gameId, res);
    }

    // Generate new captcha
    game.currentCaptcha = generateCaptcha(game.captchaDifficulty);
    game.captchaStartTime = now;
    activeGames.set(gameId, game);

    // For bot games, simulate bot response if human player submitted
    if (game.isBotGame && isPlayer1) {
      simulateBotResponse(gameId, game.captchaDifficulty);
    }

    console.log(`[NEXT CAPTCHA] Game ${gameId} new captcha generated for ${user._id}`);
    res.json({ 
      message: isCorrect ? 'Correct answer!' : 'Wrong answer!',
      isCorrect,
      player1Score: game.player1Score,
      player2Score: game.player2Score,
      timeLeft: Math.max(0, 60000 - gameDuration),
      responseTime
    });
  } catch (error) {
    console.error(`[SUBMIT ERROR] User ${req.user?._id} game ${req.body.gameId}:`, error);
    res.status(500).json({ error: 'Failed to process captcha', details: error.message });
  }
};





// Enhanced game ending logic
const endGame = async (gameId, res) => {
  const game = activeGames.get(gameId);
  const now = new Date();
  
  // Determine winner
  game.status = 'completed';
  game.endTime = now;
  game.winner = game.player1Score > game.player2Score 
    ? game.player1 
    : game.player2Score > game.player1Score 
      ? game.player2 
      : null;

  console.log(`[GAME ENDED] Game ${gameId} completed. Winner: ${game.winner || 'DRAW'}` +
    ` Scores: ${game.player1Score}-${game.player2Score}`);

  // Save to database
  await Game.findByIdAndUpdate(gameId, {
    captchas: game.captchas,
    status: 'completed',
    endTime: now,
    winner: game.winner,
    player1Score: game.player1Score,
    player2Score: game.player2Score
  });

  // Update wallets if not a bot game
  if (game.winner && !game.isBotGame) {
    try {
      const winnerWallet = await Wallet.findOneAndUpdate(
        { user: game.winner },
        { $inc: { coins: 100 } },
        { new: true, upsert: true }
      );
      
      const loserId = game.winner.toString() === game.player1.toString() ? game.player2 : game.player1;
      const loserWallet = await Wallet.findOne({ user: loserId });
      
      if (loserWallet && loserWallet.coins >= 50) {
        loserWallet.coins -= 50;
        await loserWallet.save();
        
        await Transaction.create({
          user: loserId,
          amount: 50,
          type: 'debit',
          description: `Lost to ${game.winner.toString() === game.player1.toString() ? game.player2 : game.player1}`,
          status: 'completed',
        });
      }

      await Transaction.create({
        user: game.winner,
        amount: 100,
        type: 'credit',
        description: `Won against ${loserId}`,
        status: 'completed',
      });

      console.log(`[WALLETS UPDATED] Winner ${game.winner} +100 coins, Loser ${loserId} -50 coins`);
    } catch (walletError) {
      console.error(`[WALLET ERROR] Failed to update wallets for game ${gameId}:`, walletError);
    }
  }

  // For bot games, just credit the user if they won
  if (game.isBotGame && game.winner && game.winner.toString() !== game.player2) {
    try {
      await Wallet.findOneAndUpdate(
        { user: game.winner },
        { $inc: { coins: 50 } }, // Smaller reward for bot games
        { new: true, upsert: true }
      );
      
      await Transaction.create({
        user: game.winner,
        amount: 50,
        type: 'credit',
        description: `Won against bot ${game.player2}`,
        status: 'completed',
      });
      
      console.log(`[BOT REWARD] User ${game.winner} awarded 50 coins for beating bot`);
    } catch (botWalletError) {
      console.error(`[BOT WALLET ERROR] Failed to credit user for bot game ${gameId}:`, botWalletError);
    }
  }

  // Clean up
  activeGames.delete(gameId);
  
  if (res) {
    return res.json({ 
      message: 'Game ended', 
      winner: game.winner,
      player1Score: game.player1Score,
      player2Score: game.player2Score,
      isDraw: !game.winner,
      isBotGame: game.isBotGame
    });
  }
};

// Enhanced game status check
const getGameStatus = async (req, res) => {
  try {
    const gameId = req.params.gameId;
    const user = req.user;

    console.log(`[STATUS REQUEST] User ${user._id} checking status of game ${gameId}`);

    if (activeGames.has(gameId)) {
      const game = activeGames.get(gameId);
      const isPlayer = game.player1.toString() === user._id.toString() || 
                      game.player2.toString() === user._id.toString();

      if (!isPlayer) {
        console.warn(`[UNAUTHORIZED STATUS] User ${user._id} not part of game ${gameId}`);
        return res.status(403).json({ error: 'You are not part of this game' });
      }

      const now = new Date();
      const gameDuration = now - game.startTime;
      
      // Auto-end game if time expired
      if (gameDuration > 60000) {
        console.log(`[AUTO ENDING] Game ${gameId} time expired during status check`);
        return endGame(gameId, res);
      }

      console.log(`[STATUS RETURN] Returning status for game ${gameId}`);
      return res.json({
        status: game.status,
        player1: game.player1,
        player2: game.player2,
        player1Score: game.player1Score,
        player2Score: game.player2Score,
        currentCaptcha: game.currentCaptcha,
        timeLeft: 60000 - gameDuration,
        difficulty: game.captchaDifficulty,
        isBotGame: game.isBotGame,
        lastCaptcha: game.captchas[game.captchas.length - 1] || null
      });
    }

    const dbGame = await Game.findById(gameId)
      .populate('player1 player2 winner', 'name email');
    
    if (!dbGame) {
      console.warn(`[GAME NOT FOUND] Game ${gameId} not found in database`);
      return res.status(404).json({ error: 'Game not found' });
    }

    console.log(`[COMPLETED GAME] Returning completed game ${gameId} details`);
    res.json(dbGame);
  } catch (error) {
    console.error(`[STATUS ERROR] User ${req.user?._id} game ${req.params.gameId}:`, error);
    res.status(500).json({ error: 'Failed to get game status', details: error.message });
  }
};

// Premium game history with analytics
const getGameHistory = async (req, res) => {
  try {
    const user = req.user;
    const { limit = 20, page = 1 } = req.query;

    console.log(`[HISTORY REQUEST] User ${user._id} requesting game history`);

    const games = await Game.find({
      $or: [{ player1: user._id }, { player2: user._id }],
      status: 'completed',
    })
    .sort({ endTime: -1 })
    .skip((page - 1) * limit)
    .limit(parseInt(limit))
    .populate('player1 player2 winner', 'name email');

    const totalGames = await Game.countDocuments({
      $or: [{ player1: user._id }, { player2: user._id }],
      status: 'completed',
    });

    console.log(`[HISTORY RETURN] Found ${games.length} games for user ${user._id}`);
    res.json({
      games,
      pagination: {
        total: totalGames,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(totalGames / limit)
      }
    });
  } catch (error) {
    console.error(`[HISTORY ERROR] User ${req.user?._id}:`, error);
    res.status(500).json({ error: 'Failed to get game history', details: error.message });
  }
};

// Enhanced leaderboard with tiers
const getLeaderboard = async (req, res) => {
  try {
    console.log(`[LEADERBOARD REQUEST] Fetching leaderboard`);

    const leaderboard = await Game.aggregate([
      { $match: { status: 'completed', winner: { $ne: null } } },
      { $group: { _id: '$winner', wins: { $sum: 1 }, totalGames: { $sum: 1 } } },
      { $sort: { wins: -1 } },
      { $limit: 50 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: '$user' },
      { 
        $project: { 
          userId: '$_id', 
          name: '$user.name', 
          wins: 1,
          winRate: { $multiply: [ { $divide: ['$wins', '$totalGames'] }, 100 ] },
          tier: {
            $switch: {
              branches: [
                { case: { $gte: ['$wins', 100] }, then: 'Legend' },
                { case: { $gte: ['$wins', 50] }, then: 'Master' },
                { case: { $gte: ['$wins', 25] }, then: 'Expert' },
                { case: { $gte: ['$wins', 10] }, then: 'Skilled' }
              ],
              default: 'Novice'
            }
          }
        } 
      }
    ]);

    console.log(`[LEADERBOARD RETURN] Returning ${leaderboard.length} top players`);
    res.json(leaderboard);
  } catch (error) {
    console.error(`[LEADERBOARD ERROR]:`, error);
    res.status(500).json({ error: 'Failed to get leaderboard', details: error.message });
  }
};

// Premium player stats with detailed analytics
const getPlayerStats = async (req, res) => {
  try {
    const userId = req.params.userId;
    console.log(`[STATS REQUEST] Fetching stats for user ${userId}`);

    const [stats, recentGames, favoriteDifficulty] = await Promise.all([
      Game.aggregate([
        {
          $match: {
            $or: [{ player1: userId }, { player2: userId }],
            status: 'completed'
          }
        },
        {
          $group: {
            _id: null,
            totalGames: { $sum: 1 },
            wins: {
              $sum: {
                $cond: [{ $eq: ['$winner', userId] }, 1, 0]
              }
            },
            botWins: {
              $sum: {
                $cond: [
                  { $and: [
                    { $eq: ['$winner', userId] },
                    { $eq: ['$isBotGame', true] }
                  ]},
                  1,
                  0
                ]
              }
            },
            humanWins: {
              $sum: {
                $cond: [
                  { $and: [
                    { $eq: ['$winner', userId] },
                    { $eq: ['$isBotGame', false] }
                  ]},
                  1,
                  0
                ]
              }
            },
            avgScore: {
              $avg: {
                $cond: [
                  { $eq: ['$player1', userId] },
                  '$player1Score',
                  '$player2Score'
                ]
              }
            }
          }
        }
      ]),
      Game.find({
        $or: [{ player1: userId }, { player2: userId }],
        status: 'completed'
      })
      .sort({ endTime: -1 })
      .limit(5)
      .populate('player1 player2 winner', 'name email'),
      Game.aggregate([
        {
          $match: {
            $or: [{ player1: userId }, { player2: userId }],
            status: 'completed'
          }
        },
        {
          $group: {
            _id: '$captchaDifficulty',
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } },
        { $limit: 1 }
      ])
    ]);

    const result = {
      userId,
      totalGames: stats[0]?.totalGames || 0,
      wins: stats[0]?.wins || 0,
      losses: (stats[0]?.totalGames || 0) - (stats[0]?.wins || 0),
      winRate: stats[0] ? (stats[0].wins / stats[0].totalGames) * 100 : 0,
      botWins: stats[0]?.botWins || 0,
      humanWins: stats[0]?.humanWins || 0,
      avgScore: stats[0]?.avgScore ? Math.round(stats[0].avgScore * 10) / 10 : 0,
      recentGames,
      favoriteDifficulty: favoriteDifficulty[0]?._id || 'N/A'
    };

    console.log(`[STATS RETURN] Returning stats for user ${userId}`);
    res.json(result);
  } catch (error) {
    console.error(`[STATS ERROR] User ${userId}:`, error);
    res.status(500).json({ error: 'Failed to get player stats', details: error.message });
  }
};

// Enhanced withdrawal with validation
const withdrawFunds = async (req, res) => {
  try {
    const { amount, paymentMethod } = req.body;
    const user = req.user;

    console.log(`[WITHDRAWAL REQUEST] User ${user._id} requesting ₹${amount} withdrawal`);

    // Validate amount
    if (amount < 50) {
      console.warn(`[WITHDRAWAL ERROR] Amount too low: ₹${amount}`);
      return res.status(400).json({ error: 'Minimum withdrawal amount is ₹50' });
    }

    if (amount > 10000) {
      console.warn(`[WITHDRAWAL ERROR] Amount too high: ₹${amount}`);
      return res.status(400).json({ error: 'Maximum withdrawal amount is ₹10,000' });
    }

    // Check wallet balance (1000 coins = 1 rupee)
    const wallet = await Wallet.findOne({ user: user._id });
    if (!wallet || wallet.coins < amount * 1000) {
      console.warn(`[INSUFFICIENT FUNDS] User ${user._id} has ${wallet?.coins || 0} coins, needs ${amount * 1000}`);
      return res.status(400).json({ 
        error: 'Insufficient balance',
        currentBalance: wallet?.coins || 0,
        required: amount * 1000
      });
    }

    // Initiate withdrawal
    const withdrawalResponse = await initiateWithdrawal(user, amount, paymentMethod);

    // Update wallet balance
    wallet.coins -= amount * 1000;
    await wallet.save();

    // Record transaction
    const transaction = new Transaction({
      user: user._id,
      amount: amount * 1000,
      type: 'debit',
      description: `Withdrawal of ₹${amount} via ${paymentMethod}`,
      status: 'pending',
      reference: withdrawalResponse.referenceId
    });
    await transaction.save();

    console.log(`[WITHDRAWAL SUCCESS] User ${user._id} withdrew ₹${amount}. Transaction ${transaction._id}`);
    res.json({
      message: 'Withdrawal initiated successfully',
      transactionId: transaction._id,
      newBalance: wallet.coins,
      cashfreeResponse: withdrawalResponse
    });
  } catch (error) {
    console.error(`[WITHDRAWAL ERROR] User ${req.user?._id}:`, error);
    res.status(500).json({ 
      error: 'Withdrawal failed',
      details: error.message,
      ...(error.response && { providerError: error.response.data })
    });
  }
};

module.exports = {
  createGame,
  joinGame,
  submitCaptcha,
  getGameStatus,
  getGameHistory,
  getLeaderboard,
  getPlayerStats,
  withdrawFunds,
};