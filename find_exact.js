const fs = require('fs');
const indexPath = 'C:\\Users\\dailu\\Desktop\\expert-platform\\public\\index.html';
let html = fs.readFileSync(indexPath, 'utf8');

// EXACT match - the file contains raw JS with escaped quotes \"
const target = 'searchExperts()">搜索</button></div></div>"+<div class="stats-bar">';
const found = html.includes(target);
console.log('Exact match:', found);

if (!found) {
  // Try with escaped quotes
  const t2 = 'searchExperts()\\">搜索</button></div></div>"+<div class="stats-bar">';
  console.log('Escaped match:', html.includes(t2));
  
  // Show what we actually have at position 5980
  console.log('At 5980:', JSON.stringify(html.substring(5980, 6040)));
}

// Try the most literal match possible
const searchBtn = 'searchExperts()';
let pos = html.indexOf(searchBtn);
while (pos !== -1) {
  const ctx = html.substring(pos, pos + 80);
  if (ctx.includes('stats-bar')) {
    console.log('Found combo at:', pos);
    console.log('Context:', JSON.stringify(html.substring(pos - 5, pos + 80)));
    break;
  }
  pos = html.indexOf(searchBtn, pos + 1);
}
