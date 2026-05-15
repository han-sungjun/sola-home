/* 더운정픽 공통 비밀번호 입력 UX
   - 모든 password input에 보기/숨기기 SVG 버튼 자동 삽입
   - Caps Lock 감지 안내 자동 표시
   - 동적으로 생성되는 비밀번호 입력란도 MutationObserver로 적용 */
(function(){
  'use strict';

  const STYLE_ID = 'sola-password-field-enhance-style';
  const ICON_EYE = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 5.5c5.1 0 8.5 4.6 9.6 6.2.2.3.2.7 0 1C20.5 14.4 17.1 19 12 19s-8.5-4.6-9.6-6.2a.9.9 0 0 1 0-1C3.5 10.1 6.9 5.5 12 5.5Zm0 2C8.4 7.5 5.7 10.4 4.4 12c1.3 1.6 4 4.5 7.6 4.5s6.3-2.9 7.6-4.5c-1.3-1.6-4-4.5-7.6-4.5Zm0 1.5a3 3 0 1 1 0 6 3 3 0 0 1 0-6Zm0 2a1 1 0 1 0 0 2 1 1 0 0 0 0-2Z" fill="currentColor"/></svg>';
  const ICON_EYE_OFF = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M3.3 2.3 21.7 20.7l-1.4 1.4-3.2-3.2A10.8 10.8 0 0 1 12 20c-5.2 0-8.7-4.6-9.8-6.3a1.2 1.2 0 0 1 0-1.4 19 19 0 0 1 4-4.5L1.9 3.7l1.4-1.4Zm4.4 7A17 17 0 0 0 4.1 13c1.2 1.6 4 5 7.9 5 1.3 0 2.5-.4 3.6-1l-2.1-2.1A3.4 3.4 0 0 1 9.1 10.5L7.7 9.3ZM12 6c5.2 0 8.7 4.6 9.8 6.3.3.4.3 1 0 1.4a18.8 18.8 0 0 1-2.5 3.1l-1.4-1.4a16.6 16.6 0 0 0 2-2.4c-1.2-1.6-4-5-7.9-5-.8 0-1.6.1-2.3.4L8.1 6.8A10.4 10.4 0 0 1 12 6Zm0 3.6a3.4 3.4 0 0 1 3.4 3.4v.3l-4-4c.2 0 .4-.1.6-.1Z" fill="currentColor"/></svg>';

  function injectStyle(){
    if(document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .sola-password-wrap{position:relative;display:block;width:100%;}
      .sola-password-wrap > input[type="password"],
      .sola-password-wrap > input[data-sola-password-enhanced="1"]{padding-right:48px!important;}
      .sola-password-toggle{position:absolute;right:10px;top:50%;transform:translateY(-50%);width:34px;height:34px;border:0;border-radius:12px;background:transparent;color:#64748b;display:inline-flex;align-items:center;justify-content:center;cursor:pointer;z-index:2;transition:background-color .15s ease,color .15s ease,box-shadow .15s ease;}
      .sola-password-toggle svg{width:20px;height:20px;display:block;pointer-events:none;}
      .sola-password-toggle:hover{background:rgba(15,23,42,.06);color:#0f172a;}
      .sola-password-toggle:focus-visible{outline:3px solid rgba(14,165,233,.35);outline-offset:2px;}
      .sola-caps-warning{display:none;margin:7px 0 0;font-size:12.5px;font-weight:700;line-height:1.35;color:#ef4444;}
      .sola-caps-warning.is-visible{display:flex;align-items:center;gap:6px;}
      .sola-caps-warning::before{content:'!';display:inline-flex;align-items:center;justify-content:center;width:16px;height:16px;border-radius:999px;background:#fee2e2;color:#dc2626;font-size:11px;font-weight:900;}
      .sola-password-wrap.is-caps-on > input{border-color:#ef4444!important;box-shadow:0 0 0 3px rgba(239,68,68,.12)!important;}
    `;
    document.head.appendChild(style);
  }

  function getCapsState(event){
    try{
      if(event && typeof event.getModifierState === 'function') return !!event.getModifierState('CapsLock');
    }catch(_){/* noop */}
    return false;
  }

  function ensureWarning(input, wrap){
    const doc = input.ownerDocument;
    let warningId = input.id ? `${input.id}CapsLockWarning` : '';
    let warning = warningId ? doc.getElementById(warningId) : null;
    if(!warning){
      warning = doc.createElement('p');
      warning.className = 'sola-caps-warning';
      warning.setAttribute('aria-live','polite');
      warning.textContent = 'Caps Lock이 켜져 있습니다.';
      if(warningId) warning.id = warningId;
      wrap.insertAdjacentElement('afterend', warning);
    }
    return warning;
  }

  function enhanceInput(input){
    if(!input || input.dataset.solaPasswordEnhanced === '1') return;
    if(input.type !== 'password') return;

    injectStyle();
    input.dataset.solaPasswordEnhanced = '1';

    const doc = input.ownerDocument;
    let wrap = input.closest('.sola-password-wrap');
    if(!wrap){
      wrap = doc.createElement('div');
      wrap.className = 'sola-password-wrap';
      input.parentNode.insertBefore(wrap, input);
      wrap.appendChild(input);
    }

    const btn = doc.createElement('button');
    btn.type = 'button';
    btn.className = 'sola-password-toggle';
    btn.setAttribute('aria-label','비밀번호 표시');
    btn.setAttribute('aria-pressed','false');
    btn.innerHTML = ICON_EYE;
    wrap.appendChild(btn);

    const warning = ensureWarning(input, wrap);
    const describedBy = new Set(String(input.getAttribute('aria-describedby') || '').split(/\s+/).filter(Boolean));
    if(warning.id){
      describedBy.add(warning.id);
      input.setAttribute('aria-describedby', Array.from(describedBy).join(' '));
    }

    function setCapsVisible(visible){
      warning.classList.toggle('is-visible', !!visible);
      wrap.classList.toggle('is-caps-on', !!visible);
    }

    btn.addEventListener('click', () => {
      const visible = input.type === 'text';
      input.type = visible ? 'password' : 'text';
      btn.setAttribute('aria-label', visible ? '비밀번호 표시' : '비밀번호 숨기기');
      btn.setAttribute('aria-pressed', String(!visible));
      btn.innerHTML = visible ? ICON_EYE : ICON_EYE_OFF;
      input.focus({preventScroll:true});
      const len = input.value.length;
      try{ input.setSelectionRange(len, len); }catch(_){/* noop */}
    });

    ['keydown','keyup'].forEach(type => {
      input.addEventListener(type, (event) => setCapsVisible(getCapsState(event)));
    });
    input.addEventListener('focus', (event) => setCapsVisible(getCapsState(event)));
    input.addEventListener('blur', () => setCapsVisible(false));
  }

  function run(){
    document.querySelectorAll('input[type="password"]').forEach(enhanceInput);
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run, {once:true});
  else run();

  const observer = new MutationObserver((mutations) => {
    for(const mutation of mutations){
      for(const node of mutation.addedNodes){
        if(!(node instanceof Element)) continue;
        if(node.matches?.('input[type="password"]')) enhanceInput(node);
        node.querySelectorAll?.('input[type="password"]').forEach(enhanceInput);
      }
    }
  });
  observer.observe(document.documentElement, {childList:true, subtree:true});
})();
