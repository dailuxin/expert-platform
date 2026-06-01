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

async function initDB() {
  const SQL = await initSqlJs();
  if (fs.existsSync(DB_PATH)) {
    db = new SQL.Database(fs.readFileSync(DB_PATH));
  } else {
    db = new SQL.Database();
  }

  // Users table
  db.run(`CREATE TABLE IF NOT EXISTS users (
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
  )`);

  // Experts table
  db.run(`CREATE TABLE IF NOT EXISTS experts (
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
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS expert_photos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    expert_id INTEGER NOT NULL,
    photo_path TEXT NOT NULL,
    FOREIGN KEY (expert_id) REFERENCES experts(id) ON DELETE CASCADE
  )`);

  // Companies table
  db.run(`CREATE TABLE IF NOT EXISTS companies (
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
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id)
  )`);

  // Tasks (任务发布) table
  db.run(`CREATE TABLE IF NOT EXISTS tasks (
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
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (publisher_id) REFERENCES users(id)
  )`);

  // Task applicants
  db.run(`CREATE TABLE IF NOT EXISTS task_applicants (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    task_id INTEGER NOT NULL,
    applicant_id INTEGER NOT NULL,
    proposal TEXT DEFAULT '',
    proposed_budget REAL DEFAULT 0,
    status TEXT DEFAULT 'pending' CHECK(status IN ('pending','accepted','rejected')),
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (task_id) REFERENCES tasks(id),
    FOREIGN KEY (applicant_id) REFERENCES users(id)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS login_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT,
    ip TEXT,
    success INTEGER,
    created_at TEXT DEFAULT (datetime('now'))
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS audit_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    expert_id INTEGER NOT NULL,
    action TEXT NOT NULL,
    remark TEXT DEFAULT '',
    operator_id INTEGER NOT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (expert_id) REFERENCES experts(id),
    FOREIGN KEY (operator_id) REFERENCES users(id)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    expert_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    rating INTEGER NOT NULL CHECK(rating BETWEEN 1 AND 5),
    content TEXT DEFAULT '',
    reply TEXT DEFAULT '',
    replied_at TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (expert_id) REFERENCES experts(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id),
    UNIQUE(expert_id, user_id)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS favorites (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    expert_id INTEGER NOT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    UNIQUE(user_id, expert_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (expert_id) REFERENCES experts(id) ON DELETE CASCADE
  )`);

  // Bookings table - expanded with payment fields
  db.run(`CREATE TABLE IF NOT EXISTS bookings (
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
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (expert_id) REFERENCES experts(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS payments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    booking_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    amount INTEGER NOT NULL,
    method TEXT DEFAULT 'mock' CHECK(method IN ('wechat','alipay','mock')),
    status TEXT DEFAULT 'pending' CHECK(status IN ('pending','success','failed')),
    transaction_id TEXT DEFAULT '',
    created_at TEXT DEFAULT (datetime('now')),
    paid_at TEXT,
    FOREIGN KEY (booking_id) REFERENCES bookings(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS refunds (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    booking_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    amount INTEGER NOT NULL,
    reason TEXT DEFAULT '',
    status TEXT DEFAULT 'pending' CHECK(status IN ('pending','approved','rejected','completed')),
    created_at TEXT DEFAULT (datetime('now')),
    processed_at TEXT,
    FOREIGN KEY (booking_id) REFERENCES bookings(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    from_user INTEGER NOT NULL,
    to_user INTEGER NOT NULL,
    content TEXT NOT NULL,
    is_read INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (from_user) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (to_user) REFERENCES users(id) ON DELETE CASCADE
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    content TEXT DEFAULT '',
    related_id INTEGER,
    is_read INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS verifications (
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
    reviewer_id INTEGER,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS articles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    expert_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    status TEXT DEFAULT 'published' CHECK(status IN ('draft','published')),
    views INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (expert_id) REFERENCES experts(id) ON DELETE CASCADE
  )`);

  // Expert wallet table
  db.run(`CREATE TABLE IF NOT EXISTS expert_wallet (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    expert_id INTEGER UNIQUE NOT NULL,
    balance INTEGER DEFAULT 0,
    total_income INTEGER DEFAULT 0,
    total_withdrawn INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (expert_id) REFERENCES experts(id) ON DELETE CASCADE
  )`);

  // Withdrawal requests table
  db.run(`CREATE TABLE IF NOT EXISTS withdrawals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    expert_id INTEGER NOT NULL,
    amount INTEGER NOT NULL,
    status TEXT DEFAULT 'pending' CHECK(status IN ('pending','approved','rejected','completed')),
    account_name TEXT DEFAULT '',
    account_number TEXT DEFAULT '',
    bank_name TEXT DEFAULT '',
    remark TEXT DEFAULT '',
    created_at TEXT DEFAULT (datetime('now')),
    processed_at TEXT,
    FOREIGN KEY (expert_id) REFERENCES experts(id) ON DELETE CASCADE
  )`);

  // Platform config table (commission rate etc.)
  db.run(`CREATE TABLE IF NOT EXISTS platform_config (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TEXT DEFAULT (datetime('now'))
  )`);
  // Insert default commission rate (15%)
  try { db.run(`INSERT INTO platform_config (key, value) VALUES ('commission_rate', '0.15')`); } catch(e) {}


  // Service packages table
  db.run(`CREATE TABLE IF NOT EXISTS service_packages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    expert_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    description TEXT DEFAULT '',
    price INTEGER NOT NULL,
    duration INTEGER DEFAULT 60,
    is_active INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (expert_id) REFERENCES experts(id) ON DELETE CASCADE
  )`);

  // Push subscriptions table (for Web Push notifications)
  db.run(`CREATE TABLE IF NOT EXISTS push_subscriptions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    endpoint TEXT NOT NULL,
    p256dh TEXT NOT NULL,
    auth TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    UNIQUE(user_id, endpoint),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  )`);

  // Expert weekly schedule table (recurring availability)
  db.run(`CREATE TABLE IF NOT EXISTS expert_schedule (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    expert_id INTEGER NOT NULL,
    day_of_week INTEGER NOT NULL CHECK(day_of_week BETWEEN 0 AND 6),
    start_time TEXT NOT NULL,
    end_time TEXT NOT NULL,
    is_available INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now')),
    UNIQUE(expert_id, day_of_week, start_time),
    FOREIGN KEY (expert_id) REFERENCES experts(id) ON DELETE CASCADE
  )`);

  // Expert time off / unavailable dates table
  db.run(`CREATE TABLE IF NOT EXISTS expert_time_off (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    expert_id INTEGER NOT NULL,
    off_date TEXT NOT NULL,
    reason TEXT DEFAULT '',
    created_at TEXT DEFAULT (datetime('now')),
    UNIQUE(expert_id, off_date),
    FOREIGN KEY (expert_id) REFERENCES experts(id) ON DELETE CASCADE
  )`);

  // Booking slots cache (for quick availability lookup)
  // Each slot = one bookable 30-min or 60-min slot
  db.run(`CREATE TABLE IF NOT EXISTS expert_booked_slots (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    expert_id INTEGER NOT NULL,
    booking_date TEXT NOT NULL,
    start_time TEXT NOT NULL,
    end_time TEXT NOT NULL,
    booking_id INTEGER,
    created_at TEXT DEFAULT (datetime('now')),
    UNIQUE(expert_id, booking_date, start_time),
    FOREIGN KEY (expert_id) REFERENCES experts(id) ON DELETE CASCADE,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE
  )`);
run('CREATE TABLE IF NOT EXISTS coupons (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL, amount INTEGER DEFAULT 20, min_amount INTEGER DEFAULT 0, status TEXT DEFAULT \'active\', created_at TEXT DEFAULT (datetime(\'now\')), used_at TEXT)');

  // P2: 公告表
  run('CREATE TABLE IF NOT EXISTS announcements (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL, content TEXT NOT NULL, created_at TEXT DEFAULT (datetime(\'now\')))');

  // P2: 操作日志表
  run('CREATE TABLE IF NOT EXISTS operation_logs (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER, username TEXT, action TEXT, target_type TEXT, target_id INTEGER, detail TEXT, ip TEXT, created_at TEXT DEFAULT (datetime(\'now\')))');


  // Add expires_at to bookings for auto-cancel (P0 #3)
  try { db.run(`ALTER TABLE bookings ADD COLUMN expires_at TEXT`); } catch(e) {}

  // Add booking_id to reviews for order-linked reviews (P0 #2)
  try { db.run(`ALTER TABLE reviews ADD COLUMN booking_id INTEGER`); } catch(e) {}

  // Run migrations for existing databases
  const migrations = [
    'ALTER TABLE experts ADD COLUMN verified INTEGER DEFAULT 0',
    'ALTER TABLE experts ADD COLUMN avg_rating REAL DEFAULT 0',
    'ALTER TABLE experts ADD COLUMN review_count INTEGER DEFAULT 0',
    'ALTER TABLE experts ADD COLUMN consult_fee INTEGER DEFAULT 0',
    'ALTER TABLE experts ADD COLUMN available INTEGER DEFAULT 1',
  ];
  for (const sql of migrations) {
    try { db.run(sql); } catch (e) {}
  }

  // Bookings migration: add platform_fee / expert_income
  const bookingMigrations = [
    'ALTER TABLE bookings ADD COLUMN platform_fee INTEGER DEFAULT 0',
    'ALTER TABLE bookings ADD COLUMN expert_income INTEGER DEFAULT 0',
  ];
  for (const sql of bookingMigrations) {
    try { db.run(sql); } catch (e) {}
  }

  // Add new columns to bookings if they don't exist
  const bookingCols = [
    "ALTER TABLE bookings ADD COLUMN amount INTEGER DEFAULT 0",
    "ALTER TABLE bookings ADD COLUMN payment_method TEXT DEFAULT 'mock'",
    "ALTER TABLE bookings ADD COLUMN paid_at TEXT",
    "ALTER TABLE bookings ADD COLUMN refunded_at TEXT",
    "ALTER TABLE bookings ADD COLUMN refund_reason TEXT",
  ];
  for (const sql of bookingCols) {
    try { db.run(sql); } catch (e) {}
  }

  // Create admin if not exists
  const admin = get('SELECT id FROM users WHERE role = ?', ['admin']);
  if (!admin) {
    const hash = bcrypt.hashSync('admin2026', 12);
    run('INSERT INTO users (username, password, real_name, role) VALUES (?, ?, ?, ?)',
      ['admin', hash, 'System Admin', 'admin']);
  }

  // Add email column if not exists (for existing databases)
  try {
    db.run(`ALTER TABLE users ADD COLUMN email TEXT DEFAULT ''`);
  } catch (e) {
    // ignore if column already exists
  }

  save();
  return db;
}

function save() {
  if (!db) return;
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(DB_PATH, Buffer.from(db.export()));
}

// Auto-save: call after every write
function autoSave() {
  save();
}

// Graceful shutdown
function shutdown() {
  console.log('\n[Saving database before exit...]');
  save();
  console.log('[Database saved. Bye!]');
  process.exit(0);
}
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
process.on('uncaughtException', (err) => {
  console.error('Uncaught exception:', err);
  save();
  process.exit(1);
});

function query(sql, params = []) {
  const stmt = db.prepare(sql);
  stmt.bind(params);
  const rows = [];
  while (stmt.step()) rows.push(stmt.getAsObject());
  stmt.free();
  return rows;
}

function get(sql, params = []) {
  const rows = query(sql, params);
  return rows.length ? rows[0] : undefined;
}

function run(sql, params = []) {
  db.run(sql, params);
  const r = get('SELECT last_insert_rowid() as id');
  autoSave();
  return { lastInsertRowId: r ? r.id : 0 };
}

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

module.exports = { initDB, query, get, run, save, sanitize, sanitizeObj };
