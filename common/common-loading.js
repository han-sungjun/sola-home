(function(){
  'use strict';

  var LOADING_STEPS = {
    default: [
      { at: 0, main: '입주민 전용 서비스를 연결하고 있어요', sub: '잠시만 기다려주세요' },
      { at: 1200, main: '편리한 혜택 정보를 준비하고 있어요', sub: '곧 이용하실 수 있어요' },
      { at: 3200, main: '안전하게 데이터를 확인하고 있어요', sub: '네트워크 상태에 따라 조금 더 걸릴 수 있어요' },
      { at: 5600, main: '거의 준비가 완료되었어요', sub: '잠시 후 자동으로 연결됩니다' }
    ],
    public: [
      { at: 0, main: '입주민 전용 혜택을 불러오고 있어요', sub: '잠시만 기다려주세요' },
      { at: 1200, main: '오늘의 혜택 정보를 정리하고 있어요', sub: '곧 이용하실 수 있어요' },
      { at: 3200, main: '매장 정보와 즐겨찾기를 확인하고 있어요', sub: '네트워크 상태에 따라 조금 더 걸릴 수 있어요' },
      { at: 5600, main: '거의 준비가 완료되었어요', sub: '잠시 후 자동으로 연결됩니다' }
    ],
    admin: [
      { at: 0, main: '운영자 전용 서비스를 연결하고 있어요', sub: '잠시만 기다려주세요' },
      { at: 1200, main: '관리자 데이터를 확인하고 있어요', sub: '운영 화면을 준비 중입니다' },
      { at: 3200, main: '안전하게 권한을 확인하고 있어요', sub: '네트워크 상태에 따라 조금 더 걸릴 수 있어요' },
      { at: 5600, main: '거의 준비가 완료되었어요', sub: '잠시 후 자동으로 연결됩니다' }
    ],
    entrance: [
      { at: 0, main: '입장 화면을 준비하고 있어요', sub: '잠시만 기다려주세요' },
      { at: 1200, main: '안전한 입장 환경을 확인하고 있어요', sub: '곧 이용하실 수 있어요' },
      { at: 3200, main: '계정 정보를 연결할 준비를 하고 있어요', sub: '네트워크 상태에 따라 조금 더 걸릴 수 있어요' },
      { at: 5600, main: '거의 준비가 완료되었어요', sub: '잠시 후 자동으로 연결됩니다' }
    ],
    signup: [
      { at: 0, main: '계정 만들기 화면을 준비하고 있어요', sub: '잠시만 기다려주세요' },
      { at: 1200, main: '안전한 입력 환경을 확인하고 있어요', sub: '곧 이용하실 수 있어요' },
      { at: 3200, main: '입주민 전용 계정 절차를 준비하고 있어요', sub: '네트워크 상태에 따라 조금 더 걸릴 수 있어요' },
      { at: 5600, main: '거의 준비가 완료되었어요', sub: '잠시 후 자동으로 연결됩니다' }
    ],
    verify: [
      { at: 0, main: '휴대폰 인증 화면을 준비하고 있어요', sub: '잠시만 기다려주세요' },
      { at: 1200, main: '안전한 인증 환경을 확인하고 있어요', sub: '곧 이용하실 수 있어요' },
      { at: 3200, main: '인증 정보를 보호하며 연결하고 있어요', sub: '네트워크 상태에 따라 조금 더 걸릴 수 있어요' },
      { at: 5600, main: '거의 준비가 완료되었어요', sub: '잠시 후 자동으로 연결됩니다' }
    ]
  };

  var boundLoaders = new WeakMap();
  var hideTimer = null;
  var FADE_OUT_MS = 620;
  var MIN_VISIBLE_MS = 580;
  var lastShowAt = 0;

  function isAdminPage(){
    return /(?:^|\/)admin(?:\.html)?(?:\/|$)/i.test(location.pathname) || /sola-admin/i.test(location.pathname) || document.body.classList.contains('admin-page') || document.body.dataset.loadingMode === 'admin';
  }

  function getLoadingMode(loader){
    var bodyMode = document.body && document.body.dataset ? document.body.dataset.loadingMode : '';
    var loaderMode = loader && loader.dataset ? loader.dataset.loadingMode : '';
    var path = location.pathname || '';
    var mode = loaderMode || bodyMode;
    if(mode) return mode;
    if(isAdminPage()) return 'admin';
    if(/(?:^|\/)app(?:\.html)?(?:\/|$)/i.test(path)) return 'public';
    if(/(?:^|\/)signup(?:\.html)?(?:\/|$)/i.test(path)) return 'signup';
    if(/(?:^|\/)phone-verify(?:\.html)?(?:\/|$)/i.test(path)) return 'verify';
    if(/(?:^|\/)index(?:\.html)?$/i.test(path) || path === '/' || path === '') return 'entrance';
    return 'default';
  }

  function getSteps(loader){
    var mode = getLoadingMode(loader);
    return LOADING_STEPS[mode] || LOADING_STEPS.default;
  }

  function supportsDialog(){
    return typeof HTMLDialogElement !== 'undefined' && typeof document.createElement('dialog').showModal === 'function';
  }

  function hasVisibleInitialLoader(){
    var existing = document.getElementById('globalLoadingBar') || document.getElementById('pageLoader');
    if(!existing) return null;
    var initial = existing.dataset && existing.dataset.initialAppLoading === '1';
    if(initial || isVisible(existing)) return existing;
    return null;
  }

  function hasOpenBlockingDialog(){
    return !!document.querySelector('dialog[open]:not(#commonLoadingDialog), .common-modal-root.is-open, .app-alert.show, .sheet-modal.show');
  }

  function ensurePlainLoader(){
    var loader = document.getElementById('globalLoadingBar') || document.getElementById('pageLoader');
    if(loader) return loader;
    loader = document.createElement('div');
    loader.id = 'globalLoadingBar';
    loader.className = 'global-loading';
    loader.setAttribute('aria-hidden','true');
    document.body.insertBefore(loader, document.body.firstChild);
    return loader;
  }

  function ensureDialogLoader(){
    var loader = document.getElementById('commonLoadingDialog');
    if(loader) return loader;
    loader = document.createElement('dialog');
    loader.id = 'commonLoadingDialog';
    loader.className = 'global-loading upick-loading-dialog';
    loader.setAttribute('aria-hidden','true');
    loader.setAttribute('aria-modal','true');
    loader.setAttribute('role','alertdialog');
    loader.addEventListener('cancel', function(event){ event.preventDefault(); });
    document.body.appendChild(loader);
    return loader;
  }

  function ensureLoader(forceTopLayer){
    // 최초 공개앱 진입 로딩 중에는 이미 화면에 떠 있는 #globalLoadingBar를 재사용합니다.
    // 여기서 dialog 로딩으로 갈아타면 로딩 UI가 중간에 다른 형태로 바뀌어 보입니다.
    var initial = hasVisibleInitialLoader();
    if(initial) return initial;

    // 일반 페이지 로딩은 기존 전역 로더를 사용하고, 이미 dialog/alert 위에서 실행되는 작업만 top-layer dialog 로더를 사용합니다.
    if((forceTopLayer || hasOpenBlockingDialog()) && supportsDialog()) return ensureDialogLoader();
    return ensurePlainLoader();
  }

  function ensureMarkup(loader){
    if(!loader) return;
    var content = loader.querySelector(':scope > .loader-content') || loader.querySelector('.loader-content');
    if(!content){
      content = document.createElement('div');
      content.className = 'loader-content';
      content.setAttribute('role','status');
      content.setAttribute('aria-live','polite');
      while(loader.firstChild) content.appendChild(loader.firstChild);
      loader.appendChild(content);
    }else{
      content.setAttribute('role','status');
      content.setAttribute('aria-live','polite');
    }

    var mark = content.querySelector('.loader-mark') || loader.querySelector('.loader-mark');
    if(!mark){
      mark = document.createElement('div');
      mark.className = 'loader-mark';
      mark.setAttribute('aria-label','로딩 중');
      content.insertBefore(mark, content.firstChild);
    }else if(mark.parentNode !== content){
      content.insertBefore(mark, content.firstChild);
    }
    mark.setAttribute('aria-label','로딩 중');
    var orbit = mark.querySelector('.loader-orbit');
    if(!orbit){
      orbit = document.createElement('span');
      orbit.className = 'loader-orbit';
      orbit.setAttribute('aria-hidden','true');
      mark.appendChild(orbit);
    }

    var copy = content.querySelector('.loader-copy') || loader.querySelector('.loader-copy');
    if(!copy){
      copy = document.createElement('div');
      copy.className = 'loader-copy';
      copy.setAttribute('aria-hidden','true');
      content.appendChild(copy);
    }else if(copy.parentNode !== content){
      content.appendChild(copy);
    }
    if(!copy.querySelector('.loader-message')){
      var main = document.createElement('p');
      main.className = 'loader-message';
      copy.appendChild(main);
    }
    if(!copy.querySelector('.loader-sub-message')){
      var sub = document.createElement('p');
      sub.className = 'loader-sub-message';
      copy.appendChild(sub);
    }
  }

  function isVisible(loader){
    if(!loader) return false;
    return loader.classList.contains('show') ||
      loader.classList.contains('is-visible') ||
      loader.classList.contains('is-hiding') ||
      loader.getAttribute('aria-hidden') === 'false';
  }

  function syncLock(){
    var active = Array.prototype.some.call(
      document.querySelectorAll('#pageLoader,#globalLoadingBar,#commonLoadingDialog,.page-loader,.global-loading'),
      isVisible
    );
    document.documentElement.classList.toggle('upick-loading-lock', active);
    document.body.classList.toggle('upick-loading-lock', active);
  }

  function bind(loader){
    if(!loader || boundLoaders.has(loader)) return;
    ensureMarkup(loader);

    var state = { timers: [] };
    boundLoaders.set(loader, state);

    function clearTimers(){
      state.timers.forEach(function(id){ clearTimeout(id); });
      state.timers = [];
    }

    function setMessage(step){
      ensureMarkup(loader);
      var copy = loader.querySelector('.loader-copy');
      var main = loader.querySelector('.loader-message');
      var sub = loader.querySelector('.loader-sub-message');
      if(!copy || !main || !sub) return;
      copy.classList.add('is-changing');
      window.setTimeout(function(){
        main.textContent = step.main;
        sub.textContent = step.sub;
        copy.classList.remove('is-changing');
      }, 140);
    }

    function start(){
      clearTimers();
      var steps = getSteps(loader);
      steps.forEach(function(step){
        state.timers.push(window.setTimeout(function(){ setMessage(step); }, step.at));
      });
      syncLock();
    }

    function stop(){
      clearTimers();
      syncLock();
    }

    var observer = new MutationObserver(function(){
      ensureMarkup(loader);
      isVisible(loader) ? start() : stop();
    });
    observer.observe(loader, { attributes:true, attributeFilter:['class','aria-hidden','style','open'] });

    if(isVisible(loader)) start();
  }

  function openTopLayer(loader){
    if(!loader || loader.tagName !== 'DIALOG') return;
    if(loader.open) return;
    try{ loader.showModal(); }
    catch(_){
      try{ loader.show(); }
      catch(__){}
    }
  }

  function closeTopLayer(loader){
    if(!loader || loader.tagName !== 'DIALOG') return;
    if(!loader.open) return;
    try{ loader.close(); }
    catch(_){ loader.removeAttribute('open'); }
  }

  function hideOne(loader){
    if(!loader) return;
    if(loader._upickHideFinalizeTimer){
      clearTimeout(loader._upickHideFinalizeTimer);
      loader._upickHideFinalizeTimer = null;
    }
    loader.classList.add('is-hiding');
    loader.classList.remove('show','is-visible','is-preparing');

    loader._upickHideFinalizeTimer = window.setTimeout(function(){
      loader.classList.remove('is-hiding');
      loader.setAttribute('aria-hidden','true');
      // 핵심: dialog top-layer는 display:none이어도 클릭을 막을 수 있어 반드시 close() 처리합니다.
      closeTopLayer(loader);
      if(loader.dataset) delete loader.dataset.initialAppLoading;
      loader._upickHideFinalizeTimer = null;
      syncLock();
    }, FADE_OUT_MS);
  }

  function init(){
    document.querySelectorAll('#pageLoader,#globalLoadingBar,#commonLoadingDialog,.page-loader,.global-loading').forEach(function(loader){
      bind(loader);
      if(isVisible(loader) && !lastShowAt) lastShowAt = Date.now();
    });
    var observer = new MutationObserver(function(mutations){
      mutations.forEach(function(mutation){
        mutation.addedNodes && Array.prototype.forEach.call(mutation.addedNodes, function(node){
          if(!node || node.nodeType !== 1) return;
          if(node.matches && node.matches('#pageLoader,#globalLoadingBar,#commonLoadingDialog,.page-loader,.global-loading')) bind(node);
          if(node.querySelectorAll) node.querySelectorAll('#pageLoader,#globalLoadingBar,#commonLoadingDialog,.page-loader,.global-loading').forEach(bind);
        });
      });
    });
    observer.observe(document.documentElement, { childList:true, subtree:true });
    syncLock();
  }

  window.UpickLoading = {
    show: function(message, subMessage){
      if(hideTimer){ clearTimeout(hideTimer); hideTimer = null; }
      var loader = ensureLoader(false);
      if(loader._upickHideFinalizeTimer){
        clearTimeout(loader._upickHideFinalizeTimer);
        loader._upickHideFinalizeTimer = null;
      }
      lastShowAt = Date.now();
      bind(loader);
      ensureMarkup(loader);
      if(message || subMessage){
        var main = loader.querySelector('.loader-message');
        var sub = loader.querySelector('.loader-sub-message');
        if(main && message) main.textContent = message;
        if(sub && subMessage) sub.textContent = subMessage;
      }
      loader.classList.remove('is-hiding','show','is-visible');
      loader.classList.add('is-preparing');
      loader.setAttribute('aria-hidden','false');
      openTopLayer(loader);
      syncLock();

      // 첫 프레임 깜빡임 방지: 준비 상태로 한 프레임 고정 후 fade-in을 시작합니다.
      window.requestAnimationFrame(function(){
        window.requestAnimationFrame(function(){
          loader.classList.remove('is-preparing');
          loader.classList.add('show','is-visible');
          syncLock();
        });
      });
      return loader;
    },
    hide: function(){
      if(hideTimer) clearTimeout(hideTimer);
      var elapsed = Date.now() - lastShowAt;
      var wait = Math.max(0, MIN_VISIBLE_MS - elapsed);
      hideTimer = window.setTimeout(function(){
        document.querySelectorAll('#commonLoadingDialog,#pageLoader,#globalLoadingBar,.page-loader,.global-loading').forEach(hideOne);
        syncLock();
        hideTimer = null;
      }, wait);
    },
    bind: bind,
    refresh: init,
    _closeTopLayer: closeTopLayer
  };

  // 기존 코드가 showGlobalLoading/hideGlobalLoading 이름을 쓰는 경우도 공통 로딩으로 연결합니다.
  window.showGlobalLoading = window.showGlobalLoading || function(message, subMessage){ return window.UpickLoading.show(message, subMessage); };
  window.hideGlobalLoading = window.hideGlobalLoading || function(){ return window.UpickLoading.hide(); };

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', init, { once:true });
  }else{
    init();
  }
})();
