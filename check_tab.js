const fs = require('fs');
const h = fs.readFileSync('C:/Users/dailu/Desktop/expert-platform/public/index.html', 'utf8');
const scripts = h.match(/<script>([\s\S]*?)<\/script>/g);
const m = scripts[1].match(/<script>([\s\S]*?)<\/script>/);
const code = m[1];

// Check for BOM or hidden chars at start
console.log('Byte order mark at start:', code.charCodeAt(0) === 0xFEFF ? 'YES' : 'No');
console.log('First 5 char codes:', [0,1,2,3,4].map(i => code.charCodeAt(i)));

// Check ALL occurrences of 'tab' as a whole word
const tabRegex = /\btab\b/g;
const tabMatches = [];
let match;
while ((match = tabRegex.exec(code)) !== null) {
  const lineNum = code.substring(0, match.index).split('\n').length;
  tabMatches.push({ pos: match.index, line: lineNum, context: code.substring(Math.max(0, match.index - 20), match.index + 20) });
}
console.log('\nAll "tab" word occurrences:', tabMatches.length);
tabMatches.forEach(t => console.log('Line', t.line, 'pos', t.pos, ':', t.context));

// Check if 'tab(' appears (function call syntax)
const tabCallRegex = /tab\s*\(/g;
const tabCalls = [];
while ((match = tabCallRegex.exec(code)) !== null) {
  const lineNum = code.substring(0, match.index).split('\n').length;
  tabCalls.push({ pos: match.index, line: lineNum, context: code.substring(Math.max(0, match.index - 10), match.index + 30) });
}
console.log('\nAll "tab(" occurrences:', tabCalls.length);
tabCalls.slice(0, 5).forEach(t => console.log('Line', t.line, ':', t.context));

process.exit(0);