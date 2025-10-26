// Year in footer
document.addEventListener('DOMContentLoaded', () => {
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Cache toggle for overlay menu
  const toggle = document.querySelector('.nav-toggle');

  // Fresh mobile overlay nav
  const mobileNav = document.getElementById('mobile-nav');
  const backdrop = mobileNav ? mobileNav.querySelector('.mobile-nav__backdrop') : null;
  if (mobileNav && toggle) {
    const openMobile = () => {
      mobileNav.classList.add('is-open');
      mobileNav.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      toggle.setAttribute('aria-expanded', 'true');
      const firstLink = mobileNav.querySelector('.mobile-nav__panel a');
      if (firstLink) firstLink.focus();
    };
    const closeMobile = () => {
      mobileNav.classList.remove('is-open');
      mobileNav.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      toggle.setAttribute('aria-expanded', 'false');
    };
    toggle.addEventListener('click', () => {
      const isOpen = mobileNav.classList.contains('is-open');
      isOpen ? closeMobile() : openMobile();
    });
    if (backdrop) backdrop.addEventListener('click', closeMobile);
    mobileNav.addEventListener('click', (e) => {
      const t = e.target;
      if (t && t.matches('a')) closeMobile();
    });
    window.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeMobile(); });
  }

  // Add lazy/async and fallback for certificate badge images
  document.querySelectorAll('.cert__badge img').forEach((img) => {
    img.loading = 'lazy';
    img.decoding = 'async';
    img.addEventListener('error', () => {
      if (img.dataset.fallbackApplied) return;
      img.dataset.fallbackApplied = 'true';
      img.src = 'images/IBM.png';
      img.alt = 'Logo';
    }, { once: true });
  });
  // Mobile header: hidden at top, shown after scroll; hides again when scrolled back to top
  const header = document.querySelector('.site-header');
  const isSmall = () => window.matchMedia('(max-width: 640px)').matches;
  const heroEl = document.getElementById('hero');
  const syncHeaderVisibility = () => {
    if (!header) return;
    // Only apply hide-at-top behavior on the homepage (has #hero) and on small screens
    if (!isSmall() || !heroEl) { header.classList.remove('is-hidden'); return; }
    const topThreshold = 20; // px
    const atTop = (window.scrollY || document.documentElement.scrollTop || 0) < topThreshold;
    header.classList.toggle('is-hidden', atTop);
  };
  syncHeaderVisibility();
  window.addEventListener('scroll', syncHeaderVisibility, { passive: true });
  window.addEventListener('touchmove', syncHeaderVisibility, { passive: true });
  window.addEventListener('resize', syncHeaderVisibility, { passive: true });

  // Previously moved 3D model on mobile; now static order in HTML

  // EMU slider: make visible immediately if present and preload images
  const emuSlider = document.getElementById('emu-slider');
  if (emuSlider) {
    const revealAncestor = emuSlider.closest('.reveal');
    if (revealAncestor) revealAncestor.classList.add('is-visible');
    // Preload all slider images for faster first cycle
    const filesAttr = emuSlider.getAttribute('data-files');
    const files = (filesAttr && filesAttr.trim().length)
      ? filesAttr.split(',').map((s) => s.trim()).filter(Boolean).map((s) => s.startsWith('images/') ? s : `images/${s}`)
      : ['images/mobil0.png','images/mobil1.png','images/mobil2.png','images/mobil3.png','images/mobil4.png','images/mobil5.png','images/mobil6.png'];
    const head = document.head || document.getElementsByTagName('head')[0];
    let loadedCount = 0;
    const done = () => {
      loadedCount += 1;
      if (loadedCount >= files.length) {
        const loader = emuSlider.querySelector('.slider__loader');
        if (loader) loader.style.display = 'none';
      }
    };
    files.forEach((href, i) => {
      const l = document.createElement('link');
      l.rel = 'preload';
      l.as = 'image';
      l.href = href;
      if (i < 2) l.fetchPriority = 'high';
      head.appendChild(l);
      const img = new Image();
      img.onload = done;
      img.onerror = done;
      img.src = href;
    });
  }
});

// Intersection Observer for reveal-on-scroll
const revealEls = Array.from(document.querySelectorAll('.reveal'));
if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  revealEls.forEach((el) => io.observe(el));
} else {
  // Fallback: make everything visible
  revealEls.forEach((el) => el.classList.add('is-visible'));
}

// Lightweight parallax on mouse move (desktop) and scroll
(function initParallax() {
  const layers = Array.from(document.querySelectorAll('.parallax'));
  if (!layers.length) return;
  // Disable on touch devices to avoid unnecessary listeners/perf cost
  const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  if (isTouch) return;

  const apply = () => {
    const scrollY = window.scrollY || window.pageYOffset;
    layers.forEach((layer) => {
      const speed = parseFloat(layer.getAttribute('data-speed') || '0.2');
      const translateY = Math.round(scrollY * speed);
      layer.style.transform = `translate3d(0, ${translateY}px, 0)`;
    });
  };

  apply();
  window.addEventListener('scroll', apply, { passive: true });

  // Subtle mouse-based parallax for depth
  let rafId = null;
  window.addEventListener('mousemove', (e) => {
    if (rafId) cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(() => {
      const { innerWidth, innerHeight } = window;
      const relX = (e.clientX / innerWidth - 0.5) * 2; // -1..1
      const relY = (e.clientY / innerHeight - 0.5) * 2;
      layers.forEach((layer, idx) => {
        const depth = (idx + 1) / (layers.length + 1);
        const tx = relX * depth * 8;
        const ty = relY * depth * 6;
        layer.style.transform = `translate3d(${tx}px, ${ty + (window.scrollY * parseFloat(layer.getAttribute('data-speed') || '0.2'))}px, 0)`;
      });
    });
  });
})();

// Simple image modal for certificate preview
(function initImageModal() {
  const modal = document.getElementById('img-modal');
  if (!modal) return;
  const backdrop = modal.querySelector('.img-modal__backdrop');
  const modalImg = modal.querySelector('img');
  // Any image inside mobile certificate preview should open the modal
  const triggers = Array.from(document.querySelectorAll('.cert-mobile-preview img'));
  if (!triggers.length || !modalImg || !backdrop) return;

  const open = (src, alt) => {
    modalImg.src = src;
    modalImg.alt = alt || 'Certificate preview';
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  };
  const close = () => {
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  };

  triggers.forEach((trigger) => {
    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      open(trigger.src, trigger.alt);
    });
  });
  backdrop.addEventListener('click', close);
  window.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
})();

// Match PNG box aspect ratio to the GIF's natural ratio
(function matchMediaAspectRatioToGif() {
  const gif = document.getElementById('gif-media');
  const gifBox = document.getElementById('gif-box');
  if (!gif || !gifBox) return;
  const mediaBoxes = document.querySelectorAll('.section.project-media .media-box');
  const applyRatio = () => {
    if (!gif.naturalWidth || !gif.naturalHeight) return;
    const ratio = gif.naturalWidth / gif.naturalHeight;
    const ratioValue = `${ratio}`;
    mediaBoxes.forEach((box) => {
      box.style.setProperty('--media-ar', ratioValue);
    });
  };
  if (gif.complete) {
    applyRatio();
  } else {
    gif.addEventListener('load', applyRatio, { once: true });
  }
})();

// Lazy-activate Sketchfab iframe when visible to reduce third-party errors
(function lazyActivateSketchfab() {
  const iframe = document.querySelector('.sketchfab-embed-wrapper iframe[data-src]');
  if (!iframe) return;
  const activate = () => {
    if (iframe.getAttribute('src')) return;
    const src = iframe.getAttribute('data-src');
    if (src) iframe.setAttribute('src', src);
  };
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => { if (entry.isIntersecting) { activate(); io.disconnect(); } });
    }, { threshold: 0.1 });
    io.observe(iframe);
  } else {
    // Fallback
    setTimeout(activate, 1000);
  }
})();

// EMU slider: auto-build from images/mobil*.{png,jpg,jpeg,gif}
(function initEmuSlider() {
  const slider = document.getElementById('emu-slider');
  if (!slider) return;
  const track = slider.querySelector('.slider__track');
  if (!track) return;
  // Ensure track lays out horizontally and hides overflow
  track.style.whiteSpace = 'nowrap';
  track.style.willChange = 'transform';

  // Explicit file list: use data-files if provided, else default to mobil0..mobil6.png
  const filesAttr = slider.getAttribute('data-files');
  const files = (filesAttr && filesAttr.trim().length)
    ? filesAttr.split(',').map((s) => s.trim()).filter(Boolean).map((s) => s.startsWith('images/') ? s : `images/${s}`)
    : ['images/mobil0.png','images/mobil1.png','images/mobil2.png','images/mobil3.png','images/mobil4.png','images/mobil5.png','images/mobil6.png'];

  const slides = [];
  let started = false;
  let intervalId = null;
  const intervalMs = parseInt(slider.getAttribute('data-interval') || '4000', 10);

  const addSlide = (src, index) => {
    const slide = document.createElement('div');
    slide.className = 'slider__slide';
    const imgEl = new Image();
    // First two images eager for instant start; others lazy
    if (index < 2) { imgEl.loading = 'eager'; imgEl.fetchPriority = 'high'; }
    else { imgEl.loading = 'lazy'; }
    imgEl.decoding = 'async';
    imgEl.alt = 'App screenshot';
    imgEl.src = src;
    slide.appendChild(imgEl);
    track.appendChild(slide);
    slides.push(slide);
  };

  const start = () => {
    started = true;
    let idx = 0;
    track.style.transform = 'translateX(0)';
    if (slides.length <= 1) return;
    if (intervalId) clearInterval(intervalId);
    intervalId = setInterval(() => {
      idx = (idx + 1) % slides.length;
      track.style.transform = `translateX(-${idx * 100}%)`;
    }, Math.max(1000, intervalMs));
  };

  // Build slides immediately from provided list to avoid delayed start
  files.forEach((src, idx) => addSlide(src, idx));
  // Start once at least two slides exist
  if (slides.length >= 2) start();
})();

// Contact form -> mailto fallback (no backend)
const form = document.getElementById('contact-form');
if (form) {
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = /** @type {HTMLInputElement} */ (document.getElementById('name')).value.trim();
    const message = /** @type {HTMLTextAreaElement} */ (document.getElementById('message')).value.trim();

    const subject = encodeURIComponent(`Portfolio contact from ${name || 'Visitor'}`);
    const body = encodeURIComponent(`Name: ${name}\n\n${message}`);
    window.location.href = `mailto:eraykulkizaga@hotmail.com?subject=${subject}&body=${body}`;
  });
}

// 404 fallback for static hosting (optional): redirect unknown paths to 404.html
(function redirectTo404IfMissing() {
  // Only run when not on index or known pages and fetch fails
  const known = [
    '/', '/index.html', '/project-sign-language.html', '/project-emu-book-exchange.html', '/project-eraykulkizaga.html',
    '/privacy.html', '/404.html'
  ];
  try {
    const path = location.pathname.replace(/\\+/g,'/');
    if (known.includes(path)) return;
    fetch(location.href, { method: 'HEAD' }).then((res) => {
      if (!res.ok) location.replace('/404.html');
    }).catch(() => location.replace('/404.html'));
  } catch (_) { /* noop */ }
})();

// Animated counter for total certificates
(function animateCertTotal() {
  const totalEl = document.getElementById('cert-total');
  if (!totalEl) return;

  const target = parseInt(totalEl.getAttribute('data-target') || '0', 10);
  if (!Number.isFinite(target) || target <= 0) { totalEl.textContent = '0'; return; }

  const durationMs = 1200; // total animation time
  let startTs = null;

  const step = (ts) => {
    if (startTs === null) startTs = ts;
    const progress = Math.min(1, (ts - startTs) / durationMs);
    const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic 
    const current = Math.max(0, Math.round(eased * target));
    totalEl.textContent = String(current);
    if (progress < 1) requestAnimationFrame(step);
  };

  // Start when element is visible
  const start = () => requestAnimationFrame(step);
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) { start(); io.disconnect(); }
      });
    }, { threshold: 0.2 });
    io.observe(totalEl);
  } else {
    start();
  }
})();

// Decimal counters for GPA
(function animateEduStats() {
  const values = Array.from(document.querySelectorAll('.edu-stats .stat__value'));
  if (!values.length) return;

  const startCounter = (el) => {
    const target = parseFloat(el.getAttribute('data-target') || '0');
    const decimals = parseInt(el.getAttribute('data-decimals') || '0', 10);
    const durationMs = 2000;
    let startTs = null;
    const step = (ts) => {
      if (startTs === null) startTs = ts;
      const progress = Math.min(1, (ts - startTs) / durationMs);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.max(0, target * eased);
      el.textContent = current.toFixed(decimals);
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  const startAll = () => values.forEach((el) => startCounter(el));
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) { startAll(); io.disconnect(); }
      });
    }, { threshold: 0.2 });
    io.observe(values[0]);
  } else {
    startAll();
  }
})();



