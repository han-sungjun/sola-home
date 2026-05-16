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
    if(root) return root;
    root = document.getElementById('commonModalRoot');
    if(!root){
      root = document.createElement('div');
      root.id = 'commonModalRoot';
      root.className = 'common-modal-root';
      document.body.appendChild(root);
    }
    return root;
  }

  function lockBody(){
    scrollY = window.scrollY || document.documentElement.scrollTop || 0;
    document.documentElement.classList.add('common-modal-lock');
    document.body.classList.add('common-modal-lock');
    document.body.style.top = '-' + scrollY + 'px';
  }

  function unlockBody(){
    document.documentElement.classList.remove('common-modal-lock');
    document.body.classList.remove('common-modal-lock');
    document.body.style.top = '';
    window.scrollTo(0, scrollY || 0);
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
    var opts = currentOptions || {};
    var content = currentContent;
    if(content && currentPlaceholder && currentPlaceholder.parentNode){
      currentPlaceholder.parentNode.insertBefore(content, currentPlaceholder);
      currentPlaceholder.remove();
    }else if(content && content.parentNode){
      content.parentNode.removeChild(content);
    }
    document.removeEventListener('keydown', trapEsc, true);
    overlay.remove();
    overlay = null;
    stage = null;
    currentContent = null;
    currentOptions = null;
    currentPlaceholder = null;
    unlockBody();
    if(typeof opts.onClose === 'function') opts.onClose(content);
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
    overlay.className = 'common-modal-overlay' + (options.overlayClass ? ' ' + options.overlayClass : '');
    overlay.setAttribute('role','presentation');

    stage = document.createElement('div');
    stage.className = 'common-modal-stage' + (options.stageClass ? ' ' + options.stageClass : '');
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
