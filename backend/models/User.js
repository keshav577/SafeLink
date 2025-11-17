// const mongoose = require('mongoose');
// const bcrypt = require('bcryptjs');

// const userSchema = new mongoose.Schema({
//   username: {
//     type: String,
//     required: true,
//     unique: true,
//     trim: true
//   },
//   email: {
//     type: String,
//     required: true,
//     unique: true,
//     lowercase: true
//   },
//   password: {
//     type: String,
//     required: true
//   },
//   skillLevel: {
//     type: String,
//     enum: ['beginner', 'intermediate', 'advanced'],
//     default: 'beginner'
//   },
//   learningGoals: [String],
//   securityScore: {
//     type: Number,
//     default: 0,
//     min: 0,
//     max: 100
//   },
//   level: {
//     type: Number,
//     default: 1
//   },
//   xp: {
//     type: Number,
//     default: 0
//   },
//   badges: [{
//     name: String,
//     icon: String,
//     earnedAt: Date
//   }],
//   completedLessons: [{
//     lessonId: String,
//     completedAt: Date,
//     score: Number
//   }],
//   completedQuizzes: [{
//     quizId: String,
//     completedAt: Date,
//     score: Number,
//     attempts: Number
//   }],
//   dailyStreak: {
//     type: Number,
//     default: 0
//   },
//   lastActive: {
//     type: Date,
//     default: Date.now
//   },
//   preferences: {
//     darkMode: { type: Boolean, default: true },
//     language: { type: String, default: 'en' },
//     accessibility: {
//       largeText: { type: Boolean, default: false },
//       dyslexiaMode: { type: Boolean, default: false }
//     }
//   },
//   isAdmin: {
//     type: Boolean,
//     default: false
//   }
// }, {
//   timestamps: true
// });

// // Hash password before saving
// userSchema.pre('save', async function(next) {
//   if (!this.isModified('password')) return next();
//   this.password = await bcrypt.hash(this.password, 10);
//   next();
// });

// // Compare password method
// userSchema.methods.comparePassword = async function(candidatePassword) {
//   return await bcrypt.compare(candidatePassword, this.password);
// };

// module.exports = mongoose.model('User', userSchema);