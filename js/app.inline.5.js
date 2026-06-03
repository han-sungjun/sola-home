
(function(){
  'use strict';
  // 대표사진 단일 확대 팝업은 상세 이미지 슬라이드 팝업으로 통합되었습니다.
  // 기존 포커스 복귀 로직은 중복 팝업을 만들 수 있어 비활성화합니다.
})();

/* v20260531 root1: 혜택 상세 이미지 확대 팝업 다중 사진 표시 안정화
   - 기존 track translate 방식은 Root 이동/CSS 누적 상태에서 2번째 사진이 빈 화면처럼 보일 수 있어
     확대 팝업 내부는 현재 사진 1장만 실제 img에 렌더링하고, 스와이프 시 src를 교체합니다.
   - 상세 상단 썸네일 슬라이더는 기존처럼 동기화합니다. */
(function(){
  'use strict';

  function esc(value){
    return String(value == null ? '' : value).replace(/[&<>"]/g, function(ch){
      return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[ch]);
    });
  }

  function readImages(slider){
    var images = [];
    try{ images = JSON.parse((slider && slider.dataset && slider.dataset.benefitPhotoImages) || '[]'); }catch(_){ images = []; }
    if(!Array.isArray(images)) images = [];
    images = images.map(function(v){ return String(v || '').trim(); }).filter(Boolean);
    if(!images.length && slider){
      slider.querySelectorAll('.benefit-detail-photo-slide img').forEach(function(img){
        var src = img.currentSrc || img.src || img.getAttribute('src') || '';
        if(src && images.indexOf(src) < 0) images.push(src);
      });
    }
    return images;
  }

  function syncDetailSlider(slider, index, animate){
    if(!slider) return;
    var slides = Array.prototype.slice.call(slider.querySelectorAll('.benefit-detail-photo-slide'));
    if(!slides.length) return;
    var max = slides.length;
    var safeIndex = ((Number(index) || 0) + max) % max;
    var track = slider.querySelector('.benefit-detail-photo-track');
    if(track){
      track.style.transition = animate === false ? 'none' : '';
      track.style.transform = 'translate3d(' + (-safeIndex * 100) + '%,0,0)';
    }
    slides.forEach(function(slide, i){
      var active = i === safeIndex;
      slide.classList.toggle('active', active);
      slide.setAttribute('aria-current', active ? 'true' : 'false');
    });
    slider.querySelectorAll('.benefit-detail-photo-dots span').forEach(function(dot, i){
      dot.classList.toggle('active', i === safeIndex);
    });
    var count = slider.querySelector('.benefit-detail-photo-count');
    if(count) count.textContent = (safeIndex + 1) + '/' + max;
    slider.dataset.currentIndex = String(safeIndex);
  }

  function fitOverlay(overlay){
    var dialog = overlay && overlay.querySelector('.benefit-image-preview-dialog');
    var body = overlay && overlay.querySelector('.benefit-image-preview-body');
    if(!dialog || !body) return;
    var vw = Math.max(320, window.innerWidth || document.documentElement.clientWidth || 0);
    var vh = Math.max(320, window.innerHeight || document.documentElement.clientHeight || 0);
    var mobile = vw <= 560;
    var pad = mobile ? 24 : 48;
    var head = mobile ? 54 : 58;
    var topLine = 4;
    var width = Math.round(Math.min(920, vw - pad));
    var dialogH = Math.round(Math.min(vh - pad, mobile ? vh - 24 : vh * 0.92));
    var bodyH = Math.max(260, dialogH - head - topLine);
    dialog.style.setProperty('--benefit-preview-w', width + 'px');
    dialog.style.setProperty('--benefit-preview-dialog-h', dialogH + 'px');
    dialog.style.setProperty('--benefit-preview-body-h', bodyH + 'px');
  }

  function removeOverlay(overlay){
    if(!overlay || overlay.dataset.closing === '1') return;
    overlay.dataset.closing = '1';
    overlay.classList.add('closing');
    overlay.classList.remove('show');
    overlay.setAttribute('aria-hidden','true');
    window.setTimeout(function(){
      try{ overlay.remove(); }catch(_){ }
      document.body.classList.remove('benefit-image-preview-open');
      if(typeof window.__upickSyncModalScrollLock === 'function') window.__upickSyncModalScrollLock();
      if(window.DuLayerStackManager && typeof window.DuLayerStackManager.requestSync === 'function') window.DuLayerStackManager.requestSync();
    }, 260);
  }

  function openStableBenefitImagePreview(slider, startIndex, title){
    var images = readImages(slider);
    if(!images.length) return;
    var index = Math.max(0, Math.min(images.length - 1, Number(startIndex) || Number(slider && slider.dataset && slider.dataset.currentIndex) || 0));
    var old = document.querySelector('.benefit-image-preview-overlay');
    if(old) old.remove();

    var overlay = document.createElement('div');
    overlay.className = 'benefit-image-preview-overlay upick-image-fade-layer du-layer du-layer--fullscreen benefit-image-preview-stable';
    overlay.setAttribute('role','dialog');
    overlay.setAttribute('aria-modal','true');
    overlay.setAttribute('aria-hidden','true');
    overlay.setAttribute('aria-label','혜택 사진 확대');
    overlay.setAttribute('data-du-layer','fullscreen');
    overlay.setAttribute('data-du-close-on-backdrop','false');
    overlay.setAttribute('data-du-close-on-esc','false');
    overlay.innerHTML = ''+
      '<div class="benefit-image-preview-dialog du-layer__panel" data-du-layer-panel role="document">'+
        '<div class="benefit-image-preview-head du-layer__header" data-du-layer-header>'+
          '<div class="du-layer__header-main"><strong class="du-layer__title">'+esc(title || '혜택 사진')+'</strong></div>'+
          '<div class="du-layer__header-actions"><button type="button" class="benefit-image-preview-close du-layer__close" data-du-layer-close aria-label="닫기">×</button></div>'+
        '</div>'+
        '<div class="benefit-image-preview-body du-layer__body" data-du-layer-body>'+
          '<div class="benefit-image-preview-single-frame">'+
            '<img class="benefit-image-preview-single-img" alt="" draggable="false" decoding="async">'+
            '<span class="benefit-image-preview-frame-count" aria-hidden="true"></span>'+
            '<div class="benefit-image-preview-frame-dots" aria-hidden="true"></div>'+
          '</div>'+
        '</div>'+
      '</div>';
    if(window.DuLayer && typeof window.DuLayer.mount === 'function') window.DuLayer.mount(overlay, 'fullscreen');
    else (document.getElementById('duLayerRoot') || document.body).appendChild(overlay);

    var img = overlay.querySelector('.benefit-image-preview-single-img');
    var count = overlay.querySelector('.benefit-image-preview-frame-count');
    var dots = overlay.querySelector('.benefit-image-preview-frame-dots');
    var closeBtn = overlay.querySelector('.benefit-image-preview-close');
    var body = overlay.querySelector('.benefit-image-preview-body');

    function render(animate){
      index = ((index + images.length) % images.length);
      overlay.dataset.previewCurrentIndex = String(index);
      window.__upickBenefitPreviewLastIndex = index;
      if(img){
        img.alt = (title || '혜택 사진') + ' ' + (index + 1) + '번째 사진';
        if(img.getAttribute('src') !== images[index]) img.setAttribute('src', images[index]);
      }
      if(count){
        count.hidden = images.length <= 1;
        count.textContent = images.length > 1 ? ((index + 1) + '/' + images.length) : '';
      }
      if(dots){
        dots.hidden = images.length <= 1;
        dots.innerHTML = images.length > 1 ? images.map(function(_, i){ return '<span class="'+(i === index ? 'active' : '')+'"></span>'; }).join('') : '';
      }
      syncDetailSlider(slider, index, animate !== false);
      fitOverlay(overlay);
    }

    function moveTo(next, animate){
      index = next;
      render(animate);
    }

    function close(){
      syncDetailSlider(slider, index, false);
      removeOverlay(overlay);
      try{ slider && slider.focus && slider.focus({preventScroll:true}); }catch(_){ }
    }

    overlay.addEventListener('click', function(event){
      if(event.target.closest('.benefit-image-preview-close')){
        event.preventDefault();
        event.stopPropagation();
        close();
        return;
      }
      event.preventDefault();
      event.stopPropagation();
    }, true);

    overlay.addEventListener('keydown', function(event){
      if(event.key === 'Escape'){
        event.preventDefault();
        event.stopPropagation();
        return;
      }
      if(images.length > 1 && (event.key === 'ArrowRight' || event.key === 'ArrowLeft')){
        event.preventDefault();
        moveTo(index + (event.key === 'ArrowRight' ? 1 : -1), true);
      }
    }, true);

    var sx = 0, sy = 0, dx = 0, active = false, pointerId = null, inputType = '';
    function point(event){
      var source = (event.touches && event.touches[0]) || (event.changedTouches && event.changedTouches[0]) || event;
      return {x:Number(source.clientX || 0), y:Number(source.clientY || 0)};
    }
    function start(event, type){
      if(images.length < 2) return;
      if(type === 'pointer' && event.pointerType === 'touch') return;
      if(type === 'pointer' && event.button != null && event.button !== 0) return;
      var p = point(event);
      sx = p.x; sy = p.y; dx = 0; active = true; inputType = type; pointerId = event.pointerId || null;
      if(type === 'pointer' && pointerId != null && body && body.setPointerCapture){ try{ body.setPointerCapture(pointerId); }catch(_){ } }
    }
    function move(event, type){
      if(!active || inputType !== type) return;
      var p = point(event);
      dx = p.x - sx;
      var dy = p.y - sy;
      if(Math.abs(dx) > 8 && Math.abs(dx) > Math.abs(dy)) event.preventDefault();
    }
    function end(event, type){
      if(!active || inputType !== type) return;
      active = false; inputType = '';
      if(type === 'pointer' && pointerId != null && body && body.releasePointerCapture){ try{ body.releasePointerCapture(pointerId); }catch(_){ } }
      var p = point(event);
      var dy = Math.abs((p.y || sy) - sy);
      var width = Math.max(1, body.clientWidth || body.getBoundingClientRect().width || 1);
      var threshold = Math.min(120, Math.max(48, width * 0.18));
      if(Math.abs(dx) > threshold && Math.abs(dx) > dy * 1.15){
        event.preventDefault();
        moveTo(index + (dx < 0 ? 1 : -1), true);
      }
      dx = 0;
    }
    if(body){
      body.addEventListener('pointerdown', function(e){ start(e,'pointer'); });
      body.addEventListener('pointermove', function(e){ move(e,'pointer'); }, {passive:false});
      body.addEventListener('pointerup', function(e){ end(e,'pointer'); }, {passive:false});
      body.addEventListener('pointercancel', function(e){ end(e,'pointer'); }, {passive:false});
      body.addEventListener('touchstart', function(e){ start(e,'touch'); }, {passive:true});
      body.addEventListener('touchmove', function(e){ move(e,'touch'); }, {passive:false});
      body.addEventListener('touchend', function(e){ end(e,'touch'); }, {passive:false});
      body.addEventListener('touchcancel', function(e){ end(e,'touch'); }, {passive:false});
    }

    render(false);
    document.body.classList.add('benefit-image-preview-open');
    overlay.setAttribute('aria-hidden','false');
    window.requestAnimationFrame(function(){
      overlay.classList.add('show');
      try{ closeBtn && closeBtn.focus && closeBtn.focus({preventScroll:true}); }catch(_){ }
      fitOverlay(overlay);
    });
    window.addEventListener('resize', function(){ fitOverlay(overlay); }, {passive:true});
  }

  window.__upickOpenBenefitImagePreview = openStableBenefitImagePreview;
})();
