const fs = require('fs');
const p = String.raw`C:\Users\dailu\Desktop\expert-platform\public\index.html`;
const html = fs.readFileSync(p, 'utf8');

const statsIdx = html.indexOf('stats-bar');
const searchBtnIdx = html.indexOf('searchExperts()">搜索</button>');

console.log('statsIdx:', statsIdx, 'searchBtnIdx:', searchBtnIdx);
console.log('Slice:', JSON.stringify(html.substring(searchBtnIdx, searchBtnIdx + 80)));
