(function () {
  document.body.classList.add('js-enabled');

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const body = document.body;
  const loader = document.querySelector('.page-loader');
  const progress = document.querySelector('.scroll-progress');
  const backToTop = document.querySelector('.back-to-top');
  const nav = document.querySelector('.site-header');
  let scrollFrame = 0;
  let pointerFrame = 0;

  function finishLoading() {
    body.classList.add('page-ready');
    window.setTimeout(function () {
      if (loader) {
        loader.remove();
      }
    }, 500);
  }

  if (!reducedMotion && loader) {
    window.setTimeout(finishLoading, 360);
  } else {
    finishLoading();
  }

  if (!reducedMotion && 'IntersectionObserver' in window) {
    const revealTargets = document.querySelectorAll(
      '.hero .eyebrow, .hero h1, .hero-copy > p, .hero-actions, .hero-meta, .profile-card, ' +
      '.section-label, .section-header, .feature-card, .cert-card, .empty-state, .info-card, ' +
      '.resume-card, .contact-card, .tech-item, .project-card, .project-image, .project-tags span, ' +
      '.workflow-steps li, .site-footer .container'
    );
    const revealObserver = new IntersectionObserver(function (entries, observer) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.12,
      rootMargin: '0px 0px -36px 0px'
    });

    revealTargets.forEach(function (element) {
      if (window.anime && element.matches('.profile-card, .feature-card, .cert-card, .empty-state')) {
        return;
      }

      const siblingIndex = Array.prototype.indexOf.call(element.parentElement.children, element);
      element.style.setProperty('--reveal-delay', Math.min(siblingIndex * 65, 260) + 'ms');
      element.classList.add('reveal');
      revealObserver.observe(element);
    });
  }

  function updateScrollState() {
    const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollRatio = scrollableHeight > 0 ? window.scrollY / scrollableHeight : 0;

    if (progress) {
      progress.style.transform = 'scaleX(' + Math.min(Math.max(scrollRatio, 0), 1) + ')';
    }

    if (nav) {
      nav.classList.toggle('is-scrolled', window.scrollY > 12);
    }

    if (backToTop) {
      backToTop.classList.toggle('is-visible', window.scrollY > 420);
    }

    scrollFrame = 0;
  }

  window.addEventListener('scroll', function () {
    if (!scrollFrame) {
      scrollFrame = window.requestAnimationFrame(updateScrollState);
    }
  }, { passive: true });
  updateScrollState();

  if (!reducedMotion && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    document.addEventListener('pointermove', function (event) {
      if (!pointerFrame) {
        pointerFrame = window.requestAnimationFrame(function () {
          body.style.setProperty('--pointer-x', event.clientX + 'px');
          body.style.setProperty('--pointer-y', event.clientY + 'px');
          pointerFrame = 0;
        });
      }
    }, { passive: true });
  }

  if (backToTop) {
    backToTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: reducedMotion ? 'auto' : 'smooth' });
    });
  }

  const projectLightbox = document.querySelector('.project-lightbox');
  if (projectLightbox && typeof projectLightbox.showModal === 'function') {
    const previewImage = projectLightbox.querySelector('img');
    const closeButton = projectLightbox.querySelector('.project-lightbox-close');

    document.addEventListener('click', function (event) {
      const imageLink = event.target.closest('.project-image a');
      if (!imageLink || event.button !== 0 || event.metaKey || event.ctrlKey ||
          event.shiftKey || event.altKey) {
        return;
      }

      event.preventDefault();
      previewImage.src = imageLink.href;
      previewImage.alt = imageLink.querySelector('img').alt;
      projectLightbox.showModal();
    });

    closeButton.addEventListener('click', function () {
      projectLightbox.close();
    });

    projectLightbox.addEventListener('click', function (event) {
      if (event.target === projectLightbox) {
        projectLightbox.close();
      }
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && projectLightbox.open) {
        projectLightbox.close();
      }
    });
  }

  document.addEventListener('click', function (event) {
    const link = event.target.closest('a[href]');
    if (!link || reducedMotion || event.defaultPrevented || event.button !== 0 ||
        event.metaKey || event.ctrlKey || event.shiftKey || event.altKey ||
        link.target || link.hasAttribute('download')) {
      return;
    }

    const destination = new URL(link.href, window.location.href);
    const isInternalPageNavigation =
      destination.origin === window.location.origin &&
      destination.pathname !== window.location.pathname &&
      !destination.pathname.endsWith('.pdf');

    if (isInternalPageNavigation) {
      event.preventDefault();
      body.classList.add('page-exit');
      window.setTimeout(function () {
        window.location.assign(destination.href);
      }, 150);
    }
  });

  window.addEventListener('pageshow', function () {
    body.classList.remove('page-exit');
  });
}());
