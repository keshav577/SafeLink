const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');

const db = new sqlite3.Database('./safelink.db', (err) => {
  if (err) {
    console.error('Database connection error:', err);
  } else {
    console.log('✅ Connected to SQLite database');
    initializeDatabase();
  }
});

// function initializeDatabase() {
//   db.serialize(() => {
//     // Users table
//     db.run(`CREATE TABLE IF NOT EXISTS users (
//       id INTEGER PRIMARY KEY AUTOINCREMENT,
//       username TEXT UNIQUE NOT NULL,
//       email TEXT UNIQUE NOT NULL,
//       password TEXT NOT NULL,
//       skill_level TEXT DEFAULT 'beginner',
//       security_score INTEGER DEFAULT 0,
//       xp INTEGER DEFAULT 0,
//       level INTEGER DEFAULT 1,
//       created_at DATETIME DEFAULT CURRENT_TIMESTAMP
//     )`);

//     // Learning modules
//     db.run(`CREATE TABLE IF NOT EXISTS modules (
//       id INTEGER PRIMARY KEY AUTOINCREMENT,
//       title TEXT NOT NULL,
//       icon TEXT,
//       difficulty TEXT,
//       estimated_time TEXT,
//       category TEXT,
//       content TEXT,
//       order_index INTEGER
//     )`);

//     // User progress
//     db.run(`CREATE TABLE IF NOT EXISTS user_progress (
//       id INTEGER PRIMARY KEY AUTOINCREMENT,
//       user_id INTEGER,
//       module_id INTEGER,
//       completed BOOLEAN DEFAULT 0,
//       score INTEGER,
//       completed_at DATETIME,
//       FOREIGN KEY(user_id) REFERENCES users(id),
//       FOREIGN KEY(module_id) REFERENCES modules(id)
//     )`);

//     // Quizzes
//     db.run(`CREATE TABLE IF NOT EXISTS quizzes (
//       id INTEGER PRIMARY KEY AUTOINCREMENT,
//       module_id INTEGER,
//       title TEXT NOT NULL,
//       questions TEXT NOT NULL,
//       difficulty TEXT,
//       FOREIGN KEY(module_id) REFERENCES modules(id)
//     )`);

//     // Quiz attempts
//     db.run(`CREATE TABLE IF NOT EXISTS quiz_attempts (
//       id INTEGER PRIMARY KEY AUTOINCREMENT,
//       user_id INTEGER,
//       quiz_id INTEGER,
//       score INTEGER,
//       answers TEXT,
//       completed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
//       FOREIGN KEY(user_id) REFERENCES users(id),
//       FOREIGN KEY(quiz_id) REFERENCES quizzes(id)
//     )`);

//     // Badges
//     db.run(`CREATE TABLE IF NOT EXISTS badges (
//       id INTEGER PRIMARY KEY AUTOINCREMENT,
//       name TEXT NOT NULL,
//       description TEXT,
//       icon TEXT,
//       requirement TEXT
//     )`);

//     // User badges
//     db.run(`CREATE TABLE IF NOT EXISTS user_badges (
//       id INTEGER PRIMARY KEY AUTOINCREMENT,
//       user_id INTEGER,
//       badge_id INTEGER,
//       earned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
//       FOREIGN KEY(user_id) REFERENCES users(id),
//       FOREIGN KEY(badge_id) REFERENCES badges(id)
//     )`);

//     // Simulations
//     db.run(`CREATE TABLE IF NOT EXISTS simulations (
//       id INTEGER PRIMARY KEY AUTOINCREMENT,
//       title TEXT NOT NULL,
//       type TEXT,
//       data TEXT NOT NULL,
//       difficulty TEXT
//     )`);

//     // Simulation attempts
//     db.run(`CREATE TABLE IF NOT EXISTS simulation_attempts (
//       id INTEGER PRIMARY KEY AUTOINCREMENT,
//       user_id INTEGER,
//       simulation_id INTEGER,
//       score INTEGER,
//       decisions TEXT,
//       completed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
//       FOREIGN KEY(user_id) REFERENCES users(id),
//       FOREIGN KEY(simulation_id) REFERENCES simulations(id)
//     )`);

//     // Insert default data
//     insertDefaultData();
//   });
// }

// function insertDefaultData() {
//   // Insert modules
//   const modules = [
//     { title: '🔐 Password Security Basics', icon: '🔐', difficulty: 'beginner', time: '15 min', category: 'passwords', order: 1 },
//     { title: '🐟 How to Identify Phishing', icon: '🐟', difficulty: 'beginner', time: '20 min', category: 'phishing', order: 2 },
//     { title: '📱 Mobile Safety Tips', icon: '📱', difficulty: 'intermediate', time: '25 min', category: 'mobile', order: 3 },
//     { title: '🌐 Safe Browsing Practices', icon: '🌐', difficulty: 'beginner', time: '18 min', category: 'browsing', order: 4 },
//     { title: '🎭 Social Engineering Defense', icon: '🎭', difficulty: 'advanced', time: '30 min', category: 'social', order: 5 }
//   ];

//   modules.forEach(mod => {
//     db.run(`INSERT OR IGNORE INTO modules (title, icon, difficulty, estimated_time, category, order_index, content) 
//             VALUES (?, ?, ?, ?, ?, ?, ?)`,
//       [mod.title, mod.icon, mod.difficulty, mod.time, mod.category, mod.order, JSON.stringify({ lessons: [] })]);
//   });

//   // Insert badges
//   const badges = [
//     { name: 'First Steps', desc: 'Complete your first lesson', icon: '🎯', req: 'complete_1_lesson' },
//     { name: 'Phishing Hunter', desc: 'Ace the phishing quiz', icon: '🎣', req: 'phishing_quiz_90' },
//     { name: 'Password Master', desc: 'Perfect password quiz score', icon: '🔑', req: 'password_quiz_100' },
//     { name: 'Week Warrior', desc: 'Login 7 days in a row', icon: '🔥', req: 'streak_7' },
//     { name: 'Quiz Champion', desc: 'Complete 10 quizzes', icon: '🏆', req: 'complete_10_quizzes' }
//   ];

//   badges.forEach(badge => {
//     db.run(`INSERT OR IGNORE INTO badges (name, description, icon, requirement) VALUES (?, ?, ?, ?)`,
//       [badge.name, badge.desc, badge.icon, badge.req]);
//   });

//   // Insert quizzes
//   const quizzes = [
//     {
//       module_id: 1,
//       title: '🔐 Password Strength Quiz',
//       difficulty: 'beginner',
//       questions: JSON.stringify([
//         {
//           question: 'What makes a password strong?',
//           options: ['Using your name', 'Mix of letters, numbers & symbols', 'Simple words', 'Repeating characters'],
//           correct: 1,
//           explanation: 'Strong passwords combine uppercase, lowercase, numbers, and symbols.'
//         },
//         {
//           question: 'How long should a secure password be?',
//           options: ['4-6 characters', '8-10 characters', '12+ characters', 'Length doesn\'t matter'],
//           correct: 2,
//           explanation: 'Passwords should be at least 12 characters long for better security.'
//         },
//         {
//           question: 'Should you reuse passwords across accounts?',
//           options: ['Yes, for convenience', 'No, never', 'Only for unimportant accounts', 'Only similar passwords'],
//           correct: 1,
//           explanation: 'Never reuse passwords. If one account is breached, all accounts become vulnerable.'
//         }
//       ])
//     },
//     {
//       module_id: 2,
//       title: '🐟 Phishing Spotting Challenge',
//       difficulty: 'beginner',
//       questions: JSON.stringify([
//         {
//           question: 'Which is a sign of a phishing email?',
//           options: ['Urgent action required', 'Personalized greeting', 'Company logo present', 'Expected message'],
//           correct: 0,
//           explanation: 'Phishing emails often create urgency to make you act without thinking.'
//         },
//         {
//           question: 'What should you check in email links?',
//           options: ['Link text only', 'Actual URL on hover', 'Email subject', 'Sender name'],
//           correct: 1,
//           explanation: 'Always hover over links to see the actual URL before clicking.'
//         },
//         {
//           question: 'Your "bank" emails asking for password. You should:',
//           options: ['Reply with password', 'Click the link provided', 'Call bank directly', 'Forward to friends'],
//           correct: 2,
//           explanation: 'Banks never ask for passwords via email. Always contact them directly.'
//         }
//       ])
//     }
//   ];

//   quizzes.forEach(quiz => {
//     db.run(`INSERT OR IGNORE INTO quizzes (module_id, title, difficulty, questions) VALUES (?, ?, ?, ?)`,
//       [quiz.module_id, quiz.title, quiz.difficulty, quiz.questions]);
//   });

//   // Insert simulations
//   const simulations = [
//     {
//       title: 'Phishing Email Detection',
//       type: 'email',
//       difficulty: 'beginner',
//       data: JSON.stringify({
//         emails: [
//           {
//             from: 'security@paypa1-secure.com',
//             subject: 'URGENT: Verify your account now!',
//             body: 'Your account will be suspended. Click here immediately.',
//             isPhishing: true,
//             redFlags: ['Misspelled domain', 'Urgent language', 'Suspicious link']
//           },
//           {
//             from: 'notifications@github.com',
//             subject: 'New pull request on your repository',
//             body: 'User123 opened a pull request on your project.',
//             isPhishing: false,
//             redFlags: []
//           }
//         ]
//       })
//     },
//     {
//       title: 'Suspicious Link Analyzer',
//       type: 'url',
//       difficulty: 'intermediate',
//       data: JSON.stringify({
//         urls: [
//           { url: 'http://paypal-security-verify.ru/login', safe: false, reason: 'Wrong domain (.ru), misspelling' },
//           { url: 'https://www.paypal.com/signin', safe: true, reason: 'Official PayPal domain with HTTPS' },
//           { url: 'http://amaz0n.com/deals', safe: false, reason: 'Zero instead of O, no HTTPS' }
//         ]
//       })
//     }
//   ];

//   simulations.forEach(sim => {
//     db.run(`INSERT OR IGNORE INTO simulations (title, type, difficulty, data) VALUES (?, ?, ?, ?)`,
//       [sim.title, sim.type, sim.difficulty, sim.data]);
//   });

//   console.log('✅ Default data inserted');
// }
function initializeDatabase() {
  db.serialize(() => {
    // Users table
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      skill_level TEXT DEFAULT 'beginner',
      security_score INTEGER DEFAULT 0,
      xp INTEGER DEFAULT 0,
      level INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Learning modules
    db.run(`CREATE TABLE IF NOT EXISTS modules (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT UNIQUE NOT NULL,
      icon TEXT,
      difficulty TEXT,
      estimated_time TEXT,
      category TEXT,
      content TEXT,
      order_index INTEGER
    )`);

    // User progress
    db.run(`CREATE TABLE IF NOT EXISTS user_progress (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      module_id INTEGER,
      completed BOOLEAN DEFAULT 0,
      score INTEGER,
      completed_at DATETIME,
      UNIQUE(user_id, module_id),
      FOREIGN KEY(user_id) REFERENCES users(id),
      FOREIGN KEY(module_id) REFERENCES modules(id)
    )`);

    // Quizzes
    db.run(`CREATE TABLE IF NOT EXISTS quizzes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      module_id INTEGER,
      title TEXT NOT NULL,
      questions TEXT NOT NULL,
      difficulty TEXT,
      FOREIGN KEY(module_id) REFERENCES modules(id)
    )`);

    // Quiz attempts
    db.run(`CREATE TABLE IF NOT EXISTS quiz_attempts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      quiz_id INTEGER,
      score INTEGER,
      answers TEXT,
      completed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id),
      FOREIGN KEY(quiz_id) REFERENCES quizzes(id)
    )`);

    // Badges
    db.run(`CREATE TABLE IF NOT EXISTS badges (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      description TEXT,
      icon TEXT,
      requirement TEXT
    )`);

    // User badges
    db.run(`CREATE TABLE IF NOT EXISTS user_badges (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      badge_id INTEGER,
      earned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, badge_id),
      FOREIGN KEY(user_id) REFERENCES users(id),
      FOREIGN KEY(badge_id) REFERENCES badges(id)
    )`);

    // Simulations
    db.run(`CREATE TABLE IF NOT EXISTS simulations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      type TEXT,
      data TEXT NOT NULL,
      difficulty TEXT
    )`);

    // Simulation attempts
    db.run(`CREATE TABLE IF NOT EXISTS simulation_attempts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      simulation_id INTEGER,
      score INTEGER,
      decisions TEXT,
      completed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id),
      FOREIGN KEY(simulation_id) REFERENCES simulations(id)
    )`);

    // Notifications table
    db.run(`CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      type TEXT DEFAULT 'info',
      read BOOLEAN DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id)
    )`);

    // Insert default data after tables are created
    setTimeout(() => {
      insertDefaultData();
    }, 500);
  });
}
function insertDefaultData() {
  // Clear existing data first to prevent duplicates
  db.serialize(() => {
    db.run(`DELETE FROM modules`, (err) => {
      if (err) console.error('Error clearing modules:', err);
    });

    db.run(`DELETE FROM quizzes`, (err) => {
      if (err) console.error('Error clearing quizzes:', err);
    });

    db.run(`DELETE FROM badges`, (err) => {
      if (err) console.error('Error clearing badges:', err);
    });

    // Wait a bit for deletions to complete
    setTimeout(() => {
      insertModules();
      insertBadges();
      insertQuizzes();
      insertSimulations();
    }, 100);
  });
}

// Insert modules
function insertModules() {
  const modules = [
    { 
      title: '🔐 Password Security Basics', 
      icon: '🔐', 
      difficulty: 'beginner', 
      time: '15 min', 
      category: 'passwords', 
      order: 1,
      content: JSON.stringify({
        description: 'Learn how to create and manage strong passwords',
        topics: ['Password strength', 'Password managers', 'Two-factor authentication']
      })
    },
    { 
      title: '🐟 How to Identify Phishing', 
      icon: '🐟', 
      difficulty: 'beginner', 
      time: '20 min', 
      category: 'phishing', 
      order: 2,
      content: JSON.stringify({
        description: 'Recognize and avoid phishing attacks',
        topics: ['Email red flags', 'Link verification', 'Reporting phishing']
      })
    },
    { 
      title: '📱 Mobile Safety Tips', 
      icon: '📱', 
      difficulty: 'intermediate', 
      time: '25 min', 
      category: 'mobile', 
      order: 3,
      content: JSON.stringify({
        description: 'Secure your mobile devices and data',
        topics: ['App permissions', 'Public WiFi safety', 'Device encryption']
      })
    },
    { 
      title: '🌐 Safe Browsing Practices', 
      icon: '🌐', 
      difficulty: 'beginner', 
      time: '18 min', 
      category: 'browsing', 
      order: 4,
      content: JSON.stringify({
        description: 'Navigate the web securely',
        topics: ['HTTPS verification', 'Cookie management', 'Private browsing']
      })
    },
    { 
      title: '🎭 Social Engineering Defense', 
      icon: '🎭', 
      difficulty: 'advanced', 
      time: '30 min', 
      category: 'social', 
      order: 5,
      content: JSON.stringify({
        description: 'Protect yourself from manipulation tactics',
        topics: ['Pretexting', 'Baiting', 'Tailgating', 'Impersonation']
      })
    },
    { 
      title: '🔒 Data Privacy Fundamentals', 
      icon: '🔒', 
      difficulty: 'intermediate', 
      time: '22 min', 
      category: 'privacy', 
      order: 6,
      content: JSON.stringify({
        description: 'Understand and protect your personal data',
        topics: ['Data collection', 'Privacy settings', 'GDPR basics']
      })
    },
    { 
      title: '🛡️ Network Security Basics', 
      icon: '🛡️', 
      difficulty: 'intermediate', 
      time: '28 min', 
      category: 'network', 
      order: 7,
      content: JSON.stringify({
        description: 'Secure your home and work networks',
        topics: ['Router security', 'VPN usage', 'Firewall basics']
      })
    },
    { 
      title: '💾 Backup and Recovery', 
      icon: '💾', 
      difficulty: 'beginner', 
      time: '20 min', 
      category: 'backup', 
      order: 8,
      content: JSON.stringify({
        description: 'Protect your data with proper backups',
        topics: ['Backup strategies', 'Cloud storage', 'Recovery procedures']
      })
    }
  ];

  modules.forEach(mod => {
    db.run(
      `INSERT INTO modules (title, icon, difficulty, estimated_time, category, order_index, content) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [mod.title, mod.icon, mod.difficulty, mod.time, mod.category, mod.order, mod.content],
      (err) => {
        if (err) {
          console.error('Error inserting module:', mod.title, err);
        }
      }
    );
  });

  console.log('✅ Modules inserted');
}

// Insert badges
function insertBadges() {
  const badges = [
    { name: 'First Steps', desc: 'Complete your first lesson', icon: '🎯', req: 'complete_1_lesson' },
    { name: 'Getting Started', desc: 'Complete 5 lessons', icon: '📚', req: 'complete_5_lessons' },
    { name: 'Phishing Hunter', desc: 'Ace the phishing quiz with 90%+', icon: '🎣', req: 'phishing_quiz_90' },
    { name: 'Password Master', desc: 'Perfect password quiz score', icon: '🔑', req: 'password_quiz_100' },
    { name: 'Quiz Champion', desc: 'Complete 10 quizzes', icon: '🏆', req: 'complete_10_quizzes' },
    { name: 'Perfect Score', desc: 'Get 100% on any quiz', icon: '💯', req: 'quiz_perfect_score' },
    { name: 'Simulation Expert', desc: 'Complete 5 simulations', icon: '🎮', req: 'complete_5_simulations' },
    { name: 'Flawless Victory', desc: 'Perfect score on a simulation', icon: '⭐', req: 'simulation_perfect' },
    { name: 'Week Warrior', desc: 'Login 7 days in a row', icon: '🔥', req: 'streak_7' },
    { name: 'Rising Star', desc: 'Reach level 10', icon: '🌟', req: 'reach_level_10' }
  ];

  badges.forEach(badge => {
    db.run(
      `INSERT INTO badges (name, description, icon, requirement) VALUES (?, ?, ?, ?)`,
      [badge.name, badge.desc, badge.icon, badge.req],
      (err) => {
        if (err) {
          console.error('Error inserting badge:', badge.name, err);
        }
      }
    );
  });

  console.log('✅ Badges inserted');
}

// Insert quizzes
function insertQuizzes() {
  const quizzes = [
    {
      module_id: 1,
      title: '🔐 Password Strength Quiz',
      difficulty: 'beginner',
      questions: JSON.stringify([
        {
          question: 'What makes a password strong?',
          options: [
            'Using your name and birthdate',
            'Mix of uppercase, lowercase, numbers, and symbols',
            'Simple words that are easy to remember',
            'Repeating the same character multiple times'
          ],
          correct: 1,
          explanation: 'Strong passwords combine uppercase letters, lowercase letters, numbers, and special symbols. This makes them much harder to crack.'
        },
        {
          question: 'How long should a secure password be?',
          options: [
            '4-6 characters',
            '8-10 characters',
            '12+ characters',
            'Length doesn\'t matter'
          ],
          correct: 2,
          explanation: 'Passwords should be at least 12 characters long. Longer passwords are exponentially harder to crack through brute force attacks.'
        },
        {
          question: 'Should you reuse passwords across different accounts?',
          options: [
            'Yes, for convenience',
            'No, never reuse passwords',
            'Only for unimportant accounts',
            'Only use similar passwords'
          ],
          correct: 1,
          explanation: 'Never reuse passwords! If one account is breached, hackers will try that password on all your other accounts.'
        },
        {
          question: 'What is the best way to manage multiple strong passwords?',
          options: [
            'Write them down on paper',
            'Use the same password with small variations',
            'Use a password manager',
            'Keep them in a text file on your computer'
          ],
          correct: 2,
          explanation: 'Password managers securely encrypt and store all your passwords. You only need to remember one master password.'
        },
        {
          question: 'Which password is the strongest?',
          options: [
            'password123',
            'JohnSmith1990',
            'T7$mK9#pL2@qR5',
            'ilovemydog'
          ],
          correct: 2,
          explanation: 'T7$mK9#pL2@qR5 is strongest because it\'s long, random, and includes uppercase, lowercase, numbers, and symbols.'
        }
      ])
    },
    {
      module_id: 2,
      title: '🐟 Phishing Detection Challenge',
      difficulty: 'beginner',
      questions: JSON.stringify([
        {
          question: 'Which is a common sign of a phishing email?',
          options: [
            'Personalized greeting with your name',
            'Urgent action required or threats',
            'Expected message from a known sender',
            'Professional formatting and grammar'
          ],
          correct: 1,
          explanation: 'Phishing emails often create urgency ("Act now!") to pressure you into making quick decisions without thinking carefully.'
        },
        {
          question: 'What should you check before clicking a link in an email?',
          options: [
            'The link text only',
            'The sender\'s display name',
            'The actual URL by hovering over it',
            'The subject line'
          ],
          correct: 2,
          explanation: 'Always hover over links to see the actual URL before clicking. Phishers often disguise malicious links with legitimate-looking text.'
        },
        {
          question: 'Your "bank" emails asking for your password. What should you do?',
          options: [
            'Reply with your password',
            'Click the link and enter your credentials',
            'Call your bank directly using their official number',
            'Forward the email to friends'
          ],
          correct: 2,
          explanation: 'Banks NEVER ask for passwords via email. Always contact them directly using official contact information from their website.'
        },
        {
          question: 'Which email address looks suspicious?',
          options: [
            'support@paypal.com',
            'security@paypa1-verify.com',
            'noreply@amazon.com',
            'alerts@bankofamerica.com'
          ],
          correct: 1,
          explanation: 'paypa1-verify.com is suspicious - it uses "1" instead of "l" and has an unusual domain. Always check for misspellings in sender addresses.'
        },
        {
          question: 'What is "spear phishing"?',
          options: [
            'Phishing targeting fish enthusiasts',
            'Targeted phishing using personal information',
            'Phishing using weaponized attachments',
            'Mass phishing emails sent to everyone'
          ],
          correct: 1,
          explanation: 'Spear phishing is highly targeted phishing that uses personal information about you to make the attack more convincing and credible.'
        }
      ])
    },
    {
      module_id: 3,
      title: '📱 Mobile Security Essentials',
      difficulty: 'intermediate',
      questions: JSON.stringify([
        {
          question: 'Why should you be cautious with app permissions?',
          options: [
            'Apps never misuse permissions',
            'Apps can access sensitive data they don\'t need',
            'Permissions don\'t matter on mobile devices',
            'All apps are verified as safe'
          ],
          correct: 1,
          explanation: 'Apps can request unnecessary permissions to collect your personal data. Always review what permissions apps request and deny those that aren\'t needed.'
        },
        {
          question: 'What is the biggest risk of using public WiFi?',
          options: [
            'Slower internet speed',
            'Data interception by hackers',
            'Automatic downloads',
            'Phone battery drain'
          ],
          correct: 1,
          explanation: 'Public WiFi is often unencrypted, allowing hackers to intercept your data. Always use a VPN on public networks.'
        },
        {
          question: 'What should you do before downloading a mobile app?',
          options: [
            'Download immediately if it looks good',
            'Check reviews, permissions, and developer reputation',
            'Only check the number of downloads',
            'Trust the app store completely'
          ],
          correct: 1,
          explanation: 'Always research apps before downloading. Check reviews, required permissions, and developer information to avoid malicious apps.'
        },
        {
          question: 'How often should you update your mobile operating system?',
          options: [
            'Never, updates can break things',
            'Once a year',
            'As soon as updates are available',
            'Only when forced'
          ],
          correct: 2,
          explanation: 'Update immediately when available. Updates often contain critical security patches that protect against newly discovered vulnerabilities.'
        }
      ])
    },
    {
      module_id: 4,
      title: '🌐 Safe Browsing Mastery',
      difficulty: 'beginner',
      questions: JSON.stringify([
        {
          question: 'What does HTTPS indicate?',
          options: [
            'The website is 100% safe',
            'The connection is encrypted',
            'The website is government approved',
            'The website has no viruses'
          ],
          correct: 1,
          explanation: 'HTTPS means the connection between you and the website is encrypted. However, it doesn\'t guarantee the website is legitimate or safe.'
        },
        {
          question: 'What is a browser cookie?',
          options: [
            'A virus that infects your browser',
            'A small file that stores website data',
            'A type of malware',
            'A security feature'
          ],
          correct: 1,
          explanation: 'Cookies are small files that websites store on your device to remember your preferences and track your activity.'
        },
        {
          question: 'Why should you clear your browser cache regularly?',
          options: [
            'To make browsing faster',
            'To remove stored personal data',
            'To update your browser',
            'It\'s not necessary'
          ],
          correct: 1,
          explanation: 'Clearing cache removes stored personal data and can help protect your privacy, especially on shared computers.'
        },
        {
          question: 'What is private/incognito browsing?',
          options: [
            'Makes you completely anonymous online',
            'Prevents local history and cookies from being saved',
            'Hides your IP address',
            'Blocks all websites from tracking you'
          ],
          correct: 1,
          explanation: 'Private browsing doesn\'t save local history or cookies, but it doesn\'t make you anonymous. Your ISP and websites can still track you.'
        }
      ])
    }
  ];

  quizzes.forEach(quiz => {
    db.run(
      `INSERT INTO quizzes (module_id, title, difficulty, questions) VALUES (?, ?, ?, ?)`,
      [quiz.module_id, quiz.title, quiz.difficulty, quiz.questions],
      (err) => {
        if (err) {
          console.error('Error inserting quiz:', quiz.title, err);
        }
      }
    );
  });

  console.log('✅ Quizzes inserted');
}

// Insert simulations
function insertSimulations() {
  const simulations = [
    {
      title: 'Phishing Email Detection',
      type: 'email',
      difficulty: 'beginner',
      data: JSON.stringify({
        emails: [
          {
            from: 'security@paypa1-secure.com',
            subject: 'URGENT: Verify your account now!',
            body: 'Your account will be suspended. Click here immediately.',
            isPhishing: true,
            redFlags: ['Misspelled domain', 'Urgent language', 'Suspicious link']
          },
          {
            from: 'notifications@github.com',
            subject: 'New pull request on your repository',
            body: 'User123 opened a pull request on your project.',
            isPhishing: false,
            redFlags: []
          }
        ]
      })
    },
    {
      title: 'Suspicious Link Analyzer',
      type: 'url',
      difficulty: 'intermediate',
      data: JSON.stringify({
        urls: [
          { url: 'http://paypal-security-verify.ru/login', safe: false, reason: 'Wrong domain (.ru), misspelling' },
          { url: 'https://www.paypal.com/signin', safe: true, reason: 'Official PayPal domain with HTTPS' },
          { url: 'http://amaz0n.com/deals', safe: false, reason: 'Zero instead of O, no HTTPS' }
        ]
      })
    }
  ];

  simulations.forEach(sim => {
    db.run(
      `INSERT INTO simulations (title, type, difficulty, data) VALUES (?, ?, ?, ?)`,
      [sim.title, sim.type, sim.difficulty, sim.data],
      (err) => {
        if (err) {
          console.error('Error inserting simulation:', sim.title, err);
        }
      }
    );
  });

  console.log('✅ Simulations inserted');
}

module.exports = db;

// Insert quizzes (replace existing quiz insertion)
const quizzes = [
  {
    module_id: 1,
    title: '🔐 Password Strength Quiz',
    difficulty: 'beginner',
    questions: JSON.stringify([
      {
        question: 'What makes a password strong?',
        options: [
          'Using your name and birthdate',
          'Mix of uppercase, lowercase, numbers, and symbols',
          'Simple words that are easy to remember',
          'Repeating the same character multiple times'
        ],
        correct: 1,
        explanation: 'Strong passwords combine uppercase letters, lowercase letters, numbers, and special symbols. This makes them much harder to crack.'
      },
      {
        question: 'How long should a secure password be?',
        options: [
          '4-6 characters',
          '8-10 characters',
          '12+ characters',
          'Length doesn\'t matter'
        ],
        correct: 2,
        explanation: 'Passwords should be at least 12 characters long. Longer passwords are exponentially harder to crack through brute force attacks.'
      },
      {
        question: 'Should you reuse passwords across different accounts?',
        options: [
          'Yes, for convenience',
          'No, never reuse passwords',
          'Only for unimportant accounts',
          'Only use similar passwords'
        ],
        correct: 1,
        explanation: 'Never reuse passwords! If one account is breached, hackers will try that password on all your other accounts.'
      },
      {
        question: 'What is the best way to manage multiple strong passwords?',
        options: [
          'Write them down on paper',
          'Use the same password with small variations',
          'Use a password manager',
          'Keep them in a text file on your computer'
        ],
        correct: 2,
        explanation: 'Password managers securely encrypt and store all your passwords. You only need to remember one master password.'
      },
      {
        question: 'Which password is the strongest?',
        options: [
          'password123',
          'JohnSmith1990',
          'T7$mK9#pL2@qR5',
          'ilovemydog'
        ],
        correct: 2,
        explanation: 'T7$mK9#pL2@qR5 is strongest because it\'s long, random, and includes uppercase, lowercase, numbers, and symbols.'
      }
    ])
  },
  {
    module_id: 2,
    title: '🐟 Phishing Detection Challenge',
    difficulty: 'beginner',
    questions: JSON.stringify([
      {
        question: 'Which is a common sign of a phishing email?',
        options: [
          'Personalized greeting with your name',
          'Urgent action required or threats',
          'Expected message from a known sender',
          'Professional formatting and grammar'
        ],
        correct: 1,
        explanation: 'Phishing emails often create urgency ("Act now!") to pressure you into making quick decisions without thinking carefully.'
      },
      {
        question: 'What should you check before clicking a link in an email?',
        options: [
          'The link text only',
          'The sender\'s display name',
          'The actual URL by hovering over it',
          'The subject line'
        ],
        correct: 2,
        explanation: 'Always hover over links to see the actual URL before clicking. Phishers often disguise malicious links with legitimate-looking text.'
      },
      {
        question: 'Your "bank" emails asking for your password. What should you do?',
        options: [
          'Reply with your password',
          'Click the link and enter your credentials',
          'Call your bank directly using their official number',
          'Forward the email to friends'
        ],
        correct: 2,
        explanation: 'Banks NEVER ask for passwords via email. Always contact them directly using official contact information from their website.'
      },
      {
        question: 'Which email address looks suspicious?',
        options: [
          'support@paypal.com',
          'security@paypa1-verify.com',
          'noreply@amazon.com',
          'alerts@bankofamerica.com'
        ],
        correct: 1,
        explanation: 'paypa1-verify.com is suspicious - it uses "1" instead of "l" and has an unusual domain. Always check for misspellings in sender addresses.'
      },
      {
        question: 'What is "spear phishing"?',
        options: [
          'Phishing targeting fish enthusiasts',
          'Targeted phishing using personal information',
          'Phishing using weaponized attachments',
          'Mass phishing emails sent to everyone'
        ],
        correct: 1,
        explanation: 'Spear phishing is highly targeted phishing that uses personal information about you to make the attack more convincing and credible.'
      }
    ])
  },
  {
    module_id: 3,
    title: '📱 Mobile Security Essentials',
    difficulty: 'intermediate',
    questions: JSON.stringify([
      {
        question: 'Why should you be cautious with app permissions?',
        options: [
          'Apps never misuse permissions',
          'Apps can access sensitive data they don\'t need',
          'Permissions don\'t matter on mobile devices',
          'All apps are verified as safe'
        ],
        correct: 1,
        explanation: 'Apps can request unnecessary permissions to collect your personal data. Always review what permissions apps request and deny those that aren\'t needed.'
      },
      {
        question: 'What is the biggest risk of using public WiFi?',
        options: [
          'Slower internet speed',
          'Data interception by hackers',
          'Automatic downloads',
          'Phone battery drain'
        ],
        correct: 1,
        explanation: 'Public WiFi is often unencrypted, allowing hackers to intercept your data. Always use a VPN on public networks.'
      },
      {
        question: 'What should you do before downloading a mobile app?',
        options: [
          'Download immediately if it looks good',
          'Check reviews, permissions, and developer reputation',
          'Only check the number of downloads',
          'Trust the app store completely'
        ],
        correct: 1,
        explanation: 'Always research apps before downloading. Check reviews, required permissions, and developer information to avoid malicious apps.'
      },
      {
        question: 'How often should you update your mobile operating system?',
        options: [
          'Never, updates can break things',
          'Once a year',
          'As soon as updates are available',
          'Only when forced'
        ],
        correct: 2,
        explanation: 'Update immediately when available. Updates often contain critical security patches that protect against newly discovered vulnerabilities.'
      }
    ])
  },
  {
    module_id: 4,
    title: '🌐 Safe Browsing Mastery',
    difficulty: 'beginner',
    questions: JSON.stringify([
      {
        question: 'What does HTTPS indicate?',
        options: [
          'The website is 100% safe',
          'The connection is encrypted',
          'The website is government approved',
          'The website has no viruses'
        ],
        correct: 1,
        explanation: 'HTTPS means the connection between you and the website is encrypted. However, it doesn\'t guarantee the website is legitimate or safe.'
      },
      {
        question: 'What is a browser cookie?',
        options: [
          'A virus that infects your browser',
          'A small file that stores website data',
          'A type of malware',
          'A security feature'
        ],
        correct: 1,
        explanation: 'Cookies are small files that websites store on your device to remember your preferences and track your activity.'
      },
      {
        question: 'Why should you clear your browser cache regularly?',
        options: [
          'To make browsing faster',
          'To remove stored personal data',
          'To update your browser',
          'It\'s not necessary'
        ],
        correct: 1,
        explanation: 'Clearing cache removes stored personal data and can help protect your privacy, especially on shared computers.'
      },
      {
        question: 'What is private/incognito browsing?',
        options: [
          'Makes you completely anonymous online',
          'Prevents local history and cookies from being saved',
          'Hides your IP address',
          'Blocks all websites from tracking you'
        ],
        correct: 1,
        explanation: 'Private browsing doesn\'t save local history or cookies, but it doesn\'t make you anonymous. Your ISP and websites can still track you.'
      }
    ])
  }
];

// Clear existing quizzes first
db.run(`DELETE FROM quizzes`, () => {
  quizzes.forEach(quiz => {
    db.run(
      `INSERT INTO quizzes (module_id, title, difficulty, questions) VALUES (?, ?, ?, ?)`,
      [quiz.module_id, quiz.title, quiz.difficulty, quiz.questions],
      (err) => {
        if (err) console.error('Error inserting quiz:', err);
      }
    );
  });
  console.log('✅ Quizzes inserted');
});