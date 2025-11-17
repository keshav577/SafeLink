const fetch = require('node-fetch');

const API_URL = 'http://localhost:3000/api';
let token = '';

async function testQuizSystem() {
  console.log('Testing Quiz System...\n');
  
  // Step 1: Login
  console.log('1. Logging in...');
  const loginRes = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'test@example.com',
      password: 'password123'
    })
  });
  
  const loginData = await loginRes.json();
  token = loginData.token;
  console.log('✅ Logged in:', loginData.username);
  
  // Step 2: Get quizzes
  console.log('\n2. Fetching quizzes...');
  const quizzesRes = await fetch(`${API_URL}/quiz`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  const quizzes = await quizzesRes.json();
  console.log(`✅ Found ${quizzes.length} quizzes`);
  quizzes.forEach(q => console.log(`   - ${q.title} (${q.questions.length} questions)`));
  
  // Step 3: Take a quiz
  if (quizzes.length > 0) {
    const quiz = quizzes[0];
    console.log(`\n3. Taking quiz: ${quiz.title}`);
    
    // Create answers (all correct for testing)
    const answers = quiz.questions.map(q => q.correct);
    
    const submitRes = await fetch(`${API_URL}/quiz/${quiz.id}/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ answers })
    });
    
    const results = await submitRes.json();
    console.log('✅ Quiz completed!');
    console.log(`   Score: ${results.score}%`);
    console.log(`   Correct: ${results.correctCount}/${results.totalQuestions}`);
    console.log(`   XP Earned: ${results.xpGained}`);
  }
}

testQuizSystem().catch(console.error);