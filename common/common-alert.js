/* 더운정픽 공통 알럿/컨펌 - lightweight lock fix v20260527 */
(function(){
  'use strict';

  var queue = Promise.resolve();
  var ALERT_OPEN_DURATION = 280;
  var ALERT_CLOSE_DURATION = 360;
  var lastFocus = null;
  var alertEl, titleEl, messageEl, confirmBtn, cancelBtn, actionsEl;
  var scrollLock = {
    active:false,
    x:0,
    y:0,
    reasons:{},
    ticking:false
  };
  var SCROLL_KEYS = {
    'ArrowUp':true,'ArrowDown':true,'PageUp':true,'PageDown':true,
    'Home':true,'End':true,' ':true,'Spacebar':true
  };

  function qs(sel, root){ return (root || document).querySelector(sel); }
  function escapeText(value){ return String(value == null ? '' : value); }
  function hasReason(){ return Object.keys(scrollLock.reasons).some(function(key){ return scrollLock.reasons[key]; }); }

  function getAlertPanel(){ return alertEl ? qs('.app-alert-card', alertEl) : null; }

  function ensureAlert(){
    alertEl = qs('#appAlert');
    // 공통 알럿은 <dialog>를 쓰지 않습니다.
    // dialog는 브라우저 top-layer/close/focus 복귀가 섞여 fade-out 전에 콜백처럼 보이는 현상이 생겨
    // 모든 페이지에서 div 기반 레이어로 통일합니다.
    if(alertEl && alertEl.tagName === 'DIALOG'){
      var div = document.createElement('div');
      div.id = alertEl.id || 'appAlert';
      div.className = alertEl.className || 'app-alert';
      div.setAttribute('aria-hidden', alertEl.getAttribute('aria-hidden') || 'true');
      div.innerHTML = alertEl.innerHTML;
      try{ alertEl.close && alertEl.close(); }catch(_){}
      alertEl.replaceWith(div);
      alertEl = div;
    }
    if(!alertEl){
      alertEl = document.createElement('div');
      alertEl.id = 'appAlert';
      alertEl.className = 'app-alert du-layer du-layer--modal';
      alertEl.setAttribute('aria-hidden','true');
      alertEl.innerHTML = ''+
        '<div class="app-alert-card" role="alertdialog" aria-modal="true" aria-labelledby="appAlertTitle" aria-describedby="appAlertMessage">'+
          '<div class="app-alert-head">'+
            '<div class="app-alert-icon" id="appAlertIcon" aria-hidden="true"></div>'+
            '<h3 class="app-alert-title" id="appAlertTitle">안내</h3>'+
          '</div>'+
          '<p class="app-alert-message" id="appAlertMessage"></p>'+
          '<div class="app-alert-actions">'+
            '<button class="app-alert-cancel hidden" id="appAlertCancel" type="button">취소</button>'+
            '<button class="app-alert-confirm" id="appAlertConfirm" type="button">확인</button>'+
          '</div>'+
        '</div>';
      document.body.appendChild(alertEl);
    }

    if(alertEl.parentElement !== document.body) document.body.appendChild(alertEl);

    titleEl = qs('#appAlertTitle', alertEl) || qs('#appAlertTitle');
    messageEl = qs('#appAlertMessage', alertEl) || qs('#appAlertMessage');
    confirmBtn = qs('#appAlertConfirm', alertEl) || qs('#appAlertConfirm');
    cancelBtn = qs('#appAlertCancel', alertEl) || qs('#appAlertCancel');
    actionsEl = qs('.app-alert-actions', alertEl);

    alertEl.classList.add('du-layer','du-layer--modal');
    alertEl.setAttribute('data-du-layer','modal');
    alertEl.setAttribute('data-close-on-backdrop','false');
    alertEl.setAttribute('data-du-close-on-backdrop','false');
    alertEl.setAttribute('data-du-close-on-esc','false');
    var cardEl = qs('.app-alert-card', alertEl);
    if(cardEl){ cardEl.classList.add('du-layer__panel'); cardEl.setAttribute('data-du-layer-panel',''); }
    var headEl = qs('.app-alert-head', alertEl);
    if(headEl){ headEl.classList.add('du-layer__header'); headEl.setAttribute('data-du-layer-header',''); }
    if(messageEl){ messageEl.classList.add('du-layer__body'); messageEl.setAttribute('data-du-layer-body',''); }
    if(actionsEl){ actionsEl.classList.add('du-layer__footer'); actionsEl.setAttribute('data-du-layer-footer',''); }
    if(titleEl){ titleEl.classList.add('du-layer__title'); }

    if(actionsEl && !cancelBtn){
      cancelBtn = document.createElement('button');
      cancelBtn.className = 'app-alert-cancel hidden';
      cancelBtn.id = 'appAlertCancel';
      cancelBtn.type = 'button';
      cancelBtn.textContent = '취소';
      actionsEl.insertBefore(cancelBtn, actionsEl.firstChild);
    }
    if(actionsEl && !confirmBtn){
      confirmBtn = document.createElement('button');
      confirmBtn.className = 'app-alert-confirm';
      confirmBtn.id = 'appAlertConfirm';
      confirmBtn.type = 'button';
      confirmBtn.textContent = '확인';
      actionsEl.appendChild(confirmBtn);
    }

    // 바깥 클릭으로 닫히지 않도록 오버레이에서 이벤트를 삼킵니다.
    if(!alertEl.__upickBackdropGuard){
      ['click','pointerdown','mousedown','touchstart'].forEach(function(type){
        alertEl.addEventListener(type, function(event){
          if(event.target === alertEl){
            event.preventDefault();
            event.stopPropagation();
            if(event.stopImmediatePropagation) event.stopImmediatePropagation();
          }
        }, true);
      });
      alertEl.__upickBackdropGuard = true;
    }
    return alertEl;
  }

  function isAlertOpen(){
    var el = alertEl || qs('#appAlert');
    return !!(el && el.classList && el.classList.contains('show'));
  }
  window.__upickHasVisibleAppAlert = isAlertOpen;

  function isScrollable(el){
    if(!el || el === document || el === document.body || el === document.documentElement) return false;
    var style = window.getComputedStyle ? window.getComputedStyle(el) : null;
    if(!style) return false;
    var y = style.overflowY;
    return /(auto|scroll|overlay)/.test(y) && el.scrollHeight > el.clientHeight + 1;
  }

  function allowInnerScroll(target){
    if(!target || !target.closest) return false;
    var panel = target.closest('.app-alert-card,.du-layer.show,.du-layer[open],.du-layer[aria-hidden="false"],.upick-div-modal.show,.upick-div-modal[open],.upick-div-modal[aria-hidden="false"],.upick-div-dialog.show,.upick-div-dialog[open],.upick-div-dialog[aria-hidden="false"],#settingsSuiteModal.show,#settingsSuiteModal[open],.settings-suite-dialog.show,.settings-suite-dialog[open],.gnb-management-dialog.show,.gnb-management-dialog[open],.common-modal-overlay,.sheet-modal.show,.sheet-modal.is-open,.bottom-sheet.show,.bottom-sheet.is-open,.auth-bottom-sheet.show,.auth-bottom-sheet.is-open,.account-recovery-sheet.show,.account-recovery-sheet.is-open,.admin-modal.show,.admin-modal.is-open,.admin-dialog.show,.admin-dialog.is-open,.modal.show,.modal.is-open,dialog[open],#gnbSheet.show,.gnb-sheet.show');
    if(!panel) return false;
    if(target.closest('.du-layer__body,.du-layer__panel,.modal-body,.calendar-day-modal-list,.calendar-day-modal-body,.upick-div-modal-panel,.upick-div-dialog-panel')) return true;
    var node = target;
    while(node && node !== panel.parentElement){
      if(isScrollable(node)) return true;
      if(node === panel) break;
      node = node.parentElement;
    }
    // 알럿 카드 자체는 내부 스크롤을 허용합니다.
    return !!target.closest('.app-alert-card');
  }

  function preventBackgroundScroll(event){
    if(!scrollLock.active) return;
    if(allowInnerScroll(event.target)) return;
    event.preventDefault();
    event.stopPropagation();
    if(event.stopImmediatePropagation) event.stopImmediatePropagation();
  }

  function preventScrollKeys(event){
    if(!scrollLock.active || !SCROLL_KEYS[event.key]) return;
    if(allowInnerScroll(event.target)) return;
    preventBackgroundScroll(event);
  }

  function restoreScrollPosition(){
    if(!scrollLock.active || scrollLock.ticking) return;
    var x = window.pageXOffset || document.documentElement.scrollLeft || document.body.scrollLeft || 0;
    var y = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
    if(x === scrollLock.x && y === scrollLock.y) return;
    scrollLock.ticking = true;
    requestAnimationFrame(function(){
      window.scrollTo(scrollLock.x, scrollLock.y);
      scrollLock.ticking = false;
    });
  }

  function setScrollLock(reason, active){
    reason = reason || 'default';
    if(active) scrollLock.reasons[reason] = true;
    else delete scrollLock.reasons[reason];

    var shouldLock = hasReason();
    if(scrollLock.active === shouldLock) return;

    scrollLock.active = shouldLock;
    document.documentElement.classList.toggle('upick-layer-scroll-lock', shouldLock);
    document.body.classList.toggle('upick-layer-scroll-lock', shouldLock);

    if(shouldLock){
      scrollLock.x = window.pageXOffset || document.documentElement.scrollLeft || document.body.scrollLeft || 0;
      scrollLock.y = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
      document.documentElement.style.scrollbarGutter = document.documentElement.style.scrollbarGutter || 'stable';
      document.body.style.scrollbarGutter = document.body.style.scrollbarGutter || 'stable';
    }
  }

  window.__upickHardScrollFreeze = {
    lock:function(reason){ setScrollLock(reason, true); },
    unlock:function(reason){ setScrollLock(reason, false); },
    sync:function(reason, active){ setScrollLock(reason, !!active); },
    isLocked:function(){ return scrollLock.active; },
    forceUnlock:function(){ scrollLock.reasons = {}; setScrollLock('force', false); }
  };

  document.addEventListener('wheel', preventBackgroundScroll, {capture:true, passive:false});
  document.addEventListener('touchmove', preventBackgroundScroll, {capture:true, passive:false});
  document.addEventListener('keydown', preventScrollKeys, true);
  window.addEventListener('scroll', restoreScrollPosition, {capture:true, passive:true});

  function setOpenLock(open){
    document.documentElement.classList.toggle('upick-alert-open', !!open);
    document.body.classList.toggle('upick-alert-open', !!open);
    setScrollLock('alert', !!open);
    if(typeof window.__upickSyncModalScrollLock === 'function'){
      setTimeout(window.__upickSyncModalScrollLock, 0);
    }
  }

  function forceClearAlertLockIfClosed(){
    if(isAlertOpen()) return;
    document.documentElement.classList.remove('upick-alert-open');
    document.body.classList.remove('upick-alert-open');
    setScrollLock('alert', false);
    if(typeof window.__upickSyncModalScrollLock === 'function') window.__upickSyncModalScrollLock();
  }

  function openNativeDialogIfNeeded(){
    // div 기반 공통 알럿으로 통일했기 때문에 native dialog 동작은 사용하지 않습니다.
  }
  function closeNativeDialogIfNeeded(){
    // div 기반 공통 알럿으로 통일했기 때문에 native dialog close 동작은 사용하지 않습니다.
  }
  function focusConfirm(){
    requestAnimationFrame(function(){
      try{ confirmBtn && confirmBtn.focus({preventScroll:true}); }catch(_){ try{ confirmBtn && confirmBtn.focus(); }catch(__){} }
    });
  }

  function openLayer(){
    ensureAlert();
    lastFocus = document.activeElement;
    if(window.UpickMotion && typeof window.UpickMotion.open === 'function'){
      return window.UpickMotion.open(alertEl, {
        activeClass:'show', panel:getAlertPanel(), duration:ALERT_OPEN_DURATION,
        beforeOpen:function(){ openNativeDialogIfNeeded(); setOpenLock(true); try{ document.dispatchEvent(new CustomEvent('upick:alert-opened')); }catch(_){} },
        afterOpen:focusConfirm
      });
    }
    alertEl.classList.add('show');
    alertEl.setAttribute('aria-hidden','false');
    openNativeDialogIfNeeded();
    setOpenLock(true);
    try{ document.dispatchEvent(new CustomEvent('upick:alert-opened')); }catch(_){}
    focusConfirm();
    return Promise.resolve(true);
  }

  function closeLayer(){
    if(!alertEl) return Promise.resolve(false);
    function afterClose(){
      closeNativeDialogIfNeeded();
      alertEl.setAttribute('aria-hidden','true');
      setOpenLock(false);
      forceClearAlertLockIfClosed();
      if(lastFocus && typeof lastFocus.focus === 'function'){
        try{ lastFocus.focus({preventScroll:true}); }catch(_){ try{ lastFocus.focus(); }catch(__){} }
      }
      lastFocus = null;
    }
    if(window.UpickMotion && typeof window.UpickMotion.close === 'function'){
      return window.UpickMotion.close(alertEl, {
        activeClass:'show', panel:getAlertPanel(), duration:ALERT_CLOSE_DURATION,
        afterClose:afterClose
      });
    }
    alertEl.classList.remove('show');
    setTimeout(afterClose, ALERT_CLOSE_DURATION);
    return Promise.resolve(true);
  }

  function normalizeOptions(input, maybeOptions){
    var extra = {};
    if(typeof maybeOptions === 'function') extra.callback = maybeOptions;
    else if(maybeOptions && typeof maybeOptions === 'object') extra = maybeOptions;
    if(typeof input === 'string') return Object.assign({message:input}, extra);
    return Object.assign({}, input || {}, extra);
  }

  function runAlertCallback(options, value){
    var callback = value === true ? (options.onConfirm || options.callback || options.onClose) : (options.onCancel || options.callback || options.onClose);
    if(typeof callback !== 'function') return Promise.resolve();
    try{ return Promise.resolve(callback(value)); }
    catch(error){ return Promise.reject(error); }
  }

  function restoreAlertButtons(){
    if(confirmBtn) confirmBtn.disabled = false;
    if(cancelBtn) cancelBtn.disabled = false;
  }

  function applyAlertVariant(options, mode){
    ensureAlert();
    var title = String(options && options.title || '');
    var confirmText = String(options && options.confirmText || '');
    var message = String(options && options.message || '');
    var explicit = String(options && (options.variant || options.tone || options.type) || '').toLowerCase();
    var danger = explicit === 'danger' || /삭제|탈퇴|블라인드/.test(title + ' ' + confirmText + ' ' + message);
    var report = explicit === 'report' || /신고/.test(title + ' ' + confirmText);
    var share = explicit === 'share' || /공유|QR|링크|URL/.test(title + ' ' + confirmText);
    alertEl.classList.remove('du-layer--small-action','du-layer--danger','du-layer--report','du-layer--share','du-layer--confirm','du-layer--alert');
    alertEl.classList.add('du-layer--small-action', mode === 'confirm' ? 'du-layer--confirm' : 'du-layer--alert');
    if(danger) alertEl.classList.add('du-layer--danger');
    else if(report) alertEl.classList.add('du-layer--report');
    else if(share) alertEl.classList.add('du-layer--share');
  }

  function showCommonAlert(input, maybeOptions){
    var options = normalizeOptions(input, maybeOptions);
    return enqueue(function(resolve){
      ensureAlert();
      applyAlertVariant(options, 'alert');
      titleEl.textContent = escapeText(options.title || '안내');
      messageEl.textContent = escapeText(options.message || '');
      confirmBtn.textContent = escapeText(options.confirmText || '확인');
      confirmBtn.setAttribute('aria-label', confirmBtn.textContent);
      cancelBtn.textContent = escapeText(options.cancelText || '취소');
      cancelBtn.classList.add('hidden');
      cancelBtn.setAttribute('aria-hidden','true');
      if(actionsEl){ actionsEl.classList.add('is-alert'); actionsEl.classList.remove('is-confirm'); }
      confirmBtn.onclick = null;
      cancelBtn.onclick = null;
      var closing = false;
      confirmBtn.onclick = function(){
        if(closing) return;
        closing = true;
        confirmBtn.disabled = true;
        if(cancelBtn) cancelBtn.disabled = true;
        Promise.resolve(closeLayer()).catch(function(){ return true; })
          .then(function(){ return runAlertCallback(options, true).catch(function(error){ console.warn('[UpickAlert] callback failed:', error); }); })
          .then(function(){ resolve(true); })
          .finally(function(){ restoreAlertButtons(); setTimeout(forceClearAlertLockIfClosed, 0); });
      };
      openLayer();
    });
  }

  function showCommonConfirm(input, maybeOptions){
    var options = normalizeOptions(input, maybeOptions);
    return enqueue(function(resolve){
      ensureAlert();
      applyAlertVariant(options, 'confirm');
      titleEl.textContent = escapeText(options.title || '확인');
      messageEl.textContent = escapeText(options.message || '');
      confirmBtn.textContent = escapeText(options.confirmText || '확인');
      cancelBtn.textContent = escapeText(options.cancelText || '취소');
      confirmBtn.setAttribute('aria-label', confirmBtn.textContent);
      cancelBtn.setAttribute('aria-label', cancelBtn.textContent);
      cancelBtn.classList.remove('hidden');
      cancelBtn.removeAttribute('aria-hidden');
      if(actionsEl){ actionsEl.classList.add('is-confirm'); actionsEl.classList.remove('is-alert'); }
      confirmBtn.onclick = null;
      cancelBtn.onclick = null;
      var closing = false;
      function finish(value){
        if(closing) return;
        closing = true;
        var result = !!value;
        confirmBtn.disabled = true;
        if(cancelBtn) cancelBtn.disabled = true;
        Promise.resolve(closeLayer()).catch(function(){ return true; })
          .then(function(){ return runAlertCallback(options, result).catch(function(error){ console.warn('[UpickAlert] callback failed:', error); }); })
          .then(function(){ resolve(result); })
          .finally(function(){ restoreAlertButtons(); setTimeout(forceClearAlertLockIfClosed, 0); });
      }
      confirmBtn.onclick = function(){ finish(true); };
      cancelBtn.onclick = function(){ finish(false); };
      openLayer();
    });
  }

  function enqueue(job){
    queue = queue.catch(function(){}).then(function(){ return new Promise(job); });
    return queue;
  }

  document.addEventListener('keydown', function(event){
    if(!isAlertOpen()) return;
    if(event.key === 'Escape'){
      event.preventDefault();
      event.stopPropagation();
      if(event.stopImmediatePropagation) event.stopImmediatePropagation();
      return false;
    }
  }, true);

  function focusAfterClose(target){
    if(target && typeof target.focus === 'function'){
      try{ target.focus({preventScroll:true}); }catch(_){ try{ target.focus(); }catch(__){} }
    }
  }
  function openModalAlertCompat(message, focusTarget, title){
    return showCommonAlert({ title:title || '안내', message:message || '', confirmText:'확인', onClose:function(){ focusAfterClose(focusTarget); } });
  }
  function openModalConfirmCompat(message, focusTarget, title, confirmText, cancelText){
    return showCommonConfirm({ title:title || '확인', message:message || '', confirmText:confirmText || '확인', cancelText:cancelText || '취소', onCancel:function(){ focusAfterClose(focusTarget); } });
  }

  window.UpickAlert = Object.assign(window.UpickAlert || {}, {
    alert:showCommonAlert,
    confirm:showCommonConfirm,
    openModalAlert:openModalAlertCompat,
    openModalConfirm:openModalConfirmCompat,
    closeDuration:ALERT_CLOSE_DURATION,
    openDuration:ALERT_OPEN_DURATION
  });
  window.showCommonAlert = showCommonAlert;
  window.showCommonConfirm = showCommonConfirm;
  window.showAppAlert = showCommonAlert;
  window.showAppConfirm = showCommonConfirm;
  window.showAlert = showCommonAlert;
  window.showConfirm = showCommonConfirm;
  window.openModalAlert = openModalAlertCompat;
  window.openModalConfirm = openModalConfirmCompat;

  // 로딩바가 남아 있어도 알럿 레이어가 항상 위에 오도록 최소 보정만 수행합니다.
  window.upickAlertOverLoadingFix = function(){
    document.querySelectorAll('#globalLoadingBar,.global-loading,.page-loader').forEach(function(el){
      el.style.pointerEvents = 'none';
      el.style.zIndex = '2147483000';
    });
  };

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ensureAlert, {once:true});
  else ensureAlert();
})();

/* 더운정픽 모달/바텀시트 스크롤 잠금 - lightweight sync */
(function(){
  'use strict';
  var selectors = [
    '.common-modal-overlay.show','.common-modal-overlay.is-open','.common-modal-overlay[open]',
    '.modal-backdrop.show','.modal-backdrop.is-open','dialog[open]:not(#appAlert)',
    '.sheet-modal.show','.sheet-modal.is-open','.bottom-sheet.show','.bottom-sheet.is-open',
    '.auth-bottom-sheet.show','.auth-bottom-sheet.is-open','.account-recovery-sheet.show','.account-recovery-sheet.is-open',
    '.admin-modal.show','.admin-modal.is-open','.admin-dialog.show','.admin-dialog.is-open',
    '.modal.show','.modal.is-open','.modal-overlay.show','.modal-overlay.is-open',
    '#settingsSuiteModal.show','#settingsSuiteModal[open]',
    '.settings-suite-dialog.show','.settings-suite-dialog[open]',
    '.gnb-management-dialog.show','.gnb-management-dialog[open]',
    '.upick-div-modal.show','.upick-div-modal[open]',
    '.upick-div-dialog.show','.upick-div-dialog[open]',
    '.du-layer.show','.du-layer[open]',
    '#gnbSheet.show','.gnb-sheet.show'
  ];
  var active = false;
  var scheduled = false;

  function isVisible(el){
    if(!el || el.closest('[aria-hidden="true"]')) return false;
    if(el.hidden) return false;
    var style = window.getComputedStyle ? window.getComputedStyle(el) : null;
    if(style && (style.display === 'none' || style.visibility === 'hidden')) return false;
    return !!(el.offsetWidth || el.offsetHeight || (el.getClientRects && el.getClientRects().length));
  }
  function hasOpenLayer(){
    for(var i=0;i<selectors.length;i++){
      var list = document.querySelectorAll(selectors[i]);
      for(var j=0;j<list.length;j++) if(isVisible(list[j])) return true;
    }
    return false;
  }
  function set(activeNext){
    activeNext = !!activeNext;
    if(active === activeNext) return;
    active = activeNext;
    if(window.__upickHardScrollFreeze) window.__upickHardScrollFreeze.sync('layer', active);
    document.documentElement.classList.toggle('upick-layer-scroll-lock', active || (window.__upickHardScrollFreeze && window.__upickHardScrollFreeze.isLocked()));
    document.body.classList.toggle('upick-layer-scroll-lock', active || (window.__upickHardScrollFreeze && window.__upickHardScrollFreeze.isLocked()));
  }
  function sync(){
    scheduled = false;
    set(hasOpenLayer());
  }
  function requestSync(){
    if(scheduled) return;
    scheduled = true;
    requestAnimationFrame(sync);
  }
  window.__upickSyncModalScrollLock = requestSync;
  ['click','pointerdown','transitionend','animationend','keyup'].forEach(function(type){
    document.addEventListener(type, requestSync, true);
  });
  document.addEventListener('upick:layer-opened', requestSync, true);
  document.addEventListener('upick:layer-closed', requestSync, true);
  if(window.MutationObserver){
    // 전체 DOM subtree 감시는 공개앱에서 비용이 커서 body/html의 class 변경 중심으로만 감지합니다.
    new MutationObserver(requestSync).observe(document.body || document.documentElement, {attributes:true, attributeFilter:['class','style','open','hidden']});
    new MutationObserver(requestSync).observe(document.documentElement, {attributes:true, attributeFilter:['class','style']});
    var bindLayerObservers = function(){
      document.querySelectorAll('#settingsSuiteModal,#accountEditModal,#passwordChangeModal,#detailModal,#noticeModal,#calendarDayModal,#calendarReservationModal,#qrModal,#communityEditorModal,#communityDetailModal,#communityReportModal,#appAlert,.app-alert,.sheet-modal,.du-layer').forEach(function(el){
        if(!el || el.__upickLayerLockObserved) return;
        el.__upickLayerLockObserved = '1';
        new MutationObserver(requestSync).observe(el,{attributes:true,attributeFilter:['class','open','aria-hidden','style','hidden']});
      });
    };
    bindLayerObservers();
    new MutationObserver(bindLayerObservers).observe(document.body || document.documentElement,{childList:true,subtree:true});
  }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', requestSync, {once:true});
  else requestSync();
})();
