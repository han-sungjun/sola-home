(function(){
  function enhanceNewsRows(){
    document.querySelectorAll('.news-item-row').forEach((row)=>{
      const map=[
        ['.news-title','소식 제목'],
        ['.news-date','소식 날짜'],
        ['.news-image-url','이미지 URL'],
        ['.news-url','소식 링크 URL']
      ];
      map.forEach(([sel,label])=>{
        const input=row.querySelector(sel);
        if(!input || input.dataset.newsFieldEnhanced==='1') return;
        input.dataset.newsFieldEnhanced='1';
        input.setAttribute('aria-label', label);
        input.setAttribute('title', label);
        if(!input.previousElementSibling || !input.previousElementSibling.classList?.contains('news-field-label')){
          const small=document.createElement('small');
          small.className='news-field-label';
          small.textContent=label;
          input.parentNode.insertBefore(small,input);
        }
      });
    });
  }
  document.addEventListener('DOMContentLoaded', enhanceNewsRows);
  document.addEventListener('click',()=>setTimeout(enhanceNewsRows,30),true);
  new MutationObserver(enhanceNewsRows).observe(document.documentElement,{childList:true,subtree:true});
})();