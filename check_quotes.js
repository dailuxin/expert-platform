const fs = require('fs');
const html = fs.readFileSync('C:/Users/dailu/Desktop/expert-platform/public/index.html', 'utf8');
// Search for the full pattern with "点击"
const idx = html.indexOf('\u70b9\u51fb'); // 点击
if (idx > -1) {
  const snippet = html.substring(idx-10, idx+60);
  console.log('Context around 点击:');
  console.log(JSON.stringify(snippet));
}
