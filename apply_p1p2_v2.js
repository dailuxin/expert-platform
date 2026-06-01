const fs = require('fs');
const indexPath = 'C:\\Users\\dailu\\Desktop\\expert-platform\\public\\index.html';
const appPath = 'C:\\Users\\dailu\\Desktop\\expert-platform\\app.js';
const dbPath = 'C:\\Users\\dailu\\Desktop\\expert-platform\\database.js';

// ========== PART 1: Replace loadExperts in index.html ==========
let html = fs.readFileSync(indexPath, 'utf8');

// Find loadExperts function start and end
const startIdx = html.indexOf('async function loadExperts(');
if (startIdx < 0) { console.log('ERROR: loadExperts not found'); process.exit(1); }

// Find the next top-level function to know where loadExperts ends
// Look for 'function searchExperts' or 'async function renderExpertDetail'
let endSearch = html.indexOf('function searchExperts()');
if (endSearch < 0) endSearch = html.indexOf('async function renderExpertDetail(');
if (endSearch < 0) { console.log('ERROR: searchExperts not found'); process.exit(1); }

// The loadExperts function body ends just before searchExperts
const oldLoadExperts = html.substring(startIdx, endSearch);
console.log('Replacing loadExperts, length:', oldLoadExperts.length);

const newLoadExperts = `async function loadExperts(page,forceIndustry){page=page||1;const kw=document.getElementById("searchInput")?document.getElementById("searchInput").value:"";const ind=document.getElementById("industryFilter")?document.getElementById("industryFilter").value:"";const minPrice=document.getElementById("filterMinPrice")?document.getElementById("filterMinPrice").value:"";const maxPrice=document.getElementById("filterMaxPrice")?document.getElementById("filterMaxPrice").value:"";const minRating=document.getElementById("filterMinRating")?document.getElementById("filterMinRating").value:"";let url="/experts?page="+page+"&limit=12";if(kw)url+="&keyword="+encodeURIComponent(kw);if(ind||forceIndustry)url+="&industry="+encodeURIComponent(ind||forceIndustry||"");if(minPrice)url+="&min_price="+encodeURIComponent(minPrice);if(maxPrice)url+="&max_price="+encodeURIComponent(maxPrice);if(minRating)url+="&min_rating="+encodeURIComponent(minRating);const el=document.getElementById("expertList");if(el)el.innerHTML='<div class="skeleton-card"></div><div class="skeleton-card"></div><div class="skeleton-card"></div><div class="skeleton-card"></div><div class="skeleton-card"></div><div class="skeleton-card"></div>';const data=await fetch(API+url).then(r=>r.json());const titleEl=document.getElementById("expertSectionTitle");if(titleEl){if(kw||ind||forceIndustry||minPrice||maxPrice||minRating)titleEl.textContent="搜索结果";else titleEl.textContent="推荐专家";}if(!data.list||!data.list.length){el.innerHTML="<div class=\\"empty\\"><div class=\\"icon\\">专家</div>暂无专家</div>";return;}let h="";for(const e of data.list){const pu=e.photo_path?"<img class=\\"avatar\\" src=\\""+e.photo_path+"\\" onerror=\\"this.style.display='none'\\">":"<div class=\\"avatar\\">?</div>";h+="<div class=\\"expert-card\\" onclick=\\"renderExpertDetail("+e.id+")\\">"+pu+"<div class=\\"name\\">"+escHtml(e.real_name||"专家")+"</div><div class=\\"title\\">"+escHtml(e.title||"")+"</div><div><span class=\\"tag\\">"+escHtml(e.industry||"")+"</span></div>"+(e.avg_rating?"<div class=\\"rating\\">"+"★".repeat(Math.round(e.avg_rating))+" "+e.avg_rating.toFixed(1)+" ("+e.review_count+"条)</div>":"")+(e.consult_fee>0?"<div class=\\"fee\\">¥"+e.consult_fee+"/次</div>":"")+(e.verified?"<div class=\\"verified-badge\\">已认证</div>":"")+"</div>";}el.innerHTML=h;}

`;

html = html.substring(0, startIdx) + newLoadExperts + html.substring(endSearch);
console.log('loadExperts replaced');

// ========== PART 2: Add advanced search panel in renderHome ==========
// After search-box div, before backBtn
const searchBoxClose = 'searchExperts()">搜索</button></div></div>'+backBtn;
const advancedPanel = 'searchExperts()">搜索</button></div><a class="search-toggle" onclick="toggleAdvSearch()">高级筛选 ▾</a><div class="search-panel" id="advSearchPanel"><div class="filter-row"><div class="filter-group"><label>最低价格</label><input type="number" id="filterMinPrice" placeholder="不限" min="0"></div><div class="filter-group"><label>最高价格</label><input type="number" id="filterMaxPrice" placeholder="不限" min="0"></div><div class="filter-group"><label>最低评分</label><select id="filterMinRating"><option value="">不限</option><option value="4">4.0以上</option><option value="4.5">4.5以上</option><option value="4.8">4.8以上</option></select></div><div class="filter-group"><button class="btn btn-primary btn-sm" onclick="applyAdvSearch()">应用筛选</button></div></div></div></div>'+backBtn;
html = html.replace(searchBoxClose, advancedPanel);
console.log('Advanced search panel added');

// ========== PART 3: Add hot searches, coupon, CTA after expertSection ==========
const expertSectionClose = '(urlIndustry?"":iconRow)+"<div class=\\"expert-grid\\" id=\\"expertList\\"></div></div>";document.getElementById("app").innerHTML=h;';
const insertContent = '(urlIndustry?"":iconRow)+"<div class=\\"expert-grid\\" id=\\"expertList\\"></div></div>"+(urlIndustry?"":\'<div class="coupon-banner" id="couponBanner"><div><h3>🎉 新用户专享优惠</h3><p>首次咨询立减20元，限量500张</p></div><button class="btn" onclick="claimCoupon()">立即领取</button></div><div class="coupon-list" id="couponList"></div>\')+\'<div class="faq-section"><div class="faq-title">常见问题</div><div class="faq-item" onclick="this.classList.toggle(\\\'open\\\')"><div class="faq-question">如何选择适合的专家？<span class="faq-arrow">▼</span></div><div class="faq-answer">您可以通过行业分类、关键词搜索、评分排序等方式找到合适的专家。我们建议优先选择已实名认证、评分较高的专家，同时查看其个人简介和服务案例。</div></div><div class="faq-item" onclick="this.classList.toggle(\\\'open\\\')"><div class="faq-question">咨询费用如何支付？<span class="faq-arrow">▼</span></div><div class="faq-answer">选择专家后提交预约订单，系统会生成支付订单。支持在线支付，费用由平台托管，咨询完成确认后再结算给专家，确保资金安全。</div></div><div class="faq-item" onclick="this.classList.toggle(\\\'open\\\')"><div class="faq-question">如果对咨询服务不满意怎么办？<span class="faq-arrow">▼</span></div><div class="faq-answer">您可以在咨询完成后申请退款。平台会在48小时内审核退款申请，合理诉求将全额退款。同时，您的真实评价将帮助其他用户做出更好的选择。</div></div><div class="faq-item" onclick="this.classList.toggle(\\\'open\\\')"><div class="faq-question">专家是否实名认证？<span class="faq-arrow">▼</span></div><div class="faq-answer">是的，所有入驻专家均经过平台实名认证和资质审核。认证专家会在个人资料页显示认证标识，您可以放心选择。</div></div><div class="faq-item" onclick="this.classList.toggle(\\\'open\\\')"><div class="faq-question">如何成为平台专家？<span class="faq-arrow">▼</span></div><div class="faq-answer">注册账号后，在个人中心填写专家资料并提交实名认证。平台将在1-3个工作日内完成审核，审核通过后即可上线接单。</div></div></div>\')+"<div class=\\"cta-float\\" id=\\"ctaFloat\\" style=\\"display:none\\"><button class=\\"btn btn-primary\\" onclick=\\"renderHome()\\">浏览更多专家</button></div>";document.getElementById("app").innerHTML=h;if(!urlIndustry)loadHotSearches();';

// Remove the FAQ that was already inserted (double insert prevention)
const existingFaq = '<div class=\\"faq-section\\"><div class=\\"faq-title\\">常见问题</div>';
if (html.includes(existingFaq)) {
  // Find and remove the previously inserted FAQ
  const faqStart = html.indexOf(existingFaq);
  const faqEndStr = '</div></div></div>";document.getElementById("app")';
  const faqEnd = html.indexOf(faqEndStr, faqStart);
  if (faqEnd > 0) {
    html = html.substring(0, faqStart) + html.substring(faqEnd);
    console.log('Removed duplicate FAQ');
  }
}

// Now replace the expertSection close with new content
if (html.includes(expertSectionClose)) {
  html = html.replace(expertSectionClose, insertContent);
  console.log('Coupon, FAQ, CTA added');
} else {
  console.log('expertSectionClose not found, trying search...');
}

// ========== PART 4: Add new functions before closing script tag ==========
const newFunctions = `
function toggleAdvSearch(){const p=document.getElementById("advSearchPanel");if(p)p.classList.toggle("open");}
function applyAdvSearch(){loadExperts(1);}
function loadHotSearches(){const tags=["人工智能","数据分析","商业咨询","法律顾问","心理咨询","投资理财"];const el=document.getElementById("hotSearches");if(!el)return;let h="";for(const t of tags)h+='<span class="hot-tag" onclick="document.getElementById(\\'searchInput\\').value=\\''+t+'\\';searchExperts()">'+t+'</span>';el.innerHTML=h;}
async function claimCoupon(){if(!currentUser){showLogin();return;}const r=await api("/coupons/claim",{method:"POST"});if(r.success){alert("优惠券已领取！首单立减20元");document.getElementById("couponBanner").style.display="none";loadMyCoupons();}else alert(r.error||"领取失败");}
async function loadMyCoupons(){if(!currentUser)return;const r=await api("/coupons/mine");const el=document.getElementById("couponList");if(!el||!r.list||!r.list.length){if(el)el.style.display="none";return;}el.style.display="flex";let h="";for(const c of r.list){const used=c.status==="used"||c.status==="expired";h+='<div class="coupon-item"><div class="coupon-amount">¥20<span></span></div><div class="coupon-condition">'+(c.min_amount>0?"满¥"+c.min_amount+"可用":"无门槛")+'</div><button class="coupon-btn'+(used?" used":"")+'" '+(used?"disabled":"")+'>'+(c.status==="used"?"已使用":c.status==="expired"?"已过期":"待使用")+'</button></div>';}el.innerHTML=h;}
`;

const closeScript = '</script>\n</body>';
if (html.includes(closeScript)) {
  html = html.replace(closeScript, newFunctions + closeScript);
  console.log('New functions added');
}

fs.writeFileSync(indexPath, html, 'utf8');
console.log('index.html saved');
