const User = require('../models/User');
const catchAsync = require('../utils/catchAsync');
const apiResponse = require('../utils/apiResponse');
const jwt = require('jsonwebtoken');

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
exports.loginUser = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json(apiResponse(false, null, 'Please provide an email and password'));
  }

  // Check for user
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.matchPassword(password))) {
    return res.status(401).json(apiResponse(false, null, 'Invalid credentials'));
  }

  if (user.status !== 'active') {
    return res.status(401).json(apiResponse(false, null, 'User account is inactive'));
  }

  res.status(200).json(
    apiResponse(true, {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    }, 'Login successful')
  );
});
