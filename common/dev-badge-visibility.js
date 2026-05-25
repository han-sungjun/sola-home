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

  function getBadges() {
    return document.querySelectorAll(
      '#globalEnvBadge, #envBadge, #signupEnvBadge, #loginEnvBadge, #policyPillEnvBadge, ' +
      '.env-badge, .hero-env, .dev-badge, .dev-env, [id$="EnvBadge"]'
    );
  }

  function syncDevBadge() {
    var isDev = isDevHost();

    document.documentElement.classList.toggle('env-dev', isDev);

    if (document.body) {
      document.body.classList.toggle('env-dev', isDev);
    }

    getBadges().forEach(function (badge) {
      badge.classList.toggle('show', isDev);
      badge.hidden = !isDev;
      badge.setAttribute('aria-hidden', isDev ? 'false' : 'true');

      if (isDev) {
        badge.style.removeProperty('display');
      } else {
        badge.style.setProperty('display', 'none', 'important');
      }
    });
  }

  function startObserver() {
    if (!document.body || window.__devBadgeVisibilityObserver) return;

    window.__devBadgeVisibilityObserver = new MutationObserver(function () {
      syncDevBadge();
    });

    window.__devBadgeVisibilityObserver.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class', 'style', 'hidden']
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      syncDevBadge();
      startObserver();
    });
  } else {
    syncDevBadge();
    startObserver();
  }

  window.addEventListener('pageshow', syncDevBadge);
  window.addEventListener('load', function () {
    syncDevBadge();
    startObserver();
  });

  [0, 100, 300, 800, 1500, 3000].forEach(function (delay) {
    setTimeout(syncDevBadge, delay);
  });
})();
