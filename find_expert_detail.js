const fs = require('fs');
const h = fs.readFileSync('C:/Users/dailu/Desktop/expert-platform/public/index.html', 'utf8');
const scripts = h.match(/<script>([\s\S]*?)<\/script>/g);
const m = scripts[1].match(/<script>([\s\S]*?)<\/script>/);
const code = m[1];

// Find line 5 (the global vars line) and line 6
const lines = code.split('\n');
console.log('Line 5 (global vars):', JSON.stringify(lines[4]));
console.log('Line 5 length:', lines[4].length);
console.log('Line 6 (api func):', JSON.stringify(lines[5].substring(0, 80)));
console.log('Line 6 length:', lines[5].length);

// Check if there's an extra currentExpertDetail in line 5
if (lines[4].includes('currentExpertDetail')) {
  console.log('\nFOUND currentExpertDetail in line 5!');
  // Find its position
  const idx = lines[4].indexOf('currentExpertDetail');
  console.log('At char offset:', idx);
  console.log('Context:', lines[4].substring(Math.max(0, idx-20), idx+50));
}

// Count occurrences of currentExpertDetail in the script
const occurrences = [];
for (let i = code.indexOf('currentExpertDetail'); i > -1; i = code.indexOf('currentExpertDetail', i + 1)) {
  const lineInfo = (() => { let c = 0; for (let j = 0; j < lines.length; j++) { if (c <= i && c + lines[j].length + 1 > i) return j + 1; c += lines[j].length + 1; } return '?'; })();
  occurrences.push({ pos: i, line: lineInfo, context: code.substring(Math.max(0, i - 10), i + 30) });
}
console.log('\nOccurrences of currentExpertDetail:', occurrences.length);
occurrences.forEach(o => console.log('Line', o.line, 'offset', o.pos, ':', o.context));

process.exit(0);