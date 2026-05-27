// public/schedule.js — 专家日程管理前端
// 依赖：window.USER / window.USER_ID 已设置，且当前用户是专家

const DAYS = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

let scheduleData = [];
let timeOffData = [];

// 初始化日程管理页面
function initSchedulePage() {
  const container = document.getElementById('schedule-container') || createScheduleContainer();
  loadSchedule();
  loadTimeOff();
  renderScheduleUI(container);
}

function createScheduleContainer() {
  const div = document.createElement('div');
  div.id = 'schedule-container';
  div.className = 'schedule-manager';
  const main = document.getElementById('main-content') || document.querySelector('.main-content');
  if (main) main.appendChild(div);
  return div;
}

// 加载日程设置
async function loadSchedule() {
  try {
    const res = await fetch('/api/expert/schedule', { credentials: 'include' });
    const data = await res.json();
    scheduleData = data.schedule || [];
    timeOffData = data.time_off || [];
    renderScheduleTable();
    renderTimeOffList();
  } catch (e) {
    console.error('加载日程失败', e);
  }
}

// 加载请假日期
async function loadTimeOff() {
  // 已由 loadSchedule 一起返回
}

// 渲染日程表格
function renderScheduleTable() {
  const tbody = document.getElementById('schedule-tbody');
  if (!tbody) return;

  tbody.innerHTML = '';
  for (let d = 0; d < 7; d++) {
    const existing = scheduleData.find(s => s.day_of_week === d) || {};
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><label><input type="checkbox" class="day-toggle" data-day="${d}" ${existing.is_available !== 0 ? 'checked' : ''}> ${DAYS[d]}</label></td>
      <td><input type="time" class="start-time" data-day="${d}" value="${existing.start_time || '09:00'}" ${existing.is_available === 0 ? 'disabled' : ''}></td>
      <td><input type="time" class="end-time" data-day="${d}" value="${existing.end_time || '17:00'}" ${existing.is_available === 0 ? 'disabled' : ''}></td>
    `;
    tbody.appendChild(tr);
  }

  // 绑定 checkbox 事件
  tbody.querySelectorAll('.day-toggle').forEach(cb => {
    cb.addEventListener('change', function () {
      const day = this.dataset.day;
      const row = this.closest('tr');
      row.querySelector('.start-time').disabled = !this.checked;
      row.querySelector('.end-time').disabled = !this.checked;
    });
  });
}

// 渲染请假列表
function renderTimeOffList() {
  const list = document.getElementById('timeoff-list');
  if (!list) return;
  list.innerHTML = '';
  for (const t of timeOffData) {
    const li = document.createElement('li');
    li.innerHTML = `${t.off_date} ${t.reason || ''} <button onclick="removeTimeOff('${t.off_date}')">删除</button>`;
    list.appendChild(li);
  }
}

// 保存日程设置
async function saveSchedule() {
  const schedule = [];
  for (let d = 0; d < 7; d++) {
    const cb = document.querySelector(`.day-toggle[data-day="${d}"]`);
    if (cb && cb.checked) {
      const start = document.querySelector(`.start-time[data-day="${d}"]`).value;
      const end = document.querySelector(`.end-time[data-day="${d}"]`).value;
      if (start && end) {
        schedule.push({ day_of_week: d, start_time: start, end_time: end, is_available: true });
      }
    }
  }

  try {
    const res = await fetch('/api/expert/schedule', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ schedule })
    });
    const data = await res.json();
    if (data.success) {
      alert('日程保存成功！');
      loadSchedule();
    } else {
      alert('保存失败：' + (data.error || '未知错误'));
    }
  } catch (e) {
    alert('保存失败：' + e.message);
  }
}

// 添加请假日期
async function addTimeOff() {
  const dateInput = document.getElementById('timeoff-date');
  const reasonInput = document.getElementById('timeoff-reason');
  if (!dateInput || !dateInput.value) return alert('请选择日期');

  try {
    const res = await fetch('/api/expert/time-off', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ off_date: dateInput.value, reason: reasonInput ? reasonInput.value : '' })
    });
    const data = await res.json();
    if (data.success) {
      dateInput.value = '';
      if (reasonInput) reasonInput.value = '';
      loadSchedule();
    } else {
      alert('添加失败：' + (data.error || '未知错误'));
    }
  } catch (e) {
    alert('添加失败：' + e.message);
  }
}

// 删除请假日期
async function removeTimeOff(date) {
  if (!confirm('确定删除 ' + date + ' 的请假记录？')) return;
  try {
    const res = await fetch('/api/expert/time-off/' + encodeURIComponent(date), {
      method: 'DELETE',
      credentials: 'include'
    });
    const data = await res.json();
    if (data.success) loadSchedule();
  } catch (e) {
    alert('删除失败：' + e.message);
  }
}

// 渲染日程管理 UI（注入到页面）
function renderScheduleUI(container) {
  container.innerHTML = `
    <div class="card">
      <h3>📅 我的可预约时间</h3>
      <p style="color:#888;font-size:13px;">设置您每周的可用时间段，用户只能预约您设置的时间。</p>
      <table class="schedule-table">
        <thead><tr><th>星期</th><th>开始时间</th><th>结束时间</th></tr></thead>
        <tbody id="schedule-tbody"></tbody>
      </table>
      <button class="btn btn-primary" onclick="saveSchedule()">保存日程</button>
    </div>

    <div class="card" style="margin-top:20px;">
      <h3>🚫 不可预约日期（请假/休息）</h3>
      <div style="display:flex;gap:10px;margin-bottom:10px;">
        <input type="date" id="timeoff-date" class="form-input">
        <input type="text" id="timeoff-reason" class="form-input" placeholder="原因（可选）">
        <button class="btn btn-primary" onclick="addTimeOff()">添加</button>
      </div>
      <ul id="timeoff-list" class="timeoff-list"></ul>
    </div>
  `;
  renderScheduleTable();
  renderTimeOffList();
}

// 在专家仪表盘注入「日程管理」入口
function injectScheduleTab() {
  // 如果是专家，尝试多种选择器找到 tab 导航栏
  if (!window.USER || !window.USER.expert_id) return;

  if (document.getElementById('schedule-tab-btn')) return; // 已注入

  // 尝试找到专家 tab 栏的多种可能选择器
  const selectors = [
    '.expert-nav', '.expert-tabs', '.tab-nav',
    '[role="tablist"]', '.nav-tabs',
    '.dashboard-tabs', '.expert-dashboard-tabs'
  ];

  let nav = null;
  for (const sel of selectors) {
    const el = document.querySelector(sel);
    if (el) { nav = el; break; }
  }

  // 如果找不到，找包含「服务套餐」或「我的资料」的父容器
  if (!nav) {
    const refBtn = Array.from(document.querySelectorAll('.tab-btn, button')).find(b =>
      b.textContent.includes('服务套餐') || b.textContent.includes('我的资料')
    );
    if (refBtn) nav = refBtn.parentNode;
  }

  if (!nav) {
    // 用 MutationObserver 等待 DOM 出现
    const observer = new MutationObserver(() => { injectScheduleTab(); });
    observer.observe(document.body, { childList: true, subtree: true });
    return;
  }

  const btn = document.createElement('button');
  btn.id = 'schedule-tab-btn';
  btn.className = 'tab-btn';
  btn.textContent = '日程管理';
  btn.onclick = function () {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    this.classList.add('active');
    // 隐藏其他页面，显示日程页面
    document.querySelectorAll('.page-container').forEach(p => p.style.display = 'none');
    const page = document.getElementById('page-schedule');
    if (page) { page.style.display = 'block'; initSchedulePage(); }
  };
  nav.appendChild(btn);
  console.log('✅ 日程管理 Tab 已注入');
}

// 页面加载后自动注入（如果是专家）
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(injectScheduleTab, 500);
});
// 监听 SPA 路由变化（hash 变化）
window.addEventListener('hashchange', () => setTimeout(injectScheduleTab, 500));
// 暴露给外部调用
window.injectScheduleTab = injectScheduleTab;

// 导出
window.initSchedulePage = initSchedulePage;
window.saveSchedule = saveSchedule;
window.addTimeOff = addTimeOff;
window.removeTimeOff = removeTimeOff;
