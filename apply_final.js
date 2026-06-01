const fs = require('fs');
const p = String.raw`C:\Users\dailu\Desktop\expert-platform\public\index.html`;
let html = fs.readFileSync(p, 'utf8');

// Find the exact boundary: after </div></div>" before stats-bar
// We know stats-bar is at 6024
// Find the closing </div>" before it
const boundary = html.lastIndexOf('</div></div>"', 6024);
console.log('boundary:', boundary);
console.log('Boundary context:', JSON.stringify(html.substring(boundary, boundary + 40)));

// Now we need to insert hot searches + adv search between </div></div>" and <div class="stats-bar">
// The insertion point is after the closing </div></div>"+
const insertAt = boundary + '</div></div>"'.length;
console.log('Insert at:', insertAt);
console.log('Next 20 chars:', JSON.stringify(html.substring(insertAt, insertAt + 20)));

// Do the insertion
const hotSearches = `<div class="hot-searches" id="hotSearches"></div><a class="search-toggle" onclick="toggleAdvSearch()">高级筛选 ▾</a><div class="search-panel" id="advSearchPanel"><div class="filter-row"><div class="filter-group"><label>最低价格</label><input type="number" id="filterMinPrice" placeholder="不限" min="0"></div><div class="filter-group"><label>最高价格</label><input type="number" id="filterMaxPrice" placeholder="不限" min="0"></div><div class="filter-group"><label>最低评分</label><select id="filterMinRating"><option value="">不限</option><option value="4">4.0以上</option><option value="4.5">4.5以上</option><option value="4.8">4.8以上</option></select></div><div class="filter-group"><button class="btn btn-primary btn-sm" onclick="applyAdvSearch()">应用筛选</button></div></div></div>`;

// Close the hero div before inserting
html = html.substring(0, boundary) + '</div>' + hotSearches + '</div>"' + html.substring(insertAt);
console.log('Inserted hot searches + advanced search');

// 2. Add homeExtras div
const gridClose = '(urlIndustry?"":iconRow)+"<div class="expert-grid" id="expertList"></div></div>"';
const gridIdx = html.indexOf(gridClose);
console.log('Grid close found:', gridIdx > 0);

if (gridIdx > 0) {
  html = html.substring(0, gridIdx) + '(urlIndustry?"":iconRow)+"<div class="expert-grid" id="expertList"></div><div id="homeExtras"></div></div>"' + html.substring(gridIdx + gridClose.length);
  console.log('homeExtras added');
  
  // Add loadHomeExtras call
  const appInner = 'document.getElementById("app").innerHTML=h;';
  const appIdx = html.lastIndexOf(appInner);
  if (appIdx > 0) {
    html = html.substring(0, appIdx + appInner.length) + 'if(!urlIndustry)loadHomeExtras();' + html.substring(appIdx + appInner.length);
    console.log('loadHomeExtras call added');
  }
}

// 3. Add functions
const newFuncs = `
function toggleAdvSearch(){var p=document.getElementById("advSearchPanel");if(p)p.classList.toggle("open");}
function applyAdvSearch(){loadExperts(1);}
function loadHotSearches(){var tags=["人工智能","数据分析","商业咨询","法律顾问","心理咨询","投资理财"];var el=document.getElementById("hotSearches");if(!el)return;var h="";for(var i=0;i<tags.length;i++){h+='<span class="hot-tag" onclick="document.getElementById(\\'searchInput\\').value=\\''+tags[i]+'\\';searchExperts()">'+tags[i]+'</span>';}el.innerHTML=h;}
function loadHomeExtras(){loadHotSearches();loadCouponBanner();loadFAQ();}
function loadCouponBanner(){var el=document.getElementById("homeExtras");if(!el)return;el.innerHTML+='<div class="coupon-banner" id="couponBanner"><div><h3>🎉 新用户专享优惠</h3><p>首次咨询立减20元，限量500张</p></div><button class="btn" onclick="claimCoupon()">立即领取</button></div>';}
function loadFAQ(){var el=document.getElementById("homeExtras");if(!el)return;el.innerHTML+='<div class="faq-section"><div class="faq-title">常见问题</div><div class="faq-item" onclick="this.classList.toggle(\\'open\\')"><div class="faq-question">如何选择适合的专家？<span class="faq-arrow">▼</span></div><div class="faq-answer">通过行业分类、搜索和评分排序找到合适的专家，优先选择已认证高评分专家。</div></div><div class="faq-item" onclick="this.classList.toggle(\\'open\\')"><div class="faq-question">咨询费用如何支付？<span class="faq-arrow">▼</span></div><div class="faq-answer">提交预约订单后在线支付，费用平台托管，确认后结算给专家，资金安全有保障。</div></div><div class="faq-item" onclick="this.classList.toggle(\\'open\\')"><div class="faq-question">对咨询不满意怎么办？<span class="faq-arrow">▼</span></div><div class="faq-answer">可申请退款，48小时内审核，合理诉求全额退款。</div></div><div class="faq-item" onclick="this.classList.toggle(\\'open\\')"><div class="faq-question">专家是否实名认证？<span class="faq-arrow">▼</span></div><div class="faq-answer">所有入驻专家均经过实名认证和资质审核，认证专家有专属标识。</div></div><div class="faq-item" onclick="this.classList.toggle(\\'open\\')"><div class="faq-question">如何成为平台专家？<span class="faq-arrow">▼</span></div><div class="faq-answer">注册后填写专家资料并提交认证，1-3个工作日审核通过即可上线。</div></div></div>';}
async function claimCoupon(){if(!currentUser){showLogin();return;}try{var r=await api("/coupons/claim",{method:"POST"});if(r.success){alert("优惠券已领取！首单立减20元");var b=document.getElementById("couponBanner");if(b)b.innerHTML='<h3>✅ 优惠券已领取</h3><p>下单时自动抵扣</p>';}else{alert(r.error||"领取失败");}}catch(e){alert("请求失败");}}
`;

const csIdx = html.lastIndexOf('</script>');
html = html.substring(0, csIdx) + newFuncs + '</script>';
console.log('Functions added');

fs.writeFileSync(p, html, 'utf8');
console.log('Saved!');
