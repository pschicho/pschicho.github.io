# Homepage of Philipp Schicho

Static site served by GitHub Pages at <https://pschicho.github.io/>. No build step:
edit the files and push.

Built on the [Wowchemy / Hugo Academic](https://wowchemy.com) theme (v5.7), exported to
plain HTML and moved to Bootstrap 5.3. `css/styles.css` holds the theme rules, plus a
short "Bootstrap 5 settings" block at the top that restores the theme's Bootstrap
customisations (colours, gutters, container width, navbar). Libraries come from cdnjs:
Bootstrap 5 (CSS and JS), jQuery, Isotope and
imagesLoaded (research filter), MathJax 2 (LaTeX in INSPIRE titles).

## Pages

| File | Content |
| --- | --- |
| `index.html` | Homepage: about, experience, publications, group, research, teaching, talks, contact |
| `talks/index.html` | Full talk list |

## Content that lives in data files

Most lists are rendered from plain JavaScript data files, so updating them never
touches the HTML. Each file documents its fields at the top.

| Data | Renderer | Shown in |
| --- | --- | --- |
| `js/talks-data.js` | `js/talks.js` | Talks preview on the homepage, `talks/index.html`. Also the source for the CV talk lists (`tools/talks_to_tex.py`). |
| `js/lectures-data.js` | `js/teaching.js` | Teaching → Lectures |
| `js/outreach-data.js` | `js/teaching.js` | Outreach section; hidden (with its navbar link) while the list is empty |
| `js/group-data.js` | `js/group.js` | TPC group members |
| INSPIRE API (live) | `js/publications.js` | Most-cited and latest publications |

## Other scripts

| File | Purpose |
| --- | --- |
| `js/theme.js` | Dark mode (light / dark / auto), shared by all pages; loaded first in `<body>` |
| `js/render.js` | Shared helpers (`window.Site`): HTML escaping, list-entry markup, file:// URL fix |
| `js/site.js` | Navbar scrolling, scrollspy, Isotope research filter |
| `js/mathjax-config.js` | MathJax settings; must load before MathJax |

## Assets

- `assets/doc/` – CV and talk-list PDFs
- `assets/talks/` – slides and lecture notes (`<event><yy>.pdf`, `<event><yy>_lec<n>.pdf`)
- `assets/img/` – images. Keep figures as SVG so they scale; run large ones through
  `npx svgo --multipass` and keep any embedded bitmaps at a sensible resolution
  (`universe.svg` embeds three JPEGs, ≤1500 px).

## Local preview

Open `index.html` directly, or run `python3 -m http.server` in this folder and visit
<http://localhost:8000>.
