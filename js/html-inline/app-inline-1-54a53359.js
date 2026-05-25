(function(){
  document.addEventListener('click', function(event){
    var link = event.target && event.target.closest && event.target.closest('a.gnb-policy-link');
    if(!link) return;

    // 정책/가이드 페이지는 새 탭으로만 열고, 현재 공개앱 화면은 절대 이동시키지 않습니다.
    event.preventDefault();
    event.stopImmediatePropagation();

    var opened = null;
    try {
      opened = window.open(link.href, '_blank', 'noopener,noreferrer');
    } catch(e) {
      opened = null;
    }

    if(opened){
      try { opened.opener = null; } catch(e) {}
      try { opened.focus(); } catch(e) {}
      return;
    }

    // 팝업/새 탭이 차단된 경우에도 현재 앱을 policy 페이지로 replace 하지 않습니다.
    // 사용자는 target=_blank 기본 동작 또는 브라우저 설정으로 다시 열 수 있습니다.
  }, true);
})();
