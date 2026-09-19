# Continuous landscape film

Source: [Aerial View of Magnificent Green Hills, Mixkit item 100408](https://mixkit.co/free-stock-video/aerial-view-of-magnificent-green-hills-100408/).

The item page explicitly lists the [Mixkit Stock Video Free License](https://mixkit.co/license/) for commercial or personal projects. Checked 10 September 2026. The portfolio credits the source in its final frame. This is licensed stock footage, not a recording made by Eray or an AI-generated project visual.

The 20.687-second silent camera shot is used once across the entire homepage. Its time is derived from overall document scroll, never restarted for a project or experience entry.

Optimized H.264 variants: desktop 1280×720; portrait mobile 450×800, centre crop. Keyframe interval 6 at 24 fps, CRF 26, no B-frames, yuv420p, faststart. Posters match the first frame. Encoding uses FFmpeg only during authoring; it is not a runtime dependency.

Preview with `python tools/serve.py` (port 4174). Byte-range responses are required for browser random access; the basic Python `http.server` is insufficient for reliable video scrubbing. A failed media load leaves the poster and all HTML interactions usable. Reduced-motion/save-data defaults do not request the film.
