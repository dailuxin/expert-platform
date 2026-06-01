const fs = require('fs');
const p = 'C:\\Users\\dailu\\Desktop\\expert-platform\\public\\index.html';
const html = fs.readFileSync(p, 'utf8');

const start = html.indexOf('function renderHome(){');
const end = html.indexOf('function filterByIndustry(');
console.log('renderHome at:', start, '-', end);

// Show first 300 chars of renderHome
console.log(JSON.stringify(html.substring(start, start + 300)));
