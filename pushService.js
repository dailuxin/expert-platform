// pushService.js — Web Push 通知服务
const webpush = require('web-push');
const { query, get, run } = require('./database.js');

// VAPID 密钥（生产环境请存到环境变量）
const VAPID_KEYS = {
  publicKey: 'BIWfqq5l--FWIHdkFdYdAYvKaa5y6z0tJA7lub3ZsWvcecfv9IGj3IbMb7-S7uGP8dEeFgMPU8nOrnQAd9Blmck',
  privateKey: 'z7Tp4xNIeZh_cwAB-HiqnVWNtMnyzJLL1NtFUlyz3Ys'
};

const VAPID_CLAIMS = {
  subject: 'mailto:137817060@qq.com',
  publicKey: VAPID_KEYS.publicKey,
  privateKey: VAPID_KEYS.privateKey
};

webpush.setVapidDetails(
  VAPID_CLAIMS.subject,
  VAPID_CLAIMS.publicKey,
  VAPID_CLAIMS.privateKey
);

// 保存用户的推送订阅
function saveSubscription(userId, subscription) {
  try {
    const { endpoint, keys } = subscription;
    const { p256dh, auth } = keys;
    // 先删除旧的同一 endpoint 订阅，再插入
    run('DELETE FROM push_subscriptions WHERE user_id = ? AND endpoint = ?', [userId, endpoint]);
    run(
      'INSERT INTO push_subscriptions (user_id, endpoint, p256dh, auth) VALUES (?, ?, ?, ?)',
      [userId, endpoint, p256dh, auth]
    );

    return true;
  } catch (e) {
    console.error('保存推送订阅失败:', e.message);
    return false;
  }
}

// 删除用户的推送订阅
function removeSubscription(userId, endpoint) {
  try {
    run('DELETE FROM push_subscriptions WHERE user_id = ? AND endpoint = ?', [userId, endpoint]);

    return true;
  } catch (e) {
    console.error('删除推送订阅失败:', e.message);
    return false;
  }
}

// 获取用户的所有推送订阅
function getSubscriptions(userId) {
  try {
    return query('SELECT * FROM push_subscriptions WHERE user_id = ?', [userId]);
  } catch (e) {
    console.error('获取推送订阅失败:', e.message);
    return [];
  }
}

// 发送推送通知给指定用户
async function sendPushNotification(userId, payload) {
  const subscriptions = getSubscriptions(userId);
  if (!subscriptions || subscriptions.length === 0) return { sent: 0 };

  const results = { sent: 0, failed: 0 };
  for (const sub of subscriptions) {
    const subscription = {
      endpoint: sub.endpoint,
      keys: { p256dh: sub.p256dh, auth: sub.auth }
    };
    try {
      await webpush.sendNotification(subscription, JSON.stringify(payload));
      results.sent++;
    } catch (e) {
      console.error('推送失败:', e.message);
      // 如果订阅已失效（410 Gone），删除它
      if (e.statusCode === 410) {
        removeSubscription(userId, sub.endpoint);
      }
      results.failed++;
    }
  }
  return results;
}

// 发送通知给多个用户
async function sendPushToUsers(userIds, payload) {
  const results = { sent: 0, failed: 0 };
  for (const userId of userIds) {
    const r = await sendPushNotification(userId, payload);
    results.sent += r.sent;
    results.failed += r.failed;
  }
  return results;
}

module.exports = {
  saveSubscription,
  removeSubscription,
  getSubscriptions,
  sendPushNotification,
  sendPushToUsers,
  VAPID_KEYS
};
