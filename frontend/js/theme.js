// // Theme Management System

// // Initialize theme
// function initTheme() {
//   // Get saved theme or default to dark
//   const savedTheme = localStorage.getItem('theme') || 'dark';
//   setTheme(savedTheme, false);
  
//   // Update toggle if on settings page
//   const themeToggle = document.getElementById('themeToggle');
//   if (themeToggle) {
//     themeToggle.checked = savedTheme === 'light';
//     updateThemeLabel(savedTheme);
//   }
// }

// // Set theme
// function setTheme(theme, animate = true) {
//   const body = document.body;
//   const html = document.documentElement;
  
//   // Add/remove preload class for smooth transition
//   if (!animate) {
//     body.classList.add('preload');
//   }
  
//   // Apply theme
//   html.setAttribute('data-theme', theme);
//   localStorage.setItem('theme', theme);
  
//   // Update meta theme color for mobile browsers
//   let metaThemeColor = document.querySelector('meta[name="theme-color"]');
//   if (!metaThemeColor) {
//     metaThemeColor = document.createElement('meta');
//     metaThemeColor.name = 'theme-color';
//     document.head.appendChild(metaThemeColor);
//   }
  
//   metaThemeColor.content = theme === 'light' ? '#f5f7fa' : '#0a0f24';
  
//   // Remove preload class
//   if (!animate) {
//     setTimeout(() => {
//       body.classList.remove('preload');
//     }, 100);
//   }
  
//   console.log(`Theme set to: ${theme}`);
// }

// // Toggle theme
// function toggleTheme() {
//   const currentTheme = localStorage.getItem('theme') || 'dark';
//   const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  
//   setTheme(newTheme);
//   updateThemeLabel(newTheme);
  
//   // Show notification
//   showAlert(`Switched to ${newTheme === 'light' ? 'Light' : 'Dark'} Mode ✨`, 'success');
// }

// // Update theme label
// function updateThemeLabel(theme) {
//   const label = document.getElementById('currentTheme');
//   if (label) {
//     label.textContent = theme === 'light' ? 'Light Mode' : 'Dark Mode';
//   }
// }

// // Add theme toggle to all pages
// function addQuickThemeToggle() {
//   // Skip if on settings page (has its own toggle)
//   if (window.location.pathname.includes('settings.html')) {
//     return;
//   }
  
//   const header = document.querySelector('header');
//   if (!header) return;
  
//   const themeBtn = document.createElement('button');
//   themeBtn.innerHTML = '🌓';
//   themeBtn.style.cssText = `
//     position: absolute;
//     left: 20px;
//     top: 50%;
//     transform: translateY(-50%);
//     background: var(--bg-hover);
//     border: 2px solid var(--border-color);
//     border-radius: 50%;
//     width: 50px;
//     height: 50px;
//     font-size: 30px;
//     cursor: pointer;
//     transition: all 0.3s ease;
//   `;
  
//   themeBtn.onclick = toggleTheme;
  
//   themeBtn.onmouseover = function() {
//     this.style.transform = 'translateY(-50%) scale(1.1)';
//   };
  
//   themeBtn.onmouseout = function() {
//     this.style.transform = 'translateY(-50%) scale(1)';
//   };
  
//   header.style.position = 'relative';
//   header.appendChild(themeBtn);
// }

// // Initialize theme on page load
// document.addEventListener('DOMContentLoaded', () => {
//   initTheme();
//   addQuickThemeToggle();
// });

// // Auto-detect system theme preference
// function detectSystemTheme() {
//   if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
//     return 'dark';
//   }
//   return 'light';
// }

// // Listen for system theme changes
// if (window.matchMedia) {
//   window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
//     const autoTheme = localStorage.getItem('autoTheme');
//     if (autoTheme === 'true') {
//       const newTheme = e.matches ? 'dark' : 'light';
//       setTheme(newTheme);
//     }
//   });
// }

// ---------------------------------------------
//  THEME MANAGEMENT SYSTEM (REWRITTEN CLEANLY)
// ---------------------------------------------

// Initialize theme on page load
document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  addHeaderThemeButton();
});

// ----------------------
// Initialize saved theme
// ----------------------
function initTheme() {
  const saved = localStorage.getItem("theme");
  const theme = saved ? saved : "dark";

  applyTheme(theme, false);

  // Update settings page toggle if available
  const toggle = document.getElementById("themeToggle");
  const label = document.getElementById("currentTheme");

  if (toggle) {
    toggle.checked = theme === "light";
  }
  if (label) {
    label.textContent = theme === "light" ? "Light Mode" : "Dark Mode";
  }
}

// ----------------------
// Apply theme globally
// ----------------------
function applyTheme(theme, animate = true) {
  const html = document.documentElement;
  const body = document.body;

  // Disable animation for initial load
  if (!animate) {
    body.classList.add("no-anim");
  }

  // Set attribute for CSS
  html.setAttribute("data-theme", theme);

  // Save to localStorage
  localStorage.setItem("theme", theme);

  // Meta browser theme color
  setMetaThemeColor(theme);

  // Re-enable animation
  if (!animate) {
    setTimeout(() => body.classList.remove("no-anim"), 150);
  }
}

// ----------------------
// Toggle theme
// ----------------------
function toggleTheme() {
  const current = localStorage.getItem("theme") || "dark";
  const newTheme = current === "dark" ? "light" : "dark";

  applyTheme(newTheme);

  // Update settings page toggle and label if present
  const toggle = document.getElementById("themeToggle");
  const label = document.getElementById("currentTheme");

  if (toggle) toggle.checked = newTheme === "light";
  if (label) label.textContent = newTheme === "light" ? "Light Mode" : "Dark Mode";

  // Notification
  showAlert(`Switched to ${newTheme === "dark" ? "Dark" : "Light"} Mode 🌗`, "success");
}

// -----------------------------
// Create the top-left header btn
// -----------------------------
function addHeaderThemeButton() {
  const header = document.querySelector("header");
  if (!header) return;

  const btn = document.createElement("button");
  btn.innerHTML = "🌓";
  btn.className = "theme-circle-btn";

  btn.onclick = toggleTheme;

  header.style.position = "relative"; // needed for positioning
  header.appendChild(btn);
}

// -----------------------------
// Update meta theme for mobile
// -----------------------------
function setMetaThemeColor(theme) {
  let meta = document.querySelector('meta[name="theme-color"]');
  if (!meta) {
    meta = document.createElement("meta");
    meta.name = "theme-color";
    document.head.appendChild(meta);
  }

  meta.content = theme === "light" ? "#f5f7fa" : "#0a0f24";
}

// -----------------------------
// Auto-detect system theme
// -----------------------------
function getSystemTheme() {
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", e => {
  const auto = localStorage.getItem("autoTheme");
  if (auto === "true") {
    const system = e.matches ? "dark" : "light";
    applyTheme(system);
  }
});
