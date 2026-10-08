# Sihilo — Marketing Site

Single-page, mobile-first landing site for **Sihilo** — an early-stage physical-security intelligence platform focused on commercial properties in Charlotte, NC.

> *Silent. Watching. Always.*

Built with plain **HTML + CSS + vanilla JS**, with no runtime dependencies. A small static build copies only homepage assets into `dist/`; the original photographic library and review documents are not published.

## Run locally

Requires Node.js 22.18+.

```bash
npm ci
npm run build
npm run preview
# http://127.0.0.1:4173
```

Serve `dist/`, not the repository root: the build maps `public/images/` to `/images/`. Opening `index.html` directly does not resolve these URLs.

## Validate

```bash
npx playwright install chromium
npm run validate
```

Runs ESLint, HTML validation, TypeScript checking of the existing JavaScript through `checkJs`, the static production build, and Chromium layout/accessibility tests at 1440, 768, 390 and 320 pixels. Screenshots and measured results are in `docs/skydio/`. No TypeScript application migration was introduced.

## Files and image review

- `index.html`: homepage and responsive picture markup.
- `css/styles.css`: existing brand tokens, layout and motion styles.
- `css/photography.css`: photo crops, image panels and responsive placement.
- `js/main.js`: navigation, motion controls and assessment/pilot email form.
- `assets/`: existing Sihilo owl marks, art, favicons and social image. The original drone-to-owl hero video and poster are used by the homepage/build.
- `assets/security/`: supplied dashboard, thermal and speaker imagery plus the optimized detection loop; review details are in `docs/new-media/`.
- `public/images/skydio/`: full-resolution originals and WebP/AVIF derivatives, organized by subject.
- `public/images/skydio/image-manifest.json`: source, dimensions, hashes, permission status and placement.
- `docs/skydio/contact-sheet.html`: clickable candidate library; open directly in a browser.
- `docs/skydio/contact-sheet-*.jpg`: four printable contact sheets with filenames, dimensions and source URLs.
- `docs/skydio/REPORT.md`: selection, limitations, validation and changed-file summary.
- `scripts/`: extraction, asset preparation, static build and local preview server.
- `tests/`: responsive, image-loading, accessibility and conversion regression checks.

## Deploy

Vercel and Netlify are configured to run `npm run build` and publish `dist/`. Run `npm run validate` before any deployment. Publish only after successful validation and authorization; the current publication was explicitly requested by the user.

For a manual upload, upload only `dist/`. Do not upload the repository root: it contains original licensed candidates and internal review records. A host mounted below a URL subpath needs a corresponding rewrite/base-path adjustment for `/images/`.

Canonical, Open Graph and sitemap URLs use `https://sihilo.vercel.app/`; update them together if the domain changes.

## Connect the contact form

The form works immediately with a **`mailto:` fallback** — on submit it opens
the visitor's email client pre-filled. To capture submissions properly, wire up
an endpoint. Everything lives in the form section in
[`js/main.js`](js/main.js):

```js
const ENDPOINT = "";                    // ← set this
const CONTACT_EMAIL = "moisesjdelcastillo@gmail.com";
```

### Option A — Formspree (no backend)
1. Create a form at <https://formspree.io> and copy its endpoint
   (e.g. `https://formspree.io/f/abcdwxyz`).
2. Set `ENDPOINT` to that URL.
3. That's it — the existing `fetch()` POSTs the form as `FormData` and shows the
   success state. If the request fails, it automatically falls back to `mailto:`.

### Option B — Your own API
Point `ENDPOINT` at any URL that accepts a `POST` with `FormData` and returns
`2xx` on success. The submit handler already does the rest.

### Option C — Netlify Forms
1. Add `netlify` to the `<form>` tag in `index.html`:
   `<form ... id="quoteForm" netlify novalidate>`
2. Add a hidden input: `<input type="hidden" name="form-name" value="quoteForm" />`
3. Leave `ENDPOINT` empty and remove the `e.preventDefault()` path, or let
   Netlify capture the native POST. (Formspree/Option A is simpler if you're not
   on Netlify.)

The current recipient is `moisesjdelcastillo@gmail.com`. The form preserves entered details after opening the email draft and does not claim delivery. If an endpoint is enabled, update the visible form instructions to reflect direct submission.

---

## Brand notes (locked)

- **Colors — only three:** primary green `#7CDE57`, neon green `#39FF14`,
  black `#000000`. Near-black panels and dark-green hairlines add depth; no other
  accent hues. Neutral white/gray carry body text only.
- **Type:** **Saira** for display (uppercase, tightly tracked); **Inter** for body.
- **Logo:** line-art owl on black only — never recolored, stretched, shadowed, or
  on a light background. The detailed cyberpunk owl is *art*, used large only.
- **Voice:** confident, precise, technical, unimpressed by the old way. No buzzwords.

All tokens are CSS variables at the top of [`css/styles.css`](css/styles.css).

---

## Accessibility & performance

- Semantic HTML5, skip link, labeled form fields, `aria-invalid` on errors,
  keyboard-navigable nav + form, visible focus rings.
- Respects `prefers-reduced-motion`: disables video autoplay, scroll reveals, and
  dashboard animations; shows representative static states instead.
- The original hero video autoplays muted, with a poster and reduced-motion fallback. Below-the-fold images use `loading="lazy"`, explicit dimensions, AVIF/WebP sources and responsive sizes.


## Homepage positioning and feature status

The homepage leads with commercial property assessments and a proposed 90-day
Charlotte pilot. It preserves the existing owl branding, typography, colors,
owl imagery and static architecture. Drones are one possible sensor, conditional
on site configuration and operating authorization.

Current website functionality: navigation, motion controls, intake validation,
and email-draft preparation. No environment variables or secrets are required.
There is no server-side form delivery, camera integration, authentication,
event detection, storage system, or response dispatch in this repository.

The dashboard is a static illustrative interface. Edge, Site Memory, privacy
controls, natural-language search and Spatial Memory are explicitly labelled
as concepts, under development, or roadmap/R&D. Retention labels are planned
policy choices, not functioning controls. Pilot scope must be confirmed per site.

## Validation and publishing

Run `npm run validate` and `git diff --check` before publishing. The production build includes only referenced image derivatives; originals, manifests and review materials stay local. Photographer identity and asset-specific permission scope are still unverified; see the manifest before any future publication. Preserve the existing capability labels and verify the email draft without sending it.

Canonical, OpenGraph and sitemap URLs currently use the verified deployment
origin https://sihilo.vercel.app/. Update all together if a custom domain is connected.

Backend next steps: implement validated, rate-limited form delivery with a
server-side email provider; then develop and verify the scoped sensor adapters,
edge processing, authenticated dashboard, event review, retention and access
controls before changing any feature availability claims.
