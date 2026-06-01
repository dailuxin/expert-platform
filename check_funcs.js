const fs = require('fs');
const h = fs.readFileSync('C:/Users/dailu/Desktop/expert-platform/public/index.html', 'utf8');
const scripts = h.match(/<script>([\s\S]*?)<\/script>/g);
const m = scripts[1].match(/<script>([\s\S]*?)<\/script>/);
const code = m[1];

// Find all function definitions
const funcRegex = /(?:async\s+)?function\s+\w+\s*\(/g;
let match;
while ((match = funcRegex.exec(code)) !== null) {
  const lineNum = code.substring(0, match.index).split('\n').length;
  console.log('Function at line', lineNum, 'pos', match.index, ':', match[0], '- context:', code.substring(Math.max(0, match.index - 5), match.index + match[0].length + 10));
}

// Count lines
const lines = code.split('\n');
console.log('\nTotal lines:', lines.length);

// Check line 6 (the problematic one)
console.log('Line 5:', JSON.stringify(lines[4]));
console.log('Line 6:', JSON.stringify(lines[5]));
console.log('Line 7:', JSON.stringify(lines[6]));

// Test each line individually
console.log('\n--- Testing each line ---');
const lineTest = lines.slice(0, 10).map((l, i) => {
  try {
    new Function(l);
    return 'OK: ' + l.substring(0, 50);
  } catch(e) {
    return 'FAIL: ' + e.message + ' | ' + l.substring(0, 50);
  }
});
lineTest.forEach((r, i) => console.log('Line', i + 1, ':', r));

process.exit(0);