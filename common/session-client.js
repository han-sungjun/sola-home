const LOGIN_STORAGE_KEY = 'loginUser';
const KEEP_LOGIN_STORAGE_KEY = 'upick_keep_login_state';
const DEFAULT_PING_INTERVAL_MS = 5 * 60 * 1000;
const ADMIN_PING_INTERVAL_MS = 3 * 60 * 1000;
let forcedLogoutProcessing = false;

function shouldKeepLoginState(){
  try{ return localStorage.getItem(KEEP_LOGIN_STORAGE_KEY) === '1'; }catch(_){ return false; }
}

function getSessionStorageArea(){
  return shouldKeepLoginState() ? localStorage : sessionStorage;
}

export function getStoredLoginUser(){
  try{
    const sessionValue = sessionStorage.getItem(LOGIN_STORAGE_KEY);
    if (sessionValue) return JSON.parse(sessionValue || '{}') || {};
  }catch(_){/* noop */}
  try{
    return JSON.parse(localStorage.getItem(LOGIN_STORAGE_KEY) || '{}') || {};
  }catch(_){
    return {};
  }
}

export function saveLoginSession(userLike = {}, sessionId = ''){
  const current = getStoredLoginUser();
  const next = {
    ...current,
    uid: userLike.uid || current.uid || '',
    loginId: userLike.loginId || current.loginId || '',
    nickname: userLike.nickname || current.nickname || '',
    role: userLike.role || userLike.userRole || current.role || 'resident',
    approvalStatus: userLike.approvalStatus || current.approvalStatus || 'approved',
    phoneVerified: userLike.phoneVerified ?? current.phoneVerified ?? true,
    accountStatus: userLike.accountStatus || current.accountStatus || 'active',
    sessionId: sessionId || userLike.sessionId || current.sessionId || '',
  };
  const storage = getSessionStorageArea();
  storage.setItem(LOGIN_STORAGE_KEY, JSON.stringify(next));
  try{
    if (storage === localStorage) sessionStorage.removeItem(LOGIN_STORAGE_KEY);
    else localStorage.removeItem(LOGIN_STORAGE_KEY);
  }catch(_e){}
  return next;
}


export function clearKeepLoginState(){
  try{ localStorage.removeItem(KEEP_LOGIN_STORAGE_KEY); }catch(_e){}
}

export function clearLoginSession(){
  try{ localStorage.removeItem(LOGIN_STORAGE_KEY); }catch(_e){}
  try{ sessionStorage.removeItem(LOGIN_STORAGE_KEY); }catch(_e){}
}

export function getLocalSessionId(){
  return String(getStoredLoginUser().sessionId || '').trim();
}

function getApiUrl(api = {}, kind = 'check'){
  if (kind === 'ping') return api.pingSession || api.sessionPing || '';
  if (kind === 'logout') return api.logoutSession || api.sessionLogout || '';
  return api.checkSession || api.sessionCheck || '';
}

async function getIdToken(auth){
  const user = auth?.currentUser;
  if (!user) return '';
  return await user.getIdToken(false);
}

export async function requestServerSession(auth, api = {}, kind = 'check'){
  const url = getApiUrl(api, kind);
  const sessionId = getLocalSessionId();
  const token = await getIdToken(auth);

  if (!url) {
    return { ok:false, valid:false, reason:'missing_session_api', message:'세션 API 주소가 설정되지 않았습니다.' };
  }
  if (!token || !sessionId) {
    return { ok:false, valid:false, reason: !token ? 'missing_token' : 'missing_session_id', message:'세션 정보가 없습니다.' };
  }

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ sessionId })
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok && !data.reason) data.reason = `http_${res.status}`;
  return data;
}

export async function logoutServerSession(auth, api = {}){
  try{
    const data = await requestServerSession(auth, api, 'logout');
    clearLoginSession();
    return data;
  }catch(error){
    clearLoginSession();
    return { ok:false, valid:false, reason:'logout_request_failed', message:error?.message || String(error) };
  }
}

export function getSessionInvalidMessage(reason = ''){
  if (reason === 'duplicated_login') {
    return '다른 기기 또는 브라우저에서 입장되어 현재 세션이 종료되었습니다.\n계속 이용하시려면 다시 입장해 주세요.';
  }
  if (reason === 'session_expired') {
    return '장시간 활동이 없어 자동 나가기되었습니다.\n계속 이용하시려면 다시 입장해 주세요.';
  }
  if (reason === 'logged_out') {
    return '나가기된 세션입니다.\n다시 입장해 주세요.';
  }
  return '세션이 만료되었습니다.\n다시 입장해 주세요.';
}

export async function handleInvalidSession({ auth, api, reason, signOutFn, redirectTo = '/', alertFn } = {}){
  if (forcedLogoutProcessing) return false;
  forcedLogoutProcessing = true;

  const message = getSessionInvalidMessage(reason);

  // 보안 세션 종료는 사용자가 갑자기 튕겼다고 느끼지 않도록 먼저 안내합니다.
  // 확인 버튼, 바깥 영역 클릭, ESC 등으로 모달이 닫히면 그 다음 단계에서 무조건 나가기합니다.
  if (typeof alertFn === 'function') {
    try{ await alertFn(message); }catch(_e){}
  } else if (typeof window !== 'undefined' && typeof window.showCommonAlert === 'function') {
    try{ await window.showCommonAlert({ message }); }catch(_e){}
  } else if (typeof window !== 'undefined') {
    alert(message);
  }

  clearLoginSession();
  if (reason === 'duplicated_login' || reason === 'abnormal_access' || reason === 'invalid_route_access') {
    clearKeepLoginState();
  }
  try{ if (typeof signOutFn === 'function') await signOutFn(auth); }catch(_e){}

  if (redirectTo) window.location.replace(redirectTo);
  return false;
}

export async function checkServerSessionOrLogout({ auth, api, signOutFn, redirectTo = '/', alertFn } = {}){
  const data = await requestServerSession(auth, api, 'check');
  if (data?.valid) return data;
  await handleInvalidSession({ auth, api, reason:data?.reason, signOutFn, redirectTo, alertFn });
  return data;
}


export function startRealtimeSessionWatcher({
  auth,
  db,
  docFn,
  onSnapshotFn,
  signOutFn,
  redirectTo = '/',
  alertFn,
  userCollection = 'users',
} = {}){
  if (!auth?.currentUser || !db || typeof docFn !== 'function' || typeof onSnapshotFn !== 'function') {
    return () => {};
  }

  let disposed = false;
  let initialSnapshotSeen = false;
  const uid = auth.currentUser.uid;

  const unsubscribe = onSnapshotFn(
    docFn(db, userCollection, uid),
    async (snap) => {
      if (disposed || forcedLogoutProcessing) return;
      if (!snap.exists()) return;

      const data = snap.data() || {};
      const localSessionId = getLocalSessionId();
      const serverSessionId = String(data.activeSessionId || '').trim();
      const status = String(data.sessionStatus || '').trim();

      // 첫 스냅샷도 검사합니다. 이미 다른 브라우저에서 입장된 상태라면
      // 페이지 재진입 즉시 중복 입장을 감지해야 하기 때문입니다.
      initialSnapshotSeen = true;

      if (!localSessionId) return;

      if (serverSessionId && serverSessionId !== localSessionId) {
        disposed = true;
        try{ unsubscribe(); }catch(_e){}
        await handleInvalidSession({
          auth,
          api: {},
          reason: 'duplicated_login',
          signOutFn,
          redirectTo,
          alertFn
        });
        return;
      }

      if (!serverSessionId && (status === 'logout' || status === 'expired')) {
        disposed = true;
        try{ unsubscribe(); }catch(_e){}
        await handleInvalidSession({
          auth,
          api: {},
          reason: status === 'expired' ? 'session_expired' : 'logged_out',
          signOutFn,
          redirectTo,
          alertFn
        });
      }
    },
    (error) => {
      console.warn('[session] realtime watcher skipped', error);
    }
  );

  return () => {
    disposed = true;
    try{ unsubscribe(); }catch(_e){}
  };
}

export function startSessionKeepAlive({
  auth,
  api,
  signOutFn,
  redirectTo = '/',
  alertFn,
  intervalMs = DEFAULT_PING_INTERVAL_MS,
  checkEveryMs = 60 * 1000,
  requireActivity = true,
  adminMode = false,
  db,
  docFn,
  onSnapshotFn,
} = {}){
  let disposed = false;
  let lastPingAt = 0;
  let hasActivity = true;
  let lastActivityAt = Date.now();
  let running = false;
  const minPingMs = Number(intervalMs || (adminMode ? ADMIN_PING_INTERVAL_MS : DEFAULT_PING_INTERVAL_MS));
  const stopRealtimeWatcher = startRealtimeSessionWatcher({
    auth,
    db,
    docFn,
    onSnapshotFn,
    signOutFn,
    redirectTo,
    alertFn
  });

  const markActivity = () => {
    hasActivity = true;
    lastActivityAt = Date.now();
  };

  // 실제 사용 중인데도 30분 만료되는 일을 줄이기 위해 입력/스크롤/터치/포커스 계열 활동을 폭넓게 감지합니다.
  [
    'click',
    'touchstart',
    'touchmove',
    'keydown',
    'keyup',
    'input',
    'change',
    'scroll',
    'wheel',
    'pointerdown',
    'pointermove',
    'mousemove',
    'focus',
    'focusin'
  ].forEach((eventName) => {
    window.addEventListener(eventName, markActivity, { passive:true, capture:true });
  });

  async function tick(forceCheck = false){
    if (disposed || running) return;
    if (document.hidden) return;
    if (!auth?.currentUser) return;
    const now = Date.now();
    const shouldPing = hasActivity && (now - lastPingAt >= minPingMs);

    if (!forceCheck && !shouldPing) return;
    if (requireActivity && !hasActivity && !forceCheck) return;

    running = true;
    try{
      // 활동이 있었고 최소 간격이 지났다면 check보다 ping을 우선해 서버 lastActiveAt를 갱신합니다.
      const kind = shouldPing ? 'ping' : 'check';
      const data = await requestServerSession(auth, api, kind);
      if (!data?.valid) {
        disposed = true;
        await handleInvalidSession({ auth, api, reason:data?.reason, signOutFn, redirectTo, alertFn });
        return;
      }
      if (kind === 'ping') {
        lastPingAt = now;
        hasActivity = false;
      }
    }catch(error){
      console.warn('[session] keep-alive skipped', error);
    }finally{
      running = false;
    }
  }

  // checkTimer: 중복 입장/강제 만료 감지용. DB 업데이트 없이 activeSessionId만 확인합니다.
  // pingTimer: 실제 사용 중인 세션 유지용. 활동이 있었고 최소 간격이 지났을 때만 DB를 갱신합니다.
  const safeCheckMs = Math.max(30 * 1000, Number(checkEveryMs || 60 * 1000));
  const checkTimer = window.setInterval(() => tick(true), safeCheckMs);
  const pingTimer = window.setInterval(() => tick(false), 60 * 1000);

  const onVisibilityChange = () => {
    if (!document.hidden) {
      hasActivity = true;
      tick(true);
    }
  };
  const onPageShow = () => tick(true);

  document.addEventListener('visibilitychange', onVisibilityChange);
  window.addEventListener('pageshow', onPageShow);
  tick(true);

  return () => {
    disposed = true;
    window.clearInterval(checkTimer);
    window.clearInterval(pingTimer);
    document.removeEventListener('visibilitychange', onVisibilityChange);
    window.removeEventListener('pageshow', onPageShow);
    [
      'click','touchstart','touchmove','keydown','keyup','input','change','scroll','wheel',
      'pointerdown','pointermove','mousemove','focus','focusin'
    ].forEach((eventName) => {
      window.removeEventListener(eventName, markActivity, { capture:true });
    });
    try{ stopRealtimeWatcher(); }catch(_e){}
  };
}
