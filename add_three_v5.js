const fs = require('fs');
const p = 'C:\\Users\\dailu\\Desktop\\expert-platform\\public\\index.html';
let html = fs.readFileSync(p, 'utf8');

// Step 1: Skeleton in loadExperts
html = html.replace(
  'const data=await fetch(API+url).then(r=>r.json());',
  'showSkeleton();const data=await fetch(API+url).then(r=>r.json());'
);
console.log('1. Skeleton in loadExperts');

// Step 2: Detail page skeleton
html = html.replace(
  'function renderExpertDetail(id){const e=await fetch(API+"/experts/"+id)',
  'function renderExpertDetail(id){var _a=document.getElementById("app");if(_a)_a.innerHTML="<div style=\\"padding:40px;text-align:center\\"><div class=\\"skeleton skeleton-circle\\" style=\\"width:120px;height:120px;margin:0 auto 20px\\"></div><div class=\\"skeleton skeleton-line\\" style=\\"width:200px;margin:0 auto 12px\\"></div><div class=\\"skeleton skeleton-line short\\" style=\\"width:150px;margin:0 auto\\"></div></div>";const e=await fetch(API+"/experts/"+id)'
);
console.log('2. Detail skeleton');

// Step 3: Floating CTA call
html = html.replace(
  'loadPackages(id,"packagesContainer");',
  'loadPackages(id,"packagesContainer");addFloatingCTA(id,e.real_name||"专家");'
);
console.log('3. Floating CTA');

// Step 4: Hero CTA - build replacement carefully
// The target pattern in the file is exactly: "+backBtn+"<div class=\"stats-bar\">
// We need to insert hero-cta-row before stats-bar
const heroTarget = '"+backBtn+"<div class=\\"stats-bar\\">';
const heroReplacement = '"+backBtn+"<div class=\\"hero-cta-row\\"><a class=\\"btn btn-cta-hero\\" onclick=\\"document.getElementById(\\\'expertList\\\').scrollIntoView({behavior:\\\'smooth\\\'})\\">🔍 浏览推荐专家</a><a class=\\"btn btn-cta-hero btn-cta-outline\\" onclick=\\"event.preventDefault();showRegister()\\">👨‍💼 成为平台专家</a></div><div class=\\"stats-bar\\">';

// Use indexOf to find and replace at exact position
const heroIdx = html.indexOf(heroTarget);
if (heroIdx > 0) {
  html = html.substring(0, heroIdx) + heroReplacement + html.substring(heroIdx + heroTarget.length);
  console.log('4. Hero CTA');
} else {
  // Try alternate approach - find stats-bar and inject before it
  console.log('4. Trying alternate approach');
  // Find backBtn followed by stats-bar
  const altIdx = html.indexOf('backBtn+"<div class=\\"stats-bar\\">');
  if (altIdx > 0) console.log('Alt found at:', altIdx);
  else console.log('4. FAILED - hero CTA not added');
}

// Step 5: New functions before last </script>
const lastScriptEnd = html.lastIndexOf('</script>');
const newFuncs = [
  'function showSkeleton(){var el=document.getElementById("expertList");if(!el)return;var h="";for(var i=0;i<6;i++)h+=\'<div class="skeleton-card"><div class="skeleton skeleton-circle"></div><div class="skeleton skeleton-line medium"></div><div class="skeleton skeleton-line short"></div><div class="skeleton skeleton-line medium"></div><div class="skeleton skeleton-line short"></div></div>\';el.innerHTML=h;}',
  'function addFloatingCTA(expertId,expertName){var old=document.getElementById("floatingCTA");if(old)old.remove();var div=document.createElement("div");div.id="floatingCTA";div.className="cta-float-bar";div.innerHTML=\'<div class="cta-info"><span class="cta-name">\'+escHtml(expertName||"专家")+\'</span><span class="cta-hint">立即预约咨询</span></div><button class="btn btn-primary" onclick="showBooking(\'+expertId+\')">立即预约</button><button class="cta-close" onclick="document.getElementById(\\\'floatingCTA\\\').remove()">×</button>\';document.body.appendChild(div);}'
].join('\n');
html = html.substring(0, lastScriptEnd) + '\n' + newFuncs + '\n' + '</script>';
console.log('5. Functions added');

// Step 6: CSS
const cssFile = p.replace('index.html', 'style.css');
let css = fs.readFileSync(cssFile, 'utf8');
const newCSS = `
@keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
.skeleton{background:linear-gradient(90deg,#edf2f7 25%,#e2e8f0 50%,#edf2f7 75%);background-size:200% 100%;animation:shimmer 1.5s infinite;border-radius:8px}
.skeleton-card{border-radius:12px;padding:20px;background:#fff}
.skeleton-circle{width:80px;height:80px;border-radius:50%;margin:0 auto 12px}
.skeleton-line{height:14px;margin-bottom:8px;border-radius:4px}
.skeleton-line.short{width:60%}
.skeleton-line.medium{width:80%}
.hero-cta-row{display:flex;gap:16px;justify-content:center;margin-bottom:28px;flex-wrap:wrap}
.btn-cta-hero{display:inline-flex;align-items:center;gap:8px;padding:14px 32px;border-radius:50px;font-size:16px;font-weight:600;background:#fff;color:#667eea;border:none;cursor:pointer;box-shadow:0 4px 16px rgba(0,0,0,.1);transition:all .2s}
.btn-cta-hero:hover{transform:translateY(-2px);box-shadow:0 6px 24px rgba(0,0,0,.15)}
.btn-cta-outline{background:transparent;color:#fff;border:2px solid rgba(255,255,255,.6)!important}
.btn-cta-outline:hover{background:rgba(255,255,255,.15)}
.cta-float-bar{position:fixed;bottom:0;left:0;right:0;background:#fff;border-top:1px solid #e2e8f0;padding:12px 24px;display:flex;align-items:center;justify-content:space-between;z-index:200;box-shadow:0 -4px 20px rgba(0,0,0,.08);transform:translateY(100%);animation:slideUp .3s forwards}
@keyframes slideUp{to{transform:translateY(0)}}
.cta-info{display:flex;flex-direction:column;gap:2px}
.cta-name{font-weight:700;font-size:16px;color:#2d3748}
.cta-hint{font-size:13px;color:#a0aec0}
.cta-float-bar .btn{padding:10px 32px;border-radius:50px;font-size:15px;font-weight:600}
.cta-close{background:none;border:none;font-size:24px;color:#a0aec0;cursor:pointer;padding:4px 8px;line-height:1}
.cta-close:hover{color:#4a5568}
@media(max-width:768px){.cta-float-bar{padding:10px 16px;flex-direction:column;gap:8px;text-align:center}.cta-info{align-items:center}.cta-float-bar .btn{width:100%}}
`;
if (!css.includes('shimmer')) {
  fs.writeFileSync(cssFile, css + newCSS, 'utf8');
  console.log('6. CSS added');
} else {
  console.log('6. CSS already has shimmer');
}

// Step 7: Validate
const scriptRegex = /<script[^>]*>([\s\S]*?)<\/script>/gi;
let match;
while ((match = scriptRegex.exec(html)) !== null) {
  const code = match[1].trim();
  if (code && code.length > 10000) {
    try {
      new Function(code);
      console.log('7. Syntax OK');
    } catch (e) {
      console.log('7. Syntax ERROR:', e.message);
    }
  }
}

fs.writeFileSync(p, html, 'utf8');
console.log('8. All saved');
