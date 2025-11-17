const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../database');
const { SECRET_KEY } = require('../middleware/auth');

// Register
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, skillLevel } = req.body;

    console.log('Registration attempt:', { username, email, skillLevel });

    // Validation
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (username.length < 3) {
      return res.status(400).json({ error: 'Username must be at least 3 characters' });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Check if user already exists
    db.get(
      `SELECT * FROM users WHERE email = ? OR username = ?`,
      [email, username],
      async (err, existingUser) => {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ error: 'Database error' });
        }

        if (existingUser) {
          if (existingUser.email === email) {
            return res.status(400).json({ error: 'Email already registered' });
          }
          if (existingUser.username === username) {
            return res.status(400).json({ error: 'Username already taken' });
          }
        }

        try {
          // Hash password
          const hashedPassword = await bcrypt.hash(password, 10);

          // Insert user
          db.run(
            `INSERT INTO users (username, email, password, skill_level) VALUES (?, ?, ?, ?)`,
            [username, email, hashedPassword, skillLevel || 'beginner'],
            function (err) {
              if (err) {
                console.error('Insert error:', err);
                if (err.message.includes('UNIQUE')) {
                  return res.status(400).json({ error: 'User already exists' });
                }
                return res.status(500).json({ error: 'Failed to create account' });
              }

              const userId = this.lastID;
              console.log('User created successfully:', userId);

              // Generate JWT token
              const token = jwt.sign(
                { id: userId, email: email },
                SECRET_KEY,
                { expiresIn: '7d' }
              );

              res.status(201).json({
                message: 'Registration successful',
                token,
                userId,
                username
              });
            }
          );
        } catch (hashError) {
          console.error('Hashing error:', hashError);
          res.status(500).json({ error: 'Server error during registration' });
        }
      }
    );
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Login
router.post('/login', (req, res) => {
  try {
    const { email, password } = req.body;

    console.log('Login attempt:', { email });

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    db.get(
      `SELECT * FROM users WHERE email = ?`,
      [email],
      async (err, user) => {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ error: 'Database error' });
        }

        if (!user) {
          return res.status(400).json({ error: 'Invalid email or password' });
        }

        try {
          const validPassword = await bcrypt.compare(password, user.password);
          
          if (!validPassword) {
            return res.status(400).json({ error: 'Invalid email or password' });
          }

          // Generate JWT token
          const token = jwt.sign(
            { id: user.id, email: user.email },
            SECRET_KEY,
            { expiresIn: '7d' }
          );

          console.log('Login successful:', user.id);

          res.json({
            message: 'Login successful',
            token,
            userId: user.id,
            username: user.username
          });
        } catch (compareError) {
          console.error('Password comparison error:', compareError);
          res.status(500).json({ error: 'Authentication error' });
        }
      }
    );
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Verify token (optional - for checking if user is logged in)
router.get('/verify', (req, res) => {
  const token = req.headers['authorization']?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const verified = jwt.verify(token, SECRET_KEY);
    
    db.get(
      `SELECT id, username, email, xp, level FROM users WHERE id = ?`,
      [verified.id],
      (err, user) => {
        if (err || !user) {
          return res.status(404).json({ error: 'User not found' });
        }
        res.json({ user });
      }
    );
  } catch (err) {
    res.status(403).json({ error: 'Invalid token' });
  }
});

module.exports = router;