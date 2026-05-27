// 修复 app.js 的 require 行，传入 requireAuth, requireExpert
const fs = require('fs');
const path = process.argv[2] || './app.js';
let c = fs.readFileSync(path, 'utf8');

// 替换 require 行
const oldLine = "require('./routes/rating.js')(app);";
const newLine = "require('./routes/rating.js')(app, requireAuth, requireExpert);";
if (!c.includes(oldLine)) {
  console.log('未找到 require 行，当前内容附近：');
  const idx = c.indexOf('routes/rating.js');
  if (idx > 0) console.log(c.substring(Math.max(0,idx-50), idx+80));
  process.exit(1);
}
c = c.split(oldLine).join(newLine);
fs.writeFileSync(path, c, 'utf8');
console.log('✅ 已更新 require 行，传入 requireAuth, requireExpert');

// 验证语法
try {
  require('child_process').execSync('node -c "' + path + '"', { stdio: 'pipe' });
  console.log('✅ 语法检查通过');
} catch(e) {
  console.log('❌ 语法错误');
}
