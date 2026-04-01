const express = require('express');
const {
  registerUser,
  getUsers,
  updateUserRole,
  updateUserStatus,
  deleteUser,
} = require('../controllers/userController');
const { protect, authorize } = require('../middlewares/auth');
const { body } = require('express-validator');
const validate = require('../middlewares/validate');

const router = express.Router();

// Apply auth and admin authorization to all user routes
router.use(protect);
router.use(authorize('Admin'));

router.post(
  '/register',
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Please include a valid email'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    validate,
  ],
  registerUser
);

router.route('/')
  .get(getUsers);

router.patch('/:id/role', updateUserRole);
router.patch('/:id/status', updateUserStatus);
router.delete('/:id', deleteUser);

module.exports = router;
