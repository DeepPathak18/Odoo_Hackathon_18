const User = require('../models/User');
const Question = require('../models/Question');

/**
 * @desc    Search users by name
 * @route   GET /api/users/search
 * @access  Public
 */
exports.searchUsers = async (req, res) => {
  try {
    const { name } = req.query;

    if (!name) {
      return res.status(400).json({ success: false, error: 'Please provide a name to search' });
    }

    const users = await User.find({
      name: { $regex: name, $options: 'i' }, // Case-insensitive search
    }).select('-password');

    res.status(200).json({ success: true, count: users.length, data: users });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

/**
 * @desc    Get user profile and their questions
 * @route   GET /api/users/:id
 * @access  Public
 */
exports.getUserProfileAndQuestions = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    const questions = await Question.find({ author: req.params.id })
      .populate('author', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: { user, questions } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};
