const User = require('../models/User');
const catchAsync = require('../utils/catchAsync');
const apiResponse = require('../utils/apiResponse');

// @desc    Register a new user
// @route   POST /api/users/register
// @access  Private/Admin
exports.registerUser = catchAsync(async (req, res, next) => {
  const { name, email, password, role } = req.body;

  const userExists = await User.findOne({ email });

  if (userExists) {
    return res.status(400).json(apiResponse(false, null, 'User already exists'));
  }

  const user = await User.create({
    name,
    email,
    password,
    role: role || 'Viewer',
  });

  if (user) {
    res.status(201).json(
      apiResponse(true, {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      }, 'User registered successfully')
    );
  } else {
    res.status(400).json(apiResponse(false, null, 'Invalid user data'));
  }
});

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
exports.getUsers = catchAsync(async (req, res, next) => {
  const users = await User.find({});
  res.status(200).json(apiResponse(true, users, 'Users fetched successfully'));
});

// @desc    Update user role
// @route   PATCH /api/users/:id/role
// @access  Private/Admin
exports.updateUserRole = catchAsync(async (req, res, next) => {
  const { role } = req.body;
  if (!['Viewer', 'Analyst', 'Admin'].includes(role)) {
    return res.status(400).json(apiResponse(false, null, 'Invalid role'));
  }

  const user = await User.findById(req.params.id);

  if (user) {
    user.role = role;
    const updatedUser = await user.save();
    res.status(200).json(apiResponse(true, updatedUser, 'User role updated successfully'));
  } else {
    res.status(404).json(apiResponse(false, null, 'User not found'));
  }
});

// @desc    Update user status
// @route   PATCH /api/users/:id/status
// @access  Private/Admin
exports.updateUserStatus = catchAsync(async (req, res, next) => {
  const { status } = req.body;
  if (!['active', 'inactive'].includes(status)) {
    return res.status(400).json(apiResponse(false, null, 'Invalid status'));
  }

  const user = await User.findById(req.params.id);

  if (user) {
    user.status = status;
    const updatedUser = await user.save();
    res.status(200).json(apiResponse(true, updatedUser, 'User status updated successfully'));
  } else {
    res.status(404).json(apiResponse(false, null, 'User not found'));
  }
});

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
exports.deleteUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (user) {
    user.isDeleted = true;
    await user.save();
    res.status(200).json(apiResponse(true, {}, 'User deleted successfully'));
  } else {
    res.status(404).json(apiResponse(false, null, 'User not found'));
  }
});
