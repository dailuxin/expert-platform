// public/sw.js — Service Worker for Web Push
self.addEventListener('push', event => {
  let payload = { title: '专家平台', body: '您有新的通知', icon: '/icon.png' };
  try {
    payload = event.data.json();
  } catch (e) {}

  const options = {
    body: payload.body || '',
    icon: payload.icon || '/icon.png',
    badge: '/badge.png',
    data: payload.url || '/',
    tag: payload.tag || 'default',
    renotify: true,
    requireInteraction: true,
  };

  event.waitUntil(self.registration.showNotification(payload.title || '专家平台', options));
});

// 点击通知时打开对应页面
self.addEventListener('notificationclick', event => {
  event.notification.close();
  const url = event.notification.data || '/';
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then(clientList => {
      for (const client of clientList) {
        if (client.url === url && 'focus' in client) return client.focus();
      }
      return clients.openWindow(url);
    })
  );
});
