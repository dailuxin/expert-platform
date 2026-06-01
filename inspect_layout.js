const fs = require('fs');
const h = fs.readFileSync('C:/Users/dailu/Desktop/expert-platform/public/index.html', 'utf8');
const scripts = h.match(/<script>([\s\S]*?)<\/script>/g);
// Get the second script (main code)
const mainScript = scripts[1].replace(/<\/?script>/g, '');

// Extract renderHome function
const rhMatch = mainScript.match(/function renderHome\(\)\{[\s\S]*?function \w+/);
if (rhMatch) {
  console.log('=== renderHome ===');
  console.log(rhMatch[0].substring(0, 2000));
}

// Find where experts are rendered in home
const expertListMatch = mainScript.match(/function renderExperts[\s\S]*?function \w+/);
if (expertListMatch) {
  console.log('\n=== renderExperts ===');
  console.log(expertListMatch[0].substring(0, 1000));
}

// Find renderLogin / renderRegister
const rlMatch = mainScript.match(/function renderLogin\(\)\{[\s\S]*?function \w+/);
if (rlMatch) {
  console.log('\n=== renderLogin ===');
  console.log(rlMatch[0].substring(0, 2000));
}

const rrMatch = mainScript.match(/function renderRegister\(\)\{[\s\S]*?function \w+/);
if (rrMatch) {
  console.log('\n=== renderRegister ===');
  console.log(rrMatch[0].substring(0, 2000));
}

process.exit(0);
