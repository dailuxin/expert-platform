const fs = require('fs');
const p = 'C:\\Users\\dailu\\Desktop\\expert-platform\\public\\index.html';
const html = fs.readFileSync(p, 'utf8');

// Position 133 is very early - check what's there
const scriptRegex = /<script[^>]*>([\s\S]*?)<\/script>/gi;
let match;
while ((match = scriptRegex.exec(html)) !== null) {
  const code = match[1].trim();
  if (code && code.length > 10000) {
    console.log('First 200 chars:', JSON.stringify(code.substring(0, 200)));
    console.log('Chars 120-150:', JSON.stringify(code.substring(120, 150)));
  }
}
