const fs = require('fs');
const p = String.raw`C:\Users\dailu\Desktop\expert-platform\public\index.html`;
const html = fs.readFileSync(p, 'utf8');

// Find expertList closing
const el = html.indexOf('expertList');
console.log('expertList at:', el);
console.log('Context:', JSON.stringify(html.substring(el, el + 80)));

// Find </div></div>";document after expertList
const afterExpert = html.indexOf('expertList"></div>');
if (afterExpert > 0) {
  console.log('After expertList:', JSON.stringify(html.substring(afterExpert, afterExpert + 60)));
}

// Try different quote patterns
const patterns = [
  'expertList"></div></div>"',
  'expertList\\"></div></div>\\"',
  'expertList\\"/></div></div>\\"'
];
for (const pat of patterns) {
  console.log(pat, ':', html.includes(pat));
}
