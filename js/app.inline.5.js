(function(){
  'use strict';

  var viewer = null;
  var lastPhotoTrigger = null;
  var wasOpen = false;
  var restoring = false;

  function qs(sel, root){ return (root || document).querySelector(sel); }
  function getViewer(){ return document.getElementById('benefitPhotoZoomViewer'); }
  function isVisible(el){ return !!(el && (el.offsetWidth || el.offsetHeight || el.getClientRects().length)); }

  function rememberTrigger(target){
    var photo = target && target.closest ? target.closest('#detailModal .benefit-detail-photo') : null;
    if(photo && isVisible(photo)){
      lastPhotoTrigger = photo;
      if(!photo.hasAttribute('tabindex')) photo.setAttribute('tabindex', '0');
      if(!photo.hasAttribute('role')) photo.setAttribute('role', 'button');
      if(!photo.hasAttribute('aria-label')) photo.setAttribute('aria-label', '대표 사진 확대 보기');
    }
  }

  function restorePhotoFocus(){
    if(restoring) return;
    var target = lastPhotoTrigger;
    if(!target || !document.contains(target) || !isVisible(target)){
      target = qs('#detailModal .benefit-detail-photo.is-photo-ready, #detailModal .benefit-detail-photo[tabindex]');
    }
    if(!target || !isVisible(target)) return;

    restoring = true;
    requestAnimationFrame(function(){
      setTimeout(function(){
        try{ target.focus({preventScroll:true}); }
        catch(_){ target.focus(); }
        restoring = false;
      }, 0);
    });
  }

  function sync(){
    viewer = getViewer();
    var open = !!(viewer && viewer.classList.contains('show'));

    if(open && !wasOpen){
      var active = document.activeElement;
      if(active && active.closest && active.closest('#detailModal .benefit-detail-photo')){
        rememberTrigger(active);
      }else if(!lastPhotoTrigger){
        var fallback = qs('#detailModal .benefit-detail-photo.is-photo-ready, #detailModal .benefit-detail-photo[tabindex]');
        if(fallback) lastPhotoTrigger = fallback;
      }
    }

    if(!open && wasOpen){
      restorePhotoFocus();
    }

    wasOpen = open;
  }

  function bind(){
    document.addEventListener('focusin', function(event){
      rememberTrigger(event.target);
    }, true);

    document.addEventListener('pointerdown', function(event){
      rememberTrigger(event.target);
    }, true);

    document.addEventListener('keydown', function(event){
      if(event.key === 'Enter' || event.key === ' '){
        rememberTrigger(event.target);
      }
    }, true);

    document.addEventListener('click', function(event){
      var v = getViewer();
      if(!v || !v.classList.contains('show')) return;
      if(event.target && event.target.closest && event.target.closest('#benefitPhotoZoomViewer .photo-viewer-close')){
        setTimeout(restorePhotoFocus, 30);
        setTimeout(restorePhotoFocus, 120);
      }
    }, true);

    var mo = new MutationObserver(sync);
    mo.observe(document.body, {subtree:true, childList:true, attributes:true, attributeFilter:['class','style','aria-hidden']});
    sync();
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bind, {once:true});
  else bind();
})();