// ===== P1+P2+P3 前端功能模块 =====

// ========== P2: 智能客服悬浮窗口 ==========
function initChatbot() {
  if (document.getElementById('chatbotWidget')) return;
  const widget = document.createElement('div');
  widget.id = 'chatbotWidget';
  widget.innerHTML = `
    <div class="chatbot-btn" onclick="toggleChatbot()" title="智能客服">
      <svg viewBox="0 0 24 24" width="28" height="28" fill="white"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/><path d="M7 9h2v2H7zm4 0h2v2h-2zm4 0h2v2h-2z"/></svg>
    </div>
    <div class="chatbot-window" id="chatbotWindow" style="display:none">
      <div class="chatbot-header">
        <span>🤖 智能客服</span>
        <button onclick="toggleChatbot()">×</button>
      </div>
      <div class="chatbot-messages" id="chatbotMessages">
        <div class="chatbot-msg bot">您好！我是智能客服，请问有什么可以帮您？</div>
      </div>
      <div class="chatbot-quick">
        <span onclick="chatbotQuick('价格')">💰 价格</span>
        <span onclick="chatbotQuick('怎么预约')">📅 预约</span>
        <span onclick="chatbotQuick('退款')">🔄 退款</span>
        <span onclick="chatbotQuick('成为专家')">👨‍💼 入驻</span>
      </div>
      <div class="chatbot-input">
        <input id="chatbotInput" placeholder="输入您的问题..." onkeydown="if(event.key==='Enter')sendChatbot()">
        <button onclick="sendChatbot()">发送</button>
      </div>
    </div>
  `;
  document.body.appendChild(widget);
}

function toggleChatbot() {
  const w = document.getElementById('chatbotWindow');
  if (w) w.style.display = w.style.display === 'none' ? 'flex' : 'none';
}

function chatbotQuick(msg) {
  document.getElementById('chatbotInput').value = msg;
  sendChatbot();
}

async function sendChatbot() {
  const input = document.getElementById('chatbotInput');
  const msg = input.value.trim();
  if (!msg) return;
  input.value = '';

  const box = document.getElementById('chatbotMessages');
  box.innerHTML += '<div class="chatbot-msg user">' + escHtml(msg) + '</div>';

  // 显示加载动画
  box.innerHTML += '<div class="chatbot-msg bot" id="chatbotTyping">思考中...</div>';
  box.scrollTop = box.scrollHeight;

  try {
    const r = await fetch(API + '/chatbot/reply', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: msg })
    });
    const data = await r.json();
    const typing = document.getElementById('chatbotTyping');
    if (typing) typing.textContent = data.reply || '抱歉，暂时无法回答';
    box.scrollTop = box.scrollHeight;
  } catch (e) {
    const typing = document.getElementById('chatbotTyping');
    if (typing) typing.textContent = '网络错误，请稍后重试';
  }
}

// ========== P2: 公告系统 ==========
function loadAnnouncements() {
  fetch(API + '/announcements')
    .then(r => r.json())
    .then(list => {
      if (!list.length) return;
      let html = '<div class="announcement-bar" id="announcementBar">';
      html += '<span class="ann-icon">📢</span><div class="ann-scroll">';
      list.forEach(a => {
        html += '<div class="ann-item"><b>' + escHtml(a.title) + ':</b> ' + escHtml(a.content) + '</div>';
      });
      html += '</div></div>';
      document.getElementById('app').insertAdjacentHTML('afterbegin', html);
      // 自动滚动
      startAnnScroll();
    })
    .catch(() => {});
}

function startAnnScroll() {
  const scroll = document.querySelector('.ann-scroll');
  if (!scroll || scroll.children.length <= 1) return;
  setInterval(() => {
    scroll.appendChild(scroll.firstElementChild);
  }, 5000);
}

// ========== P1: 搜索分页 ==========
let currentPage = 1;
const perPage = 12;

function loadExpertsPaged(page) {
  currentPage = page || 1;
  const search = document.getElementById('searchInput')?.value || '';
  const industry = urlIndustry || '';
  let url = API + '/experts?page=' + currentPage + '&limit=' + perPage;
  if (search) url += '&search=' + encodeURIComponent(search);
  if (industry) url += '&industry=' + encodeURIComponent(industry);
  // 筛选参数
  const minP = document.getElementById('minPrice')?.value;
  const maxP = document.getElementById('maxPrice')?.value;
  const minR = document.getElementById('minRating')?.value;
  if (minP) url += '&min_price=' + minP;
  if (maxP) url += '&max_price=' + maxP;
  if (minR) url += '&min_rating=' + minR;

  showSkeleton();
  fetch(url).then(r => r.json()).then(data => {
    renderExpertList(data.experts || data);
    // 分页控件
    renderPagination(data.total || 0);
  }).catch(() => hideSkeleton());
}

function renderPagination(total) {
  const totalPages = Math.ceil(total / perPage);
  if (totalPages <= 1) return;
  let html = '<div class="pagination">';
  if (currentPage > 1) html += '<button onclick="loadExpertsPaged(' + (currentPage - 1) + ')">上一页</button>';
  for (let i = 1; i <= totalPages && i <= 10; i++) {
    html += '<button class="' + (i === currentPage ? 'active' : '') + '" onclick="loadExpertsPaged(' + i + ')">' + i + '</button>';
  }
  if (currentPage < totalPages) html += '<button onclick="loadExpertsPaged(' + (currentPage + 1) + ')">下一页</button>';
  html += '</div>';
  const listEl = document.getElementById('expertList');
  if (listEl) listEl.insertAdjacentHTML('afterend', html);
}

// ========== P1: 用户咨询记录 ==========
function loadMyBookings() {
  fetch(API + '/my-bookings', { headers: authHeaders() })
    .then(r => r.json())
    .then(list => {
      if (!list.length) {
        document.getElementById('app').innerHTML += '<div class="empty-state"><h3>暂无咨询记录</h3><p>去首页浏览专家开始咨询吧</p></div>';
        return;
      }
      let html = '<div class="my-bookings"><h2>我的咨询记录</h2>';
      const statusMap = { pending_payment: '待支付', paid: '已支付', confirmed: '已确认', completed: '已完成', cancelled: '已取消', refunding: '退款中', refunded: '已退款' };
      list.forEach(b => {
        html += `<div class="booking-card">
          <div class="booking-top"><span class="booking-expert">${escHtml(b.expert_name || '专家')}</span><span class="status-${b.status}">${statusMap[b.status] || b.status}</span></div>
          <div class="booking-info">预约时间：${b.booking_date || '-'} ${b.time_slot || '-'}</div>
          <div class="booking-info">金额：¥${b.total_price || 0}</div>
          <div class="booking-time">${b.created_at || ''}</div>
        </div>`;
      });
      html += '</div>';
      document.getElementById('app').innerHTML += html;
    })
    .catch(() => {});
}

// ========== P2: 管理后台增强 ==========
function loadAdminEnhanced() {
  loadAdminDashboard();
  loadAdminLogs();
}

function loadAdminLogs() {
  fetch(API + '/admin/logs', { headers: authHeaders() })
    .then(r => r.json())
    .then(list => {
      if (!list.length) return;
      const container = document.getElementById('adminLogsContainer');
      if (!container) return;
      let html = '<h3>操作日志</h3><div class="log-list">';
      list.slice(0, 50).forEach(l => {
        html += '<div class="log-item"><span class="log-time">' + (l.created_at || '') + '</span> <span class="log-user">' + escHtml(l.username || '') + '</span> <span class="log-action">' + escHtml(l.action || '') + '</span></div>';
      });
      html += '</div>';
      container.innerHTML = html;
    })
    .catch(() => {});
}

// ========== P1: 评分分布图 ==========
function loadRatingDist(expertId) {
  fetch(API + '/experts/' + expertId + '/rating-dist')
    .then(r => r.json())
    .then(dist => {
      renderRatingChart(dist);
    })
    .catch(() => {});
}

function renderRatingChart(dist) {
  const container = document.getElementById('ratingChartContainer');
  if (!container) return;
  let html = '<div class="rating-dist">';
  const labels = [5, 4, 3, 2, 1];
  const total = labels.reduce((s, l) => s + dist[l], 0);
  labels.forEach(star => {
    const pct = total > 0 ? Math.round(dist[star] / total * 100) : 0;
    html += '<div class="dist-row"><span class="dist-star">' + star + '星</span><div class="dist-bar"><div class="dist-fill" style="width:' + pct + '%"></div></div><span class="dist-count">' + dist[star] + ' (' + pct + '%)</span></div>';
  });
  html += '</div>';
  container.innerHTML = html;
}

// ========== 初始化 ==========
document.addEventListener('DOMContentLoaded', () => {
  initChatbot();
  loadAnnouncements();
});
