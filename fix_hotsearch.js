const fs = require('fs');
const p = 'C:\\Users\\dailu\\Desktop\\expert-platform\\public\\index.html';
let html = fs.readFileSync(p, 'utf8');

// The bug is in loadHotSearches: value=\''  inside single-quoted string
// Fix: use escaped single quotes properly
// Current broken: .value=\\'  (which renders as \' and breaks the outer single-quote string)
// Need to change the inner HTML generation to avoid the conflict

// Find loadHotSearches function and replace it entirely
const oldLHS = 'function loadHotSearches(){var tags=["人工智能","数据分析","商业咨询","法律顾问","心理咨询","投资理财"];var el=document.getElementById("hotSearches");if(!el)return;var h="";for(var i=0;i<tags.length;i++){h+=\'<span class="hot-tag" onclick="document.getElementById(\\\'searchInput\\\').value=\\\'+tags[i]+\\\';searchExperts()">\'+tags[i]+\'</span>\';}el.innerHTML=h;}';

const newLHS = 'function loadHotSearches(){var tags=["人工智能","数据分析","商业咨询","法律顾问","心理咨询","投资理财"];var el=document.getElementById("hotSearches");if(!el)return;var h="";for(var i=0;i<tags.length;i++){h+="<span class=\\"hot-tag\\" onclick=\\"document.getElementById(\'searchInput\').value=\'"+tags[i]+"\'\\">"+tags[i]+"</span>";}el.innerHTML=h;}';

if (html.includes('function loadHotSearches')) {
  // Find exact boundaries
  const start = html.indexOf('function loadHotSearches');
  const end = html.indexOf('function loadCouponBanner');
  const oldCode = html.substring(start, end);
  console.log('Current loadHotSearches:', JSON.stringify(oldCode.substring(0, 200)));
  
  html = html.substring(0, start) + newLHS + html.substring(end);
  console.log('Replaced loadHotSearches');
}

// Validate
const s = html.indexOf('<script', 1057);
const openEnd = html.indexOf('>', s) + 1;
const closeStart = html.lastIndexOf('</script>');
const code = html.substring(openEnd, closeStart);
try {
  new Function(code);
  console.log('Syntax OK');
} catch(e) {
  console.log('Syntax ERROR:', e.message);
  let lo=0, hi=code.length;
  while(hi-lo>3){const m=Math.floor((lo+hi)/2);try{new Function(code.substring(0,m));lo=m}catch(e){hi=m}}
  console.log('Near', lo, JSON.stringify(code.substring(Math.max(0,lo-30), lo+30)));
}

fs.writeFileSync(p, html, 'utf8');
console.log('Saved');
