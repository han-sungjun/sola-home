/* 더운정픽 공통 알럿/컨펌 v2026051602 */
(function(){
  'use strict';

  var queue = Promise.resolve();
  var lastFocus = null;
  var alertEl = null;
  var titleEl = null;
  var messageEl = null;
  var confirmBtn = null;
  var cancelBtn = null;
  var actionsEl = null;

  function qs(sel, root){ return (root || document).querySelector(sel); }
  function escapeText(value){ return String(value == null ? '' : value); }

  function ensureAlert(){
    alertEl = qs('#appAlert');
    if(!alertEl){
      alertEl = document.createElement('div');
      alertEl.id = 'appAlert';
      alertEl.className = 'app-alert';
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

    titleEl = qs('#appAlertTitle', alertEl) || qs('#appAlertTitle');
    messageEl = qs('#appAlertMessage', alertEl) || qs('#appAlertMessage');
    confirmBtn = qs('#appAlertConfirm', alertEl) || qs('#appAlertConfirm');
    cancelBtn = qs('#appAlertCancel', alertEl) || qs('#appAlertCancel');

    var actions = qs('.app-alert-actions', alertEl);
    actionsEl = actions;
    if(actions && !cancelBtn){
      cancelBtn = document.createElement('button');
      cancelBtn.className = 'app-alert-cancel hidden';
      cancelBtn.id = 'appAlertCancel';
      cancelBtn.type = 'button';
      cancelBtn.textContent = '취소';
      actions.insertBefore(cancelBtn, actions.firstChild);
    }
    if(actions && !confirmBtn){
      confirmBtn = document.createElement('button');
      confirmBtn.className = 'app-alert-confirm';
      confirmBtn.id = 'appAlertConfirm';
      confirmBtn.type = 'button';
      confirmBtn.textContent = '확인';
      actions.appendChild(confirmBtn);
    }

    if(alertEl.parentElement !== document.body){
      document.body.appendChild(alertEl);
    }

    alertEl.addEventListener('click', blockBackdropClose, true);
    alertEl.addEventListener('pointerdown', blockBackdropClose, true);

    return alertEl;
  }

  function blockBackdropClose(event){
    if(event.target === alertEl){
      event.preventDefault();
      event.stopPropagation();
      if(event.stopImmediatePropagation) event.stopImmediatePropagation();
    }
  }

  function setOpenLock(open){
    document.documentElement.classList.toggle('upick-alert-open', !!open);
    document.body.classList.toggle('upick-alert-open', !!open);
    if(typeof window.__upickSyncModalScrollLock === 'function'){
      setTimeout(window.__upickSyncModalScrollLock, 0);
    }
  }

  function openLayer(){
    ensureAlert();
    lastFocus = document.activeElement;
    alertEl.classList.add('show');
    alertEl.setAttribute('aria-hidden','false');
    setOpenLock(true);

    if(typeof alertEl.showModal === 'function' && alertEl.tagName === 'DIALOG' && !alertEl.open){
      try{ alertEl.showModal(); }catch(_){ alertEl.setAttribute('open',''); }
    }
    requestAnimationFrame(function(){
      try{ confirmBtn && confirmBtn.focus({preventScroll:true}); }catch(_){ try{ confirmBtn && confirmBtn.focus(); }catch(__){} }
    });
  }

  function closeLayer(){
    if(!alertEl) return;
    alertEl.classList.remove('show');
    alertEl.setAttribute('aria-hidden','true');
    if(alertEl.tagName === 'DIALOG' && alertEl.open){
      try{ alertEl.close(); }catch(_){ alertEl.removeAttribute('open'); }
    }
    setOpenLock(false);
    if(lastFocus && typeof lastFocus.focus === 'function'){
      try{ lastFocus.focus({preventScroll:true}); }catch(_){ try{ lastFocus.focus(); }catch(__){} }
    }
    lastFocus = null;
  }

  function normalizeOptions(input, maybeOptions){
    if(typeof input === 'string') return Object.assign({ message: input }, maybeOptions || {});
    return Object.assign({}, input || {});
  }

  function showCommonAlert(input, maybeOptions){
    var options = normalizeOptions(input, maybeOptions);
    return enqueue(function(resolve){
      ensureAlert();
      titleEl.textContent = escapeText(options.title || '안내');
      messageEl.textContent = escapeText(options.message || '');
      confirmBtn.textContent = escapeText(options.confirmText || '확인');
      confirmBtn.setAttribute('aria-label', confirmBtn.textContent);
      cancelBtn.textContent = escapeText(options.cancelText || '취소');
      cancelBtn.classList.add('hidden');
      cancelBtn.setAttribute('aria-hidden','true');
      if(actionsEl){
        actionsEl.classList.add('is-alert');
        actionsEl.classList.remove('is-confirm');
      }
      confirmBtn.onclick = null;
      cancelBtn.onclick = null;
      var finish = function(){
        confirmBtn.onclick = null;
        cancelBtn.onclick = null;
        closeLayer();
        resolve(true);
      };
      confirmBtn.onclick = finish;
      openLayer();
    });
  }

  function showCommonConfirm(input, maybeOptions){
    var options = normalizeOptions(input, maybeOptions);
    return enqueue(function(resolve){
      ensureAlert();
      titleEl.textContent = escapeText(options.title || '확인');
      messageEl.textContent = escapeText(options.message || '');
      confirmBtn.textContent = escapeText(options.confirmText || '확인');
      cancelBtn.textContent = escapeText(options.cancelText || '취소');
      confirmBtn.setAttribute('aria-label', confirmBtn.textContent);
      cancelBtn.setAttribute('aria-label', cancelBtn.textContent);
      cancelBtn.classList.remove('hidden');
      cancelBtn.removeAttribute('aria-hidden');
      if(actionsEl){
        actionsEl.classList.add('is-confirm');
        actionsEl.classList.remove('is-alert');
      }
      confirmBtn.onclick = null;
      cancelBtn.onclick = null;
      var finish = function(value){
        confirmBtn.onclick = null;
        cancelBtn.onclick = null;
        closeLayer();
        resolve(!!value);
      };
      confirmBtn.onclick = function(){ finish(true); };
      cancelBtn.onclick = function(){ finish(false); };
      openLayer();
    });
  }

  function enqueue(job){
    queue = queue.catch(function(){}).then(function(){
      return new Promise(job);
    });
    return queue;
  }

  document.addEventListener('keydown', function(event){
    if(!alertEl || !alertEl.classList.contains('show')) return;
    if(event.key === 'Escape'){
      event.preventDefault();
      event.stopPropagation();
      if(event.stopImmediatePropagation) event.stopImmediatePropagation();
      if(cancelBtn && !cancelBtn.classList.contains('hidden')) cancelBtn.click();
      else if(confirmBtn) confirmBtn.click();
    }
  }, true);

  window.showCommonAlert = showCommonAlert;
  window.showCommonConfirm = showCommonConfirm;
  window.showAppAlert = window.showAppAlert || showCommonAlert;
  window.showAppConfirm = window.showAppConfirm || showCommonConfirm;

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ensureAlert, {once:true});
  else ensureAlert();
})();
