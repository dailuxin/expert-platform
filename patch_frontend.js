// 补丁脚本：给 index.html 加导航入口和管理后台 Tab
const fs = require('fs');
const filePath = process.argv[2] || './public/index.html';

let content = fs.readFileSync(filePath, 'utf8');

// 1. 在导航栏的「我的文章」后面加「我的收益」链接
//    匹配：if(currentExpert)h+="<a onclick=\"renderArticles()\">我的文章</a>";h+="<a onclick=\"renderFavorites()\">我的收藏</a>"
const navOld = 'if(currentExpert)h+="<a onclick=\\"renderArticles()\\">我的文章</a>";h+="<a onclick=\\"renderFavorites()\\">我的收藏</a>"';
const navNew = 'if(currentExpert)h+="<a onclick=\\"renderArticles()\\">我的文章</a><a onclick=\\"renderWallet()\\">我的收益</a>";h+="<a onclick=\\"renderFavorites()\\">我的收藏</a>"';
if (content.includes(navOld)) {
  content = content.replace(navOld, navNew);
  console.log('✅ 导航栏：已加「我的收益」');
} else {
  console.log('⚠️  导航栏：未找到匹配文本');
}

// 2. 在 adminTab 函数的 tab 列表里加「营收统计」Tab
//    匹配：<span class=\"tab\" onclick=\"adminTab('refunds')\">退款管理</span>
const tabOld = '<span class="tab" onclick="adminTab(\'refunds\')">退款管理</span><span class="tab" onclick="adminTab(\'logs\')">登录日志</span>';
const tabNew = '<span class="tab" onclick="adminTab(\'refunds\')">退款管理</span><span class="tab" onclick="adminTab(\'revenue\')">营收统计</span><span class="tab" onclick="adminTab(\'logs\')">登录日志</span>';
if (content.includes(tabOld)) {
  content = content.replace(tabOld, tabNew);
  console.log('✅ 管理后台：已加「营收统计」Tab');
} else {
  console.log('⚠️  管理后台 Tab：未找到匹配文本，尝试备用匹配...');
  // 备用：只匹配退款管理 tab
  const tabOld2 = '<span class="tab" onclick="adminTab(\'refunds\')">退款管理</span>';
  const tabNew2 = '<span class="tab" onclick="adminTab(\'refunds\')">退款管理</span><span class="tab" onclick="adminTab(\'revenue\')">营收统计</span>';
  if (content.includes(tabOld2)) {
    content = content.replace(tabOld2, tabNew2);
    console.log('✅ 管理后台：已加「营收统计」Tab（备用匹配）');
  } else {
    console.log('❌ 管理后台 Tab：备用匹配也失败');
  }
}

// 3. 在 adminTab 点击处理里加 revenue 分支
//    匹配：if(tab==="logs")adminLogs();
const adminOld = 'if(tab==="logs")adminLogs();';
const adminNew = 'if(tab==="logs")adminLogs();if(tab==="revenue")adminRevenue();';
if (content.includes(adminOld)) {
  content = content.replace(adminOld, adminNew);
  console.log('✅ adminTab 函数：已加 revenue 分支');
} else {
  console.log('⚠️  adminTab 函数：未找到匹配文本');
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('\n完成！文件已保存：' + filePath);
