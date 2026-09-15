# Portfolio hero work

- This branch starts from published origin/main 6c5efc7. Do not import the rejected unpushed whole-site redesign or its generator scripts.
- Static GitHub Pages: edit index.html, hero-entry.css, hero-entry.js and the user-supplied hero-loader.css. Preserve CNAME and all content below the hero.
- Scroll controls the HTML text mask, not video.currentTime. Keep native scrolling, reduced-motion/save-data poster fallbacks, playback controls and bounded loader dismissal.
- Media origin and derivatives are in MEDIA-CREDITS.md. No runtime dependencies are needed.
- Every HTML page loads `i18n.js` before `script.js`. English is the default; the header's single `TR`/`EN` control switches the full document and persists `portfolio-language` in local storage. Keep translations explicit and reversible, preserve project names, code identifiers, metrics and technology names, and refresh dynamic UI through the `portfolio-language-change` event.
- Preview: python -m http.server 4175 --bind 127.0.0.1. Run node --check hero-entry.js and git diff --check; browser-test scroll exit, 390/1024px overflow, reduced motion, failed media and keyboard navigation. Basic HTTP preview tests continuous playback, not seek/scrub support.
- Keep temporary files in ignored output/. Never commit or push without authorization.
- YazarIS has a bespoke bilingual case study in project-yazaris.html and yazaris.css. Its illustrated order is fictional, not a product screenshot. Repository evidence checked at 07e6c95: private source, product UI/export still planned, BiGG/BİGGNITE first-stage milestone is not funding. Recheck upstream before changing claims or dataset numbers.
