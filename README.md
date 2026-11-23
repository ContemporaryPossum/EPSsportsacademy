# EPS Sports Academy — website

Static website (HTML + CSS + JS, no build step). Every file sits in the repository root, with no folders.

## Deploy: GitHub → Cloudflare Pages

1. Upload **all files** from this folder to the root of the GitHub repository (replace the old ones).
2. Delete the old pages from the repository if they are still there: `about.html`, `football.html`, `swimming.html`, `enrol.html`.
3. In Cloudflare: **Workers & Pages → Create → Pages → Connect to Git**, then pick the repository.
4. Build settings: Framework preset **None**, Build command *(leave empty)*, Build output directory **/**.

Cloudflare automatically uses `404.html` for missing pages, `_headers` for caching and security headers, and `_redirects` to forward old links (the previous pages and the old WordPress addresses such as `/eps-soccer/` and `/career/`) to the new pages.

## Pages

| File | Page |
|---|---|
| `index.html` | Home: video panels, CCA / Holiday Camp / Careers cards, our story, achievements, videos, parent interviews |
| `cca.html` | CCA: Football, Basketball, Swimming, Street Dance, Ballet (ages 3–16) and Multisport (ages 3–6), how to join, CCA for schools, FAQ |
| `holiday-camp.html` | Holiday Camp |
| `careers.html` | Careers: roles, internship, perks, application form |
| `contact.html` | Contact details, WhatsApp enquiry form, office map |
| `404.html` | Not-found page |

Shared files: `styles.css` (design), `main.js` (animations and interactions), logos, `.jpg` photos and the three `clip-*.mp4` video loops.

## Common edits

- **WhatsApp number:** find and replace `60122326372` in all `.html` files and in `main.js`.
- **Careers email:** applications go to `operations@epsacademy.com` (search `CAREERS_EMAIL` in `main.js`).
- **CCA content:** each activity is a section in `cca.html` with `id="football"`, `id="basketball"`, `id="swimming"`, `id="street-dance"`, `id="ballet"` and `id="multisport"`.
- **Trial links:** football and swimming trials link to the GymMaster portal; the other activities use WhatsApp. Search `gymmasteronline` in `cca.html`.
- **Next holiday camp:** in `holiday-camp.html`, search for `UPDATE EACH SEASON`.
- **Landing-page video loops:** replace `clip-football.mp4`, `clip-swimming.mp4` or `clip-camp.mp4` with a short silent portrait MP4 (ideally under 2 MB) using the same name.
- **Intro animation:** plays once per browser session; visitors can skip it.
- **After editing CSS or JS:** change `?v=3` to `?v=4` in every page's `styles.css` / `main.js` link so returning visitors get the new version.

## Confirm with the client before launch

- **CCA ages:** the site shows ages 3–16 for every activity and 3–6 for Multisport, as requested. The school proposal PDF lists narrower ranges for some programmes (e.g. Ballet 5–11, Multisport 4–6).
- **BabyTalk & MamaPapa Awards 2023 "Winner"** on the home page: confirm EPS won it, or delete the `<article>` marked `CONFIRM WITH CLIENT` in `index.html`.
- **Holiday Camp venues** (Desa Park City Clubhouse, Fairview International School) are still listed on the Holiday Camp page because its booking links are tied to them.
- **Phone numbers and office hours** (9:00am – 6:30pm, from Google Maps).
