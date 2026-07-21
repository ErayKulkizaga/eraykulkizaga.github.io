document.addEventListener('DOMContentLoaded', () => {
  const year = document.getElementById('year');
  if (year) year.textContent = String(new Date().getFullYear());

  const header = document.querySelector('.site-header');
  if (header && document.body.classList.contains('home')) {
    let ticking = false;
    const updateHeader = () => {
      header.classList.toggle('is-visible', window.scrollY > 24);
      ticking = false;
    };
    updateHeader();
    window.addEventListener('scroll', () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(updateHeader);
    }, { passive: true });
  }

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
  const modalViewport = modal?.querySelector('.img-modal__viewport');
  const modalClose = modal?.querySelector('.img-modal__close');
  const modalBackdrop = modal?.querySelector('.img-modal__backdrop');
  const modalZoomOut = modal?.querySelector('[data-image-zoom-out]');
  const modalZoomIn = modal?.querySelector('[data-image-zoom-in]');
  const modalZoomReset = modal?.querySelector('[data-image-zoom-reset]');
  const modalZoomLabel = modal?.querySelector('[data-image-zoom-label]');
  const modalName = modal?.querySelector('.img-modal__name');
  let modalTrigger = null;
  let modalZoom = 1;

  const clampZoom = (value) => Math.min(4, Math.max(0.5, value));

  const updateModalZoom = (value, preserveCenter = true) => {
    if (!modalImage || !modalViewport || !modalImage.naturalWidth || !modalImage.naturalHeight) return;
    const previousCenterX = modalViewport.scrollWidth
      ? (modalViewport.scrollLeft + modalViewport.clientWidth / 2) / modalViewport.scrollWidth
      : 0.5;
    const previousCenterY = modalViewport.scrollHeight
      ? (modalViewport.scrollTop + modalViewport.clientHeight / 2) / modalViewport.scrollHeight
      : 0.5;
    modalZoom = clampZoom(value);
    const viewportStyle = window.getComputedStyle(modalViewport);
    const horizontalPadding = parseFloat(viewportStyle.paddingLeft) + parseFloat(viewportStyle.paddingRight);
    const verticalPadding = parseFloat(viewportStyle.paddingTop) + parseFloat(viewportStyle.paddingBottom);
    const availableWidth = Math.max(1, modalViewport.clientWidth - horizontalPadding);
    const availableHeight = Math.max(1, modalViewport.clientHeight - verticalPadding);
    const fitScale = Math.min(
      availableWidth / modalImage.naturalWidth,
      availableHeight / modalImage.naturalHeight,
      1
    );
    const width = Math.max(1, Math.round(modalImage.naturalWidth * fitScale * modalZoom));
    const height = Math.max(1, Math.round(modalImage.naturalHeight * fitScale * modalZoom));
    modalImage.style.width = `${width}px`;
    modalImage.style.height = `${height}px`;
    modalViewport.classList.toggle(
      'is-zoomed',
      width > availableWidth || height > availableHeight
    );
    if (modalZoomLabel) modalZoomLabel.textContent = `${Math.round(modalZoom * 100)}%`;
    requestAnimationFrame(() => {
      if (preserveCenter) {
        modalViewport.scrollLeft = previousCenterX * modalViewport.scrollWidth - modalViewport.clientWidth / 2;
        modalViewport.scrollTop = previousCenterY * modalViewport.scrollHeight - modalViewport.clientHeight / 2;
      } else {
        modalViewport.scrollLeft = 0;
        modalViewport.scrollTop = 0;
      }
    });
  };

  const closeModal = () => {
    if (!modal) return;
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    modal.setAttribute('inert', '');
    document.body.classList.remove('modal-open');
    modalImage?.removeAttribute('style');
    modalViewport?.classList.remove('is-zoomed');
    if (modalTrigger instanceof HTMLElement) modalTrigger.focus();
    modalTrigger = null;
  };

  const openModal = (trigger) => {
    if (!modal || !modalImage || !modalContent || !modalViewport) return;
    const source = trigger.getAttribute('data-image-modal');
    if (!source) return;
    const image = trigger.querySelector('img');
    modalTrigger = trigger;
    modalImage.src = source;
    modalImage.alt = image?.alt || 'Image preview';
    if (modalName) modalName.textContent = image?.alt || 'Image preview';
    modalZoom = 1;
    modalImage.onload = () => updateModalZoom(1, false);
    modal.removeAttribute('inert');
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
    modalClose?.focus();
    if (modalImage.complete) requestAnimationFrame(() => updateModalZoom(1, false));
  };

  if (modal && modalImage && modalContent) {
    document.querySelectorAll('[data-image-modal]').forEach((trigger) => {
      trigger.addEventListener('click', () => openModal(trigger));
    });
    modalClose?.addEventListener('click', closeModal);
    modalBackdrop?.addEventListener('click', closeModal);
    modalZoomOut?.addEventListener('click', () => updateModalZoom(modalZoom - 0.25));
    modalZoomIn?.addEventListener('click', () => updateModalZoom(modalZoom + 0.25));
    modalZoomReset?.addEventListener('click', () => updateModalZoom(1, false));
    modalViewport?.addEventListener('dblclick', () => updateModalZoom(modalZoom > 1 ? 1 : 2));
    modalViewport?.addEventListener('wheel', (event) => {
      if (!event.ctrlKey && !event.metaKey) return;
      event.preventDefault();
      updateModalZoom(modalZoom + (event.deltaY < 0 ? 0.25 : -0.25));
    }, { passive: false });
    modal.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        closeModal();
        return;
      }
      if (event.key === '+' || event.key === '=') {
        event.preventDefault();
        updateModalZoom(modalZoom + 0.25);
        return;
      }
      if (event.key === '-') {
        event.preventDefault();
        updateModalZoom(modalZoom - 0.25);
        return;
      }
      if (event.key === '0') {
        event.preventDefault();
        updateModalZoom(1, false);
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
    window.addEventListener('resize', () => {
      if (modal.classList.contains('is-open')) updateModalZoom(modalZoom, false);
    }, { passive: true });
  }

  window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && mobileNav?.classList.contains('is-open')) closeMobileNav();
  });
});
