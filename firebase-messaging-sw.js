/* firebase-messaging-sw.js - samsung duplicate notification fix v88 */
importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js");

/* =========================
   dev / prod 환경 분기 안정화
========================= */
const swUrl = String(self.location.href || "");
const swHost = String(self.location.hostname || "");

const isDev =
  swHost === "localhost" ||
  swHost === "127.0.0.1" ||
  swHost === "www.sola-home-dev.kr" ||
  swHost === "sola-home-dev.kr" ||
  swUrl.includes("sola-home-dev");

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

function swFlowLog(step, detail) {
  // 운영 기본값: 서비스 워커 흐름 로그 비활성화
  // 필요 시 DevTools 콘솔에서 self.__MYHILLS_SW_DEBUG__ = true 설정 후 확인
  try {
    if (!self.__MYHILLS_SW_DEBUG__) return;

    const info = {
      step,
      detail,
      time: new Date().toISOString(),
      url: String(self.location.href || ""),
      userAgent: String(self.navigator?.userAgent || "")
    };

    self.clients.matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        clientList.forEach((client) => {
          try {
            client.postMessage({ type: "SW_FLOW", info });
          } catch (e) {}
        });
      })
      .catch(() => {});
  } catch (e) {}
}

function swDebugLog(step, detail) {
  swFlowLog(step, detail);
}

swFlowLog("SW_SCRIPT_LOADED", {
  href: String(self.location.href || ""),
  scope: self.registration?.scope || "",
});


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

function isMobileEdgeBrowser() {
  const ua = String(self.navigator?.userAgent || "").toLowerCase();

  const isMobile =
    ua.includes("android") ||
    ua.includes("iphone") ||
    ua.includes("ipad") ||
    ua.includes("mobile");

  const isEdge =
    ua.includes("edga") ||
    ua.includes("edgios") ||
    ua.includes("edg/") ||
    ua.includes("edg");

  return isMobile && isEdge;
}

function isSamsungInternetBrowser() {
  const ua = String(self.navigator?.userAgent || "").toLowerCase();
  return ua.includes("samsungbrowser");
}

function shouldUseFcmPushFallback() {
  // 삼성브라우저는 권한/구독을 초기화하면 onBackgroundMessage가 정상 동작합니다.
  // FCM payload를 fallback push에서도 직접 표시하면 삼성브라우저에서 2회 알림이 발생할 수 있으므로
  // 기존 로직처럼 모바일 Edge 보정만 유지합니다.
  return isMobileEdgeBrowser();
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
  swFlowLog("SHOW_PUSH_NOTIFICATION_ENTER", payload);

  const normalized = normalizePayload(payload);
  swFlowLog("SHOW_PUSH_NOTIFICATION_NORMALIZED", normalized);
  const key = makeNotificationKey(normalized);

  if (isDuplicateNotification(key)) {
    swFlowLog("SHOW_PUSH_NOTIFICATION_DUPLICATE_SKIPPED", normalized);
    return Promise.resolve();
  }

  swFlowLog("BEFORE_SHOW_NOTIFICATION_CALL", normalized);

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
  }).then((result) => {
    swFlowLog("AFTER_SHOW_NOTIFICATION_CALL", normalized);
    return result;
  }).catch((e) => {
    swFlowLog("SHOW_NOTIFICATION_ERROR", String(e && (e.stack || e.message) || e));
    throw e;
  });
}

/* =========================
   Firebase 백그라운드 수신
========================= */
messaging.onBackgroundMessage((payload) => {
  swFlowLog("ON_BACKGROUND_MESSAGE_ENTER", payload);

  return showPushNotification(payload)
    .then(() => {
      swFlowLog("ON_BACKGROUND_MESSAGE_DONE", payload);
    })
    .catch((e) => {
      swFlowLog("ON_BACKGROUND_MESSAGE_ERROR", String(e && (e.stack || e.message) || e));
      throw e;
    });
});

/* =========================
   fallback push 수신
   - FCM payload는 messaging.onBackgroundMessage에서만 처리
   - 비-FCM fallback push만 여기서 처리
   - 앱 닫힘 상태 2회 알림 방지
========================= */
self.addEventListener("push", (event) => {
  swFlowLog("PUSH_EVENT_ENTER", {
    hasData: !!event.data,
    timestamp: Date.now()
  });

  event.waitUntil(
    (async () => {
      if (!event.data) {
        swFlowLog("PUSH_EVENT_NO_DATA", {});
        return;
      }

      let rawText = "";
      let payload = {};

      try {
        rawText = event.data.text();
        swFlowLog("PUSH_EVENT_RAW_TEXT", rawText);
      } catch (e) {
        swFlowLog("PUSH_EVENT_RAW_TEXT_ERROR", String(e && (e.stack || e.message) || e));
      }

      try {
        payload = rawText ? JSON.parse(rawText) : event.data.json();
        swFlowLog("PUSH_EVENT_JSON_PARSED", payload);
      } catch (e) {
        swFlowLog("PUSH_EVENT_JSON_ERROR", String(e && (e.stack || e.message) || e));
        payload = {
          title: "알림",
          body: rawText || "",
          url: "/app"
        };
        swFlowLog("PUSH_EVENT_TEXT_FALLBACK_PAYLOAD", payload);
      }

      const isFcmPayload =
        !!payload?.data ||
        !!payload?.notification ||
        !!payload?.fcmOptions ||
        !!payload?.webpush ||
        String(payload?.from || "").includes("firebase") ||
        String(payload?.collapse_key || "").includes("firebase");

      swFlowLog("PUSH_EVENT_PAYLOAD_CLASSIFIED", {
        isFcmPayload,
        payload
      });

      // FCM payload는 기본적으로 Firebase SDK의 onBackgroundMessage가 처리합니다.
      // 삼성브라우저는 onBackgroundMessage와 push fallback이 모두 실행될 수 있어
      // fallback 직접 표시 대상에서 제외합니다. 모바일 Edge 보정만 유지합니다.
      if (isFcmPayload) {
        const useFallback = shouldUseFcmPushFallback();
        swFlowLog("PUSH_EVENT_FCM_PAYLOAD_SEEN_IN_FALLBACK", {
          isMobileEdge: isMobileEdgeBrowser(),
          isSamsungInternet: isSamsungInternetBrowser(),
          useFallback,
          payload
        });

        if (useFallback) {
          await showPushNotification(payload);
          swFlowLog("PUSH_EVENT_EDGE_COMPAT_FCM_NOTIFICATION_DONE", payload);
        }

        return;
      }

      await showPushNotification(payload);
      swFlowLog("PUSH_EVENT_FALLBACK_NOTIFICATION_DONE", payload);
    })()
  );
});

/* =========================
   알림 클릭 처리
========================= */
self.addEventListener("notificationclick", (event) => {
  swFlowLog("NOTIFICATION_CLICK_ENTER", {
    title: event.notification?.title || "",
    data: event.notification?.data || {}
  });

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
  swFlowLog("SW_INSTALL", {});
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  swFlowLog("SW_ACTIVATE", {});
  event.waitUntil(self.clients.claim());
});

/* UPICK_V88_SAMSUNG_DUPLICATE_NOTIFICATION_FIX_APPLIED */
