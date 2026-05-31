(function(){
  'use strict';

  var root = null;
  var overlay = null;
  var stage = null;
  var scrollY = 0;
  var currentContent = null;
  var currentOptions = null;
  var currentPlaceholder = null;
  var initialized = false;

  function ensureRoot(){
    if(root && root.isConnected) return root;
    var duRoot = document.getElementById('duModalRoot');
    root = duRoot || document.getElementById('commonModalRoot');
    if(!root){
      root = document.createElement('div');
      root.id = 'commonModalRoot';
      root.className = 'common-modal-root';
      (document.getElementById('duModalRoot') || document.body).appendChild(root);
    }else{
      root.classList.add('common-modal-root');
    }
    return root;
  }

  function lockBody(){
    scrollY = window.scrollY || document.documentElement.scrollTop || 0;
    document.documentElement.classList.add('common-modal-lock');
    document.body.classList.add('common-modal-lock');
    document.body.style.top = '-' + scrollY + 'px';
  }

  function hasCommonModalOverlay(){
    return !!document.querySelector('.common-modal-overlay.show,.common-modal-overlay.is-open,.common-modal-overlay[aria-hidden="false"]');
  }

  function syncAfterClose(){
    try{ if(window.DuLayer && typeof window.DuLayer.cleanupInactive === 'function') window.DuLayer.cleanupInactive(); }catch(_){}
    try{ document.dispatchEvent(new CustomEvent('upick:layer-closed', { detail:{ id:'commonModalRoot', type:'modal' } })); }catch(_){}
    try{ if(window.DuLayerStackManager && typeof window.DuLayerStackManager.requestSync === 'function') window.DuLayerStackManager.requestSync(); }catch(_){}
    try{ if(typeof window.__upickSyncModalScrollLock === 'function') setTimeout(window.__upickSyncModalScrollLock, 0); }catch(_){}
  }

  function unlockBody(){
    document.documentElement.classList.remove('common-modal-lock');
    document.body.classList.remove('common-modal-lock');
    document.body.style.top = '';
    if(!hasCommonModalOverlay()) window.scrollTo(0, scrollY || 0);
  }

  function focusFirst(selector){
    window.setTimeout(function(){
      var target = selector && stage ? stage.querySelector(selector) : null;
      if(!target && stage) target = stage.querySelector('[autofocus], button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
      if(target && target.focus) target.focus({preventScroll:true});
    }, 30);
  }

  function close(){
    if(!overlay) return;
    var closingOverlay = overlay;
    var closingStage = stage;
    var opts = currentOptions || {};
    var content = currentContent;
    function finishClose(){
      if(content && currentPlaceholder && currentPlaceholder.parentNode){
        currentPlaceholder.parentNode.insertBefore(content, currentPlaceholder);
        currentPlaceholder.remove();
      }else if(content && content.parentNode){
        content.parentNode.removeChild(content);
      }
      document.removeEventListener('keydown', trapEsc, true);
      if(closingOverlay && closingOverlay.parentNode) closingOverlay.remove();
      document.querySelectorAll('.common-modal-overlay:not(.show):not(.is-open), .common-modal-overlay[aria-hidden="true"]').forEach(function(el){
        if(el !== overlay && el.parentNode) el.parentNode.removeChild(el);
      });
      if(overlay === closingOverlay){
        overlay = null;
        stage = null;
        currentContent = null;
        currentOptions = null;
        currentPlaceholder = null;
      }
      unlockBody();
      syncAfterClose();
      setTimeout(syncAfterClose, 260);
      if(typeof opts.onClose === 'function') opts.onClose(content);
    }
    if(window.UpickMotion && typeof window.UpickMotion.close === 'function'){
      window.UpickMotion.close(closingOverlay, { activeClass:'show', panel:closingStage, duration:240, ariaHidden:false, afterClose:finishClose });
    }else{
      closingOverlay.classList.remove('show','is-open','upick-motion-open');
      closingOverlay.classList.add('upick-motion-closing');
      setTimeout(finishClose, 240);
    }
  }

  function open(options){
    options = options || {};
    close();
    ensureRoot();

    var content = options.content;
    if(typeof content === 'string'){
      var template = document.createElement('template');
      template.innerHTML = content.trim();
      content = template.content.firstElementChild;
    }
    if(!content) return null;

    overlay = document.createElement('div');
    overlay.className = 'common-modal-overlay du-layer du-layer--modal upick-motion-layer' + (options.overlayClass ? ' ' + options.overlayClass : '');
    overlay.setAttribute('data-du-layer','modal');
    overlay.setAttribute('data-close-on-backdrop','false');
    overlay.setAttribute('data-du-close-on-backdrop','false');
    overlay.setAttribute('data-du-close-on-esc','false');
    overlay.setAttribute('role','presentation');
    overlay.setAttribute('aria-hidden','true');

    stage = document.createElement('div');
    stage.className = 'common-modal-stage du-layer__panel' + (options.stageClass ? ' ' + options.stageClass : '');
    stage.setAttribute('data-du-layer-panel','');
    stage.setAttribute('role','dialog');
    stage.setAttribute('aria-modal','true');
    if(options.labelledby) stage.setAttribute('aria-labelledby', options.labelledby);

    if(content.parentNode){
      currentPlaceholder = document.createComment('common-modal-placeholder');
      content.parentNode.insertBefore(currentPlaceholder, content);
    }
    stage.appendChild(content);
    overlay.appendChild(stage);
    root.appendChild(overlay);
    if(window.UpickMotion && typeof window.UpickMotion.open === 'function'){
      window.UpickMotion.open(overlay, { activeClass:'show', panel:stage, duration:240 });
    }else{
      overlay.classList.add('show','is-open','upick-motion-open');
      overlay.setAttribute('aria-hidden','false');
    }
    try{ document.dispatchEvent(new CustomEvent('upick:layer-opened', { detail:{ id:'commonModalRoot', type:'modal' } })); }catch(_){ }

    overlay.addEventListener('click', function(event){
      if(event.target === overlay){
        event.preventDefault();
        event.stopPropagation();
      }
    }, true);
    document.addEventListener('keydown', trapEsc, true);

    currentContent = content;
    currentOptions = options;
    lockBody();
    focusFirst(options.initialFocusSelector);
    return content;
  }

  function trapEsc(event){
    if(!overlay) return;
    if(event.key === 'Escape'){
      event.preventDefault();
      event.stopPropagation();
      if(currentOptions && currentOptions.allowEscClose === true) close();
    }
  }

  function init(){
    if(initialized) return;
    initialized = true;
    ensureRoot();
  }

  window.CommonModal = { init:init, open:open, close:close, isOpen:function(){ return !!overlay; } };

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, {once:true});
  else init();
})();
