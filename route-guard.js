(function () {
  console.log("route-guard active");

  const path = location.pathname;

  const PUBLIC_PAGES = [
    "/",
    "/signup",
    "/phone-verify",
    "/error"
  ];

  const ADMIN_PAGES = [
    "/sola-admin-x92ks",
    "/admin"
  ];

  function go(url) {
    if (location.pathname !== url) {
      location.replace(url);
    }
  }

  function getLoginUser() {
    try {
      return JSON.parse(localStorage.getItem("loginUser") || "null");
    } catch (e) {
      return null;
    }
  }

  const loginUser = getLoginUser();

  const isPublicPage = PUBLIC_PAGES.includes(path);
  const isAdminPage = ADMIN_PAGES.includes(path);

  if (!loginUser && !isPublicPage) {
    console.warn("비로그인 접근 차단:", path);

    sessionStorage.setItem("pendingDeepLink", location.href);

    go("/");
    return;
  }

  if (loginUser && loginUser.phoneVerified === false && path !== "/phone-verify") {
    console.warn("휴대폰 인증 필요");
    go("/phone-verify");
    return;
  }

  if (
    loginUser &&
    loginUser.approvalStatus &&
    loginUser.approvalStatus !== "approved" &&
    !isPublicPage
  ) {
    console.warn("승인되지 않은 계정");
    go("/");
    return;
  }

  if (loginUser && isAdminPage) {
    const role = loginUser.role || loginUser.userRole || "";

    const isAdmin =
      role === "root" ||
      role === "admin" ||
      role === "superAdmin";

    if (!isAdmin) {
      console.warn("관리자 권한 없음");
      go("/app");
      return;
    }
  }

  if (loginUser && (path === "/")) {
    go("/app");
    return;
  }
})();