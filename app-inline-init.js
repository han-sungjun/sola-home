
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
