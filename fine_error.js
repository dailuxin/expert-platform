const fs = require('fs');
const p = String.raw`C:\Users\dailu\Desktop\expert-platform\public\index.html`;
const html = fs.readFileSync(p, 'utf8');

const scriptRegex = /<script[^>]*>([\s\S]*?)<\/script>/gi;
let match;
while ((match = scriptRegex.exec(html)) !== null) {
  const code = match[1].trim();
  if (code && code.length > 10000) {
    // Fine-grained search: try 1000-char increments
    for (let end = 1000; end <= code.length; end += 1000) {
      try {
        new Function(code.substring(0, end));
      } catch (e) {
        console.log('Error at char:', end, '-', e.message);
        // Show last 50 chars before the error
        const ctx = code.substring(end - 50, end);
        console.log('Last 50 chars:', JSON.stringify(ctx));
        break;
      }
    }
  }
}
