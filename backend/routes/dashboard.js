// const express = require('express');
// const router = express.Router();
// const db = require('../database');
// const { authenticateToken } = require('../middleware/auth');

// // Get user dashboard data
// router.get('/', authenticateToken, (req, res) => {
//   db.get(`SELECT * FROM users WHERE id = ?`, [req.user.id], (err, user) => {
//     if (err || !user) return res.status(404).json({ error: 'User not found' });

//     // Get completed lessons
//     db.get(
//       `SELECT COUNT(*) as count FROM user_progress WHERE user_id = ? AND completed = 1`,
//       [req.user.id],
//       (err, lessons) => {
//         // Get quiz attempts
//         db.get(
//           `SELECT COUNT(*) as count FROM quiz_attempts WHERE user_id = ? AND score >= 70`,
//           [req.user.id],
//           (err, quizzes) => {
//             // Get badges
//             db.all(
//               `SELECT b.* FROM badges b 
//                JOIN user_badges ub ON b.id = ub.badge_id 
//                WHERE ub.user_id = ?`,
//               [req.user.id],
//               (err, badges) => {
//                 // Calculate security score
//                 const securityScore = Math.min(100, 
//                   (lessons?.count || 0) * 5 + 
//                   (quizzes?.count || 0) * 10 + 
//                   (badges?.length || 0) * 5
//                 );

//                 res.json({
//                   user: {
//                     username: user.username,
//                     email: user.email,
//                     level: user.level,
//                     xp: user.xp,
//                     securityScore
//                   },
//                   stats: {
//                     lessonsCompleted: lessons?.count || 0,
//                     quizzesPassed: quizzes?.count || 0,
//                     badges: badges || []
//                   }
//                 });
//               }
//             );
//           }
//         );
//       }
//     );
//   });
// });

// // Get user badges
// router.get('/badges', authenticateToken, (req, res) => {
//   db.all(
//     `SELECT b.*, ub.earned_at FROM badges b 
//      JOIN user_badges ub ON b.id = ub.badge_id 
//      WHERE ub.user_id = ?`,
//     [req.user.id],
//     (err, badges) => {
//       if (err) return res.status(500).json({ error: 'Failed to fetch badges' });
//       res.json(badges);
//     }
//   );
// });

// module.exports = router;
const express = require('express');
const router = express.Router();
const db = require('../database');
const { authenticateToken } = require('../middleware/auth');

// Get user dashboard data
router.get('/', authenticateToken, (req, res) => {
  db.get(`SELECT * FROM users WHERE id = ?`, [req.user.id], (err, user) => {
    if (err || !user) return res.status(404).json({ error: 'User not found' });

    // Get completed lessons count
    db.get(
      `SELECT COUNT(*) as count FROM user_progress WHERE user_id = ? AND completed = 1`,
      [req.user.id],
      (err, lessons) => {
        // Get quiz attempts count (score >= 70 is passing)
        db.get(
          `SELECT COUNT(DISTINCT quiz_id) as count FROM quiz_attempts WHERE user_id = ? AND score >= 70`,
          [req.user.id],
          (err, quizzes) => {
            // Get all quiz attempts for average score
            db.get(
              `SELECT AVG(score) as avg_score FROM quiz_attempts WHERE user_id = ?`,
              [req.user.id],
              (err, avgScore) => {
                // Get badges
                db.all(
                  `SELECT b.* FROM badges b 
                   JOIN user_badges ub ON b.id = ub.badge_id 
                   WHERE ub.user_id = ?`,
                  [req.user.id],
                  (err, badges) => {
                    // Get simulation attempts count
                    db.get(
                      `SELECT COUNT(*) as count FROM simulation_attempts WHERE user_id = ?`,
                      [req.user.id],
                      (err, simulations) => {
                        // Calculate security score
                        const lessonsCompleted = lessons?.count || 0;
                        const quizzesPassed = quizzes?.count || 0;
                        const averageQuizScore = avgScore?.avg_score || 0;
                        const badgesEarned = badges?.length || 0;
                        const simulationsCompleted = simulations?.count || 0;

                        const securityScore = Math.min(100, 
                          (lessonsCompleted * 5) + 
                          (quizzesPassed * 8) + 
                          Math.round(averageQuizScore * 0.3) +
                          (badgesEarned * 4) +
                          (simulationsCompleted * 3)
                        );

                        res.json({
                          user: {
                            username: user.username,
                            email: user.email,
                            level: user.level,
                            xp: user.xp,
                            securityScore: securityScore
                          },
                          stats: {
                            lessonsCompleted: lessonsCompleted,
                            quizzesPassed: quizzesPassed,
                            averageQuizScore: Math.round(averageQuizScore),
                            badges: badges || [],
                            simulationsCompleted: simulationsCompleted || 0
                          }
                        });
                      }
                    );
                  }
                );
              }
            );
          }
        );
      }
    );
  });
});

// Get user badges
router.get('/badges', authenticateToken, (req, res) => {
  db.all(
    `SELECT b.*, ub.earned_at FROM badges b 
     JOIN user_badges ub ON b.id = ub.badge_id 
     WHERE ub.user_id = ?
     ORDER BY ub.earned_at DESC`,
    [req.user.id],
    (err, badges) => {
      if (err) return res.status(500).json({ error: 'Failed to fetch badges' });
      res.json(badges);
    }
  );
});

// Get recent activity
router.get('/activity', authenticateToken, (req, res) => {
  const query = `
    SELECT 'lesson' as type, m.title, m.icon, up.completed_at as date, up.score
    FROM user_progress up
    JOIN modules m ON up.module_id = m.id
    WHERE up.user_id = ? AND up.completed = 1
    UNION ALL
    SELECT 'quiz' as type, q.title, '🧠' as icon, qa.completed_at as date, qa.score
    FROM quiz_attempts qa
    JOIN quizzes q ON qa.quiz_id = q.id
    WHERE qa.user_id = ?
    UNION ALL
    SELECT 'simulation' as type, s.title, '🎮' as icon, sa.completed_at as date, sa.score
    FROM simulation_attempts sa
    JOIN simulations s ON sa.simulation_id = s.id
    WHERE sa.user_id = ?
    ORDER BY date DESC
    LIMIT 10
  `;
  
  db.all(query, [req.user.id, req.user.id, req.user.id], (err, activities) => {
    if (err) {
      console.error('Error fetching activity:', err);
      return res.status(500).json({ error: 'Failed to fetch activity' });
    }
    res.json(activities || []);
  });
});

module.exports = router;