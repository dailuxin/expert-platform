const fs = require('fs');
const p = 'C:\\Users\\dailu\\Desktop\\expert-platform\\public\\index.html';
let html = fs.readFileSync(p, 'utf8');

// ========== 1. SKELETON ==========

// Add skeleton call in loadExperts before fetch
const oldFetch = `const data=await fetch(API+url).then(r=>r.json());`;
const newFetch = `showSkeleton();const data=await fetch(API+url).then(r=>r.json());`;
html = html.replace(oldFetch, newFetch);
console.log('1a. Skeleton call injected in loadExperts');

// Detail page skeleton
const oldDetail = `function renderExpertDetail(id){const e=await fetch(API+"/experts/"+id)`;
const newDetail = `function renderExpertDetail(id){var _a=document.getElementById("app");if(_a)_a.innerHTML="<div style=\\"padding:40px;text-align:center\\"><div class=\\"skeleton skeleton-circle\\" style=\\"width:120px;height:120px;margin:0 auto 20px\\"></div><div class=\\"skeleton skeleton-line\\" style=\\"width:200px;margin:0 auto 12px\\"></div><div class=\\"skeleton skeleton-line short\\" style=\\"width:150px;margin:0 auto\\"></div></div>";const e=await fetch(API+"/experts/"+id)`;
html = html.replace(oldDetail, newDetail);
console.log('1b. Detail skeleton added');

// ========== 2. FLOATING CTA ==========

// Add floating CTA call after loadPackages in renderExpertDetail
const oldLP = `loadPackages(id,"packagesContainer");`;
html = html.replace(oldLP, `loadPackages(id,"packagesContainer");addFloatingCTA(id,e.real_name||"专家");`);
console.log('2. Floating CTA injection done');

// ========== 3. HERO CTA ==========

// Find the pattern in renderHome that connects backBtn to stats-bar
// In the file it looks like: "+backBtn+"<div class=\"stats-bar\">
const heroStats = '"+backBtn+"<div class=\\"stats-bar\\">';
const heroCTA = '"+backBtn+"<div class=\\"hero-cta-row\\"><a class=\\"btn btn-cta-hero\\" onclick=\\"document.getElementById(\\'expertList\\').scrollIntoView({behavior:\\'smooth\\'})\\">🔍 浏览推荐专家</a><a class=\\"btn btn-cta-hero btn-cta-outline\\" onclick=\\"event.preventDefault();showRegister()\\">👨‍💼 成为平台专家</a></div><div class=\\"stats-bar\\">';
if (html.includes(heroStats)) {
  html = html.replace(heroStats, heroCTA);
  console.log('3. Hero CTA buttons added');
} else {
  console.log('3. WARNING: hero-stats pattern not found');
  // Debug
  const idx = html.indexOf('stats-bar');
  if (idx > 0) console.log('stats-bar context:', JSON.stringify(html.substring(idx-20, idx+40)));
}

// ========== 4. NEW FUNCTIONS ==========

const skelFunc = `function showSkeleton(){var el=document.getElementById("expertList");if(!el)return;var h="";for(var i=0;i<6;i++)h+='<div class="skeleton-card"><div class="skeleton skeleton-circle"></div><div class="skeleton skeleton-line medium"></div><div class="skeleton skeleton-line short"></div><div class="skeleton skeleton-line medium"></div><div class="skeleton skeleton-line short"></div></div>';el.innerHTML=h;}`;

const ctaFunc = `function addFloatingCTA(expertId,expertName){var old=document.getElementById("floatingCTA");if(old)old.remove();var div=document.createElement("div");div.id="floatingCTA";div.className="cta-float-bar";div.innerHTML='<div class="cta-info"><span class="cta-name">'+escHtml(expertName||"专家")+'</span><span class="cta-hint">立即预约咨询</span></div><button class="btn btn-primary" onclick="showBooking('+expertId+')">立即预约</button><button class="cta-close" onclick="document.getElementById(\\'floatingCTA\\').remove()">×</button>';document.body.appendChild(div);}`;

const lastScriptEnd = html.lastIndexOf('</script>');
html = html.substring(0, lastScriptEnd) + '\n' + skelFunc + '\n' + ctaFunc + '\n' + '</script>';

// ========== 5. CSS ==========

const cssFile = p.replace('index.html', 'style.css');
let css = fs.readFileSync(cssFile, 'utf8');
const newCSS = `
/* Skeleton Loading */
@keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
.skeleton{background:linear-gradient(90deg,#edf2f7 25%,#e2e8f0 50%,#edf2f7 75%);background-size:200% 100%;animation:shimmer 1.5s infinite;border-radius:8px}
.skeleton-card{border-radius:12px;padding:20px;background:#fff}
.skeleton-circle{width:80px;height:80px;border-radius:50%;margin:0 auto 12px}
.skeleton-line{height:14px;margin-bottom:8px;border-radius:4px}
.skeleton-line.short{width:60%}
.skeleton-line.medium{width:80%}

/* Hero CTA Row */
.hero-cta-row{display:flex;gap:16px;justify-content:center;margin-bottom:28px;flex-wrap:wrap}
.btn-cta-hero{display:inline-flex;align-items:center;gap:8px;padding:14px 32px;border-radius:50px;font-size:16px;font-weight:600;background:#fff;color:#667eea;border:none;cursor:pointer;box-shadow:0 4px 16px rgba(0,0,0,.1);transition:all .2s}
.btn-cta-hero:hover{transform:translateY(-2px);box-shadow:0 6px 24px rgba(0,0,0,.15)}
.btn-cta-outline{background:transparent;color:#fff;border:2px solid rgba(255,255,255,.6)!important}
.btn-cta-outline:hover{background:rgba(255,255,255,.15)}

/* Floating CTA Bar */
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
  css += newCSS;
  fs.writeFileSync(cssFile, css, 'utf8');
  console.log('CSS added');
}

// ========== 6. VALIDATE ==========
const scriptRegex = /<script[^>]*>([\s\S]*?)<\/script>/gi;
let match;
while ((match = scriptRegex.exec(html)) !== null) {
  const code = match[1].trim();
  if (code && code.length > 10000) {
    try {
      new Function(code);
      console.log('Syntax OK');
    } catch (e) {
      console.log('Syntax ERROR:', e.message);
    }
  }
}

fs.writeFileSync(p, html, 'utf8');
console.log('Saved');
