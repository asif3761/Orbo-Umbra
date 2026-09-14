/* ---------------- SCROLL DEPTH-REVEAL ---------------- */
(function(){
  function init(){
    const els = document.querySelectorAll('.reveal');
    if(!('IntersectionObserver' in window)){
      els.forEach(el=>el.classList.add('in-view'));
      return;
    }
    const io = new IntersectionObserver((entries)=>{
      entries.forEach(entry=>{
        if(entry.isIntersecting){
          entry.target.classList.add('in-view');
          io.unobserve(entry.target);
        }
      });
    }, { threshold:0.2, rootMargin:'0px 0px -8% 0px' });
    els.forEach(el=> io.observe(el));
  }
  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
