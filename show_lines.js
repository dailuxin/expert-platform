const fs = require('fs');
const p = 'C:\\Users\\dailu\\Desktop\\expert-platform\\public\\index.html';
const html = fs.readFileSync(p, 'utf8');

// Show lines 1-8 of script 6
const scriptRegex = /<script[^>]*>([\s\S]*?)<\/script>/gi;
let match;
let idx = 0;
while ((match = scriptRegex.exec(html)) !== null) {
  const code = match[1].trim();
  if (code && code.length > 10000) {
    const lines = code.split('\n');
    for (let i = 0; i < Math.min(10, lines.length); i++) {
      console.log('Line ' + i + ' (' + lines[i].length + '): ' + lines[i].substring(0, 100));
    }
  }
  idx++;
}
