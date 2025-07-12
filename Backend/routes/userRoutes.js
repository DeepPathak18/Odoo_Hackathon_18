const express = require('express');
const { searchUsers, getUserProfileAndQuestions } = require('../controller/userController');

const router = express.Router();

router.route('/search').get(searchUsers);
router.route('/:id').get(getUserProfileAndQuestions);

module.exports = router;
