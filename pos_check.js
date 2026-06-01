const fs = require('fs');
const html = fs.readFileSync(`C:\Users\dailu\Desktop\expert-platform\public\index.html`, 'utf8');

// Find exact positions using indexOf
const statsIdx = html.indexOf('stats-bar');
const searchBtnIdx = html.indexOf('searchExperts()">搜索</button>');

console.log('statsIdx:', statsIdx, 'searchBtnIdx:', searchBtnIdx);
console.log('Slice from searchBtn:', JSON.stringify(html.substring(searchBtnIdx, searchBtnIdx + 60)));
