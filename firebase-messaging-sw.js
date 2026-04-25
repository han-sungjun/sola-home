importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js");

/* =========================
   dev / prod 환경 분기 안정화
========================= */
const swUrl = String(self.location.href || "");
const swHost = String(self.location.hostname || "");

const isDev =
  swUrl.includes("sola-home-dev") ||
  swHost.includes("sola-home-dev") ||
  swHost.includes("dev");

const firebaseConfig = isDev
  ? {
      apiKey: "AIzaSyCC4ZilL1Gv_zy0_iw36b0CO4Uq7vYX6rE",
      authDomain: "sola-home-dev.firebaseapp.com",
      projectId: "sola-home-dev",
      storageBucket: "sola-home-dev.firebasestorage.app",
      messagingSenderId: "292137041544",
      appId: "1:292137041544:web:c648f4380b1562a31e693d",
      measurementId: "G-R7TZ1PG6QP"
    }
  : {
      apiKey: "AIzaSyDhKr7oMSrLowJ47cqB4pvNXuIIdtW0HPI",
      authDomain: "sola-home-4979a.firebaseapp.com",
      projectId: "sola-home-4979a",
      storageBucket: "sola-home-4979a.firebasestorage.app",
      messagingSenderId: "337132471819",
      appId: "1:337132471819:web:848cd357fecda459a2e90e",
      measurementId: "G-E7R9JJGGJE"
    };

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

/* =========================
   모바일 판별
   - fallback push는 모바일에서만 실행
   - PC Chrome 중복 알림 방지
========================= */
function isMobileBrowser() {
  const ua = String(self.navigator?.userAgent || "").toLowerCase();

  return (
    ua.includes("android") ||
    ua.includes("iphone") ||
    ua.includes("ipad") ||
    ua.includes("mobile") ||
    ua.includes("samsungbrowser")
  );
}

/* =========================
   중복 알림 방지용
========================= */
const recentNotificationKeys = new Map();

function makeNotificationKey({ title, body, url, noticeId, type }) {
  return [
    String(type || ""),
    String(noticeId || ""),
    String(title || ""),
    String(body || ""),
    String(url || "")
  ].join("|");
}

function isDuplicateNotification(key) {
  const now = Date.now();
  const last = recentNotificationKeys.get(key);

  recentNotificationKeys.set(key, now);

  for (const [k, t] of recentNotificationKeys.entries()) {
    if (now - t > 10000) {
      recentNotificationKeys.delete(k);
    }
  }

  return !!(last && now - last < 4000);
}

/* =========================
   payload 정규화
========================= */
function normalizePayload(payload) {
  const data = payload?.data || payload || {};

  const title =
    data.title ||
    payload?.notification?.title ||
    "알림";

  const body =
    data.body ||
    payload?.notification?.body ||
    "";

  const url =
    data.url ||
    data.clickUrl ||
    data.link ||
    payload?.fcmOptions?.link ||
    payload?.webpush?.fcmOptions?.link ||
    "/";

  const noticeId = data.noticeId || "";
  const type = data.type || "notice";

  return {
    title: String(title || "알림"),
    body: String(body || ""),
    url: String(url || "/"),
    noticeId: String(noticeId || ""),
    type: String(type || "notice")
  };
}

/* =========================
   알림 표시 공통 함수
========================= */
function showPushNotification(payload) {
  const normalized = normalizePayload(payload);
  const key = makeNotificationKey(normalized);

  if (isDuplicateNotification(key)) return Promise.resolve();

  return self.registration.showNotification(normalized.title, {
    body: normalized.body,
    icon: "/icons/push-icon.png",
    badge: "/icons/badge-icon.png",
    vibrate: [200, 100, 200],

    // PC 중복 알림 덮어쓰기용
    tag: key,
    renotify: false,

    data: {
      url: normalized.url,
      noticeId: normalized.noticeId,
      type: normalized.type
    }
  });
}

/* =========================
   Firebase 백그라운드 수신
========================= */
messaging.onBackgroundMessage((payload) => {
  return showPushNotification(payload);
});

/* =========================
   모바일 fallback push 수신
   - 모바일 data-only push 보강
   - PC에서는 실행하지 않음
========================= */
self.addEventListener("push", (event) => {
  if (!isMobileBrowser()) return;
  if (!event.data) return;

  event.waitUntil(
    (async () => {
      let payload = {};

      try {
        payload = event.data.json();
      } catch (e) {
        payload = {
          title: "알림",
          body: event.data.text() || "",
          url: "/"
        };
      }

      await showPushNotification(payload);
    })()
  );
});

/* =========================
   알림 클릭 처리
========================= */
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const data = event.notification?.data || {};
  let targetUrl = data.url || "/";
  if (data.noticeId) {
    if (!targetUrl.includes("?")) {
      targetUrl += `?noticeId=${data.noticeId}`;
    }
  }
  const noticeId = data.noticeId || "";
  const type = data.type || "";

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true })
      .then(async (clientList) => {
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && "focus" in client) {
            client.postMessage({
              type: "OPEN_PUSH",
              pushType: type,
              noticeId,
              url: targetUrl
            });

            return client.focus();
          }
        }

        return clients.openWindow(targetUrl);
      })
  );
});

/* =========================
   SW 최신화
========================= */
self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});