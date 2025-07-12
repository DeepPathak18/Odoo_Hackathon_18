const mongoose = require('mongoose');
const { Schema } = mongoose;

const QuestionSchema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 150
  },
  body: {
    type: String,
    required: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  upvotes: {
    type: Number,
    default: 0
  },
  downvotes: {
    type: Number,
    default: 0
  },
  acceptedAnswer: {
    type: Schema.Types.ObjectId,
    ref: 'Answer',
    default: null
  },
  answers: [{
    type: Schema.Types.ObjectId,
    ref: 'Answer'
  }],
  status: {
    type: String,
    enum: ['open', 'closed'],
    default: 'open'
  }
}, { timestamps: true });

module.exports = mongoose.model('Question', QuestionSchema);