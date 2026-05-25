(function () {
  'use strict';

  function isDevHost() {
    var host = (location.hostname || '').toLowerCase();

    return (
      host.indexOf('dev') > -1 ||
      host === 'localhost' ||
      host === '127.0.0.1' ||
      host === '0.0.0.0'
    );
  }

  var isDev = isDevHost();

  document.documentElement.classList.toggle('env-dev', isDev);

  function syncDevBadge() {
    if (document.body) {
      document.body.classList.toggle('env-dev', isDev);
    }

    document.querySelectorAll(
      '.env-badge, .hero-env, .dev-badge, .dev-env, [id$="EnvBadge"]'
    ).forEach(function (badge) {
      if (!isDev) {
        badge.remove();
        return;
      }

      badge.hidden = false;
      badge.classList.add('show');
      badge.setAttribute('aria-hidden', 'false');
      badge.style.removeProperty('display');
      badge.style.removeProperty('visibility');
      badge.style.removeProperty('opacity');
      badge.style.removeProperty('pointer-events');
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', syncDevBadge, { once: true });
  } else {
    syncDevBadge();
  }

  window.addEventListener('pageshow', syncDevBadge);
  window.syncDevBadgeVisibility = syncDevBadge;
})();
