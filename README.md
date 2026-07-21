# eraykulkizaga.github.io

Personal portfolio website for **Eray Kulkızaga** — Backend & AI Software Engineer.

**Live:** [www.eraykulkizaga.com](https://www.eraykulkizaga.com)

---

## About

A minimalist, performant portfolio built entirely from scratch with **pure HTML, CSS and JavaScript** — no frameworks, no build tools, no dependencies. Designed for fast load times, clean code, and full accessibility.

---

## Features

- **Reveal-on-scroll animations** — `IntersectionObserver`-powered, elements animate once as they enter the viewport
- **Parallax hero** — depth layers driven by scroll position, respects `prefers-reduced-motion`
- **Sticky header** — hides on scroll-down, reappears on scroll-up; glassmorphism effect via `backdrop-filter`
- **Responsive overlay navigation** — full-screen mobile menu with focus trapping, Escape key support, ARIA roles
- **Certificate slider** — auto-advancing image carousel with pixel-based JS translation (not %-based) for exact alignment
- **Image modal** — click certificate or award media to zoom in; close with Escape or backdrop click
- **Animated counters** — GPA and cert count animate on scroll with `easeOutCubic` easing
- **Contact form** — `mailto:` based, no backend, no third-party service
- **Custom 404 page** with live 404 detection via `fetch HEAD`
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
| `index.html` | Main portfolio — Hero, Projects, About, Skills, Certificates, Contact |
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
    ├── hero.gif                # Hero animation (MIT License — Michael Jae-Yoon Chung)
    ├── main.png                # Favicon / logo
    ├── cert1–cert7.*           # Certificate preview images
    └── signturk-*.png          # SignTurk UI and award media
```

---

## Implementation Notes

- **CSS custom properties** (`--bg`, `--text`, `--border`, `--shadow`) centralise the entire design token system — theming is a single `:root` block change.
- **Slider logic** reads `container.offsetWidth` at runtime and recalculates on `resize`, so slide positions are always pixel-perfect regardless of viewport.
- **Header scroll behavior** computes scroll velocity: hides only after scrolling down more than 60px, reappears instantly on any upward scroll.
- **`prefers-reduced-motion`** disables every animation and transition globally via a single media query — no conditional JS needed.
- **JSON-LD** `Person` and `Website` schemas embedded in `<head>` for search engine rich results.

---

## License

Code © 2026 Eray Kulkızaga. All rights reserved.

Hero animation visual © 2018 Michael Jae-Yoon Chung — [MIT License](https://opensource.org/licenses/MIT)
