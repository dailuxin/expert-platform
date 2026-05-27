// 用中文字符定位，完全避开引号问题
const fs = require('fs');
const file = process.argv[2] || './public/index.html';
let c = fs.readFileSync(file, 'utf8');

const target = '退款管理</span>';
const idx = c.indexOf(target);
if (idx === -1) { console.log('未找到退款管理'); process.exit(1); }

// 在退款管理</span> 后找下一个 <span class= 的位置
let pos = idx + target.length;
const nextSpan = c.indexOf('<span', pos);
if (nextSpan === -1) { console.log('未找到下一个span'); process.exit(1); }

const insert = '<span class="tab" onclick="adminTab(\'revenue\')">营收统计</span>';
c = c.slice(0, nextSpan) + insert + c.slice(nextSpan);

fs.writeFileSync(file, c, 'utf8');
console.log('✅ 已插入营收统计 Tab');
// 验证
const verify = fs.readFileSync(file, 'utf8');
console.log('验证 revenue tab:', verify.includes('营收统计') ? '存在 ✅' : '不存在 ❌');
