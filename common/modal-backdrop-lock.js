/* 더운정픽 공통 모달 바깥 클릭 닫힘 방지
   모든 dialog / alert / confirm / sheet / modal 계열은 바깥 영역 클릭으로 닫지 않습니다.
   X, 취소, 확인 등 명시 버튼으로만 닫을 수 있습니다. */
(function(){
  'use strict';

  function lockModalBackdropClick(event){
    if(event.target === event.currentTarget){
      event.preventDefault();
      event.stopPropagation();
      if(typeof event.stopImmediatePropagation === 'function'){
        event.stopImmediatePropagation();
      }
    }
  }

  function bindModalBackdropLock(){
    var selectors = [
      'dialog',
      '.app-alert',
      '.sheet-modal',
      '[role="dialog"]',
      '[role="alertdialog"]',
      '.modal',
      '.modal-overlay',
      '.modal-backdrop',
      '.admin-modal',
      '.admin-dialog'
    ];

    document.querySelectorAll(selectors.join(',')).forEach(function(el){
      if(el.dataset.modalBackdropLockBound === '1') return;
      el.dataset.modalBackdropLockBound = '1';
      el.addEventListener('click', lockModalBackdropClick, true);
      el.addEventListener('pointerdown', lockModalBackdropClick, true);
    });
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', bindModalBackdropLock, { once:true });
  }else{
    bindModalBackdropLock();
  }

  new MutationObserver(bindModalBackdropLock).observe(document.documentElement, {
    childList:true,
    subtree:true
  });

  window.__UPICK_MODAL_BACKDROP_LOCK__ = {
    bind: bindModalBackdropLock
  };
})();
