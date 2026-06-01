const fs = require('fs');
const html = fs.readFileSync('C:/Users/dailu/Desktop/expert-platform/public/index.html', 'utf8');
const scripts = html.match(/<script[^>]*>([\s\S]*?)<\/script>/g);
const content = scripts[6].replace(/<\/?script[^>]*>/g, '');

// 找到 renderProfile 函数
const rpStart = content.indexOf('async function renderProfile');
const rpEnd = content.indexOf('async function renderVerification');
const rpFunc = content.substring(rpStart, rpEnd);

console.log('=== renderProfile 函数 ===');
console.log(rpFunc.substring(0, 500));

// 检查是否有语法问题
// 查找 h+= 后面的字符串拼接
const hPlus = rpFunc.indexOf("h+='<div class=\"alert ");
if (hPlus > -1) {
  console.log('\n找到 alert 拼接，位置:', hPlus);
  console.log('上下文:', rpFunc.substring(hPlus, hPlus + 100));
}

// 尝试解析这个函数
try {
  new Function(rpFunc);
  console.log('\nrenderProfile: 语法 OK');
} catch(e) {
  console.log('\nrenderProfile 语法错误:', e.message);
}

// 找到 renderVerification 函数
const rvStart = content.indexOf('async function renderVerification');
const rvEnd = content.indexOf('async function submitVerification');
const rvFunc = content.substring(rvStart, rvEnd);

console.log('\n=== renderVerification 函数 ===');
console.log(rvFunc.substring(0, 500));

// 检查是否有语法问题
const alertIdx = rvFunc.indexOf('alert "');
if (alertIdx > -1) {
  console.log('\n找到 alert "，位置:', alertIdx);
  console.log('上下文:', rvFunc.substring(alertIdx - 20, alertIdx + 50));
}

// 尝试解析这个函数
try {
  new Function(rvFunc);
  console.log('\nrenderVerification: 语法 OK');
} catch(e) {
  console.log('\nrenderVerification 语法错误:', e.message);
}
