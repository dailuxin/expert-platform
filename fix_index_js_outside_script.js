// fix_index_js_outside_script.js
// 把裸在 index.html 外的 JS 代码移入 <script> 标签
const fs = require('fs');
const path = require('path');

const htmlPath = path.join(__dirname, 'public', 'index.html');
let content = fs.readFileSync(htmlPath, 'utf8');

// 要移动的 JS 代码块（从注释开始到函数结束）
const jsBlockPattern = /\/\/ 给 renderExpertDetail 注入评价区[\s\S]*?\}\;[\s]*\n/;
const match = content.match(jsBlockPattern);
if (!match) {
  console.log('❌ 找不到问题代码块');
  process.exit(1);
}
const jsCode = match[0];

// 从原位置删除
content = content.replace(jsCode, '');

// 找到空的 <script> 标签，把代码塞进去
const emptyScriptPattern = /<script>\s*<\/script>/;
if (!emptyScriptPattern.test(content)) {
  console.log('❌ 找不到空的 <script></script> 标签');
  process.exit(1);
}

content = content.replace(emptyScriptPattern, '<script>\n' + jsCode.trim() + '\n</script>');

fs.writeFileSync(htmlPath, content, 'utf8');
console.log('✅ 已修复：JavaScript 代码已移入 <script> 标签');
console.log('   代码段：', jsCode.trim().substring(0, 60) + '...');
