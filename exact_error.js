const fs = require('fs');
const p = 'C:\\Users\\dailu\\Desktop\\expert-platform\\public\\index.html';
const html = fs.readFileSync(p, 'utf8');

const scriptRegex = /<script[^>]*>([\s\S]*?)<\/script>/gi;
let match;
while ((match = scriptRegex.exec(html)) !== null) {
  const code = match[1].trim();
  if (code && code.length > 10000) {
    // Try each 100-char increment from 800-1100
    for (let i = 800; i <= 1100; i += 50) {
      try {
        new Function(code.substring(0, i));
        console.log(i + ': OK');
      } catch (e) {
        console.log(i + ': ' + e.message);
      }
    }
  }
}
