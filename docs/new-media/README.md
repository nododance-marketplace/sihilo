# Security media update — October 8, 2026

User-supplied source folder: `D:\Downloads\SIHILO\New Images`. Original files remain unchanged there. The [manifest](manifest.json) records source paths, hashes, dimensions, derivatives and the user's publication request.

| Supplied file | Homepage placement |
| --- | --- |
| Neon Night Security Operations Dashboard.png | Replaces the schematic dashboard with the supplied Sihilo interface concept; image opens at full size. |
| Thermal.jpg | Thermal verification panel in Security Intelligence. |
| Computer Vision detection.mp4 | Silent, looping detection panel beside thermal imagery in Security Intelligence. |
| speaker activation.png | Operator-controlled deterrence illustration under Sihilo Air. |

Original drone-to-owl hero video retained. Existing property photography and assessment/pilot flows retained. New interface and detection media are labelled illustrative; no deployed product capability or customer footage is claimed.

Image derivatives use AVIF/WebP, responsive sizes and lazy loading without upscaling. Complete interface/thermal/speaker frames are preserved. Video is 1280 × 720 H.264 with fast-start metadata, approximately 1.33 MiB versus the 13.73 MiB source. Its source audio is removed for the website loop. A static poster is provided.

The loop defers its video request until it is visible and motion is enabled. It pauses when scrolled away and has an independent play/pause button. The main page motion control pauses both videos; reduced-motion users see the static poster until choosing to play.

Validation: ESLint, HTML validation, TypeScript `checkJs`, production build, four Chromium viewport tests, WCAG A/AA automated accessibility scans, image loading, navigation/form regression checks, deferred video loading, muted looping and both play/pause controls passed. Desktop/mobile screenshots were visually reviewed. Build output: 92 files, approximately 5.15 MiB; browsers load only chosen responsive derivatives and the detection MP4 is deferred.

Updated code: `index.html`, `css/photography.css`, `js/main.js`, `tests/homepage.spec.mjs`. New optimized assets: `assets/security/`. Preparation script: `scripts/prepare_new_media.py`. Review screenshots, source hashes and measurements are retained under `docs/`.

GitHub/Vercel publication is authorized by the user's request and follows successful validation.
