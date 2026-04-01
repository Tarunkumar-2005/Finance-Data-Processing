const express = require('express');
const { loginUser } = require('../controllers/authController');
const { body } = require('express-validator');
const validate = require('../middlewares/validate');

const router = express.Router();

router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Please include a valid email'),
    body('password').exists().withMessage('Password is required'),
    validate,
  ],
  loginUser
);

module.exports = router;
