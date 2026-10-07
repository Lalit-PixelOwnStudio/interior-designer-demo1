# Interior Core Website — Completion Plan (Mobile-First)

Yeh plan current code (`index.html`, `css/style.css`, `js/*.js`, `Assets/`) padhkar banaya gaya hai.
Site plain HTML/CSS/JS hai (koi framework nahi) aur Vercel par "Other" preset se deploy hoti hai.

---

## 1. Status

| Kaam | Status |
| --- | --- |
| Nav alignment + mobile menu | ✅ Ho gaya |
| Typography (serif headings, readable body) | ✅ Ho gaya |
| Photos/video compress (62 MB → 11 MB, WebP + 720p/1080p video) | ✅ Ho gaya |
| Services, Process, Reviews, Pricing, FAQ, Contact, Footer | ✅ Ho gaya |
| Sticky Call / WhatsApp / Get Quote bar (phone), WhatsApp button (desktop) | ✅ Ho gaya |
| Portfolio: Project 7 add, "View Project" photo viewer, filters | ✅ Ho gaya |
| Gallery: phone par 12 photos + "Show More", swipe | ✅ Ho gaya |
| SEO | ❌ Nahi karna — site sirf showcase ke liye hai |
| Real content (phone, founders, reviews, prices) | ⏳ Client se aana baaki (section 5) |

### Kahan kya badalna hai

- **Phone / WhatsApp / email / address / social links** → `js/config.js` (ek hi jagah, poori site update ho jaati hai)
- **Projects aur before/after text** → `js/data.js`
- **Nayi photos** → `Assets/project N/` mein daalo, phir `python scripts/optimize-images.py` chalao (Pillow + ffmpeg chahiye). Yeh `img/` mein web-ready WebP banata hai. `Assets/` ke originals kabhi change nahi hote aur Vercel par upload nahi hote (`.vercelignore`).

## 2. Final page structure (ek hi page, scroll karke)

Phone par log ek page scroll karte hain, isliye one-page site sahi hai. Har project ke liye alag page (Phase 4) baad mein.

```
Header (logo + menu; phone par full-screen menu)
1. Hero            — headline, "Book Consultation" + "WhatsApp Us", stats
2. About           — story + founders
3. Services        — 6 service cards (phone par swipe)
4. Before / After  — slider
5. Gallery         — photo wall + lightbox
6. Portfolio       — project cards → "View Project" photo viewer
7. Process         — 5 steps (phone par vertical timeline)
8. Testimonials    — review cards (phone par swipe)
9. Pricing         — 3 packages (phone par swipe)
10. FAQ            — 6 sawal
11. Contact        — form (WhatsApp par jaata hai) + call + email + map
Footer             — links, social, brochure download
Sticky phone bar   — [Call] [WhatsApp] [Get Quote]; desktop par WhatsApp button
```

### Naye sections ka content

**Services** (details.md se liya gaya):
1. Turnkey Home Interiors
2. Modular Kitchen & Wardrobes
3. False Ceiling & Lighting
4. Theme / Concept Design (2D & 3D)
5. Pooja Unit & Custom Furniture
6. Renovation (civil, electrical, plumbing)

**Process**: Consultation → Site Visit & Measurement → 2D/3D Design → Execution → Handover.

**Pricing**: 3 cards — "Starting from ₹X" style. Rate client se confirm karne hain.

**Contact form fields**: Naam, Phone, Location, Property type (1/2/3 BHK, Villa, Office), Budget range, Message.
Submit hone par WhatsApp par message khule (`wa.me` link) — koi server nahi chahiye. Chahein toh Formspree/Google Sheet bhi jod sakte hain.

---

## 3. Mobile-first rules (sabse zaroori)

Design pehle 360–414 px phone ke liye, phir tablet (768 px), phir desktop (1024 px+).

1. **Sticky bottom bar** (sirf mobile): Call · WhatsApp · Get Quote — har scroll par dikhe. Interior leads zyada tar call/WhatsApp se aate hain.
2. **Mobile menu theek karna**: full-screen menu, link dabane par band ho, background scroll lock.
3. **Tap size**: har button/link kam se kam 44×44 px; filter buttons bade.
4. **Swipe**: lightbox, testimonials aur before/after rooms par left/right swipe.
5. **Horizontal scroll cards**: Services aur Testimonials mobile par ek line mein swipe hone wale cards (scroll-snap), desktop par grid.
6. **Text**: body 16 px min (iPhone form zoom se bachne ke liye inputs bhi 16 px), headings `clamp()` se.
7. **Safe area**: iPhone notch / home bar ke liye `env(safe-area-inset-bottom)`.
8. **No horizontal scroll**: har section 360 px par test.
9. **Forms**: `type="tel"`, `inputmode="numeric"`, `autocomplete` — phone keyboard sahi khule.

---

## 4. Speed (mobile data par jaldi khule)

| Kaam | Abhi | Target |
| --- | --- | --- |
| `hero.mp4` | 23 MB | Mobile: ~2-3 MB 720p version, ya sirf poster image; desktop: ~5 MB 1080p |
| Before images | PNG ~2 MB each | WebP ~150 KB each |
| Project photos | JPEG ~450 KB each | WebP ~120 KB + 600px chhota version for cards |
| Gallery | 30 photos ek saath | 12 photos + "Show more" |
| Fonts | 3 Google fonts | Same, `display=swap` (already hai) |

Images ke liye do size banayenge (`-600.webp` phone ke liye, `-1200.webp` desktop ke liye) aur `<picture>` / `srcset` se sahi wali load hogi.
Target: phone par pehli screen 2-3 second mein, Lighthouse mobile score 90+.

---

## 5. Data / content jo client se chahiye

- [ ] Founder + co-founder ka naam, role, photo, Instagram/LinkedIn link
- [ ] Phone number, WhatsApp number, email, office address (Malviya Nagar?), Google Maps link
- [ ] Stats sahi hain? (200+ projects, 12+ years, 150+ clients, 8+ awards)
- [ ] Pricing packages ke rate
- [ ] 4-6 asli client reviews (naam + area + photo optional), Google rating
- [ ] Project 3 price (₹2,00,000 vs ₹20,00,000?), Project 4 price (₹2,000 placeholder lagta hai), Project 5 price (₹3,50,00,00.00 format galat)
- [ ] Project 8 ki details (title, description, tags) — details.md nahi hai
- [ ] Domain naam (optional)
- [ ] Reviews section mein abhi sample text + "Client Name" hai — asli reviews se badalna hai

---

## 6. Phases — kis order mein kaam hoga

### Phase 1 — Mobile fixes + speed (pehle yeh, kyunki abhi bhi live hai)
1. Mobile hamburger menu theek karna
2. Sticky Call / WhatsApp bar
3. Video aur images compress (WebP), mobile ke liye chhota video
4. Gallery 12 photos + "Show more"; lightbox mein swipe
5. Folder names saaf karna (`project 1` / `Project 2` → `project-1`, `project-2`) — spaces aur capital letters URL mein dikkat dete hain

### Phase 2 — Khaali sections banana
1. Services
2. Process
3. Contact (form → WhatsApp) + Footer
4. Testimonials
5. Pricing + FAQ

### Phase 3 — Portfolio poora karna
1. Project 7 aur 8 jodna
2. "View Project" par har project ka full-screen viewer (saari photos swipe + details) — alag page ki zaroorat nahi
3. Filters ko services ke hisaab se (Turnkey, Bedroom, Living, Kitchen, Pooja)

### Phase 4 — Launch (SEO skip — showcase site)
1. Real content daalna (section 5)
2. Custom domain Vercel par (optional)
3. Final testing: Android Chrome, iPhone Safari, 360 px / 390 px / 768 px / 1440 px

---

## 7. Files ka structure

```
index.html
css/style.css
js/
  config.js        phone, WhatsApp, email, address, social links
  data.js          projects + before/after rooms
  lightbox.js      photo viewer (gallery + "View Project"), swipe
  before-after.js
  gallery.js
  portfolio.js
  main.js          nav, menu, reveals, stats, hero video, contact form
img/               web-ready images (generated — don't edit by hand)
Assets/            original photos (source, not deployed)
scripts/optimize-images.py
```
