const Question = require('../models/Question');
const Answer = require('../models/Answer');
const Comment = require('../models/Comment');

/**
 * @desc    Create a new question
 * @route   POST /api/questions
 * @access  Private
 */
exports.createQuestion = async (req, res) => {
  try {
    const { title, body, tags } = req.body;
    // Assuming req.user.id is set by an authentication middleware
    const author = req.user.id;

    const question = new Question({
      title,
      body,
      tags,
      author,
    });

    await question.save();

    res.status(201).json({ success: true, data: question });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

/**
 * @desc    Get all questions
 * @route   GET /api/questions
 * @access  Public
 */
exports.getQuestions = async (req, res) => {
  try {
    const questions = await Question.find()
      .populate('author', 'name')
      .populate({
        path: 'comments',
        populate: { path: 'author', select: 'name' },
      })
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: questions.length, data: questions });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

/**
 * @desc    Get single question
 * @route   GET /api/questions/:id
 * @access  Public
 */
exports.getQuestion = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id)
      .populate('author', 'name')
      .populate({
        path: 'answers',
        populate: { path: 'author', select: 'name' },
      })
      .populate('acceptedAnswer')
      .populate({
        path: 'comments',
        populate: { path: 'author', select: 'name' },
      });

    if (!question) {
      return res.status(404).json({ success: false, error: 'Question not found' });
    }

    res.status(200).json({ success: true, data: question });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

/**
 * @desc    Update question
 * @route   PUT /api/questions/:id
 * @access  Private
 */
exports.updateQuestion = async (req, res) => {
  try {
    let question = await Question.findById(req.params.id);

    if (!question) {
      return res.status(404).json({ success: false, error: 'Question not found' });
    }

    // Make sure user is question owner
    if (question.author.toString() !== req.user.id) {
      return res.status(401).json({ success: false, error: 'Not authorized to update this question' });
    }

    question = await Question.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({ success: true, data: question });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

/**
 * @desc    Delete question
 * @route   DELETE /api/questions/:id
 * @access  Private
 */
exports.deleteQuestion = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);

    if (!question) {
      return res.status(404).json({ success: false, error: 'Question not found' });
    }

    // Make sure user is question owner
    if (question.author.toString() !== req.user.id) {
      return res.status(401).json({ success: false, error: 'Not authorized to delete this question' });
    }

    // Delete associated answers
    await Answer.deleteMany({ question: req.params.id });

    await question.deleteOne();

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

/**
 * @desc    Add an answer to a question
 * @route   POST /api/questions/:questionId/answers
 * @access  Private
 */
exports.addAnswer = async (req, res) => {
  try {
    const question = await Question.findById(req.params.questionId);

    if (!question) {
      return res.status(404).json({ success: false, error: 'Question not found' });
    }

    const answer = new Answer({
      body: req.body.body,
      author: req.user.id,
      question: req.params.questionId,
    });

    await answer.save();

    question.answers.push(answer._id);
    await question.save();

    res.status(201).json({ success: true, data: answer });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

/**
 * @desc    Accept an answer for a question
 * @route   PUT /api/questions/:questionId/answers/:answerId/accept
 * @access  Private
 */
exports.acceptAnswer = async (req, res) => {
  try {
    const question = await Question.findById(req.params.questionId);

    if (!question) {
      return res.status(404).json({ success: false, error: 'Question not found' });
    }

    // Make sure user is question owner
    if (question.author.toString() !== req.user.id) {
      return res.status(401).json({ success: false, error: 'Not authorized to accept an answer for this question' });
    }

    const answer = await Answer.findById(req.params.answerId);

    if (!answer) {
      return res.status(404).json({ success: false, error: 'Answer not found' });
    }

    if (answer.question.toString() !== req.params.questionId) {
      return res.status(400).json({ success: false, error: 'Answer does not belong to this question' });
    }

    question.acceptedAnswer = req.params.answerId;
    await question.save();

    res.status(200).json({ success: true, data: question });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

/**
 * @desc    Add a comment to a question
 * @route   POST /api/questions/:questionId/comments
 * @access  Private
 */
exports.addComment = async (req, res) => {
  try {
    const question = await Question.findById(req.params.questionId);

    if (!question) {
      return res.status(404).json({ success: false, error: 'Question not found' });
    }

    const comment = new Comment({
      body: req.body.body,
      author: req.user.id,
      question: req.params.questionId,
    });

    await comment.save();

    question.comments.push(comment._id);
    await question.save();

    res.status(201).json({ success: true, data: comment });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

/**
 * @desc    Get comments for a question
 * @route   GET /api/questions/:questionId/comments
 * @access  Public
 */
exports.getCommentsForQuestion = async (req, res) => {
  try {
    const comments = await Comment.find({ question: req.params.questionId }).populate('author', 'name');

    res.status(200).json({ success: true, count: comments.length, data: comments });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

/**
 * @desc    Upvote a question
 * @route   PUT /api/questions/:id/upvote
 * @access  Private
 */
exports.upvoteQuestion = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);

    if (!question) {
      return res.status(404).json({ success: false, error: 'Question not found' });
    }

    if (question.votes.upvotes.includes(req.user.id)) {
      return res.status(400).json({ success: false, error: 'You have already upvoted this question' });
    }

    if (question.votes.downvotes.includes(req.user.id)) {
      question.votes.downvotes = question.votes.downvotes.filter(
        (userId) => userId.toString() !== req.user.id.toString()
      );
    }

    question.votes.upvotes.push(req.user.id);
    await question.save();

    res.status(200).json({ success: true, data: question });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

/**
 * @desc    Downvote a question
 * @route   PUT /api/questions/:id/downvote
 * @access  Private
 */
exports.downvoteQuestion = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);

    if (!question) {
      return res.status(404).json({ success: false, error: 'Question not found' });
    }

    if (question.votes.downvotes.includes(req.user.id)) {
      return res.status(400).json({ success: false, error: 'You have already downvoted this question' });
    }

    if (question.votes.upvotes.includes(req.user.id)) {
      question.votes.upvotes = question.votes.upvotes.filter(
        (userId) => userId.toString() !== req.user.id.toString()
      );
    }

    question.votes.downvotes.push(req.user.id);
    await question.save();

    res.status(200).json({ success: true, data: question });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

/**
 * @desc    Upvote an answer
 * @route   PUT /api/answers/:id/upvote
 * @access  Private
 */
exports.upvoteAnswer = async (req, res) => {
  try {
    const answer = await Answer.findById(req.params.id);

    if (!answer) {
      return res.status(404).json({ success: false, error: 'Answer not found' });
    }

    if (answer.votes.upvotes.includes(req.user.id)) {
      return res.status(400).json({ success: false, error: 'You have already upvoted this answer' });
    }

    if (answer.votes.downvotes.includes(req.user.id)) {
      answer.votes.downvotes = answer.votes.downvotes.filter(
        (userId) => userId.toString() !== req.user.id.toString()
      );
    }

    answer.votes.upvotes.push(req.user.id);
    await answer.save();

    res.status(200).json({ success: true, data: answer });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

/**
 * @desc    Downvote an answer
 * @route   PUT /api/answers/:id/downvote
 * @access  Private
 */
exports.downvoteAnswer = async (req, res) => {
  try {
    const answer = await Answer.findById(req.params.id);

    if (!answer) {
      return res.status(404).json({ success: false, error: 'Answer not found' });
    }

    if (answer.votes.downvotes.includes(req.user.id)) {
      return res.status(400).json({ success: false, error: 'You have already downvoted this answer' });
    }

    if (answer.votes.upvotes.includes(req.user.id)) {
      answer.votes.upvotes = answer.votes.upvotes.filter(
        (userId) => userId.toString() !== req.user.id.toString()
      );
    }

    answer.votes.downvotes.push(req.user.id);
    await answer.save();

    res.status(200).json({ success: true, data: answer });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

/**
 * @desc    Get trending tags
 * @route   GET /api/trending-tags
 * @access  Public
 */
exports.getTrendingTags = async (req, res) => {
  try {
    const trendingTags = await Question.aggregate([
      { $unwind: '$tags' },
      { $group: { _id: '$tags', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }, // Adjust the limit as needed
    ]);

    res.status(200).json({ success: true, data: trendingTags });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};
