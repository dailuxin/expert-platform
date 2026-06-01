// ===== WebSocket 实时通知客户端 =====
let wsClient = null;
let wsReconnectTimer = null;

function connectWebSocket() {
  if (!currentUser || !currentUser.id) return;

  const protocol = location.protocol === 'https:' ? 'wss:' : 'ws:';
  wsClient = new WebSocket(protocol + '//' + location.host);

  wsClient.onopen = () => {
    console.log('[WS Client] Connected');
    wsClient.send(JSON.stringify({ type: 'auth', userId: currentUser.id }));
    if (wsReconnectTimer) { clearTimeout(wsReconnectTimer); wsReconnectTimer = null; }
  };

  wsClient.onmessage = (event) => {
    try {
      const msg = JSON.parse(event.data);
      if (msg.type === 'notification' && msg.data) {
        // 实时更新通知角标
        loadUnreadCount();
        // 显示 toast 提示
        showToast(msg.data.title || '新通知', msg.data.content || '');
      }
      if (msg.type === 'auth_ok') {
        console.log('[WS Client] Authenticated, userId:', msg.userId);
      }
    } catch (e) {}
  };

  wsClient.onclose = () => {
    console.log('[WS Client] Disconnected, reconnecting in 3s...');
    wsReconnectTimer = setTimeout(connectWebSocket, 3000);
  };

  wsClient.onerror = (err) => {
    console.error('[WS Client] Error:', err);
  };
}

// 重写 login 函数，登录后自动连接 WebSocket
const _origLoginWS = window.login;
window.login = function () {
  if (typeof _origLoginWS === 'function') _origLoginWS();
  setTimeout(connectWebSocket, 500);
};

// 页面加载时如果已登录也连接
document.addEventListener('DOMContentLoaded', () => {
  if (currentUser && currentUser.id) {
    setTimeout(connectWebSocket, 1000);
  }
});
