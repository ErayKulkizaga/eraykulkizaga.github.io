/* Shared static-page behavior. The homepage film has its own single clock. */
(() => {
  "use strict";
  const root = document.documentElement;
  const progress = document.querySelector(".reading-progress");
  let frame = 0;
  function draw() {
    frame = 0;
    if (!progress || document.body.classList.contains("film-home")) return;
    const length = Math.max(1, root.scrollHeight - innerHeight);
    progress.style.transform = `scaleX(${Math.max(0, Math.min(1, scrollY / length))})`;
  }
  function requestDraw() {
    if (!frame && !document.hidden) frame = requestAnimationFrame(draw);
  }
  Promise.all([
    document.fonts.load("400 1em Manrope"),
    document.fonts.load("italic 400 1em Instrument"),
  ]).catch(() => {}).finally(() => {
    root.classList.remove("fonts-pending");
    requestDraw();
  });
  addEventListener("scroll", requestDraw, {passive: true});
  addEventListener("resize", requestDraw, {passive: true});
  addEventListener("load", requestDraw, {once: true});
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) { cancelAnimationFrame(frame); frame = 0; }
    else requestDraw();
  });
  document.querySelectorAll("details").forEach(el => el.addEventListener("toggle", requestDraw));
})();
