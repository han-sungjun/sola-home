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
   딥링크 URL 생성
   - 근처/혜택 알림: /app?open=benefit&id={benefitId}
   - 공지 알림: /app?open=notice&id={noticeId}
========================= */
function buildTargetUrl({ url = "", type = "", noticeId = "", benefitId = "" } = {}) {
  const rawUrl = String(url || "").trim();
  const cleanType = String(type || "").trim().toLowerCase();
  const cleanNoticeId = String(noticeId || "").trim();
  const cleanBenefitId = String(benefitId || "").trim();

  if (cleanBenefitId && (!rawUrl || rawUrl === "/" || rawUrl === "/app")) {
    return `/app?open=benefit&id=${encodeURIComponent(cleanBenefitId)}&from=push`;
  }

  if (cleanNoticeId && (!rawUrl || rawUrl === "/" || rawUrl === "/app")) {
    return `/app?open=notice&id=${encodeURIComponent(cleanNoticeId)}&from=push`;
  }

  if (cleanType === "benefit" && cleanBenefitId && !rawUrl.includes("open=benefit")) {
    return `/app?open=benefit&id=${encodeURIComponent(cleanBenefitId)}&from=push`;
  }

  return rawUrl || "/app";
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
  const benefitId =
    data.benefitId ||
    data.benefitID ||
    data.benefitsId ||
    ((data.type === "benefit" || data.type === "proximity") ? data.id : "") ||
    "";
  const type = data.type || (benefitId ? "benefit" : "notice");

  const normalizedUrl = buildTargetUrl({
    url,
    type,
    noticeId,
    benefitId
  });

  return {
    title: String(title || "알림"),
    body: String(body || ""),
    url: String(normalizedUrl || "/app"),
    noticeId: String(noticeId || ""),
    benefitId: String(benefitId || ""),
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
      benefitId: normalized.benefitId,
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
   fallback push 수신
   - PC/모바일 모두 data-only push 보강
   - onBackgroundMessage가 놓치는 케이스를 보완
   - showPushNotification 내부에서 중복 방지 처리
========================= */
self.addEventListener("push", (event) => {
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
          url: "/app"
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
  const noticeId = data.noticeId || "";
  const benefitId = data.benefitId || "";
  const type = data.type || (benefitId ? "benefit" : "");

  const targetPath = buildTargetUrl({
    url: data.url || "",
    type,
    noticeId,
    benefitId
  });

  const targetUrl = new URL(targetPath || "/app", self.location.origin).href;

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true })
      .then(async (clientList) => {
        for (const client of clientList) {
          if (client.url.includes(self.location.origin)) {
            client.postMessage({
              type: "OPEN_PUSH_URL",
              pushType: type,
              noticeId,
              benefitId,
              url: targetUrl
            });

            if ("navigate" in client) {
              await client.navigate(targetUrl);
            }

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