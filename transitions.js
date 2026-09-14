/* ---------------- PAGE TRANSITIONS ---------------- */
/* Fades the page in on load, and fades out before following an internal link,
   so navigation between pages feels like one continuous piece rather than a hard cut. */
(function(){
  function ready(){
    requestAnimationFrame(()=> document.body.classList.add('page-ready'));
  }
  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', ready);
  } else {
    ready();
  }

  document.addEventListener('click', function(e){
    const a = e.target.closest('a[href]');
    if(!a) return;
    const href = a.getAttribute('href');
    if(!href || href.startsWith('#') || href.startsWith('http') || href.startsWith('mailto:') || a.target === '_blank' || e.metaKey || e.ctrlKey || e.shiftKey){
      return;
    }
    e.preventDefault();
    document.body.classList.remove('page-ready');
    document.body.classList.add('page-exit');
    setTimeout(()=>{ window.location.href = href; }, 320);
  });
})();
