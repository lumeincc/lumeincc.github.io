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
    var font = opts.dots ? DOTS : FONT, cells = [], x = 0, colonX = null;
    for (var i = 0; i < text.length; i++) {
      var ch = text[i], rows = (font[ch] || font[" "]).split(" "), w = rows[0].length;
      if (ch === ":") colonX = x;
      for (var r = 0; r < 7; r++) for (var c = 0; c < w; c++) if (rows[r][c] === "1") cells.push([x + c, r, ch === ":"]);
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
        if (p[2]) dot.setAttribute("class", "colon");
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

  // Local time in Qazaqstan (UTC+5, no daylight saving), dot matrix.
  var clocks = document.querySelectorAll("[data-clock]"), shown = "";
  function tick() {
    var t = new Date(Date.now() + 5 * 3600e3);
    var hm = ("0" + t.getUTCHours()).slice(-2) + ":" + ("0" + t.getUTCMinutes()).slice(-2);
    if (hm !== shown) {
      shown = hm;
      clocks.forEach(function (el) {
        el.replaceChildren(draw(hm, { cell: +el.dataset.cell || 6, dots: true, label: (el.dataset.label || "Local time in Qazaqstan") + " " + hm }));
      });
    }
  }
  if (clocks.length) { tick(); setInterval(tick, 1000); }

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
})();
