// ===== 注册流程改造 + 任务发布模块 =====
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');
const multer = require('multer');

// 文件上传配置
const uploadDir = path.join(__dirname, 'public', 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + Math.random().toString(36).substr(2, 8) + path.extname(file.originalname))
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 }, fileFilter: (req, file, cb) => {
  const allowed = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.pdf'];
  const ext = path.extname(file.originalname).toLowerCase();
  cb(null, allowed.includes(ext));
}});

// ========== 注册流程（三角色） ==========

// 个人用户注册
router.post('/register/personal', upload.fields([
  { name: 'id_card_front', maxCount: 1 },
  { name: 'id_card_back', maxCount: 1 }
]), (req, res) => {
  try {
    const db = req.app.get('db');
    const { username, password, real_name, phone, email } = req.body;
    if (!username || !password) return res.status(400).json({ error: '用户名和密码必填' });
    if (!phone) return res.status(400).json({ error: '手机号必填' });
    if (!real_name) return res.status(400).json({ error: '真实姓名必填' });
    if (db.get('SELECT id FROM users WHERE username = ?', [username])) return res.status(400).json({ error: '用户名已存在' });
    
    const hash = bcrypt.hashSync(password, 12);
    const idFront = req.files['id_card_front'] ? '/uploads/' + req.files['id_card_front'][0].filename : '';
    const idBack = req.files['id_card_back'] ? '/uploads/' + req.files['id_card_back'][0].filename : '';
    
    const result = db.run('INSERT INTO users (username, password, real_name, phone, email, role, id_card_front, id_card_back, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [username, hash, real_name, phone, email || '', 'user', idFront, idBack, 'active']);
    
    db.run('INSERT INTO operation_logs (user_id, username, action, target_type, detail) VALUES (?, ?, ?, ?, ?)',
      [result.lastInsertRowid, username, 'register_personal', 'user', '个人用户注册']);
    db.save();
    
    res.json({ success: true, message: '注册成功' });
  } catch (e) {
    res.status(500).json({ error: '注册失败: ' + e.message });
  }
});

// 企业注册
router.post('/register/company', upload.fields([
  { name: 'id_card_front', maxCount: 1 },
  { name: 'id_card_back', maxCount: 1 },
  { name: 'business_license', maxCount: 1 }
]), (req, res) => {
  try {
    const db = req.app.get('db');
    const { username, password, real_name, phone, email, company_name, business_scope, contact_person, contact_phone, contact_email } = req.body;
    if (!username || !password) return res.status(400).json({ error: '用户名和密码必填' });
    if (!phone) return res.status(400).json({ error: '手机号必填' });
    if (!company_name) return res.status(400).json({ error: '公司名称必填' });
    if (!business_scope) return res.status(400).json({ error: '经营范围必填' });
    if (db.get('SELECT id FROM users WHERE username = ?', [username])) return res.status(400).json({ error: '用户名已存在' });
    
    const hash = bcrypt.hashSync(password, 12);
    const idFront = req.files['id_card_front'] ? '/uploads/' + req.files['id_card_front'][0].filename : '';
    const idBack = req.files['id_card_back'] ? '/uploads/' + req.files['id_card_back'][0].filename : '';
    const license = req.files['business_license'] ? '/uploads/' + req.files['business_license'][0].filename : '';
    
    const result = db.run('INSERT INTO users (username, password, real_name, phone, email, role, id_card_front, id_card_back, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [username, hash, real_name || '', phone, email || '', 'company', idFront, idBack, 'pending_review']);
    
    const userId = result.lastInsertRowid;
    db.run('INSERT INTO companies (user_id, company_name, business_license, business_scope, contact_person, contact_phone, contact_email) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [userId, company_name, license, business_scope, contact_person || '', contact_phone || '', contact_email || '']);
    
    db.run('INSERT INTO operation_logs (user_id, username, action, target_type, detail) VALUES (?, ?, ?, ?, ?)',
      [userId, username, 'register_company', 'company', '企业注册待审核: ' + company_name]);
    
    // 通知管理员
    const admin = db.get("SELECT id FROM users WHERE role='admin' LIMIT 1");
    if (admin) {
      db.run('INSERT INTO notifications (user_id, type, title, content, related_id) VALUES (?, ?, ?, ?, ?)',
        [admin.id, 'system', '新企业注册', `企业"${company_name}"申请注册，等待审核`, userId]);
    }
    db.save();
    
    res.json({ success: true, message: '注册成功，企业资质审核中（1-3个工作日）' });
  } catch (e) {
    res.status(500).json({ error: '注册失败: ' + e.message });
  }
});

// 专家注册
router.post('/register/expert', upload.fields([
  { name: 'id_card_front', maxCount: 1 },
  { name: 'id_card_back', maxCount: 1 },
  { name: 'certificates', maxCount: 5 }
]), (req, res) => {
  try {
    const db = req.app.get('db');
    const { username, password, real_name, phone, email, industry, title, specialties, emergency_contact, emergency_phone, self_intro } = req.body;
    if (!username || !password) return res.status(400).json({ error: '用户名和密码必填' });
    if (!phone) return res.status(400).json({ error: '手机号必填' });
    if (!real_name) return res.status(400).json({ error: '真实姓名必填' });
    if (!industry) return res.status(400).json({ error: '专业领域必填' });
    if (!emergency_contact) return res.status(400).json({ error: '紧急联系人必填' });
    if (!emergency_phone) return res.status(400).json({ error: '紧急联系人电话必填' });
    if (db.get('SELECT id FROM users WHERE username = ?', [username])) return res.status(400).json({ error: '用户名已存在' });
    
    const hash = bcrypt.hashSync(password, 12);
    const idFront = req.files['id_card_front'] ? '/uploads/' + req.files['id_card_front'][0].filename : '';
    const idBack = req.files['id_card_back'] ? '/uploads/' + req.files['id_card_back'][0].filename : '';
    const certs = (req.files['certificates'] || []).map(f => '/uploads/' + f.filename).join(',');
    
    const result = db.run('INSERT INTO users (username, password, real_name, phone, email, role, id_card_front, id_card_back, emergency_contact, emergency_phone, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [username, hash, real_name, phone, email || '', 'expert', idFront, idBack, emergency_contact, emergency_phone, 'pending_review']);
    
    const userId = result.lastInsertRowid;
    db.run('INSERT INTO experts (user_id, industry, title, self_intro, resume_path, audit_status) VALUES (?, ?, ?, ?, ?, ?)',
      [userId, industry, title || '', self_intro || '', certs, 'pending']);
    
    db.run('INSERT INTO operation_logs (user_id, username, action, target_type, detail) VALUES (?, ?, ?, ?, ?)',
      [userId, username, 'register_expert', 'expert', '专家注册待审核: ' + real_name]);
    
    const admin = db.get("SELECT id FROM users WHERE role='admin' LIMIT 1");
    if (admin) {
      db.run('INSERT INTO notifications (user_id, type, title, content, related_id) VALUES (?, ?, ?, ?, ?)',
        [admin.id, 'system', '新专家注册', `专家"${real_name}"(${industry})申请入驻，等待审核`, userId]);
    }
    db.save();
    
    res.json({ success: true, message: '注册成功，专家资质审核中（1-3个工作日）' });
  } catch (e) {
    res.status(500).json({ error: '注册失败: ' + e.message });
  }
});

// ========== 任务发布模块 ==========

// 发布任务
router.post('/tasks', upload.array('attachments', 5), (req, res) => {
  try {
    const db = req.app.get('db');
    if (!req.session || !req.session.userId) return res.status(401).json({ error: '未登录' });
    
    const { title, description, category, budget_min, budget_max, deadline, requirements } = req.body;
    if (!title) return res.status(400).json({ error: '任务标题必填' });
    if (!description) return res.status(400).json({ error: '任务描述必填' });
    
    // 合规检查关键词（基础过滤）
    const blockedPatterns = [/赌博/, /代开发票/, /刷单/, /代写/, /造假/, /洗钱/, /传销/, /非法/, /违禁/, /枪支/, /毒品/];
    const checkText = title + ' ' + description + ' ' + (requirements || '');
    const violations = blockedPatterns.filter(p => p.test(checkText));
    
    const attachments = (req.files || []).map(f => '/uploads/' + f.filename).join(',');
    
    const result = db.run(
      `INSERT INTO tasks (publisher_id, title, description, category, budget_min, budget_max, deadline, requirements, attachments, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [req.session.userId, title, description, category || '', budget_min || 0, budget_max || 0, deadline || '', requirements || '', attachments, 
       violations.length > 0 ? 'rejected' : 'pending_review']
    );
    
    if (violations.length > 0) {
      db.run('UPDATE tasks SET reject_reason = ?, reviewer_id = 0, reviewed_at = datetime("now") WHERE id = ?',
        ['内容涉嫌违规，自动拦截：' + violations.map(v => v.source).join(', '), result.lastInsertRowid]);
    }
    
    db.run('INSERT INTO operation_logs (user_id, username, action, target_type, target_id, detail) VALUES (?, ?, ?, ?, ?, ?)',
      [req.session.userId, req.session.username, violations.length > 0 ? 'task_rejected_auto' : 'task_create', 'task', result.lastInsertRowid, 
       violations.length > 0 ? '任务自动拦截-违规内容' : '发布任务: ' + title]);
    db.save();
    
    res.json({ 
      success: true, 
      task_id: result.lastInsertRowid,
      message: violations.length > 0 ? '任务因涉嫌违规内容被自动拦截，请联系管理员申诉' : '任务已提交，等待审核后发布'
    });
  } catch (e) {
    res.status(500).json({ error: '发布失败: ' + e.message });
  }
});

// 获取任务列表（已发布的）
router.get('/tasks', (req, res) => {
  const db = req.app.get('db');
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = 12;
  const offset = (page - 1) * limit;
  const category = req.query.category || '';
  const keyword = req.query.keyword || '';
  
  let where = "t.status='published'";
  let params = [];
  if (category) { where += " AND t.category=?"; params.push(category); }
  if (keyword) { where += " AND (t.title LIKE ? OR t.description LIKE ?)"; params.push('%' + keyword + '%', '%' + keyword + '%'); }
  
  const total = db.get('SELECT COUNT(*) as c FROM tasks t WHERE ' + where, params)?.c || 0;
  const tasks = db.query(
    `SELECT t.*, u.real_name as publisher_name, u.role as publisher_role 
     FROM tasks t LEFT JOIN users u ON t.publisher_id = u.id 
     WHERE ${where} ORDER BY t.created_at DESC LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );
  
  res.json({ tasks, total, page, totalPages: Math.ceil(total / limit) });
});

// 获取任务详情
router.get('/tasks/:id', (req, res) => {
  const db = req.app.get('db');
  const task = db.get(
    `SELECT t.*, u.real_name as publisher_name, u.role as publisher_role, u.phone as publisher_phone
     FROM tasks t LEFT JOIN users u ON t.publisher_id = u.id WHERE t.id = ?`, [req.params.id]
  );
  if (!task) return res.status(404).json({ error: '任务不存在' });
  db.run('UPDATE tasks SET view_count = view_count + 1 WHERE id = ?', [req.params.id]);
  db.save();
  res.json(task);
});

// 申请任务
router.post('/tasks/:id/apply', (req, res) => {
  const db = req.app.get('db');
  if (!req.session || !req.session.userId) return res.status(401).json({ error: '未登录' });
  const task = db.get('SELECT * FROM tasks WHERE id = ? AND status = ?', [req.params.id, 'published']);
  if (!task) return res.status(404).json({ error: '任务不存在或已关闭' });
  if (task.publisher_id === req.session.userId) return res.status(400).json({ error: '不能申请自己发布的任务' });
  
  const existing = db.get('SELECT id FROM task_applicants WHERE task_id = ? AND applicant_id = ?', [req.params.id, req.session.userId]);
  if (existing) return res.status(400).json({ error: '已申请过该任务' });
  
  const { proposal, proposed_budget } = req.body;
  db.run('INSERT INTO task_applicants (task_id, applicant_id, proposal, proposed_budget) VALUES (?, ?, ?, ?)',
    [req.params.id, req.session.userId, proposal || '', proposed_budget || 0]);
  db.run('UPDATE tasks SET applicant_count = applicant_count + 1 WHERE id = ?', [req.params.id]);
  
  // 通知发布者
  db.run('INSERT INTO notifications (user_id, type, title, content, related_id) VALUES (?, ?, ?, ?, ?)',
    [task.publisher_id, 'task', '任务有新申请', `有人申请了您的任务"${task.title}"`, req.params.id]);
  
  db.run('INSERT INTO operation_logs (user_id, username, action, target_type, target_id, detail) VALUES (?, ?, ?, ?, ?)',
    [req.session.userId, req.session.username, 'task_apply', 'task', parseInt(req.params.id), '申请任务']);
  db.save();
  
  res.json({ success: true, message: '申请已提交' });
});

// 我的任务列表
router.get('/my/tasks', (req, res) => {
  const db = req.app.get('db');
  if (!req.session || !req.session.userId) return res.status(401).json({ error: '未登录' });
  const tasks = db.query(
    `SELECT t.* FROM tasks t WHERE t.publisher_id = ? ORDER BY t.created_at DESC`,
    [req.session.userId]
  );
  res.json(tasks);
});

// ========== 管理员：审核任务 ==========
router.put('/admin/tasks/:id/review', (req, res) => {
  const db = req.app.get('db');
  if (!req.session || !req.session.userId) return res.status(401).json({ error: '未登录' });
  const user = db.get('SELECT role FROM users WHERE id = ?', [req.session.userId]);
  if (!user || user.role !== 'admin') return res.status(403).json({ error: '无权操作' });
  
  const { action, reason } = req.body; // action: 'approve' | 'reject'
  const task = db.get('SELECT * FROM tasks WHERE id = ?', [req.params.id]);
  if (!task) return res.status(404).json({ error: '任务不存在' });
  
  const newStatus = action === 'approve' ? 'published' : 'rejected';
  db.run('UPDATE tasks SET status = ?, reject_reason = ?, reviewer_id = ?, reviewed_at = datetime("now"), updated_at = datetime("now") WHERE id = ?',
    [newStatus, reason || '', req.session.userId, req.params.id]);
  
  // 通知发布者
  db.run('INSERT INTO notifications (user_id, type, title, content, related_id) VALUES (?, ?, ?, ?, ?)',
    [task.publisher_id, 'task', action === 'approve' ? '任务审核通过' : '任务审核未通过',
     action === 'approve' ? `您的任务"${task.title}"已通过审核并发布` : `您的任务"${task.title}"未通过审核: ${reason || ''}`,
     task.id]);
  
  db.run('INSERT INTO operation_logs (user_id, username, action, target_type, target_id, detail) VALUES (?, ?, ?, ?, ?)',
    [req.session.userId, req.session.username, 'task_review_' + action, 'task', parseInt(req.params.id), reason || '']);
  db.save();
  
  res.json({ success: true });
});

module.exports = router;
