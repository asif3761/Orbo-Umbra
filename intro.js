/* ---------------- INTRO: EYE OPENING SEQUENCE (homepage only) ---------------- */
(function(){
  const overlay = document.getElementById('intro-overlay');
  if(!overlay) return;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.body.style.overflow = 'hidden';

  let finished = false;
  function finishIntro(){
    if(finished) return;
    finished = true;
    overlay.classList.add('hidden');
    document.body.style.overflow = '';
    setTimeout(()=> overlay.classList.add('removed'), 950);
  }

  if(reduced){
    overlay.classList.add('removed');
    document.body.style.overflow = '';
  } else {
    requestAnimationFrame(()=>{
      setTimeout(()=> overlay.classList.add('opening'), 250);
      setTimeout(()=> overlay.classList.add('flash'), 1750);
      setTimeout(finishIntro, 2500);
    });
    overlay.addEventListener('click', finishIntro);
    window.addEventListener('keydown', finishIntro, { once:true });
  }
})();
