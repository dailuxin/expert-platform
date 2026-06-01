const fs = require('fs');
const h = fs.readFileSync('C:/Users/dailu/Desktop/expert-platform/public/index.html', 'utf8');
const scripts = h.match(/<script>([\s\S]*?)<\/script>/g);
const m = scripts[1].match(/<script>([\s\S]*?)<\/script>/);
const code = m[1];

// Check exactly position 89 onwards
for (let i = 85; i < 115; i++) {
  const c = code.charCodeAt(i);
  const display = c > 127 || c < 32 ? '[' + c + ']' : JSON.stringify(code[i]);
  process.stdout.write('[' + i + ']=' + c + '=' + display + '  ');
  if (i % 6 === 5) process.stdout.write('\n');
}

// Also check the hex around the split
const chunk = code.substring(89, 115);
console.log('\n\nRaw bytes (hex):');
for (let i = 0; i < chunk.length; i++) {
  process.stdout.write(chunk.charCodeAt(i).toString(16) + ' ');
}
console.log('\n\nString at 89-115:', JSON.stringify(chunk));

process.exit(0);