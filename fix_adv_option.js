const fs = require('fs');
const p = 'C:\\Users\\dailu\\Desktop\\expert-platform\\public\\index.html';
let html = fs.readFileSync(p, 'utf8');

// Fix: <option value=">  should be <option value="">
const bad = '<option value=\">不限</option>';
const good = '<option value=\"\">不限</option>';

if (html.includes(bad)) {
  html = html.replace(bad, good);
  console.log('Fixed option value bug');
} else {
  console.log('Pattern not found');
}

// Validate
const scriptRegex = /<script[^>]*>([\s\S]*?)<\/script>/gi;
let match;
while ((match = scriptRegex.exec(html)) !== null) {
  const code = match[1].trim();
  if (code && code.length > 10000) {
    try {
      new Function(code);
      console.log('Syntax OK');
    } catch (e) {
      console.log('Syntax ERROR:', e.message);
    }
  }
}

fs.writeFileSync(p, html, 'utf8');
console.log('Saved');
