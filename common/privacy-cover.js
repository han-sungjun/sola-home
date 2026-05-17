(function () {
  'use strict';

  var COVER_ID = 'privacyCover';
  var visible = false;
  var hideTimer = 0;
  var showTimer = 0;
  var lastHiddenAt = 0;

  function getCover() {
    var cover = document.getElementById(COVER_ID);
    if (cover) return cover;

    cover = document.createElement('div');
    cover.id = COVER_ID;
    cover.setAttribute('aria-hidden', 'true');
    cover.innerHTML = '' +
      '<div class="privacy-cover-card" role="presentation">' +
        '<div class="privacy-cover-logo" aria-hidden="true">' +
          '<img src="/icons/internal/brand-symbol-real.png" alt="" loading="eager" decoding="sync">' +
        '</div>' +
        '<p class="privacy-cover-title">더운정픽</p>' +
        '<p class="privacy-cover-desc">보안을 위해 화면 내용을 잠시 가렸습니다.</p>' +
      '</div>';

    if (document.body) {
      document.body.appendChild(cover);
    } else if (document.documentElement) {
      document.documentElement.appendChild(cover);
    }
    return cover;
  }

  function showCover() {
    clearTimeout(hideTimer);
    clearTimeout(showTimer);

    var cover = getCover();
    if (!cover) return;

    visible = true;
    lastHiddenAt = Date.now();
    document.documentElement.classList.add('privacy-cover-active');
    if (document.body) document.body.classList.add('privacy-cover-active');
    cover.classList.add('is-visible');
  }

  function hideCover(delay) {
    clearTimeout(showTimer);
    clearTimeout(hideTimer);

    hideTimer = setTimeout(function () {
      var cover = document.getElementById(COVER_ID);
      visible = false;
      document.documentElement.classList.remove('privacy-cover-active');
      if (document.body) document.body.classList.remove('privacy-cover-active');
      if (cover) cover.classList.remove('is-visible');
    }, typeof delay === 'number' ? delay : 220);
  }

  function showCoverFast() {
    // 최근 앱/전체 탭 썸네일은 OS가 매우 빠르게 캡처하므로 지연 없이 즉시 가립니다.
    showCover();
  }

  function handleVisibilityChange() {
    if (document.hidden || document.visibilityState === 'hidden') {
      showCoverFast();
    } else {
      hideCover(260);
    }
  }

  function handlePageShow() {
    hideCover(260);
  }

  function handleFocus() {
    hideCover(220);
  }

  function init() {
    getCover();

    // capture 단계에서 먼저 잡아 최대한 빠르게 커버를 올립니다.
    document.addEventListener('visibilitychange', handleVisibilityChange, { capture: true, passive: true });
    window.addEventListener('blur', showCoverFast, { capture: true, passive: true });
    window.addEventListener('pagehide', showCoverFast, { capture: true, passive: true });
    window.addEventListener('freeze', showCoverFast, { capture: true, passive: true });
    document.addEventListener('freeze', showCoverFast, { capture: true, passive: true });

    // 일부 Android/Samsung 브라우저에서 최근 앱 전환 직전 발생하는 보조 이벤트까지 커버합니다.
    window.addEventListener('focusout', showCoverFast, { capture: true, passive: true });
    document.addEventListener('focusout', showCoverFast, { capture: true, passive: true });
    window.addEventListener('beforeunload', showCoverFast, { capture: true });

    window.addEventListener('focus', handleFocus, { passive: true });
    window.addEventListener('pageshow', handlePageShow, { passive: true });
    window.addEventListener('resume', handleFocus, { passive: true });
    document.addEventListener('resume', handleFocus, { passive: true });

    // 앱으로 돌아왔는데 visibilitychange가 늦는 경우를 보정합니다.
    setInterval(function () {
      if (visible && !document.hidden && document.hasFocus && document.hasFocus()) {
        if (Date.now() - lastHiddenAt > 300) hideCover(120);
      }
    }, 500);

    window.TheUnjeongPrivacyCover = {
      show: showCover,
      hide: function () { hideCover(0); },
      isVisible: function () { return visible; }
    };
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
