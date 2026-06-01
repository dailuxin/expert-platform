const fs = require('fs');
const html = fs.readFileSync('C:\\Users\\dailu\\Desktop\\expert-platform\\public\\index.html', 'utf8');

// Show the EXACT bytes around the search button + stats-bar boundary
const idx = html.indexOf('stats-bar');
if (idx < 0) { console.log('stats-bar not found'); process.exit(1); }
console.log('Bytes around stats-bar:');
for (let i = idx - 80; i < idx + 20; i++) {
  const ch = html.charCodeAt(i);
  process.stdout.write(ch < 32 ? `\\n(${ch})` : String.fromCharCode(ch));
}
console.log('\n');

// Also show char codes
console.log('Char codes from', idx - 10, 'to', idx + 10);
for (let i = idx - 10; i < idx + 10; i++) {
  console.log(`  [${i}] = ${html.charCodeAt(i)} = '${String.fromCharCode(html.charCodeAt(i))}'`);
}
