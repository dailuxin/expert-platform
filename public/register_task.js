// ===== 注册流程 + 任务发布 前端 =====

// ========== 注册页面 ==========
function renderRegisterPage() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="register-v2">
      <h1 class="reg-title">创建账号</h1>
      <p class="reg-subtitle">选择您的身份类型</p>
      
      <!-- 角色选择 -->
      <div class="role-selector" id="roleSelector">
        <div class="role-card active" onclick="selectRole('personal')" data-role="personal">
          <div class="role-icon">👤</div>
          <div class="role-name">个人用户</div>
          <div class="role-desc">咨询、发布任务、寻找专家</div>
        </div>
        <div class="role-card" onclick="selectRole('company')" data-role="company">
          <div class="role-icon">🏢</div>
          <div class="role-name">企业用户</div>
          <div class="role-desc">企业咨询、批量采购、项目合作</div>
        </div>
        <div class="role-card" onclick="selectRole('expert')" data-role="expert">
          <div class="role-icon">👨‍💼</div>
          <div class="role-name">入驻专家</div>
          <div class="role-desc">提供专业咨询、发布文章</div>
        </div>
      </div>

      <form id="registerForm" class="reg-form" onsubmit="handleRegister(event)">
        <!-- 通用字段 -->
        <div class="form-group">
          <label>用户名 <span class="req">*</span></label>
          <input name="username" placeholder="请输入用户名" required>
        </div>
        <div class="form-group">
          <label>密码 <span class="req">*</span></label>
          <input name="password" type="password" placeholder="至少6位" required minlength="6">
        </div>
        <div class="form-group">
          <label>真实姓名 <span class="req">*</span></label>
          <input name="real_name" placeholder="请输入真实姓名" required>
        </div>
        <div class="form-group">
          <label>手机号 <span class="req">*</span></label>
          <input name="phone" type="tel" placeholder="请输入手机号" required pattern="[0-9]{11}">
        </div>
        <div class="form-group">
          <label>邮箱</label>
          <input name="email" type="email" placeholder="选填">
        </div>

        <!-- 身份证上传（所有角色） -->
        <div class="form-section-title">📋 身份验证</div>
        <div class="upload-group">
          <div class="upload-item">
            <label>身份证正面 <span class="req">*</span></label>
            <div class="upload-box" onclick="document.getElementById('id_front').click()">
              <input type="file" id="id_front" name="id_card_front" accept="image/*" hidden onchange="previewUpload(this,'id_front_preview')">
              <div id="id_front_preview" class="upload-placeholder">📷 点击上传</div>
            </div>
          </div>
          <div class="upload-item">
            <label>身份证反面 <span class="req">*</span></label>
            <div class="upload-box" onclick="document.getElementById('id_back').click()">
              <input type="file" id="id_back" name="id_card_back" accept="image/*" hidden onchange="previewUpload(this,'id_back_preview')">
              <div id="id_back_preview" class="upload-placeholder">📷 点击上传</div>
            </div>
          </div>
        </div>

        <!-- 企业特有字段 -->
        <div id="companyFields" style="display:none">
          <div class="form-section-title">🏢 企业信息</div>
          <div class="form-group">
            <label>公司名称 <span class="req">*</span></label>
            <input name="company_name" placeholder="请输入公司全称" required>
          </div>
          <div class="form-group">
            <label>经营范围 <span class="req">*</span></label>
            <textarea name="business_scope" placeholder="请输入经营范围" required rows="3"></textarea>
          </div>
          <div class="form-group">
            <label>营业执照 <span class="req">*</span></label>
            <div class="upload-box" onclick="document.getElementById('license').click()">
              <input type="file" id="license" name="business_license" accept="image/*,.pdf" hidden onchange="previewUpload(this,'license_preview')">
              <div id="license_preview" class="upload-placeholder">📄 点击上传营业执照</div>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>企业联系人</label>
              <input name="contact_person" placeholder="选填">
            </div>
            <div class="form-group">
              <label>联系电话</label>
              <input name="contact_phone" type="tel" placeholder="选填">
            </div>
          </div>
          <div class="form-group">
            <label>企业邮箱</label>
            <input name="contact_email" type="email" placeholder="选填">
          </div>
        </div>

        <!-- 专家特有字段 -->
        <div id="expertFields" style="display:none">
          <div class="form-section-title">👨‍💼 专家资质</div>
          <div class="form-group">
            <label>专业领域 <span class="req">*</span></label>
            <select name="industry" required>
              <option value="">请选择</option>
              <option>心理咨询</option><option>法律咨询</option><option>职业规划</option>
              <option>财税顾问</option><option>教育辅导</option><option>医疗健康</option>
              <option>IT技术</option><option>设计创意</option><option>其他</option>
            </select>
          </div>
          <div class="form-group">
            <label>职称/头衔</label>
            <input name="title" placeholder="如：高级心理咨询师">
          </div>
          <div class="form-group">
            <label>专业特长</label>
            <input name="specialties" placeholder="多个用逗号分隔">
          </div>
          <div class="form-group">
            <label>个人简介</label>
            <textarea name="self_intro" placeholder="介绍您的专业背景和经验" rows="4"></textarea>
          </div>
          <div class="form-group">
            <label>资质证书（最多5张）</label>
            <div class="upload-box" onclick="document.getElementById('certs').click()">
              <input type="file" id="certs" name="certificates" accept="image/*,.pdf" multiple hidden onchange="previewMultiUpload(this,'certs_preview')">
              <div id="certs_preview" class="upload-placeholder">📁 点击上传证书</div>
            </div>
          </div>
          <div class="form-section-title">🆘 紧急联系人</div>
          <div class="form-row">
            <div class="form-group">
              <label>紧急联系人 <span class="req">*</span></label>
              <input name="emergency_contact" placeholder="必填" required>
            </div>
            <div class="form-group">
              <label>紧急联系电话 <span class="req">*</span></label>
              <input name="emergency_phone" type="tel" placeholder="必填" required>
            </div>
          </div>
        </div>

        <button type="submit" class="reg-btn" id="regBtn">注册</button>
        <div class="reg-switch">已有账号？<a href="#" onclick="navigate('login');return false">立即登录</a></div>
      </form>
    </div>
  `;
  window._regRole = 'personal';
}

function selectRole(role) {
  window._regRole = role;
  document.querySelectorAll('.role-card').forEach(c => c.classList.remove('active'));
  document.querySelector(`.role-card[data-role="${role}"]`).classList.add('active');
  document.getElementById('companyFields').style.display = role === 'company' ? 'block' : 'none';
  document.getElementById('expertFields').style.display = role === 'expert' ? 'block' : 'none';
}

function previewUpload(input, previewId) {
  const el = document.getElementById(previewId);
  if (input.files[0]) {
    el.innerHTML = '<img src="' + URL.createObjectURL(input.files[0]) + '" style="max-width:100%;max-height:120px;object-fit:contain;border-radius:8px;">';
  }
}

function previewMultiUpload(input, previewId) {
  const el = document.getElementById(previewId);
  el.innerHTML = '';
  Array.from(input.files).forEach(f => {
    el.innerHTML += '<img src="' + URL.createObjectURL(f) + '" style="max-width:100px;max-height:80px;object-fit:contain;border-radius:6px;margin:4px;">';
  });
}

function handleRegister(e) {
  e.preventDefault();
  const form = document.getElementById('registerForm');
  const btn = document.getElementById('regBtn');
  btn.disabled = true;
  btn.textContent = '注册中...';
  
  const formData = new FormData(form);
  const role = window._regRole;
  
  fetch(API + '/register/' + role, { method: 'POST', body: formData })
    .then(r => r.json())
    .then(data => {
      if (data.success) {
        alert(data.message);
        navigate('login');
      } else {
        alert(data.error || '注册失败');
      }
    })
    .catch(err => alert('网络错误'))
    .finally(() => { btn.disabled = false; btn.textContent = '注册'; });
}

// ========== 任务发布模块 ==========
function renderTaskPublish() {
  const app = document.getElementById('app');
  if (!currentUser) { app.innerHTML = '<p>请先 <a href="#" onclick="navigate(\'login\');return false">登录</a></p>'; return; }
  
  app.innerHTML = `
    <div class="task-publish">
      <h2>📝 发布任务</h2>
      <p class="task-notice">⚠️ 发布的任务将经过管理员审核，请确保内容合法合规，不违反国家法律法规和行业规范。</p>
      <form onsubmit="handleTaskPublish(event)">
        <div class="form-group">
          <label>任务标题 <span class="req">*</span></label>
          <input name="title" placeholder="简要描述任务需求" required maxlength="100">
        </div>
        <div class="form-group">
          <label>任务分类</label>
          <select name="category">
            <option value="">请选择</option>
            <option>心理咨询</option><option>法律咨询</option><option>职业规划</option>
            <option>财税顾问</option><option>教育辅导</option><option>IT技术</option>
            <option>设计创意</option><option>文案策划</option><option>翻译服务</option>
            <option>其他</option>
          </select>
        </div>
        <div class="form-group">
          <label>任务描述 <span class="req">*</span></label>
          <textarea name="description" placeholder="详细描述您的需求、期望成果等" required rows="6"></textarea>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>最低预算 (¥)</label>
            <input name="budget_min" type="number" min="0" placeholder="0">
          </div>
          <div class="form-group">
            <label>最高预算 (¥)</label>
            <input name="budget_max" type="number" min="0" placeholder="0">
          </div>
        </div>
        <div class="form-group">
          <label>截止日期</label>
          <input name="deadline" type="date">
        </div>
        <div class="form-group">
          <label>技能要求</label>
          <textarea name="requirements" placeholder="对承接者的资质、经验要求等" rows="3"></textarea>
        </div>
        <div class="form-group">
          <label>附件（最多5个）</label>
          <div class="upload-box" onclick="document.getElementById('taskFiles').click()">
            <input type="file" id="taskFiles" name="attachments" multiple hidden onchange="previewMultiUpload(this,'taskFiles_preview')">
            <div id="taskFiles_preview" class="upload-placeholder">📎 点击上传附件</div>
          </div>
        </div>
        <button type="submit" class="reg-btn" id="taskBtn">提交审核</button>
      </form>
    </div>
  `;
}

function handleTaskPublish(e) {
  e.preventDefault();
  const btn = document.getElementById('taskBtn');
  btn.disabled = true; btn.textContent = '提交中...';
  
  const formData = new FormData(e.target);
  fetch(API + '/tasks', { method: 'POST', body: formData, headers: authHeaders() })
    .then(r => r.json())
    .then(data => {
      alert(data.message);
      if (data.success && data.task_id) navigate('task/' + data.task_id);
      else navigate('tasks');
    })
    .catch(() => alert('网络错误'))
    .finally(() => { btn.disabled = false; btn.textContent = '提交审核'; });
}

// ========== 任务列表页 ==========
function renderTaskList() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="task-list-page">
      <h2>📋 任务大厅</h2>
      <div class="task-filters">
        <input id="taskSearch" placeholder="搜索任务..." style="flex:1;padding:10px 14px;border:1px solid #ddd;border-radius:8px;">
        <select id="taskCatFilter" onchange="loadTasks(1)" style="padding:10px;border:1px solid #ddd;border-radius:8px;">
          <option value="">全部分类</option>
          <option>心理咨询</option><option>法律咨询</option><option>职业规划</option>
          <option>财税顾问</option><option>IT技术</option><option>设计创意</option><option>其他</option>
        </select>
      </div>
      <div id="taskListContainer"></div>
      <div id="taskPagination" class="pagination"></div>
    </div>
  `;
  loadTasks(1);
}

function loadTasks(page) {
  const keyword = document.getElementById('taskSearch')?.value || '';
  const category = document.getElementById('taskCatFilter')?.value || '';
  fetch(`${API}/tasks?page=${page}&keyword=${encodeURIComponent(keyword)}&category=${encodeURIComponent(category)}`)
    .then(r => r.json())
    .then(data => {
      const container = document.getElementById('taskListContainer');
      if (!data.tasks.length) { container.innerHTML = '<p style="text-align:center;color:#999;padding:40px;">暂无任务</p>'; return; }
      container.innerHTML = data.tasks.map(t => `
        <div class="task-card" onclick="navigate('task/${t.id}')">
          <div class="tc-title">${escHtml(t.title)}</div>
          <div class="tc-meta">
            <span class="tc-cat">${escHtml(t.category || '未分类')}</span>
            <span>👤 ${escHtml(t.publisher_name || '匿名')}</span>
            <span>👁 ${t.view_count || 0}</span>
            <span>👥 ${t.applicant_count || 0}人申请</span>
          </div>
          <div class="tc-desc">${escHtml((t.description || '').substring(0, 100))}${(t.description||'').length > 100 ? '...' : ''}</div>
          <div class="tc-budget">${t.budget_min || 0}${t.budget_max > t.budget_min ? ' - ¥' + t.budget_max : ''} 元</div>
        </div>
      `).join('');
      
      // 分页
      const pag = document.getElementById('taskPagination');
      if (data.totalPages > 1) {
        let html = '';
        if (data.page > 1) html += `<button onclick="loadTasks(${data.page-1})">上一页</button>`;
        html += `<span>第 ${data.page}/${data.totalPages} 页</span>`;
        if (data.page < data.totalPages) html += `<button onclick="loadTasks(${data.page+1})">下一页</button>`;
        pag.innerHTML = html;
      }
    })
    .catch(() => {});
}

// ========== 任务详情页 ==========
function renderTaskDetail(taskId) {
  const app = document.getElementById('app');
  fetch(`${API}/tasks/${taskId}`)
    .then(r => r.json())
    .then(task => {
      if (!task || !task.id) { app.innerHTML = '<p>任务不存在</p>'; return; }
      app.innerHTML = `
        <div class="task-detail">
          <h2>${escHtml(task.title)}</h2>
          <div class="td-meta">
            <span class="td-cat">${escHtml(task.category || '未分类')}</span>
            <span>👤 ${escHtml(task.publisher_name)}</span>
            <span>📅 ${task.created_at ? task.created_at.split('T')[0] : ''}</span>
            <span>👁 ${task.view_count}</span>
            <span>👥 ${task.applicant_count}人申请</span>
          </div>
          <div class="td-budget">💰 预算：¥${task.budget_min || 0}${task.budget_max > task.budget_min ? ' - ¥' + task.budget_max : ''}</div>
          ${task.deadline ? '<div class="td-deadline">⏰ 截止：' + escHtml(task.deadline) + '</div>' : ''}
          <div class="td-section">
            <h3>任务描述</h3>
            <p>${escHtml(task.description)}</p>
          </div>
          ${task.requirements ? '<div class="td-section"><h3>技能要求</h3><p>' + escHtml(task.requirements) + '</p></div>' : ''}
          ${task.attachments ? '<div class="td-section"><h3>附件</h3>' + task.attachments.split(',').map(a => '<a href="' + a + '" target="_blank" class="td-attach">📎 ' + a.split('/').pop() + '</a>').join('') + '</div>' : ''}
          <div style="margin-top:24px;text-align:center;">
            ${currentUser && task.publisher_id !== currentUser.id ? '<button class="reg-btn" onclick="navigate(\'task-apply/' + task.id + '\')">申请此任务</button>' : ''}
            <button class="btn-outline" onclick="navigate('tasks')" style="margin-left:8px;">返回任务列表</button>
          </div>
        </div>
      `;
    })
    .catch(() => { app.innerHTML = '<p>加载失败</p>'; });
}

// ========== 任务申请页 ==========
function renderTaskApply(taskId) {
  const app = document.getElementById('app');
  if (!currentUser) { app.innerHTML = '<p>请先 <a href="#" onclick="navigate(\'login\');return false">登录</a></p>'; return; }
  
  app.innerHTML = `
    <div class="task-apply-page">
      <h2>📝 申请任务 #${taskId}</h2>
      <form onsubmit="handleTaskApply(event, ${taskId})">
        <div class="form-group">
          <label>方案描述</label>
          <textarea name="proposal" placeholder="描述您的能力、方案思路、预计完成时间等" rows="6"></textarea>
        </div>
        <div class="form-group">
          <label>报价 (¥)</label>
          <input name="proposed_budget" type="number" min="0" placeholder="您的报价">
        </div>
        <button type="submit" class="reg-btn" id="applyBtn">提交申请</button>
      </form>
    </div>
  `;
}

function handleTaskApply(e, taskId) {
  e.preventDefault();
  const btn = document.getElementById('applyBtn');
  btn.disabled = true; btn.textContent = '提交中...';
  
  fetch(API + '/tasks/' + taskId + '/apply', {
    method: 'POST',
    headers: { ...authHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify({
      proposal: e.target.proposal.value,
      proposed_budget: parseFloat(e.target.proposed_budget.value) || 0
    })
  })
    .then(r => r.json())
    .then(data => {
      alert(data.message || (data.success ? '申请成功' : '申请失败'));
      if (data.success) navigate('tasks');
    })
    .catch(() => alert('网络错误'))
    .finally(() => { btn.disabled = false; btn.textContent = '提交申请'; });
}

// ========== 我的任务 ==========
function renderMyTasks() {
  const app = document.getElementById('app');
  if (!currentUser) { app.innerHTML = '<p>请先 <a href="#" onclick="navigate(\'login\');return false">登录</a></p>'; return; }
  
  fetch(API + '/my/tasks', { headers: authHeaders() })
    .then(r => r.json())
    .then(tasks => {
      const statusMap = { pending_review: '⏳ 待审核', published: '✅ 已发布', paused: '⏸️ 已暂停', completed: '🎉 已完成', rejected: '❌ 已拒绝', cancelled: '🚫 已取消' };
      app.innerHTML = `
        <div class="my-tasks">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
            <h2>我的任务</h2>
            <button class="reg-btn" onclick="navigate('task-publish')" style="font-size:14px;padding:8px 16px;">+ 发布新任务</button>
          </div>
          ${tasks.length === 0 ? '<p style="text-align:center;color:#999;padding:40px;">暂无任务</p>' : ''}
          ${tasks.map(t => `
            <div class="task-card" onclick="navigate('task/${t.id}')">
              <div class="tc-title">${escHtml(t.title)}</div>
              <div class="tc-meta">
                <span>${statusMap[t.status] || t.status}</span>
                <span>👥 ${t.applicant_count || 0}人申请</span>
                <span>👁 ${t.view_count || 0}</span>
              </div>
              ${t.reject_reason ? '<div style="color:#e74c3c;font-size:13px;margin-top:4px;">拒绝原因：' + escHtml(t.reject_reason) + '</div>' : ''}
            </div>
          `).join('')}
        </div>
      `;
    })
    .catch(() => {});
}
