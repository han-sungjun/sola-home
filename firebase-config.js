import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


const __SOLA_DYNAMIC_IMPORT_VERSION__ = globalThis.__SOLA_DYNAMIC_IMPORT_VERSION__ || (() => {
  const d = new Date();
  const pad = (n, len = 2) => String(n).padStart(len, '0');
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}${pad(d.getMilliseconds(), 3)}`;
})();
globalThis.__SOLA_DYNAMIC_IMPORT_VERSION__ = __SOLA_DYNAMIC_IMPORT_VERSION__;
const __solaNoCache = (url) => `${url}${url.includes('?') ? '&' : '?'}v=${__SOLA_DYNAMIC_IMPORT_VERSION__}`;

const { ENV, FIREBASE_CONFIG } = await import(__solaNoCache("./env-config.js"));

const firebaseConfig = FIREBASE_CONFIG[ENV];

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db, firebaseConfig, ENV };