const fs = require('fs');
const p = 'C:\\Users\\dailu\\Desktop\\expert-platform\\public\\index.html';
const html = fs.readFileSync(p, 'utf8');
console.log('File size:', html.length);

// Find key functions
const funcs = ['function renderHome','function renderExpertDetail','function loadExperts','function showLogin','function showRegister','function openModal','function router'];
funcs.forEach(f => {
  const idx = html.indexOf(f);
  console.log(f + ':', idx);
});

// Find where to insert skeleton - look for the loading state in loadExperts
const leIdx = html.indexOf('function loadExperts(');
if (leIdx > 0) console.log('loadExperts snippet:', JSON.stringify(html.substring(leIdx, leIdx + 200)));
