// =========================
// tracking.js (완전 통합본)
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
// 🔥 핵심: saveActivity (에러 해결용)
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
// 방문 이력
// =========================

export async function saveVisit(pageName, detail = "") {
  try {
    const { uid, email } = getUserInfo();
    if (!uid) return;

    await addDoc(collection(db, "visit_history"), {
      uid,
      email,
      page: pageName,
      detail,
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
// 로그인 이력
// =========================

export async function saveLogin({ email, status, reason }) {
  try {
    const user = auth.currentUser;

    await addDoc(collection(db, "login_history"), {
      uid: user?.uid || null,
      email,
      status,
      reason,
      userAgent: getDeviceInfo(),
      createdAt: serverTimestamp()
    });

  } catch (e) {
    console.log("login log error", e);
  }
}


// =========================
// 🔥 자동 로그아웃 (30분)
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
      alert("자동 로그아웃되었습니다.");
      location.href = "/index.html";
    } catch (e) {
      console.log("auto logout error", e);
    }
  }
}, 5000);


// =========================
// 🔥 타이머 UI (공통 컴포넌트)
// =========================

let remain = 1800;

export function mountIdleTimer(selector) {
  const el = document.querySelector(selector);
  if (!el) return;

  const html = `
    <div id="idleTimerChip" style="
      min-width:96px;
      padding:8px 10px;
      border-radius:18px;
      background:#ecfdf5;
      border:1px solid #bbf7d0;
      text-align:center;
      font-size:12px;
    ">
      <div style="font-weight:700;">자동 로그아웃</div>
      <div id="idleTimerText" style="font-size:16px;">30:00</div>
      <div style="height:4px;background:#ddd;border-radius:999px;margin-top:4px;">
        <div id="idleTimerBar" style="height:100%;background:#16a34a;width:100%;"></div>
      </div>
    </div>
  `;

  el.insertAdjacentHTML("beforeend", html);

  setInterval(() => {
    remain--;

    const m = String(Math.floor(remain / 60)).padStart(2, "0");
    const s = String(remain % 60).padStart(2, "0");

    const percent = (remain / 1800) * 100;

    const text = document.getElementById("idleTimerText");
    const bar = document.getElementById("idleTimerBar");
    const chip = document.getElementById("idleTimerChip");

    if (!text) return;

    text.textContent = `${m}:${s}`;
    bar.style.width = percent + "%";

    if (remain < 600) {
      chip.style.background = "#fef2f2";
      bar.style.background = "#dc2626";
    } else if (remain < 1200) {
      chip.style.background = "#fffbeb";
      bar.style.background = "#f59e0b";
    }

  }, 1000);
}