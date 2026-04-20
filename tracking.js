// =========================
// tracking.js
// 운영형 입주민 플랫폼용 통합 추적 모듈
// 로그인 성공 후에만 30분 타이머 시작
// =========================

import {
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
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import { db, auth } from "./firebase-config.js";


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
// saveActivity
// =========================

export async function saveActivity(pageName, detail = "") {
  try {
    const { uid } = getUserInfo();
    if (!uid) return;

    await addDoc(collection(db, "activity_logs"), {
      uid,
      page: pageName,
      detail,
      createdAt: serverTimestamp()
    });

  } catch (e) {
    console.log("activity log error", e);
  }
}


// =========================
// 방문 이력 저장
// =========================

export async function saveVisit(pageName, detail = "") {
  try {
    const { uid, email } = getUserInfo();
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
      status,
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
// 자동 로그아웃 (로그인 후에만 시작)
// =========================

const AUTO_LOGOUT_TIME = 30 * 60 * 1000;
const WARNING_TIME = 29 * 60 * 1000;

let lastActivityTime = Date.now();
let warningShown = false;
let autoLogoutInterval = null;
let authWatchInitialized = false;

function resetTimer() {
  if (!auth.currentUser) return;
  lastActivityTime = Date.now();
  warningShown = false;
  syncIdleTimerStateFromAutoLogout();
}

function bindAutoLogoutActivityEventsOnce() {
  if (window.__solaAutoLogoutEventsBound) return;
  window.__solaAutoLogoutEventsBound = true;

  ["click", "mousemove", "keydown", "scroll", "touchstart"].forEach(event => {
    window.addEventListener(event, resetTimer, { passive: true });
  });
}

function stopAutoLogoutTimer() {
  if (autoLogoutInterval) {
    clearInterval(autoLogoutInterval);
    autoLogoutInterval = null;
  }
  warningShown = false;
}

function startAutoLogoutTimer() {
  if (!auth.currentUser) return;
  if (autoLogoutInterval) return;

  lastActivityTime = Date.now();
  warningShown = false;
  syncIdleTimerStateFromAutoLogout();

  autoLogoutInterval = setInterval(async () => {
    if (!auth.currentUser) {
      stopAutoLogoutTimer();
      return;
    }

    const now = Date.now();
    const diff = now - lastActivityTime;

    if (diff > WARNING_TIME && !warningShown) {
      warningShown = true;
      alert("1분 후 자동 로그아웃 됩니다.");
    }

    if (diff > AUTO_LOGOUT_TIME) {
      try {
        stopAutoLogoutTimer();
        await signOut(auth);
        alert("장시간 미사용으로 자동 로그아웃되었습니다.");
        location.href = "/index.html";
      } catch (e) {
        console.log("auto logout error", e);
      }
    }

    syncIdleTimerStateFromAutoLogout();
  }, 1000);
}

function ensureAutoLogoutAuthWatcher() {
  if (authWatchInitialized) return;
  authWatchInitialized = true;

  bindAutoLogoutActivityEventsOnce();

  onAuthStateChanged(auth, (user) => {
    if (user) {
      startAutoLogoutTimer();
    } else {
      stopAutoLogoutTimer();
      idleTimerRemainSeconds = IDLE_TIMER_TOTAL_SECONDS;
      idleTimerWarningShown = false;
      updateIdleTimerUi();
    }
  });
}


// =========================
// 관리자 통계 카드 데이터
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


// =========================
// 공통 자동 로그아웃 타이머 컴포넌트
// 로그인 성공 후에만 시작
// =========================

export const IDLE_TIMER_TOTAL_SECONDS = 30 * 60;

let idleTimerRemainSeconds = IDLE_TIMER_TOTAL_SECONDS;
let idleTimerInterval = null;
let idleTimerInitialized = false;
let idleTimerWarningShown = false;

function formatIdleTime(sec) {
  const m = String(Math.floor(sec / 60)).padStart(2, "0");
  const s = String(sec % 60).padStart(2, "0");
  return `${m}:${s}`;
}

function getIdleTimerLevel(sec) {
  if (sec > 20 * 60) return "safe";
  if (sec > 10 * 60) return "warn";
  return "danger";
}

function updateIdleTimerUi() {
  const chipEls = document.querySelectorAll("[data-idle-timer-chip]");
  const textEls = document.querySelectorAll("[data-idle-timer-text]");
  const progressEls = document.querySelectorAll("[data-idle-timer-progress]");

  const level = getIdleTimerLevel(idleTimerRemainSeconds);
  const percent = Math.max(0, Math.min(100, (idleTimerRemainSeconds / IDLE_TIMER_TOTAL_SECONDS) * 100));

  chipEls.forEach((chipEl) => {
    chipEl.classList.remove("idle-safe", "idle-warn", "idle-danger");
    chipEl.classList.add(`idle-${level}`);
  });

  textEls.forEach((textEl) => {
    textEl.textContent = formatIdleTime(idleTimerRemainSeconds);
  });

  progressEls.forEach((progressEl) => {
    progressEl.style.width = `${percent}%`;
  });
}

function syncIdleTimerStateFromAutoLogout() {
  if (!auth.currentUser) {
    idleTimerRemainSeconds = IDLE_TIMER_TOTAL_SECONDS;
    idleTimerWarningShown = false;
    updateIdleTimerUi();
    return;
  }

  const now = Date.now();
  const diff = now - lastActivityTime;
  const remainMs = Math.max(0, AUTO_LOGOUT_TIME - diff);
  idleTimerRemainSeconds = Math.ceil(remainMs / 1000);
  updateIdleTimerUi();
}

function resetIdleTimerState() {
  if (!auth.currentUser) return;
  idleTimerRemainSeconds = IDLE_TIMER_TOTAL_SECONDS;
  idleTimerWarningShown = false;
  updateIdleTimerUi();
}

export function getIdleTimerHtml() {
  return `
    <div class="idle-timer-chip idle-safe" data-idle-timer-chip aria-live="polite">
      <span class="idle-timer-label">자동 로그아웃</span>
      <strong data-idle-timer-text>30:00</strong>
      <div class="idle-progress-track" aria-hidden="true">
        <div class="idle-progress-bar" data-idle-timer-progress></div>
      </div>
    </div>
  `;
}

export function getIdleTimerCss() {
  return `
    .idle-timer-chip{
      min-width:96px;
      padding:8px 10px;
      border-radius:18px;
      background:rgba(255,255,255,.92);
      border:1px solid rgba(255,255,255,.7);
      box-shadow:0 4px 12px rgba(15,23,42,.08);
      display:flex;
      flex-direction:column;
      align-items:center;
      justify-content:center;
      gap:2px;
      transition:background-color .2s ease, color .2s ease, border-color .2s ease, transform .2s ease;
    }

    .idle-timer-label{
      font-size:10px;
      line-height:1;
      font-weight:700;
      white-space:nowrap;
      color:#15803d;
    }

    .idle-timer-chip strong{
      font-size:16px;
      line-height:1.1;
      letter-spacing:-.03em;
      color:#166534;
    }

    .idle-progress-track{
      width:100%;
      height:4px;
      margin-top:4px;
      border-radius:999px;
      background:rgba(15,23,42,.10);
      overflow:hidden;
    }

    .idle-progress-bar{
      width:100%;
      height:100%;
      border-radius:999px;
      background:currentColor;
      transition:width .25s linear;
    }

    .idle-timer-chip.idle-safe{
      background:#ecfdf5;
      border-color:#bbf7d0;
      color:#166534;
    }
    .idle-timer-chip.idle-safe .idle-timer-label{
      color:#15803d;
    }

    .idle-timer-chip.idle-warn{
      background:#fffbeb;
      border-color:#fde68a;
      color:#b45309;
    }
    .idle-timer-chip.idle-warn .idle-timer-label{
      color:#b45309;
    }

    .idle-timer-chip.idle-danger{
      background:#fef2f2;
      border-color:#fecaca;
      color:#b91c1c;
      animation:idlePulse 1.2s ease-in-out infinite;
    }
    .idle-timer-chip.idle-danger .idle-timer-label{
      color:#b91c1c;
    }

    @keyframes idlePulse{
      0%,100%{ transform:scale(1); }
      50%{ transform:scale(1.03); }
    }

    @media (max-width:420px){
      .idle-timer-chip{
        min-width:88px;
        padding:7px 8px;
      }
      .idle-timer-chip strong{
        font-size:15px;
      }
      .idle-timer-label{
        font-size:9px;
      }
    }
  `;
}

export function mountIdleTimer({
  containerSelector,
  insertPosition = "beforeend"
} = {}) {
  ensureAutoLogoutAuthWatcher();

  const container = document.querySelector(containerSelector);
  if (!container) return;

  if (!document.getElementById("idleTimerStyle")) {
    const style = document.createElement("style");
    style.id = "idleTimerStyle";
    style.textContent = getIdleTimerCss();
    document.head.appendChild(style);
  }

  if (!container.querySelector("[data-idle-timer-chip]")) {
    container.insertAdjacentHTML(insertPosition, getIdleTimerHtml());
  }

  syncIdleTimerStateFromAutoLogout();

  if (auth.currentUser) {
    startAutoLogoutTimer();
  }
}


// =========================
// 관리자 차트 렌더링 (Chart.js 필요)
// =========================

let visitPathChartInstance = null;
let loginStatsChartInstance = null;

export async function renderAdminCharts({
  visitCanvasId = "visitPathChartCanvas",
  loginCanvasId = "loginStatsChartCanvas"
} = {}) {
  if (typeof Chart === "undefined") {
    console.log("Chart.js not found");
    return;
  }

  const [stats, pathStats] = await Promise.all([
    getTodayStats(),
    getVisitPathStats()
  ]);

  const visitCanvas = document.getElementById(visitCanvasId);
  if (visitCanvas) {
    const labels = (pathStats || []).map(item => item.page);
    const values = (pathStats || []).map(item => item.count);

    if (visitPathChartInstance) visitPathChartInstance.destroy();

    visitPathChartInstance = new Chart(visitCanvas, {
      type: "bar",
      data: {
        labels,
        datasets: [{
          label: "방문 수",
          data: values,
          backgroundColor: [
            "rgba(15,23,42,.92)",
            "rgba(37,99,235,.88)",
            "rgba(239,68,68,.82)",
            "rgba(245,158,11,.82)",
            "rgba(14,165,233,.82)"
          ],
          borderRadius: 14,
          borderSkipped: false,
          barThickness: 26,
          maxBarThickness: 30
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: "rgba(15,23,42,.92)",
            titleColor: "#fff",
            bodyColor: "#fff",
            padding: 12,
            cornerRadius: 12
          }
        },
        scales: {
          x: {
            ticks: { color: "#64748b", font: { size: 11, weight: "700" } },
            grid: { display: false }
          },
          y: {
            beginAtZero: true,
            ticks: { color: "#64748b", precision: 0, font: { weight: "700" } },
            grid: { color: "rgba(15,23,42,.06)" }
          }
        }
      }
    });
  }

  const loginCanvas = document.getElementById(loginCanvasId);
  if (loginCanvas) {
    if (loginStatsChartInstance) loginStatsChartInstance.destroy();

    loginStatsChartInstance = new Chart(loginCanvas, {
      type: "doughnut",
      data: {
        labels: ["성공", "실패", "차단"],
        datasets: [{
          data: [stats?.successCount || 0, stats?.failCount || 0, stats?.blockedCount || 0],
          backgroundColor: [
            "rgba(34,197,94,.88)",
            "rgba(245,158,11,.88)",
            "rgba(239,68,68,.88)"
          ],
          borderColor: "#ffffff",
          borderWidth: 4,
          hoverOffset: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "72%",
        plugins: {
          tooltip: {
            backgroundColor: "rgba(15,23,42,.92)",
            titleColor: "#fff",
            bodyColor: "#fff",
            padding: 12,
            cornerRadius: 12
          },
          legend: {
            position: "bottom",
            labels: {
              boxWidth: 12,
              usePointStyle: true,
              pointStyle: "circle",
              color: "#475569",
              font: { size: 12, weight: "700" },
              padding: 16
            }
          }
        }
      }
    });
  }
}

export async function refreshAdminDashboard({
  statsContainerId = "adminStatsCards",
  chartContainerId = "visitPathChart",
  userListContainerId = "userActivityList",
  recentListContainerId = "recentActivityList",
  visitCanvasId = "visitPathChartCanvas",
  loginCanvasId = "loginStatsChartCanvas"
} = {}) {
  await renderAdminStatsUI({
    statsContainerId,
    chartContainerId,
    userListContainerId,
    recentListContainerId
  });

  await renderAdminCharts({
    visitCanvasId,
    loginCanvasId
  });
}