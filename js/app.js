/* Extracted from app.html.
   Inline scripts are executed as separate script blocks to preserve browser scoping/order as much as possible. */
(async function(){
  const blocks = [{"index": 1, "id": "sync-gnb-nav-safe-noop", "type": "classic", "code": "\nwindow.syncGnbNavSafe = window.syncGnbNavSafe || function(){ return; };\n"}, {"index": 2, "id": "", "type": "classic", "code": "\n(function(){\n  function setModalLock(){\n    var opened=document.querySelector('#detailModal[open],#noticeModal[open]');\n    document.documentElement.classList.toggle('upick-modal-open',!!opened);\n    document.body.classList.toggle('upick-modal-open',!!opened);\n  }\n  document.addEventListener('DOMContentLoaded',function(){\n    ['detailModal','noticeModal'].forEach(function(id){\n      var modal=document.getElementById(id);\n      if(!modal || modal.__upickV7ScrollBound) return;\n      modal.__upickV7ScrollBound=true;\n      modal.addEventListener('toggle',setModalLock);\n      modal.addEventListener('close',setModalLock);\n      modal.addEventListener('cancel',setModalLock);\n    });\n  });\n})();\n"}, {"index": 3, "id": "upick-v8-global-modal-scroll-lock", "type": "classic", "code": "\n(function(){\n  'use strict';\n\n  // v87: body를 position:fixed/top 방식으로 잠그지 않습니다.\n  // 스크롤바는 그대로 둔 상태에서, 모달 바깥 wheel/touch/key 입력만 차단합니다.\n  var locked = false;\n  var savedY = 0;\n  var allowedSelector = [\n    '#detailModal[open]',\n    '#detailModal[open] *',\n    '#noticeModal[open]',\n    '#noticeModal[open] *',\n    '#calendarDayModal[open]',\n    '#calendarDayModal[open] *',\n    '#calendarReservationModal[open]',\n    '#calendarReservationModal[open] *',\n    '#qrModal[open]',\n    '#qrModal[open] *',\n    '#settingsSuiteModal[open]',\n    '#settingsSuiteModal[open] *',\n    '#settingsSuiteModal.show',\n    '#settingsSuiteModal.show *',\n    '.settings-suite-dialog[open]',\n    '.settings-suite-dialog[open] *',\n    '.settings-suite-dialog.show',\n    '.settings-suite-dialog.show *',\n    '.gnb-management-dialog[open]',\n    '.gnb-management-dialog[open] *',\n    '.gnb-management-dialog.show',\n    '.gnb-management-dialog.show *',\n    '#accountEditModal[open]',\n    '#accountEditModal[open] *',\n    '#communityEditorModal[open]',\n    '#communityEditorModal[open] *',\n    '#communityDetailModal[open]',\n    '#communityDetailModal[open] *',\n    '#communityReportModal[open]',\n    '#communityReportModal[open] *',\n    'dialog.app-alert[open]',\n    'dialog.app-alert[open] *',\n    '.app-alert.show',\n    '.app-alert.show *',\n    '.du-layer.show',\n    '.du-layer.show *',\n    '.du-layer[open]',\n    '.du-layer[open] *',\n    '.du-layer[aria-hidden=\"false\"]',\n    '.du-layer[aria-hidden=\"false\"] *',\n    '.upick-div-modal.show',\n    '.upick-div-modal.show *',\n    '.upick-div-dialog.show',\n    '.upick-div-dialog.show *',\n    '.sheet-modal.show',\n    '.sheet-modal.show *',\n    '.ai-image-zoom-scroll',\n    '.ai-image-zoom-scroll *'\n  ].join(',');\n  var lockSelector = [\n    '#detailModal[open]',\n    '#noticeModal[open]',\n    '#calendarDayModal[open]',\n    '#calendarReservationModal[open]',\n    '#qrModal[open]',\n    '#settingsSuiteModal[open]',\n    '#settingsSuiteModal.show',\n    '.settings-suite-dialog[open]',\n    '.settings-suite-dialog.show',\n    '.gnb-management-dialog[open]',\n    '.gnb-management-dialog.show',\n    '#accountEditModal[open]',\n    '#communityEditorModal[open]',\n    '#communityDetailModal[open]',\n    '#communityReportModal[open]',\n    'dialog.app-alert[open]',\n    '.app-alert.show',\n    '.du-layer.show',\n    '.du-layer[open]',\n    '.du-layer[aria-hidden=\"false\"]',\n    '.upick-div-modal.show',\n    '.upick-div-dialog.show',\n    '.sheet-modal.show'\n  ].join(',');\n\n  function pageY(){\n    return window.scrollY || window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;\n  }\n  function hasOpenModal(){ return !!document.querySelector(lockSelector); }\n  function clearLegacyFixedStyles(){\n    // 이전 v80~v86의 fixed/top 잠금 잔재를 제거합니다.\n    document.documentElement.classList.remove('upick-modal-hard-lock','upick-v9-modal-lock','upick-modal-lock');\n    document.body.classList.remove('upick-modal-hard-lock','upick-v9-modal-lock','upick-modal-lock');\n    delete document.documentElement.dataset.upickScrollLocked;\n    delete document.body.dataset.upickScrollLocked;\n    document.body.style.position = '';\n    document.body.style.top = '';\n    document.body.style.left = '';\n    document.body.style.right = '';\n    document.body.style.width = '';\n  }\n  function lock(presetY){\n    if(!locked) savedY = Math.max(0, Number(presetY) || pageY() || 0);\n    locked = true;\n    clearLegacyFixedStyles();\n    document.documentElement.classList.add('upick-modal-scroll-event-lock');\n    document.body.classList.add('upick-modal-scroll-event-lock');\n  }\n  function unlock(){\n    locked = false;\n    document.documentElement.classList.remove('upick-modal-scroll-event-lock');\n    document.body.classList.remove('upick-modal-scroll-event-lock');\n    clearLegacyFixedStyles();\n    savedY = pageY();\n  }\n  function sync(){\n    if(hasOpenModal()) lock(savedY || pageY());\n    else unlock();\n  }\n  function isAllowedTarget(target){ return !!(target && target.closest && target.closest(allowedSelector)); }\n  function preventOutsideScroll(event){\n    if(!locked) return;\n    if(isAllowedTarget(event.target)) return;\n    event.preventDefault();\n  }\n  function preventOutsideKeys(event){\n    if(!locked) return;\n    if(isAllowedTarget(event.target)) return;\n    var keys = ['ArrowDown','ArrowUp','PageDown','PageUp','Home','End','Space',' '];\n    if(keys.indexOf(event.key) >= 0) event.preventDefault();\n  }\n\n  clearLegacyFixedStyles();\n  document.addEventListener('touchmove', preventOutsideScroll, {passive:false, capture:true});\n  document.addEventListener('wheel', preventOutsideScroll, {passive:false, capture:true});\n  document.addEventListener('keydown', preventOutsideKeys, true);\n  document.addEventListener('toggle', function(event){\n    if(event.target && event.target.matches && event.target.matches('dialog')) setTimeout(sync, 0);\n  }, true);\n  document.addEventListener('close', function(event){\n    if(event.target && event.target.matches && event.target.matches('dialog')) setTimeout(sync, 0);\n  }, true);\n  document.addEventListener('cancel', function(event){\n    if(event.target && event.target.matches && event.target.matches('dialog')) setTimeout(sync, 0);\n  }, true);\n\n  window.__upickV8SyncModalScrollLock = sync;\n  window.__upickSyncModalScrollLock = sync;\n  ['click','pointerdown','transitionend','animationend'].forEach(function(type){ document.addEventListener(type, function(){ setTimeout(sync,0); }, true); });\n  if(window.MutationObserver){\n    var bindV8LayerObservers = function(){\n      document.querySelectorAll('#settingsSuiteModal,#accountEditModal,#passwordChangeModal,#detailModal,#noticeModal,#calendarDayModal,#calendarReservationModal,#qrModal,#communityEditorModal,#communityDetailModal,#communityReportModal,.app-alert,.sheet-modal').forEach(function(el){\n        if(!el || el.__upickV8LockObserved) return;\n        el.__upickV8LockObserved = true;\n        new MutationObserver(function(){ setTimeout(sync,0); }).observe(el,{attributes:true,attributeFilter:['class','open','aria-hidden','style','hidden']});\n      });\n    };\n    bindV8LayerObservers();\n    new MutationObserver(bindV8LayerObservers).observe(document.body || document.documentElement,{childList:true,subtree:true});\n  }\n  window.__upickLockModalBackgroundAt = function(y){ lock(Number(y) || pageY()); };\n  window.__upickUnlockModalBackground = function(){ unlock(); };\n  window.__upickUnlockModalBackgroundAt = function(){ unlock(); };\n})();\n"}, {"index": 4, "id": "upick-v80-public-profile-avatar-sync", "type": "classic", "code": "/* disabled in v93 performance fix: handled by single global hero */"}, {"index": 5, "id": "upick-v82-header-button-map-fix", "type": "classic", "code": "/* disabled in v83: merged into stable header normalizer */"}, {"index": 9, "id": "", "type": "module", "code": "\n const __SOLA_DYNAMIC_IMPORT_VERSION__ = globalThis.__SOLA_DYNAMIC_IMPORT_VERSION__ || (() => {\n const d = new Date();\n const pad = (n, len = 2) => String(n).padStart(len, '0');\n return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}${pad(d.getMilliseconds(), 3)}`;\n })();\n globalThis.__SOLA_DYNAMIC_IMPORT_VERSION__ = __SOLA_DYNAMIC_IMPORT_VERSION__;\n const __solaNoCache = (url) => `${url}${url.includes('?') ? '&' : '?'}v=${__SOLA_DYNAMIC_IMPORT_VERSION__}`;\n const { saveVisit } = await import(__solaNoCache(\"/common/tracking.js\"));\n saveVisit(\"app_main\");\n"}, {"index": 10, "id": "", "type": "module", "code": "\n\n const __SOLA_DYNAMIC_IMPORT_VERSION__ = globalThis.__SOLA_DYNAMIC_IMPORT_VERSION__ || (() => {\n const d = new Date();\n const pad = (n, len = 2) => String(n).padStart(len, '0');\n return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}${pad(d.getMilliseconds(), 3)}`;\n })();\n globalThis.__SOLA_DYNAMIC_IMPORT_VERSION__ = __SOLA_DYNAMIC_IMPORT_VERSION__;\n const __solaNoCache = (url) => `${url}${url.includes('?') ? '&' : '?'}v=${__SOLA_DYNAMIC_IMPORT_VERSION__}`;\n const { saveActivity } = await import(__solaNoCache('/common/tracking.js'));\n\n function detectView(target) {\n return target?.dataset?.viewLink\n || target?.dataset?.view\n || target?.closest?.('[data-view-link]')?.dataset?.viewLink\n || target?.closest?.('.nav-btn')?.dataset?.view\n || '';\n }\n\n document.addEventListener('click', async (event) => {\n const target = event.target;\n const view = detectView(target);\n if (view) {\n await saveActivity('view_change', { page: view, targetView: view });\n return;\n }\n\n const favoriteBtn = target.closest?.('[data-favorite-id], .favorite-btn');\n if (favoriteBtn) {\n await saveActivity('favorite_toggle', { page: 'favorite' });\n return;\n }\n\n const noticeBtn = target.closest?.('[data-notice-id]');\n if (noticeBtn) {\n await saveActivity('notice_open', { page: 'notices' });\n }\n }, true);\n"}, {"index": 11, "id": "", "type": "module", "code": "\n\n const __SOLA_DYNAMIC_IMPORT_VERSION__ = globalThis.__SOLA_DYNAMIC_IMPORT_VERSION__ || (() => {\n const d = new Date();\n const pad = (n, len = 2) => String(n).padStart(len, '0');\n return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}${pad(d.getMilliseconds(), 3)}`;\n })();\n globalThis.__SOLA_DYNAMIC_IMPORT_VERSION__ = __SOLA_DYNAMIC_IMPORT_VERSION__;\n const __solaNoCache = (url) => `${url}${url.includes('?') ? '&' : '?'}v=${__SOLA_DYNAMIC_IMPORT_VERSION__}`;\n const { mountIdleTimer } = await import(__solaNoCache(\"/common/tracking.js\"));\n\n window.addEventListener(\"load\", () => {\n mountIdleTimer({\n containerSelector: \".topbar-left-titleline\",\n insertPosition: \"beforeend\"\n });\n });\n"}, {"index": 12, "id": "", "type": "classic", "code": "\nfunction handlePushDeepLink() {\n const params = new URLSearchParams(location.search);\n const noticeId = params.get(\"noticeId\");\n\n if (!noticeId) return;\n\n setTimeout(() => {\n if (window.openNoticeDetailById) {\n window.openNoticeDetailById(noticeId);\n }\n }, 700);\n}\n\nwindow.addEventListener(\"load\", handlePushDeepLink);\n"}, {"index": 13, "id": "myhills-idle-widget-enhancer", "type": "classic", "code": "\n (function(){\n const TOTAL_SECONDS = 30 * 60;\n\n function parseSeconds(text){\n const match = String(text || '').match(/(\\d{1,2})\\s*:\\s*(\\d{2})/);\n if(!match) return null;\n return (Number(match[1]) || 0) * 60 + (Number(match[2]) || 0);\n }\n\n function decorateIdleWidget(){\n const header = document.querySelector('.topbar-left-titleline');\n if(!header) return;\n\n Array.from(header.children || []).forEach((el) => {\n if(!el || el.classList.contains('brand')) return;\n const text = (el.textContent || '').trim();\n if(!text.includes('자동 나가기') && !/\\d{1,2}\\s*:\\s*\\d{2}/.test(text)) return;\n\n el.classList.add('myhills-idle-widget');\n el.dataset.myhillsIdleWidget = 'true';\n\n const seconds = parseSeconds(text);\n if(seconds !== null){\n const progress = Math.max(0, Math.min(1, seconds / TOTAL_SECONDS));\n el.style.setProperty('--idle-progress', String(progress));\n el.classList.toggle('is-warning', seconds <= 60);\n }\n\n if(el.dataset.lastIdleText && el.dataset.lastIdleText !== text){\n el.classList.remove('is-ticking');\n void el.offsetWidth;\n el.classList.add('is-ticking');\n }\n el.dataset.lastIdleText = text;\n });\n }\n\n decorateIdleWidget();\n const observer = new MutationObserver(decorateIdleWidget);\n observer.observe(document.documentElement, { childList:true, subtree:true, characterData:true });\n window.addEventListener('pageshow', decorateIdleWidget);\n })();\n\n // AI 상단 아이콘: 하루 1회 가볍게 강조해서 AI 진입을 유도합니다.\n (function initAiQuickButtonHint(){\n try{\n const aiBtn = document.getElementById('aiQuickBtn');\n if(!aiBtn) return;\n const todayKey = 'aiQuickHintShown:' + new Date().toISOString().slice(0,10);\n if(localStorage.getItem(todayKey)) return;\n aiBtn.style.animation = 'aiPulse 1.25s ease-in-out infinite';\n setTimeout(() => {\n aiBtn.style.animation = '';\n localStorage.setItem(todayKey, '1');\n }, 4200);\n }catch(error){\n console.warn('AI 상단 아이콘 강조 처리 실패:', error);\n }\n })();\n\n/* ===== 캘린더 화면 전용 padding class 동기화 ===== */\n(function(){\n function isVisible(el){\n if (!el) return false;\n if (el.classList && el.classList.contains(\"hidden\")) return false;\n const style = window.getComputedStyle(el);\n return style.display !== \"none\" && style.visibility !== \"hidden\" && style.opacity !== \"0\";\n }\n\n function syncCalendarViewPaddingClass(){\n const calendarView =\n document.getElementById(\"view-calendar\") ||\n document.querySelector('[data-view=\"calendar\"]') ||\n document.querySelector(\".calendar-hero\")?.closest(\"section,div\");\n\n const calendarNavActive =\n document.querySelector('.nav-btn.active[data-tab=\"calendar\"], .nav-btn.active[data-view=\"calendar\"], .nav-btn.active[aria-label*=\"캘린더\"]');\n\n const isCalendar =\n (calendarView && isVisible(calendarView)) ||\n !!calendarNavActive ||\n (location.hash || \"\").toLowerCase().includes(\"calendar\") ||\n (location.search || \"\").toLowerCase().includes(\"open=calendar\");\n\n document.body.classList.toggle(\"calendar-view-active\", !!isCalendar);\n }\n\n window.syncCalendarViewPaddingClass = syncCalendarViewPaddingClass;\n\n document.addEventListener(\"DOMContentLoaded\", function(){\n syncCalendarViewPaddingClass();\n setTimeout(syncCalendarViewPaddingClass, 250);\n setTimeout(syncCalendarViewPaddingClass, 800);\n });\n\n document.addEventListener(\"click\", function(){\n setTimeout(syncCalendarViewPaddingClass, 80);\n }, true);\n\n window.addEventListener(\"hashchange\", syncCalendarViewPaddingClass);\n window.addEventListener(\"popstate\", syncCalendarViewPaddingClass);\n setInterval(syncCalendarViewPaddingClass, 1200);\n})();\n\n"}, {"index": 14, "id": "", "type": "classic", "code": "\n/* =========================================================\n   Bottom Navigation Dynamic Safe Offset v2\n   실제 하단 네비바 높이를 계산해서 최소 하단 여백만 반영합니다.\n   ========================================================= */\n(function(){\n  var rafId = null;\n\n  function syncBottomNavSafeOffset(){\n    if(rafId) cancelAnimationFrame(rafId);\n    rafId = requestAnimationFrame(function(){\n      try{\n        var nav = document.querySelector('.bottom-nav');\n        var root = document.documentElement;\n        if(!root) return;\n\n        var fallback = 96;\n        var navHeight = fallback;\n\n        if(nav){\n          var rect = nav.getBoundingClientRect();\n          navHeight = Math.ceil(rect.height || nav.offsetHeight || fallback);\n        }\n\n        // 네비 실제 높이 + 최소 여유 8px만 변수에 반영합니다.\n        // 추가 여백은 CSS의 --bottom-nav-extra-gap(16px)에서 한 번만 더해집니다.\n        var offset = Math.max(72, navHeight + 8);\n        root.style.setProperty('--bottom-nav-safe-offset', offset + 'px');\n      }catch(e){\n        console.warn('[bottom-nav-safe-offset] sync skipped', e);\n      }\n    });\n  }\n\n  window.syncBottomNavSafeOffset = syncBottomNavSafeOffset;\n\n  document.addEventListener('DOMContentLoaded', function(){\n    syncBottomNavSafeOffset();\n    setTimeout(syncBottomNavSafeOffset, 150);\n    setTimeout(syncBottomNavSafeOffset, 500);\n    setTimeout(syncBottomNavSafeOffset, 1000);\n\n    var nav = document.querySelector('.bottom-nav');\n    if(nav && 'ResizeObserver' in window){\n      try{\n        var observer = new ResizeObserver(syncBottomNavSafeOffset);\n        observer.observe(nav);\n      }catch(e){}\n    }\n  });\n\n  window.addEventListener('load', syncBottomNavSafeOffset, { passive:true });\n  window.addEventListener('resize', syncBottomNavSafeOffset, { passive:true });\n  window.addEventListener('orientationchange', function(){\n    setTimeout(syncBottomNavSafeOffset, 250);\n    setTimeout(syncBottomNavSafeOffset, 700);\n  }, { passive:true });\n\n  document.addEventListener('click', function(){\n    setTimeout(syncBottomNavSafeOffset, 80);\n  }, true);\n})();\n"}, {"index": 15, "id": "premium-ui-interaction-hierarchy-script-v4", "type": "classic", "code": "\n(function(){\n  'use strict';\n\n  function ready(fn){\n    if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn, {once:true});\n    else fn();\n  }\n\n  function setupScrollHeader(){\n    var ticking = false;\n    function apply(){\n      ticking = false;\n      var y = window.scrollY || document.documentElement.scrollTop || 0;\n      document.body.classList.toggle('app-scrolled', y > 18);\n      document.body.classList.toggle('app-deep-scrolled', y > 120);\n    }\n    function requestApply(){\n      if(ticking) return;\n      ticking = true;\n      requestAnimationFrame(apply);\n    }\n    window.addEventListener('scroll', requestApply, {passive:true});\n    window.addEventListener('resize', requestApply, {passive:true});\n    if(window.visualViewport){\n      window.visualViewport.addEventListener('resize', requestApply, {passive:true});\n    }\n    apply();\n  }\n\n  function setupPressEffect(){\n    var selector = [\n      '.card',\n      '.notice-item',\n      '.popular-item',\n      '.calendar-item',\n      '.summary-card',\n      '.calendar-summary-card',\n      '.insight-card',\n      '.map-place-card',\n      '.community-card'\n    ].join(',');\n    var activeEl = null;\n\n    function clear(el, rebound){\n      if(!el) return;\n      el.classList.remove('is-pressing');\n      if(rebound){\n        el.classList.remove('press-rebound');\n        void el.offsetWidth;\n        el.classList.add('press-rebound');\n        window.setTimeout(function(){ el.classList.remove('press-rebound'); }, 320);\n      }\n    }\n\n    document.addEventListener('pointerdown', function(e){\n      if(e.button !== undefined && e.button !== 0) return;\n      var el = e.target && e.target.closest ? e.target.closest(selector) : null;\n      if(!el) return;\n      activeEl = el;\n      el.classList.add('is-pressing');\n    }, {passive:true});\n\n    document.addEventListener('pointerup', function(){\n      clear(activeEl, true);\n      activeEl = null;\n    }, {passive:true});\n\n    document.addEventListener('pointercancel', function(){\n      clear(activeEl, false);\n      activeEl = null;\n    }, {passive:true});\n\n    document.addEventListener('pointerleave', function(e){\n      if(activeEl && e.target === activeEl){\n        clear(activeEl, false);\n        activeEl = null;\n      }\n    }, {passive:true});\n  }\n\n  function markActiveViewForCalendarSafe(){\n    function sync(){\n      var calendar = document.getElementById('view-calendar');\n      document.body.classList.toggle('calendar-view-active', !!calendar && !calendar.classList.contains('hidden'));\n    }\n    var root = document.querySelector('.shell') || document.body;\n    if(window.MutationObserver && root){\n      new MutationObserver(sync).observe(root, {subtree:true, attributes:true, attributeFilter:['class']});\n    }\n    sync();\n  }\n\n  ready(function(){\n    setupScrollHeader();\n    setupPressEffect();\n    markActiveViewForCalendarSafe();\n  });\n})();\n"}, {"index": 16, "id": "gnb-menu-nav-visibility-safe-v5", "type": "classic", "code": "\n(function(){\n  'use strict';\n  function syncGnbNavSafe(){\n    var sheet = document.querySelector('.gnb-sheet');\n    var overlay = document.querySelector('.gnb-overlay');\n    var opened = !!((sheet && sheet.classList.contains('show')) || (overlay && overlay.classList.contains('show')));\n    document.body.classList.toggle('gnb-open', opened);\n  }\n  function ready(fn){\n    if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn, {once:true});\n    else fn();\n  }\n  ready(function(){\nif(window.MutationObserver){\n      new MutationObserver(syncGnbNavSafe).observe(document.body, {subtree:true, attributes:true, attributeFilter:['class']});\n    }\n    document.addEventListener('click', function(){ setTimeout(syncGnbNavSafe, 0); }, true);\n    window.addEventListener('resize', syncGnbNavSafe, {passive:true});\n  });\n})();\n\n document.addEventListener('click', (event) => {\n const downloadBtn = event.target.closest?.('[data-ai-attachment-download]');\n if(!downloadBtn) return;\n event.preventDefault();\n event.stopPropagation();\n downloadAiAttachmentByDataset(downloadBtn);\n });\n\n"}, {"index": 17, "id": "", "type": "classic", "code": "\n/* ===== AI 첨부파일 다운로드: Cloud Run 다운로드 API 연결 ===== */\n(function(){\n  const AI_ATTACHMENT_DOWNLOAD_BASE = (function(){\n    const DEV_BASE = \"https://ai-stream-server-dev-292137041544.asia-northeast3.run.app\";\n    const PROD_BASE = \"https://ai-stream-server-337132471819.asia-northeast3.run.app\";\n\n    try {\n      const host = String(location.hostname || \"\").toLowerCase();\n\n      // 이 스크립트는 일반 script 영역이라 module 내부 const ENV에 접근할 수 없습니다.\n      // 따라서 다운로드 BASE는 도메인 기준으로만 안전하게 분기합니다.\n      if (host.includes(\"sola-home-dev.kr\") ||\n          host.includes(\"localhost\") ||\n          host.includes(\"127.0.0.1\") ||\n          host.includes(\"vercel.app\")) {\n        return DEV_BASE;\n      }\n\n      if (host.includes(\"theunjeongpick.com\") ||\n          host.includes(\"sola-home.kr\")) {\n        return PROD_BASE;\n      }\n\n      return DEV_BASE;\n    } catch (e) {\n      return DEV_BASE;\n    }\n  })();\n\n  function resolveAiAttachmentPath(input){\n    if (!input) return \"\";\n    if (typeof input === \"string\") return input;\n\n    if (input.dataset) {\n      return input.dataset.aiAttachmentPath ||\n             input.dataset.attachmentPath ||\n             input.dataset.path ||\n             input.dataset.filePath ||\n             input.dataset.storagePath ||\n             \"\";\n    }\n\n    return \"\";\n  }\n\n  function resolveAiAttachmentName(input, fallback){\n    if (fallback) return fallback;\n\n    if (input && input.dataset) {\n      return input.dataset.aiAttachmentName ||\n             input.dataset.attachmentName ||\n             input.dataset.name ||\n             input.dataset.fileName ||\n             \"download\";\n    }\n\n    return \"download\";\n  }\n\n  window.downloadAiAttachment = function(pathOrButton, name){\n    const safePath = resolveAiAttachmentPath(pathOrButton);\n    const safeName = resolveAiAttachmentName(pathOrButton, name);\n\n    if (!safePath) {\n      alert(\"다운로드 경로가 없습니다.\");\n      return;\n    }\n\n    const url =\n      AI_ATTACHMENT_DOWNLOAD_BASE +\n      \"/download-ai-attachment?path=\" + encodeURIComponent(safePath) +\n      \"&name=\" + encodeURIComponent(safeName || \"download\");\n\n    window.location.replace(url);\n  };\n\n  window.downloadAiAttachmentByDataset = function(button){\n    window.downloadAiAttachment(button, null);\n  };\n})();\n"}, {"index": 18, "id": "", "type": "classic", "code": "\n/* ===== AI 첨부 이미지 전체화면 확대 - 직접 호출형 ===== */\n(function(){\n  function byId(id){ return document.getElementById(id); }\n\n  window.openAiImageZoom = function(src, title){\n    var backdrop = byId(\"aiImageZoomBackdrop\");\n    var img = byId(\"aiImageZoomImg\");\n    var titleEl = byId(\"aiImageZoomTitle\");\n    var scroll = byId(\"aiImageZoomScroll\");\n    if(!backdrop || !img || !src) return false;\n\n    img.src = src;\n    img.alt = title || \"확대 이미지\";\n    if(titleEl) titleEl.textContent = title || \"이미지 확대 보기\";\n    if(scroll) scroll.scrollTop = 0;\n\n    backdrop.classList.add(\"show\");\n    backdrop.setAttribute(\"aria-hidden\", \"false\");\n    document.documentElement.style.overflow = \"hidden\";\n    document.body.style.overflow = \"hidden\";\n    return false;\n  };\n\n  window.closeAiImageZoom = function(){\n    var backdrop = byId(\"aiImageZoomBackdrop\");\n    var img = byId(\"aiImageZoomImg\");\n    if(!backdrop || !img) return false;\n\n    backdrop.classList.remove(\"show\");\n    backdrop.setAttribute(\"aria-hidden\", \"true\");\n    img.removeAttribute(\"src\");\n    document.documentElement.style.overflow = \"\";\n    document.body.style.overflow = \"\";\n    return false;\n  };\n\n  window.openAiImageZoomFromElement = function(el){\n    if(!el) return false;\n    var img = el.tagName === \"IMG\" ? el : el.querySelector && el.querySelector(\"img\");\n    if(!img) return false;\n    var src = el.getAttribute(\"data-ai-image-src\") || img.currentSrc || img.src || \"\";\n    var title = el.getAttribute(\"data-ai-image-title\") || img.alt || \"이미지 확대 보기\";\n    return window.openAiImageZoom(src, title);\n  };\n\n  document.addEventListener(\"click\", function(e){\n    var closeBtn = e.target && e.target.closest ? e.target.closest(\"#aiImageZoomCloseBtn\") : null;\n    if(closeBtn){\n      e.preventDefault();\n      e.stopPropagation();\n      window.closeAiImageZoom();\n      return;\n    }\n\n    var backdrop = byId(\"aiImageZoomBackdrop\");\n    if(e.target === backdrop){\n      e.preventDefault();\n      window.closeAiImageZoom();\n      return;\n    }\n\n    var target = e.target && e.target.closest ? e.target.closest(\"[data-ai-image-zoom='1'], [data-ai-attachment-image='true'], .ai-attachment-image-card img\") : null;\n    if(target){\n      e.preventDefault();\n      e.stopPropagation();\n      window.openAiImageZoomFromElement(target);\n    }\n  }, true);\n\n  document.addEventListener(\"keydown\", function(e){\n    if(e.key === \"Escape\") window.closeAiImageZoom();\n  });\n})();\n"}, {"index": 19, "id": "", "type": "classic", "code": "\n/* ===== AI 첨부 이미지 확대 팝업 - 헤더 고정 / 이미지 영역 분리 ===== */\n(function(){\n  function getViewportWidth(){\n    return Math.max(320, Math.floor((window.visualViewport && window.visualViewport.width) || window.innerWidth || document.documentElement.clientWidth || 360));\n  }\n\n  function applyZoomImageSize(){\n    var img = document.getElementById(\"aiRuntimeImageZoomImg\");\n    var backdrop = document.getElementById(\"aiRuntimeImageZoomBackdrop\");\n    if(!img || !backdrop || backdrop.style.display === \"none\") return;\n\n    var vw = getViewportWidth();\n    img.style.width = vw + \"px\";\n    img.style.maxWidth = \"100%\";\n    img.style.minWidth = \"0\";\n    img.style.height = \"auto\";\n    img.style.maxHeight = \"none\";\n    img.style.objectFit = \"contain\";\n  }\n\n  function ensureAiRuntimeZoomLayer(){\n    var old = document.getElementById(\"aiRuntimeImageZoomBackdrop\");\n    if(old) return old;\n\n    var backdrop = document.createElement(\"div\");\n    backdrop.id = \"aiRuntimeImageZoomBackdrop\";\n    backdrop.setAttribute(\"aria-hidden\", \"true\");\n    backdrop.style.cssText = [\n      \"position:fixed\",\n      \"inset:0\",\n      \"z-index:2147483647\",\n      \"display:none\",\n      \"background:rgba(0,0,0,.94)\",\n      \"overflow:hidden\",\n      \"box-sizing:border-box\"\n    ].join(\";\");\n\n    var header = document.createElement(\"div\");\n    header.id = \"aiRuntimeImageZoomHeader\";\n    header.style.cssText = [\n      \"position:absolute\",\n      \"left:0\",\n      \"right:0\",\n      \"top:0\",\n      \"height:calc(58px + env(safe-area-inset-top,0px))\",\n      \"padding:calc(10px + env(safe-area-inset-top,0px)) 12px 8px\",\n      \"box-sizing:border-box\",\n      \"display:flex\",\n      \"align-items:center\",\n      \"gap:12px\",\n      \"background:rgba(0,0,0,.92)\",\n      \"border-bottom:1px solid rgba(255,255,255,.16)\",\n      \"box-shadow:0 10px 24px rgba(0,0,0,.25)\",\n      \"z-index:2\"\n    ].join(\";\");\n\n    var title = document.createElement(\"div\");\n    title.id = \"aiRuntimeImageZoomTitle\";\n    title.style.cssText = [\n      \"min-width:0\",\n      \"flex:1\",\n      \"color:#fff\",\n      \"font-size:14px\",\n      \"font-weight:900\",\n      \"white-space:nowrap\",\n      \"overflow:hidden\",\n      \"text-overflow:ellipsis\"\n    ].join(\";\");\n\n    var close = document.createElement(\"button\");\n    close.type = \"button\";\n    close.textContent = \"×\";\n    close.setAttribute(\"aria-label\", \"닫기\");\n    close.style.cssText = [\n      \"width:42px\",\n      \"height:42px\",\n      \"border:0\",\n      \"border-radius:999px\",\n      \"background:rgba(15,23,42,.96)\",\n      \"color:#fff\",\n      \"font-size:26px\",\n      \"font-weight:900\",\n      \"display:grid\",\n      \"place-items:center\",\n      \"cursor:pointer\",\n      \"box-shadow:0 10px 24px rgba(0,0,0,.32)\",\n      \"flex:0 0 auto\",\n      \"line-height:1\"\n    ].join(\";\");\n\n    var scroll = document.createElement(\"div\");\n    scroll.id = \"aiRuntimeImageZoomScroll\";\n    scroll.style.cssText = [\n      \"position:absolute\",\n      \"left:0\",\n      \"right:0\",\n      \"top:calc(58px + env(safe-area-inset-top,0px))\",\n      \"bottom:0\",\n      \"overflow:auto\",\n      \"-webkit-overflow-scrolling:touch\",\n      \"display:flex\",\n      \"align-items:flex-start\",\n      \"justify-content:center\",\n      \"box-sizing:border-box\",\n      \"padding:0 0 calc(24px + env(safe-area-inset-bottom,0px))\"\n    ].join(\";\");\n\n    var img = document.createElement(\"img\");\n    img.id = \"aiRuntimeImageZoomImg\";\n    img.alt = \"확대 이미지\";\n    img.style.cssText = [\n      \"display:block\",\n      \"width:100vw\",\n      \"max-width:100%\",\n      \"min-width:0\",\n      \"height:auto\",\n      \"max-height:none\",\n      \"object-fit:contain\",\n      \"background:#fff\",\n      \"box-shadow:0 18px 50px rgba(0,0,0,.42)\"\n    ].join(\";\");\n\n    close.addEventListener(\"click\", function(e){\n      e.preventDefault();\n      e.stopPropagation();\n      window.closeAiImageZoom();\n    });\n\n    backdrop.addEventListener(\"click\", function(e){\n      if (e.target === aiImageZoomBackdrop) { e.preventDefault(); e.stopPropagation(); return false; }\n    });\n\n    header.appendChild(title);\n    header.appendChild(close);\n    scroll.appendChild(img);\n    backdrop.appendChild(header);\n    backdrop.appendChild(scroll);\n    if(window.DuLayer && typeof window.DuLayer.mount === \"function\") window.DuLayer.mount(backdrop, \"fullscreen\"); else (document.getElementById(\"duLayerRoot\") || document.body).appendChild(backdrop);\n    return backdrop;\n  }\n\n  window.openAiImageZoom = function(src, title){\n    if(!src) return false;\n\n    var backdrop = ensureAiRuntimeZoomLayer();\n    var img = document.getElementById(\"aiRuntimeImageZoomImg\");\n    var titleEl = document.getElementById(\"aiRuntimeImageZoomTitle\");\n    var scroll = document.getElementById(\"aiRuntimeImageZoomScroll\");\n\n    if(!backdrop || !img) return false;\n\n    img.src = src;\n    img.alt = title || \"확대 이미지\";\n    if(titleEl) titleEl.textContent = title || \"이미지 확대 보기\";\n\n    backdrop.style.display = \"block\";\n    backdrop.setAttribute(\"aria-hidden\", \"false\");\n    if(scroll){\n      scroll.scrollTop = 0;\n      scroll.scrollLeft = 0;\n    }\n\n    document.documentElement.style.overflow = \"hidden\";\n    document.body.style.overflow = \"hidden\";\n\n    requestAnimationFrame(applyZoomImageSize);\n    setTimeout(applyZoomImageSize, 80);\n    return false;\n  };\n\n  window.closeAiImageZoom = function(){\n    var backdrop = document.getElementById(\"aiRuntimeImageZoomBackdrop\");\n    var img = document.getElementById(\"aiRuntimeImageZoomImg\");\n    if(backdrop){\n      backdrop.style.display = \"none\";\n      backdrop.setAttribute(\"aria-hidden\", \"true\");\n    }\n    if(img) img.removeAttribute(\"src\");\n\n    document.documentElement.style.overflow = \"\";\n    document.body.style.overflow = \"\";\n    return false;\n  };\n\n  window.openAiImageZoomFromElement = function(el){\n    if(!el) return false;\n    var img = el.tagName === \"IMG\" ? el : (el.querySelector ? el.querySelector(\"img\") : null);\n    if(!img) return false;\n\n    var src =\n      el.getAttribute(\"data-ai-image-src\") ||\n      img.currentSrc ||\n      img.src ||\n      \"\";\n\n    var title =\n      el.getAttribute(\"data-ai-image-title\") ||\n      img.getAttribute(\"alt\") ||\n      \"이미지 확대 보기\";\n\n    return window.openAiImageZoom(src, title);\n  };\n\n  document.addEventListener(\"click\", function(e){\n    var target = e.target && e.target.closest\n      ? e.target.closest(\"[data-ai-image-zoom='1'], [data-ai-attachment-image='true'], .ai-attachment-image-card img\")\n      : null;\n\n    if(!target) return;\n\n    e.preventDefault();\n    e.stopPropagation();\n    window.openAiImageZoomFromElement(target);\n  }, true);\n\n  window.addEventListener(\"resize\", function(){\n    requestAnimationFrame(applyZoomImageSize);\n  });\n\n  if(window.visualViewport){\n    window.visualViewport.addEventListener(\"resize\", function(){\n      requestAnimationFrame(applyZoomImageSize);\n    });\n  }\n\n  window.addEventListener(\"orientationchange\", function(){\n    setTimeout(applyZoomImageSize, 160);\n  });\n\n  document.addEventListener(\"keydown\", function(e){\n    if(e.key === \"Escape\") window.closeAiImageZoom();\n  });\n})();\n"}, {"index": 20, "id": "ai-composer-ctrl-enter-fixed", "type": "classic", "code": "\n(function(){\n  function isAiTextarea(el){\n    if (!el) return false;\n    if (el.tagName !== 'TEXTAREA') return false;\n    var id = (el.id || '').toLowerCase();\n    var cls = (el.className || '').toString().toLowerCase();\n    return id.includes('ai') || id.includes('question') || cls.includes('ai') || cls.includes('question') || cls.includes('composer');\n  }\n\n  document.addEventListener('keydown', function(e){\n    if (!isAiTextarea(e.target)) return;\n\n    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {\n      e.preventDefault();\n      e.stopPropagation();\n      if (typeof e.stopImmediatePropagation === 'function') e.stopImmediatePropagation();\n\n      var sendBtn =\n        document.getElementById('aiSendBtn') ||\n        document.getElementById('sendAiBtn') ||\n        document.getElementById('askAiBtn') ||\n        document.getElementById('aiAskBtn') ||\n        document.querySelector('.ai-send-btn, .ai-submit-btn, button[data-ai-send=\"true\"]');\n\n      if (sendBtn && !sendBtn.disabled) {\n        sendBtn.click();\n      }\n      return false;\n    }\n  }, true);\n})();\n"}, {"index": 21, "id": "ai-composer-reset-fix", "type": "classic", "code": "\n(function(){\n  function getTargets(){\n    return Array.from(document.querySelectorAll('textarea'));\n  }\n\n  function resetTextarea(el){\n    if(!el) return;\n    el.style.height='44px';\n    el.scrollTop = 0;\n  }\n\n  document.addEventListener('click', function(e){\n    const btn = e.target.closest('button');\n    if(!btn) return;\n\n    const txt = (btn.innerText || '').trim();\n    if(txt.includes('질문') || btn.id.toLowerCase().includes('send')){\n      setTimeout(()=>{\n        getTargets().forEach((t)=>{\n          if(!t.value.trim()){\n            resetTextarea(t);\n          }\n        });\n      },50);\n    }\n  }, true);\n\n  document.addEventListener('input', function(e){\n    if(e.target.tagName !== 'TEXTAREA') return;\n\n    const ta = e.target;\n\n    if(!ta.value.trim()){\n      resetTextarea(ta);\n      return;\n    }\n\n    ta.style.height = '44px';\n    ta.style.height = Math.min(140, ta.scrollHeight) + 'px';\n  }, true);\n})();\n"}, {"index": 22, "id": "ai-error-retry-patch-v1", "type": "classic", "code": "\n(function(){\n  const SHORT_PLACEHOLDER = '궁금한 내용을 입력하세요';\n\n  function normalizeComposerPlaceholder(){\n    document.querySelectorAll('textarea, input[type=\"text\"]').forEach((el)=>{\n      const ph = el.getAttribute('placeholder') || '';\n      if (\n        ph.includes('최근 공지') ||\n        ph.includes('혜택 매장') ||\n        ph.includes('질문을') ||\n        ph.includes('궁금한 내용')\n      ) {\n        el.setAttribute('placeholder', SHORT_PLACEHOLDER);\n      }\n    });\n  }\n\n  function findComposerInput(){\n    const candidates = [\n      '#aiQuestionTextarea',\n      '#aiQuestionInput',\n      '#aiInput',\n      '#questionInput',\n      'textarea.ai-question-textarea',\n      'textarea'\n    ];\n    for (const sel of candidates) {\n      const el = document.querySelector(sel);\n      if (el) return el;\n    }\n    return null;\n  }\n\n  function findSendButton(){\n    const candidates = [\n      '#aiSendBtn',\n      '#sendAiBtn',\n      '#askAiBtn',\n      '#aiAskBtn',\n      '.ai-send-btn',\n      '.ai-submit-btn',\n      'button[data-ai-send=\"true\"]'\n    ];\n    for (const sel of candidates) {\n      const el = document.querySelector(sel);\n      if (el) return el;\n    }\n    return Array.from(document.querySelectorAll('button')).find((btn)=>{\n      const t = (btn.innerText || '').trim();\n      return t === '질문' || t.includes('질문');\n    }) || null;\n  }\n\n  function getLastUserQuestionText(card){\n    let node = card;\n    for (let i=0; i<8 && node; i++, node=node.previousElementSibling) {\n      const txt = (node.innerText || '').trim();\n      if (!txt) continue;\n      if (txt.includes('첨부파일 내용을 분석해줘')) return '첨부파일 내용을 분석해줘';\n      if (!txt.includes('답변을 준비하는 중') && !txt.includes('문제가 발생') && !txt.includes('잠시 후 다시')) {\n        const lines = txt.split('\\n').map(v=>v.trim()).filter(Boolean);\n        const last = lines[lines.length - 1] || '';\n        if (last && last.length < 300) return last;\n      }\n    }\n    return '';\n  }\n\n  function retryLastQuestion(btn){\n    const card = btn.closest('.ai-message, .ai-answer, .chat-message, .message, .bot-message, .assistant-message, div') || btn.parentElement;\n    const retryText = btn.dataset.retryText || getLastUserQuestionText(card);\n    const input = findComposerInput();\n    const send = findSendButton();\n\n    if (!input || !send) return;\n\n    if (retryText && !input.value.trim()) {\n      input.value = retryText;\n      input.dispatchEvent(new Event('input', { bubbles:true }));\n    }\n\n    setTimeout(()=>send.click(), 30);\n  }\n\n  function enhanceErrorCards(){\n    const errorTexts = [\n      '답변을 준비하는 중 문제가 발생했습니다',\n      '잠시 후 다시 질문해 주세요',\n      '오류가 발생',\n      '문제가 발생했습니다',\n      '다시 질문'\n    ];\n\n    const nodes = Array.from(document.querySelectorAll('div, section, article, li')).filter((el)=>{\n      if (el.dataset.aiRetryEnhanced === '1') return false;\n      const txt = (el.innerText || '').trim();\n      if (!txt || txt.length > 500) return false;\n      return errorTexts.some(k => txt.includes(k));\n    });\n\n    nodes.forEach((el)=>{\n      if (el.querySelector('.ai-error-retry-btn')) {\n        el.dataset.aiRetryEnhanced = '1';\n        return;\n      }\n\n      const btn = document.createElement('button');\n      btn.type = 'button';\n      btn.className = 'ai-error-retry-btn';\n      btn.textContent = '↻ 다시 보내기';\n      btn.addEventListener('click', function(){\n        retryLastQuestion(btn);\n      });\n\n      el.appendChild(btn);\n      el.dataset.aiRetryEnhanced = '1';\n    });\n  }\n\n  document.addEventListener('DOMContentLoaded', function(){\n    normalizeComposerPlaceholder();\n    enhanceErrorCards();\n  });\n\n  document.addEventListener('input', normalizeComposerPlaceholder, true);\n\n  const observer = new MutationObserver(function(){\n    normalizeComposerPlaceholder();\n    enhanceErrorCards();\n  });\n  observer.observe(document.documentElement, { childList:true, subtree:true });\n})();\n"}, {"index": 23, "id": "upick-v9-modal-lock-script", "type": "classic", "code": "\n(function(){\n  var y=0, locked=false;\n  var modalSelector=['#detailModal[open]','#noticeModal[open]','#calendarDayModal[open]','#calendarReservationModal[open]','#qrModal[open]','#accountEditModal[open]','dialog.app-alert[open]','.app-alert.show','.sheet-modal.show'].join(',');\n  var scrollableSelector=['#detailModal[open] .modal-body','#noticeModal[open] .modal-body','#calendarDayModal[open] .calendar-day-modal-list','#calendarDayModal[open] .calendar-day-modal-body','#calendarReservationModal[open] .modal-body','#qrModal[open] .modal-body','#accountEditModal[open] .modal-body','dialog.app-alert[open] .app-alert-card','.app-alert.show .app-alert-card','.sheet-modal.show .sheet-panel'].join(',');\n  function hasOpen(){return !!document.querySelector(modalSelector);}\n  function lock(){\n    if(locked) return;\n    locked=true; y=window.scrollY||document.documentElement.scrollTop||0;\n    document.documentElement.classList.add('upick-v9-modal-lock');\n    document.body.classList.add('upick-v9-modal-lock');\n    document.body.style.top='-'+y+'px';\n  }\n  function unlock(){\n    if(!locked) return;\n    locked=false;\n    document.documentElement.classList.remove('upick-v9-modal-lock');\n    document.body.classList.remove('upick-v9-modal-lock');\n    document.body.style.top='';\n    window.scrollTo(0,y||0);\n  }\n  function sync(){ hasOpen()?lock():unlock(); }\n  document.addEventListener('toggle',function(e){ if(e.target && e.target.matches && e.target.matches('dialog')) setTimeout(sync,0); },true);\n  document.addEventListener('close',function(e){ if(e.target && e.target.matches && e.target.matches('dialog')) setTimeout(sync,0); },true);\n  document.addEventListener('click',function(){ setTimeout(sync,0); },true);\n  document.addEventListener('touchmove',function(e){\n    if(!hasOpen()) return;\n    if(e.target && e.target.closest && e.target.closest(scrollableSelector)) return;\n    e.preventDefault();\n  },{capture:true,passive:false});\n  document.addEventListener('wheel',function(e){\n    if(!hasOpen()) return;\n    if(e.target && e.target.closest && e.target.closest(scrollableSelector)) return;\n    e.preventDefault();\n  },{capture:true,passive:false});\n  document.addEventListener('DOMContentLoaded',function(){\n    var mo=new MutationObserver(sync);\n    mo.observe(document.body,{attributes:true,subtree:true,attributeFilter:['open','class','style']});\n    sync();\n  });\n})();\n"}, {"index": 24, "id": "upick-v10-modal-scroll-lock", "type": "classic", "code": "\n(function(){\n  var scrollY=0, locked=false;\n  var modalSelector=['#detailModal[open]','#noticeModal[open]','#calendarDayModal[open]','#calendarReservationModal[open]','#qrModal[open]','dialog.app-alert[open]','.app-alert.show'].join(',');\n  var allowedSelector=['#detailModal[open] .modal-body','#noticeModal[open] .modal-body','#calendarDayModal[open] .calendar-day-modal-list','#calendarDayModal[open] .calendar-day-modal-body','#calendarReservationModal[open] .modal-body','#qrModal[open] .modal-body','dialog.app-alert[open] .app-alert-card','.app-alert.show .app-alert-card'].join(',');\n  function isOpen(){return !!document.querySelector(modalSelector)}\n  function lock(){if(locked) return; locked=true; scrollY=window.scrollY||document.documentElement.scrollTop||0; document.documentElement.classList.add('upick-modal-lock'); document.body.classList.add('upick-modal-lock'); document.body.style.top='-'+scrollY+'px';}\n  function unlock(){if(!locked) return; locked=false; document.documentElement.classList.remove('upick-modal-lock'); document.body.classList.remove('upick-modal-lock'); document.body.style.top=''; window.scrollTo(0,scrollY||0);}\n  function sync(){isOpen()?lock():unlock();}\n  document.addEventListener('toggle',function(e){if(e.target&&e.target.matches&&e.target.matches('dialog')) setTimeout(sync,0)},true);\n  document.addEventListener('close',function(e){if(e.target&&e.target.matches&&e.target.matches('dialog')) setTimeout(sync,0)},true);\n  document.addEventListener('click',function(){setTimeout(sync,0)},true);\n  document.addEventListener('touchmove',function(e){if(!isOpen()) return; if(e.target&&e.target.closest&&e.target.closest(allowedSelector)) return; e.preventDefault();},{capture:true,passive:false});\n  document.addEventListener('wheel',function(e){if(!isOpen()) return; if(e.target&&e.target.closest&&e.target.closest(allowedSelector)) return; e.preventDefault();},{capture:true,passive:false});\n  document.addEventListener('DOMContentLoaded',function(){var mo=new MutationObserver(sync); mo.observe(document.body,{subtree:true,attributes:true,attributeFilter:['open','class']}); sync();});\n})();\n"}, {"index": 25, "id": "upick-public-tabs-blue-premium-v22-js", "type": "classic", "code": "\n(function(){\n  const META = {\n    benefits:{icon:\"/icons/internal/benefit.svg\",kicker:\"혜택 찾기\",title:\"원하는 입주민 혜택을 빠르게 찾아보세요\",desc:\"매장, 카테고리, 거리별로 다양한 혜택을 편리하게 확인해보세요.\",chips:[\"혜택 검색\",\"카테고리 필터\",\"즐겨찾기\"]},\n    favorites:{icon:\"/icons/internal/favorite.svg\",kicker:\"자주 쓰는 혜택\",title:\"저장한 혜택을 빠르게 다시 확인해보세요\",desc:\"관심 있는 혜택을 저장하고 필요할 때 편리하게 다시 확인해보세요.\",chips:[\"내 관심 혜택\",\"빠른 확인\",\"계정 동기화\"]},\n    popular:{icon:\"/icons/internal/top5.svg\",kicker:\"실시간 인기\",title:\"지금 입주민들이 많이 찾는 혜택 매장을 확인해보세요\",desc:\"조회와 즐겨찾기가 많은 인기 혜택 매장을 보여드려요.\",chips:[\"실시간 집계\",\"TOP5\",\"입주민 반응\"]},\n    map:{icon:\"/icons/internal/map.svg\",kicker:\"지도 기반 탐색\",title:\"가까운 혜택을 지도에서 찾아보세요\",desc:\"현재 위치와 매장 위치를 기준으로 거리와 주변 혜택을 편하게 확인합니다.\",chips:[\"현재 위치\",\"거리 확인\",\"길찾기\"]},\n    all:{icon:\"/icons/internal/all-menu.svg\",kicker:\"서비스 메뉴\",title:\"필요한 기능을 한곳에서 편리하게 이용해보세요\",desc:\"자주 사용하는 기능을 한곳에서 빠르게 이용해보세요.\",chips:[\"전체 기능\",\"빠른 이동\",\"서비스 확장\"]},\n    notices:{icon:\"/icons/internal/notice.svg\",kicker:\"입주민 안내\",title:\"중요한 공지와 안내를 빠르게 확인해보세요\",desc:\"입주민 공지와 새로운 소식을 한눈에 확인해보세요.\",chips:[\"공지 확인\",\"공유\",\"QR 보기\"]},\n    calendar:{icon:\"/icons/internal/calendar.svg\",kicker:\"방문 예약 알림\",title:\"방문 일정을 놓치지 않게 관리하세요\",desc:\"혜택 매장 방문 일정을 등록하고 원하는 시간에 미리 알림을 받을 수 있습니다.\",chips:[\"월간\",\"주간\",\"일간\"]},\n    ai:{icon:\"/icons/internal/ai-assistant.svg\",kicker:\"AI 생활 도우미\",title:\"궁금한 정보를 AI 생활도우미에게 편하게 물어보세요\",desc:\"생활, 혜택, 매장 정보를 대화처럼 편하게 확인해보세요.\",chips:[\"질문하기\",\"혜택 추천\",\"파일 분석\"]}\n  };\n\n  function commonHeader(){\n    const el = document.createElement(\"div\");\n    el.className = \"upick-tab-common-header\";\n    el.innerHTML = `\n      <div class=\"upick-tab-brand-block\">\n        <div class=\"upick-tab-brand-logo\"><img src=\"/icons/internal/brand-symbol-real.png\" alt=\"\"></div>\n        <div class=\"upick-tab-brand-copy\"><strong>더운정픽</strong><span>입주민 전용 혜택 플랫폼</span></div>\n      </div>\n      <button class=\"upick-tab-header-btn profile upick-header-profile-btn\" type=\"button\" data-upick-profile aria-label=\"계정 정보\"><span class=\"upick-header-profile-avatar\"><img src=\"/icons/internal/user.svg\" alt=\"\"></span></button>\n      <button class=\"upick-tab-header-btn ai\" type=\"button\" data-upick-go=\"ai\" aria-label=\"AI 생활 도우미\"><img src=\"/icons/internal/ai-assistant.svg\" alt=\"\"></button>\n      <button class=\"upick-tab-header-btn install\" type=\"button\" data-upick-install aria-label=\"앱으로 이용하기\"><img src=\"/icons/internal/install.svg\" alt=\"\"></button>\n      <button class=\"upick-tab-header-btn\" type=\"button\" data-upick-open-gnb aria-label=\"전체 메뉴\"><img src=\"/icons/internal/all-menu.svg\" alt=\"\"></button>\n    `;\n    return el;\n  }\n\n  function menuHero(key){\n    const m = META[key];\n    if(!m) return null;\n    const el = document.createElement(\"section\");\n    el.className = \"upick-tab-premium-hero\";\n    el.dataset.upickTabHero = key;\n    el.appendChild(commonHeader());\n    el.insertAdjacentHTML(\"beforeend\", `\n      <div class=\"upick-tab-kicker\">\n        <img src=\"${m.icon}\" alt=\"\" onerror=\"this.style.display='none'\">\n        <span>${m.kicker}</span>\n      </div>\n      <h2>${m.title}</h2>\n      <p>${m.desc}</p>\n      <div class=\"upick-tab-mini-actions\">\n        ${m.chips.map(c=>`<span class=\"upick-tab-mini-chip\">${c}</span>`).join(\"\")}\n      </div>\n    `);\n    return el;\n  }\n\n  function hideDuplicatePanel(key, view){\n    if(!view) return;\n    if([\"benefits\",\"favorites\",\"all\",\"notices\"].includes(key)){\n      const panels = Array.from(view.children).filter(el => el.classList && el.classList.contains(\"panel\"));\n      const firstPanel = panels[0];\n      if(firstPanel && !firstPanel.classList.contains(\"filter-sticky\")){\n        firstPanel.classList.add(\"upick-duplicate-hidden\");\n      }\n    }\n    if(key === \"ai\"){\n      const old = view.querySelector(\".ai-view-hero\");\n      if(old) old.classList.add(\"upick-duplicate-hidden\");\n    }\n    if(key === \"calendar\"){\n      const old = view.querySelector(\".calendar-hero\");\n      if(old) old.classList.add(\"upick-duplicate-hidden\");\n    }\n  }\n\n  function removeOldSeparateHeader(view){\n    const old = view.querySelector(\":scope > .upick-tab-common-header\");\n    if(old) old.remove();\n  }\n\n  function ensureForView(key){\n    const view = document.getElementById(\"view-\" + key);\n    if(!view || !META[key]) return;\n\n    removeOldSeparateHeader(view);\n\n    if(!view.querySelector(\":scope > .upick-tab-premium-hero\")){\n      const hero = menuHero(key);\n      if(hero) view.insertBefore(hero, view.firstElementChild);\n    }else{\n      const hero = view.querySelector(\":scope > .upick-tab-premium-hero\");\n      if(hero && !hero.querySelector(\":scope > .upick-tab-common-header\")){\n        hero.insertBefore(commonHeader(), hero.firstElementChild);\n      }\n    }\n\n    hideDuplicatePanel(key, view);\n  }\n\n  function routeTo(key){\n    const selectors = [`[data-view=\"${key}\"]`, `[data-view-link=\"${key}\"]`, `.nav-btn[data-view=\"${key}\"]`, `.nav-btn[data-view-link=\"${key}\"]`];\n    for(const sel of selectors){\n      const btn = document.querySelector(sel);\n      if(btn){ btn.click(); return; }\n    }\n  }\n\n  function bindHeaderButtons(){\n    document.addEventListener(\"click\", function(e){\n      const ai = e.target.closest(\"[data-upick-go='ai']\");\n      if(ai){ e.preventDefault(); routeTo(\"ai\"); return; }\n\n      const install = e.target.closest(\"[data-upick-install]\");\n      if(install){\n        e.preventDefault();\n        const installBtn = document.querySelector(\"#installAppBtn,[data-install-app],.install-btn\");\n        if(installBtn) installBtn.click();\n        return;\n      }\n\n      const gnb = e.target.closest(\"[data-upick-open-gnb]\");\n      if(gnb){\n        e.preventDefault();\n        const gnbBtn = document.querySelector(\"#gnbOpenBtn,#openGnbBtn,[data-open-gnb],.gnb-open-btn,.topbar [aria-label*='전체'],.topbar [aria-label*='메뉴']\");\n        if(gnbBtn) gnbBtn.click();\n        return;\n      }\n    }, true);\n  }\n\n  function init(){\n    Object.keys(META).forEach(ensureForView);\n    bindHeaderButtons();\n    document.addEventListener(\"click\", function(e){\n      if(e.target.closest(\"[data-view],[data-view-link],.nav-btn,.gnb-chip,.gnb-menu-item,.gnb-menu-subitem,.all-menu-card\")){\n        setTimeout(function(){\n          Object.keys(META).forEach(ensureForView);\n        }, 80);\n      }\n    }, true);\n  }\n\n  if(document.readyState === \"loading\"){\n    document.addEventListener(\"DOMContentLoaded\", init, {once:true});\n  }else{\n    init();\n  }\n})();\n"}, {"index": 26, "id": "upick-public-tabs-blue-premium-v23-fav-top5-js", "type": "classic", "code": "\n(function(){\n  const ALIASES = {\n    favorites: [\"view-favorites\",\"view-favorite\",\"view-bookmarks\",\"view-bookmark\",\"favoritesView\",\"favoriteView\",\"bookmarkView\"],\n    popular: [\"view-popular\",\"view-top5\",\"view-top-5\",\"view-ranking\",\"view-rank\",\"popularView\",\"top5View\",\"rankingView\"]\n  };\n\n  const META = {\n    favorites:{\n      key:\"favorites\",\n      icon:\"/icons/internal/favorite.svg\",\n      kicker:\"자주 쓰는 혜택\",\n      title:\"저장한 혜택을 빠르게 다시 확인해보세요\",\n      desc:\"관심 있는 혜택을 저장하고 필요할 때 편리하게 다시 확인해보세요.\",\n      chips:[\"내 관심 혜택\",\"빠른 확인\",\"계정 동기화\"]\n    },\n    popular:{\n      key:\"popular\",\n      icon:\"/icons/internal/top5.svg\",\n      kicker:\"실시간 인기\",\n      title:\"지금 입주민들이 많이 찾는 혜택 매장을 확인해보세요\",\n      desc:\"조회와 즐겨찾기가 많은 인기 혜택 매장을 보여드려요.\",\n      chips:[\"실시간 집계\",\"TOP5\",\"입주민 반응\"]\n    }\n  };\n\n  function findView(type){\n    for(const id of ALIASES[type]){\n      const el = document.getElementById(id);\n      if(el) return el;\n    }\n\n    // fallback: nav target reverse lookup\n    const keywords = type === \"favorites\"\n      ? [\"즐겨찾기\",\"favorite\",\"favorites\",\"bookmark\",\"bookmarks\"]\n      : [\"TOP5\",\"Top5\",\"top5\",\"인기\",\"popular\",\"ranking\",\"rank\"];\n\n    const sections = Array.from(document.querySelectorAll(\"section[id], div[id]\"));\n    return sections.find(sec => {\n      const id = (sec.id || \"\").toLowerCase();\n      const txt = (sec.textContent || \"\").slice(0, 120).replace(/\\s/g, \"\");\n      return keywords.some(k => id.includes(k.toLowerCase()) || txt.includes(k.replace(/\\s/g, \"\")));\n    }) || null;\n  }\n\n  function commonHeader(){\n    const el = document.createElement(\"div\");\n    el.className = \"upick-tab-common-header\";\n    el.innerHTML = `\n      <div class=\"upick-tab-brand-block\">\n        <div class=\"upick-tab-brand-logo\"><img src=\"/icons/internal/brand-symbol-real.png\" alt=\"\"></div>\n        <div class=\"upick-tab-brand-copy\"><strong>더운정픽</strong><span>입주민 전용 혜택 플랫폼</span></div>\n      </div>\n      <button class=\"upick-tab-header-btn profile upick-header-profile-btn\" type=\"button\" data-upick-profile aria-label=\"계정 정보\"><span class=\"upick-header-profile-avatar\"><img src=\"/icons/internal/user.svg\" alt=\"\"></span></button>\n      <button class=\"upick-tab-header-btn ai\" type=\"button\" data-upick-go=\"ai\" aria-label=\"AI 생활 도우미\"><img src=\"/icons/internal/ai-assistant.svg\" alt=\"\"></button>\n      <button class=\"upick-tab-header-btn install\" type=\"button\" data-upick-install aria-label=\"앱으로 이용하기\"><img src=\"/icons/internal/install.svg\" alt=\"\"></button>\n      <button class=\"upick-tab-header-btn\" type=\"button\" data-upick-open-gnb aria-label=\"전체 메뉴\"><img src=\"/icons/internal/all-menu.svg\" alt=\"\"></button>\n    `;\n    return el;\n  }\n\n  function hero(meta){\n    const el = document.createElement(\"section\");\n    el.className = \"upick-tab-premium-hero\";\n    el.dataset.upickTabHero = meta.key;\n    el.appendChild(commonHeader());\n    el.insertAdjacentHTML(\"beforeend\", `\n      <div class=\"upick-tab-kicker\">\n        <img src=\"${meta.icon}\" alt=\"\" onerror=\"this.style.display='none'\">\n        <span>${meta.kicker}</span>\n      </div>\n      <h2>${meta.title}</h2>\n      <p>${meta.desc}</p>\n      <div class=\"upick-tab-mini-actions\">\n        ${meta.chips.map(c=>`<span class=\"upick-tab-mini-chip\">${c}</span>`).join(\"\")}\n      </div>\n    `);\n    return el;\n  }\n\n  function ensure(type){\n    const view = findView(type);\n    if(!view) return;\n\n    // remove standalone header if older patch inserted one\n    const oldStandalone = view.querySelector(\":scope > .upick-tab-common-header\");\n    if(oldStandalone) oldStandalone.remove();\n\n    // if hero exists but lacks header, add header inside\n    let existingHero = view.querySelector(\":scope > .upick-tab-premium-hero\");\n    if(existingHero){\n      if(!existingHero.querySelector(\":scope > .upick-tab-common-header\")){\n        existingHero.insertBefore(commonHeader(), existingHero.firstElementChild);\n      }\n      return;\n    }\n\n    // insert new hero as first child\n    const h = hero(META[type]);\n    view.insertBefore(h, view.firstElementChild);\n\n    // hide old duplicate intro panel only if it appears directly after inserted hero and is a simple intro panel\n    const next = h.nextElementSibling;\n    if(next && next.classList && next.classList.contains(\"panel\")){\n      const text = (next.textContent || \"\").replace(/\\s/g, \"\");\n      if(type === \"favorites\" && text.includes(\"즐겨찾기\")){\n        next.classList.add(\"upick-duplicate-hidden\");\n      }\n      if(type === \"popular\" && (text.includes(\"인기매장TOP5\") || text.includes(\"TOP5\"))){\n        next.classList.add(\"upick-duplicate-hidden\");\n      }\n    }\n  }\n\n  function run(){\n    ensure(\"favorites\");\n    ensure(\"popular\");\n  }\n\n  if(document.readyState === \"loading\"){\n    document.addEventListener(\"DOMContentLoaded\", run, {once:true});\n  }else{\n    run();\n  }\n\n  // Lightweight retry after app renders dynamic tabs; no MutationObserver.\n  setTimeout(run, 300);\n  setTimeout(run, 1000);\n\n  document.addEventListener(\"click\", function(e){\n    if(e.target.closest(\"[data-view],[data-view-link],.nav-btn,.gnb-chip,.gnb-menu-item,.gnb-menu-subitem,.all-menu-card\")){\n      setTimeout(run, 120);\n    }\n  }, true);\n})();\n"}, {"index": 27, "id": "upick-public-tabs-v25-remove-only-duplicate-cards-js", "type": "classic", "code": "\n(function(){\n  function visibleText(el){\n    return (el && el.textContent ? el.textContent : \"\").replace(/\\s/g,\"\");\n  }\n\n  function findView(candidates){\n    for(const id of candidates){\n      const el = document.getElementById(id);\n      if(el) return el;\n    }\n    return null;\n  }\n\n  function hideOnlyTwoCards(){\n    const favView = findView([\"view-favorites\",\"view-favorite\",\"view-bookmarks\",\"view-bookmark\",\"favoritesView\",\"favoriteView\",\"bookmarkView\"]);\n    if(favView){\n      Array.from(favView.children).forEach(el => {\n        if(el.classList && el.classList.contains(\"upick-tab-premium-hero\")) return;\n        const t = visibleText(el);\n        if(\n          t.includes(\"즐겨찾기\") &&\n          (t.includes(\"자주쓰는혜택\") || t.includes(\"관심있는매장\") || t.includes(\"계정기준\"))\n        ){\n          el.classList.add(\"upick-only-hide-duplicate-intro\");\n        }\n      });\n    }\n\n    const top5View = findView([\"view-popular\",\"view-top5\",\"view-top-5\",\"view-ranking\",\"view-rank\",\"popularView\",\"top5View\",\"rankingView\"]);\n    if(top5View){\n      Array.from(top5View.children).forEach(el => {\n        if(el.classList && el.classList.contains(\"upick-tab-premium-hero\")) return;\n        const t = visibleText(el);\n        if(\n          (t.includes(\"인기매장TOP5\") || t.includes(\"인기매장\") || t.includes(\"TOP5\")) &&\n          (t.includes(\"실시간집계\") || t.includes(\"상세조회\") || t.includes(\"입주민반응\"))\n        ){\n          el.classList.add(\"upick-only-hide-duplicate-intro\");\n        }\n      });\n    }\n  }\n\n  if(document.readyState === \"loading\"){\n    document.addEventListener(\"DOMContentLoaded\", hideOnlyTwoCards, {once:true});\n  }else{\n    hideOnlyTwoCards();\n  }\n\n  setTimeout(hideOnlyTwoCards, 250);\n  setTimeout(hideOnlyTwoCards, 900);\n\n  document.addEventListener(\"click\", function(e){\n    if(e.target.closest(\"[data-view],[data-view-link],.nav-btn,.gnb-chip,.gnb-menu-item,.gnb-menu-subitem,.all-menu-card\")){\n      setTimeout(hideOnlyTwoCards, 120);\n    }\n  }, true);\n})();\n"}, {"index": 28, "id": "upick-public-v26-button-actions", "type": "classic", "code": "\n(function(){\n  function q(sel){ return document.querySelector(sel); }\n  function qa(sel){ return Array.from(document.querySelectorAll(sel)); }\n\n  function clickFirst(selectors){\n    for(const sel of selectors){\n      const el = q(sel);\n      if(el && !el.disabled){\n        el.click();\n        return true;\n      }\n    }\n    return false;\n  }\n\n  function openGnbFallback(){\n    document.body.classList.add(\"gnb-open\");\n    const candidates = [\n      \"#gnbSheet\", \"#gnbMenu\", \"#globalNav\", \"#menuSheet\",\n      \".gnb-sheet\", \".gnb-panel\", \".global-menu\", \".menu-sheet\"\n    ];\n    for(const sel of candidates){\n      const el = q(sel);\n      if(el){\n        el.classList.remove(\"hidden\");\n        el.setAttribute(\"aria-hidden\",\"false\");\n        el.style.display = \"\";\n        return true;\n      }\n    }\n    return false;\n  }\n\n  function openGnb(){\n    const ok = clickFirst([\n      \"#gnbOpenBtn\",\n      \"#openGnbBtn\",\n      \"#openMenuBtn\",\n      \"#menuOpenBtn\",\n      \"[data-open-gnb]\",\n      \"[data-gnb-open]\",\n      \"[data-open-menu]\",\n      \".gnb-open-btn\",\n      \".open-gnb\",\n      \".menu-open-btn\",\n      \"button[aria-label='전체 메뉴']\",\n      \"button[aria-label*='전체']\",\n      \"button[aria-label*='메뉴']\"\n    ]);\n    if(!ok) openGnbFallback();\n  }\n\n  function triggerInstall(){\n    const ok = clickFirst([\n      \"#installAppBtn\",\n      \"#pwaInstallBtn\",\n      \"#quickAppBtn\",\n      \"[data-install-app]\",\n      \"[data-pwa-install]\",\n      \"[data-app-install]\",\n      \".install-btn\",\n      \".pwa-install-btn\",\n      \".quick-app-btn\",\n      \"button[aria-label*='앱으로']\",\n      \"button[aria-label*='설치']\",\n      \"button[aria-label*='빠르게']\"\n    ]);\n\n    if(!ok){\n      const appAlert = q(\"#appAlert\");\n      if(appAlert){\n        appAlert.textContent = \"브라우저 메뉴에서 홈 화면에 추가하거나 앱으로 설치할 수 있습니다.\";\n        appAlert.classList.remove(\"hidden\");\n        appAlert.setAttribute(\"aria-hidden\",\"false\");\n        setTimeout(()=>appAlert.classList.add(\"hidden\"), 2600);\n      }else{\n        alert(\"브라우저 메뉴에서 홈 화면에 추가하거나 앱으로 설치할 수 있습니다.\");\n      }\n    }\n  }\n\n  function goAI(){\n    const ok = clickFirst([\n      \"[data-view='ai']\",\n      \"[data-view-link='ai']\",\n      \".nav-btn[data-view='ai']\",\n      \".nav-btn[data-view-link='ai']\",\n      \"#goAiBtn\",\n      \"#aiMenuBtn\"\n    ]);\n    if(!ok){\n      const view = q(\"#view-ai\");\n      if(view){\n        qa(\"[id^='view-']\").forEach(v=>v.classList.add(\"hidden\"));\n        view.classList.remove(\"hidden\");\n      }\n    }\n  }\n\n  document.addEventListener(\"click\", function(e){\n    const install = e.target.closest(\"[data-upick-install], .upick-tab-header-btn.install\");\n    if(install){\n      e.preventDefault();\n      e.stopPropagation();\n      triggerInstall();\n      return;\n    }\n\n    const gnb = e.target.closest(\"[data-upick-open-gnb]\");\n    if(gnb){\n      e.preventDefault();\n      e.stopPropagation();\n      openGnb();\n      return;\n    }\n\n    const ai = e.target.closest(\"[data-upick-go='ai'], .upick-tab-header-btn.ai\");\n    if(ai){\n      e.preventDefault();\n      e.stopPropagation();\n      goAI();\n      return;\n    }\n  }, true);\n\n  // 기존 패치에서 생성한 버튼에 명시적 속성이 누락된 경우 보강\n  function normalizeButtons(){\n    qa(\".upick-tab-common-header\").forEach(header=>{\n      const btns = qa.call ? Array.from(header.querySelectorAll(\".upick-tab-header-btn\")) : [];\n      if(btns[0]){\n        btns[0].classList.add(\"profile\",\"upick-header-profile-btn\");\n        btns[0].classList.remove(\"ai\",\"install\");\n        btns[0].setAttribute(\"data-upick-profile\",\"\");\n        btns[0].removeAttribute(\"data-upick-go\");\n        btns[0].removeAttribute(\"data-upick-install\");\n        btns[0].removeAttribute(\"data-upick-open-gnb\");\n      }\n      if(btns[1]){\n        btns[1].classList.add(\"ai\");\n        btns[1].classList.remove(\"profile\",\"install\",\"upick-header-profile-btn\");\n        btns[1].setAttribute(\"data-upick-go\",\"ai\");\n        btns[1].removeAttribute(\"data-upick-profile\");\n        btns[1].removeAttribute(\"data-upick-install\");\n        btns[1].removeAttribute(\"data-upick-open-gnb\");\n      }\n      if(btns[2]){\n        btns[2].classList.add(\"install\");\n        btns[2].classList.remove(\"profile\",\"ai\",\"upick-header-profile-btn\");\n        btns[2].setAttribute(\"data-upick-install\",\"\");\n        btns[2].removeAttribute(\"data-upick-profile\");\n        btns[2].removeAttribute(\"data-upick-go\");\n        btns[2].removeAttribute(\"data-upick-open-gnb\");\n      }\n      if(btns[3]){\n        btns[3].classList.remove(\"profile\",\"ai\",\"install\",\"upick-header-profile-btn\");\n        btns[3].setAttribute(\"data-upick-open-gnb\",\"\");\n        btns[3].removeAttribute(\"data-upick-profile\");\n        btns[3].removeAttribute(\"data-upick-go\");\n        btns[3].removeAttribute(\"data-upick-install\");\n      }\n    });\n  }\n\n  if(document.readyState === \"loading\"){\n    document.addEventListener(\"DOMContentLoaded\", normalizeButtons, {once:true});\n  }else{\n    normalizeButtons();\n  }\n  setTimeout(normalizeButtons, 300);\n  setTimeout(normalizeButtons, 1000);\n})();\n"}, {"index": 29, "id": "upick-public-v28-header-button-proxy", "type": "classic", "code": "\n(function(){\n  function clickRealButton(id){\n    const btn = document.getElementById(id);\n    if(btn){\n      btn.click();\n      return true;\n    }\n    return false;\n  }\n\n  function fallbackShowView(viewId){\n    const view = document.getElementById(viewId);\n    if(!view) return false;\n    document.querySelectorAll(\"[id^='view-']\").forEach(v => v.classList.add(\"hidden\"));\n    view.classList.remove(\"hidden\");\n    return true;\n  }\n\n  document.addEventListener(\"click\", function(e){\n    const commonHeader = e.target.closest(\".upick-tab-common-header\");\n    if(!commonHeader) return;\n\n    const btn = e.target.closest(\".upick-tab-header-btn\");\n    if(!btn) return;\n\n    /* 비홈 탭 헤더 버튼은 홈 탭의 실제 작동 버튼으로 프록시 */\n    if(btn.classList.contains(\"ai\") || btn.getAttribute(\"data-upick-go\") === \"ai\"){\n      e.preventDefault();\n      e.stopPropagation();\n      if(!clickRealButton(\"aiQuickBtn\")){\n        fallbackShowView(\"view-ai\");\n      }\n      return;\n    }\n\n    if(btn.classList.contains(\"install\") || btn.hasAttribute(\"data-upick-install\")){\n      e.preventDefault();\n      e.stopPropagation();\n      if(!clickRealButton(\"installTopBtn\")){\n        const msg = \"브라우저 메뉴에서 홈 화면에 추가하거나 앱처럼 설치할 수 있습니다.\";\n        const appAlert = document.getElementById(\"appAlert\");\n        if(appAlert){\n          appAlert.textContent = msg;\n          appAlert.classList.remove(\"hidden\");\n          appAlert.setAttribute(\"aria-hidden\",\"false\");\n          setTimeout(()=>appAlert.classList.add(\"hidden\"), 2600);\n        }else{\n          alert(msg);\n        }\n      }\n      return;\n    }\n\n    if(btn.hasAttribute(\"data-upick-open-gnb\")){\n      e.preventDefault();\n      e.stopPropagation();\n      if(!clickRealButton(\"gnbToggleBtn\")){\n        document.body.classList.add(\"gnb-open\");\n        const sheet = document.querySelector(\".gnb-sheet,.gnb-panel,#gnbSheet,#gnbMenu\");\n        if(sheet){\n          sheet.classList.remove(\"hidden\");\n          sheet.setAttribute(\"aria-hidden\",\"false\");\n          sheet.style.display = \"\";\n        }\n      }\n      return;\n    }\n  }, true);\n\n  /* 혹시 기존 생성 버튼에 속성이 누락된 경우 순서 기준으로 보강 */\n  function normalizeHeaders(){\n    document.querySelectorAll(\".upick-tab-common-header\").forEach(header => {\n      const btns = Array.from(header.querySelectorAll(\".upick-tab-header-btn\"));\n      if(btns[0]){\n        btns[0].classList.add(\"profile\",\"upick-header-profile-btn\");\n        btns[0].classList.remove(\"ai\",\"install\");\n        btns[0].setAttribute(\"data-upick-profile\",\"\");\n        btns[0].removeAttribute(\"data-upick-go\");\n        btns[0].removeAttribute(\"data-upick-install\");\n        btns[0].removeAttribute(\"data-upick-open-gnb\");\n      }\n      if(btns[1]){\n        btns[1].classList.add(\"ai\");\n        btns[1].classList.remove(\"profile\",\"install\",\"upick-header-profile-btn\");\n        btns[1].setAttribute(\"data-upick-go\",\"ai\");\n        btns[1].removeAttribute(\"data-upick-profile\");\n        btns[1].removeAttribute(\"data-upick-install\");\n        btns[1].removeAttribute(\"data-upick-open-gnb\");\n      }\n      if(btns[2]){\n        btns[2].classList.add(\"install\");\n        btns[2].classList.remove(\"profile\",\"ai\",\"upick-header-profile-btn\");\n        btns[2].setAttribute(\"data-upick-install\",\"\");\n        btns[2].removeAttribute(\"data-upick-profile\");\n        btns[2].removeAttribute(\"data-upick-go\");\n        btns[2].removeAttribute(\"data-upick-open-gnb\");\n      }\n      if(btns[3]){\n        btns[3].classList.remove(\"profile\",\"ai\",\"install\",\"upick-header-profile-btn\");\n        btns[3].setAttribute(\"data-upick-open-gnb\",\"\");\n        btns[3].removeAttribute(\"data-upick-profile\");\n        btns[3].removeAttribute(\"data-upick-go\");\n        btns[3].removeAttribute(\"data-upick-install\");\n      }\n    });\n  }\n\n  if(document.readyState === \"loading\"){\n    document.addEventListener(\"DOMContentLoaded\", normalizeHeaders, {once:true});\n  }else{\n    normalizeHeaders();\n  }\n  setTimeout(normalizeHeaders, 300);\n  setTimeout(normalizeHeaders, 1000);\n\n  document.addEventListener(\"click\", function(e){\n    if(e.target.closest(\"[data-view],[data-view-link],.nav-btn,.gnb-chip,.gnb-menu-item,.gnb-menu-subitem,.all-menu-card\")){\n      setTimeout(normalizeHeaders, 120);\n    }\n  }, true);\n})();\n"}, {"index": 30, "id": "upick-v64-common-loader-orbit-copy-script", "type": "classic", "code": "\n(function(){\n  const messages = [\n    { at:0, main:'입주민 전용 서비스를 연결하고 있어요', sub:'잠시만 기다려주세요' },\n    { at:1200, main:'필요한 정보를 정리하고 있어요', sub:'더운정픽 화면을 준비 중입니다' },\n    { at:3200, main:'거의 준비가 완료되었어요', sub:'네트워크 상태에 따라 조금 더 걸릴 수 있어요' },\n    { at:5600, main:'안정적으로 불러오는 중입니다', sub:'잠시 후 자동으로 연결됩니다' }\n  ];\n  function enhance(loader){\n    if(!loader || loader.dataset.upickV64Enhanced === '1') return;\n    loader.dataset.upickV64Enhanced = '1';\n    loader.classList.add('upick-loader-enhanced');\n    let mark = loader.querySelector('.loader-mark');\n    if(!mark){\n      mark = document.createElement('div');\n      mark.className = 'loader-mark';\n      mark.setAttribute('aria-label','로딩 중');\n      mark.setAttribute('role','status');\n    }\n    let content = loader.querySelector('.loader-content');\n    if(!content){\n      content = document.createElement('div');\n      content.className = 'loader-content';\n      content.setAttribute('role','status');\n      content.setAttribute('aria-live','polite');\n      if(mark.parentNode === loader){\n        loader.insertBefore(content, mark);\n        content.appendChild(mark);\n      }else{\n        content.appendChild(mark);\n        loader.appendChild(content);\n      }\n    }\n    let copy = loader.querySelector('.loader-copy');\n    if(!copy){\n      copy = document.createElement('div');\n      copy.className = 'loader-copy';\n      copy.setAttribute('aria-hidden','true');\n      copy.innerHTML = '<p class=\"loader-message\">입주민 전용 서비스를 연결하고 있어요</p><p class=\"loader-sub-message\">잠시만 기다려주세요</p>';\n      content.appendChild(copy);\n    }\n    const main = copy.querySelector('.loader-message');\n    const sub = copy.querySelector('.loader-sub-message');\n    let timers = [];\n    function clearTimers(){ timers.forEach(clearTimeout); timers = []; }\n    function setMessage(item){\n      if(!main || !sub) return;\n      copy.classList.add('is-changing');\n      window.setTimeout(function(){\n        main.textContent = item.main;\n        sub.textContent = item.sub;\n        copy.classList.remove('is-changing');\n      }, 160);\n    }\n    function startMessages(){\n      clearTimers();\n      setMessage(messages[0]);\n      messages.slice(1).forEach(function(item){\n        timers.push(window.setTimeout(function(){ setMessage(item); }, item.at));\n      });\n    }\n    function stopMessages(){ clearTimers(); }\n    const observer = new MutationObserver(function(){\n      const visible = loader.classList.contains('show') || loader.classList.contains('is-visible') || loader.getAttribute('aria-hidden') === 'false';\n      if(visible) startMessages(); else stopMessages();\n    });\n    observer.observe(loader, { attributes:true, attributeFilter:['class','aria-hidden','style'] });\n    if(loader.classList.contains('show') || loader.classList.contains('is-visible') || loader.getAttribute('aria-hidden') === 'false') startMessages();\n  }\n  function run(){\n    ['pageLoader','globalLoadingBar'].forEach(function(id){ enhance(document.getElementById(id)); });\n    document.querySelectorAll('.page-loader,.global-loading').forEach(enhance);\n  }\n  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run, {once:true});\n  else run();\n})();\n"}, {"index": 31, "id": "upick-common-stable-loader-message-v78", "type": "classic", "code": "\n(function(){\n  const steps=[\n    {at:0,main:'입주민 전용 서비스를 연결하고 있어요',sub:'잠시만 기다려주세요'},\n    {at:1200,main:'편리한 혜택 정보를 준비하고 있어요',sub:'곧 이용하실 수 있어요'},\n    {at:3200,main:'안전하게 데이터를 확인하고 있어요',sub:'네트워크 상태에 따라 조금 더 걸릴 수 있어요'},\n    {at:5600,main:'거의 준비가 완료되었어요',sub:'잠시 후 자동으로 연결됩니다'}\n  ];\n  function ensureCopy(root){\n    if(!root) return null;\n    let copy=root.querySelector('.loader-copy');\n    if(!copy){\n      copy=document.createElement('div');\n      copy.className='loader-copy';\n      copy.setAttribute('aria-hidden','true');\n      copy.innerHTML='<p class=\"loader-message\">입주민 전용 서비스를 연결하고 있어요</p><p class=\"loader-sub-message\">잠시만 기다려주세요</p>';\n      const mark=root.querySelector('.loader-mark');\n      if(mark && mark.parentNode){\n        if(mark.parentNode.classList && mark.parentNode.classList.contains('loader-content')) mark.parentNode.appendChild(copy);\n        else root.appendChild(copy);\n      }else root.appendChild(copy);\n    }\n    return copy;\n  }\n  function bind(root){\n    if(!root || root.dataset.upickCommonLoaderBound==='1') return;\n    root.dataset.upickCommonLoaderBound='1';\n    const copy=ensureCopy(root);\n    let timers=[];\n    const setStep=(step)=>{\n      if(!copy) return;\n      const main=copy.querySelector('.loader-message');\n      const sub=copy.querySelector('.loader-sub-message');\n      copy.classList.add('is-changing');\n      setTimeout(()=>{\n        if(main) main.textContent=step.main;\n        if(sub) sub.textContent=step.sub;\n        copy.classList.remove('is-changing');\n      },140);\n    };\n    const clear=()=>{timers.forEach(clearTimeout);timers=[];};\n    const start=()=>{clear();steps.forEach(step=>timers.push(setTimeout(()=>setStep(step),step.at)));};\n    const stop=()=>clear();\n    const obs=new MutationObserver(()=>{\n      const visible=root.classList.contains('show') || root.classList.contains('is-visible') || root.getAttribute('aria-hidden')==='false';\n      visible ? start() : stop();\n    });\n    obs.observe(root,{attributes:true,attributeFilter:['class','aria-hidden']});\n    if(root.classList.contains('show') || root.classList.contains('is-visible') || root.getAttribute('aria-hidden')==='false') start();\n  }\n  function init(){document.querySelectorAll('#pageLoader,#globalLoadingBar,.page-loader,.global-loading').forEach(bind);}\n  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init,{once:true}); else init();\n})();\n"}, {"index": 32, "id": "upick-v84-public-header-actions-only", "type": "classic", "code": "\n(function(){\n  function routeTo(view){\n    var btn=document.querySelector('[data-view=\"'+view+'\"],[data-view-link=\"'+view+'\"],.nav-btn[data-view=\"'+view+'\"],.nav-btn[data-view-link=\"'+view+'\"]');\n    if(btn){ btn.click(); return true; }\n    var section=document.getElementById('view-'+view);\n    if(section){\n      document.querySelectorAll('[id^=\"view-\"]').forEach(function(el){ el.classList.add('hidden'); });\n      section.classList.remove('hidden');\n      return true;\n    }\n    return false;\n  }\n  function syncProfileImages(){\n    var srcEl=document.querySelector('#userChip .user-avatar img');\n    var src=(srcEl && srcEl.getAttribute('src')) || '/icons/internal/user.svg';\n    document.querySelectorAll('.upick-header-profile-avatar img').forEach(function(img){\n      if(img.getAttribute('src')!==src) img.setAttribute('src',src);\n    });\n  }\n  document.addEventListener('click',function(e){\n    var profile=e.target.closest('[data-upick-profile]');\n    if(profile){ e.preventDefault(); e.stopPropagation(); var chip=document.getElementById('userChip')||document.querySelector('.user-chip'); if(chip) chip.click(); return; }\n    var ai=e.target.closest('[data-upick-go=\"ai\"]');\n    if(ai){ e.preventDefault(); e.stopPropagation(); routeTo('ai'); return; }\n    var install=e.target.closest('[data-upick-install]');\n    if(install){ e.preventDefault(); e.stopPropagation(); var b=document.querySelector('#installAppBtn,[data-install-app],.install-btn,#pwaInstallBtn'); if(b && b!==install) b.click(); return; }\n    var gnb=e.target.closest('[data-upick-open-gnb]');\n    if(gnb){ e.preventDefault(); e.stopPropagation(); var b=document.querySelector('#gnbOpenBtn,#openGnbBtn,[data-open-gnb],.gnb-open-btn,#gnbToggleBtn'); if(b && b!==gnb) b.click(); return; }\n  },true);\n  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',syncProfileImages,{once:true}); else syncProfileImages();\n  window.addEventListener('load',syncProfileImages,{once:true});\n})();\n"}, {"index": 33, "id": "upick-v85-profile-image-restore-script", "type": "classic", "code": "/* disabled in v93 performance fix: handled by single global hero */"}, {"index": 34, "id": "upick-v86-profile-sync-all-tabs-script", "type": "classic", "code": "/* disabled in v93 performance fix: handled by single global hero */"}, {"index": 35, "id": "upick-v111-stable-bottom-badge-source", "type": "classic", "code": "\n(function(){\n  'use strict';\n  const rafState = { id:0 };\n  const cache = { newSet:new Set(), hotKey:'', popularKey:'', recentKey:'', stamp:0 };\n  function qs(sel, root){ return (root || document).querySelector(sel); }\n  function qsa(sel, root){ return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }\n  function norm(v){ return String(v || '').replace(/^#|^\\//,'').trim().toLowerCase(); }\n  function fixed(k){ k=norm(k); return k === 'home' || k === 'all'; }\n  function splitTokens(v){\n    const out=[];\n    if(v == null || v === false) return out;\n    if(Array.isArray(v)){ v.forEach(x => out.push(...splitTokens(x))); return out; }\n    if(typeof v === 'object'){ Object.keys(v).forEach(k => { if(v[k]) out.push(norm(k)); }); return out; }\n    String(v).split(/[\\s,|/]+/).forEach(x => { x=norm(x); if(x) out.push(x); });\n    return out;\n  }\n  function keysOf(menu){\n    if(!menu) return [];\n    return [menu.menuId, menu.id, menu.view, menu.route, menu.key, menu.slug].map(norm).filter(Boolean);\n  }\n  function keysOfEl(el){\n    if(!el) return [];\n    return [\n      el.dataset && el.dataset.viewLink,\n      el.dataset && el.dataset.view,\n      el.dataset && el.dataset.gnbDynamicMenu,\n      el.getAttribute && el.getAttribute('data-view-link'),\n      el.getAttribute && el.getAttribute('data-view'),\n      el.getAttribute && el.getAttribute('data-gnb-dynamic-menu')\n    ].map(norm).filter(Boolean);\n  }\n  function tokensOf(menu){\n    const fields = ['sections','section','tags','tag','menuSections','menuSection','placements','placement','areas','area','showIn','targets','target','badge','badges','menuBadges','menuBadge','statusBadge','ribbon','ribbonType','displayBadge','featureBadge','trendBadge'];\n    const out=[];\n    fields.forEach(f => out.push(...splitTokens(menu && menu[f])));\n    if(menu && (menu.badgeHot || menu.menuBadgeHot)) out.push('hot');\n    if(menu && (menu.badgeNew || menu.menuBadgeNew)) out.push('new');\n    if(menu && (menu.badgeUp || menu.menuBadgeUp)) out.push('up');\n    if(menu && (menu.badgeDeprecated || menu.menuBadgeDeprecated || menu.deprecated || menu.willRemove)) out.push('deprecated');\n    return out;\n  }\n  function findMenu(k){\n    k=norm(k);\n    try{\n      const menus = Array.isArray(gnbMenuCache) ? gnbMenuCache : (Array.isArray(window.gnbMenuCache) ? window.gnbMenuCache : []);\n      return menus.find(m => keysOf(m).includes(k)) || null;\n    }catch(_){ return null; }\n  }\n  function currentView(){\n    try{ if(window.state && window.state.view) return norm(window.state.view); }catch(_){ }\n    const active = qs('.bottom-nav [data-view-link].active,.bottom-nav [data-view].active');\n    return norm(active?.dataset?.viewLink || active?.dataset?.view || 'home');\n  }\n  function firstRendered(selector){\n    for(const el of qsa(selector)){\n      const k = keysOfEl(el).find(x => x && !fixed(x));\n      if(k) return k;\n    }\n    return '';\n  }\n  function readSources(){\n    const newSet = new Set();\n    const hotSet = new Set();\n    const upSet = new Set();\n    const deprecatedSet = new Set();\n    let hotKey = '';\n    let recentKey = '';\n\n    try{\n      const menus = Array.isArray(gnbMenuCache) ? gnbMenuCache : (Array.isArray(window.gnbMenuCache) ? window.gnbMenuCache : []);\n      menus.forEach(m => {\n        const t = tokensOf(m);\n        if(t.includes('new')) keysOf(m).forEach(k => { if(!fixed(k)) newSet.add(k); });\n        if(t.includes('hot')) keysOf(m).forEach(k => { if(!fixed(k)) hotSet.add(k); });\n        if(t.includes('up')) keysOf(m).forEach(k => { if(!fixed(k)) upSet.add(k); });\n        if(t.includes('deprecated') || t.includes('delete') || t.includes('ending')) keysOf(m).forEach(k => { if(!fixed(k)) deprecatedSet.add(k); });\n      });\n    }catch(_){ }\n\n    // GNB의 \"새로 나온 메뉴\" 렌더 결과도 보조 소스로 사용합니다. 단, source가 비어있을 때만 보정합니다.\n    qsa('#gnbNewMenus [data-view-link],#gnbNewMenus [data-gnb-dynamic-menu]').forEach(el => {\n      keysOfEl(el).forEach(k => { if(!fixed(k)) newSet.add(k); });\n    });\n\n    try{\n      const stats = (typeof popularGnbStatsMap !== 'undefined') ? popularGnbStatsMap : window.popularGnbStatsMap;\n      if(stats && typeof stats.forEach === 'function'){\n        let best = null;\n        stats.forEach((stat, id) => {\n          const k = norm((stat && (stat.menuId || stat.id || stat.view || stat.route)) || id);\n          const c = Number((stat && (stat.totalClickCount || stat.clickCount || stat.count || stat.viewCount || stat.cardClickCount)) || 0);\n          if(k && !fixed(k) && c > 0 && (!best || c > best.count)) best = { key:k, count:c };\n        });\n        if(best) hotKey = best.key;\n      }\n    }catch(_){ }\n    if(!hotKey){\n      try{\n        const set = (typeof popularGnbMenuIdSet !== 'undefined') ? popularGnbMenuIdSet : window.popularGnbMenuIdSet;\n        hotKey = Array.from(set || []).map(norm).find(k => k && !fixed(k)) || '';\n      }catch(_){ }\n    }\n    // GNB 인기 메뉴에 실제로 보이는 1순위가 있으면 최종 화면 기준으로 우선합니다.\n    hotKey = firstRendered('#gnbPopularMenus [data-view-link],#gnbPopularMenus [data-gnb-dynamic-menu]') || hotKey;\n    recentKey = firstRendered('#gnbRecentMenus [data-view-link],#gnbRecentMenus [data-gnb-dynamic-menu]') || '';\n\n    if(!hotKey) hotKey = Array.from(hotSet).find(k => k && !fixed(k)) || '';\n    cache.newSet = newSet;\n    cache.hotSet = hotSet;\n    cache.upSet = upSet;\n    cache.deprecatedSet = deprecatedSet;\n    cache.hotKey = hotKey;\n    cache.popularKey = hotKey;\n    cache.recentKey = recentKey;\n    cache.stamp = Date.now();\n    return cache;\n  }\n  function flags(keys){\n    const src = readSources();\n    keys = (Array.isArray(keys) ? keys : [keys]).map(norm).filter(Boolean);\n    return {\n      new: keys.some(k => src.newSet.has(k)),\n      hot: keys.some(k => src.hotSet && src.hotSet.has(k)) || (!!src.hotKey && keys.includes(src.hotKey)),\n      up: keys.some(k => src.upSet && src.upSet.has(k)),\n      deprecated: keys.some(k => src.deprecatedSet && src.deprecatedSet.has(k)),\n      popular: !!src.popularKey && keys.includes(src.popularKey),\n      recent: !!src.recentKey && keys.includes(src.recentKey)\n    };\n  }\n  function flagsForMenu(menu){ return flags(keysOf(menu)); }\n  function flagsForView(v){\n    const k = norm(v);\n    const menu = findMenu(k);\n    return flags(menu ? keysOf(menu) : [k]);\n  }\n  function ensureText(el, text){ if(el && el.textContent !== text) el.textContent = text; }\n  function ensureClass(el, cls){ if(el && el.className !== cls) el.className = cls; }\n  function setHtml(el, html){ if(el && el.__upickV109Html !== html){ el.innerHTML = html; el.__upickV109Html = html; } }\n\n  function decorateAllCard(card){\n    const k = keysOfEl(card)[0];\n    if(!k) return;\n    const f = flagsForView(k);\n    let ribbon = card.querySelector(':scope > .all-menu-ribbon, :scope > .menu-trend-ribbon');\n    const label = f.hot ? 'HOT' : (f.new ? 'NEW' : '');\n    if(label){\n      if(!ribbon){ ribbon=document.createElement('span'); card.insertAdjacentElement('afterbegin', ribbon); }\n      ensureClass(ribbon, 'all-menu-ribbon ' + (f.hot ? 'new-source-trending' : 'new-source-manual'));\n      ensureText(ribbon, label);\n    }else if(ribbon){ ribbon.remove(); }\n\n    let wrap = card.querySelector(':scope > .all-menu-badge-wrap, :scope > .menu-trend-badge-wrap');\n    let html = '';\n    if(f.up) html += '<span class=\"all-menu-badge up\">UP</span>';\n    if(f.deprecated) html += '<span class=\"all-menu-badge deprecated\">종료 예정</span>';\n    if(f.popular) html += '<span class=\"all-menu-badge popular\">인기</span>';\n    if(f.recent) html += '<span class=\"all-menu-badge recent\">최근</span>';\n    if(html){\n      if(!wrap){ wrap=document.createElement('span'); wrap.className='all-menu-badge-wrap'; card.insertAdjacentElement('afterbegin', wrap); }\n      setHtml(wrap, html);\n    }else if(wrap){ wrap.remove(); }\n  }\n  function decorateAll(){ qsa('#allMenuGrid .all-menu-card').forEach(decorateAllCard); }\n  function navBadgeStateForView(view){\n    const f = flagsForView(view);\n    if(f.deprecated) return { label:'', cls:'deprecated' };\n    if(f.up) return { label:'', cls:'up' };\n    if(f.hot) return { label:'', cls:'hot' };\n    if(f.new) return { label:'', cls:'new' };\n    return { label:'', cls:'' };\n  }\n  function upsertNavDot(btn, cls){\n    const existing = btn.querySelector(':scope > .nav-robot-trend-badge, :scope > .nav-badge-dot, :scope > .nav-final-trend-badge, :scope > .nav-mini-trend');\n    const nextState = cls || '';\n    if(btn.__upickBottomBadgeState === nextState && existing) return;\n    btn.__upickBottomBadgeState = nextState;\n    btn.querySelectorAll(':scope > .nav-robot-trend-badge, :scope > .nav-badge-dot, :scope > .nav-final-trend-badge, :scope > .nav-mini-trend, :scope > .menu-trend-ribbon, :scope > .menu-trend-badge-wrap').forEach(el => el.remove());\n    if(!cls) return;\n    const dot = document.createElement('span');\n    dot.className = 'nav-robot-trend-badge ' + cls;\n    dot.setAttribute('aria-hidden','true');\n    btn.insertAdjacentElement('afterbegin', dot);\n  }\n  function decorateBottom(){\n    qsa('.bottom-nav [data-view-link], .bottom-nav [data-view]').forEach(btn => {\n      const view = norm(btn.dataset?.viewLink || btn.dataset?.view || '');\n      if(!view || fixed(view)) { upsertNavDot(btn, ''); return; }\n      const st = navBadgeStateForView(view);\n      upsertNavDot(btn, st.cls);\n    });\n  }\n  window.__upickStableBottomBadge = decorateBottom;\n  window.__upickGlobalHeroRefresh = function(){\n    try{ createHero(); apply(getCurrentView()); syncProfileOnce(); }catch(_){ }\n  };\n  function decorateHero(view){\n    const hero = qs('#upickGlobalHero');\n    if(!hero) return;\n    const f = flagsForView(view || currentView());\n    const parts=[];\n    if(f.hot) parts.push('<span class=\"global-hero-trend-badge hot\">HOT</span>');\n    else if(f.new) parts.push('<span class=\"global-hero-trend-badge new\">NEW</span>');\n    if(f.up) parts.push('<span class=\"global-hero-trend-badge up\">UP</span>');\n    if(f.deprecated) parts.push('<span class=\"global-hero-trend-badge deprecated\">종료 예정</span>');\n    if(f.popular) parts.push('<span class=\"global-hero-trend-badge popular\">인기</span>');\n    if(f.recent) parts.push('<span class=\"global-hero-trend-badge recent\">최근</span>');\n    let wrap = qs('.global-hero-trend-badges', hero);\n    const html = parts.join('');\n    if(html){\n      if(!wrap){\n        wrap=document.createElement('span');\n        wrap.className='global-hero-trend-badges';\n        const target=qs('#globalHeroKicker', hero) || qs('.eyebrow', hero);\n        if(target) target.insertAdjacentElement('afterend', wrap);\n      }\n      setHtml(wrap, html);\n    }else if(wrap){ wrap.remove(); }\n  }\n  function syncProfile(){\n    const hero=qs('#upickGlobalHero'); if(!hero) return;\n    const img=qs('#globalUserChip .user-avatar img', hero); if(!img) return;\n    let src='';\n    try{ const p=window.state && window.state.currentUserProfile; src = (p && (p.profileImageUrl || p.photoUrl || p.avatarUrl)) || ''; }catch(_){ }\n    const source=qs('#userChip .user-avatar img');\n    src = src || source?.getAttribute('src') || '/icons/internal/user.svg';\n    if(img.getAttribute('src') !== src) img.setAttribute('src', src);\n    qs('#globalUserChip .user-avatar', hero)?.classList.toggle('has-photo', !/user\\.svg|avatar-default|default/i.test(src));\n  }\n  function syncStats(){\n    const hero=qs('#upickGlobalHero'); if(!hero) return;\n    const pairs=[['#globalStatMax','#statMax,#statMaxDiscount'],['#globalStatCount','#statCount,#statBenefitCount'],['#globalStatCat','#statCat,#statCategoryCount']];\n    pairs.forEach(([a,b])=>{ const dest=qs(a,hero); const src=qs(b); if(dest && src && src.textContent && dest.textContent !== src.textContent) dest.textContent=src.textContent; });\n  }\n  function apply(view){ syncProfile(); syncStats(); decorateAll(); decorateBottom(); decorateHero(view); }\n  function schedule(view){\n    window.__upickLastBadgeView = view || window.__upickLastBadgeView || currentView();\n    if(rafState.id) return;\n    rafState.id = requestAnimationFrame(() => {\n      rafState.id = 0;\n      apply(window.__upickLastBadgeView || currentView());\n    });\n  }\n\n  // 렌더 함수에서 바로 동일한 기준을 쓰도록 helper를 고정합니다.\n  window.isMenuNew = function(menu){ return !!flagsForMenu(menu).new; };\n  window.isTrendingMenu = function(menu){ return !!flagsForMenu(menu).hot; };\n  window.getMenuTrendFlags = function(menu){ const f=flagsForMenu(menu); return {isNew:f.new,isHot:f.hot,isUp:f.up,isDeprecated:f.deprecated,isPopular:f.popular,isRecent:f.recent}; };\n  window.makeNewRibbonHtml = function(baseClass, menu){ const f=flagsForMenu(menu); if(f.hot) return '<span class=\"'+(baseClass||'all-menu-ribbon')+' new-source-trending\">HOT</span>'; if(f.new) return '<span class=\"'+(baseClass||'all-menu-ribbon')+' new-source-manual\">NEW</span>'; return ''; };\n  window.getAllMenuBadge = function(menu){ const f=flagsForMenu(menu), a=[]; if(f.up)a.push({label:'UP',className:'up'}); if(f.deprecated)a.push({label:'종료 예정',className:'deprecated'}); if(f.popular)a.push({label:'인기',className:'popular'}); if(f.recent)a.push({label:'최근',className:'recent'}); return a; };\n  window.upickFinalBadgeSync = schedule;\n  window.decorateAllMenuCards = decorateAll;\n  window.syncBottomNavDotBadgesFinal = decorateBottom;\n  window.syncBottomNavTrendBadgesFinal = decorateBottom;\n\n  // changeView 이후 현재 view 기준으로 히어로/하단/전체 메뉴 배지를 즉시 동기화합니다.\n  try{\n    const oldChangeView = window.changeView || (typeof changeView !== 'undefined' ? changeView : null);\n    if(typeof oldChangeView === 'function' && !oldChangeView.__upickV109){\n      const wrapped = function(nextView){\n        const r = oldChangeView.apply(this, arguments);\n        schedule(nextView || currentView());\n        return r;\n      };\n      wrapped.__upickV109 = true;\n      try{ changeView = wrapped; }catch(_){ }\n      window.changeView = wrapped;\n    }\n  }catch(_){ }\n\n  document.addEventListener('click', function(e){\n    const t = e.target && e.target.closest && e.target.closest('[data-view],[data-view-link],[data-gnb-dynamic-menu],.nav-btn,.all-menu-card,.gnb-menu-item,.gnb-menu-subitem,.gnb-chip');\n    if(!t) return;\n    const v = t.dataset && (t.dataset.viewLink || t.dataset.view || t.dataset.gnbDynamicMenu);\n    schedule(v || currentView());\n  }, true);\n\n  document.addEventListener('upick:view-change', e => schedule((e.detail && e.detail.view) || currentView()));\n  window.addEventListener('load', () => { schedule(currentView()); setTimeout(() => schedule(currentView()), 900); }, {once:true});\n  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => schedule(currentView()), {once:true});\n  else schedule(currentView());\n})();\n"}, {"index": 36, "id": "upick-v112-common-hero-header-order-fix", "type": "classic", "code": "\n(function(){\n  function qsa(sel, root){ return Array.prototype.slice.call((root||document).querySelectorAll(sel)); }\n  function isProfile(btn){ return btn.matches('[data-upick-profile],.profile,.upick-header-profile-btn') || !!btn.querySelector('.upick-header-profile-avatar'); }\n  function isAi(btn){\n    const src = (btn.querySelector('img')||{}).getAttribute ? ((btn.querySelector('img')||{}).getAttribute('src')||'') : '';\n    return btn.matches('[data-upick-go=\"ai\"],.ai') || /ai-assistant|robot|assistant/i.test(src);\n  }\n  function isGnb(btn){\n    const src = (btn.querySelector('img')||{}).getAttribute ? ((btn.querySelector('img')||{}).getAttribute('src')||'') : '';\n    return btn.matches('[data-upick-open-gnb]') || /all-menu|menu|gnb/i.test(src) || (btn.getAttribute('aria-label')||'').includes('전체');\n  }\n  function normalizeHeader(header){\n    if(!header || header.dataset.v112HeaderFixed === '1') return;\n    const brand = header.querySelector('.upick-tab-brand-block');\n    const buttons = qsa('.upick-tab-header-btn,button', header).filter(function(b){ return !b.closest('.upick-tab-brand-block'); });\n    let profile = buttons.find(isProfile);\n    let ai = buttons.find(isAi);\n    let gnb = buttons.find(isGnb);\n    const install = buttons.find(function(b){ return b.matches('[data-upick-install],.install') || /install/i.test(((b.querySelector('img')||{}).src||'')); });\n    if(install) install.style.display = 'none';\n    if(profile){ profile.classList.add('profile','upick-header-profile-btn'); profile.setAttribute('data-upick-profile',''); }\n    if(ai){ ai.classList.add('ai'); ai.setAttribute('data-upick-go','ai'); ai.removeAttribute('data-upick-open-gnb'); }\n    if(gnb){ gnb.classList.remove('ai','profile','install','upick-header-profile-btn'); gnb.setAttribute('data-upick-open-gnb',''); gnb.removeAttribute('data-upick-go'); gnb.removeAttribute('data-upick-profile'); }\n    if(brand){\n      header.appendChild(brand);\n      if(profile) header.appendChild(profile);\n      if(ai) header.appendChild(ai);\n      if(gnb) header.appendChild(gnb);\n    }\n    header.dataset.v112HeaderFixed = '1';\n  }\n  function run(){ qsa('.upick-tab-common-header').forEach(function(h){ h.dataset.v112HeaderFixed=''; normalizeHeader(h); }); }\n  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run, {once:true}); else run();\n  window.addEventListener('load', run, {once:true});\n  document.addEventListener('click', function(e){\n    if(e.target.closest('[data-view],[data-view-link],.nav-btn,.gnb-menu-item,.gnb-menu-subitem,.all-menu-card,[data-upick-open-gnb]')){\n      requestAnimationFrame(run);\n      setTimeout(run, 80);\n    }\n  }, true);\n})();\n"}, {"index": 37, "id": "upick-v16-watermark-stats-fix-script", "type": "classic", "code": "\n(function(){\n  function qs(s,r){return (r||document).querySelector(s)}\n  function qsa(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))}\n  function toNumber(v){\n    var n=Number(v);\n    return Number.isFinite(n)?n:0;\n  }\n  function visibleBenefits(){\n    try{\n      if(typeof window.getVisibleBenefits === 'function') return window.getVisibleBenefits() || [];\n    }catch(_){ }\n    try{\n      if(window.state && Array.isArray(window.state.benefits)){\n        return window.state.benefits.filter(function(v){ return v && v.visible !== false && v.hidden !== true; });\n      }\n    }catch(_){ }\n    try{\n      if(Array.isArray(window.benefits)) return window.benefits.filter(function(v){return v && v.visible !== false && v.hidden !== true;});\n    }catch(_){ }\n    return [];\n  }\n  function calcStats(){\n    var items=visibleBenefits();\n    var max=0;\n    var cats=new Set();\n    items.forEach(function(v){\n      var d=toNumber(v.discountValue || v.discount || v.discountRate || v.maxDiscount || 0);\n      if(d>max) max=d;\n      var c=(v.category || v.mainCategory || v.type || '').toString().trim();\n      if(c) cats.add(c);\n    });\n    return {max:max, count:items.length, cat:cats.size};\n  }\n  function setText(sel,val){ var el=qs(sel); if(el && el.textContent!==String(val)) el.textContent=String(val); }\n  function ensureWatermark(){\n    var hero=qs('#upickGlobalHero .hero');\n    if(!hero) return;\n    var wm=qs('.upick-hero-watermark', hero);\n    if(!wm){\n      wm=document.createElement('img');\n      wm.className='upick-hero-watermark';\n      wm.src='/icons/internal/brand-symbol-real.png';\n      wm.alt='';\n      wm.setAttribute('aria-hidden','true');\n      wm.loading='lazy';\n      hero.insertBefore(wm, hero.firstChild);\n    }\n  }\n  function syncStats(){\n    var s=calcStats();\n    if(s.count>0 || s.max>0 || s.cat>0){\n      setText('#globalStatMax', s.max + '%');\n      setText('#globalStatCount', s.count);\n      setText('#globalStatCat', s.cat);\n      setText('#statMax', s.max + '%');\n      setText('#statCount', s.count);\n      setText('#statCat', s.cat);\n    }else{\n      var pairs=[['#globalStatMax','#statMax,#statMaxDiscount'],['#globalStatCount','#statCount,#statBenefitCount'],['#globalStatCat','#statCat,#statCategoryCount']];\n      pairs.forEach(function(p){\n        var dest=qs(p[0]), src=qs(p[1]);\n        if(dest && src && src.textContent && src.textContent.trim()) dest.textContent=src.textContent;\n      });\n    }\n  }\n  function apply(){ ensureWatermark(); syncStats(); }\n  window.upickSyncHeroStatsAndWatermark=apply;\n  document.addEventListener('DOMContentLoaded', function(){\n    apply();\n    setTimeout(apply, 100);\n    setTimeout(apply, 400);\n    setTimeout(apply, 1000);\n    setTimeout(apply, 1800);\n  });\n  window.addEventListener('load', function(){ setTimeout(apply,80); setTimeout(apply,700); });\n  var oldRender=window.renderStats;\n  if(typeof oldRender === 'function'){\n    window.renderStats=function(){\n      var r=oldRender.apply(this, arguments);\n      try{ apply(); }catch(_){ }\n      return r;\n    };\n  }\n  var oldRenderAll=window.renderAll;\n  if(typeof oldRenderAll === 'function'){\n    window.renderAll=function(){\n      var r=oldRenderAll.apply(this, arguments);\n      try{ setTimeout(apply,0); }catch(_){ }\n      return r;\n    };\n  }\n  var mo=new MutationObserver(function(){\n    if(!document.__upickV16Pending){\n      document.__upickV16Pending=true;\n      requestAnimationFrame(function(){document.__upickV16Pending=false; apply();});\n    }\n  });\n  document.addEventListener('DOMContentLoaded', function(){\n    var root=qs('#upickGlobalHero') || document.body;\n    try{ mo.observe(root,{childList:true,subtree:true,characterData:true}); }catch(_){ }\n  });\n})();\n"}, {"index": 38, "id": "", "type": "classic", "code": "\n(function(){\n  const ACTIVE_MAP = {\n    like: 'active-like',\n    recommend: 'active-recommend',\n    hot: 'active-hot'\n  };\n\n  function bindReactionButtons(){\n    const buttons = document.querySelectorAll('.reaction-btn');\n\n    buttons.forEach((btn, idx) => {\n      let type = 'like';\n\n      const txt = (btn.textContent || '').trim();\n\n      if(txt.includes('추천')) type = 'recommend';\n      else if(txt.includes('HOT')) type = 'hot';\n\n      const storageKey = 'upick_reaction_' + type + '_' + idx;\n\n      // 초기 상태 복원\n      if(localStorage.getItem(storageKey) === '1'){\n        btn.classList.add(ACTIVE_MAP[type]);\n      }\n\n      // 중복 바인딩 방지\n      if(btn.dataset.reactionBound === '1') return;\n      btn.dataset.reactionBound = '1';\n\n      btn.addEventListener('click', function(e){\n        setTimeout(() => {\n          const isActive = btn.classList.contains(ACTIVE_MAP[type]);\n\n          if(isActive){\n            btn.classList.remove(ACTIVE_MAP[type]);\n            localStorage.removeItem(storageKey);\n          }else{\n            btn.classList.add(ACTIVE_MAP[type]);\n            localStorage.setItem(storageKey, '1');\n          }\n        }, 0);\n      });\n    });\n  }\n\n  if(document.readyState === 'loading'){\n    document.addEventListener('DOMContentLoaded', bindReactionButtons);\n  }else{\n    bindReactionButtons();\n  }\n\n  // modal 재렌더링 대응\n  const observer = new MutationObserver(() => {\n    bindReactionButtons();\n  });\n\n  observer.observe(document.body, {\n    childList: true,\n    subtree: true\n  });\n})();\n"}, {"index": 39, "id": "upick-share-text-normalizer-v2", "type": "classic", "code": "\n(function(){\n  function normalizeShareButtons(){\n    document.querySelectorAll('#detailModal .share-actions button, #detailModal .share-actions .btn, #noticeModal .share-actions button, #noticeModal .share-actions .btn, #noticeModal .notice-detail-actions button, #noticeModal .notice-detail-actions .btn, .modal .share-actions button, .modal .share-actions .btn').forEach((btn) => {\n      const text = (btn.textContent || '').replace(/\\s+/g, ' ').trim();\n\n      if(/혜택 공유 준비 중|공지 공유 준비 중|카카오톡 열 준비 중/.test(text)){\n        // 기존 스피너는 유지하고 문구만 짧게 변경\n        const nodes = Array.from(btn.childNodes);\n        const textNode = nodes.find(n => n.nodeType === Node.TEXT_NODE && n.textContent.trim());\n        if(textNode){\n          textNode.textContent = ' 공유 준비 중';\n        }else{\n          const label = Array.from(btn.querySelectorAll('span,b,strong,em')).find(el => /혜택 공유 준비 중|공지 공유 준비 중|카카오톡 열 준비 중/.test(el.textContent || ''));\n          if(label) label.textContent = '공유 준비 중';\n        }\n      }\n\n      // 같은 버튼 내부 스피너 중복은 실제 DOM에서도 제거\n      const spinners = btn.querySelectorAll('.share-spinner, .btn-spinner, .loading-spinner');\n      spinners.forEach((spinner, idx) => {\n        if(idx > 0) spinner.remove();\n      });\n    });\n  }\n\n  document.addEventListener('click', () => {\n    setTimeout(normalizeShareButtons, 0);\n    setTimeout(normalizeShareButtons, 80);\n    setTimeout(normalizeShareButtons, 180);\n  }, true);\n\n  const observer = new MutationObserver(normalizeShareButtons);\n  if(document.body){\n    observer.observe(document.body, {childList:true, subtree:true, characterData:true});\n  }\n\n  if(document.readyState === 'loading'){\n    document.addEventListener('DOMContentLoaded', normalizeShareButtons);\n  }else{\n    normalizeShareButtons();\n  }\n})();\n"}, {"index": 40, "id": "upick-notice-share-one-line-v6-js", "type": "classic", "code": "\n(function(){\n  function forceNoticeShareOneLine(){\n    const modal = document.querySelector('#noticeModal');\n    if(!modal) return;\n\n    const wrappers = modal.querySelectorAll('.notice-detail-actions');\n    wrappers.forEach((wrap) => {\n      wrap.style.setProperty('display', 'block', 'important');\n      wrap.style.setProperty('width', '100%', 'important');\n      wrap.style.setProperty('max-width', '100%', 'important');\n      wrap.style.setProperty('min-width', '0', 'important');\n      wrap.style.setProperty('margin', '12px 0 0', 'important');\n      wrap.style.setProperty('padding', '0', 'important');\n      wrap.style.setProperty('overflow', 'visible', 'important');\n    });\n\n    const groups = modal.querySelectorAll('.notice-detail-actions > .share-actions, .share-actions');\n    groups.forEach((group) => {\n      group.style.setProperty('display', 'grid', 'important');\n      group.style.setProperty('grid-template-columns', 'repeat(3, minmax(0, 1fr))', 'important');\n      group.style.setProperty('gap', '7px', 'important');\n      group.style.setProperty('width', '100%', 'important');\n      group.style.setProperty('max-width', '100%', 'important');\n      group.style.setProperty('min-width', '0', 'important');\n      group.style.setProperty('margin', '0', 'important');\n      group.style.setProperty('padding', '0', 'important');\n      group.style.setProperty('overflow', 'visible', 'important');\n      group.style.setProperty('align-items', 'stretch', 'important');\n\n      Array.from(group.children).forEach((btn) => {\n        btn.style.setProperty('display', 'flex', 'important');\n        btn.style.setProperty('align-items', 'center', 'important');\n        btn.style.setProperty('justify-content', 'center', 'important');\n        btn.style.setProperty('width', '100%', 'important');\n        btn.style.setProperty('max-width', '100%', 'important');\n        btn.style.setProperty('min-width', '0', 'important');\n        btn.style.setProperty('height', '44px', 'important');\n        btn.style.setProperty('min-height', '44px', 'important');\n        btn.style.setProperty('max-height', '44px', 'important');\n        btn.style.setProperty('padding', '0 4px', 'important');\n        btn.style.setProperty('box-sizing', 'border-box', 'important');\n        btn.style.setProperty('border-radius', '16px', 'important');\n        btn.style.setProperty('white-space', 'nowrap', 'important');\n        btn.style.setProperty('overflow', 'hidden', 'important');\n        btn.style.setProperty('text-overflow', 'ellipsis', 'important');\n        btn.style.setProperty('font-size', '11px', 'important');\n        btn.style.setProperty('font-weight', '900', 'important');\n        btn.style.setProperty('line-height', '1', 'important');\n        btn.style.setProperty('letter-spacing', '-.05em', 'important');\n        btn.style.setProperty('gap', '4px', 'important');\n      });\n    });\n  }\n\n  document.addEventListener('click', function(e){\n    if(e.target.closest('[data-notice-id], .notice-card, .notice-item, #noticeList, #noticeModal')){\n      setTimeout(forceNoticeShareOneLine, 0);\n      setTimeout(forceNoticeShareOneLine, 80);\n      setTimeout(forceNoticeShareOneLine, 200);\n      setTimeout(forceNoticeShareOneLine, 500);\n    }\n  }, true);\n\n  const observer = new MutationObserver(forceNoticeShareOneLine);\n  if(document.body){\n    observer.observe(document.body, { childList:true, subtree:true, attributes:true, attributeFilter:['open', 'class', 'style'] });\n  }\n\n  if(document.readyState === 'loading'){\n    document.addEventListener('DOMContentLoaded', forceNoticeShareOneLine);\n  }else{\n    forceNoticeShareOneLine();\n  }\n})();\n"}, {"index": 41, "id": "upick-distance-filter-walk-v17-js", "type": "classic", "code": "\n(function(){\n  const WALK_ICON = '/icons/internal/walk.svg';\n\n  function removeWrongChipIcons(){\n    document.querySelectorAll(\n      '#view-benefits .filter-sticky .chips .chip-all-resident-icon, ' +\n      '#view-benefits .filter-sticky .chips .chip-all-person-icon, ' +\n      '#view-benefits .filter-sticky .chips .chip-all-resident-icon-removed, ' +\n      '#view-benefits .filter-sticky .chips .chip-all-person-icon-removed'\n    ).forEach(el => el.remove());\n  }\n\n  function isDistanceFilterText(text){\n    const t = String(text || '').replace(/\\s+/g, ' ').trim();\n    return t === '전체' ||\n           t === '500m' ||\n           t === '500m 이내' ||\n           t === '1km 이내' ||\n           t === '3km 이내';\n  }\n\n  function applyDistanceFilterWalkIcon(){\n    removeWrongChipIcons();\n\n    const root = document.querySelector('#view-benefits .filter-sticky') || document;\n\n    root.querySelectorAll('button, [role=\"button\"], .chip, .filter-chip, .dropdown-item, [role=\"option\"]').forEach((el) => {\n      const text = (el.textContent || '').replace(/\\s+/g, ' ').trim();\n\n      if(!isDistanceFilterText(text)) return;\n\n      // 카테고리 칩의 \"전체 30\" / \"전체 0\" 쪽은 제외\n      if(el.closest('.chips') && /^전체\\s*\\d+/.test(text)) return;\n\n      if(el.querySelector('.distance-filter-walk-icon')) return;\n\n      const img = document.createElement('img');\n      img.className = 'distance-filter-walk-icon';\n      img.src = WALK_ICON;\n      img.alt = '';\n      img.loading = 'lazy';\n      img.decoding = 'async';\n\n      el.insertBefore(img, el.firstChild);\n    });\n  }\n\n  function run(){\n    applyDistanceFilterWalkIcon();\n  }\n\n  document.addEventListener('click', () => {\n    setTimeout(run, 0);\n    setTimeout(run, 80);\n    setTimeout(run, 180);\n    setTimeout(run, 350);\n  }, true);\n\n  const observer = new MutationObserver(run);\n  if(document.body){\n    observer.observe(document.body, {childList:true, subtree:true});\n  }\n\n  if(document.readyState === 'loading'){\n    document.addEventListener('DOMContentLoaded', run);\n  }else{\n    run();\n  }\n})();\n"}, {"index": 42, "id": "upick-benefit-detail-photo-final-v9-js", "type": "classic", "code": "\n(function(){\n  let retryTimer = null;\n  let applyTimer = null;\n\n  function getModal(){\n    return document.getElementById('detailModal');\n  }\n\n  function ensureViewer(){\n    const modal = getModal();\n    if(!modal) return null;\n\n    let viewer = modal.querySelector('#benefitPhotoZoomViewer');\n    if(viewer) return viewer;\n\n    viewer = document.createElement('div');\n    viewer.id = 'benefitPhotoZoomViewer';\n    viewer.innerHTML = [\n      '<div class=\"photo-viewer-card\" role=\"dialog\" aria-modal=\"true\" aria-label=\"대표 사진 확대 보기\">',\n        '<div class=\"photo-viewer-head\">',\n          '<div class=\"photo-viewer-title\">대표 사진</div>',\n          '<button type=\"button\" class=\"photo-viewer-close\" aria-label=\"닫기\">×</button>',\n        '</div>',\n        '<div class=\"photo-viewer-body\">',\n          '<img alt=\"대표 사진 확대 보기\">',\n        '</div>',\n      '</div>'\n    ].join('');\n\n    modal.appendChild(viewer);\n\n    viewer.addEventListener('click', function(e){\n      if(e.target === viewer || e.target.closest('.photo-viewer-close')){\n        closeViewer();\n      }\n    });\n\n    return viewer;\n  }\n\n  function isImageReady(img){\n    return !!(img && img.complete && img.naturalWidth > 0 && img.naturalHeight > 0);\n  }\n\n  function applyBenefitPhotoUI(){\n    const modal = getModal();\n    if(!modal) return false;\n\n    const photo = modal.querySelector('.benefit-detail-photo');\n    if(!photo) return false;\n\n    photo.querySelectorAll('.benefit-detail-photo-badge').forEach(el => el.remove());\n\n    if(!photo.querySelector('.benefit-photo-zoom-icon')){\n      const icon = document.createElement('span');\n      icon.className = 'benefit-photo-zoom-icon';\n      icon.setAttribute('aria-hidden', 'true');\n      photo.appendChild(icon);\n    }\n\n    const img = photo.querySelector('img');\n\n    photo.setAttribute('role', 'button');\n    photo.setAttribute('tabindex', '0');\n    photo.setAttribute('aria-label', '대표 사진 확대 보기');\n\n    if(isImageReady(img)){\n      photo.classList.add('is-photo-ready');\n      photo.dataset.photoReady = '1';\n      return true;\n    }\n\n    photo.classList.remove('is-photo-ready');\n    photo.dataset.photoReady = '0';\n\n    if(img && !img.dataset.upickZoomLoadBound){\n      img.dataset.upickZoomLoadBound = '1';\n      img.addEventListener('load', function(){\n        requestAnimationFrame(applyBenefitPhotoUI);\n      }, { once:true });\n      img.addEventListener('error', function(){\n        photo.classList.remove('is-photo-ready');\n        photo.dataset.photoReady = '0';\n      }, { once:true });\n    }\n\n    return false;\n  }\n\n  function scheduleApply(){\n    clearTimeout(applyTimer);\n    requestAnimationFrame(applyBenefitPhotoUI);\n    applyTimer = setTimeout(applyBenefitPhotoUI, 120);\n  }\n\n  function startShortRetry(){\n    clearInterval(retryTimer);\n\n    let count = 0;\n    retryTimer = setInterval(function(){\n      count += 1;\n      const done = applyBenefitPhotoUI();\n\n      if(done || count >= 30){\n        clearInterval(retryTimer);\n        retryTimer = null;\n      }\n    }, 180);\n  }\n\n  function openViewer(src, title){\n    if(!src) return;\n\n    const viewer = ensureViewer();\n    if(!viewer) return;\n\n    const img = viewer.querySelector('.photo-viewer-body img');\n    const titleEl = viewer.querySelector('.photo-viewer-title');\n\n    img.src = src;\n    titleEl.textContent = title ? title + ' 대표 사진' : '대표 사진';\n\n    viewer.classList.add('show');\n    document.documentElement.classList.add('benefit-photo-viewer-open');\n  }\n\n  function closeViewer(){\n    const modal = getModal();\n    const viewer = modal ? modal.querySelector('#benefitPhotoZoomViewer') : null;\n    if(!viewer) return;\n\n    viewer.classList.remove('show');\n    const img = viewer.querySelector('.photo-viewer-body img');\n    if(img) img.removeAttribute('src');\n    document.documentElement.classList.remove('benefit-photo-viewer-open');\n    scheduleApply();\n  }\n\n  document.addEventListener('click', function(e){\n    const photo = e.target && e.target.closest ? e.target.closest('#detailModal .benefit-detail-photo') : null;\n    if(!photo) return;\n\n    const img = photo.querySelector('img');\n\n    // 이미지 렌더링 완료 전에는 확대 차단\n    if(!isImageReady(img) || !photo.classList.contains('is-photo-ready')){\n      e.preventDefault();\n      e.stopPropagation();\n      scheduleApply();\n      startShortRetry();\n      return;\n    }\n\n    e.preventDefault();\n    e.stopPropagation();\n\n    const titleEl = document.querySelector('#detailModal h1, #detailModal h2, #detailModal h3, #detailModal .benefit-title');\n    openViewer(img.currentSrc || img.src, titleEl ? titleEl.textContent.trim() : '');\n  }, true);\n\n  document.addEventListener('keydown', function(e){\n    if(e.key === 'Escape'){\n      closeViewer();\n      return;\n    }\n\n    const photo = e.target && e.target.closest ? e.target.closest('#detailModal .benefit-detail-photo') : null;\n    if(!photo) return;\n    if(e.key !== 'Enter' && e.key !== ' ') return;\n\n    const img = photo.querySelector('img');\n\n    if(!isImageReady(img) || !photo.classList.contains('is-photo-ready')){\n      e.preventDefault();\n      scheduleApply();\n      startShortRetry();\n      return;\n    }\n\n    e.preventDefault();\n\n    const titleEl = document.querySelector('#detailModal h1, #detailModal h2, #detailModal h3, #detailModal .benefit-title');\n    openViewer(img.currentSrc || img.src, titleEl ? titleEl.textContent.trim() : '');\n  }, true);\n\n  // 일반 클릭 진입 + 딥링크 자동 진입 대응\n  document.addEventListener('click', function(){\n    setTimeout(scheduleApply, 60);\n    setTimeout(scheduleApply, 220);\n    setTimeout(scheduleApply, 600);\n    startShortRetry();\n  }, true);\n\n  window.addEventListener('pageshow', function(){\n    scheduleApply();\n    setTimeout(scheduleApply, 250);\n    setTimeout(scheduleApply, 700);\n    startShortRetry();\n  });\n\n  document.addEventListener('visibilitychange', function(){\n    if(!document.hidden){\n      scheduleApply();\n      startShortRetry();\n    }\n  });\n\n  if(document.readyState === 'loading'){\n    document.addEventListener('DOMContentLoaded', function(){\n      scheduleApply();\n      setTimeout(scheduleApply, 250);\n      setTimeout(scheduleApply, 800);\n      startShortRetry();\n    });\n  }else{\n    scheduleApply();\n    setTimeout(scheduleApply, 250);\n    setTimeout(scheduleApply, 800);\n    startShortRetry();\n  }\n\n  window.closeBenefitPhotoZoomViewer = closeViewer;\n  window.upickApplyBenefitPhotoUI = function(){\n    scheduleApply();\n    startShortRetry();\n  };\n})();\n"}, {"index": 43, "id": "upick-v89-remove-install-header-logic", "type": "classic", "code": "/* disabled in v93 performance fix: handled by single global hero */"}, {"index": 44, "id": "upick-global-hero-v93-js", "type": "classic", "code": "\n(function(){\n  'use strict';\n\n  function isDevEnvBadgeHost(){\n    var host=(location.hostname||'').toLowerCase();\n    return host.indexOf('dev')>-1 || host==='localhost' || host==='127.0.0.1' || host==='0.0.0.0';\n  }\n\n  function getDevBadgeMarkup(){\n    if(!isDevEnvBadgeHost()) return '';\n    return '<div class=\"env-badge hero-env show\" id=\"globalEnvBadge\"><span class=\"env-badge-dot\"></span><span>DEV</span></div>';\n  }\n\n  var HERO_META={\n    home:{kickerIcon:'/icons/internal/lock.svg',kicker:'간단 확인 후 입주민 혜택',title:'입주민 혜택과 생활 정보를\\n한눈에 확인하세요',desc:'필요한 혜택과 공지를 한곳에서 편리하게 확인해보세요.',chips:['계정 만들기','가벼운 확인','혜택 바로 확인'],stats:true},\n    benefits:{kickerIcon:'/icons/internal/benefit.svg',kicker:'혜택 찾기',title:'입주민 혜택을 빠르게\\n찾아보세요',desc:'매장, 카테고리, 거리별로 다양한 혜택을 편리하게 확인해보세요.',chips:['혜택 검색','카테고리 필터','즐겨찾기'],stats:false},\n    favorite:{kickerIcon:'/icons/internal/favorite.svg',kicker:'자주 쓰는 혜택',title:'저장한 혜택을 빠르게 다시 확인해보세요',desc:'관심 있는 혜택을 저장하고 필요할 때 편리하게 다시 확인해보세요.',chips:['내 관심 혜택','빠른 확인','계정 동기화'],stats:false},\n    favorites:{kickerIcon:'/icons/internal/favorite.svg',kicker:'자주 쓰는 혜택',title:'저장한 혜택을 빠르게 다시 확인해보세요',desc:'관심 있는 혜택을 저장하고 필요할 때 편리하게 다시 확인해보세요.',chips:['내 관심 혜택','빠른 확인','계정 동기화'],stats:false},\n    top5:{kickerIcon:'/icons/internal/top5.svg',kicker:'실시간 인기',title:'지금 많이 찾는 매장을\\n확인하세요',desc:'조회와 즐겨찾기가 많은 인기 혜택 매장을 보여드려요.',chips:['실시간 집계','TOP5','입주민 반응'],stats:false},\n    popular:{kickerIcon:'/icons/internal/top5.svg',kicker:'실시간 인기',title:'지금 많이 찾는 매장을\\n확인하세요',desc:'조회와 즐겨찾기가 많은 인기 혜택 매장을 보여드려요.',chips:['실시간 집계','TOP5','입주민 반응'],stats:false},\n    notices:{kickerIcon:'/icons/internal/notice.svg',kicker:'입주민 안내',title:'중요한 공지사항을\\n확인하세요',desc:'입주민 공지와 새로운 소식을 한눈에 확인해보세요.',chips:['공지 확인','공유','QR 보기'],stats:false},\n    map:{kickerIcon:'/icons/internal/map.svg',kicker:'지도 기반 탐색',title:'가까운 혜택을 지도에서\\n찾아보세요',desc:'현재 위치와 매장 위치를 기준으로 거리와 주변 혜택을 편하게 확인합니다.',chips:['현재 위치','거리 확인','길찾기'],stats:false},\n    calendar:{kickerIcon:'/icons/internal/calendar.svg',kicker:'방문 예약 알림',title:'방문 일정을 놓치지 않게\\n관리하세요',desc:'혜택 매장 방문 일정을 등록하고 원하는 시간에 미리 알림을 받을 수 있습니다.',chips:['월간','주간','일간'],stats:false},\n    all:{kickerIcon:'/icons/internal/all-menu.svg',kicker:'서비스 메뉴',title:'필요한 기능을 한 곳에서\\n이용하세요',desc:'자주 사용하는 기능을 한곳에서 빠르게 이용해보세요.',chips:['전체 기능','빠른 이동','서비스 확장'],stats:false},\n    ai:{kickerIcon:'/icons/internal/ai-assistant.svg',kicker:'AI 생활 도우미',title:'지금 필요한 정보를\\n바로 도와드릴게요',desc:'생활, 혜택, 매장 정보를 대화처럼 편하게 확인해보세요.',chips:['질문하기','혜택 추천','파일 분석'],stats:false}\n  };\n  var hero=null, currentView='', profileSrc='';\n  function qs(sel,root){return (root||document).querySelector(sel)}\n  function getCurrentView(){\n    var active=qs('.bottom-nav .nav-btn.active');\n    return (window.state&&window.state.view)||(active&&(active.dataset.view||active.dataset.viewLink))||'home';\n  }\n  function routeTo(view){\n    var btn=qs('[data-view=\"'+view+'\"],[data-view-link=\"'+view+'\"],.nav-btn[data-view=\"'+view+'\"],.nav-btn[data-view-link=\"'+view+'\"]');\n    if(btn) btn.click(); else if(typeof window.changeView==='function') window.changeView(view);\n  }\n  function createHero(){\n    if(hero) return hero;\n    var shell=qs('.shell'); if(!shell) return null;\n    hero=qs('#upickGlobalHero'); if(hero) return hero;\n    hero=document.createElement('div');\n    hero.id='upickGlobalHero';\n    hero.className='upick-home-hero-shell upick-global-hero-shell';\n    hero.innerHTML='<header class=\"topbar unified-topbar public-unified-header\" aria-label=\"더운정픽 공통 헤더\">'+\n      '<div class=\"upick-header-brand brand\"><div class=\"logo\"><img class=\"upick-svg-icon\" src=\"/icons/internal/brand-symbol-real.png\" alt=\"더운정픽\" loading=\"lazy\"></div><div class=\"upick-brand-copy\"><h1>더운정픽</h1><p>입주민 전용 혜택 플랫폼</p></div></div>'+\n      '<div class=\"upick-header-utils\"><div class=\"global-user-wrap\"><button class=\"user-chip\" id=\"globalUserChip\" title=\"계정 정보\" type=\"button\" aria-label=\"계정 정보\"><span class=\"user-avatar\"><img class=\"upick-svg-icon\" src=\"/icons/internal/user.svg\" alt=\"\" loading=\"lazy\"></span></button></div><div class=\"global-ai-wrap\"><button class=\"icon-btn ai-btn\" id=\"globalAiBtn\" type=\"button\" title=\"AI 생활 도우미\" aria-label=\"AI 생활 도우미 열기\"><img class=\"upick-svg-icon\" src=\"/icons/internal/ai-assistant.svg\" alt=\"\" loading=\"lazy\"></button></div><div class=\"global-install-wrap\"><button class=\"icon-btn\" id=\"globalInstallBtn\" type=\"button\" hidden aria-hidden=\"true\"><img class=\"upick-svg-icon\" src=\"/icons/internal/install.svg\" alt=\"\" loading=\"lazy\"></button></div><div class=\"gnb-wrap\"><button class=\"icon-btn\" id=\"globalGnbBtn\" type=\"button\" title=\"메뉴\" aria-label=\"전체 메뉴\"><img class=\"upick-svg-icon\" src=\"/icons/internal/all-menu.svg\" alt=\"\" loading=\"lazy\"></button></div></div></header>'+\n      '<div class=\"hero\"><div class=\"hero-badge-row\"><div class=\"eyebrow\"><img class=\"upick-svg-icon upick-inline-icon\" id=\"globalHeroKickerIcon\" src=\"/icons/internal/lock.svg\" alt=\"\" loading=\"lazy\"> <span id=\"globalHeroKicker\"></span></div>'+getDevBadgeMarkup()+'</div><h2 id=\"globalHeroTitle\"></h2><p id=\"globalHeroDesc\"></p><div class=\"trust-hero-badges\" id=\"globalHeroChips\" aria-label=\"탭 안내\"></div><div class=\"stats\" id=\"globalHeroStats\"><div class=\"stat\"><strong id=\"globalStatMax\">0%</strong><span>최대 할인</span></div><div class=\"stat\"><strong id=\"globalStatCount\">0</strong><span>전체 제휴</span></div><div class=\"stat\"><strong id=\"globalStatCat\">0</strong><span>카테고리</span></div></div></div>';\n    shell.insertBefore(hero,shell.firstElementChild);\n    qs('#globalAiBtn',hero).addEventListener('click',function(e){e.preventDefault();routeTo('ai')});\n    qs('#globalGnbBtn',hero).addEventListener('click',function(e){e.preventDefault();var b=qs('#gnbToggleBtn')||qs('#gnbOpenBtn')||qs('#openGnbBtn')||qs('[data-open-gnb]')||qs('.gnb-open-btn'); if(b) b.click();});\n    qs('#globalUserChip',hero).addEventListener('click',function(e){e.preventDefault();var b=qs('#userChip'); if(b) b.click();});\n    return hero;\n  }\n  function syncProfileOnce(){\n    if(!hero) return;\n    var srcEl=qs('#userChip .user-avatar img');\n    var src=(srcEl&&srcEl.getAttribute('src'))||'/icons/internal/user.svg';\n    if(src===profileSrc) return;\n    profileSrc=src;\n    var dest=qs('#globalUserChip .user-avatar img',hero);\n    if(dest){dest.src=src; dest.parentElement.classList.toggle('has-photo', !/user\\.svg(?:$|[?#])/.test(src));}\n  }\n  function mirrorStatsOnce(){\n    [['#globalStatMax','#statMax'],['#globalStatCount','#statCount'],['#globalStatCat','#statCat']].forEach(function(pair){var a=qs(pair[0]),b=qs(pair[1]); if(a&&b&&b.textContent&&a.textContent!==b.textContent) a.textContent=b.textContent;});\n  }\n  function applyHero(view){\n    hero=createHero(); if(!hero) return;\n    view=view||getCurrentView();\n    if(view===currentView){syncProfileOnce();mirrorStatsOnce();return;}\n    currentView=view;\n    var meta=HERO_META[view]||HERO_META[String(view||'').replace(/^view-/,'')]||HERO_META.home;\n    var icon=qs('#globalHeroKickerIcon',hero); if(icon&&icon.getAttribute('src')!==meta.kickerIcon) icon.src=meta.kickerIcon;\n    qs('#globalHeroKicker',hero).textContent=meta.kicker;\n    qs('#globalHeroTitle',hero).innerHTML=String(meta.title).split('\\\\n').map(function(v){return v.trim()}).join('<br>');\n    qs('#globalHeroDesc',hero).textContent=meta.desc;\n    qs('#globalHeroChips',hero).innerHTML=(meta.chips||[]).map(function(c){return '<span class=\"trust-hero-badge\">'+c+'</span>'}).join('');\n    qs('#globalHeroStats',hero).classList.toggle('is-hidden',!meta.stats);\n    syncProfileOnce(); mirrorStatsOnce();\n    var env=qs('#globalEnvBadge',hero), original=qs('#envBadge');\n    if(env) env.classList.toggle('show',!!(original&&original.classList.contains('show'))||document.body.classList.contains('env-dev'));\n  }\n  function init(){\n    createHero(); applyHero('home');\n    document.addEventListener('click',function(e){\n      var t=e.target.closest('[data-view],[data-view-link],.nav-btn,.gnb-chip,.gnb-menu-item,.gnb-menu-subitem,.all-menu-card');\n      if(!t) return;\n      var view=t.dataset&&(t.dataset.view||t.dataset.viewLink)||getCurrentView();\n      Promise.resolve().then(function(){applyHero(view||getCurrentView())});\n    },true);\n    document.addEventListener('upick:view-change',function(e){applyHero((e.detail&&e.detail.view)||getCurrentView())});\n    window.addEventListener('load',function(){syncProfileOnce();mirrorStatsOnce();},{once:true});\n  }\n  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init,{once:true}); else init();\n})();\n"}, {"index": 45, "id": "upick-gnb-loading-lock-patch-v1", "type": "classic", "code": "\n(function(){\n  'use strict';\n  var loadingOpenGnb = false;\n  var restoring = false;\n\n  function q(sel){ return document.querySelector(sel); }\n  function isLoading(){\n    var loader = q('#globalLoadingBar') || q('.global-loading') || q('.page-loader');\n    return !!(loader && loader.classList.contains('show'));\n  }\n  function isGnbOpen(){\n    var sheet = q('#gnbSheet') || q('.gnb-sheet');\n    var overlay = q('#gnbOverlay') || q('.gnb-overlay');\n    return !!((sheet && sheet.classList.contains('show')) || (overlay && overlay.classList.contains('show')) || document.body.classList.contains('gnb-open'));\n  }\n  function restoreGnbOpen(){\n    if(restoring) return;\n    restoring = true;\n    requestAnimationFrame(function(){\n      var sheet = q('#gnbSheet') || q('.gnb-sheet');\n      var overlay = q('#gnbOverlay') || q('.gnb-overlay');\n      if(sheet){\n        sheet.classList.add('show');\n        sheet.setAttribute('aria-hidden','false');\n      }\n      if(overlay) overlay.classList.add('show');\n      document.body.classList.add('gnb-open');\n      restoring = false;\n    });\n  }\n  function syncLoadingLock(){\n    var active = isLoading();\n    document.documentElement.classList.toggle('ui-loading-lock', active);\n    document.body.classList.toggle('ui-loading-lock', active);\n    if(active){\n      if(isGnbOpen()) loadingOpenGnb = true;\n      if(loadingOpenGnb) restoreGnbOpen();\n    }else{\n      loadingOpenGnb = false;\n    }\n  }\n  function watch(){\n    var loader = q('#globalLoadingBar') || q('.global-loading') || q('.page-loader');\n    var sheet = q('#gnbSheet') || q('.gnb-sheet');\n    var overlay = q('#gnbOverlay') || q('.gnb-overlay');\n    syncLoadingLock();\n    if(window.MutationObserver){\n      if(loader) new MutationObserver(syncLoadingLock).observe(loader,{attributes:true,attributeFilter:['class','aria-hidden']});\n      if(sheet) new MutationObserver(function(){\n        if(isLoading() && loadingOpenGnb && !sheet.classList.contains('show')) restoreGnbOpen();\n        syncLoadingLock();\n      }).observe(sheet,{attributes:true,attributeFilter:['class','aria-hidden']});\n      if(overlay) new MutationObserver(function(){\n        if(isLoading() && loadingOpenGnb && !overlay.classList.contains('show')) restoreGnbOpen();\n        syncLoadingLock();\n      }).observe(overlay,{attributes:true,attributeFilter:['class']});\n      new MutationObserver(syncLoadingLock).observe(document.body,{attributes:true,attributeFilter:['class']});\n    }\n    document.addEventListener('click', function(event){\n      if(isLoading()){\n        var loader = q('#globalLoadingBar') || q('.global-loading') || q('.page-loader');\n        if(loader && !loader.contains(event.target)){\n          event.preventDefault();\n          event.stopPropagation();\n        }\n      }\n    }, true);\n  }\n  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', watch, {once:true});\n  else watch();\n})();\n"}];
  function runClassic(block){
    const s = document.createElement('script');
    if (block.id) s.id = block.id;
    s.text = block.code;
    document.documentElement.appendChild(s);
    s.remove();
  }
  function runModule(block){
    // Inline module scripts do not consistently fire load events across browsers.
    // Resolve immediately after inserting so later extracted blocks (including hero/header patches) still run.
    const script = document.createElement('script');
    if (block.id) script.id = block.id;
    script.type = 'module';
    script.textContent = block.code;
    script.onerror = (err) => {
      console.error('[app.js] module block error', block.id || block.index, err);
    };
    document.documentElement.appendChild(script);
    return Promise.resolve();
  }
  for (const block of blocks) {
    if (block.type === 'module') { await runModule(block); }
    else { try { runClassic(block); } catch (err) { console.error('[app.js] script block error', block.id || block.index, err); } }
  }
})();

/* ===== merged from former js/app_script.js ===== */
// 더운정픽 공개앱 메인 스크립트
// v7: app.html 내부 메인 module script를 외부 파일로 완전 분리
// app.html에는 <script type="module" src="/js/app.js">만 남깁니다.


 import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';

 const __SOLA_DYNAMIC_IMPORT_VERSION__ = globalThis.__SOLA_DYNAMIC_IMPORT_VERSION__ || (() => {
 const d = new Date();
 const pad = (n, len = 2) => String(n).padStart(len, '0');
 return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}${pad(d.getMilliseconds(), 3)}`;
 })();
 globalThis.__SOLA_DYNAMIC_IMPORT_VERSION__ = __SOLA_DYNAMIC_IMPORT_VERSION__;
 const __solaNoCache = (url) => `${url}${url.includes('?') ? '&' : '?'}v=${__SOLA_DYNAMIC_IMPORT_VERSION__}`;
 const { ENV, FIREBASE_CONFIG, API_URL, TTS_SERVICE_URL } = await import(__solaNoCache('/common/env-config.js'));
 const { checkServerSessionOrLogout, startSessionKeepAlive, logoutServerSession } = await import(__solaNoCache('/common/session-client.js'));

 const envBadge = document.getElementById('envBadge');
 const globalEnvBadge = document.getElementById('globalEnvBadge');
 document.body.classList.add(ENV === 'dev' ? 'env-dev' : 'env-prod');
 document.body.classList.toggle('env-dev', ENV === 'dev');
 document.body.classList.toggle('env-prod', ENV !== 'dev');
 if (ENV === 'dev') {
   [envBadge, globalEnvBadge].forEach((badge) => {
     if (badge) badge.classList.add('show');
   });
 } else {
   [envBadge, globalEnvBadge].forEach((badge) => {
     if (badge) badge.classList.remove('show');
   });
 }
 import { getAuth, onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';
 import { getFirestore, collection, onSnapshot, doc, getDoc, getDocs, setDoc, updateDoc, increment, serverTimestamp, addDoc, query, where, orderBy, limit, startAfter, deleteDoc, runTransaction } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';
 import { getMessaging, getToken, onMessage, isSupported } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging.js';
 import { getStorage, ref as storageRef, uploadBytes, getDownloadURL, deleteObject } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js';
 const firebaseConfig = FIREBASE_CONFIG[ENV];
 const AI_FUNCTION_REGION = 'asia-northeast3';
 const AI_FUNCTION_URL = `https://${AI_FUNCTION_REGION}-${firebaseConfig.projectId}.cloudfunctions.net/askAiAssistant`;
 // Cloud Run Gemini 스트리밍 서버
 const AI_STREAM_SERVER_URL_BY_ENV = {
 dev: 'https://ai-stream-server-dev-292137041544.asia-northeast3.run.app/stream',
 // 운영계 Cloud Run 배포 후 아래 prod URL을 운영계 /stream 주소로 교체하세요.
 prod: 'https://ai-stream-server-337132471819.asia-northeast3.run.app/stream'
 };
 const AI_STREAM_SERVER_URL = AI_STREAM_SERVER_URL_BY_ENV[ENV] || '';
 const AI_STREAM_SERVER_BASE_URL = AI_STREAM_SERVER_URL ? AI_STREAM_SERVER_URL.replace(/\/?stream\/?$/, '') : '';
 const AI_PROACTIVE_URL = AI_STREAM_SERVER_BASE_URL ? `${AI_STREAM_SERVER_BASE_URL}/assistant/proactive` : '';
 const AI_ASSISTANT_LOG_URL = AI_STREAM_SERVER_BASE_URL ? `${AI_STREAM_SERVER_BASE_URL}/assistant/log` : '';
 const AI_RECOMMENDATION_FEEDBACK_URL = AI_STREAM_SERVER_BASE_URL ? `${AI_STREAM_SERVER_BASE_URL}/assistant/feedback` : '';
 const AI_TTS_SERVICE_URL = String((TTS_SERVICE_URL && TTS_SERVICE_URL[ENV]) || '').replace(/\/+$/, '');
 const CHECK_NICKNAME_URL = API_URL?.[ENV]?.checkNickname || '';
 const UPDATE_ACCOUNT_PROFILE_URL = API_URL?.[ENV]?.updateAccountProfile || '';

 // AI 첨부파일 다운로드는 Firebase Storage URL을 직접 열지 않고 Cloud Run 다운로드 API를 사용합니다.
 function extractAiAttachmentStoragePath(url=''){
 try{
 const raw = String(url || '');
 const marker = '/o/';
 const start = raw.indexOf(marker);
 if(start < 0) return '';
 const after = raw.slice(start + marker.length);
 const encodedPath = after.split('?')[0];
 return decodeURIComponent(encodedPath);
 }catch(error){
 console.warn('AI 첨부파일 Storage 경로 추출 실패:', error);
 return '';
 }
 }

 function getAiAttachmentDownloadUrl(attachment={}){
 const path = String(attachment.path || '').trim() || extractAiAttachmentStoragePath(attachment.url || '');
 const name = String(attachment.name || path.split('/').pop() || 'attachment');
 if(!AI_STREAM_SERVER_BASE_URL || !path) return String(attachment.url || '');
 const params = new URLSearchParams({ path, name, mime: getAiAttachmentMimeType(attachment), ext: getAiAttachmentExt(name || path) });
 return `${AI_STREAM_SERVER_BASE_URL}/download-ai-attachment?${params.toString()}`;
 }

 function downloadAiAttachmentByDataset(button){
 try{
 const path = button?.dataset?.aiAttachmentPath || button?.dataset?.attachmentPath || button?.dataset?.path || '';
 const url = button?.dataset?.aiAttachmentUrl || button?.dataset?.attachmentUrl || '';
 const name = button?.dataset?.aiAttachmentName || button?.dataset?.attachmentName || button?.dataset?.name || 'attachment';
 const mimeType = button?.dataset?.aiAttachmentMime || button?.dataset?.attachmentMime || button?.dataset?.mime || '';
 const downloadUrl = getAiAttachmentDownloadUrl({ path, url, name, mimeType });
 if(!downloadUrl) return;
 window.location.replace(downloadUrl);
 }catch(error){
 console.warn('AI 첨부파일 다운로드 실패:', error);
 showAppAlert?.('다운로드 안내', '파일 다운로드를 시작하지 못했습니다. 잠시 후 다시 시도해주세요.');
 }
}

 const AI_DAILY_NUDGE_CHECK_URL = AI_STREAM_SERVER_BASE_URL ? `${AI_STREAM_SERVER_BASE_URL}/assistant/daily-nudge/check` : '';
 const AI_DAILY_NUDGE_MARK_URL = AI_STREAM_SERVER_BASE_URL ? `${AI_STREAM_SERVER_BASE_URL}/assistant/daily-nudge/mark` : '';
 const AI_CONVERSATION_KEY = `myhills_ai_conversation_${ENV || 'prod'}`;
 let aiConversationId = localStorage.getItem(AI_CONVERSATION_KEY) || '';
 let aiConversationTitle = '새 대화';
 const VAPID_PUBLIC_KEY_BY_ENV = {
 dev: 'BHgdDiJQpnMsX0oR_nO3ixVeJAzDMdAkgdnMfBn09ElocDSmefCeXY1gXTVHoZSgYsDg5fojyTuTqSR2c185VhE',
 prod: 'BJONnfKeKFN8SCWWlo_quJ9pjahri96uw9WZJq2774hBZ8um6edcRb-NP7uRwjmcwHNTTGMuPJX-MUdeThgu5Kw'
 };
 window.VAPID_PUBLIC_KEY = VAPID_PUBLIC_KEY_BY_ENV[ENV] || VAPID_PUBLIC_KEY_BY_ENV.prod;
 // 카카오 Developers > 앱 키 > JavaScript 키를 입력하세요.
 const KAKAO_JS_KEY = 'e52b154b3966372f9700ff0b35e15ccc';
 const DEFAULT_SHARE_IMAGE_URL = `/icons/icon-512.png?v=20260425b`;
 const LOGIN_PAGE_URL = '/';
 const BENEFITS_COLLECTION='benefits', NOTICES_COLLECTION='notices', CALENDAR_RESERVATIONS_COLLECTION='calendar_reservations', BENEFIT_STATS_COLLECTION='benefit_stats', BENEFIT_EVENTS_COLLECTION='benefit_events', LAST_CATEGORY_KEY='myhills_last_category', CHIPS_EXPANDED_KEY='myhills_chips_expanded';
 const app = initializeApp({ ...firebaseConfig });
 const auth=getAuth(app);
 const db=getFirestore(app);
 const storage=getStorage(app);

 const FONT_SIZE_LABELS = { small:'작게', normal:'기본', large:'크게', xlarge:'아주 크게' };
 function normalizeFontSize(value){
 const key = String(value || '').trim().toLowerCase();
 return Object.prototype.hasOwnProperty.call(FONT_SIZE_LABELS, key) ? key : 'normal';
 }
 function applyAppFontSize(value){
 const next = normalizeFontSize(value);
 state.appFontSize = next;
 document.documentElement.dataset.fontSize = next;
 syncFontSizeSettingUi();
 return next;
 }
 function syncFontSizeSettingUi(){
 const current = normalizeFontSize(state.appFontSize || state.currentUserProfile?.fontSize || 'normal');
 qsa('.font-size-option').forEach((btn) => {
 const active = normalizeFontSize(btn.dataset.fontSize) === current;
 btn.classList.toggle('active', active);
 btn.setAttribute('aria-checked', active ? 'true' : 'false');
 });
 const status = qs('#fontSizeStatus');
 if(status && !status.classList.contains('saving')){
 status.classList.remove('error');
 status.textContent = `현재 글자 크기: ${FONT_SIZE_LABELS[current] || '기본'}`;
 }
 }
 function setFontSizeStatus(message, type=''){
 const status = qs('#fontSizeStatus');
 if(!status) return;
 status.classList.toggle('saving', type === 'saving');
 status.classList.toggle('error', type === 'error');
 status.textContent = message || '';
 }
 async function changeAppFontSize(value){
 const next = applyAppFontSize(value);
 if(!state.currentUser?.uid){
 setFontSizeStatus('입장 후 글자 크기를 저장할 수 있습니다.', 'error');
 return;
 }
 setFontSizeStatus('글자 크기를 저장하고 있습니다...', 'saving');
 try{
 await setDoc(doc(db, 'users', state.currentUser.uid), {
 fontSize: next,
 appFontSize: next,
 fontSizeUpdatedAt: serverTimestamp()
 }, { merge:true });
 state.currentUserProfile = { ...(state.currentUserProfile || {}), fontSize:next, appFontSize:next };
 setFontSizeStatus(`글자 크기가 '${FONT_SIZE_LABELS[next]}'로 저장되었습니다.`);
 }catch(error){
 console.error('글자 크기 저장 실패', error);
 setFontSizeStatus('글자 크기 저장 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.', 'error');
 }
 }

 /* =========================
 Security Guard / Session Check
 - Firestore 기반 계정 상태 검증
 - activeSessionId 기반 중복 입장 감지
 - security_logs 기록
 ========================= */
 const SECURITY_LOGS_COLLECTION = 'security_logs';
 const SHARE_CLICK_LOGS_COLLECTION = 'share_click_logs';
 const SHARE_VISIT_LOGS_COLLECTION = 'share_visit_logs';

 function getStoredLoginUser(){
 try{
 return JSON.parse(localStorage.getItem('loginUser') || '{}') || {};
 }catch(_){
 return {};
 }
 }

 function saveVerifiedLoginUser(user, profile, sessionId){
 try{
 localStorage.setItem('loginUser', JSON.stringify({
 uid: user.uid,
 loginId: profile.loginId || profile.loginID || '',
 sessionId: sessionId || '',
 role: profile.role || profile.userRole || 'resident',
 approvalStatus: profile.approvalStatus || '',
 phoneVerified: !!profile.phoneVerified,
 accountStatus: profile.accountStatus || ''
 }));
 }catch(error){
 console.warn('loginUser 저장 실패', error);
 }
 }

 async function writeSecurityLog(type, detail = {}){
 try{
 const stored = getStoredLoginUser();
 await addDoc(collection(db, SECURITY_LOGS_COLLECTION), {
 uid: state.currentUser?.uid || stored.uid || null,
 loginId: state.currentUserProfile?.loginId || stored.loginId || null,
 type,
 path: location.pathname,
 href: location.href,
 userAgent: navigator.userAgent,
 detail,
 createdAt: serverTimestamp()
 });
 }catch(error){
 console.warn('보안 로그 저장 실패', error);
 }
 }

 function consumePendingDeepLinkSafely(){
 const pending = sessionStorage.getItem('pendingDeepLink');
 if(!pending) return null;
 sessionStorage.removeItem('pendingDeepLink');

 try{
 const url = new URL(pending, location.origin);
 if(url.origin !== location.origin) return null;
 if(url.pathname.includes('admin') || url.pathname.includes('sola-admin')) return null;
 return url.href;
 }catch(_){
 return null;
 }
 }

 /* =========================
 Clean URL Deep Link Router
 - /app?open=notice&id={id} -> 공지 상세
 - /app?open=benefit&id={id} -> 혜택 상세
 - /notice/{id}, /benefit/{id} 기존 클린 URL도 유지
 - /share/{type}/{id}는 Vercel Function에서 OG 생성 후 /app?...으로 진입
 ========================= */
 let lastHandledCleanDeepLinkKey = '';

 function normalizeDeepLinkType(type){
 const value = String(type || '').trim().toLowerCase();
 if(value === 'benefit' || value === 'benefits') return 'benefit';
 if(value === 'notice' || value === 'notices') return 'notice';
 return '';
 }

 function parseCleanDeepLink(){
 // 1) Vercel OG 공유 링크가 리다이렉트하는 쿼리형 딥링크
 // /app?open=benefit&id=문서ID&from=share
 // /app?open=notice&id=문서ID&from=share
 try{
 const params = new URLSearchParams(location.search || '');
 const queryType = normalizeDeepLinkType(params.get('open'));
 const queryId = String(params.get('id') || '').trim();
 if(queryType && queryId){
 return {
 type: queryType,
 id: decodeURIComponent(queryId),
 mode: 'query'
 };
 }

 // 기존 알림/공유 URL 호환: /app?noticeId=문서ID, /app?benefitId=문서ID
 const legacyNoticeId = String(params.get('noticeId') || '').trim();
 if(legacyNoticeId){
 return {
 type: 'notice',
 id: decodeURIComponent(legacyNoticeId),
 mode: 'legacy-query'
 };
 }

 const legacyBenefitId = String(params.get('benefitId') || '').trim();
 if(legacyBenefitId){
 return {
 type: 'benefit',
 id: decodeURIComponent(legacyBenefitId),
 mode: 'legacy-query'
 };
 }
 }catch(_){ }

 // 2) 기존 클린 URL 딥링크
 // /notice/{id}, /benefit/{id}
 const parts = String(location.pathname || '').split('/').filter(Boolean);
 const pathType = normalizeDeepLinkType(parts[0]);
 if(parts.length >= 2 && pathType){
 return {
 type: pathType,
 id: decodeURIComponent(parts[1] || ''),
 mode: 'path'
 };
 }
 return null;
 }

 function getCleanAppPath(){
 return '/app';
 }

 function setCleanUrl(path, { replace=false } = {}){
 try{
 const nextPath = String(path || getCleanAppPath());
 const current = `${location.pathname}${location.search}${location.hash}`;
 if(current === nextPath) return;
 const method = replace ? 'replaceState' : 'pushState';
 history[method]({}, '', nextPath);
 }catch(error){
 console.warn('URL 상태 변경 실패', error);
 }
 }

 function updateCleanDeepLinkUrl(type, id, { replace=false } = {}){
 const cleanId = String(id || '').trim();
 if(!type || !cleanId) return;
 // Vercel 정적 배포에서 /notice/{id}, /benefit/{id}를 직접 새로고침하면
 // 서버 라우팅이 없을 때 Not Found가 발생할 수 있으므로, 운영 URL은 /app 쿼리형으로 고정합니다.
 setCleanUrl(`/app?open=${encodeURIComponent(type)}&id=${encodeURIComponent(cleanId)}`, { replace });
 }

 function clearCleanDeepLinkUrl({ replace=true } = {}){
 const deepLink = parseCleanDeepLink();
 if(!deepLink) return;
 // 공유/딥링크 진입 후 모달을 닫으면 /app?open=... 또는 /benefit/...을
 // 앱 기본 주소로 정리해서 뒤로가기 재오픈을 방지합니다.
 setCleanUrl(getCleanAppPath(), { replace });
 }

 function closeContentModals(){
 try{ if(isLayerOpenLike(qs('#detailModal'))) closeDialogSafe(qs('#detailModal')); }catch(_){}
 try{ if(isLayerOpenLike(qs('#noticeModal'))) closeDialogSafe(qs('#noticeModal')); }catch(_){}
 }

 function handleCleanDeepLink({ force=false } = {}){
 const deepLink = parseCleanDeepLink();
 if(!deepLink){
 if(force) closeContentModals();
 return false;
 }

 const key = `${deepLink.type}:${deepLink.id}`;
 if(!force && lastHandledCleanDeepLinkKey === key) return true;

 if(!canOpenNoticeDeepLink()){
 sessionStorage.setItem('pendingDeepLink', location.href);
 redirectToLogin();
 return false;
 }

 if(deepLink.type === 'notice'){
 if(!state.notices || !state.notices.length) return false;
 const item = state.notices.find((notice) => notice.id === deepLink.id);
 if(!item){
 lastHandledCleanDeepLinkKey = key;
 changeView('notices');
 setTimeout(() => openModalAlert('존재하지 않는 공지입니다.'), 120);
 return false;
 }
 lastHandledCleanDeepLinkKey = key;
 changeView('notices');
 setTimeout(() => {
 scrollToNoticeCard(item.id);
 openNotice(item, { skipUrlUpdate:true });
 }, 160);
 return true;
 }

 if(deepLink.type === 'benefit'){
 if(!state.benefits || !state.benefits.length) return false;
 const item = state.benefits.find((benefit) => benefit.id === deepLink.id);
 if(!item){
 lastHandledCleanDeepLinkKey = key;
 changeView('benefits');
 setTimeout(() => openModalAlert('존재하지 않는 혜택입니다.'), 120);
 return false;
 }
 lastHandledCleanDeepLinkKey = key;
 changeView('benefits');
 setTimeout(() => openDetail(item, { skipUrlUpdate:true }), 160);
 return true;
 }

 return false;
 }

 window.addEventListener('popstate', () => {
 lastHandledCleanDeepLinkKey = '';
 if(!parseCleanDeepLink()){
 closeContentModals();
 return;
 }

 handleShareClickLog()
 .catch(error => console.warn('공유 클릭 로그 처리 실패', error))
 .finally(() => {
 handleCleanDeepLink({ force:true });
 });
 });

 // 네이버 지도 JavaScript SDK Client ID를 입력하세요. (Dynamic Map / 지도 모드)
 const NAVER_MAP_CLIENT_ID = 'ouflkgfkts';
 let naverMapsLoadPromise = null;
 let benefitMapInstance = null;
 let benefitMapMarkers = [];
 let benefitMapExpandedClusterKey = '';
 let benefitMapUserMarker = null;
 let detailMapInstance = null;
 let messaging = null;

 async function initPushSystem(){
 try{
 const supported = await isSupported().catch(() => false);
 if(!supported){
 window.firebaseMessaging = null;
 window.getToken = null;
 window.pushSwRegistration = null;
 return false;
 }
 if(!('serviceWorker' in navigator)){
 window.firebaseMessaging = null;
 window.getToken = null;
 window.pushSwRegistration = null;
 return false;
 }

 // v86: 운영계/삼성브라우저 백그라운드 푸시 안정화
 // Service Worker URL에 매번 바뀌는 query를 붙이면 일부 모바일 브라우저에서
 // waiting/active 전환 타이밍이 흔들려 백그라운드 push 이벤트를 안정적으로 깨우지 못할 수 있습니다.
 // 운영/개발 모두 고정 경로 + 루트 scope로 등록하고, active registration을 getToken에 전달합니다.
 const swUrl = '/firebase-messaging-sw.js';
 let registration = await navigator.serviceWorker.getRegistration('/').catch(() => null);

 if(!registration || !registration.active){
 registration = await navigator.serviceWorker.register(swUrl, { scope: '/' });
 }else{
 await registration.update().catch(() => {});
 }

 // waiting SW가 있으면 활성화를 요청합니다. SW 쪽에서 SKIP_WAITING 메시지를 처리하지 않아도 안전합니다.
 if(registration.waiting){
 try{ registration.waiting.postMessage({ type:'SKIP_WAITING', source:'app-v86' }); }catch(_){ }
 }

 // 삼성브라우저/운영계에서는 ready가 늦는 경우가 있어 active registration을 다시 확정합니다.
 const readyRegistration = await Promise.race([
 navigator.serviceWorker.ready,
 new Promise((resolve) => setTimeout(() => resolve(registration), 3500))
 ]).catch(() => registration);

 window.pushSwRegistration = readyRegistration || registration;
 window.__UPICK_PUSH_SW_INFO__ = {
 scope: window.pushSwRegistration?.scope || '',
 scriptURL: window.pushSwRegistration?.active?.scriptURL || '',
 state: window.pushSwRegistration?.active?.state || '',
 controlled: !!navigator.serviceWorker.controller,
 env: ENV || 'prod',
 updatedAt: new Date().toISOString()
 };
 console.info('[UPICK PUSH] Service Worker ready', window.__UPICK_PUSH_SW_INFO__);

 messaging = getMessaging(app);
 window.firebaseMessaging = messaging;
 window.getToken = getToken;

 function normalizeForegroundPushPayload(payload = {}) {
 const data = payload?.data || {};
 const benefitId = String(
 data.benefitId ||
 data.benefitID ||
 data.benefitsId ||
 ((data.type === 'benefit' || data.type === 'proximity') ? data.id : '') ||
 ''
 );
 const noticeId = String(data.noticeId || '');
 const reservationId = String(data.reservationId || data.calendarReservationId || '');
 const type = String(data.type || (reservationId ? 'calendar' : (benefitId ? 'benefit' : (noticeId ? 'notice' : ''))) || 'notice');
 const rawUrl = String(
 data.url ||
 data.click_action ||
 data.clickUrl ||
 data.link ||
 payload?.fcmOptions?.link ||
 payload?.webpush?.fcmOptions?.link ||
 '/app'
 );

 return {
 title: String(data.title || payload?.notification?.title || '새 알림'),
 body: String(data.body || payload?.notification?.body || ''),
 url: buildForegroundPushUrl({ url: rawUrl, type, noticeId, benefitId, reservationId }),
 noticeId,
 benefitId,
 reservationId,
 type,
 important: String(data.important || '') === 'true'
 };
 }

 function buildForegroundPushUrl({ url = '', type = '', noticeId = '', benefitId = '', reservationId = '' } = {}) {
 const rawUrl = String(url || '').trim();
 const cleanType = String(type || '').trim().toLowerCase();
 const cleanNoticeId = String(noticeId || '').trim();
 const cleanBenefitId = String(benefitId || '').trim();
 const cleanReservationId = String(reservationId || '').trim();

 if (cleanType === 'ai_nudge' || rawUrl.includes('ai=open')) {
 return '/app?ai=open';
 }

 if (cleanType === 'calendar' || cleanReservationId || rawUrl.includes('open=calendar')) {
 return cleanReservationId
 ? `/app?view=calendar&calendarId=${encodeURIComponent(cleanReservationId)}&from=push`
 : (rawUrl || '/app?view=calendar&from=push');
 }

 if (cleanBenefitId && (!rawUrl || rawUrl === '/' || rawUrl === '/app')) {
 return `/app?open=benefit&id=${encodeURIComponent(cleanBenefitId)}&from=push`;
 }

 if (cleanNoticeId && (!rawUrl || rawUrl === '/' || rawUrl === '/app')) {
 return `/app?open=notice&id=${encodeURIComponent(cleanNoticeId)}&from=push`;
 }

 if (cleanType === 'benefit' && cleanBenefitId && !rawUrl.includes('open=benefit')) {
 return `/app?open=benefit&id=${encodeURIComponent(cleanBenefitId)}&from=push`;
 }

 return rawUrl || '/app';
 }

 function openForegroundPushUrl(url = '/') {
 try {
 const absoluteUrl = new URL(String(url || '/app'), window.location.origin);
 if (absoluteUrl.origin !== window.location.origin) {
 window.location.replace('/app');
 return;
 }
 window.location.replace(absoluteUrl.href);
 } catch (_) {
 window.location.replace('/app');
 }
 }

 function isPcBrowserForForegroundNotification() {
 const ua = String(navigator.userAgent || '').toLowerCase();
 return !(
 ua.includes('android') ||
 ua.includes('iphone') ||
 ua.includes('ipad') ||
 ua.includes('mobile') ||
 ua.includes('samsungbrowser')
 );
 }

 function isMobileEdgeBrowser() {
 const ua = String(navigator.userAgent || '').toLowerCase();
 const isMobile =
 ua.includes('android') ||
 ua.includes('iphone') ||
 ua.includes('ipad') ||
 ua.includes('mobile');
 const isEdge =
 ua.includes('edga') ||
 ua.includes('edgios') ||
 ua.includes('edg/') ||
 ua.includes('edg');
 return isMobile && isEdge;
 }

 async function isMobileEdgePushEndpointBroken() {
 if (!isMobileEdgeBrowser()) return false;
 try {
 if (!('serviceWorker' in navigator) || !('PushManager' in window)) return true;
 const reg = window.pushSwRegistration || await navigator.serviceWorker.ready;
 const sub = await reg.pushManager.getSubscription();
 const endpoint = String(sub?.endpoint || '');
 window.fcmDebugLog?.('MOBILE_EDGE_ENDPOINT_CHECK', endpoint || 'empty endpoint');
 return !endpoint || endpoint.includes('permanently-removed.invalid');
 } catch (error) {
 window.fcmDebugLog?.('MOBILE_EDGE_ENDPOINT_CHECK_ERROR', String(error && (error.stack || error.message) || error));
 return true;
 }
 }

 function shouldUseMobileEdgeInAppFallback() {
 return isMobileEdgeBrowser();
 }

 function getForegroundPushKey(item = {}) {
 return [
 String(item.type || ''),
 String(item.noticeId || ''),
 String(item.benefitId || ''),
 String(item.reservationId || ''),
 String(item.title || ''),
 String(item.body || ''),
 String(item.url || '')
 ].join('|');
 }

 function shouldSkipForegroundSystemNotification(item = {}) {
 const key = getForegroundPushKey(item);
 const now = Date.now();
 if (!shouldSkipForegroundSystemNotification.cache) {
 shouldSkipForegroundSystemNotification.cache = new Map();
 }
 const cache = shouldSkipForegroundSystemNotification.cache;
 const last = cache.get(key) || 0;
 cache.set(key, now);

 for (const [k, t] of cache.entries()) {
 if (now - t > 10000) cache.delete(k);
 }

 return !!(last && now - last < 4000);
 }

 async function showForegroundSystemNotification(item = {}) {
 try {
 const isCalendarPush = String(item.type || '').toLowerCase() === 'calendar' || !!item.reservationId;

 // 포그라운드 푸시는 브라우저/기기 구분 없이 시스템 알림을 우선 시도합니다.
 // 알림 권한/브라우저 정책 때문에 실패하면 호출부에서 내부 토스트로 fallback합니다.
 if (!('Notification' in window)) return false;
 if (Notification.permission !== 'granted') return false;
 if (!('serviceWorker' in navigator)) return false;
 if (shouldSkipForegroundSystemNotification(item)) return true;

 const foregroundRegistration = window.pushSwRegistration || await navigator.serviceWorker.ready;
 if (!foregroundRegistration?.showNotification) return false;

 await foregroundRegistration.showNotification(item.title || '새 알림', {
 body: item.body || '새로운 알림이 도착했습니다.',
 icon: '/icons/push-icon.png',
 badge: '/icons/badge-icon.png',
 vibrate: isCalendarPush ? [200, 100, 200] : (item.important ? [160, 80, 160] : undefined),
 tag: isCalendarPush
 ? `calendar-${item.reservationId || getForegroundPushKey(item)}`
 : `foreground-${getForegroundPushKey(item)}`,
 renotify: false,
 data: {
 url: item.url || '/app',
 noticeId: item.noticeId || '',
 benefitId: item.benefitId || '',
 reservationId: item.reservationId || '',
 type: item.type || 'notice'
 }
 });
 return true;
 } catch (error) {
 console.warn('포그라운드 알림 표시 실패', error);
 return false;
 }
 }

 function ensureForegroundPushToastStyle() {
 if (document.getElementById('foregroundPushToastStyle')) return;
 const style = document.createElement('style');
 style.id = 'foregroundPushToastStyle';
 style.textContent = [
 '.foreground-push-toast{',
 'position:fixed;left:12px;right:12px;top:calc(10px + env(safe-area-inset-top,0px));z-index:100002;display:flex;justify-content:center;pointer-events:none;opacity:0;transform:translateY(-18px) scale(.985);transition:opacity .24s ease, transform .24s ease;',
 '}',
 '.foreground-push-toast.show{opacity:1;transform:translateY(0) scale(1);}',
 '.foreground-push-card{width:min(100%,448px);display:flex;align-items:flex-start;gap:12px;padding:14px 15px;border-radius:22px;background:rgba(15,23,42,.94);color:#fff;border:1px solid rgba(255,255,255,.12);box-shadow:0 18px 42px rgba(15,23,42,.26);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);pointer-events:auto;cursor:pointer;}',
 '.foreground-push-icon{width:38px;height:38px;border-radius:14px;display:grid;place-items:center;background:rgba(255,255,255,.12);flex:0 0 auto;font-size:18px;}',
 '.foreground-push-copy{min-width:0;flex:1;}',
 '.foreground-push-title{font-size:14px;font-weight:900;line-height:1.35;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}',
 '.foreground-push-body{margin-top:4px;font-size:12px;line-height:1.55;color:rgba(255,255,255,.78);display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;}',
 '.foreground-push-close{border:none;background:rgba(255,255,255,.10);color:#fff;width:32px;height:32px;border-radius:12px;cursor:pointer;flex:0 0 auto;font-size:18px;line-height:1;}'
 ].join('');
 document.head.appendChild(style);
 }

 function showForegroundPushToast({ title = '새 알림', body = '', url = '/' } = {}) {
 ensureForegroundPushToastStyle();
 let host = document.getElementById('foregroundPushToast');
 if (!host) {
 host = document.createElement('div');
 host.id = 'foregroundPushToast';
 host.className = 'foreground-push-toast';
 host.innerHTML = '<div class="foreground-push-card" id="foregroundPushCard" role="button" tabindex="0"><div class="foreground-push-icon"><img class="upick-svg-icon" src="/icons/internal/notification.svg" alt="" loading="lazy"></div><div class="foreground-push-copy"><div class="foreground-push-title" id="foregroundPushTitle"></div><div class="foreground-push-body" id="foregroundPushBody"></div></div><button type="button" class="foreground-push-close" id="foregroundPushClose" aria-label="알림 닫기">×</button></div>';
 document.body.appendChild(host);
 host.querySelector('#foregroundPushCard')?.addEventListener('click', () => {
 const targetUrl = host.dataset.url || '/';
 host.classList.remove('show');
 openForegroundPushUrl(targetUrl);
 });
 host.querySelector('#foregroundPushCard')?.addEventListener('keydown', (event) => {
 if (event.key !== 'Enter' && event.key !== ' ') return;
 event.preventDefault();
 const targetUrl = host.dataset.url || '/';
 host.classList.remove('show');
 openForegroundPushUrl(targetUrl);
 });
 host.querySelector('#foregroundPushClose')?.addEventListener('click', (event) => {
 event.stopPropagation();
 host.classList.remove('show');
 });
 }
 host.dataset.url = url || '/';
 host.querySelector('#foregroundPushTitle').textContent = title || '새 알림';
 host.querySelector('#foregroundPushBody').textContent = body || '새로운 알림이 도착했습니다.';
 host.classList.remove('show');
 requestAnimationFrame(() => host.classList.add('show'));
 clearTimeout(showForegroundPushToast._timer);
 showForegroundPushToast._timer = setTimeout(() => host.classList.remove('show'), 4200);
 }

 // Data-only FCM은 앱이 열려 있을 때 서비스워커 onBackgroundMessage를 타지 않습니다.
 // 앱 실행 중에도 모든 포그라운드 푸시는 시스템 알림을 우선 시도합니다.
 // 브라우저 정책/권한 문제로 시스템 알림 표시가 실패하면 내부 토스트로 fallback합니다.
 
function isMobileForegroundNotificationTarget() {
  const ua = String(navigator.userAgent || "").toLowerCase();

  const isMobile =
    ua.includes("android") ||
    ua.includes("iphone") ||
    ua.includes("ipad") ||
    ua.includes("mobile");

  const isInAppBrowser =
    ua.includes("kakaotalk") ||
    ua.includes("naver(inapp") ||
    ua.includes("naverapp");

  // 카카오톡 / 네이버 인앱은 시스템 알림 초기화가 제한되는 경우가 많아 내부 토스트 fallback
  if (isInAppBrowser) return false;

  const isChrome = ua.includes("chrome") || ua.includes("crios");
  const isSamsung = ua.includes("samsungbrowser");
  const isWhale = ua.includes("whale");
  const isFirefox = ua.includes("firefox") || ua.includes("fxios");

  // 모바일 Edge는 일부 기기에서 Push endpoint가 생성되어도 실제 push 이벤트가 오지 않는 경우가 있어
  // 앱 실행 중에는 시스템 알림 대신 내부 토스트 fallback을 우선 사용합니다.
  const isEdge =
    ua.includes("edga") ||
    ua.includes("edgios") ||
    ua.includes("edg/") ||
    ua.includes("edg");

  if (isEdge) return false;

  return isMobile && (isChrome || isSamsung || isWhale || isFirefox);
}

function isPcForegroundNotificationTarget() {
  // PC는 FCM/Service Worker/브라우저 자동 알림과 foreground showNotification이 중복될 수 있어 제외합니다.
  return false;
}


function isDesktopSupportedBrowser() {
  const ua = String(navigator.userAgent || "").toLowerCase();

  const isDesktop =
    !ua.includes("android") &&
    !ua.includes("iphone") &&
    !ua.includes("ipad") &&
    !ua.includes("mobile");

  return (
    isDesktop &&
    (
      ua.includes("chrome") ||
      ua.includes("edg") ||
      ua.includes("edge") ||
      ua.includes("whale") ||
      ua.includes("firefox")
    )
  );
}

function shouldUseForegroundSystemNotification(payload) {
  return isMobileForegroundNotificationTarget() || isPcForegroundNotificationTarget();
}


const ENABLE_PUSH_DEBUG_LOG = localStorage.getItem('myhillsPushDebug') === '1';
window.fcmDebugLog = function(step, detail) {
  if (!ENABLE_PUSH_DEBUG_LOG) return;
  try {
    const info = {
      step,
      detail,
      permission: window.Notification ? Notification.permission : "unsupported",
      serviceWorker: !!navigator.serviceWorker,
      secureContext: window.isSecureContext,
      visibility: document.visibilityState,
      userAgent: String(navigator.userAgent || ""),
      time: new Date().toISOString()
    };
    console.debug("[FCM_DEBUG]", info);
  } catch (e) {}
}


window.pushFlowLog = window.pushFlowLog || function(step, detail) {
  if (!ENABLE_PUSH_DEBUG_LOG) return;
  try {
    const info = {
      step,
      detail,
      permission: window.Notification ? Notification.permission : "unsupported",
      serviceWorker: !!navigator.serviceWorker,
      controller: !!navigator.serviceWorker?.controller,
      secureContext: window.isSecureContext,
      visibility: document.visibilityState,
      focus: document.hasFocus ? document.hasFocus() : null,
      userAgent: String(navigator.userAgent || ""),
      time: new Date().toISOString()
    };
    console.debug("[PUSH_FLOW]", info);
  } catch (e) {}
};

if (navigator.serviceWorker) {
  navigator.serviceWorker.addEventListener("message", (event) => {
    const data = event.data || {};
    if (ENABLE_PUSH_DEBUG_LOG && (data.type === "SW_FLOW" || data.type === "SW_DEBUG" || data.type === "SW_RAW_PUSH")) {
      window.pushFlowLog?.("SW_MESSAGE_RECEIVED", data);
      window.fcmDebugLog?.("SW_MESSAGE_RECEIVED", data);
    }
  });

  if (ENABLE_PUSH_DEBUG_LOG) {
    navigator.serviceWorker.ready
      .then((reg) => {
        window.pushFlowLog?.("SERVICE_WORKER_READY_RESOLVED", {
          scope: reg.scope,
          active: !!reg.active,
          activeState: reg.active?.state || "",
          installing: !!reg.installing,
          waiting: !!reg.waiting
        });
      })
      .catch((e) => {
        window.pushFlowLog?.("SERVICE_WORKER_READY_ERROR", String(e && (e.stack || e.message) || e));
      });
  }
}
onMessage(messaging, async (payload) => {
 try {
 const item = normalizeForegroundPushPayload(payload);
 if (!item) return;

 const isCalendarPush = String(item.type || '').toLowerCase() === 'calendar' || !!item.reservationId;
 const normalizedItem = {
 ...item,
 title: item.title || (isCalendarPush ? '예약 알림 시간이 되었습니다' : '새 알림'),
 body: item.body || (isCalendarPush ? '등록한 혜택 매장 방문 알림입니다.' : '새로운 알림이 도착했습니다.'),
 url: item.url || (isCalendarPush ? '/app?view=calendar' : '/app'),
 important: isCalendarPush ? true : item.important
 };

 try {
 if (shouldUseForegroundSystemNotification(normalizedItem)) {
  const shownAsSystemNotification = await showForegroundSystemNotification(normalizedItem);

  if (shownAsSystemNotification) return;
 }
} catch (e) {
}

showForegroundPushToast({
 title: normalizedItem.title,
 body: normalizedItem.body,
 url: normalizedItem.url
});
 } catch (error) {
 console.warn('포그라운드 알림 처리 실패', error);
 }
 });
 return true;
 }catch(error){
 console.error('알림 초기화 실패', error);
 window.firebaseMessaging = null;
 window.getToken = null;
 window.pushSwRegistration = null;
 return false;
 }
 }

 const state={category:localStorage.getItem(LAST_CATEGORY_KEY)||'전체',keyword:'',filter:'all',view:'home',benefits:[],notices:[],loading:true,currentUser:null,currentUserProfile:null,popularItems:[],favoriteIds:[],benefitStatsMap:{},aiKnowledge:[],currentPushToken:null,isPushEnabledForThisDevice:false,appFontSize:'normal',calendarReservations:[],activeDistanceBenefitId:'',distanceRequestSeq:0,benefitSortMode:'default',distanceRadius:'all',userLocation:null,userLocationFetchedAt:0,distanceMap:{},distanceStatus:'idle',scrollMap:{home:0,benefits:0,favorite:0,top5:0,notices:0,calendar:0,shareinsights:0,ai:0},
 benefitViewMode: localStorage.getItem('benefitViewMode') || 'list'
 };

 const initialUrlParams = new URLSearchParams(window.location.search || '');
 const pendingDeepLink = {
 view: initialUrlParams.get('view') || '',
 noticeId: initialUrlParams.get('noticeId') || ''
 };
 let pendingNoticeOpened = false;
 
 
const __duLegacyElementLayerMap = {
 detailModal:'detailModal', detailHeadActions:'detailModal', modalFavBtn:'detailModal', openCalendarReservationBtn:'detailModal', closeModal:'detailModal', modalBody:'detailModal',
 calendarReservationModal:'calendarReservationModal', closeCalendarReservationModal:'calendarReservationModal', calendarReservationForm:'calendarReservationModal', calendarSelectedStore:'calendarReservationModal', calendarBenefitId:'calendarReservationModal', calendarVisitDate:'calendarReservationModal', calendarVisitTime:'calendarReservationModal', calendarNotifyBefore:'calendarReservationModal', calendarReservationMemo:'calendarReservationModal', cancelCalendarReservationBtn:'calendarReservationModal',
 calendarDayModal:'calendarDayModal', calendarDayPrevBtn:'calendarDayModal', calendarDayDateBtn:'calendarDayModal', calendarDayNextBtn:'calendarDayModal', calendarDayCloseBtn:'calendarDayModal', calendarDayDatePicker:'calendarDayModal', calendarDayModalList:'calendarDayModal', calendarDayTodayBtn:'calendarDayModal', calendarDayCloseBottomBtn:'calendarDayModal',
 noticeModal:'noticeModal', closeNoticeModal:'noticeModal', noticeModalBody:'noticeModal',
 communityEditorModal:'communityEditorModal', communityEditorTitle:'communityEditorModal', closeCommunityEditor:'communityEditorModal', communityPostCategory:'communityEditorModal', communityPostTitle:'communityEditorModal', communityPostContent:'communityEditorModal', submitCommunityPostBtn:'communityEditorModal',
 communityDetailModal:'communityDetailModal', closeCommunityDetail:'communityDetailModal', communityDetailBody:'communityDetailModal', communityCommentList:'communityDetailModal', communityCommentContent:'communityDetailModal', submitCommunityCommentBtn:'communityDetailModal',
 communityReportModal:'communityReportModal', closeCommunityReportModal:'communityReportModal', communityReportReasons:'communityReportModal', cancelCommunityReportBtn:'communityReportModal', submitCommunityReportBtn:'communityReportModal',
 qrModal:'qrModal', closeQrModal:'qrModal', qrCanvas:'qrModal', qrShareUrl:'qrModal', qrCopyBtn:'qrModal',
 settingsSuiteModal:'settingsSuiteModal', closeSettingsSuiteBtn:'settingsSuiteModal', fontSizeSettingsSection:'settingsSuiteModal', fontSizeStatus:'settingsSuiteModal', userBottomNavSettingsSection:'settingsSuiteModal', userBottomNavCurrent:'settingsSuiteModal', userBottomNavPicker:'settingsSuiteModal', saveUserBottomNavBtn:'settingsSuiteModal', resetUserBottomNavBtn:'settingsSuiteModal', userBottomNavStatus:'settingsSuiteModal', openAccountEditBtn:'settingsSuiteModal', openPasswordChangeBtn:'settingsSuiteModal', logoutBtn:'settingsSuiteModal', withdrawBtn:'settingsSuiteModal',
 accountEditModal:'accountEditModal', closeAccountEditModal:'accountEditModal', accountEditForm:'accountEditModal', accountNicknameInput:'accountEditModal', accountCheckNicknameBtn:'accountEditModal', accountNicknameMsg:'accountEditModal', accountProfilePreview:'accountEditModal', accountProfileUploadBtn:'accountEditModal', accountProfileUploadStatus:'accountEditModal', accountProfileFileInput:'accountEditModal', accountBuildingInput:'accountEditModal', accountUnitInput:'accountEditModal', cancelAccountEditBtn:'accountEditModal', saveAccountEditBtn:'accountEditModal',
 passwordChangeModal:'passwordChangeModal', closePasswordChangeModal:'passwordChangeModal', passwordChangeForm:'passwordChangeModal', currentPasswordInput:'passwordChangeModal', newPasswordInput:'passwordChangeModal', newPasswordConfirmInput:'passwordChangeModal', passwordChangeMatchMessage:'passwordChangeModal', cancelPasswordChangeBtn:'passwordChangeModal', submitPasswordChangeBtn:'passwordChangeModal',
 aiImageZoomBackdrop:'aiImageZoomBackdrop', aiImageZoomTitle:'aiImageZoomBackdrop', aiImageZoomCloseBtn:'aiImageZoomBackdrop', aiImageZoomScroll:'aiImageZoomBackdrop', aiImageZoomImg:'aiImageZoomBackdrop'
};
function __duCssEscape(value){
 try{ if(window.CSS && typeof window.CSS.escape === 'function') return window.CSS.escape(String(value)); }catch(_){}
 return String(value).replace(/([ #;?%&,.+*~\':"!^$[\]()=>|\/])/g,'\\$1');
}
function __duFindLegacyElement(selector){
 if(typeof selector !== 'string') return null;
 var tpl = document.getElementById('duLayerLegacyTemplate');
 if(!tpl || !tpl.content) return null;
 try{ return tpl.content.querySelector(selector); }catch(_){ return null; }
}
function __duFindLegacyElements(selector){
 var tpl = document.getElementById('duLayerLegacyTemplate');
 if(!tpl || !tpl.content) return [];
 try{ return Array.prototype.slice.call(tpl.content.querySelectorAll(selector)); }catch(_){ return []; }
}
function __duMountLegacyElement(el){
 if(!el || el.isConnected) return el;
 var layer = el.classList && el.classList.contains('du-layer') ? el : (el.closest ? el.closest('.du-layer') : null);
 if(layer && window.DuLayer && typeof window.DuLayer.mount === 'function') return window.DuLayer.mount(layer);
 return el;
}
function __duEnsureLayerByElementId(id){
 const layerId = __duLegacyElementLayerMap[id];
 if(!layerId) return null;
 // Root1 dynamic fix8:
 // 초기화/이벤트 바인딩 단계의 qs('#closeModal') 같은 조회만으로는 Root에 주입하지 않습니다.
 // template 안의 기존 노드를 그대로 반환하고, 실제 openDialogSafe()/DuLayer.ensure() 호출 시에만 mount합니다.
 return __duFindLegacyElement('#' + __duCssEscape(layerId));
}
function __duQuerySelector(selector){
 const direct = document.querySelector(selector);
 if(direct) return direct;
 if(typeof selector === 'string'){
   const m = selector.trim().match(/^#([A-Za-z0-9_\-:.]+)$/);
   if(m){
     __duEnsureLayerByElementId(m[1]);
     const mounted = document.querySelector(selector);
     if(mounted) return mounted;
   }
 }
 return __duFindLegacyElement(selector);
}
function __duQuerySelectorAll(selector){
 const found = [...document.querySelectorAll(selector)];
 if(found.length) return found;
 if(typeof selector === 'string'){
   const m = selector.trim().match(/^#([A-Za-z0-9_\-:.]+)$/);
   if(m){
     __duEnsureLayerByElementId(m[1]);
     const mounted = [...document.querySelectorAll(selector)];
     if(mounted.length) return mounted;
   }
 }
 return __duFindLegacyElements(selector);
}
const qs=(s)=>__duQuerySelector(s), qsa=(s)=>__duQuerySelectorAll(s);

 function isMobileEdgeBrowserGlobal() {
 const ua = String(navigator.userAgent || '').toLowerCase();
 const isMobile =
 ua.includes('android') ||
 ua.includes('iphone') ||
 ua.includes('ipad') ||
 ua.includes('mobile');
 const isEdge =
 ua.includes('edga') ||
 ua.includes('edgios') ||
 ua.includes('edg/') ||
 ua.includes('edg');
 return isMobile && isEdge;
 }

 async function isMobileEdgePushEndpointBroken() {
 if(!isMobileEdgeBrowserGlobal()) return false;
 try{
 if(!('serviceWorker' in navigator) || !('PushManager' in window)) return true;
 const reg = window.pushSwRegistration || await navigator.serviceWorker.ready;
 const sub = await reg.pushManager.getSubscription();
 const endpoint = String(sub?.endpoint || '');
 window.fcmDebugLog?.('MOBILE_EDGE_ENDPOINT_CHECK', endpoint || 'empty endpoint');
 return !endpoint || endpoint.includes('permanently-removed.invalid');
 }catch(error){
 window.fcmDebugLog?.('MOBILE_EDGE_ENDPOINT_CHECK_ERROR', String(error && (error.stack || error.message) || error));
 return true;
 }
 }

 function shouldUseMobileEdgeInAppFallback() {
 return isMobileEdgeBrowserGlobal();
 }

 function dateLikeToDate(value){
 if(!value) return null;
 if(value instanceof Date && !Number.isNaN(value.getTime())) return value;
 if(value?.toDate){
 try{
 const d = value.toDate();
 return d instanceof Date && !Number.isNaN(d.getTime()) ? d : null;
 }catch(_){}
 }
 if(typeof value === 'object'){
 if(typeof value.seconds === 'number'){
 const d = new Date(value.seconds * 1000);
 return Number.isNaN(d.getTime()) ? null : d;
 }
 if(typeof value._seconds === 'number'){
 const d = new Date(value._seconds * 1000);
 return Number.isNaN(d.getTime()) ? null : d;
 }
 }
 if(typeof value === 'number'){
 const d = new Date(value > 10000000000 ? value : value * 1000);
 return Number.isNaN(d.getTime()) ? null : d;
 }
 if(typeof value === 'string'){
 const match = value.match(/(\d{4})[.\-\/년\s]+(\d{1,2})[.\-\/월\s]+(\d{1,2})/);
 if(match){
 const d = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
 return Number.isNaN(d.getTime()) ? null : d;
 }
 }
 return null;
 }

 function getItemBaseDate(item = {}){
 return dateLikeToDate(item.createdAt) ||
 dateLikeToDate(item.registeredAt) ||
 dateLikeToDate(item.createdDate) ||
 dateLikeToDate(item.registeredDate) ||
 dateLikeToDate(item.updatedAt) ||
 null;
 }

 function isRecentItem(item = {}, days = 7){
 const date = getItemBaseDate(item);
 if(!date) return false;
 const now = new Date();
 const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
 const target = new Date(date.getFullYear(), date.getMonth(), date.getDate());
 const diff = today.getTime() - target.getTime();
 return diff >= 0 && diff <= days * 24 * 60 * 60 * 1000;
 }

 function recentNewBadgeHtml(item = {}, hot = false){
 return isRecentItem(item, 7) ? `<span class="new-badge ${hot ? 'hot' : ''}">NEW</span>` : '';
 }

 function benefitOperationBadgesHtml(item = {}){
 const badges = [];
 if(item.badgeUp) badges.push('<span class="new-badge up" title="혜택이 업그레이드되었어요">UP</span>');
 if(item.badgeDeprecated) badges.push('<span class="new-badge deprecated" title="운영 종료 또는 삭제 예정이에요">삭제 예정</span>');
 return badges.length ? `<span class="benefit-operation-badges">${badges.join('')}</span>` : '';
 }

 function getBenefitCreatedTime(item = {}){
 const d = getItemBaseDate(item);
 return d ? d.getTime() : 0;
 }

 function getTopBenefitRankMap(){
 const map = new Map();
 (state.popularItems || []).slice(0, 5).forEach((row, index) => {
 const benefitId = row?.benefit?.id || row?.benefitId || row?.id || '';
 if(benefitId) map.set(String(benefitId), index + 1);
 });
 return map;
 }

 function getBenefitTopRank(item = {}){
 return getTopBenefitRankMap().get(String(item.id || '')) || 0;
 }

 function benefitTopBadgeHtml(item = {}){
 const rank = getBenefitTopRank(item);
 if(!rank || rank > 5) return '';
 const label = rank === 1 ? 'TOP 1' : `TOP ${rank}`;
 return `<span class="benefit-top-badge">${label}</span>`;
 }

 function escapeHtml(value = ''){
 return String(value ?? '')
 .replace(/&/g, '&amp;')
 .replace(/</g, '&lt;')
 .replace(/>/g, '&gt;')
 .replace(/"/g, '&quot;')
 .replace(/'/g, '&#39;');
 }

 function extractNoticeIdFromUrl(url = ''){
 try{
 const parsed = new URL(String(url || ''), window.location.origin);
 return parsed.searchParams.get('noticeId') || '';
 }catch(_){
 return '';
 }
 }

 function extractBenefitDeepLinkFromUrl(url = ''){
 try{
 const parsed = new URL(String(url || ''), window.location.origin);
 const openType = normalizeDeepLinkType(parsed.searchParams.get('open'));
 const queryId = String(parsed.searchParams.get('id') || parsed.searchParams.get('benefitId') || '').trim();
 if(openType === 'benefit' && queryId) return decodeURIComponent(queryId);

 const parts = String(parsed.pathname || '').split('/').filter(Boolean);
 if(normalizeDeepLinkType(parts[0]) === 'benefit' && parts[1]) return decodeURIComponent(parts[1]);
 }catch(_){ }
 return '';
 }

 function clearPushDeepLinkUrl(){
 try{
 const parsed = new URL(location.href);
 const openType = normalizeDeepLinkType(parsed.searchParams.get('open'));
 if(openType || parsed.searchParams.has('noticeId') || parsed.searchParams.has('view')){
 setCleanUrl(getCleanAppPath(), { replace:true });
 }
 }catch(_){ }
 }

 function clearNoticeDeepLinkUrl(){
 const hasDeepLink = window.location.search.includes('noticeId=') || window.location.search.includes('view=notices');
 if(!hasDeepLink) return;
 const cleanUrl = `${window.location.origin}${window.location.pathname}`;
 window.history.replaceState({ noticeDeepLinkHandled: true }, '', cleanUrl);
 }

 function canOpenNoticeDeepLink(){
 const approvalStatus = String(state.currentUserProfile?.approvalStatus || '');
 const accountStatus = String(state.currentUserProfile?.accountStatus || '');
 return !!state.currentUser && approvalStatus === 'approved' && accountStatus === 'active';
 }

 function requestOpenNoticeFromPush({ noticeId = '', url = '' } = {}){
 const resolvedNoticeId = String(noticeId || extractNoticeIdFromUrl(url) || '').trim();
 if(!resolvedNoticeId) return;

 if(!canOpenNoticeDeepLink()){
 pendingDeepLink.view = '';
 pendingDeepLink.noticeId = '';
 pendingNoticeOpened = false;
 clearNoticeDeepLinkUrl();
 return;
 }

 pendingDeepLink.view = 'notices';
 pendingDeepLink.noticeId = resolvedNoticeId;
 pendingNoticeOpened = false;

 if(state.notices && state.notices.length){
 const opened = openNoticeById(resolvedNoticeId);
 if(opened){
 pendingNoticeOpened = true;
 clearNoticeDeepLinkUrl();
 }
 return;
 }

 changeView('notices');
 }

 function requestOpenBenefitFromPush({ benefitId = '', url = '' } = {}){
 const resolvedBenefitId = String(benefitId || extractBenefitDeepLinkFromUrl(url) || '').trim();
 if(!resolvedBenefitId) return false;

 const targetPath = `/app?open=benefit&id=${encodeURIComponent(resolvedBenefitId)}&from=push`;

 if(!canOpenNoticeDeepLink()){
 sessionStorage.setItem('pendingDeepLink', `${location.origin}${targetPath}`);
 window.location.replace(targetPath);
 return false;
 }

 setCleanUrl(targetPath, { replace:true });

 const opened = handleCleanDeepLink({ force:true });
 if(opened){
 // 모달이 열린 뒤 뒤로가기/새로고침으로 반복 오픈되지 않도록 정리합니다.
 setTimeout(() => clearPushDeepLinkUrl(), 500);
 return true;
 }

 // 혜택 목록이 아직 로드 전이면 subscribeBenefits/renderAll에서 다시 처리됩니다.
 changeView('benefits');
 return false;
 }

 if('serviceWorker' in navigator){
 navigator.serviceWorker.addEventListener('message', (event) => {
 const data = event.data || {};
 if(data.type !== 'OPEN_NOTICE' && data.type !== 'OPEN_PUSH') return;

 const pushType = String(data.pushType || data.type || '').toLowerCase();
 const url = data.url || '';
 const benefitId = data.benefitId || extractBenefitDeepLinkFromUrl(url);

 if(benefitId || pushType === 'benefit' || pushType === 'proximity'){
 requestOpenBenefitFromPush({
 benefitId,
 url
 });
 return;
 }

 requestOpenNoticeFromPush({
 noticeId: data.noticeId || '',
 url
 });
 });
 }

 function enableHorizontalDragScroll(selector){
 const el = typeof selector === 'string' ? document.querySelector(selector) : selector;
 if(!el || el.dataset.dragScrollBound === 'true') return;
 el.dataset.dragScrollBound = 'true';

 let isPointerDown = false;
 let startX = 0;
 let startScrollLeft = 0;
 let didDrag = false;
 let suppressNextClick = false;
 const DRAG_THRESHOLD = 6;

 const stopDragging = () => {
 if(didDrag) suppressNextClick = true;
 isPointerDown = false;
 didDrag = false;
 el.classList.remove('dragging');
 };

 el.addEventListener('mousedown', (event) => {
 if(event.button !== 0) return;
 isPointerDown = true;
 didDrag = false;
 suppressNextClick = false;
 startX = event.pageX;
 startScrollLeft = el.scrollLeft;
 });

 el.addEventListener('mousemove', (event) => {
 if(!isPointerDown) return;
 const distance = event.pageX - startX;

 if(Math.abs(distance) > DRAG_THRESHOLD){
 didDrag = true;
 el.classList.add('dragging');
 event.preventDefault();
 el.scrollLeft = startScrollLeft - distance;
 }
 });

 el.addEventListener('mouseup', stopDragging);
 el.addEventListener('mouseleave', stopDragging);
 window.addEventListener('mouseup', stopDragging);

 el.addEventListener('dragstart', (event) => event.preventDefault());

 el.addEventListener('click', (event) => {
 if(!suppressNextClick) return;
 event.preventDefault();
 event.stopPropagation();
 suppressNextClick = false;
 }, true);
 }

 const globalLoadingBar = qs('#globalLoadingBar');
 let globalLoadingTimer = null;
 const initialLoadState = {
 benefits: false,
 notices: false,
 popular: false
 };

 function showGlobalLoading(){
 if(!globalLoadingBar) return;
 clearTimeout(globalLoadingTimer);
 const gnbSheet = qs('#gnbSheet');
 const gnbOverlay = qs('#gnbOverlay');
 const wasGnbOpen = !!(gnbSheet?.classList.contains('show') || document.body.classList.contains('gnb-open'));
 document.body.dataset.gnbOpenBeforeLoading = wasGnbOpen ? '1' : '0';
 document.body.classList.add('ui-loading-lock');
 document.documentElement.classList.add('ui-loading-lock');
 if(wasGnbOpen){
   gnbSheet?.classList.add('show');
   gnbOverlay?.classList.add('show');
   gnbSheet?.setAttribute('aria-hidden', 'false');
   document.body.classList.add('gnb-open');
 }
 if(window.UpickLoading && typeof window.UpickLoading.show === 'function'){
   window.UpickLoading.show();
 }else{
   globalLoadingBar.classList.add('show');
   globalLoadingBar.setAttribute('aria-hidden', 'false');
 }
 // 로딩바와 알럿이 동시에 떠도 확인 버튼 클릭을 막지 않도록 로딩바는 클릭을 받지 않습니다.
 globalLoadingBar.style.pointerEvents = 'none';
 }

 
function keepModalAlertAboveLoading(){
 const loader = qs('#globalLoadingBar') || document.getElementById('globalLoadingBar');
 if(loader){
   loader.style.pointerEvents = 'none';
   loader.style.zIndex = '2147483000';
 }
 qsa('dialog[open], #appAlert, .common-alert, .app-alert, .modal-alert, .alert-backdrop, .common-alert-backdrop').forEach((el) => {
   el.style.zIndex = '2147483600';
   el.style.pointerEvents = 'auto';
 });
}

function hideGlobalLoading(delay=160){
 if(!globalLoadingBar) return;
 clearTimeout(globalLoadingTimer);
 globalLoadingTimer = setTimeout(() => {
 const shouldKeepGnbOpen = document.body.dataset.gnbOpenBeforeLoading === '1';
 if(window.UpickLoading && typeof window.UpickLoading.hide === 'function'){
 window.UpickLoading.hide();
 }else{
 globalLoadingBar.classList.remove('show');
 globalLoadingBar.setAttribute('aria-hidden', 'true');
 }
 document.body.classList.remove('ui-loading-lock');
 document.documentElement.classList.remove('ui-loading-lock');
 if(shouldKeepGnbOpen){
   qs('#gnbSheet')?.classList.add('show');
   qs('#gnbOverlay')?.classList.add('show');
   qs('#gnbSheet')?.setAttribute('aria-hidden', 'false');
   document.body.classList.add('gnb-open');
 }
 }, delay);
 }

 function markInitialDataLoaded(key){
 if(!(key in initialLoadState)) return;
 initialLoadState[key] = true;

 const allLoaded = Object.values(initialLoadState).every(Boolean);
 if(allLoaded){
 hideGlobalLoading(120);
 }
 }

 function bindGlobalLoadingTriggers(){
 // 공개앱은 버튼/메뉴 클릭마다 로더를 띄우지 않습니다.
 // 실제 정보 조회가 시작될 때만 showGlobalLoading()을 사용합니다.
 }

function setPushStatusUi(enabled){
 const statusEl = qs('#pushStatusText');
 const subEl = qs('#pushStatusSub');
 const enableBtn = qs('#enablePushBtn');
 const disableBtn = qs('#disablePushBtn');
 const gnbStatusPill = qs('#gnbPushStatusPill');
 const gnbStatusText = qs('#gnbPushStatusText');

 state.isPushEnabledForThisDevice = !!enabled;

 if(statusEl){
 statusEl.textContent = enabled ? '푸시 알림 켜짐' : '이 기기는 아직 푸시 알림 꺼짐입니다';
 }
 if(subEl){
 subEl.textContent = enabled
 ? '현재 브라우저에서 알림을 받을 수 있습니다.'
 : '현재 브라우저/기기에서만 다시 알림 허용을 진행해 주세요.';
 }
 if(enableBtn) enableBtn.classList.toggle('hidden', !!enabled);
 if(disableBtn) disableBtn.classList.toggle('hidden', !enabled);

 if(gnbStatusPill){
 gnbStatusPill.textContent = enabled ? '푸시 알림 켜짐' : '푸시 알림 꺼짐';
 gnbStatusPill.style.background = enabled ? '#eff6ff' : '#f8fafc';
 gnbStatusPill.style.color = enabled ? '#1d4ed8' : '#475569';
 gnbStatusPill.style.borderColor = enabled ? '#bfdbfe' : '#e2e8f0';
 }
 if(gnbStatusText){
 gnbStatusText.textContent = enabled
 ? '현재 브라우저에서 공지와 주요 안내를 바로 받을 수 있습니다.'
 : '아직 이 기기는 등록되지 않았습니다. 버튼을 눌러 알림을 켤 수 있습니다.';
 }
 if(gnbStatusPill){
   gnbStatusPill.setAttribute('aria-label', enabled ? '푸시 알림 끄기' : '푸시 알림 켜기');
   gnbStatusPill.dataset.pushEnabled = enabled ? 'true' : 'false';
 }
 }

 function saveCurrentViewScroll(){
 state.scrollMap[state.view] = window.scrollY || window.pageYOffset || 0;
 }

 function restoreViewScroll(view){
 const nextY = Number(state.scrollMap[view] || 0);
 requestAnimationFrame(() => {
 window.scrollTo({ top: nextY, behavior: 'auto' });
 });
 }

 function getCurrentRoleMeta(){
 return getAccountRoleMeta(state.currentUserProfile || {});
 }

 function isAdminRole(){
 const role = getCurrentRoleMeta().role;
 return role === 'root' || role === 'admin';
 }

 function isRootRole(){
 return getCurrentRoleMeta().role === 'root';
 }

 function applyBodyRoleClass(roleMeta = getCurrentRoleMeta()){
 document.body.classList.remove('app-role-root','app-role-admin','app-role-resident');
 document.body.classList.add(`app-role-${roleMeta.role || 'resident'}`);
 }


 function syncGnbOperationAccess(roleMeta = getCurrentRoleMeta()){
 const role = String(roleMeta?.role || '').toLowerCase();
 const allowed = role === 'root' || role === 'admin';
 const topBtn = qs('#openGnbOperationManageBtn');
 if(topBtn){
 topBtn.hidden = !allowed;
 topBtn.setAttribute('aria-hidden', allowed ? 'false' : 'true');
 topBtn.style.setProperty('display', allowed ? 'grid' : 'none', 'important');
 topBtn.tabIndex = allowed ? 0 : -1;
 }
 const modal = qs('#gnbOperationManageModal');
 if(modal && !allowed && modal.open){
 try{ modal.close(); }catch(_){ modal.removeAttribute('open'); }
 }
 }

 function enforceShareInsightAccess(){
 if(state.view === 'shareinsights' && !isAdminRole()){
 state.view = 'home';
 return false;
 }
 return true;
 }


 function makeViewTitleTrendBadges(menu){
  if(!menu) return '';
  const flags = getMenuTrendFlags(menu);
  const pieces = [];
  if(flags.isPopular || flags.isHot) pieces.push('<span class="view-title-trend-badge hot">HOT</span>');
  if(flags.isNew) pieces.push('<span class="view-title-trend-badge new">NEW</span>');
  return pieces.length ? `<span class="view-title-trend-badges">${pieces.join('')}</span>` : '';
 }
 function refreshCurrentViewTitleTrendBadges(){
  // HOT/NEW 제목 배지는 legacy(.view-title-*)와 final(.view-final-*) 로직이 함께 실행될 수 있어
  // 두 계열을 모두 제거한 뒤 1회만 다시 렌더링합니다.
  qsa('.view-title-trend-badges,.view-final-trend-badges').forEach(el => el.remove());
  const view = state?.view || 'home';
  const menu = findMenuByView(view);
  const html = makeViewTitleTrendBadges(menu);
  if(!html) return;
  const viewEl = qs(`#view-${view}`);
  if(!viewEl) return;
  const title = viewEl.querySelector('.hero h2, .calendar-hero h3, .ai-view-hero h3, .section-head h3, h3, h2');
  if(title && !title.querySelector('.view-title-trend-badges,.view-final-trend-badges')){
    title.insertAdjacentHTML('afterbegin', html);
  }
 }

 function changeView(nextView){
 if(!nextView) return;
 if(nextView === 'shareinsights' && !isAdminRole()){
 openModalAlert('공유 인사이트는 관리자 계정에서만 확인할 수 있습니다.');
 return;
 }
 saveCurrentViewScroll();
 state.view = nextView;
 if(nextView === 'favorite' || nextView === 'top5' || nextView === 'map' || nextView === 'calendar' || nextView === 'shareinsights') state.filter = 'all';
 renderAll();
 try{
   document.dispatchEvent(new CustomEvent('upick:view-change', { detail:{ view: nextView } }));
   window.dispatchEvent(new CustomEvent('upick:view-change', { detail:{ view: nextView } }));
 }catch(_){}
 bindPremiumSectionTitles();
 if(nextView === 'map') setTimeout(() => renderMapMode({ fitBounds: true }), 80);
 restoreViewScroll(nextView);
 }

 function updateGnbActive(){
 qsa('.gnb-icon-btn[data-view-link]').forEach(btn => {
 btn.classList.toggle('gnb-home-active', btn.dataset.viewLink === state.view);
 });
 }

 const alertEl = qs('#appAlert');
 const alertMsgEl = qs('#appAlertMessage');
 const alertTitleEl = qs('#appAlertTitle');
 const alertIconEl = qs('#appAlertIcon');
 const alertConfirmEl = qs('#appAlertConfirm');
 const alertCancelEl = qs('#appAlertCancel');
 let alertFocusTarget = null;
 let alertResolver = null;

 function openModalBase({
 title='안내',
 message='',
 focusTarget=null,
 mode='alert',
 confirmText='확인',
 cancelText='취소',
 icon=''
 } = {}){
 alertFocusTarget = focusTarget;
 const resolvedIcon = icon || (mode === 'confirm' ? '' : '');
 alertTitleEl.textContent = title;
 alertMsgEl.textContent = message;
 alertIconEl.textContent = resolvedIcon;
 alertConfirmEl.textContent = confirmText;
 alertCancelEl.textContent = cancelText;
 alertCancelEl.classList.toggle('hidden', mode !== 'confirm');
 try{
 if(typeof alertEl.showModal === 'function' && !alertEl.open){
 alertEl.showModal();
 }
 }catch(error){
 console.warn('앱 알림 dialog 표시 실패, fallback 처리', error);
 }
 alertEl.classList.add('show');
 alertEl.setAttribute('aria-hidden', 'false');
 requestAnimationFrame(() => {
 (mode === 'confirm' ? alertCancelEl : alertConfirmEl).focus();
 });
 return new Promise((resolve) => {
 alertResolver = resolve;
 });
 }

 function focusAfterCommonAlert(target){
 if(target && typeof target.focus === 'function'){
 try{ target.focus({preventScroll:true}); }catch(_){ try{ target.focus(); }catch(__){} }
 }
}

function openModalAlert(message, focusTarget=null, title='안내'){
 if(typeof window.showCommonAlert === 'function'){
 return window.showCommonAlert({
 title,
 message,
 confirmText:'확인',
 onClose:() => focusAfterCommonAlert(focusTarget)
 });
 }
 return openModalBase({ title, message, focusTarget, mode:'alert', confirmText:'확인', icon:'' });
 }

 function openModalConfirm(message, focusTarget=null, title='확인', confirmText='확인', cancelText='취소'){
 if(typeof window.showCommonConfirm === 'function'){
 return window.showCommonConfirm({
 title,
 message,
 confirmText,
 cancelText,
 onCancel:() => focusAfterCommonAlert(focusTarget)
 });
 }
 return openModalBase({ title, message, focusTarget, mode:'confirm', confirmText, cancelText, icon:'' });
 }

 // tracking.js 등 외부 모듈에서도 앱 내부 모달을 사용할 수 있도록 전역 연결
 window.openModalAlert = openModalAlert;
 window.openModalConfirm = openModalConfirm;

 function closeModal(result=false){
 alertEl.classList.remove('show');
 alertEl.setAttribute('aria-hidden', 'true');
 try{
 if(typeof alertEl.close === 'function' && alertEl.open){
 alertEl.close();
 }
 }catch(error){
 console.warn('앱 알림 dialog 닫기 실패', error);
 }
 if(result === false && alertFocusTarget){ alertFocusTarget.focus(); }
 const resolver = alertResolver;
 alertResolver = null;
 if(resolver) resolver(result);
 }

 alertConfirmEl.addEventListener('click', () => { if(window.UpickAlert && typeof window.UpickAlert.alert === 'function') return; closeModal(true); });
 alertCancelEl.addEventListener('click', () => { if(window.UpickAlert && typeof window.UpickAlert.alert === 'function') return; closeModal(false); });
 // 앱 알림은 바깥 영역 클릭으로 닫지 않습니다.
window.addEventListener('keydown', (event) => {
 if(!alertEl.classList.contains('show')) return;
 if(event.key === 'Escape') closeModal(false);
 });

 const redirectToLogin=()=>{
 if(location.pathname.startsWith('/notice/') || location.pathname.startsWith('/benefit/')){
 sessionStorage.setItem('pendingDeepLink', location.href);
 }
 window.location.replace(LOGIN_PAGE_URL);
 };
 function getDisplayNickname(){
 return state.currentUserProfile?.nickname || state.currentUser?.displayName || state.currentUser?.email || '입주민';
 }
 function escapeAttr(value=''){
 return String(value ?? '')
 .replaceAll('&','&amp;')
 .replaceAll('"','&quot;')
 .replaceAll("'",'&#39;')
 .replaceAll('<','&lt;')
 .replaceAll('>','&gt;');
 }

 function getAccountRoleMeta(profile = {}){
 const role = String(profile.role || profile.userRole || '').toLowerCase();

 if(role === 'root'){
 return {
 role,
 label: '최고 관리자',
 chip: '최고 관리자',
 className: 'role-root',
 avatar: ''
 };
 }

 if(role === 'admin'){
 return {
 role,
 label: '일반 관리자',
 chip: '일반 관리자',
 className: 'role-admin',
 avatar: ''
 };
 }

 return {
 role: 'resident',
 label: '입주민',
 chip: '입주민',
 className: 'role-resident',
 avatar: ''
 };
 }

 function getDisplayUnitInfo(){
 const roleMeta = getAccountRoleMeta(state.currentUserProfile || {});
 if(roleMeta.role === 'root' || roleMeta.role === 'admin') return roleMeta.label;

 const building = state.currentUserProfile?.building;
 const unit = state.currentUserProfile?.unit;
 if(building && unit) return `${building}동 ${unit}호`;
 return roleMeta.label;
 }

 function getProfileImageUrl(){
 const profile = state.currentUserProfile || {};
 const rawUrl = String(profile.profileImageUrl || profile.photoUrl || profile.avatarUrl || '').trim();
 if(!rawUrl) return '';
 const cacheKey = profile.profileImageCacheKey
 || profile.profileImageUpdatedAt?.seconds
 || profile.updatedAt?.seconds
 || '';
 if(!cacheKey) return rawUrl;
 const separator = rawUrl.includes('?') ? '&' : '?';
 return rawUrl.includes('profileCache=') ? rawUrl : `${rawUrl}${separator}profileCache=${encodeURIComponent(cacheKey)}`;
 }

 function renderProfileAvatar(target, roleMeta, profileImageUrl){
 if(!target) return;
 target.classList.remove('has-photo');

 if(profileImageUrl){
 target.classList.add('has-photo');
 target.innerHTML = `<img src="${escapeAttr(profileImageUrl)}" alt="프로필 이미지" loading="eager" decoding="async">`;
 return;
 }

 // v85: 기본값도 빈 텍스트가 아니라 실제 SVG 아이콘으로 유지합니다.
 // 빈 원형 버튼으로 보이거나 헤더 동기화가 실패하는 문제를 막기 위한 안정화 처리입니다.
 target.innerHTML = `<img class="upick-svg-icon" src="/icons/internal/user.svg" alt="계정" loading="eager" decoding="async">`;
 }

 function syncHeaderProfileAvatars(profileImageUrl = getProfileImageUrl()){
 // 모바일 공통 헤더/글로벌 히어로는 동적으로 재생성되는 DOM이라
 // 입장 직후 또는 화면 전환 직후 한 번 더 직접 동기화합니다.
 try{
 const roleMeta = getAccountRoleMeta(state.currentUserProfile || {});
 const selectors = [
 '.upick-header-profile-avatar',
 '#globalUserChip .user-avatar',
 '.global-user-chip .user-avatar'
 ];
 selectors.forEach((selector) => {
 qsa(selector).forEach((target) => renderProfileAvatar(target, roleMeta, profileImageUrl));
 });
 qsa('[data-upick-profile] img, .upick-header-profile-btn img').forEach((img) => {
 if(!profileImageUrl) return;
 if(img.getAttribute('src') !== profileImageUrl) img.setAttribute('src', profileImageUrl);
 img.closest('.upick-header-profile-avatar')?.classList.add('has-photo');
 });
 }catch(error){
 console.warn('헤더 프로필 이미지 동기화 실패:', error);
 }
 }

 function applyRoleClass(target, className){
 if(!target) return;
 target.classList.remove('role-root','role-admin','role-resident');
 target.classList.add(className || 'role-resident');
 }

 function updateUserChip(){
 const nickname = getDisplayNickname();
 const unitInfo = getDisplayUnitInfo();
 const profileImageUrl = getProfileImageUrl();
 const roleMeta = getAccountRoleMeta(state.currentUserProfile || {});

 const nicknameEl = qs('#userNickname');
 const unitInfoEl = qs('#userUnitInfo');
 const gnbAccountNameEl = qs('#gnbAccountName');
 const gnbAccountUnitEl = qs('#gnbAccountUnit');
 const userChipEl = qs('#userChip');
 const gnbAccountCardEl = qs('#gnbSettingsAccountSummary .gnb-account-card');
 const userAvatarEl = qs('#userChip .user-avatar');
 const gnbAvatarEl = qs('#gnbSettingsAccountSummary .gnb-account-avatar');

 if(nicknameEl) nicknameEl.textContent = nickname;
 if(unitInfoEl) unitInfoEl.innerHTML = roleMeta.role === 'root' || roleMeta.role === 'admin'
 ? `<span class="role-badge-chip ${roleMeta.role}">${escapeHtml(roleMeta.label)}</span>`
 : unitInfo;
 if(gnbAccountNameEl) gnbAccountNameEl.textContent = nickname;
 if(gnbAccountUnitEl) gnbAccountUnitEl.innerHTML = roleMeta.role === 'root' || roleMeta.role === 'admin'
 ? `<span class="role-badge-chip ${roleMeta.role}">${escapeHtml(roleMeta.chip)}</span>`
 : unitInfo;

 applyRoleClass(userChipEl, roleMeta.className);
 applyRoleClass(gnbAccountCardEl, roleMeta.className);
 applyBodyRoleClass(roleMeta);
 syncGnbOperationAccess(roleMeta);
 renderProfileAvatar(userAvatarEl, roleMeta, profileImageUrl);
 renderProfileAvatar(gnbAvatarEl, roleMeta, profileImageUrl);
 syncHeaderProfileAvatars(profileImageUrl);
 syncFontSizeSettingUi();
 }

 function forcePublicAppInitialRender(){
  // 입장 직후 세션 보안 체크가 먼저 끝나는 경우에도
  // 프로필 이미지와 홈 네비 활성 상태가 반드시 한 번은 반영되도록 보정합니다.
  try{
    if(!state.view) state.view = 'home';
    updateUserChip();
    updateView?.();
    updateBottomNavActiveState?.();
    if(typeof renderDynamicBottomNav === 'function'){
      Promise.resolve(renderDynamicBottomNav(true)).then(() => {
        updateBottomNavActiveState?.();
        try{ window.__upickStableBottomBadge?.(); }catch(_){ }
        try{ window.__upickGlobalHeroRefresh?.(); }catch(_){ }
      }).catch(() => {});
    }
    setTimeout(() => {
      updateUserChip();
      syncHeaderProfileAvatars?.();
      updateBottomNavActiveState?.();
      try{ window.__upickStableBottomBadge?.(); }catch(_){ }
      try{ window.__upickGlobalHeroRefresh?.(); }catch(_){ }
    }, 120);
  }catch(error){
    console.warn('초기 프로필/네비 렌더링 보정 실패:', error);
  }
 }

 function normalizeProfileInput(value=''){
 return String(value || '').trim();
 }

 function validateProfileNicknameFormat(value=''){
 const v = normalizeProfileInput(value);
 return v.length >= 2 && v.length <= 20;
 }

 function setAccountNicknameMessage(type='', message=''){
 const msg = qs('#accountNicknameMsg');
 if(!msg) return;
 msg.className = `account-field-msg ${type}`.trim();
 msg.textContent = message || '';
 }

 function setAccountNicknameState(stateValue=null){
 const input = qs('#accountNicknameInput');
 if(!input) return;
 input.classList.remove('valid','invalid');
 if(stateValue === true) input.classList.add('valid');
 if(stateValue === false) input.classList.add('invalid');
 }

 let accountNicknameCheckedValue = '';
 let accountNicknameCheckStatus = 'idle';

 function setAccountNicknameCheckStatus(status='idle', checkedValue=''){
 accountNicknameCheckStatus = status;
 accountNicknameCheckedValue = checkedValue || '';
 const input = qs('#accountNicknameInput');
 const checkBtn = qs('#accountCheckNicknameBtn');
 if(input) input.dataset.nicknameCheckStatus = status;
 if(checkBtn) checkBtn.dataset.nicknameCheckStatus = status;
 }

 function getOriginalAccountNickname(){
 return normalizeProfileInput(state.currentUserProfile?.nickname || state.currentUser?.displayName || '');
 }

 async function checkAccountNicknameDuplicate({ silent=false } = {}){
 const input = qs('#accountNicknameInput');
 const checkBtn = qs('#accountCheckNicknameBtn');
 const nickname = normalizeProfileInput(input?.value || '');
 const originalNickname = getOriginalAccountNickname();
 setAccountNicknameCheckStatus('idle');
 setAccountNicknameState(null);

 if(!nickname){
 setAccountNicknameCheckStatus('empty');
 setAccountNicknameMessage('err', '닉네임을 입력해 주세요.');
 if(!silent) await openModalAlert('닉네임을 입력해 주세요.', input);
 return false;
 }

 if(!validateProfileNicknameFormat(nickname)){
 setAccountNicknameCheckStatus('invalid');
 setAccountNicknameState(false);
 setAccountNicknameMessage('err', '닉네임은 2~20자로 입력해 주세요.');
 if(!silent) await openModalAlert('닉네임은 2~20자로 입력해 주세요.', input);
 return false;
 }

 if(nickname === originalNickname){
 setAccountNicknameCheckStatus('same');
 setAccountNicknameState(false);
 setAccountNicknameMessage('err', '현재 사용 중인 닉네임과 동일합니다. 변경할 닉네임을 입력해 주세요.');
 if(!silent) await openModalAlert('현재 사용 중인 닉네임과 동일합니다. 변경할 닉네임을 입력해 주세요.', input);
 return false;
 }

 if(!CHECK_NICKNAME_URL){
 setAccountNicknameCheckStatus('error');
 setAccountNicknameState(false);
 setAccountNicknameMessage('err', '닉네임 중복 확인 주소가 설정되지 않았습니다.');
 if(!silent) await openModalAlert('닉네임 중복 확인 주소가 설정되지 않았습니다.', checkBtn || input);
 return false;
 }

 try{
 setAccountNicknameCheckStatus('checking');
 if(checkBtn){
 checkBtn.disabled = true;
 checkBtn.textContent = '확인 중';
 }
 setAccountNicknameMessage('', '닉네임 중복 여부를 확인 중입니다...');
 const url = `${CHECK_NICKNAME_URL}?nickname=${encodeURIComponent(nickname)}`;
 const response = await fetch(url, { method:'GET' });
 const result = await response.json().catch(() => ({}));

 if(!response.ok || !result.ok){
 throw new Error(result.message || '닉네임 중복 확인 중 오류가 발생했습니다.');
 }

 if(!result.available){
 setAccountNicknameCheckStatus('duplicate');
 setAccountNicknameState(false);
 setAccountNicknameMessage('err', result.message || '이미 사용 중인 닉네임입니다.');
 if(!silent) await openModalAlert(result.message || '이미 사용 중인 닉네임입니다.', input);
 return false;
 }

 setAccountNicknameCheckStatus('available', nickname);
 setAccountNicknameState(true);
 setAccountNicknameMessage('ok', result.message || '사용 가능한 닉네임입니다.');
 return true;
 }catch(error){
 setAccountNicknameCheckStatus('error');
 setAccountNicknameState(false);
 setAccountNicknameMessage('err', error.message || '닉네임 중복 확인 중 오류가 발생했습니다.');
 if(!silent) await openModalAlert(error.message || '닉네임 중복 확인 중 오류가 발생했습니다.', checkBtn || input);
 return false;
 }finally{
 if(checkBtn){
 checkBtn.disabled = false;
 checkBtn.textContent = '중복 확인';
 }
 }
 }

 function fillAccountEditForm(){
 const profile = state.currentUserProfile || {};
 const nicknameInput = qs('#accountNicknameInput');
 const buildingInput = qs('#accountBuildingInput');
 const unitInput = qs('#accountUnitInput');
 if(nicknameInput) nicknameInput.value = normalizeProfileInput(profile.nickname || state.currentUser?.displayName || '');
 setAccountNicknameCheckStatus('idle');
 setAccountNicknameState(null);
 setAccountNicknameMessage('', '');
 if(buildingInput) buildingInput.value = normalizeProfileInput(profile.building || '');
 if(unitInput) unitInput.value = normalizeProfileInput(profile.unit || '');
 updateProfileImagePreview();
 setProfileUploadStatus('이미지 파일은 3MB 이하를 권장합니다.');
 }

 function updateProfileImagePreview(){
 const preview = qs('#accountProfilePreview');
 if(!preview) return;
 const url = getProfileImageUrl();
 const roleMeta = getAccountRoleMeta(state.currentUserProfile || {});
 const plusBtn = `<button class="profile-upload-plus" id="accountProfileUploadBtn" type="button" title="프로필 이미지 업로드" aria-label="프로필 이미지 업로드">+</button>`;
 preview.classList.toggle('has-photo', !!url);
 preview.innerHTML = url
 ? `<img src="${escapeAttr(url)}" alt="프로필 미리보기">${plusBtn}`
 : `${escapeHtml(roleMeta.avatar || '')}${plusBtn}`;
 bindProfileUploadButton();
 }

 function animateProfileImageApplied(){
 ['#accountProfilePreview', '#userChip .user-avatar', '#gnbSettingsAccountSummary .gnb-account-avatar'].forEach((selector) => {
 const el = qs(selector);
 if(!el) return;
 el.classList.remove('profile-saved');
 void el.offsetWidth;
 el.classList.add('profile-saved');
 setTimeout(() => el.classList.remove('profile-saved'), 650);
 });
 }

 async function deletePreviousProfileImageIfNeeded(previousPath='', nextPath=''){
 const oldPath = normalizeProfileInput(previousPath);
 const newPath = normalizeProfileInput(nextPath);
 if(!oldPath || oldPath === newPath) return;
 if(!oldPath.startsWith(`profile-images/${state.currentUser.uid}/`)) return;
 try{
 await deleteObject(storageRef(storage, oldPath));
 }catch(error){
 console.warn('이전 프로필 이미지 삭제 실패 또는 이미 삭제됨', error);
 }
 }

 function setProfileUploadStatus(message, type=''){
 const statusEl = qs('#accountProfileUploadStatus');
 if(!statusEl) return;
 statusEl.textContent = message || '';
 statusEl.classList.remove('success','error');
 if(type) statusEl.classList.add(type);
 }

 function bindProfileUploadButton(){
 const uploadBtn = qs('#accountProfileUploadBtn');
 const fileInput = qs('#accountProfileFileInput');
 if(!uploadBtn || !fileInput || uploadBtn.dataset.bound === '1') return;
 uploadBtn.dataset.bound = '1';
 uploadBtn.addEventListener('click', () => fileInput.click());
 }

 function sanitizeProfileFileName(name='profile'){
 return String(name || 'profile').replace(/[^a-zA-Z0-9._-]/g, '_').slice(-80) || 'profile.png';
 }

 function getProfileFileExtension(file){
 const byType = String(file?.type || '').split('/')[1] || '';
 const normalized = byType.replace('jpeg','jpg').replace(/[^a-z0-9]/gi,'').toLowerCase();
 if(normalized) return normalized;
 const fromName = String(file?.name || '').split('.').pop() || 'png';
 return fromName.replace(/[^a-z0-9]/gi,'').toLowerCase() || 'png';
 }

 async function handleProfileImageFileChange(event){
 const file = event?.target?.files?.[0];
 if(!file) return;
 try{
 if(!state.currentUser?.uid){
 await openModalAlert('입장 후 이용해 주세요.');
 return;
 }
 if(!file.type || !file.type.startsWith('image/')){
 await openModalAlert('이미지 파일만 업로드할 수 있습니다.', qs('#accountProfileUploadBtn'));
 return;
 }
 if(file.size > 3 * 1024 * 1024){
 await openModalAlert('프로필 이미지는 3MB 이하 파일로 올려 주세요.', qs('#accountProfileUploadBtn'));
 return;
 }

 const preview = qs('#accountProfilePreview');
 const uploadBtn = qs('#accountProfileUploadBtn');
 const previousPath = state.currentUserProfile?.profileImagePath || '';
 preview?.classList.add('profile-uploading');
 if(uploadBtn) uploadBtn.disabled = true;
 setProfileUploadStatus('프로필 이미지를 업로드하는 중입니다...', '');

 const ext = getProfileFileExtension(file);
 const cacheKey = Date.now();
 const path = `profile-images/${state.currentUser.uid}/profile_${cacheKey}.${ext}`;
 const fileRef = storageRef(storage, path);
 await uploadBytes(fileRef, file, {
 contentType:file.type,
 customMetadata:{ ownerUid:state.currentUser.uid, purpose:'profile-image' }
 });
 const downloadUrl = await getDownloadURL(fileRef);

 await setDoc(doc(db, 'users', state.currentUser.uid), {
 profileImageUrl:downloadUrl,
 profileImagePath:path,
 profileImageCacheKey:String(cacheKey),
 profileImageUpdatedAt:serverTimestamp(),
 updatedAt:serverTimestamp()
 }, { merge:true });

 state.currentUserProfile = {
 ...(state.currentUserProfile || {}),
 profileImageUrl:downloadUrl,
 profileImagePath:path,
 profileImageCacheKey:String(cacheKey)
 };

 updateUserChip();
 updateProfileImagePreview();
 animateProfileImageApplied();
 setProfileUploadStatus('프로필 이미지가 바로 반영되었습니다.', 'success');
 deletePreviousProfileImageIfNeeded(previousPath, path);
 }catch(error){
 console.error('프로필 이미지 업로드 실패', error);
 setProfileUploadStatus('업로드 중 오류가 발생했습니다. Storage/Firestore 규칙을 확인해 주세요.', 'error');
 await openModalAlert('프로필 이미지 업로드 중 오류가 발생했습니다.', qs('#accountProfileUploadBtn'));
 }finally{
 const preview = qs('#accountProfilePreview');
 const uploadBtn = qs('#accountProfileUploadBtn');
 preview?.classList.remove('profile-uploading');
 if(uploadBtn) uploadBtn.disabled = false;
 if(event?.target) event.target.value = '';
 }
 }

 

/* ===== Global modal backdrop lock =====
   모든 dialog / role=dialog / alertdialog 계열은 바깥 영역 클릭으로 닫지 않습니다.
   사용자는 X, 취소, 확인 등 명시 버튼으로만 닫을 수 있습니다. */
function lockModalBackdropClick(event){
  const target = event.target;
  const current = event.currentTarget;

  if(target === current){
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation?.();
  }
}

function bindGlobalModalBackdropLock(){
  const selectors = [
    'dialog',
    '.app-alert',
    '[role="dialog"]',
    '[role="alertdialog"]',
    '.modal',
    '.modal-overlay',
    '.modal-backdrop',
    '.sheet-modal'
  ];

  document.querySelectorAll(selectors.join(',')).forEach((el) => {
    if(el.dataset.backdropLockBound === '1') return;
    el.dataset.backdropLockBound = '1';
    el.addEventListener('click', lockModalBackdropClick, true);
    el.addEventListener('pointerdown', lockModalBackdropClick, true);
  });
}

bindGlobalModalBackdropLock();

const modalBackdropLockObserver = new MutationObserver(() => {
  bindGlobalModalBackdropLock();
});

modalBackdropLockObserver.observe(document.documentElement, {
  childList:true,
  subtree:true
});

function preventBackdropClose(event){
  if(event.target === event.currentTarget){
    event.preventDefault();
    event.stopPropagation();
  }
}

['#accountEditModal', '#passwordChangeModal', '#appAlert'].forEach((selector) => {
  qs(selector)?.addEventListener('click', preventBackdropClose, true);
});

function isLayerOpenLike(modal){
 return !!(modal && (modal.open || modal.hasAttribute('open') || modal.classList.contains('show') || modal.classList.contains('upick-motion-open')));
}


/* v20260527: 공통 팝업 스택 관리자
   - fixed z-index 경쟁을 없애고, 팝업을 열 때마다 순번 기반 z-index를 부여합니다.
   - CSS 파일 로드 순서나 dialog/div 혼재로 인한 묻힘 현상을 방지합니다.
   - 알럿은 별도 공통 알럿 z-index가 더 높으므로 여기서는 일반 팝업/모달만 관리합니다. */
const UpickPopupStack = window.UpickPopupStack || (function(){
  let seq = 0;
  const base = 50000;
  const step = 20;
  const opened = [];

  function isStackTarget(el){
    if(!el || !el.id) return false;
    if(el.id === 'appAlert' || el.classList?.contains('app-alert')) return false;
    if(el.id === 'globalLoadingBar') return false;
    return !!(
      el.classList?.contains('upick-div-dialog') ||
      el.classList?.contains('upick-div-modal') ||
      el.classList?.contains('upick-motion-dialog') ||
      el.matches?.('[role="dialog"][aria-modal="true"]')
    );
  }

  function prune(){
    for(let i = opened.length - 1; i >= 0; i -= 1){
      const el = opened[i];
      if(!el || !document.documentElement.contains(el) || !(el.hasAttribute('open') || el.classList.contains('show') || el.classList.contains('upick-motion-open'))){
        opened.splice(i, 1);
      }
    }
  }

  function bring(el){
    if(!isStackTarget(el)) return 0;
    prune();
    const oldIndex = opened.indexOf(el);
    if(oldIndex >= 0) opened.splice(oldIndex, 1);
    opened.push(el);
    seq += 1;
    const z = base + (seq * step);
    el.dataset.upickStackIndex = String(opened.length - 1);
    el.dataset.upickStackZ = String(z);
    try{ el.style.setProperty('z-index', String(z), 'important'); }catch(_){ el.style.zIndex = String(z); }

    const panel = el.querySelector?.(':scope > .upick-div-modal-panel, :scope > .upick-div-dialog-panel');
    if(panel){
      panel.style.setProperty('position', 'relative', 'important');
      panel.style.setProperty('z-index', '1', 'important');
    }
    return z;
  }

  function release(el){
    if(!el) return;
    const i = opened.indexOf(el);
    if(i >= 0) opened.splice(i, 1);
    delete el.dataset.upickStackIndex;
    delete el.dataset.upickStackZ;
    try{ el.style.removeProperty('z-index'); }catch(_){ el.style.zIndex = ''; }
    prune();
  }

  function top(){ prune(); return opened[opened.length - 1] || null; }
  return { bring, release, top, prune };
})();
window.UpickPopupStack = UpickPopupStack;

function openLayerElementLikeDialog(modal){
 if(!modal) return;
 try{ modal = __duMountLegacyElement(modal) || modal; }catch(_){}
 try{
  if(typeof modal.showModal === 'function' && !modal.open) modal.showModal();
  else modal.setAttribute('open','');
 }catch(_){
  try{ modal.setAttribute('open',''); }catch(__){}
 }
}

function closeLayerElementLikeDialog(modal){
 if(!modal) return;
 try{
  if(typeof modal.close === 'function' && modal.open) modal.close();
  else modal.removeAttribute('open');
 }catch(_){
  try{ modal.removeAttribute('open'); }catch(__){}
 }
}

function getAccountDivModalPanel(modal){
  return modal?.querySelector?.('.upick-div-modal-panel') || modal;
}

function openAccountMotionDialog(modal, focusSelector){
 if(!modal) return;
 // Root1 전환 후 설정 모음이 열린 상태에서 계정/비밀번호 팝업을 열면
 // 같은 modal root 안에서 z-index/DOM 순서가 섞일 수 있으므로,
 // 계정 계열 팝업은 항상 현재 Root의 마지막 자식 + 최상위 z-index로 승격합니다.
 try{
  modal = __duMountLegacyElement(modal) || modal;
  const modalRoot = document.getElementById('duLayerRoot');
  if(modalRoot && modal.parentNode === modalRoot) modalRoot.appendChild(modal);
  modal.dataset.upickAccountOverlay = 'true';
  modal.style.setProperty('z-index', '2147483560', 'important');
  const settings = document.getElementById('settingsSuiteModal');
  if(settings && settings !== modal && (settings.classList.contains('show') || settings.hasAttribute('open') || settings.getAttribute('aria-hidden') === 'false')){
    settings.classList.add('is-under-account-popup');
    settings.style.setProperty('z-index', '2147483500', 'important');
  }
 }catch(_){}
 if(isLayerOpenLike(modal)) closeLayerElementLikeDialog(modal);
 const panel = getAccountDivModalPanel(modal);
 modal.classList.remove('show','closing','is-closing','upick-motion-closing','upick-motion-open','upick-motion-layer','upick-motion-panel','upick-motion-dialog');
 panel?.classList?.remove('show','closing','is-closing','upick-motion-closing','upick-motion-open','upick-motion-panel','upick-motion-dialog');
 modal.classList.add('upick-div-modal','upick-motion-layer');
 panel?.classList?.add('upick-motion-panel');
 openLayerElementLikeDialog(modal);
 modal.setAttribute('aria-hidden','false');
 try{ UpickPopupStack.bring(modal); }catch(_){}
 try{ modal.style.setProperty('z-index', '2147483560', 'important'); }catch(_){}
 if(window.UpickMotion){
  window.UpickMotion.open(modal,{
   activeClass:'show',
   closingClass:'is-closing',
   panel:panel,
   duration:320,
   afterOpen:function(){ requestAnimationFrame(function(){ qs(focusSelector)?.focus?.({preventScroll:true}); }); }
  });
 }else{
  requestAnimationFrame(function(){
    modal.classList.add('show','upick-motion-open');
    panel?.classList?.add('upick-motion-open');
    qs(focusSelector)?.focus?.({preventScroll:true});
  });
 }
}

function closeAccountMotionDialog(modal, afterClose){
 if(!modal){ if(typeof afterClose === 'function') afterClose(); return; }
 const panel = getAccountDivModalPanel(modal);
 var finished=false;
 function syncAccountLockSoon(){
  try{
    if(typeof window.__upickV8SyncModalScrollLock === 'function') setTimeout(window.__upickV8SyncModalScrollLock, 0);
    else if(typeof window.__upickSyncModalScrollLock === 'function') setTimeout(window.__upickSyncModalScrollLock, 0);
    if(window.DuLayerStackManager && typeof window.DuLayerStackManager.requestSync === 'function') setTimeout(window.DuLayerStackManager.requestSync, 0);
  }catch(_){}
 }
 var done=function(){
  if(finished) return;
  finished=true;
  modal.classList.remove('show','closing','is-closing','upick-motion-dialog','upick-motion-layer','upick-motion-panel','upick-motion-open','upick-motion-closing');
  panel?.classList?.remove('show','closing','is-closing','upick-motion-dialog','upick-motion-panel','upick-motion-open','upick-motion-closing');
  modal.setAttribute('aria-hidden','true');
  modal.removeAttribute('open');
  closeLayerElementLikeDialog(modal);
  try{ modal.style.removeProperty('z-index'); }catch(_){}
  try{ UpickPopupStack.release(modal); }catch(_){}
  try{
    if(window.DuLayer && typeof window.DuLayer.unmount === 'function') window.DuLayer.unmount(modal);
    else if(modal.parentNode && modal.closest && modal.closest('.du-layer-root')) modal.parentNode.removeChild(modal);
  }catch(_){}
  try{
    const accountOpen = document.querySelector('#accountEditModal.show,#accountEditModal[open],#accountEditModal[aria-hidden="false"],#passwordChangeModal.show,#passwordChangeModal[open],#passwordChangeModal[aria-hidden="false"]');
    if(!accountOpen){
      const settings = document.getElementById('settingsSuiteModal');
      if(settings){
        settings.classList.remove('is-under-account-popup');
        settings.style.removeProperty('z-index');
      }
    }
  }catch(_){}
  try{ document.dispatchEvent(new CustomEvent('upick:layer-closed', { detail:{ id: modal && modal.id, source:'account-modal' } })); }catch(_){}
  syncAccountLockSoon();
  if(typeof afterClose === 'function') afterClose();
 };
 if(!isLayerOpenLike(modal)){ done(); return; }
 if(window.UpickMotion){
  window.UpickMotion.close(modal,{
   activeClass:'show',
   closingClass:'is-closing',
   panel:panel,
   duration:320,
   ariaHidden:false,
   afterClose:done
  });
  window.setTimeout(done, 420);
 }else{
  modal.classList.remove('show','upick-motion-open');
  modal.classList.add('is-closing','upick-motion-closing');
  panel?.classList?.remove('upick-motion-open');
  panel?.classList?.add('is-closing','upick-motion-closing');
  window.setTimeout(done,320);
 }
}

function openAccountEditModal(){
 fillAccountEditForm();
 const modal = qs('#accountEditModal');
 openAccountMotionDialog(modal, '#accountNicknameInput');
 }

 function closeAccountEditModal(){
 const modal = qs('#accountEditModal');
 closeAccountMotionDialog(modal);
 }

 async function saveAccountProfile(event){
 event?.preventDefault?.();
 try{
 if(!state.currentUser?.uid){
 await openModalAlert('입장 후 이용해 주세요.');
 return;
 }

 const nickname = normalizeProfileInput(qs('#accountNicknameInput')?.value || '');
 const building = normalizeProfileInput(qs('#accountBuildingInput')?.value || '');
 const unit = normalizeProfileInput(qs('#accountUnitInput')?.value || '');

 if(!nickname){
 await openModalAlert('닉네임을 입력해 주세요.', qs('#accountNicknameInput'));
 return;
 }

 if(!validateProfileNicknameFormat(nickname)){
 setAccountNicknameState(false);
 setAccountNicknameMessage('err', '닉네임은 2~20자로 입력해 주세요.');
 await openModalAlert('닉네임은 2~20자로 입력해 주세요.', qs('#accountNicknameInput'));
 return;
 }

 const originalNickname = getOriginalAccountNickname();
 if(nickname === originalNickname){
 setAccountNicknameCheckStatus('same');
 setAccountNicknameState(false);
 setAccountNicknameMessage('err', '현재 사용 중인 닉네임과 동일합니다. 변경할 닉네임을 입력해 주세요.');
 await openModalAlert('현재 사용 중인 닉네임과 동일합니다. 변경할 닉네임을 입력해 주세요.', qs('#accountNicknameInput'));
 return;
 }

 if(accountNicknameCheckStatus !== 'available' || accountNicknameCheckedValue !== nickname){
 setAccountNicknameState(false);
 setAccountNicknameMessage('err', '닉네임 중복 확인을 먼저 완료해 주세요.');
 await openModalAlert('닉네임 중복 확인을 먼저 완료해 주세요.', qs('#accountCheckNicknameBtn') || qs('#accountNicknameInput'));
 return;
 }

 if(!UPDATE_ACCOUNT_PROFILE_URL){
 setAccountNicknameState(false);
 setAccountNicknameMessage('err', '계정 정보 수정 주소가 설정되지 않았습니다.');
 await openModalAlert('계정 정보 수정 주소가 설정되지 않았습니다.', qs('#saveAccountEditBtn'));
 return;
 }

 showGlobalLoading();
 const idToken = await state.currentUser.getIdToken(true);
 const response = await fetch(UPDATE_ACCOUNT_PROFILE_URL, {
 method:'POST',
 headers:{
 'Content-Type':'application/json',
 'Authorization': `Bearer ${idToken}`
 },
 body: JSON.stringify({ nickname, building, unit })
 });
 const result = await response.json().catch(() => ({}));
 if(!response.ok || !result.ok){
 const message = result.message || '계정 정보 저장 중 오류가 발생했습니다.';
 if(result.code === 'nickname_duplicate'){
 setAccountNicknameCheckStatus('duplicate');
 setAccountNicknameState(false);
 setAccountNicknameMessage('err', message);
 }
 throw new Error(message);
 }

 state.currentUserProfile = {
 ...(state.currentUserProfile || {}),
 nickname: result.nickname || nickname,
 building: result.building ?? building,
 unit: result.unit ?? unit,
 nicknameKey: result.nicknameKey || nickname.toLowerCase()
 };
 setAccountNicknameCheckStatus('available', nickname);
 setAccountNicknameState(true);
 setAccountNicknameMessage('ok', '저장된 닉네임입니다.');
 updateUserChip();
 closeAccountEditModal();
 hideGlobalLoading(80);
 await openModalAlert('계정 정보가 저장되었습니다.', qs('#openAccountEditBtn'));
 }catch(error){
 console.error('계정 정보 저장 실패', error);
 hideGlobalLoading(80);
 await openModalAlert(error.message || '계정 정보 저장 중 오류가 발생했습니다.', qs('#openAccountEditBtn'));
 }
 }

function resetPasswordChangeForm(){
  ['#currentPasswordInput','#newPasswordInput','#newPasswordConfirmInput'].forEach((selector) => {
    const el = qs(selector);
    if(el) el.value = '';
  });
  const msg = qs('#passwordChangeMatchMessage');
  if(msg){
    msg.textContent = '';
    msg.className = 'password-live-message';
  }
}

function updatePasswordChangeMatchMessage(){
  const pw = qs('#newPasswordInput')?.value || '';
  const confirm = qs('#newPasswordConfirmInput')?.value || '';
  const msg = qs('#passwordChangeMatchMessage');
  if(!msg) return;
  msg.className = 'password-live-message';
  if(!pw && !confirm){
    msg.textContent = '';
    return;
  }
  if(pw.length > 0 && pw.length < 8){
    msg.textContent = '새 비밀번호는 8자 이상 입력해주세요.';
    msg.classList.add('error');
    return;
  }
  if(!confirm){
    msg.textContent = '새 비밀번호 확인란을 입력해주세요.';
    msg.classList.add('info');
    return;
  }
  if(pw === confirm){
    msg.textContent = '새 비밀번호가 일치합니다.';
    msg.classList.add('success');
  }else{
    msg.textContent = '새 비밀번호가 일치하지 않습니다.';
    msg.classList.add('error');
  }
}

function openPasswordChangeModal(){
  const modal = qs('#passwordChangeModal');
  if(!modal) return;
  resetPasswordChangeForm();
  openAccountMotionDialog(modal, '#currentPasswordInput');
}

function closePasswordChangeModal(){
  const modal = qs('#passwordChangeModal');
  closeAccountMotionDialog(modal, resetPasswordChangeForm);
}

// Root1 동적 이동 이후 X/취소 버튼이 template 상태에서 바인딩이 누락되어도
// 계정/비밀번호 팝업은 캡처 단계에서 확실하게 닫히도록 보강합니다.
(function bindAccountModalCloseDelegation(){
  if(window.__upickAccountModalCloseDelegationBound) return;
  window.__upickAccountModalCloseDelegationBound = true;
  document.addEventListener('click', function(event){
    const closeAccountBtn = event.target?.closest?.('#closeAccountEditModal,#cancelAccountEditBtn');
    if(closeAccountBtn){
      event.preventDefault();
      event.stopPropagation();
      if(typeof event.stopImmediatePropagation === 'function') event.stopImmediatePropagation();
      closeAccountEditModal();
      return;
    }
    const closePasswordBtn = event.target?.closest?.('#closePasswordChangeModal,#cancelPasswordChangeBtn');
    if(closePasswordBtn){
      event.preventDefault();
      event.stopPropagation();
      if(typeof event.stopImmediatePropagation === 'function') event.stopImmediatePropagation();
      closePasswordChangeModal();
    }
  }, true);
})();

async function submitPasswordChange(event){
  event?.preventDefault?.();
  const currentPassword = qs('#currentPasswordInput')?.value || '';
  const newPassword = qs('#newPasswordInput')?.value || '';
  const newPasswordConfirm = qs('#newPasswordConfirmInput')?.value || '';
  const submitBtn = qs('#submitPasswordChangeBtn');

  if(!currentPassword){
    await openModalAlert('기존 비밀번호를 입력해주세요.', qs('#currentPasswordInput'));
    return;
  }
  if(!newPassword || newPassword.length < 8){
    await openModalAlert('새 비밀번호는 8자 이상 입력해주세요.', qs('#newPasswordInput'));
    return;
  }
  if(newPassword !== newPasswordConfirm){
    await openModalAlert('새 비밀번호가 일치하지 않습니다.', qs('#newPasswordConfirmInput'));
    return;
  }
  if(currentPassword === newPassword){
    await openModalAlert('기존 비밀번호와 다른 비밀번호를 입력해주세요.', qs('#newPasswordInput'));
    return;
  }

  try{
    if(submitBtn){
      submitBtn.disabled = true;
      submitBtn.dataset.originalText = submitBtn.textContent;
    }
    showGlobalLoading();

    const idToken = await auth.currentUser?.getIdToken?.(true);
    if(!idToken){
      hideGlobalLoading(80);
      await openModalAlert('입장 정보가 만료되었습니다. 다시 입장해주세요.');
      showGlobalLoading();
      redirectToLogin();
      return;
    }

    const response = await fetch(API_URL[ENV].changePasswordWithCurrent, {
      method:'POST',
      headers:{
        'Content-Type':'application/json',
        'Authorization':`Bearer ${idToken}`
      },
      body:JSON.stringify({ currentPassword, newPassword, newPasswordConfirm })
    });

    let data = {};
    try{ data = await response.json(); }catch(_){}

    if(!response.ok || data.ok === false){
      throw new Error(data.message || '비밀번호 변경 처리 중 오류가 발생했습니다.');
    }

    hideGlobalLoading(80);
    closePasswordChangeModal();
    await openModalAlert(data.message || '비밀번호 변경이 완료되었습니다. 보안을 위해 다시 입장해주세요.');
    showGlobalLoading();
    try{ await logoutServerSession(auth, API_URL[ENV]); }catch(_){}
    try{ await signOut(auth); }catch(_){}
    redirectToLogin();
  }catch(error){
    console.error('비밀번호 변경 실패', error);
    hideGlobalLoading(80);
    await openModalAlert(error.message || '비밀번호 변경 처리 중 오류가 발생했습니다.', qs('#submitPasswordChangeBtn'));
  }finally{
    if(submitBtn){
      submitBtn.disabled = false;
      submitBtn.textContent = submitBtn.dataset.originalText || '비밀번호 변경';
      delete submitBtn.dataset.originalText;
    }
  }
}

async function enablePushNotifications(){
 try{
 if(!state.currentUser?.uid){
 await openModalAlert('입장 후 이용해 주세요.');
 return;
 }
 if(!window.VAPID_PUBLIC_KEY || String(window.VAPID_PUBLIC_KEY).includes('여기에_Firebase_콘솔_VAPID_Public_Key_입력')){
 await openModalAlert('VAPID 공개 키가 아직 설정되지 않았습니다. HTML 파일의 window.VAPID_PUBLIC_KEY 값을 실제 키로 바꿔 주세요.');
 return;
 }
 if(!window.firebaseMessaging || !window.getToken || !window.pushSwRegistration){
 const initialized = await initPushSystem();
 if(!initialized || !window.firebaseMessaging || !window.getToken || !window.pushSwRegistration){
 await openModalAlert('알림 초기화가 완료되지 않았습니다. 페이지를 새로고침 후 다시 시도해 주세요.');
 return;
 }
 }
 const permission = await Notification.requestPermission();
 if(permission !== 'granted'){
 state.currentPushToken = null;
 setPushStatusUi(false);
 await openModalAlert('브라우저 알림 권한이 허용되지 않았습니다.');
 return;
 }


 const token = await window.getToken(window.firebaseMessaging, {
 vapidKey: window.VAPID_PUBLIC_KEY,
 serviceWorkerRegistration: window.pushSwRegistration
 }).catch(() => null);

 if(!token){
 state.currentPushToken = null;
 setPushStatusUi(false);
 await openModalAlert('알림 토큰을 생성하지 못했습니다.');
 return;
 }

 if(await isMobileEdgePushEndpointBroken()){
 state.currentPushToken = null;
 setPushStatusUi(false);
 try{ localStorage.setItem(`myhills_mobile_edge_fallback_${ENV || 'prod'}`, '1'); }catch(_){}
 await openModalAlert(
 '현재 모바일 Edge에서는 휴대폰 시스템 알림 수신이 안정적이지 않습니다.\n\n대신 웹앱을 열어두신 동안에는 새 공지, 예약 알림, 근처 혜택을 화면 안의 알림으로 안내해드릴게요.\n\n앱이 꺼져 있어도 알림을 받고 싶으시면 Chrome 또는 삼성 인터넷 이용을 권장드립니다.'
 );
 return;
 }

 state.currentPushToken = token;

 await setDoc(doc(db, 'users', state.currentUser.uid, 'pushTokens', token), {
 token,
 uid: state.currentUser.uid,
 enabled: true,
 platform: 'web',
 userAgent: navigator.userAgent || '',
 env: ENV,
 projectId: firebaseConfig.projectId || '',
 swScope: window.pushSwRegistration?.scope || '',
 swScriptURL: window.pushSwRegistration?.active?.scriptURL || '',
 swState: window.pushSwRegistration?.active?.state || '',
 swControlled: !!navigator.serviceWorker?.controller,
 samsungInternetCompat: /SamsungBrowser/i.test(navigator.userAgent || ''),
 notificationPermission: Notification.permission || '',
 lastTokenIssuedAt: serverTimestamp(),
 updatedAt: serverTimestamp(),
 createdAt: serverTimestamp()
 }, { merge:true });

 setPushStatusUi(true);
 await openModalAlert('현재 기기에서 알림이 설정되었습니다.');
 }catch(error){
 console.error('알림 설정 실패', error);
 state.currentPushToken = null;
 setPushStatusUi(false);
 await openModalAlert('알림 설정 중 오류가 발생했습니다.');
 }
 }

async function disablePushNotifications(){
 try{
 if(!state.currentUser?.uid){
 await openModalAlert('입장 후 이용해 주세요.');
 return;
 }
 if(!state.currentPushToken){
 setPushStatusUi(false);
 await openModalAlert('현재 기기에 등록된 알림 토큰이 없습니다.');
 return;
 }

 await deleteDoc(doc(db, 'users', state.currentUser.uid, 'pushTokens', state.currentPushToken));
 state.currentPushToken = null;
 setPushStatusUi(false);
 await openModalAlert('현재 기기에서 알림이 해제되었습니다.');
 }catch(error){
 console.error('알림 해제 실패', error);
 await openModalAlert('알림 해제 중 오류가 발생했습니다.');
 }
 }

async function refreshPushStatus(){
 try{
 if(!state.currentUser?.uid || !window.firebaseMessaging || !window.getToken || !window.pushSwRegistration){
 state.currentPushToken = null;
 setPushStatusUi(false);
 return;
 }

 if(Notification.permission !== 'granted'){
 state.currentPushToken = null;
 setPushStatusUi(false);
 return;
 }

 const token = await window.getToken(window.firebaseMessaging, {
 vapidKey: window.VAPID_PUBLIC_KEY,
 serviceWorkerRegistration: window.pushSwRegistration
 }).catch(() => null);

 state.currentPushToken = token || null;

 if(!token){
 setPushStatusUi(false);
 return;
 }

 const snap = await getDoc(doc(db, 'users', state.currentUser.uid, 'pushTokens', token));
 setPushStatusUi(snap.exists());
 }catch(error){
 console.error('알림 상태 확인 실패', error);
 state.currentPushToken = null;
 setPushStatusUi(false);
 }
 }

 async function deleteUserSubcollection(uid, subcollectionName){
 try{
 const snap = await getDocs(collection(db, 'users', uid, subcollectionName));
 if(snap.empty) return;

 const tasks = snap.docs.map((item) => deleteDoc(item.ref));
 await Promise.all(tasks);
 }catch(error){
 console.error(`${subcollectionName} 삭제 실패`, error);
 throw error;
 }
 }

 async function withdrawCurrentUser(){
 try{
 if(!state.currentUser){
 await openModalAlert('입장 상태를 확인할 수 없습니다.', qs('#withdrawBtn'));
 return;
 }

 const confirmed = await openModalConfirm(
 `계정 삭제를 진행하면
계정 정보, 즐겨찾기, 현재 기기 알림 설정이 삭제됩니다.
이 작업은 되돌릴 수 없습니다.

정말 탈퇴하시겠습니까?`,
 qs('#withdrawBtn'),
 '계정 삭제',
 '탈퇴하기',
 '취소'
 );
 if(!confirmed) return;

 showGlobalLoading();

 const uid = state.currentUser.uid;

 await deleteUserSubcollection(uid, 'favorites');
 await deleteUserSubcollection(uid, 'pushTokens');
 await setDoc(doc(db, 'users', uid), {
 accountStatus: 'withdrawn',
 withdrawReason: '사용자 본인 요청',
 withdrawnAt: serverTimestamp(),
 updatedAt: serverTimestamp()
 }, { merge:true });

 await signOut(auth).catch(() => {});
 hideGlobalLoading(80);
 await openModalAlert('계정 삭제가 완료되었습니다.');
 redirectToLogin();
 }catch(error){
 console.error('계정 삭제 실패', error);
 hideGlobalLoading(80);
 await openModalAlert('계정 삭제 중 오류가 발생했습니다.', qs('#withdrawBtn'));
 }
 }

 async function loadCurrentUserProfile(user){
 try{
 const snap = await getDoc(doc(db, 'users', user.uid));
 if(!snap.exists()) return null;
 return snap.data() || null;
 }catch(error){
 console.error('사용자 정보 로드 실패', error);
 return null;
 }
 }
 async function ensureAuthenticatedUser(){
 return new Promise((resolve) => {
 onAuthStateChanged(auth, async (user) => {
 if(!user){
 sessionStorage.setItem('pendingDeepLink', location.href);
 redirectToLogin();
 resolve(false);
 return;
 }

 state.currentUser = user;
 state.currentUserProfile = await loadCurrentUserProfile(user);
 applyAppFontSize(state.currentUserProfile?.fontSize || state.currentUserProfile?.appFontSize || 'normal');

 if(!state.currentUserProfile){
 await writeSecurityLog('USER_DOC_NOT_FOUND', { uid:user.uid });
 localStorage.removeItem('loginUser');
 await signOut(auth).catch(() => {});
 redirectToLogin();
 resolve(false);
 return;
 }

 const sessionResult = await checkServerSessionOrLogout({
 auth,
 api: API_URL[ENV],
 signOutFn: async (authInstance) => signOut(authInstance),
 redirectTo: '/',
 alertFn: (message) => openModalAlert(message)
 });
 if(!sessionResult?.valid){
 resolve(false);
 return;
 }

 const stored = getStoredLoginUser();
 const localSessionId = stored.sessionId || '';
 const serverSessionId = sessionResult?.sessionId || state.currentUserProfile.activeSessionId || '';

 const approvalStatus = String(state.currentUserProfile.approvalStatus || 'pending');
 const accountStatus = String(state.currentUserProfile.accountStatus || 'inactive');
 // 2026-04-26: 공개앱에서는 휴대폰 인증 단계를 생략합니다.
 // 기존 필드는 보존하되, 앱 접근 차단 조건으로 사용하지 않습니다.
 const phoneVerificationRequired = false;
 const phoneVerified = true;

 if(accountStatus === 'withdrawn'){
 await writeSecurityLog('WITHDRAWN_ACCOUNT_ACCESS', { accountStatus });
 await openModalAlert('탈퇴된 계정입니다.');
 localStorage.removeItem('loginUser');
 await signOut(auth).catch(() => {});
 redirectToLogin();
 resolve(false);
 return;
 }

 if(accountStatus === 'blocked'){
 await writeSecurityLog('BLOCKED_ACCOUNT_ACCESS', {
 accountStatus,
 blockedReason: state.currentUserProfile.blockedReason || ''
 });
 await openModalAlert('보안 정책에 따라 차단된 계정입니다.');
 localStorage.removeItem('loginUser');
 await signOut(auth).catch(() => {});
 redirectToLogin();
 resolve(false);
 return;
 }

 if(approvalStatus !== 'approved' || accountStatus !== 'active'){
 await writeSecurityLog('UNAPPROVED_ACCESS', { approvalStatus, accountStatus });
 localStorage.removeItem('loginUser');
 await signOut(auth).catch(() => {});
 redirectToLogin();
 resolve(false);
 return;
 }

 if(phoneVerificationRequired && !phoneVerified){
 try{ sessionStorage.setItem('upick_allow_phone_verify','1'); }catch(_){}
 window.location.replace('/phone-verify');
 resolve(false);
 return;
 }

 saveVerifiedLoginUser(user, state.currentUserProfile, localSessionId || serverSessionId);

 if(!window.__THEUNJEONGPICK_SESSION_KEEPALIVE__){
 window.__THEUNJEONGPICK_SESSION_KEEPALIVE__ = startSessionKeepAlive({
 auth,
 api: API_URL[ENV],
 signOutFn: async (authInstance) => signOut(authInstance),
 redirectTo: '/',
 alertFn: (message) => openModalAlert(message),
 intervalMs: 5 * 60 * 1000,
 requireActivity: true,
 db,
 docFn: doc,
 onSnapshotFn: onSnapshot
 });
 }

 updateUserChip();
 forcePublicAppInitialRender();
 await refreshPushStatus();
 if(shouldUseMobileEdgeInAppFallback()){
 }
 if(hasAiOpenDeepLink()){
 setTimeout(() => handleAiOpenDeepLink().catch(error => console.warn('AI 알림 딥링크 처리 실패:', error)), 500);
 }else{
 setTimeout(() => handleDailyAiNudge().catch(error => console.warn('일 1회 AI 유도 처리 실패:', error)), 900);
 }

 const pendingDeepLink = consumePendingDeepLinkSafely();
 if(pendingDeepLink && pendingDeepLink !== location.href){
 window.location.replace(pendingDeepLink);
 resolve(false);
 return;
 }

 resolve(true);
 }, () => {
 redirectToLogin();
 resolve(false);
 });
 });
 }
 function getPopularScoreWeight(field){
 const key = String(field || '');
 if(key === 'detailViewCount') return 1;
 if(key === 'cardClickCount') return 1;
 if(key === 'favoriteCount') return 3;
 if(key === 'shareClickCount') return 5;
 if(key === 'mapClickCount') return 2;
 if(key === 'directionClickCount') return 4;
 if(key === 'callClickCount') return 3;
 if(key === 'smartstoreClickCount') return 4;
 if(key === 'bandClickCount') return 3;
 if(['homepageClickCount','blogClickCount','instagramClickCount','youtubeClickCount','facebookClickCount','snsClickCount'].includes(key)) return 2;
 return 0;
 }

 function getCrowdActionWeight(field){
 const key = String(field || '');
 const weights = {
   detailViewCount: 2.5,
   cardClickCount: 1.8,
   mapClickCount: 4.5,
   directionClickCount: 7.5,
   callClickCount: 6.5,
   favoriteCount: 4,
   shareClickCount: 5.5,
   smartstoreClickCount: 5,
   bandClickCount: 3.5,
   snsClickCount: 2.5
 };
 if(Object.prototype.hasOwnProperty.call(weights, key)) return weights[key];
 if(['homepageClickCount','blogClickCount','instagramClickCount','youtubeClickCount','facebookClickCount'].includes(key)) return 2.5;
 return 1.2;
 }

 function getLastActionFieldName(field){
 const key = String(field || '');
 const map = {
   detailViewCount:'lastDetailViewAt',
   cardClickCount:'lastCardClickAt',
   mapClickCount:'lastMapClickAt',
   directionClickCount:'lastDirectionClickAt',
   callClickCount:'lastCallClickAt',
   favoriteCount:'lastFavoriteAt',
   shareClickCount:'lastSharedAt',
   smartstoreClickCount:'lastSmartstoreClickAt',
   bandClickCount:'lastBandClickAt',
   snsClickCount:'lastSnsClickAt'
 };
 return map[key] || `last${key.charAt(0).toUpperCase()}${key.slice(1).replace(/Count$/,'')}At`;
 }

 function getCrowdPatternKeys(now = getSeoulNow()){
 const date = now instanceof Date ? now : getSeoulNow();
 const day = Math.max(0, Math.min(6, Number(date.getDay()) || 0));
 const hour = Math.max(0, Math.min(23, Number(date.getHours()) || 0));
 const isWeekend = day === 0 || day === 6;
 return {
   day,
   hour,
   isWeekend,
   hourKey: `crowdHour_${hour}`,
   dayHourKey: `crowdDayHour_${day}_${hour}`,
   segmentHourKey: `${isWeekend ? 'crowdWeekendHour' : 'crowdWeekdayHour'}_${hour}`
 };
 }

 function buildCrowdPatternDeltas(actionWeight = 0, now = getSeoulNow()){
 const weight = Math.max(0, toSafeFiniteNumber(actionWeight, 0));
 if(!weight) return {};
 const keys = getCrowdPatternKeys(now);
 return {
   [keys.hourKey]: weight,
   [keys.dayHourKey]: weight,
   [keys.segmentHourKey]: weight,
   crowdHistoryTotal: weight,
   crowdHistoryEvents: 1
 };
 }

 function getCrowdHistoricalSignal(stat = {}, now = getSeoulNow()){
 const keys = getCrowdPatternKeys(now);
 const hourPulse = toSafeFiniteNumber(stat[keys.hourKey], 0);
 const dayHourPulse = toSafeFiniteNumber(stat[keys.dayHourKey], 0);
 const segmentPulse = toSafeFiniteNumber(stat[keys.segmentHourKey], 0);
 const total = toSafeFiniteNumber(stat.crowdHistoryTotal, 0);
 const events = toSafeFiniteNumber(stat.crowdHistoryEvents, 0);
 const signal = dayHourPulse * 0.9 + segmentPulse * 0.45 + hourPulse * 0.22;
 const average = events > 0 ? total / Math.max(1, events) : 0;
 const concentration = total > 0 ? signal / Math.max(1, total) : 0;
 return { ...keys, hourPulse, dayHourPulse, segmentPulse, total, events, signal, average, concentration };
 }


 function toSafeFiniteNumber(value, fallback = 0){
 const n = Number(value);
 return Number.isFinite(n) ? n : fallback;
 }

 function buildSafeStatNumberUpdates(prev = {}, deltaMap = {}){
 const out = {};
 Object.entries(deltaMap || {}).forEach(([key, delta]) => {
   const before = toSafeFiniteNumber(prev?.[key], 0);
   const next = Math.max(0, before + toSafeFiniteNumber(delta, 0));
   out[key] = next;
 });
 return out;
 }

 function getDecayedCrowdPulseFromStat(stat={}, nowMs=Date.now()){
 const raw = Number(stat.recentCrowdPulse || stat.crowdPulse || 0) || 0;
 const last = getTimestampMs(stat.recentCrowdLastAt || stat.lastCrowdPulseAt || stat.updatedAt);
 if(!raw || !last) return 0;
 const minutes = Math.max(0, (nowMs - last) / 60000);
 // 30분 반감기: 최근 행동은 강하게, 1~2시간 전 행동은 자연스럽게 약해집니다.
 return Math.max(0, raw * Math.pow(0.5, minutes / 30));
 }

 async function increaseStat(benefitId, benefitName, field){
 if(!benefitId || !field) return;
 try{
 const statRef = doc(db, BENEFIT_STATS_COLLECTION, benefitId);
 const popularWeight = getPopularScoreWeight(field);
 const actionWeight = getCrowdActionWeight(field);
 const lastActionField = getLastActionFieldName(field);
 const nowMs = Date.now();
 const snap = await getDoc(statRef).catch(() => null);
 const prev = snap && snap.exists() ? (snap.data() || {}) : {};
 const decayedPulse = getDecayedCrowdPulseFromStat(prev, nowMs);
 const nextPulse = Math.min(100, decayedPulse + actionWeight);
 const keys = getCrowdPatternKeys(getSeoulNow());
 const payload = {
   benefitId,
   name: benefitName || prev.name || '',
   ...buildSafeStatNumberUpdates(prev, {
     [field]: 1,
     ...(popularWeight > 0 ? { popularScore: popularWeight } : {}),
     ...buildCrowdPatternDeltas(actionWeight, getSeoulNow())
   }),
   lastCrowdPatternDay: keys.day,
   lastCrowdPatternHour: keys.hour,
   [lastActionField]: serverTimestamp(),
   lastActionType: field,
   recentCrowdPulse: nextPulse,
   recentCrowdLastAt: serverTimestamp(),
   updatedAt: serverTimestamp()
 };
 await setDoc(statRef, payload, { merge:true });
 }catch(error){
 console.error('통계 증가 실패', field, benefitId, error);
 }
 }
 
 async function logBenefitEvent(benefitId, type){
 if(!benefitId || !type || !state.currentUser?.uid) return;
 try{
 await addDoc(collection(db, BENEFIT_EVENTS_COLLECTION), {
 benefitId,
 uid: state.currentUser.uid,
 type,
 createdAt: serverTimestamp()
 });
 const mlBenefit = (state.benefits || []).find(v => String(v.id) === String(benefitId)) || {};
 if(typeof logPersonalAssistantEvent === 'function'){
   logPersonalAssistantEvent({
     action: type,
     eventType: 'benefit_event',
     targetType: 'benefit',
     benefitId,
     targetId: benefitId,
     category: mlBenefit.category || '',
     keyword: mlBenefit.name || mlBenefit.title || mlBenefit.benefit || '',
     source: 'benefit_event'
   }).catch(() => {});
 }
 recordResidentActivity(type, residentActivityPoints(type), benefitId).catch(() => {});
 }catch(error){
 console.error('이벤트 기록 실패', type, benefitId, error);
 }
 }

 function residentActivityPoints(type = ''){
 const key = String(type || '');
 if(key.includes('share')) return 5;
 if(key === 'smartstore_click') return 4;
 if(key === 'band_click') return 3;
 if(key === 'favorite') return 3;
 if(key === 'recommend') return 4;
 if(key === 'hot') return 6;
 if(key === 'like') return 2;
 if(key.includes('click')) return 2;
 if(key.includes('view')) return 1;
 return 1;
 }
 async function recordResidentActivity(type = 'activity', points = 1, benefitId = ''){
 const uid = state.currentUser?.uid; if(!uid) return;
 const profile = state.currentUserProfile || {}; const safePoints = Math.max(1, Number(points || 1));
 try{
 await addDoc(collection(db, 'activity_logs'), {uid, loginId: profile.loginId || '', nickname: profile.nickname || profile.displayName || profile.name || '', type, benefitId: benefitId || null, points: safePoints, createdAt: serverTimestamp()});
 await setDoc(doc(db, 'user_stats', uid), {uid, loginId: profile.loginId || '', nickname: profile.nickname || profile.displayName || profile.name || '입주민', role: profile.role || profile.userRole || '', score: increment(safePoints), activityCount: increment(1), lastActivityType: type, lastBenefitId: benefitId || null, updatedAt: serverTimestamp()}, { merge:true });
 }catch(error){console.warn('입주민 활동 로그 저장 실패', error);}
 }
 async function handleResidentReaction(benefitId = '', reactionType = 'like'){
 if(!benefitId || !state.currentUser?.uid){ await openModalAlert('입장 후 반응을 남길 수 있습니다.'); return { active:false, changed:false }; }

 const uid = state.currentUser.uid;
 const reactionId = `${benefitId}_${uid}_${reactionType}`;
 const reactionRef = doc(db, 'benefit_reactions', reactionId);

 const fieldMap = { like:'likeCount', recommend:'recommendCount', hot:'hotCount' };
 const labelMap = { like:'좋아요', recommend:'추천', hot:'HOT' };
 const statField = fieldMap[reactionType] || 'likeCount';
 const points = residentActivityPoints(reactionType);
 const statRef = doc(db, BENEFIT_STATS_COLLECTION, benefitId);

 try{
   const existing = await getDoc(reactionRef).catch(() => null);

   // 이미 반응한 상태면 취소: count -1, popularScore -points
   if(existing?.exists?.()){
     await deleteDoc(reactionRef);
     await runTransaction(db, async (tx) => {
       const snap = await tx.get(statRef);
       const prev = snap.exists() ? (snap.data() || {}) : {};
       tx.set(statRef, {
         benefitId,
         ...buildSafeStatNumberUpdates(prev, {
           [statField]: -1,
           popularScore: -points
         }),
         updatedAt: serverTimestamp()
       }, { merge:true });
     });

     return {
       active:false,
       changed:true,
       label:labelMap[reactionType] || '반응',
       message:`${labelMap[reactionType] || '반응'}이 취소되었습니다.`
     };
   }

   // 아직 반응하지 않은 상태면 등록: count +1, popularScore +points
   await setDoc(reactionRef, {
     benefitId,
     uid,
     type: reactionType,
     createdAt: serverTimestamp()
   }, { merge:true });

   await runTransaction(db, async (tx) => {
     const snap = await tx.get(statRef);
     const prev = snap.exists() ? (snap.data() || {}) : {};
     tx.set(statRef, {
       benefitId,
       ...buildSafeStatNumberUpdates(prev, {
         [statField]: 1,
         popularScore: points
       }),
       updatedAt: serverTimestamp()
     }, { merge:true });
   });

   await recordResidentActivity(reactionType, points, benefitId);

   return {
     active:true,
     changed:true,
     label:labelMap[reactionType] || '반응',
     message:`${labelMap[reactionType] || '반응'}이 반영되었습니다.`
   };
 }catch(error){
   console.warn('입주민 반응 토글 실패', error);
   await openModalAlert('반응 처리 중 오류가 발생했습니다.');
   return { active:false, changed:false, error };
 }
 }
 function residentReactionHtml(item = {}){ if(!item?.id) return ''; return `<div class="reaction-help">HOT 반응을 남기면 이 혜택의 인기 랭킹이 올라갑니다.</div><div class="reaction-box" data-benefit-id="${escapeHtml(item.id)}"><button type="button" class="reaction-btn" data-reaction="like"><img class="upick-svg-icon" src="/icons/internal/favorite.svg" alt="" loading="lazy"> 좋아요</button><button type="button" class="reaction-btn" data-reaction="recommend"><img class="upick-svg-icon" src="/icons/internal/benefit.svg" alt="" loading="lazy"> 추천</button><button type="button" class="reaction-btn" data-reaction="hot"><img class="upick-svg-icon" src="/icons/internal/top5.svg" alt="" loading="lazy"> HOT</button></div>`; }
 function getReactionActiveClass(reactionType = 'like'){
 const map = { like:'active-like', recommend:'active-recommend', hot:'active-hot' };
 return map[reactionType] || 'active-like';
 }

 async function refreshResidentReactionButtons(benefitId = ''){
 const uid = state.currentUser?.uid;
 if(!benefitId || !uid) return;

 const buttons = qsa('.reaction-btn');
 await Promise.all(buttons.map(async (btn) => {
   const reactionType = btn.dataset.reaction || 'like';
   const reactionId = `${benefitId}_${uid}_${reactionType}`;
   const activeClass = getReactionActiveClass(reactionType);
   const snap = await getDoc(doc(db, 'benefit_reactions', reactionId)).catch(() => null);

   btn.classList.toggle(activeClass, !!snap?.exists?.());
   btn.dataset.active = snap?.exists?.() ? '1' : '0';
   btn.setAttribute('aria-pressed', snap?.exists?.() ? 'true' : 'false');
 }));
 }

 function bindResidentReactionButtons(item = {}){
 const benefitId = item?.id || qs('.reaction-box')?.dataset?.benefitId || '';
 refreshResidentReactionButtons(benefitId).catch(() => {});

 qsa('.reaction-btn').forEach((btn) => {
   btn.onclick = async (event) => {
     event.preventDefault();
     event.stopPropagation();

     if(btn.dataset.processing === '1') return;
     btn.dataset.processing = '1';

     const reactionType = btn.dataset.reaction || 'like';
     const activeClass = getReactionActiveClass(reactionType);

     try{
       const result = await handleResidentReaction(benefitId, reactionType);

       if(result?.changed){
         btn.classList.toggle(activeClass, !!result.active);
         btn.dataset.active = result.active ? '1' : '0';
         btn.setAttribute('aria-pressed', result.active ? 'true' : 'false');

         // 기존 알럿 대신 버튼 상태만 바꾸되, 아주 짧은 토스트성 피드백이 필요하면 alert가 아닌 상태 표시만 남김
         const help = btn.closest('.reaction-box')?.previousElementSibling;
         if(help && help.classList?.contains('reaction-help')){
           const original = help.dataset.originalText || help.textContent;
           help.dataset.originalText = original;
           help.textContent = result.active ? `${result.label} 반응이 반영되었습니다.` : `${result.label} 반응이 취소되었습니다.`;
           setTimeout(() => {
             if(help.dataset.originalText) help.textContent = help.dataset.originalText;
           }, 1200);
         }
       }
     }finally{
       btn.dataset.processing = '0';
     }
   };
 });
 }
 
 
 function toDateFromFirestore(value){
   if(!value) return null;
   if(value instanceof Date) return value;
   if(typeof value.toDate === 'function') return value.toDate();

   if(typeof value === 'number'){
     const date = new Date(value);
     return Number.isNaN(date.getTime()) ? null : date;
   }

   if(typeof value === 'string'){
     const raw = value.trim();
     if(!raw) return null;

     // "2026. 5. 5.", "2026-05-05", "2026/05/05" 모두 대응
     const normalized = raw
       .replace(/\.$/, '')
       .replace(/\s+/g, '')
       .replace(/[./]/g, '-');

     const date = new Date(normalized);
     return Number.isNaN(date.getTime()) ? null : date;
   }

   if(typeof value === 'object'){
     if(typeof value.seconds === 'number'){
       const date = new Date(value.seconds * 1000);
       return Number.isNaN(date.getTime()) ? null : date;
     }
     if(typeof value._seconds === 'number'){
       const date = new Date(value._seconds * 1000);
       return Number.isNaN(date.getTime()) ? null : date;
     }
   }

   return null;
 }

function formatKoreanDate(value){
 const date = toDateFromFirestore(value);
 if(!date) return '';
 return new Intl.DateTimeFormat('ko-KR', {
 year:'numeric',
 month:'numeric',
 day:'numeric'
 }).format(date);
 }

 function benefitDateTag(item = {}){
 const createdText = formatKoreanDate(item.createdAt);
 const newBadge = recentNewBadgeHtml(item);
 const dateTag = createdText ? `` : '';
 return `${newBadge}${dateTag}`;
 }

 function benefitDateText(item = {}){
 const createdText = formatKoreanDate(item.createdAt);
 return createdText ? `등록일 ${createdText}` : '';
 }

 function benefitDetailDateHtml(item = {}){
 const createdText = formatKoreanDate(item.createdAt);
 const updatedText = formatKoreanDate(item.updatedAt);
 if(!createdText && !updatedText) return '';
 const parts = [];
 if(createdText) parts.push(`<span>등록일 ${createdText}</span>`);
 if(updatedText) parts.push(`<span>수정일 ${updatedText}</span>`);
 return `<div class="panel benefit-date-panel"><strong class="benefit-detail-panel-title">등록 정보</strong><div class="benefit-detail-date-line">${parts.join('<span class="benefit-detail-date-separator" aria-hidden="true">·</span>')}</div></div>`;
 }

 function normalizeKoreaLatLng(rawLat, rawLng){
 let lat = Number(rawLat);
 let lng = Number(rawLng);

 // 좌표가 비어 있거나 Firestore 기본값처럼 0 / 0으로 들어간 경우 거리 계산 제외
 if(!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
 if(lat === 0 || lng === 0) return null;

 // Firestore 입력 과정에서 lat/lng가 서로 바뀐 경우 자동 보정
 // 한국 좌표 대략: 위도 33~39, 경도 124~132
 const looksLikeKoreaLat = (value) => value >= 32 && value <= 40;
 const looksLikeKoreaLng = (value) => value >= 123 && value <= 133;

 if(looksLikeKoreaLng(lat) && looksLikeKoreaLat(lng)){
 const temp = lat;
 lat = lng;
 lng = temp;
 }

 // 0/0, 해외 좌표, 오입력 좌표는 거리 표시하지 않음
 if(!looksLikeKoreaLat(lat) || !looksLikeKoreaLng(lng)) return null;
 return { lat, lng };
 }

 function getBenefitLatLng(item = {}){
 const candidates = typeof getBenefitLatLngCandidateObjects === 'function' ? getBenefitLatLngCandidateObjects(item) : [item];
 for(const source of candidates){
   const rawLat = getStarfieldBoundaryValue(source, ['lat','latitude','_lat','storeLat','storeLatitude','mapLat','naverLat','placeLat','benefitLat','y']);
   const rawLng = getStarfieldBoundaryValue(source, ['lng','lon','longitude','_lng','_long','storeLng','storeLongitude','mapLng','naverLng','placeLng','benefitLng','x']);
   const normalized = normalizeKoreaLatLng(rawLat, rawLng);
   if(normalized) return normalized;
 }
 return null;
 }


 function getBenefitAddressParts(item = {}){
 const nested = item.addressParts || (item.address && typeof item.address === 'object' ? item.address : {});
 const road = String(item.roadAddress || nested.road || nested.roadAddress || '').trim();
 const jibun = String(item.jibunAddress || nested.jibun || nested.jibunAddress || '').trim();
 const detail = String(item.detailAddress || nested.detail || nested.detailAddress || '').trim();
 const legacy = String(typeof item.address === 'string' ? item.address : (item.displayAddress || nested.display || '')).trim();
 const main = road || jibun || legacy;
 const display = String(item.displayAddress || [main, detail].filter(Boolean).join(' ') || legacy).trim();
 return { road, jibun, detail, main, display };
 }

 function getBenefitDisplayAddress(item = {}){
 return getBenefitAddressParts(item).display;
 }

 function getBenefitSearchAddress(item = {}){
 const parts = getBenefitAddressParts(item);
 return parts.road || parts.jibun || parts.main || parts.display;
 }

 function hasBenefitLocation(item = {}){
 return !!getBenefitLatLng(item);
 }

 function buildMapSearchLink(item = {}){
 const keyword = String(getBenefitSearchAddress(item) || item.name || '').trim();
 if(item.url) return item.url;
 if(keyword) return `https://map.naver.com/v5/search/${encodeURIComponent(keyword)}`;
 return 'https://map.naver.com/';
 }

 function buildDirectionLink(item = {}){
 const pos = getBenefitLatLng(item);
 const name = encodeURIComponent(String(item.name || '목적지').trim() || '목적지');
 if(pos){
 return `https://map.naver.com/v5/directions/-/-/${pos.lng},${pos.lat},${name},PLACE_POI/-/transit`;
 }
 const keyword = encodeURIComponent(String(getBenefitSearchAddress(item) || item.name || '').trim());
 return keyword ? `https://map.naver.com/v5/search/${keyword}` : 'https://map.naver.com/';
 }

 function getDistanceMeters(lat1, lng1, lat2, lng2){
 const toRad = (value) => Number(value) * Math.PI / 180;
 const R = 6371000;
 const dLat = toRad(lat2 - lat1);
 const dLng = toRad(lng2 - lng1);
 const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
 return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
 }

 function formatDistance(meters){
 const n = Number(meters);
 if(!Number.isFinite(n)) return '';
 if(n < 1000) return `약 ${Math.max(1, Math.round(n))}m`;
 return `약 ${(n / 1000).toFixed(n < 10000 ? 1 : 0)}km`;
 }

function formatTravelDuration(minutes){
 const n = Math.max(1, Math.round(Number(minutes) || 0));
 if(n < 60) return `약 ${n}분`;
 const h = Math.floor(n / 60);
 const m = n % 60;
 return m ? `약 ${h}시간 ${m}분` : `약 ${h}시간`;
 }

 function estimateTravelTimes(meters){
 const distance = Number(meters);
 if(!Number.isFinite(distance) || distance <= 0) return null;

 // 단순 예상 시간입니다. 실제 네이버 길찾기 결과와는 교통상황/경로에 따라 달라질 수 있습니다.
 const WALK_M_PER_MIN = 67;   // 약 4km/h
 const BIKE_M_PER_MIN = 250;  // 약 15km/h
 const CAR_M_PER_MIN = 500;   // 약 30km/h, 도심 이동 보수값

 return {
 walk: formatTravelDuration(distance / WALK_M_PER_MIN),
 bike: formatTravelDuration(distance / BIKE_M_PER_MIN),
 car: formatTravelDuration(distance / CAR_M_PER_MIN)
 };
 }

 function travelTimesHtml(meters){
 const estimate = estimateTravelTimes(meters);
 if(!estimate) return '';
 return `<div class="location-travel-times" aria-label="예상 이동 시간">
 <div class="location-travel-chip"><b><img class="upick-svg-icon upick-inline-icon" src="/icons/internal/walk.svg" alt="" loading="lazy">도보</b><span>${escapeHtml(estimate.walk)}</span></div>
 <div class="location-travel-chip"><b><img class="upick-svg-icon upick-inline-icon" src="/icons/internal/bike.svg" alt="" loading="lazy">자전거</b><span>${escapeHtml(estimate.bike)}</span></div>
 <div class="location-travel-chip"><b><img class="upick-svg-icon upick-inline-icon" src="/icons/internal/car.svg" alt="" loading="lazy">자동차</b><span>${escapeHtml(estimate.car)}</span></div>
 </div>
 <div class="location-travel-note">예상 시간은 직선거리 기반 참고값입니다. 실제 경로는 네이버 길찾기에서 확인해 주세요.</div>`;
 }

 function shouldUseDistanceFilter(){
 return state.benefitSortMode === 'distance' || state.distanceRadius !== 'all';
 }

 function getItemDistance(item = {}){
 const value = state.distanceMap?.[item.id];
 return Number.isFinite(value) ? value : null;
 }

 function updateDistanceFilterHelp(){
 const help = qs('#distanceFilterHelp');
 if(!help) return;
 help.classList.remove('active','error');
 if(!shouldUseDistanceFilter()){
 help.textContent = '가까운순·반경은 현재 위치 기준입니다.';
 return;
 }
 if(state.distanceStatus === 'ready'){
 help.classList.add('active');
 help.textContent = '현재 위치 기준으로 거리 표시와 반경 필터가 적용 중입니다.';
 return;
 }
 if(state.distanceStatus === 'error'){
 help.classList.add('error');
 help.textContent = '현재 위치 권한을 허용해야 가까운 순/반경 필터를 사용할 수 있습니다.';
 return;
 }
 help.classList.add('active');
 help.textContent = '현재 위치를 확인하는 중입니다...';
 }

 function recalculateBenefitDistances(){
 const current = state.userLocation;
 const nextMap = {};
 if(!current) return nextMap;
 getVisibleBenefits().forEach((item) => {
 const pos = getBenefitLatLng(item);
 if(!pos) return;
 const distance = getDistanceMeters(current.lat, current.lng, pos.lat, pos.lng);
 if(Number.isFinite(distance) && distance <= 200000){
 nextMap[item.id] = distance;
 }
 });
 state.distanceMap = nextMap;
 return nextMap;
 }

 const GEO_CACHE_MS = 60000;
 const GEO_OPTIONS = { enableHighAccuracy: true, timeout: 15000, maximumAge: GEO_CACHE_MS };
 const PROXIMITY_ALERT_KEY = 'myhills_proximity_alert_history_v2';
 const PROXIMITY_ALERT_COOLDOWN_MS = 24 * 60 * 60 * 1000;
 const PROXIMITY_ALERT_STAGES = [
 { key: '100', radius: 100, title: '거의 도착권 혜택', label: '100m 이내', vibrate: [220, 80, 220, 80, 220] },
 { key: '300', radius: 300, title: '바로 근처 혜택', label: '300m 이내', vibrate: [180, 80, 180] }
 ];

 function getLocalDayKey(time = Date.now()){
 const date = new Date(time);
 const yyyy = date.getFullYear();
 const mm = String(date.getMonth() + 1).padStart(2, '0');
 const dd = String(date.getDate()).padStart(2, '0');
 return `${yyyy}${mm}${dd}`;
 }

 function readProximityAlertHistory(){
 try{return JSON.parse(localStorage.getItem(PROXIMITY_ALERT_KEY) || '{}') || {};}catch(_){return {};}
 }

 function writeProximityAlertHistory(history = {}){
 try{localStorage.setItem(PROXIMITY_ALERT_KEY, JSON.stringify(history || {}));}catch(_){ }
 }

 function getProximityStage(distance){
 const meters = Number(distance);
 if(!Number.isFinite(meters)) return null;
 return PROXIMITY_ALERT_STAGES.find((stage) => meters <= stage.radius) || null;
 }

 function showProximityToast({ title = '근처 혜택 발견', message = '' } = {}){
 let host = qs('#proximityToast');
 if(!host){
 host = document.createElement('div');
 host.id = 'proximityToast';
 host.className = 'proximity-toast';
 host.innerHTML = '<div class="proximity-toast-card"><div class="proximity-toast-icon"><img class="upick-svg-icon" src="/icons/internal/pin.svg" alt="" loading="lazy"></div><div class="proximity-toast-copy"><div class="proximity-toast-title" id="proximityToastTitle"></div><div class="proximity-toast-message" id="proximityToastMessage"></div></div><button type="button" class="proximity-toast-close" id="proximityToastClose" aria-label="닫기">×</button></div>';
 document.body.appendChild(host);
 qs('#proximityToastClose')?.addEventListener('click', () => host.classList.remove('show'));
 }
 qs('#proximityToastTitle').textContent = title;
 qs('#proximityToastMessage').textContent = message;
 host.classList.add('show');
 clearTimeout(showProximityToast._timer);
 showProximityToast._timer = setTimeout(() => host.classList.remove('show'), 6200);
 }

 async function showProximityBrowserNotification({ title = '근처 혜택 발견', message = '', item = null, stage = null } = {}){
 try{
 if(navigator.vibrate && stage?.vibrate && (navigator.userActivation?.isActive || document.hasFocus())){ try{ navigator.vibrate(stage.vibrate); }catch(_e){} }
 if(Notification?.permission !== 'granted') return;
 const benefitId = item?.id || '';
 const url = benefitId ? `/app?open=benefit&id=${encodeURIComponent(benefitId)}&from=proximity` : '/app';
 const options = {body:message,icon:'/icons/icon-192.png',badge:'/icons/icon-192.png',tag:'proximity-' + (benefitId || 'nearby') + '-' + (stage?.key || 'all'),renotify:false,data:{url,benefitId,type:'proximity'}};
 if(window.pushSwRegistration?.showNotification) await window.pushSwRegistration.showNotification(title, options);
 else new Notification(title, options);
 }catch(error){console.warn('근접 알림 표시 실패', error);}
 }

 function checkProximityAlerts({ silent = false } = {}){
 if(!state.userLocation || !Array.isArray(state.benefits) || !state.benefits.length) return;
 const now = Date.now();
 const history = readProximityAlertHistory();
 const candidates = [];
 getVisibleBenefits().filter(isRecommendableBenefit).forEach((item) => {
 if(item.visible === false) return;
 const pos = getBenefitLatLng(item);
 if(!pos) return;
 const distance = getDistanceMeters(state.userLocation.lat, state.userLocation.lng, pos.lat, pos.lng);
 const stage = getProximityStage(distance);
 if(!stage) return;
 const dayKey = getLocalDayKey(now);
 const storeKey = item.id + '_' + dayKey;
 const stageKey = item.id + '_' + stage.key + '_' + dayKey;
 const legacyKey = item.id + '_' + stage.key;
 const lastAt = Number(history[legacyKey] || 0);

 // 같은 매장은 하루 1회만 근처 알림를 보냅니다.
 if(history[storeKey]) return;

 // 100m 알림도 같은 매장 기준 하루 1회만 허용합니다.
 if(stage.key === '100' && history[stageKey]) return;

 // 구버전 기록이 남아 있는 경우에도 하루 안에는 중복을 막습니다.
 if(lastAt && now - lastAt < PROXIMITY_ALERT_COOLDOWN_MS) return;

 candidates.push({ item, distance, stage, key: storeKey, stageKey, legacyKey });
 });
 candidates.sort((a, b) => a.distance - b.distance);
 const first = candidates[0];
 if(!first) return;
 history[first.key] = now;
 if(first.stageKey) history[first.stageKey] = now;
 if(first.legacyKey) history[first.legacyKey] = now;
 writeProximityAlertHistory(history);
 const message = first.item.name + ' · 현재 위치에서 ' + formatDistance(first.distance) + ' (' + first.stage.label + ')';
 if(!silent) showProximityToast({ title:first.stage.title, message });
 showProximityBrowserNotification({ title:first.stage.title, message, item:first.item, stage:first.stage });
 }

 function hasFreshUserLocation(){
 return !!state.userLocation && (Date.now() - Number(state.userLocationFetchedAt || 0)) < GEO_CACHE_MS;
 }

 function setUserLocationFromPosition(position){
 state.userLocation = {
 lat: Number(position.coords.latitude),
 lng: Number(position.coords.longitude)
 };
 state.userLocationFetchedAt = Date.now();
 recalculateBenefitDistances();
 setTimeout(() => checkProximityAlerts(), 80);
 return state.userLocation;
 }

 function getReliableCurrentPosition({ forceRefresh = false } = {}){
 if(!navigator.geolocation){
 return Promise.reject(new Error('geolocation_not_supported'));
 }

 if(!forceRefresh && hasFreshUserLocation()){
 return Promise.resolve(state.userLocation);
 }

 return new Promise((resolve, reject) => {
 navigator.geolocation.getCurrentPosition((position) => {
 resolve(setUserLocationFromPosition(position));
 }, reject, GEO_OPTIONS);
 });
 }

 function ensureBenefitDistances({ initialDisplay = false } = {}){
 if(!initialDisplay && !shouldUseDistanceFilter()){
 updateDistanceFilterHelp();
 return Promise.resolve(false);
 }
 if(!navigator.geolocation){
 state.distanceStatus = 'error';
 updateDistanceFilterHelp();
 return Promise.resolve(false);
 }

 if(hasFreshUserLocation()){
 recalculateBenefitDistances();
 state.distanceStatus = 'ready';
 updateDistanceFilterHelp();
 return Promise.resolve(true);
 }

 state.distanceStatus = 'loading';
 updateDistanceFilterHelp();
 return getReliableCurrentPosition()
 .then(() => {
 state.distanceStatus = 'ready';
 updateDistanceFilterHelp();
 return true;
 })
 .catch((error) => {
 console.warn('거리순 정렬 위치 확인 실패', error);
 state.distanceStatus = 'error';
 if(!hasFreshUserLocation()){
 state.userLocation = null;
 state.userLocationFetchedAt = 0;
 state.distanceMap = {};
 }
 updateDistanceFilterHelp();
 return false;
 });
 }


/* ===== Fix: 혜택 최초 진입 시에도 거리 태그 준비 ===== */

function prepareInitialBenefitDistances(){
  // 최초 혜택 진입에서도 거리 태그가 보이도록 기본 상태에서도 한 번만 거리 계산을 수행합니다.
  if(prepareInitialBenefitDistances._running || prepareInitialBenefitDistances._done) return Promise.resolve(false);
  if(!navigator.geolocation) return Promise.resolve(false);

  const repaintBenefitLists = () => {
    try {
      recalculateBenefitDistances();
      renderList('#cardList', getFilteredBenefits());
      renderList('#favoriteList', getVisibleBenefits().filter((item) => state.favoriteIds.includes(item.id)));
      updateDistanceFilterHelp();
    } catch(_) {}
  };

  if(hasFreshUserLocation()){
    state.distanceStatus = 'ready';
    repaintBenefitLists();
    prepareInitialBenefitDistances._done = true;
    return Promise.resolve(true);
  }

  prepareInitialBenefitDistances._running = true;
  state.distanceStatus = 'loading';
  updateDistanceFilterHelp();

  return getReliableCurrentPosition()
    .then(() => {
      state.distanceStatus = 'ready';
      repaintBenefitLists();
      prepareInitialBenefitDistances._done = true;
      return true;
    })
    .catch(() => {
      state.distanceStatus = 'idle';
      updateDistanceFilterHelp();
      return false;
    })
    .finally(() => {
      prepareInitialBenefitDistances._running = false;
    });
}

document.addEventListener('DOMContentLoaded', function(){
  setTimeout(prepareInitialBenefitDistances, 900);
});
window.addEventListener('load', function(){
  setTimeout(prepareInitialBenefitDistances, 700);
});



 function updateDistanceText(item = {}){
 const target = qs('#distanceText');
 if(!target) return;

 const itemId = String(item.id || '');
 const requestSeq = ++state.distanceRequestSeq;
 state.activeDistanceBenefitId = itemId;

 const isStillCurrent = () => {
 const modal = qs('#detailModal');
 return isLayerOpenLike(modal) && state.activeDistanceBenefitId === itemId && state.distanceRequestSeq === requestSeq;
 };

 const applyDistanceText = (currentLocation, { cached = false } = {}) => {
 if(!isStillCurrent() || !currentLocation) return;
 const distance = getDistanceMeters(currentLocation.lat, currentLocation.lng, pos.lat, pos.lng);
 if(distance > 200000){
 target.textContent = '매장 좌표가 실제 위치와 맞지 않는 것 같습니다. 주소 기준으로 지도를 확인해 주세요.';
 target.classList.add('muted');
 return;
 }
 target.innerHTML = `<div><img class="upick-svg-icon upick-inline-icon" src="/icons/internal/walk.svg" alt="" loading="lazy">현재 위치에서 ${formatDistance(distance)} 거리입니다.${cached ? ' (최근 위치 기준)' : ''}</div>${travelTimesHtml(distance)}`;
 target.classList.remove('muted');
 };

 const pos = getBenefitLatLng(item);
 target.dataset.benefitId = itemId;
 target.classList.add('muted');

 // lat/lng가 0, null, 빈값, 한국 좌표 범위 밖이면 현재 위치 계산 자체를 시작하지 않습니다.
 if(!pos){
 target.dataset.invalidCoordinate = 'true';
 target.textContent = '매장 좌표가 아직 등록되지 않아 거리 표시를 생략합니다.';
 return;
 }

 target.dataset.invalidCoordinate = 'false';
 target.textContent = '현재 위치 기준 거리를 준비 중입니다.';
 if(!navigator.geolocation){
 target.textContent = '이 브라우저에서는 현재 위치 확인을 지원하지 않습니다.';
 return;
 }

 // 모바일 안정화: 최근 1분 이내 위치가 있으면 즉시 표시하고, 뒤에서 새 위치로 한 번 더 갱신합니다.
 if(hasFreshUserLocation()){
 applyDistanceText(state.userLocation, { cached: true });
 getReliableCurrentPosition({ forceRefresh: true })
 .then((currentLocation) => applyDistanceText(currentLocation, { cached: false }))
 .catch((error) => console.warn('상세 거리 백그라운드 갱신 실패', error));
 return;
 }

 target.textContent = '현재 위치를 확인하는 중입니다...';
 target.classList.remove('muted');
 getReliableCurrentPosition()
 .then((currentLocation) => applyDistanceText(currentLocation, { cached: false }))
 .catch((error) => {
 if(!isStillCurrent()) return;
 console.warn('현재 위치 확인 실패', error);
 target.textContent = '현재 위치 권한을 허용하면 매장까지의 거리를 표시합니다.';
 target.classList.add('muted');
 });
 }

 const SOCIAL_LINK_DEFS = [
 { key:'homepage', field:'homepageUrl', label:'홈페이지', icon:'icon:homepage', statField:'homepageClickCount' },
 { key:'blog', field:'blogUrl', label:'블로그', icon:'icon:blog', statField:'blogClickCount' },
 { key:'instagram', field:'instagramUrl', label:'인스타그램', icon:'icon:instagram', statField:'instagramClickCount' },
 { key:'youtube', field:'youtubeUrl', label:'유튜브', icon:'icon:youtube', statField:'youtubeClickCount' },
 { key:'facebook', field:'facebookUrl', label:'페이스북', icon:'icon:facebook', statField:'facebookClickCount' },
 { key:'smartstore', field:'smartstoreUrl', label:'스마트스토어', icon:'icon:smartstore', statField:'smartstoreClickCount' },
 { key:'band', field:'bandUrl', label:'밴드', icon:'icon:band', statField:'bandClickCount' }
 ];

 function getBenefitSocialLinks(item = {}){
 const external = item.externalLinks || {};
 return SOCIAL_LINK_DEFS.map((def) => {
 const url = String(item[def.field] || external[def.key] || (def.key === 'smartstore' ? external.smartStore : '') || '').trim();
 return url ? { ...def, url } : null;
 }).filter(Boolean);
 }

 function benefitSocialLinksHtml(item = {}, { ai = false } = {}){
 const links = getBenefitSocialLinks(item);
 if(!links.length) return '';
 const cls = ai ? 'ai-social-links' : 'benefit-extra-links';
 return `<div class="${cls}">${links.map((link) => `<a href="${escapeAttr(link.url)}" target="_blank" rel="noopener" data-social-link="${escapeAttr(link.key)}" data-social-stat="${escapeAttr(link.statField)}" data-benefit-id="${escapeAttr(item.id || '')}">${renderIconToken(link.icon)} ${escapeHtml(link.label)}</a>`).join('')}</div>`;
 }

 function buildAiSocialHintHtml(item = {}){
 const links = getBenefitSocialLinks(item);
 if(!links.length) return '';
 const labels = links.map(v => v.label);
 const lead = labels.length === 1
 ? `${labels[0]} 링크가 등록되어 있습니다.`
 : `${labels.slice(0, -1).join(', ')}${labels.length > 1 ? ', ' : ''}${labels.at(-1)} 링크가 등록되어 있습니다.`;
 const bandNote = links.some(v => v.key === 'band') ? ' 밴드에서 공지나 이벤트 소식을 확인하기 좋습니다.' : '';
 const storeNote = links.some(v => v.key === 'smartstore') ? ' 스마트스토어가 있어 상품 구매 연결도 가능합니다.' : '';
 const instagramNote = links.some(v => v.key === 'instagram') ? ' 인스타그램에서 사진, 메뉴, 이벤트를 확인할 수 있습니다.' : '';
 return `<div class="ai-social-hint">${escapeHtml(lead + instagramNote + storeNote + bandNote)}${benefitSocialLinksHtml(item, { ai:true })}</div>`;
 }

 function bindBenefitSocialLinks(item = {}){
 qsa('#detailModal [data-social-link]').forEach((link) => {
 link.addEventListener('click', () => {
 const key = link.dataset.socialLink || 'sns';
 const statField = link.dataset.socialStat || 'snsClickCount';
 increaseStat(item.id, item.name, statField);
 if(!['smartstoreClickCount','bandClickCount'].includes(statField)) increaseStat(item.id, item.name, 'snsClickCount');
 logBenefitEvent(item.id, `${key}_click`);
 });
 });
 }

 

const NAVER_SERVICE_CONFIGS = [
 { key:'reservation', label:'네이버 예약', shortLabel:'예약', buttonLabel:'예약하러 가기', statField:'reservationClickCount', eventName:'naver_reservation_click', icon:'/icons/internal/calendar.svg', enabledFields:['naverReservationEnabled','naverBookingEnabled','reservationEnabled'], urlFields:['naverReservationUrl','naverBookingUrl','reservationUrl'], externalKey:'naverReservation', nestedKey:'reservation' },
 { key:'order', label:'네이버 주문', shortLabel:'주문', buttonLabel:'주문하러 가기', statField:'orderClickCount', eventName:'naver_order_click', icon:'/icons/internal/benefit.svg', enabledFields:['naverOrderEnabled','naverSmartOrderEnabled','orderEnabled'], urlFields:['naverOrderUrl','naverSmartOrderUrl','orderUrl'], externalKey:'naverOrder', nestedKey:'order' },
 { key:'delivery', label:'네이버 배달', shortLabel:'배달', buttonLabel:'배달 주문하기', statField:'deliveryClickCount', eventName:'naver_delivery_click', icon:'/icons/internal/store.svg', enabledFields:['naverDeliveryEnabled','deliveryEnabled'], urlFields:['naverDeliveryUrl','deliveryUrl'], externalKey:'naverDelivery', nestedKey:'delivery' },
 { key:'talk', label:'톡톡 문의', shortLabel:'톡톡', buttonLabel:'톡톡 문의하기', statField:'talkClickCount', eventName:'naver_talk_click', icon:'/icons/internal/chat.svg', enabledFields:['naverTalkEnabled','talkTalkEnabled','talkEnabled'], urlFields:['naverTalkUrl','talkTalkUrl','talkUrl'], externalKey:'naverTalk', nestedKey:'talk' }
];
function normalizeExternalUrl(url=''){
 let value = String(url || '').trim();
 if(value && !/^https?:\/\//i.test(value)) value = `https://${value.replace(/^\/+/, '')}`;
 return value;
}
function getNaverServiceInfo(item = {}, config = NAVER_SERVICE_CONFIGS[0]){
 const rawUrl = config.urlFields.map(k => item?.[k]).find(Boolean)
   || item?.[config.nestedKey]?.url
   || item?.externalLinks?.[config.externalKey]
   || item?.externalLinks?.[config.key]
   || '';
 const url = normalizeExternalUrl(rawUrl);
 const enabled = !!(config.enabledFields.some(k => item?.[k]) || item?.[config.nestedKey]?.enabled || url);
 return { ...config, enabled, url };
}
function getNaverReservationInfo(item = {}){ return getNaverServiceInfo(item, NAVER_SERVICE_CONFIGS[0]); }
function hasNaverReservation(item = {}){ return getNaverReservationInfo(item).enabled; }
function getEnabledNaverServices(item = {}){ return NAVER_SERVICE_CONFIGS.map(cfg => getNaverServiceInfo(item, cfg)).filter(info => info.enabled); }
function naverReservationBadgeHtml(item = {}){
 return '';
}
function naverServiceBadgesHtml(item = {}){
 // 카드와 상세 상단에는 네이버 예약/주문/배달/톡톡 chip을 노출하지 않습니다.
 // 실제 연결 버튼은 혜택 상세 하단의 '네이버 연동 가능' 패널에서만 제공합니다.
 return '';
}
function naverReservationPanelHtml(item = {}){
 const services = getEnabledNaverServices(item);
 if(!services.length) return '';
 const buttons = services.map(info => info.url
   ? `<a class="btn btn-primary naver-reservation-btn naver-service-btn" href="${escapeAttr(info.url)}" target="_blank" rel="noopener noreferrer" data-naver-service-url="${escapeAttr(info.url)}" data-naver-service-key="${escapeAttr(info.key)}" data-naver-service-stat="${escapeAttr(info.statField)}" data-naver-service-event="${escapeAttr(info.eventName)}" data-benefit-id="${escapeAttr(item.id || '')}">${escapeHtml(info.buttonLabel)}</a>`
   : `<span class="naver-reservation-muted">${escapeHtml(info.label)} 가능 매장입니다. URL은 관리자 등록 후 연결됩니다.</span>`).join('');
 const names = services.map(v => v.label).join(' · ');
 return `<div class="panel naver-reservation-panel naver-service-panel"><strong class="benefit-detail-panel-title">네이버 연동 가능</strong><div class="benefit-detail-body-text">${escapeHtml(names)}을 지원합니다. 실시간 예약·주문·배달 가능 여부는 네이버 페이지에서 확인해 주세요.</div><div class="naver-reservation-actions naver-service-actions">${buttons}</div></div>`;
}
function bindNaverReservationButtons(scope){
 const root = scope || document;
 root.querySelectorAll('[data-naver-service-url],[data-naver-reservation-url]').forEach((el)=>{
   if(el.dataset.naverReservationBound === '1') return;
   el.dataset.naverReservationBound = '1';
   el.addEventListener('click', ()=>{
     const id = el.dataset.benefitId || '';
     if(id){
       const item = (state.benefits || []).find(v => String(v.id) === String(id)) || {};
       const statField = el.dataset.naverServiceStat || 'reservationClickCount';
       const eventName = el.dataset.naverServiceEvent || 'naver_reservation_click';
       increaseStat(id, item.name || '', statField);
       logBenefitEvent(id, eventName);
     }
   });
 });
}

function normalizeSupportProgramsForDetail(item = {}){
 return normalizeSupportProgramItemsForDetail(item).map(row => row.name).filter(Boolean);
}
function normalizeSupportProgramItemsForDetail(item = {}){
 const rows = [];
 const pushRow = (row = {}) => {
   const name = String(row.name || row.title || row.label || row.program || row.type || row.supportName || '').trim();
   const startedAt = String(row.startedAt || row.startDate || row.supportProgramStartedAt || row.supportProgramStartDate || '').trim();
   const endedAt = String(row.endedAt || row.endDate || row.supportProgramEndedAt || row.supportProgramEndDate || '').trim();
   if(name) rows.push({ name, startedAt, endedAt });
 };
 const rawItems = item.supportProgramItems || item.supportPrograms?.items || item.governmentSupportItems || item.supportProgramRows || [];
 if(Array.isArray(rawItems)) rawItems.forEach(pushRow);
 const raw = item.supportPrograms ?? item.supportProgram ?? item.governmentSupport ?? item.supportProgramNames ?? item.supportProgramList ?? {};
 let programs = [];
 if(Array.isArray(raw)) programs = raw;
 else if(raw && typeof raw === 'object') {
   if(Array.isArray(raw.programs)) programs = raw.programs;
   else if(Array.isArray(raw.items) && !rows.length) programs = raw.items;
   else if(Array.isArray(raw.names)) programs = raw.names;
   else programs = Object.entries(raw).filter(([key, value]) => key !== 'enabled' && value).map(([key, value]) => typeof value === 'string' ? value : key);
 } else if(typeof raw === 'string') programs = raw.split(/[·,，\n]/);
 if(!programs.length && typeof item.supportProgramsText === 'string') programs = item.supportProgramsText.split(/[·,，\n]/);
 const legacyStartedAt = item.supportProgramStartedAt || item.supportProgramStartDate || item.governmentSupportStartedAt || item.governmentSupportStartDate || '';
 const legacyEndedAt = item.supportProgramEndedAt || item.supportProgramEndDate || item.governmentSupportEndedAt || item.governmentSupportEndDate || '';
 programs.map(v => String(v || '').trim()).filter(Boolean).forEach(name => {
   if(!rows.some(row => row.name === name)) rows.push({ name, startedAt:legacyStartedAt, endedAt:legacyEndedAt });
 });
 const seen = new Set();
 return rows.filter(row => {
   const key = `${row.name}|${row.startedAt}|${row.endedAt}`;
   if(seen.has(key)) return false;
   seen.add(key);
   return true;
 });
}

function getSupportProgramIconSvg(name = ''){
 const label = String(name || '').trim();
 const safeLabel = escapeHtml(label);
 if(label.includes('고유가') || label.includes('유가') || label.includes('피해지원금')){
   return `<span class="support-program-svg-icon oil" aria-hidden="true"><svg viewBox="0 0 24 24" focusable="false"><path d="M7 3h8.2c.7 0 1.3.6 1.3 1.3v14.4c0 .7-.6 1.3-1.3 1.3H7c-.7 0-1.3-.6-1.3-1.3V4.3C5.7 3.6 6.3 3 7 3Z"/><path d="M8.2 5.2h5.8v4.6H8.2V5.2Z"/><path d="M16.5 7.2h1.1l1.8 1.8v6.2c0 .9.7 1.6 1.6 1.6.8 0 1.5-.7 1.5-1.6v-3.1"/><path d="M19.4 9l-1.2 1.2 2.2 2.2 1.2-1.2"/><path d="M11.2 13.2c-1.2 1.3-1.8 2.3-1.8 3.1 0 1 .8 1.8 1.8 1.8s1.8-.8 1.8-1.8c0-.8-.6-1.8-1.8-3.1Z"/></svg></span>`;
 }
 if(label.includes('지역화폐') || label.includes('화폐')){
   return `<span class="support-program-svg-icon local" aria-hidden="true"><svg viewBox="0 0 24 24" focusable="false"><rect x="3" y="6" width="18" height="12" rx="2.2"/><path d="M6.5 10h6M6.5 14h4M16.5 10.5h1.5M16.5 13.5h1.5"/></svg></span>`;
 }
 return `<span class="support-program-svg-icon card" aria-hidden="true"><svg viewBox="0 0 24 24" focusable="false"><rect x="3" y="5" width="18" height="14" rx="2.5"/><path d="M3 9h18M7 14h4"/></svg></span>`;
}
function supportProgramChipHtml(row = ''){
 const item = typeof row === 'string' ? { name:row } : (row || {});
 const label = String(item.name || '').trim();
 if(!label) return '';
 const period = supportProgramPeriodText(item);
 return `<span class="support-program-detail-chip" title="${escapeAttr(label)}">${getSupportProgramIconSvg(label)}<span class="support-program-chip-label">${escapeHtml(label)}</span>${period ? `<em class="support-program-chip-period">${escapeHtml(period)}</em>` : ''}</span>`;
}

function parseDateOnlyValue(value){
 const text = String(value || '').trim();
 if(!text) return null;
 const match = text.match(/^(\d{4})[-.](\d{1,2})[-.](\d{1,2})/);
 if(!match) return null;
 const y = Number(match[1]);
 const m = Number(match[2]);
 const d = Number(match[3]);
 if(!y || !m || !d) return null;
 return new Date(y, m - 1, d);
}
function formatSupportProgramDate(value){
 const date = parseDateOnlyValue(value);
 if(!date) return '';
 const y = date.getFullYear();
 const m = String(date.getMonth() + 1).padStart(2, '0');
 const d = String(date.getDate()).padStart(2, '0');
 return `${y}.${m}.${d}`;
}
function isSupportProgramRowActive(row = {}){
 const today = new Date();
 const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
 const start = parseDateOnlyValue(row.startedAt);
 const end = parseDateOnlyValue(row.endedAt);
 if(start && start > todayOnly) return false;
 if(end && end < todayOnly) return false;
 return true;
}
function isSupportProgramExpired(item = {}){
 const rows = normalizeSupportProgramItemsForDetail(item);
 return rows.length > 0 && rows.every(row => {
   const end = parseDateOnlyValue(row.endedAt);
   if(!end) return false;
   const today = new Date();
   const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
   return end < todayOnly;
 });
}
function supportProgramPeriodText(row = {}){
 const startText = formatSupportProgramDate(row.startedAt);
 const endText = formatSupportProgramDate(row.endedAt);
 if(!startText && !endText) return '';
 return startText && endText ? `${startText} ~ ${endText}` : (endText ? `${endText}까지` : `${startText}부터`);
}
function supportProgramPeriodHtml(item = {}){
 const rows = normalizeSupportProgramItemsForDetail(item).filter(isSupportProgramRowActive);
 const rowsWithPeriod = rows.map(supportProgramPeriodText).filter(Boolean);
 if(!rowsWithPeriod.length) return '';
 return `<p class="support-program-period-note"><strong>유효기간</strong> ${escapeHtml([...new Set(rowsWithPeriod)].join(' · '))}</p>`;
}
function supportProgramsPanelHtml(item = {}){
 const rows = normalizeSupportProgramItemsForDetail(item).filter(isSupportProgramRowActive);
 if(!rows.length) return '';
 const names = rows.map(v => supportProgramChipHtml(v)).join('');
 return `<div class="panel support-program-detail-panel"><strong style="display:block;margin-bottom:6px;font-size:13px;color:var(--muted);">정부지원금 사용 가능</strong><div class="support-program-detail-list">${names}</div><p class="support-program-detail-note">지원금별 유효기간이 다를 수 있습니다. 매장 사정이나 결제 수단에 따라 사용 가능 여부가 달라질 수 있으니, 방문 전 매장에 확인해주세요.</p></div>`;
}
function normalizeCouponLinksForDetail(item = {}){
 const raw = item.couponLinks || item.coupons || item.couponList || item.couponUrls || [];
 let rows = [];
 if(Array.isArray(raw)){
   rows = raw.map(row => {
     if(typeof row === 'string') return { title:'쿠폰 있어요', url:row };
     row = row || {};
     return { title:String(row.title || row.name || row.label || row.couponTitle || '쿠폰 있어요').trim(), url:String(row.url || row.link || row.href || row.couponUrl || '').trim() };
   });
 }else if(raw && typeof raw === 'object'){
   rows = [{ title:String(raw.title || raw.name || raw.label || raw.couponTitle || '쿠폰 있어요').trim(), url:String(raw.url || raw.link || raw.href || raw.couponUrl || '').trim() }];
 }else if(typeof raw === 'string'){
   rows = raw.split(/[\n,，]/).map(url => ({ title:'쿠폰 있어요', url:String(url).trim() }));
 }
 return rows.filter(row => row.url).map(row => ({ title:row.title || '쿠폰 있어요', url:row.url }));
}
function couponLinksPanelHtml(item = {}){
 const rows = normalizeCouponLinksForDetail(item);
 if(!rows.length) return '';
 const first = rows[0];
 return `<div class="panel coupon-link-detail-panel"><strong style="display:block;margin-bottom:10px;font-size:15px;color:#0f172a;">쿠폰</strong><a class="coupon-link-detail-card" href="${escapeAttr(first.url)}" target="_blank" rel="noopener"><span class="coupon-link-detail-icon">🎁</span><span class="coupon-link-detail-copy"><b>쿠폰 있어요</b><em>${escapeHtml(first.title)}</em></span><span class="coupon-link-detail-action">모두 보기</span></a></div>`;
}


function normalizeNewsItemsForDetail(item = {}){
 const raw = item.newsItems || item.news || item.storeNews || item.noticeLinks || [];
 let rows = [];
 if(Array.isArray(raw)){
   rows = raw.map(row => {
     if(typeof row === 'string') return { title:'소식', imageUrl:'', date:'', url:row };
     row = row || {};
     return {
       title:String(row.title || row.name || row.label || row.newsTitle || '소식').trim(),
       badge:String(row.badge || row.type || row.badgeLabel || row.newsBadge || '소식').trim(),
       imageUrl:String(row.imageUrl || row.thumbnailUrl || row.thumbnail || row.photoUrl || row.image || '').trim(),
       date:String(row.date || row.newsDate || row.publishedAt || row.createdText || '').trim(),
       url:String(row.url || row.link || row.href || row.newsUrl || '').trim()
     };
   });
 }else if(raw && typeof raw === 'object'){
   rows = [{ title:String(raw.title || raw.name || raw.label || raw.newsTitle || '소식').trim(), badge:String(raw.badge || raw.type || raw.badgeLabel || raw.newsBadge || '소식').trim(), imageUrl:String(raw.imageUrl || raw.thumbnailUrl || raw.thumbnail || raw.photoUrl || raw.image || '').trim(), date:String(raw.date || raw.newsDate || raw.publishedAt || raw.createdText || '').trim(), url:String(raw.url || raw.link || raw.href || raw.newsUrl || '').trim() }];
 }else if(typeof raw === 'string'){
   rows = raw.split(/[\n,，]/).map(url => ({ title:'소식', imageUrl:'', date:'', url:String(url).trim() }));
 }
 return rows.filter(row => row.title || row.imageUrl || row.url).map(row => ({
   title:row.title || '소식',
   badge:row.badge || row.type || '소식',
   imageUrl:row.imageUrl || '',
   date:row.date || '',
   url:row.url || '',
   createdAt:row.createdAt || row.created || row.createdDate || row.createdAtText || row.publishedAt || row.newsDate || row.date || '',
   registeredAt:row.registeredAt || row.registered || row.registeredDate || '',
   updatedAt:row.updatedAt || row.updated || ''
 })).sort((a,b)=>{
   const toMs = (v) => {
     if(!v) return 0;
     if(typeof v === 'number') return v;
     if(v?.seconds) return v.seconds * 1000;
     if(typeof v?.toDate === 'function') return v.toDate().getTime();
     const t = Date.parse(String(v).replace(/\./g,'-'));
     return Number.isFinite(t) ? t : 0;
   };
   return Math.max(toMs(b.createdAt), toMs(b.registeredAt), toMs(b.updatedAt), toMs(b.date)) - Math.max(toMs(a.createdAt), toMs(a.registeredAt), toMs(a.updatedAt), toMs(a.date));
 });
}

function newsItemsPanelHtml(item = {}){
 const rows = normalizeNewsItemsForDetail(item);
 if(!rows.length) return '';
 const cards = rows.map((row) => {
   const badge = String(row.badge || row.type || '소식').trim() || '소식';
   const badgeKey = badge.toLowerCase().replace(/[^a-z0-9가-힣_-]/g,'');
   const badgeHtml = `<span class="news-detail-badge ${escapeAttr(badgeKey)}">${escapeHtml(badge)}</span>`;
   const image = row.imageUrl ? `<button type="button" class="news-detail-thumb benefit-detail-photo-like" data-news-image="${escapeAttr(row.imageUrl)}" data-news-title="${escapeAttr(row.title || '소식 이미지')}" aria-label="소식 이미지 확대">${badgeHtml}<img src="${escapeAttr(row.imageUrl)}" alt="" loading="lazy" decoding="async"></button>` : `<span class="news-detail-thumb empty">${badgeHtml}소식</span>`;
   const body = `<div class="news-detail-copy"><b>${escapeHtml(row.title || '소식')}</b>${row.date ? `<em>${escapeHtml(row.date)}</em>` : ''}</div>`;
   if(row.url){
     return `<a class="news-detail-card" href="${escapeAttr(row.url)}" target="_blank" rel="noopener">${image}${body}</a>`;
   }
   return `<div class="news-detail-card">${image}${body}</div>`;
 }).join('');
 return `<div class="panel news-detail-panel"><strong style="display:block;margin-bottom:10px;font-size:15px;color:#0f172a;">소식</strong><div class="news-detail-list">${cards}</div></div>`;
}

function openNewsImagePreview(src='', title='소식 이미지'){
 const imageUrl = String(src || '').trim();
 if(!imageUrl) return;
 let overlay = document.getElementById('newsImagePreviewOverlay');
 if(!overlay){
   overlay = document.createElement('div');
   overlay.id = 'newsImagePreviewOverlay';
   overlay.className = 'news-image-preview-overlay upick-image-fade-layer upick-motion-layer du-layer du-layer--fullscreen';
   overlay.dataset.duDynamic = '1';
   overlay.setAttribute('role','dialog');
   overlay.setAttribute('aria-modal','true');
   overlay.setAttribute('aria-hidden','true');
   overlay.setAttribute('data-du-layer','fullscreen');
   overlay.setAttribute('data-du-close-on-backdrop','false');
   overlay.setAttribute('data-du-close-on-esc','false');
   overlay.innerHTML = `<div class="news-image-preview-dialog du-layer__panel" data-du-layer-panel role="document" aria-label="소식 이미지 확대"><div class="news-image-preview-head du-layer__header" data-du-layer-header><div class="du-layer__header-main"><div class="news-image-preview-title du-layer__title">소식 이미지</div></div><div class="du-layer__header-actions"><button type="button" class="news-image-preview-close du-layer__close" data-du-layer-close aria-label="닫기">×</button></div></div><div class="news-image-preview-body du-layer__body" data-du-layer-body><img alt=""></div></div>`;
   if(window.DuLayer && typeof window.DuLayer.mount === 'function') window.DuLayer.mount(overlay, 'fullscreen');
   else (document.getElementById('duLayerRoot') || document.body).appendChild(overlay);
   const closePreview = () => {
     if(overlay.dataset.upickImageClosing === '1') return;
     overlay.dataset.upickImageClosing = '1';
     overlay.classList.add('closing','upick-motion-closing');
     overlay.classList.remove('show','upick-motion-open','is-open');
     overlay.setAttribute('aria-hidden','true');
     window.setTimeout(() => {
       overlay.classList.remove('closing','upick-motion-closing','is-closing');
       delete overlay.dataset.upickImageClosing;
       overlay.removeAttribute('open');
       overlay.setAttribute('aria-hidden','true');
       document.body.classList.remove('news-image-preview-open');
       const img = overlay.querySelector('img');
       if(img) img.removeAttribute('src');
       // Root1 편입 후 닫힘 애니메이션이 끝나면 DOM에서도 제거합니다.
       // 남은 투명 레이어가 클릭/lock 상태를 붙잡는 문제를 방지합니다.
       try{
         var removed = false;
         if(window.DuLayer && typeof window.DuLayer.unmount === 'function') removed = !!window.DuLayer.unmount(overlay);
         if(!removed) overlay.remove();
       }catch(_){
         try{ overlay.remove(); }catch(__){}
       }
       if(typeof window.__upickSyncModalScrollLock === 'function') window.__upickSyncModalScrollLock();
       if(window.DuLayerStackManager && typeof window.DuLayerStackManager.requestSync === 'function') window.DuLayerStackManager.requestSync();
     }, 320);
   };
   overlay.__upickCloseNewsImagePreview = closePreview;
   overlay.addEventListener('click', (event) => {
     if(event.target.closest('.news-image-preview-close,[data-du-layer-close]')) {
       event.preventDefault();
       event.stopPropagation();
       closePreview();
     }
   });
   
 } else {
   overlay.dataset.duDynamic = '1';
 }
 window.__upickCloseNewsImagePreview = function(){
   const current = document.getElementById('newsImagePreviewOverlay');
   if(current && typeof current.__upickCloseNewsImagePreview === 'function') return current.__upickCloseNewsImagePreview();
   if(current){
     current.classList.add('closing','upick-motion-closing');
     current.classList.remove('show','upick-motion-open','is-open');
     current.setAttribute('aria-hidden','true');
     window.setTimeout(() => { try{ current.remove(); }catch(_){}; document.body.classList.remove('news-image-preview-open'); if(typeof window.__upickSyncModalScrollLock === 'function') window.__upickSyncModalScrollLock(); if(window.DuLayerStackManager && typeof window.DuLayerStackManager.requestSync === 'function') window.DuLayerStackManager.requestSync(); }, 260);
   }
 };
 if(window.DuLayer && typeof window.DuLayer.mount === 'function') window.DuLayer.mount(overlay, 'fullscreen');
 else if(!overlay.closest('#duLayerRoot')) (document.getElementById('duLayerRoot') || document.body).appendChild(overlay);
 const img = overlay.querySelector('img');
 if(img){
   img.src = imageUrl;
   img.alt = title || '소식 이미지';
 }
 overlay.classList.remove('show','closing','upick-motion-open','upick-motion-closing','is-open','is-closing');
 delete overlay.dataset.upickImageClosing;
 overlay.setAttribute('aria-hidden','false');
 overlay.setAttribute('open','');
 document.body.classList.add('news-image-preview-open');
 // [open]/aria-hidden=false가 붙어도 첫 프레임은 opacity:0을 유지한 뒤, 다음 프레임에서 show를 추가해 fade-in을 보장합니다.
 requestAnimationFrame(() => requestAnimationFrame(() => {
   overlay.classList.add('show','upick-motion-open','is-open');
   if(typeof window.__upickSyncModalScrollLock === 'function') window.__upickSyncModalScrollLock();
   if(window.DuLayerStackManager && typeof window.DuLayerStackManager.requestSync === 'function') window.DuLayerStackManager.requestSync();
 }));
}

document.addEventListener('click', (event) => {
 const close = event.target.closest?.('#newsImagePreviewOverlay .news-image-preview-close,#newsImagePreviewOverlay [data-du-layer-close]');
 if(!close) return;
 event.preventDefault();
 event.stopPropagation();
 if(typeof window.__upickCloseNewsImagePreview === 'function') window.__upickCloseNewsImagePreview();
}, true);

document.addEventListener('click', (event) => {
 const thumb = event.target.closest?.('[data-news-image]');
 if(!thumb) return;
 event.preventDefault();
 event.stopPropagation();
 openNewsImagePreview(thumb.dataset.newsImage || '', thumb.dataset.newsTitle || '소식 이미지');
}, true);


function benefitExtraInfoHtml(item = {}){
 const links = getBenefitSocialLinks(item);
 const services = [];
 if(item.deliveryAvailable || item.serviceTags?.delivery) services.push('배달');
 if(item.takeoutAvailable || item.serviceTags?.takeout) services.push('포장');
 const memo = String(item.serviceMemo || item.serviceTags?.memo || '').trim();
 if(!links.length && !services.length && !memo) return '';
 const linkHtml = links.length ? benefitSocialLinksHtml(item) : '';
 const serviceHtml = services.length ? `<div class="benefit-extra-services">${services.map(v => `<span>${escapeHtml(v)}</span>`).join('')}</div>` : '';
 const memoHtml = memo ? `<div class="benefit-extra-memo">${escapeHtml(memo)}</div>` : '';
 return `<div class="panel benefit-extra-panel"><strong style="display:block;margin-bottom:2px;font-size:13px;color:var(--muted);">매장 링크 / 이용 옵션</strong>${serviceHtml}${linkHtml}${memoHtml}</div>`;
 }

function formatStationAccessText(station={}){
 const line=String(station.line||station.stationLine||'').trim();
 const name=String(station.name||station.stationName||'').trim();
 const exit=String(station.exit||station.stationExit||'').trim();
 const distance=Number(String(station.distance??station.distanceM??station.meters??'').replace(/[^0-9.]/g,''))||0;
 if(!name && !line && !exit && !distance) return '';
 if(name && !exit && !distance && !line) return name;
 return `${line?line+' ':''}${name}${exit?' '+exit+'에서':''}${distance?' '+Math.round(distance)+'m':''}`.trim();
}
function getBenefitStations(item={}){
 const raw=Array.isArray(item.stations)?item.stations:(Array.isArray(item.stationAccessList)?item.stationAccessList:[]);
 const rows=raw.map(s=>({line:String(s.line||s.stationLine||'').trim(),name:String(s.name||s.stationName||'').trim(),exit:String(s.exit||s.stationExit||'').trim(),distance:Number(String(s.distance??s.distanceM??s.meters??'').replace(/[^0-9.]/g,''))||0})).filter(s=>s.line||s.name||s.exit||s.distance).sort((a,b)=>(a.distance||999999)-(b.distance||999999));
 const legacy=String(item.stationAccessText||item.transitText||item.stationGuide||item.nearStationText||'').trim();
 if(!rows.length && legacy) rows.push({line:'',name:legacy,exit:'',distance:0});
 return rows;
}
function renderStationAccessBadges(item={}){
 const stations=getBenefitStations(item);
 if(!stations.length) return '';
 return `<div class="location-transit-wrap">${stations.map(st=>`<div class="location-transit"><img class="upick-svg-icon upick-inline-icon" src="/icons/internal/location-pin.svg" alt="" loading="lazy" decoding="async">${escapeHtml(formatStationAccessText(st))}</div>`).join('')}</div>`;
}


function formatBenefitHoursRange(row={}){
 if(!row) return '';
 if(row.closed) return '휴무';
 const open = String(row.open || '').trim();
 const close = String(row.close || '').trim();
 if(!open || !close) return '';
 const openMin = timeTextToMinutes(open);
 const closeMin = timeTextToMinutes(close);
 const suffix = openMin != null && closeMin != null && closeMin <= openMin ? ' 익일' : '';
 return `${open} - ${close}${suffix}`;
}

function benefitBusinessHoursPanelHtml(item = {}){
 const todayState = evaluateBenefitOpenState(item);
 const dayKey = getSeoulDayKey();
 const keys = ['mon','tue','wed','thu','fri','sat','sun'];
 const labels = { mon:'월', tue:'화', wed:'수', thu:'목', fri:'금', sat:'토', sun:'일' };
 const rows = keys.map((key) => {
   const row = findBenefitHoursRow(item, key);
   if(!row) return '';
   const main = formatBenefitHoursRange(row) || '영업시간 확인 필요';
   const meta = [];
   if(!row.closed && row.breakStart && row.breakEnd) meta.push(`브레이크 ${row.breakStart} - ${row.breakEnd}${timeTextToMinutes(row.breakEnd) <= timeTextToMinutes(row.breakStart) ? ' 익일' : ''}`);
   if(!row.closed && row.lastOrder) meta.push(`라스트오더 ${row.lastOrder}${isOvernightHoursRow(row) && timeTextToMinutes(row.lastOrder) < timeTextToMinutes(row.open) ? ' 익일' : ''}`);
   if(row.note) meta.push(row.note);
   return `<div class="business-hours-row ${key === dayKey ? 'today' : ''}"><span class="business-hours-day">${labels[key]}</span><div class="business-hours-copy"><b>${escapeHtml(main)}</b>${meta.length ? `<em>${escapeHtml(meta.join(' · '))}</em>` : ''}</div></div>`;
 }).filter(Boolean).join('');
 const hasAny = !!rows || (todayState && todayState.status !== 'unknown');
 if(!hasAny) return '';
 const stateClass = todayState?.canVisitNow === true ? 'open' : (todayState?.canVisitNow === false ? 'closed' : 'unknown');
 return `<div class="panel business-hours-panel">
 <div class="business-hours-head"><strong class="benefit-detail-panel-title">영업시간</strong><span class="business-hours-status ${stateClass}">${escapeHtml(todayState?.label || '영업시간 확인')}</span></div>
 <div class="business-hours-summary">${escapeHtml(todayState?.message || '방문 전 영업시간을 확인해 주세요.')}</div>
 ${rows ? `<div class="business-hours-list">${rows}</div>` : ''}
 <div class="business-hours-note">오후에 열어 오전에 종료되는 매장은 종료 시간을 익일로 표시합니다. 매장 사정에 따라 실제 운영시간은 달라질 수 있습니다.</div>
 </div>`;
}


 function locationPanelHtml(item = {}){
 const address = String(getBenefitDisplayAddress(item) || '').trim();
 const directionText = String(item.directionText || item.directionGuide || item.locationGuide || item.guideText || '').trim();
const stationAccessText = String(item.stationAccessText || item.transitText || item.stationGuide || item.nearStationText || '').trim();
 const mapLink = buildMapSearchLink(item);
 const directionLink = buildDirectionLink(item);
 const pos = getBenefitLatLng(item);
 const distanceText = pos
 ? '현재 위치 기준 거리를 준비 중입니다.'
 : '매장 좌표가 아직 등록되지 않아 거리 표시를 생략합니다.';
 const distanceAttr = pos ? '' : ' data-invalid-coordinate="true"';
 return `<div class="panel location-panel">
 <div class="location-title"><strong>위치 안내</strong></div>
 <div class="location-address">${address || '등록된 주소가 없습니다.'}</div>
 ${renderStationAccessBadges(item)}
 ${benefitContextPanelHtml(item)}
 ${directionText ? `<div class="location-guide">${escapeHtml(directionText)}</div>` : ''}
 <div class="detail-map-box">${pos ? '<div id="detailNaverMap" class="detail-map-canvas"></div>' : '<div class="detail-map-empty">좌표가 등록되면 작은 지도가 표시됩니다.</div>'}</div>
 <div class="location-distance muted" id="distanceText"${distanceAttr}>${distanceText}</div>
 <div class="location-actions">
 <a class="btn btn-soft block" id="mapBtn" href="${mapLink}" target="_blank" rel="noopener">지도 보기</a>
 <a class="btn btn-primary block" id="directionBtn" href="${directionLink}" target="_blank" rel="noopener">네이버 길찾기</a>
 </div>
 <div class="location-note">현재 위치 권한은 거리 표시를 위해서만 사용됩니다. 좌표가 없는 매장은 주소 기준으로 지도/길찾기만 제공합니다.</div>
 </div>`;
 }

 function loadNaverMapsSdk(){
 const isReady = () => !!(window.naver && window.naver.maps && window.naver.maps.Map && window.naver.maps.LatLng);

 const waitForReady = (timeout = 8000) => new Promise((resolve, reject) => {
 if(isReady()) return resolve(window.naver.maps);

 const startedAt = Date.now();
 const timer = setInterval(() => {
 if(isReady()){
 clearInterval(timer);
 resolve(window.naver.maps);
 return;
 }

 if(Date.now() - startedAt > timeout){
 clearInterval(timer);
 reject(new Error('naver_maps_not_loaded'));
 }
 }, 50);
 });

 if(isReady()) return Promise.resolve(window.naver.maps);
 if(!NAVER_MAP_CLIENT_ID) return Promise.reject(new Error('naver_map_client_id_missing'));
 if(naverMapsLoadPromise) return naverMapsLoadPromise;

 naverMapsLoadPromise = new Promise((resolve, reject) => {
 const callbackName = 'initNaverMapSdk_' + Date.now();

 window[callbackName] = () => {
 delete window[callbackName];
 waitForReady().then(resolve).catch(reject);
 };

 const script = document.createElement('script');
 script.type = 'text/javascript';
 script.async = true;
 script.src = 'https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=' + encodeURIComponent(NAVER_MAP_CLIENT_ID) + '&callback=' + callbackName;

 script.onload = () => {
 waitForReady().then(resolve).catch(() => {});
 };

 script.onerror = () => {
 delete window[callbackName];
 reject(new Error('naver_maps_script_load_failed'));
 };

 document.head.appendChild(script);
 }).catch((error) => {
 naverMapsLoadPromise = null;
 throw error;
 });

 return naverMapsLoadPromise;
 }
 function setMapModeStatus(message, type = 'muted'){const el=qs('#mapModeStatus'); if(!el)return; el.classList.remove('muted','error'); if(type)el.classList.add(type); el.textContent=message;}
 function clearNaverMarkers(){benefitMapMarkers.forEach(m=>{try{m.setMap(null)}catch(_){}}); benefitMapMarkers=[]; if(benefitMapUserMarker){try{benefitMapUserMarker.setMap(null)}catch(_){} benefitMapUserMarker=null;}}
 function getMapModeItems(){
  try{
   return getFilteredBenefits('normal').filter(item=>!!getBenefitLatLng(item));
  }catch(error){
   console.warn('지도 표시 항목 계산 실패', error);
   return (state.benefits||[]).filter(item=>isPubliclyVisibleBenefit(item)&&!!getBenefitLatLng(item));
  }
 }
 // 기존 배포 캐시에 getMapModelItems 오타 호출이 남아도 지도 렌더링이 중단되지 않도록 호환 처리
 window.getMapModeItems = getMapModeItems;
 window.getMapModelItems = getMapModeItems;
 function clusterMapItems(items=[], zoom=15){const z=Number(zoom||15); const threshold=z>=19?3:z>=18?8:z>=17?18:z>=16?80:z>=15?150:z>=14?280:z>=13?520:z>=12?950:1800; const clusters=[]; items.forEach(item=>{const pos=getBenefitLatLng(item); if(!pos)return; let selected=null; for(const c of clusters){if(getDistanceMeters(pos.lat,pos.lng,c.lat,c.lng)<=threshold){selected=c;break;}} if(selected){selected.items.push(item); selected.lat=selected.items.reduce((sum,it)=>sum+getBenefitLatLng(it).lat,0)/selected.items.length; selected.lng=selected.items.reduce((sum,it)=>sum+getBenefitLatLng(it).lng,0)/selected.items.length;}else{clusters.push({lat:pos.lat,lng:pos.lng,items:[item]});}}); return clusters;}
 function getMapMarkerLabel(item = {}){
 const raw = String(item.name || item.storeName || item.title || '매장').trim();
 if(!raw) return '매장';
 return raw.length > 10 ? raw.slice(0,10) + '…' : raw;
}
function markerHtmlForItem(item){
 const label = getMapMarkerLabel(item);
 // 지도 마커는 한 줄 캡슐 구조를 유지합니다.
 // 상권 구분 + 예상 혼잡도 + 매장명을 모두 inline으로 배치해 높이 증가로 인한 깨짐을 막습니다.
 return '<div class="map-marker-store" title="'+escapeAttr(String(item?.name || label))+'">'+mapMarkerInlineBadgesHtml(item)+'<span class="map-marker-title"><img class="upick-svg-icon" src="/icons/internal/pin.svg" alt="" loading="lazy"> '+escapeHtml(label)+'</span></div>';
}


// ===== 스타필드 내/외부 + 혼잡도/웨이팅 가능성 안내 =====
// 매장명/주소 문자열이 아니라 관리자 페이지에 등록된 위도/경도 좌표를 기준으로 판별합니다.
// 스타필드 빌리지 운정은 스트리트몰까지 포함해야 하므로 사각형 bounds가 아닌 polygon으로 판단합니다.
// 운영 중 보정이 필요하면 window.UPICK_STARFIELD_POLYGON 또는 localStorage(UPICK_STARFIELD_POLYGON)에 좌표 배열을 넣어 덮어쓸 수 있습니다.
const DEFAULT_STARFIELD_POLYGON_VERSION = '2026-05-24-final-shift-east-v35';
const DEFAULT_STARFIELD_POLYGON = [
  // 스타필드 빌리지 운정 + 스트리트몰 최종 생활권 기준입니다.
  // 기준: 성준님이 지정한 4개 꼭짓점(1→2→4→3) 생활권 polygon.
  // 주의: 공터영어/노가리세상 서측 외부 상권은 제외하고,
  // 그라츠커피랩/테이블린 등 스타필드 주소권 매장은 포함되도록 서측 경계를 동쪽으로 재보정했습니다.
  // 매장명/주소 하드코딩 없이 관리자 등록 위도/경도만으로 내부/외부를 판별합니다.
  { lat: 37.73190, lng: 126.76470 }, // 1. 북서측 경계(외부 상권 제외선)
  { lat: 37.73175, lng: 126.76720 }, // 2. 북동측 경계
  { lat: 37.72455, lng: 126.76630 }, // 4. 남동측 스트리트몰 경계
  { lat: 37.72470, lng: 126.76425 }  // 3. 남서측 스트리트몰 경계
];

const DEFAULT_STARFIELD_BOUNDS = (() => {
  const lats = DEFAULT_STARFIELD_POLYGON.map(p => p.lat);
  const lngs = DEFAULT_STARFIELD_POLYGON.map(p => p.lng);
  return { minLat: Math.min(...lats), maxLat: Math.max(...lats), minLng: Math.min(...lngs), maxLng: Math.max(...lngs) };
})();

function normalizePolygonPoint(point){
 if(Array.isArray(point) && point.length >= 2){
   const lat = Number(point[0]);
   const lng = Number(point[1]);
   return Number.isFinite(lat) && Number.isFinite(lng) ? { lat, lng } : null;
 }
 if(point && typeof point === 'object'){
   const lat = Number(point.lat ?? point.latitude ?? point._lat ?? point.y);
   const lng = Number(point.lng ?? point.lon ?? point.longitude ?? point._long ?? point._lng ?? point.x);
   return Number.isFinite(lat) && Number.isFinite(lng) ? { lat, lng } : null;
 }
 return null;
}

function getConfiguredStarfieldPolygon(){
 try{
   const runtime = window.UPICK_STARFIELD_POLYGON || window.STARFIELD_POLYGON;
   const allowSavedOverride = window.UPICK_ALLOW_STARFIELD_POLYGON_OVERRIDE === true
     || localStorage.getItem('UPICK_ALLOW_STARFIELD_POLYGON_OVERRIDE') === 'true';
   const saved = (!runtime && allowSavedOverride)
     ? JSON.parse(localStorage.getItem('UPICK_STARFIELD_POLYGON') || 'null')
     : null;
   const source = runtime || saved;
   if(Array.isArray(source)){
     const polygon = source.map(normalizePolygonPoint).filter(Boolean);
     if(polygon.length >= 3) return polygon;
   }
 }catch(_){ }
 return DEFAULT_STARFIELD_POLYGON;
}

function getConfiguredStarfieldBounds(){
 const polygon = getConfiguredStarfieldPolygon();
 const lats = polygon.map(p => p.lat);
 const lngs = polygon.map(p => p.lng);
 return { minLat: Math.min(...lats), maxLat: Math.max(...lats), minLng: Math.min(...lngs), maxLng: Math.max(...lngs) };
}

function getStarfieldBoundaryValue(source, keys){
 for(const key of keys){
   const value = source?.[key];
   if(value && typeof value === 'object'){
     const nested = Number(value.latitude ?? value.lat ?? value._lat ?? value.longitude ?? value.lng ?? value._long);
     if(Number.isFinite(nested)) return nested;
   }
   const n = Number(value);
   if(Number.isFinite(n)) return n;
 }
 return NaN;
}

function getBenefitLatLngCandidateObjects(item={}){
 const candidates = [item];
 ['location','position','coord','coords','coordinate','coordinates','geo','geoPoint','geopoint','naverMap','map','place','storeLocation'].forEach((key)=>{
   const value = item?.[key];
   if(value && typeof value === 'object') candidates.push(value);
 });
 return candidates;
}

function isLatLngInBounds(pos, bounds){
 if(!pos || !bounds) return false;
 const lat = Number(pos.lat), lng = Number(pos.lng);
 return Number.isFinite(lat) && Number.isFinite(lng) && lat >= bounds.minLat && lat <= bounds.maxLat && lng >= bounds.minLng && lng <= bounds.maxLng;
}

function isLatLngInPolygon(pos, polygon){
 if(!pos || !Array.isArray(polygon) || polygon.length < 3) return false;
 const lat = Number(pos.lat);
 const lng = Number(pos.lng);
 if(!Number.isFinite(lat) || !Number.isFinite(lng)) return false;
 // 빠른 배제: polygon 바깥 사각영역이면 내부 검사 생략
 const lats = polygon.map(p => Number(p.lat));
 const lngs = polygon.map(p => Number(p.lng));
 if(lat < Math.min(...lats) || lat > Math.max(...lats) || lng < Math.min(...lngs) || lng > Math.max(...lngs)) return false;
 let inside = false;
 for(let i = 0, j = polygon.length - 1; i < polygon.length; j = i++){
   const yi = Number(polygon[i].lat), xi = Number(polygon[i].lng);
   const yj = Number(polygon[j].lat), xj = Number(polygon[j].lng);
   const intersects = ((yi > lat) !== (yj > lat)) && (lng < (xj - xi) * (lat - yi) / ((yj - yi) || 1e-12) + xi);
   if(intersects) inside = !inside;
 }
 return inside;
}


// 스타필드 생활권은 매장명 보정 없이 관리자 등록 좌표 + polygon만으로 판별합니다.
// 경계 매장을 이름으로 강제 분류하면 신규/수정 매장 유지보수가 어려워지므로 사용하지 않습니다.

function normalizeZoneType(value=''){
 const raw = String(value || '').trim().toLowerCase();
 if(!raw) return '';
 if(['starfield_inside','inside','in','internal','스타필드 내부','스타필드내부','내부'].includes(raw)) return 'starfield_inside';
 if(['outside_area','outside','out','external','외부 상권','외부상권','외부'].includes(raw)) return 'outside_area';
 return '';
}

function getBenefitZoneInfo(item={}){
 // 좌표가 있는 일반 매장은 관리자 페이지에 등록된 위도/경도 polygon 기준으로 판별합니다.
 const pos = getBenefitLatLng(item);
 if(pos){
   const polygon = getConfiguredStarfieldPolygon();
   if(isLatLngInPolygon(pos, polygon)){
     return { type:'starfield_inside', label:'스타필드 내부', shortLabel:'내부', reason:'좌표 polygon 기준' };
   }
   return { type:'outside_area', label:'외부 상권', shortLabel:'외부', reason:'좌표 polygon 기준' };
 }
 // 좌표가 없는 예외 매장만 관리자 수동 필드를 보조적으로 사용합니다.
 const manual = normalizeZoneType(item.zoneType || item.locationZone || item.marketZone || item.commercialZone || item.starfieldZone);
 if(manual === 'starfield_inside') return { type:'starfield_inside', label:'스타필드 내부', shortLabel:'내부', reason:'관리자 등록 기준' };
 if(manual === 'outside_area') return { type:'outside_area', label:'외부 상권', shortLabel:'외부', reason:'관리자 등록 기준' };
 return { type:'outside_area', label:'외부 상권', shortLabel:'외부', reason:'기본 분류' };
}


function normalizeAiIntentSpacing(text=''){
 const raw = String(text || '').trim().toLowerCase();
 const compact = raw.replace(/\s+/g, '');
 return { raw, compact };
}

function hasAnyIntentToken(source='', tokens=[]){
 const value = String(source || '');
 return tokens.some((token) => value.includes(token));
}

function getRequestedCommercialZone(question=''){
 const { raw:q, compact } = normalizeAiIntentSpacing(question);
 const outsideTokens = [
   '외부상권', '외부매장', '외부상가', '외부추천', '외부쪽',
   '외부혜택', '밖매장', '밖상권', '주변상권', '주변상가',
   '상가거리', '상권매장', '단지밖', '단지외부', '밖에', '바깥'
 ];
 const insideTokens = [
   '스타필드내부', '스타필드안', '스타필드내', '스타필드빌리지안',
   '스타필드빌리지내', '내부매장', '내부상권', '몰안', '몰내부',
   '건물안', '실내매장'
 ];
 const asksOutside = /외부\s*(상권|매장|상가|추천|혜택)|외부쪽|주변\s*(상권|상가)|상가\s*거리|상권\s*매장|단지\s*(밖|외부)|밖\s*매장|밖\s*상권|밖에|바깥/.test(q)
   || hasAnyIntentToken(compact, outsideTokens);
 const asksInside = /스타필드\s*(내부|안|내)|스타필드\s*빌리지\s*(안|내)|내부\s*(매장|상권)|몰\s*(안|내부)|건물\s*안|실내\s*매장/.test(q)
   || hasAnyIntentToken(compact, insideTokens);
 const mentionsStarfieldOnly = /스타필드|스타필드\s*빌리지/.test(q) || hasAnyIntentToken(compact, ['스타필드', '스타필드빌리지']);
 // 외부 상권/외부 매장 요청은 "스타필드 외부 상권"처럼 스타필드라는 단어가 함께 있어도 외부를 우선합니다.
 if(asksOutside) return 'outside_area';
 if(asksInside) return 'starfield_inside';
 if(mentionsStarfieldOnly) return 'starfield_inside';
 return '';
}

function isBenefitInRequestedCommercialZone(item={}, question=''){
 const requested = getRequestedCommercialZone(question);
 if(!requested) return true;
 return getBenefitZoneInfo(item).type === requested;
}

function getBenefitStatsRow(item={}){
 const id = String(item.id || item.benefitId || '');
 if(!id) return null;
 return state.benefitStatsMap?.[id] || (state.popularItems || []).find((v) => String(v.id || v.benefit?.id || '') === id) || null;
}

function getBenefitPopularRank(item={}){
 const id = String(item.id || item.benefitId || '');
 const row = (state.popularItems || []).find((v) => String(v.id || v.benefit?.id || '') === id);
 return row ? Number(row.rank || 0) : 0;
}

function getBenefitEngagementScore(item={}){
 const row = getBenefitStatsRow(item);
 return Number(row?.popularScore || row?.score || item.popularScore || item.score || item.detailViewCount || item.clickCount || 0) || 0;
}

function numberFromAny(...values){
 for(const value of values){
   if(value == null || value === '') continue;
   const n = Number(String(value).replace(/[^0-9.\-]/g,''));
   if(Number.isFinite(n)) return n;
 }
 return 0;
}

function getBenefitActionMetric(item={}, names=[]){
 const stat = getBenefitStatsRow(item) || {};
 let total = 0;
 for(const name of names){
   total += numberFromAny(item[name], stat[name]);
 }
 return total;
}

function getTimestampMs(value){
 if(!value) return 0;
 if(typeof value === 'number') return value > 1e12 ? value : value * 1000;
 if(typeof value === 'string'){
   const t = Date.parse(value);
   return Number.isFinite(t) ? t : 0;
 }
 if(typeof value === 'object'){
   if(typeof value.toMillis === 'function') return Number(value.toMillis()) || 0;
   if(typeof value.toDate === 'function'){
     const d = value.toDate();
     return d instanceof Date ? d.getTime() : 0;
   }
   if('seconds' in value) return Number(value.seconds) * 1000 + Math.round(Number(value.nanoseconds || 0) / 1e6);
   if('_seconds' in value) return Number(value._seconds) * 1000 + Math.round(Number(value._nanoseconds || 0) / 1e6);
 }
 return 0;
}

function getRecentActionBoost(item={}, now=Date.now()){
 const stat = getBenefitStatsRow(item) || {};
 const candidates = [
   'lastClickAt','lastDetailViewAt','lastViewedAt','lastCardClickAt','updatedAt',
   'lastMapClickAt','lastMapViewAt','lastRouteClickAt','lastDirectionClickAt','lastDirectionsAt',
   'lastPhoneClickAt','lastCallClickAt','lastFavoriteAt','lastSavedAt','lastSharedAt'
 ];
 const latest = Math.max(...candidates.map((key)=>Math.max(getTimestampMs(item[key]), getTimestampMs(stat[key]))), 0);
 const pulse = getDecayedCrowdPulseFromStat(stat, now);
 const historical = getCrowdHistoricalSignal(stat, getSeoulNow());
 let points = Math.min(24, pulse * 0.42);
 let reason = points >= 12 ? '최근 실시간 관심 급증' : (points >= 6 ? '최근 실시간 관심 증가' : '');

 // 평소 같은 요일·시간대보다 지금 반응이 강하면 추가 보정합니다.
 if(pulse >= 10 && historical.signal >= 12){
   const ratio = pulse / Math.max(6, historical.signal * 0.22);
   if(ratio >= 2.4){ points += 8; reason = '평소 대비 관심 급상승'; }
   else if(ratio >= 1.6){ points += 5; reason = reason || '평소 대비 관심 증가'; }
 }

 if(latest){
   const minutes = Math.max(0, (now - latest) / 60000);
   if(minutes <= 10){ points += 8; reason = reason || '최근 10분 관심 증가'; }
   else if(minutes <= 30){ points += 5; reason = reason || '최근 30분 관심 증가'; }
   else if(minutes <= 60){ points += 2; reason = reason || '최근 1시간 관심 증가'; }
 }
 points = Math.min(30, Math.round(points));
 return { points, reason };
}

function getHistoricalTimePatternBoost(item={}, now=getSeoulNow()){
 const stat = getBenefitStatsRow(item) || {};
 const hour = now.getHours();
 const day = now.getDay();
 const isWeekend = day === 0 || day === 6;
 const total = numberFromAny(stat.popularScore, stat.detailViewCount, stat.cardClickCount, item.popularScore, item.detailViewCount);
 const historical = getCrowdHistoricalSignal(stat, now);
 if(total < 20 && historical.total < 15) return { points:0, reason:'' };
 let points = 0;
 const hay = [item.category,item.type,item.name,item.storeName,item.title,item.tags,item.aiTags].flat().join(' ').toLowerCase();
 const foodLike = /맛집|음식|식당|고기|치킨|피자|분식|카페|디저트|베이커리|레스토랑|초밥|라멘|파스타|버거|술집|호프|cafe|coffee|pizza|떡볶|밥|국수|샐러드|브런치/.test(hay);
 const cafeLike = /카페|커피|디저트|베이커리|브런치|cafe|coffee|bakery/.test(hay);
 if(foodLike && ((hour >= 11 && hour <= 13) || (hour >= 17 && hour <= 20))) points += Math.min(8, Math.floor(total / 80) + 3);
 if(cafeLike && hour >= 13 && hour <= 18) points += Math.min(7, Math.floor(total / 90) + 2);
 if(isWeekend && total >= 80) points += 5;

 // 실제 입주민 행동이 쌓인 시간대라면 업종 추정치보다 우선 보정합니다.
 if(historical.signal >= 60) points += 9;
 else if(historical.signal >= 30) points += 6;
 else if(historical.signal >= 14) points += 3;

 if(historical.concentration >= 0.18 && historical.total >= 30) points += 4;
 points = Math.min(16, Math.round(points));
 return points ? { points, reason: historical.signal >= 14 ? '매장별 시간대 이용 패턴' : '요일·시간대 누적 패턴' } : { points:0, reason:'' };
}

function clampCrowdScore(score){
 return Math.max(0, Math.min(100, Math.round(score)));
}

function classifyCrowdScore(score){
 if(score >= 85) return { level:'very_high', label:'매우 혼잡', waitLabel:'웨이팅 가능성 높음' };
 if(score >= 66) return { level:'busy', label:'혼잡 예상', waitLabel:'웨이팅 가능' };
 if(score >= 36) return { level:'normal', label:'보통', waitLabel:'대기 가능성 보통' };
 return { level:'low', label:'여유', waitLabel:'웨이팅 가능성 낮음' };
}

function getSeoulNow(){
 try{ return new Date(new Date().toLocaleString('en-US', { timeZone:'Asia/Seoul' })); }
 catch(_){ return new Date(); }
}


function timeTextToMinutes(value){
 const text = String(value || '').trim();
 let m = text.match(/^(\d{1,2})\s*:\s*(\d{2})$/);
 if(m) return Number(m[1]) * 60 + Number(m[2]);
 m = text.match(/^(\d{1,2})\s*시\s*(\d{1,2})?\s*분?$/);
 if(m) return Number(m[1]) * 60 + Number(m[2] || 0);
 return null;
}

function isMinuteInRange(nowMin, startText, endText){
 const start = timeTextToMinutes(startText);
 const end = timeTextToMinutes(endText);
 if(start == null || end == null || nowMin == null) return false;
 if(start <= end) return nowMin >= start && nowMin < end;
 return nowMin >= start || nowMin < end;
}

function formatMinutesAsTime(min){
 if(min == null || !Number.isFinite(min)) return '';
 const normalized = ((Math.round(min) % 1440) + 1440) % 1440;
 return `${String(Math.floor(normalized / 60)).padStart(2,'0')}:${String(normalized % 60).padStart(2,'0')}`;
}

function extractTimeRangesFromText(text=''){
 const source = String(text || '').replace(/오전\s*/g,'').replace(/오후\s*/g,'');
 const ranges = [];
 const re = /(\d{1,2})(?:\s*[:시]\s*(\d{2})\s*분?)?\s*(?:~|-|–|—|부터|to)\s*(\d{1,2})(?:\s*[:시]\s*(\d{2})\s*분?)?/gi;
 let match;
 while((match = re.exec(source))){
   const start = `${String(match[1]).padStart(2,'0')}:${String(match[2] || '00').padStart(2,'0')}`;
   const end = `${String(match[3]).padStart(2,'0')}:${String(match[4] || '00').padStart(2,'0')}`;
   if(timeTextToMinutes(start) != null && timeTextToMinutes(end) != null) ranges.push({ start, end });
 }
 return ranges;
}

function getSeoulDayKey(now=getSeoulNow()){
 return ['sun','mon','tue','wed','thu','fri','sat'][now.getDay()] || 'mon';
}

function getTodayHoursRowFromObject(obj={}, dayKey=getSeoulDayKey()){
 if(!obj || typeof obj !== 'object' || Array.isArray(obj)) return null;
 const ko = { sun:'일', mon:'월', tue:'화', wed:'수', thu:'목', fri:'금', sat:'토' }[dayKey];
 const long = { sun:'sunday', mon:'monday', tue:'tuesday', wed:'wednesday', thu:'thursday', fri:'friday', sat:'saturday' }[dayKey];
 const candidates = [dayKey, long, ko, `${ko}요일`, String(['sun','mon','tue','wed','thu','fri','sat'].indexOf(dayKey)), 'daily', 'everyday', '매일', 'all'];
 for(const key of candidates){
   const row = obj[key];
   if(row) return Array.isArray(row) ? (row[0] || null) : row;
 }
 return null;
}

function getBenefitHoursSources(item={}){
 const objectSources = [
   item.openingHoursManual, item.businessHoursManual, item.manualBusinessHours, item.adminBusinessHours,
   item.openingHours, item.businessHours, item.hours, item.storeHours, item.operatingHours,
   item.naverMapHours?.openingHours, item.naverSearchHours?.openingHours
 ].filter(v => v && typeof v === 'object' && !Array.isArray(v));
 const textSources = [
   item.todayOpenText, item.openStatusText, item.adminHoursText, item.hoursText, item.openHoursText,
   item.businessHoursText, item.openingHoursText, item.operatingHoursText, item.businessHoursManual,
   item.manualBusinessHours, item.adminBusinessHours, item.openingHoursManual,
   item.naverMapHours?.todayOpenText, item.naverMapHours?.openStatusText,
   item.naverSearchHours?.todayOpenText, item.naverSearchHours?.openStatusText
 ].filter(v => typeof v === 'string' && v.trim());
 return { objectSources, textSources };
}

function normalizeHoursRow(row){
 if(!row) return null;
 if(typeof row === 'string'){
   const ranges = extractTimeRangesFromText(row);
   return {
     closed: /휴무|정기\s*휴무|closed|쉬는\s*날/i.test(row),
     open: ranges[0]?.start || '',
     close: ranges[0]?.end || '',
     breakStart: (/브레이크|break/i.test(row) ? ranges[1]?.start : '') || '',
     breakEnd: (/브레이크|break/i.test(row) ? ranges[1]?.end : '') || '',
     note: row
   };
 }
 if(typeof row === 'object'){
   return {
     closed: row.closed === true || row.isClosed === true || row.holiday === true || row.isHoliday === true || /휴무|closed/i.test(String(row.status || row.openStatus || row.note || '')),
     open: String(row.open || row.start || row.from || row.openTime || row.openingTime || '').trim(),
     close: String(row.close || row.end || row.to || row.closeTime || row.closingTime || '').trim(),
     breakStart: String(row.breakStart || row.break_start || row.breakOpen || row.breakFrom || '').trim(),
     breakEnd: String(row.breakEnd || row.break_end || row.breakClose || row.breakTo || '').trim(),
     lastOrder: String(row.lastOrder || row.last_order || row.orderEnd || '').trim(),
     note: String(row.note || row.memo || row.remark || row.description || row.status || '').trim()
   };
 }
 return null;
}

function getPreviousSeoulDayKey(dayKey=getSeoulDayKey()){
 const keys = ['sun','mon','tue','wed','thu','fri','sat'];
 const idx = keys.indexOf(dayKey);
 return keys[(idx + 6) % 7] || 'sun';
}

function getKoreanDayLabel(dayKey=''){
 return { sun:'일', mon:'월', tue:'화', wed:'수', thu:'목', fri:'금', sat:'토' }[dayKey] || '오늘';
}

function findBenefitHoursRow(item={}, dayKey=getSeoulDayKey()){
 const { objectSources, textSources } = getBenefitHoursSources(item);
 for(const source of objectSources){
   const row = normalizeHoursRow(getTodayHoursRowFromObject(source, dayKey));
   if(row) return row;
 }
 if(dayKey === getSeoulDayKey()){
   const joined = textSources.join('\n');
   if(joined){
     const row = normalizeHoursRow(joined);
     if(row) return row;
   }
   const manualOpen = String(item.openTime || item.open || item.startTime || '').trim();
   const manualClose = String(item.closeTime || item.close || item.endTime || '').trim();
   if(manualOpen && manualClose) return normalizeHoursRow({ open: manualOpen, close: manualClose, breakStart:item.breakStart, breakEnd:item.breakEnd, lastOrder:item.lastOrder, note:item.hoursNote });
 }
 return null;
}

function isOvernightHoursRow(row={}){
 const openMin = timeTextToMinutes(row.open);
 const closeMin = timeTextToMinutes(row.close);
 return openMin != null && closeMin != null && closeMin <= openMin;
}

function toServiceWindowMinute(timeText='', openMin=0, closeMin=0, { forPreviousOvernight=false } = {}){
 let min = timeTextToMinutes(timeText);
 if(min == null) return null;
 if(forPreviousOvernight) return min <= closeMin ? min + 1440 : min;
 if(closeMin <= openMin && min < openMin) return min + 1440;
 return min;
}

function evaluateHoursRowState(row, { nowMin, dayLabel='오늘', previousOvernight=false } = {}){
 if(!row) return null;
 const note = row.note || '';
 const openMin = timeTextToMinutes(row.open);
 const closeMin = timeTextToMinutes(row.close);
 if(row.closed){
   return { status:'closed', canVisitNow:false, label:'휴무', message:`오늘(${dayLabel})은 휴무로 표시되어 혼잡도 예측보다 휴무 안내를 우선합니다.${note ? ` (${note})` : ''}`, row, dayLabel };
 }
 if(openMin == null || closeMin == null){
   return { status:'unknown', canVisitNow:null, label:'영업정보 확인', message:'영업시간 형식을 확인할 수 없어 혼잡도만 예상합니다.', row, dayLabel };
 }
 const adjustedNow = previousOvernight ? nowMin + 1440 : nowMin;
 const adjustedOpen = openMin;
 const adjustedClose = closeMin <= openMin ? closeMin + 1440 : closeMin;
 const displayHours = `${formatMinutesAsTime(openMin)} - ${formatMinutesAsTime(closeMin)}${closeMin <= openMin ? ' (익일)' : ''}`;
 if(adjustedNow < adjustedOpen){
   return { status:'before_open', canVisitNow:false, label:'영업 전', message:`아직 영업 시작 전입니다. 오늘 영업시간은 ${displayHours}입니다.`, row, dayLabel };
 }
 if(adjustedNow >= adjustedClose){
   return { status:'closed_now', canVisitNow:false, label:'영업 종료', message:`현재는 영업시간이 아닙니다. 영업시간은 ${displayHours}입니다.`, row, dayLabel };
 }
 const breakStart = toServiceWindowMinute(row.breakStart, openMin, closeMin, { forPreviousOvernight:previousOvernight });
 const breakEnd = toServiceWindowMinute(row.breakEnd, openMin, closeMin, { forPreviousOvernight:previousOvernight });
 if(breakStart != null && breakEnd != null){
   const adjustedBreakEnd = breakEnd <= breakStart ? breakEnd + 1440 : breakEnd;
   if(adjustedNow >= breakStart && adjustedNow < adjustedBreakEnd){
     return { status:'break_time', canVisitNow:false, label:'브레이크', message:`지금은 브레이크타임입니다. 브레이크타임은 ${row.breakStart} - ${row.breakEnd}${timeTextToMinutes(row.breakEnd) <= timeTextToMinutes(row.breakStart) ? ' (익일)' : ''}입니다.`, row, dayLabel };
   }
 }
 const lastOrderMin = toServiceWindowMinute(row.lastOrder, openMin, closeMin, { forPreviousOvernight:previousOvernight });
 if(lastOrderMin != null && adjustedNow >= lastOrderMin){
   return { status:'last_order_passed', canVisitNow:false, label:'주문 마감', message:`라스트오더(${row.lastOrder}${timeTextToMinutes(row.lastOrder) < openMin ? ' 익일' : ''})가 지난 시간입니다. 방문 전 확인을 추천드립니다.`, row, dayLabel };
 }
 return { status:'open_now', canVisitNow:true, label:'영업 중', message:`현재 영업 중입니다. 영업시간은 ${displayHours}입니다.`, row, dayLabel };
}

function evaluateBenefitOpenState(item={}, now=getSeoulNow()){
 const dayKey = getSeoulDayKey(now);
 const prevDayKey = getPreviousSeoulDayKey(dayKey);
 const nowMin = now.getHours() * 60 + now.getMinutes();
 const prevRow = findBenefitHoursRow(item, prevDayKey);
 if(prevRow && !prevRow.closed && isOvernightHoursRow(prevRow)){
   const prevCloseMin = timeTextToMinutes(prevRow.close);
   if(prevCloseMin != null && nowMin < prevCloseMin){
     const state = evaluateHoursRowState(prevRow, { nowMin, dayLabel:getKoreanDayLabel(prevDayKey), previousOvernight:true });
     if(state) return state;
   }
 }
 const row = findBenefitHoursRow(item, dayKey);
 if(!row) return { status:'unknown', canVisitNow:null, label:'영업정보 없음', message:'영업시간 정보가 없어 혼잡도만 예상합니다.' };
 return evaluateHoursRowState(row, { nowMin, dayLabel:getKoreanDayLabel(dayKey), previousOvernight:false });
}

function getBenefitCrowdInfo(item={}){
 const openState = evaluateBenefitOpenState(item);
 if(openState && openState.canVisitNow === false){
   return {
     level:'closed',
     label:openState.label || '영업시간 외',
     waitLabel:'방문 전 확인 권장',
     score:0,
     dynamic:true,
     openState,
     updatedAtText: `${String(getSeoulNow().getHours()).padStart(2,'0')}:${String(getSeoulNow().getMinutes()).padStart(2,'0')} 기준`,
     reason:openState.message || '영업시간 기준'
   };
 }
 const manual = String(item.crowdLevel || item.crowdStatus || item.waitingLevel || '').trim().toLowerCase();
 const manualMap = {
   low:{level:'low', label:'여유', waitLabel:'웨이팅 가능성 낮음', score:25},
   normal:{level:'normal', label:'보통', waitLabel:'대기 가능성 보통', score:50},
   medium:{level:'normal', label:'보통', waitLabel:'대기 가능성 보통', score:50},
   busy:{level:'busy', label:'혼잡 예상', waitLabel:'웨이팅 가능', score:72},
   high:{level:'busy', label:'혼잡 예상', waitLabel:'웨이팅 가능', score:72},
   very_high:{level:'very_high', label:'매우 혼잡', waitLabel:'웨이팅 가능성 높음', score:90},
   waiting_likely:{level:'very_high', label:'매우 혼잡', waitLabel:'웨이팅 가능성 높음', score:90}
 };
 if(manualMap[manual]) return { ...manualMap[manual], reason:String(item.crowdReason || '관리자 등록 기준'), dynamic:false };

 const now = getSeoulNow();
 const nowMs = now.getTime();
 const day = now.getDay();
 const hour = now.getHours();
 const minute = now.getMinutes();
 const isWeekend = day === 0 || day === 6;
 const isFriday = day === 5;
 const hay = [item.category,item.type,item.name,item.storeName,item.title,item.tags,item.aiTags].flat().join(' ').toLowerCase();
 const foodLike = /맛집|음식|식당|고기|치킨|피자|분식|카페|디저트|베이커리|레스토랑|초밥|라멘|파스타|버거|술집|호프|pub|bar|cafe|coffee|pizza|떡볶|밥|국수|샐러드|브런치/.test(hay);
 const cafeLike = /카페|커피|디저트|베이커리|브런치|cafe|coffee|bakery/.test(hay);
 const educationMedicalLike = /학원|영어|수학|교육|병원|의원|약국|치과|피부|관리|케어/.test(hay);
 const zone = getBenefitZoneInfo(item);
 const rank = getBenefitPopularRank(item);
 const score = getBenefitEngagementScore(item);
 const detailCount = getBenefitActionMetric(item, ['detailViewCount','viewCount','clickCount','cardClickCount']);
 const mapCount = getBenefitActionMetric(item, ['mapClickCount','mapViewCount','routeClickCount','directionClickCount','directionsClickCount','naverMapClickCount','naverDirectionClickCount']);
 const phoneCount = getBenefitActionMetric(item, ['phoneClickCount','callClickCount','telClickCount']);
 const favoriteCount = getBenefitActionMetric(item, ['favoriteCount','saveCount','savedCount']);
 const shareCount = getBenefitActionMetric(item, ['shareClickCount','shareCount','sharedCount']);
 const recent = getRecentActionBoost(item, nowMs);
 const pattern = getHistoricalTimePatternBoost(item, now);
 const peakLunch = hour >= 11 && hour <= 13;
 const peakCafe = cafeLike && ((hour >= 13 && hour <= 17) || (isWeekend && hour >= 11 && hour <= 18));
 const peakDinner = hour >= 17 && hour <= 20;
 const lateEvening = hour >= 21 || hour < 8;
 let crowdScore = 18;
 const reasons = [];

 if(foodLike){ crowdScore += 10; reasons.push(cafeLike ? '카페/디저트 업종' : '외식 업종'); }
 if(educationMedicalLike){ crowdScore -= 5; }
 if(zone.type === 'starfield_inside'){ crowdScore += isWeekend ? 8 : 4; reasons.push(zone.shortLabel + ' 상권'); }
 if(isWeekend){ crowdScore += 13; reasons.push('주말'); }
 else if(isFriday && hour >= 17){ crowdScore += 8; reasons.push('금요일 저녁'); }
 if(peakLunch){ crowdScore += foodLike ? 18 : 8; reasons.push('점심 피크 시간대'); }
 if(peakDinner){ crowdScore += foodLike ? 22 : 9; reasons.push('저녁 피크 시간대'); }
 if(peakCafe){ crowdScore += 14; reasons.push('카페 이용 집중 시간대'); }
 if(lateEvening){ crowdScore -= foodLike ? 12 : 18; reasons.push('늦은 시간대'); }
 if(rank && rank <= 3){ crowdScore += 14; reasons.push('인기 TOP3'); }
 else if(rank && rank <= 5){ crowdScore += 9; reasons.push('인기 TOP5'); }
 if(score >= 250){ crowdScore += 13; reasons.push('누적 관심도 높음'); }
 else if(score >= 100){ crowdScore += 8; reasons.push('누적 관심도 있음'); }
 else if(score >= 40){ crowdScore += 4; }
 if(detailCount >= 100){ crowdScore += 8; reasons.push('상세 조회 많음'); }
 else if(detailCount >= 30){ crowdScore += 4; }
 if(mapCount >= 20){ crowdScore += 13; reasons.push('길찾기/지도 관심 높음'); }
 else if(mapCount >= 5){ crowdScore += 7; reasons.push('지도 관심 있음'); }
 if(phoneCount >= 10){ crowdScore += 9; reasons.push('전화 문의 많음'); }
 else if(phoneCount >= 3){ crowdScore += 4; }
 if(favoriteCount >= 20){ crowdScore += 7; reasons.push('즐겨찾기 많음'); }
 else if(favoriteCount >= 5){ crowdScore += 3; }
 if(shareCount >= 10){ crowdScore += 5; }
 if(recent.points){ crowdScore += recent.points; reasons.push(recent.reason); }
 if(pattern.points){ crowdScore += pattern.points; reasons.push(pattern.reason); }
 // 분 단위 미세 변화를 둬서 현재 시간 기준으로 자연스럽게 갱신되도록 합니다.
 crowdScore += Math.sin((hour * 60 + minute) / 32) * 2;
 crowdScore = clampCrowdScore(crowdScore);
 const classified = classifyCrowdScore(crowdScore);
 const mainReasons = reasons.filter(Boolean).slice(0, 4);
 return {
   ...classified,
   score: crowdScore,
   dynamic: true,
   updatedAtText: `${String(hour).padStart(2,'0')}:${String(minute).padStart(2,'0')} 기준`,
   reason: mainReasons.join(' · ') || '현재 시간대 기준'
 };
}
function mapMarkerInlineBadgesHtml(item={}){
 const zone = getBenefitZoneInfo(item);
 const crowd = getBenefitCrowdInfo(item);
 const crowdLabel = String(crowd.label || '').replace(' 예상','');
 return `<span class="map-marker-zone-badge ${zone.type}">${escapeHtml(zone.shortLabel || zone.label)}</span><span class="map-marker-crowd-badge ${crowd.level}">${escapeHtml(crowdLabel)}</span>`;
}

function benefitContextBadgesHtml(item={}, {compact=false}={}){
 const zone = getBenefitZoneInfo(item);
 const crowd = getBenefitCrowdInfo(item);
 const crowdLabel = compact ? String(crowd.label || '').replace(' 예상','') : String(crowd.label || '');
 return `<span class="benefit-context-badges${compact?' compact':''}" aria-label="상권 및 혼잡도 안내"><span class="benefit-context-badge combined ${zone.type} ${crowd.level}">${escapeHtml(zone.shortLabel || zone.label)} · ${escapeHtml(crowdLabel)}</span></span>`;
}

function benefitContextPanelHtml(item={}){
 const zone = getBenefitZoneInfo(item);
 const crowd = getBenefitCrowdInfo(item);
 const isClosedState = crowd.openState && crowd.openState.canVisitNow === false;
 return `<div class="benefit-context-panel" aria-label="상권 및 예상 혼잡도"><div class="benefit-context-main"><span class="benefit-context-badge zone ${zone.type}">${escapeHtml(zone.label)}</span><span class="benefit-context-badge crowd ${crowd.level}">${escapeHtml(crowd.label)}</span><span class="benefit-context-wait">${escapeHtml(crowd.waitLabel)}</span></div><p>${escapeHtml(crowd.reason)}${isClosedState ? '' : ' 기준의 예상입니다. 실제 웨이팅은 매장 상황에 따라 달라질 수 있어요.'}</p></div>`;
}
 function clusterHtml(count){return '<div class="map-marker-cluster">'+count+'</div>';}
 function normalizeMapCoord(value){const n=Number(value); return Number.isFinite(n)?n.toFixed(6):'';}
 function getSamePositionClusterKey(items=[]){if(!Array.isArray(items)||items.length<=1)return ''; const first=getBenefitLatLng(items[0]); if(!first)return ''; const key=normalizeMapCoord(first.lat)+','+normalizeMapCoord(first.lng); const allSame=items.every(item=>{const pos=getBenefitLatLng(item); return pos&&(normalizeMapCoord(pos.lat)+','+normalizeMapCoord(pos.lng))===key;}); return allSame?key:'';}
 function offsetLatLngByMeters(nm, center, eastMeters, northMeters){const latOffset=northMeters/111320; const lngOffset=eastMeters/(111320*Math.max(.25,Math.cos(center.lat*Math.PI/180))); return new nm.LatLng(center.lat+latOffset, center.lng+lngOffset);}
function getDistanceSpreadMapPosition(nm, center, item, index, count, clusterItems=[]){
 const zoom=benefitMapInstance?.getZoom?Number(benefitMapInstance.getZoom()||15):15;
 const pos=getBenefitLatLng(item)||center;
 const cos=Math.max(.25,Math.cos(center.lat*Math.PI/180));
 const east=(Number(pos.lng)-center.lng)*111320*cos;
 const north=(Number(pos.lat)-center.lat)*111320;
 const actualDistance=Math.sqrt(east*east+north*north);
 const vectors=(clusterItems||[]).map((it)=>{const p=getBenefitLatLng(it)||center; const e=(Number(p.lng)-center.lng)*111320*cos; const n=(Number(p.lat)-center.lat)*111320; return {e,n,d:Math.sqrt(e*e+n*n)};});
 const maxActual=Math.max(...vectors.map(v=>v.d),0);
 const samePosition=maxActual<0.8;
 const minRadius=zoom>=19?10:zoom>=18?12:zoom>=17?16:22;
 const maxRadius=Math.min(96,(zoom>=19?44:zoom>=18?54:zoom>=17?68:82)+Math.max(0,count-6)*3);
 let angle;
 let radius;
 if(samePosition || actualDistance<0.8){
   angle=(-Math.PI/2)+(Math.PI*2*index/Math.max(1,count));
   radius=Math.min(maxRadius, minRadius+Math.max(0,count-4)*2.2);
 }else{
   angle=Math.atan2(north,east);
   radius=minRadius+(actualDistance/Math.max(1,maxActual))*(maxRadius-minRadius);
   // 실제 좌표 방향이 거의 같은 매장끼리는 살짝 벌려서 겹침을 줄입니다.
   const sameDirectionCount=vectors.filter(v=>v.d>=0.8&&Math.abs(Math.atan2(v.n,v.e)-angle)<0.18).length;
   if(sameDirectionCount>1){
     const directionRank=vectors.slice(0,index+1).filter(v=>v.d>=0.8&&Math.abs(Math.atan2(v.n,v.e)-angle)<0.18).length-1;
     angle += (directionRank-(sameDirectionCount-1)/2)*0.22;
   }
 }
 return offsetLatLngByMeters(nm, center, Math.cos(angle)*radius, Math.sin(angle)*radius);
}
function getSpreadMapPosition(nm, center, index, count){const fakeItem={lat:center.lat,lng:center.lng}; return getDistanceSpreadMapPosition(nm, center, fakeItem, index, count, []);}
 function renderSpreadClusterMarkers(nm, cluster){const center={lat:Number(cluster.lat),lng:Number(cluster.lng)}; const count=cluster.items.length; const sortedItems=[...(cluster.items||[])].sort((a,b)=>{const pa=getBenefitLatLng(a)||center; const pb=getBenefitLatLng(b)||center; const da=getDistanceMeters(center.lat,center.lng,pa.lat,pa.lng); const db=getDistanceMeters(center.lat,center.lng,pb.lat,pb.lng); return da-db;}); sortedItems.forEach((item,index)=>{const spreadPosition=getDistanceSpreadMapPosition(nm, center, item, index, count, sortedItems); const marker=new nm.Marker({position:spreadPosition,map:benefitMapInstance,icon:{content:markerHtmlForItem(item),anchor:new nm.Point(18,34)},zIndex:180+index}); nm.Event.addListener(marker,'click',()=>openDetail(item)); benefitMapMarkers.push(marker);});}
 function renderSpreadSamePositionMarkers(nm, cluster){renderSpreadClusterMarkers(nm, cluster);}
 function renderMapPlaceList(items=[]){const el=qs('#mapPlaceList'); if(!el)return; if(!items.length){el.innerHTML='<div class="panel empty">지도에 표시할 혜택이 없습니다.</div>';return;} const sorted=[...items].sort((a,b)=>{const da=getItemDistance(a),db=getItemDistance(b); if(Number.isFinite(da)&&Number.isFinite(db))return da-db; if(Number.isFinite(da))return -1; if(Number.isFinite(db))return 1; return String(a.name||'').localeCompare(String(b.name||''),'ko');}).slice(0,20); el.innerHTML=sorted.map(item=>{const d=getItemDistance(item); return '<div class="map-place-card" data-map-benefit-id="'+escapeHtml(item.id)+'"><div><strong>'+escapeHtml(item.name||'매장')+'</strong><span>'+escapeHtml(item.category||'기타')+(Number.isFinite(d)?' · '+formatDistance(d):'')+'</span>'+benefitContextBadgesHtml(item,{compact:true})+'</div><span>보기</span></div>';}).join(''); qsa('[data-map-benefit-id]').forEach(card=>{card.addEventListener('click',()=>{const item=state.benefits.find(b=>b.id===card.dataset.mapBenefitId); if(item)openDetail(item);});});}
 async function renderMapMode({ fitBounds=false } = {}){if(state.view!=='map')return; const countEl=qs('#mapModeCount'), mapEl=qs('#benefitMap'); if(!mapEl)return; const items=getMapModeItems(); if(countEl)countEl.textContent=items.length+'건'; renderMapPlaceList(items); if(!items.length){benefitMapExpandedClusterKey=''; setMapModeStatus('좌표가 등록된 혜택이 없습니다. 관리자 페이지에서 주소→좌표 자동 조회 후 저장해 주세요.','muted');return;} if(!NAVER_MAP_CLIENT_ID){setMapModeStatus('NAVER_MAP_CLIENT_ID를 입력하면 지도 모드를 사용할 수 있습니다.','error');return;} setMapModeStatus('지도를 준비하는 중입니다...','muted'); try{await loadNaverMapsSdk(); const nm=window.naver.maps; const first=getBenefitLatLng(items[0]); const center=state.userLocation?new nm.LatLng(state.userLocation.lat,state.userLocation.lng):new nm.LatLng(first.lat,first.lng); if(!benefitMapInstance){benefitMapInstance=new nm.Map('benefitMap',{center,zoom:15,minZoom:10,zoomControl:true,zoomControlOptions:{position:nm.Position.TOP_RIGHT}}); nm.Event.addListener(benefitMapInstance,'idle',()=>renderMapMarkers(false)); nm.Event.addListener(benefitMapInstance,'click',()=>{if(benefitMapExpandedClusterKey){benefitMapExpandedClusterKey=''; renderMapMarkers(false); setMapModeStatus('지도에 여러 매장을 표시했습니다. 가까운 매장은 숫자 묶음으로 표시됩니다.','muted');}});}else{benefitMapInstance.setCenter(center);} renderMapMarkers(fitBounds); setMapModeStatus('지도에 여러 매장을 표시했습니다. 가까운 매장은 숫자 묶음으로 표시됩니다.','muted');}catch(e){console.error('지도 모드 렌더링 실패',e); setMapModeStatus('지도 로딩에 실패했습니다. Client ID와 네이버 콘솔 Web 서비스 URL을 확인해 주세요.','error');}}
 function renderMapMarkers(fitBounds=false){if(!benefitMapInstance||!window.naver?.maps)return; const nm=window.naver.maps; const items=getMapModeItems(); clearNaverMarkers(); const bounds=new nm.LatLngBounds(); const fitPoints=[]; const zoom=benefitMapInstance.getZoom?Number(benefitMapInstance.getZoom()||15):15; const autoSpreadZoom=zoom>=17; if(state.userLocation){const userPos=new nm.LatLng(state.userLocation.lat,state.userLocation.lng); fitPoints.push(userPos); bounds.extend(userPos); benefitMapUserMarker=new nm.Marker({position:userPos,map:benefitMapInstance,icon:{content:'<div class="map-marker-user" title="현재 위치"></div>',anchor:new nm.Point(9,9)},zIndex:200});} const clusters=clusterMapItems(items,zoom); const hasExpandedCluster=clusters.some(c=>getSamePositionClusterKey(c.items)===benefitMapExpandedClusterKey); if(benefitMapExpandedClusterKey&&!hasExpandedCluster) benefitMapExpandedClusterKey=''; clusters.forEach(c=>{const position=new nm.LatLng(c.lat,c.lng); fitPoints.push(position); bounds.extend(position); const samePositionKey=getSamePositionClusterKey(c.items); if(c.items.length>1 && (autoSpreadZoom || (samePositionKey&&benefitMapExpandedClusterKey===samePositionKey))){renderSpreadClusterMarkers(nm,c); return;} const marker=new nm.Marker({position,map:benefitMapInstance,icon:{content:c.items.length>1?clusterHtml(c.items.length):markerHtmlForItem(c.items[0]),anchor:new nm.Point(c.items.length>1?22:18,c.items.length>1?22:34)},zIndex:c.items.length>1?120:100}); nm.Event.addListener(marker,'click',()=>{if(c.items.length>1){benefitMapExpandedClusterKey=samePositionKey||''; benefitMapInstance.setCenter(position); benefitMapInstance.setZoom(Math.max(17, Math.min(19, Number(benefitMapInstance.getZoom()||15)+1))); renderMapMarkers(false); setMapModeStatus('확대된 지도에서는 모든 클러스터가 실제 거리와 방향을 기준으로 자동으로 펼쳐집니다.','muted');}else openDetail(c.items[0]);}); benefitMapMarkers.push(marker);}); if(fitBounds&&fitPoints.length){if(fitPoints.length===1){benefitMapInstance.setCenter(fitPoints[0]); benefitMapInstance.setZoom(16);}else{try{benefitMapInstance.fitBounds(bounds,{top:50,right:36,bottom:50,left:36});}catch(_){benefitMapInstance.fitBounds(bounds);}}}}
 async function centerMapToMyLocation(){try{setMapModeStatus('현재 위치를 확인하는 중입니다...','muted'); await getReliableCurrentPosition({forceRefresh:false}); recalculateBenefitDistances(); if(benefitMapInstance&&state.userLocation&&window.naver?.maps){benefitMapInstance.setCenter(new window.naver.maps.LatLng(state.userLocation.lat,state.userLocation.lng)); benefitMapInstance.setZoom(15);} renderAll(); setTimeout(()=>renderMapMode({fitBounds:true}),60);}catch(e){console.warn('지도 현재 위치 확인 실패',e); setMapModeStatus('현재 위치 권한을 허용하면 내 주변 혜택을 지도에서 볼 수 있습니다.','error');}}
 
 function ensureDetailMiniMapZoomControls(mapEl, mapInstance){
  try{
   const box=mapEl?.closest?.('.detail-map-box');
   if(!box || !mapInstance) return;
   box.querySelectorAll('.detail-mini-zoom-controls').forEach((el)=>el.remove());
   const controls=document.createElement('div');
   controls.className='detail-mini-zoom-controls';
   controls.setAttribute('aria-label','미니지도 확대 축소');
   controls.innerHTML=`
<button type="button" class="detail-mini-zoom-btn" data-zoom-delta="1" aria-label="지도 확대"><span>+</span></button>
<button type="button" class="detail-mini-zoom-btn" data-zoom-delta="-1" aria-label="지도 축소"><span>−</span></button>
`;
   controls.addEventListener('click',(event)=>{
    const btn=event.target.closest('[data-zoom-delta]');
    if(!btn) return;
    event.preventDefault();
    event.stopPropagation();
    const delta=Number(btn.dataset.zoomDelta||0);
    const current=Number(mapInstance.getZoom?.()||16);
    const min=Number(mapInstance.getMinZoom?.()||6);
    const max=Number(mapInstance.getMaxZoom?.()||21);
    const next=Math.max(min, Math.min(max, current + delta));
    if(typeof mapInstance.setZoom==='function') mapInstance.setZoom(next);
   });
   // Naver 지도 위에 올린 버튼이 PC에서 드래그/휠 이벤트를 지도에 넘기지 않도록 차단합니다.
   ['mousedown','mouseup','click','dblclick','touchstart','touchend','wheel'].forEach((type)=>{
    controls.addEventListener(type,(event)=>event.stopPropagation(), { passive:false });
   });
   box.appendChild(controls);
  }catch(error){
   console.warn('미니지도 확대/축소 컨트롤 생성 실패', error);
  }
 }

 async function renderDetailMiniMap(item={}){
 const mapEl=qs('#detailNaverMap');
 const pos=getBenefitLatLng(item);
 if(!mapEl||!pos)return;
 const itemId=String(item.id||item.name||pos.lat+','+pos.lng);
 renderDetailMiniMap._seq=(renderDetailMiniMap._seq||0)+1;
 const seq=renderDetailMiniMap._seq;

 if(!NAVER_MAP_CLIENT_ID){
  mapEl.innerHTML='<div class="detail-map-empty">NAVER_MAP_CLIENT_ID를 입력하면 지도가 표시됩니다.</div>';
  return;
 }

 // 같은 상세 모달에서 중복 호출될 때 네이버 지도가 한 번 더 그려져 아래 영역을 밀어내는 현상을 방지합니다.
 if(mapEl.dataset.rendered==='stable' && mapEl.dataset.benefitId===itemId && detailMapInstance && window.naver?.maps){
  try{
   window.naver.maps.Event.trigger(detailMapInstance,'resize');
   const center=new window.naver.maps.LatLng(pos.lat,pos.lng);
   if(!hasFreshUserLocation()) detailMapInstance.setCenter(center);
  }catch(_){ }
  return;
 }

 mapEl.dataset.benefitId=itemId;
 mapEl.dataset.rendered='rendering';
 mapEl.innerHTML='';
 const box=mapEl.closest('.detail-map-box');
 box?.classList.add('is-loading');
 box?.classList.remove('is-ready');

 try{
  await loadNaverMapsSdk();
  if(seq!==renderDetailMiniMap._seq || !qs('#detailNaverMap') || qs('#detailNaverMap')!==mapEl)return;
  const nm=window.naver.maps;
  const store=new nm.LatLng(pos.lat,pos.lng);
  detailMapInstance=new nm.Map(mapEl,{
   center:store,
   zoom:16,
   // 네이버 기본 확대/축소 컨트롤은 미니지도 우측에서 잘리는 경우가 있어
   // 커스텀 컨트롤을 지도 박스 안쪽에 따로 올립니다.
   zoomControl:false,
   scrollWheel:true,
   draggable:true,
   pinchZoom:true
  });
  ensureDetailMiniMapZoomControls(mapEl, detailMapInstance);
  new nm.Marker({position:store,map:detailMapInstance,icon:{content:markerHtmlForItem(item),anchor:new nm.Point(20,34)},zIndex:100});
  let bounds=null;
  if(hasFreshUserLocation()){
   const me=new nm.LatLng(state.userLocation.lat,state.userLocation.lng);
   bounds=new nm.LatLngBounds();
   bounds.extend(store);
   bounds.extend(me);
   new nm.Marker({position:me,map:detailMapInstance,icon:{content:'<div class="map-marker-user" title="현재 위치"></div>',anchor:new nm.Point(9,9)},zIndex:120});
   new nm.Polyline({map:detailMapInstance,path:[me,store],strokeColor:'#2563eb',strokeWeight:4,strokeOpacity:.82});
   try{detailMapInstance.fitBounds(bounds,{top:42,right:42,bottom:42,left:42});}catch(_){detailMapInstance.fitBounds(bounds);}
  }else{
   // 위치 권한 확인은 뒤에서 조용히 갱신하되, 이미 그린 지도는 다시 중복 생성하지 않습니다.
   getReliableCurrentPosition({forceRefresh:false})
    .then(()=>{ mapEl.dataset.rendered=''; renderDetailMiniMap(item); })
    .catch(()=>{});
  }
  const resize=()=>{
   try{nm.Event.trigger(detailMapInstance,'resize');}catch(_){ }
   try{ if(bounds) detailMapInstance.fitBounds(bounds,{top:42,right:42,bottom:42,left:42}); else detailMapInstance.setCenter(store); }catch(_){ }
  };
  resize();
  requestAnimationFrame(resize);
  setTimeout(resize,120);
  setTimeout(resize,360);
  mapEl.dataset.rendered='stable';
  box?.classList.remove('is-loading');
  box?.classList.add('is-ready');
 }catch(e){
  console.warn('상세 미니 지도 렌더링 실패',e);
  if(qs('#detailNaverMap')===mapEl){
   mapEl.dataset.rendered='';
   mapEl.innerHTML='<div class="detail-map-empty">지도 로딩에 실패했습니다.</div>';
   box?.classList.remove('is-loading');
  }
 }
}

 const CATEGORY_ICONS = {
 '전체':'/icons/internal/all-menu.svg',
 '음식':'/icons/internal/benefit.svg',
 '카페':'/icons/internal/benefit.svg',
 '주점':'/icons/internal/benefit.svg',
 '치킨':'/icons/internal/benefit.svg',
 '피부관리':'/icons/internal/benefit.svg',
 '미용':'/icons/internal/benefit.svg',
 '베이커리':'/icons/internal/benefit.svg',
 '디저트':'/icons/internal/benefit.svg',
 '중식당':'/icons/internal/benefit.svg',
 '중식주점':'/icons/internal/benefit.svg',
 '운동':'/icons/internal/walk.svg',
 '기타':'/icons/internal/pin.svg'
 };
  const normalizeCategory = (value) => String(value || '').trim().replace(/\s+/g, '').replace(/[ㆍ·]/g, '').toLowerCase();

 const getCategoryIcon = (category) => { const src = CATEGORY_ICONS[normalizeCategory(category)] || '/icons/internal/pin.svg'; return `<img class="upick-svg-icon category-svg-icon" src="${src}" alt="" loading="lazy">`; };

 const STORE_STATUS_META={preparing:{label:'영업 준비 중',cls:'status-store-preparing'},active:{label:'정상 영업',cls:'status-store-active'},paused:{label:'휴업',cls:'status-store-paused'},closed:{label:'영업 종료',cls:'status-store-closed'},shutdown:{label:'폐점',cls:'status-store-shutdown'},reopened:{label:'재영업',cls:'status-store-reopened'},hidden:{label:'숨김',cls:'status-store-closed'}};
 const BENEFIT_STATUS_META={preparing:{label:'혜택 준비 중',cls:'status-benefit-preparing'},active:{label:'혜택 진행 중',cls:'status-benefit-active'},ended:{label:'혜택 종료',cls:'status-benefit-ended'},none:{label:'혜택 없음',cls:'status-benefit-none'},resumed:{label:'혜택 재개',cls:'status-benefit-resumed'}};
 function normalizeBenefitStoreStatus(item={}){const raw=String(item.storeStatus||item.operationStatus||item.status||'').toLowerCase();if(['preparing','active','paused','closed','shutdown','reopened','hidden'].includes(raw))return raw;if(item.closed===true)return 'shutdown';if(item.visible===false)return 'hidden';return 'active';}
 function normalizeResidentBenefitStatus(item={}){const raw=String(item.benefitStatus||item.residentBenefitStatus||item.discountStatus||'').toLowerCase();if(['preparing','active','ended','none','resumed'].includes(raw))return raw;return 'active';}
 function getBenefitDateValue(item={},type='end'){
 const keys = type === 'start' ? ['benefitStartedAt','benefitStartDate','discountStartedAt','discountStartDate','startDate'] : ['benefitEndedAt','benefitEndDate','discountEndedAt','discountEndDate','endDate'];
 for(const key of keys){ const value=item?.[key]; if(value) return String(value).trim(); }
 return '';
 }
 function parseBenefitLocalDate(value){
 const raw=String(value||'').trim();
 if(!raw) return null;
 const match=raw.match(/^(\d{4})[-.\/](\d{1,2})[-.\/](\d{1,2})/);
 if(!match) return null;
 const d=new Date(Number(match[1]),Number(match[2])-1,Number(match[3]));
 return Number.isNaN(d.getTime())?null:d;
 }
 function getTodayLocalDate(){ const d=new Date(); d.setHours(0,0,0,0); return d; }
 function getBenefitDateDiffDays(targetDate){
 const target=parseBenefitLocalDate(targetDate);
 if(!target) return null;
 target.setHours(0,0,0,0);
 return Math.round((target.getTime()-getTodayLocalDate().getTime())/86400000);
 }
 function getBenefitEndDateStatus(item={}){
 const endDate=getBenefitDateValue(item,'end');
 const daysLeft=getBenefitDateDiffDays(endDate);
 if(daysLeft===null) return null;
 if(daysLeft<0) return {key:'ended',label:'혜택 종료',className:'ended',daysLeft,endDate};
 if(daysLeft===0) return {key:'today',label:'금일 혜택 종료',className:'today',daysLeft,endDate};
 if(daysLeft<=3) return {key:'urgent',label:'혜택 종료 임박',className:'urgent',daysLeft,endDate};
 if(daysLeft<=7) return {key:'soon',label:'혜택 종료 예정',className:'soon',daysLeft,endDate};
 return null;
 }
 function isBenefitDateActive(item={}){
 const startDate=getBenefitDateValue(item,'start');
 const endDate=getBenefitDateValue(item,'end');
 const startDiff=getBenefitDateDiffDays(startDate);
 const endDiff=getBenefitDateDiffDays(endDate);
 if(startDiff!==null && startDiff>0) return false;
 if(endDiff!==null && endDiff<0) return false;
 return true;
 }
 function benefitEndBadgeHtml(item={},scope='card'){
 const status=getBenefitEndDateStatus(item);
 if(!status || status.key==='ended') return '';
 const safeScope=String(scope||'card').replace(/[^a-z0-9_-]/gi,'').toLowerCase() || 'card';
 return `<div class="benefit-end-badge ${status.className} benefit-date-scope-${safeScope}" title="${escapeHtml(status.endDate)} 기준">${escapeHtml(status.label)}</div>`;
 }
 function benefitNewBadgeHtml(item={},scope='card'){
 if(!isRecentItem(item,7)) return '';
 const safeScope=String(scope||'card').replace(/[^a-z0-9_-]/gi,'').toLowerCase() || 'card';
 return `<div class="benefit-end-badge new benefit-date-scope-${safeScope}" title="등록일 기준 7일 동안 표시됩니다">새로운 혜택 매장</div>`;
 }
 function benefitCardRibbonBadgeHtml(item={},scope='card'){
 return benefitEndBadgeHtml(item,scope) || benefitNewBadgeHtml(item,scope);
 }
 function formatBenefitEndDateLabel(value){
 const raw=String(value||'').trim();
 if(!raw) return '';
 const match=raw.match(/^(\d{4})[-.\/](\d{1,2})[-.\/](\d{1,2})/);
 if(!match) return raw;
 const y=match[1];
 const m=String(Number(match[2])).padStart(2,'0');
 const d=String(Number(match[3])).padStart(2,'0');
 return `${y}.${m}.${d}`;
 }
 function benefitEndStatusChipHtml(item={}, options={}){
 const status=getBenefitEndDateStatus(item);
 if(!status || status.key==='ended') return '';
 const compact=!!options.compact;
 if(compact) return '';
 const endDateLabel=formatBenefitEndDateLabel(status.endDate);
 const chipLabel=endDateLabel?`${status.label} · 종료일 ${endDateLabel}`:status.label;
 const chipTitle=endDateLabel?`${status.label} · ${endDateLabel} 기준`:`${status.label}`;
 return `<div class="benefit-status-row benefit-date-status-row"><span class="status-chip benefit-date-status-chip status-benefit-date-${status.className}" title="${escapeHtml(chipTitle)}" aria-label="${escapeHtml(chipLabel)}">${escapeHtml(chipLabel)}</span></div>`;
 }
 function isStaleBenefitEndReason(text=''){
 const raw=String(text||'').trim();
 if(!raw) return false;
 return /혜택\s*(기간\s*)?종료|종료일\s*경과|기간\s*만료|혜택\s*만료/.test(raw);
 }
 function isPubliclyVisibleBenefit(item={}){return item.visible!==false && normalizeBenefitStoreStatus(item)!=='hidden' && isBenefitDateActive(item);}
 function isRecommendableBenefit(item={}){const store=normalizeBenefitStoreStatus(item);const benefit=normalizeResidentBenefitStatus(item);return isPubliclyVisibleBenefit(item) && ['active','reopened'].includes(store) && ['active','resumed'].includes(benefit);}
 function benefitStatusChipsHtml(item={}, options={}){const compact=!!options.compact;const includeDate=!!options.includeDate;const storeKey=normalizeBenefitStoreStatus(item);const benefitKey=normalizeResidentBenefitStatus(item);const store=STORE_STATUS_META[storeKey]||STORE_STATUS_META.active;const benefit=BENEFIT_STATUS_META[benefitKey]||BENEFIT_STATUS_META.active;const storeText=compact?'':store.label;const benefitText=compact?'':benefit.label;const storeTitle=escapeHtml(store.label);const benefitTitle=escapeHtml(benefit.label);const dateChip=includeDate?benefitEndStatusChipHtml(item,{compact}):'';return `<div class="benefit-status-group"><div class="benefit-status-row"><span class="status-chip ${store.cls}${compact?` compact-status compact-store-${storeKey}`:''}" title="${storeTitle}" aria-label="${storeTitle}">${storeText}</span><span class="status-chip ${benefit.cls}${compact?` compact-status compact-benefit-${benefitKey}`:''}" title="${benefitTitle}" aria-label="${benefitTitle}">${benefitText}</span></div>${dateChip}</div>`;}
 function benefitStatusReasonHtml(item={}){const lines=[];const store=normalizeBenefitStoreStatus(item);const benefit=normalizeResidentBenefitStatus(item);if(item.storeStatusReason)lines.push(item.storeStatusReason);if(benefit==='ended'&&item.benefitEndedAt)lines.push(`${item.benefitEndedAt} 혜택 종료`);const reason=String(item.benefitStatusReason||'').trim();if(reason && (benefit==='ended' || !isStaleBenefitEndReason(reason)))lines.push(reason);return lines.length?`<div class="status-reason-line">${escapeHtml(lines.join(' · '))}</div>`:'';}
 function benefitCardStatusClass(item={}){const store=normalizeBenefitStoreStatus(item);const benefit=normalizeResidentBenefitStatus(item);if(store==='shutdown')return 'status-shutdown status-muted';if(['paused','closed'].includes(store)||['ended','none'].includes(benefit))return 'status-muted';return '';}

 function sanitizeBenefit(item={},id=''){
 const latRaw = item.lat ?? item.latitude ?? item.storeLat ?? item.location?.lat ?? item.location?.latitude ?? '';
 const lngRaw = item.lng ?? item.lon ?? item.longitude ?? item.storeLng ?? item.location?.lng ?? item.location?.lon ?? item.location?.longitude ?? '';
 const lat = Number(latRaw);
 const lng = Number(lngRaw);
 return {
 id,
 name:item.name||'',
 category:normalizeCategory(item.category||'기타'),
 discountValue:Number(item.discountValue||0),
 discountText:item.discountText||`${Number(item.discountValue||0)}%`,
 condition:item.condition||'',
 priceDetails:item.priceDetails||item.priceInfo||item.servicePriceText||item.servicePriceDetails||'',
 address:getBenefitDisplayAddress(item)||'',
 zipcode:item.zipcode||item.addressParts?.zipcode||'',
 roadAddress:item.roadAddress||item.addressParts?.road||'',
 jibunAddress:item.jibunAddress||item.addressParts?.jibun||'',
 detailAddress:item.detailAddress||item.addressParts?.detail||'',
 displayAddress:item.displayAddress||item.addressParts?.display||'',
 stations:getBenefitStations(item),
stationAccessText:item.stationAccessText||item.transitText||item.stationGuide||item.nearStationText||'',
 phone:item.phone||item.contact?.phone||'',
 emergencyPhone:item.emergencyPhone||item.contact?.emergency||'',
 contact:item.contact||{},
 url:item.url||'',
 imageUrl:item.imageUrl||item.thumbnailUrl||item.thumbnail||item.photoUrl||item.image||'',
 thumbnailUrl:item.thumbnailUrl||item.imageUrl||item.thumbnail||item.photoUrl||item.image||'',
 // 혜택 상세 전용 다중 사진 필드는 대표 썸네일과 분리해서 공개앱까지 그대로 전달합니다.
 // 대표사진(imageUrl/thumbnailUrl)은 카카오 공유/목록 썸네일에 계속 사용하고,
 // 아래 배열/문자열 필드는 혜택 상세 슬라이드에만 사용됩니다.
 detailImages:item.detailImages||item.detailImageUrls||item.detailImageUrl||item.detailPhotoUrls||item.detailPhotoUrl||item.benefitDetailImages||item.galleryImages||item.galleryImageUrls||item.additionalImages||item.extraImages||[],
 detailImageUrls:item.detailImageUrls||item.detailImages||item.detailImageUrl||item.detailPhotoUrls||item.detailPhotoUrl||item.benefitDetailImages||item.galleryImages||item.galleryImageUrls||item.additionalImages||item.extraImages||[],
 benefitDetailImages:item.benefitDetailImages||item.detailImages||item.detailImageUrls||item.detailImageUrl||[],
 galleryImages:item.galleryImages||item.galleryImageUrls||[],
 galleryImageUrls:item.galleryImageUrls||item.galleryImages||[],
 additionalImages:item.additionalImages||[],
 extraImages:item.extraImages||[],
 homepageUrl:item.homepageUrl||item.externalLinks?.homepage||'',
 blogUrl:item.blogUrl||item.externalLinks?.blog||'',
 instagramUrl:item.instagramUrl||item.externalLinks?.instagram||'',
 youtubeUrl:item.youtubeUrl||item.externalLinks?.youtube||'',
 facebookUrl:item.facebookUrl||item.externalLinks?.facebook||'',
 smartstoreUrl:item.smartstoreUrl||item.externalLinks?.smartstore||item.externalLinks?.smartStore||'',
 bandUrl:item.bandUrl||item.externalLinks?.band||'',
 naverReservationEnabled:!!(item.naverReservationEnabled||item.naverBookingEnabled||item.reservationEnabled||item.reservation?.enabled||item.naverReservationUrl||item.naverBookingUrl||item.reservationUrl||item.reservation?.url),
 naverBookingEnabled:!!(item.naverReservationEnabled||item.naverBookingEnabled||item.reservationEnabled||item.reservation?.enabled||item.naverReservationUrl||item.naverBookingUrl||item.reservationUrl||item.reservation?.url),
 reservationEnabled:!!(item.naverReservationEnabled||item.naverBookingEnabled||item.reservationEnabled||item.reservation?.enabled||item.naverReservationUrl||item.naverBookingUrl||item.reservationUrl||item.reservation?.url),
 naverReservationUrl:item.naverReservationUrl||item.naverBookingUrl||item.reservationUrl||item.reservation?.url||item.externalLinks?.naverReservation||'',
 naverBookingUrl:item.naverBookingUrl||item.naverReservationUrl||item.reservationUrl||item.reservation?.url||item.externalLinks?.naverReservation||'',
 reservationUrl:item.reservationUrl||item.naverReservationUrl||item.naverBookingUrl||item.reservation?.url||item.externalLinks?.naverReservation||'',
 reservation:item.reservation||{},
 deliveryAvailable:!!(item.deliveryAvailable||item.serviceTags?.delivery),
 takeoutAvailable:!!(item.takeoutAvailable||item.serviceTags?.takeout),
 // 관리자에 등록된 요일별 영업시간/휴무/브레이크타임/라스트오더를 공개앱에서도 그대로 사용합니다.
 openingHoursManual:item.openingHoursManual||item.openingHours||item.businessHours||null,
 openingHours:item.openingHoursManual||item.openingHours||item.businessHours||null,
 businessHours:item.businessHours||item.openingHoursManual||item.openingHours||null,
 businessHoursManual:item.businessHoursManual||item.manualBusinessHours||item.adminBusinessHours||item.adminHoursText||'',
 manualBusinessHours:item.manualBusinessHours||item.businessHoursManual||item.adminBusinessHours||item.adminHoursText||'',
 todayOpenText:item.todayOpenText||item.hoursText||item.openHoursText||item.businessHoursManual||item.manualBusinessHours||item.adminBusinessHours||item.adminHoursText||'',
 openStatusText:item.openStatusText||'',
 breakStart:item.breakStart||'',
 breakEnd:item.breakEnd||'',
 lastOrder:item.lastOrder||'',
 serviceMemo:item.serviceMemo||item.serviceTags?.memo||'',
 directionText:item.directionText||item.directionGuide||item.locationGuide||item.guideText||'',
 externalLinks:item.externalLinks||{},
 serviceTags:item.serviceTags||{},
 supportProgramItems:item.supportProgramItems||item.supportPrograms?.items||item.governmentSupportItems||item.supportProgramRows||[],
 supportPrograms:item.supportPrograms||item.supportProgram||item.governmentSupport||item.supportProgramNames||item.supportProgramList||null,
 supportProgramsText:item.supportProgramsText||'',
 supportProgramStartedAt:item.supportProgramStartedAt||item.supportProgramStartDate||item.governmentSupportStartedAt||item.governmentSupportStartDate||'',
 supportProgramStartDate:item.supportProgramStartDate||item.supportProgramStartedAt||item.governmentSupportStartedAt||item.governmentSupportStartDate||'',
 supportProgramEndedAt:item.supportProgramEndedAt||item.supportProgramEndDate||item.governmentSupportEndedAt||item.governmentSupportEndDate||'',
 supportProgramEndDate:item.supportProgramEndDate||item.supportProgramEndedAt||item.governmentSupportEndedAt||item.governmentSupportEndDate||'',
 couponLinks:item.couponLinks||item.coupons||item.couponList||item.couponUrls||[],
 newsItems:item.newsItems||item.news||item.storeNews||item.noticeLinks||[],
 lat:Number.isFinite(lat)?lat:null,
 lng:Number.isFinite(lng)?lng:null,
 service:!!item.service||String(item.discountText).trim()==='서비스',
 visible:item.visible!==false,
 storeStatus:normalizeBenefitStoreStatus(item),
 benefitStatus:normalizeResidentBenefitStatus(item),
 storeStatusReason:item.storeStatusReason||item.closedReason||item.closedMemo||item.closeReason||item.closeMemo||'',
 benefitStatusReason:item.benefitStatusReason||item.statusReason||item.discountStatusReason||'',
 benefitStartedAt:item.benefitStartedAt||item.benefitStartDate||item.discountStartedAt||item.discountStartDate||'',
 benefitStartDate:item.benefitStartDate||item.benefitStartedAt||item.discountStartedAt||item.discountStartDate||'',
 benefitEndedAt:item.benefitEndedAt||item.discountEndedAt||item.benefitEndDate||'',
 benefitEndDate:item.benefitEndDate||item.benefitEndedAt||item.discountEndedAt||'',
 closedAt:item.closedAt||item.closedDate||item.closedConfirmedAt||'',
 closed:!!item.closed,
 recommended:!!item.recommended,
 badgeUp:!!item.badgeUp,
 badgeDeprecated:!!item.badgeDeprecated,
 createdAt:item.createdAt||null,
 updatedAt:item.updatedAt||null
 };
 }
 const getFavorites=()=>state.favoriteIds || [];

 function getFavoritesCollectionRef(){
 if(!state.currentUser?.uid) return null;
 return collection(db, 'users', state.currentUser.uid, 'favorites');
 }

 function restoreFavoriteButtonFocus(id){
 if(!id) return;
 const selector = `.fav-icon-btn[data-favorite-id="${CSS.escape(id)}"], .fav-iconbtn[data-favorite-id="${CSS.escape(id)}"], .fav-btn[data-favorite-id="${CSS.escape(id)}"]`;
 const restore = () => {
 const btn = document.querySelector(selector);
 if(btn && typeof btn.focus === 'function') btn.focus({preventScroll:true});
 };
 requestAnimationFrame(restore);
 setTimeout(restore, 80);
 setTimeout(restore, 220);
 }


 function isDetailModalForBenefitOpen(id){
 const modal = qs('#detailModal');
 return !!(id && modal && isLayerOpenLike(modal) && String(modal.dataset.benefitId || '') === String(id));
 }

 function syncFavoriteButtonsForId(id){
 if(!id) return;
 const isFavorite = getFavorites().includes(id);
 const icon = `/icons/internal/${isFavorite ? 'star-fill' : 'star-outline'}.svg`;
 document.querySelectorAll(`[data-favorite-id="${CSS.escape(id)}"], #modalFavBtn`).forEach((btn) => {
   try{
     if(btn.id === 'modalFavBtn' || btn.classList.contains('fav-icon-btn') || btn.classList.contains('fav-iconbtn') || btn.classList.contains('fav-btn')){
       const img = btn.querySelector('img');
       if(img) img.setAttribute('src', icon);
       else if(btn.id === 'modalFavBtn') btn.innerHTML = `<img class="upick-svg-icon" src="${icon}" alt="" loading="lazy" decoding="async">`;
       btn.classList.toggle('is-favorite', isFavorite);
       btn.setAttribute('aria-pressed', isFavorite ? 'true' : 'false');
       btn.setAttribute('aria-label', isFavorite ? '즐겨찾기 해제' : '즐겨찾기 추가');
       btn.title = isFavorite ? '즐겨찾기 해제' : '즐겨찾기 추가';
     }
   }catch(_){ }
 });
 }

 function subscribeFavorites(){
 const favoritesRef = getFavoritesCollectionRef();
 if(!favoritesRef) return;
 onSnapshot(favoritesRef, (snapshot) => {
 const activeFavoriteId = document.activeElement?.dataset?.favoriteId || '';
 const detailModal = qs('#detailModal');
 const openDetailId = detailModal && isLayerOpenLike(detailModal) ? String(detailModal.dataset.benefitId || '') : '';
 state.favoriteIds = snapshot.docs.map((d) => d.id);

 // v95: 혜택 상세가 열린 상태에서는 즐겨찾기 snapshot으로 전체 목록을 다시 그리지 않습니다.
 // 즐겨찾기 탭에서 해제 시 목록 카드가 사라지며 상세 팝업까지 닫히거나 혜택 탭으로 이동하는 현상을 방지합니다.
 if(openDetailId){
   syncFavoriteButtonsForId(openDetailId);
   window.__upickFavoriteRenderPending = true;
   if(activeFavoriteId) restoreFavoriteButtonFocus(activeFavoriteId);
   return;
 }

 renderAll();
 if(activeFavoriteId) restoreFavoriteButtonFocus(activeFavoriteId);
 }, (error) => {
 console.error('즐겨찾기 로드 실패', error);
 });
 }

 async function toggleFavorite(id, name){
 if(!state.currentUser?.uid || !id) return false;
 const favoriteRef = doc(db, 'users', state.currentUser.uid, 'favorites', id);
 const set = new Set(getFavorites());
 const isAdding = !set.has(id);

 try{
 if(isAdding){
 await setDoc(favoriteRef, {
 benefitId: id,
 name: name || '',
 createdAt: serverTimestamp()
 }, { merge:true });
 set.add(id);
 increaseStat(id, name, 'favoriteCount');
 logBenefitEvent(id, 'favorite');
 }else{
 await deleteDoc(favoriteRef);
 set.delete(id);
 }

 state.favoriteIds = Array.from(set);
 if(isDetailModalForBenefitOpen(id)){
   syncFavoriteButtonsForId(id);
 }else{
   renderAll();
 }
 restoreFavoriteButtonFocus(id);
 return isAdding;
 }catch(error){
 console.error('즐겨찾기 저장 실패', id, error);
 await openModalAlert('즐겨찾기 처리 중 오류가 발생했습니다.');
 return set.has(id);
 }
 }
 const hasFirebaseConfig=()=>firebaseConfig.apiKey&&firebaseConfig.projectId&&firebaseConfig.appId;
 function subscribeBenefits(){
 const benefitsQuery = query(collection(db, BENEFITS_COLLECTION), where('visible', '==', true));
 onSnapshot(benefitsQuery, (snapshot) => {
 state.benefits = snapshot.docs.map(d => sanitizeBenefit(d.data(), d.id));
 if(state.userLocation) recalculateBenefitDistances();
 state.loading = false;
 const activeDetailModal = qs('#detailModal');
 const shouldPreserveOpenDetail = !!(activeDetailModal && isLayerOpenLike(activeDetailModal) && activeDetailModal.dataset.benefitId);
 if(shouldPreserveOpenDetail){
   // 혜택 상세가 열린 상태에서 즐겨찾기/조회수 등의 Firestore snapshot이 들어오면
   // 전체 목록을 다시 그리면서 모달이 흔들리거나 닫히는 현상이 발생할 수 있어
   // 상세 모달은 그대로 유지하고, 헤더 버튼 상태만 동기화합니다.
   try{ syncFavoriteButtonsForId(activeDetailModal.dataset.benefitId); }catch(_){}
 }else{
   renderAll();
   handleCleanDeepLink();
 }
 markInitialDataLoaded('benefits');
 setTimeout(prepareInitialBenefitDistances, 300);
 }, () => {
 state.loading = false;
 qs('#homeLoading').textContent = '정보를 불러오지 못했습니다. Firestore 규칙과 설정을 확인해 주세요.';
 renderAll();
 markInitialDataLoaded('benefits');
 });
 }
 function formatDateTime(value){
 try{
 if(value?.toDate) return value.toDate().toLocaleDateString('ko-KR');
 }catch(error){}
 return '';
 }

 function sanitizeNotice(item={}, id=''){
 return {
 id,
 title: String(item.title || '').trim(),
 content: String(item.content || '').trim(),
 category: String(item.category || '일반').trim(),
 pinned: !!item.pinned,
 visible: item.visible !== false,
 createdAt: item.createdAt || null,
 updatedAt: item.updatedAt || null,
 imageUrl: item.imageUrl || item.thumbnailUrl || item.thumbnail || item.photoUrl || item.image || ''
 };
 }

 let mobileEdgeNoticeToastReady = false;
 let mobileEdgeNoticeToastStartedAt = Date.now();
 const MOBILE_EDGE_NOTICE_TOAST_SESSION_PREFIX = `myhills_mobile_edge_notice_toast_${ENV || 'prod'}_`;

 function getNoticeTimeMillisForToast(data = {}) {
 const value = data.updatedAt || data.createdAt || null;
 if(!value) return 0;
 if(value?.toMillis) return value.toMillis();
 if(value?.seconds) return Number(value.seconds) * 1000;
 if(value instanceof Date) return value.getTime();
 const parsed = Date.parse(String(value));
 return Number.isFinite(parsed) ? parsed : 0;
 }

 function isNoticePushLike(data = {}) {
 return data.pushEnabled === true || data.autoPush === true || data.sendPush === true;
 }

 function getMobileEdgeNoticeToastSeenKey(noticeId = '') {
 const uid = state.currentUser?.uid || 'guest';
 return `${MOBILE_EDGE_NOTICE_TOAST_SESSION_PREFIX}${uid}_${noticeId}`;
 }

 function handleMobileEdgeNoticeToastFallback(snapshot) {
 if(!shouldUseMobileEdgeInAppFallback()) return;
 if(!snapshot) return;

 if(!mobileEdgeNoticeToastReady){
 mobileEdgeNoticeToastReady = true;
 mobileEdgeNoticeToastStartedAt = Date.now();
 return;
 }

 snapshot.docChanges().forEach((change) => {
 if(change.type !== 'added') return;
 const raw = change.doc.data() || {};
 const noticeId = change.doc.id;
 if(raw.visible === false) return;
 if(!isNoticePushLike(raw)) return;

 const createdAtMillis = getNoticeTimeMillisForToast(raw);
 if(createdAtMillis && createdAtMillis < mobileEdgeNoticeToastStartedAt - 5000) return;

 const seenKey = getMobileEdgeNoticeToastSeenKey(noticeId);
 try{
 if(sessionStorage.getItem(seenKey) === '1') return;
 sessionStorage.setItem(seenKey, '1');
 }catch(_){}

 const title = String(raw.pushTitle || raw.title || '새 공지가 등록되었습니다').trim() || '새 공지가 등록되었습니다';
 const bodySource = String(raw.pushBody || raw.summary || raw.content || raw.title || '공지사항을 확인해 주세요.').trim();
 const body = bodySource.length > 90 ? `${bodySource.slice(0, 90)}…` : bodySource;
 const url = `/app?open=notice&id=${encodeURIComponent(noticeId)}&from=edge-toast`;

 showForegroundPushToast({ title, body, url });
 });
 }

 function subscribeNotices(){
 onSnapshot(collection(db, NOTICES_COLLECTION), (snapshot) => {
 handleMobileEdgeNoticeToastFallback(snapshot);
 state.notices = snapshot.docs
 .map((d) => sanitizeNotice(d.data(), d.id))
 .filter((item) => item.visible !== false)
 .sort((a, b) => {
 if (Number(b.pinned) !== Number(a.pinned)) return Number(b.pinned) - Number(a.pinned);
 const aTime = a.updatedAt?.seconds || a.createdAt?.seconds || 0;
 const bTime = b.updatedAt?.seconds || b.createdAt?.seconds || 0;
 return bTime - aTime;
 });
 renderNotices();
 handlePendingNoticeDeepLink();
 handleCleanDeepLink();
 markInitialDataLoaded('notices');
 }, (error) => {
 console.error('공지 로드 실패', error);
 markInitialDataLoaded('notices');
 });
 }

 function noticeCardTemplate(item){
 const dateText = formatDateTime(item.updatedAt || item.createdAt);
 return `
 <div class="notice-meta">
 ${item.pinned ? '<span class="notice-badge pin">중요</span><span class="notice-badge fixed">상단 고정</span>' : ''}
 <span class="notice-badge">${item.category}</span>
 ${recentNewBadgeHtml(item)}
 ${dateText ? `<span class="notice-date">${dateText}</span>` : ''}
 </div>
 <h4>${item.title}</h4>
 <p>${item.content}</p>
 `;
 }

 function toAbsoluteUrl(url = ''){
 const value = String(url || '').trim();
 if(!value) return '';
 try{ return new URL(value, location.origin).href; }catch(_){ return ''; }
 }
function getShareBaseOrigin(){
 const host = String(location.hostname || '').toLowerCase();

 // 카카오 Developers 도메인 등록값과 공유 링크 origin을 일치시키기 위해
 // 운영/개발 모두 www 기준으로 고정합니다.
 if(host.includes('sola-home-dev.kr')) return 'https://www.sola-home-dev.kr';
 if(host.includes('theunjeongpick.com')) return 'https://theunjeongpick.com';
 if(host.includes('sola-home.kr')) return 'https://www.sola-home.kr';

 return location.origin;
 }

 function getKakaoPcSafeAppUrl(){
 // PC 카카오톡에서 버튼이 '모바일에서 확인해주세요'로 비활성 처리되는 것을 피하기 위해
 // 카카오 버튼/카드 링크는 등록된 사이트 도메인의 가장 단순한 앱 진입 URL로 고정합니다.
 return `${getShareBaseOrigin()}/app`;
 }

 function createShareId(){
 try{
 if(window.crypto && typeof window.crypto.randomUUID === 'function'){
 return window.crypto.randomUUID();
 }
 }catch(_){ }

 return `share_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
 }

 function getShareUrl(type, id, params = {}){
 const shareType = normalizeDeepLinkType(type) || String(type || '').trim();
 // /share/{type}/{id} Function이 없거나 배포되지 않은 경우 카카오/공지 딥링크가 Not Found가 됩니다.
 // 안정성을 위해 실제 앱 진입 URL은 /app?open=...&id=... 쿼리형으로 고정합니다.
 const url = new URL(`${getShareBaseOrigin()}/app`);
 url.searchParams.set('open', shareType);
 url.searchParams.set('id', String(id || ''));
 url.searchParams.set('from', 'share');

 Object.entries(params || {}).forEach(([key, value]) => {
 if(value !== undefined && value !== null && String(value) !== ''){
 url.searchParams.set(key, String(value));
 }
 });

 return url.toString();
 }

 function getShareButtonUrl(type, id, button = 'card', shareId = ''){
 return getShareUrl(type, id, {
 from: 'kakao',
 btn: button,
 target: type,
 shareId
 });
 }
function getShareTrackingParams(){
 try{
 const params = new URLSearchParams(location.search || '');
 const from = params.get('from') || '';
 const button = params.get('btn') || '';
 const target = params.get('target') || '';
 const shareId = params.get('shareId') || '';

 if(from !== 'kakao') return null;

 const deepLink = parseCleanDeepLink();
 if(!deepLink || !deepLink.id || !deepLink.type) return null;

 return {
 from,
 button: button || 'card',
 target: target || deepLink.type,
 shareId,
 type: deepLink.type,
 targetId: deepLink.id
 };
 }catch(_){
 return null;
 }
 }

 function getShareClickLogKey(data){
 if(!data) return '';
 return `shareVisitLogged:${data.from}:${data.button}:${data.type}:${data.targetId}:${data.shareId || 'no-share-id'}`;
 }

 async function handleShareClickLog(){
 const data = getShareTrackingParams();
 if(!data) return;

 const logKey = getShareClickLogKey(data);
 if(logKey && sessionStorage.getItem(logKey) === '1') return;

 try{
 const stored = getStoredLoginUser();
 const profile = state.currentUserProfile || {};

 await addDoc(collection(db, SHARE_VISIT_LOGS_COLLECTION), {
 event: 'share_link_visit',
 shareId: data.shareId || null,
 type: data.type,
 targetId: data.targetId,
 from: data.from,
 button: data.button,
 target: data.target,
 visitorUid: state.currentUser?.uid || stored.uid || null,
 visitorLoginId: profile.loginId || stored.loginId || null,
 visitorNickname: profile.nickname || profile.displayName || profile.name || null,
 visitorRole: profile.role || profile.userRole || null,
 path: location.pathname,
 href: location.href,
 referrer: document.referrer || '',
 userAgent: navigator.userAgent,
 createdAt: serverTimestamp()
 });

 if(logKey) sessionStorage.setItem(logKey, '1');
 }catch(error){
 console.warn('공유 유입 로그 저장 실패', error);
 }
 }

 async function writeShareActionLog(event, type, item = {}, detail = {}){
 try{
 const stored = getStoredLoginUser();
 await addDoc(collection(db, SHARE_CLICK_LOGS_COLLECTION), {
 event,
 type,
 targetId: item?.id || null,
 targetTitle: type === 'notice' ? (item?.title || '') : (item?.name || item?.title || ''),
 sharedByUid: state.currentUser?.uid || stored.uid || null,
 sharedByLoginId: state.currentUserProfile?.loginId || stored.loginId || null,
 sharedByNickname: state.currentUserProfile?.nickname || state.currentUserProfile?.displayName || state.currentUserProfile?.name || null,
 sharedByRole: state.currentUserProfile?.role || state.currentUserProfile?.userRole || null,
 shareId: detail?.shareId || null,
 channel: detail?.channel || null,
 path: location.pathname,
 href: location.href,
 userAgent: navigator.userAgent,
 detail,
 createdAt: serverTimestamp()
 });

 if(event === 'kakao_share_open' && type === 'benefit' && item?.id){
 const statRef = doc(db, BENEFIT_STATS_COLLECTION, item.id);
 await runTransaction(db, async (tx) => {
   const snap = await tx.get(statRef);
   const prev = snap.exists() ? (snap.data() || {}) : {};
   tx.set(statRef, {
     benefitId: item.id,
     name: item.name || item.title || prev.name || '',
     ...buildSafeStatNumberUpdates(prev, {
       shareClickCount: 1,
       popularScore: 5
     }),
     lastSharedAt: serverTimestamp(),
     updatedAt: serverTimestamp()
   }, { merge:true });
 });
 await recordResidentActivity('share', 5, item.id);
 }
 }catch(error){
 console.warn('공유 액션 로그 저장 실패', error);
 }
 }

 function getItemShareImage(item = {}){
 const raw = item.imageUrl || item.thumbnailUrl || item.thumbnail || item.photoUrl || item.image || DEFAULT_SHARE_IMAGE_URL;
 const url = toAbsoluteUrl(raw);

 if(url && url.startsWith(location.origin)){
 return url.replace(location.origin, getShareBaseOrigin());
 }

 if(url && url.startsWith('/')){
 return `${getShareBaseOrigin()}${url}`;
 }

 return url || `${getShareBaseOrigin()}/icons/icon-512.png?v=20260425b`;
 }

 function getShareDescription(type, item = {}){
 const raw = type === 'notice'
 ? (item.content || '입주민 전용 공지 바로가기')
 : (item.condition || getBenefitDisplayAddress(item) || '입주민 전용 혜택 바로가기');
 return String(raw || '').replace(/\s+/g, ' ').trim().slice(0, 90) || '더운정픽 바로가기';
 }

 async function copyShareUrl(type, item = {}){
 const shareId = createShareId();
 const url = getShareButtonUrl(type, item.id, 'copy', shareId);
 try{
 await writeShareActionLog('copy_share_url', type, item, { url, shareId, channel:'copy' });
 await navigator.clipboard.writeText(url);
 await openModalAlert('공유 링크가 복사되었습니다.');
 }catch(error){
 console.warn('공유 URL 복사 실패', error);
 window.prompt('아래 링크를 복사해 주세요.', url);
 }
 }

 function ensureKakaoReady(){
 try{
 if(!window.Kakao){
 console.warn('카카오 SDK가 로드되지 않았습니다.');
 return false;
 }

 if(!KAKAO_JS_KEY){
 console.warn('KAKAO_JS_KEY가 비어 있습니다.');
 return false;
 }

 if(!window.Kakao.isInitialized()){
 window.Kakao.init(KAKAO_JS_KEY);
 window.__upickKakaoReady = true;
 document.documentElement.classList.add('kakao-sdk-ready');
 }

 return window.Kakao.isInitialized();
 }catch(error){
 console.warn('카카오 SDK 초기화 실패', error);
 return false;
 }
 }

 function prewarmKakaoShareSdk(){
 try{
 if(window.__upickKakaoReady) return true;
 const ready = ensureKakaoReady();
 window.__upickKakaoReady = !!ready;
 return ready;
 }catch(error){
 console.warn('카카오 SDK 사전 초기화 실패', error);
 return false;
 }
 }

 const kakaoPrewarmSchedule = () => {
 const run = () => prewarmKakaoShareSdk();
 if('requestIdleCallback' in window){
 window.requestIdleCallback(run, { timeout: 1800 });
 }else{
 setTimeout(run, 500);
 }
 };
 if(document.readyState === 'loading'){
 document.addEventListener('DOMContentLoaded', kakaoPrewarmSchedule, { once:true });
 }else{
 kakaoPrewarmSchedule();
 }

 function getShareButtonText(type){
 return type === 'notice' ? '공유 준비 중' : '공유 준비 중';
 }

 const kakaoShareActiveButtons = new Set();
 let kakaoShareRestoreTimer = null;

 function restoreShareButtonState(button){
 if(!button) return;
 const originalHtml = button.dataset.shareOriginalHtml;
 const originalDisabled = button.dataset.shareOriginalDisabled === '1';

 if(originalHtml !== undefined){
 button.innerHTML = originalHtml;
 }

 button.disabled = originalDisabled;
 button.removeAttribute('aria-busy');
 button.classList.remove(
 'share-loading',
 'is-share-loading',
 'share-opening',
 'share-returning',
 'kakao-share-loading'
 );

 // 일부 모바일 브라우저에서 disabled/active 스타일이 남는 것을 방지
 button.style.removeProperty('background');
 button.style.removeProperty('background-color');
 button.style.removeProperty('border-color');
 button.style.removeProperty('color');
 button.style.removeProperty('opacity');
 button.style.removeProperty('box-shadow');
 button.style.removeProperty('cursor');
 button.style.removeProperty('pointer-events');

 delete button.dataset.shareBusy;
 delete button.dataset.shareOriginalHtml;
 delete button.dataset.shareOriginalDisabled;

 kakaoShareActiveButtons.delete(button);
 }

 function restoreAllKakaoShareButtons(){
 kakaoShareActiveButtons.forEach(button => restoreShareButtonState(button));
 kakaoShareActiveButtons.clear();

 document.querySelectorAll('.share-loading, .is-share-loading, .share-opening, .share-returning, .kakao-share-loading').forEach(button => {
 restoreShareButtonState(button);
 });

 clearTimeout(kakaoShareRestoreTimer);
 kakaoShareRestoreTimer = null;
 document.documentElement.classList.remove('kakao-share-active');
 }

 function scheduleKakaoShareReturnRestore(delay = 220){
 clearTimeout(kakaoShareRestoreTimer);
 kakaoShareRestoreTimer = setTimeout(restoreAllKakaoShareButtons, Math.max(0, Number(delay || 0)));
 }

 // 카카오톡 공유창/앱 전환 후 브라우저로 돌아오는 시점에 버튼과 로딩 상태를 즉시 원복합니다.
 window.addEventListener('pageshow', function(){
 if(kakaoShareActiveButtons.size) scheduleKakaoShareReturnRestore(120);
 });

 window.addEventListener('focus', function(){
 if(kakaoShareActiveButtons.size) scheduleKakaoShareReturnRestore(160);
 });

 document.addEventListener('visibilitychange', function(){
 if(!document.hidden && kakaoShareActiveButtons.size){
 scheduleKakaoShareReturnRestore(160);
 }
 });

 function markKakaoShareDispatched(){
 document.documentElement.classList.add('kakao-share-active');
 // 카카오 SDK는 공유창을 띄운 뒤 별도 완료 콜백을 안정적으로 제공하지 않으므로
 // 공유 호출 직후 1차 원복하고, 앱/브라우저 복귀 이벤트에서 2차 원복합니다.
 scheduleKakaoShareReturnRestore(900);
 }

 function setKakaoShareButtonOpening(){
 kakaoShareActiveButtons.forEach(button => {
 if(!button || button.dataset.shareBusy !== '1') return;
 button.classList.add('share-opening');
 button.innerHTML = '<span>카카오톡 여는 중</span>';
 });
 }

 async function withShareButtonFeedback(button, type, task){
 if(!button || button.dataset.shareBusy === '1'){
 return;
 }

 button.dataset.shareOriginalHtml = button.innerHTML;
 button.dataset.shareOriginalDisabled = button.disabled ? '1' : '0';
 button.dataset.shareBusy = '1';
 button.disabled = true;
 button.setAttribute('aria-busy', 'true');
 button.classList.add('share-loading', 'is-share-loading');
 button.innerHTML = getShareButtonText(type);

 kakaoShareActiveButtons.add(button);

 try{
 return await task();
 }finally{
 // SDK 호출이 실패하거나 공유창이 뜨지 않은 경우에도 너무 오래 잠기지 않도록 안전 원복합니다.
 scheduleKakaoShareReturnRestore(1300);
 }
 }

 function compactShareText(value = '', max = 80){
 const text = String(value || '')
 .replace(/<[^>]*>/g, ' ')
 .replace(/\s+/g, ' ')
 .trim();

 if(!text) return '';
 return text.length > max ? `${text.slice(0, max).trim()}…` : text;
 }

 function buildKakaoShareTitle(type, item = {}){
 if(type === 'notice'){
 return `[공지 안내] ${compactShareText(item.title || '더운정픽 공지', 34)}`;
 }

 return `[입주민 혜택] ${compactShareText(item.name || item.title || '더운정픽 혜택', 34)}`;
 }

 function buildKakaoShareDescription(type, item = {}){
 if(type === 'notice'){
 const body =
 compactShareText(item.summary || item.content || item.description || item.body || '', 76) ||
 '입주민 전용 공지사항을 확인해 주세요.';

 return [
 body,
 '더운정픽에서 자세히 보기'
 ].join('\n');
 }

 const benefitLine =
 compactShareText(
 item.benefit ||
 item.discount ||
 item.condition ||
 item.description ||
 item.summary ||
 item.content ||
 '',
 54
 );

 const categoryLine = compactShareText(item.category || item.type || '', 20);
 const locationLine = compactShareText(getBenefitDisplayAddress(item) || item.location || item.place || '', 36);

 const lines = [];

 if(benefitLine) lines.push(`추천 ${benefitLine}`);
 if(categoryLine) lines.push(`🏷️ ${categoryLine}`);
 if(locationLine) lines.push(`📍 ${locationLine}`);

 lines.push('더운정픽 입주민 전용 혜택');

 return lines.join('\n');
 }

 function normalizeKakaoShareUrl(url){
 let value = String(url || '').trim();
 if(!value) return value;
 // 기존 단계에서 중복 encode 된 링크가 들어와도 카카오 SDK에는 원본 URL만 넘깁니다.
 for(let i = 0; i < 2; i += 1){
   try{
     if(/%25(?:2F|3A|3F|3D|26)/i.test(value)){
       const decoded = decodeURIComponent(value);
       if(decoded && decoded !== value) value = decoded;
     }
   }catch(_){ break; }
 }
 return value;
}

function shouldUseKakaoCopyFallback(error){
 const text = String(error && (error.message || error.name || error) || '').toLowerCase();
 return /intent|launch|cancel|not.*install|unsupported|not_supported/.test(text);
}

async function shareKakaoItem(type, item = {}){
 const shareId = createShareId();
 const cardShareUrl = getShareButtonUrl(type, item.id, 'card', shareId);
 const webShareUrl = getShareButtonUrl(type, item.id, 'web', shareId);
 const appShareUrl = getShareButtonUrl(type, item.id, 'app', shareId);

 const title = buildKakaoShareTitle(type, item);
 const description = buildKakaoShareDescription(type, item);
 const imageUrl = getItemShareImage(item);
 const sharedCount = Number(item.shareClickCount || item.shareCount || item.sharedCount || item.clickCount || item.viewCount || 0) || 0;

 if(!ensureKakaoReady()){
 await copyShareUrl(type, item);
 return;
 }

 try{
 writeShareActionLog('kakao_share_open', type, item, {
 shareId,
 channel: 'kakao',
 cardShareUrl,
 webShareUrl,
 appShareUrl,
 note: '제품 링크 관리 등록 완료 기준: 카카오 카드/버튼 URL을 실제 상세 딥링크로 전송'
 }).catch(error => {
 console.warn('카카오 공유 로그 저장 실패', error);
 });

 if(typeof setKakaoShareButtonOpening === 'function'){
 setKakaoShareButtonOpening();
 }

 Kakao.Share.sendDefault({
 objectType: 'feed',
 content: {
 title: title,
 description: description,
 imageUrl: imageUrl,
 link: {
 mobileWebUrl: cardShareUrl,
 webUrl: cardShareUrl
 },
 },
 social: {
 likeCount: sharedCount,
 commentCount: sharedCount,
 sharedCount: sharedCount,
 },
 buttons: [
 {
 title: '웹으로 보기',
 link: {
 mobileWebUrl: webShareUrl,
 webUrl: webShareUrl,
 },
 },
 {
 title: '앱으로 보기',
 link: {
 mobileWebUrl: appShareUrl,
 webUrl: appShareUrl,
 },
 },
 ],
 });

 if(typeof markKakaoShareDispatched === 'function'){
 markKakaoShareDispatched();
 }
 }catch(error){
 console.warn('카카오 공유 실패', error);
 await copyShareUrl(type, item);
 }
 }

 function ensureQrCodeLibrary(){
 if(window.QRCode && typeof window.QRCode.toCanvas === 'function') return Promise.resolve(window.QRCode);
 return Promise.reject(new Error('qrcode_library_not_loaded'));
 }

 function drawRoundedRect(ctx, x, y, w, h, r){
 const radius = Math.min(r, w / 2, h / 2);
 ctx.beginPath();
 ctx.moveTo(x + radius, y);
 ctx.arcTo(x + w, y, x + w, y + h, radius);
 ctx.arcTo(x + w, y + h, x, y + h, radius);
 ctx.arcTo(x, y + h, x, y, radius);
 ctx.arcTo(x, y, x + radius, y, radius);
 ctx.closePath();
 }

 async function drawQrCenterLogo(canvas){
 if(!canvas) return;
 const ctx = canvas.getContext('2d');
 if(!ctx) return;

 const size = canvas.width || 220;
 const box = Math.round(size * 0.22);
 const x = Math.round((size - box) / 2);
 const y = Math.round((size - box) / 2);

 ctx.save();
 ctx.shadowColor = 'rgba(15,23,42,.16)';
 ctx.shadowBlur = 10;
 ctx.shadowOffsetY = 4;
 drawRoundedRect(ctx, x, y, box, box, 12);
 ctx.fillStyle = '#ffffff';
 ctx.fill();
 ctx.restore();

 ctx.save();
 drawRoundedRect(ctx, x + 1, y + 1, box - 2, box - 2, 11);
 ctx.strokeStyle = '#e5e7eb';
 ctx.lineWidth = 2;
 ctx.stroke();
 ctx.restore();

 const img = new Image();
 img.decoding = 'async';
 img.src = '/icons/internal/brand-symbol-real.png?v=20260511';

 await new Promise((resolve) => {
 img.onload = resolve;
 img.onerror = resolve;
 });

 if(img.complete && img.naturalWidth > 0){
 const pad = Math.round(box * 0.10);
 ctx.save();
 drawRoundedRect(ctx, x + pad, y + pad, box - pad * 2, box - pad * 2, 8);
 ctx.clip();
 ctx.drawImage(img, x + pad, y + pad, box - pad * 2, box - pad * 2);
 ctx.restore();
 }else{
 ctx.save();
 ctx.fillStyle = '#b91c1c';
 ctx.font = `900 ${Math.round(box * 0.34)}px -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif`;
 ctx.textAlign = 'center';
 ctx.textBaseline = 'middle';
 ctx.fillText('H', x + box / 2, y + box / 2);
 ctx.restore();
 }
 }

 function getQrThemeClass(type, item = {}){
 if(type === 'notice') return 'qr-theme-notice';
 const raw = String(item.discount || item.rate || item.benefit || item.condition || '');
 const match = raw.match(/(\d+)\s*%/);
 const pct = match ? Number(match[1]) : 0;
 if(pct >= 50) return 'qr-theme-hot';
 if(pct >= 30) return 'qr-theme-mid';
 return 'qr-theme-normal';
 }

 function getQrBrandText(type, item = {}){
 const title = type === 'notice'
 ? (item.title || '공지사항')
 : (item.name || item.title || '입주민 혜택');
 const sub = type === 'notice'
 ? '더운정픽 공지 QR'
 : '더운정픽 혜택 QR';
 return { title, sub };
 }

 async function showQrCode(type, item = {}){
 const shareId = createShareId();
 const url = getShareButtonUrl(type, item.id, 'qr', shareId);
 await writeShareActionLog('show_qr_share', type, item, { url, shareId, channel:'qr' });

 const modal = qs('#qrModal');
 const qrWrap = qs('#qrModal .qr-canvas-wrap');
 const urlBox = qs('#qrShareUrl');
 const brand = getQrBrandText(type, item);
 const themeClass = getQrThemeClass(type, item);

 if(qrWrap){
 qrWrap.className = `qr-canvas-wrap ${themeClass}`;
 qrWrap.innerHTML = `
 <div class="qr-brand-title">${escapeHtml(brand.title)}</div>
 <div class="qr-brand-sub">${escapeHtml(brand.sub)}</div>
 <canvas id="qrCanvas" width="220" height="220"></canvas>
 `;
 }

 const canvas = qs('#qrCanvas');
 if(urlBox) urlBox.textContent = url;

 try{
 if(!canvas) throw new Error('qr_canvas_missing');
 const QR = await ensureQrCodeLibrary();
 await QR.toCanvas(canvas, url, {
 width: 220,
 margin: 2,
 errorCorrectionLevel: 'H',
 color: {
 dark: '#0f172a',
 light: '#ffffff'
 }
 });
 await drawQrCenterLogo(canvas);
 }catch(error){
 console.warn('QR 생성 실패', error);
 if(qrWrap){
 qrWrap.className = 'qr-canvas-wrap';
 qrWrap.innerHTML = '<div style="padding:18px;color:#64748b;font-size:13px;line-height:1.6;word-break:keep-all;">QR 생성 모듈을 불러오지 못했습니다.<br>아래 URL 복사를 사용해 주세요.</div>';
 }
 }

 const copyBtn = qs('#qrCopyBtn');
 if(copyBtn) copyBtn.onclick = () => copyShareUrl(type, item);

 if(modal){
 if(modal.open) closeDialogSafe(modal);
 openDialogSafe(modal, { initialFocusSelector:'#closeQrModal' });
 }
 }

 
function getStablePageScrollY(){
 const bodyTop = parseFloat(document.body?.style?.top || '');
 if(document.body?.classList?.contains('upick-modal-hard-lock') && Number.isFinite(bodyTop) && bodyTop < 0){
 return Math.max(0, Math.abs(bodyTop));
 }
 return window.scrollY || window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
}

function restoreStablePageScrollY(y){
 const top = Math.max(0, Number(y) || 0);
 releaseDetailModalBodyScrollClasses();
 try{ document.documentElement.scrollTop = top; }catch(_){}
 try{ document.body.scrollTop = top; }catch(_){}
 try{ window.scrollTo({ top, left:0, behavior:'auto' }); }
 catch(_){ try{ window.scrollTo(0, top); }catch(__){} }
}

function releaseDetailModalBodyScrollClasses(){
 try{
   // v83: body fixed/top 방식은 사용하지 않습니다. 이전 버전 잔여값만 정리합니다.
   document.documentElement.classList.remove('upick-modal-lock','upick-modal-hard-lock','upick-v9-modal-lock');
   document.body.classList.remove('upick-modal-lock','upick-modal-hard-lock','upick-v9-modal-lock');
   document.body.style.position = '';
   document.body.style.top = '';
   document.body.style.left = '';
   document.body.style.right = '';
   document.body.style.width = '';
 }catch(_){}
}


function holdStablePageScrollY(y, duration = 900){
 const top = Math.max(0, Number(y) || 0);
 const started = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
 const until = started + Math.max(120, Number(duration) || 900);
 try{ if('scrollRestoration' in history) history.scrollRestoration = 'manual'; }catch(_){}
 try{ document.documentElement.style.scrollBehavior = 'auto'; }catch(_){}
 try{ document.body.style.scrollBehavior = 'auto'; }catch(_){}
 const keep = () => {
   releaseDetailModalBodyScrollClasses();
   const now = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
   const current = window.scrollY || window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
   if(Math.abs(current - top) > 2){
     restoreStablePageScrollY(top);
   }
   if(now < until){
     requestAnimationFrame(keep);
   }else{
     setTimeout(() => {
       const latest = window.scrollY || window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
       if(Math.abs(latest - top) > 2) restoreStablePageScrollY(top);
     }, 80);
   }
 };
 restoreStablePageScrollY(top);
 requestAnimationFrame(keep);
 setTimeout(() => restoreStablePageScrollY(top), 0);
 setTimeout(() => restoreStablePageScrollY(top), 60);
 setTimeout(() => restoreStablePageScrollY(top), 180);
 setTimeout(() => restoreStablePageScrollY(top), 360);
 setTimeout(() => restoreStablePageScrollY(top), 720);
}

function resetDetailDialogScroll(modal){
 if(!modal) return;
 const targets = [
   modal,
   modal.querySelector('.modal-body'),
   modal.querySelector('#modalBody'),
   modal.querySelector('#noticeModalBody'),
   modal.querySelector('.notice-detail-wrap'),
   modal.querySelector('.detail-wrap')
 ].filter(Boolean);
 targets.forEach((el) => {
   try{ el.style.scrollBehavior = 'auto'; }catch(_){}
   try{ el.scrollTop = 0; }catch(_){}
   try{ el.scrollLeft = 0; }catch(_){}
   try{ el.scrollTo({ top:0, left:0, behavior:'auto' }); }catch(_){}
 });
}

function scheduleDetailDialogScrollReset(modal){
 if(!modal) return;
 resetDetailDialogScroll(modal);
 requestAnimationFrame(() => resetDetailDialogScroll(modal));
 [0, 40, 90, 180, 320].forEach((delay) => {
   setTimeout(() => resetDetailDialogScroll(modal), delay);
 });
}

function restorePageScrollWithoutBodyLock(y){
 const top = Math.max(0, Number(y) || 0);
 if(!Number.isFinite(top)) return;
 try{ if('scrollRestoration' in history) history.scrollRestoration = 'manual'; }catch(_){}
 try{ document.documentElement.style.scrollBehavior = 'auto'; }catch(_){}
 try{ document.body.style.scrollBehavior = 'auto'; }catch(_){}
 try{ document.documentElement.scrollTop = top; }catch(_){}
 try{ document.body.scrollTop = top; }catch(_){}
 try{ window.scrollTo({ top, left:0, behavior:'auto' }); }
 catch(_){ try{ window.scrollTo(0, top); }catch(__){} }
}

function holdPageScrollWithoutBodyLock(y, duration = 520){
 const top = Math.max(0, Number(y) || 0);
 const start = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
 const until = start + Math.max(120, Number(duration) || 520);
 const keep = () => {
   const now = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
   const current = window.scrollY || window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
   if(Math.abs(current - top) > 1) restorePageScrollWithoutBodyLock(top);
   if(now < until) requestAnimationFrame(keep);
 };
 restorePageScrollWithoutBodyLock(top);
 requestAnimationFrame(keep);
 setTimeout(() => restorePageScrollWithoutBodyLock(top), 0);
 setTimeout(() => restorePageScrollWithoutBodyLock(top), 30);
 setTimeout(() => restorePageScrollWithoutBodyLock(top), 80);
 setTimeout(() => restorePageScrollWithoutBodyLock(top), 180);
 setTimeout(() => restorePageScrollWithoutBodyLock(top), 360);
}

function preservePageScrollForDialogOpen(modal, savedY){
 const y = Math.max(0, Number(savedY) || getStablePageScrollY() || 0);
 window.__upickPendingModalScrollY = y;
 try{ if(typeof window.__upickLockModalBackgroundAt === 'function') window.__upickLockModalBackgroundAt(y); }catch(_){}
 // showModal()/자동 focus가 body 스크롤을 0으로 당기는 경우가 있어, body fixed 없이 같은 프레임 안에서 원위치를 재고정합니다.
 holdPageScrollWithoutBodyLock(y, 520);
 scheduleDetailDialogScrollReset(modal);
}

function forceCloseTransientImagePreviewLayers(){
 const layers = [
   { selector:'#newsImagePreviewOverlay', bodyClass:'news-image-preview-open' },
   { selector:'.benefit-image-preview-overlay', bodyClass:'benefit-image-preview-open' },
   { selector:'#aiImageZoomBackdrop', bodyClass:'' }
 ];
 layers.forEach(({ selector, bodyClass }) => {
   document.querySelectorAll(selector).forEach((layer) => {
     try{
       layer.classList.remove('show','closing','is-open','upick-motion-open','upick-motion-closing');
       layer.setAttribute('aria-hidden','true');
       layer.removeAttribute('open');
       delete layer.dataset.upickImageClosing;
       if(layer.id === 'newsImagePreviewOverlay'){
         const img = layer.querySelector('img');
         if(img) img.removeAttribute('src');
       }
       if(layer.classList.contains('benefit-image-preview-overlay')){
         layer.remove();
       }
     }catch(_){ }
   });
   if(bodyClass) document.body.classList.remove(bodyClass);
 });
 try{ document.body.classList.remove('benefit-image-preview-open','news-image-preview-open'); }catch(_){ }
 if(typeof window.__upickSyncModalScrollLock === 'function') setTimeout(window.__upickSyncModalScrollLock, 0);
 if(window.DuLayerStackManager && typeof window.DuLayerStackManager.requestSync === 'function') setTimeout(window.DuLayerStackManager.requestSync, 0);
}
window.__upickForceCloseTransientImagePreviewLayers = forceCloseTransientImagePreviewLayers;

function closeDetailDialogPreservingPage(modal, options = {}){
 // v97: 혜택 상세/공지 상세 div 모달 닫힘 완료 뒤 후속 동작을 실행할 수 있게 통일합니다.
 // 방문 알림 저장 후 '캘린더에서 확인'처럼 화면 전환이 필요한 흐름에서,
 // 상세 fade-out과 changeView/renderAll이 서로 겹치지 않도록 afterClose 콜백을 지원합니다.
 const extraAfterClose = typeof options?.afterClose === 'function' ? options.afterClose : null;
 try{
   const active = document.activeElement;
   if(active && active.blur) active.blur();
 }catch(_){}
 if(!modal){
   if(extraAfterClose) setTimeout(() => { try{ extraAfterClose(); }catch(_){} }, 0);
   return;
 }
 if(modal.id === 'detailModal' || modal.id === 'noticeModal') forceCloseTransientImagePreviewLayers();
 const y = Number(window.__upickClosingDetailScrollY || getStablePageScrollY());
 let didAfterClose = false;
 const afterClose = () => {
   if(didAfterClose) return;
   didAfterClose = true;
   try{ if(typeof window.__upickUnlockModalBackground === 'function') window.__upickUnlockModalBackground(); }catch(_){}
   try{ if(typeof window.__upickSyncModalScrollLock === 'function') window.__upickSyncModalScrollLock(); }catch(_){}
   try{ if(window.DuLayerStackManager && typeof window.DuLayerStackManager.requestSync === 'function') window.DuLayerStackManager.requestSync(); }catch(_){}
   setTimeout(() => {
     try{ if(typeof window.__upickSyncModalScrollLock === 'function') window.__upickSyncModalScrollLock(); }catch(_){}
     try{ if(window.DuLayerStackManager && typeof window.DuLayerStackManager.requestSync === 'function') window.DuLayerStackManager.requestSync(); }catch(_){}
   }, 380);
   resetDetailDialogScroll(modal);
   if(modal.id === 'detailModal'){
     modal.classList.remove('upick-over-calendar-day');
     try{ delete modal.dataset.openedFromCalendarDay; }catch(_){ modal.removeAttribute('data-opened-from-calendar-day'); }
     modal.dataset.benefitId = '';
   }
   if(modal.id === 'detailModal' && parseCleanDeepLink()?.type === 'benefit') clearCleanDeepLinkUrl({ replace:true });
   if(modal.id === 'noticeModal' && parseCleanDeepLink()?.type === 'notice') clearCleanDeepLinkUrl({ replace:true });
   if(modal.id === 'detailModal' && window.__upickFavoriteRenderPending){
     window.__upickFavoriteRenderPending = false;
     try{ renderAll(); }catch(_){}
   }
   if(Number.isFinite(y) && !extraAfterClose) holdStablePageScrollY(y, 700);
   if(extraAfterClose){
     setTimeout(() => { try{ extraAfterClose(); }catch(_){} }, 0);
   }
 };
 try{
   if(typeof closeDialogSafe === 'function') closeDialogSafe(modal, { duration:320, afterClose });
   else { closeNativeDialogSafe(modal); afterClose(); }
 }catch(_){
   try{ modal?.removeAttribute?.('open'); }catch(__){}
   afterClose();
 }
}

function shareActionsHtml(prefix){
 return `
 <div class="share-actions">
 <button class="btn btn-soft block" id="${prefix}CopyShareBtn" type="button"><img class="upick-svg-icon upick-inline-icon" src="/icons/internal/link.svg" alt="" loading="lazy">URL 복사</button>
 <button class="btn btn-soft block" id="${prefix}KakaoShareBtn" type="button"><img class="upick-svg-icon upick-inline-icon" src="/icons/internal/community.svg" alt="" loading="lazy">카카오톡</button>
 <button class="btn btn-soft block" id="${prefix}QrShareBtn" type="button"><img class="upick-svg-icon upick-inline-icon" src="/icons/internal/qr.svg" alt="" loading="lazy">QR 보기</button>
 </div>
 `;
 }


function duDetailFooterHtml(inner = ''){
 return `<div class="du-layer__footer du-detail-footer" data-du-layer-footer="">${inner || ''}</div>`;
}

function duDetailSectionHtml(className = '', inner = ''){
 const safeClass = String(className || '').trim();
 return `<section class="du-detail-section${safeClass ? ' ' + safeClass : ''}">${inner || ''}</section>`;
}

function renderNoticeDetailBody(item = {}){
 const dateText = formatDateTime(item.updatedAt || item.createdAt);
 return `
 <article class="notice-detail-wrap du-detail-layout du-notice-detail-layout">
   <section class="du-detail-summary du-notice-summary">
     <div class="notice-detail-meta du-detail-meta">
       ${item.pinned ? '<span class="notice-badge pin">중요</span><span class="notice-badge fixed">상단 고정</span>' : ''}
       <span class="notice-badge">${escapeHtml(item.category || '일반')}</span>
       ${dateText ? `<span class="notice-date">${dateText}</span>` : ''}
     </div>
     <h3 class="notice-detail-title du-detail-title">${escapeHtml(item.title || '공지사항')}</h3>
   </section>
   ${duDetailSectionHtml('notice-detail-panel du-detail-card du-notice-content-card', `
     <strong class="du-detail-card-title">공지 내용</strong>
     <div class="notice-detail-content du-detail-text">${escapeHtml(item.content || '')}</div>
   `)}
   ${duDetailFooterHtml(`<div class="notice-detail-actions">${shareActionsHtml('notice')}</div>`)}
 </article>
 `;
}

function renderBenefitDetailBody(item = {}){
 const mainPanels = `
   ${duDetailSectionHtml('panel benefit-condition-panel du-detail-card', `<strong class="benefit-detail-panel-title du-detail-card-title">혜택 조건</strong><div class="benefit-detail-body-text du-detail-text">${escapeHtml(item.condition || '혜택 조건은 상세보기에서 확인해 주세요.')}</div>`)}
   ${benefitBusinessHoursPanelHtml(item)}
   ${supportProgramsPanelHtml(item)}
   ${naverReservationPanelHtml(item)}
   ${couponLinksPanelHtml(item)}
   ${newsItemsPanelHtml(item)}
   ${benefitPriceDetailsHtml(item)}
   ${locationPanelHtml(item)}
   ${benefitExtraInfoHtml(item)}
   ${duDetailSectionHtml('panel benefit-contact-panel du-detail-card', `<strong class="du-detail-card-title" style="display:block;margin-bottom:8px;font-size:13px;color:var(--muted);">연락처</strong>${benefitContactHtml(item)}`)}
   ${benefitDetailDateHtml(item)}
 `;
 return `
 <article class="detail-wrap du-detail-layout du-benefit-detail-layout">
   <section class="du-detail-summary du-benefit-summary">
     ${benefitDetailHeroHtml(item)}
   </section>
   <div class="du-detail-section-stack benefit-detail-section-stack">
     ${mainPanels}
   </div>
   <section class="du-detail-section du-reaction-section">
     ${residentReactionHtml(item)}
   </section>
   ${duDetailFooterHtml(shareActionsHtml('benefit'))}
 </article>
 `;
}

 function openNotice(item, options = {}){
 if(!item) return;
 const pageScrollY = getStablePageScrollY();
 const { skipUrlUpdate = false } = options;
 if(!skipUrlUpdate && item?.id) updateCleanDeepLinkUrl('notice', item.id);

 const modal = qs('#noticeModal');
 const body = qs('#noticeModalBody');
 const noticeHtml = renderNoticeDetailBody(item);

 // 공지 모달 DOM이 아직 없거나 렌더링에서 누락된 경우에도 앱이 멈추지 않도록 방어
 if(!modal || !body){
 console.warn('[notice] noticeModal 또는 noticeModalBody를 찾을 수 없습니다.', { modal: !!modal, body: !!body, item });
 if(typeof showAppAlert === 'function'){
 showAppAlert({
 title: item.title || '공지사항',
 message: item.content || '공지 내용을 불러왔습니다.',
 confirmText: '확인'
 });
 }else{
 alert(`${item.title || '공지사항'}

${item.content || ''}`);
 }
 return;
 }

 body.innerHTML = noticeHtml;
 try{
 if(isLayerOpenLike(modal)) closeDetailDialogPreservingPage(modal);
 window.__upickPendingModalScrollY = pageScrollY;
 try{ if(typeof window.__upickLockModalBackgroundAt === 'function') window.__upickLockModalBackgroundAt(pageScrollY); }catch(_){}
 preservePageScrollForDialogOpen(modal, pageScrollY);
 openDialogSafe(modal, { duration:320, initialFocusSelector:'#closeNoticeModal' });
 requestAnimationFrame(() => restorePageScrollWithoutBodyLock(pageScrollY));
 }catch(error){
 console.warn('[notice] 공지 모달 열기 실패', error);
 openNativeDialogSafe(modal);
 preservePageScrollForDialogOpen(modal, pageScrollY);
 requestAnimationFrame(() => restorePageScrollWithoutBodyLock(pageScrollY));
 }

 qs('#noticeCopyShareBtn')?.addEventListener('click', () => copyShareUrl('notice', item));
 qs('#noticeKakaoShareBtn')?.addEventListener('click', (event) => withShareButtonFeedback(event.currentTarget, 'notice', () => shareKakaoItem('notice', item)));
 qs('#noticeQrShareBtn')?.addEventListener('click', () => showQrCode('notice', item));
 }

 function scrollToNoticeCard(noticeId){
 const id = String(noticeId || '').trim();
 if(!id) return false;
 const targetEl = document.querySelector(`#noticeList [data-notice-id="${CSS.escape(id)}"]`);
 if(!targetEl) return false;

 targetEl.scrollIntoView({ behavior:'smooth', block:'center' });
 targetEl.classList.remove('notice-highlight');
 void targetEl.offsetWidth;
 targetEl.classList.add('notice-highlight');
 setTimeout(() => targetEl.classList.remove('notice-highlight'), 1400);
 return true;
 }

 function openNoticeFromList(item, options = {}){
 if(!item) return;
 const { moveToNoticeView = false } = options;

 if(moveToNoticeView && state.view !== 'notices'){
 changeView('notices');
 setTimeout(() => {
 scrollToNoticeCard(item.id);
 openNotice(item);
 }, 120);
 return;
 }

 scrollToNoticeCard(item.id);
 openNotice(item);
 }

 function openNoticeById(noticeId){
 const id = String(noticeId || '').trim();
 if(!id) return false;

 if(!canOpenNoticeDeepLink()){
 pendingDeepLink.view = '';
 pendingDeepLink.noticeId = '';
 pendingNoticeOpened = false;
 clearNoticeDeepLinkUrl();
 return false;
 }

 const item = (state.notices || []).find((notice) => notice.id === id);
 if(!item) return false;
 changeView('notices');
 setTimeout(() => {
 scrollToNoticeCard(id);
 openNotice(item);
 clearNoticeDeepLinkUrl();
 }, 140);
 return true;
 }

 function handlePendingNoticeDeepLink(){
 if(pendingNoticeOpened) return;
 if(pendingDeepLink.view !== 'notices' || !pendingDeepLink.noticeId) return;

 if(!canOpenNoticeDeepLink()){
 pendingDeepLink.view = '';
 pendingDeepLink.noticeId = '';
 pendingNoticeOpened = false;
 clearNoticeDeepLinkUrl();
 return;
 }

 if(!state.notices || !state.notices.length) return;
 pendingNoticeOpened = openNoticeById(pendingDeepLink.noticeId);
 if(pendingNoticeOpened){
 clearNoticeDeepLinkUrl();
 }
 }

 function makeKeyboardClickable(el, label){
 if(!el) return el;
 el.setAttribute('role','button');
 el.setAttribute('tabindex','0');
 if(label && !el.getAttribute('aria-label')) el.setAttribute('aria-label', label);
 if(el.__upickA11yClickableBound) return el;
 el.__upickA11yClickableBound = true;
 el.addEventListener('keydown', (event) => {
 if(event.key !== 'Enter' && event.key !== ' ') return;
 const interactive = event.target && event.target.closest && event.target.closest('button,a,input,select,textarea,[role="button"],[role="link"],summary');
 if(interactive && interactive !== el) return;
 event.preventDefault();
 el.click();
 });
 return el;
 }

 function renderNotices(){
 const listEl = qs('#noticeList');
 const homeListEl = qs('#homeNoticeList');
 const items = state.notices || [];

 if(listEl){
 listEl.innerHTML = '';
 if(!items.length){
 listEl.innerHTML = '<div class="notice-empty">등록된 공지가 없습니다.</div>';
 }else{
 items.forEach((item) => {
 const el = document.createElement('article');
 el.className = `notice-item${item.pinned ? ' pinned' : ''}`;
 el.dataset.noticeId = item.id;
 el.innerHTML = noticeCardTemplate(item);
 makeKeyboardClickable(el, `공지 상세 열기: ${item.title || item.name || '공지'}`);
 el.onclick = () => openNoticeFromList(item);
 listEl.appendChild(el);
 });
 }
 }

 if(homeListEl){
 homeListEl.innerHTML = '';
 const homeItems = items.slice(0, 3);
 if(!homeItems.length){
 homeListEl.innerHTML = '<div class="notice-empty">등록된 공지가 없습니다.</div>';
 }else{
 homeItems.forEach((item) => {
 const el = document.createElement('article');
 el.className = `notice-item${item.pinned ? ' pinned' : ''}`;
 el.dataset.noticeId = item.id;
 el.innerHTML = noticeCardTemplate(item);
 makeKeyboardClickable(el, `공지 상세 열기: ${item.title || item.name || '공지'}`);
 el.onclick = () => openNoticeFromList(item, { moveToNoticeView:true });
 homeListEl.appendChild(el);
 });
 }
 }
 }
	
	function getPopularTrendClass(currentRank, previousRank) {
 if (!previousRank) return 'same';
 if (currentRank < previousRank) return 'up';
 if (currentRank > previousRank) return 'down';
 return 'same';
 }

 function getPopularTrendText(currentRank, previousRank) {
 if (!previousRank) return 'NEW';
 if (currentRank < previousRank) return `▲ ${previousRank - currentRank}`;
 if (currentRank > previousRank) return `▼ ${currentRank - previousRank}`;
 return '―';
 }

 function getPopularRowMotionClass(item = {}) {
 if (!item.previousRank) return 'rank-new';
 if (item.rank < item.previousRank) return 'rank-up';
 if (item.rank > item.previousRank) return 'rank-down';
 return '';
 }

 function calcPopularScoreFromStats(data = {}) {
 const detailViewCount = Number(data.detailViewCount || 0);
 const clickCount = Number(data.clickCount || 0);
 const cardClickCount = Number(data.cardClickCount || 0);
 const favoriteCount = Number(data.favoriteCount || 0);
 const shareClickCount = Number(data.shareClickCount || 0);
 const likeCount = Number(data.likeCount || 0);
 const recommendCount = Number(data.recommendCount || 0);
 const hotCount = Number(data.hotCount || 0);
 const mapClickCount = Number(data.mapClickCount || 0);
 const directionClickCount = Number(data.directionClickCount || data.routeClickCount || 0);
 const callClickCount = Number(data.callClickCount || data.phoneClickCount || 0);
 const smartstoreClickCount = Number(data.smartstoreClickCount || 0);
 const bandClickCount = Number(data.bandClickCount || 0);
 return detailViewCount + clickCount + cardClickCount + favoriteCount * 3 + shareClickCount * 5 + likeCount * 2 + recommendCount * 4 + hotCount * 6 + mapClickCount * 2 + directionClickCount * 4 + callClickCount * 3 + smartstoreClickCount * 4 + bandClickCount * 3;
 }

 function getShareBestItemId(items = []) {
 const candidates = items
 .filter((item) => Number(item.shareClickCount || 0) > 0)
 .sort((a, b) => {
 const shareDiff = Number(b.shareClickCount || 0) - Number(a.shareClickCount || 0);
 if (shareDiff) return shareDiff;
 return Number(b.popularScore || b.score || 0) - Number(a.popularScore || a.score || 0);
 });
 return candidates[0]?.id || '';
 }

 let popularStatsUnsubscribe = null;
 function subscribePopularStats() {
 if(popularStatsUnsubscribe) return;
 const popularQuery = query(
 collection(db, BENEFIT_STATS_COLLECTION),
 orderBy('popularScore', 'desc'),
 limit(300)
 );

 popularStatsUnsubscribe = onSnapshot(popularQuery, (snapshot) => {
 state.benefitStatsMap = Object.fromEntries(snapshot.docs.map((d) => [d.id, { id:d.id, ...(d.data() || {}) }]));
 const runtimePreviousRanks = new Map(
 (state.popularItems || []).map((item, index) => [item.id, index + 1])
 );
 const storedPreviousRankMap = typeof getPopularPreviousRankMap === 'function'
 ? getPopularPreviousRankMap()
 : {};

 const rankedItems = snapshot.docs.map((d) => {
 const data = d.data() || {};
 const benefit = state.benefits.find((item) => item.id === d.id);
 const detailViewCount = Number(data.detailViewCount || 0);
 const clickCount = Number(data.clickCount || 0);
 const favoriteCount = Number(data.favoriteCount || 0);
 const shareClickCount = Number(data.shareClickCount || 0);
 const calculatedPopularScore = calcPopularScoreFromStats(data);
 const popularScore = Math.max(Number(data.popularScore || 0), calculatedPopularScore);

 return {
 id: d.id,
 name: data.name || benefit?.name || '이름 없는 매장',
 category: benefit?.category || data.category || '기타',
 condition: benefit?.condition || data.condition || '',
 createdAt: benefit?.createdAt || data.createdAt || null,
 updatedAt: benefit?.updatedAt || data.updatedAt || null,
 detailViewCount,
 clickCount,
 favoriteCount,
 shareClickCount,
 mapClickCount: Number(data.mapClickCount || 0),
 directionClickCount: Number(data.directionClickCount || 0),
 callClickCount: Number(data.callClickCount || data.phoneClickCount || 0),
 recentCrowdPulse: Number(data.recentCrowdPulse || 0),
 recentCrowdLastAt: data.recentCrowdLastAt || null,
 lastDetailViewAt: data.lastDetailViewAt || null,
 lastCardClickAt: data.lastCardClickAt || null,
 lastMapClickAt: data.lastMapClickAt || null,
 lastDirectionClickAt: data.lastDirectionClickAt || null,
 lastCallClickAt: data.lastCallClickAt || null,
 lastFavoriteAt: data.lastFavoriteAt || null,
 lastSharedAt: data.lastSharedAt || null,
 likeCount: Number(data.likeCount || 0),
 recommendCount: Number(data.recommendCount || 0),
 hotCount: Number(data.hotCount || 0),
 score: popularScore,
 popularScore,
 benefit: benefit || null
 };
 })
 .filter((item) => item.popularScore > 0 && isRecommendableBenefit(item.benefit || item))
 .sort((a, b) => {
 const scoreDiff = Number(b.popularScore || 0) - Number(a.popularScore || 0);
 if (scoreDiff) return scoreDiff;
 const shareDiff = Number(b.shareClickCount || 0) - Number(a.shareClickCount || 0);
 if (shareDiff) return shareDiff;
 return Number(b.detailViewCount || 0) - Number(a.detailViewCount || 0);
 })
 .slice(0, 5)
 .map((item, index) => {
 const currentRank = index + 1;
 const previousRank = runtimePreviousRanks.get(item.id) || Number(storedPreviousRankMap[getPopularItemKey(item)] || 0);
 return {
 ...item,
 rank: currentRank,
 previousRank,
 trendClass: getPopularTrendClass(currentRank, previousRank),
 trendText: getPopularTrendText(currentRank, previousRank)
 };
 });

 const shareBestItemId = getShareBestItemId(rankedItems);
 state.popularItems = rankedItems.map((item) => ({
 ...item,
 isShareBest: !!shareBestItemId && item.id === shareBestItemId
 }));

 renderPopularTop5();
 renderHotNowStores();
 if (typeof savePopularRankSnapshot === 'function') savePopularRankSnapshot(state.popularItems);
 const updatedText = qs('#popularUpdatedText');
 if (updatedText) updatedText.textContent = `실시간 집계 · ${new Date().toLocaleTimeString('ko-KR', { hour:'2-digit', minute:'2-digit' })}`;
 markInitialDataLoaded('popular');
 }, () => {
 const wrap = qs('#popularList');
 if (wrap) {
 wrap.innerHTML = '<div class="panel empty">인기 통계를 불러오지 못했습니다.</div>';
 }
 markInitialDataLoaded('popular');
 });
 }


 function getRankMedalSvg(rank){
 const safeRank = Number(rank);
 if(safeRank < 1 || safeRank > 3) return String(rank);
 return `<img class="rank-medal-svg" src="/icons/internal/top5-medal-${safeRank}.svg" alt="${safeRank}위 메달" loading="lazy" decoding="async">`;
 }

 function getRankMedalClass(rank){
  return rank === 1 ? 'gold' : rank === 2 ? 'silver' : rank === 3 ? 'bronze' : '';
 }

 function getRankBadge(rank){
 if(rank >= 1 && rank <= 3) return `<div class="popular-rank medal ${getRankMedalClass(rank)}" aria-label="${rank}위">${getRankMedalSvg(rank)}</div>`;
 return `<div class="popular-rank" aria-label="${rank}위">${rank}</div>`;
 }

 function animatePopularCount(el, target){
 if(!el) return;
 const finalValue = Math.max(0, Number(target || 0));
 clearInterval(el._popularCountTimer);

 if(!Number.isFinite(finalValue) || finalValue <= 0){
   el.textContent = '0';
   return;
 }

 let currentValue = 0;
 const stepsCount = 18;
 const stepValue = Math.max(1, Math.ceil(finalValue / stepsCount));

 el._popularCountTimer = setInterval(() => {
   currentValue += stepValue;
   if(currentValue >= finalValue){
     currentValue = finalValue;
     clearInterval(el._popularCountTimer);
   }
   el.textContent = currentValue.toLocaleString('ko-KR');
 }, 18);
}

 function isShareInsightAdmin(){
 const profile = state.currentUserProfile || {};
 const role = String(profile.role || profile.userRole || '').toLowerCase();
 return ['root','super','superadmin','admin','manager'].includes(role) || profile.isAdmin === true || profile.admin === true;
 }

 function getLogShareId(log = {}){
 return log.shareId || log.detail?.shareId || '';
 }

 function getLogChannel(log = {}){
 return log.channel || log.detail?.channel || '';
 }

 function getLogTargetTitle(log = {}){
 return log.targetTitle || log.detail?.targetTitle || '';
 }

 function insightSafeText(value = '', fallback = '알 수 없음'){
 const text = String(value || '').replace(/\s+/g, ' ').trim();
 return text || fallback;
 }

 function sortTopEntries(map, limitCount = 5){
 return [...map.values()]
 .sort((a,b) => (b.count || 0) - (a.count || 0))
 .slice(0, limitCount);
 }

 function buildShareInsightRows(items, unitLabel = '건'){
 if(!items || !items.length){
 return '<div class="insight-empty">아직 집계할 정보가 없습니다.</div>';
 }

 return items.map((item, index) => `
 <div class="insight-rank-row">
 <div class="insight-rank-left">
 <div class="insight-rank-badge">${index + 1}</div>
 <div class="insight-rank-copy">
 <b>${escapeHtml(item.title || item.name || '알 수 없음')}</b>
 <small>${escapeHtml(item.sub || '')}</small>
 </div>
 </div>
 <div class="insight-rank-score">
 <strong>${Number(item.count || 0).toLocaleString('ko-KR')}</strong>
 <span>${unitLabel}</span>
 </div>
 </div>
 `).join('');
 }

 function buildViralFlowRows(flows){
 if(!flows || !flows.length){
 return '<div class="insight-empty">아직 공유 → 방문 흐름이 없습니다.</div>';
 }

 return flows.map((flow) => `
 <div class="insight-flow">
 <div class="insight-flow-line">
 <b>${escapeHtml(flow.sharer || '공유자 미확인')}</b>
 <span class="insight-flow-arrow">→</span>
 <b>${Number(flow.visitCount || 0).toLocaleString('ko-KR')}명 유입</b>
 </div>
 <div class="insight-flow-line" style="color:var(--muted);font-size:12px;">
 ${escapeHtml(flow.targetTitle || flow.targetId || '공유 대상 미확인')}
 </div>
 <div class="insight-flow-line" style="color:var(--muted);font-size:11px;">
 shareId: ${escapeHtml(flow.shareId || '-')}
 </div>
 </div>
 `).join('');
 }

 async function loadShareInsightLogs(){
 const [clickSnap, visitSnap] = await Promise.all([
 getDocs(query(collection(db, SHARE_CLICK_LOGS_COLLECTION), orderBy('createdAt','desc'), limit(500))),
 getDocs(query(collection(db, SHARE_VISIT_LOGS_COLLECTION), orderBy('createdAt','desc'), limit(500)))
 ]);

 return {
 clickLogs: clickSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })),
 visitLogs: visitSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
 };
 }

 function aggregateShareInsights(clickLogs = [], visitLogs = []){
 const shareOpens = clickLogs.filter(log => {
 const event = String(log.event || '');
 const channel = getLogChannel(log);
 return event === 'kakao_share_open' || channel === 'kakao';
 });

 const topSharersMap = new Map();
 shareOpens.forEach(log => {
 const key = log.sharedByUid || log.sharedByLoginId || log.sharedByNickname || 'unknown';
 const row = topSharersMap.get(key) || {
 title: insightSafeText(log.sharedByNickname || log.sharedByLoginId || '공유자 미확인'),
 sub: insightSafeText(log.sharedByRole || log.sharedByLoginId || '계정 정보 없음', ''),
 count: 0
 };
 row.count += 1;
 topSharersMap.set(key, row);
 });

 const visitTargetMap = new Map();
 visitLogs.forEach(log => {
 const type = log.type || log.target || '';
 const key = `${type}:${log.targetId || ''}`;
 if(!log.targetId) return;
 const noticeTitle = type === 'notice'
 ? (state.notices || []).find(item => item.id === log.targetId)?.title
 : (state.benefits || []).find(item => item.id === log.targetId)?.name;
 const row = visitTargetMap.get(key) || {
 title: insightSafeText(noticeTitle || log.targetTitle || log.targetId),
 sub: type === 'notice' ? '공지 유입' : '혜택 유입',
 count: 0
 };
 row.count += 1;
 visitTargetMap.set(key, row);
 });

 const shareTargetMap = new Map();
 shareOpens.forEach(log => {
 const type = log.type || '';
 const key = `${type}:${log.targetId || ''}`;
 if(!log.targetId) return;
 const row = shareTargetMap.get(key) || {
 title: insightSafeText(getLogTargetTitle(log) || log.targetId),
 sub: type === 'notice' ? '공지 공유' : '혜택 공유',
 count: 0
 };
 row.count += 1;
 shareTargetMap.set(key, row);
 });

 const flowMap = new Map();
 shareOpens.forEach(log => {
 const shareId = getLogShareId(log);
 if(!shareId) return;
 flowMap.set(shareId, {
 shareId,
 sharer: insightSafeText(log.sharedByNickname || log.sharedByLoginId || '공유자 미확인'),
 targetId: log.targetId || '',
 targetTitle: insightSafeText(getLogTargetTitle(log) || log.targetId || '공유 대상 미확인'),
 visitCount: 0,
 visitors: new Set()
 });
 });

 visitLogs.forEach(log => {
 const shareId = getLogShareId(log);
 if(!shareId) return;
 const row = flowMap.get(shareId) || {
 shareId,
 sharer: '공유자 미확인',
 targetId: log.targetId || '',
 targetTitle: log.targetId || '공유 대상 미확인',
 visitCount: 0,
 visitors: new Set()
 };
 const visitorKey = log.visitorUid || log.visitorLoginId || log.visitorNickname || log.id || `${log.userAgent || ''}:${log.createdAt?.seconds || ''}`;
 row.visitors.add(visitorKey);
 row.visitCount = row.visitors.size;
 if(!row.targetId && log.targetId) row.targetId = log.targetId;
 flowMap.set(shareId, row);
 });

 const flows = [...flowMap.values()]
 .map(row => ({ ...row, visitors: undefined }))
 .filter(row => row.visitCount > 0)
 .sort((a,b) => (b.visitCount || 0) - (a.visitCount || 0))
 .slice(0, 5);

 const totalShares = shareOpens.length;
 const totalVisits = visitLogs.length;
 const uniqueShareIds = new Set(shareOpens.map(getLogShareId).filter(Boolean)).size;
 const conversionRate = totalShares ? Math.round((totalVisits / totalShares) * 100) : 0;

 return {
 totalShares,
 totalVisits,
 uniqueShareIds,
 conversionRate,
 topSharers: sortTopEntries(topSharersMap, 5),
 topVisitTargets: sortTopEntries(visitTargetMap, 5),
 topShareTargets: sortTopEntries(shareTargetMap, 5),
 flows
 };
 }

 async function renderShareInsights(){
 const wrap = qs('#shareInsightsContent');
 if(!wrap) return;

 if(!isShareInsightAdmin()){
 wrap.innerHTML = `
 <div class="panel empty">
 공유 인사이트는 운영자 전용 메뉴입니다.<br>
 공유자/방문자 정보가 포함될 수 있어 관리자 권한에서만 확인할 수 있습니다.
 </div>
 `;
 qs('#shareInsightUpdatedText') && (qs('#shareInsightUpdatedText').textContent = '운영자 전용');
 return;
 }

 wrap.innerHTML = '<div class="panel loading">공유 정보를 집계하는 중입니다...</div>';

 try{
 const { clickLogs, visitLogs } = await loadShareInsightLogs();
 const data = aggregateShareInsights(clickLogs, visitLogs);

 wrap.innerHTML = `
 <div class="insight-grid">
 <div class="insight-card"><strong>${data.totalShares.toLocaleString('ko-KR')}</strong><span>카카오 공유 실행</span></div>
 <div class="insight-card"><strong>${data.totalVisits.toLocaleString('ko-KR')}</strong><span>공유 링크 실제 유입</span></div>
 <div class="insight-card"><strong>${data.uniqueShareIds.toLocaleString('ko-KR')}</strong><span>고유 공유 링크</span></div>
 <div class="insight-card"><strong>${data.conversionRate}%</strong><span>공유 대비 유입 전환율</span></div>
 </div>

 <div class="panel" style="margin-top:14px;">
 <div class="section-head" style="margin-bottom:8px;"><h3>TOP 공유자 랭킹</h3><small>공유 실행 기준</small></div>
 <div class="insight-list">${buildShareInsightRows(data.topSharers, '회')}</div>
 </div>

 <div class="panel" style="margin-top:14px;">
 <div class="section-head" style="margin-bottom:8px;"><h3>가장 많이 퍼진 공지/혜택</h3><small>실제 유입 기준</small></div>
 <div class="insight-list">${buildShareInsightRows(data.topVisitTargets, '유입')}</div>
 </div>

 <div class="panel" style="margin-top:14px;">
 <div class="section-head" style="margin-bottom:8px;"><h3>가장 많이 공유된 항목</h3><small>공유 실행 기준</small></div>
 <div class="insight-list">${buildShareInsightRows(data.topShareTargets, '공유')}</div>
 </div>

 <div class="panel" style="margin-top:14px;">
 <div class="section-head" style="margin-bottom:8px;"><h3>입주민 바이럴 흐름</h3><small>공유 → 방문</small></div>
 <div class="insight-list">${buildViralFlowRows(data.flows)}</div>
 </div>
 `;

 const now = new Date();
 qs('#shareInsightUpdatedText') && (qs('#shareInsightUpdatedText').textContent = `최근 집계: ${now.toLocaleTimeString('ko-KR', { hour:'2-digit', minute:'2-digit' })}`);
 }catch(error){
 console.warn('공유 인사이트 집계 실패', error);
 wrap.innerHTML = `
 <div class="panel empty">
 공유 인사이트를 불러오지 못했습니다.<br>
 Firestore 규칙에서 운영자에게 share_click_logs / share_visit_logs 읽기 권한이 있는지 확인해 주세요.
 </div>
 `;
 qs('#shareInsightUpdatedText') && (qs('#shareInsightUpdatedText').textContent = '집계 실패');
 }
 }

 function splitBenefitAndDateText(text = ''){
 const raw = String(text || '').trim();
 if(!raw) return { benefit: '', date: '' };

 const dateMatch = raw.match(/(?:등록일\s*)?(\d{4}\.\s*\d{1,2}\.\s*\d{1,2}\.?)/);
 const date = dateMatch ? dateMatch[1].trim() : '';

 let benefit = raw;
 if(dateMatch){
 benefit = raw.slice(0, dateMatch.index).trim();
 }

 benefit = benefit
 .replace(/[·ㆍ]\s*등록일\s*$/g, '')
 .replace(/\s*등록일\s*$/g, '')
 .replace(/[·ㆍ]\s*$/g, '')
 .trim();

 return { benefit, date };
 }

 function getPopularCategory(item = {}){
 return item.category || item.type || item.group || item.kind || '기타';
 }

 function getPopularBenefit(item = {}){
 const direct = item.condition || item.benefit || item.description || item.desc || item.subtitle || '';
 const parsed = splitBenefitAndDateText(direct);
 return parsed.benefit || direct || '혜택 조건은 상세보기에서 확인해 주세요.';
 }

 function getPopularDate(item = {}){
 const raw = getPopularDateRaw(item);
 return raw ? formatDateYmdDot(raw) : '등록일 정보 없음';
 }

 function parseKoreanDateToDate(value = ''){
 const raw = String(value || '').trim();
 const match = raw.match(/(\d{4})[.\-\/년\s]+(\d{1,2})[.\-\/월\s]+(\d{1,2})/);
 if(!match) return null;

 const y = Number(match[1]);
 const m = Number(match[2]);
 const d = Number(match[3]);

 if(!y || !m || !d) return null;
 const date = new Date(y, m - 1, d);
 if(Number.isNaN(date.getTime())) return null;
 return date;
 }

 function formatDateYmdDot(value = ''){
 const date = value instanceof Date ? value : parseKoreanDateToDate(value);
 if(!date) return String(value || '').replace(/^등록일\s*/,'').trim() || '등록일 정보 없음';

 const y = date.getFullYear();
 const m = String(date.getMonth() + 1).padStart(2, '0');
 const d = String(date.getDate()).padStart(2, '0');
 return `${y}.${m}.${d}`;
 }

 function isWithinRecentDays(value = '', days = 7){
 const date = value instanceof Date ? value : parseKoreanDateToDate(value);
 if(!date) return false;

 const now = new Date();
 const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
 const target = new Date(date.getFullYear(), date.getMonth(), date.getDate());
 const diff = start.getTime() - target.getTime();

 return diff >= 0 && diff <= days * 24 * 60 * 60 * 1000;
 }

 function normalizeDateLikeToDate(value){
 if(!value) return null;

 if(value instanceof Date && !Number.isNaN(value.getTime())){
 return value;
 }

 if(typeof value === 'object'){
 if(typeof value.toDate === 'function'){
 const d = value.toDate();
 return d instanceof Date && !Number.isNaN(d.getTime()) ? d : null;
 }

 if(typeof value.seconds === 'number'){
 const d = new Date(value.seconds * 1000);
 return Number.isNaN(d.getTime()) ? null : d;
 }

 if(typeof value._seconds === 'number'){
 const d = new Date(value._seconds * 1000);
 return Number.isNaN(d.getTime()) ? null : d;
 }
 }

 if(typeof value === 'number'){
 const d = new Date(value > 10000000000 ? value : value * 1000);
 return Number.isNaN(d.getTime()) ? null : d;
 }

 return null;
 }

 function getPopularDateCandidate(item = {}){
 const candidates = [
 item.createdAtText,
 item.createdDate,
 item.registeredAtText,
 item.dateText,
 item.registeredDate,
 item.regDate,
 item.createdAt,
 item.registeredAt,
 item.updatedAt,
 item.date
 ];

 for(const value of candidates){
 if(!value) continue;

 const d = normalizeDateLikeToDate(value);
 if(d) return d;

 const str = String(value).replace(/^등록일\s*/, '').trim();
 if(str) return str;
 }

 return '';
 }

 function getPopularDateRaw(item = {}){
 const candidate = getPopularDateCandidate(item);

 if(candidate instanceof Date){
 return candidate;
 }

 if(candidate){
 const str = String(candidate).replace(/^등록일\s*/, '').trim();
 const match = str.match(/(\d{4}[.\-\/년\s]+\d{1,2}[.\-\/월\s]+\d{1,2}\.?)/);
 return match ? match[1].trim() : str;
 }

 const raw =
 item.condition ||
 item.benefit ||
 item.description ||
 item.desc ||
 item.subtitle ||
 item.meta ||
 '';

 const match = String(raw).match(/(?:등록일\s*)?(\d{4}\.\s*\d{1,2}\.\s*\d{1,2}\.?)/);
 return match ? match[1].trim() : '';
 }

 const POPULAR_RANK_SNAPSHOT_KEY = 'myhills_popular_rank_snapshot_v1';

 function getPopularItemKey(item = {}){
 return String(item.id || item.docId || item.name || item.title || '').trim();
 }

 function getPopularPreviousRankMap(){
 try{
 const raw = localStorage.getItem(POPULAR_RANK_SNAPSHOT_KEY);
 const list = raw ? JSON.parse(raw) : [];
 const map = {};
 if(Array.isArray(list)){
 list.forEach((entry) => {
 if(entry && entry.key) map[entry.key] = Number(entry.rank || 0);
 });
 }
 return map;
 }catch(_){
 return {};
 }
 }

 function savePopularRankSnapshot(items = []){
 try{
 const snapshot = items.slice(0, 5).map((item, index) => ({
 key: getPopularItemKey(item),
 rank: index + 1
 })).filter(v => v.key);
 localStorage.setItem(POPULAR_RANK_SNAPSHOT_KEY, JSON.stringify(snapshot));
 }catch(error){
 console.warn('인기 순위 스냅샷 저장 실패', error);
 }
 }

 function getPopularTrendHtml(item = {}, rank = 0, previousRankMap = {}){
 const key = getPopularItemKey(item);
 const prev = key ? Number(previousRankMap[key] || 0) : 0;

 if(!prev) return '<span class="popular-trend same">NEW</span>';
 if(prev > rank) return `<span class="popular-trend up">▲ ${prev - rank}</span>`;
 if(prev < rank) return `<span class="popular-trend down">▼ ${rank - prev}</span>`;
 return '<span class="popular-trend same">━</span>';
 }

 function animatePopularCounts(){
 const els = document.querySelectorAll('.popular-count[data-count]');
 els.forEach((el) => {
 const target = Math.max(0, Number(el.dataset.count || 0));
 const duration = 720;
 const startTime = performance.now();
 const parent = el.closest('.popular-score');
 if(parent) parent.classList.add('bump');

 function tick(now){
 const progress = Math.min(1, (now - startTime) / duration);
 const eased = 1 - Math.pow(1 - progress, 3);
 el.textContent = String(Math.round(target * eased));
 if(progress < 1){
 requestAnimationFrame(tick);
 }else{
 el.textContent = String(target);
 if(parent) setTimeout(() => parent.classList.remove('bump'), 280);
 }
 }

 requestAnimationFrame(tick);
 });
 }

 function renderPopularDateHtml(item = {}){
 const raw = getPopularDateRaw(item);
 const formatted = formatDateYmdDot(raw);
 const isNew = raw && isWithinRecentDays(raw, 7);

 return `
 <span class="popular-date-value ${isNew ? 'is-new' : ''}">
 <span>${escapeHtml(formatted)}</span>
 ${isNew ? '<span class="popular-new-badge">NEW</span>' : ''}
 </span>
 `;
 }

 function splitBenefitParts(text = ''){
 const raw = String(text || '').trim();
 if(!raw) return [];

 return raw
 .split(/\s*[\/·ㆍ]\s*/g)
 .map(v => v.trim())
 .filter(Boolean);
 }

 function isHotBenefitText(text = ''){
 const matches = String(text || '').match(/(\d+)\s*%/g) || [];
 return matches.some(v => Number(String(v).replace(/[^\d]/g, '')) >= 50);
 }

 function renderBenefitPartsHtml(benefitText = ''){
 const parts = splitBenefitParts(benefitText);
 const list = parts.length ? parts : [benefitText || '혜택 조건은 상세보기에서 확인해 주세요.'];

 return `
 <div class="popular-benefit-list">
 ${list.map(part => `
 <div class="popular-benefit-part ${isHotBenefitText(part) ? 'hot' : ''}">
 <span>${escapeHtml(part)}</span>
 </div>
 `).join('')}
 </div>
 `;
 }

 function renderPopularDetail(item = {}){
 const benefit = getPopularBenefit(item);
 const hotClass = isHotBenefitText(benefit) ? ' hot-value' : '';
 const rawDate = getPopularDateRaw(item);
 const isNew = rawDate && isWithinRecentDays(rawDate, 7);

 return `
 <div class="popular-detail">
 <div class="popular-row">
 <div class="label">품목</div>
 <div class="value">${escapeHtml(getPopularCategory(item))}</div>
 </div>
 <div class="popular-row">
 <div class="label">혜택</div>
 <div class="value${hotClass}">${renderBenefitPartsHtml(benefit)}</div>
 </div>
 <div class="popular-row">
 <div class="label">인기 지표</div>
 <div class="value">조회 ${Number(item.detailViewCount || 0).toLocaleString('ko-KR')} · 즐겨찾기 ${Number(item.favoriteCount || 0).toLocaleString('ko-KR')} · 공유 ${Number(item.shareClickCount || 0).toLocaleString('ko-KR')} · 추천 ${Number(item.recommendCount || 0).toLocaleString('ko-KR')} · HOT ${Number(item.hotCount || 0).toLocaleString('ko-KR')}</div>
 </div>
 <div class="popular-row popular-date-row ${isNew ? 'is-new' : ''}">
 <div class="label">등록일</div>
 <div class="value">${renderPopularDateHtml(item)}</div>
 </div>
 </div>
 `;
 }

 function renderHotNowStores(){
 const panel = qs('#hotNowPanel');
 const list = qs('#hotNowList');
 if(!panel || !list) return;

 const items = (state.popularItems || [])
 .filter((item) => Number(item.popularScore || item.score || 0) > 0)
 .slice()
 .sort((a, b) => {
 const hotA = Number(a.shareClickCount || 0) * 5 + Number(a.favoriteCount || 0) * 3 + Number(a.clickCount || 0);
 const hotB = Number(b.shareClickCount || 0) * 5 + Number(b.favoriteCount || 0) * 3 + Number(b.clickCount || 0);
 if(hotB !== hotA) return hotB - hotA;
 return Number(b.popularScore || b.score || 0) - Number(a.popularScore || a.score || 0);
 })
 .slice(0, 3);

 if(!items.length){
 panel.classList.add('hidden');
 list.innerHTML = '';
 return;
 }

 panel.classList.remove('hidden');
 list.innerHTML = items.map((item, index) => `
 <article class="hot-now-item" data-benefit-id="${escapeHtml(item.id)}">
 <div class="hot-now-left">
 <div class="hot-now-rank">${index + 1}</div>
 <div class="hot-now-copy">
 <b>${escapeHtml(item.name || '이름 없는 매장')}</b>
 <small>공유 ${Number(item.shareClickCount || 0).toLocaleString('ko-KR')} · 즐겨찾기 ${Number(item.favoriteCount || 0).toLocaleString('ko-KR')} · 조회 ${Number(item.detailViewCount || 0).toLocaleString('ko-KR')}</small>
 </div>
 </div>
 <div class="hot-now-score">
 <strong>${Number(item.popularScore || item.score || 0).toLocaleString('ko-KR')}</strong>
 <span>인기점수</span>
 </div>
 </article>
 `).join('');

 list.querySelectorAll('.hot-now-item').forEach((el) => {
 const id = el.dataset.benefitId;
 const item = items.find((v) => v.id === id);
 makeKeyboardClickable(el, `인기 혜택 상세 열기: ${item?.name || item?.benefit?.name || getMapMarkerLabel(item)}`);
 el.onclick = () => {
 if(item?.benefit) openDetail(item.benefit);
 };
 });
 }

 function renderPopularTop5(){
 const wrap = qs('#popularList');
 if(!wrap) return;
 wrap.innerHTML = '';
 if(!state.popularItems.length){
 wrap.innerHTML = '<div class="panel empty">아직 집계된 인기 매장이 없습니다.</div>';
 renderHotNowStores();
 return;
 }
 state.popularItems.forEach((item, index) => {
 const rank = index + 1;
 const row = document.createElement('article');
 const motionClass = getPopularRowMotionClass(item);
 row.className = `popular-item rank-${rank} ${motionClass}`.trim();
 row.innerHTML = `
 <div class="popular-rank-wrap">
 ${getRankBadge(rank)}
 ${rank === 1 ? '<span class="best-badge"> BEST</span>' : ''}
 </div>
 <div class="popular-meta">
 <div class="popular-name-row">
 <div class="popular-name">${escapeHtml(item.name || '이름 없는 매장')}</div>
 ${item.trendText ? `<span class="popular-trend ${item.trendClass || 'same'}">${escapeHtml(item.trendText)}</span>` : ''}
 ${item.isShareBest ? '<span class="share-best-badge"><img class="share-best-icon" src="/icons/internal/share-best.svg" alt="" loading="lazy" decoding="async"><span>공유 BEST</span></span>' : ''}
 </div>
 ${rank === 1 ? '<div class="top1-urgent">HOT 지금 클릭이 가장 많은 혜택입니다</div><div class="top1-cta"><button type="button" class="top1-btn">혜택 바로보기</button></div>' : ''}
 ${renderPopularDetail(item)}
 </div>
 <div class="popular-score">
 <strong class="popular-count">0</strong>
 <span>인기점수</span>
 </div>
 `;
 makeKeyboardClickable(row, `인기 매장 상세 열기: ${item.name || getMapMarkerLabel(item)}`);
 row.onclick = () => {
 if(item.benefit){
 openDetail(item.benefit);
 }
 };
 wrap.appendChild(row);
 const scoreTarget = Number(item.popularScore ?? item.score ?? 0);
 const countEl = row.querySelector('.popular-count');
 if(countEl){
   // 인기점수는 0으로 남지 않도록 먼저 확정값을 표시합니다.
   countEl.textContent = scoreTarget.toLocaleString('ko-KR');
   // 애니메이션은 보조 효과로만 실행합니다.
   requestAnimationFrame(() => animatePopularCount(countEl, scoreTarget));
 }
 });
 renderHotNowStores();
 }
 const getVisibleBenefits=()=>state.benefits.filter(isPubliclyVisibleBenefit);
 const getCategoryCounts=()=> {
 const counts = {};
 getVisibleBenefits().forEach(v => {
 const key = normalizeCategory(v.category);
 counts[key] = (counts[key] || 0) + 1;
 });
 return counts;
 };
 const getCategories=()=>['전체',...Object.keys(getCategoryCounts()).sort((a,b)=>a.localeCompare(b,'ko'))];
 function createChips(){
 const el=qs('#chips');
 const counts = getCategoryCounts();
 const total = getVisibleBenefits().length;
 const categories = getCategories();
 if(!categories.includes(state.category)){
 state.category='전체';
 localStorage.setItem(LAST_CATEGORY_KEY,'전체');
 }
 el.innerHTML='';
 categories.forEach(cat=>{
 const b=document.createElement('button');
 b.className=`chip ${state.category===cat?'active':''}`;
 const count = cat === '전체' ? total : (counts[cat] || 0);
 b.innerHTML=`<span class="chip-icon">${getCategoryIcon(cat)}</span><span>${cat} ${count}</span>`;
 b.onclick=()=>{
 state.category=cat;
 localStorage.setItem(LAST_CATEGORY_KEY, cat);
 changeView('benefits');
 };
 el.appendChild(b);
 });
 updateToggle();
 applyChipsState();
 }
 function getFilteredBenefits(mode='normal'){
 const favorites = new Set(getFavorites());
 const radius = state.distanceRadius === 'all' ? null : Number(state.distanceRadius);
 const useRadius = Number.isFinite(radius) && radius > 0;

 const items = getVisibleBenefits().filter(item => {
 const matchCategory = state.category === '전체' || normalizeCategory(item.category) === normalizeCategory(state.category);
 const q = state.keyword.trim().toLowerCase();
 const blob = [item.name,item.category,item.condition,item.priceDetails,item.priceInfo,item.servicePriceText,item.servicePriceDetails,getBenefitDisplayAddress(item),item.zipcode,item.roadAddress,item.jibunAddress,item.detailAddress,item.phone,item.emergencyPhone,item.contact?.emergency,item.stationAccessText,item.transitText,item.stationGuide,item.nearStationText,(item.stations||[]).map(formatStationAccessText).join(' ')].join(' ').toLowerCase();
 const matchKeyword = !q || blob.includes(q);
 const matchFilter = state.filter === 'all' ? true : (item.discountValue >= 15 || item.recommended);
 const matchMode = mode === 'favorite' ? favorites.has(item.id) : true;
 const distance = getItemDistance(item);
 const matchRadius = !useRadius || (Number.isFinite(distance) && distance <= radius);
 return matchCategory && matchKeyword && matchFilter && matchMode && matchRadius;
 });

 if(state.benefitSortMode === 'distance'){
 return items.sort((a,b) => {
 const da = getItemDistance(a);
 const db = getItemDistance(b);
 const va = Number.isFinite(da) ? da : Number.POSITIVE_INFINITY;
 const vb = Number.isFinite(db) ? db : Number.POSITIVE_INFINITY;
 return (va - vb) || a.name.localeCompare(b.name,'ko');
 });
 }

 if(state.benefitSortMode === 'latest'){
 return items.sort((a,b) => (getBenefitCreatedTime(b) - getBenefitCreatedTime(a)) || a.name.localeCompare(b.name,'ko'));
 }

 if(state.benefitSortMode === 'top'){
 return items.sort((a,b) => {
 const ra = getBenefitTopRank(a) || 999;
 const rb = getBenefitTopRank(b) || 999;
 return (ra - rb) || ((b.recommended?1:0)-(a.recommended?1:0)) || (b.discountValue-a.discountValue) || a.name.localeCompare(b.name,'ko');
 });
 }

 return items.sort((a,b)=>((b.recommended?1:0)-(a.recommended?1:0))||(b.discountValue-a.discountValue)||a.name.localeCompare(b.name,'ko'));
 }
 const getBadgeClass=(item)=>{
 if(item.service) return 'badge service';
 const value = Number(item.discountValue || 0);
 if(value >= 50) return 'badge hot';
 if(value >= 30) return 'badge mid';
 if(value >= 15) return 'badge normal';
 return value <= 5 ? 'badge low' : 'badge';
 };
 function cardTemplate(item,isFavorite){
 const distance = getItemDistance(item);
 const distanceTag = Number.isFinite(distance) ? `<span class="tag distance-tag"><img class="upick-svg-icon" src="/icons/internal/walk.svg" alt="" loading="lazy"> ${formatDistance(distance)}</span>` : '';
 const categoryIcon = getCategoryIcon(item.category);
 const favIcon = `<img class="upick-fav-icon-img" src="/icons/internal/${isFavorite ? 'star-fill' : 'star-outline'}.svg" alt="" loading="lazy" decoding="async">`;
 const fullAddress = getBenefitDisplayAddress(item);
 const addressText = fullAddress.length > 20 ? fullAddress.slice(0,20) + '…' : fullAddress;
 const ribbonBadgeHtml = benefitCardRibbonBadgeHtml(item);
 return `${benefitTopBadgeHtml(item)}
 <div class="card-top">
 ${ribbonBadgeHtml}<div class="${getBadgeClass(item)}">${item.discountText}</div>
 <div class="card-info">
 <h4>${item.name}</h4>
 <div class="meta">${item.condition}</div>
 ${benefitStatusChipsHtml(item,{compact:true})}
 </div>
 <div class="list-meta">
 <span class="category-icon-tag" title="${escapeHtml(item.category)}">${categoryIcon}</span>
 ${distanceTag}
 </div>
 </div>
 <div class="card-tags">
 <span class="tag category-text-tag">${item.category}</span>
 ${naverServiceBadgesHtml(item)}
 ${benefitOperationBadgesHtml(item)}
 ${distanceTag}

 </div>
 <button class="fav-icon-btn fav-btn ${isFavorite ? 'is-favorite' : ''}" type="button" data-favorite-id="${item.id}" aria-pressed="${isFavorite ? 'true' : 'false'}" aria-label="${isFavorite ? '즐겨찾기 해제' : '즐겨찾기 추가'}">${favIcon}</button>
 <div class="actions"><button class="btn btn-soft fav-btn" type="button" data-favorite-id="${item.id}" aria-pressed="${isFavorite ? 'true' : 'false'}" aria-label="${isFavorite ? '즐겨찾기 해제' : '즐겨찾기 추가'}">${favIcon}</button></div>`;
 }
 function updateBenefitViewModeButtons(){
 const isList = state.benefitViewMode !== 'card';
 qs('#benefitListModeBtn')?.classList.toggle('active', isList);
 qs('#benefitCardModeBtn')?.classList.toggle('active', !isList);
 }
 function setBenefitViewMode(mode){
 state.benefitViewMode = mode === 'card' ? 'card' : 'list';
 try{localStorage.setItem('benefitViewMode', state.benefitViewMode);}catch(_){}
 renderHome();
 }
 function renderList(target,items){
 const wrap=qs(target),favorites=new Set(getFavorites());
 if(!wrap) return;
 wrap.innerHTML='';
 const isBenefitMain = target === '#cardList';
 if(isBenefitMain){
 wrap.classList.toggle('view-list', state.benefitViewMode !== 'card');
 wrap.classList.toggle('view-card', state.benefitViewMode === 'card');
 updateBenefitViewModeButtons();
 }
 if(target === '#favoriteList'){
 wrap.classList.add('view-list');
 wrap.classList.remove('view-card');
 }
 if(!items.length){
 const emptyMessage = target === '#favoriteList'
   ? '아직 즐겨찾기한 혜택이 없어요.<br><small>마음에 드는 혜택의 별표를 누르면 이곳에서 다시 볼 수 있습니다.</small>'
   : '현재 조건에 맞는 혜택을 찾지 못했어요.<br><small>검색어나 필터를 조금 바꿔 다시 확인해 주세요.</small>';
 wrap.innerHTML='<div class="panel empty">'+emptyMessage+'</div>';
 return;
 }
 items.forEach(item=>{
 const card=document.createElement('article');
 const topRank=getBenefitTopRank(item);
 card.className=`card ${benefitCardStatusClass(item)} ${topRank ? `top-rank-${topRank}` : ''}`;
 card.innerHTML=cardTemplate(item,favorites.has(item.id));
 makeKeyboardClickable(card, `혜택 상세 열기: ${item.name || getMapMarkerLabel(item)}`);
 card.onclick=()=>{increaseStat(item.id, item.name, 'cardClickCount');logBenefitEvent(item.id, 'card_click');openDetail(item);};
 card.querySelector('.detail-btn')?.addEventListener('click',(e)=>{e.stopPropagation();openDetail(item);});
 card.querySelectorAll('.fav-btn').forEach((btn)=>{
 btn.addEventListener('click',(e)=>{e.stopPropagation();toggleFavorite(item.id, item.name);});
 });
 wrap.appendChild(card);
 });
 }

 function closeFilterPopovers(){
 qsa('.filter-popover').forEach(pop => {
 pop.classList.add('hidden');
 pop.classList.remove('show');
 });
 qs('#sortPopoverBtn')?.setAttribute('aria-expanded','false');
 qs('#radiusPopoverBtn')?.setAttribute('aria-expanded','false');
 }
 function toggleFilterPopover(type){
 const target = type === 'radius' ? qs('#radiusPopover') : qs('#sortPopover');
 const other = type === 'radius' ? qs('#sortPopover') : qs('#radiusPopover');
 const btn = type === 'radius' ? qs('#radiusPopoverBtn') : qs('#sortPopoverBtn');
 const otherBtn = type === 'radius' ? qs('#sortPopoverBtn') : qs('#radiusPopoverBtn');
 if(!target || !btn) return;
 const willOpen = target.classList.contains('hidden');
 other?.classList.add('hidden');
 other?.classList.remove('show');
 otherBtn?.setAttribute('aria-expanded','false');
 target.classList.toggle('hidden', !willOpen);
 target.classList.toggle('show', willOpen);
 btn.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
 }
 function updateFilterIconLabels(){
 const sortMap = { default:'↕ 추천', latest:'↕ 최신', top:'↕ TOP', distance:'↕ 가까운순' };
 const radiusMap = { all:'전체', 500:'500m', 1000:'1km', 3000:'3km' };
 const sortValue = state.benefitSortMode || 'default';
 const radiusValue = state.distanceRadius || 'all';
 const sortBtn = qs('#sortPopoverBtn');
 const radiusBtn = qs('#radiusPopoverBtn');
 if(sortBtn){
 sortBtn.textContent = sortMap[sortValue] || '↕ 정렬';
 sortBtn.classList.toggle('active', sortValue !== 'default');
 }
 if(radiusBtn){
 radiusBtn.textContent = radiusMap[radiusValue] || '반경';
 radiusBtn.classList.toggle('active', radiusValue !== 'all');
 }
 qsa('[data-sort-value]').forEach(btn => btn.classList.toggle('active', btn.dataset.sortValue === sortValue));
 qsa('[data-radius-value]').forEach(btn => btn.classList.toggle('active', btn.dataset.radiusValue === radiusValue));
 }
 async function applySortPopoverValue(value){
 state.benefitSortMode = value || 'default';
 if(qs('#benefitSortSelect')) qs('#benefitSortSelect').value = state.benefitSortMode;
 updateFilterIconLabels();
 closeFilterPopovers();
 renderAll();
 setTimeout(setupBenefitFilterFixed, 80);
 await ensureBenefitDistances();
 updateFilterIconLabels();
 renderAll();
 setTimeout(setupBenefitFilterFixed, 80);
 }
 async function applyRadiusPopoverValue(value){
 state.distanceRadius = value || 'all';
 if(qs('#distanceRadiusSelect')) qs('#distanceRadiusSelect').value = state.distanceRadius;
 updateFilterIconLabels();
 closeFilterPopovers();
 renderAll();
 setTimeout(setupBenefitFilterFixed, 80);
 await ensureBenefitDistances();
 updateFilterIconLabels();
 renderAll();
 setTimeout(setupBenefitFilterFixed, 80);
 }
 function bindFilterIconPopovers(){
 if(bindFilterIconPopovers._bound){
 updateFilterIconLabels();
 return;
 }
 bindFilterIconPopovers._bound = true;
 document.addEventListener('click', closeFilterPopovers);
 qs('#sortPopoverBtn')?.addEventListener('click', (e)=>{ e.preventDefault(); e.stopPropagation(); toggleFilterPopover('sort'); });
 qs('#radiusPopoverBtn')?.addEventListener('click', (e)=>{ e.preventDefault(); e.stopPropagation(); toggleFilterPopover('radius'); });
 qsa('[data-sort-value]').forEach(btn => btn.addEventListener('click', (e)=>{ e.preventDefault(); e.stopPropagation(); applySortPopoverValue(btn.dataset.sortValue); }));
 qsa('[data-radius-value]').forEach(btn => btn.addEventListener('click', (e)=>{ e.preventDefault(); e.stopPropagation(); applyRadiusPopoverValue(btn.dataset.radiusValue); }));
 updateFilterIconLabels();
 }

 let benefitStickyBaseTop = 0;
 function setupBenefitFilterFixed(){
 const filter = qs('#view-benefits .filter-sticky');
 if(!filter) return;
 let placeholder = qs('#benefitFilterStickyPlaceholder');
 if(!placeholder){
 placeholder = document.createElement('div');
 placeholder.id = 'benefitFilterStickyPlaceholder';
 placeholder.className = 'filter-sticky-placeholder';
 filter.parentNode.insertBefore(placeholder, filter);
 }

 const measure = () => {
 filter.classList.remove('is-fixed');
 placeholder.classList.remove('active');
 placeholder.style.height = '0px';
 const rect = filter.getBoundingClientRect();
 benefitStickyBaseTop = rect.top + window.scrollY;
 };

 const update = () => {
 if(state.view !== 'benefits'){
 filter.classList.remove('is-fixed');
 placeholder.classList.remove('active');
 return;
 }
 const shouldFix = window.scrollY > benefitStickyBaseTop;
 if(shouldFix){
 placeholder.style.height = filter.offsetHeight + 'px';
 placeholder.classList.add('active');
 filter.classList.add('is-fixed');
 }else{
 filter.classList.remove('is-fixed');
 placeholder.classList.remove('active');
 placeholder.style.height = '0px';
 }
 };

 setTimeout(() => { measure(); update(); }, 80);
 window.removeEventListener('scroll', setupBenefitFilterFixed._scrollHandler || (()=>{}));
 window.removeEventListener('resize', setupBenefitFilterFixed._resizeHandler || (()=>{}));
 setupBenefitFilterFixed._scrollHandler = update;
 setupBenefitFilterFixed._resizeHandler = () => { measure(); update(); };
 window.addEventListener('scroll', setupBenefitFilterFixed._scrollHandler, { passive:true });
 window.addEventListener('resize', setupBenefitFilterFixed._resizeHandler);
 }

 function toDateFromTimestamp(value){
 try{
 if(value?.toDate) return value.toDate();
 if(value instanceof Date) return value;
 if(typeof value === 'string' && value) return new Date(value);
 }catch(error){}
 return null;
 }
 function pad2(value){ return String(value).padStart(2,'0'); }
 function todayInputValue(){
 const d = new Date();
 return `${d.getFullYear()}-${pad2(d.getMonth()+1)}-${pad2(d.getDate())}`;
 }
 function defaultVisitTimeValue(){
 const d = new Date(Date.now() + 60 * 60 * 1000);
 return `${pad2(d.getHours())}:${pad2(Math.ceil(d.getMinutes()/10)*10 % 60)}`;
 }
 function formatDateTimeKo(date){
 if(!date) return '-';
 try{
 return date.toLocaleString('ko-KR', { month:'2-digit', day:'2-digit', hour:'2-digit', minute:'2-digit' });
 }catch(error){ return '-'; }
 }
 function formatDateKo(date){
 if(!date) return '-';
 try{return date.toLocaleDateString('ko-KR', { year:'numeric', month:'2-digit', day:'2-digit' });}catch(error){return '-';}
 }
 function normalizeReservation(data={}, id=''){
 return {
 id,
 uid:String(data.uid || ''),
 benefitId:String(data.benefitId || ''),
 storeName:String(data.storeName || '혜택 매장').trim(),
 category:String(data.category || '').trim(),
 phone:String(data.phone || '').trim(),
 address:String(data.address || '').trim(),
 discountText:String(data.discountText || '').trim(),
 visitAt:data.visitAt || null,
 notifyAt:data.notifyAt || null,
 notifyBeforeMinutes:Number(data.notifyBeforeMinutes || 30),
 memo:String(data.memo || '').trim(),
 status:String(data.status || 'scheduled'),
 createdAt:data.createdAt || null,
 updatedAt:data.updatedAt || null,
 notifiedAt:data.notifiedAt || null,
 localNotifiedAt:data.localNotifiedAt || null
 };
 }
 function reservationStatusMeta(item={}){
 if(item.status === 'cancelled') return { text:'취소됨', cls:'cancelled' };
 if(item.status === 'sent' || item.notifiedAt) return { text:'알림 완료', cls:'sent' };
 const notifyAt = toDateFromTimestamp(item.notifyAt);
 if(notifyAt && notifyAt.getTime() <= Date.now()) return { text:'알림 대기', cls:'' };
 return { text:'예약됨', cls:'' };
 }
 function getReservationCounts(){
 const active = state.calendarReservations.filter(v => v.status !== 'cancelled');
 const now = new Date();
 const todayKey = `${now.getFullYear()}-${pad2(now.getMonth()+1)}-${pad2(now.getDate())}`;
 const today = active.filter(v => {
 const d = toDateFromTimestamp(v.visitAt);
 return d && `${d.getFullYear()}-${pad2(d.getMonth()+1)}-${pad2(d.getDate())}` === todayKey;
 }).length;
 const upcoming = active.filter(v => {
 const n = toDateFromTimestamp(v.notifyAt);
 return n && n.getTime() >= Date.now();
 }).length;
 return { total:active.length, today, upcoming };
 }
 const calendarUiState = {
 mode: 'month',
 cursorDate: new Date(),
 selectedDateKey: '',
 dayModalDateKey: '',
 focusAfterModalDateKey: ''
 };
 function cloneDateOnly(date){
 const d = date instanceof Date ? date : new Date();
 return new Date(d.getFullYear(), d.getMonth(), d.getDate());
 }
 function dateKeyFromDate(date){
 if(!(date instanceof Date) || Number.isNaN(date.getTime())) return '';
 return `${date.getFullYear()}-${pad2(date.getMonth()+1)}-${pad2(date.getDate())}`;
 }
 function dateFromKey(dateKey){
 const parts = String(dateKey || '').split('-').map(Number);
 if(parts.length !== 3 || parts.some(v => !Number.isFinite(v))) return cloneDateOnly(new Date());
 return new Date(parts[0], parts[1]-1, parts[2]);
 }
 function addDays(date, offset){
 const d = cloneDateOnly(date);
 d.setDate(d.getDate() + Number(offset || 0));
 return d;
 }
 function startOfWeek(date){
 const d = cloneDateOnly(date);
 d.setDate(d.getDate() - d.getDay());
 return d;
 }
 function formatCalendarTitle(date, mode){
 const d = cloneDateOnly(date);
 if(mode === 'month') return `${d.getFullYear()}년 ${d.getMonth()+1}월`;
 if(mode === 'week'){
 const start = startOfWeek(d);
 const end = addDays(start, 6);
 return `${start.getFullYear()}. ${pad2(start.getMonth()+1)}. ${pad2(start.getDate())} ~ ${end.getFullYear()}. ${pad2(end.getMonth()+1)}. ${pad2(end.getDate())}`;
 }
 return formatCalendarDayTitle(dateKeyFromDate(d));
 }
 function formatCalendarDayTitle(dateKey){
 const d = dateFromKey(dateKey);
 const dayNames = ['일','월','화','수','목','금','토'];
 return `${d.getFullYear()}. ${pad2(d.getMonth()+1)}. ${pad2(d.getDate())}. (${dayNames[d.getDay()]})`;
 }
 function getReservationVisitDateKey(item={}){
 const visitAt = toDateFromTimestamp(item.visitAt);
 return visitAt ? dateKeyFromDate(visitAt) : '';
 }
 function getReservationsByDateKey(dateKey){
 return state.calendarReservations
 .filter(item => item.status !== 'cancelled' && getReservationVisitDateKey(item) === dateKey)
 .sort((a,b) => (toDateFromTimestamp(a.visitAt)?.getTime() || 0) - (toDateFromTimestamp(b.visitAt)?.getTime() || 0));
 }
 function ensureCalendarSelectedDate(){
 if(!calendarUiState.selectedDateKey) calendarUiState.selectedDateKey = dateKeyFromDate(new Date());
 if(!(calendarUiState.cursorDate instanceof Date) || Number.isNaN(calendarUiState.cursorDate.getTime())){
 calendarUiState.cursorDate = dateFromKey(calendarUiState.selectedDateKey);
 }
 }
 function calendarItemHtml(item, options={}){
 const status = reservationStatusMeta(item);
 const visitAt = toDateFromTimestamp(item.visitAt);
 const notifyAt = toDateFromTimestamp(item.notifyAt);
 const clickable = options.clickable ? ` data-calendar-date-card="${escapeAttr(getReservationVisitDateKey(item))}"` : '';
 return `
 <article class="calendar-item ${escapeAttr(status.cls)}" data-calendar-id="${escapeAttr(item.id)}"${clickable}>
 <div class="calendar-item-head">
 <div class="calendar-item-title">
 <strong>${escapeHtml(item.storeName)}</strong>
 <span>${escapeHtml(item.category || '혜택 매장')} ${item.discountText ? '· ' + escapeHtml(item.discountText) : ''}</span>
 </div>
 <span class="calendar-status ${escapeAttr(status.cls)}">${escapeHtml(status.text)}</span>
 </div>
 <div class="calendar-info-grid">
 <div class="calendar-info"><small>방문 예정</small><b>${escapeHtml(formatDateTimeKo(visitAt))}</b></div>
 <div class="calendar-info"><small>알림 시간</small><b>${escapeHtml(formatDateTimeKo(notifyAt))}</b></div>
 <div class="calendar-info"><small>전화번호</small><b>${escapeHtml(item.phone || '미등록')}</b></div>
 <div class="calendar-info"><small>주소</small><b>${escapeHtml(getBenefitDisplayAddress(item) || '미등록')}</b></div>
 </div>
 ${item.memo ? `<div class="calendar-info"><small>메모</small><b>${escapeHtml(item.memo)}</b></div>` : ''}
 <div class="calendar-item-actions">
 ${item.phone ? `<a class="btn btn-primary" href="tel:${escapeAttr(item.phone)}">전화하기</a>` : ''}
 ${item.benefitId ? `<button class="btn btn-soft" type="button" data-calendar-open-benefit="${escapeAttr(item.benefitId)}">혜택 상세</button>` : ''}
 ${item.status !== 'cancelled' ? `<button class="btn btn-soft" type="button" data-calendar-cancel="${escapeAttr(item.id)}">알림 취소</button>` : ''}
 </div>
 </article>
 `;
 }
 function bindCalendarReservationActions(scope=document){
 scope.querySelectorAll?.('[data-calendar-open-benefit]')?.forEach(btn => {
 if(btn.dataset.boundCalendarOpen === '1') return;
 btn.dataset.boundCalendarOpen = '1';
 btn.addEventListener('click', (event) => {
 event.preventDefault();
 event.stopPropagation();
 if(typeof event.stopImmediatePropagation === 'function') event.stopImmediatePropagation();
 const item = state.benefits.find(v => v.id === btn.dataset.calendarOpenBenefit);
 if(!item){
   openModalAlert('현재 혜택 목록에서 해당 매장을 찾지 못했습니다.');
   return;
 }
 const dayModal = qs('#calendarDayModal');
 const openBenefitDetail = () => {
   const detailModal = qs('#detailModal');
   const shouldStackOverDay = !!(dayModal && isLayerOpenLike(dayModal));
   try{
     if(shouldStackOverDay && detailModal){
       detailModal.classList.add('upick-over-calendar-day');
       detailModal.dataset.openedFromCalendarDay = '1';
     }
   }catch(_){}
   openDetail(item);
   try{
     if(shouldStackOverDay && detailModal){
       requestAnimationFrame(() => {
         detailModal.classList.add('upick-over-calendar-day');
         detailModal.dataset.openedFromCalendarDay = '1';
       });
     }
   }catch(_){}
 };
 // 저장 날짜 팝업은 그대로 유지하고, 혜택 상세만 그 위 레이어로 띄웁니다.
 // 사용자가 혜택 상세를 닫으면 같은 날짜 팝업에서 다른 알림을 바로 이어서 확인할 수 있습니다.
 openBenefitDetail();
 });
 });
 scope.querySelectorAll?.('[data-calendar-cancel]')?.forEach(btn => {
 if(btn.dataset.boundCalendarCancel === '1') return;
 btn.dataset.boundCalendarCancel = '1';
 btn.addEventListener('click', (event) => {
 event.stopPropagation();
 cancelCalendarReservation(btn.dataset.calendarCancel);
 });
 });
 }
 function renderCalendarMonthBoard(board){
 const cursor = cloneDateOnly(calendarUiState.cursorDate);
 const first = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
 const start = addDays(first, -first.getDay());
 const todayKey = dateKeyFromDate(new Date());
 const selected = calendarUiState.selectedDateKey;
 const rows = [];
 for(let i=0;i<42;i++){
 const d = addDays(start, i);
 const key = dateKeyFromDate(d);
 const items = getReservationsByDateKey(key);
 const dots = items.slice(0,3).map(() => '<span class="calendar-dot"></span>').join('');
 const more = items.length > 3 ? `<span class="calendar-more">+${items.length - 3}</span>` : (items.length ? `<span class="calendar-more">${items.length}건</span>` : '');
 const classes = [
 'calendar-date-cell',
 d.getMonth() !== cursor.getMonth() ? 'other-month' : '',
 key === todayKey ? 'today' : '',
 key === selected ? 'selected' : ''
 ].filter(Boolean).join(' ');
 rows.push(`<button class="${classes}" type="button" data-calendar-date="${escapeAttr(key)}"><span class="calendar-date-num">${d.getDate()}</span><span class="calendar-dots">${dots}</span>${more}</button>`);
 }
 board.innerHTML = `<div class="calendar-weekdays"><span>일</span><span>월</span><span>화</span><span>수</span><span>목</span><span>금</span><span>토</span></div><div class="calendar-month-grid">${rows.join('')}</div>`;
 }
 function renderCalendarWeekBoard(board){
 const start = startOfWeek(calendarUiState.cursorDate);
 const todayKey = dateKeyFromDate(new Date());
 const selected = calendarUiState.selectedDateKey;
 const cards = [];
 for(let i=0;i<7;i++){
 const d = addDays(start, i);
 const key = dateKeyFromDate(d);
 const items = getReservationsByDateKey(key);
 const first = items[0];
 const classes = ['calendar-week-card', key === todayKey ? 'today' : '', key === selected ? 'selected' : ''].filter(Boolean).join(' ');
 cards.push(`<button class="${classes}" type="button" data-calendar-date="${escapeAttr(key)}"><span class="calendar-week-date"><strong>${formatCalendarDayTitle(key)}</strong></span><span class="calendar-week-summary">${items.length ? `${items.length}건 · ${escapeHtml(first.storeName)}` : '예약 없음'}</span></button>`);
 }
 board.innerHTML = `<div class="calendar-week-grid">${cards.join('')}</div>`;
 }
 function renderCalendarDayBoard(board){
 const key = calendarUiState.selectedDateKey || dateKeyFromDate(calendarUiState.cursorDate);
 const items = getReservationsByDateKey(key);
 board.innerHTML = `<div class="calendar-day-compact" data-calendar-date="${escapeAttr(key)}"><div><strong>${formatCalendarDayTitle(key)} 일정</strong><p>${items.length ? `${items.length}건의 방문 일정이 있습니다. 날짜를 눌러 자세히 확인해 보세요.` : '선택한 날짜에 등록된 예약이 없습니다.'}</p></div><button class="calendar-open-day-btn" type="button" data-calendar-date="${escapeAttr(key)}">방문 일정 보기</button></div>`;
 }
 function renderCalendarVisualBoard(){
 const board = qs('#calendarVisualBoard');
 if(!board) return;
 ensureCalendarSelectedDate();
 if(qs('#calendarTitleBtn')) qs('#calendarTitleBtn').textContent = formatCalendarTitle(calendarUiState.cursorDate, calendarUiState.mode);
 qsa('[data-calendar-mode]').forEach(btn => btn.classList.toggle('active', btn.dataset.calendarMode === calendarUiState.mode));
 if(calendarUiState.mode === 'week') renderCalendarWeekBoard(board);
 else if(calendarUiState.mode === 'day') renderCalendarDayBoard(board);
 else renderCalendarMonthBoard(board);
 qsa('[data-calendar-date]').forEach(btn => {
 btn.addEventListener('pointerdown', () => { window.__upickCalendarPointerScrollSnapshot = getCalendarScrollSnapshot(); }, {passive:true});
 btn.addEventListener('click', (event) => {
  event.preventDefault();
  window.__upickCalendarPointerScrollSnapshot = window.__upickCalendarPointerScrollSnapshot || getCalendarScrollSnapshot();
  openCalendarDayModal(btn.dataset.calendarDate);
 });
});
 qsa('[data-calendar-date-card]').forEach(card => card.addEventListener('click', (event) => {
 if(event.target.closest('button,a')) return;
 event.preventDefault();
 window.__upickCalendarPointerScrollSnapshot = getCalendarScrollSnapshot();
 openCalendarDayModal(card.dataset.calendarDateCard);
 }));
 bindCalendarReservationActions(board);
 }
 function renderSelectedCalendarList(){
 const wrap = qs('#calendarReservationList');
 const head = qs('#calendarSelectedHead');
 if(head) head.innerHTML = '';
 if(wrap) wrap.innerHTML = '';
 }
 function renderCalendarReservations(){
 const counts = getReservationCounts();
 if(qs('#calendarTotalCount')) qs('#calendarTotalCount').textContent = counts.total;
 if(qs('#calendarTodayCount')) qs('#calendarTodayCount').textContent = counts.today;
 if(qs('#calendarUpcomingCount')) qs('#calendarUpcomingCount').textContent = counts.upcoming;
 ensureCalendarSelectedDate();
 renderCalendarVisualBoard();
 renderSelectedCalendarList();
 }
 function changeCalendarMode(mode){
 if(!['month','week','day'].includes(mode)) return;
 calendarUiState.mode = mode;
 calendarUiState.cursorDate = dateFromKey(calendarUiState.selectedDateKey || dateKeyFromDate(new Date()));
 renderCalendarReservations();
 }
 function blurCalendarActiveElement(){
 try{
 const active = document.activeElement;
 if(active && typeof active.blur === 'function') active.blur();
 }catch(error){}
 }
 function preserveCalendarScroll(callback){
 const x = window.scrollX || 0;
 const y = window.scrollY || 0;
 blurCalendarActiveElement();
 callback?.();
 requestAnimationFrame(() => window.scrollTo(x, y));
 setTimeout(() => window.scrollTo(x, y), 40);
 }
 function moveCalendarView(offset){
 preserveCalendarScroll(() => {
 ensureCalendarSelectedDate();
 const d = cloneDateOnly(calendarUiState.cursorDate);
 if(calendarUiState.mode === 'month') d.setMonth(d.getMonth() + offset);
 else if(calendarUiState.mode === 'week') d.setDate(d.getDate() + offset * 7);
 else d.setDate(d.getDate() + offset);
 calendarUiState.cursorDate = d;
 calendarUiState.selectedDateKey = dateKeyFromDate(d);
 renderCalendarReservations();
 focusCalendarDate(calendarUiState.selectedDateKey, { scroll:false });
 });
 }
 function goCalendarToday(){
 preserveCalendarScroll(() => {
 const today = cloneDateOnly(new Date());
 calendarUiState.cursorDate = today;
 calendarUiState.selectedDateKey = dateKeyFromDate(today);
 renderCalendarReservations();
 focusCalendarDate(calendarUiState.selectedDateKey, { scroll:false });
 });
 }
 function openCalendarMainDatePicker(){
 const picker = qs('#calendarMainDatePicker');
 if(!picker) return;
 blurCalendarActiveElement();
 picker.value = calendarUiState.selectedDateKey || dateKeyFromDate(calendarUiState.cursorDate || new Date());
 if(typeof picker.showPicker === 'function') picker.showPicker();
 else picker.click();
 }
 function moveCalendarToDate(dateKey){
 if(!dateKey) return;
 preserveCalendarScroll(() => {
 const d = dateFromKey(dateKey);
 calendarUiState.cursorDate = d;
 calendarUiState.selectedDateKey = dateKeyFromDate(d);
 renderCalendarReservations();
 focusCalendarDate(calendarUiState.selectedDateKey, { scroll:false });
 });
 }
 function focusCalendarDate(dateKey, options={}){
 setTimeout(() => {
 const el = document.querySelector(`[data-calendar-date="${CSS.escape(dateKey)}"]`) || document.querySelector(`[data-calendar-date-card="${CSS.escape(dateKey)}"]`);
 if(!el) return;
 if(options.scroll !== false) el.scrollIntoView({ behavior:'smooth', block:'center' });
 try{
  if(typeof el.focus === 'function') el.focus({ preventScroll:true });
 }catch(_){
  try{ if(typeof el.focus === 'function') el.focus(); }catch(__){}
 }
 el.classList.add('focus-highlight');
 setTimeout(() => el.classList.remove('focus-highlight'), 1100);
 }, Number.isFinite(Number(options.delay)) ? Number(options.delay) : 80);
 }
 function getCalendarScrollSnapshot(){
 const nodes = [window, document.documentElement, document.body, qs('#mainContent'), qs('.app'), qs('#view-calendar')].filter(Boolean);
 const seen = new Set();
 return nodes.filter((node) => {
  if(seen.has(node)) return false;
  seen.add(node);
  return true;
 }).map((node) => ({
  node,
  x: node === window ? (window.scrollX || window.pageXOffset || 0) : (node.scrollLeft || 0),
  y: node === window ? (window.scrollY || window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0) : (node.scrollTop || 0)
 }));
 }
 function restoreCalendarScrollSnapshot(snapshot){
 if(!Array.isArray(snapshot)) return;
 snapshot.forEach(({node,x,y}) => {
  try{
   if(node === window) window.scrollTo(Number(x)||0, Math.max(0, Number(y)||0));
   else{ node.scrollLeft = Number(x)||0; node.scrollTop = Math.max(0, Number(y)||0); }
  }catch(_){}
 });
 }
 function holdCalendarScrollSnapshot(snapshot, duration = 1100){
 const start = Date.now();
 function restore(){
  restoreCalendarScrollSnapshot(snapshot);
  if(Date.now() - start < duration) requestAnimationFrame(restore);
 }
 restore();
 requestAnimationFrame(restore);
 [0, 16, 40, 90, 160, 260, 420, 700, 1000].forEach((delay) => setTimeout(restore, delay));
 }
 function holdCalendarPageScroll(x, y, duration = 900){
 const snapshot = getCalendarScrollSnapshot();
 if(snapshot.length){
  snapshot[0].x = Number.isFinite(Number(x)) ? Number(x) : snapshot[0].x;
  snapshot[0].y = Math.max(0, Number.isFinite(Number(y)) ? Number(y) : snapshot[0].y);
 }
 holdCalendarScrollSnapshot(snapshot, duration);
 }
 function openCalendarDayModal(dateKey){
 if(!dateKey) return;
 const savedSnapshot = window.__upickCalendarPointerScrollSnapshot || getCalendarScrollSnapshot();
 const pageX = savedSnapshot?.[0]?.x ?? (window.scrollX || window.pageXOffset || 0);
 const pageY = savedSnapshot?.[0]?.y ?? (window.scrollY || window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0);
 blurCalendarActiveElement();
 holdCalendarScrollSnapshot(savedSnapshot, 80);
 calendarUiState.dayModalDateKey = dateKey;
 calendarUiState.focusAfterModalDateKey = dateKey;
 renderCalendarDayModal();
 const modal = qs('#calendarDayModal');
 if(!modal) return;
 if(modal.open) closeDialogSafe(modal);
 openDialogSafe(modal, { initialFocusSelector:'#calendarDayCloseBtn' });
 try{ window.__upickHardScrollFreeze?.lock?.('calendar-day-modal'); }catch(_){}
 holdCalendarScrollSnapshot(savedSnapshot, 1400);
 holdCalendarPageScroll(pageX, pageY, 1400);
 }
 function moveCalendarDayModal(offset){
 const d = addDays(dateFromKey(calendarUiState.dayModalDateKey || calendarUiState.selectedDateKey), offset);
 calendarUiState.dayModalDateKey = dateKeyFromDate(d);
 calendarUiState.focusAfterModalDateKey = calendarUiState.dayModalDateKey;
 renderCalendarDayModal();
 }
 
/* ===== 캘린더 공통 팝업 날짜 제목: 연도 포함 ===== */
function formatCalendarDayModalTitle(dateKey){
 const d = (typeof parseDateKey === "function") ? parseDateKey(dateKey) : new Date(String(dateKey || "") + "T00:00:00");
 if (!d || Number.isNaN(d.getTime())) return String(dateKey || "");
 const days = ["일","월","화","수","목","금","토"];
 const yyyy = d.getFullYear();
 const mm = String(d.getMonth() + 1).padStart(2, "0");
 const dd = String(d.getDate()).padStart(2, "0");
 return `${yyyy}. ${mm}. ${dd}. (${days[d.getDay()]})`;
}

function enforceCalendarDayModalTitleYear(){
 const titleEl =
 document.getElementById("calendarDayModalTitle") ||
 document.querySelector("#calendarDayModal .calendar-day-modal-title") ||
 document.querySelector("#calendarDayModal [data-calendar-day-modal-title]");
 const dateKey =
 window.calendarDayModalDateKey ||
 (typeof calendarDayModalDateKey !== "undefined" ? calendarDayModalDateKey : "") ||
 (typeof selectedCalendarDateKey !== "undefined" ? selectedCalendarDateKey : "");
 if (titleEl && dateKey) titleEl.textContent = formatCalendarDayModalTitle(dateKey);
}

function renderCalendarDayModal(){
 const key = calendarUiState.dayModalDateKey || dateKeyFromDate(new Date());
 const items = getReservationsByDateKey(key);
 const title = qs('#calendarDayDateBtn');
 const list = qs('#calendarDayModalList');
 const picker = qs('#calendarDayDatePicker');
 if(title) title.textContent = formatCalendarDayTitle(key);
 if(picker) picker.value = key;
 if(!list) return;
 list.innerHTML = items.length ? items.map(item => calendarItemHtml(item)).join('') : '<div class="calendar-empty">해당 날짜에 등록된 예약이 없습니다.</div>';
 list.scrollTop = 0;
 bindCalendarReservationActions(list);
 
 enforceCalendarDayModalTitleYear();
}
 function releaseCalendarDayModalScrollLock(){
 const modal = qs('#calendarDayModal');
 try{ window.__upickHardScrollFreeze?.unlock?.('calendar-day-modal'); }catch(_){}
 const sync = () => {
  try{ window.__upickSyncModalScrollLock?.(); }catch(_){}
  try{ window.DuLayerStackManager?.requestSync?.(); }catch(_){}
  try{ document.dispatchEvent(new CustomEvent('upick:layer-closed', { detail:{ layer: modal, source:'calendar-day-modal' } })); }catch(_){}
  const stillOpen = !!document.querySelector([
   'dialog[open]',
   '.du-layer.show',
   '.du-layer[open]',
   '.du-layer[aria-hidden="false"]',
   '.upick-div-dialog.show',
   '.upick-div-modal.show',
   '.sheet-modal.show',
   '.app-alert.show'
  ].join(','));
  if(!stillOpen){
   try{ window.__upickHardScrollFreeze?.forceUnlock?.(); }catch(_){}
   document.documentElement.classList.remove('upick-layer-scroll-lock','upick-modal-scroll-event-lock','upick-modal-open','upick-alert-open');
   document.body.classList.remove('upick-layer-scroll-lock','upick-modal-scroll-event-lock','upick-modal-open','upick-alert-open');
  }
 };
 sync();
 [0, 40, 120, 280, 520].forEach((delay) => setTimeout(sync, delay));
 }
 let calendarDayModalCloseFocusRunning = false;
 function closeCalendarDayModal(){
 const modal = qs('#calendarDayModal');
 const afterClose = () => syncCalendarFocusFromDayModal({ source:'button' });
 if(isLayerOpenLike(modal)) closeDialogSafe(modal, { afterClose });
 else afterClose();
 }
 function syncCalendarFocusFromDayModal(options={}){
 if(calendarDayModalCloseFocusRunning) return;
 calendarDayModalCloseFocusRunning = true;
 setTimeout(() => { calendarDayModalCloseFocusRunning = false; }, 650);
 const key = calendarUiState.focusAfterModalDateKey || calendarUiState.dayModalDateKey;
 try{ window.__upickHardScrollFreeze?.unlock?.('calendar-day-modal'); }catch(_){}
 if(!key){ releaseCalendarDayModalScrollLock(); return; }
 const d = dateFromKey(key);
 calendarUiState.selectedDateKey = key;
 calendarUiState.cursorDate = d;
 renderCalendarReservations();
 releaseCalendarDayModalScrollLock();
 // 날짜 팝업 안에서 이전/다음/오늘/날짜 선택으로 변경한 최종 날짜를
 // 닫힘 이후 실제 캘린더 셀로 이동·포커싱합니다.
 focusCalendarDate(key, { scroll:true, delay:90 });
 focusCalendarDate(key, { scroll:true, delay:260 });
 }
 function isCalendarDayDetailStackActive(){
 const dayModal = qs('#calendarDayModal');
 const detailModal = qs('#detailModal');
 return !!(dayModal && detailModal && isLayerOpenLike(dayModal) && isLayerOpenLike(detailModal) && detailModal.dataset.openedFromCalendarDay === '1');
}
function openCalendarReservationModal(item={}){
 if(!state.currentUser){ openModalAlert('입장이 필요합니다.'); return; }
 const modal = qs('#calendarReservationModal');
 if(!modal) return;
 const stackedFromDay = isCalendarDayDetailStackActive();
 const baseDateKey = stackedFromDay && calendarUiState.dayModalDateKey ? calendarUiState.dayModalDateKey : todayInputValue();
 qs('#calendarBenefitId').value = item.id || '';
 qs('#calendarSelectedStore').textContent = `${item.name || '혜택 매장'}${item.discountText ? ' · ' + item.discountText : ''}`;
 qs('#calendarVisitDate').value = baseDateKey;
 qs('#calendarVisitTime').value = defaultVisitTimeValue();
 qs('#calendarNotifyBefore').value = '30';
 qs('#calendarReservationMemo').value = '';
 modal.dataset.benefitId = item.id || '';
 modal.dataset.fromCalendarDayStack = stackedFromDay ? '1' : '0';
 if(isLayerOpenLike(modal)) closeDialogSafe(modal, { duration:160 });
 try{
   modal.classList.add('upick-nested-modal');
   modal.classList.toggle('upick-from-calendar-day-stack', stackedFromDay);
   modal.classList.remove('is-closing','upick-motion-closing');
   delete modal.dataset.upickMotionClosing;
 }catch(_){}
 // 버튼 클릭 이벤트 버블링이 끝난 뒤 중첩 팝업을 열어 상세 팝업의 클릭/포커스 처리와 충돌하지 않게 합니다.
 setTimeout(() => {
   openDialogSafe(modal, { initialFocusSelector:'#calendarVisitDate', duration:320 });
 }, 0);
 }
 function closeCalendarReservationModal(){
 const modal = qs('#calendarReservationModal');
 if(isLayerOpenLike(modal)) closeDialogSafe(modal, { duration:320 });
 }
 async function saveCalendarReservation(event){
 event?.preventDefault?.();
 try{
 if(!state.currentUser){ await openModalAlert('입장이 필요합니다.'); return; }
 const benefitId = qs('#calendarBenefitId')?.value || qs('#calendarReservationModal')?.dataset.benefitId || '';
 const item = state.benefits.find(v => v.id === benefitId);
 if(!item){ await openModalAlert('혜택 매장 정보를 찾지 못했습니다.'); return; }
 const dateInput = qs('#calendarVisitDate');
 const timeInput = qs('#calendarVisitTime');
 const dateValue = dateInput?.value || '';
 const timeValue = timeInput?.value || '';
 const before = Number(qs('#calendarNotifyBefore')?.value || 30);
 if(!dateValue){
   await openModalAlert('방문 예정일을 선택해 주세요.', dateInput, '방문 알림 추가');
   try{ dateInput?.focus?.({ preventScroll:true }); }catch(_){ try{ dateInput?.focus?.(); }catch(__){} }
   return;
 }
 if(!timeValue){
   await openModalAlert('방문 예정 시간을 선택해 주세요.', timeInput, '방문 알림 추가');
   try{ timeInput?.focus?.({ preventScroll:true }); }catch(_){ try{ timeInput?.focus?.(); }catch(__){} }
   return;
 }
 const visitAtDate = new Date(`${dateValue}T${timeValue}:00`);
 if(Number.isNaN(visitAtDate.getTime())){ await openModalAlert('방문 예정 시간이 올바르지 않습니다.'); return; }
 const notifyAtDate = new Date(visitAtDate.getTime() - before * 60 * 1000);
 if(visitAtDate.getTime() <= Date.now() - 60000){ await openModalAlert('방문 예정 시간은 현재 이후로 선택해 주세요.'); return; }
 const memo = String(qs('#calendarReservationMemo')?.value || '').trim();
 const savedReservationRef = await addDoc(collection(db, CALENDAR_RESERVATIONS_COLLECTION), {
 uid: state.currentUser.uid,
 benefitId: item.id,
 storeName: item.name || '',
 category: item.category || '',
 phone: item.phone || '',
 address: getBenefitDisplayAddress(item) || item.roadAddress || '',
 stations:getBenefitStations(item),
 stationAccessText: item.stationAccessText || item.transitText || '',
 discountText: item.discountText || '',
 visitAt: visitAtDate,
 notifyAt: notifyAtDate,
 notifyBeforeMinutes: before,
 memo,
 status: 'scheduled',
 channel: 'web_push',
 createdAt: serverTimestamp(),
 updatedAt: serverTimestamp()
 });
 const reservationModal = qs('#calendarReservationModal');
 const savedFromCalendarDayStack = reservationModal?.dataset?.fromCalendarDayStack === '1' || isCalendarDayDetailStackActive();
 closeCalendarReservationModal();
 if(savedFromCalendarDayStack){
   await openModalAlert('방문 알림이 등록되었습니다.', null, '방문 알림 등록 완료');
   const localReservation = normalizeReservation({
     uid: state.currentUser.uid,
     benefitId: item.id,
     storeName: item.name || '',
     category: item.category || '',
     phone: item.phone || '',
     address: getBenefitDisplayAddress(item) || item.roadAddress || '',
     discountText: item.discountText || '',
     visitAt: visitAtDate,
     notifyAt: notifyAtDate,
     notifyBeforeMinutes: before,
     memo,
     status: 'scheduled'
   }, savedReservationRef?.id || `local-${Date.now()}`);
   if(!state.calendarReservations.some(v => String(v.id) === String(localReservation.id))){
     state.calendarReservations = [...state.calendarReservations, localReservation];
   }
   calendarUiState.dayModalDateKey = dateValue;
   calendarUiState.focusAfterModalDateKey = dateValue;
   calendarUiState.selectedDateKey = dateValue;
   calendarUiState.cursorDate = dateFromKey(dateValue);
   renderCalendarReservations();
   if(isLayerOpenLike(qs('#calendarDayModal'))) renderCalendarDayModal();
   return;
 }
 const goCalendar = await openModalConfirm(
   '방문 알림이 등록되었습니다.\n캘린더 화면에서 확인하시겠습니까?',
   null,
   '방문 알림 등록 완료',
   '캘린더에서 확인',
   '계속 혜택 보기'
 );
 if(goCalendar){
   const openSavedDateOnCalendar = () => {
     try{
       calendarUiState.selectedDateKey = dateValue;
       calendarUiState.cursorDate = dateFromKey(dateValue);
       calendarUiState.dayModalDateKey = dateValue;
       calendarUiState.focusAfterModalDateKey = dateValue;
     }catch(_){}
     changeView('calendar');
     try{
       renderCalendarReservations();
       requestAnimationFrame(() => {
         requestAnimationFrame(() => openCalendarDayModal(dateValue));
       });
     }catch(_){}
   };
   const detailModal = qs('#detailModal');
   if(detailModal && isLayerOpenLike(detailModal)){
     closeDetailDialogPreservingPage(detailModal, { afterClose: openSavedDateOnCalendar });
   }else{
     openSavedDateOnCalendar();
   }
 }
 }catch(error){
 console.error('캘린더 예약 저장 실패', error);
 await openModalAlert('예약 알림 저장 중 오류가 발생했습니다. Firestore 규칙을 확인해 주세요.');
 }
 }
 async function cancelCalendarReservation(id){
 try{
 if(!id || !state.currentUser) return;
 const ok = await openModalConfirm('이 예약 알림을 취소하시겠습니까?', null, '예약 알림 취소', '취소하기', '닫기');
 if(!ok) return;
 await setDoc(doc(db, CALENDAR_RESERVATIONS_COLLECTION, id), {
 status:'cancelled',
 cancelledAt:serverTimestamp(),
 updatedAt:serverTimestamp()
 }, { merge:true });
 // Firestore snapshot이 도착하기 전에도 현재 열려 있는 날짜 팝업에서 즉시 제거합니다.
 const target = state.calendarReservations.find(v => String(v.id) === String(id));
 if(target) target.status = 'cancelled';
 renderCalendarReservations();
 if(isLayerOpenLike(qs('#calendarDayModal'))) renderCalendarDayModal();
 }catch(error){
 console.error('캘린더 예약 취소 실패', error);
 await openModalAlert('예약 알림 취소 중 오류가 발생했습니다.');
 }
 }
 function subscribeCalendarReservations(){
 if(!state.currentUser?.uid) return;
 const q = query(collection(db, CALENDAR_RESERVATIONS_COLLECTION), where('uid', '==', state.currentUser.uid));
 onSnapshot(q, (snapshot) => {
 state.calendarReservations = snapshot.docs.map(d => normalizeReservation(d.data(), d.id));
 renderCalendarReservations();
 scheduleLocalCalendarChecks();
 }, (error) => {
 console.error('캘린더 예약 로드 실패', error);
 state.calendarReservations = [];
 renderCalendarReservations();
 });
 }
 let calendarCheckTimer = null;
 const calendarNotificationInFlight = new Set();
 function scheduleLocalCalendarChecks(){
 if(calendarCheckTimer) clearInterval(calendarCheckTimer);
 checkDueCalendarReservations();
 calendarCheckTimer = setInterval(checkDueCalendarReservations, 30000);
 }
 const CALENDAR_LOCAL_TOAST_KEY_PREFIX = 'myhills_calendar_toast_shown_';
 function isCalendarLocalToastShown(id){
 if(!id) return false;
 try{return sessionStorage.getItem(CALENDAR_LOCAL_TOAST_KEY_PREFIX + id) === '1';}catch(e){return false;}
 }
 function markCalendarReservationLocalToastShown(item){
 if(!item?.id) return;
 try{sessionStorage.setItem(CALENDAR_LOCAL_TOAST_KEY_PREFIX + item.id, '1');}catch(e){}
 const target = state.calendarReservations.find(v => v.id === item.id);
 if(target){
 target.localToastShownAt = new Date();
 }
 renderCalendarReservations();
 }
 async function showCalendarReservationNotification(item){
 const title = '혜택 방문 알림';
 const body = `${item.storeName} 방문 예정 시간: ${formatDateTimeKo(toDateFromTimestamp(item.visitAt))}`;

 // 알림 운영 이후 프론트 로컬 알림은 사용하지 않습니다.
 // + Functions + FCM + Service Worker 경로만 알림을 담당합니다.
 // 앱이 열려 있을 때는 중복 방지를 위해 내부 토스트만 보여줍니다.
 showProximityToast({ title, message: body });
 return true;
 }
 async function checkDueCalendarReservations(){
 const now = Date.now();
 const due = state.calendarReservations.filter(item => {
 if(!item?.id) return false;
 if(calendarNotificationInFlight.has(item.id)) return false;
 if(item.status !== 'scheduled' || item.localNotifiedAt || item.localToastShownAt || isCalendarLocalToastShown(item.id)) return false;
 const notifyAt = toDateFromTimestamp(item.notifyAt);
 return notifyAt && notifyAt.getTime() <= now;
 });
 for(const item of due){
 calendarNotificationInFlight.add(item.id);
 try{
 await showCalendarReservationNotification(item);
 // 프론트는 로컬 토스트 표시 여부만 기록합니다.
 // status=sent / sentAt 처리는 서버 Functions가 담당하여 시스템 알림 중복을 방지합니다.
 await markCalendarReservationLocalToastShown(item);
 }catch(error){
 console.warn('앱 실행 중 캘린더 토스트 처리 실패', error);
 }finally{
 setTimeout(() => calendarNotificationInFlight.delete(item.id), 120000);
 }
 }
 }

 function renderHome(){const items=getFilteredBenefits();qs('#sectionTitle').textContent=state.filter==='high'?'고할인 / 추천 혜택':(state.category==='전체'?'전체 혜택':`${state.category} 혜택`);qs('#resultCount').textContent=`${items.length}건`;qs('#homeLoading').classList.toggle('hidden',!state.loading);renderList('#cardList',items);updateFilterIconLabels();} 
 const renderFavorites=()=>renderList('#favoriteList',getFilteredBenefits('favorite'));
 function renderStats(){const items=getVisibleBenefits();qs('#statCount').textContent=items.length;qs('#statMax').textContent=`${Math.max(0,...items.map(v=>v.discountValue))}%`;qs('#statCat').textContent=new Set(items.map(v=>v.category)).size;}
 
 function benefitPriceDetailsHtml(item={}){
 const text = String(item.priceDetails || item.priceInfo || item.servicePriceText || item.servicePriceDetails || '').trim();
 if(!text) return '';
 return `<div class="panel price-details-panel"><strong style="display:block;margin-bottom:6px;font-size:13px;color:var(--muted);">세부 내용 및 비용</strong><div class="price-details-body">${escapeHtml(text)}</div></div>`;
}
 function benefitContactHtml(item={}){
 const phone = String(item.phone || item.contact?.phone || '').trim();
 const emergency = String(item.emergencyPhone || item.contact?.emergency || '').trim();
 const rows = [];
 const toTelNumber = (value='') => String(value || '').replace(/[^\d+]/g, '');
 const phoneTel = toTelNumber(phone);
 const emergencyTel = toTelNumber(emergency);

 if(phone){
 rows.push(phoneTel
 ? `<a class="benefit-contact-link" href="tel:${escapeAttr(phoneTel)}" aria-label="${escapeAttr(phone)} 전화걸기"><img class="upick-svg-icon upick-contact-icon" src="/icons/internal/phone.svg" alt="" loading="lazy" decoding="async"><span>${escapeHtml(phone)}</span></a>`
 : `<div class="benefit-contact-link is-disabled" aria-label="등록된 연락처"><img class="upick-svg-icon upick-contact-icon" src="/icons/internal/phone.svg" alt="" loading="lazy" decoding="async"><span>${escapeHtml(phone)}</span></div>`);
 }
 if(emergency){
 rows.push(emergencyTel
 ? `<a class="benefit-contact-link benefit-contact-emergency" href="tel:${escapeAttr(emergencyTel)}" aria-label="비상연락처 ${escapeAttr(emergency)} 전화걸기"><img class="upick-svg-icon upick-contact-icon" src="/icons/internal/emergency.svg" alt="" loading="lazy" decoding="async"><span>비상연락처: ${escapeHtml(emergency)}</span></a>`
 : `<div class="benefit-contact-link benefit-contact-emergency is-disabled" aria-label="비상연락처"><img class="upick-svg-icon upick-contact-icon" src="/icons/internal/emergency.svg" alt="" loading="lazy" decoding="async"><span>비상연락처: ${escapeHtml(emergency)}</span></div>`);
 }
 return rows.length ? rows.join('') : '등록된 전화번호가 없습니다.';
 }


 function getBenefitRepresentativeImage(item = {}){
 const candidates = [
 item.kakaoShareThumbnailUrl,
 item.kakaoThumbnailUrl,
 item.shareThumbnailUrl,
 item.shareImageUrl,
 item.representativeImageUrl,
 item.representativePhotoUrl,
 item.mainImageUrl,
 item.mainPhotoUrl,
 item.storeImageUrl,
 item.storePhotoUrl,
 item.thumbnailUrl,
 item.imageUrl,
 item.thumbnail,
 item.photoUrl,
 item.image,
 Array.isArray(item.images) ? item.images[0] : '',
 Array.isArray(item.photos) ? item.photos[0] : '',
 item.media?.thumbnailUrl,
 item.media?.imageUrl,
 item.share?.imageUrl,
 item.share?.thumbnailUrl
 ];
 const raw = candidates.find(v => typeof v === 'string' && v.trim());
 if(!raw) return '';
 const url = toAbsoluteUrl(String(raw).trim());
 const defaultUrl = toAbsoluteUrl(DEFAULT_SHARE_IMAGE_URL || '');
 if(defaultUrl && url === defaultUrl) return '';
 return url || '';
 }

 function getBenefitDetailImages(item = {}){
 const representative = getBenefitRepresentativeImage(item);
 const rawGroups = [
 item.detailImages,
 item.detailImageUrls,
 item.detailImageUrl,
 item.detailPhotoUrls,
 item.detailPhotoUrl,
 item.benefitDetailImages,
 item.galleryImages,
 item.galleryImageUrls,
 item.additionalImages,
 item.extraImages,
 item.slideImages,
 item.sliderImages
 ];
 const list = [];
 if(representative) list.push(representative);
 rawGroups.forEach((raw) => {
   let rows = [];
   if(Array.isArray(raw)) rows = raw;
   else if(typeof raw === 'string') rows = raw.split(/[\n,，]/);
   rows.forEach((row) => {
     const value = typeof row === 'string' ? row : (row?.url || row?.imageUrl || row?.src || '');
     const url = toAbsoluteUrl(String(value || '').trim());
     if(url && !list.includes(url)) list.push(url);
   });
 });
 return list;
 }

 function benefitDetailImageSliderHtml(item = {}){
 const images = getBenefitDetailImages(item);
 if(!images.length) return '';
 const slides = images.map((url, index) => `<div class="benefit-detail-photo-slide${index === 0 ? ' active' : ''}" data-benefit-photo-index="${index}" data-benefit-photo-url="${escapeAttr(url)}" role="button" tabindex="0" aria-label="${escapeAttr(item.name || '혜택 사진')} ${index + 1}번째 확대"><img src="${escapeAttr(url)}" alt="${escapeAttr(item.name || '매장 사진')}" loading="lazy" decoding="async" draggable="false" onerror="this.closest('.benefit-detail-photo-slide')?.remove();"></div>`).join('');
 const dots = images.length > 1 ? `<div class="benefit-detail-photo-dots" aria-hidden="true">${images.map((_, index) => `<span class="${index === 0 ? 'active' : ''}"></span>`).join('')}</div>` : '';
 const count = images.length > 1 ? `<span class="benefit-detail-photo-count">1/${images.length}</span>` : '';
 return `<div class="benefit-detail-photo benefit-detail-photo-slider" data-benefit-photo-slider="1" data-benefit-photo-images="${escapeAttr(JSON.stringify(images))}"><div class="benefit-detail-photo-track">${slides}</div><span class="benefit-detail-photo-badge">${images.length > 1 ? '사진' : '대표 사진'}</span>${count}${dots}<span class="benefit-photo-zoom-icon" aria-hidden="true"></span></div>`;
 }

 function benefitDetailHeroHtml(item = {}){
 const imageHtml = benefitDetailImageSliderHtml(item);
 const isFavClass = imageHtml ? '' : ' no-photo';
 return `<div class="benefit-detail-hero${isFavClass}"><div class="benefit-detail-main"><div class="${getBadgeClass(item)}" style="display:inline-block;min-width:auto;padding:12px 16px;">${item.discountText}</div><h3 style="margin:12px 0 6px;font-size:26px;letter-spacing:-.04em;">${item.name}</h3><div class="tags" style="margin-top:0;margin-bottom:10px;">${item.recommended?'<span class="tag rec">추천 혜택</span>':''}<span class="tag">${item.category}</span>${naverServiceBadgesHtml(item)}${benefitOperationBadgesHtml(item)}${benefitDateTag(item)}</div>${benefitStatusChipsHtml(item,{includeDate:true})}${benefitStatusReasonHtml(item)}</div>${imageHtml}</div>`;
 }

 function getPointerClient(event){
 const source = event?.touches?.[0] || event?.changedTouches?.[0] || event;
 return { x: Number(source?.clientX || 0), y: Number(source?.clientY || 0) };
 }

 function getBenefitPhotoSlidePercent(){
 return 100;
 }

 function setBenefitPhotoSlide(slider, nextIndex, options = {}){
 if(!slider) return;
 const slides = [...slider.querySelectorAll('.benefit-detail-photo-slide')];
 if(!slides.length) return;
 const max = slides.length;
 const index = ((Number(nextIndex) || 0) + max) % max;
 const track = slider.querySelector('.benefit-detail-photo-track');
 if(track){
   track.style.transition = options.animate === false ? 'none' : '';
   // 혜택 상세 원본 사진도 확대 팝업의 현재 인덱스와 같은 위치로 이동시킵니다.
   // 기존처럼 0으로 고정하면 확대 팝업에서 2/2로 넘긴 뒤 닫아도 상세 사진은 1/2 위치에 남습니다.
   track.style.transform = `translate3d(${(-index * getBenefitPhotoSlidePercent())}%,0,0)`;
 }
 slides.forEach((slide, i) => {
   const active = i === index;
   slide.classList.toggle('active', active);
   slide.setAttribute('aria-current', active ? 'true' : 'false');
   slide.setAttribute('aria-label', `${slider.dataset.benefitPhotoTitle || '혜택 사진'} ${i + 1}번째 사진 크게 보기, 총 ${max}장`);
 });
 slider.querySelectorAll('.benefit-detail-photo-dots span').forEach((dot, i) => dot.classList.toggle('active', i === index));
 const count = slider.querySelector('.benefit-detail-photo-count');
 if(count) count.textContent = `${index + 1}/${max}`;
 slider.dataset.currentIndex = String(index);
 slider.setAttribute('aria-label', `${slider.dataset.benefitPhotoTitle || '혜택 사진'} 사진 영역, 현재 ${index + 1}번째 / 총 ${max}장`);
 }

 function bindBenefitPhotoSlider(item = {}){
 const slider = qs('#modalBody .benefit-detail-photo-slider');
 if(!slider || slider.dataset.bound === '1') return;
 slider.dataset.bound = '1';
 const track = slider.querySelector('.benefit-detail-photo-track');
 slider.dataset.benefitPhotoTitle = item.name || '혜택 사진';
 const getCurrent = () => Number(slider.dataset.currentIndex || 0);
 const getMax = () => Math.max(1, slider.querySelectorAll('.benefit-detail-photo-slide').length);
 const openCurrentPreview = () => openBenefitImagePreview(slider, getCurrent(), item.name || '혜택 사진');
 setBenefitPhotoSlide(slider, getCurrent(), { animate:false });
 slider.querySelectorAll('.benefit-detail-photo-slide').forEach((slide) => {
   slide.addEventListener('focus', () => {
     const focusIndex = Number(slide.dataset.benefitPhotoIndex || 0);
     if(Number.isFinite(focusIndex)) setBenefitPhotoSlide(slider, focusIndex, { animate:false });
   });
 });
 let startX = 0;
 let startY = 0;
 let dx = 0;
 let dragging = false;
 let moved = false;
 let didDrag = false;
 let pointerId = null;
 let activeInput = '';
 let suppressNextPreviewClick = false;
 let ignoreClickUntil = 0;
 const markClickSuppressed = () => {
   suppressNextPreviewClick = true;
   ignoreClickUntil = Date.now() + 420;
   slider.dataset.photoDragSuppressNextClick = '1';
   window.__upickBenefitPhotoSuppressNextClick = true;
 };
 const clearClickSuppressed = () => {
   suppressNextPreviewClick = false;
   delete slider.dataset.photoDragSuppressNextClick;
   window.__upickBenefitPhotoSuppressNextClick = false;
   ignoreClickUntil = 0;
 };
 const consumePreviewClickBlock = () => {
   const blocked = suppressNextPreviewClick || slider.dataset.photoDragSuppressNextClick === '1' || window.__upickBenefitPhotoSuppressNextClick === true || Date.now() < ignoreClickUntil;
   if(!blocked) return false;
   clearClickSuppressed();
   return true;
 };
 slider.addEventListener('dragstart', (event) => {
   event.preventDefault();
   markClickSuppressed();
 }, true);
 const resetTrack = (animate = true) => {
   if(!track) return;
   track.style.transition = animate ? '' : 'none';
   track.style.transform = `translate3d(${(-getCurrent() * 100)}%,0,0)`;
 };
 const start = (event, inputType = 'pointer') => {
   if(getMax() < 2) return;
   if(inputType === 'pointer' && event.pointerType === 'touch') return;
   if(inputType === 'pointer' && event.button != null && event.button !== 0) return;
   const point = getPointerClient(event);
   startX = point.x;
   startY = point.y;
   dx = 0;
   moved = false;
   didDrag = false;
   dragging = true;
   activeInput = inputType;
   slider.classList.add('is-dragging');
   slider.dataset.photoDragging = '1';
   pointerId = event.pointerId ?? null;
   if(track) track.style.transition = 'none';
   if(inputType === 'pointer' && event.pointerId != null && slider.setPointerCapture){
     try{ slider.setPointerCapture(event.pointerId); }catch(_){ }
   }
 };
 const move = (event, inputType = 'pointer') => {
   if(!dragging || activeInput !== inputType) return;
   const point = getPointerClient(event);
   dx = point.x - startX;
   const dy = point.y - startY;
   if(Math.abs(dx) > 3 || Math.abs(dy) > 3){
     moved = true;
   }
   if(Math.abs(dx) > 8 && Math.abs(dx) > Math.abs(dy)){
     didDrag = true;
     markClickSuppressed();
     event.preventDefault();
     if(track){
       const width = Math.max(1, slider.clientWidth || slider.getBoundingClientRect().width || 1);
       const percent = (dx / width) * 100;
       track.style.transform = `translate3d(${(-getCurrent() * 100) + percent}%,0,0)`;
     }
   }
 };
 const end = (event, inputType = 'pointer') => {
   if(!dragging || activeInput !== inputType) return;
   dragging = false;
   activeInput = '';
   slider.classList.remove('is-dragging');
   delete slider.dataset.photoDragging;
   if(inputType === 'pointer' && pointerId != null && slider.releasePointerCapture){
     try{ slider.releasePointerCapture(pointerId); }catch(_){ }
   }
   const dy = Math.abs((getPointerClient(event).y || startY) - startY);
   const width = Math.max(1, slider.clientWidth || slider.getBoundingClientRect().width || 1);
   const threshold = Math.min(80, Math.max(36, width * 0.22));
   const horizontalDragForClick = didDrag || (Math.abs(dx) > 14 && Math.abs(dx) > dy * 1.15);
   const isTapLikeTouch = inputType === 'touch' && !horizontalDragForClick && Math.abs(dx) <= 8 && dy <= 8;
   if(horizontalDragForClick){
     markClickSuppressed();
   }
   if(Math.abs(dx) > threshold && Math.abs(dx) > dy * 1.15){
     event.preventDefault();
     event.stopPropagation();
     setBenefitPhotoSlide(slider, getCurrent() + (dx < 0 ? 1 : -1));
   }else{
     resetTrack(true);
     const isTapLikePointer = inputType === 'pointer' && !horizontalDragForClick && Math.abs(dx) <= 8 && dy <= 8;
     if(isTapLikeTouch || isTapLikePointer){
       event.preventDefault();
       event.stopPropagation();
       openCurrentPreview();
       markClickSuppressed();
     }
   }
   window.setTimeout(() => { moved = false; didDrag = false; dx = 0; }, 0);
 };
 slider.addEventListener('pointerdown', (event) => start(event, 'pointer'));
 slider.addEventListener('pointermove', (event) => move(event, 'pointer'), { passive:false });
 slider.addEventListener('pointerup', (event) => end(event, 'pointer'), { passive:false });
 slider.addEventListener('pointercancel', (event) => end(event, 'pointer'), { passive:false });
 slider.addEventListener('touchstart', (event) => start(event, 'touch'), { passive:true });
 slider.addEventListener('touchmove', (event) => move(event, 'touch'), { passive:false });
 slider.addEventListener('touchend', (event) => end(event, 'touch'), { passive:false });
 slider.addEventListener('touchcancel', (event) => end(event, 'touch'), { passive:false });
 slider.addEventListener('click', (event) => {
   const horizontalDragClick = didDrag || (Math.abs(dx) > 14);
   if(consumePreviewClickBlock() || horizontalDragClick){
     event.preventDefault();
     event.stopPropagation();
     if(typeof event.stopImmediatePropagation === 'function') event.stopImmediatePropagation();
     moved = false;
     didDrag = false;
     dx = 0;
     return;
   }
   const isInsidePhoto = slider.contains(event.target);
   const isPassiveUi = !!event.target.closest('.benefit-detail-photo-count,.benefit-detail-photo-dots');
   if(isInsidePhoto && !isPassiveUi){
     event.preventDefault();
     event.stopPropagation();
     if(typeof event.stopImmediatePropagation === 'function') event.stopImmediatePropagation();
     openCurrentPreview();
   }
 }, true);
 slider.addEventListener('keydown', (event) => {
   if(event.key !== 'Enter' && event.key !== ' ') return;
   event.preventDefault();
   event.stopPropagation();
   if(typeof event.stopImmediatePropagation === 'function') event.stopImmediatePropagation();
   if(consumePreviewClickBlock()) return;
   openCurrentPreview();
 }, true);
 resetTrack(false);
 }

 function removeLegacyBenefitPhotoViewer(){
 const legacy = document.getElementById('benefitPhotoZoomViewer');
 if(legacy){
   legacy.classList.remove('show');
   legacy.setAttribute('aria-hidden','true');
   legacy.remove();
 }
 }

 function openBenefitImagePreview(slider, startIndex = 0, title = '혜택 사진'){
 removeLegacyBenefitPhotoViewer();
 let images = [];
 try{ images = JSON.parse(slider?.dataset?.benefitPhotoImages || '[]'); }catch(_){ images = []; }
 images = images.filter(Boolean);
 if(!images.length) return;
 let index = Math.max(0, Math.min(images.length - 1, Number(startIndex) || 0));
 let overlay = document.querySelector('.benefit-image-preview-overlay');
 // 매번 새 div 팝업을 만들어 이전 open의 swipe/click 클로저가 남아 인덱스가 어긋나는 문제를 방지합니다.
 if(overlay) overlay.remove();
 overlay = null;
 if(!overlay){
   overlay = document.createElement('div');
   overlay.className = 'benefit-image-preview-overlay upick-image-fade-layer du-layer du-layer--fullscreen';
   overlay.setAttribute('role', 'dialog');
   overlay.setAttribute('aria-modal', 'true');
   overlay.setAttribute('aria-label', '혜택 사진 확대');
   overlay.setAttribute('aria-hidden', 'true');
   overlay.setAttribute('data-du-layer', 'fullscreen');
   overlay.setAttribute('data-du-close-on-backdrop', 'false');
   overlay.setAttribute('data-du-close-on-esc', 'false');
   overlay.innerHTML = `<div class="benefit-image-preview-dialog du-layer__panel" data-du-layer-panel role="document"><div class="benefit-image-preview-head du-layer__header" data-du-layer-header><div class="du-layer__header-main"><strong class="du-layer__title"></strong></div><div class="du-layer__header-actions"><button type="button" class="benefit-image-preview-close du-layer__close" data-du-layer-close aria-label="닫기">×</button></div></div><div class="benefit-image-preview-body du-layer__body" data-du-layer-body><div class="benefit-image-preview-track"></div><span class="benefit-image-preview-count"></span><div class="benefit-image-preview-dots" aria-hidden="true"></div></div></div>`;
   if(window.DuLayer && typeof window.DuLayer.mount === 'function') window.DuLayer.mount(overlay, 'fullscreen');
   else (document.getElementById('duLayerRoot') || document.body).appendChild(overlay);
 }else{
   if(window.DuLayer && typeof window.DuLayer.mount === 'function') window.DuLayer.mount(overlay, 'fullscreen');
   else if(!overlay.closest('#duLayerRoot')) (document.getElementById('duLayerRoot') || document.body).appendChild(overlay);
 }
 const body = overlay.querySelector('.benefit-image-preview-body');
 const track = overlay.querySelector('.benefit-image-preview-track');
 const count = overlay.querySelector('.benefit-image-preview-count');
 const titleEl = overlay.querySelector('.benefit-image-preview-head strong');
 const dotsEl = overlay.querySelector('.benefit-image-preview-dots');
 const closeBtn = overlay.querySelector('.benefit-image-preview-close');
 const getSlidePercent = () => 100;
 const getSlidePixel = () => Math.max(1, body?.clientWidth || body?.getBoundingClientRect?.().width || overlay?.getBoundingClientRect?.().width || 1);
 if(overlay) overlay.dataset.previewCurrentIndex = String(index);
 const fitDialogToActiveImage = () => {
   const dialog = overlay?.querySelector('.benefit-image-preview-dialog');
   if(!dialog || !body) return;
   const vw = Math.max(320, window.innerWidth || document.documentElement.clientWidth || 0);
   const vh = Math.max(320, window.innerHeight || document.documentElement.clientHeight || 0);
   const isMobile = vw <= 560;
   const outerPad = isMobile ? 24 : 48;
   const headH = isMobile ? 54 : 58;
   const topLineH = 4;
   const indexSafeH = images.length > 1 ? (isMobile ? 32 : 34) : 0;

   // v20260529 phase3: 혜택 상세 이미지 확대는 스와이프 안정성을 위해 높이를 고정합니다.
   // 사진 비율별로 팝업 높이가 달라지면 좌우 스와이프/페이지 인디케이터 위치가 흔들립니다.
   const fixedW = Math.min(920, vw - outerPad);
   const fixedDialogH = Math.round(Math.min(vh - outerPad, isMobile ? vh - 24 : vh * 0.92));
   const fixedBodyH = Math.max(260, fixedDialogH - headH - topLineH);
   const imageH = fixedBodyH;

   dialog.style.setProperty('--benefit-preview-w', `${Math.round(fixedW)}px`);
   dialog.style.setProperty('--benefit-preview-dialog-h', `${fixedDialogH}px`);
   dialog.style.setProperty('--benefit-preview-h', `${Math.round(imageH)}px`);
   dialog.style.setProperty('--benefit-preview-body-h', `${fixedBodyH}px`);
   resetTrack(false);
 };
 const ensureSlides = () => {
   if(!track) return;
   const safeIndex = Math.max(0, Math.min(images.length - 1, Number(index) || 0));
   const activeUrl = images[safeIndex] || '';
   const nextKey = `${safeIndex}||${activeUrl}`;

   // Root1 전환 후 기존 track 슬라이드 방식은 CSS/Root 보정이 겹치면
   // 2번째 사진 위치가 빈 영역으로 밀릴 수 있습니다.
   // 확대 팝업에서는 현재 사진 1장만 렌더하고, 스와이프 시 src 자체를 교체해 안정화합니다.
   if(track.dataset.previewImagesKey !== nextKey || !track.querySelector('img')){
     track.dataset.previewImagesKey = nextKey;
     track.innerHTML = `<div class="benefit-image-preview-slide active" data-preview-index="${safeIndex}"><div class="benefit-image-preview-frame"><img src="${escapeAttr(activeUrl)}" alt="${escapeAttr(title)} ${safeIndex + 1}번째 사진" draggable="false" loading="eager" decoding="async"></div></div>`;
     const img = track.querySelector('img');
     if(img){
       img.addEventListener('load', fitDialogToActiveImage, { once:false });
       img.addEventListener('error', () => {
         const frame = img.closest('.benefit-image-preview-frame');
         if(frame) frame.innerHTML = '<div class="benefit-image-preview-error">이미지를 불러올 수 없습니다.</div>';
       }, { once:true });
     }
   }
   track.style.width = '100%';
   track.style.transform = 'translate3d(0,0,0)';
   track.querySelectorAll('.benefit-image-preview-slide').forEach((slide) => {
     slide.classList.add('active');
     slide.style.flex = '0 0 100%';
     slide.style.width = '100%';
     slide.style.maxWidth = '100%';
   });
 };
 const render = (animate = true) => {
   ensureSlides();
   if(track){
     track.style.transition = animate ? '' : 'none';
     track.style.transform = 'translate3d(0,0,0)';
     const activeImg = track.querySelector('.benefit-image-preview-slide.active img');
     if(activeImg){
       if(activeImg.complete) requestAnimationFrame(fitDialogToActiveImage);
       else activeImg.addEventListener('load', fitDialogToActiveImage, { once:true });
     }
   }
   if(count){
     count.hidden = images.length <= 1;
     count.textContent = images.length > 1 ? `${index + 1}/${images.length}` : '';
   }
   if(titleEl) titleEl.textContent = title;
   if(dotsEl){
     dotsEl.hidden = images.length <= 1;
     dotsEl.innerHTML = images.length > 1 ? images.map((_, dotIndex) => `<span class="${dotIndex === index ? 'active' : ''}"></span>`).join('') : '';
   }
 };
 const readPreviewIndexFromDom = () => {
   const saved = Number(overlay?.dataset?.previewCurrentIndex);
   if(Number.isFinite(saved)) return Math.max(0, Math.min(images.length - 1, saved));
   const activeSlide = overlay?.querySelector?.('.benefit-image-preview-slide.active');
   if(activeSlide && track){
     const domIndex = Array.from(track.querySelectorAll('.benefit-image-preview-slide')).indexOf(activeSlide);
     if(domIndex >= 0) return Math.max(0, Math.min(images.length - 1, domIndex));
   }
   const activeImg = activeSlide?.querySelector?.('img');
   const activeSrc = activeImg?.getAttribute?.('src') || activeImg?.src || '';
   if(activeSrc){
     const urlIndex = images.findIndex((url) => String(url) === String(activeSrc));
     if(urlIndex >= 0) return urlIndex;
   }
   return Math.max(0, Math.min(images.length - 1, index));
 };
 const getPreviewIndex = () => readPreviewIndexFromDom();
 const syncDetailSlider = (animate = true, forceIndex = null) => {
   const syncIndex = forceIndex == null ? getPreviewIndex() : Math.max(0, Math.min(images.length - 1, Number(forceIndex) || 0));
   index = syncIndex;
   if(overlay) overlay.dataset.previewCurrentIndex = String(syncIndex);
   window.__upickBenefitPreviewLastIndex = syncIndex;
   try{
     if(slider) slider.dataset.currentIndex = String(syncIndex);
     setBenefitPhotoSlide(slider, syncIndex, { animate });
   }catch(_){ }
 };
 const close = () => {
   const closingIndex = getPreviewIndex();
   syncDetailSlider(false, closingIndex);
   if(!overlay || overlay.dataset.upickImageClosing === '1') return;
   overlay.dataset.upickImageClosing = '1';
   const panel = overlay.querySelector('.benefit-image-preview-dialog,.du-layer__panel,[data-du-layer-panel]');
   const finishClose = () => {
     overlay.classList.remove('closing','is-closing','upick-motion-closing','show','is-open','upick-motion-open');
     delete overlay.dataset.upickImageClosing;
     overlay.removeAttribute('open');
     overlay.setAttribute('aria-hidden','true');
     document.body.classList.remove('benefit-image-preview-open');
     requestAnimationFrame(() => syncDetailSlider(false, closingIndex));
     window.setTimeout(() => syncDetailSlider(false, closingIndex), 80);
     if(typeof window.__upickSyncModalScrollLock === 'function') window.__upickSyncModalScrollLock();
     if(window.DuLayerStackManager && typeof window.DuLayerStackManager.requestSync === 'function') window.DuLayerStackManager.requestSync();
     try{ overlay.remove(); }catch(_){}
     try{ slider?.focus?.({preventScroll:true}); }catch(_){}
   };
   overlay.classList.add('closing');
   if(window.UpickMotion && typeof window.UpickMotion.close === 'function'){
     window.UpickMotion.close(overlay, { activeClass:'show', closingClass:'closing', panel, duration:280, ariaHidden:false, afterClose:finishClose });
   }else{
     overlay.classList.remove('show','is-open','upick-motion-open');
     window.setTimeout(finishClose, 280);
   }
 };
 const moveTo = (nextIndex, animate = true) => {
   index = (nextIndex + images.length) % images.length;
   if(overlay) overlay.dataset.previewCurrentIndex = String(index);
   window.__upickBenefitPreviewLastIndex = index;
   render(animate);
   syncDetailSlider(animate, index);
 };
 let startX = 0;
 let startY = 0;
 let dx = 0;
 let dragging = false;
 let pointerId = null;
 let activeInput = '';
 const resetTrack = (animate = true) => {
   if(!track) return;
   track.style.transition = animate ? '' : 'none';
   track.style.transform = 'translate3d(0,0,0)';
 };
 overlay.onclick = (event) => {
   const closeTarget = event.target.closest('.benefit-image-preview-close');
   if(closeTarget){ event.preventDefault(); event.stopPropagation(); close(); return; }
   event.stopPropagation();
 };
 overlay.oncancel = (event) => {
   event.preventDefault();
 };
 overlay.onkeydown = (event) => {
   if(event.key === 'Escape'){
     event.preventDefault();
     event.stopPropagation();
     return;
   }
   if(images.length > 1 && (event.key === 'ArrowRight' || event.key === 'ArrowLeft')){
     event.preventDefault();
     moveTo(index + (event.key === 'ArrowRight' ? 1 : -1));
   }
 };
 overlay.addEventListener('click', (event) => {
   if(event.target === overlay){
     event.preventDefault();
     event.stopPropagation();
   }
 }, true);
 if(body && body.dataset.previewSwipeBound !== '2'){
   body.dataset.previewSwipeBound = '2';
   const start = (event, inputType = 'pointer') => {
     if(images.length < 2) return;
     if(inputType === 'pointer' && event.pointerType === 'touch') return;
     if(inputType === 'pointer' && event.button != null && event.button !== 0) return;
     const point = getPointerClient(event);
     startX = point.x;
     startY = point.y;
     dx = 0;
     dragging = true;
     activeInput = inputType;
     pointerId = event.pointerId ?? null;
     if(track) track.style.transition = 'none';
     if(inputType === 'pointer' && event.pointerId != null && body.setPointerCapture){
       try{ body.setPointerCapture(event.pointerId); }catch(_){ }
     }
   };
   const move = (event, inputType = 'pointer') => {
     if(!dragging || activeInput !== inputType) return;
     const point = getPointerClient(event);
     dx = point.x - startX;
     const dy = point.y - startY;
     if(Math.abs(dx) > 8 && Math.abs(dx) > Math.abs(dy)){
       event.preventDefault();
       if(track){
         const width = Math.max(1, body.clientWidth || body.getBoundingClientRect().width || 1);
         const percent = (dx / width) * 100;
         track.style.transform = `translate3d(${percent * 0.18}%,0,0)`;
       }
     }
   };
   const finish = (event, inputType = 'pointer') => {
     if(!dragging || activeInput !== inputType) return;
     dragging = false;
     activeInput = '';
     if(inputType === 'pointer' && pointerId != null && body.releasePointerCapture){
       try{ body.releasePointerCapture(pointerId); }catch(_){ }
     }
     const dy = Math.abs((getPointerClient(event).y || startY) - startY);
     const width = Math.max(1, body.clientWidth || body.getBoundingClientRect().width || 1);
     const threshold = Math.min(120, Math.max(48, width * 0.18));
     if(Math.abs(dx) > threshold && Math.abs(dx) > dy * 1.15){
       event.preventDefault();
       moveTo(index + (dx < 0 ? 1 : -1));
     }else{
       resetTrack(true);
     }
     dx = 0;
   };
   body.addEventListener('pointerdown', (event) => start(event, 'pointer'));
   body.addEventListener('pointermove', (event) => move(event, 'pointer'), { passive:false });
   body.addEventListener('pointerup', (event) => finish(event, 'pointer'), { passive:false });
   body.addEventListener('pointercancel', (event) => finish(event, 'pointer'), { passive:false });
   body.addEventListener('touchstart', (event) => start(event, 'touch'), { passive:true });
   body.addEventListener('touchmove', (event) => move(event, 'touch'), { passive:false });
   body.addEventListener('touchend', (event) => finish(event, 'touch'), { passive:false });
   body.addEventListener('touchcancel', (event) => finish(event, 'touch'), { passive:false });
 }
 render(false);
 window.addEventListener('resize', fitDialogToActiveImage, { passive:true });
 syncDetailSlider(false);
 removeLegacyBenefitPhotoViewer();
 document.body.classList.add('benefit-image-preview-open');
 overlay.classList.remove('closing','is-closing','upick-motion-closing','show','is-open','upick-motion-open');
 delete overlay.dataset.upickImageClosing;
 overlay.setAttribute('aria-hidden','true');
 overlay.setAttribute('open','');
 const previewPanel = overlay.querySelector('.benefit-image-preview-dialog,.du-layer__panel,[data-du-layer-panel]');
 if(window.UpickMotion && typeof window.UpickMotion.open === 'function'){
   window.UpickMotion.open(overlay, { activeClass:'show', panel:previewPanel, duration:280, afterOpen:function(){ try{ closeBtn?.focus?.({preventScroll:true}); }catch(_){} } });
 }else{
   requestAnimationFrame(() => requestAnimationFrame(() => {
     overlay.setAttribute('aria-hidden','false');
     overlay.classList.add('show');
     try{ closeBtn?.focus?.({preventScroll:true}); }catch(_){}
   }));
 }
 setTimeout(removeLegacyBenefitPhotoViewer, 0);
 setTimeout(removeLegacyBenefitPhotoViewer, 80);
 }
 window.__upickOpenBenefitImagePreview = openBenefitImagePreview;
 window.__upickRemoveLegacyBenefitPhotoViewer = removeLegacyBenefitPhotoViewer;

 function openDetail(item, options = {}){
 const pageScrollY = getStablePageScrollY();
 const { skipUrlUpdate = false } = options;
 if(!skipUrlUpdate && item?.id) updateCleanDeepLinkUrl('benefit', item.id);
 increaseStat(item.id, item.name, 'detailViewCount');
 logBenefitEvent(item.id, 'detail_view');
 const isFav=getFavorites().includes(item.id);
 qs('#modalBody').innerHTML=renderBenefitDetailBody(item);
 const modal=qs('#detailModal');
 if(modal) modal.dataset.benefitId = String(item.id || '');
 if(isLayerOpenLike(modal)) closeDetailDialogPreservingPage(modal);
 window.__upickPendingModalScrollY = pageScrollY;
 try{ if(typeof window.__upickLockModalBackgroundAt === 'function') window.__upickLockModalBackgroundAt(pageScrollY); }catch(_){}
 preservePageScrollForDialogOpen(modal, pageScrollY);
 openDialogSafe(modal, { duration:320, initialFocusSelector:'#closeModal' });
 requestAnimationFrame(() => restorePageScrollWithoutBodyLock(pageScrollY));
 const detailHeadActions = qs('#detailHeadActions');
 if(detailHeadActions) detailHeadActions.hidden = false;
 const headFavBtn = qs('#modalFavBtn');
 if(headFavBtn){
   headFavBtn.dataset.favoriteId = String(item.id || '');
   headFavBtn.innerHTML = `<img class="upick-svg-icon" src="/icons/internal/${isFav ? 'star-fill' : 'star-outline'}.svg" alt="" loading="lazy" decoding="async">`;
   headFavBtn.classList.toggle('is-favorite', isFav);
   headFavBtn.setAttribute('aria-pressed', isFav ? 'true' : 'false');
   headFavBtn.setAttribute('aria-label', isFav ? '즐겨찾기 해제' : '즐겨찾기 추가');
   headFavBtn.title = isFav ? '즐겨찾기 해제' : '즐겨찾기 추가';
 }
 bindBenefitPhotoSlider(item);
 const photoSliderEl = qs('#modalBody .benefit-detail-photo-slider');
 if(photoSliderEl){
   photoSliderEl.onclick = (event) => {
     if(event.defaultPrevented) return;
     if(event.target.closest('.benefit-detail-photo-slide') || event.target.closest('.benefit-photo-zoom-icon')){
       event.preventDefault();
       event.stopPropagation();
       openBenefitImagePreview(photoSliderEl, Number(photoSliderEl.dataset.currentIndex || 0), item.name || '혜택 사진');
     }
   };
   photoSliderEl.onkeydown = (event) => {
     if(event.key !== 'Enter' && event.key !== ' ') return;
     event.preventDefault();
     event.stopPropagation();
     if(typeof event.stopImmediatePropagation === 'function') event.stopImmediatePropagation();
     openBenefitImagePreview(photoSliderEl, Number(photoSliderEl.dataset.currentIndex || 0), item.name || '혜택 사진');
   };
 }
 {
   const reservationBtn = qs('#openCalendarReservationBtn');
   if(reservationBtn){
     reservationBtn.onclick = (event) => {
       event.preventDefault();
       event.stopPropagation();
       if(typeof event.stopImmediatePropagation === 'function') event.stopImmediatePropagation();
       openCalendarReservationModal(item);
     };
   }
 }
 qs('#benefitCopyShareBtn')?.addEventListener('click', () => copyShareUrl('benefit', item));
 qs('#benefitKakaoShareBtn')?.addEventListener('click', (event) => withShareButtonFeedback(event.currentTarget, 'benefit', () => shareKakaoItem('benefit', item)));
 qs('#benefitQrShareBtn')?.addEventListener('click', () => showQrCode('benefit', item));
 bindResidentReactionButtons(item);
 bindNaverReservationButtons(qs('#modalBody'));
 updateDistanceText(item);
 setTimeout(() => renderDetailMiniMap(item), 120);
 setTimeout(() => {
   try{
     if(detailMapInstance && window.naver?.maps){
       window.naver.maps.Event.trigger(detailMapInstance, 'resize');
     }
   }catch(_){}
 }, 700);
 qs('#modalFavBtn').onclick=async (event)=>{
 event?.preventDefault?.();
 event?.stopPropagation?.();
 if(typeof event?.stopImmediatePropagation === 'function') event.stopImmediatePropagation();
 const isFavorite = await toggleFavorite(item.id, item.name);
 const btn = qs('#modalFavBtn');
 if (btn) {
   btn.innerHTML = `<img class="upick-svg-icon" src="/icons/internal/${isFavorite ? 'star-fill' : 'star-outline'}.svg" alt="" loading="lazy" decoding="async">`;
   btn.classList.toggle('is-favorite', isFavorite);
   btn.setAttribute('aria-pressed', isFavorite ? 'true' : 'false');
   btn.setAttribute('aria-label', isFavorite ? '즐겨찾기 해제' : '즐겨찾기 추가');
   btn.title = isFavorite ? '즐겨찾기 해제' : '즐겨찾기 추가';
 }
 };
 qsa('#modalBody .benefit-contact-link[href^="tel:"]').forEach((link) => {
   link.addEventListener('click', () => { increaseStat(item.id, item.name, 'callClickCount'); logBenefitEvent(item.id, 'call_click'); });
 });
 qs('#mapBtn').onclick=()=>{increaseStat(item.id, item.name, 'mapClickCount');logBenefitEvent(item.id, 'map_click');};
 qs('#directionBtn').onclick=()=>{increaseStat(item.id, item.name, 'directionClickCount');logBenefitEvent(item.id, 'direction_click');};
 bindBenefitSocialLinks(item);
 }

 let residentProximityWatchId = null;

 function setNearbyProximityStatus(message, isError = false){
 const el = qs('#nearbyProximityStatus');
 if(!el) return;
 el.textContent = message;
 el.classList.toggle('error', !!isError);
 }

 async function enableNearbyAutoPush(){
 try{
 if(!navigator.geolocation){ setNearbyProximityStatus('이 브라우저에서는 위치 기반 알림을 사용할 수 없습니다.', true); return; }
 await getReliableCurrentPosition({ forceRefresh:true });
 checkProximityAlerts({ silent:false });
 if(residentProximityWatchId === null){
 residentProximityWatchId = navigator.geolocation.watchPosition((position) => {
 setUserLocationFromPosition(position);
 checkProximityAlerts({ silent:false });
 renderNearbyHotStores();
 }, (error) => {
 console.warn('근처 자동 알림 위치 감시 실패', error);
 setNearbyProximityStatus('위치 권한을 허용해야 근처 자동 알림을 사용할 수 있습니다.', true);
 }, GEO_OPTIONS);
 }
 setNearbyProximityStatus('근처 자동 알림이 켜졌습니다. 100m / 300m 진입 시 알려드립니다.');
 renderNearbyHotStores();
 }catch(error){ console.warn('근처 자동 알림 시작 실패', error); setNearbyProximityStatus('위치 권한을 허용해야 근처 자동 알림을 사용할 수 있습니다.', true); }
 }

 async function checkNearbyNow(){
 try{ await getReliableCurrentPosition({ forceRefresh:true }); recalculateBenefitDistances(); checkProximityAlerts({ silent:false }); renderNearbyHotStores(); setNearbyProximityStatus('현재 위치 기준으로 주변 혜택을 확인했습니다.'); }
 catch(error){ console.warn('주변 혜택 확인 실패', error); setNearbyProximityStatus('현재 위치를 확인할 수 없습니다. 위치 권한을 확인해 주세요.', true); }
 }

 function renderNearbyHotStores(){
 if(!qs('#nearbyProximityPanel') || !state.userLocation) return;
 const candidates = (state.popularItems || []).map((item) => {
 const benefit = item.benefit || state.benefits.find((v) => v.id === item.id) || item;
 if(!isRecommendableBenefit(benefit)) return null;
 const pos = getBenefitLatLng(benefit); if(!pos) return null;
 const distance = getDistanceMeters(state.userLocation.lat, state.userLocation.lng, pos.lat, pos.lng);
 let distanceBonus = 0; if(distance <= 100) distanceBonus = 30; else if(distance <= 300) distanceBonus = 20; else if(distance <= 500) distanceBonus = 10;
 return { ...item, benefit, distance, nearbyScore: Number(item.popularScore || item.score || 0) + distanceBonus };
 }).filter(Boolean).filter((item) => Number.isFinite(item.distance) && item.distance <= 500).sort((a,b) => b.nearbyScore - a.nearbyScore).slice(0,3);
 if(!candidates.length) return;
 setNearbyProximityStatus('HOT 근처 HOT: ' + candidates.map((item, index) => `${index + 1}. ${item.name} · ${formatDistance(item.distance)}`).join(' / '));
 }

 function renderResidentRankings(items = []){
 const list = qs('#residentRankList'); if(!list) return;
 if(!items.length){ list.innerHTML = '<div class="notice-empty">아직 활동 랭킹 정보가 없습니다.</div>'; return; }
 list.innerHTML = items.map((item, index) => {
 const rank = index + 1; const medal = rank <= 3 ? getRankMedalSvg(rank) : rank; const medalClass = rank <= 3 ? `has-svg ${getRankMedalClass(rank)}` : '';
 return `<div class="resident-rank-row"><div class="resident-rank-left"><div class="resident-rank-medal ${medalClass}" aria-label="${rank}위">${medal}</div><div class="resident-rank-copy"><div class="resident-rank-name">${escapeHtml(item.nickname || item.loginId || '입주민')}</div><div class="resident-rank-sub">활동 ${Number(item.activityCount || 0).toLocaleString('ko-KR')}회 · 최근 ${escapeHtml(item.lastActivityType || 'activity')}</div></div></div><div class="resident-rank-score"><strong>${Number(item.score || 0).toLocaleString('ko-KR')}</strong><span>점수</span></div></div>`;
 }).join('');
 }

 function subscribeResidentActivityRanking(){
 try{
 const rankQuery = query(collection(db, 'user_stats'), orderBy('score','desc'), limit(5));
 onSnapshot(rankQuery, (snapshot) => {
 renderResidentRankings(snapshot.docs.map((d) => ({ id:d.id, ...d.data() })));
 const text = qs('#residentRankUpdatedText'); if(text) text.textContent = `실시간 · ${new Date().toLocaleTimeString('ko-KR', { hour:'2-digit', minute:'2-digit' })}`;
 }, (error) => { console.warn('입주민 활동 랭킹 로드 실패', error); renderResidentRankings([]); });
 }catch(error){ console.warn('입주민 활동 랭킹 초기화 실패', error); }
 }

 /* =========================
 Community v1: posts / comments / reports
 ========================= */
 const COMMUNITY_POSTS_COLLECTION = 'community_posts';
 const COMMUNITY_REPORTS_COLLECTION = 'community_reports';
 const COMMUNITY_CATEGORIES = ['전체','자유','질문','나눔','생활정보','건의'];
 const communityState = { category:'전체', lastDoc:null, loading:false, currentPostId:null, pageSize:10, reportTarget:null, reportReason:'욕설/비방', editingPostId:null, currentPostAuthorUid:null };

 function formatCommunityDate(value){ try{ const d = value?.toDate ? value.toDate() : (value ? new Date(value) : null); if(!d) return ''; const yyyy = d.getFullYear(); const mm = String(d.getMonth()+1).padStart(2,'0'); const dd = String(d.getDate()).padStart(2,'0'); return `${yyyy}.${mm}.${dd}`; }catch(_){ return ''; } }
 function getCommunityPostScore(post={}){ return (Number(post.likeCount||0)*6) + (Number(post.commentCount||0)*4) + Number(post.viewCount||0) + Number(post.reportCount||0); }
 function communityTopBadgeHtml(post={}){ const score = getCommunityPostScore(post); if(score < 10) return ''; const label = score >= 40 ? 'HOT 인기글 TOP' : 'HOT 인기글'; return `<span class="community-top-badge">${label}</span>`; }
 function communityTodayKey(){ const d=new Date(); return d.getFullYear()+String(d.getMonth()+1).padStart(2,'0')+String(d.getDate()).padStart(2,'0'); }
 async function recordCommunityView(kind, postId, commentId=''){ const user=auth.currentUser; if(!user || !postId) return; const day=communityTodayKey(); const id = kind === 'comment' ? 'comment_'+postId+'_'+commentId+'_'+user.uid+'_'+day : 'post_'+postId+'_'+user.uid+'_'+day; try{ await setDoc(doc(db,'community_view_events',id), { kind, postId, commentId:commentId||null, uid:user.uid, day, createdAt:serverTimestamp() }, { merge:false }); }catch(_){ } }
 function commentLikeDocId(postId, commentId, uid){ return uid; }
 async function isCommentLiked(postId, commentId){ const user = auth.currentUser; if(!user) return false; try{ const likeId = commentLikeDocId(postId, commentId, user.uid); const likeSnap = await getDoc(doc(db, COMMUNITY_POSTS_COLLECTION, postId, 'comments', commentId, 'likes', likeId)); return likeSnap.exists(); }catch(_){ return false; } }
 function commentMetaHtml(c={}, liked=false){
 const rawLikeCount = Number(c.likeCount || 0);
 // Cloud Function이 likeCount를 갱신하기 전이어도, 내가 이미 누른 좋아요는 즉시 1 이상으로 표시합니다.
 const likeCount = liked && rawLikeCount < 1 ? 1 : rawLikeCount;
 const viewCount = Number(c.viewCount || 0);
 return `<div class="comment-meta-line"><button class="comment-like-btn ${liked?'liked':''}" type="button" data-community-action="like-comment" data-post-id="${escapeHtml(communityState.currentPostId || '')}" data-comment-id="${escapeHtml(c.id || '')}" data-liked="${liked ? 'true' : 'false'}" data-like-count="${likeCount}" aria-label="댓글 좋아요">♥ ${likeCount}</button><span>조회 ${viewCount}</span><span>${formatCommunityDate(c.createdAt)}</span></div>`;
 }
 function applyCommentLikeOptimistic(postId, commentId, liked){
 const btn = document.querySelector(`.comment-like-btn[data-post-id="${CSS.escape(postId)}"][data-comment-id="${CSS.escape(commentId)}"]`);
 if(!btn) return null;
 const before = { liked: btn.dataset.liked === 'true', count: Number(btn.dataset.likeCount || 0) };
 const nextCount = Math.max(0, before.count + (liked ? 1 : -1));
 btn.dataset.liked = liked ? 'true' : 'false';
 btn.dataset.likeCount = String(nextCount);
 btn.classList.toggle('liked', liked);
 btn.textContent = `♥ ${nextCount}`;
 btn.disabled = true;
 btn.style.opacity = '.78';
 return { btn, before };
 }
 function rollbackCommentLikeOptimistic(target){
 if(!target?.btn || !target.before) return;
 const { btn, before } = target;
 btn.dataset.liked = before.liked ? 'true' : 'false';
 btn.dataset.likeCount = String(before.count);
 btn.classList.toggle('liked', before.liked);
 btn.textContent = `♥ ${before.count}`;
 btn.disabled = false;
 btn.style.opacity = '';
 }
 function releaseCommentLikeButton(target){
 if(!target?.btn) return;
 target.btn.disabled = false;
 target.btn.style.opacity = '';
 }
 async function toggleCommunityCommentLike(postId, commentId){
 const user = auth.currentUser;
 if(!user) return openModalAlert('입장이 필요합니다.');
 if(!postId || !commentId) return;
 const likeId = commentLikeDocId(postId, commentId, user.uid);
 const likeRef = doc(db, COMMUNITY_POSTS_COLLECTION, postId, 'comments', commentId, 'likes', likeId);
 let optimisticTarget = null;
 try{
 const snap = await getDoc(likeRef);
 const willLike = !snap.exists();
 optimisticTarget = applyCommentLikeOptimistic(postId, commentId, willLike);
 if(snap.exists()){
 await deleteDoc(likeRef);
 }else{
 await setDoc(likeRef, { uid:user.uid, postId, commentId, createdAt:serverTimestamp() });
 }
 releaseCommentLikeButton(optimisticTarget);
 // likeCount는 Cloud Function에서 안전하게 확정되므로 약간 뒤에 조용히 동기화합니다.
 window.clearTimeout(communityState.commentLikeSyncTimer);
 communityState.commentLikeSyncTimer = window.setTimeout(() => {
 if(communityState.currentPostId === postId) loadCommunityComments(postId);
 }, 1200);
 }catch(error){
 console.error(error);
 rollbackCommentLikeOptimistic(optimisticTarget);
 openModalAlert('댓글 좋아요 처리 중 오류가 발생했습니다.');
 }
 }
 function getCurrentNickname(){ return state.currentUserProfile?.nickname || state.userProfile?.nickname || state.profile?.nickname || getStoredLoginUser()?.loginId || '입주민'; }
 const UPICK_MOTION_DIALOG_EXCLUDED_IDS = new Set([
 'newsImagePreviewOverlay',
 'benefitImagePreviewOverlay'
]);

 function isMotionDialogExcluded(el){
 return !el || UPICK_MOTION_DIALOG_EXCLUDED_IDS.has(el.id || '') || el.classList?.contains('news-image-preview-overlay') || el.classList?.contains('benefit-image-preview-overlay');
 }

 function openNativeDialogSafe(el){
 if(!el) return;
 try{
  if(typeof el.showModal === 'function' && !el.open) el.showModal();
  else el.setAttribute('open','');
 }catch(_){
  try{ el.setAttribute('open',''); }catch(__){}
 }
 }

 function closeNativeDialogSafe(el){
 if(!el) return;
 try{
  if(typeof el.close === 'function' && el.open) el.close();
  else el.removeAttribute('open');
 }catch(_){
  try{ el.removeAttribute('open'); }catch(__){}
 }
 }

 function cleanupMotionDialogClasses(el){
 if(!el) return;
 el.classList.remove('show','closing','is-closing','upick-motion-open','upick-motion-closing','upick-motion-layer','upick-motion-panel');
 el.removeAttribute('data-upick-motion-closing');
 }


 function isDivMotionDialog(el){
  return !!(el && (el.classList?.contains('upick-div-dialog') || el.tagName !== 'DIALOG'));
 }

 function ensureDivDialogPanel(el){
  if(!el || !isDivMotionDialog(el)) return el;
  var existingPanel = el.querySelector?.(':scope > .upick-div-modal-panel, :scope > .upick-div-dialog-panel');
  if(existingPanel){
    el.dataset.upickDivPanelReady = '1';
    if(el.dataset.upickBackdropClickBound !== '1'){
      el.dataset.upickBackdropClickBound = '1';
      el.addEventListener('click', function(event){
        if(event.target === el || event.target.classList?.contains('upick-div-modal-backdrop')){
          event.preventDefault();
          event.stopPropagation();
        }
      }, true);
    }
    return existingPanel;
  }
  if(el.dataset.upickDivPanelReady === '1') return el;
  var panel = document.createElement('div');
  panel.className = 'upick-div-dialog-panel';
  while(el.firstChild){ panel.appendChild(el.firstChild); }
  el.appendChild(panel);
  el.dataset.upickDivPanelReady = '1';
  el.addEventListener('click', function(event){
    if(event.target === el){
      event.preventDefault();
      event.stopPropagation();
    }
  }, true);
  return panel;
 }

 function openDialogSafe(el, options = {}){
 if(!el) return;
 try{ el = __duMountLegacyElement(el) || el; }catch(_){}
 if(isMotionDialogExcluded(el) || !window.UpickMotion){
  openNativeDialogSafe(el);
  try{ UpickPopupStack.bring(el); }catch(_){}
  return;
 }
 if(el.dataset.upickMotionClosing === '1') return;
 if(el.open || el.hasAttribute('open')) closeNativeDialogSafe(el);
 cleanupMotionDialogClasses(el);
 const motionPanel = ensureDivDialogPanel(el);
 el.classList.add('upick-motion-dialog','upick-motion-layer');
 if(!isDivMotionDialog(el)) el.classList.add('upick-motion-panel');
 el.setAttribute('aria-hidden','false');
 openNativeDialogSafe(el);
 try{ UpickPopupStack.bring(el); }catch(_){}
 window.UpickMotion.open(el,{
  activeClass:'show',
  closingClass:'is-closing',
  panel:motionPanel || el,
  duration:Number.isFinite(options.duration) ? options.duration : 240,
  afterOpen:function(){
   const focusTarget = options.initialFocusSelector ? qs(options.initialFocusSelector) : null;
   requestAnimationFrame(function(){
    try{ (focusTarget || el.querySelector('[autofocus], button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])') || el)?.focus?.({preventScroll:true}); }catch(_){}
   });
   try{ if(typeof window.__upickSyncModalScrollLock === 'function') window.__upickSyncModalScrollLock(); }catch(_){}
  }
 });
 }

 function closeDialogSafe(el, options = {}){
 if(!el) return;
 const afterClose = typeof options.afterClose === 'function' ? options.afterClose : null;
 if(isMotionDialogExcluded(el) || !window.UpickMotion || !(el.open || el.hasAttribute('open') || el.classList.contains('show'))){
  closeNativeDialogSafe(el);
  try{ UpickPopupStack.release(el); }catch(_){}
  try{ window.DuLayer?.unmount?.(el); }catch(_){}
  if(afterClose) afterClose();
  return;
 }
 if(el.dataset.upickMotionClosing === '1') return;
 el.dataset.upickMotionClosing = '1';
 const motionPanel = ensureDivDialogPanel(el);
 window.UpickMotion.close(el,{
  activeClass:'show',
  closingClass:'is-closing',
  panel:motionPanel || el,
  duration:Number.isFinite(options.duration) ? options.duration : 240,
  afterClose:function(){
   closeNativeDialogSafe(el);
   try{ UpickPopupStack.release(el); }catch(_){}
   cleanupMotionDialogClasses(el);
   try{ cleanupMotionDialogClasses(el.querySelector(':scope > .upick-div-dialog-panel')); }catch(_){}
   el.setAttribute('aria-hidden','true');
   try{ if(typeof window.__upickSyncModalScrollLock === 'function') window.__upickSyncModalScrollLock(); }catch(_){}
   try{ window.DuLayer?.unmount?.(el); }catch(_){}
   if(afterClose) afterClose();
  }
 });
 }
 function communityReportIconHtml(label='신고'){ return `<button class="report-icon-btn" type="button" data-community-action="report" title="${label}" aria-label="${label}"><svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 9v4"></path><path d="M12 17h.01"></path><path d="M10.29 3.86 3.19 16.14A2 2 0 0 0 4.9 19h14.2a2 2 0 0 0 1.71-2.86L13.71 3.86a2 2 0 0 0-3.42 0Z"></path></svg></button>`; }
 function isCommunityAdmin(){ try{ if(typeof isAdminRole === 'function' && isAdminRole()) return true; }catch(_){} const role = state.currentUserProfile?.role || state.userProfile?.role || state.profile?.role || ''; return role === 'admin' || role === 'root'; }
 function isCommunityOwner(data){ const user = auth.currentUser; return !!(user && data && data.authorUid === user.uid); }
 function getCurrentCommunityAuthorProfile(){
 const profile = state.currentUserProfile || state.userProfile || state.profile || {};
 const role = String(profile.role || profile.userRole || 'resident').toLowerCase();
 return { authorNickname:getCurrentNickname(), authorProfileImageUrl:(typeof getProfileImageUrl === 'function' ? getProfileImageUrl() : (profile.profileImageUrl || profile.photoUrl || profile.avatarUrl || '')), authorRole:role || 'resident' };
 }
 function getCommunityAuthorRole(data={}){ return String(data.authorRole || data.role || data.userRole || '').toLowerCase(); }
 function getCommunityAuthorImage(data={}){ return String(data.authorProfileImageUrl || data.authorPhotoUrl || data.profileImageUrl || data.photoUrl || data.avatarUrl || '').trim(); }
 function getCommunityAuthorInitial(name='입주민'){ const value = String(name || '입주민').trim(); return escapeHtml(value.slice(0,1) || '입'); }
 function communityAuthorHtml(data={}, options={}){
 const name = data.authorNickname || data.nickname || '입주민';
 const role = getCommunityAuthorRole(data);
 const isRoot = role === 'root';
 const isAdmin = role === 'admin' || isRoot;
 const isWriter = !!(options.postAuthorUid && data.authorUid && options.postAuthorUid === data.authorUid) || !!options.forceWriter;
 const imageUrl = getCommunityAuthorImage(data);
 const roleClass = isRoot ? 'is-root' : (isAdmin ? 'is-admin' : '');
 const avatar = imageUrl ? `<span class="community-author-avatar"><img src="${escapeAttr(imageUrl)}" alt="프로필 이미지" loading="lazy"></span>` : `<span class="community-author-avatar">${getCommunityAuthorInitial(name)}</span>`;
 const adminBadge = isRoot ? '<span class="community-author-badge root"> 관리자</span>' : (isAdmin ? '<span class="community-author-badge admin">🛡 관리자</span>' : '');
 const writerBadge = isWriter ? '<span class="community-author-badge writer">작성자</span>' : '';
 return `<span class="community-author-line ${roleClass}">${avatar}<span class="community-author-name">${escapeHtml(name)}</span>${adminBadge}${writerBadge}</span>`;
 }
 function communityActionsHtml(type, data, options={}){ const id = options.id || data?.id || ''; const postId = options.postId || id; const status = data?.status || 'active'; const owner = isCommunityOwner(data); const admin = isCommunityAdmin(); const bits = []; if(status === 'active') bits.push(communityReportIconHtml(type === 'comment' ? '댓글 신고' : '게시글 신고')); if(type === 'post' && status === 'active' && owner) bits.push(`<button class="community-icon-btn edit" type="button" data-community-action="edit-post" data-post-id="${escapeHtml(id)}" title="수정" aria-label="수정">✎</button>`); if(type === 'comment' && status === 'active' && owner) bits.push(`<button class="community-icon-btn edit" type="button" data-community-action="edit-comment" data-post-id="${escapeHtml(postId)}" data-comment-id="${escapeHtml(options.commentId || '')}" title="수정" aria-label="수정">✎</button>`); if(status === 'active' && (owner || admin)) bits.push(`<button class="community-icon-btn delete" type="button" data-community-action="delete-${type}" data-post-id="${escapeHtml(postId)}" data-comment-id="${escapeHtml(options.commentId || '')}" title="삭제" aria-label="삭제">🗑</button>`); if(status === 'active' && admin) bits.push(`<button class="community-icon-btn blind" type="button" data-community-action="blind-${type}" data-post-id="${escapeHtml(postId)}" data-comment-id="${escapeHtml(options.commentId || '')}" title="블라인드" aria-label="블라인드">◌</button>`); if((status === 'deleted' || status === 'hidden') && (owner || admin)) bits.push(`<button class="community-icon-btn restore" type="button" data-community-action="restore-${type}" data-post-id="${escapeHtml(postId)}" data-comment-id="${escapeHtml(options.commentId || '')}" title="복구" aria-label="복구">↩</button>`); return bits.length ? `<div class="${type === 'comment' ? 'comment-action-row' : 'community-action-row'}">${bits.join('')}</div>` : ''; }
 function bindCommunityActionButtons(root, data, options={}){ root?.querySelectorAll('[data-community-action]').forEach(btn => btn.addEventListener('click', (event) => { event.stopPropagation(); const action = btn.dataset.communityAction; const postId = btn.dataset.postId || options.postId || data?.id; const commentId = btn.dataset.commentId || options.commentId; if(action === 'report') return openCommunityReportModal(options.type || 'post', postId, commentId || null, data?.title || data?.content || '커뮤니티'); if(action === 'like-comment') return toggleCommunityCommentLike(postId, commentId); if(action === 'edit-post') return openCommunityPostEdit(postId); if(action === 'edit-comment') return editCommunityCommentInline(postId, commentId); if(action === 'delete-post') return deleteCommunityPost(postId); if(action === 'blind-post') return blindCommunityPost(postId); if(action === 'restore-post') return restoreCommunityPost(postId); if(action === 'delete-comment') return deleteCommunityComment(postId, commentId); if(action === 'blind-comment') return blindCommunityComment(postId, commentId); if(action === 'restore-comment') return restoreCommunityComment(postId, commentId); })); }

 function renderCommunityCategoryFilter(){
 const box = qs('#communityCategoryFilter');
 if(!box) return;
 box.innerHTML = COMMUNITY_CATEGORIES.map(cat => `<button type="button" class="${communityState.category===cat?'active':''}" data-community-category="${cat}">${cat}</button>`).join('');
 enableHorizontalDragScroll(box);
 box.querySelectorAll('[data-community-category]').forEach(btn => {
 btn.addEventListener('click', (event) => {
 event.preventDefault();
 const nextCategory = btn.dataset.communityCategory || '전체';
 loadCommunityPosts(nextCategory, true);
 });
 });
 }
 async function loadCommunityPosts(category='전체', reset=true){ if(communityState.loading) return; communityState.loading = true; communityState.category = category || '전체'; renderCommunityCategoryFilter(); const list = qs('#communityPostList'); const moreBtn = qs('#communityMoreBtn'); try{ if(reset){ communityState.lastDoc = null; if(list) list.innerHTML = '<div class="panel loading">게시글을 불러오는 중입니다.</div>'; } let constraints = [where('status','==','active')]; if(communityState.category !== '전체') constraints.push(where('category','==',communityState.category)); constraints.push(orderBy('createdAt','desc')); if(communityState.lastDoc) constraints.push(startAfter(communityState.lastDoc)); constraints.push(limit(communityState.pageSize)); const snap = await getDocs(query(collection(db, COMMUNITY_POSTS_COLLECTION), ...constraints)); const posts = snap.docs.map(d => ({ id:d.id, ...d.data() })); if(reset && list) list.innerHTML = ''; renderCommunityPosts(posts, !reset); communityState.lastDoc = snap.docs.length ? snap.docs[snap.docs.length - 1] : communityState.lastDoc; if(moreBtn) moreBtn.classList.toggle('hidden', snap.docs.length < communityState.pageSize); const countText = qs('#communityCountText'); if(countText) countText.textContent = posts.length ? `${communityState.category} 게시글` : '게시글'; }catch(error){ console.error('커뮤니티 게시글 로드 실패', error); if(list) list.innerHTML = '<div class="panel empty">게시글을 불러오지 못했습니다. Firestore 규칙과 인덱스를 확인해주세요.</div>'; }finally{ communityState.loading = false; } }
 function renderCommunityPosts(posts=[], append=false){ const list = qs('#communityPostList'); if(!list) return; if(!append) list.innerHTML = ''; if(!posts.length && !append){ list.innerHTML = '<div class="panel empty">아직 등록된 게시글이 없습니다.</div>'; return; } posts.forEach(post => { const card = document.createElement('div'); const topClass = getCommunityPostScore(post) >= 10 ? ' community-top-post' : ''; card.className = `community-card${topClass}`; card.innerHTML = `${communityActionsHtml('post', post, { id:post.id, type:'post' })}${communityTopBadgeHtml(post)}<span class="community-category">${escapeHtml(post.category || '자유')}</span><h4>${escapeHtml(post.title || '제목 없음')}</h4><p>${escapeHtml(String(post.content || '').slice(0,90))}${String(post.content || '').length>90?'...':''}</p><div class="community-post-bottom"><div class="community-author-wrap">${communityAuthorHtml(post, { forceWriter:isCommunityOwner(post) })}</div><div class="community-meta-line"><span>댓글 ${Number(post.commentCount||0)}</span><span>조회 ${Number(post.viewCount||0)}</span><span>${formatCommunityDate(post.createdAt)}</span></div></div>`; card.addEventListener('click', () => openCommunityDetail(post.id)); bindCommunityActionButtons(card, post, { id:post.id, postId:post.id, type:'post' }); list.appendChild(card); }); }
 function openCommunityEditor(){ communityState.editingPostId = null; qs('#communityEditorTitle').textContent = '커뮤니티 글쓰기'; qs('#submitCommunityPostBtn').textContent = '게시글 등록'; qs('#communityPostTitle').value = ''; qs('#communityPostContent').value = ''; qs('#communityPostCategory').value = communityState.category !== '전체' ? communityState.category : '자유'; openDialogSafe(qs('#communityEditorModal')); }
 async function openCommunityPostEdit(postId){ const user = auth.currentUser; if(!user) return openModalAlert('입장이 필요합니다.'); try{ const snap = await getDoc(doc(db, COMMUNITY_POSTS_COLLECTION, postId)); if(!snap.exists()) return openModalAlert('게시글을 찾을 수 없습니다.'); const p = { id:postId, ...snap.data() }; if(!isCommunityOwner(p)) return openModalAlert('게시글 작성자만 수정할 수 있습니다.'); communityState.editingPostId = postId; qs('#communityEditorTitle').textContent = '게시글 수정'; qs('#submitCommunityPostBtn').textContent = '수정 완료'; qs('#communityPostTitle').value = p.title || ''; qs('#communityPostContent').value = p.content || ''; qs('#communityPostCategory').value = p.category || '자유'; openDialogSafe(qs('#communityEditorModal')); }catch(error){ console.error(error); openModalAlert('게시글 수정 화면을 열지 못했습니다.'); } }
 async function submitCommunityPost(){ const user = auth.currentUser; if(!user) return openModalAlert('입장이 필요합니다.'); const title = qs('#communityPostTitle')?.value?.trim(); const content = qs('#communityPostContent')?.value?.trim(); const category = qs('#communityPostCategory')?.value || '자유'; if(!title || !content) return openModalAlert('제목과 내용을 입력해주세요.'); try{ if(communityState.editingPostId){ const editId = communityState.editingPostId; await updateDoc(doc(db, COMMUNITY_POSTS_COLLECTION, editId), { title, content, category, editedAt:serverTimestamp(), updatedAt:serverTimestamp() }); communityState.editingPostId = null; closeDialogSafe(qs('#communityEditorModal')); await openCommunityDetail(editId); await loadCommunityPosts(communityState.category || '전체', true); return openModalAlert('게시글이 수정되었습니다.'); } await addDoc(collection(db, COMMUNITY_POSTS_COLLECTION), { title, content, category, authorUid:user.uid, ...getCurrentCommunityAuthorProfile(), status:'active', reportCount:0, commentCount:0, viewCount:0, createdAt:serverTimestamp(), updatedAt:serverTimestamp() }); closeDialogSafe(qs('#communityEditorModal')); await loadCommunityPosts('전체', true); openModalAlert('게시글이 등록되었습니다.'); }catch(error){ console.error(error); openModalAlert(communityState.editingPostId ? '게시글 수정 중 오류가 발생했습니다.' : '게시글 등록 중 오류가 발생했습니다.'); } }
 async function openCommunityDetail(postId){ communityState.currentPostId = postId; try{ const refDoc = doc(db, COMMUNITY_POSTS_COLLECTION, postId); await recordCommunityView('post', postId); const snap = await getDoc(refDoc); if(!snap.exists()) return openModalAlert('존재하지 않는 게시글입니다.'); const p = { id:postId, ...snap.data() }; if(p.status === 'deleted') return openModalAlert('삭제된 게시글입니다.'); if(p.status === 'hidden') return openModalAlert('관리자에 의해 가려진 게시글입니다.'); communityState.currentPostAuthorUid = p.authorUid || null; qs('#communityDetailBody').innerHTML = `<div class="community-detail-shell">${communityActionsHtml('post', p, { id:postId, postId, type:'post' })}<h2 class="community-detail-title">${escapeHtml(p.title || '')}</h2><span class="community-category">${escapeHtml(p.category || '자유')}</span><div class="community-detail-content">${escapeHtml(p.content || '')}</div><div class="community-detail-bottom"><div class="community-author-wrap">${communityAuthorHtml(p, { forceWriter:true })}</div><div class="community-meta-line"><span>댓글 ${Number(p.commentCount||0)}</span><span>조회 ${Number(p.viewCount||0)}</span><span>${formatCommunityDate(p.createdAt)}</span></div></div></div>`; bindCommunityActionButtons(qs('#communityDetailBody'), p, { id:postId, postId, type:'post' }); openDialogSafe(qs('#communityDetailModal')); await loadCommunityComments(postId); }catch(error){ console.error(error); openModalAlert('게시글을 불러오지 못했습니다.'); } }
 async function loadCommunityComments(postId){ const list = qs('#communityCommentList'); if(!list) return; list.innerHTML = '<div class="loading">댓글을 불러오는 중입니다.</div>'; try{ const snap = await getDocs(query(collection(db, COMMUNITY_POSTS_COLLECTION, postId, 'comments'), orderBy('createdAt','asc'), limit(100))); if(snap.empty){ list.innerHTML = '<div class="notice-empty">아직 댓글이 없습니다.</div>'; return; } list.innerHTML = ''; for(const d of snap.docs){ const c={ id:d.id, ...d.data() }; const status = c.status || 'active'; const el=document.createElement('div'); el.className='comment-card'; el.dataset.commentId = d.id; if(status === 'deleted' || status === 'hidden'){ const message = status === 'hidden' ? '관리자에 의해 가려진 댓글입니다.' : '삭제된 댓글입니다.'; el.innerHTML = `${communityActionsHtml('comment', c, { postId, commentId:d.id, type:'comment' })}<div class="community-deleted-placeholder"><span class="reason">🫥 ${message}</span></div>`; }else{ await recordCommunityView('comment', postId, d.id); const liked = await isCommentLiked(postId, d.id); el.innerHTML=`${communityActionsHtml('comment', c, { postId, commentId:d.id, type:'comment' })}${communityAuthorHtml(c, { postAuthorUid:communityState.currentPostAuthorUid })}<p class="comment-content">${escapeHtml(c.content || '')}</p><div class="comment-bottom">${commentMetaHtml(c, liked)}</div>`; } bindCommunityActionButtons(el, c, { postId, commentId:d.id, type:'comment' }); list.appendChild(el); } }catch(error){ console.error(error); list.innerHTML = '<div class="notice-empty">댓글을 불러오지 못했습니다.</div>'; } }
 async function submitCommunityComment(){ const user = auth.currentUser; if(!user || !communityState.currentPostId) return openModalAlert('입장이 필요합니다.'); const content = qs('#communityCommentContent')?.value?.trim(); if(!content) return openModalAlert('댓글을 입력해주세요.'); const postId = communityState.currentPostId; try{ await addDoc(collection(db, COMMUNITY_POSTS_COLLECTION, postId, 'comments'), { content, authorUid:user.uid, ...getCurrentCommunityAuthorProfile(), status:'active', likeCount:0, viewCount:0, createdAt:serverTimestamp(), updatedAt:serverTimestamp() }); await updateDoc(doc(db, COMMUNITY_POSTS_COLLECTION, postId), { commentCount: increment(1), updatedAt: serverTimestamp() }); qs('#communityCommentContent').value = ''; await loadCommunityComments(postId); }catch(error){ console.error(error); openModalAlert('댓글 등록 중 오류가 발생했습니다.'); } }
 function editCommunityCommentInline(postId, commentId){ const card = qs(`.comment-card[data-comment-id="${CSS.escape(commentId)}"]`); if(!card) return; const p = card.querySelector('.comment-content'); if(!p) return; const current = p.textContent || ''; p.outerHTML = `<div class="comment-edit-box"><textarea maxlength="1000">${escapeHtml(current)}</textarea><div class="comment-edit-actions"><button class="btn btn-soft" type="button" data-comment-edit-cancel>취소</button><button class="btn btn-primary" type="button" data-comment-edit-save>저장</button></div></div>`; const box = card.querySelector('.comment-edit-box'); const textarea = box.querySelector('textarea'); textarea.focus(); textarea.setSelectionRange(textarea.value.length, textarea.value.length); box.querySelector('[data-comment-edit-cancel]')?.addEventListener('click', () => loadCommunityComments(postId)); box.querySelector('[data-comment-edit-save]')?.addEventListener('click', async () => { const value = textarea.value.trim(); if(!value) return openModalAlert('댓글 내용을 입력해주세요.'); try{ await updateDoc(doc(db, COMMUNITY_POSTS_COLLECTION, postId, 'comments', commentId), { content:value, editedAt:serverTimestamp(), updatedAt:serverTimestamp() }); await loadCommunityComments(postId); openModalAlert('댓글이 수정되었습니다.'); }catch(error){ console.error(error); openModalAlert('댓글 수정 중 오류가 발생했습니다.'); } }); }
 async function deleteCommunityPost(postId){ const ok = await openModalConfirm('게시글을 삭제하시겠습니까?\n삭제된 게시글은 휴지통 상태로 보관되며 복구할 수 있습니다.', null, '게시글 삭제', '삭제', '취소'); if(!ok) return; try{ await updateDoc(doc(db, COMMUNITY_POSTS_COLLECTION, postId), { status:'deleted', deletedAt:serverTimestamp(), deletedBy:auth.currentUser?.uid || null, deletedByRole:isCommunityAdmin()?'admin':'author', updatedAt:serverTimestamp() }); closeDialogSafe(qs('#communityDetailModal')); await loadCommunityPosts(communityState.category || '전체', true); openModalAlert('게시글이 삭제되었습니다.'); }catch(error){ console.error(error); openModalAlert('게시글 삭제 권한이 없거나 처리 중 오류가 발생했습니다.'); } }
 async function blindCommunityPost(postId){ if(!isCommunityAdmin()) return openModalAlert('관리자만 블라인드 처리할 수 있습니다.'); const ok = await openModalConfirm('게시글을 블라인드 처리하시겠습니까?', null, '게시글 블라인드', '블라인드', '취소'); if(!ok) return; try{ await updateDoc(doc(db, COMMUNITY_POSTS_COLLECTION, postId), { status:'hidden', hiddenAt:serverTimestamp(), hiddenBy:auth.currentUser?.uid || null, updatedAt:serverTimestamp() }); closeDialogSafe(qs('#communityDetailModal')); await loadCommunityPosts(communityState.category || '전체', true); openModalAlert('게시글이 블라인드 처리되었습니다.'); }catch(error){ console.error(error); openModalAlert('블라인드 처리 중 오류가 발생했습니다.'); } }
 async function restoreCommunityPost(postId){ const ok = await openModalConfirm('게시글을 복구하시겠습니까?', null, '게시글 복구', '복구', '취소'); if(!ok) return; try{ await updateDoc(doc(db, COMMUNITY_POSTS_COLLECTION, postId), { status:'active', restoredAt:serverTimestamp(), restoredBy:auth.currentUser?.uid || null, updatedAt:serverTimestamp() }); await loadCommunityPosts(communityState.category || '전체', true); openModalAlert('게시글이 복구되었습니다.'); }catch(error){ console.error(error); openModalAlert('게시글 복구 중 오류가 발생했습니다.'); } }
 async function deleteCommunityComment(postId, commentId){ const ok = await openModalConfirm('댓글을 삭제하시겠습니까?\n댓글 자리에는 “삭제된 댓글입니다.”가 표시됩니다.', null, '댓글 삭제', '삭제', '취소'); if(!ok) return; try{ const ref = doc(db, COMMUNITY_POSTS_COLLECTION, postId, 'comments', commentId); const snap = await getDoc(ref); const wasActive = snap.exists() && (snap.data().status || 'active') === 'active'; await updateDoc(ref, { status:'deleted', deletedAt:serverTimestamp(), deletedBy:auth.currentUser?.uid || null, deletedByRole:isCommunityAdmin()?'admin':'author', updatedAt:serverTimestamp() }); if(wasActive) await updateDoc(doc(db, COMMUNITY_POSTS_COLLECTION, postId), { commentCount: increment(-1), updatedAt:serverTimestamp() }).catch(()=>{}); await loadCommunityComments(postId); openModalAlert('댓글이 삭제되었습니다.'); }catch(error){ console.error(error); openModalAlert('댓글 삭제 권한이 없거나 처리 중 오류가 발생했습니다.'); } }
 async function blindCommunityComment(postId, commentId){ if(!isCommunityAdmin()) return openModalAlert('관리자만 블라인드 처리할 수 있습니다.'); const ok = await openModalConfirm('댓글을 블라인드 처리하시겠습니까?', null, '댓글 블라인드', '블라인드', '취소'); if(!ok) return; try{ const ref = doc(db, COMMUNITY_POSTS_COLLECTION, postId, 'comments', commentId); const snap = await getDoc(ref); const wasActive = snap.exists() && (snap.data().status || 'active') === 'active'; await updateDoc(ref, { status:'hidden', hiddenAt:serverTimestamp(), hiddenBy:auth.currentUser?.uid || null, updatedAt:serverTimestamp() }); if(wasActive) await updateDoc(doc(db, COMMUNITY_POSTS_COLLECTION, postId), { commentCount: increment(-1), updatedAt:serverTimestamp() }).catch(()=>{}); await loadCommunityComments(postId); openModalAlert('댓글이 블라인드 처리되었습니다.'); }catch(error){ console.error(error); openModalAlert('댓글 블라인드 처리 중 오류가 발생했습니다.'); } }
 async function restoreCommunityComment(postId, commentId){ const ok = await openModalConfirm('댓글을 복구하시겠습니까?', null, '댓글 복구', '복구', '취소'); if(!ok) return; try{ const ref = doc(db, COMMUNITY_POSTS_COLLECTION, postId, 'comments', commentId); const snap = await getDoc(ref); const wasInactive = snap.exists() && (snap.data().status || 'active') !== 'active'; await updateDoc(ref, { status:'active', restoredAt:serverTimestamp(), restoredBy:auth.currentUser?.uid || null, updatedAt:serverTimestamp() }); if(wasInactive) await updateDoc(doc(db, COMMUNITY_POSTS_COLLECTION, postId), { commentCount: increment(1), updatedAt:serverTimestamp() }).catch(()=>{}); await loadCommunityComments(postId); openModalAlert('댓글이 복구되었습니다.'); }catch(error){ console.error(error); openModalAlert('댓글 복구 중 오류가 발생했습니다.'); } }
 function openCommunityReportModal(targetType, postId, commentId=null, targetPreview=''){ const user = auth.currentUser; if(!user) return openModalAlert('입장이 필요합니다.'); communityState.reportTarget = { targetType, postId, commentId, targetPreview:String(targetPreview||'').slice(0,80) }; communityState.reportReason = '욕설/비방'; qsa('#communityReportReasons .community-report-reason').forEach(btn => btn.classList.toggle('selected', btn.dataset.reportReason === communityState.reportReason)); openDialogSafe(qs('#communityReportModal')); }
 async function submitCommunityReport(){ const user = auth.currentUser; const target = communityState.reportTarget; if(!user || !target?.postId) return openModalAlert('신고 대상 정보가 없습니다.'); const reason = communityState.reportReason || '기타'; const commentKey = target.commentId || 'post'; const reportId = `${target.targetType}_${target.postId}_${commentKey}_${user.uid}`; try{ await setDoc(doc(db, COMMUNITY_REPORTS_COLLECTION, reportId), { targetType:target.targetType, postId:target.postId, commentId:target.commentId || null, reason, reasonCode:reason, targetPreview:target.targetPreview || '', reporterUid:user.uid, reporterNickname:getCurrentNickname(), status:'pending', createdAt:serverTimestamp(), updatedAt:serverTimestamp() }); closeDialogSafe(qs('#communityReportModal')); openModalAlert('신고가 접수되었습니다.\n관리자가 확인 후 조치합니다.'); }catch(error){ console.error(error); if(String(error?.code||'').includes('permission-denied')) openModalAlert('이미 신고했거나 신고 권한이 없습니다.'); else openModalAlert('신고 접수 중 오류가 발생했습니다.'); } }
 async function reportCommunityPost(postId){ openCommunityReportModal('post', postId, null, '게시글'); }
 async function reportCommunityComment(postId, commentId){ openCommunityReportModal('comment', postId, commentId, '댓글'); }
 qsa('#communityReportReasons .community-report-reason').forEach(btn => btn.addEventListener('click', () => { communityState.reportReason = btn.dataset.reportReason || '기타'; qsa('#communityReportReasons .community-report-reason').forEach(item => item.classList.toggle('selected', item === btn)); }));
 qs('#closeCommunityReportModal')?.addEventListener('click', () => closeDialogSafe(qs('#communityReportModal')));
 qs('#cancelCommunityReportBtn')?.addEventListener('click', () => closeDialogSafe(qs('#communityReportModal')));
 qs('#submitCommunityReportBtn')?.addEventListener('click', submitCommunityReport);
 qs('#communityWriteBtn')?.addEventListener('click', openCommunityEditor); qs('#closeCommunityEditor')?.addEventListener('click', () => { communityState.editingPostId = null; closeDialogSafe(qs('#communityEditorModal')); }); qs('#submitCommunityPostBtn')?.addEventListener('click', submitCommunityPost); qs('#closeCommunityDetail')?.addEventListener('click', () => closeDialogSafe(qs('#communityDetailModal'))); qs('#submitCommunityCommentBtn')?.addEventListener('click', submitCommunityComment); qs('#communityMoreBtn')?.addEventListener('click', () => loadCommunityPosts(communityState.category, false)); renderCommunityCategoryFilter();

 function aiValueToText(value){
 if(value == null) return '';
 if(typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') return String(value);
 if(Array.isArray(value)) return value.map(aiValueToText).filter(Boolean).join(' ');
 if(value && typeof value.toDate === 'function') return formatDateTime(value);
 if(typeof value === 'object'){
 const preferredKeys = [
 'text','title','name','label','value','answer','content','description','desc',
 'benefit','condition','summary','address','phone','category','storeName'
 ];
 const parts = [];
 preferredKeys.forEach((key) => {
 if(Object.prototype.hasOwnProperty.call(value, key)){
 const text = aiValueToText(value[key]);
 if(text) parts.push(text);
 }
 });
 if(parts.length) return parts.join(' ');
 return Object.entries(value)
 .filter(([key]) => !/^_/.test(key))
 .map(([key, val]) => aiValueToText(val))
 .filter(Boolean)
 .join(' ');
 }
 return String(value || '');
 }

 function normalizeAiText(value=''){
 return aiValueToText(value)
 .toLowerCase()
 .replace(/<[^>]*>/g, ' ')
 .replace(/[^가-힣a-z0-9\s]/gi,' ')
 .replace(/\s+/g,' ')
 .trim();
 }

 function tokenizeAiQuestion(question=''){
 const compact = normalizeAiText(question);
 const tokens = compact.split(' ').map(v => v.trim()).filter(v => v.length >= 2);
 const synonymMap = {
 '공지':['공지','공지사항','안내','알림','소식','최근'],
 '최근':['최근','최신','새로운','신규','공지'],
 '혜택':['혜택','할인','제휴','매장','가게','상가','쿠폰','이벤트'],
 '매장':['매장','가게','상가','업체','혜택'],
 '인기':['인기','top','top5','순위','랭킹','추천','베스트'],
 '지도':['지도','위치','거리','근처','주변','네이버','길찾기'],
 '전화':['전화','연락처','번호','문의'],
 '관리사무소':['관리사무소','관리실','사무소','전화','문의'],
 '쓰레기':['쓰레기','분리수거','음식물','재활용','배출'],
 '음식물':['음식물','쓰레기','배출','분리수거'],
 '주차':['주차','방문차량','차량','등록']
 };
 const expanded = new Set(tokens);
 tokens.forEach(token => {
 Object.entries(synonymMap).forEach(([key, values]) => {
 if(token.includes(key) || values.some(v => token.includes(v) || v.includes(token))){
 values.forEach(v => expanded.add(v));
 }
 });
 });
 return [...expanded].slice(0, 24);
 }

 function scoreAiItem(question, item){
 const tokens = tokenizeAiQuestion(question);
 const hay = normalizeAiText([
 item.title,
 item.name,
 item.category,
 item.content,
 item.desc,
 item.description,
 getBenefitDisplayAddress(item), item.roadAddress, item.jibunAddress, item.detailAddress,
 item.benefit,
 item.condition,
 item.answer,
 item.question,
 item.summary,
 item.storeName,
 ...(Array.isArray(item.keywords) ? item.keywords : [])
 ]);
 if(!tokens.length || !hay) return 0;
 let score = 0;
 tokens.forEach(token => {
 if(!token) return;
 if(hay.includes(token)) score += token.length >= 3 ? 3 : 1;
 if(normalizeAiText(item.title || item.name || '').includes(token)) score += 2;
 if(Array.isArray(item.keywords) && item.keywords.some(k => normalizeAiText(k).includes(token))) score += 3;
 });
 return score;
 }

 function appendAiMessage(role='bot', html='', options={}){
 const win = qs('#aiChatWindow');
 if(!win) return null;
 const row = document.createElement('div');
 row.className = `ai-message ${role === 'user' ? 'user' : 'bot'}`;
 if(options.pending) row.dataset.pending = 'true';
 row.innerHTML = `<div class="ai-bubble">${html}</div>`;
 win.appendChild(row);
 bindAiAnswerActions(row);
 scheduleAiRetryButtonNormalize(win);
 initAiRetryButtonSingletonObserver();
 win.scrollTop = win.scrollHeight;
 return row;
 }

 function getAiWaitingMessage(question=''){
 const q = String(question || '').replace(/\s+/g, ' ').trim();
 if(/영업시간|영업\s*중|열었|닫았|오픈|마감/.test(q)) return '매장 영업시간을 확인하고 있어요.';
 if(/혜택|추천|매장|카페|식당|맛집|지도|거리|근처|가까운|TOP\s*5|탑\s*5|인기/.test(q)) return '혜택 정보를 확인하고 있어요.';
 if(/공지|공지사항|안내|메뉴|어디|위치/.test(q)) return '안내 정보를 확인하고 있어요.';
 return '답변을 준비하고 있어요.';
 }

 function buildAiThinkingHtml(message='답변을 준비하고 있어요.', subText='잠시만 기다려주세요.'){
 return `<div class="ai-thinking" role="status" aria-live="polite"><span class="ai-typing-indicator" aria-label="AI가 답변을 준비 중입니다"><span></span><span></span><span></span></span><span class="ai-thinking-text">${escapeHtml(message)}${subText ? `<small>${escapeHtml(subText)}</small>` : ''}</span></div>`;
 }

 function setAiThinkingMessage(pendingBubble, message='답변을 준비하고 있어요.', subText='잠시만 기다려주세요.'){
 if(!pendingBubble) return;
 pendingBubble.innerHTML = buildAiThinkingHtml(message, subText);
 }

 function createAiTypingBubble(question=''){
 return appendAiMessage('bot', buildAiThinkingHtml(getAiWaitingMessage(question), '조금만 기다려주세요. 곧 답변드릴게요.'), { pending:true });
 }

 function normalizeAiAnswerHtml(html=''){
 const wrap = document.createElement('div');
 wrap.innerHTML = String(html || '');
 wrap.querySelectorAll('script,style,iframe,object,embed').forEach(el => el.remove());
 return wrap.innerHTML || '답변을 생성하지 못했습니다.';
 }

 function typeAiHtml(targetBubble, html='', speed=12){
 return new Promise((resolve) => {
 if(!targetBubble){ resolve(); return; }
 const safeHtml = normalizeAiAnswerHtml(html);
 const tmp = document.createElement('div');
 tmp.innerHTML = safeHtml;
 const text = tmp.textContent || tmp.innerText || '';
 const win = qs('#aiChatWindow');
 targetBubble.innerHTML = '';
 let i = 0;
 const tick = () => {
 i += Math.max(1, Math.ceil(text.length / 160));
 targetBubble.textContent = text.slice(0, i);
 if(win) win.scrollTop = win.scrollHeight;
 if(i < text.length){ setTimeout(tick, speed); }
 else { targetBubble.innerHTML = safeHtml; bindAiAnswerActions(targetBubble); if(win) win.scrollTop = win.scrollHeight; resolve(); }
 };
 tick();
 });
 }

 function getAiTimePromptLabel(){
 const hour = new Date().getHours();
 if(hour >= 5 && hour < 11) return { title:'아침 시간', question:'아침에 가기 좋은 혜택 매장 추천해줘', label:'아침 추천' };
 if(hour >= 11 && hour < 15) return { title:'점심 시간', question:'점심에 가기 좋은 혜택 매장 TOP3 추천해줘', label:'점심 추천' };
 if(hour >= 15 && hour < 18) return { title:'오후 시간', question:'오후에 가기 좋은 카페나 혜택 매장 추천해줘', label:'오후 카페' };
 if(hour >= 18 && hour < 22) return { title:'저녁 시간', question:'저녁에 가기 좋은 맛집 혜택 매장 TOP3 추천해줘', label:'저녁 맛집' };
 return { title:'야간 시간', question:'지금 확인하면 좋은 공지와 내일 이용 가능한 혜택 알려줘', label:'내일 준비' };
 }

 async function getAiIdTokenSafe(){
 try{
 return state.currentUser?.getIdToken ? await state.currentUser.getIdToken() : '';
 }catch(error){
 console.warn('AI ID 토큰 생성 실패:', error);
 return '';
 }
 }

 function buildProactiveAiHtml(data={}){
 const message = String(data.message || '').trim() || getAiWelcomeHtml();
 const buttons = Array.isArray(data.buttons) ? data.buttons : [];
 const recs = Array.isArray(data.recommendations) ? data.recommendations : [];
 const insight = data.insight || {};
 const buttonHtml = buttons.length ? `<div class="ai-dialog-action-row" aria-label="개인형 AI 추천 버튼">${buttons.map(btn => {
 const label = typeof btn === 'string' ? btn : (btn.label || btn.text || '추천');
 const question = typeof btn === 'string' ? btn : (btn.question || btn.value || label);
 const benefitId = typeof btn === 'object' && btn.benefitId ? ` data-ai-log-benefit-id="${escapeAttr(btn.benefitId)}"` : '';
 return `<button class="ai-dialog-action-btn" type="button" data-ai-dialog-question="${escapeAttr(question)}" data-ai-log-source="proactive-ai" data-ai-log-category="${escapeAttr(label)}"${benefitId}>${escapeHtml(label)}</button>`;
 }).join('')}</div>` : '';
 const safeRecs = (Array.isArray(recs) ? recs : []).filter(item => {
   if(!item) return false;
   if(typeof isRecommendableBenefit !== 'function') return true;
   const local = item.id ? (state.benefits || []).find(v => String(v.id) === String(item.id)) : null;
   return local ? isRecommendableBenefit(local) : isRecommendableBenefit(item);
 });
 const recHtml = safeRecs.length ? `<div class="ai-answer-section"><div class="ai-answer-section-title"><span>지금 잘 맞는 추천</span><small>${safeRecs.length}개</small></div>${safeRecs.map(item => `<div class="ai-benefit-card-auto enhanced"><div class="ai-card-top"><b>${escapeHtml(item.name || '추천 매장')}</b><span class="ai-match-score">맞춤 ${Math.min(99, Number(item.score || 0))}%</span></div><span>${escapeHtml(item.benefit || item.category || '등록된 혜택 정보를 확인해보세요.')}</span>${item.id ? `<div class="ai-card-actions"><button class="primary" type="button" data-ai-open-benefit-id="${escapeAttr(item.id)}">혜택 상세 보기</button></div>` : ''}${buildAiRecommendationFeedbackHtml(item)}</div>`).join('')}</div>` : '';
 const insightText = [insight.preference ? `관심 ${insight.preference}` : '', insight.timeLabel || '', insight.isRain ? '비오는날' : '', Number.isFinite(Number(insight.logCount)) ? `로그 ${Number(insight.logCount)}건` : ''].filter(Boolean).join(' · ');
 return `<div class="ai-answer ai-answer-upgrade"><div class="ai-answer-summary">${escapeHtml(message).replace(/\n/g,'<br>')}</div>${buttonHtml}${recHtml}<span class="ai-mode-pill upgraded">지금 상황에 맞는 정보를 준비했어요.</span></div>`;
 }

 
async function sendAiRecommendationFeedback(payload={}){
 if(!AI_RECOMMENDATION_FEEDBACK_URL && !AI_ASSISTANT_LOG_URL) return;
 try{
 const idToken = await getAiIdTokenSafe();
 const body = { env: ENV, source:'ai_recommendation_card', ...payload };
 const url = AI_RECOMMENDATION_FEEDBACK_URL || AI_ASSISTANT_LOG_URL;
 await fetch(url, {
 method:'POST',
 headers:{ 'Content-Type':'application/json', ...(idToken ? { 'Authorization':`Bearer ${idToken}` } : {}) },
 body: JSON.stringify(body)
 });
 }catch(error){
 console.warn('AI 추천 피드백 저장 실패:', error);
 }
}


function normalizeAiFeedbackKeyPart(value='', max=500){
 return String(value || '').replace(/\s+/g, ' ').trim().slice(0, max);
}

function hashAiFeedbackKey(value=''){
 const text = String(value || '');
 let h1 = 0x811c9dc5;
 let h2 = 0x01000193;
 for(let i=0; i<text.length; i+=1){
   const ch = text.charCodeAt(i);
   h1 ^= ch;
   h1 = Math.imul(h1, 16777619);
   h2 = Math.imul(h2 ^ ch, 1597334677);
 }
 return `${(h1 >>> 0).toString(36)}${(h2 >>> 0).toString(36)}`;
}

function getAiFeedbackStorageKey(feedbackKey=''){
 const uid = auth?.currentUser?.uid || 'guest';
 return `dupick_ai_feedback_once_${uid}_${String(feedbackKey || '').slice(0, 160)}`;
}

function getAiSubmittedFeedbackValue(feedbackKey=''){
 if(!feedbackKey) return '';
 try{ return String(localStorage.getItem(getAiFeedbackStorageKey(feedbackKey)) || ''); }catch(_error){ return ''; }
}

function isAiFeedbackAlreadySubmitted(feedbackKey=''){
 return !!getAiSubmittedFeedbackValue(feedbackKey);
}

function markAiFeedbackSubmittedOnce(feedbackKey='', feedback='submitted'){
 if(!feedbackKey) return;
 try{ localStorage.setItem(getAiFeedbackStorageKey(feedbackKey), String(feedback || 'submitted')); }catch(_error){}
}

function unmarkAiFeedbackSubmittedOnce(feedbackKey=''){
 if(!feedbackKey) return;
 try{ localStorage.removeItem(getAiFeedbackStorageKey(feedbackKey)); }catch(_error){}
}

function buildAiAnswerFeedbackKey(payload={}){
 const user = auth?.currentUser;
 const question = normalizeAiFeedbackKeyPart(payload.question || '', 700);
 const answerText = normalizeAiFeedbackKeyPart(payload.answerText || '', 1200);
 return `answer_${user?.uid || 'guest'}_${hashAiFeedbackKey(`${question}||${answerText}`)}`;
}

function buildAiRecommendationFeedbackKey(payload={}){
 const user = auth?.currentUser;
 const targetId = normalizeAiFeedbackKeyPart(payload.targetId || payload.benefitId || '', 160);
 const name = normalizeAiFeedbackKeyPart(payload.benefitName || payload.name || '', 160);
 const category = normalizeAiFeedbackKeyPart(payload.category || '', 80);
 const question = normalizeAiFeedbackKeyPart(payload.question || '', 500);
 return `recommendation_${user?.uid || 'guest'}_${hashAiFeedbackKey(`${targetId}||${name}||${category}||${question}`)}`;
}

function findAiFeedbackButtonByValue(row, fallbackBtn, feedback=''){
 if(!row || !feedback) return fallbackBtn;
 const attr = fallbackBtn?.dataset?.aiAnswerFeedback !== undefined ? 'data-ai-answer-feedback' : 'data-ai-rec-feedback';
 return row.querySelector(`[${attr}="${CSS.escape(String(feedback))}"]`) || fallbackBtn;
}

function applyAiFeedbackSubmittedUi(row, selectedBtn, feedback=''){
 if(row) row.dataset.aiFeedbackSubmitted = 'true';
 const buttons = row ? row.querySelectorAll('[data-ai-answer-feedback],[data-ai-rec-feedback]') : selectedBtn?.parentElement?.querySelectorAll('[data-ai-answer-feedback],[data-ai-rec-feedback]');
 buttons?.forEach(other => {
   if(other !== selectedBtn) other.classList.remove('selected');
   other.disabled = true;
   other.dataset.aiFeedbackSubmitted = 'true';
   other.setAttribute('aria-disabled', 'true');
 });
 if(selectedBtn){
   selectedBtn.classList.add('selected');
   selectedBtn.dataset.aiFeedbackSubmitted = 'true';
   selectedBtn.disabled = true;
   selectedBtn.setAttribute('aria-disabled', 'true');
   selectedBtn.innerHTML = '<span aria-hidden="true">✓</span>';
   const isGood = feedback === 'good';
   const isAnswer = !!selectedBtn.dataset.aiAnswerFeedback;
   selectedBtn.setAttribute('aria-label', isAnswer ? (isGood ? '좋은 답변으로 반영됨' : '별로예요 의견 반영됨') : (isGood ? '좋은 추천으로 반영됨' : '별로예요 의견 반영됨'));
   selectedBtn.title = selectedBtn.getAttribute('aria-label') || '반영됨';
 }
}

function getAiFeedbackQuestionFromButton(btn){
 try{
   const row = btn?.closest?.('.ai-message');
   let cur = row?.previousElementSibling || null;
   while(cur){
     if(cur.classList?.contains('ai-message') && cur.classList?.contains('user')){
       const clone = cur.cloneNode(true);
       clone.querySelectorAll('small,button,a,script,style').forEach(el => el.remove());
       const text = String(clone.innerText || clone.textContent || '').replace(/\s+/g, ' ').trim();
       if(text) return text;
     }
     cur = cur.previousElementSibling;
   }
 }catch(_error){}
 return (typeof getCurrentAiQuestionText === 'function') ? getCurrentAiQuestionText() : '';
}

function getAiFeedbackAnswerText(btn){
 try{
   const row = btn?.closest?.('.ai-message');
   const bubble = row?.querySelector?.('.ai-bubble') || btn?.closest?.('.ai-bubble');
   if(!bubble) return '';
   const clone = bubble.cloneNode(true);
   clone.querySelectorAll('.ai-answer-actions-row,.ai-answer-feedback-row,.ai-rec-feedback-row,button,a,script,style').forEach(el => el.remove());
   return String(clone.innerText || clone.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 3000);
 }catch(_error){ return ''; }
}

function buildAiAnswerActionHtml(){
 return `<div class="ai-answer-actions-row" aria-label="AI 답변 작업">
   <button class="ai-answer-action-btn" type="button" data-ai-answer-copy="true" aria-label="응답 복사" title="응답 복사"><span aria-hidden="true">📋</span><span>응답 복사</span></button>
   <button class="ai-answer-action-btn" type="button" data-ai-answer-share="true" aria-label="공유하기" title="공유하기"><span aria-hidden="true">↗</span><span>공유하기</span></button>
 </div>`;
}

function buildAiAnswerFeedbackHtml(){
 return `${buildAiAnswerActionHtml()}<div class="ai-answer-feedback-row" aria-label="AI 답변 피드백">
   <span class="ai-answer-feedback-label">답변 평가</span>
   <button class="ai-answer-feedback-btn good" type="button" data-ai-answer-feedback="good" aria-label="좋은 답변이에요" title="좋은 답변이에요"><span aria-hidden="true">👍</span></button>
   <button class="ai-answer-feedback-btn bad" type="button" data-ai-answer-feedback="bad" aria-label="별로인 답변이에요" title="별로인 답변이에요"><span aria-hidden="true">👎</span></button>
 </div>`;
}

function getAiAnswerActionText(btn){
 try{
   return getAiFeedbackAnswerText(btn);
 }catch(_error){ return ''; }
}

async function copyTextToClipboardSafe(text){
 const value = String(text || '').trim();
 if(!value) return false;
 try{
   if(navigator.clipboard?.writeText){
     await navigator.clipboard.writeText(value);
     return true;
   }
 }catch(_error){}
 try{
   const textarea = document.createElement('textarea');
   textarea.value = value;
   textarea.setAttribute('readonly', 'readonly');
   textarea.style.position = 'fixed';
   textarea.style.left = '-9999px';
   textarea.style.top = '-9999px';
   document.body.appendChild(textarea);
   textarea.select();
   const ok = document.execCommand('copy');
   textarea.remove();
   return !!ok;
 }catch(_error){ return false; }
}

function showAiAnswerActionToast(message){
 try{
   if(typeof showToast === 'function') return showToast(message);
   if(typeof showCommonToast === 'function') return showCommonToast(message);
   if(typeof showAlert === 'function') return showAlert(message);
 }catch(_error){}
 console.log(message);
}

async function handleAiAnswerCopy(btn){
 const text = getAiAnswerActionText(btn);
 const ok = await copyTextToClipboardSafe(text);
 showAiAnswerActionToast(ok ? 'AI 응답을 복사했어요.' : '복사할 응답을 찾지 못했어요.');
}

async function handleAiAnswerShare(btn){
 const text = getAiAnswerActionText(btn);
 if(!text){
   showAiAnswerActionToast('공유할 응답을 찾지 못했어요.');
   return;
 }
 const shareText = `더운정픽 AI 생활도우미 답변\n\n${text}`;
 try{
   if(navigator.share){
     await navigator.share({ title:'더운정픽 AI 생활도우미', text: shareText });
     return;
   }
 }catch(error){
   if(error?.name === 'AbortError') return;
 }
 const ok = await copyTextToClipboardSafe(shareText);
 showAiAnswerActionToast(ok ? '공유할 내용을 복사했어요.' : '공유를 준비하지 못했어요.');
}

function ensureAiAnswerFeedback(scope){
 const root = scope || qs('#aiChatWindow');
 if(!root) return;
 const bubbles = root.matches?.('.ai-bubble') ? [root] : Array.from(root.querySelectorAll('.ai-bubble'));
 bubbles.forEach((bubble) => {
   if(!bubble || bubble.querySelector('.ai-answer-feedback-row')) return;
   if(bubble.querySelector('.ai-thinking')) return;
   if(!bubble.closest('.ai-message.bot')) return;
   const text = String(bubble.innerText || bubble.textContent || '').replace(/\s+/g, '').trim();
   if(!text || text.length < 8) return;
   if(/입주민전용AI생활도우미|무엇을도와드릴까요/.test(text) && !bubble.querySelector('.ai-answer')) return;
   bubble.insertAdjacentHTML('beforeend', buildAiAnswerFeedbackHtml());
 });
}

async function sendAiAnswerFeedback(payload={}){
 const user = auth?.currentUser;
 if(!user || !db) return { ok:false, reason:'not_authenticated' };
 const feedback = String(payload.feedback || '').toLowerCase();
 const feedbackKey = String(payload.feedbackKey || buildAiAnswerFeedbackKey(payload));
 const safeDocId = feedbackKey.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 180);
 try{
   await setDoc(doc(db, 'ai_answer_feedback', safeDocId), {
     uid: user.uid,
     feedback,
     feedbackKey,
     rating: feedback === 'good' ? 'helpful' : 'not_helpful',
     question: String(payload.question || '').slice(0, 1000),
     answerText: String(payload.answerText || '').slice(0, 3000),
     source: 'ai_answer_bubble',
     reviewStatus: 'new',
     actionStatus: feedback === 'bad' ? 'needs_review' : 'none',
     createdAt: serverTimestamp()
   });
   if(feedback === 'bad'){
     try{
       const failedDocId = `answer_bad_${safeDocId}`.slice(0, 190);
       await setDoc(doc(db, 'ai_failed_questions', failedDocId), {
         uid: user.uid,
         question: String(payload.question || '').slice(0, 1000),
         answerText: String(payload.answerText || '').slice(0, 3000),
         source: 'answer_feedback_bad',
         feedbackKey,
         status: 'new',
         reviewStatus: 'new',
         actionStatus: 'faq_candidate',
         createdAt: serverTimestamp()
       });
     }catch(error){ console.warn('AI 실패 질문 후보 저장 실패 또는 이미 반영됨:', error); }
   }
   return { ok:true, feedbackKey, docId:safeDocId };
 }catch(error){
   console.warn('AI 답변 피드백 저장 실패 또는 이미 반영됨:', error);
   return { ok:false, duplicate:true, feedbackKey, error };
 }
}

async function logPersonalAssistantEvent(payload={}){
 if(!AI_ASSISTANT_LOG_URL) return;
 try{
 const idToken = await getAiIdTokenSafe();
 await fetch(AI_ASSISTANT_LOG_URL, {
 method:'POST',
 headers:{ 'Content-Type':'application/json', ...(idToken ? { 'Authorization':`Bearer ${idToken}` } : {}) },
 body: JSON.stringify({ env: ENV, ...payload })
 });
 }catch(error){
 console.warn('개인형 AI 로그 저장 실패:', error);
 }
 }

 async function loadServerProactiveWelcome(){
 const win = qs('#aiChatWindow');
 if(!win || !AI_PROACTIVE_URL) return false;
 try{
 const idToken = await getAiIdTokenSafe();
 const pageContext = typeof buildAiPageContext === 'function' ? buildAiPageContext('개인형 비서 선제 추천') : {};
 const response = await fetch(AI_PROACTIVE_URL, {
 method:'POST',
 headers:{ 'Accept':'application/json', 'Content-Type':'application/json', ...(idToken ? { 'Authorization':`Bearer ${idToken}` } : {}) },
 body: JSON.stringify({ env: ENV, pageContext, context: pageContext })
 });
 const data = await response.json().catch(()=>({}));
 if(!response.ok || data.ok === false) throw new Error(data.message || '선제 추천 호출 실패');
 win.innerHTML = `<div class="ai-message bot"><div class="ai-bubble">${buildProactiveAiHtml(data)}</div></div>`;
 bindAiAnswerActions(win);
 win.scrollTop = win.scrollHeight;
 return true;
 }catch(error){
 console.warn('개인형 AI 안내 로드 실패:', error);
 return false;
 }
 }

 function getKstDateKey(){
 const now = new Date();
 const kst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
 return kst.toISOString().slice(0, 10);
 }

 function getDailyAiNudgeStorageKey(dateKey=getKstDateKey()){
 const uid = state.currentUser?.uid || 'guest';
 return `myhills_ai_daily_nudge_${ENV || 'prod'}_${uid}_${dateKey}`;
 }

 function hideDailyAiNudgeToast(markLocal=true){
 const toast = qs('#aiDailyNudgeToast');
 if(!toast) return;
 toast.classList.remove('show');
 toast.setAttribute('aria-hidden','true');
 if(markLocal){
 localStorage.setItem(getDailyAiNudgeStorageKey(), 'closed');
 }
 }

 async function markDailyAiNudgeShown(action='shown'){
 localStorage.setItem(getDailyAiNudgeStorageKey(), action || 'shown');
 if(!AI_DAILY_NUDGE_MARK_URL) return;
 try{
 const idToken = await getAiIdTokenSafe();
 await fetch(AI_DAILY_NUDGE_MARK_URL, {
 method:'POST',
 headers:{ 'Content-Type':'application/json', ...(idToken ? { 'Authorization':`Bearer ${idToken}` } : {}) },
 body: JSON.stringify({ env: ENV, dateKey: getKstDateKey(), action })
 });
 }catch(error){
 console.warn('일 1회 AI 유도 기록 실패:', error);
 }
 }

 function showDailyAiNudgeToast(payload={}){
 const toast = qs('#aiDailyNudgeToast');
 if(!toast) return;
 const titleEl = qs('#aiDailyNudgeTitle');
 const msgEl = qs('#aiDailyNudgeMessage');
 if(titleEl) titleEl.textContent = payload.title || 'AI 생활도우미가 오늘 추천을 준비했어요';
 if(msgEl) msgEl.textContent = payload.message || '날씨·시간·인기 혜택 기준으로 먼저 확인해볼까요?';
 toast.classList.add('show');
 toast.setAttribute('aria-hidden','false');
 window.clearTimeout(window.__aiDailyNudgeTimer);
 window.__aiDailyNudgeTimer = window.setTimeout(() => hideDailyAiNudgeToast(false), 11000);
 }

 function hasAiOpenDeepLink(){
 try{
 const params = new URLSearchParams(location.search || '');
 return params.get('ai') === 'open' || params.get('open') === 'ai' || params.get('view') === 'ai';
 }catch(_){
 return false;
 }
 }

 function clearAiOpenDeepLink(){
 try{
 const url = new URL(location.href);
 let changed = false;
 ['ai','open','view'].forEach((key) => {
 const value = url.searchParams.get(key);
 if((key === 'ai' && value === 'open') || (key === 'open' && value === 'ai') || (key === 'view' && value === 'ai')){
 url.searchParams.delete(key);
 changed = true;
 }
 });
 if(changed){
 history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`);
 }
 }catch(_){ }
 }

 async function openAiAssistantFromNudge(source='daily_nudge'){
 hideDailyAiNudgeToast(false);
 changeView('ai');
 setTimeout(() => {
 resetAiChatWindow({ loadProactive:true });
 qs('#aiQuestionInput')?.focus?.();
 }, 80);
 logPersonalAssistantEvent({ action:'open_ai_assistant', source }).catch(()=>{});
 clearAiOpenDeepLink();
 return true;
 }

 async function handleAiOpenDeepLink(){
 if(!hasAiOpenDeepLink()) return false;
 await markDailyAiNudgeShown('push-opened');
 return openAiAssistantFromNudge('push_deeplink');
 }

 async function handleDailyAiNudge(){
 if(!state.currentUser?.uid) return;
 const localKey = getDailyAiNudgeStorageKey();
 if(localStorage.getItem(localKey)) return;
 let payload = { shouldShow:true };
 if(AI_DAILY_NUDGE_CHECK_URL){
 try{
 const idToken = await getAiIdTokenSafe();
 const response = await fetch(AI_DAILY_NUDGE_CHECK_URL, {
 method:'POST',
 headers:{ 'Accept':'application/json', 'Content-Type':'application/json', ...(idToken ? { 'Authorization':`Bearer ${idToken}` } : {}) },
 body: JSON.stringify({ env: ENV, dateKey: getKstDateKey() })
 });
 const data = await response.json().catch(()=>({}));
 if(response.ok && data.ok !== false) payload = data;
 }catch(error){
 console.warn('일 1회 AI 유도 서버 체크 실패, local 기준으로 표시:', error);
 }
 }
 if(payload.shouldShow === false){
 localStorage.setItem(localKey, 'server-already-shown');
 return;
 }
 showDailyAiNudgeToast(payload);
 markDailyAiNudgeShown('shown').catch(()=>{});
 }

 function getAiWelcomeHtml(){
 const timePrompt = getAiTimePromptLabel();
 const topNames = (state.benefits || [])
 .slice()
 .sort((a,b) => Number(b.popularScore || b.score || b.detailViewCount || 0) - Number(a.popularScore || a.score || a.detailViewCount || 0))
 .slice(0, 3)
 .map(v => v.name)
 .filter(Boolean);
 const topHint = topNames.length ? `\n오늘 많이 보는 혜택은 ${topNames.map(escapeHtml).join(' · ')} 쪽이에요.` : '';
 return `안녕하세요 
현재는 ${escapeHtml(timePrompt.title)}이에요.${topHint}

먼저 필요한 걸 골라보세요. 제가 바로 이어서 추천해드릴게요.

<div class="ai-dialog-action-row" aria-label="AI 선제 추천 버튼"><button class="ai-dialog-action-btn" type="button" data-ai-dialog-question="${escapeAttr(timePrompt.question)}">${escapeHtml(timePrompt.label)}</button><button class="ai-dialog-action-btn" type="button" data-ai-dialog-question="지금 상황에 맞는 혜택 매장 TOP3 추천해줘">상황별 TOP3</button><button class="ai-dialog-action-btn" type="button" data-ai-dialog-question="아이와 함께 가기 좋은 곳 추천해줘">아이와 함께</button><button class="ai-dialog-action-btn" type="button" data-ai-dialog-question="가까운 혜택 매장 알려줘">가까운 곳</button><button class="ai-dialog-action-btn" type="button" data-ai-dialog-question="최근 공지 알려줘">최근 공지</button></div><small>개인형 비서형 AI 모드: 사용자가 묻기 전에 시간·인기·상황 기준으로 먼저 제안합니다.</small>`;
 }

 function resetAiChatWindow(options={}){
 const loadProactive = options.loadProactive !== false;
 const win = qs('#aiChatWindow');
 if(!win) return;
 win.innerHTML = `<div class="ai-message bot"><div class="ai-bubble">${getAiWelcomeHtml()}</div></div>`;
 bindAiAnswerActions(win);
 win.scrollTop = win.scrollHeight;
 if(loadProactive) loadServerProactiveWelcome();
 }

 function updateAiConversationStatus(title){
 const el = qs('#aiConversationStatus');
 if(!el) return;
 const name = title || aiConversationTitle || (aiConversationId ? '이전 대화' : '새 대화');
 el.innerHTML = `<span>현재 대화: <strong>${escapeHtml(name)}</strong></span><span>${aiConversationId ? '대화 기억 사용중' : '첫 질문 후 저장'}</span>`;
 }

 async function callAiFunction(payload = {}){
 const idToken = await auth.currentUser?.getIdToken?.();
 if(!idToken) throw new Error('입장 정보가 없습니다.');
 const response = await fetch(AI_FUNCTION_URL, {
 method: 'POST',
 headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${idToken}` },
 body: JSON.stringify({ env: ENV, ...payload })
 });
 const data = await response.json().catch(() => ({}));
 if(!response.ok || data.ok === false) throw new Error(data.message || 'AI 함수 호출에 실패했습니다.');
 return data;
 }

 function extractAiDialogActions(text=''){
 const raw = String(text || '');
 const match = raw.match(/\n*\[\[AI_DIALOG_ACTIONS:([\s\S]*?)\]\]\s*$/);
 if(!match) return { text: raw, actions: null };
 try{
 const actions = JSON.parse(match[1]);
 return { text: raw.slice(0, match.index).trim(), actions };
 }catch(error){
 console.warn('AI 대화 버튼 파싱 실패:', error);
 return { text: raw.replace(match[0], '').trim(), actions: null };
 }
 }

 function buildAiDialogActionButtons(actions=null){
 if(!actions || !Array.isArray(actions.buttons) || !actions.buttons.length) return '';
 const buttons = actions.buttons.slice(0, 6).map((btn) => {
 const label = String(btn.label || btn.question || '선택').trim();
 const question = String(btn.question || btn.label || '').trim();
 if(!question) return '';
 return `<button class="ai-dialog-action-btn" type="button" data-ai-dialog-question="${escapeAttr(question)}">${escapeHtml(label)}</button>`;
 }).filter(Boolean).join('');
 if(!buttons) return '';
 return `<div class="ai-dialog-action-row" aria-label="AI 추천 선택 버튼">${buttons}</div>`;
 }

 function cleanAiChunkText(text=''){
 const parsed = extractAiDialogActions(text);
 return String(parsed.text || '')
 .replace(/\*\*/g, '')
 .replace(/#{1,6}\s?/g, '')
 .replace(/```[\s\S]*?```/g, (m) => m.replace(/```/g, '').trim())
 .replace(/\n{3,}/g, '\n\n');
 }

 function formatAiStreamingText(text=''){
 const raw = cleanAiChunkText(text);
 const lines = raw.split('\n').map(line => {
 let v = line.trim();
 if(!v) return '';
 v = v.replace(/^[-•]\s*/g, '• ');
 v = v.replace(/^(\d+)\.\s*/g, '$1. ');
 return v;
 });
 return lines.join('\n').replace(/\n{3,}/g, '\n\n').trimStart();
 }

 function createAiStreamRenderer(targetBubble, question=''){
 let rawText = '';
 let lastRendered = '';
 let lastCardSignature = '';
 const render = (force=false) => {
 if(!targetBubble) return;
 const formatted = formatAiStreamingText(rawText);
 const isApartmentPhone = isApartmentLifePhoneQuestion(question, formatted);
 const isNoResultStreaming = typeof isAiNoResultAnswerText === 'function' && isAiNoResultAnswerText(formatted);
 const cards = (isApartmentPhone || isNoResultStreaming) ? [] : mapAiBenefitsForQuestion(question, formatted, 3);
 const cardSignature = cards.map(v => `${v.item?.id || ''}:${v.score || 0}`).join('|');
 if(!force && formatted === lastRendered && cardSignature === lastCardSignature) return;
 lastRendered = formatted;
 lastCardSignature = cardSignature;

 const liveCards = cards.length ? `
 <div class="ai-live-card-dock">
 <div class="ai-live-card-head"><span>실시간 매칭 혜택</span><span>${cards.length}개 감지</span></div>
 <div class="ai-live-card-grid">
 ${cards.map(({item, reason}) => `
 <div class="ai-live-card">
 <b>${escapeHtml(item.name || item.storeName || item.title || getMapMarkerLabel(item))}</b>
 <span>${escapeHtml(item.benefit || item.description || item.content || '등록된 혜택 정보를 확인해보세요.')}</span>
 <div class="ai-live-meta">
 ${item.category ? `<em>${escapeHtml(item.category)}</em>` : ''}
 ${reason ? `<em>${escapeHtml(reason)}</em>` : ''}
 ${shouldAttachWeatherTagToItem(item, question, formatted) ? `<em class="weather">${escapeHtml(shouldAttachWeatherTagToItem(item, question, formatted))}</em>` : ''}
 ${pickAiPhone(item) ? `<em>전화 가능</em>` : ''}
 </div>
 </div>`).join('')}
 </div>
 </div>` : '';

 targetBubble.innerHTML = `
 <div class="ai-stream-shell">
 <div class="ai-stream-status">
 <span class="ai-stream-status-left"><span class="ai-stream-dot"></span>${isNoResultStreaming ? '등록된 안내를 확인하고 있습니다' : (isApartmentPhone ? '아파트 생활 연락처를 확인하고 있습니다' : 'AI가 답변을 작성하면서 혜택을 매칭 중입니다')}</span>
 <span>${isNoResultStreaming ? '안내 확인 중' : (isApartmentPhone ? '생활정보 확인 중' : (cards.length ? '추천 카드 준비 완료' : '답변 준비 중'))}</span>
 </div>
 <div class="ai-stream-text">${escapeHtml(formatted || '답변을 작성 중입니다...').replace(/\n/g,'<br>')}<span class="ai-stream-cursor"></span></div>
 ${liveCards}
 </div>`;
 const win = qs('#aiChatWindow');
 if(win) win.scrollTop = win.scrollHeight;
 };
 return {
 push(chunk=''){
 rawText += String(chunk || '');
 render(false);
 },
 full(){ return formatAiStreamingText(rawText).trim(); },
 flush(){ render(true); return this.full(); }
 };
 }

 function normalizeAiSearchText(value=''){
 return String(value || '')
 .toLowerCase()
 .replace(/\s+/g, '')
 .replace(/[\[\]{}()<>"'`~!@#$%^&*_+=|\:;,.?/\-]/g, '');
 }

 function getAiSearchTokens(question=''){
 const q = String(question || '').trim();
 const base = q
 .replace(/[\[\]{}()<>"'`~!@#$%^&*_+=|\:;,.?/\-]/g, ' ')
 .split(/\s+/)
 .map(v => v.trim())
 .filter(v => v.length >= 2);
 const joined = normalizeAiSearchText(q);
 const synonyms = [];
 if(joined.includes('관리사무소') || joined.includes('관리실') || joined.includes('전화') || joined.includes('연락처')){
 synonyms.push('관리사무소','관리실','생활지원센터','전화번호','연락처','대표번호','민원','사무소');
 }
 if(joined.includes('혜택') || joined.includes('할인')) synonyms.push('혜택','할인','제휴','매장');
 return [...new Set([...base, ...synonyms])];
 }


 function splitAiKeywords(value=''){
 if(Array.isArray(value)) return value.map(v => String(v || '').trim()).filter(Boolean);
 return String(value || '').split(/[\n,，#]+/).map(v => v.trim()).filter(Boolean);
 }

 
function getAiAttachmentExt(fileName=''){
 const clean = String(fileName || '').split('?')[0].split('#')[0];
 const last = clean.split('/').pop() || '';
 const idx = last.lastIndexOf('.');
 return idx >= 0 ? last.slice(idx + 1).toLowerCase() : '';
}

function getAiAttachmentMimeType(attachment={}){
 const explicit = String(attachment.mimeType || attachment.contentType || '').trim();
 if(explicit && explicit.includes('/')) return explicit;
 const fileName = attachment.name || attachment.fileName || attachment.path || attachment.url || '';
 const ext = getAiAttachmentExt(fileName);
 const map = {
  jpg:'image/jpeg', jpeg:'image/jpeg', png:'image/png', gif:'image/gif', webp:'image/webp', svg:'image/svg+xml',
  pdf:'application/pdf',
  xls:'application/vnd.ms-excel',
  xlsx:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  csv:'text/csv',
  doc:'application/msword',
  docx:'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ppt:'application/vnd.ms-powerpoint',
  pptx:'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  hwp:'application/x-hwp',
  hwpx:'application/vnd.hancom.hwpx',
  txt:'text/plain',
  zip:'application/zip'
 };
 return map[ext] || 'application/octet-stream';
}

function getAiAttachmentIcon(attachment={}){
 const mime = getAiAttachmentMimeType(attachment).toLowerCase();
 const name = attachment.name || attachment.fileName || attachment.path || attachment.url || '';
 const ext = getAiAttachmentExt(name);
 if(mime.startsWith('image/') || ['jpg','jpeg','png','gif','webp','svg'].includes(ext)) return '🖼️';
 if(mime.includes('pdf') || ext === 'pdf') return '📕';
 if(['xls','xlsx','csv'].includes(ext)) return '';
 if(['doc','docx','hwp','hwpx'].includes(ext)) return '📄';
 if(['ppt','pptx'].includes(ext)) return '📽️';
 if(['zip','7z','rar'].includes(ext)) return '🗂️';
 if(['txt','md'].includes(ext)) return '📝';
 return '첨부';
}

function getAiAttachmentGuideText(attachments=[]){
 const list = Array.isArray(attachments) ? attachments : [];
 const hasImage = list.some(a => getAiAttachmentType(a) === 'image');
 const hasFile = list.some(a => getAiAttachmentType(a) !== 'image');
 if(hasImage && hasFile) return '이미지와 파일이 있으니 참고하여 주시기 바랍니다. 이미지는 클릭하면 확대 가능하며 이미지와 파일 모두 다운로드 받을 수 있습니다.';
 if(hasImage) return '이미지를 클릭하면 확대해서 확인이 가능하며, 필요 시 다운로드도 가능합니다.';
 if(hasFile) return '파일을 다운받아서 확인이 가능합니다.';
 return '';
}

function getAiAttachmentType(item={}){
 const mime = String(item.mimeType || item.type || '').toLowerCase();
 const name = String(item.name || '').toLowerCase();
 if(mime.startsWith('image/') || /\.(png|jpe?g|gif|webp|bmp|svg)$/.test(name)) return 'image';
 return 'file';
 }

 function sanitizeAiKnowledgeDoc(raw={}, id='', source=''){
 const attachments = Array.isArray(raw.attachments) ? raw.attachments.filter(a => a && a.url).map(a => ({
 type: getAiAttachmentType(a),
 name: String(a.name || '첨부파일'),
 url: String(a.url || ''),
 path: String(a.path || ''),
 mimeType: String(a.mimeType || ''),
 size: Number(a.size || a.sizeBytes || 0)
 })) : [];
 return {
 type: source,
 id,
 title: raw.title || raw.question || raw.name || '',
 name: raw.title || raw.question || raw.name || '',
 question: raw.question || raw.title || '',
 answer: raw.answer || raw.content || '',
 content: raw.content || raw.answer || '',
 section: raw.section || '',
 keywords: splitAiKeywords(raw.keywords || ''),
 isActive: raw.isActive !== false,
 attachments,
 attachmentCount: attachments.length
 };
 }

 function scoreAiKnowledgeMatch(item={}, question='', answerText=''){
 const raw = stringifyAiCandidateText(item, item.type || 'ai');
 const norm = normalizeAiSearchText(raw);
 const source = `${question || ''} ${answerText || ''}`;
 const qNorm = normalizeAiSearchText(source);
 const titleNorm = normalizeAiSearchText(item.title || item.question || item.name || '');
 const tokens = getAiSearchTokens(source).map(normalizeAiSearchText).filter(Boolean);
 let score = 0;
 if(titleNorm && qNorm.includes(titleNorm)) score += 15;
 tokens.forEach(t => { if(t && norm.includes(t)) score += t.length >= 4 ? 4 : 2; });
 if(Array.isArray(item.keywords)) item.keywords.forEach(k => { const nk = normalizeAiSearchText(k); if(nk && qNorm.includes(nk)) score += 5; });
 if(item.attachments?.length && score > 0) score += 2;
 return score;
 }

 function getMatchedAiKnowledgeAttachments(question='', answerText='', maxDocs=2){
 try{
 return (state.aiKnowledge || [])
 .filter(item => item && item.isActive !== false && Array.isArray(item.attachments) && item.attachments.length)
 .map(item => ({ item, score: scoreAiKnowledgeMatch(item, question, answerText) }))
 .filter(v => v.score >= 4)
 .sort((a,b) => b.score - a.score)
 .slice(0, maxDocs);
 }catch(error){
 console.warn('AI 첨부 매칭 실패', error);
 return [];
 }
 }

 function buildAiAttachmentsHtml(matches=[]){
 const attachments = [];
 const sourceList = Array.isArray(matches) ? matches : [];
 sourceList.forEach(entry => {
   // 1) 기존 매칭 객체 형태: { item, score }
   if(entry && entry.item){
     const item = entry.item || {};
     (Array.isArray(item.attachments) ? item.attachments : []).forEach(a => {
       if(a) attachments.push({ ...a, sourceTitle: item.title || item.question || item.section || 'AI 안내' });
     });
     return;
   }
   // 2) 엄격 매칭 함수가 바로 첨부파일 배열을 반환하는 형태도 허용
   if(entry && (entry.url || entry.path || entry.name || entry.fileName)){
     attachments.push({ ...entry, name: entry.name || entry.fileName || '첨부파일', sourceTitle: entry.sourceTitle || 'AI 안내' });
   }
 });
 const unique = [];
 const seen = new Set();
 attachments.forEach(a => {
 const key = a.url || a.path || a.name;
 if(!key || seen.has(key)) return;
 seen.add(key);
 unique.push(a);
 });
 if(!unique.length) return '';
 const images = unique.filter(a => getAiAttachmentType(a) === 'image').slice(0, 3);
 const files = unique.filter(a => getAiAttachmentType(a) !== 'image').slice(0, 5);
 const imageHtml = images.length ? `<div class="ai-attachment-grid">${images.map(a => `<div class="ai-attachment-image-card"><button class="ai-attachment-image-preview" type="button" data-ai-image-zoom="1" data-ai-image-src="${escapeAttr(a.url || '')}" data-ai-image-title="${escapeAttr(a.name || a.sourceTitle || '안내 이미지')}" onclick="return window.openAiImageZoomFromElement ? window.openAiImageZoomFromElement(this) : false;"><img src="${escapeAttr(a.url)}" alt="${escapeAttr(a.name || '안내 이미지')}" loading="eager" decoding="async" fetchpriority="high" data-ai-attachment-image="true" onclick="return window.openAiImageZoomFromElement ? window.openAiImageZoomFromElement(this.closest('[data-ai-image-zoom]') || this) : false;"><span class="ai-attachment-zoom-badge" aria-hidden="true"></span></button><div class="ai-attachment-caption">${escapeHtml(a.name || a.sourceTitle || '안내 이미지')}</div><div class="ai-attachment-image-actions"><button class="ai-attachment-download-link" type="button" data-ai-attachment-download="1" data-ai-attachment-path="${escapeAttr(a.path || '')}" data-ai-attachment-url="${escapeAttr(a.url || '')}" data-ai-attachment-name="${escapeAttr(a.name || 'image')}" data-ai-attachment-mime="${escapeAttr(a.mimeType || a.contentType || getAiAttachmentMimeType(a))}"><span>이미지 저장</span><em>다운로드</em></button></div></div>`).join('')}</div>` : '';
 const fileHtml = files.length ? `<div class="ai-attachment-grid">${files.map(a => `<button class="ai-attachment-file-link" type="button" data-ai-attachment-download="1" data-ai-attachment-path="${escapeAttr(a.path || '')}" data-ai-attachment-url="${escapeAttr(a.url || '')}" data-ai-attachment-name="${escapeAttr(a.name || 'attachment')}" data-ai-attachment-mime="${escapeAttr(a.mimeType || a.contentType || getAiAttachmentMimeType(a))}"><span><span class="ai-attachment-file-icon">${getAiAttachmentIcon(a)}</span>${escapeHtml(a.name || '첨부파일')}</span><em>다운로드</em></button>`).join('')}</div>` : '';
 const guideText = getAiAttachmentGuideText(unique);
 const guideHtml = guideText ? `<div class="ai-attachment-guide">${escapeHtml(guideText)}</div>` : '';
 return `<div class="ai-attachment-section"><div class="ai-answer-section-title"><span>관련 이미지/첨부파일</span><small>${unique.length}개</small></div>${guideHtml}${imageHtml}${fileHtml}</div>`;
 }

 function subscribeAiKnowledge(){
 const targets = [
 { collectionName:'ai_faq', type:'faq' },
 { collectionName:'ai_booklet_pages', type:'booklet' },
 { collectionName:'ai_guide_pages', type:'guide' }
 ];
 const buckets = {};
 targets.forEach(({collectionName, type}) => {
 onSnapshot(query(collection(db, collectionName), limit(120)), (snapshot) => {
 buckets[type] = snapshot.docs.map(d => sanitizeAiKnowledgeDoc(d.data(), d.id, type));
 state.aiKnowledge = Object.values(buckets).flat();
 }, (error) => console.warn(`${collectionName} AI 지식 데이터 로드 실패`, error));
 });
 }

 function stringifyAiCandidateText(item={}, type=''){
 const fields = [
 type, item.id, item.name, item.storeName, item.title, item.category,
 item.benefit, item.description, item.content, item.body,
 getBenefitDisplayAddress(item), item.roadAddress, item.jibunAddress, item.detailAddress, item.phone, item.tel, item.contact, item.officePhone,
 item.emergencyPhone, item.contact?.emergency, item.contactNumber, item.phoneNumber, item.department,
 Array.isArray(item.keywords) ? item.keywords.join(' ') : item.keywords,
 item.memo, item.note,
 Array.isArray(item.attachments) ? item.attachments.map(a => [a.name, a.mimeType].filter(Boolean).join(' ')).join(' ') : ''
 ];
 return fields.map(v => String(v || '')).join(' ');
 }

 function pickAiPhone(item={}){
 return item.phone || item.tel || item.contact?.phone || item.contact || item.officePhone || item.contactNumber || item.phoneNumber || item.emergencyPhone || item.contact?.emergency || '';
 }

 function getAiUserPersonalSignals(){
 const favoriteSet = new Set((state.favoriteIds || []).map(String));
 const activeCategory = state.category && state.category !== '전체' ? String(state.category) : '';
 const keyword = String(state.keyword || qs('#searchInput')?.value || '').trim();
 const recentCategory = localStorage.getItem(LAST_CATEGORY_KEY) || '';
 const timeBand = buildAiSituationContext?.().timeBand || '';
 const profile = state.currentUserProfile || {};
 return {
 favoriteSet,
 activeCategory,
 keyword,
 recentCategory,
 timeBand,
 dong: profile.dong || profile.building || '',
 ho: profile.ho || profile.unit || ''
 };
 }

 function getAiBenefitText(item={}){
 return stringifyAiCandidateText(item, 'benefit');
 }

 function inferAiWeatherTag(question='', answerText=''){
 const source = `${question || ''} ${answerText || ''}`;
 if(/비|우천|장마|소나기|빗방울|강수/.test(source)) return '☔ 비오는날 추천';
 if(/눈|폭설|눈날림/.test(source)) return '❄️ 눈오는날 추천';
 if(/더운|폭염|무더위|기온|여름|실내/.test(source)) return 'HOT 더운날 실내 추천';
 if(/맑|날씨 좋|산책|야외/.test(source)) return '☀️ 날씨 기반 추천';
 return '';
 }

 function shouldAttachWeatherTagToItem(item={}, question='', answerText=''){
 const tag = inferAiWeatherTag(question, answerText);
 if(!tag) return '';
 const raw = stringifyAiCandidateText(item, 'benefit');
 if(tag.includes('비') && /카페|디저트|커피|떡|베이커리|미용|실내|음식|식당|분식/i.test(raw)) return tag;
 if(tag.includes('눈') && /카페|디저트|커피|음식|식당|실내/i.test(raw)) return tag;
 if(tag.includes('더운') && /카페|커피|음료|디저트|빙수|실내/i.test(raw)) return tag;
 if(tag.includes('날씨')) return tag;
 return '';
 }


 function inferAiAudienceSituationIntent(question=''){
 const q = normalizeAiSearchText(question || '');
 const compact = String(question || '').replace(/\s+/g, '');
 const hasAny = (patterns) => patterns.some(re => re.test(q) || re.test(compact));
 const audience = [];
 if(hasAny([/키즈|아이|아이와|아이랑|아이하고|아이들과|자녀|어린이|유아|아기|아가|초등/])) audience.push('키즈');
 if(hasAny([/가족|부모님|부모|어르신|어른|시니어|노인|할머니|할아버지|엄마|아빠/])) audience.push('가족');
 if(hasAny([/10대|십대|청소년|학생|중학생|고등학생/])) audience.push('10대');
 if(hasAny([/20대|이십대|대학생|청년|젊은|친구|데이트|소개팅/])) audience.push('20대');
 if(hasAny([/30대|삼십대|직장인|신혼|부부|육아/])) audience.push('30대');
 if(hasAny([/40대|사십대|중년|가장/])) audience.push('40대');
 if(hasAny([/50대|오십대|중장년/])) audience.push('50대');
 if(hasAny([/60대|육십대|시니어|어르신/])) audience.push('60대');
 if(hasAny([/70대|칠십대|고령|어르신/])) audience.push('70대');
 if(hasAny([/80대|팔십대|고령|어르신/])) audience.push('80대');
 const situation = [];
 if(hasAny([/데이트|소개팅|연인|커플|분위기|예쁜|감성/])) situation.push('데이트');
 if(hasAny([/혼밥|혼자|1인|혼자먹|혼자갈|혼자서/])) situation.push('혼밥');
 if(hasAny([/비오는날|비올때|비와|우천|장마|실내/])) situation.push('비오는날');
 if(hasAny([/운동|헬스|필라테스|요가|체육|스포츠|야구|골프|짐|pt/])) situation.push('운동');
 if(hasAny([/미용|헤어|네일|피부|뷰티|왁싱|마사지|관리|염색|커트|펌/])) situation.push('미용');
 return { audience:[...new Set(audience)], situation:[...new Set(situation)], raw:q };
 }

 function scoreAiAudienceSituationItem(item={}, question=''){
 const intent = inferAiAudienceSituationIntent(question);
 if(!intent.audience.length && !intent.situation.length) return { score:0, reasons:[] };
 const raw = stringifyAiCandidateText(item, 'benefit');
 const hay = normalizeAiSearchText(raw);
 const has = (words) => words.some(word => hay.includes(normalizeAiSearchText(word)));
 let score = 0;
 const reasons = [];
 const add = (value, reason) => { score += value; if(reason) reasons.push(reason); };

 intent.audience.forEach(tag => {
   if(tag === '키즈') {
     if(has(['키즈','아이','어린이','유아','아동','초등','체험','놀이','야구','스포츠','분식','피자','치킨','디저트','베이커리','카페','가족'])) add(9, '키즈 추천');
   } else if(tag === '가족') {
     if(has(['가족','부모','어르신','시니어','식당','음식','카페','베이커리','미용','병원','약국','건강','주차','편한'])) add(9, '가족 추천');
   } else if(tag === '10대') {
     if(has(['10대','학생','청소년','학원','문구','분식','치킨','피자','카페','디저트','야구','스포츠','체험'])) add(8, '10대 추천');
   } else if(tag === '20대') {
     if(has(['20대','청년','대학생','데이트','카페','디저트','미용','뷰티','네일','피부','헬스','운동','맛집','베이커리','사진'])) add(8, '20대 추천');
   } else if(tag === '30대') {
     if(has(['30대','직장인','신혼','부부','육아','카페','맛집','식당','미용','운동','헬스','피부','베이커리','가족'])) add(7, '30대 추천');
   } else if(tag === '40대') {
     if(has(['40대','중년','가족','식당','카페','미용','운동','헬스','병원','약국','건강','베이커리'])) add(7, '40대 추천');
   } else if(tag === '50대') {
     if(has(['50대','중장년','식당','카페','미용','병원','약국','건강','한의원','운동','편한','주차'])) add(7, '50대 추천');
   } else if(['60대','70대','80대'].includes(tag)) {
     if(has([tag,'시니어','어르신','노인','고령','건강','병원','약국','한의원','식당','카페','미용','편한','주차','가까운'])) add(9, `${tag} 추천`);
   }
 });

 intent.situation.forEach(tag => {
   if(tag === '데이트' && has(['데이트','분위기','카페','디저트','브런치','베이커리','맛집','식당','미용','뷰티','사진','감성'])) add(9, '데이트 추천');
   if(tag === '혼밥' && has(['혼밥','1인','분식','김밥','식당','맛집','피자','치킨','카페','브런치','간편','포장'])) add(9, '혼밥 추천');
   if(tag === '비오는날' && has(['실내','카페','커피','디저트','베이커리','음식','식당','미용','따뜻','브런치'])) add(8, '비오는날 추천');
   if(tag === '운동' && has(['운동','헬스','필라테스','요가','스포츠','야구','골프','체육','pt','짐','건강'])) add(10, '운동 추천');
   if(tag === '미용' && has(['미용','헤어','네일','피부','뷰티','왁싱','마사지','관리','염색','커트','펌'])) add(10, '미용 추천');
 });

 return { score, reasons:[...new Set(reasons)].slice(0,4) };
 }

 function scoreAiBenefitMatch(item={}, question='', answerText=''){
 const signals = getAiUserPersonalSignals();
 const raw = getAiBenefitText(item);
 const norm = normalizeAiSearchText(raw);
 const qNorm = normalizeAiSearchText(question);
 const aNorm = normalizeAiSearchText(answerText);
 const nameNorm = normalizeAiSearchText(item.name || item.storeName || item.title || '');
 const categoryNorm = normalizeAiSearchText(item.category || '');
 const benefitNorm = normalizeAiSearchText(item.benefit || item.description || item.content || '');
 const tokens = getAiSearchTokens(`${question} ${answerText}`).map(normalizeAiSearchText).filter(Boolean);
 let score = 0;
 const reasons = [];

 if(nameNorm && (aNorm.includes(nameNorm) || qNorm.includes(nameNorm))){
 score += 18; reasons.push('매장명 일치');
 }
 if(categoryNorm && (qNorm.includes(categoryNorm) || aNorm.includes(categoryNorm))){
 score += 8; reasons.push('카테고리 일치');
 }
 tokens.forEach(t => {
 if(t && norm.includes(t)) score += t.length >= 4 ? 3 : 1.5;
 });
 if(benefitNorm && benefitNorm.length >= 4 && aNorm.includes(benefitNorm.slice(0, Math.min(10, benefitNorm.length)))){
 score += 6; reasons.push('혜택 문구 일치');
 }
 if(signals.favoriteSet.has(String(item.id))){
 score += 7; reasons.push('즐겨찾기 기반');
 }
 if(signals.activeCategory && normalizeAiSearchText(signals.activeCategory) === categoryNorm){
 score += 4; reasons.push('현재 카테고리');
 }
 if(signals.recentCategory && signals.recentCategory !== '전체' && normalizeAiSearchText(signals.recentCategory) === categoryNorm){
 score += 3; reasons.push('최근 관심 카테고리');
 }
 if(/가까|근처|주변|거리|위치/.test(question) && getBenefitDisplayAddress(item)){
 score += 4; reasons.push('위치 정보 있음');
 }
 if(/전화|연락|예약|문의/.test(question) && pickAiPhone(item)){
 score += 4; reasons.push('전화 가능');
 }
 if(/점심|식사|밥|저녁|아침/.test(question) && /식당|음식|카페|디저트|베이커리|분식|치킨|피자|한식|중식|일식|양식/i.test(raw)){
 score += 3; reasons.push('생활 상황');
 }
 if(/아이|아이랑|아이하고|아이들과|가족|키즈|자녀|어린이/.test(question) && /키즈|가족|아이|어린이|디저트|카페|학원|문구|놀이|체험|야구|스포츠|베이커리/i.test(raw)){
 score += 5; reasons.push('아이/가족 상황');
 }
 if(/부모님|부모|어르신|어른|시니어|노인/.test(question) && /부모|어르신|시니어|건강|병원|약국|한의원|식당|카페|베이커리|미용|편한|주차/i.test(raw)){
 score += 5; reasons.push('부모님/어르신 상황');
 }
 if(/10대|십대|청소년|학생|중학생|고등학생/.test(question) && /학생|청소년|학원|문구|카페|디저트|분식|치킨|피자|야구|스포츠|체험/i.test(raw)){
 score += 5; reasons.push('10대 상황');
 }
 if(/20대|이십대|청년|젊은|친구|데이트/.test(question) && /카페|디저트|미용|뷰티|네일|피부|헬스|운동|데이트|식당|맛집|베이커리|사진|술|펍/i.test(raw)){
 score += 5; reasons.push('20대 상황');
 }
 if(/30대|삼십대|직장인|신혼|부부|육아/.test(question) && /카페|맛집|식당|미용|운동|헬스|피부|베이커리|가족|육아/i.test(raw)){
 score += 5; reasons.push('30대 상황');
 }
 if(/40대|사십대|중년|가장/.test(question) && /가족|식당|카페|미용|운동|헬스|병원|약국|건강|베이커리/i.test(raw)){
 score += 5; reasons.push('40대 상황');
 }
 if(/50대|오십대|중장년/.test(question) && /식당|카페|미용|병원|약국|건강|한의원|운동|편한|주차/i.test(raw)){
 score += 5; reasons.push('50대 상황');
 }
 if(/60대|육십대|70대|칠십대|80대|팔십대|시니어|고령/.test(question) && /시니어|어르신|노인|건강|병원|약국|한의원|식당|카페|미용|편한|주차|가까운/i.test(raw)){
 score += 6; reasons.push('시니어 상황');
 }
 if(/데이트|소개팅|연인|커플|분위기|감성/.test(question) && /데이트|분위기|카페|디저트|브런치|베이커리|맛집|식당|미용|뷰티|사진|감성/i.test(raw)){
 score += 5; reasons.push('데이트 상황');
 }
 if(/혼밥|혼자|1인|혼자먹|혼자갈/.test(question) && /혼밥|1인|분식|김밥|식당|맛집|피자|치킨|카페|브런치|간편|포장/i.test(raw)){
 score += 5; reasons.push('혼밥 상황');
 }
 if(/운동|헬스|필라테스|요가|체육|스포츠|야구|골프|짐|pt/i.test(question) && /운동|헬스|필라테스|요가|스포츠|야구|골프|체육|pt|짐|건강/i.test(raw)){
 score += 6; reasons.push('운동 상황');
 }
 if(/미용|헤어|네일|피부|뷰티|왁싱|마사지|관리|염색|커트|펌/.test(question) && /미용|헤어|네일|피부|뷰티|왁싱|마사지|관리|염색|커트|펌/i.test(raw)){
 score += 6; reasons.push('미용 상황');
 }
 const audienceSituationScore = scoreAiAudienceSituationItem(item, question);
 if(audienceSituationScore.score){
 score += audienceSituationScore.score;
 reasons.push(...audienceSituationScore.reasons);
 }
 const weatherTag = shouldAttachWeatherTagToItem(item, question, answerText);
 if(weatherTag){
 score += 3; reasons.push(weatherTag);
 }

 return { item, score, reason: reasons[0] || '질문 내용 매칭', reasons: [...new Set(reasons)].slice(0,4), weatherTag };
 }

 function mapAiBenefitsForQuestion(question='', answerText='', maxCount=4){
 try{
 return (state.benefits || [])
 .filter(item => item && item.id && (typeof isRecommendableBenefit !== 'function' || isRecommendableBenefit(item)) && isBenefitInRequestedCommercialZone(item, question))
 .map(item => scoreAiBenefitMatch(item, question, answerText))
 .filter(v => v.score >= 3)
 .sort((a,b) => b.score - a.score)
 .slice(0, maxCount);
 }catch(error){
 console.warn('AI 혜택 매핑 실패:', error);
 return [];
 }
 }

 function getAiPersonalSummary(){
 const signals = getAiUserPersonalSignals();
 const bits = [];
 if(signals.favoriteSet.size) bits.push(`즐겨찾기 ${signals.favoriteSet.size}개`);
 if(signals.activeCategory) bits.push(`현재 ${signals.activeCategory} 탭`);
 else if(signals.recentCategory && signals.recentCategory !== '전체') bits.push(`최근 ${signals.recentCategory} 관심`);
 if(signals.timeBand) bits.push(signals.timeBand);
 return bits.join(' · ') || '질문 내용 기반';
 }

 function collectAiLocalCandidates(question='', maxCount=12){
 try{
 const tokens = getAiSearchTokens(question);
 const qNorm = normalizeAiSearchText(question);
 const pool = [];
 (state.benefits || []).filter(item => !item || ((typeof isRecommendableBenefit !== 'function' || isRecommendableBenefit(item)) && isBenefitInRequestedCommercialZone(item, question))).forEach(item => pool.push({ type:'benefit', item }));
 (state.notices || []).forEach(item => pool.push({ type:'notice', item }));
 (state.aiKnowledge || []).forEach(item => pool.push({ type:item.type || 'ai', item }));

 const scored = pool.map(({type,item}) => {
 const raw = stringifyAiCandidateText(item, type);
 const norm = normalizeAiSearchText(raw);
 let score = 0;
 tokens.forEach(t => {
 const nt = normalizeAiSearchText(t);
 if(nt && norm.includes(nt)) score += nt.length >= 4 ? 4 : 2;
 });
 if(qNorm && norm.includes(qNorm)) score += 10;
 const phone = pickAiPhone(item);
 if(phone && /(전화|연락|번호|관리사무소|관리실)/.test(question)) score += 4;
 if(type === 'benefit' && /(혜택|할인|매장|가게)/.test(question)) score += 2;
 if(type === 'notice' && /(공지|안내|알림)/.test(question)) score += 2;
 return { type, item, score };
 }).filter(v => v.score > 0)
 .sort((a,b) => b.score - a.score)
 .slice(0, maxCount);

 return scored.map(({type,item,score}) => {
 const pos = getBenefitLatLng(item) || {};
 return {
 type,
 id: item.id || '',
 title: item.name || item.storeName || item.title || item.department || '',
 name: item.name || item.storeName || item.title || item.department || '',
 category: item.category || '',
 benefit: item.benefit || item.description || '',
 description: item.description || item.benefit || item.content || '',
 content: item.content || item.body || item.memo || item.note || '',
 address: getBenefitDisplayAddress(item) || item.roadAddress || '',
 roadAddress: item.roadAddress || '',
 phone: pickAiPhone(item),
 link: item.link || item.url || item.naverUrl || '',
 naverReservationEnabled: hasNaverReservation(item),
 naverReservationUrl: getNaverReservationInfo(item).url,
 naverServices: getEnabledNaverServices(item).map(v => ({ key:v.key, label:v.label, url:v.url || '' })),
 naverOrderEnabled: getNaverServiceInfo(item, NAVER_SERVICE_CONFIGS[1]).enabled,
 naverOrderUrl: getNaverServiceInfo(item, NAVER_SERVICE_CONFIGS[1]).url,
 naverDeliveryEnabled: getNaverServiceInfo(item, NAVER_SERVICE_CONFIGS[2]).enabled,
 naverDeliveryUrl: getNaverServiceInfo(item, NAVER_SERVICE_CONFIGS[2]).url,
 naverTalkEnabled: getNaverServiceInfo(item, NAVER_SERVICE_CONFIGS[3]).enabled,
 naverTalkUrl: getNaverServiceInfo(item, NAVER_SERVICE_CONFIGS[3]).url,
 reservationText: getEnabledNaverServices(item).map(v => v.label).join(' · '),
 lat: pos.lat ?? item.lat ?? item.latitude ?? null,
 lng: pos.lng ?? item.lng ?? item.lon ?? item.longitude ?? null,
 isOpenNow: item.isOpenNow,
 businessHoursManual: item.businessHoursManual || item.manualBusinessHours || item.adminBusinessHours || item.adminHoursText || '',
 openingHoursManual: item.openingHoursManual || null,
 todayOpenText: item.businessHoursManual || item.manualBusinessHours || item.adminBusinessHours || item.adminHoursText || item.todayOpenText || item.hoursText || item.openHoursText || '',
 openStatusText: item.openStatusText || '',
 openingHours: item.openingHoursManual || item.openingHours || null,
 openingHoursSource: (item.businessHoursManual || item.manualBusinessHours || item.adminBusinessHours || item.adminHoursText || item.openingHoursManual) ? 'admin' : (item.openingHoursSource || ''),
 naverHome: item.naverHome || null,
 keywords: item.keywords || [],
 attachments: Array.isArray(item.attachments) ? item.attachments : [],
 attachmentCount: Array.isArray(item.attachments) ? item.attachments.length : Number(item.attachmentCount || 0),
 score
 };
 });
 }catch(e){
 console.warn('collectAiLocalCandidates 실패:', e);
 return [];
 }
 }

 function buildAiPageContext(question=''){
 try{
 const now = new Date();
 return {
 appName: '더운정픽',
 env: ENV,
 currentView: state.view || document.querySelector('.nav-btn.active')?.dataset?.view || 'home',
 activeCategory: state.category || document.querySelector('.chip.active')?.textContent?.trim() || '',
 keyword: state.keyword || document.querySelector('#searchInput')?.value || '',
 benefitSortMode: state.benefitSortMode || 'default',
 distanceRadius: state.distanceRadius || 'all',
 benefitCount: Array.isArray(state.benefits) ? state.benefits.length : 0,
 noticeCount: Array.isArray(state.notices) ? state.notices.length : 0,
 localCandidates: collectAiLocalCandidates(question, 12),
 userLocation: state.userLocation ? { lat: state.userLocation.lat, lng: state.userLocation.lng, fetchedAt: state.userLocationFetchedAt || 0 } : null,
 location: state.userLocation ? { lat: state.userLocation.lat, lng: state.userLocation.lng } : null,
 url: location.href,
 clientTimeText: now.toLocaleString('ko-KR'),
 timestamp: now.toISOString()
 };
 }catch(e){
 console.warn('buildAiPageContext 실패:', e);
 return { appName:'더운정픽', localCandidates:[] };
 }
 }

 function extractAiBenefitCards(finalText='', maxCount=3, question=''){
 const mapped = mapAiBenefitsForQuestion(question, finalText, maxCount);
 if(mapped.length) return mapped;
 const qNorm = normalizeAiSearchText(question || '');
 const explicitRecommendation = /(혜택|할인|매장|가게|상가|추천|데이트|아이와|아이랑|아이하고|아이들과|자녀|키즈|부모님|부모|어르신|어른|시니어|노인|10대|십대|청소년|학생|20대|이십대|청년|젊은|30대|삼십대|40대|사십대|50대|오십대|60대|육십대|70대|칠십대|80대|팔십대|고령|데이트|혼밥|혼자|운동|헬스|필라테스|요가|스포츠|미용|헤어|네일|피부|뷰티|갈만한|갈만한곳|가기좋은|가기 좋은|점심|저녁|밥|카페|맛집|디저트|비오는날|비올때|눈|눈올때|눈이|비|맑음|흐림|추울때|더울때|날씨|가까운|근처|TOP5|TOP\s*5|탑5)/.test(qNorm);
 if(explicitRecommendation){
   const fallback = (state.benefits || [])
     .filter(item => item && item.id && (typeof isRecommendableBenefit !== 'function' || isRecommendableBenefit(item)) && isBenefitInRequestedCommercialZone(item, question))
     .map(item => {
       const score = Number(item.popularScore || item.score || item.recommendScore || 0)
         + Number(item.favoriteCount || 0) * 2
         + Number(item.detailViewCount || 0) * 0.2
         + Number(item.shareClickCount || 0) * 1.5
         + (item.recommended ? 8 : 0)
         + (item.isHot || item.hot ? 5 : 0);
       const reasons = [];
       if(item.recommended) reasons.push('추천 혜택');
       if(item.category) reasons.push(item.category);
       if(getBenefitDisplayAddress(item)) reasons.push('위치 정보 있음');
       return { item, score: Math.max(4, score || 4), reason: reasons[0] || '혜택 추천', reasons: reasons.slice(0,4) };
     })
     .sort((a,b) => b.score - a.score)
     .slice(0, maxCount);
   if(fallback.length) return fallback;
 }
 const text = normalizeAiSearchText(finalText);
 if(!text) return [];
 return (state.benefits || [])
 .filter(item => item && item.id && (typeof isRecommendableBenefit !== 'function' || isRecommendableBenefit(item)))
 .map(item => {
 const name = item.name || item.storeName || item.title || '';
 const n = normalizeAiSearchText(name);
 const category = normalizeAiSearchText(item.category || '');
 let score = 0;
 const reasons = [];
 if(n && text.includes(n)){ score += 10; reasons.push('매장명 일치'); }
 if(category && text.includes(category)){ score += 2; reasons.push('카테고리 일치'); }
 const benefit = normalizeAiSearchText(item.benefit || item.description || '');
 if(benefit && benefit.length >= 4 && text.includes(benefit.slice(0, Math.min(8, benefit.length)))){ score += 2; reasons.push('혜택 문구 일치'); }
 return { item, score, reason: reasons[0] || '답변 내용 매칭', reasons };
 })
 .filter(v => v.score > 0)
 .sort((a,b) => b.score - a.score)
 .slice(0, maxCount);
 }

 function extractAiPhoneCards(finalText=''){
 const source = String(finalText || '');
 const phonePattern = /(?:0507[-.\s]?\d{3,4}[-.\s]?\d{4}|0\d{1,2}[-.\s]?\d{3,4}[-.\s]?\d{4}|15\d{2}[-.\s]?\d{4}|16\d{2}[-.\s]?\d{4}|18\d{2}[-.\s]?\d{4})/g;
 const found = [...source.matchAll(phonePattern)].map(m => String(m[0] || '').trim()).filter(Boolean);
 const unique = [...new Set(found)].slice(0, 4);
 return unique.map(phone => {
 const clean = phone.replace(/[^\d]/g, '');
 let label = '전화번호';
 if(/관리사무소|관리실|생활지원센터|사무소|민원/.test(source)) label = '관리사무소';
 else if(/업체|매장|가게|상가|혜택/.test(source)) label = '매장 전화번호';
 return { label, phone, tel: clean };
 });
 }

 function inferApartmentLifeContactLabel(question='', answer=''){
 const q = normalizeAiSearchText(`${question || ''} ${answer || ''}`);
 const groups = [
 { label:'분양사무소', keys:['분양사무소','분양'] },
 { label:'승강기 고장 신고', keys:['승강기고장신고','승강기','엘리베이터','고장신고','고장'] },
 { label:'운정1동 행정복지센터', keys:['운정1동행정복지센터','행정복지센터','주민센터','전입신고','전입'] },
 { label:'파주교육지원청', keys:['파주교육지원청','교육지원청','교육청','고등학교','중학교','입학'] },
 { label:'인터넷 가입', keys:['전화인터넷','인터넷가입','인터넷','통신','kt','sk','lg','가입'] },
 { label:'서울도시가스', keys:['서울도시가스','도시가스','가스'] },
 { label:'키불출센터', keys:['키불출센터','키불출','키불출센타'] },
 { label:'입주증센터', keys:['입주증센터','입주증','입주센터'] },
 { label:'입주지원센터', keys:['입주지원센터','입주민센터','입주센터'] },
 { label:'A/S센터', keys:['a/s센터','as센터','as','a/s','에이에스','하자','수리'] },
 { label:'파주시청', keys:['파주시청','시청'] },
 { label:'관리사무소', keys:['관리사무소','관리실','생활지원센터','아파트관리','아파트사무소','관리'] }
 ];
 const found = groups.find(group => group.keys.some(key => q.includes(normalizeAiSearchText(key))));
 return found?.label || '전화번호';
 }

 const APARTMENT_LIFE_CONTACT_FALLBACKS = [
 { label:'서울도시가스', keys:['서울도시가스','도시가스','가스'], phones:['1588-5788','031-946-7229'] },
 { label:'파주시청', keys:['파주시청','시청'], phones:['031-940-4114'] },
 { label:'입주증센터', keys:['입주증센터','입주증'], phones:['031-937-8671'] },
 { label:'승강기 고장 신고', keys:['승강기고장신고','승강기','엘리베이터','고장신고','고장'], phones:['1577-0603'] },
 { label:'A/S센터', keys:['a/s센터','as센터','as','a/s','에이에스','하자','수리'], phones:['031-937-8681'] },
 { label:'H리셉션(입주지원센터 [아파트])', keys:['h리셉션','리셉션','버리셀션','비리셀션','입주지원센터','입주민센터'], phones:['031-538-7851'] },
 { label:'관리사무소', keys:['관리사무소','관리실','생활지원센터','아파트관리','아파트사무소'], phones:['031-949-1212'] },
 { label:'파주교육지원청', keys:['파주교육지원청','교육지원청','교육청','고등학교','중학교','입학'], phones:['031-940-7114'] },
 { label:'인터넷 가입', keys:['전화인터넷','인터넷가입','인터넷','통신','kt','sk','lg','가입'], phones:['100','106','101'] },
 { label:'키불출센터', keys:['키불출센터','키불출','키불출센타'], phones:['031-937-8670'] },
 { label:'분양사무소', keys:['분양사무소','분양'], phones:['031-941-0331'] },
 { label:'운정1동 행정복지센터', keys:['운정1동행정복지센터','운정1동','행정복지센터','주민센터','전입신고','전입'], phones:['031-820-7703'] }
 ];

 function getApartmentLifeFallbackContact(question='', answer=''){
 const q = normalizeAiSearchText(`${question || ''} ${answer || ''}`);
 return APARTMENT_LIFE_CONTACT_FALLBACKS.find(row => row.keys.some(key => q.includes(normalizeAiSearchText(key)))) || null;
 }

 function extractTrustedApartmentLifePhones(question='', answer=''){
 const source = String(answer || '');
 const q = normalizeAiSearchText(question);
 const fullPhonePattern = /(?:0507[-.\s]?\d{3,4}[-.\s]?\d{4}|0\d{1,2}[-.\s]?\d{3,4}[-.\s]?\d{4}|15\d{2}[-.\s]?\d{4}|16\d{2}[-.\s]?\d{4}|18\d{2}[-.\s]?\d{4})/g;
 let phones = [...source.matchAll(fullPhonePattern)].map(m => String(m[0] || '').replace(/[.\s]+/g, '-').trim()).filter(Boolean);

 // 통신사 대표번호처럼 관리자 연락처 필드에 3자리로 등록되는 값만 질문 문맥이 명확할 때 허용합니다.
 if(/인터넷|통신|kt|sk|lg|가입/.test(q)){
 phones.push(...([...source.matchAll(/\b(?:100|101|106)\b/g)].map(m => m[0])));
 }
 if(/키불출|입주증/.test(q)){
 phones.push(...([...source.matchAll(/\b109\b/g)].map(m => m[0])));
 }

 // 주소/동/지번에서 섞일 수 있는 숫자와 불완전 대표번호는 제거합니다.
 const blockedByQuestion = new Set();
 if(/관리사무소|관리실|생활지원센터|분양사무소|분양/.test(q)) ['102','109'].forEach(v => blockedByQuestion.add(v));
 if(/행정복지센터|주민센터|전입/.test(q)) ['1358'].forEach(v => blockedByQuestion.add(v));
 if(/승강기|엘리베이터|고장/.test(q)) ['128','1577'].forEach(v => blockedByQuestion.add(v));

 phones = phones
 .map(v => String(v || '').trim())
 .filter(Boolean)
 .filter(v => !blockedByQuestion.has(v.replace(/[^\d]/g, '')))
 .filter(v => {
 const digits = v.replace(/[^\d]/g, '');
 if(/^(100|101|106|109)$/.test(digits)) return /인터넷|통신|kt|sk|lg|가입|키불출|입주증/.test(q);
 return digits.length >= 8;
 });

 return [...new Set(phones)].slice(0, 4).map(phone => ({
 label: inferApartmentLifeContactLabel(question, answer),
 phone,
 tel: phone.replace(/[^\d]/g, '')
 }));
 }

 function buildAiApartmentLifePhoneCardHtml(question='', answer=''){
 if(!isApartmentLifePhoneQuestion(question, answer)) return '';
 let cards = extractTrustedApartmentLifePhones(question, answer);
 const fallback = getApartmentLifeFallbackContact(question, answer);
 // 답변 본문에서 전화번호를 못 잡았거나, 질문 명칭과 카드 라벨이 어긋나면 관리자 기준 fallback을 우선합니다.
 if(fallback && (!cards.length || !cards.some(card => normalizeAiSearchText(card.label).includes(normalizeAiSearchText(fallback.label))))){
 cards = fallback.phones.map(phone => ({ label: fallback.label, phone, tel: String(phone).replace(/[^\d]/g,'') }));
 }
 if(!cards.length) return '';
 return buildAiPhoneCardHtml(cards.map(card => ({ ...card, label: `${card.label} 전화번호` })));
 }

 function buildAiPhoneCardHtml(cards=[]){
 if(!Array.isArray(cards) || !cards.length) return '';
 return cards.map(card => `
 <div class="ai-phone-card-auto">
 <div class="ai-phone-icon">☎️</div>
 <div class="ai-phone-info">
 <b>${escapeHtml(card.label || '전화번호')}</b>
 <span>${escapeHtml(card.phone || '')}</span>
 </div>
 <a class="ai-phone-call" href="tel:${escapeAttr(card.tel || '')}">전화</a>
 </div>`).join('');
 }

 function isAiLocationQuestion(question='', answer=''){
 const qRaw = String(question || '').trim();
 const aRaw = String(answer || '').trim();
 const q = normalizeAiSearchText(qRaw);
 const combined = normalizeAiSearchText(`${qRaw} ${aRaw}`);

 // 지도 카드는 사용자가 명시적으로 지도/길찾기/미니지도 표시를 요청한 경우에만 표시합니다.
 // 예: "아레볼 미니지도로 보여줘", "아레볼 지도 보여줘", "아레볼 길찾기 알려줘"
 const explicitMapAsk =
 /(미니지도|지도보여|지도로보여|지도띄워|지도표시|지도혜택|지도에서|길찾기|가는길|찾아가는길|네이버지도|위치지도)/.test(q);

 if(explicitMapAsk) return true;

 // 단순 주소 질문은 텍스트 주소만 답하고 지도 카드는 표시하지 않습니다.
 // 예: "아레볼 주소가 뭐야?", "아레볼 위치가 어디야?"
 if(/(주소|위치|어디|어딘)/.test(q) && !/(지도|길찾기|미니지도|보여|띄워|표시)/.test(q)){
 return false;
 }

 return false;
 }

 function getAiMapUrl(item={}){
 const name = item.name || item.storeName || item.title || '';
 const address = getBenefitSearchAddress(item) || item.roadAddress || '';
 const url = item.url || item.link || item.naverUrl || '';
 if(url) return url;
 return `https://map.naver.com/p/search/${encodeURIComponent(`${name} ${address}`.trim())}`;
 }

 function getAiDirectionsUrl(item={}){
 const name = item.name || item.storeName || item.title || '';
 const address = getBenefitSearchAddress(item) || item.roadAddress || '';
 const lat = Number(item.lat ?? item.latitude);
 const lng = Number(item.lng ?? item.lon ?? item.longitude);
 if(Number.isFinite(lat) && Number.isFinite(lng)){
 return `https://map.naver.com/p/directions/-/${lng},${lat},${encodeURIComponent(name || '목적지')}`;
 }
 return `https://map.naver.com/p/search/${encodeURIComponent(`${name} ${address}`.trim())}`;
 }

 function buildAiLocationMapCardHtml(mappedCards=[], question='', answer=''){
 if(!Array.isArray(mappedCards) || !mappedCards.length) return '';
 if(!isAiLocationQuestion(question, answer)) return '';
 const found = mappedCards.find(({item}) => item && (getBenefitDisplayAddress(item) || item.roadAddress || item.lat || item.lng));
 if(!found) return '';
 const item = found.item || {};
 const name = item.name || item.storeName || item.title || '매장';
 const address = getBenefitDisplayAddress(item) || item.roadAddress || '등록된 주소 정보가 없습니다.';
 const directionText = String(item.directionText || item.directionGuide || item.locationGuide || item.guideText || '').trim();
 const stationAccessText = String(item.stationAccessText || item.transitText || item.stationGuide || item.nearStationText || '').trim();
 const mapUrl = getAiMapUrl(item);
 const dirUrl = getAiDirectionsUrl(item);
 const pos = typeof getBenefitLatLng === 'function' ? getBenefitLatLng(item) : null;
 const distanceText = pos
 ? '현재 위치 기준 거리를 준비 중입니다.'
 : '매장 좌표가 아직 등록되지 않아 주소 기준으로 안내합니다.';
 return `
 <div class="ai-location-detail-card" data-ai-location-benefit-id="${escapeAttr(item.id || '')}">
 <div class="location-title"><strong>위치 안내</strong></div>
 <div class="location-address">${escapeHtml(address)}</div>
 ${renderStationAccessBadges(item)}
 ${benefitContextPanelHtml(item)}
 ${directionText ? `<div class="location-guide">${escapeHtml(directionText)}</div>` : ''}
 ${buildAiSocialHintHtml(item)}
 <div class="detail-map-box">
 ${pos ? `<div class="detail-map-canvas ai-location-map-canvas" data-ai-map-benefit-id="${escapeAttr(item.id || '')}"></div>` : '<div class="detail-map-empty">좌표가 등록되면 작은 지도가 표시됩니다.</div>'}
 </div>
 <div class="location-distance muted" data-ai-distance-benefit-id="${escapeAttr(item.id || '')}">${escapeHtml(distanceText)}</div>
 <div class="location-actions">
 <button class="btn btn-soft block" type="button" data-ai-open-benefit-id="${escapeAttr(item.id || '')}">혜택 상세</button>
 <a class="btn btn-soft block" href="${escapeAttr(mapUrl)}" target="_blank" rel="noopener">지도 보기</a>
 <a class="btn btn-primary block" href="${escapeAttr(dirUrl)}" target="_blank" rel="noopener">네이버 길찾기</a>
 </div>
 <div class="location-note">현재 위치 권한은 거리 표시를 위해서만 사용됩니다. 좌표가 없는 매장은 주소 기준으로 지도/길찾기만 제공합니다.</div>
 </div>`;
 }

 function waitFrames(count = 2){
 return new Promise((resolve) => {
 const step = () => {
 count -= 1;
 if(count <= 0){ resolve(); return; }
 requestAnimationFrame(step);
 };
 requestAnimationFrame(step);
 });
 }

 function waitForVisibleMapElement(el, timeout = 2500){
 return new Promise((resolve) => {
 const started = Date.now();
 const tick = () => {
 if(!el || !document.body.contains(el)){ resolve(false); return; }
 const rect = el.getBoundingClientRect();
 const style = window.getComputedStyle(el);
 const visible = rect.width >= 120 && rect.height >= 120 && style.display !== 'none' && style.visibility !== 'hidden';
 if(visible){ resolve(true); return; }
 if(Date.now() - started > timeout){ resolve(false); return; }
 requestAnimationFrame(tick);
 };
 tick();
 });
 }

 function forceNaverMapResize(map, center, bounds){
 const nm = window.naver?.maps;
 if(!map || !nm) return;
 const apply = () => {
 try{ nm.Event.trigger(map, 'resize'); }catch(_){}
 try{
 if(bounds) map.fitBounds(bounds, { top:36, right:36, bottom:36, left:36 });
 else if(center) map.setCenter(center);
 }catch(_){
 try{ if(center) map.setCenter(center); }catch(__){}
 }
 };
 apply();
 requestAnimationFrame(apply);
 setTimeout(apply, 80);
 setTimeout(apply, 220);
 setTimeout(apply, 520);
 setTimeout(apply, 950);
 }

 function clearMapElementForFreshRender(el){
 if(!el) return;
 el.innerHTML = '';
 el.removeAttribute('style');
 el.style.width = '100%';
 el.style.height = '178px';
 el.dataset.rendered = '';
 }

 async function renderAiLocationMiniMaps(scope){
 const root = scope || qs('#aiChatWindow') || document;
 const mapEls = root.querySelectorAll?.('.ai-location-map-canvas[data-ai-map-benefit-id]') || [];
 if(!mapEls.length) return;

 await waitFrames(2);

 for(const mapEl of mapEls){
 const benefitId = mapEl.dataset.aiMapBenefitId || '';
 const item = (state.benefits || []).find(v => String(v.id) === String(benefitId));
 const pos = item && typeof getBenefitLatLng === 'function' ? getBenefitLatLng(item) : null;
 if(!item || !pos) continue;

 const visible = await waitForVisibleMapElement(mapEl);
 if(!visible){
 mapEl.dataset.rendered = '';
 continue;
 }

 // 첫 렌더링 깨짐 방지를 위해 첫 시도에서는 항상 새로 초기화합니다.
 // 이미 안정적으로 렌더링된 지도는 반복 생성하지 않습니다.
 if(mapEl.dataset.rendered === 'stable') continue;
 clearMapElementForFreshRender(mapEl);

 try{
 await loadNaverMapsSdk();
 await waitFrames(2);

 const nm = window.naver.maps;
 const store = new nm.LatLng(pos.lat, pos.lng);
 const map = new nm.Map(mapEl, {
 center: store,
 zoom: 16,
 // AI 미니지도도 상세 페이지 지도처럼 네이버 기본 줌 컨트롤을 끄고
 // 박스 내부 커스텀 컨트롤을 사용합니다. 기본 컨트롤은 모바일/좁은 카드에서 잘릴 수 있습니다.
 zoomControl: false,
 scrollWheel: true,
 draggable: true,
 pinchZoom: true
 });
 ensureDetailMiniMapZoomControls(mapEl, map);

 const markerName = item.name || item.storeName || item.title || '매장';
 const markerHtml = `<div class="map-marker-store ai-map-marker-store" role="button" tabindex="0" title="${escapeAttr(markerName)}"><img class="upick-svg-icon ai-map-marker-pin" src="/icons/internal/pin.svg" alt="" loading="lazy"><span>${escapeHtml(markerName)}</span></div>`;
 const storeMarker = new nm.Marker({
 position: store,
 map,
 // AI 지도에서는 매장 좌표를 말풍선 왼쪽 기준에 맞춰 매장명 말풍선이 매장 기준 오른쪽으로 펼쳐지되 너무 밀리지 않게 보정합니다.
 // 긴 매장명은 내부 span에서만 말줄임 처리하고, 앞쪽에는 위치 마커 아이콘을 함께 표시합니다.
 icon: { content: markerHtml, anchor: new nm.Point(0,16) },
 zIndex: 100
 });
 nm.Event.addListener(storeMarker, 'click', () => {
   if(item?.id && typeof openDetail === 'function') openDetail(item);
 });

 const distanceEl = root.querySelector?.(`[data-ai-distance-benefit-id="${CSS.escape(String(benefitId))}"]`);
 const updateDistance = (currentLocation, cached=false) => {
 if(!distanceEl || !currentLocation) return;
 const distance = getDistanceMeters(currentLocation.lat, currentLocation.lng, pos.lat, pos.lng);
 if(distance > 200000){
 distanceEl.textContent = '매장 좌표가 실제 위치와 맞지 않는 것 같습니다. 주소 기준으로 지도를 확인해 주세요.';
 distanceEl.classList.add('muted');
 return;
 }
 distanceEl.textContent = `현재 위치에서 ${formatDistance(distance)} 거리입니다.${cached ? ' (최근 위치 기준)' : ''}`;
 distanceEl.classList.remove('muted');
 };

 let bounds = null;
 if(hasFreshUserLocation()){
 const me = new nm.LatLng(state.userLocation.lat, state.userLocation.lng);
 new nm.Marker({
 position: me,
 map,
 icon: { content: '<div class="map-marker-user" title="현재 위치"></div>', anchor: new nm.Point(9,9) },
 zIndex: 120
 });
 new nm.Polyline({
 map,
 path: [me, store],
 strokeColor: '#2563eb',
 strokeWeight: 4,
 strokeOpacity: .82
 });
 bounds = new nm.LatLngBounds();
 bounds.extend(me);
 bounds.extend(store);
 updateDistance(state.userLocation, true);
 }else if(navigator.geolocation){
 getReliableCurrentPosition({ forceRefresh:false })
 .then((currentLocation) => {
 updateDistance(currentLocation, false);
 mapEl.dataset.rendered = '';
 renderAiLocationMiniMaps(root);
 })
 .catch(() => {
 if(distanceEl){
 distanceEl.textContent = '현재 위치 권한을 허용하면 매장까지의 거리를 표시합니다.';
 distanceEl.classList.add('muted');
 }
 });
 }

 forceNaverMapResize(map, store, bounds);
 mapEl.dataset.rendered = 'stable';

 // 일부 모바일 WebView에서 첫 타일 계산이 틀어지는 경우가 있어 한 번 더 새로고침합니다.
 setTimeout(() => {
 try{
 const rect = mapEl.getBoundingClientRect();
 if(rect.width >= 120 && rect.height >= 120){
 forceNaverMapResize(map, store, bounds);
 }
 }catch(_){}
 }, 1200);
 }catch(error){
 console.warn('AI 위치 미니지도 렌더링 실패', error);
 mapEl.dataset.rendered = '';
 mapEl.innerHTML = '<div class="detail-map-empty">지도 로딩에 실패했습니다.</div>';
 }
 }
 }

 function isApartmentLifePhoneQuestion(question='', answer=''){
 const q = normalizeAiSearchText(question);
 const a = normalizeAiSearchText(answer);
 const lifeEntity = /(서울도시가스|도시가스|가스|파주시청|시청|입주증센터|입주증|입주지원센터|입주민센터|h리셉션|리셉션|버리셀션|비리셀션|승강기고장신고|승강기|엘리베이터|고장신고|as센터|as|에이에스|하자|h리셉션|리셉션|관리사무소|관리실|생활지원센터|파주교육지원청|교육지원청|교육청|고등학교|입학|전화인터넷|인터넷가입|인터넷|통신|kt|sk|lg|키불출센터|키불출|분양사무소|분양|운정1동행정복지센터|운정1동|행정복지센터|주민센터|전입신고|전입|경비실|경비|주차|방문차량|택배|민원|분리수거|쓰레기|재활용|음식물)/.test(q);
 const contactAsk = /(전화번호|전화|연락처|번호|문의|신고|고장|콜|통화)/.test(q);
 const answerHasContact = /(연락처|전화번호|전화번호는|대표번호|지역번호|문의번호|신고번호)/.test(a);
 // 아파트 생활정보 명칭만 입력해도 서버가 연락처 답변을 내려주면 생활정보 전용 카드/차단 모드로 처리합니다.
 return lifeEntity && (contactAsk || answerHasContact || q.length <= 24);
 }

function buildAiMatchedBenefitPhoneCardHtml(mappedCards=[], question=''){
 if(isApartmentLifePhoneQuestion(question)) return '';
 if(!Array.isArray(mappedCards) || !mappedCards.length) return '';
 const found = mappedCards.find(({item}) => item && pickAiPhone(item));
 if(!found) return '';
 const item = found.item || {};
 const phone = String(pickAiPhone(item) || '').trim();
 const tel = phone.replace(/[^\d]/g, '');
 if(!tel) return '';
 return `
 <div class="ai-phone-card-auto">
 <div class="ai-phone-icon">☎️</div>
 <div class="ai-phone-info">
 <b>${escapeHtml(item.name || item.storeName || item.title || '매장')} 전화번호</b>
 <span>${escapeHtml(phone)}</span>
 </div>
 <a class="ai-phone-call" href="tel:${escapeAttr(tel)}">전화</a>
 </div>`;
 }

 function isAiPhoneQuestion(question=''){
 const q = normalizeAiSearchText(question);
 return /(전화번호|전화|연락처|번호|콜|통화)/.test(q);
 }


function isExplicitAiBenefitQuestion(question='', answer=''){
 const q = normalizeAiSearchText(`${question || ''} ${answer || ''}`);
 return /(혜택|할인|매장|가게|상가|추천|TOP5|TOP\s*5|탑5|지도|거리|영업|전화|예약|즐겨찾기|쿠폰|정액권|방문|식당|카페|피자|치킨|디저트|미용|학원|병원|약국|베이커리|떡카페|데이트|아이와|아이랑|아이하고|자녀|키즈|부모님|부모|어르신|어른|시니어|10대|십대|청소년|학생|20대|이십대|청년|갈만한|갈만한곳|점심|저녁|밥|가족|비오는날|비올때|눈|눈올때|눈이|비|맑음|흐림|추울때|더울때|날씨|가기좋은|가기 좋은)/.test(q);
}

function isApartmentLifeKnowledgeQuestion(question='', answer=''){
 const q = normalizeAiSearchText(`${question || ''} ${answer || ''}`);
 return /(대형폐기물|폐기물|쓰레기|분리수거|재활용|음식물|배출|수거|관리사무소|관리실|생활지원|입주|전입|키불출|하자|승강기|엘리베이터|주차|택배|민원|가스|인터넷|교육지원청|행정복지센터|수수료|스티커)/.test(q);
}


function isAiDialogCandidateConfirmAnswer(finalText='', question=''){
 const text = normalizeAiSearchText(`${finalText || ''}`);
 return /찾으시려는건가요/.test(text) && /맞다고말씀해주시면/.test(text);
}


// ===== AI 오타/영문키 확인 응답 이어가기 =====
// 예: 사용자가 dkfpqh 입력 → AI가 “아레볼 맞나요?” 확인 → 사용자가 “맞습니다” 입력 시
// 다음 질문을 “아레볼”로 치환해서 카드/검색 흐름이 끊기지 않도록 합니다.
let aiPendingConfirmCandidate = '';

function normalizeAiFollowupAnswerText(text=''){
 return String(text || '')
   .trim()
   .split(' ').join('')
   .split('\n').join('')
   .split('\t').join('')
   .split('.').join('')
   .split('!').join('')
   .split('?').join('')
   .split('。').join('')
   .split('．').join('')
   .split(',').join('')
   .split('，').join('')
   .split('~').join('')
   .split('…').join('')
   .split(';').join('')
   .split(':').join('')
   .split('、').join('')
   .toLowerCase();
}

function isAiAffirmativeFollowupAnswer(text=''){
 const compact = normalizeAiFollowupAnswerText(text);
 if(!compact) return false;
 const exactConfirms = [
   '네','네네','넵','넵넵','예','예예','옙','옙옙','응','응응','어','어어','ㅇㅇ','ㅇㅋ','오케이',
   '맞아','맞아요','맞습니다','맞습니다요','맞다','맞음','맞네','맞네요','맞습니다네',
   '그렇습니다','그렇네요','그렇죠','그럼요','그래','그래요','그거','그겁니다',
   '그게맞아','그게맞아요','그게맞습니다','맞는것같아요','맞는것같습니다',
   'yes','y','ok','okay'
 ];
 if(exactConfirms.includes(compact)) return true;
 // 사용자가 문장형으로 답해도 이어서 검색되도록 보강합니다. 예: "네 맞습니다", "그렇습니다", "맞습니다 찾아주세요"
 const partialConfirms = [
   '맞습니다','맞아요','맞아','맞음','맞네요','맞는것같',
   '그렇습니다','그렇네요','그렇죠','그럼요','그게맞',
   '네맞','예맞','응맞','넵맞','맞습니다찾아','확인해줘','찾아주세요',
   'yes','okay','ok','오케이'
 ];
 return partialConfirms.some(keyword => compact.includes(keyword));
}

const AI_DUBEOL_INITIALS = ['ㄱ','ㄲ','ㄴ','ㄷ','ㄸ','ㄹ','ㅁ','ㅂ','ㅃ','ㅅ','ㅆ','ㅇ','ㅈ','ㅉ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ'];
const AI_DUBEOL_MEDIALS = ['ㅏ','ㅐ','ㅑ','ㅒ','ㅓ','ㅔ','ㅕ','ㅖ','ㅗ','ㅘ','ㅙ','ㅚ','ㅛ','ㅜ','ㅝ','ㅞ','ㅟ','ㅠ','ㅡ','ㅢ','ㅣ'];
const AI_DUBEOL_FINALS = ['', 'ㄱ','ㄲ','ㄳ','ㄴ','ㄵ','ㄶ','ㄷ','ㄹ','ㄺ','ㄻ','ㄼ','ㄽ','ㄾ','ㄿ','ㅀ','ㅁ','ㅂ','ㅄ','ㅅ','ㅆ','ㅇ','ㅈ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ'];
const AI_DUBEOL_FINAL_TO_INITIAL = {'ㄱ':'ㄱ','ㄲ':'ㄲ','ㄴ':'ㄴ','ㄷ':'ㄷ','ㄹ':'ㄹ','ㅁ':'ㅁ','ㅂ':'ㅂ','ㅅ':'ㅅ','ㅆ':'ㅆ','ㅇ':'ㅇ','ㅈ':'ㅈ','ㅊ':'ㅊ','ㅋ':'ㅋ','ㅌ':'ㅌ','ㅍ':'ㅍ','ㅎ':'ㅎ'};
const AI_DUBEOL_KEY_TO_JAMO = {
 r:'ㄱ', R:'ㄲ', s:'ㄴ', e:'ㄷ', E:'ㄸ', f:'ㄹ', a:'ㅁ', q:'ㅂ', Q:'ㅃ', t:'ㅅ', T:'ㅆ', d:'ㅇ', w:'ㅈ', W:'ㅉ', c:'ㅊ', z:'ㅋ', x:'ㅌ', v:'ㅍ', g:'ㅎ',
 k:'ㅏ', o:'ㅐ', i:'ㅑ', O:'ㅒ', j:'ㅓ', p:'ㅔ', u:'ㅕ', P:'ㅖ', h:'ㅗ', y:'ㅛ', n:'ㅜ', b:'ㅠ', m:'ㅡ', l:'ㅣ'
};
const AI_DUBEOL_VOWEL_COMBINE = {'ㅗㅏ':'ㅘ','ㅗㅐ':'ㅙ','ㅗㅣ':'ㅚ','ㅜㅓ':'ㅝ','ㅜㅔ':'ㅞ','ㅜㅣ':'ㅟ','ㅡㅣ':'ㅢ'};
const AI_DUBEOL_FINAL_COMBINE = {'ㄱㅅ':'ㄳ','ㄴㅈ':'ㄵ','ㄴㅎ':'ㄶ','ㄹㄱ':'ㄺ','ㄹㅁ':'ㄻ','ㄹㅂ':'ㄼ','ㄹㅅ':'ㄽ','ㄹㅌ':'ㄾ','ㄹㅍ':'ㄿ','ㄹㅎ':'ㅀ','ㅂㅅ':'ㅄ'};
const AI_DUBEOL_FINAL_SPLIT = {'ㄳ':['ㄱ','ㅅ'],'ㄵ':['ㄴ','ㅈ'],'ㄶ':['ㄴ','ㅎ'],'ㄺ':['ㄹ','ㄱ'],'ㄻ':['ㄹ','ㅁ'],'ㄼ':['ㄹ','ㅂ'],'ㄽ':['ㄹ','ㅅ'],'ㄾ':['ㄹ','ㅌ'],'ㄿ':['ㄹ','ㅍ'],'ㅀ':['ㄹ','ㅎ'],'ㅄ':['ㅂ','ㅅ']};

function composeAiHangulSyllable(initial, medial, final=''){
 const i = AI_DUBEOL_INITIALS.indexOf(initial);
 const m = AI_DUBEOL_MEDIALS.indexOf(medial);
 const f = AI_DUBEOL_FINALS.indexOf(final || '');
 if(i < 0 || m < 0 || f < 0) return `${initial || ''}${medial || ''}${final || ''}`;
 return String.fromCharCode(0xAC00 + ((i * 21 + m) * 28) + f);
}

function isAiJamoVowel(jamo){ return AI_DUBEOL_MEDIALS.includes(jamo); }
function isAiJamoConsonant(jamo){ return AI_DUBEOL_INITIALS.includes(jamo); }

function convertAiDubeolSegmentToHangul(segment=''){
 const jamos = Array.from(String(segment || '')).map(ch => AI_DUBEOL_KEY_TO_JAMO[ch] || ch);
 let out = '';
 let initial = '';
 let medial = '';
 let final = '';
 const flush = () => {
   if(initial && medial) out += composeAiHangulSyllable(initial, medial, final);
   else out += `${initial || ''}${medial || ''}${final || ''}`;
   initial = ''; medial = ''; final = '';
 };

 for(const jamo of jamos){
   if(isAiJamoVowel(jamo)){
     if(!initial){
       initial = 'ㅇ';
       medial = jamo;
       continue;
     }
     if(initial && !medial){
       medial = jamo;
       continue;
     }
     if(initial && medial && !final){
       const combined = AI_DUBEOL_VOWEL_COMBINE[medial + jamo];
       if(combined){
         medial = combined;
       }else{
         flush();
         initial = 'ㅇ';
         medial = jamo;
       }
       continue;
     }
     if(initial && medial && final){
       const split = AI_DUBEOL_FINAL_SPLIT[final];
       if(split){
         final = split[0];
         flush();
         initial = AI_DUBEOL_FINAL_TO_INITIAL[split[1]] || split[1];
         medial = jamo;
       }else{
         const carry = AI_DUBEOL_FINAL_TO_INITIAL[final] || final;
         final = '';
         flush();
         initial = carry;
         medial = jamo;
       }
       continue;
     }
   }

   if(isAiJamoConsonant(jamo)){
     if(!initial){
       initial = jamo;
       continue;
     }
     if(initial && !medial){
       out += initial;
       initial = jamo;
       continue;
     }
     if(initial && medial && !final){
       final = jamo;
       continue;
     }
     if(initial && medial && final){
       const combined = AI_DUBEOL_FINAL_COMBINE[final + jamo];
       if(combined){
         final = combined;
       }else{
         flush();
         initial = jamo;
       }
       continue;
     }
   }

   flush();
   out += jamo;
 }
 flush();
 return out;
}

function normalizeAiTypoQueryForSearch(text=''){
 const original = String(text || '').trim();
 if(!original) return '';
 let cleaned = original
   .replace(/[\u200B-\u200D\uFEFF]/g, '')
   .replace(/^[\s.!?。．,，~…;:;、]+|[\s.!?。．,，~…;:;、]+$/g, '')
   .trim();

 // 한글 매장명 뒤에 잘못 붙은 영문/특수문자 노이즈 보정: "아레볼;f" → "아레볼"
 cleaned = cleaned.replace(/^([가-힣][가-힣\s]{1,30}?)[\s;:,.!?~`'"“”‘’()\[\]{}<>\\/|_-]*[a-zA-Z]{1,4}$/g, '$1').trim();

 // 영문 자판 + 한글 혼합 오타 보정: "dkfp볼" → "아레볼"
 if(/[a-zA-Z]/.test(cleaned) && /[가-힣]/.test(cleaned)){
   cleaned = cleaned.replace(/[a-zA-Z]+/g, segment => convertAiDubeolSegmentToHangul(segment));
 }

 // 순수 영문 오타는 너무 넓게 변환하면 일반 영어 질문까지 망가질 수 있어,
 // 변환 결과가 실제 등록 혜택명과 강하게 맞을 때만 보정합니다.
 if(/^[a-zA-Z]{2,16}$/.test(cleaned)){
   const converted = convertAiDubeolSegmentToHangul(cleaned);
   if(/[가-힣]/.test(converted) && isLikelyKnownBenefitKeyword(converted)){
     cleaned = converted;
   }
 }
 return cleaned || original;
}

function isLikelyKnownBenefitKeyword(keyword=''){
 const key = normalizeAiSearchText(keyword || '');
 if(!key || key.length < 2) return false;
 const list = Array.isArray(state?.benefits) ? state.benefits : [];
 return list.some(item => {
   const name = normalizeAiSearchText(item?.name || item?.title || '');
   return name && (name.includes(key) || key.includes(name));
 });
}

function extractAiConfirmCandidateFromText(finalText=''){
  const text = String(finalText || '').trim();
  if(!text) return '';

  const cleanCandidate = (value='') => {
    let out = String(value || '').trim();
    ['“','”','"',"'",'`'].forEach(ch => { out = out.split(ch).join(''); });
    ['혹시','그러면','그럼','네','예'].forEach(prefix => {
      if(out.startsWith(prefix)) out = out.slice(prefix.length).trim();
    });
    const suffixes = ['맞나요','맞으신가요','맞을까요','찾으시려는 건가요','찾으시려는건가요','입력하신 건가요','입력하신건가요'];
    suffixes.forEach(suffix => {
      const idx = out.indexOf(suffix);
      if(idx >= 0) out = out.slice(0, idx).trim();
    });
    ['을','를','이','가'].forEach(p => {
      if(out.endsWith(p) && out.length > 2) out = out.slice(0, -1).trim();
    });
    return normalizeAiTypoQueryForSearch(out);
  };

  const quotePairs = [['“','”'], ['"','"']];
  for(const [open, close] of quotePairs){
    const a = text.indexOf(open);
    if(a >= 0){
      const b = text.indexOf(close, a + 1);
      if(b > a){
        const candidate = cleanCandidate(text.slice(a + 1, b));
        if(candidate && candidate.length >= 2 && candidate.length <= 40) return candidate;
      }
    }
  }

  const markers = ['찾으시려는 건가요','찾으시려는건가요','맞나요','맞으신가요','맞을까요','입력하신 건가요','입력하신건가요'];
  for(const marker of markers){
    const idx = text.indexOf(marker);
    if(idx > 0){
      let before = text.slice(0, idx).trim();
      const maybeIdx = before.lastIndexOf('혹시');
      if(maybeIdx >= 0) before = before.slice(maybeIdx + 2).trim();
      const chunks = before.split(' ');
      let candidate = cleanCandidate(chunks.slice(-3).join(' '));
      if(candidate && candidate.length >= 2 && candidate.length <= 40) return candidate;
    }
  }
  return '';
}

function rememberAiConfirmCandidate(finalText=''){
 const candidate = extractAiConfirmCandidateFromText(finalText);
 if(candidate){
   aiPendingConfirmCandidate = candidate;
   try{ sessionStorage.setItem('aiPendingConfirmCandidate', candidate); }catch(_error){}
 }
 return candidate;
}

function resolveAiFollowupQuestion(rawQuestion=''){
 const original = String(rawQuestion || '').trim();
 const stored = aiPendingConfirmCandidate || (() => { try{ return sessionStorage.getItem('aiPendingConfirmCandidate') || ''; }catch(_error){ return ''; } })();
 if(stored && isAiAffirmativeFollowupAnswer(original)){
   aiPendingConfirmCandidate = '';
   try{ sessionStorage.removeItem('aiPendingConfirmCandidate'); }catch(_error){}
   return { originalQuestion: original, effectiveQuestion: normalizeAiTypoQueryForSearch(stored) || stored, usedConfirmCandidate: true };
 }
 if(original && !isAiAffirmativeFollowupAnswer(original)){
   aiPendingConfirmCandidate = '';
   try{ sessionStorage.removeItem('aiPendingConfirmCandidate'); }catch(_error){}
 }
 const normalizedQuestion = normalizeAiTypoQueryForSearch(original);
 return { originalQuestion: original, effectiveQuestion: normalizedQuestion || original, usedConfirmCandidate: false, normalizedTypo: normalizedQuestion && normalizedQuestion !== original };
}


function normalizeAiAttachmentTitleText(value=''){
 return normalizeAiSearchText(value || '')
   .replace(/처리안내|이용안내|안내문|안내|방법|정보|관련|자료|수수료|리스트|목록/g,'')
   .trim();
}

function isAiKnowledgeAttachmentQuestion(question=''){
 const q = normalizeAiSearchText(question || '');
 if(!q) return false;
 if(/(최근공지|공지알려|공지사항|혜택매장추천|혜택추천|매장추천|지도혜택|인기|TOP5|TOP\s*5|탑5|가까운|근처|할인매장|혜택매장|데이트|아이와|점심|저녁|밥|카페추천|맛집추천)/.test(q)) return false;
 return /(대형폐기물|폐기물|쓰레기|분리수거|재활용|음식물|배출|수거|관리사무소|관리실|생활지원|입주|전입|키불출|하자|승강기|엘리베이터|주차|택배|민원|가스|인터넷|교육지원청|행정복지센터|수수료|스티커|전자책|가이드|FAQ|faq|안내)/.test(q);
}

function getMatchedAiKnowledgeAttachmentsStrict(question='', answer=''){
 if(!isAiKnowledgeAttachmentQuestion(question)) return [];
 const qNorm = normalizeAiAttachmentTitleText(question);
 if(!qNorm) return [];

 const list = Array.isArray(state.aiKnowledge) ? state.aiKnowledge : [];
 const scored = [];

 list.forEach(item => {
   const attachments = Array.isArray(item.attachments) ? item.attachments.filter(a => a && (a.url || a.path || a.name)) : [];
   if(!attachments.length) return;

   const typeText = normalizeAiSearchText(item.type || item.category || '');
   const isKnowledgeType = /(faq|전자책|가이드|생활|안내|booklet|guide)/.test(typeText);
   if(!isKnowledgeType) return;

   const title = item.question || item.title || item.name || item.keywords || '';
   const titleNorm = normalizeAiAttachmentTitleText(Array.isArray(title) ? title.join(' ') : title);
   const keywordNorm = normalizeAiAttachmentTitleText(Array.isArray(item.keywords) ? item.keywords.join(' ') : (item.keywords || ''));
   const contentNorm = normalizeAiAttachmentTitleText(`${item.answer || ''} ${item.content || ''}`);

   let score = 0;
   if(titleNorm && titleNorm === qNorm) score += 100;
   if(titleNorm && (titleNorm.includes(qNorm) || qNorm.includes(titleNorm))) score += 70;
   if(keywordNorm && (keywordNorm.includes(qNorm) || qNorm.includes(keywordNorm))) score += 45;

   // 핵심어 교집합 기준: 대형폐기물 -> 대형폐기물 처리 안내 허용
   const qTokens = (qNorm.match(/[가-힣a-z0-9]{2,}/g) || []).filter(t => t.length >= 2);
   qTokens.forEach(t => {
     if(titleNorm.includes(t)) score += 18;
     else if(keywordNorm.includes(t)) score += 12;
     else if(contentNorm.includes(t)) score += 4;
   });

   if(score >= 35) scored.push({ item, attachments, score });
 });

 scored.sort((a,b)=>b.score-a.score);
 return scored.slice(0, 2).flatMap(v => v.attachments).slice(0, 6);
}

function shouldShowAiKnowledgeAttachments(question='', answer=''){
 return getMatchedAiKnowledgeAttachmentsStrict(question, answer).length > 0;
}


const AI_TTS_DEFAULT_VOICE = ''; // 서버의 관리자 기본 voice 설정을 사용합니다.
let currentAiTtsAudio = null;
let currentAiTtsObjectUrl = '';
let currentAiTtsButton = null;

function buildAiTtsControlsHtml(type='default'){
 return `<div class="ai-tts-actions" data-ai-tts-actions><button class="ai-tts-btn" type="button" data-ai-tts-play data-ai-tts-type="${escapeAttr(type || 'default')}">🔊 안내 음성으로 듣기</button><button class="ai-tts-btn stop" type="button" data-ai-tts-stop style="display:none">⏹ 정지</button><span class="ai-tts-error" data-ai-tts-error style="display:none"></span></div>`;
}

function resetAiTtsButtons(){
 document.querySelectorAll('[data-ai-tts-play]').forEach(btn => {
   if(btn.dataset.aiTtsLoading === 'true') delete btn.dataset.aiTtsLoading;
   btn.disabled = false;
   btn.textContent = '🔊 안내 음성으로 듣기';
   btn.classList.remove('playing');
 });
 document.querySelectorAll('[data-ai-tts-stop]').forEach(btn => { btn.style.display = 'none'; });
}

function stopAiTts(){
 try{
   if(currentAiTtsAudio){
     currentAiTtsAudio.pause();
     currentAiTtsAudio.currentTime = 0;
   }
 }catch(_error){}
 try{
   if(currentAiTtsObjectUrl) URL.revokeObjectURL(currentAiTtsObjectUrl);
 }catch(_error){}
 currentAiTtsAudio = null;
 currentAiTtsObjectUrl = '';
 currentAiTtsButton = null;
 resetAiTtsButtons();
}

function getAiTtsReadableText(button){
 const answer = button?.closest?.('.ai-answer') || button?.closest?.('.ai-bubble');
 if(!answer) return '';
 const summary = answer.querySelector('.ai-answer-summary') || answer.querySelector('.ai-stream-text') || answer;
 const clone = summary.cloneNode(true);
 clone.querySelectorAll('button, .ai-tts-actions, .ai-stream-cursor, script, style').forEach(el => el.remove());
 return String(clone.innerText || clone.textContent || '')
   .replace(/https?:\/\/\S+/g, '링크')
   .replace(/\s+/g, ' ')
   .trim();
}

function setAiTtsError(button, message){
 const box = button?.closest?.('[data-ai-tts-actions]');
 const errorEl = box?.querySelector?.('[data-ai-tts-error]');
 if(errorEl){
   errorEl.textContent = message || '';
   errorEl.style.display = message ? '' : 'none';
 }else if(message){
   alert(message);
 }
}

async function playAiTtsFromButton(button){
 if(!button || button.dataset.aiTtsLoading === 'true') return;
 const text = getAiTtsReadableText(button);
 if(!text){ setAiTtsError(button, '읽어줄 답변 내용이 없습니다.'); return; }
 if(!AI_TTS_SERVICE_URL){ setAiTtsError(button, '음성 안내 서버 주소가 설정되지 않았습니다.'); return; }

 stopAiTts();
 currentAiTtsButton = button;
 button.dataset.aiTtsLoading = 'true';
 button.disabled = true;
 button.textContent = '음성 준비 중...';
 setAiTtsError(button, '');

 try{
   let idToken = '';
   try{ idToken = state.currentUser?.getIdToken ? await state.currentUser.getIdToken() : ''; }catch(_error){}
   const response = await fetch(`${AI_TTS_SERVICE_URL}/tts`, {
     method: 'POST',
     headers: {
       'Accept': 'audio/mpeg',
       'Content-Type': 'application/json',
       ...(idToken ? { 'Authorization': `Bearer ${idToken}` } : {})
     },
     body: JSON.stringify({
       text,
       ...(AI_TTS_DEFAULT_VOICE ? { voice: AI_TTS_DEFAULT_VOICE } : {}),
       type: button.dataset.aiTtsType || 'default',
       env: ENV
     })
   });
   if(!response.ok){
     let message = '음성을 준비하지 못했습니다. 잠시 후 다시 시도해주세요.';
     try{ const data = await response.json(); if(data?.message) message = data.message; }catch(_error){}
     throw new Error(message);
   }
   const blob = await response.blob();
   currentAiTtsObjectUrl = URL.createObjectURL(blob);
   currentAiTtsAudio = new Audio(currentAiTtsObjectUrl);
   currentAiTtsAudio.onended = () => stopAiTts();
   currentAiTtsAudio.onerror = () => {
     setAiTtsError(button, '음성 재생 중 오류가 발생했습니다.');
     stopAiTts();
   };
   await currentAiTtsAudio.play();
   delete button.dataset.aiTtsLoading;
   button.disabled = false;
   button.textContent = '재생 중';
   button.classList.add('playing');
   const stopBtn = button.closest('[data-ai-tts-actions]')?.querySelector?.('[data-ai-tts-stop]');
   if(stopBtn) stopBtn.style.display = '';
 }catch(error){
   console.error('[AI TTS] failed', error);
   delete button.dataset.aiTtsLoading;
   button.disabled = false;
   button.textContent = '🔊 안내 음성으로 듣기';
   button.classList.remove('playing');
   setAiTtsError(button, error?.message || '음성을 준비하지 못했습니다. 잠시 후 다시 시도해주세요.');
 }
}



function isAiRecentNoticeGuideQuestion(question='', answer=''){
 const text = `${question || ''} ${answer || ''}`;
 const compact = String(text || '').replace(/\s+/g, '');
 return /(최근\s*공지|공지\s*알려|공지사항|공지)/i.test(text)
   || /(최근공지|공지알려|공지사항)/i.test(compact);
}

function isAiNotificationTroubleshootingQuestion(question='', answer=''){
 const text = `${question || ''} ${answer || ''}`;
 const compact = String(text || '').replace(/\s+/g, '');
 return /(알림|알람|푸시|push|notification)/i.test(text)
   || /(알림안|알람안|푸시안|알림이안|알람이안|알림허용|알림설정|푸시설정)/i.test(compact);
}

function isAiAppInstallGuideQuestion(question='', answer=''){
 const q = String(question || '').trim();
 const a = String(answer || '').trim();
 const compactQ = q.replace(/\s+/g, '');
 const compactA = a.replace(/\s+/g, '');

 // 알림/푸시 문제 답변은 홈 화면·바로가기 문구가 함께 나와도 앱 설치 안내로 분류하지 않습니다.
 if(isAiNotificationTroubleshootingQuestion(q, a)) return false;

 const hasInstallTargetInQuestion = /앱|어플|바로가기|홈\s*화면|홈화면|다운|다운로드|설치|저장|추가|PWA|웹앱|아이폰|갤럭시|안드로이드|사파리|크롬|삼성\s*인터넷/i.test(q)
   || /앱설치|어플설치|앱다운|어플다운|다운기능|홈화면추가|바로가기추가|바로가기만들기|저장하려면|지정하려면|설치경로/i.test(compactQ);
 const asksInstallInQuestion = /설치|다운|다운로드|저장|추가|바로가기|홈\s*화면|홈화면|앱처럼|어플처럼|경로|방법|어떻게|하게해|해줘|알려|지정/i.test(q)
   || /설치하게|다운기능|저장하려면|지정하려면|설치경로|앱처럼쓰기|어플처럼쓰기/i.test(compactQ);
 const guideAnswer = /앱스토어에서 받는 앱이 아니라|홈 화면에 추가|웹앱 방식|Safari로 더운정픽|Chrome 또는 삼성 인터넷/i.test(a)
   && !isAiNotificationTroubleshootingQuestion(q, a);
 return (hasInstallTargetInQuestion && asksInstallInQuestion) || guideAnswer;
}

function isAiDialogRejectAnswer(question='', answer=''){
 const q = String(question || '').replace(/[\s.!?。！？~～ㅋㅎㅠㅜ]+/g, '').toLowerCase();
 const a = String(answer || '').replace(/\s+/g, '');
 const negativeQuestion = /^(아니|아냐|아뇨|아니요|아닙니다|아니에요|아님|ㄴㄴ|노노|no|nope|틀려|틀렸|잘못|다른거|다른매장)/i.test(q)
   || /(그거|그건|그게|그매장).*(아님|아니|틀려|잘못)/i.test(q);
 const rejectAnswer = /알겠습니다.*(다른매장|다른안내|다시입력|다시검색)|해당매장은선택하지않겠습니다|해당안내는선택하지않겠습니다/i.test(a);
 return negativeQuestion && rejectAnswer;
}


function isAiNoResultAnswerText(answer=''){
 const compact = String(answer || '').replace(/\s+/g, '');
 return /현재등록된안내에서찾지못했습니다|등록된안내를찾지못했어요|등록된안내에서찾지못했습니다|찾지못했습니다|찾지못했어요|검색결과가없습니다|답변을준비하는중문제가발생했습니다|잠시후다시질문해/i.test(compact);
}

function buildAiEnhancedAnswerHtml(finalText='', question='', retrySourceQuestion=''){
 const parsedDialog = extractAiDialogActions(finalText);
 const downloadPayload = extractAiDownloadPayload(String(parsedDialog.text || '답변을 생성하지 못했습니다.'));
 const text = String(downloadPayload.text || '답변을 생성하지 못했습니다.');
 const cleaned = cleanAiChunkText(text).trim() || '답변을 생성하지 못했습니다.';
 const isAppInstallGuideAnswer = isAiAppInstallGuideQuestion(question, cleaned);
 const isDialogRejectAnswer = isAiDialogRejectAnswer(question, cleaned);
 const isRecentNoticeGuideAnswer = isAiRecentNoticeGuideQuestion(question, cleaned);
 const isNotificationGuideAnswer = isAiNotificationTroubleshootingQuestion(question, cleaned);
 const isNoResultAnswer = isAiNoResultAnswerText(cleaned);
 const aiDownloadButtonsHtml = isNoResultAnswer ? '' : buildAiDownloadButtonsHtml(downloadPayload.downloads);
 const safe = escapeHtml(cleaned).replace(/\n/g, '<br>');
 if(isNoResultAnswer){
 const noResultText = '등록된 안내를 찾지 못했어요.\n다른 표현으로 다시 질문해 주세요.';
 const noResultSafe = escapeHtml(noResultText).replace(/\n/g, '<br>');
 return `
 <div class="ai-answer ai-answer-upgrade ai-answer-no-result" data-ai-no-result="true">
 <div class="ai-answer-summary">${noResultSafe}</div>
 <span class="ai-mode-pill upgraded">등록된 안내를 찾지 못했어요.</span>
 </div>`;
 }
 if(isAiDialogCandidateConfirmAnswer(cleaned, question)){
 return `
 <div class="ai-answer ai-answer-upgrade">
 <div class="ai-answer-summary">${safe}</div>
 ${buildAiTtsControlsHtml('default')}
 ${aiDownloadButtonsHtml}
 ${buildAiDialogActionButtons(parsedDialog.actions)}
 <span class="ai-mode-pill upgraded">확인 후 바로 찾아볼게요.</span>
 </div>`;
 }
 const isApartmentPhone = isApartmentLifePhoneQuestion(question, cleaned);
 const apartmentOnlyPhoneCard = isApartmentPhone ? buildAiApartmentLifePhoneCardHtml(question, cleaned) : '';
 if(isApartmentPhone){
 return `
 <div class="ai-answer ai-answer-upgrade apartment-life-answer">
 <div class="ai-answer-summary">${safe}</div>
 ${buildAiTtsControlsHtml('notice')}
 ${aiDownloadButtonsHtml}
 ${apartmentOnlyPhoneCard}
 <span class="ai-mode-pill upgraded">관리자 생활정보 기준으로 안내했어요.</span>
 </div>`;
 }
 const dialogButtons = (isAppInstallGuideAnswer || isDialogRejectAnswer || isRecentNoticeGuideAnswer || isNotificationGuideAnswer || isNoResultAnswer)
   ? ''
   : buildAiDialogActionButtons(parsedDialog.actions);
 const mappedCards = (isAppInstallGuideAnswer || isDialogRejectAnswer || isRecentNoticeGuideAnswer || isNotificationGuideAnswer || isNoResultAnswer) ? [] : extractAiBenefitCards(cleaned, 4, question);
 const apartmentPhoneCard = buildAiApartmentLifePhoneCardHtml(question, cleaned);
 const matchedPhoneCard = (!isNoResultAnswer && !apartmentPhoneCard && isAiPhoneQuestion(question)) ? buildAiMatchedBenefitPhoneCardHtml(mappedCards, question) : '';
 const phoneCards = isNoResultAnswer ? '' : (apartmentPhoneCard || matchedPhoneCard || (isApartmentLifePhoneQuestion(question) ? '' : buildAiPhoneCardHtml(extractAiPhoneCards(cleaned))));
 const personalSummary = getAiPersonalSummary();
 const locationMapCard = isNoResultAnswer ? '' : buildAiLocationMapCardHtml(mappedCards, question, cleaned);
 const aiAttachmentHtml = (!isNoResultAnswer && shouldShowAiKnowledgeAttachments(question, cleaned)) ? buildAiAttachmentsHtml(getMatchedAiKnowledgeAttachmentsStrict(question, cleaned)) : '';
 const benefitCards = mappedCards.map(({item, score, reason, reasons}) => `
 <div class="ai-benefit-card-auto enhanced">
 <div class="ai-card-top">
 <b>${escapeHtml(item.name || item.storeName || item.title || getMapMarkerLabel(item))}</b>
 <span class="ai-match-score">매칭 ${Math.min(99, Math.round(Number(score || 0) * 7))}%</span>
 </div>
 <span>${escapeHtml(item.benefit || item.description || item.content || '등록된 혜택 정보를 확인해보세요.')}</span>
 <div class="ai-benefit-meta">
 ${item.category ? `<em>${escapeHtml(item.category)}</em>` : ''}
 ${getBenefitDisplayAddress(item) ? `<em>위치 등록</em>` : ''}
 ${pickAiPhone(item) ? `<em>전화 가능</em>` : ''}
 ${getBenefitSocialLinks(item).length ? `<em>SNS/링크 있음</em>` : ''}
 ${reason ? `<em>${escapeHtml(reason)}</em>` : ''}
 ${shouldAttachWeatherTagToItem(item, question, cleaned) ? `<em class="weather">${escapeHtml(shouldAttachWeatherTagToItem(item, question, cleaned))}</em>` : ''}
 </div>
 <div class="ai-personal-reason">추천 기준: ${escapeHtml((reasons || []).join(' · ') || personalSummary)}</div>
 ${buildAiSocialHintHtml(item)}
 <div class="ai-card-actions">
 <button class="primary" type="button" data-ai-open-benefit-id="${escapeAttr(item.id)}">혜택 상세 보기</button>
 <button class="soft" type="button" data-view-link="map">지도에서 보기</button>
 </div>
 ${buildAiRecommendationFeedbackHtml(item)}
 </div>`).join('');
 const hasAiKnowledgeAttachments = /class="ai-attachment-section"/.test(aiAttachmentHtml || '');
 // 혜택/매장/날씨 기반 추천 질문은 답변 문장에 공지/생활 안내 표현이 섞여도 카드가 보여야 합니다.
 // 단, 대형폐기물/생활안내처럼 실제 첨부파일을 보여주는 질문은 혜택 카드를 숨깁니다.
 const isExplicitBenefitCardIntent = isExplicitAiBenefitQuestion(question, '');
 const isMultimodalAnalysisAnswer = /\[첨부파일 분석 결과\]|\[보정 자막\]|\[화자 분리 보정 자막\]|\[핵심 요약\]|자막\/텍스트 다운로드/i.test(cleaned) || !!aiDownloadButtonsHtml;
 const shouldHideBenefitCardsForKnowledge = isApartmentLifeKnowledgeQuestion(question, cleaned) && !isExplicitBenefitCardIntent;
 const shouldShowBenefitCards =
   !isAppInstallGuideAnswer &&
   !isDialogRejectAnswer &&
   !isRecentNoticeGuideAnswer &&
   !isNotificationGuideAnswer &&
   !isNoResultAnswer &&
   !isApartmentLifePhoneQuestion(question, cleaned) &&
   !isMultimodalAnalysisAnswer &&
   !shouldHideBenefitCardsForKnowledge &&
   !hasAiKnowledgeAttachments &&
   !!benefitCards;
 return `
 <div class="ai-answer ai-answer-upgrade">
 <div class="ai-answer-summary">${safe}</div>
 ${buildAiTtsControlsHtml(isMultimodalAnalysisAnswer ? 'file' : (isExplicitBenefitCardIntent ? 'benefit' : 'default'))}
 ${!isAppInstallGuideAnswer && !isRecentNoticeGuideAnswer && !isNotificationGuideAnswer && !isNoResultAnswer && !isApartmentLifePhoneQuestion(question, cleaned) && inferAiWeatherTag(question, cleaned) ? `<div class="ai-weather-chip">${escapeHtml(inferAiWeatherTag(question, cleaned))}</div>` : ''}
 ${phoneCards}
 ${dialogButtons}
 ${locationMapCard}
 ${aiAttachmentHtml}
 ${shouldShowBenefitCards ? `<div class="ai-answer-section"><div class="ai-answer-section-title"><span>자동 매칭된 혜택 카드</span><small>${mappedCards.length}개 추천</small></div>${benefitCards}</div>` : ''}
 ${aiDownloadButtonsHtml}
 <span class="ai-mode-pill upgraded">${isDialogRejectAnswer ? '후보 선택을 취소했어요.' : (isAppInstallGuideAnswer ? '앱 설치 방법을 안내했어요.' : (isNotificationGuideAnswer ? '알림 설정 방법을 안내했어요.' : (isRecentNoticeGuideAnswer ? '최근 공지를 안내했어요.' : (isNoResultAnswer ? '등록된 안내를 찾지 못했어요.' : '상황에 맞는 정보를 준비했어요.'))))}</span>
 </div>`;
 }

 async function callAiStreamServer(question='', { onChunk } = {}){
 const q = String(question || '').trim();
 if(!q) throw new Error('질문이 비어 있습니다.');
 if(!AI_STREAM_SERVER_URL) throw new Error('AI 스트리밍 서버 URL이 설정되지 않았습니다.');

 let idToken = '';
 try{
 idToken = state.currentUser?.getIdToken ? await state.currentUser.getIdToken() : '';
 }catch(error){
 console.warn('AI 스트리밍 ID 토큰 생성 실패:', error);
 }

 const pageContext = typeof buildAiPageContext === 'function' ? buildAiPageContext(q) : {};
 const localCandidates = collectAiLocalCandidates(q, 12);
 const makeStreamBody = () => JSON.stringify({
 question: q,
 message: q,
 env: ENV,
 conversationId: aiConversationId || '',
 pageContext,
 context: pageContext,
 localCandidates
 });
 const response = await fetchWithAiVisibilityRetry(() => fetch(AI_STREAM_SERVER_URL, {
 method: 'POST',
 headers: {
 'Accept': 'text/plain;charset=utf-8',
 'Content-Type': 'application/json',
 ...(idToken ? { 'Authorization': `Bearer ${idToken}` } : {})
 },
 body: makeStreamBody()
 }), { maxAttempts: 2, waitMs: 120000 });
 if(!response.ok){
 const errorText = await response.text().catch(() => '');
 throw new Error(errorText || `AI 스트리밍 서버 호출 실패 (${response.status})`);
 }

 if(!response.body){
 const text = await response.text();
 if(onChunk) onChunk(text || '', text || '');
 return text || '';
 }

 const reader = response.body.getReader();
 const decoder = new TextDecoder('utf-8');
 let result = '';
 while(true){
 const { done, value } = await reader.read();
 if(done) break;
 const chunk = decoder.decode(value, { stream:true });
 if(!chunk) continue;
 result += chunk;
 if(onChunk) onChunk(chunk, result);
 }
 const tail = decoder.decode();
 if(tail){
 result += tail;
 if(onChunk) onChunk(tail, result);
 }
 return result;
 }


 function normalizeAiErrorRetryButtons(scope){
 const chatRoot = qs('#aiChatWindow');
 const root = chatRoot || scope || document;
 if(!root) return;
 try{
   // AI no-result / server-error bubbles should not expose a resend button.
   // Keeping a singleton retry button caused a floating "다시 보내기" button to remain under the AI answer.
   root.querySelectorAll('[data-ai-error-retry], .ai-error-retry-btn').forEach((btn) => btn.remove());
   root.querySelectorAll('.ai-state-action-row, .ai-error-action-row, .ai-actions, .ai-retry-action-row').forEach((row) => {
     if(!row.querySelector('button, a, input, select, textarea')) row.remove();
   });
 }catch(_error){}
}

function scheduleAiRetryButtonNormalize(scope){
 try{
   const target = scope || qs('#aiChatWindow');
   normalizeAiErrorRetryButtons(target);
   requestAnimationFrame(() => normalizeAiErrorRetryButtons(target));
   setTimeout(() => normalizeAiErrorRetryButtons(target), 80);
 }catch(_error){}
 }

 function initAiRetryButtonSingletonObserver(){
 const win = qs('#aiChatWindow');
 if(!win || win.dataset.aiRetrySingletonObserver === 'true') return;
 win.dataset.aiRetrySingletonObserver = 'true';
 let timer = null;
 const run = () => {
   if(timer) clearTimeout(timer);
   timer = setTimeout(() => normalizeAiErrorRetryButtons(win), 20);
 };
 try{
   new MutationObserver(run).observe(win, { childList:true, subtree:true });
 }catch(_error){}
 scheduleAiRetryButtonNormalize(win);
 }

 
function getAiRetryQuestionFromButton(btn){
 const direct = String(btn?.dataset?.aiRetryQuestion || '').trim();
 if(direct) return direct;
 try{
   const row = btn?.closest?.('.ai-message');
   let cur = row?.previousElementSibling || null;
   while(cur){
     if(cur.classList?.contains('ai-message') && cur.classList?.contains('user')){
       const clone = cur.cloneNode(true);
       clone.querySelectorAll('small,button,a,script,style').forEach(el => el.remove());
       const text = String(clone.innerText || clone.textContent || '').replace(/\s+/g, ' ').trim();
       if(text) return text;
     }
     cur = cur.previousElementSibling;
   }
 }catch(_error){}
 return '';
}

function bindAiAnswerActions(scope){
 const root = scope || qs('#aiChatWindow');
 if(!root) return;
 scheduleAiRetryButtonNormalize(qs('#aiChatWindow') || root);
 try{
   const looksLikeNoResultOrServerError = (node) => {
     const text = String(node?.innerText || node?.textContent || '').replace(/\s+/g, '');
     return /등록된안내를찾지못했어요|현재등록된안내에서찾지못했습니다|답변을준비하는중문제가발생했습니다|잠시후다시질문해/.test(text)
       || !!node?.querySelector?.('[data-ai-no-result="true"]');
   };
   const targets = root.matches?.('.ai-bubble,.ai-answer') ? [root] : Array.from(root.querySelectorAll('.ai-bubble,.ai-answer'));
   targets.forEach((node) => {
     if(!looksLikeNoResultOrServerError(node)) return;
     node.querySelectorAll('[data-ai-error-retry], .ai-error-retry-btn').forEach((btn) => {
       if(!btn.closest('.ai-answer-no-result[data-ai-no-result="true"]')) btn.remove();
     });
     node.querySelectorAll('[data-ai-tts-actions], .ai-tts-actions').forEach((el) => el.remove());
   });
   normalizeAiErrorRetryButtons(qs('#aiChatWindow') || root);
 }catch(_error){}
 bindAiDownloadButtons(root);
 ensureAiAnswerFeedback(root);
 root.querySelectorAll('[data-ai-answer-copy]').forEach(btn => {
   if(btn.dataset.aiAnswerCopyBound === 'true') return;
   btn.dataset.aiAnswerCopyBound = 'true';
   btn.addEventListener('click', (event) => {
     event.preventDefault();
     event.stopPropagation();
     handleAiAnswerCopy(btn);
   });
 });
 root.querySelectorAll('[data-ai-answer-share]').forEach(btn => {
   if(btn.dataset.aiAnswerShareBound === 'true') return;
   btn.dataset.aiAnswerShareBound = 'true';
   btn.addEventListener('click', (event) => {
     event.preventDefault();
     event.stopPropagation();
     handleAiAnswerShare(btn);
   });
 });
 root.querySelectorAll('[data-ai-answer-feedback]').forEach(btn => {
 if(btn.dataset.aiAnswerFeedbackBound === 'true') return;
 btn.dataset.aiAnswerFeedbackBound = 'true';
 btn.addEventListener('click', async (event) => {
 event.preventDefault();
 event.stopPropagation();
 const row = btn.closest('.ai-answer-feedback-row');
 const feedback = btn.dataset.aiAnswerFeedback || '';
 const payload = {
   feedback,
   question: getAiFeedbackQuestionFromButton(btn),
   answerText: getAiFeedbackAnswerText(btn)
 };
 const feedbackKey = buildAiAnswerFeedbackKey(payload);
 payload.feedbackKey = feedbackKey;
 const storedFeedback = getAiSubmittedFeedbackValue(feedbackKey);
 if(btn.disabled || btn.dataset.aiFeedbackSubmitted === 'true' || row?.dataset?.aiFeedbackSubmitted === 'true' || storedFeedback){
   const reflectedFeedback = storedFeedback || feedback;
   applyAiFeedbackSubmittedUi(row, findAiFeedbackButtonByValue(row, btn, reflectedFeedback), reflectedFeedback);
   return;
 }
 markAiFeedbackSubmittedOnce(feedbackKey, feedback);
 applyAiFeedbackSubmittedUi(row, btn, feedback);
 const result = await sendAiAnswerFeedback(payload);
 if(!result?.ok && !result?.duplicate){
   unmarkAiFeedbackSubmittedOnce(feedbackKey);
 }
 });
});
 root.querySelectorAll('[data-ai-error-retry]').forEach(btn => {
   if(btn.dataset.aiRetryBound === 'true') return;
   btn.dataset.aiRetryBound = 'true';
   btn.addEventListener('click', (event) => {
     event.preventDefault();
     event.stopPropagation();
     const retryQuestion = getAiRetryQuestionFromButton(btn);
     if(!retryQuestion) return;
     if(guardAiAssistantBusy()) return;
     setAiRetryControlsDisabled(true);
     askAiAssistant(retryQuestion);
   });
 });
 
root.querySelectorAll('[data-ai-rec-feedback]').forEach(btn => {
 if(btn.dataset.aiRecFeedbackBound === 'true') return;
 btn.dataset.aiRecFeedbackBound = 'true';
 btn.addEventListener('click', async (event) => {
 event.preventDefault();
 event.stopPropagation();
 const row = btn.closest('.ai-rec-feedback-row');
 const feedback = btn.dataset.aiRecFeedback || '';
 const card = btn.closest('.ai-auto-card, .ai-benefit-card-auto, .ai-answer-section');
 const benefitId = btn.dataset.aiRecId || card?.dataset?.id || '';
 const benefitName = btn.dataset.aiRecName || card?.dataset?.aiRecName || '';
 const category = btn.dataset.aiRecCategory || card?.dataset?.aiRecCategory || '';
 const payload = {
 action: feedback === 'good' ? 'recommendation_feedback_good' : 'recommendation_feedback_bad',
 feedback,
 targetType:'benefit',
 benefitId,
 targetId: benefitId,
 benefitName,
 category,
 question: (typeof getCurrentAiQuestionText === 'function') ? getCurrentAiQuestionText() : '',
 buttonLabel: btn.getAttribute('aria-label') || btn.textContent || ''
 };
 const feedbackKey = buildAiRecommendationFeedbackKey(payload);
 payload.feedbackKey = feedbackKey;
 payload.feedbackDocId = feedbackKey.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 180);
 const storedFeedback = getAiSubmittedFeedbackValue(feedbackKey);
 if(btn.disabled || btn.dataset.aiFeedbackSubmitted === 'true' || row?.dataset?.aiFeedbackSubmitted === 'true' || storedFeedback){
   const reflectedFeedback = storedFeedback || feedback;
   applyAiFeedbackSubmittedUi(row, findAiFeedbackButtonByValue(row, btn, reflectedFeedback), reflectedFeedback);
   return;
 }
 markAiFeedbackSubmittedOnce(feedbackKey, feedback);
 applyAiFeedbackSubmittedUi(row, btn, feedback);
 await sendAiRecommendationFeedback(payload);
 });
});

root.querySelectorAll('[data-ai-dialog-question]').forEach(btn => {
 if(btn.dataset.aiDialogBound === 'true') return;
 btn.dataset.aiDialogBound = 'true';
 btn.addEventListener('click', (event) => {
 event.preventDefault();
 event.stopPropagation();
 const question = btn.dataset.aiDialogQuestion || btn.textContent || '';
 if(question){
 logPersonalAssistantEvent({
 action:'proactive_button_click',
 question,
 buttonLabel: btn.textContent || '',
 category: btn.dataset.aiLogCategory || btn.textContent || '',
 benefitId: btn.dataset.aiLogBenefitId || '',
 source: btn.dataset.aiLogSource || 'dialog_button'
 });
 if(!guardAiAssistantBusy()) askAiAssistant(question);
 }
 });
 });
 requestAnimationFrame(()=>renderAiLocationMiniMaps(root)); setTimeout(()=>renderAiLocationMiniMaps(root), 300); setTimeout(()=>renderAiLocationMiniMaps(root), 900);
 root.querySelectorAll('[data-ai-open-benefit-id]').forEach(btn => {
 if(btn.dataset.bound === 'true') return;
 btn.dataset.bound = 'true';
 btn.addEventListener('click', async (event) => {
 event.preventDefault();
 event.stopPropagation();
 const benefitId = btn.dataset.aiOpenBenefitId || '';
 const item = (state.benefits || []).find(v => String(v.id) === String(benefitId));
 if(item){
   if(typeof isRecommendableBenefit === 'function' && !isRecommendableBenefit(item)){
     openModalAlert('현재 추천 가능한 혜택이 아닙니다.');
     return;
   }
   openDetail(item);
   return;
 }
 // AI 추천 카드에서는 Firestore 단건 조회를 다시 시도하지 않습니다.
 // 숨김/폐점/종료/비공개 혜택은 보안 규칙상 읽기 자체가 차단될 수 있어
 // getDoc을 호출하면 "Missing or insufficient permissions" 팝업이 발생합니다.
 // 현재 공개 목록(state.benefits)에 없으면 추천 불가로 조용히 안내합니다.
 openModalAlert('현재 추천 가능한 혜택이 아닙니다.');
 return;
 });
 });
 root.querySelectorAll('[data-social-link][data-benefit-id]').forEach(link => {
 if(link.dataset.aiSocialBound === 'true') return;
 link.dataset.aiSocialBound = 'true';
 link.addEventListener('click', () => {
 const benefitId = link.dataset.benefitId || '';
 const item = (state.benefits || []).find(v => String(v.id) === String(benefitId)) || { id: benefitId, name: '' };
 const key = link.dataset.socialLink || 'sns';
 const statField = link.dataset.socialStat || 'snsClickCount';
 increaseStat(item.id, item.name, statField);
 if(!['smartstoreClickCount','bandClickCount'].includes(statField)) increaseStat(item.id, item.name, 'snsClickCount');
 logBenefitEvent(item.id, `${key}_click`);
 });
 });
 root.querySelectorAll('[data-view-link]').forEach(btn => {
 if(btn.dataset.aiViewBound === 'true') return;
 btn.dataset.aiViewBound = 'true';
 btn.addEventListener('click', (event) => {
 event.preventDefault();
 event.stopPropagation();
 const view = btn.dataset.viewLink;
 if(view) changeView(view);
 });
 });
 root.querySelectorAll('[data-ai-tts-play]').forEach(btn => {
 if(btn.dataset.aiTtsBound === 'true') return;
 btn.dataset.aiTtsBound = 'true';
 btn.addEventListener('click', (event) => {
 event.preventDefault();
 event.stopPropagation();
 playAiTtsFromButton(btn);
 });
 });
 root.querySelectorAll('[data-ai-tts-stop]').forEach(btn => {
 if(btn.dataset.aiTtsStopBound === 'true') return;
 btn.dataset.aiTtsStopBound = 'true';
 btn.addEventListener('click', (event) => {
 event.preventDefault();
 event.stopPropagation();
 stopAiTts();
 });
 });
 }

 function renderAiConversationMessages(messages = []){
 resetAiChatWindow({ loadProactive:false });
 const win = qs('#aiChatWindow');
 if(!win) return;
 messages.forEach((msg) => {
 if(!msg || !msg.content) return;
 if(msg.role === 'user') appendAiMessage('user', escapeHtml(msg.content));
 else appendAiMessage('bot', normalizeAiAnswerHtml(msg.answerHtml || escapeHtml(msg.content)));
 });
 win.scrollTop = win.scrollHeight;
 }

 function renderAiConversationList(conversations = []){
 const list = qs('#aiConversationList');
 if(!list) return;
 if(!conversations.length){ list.innerHTML = '<div class="ai-conversation-empty">저장된 이전 대화가 없습니다.</div>'; return; }
 list.innerHTML = conversations.map((c) => {
 const active = c.id && c.id === aiConversationId ? ' active' : '';
 return `<button class="ai-conversation-item${active}" type="button" data-conversation-id="${escapeHtml(c.id)}"><span class="ai-conversation-title">${escapeHtml(c.title || '제목 없는 대화')}</span><span class="ai-conversation-meta">${escapeHtml(c.updatedText || c.createdText || '')} · 메시지 ${Number(c.messageCount || 0)}개</span></button>`;
 }).join('');
 list.querySelectorAll('[data-conversation-id]').forEach(btn => btn.addEventListener('click', () => loadAiConversation(btn.dataset.conversationId)));
 }

 async function loadAiConversationList(){
 if(ENV !== 'dev') return;
 qs('#aiConversationPanel')?.classList.add('show');
 const list = qs('#aiConversationList');
 if(list) list.innerHTML = '<div class="ai-conversation-empty">이전 대화를 불러오는 중입니다.</div>';
 try{ const data = await callAiFunction({ action: 'listConversations' }); renderAiConversationList(data.conversations || []); }
 catch(error){ console.error('AI conversation list failed', error); if(list) list.innerHTML = '<div class="ai-conversation-empty">이전 대화를 불러오지 못했습니다.</div>'; }
 }

 async function loadAiConversation(conversationId){
 if(!conversationId) return;
 const win = qs('#aiChatWindow');
 win?.classList.add('memory-loading');
 try{
 const data = await callAiFunction({ action: 'loadConversation', conversationId });
 aiConversationId = data.conversationId || conversationId;
 aiConversationTitle = data.title || '이전 대화';
 localStorage.setItem(AI_CONVERSATION_KEY, aiConversationId);
 renderAiConversationMessages(data.messages || []);
 
 qs('#aiBottomReco')?.addEventListener('click', () => {
   const view = qs('#aiBottomReco')?.dataset?.viewLink || 'ai';
   trackGnbMenuVisitByView(view);
   qs('#aiBottomReco')?.classList.remove('show');
   changeView(view);
 });
 qs('#aiBottomReco')?.addEventListener('keydown', (event) => {
   if(event.key === 'Enter' || event.key === ' '){
     event.preventDefault();
     qs('#aiBottomReco')?.click();
   }
 });

 updateAiConversationStatus(aiConversationTitle);
 qs('#aiConversationPanel')?.classList.remove('show');
 }catch(error){
 console.error('AI conversation load failed', error);
 await openModalAlert('이전 대화를 불러오지 못했습니다.');
 }finally{
 win?.classList.remove('memory-loading');
 }
 }

 /* ===== AI 음성 질문 UX ===== */
 let aiRecognition = null;
 let aiVoiceListening = false;
 let aiVoiceInitialized = false;

 function getSpeechRecognition(){
 return window.SpeechRecognition || window.webkitSpeechRecognition || null;
 }

 function setAiVoiceStatus(message, active=false){
 const status = qs('#aiVoiceStatus');
 const btn = qs('#aiVoiceBtn');
 if(status) status.textContent = message || '';
 btn?.classList.toggle('listening', !!active);
 if(btn) btn.textContent = active ? '■' : '🎙️';
 }

 function stopAiMicTracks(stream){
 try{ (stream?.getTracks?.() || []).forEach(track => track.stop()); }catch(_error){}
 }

 async function requestAiMicPermission(){
 if(!window.isSecureContext){
 throw new Error('insecure-context');
 }
 if(!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia){
 throw new Error('media-devices-unsupported');
 }
 const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
 stopAiMicTracks(stream);
 return true;
 }

 function createAiRecognition(){
 const VoiceAPI = getSpeechRecognition();
 if(!VoiceAPI) return null;
 const recognition = new VoiceAPI();
 recognition.lang = 'ko-KR';
 recognition.continuous = false;
 recognition.interimResults = true;
 recognition.maxAlternatives = 1;
 recognition.onstart = () => {
 aiVoiceListening = true;
 setAiVoiceStatus('듣고 있습니다. 질문을 말씀해 주세요.', true);
 };
 recognition.onresult = (event) => {
 let transcript = '';
 for(let i = event.resultIndex; i < event.results.length; i += 1){
 transcript += event.results[i][0]?.transcript || '';
 }
 transcript = transcript.trim();
 if(!transcript) return;
 const input = qs('#aiQuestionInput');
 if(input){ input.value = transcript; adjustAiQuestionTextareaHeight(input); }
 setAiVoiceStatus('인식 중: ' + transcript, true);
 const last = event.results[event.results.length - 1];
 if(last?.isFinal){
 window.__AI_LAST_INPUT_MODE = 'voice';
 aiVoiceListening = false;
 setAiVoiceStatus('음성 인식 완료. 질문을 전송합니다.', false);
 setTimeout(() => askAiAssistant(transcript), 180);
 }
 };
 recognition.onerror = (event) => {
 aiVoiceListening = false;
 const errorCode = event?.error || '';
 let msg = '음성 인식 중 오류가 발생했습니다.';
 if(errorCode === 'not-allowed' || errorCode === 'permission-denied') msg = '마이크 권한이 차단되었습니다. 브라우저 주소창의 권한 설정에서 마이크를 허용해 주세요.';
 else if(errorCode === 'no-speech') msg = '음성이 인식되지 않았습니다. 다시 눌러 말씀해 주세요.';
 else if(errorCode === 'audio-capture') msg = '마이크를 찾지 못했습니다. 기기의 마이크 연결을 확인해 주세요.';
 else if(errorCode === 'network') msg = '음성 인식 네트워크 오류가 발생했습니다.';
 setAiVoiceStatus(msg, false);
 };
 recognition.onend = () => {
 if(aiVoiceListening){
 aiVoiceListening = false;
 setAiVoiceStatus('음성 인식이 종료되었습니다.', false);
 }
 };
 return recognition;
 }

 async function startAiVoiceRecognition(){
 if(guardAiAssistantBusy()) return;
 const VoiceAPI = getSpeechRecognition();
 if(!VoiceAPI){
 setAiVoiceStatus('이 브라우저에서는 음성 질문을 지원하지 않습니다.', false);
 return;
 }
 if(aiVoiceListening && aiRecognition){
 try{ aiRecognition.stop(); }catch(_error){}
 aiVoiceListening = false;
 setAiVoiceStatus('음성 인식을 중지했습니다.', false);
 return;
 }
 try{
 setAiVoiceStatus('마이크 권한을 확인하는 중입니다...', false);
 await requestAiMicPermission();
 aiRecognition = createAiRecognition();
 if(!aiRecognition) throw new Error('speech-unsupported');
 window.__AI_LAST_INPUT_MODE = 'voice';
 aiRecognition.start();
 }catch(error){
 console.warn('Voice recognition start failed', error);
 const message = String(error?.message || error?.name || '');
 if(message.includes('insecure-context')) setAiVoiceStatus('HTTPS 환경에서만 마이크 권한 요청이 가능합니다.', false);
 else if(message.includes('media-devices-unsupported')) setAiVoiceStatus('이 브라우저에서는 마이크 권한 요청을 지원하지 않습니다.', false);
 else if(error?.name === 'NotAllowedError' || error?.name === 'PermissionDeniedError') setAiVoiceStatus('마이크 권한이 거부되었습니다. 브라우저 권한 설정에서 마이크를 허용해 주세요.', false);
 else if(error?.name === 'NotFoundError') setAiVoiceStatus('사용 가능한 마이크를 찾지 못했습니다.', false);
 else setAiVoiceStatus('음성 인식을 시작하지 못했습니다. 브라우저 마이크 권한을 확인해 주세요.', false);
 }
 }

 function initAiVoiceInput(){
 const btn = qs('#aiVoiceBtn');
 if(!btn || aiVoiceInitialized) return;
 aiVoiceInitialized = true;
 const VoiceAPI = getSpeechRecognition();
 if(!VoiceAPI){
 btn.disabled = true;
 btn.style.opacity = '.55';
 setAiVoiceStatus('이 브라우저에서는 음성 질문을 지원하지 않습니다. Chrome 계열 브라우저에서 이용해 주세요.');
 return;
 }
 if(!window.isSecureContext){
 btn.disabled = true;
 btn.style.opacity = '.55';
 setAiVoiceStatus('음성 질문은 HTTPS 환경에서만 사용할 수 있습니다.');
 return;
 }
 setAiVoiceStatus('버튼을 누르면 브라우저 마이크 권한 요청이 표시됩니다.');
 btn.addEventListener('click', () => { if(!guardAiAssistantBusy()) startAiVoiceRecognition(); });
 }

 initAiVoiceInput();

 function startNewAiConversation(){
 aiConversationId = '';
 aiConversationTitle = '새 대화';
 localStorage.removeItem(AI_CONVERSATION_KEY);
 resetAiChatWindow();
 updateAiConversationStatus(aiConversationTitle);
 qs('#aiConversationPanel')?.classList.remove('show');
 }

 async function clearCurrentAiConversation(){
 if(aiConversationId){
 try{ await callAiFunction({ action: 'deleteConversation', conversationId: aiConversationId }); }catch(error){ console.warn('AI conversation delete failed', error); }
 }
 startNewAiConversation();
 }

 function buildAiSituationContext(){
 const now = new Date();
 const hour = now.getHours();
 let timeBand = '일반 시간대';
 if(hour >= 5 && hour < 11) timeBand = '아침';
 else if(hour >= 11 && hour < 15) timeBand = '점심';
 else if(hour >= 15 && hour < 18) timeBand = '오후';
 else if(hour >= 18 && hour < 22) timeBand = '저녁';
 else timeBand = '야간';
 return {
 currentView: state.view || '',
 activeCategory: state.category || '',
 benefitSortMode: state.benefitSortMode || '',
 distanceRadius: state.distanceRadius || '',
 platform: navigator.userAgentData?.platform || navigator.platform || '',
 userAgent: navigator.userAgent || '',
 clientTimeText: now.toLocaleString('ko-KR'),
 hour,
 timeBand,
 locationFetchedAt: state.userLocationFetchedAt || 0,
 location: state.userLocation ? { lat: state.userLocation.lat, lng: state.userLocation.lng } : null
 };
 }

 function normalizeAiCardItem(item){
 const distanceKm = Number(item.distanceKm);
 const distanceText = item.distanceText || (
 Number.isFinite(distanceKm)
 ? (distanceKm < 1 ? `약 ${Math.round(distanceKm * 1000)}m` : `약 ${distanceKm.toFixed(distanceKm < 10 ? 1 : 0)}km`)
 : ''
 );

 return {
 id: item.id || item.docId || '',
 name: item.name || item.title || '이름 없음',
 category: item.category || '기타',
 description: item.benefitText || item.description || item.summary || item.answer || '등록된 정보를 확인해보세요.',
 address: getBenefitDisplayAddress(item) || item.roadAddress || '',
 phone: item.phone || item.telephone || '',
 link: item.link || item.url || '',
 sourceType: item.sourceType || '',
 source: item.source || '',
 type: item.type || '',
 tags: item.aiTags || item.tags || [],
 matchRate: item.matchRate || 80,
 distanceKm: Number.isFinite(distanceKm) ? distanceKm : null,
 distanceText,
 walkMinutes: item.walkMinutes || null,
 bikeMinutes: item.bikeMinutes || null,
 carMinutes: item.carMinutes || null,
 lat: item.lat ?? null,
 lng: item.lng ?? null,
 isOpenNow: item.isOpenNow,
 todayOpenText: item.todayOpenText || item.openingStatus?.todayOpenText || '',
 openStatusText: item.openStatusText || item.openingStatus?.openStatusText || '',
 lifeAssistantSummary: item.lifeAssistantSummary || ''
 };
 }

 function buildAiMiniMap(item){
 const lat = Number(item.lat);
 const lng = Number(item.lng);
 if(!Number.isFinite(lat) || !Number.isFinite(lng)){
 return '<div class="ai-mini-map"><div class="ai-mini-map-fallback">좌표 정보가 없어 미니지도를 표시할 수 없습니다.</div></div>';
 }
 const q = encodeURIComponent(item.name || item.address || item.roadAddress || `${lat},${lng}`);
 const src = `https://maps.google.com/maps?q=${lat},${lng}(${q})&z=16&output=embed`;
 return `<div class="ai-mini-map"><iframe title="${escapeHtml(item.name)} 미니지도" loading="lazy" src="${src}"></iframe></div>`;
 }

 function buildNaverMapLink(item){
 const lat = Number(item.lat);
 const lng = Number(item.lng);
 if(Number.isFinite(lat) && Number.isFinite(lng)){
 return `https://map.naver.com/v5/search/${encodeURIComponent(item.name)}?c=${lng},${lat},16,0,0,0,dh`;
 }
 if(item.address || item.roadAddress || item.name){
 return `https://map.naver.com/v5/search/${encodeURIComponent(`${item.name || ''} ${item.address || item.roadAddress || ''}`.trim())}`;
 }
 return item.link || '#';
 }

 function buildAiRecommendationFeedbackHtml(item = {}){
 const id = item.id || item.docId || '';
 const name = item.name || item.title || item.storeName || '';
 const category = item.category || '';
 return `
 <div class="ai-rec-feedback-row icon-only" aria-label="AI 추천 피드백">
 <span class="ai-rec-feedback-label">추천 평가</span>
 <button class="ai-rec-feedback-btn good" type="button" data-ai-rec-feedback="good" data-ai-rec-id="${escapeAttr(id)}" data-ai-rec-name="${escapeAttr(name)}" data-ai-rec-category="${escapeAttr(category)}" aria-label="추천이 잘 맞았어요" title="추천이 잘 맞았어요"><span aria-hidden="true">👍</span></button>
 <button class="ai-rec-feedback-btn bad" type="button" data-ai-rec-feedback="bad" data-ai-rec-id="${escapeAttr(id)}" data-ai-rec-name="${escapeAttr(name)}" data-ai-rec-category="${escapeAttr(category)}" aria-label="추천이 별로예요" title="추천이 별로예요"><span aria-hidden="true">👎</span></button>
 </div>`;
 }

 function renderAiAutoCard(rawItem){
 const item = normalizeAiCardItem(rawItem);
 const isExternal = item.source === 'naver_local' || item.sourceType === 'external_place' || item.type === '외부매장';
 const badges = [isExternal ? '외부 추천' : '입주민 혜택', ...item.tags].filter(Boolean).slice(0, 5);
 const openKnown = typeof item.isOpenNow === 'boolean' || item.openStatusText || item.todayOpenText;
 const openClass = item.isOpenNow === true ? 'open' : (item.isOpenNow === false ? 'closed' : '');
 const openText = item.openStatusText || (item.isOpenNow === true ? '영업 중' : (item.isOpenNow === false ? '영업 전/종료' : '영업시간 확인'));

 const summary = item.lifeAssistantSummary || [
 item.distanceText ? `현재 위치에서 ${item.distanceText} 거리입니다.` : '',
 item.walkMinutes ? `도보 약 ${item.walkMinutes}분, 자전거 약 ${item.bikeMinutes || '-'}분, 자동차 약 ${item.carMinutes || '-'}분 정도 소요됩니다.` : '',
 item.todayOpenText ? `오늘 영업시간은 ${item.todayOpenText}입니다.` : ''
 ].filter(Boolean).join('\n');

 const mapLink = buildNaverMapLink(item);

 return `
 <div class="ai-auto-card ${isExternal ? 'external' : 'internal'}" data-id="${escapeHtml(item.id)}" data-ai-rec-name="${escapeAttr(item.name)}" data-ai-rec-category="${escapeAttr(item.category)}">
 <div class="ai-auto-card-head">
 <div>
 <div class="ai-auto-card-title">${escapeHtml(item.name)}</div>
 <div class="ai-auto-card-sub">${escapeHtml(item.category)}</div>
 </div>
 <div class="ai-match-pill">매칭 ${Number(item.matchRate || 80)}%</div>
 </div>

 <p class="ai-auto-card-desc">${escapeHtml(item.description)}</p>

 <div class="ai-auto-card-status-row">
 ${openKnown ? `<span class="ai-status-pill ${openClass}">${item.isOpenNow === true ? '🟢' : (item.isOpenNow === false ? '🔴' : '')} ${escapeHtml(openText)}</span>` : ''}
 ${item.todayOpenText ? `<span class="ai-status-pill">🕒 ${escapeHtml(item.todayOpenText)}</span>` : ''}
 ${item.distanceText ? `<span class="ai-status-pill">📍 ${escapeHtml(item.distanceText)}</span>` : ''}
 </div>

 ${summary ? `<div class="ai-card-summary">${escapeHtml(summary)}</div>` : ''}

 ${item.walkMinutes ? `<div class="ai-travel-row">
 <div class="ai-travel-chip">자동차<strong>${Number(item.carMinutes || 1)}분</strong></div>
 <div class="ai-travel-chip">자전거<strong>${Number(item.bikeMinutes || 1)}분</strong></div>
 <div class="ai-travel-chip">도보<strong>${Number(item.walkMinutes || 1)}분</strong></div>
 </div>` : ''}

 ${item.address ? `<div class="ai-auto-card-address">📍 ${escapeHtml(item.address)}</div>` : ''}

 ${buildAiMiniMap(item)}

 <div class="ai-auto-tag-row">${badges.map(tag => `<span class="ai-auto-tag">${escapeHtml(tag)}</span>`).join('')}</div>

 <div class="ai-auto-card-actions">
 ${item.phone ? `<a class="ai-card-btn soft" href="tel:${escapeHtml(item.phone)}">전화</a>` : ''}
 <a class="ai-card-btn soft" href="${escapeHtml(mapLink)}" target="_blank" rel="noopener">지도 열기</a>
 ${item.link ? `<a class="ai-card-btn primary" href="${escapeHtml(item.link)}" target="_blank" rel="noopener">정보 보기</a>` : ''}
 </div>
 ${buildAiRecommendationFeedbackHtml(item)}
 </div>`;
 }

 function appendAiRecommendationCardsSafe(data, question=''){
 const mode = String(data?.retrievalMode || '');
 if(isApartmentLifePhoneQuestion(question) || isAiAppInstallGuideQuestion(question, data?.answerText || '') || isAiNotificationTroubleshootingQuestion(question, data?.answerText || '') || isAiRecentNoticeGuideQuestion(question, data?.answerText || '') || mode.includes('direct-apartment-life-phone') || mode.includes('app_install_pwa_guide_direct') || mode.includes('notification_trouble_guide_direct') || mode.includes('recent_notice_direct_quick') || mode.includes('dialog_candidate_rejected')) return;
 if(data?.suppressRelatedItems || data?.suppressFollowupButtons || data?.analysisStatus === 'no_analyzable_files') return;
 if(data && Array.isArray(data.recommendations) && data.recommendations.length) appendAiRecommendationCards(data.recommendations);
 }

 function appendAiRecommendationCards(recommendations = []){
 const win = qs('#aiChatWindow');
 if(!win || !Array.isArray(recommendations) || !recommendations.length) return;
 const row = document.createElement('div');
 row.className = 'ai-message bot';
 const count = recommendations.length;
 row.innerHTML = `<div class="ai-bubble"><div class="ai-auto-card-list-title"><span>자동 매칭 추천 카드</span><small>${count}개 추천</small></div><div class="ai-auto-card-list">${recommendations.slice(0, 6).map(renderAiAutoCard).join('')}</div></div>`;
 win.appendChild(row);
 win.scrollTop = win.scrollHeight;
 }

 /* ===== AI 응답 중 전체 입력 경로 잠금 ===== */
 let aiAssistantBusy = false;
 const AI_QUESTION_PLACEHOLDER = '예: 최근 공지 알려줘, 혜택 매장 추천해줘';

 function setAiControlDisabled(selector, disabled){
 qsa(selector).forEach((el) => {
 if(!el) return;
 el.disabled = !!disabled;
 el.setAttribute('aria-disabled', disabled ? 'true' : 'false');
 el.classList.toggle('ai-locked-control', !!disabled);
 });
 }

 function setAiRetryControlsDisabled(disabled){
 const chatRoot = qs('#aiChatWindow') || document;
 if(!chatRoot) return;
 qsa('[data-ai-error-retry], .ai-error-retry-btn', chatRoot).forEach((el) => {
 if(!el) return;
 el.disabled = !!disabled;
 el.setAttribute('aria-disabled', disabled ? 'true' : 'false');
 el.classList.toggle('ai-locked-control', !!disabled);
 el.classList.toggle('is-disabled', !!disabled);
 });
 }

 function removeAiRetryControls(scope){
 const root = scope || qs('#aiChatWindow') || document;
 if(!root) return;
 try{
 root.querySelectorAll('[data-ai-error-retry], .ai-error-retry-btn').forEach((el) => el.remove());
 root.querySelectorAll('.ai-state-action-row, .ai-error-action-row, .ai-actions, .ai-retry-action-row').forEach((row) => {
 if(!row.querySelector('button, a, input, select, textarea')) row.remove();
 });
 }catch(_error){}
 }

 function setAiAssistantBusy(isBusy){
 aiAssistantBusy = !!isBusy;
 const aiView = qs('#view-ai');
 aiView?.classList.toggle('ai-busy', aiAssistantBusy);

 setAiControlDisabled('#aiQuickRow .ai-quick-btn, [data-ai-dialog-question]', aiAssistantBusy);
 setAiControlDisabled('#aiAskBtn', aiAssistantBusy);
 setAiControlDisabled('#aiVoiceBtn', aiAssistantBusy);
 setAiRetryControlsDisabled(aiAssistantBusy);

 const input = qs('#aiQuestionInput');
 if(input){
 input.disabled = aiAssistantBusy;
 input.setAttribute('aria-disabled', aiAssistantBusy ? 'true' : 'false');
 input.classList.toggle('ai-locked-control', aiAssistantBusy);
 input.placeholder = aiAssistantBusy ? 'AI가 답변을 준비 중입니다...' : AI_QUESTION_PLACEHOLDER;
 }

 const askBtn = qs('#aiAskBtn');
 if(askBtn) askBtn.textContent = aiAssistantBusy ? '작성중' : '질문';

 const busyNote = qs('#aiBusyNote');
 if(busyNote) busyNote.textContent = aiAssistantBusy ? '답변을 준비하는 동안 새 질문은 잠시 멈춰둘게요.' : '';
 }

 function isAiAssistantBusy(){
 return !!aiAssistantBusy;
 }

 function guardAiAssistantBusy(){
 if(!isAiAssistantBusy()) return false;
 try{ openModalAlert('AI가 답변을 준비 중입니다. 잠시만 기다려주세요.'); }catch(_error){}
 return true;
 }

 /* ===== AI 입력 방어: 무의미 문자열 / 특수문자 / 비속어 차단 ===== */
 const AI_INPUT_GUARD_STORAGE_KEY = `myhills_ai_invalid_input_guard_${ENV || 'prod'}`;
 const AI_BAD_WORD_PATTERNS = [
 /시\s*발|씨\s*발|ㅅ\s*ㅂ|ㅆ\s*ㅂ/i,
 /병\s*신|ㅂ\s*ㅅ/i,
 /미친|존나|졸라|좆|ㅈ\s*같/i,
 /개\s*새|개\s*색|꺼져|죽어/i
 ];

 function getAiInvalidInputGuard(){
 try{
 const raw = localStorage.getItem(AI_INPUT_GUARD_STORAGE_KEY);
 const data = raw ? JSON.parse(raw) : {};
 const now = Date.now();
 if(data.lockUntil && Number(data.lockUntil) > now) return data;
 if(data.lockUntil && Number(data.lockUntil) <= now){
 localStorage.removeItem(AI_INPUT_GUARD_STORAGE_KEY);
 return { count:0, lockUntil:0 };
 }
 return { count:Number(data.count || 0), lockUntil:0 };
 }catch(_error){
 return { count:0, lockUntil:0 };
 }
 }

 function saveAiInvalidInputGuard(data={}){
 try{ localStorage.setItem(AI_INPUT_GUARD_STORAGE_KEY, JSON.stringify(data)); }catch(_error){}
 }

 function resetAiInvalidInputGuard(){
 try{ localStorage.removeItem(AI_INPUT_GUARD_STORAGE_KEY); }catch(_error){}
 }

 function registerAiInvalidInput(){
 const guard = getAiInvalidInputGuard();
 const count = Number(guard.count || 0) + 1;
 const next = { count, lockUntil:0, updatedAt:Date.now() };
 if(count >= 10){
 next.lockUntil = Date.now() + (30 * 60 * 1000);
 }
 saveAiInvalidInputGuard(next);
 return next;
 }

 function validateAiUserInput(text=''){
 const value = String(text || '').trim();
 if(!value) return { ok:false, message:'질문을 입력해주세요.' };

 const guard = getAiInvalidInputGuard();
 if(guard.lockUntil && Number(guard.lockUntil) > Date.now()){
 const remainMin = Math.max(1, Math.ceil((Number(guard.lockUntil) - Date.now()) / 60000));
 return { ok:false, locked:true, message:`부적절하거나 의미 없는 입력이 반복되어 AI 질문이 잠시 제한되었습니다. 약 ${remainMin}분 후 다시 이용해주세요.` };
 }

 if(value.length < 2) return { ok:false, message:'질문을 조금 더 자세히 입력해주세요 🙂' };

 const compact = value.replace(/\s+/g, '');
 const normalized = compact.toLowerCase()
 .replace(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?`~·•]/g, '')
 .replace(/[0-9]/g, '');

 if(/^[ㄱ-ㅎㅏ-ㅣ]+$/.test(compact)){
 return { ok:false, message:'자음/모음만 입력된 것 같아요. 정확한 질문으로 입력해주세요 🙂' };
 }

 if(/^[^가-힣a-zA-Z0-9]+$/.test(compact)){
 return { ok:false, message:'의미 있는 질문을 입력해주세요 🙂' };
 }

 if(/(.)\1{4,}/.test(compact)){
 return { ok:false, message:'반복 문자를 줄이고 질문 형태로 입력해주세요 🙂' };
 }

 const chars = Array.from(compact);
 const specialCount = chars.filter(ch => /[^가-힣a-zA-Z0-9ㄱ-ㅎㅏ-ㅣ]/.test(ch)).length;
 if(chars.length >= 4 && specialCount / chars.length > 0.4){
 return { ok:false, message:'특수문자가 너무 많습니다. 질문 형태로 입력해주세요 🙂' };
 }

 const meaningfulCount = chars.filter(ch => /[가-힣a-zA-Z0-9]/.test(ch)).length;
 const jamoCount = chars.filter(ch => /[ㄱ-ㅎㅏ-ㅣ]/.test(ch)).length;
 if(chars.length >= 5 && meaningfulCount / chars.length < 0.45 && jamoCount / chars.length > 0.3){
 return { ok:false, message:'의미를 파악하기 어려운 입력입니다. 다시 질문해주세요 🙂' };
 }

 if(AI_BAD_WORD_PATTERNS.some(pattern => pattern.test(value) || pattern.test(normalized))){
 return { ok:false, message:'부적절한 표현은 사용할 수 없습니다 🙏' };
 }

 return { ok:true, message:'' };
 }

 async function guardAiUserInputOrAlert(question=''){
 const result = validateAiUserInput(question);
 if(result.ok){
 resetAiInvalidInputGuard();
 return true;
 }
 const guard = result.locked ? getAiInvalidInputGuard() : registerAiInvalidInput();
 let message = result.message || '정확한 질문을 입력해주세요 🙂';
 if(!result.locked && guard.count >= 3 && guard.count < 10){
 message += '\n\n의미 없는 입력이 반복되면 AI 이용이 일시 제한될 수 있습니다.';
 }
 if(!result.locked && guard.lockUntil){
 message = '부적절하거나 의미 없는 입력이 반복되어 AI 질문이 30분 동안 제한되었습니다.';
 }
 try{ await openModalAlert(message); }catch(_error){ alert(message); }
 return false;
 }



const AI_MAX_ATTACH_FILES = 5;
const AI_MAX_ATTACH_TOTAL_BYTES = 50 * 1024 * 1024;
let aiSelectedFiles = [];

function getAiAnalyzeFilesUrl(){
 if(!AI_STREAM_SERVER_BASE_URL) return '';
 return `${AI_STREAM_SERVER_BASE_URL}/api/ai/analyze-files`;
}

function getAiAnalyzeFilesStartUrl(){
 if(!AI_STREAM_SERVER_BASE_URL) return '';
 return `${AI_STREAM_SERVER_BASE_URL}/api/ai/analyze-files/start`;
}

function getAiAnalyzeJobStatusUrl(jobId=''){
 if(!AI_STREAM_SERVER_BASE_URL || !jobId) return '';
 return `${AI_STREAM_SERVER_BASE_URL}/api/ai/analyze-files/jobs/${encodeURIComponent(jobId)}`;
}

function sleepAi(ms=1000){
 return new Promise(resolve => setTimeout(resolve, Math.max(0, Number(ms || 0))));
}


let aiPageHiddenAt = 0;
let aiPageWasHiddenDuringRequest = false;
try{
 document.addEventListener('visibilitychange', () => {
   if(document.hidden){
     aiPageHiddenAt = Date.now();
     aiPageWasHiddenDuringRequest = true;
   }
 });
 window.addEventListener('pagehide', () => {
   aiPageHiddenAt = Date.now();
   aiPageWasHiddenDuringRequest = true;
 });
 window.addEventListener('pageshow', () => {
   // 복귀 직후 네트워크가 바로 살아나지 않는 모바일 브라우저가 있어 잠깐 여유를 둡니다.
   setTimeout(() => { aiPageWasHiddenDuringRequest = false; }, 3500);
 });
}catch(_error){}

function isAiLikelyBackgroundInterruption(error){
 const msg = String(error?.message || error || '').toLowerCase();
 const recentlyHidden = aiPageHiddenAt && (Date.now() - aiPageHiddenAt < 180000);
 return !!(document.hidden || aiPageWasHiddenDuringRequest || recentlyHidden || /abort|network|failed to fetch|load failed|cancelled|canceled|interrupted/.test(msg));
}

function waitForAiPageVisible(timeoutMs = 120000){
 return new Promise((resolve, reject) => {
   if(!document.hidden) return resolve();
   const started = Date.now();
   const timer = setInterval(() => {
     if(!document.hidden){
       clearInterval(timer);
       setTimeout(resolve, 450);
     }else if(Date.now() - started > timeoutMs){
       clearInterval(timer);
       reject(new Error('페이지 복귀 대기 시간이 초과되었습니다.'));
     }
   }, 500);
 });
}

async function fetchWithAiVisibilityRetry(makeFetch, options = {}){
 const maxAttempts = Math.max(1, Number(options.maxAttempts || 2));
 let lastError = null;
 for(let attempt = 1; attempt <= maxAttempts; attempt += 1){
   try{
     if(document.hidden) await waitForAiPageVisible(options.waitMs || 120000);
     return await makeFetch(attempt);
   }catch(error){
     lastError = error;
     if(attempt >= maxAttempts || !isAiLikelyBackgroundInterruption(error)) throw error;
     try{ await waitForAiPageVisible(options.waitMs || 120000); }catch(_waitError){ throw error; }
   }
 }
 throw lastError || new Error('AI 요청에 실패했습니다.');
}

function formatAiFileSize(bytes=0){
 const n = Number(bytes || 0);
 if(n >= 1024 * 1024) return `${(n / (1024 * 1024)).toFixed(n >= 10 * 1024 * 1024 ? 0 : 1)}MB`;
 if(n >= 1024) return `${Math.round(n / 1024)}KB`;
 return `${n}B`;
}

function getAiFileIcon(file={}){
 const type = String(file.type || '').toLowerCase();
 const name = String(file.name || '').toLowerCase();
 let icon = 'file-attach.svg';
 if(type.startsWith('image/')) icon = 'file-image.svg';
 else if(type.startsWith('video/')) icon = 'file-video.svg';
 else if(type.startsWith('audio/') || /\.(m4a|mp3|wav|aac|ogg|flac)$/i.test(name)) icon = 'file-audio.svg';
 else if(type.includes('pdf') || name.endsWith('.pdf')) icon = 'file-pdf.svg';
 else if(name.endsWith('.doc') || name.endsWith('.docx')) icon = 'file-doc.svg';
 else if(name.endsWith('.xls') || name.endsWith('.xlsx')) icon = 'file-sheet.svg';
 else if(name.endsWith('.ppt') || name.endsWith('.pptx')) icon = 'file-ppt.svg';
 else if(name.endsWith('.txt')) icon = 'file-text.svg';
 return `<img class="ai-attach-icon-img" src="/icons/internal/${icon}" alt="" loading="lazy" decoding="async">`;
}

function setAiAttachStatus(message='', type='info'){
 const el = qs('#aiAttachStatus');
 if(!el) return;
 el.textContent = message || '';
 el.classList.toggle('show', !!message);
 el.style.background = type === 'error' ? '#fff1f2' : '#eff6ff';
 el.style.borderColor = type === 'error' ? '#fecdd3' : '#bfdbfe';
 el.style.color = type === 'error' ? '#b91c1c' : '#1d4ed8';
}

function getAiAttachSourceLabel(source=''){
 const value = String(source || '').toLowerCase();
 if(value === 'dragdrop') return '드래그 앤 드롭';
 if(value === 'picker') return '첨부 파일 버튼';
 if(value === 'clipboard') return '클립보드 이미지';
 return '첨부';
}

function markAiAttachSource(file, source='picker'){
 try{
   Object.defineProperty(file, '__aiAttachSource', {
     value: source || 'picker',
     writable: true,
     configurable: true
   });
 }catch(_error){
   try{ file.__aiAttachSource = source || 'picker'; }catch(_e){}
 }
 return file;
}

function buildAiAttachStatusMessage(){
 if(!aiSelectedFiles.length) return '';
 const counts = aiSelectedFiles.reduce((acc, file) => {
   const source = String(file?.__aiAttachSource || 'picker').toLowerCase();
   acc[source] = (acc[source] || 0) + 1;
   return acc;
 }, {});
 const parts = [];
 if(counts.dragdrop) parts.push(`드래그 앤 드롭으로 ${counts.dragdrop}개 파일을`);
 if(counts.picker) parts.push(`첨부 파일 버튼으로 ${counts.picker}개 파일을`);
 if(counts.clipboard) parts.push(`클립보드 이미지 ${counts.clipboard}개를`);
 Object.keys(counts).forEach((key) => {
   if(['dragdrop','picker','clipboard'].includes(key)) return;
   if(counts[key]) parts.push(`${getAiAttachSourceLabel(key)}로 ${counts[key]}개 파일을`);
 });
 return parts.length ? `${parts.join(', ')} 첨부했습니다.` : `첨부 ${aiSelectedFiles.length}개 파일을 첨부했습니다.`;
}

function updateAiAttachButtonState(){
 const btn = qs('#aiAttachBtn');
 const row = qs('#aiComposerRow');
 const count = aiSelectedFiles.length;
 if(row) row.classList.toggle('has-ai-files', count > 0);
 if(!btn) return;
 btn.classList.toggle('has-ai-files', count > 0);
 if(count > 0){
   btn.dataset.originalLabel = btn.dataset.originalLabel || btn.getAttribute('aria-label') || '사진, 파일, 영상 첨부';
   btn.innerHTML = `<span class="ai-attach-count-label">첨부 ${count}</span>`;
   btn.setAttribute('aria-label', `첨부파일 ${count}개`);
   btn.setAttribute('title', `첨부파일 ${count}개`);
 }else{
   btn.innerHTML = `<img class="upick-svg-icon" src="/icons/internal/attach.svg" alt="" loading="lazy">`;
   btn.setAttribute('aria-label', btn.dataset.originalLabel || '사진, 파일, 영상 첨부');
   btn.setAttribute('title', '사진/파일/영상 첨부');
 }
}

function renderAiSelectedFiles(){
 const panel = qs('#aiAttachPanel');
 const list = qs('#aiAttachList');
 if(panel) panel.classList.toggle('has-files', aiSelectedFiles.length > 0);
 updateAiAttachButtonState();
 if(!list) return;
 if(!aiSelectedFiles.length){
 list.innerHTML = '';
 setAiAttachStatus('', 'info');
 return;
 }
 setAiAttachStatus(buildAiAttachStatusMessage(), 'info');
 list.innerHTML = aiSelectedFiles.map((file, index) => `
 <div class="ai-attach-item">
 <span class="ai-attach-icon">${getAiFileIcon(file)}</span>
 <div style="min-width:0">
 <div class="ai-attach-name">${escapeHtml(file.name || `file-${index + 1}`)}</div>
 <div class="ai-attach-meta">${escapeHtml(file.type || '파일')} · ${formatAiFileSize(file.size)} · ${escapeHtml(getAiAttachSourceLabel(file.__aiAttachSource || 'picker'))}</div>
 </div>
 <button class="ai-attach-remove" type="button" data-ai-remove-file-index="${index}" aria-label="첨부 삭제">×</button>
 </div>`).join('');
 list.querySelectorAll('[data-ai-remove-file-index]').forEach(btn => {
 btn.addEventListener('click', () => {
 const idx = Number(btn.dataset.aiRemoveFileIndex || -1);
 if(idx >= 0) aiSelectedFiles.splice(idx, 1);
 renderAiSelectedFiles();
 });
 });
}

function addAiSelectedFiles(fileList, source='picker'){
 const incoming = Array.from(fileList || []);
 if(!incoming.length) return;
 const merged = [...aiSelectedFiles];
 for(const file of incoming){
 if(merged.length >= AI_MAX_ATTACH_FILES){
 setAiAttachStatus(`첨부파일은 최대 ${AI_MAX_ATTACH_FILES}개까지 가능합니다.`, 'error');
 break;
 }
 const duplicate = merged.some(v => v.name === file.name && v.size === file.size && v.lastModified === file.lastModified);
 if(!duplicate) merged.push(markAiAttachSource(file, source));
 }
 const total = merged.reduce((sum, file) => sum + Number(file.size || 0), 0);
 if(total > AI_MAX_ATTACH_TOTAL_BYTES){
 setAiAttachStatus(`전체 첨부 용량은 ${formatAiFileSize(AI_MAX_ATTACH_TOTAL_BYTES)} 이하로 올려주세요.`, 'error');
 return;
 }
 aiSelectedFiles = merged.slice(0, AI_MAX_ATTACH_FILES);
 renderAiSelectedFiles();
}

function clearAiSelectedFiles(){
 aiSelectedFiles = [];
 const input = qs('#aiFileInput');
 if(input) input.value = '';
 renderAiSelectedFiles();
}

function buildAiDownloadMarkerFromFiles(results=[]){
 const downloads = [];
 (Array.isArray(results) ? results : []).forEach((item, index) => {
   const captionFiles = item?.captionFiles || item?.captions || null;
   if(!captionFiles) return;
   const baseName = String(item.filename || item.fileName || item.name || `audio-${index + 1}`).replace(/\.[^.]+$/, '').slice(0, 80) || `audio-${index + 1}`;
   ['txt','srt','vtt'].forEach((ext) => {
     const content = captionFiles[ext];
     if(!content) return;
     downloads.push({
       label: ext.toUpperCase(),
       filename: `${baseName}.${ext}`,
       mime: ext === 'txt' ? 'text/plain;charset=utf-8' : (ext === 'srt' ? 'application/x-subrip;charset=utf-8' : 'text/vtt;charset=utf-8'),
       content: String(content || '')
     });
   });
 });
 if(!downloads.length) return '';
 try{
   return `\n\n[[AI_DOWNLOADS:${btoa(unescape(encodeURIComponent(JSON.stringify(downloads))))}]]`;
 }catch(_error){
   return '';
 }
}

function extractAiDownloadPayload(text=''){
 const src = String(text || '');
 const match = src.match(/\[\[AI_DOWNLOADS:([A-Za-z0-9+/=]+)\]\]/);
 if(!match) return { text: src, downloads: [] };
 let downloads = [];
 try{
   downloads = JSON.parse(decodeURIComponent(escape(atob(match[1]))));
 }catch(_error){ downloads = []; }
 return { text: src.replace(match[0], '').trim(), downloads: Array.isArray(downloads) ? downloads : [] };
}

function buildAiDownloadButtonsHtml(downloads=[]){
 if(!Array.isArray(downloads) || !downloads.length) return '';
 return `<div class="ai-answer-section ai-download-section"><div class="ai-answer-section-title"><span>자막/텍스트 다운로드</span><small>${downloads.length}개 파일</small></div><div class="ai-download-row">${downloads.map((item, index) => `<button class="ai-card-btn soft ai-download-btn" type="button" data-ai-download-index="${index}" data-ai-download-name="${escapeAttr(item.filename || `caption-${index + 1}.txt`)}" data-ai-download-mime="${escapeAttr(item.mime || 'text/plain;charset=utf-8')}" data-ai-download-content="${escapeAttr(item.content || '')}">${escapeHtml(item.label || '다운로드')}</button>`).join('')}</div></div>`;
}

function bindAiDownloadButtons(scope){
 const root = scope || document;
 root.querySelectorAll('[data-ai-download-index]').forEach((btn) => {
   if(btn.dataset.aiDownloadBound === 'true') return;
   btn.dataset.aiDownloadBound = 'true';
   btn.addEventListener('click', () => {
     try{
       const content = btn.dataset.aiDownloadContent || '';
       const filename = btn.dataset.aiDownloadName || 'caption.txt';
       const mime = btn.dataset.aiDownloadMime || 'text/plain;charset=utf-8';
       const blob = new Blob([content], { type: mime });
       const url = URL.createObjectURL(blob);
       const a = document.createElement('a');
       a.href = url;
       a.download = filename;
       document.body.appendChild(a);
       a.click();
       a.remove();
       setTimeout(() => URL.revokeObjectURL(url), 1000);
     }catch(error){
       console.warn('AI 자막 다운로드 실패', error);
       try{ openModalAlert('다운로드를 준비하는 중 문제가 발생했습니다.'); }catch(_e){}
     }
   });
 });
}

function normalizeAiAnalyzeFilesResponse(rawText=''){
 const raw = String(rawText || '').trim();
 if(!raw) return '첨부파일 분석 결과가 비어 있습니다.';
 try{
 const data = JSON.parse(raw);
 if(typeof data === 'string') return data;
 const answer = data.answerText || data.answer || data.finalAnswer || data.message || data.summary || data.text || '';
 const results = Array.isArray(data.results) ? data.results : (Array.isArray(data.files) ? data.files : []);
 const lines = [];
 if(answer) lines.push(String(answer));
 if(results.length){
 lines.push('');
 lines.push('[첨부파일 분석 결과]');
 results.forEach((item, index) => {
 const fileName = item.fileName || item.filename || item.name || `첨부파일 ${index + 1}`;
 const summary = item.summary || item.text || item.transcript || item.description || item.content || '';
 const subtitle = item.subtitleText || item.captionText || '';
 lines.push(`${index + 1}. ${fileName}`);
 if(summary) lines.push(`- ${summary}`);
 if(subtitle && subtitle !== summary) lines.push(`- 자막/텍스트: ${String(subtitle).slice(0, 1200)}`);
 });
 }
 const downloadMarker = buildAiDownloadMarkerFromFiles(results);
 return (lines.filter(Boolean).join('\n') || raw) + downloadMarker;
 }catch(_error){
 return raw;
 }
}

async function pollAiAnalyzeJob(jobId='', idToken='', options = {}){
 const statusUrl = getAiAnalyzeJobStatusUrl(jobId);
 if(!statusUrl) throw new Error('AI 분석 작업 조회 URL이 설정되지 않았습니다.');
 const timeoutMs = Math.max(60000, Number(options.timeoutMs || 12 * 60 * 1000));
 const startedAt = Date.now();
 let delayMs = 1200;
 while(Date.now() - startedAt < timeoutMs){
   if(document.hidden) await waitForAiPageVisible(timeoutMs);
   const response = await fetchWithAiVisibilityRetry(() => fetch(statusUrl, {
     method:'GET',
     headers:{
       'Accept':'application/json, text/plain;charset=utf-8',
       ...(idToken ? { 'Authorization': `Bearer ${idToken}` } : {})
     },
     cache:'no-store'
   }), { maxAttempts: 2, waitMs: timeoutMs });
   const rawText = await response.text().catch(() => '');
   let data = null;
   try{ data = rawText ? JSON.parse(rawText) : null; }catch(_error){ data = null; }
   if(!response.ok){
     const message = data?.message || rawText || `AI 분석 작업 조회 실패 (${response.status})`;
     throw new Error(message);
   }
   const status = String(data?.status || '').toLowerCase();
   if(status === 'done'){
     return normalizeAiAnalyzeFilesResponse(JSON.stringify(data.result || data));
   }
   if(status === 'error' || status === 'failed'){
     throw new Error(data?.error?.message || data?.message || '첨부파일 분석 중 오류가 발생했습니다.');
   }
   if(status === 'not_found'){
     throw new Error(data?.message || '분석 작업을 찾을 수 없습니다.');
   }
   await sleepAi(delayMs);
   delayMs = Math.min(3500, Math.round(delayMs * 1.15));
 }
 throw new Error('첨부파일 분석 시간이 초과되었습니다. 잠시 후 다시 확인해 주세요.');
}

async function callAiAnalyzeFilesDirect(question='', files=[], idToken='', pageContext={}, localCandidates=[]){
 const q = String(question || '').trim() || '첨부파일 내용을 분석해줘';
 const targetUrl = getAiAnalyzeFilesUrl();
 if(!targetUrl) throw new Error('AI 첨부파일 분석 서버 URL이 설정되지 않았습니다.');
 const makeFormData = () => {
   const formData = new FormData();
   formData.append('message', q);
   formData.append('question', q);
   formData.append('env', ENV || 'prod');
   formData.append('conversationId', aiConversationId || '');
   formData.append('pageContext', JSON.stringify(pageContext || {}));
   formData.append('context', JSON.stringify(pageContext || {}));
   formData.append('localCandidates', JSON.stringify(localCandidates || []));
   files.forEach(file => formData.append('files', file, file.name || 'file'));
   return formData;
 };
 const response = await fetchWithAiVisibilityRetry(() => fetch(targetUrl, {
   method:'POST',
   headers:{
     'Accept':'application/json, text/plain;charset=utf-8',
     ...(idToken ? { 'Authorization': `Bearer ${idToken}` } : {})
   },
   body: makeFormData()
 }), { maxAttempts: 2, waitMs: 180000 });
 const rawText = await response.text().catch(() => '');
 if(!response.ok) throw new Error(rawText || `AI 첨부파일 분석 실패 (${response.status})`);
 return normalizeAiAnalyzeFilesResponse(rawText);
}

async function callAiAnalyzeFiles(question='', files=[]){
 const q = String(question || '').trim() || '첨부파일 내용을 분석해줘';
 const startUrl = getAiAnalyzeFilesStartUrl();
 if(!startUrl) throw new Error('AI 첨부파일 분석 서버 URL이 설정되지 않았습니다.');
 if(!files.length) throw new Error('첨부파일이 없습니다.');
 let idToken = '';
 try{ idToken = state.currentUser?.getIdToken ? await state.currentUser.getIdToken() : ''; }catch(error){ console.warn('AI 첨부 분석 ID 토큰 생성 실패:', error); }
 const pageContext = typeof buildAiPageContext === 'function' ? buildAiPageContext(q) : {};
 const localCandidates = collectAiLocalCandidates(q, 12);
 const makeFormData = () => {
   const formData = new FormData();
   formData.append('message', q);
   formData.append('question', q);
   formData.append('env', ENV || 'prod');
   formData.append('conversationId', aiConversationId || '');
   formData.append('pageContext', JSON.stringify(pageContext));
   formData.append('context', JSON.stringify(pageContext));
   formData.append('localCandidates', JSON.stringify(localCandidates));
   files.forEach(file => formData.append('files', file, file.name || 'file'));
   return formData;
 };
 try{
   const startResponse = await fetchWithAiVisibilityRetry(() => fetch(startUrl, {
     method:'POST',
     headers:{
       'Accept':'application/json, text/plain;charset=utf-8',
       ...(idToken ? { 'Authorization': `Bearer ${idToken}` } : {})
     },
     body: makeFormData()
   }), { maxAttempts: 2, waitMs: 180000 });
   const rawStartText = await startResponse.text().catch(() => '');
   let startData = null;
   try{ startData = rawStartText ? JSON.parse(rawStartText) : null; }catch(_error){ startData = null; }
   if(!startResponse.ok) throw new Error(startData?.message || rawStartText || `AI 첨부파일 분석 작업 시작 실패 (${startResponse.status})`);
   const jobId = startData?.jobId || '';
   if(!jobId){
     // 서버가 아직 Job ID 방식을 지원하지 않는 경우 기존 직접 분석 방식으로 후퇴합니다.
     return normalizeAiAnalyzeFilesResponse(rawStartText);
   }
   return await pollAiAnalyzeJob(jobId, idToken, { timeoutMs: 12 * 60 * 1000 });
 }catch(error){
   // /start 배포 전 환경과 혼재될 수 있어 404/405만 기존 직접 방식으로 후퇴합니다.
   const msg = String(error?.message || error || '');
   if(/404|405|지원하지 않는 경로|not found/i.test(msg)){
     return await callAiAnalyzeFilesDirect(q, files, idToken, pageContext, localCandidates);
   }
   throw error;
 }
}




function adjustAiQuestionTextareaHeight(inputEl, options = {}){
 const el = inputEl || qs('#aiQuestionInput');
 if(!el || String(el.tagName || '').toLowerCase() !== 'textarea') return;
 try{
   const isCompact = window.matchMedia && window.matchMedia('(max-width: 420px)').matches;
   const baseHeight = isCompact ? 36 : 40;
   const maxHeight = isCompact ? 96 : 112;
   const hasValue = String(el.value || '').length > 0;

   // 전송 직후/빈 입력창은 반드시 한 줄 높이로 복귀시킵니다.
   if(!hasValue || options.reset){
     el.rows = 1;
     el.style.setProperty('height', `${baseHeight}px`, 'important');
     el.style.setProperty('min-height', `${baseHeight}px`, 'important');
     el.style.setProperty('overflow-y', 'hidden', 'important');
     return;
   }

   el.style.setProperty('height', `${baseHeight}px`, 'important');
   const nextHeight = Math.min(maxHeight, Math.max(baseHeight, el.scrollHeight || baseHeight));
   el.style.setProperty('height', `${nextHeight}px`, 'important');
   el.style.setProperty('min-height', `${baseHeight}px`, 'important');
   el.style.setProperty('overflow-y', (el.scrollHeight || 0) > maxHeight ? 'auto' : 'hidden', 'important');
 }catch(_error){}
}

function extractClipboardImageFiles(event){
 const items = Array.from(event?.clipboardData?.items || []);
 const files = [];
 items.forEach((item, index) => {
   if(!item || !String(item.type || '').startsWith('image/')) return;
   const blob = item.getAsFile?.();
   if(!blob) return;
   const ext = String(blob.type || 'image/png').split('/')[1] || 'png';
   const safeExt = ext === 'jpeg' ? 'jpg' : ext;
   const name = `clipboard-image-${Date.now()}-${index + 1}.${safeExt}`;
   try{ files.push(new File([blob], name, { type: blob.type || 'image/png', lastModified: Date.now() })); }
   catch(_error){ blob.name = name; files.push(blob); }
 });
 return files;
}

function bindAiQuestionComposer(){
 const input = qs('#aiQuestionInput');
 if(!input || input.dataset.composerBound === 'true') return;
 input.dataset.composerBound = 'true';
 adjustAiQuestionTextareaHeight(input);
 input.addEventListener('input', () => adjustAiQuestionTextareaHeight(input));
 input.addEventListener('paste', (event) => {
   const files = extractClipboardImageFiles(event);
   if(!files.length) return;
   event.preventDefault();
   addAiSelectedFiles(files, 'clipboard');
   requestAnimationFrame(() => input.focus?.());
 });
 input.addEventListener('keydown', (event) => {
   if(event.key !== 'Enter') return;
   if(event.isComposing) return;
   if(event.ctrlKey || event.metaKey){
     event.preventDefault();
     if(!guardAiAssistantBusy()) askAiAssistant();
   }
 });
}

function getAiDroppedFiles(event){
 const dt = event?.dataTransfer;
 if(!dt) return [];
 return Array.from(dt.files || []).filter(Boolean);
}

function isAiFileDragEvent(event){
 const types = Array.from(event?.dataTransfer?.types || []);
 return types.includes('Files');
}

function setAiDragOverState(active){
 qsa('#aiComposerRow, #aiAttachPanel').forEach(el => el?.classList?.toggle('ai-drag-over', !!active));
}

function bindAiDragAndDropUpload(){
 const targets = [qs('#aiComposerRow'), qs('#aiAttachPanel'), qs('#aiChatWindow')].filter(Boolean);
 if(!targets.length || window.__aiDragDropBound === true) return;
 window.__aiDragDropBound = true;
 let dragDepth = 0;
 targets.forEach(target => {
   ['dragenter','dragover'].forEach(type => {
     target.addEventListener(type, (event) => {
       if(!isAiFileDragEvent(event)) return;
       event.preventDefault();
       event.stopPropagation();
       if(type === 'dragenter') dragDepth += 1;
       setAiDragOverState(true);
       try{ event.dataTransfer.dropEffect = 'copy'; }catch(_error){}
     });
   });
   target.addEventListener('dragleave', (event) => {
     if(!isAiFileDragEvent(event)) return;
     event.preventDefault();
     event.stopPropagation();
     dragDepth = Math.max(0, dragDepth - 1);
     if(dragDepth === 0) setAiDragOverState(false);
   });
   target.addEventListener('drop', (event) => {
     if(!isAiFileDragEvent(event)) return;
     event.preventDefault();
     event.stopPropagation();
     dragDepth = 0;
     setAiDragOverState(false);
     const files = getAiDroppedFiles(event);
     if(!files.length) return;
     addAiSelectedFiles(files, 'dragdrop');
     qs('#aiQuestionInput')?.focus?.();
   });
 });
 window.addEventListener('dragend', () => { dragDepth = 0; setAiDragOverState(false); });
 window.addEventListener('drop', () => { dragDepth = 0; setAiDragOverState(false); });
}

function bindAiAttachmentPicker(){
 const btn = qs('#aiAttachBtn');
 const input = qs('#aiFileInput');
 const clearBtn = qs('#aiAttachClearBtn');
 if(btn && input && btn.dataset.bound !== 'true'){
 btn.dataset.bound = 'true';
 btn.addEventListener('click', () => input.click());
 input.addEventListener('change', () => addAiSelectedFiles(input.files, 'picker'));
 }
 if(clearBtn && clearBtn.dataset.bound !== 'true'){
 clearBtn.dataset.bound = 'true';
 clearBtn.addEventListener('click', clearAiSelectedFiles);
 }
 renderAiSelectedFiles();
}

function buildDirectApartmentLifeLocalAnswer(question=''){
 const fallback = getApartmentLifeFallbackContact(question, '');
 if(!fallback) return '';
 const label = fallback.label || '생활정보';
 const phones = Array.isArray(fallback.phones) ? fallback.phones : [];
 if(!phones.length) return '';
 const mainPhone = phones.join(', ');
 const text = `${label} 연락처는 ${mainPhone}입니다.`;
 const cardHtml = buildAiPhoneCardHtml(phones.map(phone => ({
 label: `${label} 전화번호`,
 phone,
 tel: String(phone || '').replace(/[^\d]/g, '')
 })));
 return `
 <div class="ai-answer ai-answer-upgrade apartment-life-answer">
 <div class="ai-answer-summary">${escapeHtml(text).replace(/\n/g, '<br>')}</div>
 ${buildAiTtsControlsHtml('notice')}
 ${cardHtml}
 <span class="ai-mode-pill upgraded">관리자 생활정보 기준으로 안내했어요.</span>
 </div>`;
 }


function scrollAiAnswerIntoView(rowOrBubble, options = {}){
 const target = rowOrBubble?.closest?.('.ai-message') || rowOrBubble;
 const win = qs('#aiChatWindow');
 const behavior = options.instant ? 'auto' : 'smooth';
 try{
   const scrollToQuestionTop = () => {
     if(win && target && win.contains(target)){
       const top = Math.max(0, Number(target.offsetTop || 0) - 10);
       win.scrollTo({ top, behavior });
     }
     const aiView = qs('#view-ai');
     if(target && typeof target.scrollIntoView === 'function'){
       target.scrollIntoView({ behavior, block: 'start', inline: 'nearest' });
     }else if(aiView && typeof aiView.scrollIntoView === 'function'){
       aiView.scrollIntoView({ behavior, block: 'nearest' });
     }
   };
   requestAnimationFrame(scrollToQuestionTop);
   setTimeout(scrollToQuestionTop, options.delay || 80);
   if(options.secondDelay !== false){
     setTimeout(scrollToQuestionTop, options.secondDelay || 360);
   }
 }catch(_error){
   try{
     if(win && target && win.contains(target)) win.scrollTop = Math.max(0, Number(target.offsetTop || 0) - 10);
   }catch(_e){}
 }
}

async function askAiAssistant(rawQuestion=''){
 if(guardAiAssistantBusy()) return;
 removeAiRetryControls(qs('#aiChatWindow'));
 stopAiTts();
 if(!window.__AI_LAST_INPUT_MODE) window.__AI_LAST_INPUT_MODE = rawQuestion ? 'quick' : 'text';
 if(!AI_STREAM_SERVER_URL) return openModalAlert('AI 생활도우미 서버 URL이 아직 설정되지 않았습니다.');
 const input = qs('#aiQuestionInput');
 const btn = qs('#aiAskBtn');
 const hasAttachFiles = aiSelectedFiles.length > 0;
 const rawInputQuestion = String(rawQuestion || input?.value || '').trim();
 const defaultAttachQuestion = hasAttachFiles ? '첨부파일 내용을 분석해줘' : '';
 const followup = resolveAiFollowupQuestion(rawInputQuestion || defaultAttachQuestion);
 const question = followup.effectiveQuestion || defaultAttachQuestion;
 const displayQuestion = followup.originalQuestion || question;
 if(!displayQuestion) return openModalAlert('질문을 입력해주세요.');
 if(!hasAttachFiles && !(await guardAiUserInputOrAlert(displayQuestion))) return;
 if(hasAttachFiles && rawInputQuestion && !(await guardAiUserInputOrAlert(displayQuestion))) return;
 logPersonalAssistantEvent({
 action:'ask',
 question,
 originalQuestion: displayQuestion,
 category: question,
 source: followup.usedConfirmCandidate ? 'confirm_followup' : (window.__AI_LAST_INPUT_MODE || 'text')
 });

 if(input){ input.value = ''; input.rows = 1; adjustAiQuestionTextareaHeight(input, { reset:true }); }
 setAiAssistantBusy(true);
 appendAiMessage('user', escapeHtml(displayQuestion) + (hasAttachFiles ? `<small>첨부 ${aiSelectedFiles.length}개: ${escapeHtml(aiSelectedFiles.map(file => file.name).join(', '))}</small>` : ''));
 const pendingRow = createAiTypingBubble(question);
 const pendingBubble = pendingRow?.querySelector('.ai-bubble');
 const filesForThisQuestion = hasAttachFiles ? [...aiSelectedFiles] : [];
 if(hasAttachFiles) clearAiSelectedFiles();

 const directApartmentLifeHtml = hasAttachFiles ? '' : buildDirectApartmentLifeLocalAnswer(question);
 if(directApartmentLifeHtml){
 if(pendingBubble){
 pendingBubble.innerHTML = directApartmentLifeHtml;
 bindAiAnswerActions(pendingBubble);
 }
 if(pendingRow) delete pendingRow.dataset.pending;
 window.__AI_LAST_INPUT_MODE = 'text';
 aiConversationTitle = question.slice(0,24) || '새 대화';
 updateAiConversationStatus('AI 답변 완료');
 setAiAssistantBusy(false);
 return;
 }

 let aiWaitTimer1 = null;
 let aiWaitTimer2 = null;
 try{
 aiWaitTimer1 = setTimeout(() => setAiThinkingMessage(pendingBubble, '조금만 더 확인하고 있어요.', '필요한 정보를 정리하는 중입니다.'), 4500);
 aiWaitTimer2 = setTimeout(() => setAiThinkingMessage(pendingBubble, '답변이 평소보다 조금 더 걸리고 있어요.', '정확한 안내를 위해 한 번 더 확인하고 있습니다.'), 10000);
 let finalText = '';
 let streamRenderer = null;
 if(filesForThisQuestion.length){
 setAiThinkingMessage(pendingBubble, '첨부파일을 분석하고 있어요.', '여러 파일이나 영상은 조금 더 걸릴 수 있습니다.');
 scrollAiAnswerIntoView(pendingRow || pendingBubble, { delay: 40 });
 finalText = await callAiAnalyzeFiles(question, filesForThisQuestion);
 }else{
 streamRenderer = createAiStreamRenderer(pendingBubble, question);
 await callAiStreamServer(question, {
 onChunk: (chunk) => {
 streamRenderer.push(chunk);
 }
 });
 }

 if(aiWaitTimer1) clearTimeout(aiWaitTimer1);
 if(aiWaitTimer2) clearTimeout(aiWaitTimer2);
 finalText = finalText || (streamRenderer ? streamRenderer.flush() : '') || '답변을 생성하지 못했습니다.';
 rememberAiConfirmCandidate(finalText);
 if(pendingBubble){
 pendingBubble.innerHTML = buildAiEnhancedAnswerHtml(finalText, question, displayQuestion);
 bindAiAnswerActions(pendingBubble);
 scheduleAiRetryButtonNormalize(qs('#aiChatWindow') || pendingBubble);
 scrollAiAnswerIntoView(pendingRow || pendingBubble, { delay: filesForThisQuestion.length ? 120 : 80, secondDelay: filesForThisQuestion.length ? 700 : 420 });
 }
 if(pendingRow) delete pendingRow.dataset.pending;
 window.__AI_LAST_INPUT_MODE = 'text';
 aiConversationTitle = question.slice(0,24) || '새 대화';
 updateAiConversationStatus('AI 답변 완료');
 }catch(error){
 if(aiWaitTimer1) clearTimeout(aiWaitTimer1);
 if(aiWaitTimer2) clearTimeout(aiWaitTimer2);
 console.error('AI Cloud Run 스트리밍 실패', error);
 const fallbackText = '등록된 안내를 찾지 못했어요.\n다른 표현으로 다시 질문해 주세요.';
 if(pendingBubble){
   pendingBubble.innerHTML = buildAiEnhancedAnswerHtml(fallbackText, question, displayQuestion);
   bindAiAnswerActions(pendingBubble);
 } else {
   const fallbackRow = appendAiMessage('bot', buildAiEnhancedAnswerHtml(fallbackText, question, displayQuestion));
   bindAiAnswerActions(fallbackRow || qs('#aiChatWindow'));
 }
 }finally{
 setAiAssistantBusy(false);
 }
 }

 function updateView(){
 const normalizedView = String(state.view || 'home').replace(/^#|^\//,'').trim() || 'home';
 if(state.view !== normalizedView) state.view = normalizedView;
 enforceShareInsightAccess();
 if(state.view==='community') setTimeout(()=>loadCommunityPosts(communityState.category||'전체', true), 40);
 qsa('[id^="view-"]').forEach(v=>v.classList.add('hidden'));
 (qs(`#view-${state.view}`)||qs('#view-home'))?.classList.remove('hidden');
 qsa('.bottom-nav .nav-btn').forEach(btn=>btn.classList.remove('active'));
 const active=qsa('.bottom-nav .nav-btn').find(btn=>{
   const view = String(btn.dataset.view || btn.dataset.viewLink || '').replace(/^#|^\//,'').trim();
   return view === state.view;
 });
 if(active) active.classList.add('active');
 if(typeof updateBottomNavActiveState === 'function') updateBottomNavActiveState();
 const openGnbSheet = qs('#gnbSheet');
 const openGnbOverlay = qs('#gnbOverlay');
 if(openGnbSheet?.classList.contains('show') || openGnbOverlay?.classList.contains('show')){
   if(typeof closeGnb === 'function') closeGnb({ restoreFocus:false });
   else{
     openGnbSheet?.classList.remove('show');
     openGnbOverlay?.classList.remove('show');
   }
 }
}
 const renderAll=()=>{initAiRetryButtonSingletonObserver();createChips();enableHorizontalDragScroll('#chips');enableHorizontalDragScroll('#aiQuickRow');enableHorizontalDragScroll('#communityCategoryFilter');renderStats();bindFilterIconPopovers();renderHome();setupBenefitFilterFixed();renderFavorites();renderPopularTop5();renderNotices();renderCalendarReservations();updateView();setTimeout(setupBenefitFilterFixed, 80);updateGnbActive();updateDistanceFilterHelp();if(state.view==='map') setTimeout(() => renderMapMode(), 60);if(state.view==='community') setTimeout(()=>loadCommunityPosts(communityState.category||'전체', true), 60);if(state.view==='shareinsights' && isAdminRole()) setTimeout(() => renderShareInsights(), 60);setTimeout(() => handleCleanDeepLink(), 80);};

// 혼잡도는 현재 시각에 따라 계속 변하므로 지도/혜택 상세 표시를 주기적으로 가볍게 갱신합니다.
let __upickCrowdRefreshTimer = null;
function startCrowdDynamicRefresh(){
 if(__upickCrowdRefreshTimer) return;
 __upickCrowdRefreshTimer = setInterval(()=>{
   try{
     if(state.view === 'map') renderMapMode();
     const modal = qs('#detailModal');
     if(modal?.open && state.selectedBenefit) openDetail(state.selectedBenefit);
   }catch(error){ console.warn('혼잡도 동적 갱신 실패', error); }
 }, 5 * 60 * 1000);
}
startCrowdDynamicRefresh();
 qs('#searchInput').addEventListener('input',(e)=>{state.keyword=e.target.value;renderAll();});
 const benefitSearchBox = qs('#view-benefits .filter-sticky .searchbox');
 benefitSearchBox?.addEventListener('click', (event) => {
   if(event.target?.closest?.('#resetBtn')) return;
   qs('#searchInput')?.focus();
 });
 qs('#resetBtn').onclick=()=>{state.category='전체';localStorage.setItem(LAST_CATEGORY_KEY,'전체');state.keyword='';state.filter='all';state.benefitSortMode='default';state.distanceRadius='all';qs('#searchInput').value='';if(qs('#benefitSortSelect'))qs('#benefitSortSelect').value='default';if(qs('#distanceRadiusSelect'))qs('#distanceRadiusSelect').value='all';updateFilterIconLabels();changeView('benefits');};
 qs('#benefitCardModeBtn')?.addEventListener('click', () => setBenefitViewMode('card'));
 qs('#benefitListModeBtn')?.addEventListener('click', () => setBenefitViewMode('list'));
 qs('#benefitSortSelect')?.addEventListener('change', async (e)=>{state.benefitSortMode=e.target.value||'default';await ensureBenefitDistances();renderAll();});
 qs('#distanceRadiusSelect')?.addEventListener('change', async (e)=>{state.distanceRadius=e.target.value||'all';await ensureBenefitDistances();renderAll();});
 qs('#mapUseMyLocationBtn')?.addEventListener('click', centerMapToMyLocation);
 qs('#mapRefreshBtn')?.addEventListener('click', () => renderMapMode({ fitBounds: true }));
 qs('#shareInsightRefreshBtn')?.addEventListener('click', renderShareInsights);
 qs('#enableNearbyAutoPushBtn')?.addEventListener('click', enableNearbyAutoPush);
 qs('#checkNearbyNowBtn')?.addEventListener('click', checkNearbyNow);
 qsa('.bottom-nav .nav-btn').forEach(btn=>{btn.onclick=()=>{if(btn.dataset.view){changeView(btn.dataset.view);}};});
 const gnbToggleBtn = qs('#gnbToggleBtn');
 const gnbSheet = qs('#gnbSheet');
 const gnbOverlay = qs('#gnbOverlay');
 const gnbCloseBtn = qs('#gnbCloseBtn');
 let lastGnbOpener = null;

 function getVisibleGnbOpener(){
 const candidates = [
 lastGnbOpener,
 qs('#globalGnbBtn'),
 qs('#gnbToggleBtn'),
 qs('#gnbOpenBtn'),
 qs('#openGnbBtn'),
 qs('[data-open-gnb]'),
 qs('.gnb-open-btn')
 ];
 return candidates.find((el) => el && el.focus && !el.disabled && el.offsetParent !== null) || null;
 }

 function restoreGnbOpenerFocus(){
 const opener = getVisibleGnbOpener();
 if(!opener) return;
 requestAnimationFrame(() => {
 setTimeout(() => {
 try { opener.focus({ preventScroll:true }); }
 catch(_) { opener.focus(); }
 }, 40);
 });
 }

 function openGnb(opener){
 if(opener && opener.focus) lastGnbOpener = opener;
 else if(document.activeElement && document.activeElement.closest && !gnbSheet?.contains(document.activeElement)) lastGnbOpener = document.activeElement;

 if(gnbSheet){
   gnbSheet.classList.remove('is-closing','upick-motion-closing');
   gnbSheet.classList.add('show');
   gnbSheet.setAttribute('aria-hidden', 'false');
   gnbSheet.classList.remove('gnb-enter');
   requestAnimationFrame(() => gnbSheet?.classList.add('gnb-enter'));
 }
 if(window.UpickMotion && gnbOverlay){
   window.UpickMotion.open(gnbOverlay, { duration:220 });
 }else{
   gnbOverlay?.classList.add('show');
 }
 document.body.style.overflow = 'hidden';
 document.body.classList.add('gnb-open');
 const homeBtn = gnbSheet?.querySelector('.gnb-home-active');
 if(homeBtn){
 homeBtn.animate(
 [{ transform:'translateY(0)', opacity:1 }, { transform:'translateY(-1px)', opacity:1 }],
 { duration:180, easing:'ease-out' }
 );
  requestAnimationFrame(() => {
    setTimeout(() => {
      try { homeBtn.focus({ preventScroll: true }); }
      catch(_) { homeBtn.focus(); }

      // Some entry paths open the GNB after scripted view changes, and Chrome may not
      // paint :focus-visible even though focus is correctly on the first button.
      // Force the visual ring for the initial GNB focus, then remove it when focus moves.
      homeBtn.classList.add('upick-force-focus-ring');
      const clearForcedRing = () => homeBtn.classList.remove('upick-force-focus-ring');
      homeBtn.addEventListener('blur', clearForcedRing, { once:true });
      homeBtn.addEventListener('keydown', function clearOnTab(event){
        if(event.key === 'Tab'){
          clearForcedRing();
          homeBtn.removeEventListener('keydown', clearOnTab);
        }
      });
    }, 90);
  });
  setTimeout(()=>{ loadUserBottomNavSettings?.(); renderUserBottomNavSettings?.(); }, 120);
 }
 }

 function closeGnb(options = {}){
 const closeBtn = gnbCloseBtn;
 if(window.UpickMotion?.isClosing?.(gnbOverlay)) return;
 closeBtn?.animate(
 [{ transform:'scale(1) rotate(0deg)' }, { transform:'scale(.94) rotate(-8deg)' }, { transform:'scale(1) rotate(0deg)' }],
 { duration:180, easing:'ease-out' }
 );
 gnbSheet?.classList.add('is-closing','upick-motion-closing');
 gnbSheet?.classList.remove('show');
 gnbSheet?.setAttribute('aria-hidden', 'true');
 const finishClose = () => {
   gnbSheet?.classList.remove('is-closing','upick-motion-closing','gnb-enter');
   document.body.style.overflow = '';
   document.body.classList.remove('gnb-open');
   gnbSheet?.style.removeProperty('transform');
   if(options.restoreFocus !== false) restoreGnbOpenerFocus();
 };
 if(window.UpickMotion && gnbOverlay){
   window.UpickMotion.close(gnbOverlay, { duration:240, afterClose: finishClose });
 }else{
   gnbOverlay?.classList.remove('show');
   setTimeout(finishClose, 240);
 }
 }

 gnbToggleBtn?.addEventListener('click', (event) => {
 event.stopPropagation();
 const active = document.activeElement;
 const opener = (active && active.id === 'globalGnbBtn') ? active : event.currentTarget;
 openGnb(opener);
 });

 function openGnbToSettings(){
 openGnb(document.activeElement && document.activeElement.focus ? document.activeElement : null);
 requestAnimationFrame(() => {
 const settingsSection = qs('#gnbSettingsAccountSummary');
 settingsSection?.scrollIntoView({ behavior:'smooth', block:'start' });
 });
 }

 qs('#userChip')?.addEventListener('click', (event) => {
 event.preventDefault();
 event.stopPropagation();
 openGnbToSettings();
 });

 qs('#userChip')?.addEventListener('keydown', (event) => {
 if(event.key === 'Enter' || event.key === ' '){
 event.preventDefault();
 openGnbToSettings();
 }
 });

 async function handleLogout(){
 const ok = await openModalConfirm(
 '나가시겠습니까?',
 qs('#gnbLogoutQuickBtn') || qs('#logoutBtnGnb'),
 '나가기',
 '나가기',
 '취소'
 );
 if(!ok) return;

 try{
 await signOut(auth);
 redirectToLogin();
 }catch(error){
 console.error('나가기 실패', error);
 await openModalAlert('나가기 중 오류가 발생했습니다.');
 }
 }

 qs('#gnbLogoutQuickBtn')?.addEventListener('click', (event) => {
 event.preventDefault();
 event.stopPropagation();
 handleLogout();
 });

 qs('#logoutBtnGnb')?.addEventListener('click', (event) => {
 event.preventDefault();
 handleLogout();
 });

 function bindPremiumSectionTitles(){
 const targets = qsa('.section-animate');
 if(!targets.length) return;
 const observer = new IntersectionObserver((entries) => {
 entries.forEach((entry) => {
 if(entry.isIntersecting){
 entry.target.classList.add('is-visible');
 observer.unobserve(entry.target);
 }
 });
 }, { threshold: 0.35 });
 targets.forEach((el) => observer.observe(el));
 }

 function openAdminConsole(){
 if(!isAdminRole()){
 openModalAlert('관리자 페이지는 관리자 계정에서만 열 수 있습니다.');
 return;
 }
 window.location.replace('/admin');
 }

 qs('#openAdminPageFromGnbBtn')?.addEventListener('click', openAdminConsole);
 qs('#rootOpenAdminBtn')?.addEventListener('click', openAdminConsole);
 qs('#rootRefreshStateBtn')?.addEventListener('click', () => {
 if(!isRootRole()){
 openModalAlert('Root 전용 기능입니다.');
 return;
 }
 renderAll();
 openModalAlert('Root 화면 상태를 새로고침했습니다.');
 });

 gnbCloseBtn?.addEventListener('click', closeGnb);
 gnbOverlay?.addEventListener('click', closeGnb);

 let gnbTouchStartX = 0;
 let gnbTouchCurrentX = 0;
 let isDraggingGnb = false;

 gnbSheet?.addEventListener('touchstart', (event) => {
 if(!gnbSheet.classList.contains('show')) return;
 gnbTouchStartX = event.touches[0].clientX;
 gnbTouchCurrentX = gnbTouchStartX;
 isDraggingGnb = true;
 }, { passive:true });

 gnbSheet?.addEventListener('touchmove', (event) => {
 if(!isDraggingGnb) return;
 gnbTouchCurrentX = event.touches[0].clientX;
 const deltaX = Math.max(0, gnbTouchCurrentX - gnbTouchStartX);
 gnbSheet.style.transform = `translateX(${deltaX}px)`;
 }, { passive:true });

 gnbSheet?.addEventListener('touchend', () => {
 if(!isDraggingGnb) return;
 const deltaX = Math.max(0, gnbTouchCurrentX - gnbTouchStartX);
 isDraggingGnb = false;
 if(deltaX > 90){
 closeGnb();
 }else{
 gnbSheet.style.transform = '';
 }
 });

 document.addEventListener('touchstart', (event) => {
 if(gnbSheet?.classList.contains('show')) return;
 const startX = event.touches[0].clientX;
 if(startX > window.innerWidth - 24){
 gnbTouchStartX = startX;
 }else{
 gnbTouchStartX = 0;
 }
 }, { passive:true });

 document.addEventListener('touchend', (event) => {
 if(gnbSheet?.classList.contains('show')) return;
 if(!gnbTouchStartX) return;
 const endX = event.changedTouches[0].clientX;
 const moved = gnbTouchStartX - endX;
 if(moved > 40){
 openGnb(qs('#globalGnbBtn') || qs('#gnbToggleBtn'));
 }
 gnbTouchStartX = 0;
 }, { passive:true });

 window.addEventListener('keydown', (event) => {
 if(event.key === 'Escape' && gnbSheet?.classList.contains('show')){
 closeGnb();
 }
 });

 const gnbHomeBtn = gnbSheet?.querySelector('.gnb-home-active');
 gnbHomeBtn?.addEventListener('click', () => {
 gnbHomeBtn.animate(
 [
 { transform:'scale(1)' },
 { transform:'scale(.94)' },
 { transform:'scale(1.02)' },
 { transform:'scale(1)' }
 ],
 { duration:220, easing:'ease-out' }
 );
 });



 // ===== Dynamic GNB menu DB personalization v1 =====
 const APP_MENUS_COLLECTION = 'app_menus';
 const USER_MENU_HISTORY_COLLECTION = 'user_menu_history';
 const MENU_STATS_COLLECTION = 'menu_stats';
 const BOTTOM_NAV_SETTINGS_COLLECTION = 'app_settings';
 const BOTTOM_NAV_SETTINGS_DOC = 'bottom_nav';

 const UPICK_ICON_PATHS = {
  home:'/icons/internal/home.svg',
  benefits:'/icons/internal/benefit.svg',
  benefit:'/icons/internal/benefit.svg',
  favorite:'/icons/internal/favorite.svg',
  top5:'/icons/internal/top5.svg',
  all:'/icons/internal/all-menu.svg',
  ai:'/icons/internal/ai-assistant.svg',
  calendar:'/icons/internal/calendar.svg',
  map:'/icons/internal/map.svg',
  notices:'/icons/internal/notice.svg',
  notice:'/icons/internal/notice.svg',
  settings:'/icons/internal/settings.svg',
  notification:'/icons/internal/notification.svg',
  push:'/icons/internal/notification.svg',
  homepage:'/icons/internal/homepage.svg',
  blog:'/icons/internal/blog.svg',
  instagram:'/icons/internal/instagram.svg',
  youtube:'/icons/internal/youtube.svg',
  facebook:'/icons/internal/facebook.svg',
  smartstore:'/icons/internal/store.svg',
  band:'/icons/internal/notice.svg',
  phone:'/icons/internal/phone.svg',
  location:'/icons/internal/location-pin.svg',
  starFill:'/icons/internal/star-fill.svg',
  starOutline:'/icons/internal/star-outline.svg'
 };
 function isSafeIconUrl(url=''){
  const value = String(url || '').trim();
  if(!value) return false;
  if(value.startsWith('/icons/') || value.startsWith('/menu-icons/') || value.startsWith('/assets/')) return true;
  if(/^https:\/\/firebasestorage\.googleapis\.com\//.test(value)) return true;
  return false;
 }
 function upickIconHtml(key, alt=''){
  const src = UPICK_ICON_PATHS[key] || UPICK_ICON_PATHS[String(key || '').replace(/^icon:/,'')];
  if(!src) return escapeHtml(alt || '•');
  return `<img class="upick-svg-icon" src="${src}" alt="${escapeHtml(alt || '')}" loading="lazy" decoding="async">`;
 }
 function upickIconUrlHtml(url='', alt=''){
  const src = String(url || '').trim();
  if(!isSafeIconUrl(src)) return '';
  return `<img class="upick-svg-icon" src="${escapeAttr(src)}" alt="${escapeHtml(alt || '')}" loading="lazy" decoding="async">`;
 }
 function normalizeMenuIconKey(menu = {}){
  const rawIcon = String(menu.icon || menu.iconKey || '').trim();
  if(rawIcon.startsWith('icon:')) return rawIcon.replace(/^icon:/,'');
  if(menu.iconKey) return String(menu.iconKey).trim();
  const id = String(menu.menuId || menu.view || menu.route || '').toLowerCase();
  if(id === 'benefits') return 'benefits';
  if(id === 'notices') return 'notices';
  if(id === 'favorite') return 'favorite';
  if(id === 'top5') return 'top5';
  if(id === 'calendar') return 'calendar';
  if(id === 'map') return 'map';
  if(id === 'ai') return 'ai';
  if(id === 'all') return 'all';
  if(id === 'home') return 'home';
  return id;
 }
 function renderMenuIcon(menu = {}, fallback = '•'){
  const alt = menu.bottomLabel || menu.name || fallback;

  // 1) Firestore iconUrl 직접 지정 우선
  if(menu.iconUrl){
    const byUrl = upickIconUrlHtml(menu.iconUrl, alt);
    if(byUrl) return byUrl;
  }

  // 2) iconKey 또는 icon:xxx 구조
  const rawIcon = String(menu.icon || '').trim();
  if(rawIcon.startsWith('icon:') || menu.iconKey){
    return upickIconHtml(normalizeMenuIconKey(menu), alt);
  }

  // 3) Firestore에 아직 이모지가 남아 있어도 menuId/view/route 기준으로 SVG 자동 매핑
  const key = normalizeMenuIconKey(menu);
  if(UPICK_ICON_PATHS[key]){
    return upickIconHtml(key, alt);
  }

  // 4) 매핑이 없는 메뉴도 이모지 대신 기본 SVG 심볼 사용
  return upickIconHtml('all', alt || fallback || '메뉴');
 }

 function menuIconKeyFromAny(menu = {}){
  const rawIcon = String(menu.icon || '').trim();
  if(rawIcon.startsWith('icon:')) return rawIcon.replace(/^icon:/,'');
  const rawId = String(menu.iconKey || menu.menuId || menu.id || menu.view || menu.route || menu.key || '').trim().toLowerCase();
  const aliases = {
    benefit:'benefits',
    benefits:'benefits',
    favorite:'favorite',
    favorites:'favorite',
    notice:'notices',
    notices:'notices',
    announcement:'notices',
    top:'top5',
    top5:'top5',
    ranking:'top5',
    calendar:'calendar',
    map:'map',
    ai:'ai',
    assistant:'ai',
    home:'home',
    all:'all',
    allmenu:'all',
    settings:'settings',
    setting:'settings',
    notification:'notification',
    push:'notification'
  };
  return aliases[rawId] || rawId;
 }

 function renderAnyMenuIcon(menu = {}, fallback = '•'){
  const alt = menu.bottomLabel || menu.name || menu.title || fallback;
  if(menu.iconUrl){
    const byUrl = upickIconUrlHtml(menu.iconUrl, alt);
    if(byUrl) return byUrl.replace('upick-svg-icon', 'upick-svg-icon upick-menu-icon-img');
  }
  const key = menuIconKeyFromAny(menu);
  if(UPICK_ICON_PATHS[key]){
    return `<img class="upick-svg-icon upick-menu-icon-img" src="${UPICK_ICON_PATHS[key]}" alt="${escapeHtml(alt || '')}" loading="lazy" decoding="async">`;
  }
  return `<img class="upick-svg-icon upick-menu-icon-img" src="/icons/internal/all-menu.svg" alt="${escapeHtml(alt || fallback || '메뉴')}" loading="lazy" decoding="async">`;
 }


function renderIconToken(icon='', fallback=''){
  const raw = String(icon || '').trim();
  if(!raw) return escapeHtml(fallback || '');
  if(raw.startsWith('icon:')){
    const key = raw.replace(/^icon:/,'');
    const src = (typeof UPICK_ICON_PATHS !== 'undefined') ? UPICK_ICON_PATHS[key] : '';
    if(src) return `<img class="upick-link-icon" src="${src}" alt="" loading="lazy" decoding="async">`;
    return '';
  }
  // 이모지/문자 아이콘은 UI v3에서 사용하지 않고 기본 메뉴 SVG로 대체
  return `<img class="upick-link-icon" src="/icons/internal/all-menu.svg" alt="" loading="lazy" decoding="async">`;
}


 function renderIconByMenuId(menuId='', fallback='•'){
  return renderAnyMenuIcon({menuId, view:menuId, route:menuId, icon:fallback}, fallback);
 }


 const DEFAULT_GNB_MENUS = [
  {menuId:'home', name:'홈', bottomLabel:'홈', icon:'icon:home', view:'home', sections:['main'], order:10, keywords:['홈','메인','처음']},
  {menuId:'ai', name:'AI 생활 도우미', bottomLabel:'AI', icon:'icon:ai', view:'ai', sections:['new','main'], order:20, keywords:['ai','도우미','질문','생활','챗봇']},
  {menuId:'benefits', name:'혜택 전체보기', bottomLabel:'혜택', icon:'icon:benefits', view:'benefits', sections:['new','main'], order:30, keywords:['혜택','할인','매장','제휴','전체']},
  {menuId:'favorite', name:'즐겨찾기 확인', bottomLabel:'즐겨찾기', icon:'icon:favorite', view:'favorite', sections:['new','main'], order:40, keywords:['즐겨찾기','찜','저장']},
  {menuId:'notices', name:'공지사항 보기', bottomLabel:'공지', icon:'icon:notices', view:'notices', sections:['new','main'], order:50, keywords:['공지','안내','소식']},
  {menuId:'calendar', name:'캘린더 예약', bottomLabel:'캘린더', icon:'icon:calendar', view:'calendar', sections:['new','main'], order:60, keywords:['캘린더','예약','일정','알림','방문']},
  {menuId:'map', name:'지도', bottomLabel:'지도', icon:'icon:map', view:'map', sections:['main'], order:70, keywords:['지도','위치','근처','거리']},
  {menuId:'top5', name:'인기 매장 TOP 5', bottomLabel:'TOP5', icon:'icon:top5', view:'top5', sections:['new','main'], order:80, keywords:['top','top5','인기','랭킹','순위']},
  {menuId:'shareinsights', name:'공유 인사이트', bottomLabel:'공유', icon:'📈', view:'shareinsights', sections:['admin'], order:200, roles:['admin','root'], keywords:['공유','통계','인사이트','관리자']}
 ];
 let gnbMenuCache = [];
 let recentGnbMenuIdSet = new Set();
 let popularGnbMenuIdSet = new Set();
 let popularGnbStatsMap = new Map();

 function getCurrentUserRole(){ return state.currentUserProfile?.role || 'resident'; }
 function canUseGnbMenu(menu){
  if(menu?.isActive === false || menu?.visible === false) return false;
  const role = getCurrentUserRole();
  const roles = Array.isArray(menu?.roles) ? menu.roles : (menu?.role ? [menu.role] : []);
  return !roles.length || roles.includes(role) || (role === 'root');
 }
 function normalizeGnbMenu(raw={}, fallbackId=''){
  const menuId = String(raw.menuId || raw.id || fallbackId || raw.view || raw.route || '').trim();
  const view = String(raw.view || raw.viewLink || raw.route || menuId || 'home').replace(/^#|^\//,'').trim();
  const sections = Array.isArray(raw.sections)
    ? raw.sections.map(v => String(v).trim()).filter(Boolean)
    : String(raw.sections || raw.section || raw.type || 'main').split(',').map(v => v.trim()).filter(Boolean);
  const keywords = Array.isArray(raw.keywords) ? raw.keywords : String(raw.keywords || '').split(',').map(v=>v.trim()).filter(Boolean);
  const badgeTokens=[];
  const collectBadge=(v)=>{ if(!v) return; if(Array.isArray(v)){ v.forEach(collectBadge); return; } if(typeof v === 'object'){ Object.keys(v).forEach(k=>{ if(v[k]) badgeTokens.push(String(k).toLowerCase()); }); return; } String(v).split(/[\s,|/]+/).forEach(x=>{ x=String(x||'').trim().toLowerCase(); if(x) badgeTokens.push(x); }); };
  collectBadge(raw.menuBadges || raw.badges || raw.menuBadge || raw.statusBadge || raw.featureBadge || raw.trendBadge || raw.displayBadge);
  if(raw.badgeHot || raw.menuBadgeHot) badgeTokens.push('hot');
  if(raw.badgeNew || raw.menuBadgeNew) badgeTokens.push('new');
  if(raw.badgeUp || raw.menuBadgeUp) badgeTokens.push('up');
  if(raw.badgeDeprecated || raw.menuBadgeDeprecated || raw.deprecated || raw.willRemove) badgeTokens.push('deprecated');
  const menuBadges=[...new Set(badgeTokens.map(v=>['delete','remove','removed','ending','end','close','closing'].includes(v)?'deprecated':v).filter(v=>['hot','new','up','deprecated'].includes(v)))];
  return { ...raw, menuId, view, route:view, name:raw.name || raw.title || menuId, bottomLabel:raw.bottomLabel || raw.navLabel || raw.shortName || raw.bottomName || '', icon:raw.icon || '•', iconKey:raw.iconKey || '', iconUrl:raw.iconUrl || '', sections, keywords, menuBadges, badgeHot:menuBadges.includes('hot'), badgeNew:menuBadges.includes('new'), badgeUp:menuBadges.includes('up'), badgeDeprecated:menuBadges.includes('deprecated'), order:Number(raw.order ?? 999), isActive: raw.isActive !== false, roles:Array.isArray(raw.roles)?raw.roles:(raw.role?[raw.role]:[]) };
 }
 
 
/* Safe noop for legacy calls */
const syncGnbNavSafe = window.syncGnbNavSafe || function(){ return; };


/* ===== Bottom nav persistent settings cache ===== */
let bottomNavUserMenusCache = null;
let bottomNavAdminMenusCache = null;
let bottomNavAdminMenusConfiguredCache = false;
let bottomNavUseAdminDefaultFillCache = true;
let bottomNavSettingsLoadedOnce = false;

const FALLBACK_BOTTOM_MENUS = ['benefits','favorite','top5'];

 function uniqBottomMenuIds(list=[]){
  const result = [];
  for(const raw of list || []){
    const rawId = (raw && typeof raw === 'object') ? (raw.menuId || raw.view || raw.route || raw.id || raw.key || '') : raw;
    const id = String(rawId || '').replace(/^#|^\//,'').trim();
    if(!id || id === 'home' || id === 'all') continue;
    if(!result.includes(id)) result.push(id);
    if(result.length >= 3) break;
  }
  return result;
 }

 async function loadBottomNavSettings(force=false){
  const uid = auth?.currentUser?.uid || '';
  let userMenus = [];
  let adminMenus = [];
  let adminMenusConfigured = false;
  let useAdminDefaultFill = true;

  // 이미 한 번 읽었고 같은 세션에서 강제 갱신이 아니면 캐시를 우선 사용합니다.
  if(!force && bottomNavSettingsLoadedOnce){
    return {
      userMenus: bottomNavUserMenusCache || [],
      adminMenus: bottomNavAdminMenusCache || [],
      adminMenusConfigured: bottomNavAdminMenusConfiguredCache === true,
      useAdminDefaultFill: bottomNavUseAdminDefaultFillCache !== false
    };
  }

  try{
    if(uid && db){
      const userSnap = await getDoc(doc(db, 'users', uid));
      if(userSnap.exists()){
        userMenus = uniqBottomMenuIds(userSnap.data().bottomNavMenus || []);
      }
    }
  }catch(error){
    console.warn('사용자 하단 네비 설정 로딩 실패', error);
  }

  try{
    if(db){
      const adminSnap = await getDoc(doc(db, BOTTOM_NAV_SETTINGS_COLLECTION, BOTTOM_NAV_SETTINGS_DOC));
      if(adminSnap.exists()){
        const data = adminSnap.data() || {};
        adminMenusConfigured = true;
        adminMenus = uniqBottomMenuIds(data.defaultMenus || data.menus || []);
        useAdminDefaultFill = data.useAdminDefaultFill !== false;
      }
    }
  }catch(error){
    console.warn('관리자 하단 네비 기본값 로딩 실패', error);
  }

  bottomNavUserMenusCache = userMenus;
  bottomNavAdminMenusCache = adminMenus;
  bottomNavAdminMenusConfiguredCache = adminMenusConfigured;
  bottomNavUseAdminDefaultFillCache = useAdminDefaultFill;
  bottomNavSettingsLoadedOnce = true;

  return { userMenus, adminMenus, adminMenusConfigured, useAdminDefaultFill };
 }

 function resolveBottomMenuIds(userMenus=[], adminMenus=[], useAdminDefaultFill=true, adminMenusConfigured=false){
  const result = [];

  for(const id of uniqBottomMenuIds(userMenus)){
    if(!result.includes(id)) result.push(id);
    if(result.length >= 3) return result;
  }

  // 관리자 설정 문서가 있으면 빈 배열도 의도된 설정으로 봅니다.
  // 즉 defaultMenus: [] 이면 fallback으로 자동 채우지 않습니다.
  if(useAdminDefaultFill && adminMenusConfigured){
    for(const id of uniqBottomMenuIds(adminMenus)){
      if(!result.includes(id)) result.push(id);
      if(result.length >= 3) return result;
    }
    return result;
  }

  // 관리자 설정 문서가 아직 없는 최초 상태에서만 코드 기본값 사용
  if(useAdminDefaultFill && !adminMenusConfigured){
    for(const id of FALLBACK_BOTTOM_MENUS){
      if(!result.includes(id)) result.push(id);
      if(result.length >= 3) return result;
    }
  }

  return result;
 }

 function getMenuByIdOrFallback(id){
  const key = String(id || '').replace(/^#|^\//,'').trim();
  if(!key) return null;
  const found = (gnbMenuCache || []).find(m =>
    String(m.menuId || '') === key ||
    String(m.view || '').replace(/^#|^\//,'').trim() === key ||
    String(m.route || '').replace(/^#|^\//,'').trim() === key
  );
  if(found) return found;

  const fallbackMap = {
    home:{menuId:'home',name:'홈',bottomLabel:'홈',icon:'icon:home',view:'home',route:'home',sections:['bottom'],order:0},
    all:{menuId:'all',name:'전체',bottomLabel:'전체',icon:'icon:all',view:'all',route:'all',sections:['bottom'],order:9999},
    benefits:{menuId:'benefits',name:'혜택 전체보기',bottomLabel:'혜택',icon:'icon:benefits',view:'benefits',route:'benefits',sections:['bottom'],order:10},
    favorite:{menuId:'favorite',name:'즐겨찾기 확인',bottomLabel:'즐겨찾기',icon:'icon:favorite',view:'favorite',route:'favorite',sections:['bottom'],order:20},
    top5:{menuId:'top5',name:'인기 매장 TOP 5',bottomLabel:'TOP5',icon:'icon:top5',view:'top5',route:'top5',sections:['bottom'],order:30},
    ai:{menuId:'ai',name:'AI 생활 도우미',bottomLabel:'AI',icon:'icon:ai',view:'ai',route:'ai',sections:['bottom'],order:40},
    calendar:{menuId:'calendar',name:'캘린더 예약',bottomLabel:'캘린더',icon:'icon:calendar',view:'calendar',route:'calendar',sections:['bottom'],order:50},
    map:{menuId:'map',name:'지도',bottomLabel:'지도',icon:'icon:map',view:'map',route:'map',sections:['bottom'],order:60},
    notices:{menuId:'notices',name:'공지사항 보기',bottomLabel:'공지',icon:'icon:notices',view:'notices',route:'notices',sections:['bottom'],order:70},
    shareinsights:{menuId:'shareinsights',name:'공유 인사이트',bottomLabel:'공유',icon:'📈',view:'shareinsights',route:'shareinsights',sections:['bottom'],order:200,roles:['admin','root']}
  };
  return fallbackMap[key] || {menuId:key,name:key,bottomLabel:key,icon:'•',view:key,route:key,sections:['bottom'],order:999};
 }

 function getBottomNavSafeLabel(menu = {}){
  const key = String(menu.view || menu.route || menu.menuId || '').replace(/^#|^\//,'').trim();
  const shortLabelMap = {
    home:'홈', all:'전체', benefits:'혜택', favorite:'즐겨찾기', top5:'TOP5',
    ai:'AI', calendar:'캘린더', map:'지도', notices:'공지', shareinsights:'공유'
  };
  return menu.bottomLabel || menu.navLabel || menu.shortName || shortLabelMap[key] || menu.name || menu.menuId || key;
 }

 function makeBottomNavButton(menu, fixed=false){
  const view = String(menu.view || menu.route || menu.menuId || '').replace(/^#|^\//,'').trim();
  const label = getBottomNavSafeLabel(menu);
  return `<button class="nav-btn${fixed && view === state.view ? ' active' : ''}" data-view-link="${escapeHtml(view)}" type="button">
    <span class="nav-icon">${renderMenuIcon(menu)}</span>
    <span class="nav-label">${escapeHtml(label)}</span>
  </button>`;
 }


 function syncBottomNavSafeOffset(){
  const nav = document.querySelector('.bottom-nav');
  const height = nav ? Math.ceil(nav.getBoundingClientRect().height || nav.offsetHeight || 0) : 0;
  const safeOffset = height ? `${height}px` : '0px';
  document.documentElement.style.setProperty('--bottom-nav-safe-offset', safeOffset);
  document.documentElement.style.setProperty('--bottom-nav-height', safeOffset);
  document.body.style.setProperty('--bottom-nav-safe-offset', safeOffset);
 }
 window.syncBottomNavSafeOffset = window.syncBottomNavSafeOffset || syncBottomNavSafeOffset;
 window.addEventListener('resize', () => window.syncBottomNavSafeOffset?.(), { passive:true });
 window.addEventListener('orientationchange', () => setTimeout(() => window.syncBottomNavSafeOffset?.(), 120), { passive:true });

 async function renderDynamicBottomNav(forceReload=false){
  const nav = document.querySelector('.bottom-nav');
  if(!nav) return;

  const { userMenus, adminMenus, adminMenusConfigured, useAdminDefaultFill } = await loadBottomNavSettings(forceReload);
  const middleIds = resolveBottomMenuIds(userMenus, adminMenus, useAdminDefaultFill, adminMenusConfigured);
  const middleMenus = middleIds.map(getMenuByIdOrFallback).filter(Boolean);
  const menus = [getMenuByIdOrFallback('home'), ...middleMenus, getMenuByIdOrFallback('all')].filter(Boolean);

  nav.innerHTML = menus.map(menu => makeBottomNavButton(menu, true)).join('');
  nav.dataset.count = String(menus.length);
  nav.style.setProperty('--bottom-nav-count', String(menus.length));

  updateBottomNavActiveState?.();
  syncBottomNavTrendBadgesFinal?.();
  syncBottomNavDotBadgesFinal?.();
  syncBottomNavSafeOffset?.();
  scheduleTrendFinalDisplay?.();
 }

 function updateBottomNavActiveState(){
  const current = String(state?.view || 'home').replace(/^#|^\//,'').trim() || 'home';
  qsa('.bottom-nav .nav-btn').forEach(btn => {
    const view = String(btn.dataset.viewLink || btn.dataset.view || '').replace(/^#|^\//,'').trim();
    btn.classList.toggle('active', view === current);
  });
 }

async function loadGnbMenusFromDb(){
  try{
   const snap = await getDocs(collection(db, APP_MENUS_COLLECTION));
   const rows = snap.docs.map(d => normalizeGnbMenu({ id:d.id, ...d.data() }, d.id)).filter(canUseGnbMenu).sort((a,b)=>a.order-b.order);
   gnbMenuCache = rows.length ? rows : DEFAULT_GNB_MENUS.filter(canUseGnbMenu);
  }catch(error){
   console.warn('GNB 메뉴 DB 로딩 실패, 기본 메뉴 사용', error);
   gnbMenuCache = DEFAULT_GNB_MENUS.filter(canUseGnbMenu);
  }
  renderDynamicGnbMenus();
  renderDynamicAllMenus();
  renderDynamicBottomNav?.(true);
  refreshBottomNavMiniTrendBadges(); syncBottomNavTrendBadgesFinal?.();
  syncBottomNavDotBadgesFinal?.();
  await Promise.allSettled([loadRecentGnbMenus(), loadPopularGnbMenus()]);
  renderDynamicAllMenus();
  refreshBottomTrendUi();
 }

 function makeGnbInlineTrendBadges(menu){
  const pieces = [];
  const source = getNewRibbonSource(menu);
  if(source === 'trending') pieces.push('<span class="gnb-inline-badge hot">HOT</span>');
  else if(source) pieces.push('<span class="gnb-inline-badge new">NEW</span>');

  const id = String(menu?.menuId || '');
  if(hasMenuManualBadge(menu, 'up')) pieces.push('<span class="gnb-inline-badge up">UP</span>');
  if(hasMenuManualBadge(menu, 'deprecated')) pieces.push('<span class="gnb-inline-badge deprecated">종료 예정</span>');
  if(popularGnbMenuIdSet.has(id)) pieces.push('<span class="gnb-inline-badge popular">인기</span>');
  if(recentGnbMenuIdSet.has(id)) pieces.push('<span class="gnb-inline-badge recent">최근</span>');

  return pieces.length ? `<span class="gnb-inline-badges">${pieces.join('')}</span>` : '';
 }


 function makeGnbContextBadges(menu, mode=''){
  const pieces = [];
  if(mode === 'popular' && isTrendingMenu(menu)){
    pieces.push('<span class="gnb-context-badge hot">HOT</span>');
  }
  if(mode === 'new' && isMenuNew(menu)){
    pieces.push('<span class="gnb-context-badge new">NEW</span>');
  }
  return pieces.length ? `<span class="gnb-context-badges">${pieces.join('')}</span>` : '';
 }
 function getMenuTrendFlags(menu){
  return {
    isNew: isMenuNew(menu),
    isHot: isTrendingMenu(menu),
    isPopular: popularGnbMenuIdSet.has(String(menu?.menuId || '')),
    isRecent: recentGnbMenuIdSet.has(String(menu?.menuId || ''))
  };
 }

 function formatGnbMenuCount(value){
  const n = Number(value || 0);
  if(!Number.isFinite(n) || n <= 0) return '';
  // 1,000건 이상도 천 단위 기호를 포함해서 항상 하단에 표시합니다.
  return `${n.toLocaleString('ko-KR')}회`;
 }

 function getGnbMenuRankBadge(rank){
  const n = Number(rank || 0);
  if(![1,2,3].includes(n)) return '';
  return `<span class="gnb-rank-badge rank-${n}">${n}위</span>`;
 }

 function getGnbRecentBadge(rank){
  const n = Number(rank || 0);
  return n === 1 ? '<span class="gnb-recent-badge">최신</span>' : '';
 }

 function formatGnbRecentDate(value){
  const d = toMenuDate(value);
  if(!d) return '';
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}.${m}.${day}`;
 }

 function syncGnbPersonalBanner(preferred){
  const banner = qs('#gnbPersonalBanner');
  const textEl = qs('#gnbPersonalBannerText');
  const iconEl = banner?.querySelector('.gnb-banner-icon .upick-svg-icon');
  if(!banner || !textEl) return;
  const setBanner = (text, view, icon) => {
    textEl.textContent = text;
    banner.dataset.viewLink = view || 'all';
    if(iconEl && icon) iconEl.src = icon;
  };
  if(preferred && preferred.type === 'recent' && preferred.menu){
    setBanner('최근 본 메뉴로 바로 이어서 확인해보세요!', preferred.menu.view || preferred.menu.route || preferred.menu.menuId, '/icons/internal/clock.svg');
    return;
  }
  if(preferred && preferred.type === 'popular' && preferred.menu){
    setBanner('요즘 많이 찾는 메뉴를 확인해보세요!', preferred.menu.view || preferred.menu.route || preferred.menu.menuId, '/icons/internal/top5.svg');
    return;
  }
  const day = new Date().getDay();
  if(day === 0 || day === 6){
    setBanner('주말에 많이 찾는 혜택을 확인해보세요!', 'top5', '/icons/internal/benefit.svg');
    return;
  }
  setBanner('입주민 혜택을 한 번에 찾아보세요!', 'all', '/icons/internal/user.svg');
 }

 function makeGnbMenuButton(menu, className='gnb-menu-subitem', countText='', mode=''){
  const rank = Number(menu?.__gnbRank || 0);
  const recentRank = Number(menu?.__gnbRecentRank || 0);
  const rankClass = mode === 'popular' && rank ? ` gnb-popular-rank gnb-popular-rank-${rank}` : '';
  const recentClass = mode === 'recent' && recentRank ? ` gnb-recent-rank gnb-recent-rank-${recentRank}` : '';
  const rankBadge = mode === 'popular' ? getGnbMenuRankBadge(rank) : '';
  const recentBadge = mode === 'recent' ? getGnbRecentBadge(recentRank) : '';
  const metaClass = mode === 'recent' ? 'gnb-menu-date' : 'gnb-menu-count';
  const label = `<span class="gnb-menu-label"><span class="gnb-menu-mainline"><span class="gnb-menu-icon">${renderMenuIcon(menu)}</span><span class="gnb-menu-name">${escapeHtml(menu.name || '')}</span></span>${countText ? `<span class="${metaClass}">${escapeHtml(countText)}</span>` : ''}</span>${rankBadge}${recentBadge}`;
  return `<button class="${className}${rankClass}${recentClass}" type="button" data-gnb-dynamic-menu="${escapeHtml(menu.menuId)}" data-view-link="${escapeHtml(menu.view || menu.route || menu.menuId)}">${label}</button>`;
 }
 function renderDynamicGnbMenus(){
  const newMenus = gnbMenuCache.filter(m => m.sections.includes('new'));
  const mainMenus = gnbMenuCache.filter(m => m.sections.includes('main') || m.sections.includes('gnb'));
  const newEl = qs('#gnbNewMenus');
  const mainEl = qs('#gnbMainMenus');
  if(newEl) newEl.innerHTML = newMenus.length ? newMenus.map(m=>makeGnbMenuButton(m,'gnb-menu-item','', 'new')).join('') : '<div class="gnb-empty">새로운 혜택과 기능이 여기에 표시됩니다.</div>';
  if(mainEl) mainEl.innerHTML = mainMenus.length ? mainMenus.map(m=>makeGnbMenuButton(m,'gnb-menu-subitem')).join('') : '<div class="gnb-empty">표시할 메뉴가 없습니다.</div>';
 }


 function toMenuDate(value){
  if(!value) return null;
  try{
    if(typeof value.toDate === 'function') return value.toDate();
    if(typeof value.seconds === 'number') return new Date(value.seconds * 1000);
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? null : d;
  }catch(_){ return null; }
 }
 function isWithinDays(dateValue, days){
  const d = toMenuDate(dateValue);
  if(!d) return false;
  const diff = Date.now() - d.getTime();
  return diff >= 0 && diff < days * 24 * 60 * 60 * 1000;
 }
 function hasMenuManualBadge(menu, badge){
  const key = String(badge || '').toLowerCase();
  const list = Array.isArray(menu?.menuBadges) ? menu.menuBadges : [];
  if(list.map(v=>String(v).toLowerCase()).includes(key)) return true;
  if(key === 'hot' && (menu?.badgeHot || menu?.menuBadgeHot)) return true;
  if(key === 'new' && (menu?.badgeNew || menu?.menuBadgeNew)) return true;
  if(key === 'up' && (menu?.badgeUp || menu?.menuBadgeUp)) return true;
  if(key === 'deprecated' && (menu?.badgeDeprecated || menu?.menuBadgeDeprecated || menu?.deprecated || menu?.willRemove)) return true;
  return false;
 }
 function isMenuNew(menu){
  if(hasMenuManualBadge(menu, 'new')) return true;
  const sections = Array.isArray(menu?.sections) ? menu.sections : [];
  if(!sections.includes('new')) return false;
  // 관리자에서 createdAt이 없던 기존 메뉴는 updatedAt을 보조 기준으로 사용합니다.
  return isWithinDays(menu.createdAt || menu.created || menu.createdAtText || menu.updatedAt, 7);
 }
 function isTrendingMenu(menu){
  if(hasMenuManualBadge(menu, 'hot')) return true;
  const id = String(menu?.menuId || '');
  const stat = popularGnbStatsMap.get(id);
  if(!stat) return false;
  const total = Number(stat.totalClickCount || stat.clickCount || 0);
  const recent = isWithinDays(stat.lastClickedAt || stat.updatedAt, 1);
  // 최근 24시간 내 클릭되고, 누적 3회 이상이면 급상승 NEW로 봅니다.
  return recent && total >= 3;
 }
 function shouldShowNewRibbon(menu){
  return isMenuNew(menu) || isTrendingMenu(menu);
 }

 function getNewRibbonSource(menu){
  const manual = isMenuNew(menu);
  const trending = isTrendingMenu(menu);
  if(manual && trending) return 'both';
  if(trending) return 'trending';
  if(manual) return 'manual';
  return '';
 }
 function makeNewRibbonHtml(baseClass='all-menu-ribbon', menu){
  const source = getNewRibbonSource(menu);
  if(!source) return '';
  const label = source === 'trending' ? 'HOT' : 'NEW';
  return `<span class="${baseClass} new-source-${source}">${label}</span>`;
 }


 function getAllMenuDescription(menu){
  return menu.description || menu.desc || menu.memo || menu.adminMemo || menu.subtitle || menu.summary || '필요한 기능을 바로 이용할 수 있습니다.';
 }
 function getAllMenuBadge(menu){
  const id = String(menu?.menuId || '');
  if(isFixedNavigationMenuId(id)) return [];
  const badges = [];
  if(hasMenuManualBadge(menu, 'up')) badges.push({ label:'UP', className:'up' });
  if(hasMenuManualBadge(menu, 'deprecated')) badges.push({ label:'종료 예정', className:'deprecated' });
  // 인기와 최근이 같은 메뉴면 [인기][최근] 모두 표시
  if(popularGnbMenuIdSet.has(id)) badges.push({ label:'인기', className:'popular' });
  if(recentGnbMenuIdSet.has(id)) badges.push({ label:'최근', className:'recent' });
  return badges;
 }

 function makeMenuTrendDecor(menu){
  const ribbonHtml = makeNewRibbonHtml('menu-trend-ribbon', menu);
  const badges = getAllMenuBadge(menu);
  const badgeHtml = badges.length
    ? `<span class="menu-trend-badge-wrap">${badges.map(b => `<span class="menu-trend-badge ${b.className}">${b.label}</span>`).join('')}</span>`
    : '';
  return ribbonHtml + badgeHtml;
 }
 function findMenuByView(view){
  const key = String(view || '').replace(/^#|^\//,'').trim();
  return gnbMenuCache.find(m =>
    String(m.view || '').replace(/^#|^\//,'').trim() === key ||
    String(m.route || '').replace(/^#|^\//,'').trim() === key ||
    String(m.menuId || '').trim() === key
  ) || null;
 }

 function getPopularTopMenu(){
  const id = [...popularGnbMenuIdSet].find(v=>!isFixedNavigationMenuId(v));
  return id ? findMenuByView(id) || gnbMenuCache.find(m => String(m.menuId) === String(id)) : null;
 }
 function getRecentTopMenu(){
  const id = [...recentGnbMenuIdSet].find(v=>!isFixedNavigationMenuId(v));
  return id ? findMenuByView(id) || gnbMenuCache.find(m => String(m.menuId) === String(id)) : null;
 }
 function pickAiRecommendedMenu(){
  const popular = getPopularTopMenu();
  const recent = getRecentTopMenu();
  const hour = new Date().getHours();

  // 우선순위: 인기 TOP1 → 최근 메뉴 → 시간대 기반 추천 → AI 메뉴
  if(popular) return { menu: popular, reason: '요즘 가장 많이 쓰는 메뉴예요.' };
  if(recent) return { menu: recent, reason: '방금 보셨던 메뉴를 이어서 볼 수 있어요.' };

  const timeKeywords = hour < 11 ? ['공지','혜택','AI'] : hour < 15 ? ['혜택','지도','AI'] : hour < 20 ? ['캘린더','혜택','지도'] : ['AI','공지','캘린더'];
  for(const key of timeKeywords){
    const found = gnbMenuCache.find(m => canUseGnbMenu(m) && String(m.menuId) !== 'home' && [m.name,m.menuId,m.view,...(m.keywords||[])].join(' ').includes(key));
    if(found) return { menu: found, reason: '지금 시간대에 보기 좋은 메뉴예요.' };
  }
  const fallback = gnbMenuCache.find(m => String(m.view || m.menuId) === 'ai') || gnbMenuCache.find(m => String(m.menuId) !== 'home');
  return fallback ? { menu: fallback, reason: '필요한 정보를 빠르게 찾을 수 있어요.' } : null;
 }
 function refreshBottomNavTopHighlight(){
  const topMenu = getPopularTopMenu();
  qsa('.bottom-nav [data-view-link]').forEach(btn => {
    btn.classList.remove('nav-top1');
    if(!topMenu) return;
    const view = String(btn.dataset.viewLink || '');
    if(view === String(topMenu.view) || view === String(topMenu.route) || view === String(topMenu.menuId)){
      btn.classList.add('nav-top1');
    }
  });
 }

function getAiRecoDailyKey(){
  const uid = auth?.currentUser?.uid || 'guest';
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `aiBottomRecoShown:${uid}:${y}-${m}-${day}`;
 setTimeout(()=>{ loadUserBottomNavSettings?.(); renderUserBottomNavSettings?.(); }, 120);
}
function hasShownAiRecoToday(){
  try{ return localStorage.getItem(getAiRecoDailyKey()) === '1'; }catch(_){ return false; }
}
function markAiRecoShownToday(){
  try{ localStorage.setItem(getAiRecoDailyKey(), '1'); }catch(_){}
}

 function refreshAiBottomRecommendation(){
  const box = qs('#aiBottomReco');
  if(!box) return;

  // AI 추천 토스트는 사용자별 하루 1회만 노출합니다.
  if(hasShownAiRecoToday()){
    box.classList.remove('show');
    return;
  }

  const picked = pickAiRecommendedMenu();
  if(!picked || !picked.menu){
    box.classList.remove('show');
    return;
  }

  const menu = picked.menu;
  box.dataset.viewLink = menu.view || menu.route || menu.menuId;
  box.setAttribute('role','button');
  box.setAttribute('tabindex','0');
  qs('#aiBottomRecoTitle') && (qs('#aiBottomRecoTitle').textContent = `AI 추천 · ${menu.name || menu.menuId}`);
  qs('#aiBottomRecoText') && (qs('#aiBottomRecoText').textContent = picked.reason);
  box.classList.add('show');
  markAiRecoShownToday();
 }

 function forceBottomNavTopPopularBadge(){
  const topMenu = getPopularTopMenu?.();
  if(!topMenu) return;
  const topKeys = [topMenu.view, topMenu.route, topMenu.menuId].map(v => String(v || '').replace(/^#|^\//,'').trim()).filter(Boolean);
  qsa('.bottom-nav [data-view-link]').forEach(btn => {
    const view = String(btn.dataset.viewLink || '').replace(/^#|^\//,'').trim();
    if(!topKeys.includes(view)) return;
    btn.classList.add('nav-top1');
    if(!btn.querySelector('.menu-trend-badge.popular')){
      let wrap = btn.querySelector('.menu-trend-badge-wrap');
      if(!wrap){
        wrap = document.createElement('span');
        wrap.className = 'menu-trend-badge-wrap';
        btn.insertAdjacentElement('afterbegin', wrap);
      }
      const b = document.createElement('span');
      b.className = 'menu-trend-badge popular';
      b.textContent = '인기';
      wrap.appendChild(b);
    }
  });
 }


 function refreshBottomNavMiniTrendBadges(){ window.__upickStableBottomBadge?.(); }

 function refreshBottomTrendUi(){
  refreshStaticNavTrendBadges?.();
  refreshBottomNavTopHighlight();
  refreshAiBottomRecommendation();
  forceBottomNavTopPopularBadge();
  refreshBottomNavMiniTrendBadges(); syncBottomNavTrendBadgesFinal?.();
  syncBottomNavDotBadgesFinal?.();
  refreshCurrentViewTitleTrendBadges();
 }

 function refreshStaticNavTrendBadges(){
  qsa('.bottom-nav [data-view-link]').forEach(btn => {
    btn.querySelectorAll('.menu-trend-ribbon,.menu-trend-badge-wrap').forEach(el => el.remove());
    const menu = findMenuByView(btn.dataset.viewLink);
    if(!menu) return;
    const decor = makeMenuTrendDecor(menu);
    if(decor) btn.insertAdjacentHTML('afterbegin', decor);
  });
 }

 function makeAllMenuCard(menu){
  const badges = getAllMenuBadge(menu);
  const ribbonHtml = makeNewRibbonHtml('all-menu-ribbon', menu);
  const badgeHtml = badges.length
    ? `<span class="all-menu-badge-wrap">${badges.map(b => `<span class="all-menu-badge ${b.className}">${b.label}</span>`).join('')}</span>`
    : '';
  const isAi = String(menu.view || menu.route || menu.menuId) === 'ai' ? ' ai-entry-card' : '';
  return `<button class="all-menu-card${isAi}" type="button" data-gnb-dynamic-menu="${escapeHtml(menu.menuId)}" data-view-link="${escapeHtml(menu.view || menu.route || menu.menuId)}">${ribbonHtml}${badgeHtml}<span class="all-icon">${renderAnyMenuIcon(menu)}</span><strong>${escapeHtml(menu.name || menu.menuId)}</strong><span>${escapeHtml(getAllMenuDescription(menu))}</span></button>`;
 }
 function renderDynamicAllMenus(){
  const el = qs('#allMenuGrid');
  if(!el) return;
  const rows = gnbMenuCache
    .filter(canUseGnbMenu)
    .filter(m => String(m.menuId) !== 'home')
    // 전체 기능은 관리자에서 노출 구역에 "all"을 체크한 메뉴만 표시합니다.
    // 주의: sections에 admin이 함께 있어도 all이 있으면 표시해야 합니다.
    .filter(m => Array.isArray(m.sections) && m.sections.includes('all'))
    .sort((a,b)=>a.order-b.order);
  el.innerHTML = rows.length ? rows.map(makeAllMenuCard).join('') : '<div class="panel empty" style="grid-column:1/-1;">관리자 메뉴에서 전체 기능에 표시할 메뉴를 등록해 주세요.</div>';
 }
 
/* ===== Fixed menu exclusion: home/all are navigation anchors, not trend menus ===== */
function isFixedNavigationMenuId(value){
  const id = String(value || '').replace(/^#|^\//,'').trim();
  return id === 'home' || id === 'all';
}

const gnbVisitLastTrackedAt = new Map();
let gnbMenuRefreshTimer = null;
function scheduleGnbMenuLightRefresh(delay = 900){
  // v109: 메뉴 클릭 직후 통계 재조회가 전체 기능 DOM을 다시 그리며 깜빡임을 만들 수 있어
  // 즉시 재렌더링하지 않고 충분히 지연된 1회 동기화만 수행합니다.
  if(gnbMenuRefreshTimer) return;
  const safeDelay = Math.max(Number(delay || 0), 8000);
  gnbMenuRefreshTimer = setTimeout(() => {
   gnbMenuRefreshTimer = null;
   Promise.allSettled([loadRecentGnbMenus?.(), loadPopularGnbMenus?.()]).finally(() => {
     window.upickFinalBadgeSync?.();
     syncBottomNavDotBadgesFinal?.();
   });
  }, safeDelay);
}
async function trackGnbMenuVisitByView(view){
  if(isFixedNavigationMenuId(view)) return;

  const user = auth?.currentUser; if(!user || !view || !db) return;
  const menu = gnbMenuCache.find(m => String(m.view) === String(view) || String(m.route) === String(view) || String(m.menuId) === String(view)) || normalizeGnbMenu({menuId:view,name:view,view,sections:['main']});
  const now = Date.now();
  const visitKey = `${user.uid}_${menu.menuId}`;
  const lastAt = Number(gnbVisitLastTrackedAt.get(visitKey) || 0);
  if(now - lastAt < 3000){
   scheduleTrendFinalDisplay?.();
   return;
  }
  gnbVisitLastTrackedAt.set(visitKey, now);
  const historyId = `${user.uid}_${menu.menuId}`;
  const payload = { uid:user.uid, userId:user.uid, menuId:menu.menuId, menuName:menu.name, name:menu.name, icon:menu.icon || '', route:menu.route || menu.view, view:menu.view || menu.route, sections:menu.sections || [], keywords:menu.keywords || [], clickCount:increment(1), lastVisitedAt:serverTimestamp(), updatedAt:serverTimestamp() };
  try{
   const hRef = doc(db, USER_MENU_HISTORY_COLLECTION, historyId);
   // 입주민 권한에서는 아직 없는 history 문서를 getDoc()으로 먼저 읽으면 Rules에서 차단될 수 있습니다.
   // 그래서 읽기 없이 merge 저장만 수행합니다.
   await setDoc(hRef, payload, { merge:true });
   await setDoc(doc(db, MENU_STATS_COLLECTION, menu.menuId), { menuId:menu.menuId, menuName:menu.name, name:menu.name, icon:menu.icon || '', route:menu.route || menu.view, view:menu.view || menu.route, sections:menu.sections || [], keywords:menu.keywords || [], totalClickCount:increment(1), lastClickedAt:serverTimestamp(), updatedAt:serverTimestamp() }, { merge:true });
   scheduleGnbMenuLightRefresh(900);
  }catch(error){ console.warn('GNB 메뉴 방문 기록 실패', error); }
 }
 async function loadRecentGnbMenus(){
  const el = qs('#gnbRecentMenus'); const user = auth?.currentUser; if(!el || !user || !db) return;
  try{
   const snap = await getDocs(query(collection(db, USER_MENU_HISTORY_COLLECTION), where('uid','==',user.uid), orderBy('lastVisitedAt','desc'), limit(3)));
   const rows = snap.docs.map(d=>normalizeGnbMenu({ id:d.id, ...d.data() }, d.data().menuId)).filter(canUseGnbMenu).filter(m=>!isFixedNavigationMenuId(m.menuId)).slice(0,3).map((m, index) => ({ ...m, __gnbRecentRank: index + 1, __gnbRecentDateText: formatGnbRecentDate(m.lastVisitedAt || m.updatedAt || m.createdAt) }));
   recentGnbMenuIdSet = new Set(rows.filter(m=>!isFixedNavigationMenuId(m.menuId)).slice(0,1).map(m => String(m.menuId)));
   el.innerHTML = rows.length ? rows.map(m=>makeGnbMenuButton(m,'gnb-chip', m.__gnbRecentDateText || '', 'recent')).join('') : '<div class="gnb-empty">메뉴를 방문하면 가장 최근 메뉴가 표시됩니다.</div>';
   if(rows[0]) syncGnbPersonalBanner({ type:'recent', menu: rows[0] }); else syncGnbPersonalBanner();
   renderDynamicAllMenus();
  }catch(error){ el.innerHTML = '<div class="gnb-empty">최근 메뉴를 불러오려면 Firestore 인덱스를 확인해 주세요.</div>'; renderDynamicAllMenus(); refreshBottomTrendUi(); }
 }
 async function loadPopularGnbMenus(){
  const el = qs('#gnbPopularMenus'); if(!el || !db) return;
  try{
   const snap = await getDocs(query(collection(db, MENU_STATS_COLLECTION), orderBy('totalClickCount','desc'), limit(5)));
   const rows = snap.docs.map(d=>normalizeGnbMenu({ id:d.id, ...d.data() }, d.data().menuId)).filter(canUseGnbMenu).filter(m=>!isFixedNavigationMenuId(m.menuId)).slice(0,3).map((m, index) => ({ ...m, __gnbRank: index + 1 }));
   popularGnbMenuIdSet = new Set(rows.filter(m=>!isFixedNavigationMenuId(m.menuId)).slice(0,1).map(m => String(m.menuId)));
   popularGnbStatsMap = new Map(rows.map(m => [String(m.menuId), m]));
   el.innerHTML = rows.length ? rows.map(m=>makeGnbMenuButton(m,'gnb-chip', formatGnbMenuCount(m.totalClickCount||m.clickCount||0), 'popular')).join('') : '<div class="gnb-empty">방문이 쌓이면 가장 인기 있는 메뉴가 표시됩니다.</div>';
   if(!recentGnbMenuIdSet.size && rows[0]) syncGnbPersonalBanner({ type:'popular', menu: rows[0] });
   renderDynamicAllMenus();
  }catch(error){ el.innerHTML = '<div class="gnb-empty">인기 메뉴를 불러오지 못했습니다.</div>'; renderDynamicAllMenus(); refreshBottomTrendUi(); }
 }
 function renderGnbMenuSearch(keyword=''){
  const box = qs('#gnbMenuSearchResults'); if(!box) return;
  const q = String(keyword || '').trim().toLowerCase();
  if(!q){ box.classList.add('hidden'); box.innerHTML=''; return; }
  const rows = gnbMenuCache.filter(m => [m.name, m.menuId, m.view, ...(m.keywords||[])].join(' ').toLowerCase().includes(q)).slice(0,8);
  box.classList.remove('hidden');
  box.innerHTML = `<div class="gnb-search-result-title">통합검색 결과</div>` + (rows.length ? rows.map(m=>makeGnbMenuButton(m,'gnb-menu-subitem')).join('') : '<div class="gnb-empty">검색 결과가 없습니다.</div>');
 }
 syncGnbPersonalBanner();
 qs('#gnbMenuSearchInput')?.addEventListener('input', (event)=>renderGnbMenuSearch(event.target.value));
 document.addEventListener('click', (event) => {
  const btn = event.target.closest('[data-view-link]');
  if(!btn) return;

  const view = btn.dataset.viewLink;
  const isInGnbSheet = !!btn.closest('#gnbSheet');
  const isInAllMenuGrid = !!btn.closest('#allMenuGrid');
  const isInOperationModal = !!btn.closest('#gnbOperationManageModal');
  const isDynamicMenu = btn.hasAttribute('data-gnb-dynamic-menu');

  // DB에서 렌더링된 GNB/전체기능 메뉴와 클릭 시 동적 생성되는 운영 관리 팝업은
  // 초기 qsa 바인딩 이후 만들어질 수 있으므로 이벤트 위임 방식으로 직접 화면 이동합니다.
  if(view && (isDynamicMenu || isInGnbSheet || isInAllMenuGrid || isInOperationModal)){
    event.preventDefault();
    event.stopPropagation();
    trackGnbMenuVisitByView(view);
    changeView(view);
    if(isInGnbSheet) closeGnb();
    if(isInOperationModal){
      try{
        if(window.CommonModal && typeof window.CommonModal.close === 'function') window.CommonModal.close();
      }catch(_){}
      try{ closeGnb(); }catch(_){}
    }
  }else if(isInGnbSheet || btn.closest('.bottom-nav') || btn.id === 'aiQuickBtn'){
    trackGnbMenuVisitByView(view);
  }
 }, true);
 
/* bottom nav refresh after auth */
try{
  onAuthStateChanged(auth, async (user) => {
    bottomNavSettingsLoadedOnce = false;
    bottomNavUserMenusCache = null;
    if(user){
      setTimeout(()=>renderDynamicBottomNav?.(true), 250);
      setTimeout(()=>loadUserBottomNavSettings?.(), 500);
    }
  });
}catch(_){}


/* 상세 모달 지도: 열림/리사이즈 시 추가 보정 */
try{
 const __detailModalForMap = document.querySelector('#detailModal');
 if(__detailModalForMap && !__detailModalForMap.__mapResizeFixBound){
   __detailModalForMap.addEventListener('toggle', () => {
     setTimeout(() => {
       try{
         if(detailMapInstance && window.naver?.maps){
           window.naver.maps.Event.trigger(detailMapInstance, 'resize');
         }
       }catch(_){}
     }, 180);
   });
   __detailModalForMap.__mapResizeFixBound = true;
 }
 window.addEventListener('resize', () => {
   try{
     if(detailMapInstance && window.naver?.maps){
       window.naver.maps.Event.trigger(detailMapInstance, 'resize');
     }
   }catch(_){}
 });
}catch(_){}

setTimeout(loadGnbMenusFromDb, 900);

/* ===== Bottom nav dot-only cleanup sync ===== */
function cleanupBottomNavOldBadges(){
  document.querySelectorAll('.bottom-nav [data-view-link]').forEach(btn => {
    btn.classList.remove('nav-top1');
    btn.querySelectorAll(
      '.nav-final-trend-badge,.nav-mini-trend,.nav-robot-trend-badge,.menu-trend-ribbon,.menu-trend-badge-wrap,.menu-trend-badge'
    ).forEach(el => el.remove());
  });
}
function syncBottomNavDotBadgesOnlyFinal(){
  cleanupBottomNavOldBadges();

  let popularId = '';
  try{
    popularId = String(Array.from(popularGnbMenuIdSet || [])[0] || '');
  }catch(_){}

  let popularMenu = popularId ? getMenuByIdOrFallback?.(popularId) : null;
  const popularKeys = popularMenu
    ? [popularMenu.menuId, popularMenu.view, popularMenu.route].map(v => String(v || '').replace(/^#|^\//,'').trim()).filter(Boolean)
    : [];

  document.querySelectorAll('.bottom-nav [data-view-link]').forEach(btn => {
    btn.querySelectorAll('.nav-badge-dot').forEach(el => el.remove());

    const viewKey = String(btn.dataset.viewLink || '').replace(/^#|^\//,'').trim();
    const menu = getMenuByIdOrFallback?.(viewKey) || findTrendMenuByView?.(viewKey) || null;

    let type = '';
    if(popularKeys.includes(viewKey)){
      type = 'hot';
    }else{
      try{
        if(menu && isMenuNew(menu)) type = 'new';
      }catch(_){
        if(menu && Array.isArray(menu.sections) && menu.sections.includes('new')) type = 'new';
      }
    }

    if(type){
      const dot = document.createElement('span');
      dot.className = `nav-badge-dot ${type === 'hot' ? 'hot' : 'new'}`;
      dot.setAttribute('aria-hidden','true');
      btn.insertAdjacentElement('afterbegin', dot);
    }
  });
}
window.syncBottomNavDotBadgesOnlyFinal = syncBottomNavDotBadgesOnlyFinal;
setTimeout(syncBottomNavDotBadgesOnlyFinal, 300);
setTimeout(syncBottomNavDotBadgesOnlyFinal, 1200);
document.addEventListener('click', () => scheduleTrendFinalDisplay?.(), true);


/* ===== Bottom nav tiny-dot badge final sync ===== */
function getNavBadgeTodayKey(){
  const uid = auth?.currentUser?.uid || 'guest';
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth()+1).padStart(2,'0');
  const day = String(d.getDate()).padStart(2,'0');
  return `bottomNavBadgeBlinked:${uid}:${y}-${m}-${day}`;
}

function shouldBlinkBottomNavBadgeToday(){
  try{
    const key = getNavBadgeTodayKey();
    if(localStorage.getItem(key) === '1') return false;
    localStorage.setItem(key, '1');
    return true;
  }catch(_){
    return false;
  }
}

let bottomNavBadgeBlinkAllowed = shouldBlinkBottomNavBadgeToday();

function syncBottomNavDotBadgesFinal(){
  let popularId = '';
  try{
    popularId = String(Array.from(popularGnbMenuIdSet || [])[0] || '');
  }catch(_){}

  let popularMenu = popularId ? getMenuByIdOrFallback?.(popularId) : null;
  const popularKeys = popularMenu
    ? [popularMenu.menuId, popularMenu.view, popularMenu.route].map(v => String(v || '').replace(/^#|^\//,'').trim()).filter(Boolean)
    : [];

  document.querySelectorAll('.bottom-nav [data-view-link]').forEach(btn => {
    btn.querySelectorAll('.nav-badge-dot,.nav-final-trend-badge,.nav-mini-trend,.nav-robot-trend-badge,.menu-trend-ribbon,.menu-trend-badge-wrap').forEach(el => el.remove());

    const viewKey = String(btn.dataset.viewLink || '').replace(/^#|^\//,'').trim();
    const menu = getMenuByIdOrFallback?.(viewKey) || findTrendMenuByView?.(viewKey) || null;

    let type = '';
    if(popularKeys.includes(viewKey)){
      type = 'hot';
    }else{
      try{
        if(menu && isMenuNew(menu)) type = 'new';
      }catch(_){
        if(menu && Array.isArray(menu.sections) && menu.sections.includes('new')) type = 'new';
      }
    }

    if(type){
      const dot = document.createElement('span');
      dot.className = `nav-badge-dot ${type === 'hot' ? 'hot' : 'new'}${bottomNavBadgeBlinkAllowed ? ' blink' : ''}`;
      dot.setAttribute('aria-hidden','true');
      btn.insertAdjacentElement('afterbegin', dot);
    }
  });

  // 첫 렌더에만 blink 적용, 이후 재동기화에서는 조용한 점만 유지
  bottomNavBadgeBlinkAllowed = false;
}

window.syncBottomNavDotBadgesFinal = syncBottomNavDotBadgesFinal;

setTimeout(syncBottomNavDotBadgesFinal, 1100);
// 반복 실행 제거: 동적 네비 재렌더/클릭 시점에만 갱신합니다.


/* ===== Public user bottom nav settings ===== */
let userBottomNavSelectedMenus = [];

function getBottomNavCandidateMenusForUser(){
  const preferred=['benefits','favorite','top5','ai','calendar','map','notices'];
  const rows = [...(gnbMenuCache || [])]
    .filter(canUseGnbMenu)
    .filter(m => m.isActive !== false)
    .filter(m => !['home','all'].includes(String(m.menuId)))
    // 사용자가 선택하는 후보는 resident 권한 기준으로 열어둡니다.
    .filter(m => !Array.isArray(m.roles) || m.roles.includes('resident') || m.roles.includes('admin') || m.roles.includes('root'))
    .sort((a,b)=>{
      const ai=preferred.indexOf(a.menuId), bi=preferred.indexOf(b.menuId);
      if(ai!==-1 || bi!==-1) return (ai===-1?999:ai)-(bi===-1?999:bi);
      return a.order-b.order;
    });

  if(rows.length) return rows;

  // DB 메뉴 로딩 전/후보 필터가 비어도 기본 핵심 메뉴는 선택 가능하게 표시합니다.
  return preferred.map(getMenuByIdOrFallback).filter(Boolean).filter(m => !['home','all'].includes(String(m.menuId)));
}

function renderUserBottomNavSettings(){
  const picker = qs('#userBottomNavPicker');
  const current = qs('#userBottomNavCurrent');
  const status = qs('#userBottomNavStatus');
  if(!picker || !current) return;

  const candidates = getBottomNavCandidateMenusForUser();
  picker.innerHTML = candidates.length ? candidates.map(menu => {
    const active = userBottomNavSelectedMenus.includes(menu.menuId);
    const disabled = !active && userBottomNavSelectedMenus.length >= 3;
    return `<button type="button" class="user-bottom-nav-pick ${active?'active':''} ${disabled?'disabled':''}" data-user-bottom-pick="${escapeHtml(menu.menuId)}" aria-pressed="${active ? 'true' : 'false'}">
      <span>${renderAnyMenuIcon(menu)} ${escapeHtml(menu.name || menu.menuId)}</span>
    </button>`;
  }).join('') : '<div class="notice">선택 가능한 메뉴가 없습니다.</div>';

  const selectedMenus = userBottomNavSelectedMenus.map(getMenuByIdOrFallback).filter(Boolean);
  current.innerHTML = [
    '<span class="user-bottom-nav-chip fixed"><img class="upick-svg-icon upick-menu-icon-img" src="/icons/internal/home.svg" alt="" loading="lazy"> 홈</span>',
    ...selectedMenus.map(m => `<span class="user-bottom-nav-chip selected">${renderAnyMenuIcon(m)} ${escapeHtml(m.name || m.menuId)}</span>`),
    '<span class="user-bottom-nav-chip fixed"><img class="upick-svg-icon upick-menu-icon-img" src="/icons/internal/all-menu.svg" alt="" loading="lazy"> 전체</span>'
  ].join('');

  if(status){
    status.textContent = userBottomNavSelectedMenus.length
      ? `개인화 메뉴 ${userBottomNavSelectedMenus.length}개가 선택되어 있습니다.`
      : '개인화 메뉴가 없습니다. 관리자 기본 메뉴를 사용합니다.';
  }
}

async function loadUserBottomNavSettings(){
  const user = auth?.currentUser;
  if(!user || !db) return;
  try{
    const snap = await getDoc(doc(db, 'users', user.uid));
    userBottomNavSelectedMenus = snap.exists() ? uniqBottomMenuIds(snap.data().bottomNavMenus || []) : [];
  }catch(error){
    console.warn('사용자 하단 네비 설정 로딩 실패', error);
    userBottomNavSelectedMenus = [];
  }
  bottomNavUserMenusCache = userBottomNavSelectedMenus;
  renderUserBottomNavSettings();
}

async function saveUserBottomNavSettings(){
  const user = auth?.currentUser;
  if(!user || !db) return;
  try{
    await setDoc(doc(db, 'users', user.uid), {
      bottomNavMenus: uniqBottomMenuIds(userBottomNavSelectedMenus),
      bottomNavUpdatedAt: serverTimestamp()
    }, { merge:true });
    await renderDynamicBottomNav?.(true);
  await loadUserBottomNavSettings?.();
    renderUserBottomNavSettings();
    await openModalAlert('하단 네비바 설정이 저장되었습니다.');
  }catch(error){
    console.error(error);
    await openModalAlert('하단 네비바 설정 저장 중 오류가 발생했습니다.');
  }
}

async function resetUserBottomNavSettings(){
  const user = auth?.currentUser;
  if(!user || !db) return;
  const ok = await openModalConfirm('내 하단 네비바 개인화 설정을 해제하고 관리자 기본값을 사용할까요?');
  if(!ok) return;
  try{
    userBottomNavSelectedMenus = [];
    await setDoc(doc(db, 'users', user.uid), {
      bottomNavMenus: [],
      bottomNavUpdatedAt: serverTimestamp()
    }, { merge:true });
    bottomNavUserMenusCache = uniqBottomMenuIds(userBottomNavSelectedMenus);
    bottomNavSettingsLoadedOnce = true;
    await renderDynamicBottomNav?.(true);
    renderUserBottomNavSettings();
    await openModalAlert('개인화 설정이 해제되었습니다.');
  }catch(error){
    console.error(error);
    await openModalAlert('설정 초기화 중 오류가 발생했습니다.');
  }
}

document.addEventListener('click', (event) => {
  const pick = event.target.closest?.('[data-user-bottom-pick]');
  if(pick){
    const id = pick.dataset.userBottomPick;
    if(userBottomNavSelectedMenus.includes(id)){
      userBottomNavSelectedMenus = userBottomNavSelectedMenus.filter(v => v !== id);
    }else{
      if(userBottomNavSelectedMenus.length >= 3){
        openModalAlert('하단 네비바는 최대 3개까지 선택할 수 있습니다.');
        return;
      }
      userBottomNavSelectedMenus = [...userBottomNavSelectedMenus, id];
    }
    renderUserBottomNavSettings();
  }
}, true);

qs('#saveUserBottomNavBtn')?.addEventListener('click', saveUserBottomNavSettings);
qs('#resetUserBottomNavBtn')?.addEventListener('click', resetUserBottomNavSettings);

setTimeout(loadUserBottomNavSettings, 1200);

/* Dynamic bottom nav delegated click */
document.addEventListener('click', (event) => {
  const btn = event.target.closest?.('.bottom-nav [data-view-link]');
  if(!btn) return;
  event.preventDefault();
  event.stopPropagation();
  const view = btn.dataset.viewLink || 'home';
  try{ trackGnbMenuVisitByView(view); }catch(_){}
  changeView(view);
  updateBottomNavActiveState?.();
  setTimeout(() => {
    syncBottomNavTrendBadgesFinal?.();
    syncBottomNavDotBadgesFinal?.();
    syncBottomNavSafeOffset?.();
  }, 80);
}, true);


/* ===== Bottom Nav HOT/NEW Final Force Sync ===== */
function getBottomNavTrendMenuByKey(key){
  key = String(key || '').replace(/^#|^\//,'').trim();
  if(!key) return null;
  return (gnbMenuCache || []).find(m => {
    const keys = [m.menuId, m.view, m.route].map(v => String(v || '').replace(/^#|^\//,'').trim());
    return keys.includes(key);
  }) || null;
}
function getBottomNavPopularTopId(){
  try{
    const ids = Array.from(popularGnbMenuIdSet || []);
    if(ids.length) return String(ids[0]);
  }catch(_){}
  try{
    let best = null;
    (gnbMenuCache || []).forEach(m => {
      if(isFixedNavigationMenuId(m.menuId)) return;
      const count = Number(m.totalClickCount || m.clickCount || 0);
      const last = m.lastClickedAt?.toDate?.() || (m.lastClickedAt ? new Date(m.lastClickedAt) : null);
      if(!best || count > best.count || (count === best.count && last && best.last && last > best.last)){
        best = { id:String(m.menuId || ''), count, last };
      }
    });
    return best?.count > 0 ? best.id : '';
  }catch(_){ return ''; }
}
function bottomNavMenuIsNew(menu){
  try{ return isMenuNew(menu); }catch(_){ return Array.isArray(menu?.sections) && menu.sections.includes('new'); }
}
function syncBottomNavTrendBadgesFinal(){ window.__upickStableBottomBadge?.(); }
window.syncBottomNavTrendBadgesFinal = syncBottomNavTrendBadgesFinal;
document.addEventListener('click', () => setTimeout(syncBottomNavTrendBadgesFinal, 80), true);
window.addEventListener('load', () => {
  setTimeout(syncBottomNavTrendBadgesFinal, 200);
  setTimeout(syncBottomNavTrendBadgesFinal, 900);
  setTimeout(syncBottomNavTrendBadgesFinal, 1800);
});
// 반복 실행 제거: TOP5 진입 후 DOM/뱃지 갱신 루프를 방지합니다.

setTimeout(syncBottomNavTrendBadgesFinal, 1000);

/* ===== Trend Final Force Sync ===== */
function normalizeTrendViewKey(value){
  return String(value || '').replace(/^#|^\//,'').trim();
}
function findTrendMenuByView(value){
  const key = normalizeTrendViewKey(value);
  if(!key) return null;
  return (gnbMenuCache || []).find(m => {
    return normalizeTrendViewKey(m.view) === key ||
      normalizeTrendViewKey(m.route) === key ||
      normalizeTrendViewKey(m.menuId) === key;
  }) || null;
}
function getTrendMenuFlagsSafe(menu){
  if(!menu) return { hot:false, new:false };
  const id = String(menu.menuId || '');
  let hot = false;
  let isNewFlag = false;
  try{
    hot = (popularGnbMenuIdSet && popularGnbMenuIdSet.has(id)) || isTrendingMenu(menu);
  }catch(_){
    hot = popularGnbMenuIdSet && popularGnbMenuIdSet.has(id);
  }
  try{
    isNewFlag = isMenuNew(menu);
  }catch(_){
    isNewFlag = Array.isArray(menu.sections) && menu.sections.includes('new');
  }
  return { hot, new:isNewFlag };
}
function makeTrendBadgeHtmlForView(menu, mode='nav'){
  const flags = getTrendMenuFlagsSafe(menu);
  if(flags.hot) return `<span class="${mode === 'nav' ? 'nav-final-trend-badge' : 'view-final-trend-badge'} hot">HOT</span>`;
  if(flags.new) return `<span class="${mode === 'nav' ? 'nav-final-trend-badge' : 'view-final-trend-badge'} new">NEW</span>`;
  return '';
}
function refreshBottomNavFinalTrendBadges(){ window.__upickStableBottomBadge?.(); }
function getCurrentVisibleViewKey(){
  const activeNav = document.querySelector('.bottom-nav .nav-btn.active[data-view-link]');
  if(activeNav?.dataset?.viewLink) return normalizeTrendViewKey(activeNav.dataset.viewLink);

  const visible = Array.from(document.querySelectorAll('section[id^="view-"]')).find(sec => !sec.classList.contains('hidden'));
  if(visible?.id) return visible.id.replace(/^view-/, '');

  return normalizeTrendViewKey(state?.view || 'home');
}
function refreshCurrentViewFinalTrendBadge(){
  // legacy 제목 배지와 final 제목 배지가 동시에 붙으면서 HOT이 2번 보이는 현상 방지
  document.querySelectorAll('.view-title-trend-badges,.view-final-trend-badges').forEach(el => el.remove());
  const view = getCurrentVisibleViewKey();
  const menu = findTrendMenuByView(view);
  const hotNew = [];
  const flags = getTrendMenuFlagsSafe(menu);
  if(flags.hot) hotNew.push('<span class="view-final-trend-badge hot">HOT</span>');
  if(flags.new) hotNew.push('<span class="view-final-trend-badge new">NEW</span>');
  if(!hotNew.length) return;

  const viewEl = document.querySelector(`#view-${CSS.escape(view)}`) || document.querySelector('section[id^="view-"]:not(.hidden)');
  if(!viewEl) return;

  const title = viewEl.querySelector('.hero h2, .calendar-hero h3, .ai-view-hero h3, .section-head h3, h3, h2');
  if(!title || title.querySelector('.view-title-trend-badges,.view-final-trend-badges')) return;
  title.insertAdjacentHTML('afterbegin', `<span class="view-final-trend-badges">${hotNew.join('')}</span>`);
}
function refreshTrendFinalDisplay(){
  refreshBottomNavFinalTrendBadges(); syncBottomNavTrendBadgesFinal?.();
  syncBottomNavDotBadgesFinal?.();
  refreshCurrentViewFinalTrendBadge();
}
let trendFinalDisplayTimer = null;
function scheduleTrendFinalDisplay(){
  if(trendFinalDisplayTimer) return;
  trendFinalDisplayTimer = setTimeout(() => {
    trendFinalDisplayTimer = null;
    refreshTrendFinalDisplay();
  }, 120);
}
document.addEventListener('click', (event) => {
  if(event.target.closest?.('[data-view-link], .bottom-nav, #gnbSheet, #allMenuGrid')){
    scheduleTrendFinalDisplay();
  }
}, true);
window.addEventListener('load', scheduleTrendFinalDisplay);
// v109: MutationObserver 기반 배지 재동기화는 탭 이동 시 깜빡임/반복 렌더를 만들 수 있어 제거합니다.
scheduleTrendFinalDisplay();

// AI 추천 토스트: 동적 생성/재렌더 후에도 항상 이동되도록 전역 위임
document.addEventListener('click', (event) => {
  const box = event.target.closest?.('#aiBottomReco');
  if(!box) return;
  event.preventDefault();
  event.stopPropagation();
  const view = box.dataset.viewLink || 'ai';
  try{ trackGnbMenuVisitByView(view); }catch(_){}
  markAiRecoShownToday?.();
  box.classList.remove('show');
  changeView(view);
}, true);

document.addEventListener('keydown', (event) => {
  const box = event.target.closest?.('#aiBottomReco');
  if(!box) return;
  if(event.key === 'Enter' || event.key === ' '){
    event.preventDefault();
    const view = box.dataset.viewLink || 'ai';
    try{ trackGnbMenuVisitByView(view); }catch(_){}
    box.classList.remove('show');
    changeView(view);
  }
}, true);



 qsa('[data-view-link]').forEach(btn => {
 btn.addEventListener('click', () => {
 const view = btn.dataset.viewLink;
 if(view){
 changeView(view);
 }
 closeGnb();
 });
 });

 // AI 생활도우미 공개 전환: 상단 로봇 버튼은 입주민 계정에서도 즉시 AI 화면으로 이동합니다.
 qs('#aiQuickBtn')?.addEventListener('click', (event) => {
 event.preventDefault();
 event.stopPropagation();
 changeView('ai');
 setTimeout(() => {
 resetAiChatWindow({ loadProactive:true });
 qs('#aiQuestionInput')?.focus?.();
 }, 80);
 });

 updateAiConversationStatus(aiConversationTitle);
 resetAiChatWindow();
 bindAiAttachmentPicker();
 bindAiQuestionComposer();
 bindAiDragAndDropUpload();
 qs('#aiAskBtn')?.addEventListener('click', () => { if(!guardAiAssistantBusy()) askAiAssistant(); });
 qs('#aiNewConversationBtn')?.addEventListener('click', startNewAiConversation);
 qs('#aiOpenConversationListBtn')?.addEventListener('click', loadAiConversationList);
 qs('#aiCloseConversationListBtn')?.addEventListener('click', () => qs('#aiConversationPanel')?.classList.remove('show'));
 qs('#aiClearConversationBtn')?.addEventListener('click', clearCurrentAiConversation);
 qs('#aiQuestionInput')?.addEventListener('keydown', (event) => {
 if(event.key === 'Enter' && (event.ctrlKey || event.metaKey)){
 event.preventDefault();
 if(!guardAiAssistantBusy()) askAiAssistant();
 }
 });
 qsa('[data-ai-question]').forEach(btn => {
 btn.addEventListener('click', () => { if(!guardAiAssistantBusy()) askAiAssistant(btn.dataset.aiQuestion || btn.textContent || ''); });
 });

 qs('#aiDailyNudgeOpenBtn')?.addEventListener('click', async () => {
 await markDailyAiNudgeShown('opened');
 await openAiAssistantFromNudge('toast');
 });
 qs('#aiDailyNudgeCloseBtn')?.addEventListener('click', async () => {
 hideDailyAiNudgeToast(true);
 await markDailyAiNudgeShown('closed');
 });

 qs('#closeModal').onclick=()=>{closeDetailDialogPreservingPage(qs('#detailModal'));};
 qs('#closeNoticeModal').onclick=()=>{closeDetailDialogPreservingPage(qs('#noticeModal'));};
 qs('#closeCalendarReservationModal')?.addEventListener('click', closeCalendarReservationModal);
 qs('#cancelCalendarReservationBtn')?.addEventListener('click', closeCalendarReservationModal);
 const calendarReservationFormEl = qs('#calendarReservationForm');
 if(calendarReservationFormEl){
   calendarReservationFormEl.setAttribute('novalidate', 'novalidate');
   calendarReservationFormEl.noValidate = true;
   calendarReservationFormEl.addEventListener('submit', saveCalendarReservation);
 }
 qs('#calendarRefreshBtn')?.addEventListener('click', renderCalendarReservations);
 qs('#calendarPrevBtn')?.addEventListener('click', () => moveCalendarView(-1));
 qs('#calendarNextBtn')?.addEventListener('click', () => moveCalendarView(1));
 qs('#calendarTitleBtn')?.addEventListener('click', openCalendarMainDatePicker);
 qs('#calendarTodayBtn')?.addEventListener('click', goCalendarToday);
 qs('#calendarMainDatePicker')?.addEventListener('change', (event) => moveCalendarToDate(event.target.value));
 qsa('[data-calendar-mode]').forEach(btn => btn.addEventListener('click', () => changeCalendarMode(btn.dataset.calendarMode)));
 qs('#calendarDayPrevBtn')?.addEventListener('click', () => moveCalendarDayModal(-1));
 qs('#calendarDayNextBtn')?.addEventListener('click', () => moveCalendarDayModal(1));
 qs('#calendarDayCloseBtn')?.addEventListener('click', closeCalendarDayModal);
 qs('#calendarDayCloseBottomBtn')?.addEventListener('click', closeCalendarDayModal);
 qs('#calendarDayTodayBtn')?.addEventListener('click', () => { calendarUiState.dayModalDateKey = dateKeyFromDate(new Date()); calendarUiState.focusAfterModalDateKey = calendarUiState.dayModalDateKey; renderCalendarDayModal(); });
 qs('#calendarDayDateBtn')?.addEventListener('click', () => { const picker = qs('#calendarDayDatePicker'); if(!picker) return; picker.value = calendarUiState.dayModalDateKey || dateKeyFromDate(new Date()); if(typeof picker.showPicker === 'function') picker.showPicker(); else picker.click(); });
 qs('#calendarDayDatePicker')?.addEventListener('change', (event) => { if(!event.target.value) return; calendarUiState.dayModalDateKey = event.target.value; calendarUiState.focusAfterModalDateKey = event.target.value; renderCalendarDayModal(); });
 qs('#calendarDayModal')?.addEventListener('close', syncCalendarFocusFromDayModal);
 qs('#closeQrModal')?.addEventListener('click', () => closeDialogSafe(qs('#qrModal')));
 qs('#detailModal')?.addEventListener('upick:native-close', () => {
 const y = Number(window.__upickClosingDetailScrollY);
 resetDetailDialogScroll(qs('#detailModal'));
 if(parseCleanDeepLink()?.type === 'benefit') clearCleanDeepLinkUrl({ replace:true });
 if(window.__upickDetailCloseInProgress) return;
 if(Number.isFinite(y)) holdStablePageScrollY(y, 900);
 });
 qs('#noticeModal')?.addEventListener('upick:native-close', () => {
 const y = Number(window.__upickClosingDetailScrollY);
 resetDetailDialogScroll(qs('#noticeModal'));
 if(parseCleanDeepLink()?.type === 'notice') clearCleanDeepLinkUrl({ replace:true });
 if(window.__upickDetailCloseInProgress) return;
 if(Number.isFinite(y)) holdStablePageScrollY(y, 900);
 });
 let deferredPrompt=null;window.addEventListener('beforeinstallprompt',(e)=>{e.preventDefault();deferredPrompt=e;});
 qs('#installTopBtn').onclick=async()=>{if(!deferredPrompt){await openModalAlert('브라우저 메뉴에서 “홈 화면에 추가”를 선택하면 앱처럼 설치할 수 있습니다.', qs('#installTopBtn'));return;}deferredPrompt.prompt();await deferredPrompt.userChoice;deferredPrompt=null;};
 const chipsEl = qs('#chips');
 const chipsToggleBtn = qs('#chipsToggle');

 function applyChipsState(){
 chipsEl.classList.remove('expanded');
 chipsToggleBtn.classList.add('hidden');
 }

 function updateToggle(){
 requestAnimationFrame(()=>{
 chipsEl.classList.remove('expanded');
 chipsToggleBtn.classList.add('hidden');
 });
 }

 chipsToggleBtn.onclick = ()=>{};

 qs('#enablePushBtn')?.addEventListener('click', enablePushNotifications);
 qs('#disablePushBtn')?.addEventListener('click', disablePushNotifications);
 qs('#gnbPushStatusPill')?.addEventListener('click', () => {
   if(state.isPushEnabledForThisDevice){
     disablePushNotifications();
   } else {
     enablePushNotifications();
   }
 });
 qs('#openAccountEditBtn')?.addEventListener('click', openAccountEditModal);
 qs('#openPasswordChangeBtn')?.addEventListener('click', openPasswordChangeModal);
 qs('#closePasswordChangeModal')?.addEventListener('click', closePasswordChangeModal);
 qs('#cancelPasswordChangeBtn')?.addEventListener('click', closePasswordChangeModal);
 qs('#passwordChangeForm')?.addEventListener('submit', submitPasswordChange);
 qs('#newPasswordInput')?.addEventListener('input', updatePasswordChangeMatchMessage);
 qs('#newPasswordConfirmInput')?.addEventListener('input', updatePasswordChangeMatchMessage);
 // 비밀번호 변경 모달은 바깥 영역 클릭으로 닫지 않습니다.
 qs('#openAccountEditBtn')?.addEventListener('click', openAccountEditModal);
 qs('#closeAccountEditModal')?.addEventListener('click', closeAccountEditModal);
 qs('#cancelAccountEditBtn')?.addEventListener('click', closeAccountEditModal);
 qs('#accountProfileFileInput')?.addEventListener('change', handleProfileImageFileChange);
 qs('#accountCheckNicknameBtn')?.addEventListener('click', () => checkAccountNicknameDuplicate());
 qs('#accountNicknameInput')?.addEventListener('input', () => {
 const nickname = normalizeProfileInput(qs('#accountNicknameInput')?.value || '');
 const originalNickname = getOriginalAccountNickname();
 setAccountNicknameCheckStatus(nickname === originalNickname ? 'same' : 'idle');
 setAccountNicknameState(null);
 if(nickname === originalNickname){
 setAccountNicknameState(false);
 setAccountNicknameMessage('err', '현재 사용 중인 닉네임과 동일합니다. 변경할 닉네임을 입력해 주세요.');
 }else{
 setAccountNicknameMessage('', '닉네임 중복 확인을 먼저 완료해 주세요.');
 }
 });
 bindProfileUploadButton();
 qs('#accountEditForm')?.addEventListener('submit', saveAccountProfile);
 qsa('.font-size-option').forEach((btn) => {
 btn.addEventListener('click', () => changeAppFontSize(btn.dataset.fontSize));
 });
 syncFontSizeSettingUi();

 // 계정 정보 수정 모달은 바깥 영역 클릭으로 닫지 않습니다.
 qs('#withdrawBtn')?.addEventListener('click', withdrawCurrentUser);

 qs('#logoutBtn').onclick=async()=>{const confirmed=await openModalConfirm('나가시겠습니까?', qs('#logoutBtn'), '나가기', '나가기', '취소'); if(!confirmed) return; try{await logoutServerSession(auth, API_URL[ENV]); await signOut(auth);redirectToLogin();}catch(error){await openModalAlert('나가기 중 오류가 발생했습니다.', qs('#logoutBtn'));}};

 bindGlobalLoadingTriggers();

 (async()=>{
 // 최초 진입 시에는 화면이 먼저 비어 보이지 않도록 앱 부트스트랩 로딩을 바로 유지합니다.
 // 이후 benefits/notices/popular의 첫 스냅샷이 모두 도착하면 markInitialDataLoaded()에서 닫습니다.
 showGlobalLoading();
 try{
 await initPushSystem();
 const ok = await ensureAuthenticatedUser();
 if(!ok) return;
 await handleShareClickLog();
 await refreshPushStatus();
 if(hasFirebaseConfig()){
 qs('#firebaseNotice').classList.add('hidden');
 subscribeBenefits();
 subscribeNotices();
 subscribeAiKnowledge();
 subscribePopularStats();
 subscribeResidentActivityRanking();
 subscribeFavorites();
 subscribeCalendarReservations();
 }else{
 qs('#firebaseNotice').classList.remove('hidden');
 state.loading=false;
 renderAll();
 hideGlobalLoading(80);
 }
 }catch(error){
 console.error('공개앱 초기 로딩 실패', error);
 state.loading=false;
 renderAll();
 hideGlobalLoading(80);
 await openModalAlert('앱 정보를 불러오는 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.');
 }
 })();
 
/* =========================================================
   A11Y HOTFIX: GNB first focus ring in every tab
   홈 탭 외 다른 탭에서 GNB를 열 때도 첫 번째 홈 버튼에 포커스와 시각 링을 강제 복원합니다.
   ========================================================= */
(function(){
  'use strict';
  const FOCUS_RING_CLASS = 'upick-force-focus-ring';
  const SHEET_SELECTOR = '#gnbSheet';
  const FIRST_BUTTON_SELECTOR = '.gnb-home-active, .gnb-icons button:first-of-type, button[data-view-link="home"]';

  function q(sel, root){ return (root || document).querySelector(sel); }
  function isOpen(sheet){ return !!(sheet && sheet.classList.contains('show') && sheet.getAttribute('aria-hidden') !== 'true'); }

  function clearForcedRings(sheet){
    (sheet || document).querySelectorAll('.' + FOCUS_RING_CLASS).forEach(function(el){
      el.classList.remove(FOCUS_RING_CLASS);
    });
  }

  function focusFirstGnbButton(reason){
    const sheet = q(SHEET_SELECTOR);
    if(!isOpen(sheet)) return;
    const first = q(FIRST_BUTTON_SELECTOR, sheet);
    if(!first || first.disabled) return;

    clearForcedRings(sheet);
    first.classList.add(FOCUS_RING_CLASS);
    first.dataset.upickForcedFocusReason = reason || 'open';

    try { first.focus({ preventScroll: true }); }
    catch(_) { try { first.focus(); } catch(__){} }
  }

  function scheduleInitialFocus(reason){
    [0, 40, 120, 260].forEach(function(delay){
      setTimeout(function(){ focusFirstGnbButton(reason); }, delay);
    });
    requestAnimationFrame(function(){ focusFirstGnbButton(reason + ':raf'); });
  }

  document.addEventListener('click', function(event){
    const opener = event.target && event.target.closest && event.target.closest('#globalGnbBtn, #gnbToggleBtn, #gnbOpenBtn, #openGnbBtn, [data-open-gnb], .gnb-open-btn');
    if(opener) scheduleInitialFocus('opener-click');
  }, true);

  document.addEventListener('keydown', function(event){
    if(event.key !== 'Enter' && event.key !== ' ') return;
    const opener = event.target && event.target.closest && event.target.closest('#globalGnbBtn, #gnbToggleBtn, #gnbOpenBtn, #openGnbBtn, [data-open-gnb], .gnb-open-btn');
    if(opener) scheduleInitialFocus('opener-key');
  }, true);

  document.addEventListener('focusin', function(event){
    const sheet = q(SHEET_SELECTOR);
    if(!sheet || !sheet.contains(event.target)) return;
    if(!event.target.matches(FIRST_BUTTON_SELECTOR)) clearForcedRings(sheet);
  }, true);

  function bindObserver(){
    const sheet = q(SHEET_SELECTOR);
    if(!sheet || sheet.__upickGnbInitialFocusObserver) return;
    sheet.__upickGnbInitialFocusObserver = true;
    new MutationObserver(function(){
      if(isOpen(sheet)) scheduleInitialFocus('sheet-open');
      else clearForcedRings(sheet);
    }).observe(sheet, { attributes:true, attributeFilter:['class','aria-hidden'] });
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bindObserver, {once:true});
  else bindObserver();
})();

/* ===== Fix: 로딩바와 알럿이 동시에 떠도 확인 버튼 클릭 가능 =====
   성능 보정: 문서 전체 MutationObserver를 제거하고, 로딩바는 클릭을 가로채지 않도록 CSS에 맡깁니다. */
(function(){
  function releaseLoadingPointer(){
    document.querySelectorAll('#globalLoadingBar,.global-loading,.page-loader').forEach(function(loader){
      loader.style.pointerEvents = 'none';
    });
  }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', releaseLoadingPointer, { once:true });
  else releaseLoadingPointer();
  window.addEventListener('load', releaseLoadingPointer, { once:true });
})();


/* ===== Fix v4: session alert unlock hook ===== */
(function(){
  function run(){
    if(typeof window.__upickUnlockForAlertClick === 'function'){
      window.__upickUnlockForAlertClick();
    }
  }
  document.addEventListener('click', function(e){
    if(e.target && e.target.closest && e.target.closest('dialog[open], #appAlert, .common-alert, .app-alert, .modal-alert')) run();
  }, true);
  document.addEventListener('DOMContentLoaded', run);
  window.addEventListener('load', run);
  setTimeout(run, 100);
  setTimeout(run, 500);
  setTimeout(run, 1200);
})();


try { window.syncDevBadgeVisibility && window.syncDevBadgeVisibility(); } catch (e) {}

;(()=>{try{
  const bind=()=>{
    document.querySelectorAll('.gnb-search-box').forEach(box=>{
      if(box.__gnbSearchFocusBound) return;
      box.__gnbSearchFocusBound=true;
      box.addEventListener('click',e=>{
        const input=box.querySelector('input');
        if(input && e.target!==input) input.focus();
      });
    });
  };
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',bind,{once:true}); else bind();
}catch(_){}})();


/* ===== v20260527 image preview final fade/fullscreen patch ===== */
(function(){
  'use strict';
  const OPEN_CLASS = 'show';
  const CLOSING_CLASS = 'closing';
  const DURATION = 320;

  function raf2(fn){ requestAnimationFrame(() => requestAnimationFrame(fn)); }
  function keepImageZoomOnTop(el){
    try{
      if(typeof window.__upickBringPopupToFront === 'function') window.__upickBringPopupToFront(el);
    }catch(_){ }
  }

  window.openAiImageZoomFromElement = function(source){
    const trigger = source && source.closest ? (source.closest('[data-ai-image-zoom]') || source) : source;
    const src = trigger?.dataset?.aiImageSrc || trigger?.getAttribute?.('src') || trigger?.querySelector?.('img')?.src || '';
    const title = trigger?.dataset?.aiImageTitle || trigger?.querySelector?.('img')?.alt || '이미지 확대 보기';
    if(!src) return false;
    try{ window.DuLayer?.ensure?.('aiImageZoomBackdrop'); }catch(_){ }
    const layer = document.getElementById('aiImageZoomBackdrop');
    const img = document.getElementById('aiImageZoomImg');
    const titleEl = document.getElementById('aiImageZoomTitle');
    const closeBtn = document.getElementById('aiImageZoomCloseBtn');
    if(!layer || !img) return false;
    if(titleEl) titleEl.textContent = title || '이미지 확대 보기';
    img.src = src;
    img.alt = title || '확대 이미지';
    layer.classList.remove(CLOSING_CLASS, 'upick-motion-closing');
    layer.classList.add('upick-ai-image-fade-layer','upick-motion-layer');
    const panel = layer.querySelector('.ai-image-zoom-card,.du-layer__panel,[data-du-layer-panel]');
    if(panel) panel.classList.add('upick-motion-panel');
    layer.setAttribute('aria-hidden','false');
    keepImageZoomOnTop(layer);
    document.body.classList.add('ai-image-zoom-open');
    raf2(() => {
      layer.classList.add(OPEN_CLASS);
      try{ closeBtn?.focus?.({preventScroll:true}); }catch(_){ }
    });
    return false;
  };

  function syncAiImageZoomLocks(){
    // AI 이미지 확대 팝업은 fade-out 때문에 닫힘 완료 전까지 aria-hidden 처리를 늦춥니다.
    // 닫힘 완료 후에는 공통 lock 시스템을 명시적으로 재동기화해서 body/html lock 잔재를 제거합니다.
    try{ window.DuLayerStackManager?.requestSync?.(); }catch(_){ }
    try{ window.__upickSyncModalScrollLock?.(); }catch(_){ }
    try{ window.__upickV8SyncModalScrollLock?.(); }catch(_){ }
    window.setTimeout(function(){
      try{ window.DuLayerStackManager?.requestSync?.(); }catch(_){ }
      try{ window.__upickSyncModalScrollLock?.(); }catch(_){ }
      try{ window.__upickV8SyncModalScrollLock?.(); }catch(_){ }
      var stillOpen = false;
      try{ stillOpen = !!(window.DuLayerStackManager && window.DuLayerStackManager.hasOpenLayer && window.DuLayerStackManager.hasOpenLayer()); }catch(_){ }
      var modalOpen = !!document.querySelector([
        '.du-layer.show', '.du-layer[open]', '.du-layer[aria-hidden="false"]',
        '.upick-div-modal.show', '.upick-div-dialog.show', '.common-modal-overlay.show',
        'dialog[open]', '.app-alert.show', '.sheet-modal.show'
      ].join(','));
      if(!stillOpen && !modalOpen){
        document.documentElement.classList.remove('upick-layer-scroll-lock','upick-modal-scroll-event-lock','upick-modal-open');
        document.body.classList.remove('upick-layer-scroll-lock','upick-modal-scroll-event-lock','upick-modal-open','ai-image-zoom-open');
        try{ window.__upickHardScrollFreeze?.forceUnlock?.(); }catch(_){ }
      }
    }, 40);
  }

  window.closeAiImageZoom = function(){
    const layer = document.getElementById('aiImageZoomBackdrop');
    const img = document.getElementById('aiImageZoomImg');
    if(!layer || layer.dataset.upickAiImageClosing === '1') return false;
    layer.dataset.upickAiImageClosing = '1';
    layer.classList.add(CLOSING_CLASS, 'upick-motion-closing');
    layer.classList.remove(OPEN_CLASS, 'upick-motion-open');
    // fade-out이 보인 뒤 aria-hidden 처리합니다. 즉시 true를 주면 du-layer display:none 규칙 때문에 바로 사라집니다.
    window.setTimeout(() => {
      layer.classList.remove(CLOSING_CLASS, 'upick-motion-closing');
      layer.setAttribute('aria-hidden','true');
      delete layer.dataset.upickAiImageClosing;
      document.body.classList.remove('ai-image-zoom-open');
      if(img) img.removeAttribute('src');
      try{ window.DuLayer?.unmount?.(layer); }catch(_){ }
      try{ document.dispatchEvent(new CustomEvent('upick:layer-closed', { detail:{ layer: layer, source: 'ai-image-zoom' } })); }catch(_){ }
      syncAiImageZoomLocks();
    }, DURATION);
    return false;
  };

  // AI 이미지 확대 팝업은 바깥영역 클릭으로 닫지 않습니다.
  // 기존에는 캡처 단계(document click)에서 event.target === layer 일 때
  // closeAiImageZoom()이 먼저 호출되어 뒤쪽 guard보다 먼저 닫히는 문제가 있었습니다.
  // 닫기는 X 버튼/명시적 closeAiImageZoom() 호출에서만 처리합니다.
  document.addEventListener('click', function(event){
    const layer = document.getElementById('aiImageZoomBackdrop');
    if(layer && layer.classList.contains(OPEN_CLASS) && event.target === layer){
      event.preventDefault();
      event.stopPropagation();
      if(typeof event.stopImmediatePropagation === 'function') event.stopImmediatePropagation();
      return false;
    }
  }, true);
})();

/* ===== v20260527 image viewer shell/count final fix ===== */
(function(){
  'use strict';

  function ensureAiImageZoomCard(){
    var layer = document.getElementById('aiImageZoomBackdrop');
    if(!layer || layer.querySelector('.ai-image-zoom-card')) return;
    var title = document.getElementById('aiImageZoomTitle');
    var close = document.getElementById('aiImageZoomCloseBtn');
    var scroll = document.getElementById('aiImageZoomScroll');
    if(!title || !close || !scroll) return;
    var card = document.createElement('div');
    card.className = 'ai-image-zoom-card';
    card.setAttribute('role','document');
    layer.insertBefore(card, title);
    card.appendChild(title);
    card.appendChild(close);
    card.appendChild(scroll);
  }

  function patchBenefitPreviewCounter(){
    var overlay = document.querySelector('.benefit-image-preview-overlay');
    if(!overlay) return;
    overlay.querySelectorAll('.benefit-image-preview-frame-count').forEach(function(el){
      el.setAttribute('aria-hidden','true');
    });
    var count = overlay.querySelector('.benefit-image-preview-count');
    if(count){
      count.removeAttribute('style');
      count.setAttribute('aria-live','polite');
    }
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', ensureAiImageZoomCard, {once:true});
  }else{
    ensureAiImageZoomCard();
  }
  window.addEventListener('load', ensureAiImageZoomCard, {once:true});

  var originalOpenAi = window.openAiImageZoomFromElement;
  window.openAiImageZoomFromElement = function(source){
    ensureAiImageZoomCard();
    return originalOpenAi ? originalOpenAi.call(this, source) : false;
  };

  document.addEventListener('click', function(){
    window.setTimeout(patchBenefitPreviewCounter, 0);
    window.setTimeout(patchBenefitPreviewCounter, 80);
  }, true);
  document.addEventListener('keydown', function(){
    window.setTimeout(patchBenefitPreviewCounter, 0);
  }, true);
})();






/* AI 이미지 확대 팝업: 바깥영역 클릭 닫힘 방지, X 버튼 닫힘 유지 */
(function () {
  function applyAiImageZoomGuard() {
    var backdrop = document.getElementById('aiImageZoomBackdrop');
    if (!backdrop || backdrop.dataset.aiOutsideGuard === '1') return;

    backdrop.dataset.aiOutsideGuard = '1';

    ['click', 'pointerdown', 'mousedown', 'touchstart'].forEach(function (eventName) {
      backdrop.addEventListener(eventName, function (event) {
        if (event.target === backdrop) {
          event.preventDefault();
          event.stopPropagation();
          if (typeof event.stopImmediatePropagation === 'function') {
            event.stopImmediatePropagation();
          }
          return false;
        }
      }, true);
    });

    var closeBtn = document.getElementById('aiImageZoomCloseBtn') || backdrop.querySelector('.ai-image-zoom-close');
    if (closeBtn && closeBtn.dataset.aiCloseBound !== '1') {
      closeBtn.dataset.aiCloseBound = '1';
      closeBtn.addEventListener('click', function (event) {
        event.preventDefault();
        event.stopPropagation();
        if (typeof window.closeAiImageZoom === 'function') {
          window.closeAiImageZoom();
        }
      }, false);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyAiImageZoomGuard);
  } else {
    applyAiImageZoomGuard();
  }
})();

/* v20260530-phase10-bottom-sheet: 정렬/반경 선택을 공통 바텀시트 계열로 통합 */
(function(){
  'use strict';

  function isBottomSheetMode(){
    try{
      return window.matchMedia('(max-width: 640px), (pointer: coarse)').matches;
    }catch(_){
      return window.innerWidth <= 640;
    }
  }

  function getOrCreateFilterSheet(){
    var sheet = document.getElementById('duFilterSheet');
    if(sheet) return sheet;

    sheet = document.createElement('div');
    sheet.id = 'duFilterSheet';
    sheet.className = 'du-layer du-layer--sheet du-filter-sheet';
    sheet.setAttribute('role', 'dialog');
    sheet.setAttribute('aria-modal', 'true');
    sheet.setAttribute('aria-hidden', 'true');
    sheet.setAttribute('data-du-layer', 'sheet');
    sheet.setAttribute('data-close-on-backdrop', 'false');
    sheet.setAttribute('data-du-close-on-backdrop', 'false');
    sheet.setAttribute('data-du-close-on-esc', 'false');
    sheet.innerHTML = '' +
      '<div class="du-layer__panel du-filter-sheet__panel" data-du-layer-panel role="document">' +
        '<div class="du-sheet-handle" aria-hidden="true"></div>' +
        '<div class="du-layer__header du-filter-sheet__header" data-du-layer-header>' +
          '<div class="du-layer__header-main">' +
            '<span class="du-layer__badge du-filter-sheet__badge" id="duFilterSheetBadge">선택</span>' +
            '<h2 class="du-layer__title du-filter-sheet__title" id="duFilterSheetTitle">정렬 선택</h2>' +
            '<p class="du-layer__subtitle du-filter-sheet__subtitle" id="duFilterSheetSubtitle">목록 표시 기준을 선택합니다.</p>' +
          '</div>' +
          '<div class="du-layer__header-actions">' +
            '<button type="button" class="du-layer__close du-filter-sheet__close" id="duFilterSheetCloseBtn" data-du-layer-close aria-label="닫기">✕</button>' +
          '</div>' +
        '</div>' +
        '<div class="du-layer__body du-filter-sheet__body" id="duFilterSheetBody" data-du-layer-body></div>' +
      '</div>';
    if(window.DuLayer && typeof window.DuLayer.mount === 'function') window.DuLayer.mount(sheet, 'sheet');
    else (document.getElementById('duLayerRoot') || document.body).appendChild(sheet);

    sheet.addEventListener('click', function(event){
      if(event.target === sheet){
        event.preventDefault();
        event.stopPropagation();
        if(typeof event.stopImmediatePropagation === 'function') event.stopImmediatePropagation();
      }
    }, true);
    sheet.addEventListener('pointerdown', function(event){
      if(event.target === sheet){
        event.preventDefault();
        event.stopPropagation();
        if(typeof event.stopImmediatePropagation === 'function') event.stopImmediatePropagation();
      }
    }, true);
    sheet.querySelector('#duFilterSheetCloseBtn')?.addEventListener('click', closeDuFilterSheet);
    return sheet;
  }

  function getSheetOptions(type){
    if(type === 'radius'){
      return {
        badge:'거리',
        title:'거리 범위 선택',
        subtitle:'현재 위치 기준으로 혜택 매장을 필터링합니다.',
        current:String(state.distanceRadius || 'all'),
        items:[
          { value:'all', label:'전체 보기', desc:'거리 제한 없이 모든 혜택을 봅니다.' },
          { value:'500', label:'500m 이내', desc:'가까운 도보권 혜택만 봅니다.' },
          { value:'1000', label:'1km 이내', desc:'근처 생활권 혜택을 봅니다.' },
          { value:'3000', label:'3km 이내', desc:'주변 상권까지 넓게 봅니다.' }
        ]
      };
    }
    return {
      badge:'정렬',
      title:'정렬 기준 선택',
      subtitle:'혜택 목록을 원하는 기준으로 정렬합니다.',
      current:String(state.benefitSortMode || 'default'),
      items:[
        { value:'default', label:'추천순', desc:'기본 추천 기준으로 봅니다.' },
        { value:'latest', label:'최신순', desc:'최근 등록/수정된 혜택부터 봅니다.' },
        { value:'top', label:'TOP 순', desc:'인기 반응이 높은 혜택부터 봅니다.' },
        { value:'distance', label:'가까운순', desc:'현재 위치에서 가까운 혜택부터 봅니다.' }
      ]
    };
  }

  function renderFilterSheet(type){
    var sheet = getOrCreateFilterSheet();
    var config = getSheetOptions(type);
    sheet.dataset.sheetType = type;
    sheet.querySelector('#duFilterSheetBadge').textContent = config.badge;
    sheet.querySelector('#duFilterSheetTitle').textContent = config.title;
    sheet.querySelector('#duFilterSheetSubtitle').textContent = config.subtitle;
    var body = sheet.querySelector('#duFilterSheetBody');
    if(!body) return sheet;
    body.innerHTML = '<div class="du-filter-sheet__list">' + config.items.map(function(item){
      var active = item.value === config.current;
      return '<button type="button" class="du-filter-sheet__option' + (active ? ' active' : '') + '" data-du-filter-value="' + item.value + '" aria-pressed="' + (active ? 'true' : 'false') + '">' +
        '<span class="du-filter-sheet__option-text"><strong>' + item.label + '</strong><small>' + item.desc + '</small></span>' +
        '<span class="du-filter-sheet__option-check" aria-hidden="true">✓</span>' +
      '</button>';
    }).join('') + '</div>';
    body.querySelectorAll('[data-du-filter-value]').forEach(function(btn){
      btn.addEventListener('click', function(){
        var value = btn.getAttribute('data-du-filter-value');
        closeDuFilterSheet();
        if(type === 'radius') applyRadiusPopoverValue(value);
        else applySortPopoverValue(value);
      });
    });
    return sheet;
  }

  function openDuFilterSheet(type){
    var sheet = renderFilterSheet(type);
    closeFilterPopovers();
    if(window.DuLayer && typeof window.DuLayer.mount === 'function') window.DuLayer.mount(sheet, 'sheet');
    else if(!sheet.closest('#duLayerRoot')) (document.getElementById('duLayerRoot') || document.body).appendChild(sheet);
    sheet.classList.remove('closing','is-closing','upick-motion-closing');
    sheet.classList.add('ready');
    sheet.setAttribute('aria-hidden', 'false');
    requestAnimationFrame(function(){
      sheet.classList.add('show');
      sheet.querySelector('.du-filter-sheet__option.active, .du-filter-sheet__option, .du-filter-sheet__close')?.focus?.();
      window.DuLayerAdapter?.enhanceOpenLayers?.();
      window.DuLayerStackManager?.requestSync?.();
    });
  }

  function closeDuFilterSheet(){
    var sheet = document.getElementById('duFilterSheet');
    if(!sheet) return;
    sheet.classList.remove('show');
    sheet.classList.add('closing');
    sheet.setAttribute('aria-hidden', 'true');
    window.setTimeout(function(){
      sheet.classList.remove('ready','closing','is-closing','upick-motion-closing');
      window.DuLayerStackManager?.requestSync?.();
    }, 260);
  }

  document.addEventListener('click', function(event){
    var sortBtn = event.target?.closest?.('#sortPopoverBtn');
    var radiusBtn = event.target?.closest?.('#radiusPopoverBtn');
    if(!sortBtn && !radiusBtn) return;
    if(!isBottomSheetMode()) return;
    event.preventDefault();
    event.stopPropagation();
    if(typeof event.stopImmediatePropagation === 'function') event.stopImmediatePropagation();
    openDuFilterSheet(radiusBtn ? 'radius' : 'sort');
  }, true);

  document.addEventListener('keydown', function(event){
    if(event.key !== 'Escape') return;
    var sheet = document.getElementById('duFilterSheet');
    if(!sheet || sheet.getAttribute('aria-hidden') === 'true') return;
    event.preventDefault();
    event.stopPropagation();
  }, true);

  window.DuBottomSheet = Object.assign(window.DuBottomSheet || {}, {
    openFilterSheet:openDuFilterSheet,
    closeFilterSheet:closeDuFilterSheet
  });
})();
