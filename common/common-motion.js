/* 더운정픽 공통 모션 매니저 v20260526-common-motion
   모든 UI 레이어의 fade-in/out을 한 lifecycle로 통일합니다. */
(function(){
  'use strict';
  if(window.UpickMotion) return;

  var stateMap = new WeakMap();
  var DEFAULT_DURATION = 240;

  function raf2(fn){
    requestAnimationFrame(function(){ requestAnimationFrame(fn); });
  }

  function getState(el){
    var state = stateMap.get(el);
    if(!state){ state = {}; stateMap.set(el, state); }
    return state;
  }

  function normalize(options){
    options = options || {};
    return {
      activeClass: options.activeClass || 'show',
      closingClass: options.closingClass || 'is-closing',
      motionOpenClass: options.motionOpenClass || 'upick-motion-open',
      layerClass: options.layerClass || 'upick-motion-layer',
      panelClass: options.panelClass || 'upick-motion-panel',
      panel: options.panel || null,
      duration: Number.isFinite(options.duration) ? options.duration : DEFAULT_DURATION,
      ariaHidden: options.ariaHidden !== false,
      beforeOpen: options.beforeOpen,
      afterOpen: options.afterOpen,
      beforeClose: options.beforeClose,
      afterClose: options.afterClose
    };
  }

  function open(el, options){
    if(!el) return Promise.resolve(false);
    var opts = normalize(options);
    var state = getState(el);
    if(state.timer){ clearTimeout(state.timer); state.timer = null; }
    state.closing = false;
    state.open = true;

    if(typeof opts.beforeOpen === 'function') opts.beforeOpen(el);
    el.classList.add(opts.layerClass);
    if(opts.panel) opts.panel.classList.add(opts.panelClass);
    el.classList.remove(opts.closingClass, 'upick-motion-closing', opts.activeClass, opts.motionOpenClass);
    if(opts.panel) opts.panel.classList.remove(opts.closingClass, 'upick-motion-closing', opts.activeClass, opts.motionOpenClass);
    if(opts.ariaHidden) el.setAttribute('aria-hidden','false');

    // 최초 1회도 초기 opacity/transform 상태가 페인트된 뒤 open 상태로 전환되도록 강제합니다.
    try{ void el.offsetHeight; }catch(_){ }
    raf2(function(){
      if(!stateMap.has(el)) return;
      var latest = getState(el);
      if(latest.closing) return;
      el.classList.add(opts.activeClass, opts.motionOpenClass);
      el.classList.remove(opts.closingClass, 'upick-motion-closing');
      if(opts.panel){
        opts.panel.classList.add(opts.motionOpenClass);
        opts.panel.classList.remove(opts.closingClass, 'upick-motion-closing');
      }
      if(typeof opts.afterOpen === 'function') opts.afterOpen(el);
    });
    return Promise.resolve(true);
  }

  function close(el, options){
    if(!el) return Promise.resolve(false);
    var opts = normalize(options);
    var state = getState(el);
    if(state.closing) return state.promise || Promise.resolve(false);
    state.closing = true;
    state.open = false;

    if(state.timer){ clearTimeout(state.timer); state.timer = null; }
    if(typeof opts.beforeClose === 'function') opts.beforeClose(el);
    el.classList.add(opts.closingClass, 'upick-motion-closing');
    el.classList.remove(opts.activeClass, opts.motionOpenClass);
    if(opts.panel){
      opts.panel.classList.add(opts.closingClass, 'upick-motion-closing');
      opts.panel.classList.remove(opts.motionOpenClass, opts.activeClass);
    }
    if(opts.ariaHidden) el.setAttribute('aria-hidden','true');

    state.promise = new Promise(function(resolve){
      state.timer = setTimeout(function(){
        state.timer = null;
        state.closing = false;
        el.classList.remove(opts.closingClass, 'upick-motion-closing');
        if(opts.panel) opts.panel.classList.remove(opts.closingClass, 'upick-motion-closing');
        if(typeof opts.afterClose === 'function') opts.afterClose(el);
        resolve(true);
      }, opts.duration);
    });
    return state.promise;
  }

  function isClosing(el){ return !!(el && stateMap.get(el) && stateMap.get(el).closing); }

  window.UpickMotion = {
    open: open,
    close: close,
    isClosing: isClosing,
    duration: DEFAULT_DURATION
  };
})();
