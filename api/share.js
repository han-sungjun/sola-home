import admin from "firebase-admin";

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    }),
  });
}

const db = admin.firestore();

export default async function handler(req, res) {
  try {
    const { id } = req.query;

    if (!id) {
      return res.status(400).send("Invalid request");
    }

    // 1️⃣ Firestore 데이터 조회
    const docRef = db.collection("benefits").doc(id);
    const snap = await docRef.get();

    if (!snap.exists) {
      return res.status(404).send("Not found");
    }

    const data = snap.data();

    // 2️⃣ 공유 클릭 로그 저장 (핵심)
    await db.collection("share_logs").add({
      benefitId: id,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      ua: req.headers["user-agent"] || "",
      referer: req.headers["referer"] || "",
    });

    // 3️⃣ OG 이미지 구성
    const title = data.name || "입주민 혜택";
    const desc = data.condition || "입주민 전용 혜택을 확인하세요";
    const image =
      data.image ||
      process.env.DEFAULT_OG_IMAGE ||
      "https://www.sola-home-dev.kr/icons/icon-512.png";

    const appUrl = process.env.PUBLIC_APP_URL;

    // 핵심: .html 제거한 딥링크
    const deepLink = `${appUrl}/app?open=benefit&id=${id}&from=share`;

    // HTML 반환 (OG 전용)
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    return res.status(200).send(`
<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>

<title>${title}</title>

<meta property="og:type" content="website"/>
<meta property="og:title" content="${title}"/>
<meta property="og:description" content="${desc}"/>
<meta property="og:image" content="${image}"/>
<meta property="og:url" content="${appUrl}/share/benefit/${id}"/>

<meta name="twitter:card" content="summary_large_image"/>

<script>
  // 카카오/브라우저 자동 리디렉션
  window.location.href = "${deepLink}";
</script>

</head>
<body>
Redirecting...
</body>
</html>
    `);
  } catch (err) {
    console.error(err);
    return res.status(500).send("Share page error");
  }
}