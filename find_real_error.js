const fs = require('fs');
const h = fs.readFileSync('C:/Users/dailu/Desktop/expert-platform/public/index.html', 'utf8');
const scripts = h.match(/<script>([\s\S]*?)<\/script>/g);
const m = scripts[1].match(/<script>([\s\S]*?)<\/script>/);
const code = m[1];

// Strategy: parse char by char, tracking string literals
// When inside a string, skip all chars until string closes
// This lets us find the actual syntax error outside of string content

let pos = 0;
let inString = false;
let strChar = '';
let parenDepth = 0;  // track () depth
let braceDepth = 0;  // track {} depth
let bracketDepth = 0; // track [] depth

function isIdentChar(c) {
  return /[a-zA-Z0-9_$]/.test(c);
}

while (pos < code.length) {
  const c = code[pos];
  
  if (inString) {
    if (c === strChar && code[pos-1] !== '\\') {
      inString = false;
    }
  } else {
    if (c === '"' || c === "'" || c === '`') {
      inString = true;
      strChar = c;
    } else if (c === '(') {
      parenDepth++;
    } else if (c === ')') {
      parenDepth = Math.max(0, parenDepth - 1);
    } else if (c === '{') {
      braceDepth++;
    } else if (c === '}') {
      braceDepth = Math.max(0, braceDepth - 1);
    } else if (c === '[') {
      bracketDepth++;
    } else if (c === ']') {
      bracketDepth = Math.max(0, bracketDepth - 1);
    } else if (c === '/' && code[pos+1] === '/') {
      // skip to end of line
      while (pos < code.length && code[pos] !== '\n') pos++;
    } else if (c === '/' && code[pos+1] === '*') {
      // skip block comment
      pos += 2;
      while (pos < code.length && !(code[pos] === '*' && code[pos+1] === '/')) pos++;
      pos += 2;
    } else if (braceDepth === 0 && parenDepth === 0 && bracketDepth === 0) {
      // Only check keywords at statement level
      if (c === 't' && code[pos+1] === 'a' && code[pos+2] === 'b' && !isIdentChar(code[pos+3]||'') && !isIdentChar(code[pos-1]||'')) {
        console.log('Standalone "tab" found at pos', pos, 'context:', JSON.stringify(code.substring(Math.max(0,pos-30),pos+30)));
      }
    }
  }
  pos++;
}

// Also: find the exact position where the var line ends
console.log('\n--- Finding var line end ---');
const semiMatch = code.match(/^[\n]*let\s+[^\n]+;\n/);
if (semiMatch) {
  console.log('Var line match:', JSON.stringify(semiMatch[0]));
  console.log('Var line length:', semiMatch[0].length);
}

// Check: does the const ORDER_STATUS line work as standalone?
const constLine = code.split('\n').slice(1, 3).join('\n');
try {
  new Function(constLine);
  console.log('Const line + ORDER_STATUS: OK');
} catch(e) {
  console.log('Const line ERROR:', e.message);
}

// Check: what if we remove the leading newline from the script?
const noNewline = code.replace(/^\n/, '');
try {
  new Function(noNewline);
  console.log('No leading newline: OK');
} catch(e) {
  console.log('No leading newline ERROR:', e.message);
}

process.exit(0);