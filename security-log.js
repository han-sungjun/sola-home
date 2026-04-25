async function writeSecurityLog(type, detail = {}) {
  try {
    if (typeof firebase === "undefined" || !firebase.firestore) {
      console.warn("Firebase가 초기화되지 않아 보안 로그를 저장하지 못했습니다.");
      return;
    }

    const raw = localStorage.getItem("loginUser");
    let uid = null;
    let loginId = null;

    try {
      const parsed = JSON.parse(raw || "{}");
      uid = parsed.uid || null;
      loginId = parsed.loginId || null;
    } catch (e) {}

    await firebase.firestore()
      .collection("security_logs")
      .add({
        uid,
        loginId,
        type,
        path: location.pathname,
        href: location.href,
        userAgent: navigator.userAgent,
        detail,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });

  } catch (err) {
    console.warn("보안 로그 저장 실패:", err);
  }
}