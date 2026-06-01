const fs = require('fs');
const p = 'C:\\Users\\dailu\\Desktop\\expert-platform\\public\\index.html';
const html = fs.readFileSync(p, 'utf8');

// Find toggleAdvSearch function
const taIdx = html.indexOf('function toggleAdvSearch');
if (taIdx > 0) {
  console.log('toggleAdvSearch:', html.substring(taIdx, taIdx + 200));
}

// Find the full adv search panel HTML
const advStart = html.indexOf('id="advSearchPanel"');
if (advStart > 0) {
  // Find the closing of this div - look for next </div> that closes it
  // The panel ends before </div>"+backBtn or similar
  const panelHtml = html.substring(advStart, advStart + 500);
  console.log('\nPanel HTML:', JSON.stringify(panelHtml));
}
