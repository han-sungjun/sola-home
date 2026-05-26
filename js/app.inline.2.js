(function(){
  'use strict';

  function closeOperationManageModal(){
    if(window.CommonModal && typeof window.CommonModal.close === 'function'){
      window.CommonModal.close();
      return;
    }

    var modal = document.querySelector('#gnbOperationManageModal');
    if(modal){
      modal.classList.remove('show', 'active', 'open');
      modal.setAttribute('aria-hidden', 'true');
    }
  }

  function closeGnbOnly(){
    var overlay = document.querySelector('#gnbOverlay, .gnb-overlay');
    var sheet = document.querySelector('#gnbSheet, .gnb-sheet');
    var cleanup = function(){ document.body.classList.remove('gnb-open'); };
    if(window.UpickMotion){
      if(overlay) window.UpickMotion.close(overlay, { activeClass:'show', duration:240 });
      if(sheet){
        sheet.setAttribute('aria-hidden', 'true');
        window.UpickMotion.close(sheet, { activeClass:'show', duration:240, afterClose:cleanup });
      }else{
        cleanup();
      }
      return;
    }
    if(overlay) overlay.classList.remove('show');
    if(sheet){
      sheet.classList.remove('show');
      sheet.setAttribute('aria-hidden', 'true');
    }
    cleanup();
  }

  document.addEventListener('click', function(event){
    var btn = event.target && event.target.closest && event.target.closest('#gnbOperationManageModal [data-view-link], #gnbOperationManageModal #rootRefreshStateBtn');
    if(!btn) return;

    if(btn.id === 'rootRefreshStateBtn'){
      event.preventDefault();
      event.stopPropagation();
      closeOperationManageModal();
      closeGnbOnly();
      setTimeout(function(){
        location.replace(location.pathname + location.search + location.hash);
      }, 80);
      return;
    }

    setTimeout(function(){
      closeOperationManageModal();
      closeGnbOnly();
    }, 0);
  }, true);
})();