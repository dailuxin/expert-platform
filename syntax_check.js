const fs = require('fs');
const h = fs.readFileSync('C:/Users/dailu/Desktop/expert-platform/public/index.html', 'utf8');
const scripts = h.match(/<script>([\s\S]*?)<\/script>/g);
console.log('Script blocks:', scripts.length);
scripts.forEach((s, i) => {
  const m = s.match(/<script>([\s\S]*?)<\/script>/);
  if (m) {
    try {
      new Function(m[1]);
      console.log('Script', i, 'OK, len:', m[1].length);
    } catch (e) {
      console.log('Script', i, 'ERROR:', e.message);
      const match = e.message.match(/at position (\d+)/);
      if (match) {
        const pos = parseInt(match[1]);
        console.log('Context around error:', m[1].substring(Math.max(0, pos - 50), pos + 50));
      }
    }
  }
});
process.exit(0);