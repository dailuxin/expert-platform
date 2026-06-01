const fs = require('fs');
const p = String.raw`C:\Users\dailu\Desktop\expert-platform\app.js`;
const app = fs.readFileSync(p, 'utf8');

// Find /api/experts route
const idx = app.indexOf("'/api/experts'");
if (idx < 0) { console.log('not found'); process.exit(1); }

// Show context
console.log(JSON.stringify(app.substring(idx - 20, idx + 400)));
