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
let currentUserData = null;

function startLoading() {
  const pageLoader = document.getElementById('pageLoader');
  if (!pageLoader) return;
  loadingCount += 1;
  pageLoader.classList.add('show');
  pageLoader.setAttribute('aria-hidden', 'false');
}

function finishLoading(callback) {
  const pageLoader = document.getElementById('pageLoader');
  loadingCount = Math.max(loadingCount - 1, 0);

  if (!pageLoader) {
    if (typeof callback === 'function') callback();
    return;
  }

  if (loadingCount > 0) {
    if (typeof callback === 'function') callback();
    return;
  }

  pageLoader.classList.remove('show');
  pageLoader.setAttribute('aria-hidden', 'true');

  if (typeof callback === 'function') {
    setTimeout(() => callback(), 40);
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

function toE164Korea(value = '') {
  const digits = normalizeDigits(value);

  if (digits.startsWith('82')) return `+${digits}`;
  if (digits.startsWith('0')) return `+82${digits.slice(1)}`;
  return `+82${digits}`;
}

function setButtonsLoading(isLoading, action = 'send') {
  if (action === 'send') {
    sendCodeBtn.disabled = isLoading;
    resendBtn.disabled = isLoading;
    sendCodeBtn.textContent = isLoading ? '전송 중...' : '인증 코드 보내기';
    resendBtn.textContent = isLoading ? '전송 중...' : '코드 다시 보내기';
  } else {
    verifyCodeBtn.disabled = isLoading;
    verifyCodeBtn.textContent = isLoading ? '확인 중...' : '인증 완료';
  }
}

async function ensureRecaptcha() {
  if (recaptchaVerifier) return recaptchaVerifier;

  recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
    size: 'normal',
    callback: () => {},
    'expired-callback': () => {
      showNotice('보안 확인이 만료되었습니다. 다시 시도해 주세요.', 'error');
    }
  });

  await recaptchaVerifier.render();
  return recaptchaVerifier;
}

async function loadCurrentUserData(user) {
  const snap = await getDoc(doc(db, 'users', user.uid));
  if (!snap.exists()) return null;
  return snap.data() || null;
}

async function sendCode() {
  hideNotice();

  const user = auth.currentUser;
  if (!user) {
    showNotice('로그인 정보가 없어 로그인 페이지로 이동합니다.', 'error');
    setTimeout(() => window.location.replace('./index.html'), 120);
    return;
  }

  const phoneDigits = normalizeDigits(phoneNumberEl.value);
  phoneNumberEl.value = phoneDigits;

  if (!phoneDigits || phoneDigits.length < 10 || phoneDigits.length > 11) {
    showNotice('휴대폰 번호는 숫자만 10~11자리로 입력해 주세요.', 'error');
    phoneNumberEl.focus();
    return;
  }

  try {
    setButtonsLoading(true, 'send');
    startLoading();

    const appVerifier = await ensureRecaptcha();
    confirmationResult = await linkWithPhoneNumber(
      user,
      toE164Korea(phoneDigits),
      appVerifier
    );

    verifySection.classList.remove('hidden');
    showNotice('인증 코드가 발송되었습니다. 문자로 받은 코드를 입력해 주세요.', 'success');
    smsCodeEl.focus();
  } catch (error) {
    console.error('[phone-verify] sendCode error:', error);

    const code = error?.code || '';
    let message = '인증 코드 발송 중 오류가 발생했습니다.';

    if (code === 'auth/invalid-phone-number') {
      message = '휴대폰 번호 형식이 올바르지 않습니다.';
    } else if (code === 'auth/too-many-requests') {
      message = '요청이 많아 잠시 제한되었습니다. 잠시 후 다시 시도해 주세요.';
    } else if (code === 'auth/captcha-check-failed') {
      message = '보안 확인에 실패했습니다. 다시 시도해 주세요.';
    } else if (code === 'auth/credential-already-in-use') {
      message = '이미 다른 계정에 연결된 휴대폰 번호입니다.';
    } else if (code === 'auth/provider-already-linked') {
      message = '이미 휴대폰 인증이 완료된 계정입니다.';
    }

    showNotice(message, 'error');
  } finally {
    finishLoading();
    setButtonsLoading(false, 'send');
  }
}

async function verifyCode() {
  hideNotice();

  if (!confirmationResult) {
    showNotice('먼저 인증 코드를 발송해 주세요.', 'error');
    return;
  }

  const code = normalizeDigits(smsCodeEl.value).slice(0, 6);
  smsCodeEl.value = code;

  if (code.length !== 6) {
    showNotice('인증 코드를 6자리로 입력해 주세요.', 'error');
    smsCodeEl.focus();
    return;
  }

  try {
    setButtonsLoading(true, 'verify');
    startLoading();

    const result = await confirmationResult.confirm(code);
    const user = result.user;
    const phoneDigits = normalizeDigits(phoneNumberEl.value);

    await updateDoc(doc(db, 'users', user.uid), {
      phoneNumber: phoneDigits,
      phoneVerified: true,
      phoneVerifiedAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    showNotice('휴대폰 인증이 완료되었습니다. 잠시 후 서비스로 이동합니다.', 'success');

    setTimeout(() => {
      window.location.replace('./app.html');
    }, 200);
  } catch (error) {
    console.error('[phone-verify] verifyCode error:', error);

    const code = error?.code || '';
    let message = '인증 코드 확인 중 오류가 발생했습니다.';

    if (code === 'auth/invalid-verification-code') {
      message = '인증 코드가 올바르지 않습니다.';
    } else if (code === 'auth/code-expired') {
      message = '인증 코드가 만료되었습니다. 다시 요청해 주세요.';
    }

    showNotice(message, 'error');
  } finally {
    finishLoading();
    setButtonsLoading(false, 'verify');
  }
}

sendCodeBtn.addEventListener('click', sendCode);
resendBtn.addEventListener('click', sendCode);
verifyCodeBtn.addEventListener('click', verifyCode);

phoneNumberEl.addEventListener('input', (event) => {
  event.target.value = normalizeDigits(event.target.value).slice(0, 11);
});

smsCodeEl.addEventListener('input', (event) => {
  event.target.value = normalizeDigits(event.target.value).slice(0, 6);
});

signOutBtn.addEventListener('click', async () => {
  await signOut(auth).catch(() => {});
  window.location.replace('./index.html');
});

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.replace('./index.html');
    return;
  }

  try {
    startLoading();
    currentUserData = await loadCurrentUserData(user);

    if (!currentUserData) {
      showNotice('회원 정보를 찾을 수 없습니다. 다시 로그인해 주세요.', 'error');
      await signOut(auth).catch(() => {});
      setTimeout(() => window.location.replace('./index.html'), 120);
      return;
    }

    if (currentUserData.phoneVerified === true) {
      window.location.replace('./app.html');
      return;
    }

    if (currentUserData.phoneNumber) {
      phoneNumberEl.value = normalizeDigits(currentUserData.phoneNumber);
    }

    showNotice('휴대폰 번호를 확인한 뒤 인증 코드를 발송해 주세요.', 'info');
  } finally {
    finishLoading();
  }
});