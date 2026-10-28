// LUME INC. — small interactions: the typing word in the hero, the services switcher,
// dot-matrix numbers and screenshots that scroll on their own. Everything still reads without JS.
(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* dot-matrix numbers: <span class="dm" data-dm="07:30" data-pitch="6"> */
  const GL = {
    '0': ['.###.', '#...#', '#...#', '#...#', '#...#', '#...#', '.###.'],
    '1': ['#', '#', '#', '#', '#', '#', '#'],
    '2': ['.###.', '#...#', '....#', '.###.', '#....', '#....', '#####'],
    '3': ['####.', '....#', '....#', '.###.', '....#', '....#', '####.'],
    '4': ['#...#', '#...#', '#...#', '#####', '....#', '....#', '....#'],
    '5': ['#####', '#....', '#....', '####.', '....#', '....#', '####.'],
    '6': ['.###.', '#....', '#....', '####.', '#...#', '#...#', '.###.'],
    '7': ['#####', '....#', '....#', '...#.', '..#..', '..#..', '..#..'],
    '8': ['.###.', '#...#', '#...#', '.###.', '#...#', '#...#', '.###.'],
    '9': ['.###.', '#...#', '#...#', '.####', '....#', '....#', '.###.'],
    ':': ['.', '.', '#', '.', '#', '.', '.'],
    '.': ['.', '.', '.', '.', '.', '.', '#'],
    ',': ['..', '..', '..', '..', '..', '.#', '#.'],
    ' ': ['..', '..', '..', '..', '..', '..', '..']
  };
  const dm = (el, str = el.dataset.dm) => {
    const p = +el.dataset.pitch || 6, r = p * 0.36, out = [];
    let x = 0;
    for (const ch of str) {
      const g = GL[ch] || GL[' '], w = g[0].length;
      for (let j = 0; j < 7; j++) for (let i = 0; i < w; i++)
        if (g[j][i] === '#') out.push(`<circle cx="${((x + i) * p + p / 2).toFixed(1)}" cy="${(j * p + p / 2).toFixed(1)}" r="${r.toFixed(2)}"/>`);
      x += w + 1;
    }
    const W = (x - 1) * p, H = 7 * p;
    el.setAttribute('role', 'img');
    el.setAttribute('aria-label', str);
    el.innerHTML = `<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" fill="currentColor" aria-hidden="true">${out.join('')}</svg>`;
  };
  document.querySelectorAll('.dm[data-dm]').forEach(el => dm(el));
  window.lumeDM = dm;   // the projects page redraws its readouts

  /* hero: types a word, erases back to what the next word shares, types the rest */
  const cyc = document.querySelector('.cycle[data-words]');
  if (cyc && !reduce) {
    const words = cyc.dataset.words.split('|');
    let i = 0, shown = words[0];
    const common = (a, b) => { let k = 0; while (k < a.length && k < b.length && a[k] === b[k]) k++; return k; };
    const wait = ms => new Promise(r => setTimeout(r, ms));
    const run = async () => {
      for (;;) {
        await wait(2200);
        if (document.hidden) continue;
        const next = words[(i + 1) % words.length], keep = common(shown, next);
        while (shown.length > keep) { shown = shown.slice(0, -1); cyc.textContent = shown; await wait(38); }
        while (shown.length < next.length) { shown = next.slice(0, shown.length + 1); cyc.textContent = shown; await wait(62); }
        i = (i + 1) % words.length;
      }
    };
    run();
  }

  /* services: tabs with arrow-key support */
  const tabs = [...document.querySelectorAll('.tab')];
  const phone = matchMedia('(max-width: 860px)');
  const select = t => {
    // on phones the list is an accordion: keep the tapped row where the finger is
    const before = phone.matches ? t.getBoundingClientRect().top : 0;
    tabs.forEach(x => {
      const on = x === t;
      x.setAttribute('aria-selected', String(on));
      x.tabIndex = on ? 0 : -1;
      document.getElementById(x.getAttribute('aria-controls')).hidden = !on;
    });
    if (phone.matches) window.scrollBy(0, t.getBoundingClientRect().top - before);
  };
  tabs.forEach((t, k) => {
    t.addEventListener('click', () => select(t));
    t.addEventListener('keydown', e => {
      const d = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[e.key];
      if (!d) return;
      e.preventDefault();
      const n = tabs[(k + d + tabs.length) % tabs.length];
      select(n); n.focus();
    });
  });

  /* screenshots scroll by themselves while on screen; a hand or a wheel on them stops it for a while */
  if (!reduce) document.querySelectorAll('[data-auto]').forEach(el => {
    let visible = false, hold = 0, last = 0, pos = 0, end = 0;
    new IntersectionObserver(([e]) => { visible = e.isIntersecting; }, { threshold: 0.25 }).observe(el);
    const stop = () => { hold = performance.now() + 4000; };
    ['pointerenter', 'pointermove', 'wheel', 'touchstart', 'focus'].forEach(ev => el.addEventListener(ev, stop, { passive: true }));
    const speed = el.closest('.phone') ? 36 : 64;     // CSS px per second
    const tick = now => {
      const dt = Math.min(64, now - (last || now)); last = now;
      if (visible && now > hold && !document.hidden) {
        const max = el.scrollHeight - el.clientHeight;
        if (Math.abs(pos - el.scrollTop) > 2) pos = el.scrollTop;   // the visitor scrolled it: carry on from there
        if (max > 0 && pos >= max - 1) {
          if (!end) end = now;
          else if (now - end > 2000) { el.scrollTop = pos = 0; end = 0; hold = now + 1500; }
        } else if (max > 0) { pos = Math.min(max, pos + speed * dt / 1000); el.scrollTop = pos; }
      }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
})();
