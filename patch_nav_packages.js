// 精准定位 index.html 导航栏并插入「服务套餐」入口
const fs = require('fs');
const path = process.argv[2] || './public/index.html';
let c = fs.readFileSync(path, 'utf8');

// 找 renderWallet（我的收益）的位置
const target = 'renderWallet();return false;';
const idx = c.indexOf(target);
if (idx === -1) {
  console.log('未找到 renderWallet，尝试找 renderNotifications...');
  const idx2 = c.indexOf('renderNotifications();return false;');
  if (idx2 === -1) {
    console.log('未找到任何导航入口，无法插入');
    process.exit(1);
  }
  // 在通知入口后插入
  const insert = '<a href="#" onclick="renderServicePackages();return false;" class="nav-link">服务套餐</a>';
  const endA = c.indexOf('</a>', idx2) + 4;
  c = c.slice(0, endA) + insert + c.slice(endA);
  console.log('✅ 已在「通知」后插入「服务套餐」入口');
} else {
  // 在「我的收益」后插入
  const insert = '<a href="#" onclick="renderServicePackages();return false;" class="nav-link">服务套餐</a>';
  const endA = c.indexOf('</a>', idx) + 4;
  c = c.slice(0, endA) + insert + c.slice(endA);
  console.log('✅ 已在「我的收益」后插入「服务套餐」入口');
}

fs.writeFileSync(path, c, 'utf8');
console.log('完成');
