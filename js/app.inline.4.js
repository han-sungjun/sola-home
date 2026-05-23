(function(){
  'use strict';

  function removeLegacyViewer(){
    var legacy = document.getElementById('benefitPhotoZoomViewer');
    if(!legacy) return;
    legacy.classList.remove('show');
    legacy.setAttribute('aria-hidden','true');
    legacy.remove();
  }

  function getSliderFromTarget(target){
    return target && target.closest && target.closest('#detailModal .benefit-detail-photo-slider');
  }

  function openUnifiedFromSlider(slider, event){
    if(!slider) return false;
    if(event){
      event.preventDefault();
      event.stopPropagation();
      if(typeof event.stopImmediatePropagation === 'function') event.stopImmediatePropagation();
    }
    removeLegacyViewer();
    var opener = window.__upickOpenBenefitImagePreview;
    if(typeof opener === 'function'){
      var title = (document.querySelector('#detailModal .benefit-detail-main h3') || {}).textContent || '혜택 사진';
      opener(slider, Number(slider.dataset.currentIndex || 0), title.trim() || '혜택 사진');
      window.setTimeout(removeLegacyViewer, 0);
      window.setTimeout(removeLegacyViewer, 80);
      return true;
    }
    return false;
  }

  document.addEventListener('keydown', function(event){
    if(event.key !== 'Enter' && event.key !== ' ') return;
    var slider = getSliderFromTarget(event.target);
    if(!slider) return;
    openUnifiedFromSlider(slider, event);
  }, true);

  document.addEventListener('click', function(event){
    var slider = getSliderFromTarget(event.target);
    if(!slider){
      removeLegacyViewer();
      return;
    }
    if(event.button != null && event.button !== 0) return;
    if(event.target.closest('.benefit-detail-photo-count,.benefit-detail-photo-dots')) return;
    if(slider.dataset.photoDragging === '1' || slider.dataset.photoDragSuppressNextClick === '1') return;
    // 사진/트랙/확대 아이콘 어디를 클릭해도 현재 인덱스 기준으로 확대 팝업을 엽니다.
    openUnifiedFromSlider(slider, event);
  }, true);

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', removeLegacyViewer, {once:true});
  else removeLegacyViewer();

  new MutationObserver(function(){
    var unified = document.querySelector('.benefit-image-preview-overlay.show');
    var legacy = document.getElementById('benefitPhotoZoomViewer');
    if(unified && legacy) removeLegacyViewer();
  }).observe(document.documentElement, {childList:true, subtree:true});
})();
