const fs = require('fs');
const html = fs.readFileSync('C:\\Users\\dailu\\Desktop\\expert-platform\\public\\index.html', 'utf8');
const scripts = html.match(/<script[^>]*>([\s\S]*?)<\/script>/gi);
if (scripts) {
  for (let i = 0; i < scripts.length; i++) {
    const code = scripts[i].replace(/<script[^>]*>/i, '').replace(/<\/script>/i, '');
    if (code.trim()) {
      if (code.includes('<') || code.includes('href=')) {
        console.log('Script', i, 'has HTML content issue');
      } else {
        try {
          new Function(code);
          console.log('Script', i, 'OK');
        } catch(e) {
          console.log('Script', i, 'ERROR:', e.message);
        }
      }
    }
  }
}