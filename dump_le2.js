const fs = require('fs');
const p = 'C:\\Users\\dailu\\Desktop\\expert-platform\\public\\index.html';
const html = fs.readFileSync(p, 'utf8');

// Find loadExperts - it's after renderHome
const rhEnd = html.indexOf('function filterByIndustry(');
const afterRH = html.substring(rhEnd, rhEnd + 3000);
const leStart = afterRH.indexOf('async function loadExperts(');
console.log('loadExperts at offset:', rhEnd + leStart);
console.log(afterRH.substring(leStart, leStart + 800));

// Find showExpertDetail to understand the detail page flow
const sedIdx = html.indexOf('function showExpertDetail(');
if (sedIdx > 0) console.log('\nshowExpertDetail:', JSON.stringify(html.substring(sedIdx, sedIdx + 200)));
