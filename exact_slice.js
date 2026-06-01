const fs = require('fs');
const html = fs.readFileSync('C:\\Users\\dailu\\Desktop\\expert-platform\\public\\index.html', 'utf8');

// Get exact string around stats-bar
const idx = html.indexOf('stats-bar');
const start = idx - 100;
const end = idx + 50;
const slice = html.substring(start, end);
console.log('EXACT slice:');
console.log(slice);
console.log('\nChar codes of last 30 chars before stats-bar:');
for (let i = idx - 30; i < idx; i++) {
  const c = html.charCodeAt(i);
  console.log(`  [${i}] ${c} = ${JSON.stringify(String.fromCharCode(c))}`);
}
