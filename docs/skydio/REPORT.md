# Skydio asset extraction and Sihilo integration

Review date: October 7, 2026. Homepage wording and asset integration validated for publication. GitHub/Vercel publication requested by the user after review.

## Deliverables

- [Clickable contact sheet](contact-sheet.html): all 37 downloaded candidates, linked to originals and source pages.
- [Contact sheet 1](contact-sheet-1.jpg), [2](contact-sheet-2.jpg), [3](contact-sheet-3.jpg), [4](contact-sheet-4.jpg): printable thumbnail sheets with filenames, actual dimensions and original URLs.
- [Source and permission manifest](../../public/images/skydio/image-manifest.json): original URLs, source pages, actual resolution, file format, attribution status, permission notes, recommended placement, SHA-256 hash and derivative details.
- [Complete discovery inventory](inventory.json): 107 unique image URLs and inclusion/exclusion reasons.
- [Updated homepage](../../index.html), with build output in `dist/`.

## Sources and method

Inspected public HTML from [Skydio Physical Security](https://www.skydio.com/solutions/physical-security) and [Skydio X10](https://www.skydio.com/x10). Examined image/srcset/picture URLs, inline backgrounds, video posters, serialized page data and linked stylesheets. Saved page snapshots locally. No login, private endpoints or access-control bypass was used.

Sanity image URLs expose original assets by removing width/format transformation parameters. Downloaded these public original endpoints and checked actual decoded dimensions rather than trusting dimensions embedded in filenames. The rooftop dock file, for example, has an 8642-pixel filename but the public response decodes to 8192 pixels wide. That response is retained unmodified.

Deduplicated discovery by original URL and downloaded files by SHA-256. All 37 retained originals have distinct hashes. Repeated srcset sizes and shared navigation assets do not produce duplicate originals. Descriptive filenames preserve format; optimized derivatives never exceed original dimensions. No AI generation, upscaling, watermark removal or third-party screen replacement was used.

## Permission handling

The user's stated photographer permission is recorded as **user-reported-photographer-permission**, not independently verified licensing. No photographer name was supplied, and no Artist/Copyright metadata was found in retained originals. Attribution is explicitly unknown rather than guessed as “Skydio.” All image entries flag that exact asset-level permission and attribution remain unverified.

Ten photographs are integrated locally on that basis. Ten additional candidates are on **hold-scope-uncertain**: three thermal captures, six possible studio renders/composites, and one aircraft scene of uncertain provenance. None of these held candidates appears on the homepage. Thermal data products may fall outside a photographer's photograph license. Product renders may belong to a different creator.

Interface screenshots, branded marketing graphics, logos, diagrams, inset composites and identifiable-person/event photography were excluded from the homepage. Their small discovery previews remain only in the local review inventory and are not production assets. The manifest contains no invented photographer credit or claim of independent license verification.

## Placements

| Section | Original filename | Design and treatment |
| --- | --- | --- |
| Hero | `hero/commercial-campus-aerial.png` | Cinematic commercial-campus aerial, dark directional overlay, high-priority responsive loading. Illustrative property disclosure. |
| How Sihilo Works | `industrial/skydio-x10-substation-flight.png`, `security/outdoor-security-camera-cluster.png` | Paired mobile/fixed observation panels above the existing workflow. |
| Sihilo Air | `drones/skydio-x10-in-flight-closeup.jpg` | Premium flight close-up in a new roadmap section. Generic aerial caption; no Sihilo manufacturing, ownership or partnership claim. |
| Industries | `industrial/vehicle-inventory-aerial.png`, `commercial-building-construction.png`, `shipping-container-storage-yard.png`, `industrial-logistics-property-aerial.png` | Four compact cards matched to property types. Explicitly illustrative, not customer locations. |
| Security Intelligence | `security/drone-spotlight-night-patrol.png` | Nighttime drone photograph beside a short context caption, without importing a Skydio interface. |
| Final CTA | `aerial/commercial-property-aerial-at-dusk.png` | Contained dusk photograph paired with “What happens after hours?” and the assessment CTA. |

Existing owl marks, owl artwork, Saira/Inter typography, green/black palette, dashboard concept and early-stage feature disclosures remain. The old hero video remains in the repository but is no longer loaded or packaged. The existing motion toggle still controls page animation.

## Source limitations

- No suitable clean, high-resolution **full-night industrial aerial photograph** was exposed by these pages. The final CTA uses an accurately labelled **dusk** image at 1152 × 640; it is not represented as full night.
- Industry-card originals are only 484 × 268. The source pages did not expose higher-resolution versions; cards remain compact and derivatives are not upscaled. Fine detail is limited on high-DPI displays.
- Product studio close-ups that could be renders are held; the Air placement instead uses a clear in-flight photograph.
- All 107 preview requests and all 37 selected original downloads succeeded. Inapplicable graphics were excluded by selection, not due to download failure.
- Source-page permission statements do not identify an asset-specific photographer. Future publication should retain the recorded user permission basis and resolve any held items before use.

## Validation

`npm run validate` runs ESLint, HTML validation, TypeScript `checkJs` on the existing JavaScript, a production build, and browser tests. This remains a static HTML/CSS/JS site, with no application framework or runtime dependency added.

Final result: **all checks passed**, including all four browser tests and `git diff --check`. No broken images, local HTTP failures, JavaScript errors, horizontal overflow or automated accessibility violations were found. Measured cumulative layout shift was 0 on both mobile profiles, 0.0145 on tablet and 0.0167 on desktop. Hero, Air, workflow, industry and closing crops were visually reviewed.

Chromium checked desktop 1440 × 1000, tablet 768 × 1024, iPhone-size 390 × 664 (device profile), and small mobile 320 × 740. Tests cover image decoding, responsive sources, alt attributes, horizontal overflow, browser/HTTP errors, mobile navigation, pilot inquiry selection and required-field validation. Axe scans WCAG A/AA rules. Image dimensions and fixed aspect ratios reserve space before lazy images load.

See `*-metrics.json`, `qa-results.json`, and `*-hero.png`, `*-air.png`, `*-coverage.png`, `*-how.png`, `*-intelligence.png`, `*-closing.png` and `*-full.png` for evidence. These are local Chromium checks, not a guarantee for every browser or a field Core Web Vitals assessment. External Google Fonts still use the existing network dependency.

The production output contains 74 files totaling approximately 2.65 MiB, including every responsive variant. Browsers request only the chosen variants; measured new-photo transfers across the four viewports were approximately 207–384 KiB for a complete page scroll. The 100+ MiB original library, manifest and internal review documents are excluded from deployment by the build allowlist.

## Changed files

- `index.html`: ten responsive photographic placements, new Air and final CTA sections, illustrative-hardware/property captions, navigation link and minor semantic fixes.
- `css/photography.css`: dark overlays, fixed aspect ratios, crop positions, image cards and mobile layouts. Base `css/styles.css` unchanged.
- `js/main.js`: DOM type narrowing and annotations to support TypeScript checking; existing form behavior preserved.
- `public/images/skydio/**`: categorized originals, derivatives and manifest.
- `docs/skydio/**`: source snapshots, discovery audit, contact sheets, screenshots, measurements and this report.
- `scripts/extract_skydio.py`, `prepare_skydio.py`, `integrate_skydio.py`: reproducible discovery, curation and initial integration. The integration script refuses to overwrite a homepage already containing Air.
- `scripts/build.mjs`, `serve.mjs`: static packaging and preview server.
- `package.json`, `package-lock.json`, `eslint.config.mjs`, `.htmlvalidate.json`, `tsconfig.json`, `playwright.config.mjs`, `tests/homepage.spec.mjs`: development-only validation tooling.
- `vercel.json`, `netlify.toml`: build/output configuration; Vercel image caching.
- `.gitignore`, `README.md`: generated-output exclusions and current build/review instructions.

## Local preview and regeneration

Run `npm ci`, `npm run build`, then `npm run preview`; visit `http://127.0.0.1:4173`. To run browser checks on a fresh machine, first run `npx playwright install chromium`.

The extraction scripts use Python with `requests`, `beautifulsoup4`, and Pillow with AVIF support. Run `python scripts/extract_skydio.py` for discovery, then `python scripts/prepare_skydio.py` to recreate the library and sheets. The curation IDs refer to this saved source-page snapshot; review and update the selection if fetching changed pages. `prepare_skydio.py` uses Arial from the Windows fonts directory for contact sheets.

## Publication follow-up

Removed manufacturer references from all visible homepage copy and image alt text at the user?s request. Internal source URLs, filenames and the permission manifest retain provenance. Browser tests now explicitly verify that visible text and image alt text contain no manufacturer reference.

## Hero video restoration

At the user's request, the homepage now uses the original `assets/hero.mp4` drone-to-owl animation and `assets/hero-poster.jpg` fallback. The original hero overlay is restored; other homepage sections retain their photography. The commercial-campus hero photograph remains in the candidate library but is no longer integrated. Nine photographs are currently placed on the page.

The build now packages MP4 files and the local server serves the correct video MIME type. Browser checks cover reduced-motion pause, normal autoplay, video decoding and pause/resume controls. Current production packaging contains 68 files totaling approximately 2.72 MiB. Prior photographic-hero screenshots and metrics above describe the initial integration.
