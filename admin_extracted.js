

    import { initializeApp, getApps, getApp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
    import { getAuth, onAuthStateChanged, signInWithCustomToken, signOut, setPersistence, browserLocalPersistence } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';
    import { getFirestore, collection, addDoc, updateDoc, deleteDoc, doc, getDoc, getDocs, setDoc, serverTimestamp, writeBatch, query, where, orderBy, limit, startAfter, startAt, endAt, terminate, clearIndexedDbPersistence, onSnapshot } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';
    import { getMessaging, onMessage } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging.js';
    import { getStorage, ref as storageRef, uploadBytesResumable, getDownloadURL, deleteObject } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js';

    const __SOLA_DYNAMIC_IMPORT_VERSION__ = globalThis.__SOLA_DYNAMIC_IMPORT_VERSION__ || (() => {
      const d = new Date();
      const pad = (n, len = 2) => String(n).padStart(len, '0');
      return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}${pad(d.getMilliseconds(), 3)}`;
    })();
    globalThis.__SOLA_DYNAMIC_IMPORT_VERSION__ = __SOLA_DYNAMIC_IMPORT_VERSION__;
    const __solaNoCache = (url) => `${url}${url.includes('?') ? '&' : '?'}v=${__SOLA_DYNAMIC_IMPORT_VERSION__}`;
    const { mountIdleTimer } = await import(__solaNoCache("/common/tracking.js"));
    const { ENV, FIREBASE_CONFIG, API_URL, TTS_SERVICE_URL } = await import(__solaNoCache("/common/env-config.js"));
    const { checkServerSessionOrLogout, startSessionKeepAlive, logoutServerSession, saveLoginSession } = await import(__solaNoCache("/common/session-client.js"));

    function hasStoredLoginSessionForAdminEntry(){
      try { if (sessionStorage.getItem('loginUser')) return true; } catch (_) {}
      try { if (localStorage.getItem('loginUser')) return true; } catch (_) {}
      return false;
    }
    if (!hasStoredLoginSessionForAdminEntry()) {
      try { localStorage.removeItem('upick_keep_login_state'); } catch (_) {}
      try { sessionStorage.removeItem('pendingDeepLink'); } catch (_) {}
      window.location.replace('/');
      throw new Error('admin_direct_access_redirect');
    }

    const envBadge = document.getElementById('envBadge');
    if (envBadge && ENV === 'dev') envBadge.classList.add('show');
    const firebaseConfig = FIREBASE_CONFIG[ENV];
    const BENEFITS_COLLECTION='benefits', NOTICES_COLLECTION='notices', PUSH_JOBS_COLLECTION='push_jobs', USERS_COLLECTION='users', BENEFIT_STATS_COLLECTION='benefit_stats';
    const LOGIN_FUNCTION_URL = API_URL[ENV].login;
    // Firebase Functions geocodeAddress 엔드포인트입니다. 배포 후 dev/prod URL을 입력하세요.
    // 예: https://geocodeaddress-l6mntiaxgq-du.a.run.app
    const GEOCODE_FUNCTION_URL = (API_URL?.[ENV]?.geocodeAddress || '').trim();
    const TTS_SERVICE_BASE_URL = (TTS_SERVICE_URL?.[ENV] || '').trim();
    const DEFAULT_BENEFITS=[{name:'엘스킨케어',category:'피부관리',discountValue:50,discountText:'50%',condition:'첫방문 50% / 입주민 정액권 최대 30%',address:'경기 파주시 경의로 1242 209호, 210호',phone:'0507-1433-5760',url:'',visible:true,recommended:true,service:false},{name:'미스터피자 일산탄현점',category:'음식',discountValue:30,discountText:'30%',condition:'포장 30% / 매장식사 20% + 샐러드 증정',address:'경기 고양시 일산서구 탄현로 136 상가동 2층 204호',phone:'031-911-9296',url:'',visible:true,recommended:true,service:false}];
    const state={benefits:[],benefitStats:{},notices:[],pushJobs:[],members:[],isAdmin:false,view:'dashboard',adminProfile:null};
    const MEMBER_PAGE_SIZE = 50;
    const memberPaging = { active: 1, withdrawn: 1 };
    let benefitSortMode='latest'; let adminDataSubscribed=false; let adminAuthReady=false; const qs=(s)=>document.querySelector(s), qsa=(s)=>[...document.querySelectorAll(s)];

    function setAdminDashboardLocked(locked=true){
      const isLocked = !!locked;
      const root = document.querySelector('.app, main, #adminApp') || document.body;
      document.documentElement.classList.toggle('admin-dashboard-locked', isLocked);
      document.body.classList.toggle('admin-dashboard-locked', isLocked);
      if(root) root.classList.toggle('admin-dashboard-locked', isLocked);
      const targets = [
        '#adminStatsCards', '#dashboardBenefitList', '#dashboardNoticeList', '#userActivityList',
        '#recentActivityList', '#security404Box', '#communityReportTopList',
        '#visitPathChartCanvas', '#loginStatsChartCanvas', '#visitPathChartPlaceholder', '#loginStatsChartPlaceholder'
      ];
      targets.forEach((selector)=>{
        const el = document.querySelector(selector);
        if(!el) return;
        el.classList.toggle('admin-locked', isLocked);
        if(isLocked){
          el.setAttribute('aria-disabled','true');
          el.style.pointerEvents = 'none';
        }else{
          el.removeAttribute('aria-disabled');
          el.style.pointerEvents = '';
        }
      });
      const loginPanel = document.getElementById('adminLoginPanel') || document.querySelector('.admin-login-panel');
      if(loginPanel) loginPanel.classList.toggle('is-locked-mode', isLocked);
    }

    globalThis.setAdminDashboardLocked = globalThis.setAdminDashboardLocked || setAdminDashboardLocked;

    function canReadAdminData(){
      return !!(auth?.currentUser && state.isAdmin && db);
    }


    function pickAuditTimestampValue(...values){
      for(const value of values){
        if(value === undefined || value === null || value === '') continue;
        if(typeof value === 'number' && Number.isFinite(value)) return value;
        if(value instanceof Date) return value.getTime();
        if(typeof value?.toMillis === 'function'){
          const ms=value.toMillis();
          if(Number.isFinite(ms)) return ms;
        }
        if(typeof value?.toDate === 'function'){
          const date=value.toDate();
          const ms=date?.getTime?.();
          if(Number.isFinite(ms)) return ms;
        }
        if(typeof value === 'object' && Number.isFinite(value.seconds)) return value.seconds * 1000;
        const parsed=Date.parse(String(value).replace(/\./g,'-'));
        if(Number.isFinite(parsed)) return parsed;
      }
      return 0;
    }

    function normalizeArrayAuditFields(row={}){
      return {
        createdAt:pickAuditTimestampValue(row.createdAt,row.createdDate,row.createdAtMs,row.registeredAt,row.registeredDate,row.date),
        registeredAt:pickAuditTimestampValue(row.registeredAt,row.registeredDate,row.createdAt,row.createdDate,row.createdAtMs,row.date),
        updatedAt:pickAuditTimestampValue(row.updatedAt,row.updatedDate,row.updatedAtMs),
        createdByUid:String(row.createdByUid||row.createdBy||row.registeredByUid||row.registeredBy||'').trim(),
        createdByName:String(row.createdByName||row.createdByNickname||row.createdByDisplayName||row.createdByEmail||row.registeredByName||row.registeredByNickname||'').trim(),
        registeredByUid:String(row.registeredByUid||row.registeredBy||row.createdByUid||row.createdBy||'').trim(),
        registeredByName:String(row.registeredByName||row.registeredByNickname||row.registeredByDisplayName||row.registeredByEmail||row.createdByName||row.createdByNickname||'').trim(),
        updatedByUid:String(row.updatedByUid||row.updatedBy||'').trim(),
        updatedByName:String(row.updatedByName||row.updatedByNickname||row.updatedByDisplayName||row.updatedByEmail||'').trim()
      };
    }

    function getAdminAuditActor(){
      const user=auth?.currentUser || {};
      const profile=state.adminProfile || {};
      const uid=String(user.uid || profile.uid || profile.id || '').trim();
      const name=String(profile.nickname || profile.name || profile.displayName || user.displayName || user.email || uid || '관리자').trim();
      return { uid, name };
    }

    function getEditingBenefitSnapshot(){
      const editId=String(qs('#editId')?.value || '').trim();
      if(!editId) return null;
      return (state.benefits || []).find(item => String(item.id||'') === editId) || null;
    }

    function arrayAuditIdentity(row={}){
      return [
        row.id,row.key,row.title,row.name,row.label,row.url,row.link,row.href,row.imageUrl,row.date,row.startedAt,row.endedAt
      ].map(v=>String(v||'').trim().toLowerCase()).filter(Boolean).join('|');
    }

    function findPreviousAuditRow(row={}, previousRows=[], index=0){
      if(!Array.isArray(previousRows) || !previousRows.length) return null;
      const key=arrayAuditIdentity(row);
      if(key){
        const matched=previousRows.find(prev => arrayAuditIdentity(prev) === key);
        if(matched) return matched;
      }
      return previousRows[index] || null;
    }

    function applyAuditToArrayRows(rows=[], previousRows=[], nowMs=Date.now(), actor=getAdminAuditActor()){
      const safeRows=Array.isArray(rows) ? rows : [];
      const safePrevious=Array.isArray(previousRows) ? previousRows : [];
      const safeNow=Number.isFinite(nowMs) ? nowMs : Date.now();
      const uid=String(actor?.uid || '').trim();
      const name=String(actor?.name || '관리자').trim();
      return safeRows.map((row,index)=>{
        const previous=findPreviousAuditRow(row, safePrevious, index) || {};
        const prevAudit=normalizeArrayAuditFields(previous);
        const rowAudit=normalizeArrayAuditFields(row);
        const createdAt=rowAudit.createdAt || prevAudit.createdAt || safeNow;
        const registeredAt=rowAudit.registeredAt || prevAudit.registeredAt || createdAt;
        const createdByUid=rowAudit.createdByUid || prevAudit.createdByUid || uid;
        const createdByName=rowAudit.createdByName || prevAudit.createdByName || name;
        const registeredByUid=rowAudit.registeredByUid || prevAudit.registeredByUid || createdByUid || uid;
        const registeredByName=rowAudit.registeredByName || prevAudit.registeredByName || createdByName || name;
        return {
          ...row,
          createdAt,
          registeredAt,
          updatedAt:safeNow,
          createdByUid,
          createdByName,
          registeredByUid,
          registeredByName,
          updatedByUid:uid,
          updatedByName:name
        };
      });
    }

    function requireAdminDataAccess(renderLocked=true){
      if(canReadAdminData()) return true;
      if(renderLocked) setAdminDashboardLocked(true);
      return false;
    }

    function closeAdminModals(){
      document.querySelectorAll('dialog[open]').forEach((dialog)=>{
        try{ dialog.close(); }catch(_){ dialog.removeAttribute('open'); }
      });
      document.querySelectorAll('.app-alert.show,.gnb-overlay.show,.gnb-sheet.show').forEach((el)=>el.classList.remove('show'));
      document.body.classList.remove('gnb-open');
    }

    function resetAdminRuntimeState(){
      state.benefits=[];
      state.benefitStats={};
      state.notices=[];
      state.pushJobs=[];
      state.members=[];
      memberPaging.active = 1;
      memberPaging.withdrawn = 1;
      state.isAdmin=false;
      state.adminProfile=null;
      state.view='dashboard';
      adminDataSubscribed=false;
      benefitSortMode='latest';
    }

    
    function updateAdminLoginControls(isLoggedIn=false){
      const loginBtn = qs('#loginBtn');
      const logoutBtn = qs('#logoutBtn');
      const loginIdInput = qs('#adminLoginId');
      const passwordInput = qs('#adminPassword');

      if(loginBtn){
        loginBtn.disabled = !!isLoggedIn;
        loginBtn.classList.toggle('hidden', !!isLoggedIn);
        loginBtn.setAttribute('aria-hidden', isLoggedIn ? 'true' : 'false');
        loginBtn.tabIndex = isLoggedIn ? -1 : 0;
      }

      if(logoutBtn){
        logoutBtn.disabled = !isLoggedIn;
        logoutBtn.classList.toggle('hidden', !isLoggedIn);
        logoutBtn.setAttribute('aria-hidden', isLoggedIn ? 'false' : 'true');
        logoutBtn.tabIndex = isLoggedIn ? 0 : -1;
      }

      [loginIdInput, passwordInput].forEach((input) => {
        if(!input) return;
        input.disabled = !!isLoggedIn;
        input.classList.toggle('admin-login-disabled-input', !!isLoggedIn);
      });

      if(isLoggedIn && passwordInput) passwordInput.value = '';
    }

function resetAdminSensitiveUI(){
      closeAdminModals();
      resetAdminRuntimeState();
      localStorage.removeItem('loginUser');
      sessionStorage.removeItem('loginUser');

      const setText=(selector,text)=>{ const el=qs(selector); if(el) el.textContent=text; };
      const setHtml=(selector,html)=>{ const el=qs(selector); if(el) el.innerHTML=html; };

      setText('#authStatusText','로그인 필요');
      setText('#adminTopUser','로그인 필요');
      setText('#adminTopStatus','관리자 로그인 필요');
      setText('.stat-max','0%');
      setText('.stat-count','0');
      setText('.stat-cat','0');

      setHtml('#adminList','<div class="notice">관리자 로그인 후 혜택 목록을 볼 수 있습니다.</div>');
      setHtml('#dashboardBenefitList','<div class="notice">관리자 로그인 후 혜택 목록을 볼 수 있습니다.</div>');
      setHtml('#noticeAdminList','<div class="notice">관리자 로그인 후 공지 목록을 볼 수 있습니다.</div>');
      setHtml('#dashboardNoticeList','<div class="notice">관리자 로그인 후 공지 목록을 볼 수 있습니다.</div>');
      setHtml('#pushJobList','<div class="notice">관리자 로그인 후 푸시 작업을 볼 수 있습니다.</div>');
      setHtml('#memberActiveList','<div class="member-empty">관리자 로그인 후 회원 목록을 볼 수 있습니다.</div>');
      setHtml('#memberActivePagination','');
      setHtml('#memberWithdrawnList','<div class="member-empty">관리자 로그인 후 탈퇴 회원 목록을 볼 수 있습니다.</div>');
      setHtml('#memberWithdrawnPagination','');
      setHtml('#adminCommunityList','<div class="member-empty">관리자 로그인 후 커뮤니티 관리 내역을 볼 수 있습니다.</div>');
      setHtml('#communityReportTopList','<div class="notice">관리자 로그인 후 신고 누적 게시글을 볼 수 있습니다.</div>');
      setHtml('#aiFaqList','<div class="ai-empty">관리자 로그인 후 AI FAQ를 볼 수 있습니다.</div>');
      setHtml('#aiBookletList','<div class="ai-empty">관리자 로그인 후 전자책 데이터를 볼 수 있습니다.</div>');
      setHtml('#aiGuideList','<div class="ai-empty">관리자 로그인 후 생활 가이드 데이터를 볼 수 있습니다.</div>');
      setHtml('#aiLogList','<div class="ai-empty">관리자 로그인 후 AI 질문 로그를 볼 수 있습니다.</div>');
      setHtml('#aiConversationList','<div class="ai-empty">관리자 로그인 후 대화 로그를 볼 수 있습니다.</div>');

      qsa('.admin-view').forEach(v=>v.classList.remove('active'));
      qs('#view-dashboard')?.classList.add('active');
      qsa('[data-admin-view]').forEach(btn=>btn.classList.toggle('active', btn.dataset.adminView==='dashboard'));

      const idleHost=document.getElementById('adminIdleTimerHost');
      if(idleHost){ idleHost.innerHTML=''; idleHost.classList.add('hidden'); }
      updateAdminLoginControls(false);
      setAdminDashboardLocked(true);
    }

    async function clearAdminFirestoreCacheAndReload(){
      // Firestore 오프라인 캐시가 켜져 있었던 경우를 대비한 완전 정리 루틴입니다.
      // terminate 후 clearIndexedDbPersistence를 시도하고, 재사용 안전성을 위해 페이지를 새로 로드합니다.
      try{
        if(db) await terminate(db);
      }catch(error){
        console.warn('Firestore terminate skip', error);
      }
      try{
        if(db) await clearIndexedDbPersistence(db);
      }catch(error){
        console.warn('Firestore IndexedDB cache clear skip', error);
      }
      location.replace('/admin');
    }

    async function secureAdminSignOut(){
      resetAdminSensitiveUI();
      try{
        if(auth) { await logoutServerSession(auth, API_URL[ENV]); await signOut(auth); }
      }catch(error){
        console.warn('Firebase signOut skip', error);
      }
      await clearAdminFirestoreCacheAndReload();
    }

    function escapeHtml(value){
      return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    }

    function escapeAttr(value){
      return escapeHtml(value);
    }

    function valueToText(value){
      if(value === null || value === undefined) return '';
      if(typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') return String(value);
      if(Array.isArray(value)) return value.map(valueToText).filter(Boolean).join(', ');
      if(typeof value === 'object'){
        const preferred = ['text','content','description','desc','title','name','label','value','amount','condition','benefit','address','answer','question'];
        const parts = [];
        preferred.forEach((key) => {
          if(value[key] !== undefined){
            const t = valueToText(value[key]);
            if(t) parts.push(t);
          }
        });
        if(parts.length) return parts.join(' ');
        return Object.values(value).map(valueToText).filter(Boolean).join(' ');
      }
      return String(value);
    }
    const globalLoadingBar = qs('#globalLoadingBar');
    let globalLoadingTimer = null;
    const initialLoadState = { benefits:false, notices:false, pushJobs:false, users:false };
	

    function showGlobalLoading(){
      if(!globalLoadingBar) return;
      clearTimeout(globalLoadingTimer);
      globalLoadingBar.classList.add('show');
      globalLoadingBar.setAttribute('aria-hidden', 'false');
    }

    function hideGlobalLoading(delay=160){
      if(!globalLoadingBar) return;
      clearTimeout(globalLoadingTimer);
      globalLoadingTimer = setTimeout(() => {
        globalLoadingBar.classList.remove('show');
        globalLoadingBar.setAttribute('aria-hidden', 'true');
      }, delay);
    }

    const alertEl = qs('#appAlert');
    const alertMsgEl = qs('#appAlertMessage');
    const alertTitleEl = qs('#appAlertTitle');
    const alertIconEl = qs('#appAlertIcon');
    const alertConfirmEl = qs('#appAlertConfirm');
    const alertCancelEl = qs('#appAlertCancel');
    let alertFocusTarget = null;
    let alertResolver = null;

    function openModalBase({
      title='안내',
      message='',
      focusTarget=null,
      mode='alert',
      confirmText='확인',
      cancelText='취소',
      icon=''
    } = {}){
      alertFocusTarget = focusTarget;
      alertTitleEl.textContent = title;
      alertMsgEl.textContent = message;
      alertIconEl.textContent = icon;
      alertConfirmEl.textContent = confirmText;
      alertCancelEl.textContent = cancelText;
      alertCancelEl.classList.toggle('hidden', mode !== 'confirm');
      alertEl.classList.add('show');
      alertEl.setAttribute('aria-hidden', 'false');
      requestAnimationFrame(() => {
        (mode === 'confirm' ? alertCancelEl : alertConfirmEl).focus();
      });
      return new Promise((resolve) => {
        alertResolver = resolve;
      });
    }

    function focusAfterCommonAlert(target){
      if(target && typeof target.focus === 'function'){
        try{ target.focus({preventScroll:true}); }catch(_){ try{ target.focus(); }catch(__){} }
      }
    }

    function openModalAlert(message, focusTarget=null, title='안내'){
      const engine = window.UpickAlert || {};
      const alertFn = engine.alert || window.showCommonAlert || window.showAlert;
      if(typeof alertFn === 'function'){
        return alertFn({
          title,
          message,
          confirmText:'확인',
          onClose:() => focusAfterCommonAlert(focusTarget)
        });
      }
      return openModalBase({ title, message, focusTarget, mode:'alert', confirmText:'확인', icon:'' });
    }

    function openModalConfirm(message, focusTarget=null, title='확인', confirmText='확인', cancelText='취소'){
      const engine = window.UpickAlert || {};
      const confirmFn = engine.confirm || window.showCommonConfirm || window.showConfirm;
      if(typeof confirmFn === 'function'){
        return confirmFn({
          title,
          message,
          confirmText,
          cancelText,
          onCancel:() => focusAfterCommonAlert(focusTarget)
        });
      }
      return openModalBase({ title, message, focusTarget, mode:'confirm', confirmText, cancelText, icon:'' });
    }

    async function closeModal(result=false){
      // 관리자 페이지의 예전 로컬 알럿 닫힘 이벤트는 공통 div 알럿 엔진이 있으면 동작하지 않습니다.
      // 공통 엔진이 fade-out 완료 후 콜백/focus 이동까지 단독으로 처리해야 애니메이션이 끊기지 않습니다.
      if(window.UpickAlert && typeof window.UpickAlert.alert === 'function') return;
      if(!alertEl || alertEl.dataset.upickClosing === '1') return;
      alertEl.dataset.upickClosing = '1';
      alertConfirmEl.disabled = true;
      if(alertCancelEl) alertCancelEl.disabled = true;

      const focusTarget = alertFocusTarget;
      const resolver = alertResolver;
      alertResolver = null;
      alertFocusTarget = null;

      const restoreFocus = () => {
        if (focusTarget) {
          setTimeout(() => {
            try { focusTarget.focus({preventScroll:true}); } catch (_) { try { focusTarget.focus(); } catch (__) {} }
          }, 30);
        }
      };

      try {
        if(window.UpickMotion && typeof window.UpickMotion.close === 'function'){
          await window.UpickMotion.close(alertEl, {
            activeClass: 'show',
            panel: alertEl.querySelector('.app-alert-card'),
            duration: 360,
            afterClose: () => alertEl.setAttribute('aria-hidden', 'true')
          });
        }else{
          alertEl.classList.remove('show');
          await new Promise((done)=>setTimeout(done, 360));
          alertEl.setAttribute('aria-hidden', 'true');
        }
      } finally {
        alertEl.dataset.upickClosing = '0';
        alertConfirmEl.disabled = false;
        if(alertCancelEl) alertCancelEl.disabled = false;
        restoreFocus();
        if(resolver) resolver(result);
      }
    }

    alertConfirmEl?.addEventListener('click', () => { if(window.UpickAlert && typeof window.UpickAlert.alert === 'function') return; closeModal(true); });
    alertCancelEl?.addEventListener('click', () => { if(window.UpickAlert && typeof window.UpickAlert.alert === 'function') return; closeModal(false); });
    // 바깥 영역 클릭 닫힘 방지: 명시 버튼으로만 닫습니다.
window.addEventListener('keydown', (event) => {
      if(window.UpickAlert && typeof window.UpickAlert.alert === 'function') return;
      if(!alertEl?.classList.contains('show')) return;
      if(event.key === 'Escape') closeModal(false);
    });


    function bindGlobalLoadingTriggers(){
      // 관리자 페이지는 실제 데이터 처리 시에만 로더를 사용합니다.
    }


    function markInitialDataLoaded(key){
      if(!(key in initialLoadState)) return;
      initialLoadState[key] = true;
      if(Object.values(initialLoadState).every(Boolean)){
        hideGlobalLoading(120);
      }
    }

const setTextAll = (selector, text) => qsa(selector).forEach(el => el.textContent = text);
    function updateAdminHeader(user){
      const loginLabel = state.adminProfile?.loginId || user?.email || '관리자 확인 중';
      qs('#adminTopUser').textContent = loginLabel;
      qs('#adminTopStatus').textContent = state.isAdmin ? '관리자 로그인됨' : (user ? '관리자 권한 확인 필요' : '로그인 필요');
    }
    function syncAdminNavActive(view){
      qsa('.admin-nav-btn').forEach(btn => btn.classList.toggle('active', btn.dataset.adminView === view));
      qsa('.gnb-chip, .gnb-menu-item, .gnb-menu-subitem').forEach(btn => {
        const isActive = btn.dataset.adminView === view;
        btn.classList.toggle('active', !!isActive);
        const badge = btn.querySelector('.gnb-active-badge');
        if(badge) badge.hidden = !isActive;
      });
      qsa('.gnb-icon-btn[data-admin-view]').forEach(btn => btn.classList.toggle('gnb-home-active', btn.dataset.adminView === view));
    }
    function changeAdminView(view){
      if(!view) return;
      state.view = view;
      qsa('.admin-view').forEach(el => el.classList.remove('active'));
      (qs(`#view-${view}`) || qs('#view-dashboard'))?.classList.add('active');
      syncAdminNavActive(view);
      const openAdminGnbSheet = qs('#adminGnbSheet');
      const openAdminGnbOverlay = qs('#adminGnbOverlay');
      if(openAdminGnbSheet?.classList.contains('show') || openAdminGnbOverlay?.classList.contains('show')){
        if(typeof closeAdminGnb === 'function') closeAdminGnb();
        else{
          openAdminGnbSheet?.classList.remove('show');
          openAdminGnbOverlay?.classList.remove('show');
          document.body.style.overflow = '';
          document.body.classList.remove('gnb-open');
        }
      }
      window.scrollTo({ top: 0, behavior: 'auto' });
      if(view === 'community') setTimeout(() => loadAdminCommunityPosts('active'), 80);
      if(view === 'ai') setTimeout(() => openAIManager(aiAdminState.tab || 'faq'), 80);
    }
    window.changeAdminView = changeAdminView;



    /* =========================
       Admin Community v1
    ========================= */
    const COMMUNITY_POSTS_COLLECTION = 'community_posts';
    const COMMUNITY_REPORTS_COLLECTION = 'community_reports';
    function fmtAdminCommunityDate(value){ try{ const d=value?.toDate?value.toDate():(value?new Date(value):null); return d?d.toLocaleString('ko-KR',{month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit'}):''; }catch(_){ return ''; } }

    async function loadCommunityReportTopPosts(){
      if(!requireAdminDataAccess()) return; const list = qs('#communityReportTopList'); const count = qs('#communityReportTopCount'); if(!list || !db) return; list.innerHTML = '<div class="notice">신고 누적 게시글을 불러오는 중입니다.</div>'; try{ const snap = await getDocs(query(collection(db, COMMUNITY_POSTS_COLLECTION), where('reportCount','>=',1), orderBy('reportCount','desc'), limit(5))); if(count) count.textContent = `상위 ${snap.size}건`; if(snap.empty){ list.innerHTML = '<div class="member-empty">신고 누적 게시글이 없습니다.</div>'; return; } list.innerHTML = ''; snap.forEach(d => { const p=d.data(); const el=document.createElement('div'); el.className='community-report-top-item'; el.innerHTML = `<div class="community-report-top-left"><strong>${escapeHtml(p.title || '제목 없음')}</strong><span>${escapeHtml(p.authorNickname || '입주민')} · ${escapeHtml(p.category || '자유')} · ${escapeHtml(p.status || 'active')}</span><div class="community-report-top-actions"><button class="btn btn-danger" type="button" data-top-hide-post="${d.id}">숨김</button><button class="btn btn-soft" type="button" data-top-open-reports="${d.id}">신고 내역</button></div></div><div class="community-report-count">${Number(p.reportCount||0)}</div>`; list.appendChild(el); }); list.querySelectorAll('[data-top-hide-post]').forEach(btn => btn.addEventListener('click', async () => { await setCommunityPostStatus(btn.dataset.topHidePost, 'hidden'); await loadCommunityReportTopPosts(); })); list.querySelectorAll('[data-top-open-reports]').forEach(btn => btn.addEventListener('click', async () => { changeAdminView('community'); await loadAdminCommunityReports(btn.dataset.topOpenReports); })); }catch(error){ console.error(error); list.innerHTML = '<div class="member-empty">신고 누적 게시글을 불러오지 못했습니다. Firestore 인덱스를 확인해주세요.</div>'; } }

    async function loadAdminCommunityPosts(status='active'){
      if(!requireAdminDataAccess()) return; const list = qs('#adminCommunityList'); if(!list || !db) return; list.innerHTML = '<div class="notice">커뮤니티 게시글을 불러오는 중입니다.</div>'; try{ const snap = await getDocs(query(collection(db, COMMUNITY_POSTS_COLLECTION), where('status','==',status), orderBy('createdAt','desc'), limit(50))); qs('#adminCommunityCount').textContent = `${status === 'active' ? '정상' : '숨김'} ${snap.size}건`; if(snap.empty){ list.innerHTML = '<div class="member-empty">표시할 게시글이 없습니다.</div>'; return; } list.innerHTML = ''; snap.forEach(d => { const p = d.data(); const el = document.createElement('div'); el.className = 'mini-item community-admin-card'; el.innerHTML = `<div class="mini-item-head"><div><h4>${escapeHtml(p.title || '제목 없음')}</h4><div class="community-admin-meta"><span class="tag">${escapeHtml(p.category || '자유')}</span><span>${escapeHtml(p.authorNickname || '입주민')}</span><span>댓글 ${Number(p.commentCount||0)}</span><span>신고 ${Number(p.reportCount||0)}</span><span>${fmtAdminCommunityDate(p.createdAt)}</span></div></div><span class="tag ${status==='hidden'?'hidden-tag':'live-tag'}">${status==='hidden'?'숨김':'정상'}</span></div><p>${escapeHtml(String(p.content || '').slice(0,160))}${String(p.content || '').length>160?'...':''}</p><div class="community-admin-actions"><button class="btn btn-danger" type="button" data-hide-post="${d.id}">숨김</button><button class="btn btn-soft" type="button" data-restore-post="${d.id}">복구</button></div>`; list.appendChild(el); }); list.querySelectorAll('[data-hide-post]').forEach(btn => btn.addEventListener('click', () => setCommunityPostStatus(btn.dataset.hidePost, 'hidden'))); list.querySelectorAll('[data-restore-post]').forEach(btn => btn.addEventListener('click', () => setCommunityPostStatus(btn.dataset.restorePost, 'active'))); }catch(error){ console.error(error); list.innerHTML = '<div class="member-empty">커뮤니티 게시글을 불러오지 못했습니다. Firestore 인덱스/규칙을 확인해주세요.</div>'; } }
    async function setCommunityPostStatus(postId, status){ if(!postId || !db) return; await updateDoc(doc(db, COMMUNITY_POSTS_COLLECTION, postId), { status, updatedAt: serverTimestamp() }); await loadAdminCommunityPosts(status === 'hidden' ? 'active' : 'hidden'); }
    async function loadAdminCommunityReports(filterPostId=null){
      if(!requireAdminDataAccess()) return; const list = qs('#adminCommunityList'); if(!list || !db) return; list.innerHTML = '<div class="notice">신고 내역을 불러오는 중입니다.</div>'; try{ let reportQuery = query(collection(db, COMMUNITY_REPORTS_COLLECTION), orderBy('createdAt','desc'), limit(50)); if(filterPostId) reportQuery = query(collection(db, COMMUNITY_REPORTS_COLLECTION), where('postId','==',filterPostId), orderBy('createdAt','desc'), limit(50)); const snap = await getDocs(reportQuery); qs('#adminCommunityCount').textContent = `${filterPostId ? '선택 글 신고' : '신고'} ${snap.size}건`; if(snap.empty){ list.innerHTML = '<div class="member-empty">신고 내역이 없습니다.</div>'; return; } list.innerHTML = ''; snap.forEach(d => { const r=d.data(); const el=document.createElement('div'); el.className='mini-item community-admin-card'; el.innerHTML=`<div class="mini-item-head"><div><h4>${r.targetType === 'comment' ? '댓글 신고' : '게시글 신고'}</h4><div class="community-admin-meta"><span class="tag admin-tag-danger">${escapeHtml(r.status || 'pending')}</span><span>게시글 ${escapeHtml(r.postId || '')}</span>${r.commentId?`<span>댓글 ${escapeHtml(r.commentId)}</span>`:''}<span>${fmtAdminCommunityDate(r.createdAt)}</span></div></div></div><p>${escapeHtml(r.reason || '사용자 신고')}</p><div class="community-admin-actions"><button class="btn btn-soft" type="button" data-review-report="${d.id}">검토 완료</button><button class="btn btn-danger" type="button" data-hide-reported-post="${r.postId || ''}">게시글 숨김</button></div>`; list.appendChild(el); }); list.querySelectorAll('[data-review-report]').forEach(btn => btn.addEventListener('click', async () => { await updateDoc(doc(db, COMMUNITY_REPORTS_COLLECTION, btn.dataset.reviewReport), { status:'reviewed', reviewedAt:serverTimestamp() }); loadAdminCommunityReports(); })); list.querySelectorAll('[data-hide-reported-post]').forEach(btn => btn.addEventListener('click', () => setCommunityPostStatus(btn.dataset.hideReportedPost, 'hidden'))); }catch(error){ console.error(error); list.innerHTML = '<div class="member-empty">신고 내역을 불러오지 못했습니다.</div>'; } }
    qs('#loadCommunityActiveBtn')?.addEventListener('click', () => loadAdminCommunityPosts('active')); qs('#loadCommunityHiddenBtn')?.addEventListener('click', () => loadAdminCommunityPosts('hidden')); qs('#loadCommunityReportsBtn')?.addEventListener('click', () => loadAdminCommunityReports());

    function formatStationAccess(station={}){
      const line = String(station.line || station.stationLine || '').trim();
      const name = String(station.name || station.stationName || '').trim();
      const exit = String(station.exit || station.stationExit || '').trim();
      const distanceRaw = station.distance ?? station.distanceM ?? station.meters ?? '';
      const distance = Number(String(distanceRaw).replace(/[^0-9.]/g,''));
      const lineText = line ? `${line} ` : '';
      const exitText = exit ? `${exit}에서` : '에서';
      const distanceText = Number.isFinite(distance) && distance > 0 ? ` ${Math.round(distance)}m` : '';
      return name ? `${lineText}${name} ${exitText}${distanceText}`.trim() : '';
    }
    function normalizeBenefitStations(item={}){
      const raw = Array.isArray(item.stations) ? item.stations : (Array.isArray(item.stationAccessList) ? item.stationAccessList : []);
      const rows = raw.map((s)=>({
        line:String(s.line || s.stationLine || '').trim(),
        name:String(s.name || s.stationName || '').trim(),
        exit:String(s.exit || s.stationExit || '').trim(),
        distance:Number(String(s.distance ?? s.distanceM ?? s.meters ?? '').replace(/[^0-9.]/g,'')) || 0
      })).filter(s=>s.name || s.line || s.exit || s.distance);
      const legacyText = String(item.stationAccessText || item.transitText || item.stationGuide || item.nearStationText || '').trim();
      if(!rows.length && legacyText){ rows.push({line:'',name:legacyText,exit:'',distance:0}); }
      return rows.sort((a,b)=>(a.distance||999999)-(b.distance||999999));
    }

    const SUPPORT_PROGRAM_DEFAULTS=['민생회복지원금','경기지역화폐','아동급식카드','문화누리카드'];
    function normalizeSupportPrograms(item={}){
      return normalizeSupportProgramRows(item).map(row=>row.name).filter(Boolean);
    }
    function normalizeSupportProgramRows(item={}){
      const rows=[];
      const pushRow=(row={})=>{
        const name=String(row.name||row.title||row.label||row.program||row.type||row.supportName||'').trim();
        const startedAt=String(row.startedAt||row.startDate||row.supportProgramStartedAt||row.supportProgramStartDate||'').trim();
        const endedAt=String(row.endedAt||row.endDate||row.supportProgramEndedAt||row.supportProgramEndDate||'').trim();
        if(name) rows.push({
          name,startedAt,endedAt,
          ...normalizeArrayAuditFields(row)
        });
      };
      const rawItems = item.supportProgramItems || item.supportPrograms?.items || item.governmentSupportItems || item.supportProgramRows || [];
      if(Array.isArray(rawItems)) rawItems.forEach(pushRow);
      const raw = item.supportPrograms || item.supportProgram || item.governmentSupport || item.supportProgramNames || item.supportProgramList || {};
      let programs = [];
      if(Array.isArray(raw)) programs = raw;
      else if(Array.isArray(raw.programs)) programs = raw.programs;
      else if(Array.isArray(raw.items) && !rows.length) programs = raw.items;
      else if(typeof raw === 'string') programs = raw.split(/[·,，\n]/);
      else if(typeof item.supportProgramsText === 'string') programs = item.supportProgramsText.split(/[·,，\n]/);
      const legacyStartedAt=item.supportProgramStartedAt||item.supportProgramStartDate||item.governmentSupportStartedAt||item.governmentSupportStartDate||'';
      const legacyEndedAt=item.supportProgramEndedAt||item.supportProgramEndDate||item.governmentSupportEndedAt||item.governmentSupportEndDate||'';
      programs.map(v=>String(v||'').trim()).filter(Boolean).forEach(name=>{
        if(!rows.some(row=>row.name===name)) rows.push({name,startedAt:legacyStartedAt,endedAt:legacyEndedAt});
      });
      const seen=new Set();
      return rows.filter(row=>{
        const key=`${row.name}|${row.startedAt}|${row.endedAt}`;
        if(seen.has(key)) return false;
        seen.add(key);
        return true;
      });
    }
    function parseAdminDateOnly(value){
      const text=String(value||'').trim();
      if(!text) return null;
      const match=text.match(/^(\d{4})[-.](\d{1,2})[-.](\d{1,2})/);
      if(!match) return null;
      const y=Number(match[1]),m=Number(match[2]),d=Number(match[3]);
      if(!y||!m||!d) return null;
      return new Date(y,m-1,d);
    }
    function formatAdminDateOnly(value){
      const date=parseAdminDateOnly(value);
      if(!date) return '';
      return `${date.getFullYear()}.${String(date.getMonth()+1).padStart(2,'0')}.${String(date.getDate()).padStart(2,'0')}`;
    }
    function isSupportProgramRowExpired(row={}){
      const end=parseAdminDateOnly(row.endedAt);
      if(!end) return false;
      const now=new Date(); const today=new Date(now.getFullYear(),now.getMonth(),now.getDate());
      return end < today;
    }
    function isSupportProgramRowScheduled(row={}){
      const start=parseAdminDateOnly(row.startedAt);
      if(!start) return false;
      const now=new Date(); const today=new Date(now.getFullYear(),now.getMonth(),now.getDate());
      return start > today;
    }
    function isSupportProgramExpired(item={}){
      const rows=normalizeSupportProgramRows(item);
      return rows.length > 0 && rows.every(row=>isSupportProgramRowExpired(row));
    }
    function supportProgramPeriodLabel(row={}){
      const start=formatAdminDateOnly(row.startedAt); const end=formatAdminDateOnly(row.endedAt);
      if(start&&end) return `${start} ~ ${end}`; if(end) return `${end}까지`; if(start) return `${start}부터`; return '';
    }
    function supportProgramRowHtml(row={}, index=0){
      const name=escapeAttr(row.name||'');
      const startedAt=escapeAttr(row.startedAt||'');
      const endedAt=escapeAttr(row.endedAt||'');
      return `<div class="support-program-row" data-support-program-row>
        <div class="support-program-cell support-program-name-cell">
          <label class="sub-field-label">지원금 종류</label>
          <input class="support-program-name-input" type="text" autocomplete="off" placeholder="예: 민생회복지원금" value="${name}" aria-label="지원금 종류 ${index+1}">
        </div>
        <div class="support-program-cell">
          <label class="sub-field-label">시작일</label>
          <input class="support-program-start-input" type="date" value="${startedAt}" aria-label="지원금 시작일 ${index+1}">
        </div>
        <div class="support-program-cell">
          <label class="sub-field-label">종료일</label>
          <input class="support-program-end-input" type="date" value="${endedAt}" aria-label="지원금 종료일 ${index+1}">
        </div>
        <button class="support-program-remove-btn" type="button" data-remove-support-program aria-label="지원금 종류 삭제">삭제</button>
      </div>`;
    }
    function renderSupportProgramRows(rows=[]){
      const box=qs('#supportProgramRows');
      if(!box) return;
      const safeRows=Array.isArray(rows) && rows.length ? rows : [{name:'',startedAt:'',endedAt:''}];
      box.innerHTML=safeRows.map((row,index)=>supportProgramRowHtml(row,index)).join('');
      syncSupportProgramsHiddenText();
    }
    function getSupportProgramsFromForm(){
      const rows=qsa('[data-support-program-row]').map(row=>({
        name:String(row.querySelector('.support-program-name-input')?.value||'').trim(),
        startedAt:String(row.querySelector('.support-program-start-input')?.value||'').trim(),
        endedAt:String(row.querySelector('.support-program-end-input')?.value||'').trim()
      })).filter(row=>row.name);
      if(qs('#supportProgramsText')) qs('#supportProgramsText').value = rows.map(row=>row.name).join(' · ');
      return rows.map(row=>row.name);
    }
    function getSupportProgramRowsFromForm(){
      const rows=qsa('[data-support-program-row]').map(row=>({
        name:String(row.querySelector('.support-program-name-input')?.value||'').trim(),
        startedAt:String(row.querySelector('.support-program-start-input')?.value||'').trim(),
        endedAt:String(row.querySelector('.support-program-end-input')?.value||'').trim()
      })).filter(row=>row.name);
      if(qs('#supportProgramsText')) qs('#supportProgramsText').value = rows.map(row=>row.name).join(' · ');
      return rows;
    }
    function syncSupportProgramsHiddenText(){ getSupportProgramRowsFromForm(); }
    function addSupportProgramRow(row={}){
      const rows=getSupportProgramRowsFromForm();
      rows.unshift({name:row.name||'',startedAt:row.startedAt||'',endedAt:row.endedAt||''});
      renderSupportProgramRows(rows);
      const first=qs('#supportProgramRows [data-support-program-row]:first-child .support-program-name-input');
      if(first) first.focus();
    }
    function setSupportProgramsToForm(item={}){
      renderSupportProgramRows(normalizeSupportProgramRows(item));
    }
    document.addEventListener('click',(event)=>{
      if(event.target?.closest?.('#addSupportProgramRowBtn')){ event.preventDefault(); addSupportProgramRow(); }
      const removeBtn=event.target?.closest?.('[data-remove-support-program]');
      if(removeBtn){
        event.preventDefault();
        const row=removeBtn.closest('[data-support-program-row]');
        if(row) row.remove();
        if(!qsa('[data-support-program-row]').length) renderSupportProgramRows([{name:'',startedAt:'',endedAt:''}]);
        syncSupportProgramsHiddenText();
      }
    }, true);
    document.addEventListener('input',(event)=>{
      if(event.target?.closest?.('#supportProgramRows')) syncSupportProgramsHiddenText();
    }, true);
    function supportProgramsBadgeHtml(item={}){
      const rows = normalizeSupportProgramRows(item);
      if(!rows.length) return '';
      const chips = rows.map(row=>{
        const period=supportProgramPeriodLabel(row);
        const expired=isSupportProgramRowExpired(row);
        const scheduled=isSupportProgramRowScheduled(row);
        const stateText=expired?'종료됨':(scheduled?'예정':'사용 가능');
        const stateClass=expired?' expired':(scheduled?' scheduled':'');
        const periodText=period ? ` · ${period}` : '';
        return `<span class="support-program-chip${stateClass}">💳 ${escapeHtml(row.name)} <em>${stateText}${escapeHtml(periodText)}</em></span>`;
      }).join('');
      return `<div class="support-program-chip-row" aria-label="정부지원금 사용 가능">${chips}</div>`;
    }


    function normalizeCouponLinks(item={}){
      const raw = item.couponLinks || item.coupons || item.couponList || item.couponUrls || [];
      let rows = [];
      if(Array.isArray(raw)){
        rows = raw.map((row)=>{
          if(typeof row === 'string') return { title:'쿠폰 있어요', url:row };
          return {
            title:String(row.title || row.name || row.label || row.couponTitle || '쿠폰 있어요').trim(),
            url:String(row.url || row.link || row.href || row.couponUrl || '').trim()
          };
        });
      }else if(raw && typeof raw === 'object'){
        rows = [{
          title:String(raw.title || raw.name || raw.label || raw.couponTitle || '쿠폰 있어요').trim(),
          url:String(raw.url || raw.link || raw.href || raw.couponUrl || '').trim()
        }];
      }else if(typeof raw === 'string'){
        rows = raw.split(/[\n,，]/).map(url=>({title:'쿠폰 있어요', url:String(url).trim()}));
      }
      return rows.filter(row=>row.url).map(row=>({
        title:row.title || '쿠폰 있어요',
        url:row.url,
        ...normalizeArrayAuditFields(row)
      }));
    }
    function renderCouponLinkRow(row={}){
      const wrap=document.createElement('div');
      wrap.className='coupon-link-row';
      wrap.innerHTML=`<input class="coupon-title" placeholder="쿠폰명 예: 네이버 저장 쿠폰" value="${escapeHtml(row.title||'')}"><input class="coupon-url" placeholder="쿠폰 링크 URL 예: https://map.naver.com/..." value="${escapeHtml(row.url||'')}"><button class="coupon-link-remove-btn" type="button" title="쿠폰 링크 삭제">삭제</button>`;
      wrap.querySelector('.coupon-link-remove-btn')?.addEventListener('click',()=>wrap.remove());
      return wrap;
    }
    function setCouponLinksToForm(item={}){
      const list=qs('#couponLinkList'); if(!list) return;
      list.innerHTML='';
      const rows=normalizeCouponLinks(item);
      rows.forEach(row=>list.appendChild(renderCouponLinkRow(row)));
      if(qs('#couponLinksText')) qs('#couponLinksText').value = rows.map(row=>`${row.title}|${row.url}`).join('\n');
    }
    function getCouponLinksFromForm(){
      const rows=qsa('#couponLinkList .coupon-link-row').map(row=>({
        title:String(row.querySelector('.coupon-title')?.value || '').trim(),
        url:String(row.querySelector('.coupon-url')?.value || '').trim()
      })).filter(row=>row.url);
      const normalized=rows.map(row=>({title:row.title || '쿠폰 있어요', url:row.url}));
      if(qs('#couponLinksText')) qs('#couponLinksText').value = normalized.map(row=>`${row.title}|${row.url}`).join('\n');
      return normalized;
    }
    function couponLinksBadgeHtml(item={}){
      const rows=normalizeCouponLinks(item);
      if(!rows.length) return '';
      return `<div class="coupon-link-chip-row" aria-label="쿠폰 링크">${rows.map(row=>`<span class="coupon-link-chip">🎁 ${escapeHtml(row.title||'쿠폰')}</span>`).join('')}</div>`;
    }


    function normalizeNewsItems(item={}){
      const raw = item.newsItems || item.news || item.storeNews || item.noticeLinks || [];
      let rows = [];
      if(Array.isArray(raw)){
        rows = raw.map(row => {
          if(typeof row === 'string') return { title:'소식', imageUrl:'', date:'', url:row };
          row = row || {};
          return {
            title:String(row.title || row.name || row.label || row.newsTitle || '소식').trim(),
            badge:String(row.badge || row.type || row.badgeLabel || row.newsBadge || '소식').trim(),
            imageUrl:String(row.imageUrl || row.thumbnailUrl || row.thumbnail || row.photoUrl || row.image || '').trim(),
            date:String(row.date || row.newsDate || row.publishedAt || row.createdText || '').trim(),
            url:String(row.url || row.link || row.href || row.newsUrl || '').trim()
          };
        });
      }else if(raw && typeof raw === 'object'){
        rows = [{
          title:String(raw.title || raw.name || raw.label || raw.newsTitle || '소식').trim(),
          badge:String(raw.badge || raw.type || raw.badgeLabel || raw.newsBadge || '소식').trim(),
          imageUrl:String(raw.imageUrl || raw.thumbnailUrl || raw.thumbnail || raw.photoUrl || raw.image || '').trim(),
          date:String(raw.date || raw.newsDate || raw.publishedAt || raw.createdText || '').trim(),
          url:String(raw.url || raw.link || raw.href || raw.newsUrl || '').trim()
        }];
      }else if(typeof raw === 'string'){
        rows = raw.split(/[\n,，]/).map(url => ({ title:'소식', imageUrl:'', date:'', url:String(url).trim() }));
      }
      return rows.filter(row => row.title || row.url || row.imageUrl).map(row => ({
        title:row.title || '소식',
        badge:row.badge || '소식',
        imageUrl:row.imageUrl || '',
        date:row.date || '',
        url:row.url || '',
        ...normalizeArrayAuditFields(row)
      })).sort((a,b)=>{
        const bTime=Math.max(pickAuditTimestampValue(b.createdAt,b.registeredAt,b.date), pickAuditTimestampValue(b.updatedAt));
        const aTime=Math.max(pickAuditTimestampValue(a.createdAt,a.registeredAt,a.date), pickAuditTimestampValue(a.updatedAt));
        return bTime - aTime;
      });
    }

    function renderNewsItemRow(row={}){
      const wrap=document.createElement('div');
      wrap.className='news-item-row';
      const imageUrl=String(row.imageUrl||'').trim();
      const badge=String(row.badge||row.type||'소식').trim();
      wrap.innerHTML=`<div class="news-image-admin-cell"><div class="news-image-admin-preview">${imageUrl?`<img src="${escapeHtml(imageUrl)}" alt="">`:'이미지 없음'}</div><input class="news-image-file" type="file" accept="image/*"><button class="btn btn-soft news-image-upload-btn" type="button">이미지 업로드</button><small class="news-image-upload-status"></small></div><div class="news-badge-wrap"><select class="news-badge" aria-label="소식 표시 유형"><option value="Event">Event</option><option value="NEW">NEW</option><option value="소식">소식</option><option value="공지">공지</option><option value="쿠폰">쿠폰</option><option value="안내">안내</option><option value="__custom__">직접 입력</option></select><input class="news-badge-custom" placeholder="직접 입력 예: 모집, 할인, 오픈" value=""></div><input class="news-title" placeholder="소식 제목 예: 공터영어의 교습비를 알려드립니다." value="${escapeHtml(row.title||'')}"><input class="news-date" placeholder="날짜 예: 2026.04.13"><input class="news-image-url" placeholder="이미지 URL은 업로드 후 자동 입력됩니다" value="${escapeHtml(imageUrl)}"><input class="news-url" placeholder="소식 링크 URL 예: https://map.naver.com/..." value="${escapeHtml(row.url||'')}"><button class="news-item-remove-btn" type="button" title="소식 삭제">삭제</button>`;
      const badgeSelect=wrap.querySelector('.news-badge');
      const badgeCustom=wrap.querySelector('.news-badge-custom');
      const knownBadges=['Event','NEW','소식','공지','쿠폰','안내'];
      if(badgeSelect){
        if(knownBadges.includes(badge)){
          badgeSelect.value=badge;
          if(badgeCustom) badgeCustom.style.display='none';
        }else{
          badgeSelect.value='__custom__';
          if(badgeCustom){
            badgeCustom.value=badge;
            badgeCustom.style.display='block';
          }
        }
        badgeSelect.addEventListener('change',()=>{
          if(!badgeCustom) return;
          const isCustom=badgeSelect.value==='__custom__';
          badgeCustom.style.display=isCustom?'block':'none';
          if(isCustom && !badgeCustom.value) badgeCustom.focus();
        });
      }
      const dateInput=wrap.querySelector('.news-date');
      if(dateInput) dateInput.value=String(row.date||'');
      wrap.querySelector('.news-item-remove-btn')?.addEventListener('click',()=>wrap.remove());
      wrap.querySelector('.news-image-upload-btn')?.addEventListener('click',()=>uploadNewsItemImageFile(wrap));
      wrap.querySelector('.news-image-url')?.addEventListener('input',(event)=>{
        const preview=wrap.querySelector('.news-image-admin-preview');
        const url=String(event.target.value||'').trim();
        if(preview) preview.innerHTML=url?`<img src="${escapeHtml(url)}" alt="">`:'이미지 없음';
      });
      return wrap;
    }


    async function uploadNewsItemImageFile(rowEl){
      let uploadPath='';
      try{
        const fileInput=rowEl?.querySelector('.news-image-file');
        const statusEl=rowEl?.querySelector('.news-image-upload-status');
        const file=fileInput?.files?.[0];
        const setStatus=(message,type='')=>{
          if(!statusEl) return;
          statusEl.textContent=message;
          statusEl.className='news-image-upload-status '+(type||'');
        };
        if(!file){ await openModalAlert('업로드할 소식 이미지를 먼저 선택해주세요.', fileInput, '소식 이미지 업로드'); return; }
        if(!file.type || !file.type.startsWith('image/')){ await openModalAlert('이미지 파일만 업로드할 수 있습니다.', fileInput, '소식 이미지 업로드'); return; }
        const maxSize=5 * 1024 * 1024;
        if(file.size > maxSize){ await openModalAlert('이미지 용량은 5MB 이하로 업로드해주세요.', fileInput, '소식 이미지 업로드'); return; }
        if(!storage){ await openModalAlert('Firebase Storage 초기화가 완료되지 않았습니다. 새로고침 후 다시 시도해주세요.', null, '소식 이미지 업로드'); return; }
        if(!auth?.currentUser){ await openModalAlert('관리자 로그인 상태가 확인되지 않아 업로드할 수 없습니다. 다시 로그인 후 시도해주세요.', null, '소식 이미지 업로드'); return; }

        const editId=(qs('#editId')?.value || 'new').trim() || 'new';
        const benefitKey=editId === 'new' ? `draft_${auth.currentUser.uid}` : editId;
        const safeName=(file.name || 'news-image').replace(/[^a-zA-Z0-9._-]/g,'_');
        const ext=(safeName.includes('.') ? safeName.split('.').pop() : 'jpg').toLowerCase();
        const imageExt=['jpg','jpeg','png','webp','gif'].includes(ext) ? ext : 'jpg';
        uploadPath=`ai-content/benefits/${benefitKey}/news/${Date.now()}_${Math.random().toString(36).slice(2,8)}_${safeName.replace(/\.[^.]+$/,'')}.${imageExt}`;

        const uploadBtn=rowEl.querySelector('.news-image-upload-btn');
        if(uploadBtn) uploadBtn.disabled=true;
        setStatus('업로드 중...');
        const fileRef=storageRef(storage, uploadPath);
        const uploadTask=uploadBytesResumable(fileRef, file, {
          contentType:file.type,
          contentDisposition:`inline; filename*=UTF-8''${encodeURIComponent(file.name || 'news-image')}`,
          customMetadata:{
            source:'myhills-admin-news-image',
            benefitId:editId,
            uploaderUid:auth.currentUser.uid
          }
        });

        await new Promise((resolve,reject)=>{
          uploadTask.on('state_changed',
            (snapshot)=>{
              const percent=snapshot.totalBytes ? Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100) : 0;
              setStatus(`업로드 중... ${percent}%`);
            },
            reject,
            resolve
          );
        });

        const downloadUrl=await getDownloadURL(uploadTask.snapshot.ref);
        const urlInput=rowEl.querySelector('.news-image-url');
        const preview=rowEl.querySelector('.news-image-admin-preview');
        if(urlInput) urlInput.value=downloadUrl;
        if(preview) preview.innerHTML=`<img src="${escapeHtml(downloadUrl)}" alt="">`;
        setStatus('업로드 완료', 'success');
      }catch(e){
        console.error('news image upload error', { code:e?.code, message:e?.message, uploadPath, error:e });
        const code=e?.code ? ` (${e.code})` : '';
        const statusEl=rowEl?.querySelector('.news-image-upload-status');
        if(statusEl){
          statusEl.textContent=`업로드 실패${code}`;
          statusEl.className='news-image-upload-status error';
        }
        await openModalAlert(`소식 이미지 업로드에 실패했습니다${code}.\n경로: ${uploadPath || '생성 전'}\nFirebase Storage 규칙과 관리자 로그인 상태를 확인해주세요.`, null, '소식 이미지 업로드 오류');
      }finally{
        const uploadBtn=rowEl?.querySelector('.news-image-upload-btn');
        if(uploadBtn) uploadBtn.disabled=false;
      }
    }


    function setNewsItemsToForm(item={}){
      const list=qs('#newsItemList'); if(!list) return;
      list.innerHTML='';
      const rows=normalizeNewsItems(item);
      rows.forEach(row=>list.appendChild(renderNewsItemRow(row)));
      if(qs('#newsItemsText')) qs('#newsItemsText').value = rows.map(row=>`${row.title}|${row.badge}|${row.imageUrl}|${row.date}|${row.url}`).join('\n');
    }

    function getNewsItemsFromForm(){
      const rows=qsa('#newsItemList .news-item-row').map(row=>({
        title:String(row.querySelector('.news-title')?.value || '').trim(),
        badge:(()=>{
          const selectValue=String(row.querySelector('.news-badge')?.value || '소식').trim();
          if(selectValue === '__custom__'){
            return String(row.querySelector('.news-badge-custom')?.value || '소식').trim() || '소식';
          }
          return selectValue;
        })(),
        imageUrl:String(row.querySelector('.news-image-url')?.value || '').trim(),
        date:String(row.querySelector('.news-date')?.value || '').trim(),
        url:String(row.querySelector('.news-url')?.value || '').trim()
      })).filter(row=>row.title || row.imageUrl || row.url);
      const normalized=rows.map(row=>({title:row.title || '소식', badge:row.badge || '소식', imageUrl:row.imageUrl || '', date:row.date || '', url:row.url || ''}));
      if(qs('#newsItemsText')) qs('#newsItemsText').value = normalized.map(row=>`${row.title}|${row.badge}|${row.imageUrl}|${row.date}|${row.url}`).join('\n');
      return normalized;
    }

    function newsItemsBadgeHtml(item={}){
      const rows=normalizeNewsItems(item);
      if(!rows.length) return '';
      return `<div class="news-item-chip-row" aria-label="소식 링크">${rows.map(row=>`<span class="news-item-chip">📰 ${escapeHtml(row.title||'소식')}</span>`).join('')}</div>`;
    }


    function renderStationRow(station={}){
      const wrap=document.createElement('div');
      wrap.className='station-row';
      wrap.innerHTML=`<input class="station-line" placeholder="노선 예: 경의중앙선" value="${escapeHtml(station.line||'')}"><input class="station-name" placeholder="역 이름 예: 운정역" value="${escapeHtml(station.name||'')}"><input class="station-exit" placeholder="출구 예: 1번 출구" value="${escapeHtml(station.exit||'')}"><input class="station-distance" type="number" min="0" step="1" inputmode="numeric" placeholder="거리 m" value="${station.distance?escapeHtml(String(Math.round(station.distance))):''}"><button type="button" class="station-remove-btn" title="역 삭제">삭제</button>`;
      wrap.querySelector('.station-remove-btn')?.addEventListener('click',()=>wrap.remove());
      return wrap;
    }
    function setStationRows(stations=[]){
      const list=qs('#stationList'); if(!list) return;
      list.innerHTML='';
      const rows=normalizeBenefitStations({stations});
      (rows.length?rows:[{}]).forEach(st=>list.appendChild(renderStationRow(st)));
    }
    function getStationRows(){
      return qsa('#stationList .station-row').map(row=>({
        line:String(row.querySelector('.station-line')?.value||'').trim(),
        name:String(row.querySelector('.station-name')?.value||'').trim(),
        exit:String(row.querySelector('.station-exit')?.value||'').trim(),
        distance:Number(row.querySelector('.station-distance')?.value||0) || 0
      })).filter(s=>s.line||s.name||s.exit||s.distance).sort((a,b)=>(a.distance||999999)-(b.distance||999999));
    }
    function getPrimaryStationAccessText(stations=[]){ return formatStationAccess((stations||[])[0]||{}); }
    function sanitizeBenefit(item={},id=''){
      const normalizedStoreStatus = item.storeStatus || item.operationStatus || item.status || (item.closed === true ? 'shutdown' : (item.visible === false ? 'hidden' : 'active'));
      const normalizedBenefitStatus = item.benefitStatus || item.residentBenefitStatus || item.discountStatus || 'active';
      return {
        id,
        name:item.name||'',
        category:item.category||'기타',
        discountValue:Number(item.discountValue||0),
        discountText:item.discountText||`${Number(item.discountValue||0)}%`,
        condition:item.condition||'',
        priceDetails:item.priceDetails||item.priceInfo||item.servicePriceText||item.servicePriceDetails||'',
        address:item.address||'',
        zipcode:item.zipcode||item.addressParts?.zipcode||'',
        roadAddress:item.roadAddress||item.addressParts?.road||'',
        jibunAddress:item.jibunAddress||item.addressParts?.jibun||'',
        detailAddress:item.detailAddress||item.addressParts?.detail||'',
        displayAddress:item.displayAddress||item.addressParts?.display||'',
        stations:normalizeBenefitStations(item),
        stationAccessText:item.stationAccessText||item.transitText||item.stationGuide||item.nearStationText||'',
        lat:Number(item.lat||0),
        lng:Number(item.lng||0),
        url:item.url||'',
        phone:item.phone||item.contact?.phone||'',
        emergencyPhone:item.emergencyPhone||item.contact?.emergency||'',
        contact:item.contact||{},
        service:!!item.service||String(item.discountText).trim()==='서비스',
        visible:item.visible!==false,
        recommended:!!item.recommended,
        thumbnailUrl:item.thumbnailUrl||item.imageUrl||item.ogImageUrl||'',
        detailImages:item.detailImages||item.detailImageUrls||item.benefitDetailImages||item.galleryImages||[],
        detailImageUrls:item.detailImages||item.detailImageUrls||item.benefitDetailImages||item.galleryImages||[],
        benefitDetailImages:item.detailImages||item.detailImageUrls||item.benefitDetailImages||item.galleryImages||[],
        shareDescription:item.shareDescription||'',
        shareBest:!!item.shareBest,
        badgeUp:!!item.badgeUp,
        badgeDeprecated:!!item.badgeDeprecated,
        rankBoost:Number(item.rankBoost||0),
        viewCount:Number(item.viewCount||item.clickCount||item.detailViewCount||0),
        favoriteCount:Number(item.favoriteCount||0),
        shareCount:Number(item.shareCount||item.shareClickCount||0),
        likeCount:Number(item.likeCount||0),
        recommendCount:Number(item.recommendCount||0),
        hotCount:Number(item.hotCount||0),
        popularScore:Number(item.popularScore||item.score||0),
        // 신규 상태 필드는 목록 렌더링/수정 재조회 시 사라지지 않도록 반드시 보존합니다.
        storeStatus:normalizedStoreStatus,
        operationStatus:item.operationStatus || normalizedStoreStatus,
        status:item.status || normalizedStoreStatus,
        benefitStatus:normalizedBenefitStatus,
        residentBenefitStatus:item.residentBenefitStatus || normalizedBenefitStatus,
        discountStatus:item.discountStatus || normalizedBenefitStatus,
        benefitStartedAt:item.benefitStartedAt||item.benefitStartDate||item.discountStartedAt||item.discountStartDate||'',
        benefitStartDate:item.benefitStartDate||item.benefitStartedAt||item.discountStartedAt||item.discountStartDate||'',
        discountStartedAt:item.discountStartedAt||item.benefitStartedAt||item.benefitStartDate||'',
        benefitEndedAt:item.benefitEndedAt||item.discountEndedAt||item.benefitEndDate||'',
        benefitEndDate:item.benefitEndDate||item.benefitEndedAt||item.discountEndedAt||'',
        discountEndedAt:item.discountEndedAt||item.benefitEndedAt||item.benefitEndDate||'',
        benefitStatusReason:item.benefitStatusReason||item.statusReason||item.discountStatusReason||'',
        discountStatusReason:item.discountStatusReason||item.benefitStatusReason||item.statusReason||'',
        statusReason:item.statusReason||item.benefitStatusReason||item.discountStatusReason||'',
        closed:!!item.closed || normalizedStoreStatus === 'shutdown' || normalizedStoreStatus === 'closed',
        closedAt:item.closedAt||'',
        closedReason:item.closedReason||item.storeStatusReason||'',
        storeStatusReason:item.storeStatusReason||item.closedReason||'',
        supportPrograms:{ enabled:normalizeSupportPrograms(item).length > 0, programs:normalizeSupportPrograms(item) },
        supportProgramNames:normalizeSupportPrograms(item),
        supportProgramsText:normalizeSupportPrograms(item).join(' · '),
        supportProgramStartedAt:item.supportProgramStartedAt||item.supportProgramStartDate||item.governmentSupportStartedAt||item.governmentSupportStartDate||'',
        supportProgramStartDate:item.supportProgramStartDate||item.supportProgramStartedAt||item.governmentSupportStartedAt||item.governmentSupportStartDate||'',
        governmentSupportStartedAt:item.governmentSupportStartedAt||item.supportProgramStartedAt||item.supportProgramStartDate||'',
        supportProgramEndedAt:item.supportProgramEndedAt||item.supportProgramEndDate||item.governmentSupportEndedAt||item.governmentSupportEndDate||'',
        supportProgramEndDate:item.supportProgramEndDate||item.supportProgramEndedAt||item.governmentSupportEndedAt||item.governmentSupportEndDate||'',
        governmentSupportEndedAt:item.governmentSupportEndedAt||item.supportProgramEndedAt||item.supportProgramEndDate||'',
        couponLinks:normalizeCouponLinks(item),
        coupons:normalizeCouponLinks(item),
        couponLinksText:normalizeCouponLinks(item).map(row=>`${row.title}|${row.url}`).join('\n'),
        createdAt:item.createdAt||null,
        updatedAt:item.updatedAt||null
      };
    }
    function mergeBenefitStatsIntoBenefits(){
      state.benefits = state.benefits.map((item) => {
        const stats = state.benefitStats[item.id] || {};
        return {
          ...item,
          viewCount: Number(stats.detailViewCount ?? stats.viewCount ?? stats.clickCount ?? item.viewCount ?? 0),
          favoriteCount: Number(stats.favoriteCount ?? item.favoriteCount ?? 0),
          shareCount: Number(stats.shareClickCount ?? stats.shareCount ?? item.shareCount ?? 0),
          likeCount: Number(stats.likeCount ?? item.likeCount ?? 0),
          recommendCount: Number(stats.recommendCount ?? item.recommendCount ?? 0),
          hotCount: Number(stats.hotCount ?? item.hotCount ?? 0),
          popularScore: Number(stats.popularScore ?? stats.score ?? item.popularScore ?? 0),
        };
      });
    }
    function sanitizeNotice(item={},id=''){return {id,title:item.title||'',content:item.content||'',category:item.category||'일반',visible:item.visible!==false,pinned:!!item.pinned,createdAt:item.createdAt||null,updatedAt:item.updatedAt||null};}
    const hasFirebaseConfig=()=>firebaseConfig.apiKey&&firebaseConfig.projectId&&firebaseConfig.appId;
    let auth=null,db=null,storage=null;
    function getPublicVisibleBenefitsForStats(){
      return (state.benefits || []).filter(item => {
        if(!item || item.visible === false) return false;
        const storeStatus = normalizeAdminStoreStatus(item);
        const benefitStatus = normalizeAdminBenefitStatus(item);
        return ['active','reopened'].includes(storeStatus) && ['active','resumed'].includes(benefitStatus);
      });
    }

    function updateStats(){
      // 관리자 통계는 공개앱에 실제 노출되는 혜택 기준으로 계산합니다.
      const items=getPublicVisibleBenefitsForStats();
      setTextAll('.stat-count', String(items.length));
      setTextAll('.stat-max', `${Math.max(0,...items.map(v=>Number(v.discountValue||0)))}%`);
      setTextAll('.stat-cat', String(new Set(items.map(v=>v.category||'기타')).size));
      const dashboardBenefitCountEl=qs('#dashboardBenefitCount'); if(dashboardBenefitCountEl) dashboardBenefitCountEl.textContent=`${items.length}건`;
      const benefitListCountEl=qs('#benefitListCount'); if(benefitListCountEl) benefitListCountEl.textContent=`${items.length}건`;
      const dashboardNoticeCountEl=qs('#dashboardNoticeCount'); if(dashboardNoticeCountEl) dashboardNoticeCountEl.textContent=`${state.notices.length}건`;
      const noticeListCountEl=qs('#noticeListCount'); if(noticeListCountEl) noticeListCountEl.textContent=`${state.notices.length}건`;
      const pushCountEl=qs('#pushJobCount'); if(pushCountEl) pushCountEl.textContent=`${state.pushJobs.length}건`;
    }
    function updateThumbPreview(url=''){
      const preview=qs('#thumbPreview');
      if(!preview) return;
      const safeUrl=String(url||'').trim();
      if(!safeUrl){preview.textContent='이미지 URL 입력 시 미리보기';return;}
      preview.innerHTML=`<img src="${escapeHtml(safeUrl)}" alt="썸네일 미리보기" onerror="this.parentNode.textContent='이미지를 불러올 수 없습니다.'">`;
    }



    function setThumbnailUploadStatus(message, type=''){
      const el=qs('#thumbnailUploadStatus');
      if(!el) return;
      el.textContent=message;
      el.style.color = type === 'error' ? '#b91c1c' : type === 'success' ? '#15803d' : '#64748b';
    }

    function setThumbnailUploadProgress(percent=0, show=false){
      const track=qs('#thumbnailUploadProgressTrack');
      const bar=qs('#thumbnailUploadProgressBar');
      if(track) track.classList.toggle('show', !!show);
      if(bar) bar.style.width=`${Math.max(0, Math.min(100, percent))}%`;
    }


    function getDetailImageUrlsFromForm(){
      const raw = String(qs('#detailImageUrls')?.value || '').trim();
      if(!raw) return [];
      return raw.split(/[\n,，]/).map(v => v.trim()).filter(Boolean).filter((v, i, arr) => arr.indexOf(v) === i);
    }

    function setDetailImageUrlsToForm(urls = []){
      const el = qs('#detailImageUrls');
      if(!el) return;
      const rows = Array.isArray(urls) ? urls : [];
      el.value = rows.map(row => typeof row === 'string' ? row : (row?.url || row?.imageUrl || '')).map(v => String(v || '').trim()).filter(Boolean).filter((v, i, arr) => arr.indexOf(v) === i).join('\n');
      updateDetailImagePreview();
    }

    function updateDetailImagePreview(){
      const preview = qs('#detailImagePreview');
      if(!preview) return;
      const urls = getDetailImageUrlsFromForm();
      preview.classList.toggle('is-empty', !urls.length);
      if(!urls.length){ preview.textContent = '추가 사진 URL 입력 시 미리보기'; return; }
      preview.innerHTML = urls.map((url, index) => `<img src="${escapeHtml(url)}" alt="상세 추가 사진 ${index + 1}" onerror="this.remove()">`).join('');
    }

    function setDetailImagesUploadStatus(message, type=''){
      const el=qs('#detailImagesUploadStatus');
      if(!el) return;
      el.textContent=message;
      el.style.color = type === 'error' ? '#b91c1c' : type === 'success' ? '#15803d' : '#64748b';
    }

    function setDetailImagesUploadProgress(percent=0, show=false){
      const track=qs('#detailImagesUploadProgressTrack');
      const bar=qs('#detailImagesUploadProgressBar');
      if(track) track.classList.toggle('show', !!show);
      if(bar) bar.style.width=`${Math.max(0, Math.min(100, percent))}%`;
    }

    async function uploadDetailImageFiles(){
      try{
        const fileInput=qs('#detailImageFiles');
        const files=[...(fileInput?.files || [])];
        if(!files.length){ await openModalAlert('업로드할 상세 사진을 먼저 선택해주세요.', fileInput, '상세 사진 업로드'); return; }
        if(!storage){ await openModalAlert('Firebase Storage 초기화가 완료되지 않았습니다. 새로고침 후 다시 시도해주세요.', null, '상세 사진 업로드'); return; }
        if(!auth?.currentUser){ await openModalAlert('관리자 로그인 상태가 확인되지 않아 업로드할 수 없습니다. 다시 로그인 후 시도해주세요.', null, '상세 사진 업로드'); return; }
        const invalid=files.find(file => !file.type || !file.type.startsWith('image/'));
        if(invalid){ await openModalAlert('이미지 파일만 업로드할 수 있습니다.', fileInput, '상세 사진 업로드'); return; }
        const tooLarge=files.find(file => file.size > 5 * 1024 * 1024);
        if(tooLarge){ await openModalAlert('상세 사진은 파일당 5MB 이하로 업로드해주세요.', fileInput, '상세 사진 업로드'); return; }
        const uploadBtn=qs('#detailImagesUploadBtn');
        if(uploadBtn) uploadBtn.disabled=true;
        setDetailImagesUploadProgress(0,true);
        setDetailImagesUploadStatus(`상세 사진 ${files.length}장 업로드 중입니다...`);
        const editId=(qs('#editId')?.value || 'new').trim() || 'new';
        const benefitKey=editId === 'new' ? `draft_${auth.currentUser.uid}` : editId;
        const uploaded=[];
        for(let i=0; i<files.length; i++){
          const file=files[i];
          const safeName=(file.name || `detail_${i+1}`).replace(/[^a-zA-Z0-9._-]/g,'_');
          const ext=(safeName.includes('.') ? safeName.split('.').pop() : 'jpg').toLowerCase();
          const imageExt=['jpg','jpeg','png','webp','gif'].includes(ext) ? ext : 'jpg';
          const uploadPath=`ai-content/benefits/${benefitKey}/detail-images/${Date.now()}_${i}_${Math.random().toString(36).slice(2,8)}_${safeName.replace(/\.[^.]+$/,'')}.${imageExt}`;
          const fileRef=storageRef(storage, uploadPath);
          const uploadTask=uploadBytesResumable(fileRef, file, {contentType:file.type,contentDisposition:`inline; filename*=UTF-8''${encodeURIComponent(file.name || 'detail-image')}`,customMetadata:{source:'myhills-admin-detail-image',benefitId:editId,uploaderUid:auth.currentUser.uid}});
          await new Promise((resolve,reject)=>{
            uploadTask.on('state_changed',(snapshot)=>{const single=snapshot.totalBytes ? snapshot.bytesTransferred / snapshot.totalBytes : 0;const percent=Math.round(((i + single) / files.length) * 100);setDetailImagesUploadProgress(percent,true);setDetailImagesUploadStatus(`상세 사진 업로드 중입니다... ${percent}%`);},reject,resolve);
          });
          uploaded.push(await getDownloadURL(uploadTask.snapshot.ref));
        }
        const merged=[...getDetailImageUrlsFromForm(), ...uploaded].filter((v,i,arr)=>arr.indexOf(v)===i);
        setDetailImageUrlsToForm(merged);
        setDetailImagesUploadProgress(100,true);
        setDetailImagesUploadStatus('상세 사진 업로드 완료! URL이 자동 추가되었습니다.', 'success');
        if(fileInput) fileInput.value='';
        setTimeout(()=>setDetailImagesUploadProgress(0,false), 900);
      }catch(error){
        console.error('[admin] detail images upload failed', error);
        setDetailImagesUploadStatus('상세 사진 업로드에 실패했습니다. Storage 권한과 파일 형식을 확인해주세요.', 'error');
        await openModalAlert(error?.message || '상세 사진 업로드에 실패했습니다.', qs('#detailImageFiles'), '상세 사진 업로드');
      }finally{
        const uploadBtn=qs('#detailImagesUploadBtn');
        if(uploadBtn) uploadBtn.disabled=false;
      }
    }

    async function uploadThumbnailFile(){
      let uploadPath='';
      try{
        const fileInput=qs('#thumbnailFile');
        const file=fileInput?.files?.[0];
        if(!file){ await openModalAlert('업로드할 이미지를 먼저 선택해주세요.', fileInput, '썸네일 업로드'); return; }
        if(!file.type || !file.type.startsWith('image/')){ await openModalAlert('이미지 파일만 업로드할 수 있습니다.', fileInput, '썸네일 업로드'); return; }
        const maxSize=5 * 1024 * 1024;
        if(file.size > maxSize){ await openModalAlert('이미지 용량은 5MB 이하로 업로드해주세요.', fileInput, '썸네일 업로드'); return; }
        if(!storage){ await openModalAlert('Firebase Storage 초기화가 완료되지 않았습니다. 새로고침 후 다시 시도해주세요.', null, '썸네일 업로드'); return; }
        if(!auth?.currentUser){ await openModalAlert('관리자 로그인 상태가 확인되지 않아 업로드할 수 없습니다. 다시 로그인 후 시도해주세요.', null, '썸네일 업로드'); return; }

        const editId=(qs('#editId')?.value || 'new').trim() || 'new';
        const benefitKey=editId === 'new' ? `draft_${auth.currentUser.uid}` : editId;
        const safeName=(file.name || 'thumbnail').replace(/[^a-zA-Z0-9._-]/g,'_');
        const ext=(safeName.includes('.') ? safeName.split('.').pop() : 'jpg').toLowerCase();
        const imageExt=['jpg','jpeg','png','webp','gif'].includes(ext) ? ext : 'jpg';

        // Storage Rules와 일치하는 공통 경로입니다. 기존 benefit-thumbnails 경로는 사용하지 않습니다.
        uploadPath=`ai-content/benefits/${benefitKey}/thumbnails/${Date.now()}_${Math.random().toString(36).slice(2,8)}_${safeName.replace(/\.[^.]+$/,'')}.${imageExt}`;
        console.info('[admin] thumbnail upload path', uploadPath);

        const fileRef=storageRef(storage, uploadPath);
        const uploadTask=uploadBytesResumable(fileRef, file, {
          contentType:file.type,
          contentDisposition:`inline; filename*=UTF-8''${encodeURIComponent(file.name || 'thumbnail')}`,
          customMetadata:{
            source:'myhills-admin-thumbnail',
            benefitId:editId,
            uploaderUid:auth.currentUser.uid
          }
        });
        const uploadBtn=qs('#thumbnailUploadBtn');
        if(uploadBtn) uploadBtn.disabled=true;
        setThumbnailUploadProgress(0,true);
        setThumbnailUploadStatus('이미지 업로드 중입니다...');
        await new Promise((resolve,reject)=>{
          uploadTask.on('state_changed',
            (snapshot)=>{
              const percent=snapshot.totalBytes ? Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100) : 0;
              setThumbnailUploadProgress(percent,true);
              setThumbnailUploadStatus(`이미지 업로드 중입니다... ${percent}%`);
            },
            reject,
            resolve
          );
        });
        const downloadUrl=await getDownloadURL(uploadTask.snapshot.ref);
        if(qs('#thumbnailUrl')) qs('#thumbnailUrl').value=downloadUrl;
        updateThumbPreview(downloadUrl);
        setThumbnailUploadProgress(100,true);
        setThumbnailUploadStatus('업로드 완료! URL이 자동 입력되었습니다.', 'success');
        setTimeout(()=>setThumbnailUploadProgress(0,false), 900);
      }catch(e){
        console.error('thumbnail upload error', { code:e?.code, message:e?.message, uploadPath, error:e });
        const code=e?.code ? ` (${e.code})` : '';
        setThumbnailUploadStatus(`업로드 실패${code}: Storage 권한, 로그인 상태, 경로를 확인해주세요.`, 'error');
        await openModalAlert(`썸네일 업로드에 실패했습니다${code}.\n경로: ${uploadPath || '생성 전'}\nFirebase Storage 규칙과 관리자 로그인 상태를 확인해주세요.`, null, '썸네일 업로드 오류');
      }finally{
        const uploadBtn=qs('#thumbnailUploadBtn');
        if(uploadBtn) uploadBtn.disabled=false;
      }
    }


    const STORE_STATUS_META={preparing:{label:'영업 준비 중',cls:'store-preparing-tag'},active:{label:'정상 영업',cls:'store-active-tag'},paused:{label:'휴업',cls:'store-paused-tag'},closed:{label:'영업 종료',cls:'store-closed-tag'},shutdown:{label:'폐점',cls:'store-shutdown-tag'},reopened:{label:'재영업',cls:'store-reopened-tag'},hidden:{label:'숨김',cls:'hidden-tag'}};
    const BENEFIT_STATUS_META={preparing:{label:'혜택 준비 중',cls:'benefit-preparing-tag'},active:{label:'혜택 진행 중',cls:'benefit-active-tag'},ended:{label:'혜택 종료',cls:'benefit-ended-tag'},none:{label:'혜택 없음',cls:'benefit-none-tag'},resumed:{label:'혜택 재개',cls:'benefit-resumed-tag'}};
    function normalizeAdminStoreStatus(item={}){const raw=String(item.storeStatus||item.operationStatus||item.status||'').toLowerCase();if(['preparing','active','paused','closed','shutdown','reopened','hidden'].includes(raw))return raw;if(item.closed===true)return 'shutdown';if(item.visible===false)return 'hidden';return 'active';}
    function normalizeAdminBenefitStatus(item={}){
      const dateStatus = getAdminBenefitDateStatus(item);
      if(dateStatus?.key === 'ended') return 'ended';
      if(dateStatus?.key === 'scheduled') return 'preparing';
      const raw=String(item.benefitStatus||item.residentBenefitStatus||item.discountStatus||'').toLowerCase();
      if(['preparing','active','ended','none','resumed'].includes(raw))return raw;
      return 'active';
    }
    function getLocalTodayYmd(){
      const d = new Date();
      const pad = (n) => String(n).padStart(2, '0');
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    }
    function resolveBenefitStatusByEndDate(endDateValue, fallbackStatus='active'){
      const endDate = String(endDateValue || '').trim();
      if(!endDate) return fallbackStatus || 'active';
      return endDate < getLocalTodayYmd() ? 'ended' : 'active';
    }
    function syncBenefitStatusWithEndDate(){
      const statusEl = qs('#benefitStatus');
      const endDateEl = qs('#benefitEndedAt');
      if(!statusEl || !endDateEl) return;
      statusEl.value = resolveBenefitStatusByEndDate(endDateEl.value, statusEl.value || 'active');
    }
    function adminStatusTagHtml(meta, fallback){const info=meta||fallback;return `<span class="tag status-tag ${info.cls}">${info.label}</span>`;}


    function syncVisibleWithStoreStatus(){
      const storeStatusEl = qs('#storeStatus');
      const visibleEl = qs('#visible');
      if(!storeStatusEl || !visibleEl) return;

      const isHiddenStore = storeStatusEl.value === 'hidden';
      visibleEl.checked = !isHiddenStore;
      visibleEl.disabled = isHiddenStore;
      visibleEl.setAttribute('aria-disabled', isHiddenStore ? 'true' : 'false');

      const visibleWrap = visibleEl.closest('label, .check-row, .form-check, .field');
      if(visibleWrap) visibleWrap.classList.toggle('is-disabled', isHiddenStore);
    }

    function resetForm(){qs('#benefitForm').reset();qs('#editId').value='';qs('#formModeLabel').textContent='새 항목';qs('#discountValue').value=0;qs('#serviceType').value='discount';qs('#visible').checked=true;qs('#recommended').checked=false;if(qs('#shareBest')) qs('#shareBest').checked=false;if(qs('#badgeUp')) qs('#badgeUp').checked=false;if(qs('#badgeDeprecated')) qs('#badgeDeprecated').checked=false;if(qs('#rankBoost')) qs('#rankBoost').value=0;if(qs('#storeStatus')) qs('#storeStatus').value='active';syncVisibleWithStoreStatus();if(qs('#benefitStatus')) qs('#benefitStatus').value='active';if(qs('#benefitStartedAt')) qs('#benefitStartedAt').value='';if(qs('#benefitEndedAt')) qs('#benefitEndedAt').value='';syncBenefitStatusWithEndDate();if(qs('#benefitStatusReason')) qs('#benefitStatusReason').value='';if(qs('#closedAt')) qs('#closedAt').value='';if(qs('#closedReason')) qs('#closedReason').value='';['#zipcode','#roadAddress','#jibunAddress','#detailAddress','#address','#emergencyPhone','#priceDetails'].forEach(sel=>{if(qs(sel)) qs(sel).value='';});if(qs('#thumbnailUrl')) qs('#thumbnailUrl').value='';if(qs('#thumbnailFile')) qs('#thumbnailFile').value='';if(qs('#detailImageFiles')) qs('#detailImageFiles').value='';setDetailImageUrlsToForm([]);setDetailImagesUploadProgress(0,false);setDetailImagesUploadStatus('여러 장을 선택해 업로드하면 상세 추가 사진 URL에 자동으로 추가됩니다.');setThumbnailUploadProgress(0,false);setThumbnailUploadStatus('이미지를 선택 후 업로드하면 URL이 자동 입력됩니다. 권장: 1200×630 또는 정사각형 JPG/PNG/WebP');if(qs('#shareDescription')) qs('#shareDescription').value='';['#homepageUrl','#blogUrl','#instagramUrl','#youtubeUrl','#facebookUrl','#smartstoreUrl','#bandUrl','#naverReservationUrl','#naverOrderUrl','#naverDeliveryUrl','#naverTalkUrl','#serviceMemo','#directionText','#stationAccessText'].forEach(sel=>{if(qs(sel)) qs(sel).value='';});if(qs('#naverReservationEnabled')) qs('#naverReservationEnabled').checked=false;if(qs('#naverOrderEnabled')) qs('#naverOrderEnabled').checked=false;if(qs('#naverDeliveryEnabled')) qs('#naverDeliveryEnabled').checked=false;if(qs('#naverTalkEnabled')) qs('#naverTalkEnabled').checked=false;if(qs('#deliveryAvailable')) qs('#deliveryAvailable').checked=false;if(qs('#takeoutAvailable')) qs('#takeoutAvailable').checked=false;setSupportProgramsToForm({supportProgramItems:[]});setCouponLinksToForm({couponLinks:[]});updateThumbPreview('');qs('#lat').value='';qs('#lng').value='';setGeoStatus('도로명주소 또는 지번주소 입력 후 좌표 자동 조회를 누르면 위도/경도가 자동 저장됩니다.','');clearOpeningHoursForm();setStationRows([]);}
    function resetNoticeForm(){qs('#noticeForm').reset();qs('#noticeEditId').value='';qs('#noticeFormModeLabel').textContent='새 공지';qs('#noticeVisible').checked=true;qs('#noticePinned').checked=false;qs('#noticeCategory').value='일반';qs('#sendPushWithNotice').checked=false;qs('#pushImportantOnly').checked=false;qs('#pushTitle').value='';qs('#pushBody').value='';qs('#pushTargetType').value='all';qs('#pushTargetUid').value='';qs('#pushTargetBuilding').value='';qs('#pushTargetUnit').value='';}
    
    function directApplyOpeningHoursToForm(item){
      const src = item?.openingHoursManual || item?.openingHours || item?.businessHours || {};
      const map=[
        ['mon','Mon'], ['tue','Tue'], ['wed','Wed'], ['thu','Thu'], ['fri','Fri'], ['sat','Sat'], ['sun','Sun']
      ];
      map.forEach(([day,key])=>{
        const raw = src?.[day];
        const row = Array.isArray(raw) ? (raw[0] || {}) : (raw || {});
        const setVal=(id,val)=>{
          const el=document.getElementById(id);
          if(el) el.value = val || '';
        };
        const setChk=(id,val)=>{
          const el=document.getElementById(id);
          if(el) el.checked = !!val;
        };
        setChk(`oh${key}Closed`, row.closed || row.isClosed);
        setVal(`oh${key}Open`, row.open || row.start || row.from || '');
        setVal(`oh${key}Close`, row.close || row.end || row.to || '');
        setVal(`oh${key}BreakStart`, row.breakStart || row.break_start || row.breakFrom || '');
        setVal(`oh${key}BreakEnd`, row.breakEnd || row.break_end || row.breakTo || '');
        setVal(`oh${key}LastOrder`, row.lastOrder || row.last_order || '');
        setVal(`oh${key}Note`, row.note || row.memo || '');
      });
      console.log('[admin] openingHours form loaded:', src);
    }



    function readOpeningHoursForEdit(item){
      const src = item?.openingHoursManual || item?.openingHours || item?.businessHours || {};
      const days=['mon','tue','wed','thu','fri','sat','sun'];
      const result={};
      days.forEach(day=>{
        const raw=src?.[day];
        if(!raw) return;
        const row=Array.isArray(raw) ? (raw[0] || {}) : (raw || {});
        result[day]={
          closed: !!(row.closed || row.isClosed),
          open: row.open || row.start || row.from || '',
          close: row.close || row.end || row.to || '',
          breakStart: row.breakStart || row.break_start || row.breakFrom || '',
          breakEnd: row.breakEnd || row.break_end || row.breakTo || '',
          lastOrder: row.lastOrder || row.last_order || '',
          note: row.note || row.memo || ''
        };
      });
      return result;
    }

    function forceSetTimeValue(id, value){
      const el=document.getElementById(id);
      if(!el) return;
      el.value = value || '';
      el.setAttribute('value', value || '');
    }

    function forceSetCheckValue(id, value){
      const el=document.getElementById(id);
      if(!el) return;
      el.checked = !!value;
      if(value) el.setAttribute('checked','checked');
      else el.removeAttribute('checked');
    }

    function forceLoadOpeningHoursToForm(item){
      const data=readOpeningHoursForEdit(item);
      const map=[
        ['mon','Mon'], ['tue','Tue'], ['wed','Wed'], ['thu','Thu'], ['fri','Fri'], ['sat','Sat'], ['sun','Sun']
      ];
      map.forEach(([day,key])=>{
        const row=data?.[day] || {};
        forceSetCheckValue(`oh${key}Closed`, row.closed);
        forceSetTimeValue(`oh${key}Open`, row.open);
        forceSetTimeValue(`oh${key}Close`, row.close);
        forceSetTimeValue(`oh${key}BreakStart`, row.breakStart);
        forceSetTimeValue(`oh${key}BreakEnd`, row.breakEnd);
        forceSetTimeValue(`oh${key}LastOrder`, row.lastOrder);
        forceSetTimeValue(`oh${key}Note`, row.note);
      });
      console.log('[admin] forceLoadOpeningHoursToForm', data);
    }

    async function fillFormWithFreshDoc(item){
      let freshItem = item || {};
      try{
        if(db && item?.id){
          const snap = await getDoc(doc(db, BENEFITS_COLLECTION, item.id));
          if(snap.exists()){
            freshItem = { id:item.id, ...snap.data() };
            console.log('[admin] fresh benefit loaded', freshItem.openingHoursManual || freshItem.openingHours || freshItem.businessHours || {});
          }
        }
      }catch(e){
        console.warn('[admin] fresh benefit load failed, fallback item used', e);
      }
      fillForm(freshItem);
    }


function fillForm(item){
      const addressParts = readBenefitAddressParts(item);
      qs('#editId').value=item.id;
      qs('#formModeLabel').textContent='수정 중';
      qs('#name').value=item.name||'';
      qs('#category').value=item.category||'';
      qs('#discountText').value=item.discountText||'';
      qs('#discountValue').value=item.discountValue||0;
      qs('#serviceType').value=item.service?'service':'discount';
      qs('#condition').value=item.condition||'';
      if(qs('#priceDetails')) qs('#priceDetails').value=item.priceDetails||item.priceInfo||item.servicePriceText||item.servicePriceDetails||'';
      if(qs('#zipcode')) qs('#zipcode').value=addressParts.zipcode || '';
      if(qs('#roadAddress')) qs('#roadAddress').value=addressParts.road || (!addressParts.jibun ? addressParts.main : '');
      if(qs('#jibunAddress')) qs('#jibunAddress').value=addressParts.jibun || '';
      if(qs('#detailAddress')) qs('#detailAddress').value=addressParts.detail || '';
      if(qs('#address')) qs('#address').value=addressParts.display || addressParts.main || '';
      qs('#lat').value=item.lat||'';
      qs('#lng').value=item.lng||'';
      qs('#url').value=item.url||'';
      qs('#phone').value=item.phone||item.contact?.phone||'';
      if(qs('#emergencyPhone')) qs('#emergencyPhone').value=item.emergencyPhone||item.contact?.emergency||'';
      if(qs('#homepageUrl')) qs('#homepageUrl').value=item.homepageUrl||item.externalLinks?.homepage||'';
      if(qs('#blogUrl')) qs('#blogUrl').value=item.blogUrl||item.externalLinks?.blog||'';
      if(qs('#instagramUrl')) qs('#instagramUrl').value=item.instagramUrl||item.externalLinks?.instagram||'';
      if(qs('#youtubeUrl')) qs('#youtubeUrl').value=item.youtubeUrl||item.externalLinks?.youtube||'';
      if(qs('#facebookUrl')) qs('#facebookUrl').value=item.facebookUrl||item.externalLinks?.facebook||'';
      if(qs('#smartstoreUrl')) qs('#smartstoreUrl').value=item.smartstoreUrl||item.externalLinks?.smartstore||item.externalLinks?.smartStore||'';
      if(qs('#bandUrl')) qs('#bandUrl').value=item.bandUrl||item.externalLinks?.band||'';
      if(qs('#naverReservationEnabled')) qs('#naverReservationEnabled').checked=!!(item.naverReservationEnabled||item.naverBookingEnabled||item.reservationEnabled||item.reservation?.enabled||item.naverReservationUrl||item.naverBookingUrl||item.reservationUrl||item.reservation?.url);
      if(qs('#naverReservationUrl')) qs('#naverReservationUrl').value=item.naverReservationUrl||item.naverBookingUrl||item.reservationUrl||item.reservation?.url||'';
      if(qs('#naverOrderEnabled')) qs('#naverOrderEnabled').checked=!!(item.naverOrderEnabled||item.naverSmartOrderEnabled||item.orderEnabled||item.order?.enabled||item.naverOrderUrl||item.naverSmartOrderUrl||item.orderUrl||item.order?.url||item.externalLinks?.naverOrder);
      if(qs('#naverOrderUrl')) qs('#naverOrderUrl').value=item.naverOrderUrl||item.naverSmartOrderUrl||item.orderUrl||item.order?.url||item.externalLinks?.naverOrder||'';
      if(qs('#naverDeliveryEnabled')) qs('#naverDeliveryEnabled').checked=!!(item.naverDeliveryEnabled||item.deliveryEnabled||item.delivery?.enabled||item.naverDeliveryUrl||item.deliveryUrl||item.delivery?.url||item.externalLinks?.naverDelivery);
      if(qs('#naverDeliveryUrl')) qs('#naverDeliveryUrl').value=item.naverDeliveryUrl||item.deliveryUrl||item.delivery?.url||item.externalLinks?.naverDelivery||'';
      if(qs('#naverTalkEnabled')) qs('#naverTalkEnabled').checked=!!(item.naverTalkEnabled||item.talkTalkEnabled||item.talkEnabled||item.talk?.enabled||item.naverTalkUrl||item.talkTalkUrl||item.talkUrl||item.talk?.url||item.externalLinks?.naverTalk);
      if(qs('#naverTalkUrl')) qs('#naverTalkUrl').value=item.naverTalkUrl||item.talkTalkUrl||item.talkUrl||item.talk?.url||item.externalLinks?.naverTalk||'';
      if(qs('#deliveryAvailable')) qs('#deliveryAvailable').checked=!!(item.deliveryAvailable||item.serviceTags?.delivery);
      if(qs('#takeoutAvailable')) qs('#takeoutAvailable').checked=!!(item.takeoutAvailable||item.serviceTags?.takeout);
      if(qs('#serviceMemo')) qs('#serviceMemo').value=item.serviceMemo||item.serviceTags?.memo||'';
      setSupportProgramsToForm(item);
      setCouponLinksToForm(item);setNewsItemsToForm(item);
      if(qs('#directionText')) qs('#directionText').value=item.directionText||item.directionGuide||item.locationGuide||item.guideText||'';
      setStationRows(item.stations && item.stations.length ? item.stations : normalizeBenefitStations(item)); if(qs('#stationAccessText')) qs('#stationAccessText').value=getPrimaryStationAccessText(getStationRows());
      qs('#visible').checked=item.visible!==false;
      qs('#recommended').checked=!!item.recommended;
      if(qs('#storeStatus')) qs('#storeStatus').value=normalizeAdminStoreStatus(item);if(qs('#benefitStatus')) qs('#benefitStatus').value=normalizeAdminBenefitStatus(item);if(qs('#benefitStartedAt')) qs('#benefitStartedAt').value=item.benefitStartedAt||item.benefitStartDate||item.discountStartedAt||'';if(qs('#benefitEndedAt')) qs('#benefitEndedAt').value=item.benefitEndedAt||item.discountEndedAt||item.benefitEndDate||'';syncBenefitStatusWithEndDate();if(qs('#benefitStatusReason')) qs('#benefitStatusReason').value=item.benefitStatusReason||item.statusReason||item.discountStatusReason||'';
      if(qs('#closedAt')) qs('#closedAt').value=item.closedAt||'';
      if(qs('#closedReason')) qs('#closedReason').value=item.closedReason||'';
      if(qs('#shareBest')) qs('#shareBest').checked=!!item.shareBest;
      if(qs('#badgeUp')) qs('#badgeUp').checked=!!item.badgeUp;
      if(qs('#badgeDeprecated')) qs('#badgeDeprecated').checked=!!item.badgeDeprecated;
      if(qs('#rankBoost')) qs('#rankBoost').value=Number(item.rankBoost||0);
      if(qs('#thumbnailUrl')) qs('#thumbnailUrl').value=item.thumbnailUrl||'';
      if(qs('#shareDescription')) qs('#shareDescription').value=item.shareDescription||'';
      setDetailImageUrlsToForm(item.detailImages||item.detailImageUrls||item.benefitDetailImages||item.galleryImages||[]);
      updateThumbPreview(item.thumbnailUrl||'');
      setOpeningHoursToForm(item.openingHoursManual || item.openingHours || item.businessHours || {});
      forceLoadOpeningHoursToForm(item);
      setGeoStatus(item.lat&&item.lng?`저장된 좌표: ${item.lat}, ${item.lng}`:'주소로 좌표를 조회해 주세요.', item.lat&&item.lng?'success':'');
      window.scrollTo({top:0,behavior:'smooth'});
    }
    function fillNoticeForm(item){qs('#noticeEditId').value=item.id;qs('#noticeFormModeLabel').textContent='수정 중';qs('#noticeTitle').value=item.title;qs('#noticeCategory').value=item.category;qs('#noticeContent').value=item.content;qs('#noticeVisible').checked=item.visible!==false;qs('#noticePinned').checked=!!item.pinned;qs('#sendPushWithNotice').checked=false;qs('#pushImportantOnly').checked=!!item.pinned;qs('#pushTitle').value=item.title||'';qs('#pushBody').value=(item.content||'').slice(0,80);window.scrollTo({top:0,behavior:'smooth'});}
    function getTimestampSeconds(ts){
      if(!ts) return 0;
      if(typeof ts.seconds === 'number') return ts.seconds;
      if(typeof ts.toDate === 'function') return Math.floor(ts.toDate().getTime()/1000);
      const date = new Date(ts);
      const time = date.getTime();
      return Number.isFinite(time) ? Math.floor(time/1000) : 0;
    }

    function formatAdminDate(ts){
      const seconds = getTimestampSeconds(ts);
      if(!seconds) return '-';
      const date = new Date(seconds * 1000);
      const y = date.getFullYear();
      const m = String(date.getMonth()+1).padStart(2,'0');
      const d = String(date.getDate()).padStart(2,'0');
      return `${y}.${m}.${d}`;
    }

    function isRecentlyUpdatedBenefit(item){
      const updated = getTimestampSeconds(item.updatedAt);
      if(!updated) return false;
      const created = getTimestampSeconds(item.createdAt);
      if(created && Math.abs(updated - created) < 60) return false;
      return (Date.now()/1000 - updated) < 60 * 60 * 24 * 3;
    }

    function sortBenefits(items){
      const list = [...items];
      if(benefitSortMode === 'name'){
        return list.sort((a,b)=>String(a.name||'').localeCompare(String(b.name||''),'ko'));
      }
      if(benefitSortMode === 'updated'){
        return list.sort((a,b)=>{
          const bt = getTimestampSeconds(b.updatedAt) || getTimestampSeconds(b.createdAt);
          const at = getTimestampSeconds(a.updatedAt) || getTimestampSeconds(a.createdAt);
          return bt - at;
        });
      }
      return list.sort((a,b)=>{
        const bt = getTimestampSeconds(b.createdAt) || getTimestampSeconds(b.updatedAt);
        const at = getTimestampSeconds(a.createdAt) || getTimestampSeconds(a.updatedAt);
        return bt - at;
      });
    }

    function getAdminBenefitDateValue(item={},type='end'){
      const keys = type === 'start' ? ['benefitStartedAt','benefitStartDate','discountStartedAt','discountStartDate','startDate'] : ['benefitEndedAt','benefitEndDate','discountEndedAt','discountEndDate','endDate'];
      for(const key of keys){ const value=item?.[key]; if(value) return String(value).trim(); }
      return '';
    }
    function parseAdminBenefitLocalDate(value){
      const raw=String(value||'').trim();
      if(!raw) return null;
      const match=raw.match(/^(\d{4})[-.\/](\d{1,2})[-.\/](\d{1,2})/);
      if(!match) return null;
      const d=new Date(Number(match[1]),Number(match[2])-1,Number(match[3]));
      return Number.isNaN(d.getTime())?null:d;
    }
    function getAdminTodayLocalDate(){ const d=new Date(); d.setHours(0,0,0,0); return d; }
    function getAdminBenefitDateDiffDays(value){
      const target=parseAdminBenefitLocalDate(value);
      if(!target) return null;
      target.setHours(0,0,0,0);
      return Math.round((target.getTime()-getAdminTodayLocalDate().getTime())/86400000);
    }
    function getAdminBenefitDateStatus(item={}){
      const startDate=getAdminBenefitDateValue(item,'start');
      const startDiff=getAdminBenefitDateDiffDays(startDate);
      if(startDiff!==null && startDiff>0) return {key:'scheduled',label:'혜택 시작 예정',className:'scheduled',daysLeft:startDiff,date:startDate};
      const endDate=getAdminBenefitDateValue(item,'end');
      const daysLeft=getAdminBenefitDateDiffDays(endDate);
      if(daysLeft===null) return null;
      if(daysLeft<0) return {key:'ended',label:'혜택 종료',className:'ended',daysLeft,date:endDate};
      if(daysLeft===0) return {key:'today',label:'금일 혜택 종료',className:'today',daysLeft,date:endDate};
      if(daysLeft<=3) return {key:'urgent',label:'혜택 종료 임박',className:'urgent',daysLeft,date:endDate};
      if(daysLeft<=7) return {key:'soon',label:'혜택 종료 예정',className:'soon',daysLeft,date:endDate};
      return null;
    }
    function adminBenefitDateBadgeHtml(item={}){
      const status=getAdminBenefitDateStatus(item);
      if(!status) return '';
      const suffix = status.key === 'scheduled' ? ` · ${status.daysLeft}일 후 시작` : (status.daysLeft > 0 ? ` · ${status.daysLeft}일 남음` : '');
      return `<span class="tag admin-benefit-date-badge ${status.className}" title="${escapeHtml(status.date||'')}">${escapeHtml(status.label + suffix)}</span>`;
    }

    function buildBenefitItemHtml(item){
      const createdText = formatAdminDate(item.createdAt);
      const updatedText = formatAdminDate(item.updatedAt);
      const dateLine = `등록 ${createdText} · 수정 ${updatedText}`;
      const metricIcon={
        view:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z"/><circle cx="12" cy="12" r="2.8"/></svg>',
        favorite:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3.5l2.6 5.3 5.8.8-4.2 4.1 1 5.8L12 16.8 6.8 19.5l1-5.8-4.2-4.1 5.8-.8L12 3.5Z"/></svg>',
        share:'<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.7 10.7l6.6-4.4M8.7 13.3l6.6 4.4"/></svg>',
        like:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 10v10H4a2 2 0 0 1-2-2v-6a2 2 0 0 1 2-2h3Zm0 0 4.3-6.2a2 2 0 0 1 3.6 1.4L14 9h4.8a2 2 0 0 1 2 2.3l-1.2 7A2 2 0 0 1 17.7 20H7"/></svg>',
        recommend:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3l1.9 5.8H20l-5 3.7 1.9 5.8L12 14.7l-4.9 3.6L9 12.5 4 8.8h6.1L12 3Z"/><path d="M19 20l2 2M5 20l-2 2"/></svg>',
        hot:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 22c4 0 7-2.7 7-6.7 0-3.2-2-5.3-4.2-7.5-.9 2.5-2.2 3.7-3.8 4.5.5-3.2-.6-5.9-3-8.3C7.8 7.7 5 10.2 5 15.3 5 19.3 8 22 12 22Z"/></svg>',
        boost:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 17l6-6 4 4 6-8"/><path d="M14 7h6v6"/></svg>',
        best:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0V4Z"/><path d="M7 6H4v2a3 3 0 0 0 3 3M17 6h3v2a3 3 0 0 1-3 3"/></svg>',
        image:'<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="8" cy="10" r="1.5"/><path d="M21 16l-5-5-4 4-2-2-5 5"/></svg>'
      };
      const metricChip=(icon,label,value,extraClass='')=>`<span class="admin-metric-chip ${extraClass}">${metricIcon[icon]||''}${label} ${value}</span>`;
      const metrics=`<div class="admin-metric-row">${metricChip('view','조회',item.viewCount||0)}${metricChip('favorite','즐겨찾기',item.favoriteCount||0)}${metricChip('share','공유',item.shareCount||0)}${metricChip('like','좋아요',item.likeCount||0)}${metricChip('recommend','추천',item.recommendCount||0)}${metricChip('hot','HOT',item.hotCount||0)}${item.rankBoost?metricChip('boost','가중치',item.rankBoost):''}${item.shareBest?`<span class="admin-metric-chip share-best">${metricIcon.best}공유 BEST</span>`:''}${item.badgeUp?`<span class="admin-metric-chip badge-up">UP</span>`:''}${item.badgeDeprecated?`<span class="admin-metric-chip badge-deprecated">삭제 예정</span>`:''}${item.thumbnailUrl?`<span class="admin-metric-chip">${metricIcon.image}썸네일</span>`:''}</div>`;
      const storeStatus=normalizeAdminStoreStatus(item);const benefitStatus=normalizeAdminBenefitStatus(item);const storeMeta=STORE_STATUS_META[storeStatus]||STORE_STATUS_META.active;const benefitMeta=BENEFIT_STATUS_META[benefitStatus]||BENEFIT_STATUS_META.active;const storeReason=item.closedReason||item.storeStatusReason||'';const benefitReason=item.benefitStatusReason||item.statusReason||item.discountStatusReason||'';return `<div class="mini-item-head"><div><h5>${item.name}</h5><div style="color:#64748b;font-size:13px;line-height:1.45;">${item.category} · ${item.discountText} · ${item.phone}</div><div class="benefit-date-line">${dateLine}</div><div class="tags">${isRecentlyUpdatedBenefit(item)?'<span class="tag updated-tag">최근 수정</span>':''}${item.recommended?'<span class="tag rec">추천</span>':''}${item.badgeUp?'<span class="tag up-badge-tag">UP</span>':''}${item.badgeDeprecated?'<span class="tag deprecated-badge-tag">삭제 예정</span>':''}${adminBenefitDateBadgeHtml(item)}${adminStatusTagHtml(storeMeta)}${adminStatusTagHtml(benefitMeta)}</div>${(storeReason||item.closedAt)?`<div class="benefit-date-line">매장 상태 ${item.closedAt||'-'}${storeReason?' · '+storeReason:''}</div>`:''}${(benefitReason||getAdminBenefitDateValue(item,'start')||getAdminBenefitDateValue(item,'end'))?`<div class="benefit-date-line">혜택 기간 ${getAdminBenefitDateValue(item,'start')||'미지정'} ~ ${getAdminBenefitDateValue(item,'end')||'미지정'}${benefitReason?' · '+benefitReason:''}</div>`:''}${supportProgramsBadgeHtml(item)}${couponLinksBadgeHtml(item)}${newsItemsBadgeHtml(item)}${metrics}</div><div class="tags" style="margin-top:0;"><button class="btn btn-soft edit-btn" style="padding:8px 10px;">수정</button><button class="btn btn-danger del-btn" style="padding:8px 10px;">삭제</button></div></div>`;
    }

    function renderAdminList(){
      const list=qs('#adminList');
      const dashboardList=qs('#dashboardBenefitList');
      if(list) list.innerHTML='';
      if(dashboardList) dashboardList.innerHTML='';
      if(!state.benefits.length){
        if(list) list.innerHTML='<div class="notice">등록된 항목이 없습니다.</div>';
        if(dashboardList) dashboardList.innerHTML='<div class="notice">등록된 항목이 없습니다.</div>';
        return;
      }
      const items=sortBenefits(state.benefits);
      items.forEach((item,index)=>{
        const html=buildBenefitItemHtml(item);
        if(list){
          const el=document.createElement('div');
          el.className='mini-item';
          el.innerHTML=html;
          el.querySelector('.edit-btn').onclick=()=>fillFormWithFreshDoc(item);
          el.querySelector('.del-btn').onclick=()=>deleteBenefit(item.id,item.name);
          list.appendChild(el);
        }
        if(dashboardList && index < 3){
          const el2=document.createElement('div');
          el2.className='mini-item';
          el2.innerHTML=html;
          el2.querySelector('.edit-btn').onclick=()=>{changeAdminView('benefits');fillFormWithFreshDoc(item);};
          el2.querySelector('.del-btn').onclick=()=>deleteBenefit(item.id,item.name);
          dashboardList.appendChild(el2);
        }
      });
    }
    function renderNoticeList(){const list=qs('#noticeAdminList');const dashboardList=qs('#dashboardNoticeList');if(list) list.innerHTML='';if(dashboardList) dashboardList.innerHTML='';if(!state.notices.length){if(list) list.innerHTML='<div class="notice">등록된 공지가 없습니다.</div>'; if(dashboardList) dashboardList.innerHTML='<div class="notice">등록된 공지가 없습니다.</div>'; return;}const items=[...state.notices].sort((a,b)=>{if(Number(b.pinned)!==Number(a.pinned)) return Number(b.pinned)-Number(a.pinned);const at=a.updatedAt?.seconds||a.createdAt?.seconds||0;const bt=b.updatedAt?.seconds||b.createdAt?.seconds||0;return bt-at;});items.forEach((item,index)=>{const html=`<div class="mini-item-head"><div><h5>${item.title}</h5><div style="color:#64748b;font-size:13px;line-height:1.55;white-space:pre-wrap;">${item.content.slice(0,80)}${item.content.length>80?'…':''}</div><div class="tags">${item.pinned?'<span class="tag rec">중요</span>':''}<span class="tag">${item.category}</span>${item.visible===false?'<span class="tag hidden-tag">비노출</span>':'<span class="tag live-tag">노출중</span>'}</div></div><div class="tags" style="margin-top:0;"><button class="btn btn-soft notice-edit-btn" style="padding:8px 10px;">수정</button><button class="btn btn-danger notice-del-btn" style="padding:8px 10px;">삭제</button></div></div>`; if(list){const el=document.createElement('div');el.className='mini-item';el.innerHTML=html;el.querySelector('.notice-edit-btn').onclick=()=>fillNoticeForm(item);el.querySelector('.notice-del-btn').onclick=()=>deleteNotice(item.id,item.title);list.appendChild(el);} if(dashboardList && index < 3){const el2=document.createElement('div');el2.className='mini-item';el2.innerHTML=html;el2.querySelector('.notice-edit-btn').onclick=()=>{fillNoticeForm(item);changeAdminView('notices');};el2.querySelector('.notice-del-btn').onclick=()=>deleteNotice(item.id,item.title);dashboardList.appendChild(el2);}});}
    function renderPushJobList(){const list=qs('#pushJobList');if(!list) return;list.innerHTML='';if(!state.pushJobs.length){list.innerHTML='<div class="notice">생성된 푸시 작업이 없습니다.</div>';return;}const items=[...state.pushJobs].sort((a,b)=>{const at=a.createdAt?.seconds||0;const bt=b.createdAt?.seconds||0;return bt-at;});items.forEach(item=>{const el=document.createElement('div');el.className='mini-item';el.innerHTML=`<div class="mini-item-head"><div><h5>${item.title||'제목 없음'}</h5><div style="color:#64748b;font-size:13px;line-height:1.55;white-space:pre-wrap;">${(item.body||'').slice(0,80)}${(item.body||'').length>80?'…':''}</div><div class="tags"><span class="tag">${item.status||'queued'}</span>${item.noticeId?`<span class="tag">notice:${item.noticeId}</span>`:''}</div></div></div>`;list.appendChild(el);});}
    async function queuePushJob({noticeId,title,body,pinned=false,targetType='all',targetUid='',targetBuilding='',targetUnit=''}){
      if(!state.isAdmin||!db) return;
      const safeNoticeId = String(noticeId || '').trim();
      const normalizedTarget = targetType === 'user' ? 'uid' : (targetType || 'all');
      const clickUrl = safeNoticeId
        ? `${window.location.origin}/app?view=notices&noticeId=${encodeURIComponent(safeNoticeId)}`
        : `${window.location.origin}/app?view=notices`;

      await addDoc(collection(db,PUSH_JOBS_COLLECTION),{
        type:'notice',
        target: normalizedTarget,
        noticeId:safeNoticeId,
        title:title||'새 공지',
        body:body||'',
        important:!!pinned,
        clickUrl,
        targetUid:targetUid||'',
        targetBuilding:targetBuilding||'',
        targetUnit:targetUnit||'',
        env: ENV,
        projectId: firebaseConfig.projectId || '',
        messagingSenderId: firebaseConfig.messagingSenderId || '',
        origin: window.location.origin,
        status:'queued',
        createdAt:serverTimestamp()
      });
    }
    function setGeoStatus(message, type=''){
      const el = qs('#geoStatus');
      if(!el) return;
      el.textContent = message;
      el.classList.remove('success','error');
      if(type) el.classList.add(type);
    }

    function makeNaverMapSearchUrl(address){
      return `https://map.naver.com/p/search/${encodeURIComponent(address || '')}`;
    }

    function isValidKoreaCoord(lat, lng){
      return Number.isFinite(lat) && Number.isFinite(lng) && lat >= 33 && lat <= 39.5 && lng >= 124 && lng <= 132;
    }

    function getBenefitAddressPartsFromForm(){
      const zipcode = String(qs('#zipcode')?.value || '').trim();
      const road = String(qs('#roadAddress')?.value || '').trim();
      const jibun = String(qs('#jibunAddress')?.value || '').trim();
      const detail = String(qs('#detailAddress')?.value || '').trim();
      const legacy = String(qs('#address')?.value || '').trim();
      const main = road || jibun || legacy;
      const display = [main, detail].filter(Boolean).join(' ');
      return { zipcode, road, jibun, detail, main, display };
    }

    function readBenefitAddressParts(item = {}){
      const nested = item.addressParts || (item.address && typeof item.address === 'object' ? item.address : {});
      const zipcode = String(item.zipcode || nested.zipcode || nested.postalCode || '').trim();
      const road = String(item.roadAddress || nested.road || nested.roadAddress || '').trim();
      const jibun = String(item.jibunAddress || nested.jibun || nested.jibunAddress || '').trim();
      const detail = String(item.detailAddress || nested.detail || nested.detailAddress || '').trim();
      const legacy = String(typeof item.address === 'string' ? item.address : (item.displayAddress || nested.display || '')).trim();
      const main = road || jibun || legacy;
      const display = String(item.displayAddress || [main, detail].filter(Boolean).join(' ') || legacy).trim();
      return { zipcode, road, jibun, detail, main, display };
    }

    async function geocodeAddressByNaver(){
      if(!state.isAdmin || !db){
        await openModalAlert('관리자 로그인 후 좌표를 조회할 수 있습니다.', qs('#adminLoginId'));
        return null;
      }
      const addressParts = getBenefitAddressPartsFromForm();
      const address = addressParts.road || addressParts.jibun || addressParts.main;
      if(!address){
        await openModalAlert('도로명주소 또는 지번주소를 먼저 입력해 주세요.', qs('#roadAddress') || qs('#jibunAddress'));
        return null;
      }
      if(!GEOCODE_FUNCTION_URL){
        await openModalAlert('env-config.js의 API_URL에 geocodeAddress 함수 URL을 먼저 등록해 주세요.', qs('#roadAddress'));
        return null;
      }

      try{
        setGeoStatus('네이버 지도 API로 좌표를 조회하는 중입니다...', '');
        qs('#geocodeBtn').disabled = true;
        const idToken = await auth.currentUser?.getIdToken?.();
        const res = await fetch(GEOCODE_FUNCTION_URL, {
          method:'POST',
          headers:{
            'Content-Type':'application/json',
            ...(idToken ? { Authorization:`Bearer ${idToken}` } : {})
          },
          body:JSON.stringify({ address })
        });
        const data = await res.json().catch(() => ({}));

        // geocodeAddress 함수는 성공 시 { lat, lng, roadAddress, jibunAddress } 형태를 반환합니다.
        // 기존 data.ok 체크는 서버 응답 형식과 맞지 않아 정상 응답도 실패로 처리될 수 있어 제거합니다.
        if(!res.ok){
          const message = data?.error || data?.message || `좌표 조회 실패 (${res.status})`;
          throw new Error(message);
        }

        const lat = Number(data.lat);
        const lng = Number(data.lng);
        if(!isValidKoreaCoord(lat, lng)){
          throw new Error('조회된 좌표가 한국 범위를 벗어났습니다. 주소를 더 구체적으로 입력해 주세요.');
        }

        qs('#lat').value = String(lat);
        qs('#lng').value = String(lng);

        const resolvedRoadAddress = String(data.roadAddress || '').trim();
        const resolvedJibunAddress = String(data.jibunAddress || '').trim();
        const resolvedAddress = resolvedRoadAddress || resolvedJibunAddress || address;
        if(resolvedRoadAddress && qs('#roadAddress')) qs('#roadAddress').value = resolvedRoadAddress;
        if(resolvedJibunAddress && qs('#jibunAddress')) qs('#jibunAddress').value = resolvedJibunAddress;

        if(!String(qs('#url')?.value || '').trim()){
          qs('#url').value = makeNaverMapSearchUrl(resolvedAddress || address);
        }

        setGeoStatus(`좌표 조회 완료: 위도 ${lat}, 경도 ${lng}`, 'success');
        return { lat, lng, address: resolvedAddress };
      }catch(error){
        console.error('좌표 자동 조회 실패', error);
        qs('#lat').value = '';
        qs('#lng').value = '';
        setGeoStatus(error.message || '좌표 조회에 실패했습니다.', 'error');
        await openModalAlert(error.message || '좌표 조회에 실패했습니다.', qs('#roadAddress'));
        return null;
      }finally{
        qs('#geocodeBtn').disabled = false;
      }
    }

    async function validateBenefitForm(){
      const checks = [
        { el: qs('#name'), message: '매장명을 입력해 주세요.' },
        { el: qs('#category'), message: '카테고리를 입력해 주세요.' },
        { el: qs('#discountText'), message: '혜택 표기를 입력해 주세요.' },
        { el: qs('#condition'), message: '혜택 조건을 입력해 주세요.' },
        { el: { value: (getBenefitAddressPartsFromForm().road || getBenefitAddressPartsFromForm().jibun) }, message: '도로명주소 또는 지번주소를 입력해 주세요.' },
        { el: qs('#phone'), message: '전화번호를 입력해 주세요.' }
      ];

      for (const item of checks) {
        const value = String(item.el?.value || '').trim();
        if (!value) {
          await openModalAlert(item.message, item.el);
          return false;
        }
      }

      return true;
    }

    async function validateNoticeForm(){
      const checks = [
        { el: qs('#noticeTitle'), message: '공지 제목을 입력해 주세요.' },
        { el: qs('#noticeCategory'), message: '공지 구분을 입력해 주세요.' },
        { el: qs('#noticeContent'), message: '공지 내용을 입력해 주세요.' }
      ];

      for (const item of checks) {
        const value = String(item.el?.value || '').trim();
        if (!value) {
          await openModalAlert(item.message, item.el);
          return false;
        }
      }

      return true;
    }


    function getOpeningHoursFromForm(){
      const map=[
        ['mon','Mon'], ['tue','Tue'], ['wed','Wed'], ['thu','Thu'], ['fri','Fri'], ['sat','Sat'], ['sun','Sun']
      ];
      const result={};
      map.forEach(([day,key])=>{
        const closed=!!qs(`#oh${key}Closed`)?.checked;
        const open=String(qs(`#oh${key}Open`)?.value||'').trim();
        const close=String(qs(`#oh${key}Close`)?.value||'').trim();
        const breakStart=String(qs(`#oh${key}BreakStart`)?.value||'').trim();
        const breakEnd=String(qs(`#oh${key}BreakEnd`)?.value||'').trim();
        const lastOrder=String(qs(`#oh${key}LastOrder`)?.value||'').trim();
        const note=String(qs(`#oh${key}Note`)?.value||'').trim();
        if(closed || open || close || breakStart || breakEnd || lastOrder || note){
          result[day]={closed,open,close,breakStart,breakEnd,lastOrder,note};
        }
      });
      return Object.keys(result).length ? result : null;
    }

    function formatOpeningHoursManualText(openingHours){
      if(!openingHours || typeof openingHours !== 'object') return '';
      const labels={mon:'월',tue:'화',wed:'수',thu:'목',fri:'금',sat:'토',sun:'일'};
      const days=['mon','tue','wed','thu','fri','sat','sun'];
      const rows=days.map(day=>openingHours?.[day]||{});
      const allSame=rows.every(row=>{
        const first=rows[0]||{};
        return !!row && row.closed===first.closed && row.open===first.open && row.close===first.close && 
          row.breakStart===first.breakStart && row.breakEnd===first.breakEnd && row.lastOrder===first.lastOrder && !row.note && !first.note;
      });
      if(allSame && rows[0] && !rows[0].closed && rows[0].open && rows[0].close){
        const row=rows[0];
        const parts=[`매일 ${row.open} - ${row.close}`];
        if(row.breakStart && row.breakEnd) parts.push(`브레이크 ${row.breakStart} - ${row.breakEnd}`);
        if(row.lastOrder) parts.push(`라스트오더 ${row.lastOrder}`);
        return parts.join(' / ');
      }
      return days.map(day=>{
        const row=openingHours?.[day] || {};
        const label=labels[day];
        if(row.closed) return `${label} 휴무${row.note ? `(${row.note})` : ''}`;
        if(!row.open && !row.close) return '';
        const parts=[`${label} ${row.open || '?'} - ${row.close || '?'}`];
        if(row.breakStart && row.breakEnd) parts.push(`브레이크 ${row.breakStart} - ${row.breakEnd}`);
        if(row.lastOrder) parts.push(`라스트오더 ${row.lastOrder}`);
        if(row.note) parts.push(row.note);
        return parts.join(' / ');
      }).filter(Boolean).join(', ');
    }


    function normalizeOpeningHoursForForm(item){
      const src = item?.openingHoursManual || item?.openingHours || item?.businessHours || null;
      if(!src || typeof src !== 'object') return {};
      const days=['mon','tue','wed','thu','fri','sat','sun'];
      const result={};
      days.forEach(day=>{
        const raw = src?.[day];
        if(!raw) return;
        const row = Array.isArray(raw) ? (raw[0] || {}) : raw;
        result[day]={
          closed: !!(row.closed || row.isClosed),
          open: row.open || row.start || row.from || '',
          close: row.close || row.end || row.to || '',
          breakStart: row.breakStart || row.break_start || row.breakFrom || '',
          breakEnd: row.breakEnd || row.break_end || row.breakTo || '',
          lastOrder: row.lastOrder || row.last_order || '',
          note: row.note || row.memo || ''
        };
      });
      return result;
    }

    function setOpeningHoursToForm(openingHours){
      const map=[
        ['mon','Mon'], ['tue','Tue'], ['wed','Wed'], ['thu','Thu'], ['fri','Fri'], ['sat','Sat'], ['sun','Sun']
      ];
      map.forEach(([day,key])=>{
        const raw=openingHours?.[day];
        const first=Array.isArray(raw) ? (raw[0] || {}) : (raw || {});
        if(qs(`#oh${key}Closed`)) qs(`#oh${key}Closed`).checked=!!(first?.closed || first?.isClosed);
        if(qs(`#oh${key}Open`)) qs(`#oh${key}Open`).value=first?.open || first?.start || first?.from || '';
        if(qs(`#oh${key}Close`)) qs(`#oh${key}Close`).value=first?.close || first?.end || first?.to || '';
        if(qs(`#oh${key}BreakStart`)) qs(`#oh${key}BreakStart`).value=first?.breakStart || first?.break_start || first?.breakFrom || '';
        if(qs(`#oh${key}BreakEnd`)) qs(`#oh${key}BreakEnd`).value=first?.breakEnd || first?.break_end || first?.breakTo || '';
        if(qs(`#oh${key}LastOrder`)) qs(`#oh${key}LastOrder`).value=first?.lastOrder || first?.last_order || '';
        if(qs(`#oh${key}Note`)) qs(`#oh${key}Note`).value=first?.note || first?.memo || '';
      });
    }

    function applyDailyHoursToAllDays(){
      const fields=['Open','Close','BreakStart','BreakEnd','LastOrder'];
      const values={
        Open:qs('#dailyOpen')?.value||'',
        Close:qs('#dailyClose')?.value||'',
        BreakStart:qs('#dailyBreakStart')?.value||'',
        BreakEnd:qs('#dailyBreakEnd')?.value||'',
        LastOrder:qs('#dailyLastOrder')?.value||''
      };
      ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].forEach(day=>{
        if(qs(`#oh${day}Closed`)) qs(`#oh${day}Closed`).checked=false;
        fields.forEach(field=>{
          if(qs(`#oh${day}${field}`)) qs(`#oh${day}${field}`).value=values[field];
        });
      });
    }

    function clearOpeningHoursForm(){
      setOpeningHoursToForm({});
      ['#dailyOpen','#dailyClose','#dailyBreakStart','#dailyBreakEnd','#dailyLastOrder'].forEach(sel=>{
        if(qs(sel)) qs(sel).value='';
      });
      if(qs('#applyDailySameHours')) qs('#applyDailySameHours').checked=false;
    }

    function bindOpeningHoursButtons(){
      qs('#copyWeekdayHoursBtn')?.addEventListener('click',()=>{
        const open=qs('#ohMonOpen')?.value||'';
        const close=qs('#ohMonClose')?.value||'';
        ['Tue','Wed','Thu','Fri'].forEach(day=>{
          if(qs(`#oh${day}Open`)) qs(`#oh${day}Open`).value=open;
          if(qs(`#oh${day}Close`)) qs(`#oh${day}Close`).value=close;
        });
      });
      qs('#clearOpeningHoursBtn')?.addEventListener('click', clearOpeningHoursForm);
      qs('#applyDailySameHours')?.addEventListener('change',(e)=>{
        if(e.target.checked) applyDailyHoursToAllDays();
      });
      ['#dailyOpen','#dailyClose','#dailyBreakStart','#dailyBreakEnd','#dailyLastOrder'].forEach(sel=>{
        qs(sel)?.addEventListener('change',()=>{
          if(qs('#applyDailySameHours')?.checked) applyDailyHoursToAllDays();
        });
      });
    }


    async function saveBenefit(e){
      e.preventDefault();
      if(!state.isAdmin||!db){
        await openModalAlert('관리자 로그인 후 저장할 수 있습니다.', qs('#adminLoginId'));
        return;
      }

      const isValid = await validateBenefitForm();
      if(!isValid) return;

      let lat = Number(qs('#lat')?.value || 0);
      let lng = Number(qs('#lng')?.value || 0);
      if(!isValidKoreaCoord(lat, lng)){
        const geo = await geocodeAddressByNaver();
        if(!geo) return;
        lat = geo.lat;
        lng = geo.lng;
      }

      const openingHoursManualValue = getOpeningHoursFromForm();
      const businessHoursManualText = formatOpeningHoursManualText(openingHoursManualValue);
      const addressParts = getBenefitAddressPartsFromForm();
      const previousBenefitForAudit=getEditingBenefitSnapshot() || {};
      const auditNowMs=Date.now();
      const auditActor=getAdminAuditActor();
      const stationRows = applyAuditToArrayRows(getStationRows(), normalizeBenefitStations(previousBenefitForAudit), auditNowMs, auditActor);
      const supportProgramRowsForSave = applyAuditToArrayRows(getSupportProgramRowsFromForm(), normalizeSupportProgramRows(previousBenefitForAudit), auditNowMs, auditActor);
      const couponLinksForSave = applyAuditToArrayRows(getCouponLinksFromForm(), normalizeCouponLinks(previousBenefitForAudit), auditNowMs, auditActor);
      const newsItemsForSave = applyAuditToArrayRows(getNewsItemsFromForm(), normalizeNewsItems(previousBenefitForAudit), auditNowMs, auditActor);
      const primaryStationText = getPrimaryStationAccessText(stationRows);
      if(qs('#stationAccessText')) qs('#stationAccessText').value = primaryStationText;
      if(qs('#address')) qs('#address').value = addressParts.display;

      const selectedStoreStatus = qs('#storeStatus')?.value || 'active';
      const benefitEndDateValue = qs('#benefitEndedAt')?.value || '';
      const selectedBenefitStatus = resolveBenefitStatusByEndDate(benefitEndDateValue, qs('#benefitStatus')?.value || 'active');
      if(qs('#benefitStatus')) qs('#benefitStatus').value = selectedBenefitStatus;
      const selectedVisible = selectedStoreStatus === 'hidden' ? false : true;
      if(qs('#visible')) qs('#visible').checked = selectedVisible;
      const payload={
        name:qs('#name').value.trim(),
        category:qs('#category').value.trim(),
        discountText:qs('#discountText').value.trim(),
        discountValue:Number(qs('#discountValue').value||0),
        condition:qs('#condition').value.trim(),
        priceDetails:qs('#priceDetails')?.value.trim() || '',
        priceInfo:qs('#priceDetails')?.value.trim() || '',
        servicePriceText:qs('#priceDetails')?.value.trim() || '',
        servicePriceDetails:qs('#priceDetails')?.value.trim() || '',
        address:addressParts.display,
        zipcode:addressParts.zipcode,
        roadAddress:addressParts.road,
        jibunAddress:addressParts.jibun,
        detailAddress:addressParts.detail,
        displayAddress:addressParts.display,
        addressParts:{ zipcode:addressParts.zipcode, road:addressParts.road, jibun:addressParts.jibun, detail:addressParts.detail, display:addressParts.display },
        lat,
        lng,
        url:qs('#url').value.trim() || makeNaverMapSearchUrl(addressParts.main || addressParts.display),
        phone:qs('#phone').value.trim(),
        emergencyPhone:qs('#emergencyPhone')?.value.trim() || '',
        contact:{ phone:qs('#phone').value.trim(), emergency:qs('#emergencyPhone')?.value.trim() || '' },
        service:qs('#serviceType').value==='service',
        storeStatus:selectedStoreStatus,
        operationStatus:selectedStoreStatus,
        status:selectedStoreStatus,
        benefitStatus:selectedBenefitStatus,
        residentBenefitStatus:selectedBenefitStatus,
        discountStatus:selectedBenefitStatus,
        closed:selectedStoreStatus === 'shutdown',
        closedAt:qs('#closedAt')?.value || '',
        closedReason:qs('#closedReason')?.value.trim() || '',
        storeStatusReason:qs('#closedReason')?.value.trim() || '',
        benefitStartedAt:qs('#benefitStartedAt')?.value || '',
        benefitStartDate:qs('#benefitStartedAt')?.value || '',
        discountStartedAt:qs('#benefitStartedAt')?.value || '',
        benefitEndedAt:benefitEndDateValue,
        benefitEndDate:benefitEndDateValue,
        discountEndedAt:benefitEndDateValue,
        benefitStatusReason:qs('#benefitStatusReason')?.value.trim() || '',
        discountStatusReason:qs('#benefitStatusReason')?.value.trim() || '',
        visible:selectedVisible,
        recommended:qs('#recommended').checked,
        shareBest:qs('#shareBest')?.checked || false,
        badgeUp:qs('#badgeUp')?.checked || false,
        badgeDeprecated:qs('#badgeDeprecated')?.checked || false,
        rankBoost:Number(qs('#rankBoost')?.value || 0),
        thumbnailUrl:qs('#thumbnailUrl')?.value.trim() || '',
        detailImages:getDetailImageUrlsFromForm(),
        detailImageUrls:getDetailImageUrlsFromForm(),
        benefitDetailImages:getDetailImageUrlsFromForm(),
        shareDescription:qs('#shareDescription')?.value.trim() || '',
        homepageUrl:qs('#homepageUrl')?.value.trim() || '',
        blogUrl:qs('#blogUrl')?.value.trim() || '',
        instagramUrl:qs('#instagramUrl')?.value.trim() || '',
        youtubeUrl:qs('#youtubeUrl')?.value.trim() || '',
        facebookUrl:qs('#facebookUrl')?.value.trim() || '',
        smartstoreUrl:qs('#smartstoreUrl')?.value.trim() || '',
        bandUrl:qs('#bandUrl')?.value.trim() || '',
        naverReservationEnabled:!!qs('#naverReservationEnabled')?.checked,
        naverBookingEnabled:!!qs('#naverReservationEnabled')?.checked,
        reservationEnabled:!!qs('#naverReservationEnabled')?.checked,
        naverReservationUrl:qs('#naverReservationUrl')?.value.trim() || '',
        naverBookingUrl:qs('#naverReservationUrl')?.value.trim() || '',
        reservationUrl:qs('#naverReservationUrl')?.value.trim() || '',
        reservation:{ type:'naver', enabled:!!qs('#naverReservationEnabled')?.checked, url:qs('#naverReservationUrl')?.value.trim() || '' },
        naverOrderEnabled:!!qs('#naverOrderEnabled')?.checked,
        naverSmartOrderEnabled:!!qs('#naverOrderEnabled')?.checked,
        orderEnabled:!!qs('#naverOrderEnabled')?.checked,
        naverOrderUrl:qs('#naverOrderUrl')?.value.trim() || '',
        naverSmartOrderUrl:qs('#naverOrderUrl')?.value.trim() || '',
        orderUrl:qs('#naverOrderUrl')?.value.trim() || '',
        order:{ type:'naver', enabled:!!qs('#naverOrderEnabled')?.checked, url:qs('#naverOrderUrl')?.value.trim() || '' },
        naverDeliveryEnabled:!!qs('#naverDeliveryEnabled')?.checked,
        deliveryEnabled:!!qs('#naverDeliveryEnabled')?.checked,
        naverDeliveryUrl:qs('#naverDeliveryUrl')?.value.trim() || '',
        deliveryUrl:qs('#naverDeliveryUrl')?.value.trim() || '',
        delivery:{ type:'naver', enabled:!!qs('#naverDeliveryEnabled')?.checked, url:qs('#naverDeliveryUrl')?.value.trim() || '' },
        naverTalkEnabled:!!qs('#naverTalkEnabled')?.checked,
        talkTalkEnabled:!!qs('#naverTalkEnabled')?.checked,
        talkEnabled:!!qs('#naverTalkEnabled')?.checked,
        naverTalkUrl:qs('#naverTalkUrl')?.value.trim() || '',
        talkTalkUrl:qs('#naverTalkUrl')?.value.trim() || '',
        talkUrl:qs('#naverTalkUrl')?.value.trim() || '',
        talk:{ type:'naver', enabled:!!qs('#naverTalkEnabled')?.checked, url:qs('#naverTalkUrl')?.value.trim() || '' },
        externalLinks:{
          homepage:qs('#homepageUrl')?.value.trim() || '',
          blog:qs('#blogUrl')?.value.trim() || '',
          instagram:qs('#instagramUrl')?.value.trim() || '',
          youtube:qs('#youtubeUrl')?.value.trim() || '',
          facebook:qs('#facebookUrl')?.value.trim() || '',
          smartstore:qs('#smartstoreUrl')?.value.trim() || '',
          band:qs('#bandUrl')?.value.trim() || '',
          naverReservation:qs('#naverReservationUrl')?.value.trim() || '',
          naverOrder:qs('#naverOrderUrl')?.value.trim() || '',
          naverDelivery:qs('#naverDeliveryUrl')?.value.trim() || '',
          naverTalk:qs('#naverTalkUrl')?.value.trim() || ''
        },
        deliveryAvailable:!!qs('#deliveryAvailable')?.checked,
        takeoutAvailable:!!qs('#takeoutAvailable')?.checked,
        serviceMemo:qs('#serviceMemo')?.value.trim() || '',
        directionText:qs('#directionText')?.value.trim() || '',
        directionGuide:qs('#directionText')?.value.trim() || '',
        stations:stationRows,
        stationAccessList:stationRows,
        stationAccessText:primaryStationText,
        transitText:primaryStationText,
        serviceTags:{
          delivery:!!qs('#deliveryAvailable')?.checked,
          takeout:!!qs('#takeoutAvailable')?.checked,
          memo:qs('#serviceMemo')?.value.trim() || ''
        },
        supportProgramItems:supportProgramRowsForSave,
        governmentSupportItems:supportProgramRowsForSave,
        supportPrograms:{
          enabled:supportProgramRowsForSave.length > 0,
          programs:supportProgramRowsForSave.map(row=>row.name),
          items:supportProgramRowsForSave
        },
        supportProgramNames:supportProgramRowsForSave.map(row=>row.name),
        supportProgramsText:supportProgramRowsForSave.map(row=>row.name).join(' · '),
        supportProgramStartedAt:supportProgramRowsForSave[0]?.startedAt || '',
        supportProgramStartDate:supportProgramRowsForSave[0]?.startedAt || '',
        governmentSupportStartedAt:supportProgramRowsForSave[0]?.startedAt || '',
        supportProgramEndedAt:supportProgramRowsForSave[0]?.endedAt || '',
        supportProgramEndDate:supportProgramRowsForSave[0]?.endedAt || '',
        governmentSupportEndedAt:supportProgramRowsForSave[0]?.endedAt || '',
        couponLinks:couponLinksForSave,
        coupons:couponLinksForSave,
        couponLinksText:couponLinksForSave.map(row=>`${row.title}|${row.url}`).join('\n'),
        newsItems:newsItemsForSave,
        storeNews:newsItemsForSave,
        newsItemsText:newsItemsForSave.map(row=>`${row.title}|${row.badge}|${row.imageUrl}|${row.date}|${row.url}`).join('\n'),
        openingHours:openingHoursManualValue,
        openingHoursManual:openingHoursManualValue,
        businessHoursManual:businessHoursManualText,
        openingHoursSource:openingHoursManualValue ? 'admin' : '',
        businessHoursSource:openingHoursManualValue ? 'admin' : '',
        updatedByUid:auditActor.uid,
        updatedByName:auditActor.name,
        updatedAt:serverTimestamp()
      };

      try{
        showGlobalLoading();
        const editId=qs('#editId').value;
        if(editId){
          await updateDoc(doc(db,BENEFITS_COLLECTION,editId),payload);
          // 저장 직후 목록에 이전 상태가 남아 보이지 않도록 로컬 상태도 즉시 동기화합니다.
          state.benefits = (state.benefits || []).map(item => item.id === editId ? sanitizeBenefit({...item, ...payload}, editId) : item);
          updateStats();
          renderAdminList();
        }else{
          const addedRef = await addDoc(collection(db,BENEFITS_COLLECTION),{
            ...payload,
            createdAt:serverTimestamp(),
            registeredAt:serverTimestamp(),
            createdByUid:auditActor.uid,
            createdByName:auditActor.name,
            registeredByUid:auditActor.uid,
            registeredByName:auditActor.name
          });
          state.benefits = [sanitizeBenefit({...payload}, addedRef.id), ...(state.benefits || [])];
          updateStats();
          renderAdminList();
        }
        hideGlobalLoading();
        resetForm();
        await openModalAlert('혜택 정보가 저장되었습니다.', qs('#name'));
      }catch(e){
        console.error(e);
        hideGlobalLoading();
        await openModalAlert('저장에 실패했습니다.', qs('#name'));
      }
    }
    async function saveNotice(e){
      e.preventDefault();
      if(!state.isAdmin||!db){
        await openModalAlert('관리자 로그인 후 저장할 수 있습니다.', qs('#adminLoginId'));
        return;
      }

      const isValid = await validateNoticeForm();
      if(!isValid) return;

      const sendPush=qs('#sendPushWithNotice').checked;
      const pushTitle=qs('#pushTitle').value.trim();
      const pushBody=qs('#pushBody').value.trim();
      const forcePinned=qs('#pushImportantOnly').checked;
      const targetType=String(qs('#pushTargetType')?.value || 'all').trim();
      const targetUid=String(qs('#pushTargetUid')?.value || '').trim();
      const targetBuilding=String(qs('#pushTargetBuilding')?.value || '').trim();
      const targetUnit=String(qs('#pushTargetUnit')?.value || '').trim();
      const payload={
        title:qs('#noticeTitle').value.trim(),
        category:qs('#noticeCategory').value.trim()||'일반',
        content:qs('#noticeContent').value.trim(),
        visible:qs('#noticeVisible').checked,
        pinned:qs('#noticePinned').checked||forcePinned,
        updatedAt:serverTimestamp()
      };

      try{
        showGlobalLoading();
        const editId=qs('#noticeEditId').value;
        let noticeId=editId;
        if(editId){
          await updateDoc(doc(db,NOTICES_COLLECTION,editId),payload);
        }else{
          const ref=await addDoc(collection(db,NOTICES_COLLECTION),{...payload,createdAt:serverTimestamp()});
          noticeId=ref.id;
        }
        if(sendPush){
          await queuePushJob({noticeId,title:pushTitle||payload.title,body:pushBody||payload.content.slice(0,120),pinned:payload.pinned,targetType,targetUid,targetBuilding,targetUnit});
        }
        hideGlobalLoading();
        resetNoticeForm();
        await openModalAlert(sendPush?'공지 저장 및 푸시 작업 생성이 완료되었습니다.':'공지 정보가 저장되었습니다.', qs('#noticeTitle'));
      }catch(e){
        console.error(e);
        hideGlobalLoading();
        await openModalAlert('공지 저장에 실패했습니다.', qs('#noticeTitle'));
      }
    }
    async function deleteBenefit(id,name){
      if(!state.isAdmin||!db){
        await openModalAlert('관리자 로그인 후 삭제할 수 있습니다.', qs('#adminLoginId'));
        return;
      }
      const confirmed = await openModalConfirm(`"${name}" 항목을 삭제할까요?`, qs('#adminList'), '삭제 확인', '삭제', '취소');
      if(!confirmed) return;

      try{
        showGlobalLoading();
        await deleteDoc(doc(db,BENEFITS_COLLECTION,id));
        hideGlobalLoading();
      }catch(e){
        console.error(e);
        hideGlobalLoading();
        await openModalAlert('삭제에 실패했습니다.', qs('#adminList'));
      }
    }
    async function deleteNotice(id,title){
      if(!state.isAdmin||!db){
        await openModalAlert('관리자 로그인 후 삭제할 수 있습니다.', qs('#adminLoginId'));
        return;
      }
      const confirmed = await openModalConfirm(`"${title}" 공지를 삭제할까요?`, qs('#noticeAdminList'), '삭제 확인', '삭제', '취소');
      if(!confirmed) return;

      try{
        showGlobalLoading();
        await deleteDoc(doc(db,NOTICES_COLLECTION,id));
        hideGlobalLoading();
      }catch(e){
        console.error(e);
        hideGlobalLoading();
        await openModalAlert('공지 삭제에 실패했습니다.', qs('#noticeAdminList'));
      }
    }
    async function loginAdmin(){
      if(state.isAdmin || auth?.currentUser){
        updateAdminLoginControls(true);
        return;
      }
      if(!auth){
        await openModalAlert('Firebase 설정을 확인해 주세요.', qs('#adminLoginId'));
        return;
      }
      const loginId=String(qs('#adminLoginId')?.value||'').trim().toLowerCase();
      const password=qs('#adminPassword').value;
      if(!loginId){
        await openModalAlert('아이디를 입력해 주세요.', qs('#adminLoginId'));
        return;
      }
      if(!password){
        await openModalAlert('비밀번호를 입력해 주세요.', qs('#adminPassword'));
        return;
      }

      try{
        showGlobalLoading();
        const response = await fetch(LOGIN_FUNCTION_URL, {
          method:'POST',
          headers:{ 'Content-Type':'application/json' },
          body: JSON.stringify({ loginId, password })
        });

        const raw = await response.text();
        let data = {};
        try{
          data = raw ? JSON.parse(raw) : {};
        }catch(_){
          data = { ok:false, message: raw || '로그인 응답을 확인할 수 없습니다.' };
        }

        if(!response.ok || !data.ok){
          throw new Error(data.message || '로그인에 실패했습니다.');
        }

        await setPersistence(auth, browserLocalPersistence);
        const credential = await signInWithCustomToken(auth, data.token);
        saveLoginSession({ ...(data.user || {}), uid: credential.user?.uid || data.user?.uid || data.uid || '', loginId }, data.sessionId || data.user?.sessionId || '');
        qs('#adminPassword').value='';
        hideGlobalLoading();
      }catch(e){
        console.error(e);
        hideGlobalLoading();
        await openModalAlert(e?.message || '로그인에 실패했습니다.', qs('#adminPassword'));
      }
    }
    const logoutAdmin=async()=>{
      if(!auth) return;
      const confirmed = await openModalConfirm('로그아웃 하시겠습니까?', qs('#logoutBtn'), '로그아웃', '로그아웃', '취소');
      if(!confirmed) return;
      try{
        showGlobalLoading();
        await secureAdminSignOut();
      }catch(e){
        console.error(e);
        hideGlobalLoading();
        resetAdminSensitiveUI();
        await openModalAlert('로그아웃 처리 중 오류가 발생했습니다. 화면의 민감 데이터는 초기화했습니다.', qs('#logoutBtn'));
      }
    };
    const exportBenefits=async()=>{
      const blob=new Blob([JSON.stringify({benefits:state.benefits,notices:state.notices,pushJobs:state.pushJobs},null,2)],{type:'application/json'});
      const a=document.createElement('a');
      a.href=URL.createObjectURL(blob);
      a.download='myhills-firestore-export.json';
      a.click();
      URL.revokeObjectURL(a.href);
    };
    function formatTs(ts){
      if(!ts) return '-';
      try{
        const date = ts?.toDate ? ts.toDate() : new Date(ts);
        if(Number.isNaN(date.getTime())) return '-';
        return new Intl.DateTimeFormat('ko-KR',{dateStyle:'medium', timeStyle:'short'}).format(date);
      }catch(_){
        return '-';
      }
    }
    function sanitizeMember(item={},id=''){
      return {
        id,
        uid:item.uid||id,
        nickname:item.nickname||'',
        role:item.role||'resident',
        accountStatus:item.accountStatus||'active',
        createdAt:item.createdAt||null,
        updatedAt:item.updatedAt||null,
        withdrawnAt:item.withdrawnAt||null,
        withdrawnBy:item.withdrawnBy||'',
        withdrawReason:item.withdrawReason||'',
        restoredAt:item.restoredAt||null,
        restoredBy:item.restoredBy||'',
        restoreReason:item.restoreReason||'',
        loginId:item.loginId||'',
        memberType:item.memberType||''
      };
    }

    function getMemberBuckets(){
      const buckets={active:[],withdrawn:[]};
      state.members.forEach(member=>{
        if(member.accountStatus==='withdrawn'){ buckets.withdrawn.push(member); return; }
        buckets.active.push(member);
      });
      return buckets;
    }

    function renderMemberGroup(listEl, members, emptyText){
      if(!listEl) return;
      listEl.innerHTML='';
      if(!members.length){
        listEl.innerHTML=`<div class="member-empty">${emptyText}</div>`;
        return;
      }
      members.forEach(member=>{
        const item = member;
        const card=document.createElement('div');
        card.className='mini-item member-card';
        const isWithdrawn = member.accountStatus === 'withdrawn';
        const statusTags = [];
        statusTags.push(isWithdrawn ? '<span class="tag hidden-tag">탈퇴</span>' : '<span class="tag live-tag">이용 중</span>');
        const displayId = member.loginId || member.nickname || (member.uid ? `회원 ${String(member.uid).slice(0, 6)}` : '회원');
        const summaryStatus = isWithdrawn ? '탈퇴' : '이용 중';

        card.innerHTML = `
          <details class="member-accordion">
            <summary class="member-summary">
              <div class="member-summary-main">
                <strong>${displayId}</strong>
                <span>${summaryStatus}${member.memberType ? ` · ${member.memberType}` : ''}</span>
                <span>간단 가입 계정</span>
              </div>
              <div class="member-summary-side">
                <div class="tags">${statusTags.join('')}</div>
                <span class="accordion-arrow" aria-hidden="true">
                  <svg class="chevron-down-icon" viewBox="0 0 24 24" fill="none">
                    <path d="M6 9l6 6 6-6"></path>
                  </svg>
                  <svg class="chevron-up-icon" viewBox="0 0 24 24" fill="none">
                    <path d="M6 15l6-6 6 6"></path>
                  </svg>
                </span>
              </div>
            </summary>

            <div class="member-detail">
              <div class="member-meta">
                <div class="meta-group">
                  <div class="meta-item"><strong>아이디</strong><span>${member.loginId || '-'}</span></div>
                  <div class="meta-item"><strong>닉네임</strong><span>${member.nickname || '-'}</span></div>
                  <div class="meta-item"><strong>회원 구분</strong><span>${member.memberType || '-'}</span></div>
                  <div class="meta-item"><strong>이용 상태</strong><span>${summaryStatus}</span></div>
                  <div class="meta-item"><strong>가입일</strong><span>${formatTs(member.createdAt)}</span></div>
                  <div class="meta-item"><strong>최종 수정</strong><span>${formatTs(member.updatedAt)}</span></div>
                </div>

                ${member.withdrawReason ? `
                  <div class="meta-section">
                    <div class="meta-title">탈퇴 사유</div>
                    <div class="meta-content">${member.withdrawReason}</div>
                  </div>
                ` : ''}
              </div>

              <div class="member-action-sticky">
                ${isWithdrawn ? `<button class="btn btn-blue" type="button" data-member-action="restore" data-member-id="${member.id}">복구</button>` : `<button class="btn btn-soft" type="button" data-member-action="withdraw" data-member-id="${member.id}">탈퇴 처리</button>`}
              </div>
            </div>
          </details>
        `;
        listEl.appendChild(card);
      });
    }

    function clampMemberPage(type, total){
      const totalPages = Math.max(1, Math.ceil(total / MEMBER_PAGE_SIZE));
      memberPaging[type] = Math.min(Math.max(1, Number(memberPaging[type]) || 1), totalPages);
      return { page: memberPaging[type], totalPages };
    }

    function getMemberPageSlice(type, members){
      const { page, totalPages } = clampMemberPage(type, members.length);
      const startIndex = (page - 1) * MEMBER_PAGE_SIZE;
      return {
        page,
        totalPages,
        startIndex,
        endIndex: Math.min(startIndex + MEMBER_PAGE_SIZE, members.length),
        items: members.slice(startIndex, startIndex + MEMBER_PAGE_SIZE)
      };
    }

    function renderMemberListCount(selector, total, pageInfo){
      const el = qs(selector);
      if(!el) return;
      if(!total){ el.textContent = '0명'; return; }
      el.textContent = `전체 ${total}명 · ${pageInfo.startIndex + 1}-${pageInfo.endIndex} / ${total}`;
    }

    function renderMemberPagination(type, total, pageInfo){
      const el = qs(type === 'active' ? '#memberActivePagination' : '#memberWithdrawnPagination');
      if(!el) return;
      if(total <= MEMBER_PAGE_SIZE){
        el.innerHTML = '';
        el.classList.add('hidden');
        return;
      }
      el.classList.remove('hidden');
      el.innerHTML = `
        <button class="member-page-btn" type="button" data-member-page="prev" data-member-page-type="${type}" ${pageInfo.page <= 1 ? 'disabled' : ''}>이전</button>
        <span class="member-page-status">${pageInfo.page} / ${pageInfo.totalPages} 페이지</span>
        <button class="member-page-btn" type="button" data-member-page="next" data-member-page-type="${type}" ${pageInfo.page >= pageInfo.totalPages ? 'disabled' : ''}>다음</button>
      `;
    }

    function renderMemberLists(){
      const buckets = getMemberBuckets();
      const activeCount = buckets.active.length;
      const withdrawnCount = buckets.withdrawn.length;
      qs('#memberTotalCount').textContent = `${state.members.length}명`;
      const activeCountEl = qs('#countActiveMembers');
      if(activeCountEl) activeCountEl.textContent = String(activeCount);
      if(qs('#countWithdrawn')) qs('#countWithdrawn').textContent = String(withdrawnCount);

      const activePage = getMemberPageSlice('active', buckets.active);
      const withdrawnPage = getMemberPageSlice('withdrawn', buckets.withdrawn);

      renderMemberListCount('#activeListCount', activeCount, activePage);
      renderMemberListCount('#withdrawnListCount', withdrawnCount, withdrawnPage);
      renderMemberGroup(qs('#memberActiveList'), activePage.items, '이용 중인 회원이 없습니다.');
      renderMemberGroup(qs('#memberWithdrawnList'), withdrawnPage.items, '탈퇴 상태 회원이 없습니다.');
      renderMemberPagination('active', activeCount, activePage);
      renderMemberPagination('withdrawn', withdrawnCount, withdrawnPage);
    }

    function moveMemberPage(type, direction){
      const buckets = getMemberBuckets();
      const list = type === 'withdrawn' ? buckets.withdrawn : buckets.active;
      const totalPages = Math.max(1, Math.ceil(list.length / MEMBER_PAGE_SIZE));
      const delta = direction === 'next' ? 1 : -1;
      memberPaging[type] = Math.min(Math.max(1, (Number(memberPaging[type]) || 1) + delta), totalPages);
      renderMemberLists();
      const target = qs(type === 'withdrawn' ? '#memberWithdrawnList' : '#memberActiveList');
      target?.scrollIntoView?.({ behavior:'smooth', block:'start' });
    }

    async function updateMemberStatus(memberId, action){
      if(!state.isAdmin || !db){
        await openModalAlert('관리자 로그인 후 처리할 수 있습니다.', qs('#adminLoginId'));
        return;
      }

      const member = state.members.find(item => item.id === memberId);
      if(!member) return;
      const adminEmail = auth?.currentUser?.email || 'admin';
      const payload = { updatedAt: serverTimestamp() };
      let message = '처리가 완료되었습니다.';

      if(action === 'restore'){
        const confirmed = await openModalConfirm(
          `${member.loginId || member.nickname || member.uid || '선택한 회원'} 계정을 복구할까요?`,
          qs('#view-members'),
          '회원 복구',
          '복구',
          '취소'
        );
        if(!confirmed) return;

        Object.assign(payload, {
          accountStatus:'active',
          approvalStatus:'approved',
          restoredAt:serverTimestamp(),
          restoredBy:adminEmail,
          restoreReason:'관리자 복구',
          withdrawReason:'',
          withdrawnAt:null,
          withdrawnBy:''
        });
        message = '회원 복구가 완료되었습니다.';

      } else if(action === 'withdraw'){
        const confirmed = await openModalConfirm(
          `${member.loginId || member.nickname || member.uid || '선택한 회원'} 계정을 탈퇴 상태로 변경할까요?`,
          qs('#view-members'),
          '탈퇴 처리',
          '처리',
          '취소'
        );
        if(!confirmed) return;

        Object.assign(payload, {
          accountStatus:'withdrawn',
          withdrawnAt:serverTimestamp(),
          withdrawnBy:adminEmail,
          withdrawReason:'관리자 처리'
        });
        message = '회원이 탈퇴 상태로 변경되었습니다.';

      } else {
        return;
      }

      try{
        showGlobalLoading();

        // 메일/개별 푸시는 관리자 페이지에서 직접 생성하지 않습니다.
        // users 문서 상태 변경을 Cloud Functions onUserStatusChanged가 감지해서 자동 처리합니다.
        await updateDoc(doc(db, USERS_COLLECTION, memberId), payload);

        hideGlobalLoading();
        await openModalAlert(message, qs('#view-members'));

      }catch(e){
        console.error(e);
        hideGlobalLoading();
        await openModalAlert('회원 상태 변경에 실패했습니다. 콘솔 오류를 확인해 주세요.', qs('#view-members'));
      }
    }

    async function subscribeMembers(){
      if(!requireAdminDataAccess()) return;
      // READ OPTIMIZED: 관리자 회원 목록은 실시간 구독 대신 1회 조회로 처리합니다.
      // 기존 limit(80) 때문에 운영계 회원 수가 80명으로 잘려 보이던 문제를 수정했습니다.
      try{
        const snapshot = await getDocs(query(
          collection(db, USERS_COLLECTION),
          orderBy('createdAt','desc')
        ));
        state.members = snapshot.docs.map(d=>sanitizeMember(d.data(),d.id));
        renderMemberLists();
        markInitialDataLoaded('users');
      }catch(e){
        console.error(e);
        markInitialDataLoaded('users');
      }
    }

    async function seedDefaultData(){
      if(!state.isAdmin||!db){
        await openModalAlert('관리자 로그인 후 실행해 주세요.', qs('#adminLoginId'));
        return;
      }
      const confirmed = await openModalConfirm('기본 데이터를 Firestore에 업로드할까요? 기존 데이터와 중복될 수 있습니다.', qs('#seedBtn'), '기본 데이터 업로드', '업로드', '취소');
      if(!confirmed) return;

      try{
        showGlobalLoading();
        const snapshot=await getDocs(collection(db,BENEFITS_COLLECTION));
        if(!snapshot.empty){
          hideGlobalLoading();
          const keepGoing=await openModalConfirm('이미 등록된 데이터가 있습니다. 그래도 추가 업로드할까요?', qs('#seedBtn'), '중복 데이터 확인', '계속', '취소');
          if(!keepGoing) return;
          showGlobalLoading();
        }
        const batch=writeBatch(db);
        DEFAULT_BENEFITS.forEach(item=>{
          const ref=doc(collection(db,BENEFITS_COLLECTION));
          batch.set(ref,{...item,createdAt:serverTimestamp(),updatedAt:serverTimestamp()});
        });
        await batch.commit();
        hideGlobalLoading();
        await openModalAlert('기본 데이터 업로드가 완료되었습니다.', qs('#seedBtn'));
      }catch(e){
        console.error(e);
        hideGlobalLoading();
        await openModalAlert('기본 데이터 업로드에 실패했습니다.', qs('#seedBtn'));
      }
    }
    async function subscribeBenefits(){
      if(!requireAdminDataAccess()) return;
      // READ OPTIMIZED: 혜택 목록은 관리자 진입 시 1회 조회합니다.
      try{
        // 공개앱과 동일하게 benefits 컬렉션 전체를 읽습니다.
        // 기존 orderBy('createdAt','desc')는 createdAt 필드가 없는 문서를 제외할 수 있어
        // 관리자 건수와 공개앱 건수가 달라지는 원인이 됩니다.
        const snapshot = await getDocs(collection(db, BENEFITS_COLLECTION));
        state.benefits = snapshot.docs
          .map(d=>sanitizeBenefit(d.data(),d.id))
          .sort((a,b)=>{
            const at = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : 0;
            const bt = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : 0;
            return bt - at;
          });
        mergeBenefitStatsIntoBenefits();
        updateStats();
        renderAdminList();
        markInitialDataLoaded('benefits');
      }catch(e){
        console.error(e);
        markInitialDataLoaded('benefits');
      }
    }

    async function subscribeBenefitStats(){
      if(!requireAdminDataAccess()) return;
      // READ OPTIMIZED: 통계도 실시간 구독하지 않고 필요한 수량만 조회합니다.
      try{
        const snapshot = await getDocs(query(
          collection(db, BENEFIT_STATS_COLLECTION),
          limit(200)
        ));
        const statsMap = {};
        snapshot.docs.forEach((d) => {
          statsMap[d.id] = d.data() || {};
        });
        state.benefitStats = statsMap;
        mergeBenefitStatsIntoBenefits();
        updateStats();
        renderAdminList();
      }catch(e){
        console.error('benefit_stats 조회 실패', e);
      }
    }

    async function subscribeNotices(){
      if(!requireAdminDataAccess()) return;
      // READ OPTIMIZED: 공지는 최근 항목만 1회 조회합니다.
      try{
        const snapshot = await getDocs(query(
          collection(db, NOTICES_COLLECTION),
          orderBy('createdAt','desc'),
          limit(50)
        ));
        state.notices = snapshot.docs.map(d=>sanitizeNotice(d.data(),d.id));
        updateStats();
        renderNoticeList();
        markInitialDataLoaded('notices');
      }catch(e){
        console.error(e);
        markInitialDataLoaded('notices');
      }
    }
    async function subscribePushJobs(){
      if(!requireAdminDataAccess()) return;
      // READ OPTIMIZED: 푸시 작업 목록은 최근 작업만 제한 조회합니다.
      try{
        const snapshot = await getDocs(query(
          collection(db, PUSH_JOBS_COLLECTION),
          orderBy('createdAt','desc'),
          limit(50)
        ));
        state.pushJobs = snapshot.docs.map(d=>({id:d.id,...(d.data()||{})}));
        updateStats();
        renderPushJobList();
        markInitialDataLoaded('pushJobs');
      }catch(e){
        console.error(e);
        markInitialDataLoaded('pushJobs');
      }
    }
    if(hasFirebaseConfig()){
      qs('#firebaseNotice').classList.add('hidden');
      const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
      auth=getAuth(app);
      db=getFirestore(app);
      storage=getStorage(app);
      const messaging=getMessaging(app);

      /* =========================
         Security Guard / Admin Session Check
         - Firestore 기반 관리자 권한 검증
         - activeSessionId 기반 중복 로그인 감지
         - security_logs 기록
      ========================= */
      const SECURITY_LOGS_COLLECTION = 'security_logs';

      function getStoredLoginUser(){
        try{
          return JSON.parse(localStorage.getItem('loginUser') || '{}') || {};
        }catch(_){
          return {};
        }
      }

      function saveVerifiedLoginUser(user, profile, sessionId){
        try{
          localStorage.setItem('loginUser', JSON.stringify({
            uid: user.uid,
            loginId: profile.loginId || profile.loginID || '',
            sessionId: sessionId || '',
            role: profile.role || profile.userRole || '',
            approvalStatus: profile.approvalStatus || '',
            phoneVerified: !!profile.phoneVerified,
            accountStatus: profile.accountStatus || ''
          }));
        }catch(error){
          console.warn('loginUser 저장 실패', error);
        }
      }

      async function writeSecurityLog(type, detail = {}){
        try{
          const stored = getStoredLoginUser();
          await addDoc(collection(db, SECURITY_LOGS_COLLECTION), {
            uid: auth.currentUser?.uid || stored.uid || null,
            loginId: state.adminProfile?.loginId || stored.loginId || null,
            type,
            path: location.pathname,
            href: location.href,
            userAgent: navigator.userAgent,
            detail,
            createdAt: serverTimestamp()
          });
        }catch(error){
          console.warn('보안 로그 저장 실패', error);
        }
      }

      async function load404Stats(){
        if(!db){
          return { total:0, recent:[], topPaths:[] };
        }

        try{
          const q404 = query(
            collection(db, SECURITY_LOGS_COLLECTION),
            where('type', '==', 'ERROR_404'),
            orderBy('createdAt', 'desc'),
            limit(50)
          );

          const snap = await getDocs(q404);
          const logs = snap.docs.map((docSnap) => ({
            id: docSnap.id,
            ...docSnap.data()
          }));

          const pathCount = {};
          logs.forEach((log) => {
            const path = log?.detail?.path || log.path || '(unknown)';
            pathCount[path] = (pathCount[path] || 0) + 1;
          });

          const topPaths = Object.entries(pathCount)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);

          return {
            total: logs.length,
            recent: logs,
            topPaths
          };
        }catch(error){
          console.warn('404 통계 조회 실패', error);
          return { total:0, recent:[], topPaths:[], error };
        }
      }

      async function render404Stats(){
        const box = qs('#security404Box');
        const count = qs('#security404Count');
        if(!box) return;

        if(!state.isAdmin || !db){
          box.innerHTML = '<div class="notice">관리자 로그인 후 404 접근 통계를 볼 수 있습니다.</div>';
          if(count) count.textContent = '최근 50건 기준';
          return;
        }

        box.innerHTML = '<div class="notice">404 접근 통계를 불러오는 중입니다.</div>';
        const stats = await load404Stats();

        if(count) count.textContent = `최근 ${stats.total}건`;

        if(stats.error){
          box.innerHTML = '<div class="notice">404 통계를 불러오지 못했습니다. security_logs 인덱스 또는 권한을 확인해 주세요.</div>';
          return;
        }

        if(!stats.total){
          box.innerHTML = '<div class="notice">최근 404 접근 기록이 없습니다.</div>';
          return;
        }

        const topHtml = stats.topPaths.map(([path, total]) => `
          <div class="mini-item">
            <div class="mini-item-head">
              <div style="min-width:0;">
                <h5 style="word-break:break-all;">${escapeHtml(path)}</h5>
                <div class="meta" style="color:#64748b;font-size:13px;margin-top:4px;">${total}회 접근</div>
              </div>
              <span class="tag hidden-tag">404</span>
            </div>
          </div>
        `).join('');

        const recentHtml = stats.recent.slice(0, 5).map((log) => {
          const path = log?.detail?.path || log.path || '(unknown)';
          const referrer = log?.detail?.referrer || log.referrer || '';
          const date = formatAdminDate(log.createdAt);
          return `
            <div class="mini-item">
              <h5 style="word-break:break-all;">${escapeHtml(path)}</h5>
              <div class="meta" style="color:#64748b;font-size:13px;line-height:1.55;margin-top:4px;">
                ${escapeHtml(date)}${referrer ? `<br>유입: ${escapeHtml(referrer)}` : ''}
              </div>
            </div>
          `;
        }).join('');

        box.innerHTML = `
          <div class="summary-row">
            <div><strong>404 접근</strong><span>최근 50건 기준</span></div>
            <strong>${stats.total}건</strong>
          </div>
          <div class="notice" style="margin-top:2px;">많이 입력된 잘못된 URL TOP 5</div>
          ${topHtml || '<div class="notice">집계할 URL이 없습니다.</div>'}
          <div class="notice" style="margin-top:2px;">최근 404 접근 5건</div>
          ${recentHtml || '<div class="notice">최근 접근 기록이 없습니다.</div>'}
        `;
      }

      window.render404Stats = render404Stats;

    /* =========================
       Foreground 시스템 알림 처리
       - PC 탭 활성 상태에서도 시스템 알림 표시
       - 백그라운드는 firebase-messaging-sw.js가 처리
    ========================= */
    function isDesktopForegroundPushTarget() {
      const ua = String(navigator.userAgent || '').toLowerCase();
      return !(
        ua.includes('android') ||
        ua.includes('iphone') ||
        ua.includes('ipad') ||
        ua.includes('mobile') ||
        ua.includes('samsungbrowser')
      );
    }

    function normalizeForegroundPushPayload(payload = {}) {
      const data = payload.data || {};
      return {
        title: String(data.title || payload.notification?.title || '알림'),
        body: String(data.body || payload.notification?.body || ''),
        url: String(data.url || data.clickUrl || data.link || payload.fcmOptions?.link || '/'),
        noticeId: String(data.noticeId || ''),
        type: String(data.type || 'notice')
      };
    }

    function buildForegroundPushTag(item) {
      return [item.type, item.noticeId, item.title, item.body, item.url].join('|');
    }

    function openForegroundPushUrl(url = '/') {
      const targetUrl = String(url || '/');
      try {
        const absoluteUrl = new URL(targetUrl, window.location.origin).href;
        window.location.replace(absoluteUrl);
      } catch (_) {
        window.location.replace('/');
      }
    }

    function setupForegroundSystemPush(messagingInstance) {
      if (!messagingInstance) return;

      onMessage(messagingInstance, (payload) => {
        try {
          if (!isDesktopForegroundPushTarget()) return;
          if (!('Notification' in window)) return;
          if (Notification.permission !== 'granted') return;

          const item = normalizeForegroundPushPayload(payload);
          const notification = new Notification(item.title, {
            body: item.body,
            icon: '/icons/icon-192.png',
            badge: '/icons/icon-192.png',
            tag: buildForegroundPushTag(item),
            renotify: false,
            data: {
              url: item.url,
              noticeId: item.noticeId,
              type: item.type
            }
          });

          notification.onclick = () => {
            window.focus();
            notification.close();
            openForegroundPushUrl(item.url);
          };
        } catch (error) {
          console.warn('foreground 시스템 알림 처리 실패', error);
        }
      });
    }

      setupForegroundSystemPush(messaging);

      onAuthStateChanged(auth, async (user) => {
        state.adminProfile = null;
        state.isAdmin = false;

        if(!user){
          resetAdminSensitiveUI();
          updateAdminHeader(null);
          hideGlobalLoading(80);
          return;
        }

        try{
          const userSnap = await getDoc(doc(db, USERS_COLLECTION, user.uid));
          const userData = userSnap.exists() ? (userSnap.data() || {}) : {};
          state.adminProfile = userData;

          const storedBeforeSessionCheck = getStoredLoginUser();
          const hasLocalSessionForAdmin = !!(storedBeforeSessionCheck?.sessionId);
          if(!hasLocalSessionForAdmin){
            resetAdminSensitiveUI();
            updateAdminHeader(null);
            setAdminDashboardLocked(true);
            hideGlobalLoading(80);
            try{ await signOut(auth); }catch(_e){}
            return;
          }

          const sessionResult = await checkServerSessionOrLogout({
            auth,
            api: API_URL[ENV],
            signOutFn: async (authInstance) => signOut(authInstance),
            redirectTo: '/',
            alertFn: null
          });
          if(!sessionResult?.valid){
            resetAdminSensitiveUI();
            updateAdminHeader(null);
            setAdminDashboardLocked(true);
            hideGlobalLoading(80);
            try{ await signOut(auth); }catch(_e){}
            return;
          }

          if(!window.__THEUNJEONGPICK_ADMIN_SESSION_KEEPALIVE__){
            window.__THEUNJEONGPICK_ADMIN_SESSION_KEEPALIVE__ = startSessionKeepAlive({
              auth,
              api: API_URL[ENV],
              signOutFn: async (authInstance) => signOut(authInstance),
              redirectTo: '/',
              alertFn: (message) => openModalAlert(message, qs('#adminLoginId')),
              intervalMs: 3 * 60 * 1000,
              checkEveryMs: 60 * 1000,
              requireActivity: true,
              adminMode: true,
              db,
              docFn: doc,
              onSnapshotFn: onSnapshot
            });
          }

          const stored = getStoredLoginUser();
          const localSessionId = stored.sessionId || '';
          const serverSessionId = sessionResult?.sessionId || userData.activeSessionId || '';

          const role = userData.role || userData.userRole || '';
          const isAdminRole = role === 'admin' || role === 'root' || role === 'superAdmin';
          const isActive = userData.accountStatus === 'active';

          if(userData.accountStatus === 'withdrawn'){
            await writeSecurityLog('WITHDRAWN_ACCOUNT_ACCESS', { accountStatus:userData.accountStatus });
            qs('#authStatusText').textContent='탈퇴 계정';
            updateAdminHeader(user);
            setAdminDashboardLocked(true);
            hideGlobalLoading(80);
            await openModalAlert('탈퇴된 계정입니다.', qs('#adminLoginId'));
            await secureAdminSignOut();
            return;
          }

          if(userData.accountStatus === 'blocked'){
            await writeSecurityLog('BLOCKED_ACCOUNT_ACCESS', {
              accountStatus:userData.accountStatus,
              blockedReason:userData.blockedReason || ''
            });
            qs('#authStatusText').textContent='차단 계정';
            updateAdminHeader(user);
            setAdminDashboardLocked(true);
            hideGlobalLoading(80);
            await openModalAlert('보안 정책에 따라 차단된 계정입니다.', qs('#adminLoginId'));
            await secureAdminSignOut();
            return;
          }

          if(!isAdminRole || !isActive){
            await writeSecurityLog('ADMIN_ACCESS_DENIED', {
              role,
              accountStatus:userData.accountStatus || ''
            });
            qs('#authStatusText').textContent='관리자 권한 없음';
            updateAdminHeader(user);
            setAdminDashboardLocked(true);
            hideGlobalLoading(80);
            await openModalAlert('관리자 권한이 있는 계정만 접근할 수 있습니다.', qs('#adminLoginId'));
            await secureAdminSignOut();
            return;
          }

          saveVerifiedLoginUser(user, userData, localSessionId || serverSessionId);

          state.isAdmin = true;
          adminAuthReady = true;
          updateAdminLoginControls(true);
          qs('#authStatusText').textContent=`로그인됨: ${userData.loginId || user.email || user.uid}`;
          updateAdminHeader(user);

          const timerHost = document.getElementById('adminIdleTimerHost');
          if (timerHost) {
            timerHost.classList.remove('hidden');
            timerHost.innerHTML = '';
            mountIdleTimer({
              containerSelector: "#adminIdleTimerHost",
              insertPosition: "beforeend"
            });
          }

          setAdminDashboardLocked(false);

          if (!adminDataSubscribed) {
            adminDataSubscribed = true;
            showGlobalLoading();
            await Promise.all([
              subscribeBenefits(),
              subscribeBenefitStats(),
              subscribeNotices(),
              subscribePushJobs(),
              subscribeMembers()
            ]);
          }

          if (typeof window.refreshAdminStatsUIOnce === 'function') {
            await window.refreshAdminStatsUIOnce();
          }

          if (typeof window.render404Stats === 'function') {
            await window.render404Stats();
            await loadCommunityReportTopPosts();
          }

          // READ OPTIMIZED: 관리자 대시보드 통계는 실시간/주기 갱신하지 않습니다.
          // 운영 비용 절감을 위해 로그인 시 1회만 조회하고, 필요 시 페이지 새로고침 또는 메뉴 재진입으로 다시 조회합니다.
          window.__adminDashboardIntervalStarted = false;
        }catch(error){
          console.error('관리자 권한 확인 실패', error);
          setAdminDashboardLocked(true);
          hideGlobalLoading(80);
          resetAdminSensitiveUI();
          await openModalAlert('관리자 권한을 확인할 수 없습니다.', qs('#adminLoginId'));
        }
      });
    }else{
      qs('#firebaseNotice').classList.remove('hidden');
    }
    qsa('[data-admin-view]').forEach(btn=>{btn.addEventListener('click',()=>changeAdminView(btn.dataset.adminView));});
    document.addEventListener('click', (event) => {
      const btn = event.target.closest('[data-admin-view]');
      if(!btn || !document.body.contains(btn)) return;
      if(btn.closest('form')) return;
      const view = btn.dataset.adminView;
      if(view && state.view !== view) changeAdminView(view);
    });
    const adminGnbToggleBtn = qs('#adminGnbToggleBtn');
    const adminGnbSheet = qs('#adminGnbSheet');
    const adminGnbOverlay = qs('#adminGnbOverlay');
    const adminGnbCloseBtn = qs('#adminGnbCloseBtn');
    function openAdminGnb(){
      if(adminGnbSheet){
        adminGnbSheet.classList.remove('is-closing','upick-motion-closing');
        adminGnbSheet.classList.add('show');
        adminGnbSheet.setAttribute('aria-hidden','false');
        adminGnbSheet.classList.remove('gnb-enter');
        requestAnimationFrame(() => adminGnbSheet?.classList.add('gnb-enter'));
      }
      if(window.UpickMotion && adminGnbOverlay){
        window.UpickMotion.open(adminGnbOverlay, { duration:220 });
      }else{
        adminGnbOverlay?.classList.add('show');
      }
      document.body.style.overflow='hidden';
      document.body.classList.add('gnb-open');
      const homeBtn = adminGnbSheet?.querySelector('.gnb-home-active');
      if(homeBtn){
        homeBtn.animate(
          [{ transform:'translateY(0)', opacity:1 }, { transform:'translateY(-1px)', opacity:1 }],
          { duration:180, easing:'ease-out' }
        );
      }
    }
    function closeAdminGnb(){
      if(window.UpickMotion?.isClosing?.(adminGnbOverlay)) return;
      adminGnbCloseBtn?.animate(
        [{ transform:'scale(1) rotate(0deg)' }, { transform:'scale(.94) rotate(-8deg)' }, { transform:'scale(1) rotate(0deg)' }],
        { duration:180, easing:'ease-out' }
      );
      adminGnbSheet?.classList.add('is-closing','upick-motion-closing');
      adminGnbSheet?.classList.remove('show');
      adminGnbSheet?.setAttribute('aria-hidden','true');
      const finishClose = () => {
        adminGnbSheet?.classList.remove('is-closing','upick-motion-closing','gnb-enter');
        document.body.style.overflow='';
        document.body.classList.remove('gnb-open');
      };
      if(window.UpickMotion && adminGnbOverlay){
        window.UpickMotion.close(adminGnbOverlay, { duration:240, afterClose: finishClose });
      }else{
        adminGnbOverlay?.classList.remove('show');
        setTimeout(finishClose, 240);
      }
    }
    adminGnbToggleBtn?.addEventListener('click', openAdminGnb);
    adminGnbCloseBtn?.addEventListener('click', closeAdminGnb);
    adminGnbOverlay?.addEventListener('click', closeAdminGnb);
    window.addEventListener('keydown', (event) => {
      if(event.key === 'Escape' && adminGnbSheet?.classList.contains('show')){
        closeAdminGnb();
      }
    });


    /* =========================
       AI 생활 도우미 관리자
    ========================= */
    const aiAdminState = { tab:'faq', editing:null, tabReady:false, logs:{pageSize:20, cursors:[], page:1, lastDoc:null, hasNext:false, search:'', mode:'latest'}, conversations:{pageSize:20, cursors:[], page:1, lastDoc:null, hasNext:false, search:'', mode:'latest'} };

    function splitKeywords(value=''){
      return String(value || '')
        .split(',')
        .map(v => v.trim())
        .filter(Boolean);
    }

    function joinKeywords(value){
      return Array.isArray(value) ? value.join(', ') : valueToText(value || '');
    }

    function formatAiAdminDate(value){
      try{
        const d = value?.toDate ? value.toDate() : (value ? new Date(value) : null);
        if(!d || Number.isNaN(d.getTime())) return '-';
        return `${d.getFullYear()}.${String(d.getMonth()+1).padStart(2,'0')}.${String(d.getDate()).padStart(2,'0')} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
      }catch(e){ return '-'; }
    }

    function setAiActiveTab(tab){
      aiAdminState.tab = tab;
      qsa('.ai-manager-tab').forEach(btn => btn.classList.toggle('active', btn.dataset.aiTab === tab));
    }

    async function refreshAiMetrics(){
      const sets = [
        ['aiMetricFaq', 'ai_faq'],
        ['aiMetricBooklet', 'ai_booklet_pages'],
        ['aiMetricGuide', 'ai_guide_pages'],
        ['aiMetricLogs', 'ai_chat_logs']
      ];
      await Promise.all(sets.map(async ([id, col]) => {
        const el = qs(`#${id}`);
        if(!el) return;
        try{
          const snap = await getDocs(query(collection(db, col), limit(99)));
          el.textContent = String(snap.size);
        }catch(error){
          el.textContent = '-';
        }
      }));
    }

    function openAIManager(tab='faq'){
      if(!qs('#aiAdminContent')) return;
      setAiActiveTab(tab);
      refreshAiMetrics();
      if(tab === 'faq') return loadAiFaq();
      if(tab === 'booklet') return loadAiBooklet();
      if(tab === 'guide') return loadAiGuide();
      if(tab === 'settings') return loadAiSettings();
      if(tab === 'voice') return loadAiVoiceTest();
      if(tab === 'logs') return loadAiLogs();
      if(tab === 'conversations') return loadAiConversations();
    }
    window.openAIManager = openAIManager;

    function renderAiFormHeader(title, desc){
      return `<div class="ai-admin-toolbar"><div><h3 style="margin:0;font-size:16px;">${escapeHtml(title)}</h3><small style="display:block;margin-top:4px;color:#64748b;line-height:1.45;">${escapeHtml(desc)}</small></div></div>`;
    }


    const AI_ATTACHMENT_ACCEPT = 'image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.hwp,.hwpx,.txt';
    const AI_ATTACHMENT_MAX_SIZE = 10 * 1024 * 1024;

    function getAiAttachmentInputHtml(kind){
      return `<div class="ai-attachment-field">
        <label>사진 / 첨부파일</label>
        <input id="${kind}AttachmentInput" type="file" multiple accept="${AI_ATTACHMENT_ACCEPT}" />
        <div class="ai-attachment-help">이미지는 AI 답변에 바로 표시하고, PDF/문서 파일은 다운로드 링크로 안내됩니다. 파일은 Firebase Storage에 저장됩니다.</div>
        <div class="ai-attachment-list" id="${kind}AttachmentList"></div>
        <div class="ai-attachment-status" id="${kind}AttachmentStatus"></div>
      </div>`;
    }

    function sanitizeAiStorageFileName(name='attachment'){
      const safe = String(name || 'attachment').replace(/[^a-zA-Z0-9가-힣._-]/g, '_').slice(-100);
      return safe || 'attachment';
    }

    function getAiAttachmentType(fileOrItem={}){
      const mime = String(fileOrItem.type || fileOrItem.mimeType || '').toLowerCase();
      const name = String(fileOrItem.name || fileOrItem.fileName || '').toLowerCase();
      if(mime.startsWith('image/') || /\.(png|jpe?g|gif|webp|bmp|svg)$/.test(name)) return 'image';
      return 'file';
    }

    function formatAiAttachmentSize(size=0){
      const n = Number(size || 0);
      if(!Number.isFinite(n) || n <= 0) return '';
      if(n < 1024 * 1024) return `${Math.ceil(n / 1024)}KB`;
      return `${(n / 1024 / 1024).toFixed(1)}MB`;
    }

    const AI_ATTACHMENT_DOWNLOAD_BASE_BY_ENV = {
      dev: 'https://ai-stream-server-dev-292137041544.asia-northeast3.run.app',
      prod: 'https://ai-stream-server-337132471819.asia-northeast3.run.app'
    };

    function getAiAttachmentDownloadBase(){
      const globalBase = String(window.AI_ATTACHMENT_DOWNLOAD_BASE || window.AI_STREAM_SERVER_BASE_URL || '').trim();
      if(globalBase) return globalBase.replace(/\/?stream\/?$/, '').replace(/\/+$/, '');
      return (AI_ATTACHMENT_DOWNLOAD_BASE_BY_ENV[ENV] || AI_ATTACHMENT_DOWNLOAD_BASE_BY_ENV.prod || '').replace(/\/+$/, '');
    }

    function getAiAttachmentDownloadPath(a={}){
      return a.path || a.storagePath || a.filePath || '';
    }

    function buildAiAttachmentDownloadUrl(a={}){
      const path = getAiAttachmentDownloadPath(a);
      const base = getAiAttachmentDownloadBase();
      if(!path || !base) return '';
      return `${base}/download-ai-attachment?path=${encodeURIComponent(path)}&name=${encodeURIComponent(a.name || 'attachment')}`;
    }

    function getAiAttachmentDownloadButtonHtml(a={}, label='다운로드'){
      const path = getAiAttachmentDownloadPath(a);
      const url = buildAiAttachmentDownloadUrl(a);
      if(!path || !url) return '';
      return `<button class="ai-attachment-download" type="button" data-ai-attachment-download="1" data-ai-attachment-path="${escapeHtml(path)}" data-ai-attachment-name="${escapeHtml(a.name || 'attachment')}">${escapeHtml(label)}</button>`;
    }

    function downloadAiAttachmentFromButton(button){
      const path = button?.dataset?.aiAttachmentPath || '';
      const name = button?.dataset?.aiAttachmentName || 'attachment';
      const base = getAiAttachmentDownloadBase();
      if(!path){ openModalAlert('다운로드 경로가 없습니다.'); return; }
      if(!base){ openModalAlert('다운로드 서버 주소가 설정되지 않았습니다.'); return; }
      window.location.replace(`${base}/download-ai-attachment?path=${encodeURIComponent(path)}&name=${encodeURIComponent(name)}`);
    }

    function getAiAttachmentDownloadsHtml(d={}){
      const arr = Array.isArray(d.attachments) ? d.attachments.filter(a => a && a.url) : [];
      if(!arr.length) return '';
      return `<div class="ai-attachment-list" style="margin-top:10px;">${arr.map((a) => {
        const isImage = getAiAttachmentType(a) === 'image';
        const size = formatAiAttachmentSize(a.size || a.sizeBytes);
        return `<div class="ai-attachment-item">
          <div class="ai-attachment-left">
            ${isImage ? `<img class="ai-attachment-thumb" src="${escapeHtml(a.url)}" alt="첨부 이미지">` : `<span class="ai-attachment-fileicon">첨부</span>`}
            <span class="ai-attachment-name"><span style="font-size:12px;font-weight:1000;color:#0f172a;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:260px;display:block;">${escapeHtml(a.name || '첨부파일')}</span><small>${escapeHtml(isImage ? '이미지' : '파일')}${size ? ` · ${escapeHtml(size)}` : ''}</small></span>
          </div>
          <div class="ai-attachment-actions">${getAiAttachmentDownloadButtonHtml(a, isImage ? '이미지 저장' : '파일 받기')}</div>
        </div>`;
      }).join('')}</div>`;
    }

    function renderAiAttachmentList(kind, collectionName='', docId='', attachments=[]){
      const list = qs(`#${kind}AttachmentList`);
      if(!list) return;
      const arr = Array.isArray(attachments) ? attachments.filter(a => a && a.url) : [];
      if(!arr.length){ list.innerHTML = '<div class="ai-empty" style="padding:10px 12px;">첨부된 파일이 없습니다.</div>'; return; }
      list.innerHTML = arr.map((a, index) => {
        const isImage = getAiAttachmentType(a) === 'image';
        const size = formatAiAttachmentSize(a.size || a.sizeBytes);
        return `<div class="ai-attachment-item">
          <div class="ai-attachment-left">
            ${isImage ? `<img class="ai-attachment-thumb" src="${escapeHtml(a.url)}" alt="첨부 이미지">` : `<span class="ai-attachment-fileicon">첨부</span>`}
            <span class="ai-attachment-name"><span style="font-size:12px;font-weight:1000;color:#0f172a;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:260px;display:block;">${escapeHtml(a.name || '첨부파일')}</span><small>${escapeHtml(isImage ? '이미지' : '파일')}${size ? ` · ${escapeHtml(size)}` : ''}</small></span>
          </div>
          <div class="ai-attachment-actions">
            ${getAiAttachmentDownloadButtonHtml(a, isImage ? '이미지 저장' : '파일 받기')}
            ${collectionName && docId ? `<button class="ai-attachment-delete" type="button" data-ai-action="delete-attachment" data-kind="${escapeHtml(kind)}" data-collection="${escapeHtml(collectionName)}" data-id="${escapeHtml(docId)}" data-index="${index}">삭제</button>` : ''}
          </div>
        </div>`;
      }).join('');
    }

    function setAiAttachmentStatus(kind, message='', type=''){
      const el = qs(`#${kind}AttachmentStatus`);
      if(!el) return;
      el.textContent = message || '';
      el.classList.remove('success','error');
      if(type) el.classList.add(type);
    }

    async function uploadAiAttachments(collectionName, docId, kind){
      const input = qs(`#${kind}AttachmentInput`);
      const files = [...(input?.files || [])];
      if(!files.length) return [];
      if(!storage) throw new Error('Firebase Storage가 초기화되지 않았습니다.');
      const uploaded = [];
      for(const file of files){
        if(file.size > AI_ATTACHMENT_MAX_SIZE){
          throw new Error(`${file.name} 파일은 10MB 이하만 업로드할 수 있습니다.`);
        }
        setAiAttachmentStatus(kind, `${file.name} 업로드 중...`);
        const safeName = sanitizeAiStorageFileName(file.name);
        const path = `ai-content/${collectionName}/${docId}/${Date.now()}_${safeName}`;
        const fileRef = storageRef(storage, path);
        const uploadTask = uploadBytesResumable(fileRef, file, {
          contentType: file.type || 'application/octet-stream',
          // Firebase Storage가 브라우저에서 새창 미리보기로 열지 않고 다운로드로 처리하도록 설정
          contentDisposition: `attachment; filename*=UTF-8''${encodeURIComponent(file.name || 'attachment')}`,
          customMetadata:{ source:'myhills-ai-admin', collectionName, docId }
        });
        await new Promise((resolve, reject) => uploadTask.on('state_changed', null, reject, resolve));
        const url = await getDownloadURL(fileRef);
        uploaded.push({
          type: getAiAttachmentType(file),
          name: file.name,
          url,
          path,
          mimeType: file.type || '',
          size: file.size || 0,
          uploadedAt: new Date().toISOString()
        });
      }
      input.value = '';
      return uploaded;
    }

    async function saveAiDocWithAttachments(collectionName, id, data, kind){
      const input = qs(`#${kind}AttachmentInput`);
      const hasNewFiles = !!(input?.files && input.files.length);
      let ref;
      let current = [];

      if(id){
        ref = doc(db, collectionName, id);
        const snap = await getDoc(ref);
        current = snap.exists() && Array.isArray(snap.data()?.attachments) ? snap.data().attachments : [];
      }else{
        // addDoc를 먼저 실행하면 파일 업로드 실패 시 빈 데이터가 남을 수 있어,
        // 문서 ID만 먼저 예약하고 파일 업로드 성공 후 setDoc 합니다.
        ref = doc(collection(db, collectionName));
      }

      let uploaded = [];
      if(hasNewFiles){
        try{
          uploaded = await uploadAiAttachments(collectionName, ref.id, kind);
        }catch(uploadError){
          setAiAttachmentStatus(kind, uploadError.message || '첨부파일 업로드 중 오류가 발생했습니다.', 'error');
          throw uploadError;
        }
      }

      const nextAttachments = uploaded.length ? [...current, ...uploaded] : current;
      const payload = uploaded.length
        ? { ...data, attachments: nextAttachments, attachmentCount: nextAttachments.length, updatedAt: serverTimestamp() }
        : data;

      if(id){
        await updateDoc(ref, payload);
      }else{
        await setDoc(ref, { ...payload, createdAt: serverTimestamp() });
      }

      if(uploaded.length){
        setAiAttachmentStatus(kind, `${uploaded.length}개 첨부파일이 저장되었습니다.`, 'success');
      }
      return ref.id;
    }

    async function deleteAiAttachment(collectionName='', docId='', index=0, kind=''){
      if(!collectionName || !docId) return;
      const confirmed = await openModalConfirm('첨부파일을 삭제하시겠습니까?', null, '첨부 삭제', '삭제', '취소');
      if(!confirmed) return;
      const ref = doc(db, collectionName, docId);
      const snap = await getDoc(ref);
      if(!snap.exists()) return;
      const attachments = Array.isArray(snap.data()?.attachments) ? [...snap.data().attachments] : [];
      const idx = Number(index);
      const [removed] = attachments.splice(idx, 1);
      await updateDoc(ref, { attachments, attachmentCount: attachments.length, updatedAt: serverTimestamp() });
      if(removed?.path){
        try{ await deleteObject(storageRef(storage, removed.path)); }catch(error){ console.warn('Storage 첨부 삭제 실패 또는 이미 삭제됨', error); }
      }
      renderAiAttachmentList(kind, collectionName, docId, attachments);
      openModalAlert('첨부파일이 삭제되었습니다.', null, '삭제 완료');
    }

    function getAiAttachmentCountPill(d={}){
      const count = Array.isArray(d.attachments) ? d.attachments.length : Number(d.attachmentCount || 0);
      return count > 0 ? `<span class="ai-code-pill">첨부 ${count}개 첨부</span>` : '';
    }

    async function loadAiFaq(){
      if(!requireAdminDataAccess()) return;
      const box = qs('#aiAdminContent');
      if(!box) return;
      box.innerHTML = renderAiFormHeader('FAQ 관리', 'AI가 바로 답변할 자주 묻는 질문을 등록합니다.') + `
        <form class="ai-admin-form" id="aiFaqForm">
          <input type="hidden" id="aiFaqEditId" value="" />
          <div class="field"><label>질문</label><input id="aiFaqQuestion" placeholder="예: 음식물쓰레기는 어디에 버리나요?" /></div>
          <div class="field"><label>답변</label><textarea id="aiFaqAnswer" placeholder="입주민에게 보여줄 답변을 입력하세요."></textarea></div>
          <div class="field"><label>키워드</label><input id="aiFaqKeywords" placeholder="음식물, 쓰레기, 배출" /></div>
          ${getAiAttachmentInputHtml('aiFaq')}
          <div class="check-row"><label><input type="checkbox" id="aiFaqActive" checked> 사용</label></div>
          <div class="grid-2"><button class="btn btn-primary" type="submit">저장</button><button class="btn btn-soft" type="button" data-ai-action="reset-faq">초기화</button></div>
        </form>
        <div class="section-head" style="margin:18px 2px 10px;"><h3 style="font-size:16px;">등록된 FAQ</h3><small id="aiFaqCount">0건</small></div>
        <div class="ai-admin-list" id="aiFaqList"><div class="ai-empty">불러오는 중...</div></div>`;
      qs('#aiFaqForm')?.addEventListener('submit', saveAiFaq);
      renderAiAttachmentList('aiFaq');
      await renderAiFaqList();
    }

    async function renderAiFaqList(){
      const list = qs('#aiFaqList');
      if(!list) return;
      try{
        const snap = await getDocs(query(collection(db, 'ai_faq'), limit(80)));
        qs('#aiFaqCount') && (qs('#aiFaqCount').textContent = `${snap.size}건`);
        if(!snap.size){ list.innerHTML = '<div class="ai-empty">등록된 FAQ가 없습니다.</div>'; return; }
        list.innerHTML = snap.docs.map(docSnap => {
          const d = docSnap.data() || {};
          return `<div class="ai-admin-item">
            <h5>${escapeHtml(d.question || '질문 없음')}</h5>
            <p>${escapeHtml(d.answer || '')}</p>
            <div style="margin-top:10px;">${splitKeywords(joinKeywords(d.keywords)).map(k => `<span class="ai-code-pill">#${escapeHtml(k)}</span>`).join('')}<span class="ai-code-pill">${d.isActive === false ? 'OFF' : 'ON'}</span>${getAiAttachmentCountPill(d)}</div>
            ${getAiAttachmentDownloadsHtml(d)}
            <div class="ai-admin-item-actions">
              <button class="btn btn-soft" type="button" data-ai-action="edit-faq" data-id="${docSnap.id}">수정</button>
              <button class="btn btn-danger" type="button" data-ai-action="delete-doc" data-collection="ai_faq" data-id="${docSnap.id}">삭제</button>
            </div>
          </div>`;
        }).join('');
      }catch(error){
        console.error(error);
        list.innerHTML = '<div class="ai-empty">FAQ를 불러오지 못했습니다. 권한 또는 규칙을 확인해 주세요.</div>';
      }
    }

    async function saveAiFaq(event){
      event.preventDefault();
      const id = qs('#aiFaqEditId')?.value || '';
      const data = {
        question: qs('#aiFaqQuestion')?.value.trim() || '',
        answer: qs('#aiFaqAnswer')?.value.trim() || '',
        keywords: splitKeywords(qs('#aiFaqKeywords')?.value || ''),
        isActive: !!qs('#aiFaqActive')?.checked,
        updatedAt: serverTimestamp()
      };
      if(!data.question || !data.answer) return openModalAlert('질문과 답변을 입력해 주세요.', null, '입력 필요');
      try{
        await saveAiDocWithAttachments('ai_faq', id, data, 'aiFaq');
        openModalAlert('AI FAQ가 저장되었습니다.', null, '저장 완료');
        await loadAiFaq();
      }catch(error){
        console.error('AI FAQ 저장/첨부 업로드 실패', error);
        setAiAttachmentStatus('aiFaq', error.message || '첨부파일 업로드 중 오류가 발생했습니다.', 'error');
        openModalAlert(error.message || 'AI FAQ 저장 중 오류가 발생했습니다.', null, '저장 실패');
      }
    }

    async function editAiFaq(id){
      const snap = await getDoc(doc(db, 'ai_faq', id));
      if(!snap.exists()) return;
      const d = snap.data() || {};
      qs('#aiFaqEditId').value = id;
      qs('#aiFaqQuestion').value = d.question || '';
      qs('#aiFaqAnswer').value = d.answer || '';
      qs('#aiFaqKeywords').value = joinKeywords(d.keywords);
      qs('#aiFaqActive').checked = d.isActive !== false;
      renderAiAttachmentList('aiFaq', 'ai_faq', id, d.attachments || []);
      qs('#aiFaqQuestion')?.scrollIntoView({behavior:'smooth', block:'center'});
    }

    function resetAiFaqForm(){
      qs('#aiFaqEditId') && (qs('#aiFaqEditId').value = '');
      qs('#aiFaqQuestion') && (qs('#aiFaqQuestion').value = '');
      qs('#aiFaqAnswer') && (qs('#aiFaqAnswer').value = '');
      qs('#aiFaqKeywords') && (qs('#aiFaqKeywords').value = '');
      qs('#aiFaqActive') && (qs('#aiFaqActive').checked = true);
      renderAiAttachmentList('aiFaq');
      setAiAttachmentStatus('aiFaq', '');
    }

    async function loadAiBooklet(){
      if(!requireAdminDataAccess()) return;
      const box = qs('#aiAdminContent');
      if(!box) return;
      box.innerHTML = renderAiFormHeader('전자책 관리', '아파트 생활 안내, 규정, 안내문 내용을 AI 검색 데이터로 등록합니다.') + `
        <form class="ai-admin-form" id="aiBookletForm">
          <input type="hidden" id="aiBookletEditId" value="" />
          <div class="grid-2"><div class="field"><label>제목</label><input id="aiBookletTitle" placeholder="예: 분리수거 안내" /></div><div class="field"><label>섹션</label><input id="aiBookletSection" placeholder="예: 생활안내" /></div></div>
          <div class="field"><label>내용</label><textarea id="aiBookletContent" placeholder="전자책/안내문 내용을 입력하세요."></textarea></div>
          <div class="field"><label>키워드</label><input id="aiBookletKeywords" placeholder="분리수거, 쓰레기, 재활용" /></div>
          ${getAiAttachmentInputHtml('aiBooklet')}
          <div class="check-row"><label><input type="checkbox" id="aiBookletActive" checked> 사용</label></div>
          <div class="grid-2"><button class="btn btn-primary" type="submit">저장</button><button class="btn btn-soft" type="button" data-ai-action="reset-booklet">초기화</button></div>
        </form>
        <div class="section-head" style="margin:18px 2px 10px;"><h3 style="font-size:16px;">전자책 페이지</h3><small id="aiBookletCount">0건</small></div>
        <div class="ai-admin-list" id="aiBookletList"><div class="ai-empty">불러오는 중...</div></div>`;
      qs('#aiBookletForm')?.addEventListener('submit', saveAiBooklet);
      renderAiAttachmentList('aiBooklet');
      await renderAiBookletList();
    }

    async function renderAiBookletList(){
      const list = qs('#aiBookletList');
      if(!list) return;
      try{
        const snap = await getDocs(query(collection(db, 'ai_booklet_pages'), limit(80)));
        qs('#aiBookletCount') && (qs('#aiBookletCount').textContent = `${snap.size}건`);
        if(!snap.size){ list.innerHTML = '<div class="ai-empty">등록된 전자책 페이지가 없습니다.</div>'; return; }
        list.innerHTML = snap.docs.map(docSnap => {
          const d = docSnap.data() || {};
          return `<div class="ai-admin-item">
            <h5>${escapeHtml(d.title || '제목 없음')}</h5>
            <p>${escapeHtml((d.content || '').slice(0, 240))}</p>
            <div style="margin-top:10px;"><span class="ai-code-pill">${escapeHtml(d.section || '섹션 없음')}</span>${splitKeywords(joinKeywords(d.keywords)).map(k => `<span class="ai-code-pill">#${escapeHtml(k)}</span>`).join('')}<span class="ai-code-pill">${d.isActive === false ? 'OFF' : 'ON'}</span>${getAiAttachmentCountPill(d)}</div>
            ${getAiAttachmentDownloadsHtml(d)}
            <div class="ai-admin-item-actions">
              <button class="btn btn-soft" type="button" data-ai-action="edit-booklet" data-id="${docSnap.id}">수정</button>
              <button class="btn btn-danger" type="button" data-ai-action="delete-doc" data-collection="ai_booklet_pages" data-id="${docSnap.id}">삭제</button>
            </div>
          </div>`;
        }).join('');
      }catch(error){
        console.error(error);
        list.innerHTML = '<div class="ai-empty">전자책 데이터를 불러오지 못했습니다.</div>';
      }
    }

    async function saveAiBooklet(event){
      event.preventDefault();
      const id = qs('#aiBookletEditId')?.value || '';
      const data = {
        title: qs('#aiBookletTitle')?.value.trim() || '',
        section: qs('#aiBookletSection')?.value.trim() || '',
        content: qs('#aiBookletContent')?.value.trim() || '',
        keywords: splitKeywords(qs('#aiBookletKeywords')?.value || ''),
        isActive: !!qs('#aiBookletActive')?.checked,
        updatedAt: serverTimestamp()
      };
      if(!data.title || !data.content) return openModalAlert('제목과 내용을 입력해 주세요.', null, '입력 필요');
      try{
        await saveAiDocWithAttachments('ai_booklet_pages', id, data, 'aiBooklet');
        openModalAlert('전자책 페이지가 저장되었습니다.', null, '저장 완료');
        await loadAiBooklet();
      }catch(error){
        console.error('전자책 저장/첨부 업로드 실패', error);
        setAiAttachmentStatus('aiBooklet', error.message || '첨부파일 업로드 중 오류가 발생했습니다.', 'error');
        openModalAlert(error.message || '전자책 저장 중 오류가 발생했습니다.', null, '저장 실패');
      }
    }

    async function editAiBooklet(id){
      const snap = await getDoc(doc(db, 'ai_booklet_pages', id));
      if(!snap.exists()) return;
      const d = snap.data() || {};
      qs('#aiBookletEditId').value = id;
      qs('#aiBookletTitle').value = d.title || '';
      qs('#aiBookletSection').value = d.section || '';
      qs('#aiBookletContent').value = d.content || '';
      qs('#aiBookletKeywords').value = joinKeywords(d.keywords);
      qs('#aiBookletActive').checked = d.isActive !== false;
      renderAiAttachmentList('aiBooklet', 'ai_booklet_pages', id, d.attachments || []);
      qs('#aiBookletTitle')?.scrollIntoView({behavior:'smooth', block:'center'});
    }

    function resetAiBookletForm(){
      ['aiBookletEditId','aiBookletTitle','aiBookletSection','aiBookletContent','aiBookletKeywords'].forEach(id => { const el=qs(`#${id}`); if(el) el.value=''; });
      qs('#aiBookletActive') && (qs('#aiBookletActive').checked = true);
      renderAiAttachmentList('aiBooklet');
      setAiAttachmentStatus('aiBooklet', '');
    }

    async function loadAiGuide(){
      if(!requireAdminDataAccess()) return;
      const box = qs('#aiAdminContent');
      if(!box) return;
      box.innerHTML = renderAiFormHeader('가이드 관리', '앱 사용법 질문에 답할 메뉴 이동 안내를 등록합니다.') + `
        <form class="ai-admin-form" id="aiGuideForm">
          <input type="hidden" id="aiGuideEditId" value="" />
          <div class="field"><label>질문/상황</label><input id="aiGuideQuestion" placeholder="예: 커뮤니티 메뉴는 어떻게 들어가?" /></div>
          <div class="field"><label>답변</label><textarea id="aiGuideAnswer" placeholder="예: 하단 네비바에서 전체 탭을 누른 뒤 커뮤니티를 선택하면 됩니다."></textarea></div>
          <div class="field"><label>키워드</label><input id="aiGuideKeywords" placeholder="커뮤니티, 메뉴, 전체 탭" /></div>
          ${getAiAttachmentInputHtml('aiGuide')}
          <div class="check-row"><label><input type="checkbox" id="aiGuideActive" checked> 사용</label></div>
          <div class="grid-2"><button class="btn btn-primary" type="submit">저장</button><button class="btn btn-soft" type="button" data-ai-action="reset-guide">초기화</button></div>
        </form>
        <div class="section-head" style="margin:18px 2px 10px;"><h3 style="font-size:16px;">등록된 가이드</h3><small id="aiGuideCount">0건</small></div>
        <div class="ai-admin-list" id="aiGuideList"><div class="ai-empty">불러오는 중...</div></div>`;
      qs('#aiGuideForm')?.addEventListener('submit', saveAiGuide);
      renderAiAttachmentList('aiGuide');
      await renderAiGuideList();
    }

    async function renderAiGuideList(){
      const list = qs('#aiGuideList');
      if(!list) return;
      try{
        const snap = await getDocs(query(collection(db, 'ai_guide_pages'), limit(80)));
        qs('#aiGuideCount') && (qs('#aiGuideCount').textContent = `${snap.size}건`);
        if(!snap.size){ list.innerHTML = '<div class="ai-empty">등록된 가이드가 없습니다.</div>'; return; }
        list.innerHTML = snap.docs.map(docSnap => {
          const d = docSnap.data() || {};
          return `<div class="ai-admin-item">
            <h5>${escapeHtml(d.question || d.title || '질문 없음')}</h5>
            <p>${escapeHtml(d.answer || d.content || '')}</p>
            <div style="margin-top:10px;">${splitKeywords(joinKeywords(d.keywords)).map(k => `<span class="ai-code-pill">#${escapeHtml(k)}</span>`).join('')}<span class="ai-code-pill">${d.isActive === false ? 'OFF' : 'ON'}</span>${getAiAttachmentCountPill(d)}</div>
            ${getAiAttachmentDownloadsHtml(d)}
            <div class="ai-admin-item-actions">
              <button class="btn btn-soft" type="button" data-ai-action="edit-guide" data-id="${docSnap.id}">수정</button>
              <button class="btn btn-danger" type="button" data-ai-action="delete-doc" data-collection="ai_guide_pages" data-id="${docSnap.id}">삭제</button>
            </div>
          </div>`;
        }).join('');
      }catch(error){
        console.error(error);
        list.innerHTML = '<div class="ai-empty">가이드를 불러오지 못했습니다.</div>';
      }
    }

    async function saveAiGuide(event){
      event.preventDefault();
      const id = qs('#aiGuideEditId')?.value || '';
      const data = {
        question: qs('#aiGuideQuestion')?.value.trim() || '',
        answer: qs('#aiGuideAnswer')?.value.trim() || '',
        keywords: splitKeywords(qs('#aiGuideKeywords')?.value || ''),
        isActive: !!qs('#aiGuideActive')?.checked,
        updatedAt: serverTimestamp()
      };
      if(!data.question || !data.answer) return openModalAlert('질문과 답변을 입력해 주세요.', null, '입력 필요');
      try{
        await saveAiDocWithAttachments('ai_guide_pages', id, data, 'aiGuide');
        openModalAlert('가이드가 저장되었습니다.', null, '저장 완료');
        await loadAiGuide();
      }catch(error){
        console.error('가이드 저장/첨부 업로드 실패', error);
        setAiAttachmentStatus('aiGuide', error.message || '첨부파일 업로드 중 오류가 발생했습니다.', 'error');
        openModalAlert(error.message || '가이드 저장 중 오류가 발생했습니다.', null, '저장 실패');
      }
    }

    async function editAiGuide(id){
      const snap = await getDoc(doc(db, 'ai_guide_pages', id));
      if(!snap.exists()) return;
      const d = snap.data() || {};
      qs('#aiGuideEditId').value = id;
      qs('#aiGuideQuestion').value = d.question || d.title || '';
      qs('#aiGuideAnswer').value = d.answer || d.content || '';
      qs('#aiGuideKeywords').value = joinKeywords(d.keywords);
      qs('#aiGuideActive').checked = d.isActive !== false;
      renderAiAttachmentList('aiGuide', 'ai_guide_pages', id, d.attachments || []);
      qs('#aiGuideQuestion')?.scrollIntoView({behavior:'smooth', block:'center'});
    }

    function resetAiGuideForm(){
      ['aiGuideEditId','aiGuideQuestion','aiGuideAnswer','aiGuideKeywords'].forEach(id => { const el=qs(`#${id}`); if(el) el.value=''; });
      qs('#aiGuideActive') && (qs('#aiGuideActive').checked = true);
      renderAiAttachmentList('aiGuide');
      setAiAttachmentStatus('aiGuide', '');
    }

    let aiAdminTtsAudio = null;
    let aiAdminTtsObjectUrl = null;
    let aiTtsSettingsCache = null;

    function getAiVoiceTestSamples(){
      return [
        '안녕하세요. 운정온 AI 생활도우미입니다. 문의하신 내용을 기준으로 차분하게 안내드릴게요.',
        '대형폐기물 배출은 먼저 신청 후, 지정된 장소에 배출하시면 됩니다.',
        '오늘은 비가 오고 있어서 가까운 혜택 매장 위주로 추천드릴게요.'
      ].join('\n');
    }

    function stopAiVoicePreview(){
      if(aiAdminTtsAudio){
        try{ aiAdminTtsAudio.pause(); aiAdminTtsAudio.currentTime = 0; }catch(e){}
        aiAdminTtsAudio = null;
      }
      if(aiAdminTtsObjectUrl){
        try{ URL.revokeObjectURL(aiAdminTtsObjectUrl); }catch(e){}
        aiAdminTtsObjectUrl = null;
      }
      const btn = qs('#aiTtsPreviewBtn');
      if(btn){ btn.disabled = false; btn.textContent = '미리 듣기'; }
      const stopBtn = qs('#aiTtsStopBtn');
      if(stopBtn) stopBtn.disabled = true;
    }

    function setAiVoiceTestStatus(message='', tone=''){
      const el = qs('#aiTtsStatus');
      if(!el) return;
      el.textContent = message || '';
      el.className = `admin-field-help ${tone === 'error' ? 'danger-text' : ''}`;
      if(tone === 'success') el.style.color = '#2563eb';
      else if(tone === 'error') el.style.color = '#dc2626';
      else el.style.color = '#64748b';
    }

    function formatBytes(bytes){
      const n = Number(bytes || 0);
      if(n >= 1024 * 1024 * 1024) return `${(n / 1024 / 1024 / 1024).toFixed(2)} GB`;
      if(n >= 1024 * 1024) return `${(n / 1024 / 1024).toFixed(2)} MB`;
      if(n >= 1024) return `${(n / 1024).toFixed(1)} KB`;
      return `${n} B`;
    }

    async function getAdminIdToken(){
      if(!auth?.currentUser) throw new Error('관리자 로그인 후 사용할 수 있습니다.');
      return await auth.currentUser.getIdToken?.();
    }

    async function fetchTtsJson(path, options={}){
      if(!TTS_SERVICE_BASE_URL) throw new Error('env-config.js의 TTS_SERVICE_URL을 먼저 확인해 주세요.');
      const idToken = await getAdminIdToken();
      const res = await fetch(`${TTS_SERVICE_BASE_URL.replace(/\/$/, '')}${path}`, {
        ...options,
        headers:{
          'Content-Type':'application/json',
          ...(idToken ? { Authorization:`Bearer ${idToken}` } : {}),
          ...(options.headers || {})
        }
      });
      const text = await res.text();
      let data = null;
      try{ data = text ? JSON.parse(text) : {}; }catch(_e){ data = { ok:false, message:text }; }
      if(!res.ok) throw new Error(data?.message || `TTS 서버 요청 실패 (${res.status})`);
      return data;
    }

    function getSelectedAiTtsPayload(){
      const text = String(qs('#aiTtsText')?.value || '').trim();
      const voice = String(qs('#aiTtsVoice')?.value || 'nova').trim();
      const type = String(qs('#aiTtsType')?.value || 'default').trim();
      const speedRaw = Number(qs('#aiTtsSpeed')?.value || 1);
      const speed = Number.isFinite(speedRaw) ? Math.min(Math.max(speedRaw, 0.8), 1.15) : 1;
      return { text, voice, type, speed };
    }

    async function loadAiTtsSettings(){
      const data = await fetchTtsJson('/settings');
      aiTtsSettingsCache = data.settings || {};
      const s = aiTtsSettingsCache;
      if(qs('#aiTtsVoice') && s.defaultVoice) qs('#aiTtsVoice').value = s.defaultVoice;
      if(qs('#aiTtsType') && s.defaultType) qs('#aiTtsType').value = s.defaultType;
      if(qs('#aiTtsSpeed') && s.defaultSpeed){
        qs('#aiTtsSpeed').value = s.defaultSpeed;
        if(qs('#aiTtsSpeedValue')) qs('#aiTtsSpeedValue').textContent = s.defaultSpeed;
      }
      if(qs('#aiTtsDailyLimit') && s.dailyLimitPerUser) qs('#aiTtsDailyLimit').value = s.dailyLimitPerUser;
      if(qs('#aiTtsCacheRetentionDays') && s.cacheRetentionDays) qs('#aiTtsCacheRetentionDays').value = s.cacheRetentionDays;
      const info = qs('#aiTtsSettingsInfo');
      if(info){
        info.innerHTML = `현재 기본 voice: <strong>${escapeHtml(s.defaultVoice || '-')}</strong> · 속도: <strong>${escapeHtml(String(s.defaultSpeed || '-'))}</strong> · 일일 제한: <strong>${escapeHtml(String(s.dailyLimitPerUser || '-'))}회</strong> · 캐시 보관: <strong>${escapeHtml(String(s.cacheRetentionDays || '-'))}일</strong>`;
      }
      return s;
    }

    async function saveAiTtsSettings(){
      try{
        const payload = getSelectedAiTtsPayload();
        payload.dailyLimitPerUser = Number(qs('#aiTtsDailyLimit')?.value || 60);
        payload.cacheRetentionDays = Number(qs('#aiTtsCacheRetentionDays')?.value || 30);
        const data = await fetchTtsJson('/settings', { method:'POST', body:JSON.stringify({
          defaultVoice: payload.voice,
          defaultType: payload.type,
          defaultSpeed: payload.speed,
          dailyLimitPerUser: payload.dailyLimitPerUser,
          cacheRetentionDays: payload.cacheRetentionDays
        })});
        aiTtsSettingsCache = data.settings || null;
        setAiVoiceTestStatus(data.message || '기본 음성 설정을 저장했습니다.', 'success');
        await loadAiTtsSettings();
      }catch(error){
        console.error('[AI TTS SETTINGS] save failed', error);
        setAiVoiceTestStatus(error?.message || '기본 음성 설정 저장에 실패했습니다.', 'error');
      }
    }

    async function refreshAiTtsCacheUsage(){
      const box = qs('#aiTtsCacheUsageBox');
      if(box) box.textContent = '캐시 사용량을 조회하는 중입니다...';
      try{
        const data = await fetchTtsJson('/cache/usage?limit=5000');
        if(box){
          if(!data.enabled){ box.textContent = '캐시가 비활성화되어 있습니다.'; return; }
          box.innerHTML = `캐시 파일: <strong>${escapeHtml(String(data.count || 0))}개</strong> · 용량: <strong>${escapeHtml(formatBytes(data.bytes || 0))}</strong> · 버킷: <strong>${escapeHtml(data.bucket || '-')}</strong>${data.truncated ? ' · 일부만 집계됨' : ''}`;
        }
      }catch(error){
        console.error('[AI TTS CACHE] usage failed', error);
        if(box) box.textContent = error?.message || '캐시 사용량 조회에 실패했습니다.';
      }
    }

    async function cleanupAiTtsCache(dryRun=true){
      const days = Number(qs('#aiTtsCleanupDays')?.value || qs('#aiTtsCacheRetentionDays')?.value || 30);
      const box = qs('#aiTtsCacheCleanupBox');
      if(box) box.textContent = dryRun ? '정리 대상을 확인하는 중입니다...' : '오래된 캐시를 정리하는 중입니다...';
      try{
        if(!dryRun){
          const ok = await openModalConfirm(`${days}일보다 오래된 TTS 캐시를 삭제할까요?`, null, '캐시 정리 확인', '삭제', '취소');
          if(!ok){ if(box) box.textContent = '캐시 정리를 취소했습니다.'; return; }
        }
        const data = await fetchTtsJson('/cache/cleanup', { method:'POST', body:JSON.stringify({ olderThanDays:days, dryRun, limit:1000 }) });
        if(box){
          box.innerHTML = dryRun
            ? `정리 대상: <strong>${escapeHtml(String(data.matchedCount || 0))}개</strong> · 예상 용량: <strong>${escapeHtml(formatBytes(data.matchedBytes || 0))}</strong>`
            : `정리 완료: <strong>${escapeHtml(String(data.deletedCount || 0))}개</strong> · 삭제 용량: <strong>${escapeHtml(formatBytes(data.deletedBytes || 0))}</strong>`;
        }
        if(!dryRun) await refreshAiTtsCacheUsage();
      }catch(error){
        console.error('[AI TTS CACHE] cleanup failed', error);
        if(box) box.textContent = error?.message || '캐시 정리에 실패했습니다.';
      }
    }

    async function refreshAiTtsUsageToday(){
      const box = qs('#aiTtsUsageTodayBox');
      if(box) box.textContent = '오늘 사용량을 조회하는 중입니다...';
      try{
        const data = await fetchTtsJson('/usage/today');
        if(box){
          box.innerHTML = `오늘 내 음성 사용량: <strong>${escapeHtml(String(data.count || 0))} / ${escapeHtml(String(data.limit || 0))}회</strong>${data.enabled ? '' : ' · 제한 비활성화'}`;
        }
      }catch(error){
        console.error('[AI TTS USAGE] today failed', error);
        if(box) box.textContent = error?.message || '오늘 사용량 조회에 실패했습니다.';
      }
    }

    async function playAiVoicePreview(event){
      event?.preventDefault?.();
      if(!TTS_SERVICE_BASE_URL){
        await openModalAlert('env-config.js의 TTS_SERVICE_URL을 먼저 확인해 주세요.', null, '음성 테스트');
        return;
      }
      if(!auth?.currentUser){
        await openModalAlert('관리자 로그인 후 음성 테스트를 사용할 수 있습니다.', qs('#adminLoginId'), '음성 테스트');
        return;
      }
      const payload = getSelectedAiTtsPayload();
      if(!payload.text){
        await openModalAlert('미리 들을 문장을 입력해 주세요.', qs('#aiTtsText'), '음성 테스트');
        return;
      }
      stopAiVoicePreview();
      const btn = qs('#aiTtsPreviewBtn');
      const stopBtn = qs('#aiTtsStopBtn');
      if(btn){ btn.disabled = true; btn.textContent = '음성 준비 중...'; }
      if(stopBtn) stopBtn.disabled = false;
      setAiVoiceTestStatus('TTS 서버에서 안내 음성을 생성하는 중입니다...', '');
      try{
        const idToken = await auth.currentUser.getIdToken?.();
        const res = await fetch(`${TTS_SERVICE_BASE_URL.replace(/\/$/, '')}/tts`, {
          method:'POST',
          headers:{
            'Content-Type':'application/json',
            ...(idToken ? { Authorization:`Bearer ${idToken}` } : {})
          },
          body:JSON.stringify(payload)
        });
        if(!res.ok){
          let detail = '';
          try{ const data = await res.json(); detail = data?.message || JSON.stringify(data); }catch(e){ try{ detail = await res.text(); }catch(_e){} }
          throw new Error(detail || `TTS 요청 실패 (${res.status})`);
        }
        const cacheStatus = res.headers.get('X-TTS-Cache') || '';
        const dailyCount = res.headers.get('X-TTS-Daily-Count') || '';
        const dailyLimit = res.headers.get('X-TTS-Daily-Limit') || '';
        const blob = await res.blob();
        if(!blob || !blob.size) throw new Error('생성된 음성 파일이 비어 있습니다.');
        aiAdminTtsObjectUrl = URL.createObjectURL(blob);
        aiAdminTtsAudio = new Audio(aiAdminTtsObjectUrl);
        aiAdminTtsAudio.onended = () => {
          setAiVoiceTestStatus('음성 재생이 완료되었습니다.', 'success');
          stopAiVoicePreview();
          refreshAiTtsUsageToday();
          refreshAiTtsCacheUsage();
        };
        aiAdminTtsAudio.onerror = () => {
          setAiVoiceTestStatus('브라우저에서 음성 재생을 시작하지 못했습니다.', 'error');
          stopAiVoicePreview();
        };
        await aiAdminTtsAudio.play();
        if(btn) btn.textContent = '재생 중';
        setAiVoiceTestStatus(`재생 중입니다. voice: ${payload.voice}, cache: ${cacheStatus || '-'}${dailyCount ? `, today: ${dailyCount}/${dailyLimit}` : ''}`, 'success');
      }catch(error){
        console.error('[AI TTS TEST] failed', error);
        setAiVoiceTestStatus(error?.message || '음성 테스트에 실패했습니다.', 'error');
        if(btn){ btn.disabled = false; btn.textContent = '미리 듣기'; }
        if(stopBtn) stopBtn.disabled = true;
      }
    }

    async function loadAiVoiceTest(){
      if(!requireAdminDataAccess()) return;
      const box = qs('#aiAdminContent');
      if(!box) return;
      const voices = [
        ['nova', 'nova · 여성/비서 느낌 후보'],
        ['shimmer', 'shimmer · 부드러운 안내 후보'],
        ['coral', 'coral · 밝고 선명한 후보'],
        ['sage', 'sage · 차분한 후보'],
        ['marin', 'marin · 고품질 권장 후보'],
        ['cedar', 'cedar · 고품질 권장 후보'],
        ['alloy', 'alloy · 중성/기본'],
        ['ash', 'ash'],
        ['ballad', 'ballad'],
        ['echo', 'echo'],
        ['fable', 'fable'],
        ['onyx', 'onyx'],
        ['verse', 'verse']
      ];
      box.innerHTML = renderAiFormHeader('AI 음성 테스트', 'OpenAI TTS 음성을 미리 듣고, 공개앱 기본 voice와 사용량 정책을 관리합니다.') + `
        <form class="ai-admin-form" id="aiTtsTestForm">
          <div class="notice">현재 연결된 TTS 서버: <strong>${escapeHtml(TTS_SERVICE_BASE_URL || '미설정')}</strong><br>기본 voice를 저장하면 공개앱 AI 답변 음성에도 적용됩니다.</div>
          <div id="aiTtsSettingsInfo" class="admin-field-help">기본 음성 설정을 불러오는 중입니다...</div>
          <div class="grid-2">
            <div class="field"><label for="aiTtsVoice">보이스</label><select id="aiTtsVoice">${voices.map(([value, label]) => `<option value="${escapeHtml(value)}">${escapeHtml(label)}</option>`).join('')}</select><div class="admin-field-help">여성 안내 비서 톤은 nova, shimmer, coral부터 들어보는 것을 권장합니다.</div></div>
            <div class="field"><label for="aiTtsType">읽기 유형</label><select id="aiTtsType"><option value="default">기본 안내</option><option value="notice">공지 안내</option><option value="benefit">혜택 추천</option><option value="file">파일 분석</option></select><div class="admin-field-help">유형에 따라 서버에서 안내 지시문을 다르게 적용합니다.</div></div>
          </div>
          <div class="field"><label for="aiTtsSpeed">속도</label><input id="aiTtsSpeed" type="range" min="0.8" max="1.15" step="0.05" value="1" oninput="document.getElementById('aiTtsSpeedValue').textContent=this.value" /><div class="admin-field-help">현재 속도: <strong id="aiTtsSpeedValue">1</strong> · 안내용은 0.95~1.0이 무난합니다.</div></div>
          <div class="grid-2">
            <div class="field"><label for="aiTtsDailyLimit">사용자별 일일 음성 제한</label><input id="aiTtsDailyLimit" type="number" min="1" max="1000" value="60"><div class="admin-field-help">로그인 사용자 기준 하루 최대 재생 횟수입니다. 캐시 HIT도 사용량에 포함됩니다.</div></div>
            <div class="field"><label for="aiTtsCacheRetentionDays">캐시 보관 기준</label><input id="aiTtsCacheRetentionDays" type="number" min="1" max="365" value="30"><div class="admin-field-help">오래된 캐시 정리 시 기본 기준으로 사용됩니다.</div></div>
          </div>
          <div class="field"><label for="aiTtsText">테스트 문장</label><textarea id="aiTtsText" style="min-height:150px;" placeholder="테스트할 안내 문장을 입력하세요.">${escapeHtml(getAiVoiceTestSamples())}</textarea></div>
          <div class="grid-2">
            <button class="btn btn-primary" type="submit" id="aiTtsPreviewBtn">미리 듣기</button>
            <button class="btn btn-soft" type="button" id="aiTtsStopBtn" disabled>⏹ 정지</button>
          </div>
          <div class="grid-2" style="margin-top:8px;">
            <button class="btn btn-soft" type="button" id="aiTtsSaveDefaultBtn">기본 음성 설정 저장</button>
            <button class="btn btn-soft" type="button" id="aiTtsReloadSettingsBtn">설정 다시 불러오기</button>
          </div>
          <hr style="border:none;border-top:1px solid #e5e7eb;margin:18px 0;">
          <div class="grid-2">
            <button class="btn btn-soft" type="button" id="aiTtsCacheUsageBtn">캐시 사용량 조회</button>
            <button class="btn btn-soft" type="button" id="aiTtsUsageTodayBtn">오늘 사용량 조회</button>
          </div>
          <div id="aiTtsCacheUsageBox" class="admin-field-help">캐시 사용량을 조회해보세요.</div>
          <div id="aiTtsUsageTodayBox" class="admin-field-help">오늘 사용량을 조회해보세요.</div>
          <div class="grid-2" style="margin-top:8px;">
            <div class="field"><label for="aiTtsCleanupDays">정리 기준 일수</label><input id="aiTtsCleanupDays" type="number" min="1" max="365" value="30"></div>
            <div class="field"><label>&nbsp;</label><div class="grid-2"><button class="btn btn-soft" type="button" id="aiTtsCleanupDryRunBtn">정리 대상 확인</button><button class="btn btn-danger" type="button" id="aiTtsCleanupRunBtn">오래된 캐시 삭제</button></div></div>
          </div>
          <div id="aiTtsCacheCleanupBox" class="admin-field-help">먼저 정리 대상 확인을 실행한 뒤 삭제하세요.</div>
          <div id="aiTtsStatus" class="admin-field-help">음성 후보를 선택한 뒤 미리 듣기를 눌러주세요.</div>
        </form>`;
      qs('#aiTtsTestForm')?.addEventListener('submit', playAiVoicePreview);
      qs('#aiTtsStopBtn')?.addEventListener('click', () => {
        stopAiVoicePreview();
        setAiVoiceTestStatus('음성 재생을 정지했습니다.', '');
      });
      qs('#aiTtsSaveDefaultBtn')?.addEventListener('click', saveAiTtsSettings);
      qs('#aiTtsReloadSettingsBtn')?.addEventListener('click', () => loadAiTtsSettings().then(() => setAiVoiceTestStatus('설정을 다시 불러왔습니다.', 'success')).catch(error => setAiVoiceTestStatus(error?.message || '설정 불러오기에 실패했습니다.', 'error')));
      qs('#aiTtsCacheUsageBtn')?.addEventListener('click', refreshAiTtsCacheUsage);
      qs('#aiTtsUsageTodayBtn')?.addEventListener('click', refreshAiTtsUsageToday);
      qs('#aiTtsCleanupDryRunBtn')?.addEventListener('click', () => cleanupAiTtsCache(true));
      qs('#aiTtsCleanupRunBtn')?.addEventListener('click', () => cleanupAiTtsCache(false));
      try{
        await loadAiTtsSettings();
        await refreshAiTtsCacheUsage();
        await refreshAiTtsUsageToday();
      }catch(error){
        console.warn('[AI TTS] initial load failed', error);
        setAiVoiceTestStatus(error?.message || '음성 설정을 불러오지 못했습니다.', 'error');
      }
    }

    async function loadAiSettings(){
      if(!requireAdminDataAccess()) return;
      const box = qs('#aiAdminContent');
      if(!box) return;
      let d = {};
      try{
        const snap = await getDoc(doc(db, 'ai_settings', 'default'));
        d = snap.exists() ? (snap.data() || {}) : {};
      }catch(error){ console.warn(error); }
      box.innerHTML = renderAiFormHeader('AI 설정', 'AI 생활 도우미의 공개 여부와 답변 문구를 관리합니다.') + `
        <form class="ai-admin-form" id="aiSettingsForm">
          <div class="check-row">
            <label><input type="checkbox" id="aiSettingsEnabled" ${d.enabled !== false ? 'checked' : ''}> AI 사용</label>
            <label><input type="checkbox" id="aiSettingsPersonal" ${d.usePersonalization !== false ? 'checked' : ''}> 개인화</label>
            <label><input type="checkbox" id="aiSettingsSituation" ${d.useSituation !== false ? 'checked' : ''}> 상황 인식</label>
            <label><input type="checkbox" id="aiSettingsVoice" ${d.useVoice !== false ? 'checked' : ''}> 음성 질문</label>
          </div>
          <div class="field"><label>환영 문구</label><textarea id="aiSettingsWelcome">${escapeHtml(d.welcomeMessage || '궁금한 내용을 입력해 주세요.')}</textarea></div>
          <div class="field"><label>검색 실패 문구</label><textarea id="aiSettingsFallback">${escapeHtml(d.fallbackMessage || '현재 등록된 안내에서 답변을 찾지 못했습니다.')}</textarea></div>
          <div class="field"><label>관리자 지시문</label><textarea id="aiSettingsHint" placeholder="예: 답변은 짧고 친절하게 작성">${escapeHtml(d.systemHint || '')}</textarea></div>
          <button class="btn btn-primary" type="submit">설정 저장</button>
        </form>`;
      qs('#aiSettingsForm')?.addEventListener('submit', saveAiSettings);
    }

    async function saveAiSettings(event){
      event.preventDefault();
      await setDoc(doc(db, 'ai_settings', 'default'), {
        enabled: !!qs('#aiSettingsEnabled')?.checked,
        usePersonalization: !!qs('#aiSettingsPersonal')?.checked,
        useSituation: !!qs('#aiSettingsSituation')?.checked,
        useVoice: !!qs('#aiSettingsVoice')?.checked,
        welcomeMessage: qs('#aiSettingsWelcome')?.value.trim() || '',
        fallbackMessage: qs('#aiSettingsFallback')?.value.trim() || '',
        systemHint: qs('#aiSettingsHint')?.value.trim() || '',
        updatedAt: serverTimestamp()
      }, { merge:true });
      openModalAlert('AI 설정이 저장되었습니다.', null, '저장 완료');
      await refreshAiMetrics();
    }

    function normalizeAiSearchValue(value=''){
      return String(value || '').trim();
    }

    function resetAiPaging(kind){
      const target = aiAdminState[kind];
      if(!target) return;
      target.cursors = [];
      target.page = 1;
      target.lastDoc = null;
      target.hasNext = false;
    }

    function renderAiLogToolbar(kind, title, desc){
      const state = aiAdminState[kind];
      const pageSize = state?.pageSize || 20;
      const search = escapeHtml(state?.search || '');
      const mode = state?.mode || 'latest';
      const placeholder = kind === 'logs'
        ? '질문 검색 또는 uid:사용자UID'
        : '대화 제목 검색 또는 uid:사용자UID';
      return renderAiFormHeader(title, desc) + `
        <div class="ai-log-toolbar" data-ai-paging-kind="${escapeHtml(kind)}">
          <div class="ai-log-search-row">
            <input id="${kind}SearchInput" value="${search}" placeholder="${escapeHtml(placeholder)}" />
            <select id="${kind}PageSize" aria-label="페이지 크기">
              ${[10,20,30,50].map(n => `<option value="${n}" ${Number(pageSize) === n ? 'selected' : ''}>${n}개</option>`).join('')}
            </select>
            <button class="btn btn-primary" type="button" data-ai-action="${kind}-search">검색</button>
          </div>
          <div class="ai-log-pagebar">
            <small id="${kind}PageInfo">${escapeHtml(mode === 'search' ? '검색 결과' : '최신순')} · ${Number(state?.page || 1)}페이지</small>
            <div class="ai-log-page-actions">
              <button class="btn btn-soft" type="button" data-ai-action="${kind}-refresh">새로고침</button>
              <button class="btn btn-soft" type="button" data-ai-action="${kind}-prev" ${Number(state?.page || 1) <= 1 ? 'disabled' : ''}>이전</button>
              <button class="btn btn-blue" type="button" data-ai-action="${kind}-next" ${state?.hasNext ? '' : 'disabled'}>다음</button>
            </div>
          </div>
          <div class="ai-log-hint">검색은 대량 로그를 고려해 페이지 단위로 조회합니다. 질문/제목 검색은 앞부분 일치, UID 검색은 <b>uid:사용자UID</b> 형식입니다.</div>
        </div>`;
    }

    function buildAiPagedQuery(kind){
      const state = aiAdminState[kind];
      const pageSize = Number(state?.pageSize || 20);
      const raw = normalizeAiSearchValue(state?.search || '');
      const isUidSearch = raw.toLowerCase().startsWith('uid:');
      const uid = isUidSearch ? raw.slice(4).trim() : '';
      const colName = kind === 'logs' ? 'ai_chat_logs' : 'ai_conversations';
      const colRef = collection(db, colName);
      const clauses = [];

      if(kind === 'conversations'){
        clauses.push(where('status', '==', 'active'));
      }

      if(uid){
        state.mode = 'uid';
        clauses.push(where('uid', '==', uid));
        clauses.push(orderBy(kind === 'logs' ? 'createdAt' : 'updatedAt', 'desc'));
      }else if(raw){
        state.mode = 'search';
        const field = kind === 'logs' ? 'question' : 'title';
        clauses.push(orderBy(field));
        clauses.push(startAt(raw));
        clauses.push(endAt(raw + '\uf8ff'));
      }else{
        state.mode = 'latest';
        clauses.push(orderBy(kind === 'logs' ? 'createdAt' : 'updatedAt', 'desc'));
      }

      const cursor = state.cursors[Math.max(0, Number(state.page || 1) - 2)];
      if(cursor) clauses.push(startAfter(cursor));
      clauses.push(limit(pageSize + 1));
      return query(colRef, ...clauses);
    }

    async function fetchAiPagedDocs(kind){
      const state = aiAdminState[kind];
      const pageSize = Number(state?.pageSize || 20);
      const snap = await getDocs(buildAiPagedQuery(kind));
      const docs = snap.docs.slice(0, pageSize);
      state.hasNext = snap.docs.length > pageSize;
      state.lastDoc = docs.length ? docs[docs.length - 1] : null;
      return docs;
    }

    function updateAiPageCursor(kind){
      const state = aiAdminState[kind];
      if(!state?.lastDoc) return;
      state.cursors[state.page - 1] = state.lastDoc;
    }

    async function goAiPage(kind, direction){
      const state = aiAdminState[kind];
      if(!state) return;
      if(direction === 'next' && state.hasNext){
        updateAiPageCursor(kind);
        state.page += 1;
      }
      if(direction === 'prev' && state.page > 1){
        state.page -= 1;
      }
      if(kind === 'logs') await loadAiLogs(false);
      else await loadAiConversations(false);
    }

    function applyAiSearch(kind){
      const state = aiAdminState[kind];
      if(!state) return;
      const input = qs(`#${kind}SearchInput`);
      const size = qs(`#${kind}PageSize`);
      state.search = normalizeAiSearchValue(input?.value || '');
      state.pageSize = Number(size?.value || state.pageSize || 20);
      resetAiPaging(kind);
      if(kind === 'logs') return loadAiLogs(false);
      return loadAiConversations(false);
    }

    async function loadAiLogs(reset=true){
      if(!requireAdminDataAccess()) return;
      const box = qs('#aiAdminContent');
      if(!box) return;
      if(reset) resetAiPaging('logs');
      box.innerHTML = renderAiLogToolbar('logs', '질문 로그', '입주민들이 실제로 질문한 내용을 검색하고 페이지 단위로 확인합니다.') + '<div class="ai-admin-list" id="aiLogList"><div class="ai-empty">불러오는 중...</div></div>';
      const list = qs('#aiLogList');
      try{
        const docs = await fetchAiPagedDocs('logs');
        const state = aiAdminState.logs;
        const pageInfo = qs('#logsPageInfo');
        if(pageInfo) pageInfo.textContent = `${state.mode === 'latest' ? '최신순' : '검색 결과'} · ${state.page}페이지 · ${docs.length}건 표시${state.hasNext ? ' · 다음 있음' : ''}`;
        if(!docs.length){ list.innerHTML = '<div class="ai-empty">표시할 질문 로그가 없습니다.</div>'; return; }
        list.innerHTML = docs.map(docSnap => {
          const d = docSnap.data() || {};
          const answer = valueToText(d.answer || d.answerText || d.answerHtml || d.response || '');
          return `<div class="ai-admin-item">
            <div class="ai-log-question">Q. ${escapeHtml(d.question || '-')}</div>
            ${answer ? `<div class="ai-log-answer">A. ${escapeHtml(answer.slice(0, 500))}</div>` : ''}
            <div style="margin-top:10px;">
              <span class="ai-code-pill">${escapeHtml(formatAiAdminDate(d.createdAt))}</span>
              <span class="ai-code-pill">UID ${escapeHtml(d.uid || '-')}</span>
              <span class="ai-code-pill">${escapeHtml((d.matchedTypes || []).join(', ') || d.source || 'AI')}</span>
              <span class="ai-code-pill">매칭 ${escapeHtml(d.matchedCount ?? '-')}</span>
            </div>
            <div class="ai-admin-item-actions">
              <button class="btn btn-soft" type="button" data-ai-action="faq-from-log" data-question="${escapeHtml(d.question || '')}" data-answer="${escapeHtml(answer || '')}">FAQ로 복사</button>
            </div>
          </div>`;
        }).join('');
		
		const nextBtn = qs('[data-ai-action="logs-next"]');
		const prevBtn = qs('[data-ai-action="logs-prev"]');

		if (nextBtn) nextBtn.disabled = !state.hasNext;
		if (prevBtn) prevBtn.disabled = Number(state.page || 1) <= 1;
      }catch(error){
        console.error(error);
        list.innerHTML = '<div class="ai-empty">질문 로그를 불러오지 못했습니다. 검색 조합에 필요한 Firestore 인덱스 또는 권한을 확인해 주세요.</div>';
      }
    }

    async function loadAiConversations(reset=true){
      if(!requireAdminDataAccess()) return;
      const box = qs('#aiAdminContent');
      if(!box) return;
      if(reset) resetAiPaging('conversations');
      box.innerHTML = renderAiLogToolbar('conversations', '대화 기록', '대화방 단위로 누적된 AI 사용 흐름을 검색하고 페이지 단위로 확인합니다.') + '<div class="ai-admin-list" id="aiConversationList"><div class="ai-empty">불러오는 중...</div></div>';
      const list = qs('#aiConversationList');
      try{
        const docs = await fetchAiPagedDocs('conversations');
        const state = aiAdminState.conversations;
        const pageInfo = qs('#conversationsPageInfo');
        if(pageInfo) pageInfo.textContent = `${state.mode === 'latest' ? '최신순' : '검색 결과'} · ${state.page}페이지 · ${docs.length}건 표시${state.hasNext ? ' · 다음 있음' : ''}`;
        if(!docs.length){ list.innerHTML = '<div class="ai-empty">표시할 대화 기록이 없습니다.</div>'; return; }
        list.innerHTML = docs.map(docSnap => {
          const d = docSnap.data() || {};
          return `<div class="ai-admin-item">
            <h5>${escapeHtml(d.title || '새 대화')}</h5>
            <p>UID: ${escapeHtml(d.uid || '-')}</p>
            <div style="margin-top:10px;">
              <span class="ai-code-pill">생성 ${escapeHtml(formatAiAdminDate(d.createdAt))}</span>
              <span class="ai-code-pill">수정 ${escapeHtml(formatAiAdminDate(d.updatedAt))}</span>
              <span class="ai-code-pill">메시지 ${escapeHtml(d.messageCount ?? 0)}</span>
              <span class="ai-code-pill">${escapeHtml(docSnap.id)}</span>
            </div>
          </div>`;
        }).join('');
		
		const nextBtn = qs('[data-ai-action="conversations-next"]');
		const prevBtn = qs('[data-ai-action="conversations-prev"]');

		if (nextBtn) nextBtn.disabled = !state.hasNext;
		if (prevBtn) prevBtn.disabled = Number(state.page || 1) <= 1;
      }catch(error){
        console.error(error);
        list.innerHTML = '<div class="ai-empty">대화 기록을 불러오지 못했습니다. 검색 조합에 필요한 Firestore 인덱스 또는 권한을 확인해 주세요.</div>';
      }
    }

    async function deleteAiDoc(collectionName, id){
      if(!collectionName || !id) return;
      const ok = await openModalConfirm('정말 삭제하시겠습니까?', null, '삭제 확인', '삭제', '취소');
      if(!ok) return;
      await deleteDoc(doc(db, collectionName, id));
      openModalAlert('선택한 AI 데이터가 삭제되었습니다.', null, '삭제 완료');
      await openAIManager(aiAdminState.tab);
    }

    function seedFaqFromLog(question, answer){
      changeAdminView('ai');
      setTimeout(async () => {
        await openAIManager('faq');
        qs('#aiFaqQuestion') && (qs('#aiFaqQuestion').value = question || '');
        qs('#aiFaqAnswer') && (qs('#aiFaqAnswer').value = answer || '');
        qs('#aiFaqKeywords') && (qs('#aiFaqKeywords').value = splitKeywords(question).join(', '));
        qs('#aiFaqQuestion')?.scrollIntoView({behavior:'smooth', block:'center'});
      }, 120);
    }

    function initAiManagerSwipe(){
      const el = qs('#aiManagerTabs');
      if(!el || el.dataset.swipeReady === '1') return;
      el.dataset.swipeReady = '1';
      let isDown=false, startX=0, startLeft=0, moved=false;
      el.addEventListener('pointerdown', (e) => {
        isDown=true; moved=false; startX=e.clientX; startLeft=el.scrollLeft; el.classList.add('dragging');
      });
      el.addEventListener('pointermove', (e) => {
        if(!isDown) return;
        const dx = e.clientX - startX;
        if(Math.abs(dx)>4) moved=true;
        el.scrollLeft = startLeft - dx;
      });
      ['pointerup','pointercancel','pointerleave'].forEach(type => el.addEventListener(type, () => {
        isDown=false; setTimeout(()=>{ moved=false; }, 0); el.classList.remove('dragging');
      }));
      el.addEventListener('click', (e) => {
        if(moved){ e.preventDefault(); e.stopPropagation(); return; }
        const btn = e.target.closest('[data-ai-tab]');
        if(btn) openAIManager(btn.dataset.aiTab);
      });
    }

    document.addEventListener('click', async (event) => {
      const downloadBtn = event.target.closest('[data-ai-attachment-download]');
      if(downloadBtn){
        event.preventDefault();
        event.stopPropagation();
        return downloadAiAttachmentFromButton(downloadBtn);
      }

      const tabBtn = event.target.closest('[data-ai-tab]');
      if(tabBtn && !tabBtn.closest('#aiManagerTabs')) openAIManager(tabBtn.dataset.aiTab);

      const action = event.target.closest('[data-ai-action]');
      if(!action) return;
      const type = action.dataset.aiAction;
      if(type === 'reset-faq') return resetAiFaqForm();
      if(type === 'reset-booklet') return resetAiBookletForm();
      if(type === 'reset-guide') return resetAiGuideForm();
      if(type === 'edit-faq') return editAiFaq(action.dataset.id);
      if(type === 'edit-booklet') return editAiBooklet(action.dataset.id);
      if(type === 'edit-guide') return editAiGuide(action.dataset.id);
      if(type === 'delete-doc') return deleteAiDoc(action.dataset.collection, action.dataset.id);
      if(type === 'delete-attachment') return deleteAiAttachment(action.dataset.collection, action.dataset.id, action.dataset.index, action.dataset.kind);
      if(type === 'logs-search') return applyAiSearch('logs');
      if(type === 'logs-refresh'){ resetAiPaging('logs'); return loadAiLogs(false); }
      if(type === 'logs-prev') return goAiPage('logs', 'prev');
      if(type === 'logs-next') return goAiPage('logs', 'next');
      if(type === 'conversations-search') return applyAiSearch('conversations');
      if(type === 'conversations-refresh'){ resetAiPaging('conversations'); return loadAiConversations(false); }
      if(type === 'conversations-prev') return goAiPage('conversations', 'prev');
      if(type === 'conversations-next') return goAiPage('conversations', 'next');
      if(type === 'faq-from-log') return seedFaqFromLog(action.dataset.question || '', action.dataset.answer || '');
    });

    setTimeout(initAiManagerSwipe, 500);




    /* =========================
       Dynamic GNB Menu Manager v1
    ========================= */
    const APP_MENUS_COLLECTION='app_menus';
    const MENU_STATS_COLLECTION='menu_stats';
    let adminMenuItems=[];

    /* Bottom nav settings safe wrappers: real functions are attached below */
    window.__bottomNavSettingsPending = false;
    window.renderBottomNavSettings = window.renderBottomNavSettings || function(){ window.__bottomNavSettingsPending = true; };
    window.loadBottomNavSettings = window.loadBottomNavSettings || async function(){ window.__bottomNavSettingsPending = true; };

    function getMenuCheckedValues(name){ return [...document.querySelectorAll(`input[name="${name}"]:checked`)].map(el=>el.value); }
    function setMenuCheckedValues(name, values=[]){ document.querySelectorAll(`input[name="${name}"]`).forEach(el=>{ el.checked = values.includes(el.value); }); }

    function isSafeAdminIconUrl(url=''){
      const value=String(url||'').trim();
      return !!value && (value.startsWith('/icons/') || value.startsWith('/menu-icons/') || value.startsWith('/assets/') || /^https:\/\/firebasestorage\.googleapis\.com\//.test(value));
    }
    function renderAdminMenuIcon(item={}){
      const iconUrl=String(item.iconUrl||'').trim();
      if(isSafeAdminIconUrl(iconUrl)) return `<img class="menu-card-icon-img" src="${escapeHtml(iconUrl)}" alt="" loading="lazy">`;

      const keyMap = {
        home:'/icons/internal/home.svg',
        benefits:'/icons/internal/benefit.svg',
        benefit:'/icons/internal/benefit.svg',
        favorite:'/icons/internal/favorite.svg',
        top5:'/icons/internal/top5.svg',
        all:'/icons/internal/all-menu.svg',
        ai:'/icons/internal/ai-assistant.svg',
        calendar:'/icons/internal/calendar.svg',
        map:'/icons/internal/map.svg',
        notices:'/icons/internal/notice.svg',
        notice:'/icons/internal/notice.svg',
        settings:'/icons/internal/settings.svg',
        notification:'/icons/internal/notification.svg',
        push:'/icons/internal/notification.svg'
      };
      const rawIcon = String(item.icon || '').trim();
      const key = rawIcon.startsWith('icon:')
        ? rawIcon.replace(/^icon:/,'')
        : String(item.iconKey || item.menuId || item.view || item.route || '').trim();
      const src = keyMap[key];
      if(src) return `<img class="menu-card-icon-img" src="${src}" alt="" loading="lazy">`;

      return `<img class="menu-card-icon-img" src="/icons/internal/all-menu.svg" alt="" loading="lazy">`;
    }
    function updateMenuIconPreview(){
      const box=qs('#menuIconPreview'); if(!box) return;
      const iconUrl=qs('#menuIconUrl')?.value?.trim() || '';
      const fallback=qs('#menuIcon')?.value?.trim() || '•';
      if(isSafeAdminIconUrl(iconUrl)){
        box.innerHTML=`<img src="${escapeHtml(iconUrl)}" alt=""><span>${escapeHtml(iconUrl)}</span>`;
      }else{
        box.innerHTML=`<img src="/icons/internal/all-menu.svg" alt=""><span>아이콘 URL이 없으면 기본 메뉴 심볼로 표시됩니다.</span>`;
      }
    }

    function normalizeAdminMenu(raw={}, id=''){
      const menuId=String(raw.menuId||id||raw.view||'').trim();
      const sections=Array.isArray(raw.sections)?raw.sections:[raw.section||raw.type||'main'].filter(Boolean);
      const roles=Array.isArray(raw.roles)?raw.roles:(raw.role?[raw.role]:['resident','admin','root']);
      const keywords=Array.isArray(raw.keywords)?raw.keywords:String(raw.keywords||'').split(',').map(v=>v.trim()).filter(Boolean);
      const badgeTokens=[];
      const collectBadge=(v)=>{ if(!v) return; if(Array.isArray(v)){ v.forEach(collectBadge); return; } if(typeof v==='object'){ Object.keys(v).forEach(k=>{ if(v[k]) badgeTokens.push(String(k).toLowerCase()); }); return; } String(v).split(/[\s,|/]+/).forEach(x=>{ x=String(x||'').trim().toLowerCase(); if(x) badgeTokens.push(x); }); };
      collectBadge(raw.menuBadges || raw.badges || raw.menuBadge || raw.statusBadge || raw.featureBadge);
      if(raw.badgeHot || raw.menuBadgeHot) badgeTokens.push('hot');
      if(raw.badgeNew || raw.menuBadgeNew) badgeTokens.push('new');
      if(raw.badgeUp || raw.menuBadgeUp) badgeTokens.push('up');
      if(raw.badgeDeprecated || raw.menuBadgeDeprecated || raw.deprecated || raw.willRemove) badgeTokens.push('deprecated');
      const menuBadges=[...new Set(badgeTokens.map(v=>v==='delete'||v==='remove'||v==='ending'?'deprecated':v).filter(v=>['hot','new','up','deprecated'].includes(v)))];
      return {...raw, id, menuId, name:raw.name||raw.title||menuId, icon:raw.icon||'•', iconUrl:raw.iconUrl||'', iconKey:raw.iconKey||'', view:raw.view||raw.route||menuId, route:raw.route||raw.view||menuId, keywords, sections, roles, menuBadges, badgeHot:menuBadges.includes('hot'), badgeNew:menuBadges.includes('new'), badgeUp:menuBadges.includes('up'), badgeDeprecated:menuBadges.includes('deprecated'), order:Number(raw.order??100), isActive:raw.isActive!==false};
    }
    function renderAdminMenus(){
      const list=qs('#menuAdminList'); const count=qs('#menuListCount'); if(!list) return;
      const items=[...adminMenuItems].sort((a,b)=>a.order-b.order);
      if(count) count.textContent=`${items.length}건`;
      if(!items.length){ list.innerHTML='<div class="notice">등록된 메뉴가 없습니다. 기본 메뉴를 먼저 등록해 주세요.</div>'; return; }
      list.innerHTML=items.map(item=>`<div class="menu-card"><div class="menu-card-head"><div class="menu-card-title"><span>${renderAdminMenuIcon(item)}</span><div><strong>${escapeHtml(item.name)}</strong><div style="font-size:12px;color:#64748b;margin-top:3px;">${escapeHtml(item.menuId)} · ${escapeHtml(item.view)}${item.iconUrl ? ` · ${escapeHtml(item.iconUrl)}` : ''}</div></div></div><div class="member-actions"><button class="btn btn-soft" type="button" data-menu-edit="${escapeHtml(item.id)}">수정</button><button class="btn btn-danger" type="button" data-menu-delete="${escapeHtml(item.id)}">삭제</button></div></div><div class="menu-card-meta"><span class="tag ${item.isActive?'live-tag':'hidden-tag'}">${item.isActive?'노출':'숨김'}</span><span class="tag">순서 ${item.order}</span>${item.sections.map(s=>`<span class="tag rec">${escapeHtml(s)}</span>`).join('')}${item.roles.map(r=>`<span class="tag">${escapeHtml(r)}</span>`).join('')}${(item.menuBadges||[]).map(b=>`<span class="tag badge-${escapeHtml(b)}">${b==='deprecated'?'삭제 예정':escapeHtml(String(b).toUpperCase())}</span>`).join('')}</div>${item.keywords?.length?`<div style="font-size:12px;color:#64748b;line-height:1.5;">검색어: ${escapeHtml(item.keywords.join(', '))}</div>`:''}</div>`).join('');
    }
    async function loadAdminMenus(){
      if(!requireAdminDataAccess(false)) return;
      const list=qs('#menuAdminList'); if(list) list.innerHTML='<div class="notice">GNB 메뉴를 불러오는 중입니다.</div>';
      try{ const snap=await getDocs(collection(db, APP_MENUS_COLLECTION)); adminMenuItems=snap.docs.map(d=>normalizeAdminMenu(d.data(), d.id)); renderAdminMenus(); }
      catch(error){ console.error(error); if(list) list.innerHTML='<div class="notice">GNB 메뉴를 불러오지 못했습니다. Firestore Rules를 확인해 주세요.</div>'; }
    }
    function resetMenuForm(){
      qs('#menuForm')?.reset(); if(qs('#menuEditId')) qs('#menuEditId').value=''; if(qs('#menuOrder')) qs('#menuOrder').value=100; if(qs('#menuIsActive')) qs('#menuIsActive').checked=true; setMenuCheckedValues('menuSection',['main']); setMenuCheckedValues('menuBadge',[]); setMenuCheckedValues('menuRole',['resident','admin','root']); if(qs('#menuIconUrl')) qs('#menuIconUrl').value=''; if(qs('#menuFormModeLabel')) qs('#menuFormModeLabel').textContent='새 메뉴'; updateMenuIconPreview?.();
    }
    function fillMenuForm(item){
      qs('#menuEditId').value=item.id||item.menuId; qs('#menuId').value=item.menuId; qs('#menuName').value=item.name; qs('#menuIcon').value=item.icon||''; if(qs('#menuIconUrl')) qs('#menuIconUrl').value=item.iconUrl||''; qs('#menuView').value=item.view||item.route||item.menuId; qs('#menuKeywords').value=(item.keywords||[]).join(', '); qs('#menuOrder').value=item.order||100; qs('#menuDescription').value=item.description||''; qs('#menuIsActive').checked=item.isActive!==false; setMenuCheckedValues('menuSection', item.sections?.length?item.sections:['main']); setMenuCheckedValues('menuBadge', item.menuBadges?.length?item.menuBadges:[]); setMenuCheckedValues('menuRole', item.roles?.length?item.roles:['resident','admin','root']); qs('#menuFormModeLabel').textContent='수정 중'; updateMenuIconPreview?.(); window.scrollTo({top:0,behavior:'smooth'});
    }
    async function saveMenu(event){
      event?.preventDefault?.(); if(!requireAdminDataAccess()) return;
      const menuId=qs('#menuId').value.trim(); const name=qs('#menuName').value.trim(); const view=qs('#menuView').value.trim();
      if(!menuId || !name || !view){ await openModalAlert('메뉴 ID, 메뉴명, 이동 view를 입력해 주세요.', qs('#menuId')); return; }
      const keywords=qs('#menuKeywords').value.split(',').map(v=>v.trim()).filter(Boolean);
      const sections=getMenuCheckedValues('menuSection'); const roles=getMenuCheckedValues('menuRole'); const menuBadges=getMenuCheckedValues('menuBadge');
      const iconUrl=qs('#menuIconUrl')?.value?.trim() || ''; if(iconUrl && !isSafeAdminIconUrl(iconUrl)){ await openModalAlert('아이콘 URL은 /icons/, /menu-icons/, /assets/ 또는 Firebase Storage URL만 사용할 수 있습니다.', qs('#menuIconUrl')); return; } const payload={ menuId, name, icon:qs('#menuIcon').value.trim()||'•', iconUrl, view, route:view, keywords, sections:sections.length?sections:['main'], roles:roles.length?roles:['resident','admin','root'], menuBadges, badgeHot:menuBadges.includes('hot'), badgeNew:menuBadges.includes('new'), badgeUp:menuBadges.includes('up'), badgeDeprecated:menuBadges.includes('deprecated'), order:Number(qs('#menuOrder').value||100), description:qs('#menuDescription').value.trim(), isActive:qs('#menuIsActive').checked, updatedAt:serverTimestamp() };
      const editId=qs('#menuEditId').value.trim();
      await setDoc(doc(db, APP_MENUS_COLLECTION, editId || menuId), editId ? payload : {...payload, createdAt:serverTimestamp()}, {merge:true});
      await openModalAlert('GNB 메뉴가 저장되었습니다.', qs('#menuName')); resetMenuForm();

    /* =========================
       Bottom Nav Default Settings
    ========================= */
    const BOTTOM_NAV_SETTINGS_COLLECTION='app_settings';
    const BOTTOM_NAV_SETTINGS_DOC='bottom_nav';
    let bottomNavSelectedMenus=[];
    let bottomNavUseAdminDefaultFill=true;

    function normalizeBottomNavIds(list=[]){
      const result=[];
      for(const raw of list||[]){
        const id=String(raw||'').replace(/^#|^\//,'').trim();
        if(!id || id==='home' || id==='all') continue;
        if(!result.includes(id)) result.push(id);
        if(result.length>=3) break;
      }
      return result;
    }
    function getBottomNavCandidateMenus(){
      const preferred=['benefits','favorite','top5','ai','calendar','map','notices'];
      const candidates=[...adminMenuItems]
        .filter(item=>item.isActive!==false)
        .filter(item=>!['home','all'].includes(String(item.menuId)))
        .filter(item=>!(Array.isArray(item.sections)&&item.sections.includes('admin')&&!item.sections.includes('bottom')))
        .sort((a,b)=>{
          const ai=preferred.indexOf(a.menuId), bi=preferred.indexOf(b.menuId);
          if(ai!==-1 || bi!==-1) return (ai===-1?999:ai)-(bi===-1?999:bi);
          return a.order-b.order;
        });
      return candidates;
    }
    window.renderBottomNavSettings = function renderBottomNavSettings(){
      const picker=qs('#bottomNavMenuPicker');
      const selected=qs('#bottomNavSelectedList');
      const fill=qs('#bottomNavUseAdminDefaultFill');
      if(fill) fill.checked=bottomNavUseAdminDefaultFill!==false;
      if(!picker || !selected) return;

      const candidates=getBottomNavCandidateMenus();
      if(!candidates.length){
        picker.innerHTML='<div class="notice">선택 가능한 공개 메뉴가 없습니다. 먼저 GNB 메뉴를 등록해 주세요.</div>';
      }else{
        picker.innerHTML=candidates.map(item=>{
          const active=bottomNavSelectedMenus.includes(item.menuId);
          const disabled=!active && bottomNavSelectedMenus.length>=3;
          return `<button type="button" class="bottom-nav-menu-pick ${active?'active':''} ${disabled?'disabled':''}" data-bottom-nav-pick="${escapeHtml(item.menuId)}">
            <span>${renderAdminMenuIcon(item)} ${escapeHtml(item.name||item.menuId)}</span>
            <small>${active?'선택됨':'선택'}</small>
          </button>`;
        }).join('');
      }

      const selectedItems=bottomNavSelectedMenus
        .map(id=>adminMenuItems.find(item=>item.menuId===id) || {menuId:id,name:id,icon:'•'})
        .filter(Boolean);

      selected.innerHTML=selectedItems.length
        ? selectedItems.map((item,idx)=>`<div class="bottom-nav-selected-item">
            <div><strong>${idx+1}. ${renderAdminMenuIcon(item)} ${escapeHtml(item.name||item.menuId)}</strong><span>${escapeHtml(item.menuId)}</span></div>
            <button type="button" class="btn btn-soft" data-bottom-nav-remove="${escapeHtml(item.menuId)}">제거</button>
          </div>`).join('')
        : '<div class="notice">선택된 기본 메뉴가 없습니다. 저장 시 코드 기본값(혜택/즐겨찾기/TOP5)이 사용됩니다.</div>';
    }
    window.loadBottomNavSettings = async function loadBottomNavSettings(){
      if(!requireAdminDataAccess(false)) return;
      try{
        const snap=await getDoc(doc(db, BOTTOM_NAV_SETTINGS_COLLECTION, BOTTOM_NAV_SETTINGS_DOC));
        if(snap.exists()){
          const data=snap.data()||{};
          bottomNavSelectedMenus=normalizeBottomNavIds(data.defaultMenus || data.menus || []);
          bottomNavUseAdminDefaultFill=data.useAdminDefaultFill!==false;
        }else{
          bottomNavSelectedMenus=['benefits','favorite','top5'];
          bottomNavUseAdminDefaultFill=true;
        }
      }catch(error){
        console.warn('하단 네비 설정 로딩 실패', error);
        bottomNavSelectedMenus=['benefits','favorite','top5'];
        bottomNavUseAdminDefaultFill=true;
      }
      renderBottomNavSettings();
    };
    async function saveBottomNavSettings(){
      if(!requireAdminDataAccess()) return;
      bottomNavUseAdminDefaultFill=qs('#bottomNavUseAdminDefaultFill')?.checked !== false;
      const payload={
        defaultMenus:normalizeBottomNavIds(bottomNavSelectedMenus),
        useAdminDefaultFill:bottomNavUseAdminDefaultFill,
        fixedLeft:'home',
        fixedRight:'all',
        maxCustomMenus:3,
        updatedAt:serverTimestamp()
      };
      await setDoc(doc(db, BOTTOM_NAV_SETTINGS_COLLECTION, BOTTOM_NAV_SETTINGS_DOC), payload, {merge:true});
      await openModalAlert('하단 네비 기본 메뉴 설정이 저장되었습니다.');
      await loadBottomNavSettings();
    }
    function resetBottomNavSettingsToDefault(){
      bottomNavSelectedMenus=['benefits','favorite','top5'];
      bottomNavUseAdminDefaultFill=true;
      renderBottomNavSettings();
    }
    document.addEventListener('click',(event)=>{
      const pick=event.target.closest('[data-bottom-nav-pick]');
      if(pick){
        const id=pick.dataset.bottomNavPick;
        if(bottomNavSelectedMenus.includes(id)){
          bottomNavSelectedMenus=bottomNavSelectedMenus.filter(v=>v!==id);
        }else{
          if(bottomNavSelectedMenus.length>=3){
            openModalAlert('하단 네비 기본 메뉴는 최대 3개까지 선택할 수 있습니다.');
            return;
          }
          bottomNavSelectedMenus=[...bottomNavSelectedMenus,id];
        }
        renderBottomNavSettings();
        return;
      }
      const remove=event.target.closest('[data-bottom-nav-remove]');
      if(remove){
        bottomNavSelectedMenus=bottomNavSelectedMenus.filter(v=>v!==remove.dataset.bottomNavRemove);
        renderBottomNavSettings();
      }
    });
    qs('#bottomNavSaveBtn')?.addEventListener('click', saveBottomNavSettings);
    qs('#bottomNavResetBtn')?.addEventListener('click', resetBottomNavSettingsToDefault);
    qs('#bottomNavUseAdminDefaultFill')?.addEventListener('change', (event)=>{ bottomNavUseAdminDefaultFill=event.target.checked; renderBottomNavSettings(); });
 await loadAdminMenus();
    }
    async function deleteMenu(id){ if(!id || !requireAdminDataAccess()) return; const ok=await openModalConfirm('해당 GNB 메뉴를 삭제할까요?\n공개앱 GNB와 검색 결과에서 제외됩니다.'); if(!ok) return; await deleteDoc(doc(db, APP_MENUS_COLLECTION, id)); await loadAdminMenus(); }
    document.addEventListener('click', (event)=>{ const edit=event.target.closest('[data-menu-edit]'); if(edit){ const item=adminMenuItems.find(v=>v.id===edit.dataset.menuEdit); if(item) fillMenuForm(item); return; } const del=event.target.closest('[data-menu-delete]'); if(del){ deleteMenu(del.dataset.menuDelete); } });
    qs('#menuForm')?.addEventListener('submit', saveMenu); qs('#menuIconUrl')?.addEventListener('input', updateMenuIconPreview); qs('#menuIcon')?.addEventListener('input', updateMenuIconPreview); updateMenuIconPreview?.(); qs('#menuResetBtn')?.addEventListener('click', resetMenuForm);
    const __origChangeAdminViewForMenus = changeAdminView;
    changeAdminView = function(view){ __origChangeAdminViewForMenus(view); if(view === 'menus') setTimeout(async()=>{ await loadAdminMenus(); await window.loadBottomNavSettings?.(); }, 80); };
    window.changeAdminView = changeAdminView;
    resetMenuForm();

    const benefitSortSelect=qs('#benefitSortSelect'); if(benefitSortSelect){benefitSortSelect.value=benefitSortMode; benefitSortSelect.addEventListener('change',()=>{benefitSortMode=benefitSortSelect.value||'latest'; renderAdminList();});}
    qs('#addStationBtn')?.addEventListener('click',()=>{const list=qs('#stationList'); if(!list) return; const row=renderStationRow({}); list.prepend(row); row.querySelector('input')?.focus();});qs('#addCouponLinkBtn')?.addEventListener('click',()=>{const list=qs('#couponLinkList'); if(!list) return; const row=renderCouponLinkRow({title:'쿠폰 있어요',url:''}); list.prepend(row); row.querySelector('input')?.focus();});qs('#addNewsItemBtn')?.addEventListener('click',()=>{const list=qs('#newsItemList'); if(!list) return; const row=renderNewsItemRow({title:'',badge:'Event',imageUrl:'',date:'',url:''}); list.prepend(row); row.querySelector('input,select,textarea')?.focus();});qs('#benefitForm').addEventListener('submit',saveBenefit);qs('#storeStatus')?.addEventListener('change',syncVisibleWithStoreStatus);qs('#thumbnailUrl')?.addEventListener('input',(event)=>updateThumbPreview(event.target.value));qs('#thumbnailUploadBtn')?.addEventListener('click', uploadThumbnailFile);qs('#detailImageUrls')?.addEventListener('input', updateDetailImagePreview);qs('#detailImagesUploadBtn')?.addEventListener('click', uploadDetailImageFiles);qs('#noticeForm').addEventListener('submit',saveNotice);qs('#geocodeBtn')?.addEventListener('click', geocodeAddressByNaver);qs('#cancelEditBtn').onclick=resetForm;qs('#cancelNoticeEditBtn').onclick=resetNoticeForm;qs('#loginBtn').onclick=loginAdmin;qs('#logoutBtn').onclick=logoutAdmin;updateAdminLoginControls(false);qs('#exportBtn').onclick=exportBenefits;qs('#seedBtn').onclick=seedDefaultData;document.addEventListener('click',(event)=>{const pageBtn=event.target.closest('[data-member-page]');if(pageBtn){event.preventDefault();moveMemberPage(pageBtn.dataset.memberPageType || 'active', pageBtn.dataset.memberPage);return;}const actionBtn=event.target.closest('[data-member-action]');if(!actionBtn) return;updateMemberStatus(actionBtn.dataset.memberId, actionBtn.dataset.memberAction);});resetForm();resetNoticeForm();changeAdminView('dashboard');
      bindOpeningHoursButtons();
    /* ===== Admin global modal backdrop lock =====
       관리자 페이지의 모든 dialog / alert / confirm / modal 계열은 바깥 영역 클릭으로 닫지 않습니다.
       X, 취소, 확인 등 명시 버튼으로만 닫을 수 있습니다. */
    function lockAdminModalBackdropClick(event){
      if(event.target === event.currentTarget){
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation?.();
      }
    }

    function bindAdminModalBackdropLock(){
      const selectors = [
        'dialog',
        '.app-alert',
        '[role="dialog"]',
        '[role="alertdialog"]',
        '.modal',
        '.modal-overlay',
        '.modal-backdrop',
        '.sheet-modal',
        '.admin-modal',
        '.admin-dialog'
      ];

      document.querySelectorAll(selectors.join(',')).forEach((el) => {
        if(el.dataset.adminBackdropLockBound === '1') return;
        el.dataset.adminBackdropLockBound = '1';
        el.addEventListener('click', lockAdminModalBackdropClick, true);
        el.addEventListener('pointerdown', lockAdminModalBackdropClick, true);
      });
    }

    bindAdminModalBackdropLock();

    const adminModalBackdropLockObserver = new MutationObserver(() => {
      bindAdminModalBackdropLock();
    });

    adminModalBackdropLockObserver.observe(document.documentElement, {
      childList:true,
      subtree:true
    });


