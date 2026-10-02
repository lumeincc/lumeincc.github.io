// LUME INC. — draws the pixel type (square cells) and dot-matrix numbers (round cells)
// from one 5x7 font, the same one the GitHub banners use.
(function () {
  "use strict";

  var FONT = {
    A: "01110 10001 10001 11111 10001 10001 10001", B: "11110 10001 10001 11110 10001 10001 11110",
    C: "01110 10001 10000 10000 10000 10001 01110", D: "11110 10001 10001 10001 10001 10001 11110",
    E: "11111 10000 10000 11110 10000 10000 11111", F: "11111 10000 10000 11110 10000 10000 10000",
    G: "01110 10001 10000 10111 10001 10001 01111", H: "10001 10001 10001 11111 10001 10001 10001",
    I: "11111 00100 00100 00100 00100 00100 11111", J: "00111 00010 00010 00010 00010 10010 01100",
    K: "10001 10010 10100 11000 10100 10010 10001", L: "10000 10000 10000 10000 10000 10000 11111",
    M: "10001 11011 10101 10101 10001 10001 10001", N: "10001 10001 11001 10101 10011 10001 10001",
    O: "01110 10001 10001 10001 10001 10001 01110", P: "11110 10001 10001 11110 10000 10000 10000",
    Q: "01110 10001 10001 10001 10101 10010 01101", R: "11110 10001 10001 11110 10100 10010 10001",
    S: "01111 10000 10000 01110 00001 00001 11110", T: "11111 00100 00100 00100 00100 00100 00100",
    U: "10001 10001 10001 10001 10001 10001 01110", V: "10001 10001 10001 10001 10001 01010 00100",
    W: "10001 10001 10001 10101 10101 10101 01010", X: "10001 10001 01010 00100 01010 10001 10001",
    Y: "10001 10001 01010 00100 00100 00100 00100", Z: "11111 00001 00010 00100 01000 10000 11111",
    0: "01110 10001 10011 10101 11001 10001 01110", 1: "00100 01100 00100 00100 00100 00100 01110",
    2: "01110 10001 00001 00010 00100 01000 11111", 3: "11110 00001 00001 01110 00001 00001 11110",
    4: "00010 00110 01010 10010 11111 00010 00010", 5: "11111 10000 11110 00001 00001 10001 01110",
    6: "00110 01000 10000 11110 10001 10001 01110", 7: "11111 00001 00010 00100 01000 01000 01000",
    8: "01110 10001 10001 01110 10001 10001 01110", 9: "01110 10001 10001 01111 00001 00010 01100",
    ".": "00000 00000 00000 00000 00000 01100 01100", "-": "00000 00000 00000 11111 00000 00000 00000",
    "/": "00001 00010 00010 00100 01000 01000 10000", "'": "00100 00100 01000 00000 00000 00000 00000",
    ":": "0 0 1 0 1 0 0", " ": "000 000 000 000 000 000 000"
  };
  // Dot-matrix numbers: the slanted 6 and 9 of a real LED board.
  // Cyrillic for the Russian page: letters that look Latin reuse the Latin glyph.
  "АA ВB ЕE ЁE КK МM НH ОO РP СC ТT ХX".split(" ").forEach(function (p) { FONT[p[0]] = FONT[p[1]]; });
  Object.assign(FONT, {
    "Б": "11111 10000 10000 11110 10001 10001 11110", "Г": "11111 10000 10000 10000 10000 10000 10000",
    "Д": "01111 01001 01001 01001 01001 11111 10001", "Ж": "10101 10101 10101 01110 10101 10101 10101",
    "З": "01110 10001 00001 00110 00001 10001 01110", "И": "10001 10001 10011 10101 11001 10001 10001",
    "Й": "01110 00000 10001 10011 10101 11001 10001", "Л": "01111 01001 01001 01001 01001 01001 11001",
    "П": "11111 10001 10001 10001 10001 10001 10001", "У": "10001 10001 10001 01111 00001 10001 01110",
    "Ф": "00100 01110 10101 10101 10101 01110 00100", "Ц": "10010 10010 10010 10010 10010 11111 00001",
    "Ч": "10001 10001 10001 01111 00001 00001 00001", "Ш": "10001 10001 10101 10101 10101 10101 11111",
    "Щ": "10101 10101 10101 10101 10101 11111 00001", "Ъ": "11000 01000 01000 01110 01001 01001 01110",
    "Ы": "10001 10001 10001 11101 10011 10011 11101", "Ь": "10000 10000 10000 11110 10001 10001 11110",
    "Э": "01110 10001 00001 00111 00001 10001 01110", "Ю": "10010 10101 10101 11101 10101 10101 10010",
    "Я": "01111 10001 10001 01111 00101 01001 10001"
  });

  var DOTS = Object.assign({}, FONT, {
    6: "00010 00100 01000 11110 10001 10001 01110",
    9: "01110 10001 10001 01111 00010 00100 01000"
  });

  var NS = "http://www.w3.org/2000/svg";

  function draw(text, opts) {
    var font = opts.dots ? DOTS : FONT, cells = [], x = 0;
    for (var i = 0; i < text.length; i++) {
      var ch = text[i], rows = (font[ch] || font[" "]).split(" "), w = rows[0].length;
      for (var r = 0; r < 7; r++) for (var c = 0; c < w; c++) if (rows[r][c] === "1") cells.push([x + c, r]);
      x += w + 1;
    }
    var cols = x - 1, cur = opts.cursor ? 6 : 0;
    var svg = document.createElementNS(NS, "svg");
    svg.setAttribute("viewBox", "0 0 " + (cols + cur) + " 7");
    svg.setAttribute("width", (cols + cur) * opts.cell);
    svg.setAttribute("height", 7 * opts.cell);
    svg.setAttribute("class", "px");
    svg.setAttribute("role", "img");
    svg.setAttribute("aria-label", opts.label || text);

    if (opts.dots) {
      cells.forEach(function (p) {
        var dot = document.createElementNS(NS, "circle");
        dot.setAttribute("cx", p[0] + 0.5); dot.setAttribute("cy", p[1] + 0.5); dot.setAttribute("r", 0.4);
        svg.appendChild(dot);
      });
    } else {
      // one path for every cell: a single fill leaves no hairline seams
      var d = cells.map(function (p) { return "M" + p[0] + " " + p[1] + "h1v1h-1z"; }).join("");
      var path = document.createElementNS(NS, "path");
      path.setAttribute("d", d);
      svg.appendChild(path);
    }
    if (cur) {
      var block = document.createElementNS(NS, "rect");
      block.setAttribute("x", cols + 2); block.setAttribute("y", 0);
      block.setAttribute("width", 4); block.setAttribute("height", 7);
      block.setAttribute("class", "cursor");
      svg.appendChild(block);
    }
    return svg;
  }

  document.querySelectorAll("[data-px]").forEach(function (el) {
    el.replaceChildren(draw(el.dataset.px.toUpperCase(), {
      cell: +el.dataset.cell || 8,
      dots: el.dataset.mode === "dot",
      cursor: el.hasAttribute("data-cursor"),
      label: el.dataset.label
    }));
  });

  // "In the works": a row of dots with a wave running through it.
  document.querySelectorAll("[data-loader]").forEach(function (el) {
    var n = +el.dataset.loader || 24, svg = document.createElementNS(NS, "svg");
    svg.setAttribute("viewBox", "0 0 " + n + " 1");
    for (var i = 0; i < n; i++) {
      var dot = document.createElementNS(NS, "circle");
      dot.setAttribute("cx", i + 0.5); dot.setAttribute("cy", 0.5); dot.setAttribute("r", 0.36);
      dot.style.animationDelay = (i * 0.07).toFixed(2) + "s";
      svg.appendChild(dot);
    }
    el.replaceChildren(svg);
  });

  // Hero board: an LED dot grid with a terminal cursor. It cycles through its words,
  // erasing and typing them letter by letter. Lit dots step aside from the pointer
  // and scatter on a click.
  var board = document.querySelector("[data-board]");
  if (board && board.querySelector("canvas").getContext) initBoard(board);

  function initBoard(root) {
    var canvas = root.querySelector("canvas"), ctx = canvas.getContext("2d");
    var area = root.closest(".hero") || root;
    var home = root.dataset.board;
    var words = [home].concat((root.dataset.words || "").split("|").filter(Boolean));
    var still = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
    var ROWS = 9, REACH = 4.5, BLAST = 14;

    // Left edge of every letter of a word, in grid columns (one column of margin),
    // and the column where the cursor goes after it.
    function edges(text) {
      var xs = [], x = 1;
      for (var i = 0; i < text.length; i++) { xs.push(x); x += glyph(text[i])[0].length + 1; }
      return { xs: xs, cursor: x };
    }
    function glyph(ch) { return (DOTS[ch] || DOTS[" "]).split(" "); }
    var COLS = Math.max.apply(null, words.map(function (w) { return edges(w).cursor; })) + 5;

    var cell = 1, dpr = 1, ink = "#000", grid = document.createElement("canvas");
    var parts = [], shown = "", target = "", cur = { x: 1, to: 1 };
    var ptr = null, blink = true, running = false, seen = true, typing = null, quiet = 0;

    function resize() {
      var w = root.clientWidth;
      if (!w) return;
      cell = w / COLS;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = grid.width = Math.round(w * dpr);
      canvas.height = grid.height = Math.round(ROWS * cell * dpr);
      canvas.style.height = ROWS * cell + "px";
      ink = getComputedStyle(root).color;
      // the unlit grid never moves: draw it once per size
      var g = grid.getContext("2d");
      g.clearRect(0, 0, grid.width, grid.height);
      g.fillStyle = ink; g.globalAlpha = 0.09; g.beginPath();
      for (var x = 0; x < COLS; x++) for (var y = 0; y < ROWS; y++) dot(g, x, y, 0.3);
      g.fill();
      paint();
    }

    function dot(c, x, y, r) {
      var s = cell * dpr, cx = (x + 0.5) * s, cy = (y + 0.5) * s;
      c.moveTo(cx + r * s, cy);
      c.arc(cx, cy, r * s, 0, 6.2832);
    }

    // One typed letter: its dots land with a small jolt.
    function put(i, ch) {
      var rows = glyph(ch), x0 = edges(shown).xs[i];
      for (var c = 0; c < rows[0].length; c++) for (var r = 0; r < 7; r++) {
        if (rows[r][c] !== "1") continue;
        var tx = x0 + c, ty = r + 1, jx = still ? 0 : (Math.random() - 0.5) * 0.6, jy = still ? 0 : -0.4 - Math.random() * 0.5;
        parts.push({ i: i, x: tx + jx, y: ty + jy, vx: 0, vy: 0, tx: tx, ty: ty, wait: 0 });
      }
    }

    // Erase back to what the two words share, then type the rest. A space only moves the cursor.
    function tick() {
      typing = null;
      if (target.indexOf(shown) !== 0) {
        var i = shown.length - 1;
        parts = parts.filter(function (p) { return p.i !== i; });
        shown = shown.slice(0, i);
        typing = setTimeout(tick, still ? 0 : 38 + Math.random() * 20);
      } else if (shown.length < target.length) {
        shown = target.slice(0, shown.length + 1);
        put(shown.length - 1, shown[shown.length - 1]);
        typing = setTimeout(tick, still ? 0 : 70 + Math.random() * 70);
      } else {
        quiet = Date.now() + (shown === home ? 3200 : 1800); // how long a finished word stays up
      }
      cur.to = edges(shown).cursor;
      if (still) cur.x = cur.to;
      blink = true;
      wake();
    }

    function show(next) {
      if (next === target) return;
      target = next;
      if (!typing) tick();
    }

    function step() {
      var busy = false;
      parts.forEach(function (p) {
        var ax = 0, ay = 0;
        if (p.wait > 0) { p.wait--; busy = true; }
        else { ax = (p.tx - p.x) * 0.075; ay = (p.ty - p.y) * 0.075; }
        if (ptr) {
          var dx = p.x - ptr.x, dy = p.y - ptr.y, d = Math.sqrt(dx * dx + dy * dy);
          if (d < REACH) { var f = (1 - d / REACH) * 0.6 / (d || 1); ax += dx * f; ay += dy * f; }
        }
        p.vx = (p.vx + ax) * 0.82; p.vy = (p.vy + ay) * 0.82;
        p.x += p.vx; p.y += p.vy;
        var moving = Math.abs(p.vx) + Math.abs(p.vy) > 0.003, off = Math.abs(p.tx - p.x) + Math.abs(p.ty - p.y) > 0.01;
        if (moving || (off && !ptr)) busy = true; // held still by the pointer counts as settled
        else if (!off) { p.x = p.tx; p.y = p.ty; }
      });
      cur.x += (cur.to - cur.x) * 0.45;
      if (Math.abs(cur.to - cur.x) > 0.01) busy = true; else cur.x = cur.to;
      return busy;
    }

    function paint() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(grid, 0, 0);
      ctx.fillStyle = ink;
      if (ptr) {
        // the grid lights up a little around the pointer
        for (var x = Math.max(0, Math.floor(ptr.x - REACH)); x <= Math.min(COLS - 1, ptr.x + REACH); x++) {
          for (var y = Math.max(0, Math.floor(ptr.y - REACH)); y <= Math.min(ROWS - 1, ptr.y + REACH); y++) {
            var d = Math.sqrt((x - ptr.x) * (x - ptr.x) + (y - ptr.y) * (y - ptr.y));
            if (d >= REACH) continue;
            ctx.globalAlpha = 0.28 * (1 - d / REACH);
            ctx.beginPath(); dot(ctx, x, y, 0.3); ctx.fill();
          }
        }
      }
      ctx.globalAlpha = 1; ctx.beginPath();
      parts.forEach(function (p) { dot(ctx, p.x, p.y, 0.4); });
      // the cursor stays solid while typing and blinks when the word is done
      if (blink || typing || still) for (var cx = 0; cx < 4; cx++) for (var cy = 1; cy < 8; cy++) dot(ctx, cur.x + cx, cy, 0.4);
      ctx.fill();
    }

    function wake() {
      if (running) return;
      if (!seen) { paint(); return; }
      running = true;
      requestAnimationFrame(function frame() {
        var busy = step();
        paint();
        if (busy && seen) requestAnimationFrame(frame); else running = false;
      });
    }

    function at(e) {
      var b = canvas.getBoundingClientRect();
      return { x: (e.clientX - b.left) / cell - 0.5, y: (e.clientY - b.top) / cell - 0.5 };
    }

    // pointer: dots step aside; a click or tap scatters them
    if (!still) {
      area.addEventListener("pointermove", function (e) { ptr = at(e); wake(); });
      area.addEventListener("pointerleave", function () { ptr = null; wake(); });
      ["pointerup", "pointercancel"].forEach(function (type) {
        area.addEventListener(type, function (e) { if (e.pointerType !== "mouse") { ptr = null; wake(); } });
      });
      canvas.addEventListener("pointerdown", function (e) {
        var o = at(e);
        parts.forEach(function (p) {
          var dx = p.x - o.x, dy = p.y - o.y, d = Math.sqrt(dx * dx + dy * dy) || 1;
          if (d > BLAST) return;
          var f = (1 - d / BLAST) * (1.6 + Math.random() * 1.6) / d;
          p.vx += dx * f; p.vy += dy * f - Math.random() * 0.6;
          p.wait = Math.max(p.wait, Math.round(10 + Math.random() * 14)); // hang in the air, then come back
        });
        pause(6000);
        wake();
      });
    }

    // the cycle waits a while after a click on the board
    var hold = 0, idx = 0;
    function pause(ms) { hold = Date.now() + ms; }

    if (!still) {
      setInterval(function () {
        var now = Date.now();
        if (!target || !seen || document.hidden || typing || now < hold || now < quiet) return;
        idx = (idx + 1) % words.length;
        show(words[idx]);
      }, 250);
      setInterval(function () { blink = !blink; if (!running && !typing) paint(); }, 530);
    }

    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (es) { seen = es[0].isIntersecting; wake(); }).observe(canvas);
    }
    if ("ResizeObserver" in window) new ResizeObserver(resize).observe(root);
    else window.addEventListener("resize", resize);

    resize();
    // a beat of blinking cursor on an empty board, then the name types itself
    setTimeout(function () { show(home); }, still ? 0 : 600);
  }
})();
