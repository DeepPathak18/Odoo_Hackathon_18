const express = require('express');
const {
  createQuestion,
  getQuestions,
  getQuestion,
  updateQuestion,
  deleteQuestion,
  addAnswer,
  acceptAnswer,
  upvoteQuestion,
  downvoteQuestion,
  upvoteAnswer,
  downvoteAnswer,
  addComment,
  getCommentsForQuestion,
  getTrendingTags,
} = require('../controller/questionController');

const protect = require('../middleware/auth'); 

const router = express.Router();

router.route('/').post(protect, createQuestion).get(getQuestions);
router.route('/trending-tags').get(getTrendingTags); // Moved this route before /:id
router.route('/:id').get(getQuestion).put(protect, updateQuestion).delete(protect, deleteQuestion);

router.route('/:questionId/answers').post(protect, addAnswer);
router.route('/:questionId/answers/:answerId/accept').put(protect, acceptAnswer);

router.route('/:id/upvote').put(protect, upvoteQuestion);
router.route('/:id/downvote').put(protect, downvoteQuestion);

router.route('/answers/:id/upvote').put(protect, upvoteAnswer);
router.route('/answers/:id/downvote').put(protect, downvoteAnswer);

router.route('/:questionId/comments').post(protect, addComment).get(getCommentsForQuestion);

module.exports = router;