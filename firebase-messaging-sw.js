// firebase-messaging-sw.js

importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "YOUR_API_KEY",
  authDomain: "sola-home-4979a.firebaseapp.com",
  projectId: "sola-home-4979a",
  messagingSenderId: "337132471819",
  appId: "1:337132471819:web:848cd357fecda459a2e90e"
});

const messaging = firebase.messaging();

// 백그라운드 푸시 수신
messaging.onBackgroundMessage(function(payload) {
  console.log('[SW] Background message ', payload);

  const title = payload.notification?.title || '공지 알림';
  const options = {
    body: payload.notification?.body || '',
    icon: '/icons/icon-192.png',
    data: payload.data || {}
  };

  self.registration.showNotification(title, options);
});

// 클릭 시 앱 열기
self.addEventListener('notificationclick', function(event) {
  event.notification.close();

  event.waitUntil(
    clients.openWindow('/')
  );
});