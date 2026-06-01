const fs = require('fs');
const indexPath = 'C:\\Users\\dailu\\Desktop\\expert-platform\\public\\index.html';
let html = fs.readFileSync(indexPath, 'utf8');

// ============ 1. Insert hot searches + advanced search panel ============
// After: onclick=\\"searchExperts()\\">搜索</button></div></div>"+
const target1 = 'onclick=\\"searchExperts()\\">搜索</button></div></div>"+<div class=\\"stats-bar\\">';
console.log('target1 found:', html.includes(target1));

const insert1 = 'onclick=\\"searchExperts()\\">搜索</button></div><div class=\\"hot-searches\\" id=\\"hotSearches\\"></div><a class=\\"search-toggle\\" onclick=\\"toggleAdvSearch()\\">高级筛选 ▾</a><div class=\\"search-panel\\" id=\\"advSearchPanel\\"><div class=\\"filter-row\\"><div class=\\"filter-group\\"><label>最低价格</label><input type=\\"number\\" id=\\"filterMinPrice\\" placeholder=\\"不限\\" min=\\"0\\"></div><div class=\\"filter-group\\"><label>最高价格</label><input type=\\"number\\" id=\\"filterMaxPrice\\" placeholder=\\"不限\\" min=\\"0\\"></div><div class=\\"filter-group\\"><label>最低评分</label><select id=\\"filterMinRating\\"><option value=\\"\\">不限</option><option value=\\"4\\">4.0以上</option><option value=\\"4.5\\">4.5以上</option><option value=\\"4.8\\">4.8以上</option></select></div><div class=\\"filter-group\\"><button class=\\"btn btn-primary btn-sm\\" onclick=\\"applyAdvSearch()\\">应用筛选</button></div></div></div></div>"+<div class=\\"stats-bar\\">';

if (html.includes(target1)) {
  html = html.replace(target1, insert1);
  console.log('1. Advanced search + hot searches inserted');
} else {
  console.log('1. target1 not found, aborting');
  process.exit(1);
}

// ============ 2. Add homeExtras div + loadHomeExtras call ============
const target2 = '(urlIndustry?"":iconRow)+"<div class=\\"expert-grid\\" id=\\"expertList\\"></div></div>";document.getElementById("app").innerHTML=h;';
console.log('target2 found:', html.includes(target2));

if (html.includes(target2)) {
  html = html.replace(target2, '(urlIndustry?"":iconRow)+"<div class=\\"expert-grid\\" id=\\"expertList\\"></div><div id=\\"homeExtras\\"></div></div>";document.getElementById("app").innerHTML=h;if(!urlIndustry)loadHomeExtras();');
  console.log('2. homeExtras placeholder added');
} else {
  console.log('2. target2 not found');
}

// ============ 3. Add loadExperts with skeleton (replace old version) ============
// Check if skeleton already in loadExperts
if (!html.includes('skeleton-card')) {
  console.log('3. loadExperts needs skeleton update - skipping for now (complex replacement)');
} else {
  console.log('3. Skeleton already in loadExperts');
}

// ============ 4. Add new functions ============
const newFuncs = `
function toggleAdvSearch(){var p=document.getElementById("advSearchPanel");if(p)p.classList.toggle("open");}
function applyAdvSearch(){loadExperts(1);}
function loadHotSearches(){var tags=["人工智能","数据分析","商业咨询","法律顾问","心理咨询","投资理财"];var el=document.getElementById("hotSearches");if(!el)return;var h="";for(var i=0;i<tags.length;i++){h+='<span class="hot-tag" onclick="document.getElementById(\\'searchInput\\').value=\\''+tags[i]+'\\';searchExperts()">'+tags[i]+'</span>';}el.innerHTML=h;}
function loadHomeExtras(){loadHotSearches();loadCouponBanner();loadFAQ();}
function loadCouponBanner(){var el=document.getElementById("homeExtras");if(!el)return;el.innerHTML+='<div class="coupon-banner" id="couponBanner"><div><h3>🎉 新用户专享优惠</h3><p>首次咨询立减20元，限量500张</p></div><button class="btn" onclick="claimCoupon()">立即领取</button></div>';}
function loadFAQ(){var el=document.getElementById("homeExtras");if(!el)return;el.innerHTML+='<div class="faq-section"><div class="faq-title">常见问题</div><div class="faq-item" onclick="this.classList.toggle(\\'open\\')"><div class="faq-question">如何选择适合的专家？<span class="faq-arrow">▼</span></div><div class="faq-answer">通过行业分类、搜索和评分排序找到合适的专家，优先选择已认证高评分专家。</div></div><div class="faq-item" onclick="this.classList.toggle(\\'open\\')"><div class="faq-question">咨询费用如何支付？<span class="faq-arrow">▼</span></div><div class="faq-answer">提交预约订单后在线支付，费用平台托管，确认后结算给专家，资金安全有保障。</div></div><div class="faq-item" onclick="this.classList.toggle(\\'open\\')"><div class="faq-question">对咨询不满意怎么办？<span class="faq-arrow">▼</span></div><div class="faq-answer">可申请退款，48小时内审核，合理诉求全额退款。</div></div><div class="faq-item" onclick="this.classList.toggle(\\'open\\')"><div class="faq-question">专家是否实名认证？<span class="faq-arrow">▼</span></div><div class="faq-answer">所有入驻专家均经过实名认证和资质审核，认证专家有专属标识。</div></div><div class="faq-item" onclick="this.classList.toggle(\\'open\\')"><div class="faq-question">如何成为平台专家？<span class="faq-arrow">▼</span></div><div class="faq-answer">注册后填写专家资料并提交认证，1-3个工作日审核通过即可上线。</div></div></div>';}
async function claimCoupon(){if(!currentUser){showLogin();return;}try{var r=await api("/coupons/claim",{method:"POST"});if(r.success){alert("优惠券已领取！首单立减20元");var b=document.getElementById("couponBanner");if(b)b.innerHTML='<h3>✅ 优惠券已领取</h3><p>下单时自动抵扣</p>';}else{alert(r.error||"领取失败");}}catch(e){alert("请求失败");}}
`;

const closeScriptIdx = html.lastIndexOf('</script>');
html = html.substring(0, closeScriptIdx) + newFuncs + '</script>';
console.log('4. New functions added');

fs.writeFileSync(indexPath, html, 'utf8');
console.log('Done! Saved to', indexPath);
