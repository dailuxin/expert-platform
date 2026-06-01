const fs = require('fs');
const h = fs.readFileSync('C:/Users/dailu/Desktop/expert-platform/public/index.html', 'utf8');
const scripts = h.match(/<script>([\s\S]*?)<\/script>/g);
const m = scripts[1].match(/<script>([\s\S]*?)<\/script>/);
const code = m[1];

// Test with CRLF
const crlf = code.replace(/\n/g, '\r\n');
try {
  new Function(crlf);
  console.log('CRLF version: OK');
} catch(e) {
  console.log('CRLF error:', e.message);
}

// Test just the first line
const firstLine = code.split('\n')[0];
console.log('First line bytes:', Buffer.from(firstLine).toString('hex'));
console.log('First line len:', firstLine.length);

// Test with explicit global scope - maybe the issue is function body context
try {
  // new Function treats code as function body, so "let" at top level is fine
  new Function('return ' + JSON.stringify('let test=1; let a=2;'));
  console.log('Basic test OK');
} catch(e) {
  console.log('Basic test error:', e.message);
}

// Test if let with multiple vars works
try {
  new Function('let x=1,y=2,z=3;');
  console.log('let multi-vars: OK');
} catch(e) {
  console.log('let multi-vars ERROR:', e.message);
}

// What's at exactly pos 101 in the actual code?
console.log('\nChar at 101:', code.charCodeAt(101), JSON.stringify(code[101]));
console.log('Char at 102:', code.charCodeAt(102), JSON.stringify(code[102]));
console.log('Substr 100-105:', JSON.stringify(code.substring(100, 105)));

// Now test with a simpler version
const testCode = 'let API="/api", currentUser=null, currentExpert=null, currentStars=0, msgTargetId=null, currentExpertDetail=null;\nconst ORDER_STATUS={a:"b"};';
try {
  new Function(testCode);
  console.log('Simple test: OK');
} catch(e) {
  console.log('Simple test ERROR:', e.message);
}

process.exit(0);