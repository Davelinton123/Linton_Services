# Linton Services — Website

A fast, accessible, dependency-free marketing site (plain HTML, CSS and JavaScript — no build step).

## Run it in VS Code

1. Unzip the folder and open it in VS Code (`File → Open Folder…`).
2. Install the **Live Server** extension (Ritwick Dey).
3. Right-click `index.html` → **Open with Live Server**. Edits refresh the browser automatically.

(No extension? Just double-click `index.html` — it works from the file system too.)

## Project structure

```
linton-services/
├── index.html        Markup, SEO tags, SVG icon sprite
├── css/styles.css    Design tokens (section 1) → base → components → sections → motion → responsive
├── js/main.js        CONFIG + APPLIANCES at the top; theme, nav, filters, solar planner, form
└── README.md
```

## Common edits

| I want to…                         | Edit                                                       |
| ---------------------------------- | ---------------------------------------------------------- |
| Change colours / fonts             | `:root` and `:root[data-theme="dark"]` in `css/styles.css` |
| Change phone, WhatsApp or email    | `CONFIG` in `js/main.js` **and** the links in `#contact`   |
| Add or tweak appliances            | `APPLIANCES` array in `js/main.js`                         |
| Tune solar estimate assumptions    | `CONFIG` (panel watts, sun hours, efficiency)              |
| Add a service card                 | Copy an `<article class="card service">` in `index.html`; add a matching checkbox in the form |
| Use your real logo                 | Replace `<symbol id="logo">` in `index.html`, or swap the `<svg class="brand-mark">` for an `<img>` |
| Add real photos / portfolio        | Put files in an `images/` folder and add a new `<section>` using the `.section` / `.card` classes |

## Notes

- The quote form has no server: it opens **WhatsApp** (or your email app) with the message pre-filled.
  To store submissions, point the form at a service such as Formspree or Netlify Forms.
- The solar planner is a planning guide only — final sizing needs a site assessment.
- Respects `prefers-reduced-motion`, has keyboard focus styles, a skip link, and semantic landmarks.
- Light/dark theme choice is remembered in `localStorage`.

## Deploy

Drag the folder onto Netlify Drop, or push to GitHub and enable GitHub Pages / Cloudflare Pages / Vercel.
