// 修复 app.js：requireExpertApproved → requireExpert
const fs = require('fs');
const path = process.argv[2] || './app.js';
let c = fs.readFileSync(path, 'utf8');

const before = (c.match(/requireExpertApproved/g) || []).length;
c = c.replace(/requireExpertApproved/g, 'requireExpert');
const after = (c.match(/requireExpertApproved/g) || []).length;

fs.writeFileSync(path, c, 'utf8');
console.log('✅ 替换完成：' + before + ' 处 requireExpertApproved → requireExpert');

// 验证语法
try {
  require('child_process').execSync('node -c "' + path + '"', { stdio: 'pipe' });
  console.log('✅ 语法检查通过');
} catch(e) {
  console.log('❌ 语法错误');
}
