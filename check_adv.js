const fs = require('fs');
const p = 'C:\\Users\\dailu\\Desktop\\expert-platform\\public\\index.html';
let html = fs.readFileSync(p, 'utf8');

// Find the adv search panel
const advIdx = html.indexOf('advSearchPanel');
if (advIdx > 0) {
  console.log('advSearchPanel context:', JSON.stringify(html.substring(advIdx - 50, advIdx + 300)));
}

// Also check if search-panel CSS exists
const css = fs.readFileSync(p.replace('index.html', 'style.css'), 'utf8');
console.log('\nsearch-panel in CSS:', css.includes('.search-panel'));
if (css.includes('.search-panel')) {
  const spIdx = css.indexOf('.search-panel');
  console.log(css.substring(spIdx, spIdx + 200));
}
