/* Extracted from phone-verify.html.
   Inline scripts are executed as separate script blocks to preserve browser scoping/order as much as possible. */
(async function(){
  const blocks = [{"index": 1, "id": "", "type": "module", "code": "\n\n    const __SOLA_DYNAMIC_IMPORT_VERSION__ = globalThis.__SOLA_DYNAMIC_IMPORT_VERSION__ || (() => {\n      const d = new Date();\n      const pad = (n, len = 2) => String(n).padStart(len, '0');\n      return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}${pad(d.getMilliseconds(), 3)}`;\n    })();\n    globalThis.__SOLA_DYNAMIC_IMPORT_VERSION__ = __SOLA_DYNAMIC_IMPORT_VERSION__;\n    const __solaNoCache = (url) => `${url}${url.includes('?') ? '&' : '?'}v=${__SOLA_DYNAMIC_IMPORT_VERSION__}`;\n    const { ENV } = await import(__solaNoCache('/common/env-config.js'));\n\n    const envBadgeEl = document.getElementById('envBadge');\n    if (envBadgeEl && ENV === 'dev') {\n      envBadgeEl.classList.add('show');\n    }\n\n    await import(__solaNoCache('/js/phone-verify-core.js'));\n  "}, {"index": 2, "id": "myhills-install-ux-script", "type": "classic", "code": "\n    (function(){\n      const INSTALL_HIDE_KEY = \"myhills_install_banner_closed_v1\";\n      const FIRST_LAUNCH_KEY = \"myhills_first_launch_seen_v1\";\n\n      function isStandaloneMode(){\n        return window.matchMedia(\"(display-mode: standalone)\").matches ||\n          window.navigator.standalone === true ||\n          document.referrer.startsWith(\"android-app://\");\n      }\n\n      function initFirstLaunch(){\n        const splash = document.getElementById(\"myhillsFirstLaunch\");\n        if (!splash) return;\n\n        const shouldShow = isStandaloneMode() && !localStorage.getItem(FIRST_LAUNCH_KEY);\n        if (!shouldShow) {\n          splash.remove();\n          return;\n        }\n\n        splash.classList.add(\"show\");\n        localStorage.setItem(FIRST_LAUNCH_KEY, \"1\");\n\n        window.setTimeout(function(){\n          splash.classList.add(\"hide\");\n          window.setTimeout(function(){\n            if (splash && splash.parentNode) splash.remove();\n          }, 520);\n        }, 1250);\n      }\n\n      function initInstallBanner(){\n        let deferredPrompt = null;\n        const banner = document.getElementById(\"myhillsInstallBanner\");\n        const installBtn = document.getElementById(\"myhillsInstallBtn\");\n        const closeBtn = document.getElementById(\"myhillsInstallClose\");\n\n        if (!banner || !installBtn || !closeBtn) return;\n\n        function hideBanner(saveClose){\n          banner.classList.remove(\"show\");\n          banner.setAttribute(\"aria-hidden\", \"true\");\n          if (saveClose) localStorage.setItem(INSTALL_HIDE_KEY, String(Date.now()));\n        }\n\n        function showBanner(){\n          if (isStandaloneMode()) return;\n          if (localStorage.getItem(INSTALL_HIDE_KEY)) return;\n          banner.classList.add(\"show\");\n          banner.setAttribute(\"aria-hidden\", \"false\");\n        }\n\n        window.addEventListener(\"beforeinstallprompt\", function(event){\n          event.preventDefault();\n          deferredPrompt = event;\n          window.setTimeout(showBanner, 1200);\n        });\n\n        installBtn.addEventListener(\"click\", async function(){\n          if (!deferredPrompt) {\n            hideBanner(false);\n            return;\n          }\n\n          deferredPrompt.prompt();\n\n          try {\n            const choice = await deferredPrompt.userChoice;\n            if (choice && choice.outcome === \"accepted\") {\n              hideBanner(true);\n            }\n          } catch (e) {\n            console.warn(\"설치 안내 처리 실패:\", e);\n          }\n\n          deferredPrompt = null;\n        });\n\n        closeBtn.addEventListener(\"click\", function(){\n          hideBanner(true);\n        });\n\n        window.addEventListener(\"appinstalled\", function(){\n          hideBanner(true);\n        });\n\n        if (isStandaloneMode()) {\n          hideBanner(false);\n        }\n      }\n\n      if (document.readyState === \"loading\") {\n        document.addEventListener(\"DOMContentLoaded\", function(){\n          initFirstLaunch();\n          initInstallBanner();\n        });\n      } else {\n        initFirstLaunch();\n        initInstallBanner();\n      }\n    })();\n  "}];
  function runClassic(block){
    const s = document.createElement('script');
    if (block.id) s.id = block.id;
    s.text = block.code;
    document.documentElement.appendChild(s);
    s.remove();
  }
  function runModule(block){
    return new Promise((resolve) => {
      const script = document.createElement('script');
      if (block.id) script.id = block.id;
      script.type = 'module';
      script.textContent = block.code;
      script.onload = () => resolve();
      script.onerror = (err) => {
        console.error('[phone-verify.js] module block error', block.id || block.index, err);
        resolve();
      };
      document.documentElement.appendChild(script);
    });
  }
  for (const block of blocks) {
    if (block.type === 'module') { await runModule(block); }
    else { try { runClassic(block); } catch (err) { console.error('[phone-verify.js] script block error', block.id || block.index, err); } }
  }
})();
