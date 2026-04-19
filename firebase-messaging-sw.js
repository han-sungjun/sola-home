importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: 'AIzaSyDhKr7oMSrLowJ47cqB4pvNXuIIdtW0HPI',
  authDomain: 'sola-home-4979a.firebaseapp.com',
  projectId: 'sola-home-4979a',
  storageBucket: 'sola-home-4979a.firebasestorage.app',
  messagingSenderId: '337132471819',
  appId: '1:337132471819:web:848cd357fecda459a2e90e'
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {

  const title =
    payload?.notification?.title ||
    payload?.data?.title ||
    '새 알림';

  const body =
    payload?.notification?.body ||
    payload?.data?.body ||
    '';

  const targetUrl =
    payload?.data?.click_action ||
    payload?.data?.url ||
    '/';

  const options = {
    body,
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
    data: {
      ...payload?.data,
      click_action: targetUrl
    }
  };

  self.registration.showNotification(title, options);
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const targetUrl =
    event.notification?.data?.click_action ||
    event.notification?.data?.url ||
    '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) {
          client.navigate(targetUrl);
          return client.focus();
        }
      }
      return clients.openWindow(targetUrl);
    })
  );
});