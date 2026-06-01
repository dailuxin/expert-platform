// P1+P2 improvements: calendar booking view, coupon system, skeleton loading, advanced search, FAQ
const fs = require('fs');

const indexPath = 'C:\\Users\\dailu\\Desktop\\expert-platform\\public\\index.html';
const cssPath = 'C:\\Users\\dailu\\Desktop\\expert-platform\\public\\style.css';
const appPath = 'C:\\Users\\dailu\\Desktop\\expert-platform\\app.js';
const dbPath = 'C:\\Users\\dailu\\Desktop\\expert-platform\\database.js';

// ========== 1. CSS 样式 ==========
const css = fs.readFileSync(cssPath, 'utf8');
const newCss = `
/* Skeleton Loading */
.skeleton{background:linear-gradient(90deg,#e2e8f0 25%,#f7fafc 50%,#e2e8f0 75%);background-size:200% 100%;animation:skeleton-pulse 1.5s ease-in-out infinite;border-radius:8px}
@keyframes skeleton-pulse{0%{background-position:200% 0}100%{background-position:-200% 0}}
.skeleton-card{height:220px;width:100%;border-radius:12px;margin-bottom:16px}
.skeleton-text{height:16px;width:60%;margin:8px 0;border-radius:4px}
.skeleton-text.short{width:40%}

/* Advanced Search Panel */
.search-panel{background:#fff;border-radius:12px;padding:20px;margin-bottom:24px;box-shadow:0 2px 12px rgba(0,0,0,.06);display:none}
.search-panel.open{display:block}
.search-panel .filter-row{display:flex;gap:16px;flex-wrap:wrap;align-items:end}
.search-panel .filter-group{flex:1;min-width:180px}
.search-panel .filter-group label{display:block;font-size:13px;color:#718096;margin-bottom:6px}
.search-panel .filter-group select,.search-panel .filter-group input{width:100%;padding:10px 12px;border:1px solid #e2e8f0;border-radius:8px;font-size:14px;box-sizing:border-box}
.search-toggle{color:#667eea;font-size:13px;cursor:pointer;margin-left:12px;text-decoration:underline}

/* Coupon Banner */
.coupon-banner{background:linear-gradient(135deg,#667eea,#764ba2);color:#fff;border-radius:12px;padding:20px 24px;margin-bottom:24px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px}
.coupon-banner h3{margin:0;font-size:18px}
.coupon-banner p{margin:4px 0 0;opacity:.9;font-size:14px}
.coupon-banner .btn{background:#fff;color:#667eea;border:none;font-weight:600}
.coupon-list{display:flex;gap:12px;margin-bottom:24px;flex-wrap:wrap}
.coupon-item{background:#fff;border:2px dashed #e2e8f0;border-radius:12px;padding:16px;min-width:200px;flex:1;text-align:center;transition:all .2s}
.coupon-item:hover{border-color:#667eea;transform:translateY(-2px)}
.coupon-amount{font-size:28px;font-weight:700;color:#e53e3e}
.coupon-amount span{font-size:14px;font-weight:400}
.coupon-condition{font-size:12px;color:#718096;margin-top:4px}
.coupon-btn{margin-top:8px;padding:6px 20px;border-radius:20px;border:1px solid #667eea;color:#667eea;background:transparent;cursor:pointer;font-size:13px}
.coupon-btn:hover{background:#667eea;color:#fff}
.coupon-btn.used{background:#e2e8f0;border-color:#e2e8f0;color:#a0aec0;cursor:not-allowed}

/* Calendar View */
.calendar-view{background:#fff;border-radius:12px;padding:20px;box-shadow:0 2px 12px rgba(0,0,0,.06)}
.calendar-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:16px}
.calendar-header button{background:#f7fafc;border:1px solid #e2e8f0;border-radius:8px;padding:8px 16px;cursor:pointer}
.calendar-header button:hover{background:#edf2f7}
.calendar-header h4{margin:0;font-size:16px}
.calendar-grid{display:grid;grid-template-columns:repeat(7,1fr);gap:4px;text-align:center}
.calendar-grid .day-header{font-size:12px;color:#718096;padding:8px 0;font-weight:600}
.calendar-grid .day-cell{padding:12px 4px;border-radius:8px;cursor:pointer;font-size:14px;transition:all .15s}
.calendar-grid .day-cell:hover{background:#edf2f7}
.calendar-grid .day-cell.today{font-weight:700;color:#667eea;box-shadow:inset 0 0 0 2px #667eea}
.calendar-grid .day-cell.selected{background:#667eea;color:#fff}
.calendar-grid .day-cell.disabled{color:#cbd5e0;cursor:not-allowed}
.calendar-grid .day-cell.has-slots{position:relative}
.calendar-grid .day-cell.has-slots::after{content:'';width:6px;height:6px;background:#38a169;border-radius:50%;position:absolute;bottom:4px;left:50%;transform:translateX(-50%)}
.time-slots{display:flex;flex-wrap:wrap;gap:8px;margin-top:16px;padding-top:16px;border-top:1px solid #e2e8f0}
.time-slot{padding:8px 16px;border:1px solid #e2e8f0;border-radius:8px;cursor:pointer;font-size:13px;transition:all .15s}
.time-slot:hover{border-color:#667eea;color:#667eea}
.time-slot.selected{background:#667eea;color:#fff;border-color:#667eea}
.time-slot.booked{background:#f7fafc;color:#cbd5e0;border-color:#e2e8f0;cursor:not-allowed;text-decoration:line-through}

/* FAQ Section */
.faq-section{background:#fff;border-radius:12px;padding:24px;margin:32px 0;box-shadow:0 2px 12px rgba(0,0,0,.06)}
.faq-title{font-size:20px;font-weight:700;text-align:center;margin-bottom:20px}
.faq-item{border-bottom:1px solid #e2e8f0}
.faq-item:last-child{border-bottom:none}
.faq-question{padding:16px 0;cursor:pointer;display:flex;justify-content:space-between;align-items:center;font-weight:500;font-size:15px;color:#2d3748}
.faq-question:hover{color:#667eea}
.faq-arrow{transition:transform .2s;color:#a0aec0}
.faq-item.open .faq-arrow{transform:rotate(180deg)}
.faq-answer{display:none;padding:0 0 16px;color:#718096;font-size:14px;line-height:1.7}
.faq-item.open .faq-answer{display:block}

/* CTA floating button */
.cta-float{position:fixed;bottom:24px;right:24px;z-index:100}
.cta-float .btn{border-radius:50px;padding:14px 28px;font-size:15px;box-shadow:0 4px 20px rgba(102,126,234,.4)}
@media(max-width:768px){.cta-float{bottom:16px;right:16px;left:16px}.cta-float .btn{width:100%;text-align:center}}

/* Hot searches */
.hot-searches{display:flex;gap:8px;flex-wrap:wrap;margin-top:12px}
.hot-tag{padding:4px 12px;background:#f7fafc;border-radius:20px;font-size:13px;color:#667eea;cursor:pointer;border:1px solid #e2e8f0}
.hot-tag:hover{background:#edf2f7;border-color:#667eea}
`;

fs.writeFileSync(cssPath, css + newCss, 'utf8');
console.log('CSS added');

// ========== 2. index.html - add FAQ, skeleton, advanced search ==========
let html = fs.readFileSync(indexPath, 'utf8');

// 2a. Replace renderHome hero to add hot searches and advanced search toggle
const oldSearchBox = 'placeholder="搜索专家姓名/擅长领域..."';
const newSearchBox = 'placeholder="搜索专家姓名/擅长领域..."</div><div class="hot-searches" id="hotSearches"></div>';
html = html.replace(oldSearchBox, newSearchBox);

// 2b. Add skeleton to loadExperts
const oldLoadExperts = 'async function loadExperts(page,forceIndustry){page=page||1;const kw=document.getElementById("searchInput")?document.getElementById("searchInput").value:"";const ind=document.getElementById("industryFilter")?document.getElementById("industryFilter").value:"";let url="/experts?page="+page+"&limit=12";if(kw)url+="&keyword="+encodeURIComponent(kw);if(ind)url+="&industry="+encodeURIComponent(ind);const data=await fetch(API+url).then(r=>r.json());const el=document.getElementById("expertList");';
const newLoadExperts = 'async function loadExperts(page,forceIndustry){page=page||1;const kw=document.getElementById("searchInput")?document.getElementById("searchInput").value:"";const ind=document.getElementById("industryFilter")?document.getElementById("industryFilter").value:"";const minPrice=document.getElementById("filterMinPrice")?document.getElementById("filterMinPrice").value:"";const maxPrice=document.getElementById("filterMaxPrice")?document.getElementById("filterMaxPrice").value:"";const minRating=document.getElementById("filterMinRating")?document.getElementById("filterMinRating").value:"";let url="/experts?page="+page+"&limit=12";if(kw)url+="&keyword="+encodeURIComponent(kw);if(ind||forceIndustry)url+="&industry="+encodeURIComponent(ind||forceIndustry||"");if(minPrice)url+="&min_price="+encodeURIComponent(minPrice);if(maxPrice)url+="&max_price="+encodeURIComponent(maxPrice);if(minRating)url+="&min_rating="+encodeURIComponent(minRating);const el=document.getElementById("expertList");if(el)el.innerHTML="<div class=\\"skeleton-card\\"></div><div class=\\"skeleton-card\\"></div><div class=\\"skeleton-card\\"></div><div class=\\"skeleton-card\\"></div><div class=\\"skeleton-card\\"></div><div class=\\"skeleton-card\\"></div>";';
if (html.includes(oldLoadExperts)) {
  html = html.replace(oldLoadExperts, newLoadExperts);
  console.log('loadExperts updated with skeleton + advanced filters');
} else {
  console.log('loadExperts old code not found, trying alternative...');
  // Find and replace the loadExperts function
  const loadIdx = html.indexOf('async function loadExperts(');
  if (loadIdx > 0) {
    console.log('Found loadExperts at', loadIdx);
  }
}

// 2c. Add FAQ and features to renderHome (after expert grid)
if (!html.includes('faq-section')) {
  // Add FAQ + features after expert grid closing
  const expertGridEnd = '</div></div>";document.getElementById("app").innerHTML=h;}';
  const insertIdx = html.lastIndexOf(expertGridEnd);
  if (insertIdx > 0) {
    const faqContent = '<div class=\\"faq-section\\"><div class=\\"faq-title\\">常见问题</div>' +
      '<div class=\\"faq-item\\" onclick=\\"this.classList.toggle(\'open\')\\"><div class=\\"faq-question\\">如何选择适合的专家？<span class=\\"faq-arrow\\">▼</span></div><div class=\\"faq-answer\\">您可以通过行业分类、关键词搜索、评分排序等方式找到合适的专家。我们建议优先选择已实名认证、评分较高的专家，同时查看其个人简介和服务案例。</div></div>' +
      '<div class=\\"faq-item\\" onclick=\\"this.classList.toggle(\'open\')\\"><div class=\\"faq-question\\">咨询费用如何支付？<span class=\\"faq-arrow\\">▼</span></div><div class=\\"faq-answer\\">选择专家后提交预约订单，系统会生成支付订单。支持在线支付，费用由平台托管，咨询完成确认后再结算给专家，确保资金安全。</div></div>' +
      '<div class=\\"faq-item\\" onclick=\\"this.classList.toggle(\'open\')\\"><div class=\\"faq-question\\">如果对咨询服务不满意怎么办？<span class=\\"faq-arrow\\">▼</span></div><div class=\\"faq-answer\\">您可以在咨询完成后申请退款。平台会在48小时内审核退款申请，合理诉求将全额退款。同时，您的真实评价将帮助其他用户做出更好的选择。</div></div>' +
      '<div class=\\"faq-item\\" onclick=\\"this.classList.toggle(\'open\')\\"><div class=\\"faq-question\\">专家是否实名认证？<span class=\\"faq-arrow\\">▼</span></div><div class=\\"faq-answer\\">是的，所有入驻专家均经过平台实名认证和资质审核。认证专家会在个人资料页显示认证标识，您可以放心选择。</div></div>' +
      '<div class=\\"faq-item\\" onclick=\\"this.classList.toggle(\'open\')\\"><div class=\\"faq-question\\">如何成为平台专家？<span class=\\"faq-arrow\\">▼</span></div><div class=\\"faq-answer\\">注册账号后，在个人中心填写专家资料并提交实名认证。平台将在1-3个工作日内完成审核，审核通过后即可上线接单。</div></div></div>';
    
    html = html.slice(0, insertIdx) + faqContent + html.slice(insertIdx);
    console.log('FAQ section added');
  }
}

fs.writeFileSync(indexPath, html, 'utf8');
console.log('index.html updated');
