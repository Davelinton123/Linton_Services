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

## Admin editing setup

The **Admin** link in the footer opens a Supabase-authenticated editor for the hero headline and description, service titles/descriptions, and contact phone/email. The edits are stored in Supabase and load for all site visitors.

1. Create a Supabase project.
2. Open `js/supabase-config.js` and set `LINTON_SUPABASE_URL` and `LINTON_SUPABASE_ANON_KEY` to the project's URL and public anon/publishable key. Never put a Supabase service-role key in website code.
3. In the Supabase SQL Editor, run `supabase-setup.sql`.
4. In Supabase **Authentication → Users**, create a confirmed user for `toludav2015@gmail.com`. Use a strong, unique password; change any password that has been shared or reused.
5. In **Authentication → URL Configuration**, set the site URL and allowed redirect URLs to your deployed domain (and your local development URL while testing).
6. Deploy the site and sign in through the footer's **Admin** link. The database row-level security policy restricts writes to the configured admin email; the public site can only read the published content.

If you accepted an invitation without setting a password, open **Admin** and choose **Forgot password? Send me a reset link**. Open the recovery email on the same site/browser, choose a new password on the page, then sign in. Supabase **Authentication → URL Configuration → Redirect URLs** must allow the site address; for Live Server, add `http://127.0.0.1:5500/**` (use the host and port shown in your browser if different). The editor does not have a separate built-in password reset page; the recovery link opens the password form in the Admin dialog.

The login is not hard-coded into the page. A static website cannot keep a password secret, so authentication and write permissions are enforced by Supabase instead. Do not disable row-level security or expose a service-role key.

## Notes

- The quote form has no server: it opens **WhatsApp** (or your email app) with the message pre-filled.
  To store submissions, point the form at a service such as Formspree or Netlify Forms.
- The solar planner is a planning guide only — final sizing needs a site assessment.
- Respects `prefers-reduced-motion`, has keyboard focus styles, a skip link, and semantic landmarks.
- Light/dark theme choice is remembered in `localStorage`.

## Deploy

Drag the folder onto Netlify Drop, or push to GitHub and enable GitHub Pages / Cloudflare Pages / Vercel.
