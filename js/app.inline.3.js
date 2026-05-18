(function(){
  function esc(v){return String(v ?? '').replace(/[&<>"]/g,function(ch){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[ch];});}
  function normalizeCouponLinks(item){
    var raw=(item && (item.couponLinks || item.coupons || item.couponList || item.couponUrls)) || [];
    var rows=[];
    if(Array.isArray(raw)){
      rows=raw.map(function(row){
        if(typeof row==='string') return {title:'쿠폰 있어요',url:row};
        row=row||{};
        return {title:String(row.title||row.name||row.label||row.couponTitle||'쿠폰 있어요').trim(),url:String(row.url||row.link||row.href||row.couponUrl||'').trim()};
      });
    }else if(raw && typeof raw==='object'){
      rows=[{title:String(raw.title||raw.name||raw.label||raw.couponTitle||'쿠폰 있어요').trim(),url:String(raw.url||raw.link||raw.href||raw.couponUrl||'').trim()}];
    }else if(typeof raw==='string'){
      rows=raw.split(/[\n,，]/).map(function(url){return {title:'쿠폰 있어요',url:String(url).trim()};});
    }
    return rows.filter(function(row){return row.url;}).map(function(row){return {title:row.title||'쿠폰 있어요',url:row.url};});
  }
  function getBenefits(){
    if(window.state && Array.isArray(window.state.benefits)) return window.state.benefits;
    if(Array.isArray(window.benefits)) return window.benefits;
    return [];
  }
  function findCurrentBenefit(){
    var modal=document.getElementById('detailModal');
    var body=document.getElementById('modalBody');
    if(!modal || !body) return null;
    var id=body.querySelector('[data-benefit-id]')?.dataset?.benefitId || modal.dataset.benefitId || body.dataset.benefitId || '';
    var list=getBenefits();
    if(id){
      var byId=list.find(function(v){return String(v.id||v.docId||'')===String(id);});
      if(byId) return byId;
    }
    var title=(body.querySelector('h1,h2,h3,.benefit-title,.detail-title')?.textContent || '').trim();
    if(title) return list.find(function(v){return String(v.name||'').trim()===title || title.includes(String(v.name||'').trim());}) || null;
    return null;
  }
  function injectCouponLinks(){
    var body=document.getElementById('modalBody');
    if(!body || body.querySelector('.upick-coupon-link-section')) return;
    var item=findCurrentBenefit();
    var rows=normalizeCouponLinks(item||{});
    if(!rows.length) return;
    var section=document.createElement('section');
    section.className='upick-coupon-link-section';
    section.innerHTML='<h3>쿠폰</h3><div class="upick-coupon-link-card"><div class="upick-coupon-icon">🎁</div><div class="upick-coupon-copy"><strong>쿠폰 있어요</strong><span>'+esc(rows[0].title)+'</span></div><button type="button">모두 보기</button></div>';
    section.querySelector('button').addEventListener('click',function(){
      var url=rows[0].url;
      try{ window.open(url,'_blank','noopener,noreferrer'); }catch(_){ location.replace(url); }
    });
    var mapSection=body.querySelector('.mini-map-wrap,.location-card,.detail-location,.benefit-location');
    if(mapSection && mapSection.parentNode) mapSection.parentNode.insertBefore(section,mapSection);
    else body.appendChild(section);
  }
  var observer=new MutationObserver(function(){ setTimeout(injectCouponLinks,80); });
  function init(){
    var body=document.getElementById('modalBody');
    if(body) observer.observe(body,{childList:true,subtree:true});
    document.addEventListener('click',function(e){ if(e.target.closest('[data-benefit-id],.benefit-card,.list-card,.favorite-card')) setTimeout(injectCouponLinks,250); },true);
    injectCouponLinks();
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init,{once:true}); else init();
})();