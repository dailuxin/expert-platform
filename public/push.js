// public/push.js — 前端 Web Push 订阅逻辑
const PUBLIC_VAPID_KEY = 'BIWfqq5l--FWIHdkFdYdAYvKaa5y6z0tJA7lub3ZsWvcecfv9IGj3IbMb7-S7uGP8dEeFgMPU8nOrnQAd9Blmck';

// URL-safe Base64 解码（VAPID 密钥用）
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) outputArray[i] = rawData.charCodeAt(i);
  return outputArray;
}

// 注册 Service Worker
async function registerServiceWorker() {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.log('此浏览器不支持 Web Push');
    return null;
  }
  try {
    const registration = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
    console.log('✅ SW 注册成功');
    return registration;
  } catch (e) {
    console.error('❌ SW 注册失败:', e);
    return null;
  }
}

// 请求通知权限并订阅
async function subscribeToPush(registration) {
  if (!registration) return;
  if (Notification.permission === 'denied') {
    console.log('通知权限已被拒绝');
    return;
  }
  if (Notification.permission === 'default') {
    await Notification.requestPermission();
  }
  if (Notification.permission !== 'granted') return;

  try {
    let subscription = await registration.pushManager.getSubscription();
    if (!subscription) {
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(PUBLIC_VAPID_KEY)
      });
    }
    // 发送到后端保存
    const userId = window.currentUserId || (window.USER && window.USER.id);
    if (userId) {
      await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscription })
      });
      console.log('✅ 推送订阅已保存');
    }
  } catch (e) {
    console.error('❌ 推送订阅失败:', e);
  }
}

// 取消订阅
async function unsubscribeFromPush(registration) {
  try {
    const subscription = await registration.pushManager.getSubscription();
    if (subscription) {
      await subscription.unsubscribe();
      // 通知后端删除
      await fetch('/api/push/unsubscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ endpoint: subscription.endpoint })
      });
      console.log('✅ 推送已取消订阅');
    }
  } catch (e) {
    console.error('❌ 取消订阅失败:', e);
  }
}

// 初始化（登录后调用）
async function initPush() {
  const registration = await registerServiceWorker();
  if (registration) await subscribeToPush(registration);
}

// 如果已登录，自动初始化
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    // 延迟初始化，等用户信息加载完成
    setTimeout(() => {
      if (window.USER && window.USER.id) initPush();
    }, 2000);
  });
} else {
  setTimeout(() => {
    if (window.USER && window.USER.id) initPush();
  }, 2000);
}

// 导出供其他脚本使用
window.PushService = { initPush, unsubscribeFromPush };
