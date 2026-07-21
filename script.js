document.addEventListener('DOMContentLoaded', () => {
  const year = document.getElementById('year');
  if (year) year.textContent = String(new Date().getFullYear());

  const focusableSelector = 'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

  const toggle = document.querySelector('.nav-toggle');
  const mobileNav = document.getElementById('mobile-nav');
  const mobileBackdrop = mobileNav?.querySelector('.mobile-nav__backdrop');

  const closeMobileNav = (restoreFocus = true) => {
    if (!mobileNav || !toggle) return;
    mobileNav.classList.remove('is-open');
    mobileNav.setAttribute('aria-hidden', 'true');
    mobileNav.setAttribute('inert', '');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Open navigation');
    document.body.classList.remove('nav-open');
    if (restoreFocus) toggle.focus();
  };

  const openMobileNav = () => {
    if (!mobileNav || !toggle) return;
    mobileNav.removeAttribute('inert');
    mobileNav.classList.add('is-open');
    mobileNav.setAttribute('aria-hidden', 'false');
    toggle.setAttribute('aria-expanded', 'true');
    toggle.setAttribute('aria-label', 'Close navigation');
    document.body.classList.add('nav-open');
    mobileNav.querySelector(focusableSelector)?.focus();
  };

  if (toggle && mobileNav) {
    toggle.addEventListener('click', () => {
      mobileNav.classList.contains('is-open') ? closeMobileNav() : openMobileNav();
    });
    mobileBackdrop?.addEventListener('click', () => closeMobileNav());
    mobileNav.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => closeMobileNav(false)));
    mobileNav.addEventListener('keydown', (event) => {
      if (event.key !== 'Tab') return;
      const focusable = Array.from(mobileNav.querySelectorAll(focusableSelector));
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    });
  }

  const revealElements = Array.from(document.querySelectorAll('.reveal'));
  if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.15 });
    revealElements.forEach((element) => observer.observe(element));
  } else {
    revealElements.forEach((element) => element.classList.add('is-visible'));
  }

  document.querySelectorAll('[data-slider]').forEach((container) => {
    const track = container.querySelector('.cert-previews__track');
    const dots = Array.from(container.querySelectorAll('.cert-previews__dot'));
    const slides = track ? Array.from(track.querySelectorAll('.certificate-frame')) : [];
    if (!track || slides.length <= 1 || dots.length !== slides.length) return;

    let current = 0;
    const goTo = (index, animate = true) => {
      current = index;
      if (!animate) track.style.transition = 'none';
      track.style.transform = `translateX(-${index * container.clientWidth}px)`;
      dots.forEach((dot, dotIndex) => {
        dot.classList.toggle('is-active', dotIndex === index);
        if (dotIndex === index) dot.setAttribute('aria-current', 'true');
        else dot.removeAttribute('aria-current');
      });
      if (!animate) requestAnimationFrame(() => { track.style.transition = ''; });
    };

    dots.forEach((dot, index) => dot.addEventListener('click', () => goTo(index)));
    window.addEventListener('resize', () => goTo(current, false), { passive: true });
  });

  const modal = document.getElementById('img-modal');
  const modalImage = modal?.querySelector('img');
  const modalContent = modal?.querySelector('.img-modal__content');
  const modalClose = modal?.querySelector('.img-modal__close');
  const modalBackdrop = modal?.querySelector('.img-modal__backdrop');
  let modalTrigger = null;

  const closeModal = () => {
    if (!modal) return;
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    modal.setAttribute('inert', '');
    document.body.classList.remove('modal-open');
    if (modalTrigger instanceof HTMLElement) modalTrigger.focus();
    modalTrigger = null;
  };

  const openModal = (trigger) => {
    if (!modal || !modalImage || !modalContent) return;
    const source = trigger.getAttribute('data-image-modal');
    if (!source) return;
    const image = trigger.querySelector('img');
    modalTrigger = trigger;
    modalImage.src = source;
    modalImage.alt = image?.alt || 'Image preview';
    modal.removeAttribute('inert');
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
    modalClose?.focus();
  };

  if (modal && modalImage && modalContent) {
    document.querySelectorAll('[data-image-modal]').forEach((trigger) => {
      trigger.addEventListener('click', () => openModal(trigger));
    });
    modalClose?.addEventListener('click', closeModal);
    modalBackdrop?.addEventListener('click', closeModal);
    modal.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        closeModal();
        return;
      }
      if (event.key !== 'Tab') return;
      const focusable = Array.from(modal.querySelectorAll(focusableSelector));
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    });
  }

  window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && mobileNav?.classList.contains('is-open')) closeMobileNav();
  });
});
