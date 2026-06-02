const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const os = require('os');

// Railway 兼容：使用 /tmp 或系统临时目录
const DATA_DIR = process.env.RAILWAY_VOLUME_MOUNT_PATH || path.join(os.tmpdir(), 'expert-platform-data');
if (!fs.existsSync(DATA_DIR)) {
  try { fs.mkdirSync(DATA_DIR, { recursive: true }); } catch(e) { console.warn('无法创建数据目录，使用内存模式'); }
}
const DB_PATH = path.join(DATA_DIR, 'expert_platform.db');

let db = null;
let SQL = null;
let autoSaveInterval = null;

// 初始化数据库
async function initDB() {
  SQL = await initSqlJs();

  // 从磁盘加载数据库（如果存在）
  if (fs.existsSync(DB_PATH)) {
    const fileBuffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(fileBuffer);
    console.log('[Database loaded from disk:', DB_PATH, ']');
  } else {
    db = new SQL.Database();
    console.log('[Database created in memory]');
  }

  // 创建所有表
  const tables = [
    `CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      real_name TEXT DEFAULT '',
      phone TEXT DEFAULT '',
      email TEXT DEFAULT '',
      role TEXT DEFAULT 'user' CHECK(role IN ('admin','user','expert','company')),
      audit_remark TEXT DEFAULT '',
      id_card_front TEXT DEFAULT '',
      id_card_back TEXT DEFAULT '',
      emergency_contact TEXT DEFAULT '',
      emergency_phone TEXT DEFAULT '',
      status TEXT DEFAULT 'active' CHECK(status IN ('active','disabled','pending_review')),
      login_attempts INTEGER DEFAULT 0,
      locked_until INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    )`,
    `CREATE TABLE IF NOT EXISTS experts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER UNIQUE NOT NULL,
      industry TEXT NOT NULL,
      title TEXT DEFAULT '',
      self_intro TEXT DEFAULT '',
      resume_path TEXT DEFAULT '',
      photo_path TEXT DEFAULT '',
      achievements TEXT DEFAULT '',
      audit_status TEXT DEFAULT 'pending' CHECK(audit_status IN ('pending','approved','rejected','resubmit')),
      audit_remark TEXT DEFAULT '',
      audited_at TEXT,
      audited_by INTEGER,
      verified INTEGER DEFAULT 0,
      avg_rating REAL DEFAULT 0,
      review_count INTEGER DEFAULT 0,
      views INTEGER DEFAULT 0,
      consult_fee INTEGER DEFAULT 0,
      available INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id)
    )`,
    `CREATE TABLE IF NOT EXISTS expert_photos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      expert_id INTEGER NOT NULL,
      photo_path TEXT NOT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS companies (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER UNIQUE NOT NULL,
      company_name TEXT NOT NULL,
      business_license TEXT DEFAULT '',
      business_scope TEXT DEFAULT '',
      contact_person TEXT DEFAULT '',
      contact_phone TEXT DEFAULT '',
      contact_email TEXT DEFAULT '',
      address TEXT DEFAULT '',
      audit_status TEXT DEFAULT 'pending' CHECK(audit_status IN ('pending','approved','rejected','resubmit')),
      audit_remark TEXT DEFAULT '',
      created_at TEXT DEFAULT (datetime('now'))
    )`,
    `CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      publisher_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      description TEXT DEFAULT '',
      category TEXT DEFAULT '',
      budget_min REAL DEFAULT 0,
      budget_max REAL DEFAULT 0,
      deadline TEXT DEFAULT '',
      requirements TEXT DEFAULT '',
      attachments TEXT DEFAULT '',
      status TEXT DEFAULT 'pending_review' CHECK(status IN ('pending_review','published','paused','completed','rejected','cancelled')),
      reject_reason TEXT DEFAULT '',
      reviewer_id INTEGER DEFAULT 0,
      reviewed_at TEXT,
      view_count INTEGER DEFAULT 0,
      applicant_count INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    )`,
    `CREATE TABLE IF NOT EXISTS task_applicants (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      task_id INTEGER NOT NULL,
      applicant_id INTEGER NOT NULL,
      proposal TEXT DEFAULT '',
      proposed_budget REAL DEFAULT 0,
      status TEXT DEFAULT 'pending' CHECK(status IN ('pending','accepted','rejected')),
      created_at TEXT DEFAULT (datetime('now'))
    )`,
    `CREATE TABLE IF NOT EXISTS login_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT,
      ip TEXT,
      success INTEGER,
      created_at TEXT DEFAULT (datetime('now'))
    )`,
    `CREATE TABLE IF NOT EXISTS audit_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      expert_id INTEGER NOT NULL,
      action TEXT NOT NULL,
      remark TEXT DEFAULT '',
      operator_id INTEGER NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    )`,
    `CREATE TABLE IF NOT EXISTS reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      expert_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      rating INTEGER NOT NULL CHECK(rating BETWEEN 1 AND 5),
      content TEXT DEFAULT '',
      reply TEXT DEFAULT '',
      replied_at TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    )`,
    `CREATE TABLE IF NOT EXISTS favorites (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      expert_id INTEGER NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    )`,
    `CREATE TABLE IF NOT EXISTS bookings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      expert_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      booking_date TEXT NOT NULL,
      booking_time TEXT NOT NULL,
      duration INTEGER DEFAULT 60,
      topic TEXT DEFAULT '',
      status TEXT DEFAULT 'pending_payment' CHECK(status IN ('pending_payment','paid','confirmed','completed','cancelled','refunding','refunded')),
      reject_reason TEXT DEFAULT '',
      amount INTEGER DEFAULT 0,
      platform_fee INTEGER DEFAULT 0,
      expert_income INTEGER DEFAULT 0,
      payment_method TEXT DEFAULT 'mock',
      paid_at TEXT,
      refunded_at TEXT,
      refund_reason TEXT DEFAULT '',
      expires_at TEXT,
      booking_id INTEGER,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    )`,
    `CREATE TABLE IF NOT EXISTS payments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      booking_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      amount INTEGER NOT NULL,
      method TEXT DEFAULT 'mock' CHECK(method IN ('wechat','alipay','mock')),
      status TEXT DEFAULT 'pending' CHECK(status IN ('pending','success','failed')),
      transaction_id TEXT DEFAULT '',
      created_at TEXT DEFAULT (datetime('now')),
      paid_at TEXT
    )`,
    `CREATE TABLE IF NOT EXISTS refunds (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      booking_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      amount INTEGER NOT NULL,
      reason TEXT DEFAULT '',
      status TEXT DEFAULT 'pending' CHECK(status IN ('pending','approved','rejected','completed')),
      created_at TEXT DEFAULT (datetime('now')),
      processed_at TEXT
    )`,
    `CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      from_user INTEGER NOT NULL,
      to_user INTEGER NOT NULL,
      content TEXT NOT NULL,
      is_read INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    )`,
    `CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      content TEXT DEFAULT '',
      related_id INTEGER,
      is_read INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    )`,
    `CREATE TABLE IF NOT EXISTS verifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      real_name TEXT NOT NULL,
      id_number TEXT NOT NULL,
      id_photo_front TEXT DEFAULT '',
      id_photo_back TEXT DEFAULT '',
      qualification_photos TEXT DEFAULT '[]',
      status TEXT DEFAULT 'pending' CHECK(status IN ('pending','approved','rejected')),
      remark TEXT DEFAULT '',
      submitted_at TEXT DEFAULT (datetime('now')),
      reviewed_at TEXT,
      reviewer_id INTEGER
    )`,
    `CREATE TABLE IF NOT EXISTS articles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      expert_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      status TEXT DEFAULT 'published' CHECK(status IN ('draft','published')),
      views INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    )`,
    `CREATE TABLE IF NOT EXISTS expert_wallet (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      expert_id INTEGER UNIQUE NOT NULL,
      balance INTEGER DEFAULT 0,
      total_income INTEGER DEFAULT 0,
      total_withdrawn INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    )`,
    `CREATE TABLE IF NOT EXISTS withdrawals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      expert_id INTEGER NOT NULL,
      amount INTEGER NOT NULL,
      status TEXT DEFAULT 'pending' CHECK(status IN ('pending','approved','rejected','completed')),
      account_name TEXT DEFAULT '',
      account_number TEXT DEFAULT '',
      bank_name TEXT DEFAULT '',
      remark TEXT DEFAULT '',
      created_at TEXT DEFAULT (datetime('now')),
      processed_at TEXT
    )`,
    `CREATE TABLE IF NOT EXISTS platform_config (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TEXT DEFAULT (datetime('now'))
    )`,
    `CREATE TABLE IF NOT EXISTS service_packages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      expert_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      description TEXT DEFAULT '',
      price INTEGER NOT NULL,
      duration INTEGER DEFAULT 60,
      is_active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    )`,
    `CREATE TABLE IF NOT EXISTS push_subscriptions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      endpoint TEXT NOT NULL,
      p256dh TEXT NOT NULL,
      auth TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    )`,
    `CREATE TABLE IF NOT EXISTS expert_schedule (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      expert_id INTEGER NOT NULL,
      day_of_week INTEGER NOT NULL CHECK(day_of_week BETWEEN 0 AND 6),
      start_time TEXT NOT NULL,
      end_time TEXT NOT NULL,
      is_available INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now'))
    )`,
    `CREATE TABLE IF NOT EXISTS expert_time_off (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      expert_id INTEGER NOT NULL,
      off_date TEXT NOT NULL,
      reason TEXT DEFAULT '',
      created_at TEXT DEFAULT (datetime('now'))
    )`,
    `CREATE TABLE IF NOT EXISTS expert_booked_slots (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      expert_id INTEGER NOT NULL,
      booking_date TEXT NOT NULL,
      start_time TEXT NOT NULL,
      end_time TEXT NOT NULL,
      booking_id INTEGER,
      created_at TEXT DEFAULT (datetime('now'))
    )`,
    `CREATE TABLE IF NOT EXISTS coupons (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      amount INTEGER DEFAULT 20,
      min_amount INTEGER DEFAULT 0,
      status TEXT DEFAULT 'active',
      created_at TEXT DEFAULT (datetime('now')),
      used_at TEXT
    )`,
    `CREATE TABLE IF NOT EXISTS announcements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    )`,
    `CREATE TABLE IF NOT EXISTS operation_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      username TEXT,
      action TEXT,
      target_type TEXT,
      target_id INTEGER,
      detail TEXT,
      ip TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    )`
  ];

  // 执行所有建表语句
  tables.forEach(sql => {
    try {
      db.run(sql);
    } catch (e) {
      console.error('Table creation error:', e.message);
    }
  });

  // 插入默认配置
  try {
    db.run(`INSERT INTO platform_config (key, value) VALUES ('commission_rate', '0.15')`);
  } catch(e) {}

  // 创建管理员账号
  const admin = get('SELECT id FROM users WHERE role = ?', ['admin']);
  if (!admin) {
    const hash = bcrypt.hashSync('admin2026', 12);
    run('INSERT INTO users (username, password, real_name, role) VALUES (?, ?, ?, ?)',
      ['admin', hash, 'System Admin', 'admin']);
  }

  // 启动自动保存（每 30 秒）
  if (autoSaveInterval) clearInterval(autoSaveInterval);
  autoSaveInterval = setInterval(() => {
    saveToDisk();
  }, 30000);

  console.log('[Database initialized successfully]');
  return db;
}

// 保存数据库到磁盘
function saveToDisk() {
  if (!db) return;
  try {
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(DB_PATH, buffer);
    console.log('[Database auto-saved to', DB_PATH, ']');
  } catch(e) {
    console.error('[Database save failed]', e.message);
  }
}

// 查询多条记录
function query(sql, params = []) {
  try {
    const stmt = db.prepare(sql);
    if (params && params.length > 0) {
      stmt.bind(params);
    }
    const results = [];
    while (stmt.step()) {
      results.push(stmt.getAsObject());
    }
    stmt.free();
    return results;
  } catch(e) {
    console.error('Query error:', e.message);
    return [];
  }
}

// 查询单条记录
function get(sql, params = []) {
  const results = query(sql, params);
  return results.length > 0 ? results[0] : null;
}

// 执行写入操作
function run(sql, params = []) {
  try {
    db.run(sql, params);
    const result = db.exec('SELECT last_insert_rowid() as id');
    return { lastInsertRowid: result[0] ? result[0].values[0][0] : null };
  } catch(e) {
    console.error('Run error:', e.message);
    return { lastInsertRowid: null };
  }
}

// XSS 防护
function sanitize(s) {
  if (typeof s !== 'string') return s;
  return s.replace(/[<>"'&]/g, c =>
    ({ '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;', '&': '&amp;' }[c])
  );
}

function sanitizeObj(o) {
  const r = {};
  for (const k of Object.keys(o)) {
    r[k] = typeof o[k] === 'string' ? sanitize(o[k]) : o[k];
  }
  return r;
}

// 优雅关闭
function shutdown() {
  console.log('\n[Saving database before exit...]');
  saveToDisk();
  if (autoSaveInterval) clearInterval(autoSaveInterval);
  console.log('[Database saved. Bye!]');
  process.exit(0);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
process.on('uncaughtException', (err) => {
  console.error('Uncaught exception:', err);
  saveToDisk();
  process.exit(1);
});

module.exports = { initDB, query, get, run, sanitize, sanitizeObj, saveToDisk };
