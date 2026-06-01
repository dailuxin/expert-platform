const fs = require('fs');
const p = 'C:\\Users\\dailu\\Desktop\\expert-platform\\public\\index.html';
let html = fs.readFileSync(p, 'utf8');

// Add new functions before the last </script>
const csIdx = html.lastIndexOf('</script>');
const newFuncs = `
function toggleAdvSearch(){var p=document.getElementById("advSearchPanel");if(p)p.classList.toggle("open");}
function applyAdvSearch(){loadExperts(1);}
function loadHotSearches(){var tags=["人工智能","数据分析","商业咨询","法律顾问","心理咨询","投资理财"];var el=document.getElementById("hotSearches");if(!el)return;var h="";for(var i=0;i<tags.length;i++){h+='<span class="hot-tag" onclick="document.getElementById(\\'searchInput\\').value=\\''+tags[i]+'\\';searchExperts()">'+tags[i]+'</span>';}el.innerHTML=h;}
function loadHomeExtras(){loadHotSearches();loadCouponBanner();loadFAQ();}
function loadCouponBanner(){var el=document.getElementById("homeExtras");if(!el)return;el.innerHTML+='<div class="coupon-banner" id="couponBanner"><div><h3>🎉 新用户专享优惠</h3><p>首次咨询立减20元，限量500张</p></div><button class="btn" onclick="claimCoupon()">立即领取</button></div>';}
function loadFAQ(){var el=document.getElementById("homeExtras");if(!el)return;el.innerHTML+='<div class="faq-section"><div class="faq-title">常见问题</div><div class="faq-item" onclick="this.classList.toggle(\\'open\\')"><div class="faq-question">如何选择适合的专家？<span class="faq-arrow">▼</span></div><div class="faq-answer">通过行业分类、搜索和评分排序找到合适的专家，优先选择已认证高评分专家。</div></div><div class="faq-item" onclick="this.classList.toggle(\\'open\\')"><div class="faq-question">咨询费用如何支付？<span class="faq-arrow">▼</span></div><div class="faq-answer">提交预约订单后在线支付，费用平台托管，确认后结算给专家，资金安全有保障。</div></div><div class="faq-item" onclick="this.classList.toggle(\\'open\\')"><div class="faq-question">对咨询不满意怎么办？<span class="faq-arrow">▼</span></div><div class="faq-answer">可申请退款，48小时内审核，合理诉求全额退款。</div></div><div class="faq-item" onclick="this.classList.toggle(\\'open\\')"><div class="faq-question">专家是否实名认证？<span class="faq-arrow">▼</span></div><div class="faq-answer">所有入驻专家均经过实名认证和资质审核，认证专家有专属标识。</div></div><div class="faq-item" onclick="this.classList.toggle(\\'open\\')"><div class="faq-question">如何成为平台专家？<span class="faq-arrow">▼</span></div><div class="faq-answer">注册后填写专家资料并提交认证，1-3个工作日审核通过即可上线。</div></div></div>';}
async function claimCoupon(){if(!currentUser){showLogin();return;}try{var r=await api("/coupons/claim",{method:"POST"});if(r.success){alert("优惠券已领取！首单立减20元");var b=document.getElementById("couponBanner");if(b)b.innerHTML='<h3>✅ 优惠券已领取</h3><p>下单时自动抵扣</p>';}else{alert(r.error||"领取失败");}}catch(e){alert("请求失败");}}
`;

html = html.substring(0, csIdx) + newFuncs + '</script>';

// Validate
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
