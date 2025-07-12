const express = require('express');
const router = express.Router();
const { register, login, updateProfile } = require('../controller/authController');
const { check } = require('express-validator');
const protect = require('../middleware/auth');

router.post(
  '/register',
  [
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check(
      'password',
      'Please enter a password with 6 or more characters'
    ).isLength({ min: 6 }),
  ],
  register
);

router.post(
    '/login',
    [
        check('email', 'Please include a valid email').isEmail(),
        check('password', 'Password is required').exists(),
    ],
    login
);

router.put('/update-profile', protect, updateProfile);

module.exports = router;
