const fs = require('fs');
const p = 'C:\\Users\\dailu\\Desktop\\expert-platform\\public\\index.html';
const html = fs.readFileSync(p, 'utf8');

// Find the EXACT bytes around value="">
const idx = html.indexOf('option value');
console.log('All option value occurrences:');
let searchFrom = 0;
while (true) {
  const i = html.indexOf('option value', searchFrom);
  if (i < 0) break;
  console.log(`  @${i}: ${JSON.stringify(html.substring(i, i+20))}`);
  searchFrom = i + 1;
}

// Show raw bytes for first one
const firstIdx = html.indexOf('option value');
console.log('\nRaw bytes around first occurrence:');
for (let i = firstIdx + 6; i < firstIdx + 15; i++) {
  console.log(`  ${i}: '${html[i]}' (0x${html.charCodeAt(i).toString(16)})`);
}
