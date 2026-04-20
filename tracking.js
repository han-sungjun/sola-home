// =========================
// tracking.js
// 운영형 입주민 플랫폼용 통합 추적 모듈
// =========================

import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp,
  query,
  where,
  getDocs,
  orderBy,
  limit,
  Timestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import {
  getAuth,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const db = getFirestore();
const auth = getAuth();


// =========================
// 공통 유틸
// =========================

function getUserInfo() {
  const user = auth.currentUser;
  return {
    uid: user?.uid || null,
    email: user?.email || null
  };
}

function getDeviceInfo() {
  return navigator.userAgent || "unknown";
}

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function safeText(value, fallback = "-") {
  if (value === null || value === undefined || value === "") return fallback;
  return String(value);
}


// =========================
// 방문 이력 저장
// 로그인 사용자만 저장
// =========================

export async function saveVisit(pageName, detail = "") {
  try {
    const { uid, email } = getUserInfo();

    // 로그인 전이면 저장하지 않음
    if (!uid) return;

    await addDoc(collection(db, "visit_history"), {
      uid,
      email,
      page: pageName,
      detail: detail || "",
      path: location.pathname,
      url: location.href,
      referrer: document.referrer || null,
      userAgent: getDeviceInfo(),
      createdAt: serverTimestamp()
    });

  } catch (e) {
    console.log("visit log error", e);
  }
}


// =========================
// 로그인 이력 저장
// =========================

export async function saveLogin({ email, status, reason }) {
  try {
    const user = auth.currentUser;

    await addDoc(collection(db, "login_history"), {
      uid: user?.uid || null,
      email: email || null,
      status,   // success / fail / blocked
      reason: reason || "",
      userAgent: getDeviceInfo(),
      path: location.pathname,
      url: location.href,
      createdAt: serverTimestamp()
    });

  } catch (e) {
    console.log("login log error", e);
  }
}


// =========================
// 로그인 실패 제한
// 브라우저 기준 잠금
// 10분 내 5회 실패 시 10분 잠금
// =========================

const LOGIN_FAIL_KEY = "sola_login_fail_info";
const LOGIN_FAIL_LIMIT = 5;
const LOGIN_FAIL_WINDOW_MIN = 10;
const LOGIN_LOCK_MIN = 10;

function getFailInfo() {
  try {
    const raw = localStorage.getItem(LOGIN_FAIL_KEY);
    if (!raw) {
      return {
        fails: [],
        lockedUntil: null
      };
    }

    const parsed = JSON.parse(raw);
    return {
      fails: Array.isArray(parsed.fails) ? parsed.fails : [],
      lockedUntil: parsed.lockedUntil || null
    };
  } catch {
    return {
      fails: [],
      lockedUntil: null
    };
  }
}

function setFailInfo(data) {
  localStorage.setItem(LOGIN_FAIL_KEY, JSON.stringify(data));
}

function cleanupFailInfo(info) {
  const windowStart = Date.now() - LOGIN_FAIL_WINDOW_MIN * 60 * 1000;
  info.fails = (info.fails || []).filter(ts => ts >= windowStart);

  if (info.lockedUntil && Date.now() > info.lockedUntil) {
    info.lockedUntil = null;
  }

  return info;
}

export function getLoginLockStatus() {
  let info = getFailInfo();
  info = cleanupFailInfo(info);
  setFailInfo(info);

  const now = Date.now();
  const isLocked = !!info.lockedUntil && now < info.lockedUntil;
  const remainMs = isLocked ? info.lockedUntil - now : 0;

  return {
    isLocked,
    remainMs,
    remainSec: Math.ceil(remainMs / 1000),
    remainMin: Math.ceil(remainMs / 60000)
  };
}

export function recordLoginFailureLocal() {
  let info = getFailInfo();
  info = cleanupFailInfo(info);

  info.fails.push(Date.now());

  if (info.fails.length >= LOGIN_FAIL_LIMIT) {
    info.lockedUntil = Date.now() + LOGIN_LOCK_MIN * 60 * 1000;
  }

  setFailInfo(info);
  return getLoginLockStatus();
}

export function clearLoginFailureLocal() {
  setFailInfo({
    fails: [],
    lockedUntil: null
  });
}


// =========================
// 자동 로그아웃 (30분)
// =========================

let lastActivityTime = Date.now();
let warningShown = false;

const AUTO_LOGOUT_TIME = 30 * 60 * 1000;
const WARNING_TIME = 29 * 60 * 1000;

function resetTimer() {
  lastActivityTime = Date.now();
  warningShown = false;
}

["click", "mousemove", "keydown", "scroll", "touchstart"].forEach(event => {
  window.addEventListener(event, resetTimer, { passive: true });
});

setInterval(async () => {
  const now = Date.now();
  const diff = now - lastActivityTime;

  if (diff > WARNING_TIME && !warningShown) {
    warningShown = true;
    alert("1분 후 자동 로그아웃 됩니다.");
  }

  if (diff > AUTO_LOGOUT_TIME) {
    try {
      await signOut(auth);
      alert("장시간 미사용으로 자동 로그아웃되었습니다.");
      location.href = "/index.html";
    } catch (e) {
      console.log("auto logout error", e);
    }
  }
}, 5000);


// =========================
// 관리자 통계 카드 데이터
// 오늘 기준 집계
// =========================

export async function getTodayStats() {
  try {
    const today = startOfToday();

    const visitQuery = query(
      collection(db, "visit_history"),
      where("createdAt", ">=", Timestamp.fromDate(today))
    );

    const loginQuery = query(
      collection(db, "login_history"),
      where("createdAt", ">=", Timestamp.fromDate(today))
    );

    const [visitSnap, loginSnap] = await Promise.all([
      getDocs(visitQuery),
      getDocs(loginQuery)
    ]);

    let successCount = 0;
    let failCount = 0;
    let blockedCount = 0;

    loginSnap.forEach(doc => {
      const d = doc.data();
      if (d.status === "success") successCount++;
      else if (d.status === "fail") failCount++;
      else if (d.status === "blocked") blockedCount++;
    });

    return {
      visitCount: visitSnap.size,
      loginCount: loginSnap.size,
      successCount,
      failCount,
      blockedCount
    };

  } catch (e) {
    console.log("stats error", e);
    return {
      visitCount: 0,
      loginCount: 0,
      successCount: 0,
      failCount: 0,
      blockedCount: 0
    };
  }
}


// =========================
// 방문 경로 분석
// 페이지별 집계
// =========================

export async function getVisitPathStats() {
  try {
    const today = startOfToday();

    const visitQuery = query(
      collection(db, "visit_history"),
      where("createdAt", ">=", Timestamp.fromDate(today))
    );

    const snap = await getDocs(visitQuery);

    const pageMap = {};

    snap.forEach(doc => {
      const d = doc.data();
      const page = safeText(d.page, "unknown");
      pageMap[page] = (pageMap[page] || 0) + 1;
    });

    return Object.entries(pageMap)
      .map(([page, count]) => ({ page, count }))
      .sort((a, b) => b.count - a.count);

  } catch (e) {
    console.log("visit path stats error", e);
    return [];
  }
}


// =========================
// 사용자별 활동 로그
// 오늘 기준 사용자 집계
// =========================

export async function getUserActivityStats() {
  try {
    const today = startOfToday();

    const visitQuery = query(
      collection(db, "visit_history"),
      where("createdAt", ">=", Timestamp.fromDate(today))
    );

    const loginQuery = query(
      collection(db, "login_history"),
      where("createdAt", ">=", Timestamp.fromDate(today))
    );

    const [visitSnap, loginSnap] = await Promise.all([
      getDocs(visitQuery),
      getDocs(loginQuery)
    ]);

    const userMap = {};

    visitSnap.forEach(doc => {
      const d = doc.data();
      const key = d.uid || d.email || "unknown";
      if (!userMap[key]) {
        userMap[key] = {
          uid: d.uid || null,
          email: d.email || "-",
          visitCount: 0,
          loginCount: 0,
          failCount: 0,
          blockedCount: 0
        };
      }
      userMap[key].visitCount += 1;
    });

    loginSnap.forEach(doc => {
      const d = doc.data();
      const key = d.uid || d.email || "unknown";
      if (!userMap[key]) {
        userMap[key] = {
          uid: d.uid || null,
          email: d.email || "-",
          visitCount: 0,
          loginCount: 0,
          failCount: 0,
          blockedCount: 0
        };
      }

      userMap[key].loginCount += 1;

      if (d.status === "fail") userMap[key].failCount += 1;
      if (d.status === "blocked") userMap[key].blockedCount += 1;
    });

    return Object.values(userMap).sort((a, b) => {
      const aTotal = a.visitCount + a.loginCount;
      const bTotal = b.visitCount + b.loginCount;
      return bTotal - aTotal;
    });

  } catch (e) {
    console.log("user activity stats error", e);
    return [];
  }
}


// =========================
// 최근 활동 로그
// 로그인/방문 합쳐서 최근순 반환
// =========================

export async function getRecentActivityLogs(maxItems = 20) {
  try {
    const [visitSnap, loginSnap] = await Promise.all([
      getDocs(
        query(
          collection(db, "visit_history"),
          orderBy("createdAt", "desc"),
          limit(maxItems)
        )
      ),
      getDocs(
        query(
          collection(db, "login_history"),
          orderBy("createdAt", "desc"),
          limit(maxItems)
        )
      )
    ]);

    const visitLogs = [];
    visitSnap.forEach(doc => {
      const d = doc.data();
      visitLogs.push({
        type: "visit",
        email: d.email || "-",
        page: d.page || "-",
        detail: d.detail || "",
        status: "",
        createdAt: d.createdAt?.toDate ? d.createdAt.toDate() : null
      });
    });

    const loginLogs = [];
    loginSnap.forEach(doc => {
      const d = doc.data();
      loginLogs.push({
        type: "login",
        email: d.email || "-",
        page: d.path || "-",
        detail: d.reason || "",
        status: d.status || "",
        createdAt: d.createdAt?.toDate ? d.createdAt.toDate() : null
      });
    });

    return [...visitLogs, ...loginLogs]
      .sort((a, b) => {
        const at = a.createdAt ? a.createdAt.getTime() : 0;
        const bt = b.createdAt ? b.createdAt.getTime() : 0;
        return bt - at;
      })
      .slice(0, maxItems);

  } catch (e) {
    console.log("recent activity logs error", e);
    return [];
  }
}

// 관리자 페이지 import 이름 호환용 별칭
export async function getRecentActivity(maxItems = 20) {
  return await getRecentActivityLogs(maxItems);
}


// =========================
// 관리자 통계 카드 UI 렌더링용 헬퍼
// =========================

export async function renderAdminStatsUI({
  statsContainerId = "adminStatsCards",
  chartContainerId = "visitPathChart",
  userListContainerId = "userActivityList",
  recentListContainerId = "recentActivityList"
} = {}) {
  const statsEl = document.getElementById(statsContainerId);
  const chartEl = document.getElementById(chartContainerId);
  const userListEl = document.getElementById(userListContainerId);
  const recentListEl = document.getElementById(recentListContainerId);

  const [stats, pathStats, userStats, recentLogs] = await Promise.all([
    getTodayStats(),
    getVisitPathStats(),
    getUserActivityStats(),
    getRecentActivityLogs(20)
  ]);

  if (statsEl) {
    statsEl.innerHTML = `
      <div class="summary-row"><strong>오늘 방문</strong><span>${stats.visitCount}건</span></div>
      <div class="summary-row"><strong>오늘 로그인 시도</strong><span>${stats.loginCount}건</span></div>
      <div class="summary-row"><strong>오늘 로그인 성공</strong><span>${stats.successCount}건</span></div>
      <div class="summary-row"><strong>오늘 로그인 실패</strong><span>${stats.failCount}건</span></div>
      <div class="summary-row"><strong>오늘 차단</strong><span>${stats.blockedCount}건</span></div>
    `;
  }

  if (chartEl) {
    const max = Math.max(...pathStats.map(v => v.count), 1);
    chartEl.innerHTML = pathStats.length
      ? pathStats.map(item => `
          <div style="margin-bottom:10px;">
            <div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:4px;">
              <strong>${item.page}</strong>
              <span>${item.count}</span>
            </div>
            <div style="height:10px;background:#eef2f7;border-radius:999px;overflow:hidden;">
              <div style="height:100%;width:${(item.count / max) * 100}%;background:linear-gradient(90deg,#111827,#ef4444);border-radius:999px;"></div>
            </div>
          </div>
        `).join("")
      : `<div class="notice">방문 경로 데이터가 아직 없습니다.</div>`;
  }

  if (userListEl) {
    userListEl.innerHTML = userStats.length
      ? userStats.map(item => `
          <div class="mini-item">
            <div class="mini-item-head">
              <h5>${safeText(item.email)}</h5>
              <span class="tag">방문 ${item.visitCount}</span>
            </div>
            <div class="tags">
              <span class="tag">로그인 ${item.loginCount}</span>
              <span class="tag">실패 ${item.failCount}</span>
              <span class="tag">차단 ${item.blockedCount}</span>
            </div>
          </div>
        `).join("")
      : `<div class="notice">사용자 활동 데이터가 아직 없습니다.</div>`;
  }

  if (recentListEl) {
    recentListEl.innerHTML = recentLogs.length
      ? recentLogs.map(item => `
          <div class="mini-item">
            <div class="mini-item-head">
              <h5>${item.type === "visit" ? "방문" : "로그인"}</h5>
              <span class="tag">${safeText(item.email)}</span>
            </div>
            <div class="helper">
              ${item.type === "visit"
                ? `페이지: ${safeText(item.page)} ${item.detail ? `| 상세: ${safeText(item.detail)}` : ""}`
                : `상태: ${safeText(item.status)} | 사유: ${safeText(item.detail)}`
              }
            </div>
          </div>
        `).join("")
      : `<div class="notice">최근 활동 로그가 아직 없습니다.</div>`;
  }
}