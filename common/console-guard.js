(function () {
  var host = window.location.hostname;
  var PROD_HOSTS = {
    "www.theunjeongpick.com": true,
    "theunjeongpick.com": true,
    "www.sola-home.kr": true,
    "sola-home.kr": true
  };

  if (!PROD_HOSTS[host]) return;
  if (window.__SOLA_CONSOLE_GUARD_APPLIED__) return;

  window.__SOLA_CONSOLE_GUARD_APPLIED__ = true;

  var noop = function () {};

  // 운영계에서는 정보성 로그만 숨깁니다.
  // 장애 추적용 warn/error는 유지합니다.
  console.log = noop;
  console.info = noop;
  console.debug = noop;
})();
