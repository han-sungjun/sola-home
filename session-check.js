async function sessionCheck(options = {}) {
  console.log("Firestore 세션 검증 시작");

  const {
    requireAdmin = false,
    adminRoles = ["root", "admin", "superAdmin"]
  } = options;

  const raw = localStorage.getItem("loginUser");

  if (!raw) {
    location.replace("/");
    return false;
  }

  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (e) {
    localStorage.removeItem("loginUser");
    location.replace("/");
    return false;
  }

  const uid = parsed.uid;
  const localSessionId = parsed.sessionId || "";

  if (!uid) {
    localStorage.removeItem("loginUser");
    location.replace("/");
    return false;
  }

  try {
    const docRef = firebase.firestore().collection("users").doc(uid);
    const snap = await docRef.get();

    if (!snap.exists) {
      console.warn("사용자 문서 없음");

      if (typeof writeSecurityLog === "function") {
        await writeSecurityLog("USER_DOC_NOT_FOUND", { uid });
      }

      localStorage.removeItem("loginUser");
      location.replace("/");
      return false;
    }

    const user = snap.data();

    // 중복 로그인 차단
    const serverSessionId = user.activeSessionId || "";

    if (serverSessionId && localSessionId && localSessionId !== serverSessionId) {
      console.warn("중복 로그인 감지");

      if (typeof writeSecurityLog === "function") {
        await writeSecurityLog("SESSION_CONFLICT", {
          localSessionId,
          serverSessionId
        });
      }

      alert("다른 기기에서 로그인되어 현재 세션이 종료되었습니다.");
      localStorage.removeItem("loginUser");
      location.replace("/");
      return false;
    }

    if (user.accountStatus === "withdrawn") {
      if (typeof writeSecurityLog === "function") {
        await writeSecurityLog("WITHDRAWN_ACCOUNT_ACCESS", {
          accountStatus: user.accountStatus
        });
      }

      alert("탈퇴된 계정입니다.");
      localStorage.removeItem("loginUser");
      location.replace("/");
      return false;
    }

    if (user.accountStatus === "blocked") {
      if (typeof writeSecurityLog === "function") {
        await writeSecurityLog("BLOCKED_ACCOUNT_ACCESS", {
          accountStatus: user.accountStatus,
          blockedReason: user.blockedReason || ""
        });
      }

      alert("보안 정책에 따라 차단된 계정입니다.");
      localStorage.removeItem("loginUser");
      location.replace("/");
      return false;
    }

    if (user.approvalStatus !== "approved") {
      if (typeof writeSecurityLog === "function") {
        await writeSecurityLog("UNAPPROVED_ACCESS", {
          approvalStatus: user.approvalStatus || ""
        });
      }

      alert("관리자 승인 후 이용 가능합니다.");
      localStorage.removeItem("loginUser");
      location.replace("/");
      return false;
    }

    if (user.phoneVerified !== true) {
      location.replace("/phone-verify");
      return false;
    }

    const role = user.role || user.userRole || "";

    if (requireAdmin && !adminRoles.includes(role)) {
      if (typeof writeSecurityLog === "function") {
        await writeSecurityLog("ADMIN_ACCESS_DENIED", {
          role
        });
      }

      alert("관리자 권한이 없습니다.");
      location.replace("/app");
      return false;
    }

    // 중요: sessionId 유지 저장
    localStorage.setItem("loginUser", JSON.stringify({
      uid,
      loginId: parsed.loginId || user.loginId || "",
      sessionId: localSessionId || serverSessionId || "",
      role,
      approvalStatus: user.approvalStatus,
      phoneVerified: user.phoneVerified,
      accountStatus: user.accountStatus || "active"
    }));

    console.log("세션 검증 완료");
    return true;

  } catch (err) {
    console.error("세션 검증 오류:", err);

    if (typeof writeSecurityLog === "function") {
      await writeSecurityLog("SESSION_CHECK_ERROR", {
        message: err.message || String(err)
      });
    }

    localStorage.removeItem("loginUser");
    location.replace("/");
    return false;
  }
}