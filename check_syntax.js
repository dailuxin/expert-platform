const fs = require('fs');
const html = fs.readFileSync('C:\\Users\\dailu\\Desktop\\expert-platform\\public\\index.html', 'utf8');
const scripts = html.match(/<script[^>]*>([\s\S]*?)<\/script>/gi);
if (scripts) {
  for (let i = 0; i < scripts.length; i++) {
    const code = scripts[i].replace(/<script[^>]*>/i, '').replace(/<\/script>/i, '');
    if (code.trim()) {
      try {
        new Function(code);
        console.log('Script', i, 'OK');
      } catch (e) {
        console.error('Script', i, 'ERROR:', e.message);
        const lines = code.split('\n');
        const start = Math.max(0, (e.lineNumber || 1) - 3);
        for (let j = start; j < Math.min(lines.length, start + 7); j++) {
          console.log((j + 1) + ':', lines[j]);
        }
      }
    }
  }
}
