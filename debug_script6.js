const fs = require('fs');
const html = fs.readFileSync('C:\\Users\\dailu\\Desktop\\expert-platform\\public\\index.html', 'utf8');

// 找到 Script 6 的内容（主脚本块）
const scripts = html.match(/<script[^>]*>([\s\S]*?)<\/script>/gi);
if (scripts && scripts[6]) {
  const code = scripts[6].replace(/<script[^>]*>/i, '').replace(/<\/script>/i, '');
  const lines = code.split('\n');
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('<') && !lines[i].trim().startsWith('//')) {
      console.log('Line', i + 1, 'has <:', lines[i].substring(0, 100));
    }
  }
}
