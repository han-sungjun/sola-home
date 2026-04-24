import './firebase-config.js';
import { API_URL } from './env-config.js';

import { getApp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
import {
  getAuth,
  onAuthStateChanged,
  signOut,
  RecaptchaVerifier,
  linkWithPhoneNumber,
  signInWithPhoneNumber
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

const resetSection = qs('#resetSection');
const newPasswordEl = qs('#newPassword');
const newPasswordConfirmEl = qs('#newPasswordConfirm');
const resetPasswordBtn = qs('#resetPasswordBtn');

const pwBar1 = qs('#pwBar1');
const pwBar2 = qs('#pwBar2');
const pwBar3 = qs('#pwBar3');
const passwordStrengthStatus = qs('#passwordStrengthStatus');
const passwordMatchStatus = qs('#passwordMatchStatus');

const params = new URLSearchParams(location.search);
const mode = params.get('mode') || '';
const loginId = String(params.get('loginId') || '').trim().toLowerCase();
const isResetMode = mode === 'reset';

let loadingCount = 0;
let confirmationResult = null;
let recaptchaVerifier = null;
let verifiedIdToken = '';

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
  if (digits.length < 8) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
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
  } else if (type === 'verify') {
    verifyCodeBtn.disabled = isLoading;
    verifyCodeBtn.textContent = isLoading ? '확인 중...' : '인증 확인';
  } else if (type === 'reset') {
    resetPasswordBtn.disabled = isLoading;
    resetPasswordBtn.textContent = isLoading ? '변경 중...' : '비밀번호 변경';
  }
}

function showVerifySection() {
  verifySection.classList.remove('hidden');
  requestAnimationFrame(() => {
    verifySection.classList.add('show');
  });
}

function showResetSection() {
  if (!resetSection) return;
  resetSection.classList.remove('hidden');
  requestAnimationFrame(() => {
    resetSection.classList.add('show');
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

async function fetchResetUserInfo() {
  const env = window.__APP_ENV__ || (location.hostname.includes('dev') ? 'dev' : 'prod');
  const api = API_URL?.[env]?.getUserForPasswordReset || API_URL?.getUserForPasswordReset;

  if (!api) {
    throw new Error('getUserForPasswordReset API가 설정되지 않았습니다.');
  }

  const res = await fetch(api, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ loginId })
  });

  return res.json();
}

async function sendCode() {
  hideNotice();

  if (isResetMode && !loginId) {
    showNotice('비밀번호를 재설정할 아이디 정보가 없습니다. 로그인 화면에서 다시 진행해주세요.', 'error');
    return;
  }

  if (!isResetMode) {
    const user = auth.currentUser;
    if (!user) {
      window.location.replace('./index.html');
      return;
    }
  }

  const phoneDigits = normalizeDigits(phoneNumberEl.value);
  phoneNumberEl.value = formatPhoneNumber(phoneDigits);

  if (phoneDigits.length < 10) {
    showNotice('휴대폰 번호를 정확히 입력해주세요.', 'error');
    return;
  }

  try {
    setButtonsLoading(true);
    startLoading();

    const verifier = await ensureRecaptcha();

    if (isResetMode) {
      const data = await fetchResetUserInfo();

      if (!data?.exists) {
        showNotice('가입된 아이디를 찾을 수 없습니다.', 'error');
        return;
      }

      if (!data?.phoneNumber) {
        showNotice('등록된 휴대폰 번호가 없습니다. 관리자에게 문의해주세요.', 'error');
        return;
      }

      const savedPhone = normalizeDigits(data.phoneNumber);
      if (savedPhone !== phoneDigits) {
        showNotice('입력한 휴대폰 번호가 가입 정보와 일치하지 않습니다.', 'error');
        return;
      }

      confirmationResult = await signInWithPhoneNumber(
        auth,
        toE164Korea(phoneDigits),
        verifier
      );
    } else {
      confirmationResult = await linkWithPhoneNumber(
        auth.currentUser,
        toE164Korea(phoneDigits),
        verifier
      );
    }

    resetRecaptcha();

    showVerifySection();
    showNotice('인증 코드가 발송되었습니다.', 'success');
    smsCodeEl.focus();

  } catch (e) {
    console.error(e);
    resetRecaptcha();
    showNotice('문자 발송 실패. 다시 시도해주세요.', 'error');
  } finally {
    finishLoading();
    setButtonsLoading(false);
  }
}

async function verifyCode() {
  hideNotice();

  if (!confirmationResult) {
    showNotice('먼저 인증 코드를 요청하세요.', 'error');
    return;
  }

  const code = normalizeDigits(smsCodeEl.value).slice(0, 6);
  if (code.length !== 6) {
    showNotice('6자리 코드를 입력해주세요.', 'error');
    return;
  }

  try {
    setButtonsLoading(true, 'verify');
    startLoading();

    const result = await confirmationResult.confirm(code);
    const user = result.user;

    if (isResetMode) {
      verifiedIdToken = await user.getIdToken(true);
      showResetSection();
      showNotice('휴대폰 인증 완료! 새 비밀번호를 입력해주세요.', 'success');
      return;
    }

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

async function resetPassword() {
  hideNotice();

  if (!isResetMode) return;

  const newPassword = String(newPasswordEl?.value || '').trim();
  const newPasswordConfirm = String(newPasswordConfirmEl?.value || '').trim();

  if (!verifiedIdToken) {
    showNotice('휴대폰 인증을 먼저 완료해주세요.', 'error');
    return;
  }

  if (newPassword.length < 6) {
    showNotice('비밀번호는 6자 이상 입력해주세요.', 'error');
    return;
  }

  if (newPassword !== newPasswordConfirm) {
    showNotice('비밀번호 확인이 일치하지 않습니다.', 'error');
    return;
  }

  try {
    setButtonsLoading(true, 'reset');
    startLoading();

    const env = window.__APP_ENV__ || (location.hostname.includes('dev') ? 'dev' : 'prod');
    const api = API_URL?.[env]?.updatePasswordAfterPhoneReset || API_URL?.updatePasswordAfterPhoneReset;

    if (!api) {
      throw new Error('updatePasswordAfterPhoneReset API가 설정되지 않았습니다.');
    }

    const res = await fetch(api, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        loginId,
        idToken: verifiedIdToken,
        newPassword
      })
    });

    const data = await res.json();

    if (!data?.ok) {
      showNotice(data?.message || '비밀번호 변경에 실패했습니다.', 'error');
      return;
    }

    showNotice('비밀번호가 변경되었습니다. 로그인 화면으로 이동합니다.', 'success');

    await signOut(auth).catch(() => {});

    setTimeout(() => {
      window.location.replace('./index.html');
    }, 900);

  } catch (e) {
    console.error(e);
    showNotice('비밀번호 변경 중 오류가 발생했습니다.', 'error');
  } finally {
    finishLoading();
    setButtonsLoading(false, 'reset');
  }
}

sendCodeBtn.onclick = sendCode;
resendBtn.onclick = sendCode;
verifyCodeBtn.onclick = verifyCode;

if (resetPasswordBtn) {
  resetPasswordBtn.onclick = resetPassword;
}

phoneNumberEl.addEventListener('input', (e) => {
  e.target.value = formatPhoneNumber(e.target.value);
});

smsCodeEl.addEventListener('input', (e) => {
  e.target.value = normalizeDigits(e.target.value).slice(0, 6);
});

if (newPasswordConfirmEl) {
  newPasswordConfirmEl.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      resetPassword();
    }
  });
}

if (newPasswordEl) {
  newPasswordEl.addEventListener('input', updatePasswordResetUi);
}

if (newPasswordConfirmEl) {
  newPasswordConfirmEl.addEventListener('input', updatePasswordResetUi);
}

signOutBtn.onclick = async () => {
  await signOut(auth);
  window.location.replace('./index.html');
};

onAuthStateChanged(auth, async (user) => {
  if (isResetMode) {
    if (signOutBtn) {
      signOutBtn.textContent = '로그인으로';
      signOutBtn.onclick = async () => {
        await signOut(auth).catch(() => {});
        window.location.replace('./index.html');
      };
    }

    showNotice('가입 시 등록한 휴대폰 번호로 본인 인증을 진행해주세요.', 'info');
    return;
  }

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

function getPasswordStrength(password = '') {
  let score = 0;

  if (password.length >= 6) score += 1;
  if (password.length >= 10) score += 1;
  if (/[A-Za-z]/.test(password) && /\d/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;

  if (score <= 1) return 'weak';
  if (score <= 3) return 'medium';
  return 'strong';
}

function updatePasswordResetUi() {
  if (!newPasswordEl || !newPasswordConfirmEl || !resetPasswordBtn) return;

  const pw = String(newPasswordEl.value || '');
  const confirm = String(newPasswordConfirmEl.value || '');
  const strength = getPasswordStrength(pw);

  [pwBar1, pwBar2, pwBar3].forEach((bar) => {
    if (bar) bar.style.background = '#e5e7eb';
  });

  if (passwordStrengthStatus) {
    passwordStrengthStatus.className = 'strength-text';
  }

  if (!pw) {
    passwordStrengthStatus.textContent = '비밀번호 강도를 확인해 주세요.';
  } else if (strength === 'weak') {
    if (pwBar1) pwBar1.style.background = '#dc2626';
    passwordStrengthStatus.classList.add('weak');
    passwordStrengthStatus.textContent = '약함 · 6자 이상, 숫자와 문자를 함께 사용해 주세요.';
  } else if (strength === 'medium') {
    if (pwBar1) pwBar1.style.background = '#b45309';
    if (pwBar2) pwBar2.style.background = '#b45309';
    passwordStrengthStatus.classList.add('medium');
    passwordStrengthStatus.textContent = '보통 · 특수문자까지 포함하면 더 안전합니다.';
  } else {
    if (pwBar1) pwBar1.style.background = '#16a34a';
    if (pwBar2) pwBar2.style.background = '#16a34a';
    if (pwBar3) pwBar3.style.background = '#16a34a';
    passwordStrengthStatus.classList.add('strong');
    passwordStrengthStatus.textContent = '강함 · 안전한 비밀번호입니다.';
  }

  if (!confirm) {
    if (passwordMatchStatus) {
	  passwordMatchStatus.className = 'inline-check';
	}
    passwordMatchStatus.textContent = '';
  } else if (pw === confirm) {
    passwordMatchStatus.className = 'inline-check show success';
    passwordMatchStatus.textContent = '비밀번호가 일치합니다.';
  } else {
    passwordMatchStatus.className = 'inline-check show error';
    passwordMatchStatus.textContent = '비밀번호가 일치하지 않습니다.';
  }

  const canSubmit =
    pw.length >= 6 &&
    confirm.length >= 6 &&
    pw === confirm &&
    strength !== 'weak';

  resetPasswordBtn.disabled = !canSubmit;
}