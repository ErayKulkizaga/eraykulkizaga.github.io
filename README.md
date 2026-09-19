# Eray Kulkızaga — portfolio

An editorial portfolio built with static HTML, CSS and JavaScript for GitHub Pages. One continuous nature film spans the whole homepage; document scroll controls its time while real HTML introduces the work and experience. Individual case studies explain the product, contribution and engineering decisions.

Public domain: [www.eraykulkizaga.com](https://www.eraykulkizaga.com). Working-tree changes require publication before they appear there.

## Run and verify

Python 3 is sufficient; there is no package install or production bundler.

```sh
python tools/build_site.py
python tools/verify_site.py
python tools/serve.py
```

Open `http://127.0.0.1:4174`. If Node.js is available, check browser-script syntax with `node --check script.js` and `node --check case-interactions.js`, plus `node --check film.js`.

`verify_site.py` checks local navigation and asset references, duplicate IDs, one H1 per page, publishing metadata, image attributes, selected projects and unresolved template slots. Browser interaction and visual checks remain separate; see [redesign notes](docs/redesign.md).

## Authoring

| Source | Responsibility |
| --- | --- |
| `tools/build_site.py` | Shared shell, verified project data, auxiliary pages and sitemap |
| `tools/home_film.py` / `tools/experience.html` | Continuous homepage and restored professional experience |
| `tools/cases/*.html` | Five independently authored case studies |
| `style.css` / `film.css` | Shared styles and full-screen nature-film layouts |
| `case-studies.css` | Project-specific compositions; loaded on case pages |
| `film.js` | One document-wide video clock, HTML overlay timing and reduced-motion fallback |
| `script.js` | Common font readiness and legacy case-page behavior |
| `case-interactions.js` | Billing's local illustrative request/replay interaction |

Edit these sources, run the generator and include the generated root HTML with the change. GitHub Pages serves the generated files directly; Python never runs in the visitor's browser.

## Project selection

- [SupportFlow AI](https://github.com/kanfan/supportflow-ai): shared ownership, verified organization context, document ingestion and the release path.
- [YazarIS](https://github.com/ErayKulkizaga/yazaris): Turkish order interpretation, catalog validation and human review. TÜBİTAK BiGG first-stage milestone; product in development.
- [SignTurk](https://github.com/ErayKulkizaga/SignTurk): live sign recognition, human approval and separate offline research evidence.
- [QueryPilot](https://github.com/ErayKulkizaga/QueryPilot): deterministic PostgreSQL plan evidence and distinct local/public runtime boundaries.
- [Capstone Metering & Billing](https://github.com/ErayKulkizaga/Capstone-Metering-Billing): idempotency, quotas and Stripe test-mode state.

Velora is a smaller mobile-learning Lab entry. The previous portfolio self-case URL remains as a noindex legacy page.

## Motion and media

Content, navigation and experience logos are real HTML. A single 20.687-second landscape shot stays on screen from introduction to contact. It never restarts at project boundaries. The video is paused: scrolling forwards or backwards changes its time. There is no autoplay, looping, wheel interception or idle render loop.

Desktop uses a 1280×720 H.264 file (11.1 MB); phones use a 450×800 portrait file (4.0 MB). Matching posters render before video is available. Both variants have frequent keyframes for seeking. Source and licensing are recorded in [the media note](videos/landscape/README.md).

System reduced motion and save-data start with the complete readable page and no film request. The Motion control switches between the film and this reading mode. Without JavaScript, all content remains in normal document flow. Failed video loading preserves the landscape poster and usable HTML.

Use the supplied preview server: random-access HTML video needs byte-range responses, which Python's basic `http.server` does not provide. Production hosting must also support byte ranges.

The SignTurk case retains its user-controlled 185 KB silent clip. QueryPilot retains its authentic public-demo screenshot. The five bespoke case pages are preserved.

## Publishing

The existing GitHub Pages custom-domain configuration and Cloudflare Web Analytics are retained. `CNAME`, canonical URLs, Open Graph, JSON-LD, sitemap and crawler settings belong to the same static deployment. There is no application server, secret-bearing environment file or model API in this portfolio.

Code © 2026 Eray Kulkızaga. All rights reserved. Third-party fonts retain their included licenses.
