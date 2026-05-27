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
    if(sheet){
      sheet.classList.add('is-closing','upick-motion-closing');
      sheet.classList.remove('show');
      sheet.setAttribute('aria-hidden', 'true');
    }
    function finish(){
      if(sheet) sheet.classList.remove('is-closing','upick-motion-closing','gnb-enter');
      document.body.classList.remove('gnb-open');
      document.body.style.overflow = '';
    }
    if(window.UpickMotion && overlay){
      window.UpickMotion.close(overlay, { duration:240, afterClose:finish });
    }else{
      if(overlay) overlay.classList.remove('show');
      setTimeout(finish, 240);
    }
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