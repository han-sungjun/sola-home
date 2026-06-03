/* 더운정픽 공통 레이어 어댑터 v20260529-phase4
   기존 팝업을 한 번에 갈아엎지 않고, sheet/modal/fullscreen 규격 속성과 클래스를 부여합니다.
   바깥 영역 클릭 닫힘은 여기서 기본 차단합니다. X/확인/취소 같은 명시 버튼은 그대로 동작합니다.
*/
(function(){
  'use strict';

  var LAYERS = [
    { id:'accountHelpModal', type:'sheet', panel:'.sheet-panel', header:'.sheet-head', body:'.sheet-body', close:'.sheet-close' },
    { id:'appAlert', type:'modal', panel:'.app-alert-card', header:'.app-alert-head', body:'.app-alert-message', close:null },
    { id:'settingsSuiteModal', type:'modal', panel:'.gnb-management-shell', header:'.gnb-management-head', body:'.gnb-management-body', close:'.gnb-management-close' },
    { id:'detailModal', type:'modal', panel:'.upick-div-modal-panel', header:'.modal-head', body:'.modal-body', close:'.close-btn' },
    { id:'noticeModal', type:'modal', panel:'.upick-div-modal-panel', header:'.modal-head', body:'.modal-body', close:'.close-btn' },
    { id:'accountEditModal', type:'modal', panel:'.upick-div-modal-panel', header:'.modal-head', body:'.modal-body', close:'.close-btn' },
    { id:'passwordChangeModal', type:'modal', panel:'.upick-div-modal-panel', header:'.modal-head', body:'.modal-body', close:'.close-btn' },
    { id:'calendarReservationModal', type:'modal', panel:'.upick-div-dialog-panel', header:'.modal-head', body:'.modal-body', close:'.close-btn' },
    { id:'calendarDayModal', type:'modal', panel:null, header:'.calendar-day-modal-head', body:'.calendar-day-modal-body', close:'#calendarDayCloseBtn' },
    { id:'qrModal', type:'modal', panel:null, header:'.modal-head', body:'.modal-body', close:'.close-btn' },
    { id:'communityEditorModal', type:'modal', panel:null, header:'.modal-head', body:'.modal-body', close:'.close-btn' },
    { id:'communityDetailModal', type:'modal', panel:null, header:'.modal-head', body:'.modal-body', close:'.close-btn' },
    { id:'communityReportModal', type:'modal', panel:null, header:'.modal-head', body:'.modal-body', close:'.close-btn' },
    { id:'aiImageZoomBackdrop', type:'fullscreen', panel:'.ai-image-zoom-card', header:'.ai-image-zoom-head,.ai-image-zoom-title', body:'.ai-image-zoom-scroll', close:'.ai-image-zoom-close' }
  ];

  function addClass(el, cls){ if(el && !el.classList.contains(cls)) el.classList.add(cls); }
  function setAttr(el, name, value){ if(el && el.getAttribute(name) !== String(value)) el.setAttribute(name, String(value)); }
  function normalizeType(type){
    if(type === 'bottomSheet' || type === 'bottom-sheet') return 'sheet';
    if(type === 'full' || type === 'fullPopup' || type === 'full-popup') return 'fullscreen';
    return type || 'modal';
  }

  function rootIdFor(type){
    return 'duLayerRoot';
  }

  function ensureRoot(type){
    var root = document.getElementById('duLayerRoot');
    if(!root){
      root = document.createElement('div');
      root.id = 'duLayerRoot';
      root.className = 'du-layer-root';
      document.body.appendChild(root);
    }
    root.setAttribute('data-du-root', 'unified');
    return root;
  }

  function getRoot(type){ return ensureRoot(type || 'modal'); }

  function mount(layer, type){
    if(!layer) return null;
    type = normalizeType(type || layer.getAttribute('data-du-layer') || (layer.classList && layer.classList.contains('du-layer--fullscreen') ? 'fullscreen' : (layer.classList && layer.classList.contains('du-layer--sheet') ? 'sheet' : 'modal')));
    var root = ensureRoot(type);
    if(layer.parentNode !== root) root.appendChild(layer);

    // root1-dynamic-fix10: template에서 꺼낸 레이어도 기존 공통 페이드 시스템을 그대로 탑니다.
    try{
      addClass(layer, 'upick-motion-layer');
      var panel = layer.querySelector('.du-layer__panel,[data-du-layer-panel],.upick-div-modal-panel,.upick-div-dialog-panel,.gnb-management-shell,.sheet-panel,.ai-image-zoom-card,.benefit-image-preview-dialog,.news-image-preview-dialog');
      addClass(panel, 'upick-motion-panel');
    }catch(_){}
    return layer;
  }

  function isLegacyLayer(layer){
    if(!layer || !layer.id) return false;
    return LAYERS.some(function(cfg){ return cfg.id === layer.id; });
  }

  function unmount(layer){
    if(typeof layer === 'string') layer = document.getElementById(layer);
    if(!layer || !layer.parentNode) return false;
    if(layer.dataset && layer.dataset.duDynamic === '1'){
      layer.parentNode.removeChild(layer);
      return true;
    }
    if(!isLegacyLayer(layer)){
      if(layer.closest && layer.closest('.du-layer-root')){
        layer.parentNode.removeChild(layer);
        return true;
      }
      return false;
    }
    var tpl = document.getElementById('duLayerLegacyTemplate');
    if(!tpl || !tpl.content) return false;
    try{ layer.removeAttribute('open'); }catch(_){}
    try{ layer.classList.remove('show','is-open','open','upick-motion-open','upick-motion-dialog','upick-motion-layer','upick-motion-panel'); }catch(_){}
    try{ layer.setAttribute('aria-hidden','true'); }catch(_){}
    tpl.content.appendChild(layer);
    return true;
  }

  function syncRoots(){
    ensureRoot('unified');
    document.querySelectorAll('.du-layer').forEach(function(layer){
      if(layer.closest('.du-layer-root')) return;
      if(layer.id === 'appAlert') return;
      mount(layer);
    });
  }

  function mountLegacyTemplates(){
    /* root1-dynamic-fix2: 기존처럼 모든 템플릿 팝업을 초기 로드 때 Root로 꺼내지 않습니다.
       개별 팝업 DOM은 template 안에 보관하고, 실제로 필요할 때만 ensureLegacyLayer(id)로 Root에 주입합니다. */
    syncRoots();
  }

  function ensureLegacyLayer(id){
    if(!id) return null;
    var exists = document.getElementById(id);
    if(exists) return mount(exists);
    var tpl = document.getElementById('duLayerLegacyTemplate');
    if(!tpl || !tpl.content) return null;
    var found = tpl.content.querySelector('#' + String(id).replace(/([ #;?%&,.+*~\':"!^$[\]()=>|\/])/g,'\\$1'));
    if(!found) return null;
    var mounted = mount(found);
    try{
      var cfg = LAYERS.filter(function(item){ return item.id === id; })[0];
      if(cfg) enhanceLayer(cfg);
    }catch(_){}
    return mounted;
  }

  function toNode(content){
    if(!content) return document.createTextNode('');
    if(content.nodeType) return content;
    var wrap = document.createElement('div');
    wrap.innerHTML = String(content);
    if(wrap.childNodes.length === 1) return wrap.firstChild;
    return wrap;
  }

  function buildLayer(options){
    options = options || {};
    var type = normalizeType(options.type || 'modal');
    var layer = document.createElement('div');
    layer.className = 'du-layer du-layer--' + type + (options.className ? ' ' + options.className : '');
    layer.setAttribute('data-du-layer', type);
    layer.setAttribute('data-du-close-on-backdrop', options.closeOnBackdrop ? 'true' : 'false');
    layer.setAttribute('data-close-on-backdrop', options.closeOnBackdrop ? 'true' : 'false');
    layer.setAttribute('data-du-close-on-esc', options.closeOnEsc ? 'true' : 'false');
    layer.setAttribute('aria-hidden', 'false');
    layer.setAttribute('aria-modal', 'true');
    layer.setAttribute('role', 'dialog');
    if(options.id) layer.id = options.id;

    var backdrop = document.createElement('div');
    backdrop.className = 'du-layer__backdrop';
    backdrop.setAttribute('data-du-layer-backdrop', '');

    var panel = document.createElement('div');
    panel.className = 'du-layer__panel';
    panel.setAttribute('data-du-layer-panel', '');
    panel.setAttribute('role', 'document');

    var header = document.createElement('div');
    header.className = 'du-layer__header';
    header.setAttribute('data-du-layer-header', '');
    var headerMain = document.createElement('div');
    headerMain.className = 'du-layer__header-main';
    if(options.title){
      var title = document.createElement('div');
      title.className = 'du-layer__title';
      title.textContent = options.title;
      headerMain.appendChild(title);
    }
    if(options.subtitle){
      var subtitle = document.createElement('p');
      subtitle.className = 'du-layer__subtitle';
      subtitle.textContent = options.subtitle;
      headerMain.appendChild(subtitle);
    }
    var headerActions = document.createElement('div');
    headerActions.className = 'du-layer__header-actions';
    var close = document.createElement('button');
    close.type = 'button';
    close.className = 'du-layer__close';
    close.setAttribute('data-du-layer-close', '');
    close.setAttribute('aria-label', options.closeLabel || '닫기');
    close.textContent = options.closeText || '✕';
    close.addEventListener('click', function(){ closeLayer(layer); });
    headerActions.appendChild(close);
    header.appendChild(headerMain);
    header.appendChild(headerActions);

    var body = document.createElement('div');
    body.className = 'du-layer__body';
    body.setAttribute('data-du-layer-body', '');
    if(options.body) body.appendChild(toNode(options.body));

    panel.appendChild(header);
    panel.appendChild(body);
    if(options.footer){
      var footer = document.createElement('div');
      footer.className = 'du-layer__footer';
      footer.setAttribute('data-du-layer-footer', '');
      footer.appendChild(toNode(options.footer));
      panel.appendChild(footer);
    }
    layer.appendChild(backdrop);
    layer.appendChild(panel);
    return layer;
  }


  function isLayerOpenForCleanup(layer){
    if(!layer || layer.hidden) return false;
    if(layer.classList && (layer.classList.contains('show') || layer.classList.contains('is-open') || layer.classList.contains('open') || layer.classList.contains('upick-motion-open'))) return true;
    if(layer.hasAttribute && layer.hasAttribute('open')) return true;
    if(layer.getAttribute && layer.getAttribute('aria-hidden') === 'false') return true;
    return false;
  }

  function cleanupInactiveLegacyLayers(){
    var tpl = document.getElementById('duLayerLegacyTemplate');
    if(!tpl || !tpl.content) return;
    LAYERS.forEach(function(cfg){
      var layer = document.getElementById(cfg.id);
      if(!layer || !layer.closest || !layer.closest('.du-layer-root')) return;
      if(layer.dataset && layer.dataset.duDynamic === '1') return;
      if(isLayerOpenForCleanup(layer)) return;
      try{ unmount(layer); }catch(_){ }
    });
    ['#gnbOperationManageModal'].forEach(function(selector){
      document.querySelectorAll(selector).forEach(function(el){
        if(el.closest && el.closest('.common-modal-overlay')) return;
        if(el.parentNode) el.parentNode.removeChild(el);
      });
    });
  }

  function closeLayer(layer){
    if(typeof layer === 'string') layer = document.getElementById(layer);
    if(!layer) return false;
    var panel = layer.querySelector('.du-layer__panel,[data-du-layer-panel],.upick-div-modal-panel,.upick-div-dialog-panel,.gnb-management-shell,.sheet-panel,.ai-image-zoom-card,.benefit-image-preview-dialog,.news-image-preview-dialog');
    function finish(){
      layer.setAttribute('aria-hidden', 'true');
      unmount(layer);
      document.dispatchEvent(new CustomEvent('upick:layer-closed', { detail:{ layer:layer } }));
      cleanupInactiveLegacyLayers();
      if(window.DuLayerStackManager && typeof window.DuLayerStackManager.requestSync === 'function') window.DuLayerStackManager.requestSync();
      if(typeof window.__upickSyncModalScrollLock === 'function') setTimeout(window.__upickSyncModalScrollLock, 0);
    }
    if(window.UpickMotion && typeof window.UpickMotion.close === 'function'){
      window.UpickMotion.close(layer, {
        activeClass:'show',
        panel:panel,
        duration:240,
        ariaHidden:false,
        afterClose:finish
      });
    }else{
      layer.classList.remove('show','is-open','open','upick-motion-open');
      layer.classList.add('upick-motion-closing');
      setTimeout(function(){ layer.classList.remove('upick-motion-closing'); finish(); }, 240);
    }
    return true;
  }

  function openLayer(options){
    var layer = buildLayer(options || {});
    layer.dataset.duDynamic = '1';
    layer.setAttribute('aria-hidden','true');
    mount(layer, options && options.type);
    enhanceLayer({ id:layer.id, type:normalizeType(options && options.type), panel:'.du-layer__panel', header:'.du-layer__header', body:'.du-layer__body', close:'.du-layer__close' });
    var panel = layer.querySelector('.du-layer__panel,[data-du-layer-panel]');
    if(window.UpickMotion && typeof window.UpickMotion.open === 'function'){
      window.UpickMotion.open(layer, { activeClass:'show', panel:panel, duration:240 });
    }else{
      layer.classList.add('show','is-open');
      layer.setAttribute('aria-hidden','false');
    }
    document.dispatchEvent(new CustomEvent('upick:layer-opened', { detail:{ layer:layer, options:options || {} } }));
    if(window.DuLayerStackManager && typeof window.DuLayerStackManager.requestSync === 'function') window.DuLayerStackManager.requestSync();
    return layer;
  }

  function closestLayer(el){ return el && el.closest && el.closest('.du-layer'); }
  function isPanelOrControl(target, layer){
    if(!target || !layer) return false;
    if(target.closest('.du-layer__panel,[data-du-layer-panel],.upick-div-modal-panel,.upick-div-dialog-panel,.gnb-management-shell,.sheet-panel,.gnb-sheet,.gnb-content,.ai-image-zoom-card')) return true;
    if(target.closest('[data-du-layer-close],.close-btn,.gnb-management-close,.sheet-close,.ai-image-zoom-close')) return true;
    return false;
  }

  function enhanceLayer(cfg){
    var layer = document.getElementById(cfg.id);
    if(!layer) return;
    addClass(layer, 'du-layer');
    addClass(layer, 'du-layer--' + cfg.type);
    setAttr(layer, 'data-du-layer', cfg.type);
    setAttr(layer, 'data-close-on-backdrop', 'false');
    setAttr(layer, 'data-du-close-on-backdrop', 'false');
    setAttr(layer, 'data-du-close-on-esc', 'false');
    if(cfg.id === 'communityReportModal'){ addClass(layer, 'du-layer--small-action'); addClass(layer, 'du-layer--report'); setAttr(layer, 'data-du-small-modal', 'report'); }
    if(cfg.id === 'qrModal'){ addClass(layer, 'du-layer--small-action'); addClass(layer, 'du-layer--share'); setAttr(layer, 'data-du-small-modal', 'share'); }
    if(cfg.id === 'appAlert'){ addClass(layer, 'du-layer--small-action'); }

    var panel = cfg.panel ? layer.querySelector(cfg.panel) : null;
    if(!panel){
      panel = layer.querySelector('.upick-div-modal-panel,.upick-div-dialog-panel,.gnb-management-shell,.sheet-panel,.ai-image-zoom-card') || layer.firstElementChild;
    }
    addClass(panel, 'du-layer__panel');
    setAttr(panel, 'data-du-layer-panel', '');

    var backdrop = layer.querySelector('.upick-div-modal-backdrop');
    if(backdrop){
      addClass(backdrop, 'du-layer__backdrop');
      setAttr(backdrop, 'data-du-layer-backdrop', '');
    }

    var header = cfg.header ? layer.querySelector(cfg.header) : null;
    addClass(header, 'du-layer__header');
    if(header) setAttr(header, 'data-du-layer-header', '');

    var body = cfg.body ? layer.querySelector(cfg.body) : null;
    addClass(body, 'du-layer__body');
    if(body) setAttr(body, 'data-du-layer-body', '');

    var close = cfg.close ? layer.querySelector(cfg.close) : null;
    addClass(close, 'du-layer__close');
    if(close) setAttr(close, 'data-du-layer-close', '');

    var footer = layer.querySelector('.du-layer__footer,.calendar-form-actions,.calendar-day-modal-footer,.community-report-actions,.account-edit-actions,.password-change-actions,.qr-modal-footer,.app-alert-actions,.modal-actions,.sheet-actions');
    addClass(footer, 'du-layer__footer');
    if(footer) setAttr(footer, 'data-du-layer-footer', '');

    var pill = layer.querySelector('.pill,.gnb-management-kicker');
    addClass(pill, 'du-layer__badge');
    var title = layer.querySelector('.gnb-management-head h3,.sheet-title,.app-alert-title,.modal-title,.dialog-title');
    addClass(title, 'du-layer__title');
    var subtitle = layer.querySelector('.gnb-management-head p,.sheet-desc,.app-alert-message,.modal-desc,.dialog-desc');
    addClass(subtitle, 'du-layer__subtitle');
  }



  function enhanceOpenLayers(){
    LAYERS.forEach(enhanceLayer);
    document.querySelectorAll('.common-modal-overlay').forEach(function(layer){
      addClass(layer, 'du-layer');
      addClass(layer, 'du-layer--modal');
      setAttr(layer, 'data-du-layer', 'modal');
      setAttr(layer, 'data-du-close-on-backdrop', 'false');
      setAttr(layer, 'data-close-on-backdrop', 'false');
      setAttr(layer, 'data-du-close-on-esc', 'false');
      var stage = layer.querySelector('.common-modal-stage');
      addClass(stage, 'du-layer__panel');
      setAttr(stage, 'data-du-layer-panel', '');
      var header = layer.querySelector('.du-layer__header,.modal-head,.gnb-management-head');
      addClass(header, 'du-layer__header');
      var body = layer.querySelector('.du-layer__body,.modal-body,.gnb-management-body');
      addClass(body, 'du-layer__body');
      var footer = layer.querySelector('.du-layer__footer,.modal-actions,.gnb-management-actions');
      addClass(footer, 'du-layer__footer');
    });
  }



  function openSettingsSuiteSafe(opener){
    var layer = ensureLegacyLayer('settingsSuiteModal');
    if(!layer) return false;
    layer.__duLastOpener = opener || document.activeElement || null;
    layer.hidden = false;
    layer.removeAttribute('hidden');
    try{ layer.showModal && layer.tagName === 'DIALOG' && !layer.open && layer.showModal(); }catch(_){ try{ layer.setAttribute('open',''); }catch(__){} }
    layer.setAttribute('aria-hidden','true');
    layer.classList.add('upick-motion-layer');
    enhanceLayer({ id:'settingsSuiteModal', type:'modal', panel:'.gnb-management-shell', header:'.gnb-management-head', body:'.gnb-management-body', close:'.gnb-management-close' });
    var settingsPanel = layer.querySelector('.gnb-management-shell,.du-layer__panel,[data-du-layer-panel]');
    if(window.UpickMotion && typeof window.UpickMotion.open === 'function'){
      window.UpickMotion.open(layer, { activeClass:'show', panel:settingsPanel, duration:240 });
    }else{
      layer.setAttribute('aria-hidden','false');
      layer.classList.add('show','is-open','upick-motion-open');
    }
    document.dispatchEvent(new CustomEvent('upick:layer-opened', { detail:{ layer:layer, source:'settings-suite' } }));
    if(window.DuLayerStackManager && typeof window.DuLayerStackManager.requestSync === 'function') window.DuLayerStackManager.requestSync();
    setTimeout(function(){
      var body = layer.querySelector('.gnb-management-body');
      if(body) body.scrollTop = 0;
      var close = layer.querySelector('#closeSettingsSuiteBtn,.gnb-management-close');
      try{ (close || layer).focus && (close || layer).focus({ preventScroll:true }); }catch(_){ }
    }, 0);
    return layer;
  }
  function closeSettingsSuiteSafe(){
    var layer = document.getElementById('settingsSuiteModal');
    if(!layer) return false;
    var opener = layer.__duLastOpener;
    var settingsPanel = layer.querySelector('.gnb-management-shell,.du-layer__panel,[data-du-layer-panel]');
    function finishSettingsClose(){
      layer.setAttribute('aria-hidden','true');
      try{ layer.close && layer.open && layer.close(); }catch(_){ try{ layer.removeAttribute('open'); }catch(__){} }
      unmount(layer);
      document.dispatchEvent(new CustomEvent('upick:layer-closed', { detail:{ layer:layer, source:'settings-suite' } }));
      if(window.DuLayerStackManager && typeof window.DuLayerStackManager.requestSync === 'function') window.DuLayerStackManager.requestSync();
      try{ opener && opener.focus && opener.focus({ preventScroll:true }); }catch(_){ }
    }
    if(window.UpickMotion && typeof window.UpickMotion.close === 'function'){
      window.UpickMotion.close(layer, { activeClass:'show', panel:settingsPanel, duration:240, ariaHidden:false, afterClose:finishSettingsClose });
    }else{
      layer.classList.remove('show','is-open','upick-motion-open');
      layer.classList.add('upick-motion-closing');
      setTimeout(function(){ layer.classList.remove('upick-motion-closing'); finishSettingsClose(); }, 240);
    }
    return true;
  }

  function init(){
    mountLegacyTemplates();
    enhanceOpenLayers();
    // 바깥 클릭 닫힘 전면 금지: 패널/버튼 내부 클릭은 절대 막지 않습니다.
    document.addEventListener('click', function(e){
      var layer = closestLayer(e.target);
      if(!layer) return;
      if(isPanelOrControl(e.target, layer)) return;
      if(layer.getAttribute('data-du-close-on-backdrop') === 'false' || layer.getAttribute('data-close-on-backdrop') === 'false'){
        e.preventDefault();
        e.stopPropagation();
      }
    }, true);

    // ESC 닫힘도 기본 금지. 입력 중 ESC 같은 기본 동작 방해를 피하려고 layer가 열려 있을 때만 차단합니다.
    document.addEventListener('keydown', function(e){
      if(e.key !== 'Escape') return;
      var opened = document.querySelector('.du-layer[aria-hidden="false"],.du-layer.show,.du-layer.is-open,.du-layer.open,.du-layer[open]');
      if(!opened) return;
      if(opened.getAttribute('data-du-close-on-esc') === 'false'){
        e.preventDefault();
        e.stopPropagation();
      }
    }, true);

    // 설정 모음은 Root1/template 구조에서 열릴 때만 Root로 올립니다.
    document.addEventListener('click', function(e){
      var openBtn = e.target && e.target.closest && e.target.closest('#openSettingsSuiteBtn,.gnb-summary-settings-btn,[data-open-settings-suite]');
      if(openBtn){
        e.preventDefault();
        e.stopPropagation();
        openSettingsSuiteSafe(openBtn);
        return;
      }
      var closeBtn = e.target && e.target.closest && e.target.closest('#closeSettingsSuiteBtn');
      if(closeBtn){
        e.preventDefault();
        e.stopPropagation();
        closeSettingsSuiteSafe();
      }
    }, true);
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once:true });
  else init();

  window.DuLayer = window.DuLayer || {};
  window.DuLayer.open = openLayer;
  window.DuLayer.openSettingsSuite = openSettingsSuiteSafe;
  window.DuLayer.closeSettingsSuite = closeSettingsSuiteSafe;
  window.DuLayer.close = closeLayer;
  window.DuLayer.getRoot = getRoot;
  window.DuLayer.mount = mount;
  window.DuLayer.syncRoots = syncRoots;
  window.DuLayer.cleanupInactive = cleanupInactiveLegacyLayers;
  window.DuLayer.unmount = unmount;
  window.DuLayer.ensure = ensureLegacyLayer;
  window.DuLayerAdapter = { init:init, enhanceLayer:enhanceLayer, enhanceOpenLayers:enhanceOpenLayers, getRoot:getRoot, mount:mount, syncRoots:syncRoots, cleanupInactive:cleanupInactiveLegacyLayers, unmount:unmount, mountLegacyTemplates:mountLegacyTemplates, ensure:ensureLegacyLayer, open:openLayer, close:closeLayer, openSettingsSuite:openSettingsSuiteSafe, closeSettingsSuite:closeSettingsSuiteSafe, layers:LAYERS.slice() };
  document.addEventListener('upick:layer-opened', enhanceOpenLayers);
  document.addEventListener('upick:alert-opened', enhanceOpenLayers);
})();

/* v20260529-ai-image-close-guard: AI 이미지 확대는 X 버튼에서만 닫히도록 최종 방어 */
(function(){
  'use strict';
  var allowUntil = 0;
  function layer(){ return document.getElementById('aiImageZoomBackdrop'); }
  function isOpen(el){ return !!(el && (el.classList.contains('show') || el.getAttribute('aria-hidden') === 'false')); }
  function markAllow(){ allowUntil = Date.now() + 700; }
  function bind(){
    var el = layer();
    if(!el || el.dataset.duAiCloseGuardFinal === '1') return;
    el.dataset.duAiCloseGuardFinal = '1';
    var close = document.getElementById('aiImageZoomCloseBtn') || el.querySelector('.ai-image-zoom-close');
    if(close){
      ['pointerdown','mousedown','touchstart','click','keydown'].forEach(function(name){
        close.addEventListener(name, function(ev){
          if(name === 'keydown' && ev.key !== 'Enter' && ev.key !== ' ') return;
          markAllow();
        }, true);
      });
    }
    ['pointerdown','pointerup','mousedown','mouseup','touchstart','touchend','click'].forEach(function(name){
      document.addEventListener(name, function(ev){
        var current = layer();
        if(!isOpen(current)) return;
        if(!ev.target || !current.contains(ev.target)) return;
        if(ev.target.closest && ev.target.closest('.ai-image-zoom-card,.ai-image-zoom-close,[data-du-layer-close]')) return;
        ev.preventDefault();
        ev.stopPropagation();
        if(typeof ev.stopImmediatePropagation === 'function') ev.stopImmediatePropagation();
        return false;
      }, true);
    });
  }
  function patchClose(){
    if(typeof window.closeAiImageZoom !== 'function' || window.closeAiImageZoom.__duGuarded) return;
    var original = window.closeAiImageZoom;
    var guarded = function(){
      var el = layer();
      var activeEvent = window.event;
      var byClose = activeEvent && activeEvent.target && activeEvent.target.closest && activeEvent.target.closest('#aiImageZoomCloseBtn,.ai-image-zoom-close,[data-du-layer-close]');
      if(isOpen(el) && !byClose && Date.now() > allowUntil){
        return false;
      }
      return original.apply(this, arguments);
    };
    guarded.__duGuarded = true;
    window.closeAiImageZoom = guarded;
  }
  function init(){ bind(); patchClose(); setTimeout(patchClose, 0); setTimeout(patchClose, 300); }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, {once:true});
  else init();
  window.addEventListener('load', init, {once:true});
})();


/* v20260529-phase8-stack-manager: du-layer 중첩 팝업 스크롤 락 안정화 */
(function(){
  'use strict';
  if(window.DuLayerStackManager && window.DuLayerStackManager.__phase8) return;

  var OPEN_SELECTORS = [
    '.du-layer.show', '.du-layer[open]', '.du-layer[aria-hidden="false"]',
    '.upick-div-modal.show', '.upick-div-modal[open]', '.upick-div-modal[aria-hidden="false"]',
    '.upick-div-dialog.show', '.upick-div-dialog[open]', '.upick-div-dialog[aria-hidden="false"]',
    '.common-modal-overlay.show', '.common-modal-overlay.is-open', '.common-modal-overlay[open]',
    '#settingsSuiteModal.show', '#settingsSuiteModal[open]',
    '#detailModal[open]', '#noticeModal[open]', '#calendarDayModal[open]', '#calendarReservationModal[open]',
    '#qrModal[open]', '#accountEditModal[open]', '#passwordChangeModal[open]',
    '.sheet-modal.show', '.sheet-modal.is-open', '.account-recovery-sheet.show', '.account-recovery-sheet.is-open',
    '.app-alert.show'
  ];

  function isRealOpen(el){
    if(!el || el.hidden) return false;
    if(el.getAttribute('aria-hidden') === 'true') return false;
    if(el.classList && (el.classList.contains('is-closing') || el.classList.contains('upick-motion-closing'))) return false;
    var style = window.getComputedStyle ? window.getComputedStyle(el) : null;
    if(style && (style.display === 'none' || style.visibility === 'hidden' || Number(style.opacity) === 0 && !el.classList.contains('show'))) return false;
    return !!(el.offsetWidth || el.offsetHeight || (el.getClientRects && el.getClientRects().length));
  }

  function getOpenLayers(){
    var found = [];
    OPEN_SELECTORS.forEach(function(selector){
      document.querySelectorAll(selector).forEach(function(el){
        if(found.indexOf(el) < 0 && isRealOpen(el)) found.push(el);
      });
    });
    return found;
  }

  function hasOpenLayer(){ return getOpenLayers().length > 0; }

  function sync(){
    var active = hasOpenLayer();
    document.documentElement.classList.toggle('upick-layer-scroll-lock', active);
    document.body.classList.toggle('upick-layer-scroll-lock', active);
    if(window.__upickHardScrollFreeze && typeof window.__upickHardScrollFreeze.sync === 'function'){
      window.__upickHardScrollFreeze.sync('layer', active);
    }
  }

  var scheduled = false;
  function requestSync(){
    if(scheduled) return;
    scheduled = true;
    requestAnimationFrame(function(){ scheduled = false; sync(); });
  }

  window.DuLayerStackManager = {
    __phase8:true,
    sync:sync,
    requestSync:requestSync,
    getOpenLayers:getOpenLayers,
    hasOpenLayer:hasOpenLayer,
    forceUnlock:function(){
      document.documentElement.classList.remove('upick-layer-scroll-lock');
      document.body.classList.remove('upick-layer-scroll-lock');
      if(window.__upickHardScrollFreeze && typeof window.__upickHardScrollFreeze.forceUnlock === 'function'){
        window.__upickHardScrollFreeze.forceUnlock();
      }
    }
  };

  window.__upickSyncModalScrollLock = requestSync;

  ['click','pointerdown','transitionend','animationend','keyup','close','toggle'].forEach(function(type){
    document.addEventListener(type, requestSync, true);
  });
  document.addEventListener('upick:layer-opened', requestSync, true);
  document.addEventListener('upick:layer-closed', requestSync, true);
  document.addEventListener('upick:alert-opened', requestSync, true);

  if(window.MutationObserver){
    var observeOne = function(el){
      if(!el || el.__duPhase8Observed) return;
      el.__duPhase8Observed = '1';
      new MutationObserver(requestSync).observe(el, { attributes:true, attributeFilter:['class','open','aria-hidden','style','hidden'] });
    };
    var bind = function(){
      document.querySelectorAll(OPEN_SELECTORS.join(',')).forEach(observeOne);
    };
    bind();
    new MutationObserver(bind).observe(document.body || document.documentElement, { childList:true, subtree:true });
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', requestSync, {once:true});
  else requestSync();
})();
