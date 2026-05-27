// 清理 app.js 中重复注入的评分 API，换成 require routes/rating.js
const fs = require('fs');
const path = process.argv[2] || './app.js';
let c = fs.readFileSync(path, 'utf8');

// 找 SPA 路由位置（注入点）
const spaIdx = c.lastIndexOf("app.get('*'");
if (spaIdx === -1) { console.log('未找到 SPA 路由'); process.exit(1); }

// 找所有 ===== Expert Rating & Ranking API ===== 的位置
let searchFrom = 0;
let blocks = [];
while (true) {
  const idx = c.indexOf('// ===== Expert Rating & Ranking API =====', searchFrom);
  if (idx === -1) break;
  blocks.push(idx);
  searchFrom = idx + 1;
}

console.log('找到 ' + blocks.length + ' 处注入块，位置:', blocks);

if (blocks.length === 0) {
  console.log('没有找到注入块，跳过清理');
} else {
  // 从后往前删，避免位置偏移
  // 每个块从标记开始，到下一个 app. 路由定义或 SPA 路由之前结束
  // 简单策略：删掉从第一个块开始到 SPA 路由之前的所有注入内容
  // 但更安全的做法：只删标记行到下一个非空白行（即下一个路由定义）之间的内容

  // 实际做法：找到第一个块的开头，删到 SPA 路由之前
  const startIdx = blocks[0];
  // 找 SPA 路由前的最后一个换行
  let endIdx = spaIdx;
  // 往前找到最后一个 '});' 或类似结束符
  // 简单做法：直接删从 startIdx 到 spaIdx 的所有内容，然后重新插入 require 行
  c = c.slice(0, startIdx) + c.slice(spaIdx);
  console.log('✅ 已清理 ' + blocks.length + ' 处注入块');
}

// 现在在 SPA 路由前插入 require 行
// 先找 SPA 路由的新位置（因为上面可能删了内容，位置变了）
const newSpaIdx = c.lastIndexOf("app.get('*'");
if (newSpaIdx === -1) { console.log('SPA 路由丢失！'); process.exit(1); }

const requireLine = "\n// Expert rating & ranking routes\nrequire('./routes/rating.js')(app);\n";
c = c.slice(0, newSpaIdx) + requireLine + c.slice(newSpaIdx);
console.log('✅ 已插入 require 行');

fs.writeFileSync(path, c, 'utf8');

// 验证语法
try {
  require('child_process').execSync('node -c "' + path + '"', { stdio: 'pipe' });
  console.log('✅ 语法检查通过');
} catch(e) {
  const out = e.stdout || e.stderr || '';
  console.log('❌ 语法错误:', out.toString().slice(0, 500));
}
