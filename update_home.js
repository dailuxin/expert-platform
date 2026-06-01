const fs = require('fs');
const path = 'C:\\Users\\dailu\\Desktop\\expert-platform\\public\\index.html';
let html = fs.readFileSync(path, 'utf8');

// 替换 hero 区域的文案和新增搜索框 placeholder
let modified = false;

if (html.includes('实名认证 · 评价透明 · 预约便捷')) {
  html = html.replace('实名认证 · 评价透明 · 预约便捷', '24年行业深耕 · 10000+成功案例 · 98%客户满意度');
  modified = true;
}

if (html.includes('placeholder="搜索专家..."')) {
  html = html.replace('placeholder="搜索专家..."', 'placeholder="搜索专家姓名/擅长领域..."');
  modified = true;
}

// 添加统计数据区域（在 backBtn 之后，expertSection 之前）
const statsBar = '<div class="stats-bar"><div class="stat-item"><div class="stat-num">128</div><div class="stat-label">入驻专家</div></div><div class="stat-item"><div class="stat-num">3650+</div><div class="stat-label">完成咨询</div></div><div class="stat-item"><div class="stat-num">98%</div><div class="stat-label">满意率</div></div><div class="stat-item"><div class="stat-num">15分钟</div><div class="stat-label">快速响应</div></div></div>';

if (!html.includes('class="stats-bar"')) {
  // 找到 backBtn 后的位置插入 stats-bar
  const insertPos = html.indexOf('backBtn+"<div id=\\"expertSection\\">');
  if (insertPos > 0) {
    html = html.slice(0, insertPos) + statsBar + html.slice(insertPos);
    modified = true;
  }
}

// 添加 features 区域
const features = '<div class="features"><div class="feature"><div class="feature-icon">✓</div><div class="feat-title">实名认证</div><div class="feat-desc">专家100%实名认证，资质审核</div></div><div class="feature"><div class="feature-icon">✓</div><div class="feat-title">透明评价</div><div class="feat-desc">真实用户评价，看得见的口碑</div></div><div class="feature"><div class="feature-icon">✓</div><div class="feat-title">支付保障</div><div class="feat-desc">平台托管，满意后再确认</div></div><div class="feature"><div class="feature-icon">✓</div><div class="feat-title">售后无忧</div><div class="feat-desc">不满意可退款，权益有保障</div></div></div>';

if (!html.includes('class="features"')) {
  const insertPos = html.indexOf('backBtn+"<div id=\\"expertSection\\">');
  if (insertPos > 0) {
    html = html.slice(0, insertPos) + features + html.slice(insertPos);
    modified = true;
  }
}

if (modified) {
  fs.writeFileSync(path, html, 'utf8');
  console.log('Updated');
} else {
  console.log('Nothing to update');
}