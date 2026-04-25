const admin = require("firebase-admin");

async function verifyToken(req, res, next) {
  const header = req.headers.authorization || "";

  if (!header.startsWith("Bearer ")) {
    return res.status(401).json({ error: "NO_TOKEN" });
  }

  const token = header.replace("Bearer ", "");

  try {
    const decoded = await admin.auth().verifyIdToken(token);

    req.user = decoded;

    next();
  } catch (e) {
    console.error("토큰 검증 실패:", e);
    return res.status(401).json({ error: "INVALID_TOKEN" });
  }
}

async function verifyAdminRole(req, res, next) {
  try {
    if (!req.user || !req.user.uid) {
      return res.status(401).json({ error: "NO_USER" });
    }

    const snap = await admin.firestore()
      .collection("users")
      .doc(req.user.uid)
      .get();

    if (!snap.exists) {
      return res.status(403).json({ error: "USER_NOT_FOUND" });
    }

    const user = snap.data();
    const role = user.role || user.userRole || "";

    const isAdmin =
      role === "root" ||
      role === "admin" ||
      role === "superAdmin";

    if (!isAdmin) {
      return res.status(403).json({ error: "FORBIDDEN" });
    }

    req.userProfile = user;

    next();
  } catch (e) {
    console.error("관리자 권한 검증 실패:", e);
    return res.status(500).json({ error: "ADMIN_VERIFY_FAILED" });
  }
}

async function verifyRootRole(req, res, next) {
  try {
    if (!req.user || !req.user.uid) {
      return res.status(401).json({ error: "NO_USER" });
    }

    const snap = await admin.firestore()
      .collection("users")
      .doc(req.user.uid)
      .get();

    if (!snap.exists) {
      return res.status(403).json({ error: "USER_NOT_FOUND" });
    }

    const user = snap.data();
    const role = user.role || user.userRole || "";

    if (role !== "root") {
      return res.status(403).json({ error: "ROOT_ONLY" });
    }

    req.userProfile = user;

    next();
  } catch (e) {
    console.error("root 권한 검증 실패:", e);
    return res.status(500).json({ error: "ROOT_VERIFY_FAILED" });
  }
}

module.exports = {
  verifyToken,
  verifyAdminRole,
  verifyRootRole
};