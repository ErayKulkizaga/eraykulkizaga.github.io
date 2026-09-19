/* Scroll owns one film's time. No autoplay, looping, wheel interception or idle RAF. */
(() => {
  "use strict";
  const root = document.documentElement;
  const story = document.querySelector(".film-story");
  const video = document.querySelector("#landscape-film");
  if (!story || !video) return;
  const preference = matchMedia("(prefers-reduced-motion: reduce)");
  const beats = [...story.querySelectorAll(".film-beat")].map(element => ({element, content: element.querySelector(".film-content"), start: 0, length: 1, overflow: 0}));
  const label = document.querySelector("[data-film-current]");
  let enabled = !preference.matches && !navigator.connection?.saveData;
  let raf = 0, total = 1, targetTime = 0, current = 0, lastWidth = 0;
  let sourceLoaded = false, failed = false, lastSeek = -1;
  const clamp = n => Math.max(0, Math.min(1, n));
  const smooth = n => { const t = clamp(n); return t * t * (3 - 2 * t); };
  const toggle = document.createElement("button");
  toggle.className = "film-toggle";
  toggle.type = "button";
  document.querySelector(".site-header nav").append(toggle);

  function seek() {
    if (!enabled || failed || document.hidden || !Number.isFinite(video.duration) || video.seeking || video.readyState < 1) return;
    if (Math.abs(video.currentTime - targetTime) < 1 / 48) return;
    // A server that cannot seek must not trigger a seeked -> seek busy loop.
    if (Math.abs(lastSeek - targetTime) < 1 / 48) return;
    lastSeek = targetTime;
    video.currentTime = Math.min(targetTime, Math.max(0, video.duration - .05));
  }

  function loadFilm() {
    if (!enabled || sourceLoaded || failed) return;
    sourceLoaded = true;
    video.muted = true;
    video.src = matchMedia("(max-width:600px)").matches ? video.dataset.mobile : video.dataset.desktop;
    video.preload = "auto";
    video.load();
  }

  function draw() {
    raf = 0;
    if (!enabled || document.hidden) return;
    const progress = clamp(scrollY / total);
    root.style.setProperty("--film-progress", progress.toFixed(5));
    targetTime = progress * Math.max(0, (video.duration || 0) - .05);
    seek();
    for (let i = 0; i < beats.length; i++) {
      const beat = beats[i];
      const local = (scrollY - beat.start) / beat.length;
      const enter = i === 0 ? 1 : smooth((local + .20) / .20);
      const leave = i === beats.length - 1 ? 1 : 1 - smooth((local - .58) / .22);
      const opacity = enter * leave;
      const visible = opacity > .001;
      beat.content.classList.toggle("is-visible", visible);
      beat.content.style.opacity = opacity.toFixed(4);
      beat.content.inert = !visible;
      // Tall phone copy traverses the same viewport, using normal document scroll.
      const pan = beat.overflow * clamp(local / .57);
      beat.content.style.transform = `translateY(${-pan}px)`;
      if (visible && opacity > .5) current = i;
    }
    label.textContent = beats[current].element.dataset.filmLabel;
  }

  function requestDraw() {
    if (!raf && !document.hidden) raf = requestAnimationFrame(draw);
  }

  function measure() {
    if (!enabled) return;
    const stableHeight = document.documentElement.clientHeight;
    root.style.setProperty("--beat-length", `${Math.max(850, stableHeight * 1.4)}px`);
    for (const beat of beats) {
      beat.content.classList.remove("is-tall");
      beat.content.style.transform = "none";
      if (beat.content.scrollHeight > beat.content.clientHeight + 2) beat.content.classList.add("is-tall");
      beat.overflow = Math.max(0, beat.content.scrollHeight - beat.content.clientHeight);
      beat.start = beat.element.offsetTop;
      beat.length = beat.element.offsetHeight;
    }
    total = Math.max(1, document.documentElement.scrollHeight - innerHeight);
    requestDraw();
  }

  function setMode(value, preserve = false) {
    const anchor = preserve ? beats[current].element : null;
    enabled = value;
    root.classList.toggle("film-on", enabled);
    root.classList.toggle("film-static", !enabled);
    toggle.textContent = enabled ? "Motion on" : "Motion off";
    toggle.setAttribute("aria-pressed", String(!enabled));
    toggle.setAttribute("aria-label", enabled ? "Reduce motion and read the complete page" : "Enable continuous scroll film");
    if (!enabled) {
      cancelAnimationFrame(raf); raf = 0;
      video.pause();
      root.classList.remove("film-ready");
      video.removeAttribute("src"); video.load(); sourceLoaded = false; lastSeek = -1;
      for (const beat of beats) {
        beat.content.inert = false;
        beat.content.style.removeProperty("opacity");
        beat.content.style.removeProperty("transform");
        beat.content.classList.remove("is-tall");
      }
    } else { measure(); loadFilm(); }
    if (anchor) anchor.scrollIntoView({behavior: "instant", block: "start"});
    requestDraw();
  }

  toggle.addEventListener("click", () => setMode(!enabled, true));
  preference.addEventListener("change", () => setMode(!preference.matches, true));
  video.addEventListener("loadedmetadata", requestDraw);
  video.addEventListener("loadeddata", () => { if (enabled) root.classList.add("film-ready"); requestDraw(); });
  video.addEventListener("seeked", () => { if (enabled) root.classList.add("film-ready"); seek(); });
  video.addEventListener("error", () => { failed = true; root.classList.remove("film-ready"); });
  video.addEventListener("emptied", () => root.classList.remove("film-ready"));
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) { cancelAnimationFrame(raf); raf = 0; }
    else requestDraw();
  });
  addEventListener("scroll", requestDraw, {passive: true});
  addEventListener("resize", () => {
    // Ignore mobile URL-bar height changes; they must not shift timeline anchors.
    if (innerWidth !== lastWidth || innerWidth > 760) { lastWidth = innerWidth; measure(); }
  }, {passive: true});
  addEventListener("pageshow", measure);
  addEventListener("load", measure, {once: true});
  addEventListener("hashchange", () => {
    const target = document.getElementById(decodeURIComponent(location.hash.slice(1)));
    if (enabled && target?.classList.contains("film-beat")) target.scrollIntoView({behavior:"instant",block:"start"});
  });
  // Preserve browser/native anchor navigation, including direct links and Back.
  document.addEventListener("click", event => {
    const link = event.target.closest('a[href^="#"]');
    if (!enabled || !link) return;
    const target = document.getElementById(link.hash.slice(1));
    if (target?.classList.contains("film-beat")) requestAnimationFrame(() => target.scrollIntoView({behavior:"instant",block:"start"}));
  });
  document.fonts.ready.then(measure);
  lastWidth = innerWidth;
  setMode(enabled);
})();
