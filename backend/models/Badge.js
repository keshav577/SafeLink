const mongoose = require('mongoose');

const badgeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  description: String,
  icon: String,
  requirement: {
    type: {
      type: String,
      enum: ['lessons', 'quizzes', 'score', 'streak', 'simulation', 'special']
    },
    count: Number,
    category: String
  },
  rarity: {
    type: String,
    enum: ['common', 'rare', 'epic', 'legendary'],
    default: 'common'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Badge', badgeSchema);