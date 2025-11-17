// SafeLink Main JavaScript
const API_URL = 'http://localhost:5000/api';
let currentUser = null;
let authToken = null;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  authToken = localStorage.getItem('token');
  if (authToken) {
    loadUserData();
  }
  
  // Check which page we're on and initialize accordingly
  const path = window.location.pathname;
  if (path.includes('dashboard')) initDashboard();
  if (path.includes('quiz')) initQuiz();
  if (path.includes('learning')) initLearning();
});

// API Helper Functions
async function apiCall(endpoint, method = 'GET', data = null) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
    }
  };

  if (authToken) {
    options.headers['Authorization'] = `Bearer ${authToken}`;
  }

  if (data) {
    options.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(`${API_URL}${endpoint}`, options);
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error || 'API call failed');
    }
    
    return result;
  } catch (error) {
    showNotification(error.message, 'error');
    throw error;
  }
}

// Authentication
async function register(userData) {
  try {
    const result = await apiCall('/auth/register', 'POST', userData);
    authToken = result.token;
    localStorage.setItem('token', authToken);
    currentUser = result.user;
    showNotification('Registration successful!', 'success');
    window.location.href = 'learning-hub.html';
  } catch (error) {
    console.error('Registration error:', error);
  }
}

async function login(email, password) {
  try {
    const result = await apiCall('/auth/login', 'POST', { email, password });
    authToken = result.token;
    localStorage.setItem('token', authToken);
    currentUser = result.user;
    showNotification('Login successful!', 'success');
    window.location.href = 'dashboard.html';
  } catch (error) {
    console.error('Login error:', error);
  }
}

function logout() {
  localStorage.removeItem('token');
  authToken = null;
  currentUser = null;
  window.location.href = 'index.html';
}

async function loadUserData() {
  try {
    currentUser = await apiCall('/auth/me');
    updateUserBadge();
  } catch (error) {
    console.error('Failed to load user data:', error);
    logout();
  }
}

function updateUserBadge() {
  const userBadge = document.querySelector('.user-badge');
  if (userBadge && currentUser) {
    const initial = currentUser.username.charAt(0).toUpperCase();
    userBadge.innerHTML = `
      <div class="user-avatar">${initial}</div>
      <div>
        <div style="font-size: 14px;">${currentUser.username}</div>
        <div class="level-badge">Level ${currentUser.level}</div>
      </div>
    `;
  }
}

// Dashboard Functions
async function initDashboard() {
  try {
    const dashboardData = await apiCall('/dashboard');
    renderDashboard(dashboardData);
    updateDailyStreak();
  } catch (error) {
    console.error('Dashboard init error:', error);
  }
}

function renderDashboard(data) {
  // Update stats
  document.getElementById('security-score').textContent = data.user.securityScore + '%';
  document.getElementById('lessons-completed').textContent = data.stats.lessonsCompleted;
  document.getElementById('quizzes-completed').textContent = data.stats.quizzesCompleted;
  document.getElementById('total-xp').textContent = data.user.xp;
  document.getElementById('current-level').textContent = data.user.level;
  document.getElementById('daily-streak').textContent = data.user.dailyStreak;

  // Update XP bar
  const xpPercentage = (data.user.xp % 500) / 500 * 100;
  document.getElementById('xp-progress').style.width = xpPercentage + '%';

  // Render badges
  renderBadges(data.badges);

  // Render progress
  renderProgress(data.progress);

  // Render weaknesses and strengths
  renderInsights(data.weaknesses, data.strengths);

  // Render recommended lessons
  renderRecommended(data.recommended);
}

function renderBadges(badges) {
  const badgeContainer = document.getElementById('badge-collection');
  if (!badgeContainer) return;

  badgeContainer.innerHTML = badges.map(badge => `
    <div class="badge-item" title="${badge.name}">
      <div class="badge-icon">${badge.icon}</div>
      <div class="badge-name">${badge.name}</div>
    </div>
  `).join('');
}

function renderProgress(progress) {
  const progressContainer = document.getElementById('progress-modules');
  if (!progressContainer) return;

  progressContainer.innerHTML = progress.map(p => `
    <div class="progress-item">
      <div class="progress-header">
        <span>${p.moduleName}</span>
        <span>${p.progress}%</span>
      </div>
      <div class="progress-bar">
        <div class="progress-fill" style="width: ${p.progress}%"></div>
      </div>
      ${p.completed ? '<span class="badge badge-success">✓ Completed</span>' : ''}
    </div>
  `).join('');
}

// Learning Hub Functions
async function initLearning() {
  try {
    const modules = await apiCall('/learning/modules');
    renderLearningModules(modules);
  } catch (error) {
    console.error('Learning init error:', error);
  }
}

function renderLearningModules(modules) {
  const container = document.getElementById('learning-modules');
  if (!container) return;

  container.innerHTML = modules.map(module => `
    <div class="card" onclick="openModule('${module.id}')">
      <div class="card-header">
        <h3 class="card-title">${module.title}</h3>
        <span class="badge badge-${module.difficulty}">${module.difficulty}</span>
      </div>
      <div class="card-body">
        ${module.description}
      </div>
      <div class="card-footer">
        <span>⏱ ${module.estimatedTime}</span>
        <span>${module.progress}% Complete</span>
      </div>
      <div class="progress-bar">
        <div class="progress-fill" style="width: ${module.progress}%"></div>
      </div>
    </div>
  `).join('');
}

async function openModule(moduleId) {
  window.location.href = `lesson.html?module=${moduleId}`;
}

async function completeLesson(moduleId, lessonId) {
  try {
    await apiCall('/learning/progress', 'POST', {
      moduleId,
      lessonId,
      timeSpent: 300, // Track actual time
      completed: true
    });
    showNotification('Lesson completed! +100 XP', 'success');
  } catch (error) {
    console.error('Complete lesson error:', error);
  }
}

// Quiz Functions
let currentQuiz = null;
let currentQuestionIndex = 0;
let userAnswers = {};
let quizTimer = null;

async function initQuiz() {
  const urlParams = new URLSearchParams(window.location.search);
  const quizId = urlParams.get('id');
  
  if (quizId) {
    await loadQuiz(quizId);
  } else {
    await loadQuizList();
  }
}

async function loadQuizList() {
  try {
    const quizzes = await apiCall('/quiz');
    renderQuizList(quizzes);
  } catch (error) {
    console.error('Load quiz list error:', error);
  }
}

function renderQuizList(quizzes) {
  const container = document.getElementById('quiz-list');
  if (!container) return;

  container.innerHTML = quizzes.map(quiz => `
    <div class="card" onclick="startQuiz('${quiz._id}')">
      <div class="card-header">
        <h3 class="card-title">${quiz.title}</h3>
        <span class="badge badge-${quiz.difficulty}">${quiz.difficulty}</span>
      </div>
      <div class="card-body">
        Category: ${quiz.category}<br>
        Questions: ${quiz.questions.length}<br>
        Passing Score: ${quiz.passingScore}%
      </div>
      <div class="card-footer">
        <span>⏱ ${quiz.timeLimit ? Math.floor(quiz.timeLimit / 60) + ' min' : 'No limit'}</span>
        <span>🏆 ${quiz.xpReward} XP</span>
      </div>
    </div>
  `).join('');
}

async function loadQuiz(quizId) {
  try {
    currentQuiz = await apiCall(`/quiz/${quizId}`);
    renderQuiz();
    if (currentQuiz.timeLimit) {
      startQuizTimer(currentQuiz.timeLimit);
    }
  } catch (error) {
    console.error('Load quiz error:', error);
  }
}

function renderQuiz() {
  const container = document.getElementById('quiz-container');
  if (!container || !currentQuiz) return;

  const question = currentQuiz.questions[currentQuestionIndex];
  
  container.innerHTML = `
    <div class="quiz-header">
      <h2>${currentQuiz.title}</h2>
      <div class="quiz-progress">
        Question ${currentQuestionIndex + 1} of ${currentQuiz.questions.length}
      </div>
      ${currentQuiz.timeLimit ? '<div class="timer" id="quiz-timer"></div>' : ''}
    </div>
    
    <div class="quiz-question">
      <h3>${question.question}</h3>
      <div class="quiz-options">
        ${renderQuizOptions(question)}
      </div>
    </div>
    
    <div class="quiz-navigation">
      ${currentQuestionIndex > 0 ? '<button class="btn btn-secondary" onclick="previousQuestion()">Previous</button>' : ''}
      ${currentQuestionIndex < currentQuiz.questions.length - 1 
        ? '<button class="btn btn-primary" onclick="nextQuestion()">Next</button>'
        : '<button class="btn btn-success" onclick="submitQuiz()">Submit Quiz</button>'}
    </div>
  `;
}

function renderQuizOptions(question) {
  if (question.type === 'multiple-choice') {
    return question.options.map((option, index) => `
      <div class="quiz-option" onclick="selectOption('${question.id}', '${option}')">
        ${option}
      </div>
    `).join('');
  }
  // Add other question types (drag-drop, fill-blank, etc.)
  return '';
}

function selectOption(questionId, answer) {
  userAnswers[questionId] = answer;
  
  // Visual feedback
  document.querySelectorAll('.quiz-option').forEach(opt => {
    opt.classList.remove('selected');
  });
  event.target.classList.add('selected');
}

function nextQuestion() {
  if (currentQuestionIndex < currentQuiz.questions.length - 1) {
    currentQuestionIndex++;
    renderQuiz();
  }
}

function previousQuestion() {
  if (currentQuestionIndex > 0) {
    currentQuestionIndex--;
    renderQuiz();
  }
}

async function submitQuiz() {
  if (quizTimer) clearInterval(quizTimer);
  
  try {
    const result = await apiCall(`/quiz/${currentQuiz._id}/submit`, 'POST', {
      answers: userAnswers
    });
    
    showQuizResults(result);
  } catch (error) {
    console.error('Submit quiz error:', error);
  }
}

function showQuizResults(result) {
  const container = document.getElementById('quiz-container');
  
  container.innerHTML = `
    <div class="quiz-results">
      <h2>${result.passed ? '🎉 Congratulations!' : '😔 Keep Trying!'}</h2>
      <div class="result-score">
        <div class="stat-value">${Math.round(result.score)}%</div>
        <div class="stat-label">Your Score</div>
      </div>
      
      <div class="result-stats">
        <div>Correct Answers: ${result.correctAnswers} / ${result.totalQuestions}</div>
        <div>XP Earned: ${result.xpEarned}</div>
        <div>New Level: ${result.newLevel}</div>
      </div>
      
      <div class="result-details">
        <h3>Detailed Results:</h3>
        ${result.results.map((r, i) => `
          <div class="result-item ${r.correct ? 'correct' : 'incorrect'}">
            <div class="result-header">
              <span>Question ${i + 1}</span>
              <span class="badge badge-${r.riskLevel}">${r.riskLevel}</span>
            </div>
            <div class="result-explanation">${r.explanation}</div>
          </div>
        `).join('')}
      </div>
      
      <button class="btn btn-primary" onclick="window.location.href='quiz.html'">
        Back to Quizzes
      </button>
    </div>
  `;
}

function startQuizTimer(seconds) {
  let timeLeft = seconds;
  const timerElement = document.getElementById('quiz-timer');
  
  quizTimer = setInterval(() => {
    timeLeft--;
    const minutes = Math.floor(timeLeft / 60);
    const secs = timeLeft % 60;
    
    if (timerElement) {
      timerElement.textContent = `⏱ ${minutes}:${secs.toString().padStart(2, '0')}`;
      
      if (timeLeft < 60) {
        timerElement.classList.add('warning');
      }
    }
    
    if (timeLeft <= 0) {
      clearInterval(quizTimer);
      submitQuiz();
    }
  }, 1000);
}

// Utility Functions
function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.textContent = message;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.style.animation = 'slideInRight 0.3s reverse';
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

function updateDailyStreak() {
  apiCall('/dashboard/streak', 'POST')
    .catch(error => console.error('Streak update error:', error));
}

// Modal Functions
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add('active');
  }
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove('active');
  }
}

// Export functions for use in HTML
window.SafeLink = {
  register,
  login,
  logout,
  openModule,
  completeLesson,
  startQuiz: (id) => window.location.href = `quiz.html?id=${id}`,
  openModal,
  closeModal,
  showNotification
};