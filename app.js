/* ─────────────────────────────────────────────────────────
   CARDINALE PASTURA — app.js
   Lenis smooth scroll + GSAP ScrollTrigger + intro curtain
   ───────────────────────────────────────────────────────── */

(() => {
  'use strict';

  document.documentElement.classList.remove('no-js');

  /* ═══════════════════════════════════
     UTILS
     ═══════════════════════════════════ */
  const lerp = (a, b, t) => a + (b - a) * t;
  const hasFinePointer = window.matchMedia('(pointer: fine)').matches;
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ═══════════════════════════════════
     LENIS — smooth scroll
     ═══════════════════════════════════ */
  const lenis = new Lenis({
    duration: 0.9,
    easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    wheelMultiplier: 1.1,
  });

  /* Integrar Lenis con GSAP ticker */
  gsap.ticker.add(time => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);

  /* ═══════════════════════════════════
     WORD SPLIT — data-word-split
     ═══════════════════════════════════ */
  function splitWords(el) {
    const words = el.textContent.trim().split(/\s+/);
    el.textContent = '';
    words.forEach((word, i) => {
      const wrap = document.createElement('span');
      wrap.className = 'word-wrap';
      const inner = document.createElement('span');
      inner.className = 'word';
      inner.textContent = word;
      wrap.appendChild(inner);
      el.appendChild(wrap);
      /* espacio entre palabras (salvo último) */
      if (i < words.length - 1) el.appendChild(document.createTextNode(' '));
    });
  }

  document.querySelectorAll('[data-word-split]').forEach(el => splitWords(el));

  /* ═══════════════════════════════════
     INTRO CURTAIN — GSAP (estilo CL)
     ═══════════════════════════════════ */
  const intro     = document.getElementById('page-intro');
  const curtains  = intro ? intro.querySelectorAll('.curtain') : [];
  const introLogo = intro ? intro.querySelector('.page-intro__logo') : null;

  if (intro && curtains.length && !prefersReduced) {
    /* Bloquear scroll hasta que termina el intro */
    lenis.stop();

    const tl = gsap.timeline({
      defaults: { ease: 'power3.inOut' },
      onComplete: () => {
        intro.style.display = 'none';
        lenis.start();
        triggerHeroReveals();
      },
    });

    /* Logo fade in → pausa → curtains caen */
    tl.fromTo(introLogo,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.9 }
    )
    .to({}, { duration: 0.8 }) /* pausa con el logo */
    .to(introLogo, { opacity: 0, duration: 0.4 }, '-=0.2')
    .to(curtains, {
      scaleY: 0,
      duration: 1.0,
      stagger: 0.06,
      ease: 'power4.inOut',
      transformOrigin: 'top',
    }, '-=0.1');
  } else {
    /* Sin animación: ocultar intro y disparar hero */
    if (intro) intro.style.display = 'none';
    triggerHeroReveals();
    lenis.start();
  }

  /* ═══════════════════════════════════
     HERO REVEALS — above the fold
     ═══════════════════════════════════ */
  function triggerHeroReveals() {
    /* El parallax hero no usa reveals on-load — lo maneja GSAP scroll-driven */
  }

  /* ═══════════════════════════════════
     SCROLL TRIGGERS — reveals
     ═══════════════════════════════════ */
  gsap.registerPlugin(ScrollTrigger);

  /* Sync Lenis → ScrollTrigger */
  lenis.on('scroll', ScrollTrigger.update);

  function setupScrollReveals() {
    /* reveal-up genérico (fuera del bento) */
    document.querySelectorAll('.reveal-up:not(.bento-hero .reveal-up)').forEach(el => {
      const d = parseInt(el.dataset.delay || '0', 10);
      ScrollTrigger.create({
        trigger: el,
        start: 'top 88%',
        once: true,
        onEnter: () => {
          setTimeout(() => el.classList.add('is-in'), d);
        },
      });
    });

    /* word-split fuera del bento */
    document.querySelectorAll('[data-word-split]:not(.bento-hero [data-word-split])').forEach(titleEl => {
      const words = titleEl.querySelectorAll('.word');
      ScrollTrigger.create({
        trigger: titleEl,
        start: 'top 85%',
        once: true,
        onEnter: () => {
          words.forEach((w, i) => {
            setTimeout(() => w.classList.add('is-in'), i * 75);
          });
        },
      });
    });

    /* word-reveal-inline fuera del bento */
    document.querySelectorAll('.word-reveal-inline:not(.bento-hero .word-reveal-inline)').forEach(el => {
      ScrollTrigger.create({
        trigger: el,
        start: 'top 88%',
        once: true,
        onEnter: () => el.classList.add('is-in'),
      });
    });

    /* Cards — wipe reveal */
    document.querySelectorAll('[data-reveal-card]').forEach(card => {
      ScrollTrigger.create({
        trigger: card,
        start: 'top 88%',
        once: true,
        onEnter: () => {
          const d = parseInt(getComputedStyle(card).getPropertyValue('--cd') || '0', 10);
          setTimeout(() => card.classList.add('is-in'), d);
        },
      });
    });

    /* Stats counter */
    const statsSection = document.querySelector('.nosotros__stats');
    if (statsSection) {
      ScrollTrigger.create({
        trigger: statsSection,
        start: 'top 75%',
        once: true,
        onEnter: () => animateCounters(),
      });
    }
  }

  setupScrollReveals();
  setupBentoHero();
  setupScrolltelling();
  setupAccordion();
  setupVelocityText();

  /* ═══════════════════════════════════
     CONTADOR ANIMADO
     ═══════════════════════════════════ */
  function animateCounters() {
    document.querySelectorAll('[data-count]').forEach(el => {
      const target   = parseInt(el.dataset.count, 10);
      const suffix   = el.dataset.suffix || '';
      const duration = 1600;
      const start    = performance.now();

      const tick = (now) => {
        const elapsed  = now - start;
        const progress = Math.min(elapsed / duration, 1);
        const eased    = 1 - Math.pow(1 - progress, 4);
        el.textContent = Math.round(eased * target) + suffix;
        if (progress < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
  }

  /* ═══════════════════════════════════
     BENTO HERO — scroll-driven
     ═══════════════════════════════════ */
  function setupBentoHero() {
    const bentoScroll = document.querySelector('.bento-scroll');
    const bentoCells  = document.querySelectorAll('.bento-cell');
    if (!bentoScroll || !bentoCells.length) return;

    const isMobile = window.innerWidth < 768;

    /* Cells: estado inicial pequeño/desplazado */
    gsap.fromTo(bentoCells,
      { x: isMobile ? '-15%' : '-35%', scale: 0.8 },
      {
        x: '0%',
        scale: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: bentoScroll,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 1.2,
        },
      }
    );
  }

  /* ═══════════════════════════════════
     PARALLAX INTERLUDE — 4 capas
     ═══════════════════════════════════ */
  function setupParallaxSection() {
    const wrap   = document.querySelector('.parallax-wrap');
    const layers = wrap?.querySelector('[data-parallax-layers]');
    if (!wrap || !layers) return;

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: wrap,
        start: 'top top',
        end: 'bottom top',
        scrub: true,
      },
    });

    [
      { layer: '1', yPercent: 65 },  /* fondo — movimiento máximo */
      { layer: '2', yPercent: 45 },  /* CARDINALE — movimiento medio */
      { layer: '3', yPercent: 35 },  /* PASTURA — movimiento medio */
      { layer: '4', yPercent: 8  },  /* retrato — casi fijo = primer plano */
    ].forEach((obj, idx) => {
      tl.to(
        layers.querySelectorAll(`[data-parallax-layer="${obj.layer}"]`),
        { yPercent: obj.yPercent, ease: 'none' },
        idx === 0 ? 0 : '<'   /* todos arrancan al mismo tiempo */
      );
    });
  }

  /* ═══════════════════════════════════
     PARALLAX — nosotros img
     ═══════════════════════════════════ */
  const parallaxImg = document.querySelector('[data-parallax-img] img');

  lenis.on('scroll', () => {
    if (parallaxImg && window.innerWidth > 960) {
      const rect     = parallaxImg.closest('[data-parallax-img]').getBoundingClientRect();
      const progress = -rect.top / window.innerHeight;
      parallaxImg.style.transform = `translateY(${progress * 60}px)`;
    }
  });

  /* ═══════════════════════════════════
     NAVBAR — scroll state
     ═══════════════════════════════════ */
  const nav = document.getElementById('nav');
  lenis.on('scroll', ({ scroll }) => {
    nav.classList.toggle('is-scrolled', scroll > 80);
  });

  /* ═══════════════════════════════════
     MOBILE MENU
     ═══════════════════════════════════ */
  const burger     = document.getElementById('burger');
  const mobileMenu = document.getElementById('mobile-menu');

  const setMenu = (open) => {
    document.body.classList.toggle('menu-open', open);
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    mobileMenu.setAttribute('aria-hidden', open ? 'false' : 'true');
    open ? lenis.stop() : lenis.start();
  };

  burger.addEventListener('click', () =>
    setMenu(!document.body.classList.contains('menu-open'))
  );
  mobileMenu.querySelectorAll('a').forEach(a =>
    a.addEventListener('click', () => setMenu(false))
  );
  window.addEventListener('resize', () => {
    if (window.innerWidth > 960 && document.body.classList.contains('menu-open'))
      setMenu(false);
  });

  /* ═══════════════════════════════════
     CURSOR PERSONALIZADO
     ═══════════════════════════════════ */
  if (hasFinePointer) {
    const cursor = document.getElementById('cursor');
    const dot    = cursor.querySelector('.cursor__dot');
    let tx = -100, ty = -100, cx = -100, cy = -100;

    document.addEventListener('mousemove', e => {
      tx = e.clientX; ty = e.clientY;
      cursor.classList.add('is-on');
    });
    document.addEventListener('mouseleave', () => cursor.classList.remove('is-on'));

    const tickCursor = () => {
      cx = lerp(cx, tx, 0.14);
      cy = lerp(cy, ty, 0.14);
      cursor.style.left = cx + 'px';
      cursor.style.top  = cy + 'px';
      requestAnimationFrame(tickCursor);
    };
    requestAnimationFrame(tickCursor);

    document.querySelectorAll('a, button, input, select, textarea, .card').forEach(el => {
      el.addEventListener('mouseenter', () => cursor.classList.add('is-hover'));
      el.addEventListener('mouseleave', () => cursor.classList.remove('is-hover'));
    });

    /* Cursor blanco en secciones oscuras */
    const darkSections = [
      document.getElementById('nosotros'),
      document.querySelector('.marquee'),
      document.querySelector('.footer'),
    ].filter(Boolean);

    const observeDark = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) cursor.classList.add('is-dark');
        else cursor.classList.remove('is-dark');
      });
    }, { threshold: 0.4 });

    darkSections.forEach(s => observeDark.observe(s));
  }

  /* ═══════════════════════════════════
     MAGNETIC BUTTONS
     ═══════════════════════════════════ */
  if (hasFinePointer) {
    document.querySelectorAll('.btn-magnetic').forEach(btn => {
      btn.addEventListener('mousemove', e => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top  - rect.height / 2;
        btn.style.transform = `translate(${x * 0.22}px, ${y * 0.28}px)`;
      });
      btn.addEventListener('mouseleave', () => { btn.style.transform = '' });
    });
  }

  /* ═══════════════════════════════════
     FORM — validación + éxito
     ═══════════════════════════════════ */
  const form        = document.getElementById('form');
  const formSuccess = document.getElementById('form-success');
  const formReset   = document.getElementById('form-reset');

  if (form) {
    form.addEventListener('submit', e => {
      e.preventDefault();
      const nameField  = form.querySelector('#f-name');
      const emailField = form.querySelector('#f-email');
      let valid = true;

      [nameField, emailField].forEach(field => {
        const isEmpty  = !field.value.trim();
        const badEmail = field.type === 'email' && !/.+@.+\..+/.test(field.value);
        if (isEmpty || badEmail) {
          field.style.borderBottomColor = '#c0392b';
          valid = false;
        } else {
          field.style.borderBottomColor = '';
        }
      });

      if (!valid) return;
      form.hidden = true;
      formSuccess.hidden = false;
    });
  }

  if (formReset) {
    formReset.addEventListener('click', () => {
      form.reset();
      form.hidden = false;
      formSuccess.hidden = true;
      form.querySelectorAll('input, textarea').forEach(f => {
        f.style.borderBottomColor = '';
      });
    });
  }

  /* ═══════════════════════════════════
     SMOOTH SCROLL — links internos
     ═══════════════════════════════════ */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      lenis.scrollTo(target, { offset: -72, duration: 1.4 });
    });
  });

  /* ═══════════════════════════════════
     ACCORDION DE PROYECTOS
     ═══════════════════════════════════ */
  function setupAccordion() {
    const items = document.querySelectorAll('[data-acc-item]');
    if (!items.length) return;

    items.forEach(item => {
      item.addEventListener('mouseenter', () => {
        items.forEach(el => el.classList.remove('accordion__item--active'));
        item.classList.add('accordion__item--active');
      });

      // Soporte teclado
      item.addEventListener('focus', () => {
        items.forEach(el => el.classList.remove('accordion__item--active'));
        item.classList.add('accordion__item--active');
      });

      // Mobile: primer tap expande, segundo tap navega al link
      item.addEventListener('click', e => {
        if (!item.classList.contains('accordion__item--active')) {
          e.preventDefault();
          items.forEach(el => el.classList.remove('accordion__item--active'));
          item.classList.add('accordion__item--active');
        }
      });
    });
  }

  /* ═══════════════════════════════════
     VELOCITY TEXT
     ═══════════════════════════════════ */
  function setupVelocityText() {
    const section = document.querySelector('.velocity-section');
    const text    = document.querySelector('.velocity-text');
    if (!section || !text) return;

    // Texto arranca 40vw a la derecha y termina 250vw a la izquierda
    // El trigger va de cuando entra al viewport hasta que sale — 100vh de sección = ~200vh de viaje total
    gsap.fromTo(text,
      { x: '40vw' },
      {
        x: '-260vw',
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
        },
      }
    );

    // Skew por velocidad de scroll
    let lastScroll = 0;
    gsap.ticker.add(() => {
      const currentScroll = window.scrollY;
      const vel = (currentScroll - lastScroll) * 0.08;
      const clamped = Math.max(-20, Math.min(20, vel));
      lastScroll = currentScroll;
      gsap.to(text, { skewX: clamped, duration: 0.4, ease: 'power1.out', overwrite: 'auto' });
    });
  }

  /* ═══════════════════════════════════
     SCROLLTELLING — canvas + 192 frames
     ═══════════════════════════════════ */
  function setupScrolltelling() {
    const canvas = document.getElementById('st-canvas');
    const track  = document.querySelector('.scrolltelling__track');
    if (!canvas || !track) return;

    const ctx    = canvas.getContext('2d');
    const TOTAL  = 192;
    const pad    = n => String(n).padStart(3, '0');

    let currentFrame = 0;
    const images     = new Array(TOTAL);
    let loadedCount  = 0;
    let triggered    = false;

    /* Resize canvas al viewport — respeta devicePixelRatio para pantallas Retina */
    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w   = window.innerWidth;
      const h   = window.innerHeight;
      canvas.width          = Math.round(w * dpr);
      canvas.height         = Math.round(h * dpr);
      canvas.style.width    = w + 'px';
      canvas.style.height   = h + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      renderFrame(currentFrame);
    }

    /* Dibujar frame con comportamiento cover (coordenadas CSS) */
    function renderFrame(idx) {
      const img = images[idx];
      if (!img?.complete || !img.naturalWidth) return;
      const cW = window.innerWidth;
      const cH = window.innerHeight;
      const r  = img.naturalWidth / img.naturalHeight;
      const cR = cW / cH;
      let dW, dH, dX, dY;
      if (r > cR) { dH = cH; dW = dH * r; dX = (cW - dW) / 2; dY = 0; }
      else        { dW = cW; dH = dW / r; dX = 0; dY = (cH - dH) / 2; }
      ctx.clearRect(0, 0, cW, cH);
      ctx.drawImage(img, dX, dY, dW, dH);
    }

    /* Activar ScrollTrigger una vez cargado todo */
    function initST() {
      if (triggered) return;
      triggered = true;

      /* Ocultar loader */
      const loader = document.getElementById('st-loader');
      if (loader) {
        loader.style.opacity = '0';
        setTimeout(() => loader.remove(), 800);
      }

      /* Render primer frame limpio */
      renderFrame(0);
      window.addEventListener('resize', resize);

      const hint = document.getElementById('st-hint');

      const copies = [
        { el: document.getElementById('st-copy-1'), in: 0.03, peak: 0.14, out: 0.30 },
        { el: document.getElementById('st-copy-2'), in: 0.36, peak: 0.49, out: 0.63 },
        { el: document.getElementById('st-copy-3'), in: 0.68, peak: 0.80, out: 0.96 },
      ];

      ScrollTrigger.create({
        trigger: track,
        start: 'top top',
        end: 'bottom bottom',
        scrub: true,
        onUpdate: (self) => {
          const p = self.progress;

          /* Frame scrub */
          const idx = Math.min(Math.floor(p * TOTAL), TOTAL - 1);
          if (idx !== currentFrame) {
            currentFrame = idx;
            renderFrame(idx);
          }

          /* Hint — desaparece al empezar a scrollear */
          if (hint) hint.style.opacity = p < 0.04 ? String(1 - p / 0.04) : '0';

          /* Textos fade in / out */
          copies.forEach(({ el, in: inP, peak, out }) => {
            if (!el) return;
            let op = 0;
            if (p > inP  && p <= peak) op = (p - inP)  / (peak - inP);
            else if (p > peak && p < out)  op = 1 - (p - peak) / (out - peak);
            el.style.opacity = Math.max(0, Math.min(1, op));
          });
        },
      });
    }

    /* Precargar todos los frames */
    const fill = document.getElementById('st-fill');

    for (let i = 0; i < TOTAL; i++) {
      const img = new Image();
      img.onload = img.onerror = () => {
        loadedCount++;
        if (fill) fill.style.width = (loadedCount / TOTAL * 100).toFixed(1) + '%';
        if (loadedCount === TOTAL) initST();
      };
      img.src    = `public/animacion/ezgif-frame-${pad(i + 1)}.jpg`;
      images[i]  = img;
    }

    /* Primer frame en cuanto esté disponible */
    images[0].addEventListener('load', () => { resize(); }, { once: true });
  }

  /* ═══════════════════════════════════
     CSS --delay desde data-delay
     ═══════════════════════════════════ */
  document.querySelectorAll('[data-delay]').forEach(el => {
    el.style.setProperty('--delay', el.dataset.delay + 'ms');
  });

})();
