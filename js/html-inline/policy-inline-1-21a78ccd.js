(function(){
  function closePolicyPage(){
    window.close();
    window.setTimeout(function(){
      if(!window.closed){
        window.location.replace('/app');
      }
    }, 180);
  }
  document.querySelectorAll('[data-policy-close]').forEach(function(btn){
    btn.addEventListener('click', function(event){
      event.preventDefault();
      closePolicyPage();
    });
  });
  document.querySelectorAll('[data-policy-route]').forEach(function(link){
    link.addEventListener('click', function(event){
      var target = link.getAttribute('data-policy-route');
      if(!target) return;
      event.preventDefault();
      window.location.replace(target);
    });
  });
})();
