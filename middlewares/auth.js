const jwt = require('jsonwebtoken');
const User = require('../models/User');
const catchAsync = require('../utils/catchAsync');
const apiResponse = require('../utils/apiResponse');

exports.protect = catchAsync(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json(apiResponse(false, null, 'Not authorized to access this route'));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id);
    if (!req.user) {
      return res.status(401).json(apiResponse(false, null, 'User no longer exists'));
    }
    next();
  } catch (err) {
    return res.status(401).json(apiResponse(false, null, 'Not authorized to access this route'));
  }
});

exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json(
        apiResponse(false, null, `User role ${req.user.role} is not authorized to access this route`)
      );
    }
    next();
  };
};
