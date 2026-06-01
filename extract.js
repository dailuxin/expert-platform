const fs = require('fs');
const html = fs.readFileSync('C:/Users/dailu/Desktop/expert-platform/public/index.html', 'utf8');
const scripts = html.match(/<script[^>]*>([\s\S]*?)<\/script>/g);
if (!scripts || scripts.length < 7) {
  console.log('Expected 7 script tags, found', scripts ? scripts.length : 0);
  process.exit(1);
}
const script6 = scripts[6].replace(/<\/?script[^>]*>/g, '');
fs.writeFileSync('C:/Users/dailu/Desktop/expert-platform/check_syntax.js', script6);
console.log('Extracted script to check_syntax.js');
console.log('Run: node --check check_syntax.js');
