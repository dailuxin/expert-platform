const fs = require('fs');
const h = fs.readFileSync('C:/Users/dailu/Desktop/expert-platform/public/index.html', 'utf8');
const scripts = h.match(/<script>([\s\S]*?)<\/script>/g);
const m = scripts[1].match(/<script>([\s\S]*?)<\/script>/);
const code = m[1];

// Test: parse the first N chars with a proper try-catch wrapper
// wrapping statements in an IIFE to allow multiple statements
for (let i = 1; i < code.length; i++) {
  try {
    // Wrap in IIFE - allows multiple statements as function body
    new Function(code.substring(0, i));
  } catch (e) {
    if (e.message.includes('Unexpected identifier')) {
      console.log('First error at pos', i);
      console.log('Context:', JSON.stringify(code.substring(Math.max(0, i - 80), i + 80)));
      console.log('Char at error:', code.charCodeAt(i), JSON.stringify(code[i]));
      console.log('Previous 20:', JSON.stringify(code.substring(Math.max(0, i - 20), i)));
      break;
    }
  }
}

// Also: try IIFE wrapping at specific split point
console.log('\n--- Test: wrapping var line + api func ---');
// First part: var declarations (until first ';' before 'const')
const semi = code.indexOf(';');
const rest = code.substring(semi + 1);
console.log('Rest starts with:', JSON.stringify(rest.substring(0, 30)));
console.log('Rest line 1:', JSON.stringify(rest.split('\n')[0]));
try {
  new Function(rest);
  console.log('Rest: OK');
} catch(e) {
  console.log('Rest ERROR:', e.message);
  // What's the first thing in rest?
  const firstLine = rest.split('\n')[0];
  console.log('First line of rest:', JSON.stringify(firstLine));
  console.log('First line len:', firstLine.length);
  // Check char codes of first line
  for (let i = 0; i < Math.min(5, firstLine.length); i++) {
    process.stdout.write(firstLine.charCodeAt(i) + ' ');
  }
  console.log('');
  console.log('First line first 5 chars:', JSON.stringify(firstLine.substring(0, 5)));
  console.log('Starts with const?', firstLine.trim().startsWith('const'));
  console.log('Trim:', JSON.stringify(firstLine.trim().substring(0, 30)));
}

process.exit(0);