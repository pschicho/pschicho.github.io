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
| `thesis/index.html` | Thesis enquiry form for students (see below) |

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
| `js/thesis-form.js` | Sends the thesis enquiry form to Web3Forms |

## Thesis enquiry form

`thesis/index.html` has no backend of its own: [Web3Forms](https://web3forms.com) emails
each submission to the address its access key was created for. The key sits in the
hidden `access_key` input and is public by design. Spam protection is deliberately
light, with no CAPTCHA: the hidden `botcheck` honeypot catches bots that fill in every
field, and Web3Forms runs its own spam filter. A bot that posts to the API directly
with the public key gets through. If that becomes a problem, add Web3Forms' free
hCaptcha (<https://docs.web3forms.com/getting-started/customizations/spam-protection/hcaptcha>)
and make it mandatory in the [Web3Forms dashboard](https://app.web3forms.com), so it
is checked on the server.

## Assets

- `assets/doc/` – CV and talk-list PDFs
- `assets/talks/` – slides and lecture notes (`<event><yy>.pdf`, `<event><yy>_lec<n>.pdf`)
- `assets/img/` – images. Keep figures as SVG so they scale; run large ones through
  `npx svgo --multipass` and keep any embedded bitmaps at a sensible resolution.
  `universe.svg` and `universe-dark.svg` are generated from the TikZ source in
  `tools/universe/` by `python3 tools/make_universe.py`; edit the source, not the SVGs.
  `hello.svg` and `hello-dark.svg` (the waving figure next to the greeting) are
  generated with the TPC logos by `tools/make_logo.py` (see `assets/logo/README.md`).

## Local preview

Open `index.html` directly, or run `python3 -m http.server` in this folder and visit
<http://localhost:8000>.
