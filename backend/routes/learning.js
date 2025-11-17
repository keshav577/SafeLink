const express = require('express');
const router = express.Router();
const db = require('../database');
const { authenticateToken } = require('../middleware/auth');

// Get all modules
router.get('/modules', authenticateToken, (req, res) => {
  db.all(`SELECT * FROM modules ORDER BY order_index`, (err, modules) => {
    if (err) return res.status(500).json({ error: 'Failed to fetch modules' });

    // Get user progress for each module
    db.all(
      `SELECT module_id, completed, score FROM user_progress WHERE user_id = ?`,
      [req.user.id],
      (err, progress) => {
        const progressMap = {};
        progress?.forEach(p => {
          progressMap[p.module_id] = { completed: p.completed, score: p.score };
        });

        const modulesWithProgress = modules.map(m => ({
          ...m,
          progress: progressMap[m.id] || { completed: false, score: 0 }
        }));

        res.json(modulesWithProgress);
      }
    );
  });
});

// Get single module
router.get('/modules/:id', authenticateToken, (req, res) => {
  db.get(`SELECT * FROM modules WHERE id = ?`, [req.params.id], (err, module) => {
    if (err || !module) return res.status(404).json({ error: 'Module not found' });
    res.json(module);
  });
});

// Mark module as complete
router.post('/modules/:id/complete', authenticateToken, (req, res) => {
  const { score } = req.body;
  const xpGained = score || 50;

  db.run(
    `INSERT OR REPLACE INTO user_progress (user_id, module_id, completed, score, completed_at) 
     VALUES (?, ?, 1, ?, datetime('now'))`,
    [req.user.id, req.params.id, score],
    function (err) {
      if (err) return res.status(500).json({ error: 'Failed to update progress' });

      // Update user XP and level
      db.run(
        `UPDATE users SET xp = xp + ?, level = (xp + ?) / 100 + 1 WHERE id = ?`,
        [xpGained, xpGained, req.user.id],
        () => {
          res.json({ message: 'Progress saved', xpGained });
        }
      );
    }
  );
});

module.exports = router;