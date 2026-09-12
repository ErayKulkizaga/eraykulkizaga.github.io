/* The video keeps playing. Scroll changes only the HTML text aperture. */
(() => {
  'use strict';
  const root = document.documentElement;
  const hero = document.querySelector('.entry-hero');
  if (!hero) return;
  const video = hero.querySelector('video');
  const title = hero.querySelector('h1');
  const caption = hero.querySelector('.entry-caption');
  const loader = document.querySelector('.site-loader');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let frame = 0, start = 0, distance = 1, inView = true;
  const saveData = navigator.connection?.saveData === true;
  const clamp = n => Math.max(0, Math.min(1,n));
  const ease = n => {const t = clamp(n); return t*t*(3-2*t);};

  function dismissLoader() {
    root.classList.remove('entry-loading');
    loader.inert = true;
    loader.setAttribute('aria-hidden','true');
    requestDraw();
  }
  loader.querySelector('button').addEventListener('click', dismissLoader);
  const mediaReady = new Promise(resolve => {
    if (reduced.matches || saveData) return resolve();
    if (video.readyState >= 2) return resolve();
    video.addEventListener('loadeddata', resolve, {once:true});
    video.addEventListener('error', resolve, {once:true});
  });
  Promise.race([
    Promise.all([document.fonts.ready, mediaReady, new Promise(resolve => setTimeout(resolve,reduced.matches ? 0 : 650))]),
    new Promise(resolve => setTimeout(resolve,3500)),
  ]).then(dismissLoader);

  function draw() {
    frame = 0;
    if (reduced.matches) return;
    const p = clamp((scrollY-start)/distance);
    const zoom = ease((p-.08)/.63);
    hero.style.setProperty('--entry-scale',Math.exp(zoom*Math.log(65)).toFixed(4));
    hero.style.setProperty('--entry-veil',(1-ease((p-.68)/.12)).toFixed(4));
    hero.style.setProperty('--entry-copy',(1-ease((p-.015)/.13)).toFixed(4));
    hero.style.setProperty('--entry-fog',ease((p-.79)/.21).toFixed(4));
    caption.inert = p > .14;
  }
  function requestDraw() { if (!frame && !document.hidden) frame=requestAnimationFrame(draw); }
  function measure() {
    start=hero.getBoundingClientRect().top+scrollY;
    distance=Math.max(1,hero.offsetHeight-innerHeight);
    title.style.transformOrigin=`${parseFloat(getComputedStyle(title).fontSize)*.14}px 50%`;
    requestDraw();
  }
  async function playVideo() {
    if (!video.getAttribute('src')) {
      video.src = matchMedia('(max-width: 600px)').matches ? video.dataset.mobile : video.dataset.desktop;
    }
    video.muted = true;
    try { await video.play(); } catch { /* Autoplay can be blocked; the control stays available. */ }
  }
  function modeChanged() {
    root.classList.toggle('entry-enhanced', !reduced.matches);
    if (reduced.matches) {
      hero.style.cssText = ''; caption.inert = false;
      video.pause(); dismissLoader();
    } else if (inView && !saveData) playVideo();
    measure();
  }
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(entries=>{
      inView=entries[0].isIntersecting;
      if (!inView) video.pause();
      else if (!reduced.matches && !saveData && !document.hidden) playVideo();
    }).observe(hero);
  }
  document.addEventListener('visibilitychange',()=>{
    if(document.hidden){video.pause();cancelAnimationFrame(frame);frame=0;}
    else {requestDraw();if(inView&&!reduced.matches&&!saveData)playVideo();}
  });
  addEventListener('scroll',requestDraw,{passive:true});
  addEventListener('resize',measure,{passive:true});
  addEventListener('pageshow',measure);
  reduced.addEventListener('change',modeChanged);
  document.fonts.ready.then(measure);
  modeChanged();
})();
