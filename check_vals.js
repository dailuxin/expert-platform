const fs = require('fs');
const p = 'C:\\Users\\dailu\\Desktop\\expert-platform\\public\\index.html';
let html = fs.readFileSync(p, 'utf8');

// The core issue: renderHome uses double-quoted JS strings containing HTML with double quotes
// value="" inside a "..." string closes the string prematurely
// Fix: replace value="" with value=\"\" in the io variable line

// Current broken: let io="<option value="">全部行业</option>";
// The "" inside the outer "..." is the problem
// In the actual file, it's stored as escaped: value=\"> (which renders as value="> after one level of unescape)
// After our previous fix it became value=""> which is STILL broken because "" closes the outer string

// We need to use escaped quotes: value=\"
// But since this is inside a JS "..." string, we need \\"

// Let me check what's actually there now
const idx = html.indexOf('value="">全部行业');
console.log('Found value=""> at', idx);
if (idx > 0) {
  console.log('Context:', JSON.stringify(html.substring(idx - 10, idx + 30)));
}

// Also check the other occurrence
const idx2 = html.indexOf('option value="">不限');
console.log('Found option value="">不限 at', idx2);
if (idx2 > 0) {
  console.log('Context:', JSON.stringify(html.substring(idx2 - 10, idx2 + 30)));
}
