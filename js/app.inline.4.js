(function(){
  'use strict';

  var viewer = null;
  var closeBtn = null;
  var lastFocus = null;

  function qs(sel, root){ return (root || document).querySelector(sel); }

  function getViewer(){
    return document.getElementById('benefitPhotoZoomViewer');
  }

  function isOpen(){
    viewer = getViewer();
    return !!(viewer && viewer.classList.contains('show'));
  }

  function getFocusable(root){
    if(!root) return [];
    return Array.prototype.slice.call(root.querySelectorAll([
      'button:not([disabled])',
      'a[href]',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])'
    ].join(','))).filter(function(el){
      return !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length);
    });
  }

  function focusClose(){
    if(!isOpen()) return;
    closeBtn = qs('.photo-viewer-close', viewer);
    if(closeBtn){
      closeBtn.setAttribute('type', 'button');
      closeBtn.setAttribute('aria-label', closeBtn.getAttribute('aria-label') || '닫기');
      requestAnimationFrame(function(){
        try{ closeBtn.focus({preventScroll:true}); }
        catch(_){ closeBtn.focus(); }
      });
    }
  }

  function closeViewer(){
    if(!isOpen()) return;
    if(closeBtn) closeBtn.click();
    else viewer.classList.remove('show');
    if(lastFocus && typeof lastFocus.focus === 'function'){
      requestAnimationFrame(function(){
        try{ lastFocus.focus({preventScroll:true}); }
        catch(_){ lastFocus.focus(); }
      });
    }
  }

  function onClick(event){
    if(!isOpen()) return;

    // 대표 사진 팝업은 바깥 영역 클릭으로 닫히지 않도록 차단합니다.
    if(event.target === viewer){
      event.preventDefault();
      event.stopPropagation();
      if(typeof event.stopImmediatePropagation === 'function') event.stopImmediatePropagation();
      focusClose();
      return false;
    }
  }

  function onKeydown(event){
    if(!isOpen()) return;

    if(event.key === 'Escape'){
      event.preventDefault();
      event.stopPropagation();
      closeViewer();
      return;
    }

    if(event.key !== 'Tab') return;

    var card = qs('.photo-viewer-card', viewer) || viewer;
    var focusables = getFocusable(card);
    if(!focusables.length){
      event.preventDefault();
      focusClose();
      return;
    }

    var first = focusables[0];
    var last = focusables[focusables.length - 1];
    var active = document.activeElement;

    if(event.shiftKey && active === first){
      event.preventDefault();
      last.focus();
    }else if(!event.shiftKey && active === last){
      event.preventDefault();
      first.focus();
    }else if(!card.contains(active)){
      event.preventDefault();
      first.focus();
    }
  }

  function syncOpenState(){
    if(isOpen()){
      document.documentElement.classList.add('upick-photo-viewer-open');
      document.body.classList.add('upick-photo-viewer-open');
      if(!viewer.dataset.a11yFocused){
        viewer.dataset.a11yFocused = '1';
        lastFocus = document.activeElement;
        focusClose();
      }
    }else{
      document.documentElement.classList.remove('upick-photo-viewer-open');
      document.body.classList.remove('upick-photo-viewer-open');
      if(viewer) delete viewer.dataset.a11yFocused;
    }
  }

  function bind(){
    viewer = getViewer();
    if(!viewer) return;
    if(viewer.dataset.photoA11yBound === '1') return;
    viewer.dataset.photoA11yBound = '1';

    viewer.setAttribute('aria-modal', 'true');
    viewer.setAttribute('role', viewer.getAttribute('role') || 'presentation');

    viewer.addEventListener('click', onClick, true);
    document.addEventListener('keydown', onKeydown, true);

    var observer = new MutationObserver(syncOpenState);
    observer.observe(viewer, {attributes:true, attributeFilter:['class', 'style', 'aria-hidden']});
    syncOpenState();
  }

  function init(){
    bind();
    new MutationObserver(bind).observe(document.body, {childList:true, subtree:true});
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, {once:true});
  else init();
})();