const fs = require('fs');
const p = 'C:\\Users\\dailu\\Desktop\\expert-platform\\public\\index.html';
const html = fs.readFileSync(p, 'utf8');

const s = html.indexOf('<script', 1057);
const openEnd = html.indexOf('>', s) + 1;
const closeStart = html.lastIndexOf('</script>');
const code = html.substring(openEnd, closeStart);

// Binary search
let lo=0, hi=code.length;
while(hi-lo>3){
  const m = Math.floor((lo+hi)/2);
  try{ new Function(code.substring(0,m)); lo=m; }
  catch(e){ hi=m; }
}
console.log('Last good:', lo, 'First bad:', hi);
console.log('Context:', JSON.stringify(code.substring(Math.max(0,lo-20), hi+20)));

// Show char codes around the break
for(let i=Math.max(0,lo-5); i<=Math.min(code.length,hi+5); i++) {
  console.log(i, code[i], code.charCodeAt(i).toString(16));
}
