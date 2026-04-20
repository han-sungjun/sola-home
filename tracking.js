// =========================
// Firebase Tracking Module
// =========================

import { getFirestore, collection, addDoc, serverTimestamp, query, where, getDocs } 
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import { getAuth, signOut } 
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

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


// =========================
// 방문 이력 저장
// =========================

export async function saveVisit(pageName) {
  try {
    const { uid, email } = getUserInfo();

    await addDoc(collection(db, "visit_history"), {
      uid,
      email,
      page: pageName,
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
      email,
      status,   // success / fail / blocked
      reason,
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
// 자동 로그아웃 (30분)
// =========================

let lastActivityTime = Date.now();
let warningShown = false;

const AUTO_LOGOUT_TIME = 30 * 60 * 1000;   // 30분
const WARNING_TIME = 29 * 60 * 1000;       // 29분

function resetTimer() {
  lastActivityTime = Date.now();
  warningShown = false;
}

// 사용자 활동 감지
["click", "mousemove", "keydown", "scroll", "touchstart"].forEach(event => {
  window.addEventListener(event, resetTimer);
});


// 주기 체크
setInterval(async () => {
  const now = Date.now();
  const diff = now - lastActivityTime;

  // 29분 → 경고
  if (diff > WARNING_TIME && !warningShown) {
    warningShown = true;

    alert("1분 후 자동 로그아웃 됩니다.");
  }

  // 30분 → 로그아웃
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
// 관리자 통계 조회 (옵션)
// =========================

export async function getTodayStats() {
  try {
    const today = new Date();
    today.setHours(0,0,0,0);

    const visitQuery = query(
      collection(db, "visit_history"),
      where("createdAt", ">=", today)
    );

    const loginQuery = query(
      collection(db, "login_history"),
      where("createdAt", ">=", today)
    );

    const [visitSnap, loginSnap] = await Promise.all([
      getDocs(visitQuery),
      getDocs(loginQuery)
    ]);

    let success = 0;
    let fail = 0;

    loginSnap.forEach(doc => {
      const d = doc.data();
      if (d.status === "success") success++;
      if (d.status === "fail") fail++;
    });

    return {
      visitCount: visitSnap.size,
      loginCount: loginSnap.size,
      successCount: success,
      failCount: fail
    };

  } catch (e) {
    console.log("stats error", e);
    return null;
  }
}