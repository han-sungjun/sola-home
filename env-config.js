const host = window.location.hostname;
const origin = window.location.origin;

const DEV_HOSTS = new Set([
  "localhost",
  "127.0.0.1",
  "www.sola-home-dev.kr",
  "sola-home-dev.kr"
]);

const PROD_HOSTS = new Set([
  "www.sola-home.kr",
  "sola-home.kr"
]);

const isDevHost = DEV_HOSTS.has(host);
const isProdHost = PROD_HOSTS.has(host);

export const ENV = isDevHost ? "dev" : "prod";

export const FIREBASE_CONFIG = {
  dev: {
    apiKey: "AIzaSyCC4ZilL1Gv_zy0_iw36b0CO4Uq7vYX6rE",
    authDomain: "sola-home-dev.firebaseapp.com",
    projectId: "sola-home-dev",
    storageBucket: "sola-home-dev.firebasestorage.app",
    messagingSenderId: "292137041544",
    appId: "1:292137041544:web:c648f4380b1562a31e693d",
    measurementId: "G-R7TZ1PG6QP"
  },
  prod: {
    apiKey: "AIzaSyDhKr7oMSrLowJ47cqB4pvNXuIIdtW0HPI",
    authDomain: "sola-home-4979a.firebaseapp.com",
    projectId: "sola-home-4979a",
    storageBucket: "sola-home-4979a.firebasestorage.app",
    messagingSenderId: "337132471819",
    appId: "1:337132471819:web:848cd357fecda459a2e90e",
    measurementId: "G-E7R9JJGGJE"
  }
};

export const API_URL = {
  dev: {
    login: "https://loginwithid-292137041544.asia-northeast3.run.app",
    signup: "https://signupwithid-292137041544.asia-northeast3.run.app",
    checkLoginId: "https://checkloginid-292137041544.asia-northeast3.run.app",
    checkNickname: "https://checknickname-292137041544.asia-northeast3.run.app",
	getUserForPasswordReset: "https://getuserforpasswordreset-l6nmtiaxgq-du.a.run.app",
    updatePasswordAfterPhoneReset: "https://updatepasswordafterphonereset-l6nmtiaxgq-du.a.run.app",
	geocodeAddress: "https://geocodeaddress-l6nmtiaxgq-uc.a.run.app",
  },
  prod: {
    login: "https://loginwithid-ljm6q3t55q-du.a.run.app",
    signup: "https://signupwithid-ljm6q3t55q-du.a.run.app",
    checkLoginId: "https://checkloginid-ljm6q3t55q-du.a.run.app",
    checkNickname: "https://checknickname-ljm6q3t55q-du.a.run.app",
	getUserForPasswordReset: "https://getuserforpasswordreset-ljm6q3t55q-du.a.run.app",
    updatePasswordAfterPhoneReset: "https://updatepasswordafterphonereset-ljm6q3t55q-du.a.run.app",
	geocodeAddress: "https://geocodeaddress-ljm6q3t55q-du.a.run.app",
  }
};

export const ROUTE_URL = {
  dev: {
    login: "./index.html",
    signup: "./signup.html",
    app: "./app.html",
    phoneVerify: "./phone-verify.html"
  },
  prod: {
    login: "./index.html",
    signup: "./signup.html",
    app: "./app.html",
    phoneVerify: "./phone-verify.html"
  }
};

export const APP_ORIGIN = {
  dev: host === "localhost" || host === "127.0.0.1"
    ? origin
    : "https://www.sola-home-dev.kr",
  prod: "https://www.sola-home.kr"
};

export const IS_DEV = ENV === "dev";
export const IS_PROD = ENV === "prod";

/* signup.html 등에서 바로 쓸 수 있도록 호환용 export 추가 */
export const CURRENT_FIREBASE_CONFIG = FIREBASE_CONFIG[ENV];
export const CURRENT_API = API_URL[ENV];
export const CURRENT_ROUTE = ROUTE_URL[ENV];
export const CURRENT_APP_ORIGIN = APP_ORIGIN[ENV];

console.log("[env-config] loaded", {
  host,
  origin,
  env: ENV,
  isDevHost,
  isProdHost,
  firebaseProjectId: FIREBASE_CONFIG[ENV]?.projectId,
  api: API_URL[ENV]
});