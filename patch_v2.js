// 补丁 v2：用正则匹配，不依赖精确字符串
const fs = require('fs');
const filePath = process.argv[2] || './public/index.html';

let content = fs.readFileSync(filePath, 'utf8');
let patchCount = 0;

// 1. 导航栏：在「我的文章」链接后加「我的收益」
//    允许任意空白和引号差异
const navRegex = /(if\(currentExpert\)h\+=.*?renderArticles.*?;.+?)(h\+=.*?renderFavorites)/;
const navMatch = content.match(navRegex);
if (navMatch) {
  const replacement = navMatch[1] + 'h+="<a onclick=\\"renderWallet()\\">我的收益</a>";' + navMatch[2];
  content = content.replace(navRegex, replacement);
  console.log('✅ 导航栏：已加「我的收益」');
  patchCount++;
} else {
  console.log('⚠️  导航栏：正则未匹配，尝试直接查找...');
  // 更宽松的查找
  if (content.includes('renderArticles') && !content.includes('renderWallet')) {
    // 在 renderFavorites 前面插入
    const idx = content.indexOf('renderFavorites');
    if (idx > 0) {
      const insert = 'h+="<a onclick=\\"renderWallet()\\">我的收益</a>";';
      content = content.slice(0, idx) + insert + content.slice(idx);
      console.log('✅ 导航栏：已通过插入方式加入「我的收益」');
      patchCount++;
    }
  }
}

// 2. 管理后台 Tab：在「退款管理」后加「营收统计」
const tabRegex = /(adminTab\(\\s*'refunds.*?\).*?退款管理.*?<\/span>)/;
const tabMatch = content.match(tabRegex);
if (tabMatch) {
  const replacement = tabMatch[1] + '<span class="tab" onclick="adminTab(\\'revenue\\')">营收统计</span>';
  content = content.replace(tabRegex, replacement);
  console.log('✅ 管理后台 Tab：已加「营收统计」');
  patchCount++;
} else {
  console.log('⚠️  管理后台 Tab：正则未匹配');
  // 直接查找 refunds tab 并插入
  const refundsTab = "adminTab('refunds')";
  const idx = content.indexOf(refundsTab);
  if (idx > 0) {
    // 找到 </span> 后的位置
    const afterSpan = content.indexOf('</span>', idx);
    if (afterSpan > 0) {
      const insertPos = afterSpan + '</span>'.length;
      const insert = '<span class="tab" onclick="adminTab(\\'revenue\\')">营收统计</span>';
      content = content.slice(0, insertPos) + insert + content.slice(insertPos);
      console.log('✅ 管理后台 Tab：已通过插入方式加入「营收统计」');
      patchCount++;
    }
  }
}

// 3. 确认 adminTab 函数有 revenue 分支（之前已成功）
if (!content.includes('adminRevenue()')) {
  // 在 if(tab==="logs")adminLogs(); 后面加
  const logsLine = "if(tab===\"logs\")adminLogs();";
  if (content.includes(logsLine)) {
    content = content.replace(logsLine, logsLine + 'if(tab==="revenue")adminRevenue();');
    console.log('✅ adminTab：已加 revenue 分支');
    patchCount++;
  }
} else {
  console.log('✅ adminTab：revenue 分支已存在');
  patchCount++;
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('\n共修改 ' + patchCount + ' 处，文件已保存');
