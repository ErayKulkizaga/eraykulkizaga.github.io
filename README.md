# eraykulkizaga.github.io

Personal portfolio website for **Eray Kulkızaga** — Backend & AI Software Engineer.

**Live:** [www.eraykulkizaga.com](https://www.eraykulkizaga.com)

---

## About

A minimalist, performant portfolio built entirely from scratch with **pure HTML, CSS and JavaScript** — no frameworks, no build tools, no dependencies. Designed for fast load times, clean code, and full accessibility.

---

## Features

- **Animated opening signature** — a short CSS-native `E R A Y` sequence introduces the site without a third-party visual
- **Developer-system hero** — code, runtime signals, and status motion establish the engineering direction immediately
- **Alternating section surfaces** — dark, white, neutral, and blue-tinted scenes separate the portfolio narrative
- **Reveal-on-scroll animations** — `IntersectionObserver`-powered elements animate once as they enter the viewport
- **Sticky header** — compact dark navigation with a glass-like `backdrop-filter`
- **Responsive overlay navigation** — full-screen mobile menu with focus trapping, Escape key support, ARIA roles
- **Certificate slider** — user-controlled image carousel with pixel-based JS translation for exact alignment
- **Image modal** — click certificate or award media to zoom in; close with Escape or backdrop click
- **Direct contact** — email, LinkedIn, GitHub, and current CV without form friction
- **Responsive product media** — wide SignTurk interface captures remain inside phone and tablet viewports
- **Custom 404 page**
- **PWA manifest** — add-to-home-screen support

---

## Tech Stack

| Layer | Technology |
|---|---|
| Markup | HTML5, Semantic elements, ARIA, JSON-LD |
| Styling | CSS3, CSS Grid, Flexbox, Custom Properties |
| Behaviour | Vanilla JavaScript, IntersectionObserver, rAF |
| Performance | Lazy loading, async decoding, preconnect hints, deferred scripts |
| SEO | Open Graph, Twitter Cards, Canonical URLs, Sitemap XML |
| Deployment | GitHub Pages + Custom Domain (CNAME) |

---

## Project Pages

| Page | Description |
|---|---|
| `index.html` | Main portfolio — Hero, Projects, Experience, About, Skills, Credentials, Contact |
| `project-sign-language.html` | [SignTurk](https://github.com/ErayKulkizaga/SignTurk) — award-winning Turkish Sign Language platform |
| `project-eraykulkizaga.html` | This portfolio site detail |
| `privacy.html` | Privacy policy |
| `404.html` | Custom not-found page |

---

## File Structure

```
├── index.html                  # Main page
├── project-sign-language.html  # Project detail — SignTurk
├── project-eraykulkizaga.html  # Project detail — This portfolio
├── privacy.html                # Privacy policy
├── 404.html                    # Custom 404
├── style.css                   # Single shared stylesheet
├── script.js                   # Single shared JS file
├── manifest.webmanifest        # PWA manifest
├── sitemap.xml                 # Sitemap for search engines
├── robots.txt                  # Crawler rules
├── CNAME                       # Custom domain for GitHub Pages
└── images/
    ├── main.png                # Favicon / logo
    ├── og-portfolio-dark.png   # Social sharing artwork
    ├── cert1–cert7.*           # Certificate preview images
    └── signturk-*.webp         # Optimised SignTurk UI and award media
```

---

## Implementation Notes

- **CSS custom properties** (`--bg`, `--text`, `--border`, `--shadow`) centralise the entire design token system — theming is a single `:root` block change.
- **CSS-native hero motion** animates the opening signature, developer console, runtime signals, and footer without a third-party visual asset.
- **Slider logic** reads `container.clientWidth` at runtime and recalculates on `resize`, so slide positions stay aligned at every viewport.
- **Responsive project media** uses zero-minimum grid tracks and intrinsic image sizing to prevent wide product screenshots from escaping mobile viewports.
- **`prefers-reduced-motion`** disables every animation and transition globally via a single media query — no conditional JS needed.
- **JSON-LD** `Person` and `Website` schemas provide search-engine context.

---

## License

Code © 2026 Eray Kulkızaga. All rights reserved.
