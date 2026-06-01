const fs = require('fs');
const p = 'C:\\Users\\dailu\\Desktop\\expert-platform\\public\\index.html';
const html = fs.readFileSync(p, 'utf8');

// Full loadExperts function
const leStart = html.indexOf('function loadExperts(');
const leEnd = html.indexOf('function renderHome(');
console.log('loadExperts full:');
console.log(html.substring(leStart, leEnd));

// Also check renderExpertDetail first 500 chars
console.log('\n--- renderExpertDetail first 500 ---');
console.log(html.substring(9371, 9871));
