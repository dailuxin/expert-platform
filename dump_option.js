const fs = require('fs');
const p = 'C:\\Users\\dailu\\Desktop\\expert-platform\\public\\index.html';
const html = fs.readFileSync(p, 'utf8');

// Find the exact bytes around "不限" in the rating select
const idx = html.indexOf('filterMinRating');
if (idx > 0) {
  const chunk = html.substring(idx, idx + 200);
  console.log('Raw chars:');
  for (let i = 0; i < chunk.length; i++) {
    console.log(i, chunk[i], chunk.charCodeAt(i).toString(16));
  }
}
