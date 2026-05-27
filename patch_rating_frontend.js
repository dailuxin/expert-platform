// 给 index.html 引入 rating.js + 加「专家排名」导航入口
const fs = require('fs');
const file = process.argv[2] || './public/index.html';
let c = fs.readFileSync(file, 'utf8');
let patched = 0;

// 1. 引入 rating.js（在 </head> 前插入）
if (!c.includes('rating.js')) {
  c = c.replace('</head>', '<script src="/rating.js"></script>\n</head>');
  patched++;
  console.log('✅ 已引入 rating.js');
}

// 2. 导航栏加「专家排名」入口（在「服务套餐」后面插入）
if (!c.includes('renderRanking')) {
  // 找「服务套餐」nav-link 的位置
  const target = 'renderServicePackages();return false;';
  const idx = c.indexOf(target);
  if (idx > 0) {
    // 找到 </a> 的结束位置
    const endA = c.indexOf('</a>', idx) + 4;
    const insert = '<a href="#" onclick="renderRanking();return false;" class="nav-link">专家排名</a>';
    c = c.slice(0, endA) + insert + c.slice(endA);
    patched++;
    console.log('✅ 已加「专家排名」导航入口');
  } else {
    console.log('⚠️  未找到「服务套餐」入口，跳过排名导航');
  }
} else {
  console.log('✅ 「专家排名」入口已存在');
  patched++;
}

// 3. 在 renderExpertDetail 末尾注入 injectReviews 调用
//    找 renderExpertDetail 函数的末尾（最后一个 app.innerHTML 之后）
if (!c.includes('injectReviews')) {
  // 简单策略：在 </script> 前注入一段代码，给 renderExpertDetail 打补丁
  const patch = `
// 给 renderExpertDetail 注入评价区
const _origRenderExpertDetail = renderExpertDetail;
renderExpertDetail = function(id) {
  _origRenderExpertDetail(id);
  // 等 DOM 更新后注入评价
  setTimeout(() => injectReviews(id), 100);
};
`;
  c = c.replace('</script>', patch + '\n</script>');
  patched++;
  console.log('✅ 已注入 injectReviews 调用');
}

fs.writeFileSync(file, c, 'utf8');
console.log('\n完成！共修改 ' + patched + ' 处');
