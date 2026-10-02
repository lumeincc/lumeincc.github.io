<img src=".github/banner.svg" width="100%" alt="LUME INC. We build everything.">

The LUME INC. site.

**[→ lumeincc.github.io](https://lumeincc.github.io/)** · **[RU](https://lumeincc.github.io/ru/)**

Static. No build step. GitHub Pages serves `main` as is.

| File | What it is |
|---|---|
| `index.html` | English page. Copy lives here |
| `ru/index.html` | Russian page. Same markup, same assets. Edit both when the copy changes |
| `style.css` | White page, one mono face (JetBrains Mono) for all text, crop-mark frames |
| `site.js` | Draws the pixel type (Latin and Cyrillic) and the dot-matrix numbers from one 5x7 font, and runs the hero board |
| `fonts/` | JetBrains Mono, self-hosted (Latin and Cyrillic, SIL OFL 1.1). No Google Fonts request |
| `favicon.svg`, `og.png` | Tab icon and link preview |

Pixel text is any element with `data-px="TEXT"`. Add `data-mode="dot"` for round dots, `data-cursor` for the blinking block, `data-cell` for size.

The hero board is a canvas inside `[data-board="LUME INC."]`; `data-words="A|B|C"` lists the words it cycles through. The cursor erases back to what two words share and types the rest. Dots step aside from the pointer and scatter on a click. With reduced motion words switch at once.
