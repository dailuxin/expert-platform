#!/usr/bin/env node
// Railway 启动脚本 - 带错误诊断
console.log('[启动] Node.js 版本:', process.version);
console.log('[启动] 平台:', process.platform, process.arch);
console.log('[启动] 工作目录:', process.cwd());
console.log('[启动] 环境变量 PORT:', process.env.PORT);

try {
  const app = require('./app.js');
  console.log('[启动] app.js 加载成功');
} catch(err) {
  console.error('[致命错误]', err.message);
  console.error('[错误堆栈]', err.stack);
  process.exit(1);
}
