const fs = require('fs');
const h = fs.readFileSync('C:/Users/dailu/Desktop/expert-platform/public/index.html', 'utf8');

// Find all class="tab" (unescaped) occurrences
const badRegex = /class="tab"/g;
let match;
let count = 0;
while ((match = badRegex.exec(h)) !== null) {
  count++;
  console.log('Unescaped class="tab" at', match.index, ':', JSON.stringify(h.substring(match.index - 20, match.index + 50)));
}
console.log('Total unescaped:', count);

// Check what's around the revenue tab specifically
const revenueIdx = h.indexOf("adminTab('revenue')");
if (revenueIdx > -1) {
  console.log('\nRevenue tab context:', JSON.stringify(h.substring(revenueIdx - 100, revenueIdx + 100)));
}

process.exit(0);