(function(){
  'use strict';

  function hasVisibleDuLayer(){
    return !!document.querySelector('.du-layer.show, .du-layer.is-open, .du-layer.open, .du-layer[aria-hidden="false"]');
  }

  function forceSyncLayerLockAfterOperationClose(){
    try{ if(window.DuLayer && typeof window.DuLayer.cleanupInactive === 'function') window.DuLayer.cleanupInactive(); }catch(_){}
    try{ if(window.DuLayerStackManager && typeof window.DuLayerStackManager.requestSync === 'function') window.DuLayerStackManager.requestSync(); }catch(_){}
    try{ if(typeof window.__upickSyncModalScrollLock === 'function') window.__upickSyncModalScrollLock(); }catch(_){}
    window.setTimeout(function(){
      try{ if(typeof window.__upickSyncModalScrollLock === 'function') window.__upickSyncModalScrollLock(); }catch(_){}
      if(!hasVisibleDuLayer()){
        document.documentElement.classList.remove('upick-layer-scroll-lock','upick-modal-scroll-event-lock','common-modal-lock');
        document.body.classList.remove('upick-layer-scroll-lock','upick-modal-scroll-event-lock','common-modal-lock','upick-hard-scroll-lock');
        document.body.style.overflow = '';
        document.body.style.top = '';
      }
    }, 280);
  }

  function closeOperationManageModal(){
    function cleanup(){
      document.querySelectorAll('#gnbOperationManageModal').forEach(function(el){
        if(el.closest && el.closest('.common-modal-overlay.show, .common-modal-overlay.is-open')) return;
        var overlay = el.closest && el.closest('.common-modal-overlay');
        if(overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay);
        else if(el.parentNode) el.parentNode.removeChild(el);
      });
      forceSyncLayerLockAfterOperationClose();
    }
    if(window.CommonModal && typeof window.CommonModal.close === 'function'){
      window.CommonModal.close();
      setTimeout(cleanup, 280);
      return;
    }

    var modal = document.querySelector('#gnbOperationManageModal');
    if(modal){
      modal.classList.remove('show', 'active', 'open');
      modal.setAttribute('aria-hidden', 'true');
      setTimeout(cleanup, 240);
    }
  }

  window.closeOperationManageModal = closeOperationManageModal;
  window.closedOperationManageModal = closeOperationManageModal;

  document.addEventListener('click', function(event){
    var closeBtn = event.target && event.target.closest && event.target.closest('#gnbOperationManageModal .gnb-management-close, #gnbOperationManageModal [data-du-layer-close], .common-modal-overlay:has(#gnbOperationManageModal) .gnb-management-close');
    if(!closeBtn) return;
    event.preventDefault();
    event.stopPropagation();
    closeOperationManageModal();
  }, true);


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
(function(){
  'use strict';
  if(window.__upickOperationManageDynamicFix17) return;
  window.__upickOperationManageDynamicFix17 = true;

  function isAdminAllowed(){
    var body = document.body;
    if(body && (body.classList.contains('app-role-root') || body.classList.contains('app-role-admin'))) return true;
    var btn = document.getElementById('openGnbOperationManageBtn');
    return !!(btn && btn.hidden !== true && btn.getAttribute('aria-hidden') !== 'true');
  }

  function removeStaleOperationPanels(){
    Array.prototype.slice.call(document.querySelectorAll('#gnbOperationManageModal')).forEach(function(el){
      var inActiveCommonModal = !!(el.closest && el.closest('.common-modal-overlay'));
      if(inActiveCommonModal) return;
      if(el.parentNode) el.parentNode.removeChild(el);
    });
  }

  function makeOperationPanel(){
    var isRoot = document.body && document.body.classList.contains('app-role-root');
    var rootSection = isRoot ? '\
      <section class="gnb-operation-unified-section root-only-panel" id="gnbRootUnifiedSection">\
        <div class="gnb-operation-section-head">\
          <strong>Root 보조 기능</strong>\
          <span>최고 관리자 전용 화면 제어</span>\
        </div>\
        <div class="gnb-root-actions">\
          <button class="gnb-action-btn primary" id="rootOpenAdminBtn" type="button"><span>관리자 열기</span></button>\
          <button class="gnb-action-btn outline" id="rootRefreshStateBtn" type="button"><span>화면 새로고침</span></button>\
        </div>\
      </section>' : '';
    var tpl = document.createElement('template');
    tpl.innerHTML = '\
      <div class="gnb-management-dialog gnb-operation-dialog gnb-operation-dialog--unified" id="gnbOperationManageModal" aria-labelledby="gnbOperationManageTitle">\
        <div class="gnb-management-shell">\
          <div class="gnb-management-head operation">\
            <div>\
              <span class="gnb-management-kicker">관리자 전용</span>\
              <h3 id="gnbOperationManageTitle">운영 관리</h3>\
              <p>공유 흐름, 관리자 페이지, Root 보조 기능을 한곳에서 관리합니다.</p>\
            </div>\
            <button class="gnb-manage-close" type="button" aria-label="운영 관리 닫기">✕</button>\
          </div>\
          <div class="gnb-management-body gnb-operation-unified-body">\
            <section class="gnb-operation-unified-section">\
              <div class="gnb-operation-section-head">\
                <strong>공유 및 관리자</strong>\
                <span>운영 흐름 확인과 관리자 페이지 이동</span>\
              </div>\
              <div class="gnb-operation-action-grid">\
                <div class="gnb-management-action-slot" id="gnbShareActionSlot">\
                  <button class="gnb-menu-item" data-view-link="shareinsights" type="button">공유 인사이트</button>\
                </div>\
                <div class="gnb-management-action-slot" id="gnbAdminActionSlot">\
                  <button class="gnb-menu-item" id="openAdminPageFromGnbBtn" type="button">관리자 페이지</button>\
                </div>\
              </div>\
            </section>' + rootSection + '\
          </div>\
        </div>\
      </div>';
    return tpl.content.firstElementChild;
  }

  function openAdminConsole(){
    if(!isAdminAllowed()){
      if(typeof window.openModalAlert === 'function') window.openModalAlert('관리자 페이지는 관리자 계정에서만 열 수 있습니다.');
      return;
    }
    window.location.replace('/admin');
  }

  function openOperationManage(){
    if(!isAdminAllowed()) return;
    removeStaleOperationPanels();
    var panel = makeOperationPanel();
    panel.querySelector('.gnb-manage-close')?.addEventListener('click', function(){
      closeOperationManageModal();
    });
    panel.querySelector('#openAdminPageFromGnbBtn')?.addEventListener('click', openAdminConsole);
    panel.querySelector('#rootOpenAdminBtn')?.addEventListener('click', openAdminConsole);
    panel.querySelector('#rootRefreshStateBtn')?.addEventListener('click', function(){
      if(!(document.body && document.body.classList.contains('app-role-root'))){
        if(typeof window.openModalAlert === 'function') window.openModalAlert('Root 전용 기능입니다.');
        return;
      }
      if(window.CommonModal && typeof window.CommonModal.close === 'function') window.CommonModal.close();
      setTimeout(function(){ location.replace(location.pathname + location.search + location.hash); }, 80);
    });

    if(window.CommonModal && typeof window.CommonModal.open === 'function'){
      window.CommonModal.open({
        content: panel,
        stageClass: 'common-modal-stage--gnb',
        labelledby: 'gnbOperationManageTitle',
        initialFocusSelector: '.gnb-manage-close, #gnbShareActionSlot button, #gnbAdminActionSlot button'
      });
    }else{
      (window.DuLayer && typeof window.DuLayer.mount === 'function' ? window.DuLayer.mount(panel, 'modal') : (document.getElementById('duLayerRoot') || document.body).appendChild(panel));
      panel.classList.add('du-layer','du-layer--modal','show');
      panel.setAttribute('data-du-layer','modal');
    }
  }

  document.addEventListener('click', function(event){
    var trigger = event.target && event.target.closest && event.target.closest('#openGnbOperationManageBtn');
    if(!trigger) return;
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    openOperationManage();
  }, true);
})();
