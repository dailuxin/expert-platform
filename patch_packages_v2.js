// 给 index.html 引入 packages.js + 加导航入口 + 加 CSS
const fs = require('fs');
const file = process.argv[2] || './public/index.html';
let c = fs.readFileSync(file, 'utf8');
let patched = 0;

// 1. 加 CSS（在 </style> 前插入）
if (!c.includes('.pkg-card')) {
  const css = '\n' +
    '    .pkg-card{background:#fff;border-radius:8px;padding:16px;margin-bottom:12px;box-shadow:0 1px 4px rgba(0,0,0,0.08);}\n' +
    '    .pkg-price{font-size:20px;font-weight:700;color:#e53e3e;margin:8px 0;}\n' +
    '    .pkg-duration{font-size:13px;color:#718096;}\n' +
    '    .pkg-actions{margin-top:10px;}\n';
  c = c.replace('</style>', css + '    </style>');
  patched++;
  console.log('✅ 已加套餐相关 CSS');
}

// 2. 加 <script src="/packages.js"></script>（在 </head> 前插入）
if (!c.includes('packages.js')) {
  const script = '<script src="/packages.js"></script>\n';
  c = c.replace('</head>', script + '</head>');
  patched++;
  console.log('✅ 已加 packages.js 引用');
}

// 3. 导航栏加「服务套餐」入口（在「我的收益」后面插入）
if (!c.includes('renderServicePackages')) {
  const target = '我的收益</a>';
  const idx = c.indexOf(target);
  if (idx > 0) {
    const endIdx = c.indexOf('</a>', idx) + 4;
    const insert = '<a href="#" onclick="renderServicePackages();return false;" class="nav-link">服务套餐</a>';
    c = c.slice(0, endIdx) + insert + c.slice(endIdx);
    patched++;
    console.log('✅ 已加导航栏「服务套餐」入口');
  } else {
    console.log('⚠️  未找到「我的收益」链接，跳过导航入口');
  }
} else {
  console.log('✅ 服务套餐入口已存在');
  patched++;
}

fs.writeFileSync(file, c, 'utf8');
console.log('\n完成！共修改 ' + patched + ' 处');
