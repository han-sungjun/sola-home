(function(){
        'use strict';
        function qs(sel, root){ return (root || document).querySelector(sel); }
        function qsa(sel, root){ return Array.from((root || document).querySelectorAll(sel)); }
        function closestSection(sel){ var el = qs(sel); return el && el.closest('.gnb-settings-section'); }
        function makeEl(html){ var t=document.createElement('template'); t.innerHTML=html.trim(); return t.content.firstElementChild; }
        function modalStash(){ var el=qs('#gnbCommonModalStash'); if(!el){ el=document.createElement('div'); el.id='gnbCommonModalStash'; el.className='common-modal-stash'; document.body.appendChild(el); } return el; }
        function activateTab(scope, name){
          qsa('[data-manage-tab]', scope).forEach(function(btn){
            var on = btn.dataset.manageTab === name;
            btn.classList.toggle('active', on);
            btn.setAttribute('aria-selected', on ? 'true' : 'false');
          });
          qsa('[data-manage-panel]', scope).forEach(function(panel){
            var on = panel.dataset.managePanel === name;
            panel.classList.toggle('active', on);
            panel.hidden = !on;
          });
        }
        function openManageModal(panel, firstTab, focusSelector){
          if(!panel) return;
          activateTab(panel, firstTab || 'notice');
          if(window.CommonModal && typeof window.CommonModal.open === 'function'){
            window.CommonModal.open({
              content: panel,
              stageClass: 'common-modal-stage--gnb',
              labelledby: panel.getAttribute('aria-labelledby') || '',
              initialFocusSelector: focusSelector || '[data-manage-tab].active, .gnb-manage-close'
            });
          }else{
            document.body.appendChild(panel);
          }
        }
        function closeManageModal(){
          if(window.CommonModal && typeof window.CommonModal.close === 'function') window.CommonModal.close();
        }
        function initAccountManageModal(){
          var summary = qs('#gnbSettingsAccountSummary');
          var header = summary && qs('.gnb-settings-section-header', summary);
          var pill = qs('#gnbPushStatusPill');
          if(!summary || !header || qs('#openGnbAccountManageBtn')) return;

          var actions = makeEl('<div class="gnb-summary-actions"></div>');
          if(pill) actions.appendChild(pill);
          var openBtn = makeEl('<button class="gnb-manage-open-btn" id="openGnbAccountManageBtn" type="button"><img alt="" class="upick-inline-icon" loading="lazy" src="/icons/internal/shield-check.svg"><span>계정 관리</span></button>');
          actions.appendChild(openBtn);
          header.appendChild(actions);

          var modalPanel = makeEl('\
            <div class="gnb-management-dialog" id="gnbAccountManageModal" aria-labelledby="gnbAccountManageTitle">\
              <div class="gnb-management-shell">\
                <div class="gnb-management-head">\
                  <div>\
                    <span class="gnb-management-kicker">설정 모음</span>\
                    <h3 id="gnbAccountManageTitle">계정 관리</h3>\
                    <p>알림, 계정, 보안 설정을 한곳에서 관리할 수 있습니다.</p>\
                  </div>\
                  <button class="gnb-manage-close" type="button" aria-label="계정 관리 닫기">✕</button>\
                </div>\
                <div class="gnb-management-tabs" role="tablist" aria-label="계정 관리 탭">\
                  <button data-manage-tab="notice" class="active" type="button" role="tab" aria-selected="true">알림</button>\
                  <button data-manage-tab="account" type="button" role="tab" aria-selected="false">계정</button>\
                  <button data-manage-tab="security" type="button" role="tab" aria-selected="false">보안</button>\
                  <button data-manage-tab="delete" type="button" role="tab" aria-selected="false">삭제</button>\
                </div>\
                <div class="gnb-management-body">\
                  <section data-manage-panel="notice" class="gnb-management-panel active"></section>\
                  <section data-manage-panel="account" class="gnb-management-panel" hidden></section>\
                  <section data-manage-panel="security" class="gnb-management-panel" hidden></section>\
                  <section data-manage-panel="delete" class="gnb-management-panel" hidden></section>\
                </div>\
              </div>\
            </div>');

          modalStash().appendChild(modalPanel);

          var noticeSection = closestSection('#gnbEnablePushBtn');
          var accountSection = closestSection('#openAccountEditBtn');
          var deleteSection = closestSection('#withdrawBtn');
          if(noticeSection) qs('[data-manage-panel="notice"]', modalPanel).appendChild(noticeSection);
          if(accountSection){
            var securityPanel = qs('[data-manage-panel="security"]', modalPanel);
            var accountPanel = qs('[data-manage-panel="account"]', modalPanel);
            accountPanel.appendChild(accountSection);
            var pw = qs('#openPasswordChangeBtn');
            var logout = qs('#logoutBtn');
            if(securityPanel && (pw || logout)){
              var sec = makeEl('<div class="gnb-settings-section gnb-management-cloned-section"><div class="gnb-settings-section-header"><div><h4 class="gnb-settings-section-title">보안 및 입장 상태</h4><p class="gnb-settings-section-desc">비밀번호 변경과 현재 공간 나가기를 이곳에서 관리합니다.</p></div></div><div class="gnb-action-grid" style="margin-top:12px;"></div></div>');
              var grid = qs('.gnb-action-grid', sec);
              if(pw) grid.appendChild(pw);
              if(logout) grid.appendChild(logout);
              securityPanel.appendChild(sec);
            }
          }
          if(deleteSection) qs('[data-manage-panel="delete"]', modalPanel).appendChild(deleteSection);

          qsa('[data-manage-tab]', modalPanel).forEach(function(btn){ btn.addEventListener('click', function(){ activateTab(modalPanel, btn.dataset.manageTab); }); });
          qs('.gnb-manage-close', modalPanel).addEventListener('click', closeManageModal);
          openBtn.addEventListener('click', function(){ openManageModal(modalPanel, 'notice'); });
        }
        function initOperationManageModal(){
          var admin = qs('.gnb-admin-premium');
          var openBtn = qs('#openGnbOperationManageBtn');
          if(!admin || !openBtn || qs('#gnbOperationManageModal')) return;
          var oldActions = qs('.gnb-admin-actions', admin);
          var shareBtn = qs('[data-view-link="shareinsights"]', oldActions || admin);
          var adminBtn = qs('#openAdminPageFromGnbBtn');
          var rootPanel = qs('.gnb-root-panel', admin);
          if(oldActions && oldActions.parentElement) oldActions.remove();
          if(rootPanel && rootPanel.parentElement) rootPanel.remove();

          var modalPanel = makeEl('\
            <div class="gnb-management-dialog gnb-operation-dialog" id="gnbOperationManageModal" aria-labelledby="gnbOperationManageTitle">\
              <div class="gnb-management-shell">\
                <div class="gnb-management-head operation">\
                  <div>\
                    <span class="gnb-management-kicker">관리자 전용</span>\
                    <h3 id="gnbOperationManageTitle">운영 관리</h3>\
                    <p>공유 흐름, 관리자 페이지, Root 보조 기능을 탭으로 관리합니다.</p>\
                  </div>\
                  <button class="gnb-manage-close" type="button" aria-label="운영 관리 닫기">✕</button>\
                </div>\
                <div class="gnb-management-tabs" role="tablist" aria-label="운영 관리 탭">\
                  <button data-manage-tab="share" class="active" type="button" role="tab" aria-selected="true">공유</button>\
                  <button data-manage-tab="admin" type="button" role="tab" aria-selected="false">관리자</button>\
                  <button data-manage-tab="root" class="root-only-panel" type="button" role="tab" aria-selected="false">Root</button>\
                </div>\
                <div class="gnb-management-body">\
                  <section data-manage-panel="share" class="gnb-management-panel active"><div class="gnb-management-action-slot" id="gnbShareActionSlot"></div></section>\
                  <section data-manage-panel="admin" class="gnb-management-panel" hidden><div class="gnb-management-action-slot" id="gnbAdminActionSlot"></div></section>\
                  <section data-manage-panel="root" class="gnb-management-panel" hidden><div id="gnbRootActionSlot"></div></section>\
                </div>\
              </div>\
            </div>');
          modalStash().appendChild(modalPanel);
          if(shareBtn) qs('#gnbShareActionSlot', modalPanel).appendChild(shareBtn);
          if(adminBtn) qs('#gnbAdminActionSlot', modalPanel).appendChild(adminBtn);
          if(rootPanel) qs('#gnbRootActionSlot', modalPanel).appendChild(rootPanel);
          qsa('[data-manage-tab]', modalPanel).forEach(function(btn){ btn.addEventListener('click', function(){ activateTab(modalPanel, btn.dataset.manageTab); }); });
          qs('.gnb-manage-close', modalPanel).addEventListener('click', closeManageModal);
          openBtn.addEventListener('click', function(){ openManageModal(modalPanel, 'share'); });
        }
        function init(){ initAccountManageModal(); initOperationManageModal(); }
        if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, {once:true});
        else init();
      })();