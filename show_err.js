const fs = require('fs');
const p = String.raw`C:\Users\dailu\Desktop\expert-platform\public\index.html`;
const html = fs.readFileSync(p, 'utf8';

const scriptRegex = /<script[^>]*>([\s\S]*?)<\/script>/gi;
let match;
while ((match = scriptRegex.exec(html)) !== null) {
  const code = match[1].trim();
  if (code && code.length > 10000) {
    // Show chars 980-1030
    console.log(JSON.stringify(code.substring(970, 1030)));
  }
}
