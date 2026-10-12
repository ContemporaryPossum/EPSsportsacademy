# EPS Sports Academy — website

Static website (HTML + CSS + JS, no build step). Every file sits in the repository root, with no folders.

## Deploy: GitHub → Cloudflare Pages

1. Create a new GitHub repository and upload **all files** from this folder to the root.
2. In Cloudflare: **Workers & Pages → Create → Pages → Connect to Git**, then pick the repository.
3. Build settings:
   - Framework preset: **None**
   - Build command: *(leave empty)*
   - Build output directory: **/**
4. Deploy, then add the custom domain under **Custom domains**.

Cloudflare automatically uses `404.html` for missing pages and `_headers` for caching and security headers.

## Pages

| File | Page |
|---|---|
| `index.html` | Home |
| `football.html` | EPS Football (levels + Desa Park City timetable) |
| `swimming.html` | EPS Swimming (levels + Tropicana / Desa Park City timetable) |
| `holiday-camp.html` | Holiday Camps |
| `enrol.html` | Trial classes, full timetable, membership info, FAQ |
| `about.html` | Story, values, coaches, careers |
| `contact.html` | Contact details, WhatsApp enquiry form, map, venues |
| `404.html` | Not-found page |

Shared files: `styles.css` (design), `main.js` (animations and interactions), `logo.png`, `logo-white.png` and `favicon.png`, plus the `.jpg` photos.

## Common edits

- **WhatsApp number:** find and replace `60122326372` in all `.html` files and in `main.js`.
- **Timetable / registration links:** every class "Register" button links to the GymMaster portal (`epssportsacademy.gymmasteronline.com/portal/membership/...`). Timetables appear in `football.html`, `swimming.html` and `enrol.html`, so update all three.
- **Next holiday camp:** in `holiday-camp.html`, search for `UPDATE EACH SEASON` and change the heading, dates and the two registration links.
- **Videos:** videos play from Google Drive. Each video button has `data-video="FILE_ID"`. To swap a video, paste a different Drive file ID. The Drive file must be shared as *Anyone with the link → Viewer*.
- **Domain:** `canonical` tags, `sitemap.xml` and `robots.txt` use `https://epsacademy.com.my`. If the domain is different, find and replace it.

## Confirm with the client before launch

- **BabyTalk & MamaPapa Awards 2023 "Winner"**: this badge appears on EPS's 2026 holiday-camp flyer. Confirm that EPS won it. If not, delete the `<article>` marked `CONFIRM WITH CLIENT` in `index.html`.
- **Phone numbers**: the site uses 012-232 6372 (WhatsApp), 012-205 6372 and 012-890 6372.
- **Office hours**: 9:00am – 6:30pm, from Google Maps.
- **Basketball, Dance and School CCA** (the "More ways to play" card on the home page): confirm these are currently offered.
