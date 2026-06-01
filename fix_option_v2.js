const fs = require('fs');
const p = 'C:\\Users\\dailu\\Desktop\\expert-platform\\public\\index.html';
let html = fs.readFileSync(p, 'utf8');

// The bug: value=\">  should be value=\"\">
// In the file it's stored as: value=\">
const bad = 'value=\\">不限';
const good = 'value=\"\">不限';

if (html.includes(bad)) {
  html = html.replace(bad, good);
  console.log('Fixed! Replaced value=\\"> with value=\\\">');
} else {
  // Try exact match from char dump
  const altBad = 'filterMinRating"><option value=\\">';
  if (html.includes(altBad)) {
    html = html.replace(altBad, 'filterMinRating"><option value=\"\">');
    console.log('Fixed via alt pattern');
  } else {
    console.log('Still not found. Trying regex...');
    // Use regex to find and fix
    html = html.replace(/option value=">(不限)/g, 'option value="">$1');
    console.log('Applied regex fix');
  }
}

// Validate
try {
  const scriptRegex = /<script[^>]*>([\s\S]*?)<\/script>/gi;
  let match;
  while ((match = scriptRegex.exec(html)) !== null) {
    const code = match[1].trim();
    if (code && code.length > 10000) new Function(code);
  }
  console.log('Syntax OK');
} catch(e) { console.log('Syntax ERROR:', e.message); }

fs.writeFileSync(p, html, 'utf8');
console.log('Saved');
