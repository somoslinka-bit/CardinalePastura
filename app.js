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

  lenis.start();
  triggerHeroReveals();

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
  setupSvivaHoverSlider();
  setupNosotrosSplit();
  setupNosotrosImgReveal();
  setupVisionBlockReveal();

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
      /* Solo la variable --py: el scale de entrada (--ps) queda intacto */
      parallaxImg.style.setProperty('--py', (progress * 60) + 'px');
    }
  });

  /* ═══════════════════════════════════
     NAVBAR — scroll state
     ═══════════════════════════════════ */
  const nav = document.getElementById('nav');
  lenis.on('scroll', ({ scroll, direction }) => {
    if (scroll <= 80)          nav.classList.remove('is-scrolled');
    else if (direction === -1) nav.classList.add('is-scrolled');    /* subiendo → opaco */
    else                       nav.classList.remove('is-scrolled'); /* bajando → transparente */
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

    const activate = (item) => {
      items.forEach(el => el.classList.remove('accordion__item--active'));
      item.classList.add('accordion__item--active');
    };

    if (hasFinePointer) {
      /* Desktop: hover y foco abren el item */
      items.forEach(item => {
        item.addEventListener('mouseenter', () => activate(item));
        item.addEventListener('focus',      () => activate(item));
        item.addEventListener('click', e => {
          if (!item.classList.contains('accordion__item--active')) {
            e.preventDefault();
            activate(item);
          }
        });
      });
    } else {
      /* Mobile: inyecta un <button> invisible sobre cada ítem.
         Los <button> reciben click en iOS siempre, sin importar Lenis. */
      items.forEach(item => {
        const btn = document.createElement('button');
        btn.setAttribute('aria-hidden', 'true');
        btn.setAttribute('tabindex', '-1');
        btn.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;background:none;border:none;padding:0;cursor:pointer;z-index:5;';
        item.appendChild(btn);

        btn.addEventListener('click', () => {
          if (!item.classList.contains('accordion__item--active')) {
            activate(item);
          }
        });
      });
    }
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
     NOSOTROS — reveal cortina de la foto
     ═══════════════════════════════════ */
  function setupNosotrosImgReveal() {
    const media = document.querySelector('.nosotros__media');
    const img   = media?.querySelector('img');
    const rule  = media?.querySelector('.nosotros__rule');
    if (!img) return;

    if (prefersReduced) return;

    /* Estado inicial: imagen recortada desde abajo + leve zoom */
    gsap.set(img, { clipPath: 'inset(100% 0% 0% 0%)', '--ps': 1.18 });
    if (rule) gsap.set(rule, { scaleY: 0, transformOrigin: 'bottom' });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: media,
        start: 'top 80%',
        toggleActions: 'play none none reverse',
      },
    });

    /* La cortina sube revelando la imagen mientras el zoom se asienta */
    tl.to(img, {
      clipPath: 'inset(0% 0% 0% 0%)',
      '--ps': 1,
      duration: 1.5,
      ease: 'expo.inOut',
    });

    /* La línea steel se traza después, como remate */
    if (rule) tl.to(rule, { scaleY: 1, duration: 0.7, ease: 'power3.inOut' }, '-=0.6');
  }

  /* ═══════════════════════════════════
     VISIÓN — block-wipe reveal
     ═══════════════════════════════════ */
  function setupVisionBlockReveal() {
    if (prefersReduced) return;

    /* Color del bloque que barre sobre el fondo oscuro */
    const COLOR_MAIN = '#8FAAB8'; /* steel — visible sobre #0D0E10 */
    const COLOR_STMT = '#F5F4F2'; /* cream — alto contraste en el cierre */

    /* Mide líneas renderizadas por offsetTop y construye la estructura de bloque */
    function buildBlockLines(el, blockColor) {
      const text  = el.textContent.trim();
      const words = text.split(/\s+/);
      /* Inyectar spans temporales para medir */
      el.innerHTML = words.map(w => `<span>${w}</span>`).join(' ');
      const spans  = [...el.querySelectorAll('span')];

      const groups = [];
      let curTop = null, cur = [];
      spans.forEach(s => {
        const top = s.offsetTop;
        if (curTop === null || top === curTop) { cur.push(s.textContent); curTop = top; }
        else { groups.push(cur.join(' ')); cur = [s.textContent]; curTop = top; }
      });
      if (cur.length) groups.push(cur.join(' '));

      /* Reconstruir con estructura wrapper + bloque */
      const blocks = [], lineEls = [];
      el.innerHTML = '';
      groups.forEach(lineText => {
        const wrap = document.createElement('span');
        wrap.style.cssText = 'position:relative;display:block;overflow:hidden;';

        const txt = document.createElement('span');
        txt.style.cssText = 'display:block;';
        txt.textContent = lineText;

        const blk = document.createElement('span');
        blk.style.cssText = `position:absolute;top:0;left:0;width:100%;height:100%;background:${blockColor};z-index:2;`;

        wrap.appendChild(txt);
        wrap.appendChild(blk);
        el.appendChild(wrap);
        blocks.push(blk);
        lineEls.push(txt);
      });

      return { blocks, lineEls };
    }

    /* Crea la animación de wipe para un elemento */
    function wipe(el, blockColor, duration, stagger) {
      if (!el) return;
      const { blocks, lineEls } = buildBlockLines(el, blockColor);
      if (!blocks.length) return;

      gsap.set(blocks,  { scaleX: 0, transformOrigin: 'left center' });
      gsap.set(lineEls, { opacity: 0 });

      gsap.timeline({
        scrollTrigger: {
          trigger: el,
          start: 'top 88%',
          toggleActions: 'play none none reverse',
        },
      })
      .to(blocks,   { scaleX: 1, duration, stagger, transformOrigin: 'left center',  ease: 'expo.inOut' })
      .set(lineEls, { opacity: 1 },                                                    `<${duration * 0.5}`)
      .to(blocks,   { scaleX: 0, duration, stagger, transformOrigin: 'right center', ease: 'expo.inOut' }, `<${duration * 0.4}`);
    }

    const title = document.querySelector('.vision__title');
    const paras = [...document.querySelectorAll('.vision__p')];
    const stmts = [...document.querySelectorAll('.vision__close p')];

    if (!title && !paras.length) return;

    wipe(title, COLOR_MAIN, 0.72, 0.055);
    paras.forEach(p => wipe(p, COLOR_MAIN, 0.52, 0.032));
    stmts.forEach(p => wipe(p, COLOR_STMT, 0.80, 0.060));
  }

  /* ═══════════════════════════════════
     HOVER SLIDER — galería SierraViva
     ═══════════════════════════════════ */
  function setupSvivaHoverSlider() {
    const items  = [...document.querySelectorAll('.sviva__hs-item')];
    const imgs   = [...document.querySelectorAll('.sviva__hs-img')];
    if (!items.length || !imgs.length) return;

    const VISIBLE   = 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)';
    const HIDDEN_T  = 'polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)';   /* sale por arriba */
    const HIDDEN_B  = 'polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)'; /* sale por abajo */

    let current = 0;

    function goTo(next) {
      if (next === current) return;

      const prevImg = imgs[current];
      const nextImg = imgs[next];

      /* La imagen anterior sale hacia arriba */
      gsap.to(prevImg, {
        clipPath: HIDDEN_T,
        duration: 0.65,
        ease: 'power3.inOut',
      });

      /* La imagen nueva entra desde abajo */
      gsap.fromTo(nextImg,
        { clipPath: HIDDEN_B },
        { clipPath: VISIBLE, duration: 0.75, ease: 'power3.inOut' }
      );

      /* Clases activas en los items */
      items[current].classList.remove('sviva__hs-item--active');
      items[next].classList.add('sviva__hs-item--active');

      current = next;
    }

    items.forEach((item, i) => {
      /* Desktop: hover cambia la imagen. Mobile/touch: tap.
         Adjuntamos ambos — goTo() ignora el índice ya activo, así que el
         click en desktop es inofensivo y el tap en móvil siempre funciona. */
      item.addEventListener('mouseenter', () => goTo(i));
      item.addEventListener('click',      () => goTo(i));
    });
  }

  /* ═══════════════════════════════════
     SCROLLTELLING — canvas + 243 frames
     ═══════════════════════════════════ */
  function setupScrolltelling() {
    const canvas = document.getElementById('st-canvas');
    const track  = document.querySelector('.scrolltelling__track');
    if (!canvas || !track) return;

    const isMobile = window.innerWidth < 768;
    const video    = document.getElementById('st-video');

    /* ── Overlay compartido: textos del hero + hint de scroll ── */
    function makeCopies() {
      /* start→holdIn: entra · holdIn→holdOut: plateau · holdOut→end: sale */
      return [
        { el: document.getElementById('st-copy-1'), start: -0.1, holdIn: -0.01, holdOut: 0.13, end: 0.17 },
        { el: document.getElementById('st-copy-2'), start: 0.17, holdIn: 0.21, holdOut: 0.44, end: 0.49 },
      ];
    }
    const hintEl = document.getElementById('st-hint');
    function updateOverlay(copies, p) {
      if (hintEl) hintEl.style.opacity = p < 0.04 ? String(1 - p / 0.04) : '0';
      copies.forEach(({ el, start, holdIn, holdOut, end }) => {
        if (!el) return;
        let op = 0;
        if      (p >= start   && p <  holdIn)  op = (p - start)    / (holdIn  - start);
        else if (p >= holdIn  && p <= holdOut) op = 1;
        else if (p >  holdOut && p <  end)     op = 1 - (p - holdOut) / (end - holdOut);
        el.style.opacity = Math.max(0, Math.min(1, op));
      });
    }

    /* ── MODO VIDEO — vertical 9:16 en mobile, scrubbeado por scroll ── */
    function initVideoMode() {
      canvas.style.display = 'none';
      video.style.display  = 'block';
      /* iOS no muestra frames al setear currentTime sin haber llamado play() antes.
         play() con muted está permitido sin interacción del usuario. */
      const playPromise = video.play();
      if (playPromise instanceof Promise) playPromise.then(() => video.pause()).catch(() => {});
      else video.pause();

      const copies = makeCopies();
      let targetTime = 0, rafId = null;
      const applySeek = () => {
        rafId = null;
        if (video.readyState >= 1 && isFinite(video.duration)) video.currentTime = targetTime;
      };

      ScrollTrigger.create({
        trigger: track, start: 'top top', end: 'bottom bottom', scrub: true,
        onUpdate: (self) => {
          const p = self.progress;
          targetTime = p * (video.duration || 7);
          /* rAF: el seek se aplica una vez por frame para no saturar el decoder en iOS */
          if (rafId == null) rafId = requestAnimationFrame(applySeek);
          updateOverlay(copies, p);
        },
      });
    }

    /* ── MODO FRAMES — secuencia en canvas (desktop, o fallback en mobile) ── */
    function initFramesMode() {
      const ctx    = canvas.getContext('2d');
      const TOTAL  = 243;
      const folder = isMobile ? 'public/animacion-mobile' : 'public/animacion';
      const pad    = n => String(n).padStart(3, '0');

      let currentFrame = 0;
      const images     = new Array(TOTAL);
      let loadedCount  = 0;
      let triggered    = false;

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

      function initST() {
        if (triggered) return;
        triggered = true;
        renderFrame(0);
        window.addEventListener('resize', resize);
        const copies = makeCopies();
        ScrollTrigger.create({
          trigger: track, start: 'top top', end: 'bottom bottom', scrub: true,
          onUpdate: (self) => {
            const p = self.progress;
            const idx = Math.min(Math.floor(p * TOTAL), TOTAL - 1);
            if (idx !== currentFrame) { currentFrame = idx; renderFrame(idx); }
            updateOverlay(copies, p);
          },
        });
      }

      const fill = document.getElementById('st-fill');
      for (let i = 0; i < TOTAL; i++) {
        const img = new Image();
        img.onload = img.onerror = () => {
          loadedCount++;
          if (fill) fill.style.width = (loadedCount / TOTAL * 100).toFixed(1) + '%';
        };
        img.src    = `${folder}/ezgif-frame-${pad(i + 1)}.jpg?v=3`;
        images[i]  = img;
      }
      /* Scrub interactivo apenas carga el primer frame (el resto baja en background) */
      images[0].addEventListener('load', () => { resize(); initST(); }, { once: true });
    }

    /* En mobile probamos el video vertical; si no existe/carga, caemos a los frames */
    if (isMobile && video) {
      let decided = false;
      const useVideo  = () => { if (!decided) { decided = true; initVideoMode(); } };
      const useFrames = () => { if (!decided) { decided = true; video.style.display = 'none'; initFramesMode(); } };
      if (video.readyState >= 1) {
        useVideo();
      } else {
        video.addEventListener('loadedmetadata', useVideo,  { once: true });
        video.addEventListener('error',          useFrames, { once: true });
        /* Si en 5s no hubo metadata ni error, usar frames por las dudas */
        setTimeout(() => { if (!decided) useFrames(); }, 5000);
      }
      return;
    }

    initFramesMode();
  }

  /* ═══════════════════════════════════
     CSS --delay desde data-delay
     ═══════════════════════════════════ */
  document.querySelectorAll('[data-delay]').forEach(el => {
    el.style.setProperty('--delay', el.dataset.delay + 'ms');
  });

})();
