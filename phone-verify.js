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

const APP_PATH = '/app';
const LOGIN_PATH = '/';

let loadingCount = 0;
let confirmationResult = null;
let recaptchaVerifier = null;
let verifiedIdToken = '';
let isSendingCode = false;
let isVerifyingCode = false;
let isRedirecting = false;

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
  if (!noticeEl) return;
  noticeEl.className = `notice show ${type}`;
  noticeEl.textContent = message;
}

function hideNotice() {
  if (!noticeEl) return;
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
    if (sendCodeBtn) {
      sendCodeBtn.disabled = isLoading;
      sendCodeBtn.textContent = isLoading ? '전송 중...' : '문자 인증 시작';
    }
    if (resendBtn) resendBtn.disabled = isLoading;
  } else if (type === 'verify') {
    if (verifyCodeBtn) {
      verifyCodeBtn.disabled = isLoading;
      verifyCodeBtn.textContent = isLoading ? '확인 중...' : '인증 확인';
    }
  } else if (type === 'reset') {
    if (resetPasswordBtn) {
      resetPasswordBtn.disabled = isLoading;
      resetPasswordBtn.textContent = isLoading ? '변경 중...' : '비밀번호 변경';
    }
  }
}

function showVerifySection() {
  if (!verifySection) return;
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
  if (container) container.innerHTML = '';

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

function hasPhoneProvider(user) {
  return !!user?.providerData?.some((provider) => provider.providerId === 'phone');
}

async function markPhoneVerifiedAndGo(user, phoneNumber = '') {
  if (!user || isRedirecting) return;
  isRedirecting = true;

  showNotice('이미 인증된 계정입니다. 앱으로 이동합니다.', 'success');

  try {
    await user.reload();
  } catch (e) {
    console.warn('[phone-verify] user reload failed:', e);
  }

  try {
    const payload = {
      phoneVerified: true,
      phoneVerifiedAt: serverTimestamp()
    };

    const digits = normalizeDigits(phoneNumber || phoneNumberEl?.value || '');
    if (digits) payload.phoneNumber = digits;

    await updateDoc(doc(db, 'users', user.uid), payload);
  } catch (e) {
    console.warn('[phone-verify] Firestore phoneVerified update failed. Redirect continues:', e);
  }

  window.setTimeout(() => {
    window.location.href = APP_PATH;
  }, 450);
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

  if (isSendingCode || isRedirecting) return;

  if (isResetMode && !loginId) {
    showNotice('비밀번호를 재설정할 아이디 정보가 없습니다. 로그인 화면에서 다시 진행해주세요.', 'error');
    return;
  }

  if (!isResetMode) {
    const user = auth.currentUser;
    if (!user) {
      window.location.replace(LOGIN_PATH);
      return;
    }

    try {
      await user.reload();
    } catch (e) {
      console.warn('[phone-verify] user reload before send failed:', e);
    }

    const refreshedUser = auth.currentUser || user;
    if (hasPhoneProvider(refreshedUser)) {
      await markPhoneVerifiedAndGo(refreshedUser, phoneNumberEl?.value || '');
      return;
    }
  }

  const phoneDigits = normalizeDigits(phoneNumberEl?.value || '');
  if (phoneNumberEl) phoneNumberEl.value = formatPhoneNumber(phoneDigits);

  if (phoneDigits.length < 10) {
    showNotice('휴대폰 번호를 정확히 입력해주세요.', 'error');
    return;
  }

  try {
    isSendingCode = true;
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
    smsCodeEl?.focus();

  } catch (e) {
    console.error('[phone-verify] sendCode failed:', e);
    resetRecaptcha();

    const code = e?.code || '';
    if (!isResetMode && code === 'auth/provider-already-linked') {
      await markPhoneVerifiedAndGo(auth.currentUser, phoneNumberEl?.value || '');
      return;
    }

    if (code === 'auth/credential-already-in-use') {
      showNotice('이미 다른 계정에서 사용 중인 휴대폰 번호입니다. 관리자에게 문의해주세요.', 'error');
      return;
    }

    if (code === 'auth/too-many-requests') {
      showNotice('인증 요청이 너무 많습니다. 잠시 후 다시 시도해주세요.', 'error');
      return;
    }

    if (code === 'auth/invalid-phone-number') {
      showNotice('휴대폰 번호 형식이 올바르지 않습니다.', 'error');
      return;
    }

    showNotice('문자 발송 실패. 다시 시도해주세요.', 'error');
  } finally {
    finishLoading();
    setButtonsLoading(false);
    isSendingCode = false;
  }
}

async function verifyCode() {
  hideNotice();

  if (isVerifyingCode || isRedirecting) return;

  if (!confirmationResult) {
    showNotice('먼저 인증 코드를 요청하세요.', 'error');
    return;
  }

  const code = normalizeDigits(smsCodeEl?.value || '').slice(0, 6);
  if (code.length !== 6) {
    showNotice('6자리 코드를 입력해주세요.', 'error');
    return;
  }

  try {
    isVerifyingCode = true;
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

    await markPhoneVerifiedAndGo(user, phoneNumberEl?.value || '');

  } catch (e) {
    console.error('[phone-verify] verifyCode failed:', e);
    const code = e?.code || '';

    if (code === 'auth/invalid-verification-code') {
      showNotice('인증 코드가 올바르지 않습니다.', 'error');
      return;
    }

    if (code === 'auth/code-expired') {
      showNotice('인증 코드가 만료되었습니다. 코드를 다시 받아주세요.', 'error');
      confirmationResult = null;
      return;
    }

    showNotice('인증 확인 중 오류가 발생했습니다. 다시 시도해주세요.', 'error');
  } finally {
    finishLoading();
    setButtonsLoading(false, 'verify');
    isVerifyingCode = false;
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
      window.location.replace(LOGIN_PATH);
    }, 900);

  } catch (e) {
    console.error('[phone-verify] resetPassword failed:', e);
    showNotice('비밀번호 변경 중 오류가 발생했습니다.', 'error');
  } finally {
    finishLoading();
    setButtonsLoading(false, 'reset');
  }
}

if (sendCodeBtn) sendCodeBtn.onclick = sendCode;
if (resendBtn) resendBtn.onclick = sendCode;
if (verifyCodeBtn) verifyCodeBtn.onclick = verifyCode;
if (resetPasswordBtn) resetPasswordBtn.onclick = resetPassword;

if (phoneNumberEl) {
  phoneNumberEl.addEventListener('input', (e) => {
    e.target.value = formatPhoneNumber(e.target.value);
  });
}

if (smsCodeEl) {
  smsCodeEl.addEventListener('input', (e) => {
    e.target.value = normalizeDigits(e.target.value).slice(0, 6);
  });
}

if (newPasswordConfirmEl) {
  newPasswordConfirmEl.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') resetPassword();
  });
}

if (newPasswordEl) newPasswordEl.addEventListener('input', updatePasswordResetUi);
if (newPasswordConfirmEl) newPasswordConfirmEl.addEventListener('input', updatePasswordResetUi);

if (signOutBtn) {
  signOutBtn.onclick = async () => {
    await signOut(auth).catch(() => {});
    window.location.replace(LOGIN_PATH);
  };
}

onAuthStateChanged(auth, async (user) => {
  if (isRedirecting) return;

  if (isResetMode) {
    if (signOutBtn) {
      signOutBtn.textContent = '로그인으로';
      signOutBtn.onclick = async () => {
        await signOut(auth).catch(() => {});
        window.location.replace(LOGIN_PATH);
      };
    }

    showNotice('가입 시 등록한 휴대폰 번호로 본인 인증을 진행해주세요.', 'info');
    return;
  }

  if (!user) {
    window.location.replace(LOGIN_PATH);
    return;
  }

  try {
    await user.reload();
  } catch (e) {
    console.warn('[phone-verify] user reload on auth state failed:', e);
  }

  const refreshedUser = auth.currentUser || user;

  if (hasPhoneProvider(refreshedUser)) {
    await markPhoneVerifiedAndGo(refreshedUser, phoneNumberEl?.value || '');
    return;
  }

  try {
    const data = await loadUser(refreshedUser);

    if (data?.phoneVerified) {
      showNotice('이미 인증된 계정입니다. 앱으로 이동합니다.', 'success');
      isRedirecting = true;
      setTimeout(() => {
        window.location.href = APP_PATH;
      }, 450);
      return;
    }

    if (data?.phoneNumber && phoneNumberEl) {
      phoneNumberEl.value = formatPhoneNumber(data.phoneNumber);
    }

    showNotice('휴대폰 인증을 진행해주세요.', 'info');
  } catch (e) {
    console.error('[phone-verify] user data load failed:', e);
    showNotice('사용자 정보를 확인하는 중 오류가 발생했습니다. 다시 시도해주세요.', 'error');
  }
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
  }

  if (passwordMatchStatus) {
    if (!confirm) {
      passwordMatchStatus.className = 'inline-check';
      passwordMatchStatus.textContent = '';
    } else if (pw === confirm) {
      passwordMatchStatus.className = 'inline-check show success';
      passwordMatchStatus.textContent = '비밀번호가 일치합니다.';
    } else {
      passwordMatchStatus.className = 'inline-check show error';
      passwordMatchStatus.textContent = '비밀번호가 일치하지 않습니다.';
    }
  }

  const canSubmit =
    pw.length >= 6 &&
    confirm.length >= 6 &&
    pw === confirm &&
    strength !== 'weak';

  resetPasswordBtn.disabled = !canSubmit;
}
