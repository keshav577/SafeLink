// const express = require('express');
// const router = express.Router();
// const db = require('../database');
// const { authenticateToken } = require('../middleware/auth');

// // Get all quizzes
// router.get('/', authenticateToken, (req, res) => {
//   db.all(`SELECT * FROM quizzes`, (err, quizzes) => {
//     if (err) return res.status(500).json({ error: 'Failed to fetch quizzes' });
//     res.json(quizzes.map(q => ({ ...q, questions: JSON.parse(q.questions) })));
//   });
// });

// // Get single quiz
// router.get('/:id', authenticateToken, (req, res) => {
//   db.get(`SELECT * FROM quizzes WHERE id = ?`, [req.params.id], (err, quiz) => {
//     if (err || !quiz) return res.status(404).json({ error: 'Quiz not found' });
//     res.json({ ...quiz, questions: JSON.parse(quiz.questions) });
//   });
// });

// // Submit quiz
// router.post('/:id/submit', authenticateToken, (req, res) => {
//   const { answers } = req.body;

//   db.get(`SELECT * FROM quizzes WHERE id = ?`, [req.params.id], (err, quiz) => {
//     if (err || !quiz) return res.status(404).json({ error: 'Quiz not found' });

//     const questions = JSON.parse(quiz.questions);
//     let score = 0;
//     const results = questions.map((q, i) => {
//       const correct = answers[i] === q.correct;
//       if (correct) score++;
//       return { question: q.question, correct, explanation: q.explanation };
//     });

//     const percentage = Math.round((score / questions.length) * 100);
//     const xpGained = percentage;

//     // Save attempt
//     db.run(
//       `INSERT INTO quiz_attempts (user_id, quiz_id, score, answers) VALUES (?, ?, ?, ?)`,
//       [req.user.id, req.params.id, percentage, JSON.stringify(answers)],
//       function (err) {
//         if (err) return res.status(500).json({ error: 'Failed to save attempt' });

//         // Update user XP
//         db.run(`UPDATE users SET xp = xp + ? WHERE id = ?`, [xpGained, req.user.id]);

//         res.json({ score: percentage, results, xpGained });
//       }
//     );
//   });
// });

// module.exports = router;

const express = require('express');
const router = express.Router();
const db = require('../database');
const { authenticateToken } = require('../middleware/auth');

// Get all quizzes
router.get('/', authenticateToken, (req, res) => {
  db.all(`SELECT * FROM quizzes ORDER BY id`, (err, quizzes) => {
    if (err) {
      console.error('Error fetching quizzes:', err);
      return res.status(500).json({ error: 'Failed to fetch quizzes' });
    }
    
    const formatted = quizzes.map(q => ({
      id: q.id,
      module_id: q.module_id,
      title: q.title,
      difficulty: q.difficulty,
      questions: JSON.parse(q.questions)
    }));
    
    res.json(formatted);
  });
});

// Get single quiz
router.get('/:id', authenticateToken, (req, res) => {
  db.get(`SELECT * FROM quizzes WHERE id = ?`, [req.params.id], (err, quiz) => {
    if (err) {
      console.error('Error fetching quiz:', err);
      return res.status(500).json({ error: 'Failed to fetch quiz' });
    }
    
    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }
    
    res.json({
      id: quiz.id,
      module_id: quiz.module_id,
      title: quiz.title,
      difficulty: quiz.difficulty,
      questions: JSON.parse(quiz.questions)
    });
  });
});

// Submit quiz - FIXED VERSION
router.post('/:id/submit', authenticateToken, (req, res) => {
  const { answers } = req.body;
  
  console.log('Received answers:', answers);
  console.log('Answer types:', answers.map(a => typeof a));
  
  if (!answers || !Array.isArray(answers)) {
    return res.status(400).json({ error: 'Invalid answers format' });
  }

  db.get(`SELECT * FROM quizzes WHERE id = ?`, [req.params.id], (err, quiz) => {
    if (err) {
      console.error('Error fetching quiz:', err);
      return res.status(500).json({ error: 'Failed to fetch quiz' });
    }
    
    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    const questions = JSON.parse(quiz.questions);
    console.log('Quiz questions:', questions.length);
    
    let correctCount = 0;
    
    const results = questions.map((q, index) => {
      const userAnswer = parseInt(answers[index]); // Convert to number
      const correctAnswer = parseInt(q.correct);    // Convert to number
      
      console.log(`Question ${index + 1}:`);
      console.log('  User answer:', userAnswer, typeof userAnswer);
      console.log('  Correct answer:', correctAnswer, typeof correctAnswer);
      console.log('  Match:', userAnswer === correctAnswer);
      
      const correct = userAnswer === correctAnswer;
      if (correct) {
        correctCount++;
        console.log(`  ✓ Correct! Count now: ${correctCount}`);
      } else {
        console.log(`  ✗ Incorrect`);
      }
      
      return {
        question: q.question,
        userAnswer: userAnswer,
        correctAnswer: correctAnswer,
        correct: correct,
        explanation: q.explanation,
        options: q.options
      };
    });

    const totalQuestions = questions.length;
    const score = Math.round((correctCount / totalQuestions) * 100);
    const xpGained = Math.round(score * 0.5); // 0-50 XP based on score

    console.log('Final results:');
    console.log('  Correct:', correctCount);
    console.log('  Total:', totalQuestions);
    console.log('  Score:', score);
    console.log('  XP:', xpGained);

    // Save quiz attempt
    db.run(
      `INSERT INTO quiz_attempts (user_id, quiz_id, score, answers) VALUES (?, ?, ?, ?)`,
      [req.user.id, req.params.id, score, JSON.stringify(answers)],
      function (err) {
        if (err) {
          console.error('Error saving quiz attempt:', err);
          return res.status(500).json({ error: 'Failed to save quiz attempt' });
        }

        // Update user XP and level
        db.run(
          `UPDATE users SET xp = xp + ?, level = (xp + ?) / 100 + 1 WHERE id = ?`,
          [xpGained, xpGained, req.user.id],
          (err) => {
            if (err) {
              console.error('Error updating user XP:', err);
            }

            // Check for badges
            checkQuizBadges(req.user.id, score, quiz.title);

            // Send response
            res.json({
              score: score,
              correctCount: correctCount,
              totalQuestions: totalQuestions,
              results: results,
              xpGained: xpGained
            });
          }
        );
      }
    );
  });
});

// Get user's quiz history
router.get('/history/me', authenticateToken, (req, res) => {
  db.all(
    `SELECT qa.*, q.title, q.difficulty 
     FROM quiz_attempts qa
     JOIN quizzes q ON qa.quiz_id = q.id
     WHERE qa.user_id = ?
     ORDER BY qa.completed_at DESC
     LIMIT 20`,
    [req.user.id],
    (err, attempts) => {
      if (err) {
        console.error('Error fetching quiz history:', err);
        return res.status(500).json({ error: 'Failed to fetch quiz history' });
      }
      
      res.json(attempts);
    }
  );
});

// Check and award quiz-related badges
function checkQuizBadges(userId, score, quizTitle) {
  // Perfect score badge
  if (score === 100) {
    db.run(
      `INSERT OR IGNORE INTO user_badges (user_id, badge_id)
       SELECT ?, id FROM badges WHERE requirement = 'quiz_perfect_score'`,
      [userId]
    );
  }

  // Phishing quiz badge
  if (score >= 90 && quizTitle.toLowerCase().includes('phishing')) {
    db.run(
      `INSERT OR IGNORE INTO user_badges (user_id, badge_id)
       SELECT ?, id FROM badges WHERE requirement = 'phishing_quiz_90'`,
      [userId]
    );
  }

  // Password quiz badge
  if (score === 100 && quizTitle.toLowerCase().includes('password')) {
    db.run(
      `INSERT OR IGNORE INTO user_badges (user_id, badge_id)
       SELECT ?, id FROM badges WHERE requirement = 'password_quiz_100'`,
      [userId]
    );
  }

  // Quiz champion badge (10 quizzes completed)
  db.get(
    `SELECT COUNT(*) as count FROM quiz_attempts WHERE user_id = ?`,
    [userId],
    (err, result) => {
      if (!err && result && result.count >= 10) {
        db.run(
          `INSERT OR IGNORE INTO user_badges (user_id, badge_id)
           SELECT ?, id FROM badges WHERE requirement = 'complete_10_quizzes'`,
          [userId]
        );
      }
    }
  );
}

module.exports = router;