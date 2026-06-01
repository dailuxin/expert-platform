const fs = require('fs');
const html = fs.readFileSync('C:\\Users\\dailu\\Desktop\\expert-platform\\public\\index.html', 'utf8');

// Find the search box text in renderHome
const searches = ['searchExperts()">搜索</button></div></div>"', 'searchExperts()">搜索</button></div></div>\\"'];
for (const s of searches) {
  const idx = html.indexOf(s);
  console.log('Search for:', s.substring(0, 30), '-> index:', idx);
}

// Show context around "搜索" button
const btnIdx = html.indexOf('onclick=\\"searchExperts()\\">搜索');
console.log('\nButton context:', html.substring(btnIdx - 20, btnIdx + 80));

// Also check for hotSearches (already added by v1)
console.log('\nHas hotSearches:', html.includes('hotSearches'));
console.log('Has advSearch:', html.includes('advSearchPanel'));
console.log('Has couponBanner:', html.includes('couponBanner'));
console.log('Has faq-section:', html.includes('faq-section'));
