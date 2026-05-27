// 重构 index.html：提取 <style> 为外部 style.css
const fs = require('fs');
const file = process.argv[2] || './public/index.html';
let c = fs.readFileSync(file, 'utf8');

const styleStart = c.indexOf('<style>');
const styleEnd = c.indexOf('</style>', styleStart);
if (styleStart === -1 || styleEnd === -1) {
  console.log('❌ 未找到 <style> 标签');
  process.exit(1);
}

const css = c.slice(styleStart + 7, styleEnd).trim();
fs.writeFileSync('./public/style.css', css, 'utf8');
console.log('✅ 已提取 CSS 到 public/style.css，大小: ' + css.length + ' 字节');

// 替换 <style>...</style> 为 <link>
const before = c.slice(0, styleStart);
const after = c.slice(styleEnd + 8);
const replacement = '<link rel="stylesheet" href="/style.css">';
c = before + replacement + after;
fs.writeFileSync(file, c, 'utf8');
console.log('✅ 已替换 <style> 为 <link rel="stylesheet">');

// 验证替换后没有遗留 <style> 内容
const verify = fs.readFileSync(file, 'utf8');
if (verify.includes('<style>') && verify.indexOf('<style>') === verify.lastIndexOf('<style>')) {
  console.log('⚠️  警告：文件中仍有 <style> 标签');
} else {
  console.log('✅ 验证通过：<style> 已完全替换');
}
