// public/booking_slots.js — 预订页面：按专家日程显示可用时间段
// 依赖：页面中存在预订表单，且有 expert_id 信息

let currentExpertId = null;
let selectedDate = null;
let availableSlots = [];
let selectedSlot = null;

// 监听 SPA 路由变化，在预订页面注入日期+时段选择
window.addEventListener('hashchange', onHashChange);
document.addEventListener('DOMContentLoaded', () => setTimeout(onHashChange, 800));

function onHashChange() {
  const hash = window.location.hash || '';
  // 检测是否进入预订页面（hash 含 booking 或 expert 详情页有预订表单）
  setTimeout(() => {
    const form = findBookingForm();
    if (form && !form.dataset.slotsInjected) {
      form.dataset.slotsInjected = 'true';
      injectDateAndSlots(form);
    }
  }, 600);
}

// 查找预订表单
function findBookingForm() {
  // 尝试多种选择器
  return document.querySelector('[data-booking-form]')
    || document.getElementById('booking-form')
    || document.querySelector('form[name="booking"]')
    || Array.from(document.querySelectorAll('form')).find(f => {
         return f.innerHTML.includes('booking') || f.innerHTML.includes('预约')
           || f.querySelector('input[name*="date"], input[name*="time"]');
       });
}

// 从页面中提取当前专家 ID
function getExpertIdFromPage() {
  // 尝试从 URL hash 中提取，如 #expert/123 或 #booking?expert=123
  const hash = window.location.hash || '';
  let m = hash.match(/expert[\/=](\d+)/i);
  if (m) return m[1];
  m = hash.match(/[?&]expert[=_](\d+)/i);
  if (m) return m[1];
  // 尝试从页面元素中提取
  const el = document.querySelector('[data-expert-id]');
  if (el) return el.dataset.expertId;
  // 尝试从全局变量
  if (window.CURRENT_EXPERT_ID) return window.CURRENT_EXPERT_ID;
  return currentExpertId;
}

// 注入日期选择器和时段列表
function injectDateAndSlots(form) {
  currentExpertId = getExpertIdFromPage();
  if (!currentExpertId) {
    console.warn('无法获取专家 ID，时段选择未启用');
    return;
  }

  // 找到时间输入框，替换为日期+时段选择
  const timeInput = form.querySelector('input[name="booking_time"], input[type="time"]');
  const dateInput = form.querySelector('input[name="booking_date"], input[type="date"]');

  // 创建日期选择器（如果不存在）
  let dateEl = dateInput;
  if (!dateEl) {
    dateEl = document.createElement('input');
    dateEl.type = 'date';
    dateEl.name = 'booking_date';
    dateEl.className = 'form-input';
    dateEl.placeholder = '选择日期';
    dateEl.required = true;
    // 插入到时间输入框前面
    if (timeInput && timeInput.parentNode) {
      timeInput.parentNode.insertBefore(dateEl, timeInput);
    } else {
      form.insertBefore(dateEl, form.firstChild);
    }
  }
  dateEl.onchange = onDateSelected;

  // 创建时段容器
  let slotsEl = document.getElementById('available-slots-container');
  if (!slotsEl) {
    slotsEl = document.createElement('div');
    slotsEl.id = 'available-slots-container';
    slotsEl.className = 'slots-container';
    slotsEl.innerHTML = '<p style="color:#888;font-size:13px;">请先选择日期</p>';
    // 插入到日期选择器后面
    dateEl.parentNode && dateEl.parentNode.insertBefore(slotsEl, dateEl.nextSibling);
  }

  // 隐藏原始时间输入框（如果存在）
  if (timeInput) {
    timeInput.style.display = 'none';
    timeInput.required = false;
  }

  // 绑定表单提交：把选中的时段填入隐藏的 timeInput
  form.onsubmit = function (e) {
    if (!selectedSlot) {
      alert('请选择预约时间段');
      e.preventDefault();
      return false;
    }
    if (timeInput) timeInput.value = selectedSlot;
    return true;
  };

  console.log('✅ 预订时段选择已注入');
}

// 日期选中时，获取可用时段
async function onDateSelected(e) {
  selectedDate = e.target.value;
  if (!selectedDate || !currentExpertId) return;

  const container = document.getElementById('available-slots-container');
  if (container) container.innerHTML = '<p>加载中...</p>';

  try {
    const res = await fetch(`/api/experts/${currentExpertId}/available-slots?date=${encodeURIComponent(selectedDate)}`, {
      credentials: 'include'
    });
    const data = await res.json();
    availableSlots = data.slots || [];
    renderSlots(container);
  } catch (e) {
    if (container) container.innerHTML = '<p style="color:red;">加载失败，请重试</p>';
    console.error('获取可用时段失败', e);
  }
}

// 渲染可用时段按钮
function renderSlots(container) {
  if (!container) return;
  container.innerHTML = '';

  if (availableSlots.length === 0) {
    container.innerHTML = '<p style="color:#888;">该日无可用时段，请选择其他日期。</p>';
    selectedSlot = null;
    return;
  }

  const label = document.createElement('p');
  label.textContent = '可用时间段（点击选择）：';
  label.style.cssText = 'margin:8px 0 4px;font-size:13px;color:#555;';
  container.appendChild(label);

  const btnGroup = document.createElement('div');
  btnGroup.className = 'slot-buttons';
  btnGroup.style.cssText = 'display:flex;flex-wrap:wrap;gap:8px;';

  for (const slot of availableSlots) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'slot-btn';
    btn.textContent = slot;
    btn.style.cssText = 'padding:6px 14px;border:1px solid #ddd;border-radius:6px;background:#f9f9f9;cursor:pointer;font-size:14px;';
    btn.onclick = () => {
      selectedSlot = slot;
      // 高亮选中
      btnGroup.querySelectorAll('.slot-btn').forEach(b => {
        b.style.background = '#f9f9f9'; b.style.borderColor = '#ddd';
      });
      btn.style.background = '#007bff'; btn.style.color = '#fff'; btn.style.borderColor = '#007bff';
      // 填充隐藏的 time input
      const timeInput = document.querySelector('input[name="booking_time"], input[type="time"]');
      if (timeInput) timeInput.value = slot;
    };
    btnGroup.appendChild(btn);
  }

  container.appendChild(btnGroup);
}

// 暴露
window.initBookingSlots = injectDateAndSlots;
window.onDateSelected = onDateSelected;
