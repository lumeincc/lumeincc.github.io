// LUME INC. — the Projects page: theme switches, the heat dial, the Instagram
// viewer, the slide deck, the business card, the Telegram bot demo and the small project cards.
// Runs after site.js (it uses window.lumeDM for the dot-matrix readouts). Everything still reads without JS.
(() => {
  const M = document.currentScript.dataset.media;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const phone = matchMedia('(max-width: 860px)');
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const swipe = (el, back, fwd) => {
    let x0 = null;
    el.addEventListener('pointerdown', e => { if (e.pointerType !== 'mouse') x0 = e.clientX; });
    el.addEventListener('pointerup', e => { if (x0 === null) return; const dx = e.clientX - x0; x0 = null; if (Math.abs(dx) > 40) (dx > 0 ? back : fwd)(); });
    el.addEventListener('pointercancel', () => { x0 = null; });
  };

  /* dark / light: swap the screenshots of a block, keep the scroll position */
  $$('[data-theme-set]').forEach(sec => {
    const btns = $$('.seg button', sec);
    btns.forEach(b => b.addEventListener('click', () => {
      btns.forEach(x => x.setAttribute('aria-pressed', String(x === b)));
      $$('img[data-tpl]', sec).forEach(im => { im.src = M + im.dataset.tpl.replace('{t}', b.dataset.t); });
    }));
  });

  /* identity: drag the temperature, the steel colour follows */
  const GLOW = [[500, '#3A0B07'], [600, '#6B1208'], [700, '#A1190B'], [800, '#CF2F10'], [900, '#EC5317'], [1000, '#F67E1F'], [1100, '#FBA62A'], [1200, '#FFCF4A'], [1300, '#FFF1BE']];
  const glowAt = t => {
    for (let i = 0; i < GLOW.length - 1; i++) {
      const [t0, c0] = GLOW[i], [t1, c1] = GLOW[i + 1];
      if (t <= t1) {
        const k = Math.max(0, (t - t0) / (t1 - t0)), h = c => [1, 3, 5].map(j => parseInt(c.slice(j, j + 2), 16));
        const a = h(c0), b = h(c1);
        return '#' + a.map((v, j) => Math.round(v + (b[j] - v) * k).toString(16).padStart(2, '0')).join('');
      }
    }
    return GLOW.at(-1)[1];
  };
  const heat = $('.heat');
  if (heat) {
    const r = $('.heat-range', heat), d = $('.heat-dm', heat);
    const set = () => {
      const v = +r.value;
      heat.style.setProperty('--c', glowAt(v));
      heat.style.setProperty('--r', glowAt(Math.max(v, 780)));   // the readout stays legible on graphite
      heat.style.setProperty('--k', ((v - 500) / 800).toFixed(3));
      if (window.lumeDM) window.lumeDM(d, String(v));
    };
    r.addEventListener('input', set); set();
  }

  /* instagram: the grid on the left, the open post on the right */
  const igd = JSON.parse($('#ig-data')?.textContent || 'null');
  if (igd) {
    const fr = $('.ig-frame'), im = $('.ig-img'), cap = $('.ig-cap'), dots = $('.ig-dots');
    const prev = $('.prev', fr), next = $('.next', fr);
    let cur = igd.posts[0], k = 0;
    const draw = () => {
      const n = cur.s.length;
      fr.classList.toggle('tallv', !!cur.story);
      im.src = M + cur.s[k]; im.alt = n > 1 ? `${cur.t} · ${k + 1}/${n}` : cur.t;
      if (cur.s[k + 1]) new Image().src = M + cur.s[k + 1];
      prev.disabled = k === 0; next.disabled = k >= n - 1;
      dots.innerHTML = n > 1 ? Array.from({ length: n }, (_, i) => `<i${i === k ? ' class="on"' : ''}></i>`).join('') : '';
      cap.textContent = cur.t;
    };
    const open = (item, el) => {
      cur = item; k = 0; draw();
      $$('.ig-cell, .ig-hl button').forEach(c => c === el ? c.setAttribute('aria-current', 'true') : c.removeAttribute('aria-current'));
      if (phone.matches) fr.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' });
    };
    $$('.ig-cell').forEach(c => c.addEventListener('click', () => open(igd.posts[+c.dataset.i], c)));
    $$('.ig-hl button').forEach(b => b.addEventListener('click', () => open(igd.hl[+b.dataset.h], b)));
    const step = d => { const n = cur.s.length; const j = Math.max(0, Math.min(n - 1, k + d)); if (j !== k) { k = j; draw(); } };
    prev.addEventListener('click', () => step(-1));
    next.addEventListener('click', () => step(1));
    swipe(im, () => step(-1), () => step(1));
    draw();
  }


  /* presentation: arrows, the scrubber, swipes */
  const deck = $('.deck');
  if (deck) {
    const im = $('.deck-img', deck), r = $('.deck-range', deck), d = $('.deck-dm', deck), p = $('.prev', deck), n = $('.next', deck);
    const N = +r.max, pad = i => String(i).padStart(2, '0');
    const go = i => {
      i = Math.max(1, Math.min(N, i)); r.value = i;
      im.src = `${M}slides/${pad(i)}.webp`; im.alt = `${r.getAttribute('aria-label')} ${i}`;
      if (window.lumeDM) window.lumeDM(d, pad(i));
      p.disabled = i === 1; n.disabled = i === N;
      if (i < N) new Image().src = `${M}slides/${pad(i + 1)}.webp`;
    };
    r.addEventListener('input', () => go(+r.value));
    p.addEventListener('click', () => go(+r.value - 1));
    n.addEventListener('click', () => go(+r.value + 1));
    swipe(im, () => go(+r.value - 1), () => go(+r.value + 1));
    p.disabled = true;
  }


  /* small project cards that change by themselves while on screen */
  if (!reduce) $$('[data-cycle]').forEach(box => {
    const ims = $$('img', box);
    let i = 0, vis = false;
    if (ims.length < 2) return;
    new IntersectionObserver(([e]) => { vis = e.isIntersecting; }, { threshold: 0.3 }).observe(box);
    setInterval(() => {
      if (!vis || document.hidden) return;
      ims[i].classList.remove('on'); i = (i + 1) % ims.length; ims[i].classList.add('on');
    }, 3200);
  });

  /* the business card turns over */
  $$('.vcard').forEach(c => c.addEventListener('click', () => c.setAttribute('aria-pressed', String(c.getAttribute('aria-pressed') !== 'true'))));

  /* the Telegram bot, answering from its own pages */
  const bd = JSON.parse($('#bot-data')?.textContent || 'null');
  if (bd) {
    const log = $('.tg-log');
    const add = (cls, html, tag = 'div') => { const m = document.createElement(tag); m.className = cls; m.innerHTML = html; log.append(m); return m; };
    const down = () => log.scrollTo({ top: log.scrollHeight, behavior: reduce ? 'auto' : 'smooth' });
    const show = key => {
      const pg = bd.pages[key];
      const m = add('tg-m in', `<img src="${M}${pg.p}" width="960" height="540" alt="" loading="lazy"><p>${pg.t}</p>`);
      m.querySelector('img').addEventListener('load', down, { once: true });
      const keys = key === 'home' ? pg.b : [...pg.b, 'home'];
      if (keys.length) {
        const kb = add('tg-kb', '');
        keys.forEach(k => {
          const b = document.createElement('button');
          b.type = 'button'; b.textContent = bd.titles[k];
          if (k === 'lead' || k === 'home' || keys.length === 1) b.classList.add('wide');
          b.addEventListener('click', () => press(k, kb));
          kb.append(b);
        });
      }
      if (key === 'lead') add('tg-m note', bd.note);
      while (log.children.length > 40) log.firstElementChild.remove();
      down();
    };
    const press = (k, kb) => {
      kb.setAttribute('aria-disabled', 'true');
      add('tg-m out', '').textContent = bd.titles[k];
      const ty = add('tg-typing', '<i></i><i></i><i></i>');
      down();
      setTimeout(() => { ty.remove(); show(k); }, reduce ? 0 : 650);
    };
    show('home');
  }
})();
