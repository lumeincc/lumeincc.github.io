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
    ' ': ['..', '..', '..', '..', '..', '..', '..']
  };
  document.querySelectorAll('.dm[data-dm]').forEach(el => {
    const str = el.dataset.dm, p = +el.dataset.pitch || 6, r = p * 0.36, out = [];
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
  });

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
  const select = t => {
    tabs.forEach(x => {
      const on = x === t;
      x.setAttribute('aria-selected', String(on));
      x.tabIndex = on ? 0 : -1;
      document.getElementById(x.getAttribute('aria-controls')).hidden = !on;
    });
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

  /* products loader */
  document.querySelectorAll('.dots[data-n]').forEach(el => {
    el.innerHTML = Array.from({ length: +el.dataset.n }, (_, k) => `<i style="--i:${k}"></i>`).join('');
  });
})();
