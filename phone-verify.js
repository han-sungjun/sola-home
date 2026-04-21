import './firebase-config.js';
import { getApp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
import {
  getAuth,
  onAuthStateChanged,
  signOut,
  RecaptchaVerifier,
  linkWithPhoneNumber
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';
import {
  getFirestore,
  doc,
  getDoc,
  updateDoc,
  serverTimestamp
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';

const auth = getAuth(getApp());
const db = getFirestore(getApp());

const qs = (selector) => document.querySelector(selector);

const phoneNumberEl = qs('#phoneNumber');
const smsCodeEl = qs('#smsCode');
const sendCodeBtn = qs('#sendCodeBtn');
const verifyCodeBtn = qs('#verifyCodeBtn');
const resendBtn = qs('#resendBtn');
const signOutBtn = qs('#signOutBtn');
const verifySection = qs('#verifySection');
const noticeEl = qs('#notice');

let loadingCount = 0;
let confirmationResult = null;
let recaptchaVerifier = null;

function startLoading() {
  const pageLoader = document.getElementById('pageLoader');
  if (!pageLoader) return;
  loadingCount += 1;
  pageLoader.classList.add('show');
}

function finishLoading() {
  const pageLoader = document.getElementById('pageLoader');
  loadingCount = Math.max(loadingCount - 1, 0);
  if (loadingCount === 0 && pageLoader) {
    pageLoader.classList.remove('show');
  }
}

function showNotice(message, type = 'info') {
  noticeEl.className = `notice show ${type}`;
  noticeEl.textContent = message;
}

function hideNotice() {
  noticeEl.className = 'notice info';
  noticeEl.textContent = '';
}

function normalizeDigits(value = '') {
  return String(value).replace(/\D/g, '');
}

function formatPhoneNumber(value = '') {
  const digits = normalizeDigits(value).slice(0, 11);
  if (digits.length < 4) return digits;
  if (digits.length < 8) return `${digits.slice(0,3)}-${digits.slice(3)}`;
  return `${digits.slice(0,3)}-${digits.slice(3,7)}-${digits.slice(7)}`;
}

function toE164Korea(value = '') {
  const digits = normalizeDigits(value);
  if (digits.startsWith('82')) return `+${digits}`;
  if (digits.startsWith('0')) return `+82${digits.slice(1)}`;
  return `+82${digits}`;
}

function setButtonsLoading(isLoading, type = 'send') {
  if (type === 'send') {
    sendCodeBtn.disabled = isLoading;
    resendBtn.disabled = isLoading;
    sendCodeBtn.textContent = isLoading ? '전송 중...' : '문자 인증 시작';
  } else {
    verifyCodeBtn.disabled = isLoading;
    verifyCodeBtn.textContent = isLoading ? '확인 중...' : '인증 확인';
  }
}

function showVerifySection() {
  verifySection.classList.remove('hidden');
  requestAnimationFrame(() => {
    verifySection.classList.add('show');
  });
}

function resetRecaptcha() {
  try {
    recaptchaVerifier?.clear();
  } catch (_) {}
  recaptchaVerifier = null;
}

async function ensureRecaptcha() {
  if (recaptchaVerifier) return recaptchaVerifier;

  const container = document.getElementById('recaptcha-container');
  if (container) {
    container.innerHTML = '';
  }

  recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
    size: 'invisible',
    badge: 'inline'
  });

  await recaptchaVerifier.render();
  return recaptchaVerifier;
}

async function loadUser(user) {
  const snap = await getDoc(doc(db, 'users', user.uid));
  return snap.exists() ? snap.data() : null;
}

async function sendCode() {
  hideNotice();

  const user = auth.currentUser;
  if (!user) {
    window.location.replace('./index.html');
    return;
  }

  const phoneDigits = normalizeDigits(phoneNumberEl.value);
  phoneNumberEl.value = formatPhoneNumber(phoneDigits);

  if (phoneDigits.length < 10) {
    showNotice('휴대폰 번호를 정확히 입력해주세요.', 'error');
    return;
  }

  try {
    setButtonsLoading(true);

    const verifier = await ensureRecaptcha();

    confirmationResult = await linkWithPhoneNumber(
      user,
      toE164Korea(phoneDigits),
      verifier
    );

    resetRecaptcha();

    showVerifySection();
    showNotice('인증 코드가 발송되었습니다.', 'success');
    smsCodeEl.focus();

  } catch (e) {
    console.error(e);
    resetRecaptcha();
    showNotice('문자 발송 실패. 다시 시도해주세요.', 'error');
  } finally {
    setButtonsLoading(false);
  }
}

async function verifyCode() {
  hideNotice();

  if (!confirmationResult) {
    showNotice('먼저 인증 코드를 요청하세요.', 'error');
    return;
  }

  const code = normalizeDigits(smsCodeEl.value).slice(0,6);
  if (code.length !== 6) {
    showNotice('6자리 코드를 입력해주세요.', 'error');
    return;
  }

  try {
    setButtonsLoading(true, 'verify');
    startLoading();

    const result = await confirmationResult.confirm(code);
    const user = result.user;

    await updateDoc(doc(db, 'users', user.uid), {
      phoneVerified: true,
      phoneNumber: normalizeDigits(phoneNumberEl.value),
      phoneVerifiedAt: serverTimestamp()
    });

    showNotice('인증 완료! 이동 중...', 'success');

    setTimeout(() => {
      window.location.replace('./app.html');
    }, 800);

  } catch (e) {
    console.error(e);
    showNotice('인증 코드가 올바르지 않습니다.', 'error');
  } finally {
    finishLoading();
    setButtonsLoading(false, 'verify');
  }
}

sendCodeBtn.onclick = sendCode;
resendBtn.onclick = sendCode;
verifyCodeBtn.onclick = verifyCode;

phoneNumberEl.addEventListener('input', (e) => {
  e.target.value = formatPhoneNumber(e.target.value);
});

smsCodeEl.addEventListener('input', (e) => {
  e.target.value = normalizeDigits(e.target.value).slice(0,6);
});

signOutBtn.onclick = async () => {
  await signOut(auth);
  window.location.replace('./index.html');
};

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.replace('./index.html');
    return;
  }

  const data = await loadUser(user);

  if (data?.phoneVerified) {
    window.location.replace('./app.html');
    return;
  }

  if (data?.phoneNumber) {
    phoneNumberEl.value = formatPhoneNumber(data.phoneNumber);
  }

  showNotice('휴대폰 인증을 진행해주세요.', 'info');
});