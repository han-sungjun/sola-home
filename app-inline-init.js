
(function(){
  'use strict';
  var active = false;
  var sx = 0;
  var sy = 0;
  var moved = false;
  var suppressNextClick = false;
  function point(e){
    var s = (e.touches && e.touches[0]) || (e.changedTouches && e.changedTouches[0]) || e;
    return { x: Number(s.clientX || 0), y: Number(s.clientY || 0) };
  }
  function isSliderTarget(target){
    return !!(target && target.closest && target.closest('#detailModal .benefit-detail-photo-slider'));
  }
  function down(e){
    if(e.button != null && e.button !== 0) return;
    if(!isSliderTarget(e.target)) return;
    var p = point(e);
    active = true;
    moved = false;
    sx = p.x;
    sy = p.y;
  }
  function move(e){
    if(!active) return;
    var p = point(e);
    var dx = p.x - sx;
    var dy = p.y - sy;
    if(Math.abs(dx) > 6 || Math.abs(dy) > 6){
      moved = true;
    }
    if(Math.abs(dx) > 14 && Math.abs(dx) > Math.abs(dy) * 1.15){
      suppressNextClick = true;
      window.__upickBenefitPhotoSuppressNextClick = true;
    }
  }
  function up(e){
    if(!active) return;
    active = false;
    var p = point(e);
    var dx = p.x - sx;
    var dy = p.y - sy;
    if(Math.abs(dx) > 14 && Math.abs(dx) > Math.abs(dy) * 1.15){
      suppressNextClick = true;
      window.__upickBenefitPhotoSuppressNextClick = true;
    }
    setTimeout(function(){ moved = false; }, 0);
  }
  function block(e){
    if(!isSliderTarget(e.target)) return;
    if(!suppressNextClick && window.__upickBenefitPhotoSuppressNextClick !== true) return;
    suppressNextClick = false;
    window.__upickBenefitPhotoSuppressNextClick = false;
    e.preventDefault();
    e.stopPropagation();
    if(typeof e.stopImmediatePropagation === 'function') e.stopImmediatePropagation();
    return false;
  }
  document.addEventListener('pointerdown', down, true);
  document.addEventListener('pointermove', move, true);
  document.addEventListener('pointerup', up, true);
  document.addEventListener('pointercancel', up, true);
  document.addEventListener('click', block, true);
})();

/* ===== v20260610-bottom-nav-body-lock-v1 =====
   하단 네비바를 화면 기준이 아니라 실제 body > .app 쉘의 좌표/폭에 고정합니다.
   DevTools 열기/닫기, 스크롤바 생성, 브라우저 리사이즈 때도 본문 폭과 동일하게 맞춥니다. */
(function(){
  'use strict';
  var rafId = 0;
  var last = { left: '', width: '' };

  function getShell(){
    return document.querySelector('body > .app') || document.querySelector('.app') || document.body;
  }
  function getNavs(){
    return Array.prototype.slice.call(document.querySelectorAll('.bottom-nav, nav.bottom-nav, .mobile-bottom-nav, #bottomNav'));
  }
  function px(value){
    return Math.round(Number(value || 0) * 100) / 100 + 'px';
  }
  function apply(){
    rafId = 0;
    var shell = getShell();
    var navs = getNavs();
    if(!shell || !navs.length) return;

    var rect = shell.getBoundingClientRect();
    if(!rect || rect.width <= 0) return;

    var left = px(rect.left);
    var width = px(rect.width);
    if(left === last.left && width === last.width) return;
    last.left = left;
    last.width = width;

    navs.forEach(function(nav){
      if(!nav) return;
      nav.style.setProperty('position', 'fixed', 'important');
      nav.style.setProperty('left', left, 'important');
      nav.style.setProperty('right', 'auto', 'important');
      nav.style.setProperty('width', width, 'important');
      nav.style.setProperty('max-width', width, 'important');
      nav.style.setProperty('margin-left', '0', 'important');
      nav.style.setProperty('margin-right', '0', 'important');
      nav.style.setProperty('transform', 'none', 'important');
      nav.style.setProperty('box-sizing', 'border-box', 'important');
    });
  }
  function schedule(){
    if(rafId) return;
    rafId = requestAnimationFrame(apply);
  }
  function init(){
    schedule();
    setTimeout(schedule, 60);
    setTimeout(schedule, 250);
    window.addEventListener('resize', schedule, { passive:true });
    window.addEventListener('orientationchange', function(){ setTimeout(schedule, 120); }, { passive:true });
    window.addEventListener('load', schedule, { once:true });
    if(window.visualViewport){
      window.visualViewport.addEventListener('resize', schedule, { passive:true });
      window.visualViewport.addEventListener('scroll', schedule, { passive:true });
    }
    if(window.ResizeObserver){
      try{
        var ro = new ResizeObserver(schedule);
        ro.observe(getShell());
        window.__upickBottomNavBodyLockResizeObserver = ro;
      }catch(_){ }
    }
    if(window.MutationObserver){
      try{
        var mo = new MutationObserver(schedule);
        mo.observe(document.body, { childList:true, subtree:true, attributes:true, attributeFilter:['class','style'] });
        window.__upickBottomNavBodyLockMutationObserver = mo;
      }catch(_){ }
    }
  }
  window.__upickSyncBottomNavToBodyShell = schedule;
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once:true });
  else init();
})();

/* ===== v20260610-top-filter-body-lock-v2-safe =====
   혜택 상단 검색/필터 고정바가 fixed 상태일 때만 실제 body > .app 쉘 좌표/폭을 따라가게 합니다.
   일반 sticky/문서 흐름 상태는 건드리지 않아 배포 깨짐을 방지합니다. */
(function(){
  'use strict';
  var rafId = 0;

  function shell(){
    return document.querySelector('body > .app') || document.querySelector('.app') || document.body;
  }
  function filter(){
    return document.querySelector('#view-benefits .filter-sticky');
  }
  function px(value){
    return Math.round(Number(value || 0) * 100) / 100 + 'px';
  }
  function clearFixedInline(el){
    if(!el) return;
    el.style.removeProperty('left');
    el.style.removeProperty('right');
    el.style.removeProperty('width');
    el.style.removeProperty('max-width');
    el.style.removeProperty('transform');
    el.style.removeProperty('box-sizing');
  }
  function apply(){
    rafId = 0;
    var el = filter();
    if(!el) return;
    if(!el.classList.contains('is-fixed')){
      clearFixedInline(el);
      return;
    }
    var root = shell();
    var rect = root && root.getBoundingClientRect ? root.getBoundingClientRect() : null;
    if(!rect || rect.width <= 0) return;
    var left = px(rect.left);
    var width = px(rect.width);
    el.style.setProperty('left', left, 'important');
    el.style.setProperty('right', 'auto', 'important');
    el.style.setProperty('width', width, 'important');
    el.style.setProperty('max-width', width, 'important');
    el.style.setProperty('transform', 'none', 'important');
    el.style.setProperty('box-sizing', 'border-box', 'important');
  }
  function schedule(){
    if(rafId) return;
    rafId = requestAnimationFrame(apply);
  }
  function init(){
    schedule();
    setTimeout(schedule, 80);
    setTimeout(schedule, 260);
    window.addEventListener('scroll', schedule, { passive:true });
    window.addEventListener('resize', schedule, { passive:true });
    window.addEventListener('orientationchange', function(){ setTimeout(schedule, 120); }, { passive:true });
    if(window.visualViewport){
      window.visualViewport.addEventListener('resize', schedule, { passive:true });
      window.visualViewport.addEventListener('scroll', schedule, { passive:true });
    }
    if(window.MutationObserver){
      try{
        var target = filter() || document.body;
        var mo = new MutationObserver(schedule);
        mo.observe(target, { attributes:true, attributeFilter:['class','style'] });
        window.__upickTopFilterBodyLockMutationObserver = mo;
      }catch(_){ }
    }
  }
  window.__upickSyncTopFilterToBodyShell = schedule;
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once:true });
  else init();
})();
