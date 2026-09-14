/* ---------------- CUSTOM CURSOR: ASSASSIN'S HAND ---------------- */
(function(){
  const isFine = window.matchMedia('(pointer:fine)').matches;
  if(!isFine) return;

  document.documentElement.classList.add('has-custom-cursor');
  const cursor = document.getElementById('assassin-cursor');
  if(!cursor) return;
  let shown = false;

  window.addEventListener('mousemove', (e)=>{
    if(!shown){ cursor.classList.add('visible'); shown = true; }
    cursor.style.transform = `translate3d(${e.clientX - 22}px, ${e.clientY - 30}px, 0)`;
  }, { passive:true });

  window.addEventListener('mousedown', ()=> cursor.classList.add('extended'));
  window.addEventListener('mouseup', ()=> cursor.classList.remove('extended'));
  document.addEventListener('mouseleave', ()=> cursor.classList.remove('visible'));
  document.addEventListener('mouseenter', ()=> { if(shown) cursor.classList.add('visible'); });
})();
