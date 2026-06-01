const fs = require('fs');
const p = 'C:\\Users\\dailu\\Desktop\\expert-platform\\public\\index.html';
const html = fs.readFileSync(p, 'utf8');

const scriptRegex = /<script[^>]*>([\s\S]*?)<\/script>/gi;
let match;
while ((match = scriptRegex.exec(html)) !== null) {
  const code = match[1].trim();
  if (code && code.length > 10000) {
    for (let end = 1000; end <= code.length; end += 200) {
      try {
        new Function(code.substring(0, end));
      } catch (e) {
        console.log('Error at char:', end, e.message);
        console.log(JSON.stringify(code.substring(Math.max(0, end - 80), end + 20)));
        break;
      }
    }
  }
}
