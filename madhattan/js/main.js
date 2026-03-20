/* ============================================================
   MADHATTAN CO — MAIN JAVASCRIPT
   Nav · Reveal · Ticker · Work cards · Lightbox
   ============================================================ */

'use strict';

/* ── NAV SCROLL BEHAVIOR ─────────────────────────────────── */
(function initNav() {
  const nav = document.querySelector('.nav');
  if (!nav) return;

  let lastScroll = 0;
  let ticking = false;

  const update = () => {
    const scroll = window.scrollY;
    if (scroll > 40) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
    lastScroll = scroll;
    ticking = false;
  };

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(update);
      ticking = true;
    }
  }, { passive: true });

  // Set active nav link based on current page
  const links = nav.querySelectorAll('.nav-link');
  const current = window.location.pathname.split('/').pop() || 'index.html';
  links.forEach(link => {
    const href = link.getAttribute('href') || '';
    if (href === current || (current === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });
})();

/* ── MOBILE NAV TOGGLE ───────────────────────────────────── */
/*
 * The overlay is injected as a direct <body> child so it is never
 * constrained by the nav's backdrop-filter containing block.
 * z-index 9050 puts it above the vignette (8990) but below the
 * nav bar (9100), so the hamburger/X stays tappable.
 */
(function initMobileNav() {
  var btn = document.querySelector('.nav-hamburger');
  if (!btn) return;

  // Build overlay panel
  var panel = document.createElement('div');
  panel.className = 'mobile-nav-panel';
  panel.setAttribute('aria-hidden', 'true');

  var navData = [
    { label: 'About',    href: 'about.html'    },
    { label: 'Projects', href: 'projects.html' },
    { label: 'Services', href: 'services.html' },
    { label: 'Contact',  href: 'contact.html'  },
  ];

  navData.forEach(function (item) {
    var a = document.createElement('a');
    a.href = item.href;
    a.className = 'mobile-nav-link';
    a.textContent = item.label;
    panel.appendChild(a);
  });

  var cta = document.createElement('a');
  cta.href = 'contact.html';
  cta.className = 'btn btn-primary btn-glow-edges';
  cta.style.marginTop = '1.5rem';
  cta.textContent = 'Book a Call';
  panel.appendChild(cta);

  document.body.appendChild(panel);

  function openMenu() {
    panel.classList.add('open');
    panel.setAttribute('aria-hidden', 'false');
    btn.classList.add('open');
    btn.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    panel.classList.remove('open');
    panel.setAttribute('aria-hidden', 'true');
    btn.classList.remove('open');
    btn.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  btn.addEventListener('click', function () {
    panel.classList.contains('open') ? closeMenu() : openMenu();
  });

  panel.querySelectorAll('a').forEach(function (a) {
    a.addEventListener('click', closeMenu);
  });
})();

/* ── SCROLL REVEAL ────────────────────────────────────────── */
(function initReveal() {
  const elements = document.querySelectorAll('.reveal');
  if (!elements.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px'
  });

  elements.forEach(el => observer.observe(el));
})();

/* ── TICKER DUPLICATION (text ticker only — logo ticker is pre-duplicated in HTML) ── */
(function initTicker() {
  const track = document.querySelector('.ticker:not(.logo-ticker) .ticker-track');
  if (!track) return;
  const clone = track.cloneNode(true);
  track.parentElement.appendChild(clone);
})();

/* ── WORK CARD INTERACTIONS ──────────────────────────────── */
(function initWorkCards() {
  const cards = document.querySelectorAll('.work-card');
  if (!cards.length) return;

  cards.forEach(card => {
    const bg = card.querySelector('.work-card-bg');

    card.addEventListener('mousemove', (e) => {
      if (!bg) return;
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      bg.style.transformOrigin = 'center';
      bg.style.transform = `scale(1.06) translate(${x * -8}px, ${y * -8}px)`;
    });

    card.addEventListener('mouseleave', () => {
      if (bg) bg.style.transform = '';
    });
  });
})();

/* ── LIGHTBOX ─────────────────────────────────────────────── */
(function initLightbox() {
  const lightbox = document.getElementById('lightbox');
  if (!lightbox) return;

  const videoEl   = lightbox.querySelector('.lightbox-video');
  const iframeEl  = lightbox.querySelector('.lightbox-iframe');
  const closeBtn  = lightbox.querySelector('.lightbox-close');
  const titleEl   = lightbox.querySelector('.lightbox-title');
  const metaEl    = lightbox.querySelector('.lightbox-client');
  const projectEl = lightbox.querySelector('.lightbox-project-link');

  const open = (src, title, client, isYoutube, projectHref) => {
    if (isYoutube) {
      if (iframeEl) {
        iframeEl.src = 'https://www.youtube.com/embed/' + src + '?autoplay=1&rel=0';
        iframeEl.style.display = 'block';
      }
      if (videoEl) videoEl.style.display = 'none';
    } else {
      if (videoEl) {
        videoEl.src = src;
        videoEl.play();
        videoEl.style.display = 'block';
      }
      if (iframeEl) iframeEl.style.display = 'none';
    }
    if (titleEl)   titleEl.textContent = title || '';
    if (metaEl)    metaEl.textContent  = client || '';
    if (projectEl) {
      if (projectHref) {
        projectEl.href = projectHref;
        projectEl.style.display = '';
      } else {
        projectEl.style.display = 'none';
      }
    }
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
  };

  const close = () => {
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
    if (videoEl)  { videoEl.pause(); videoEl.src = ''; videoEl.style.display = 'block'; }
    if (iframeEl) { iframeEl.src = ''; iframeEl.style.display = 'none'; }
  };

  // Local video triggers
  document.querySelectorAll('[data-lightbox-src]').forEach(trigger => {
    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      open(trigger.dataset.lightboxSrc, trigger.dataset.lightboxTitle, trigger.dataset.lightboxClient, false, trigger.dataset.lightboxHref);
    });
  });

  // YouTube triggers
  document.querySelectorAll('[data-lightbox-youtube]').forEach(trigger => {
    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      open(trigger.dataset.lightboxYoutube, trigger.dataset.lightboxTitle, trigger.dataset.lightboxClient, true, trigger.dataset.lightboxHref);
    });
  });

  if (closeBtn) closeBtn.addEventListener('click', close);
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) close();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') close();
  });
})();

/* ── PROJECT FILTER ───────────────────────────────────────── */
(function initFilter() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const cards = document.querySelectorAll('.project-card');
  if (!filterBtns.length || !cards.length) return;

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.dataset.filter || 'all';

      cards.forEach(card => {
        const cat = card.dataset.category || '';
        const show = filter === 'all' || cat === filter;

        if (show) {
          card.style.display = '';
          requestAnimationFrame(() => {
            card.style.opacity = '1';
            card.style.transform = '';
            card.style.pointerEvents = '';
          });
        } else {
          card.style.opacity = '0';
          card.style.transform = 'scale(0.97)';
          card.style.pointerEvents = 'none';
          setTimeout(() => {
            if (card.style.opacity === '0') card.style.display = 'none';
          }, 280);
        }
      });
    });
  });
})();

/* ── CONTACT FORM ─────────────────────────────────────────── */
(function initContactForm() {
  const form = document.querySelector('.contact-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = form.querySelector('[type="submit"]');
    if (!btn) return;

    btn.textContent = 'Sending…';
    btn.disabled = true;

    // Simulate send delay (replace with real endpoint)
    setTimeout(() => {
      btn.textContent = 'Message Sent';
      btn.style.background = '#2a6b3a';
      form.reset();
    }, 1400);
  });
})();

/* ── CINEMATIC CURSOR TRAILER ─────────────────────────────── */
(function initCursorTrailer() {
  // Only on desktop
  if (window.matchMedia('(pointer: coarse)').matches) return;

  const dot = document.createElement('div');
  dot.style.cssText = `
    position: fixed;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: rgba(201,136,42,0.8);
    pointer-events: none;
    z-index: 99999;
    transform: translate(-50%,-50%);
    transition: opacity 0.3s ease;
    box-shadow: 0 0 10px rgba(255,107,0,0.5);
  `;

  const ring = document.createElement('div');
  ring.style.cssText = `
    position: fixed;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    border: 1px solid rgba(201,136,42,0.35);
    pointer-events: none;
    z-index: 99998;
    transform: translate(-50%,-50%);
    transition: width 0.3s ease, height 0.3s ease, border-color 0.3s ease;
  `;

  document.body.appendChild(dot);
  document.body.appendChild(ring);

  let mouseX = 0, mouseY = 0;
  let ringX = 0,  ringY  = 0;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    dot.style.left = mouseX + 'px';
    dot.style.top  = mouseY + 'px';
  });

  // Lazy-follow ring
  const animate = () => {
    ringX += (mouseX - ringX) * 0.12;
    ringY += (mouseY - ringY) * 0.12;
    ring.style.left = ringX + 'px';
    ring.style.top  = ringY + 'px';
    requestAnimationFrame(animate);
  };
  animate();

  // Scale up on interactive elements
  const hoverTargets = 'a, button, .work-card, .project-card, .filter-btn, .service-card';
  document.querySelectorAll(hoverTargets).forEach(el => {
    el.addEventListener('mouseenter', () => {
      ring.style.width  = '52px';
      ring.style.height = '52px';
      ring.style.borderColor = 'rgba(201,136,42,0.60)';
    });
    el.addEventListener('mouseleave', () => {
      ring.style.width  = '32px';
      ring.style.height = '32px';
      ring.style.borderColor = 'rgba(201,136,42,0.35)';
    });
  });
})();

/* ── HERO VIDEO — single looping video ────────────────────── */
(function initHeroReel() {
  const videoA = document.getElementById('heroVideoA');
  if (!videoA) return;

  videoA.src  = 'videos/hero.mp4';
  videoA.loop = true;
  videoA.load();
  videoA.addEventListener('canplaythrough', function onReady() {
    videoA.removeEventListener('canplaythrough', onReady);
    videoA.play().catch(() => {});
    videoA.style.opacity = '0.65';
  }, { once: true });
})();

/* ── HERO PARALLAX ────────────────────────────────────────── */
(function initHeroParallax() {
  const heroVideo = document.querySelector('.hero-video');
  if (!heroVideo) return;

  window.addEventListener('scroll', () => {
    const scroll = window.scrollY;
    if (scroll < window.innerHeight) {
      heroVideo.style.transform = `translateY(${scroll * 0.25}px)`;
    }
  }, { passive: true });
})();

/* ── LOGO HOVER PULSE ─────────────────────────────────────── */
(function initLogoPulse() {
  const logos = document.querySelectorAll('.logo-item');
  logos.forEach(logo => {
    logo.addEventListener('mouseenter', () => {
      logo.style.transform = 'translateY(-2px)';
      logo.style.transition = 'all 0.3s ease';
    });
    logo.addEventListener('mouseleave', () => {
      logo.style.transform = '';
    });
  });
})();

/* ── FEATURED WORKS CAPTION ──────────────────────────────── */
(function initWorksCaption() {
  const caption      = document.getElementById('worksCaption');
  const captionTitle = document.getElementById('worksCaptionTitle');
  const captionClient= document.getElementById('worksCaptionClient');
  if (!caption) return;

  document.querySelectorAll('.works-grid .work-card').forEach(card => {
    const video = card.querySelector('.work-card-video');

    card.addEventListener('mouseenter', () => {
      captionTitle.textContent  = card.dataset.title  || '';
      captionClient.textContent = card.dataset.client || '';
      caption.classList.add('visible');
      if (video) video.play().catch(() => {});
    });

    card.addEventListener('mouseleave', () => {
      caption.classList.remove('visible');
      if (video) { video.pause(); video.currentTime = 0; }
    });
  });
})();

/* ── TESTIMONIAL GLOW BORDER ─────────────────────────────── */
(function initGlowingCards() {
  const wraps = document.querySelectorAll('.testimonial-card-wrap');
  if (!wraps.length) return;

  const targets = Array.from(wraps).map(el => ({ el, angle: 0 }));

  document.addEventListener('pointermove', (e) => {
    targets.forEach(t => {
      const r = t.el.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const near =
        e.clientX > r.left - 80 && e.clientX < r.right + 80 &&
        e.clientY > r.top - 80 && e.clientY < r.bottom + 80;

      t.el.style.setProperty('--active', near ? '1' : '0');
      if (!near) return;

      const target = Math.atan2(e.clientY - cy, e.clientX - cx) * (180 / Math.PI) + 90;
      const diff = ((target - t.angle + 180) % 360) - 180;
      t.angle += diff * 0.15;
      t.el.style.setProperty('--start', String(t.angle));
    });
  });
})();
