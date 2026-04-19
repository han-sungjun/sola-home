importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

// 🔥 워커 강제 최신화 (중요)
self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

firebase.initializeApp({
  apiKey: 'AIzaSyDhKr7oMSrLowJ47cqB4pvNXuIIdtW0HPI',
  authDomain: 'sola-home-4979a.firebaseapp.com',
  projectId: 'sola-home-4979a',
  storageBucket: 'sola-home-4979a.firebasestorage.app',
  messagingSenderId: '337132471819',
  appId: '1:337132471819:web:848cd357fecda459a2e90e'
});

const messaging = firebase.messaging();

// ✅ 백그라운드 푸시 수신
messaging.onBackgroundMessage((payload) => {
  console.log('[SW] background message:', payload);

  const data = payload?.data || {};
  const title = data.title || payload?.notification?.title || '새 알림';
  const body = data.body || payload?.notification?.body || '';
  const url = data.url || payload?.fcmOptions?.link || '/';

  self.registration.showNotification(title, {
    body,
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
    data: { url }
  });
});

// ✅ 알림 클릭 처리
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const targetUrl = event.notification?.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          return client.focus();
        }
      }
      return clients.openWindow(targetUrl);
    })
  );
});