const fs = require('fs');
const p = 'C:\\Users\\dailu\\Desktop\\expert-platform\\public\\index.html';
const html = fs.readFileSync(p, 'utf8');

// Get the full adv search panel - from "高级筛选" link to the closing div
const start = html.indexOf('高级筛选 ▾');
const end = html.indexOf('backBtn', start);
console.log(html.substring(start, end + 50));
