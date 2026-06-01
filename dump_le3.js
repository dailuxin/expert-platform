const fs = require('fs');
const p = 'C:\\Users\\dailu\\Desktop\\expert-platform\\public\\index.html';
const html = fs.readFileSync(p, 'utf8');

// Full loadExperts
const leStart = 7708;
const leEnd = html.indexOf('function renderExpertDetail(');
console.log('loadExperts full (' + (leEnd - leStart) + ' chars):');
console.log(html.substring(leStart, leEnd));

// Also find expert card rendering in loadExperts
const cardIdx = html.indexOf('function renderExpertCard(');
if (cardIdx < 0) {
  // Maybe inline in loadExperts
  console.log('\nNo separate renderExpertCard');
  // Check for card HTML pattern
  const cardStart = html.indexOf('expert-card', leStart);
  if (cardStart > 0 && cardStart < leEnd) {
    console.log('Card pattern at:', cardStart);
  }
}
