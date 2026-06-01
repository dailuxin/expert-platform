const fs = require('fs');
const h = fs.readFileSync('C:/Users/dailu/Desktop/expert-platform/public/index.html', 'utf8');
const scripts = h.match(/<script>([\s\S]*?)<\/script>/g);
const m = scripts[1].match(/<script>([\s\S]*?)<\/script>/);
const code = m[1];
try {
  new Function(code);
  console.log('SYNTAX OK!');
} catch(e) {
  console.log('ERROR:', e.message);
}
process.exit(0);