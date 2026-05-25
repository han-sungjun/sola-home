(function () {
  'use strict';

  var host = (location.hostname || '').toLowerCase();

  var isDev =
    host.includes('dev') ||
    host.includes('localhost') ||
    host === '127.0.0.1' ||
    host === '0.0.0.0';

  document.documentElement.classList.toggle('env-dev', isDev);

  if (document.body) {
    document.body.classList.toggle('env-dev', isDev);
  } else {
    document.addEventListener('DOMContentLoaded', function () {
      document.body.classList.toggle('env-dev', isDev);
    });
  }
})();
