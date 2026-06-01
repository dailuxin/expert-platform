const fs = require('fs');
const html = fs.readFileSync('C:\\Users\\dailu\\Desktop\\expert-platform\\public\\index.html', 'utf8');

// Find the exact text around the search button
const idx = html.indexOf('searchExperts()');
if (idx < 0) { console.log('not found'); process.exit(1); }
console.log('Context around searchExperts():');
console.log(JSON.stringify(html.substring(idx - 60, idx + 100)));
