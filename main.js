(() => {
  /* ---------- Settings to change when the hotel changes provider ---------- */
  const CONFIG = {
    // Booking engine. {arrival} and {departure} become YYYY-MM-DD, {adults} and {children} numbers.
    // Another engine just needs its own address here, e.g. 'https://example.com/book?checkin={arrival}&checkout={departure}&adults={adults}&children={children}'.
    bookingUrl: 'https://ibe.smarthotel.nl/hotel/95abf20a-8b60-4257-9257-4a60dcbb300e/{arrival}/{departure}/{adults}/{children}/0/0/rooms',
    // Booking engine home page, used by the "book" links when the calendar is not available.
    bookingHome: 'https://ibe.smarthotel.nl/?id=95abf20a-8b60-4257-9257-4a60dcbb300e&segment=Hotel',
    hotelEmail: 'reservation@firsteuroflathotel.be',
  };

  const html = document.documentElement;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasGsap = !!(window.gsap && window.ScrollTrigger);
  const motion = hasGsap && !reduce;
  const finePointer = matchMedia('(pointer: fine)').matches;
  // Interface strings for the three language versions of the page.
  const LANG = ['en', 'nl'].find((l) => html.lang.startsWith(l)) || 'fr';
  const T = {
    fr: {
      close: 'Fermer',
      price: { grand: 'de 400 à 655 €', petit: 'de 390 à 500 €' },
      layouts: { theatre: 'Théâtre', ecole: 'École', conseil: 'Conseil', u: 'En U' },
      copy: 'Copier l’adresse', copied: 'Adresse copiée', copyFail: 'Copie impossible, sélectionnez l’adresse',
      info: { subject: 'Demande d’information', body: 'Bonjour,\n\n' },
      roomNames: { grand: 'Grand Charlemagne (90 m²)', petit: 'Charlemagne I ou II (45 m²)' },
      bb: {
        region: 'Réservation', book: 'Réserver', room: 'Chambre', meeting: 'Salle de réunion',
        arrival: 'Arrivée', departure: 'Départ', adults: 'Adultes', children: 'Enfants',
        date: 'Date', slot: 'Horaire', participants: 'Participants',
        choose: 'Choisir', chooseDates: 'Choisir les dates', seeAvail: 'Voir les disponibilités', requestQuote: 'Demander une offre',
        pickArrival: 'Choisissez votre date d’arrivée', pickDeparture: 'Choisissez votre date de départ', pickDate: 'Choisissez la date de votre réunion',
        clear: 'Effacer', close: 'Fermer', prev: 'Mois précédent', next: 'Mois suivant', less: 'Retirer', more: 'Ajouter',
        nights: (n) => (n === 1 ? '1 nuit' : `${n} nuits`),
        slots: ['Journée complète', 'Matinée', 'Après-midi', 'Soirée'],
      },
      meetingMail: (date, slot, people, pick) => ({
        subject: 'Demande de réservation de salle de réunion',
        body: [
          'Bonjour,', '',
          'Je souhaite réserver une salle de réunion au First Euroflat Hotel.', '',
          `Date : ${date}`,
          `Horaire : ${slot}`,
          `Participants : ${people}`,
          ...(pick ? [`Salle : ${pick.room}`, `Disposition : ${pick.layout}`] : []),
          'Formule : forfait Light Lunch, forfait menu 3 services ou salle seule', '',
          'Nom : ', 'Société : ', 'Téléphone : ', '',
          'Merci d’avance,', '',
        ],
      }),
      offer: (room, layout, cap) => ({
        subject: 'Demande d’offre pour une réunion',
        body: [
          'Bonjour,', '',
          'Je souhaite recevoir une offre pour une réunion au First Euroflat Hotel.', '',
          `Salle : ${room === 'grand' ? 'Grand Charlemagne (90 m²)' : 'Charlemagne I ou II (45 m²)'}`,
          `Disposition : ${layout} (jusqu’à ${cap} personnes)`,
          'Date souhaitée : ',
          'Nombre de participants : ',
          'Formule : forfait Light Lunch, forfait menu 3 services ou salle seule', '',
          'Merci d’avance,', '',
        ],
      }),
    },
    en: {
      close: 'Close',
      price: { grand: 'from €400 to €655', petit: 'from €390 to €500' },
      layouts: { theatre: 'Theatre', ecole: 'Classroom', conseil: 'Boardroom', u: 'U-shape' },
      copy: 'Copy address', copied: 'Address copied', copyFail: 'Copy failed, select the address',
      info: { subject: 'Information request', body: 'Hello,\n\n' },
      roomNames: { grand: 'Grand Charlemagne (90 m²)', petit: 'Charlemagne I or II (45 m²)' },
      bb: {
        region: 'Booking', book: 'Book', room: 'Room', meeting: 'Meeting room',
        arrival: 'Check-in', departure: 'Check-out', adults: 'Adults', children: 'Children',
        date: 'Date', slot: 'Time', participants: 'Participants',
        choose: 'Select', chooseDates: 'Choose your dates', seeAvail: 'Check availability', requestQuote: 'Request a quote',
        pickArrival: 'Choose your check-in date', pickDeparture: 'Choose your check-out date', pickDate: 'Choose the date of your meeting',
        clear: 'Clear', close: 'Close', prev: 'Previous month', next: 'Next month', less: 'Fewer', more: 'More',
        nights: (n) => (n === 1 ? '1 night' : `${n} nights`),
        slots: ['Full day', 'Morning', 'Afternoon', 'Evening'],
      },
      meetingMail: (date, slot, people, pick) => ({
        subject: 'Meeting room booking request',
        body: [
          'Hello,', '',
          'I would like to book a meeting room at the First Euroflat Hotel.', '',
          `Date: ${date}`,
          `Time: ${slot}`,
          `Participants: ${people}`,
          ...(pick ? [`Room: ${pick.room}`, `Layout: ${pick.layout}`] : []),
          'Option: Light Lunch package, three-course menu package or room only', '',
          'Name: ', 'Company: ', 'Phone: ', '',
          'Thank you,', '',
        ],
      }),
      offer: (room, layout, cap) => ({
        subject: 'Meeting quote request',
        body: [
          'Hello,', '',
          'I would like to receive a quote for a meeting at the First Euroflat Hotel.', '',
          `Room: ${room === 'grand' ? 'Grand Charlemagne (90 m²)' : 'Charlemagne I or II (45 m²)'}`,
          `Layout: ${layout} (up to ${cap} people)`,
          'Preferred date: ',
          'Number of participants: ',
          'Option: Light Lunch package, three-course menu package or room only', '',
          'Thank you,', '',
        ],
      }),
    },
    nl: {
      close: 'Sluiten',
      price: { grand: 'van € 400 tot € 655', petit: 'van € 390 tot € 500' },
      layouts: { theatre: 'Theater', ecole: 'School', conseil: 'Boardroom', u: 'U-vorm' },
      copy: 'Adres kopiëren', copied: 'Adres gekopieerd', copyFail: 'Kopiëren mislukt, selecteer het adres',
      info: { subject: 'Vraag om informatie', body: 'Goedendag,\n\n' },
      roomNames: { grand: 'Grand Charlemagne (90 m²)', petit: 'Charlemagne I of II (45 m²)' },
      bb: {
        region: 'Reserveren', book: 'Reserveren', room: 'Kamer', meeting: 'Vergaderzaal',
        arrival: 'Aankomst', departure: 'Vertrek', adults: 'Volwassenen', children: 'Kinderen',
        date: 'Datum', slot: 'Tijdstip', participants: 'Deelnemers',
        choose: 'Kiezen', chooseDates: 'Kies uw data', seeAvail: 'Beschikbaarheid bekijken', requestQuote: 'Offerte aanvragen',
        pickArrival: 'Kies uw aankomstdatum', pickDeparture: 'Kies uw vertrekdatum', pickDate: 'Kies de datum van uw vergadering',
        clear: 'Wissen', close: 'Sluiten', prev: 'Vorige maand', next: 'Volgende maand', less: 'Minder', more: 'Meer',
        nights: (n) => (n === 1 ? '1 nacht' : `${n} nachten`),
        slots: ['Volledige dag', 'Voormiddag', 'Namiddag', 'Avond'],
      },
      meetingMail: (date, slot, people, pick) => ({
        subject: 'Reservatieaanvraag vergaderzaal',
        body: [
          'Goedendag,', '',
          'Graag reserveer ik een vergaderzaal in het First Euroflat Hotel.', '',
          `Datum: ${date}`,
          `Tijdstip: ${slot}`,
          `Deelnemers: ${people}`,
          ...(pick ? [`Zaal: ${pick.room}`, `Opstelling: ${pick.layout}`] : []),
          'Formule: Light Lunch-formule, driegangenmenu-formule of enkel de zaal', '',
          'Naam: ', 'Bedrijf: ', 'Telefoon: ', '',
          'Alvast bedankt,', '',
        ],
      }),
      offer: (room, layout, cap) => ({
        subject: 'Offerteaanvraag voor een vergadering',
        body: [
          'Goedendag,', '',
          'Graag ontvang ik een offerte voor een vergadering in het First Euroflat Hotel.', '',
          `Zaal: ${room === 'grand' ? 'Grand Charlemagne (90 m²)' : 'Charlemagne I of II (45 m²)'}`,
          `Opstelling: ${layout} (tot ${cap} personen)`,
          'Gewenste datum: ',
          'Aantal deelnemers: ',
          'Formule: Light Lunch-formule, driegangenmenu-formule of enkel de zaal', '',
          'Alvast bedankt,', '',
        ],
      }),
    },
  }[LANG];
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
    document.body.classList.add('menu-open');
    menu.hidden = false;
    nav.classList.add('menu-open');
    nav.classList.remove('is-hidden');
    toggle.setAttribute('aria-expanded', 'true');
    toggle.firstElementChild.textContent = T.close;
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
    document.body.classList.remove('menu-open');
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
    grand: { w: 600, price: T.price.grand, cap: { theatre: 80, ecole: 52, conseil: 40, u: 36 } },
    petit: { w: 300, price: T.price.petit, cap: { theatre: 30, ecole: 20, conseil: 15, u: 12 } },
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
      plan.touched = true;
      $$(`.chip[data-${key}]`).forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
      renderPlan(true);
    });
  });
  renderPlan(false);

  /* ---------- E-mail links ---------- */
  // The mailto link opens the visitor's mail app; the toast covers devices without one.
  const HOTEL_MAIL = CONFIG.hotelEmail;
  const toast = $('.mail-toast');
  const copyBtn = $('[data-copy]', toast);
  let toastTimer;

  function mailContent(kind) {
    if (kind !== 'offre') return T.info;
    const { subject, body } = T.offer(plan.room, T.layouts[plan.layout], ROOMS[plan.room].cap[plan.layout]);
    return { subject, body: body.join('\n') };
  }

  function hideToast() {
    toast.classList.remove('is-in');
    document.body.classList.remove('toast-open');
    setTimeout(() => { if (!toast.classList.contains('is-in')) toast.hidden = true; }, 500);
  }
  function showToast() {
    toast.hidden = false;
    copyBtn.textContent = T.copy;
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
      prepareFallback(subject, body);
    });
  });
  function prepareFallback(subject, body) {
    $('[data-gmail]', toast).href = `https://mail.google.com/mail/?view=cm&fs=1&to=${HOTEL_MAIL}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    showToast();
  }
  $('.mail-toast-close', toast).addEventListener('click', hideToast);
  copyBtn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(HOTEL_MAIL);
      copyBtn.textContent = T.copied;
    } catch {
      copyBtn.textContent = T.copyFail;
    }
  });

  /* ---------- Booking bar: rooms go to SmartHotel, meeting rooms by e-mail ---------- */
  const LOCALE = { fr: 'fr-BE', en: 'en-GB', nl: 'nl-BE' }[LANG];
  const B = T.bb;
  const pad = (n) => String(n).padStart(2, '0');
  const iso = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const parseISO = (v) => { const [y, m, d] = v.split('-').map(Number); return new Date(y, m - 1, d); };
  const sameDay = (a, b) => !!a && !!b && a.getTime() === b.getTime();
  const nightsBetween = (a, b) => Math.round((b - a) / 86400000);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const firstMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const MONTHS_AHEAD = 18; // how far ahead the calendar goes, current month included
  const lastMonth = new Date(today.getFullYear(), today.getMonth() + MONTHS_AHEAD - 1, 1);
  const fmtShort = new Intl.DateTimeFormat(LOCALE, { weekday: 'short', day: 'numeric', month: 'short' });
  const fmtLong = new Intl.DateTimeFormat(LOCALE, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const fmtMonth = new Intl.DateTimeFormat(LOCALE, { month: 'long', year: 'numeric' });
  const fmtWeekday = new Intl.DateTimeFormat(LOCALE, { weekday: 'narrow' });
  const WEEKDAYS = Array.from({ length: 7 }, (_, i) => fmtWeekday.format(new Date(2024, 0, 1 + i))); // 1 Jan 2024 was a Monday
  const LIMITS = { adults: [1, 8], children: [0, 6], people: [1, 100] };
  const wide = () => window.innerWidth >= 900;

  const bk = {
    mode: 'room', arr: null, dep: null, date: null, picking: 'arrival',
    adults: 2, children: 0, people: 10, slot: 0,
    view: firstMonth, open: false, sheet: false, ready: false,
  };

  const stepper = (key, label) => `
      <div class="bb-field bb-step">
        <span class="bb-label" id="bb-${key}">${label}</span>
        <div class="stepper" role="group" aria-labelledby="bb-${key}">
          <button type="button" data-step-key="${key}" data-delta="-1" aria-label="${B.less} (${label})">−</button>
          <output data-out="${key}">${bk[key]}</output>
          <button type="button" data-step-key="${key}" data-delta="1" aria-label="${B.more} (${label})">+</button>
        </div>
      </div>`;

  const backdrop = document.createElement('div');
  backdrop.className = 'bb-backdrop';
  const bar = document.createElement('div');
  bar.className = 'bookbar';
  bar.dataset.mode = 'room';
  bar.setAttribute('role', 'region');
  bar.setAttribute('aria-label', B.region);
  bar.setAttribute('data-lenis-prevent', '');
  bar.innerHTML = `
    <div class="bb-head"><p class="bb-title">${B.book}</p><button type="button" class="bb-close" aria-label="${B.close}">×</button></div>
    <div class="bb-tabs" role="tablist">
      <button type="button" role="tab" data-mode="room" aria-selected="true">${B.room}</button>
      <button type="button" role="tab" data-mode="meeting" aria-selected="false">${B.meeting}</button>
    </div>
    <div class="bb-fields">
      <div class="bb-group" data-for="room">
        <button type="button" class="bb-field" data-pick="arrival"><span class="bb-label">${B.arrival}</span><span class="bb-value" data-out="arr">${B.choose}</span></button>
        <button type="button" class="bb-field" data-pick="departure"><span class="bb-label" data-out="dep-label">${B.departure}</span><span class="bb-value" data-out="dep">${B.choose}</span></button>
        ${stepper('adults', B.adults)}
        ${stepper('children', B.children)}
      </div>
      <div class="bb-group" data-for="meeting" hidden>
        <button type="button" class="bb-field" data-pick="date"><span class="bb-label">${B.date}</span><span class="bb-value" data-out="date">${B.choose}</span></button>
        <label class="bb-field bb-select"><span class="bb-label">${B.slot}</span><select data-in="slot">${B.slots.map((v, i) => `<option value="${i}">${v}</option>`).join('')}</select></label>
        ${stepper('people', B.participants)}
      </div>
    </div>
    <button type="button" class="btn btn-dark bb-submit">${B.seeAvail}</button>
    <button type="button" class="bb-open">${B.chooseDates}</button>
    <div class="bb-cal" hidden>
      <div class="bb-cal-nav">
        <button type="button" class="bb-nav" data-month="-1" aria-label="${B.prev}">‹</button>
        <button type="button" class="bb-nav" data-month="1" aria-label="${B.next}">›</button>
      </div>
      <div class="bb-months"></div>
      <div class="bb-cal-foot"><p class="bb-hint" aria-live="polite"></p><button type="button" class="bb-clear">${B.clear}</button></div>
    </div>`;
  document.body.append(backdrop, bar);
  document.body.classList.add('has-bookbar');

  const cal = $('.bb-cal', bar);
  const monthsEl = $('.bb-months', bar);
  const submitBtn = $('.bb-submit', bar);
  const monthsShown = () => {
    if (bk.sheet || !wide()) return MONTHS_AHEAD;
    return window.innerWidth >= 1200 ? 3 : 2;
  };
  const lastView = () => new Date(lastMonth.getFullYear(), lastMonth.getMonth() - (monthsShown() - 1), 1);

  function renderCal(dir = 0) {
    const n = monthsShown();
    monthsEl.style.setProperty('--months', n);
    let out = '';
    for (let m = 0; m < n; m++) {
      const first = new Date(bk.view.getFullYear(), bk.view.getMonth() + m, 1);
      const lead = (first.getDay() + 6) % 7; // weeks start on Monday
      const count = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate();
      let cells = '<span></span>'.repeat(lead);
      for (let d = 1; d <= count; d++) {
        const day = new Date(first.getFullYear(), first.getMonth(), d);
        cells += `<button type="button" class="bb-day" data-day="${iso(day)}" aria-label="${fmtLong.format(day)}"${day < today ? ' disabled' : ''}><span>${d}</span></button>`;
      }
      out += `<div class="bb-month" data-month-of="${first.getFullYear()}-${pad(first.getMonth() + 1)}"><div class="bb-month-head"><p class="bb-month-title">${fmtMonth.format(first)}</p>
        <div class="bb-week" aria-hidden="true">${WEEKDAYS.map((w) => `<span>${w}</span>`).join('')}</div></div>
        <div class="bb-grid">${cells}</div></div>`;
    }
    monthsEl.innerHTML = out;
    $('[data-month="-1"]', bar).disabled = bk.view <= firstMonth;
    $('[data-month="1"]', bar).disabled = bk.view >= lastView();
    paint();
    if (dir && motion) gsap.fromTo(monthsEl, { x: dir * 28, opacity: 0 }, { x: 0, opacity: 1, duration: 0.45, ease: 'expo.out' });
  }

  // Marks the chosen range; while picking a departure, the hovered day previews the end.
  function paint(hover) {
    const room = bk.mode === 'room';
    const end = room ? (bk.dep || (bk.picking === 'departure' && hover && bk.arr && hover > bk.arr ? hover : null)) : null;
    $$('.bb-day', monthsEl).forEach((b) => {
      const d = parseISO(b.dataset.day);
      const start = room ? sameDay(d, bk.arr) : sameDay(d, bk.date);
      const isEnd = room && sameDay(d, end);
      b.classList.toggle('is-start', start);
      b.classList.toggle('is-end', isEnd);
      b.classList.toggle('has-range', start && !!end);
      b.classList.toggle('in-range', room && !!bk.arr && !!end && d > bk.arr && d < end);
      b.classList.toggle('is-today', sameDay(d, today));
      b.setAttribute('aria-pressed', String(start || isEnd));
    });
  }

  function update() {
    const room = bk.mode === 'room';
    $('[data-out="arr"]', bar).textContent = bk.arr ? fmtShort.format(bk.arr) : B.choose;
    $('[data-out="dep"]', bar).textContent = bk.dep ? fmtShort.format(bk.dep) : B.choose;
    $('[data-out="dep-label"]', bar).textContent = bk.arr && bk.dep ? `${B.departure} (${B.nights(nightsBetween(bk.arr, bk.dep))})` : B.departure;
    $('[data-out="date"]', bar).textContent = bk.date ? fmtShort.format(bk.date) : B.choose;
    let hint;
    if (room) {
      if (!bk.arr) hint = B.pickArrival;
      else if (!bk.dep) hint = B.pickDeparture;
      else hint = `${B.nights(nightsBetween(bk.arr, bk.dep))}, ${fmtShort.format(bk.arr)} → ${fmtShort.format(bk.dep)}`;
    } else {
      hint = bk.date ? fmtLong.format(bk.date) : B.pickDate;
    }
    $('.bb-hint', bar).textContent = hint;
    $$('[data-pick]', bar).forEach((f) => {
      const active = (bk.open || bk.sheet) && (f.dataset.pick === 'date' || f.dataset.pick === bk.picking);
      f.classList.toggle('is-active', active);
    });
    Object.keys(LIMITS).forEach((k) => {
      $(`[data-step-key="${k}"][data-delta="-1"]`, bar).disabled = bk[k] <= LIMITS[k][0];
      $(`[data-step-key="${k}"][data-delta="1"]`, bar).disabled = bk[k] >= LIMITS[k][1];
    });
  }

  function viewFor(date) {
    const ref = date || today;
    if (bk.sheet || !wide()) return firstMonth; // the phone sheet lists every month from now on
    let v = new Date(ref.getFullYear(), ref.getMonth(), 1);
    if (v > lastView()) v = lastView();
    return v < firstMonth ? firstMonth : v;
  }

  function openCal(pick) {
    if (pick === 'arrival' || pick === 'departure') {
      if (bk.mode !== 'room') setMode('room');
      bk.picking = pick === 'departure' && bk.arr ? 'departure' : 'arrival';
    }
    if (pick === 'date' && bk.mode !== 'meeting') setMode('meeting');
    const ref = bk.mode === 'room' ? (bk.picking === 'departure' ? bk.arr : bk.arr || null) : bk.date;
    bk.view = viewFor(ref);
    if (!wide()) { openSheet(); return; }
    renderCal();
    if (!bk.open) {
      bk.open = true;
      cal.hidden = false;
      refreshBar();
      if (motion) gsap.fromTo(cal, { opacity: 0, y: 16, scale: 0.98 }, { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: 'expo.out' });
    }
    update();
    const focusDay = $('.bb-day.is-start', monthsEl) || $(`.bb-day[data-day="${iso(today)}"]`, monthsEl) || $('.bb-day:not([disabled])', monthsEl);
    if (focusDay) focusDay.focus({ preventScroll: true });
  }

  function closeCal() {
    if (!bk.open) return;
    bk.open = false;
    update();
    refreshBar();
    if (motion) gsap.to(cal, { opacity: 0, y: 10, duration: 0.25, onComplete: () => { if (!bk.open) cal.hidden = true; } });
    else cal.hidden = true;
  }

  function scrollSheetToSelection() {
    const ref = (bk.mode === 'room' ? bk.arr : bk.date) || today;
    const m = $(`.bb-month[data-month-of="${ref.getFullYear()}-${pad(ref.getMonth() + 1)}"]`, monthsEl);
    monthsEl.scrollTop = m ? m.offsetTop - monthsEl.offsetTop : 0;
  }

  function openSheet() {
    if (!bk.sheet) {
      bk.sheet = true;
      bar.classList.add('is-sheet');
      backdrop.classList.add('is-on');
      cal.hidden = false;
      cal.style.opacity = '';
      document.body.style.overflow = 'hidden';
      if (lenis) lenis.stop();
      refreshBar();
      setTimeout(() => $('.bb-close', bar).focus({ preventScroll: true }), 50);
    }
    bk.view = firstMonth;
    renderCal();
    update();
    scrollSheetToSelection();
  }

  function closeSheet() {
    if (!bk.sheet) return;
    bk.sheet = false;
    bar.classList.remove('is-sheet');
    backdrop.classList.remove('is-on');
    cal.hidden = true;
    document.body.style.overflow = '';
    if (lenis) lenis.start();
    update();
    refreshBar();
  }

  function setMode(mode) {
    bk.mode = mode;
    bar.dataset.mode = mode;
    $$('.bb-tabs [role="tab"]', bar).forEach((t) => t.setAttribute('aria-selected', String(t.dataset.mode === mode)));
    $$('.bb-group', bar).forEach((g) => { g.hidden = g.dataset.for !== mode; });
    submitBtn.textContent = mode === 'room' ? B.seeAvail : B.requestQuote;
    if (bk.open || bk.sheet) { bk.view = viewFor(mode === 'room' ? bk.arr : bk.date); renderCal(); }
    update();
    if (bk.sheet) scrollSheetToSelection();
  }

  function submit() {
    if (bk.mode === 'room') {
      if (!bk.arr || !bk.dep) { openCal(bk.arr ? 'departure' : 'arrival'); return; }
      const url = CONFIG.bookingUrl
        .replace('{arrival}', iso(bk.arr)).replace('{departure}', iso(bk.dep))
        .replace('{adults}', bk.adults).replace('{children}', bk.children);
      window.open(url, '_blank', 'noopener');
    } else {
      if (!bk.date) { openCal('date'); return; }
      const pick = plan.touched ? { room: T.roomNames[plan.room], layout: T.layouts[plan.layout] } : null;
      const { subject, body } = T.meetingMail(fmtLong.format(bk.date), B.slots[bk.slot], bk.people, pick);
      const text = body.join('\n');
      window.location.href = `mailto:${HOTEL_MAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(text)}`;
      prepareFallback(subject, text);
    }
    closeCal();
    closeSheet();
  }

  // The bar slides in after the opening animation and steps aside for the footer, the menu and the mail toast.
  function refreshBar() {
    const nearFooter = contact.getBoundingClientRect().top < window.innerHeight * 0.75;
    const show = bk.ready && !document.body.classList.contains('menu-open') && (bk.open || bk.sheet || !nearFooter);
    bar.classList.toggle('is-in', show);
    if (!show && bk.open) closeCal();
  }
  function showBar() { bk.ready = true; refreshBar(); }
  window.addEventListener('scroll', () => requestAnimationFrame(refreshBar), { passive: true });

  bar.addEventListener('click', (e) => {
    const tab = e.target.closest('[role="tab"]');
    if (tab) { setMode(tab.dataset.mode); if (bk.open) openCal(bk.mode === 'room' ? 'arrival' : 'date'); return; }
    const step = e.target.closest('[data-step-key]');
    if (step) {
      const k = step.dataset.stepKey;
      const up = +step.dataset.delta > 0;
      const size = k === 'people' && (up ? bk.people >= 20 : bk.people > 20) ? 5 : 1;
      bk[k] = Math.min(LIMITS[k][1], Math.max(LIMITS[k][0], bk[k] + (up ? size : -size)));
      $(`[data-out="${k}"]`, bar).textContent = bk[k];
      update();
      return;
    }
    const field = e.target.closest('[data-pick]');
    if (field) { openCal(field.dataset.pick); return; }
    const nav = e.target.closest('[data-month]');
    if (nav) {
      const d = +nav.dataset.month;
      bk.view = new Date(bk.view.getFullYear(), bk.view.getMonth() + d, 1);
      renderCal(d);
      return;
    }
    if (e.target.closest('.bb-clear')) {
      bk.arr = bk.dep = bk.date = null;
      bk.picking = 'arrival';
      paint(); update();
      return;
    }
    if (e.target.closest('.bb-open')) { openCal(bk.mode === 'room' ? 'arrival' : 'date'); return; }
    if (e.target.closest('.bb-close')) { closeSheet(); return; }
    if (e.target.closest('.bb-submit')) submit();
  });
  $('[data-in="slot"]', bar).addEventListener('change', (e) => { bk.slot = +e.target.value; });

  monthsEl.addEventListener('click', (e) => {
    const b = e.target.closest('.bb-day');
    if (!b || b.disabled) return;
    const d = parseISO(b.dataset.day);
    if (bk.mode === 'meeting') {
      bk.date = d;
      paint(); update();
      if (bk.open) setTimeout(closeCal, 220);
      return;
    }
    if (bk.picking === 'arrival' || !bk.arr || d <= bk.arr) {
      bk.arr = d; bk.dep = null; bk.picking = 'departure';
    } else {
      bk.dep = d; bk.picking = 'arrival';
      if (bk.open) setTimeout(closeCal, 260);
    }
    paint(); update();
  });
  monthsEl.addEventListener('mouseover', (e) => {
    if (bk.mode !== 'room' || bk.picking !== 'departure') return;
    const b = e.target.closest('.bb-day:not([disabled])');
    paint(b ? parseISO(b.dataset.day) : null);
  });
  monthsEl.addEventListener('mouseleave', () => paint());
  monthsEl.addEventListener('keydown', (e) => {
    const moves = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 };
    const b = e.target.closest('.bb-day');
    if (!b || !(e.key in moves)) return;
    e.preventDefault();
    const cur = parseISO(b.dataset.day);
    const target = new Date(cur.getFullYear(), cur.getMonth(), cur.getDate() + moves[e.key]);
    if (target < today) return;
    let el = $(`.bb-day[data-day="${iso(target)}"]`, monthsEl);
    if (!el) {
      const back = moves[e.key] < 0;
      bk.view = viewFor(new Date(target.getFullYear(), target.getMonth() - (back ? 0 : monthsShown() - 1), 1));
      renderCal(back ? -1 : 1);
      el = $(`.bb-day[data-day="${iso(target)}"]`, monthsEl);
    }
    if (el) el.focus();
  });

  document.addEventListener('mousedown', (e) => { if (bk.open && !bar.contains(e.target)) closeCal(); });
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    if (bk.sheet) closeSheet();
    else if (bk.open) { closeCal(); const f = $('.bb-field.is-active', bar) || $('[data-pick]', bar); if (f) f.focus(); }
  });
  backdrop.addEventListener('click', closeSheet);
  let shownCount = monthsShown();
  window.addEventListener('resize', () => {
    if (wide() && bk.sheet) closeSheet();
    else if (!wide() && bk.open) closeCal();
    else if (bk.open && monthsShown() !== shownCount) { bk.view = viewFor(bk.view); renderCal(); }
    shownCount = monthsShown();
  });

  // Every "book" button on the page opens this calendar instead of leaving the site.
  $$('.btn-book, .hero-actions .btn, .rooms-aside .btn, .big-cta, .book-float').forEach((a) => {
    a.href = CONFIG.bookingHome;
    a.addEventListener('click', (e) => {
      e.preventDefault();
      closeMenu();
      bk.ready = true;
      openCal('arrival');
    });
  });

  update();
  if (!motion) showBar();

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
    setTimeout(showBar, 700);
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
      onComplete: () => { if (lenis) lenis.start(); showBar(); },
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
