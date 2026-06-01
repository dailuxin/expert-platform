const fs = require('fs');
const h = fs.readFileSync('C:/Users/dailu/Desktop/expert-platform/public/index.html', 'utf8');
const m = h.match(/<script>([\s\S]*?)<\/script>/g);
console.log('Total script tags:', m ? m.length : 0);
if (m) m.forEach((s, i) => console.log('Block', i, 'len', s.length, ':', s.substring(0, 60)));
process.exit(0);