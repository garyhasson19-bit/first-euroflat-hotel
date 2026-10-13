(() => {
  const html = document.documentElement;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasGsap = !!(window.gsap && window.ScrollTrigger);
  const motion = hasGsap && !reduce;
  const finePointer = matchMedia('(pointer: fine)').matches;
  const EN = html.lang.startsWith('en');
  window.__motionReady = true;
  if (!motion) html.classList.remove('motion');
  if (hasGsap) gsap.registerPlugin(ScrollTrigger);

  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];

  /* ---------- Helpers ---------- */
  // Wraps every word of an element in a masked span; keeps inline elements like <sup>.
  function splitWords(el) {
    const frag = document.createDocumentFragment();
    const inners = [];
    const wrap = (content) => {
      const w = document.createElement('span');
      w.className = 'w';
      const i = document.createElement('span');
      if (typeof content === 'string') i.textContent = content; else i.appendChild(content);
      w.appendChild(i);
      frag.appendChild(w);
      inners.push(i);
    };
    [...el.childNodes].forEach((node) => {
      if (node.nodeType === 3) {
        node.textContent.split(/([ \t\n\r]+)/).forEach((part) => {
          if (!part) return;
          if (/^[ \t\n\r]+$/.test(part)) frag.appendChild(document.createTextNode(' '));
          else wrap(part);
        });
      } else {
        wrap(node.cloneNode(true));
      }
    });
    el.textContent = '';
    el.appendChild(frag);
    return inners;
  }

  function splitChars(el) {
    const text = el.textContent;
    el.textContent = '';
    return [...text].map((ch) => {
      const s = document.createElement('span');
      s.textContent = ch === ' ' ? ' ' : ch;
      s.style.display = 'inline-block';
      el.appendChild(s);
      return s;
    });
  }

  /* ---------- Smooth scroll ---------- */
  let lenis = null;
  if (motion && window.Lenis) {
    lenis = new Lenis({ lerp: 0.085, wheelMultiplier: 1 });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  /* ---------- Nav, menu, floating button ---------- */
  const nav = $('.nav');
  const themed = $$('main [data-theme]');
  const toggle = $('.menu-toggle');
  const menu = $('#menu');
  const floatBtn = $('.book-float');
  const contact = $('#contact');
  let menuOpen = false;
  let lastY = window.scrollY;
  let ticking = false;

  function updateChrome() {
    ticking = false;
    const y = window.scrollY;
    nav.classList.toggle('is-scrolled', y > 40);
    if (!menuOpen) nav.classList.toggle('is-hidden', y > lastY + 2 && y > 320);
    if (y < lastY - 2) nav.classList.remove('is-hidden');
    lastY = y;

    let theme = 'dark';
    for (const s of themed) {
      const r = s.getBoundingClientRect();
      if (r.top <= 40 && r.bottom > 40) { theme = s.dataset.theme; break; }
    }
    nav.dataset.theme = theme;

    const cTop = contact.getBoundingClientRect().top;
    floatBtn.classList.toggle('is-visible', y > window.innerHeight * 0.9 && cTop > window.innerHeight * 0.6);
  }
  window.addEventListener('scroll', () => {
    if (!ticking) { ticking = true; requestAnimationFrame(updateChrome); }
  }, { passive: true });
  updateChrome();

  function openMenu() {
    menuOpen = true;
    menu.hidden = false;
    nav.classList.add('menu-open');
    nav.classList.remove('is-hidden');
    toggle.setAttribute('aria-expanded', 'true');
    toggle.firstElementChild.textContent = EN ? 'Close' : 'Fermer';
    document.body.style.overflow = 'hidden';
    if (lenis) lenis.stop();
    if (motion) {
      gsap.fromTo(menu, { clipPath: 'inset(0% 0% 100% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.8, ease: 'expo.inOut' });
      gsap.fromTo($$('nav a', menu), { yPercent: 70, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.9, stagger: 0.05, ease: 'expo.out', delay: 0.25 });
    }
  }
  function closeMenu() {
    if (!menuOpen) return;
    menuOpen = false;
    menu.hidden = true;
    nav.classList.remove('menu-open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.firstElementChild.textContent = 'Menu';
    document.body.style.overflow = '';
    if (lenis) lenis.start();
  }
  toggle.addEventListener('click', () => (menuOpen ? closeMenu() : openMenu()));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeMenu(); });

  // In-page anchors go through Lenis so pinned sections land correctly.
  $$('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      const target = id === '#top' ? 0 : $(id);
      if (target === null) return;
      e.preventDefault();
      closeMenu();
      if (lenis) lenis.scrollTo(target, { duration: 1.6, easing: (t) => 1 - Math.pow(1 - t, 4) });
      else if (target === 0) window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
      else target.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
      if (target !== 0) {
        const focusable = target.querySelector('h2, h1');
        if (focusable) { focusable.setAttribute('tabindex', '-1'); focusable.focus({ preventScroll: true }); }
      }
    });
  });

  /* ---------- Rooms: area indicator ---------- */
  const rooms = $$('.room');
  const areaRect = $('.area-cur');
  const areaNum = $('.area-num');
  const areaState = { v: 35 };
  let currentRoom = -1;
  const sideFor = (a) => 140 * Math.sqrt(a / 45);

  function setRoom(i) {
    if (i === currentRoom || !rooms[i]) return;
    currentRoom = i;
    const a = +rooms[i].dataset.area;
    const side = sideFor(a);
    const attrs = { x: 10, y: 150 - side, width: side, height: side };
    if (motion) {
      gsap.to(areaRect, { attr: attrs, duration: 0.9, ease: 'expo.out' });
      gsap.to(areaState, { v: a, duration: 0.9, ease: 'expo.out', onUpdate: () => { areaNum.textContent = Math.round(areaState.v); } });
    } else {
      Object.entries(attrs).forEach(([k, v]) => areaRect.setAttribute(k, v));
      areaNum.textContent = a;
    }
  }
  setRoom(0);

  // Without the pinned scroll, the native horizontal scroller still drives the indicator.
  const viewport = $('.rooms-viewport');
  viewport.addEventListener('scroll', () => {
    if ($('.rooms').classList.contains('is-pinned')) return;
    const step = rooms[1].offsetLeft - rooms[0].offsetLeft;
    setRoom(Math.round(viewport.scrollLeft / step));
  }, { passive: true });

  /* ---------- Meeting planner ---------- */
  const ROOMS = {
    grand: { w: 600, price: EN ? 'from €400 to €655' : 'de 400 à 655 €', cap: { theatre: 80, ecole: 52, conseil: 40, u: 36 } },
    petit: { w: 300, price: EN ? 'from €390 to €500' : 'de 390 à 500 €', cap: { theatre: 30, ecole: 20, conseil: 15, u: 12 } },
  };
  const svgNS = 'http://www.w3.org/2000/svg';
  const chairsG = $('.plan-chairs');
  const tablesG = $('.plan-tables');
  const floor = $('.plan-floor');
  const split = $('.plan-split');
  const glass = $('.plan-glass');
  const capNum = $('.cap-num');
  const capRange = $('.cap-range');
  const capState = { v: 80 };
  const POOL = 80;
  const chairs = Array.from({ length: POOL }, () => {
    const c = document.createElementNS(svgNS, 'circle');
    c.setAttribute('r', 5.5);
    c.setAttribute('cx', 320);
    c.setAttribute('cy', 200);
    c.style.opacity = 0;
    chairsG.appendChild(c);
    return c;
  });
  const plan = { room: 'grand', layout: 'theatre' };

  const evenly = (x1, y1, x2, y2, n) =>
    Array.from({ length: Math.max(0, n) }, (_, i) => {
      const t = (i + 0.5) / n;
      return [x1 + (x2 - x1) * t, y1 + (y2 - y1) * t];
    });

  function layoutU(R, n) {
    const x0 = R.x + R.w * 0.3, x1 = R.x + R.w * 0.84, y0 = R.y + R.h * 0.2, y1 = R.y + R.h * 0.8, t = 18, o = 13;
    const arm = x1 - x0, base = y1 - y0;
    let a = Math.round((n * arm) / (2 * arm + base));
    let b = n - 2 * a;
    if (b < 2) { a = Math.floor((n - 2) / 2); b = n - 2 * a; }
    return {
      chairs: [...evenly(x0, y0 - o, x1, y0 - o, a), ...evenly(x1 + o, y0, x1 + o, y1, b), ...evenly(x1, y1 + o, x0, y1 + o, a)],
      tables: [{ x: x0, y: y0, w: arm, h: t }, { x: x1 - t, y: y0, w: t, h: base }, { x: x0, y: y1 - t, w: arm, h: t }],
    };
  }

  function layoutConseil(R, n) {
    const tw = R.w * 0.6, th = R.h * 0.26, x0 = R.x + (R.w - tw) / 2 + R.w * 0.04, y0 = R.y + (R.h - th) / 2, o = 13;
    const a = Math.round((n * tw) / (2 * tw + 2 * th));
    const rest = n - 2 * a;
    const e1 = Math.ceil(rest / 2), e2 = Math.floor(rest / 2);
    return {
      chairs: [
        ...evenly(x0, y0 - o, x0 + tw, y0 - o, a),
        ...evenly(x0 + tw + o, y0, x0 + tw + o, y0 + th, e1),
        ...evenly(x0 + tw, y0 + th + o, x0, y0 + th + o, a),
        ...evenly(x0 - o, y0 + th, x0 - o, y0, e2),
      ],
      tables: [{ x: x0, y: y0, w: tw, h: th }],
    };
  }

  // Columns of chairs facing the screen on the left wall, split by a central aisle.
  function layoutCols(R, cols, per, start, withTables) {
    const x0 = R.x + R.w * start, x1 = R.x + R.w * 0.93, y0 = R.y + R.h * 0.09, y1 = R.y + R.h * 0.91;
    const mid = (y0 + y1) / 2, gap = 16, dx = (x1 - x0) / cols;
    const top = Math.ceil(per / 2), bottom = per - top;
    const out = { chairs: [], tables: [] };
    for (let c = 0; c < cols; c++) {
      const cx = x0 + dx * (c + 0.5);
      evenly(cx, y0, cx, mid - gap, top).forEach((p) => out.chairs.push(p));
      evenly(cx, mid + gap, cx, y1, bottom).forEach((p) => out.chairs.push(p));
      if (withTables) {
        out.tables.push({ x: cx - 21, y: y0, w: 11, h: mid - gap - y0 });
        if (bottom) out.tables.push({ x: cx - 21, y: mid + gap, w: 11, h: y1 - mid - gap });
      }
    }
    return out;
  }

  function computeLayout() {
    const room = ROOMS[plan.room];
    const R = { x: 20, y: 20, w: room.w, h: 360 };
    const n = room.cap[plan.layout];
    const big = plan.room === 'grand';
    switch (plan.layout) {
      case 'u': return layoutU(R, n);
      case 'conseil': return layoutConseil(R, n);
      case 'ecole': return big ? layoutCols(R, 4, 13, 0.3, true) : layoutCols(R, 4, 5, 0.3, true);
      default: return big ? layoutCols(R, 8, 10, 0.2, false) : layoutCols(R, 5, 6, 0.22, false);
    }
  }

  function renderPlan(animate) {
    const room = ROOMS[plan.room];
    const n = room.cap[plan.layout];
    const { chairs: pts, tables } = computeLayout();
    const dur = animate && motion ? 1 : 0;

    // tables: fade the old set out, draw the new one
    const old = $$('rect', tablesG);
    const fresh = tables.map((t) => {
      const r = document.createElementNS(svgNS, 'rect');
      r.setAttribute('x', t.x); r.setAttribute('y', t.y);
      r.setAttribute('width', t.w); r.setAttribute('height', t.h);
      r.setAttribute('rx', 2);
      tablesG.appendChild(r);
      return r;
    });
    if (dur) {
      gsap.to(old, { opacity: 0, duration: 0.35, onComplete: () => old.forEach((r) => r.remove()) });
      gsap.fromTo(fresh, { opacity: 0 }, { opacity: 1, duration: 0.6, delay: 0.45, stagger: 0.02 });
    } else old.forEach((r) => r.remove());

    chairs.forEach((c, i) => {
      const p = pts[i];
      if (dur) {
        if (p) gsap.to(c, { attr: { cx: p[0], cy: p[1] }, opacity: 1, duration: dur, ease: 'expo.inOut', delay: i * 0.005 });
        else gsap.to(c, { opacity: 0, duration: 0.4 });
      } else {
        if (p) { c.setAttribute('cx', p[0]); c.setAttribute('cy', p[1]); }
        c.style.opacity = p ? 1 : 0;
      }
    });

    const floorW = room.w;
    if (dur) {
      gsap.to(floor, { attr: { width: floorW }, duration: 0.9, ease: 'expo.inOut' });
      gsap.to(glass, { attr: { x2: 20 + floorW - 20 }, duration: 0.9, ease: 'expo.inOut' });
      gsap.to(split, { opacity: plan.room === 'petit' ? 1 : 0, duration: 0.4 });
      gsap.to(capState, { v: n, duration: 0.9, ease: 'expo.out', onUpdate: () => { capNum.textContent = Math.round(capState.v); } });
    } else {
      floor.setAttribute('width', floorW);
      glass.setAttribute('x2', 20 + floorW - 20);
      split.style.opacity = plan.room === 'petit' ? 1 : 0;
      capNum.textContent = n;
    }
    capRange.textContent = room.price;
  }

  $$('.chip').forEach((btn) => {
    btn.addEventListener('click', () => {
      const key = btn.dataset.room ? 'room' : 'layout';
      const value = btn.dataset.room || btn.dataset.layout;
      if (plan[key] === value) return;
      plan[key] = value;
      $$(`.chip[data-${key}]`).forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
      renderPlan(true);
    });
  });
  renderPlan(false);

  /* ---------- E-mail links ---------- */
  // The mailto link opens the visitor's mail app; the toast covers devices without one.
  const HOTEL_MAIL = 'reservation@firsteuroflathotel.be';
  const LAYOUT_NAMES = EN
    ? { theatre: 'Theatre', ecole: 'Classroom', conseil: 'Boardroom', u: 'U-shape' }
    : { theatre: 'Théâtre', ecole: 'École', conseil: 'Conseil', u: 'En U' };
  const COPY_LABEL = EN ? 'Copy address' : 'Copier l’adresse';
  const toast = $('.mail-toast');
  const copyBtn = $('[data-copy]', toast);
  let toastTimer;

  function mailContent(kind) {
    const cap = ROOMS[plan.room].cap[plan.layout];
    if (EN) {
      if (kind !== 'offre') return { subject: 'Information request', body: 'Hello,\n\n' };
      const room = plan.room === 'grand' ? 'Grand Charlemagne (90 m²)' : 'Charlemagne I or II (45 m²)';
      return {
        subject: 'Meeting quote request',
        body: [
          'Hello,', '',
          'I would like to receive a quote for a meeting at the First Euroflat Hotel.', '',
          `Room: ${room}`,
          `Layout: ${LAYOUT_NAMES[plan.layout]} (up to ${cap} people)`,
          'Preferred date: ',
          'Number of participants: ',
          'Option: Light Lunch package, three-course menu package or room only', '',
          'Thank you,', '',
        ].join('\n'),
      };
    }
    if (kind !== 'offre') return { subject: 'Demande d’information', body: 'Bonjour,\n\n' };
    const room = plan.room === 'grand' ? 'Grand Charlemagne (90 m²)' : 'Charlemagne I ou II (45 m²)';
    return {
      subject: 'Demande d’offre pour une réunion',
      body: [
        'Bonjour,', '',
        'Je souhaite recevoir une offre pour une réunion au First Euroflat Hotel.', '',
        `Salle : ${room}`,
        `Disposition : ${LAYOUT_NAMES[plan.layout]} (jusqu’à ${cap} personnes)`,
        'Date souhaitée : ',
        'Nombre de participants : ',
        'Formule : forfait Light Lunch, forfait menu 3 services ou salle seule', '',
        'Merci d’avance,', '',
      ].join('\n'),
    };
  }

  function hideToast() {
    toast.classList.remove('is-in');
    document.body.classList.remove('toast-open');
    setTimeout(() => { if (!toast.classList.contains('is-in')) toast.hidden = true; }, 500);
  }
  function showToast() {
    toast.hidden = false;
    copyBtn.textContent = COPY_LABEL;
    document.body.classList.add('toast-open');
    requestAnimationFrame(() => requestAnimationFrame(() => toast.classList.add('is-in')));
    clearTimeout(toastTimer);
    toastTimer = setTimeout(hideToast, 14000);
  }

  $$('[data-mail]').forEach((a) => {
    a.addEventListener('click', () => {
      const { subject, body } = mailContent(a.dataset.mail);
      const q = `subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      a.href = `mailto:${HOTEL_MAIL}?${q}`;
      $('[data-gmail]', toast).href = `https://mail.google.com/mail/?view=cm&fs=1&to=${HOTEL_MAIL}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      showToast();
    });
  });
  $('.mail-toast-close', toast).addEventListener('click', hideToast);
  copyBtn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(HOTEL_MAIL);
      copyBtn.textContent = EN ? 'Address copied' : 'Adresse copiée';
    } catch {
      copyBtn.textContent = EN ? 'Copy failed, select the address' : 'Copie impossible, sélectionnez l’adresse';
    }
  });

  /* ---------- Static fallbacks when motion is off ---------- */
  const revealHeadings = $$('[data-reveal]').map((el) => ({ el, words: splitWords(el) }));
  const statement = $('[data-words]');
  const statementWords = splitWords(statement);
  const stops = $$('.stop');

  if (!motion) {
    stops.forEach((s) => s.classList.add('is-on'));
    return;
  }

  /* =========================================================
     Motion
     ========================================================= */
  const mm = gsap.matchMedia();
  const hero = $('.hero');
  const win = $('.hero-window');
  const winImg = $('img', win);
  const winInner = $('.hero-window-inner', win);
  const gutter = () => Math.min(64, Math.max(16, window.innerWidth * 0.042));
  const isMobile = () => window.innerWidth < 900;

  // Window geometry in px, mirrors the CSS custom properties.
  const stage = $('.hero-stage');
  function geom() {
    const vw = stage.clientWidth, vh = stage.clientHeight;
    if (isMobile()) {
      const g = gutter();
      return { t: vh * 0.6, r: g, b: vh * 0.03, l: g, rad: (vw - 2 * g) / 2 };
    }
    return { t: vh * 0.14, r: vw * 0.06, b: vh * 0.09, l: vw * 0.64, rad: vw * 0.15 };
  }
  const px = (v) => `${v}px`;

  // Pinned sections must exist before the triggers below them are measured.
  buildHeroScroll();

  // Headings: words rise out of their masks when they enter.
  revealHeadings.forEach(({ el, words }) => {
    gsap.set(words, { yPercent: 105 });
    ScrollTrigger.create({
      trigger: el, start: 'top 88%', once: true,
      onEnter: () => gsap.to(words, { yPercent: 0, duration: 1.3, ease: 'expo.out', stagger: 0.045 }),
    });
  });

  // Statement: words fill in as you read down.
  gsap.fromTo(statementWords, { opacity: 0.14 }, {
    opacity: 1, ease: 'none', stagger: 0.1,
    scrollTrigger: { trigger: statement, start: 'top 82%', end: 'bottom 52%', scrub: true },
  });

  // Hero: one orchestrated opening, then the window grows on scroll.
  const startHash = location.hash && $(location.hash);
  function buildHeroScroll() {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: hero, start: 'top top', end: () => `+=${window.innerHeight * 1.25}`,
        pin: true, scrub: 0.8, invalidateOnRefresh: true,
      },
    });
    tl.fromTo(win,
      { '--t': () => px(geom().t), '--r': () => px(geom().r), '--b': () => px(geom().b), '--l': () => px(geom().l), '--rad': () => px(geom().rad) },
      { '--t': '0px', '--r': '0px', '--b': '0px', '--l': '0px', '--rad': '0px', ease: 'power2.inOut', duration: 1 }, 0)
      .fromTo(winInner, { scale: 1 }, { scale: 1 / 1.12, ease: 'none', duration: 1 }, 0)
      .to('.hero-copy', { y: () => -window.innerHeight * 0.08, opacity: 0, ease: 'power1.in', duration: 0.75 }, 0)
      .to('.hero-hint', { opacity: 0, duration: 0.1 }, 0)
      .fromTo(win, { '--shade': 0 }, { '--shade': 1, duration: 0.3 }, 0.7)
      .fromTo('.hero-caption', { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.3 }, 0.75);
    return tl;
  }

  function finishIntroInstantly() {
    gsap.set(win, { '--lift': '0px' });
    gsap.set(winImg, { scale: 1.12 });
    gsap.set('.hero-title .line > span', { yPercent: 0, y: 0 });
    gsap.set(['.hero-sub', '.nav'], { opacity: 1 });
  }

  function playIntro() {
    const g = geom();
    gsap.set(win, { '--lift': px(stage.clientHeight - g.b - g.t + 4) });
    gsap.set(winImg, { scale: 1.4 });
    if (lenis) lenis.stop();
    const tl = gsap.timeline({
      defaults: { ease: 'expo.out' },
      onComplete: () => { if (lenis) lenis.start(); },
    });
    tl.fromTo('.hero-title .line > span', { yPercent: 135, y: 0 }, { yPercent: 0, duration: 1.5, stagger: 0.13 }, 0.15)
      .to(win, { '--lift': '0px', duration: 1.9, ease: 'expo.inOut' }, 0.05)
      .to(winImg, { scale: 1.12, duration: 2.6 }, 0.05)
      .fromTo('.hero-sub', { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 1.2 }, 1.0)
      .fromTo('.nav', { opacity: 0, y: -12 }, { opacity: 1, y: 0, duration: 1.2 }, 1.1);
  }

  if (startHash) {
    finishIntroInstantly();
  } else {
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
    window.scrollTo(0, 0);
    const fontsReady = document.fonts ? Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 1500))]) : Promise.resolve();
    fontsReady.then(playIntro);
  }

  // Rooms: horizontal track pinned on desktop; indicator follows.
  mm.add('(min-width: 900px)', () => {
    const section = $('.rooms');
    const track = $('.rooms-track');
    section.classList.add('is-pinned');
    viewport.scrollLeft = 0;
    const dist = () => Math.max(0, track.scrollWidth - viewport.clientWidth);
    // The room whose centre is closest to the middle of the visible track wins.
    // Runs on the scrubbed tween itself, so it follows the track rather than the wheel.
    const pickRoom = () => {
      const vr = viewport.getBoundingClientRect();
      const mid = vr.left + vr.width / 2;
      let best = 0, bestD = Infinity;
      rooms.forEach((r, i) => {
        const rr = r.getBoundingClientRect();
        const d = Math.abs(rr.left + rr.width / 2 - mid);
        if (d < bestD) { bestD = d; best = i; }
      });
      setRoom(best);
    };
    const tween = gsap.to(track, {
      x: () => -dist(), ease: 'none', onUpdate: pickRoom,
      scrollTrigger: {
        trigger: section, start: 'top top', end: () => `+=${dist()}`,
        pin: true, scrub: 1, invalidateOnRefresh: true,
      },
    });
    rooms.forEach((r) => {
      gsap.fromTo($('img', r), { xPercent: -5 }, {
        xPercent: 5, ease: 'none',
        scrollTrigger: { trigger: r, containerAnimation: tween, start: 'left right', end: 'right left', scrub: true },
      });
    });
    return () => section.classList.remove('is-pinned');
  });

  // Rooms on mobile: each photo opens like a blind.
  mm.add('(max-width: 899px)', () => {
    rooms.forEach((r) => {
      gsap.fromTo($('.room-media', r), { clipPath: 'inset(0% 0% 100% 0%)' }, {
        clipPath: 'inset(0% 0% 0% 0%)', duration: 1.3, ease: 'expo.inOut',
        scrollTrigger: { trigger: r, start: 'top 85%', once: true },
      });
    });
  });

  // Garden: photos drift at different speeds, each opens on entry.
  $$('.g').forEach((g) => {
    const speed = parseFloat(g.dataset.speed || 0);
    gsap.fromTo(g, { y: () => speed * window.innerHeight * (isMobile() ? 0.25 : 0.6) }, {
      y: () => -speed * window.innerHeight * (isMobile() ? 0.25 : 0.6), ease: 'none',
      scrollTrigger: { trigger: g, start: 'top bottom', end: 'bottom top', scrub: true, invalidateOnRefresh: true },
    });
    gsap.fromTo($('.clip', g), { clipPath: 'inset(100% 0% 0% 0%)' }, {
      clipPath: 'inset(0% 0% 0% 0%)', duration: 1.5, ease: 'expo.inOut',
      scrollTrigger: { trigger: g, start: 'top 92%', once: true },
    });
    gsap.fromTo($('img', g), { scale: 1.25 }, {
      scale: 1, duration: 1.8, ease: 'expo.out',
      scrollTrigger: { trigger: g, start: 'top 92%', once: true },
    });
  });

  // Single images that open on entry.
  $$('.reveal-img').forEach((fig) => {
    gsap.fromTo(fig, { clipPath: 'inset(100% 0% 0% 0%)' }, {
      clipPath: 'inset(0% 0% 0% 0%)', duration: 1.4, ease: 'expo.inOut',
      scrollTrigger: { trigger: fig, start: 'top 88%', once: true },
    });
    gsap.fromTo($('img', fig), { scale: 1.3 }, {
      scale: 1, duration: 1.8, ease: 'expo.out',
      scrollTrigger: { trigger: fig, start: 'top 88%', once: true },
    });
  });

  // Planner: chairs walk in the first time it is seen.
  ScrollTrigger.create({
    trigger: '.planner', start: 'top 75%', once: true,
    onEnter: () => {
      const visible = chairs.filter((c) => c.style.opacity !== '0');
      gsap.from(visible, { attr: { cx: 320, cy: 200 }, opacity: 0, duration: 1.2, ease: 'expo.out', stagger: { each: 0.008, from: 'random' } });
      gsap.from(capState, { v: 0, duration: 1.4, ease: 'expo.out', onUpdate: () => { capNum.textContent = Math.round(capState.v); } });
    },
  });

  // Route: the line draws down and each stop lights up as it is reached.
  const route = $('.route');
  gsap.fromTo(route, { '--route': 0 }, {
    '--route': 1, ease: 'none',
    scrollTrigger: { trigger: route, start: 'top 62%', end: 'bottom 62%', scrub: true },
  });
  stops.forEach((s) => {
    ScrollTrigger.create({
      trigger: s, start: 'top 64%',
      onEnter: () => s.classList.add('is-on'),
      onLeaveBack: () => s.classList.remove('is-on'),
    });
  });

  // Services and offers: rules draw in, then text settles.
  ScrollTrigger.batch('.svc li, .offer, .offer-note, .kit > div, .contact-grid > div', {
    start: 'top 90%', once: true,
    onEnter: (els) => gsap.fromTo(els, { opacity: 0, y: 28 }, { opacity: 1, y: 0, duration: 1.1, ease: 'expo.out', stagger: 0.07 }),
  });

  // Contact: the call to action and the wordmark rise in.
  const ctaText = $('.big-cta-text');
  const ctaWords = splitWords(ctaText);
  gsap.set(ctaWords, { yPercent: 105 });
  ScrollTrigger.create({
    trigger: '.big-cta', start: 'top 85%', once: true,
    onEnter: () => gsap.to(ctaWords, { yPercent: 0, duration: 1.4, ease: 'expo.out', stagger: 0.08 }),
  });
  const markChars = splitChars($('.wordmark span'));
  gsap.fromTo(markChars, { yPercent: 100 }, {
    yPercent: 0, ease: 'none', stagger: 0.04,
    scrollTrigger: { trigger: '.foot', start: 'top bottom', end: 'bottom bottom', scrub: true },
  });

  // Magnetic buttons on precise pointers.
  if (finePointer) {
    $$('.magnetic').forEach((el) => {
      const strength = el.classList.contains('big-cta') ? 0.08 : 0.3;
      const xTo = gsap.quickTo(el, 'x', { duration: 0.7, ease: 'power3' });
      const yTo = gsap.quickTo(el, 'y', { duration: 0.7, ease: 'power3' });
      el.addEventListener('mousemove', (e) => {
        const r = el.getBoundingClientRect();
        xTo((e.clientX - r.left - r.width / 2) * strength);
        yTo((e.clientY - r.top - r.height / 2) * strength);
      });
      el.addEventListener('mouseleave', () => { xTo(0); yTo(0); });
    });
  }

  // Opening a FAQ answer changes the page height below it.
  $$('.faq details').forEach((d) => d.addEventListener('toggle', () => setTimeout(() => ScrollTrigger.refresh(), 650)));

  // Refresh in page order so every pin's spacing is counted by the triggers after it.
  ScrollTrigger.sort();
  ScrollTrigger.refresh();
  window.addEventListener('load', () => { ScrollTrigger.sort(); ScrollTrigger.refresh(); });
})();
