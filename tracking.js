// Firebase import (이미 firebase 초기화는 각 페이지에서 되어있다고 가정)
import { getFirestore, collection, addDoc, serverTimestamp } 
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import { getAuth } 
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const db = getFirestore();
const auth = getAuth();

/**
 * 현재 사용자 정보
 */
function getUserInfo() {
  const user = auth.currentUser;
  return {
    uid: user?.uid || null,
    email: user?.email || null
  };
}

/**
 * 디바이스 정보
 */
function getDeviceInfo() {
  return navigator.userAgent || "unknown";
}

/**
 * 방문 이력 저장
 */
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

/**
 * 로그인 이력 저장
 */
export async function saveLogin({ email, status, reason }) {
  try {
    const user = auth.currentUser;

    await addDoc(collection(db, "login_history"), {
      uid: user?.uid || null,
      email,
      status,   // success / fail / blocked
      reason,   // 상세 사유
      userAgent: getDeviceInfo(),
      path: location.pathname,
      url: location.href,
      createdAt: serverTimestamp()
    });

  } catch (e) {
    console.log("login log error", e);
  }
}