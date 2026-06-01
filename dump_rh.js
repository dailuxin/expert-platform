const fs = require('fs');
const p = 'C:\\Users\\dailu\\Desktop\\expert-platform\\public\\index.html';
const html = fs.readFileSync(p, 'utf8');

const start = html.indexOf('function renderHome(){');
const end = html.indexOf('function filterByIndustry(');
const oldRH = html.substring(start, end);
console.log('Old renderHome (' + oldRH.length + ' chars):');
console.log(oldRH);
