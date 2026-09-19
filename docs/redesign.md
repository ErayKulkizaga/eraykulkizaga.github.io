# Portfolio redesign — September 2026

## Initial audit and superseded direction

The previous live portfolio used a delayed signature, luminous blue canvas streams, a large navigation, repeated project cards and long credential sections. These competed with the actual engineering work. Project descriptions also needed to catch up with their repositories. The existing static architecture, personal identity, direct contact/CV links, authentic SignTurk media and graduation award were worth preserving. The original mobile layout did not show horizontal overflow in the inspected 390 px viewport; the problem was hierarchy and presentation rather than a wholesale responsive failure.

The new direction looks beneath an interface. Warm paper, deep forest, muted sage and a controlled copper accent frame technical diagrams and real product evidence. Manrope supplies readable UI typography; Instrument Serif adds an editorial voice. There are no decorative glow fields, generic AI illustrations or repeated three-card grids.

The opening separates an interface into layers as the visitor scrolls, moves the composition into an inspection shot, then assembles it beside the next invitation. The project index allows an immediate jump past the film-like sequence. Five native HTML chapters connect problem, system and outcome; individual pages have their own art direction and product explanation. Credentials sit in an optional disclosure. Velora remains a small learning Lab.

## Current project evidence

Repositories were reviewed again on 10 September, including the relevant implementation and architecture documents where available. Illustrative diagrams explain documented contracts; they are not represented as captured production interfaces.

| Project | Evidence and publishing boundary |
| --- | --- |
| [SupportFlow AI](https://github.com/kanfan/supportflow-ai) | README, document ingestion and deployment ADRs: verified organization context, ticket/audit workflows and retry-safe ingestion are implemented. Eray and Emir share ownership; Eray currently leads the Terraform/release foundation. AI/RAG and live AWS deployment evidence remain future work. The commit-to-queue failure window is disclosed. |
| [YazarIS](https://github.com/ErayKulkizaga/yazaris) | README, PRODUCTION_PLAN.md and typed domain: intent/context and shared catalog-line validation are foundations in development. Concurrency-safe approval, exact decimals and business UI remain open. TÜBİTAK BiGG first-stage progress is confirmed by Eray and recorded as a founder report upstream; no funding or investment claim is made. |
| [SignTurk](https://github.com/ErayKulkizaga/SignTurk) | README, model contract/card and actual çay recording at commit `4533b8095d5caaca3edc5b71bb1f7ff4edfb840c`: the bundled live model has 179 classes and 16-frame landmark input. The separate 226-class research ensemble's 94.17% Top-1 is explicitly held-out offline evidence, not live accuracy. Eray's ML/backend leadership and shared UI/3D work remain distinct. |
| [QueryPilot](https://github.com/ErayKulkizaga/QueryPilot) | Current v2.0.2 README and [public demo](https://querypilot.eraykulkizaga.com/): local Python/AST/read-only database behavior differs from browser TypeScript rules with no SQL execution. The captured public result uses its prepared synthetic fixture; displayed plan costs are not measured customer gains. The optional AI call was not used. |
| [Metering & Billing](https://github.com/ErayKulkizaga/Capstone-Metering-Billing) | README and API: an initial meter request and identical replay return the original 201 response; changed payload under the same key returns 409. PostgreSQL locks, integer micro-USD and verified Stripe test-mode events are described within capstone scope. The portfolio interaction is entirely local and illustrative. |

Higgsfield's available account had zero paid credits. Its available trial preset did not serve this direction. No trial activation, paid generation or external resource was created; authentic media and native motion supplied the visual material.

## Continuous-film revision — 11 September 2026

Eray rejected the separated chapter-camera treatment and the removal of experience logos. The clarified direction is realistic nature footage, like the supplied video reference, with one uninterrupted visual journey across the entire homepage.

The homepage now uses one persistent 20.687-second licensed landscape shot. Its clock is derived from total document scroll. It does not autoplay, loop or restart at project boundaries; backwards scroll seeks backwards in the same source. Fourteen HTML overlays contain introduction, work index, five projects, three professional experiences, profile, credentials, Lab and contact. There are no independent project camera animations or changing section backgrounds. Microsoft, FlyRank and İSKUR logos and detailed experience text were restored from the original page, matching the supplied screenshot. The stale FlyRank “Ongoing” label was removed without inventing a completion certificate. The İSKUR 41% figure is preserved from the user's original experience content, not a newly measured result.

The desktop film is 1280×720 / 11.1 MB and the portrait mobile variant 450×800 / 4.0 MB. First-frame posters are 159 KB and 57 KB. Six-frame H.264 keyframes support precise scrubbing. The clip comes from Mixkit's Free License collection; attribution and source are in `videos/landscape/README.md` and the last frame's HTML. No paid or AI generation was used.

The first preview exposed a real media issue: basic Python HTTP serving returned no byte-range support, and browser seeks clamped to zero. `tools/serve.py` now supports 206 single-range responses and 416 out-of-range responses. The controller also deduplicates identical seek targets, so a host that cannot seek cannot create a seeked-event busy loop. Production hosting must support video byte ranges.

Reduced motion and save-data initialize a static, fully readable document without loading the video. The manual Motion control releases the video source and restores every HTML element. A media failure leaves the poster and navigation available. No renderer runs at rest, and no project/model API is called.

Current checks: static verifier passes nine pages / 194 local references, including the single non-looping film and the three restored company logos. JavaScript syntax passes. The full mobile film was checked at measured 390 px width and the desktop flow at 1024 px: no horizontal overflow; targeted anchors show their matching content fully opaque. Video time reached 20.6368 seconds at contact and returned to 6.3495 seconds at SignTurk using the same source. Keyboard Motion toggling released the source and left zero inert elements. Local server range and invalid-range responses were exercised.

These checks use the desktop Chromium-based in-app browser and resized viewports. Physical iOS/Android devices, Safari, field Core Web Vitals and sustained 60 FPS were not measured. No commit, push or publication was performed. Earlier visual/motion verification describes the superseded chapter treatment; the current acceptance check is continuous film plus preserved experience content.
