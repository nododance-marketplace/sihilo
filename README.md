# Sihilo — Marketing Site

Single-page, mobile-first landing site for **Sihilo** — autonomous security
built on computer vision and robotics, Charlotte, NC.

> *Silent. Watching. Always.*

Built with plain **HTML + CSS + vanilla JS**. No framework, no build step,
no dependencies. Deploy-ready for Netlify, Vercel, or GitHub Pages out of the box.

---

## File structure

```
.
├── index.html              # The page (single file, all sections)
├── css/
│   └── styles.css          # All styles — brand tokens, layout, responsive, motion
├── js/
│   └── main.js             # Nav, scroll reveal, dashboard mockup, form validation
├── assets/
│   ├── hero.mp4            # Hero background video (web-optimized, ~1 MB, muted/looping)
│   ├── hero-poster.jpg     # Poster frame / video fallback
│   ├── logo-mark.png       # Owl line-art mark (transparent) — nav
│   ├── logo-full.png       # Owl + SIHILO wordmark (transparent) — footer
│   ├── owl-art.jpg         # Cyberpunk owl render — "Why the Owl" section
│   ├── drones.jpg          # Drone formation — "How It Works"
│   ├── og-image.jpg        # 1200×630 Open Graph / Twitter card image
│   ├── favicon.ico         # Favicon (owl head)
│   ├── favicon-16.png / favicon-32.png / favicon-512.png
│   └── apple-touch-icon.png
├── netlify.toml            # Netlify config (publish dir + security headers)
├── vercel.json             # Vercel config (static + headers)
├── robots.txt              # SEO
├── sitemap.xml             # SEO  (update the domain before launch)
└── README.md
```

---

## Run locally

It's a static site — no build. Any of these work:

**Just open it**
Double-click `index.html`. (The hero video and fetch fallbacks all work from
`file://`, though a local server is closer to production.)

**Python (recommended — proper MIME types for video)**
```bash
python -m http.server 8000
# visit http://localhost:8000
```

**Node**
```bash
npx serve .
# or: npx http-server -p 8000
```

**VS Code:** the *Live Server* extension → "Open with Live Server".

---

## Deploy

### Netlify
- **Drag & drop:** zip the folder (or the folder itself) onto
  <https://app.netlify.com/drop>. Done.
- **Git:** connect the repo. `netlify.toml` already sets the publish directory
  to the project root and there is no build command. Just deploy.

### Vercel
- **CLI:** `npm i -g vercel` then `vercel` in this folder, accept defaults.
- **Git:** import the repo at <https://vercel.com/new>. Framework preset:
  **Other**. Build command: *(none)*. Output directory: `.`
  `vercel.json` is already set up for a static deploy.

### GitHub Pages
1. Push this folder to a GitHub repo.
2. Repo → **Settings → Pages**.
3. Source: **Deploy from a branch** → branch `main`, folder `/ (root)`.
4. Save. Your site goes live at `https://<user>.github.io/<repo>/`.

> If you deploy to a **sub-path** (e.g. GitHub Pages project sites), all asset
> paths in this project are already **relative** (`assets/…`, `css/…`, `js/…`),
> so they resolve correctly with no changes.

**Before launch:** update the absolute URLs in `sitemap.xml` and the
`og:url` / canonical references in `index.html` to your real domain.

---

## Connect the contact form

The form works immediately with a **`mailto:` fallback** — on submit it opens
the visitor's email client pre-filled. To capture submissions properly, wire up
an endpoint. Everything lives at the top of the form section in
[`js/main.js`](js/main.js):

```js
const ENDPOINT = "";                    // ← set this
const CONTACT_EMAIL = "hello@sihilo.com"; // ← set the real inbox
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

Also update `CONTACT_EMAIL` so the `mailto:` fallback reaches a real inbox.

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
- Hero video is muted/looping with a poster frame and a JS fallback if it can't
  play. Below-the-fold images use `loading="lazy"`.
