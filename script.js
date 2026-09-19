document.addEventListener('DOMContentLoaded', () => {
  const translate = value => window.portfolioI18n?.translate(value) || value;
  const year = document.getElementById('year');
  if (year) year.textContent = String(new Date().getFullYear());

  const header = document.querySelector('.site-header');
  if (header && document.body.classList.contains('home')) {
    const hero = document.querySelector('.entry-hero, .hero');
    let ticking = false;
    const updateHeader = () => {
      const heroEnd = hero ? Math.max(0, hero.offsetHeight - window.innerHeight) : 24;
      header.classList.toggle('is-visible', window.scrollY > heroEnd + 24);
      ticking = false;
    };
    updateHeader();
    window.addEventListener('scroll', () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(updateHeader);
    }, { passive: true });
  }

  const aiField = document.querySelector('[data-ai-field]');
  if (aiField) {
    const canvas = aiField.querySelector('canvas');
    const context = canvas?.getContext('2d');
    const hero = aiField.closest('.hero');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const finePointer = window.matchMedia('(pointer: fine)').matches;

    if (canvas && context && hero) {
      const streamCount = 8;
      const particleCount = 38;
      const particles = [];
      let seed = 4079;
      const random = () => {
        seed = (seed * 16807) % 2147483647;
        return (seed - 1) / 2147483646;
      };

      for (let index = 0; index < particleCount; index += 1) {
        particles.push({
          stream: Math.floor(random() * streamCount),
          offset: random(),
          speed: 0.52 + random() * 0.72,
          size: 0.8 + random() * 1.8,
          phase: random() * Math.PI * 2,
        });
      }

      let width = 1;
      let height = 1;
      let pixelRatio = 1;
      let frame = 0;
      let visible = true;
      let pointerX = 1;
      let pointerY = 1;
      let targetPointerX = 1;
      let targetPointerY = 1;
      let hasPointer = false;

      const resize = () => {
        const bounds = aiField.getBoundingClientRect();
        width = Math.max(1, bounds.width);
        height = Math.max(1, bounds.height);
        pixelRatio = Math.min(window.devicePixelRatio || 1, 1.75);
        canvas.width = Math.round(width * pixelRatio);
        canvas.height = Math.round(height * pixelRatio);
        context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
        if (!hasPointer) {
          pointerX = width * 0.76;
          pointerY = height * 0.5;
          targetPointerX = pointerX;
          targetPointerY = pointerY;
        }
      };

      const pointOnStream = (stream, progress, elapsed, drift = 0) => {
        const lane = streamCount === 1 ? 0.5 : stream / (streamCount - 1);
        let x = progress * width * 1.28 - width * 0.14;
        let y = height * (0.17 + lane * 0.66);
        const amplitude = height * (0.028 + Math.abs(lane - 0.5) * 0.025);
        y += Math.sin(progress * Math.PI * 2.15 + elapsed * 0.00024 + stream * 0.76) * amplitude;
        y += Math.sin(progress * Math.PI * 4.4 - elapsed * 0.00013 + stream * 1.21) * height * 0.012;
        x += Math.sin(progress * Math.PI * 2 + elapsed * 0.00017 + stream) * width * 0.012;
        y += drift;

        const deltaX = x - pointerX;
        const deltaY = y - pointerY;
        const radius = Math.max(170, Math.min(width, height) * 0.3);
        const influence = Math.exp(-(deltaX * deltaX + deltaY * deltaY) / (radius * radius));
        const direction = stream % 2 === 0 ? 1 : -1;
        x += -deltaY * influence * 0.1 * direction;
        y += deltaX * influence * 0.12 * direction;

        const parallaxX = (pointerX / width - 0.5) * (10 + lane * 14);
        const parallaxY = (pointerY / height - 0.5) * (5 + lane * 8);
        return { x: x + parallaxX, y: y + parallaxY, influence };
      };

      const draw = (elapsed = 0) => {
        if (!finePointer && !reducedMotion) {
          targetPointerX = width * (0.74 + Math.sin(elapsed * 0.00022) * 0.1);
          targetPointerY = height * (0.5 + Math.cos(elapsed * 0.00017) * 0.16);
        }
        pointerX += (targetPointerX - pointerX) * 0.055;
        pointerY += (targetPointerY - pointerY) * 0.055;

        context.clearRect(0, 0, width, height);

        const glow = context.createRadialGradient(pointerX, pointerY, 0, pointerX, pointerY, Math.max(width, height) * 0.34);
        glow.addColorStop(0, 'rgba(24, 119, 255, .13)');
        glow.addColorStop(0.42, 'rgba(24, 119, 255, .045)');
        glow.addColorStop(1, 'rgba(24, 119, 255, 0)');
        context.fillStyle = glow;
        context.fillRect(0, 0, width, height);

        const lineGradient = context.createLinearGradient(width * 0.12, 0, width, 0);
        lineGradient.addColorStop(0, 'rgba(80, 146, 255, 0)');
        lineGradient.addColorStop(0.28, 'rgba(80, 146, 255, .16)');
        lineGradient.addColorStop(0.72, 'rgba(130, 191, 255, .48)');
        lineGradient.addColorStop(1, 'rgba(220, 238, 255, .12)');

        context.globalCompositeOperation = 'lighter';
        for (let stream = 0; stream < streamCount; stream += 1) {
          context.beginPath();
          const samples = 74;
          for (let sample = 0; sample <= samples; sample += 1) {
            const point = pointOnStream(stream, sample / samples, elapsed);
            if (sample === 0) context.moveTo(point.x, point.y);
            else context.lineTo(point.x, point.y);
          }
          context.strokeStyle = lineGradient;
          context.lineWidth = 0.65 + stream * 0.075;
          context.shadowColor = 'rgba(38, 124, 255, .38)';
          context.shadowBlur = stream % 3 === 0 ? 10 : 4;
          context.stroke();
        }
        context.shadowBlur = 0;

        particles.forEach((particle) => {
          const progress = reducedMotion
            ? particle.offset
            : (particle.offset + elapsed * 0.000035 * particle.speed) % 1;
          const drift = Math.sin(elapsed * 0.00045 + particle.phase) * height * 0.006;
          const point = pointOnStream(particle.stream, progress, elapsed, drift);
          const fadeIn = Math.min(1, progress * 7);
          const fadeOut = Math.min(1, (1 - progress) * 7);
          const alpha = Math.max(0, Math.min(fadeIn, fadeOut)) * (0.35 + point.influence * 0.52);
          const radius = particle.size * (0.82 + point.influence * 0.7);

          context.beginPath();
          context.arc(point.x, point.y, radius * 4.2, 0, Math.PI * 2);
          context.fillStyle = 'rgba(42, 132, 255, ' + (alpha * 0.08) + ')';
          context.fill();

          context.beginPath();
          context.arc(point.x, point.y, radius, 0, Math.PI * 2);
          context.fillStyle = 'rgba(205, 231, 255, ' + alpha + ')';
          context.shadowColor = 'rgba(65, 145, 255, .9)';
          context.shadowBlur = 9 + point.influence * 12;
          context.fill();
          context.shadowBlur = 0;
        });
        context.globalCompositeOperation = 'source-over';

        if (!reducedMotion && visible) frame = window.requestAnimationFrame(draw);
      };

      resize();
      draw(reducedMotion ? 3400 : 0);

      if ('ResizeObserver' in window) {
        const resizeObserver = new ResizeObserver(() => {
          resize();
          if (reducedMotion) draw(3400);
        });
        resizeObserver.observe(aiField);
      } else {
        window.addEventListener('resize', resize, { passive: true });
      }

      if (finePointer && !reducedMotion) {
        hero.addEventListener('pointermove', (event) => {
          const bounds = aiField.getBoundingClientRect();
          targetPointerX = event.clientX - bounds.left;
          targetPointerY = event.clientY - bounds.top;
          hasPointer = true;
        });
        hero.addEventListener('pointerleave', () => {
          targetPointerX = width * 0.76;
          targetPointerY = height * 0.5;
          hasPointer = false;
        });
      }

      if (!reducedMotion && 'IntersectionObserver' in window) {
        const fieldObserver = new IntersectionObserver((entries) => {
          const nextVisible = entries.some((entry) => entry.isIntersecting);
          if (nextVisible === visible) return;
          visible = nextVisible;
          if (visible && !frame) frame = window.requestAnimationFrame(draw);
          if (!visible && frame) {
            window.cancelAnimationFrame(frame);
            frame = 0;
          }
        }, { threshold: 0.05 });
        fieldObserver.observe(hero);
      }
    }
  }
  const blueprint = document.querySelector('[data-hero-blueprint]');
  if (blueprint) {
    const modules = Array.from(blueprint.querySelectorAll('[data-blueprint-module]'));
    const indexLabel = blueprint.querySelector('[data-blueprint-index]');
    const detail = blueprint.querySelector('[data-blueprint-detail]');

    const selectModule = (module) => {
      modules.forEach((item) => {
        const selected = item === module;
        item.classList.toggle('is-active', selected);
        item.setAttribute('aria-pressed', String(selected));
      });
      if (indexLabel) indexLabel.textContent = module.dataset.index || '';
      if (detail) detail.textContent = module.dataset.detail || '';
    };

    modules.forEach((module) => {
      module.addEventListener('click', () => selectModule(module));
      module.addEventListener('focus', () => selectModule(module));
    });

    const supportsPointerDetail = window.matchMedia('(pointer: fine)').matches
      && !window.matchMedia('(prefers-reduced-motion: reduce)').matches
      && window.matchMedia('(min-width: 961px)').matches;
    if (supportsPointerDetail) {
      let pointerFrame = 0;
      blueprint.addEventListener('pointermove', (event) => {
        const bounds = blueprint.getBoundingClientRect();
        const horizontal = (event.clientX - bounds.left) / bounds.width - 0.5;
        const vertical = (event.clientY - bounds.top) / bounds.height - 0.5;
        window.cancelAnimationFrame(pointerFrame);
        pointerFrame = window.requestAnimationFrame(() => {
          blueprint.style.setProperty('--blueprint-rx', `${vertical * -3.2}deg`);
          blueprint.style.setProperty('--blueprint-ry', `${horizontal * 4.2}deg`);
        });
      });
      blueprint.addEventListener('pointerleave', () => {
        blueprint.style.setProperty('--blueprint-rx', '0deg');
        blueprint.style.setProperty('--blueprint-ry', '0deg');
      });
    }
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
    toggle.setAttribute('aria-label', translate('Open navigation'));
    document.body.classList.remove('nav-open');
    if (restoreFocus) toggle.focus();
  };

  const openMobileNav = () => {
    if (!mobileNav || !toggle) return;
    mobileNav.removeAttribute('inert');
    mobileNav.classList.add('is-open');
    mobileNav.setAttribute('aria-hidden', 'false');
    toggle.setAttribute('aria-expanded', 'true');
    toggle.setAttribute('aria-label', translate('Close navigation'));
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

  document.querySelectorAll('[data-project-slideshow]').forEach((slideshow) => {
    const slides = Array.from(slideshow.querySelectorAll('img'));
    const dots = Array.from(slideshow.querySelectorAll('.card-slideshow__dots span'));
    const currentLabel = slideshow.querySelector('[data-slideshow-current]');
    const card = slideshow.closest('.card');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const interval = Math.max(3000, Number(slideshow.dataset.interval) || 4400);
    if (slides.length < 2 || dots.length !== slides.length) return;

    let current = 0;
    let timer = 0;
    let isVisible = false;
    let isPaused = false;
    let hasPreloaded = false;

    const showSlide = (index) => {
      current = (index + slides.length) % slides.length;
      slides.forEach((slide, slideIndex) => {
        const active = slideIndex === current;
        slide.classList.toggle('is-active', active);
        slide.setAttribute('aria-hidden', String(!active));
      });
      dots.forEach((dot, dotIndex) => dot.classList.toggle('is-active', dotIndex === current));
      if (currentLabel) currentLabel.textContent = String(current + 1).padStart(2, '0');
    };

    const stop = () => {
      window.clearTimeout(timer);
      timer = 0;
    };

    const schedule = () => {
      stop();
      if (reducedMotion || !isVisible || isPaused || document.hidden) return;
      timer = window.setTimeout(() => {
        showSlide(current + 1);
        schedule();
      }, interval);
    };

    const preloadSlides = () => {
      if (hasPreloaded) return;
      hasPreloaded = true;
      slides.slice(1).forEach((slide) => {
        const preload = new Image();
        preload.src = slide.currentSrc || slide.src;
      });
    };

    showSlide(0);
    if (reducedMotion) return;

    const visibilityObserver = 'IntersectionObserver' in window
      ? new IntersectionObserver((entries) => {
        isVisible = entries.some((entry) => entry.isIntersecting);
        if (isVisible) preloadSlides();
        schedule();
      }, { threshold: 0.3 })
      : null;

    if (visibilityObserver) visibilityObserver.observe(slideshow);
    else {
      isVisible = true;
      preloadSlides();
      schedule();
    }

    card?.addEventListener('mouseenter', () => {
      isPaused = true;
      stop();
    });
    card?.addEventListener('mouseleave', () => {
      isPaused = false;
      schedule();
    });
    card?.addEventListener('focusin', () => {
      isPaused = true;
      stop();
    });
    card?.addEventListener('focusout', () => {
      window.requestAnimationFrame(() => {
        isPaused = Boolean(card.contains(document.activeElement));
        schedule();
      });
    });
    document.addEventListener('visibilitychange', schedule);
  });

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

  document.querySelectorAll('[data-product-tour]').forEach((tour) => {
    const tabs = Array.from(tour.querySelectorAll('[data-tour-index]'));
    const panel = tour.querySelector('[role="tabpanel"]');
    const imageButton = tour.querySelector('[data-tour-image-button]');
    const image = tour.querySelector('[data-tour-image]');
    const title = tour.querySelector('[data-tour-title]');
    const copy = tour.querySelector('[data-tour-copy]');
    const count = tour.querySelector('[data-tour-count]');
    const previous = tour.querySelector('[data-tour-prev]');
    const next = tour.querySelector('[data-tour-next]');
    if (!tabs.length || !panel || !imageButton || !image || !title || !copy || !count) return;

    let current = 0;
    let transitionTimer = 0;
    tabs.forEach((tab) => {
      const preload = new Image();
      preload.src = tab.dataset.imageSrc || '';
    });

    const selectScreen = (index, moveFocus = false) => {
      const normalizedIndex = (index + tabs.length) % tabs.length;
      const tab = tabs[normalizedIndex];
      if (!tab) return;
      current = normalizedIndex;
      tabs.forEach((item, itemIndex) => {
        item.setAttribute('aria-selected', String(itemIndex === current));
        item.tabIndex = itemIndex === current ? 0 : -1;
      });
      panel.setAttribute('aria-labelledby', tab.id);
      window.clearTimeout(transitionTimer);
      tour.classList.add('is-changing');
      transitionTimer = window.setTimeout(() => {
        const source = tab.dataset.imageSrc || '';
        const alt = tab.dataset.imageAlt || '';
        image.src = source;
        image.alt = alt;
        imageButton.setAttribute('data-image-modal', source);
        const screenTitle = tab.dataset.title || 'product';
        imageButton.setAttribute('aria-label', document.documentElement.lang === 'tr' ? `${screenTitle} ekranını aç` : `Open the ${screenTitle} screen`);
        title.textContent = tab.dataset.title || '';
        copy.textContent = tab.dataset.copy || '';
        count.textContent = `${String(current + 1).padStart(2, '0')} / ${String(tabs.length).padStart(2, '0')}`;
        requestAnimationFrame(() => tour.classList.remove('is-changing'));
      }, 130);
      tab.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      if (moveFocus) tab.focus();
    };

    tabs.forEach((tab, index) => {
      tab.tabIndex = index === 0 ? 0 : -1;
      tab.addEventListener('click', () => selectScreen(index));
      tab.addEventListener('keydown', (event) => {
        if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
        event.preventDefault();
        if (event.key === 'Home') selectScreen(0, true);
        else if (event.key === 'End') selectScreen(tabs.length - 1, true);
        else selectScreen(index + (event.key === 'ArrowRight' ? 1 : -1), true);
      });
    });
    previous?.addEventListener('click', () => selectScreen(current - 1));
    next?.addEventListener('click', () => selectScreen(current + 1));
    window.addEventListener('portfolio-language-change', () => selectScreen(current));
  });

  document.querySelectorAll('[data-model-lab]').forEach((lab) => {
    const tabs = Array.from(lab.querySelectorAll('[data-model-target]'));
    if (!tabs.length) return;
    const selectModel = (tab, moveFocus = false) => {
      tabs.forEach((item) => {
        const selected = item === tab;
        item.setAttribute('aria-selected', String(selected));
        item.tabIndex = selected ? 0 : -1;
        const panel = document.getElementById(item.dataset.modelTarget || '');
        if (!panel) return;
        panel.hidden = !selected;
        panel.classList.remove('is-entering');
        if (selected) requestAnimationFrame(() => panel.classList.add('is-entering'));
      });
      if (moveFocus) tab.focus();
    };
    tabs.forEach((tab, index) => {
      tab.tabIndex = index === 0 ? 0 : -1;
      tab.addEventListener('click', () => selectModel(tab));
      tab.addEventListener('keydown', (event) => {
        if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
        event.preventDefault();
        const nextIndex = event.key === 'Home'
          ? 0
          : event.key === 'End'
            ? tabs.length - 1
            : (index + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
        selectModel(tabs[nextIndex], true);
      });
    });
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
    if (modalName) modalName.textContent = image?.alt || translate('Image preview');
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
