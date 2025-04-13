const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Wallet = require('../models/Wallet');
const Game = require('../models/Game')

const register = async (req, res) => {
  try {
    const { email, password, name, mobile } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already in use' });
    }

    // Create new user
    const user = new User({ email, password, name, mobile });
    await user.save();

    // Create wallet with 200 coins
    const wallet = new Wallet({ user: user._id });
    await wallet.save();

    // Generate token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    });

    res.status(201).json({ token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    });

    res.json({ token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};



const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    const wallet = await Wallet.findOne({ user: req.user._id });

    if (!user || !wallet) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get game stats
    const gamesPlayed = await Game.countDocuments({
      $or: [{ player1: user._id }, { player2: user._id }],
      status: 'completed',
    });

    const gamesWon = await Game.countDocuments({
      winner: user._id,
      status: 'completed',
    });

    res.json({
      user,
      wallet: {
        coins: wallet.coins,
        balance: wallet.balance
      },
      stats: {
        gamesPlayed,
        gamesWon,
        winRate: gamesPlayed > 0 ? Math.round((gamesWon / gamesPlayed) * 100) : 0,
      },
    });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
};

// Logout function
const logout = (req, res) => {
  try {
    // Clear the JWT cookie (if you're using cookies)
    res.clearCookie('token', { httpOnly: true });

    // You can also invalidate the token server-side, if you're keeping a token blacklist.
    // Example: Add logic to blacklist the token or remove it from your active sessions.

    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Failed to log out' });
  }
};

module.exports = { register, login, getProfile, logout };