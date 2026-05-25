
(function () {
  'use strict';

  function isDevHost() {
    var host = (location.hostname || '').toLowerCase();

    return (
      host.includes('dev') ||
      host === 'localhost' ||
      host === '127.0.0.1' ||
      host === '0.0.0.0'
    );
  }

  function syncDevBadge() {
    var isDev = isDevHost();

    document.documentElement.classList.toggle('env-dev', isDev);

    if (document.body) {
      document.body.classList.toggle('env-dev', isDev);
    }

    document.querySelectorAll(
      '#globalEnvBadge, #envBadge, #signupEnvBadge, #loginEnvBadge, #policyPillEnvBadge, .env-badge, .hero-env, .dev-badge, .dev-env'
    ).forEach(function (badge) {
      badge.classList.toggle('show', isDev);
      badge.hidden = !isDev;
      badge.setAttribute('aria-hidden', isDev ? 'false' : 'true');
      badge.style.display = isDev ? 'inline-flex' : 'none';
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', syncDevBadge);
  } else {
    syncDevBadge();
  }

  window.addEventListener('pageshow', syncDevBadge);
  setTimeout(syncDevBadge, 0);
  setTimeout(syncDevBadge, 300);
})();
