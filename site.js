// LUME INC. — small interactions: the typing word in the hero, the services switcher,
// dot-matrix numbers and the products loader. Everything still reads without JS.
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

  /* products: LUME's message decrypts itself, TONNA's readout runs through a few profiles */
  const ci = document.querySelector('.cipher[data-plain]');
  if (ci && !reduce) {
    const plain = ci.dataset.plain, CH = '#%&*+=?<>/|01ABCDEFabcdef';
    const mix = s => [...s].map(c => c === ' ' ? ' ' : CH[Math.random() * CH.length | 0]).join('');
    const wait = ms => new Promise(r => setTimeout(r, ms));
    (async () => {
      for (;;) {
        ci.textContent = mix(plain); await wait(1600);
        for (let i = 0; i <= plain.length; i++) { ci.textContent = plain.slice(0, i) + mix(plain.slice(i)); await wait(55); }
        await wait(2800);
        for (let i = plain.length; i >= 0; i--) { ci.textContent = plain.slice(0, i) + mix(plain.slice(i)); await wait(28); }
      }
    })();
  }
  const calc = document.querySelector('.calc[data-items]');
  if (calc) {
    const items = JSON.parse(calc.dataset.items), sep = calc.dataset.sep || '.';
    const k = calc.querySelector('.calc-k'), v = calc.querySelector('.calc-v .dm');
    const show = x => dm(v, x.toFixed(3).replace('.', sep));
    let n = 0, cur = items[0][1];
    if (!reduce) setInterval(() => {
      if (document.hidden || calc.closest('.merged')) return;
      n = (n + 1) % items.length;
      const [label, to] = items[n], from = cur, t0 = performance.now();
      k.style.opacity = 0;
      setTimeout(() => { k.textContent = label; k.style.opacity = 1; }, 300);
      const step = now => { const q = Math.min(1, (now - t0) / 700), e = 1 - (1 - q) ** 3; show(from + (to - from) * e); if (q < 1) requestAnimationFrame(step); else cur = to; };
      requestAnimationFrame(step);
    }, 3400);
  }

  /* products: every few seconds the readout's dots fly into the ring and the two products become LUME INC. */
  const ps = document.querySelector('.ps');
  if (ps && !reduce) {
    const stage = ps.querySelector('.ps-stage'), fly = ps.querySelector('.ps-fly'), word = ps.querySelector('.ps-word');
    const digits = ps.querySelector('.calc-v .dm');
    const wait = ms => new Promise(r => setTimeout(r, ms));
    let visible = false, home = [];
    new IntersectionObserver(([e]) => { visible = e.isIntersecting; }, { threshold: 0.35 }).observe(ps);
    // where the lockup goes: ring + gap + wordmark, centred in the stage
    const geo = () => {
      const W = stage.clientWidth, H = stage.clientHeight, fs = parseFloat(getComputedStyle(word).fontSize);
      const R = Math.round(fs * 0.9), gap = Math.round(fs * 0.45), tw = word.firstElementChild.offsetWidth;
      const x0 = W / 2 - (R + gap + tw) / 2, cy = H * (W < 600 ? 0.44 : 0.5);
      ps.style.setProperty('--mx', `${x0 + R / 2}px`); ps.style.setProperty('--my', `${cy}px`);
      ps.style.setProperty('--ms', `${R}px`); ps.style.setProperty('--wx', `${x0 + R + gap}px`);
      return { cx: x0 + R / 2, cy, r: R / 2 - 1 };
    };
    const dotsNow = () => {
      const s = stage.getBoundingClientRect();
      return [...digits.querySelectorAll('circle')].map(c => { const b = c.getBoundingClientRect(); return [b.left - s.left + b.width / 2, b.top - s.top + b.height / 2, Math.max(3, b.width)]; });
    };
    const onRing = (g, n) => Array.from({ length: n }, (_, i) => { const a = i / n * Math.PI * 2 - Math.PI / 2; return [g.cx + Math.cos(a) * g.r, g.cy + Math.sin(a) * g.r]; });
    // one dot per circle of the readout; in: readout → ring, out: ring → readout
    const flight = (from, to, out) => Promise.all(from.map((p, i) => {
      const d = from[i][2] || to[i][2] || 4, el = document.createElement('i');
      el.style.cssText = `width:${d}px;height:${d}px;left:${p[0] - d / 2}px;top:${p[1] - d / 2}px`;
      fly.append(el);
      const dx = to[i][0] - p[0], dy = to[i][1] - p[1];
      const kf = out
        ? [{ transform: 'translate(0,0) scale(.4)', opacity: 0, backgroundColor: '#F2F1EF' }, { opacity: 1, offset: 0.2 }, { transform: `translate(${dx}px,${dy}px) scale(1)`, opacity: 1, backgroundColor: '#F48C64' }]
        : [{ transform: 'translate(0,0) scale(1)', opacity: 1, backgroundColor: '#F48C64' }, { opacity: 1, offset: 0.8 }, { transform: `translate(${dx}px,${dy}px) scale(.4)`, opacity: 0, backgroundColor: '#F2F1EF' }];
      const a = el.animate(kf, { duration: out ? 1000 : 1150, delay: Math.random() * 240, easing: 'cubic-bezier(.6,0,.2,1)', fill: 'forwards' });
      return a.finished.then(() => el.remove());
    }));
    addEventListener('resize', () => { if (ps.classList.contains('merged')) geo(); });
    (async () => {
      for (;;) {
        await wait(6500);
        while (!visible || document.hidden) await wait(400);
        const g = geo();
        home = dotsNow();
        const ring = onRing(g, home.length).map((p, i) => [...p, home[i][2]]);
        ps.classList.add('merged');
        await flight(home, ring, false);
        await wait(3400);
        const g2 = geo(), back = onRing(g2, home.length).map((p, i) => [...p, home[i][2]]);
        ps.classList.remove('merged');
        await wait(350);
        await flight(back, home, true);
      }
    })();
  }

  /* products loader */
  document.querySelectorAll('.dots[data-n]').forEach(el => {
    el.innerHTML = Array.from({ length: +el.dataset.n }, (_, k) => `<i style="--i:${k}"></i>`).join('');
  });
})();
