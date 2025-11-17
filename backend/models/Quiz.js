// const mongoose = require('mongoose');

// const quizSchema = new mongoose.Schema({
//   title: {
//     type: String,
//     required: true
//   },
//   category: {
//     type: String,
//     required: true,
//     enum: ['phishing', 'passwords', 'social-engineering', 'browsing', 'general']
//   },
//   difficulty: {
//     type: String,
//     enum: ['beginner', 'intermediate', 'advanced'],
//     default: 'beginner'
//   },
//   questions: [{
//     id: String,
//     question: String,
//     type: {
//       type: String,
//       enum: ['multiple-choice', 'drag-drop', 'fill-blank', 'spot-link', 'true-false']
//     },
//     options: [String],
//     correctAnswer: mongoose.Schema.Types.Mixed,
//     explanation: String,
//     riskLevel: {
//       type: String,
//       enum: ['low', 'medium', 'high', 'critical']
//     },
//     points: {
//       type: Number,
//       default: 10
//     }
//   }],
//   timeLimit: Number, // in seconds
//   passingScore: {
//     type: Number,
//     default: 70
//   },
//   xpReward: {
//     type: Number,
//     default: 50
//   }
// }, {
//   timestamps: true
// });

// module.exports = mongoose.model('Quiz', quizSchema);