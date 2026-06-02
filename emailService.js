// emailService.js — 邮件通知服务（含简单封装函数）
const nodemailer = require('nodemailer');
const { query, get, run } = require('./database.js');

const SMTP_CONFIG = {
  host: 'smtp.qq.com',
  port: 465,
  secure: true,
  auth: { user: '137817060@qq.com', pass: '910511' }
};

let transporter = null;
function getTransporter() {
  if (!transporter) transporter = nodemailer.createTransporter(SMTP_CONFIG);
  return transporter;
}

async function sendEmail(to, subject, html) {
  try {
    const info = await getTransporter().sendMail({
      from: '"专家平台" <137817060@qq.com>',
      to, subject, html
    });
    console.log('✉️ 邮件发送成功:', info.messageId, 'to:', to);
    return true;
  } catch (e) {
    console.error('❌ 邮件发送失败:', e.message, 'to:', to);
    return false;
  }
}

// ==================== 邮件模板 ====================

function escHtml(s) {
  return s ? String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;') : '';
}

function renderBookingConfirm(expertName, serviceName, bookingTime, amount) {
  return '<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px;">'
    + '<h2 style="color:#4f46e5;">预约状态更新</h2>'
    + '<p>您的预约状态已更新，详情如下：</p>'
    + '<div style="background:#f5f5f5;padding:16px;border-radius:8px;margin:16px 0;">'
    + '<div>专家：<strong>' + escHtml(expertName) + '</strong></div>'
    + '<div>服务：' + escHtml(serviceName || '专家咨询') + '</div>'
    + '<div>时间：' + escHtml(bookingTime || '待定') + '</div>'
    + '<div>费用：<strong style="color:#e53e3e;">¥' + (amount || '0') + '</strong></div>'
    + '</div>'
    + '<p style="color:#718096;font-size:12px;">专家平台自动发送，请勿回复</p>'
    + '</div>';
}

function renderAuditResult(expertName, status, reason) {
  var statusText = status === 'approved' ? '已通过' : '未通过';
  var color = status === 'approved' ? '#38a169' : '#e53e3e';
  return '<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px;">'
    + '<h2 style="color:' + color + ';">专家资料审核' + statusText + '</h2>'
    + '<p>您好 <strong>' + escHtml(expertName) + '</strong>，</p>'
    + '<p>您的专家资料审核' + statusText + '。</p>'
    + (reason ? '<div style="background:#f5f5f5;padding:16px;border-radius:8px;margin:16px 0;"><div>原因：' + escHtml(reason) + '</div></div>' : '')
    + (status === 'approved' ? '<p>您现在可以登录平台，开始接收预约。</p>' : '')
    + '<p style="color:#718096;font-size:12px;">专家平台自动发送，请勿回复</p>'
    + '</div>';
}

function renderRefundNotice(amount, reason) {
  return '<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px;">'
    + '<h2 style="color:#4f46e5;">退款通知</h2>'
    + '<p>您的退款申请已审批通过，款项将尽快退回您的原支付账户。</p>'
    + '<div style="background:#f5f5f5;padding:16px;border-radius:8px;margin:16px 0;">'
    + '<div>退款金额：<strong style="color:#e53e3e;">¥' + (amount || '0') + '</strong></div>'
    + '<div>原因：' + escHtml(reason || '无') + '</div>'
    + '</div>'
    + '<p style="color:#718096;font-size:12px;">专家平台自动发送，请勿回复</p>'
    + '</div>';
}

function renderWithdrawSuccess(expertName, amount) {
  return '<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px;">'
    + '<h2 style="color:#38a169;">提现已处理</h2>'
    + '<p>您好 <strong>' + escHtml(expertName) + '</strong>，</p>'
    + '<p>您的提现申请已处理，款项将很快到达您的账户。</p>'
    + '<div style="background:#f5f5f5;padding:16px;border-radius:8px;margin:16px 0;">'
    + '<div>提现金额：<strong style="color:#38a169;">¥' + (amount || '0') + '</strong></div>'
    + '</div>'
    + '<p style="color:#718096;font-size:12px;">专家平台自动发送，请勿回复</p>'
    + '</div>';
}

// ==================== 简单封装函数（供 app.js 调用）====================
// 这些函数自行查库，调用方只需传 ID

async function notifyBookingUpdate(bookingId, status) {
  try {
    var r = get('SELECT b.*, e.title AS expert_name, u.email FROM bookings b JOIN experts e ON b.expert_id = e.id JOIN users u ON b.user_id = u.id WHERE b.id = ?', [bookingId]);
    if (!r || !r.email) return;
    var html = renderBookingConfirm(r.expert_name || '', r.service_name || '', r.booking_time || '', r.amount || '0');
    await sendEmail(r.email, '预约状态更新 - 专家平台', html);
  } catch (e) { console.error('notifyBookingUpdate 失败:', e.message); }
}

async function notifyAuditResult(userId, auditStatus, rejectReason) {
  try {
    var r = get('SELECT email, username FROM users WHERE id = ?', [userId]);
    if (!r || !r.email) return;
    var html = renderAuditResult(r.username || '', auditStatus, rejectReason || '');
    await sendEmail(r.email, '专家资料审核结果 - 专家平台', html);
  } catch (e) { console.error('notifyAuditResult 失败:', e.message); }
}

async function notifyRefund(refundId) {
  try {
    var r = get('SELECT r.*, u.email FROM refunds r JOIN users u ON r.user_id = u.id WHERE r.id = ?', [refundId]);
    if (!r || !r.email) return;
    var html = renderRefundNotice(r.amount || '0', r.reason || '');
    await sendEmail(r.email, '退款通知 - 专家平台', html);
  } catch (e) { console.error('notifyRefund 失败:', e.message); }
}

async function notifyWithdrawal(withdrawalId) {
  try {
    var r = get('SELECT w.*, u.email, u.username FROM withdrawals w JOIN experts e ON w.expert_id = e.id JOIN users u ON e.user_id = u.id WHERE w.id = ?', [withdrawalId]);
    if (!r || !r.email) return;
    var html = renderWithdrawSuccess(r.username || '', r.amount || '0');
    await sendEmail(r.email, '提现处理通知 - 专家平台', html);
  } catch (e) { console.error('notifyWithdrawal 失败:', e.message); }
}

module.exports = {
  sendEmail,
  renderBookingConfirm,
  renderAuditResult,
  renderRefundNotice,
  renderWithdrawSuccess,
  notifyBookingUpdate,
  notifyAuditResult,
  notifyRefund,
  notifyWithdrawal
};
