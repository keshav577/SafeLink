const express = require('express');
const router = express.Router();
const db = require('../database');
const { authenticateToken, isAdmin } = require('../middleware/auth');

// Get all users (admin only)
router.get('/users', authenticateToken, isAdmin, (req, res) => {
  db.all(`SELECT id, username, email, skill_level, xp, level, created_at FROM users`, (err, users) => {
    if (err) return res.status(500).json({ error: 'Failed to fetch users' });
    res.json(users);
  });
});

// Add new module (admin only)
router.post('/modules', authenticateToken, isAdmin, (req, res) => {
  const { title, icon, difficulty, estimated_time, category, content } = req.body;

  db.run(
    `INSERT INTO modules (title, icon, difficulty, estimated_time, category, content, order_index) 
     VALUES (?, ?, ?, ?, ?, ?, (SELECT COALESCE(MAX(order_index), 0) + 1 FROM modules))`,
    [title, icon, difficulty, estimated_time, category, JSON.stringify(content)],
    function (err) {
      if (err) return res.status(500).json({ error: 'Failed to add module' });
      res.json({ message: 'Module added', id: this.lastID });
    }
  );
});

// Delete module (admin only)
router.delete('/modules/:id', authenticateToken, isAdmin, (req, res) => {
  db.run(`DELETE FROM modules WHERE id = ?`, [req.params.id], function (err) {
    if (err) return res.status(500).json({ error: 'Failed to delete module' });
    res.json({ message: 'Module deleted' });
  });
});

// Get analytics (admin only)
router.get('/analytics', authenticateToken, isAdmin, (req, res) => {
  db.get(`SELECT COUNT(*) as totalUsers FROM users`, (err, users) => {
    db.get(`SELECT COUNT(*) as totalQuizzes FROM quiz_attempts`, (err, quizzes) => {
      db.get(`SELECT COUNT(*) as completedLessons FROM user_progress WHERE completed = 1`, (err, lessons) => {
        res.json({
          totalUsers: users?.totalUsers || 0,
          totalQuizAttempts: quizzes?.totalQuizzes || 0,
          completedLessons: lessons?.completedLessons || 0
        });
      });
    });
  });
});

module.exports = router;