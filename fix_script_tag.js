// 修复 index.html 中 <script src="/packages.js"> 缺少 </script> 的问题
const fs = require('fs');
const file = process.argv[2] || './public/index.html';
let c = fs.readFileSync(file, 'utf8');

// 将 <script src="/packages.js"> 替换为正确的 <script src="/packages.js"></script>
const bad = '<script src="/packages.js">';
const good = '<script src="/packages.js"></script>';
let count = 0;
while (c.includes(bad)) {
  c = c.replace(bad, good);
  count++;
}
console.log('✅ 已修复 ' + count + ' 处 <script src="/packages.js"> 标签');

fs.writeFileSync(file, c, 'utf8');
console.log('✅ 已写入 ' + file);

// 验证修复结果
const verify = fs.readFileSync(file, 'utf8');
const lines = verify.split('\n');
let ok = true;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('<script src="/packages.js">') && !lines[i].includes('</script>')) {
    console.log('⚠️  第 ' + (i+1) + ' 行仍有问题: ' + lines[i]);
    ok = false;
  }
}
if (ok) console.log('✅ 验证通过：所有 <script> 标签格式正确');
