// Global API URL
const API_URL = 'http://localhost:3000/api';
let token = localStorage.getItem('token');

// Set auth header
function getHeaders() {
  const headers = {
    'Content-Type': 'application/json'
  };
  
  const token = localStorage.getItem('token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
}

// Check authentication
function checkAuth() {
  const token = localStorage.getItem('token');
  const currentPath = window.location.pathname;
  
  // Pages that don't require authentication
  const publicPages = ['/', '/index.html', '/login.html', '/onboarding.html', '/privacy.html', '/terms.html', '/help.html'];
  
  if (!token && !publicPages.includes(currentPath)) {
    window.location.href = '/login.html';
    return false;
  }
  
  return true;
}

// Logout
function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('userId');
  localStorage.removeItem('username');
  window.location.href = '/login.html';
}

// Show alert message
function showAlert(message, type = 'info') {
  const alertDiv = document.createElement('div');
  alertDiv.className = `alert alert-${type}`;
  alertDiv.textContent = message;
  alertDiv.style.position = 'fixed';
  alertDiv.style.top = '20px';
  alertDiv.style.right = '20px';
  alertDiv.style.zIndex = '10000';
  alertDiv.style.minWidth = '300px';
  alertDiv.style.animation = 'slideInRight 0.3s ease-out';
  
  document.body.appendChild(alertDiv);
  
  setTimeout(() => {
    alertDiv.style.animation = 'slideOutRight 0.3s ease-out';
    setTimeout(() => alertDiv.remove(), 300);
  }, 4000);
}

// XP Popup
function showXPPopup(xp) {
  const popup = document.createElement('div');
  popup.className = 'xp-popup';
  popup.innerHTML = `
    <h2>+${xp} XP</h2>
    <p>🎉 Great job!</p>
  `;
  document.body.appendChild(popup);
  
  setTimeout(() => popup.classList.add('show'), 100);
  setTimeout(() => {
    popup.classList.remove('show');
    setTimeout(() => popup.remove(), 300);
  }, 2000);
}

// Format date
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
}

// Test server connection
async function testServerConnection() {
  try {
    const response = await fetch(`${API_URL}/health`);
    if (!response.ok) {
      console.warn('Server health check failed');
      return false;
    }
    return true;
  } catch (error) {
    console.error('Cannot connect to server:', error);
    console.log('Please make sure the server is running on http://localhost:3000');
    return false;
  }
}

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
  // Test server connection
  const serverOnline = await testServerConnection();
  if (!serverOnline) {
    const currentPath = window.location.pathname;
    const publicPages = ['/', '/index.html', '/privacy.html', '/terms.html'];
    
    if (!publicPages.includes(currentPath)) {
      showAlert('Cannot connect to server. Please start the backend server.', 'error');
    }
  }
  
  // Check authentication
  checkAuth();
  
  // Add username to header if logged in
  const username = localStorage.getItem('username');
  if (username && document.querySelector('header')) {
    const header = document.querySelector('header');
    const userSpan = document.createElement('span');
    userSpan.style.cssText = 'float: right; font-size: 16px; font-weight: normal;';
    userSpan.innerHTML = `👤 ${username}`;
    header.appendChild(userSpan);
  }
});

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
  @keyframes slideInRight {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  
  @keyframes slideOutRight {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(100%);
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);