const fs = require('fs');
const html = fs.readFileSync('C:\\Users\\dailu\\Desktop\\expert-platform\\public\\index.html', 'utf8');

// Find ALL searchExperts() occurrences and show context
let pos = 0;
let count = 0;
while ((pos = html.indexOf('searchExperts()', pos)) !== -1) {
  count++;
  console.log(`\n#${count} at ${pos}:`);
  console.log(JSON.stringify(html.substring(Math.max(0, pos - 40), pos + 60)));
  pos += 14;
}
console.log('\nTotal:', count);

// Also find the stats-bar to understand structure
const statsIdx = html.indexOf('stats-bar');
if (statsIdx > 0) {
  console.log('\nStats bar context:');
  console.log(JSON.stringify(html.substring(statsIdx - 30, statsIdx + 100)));
}
