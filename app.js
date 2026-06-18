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

  }

  setupScrollReveals();
  setupScrolltelling();
  setupAccordion();
  setupVelocityText();
  setupProyectosSplit();
  setupSvivaSplit();
  setupNosotrosSplit();

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

      item.addEventListener('focus', () => {
        items.forEach(el => el.classList.remove('accordion__item--active'));
        item.classList.add('accordion__item--active');
      });

      // Mobile: primer tap expande, segundo tap sigue el link interno
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
     SPLITTEXT — tag + título SierraViva
     ═══════════════════════════════════ */
  function setupSvivaSplit() {
    const tagText   = document.querySelector('.sviva__tag-text');
    const title     = document.querySelector('.sviva__title');
    const lead      = document.querySelector('.sviva__lead');
    const loc       = document.querySelector('.sviva__loc');
    const statItems = [...document.querySelectorAll('.sviva__stat')];
    // cta no se anima con GSAP — su hover usa .ah/.ah2 que GSAP rompe

    if (!tagText || !title) return;

    /* Quitar reveal-up para que GSAP tome el control */
    [lead, loc].filter(Boolean).forEach(el => el.classList.remove('reveal-up'));

    /* Helper: mide líneas renderizadas y construye nos-line wrappers */
    function lineReveal(el) {
      const words = el.textContent.trim().split(/\s+/);
      el.innerHTML = words.map(w => `<span style="display:inline">${w}</span>`).join(' ');
      const spans = [...el.querySelectorAll('span')];
      const lines = [];
      let curTop = null, curLine = [];
      spans.forEach(s => {
        const top = s.offsetTop;
        if (curTop === null || top === curTop) { curLine.push(s.textContent); curTop = top; }
        else { lines.push(curLine.join(' ')); curLine = [s.textContent]; curTop = top; }
      });
      if (curLine.length) lines.push(curLine.join(' '));
      el.innerHTML = lines
        .map(l => `<span class="nos-line"><span class="nos-line-in">${l}</span></span>`)
        .join('\n');
      return [...el.querySelectorAll('.nos-line-in')];
    }

    /* Tag: char a char */
    tagText.innerHTML = [...tagText.textContent.trim()]
      .map(c => c === ' ' ? '<span aria-hidden="true"> </span>' : `<span class="sv-char">${c}</span>`)
      .join('');
    const chars = tagText.querySelectorAll('.sv-char');

    /* Título: palabra a palabra, clip reveal */
    title.innerHTML = title.textContent.trim().split(/\s+/)
      .map(w => `<span class="sv-word" style="display:inline-block;overflow:hidden;vertical-align:bottom"><span class="sv-word-inner" style="display:inline-block">${w}</span></span>`)
      .join(' ');
    const wordInners = title.querySelectorAll('.sv-word-inner');

    /* Lead: line reveal */
    const leadInners = lead ? lineReveal(lead) : [];

    /* Loc: split manual por <br> */
    let locInners = [];
    if (loc) {
      const parts = loc.innerHTML.split(/<br\s*\/?>/i);
      loc.innerHTML = parts
        .map(p => p.replace(/<[^>]*>/g, '').trim())
        .filter(Boolean)
        .map(t => `<span class="nos-line"><span class="nos-line-in">${t}</span></span>`)
        .join('');
      locInners = [...loc.querySelectorAll('.nos-line-in')];
    }

    /* Estados iniciales */
    gsap.set(chars,                           { opacity: 0, y: 8 });
    gsap.set(wordInners,                      { y: '105%' });
    gsap.set([...leadInners, ...locInners],   { yPercent: 105 });
    gsap.set(statItems,                       { opacity: 0, y: 20 });

    gsap.timeline({
      scrollTrigger: {
        trigger: '.sviva',
        start: 'top 75%',
        end: 'top 5%',
        scrub: 1,
      },
    })
    .to(chars,
      { opacity: 1, y: 0, duration: 0.35, stagger: 0.015, ease: 'none' })
    .to(wordInners,
      { y: '0%', duration: 0.6, stagger: 0.05, ease: 'none' }, '-=0.1')
    .to([...leadInners, ...locInners],
      { yPercent: 0, duration: 0.5, stagger: 0.045, ease: 'none' }, '-=0.35')
    .to(statItems,
      { opacity: 1, y: 0, duration: 0.45, stagger: 0.07, ease: 'none' }, '-=0.25')
    ;
  }

  /* ═══════════════════════════════════
     LINE REVEAL — sección proyectos
     ═══════════════════════════════════ */
  function setupProyectosSplit() {
    const title    = document.querySelector('.proyectos .section__title');
    const accItems = [...document.querySelectorAll('.accordion__item')];
    if (!title) return;

    function lineReveal(el) {
      const words = el.textContent.trim().split(/\s+/);
      el.innerHTML = words.map(w => `<span style="display:inline">${w}</span>`).join(' ');
      const spans = [...el.querySelectorAll('span')];
      const lines = [];
      let curTop = null, curLine = [];
      spans.forEach(s => {
        const top = s.offsetTop;
        if (curTop === null || top === curTop) { curLine.push(s.textContent); curTop = top; }
        else { lines.push(curLine.join(' ')); curLine = [s.textContent]; curTop = top; }
      });
      if (curLine.length) lines.push(curLine.join(' '));
      el.innerHTML = lines
        .map(l => `<span class="nos-line"><span class="nos-line-in">${l}</span></span>`)
        .join('\n');
      return [...el.querySelectorAll('.nos-line-in')];
    }

    const titleInners = lineReveal(title);

    gsap.set(titleInners, { yPercent: 105 });
    gsap.set(accItems,    { opacity: 0, y: 40 });

    gsap.timeline({
      scrollTrigger: {
        trigger: '.proyectos',
        start: 'top 75%',
        end: 'top 5%',
        scrub: 1,
      },
    })
    .to(titleInners, { yPercent: 0, duration: 0.5, stagger: 0.06, ease: 'none' })
    .to(accItems,    { opacity: 1, y: 0, duration: 0.7, stagger: 0.12, ease: 'none' }, '-=0.2');
  }

  /* ═══════════════════════════════════
     LINE REVEAL — sección nosotros
     ═══════════════════════════════════ */
  function setupNosotrosSplit() {
    const lead  = document.querySelector('.nosotros__lead');
    const paras = [...document.querySelectorAll('.nosotros__bio p')];
    const targets = lead ? [lead, ...paras] : paras;
    if (!targets.length) return;

    /* Mide las líneas renderizadas agrupando palabras por offsetTop */
    function measureLines(el) {
      const text  = el.textContent.trim();
      const words = text.split(/\s+/);
      el.innerHTML = words.map(w => `<span style="display:inline">${w}</span>`).join(' ');

      const spans = [...el.querySelectorAll('span')];
      const lines = [];
      let curTop  = null;
      let curLine = [];

      spans.forEach(s => {
        const top = s.offsetTop;
        if (curTop === null || top === curTop) {
          curLine.push(s.textContent);
          curTop = top;
        } else {
          lines.push(curLine.join(' '));
          curLine = [s.textContent];
          curTop  = top;
        }
      });
      if (curLine.length) lines.push(curLine.join(' '));

      return lines;
    }

    const allInners = [];

    targets.forEach(el => {
      const lines = measureLines(el);
      el.innerHTML = lines
        .map(line => `<span class="nos-line"><span class="nos-line-in">${line}</span></span>`)
        .join('\n');
      allInners.push(...el.querySelectorAll('.nos-line-in'));
    });

    gsap.set(allInners, { yPercent: 105 });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: document.querySelector('.nosotros__body'),
        start: 'top 75%',
        end: 'top 5%',
        scrub: 1,
      },
    });

    tl.to(allInners, {
      yPercent: 0,
      duration: 1,
      stagger: 0.06,
      ease: 'none',
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
    const isMobile = window.innerWidth < 768;
    const TOTAL  = 192;
    const folder = isMobile ? 'public/animacion-mobile' : 'public/animacion';
    const pad    = n => String(n).padStart(3, '0');

    let currentFrame = 0;
    const images     = new Array(TOTAL);
    let loadedCount  = 0;
    let triggered    = false;

    /* Resize canvas al viewport — respeta devicePixelRatio para pantallas Retina */
    function resize() {
      const dpr = window.innerWidth < 768 ? 1 : Math.min(window.devicePixelRatio || 1, 2);
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

    /* Dibujar frame — cover en desktop, fit-width en mobile */
    function renderFrame(idx) {
      const img = images[idx];
      if (!img?.complete || !img.naturalWidth) return;
      const cW = window.innerWidth;
      const cH = window.innerHeight;
      const r  = img.naturalWidth / img.naturalHeight;
      const cR = cW / cH;
      let dW, dH, dX, dY;
      ctx.clearRect(0, 0, cW, cH);
      if (isMobile) {
        /* Fit width: sin zoom, barras oscuras arriba y abajo */
        ctx.fillStyle = '#1A1A1A';
        ctx.fillRect(0, 0, cW, cH);
        dW = cW;
        dH = dW / r;
        dX = 0;
        dY = (cH - dH) / 2;
      } else {
        if (r > cR) { dH = cH; dW = dH * r; dX = (cW - dW) / 2; dY = 0; }
        else        { dW = cW; dH = dW / r; dX = 0; dY = (cH - dH) / 2; }
      }
      ctx.drawImage(img, dX, dY, dW, dH);
    }

    /* Activar ScrollTrigger una vez cargado todo */
    function initST() {
      if (triggered) return;
      triggered = true;

      /* Render primer frame limpio */
      renderFrame(0);
      window.addEventListener('resize', resize);

      const hint = document.getElementById('st-hint');

      /* start→holdIn: palabras entran; holdIn→holdOut: plateau; holdOut→end: palabras salen */
      const copies = [
        { el: document.getElementById('st-copy-1'), start: -0.02, holdIn: 0.06, holdOut: 0.30, end: 0.34 },
        { el: document.getElementById('st-copy-2'), start:  0.34, holdIn: 0.40, holdOut: 0.68, end: 0.72 },
        { el: document.getElementById('st-copy-3'), start:  0.72, holdIn: 0.78, holdOut: 2.00, end: 3.00 },
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

          /* Textos: sube → plateau → baja, sin overlap entre frases */
          copies.forEach(({ el, start, holdIn, holdOut, end }) => {
            if (!el) return;
            let op = 0;
            if      (p >= start   && p <  holdIn)  op = (p - start)    / (holdIn  - start);
            else if (p >= holdIn  && p <= holdOut) op = 1;
            else if (p >  holdOut && p <  end)     op = 1 - (p - holdOut) / (end - holdOut);
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
      img.src    = `${folder}/ezgif-frame-${pad(i + 1)}.jpg`;
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
