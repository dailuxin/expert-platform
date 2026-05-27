// find_code.js — 找到 index.html 中问题代码的位置和上下文
const fs = require('fs');
const path = require('path');

const htmlPath = path.join(__dirname, 'public', 'index.html');
const content = fs.readFileSync(htmlPath, 'utf8');

// 找到问题代码的位置
const pos = content.indexOf('给 renderExpertDetail 注入评价区');
if (pos === -1) {
  console.log('❌ 找不到问题代码');
  process.exit(1);
}

console.log('找到问题代码 at position:', pos);
console.log('--- 前 200 字符上下文 ---');
console.log(content.substring(Math.max(0, pos - 200), pos));
console.log('--- 问题代码及后 200 字符 ---');
console.log(content.substring(pos, Math.min(content.length, pos + 400)));
console.log('--- 前 10 个字符的 charCode ---');
for (let i = Math.max(0, pos - 10); i < pos + 50 && i < content.length; i++) {
  console.log('pos', i, 'char:', content[i], 'charCode:', content.charCodeAt(i));
}
