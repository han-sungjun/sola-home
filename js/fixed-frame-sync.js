(function(){
  'use strict';

  var raf = 0;

  function getFrame(){
    return document.querySelector('.app') || document.querySelector('.shell') || document.body;
  }

  function isVisible(el){
    if(!el) return false;
    var style = window.getComputedStyle(el);
    if(style.display === 'none' || style.visibility === 'hidden') return false;
    var rect = el.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0;
  }

  function getBottomFrame(){
    /* 혜택 화면에서는 사용자가 눈으로 맞춰 보는 기준이 상단 고정 필터바입니다.
       하단 네비도 동일한 rect를 쓰게 해서 PC 스크롤바/F12 환경에서 좌우 틀어짐을 막습니다. */
    var activeBenefitView = document.querySelector('#view-benefits:not(.hidden)');
    var benefitFilter = activeBenefitView && activeBenefitView.querySelector('.filter-sticky');
    if(isVisible(benefitFilter)) return benefitFilter;
    return document.querySelector('.shell') || getFrame();
  }

  function applyRectVars(prefix, el){
    if(!el) return;
    var rect = el.getBoundingClientRect();
    var width = Math.max(0, Math.round(rect.width * 100) / 100);
    var left = Math.round(rect.left * 100) / 100;
    document.documentElement.style.setProperty(prefix + '-left', left + 'px');
    document.documentElement.style.setProperty(prefix + '-width', width + 'px');
  }

  function syncFixedFrame(){
    raf = 0;
    var frame = getFrame();
    if(!frame) return;

    applyRectVars('--app-fixed', frame);
    applyRectVars('--bottom-nav-fixed', getBottomFrame());
  }

  function requestSync(){
    if(raf) return;
    raf = window.requestAnimationFrame(syncFixedFrame);
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', requestSync, { once:true });
  }else{
    requestSync();
  }

  window.addEventListener('load', requestSync, { passive:true });
  window.addEventListener('resize', requestSync, { passive:true });
  window.addEventListener('orientationchange', requestSync, { passive:true });
  window.addEventListener('scroll', requestSync, { passive:true });

  if(window.visualViewport){
    window.visualViewport.addEventListener('resize', requestSync, { passive:true });
    window.visualViewport.addEventListener('scroll', requestSync, { passive:true });
  }

  if(window.ResizeObserver){
    var observer = new ResizeObserver(requestSync);
    if(document.readyState === 'loading'){
      document.addEventListener('DOMContentLoaded', function(){
        var frame = getFrame();
        if(frame) observer.observe(frame);
      }, { once:true });
    }else{
      var frame = getFrame();
      if(frame) observer.observe(frame);
    }
  }

  window.__upickSyncFixedFrame = requestSync;
})();
