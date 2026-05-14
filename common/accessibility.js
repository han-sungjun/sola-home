/* 더운정픽 공통 웹/모바일 접근성 보정 패치 */
(function(){
  'use strict';
  const TEXT_MAP = [
    [/메뉴|gnb|all-menu/i,'전체 메뉴 열기'],
    [/install|설치/i,'앱 설치 안내 열기'],
    [/close|닫기/i,'닫기'],
    [/search|검색/i,'검색'],
    [/favorite|star|즐겨찾기/i,'즐겨찾기'],
    [/share|공유/i,'공유하기'],
    [/back|뒤로/i,'이전 화면으로 이동'],
    [/delete|삭제/i,'삭제'],
    [/edit|수정/i,'수정'],
    [/refresh|새로고침/i,'새로고침']
  ];
  function ready(fn){
    if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn, {once:true});
    else fn();
  }
  function textOf(el){
    return (el.getAttribute('aria-label') || el.getAttribute('title') || el.textContent || el.id || el.className || '').toString().trim();
  }
  function guessLabel(el){
    const base = textOf(el);
    if(base && base.length > 0 && base.length <= 60 && !/^\s*$/.test(base)) return base;
    const img = el.querySelector && el.querySelector('img[alt]:not([alt=""])');
    if(img) return img.getAttribute('alt').trim();
    const src = el.querySelector && el.querySelector('img[src]')?.getAttribute('src');
    const key = [base, src || ''].join(' ');
    for(const [re,label] of TEXT_MAP){ if(re.test(key)) return label; }
    return '';
  }
  function ensureSkipLink(){
    if(document.querySelector('.a11y-skip-link')) return;
    let main = document.querySelector('main,[role="main"],#view-home,.app,.wrap');
    if(!main) return;
    if(!main.id) main.id = 'mainContent';
    if(!main.hasAttribute('role') && main.tagName !== 'MAIN') main.setAttribute('role','main');
    main.setAttribute('tabindex','-1');
    const a = document.createElement('a');
    a.className = 'a11y-skip-link';
    a.href = '#' + main.id;
    a.textContent = '본문 바로가기';
    a.addEventListener('click', () => setTimeout(()=>main.focus({preventScroll:true}), 0));
    document.body.insertBefore(a, document.body.firstChild);
  }
  function enhanceControls(root=document){
    root.querySelectorAll('button:not([type])').forEach(btn => btn.setAttribute('type','button'));
    root.querySelectorAll('button,[role="button"],a.btn,.icon-btn,.nav-btn,.favorite-btn').forEach(el => {
      if(!el.hasAttribute('aria-label')){
        const label = guessLabel(el);
        if(label && label.length <= 60) el.setAttribute('aria-label', label);
      }
      if(el.getAttribute('role') === 'button' && !el.hasAttribute('tabindex')) el.setAttribute('tabindex','0');
    });
    root.querySelectorAll('img:not([alt])').forEach(img => img.setAttribute('alt',''));
    root.querySelectorAll('input,select,textarea').forEach(input => {
      if(input.id && document.querySelector('label[for="'+CSS.escape(input.id)+'"]')) return;
      if(input.hasAttribute('aria-label') || input.hasAttribute('aria-labelledby')) return;
      const placeholder = input.getAttribute('placeholder');
      if(placeholder) input.setAttribute('aria-label', placeholder);
    });
  }
  function enhanceLoadingState(root=document){
    root.querySelectorAll('#globalLoadingBar,.global-loading,.page-loader').forEach(loader => {
      loader.setAttribute('role','status');
      loader.setAttribute('aria-live','polite');
      loader.setAttribute('aria-label', loader.getAttribute('aria-label') || '화면을 불러오는 중입니다');
    });
  }
  function enhanceDialogs(root=document){
    root.querySelectorAll('dialog,.app-alert,.sheet-modal,[role="dialog"],[role="alertdialog"]').forEach((dlg,idx) => {
      if(!dlg.hasAttribute('aria-modal')) dlg.setAttribute('aria-modal','true');
      if(!dlg.hasAttribute('aria-labelledby') && !dlg.hasAttribute('aria-label')){
        const title = dlg.querySelector('h1,h2,h3,.modal-title,.sheet-title,.app-alert-title,[id$="Title"]');
        if(title){
          if(!title.id) title.id = 'a11yDialogTitle' + idx + '_' + Math.random().toString(36).slice(2,7);
          dlg.setAttribute('aria-labelledby', title.id);
        }
      }
    });
  }
  function syncPressedExpanded(root=document){
    root.querySelectorAll('[aria-expanded]').forEach(el => {
      const expanded = el.getAttribute('aria-expanded') === 'true';
      el.classList.toggle('is-expanded-a11y', expanded);
    });
  }
  function run(root=document){
    ensureSkipLink();
    enhanceControls(root);
    enhanceLoadingState(root);
    enhanceDialogs(root);
    syncPressedExpanded(root);
  }
  ready(() => {
    run(document);
    let scheduled = false;
    const mo = new MutationObserver((mutations) => {
      if(scheduled) return;
      scheduled = true;
      requestAnimationFrame(() => {
        scheduled = false;
        for(const m of mutations){
          if(m.type === 'childList') m.addedNodes.forEach(n => { if(n.nodeType === 1) run(n); });
          if(m.type === 'attributes' && m.target && m.target.nodeType === 1) run(m.target);
        }
      });
    });
    mo.observe(document.body, {subtree:true, childList:true, attributes:true, attributeFilter:['class','aria-expanded','open','hidden','style']});
  });
})();
