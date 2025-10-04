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



