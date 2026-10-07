"""Build the inner pages from index.html so every page shares one header,
footer and set of sections.

    python scripts/build-pages.py

index.html is the source: edit a section there (Services, Portfolio,
Pricing, FAQ, Contact, footer) and run this script to update
services.html, projects.html, pricing.html and contact.html. It also
refreshes the header, footer and asset version on index.html and
about.html. Bump VERSION whenever CSS or JS changes so browsers reload them.
"""
import pathlib
import re

ROOT = pathlib.Path(__file__).resolve().parent.parent
VERSION = "20261008e"

NAV = [
    ("about.html", "About"),
    ("services.html", "Services"),
    ("projects.html", "Projects"),
    ("pricing.html", "Pricing"),
]

EXPLORE = NAV + [("contact.html", "Contact"), ("pricing.html#faq", "FAQ")]

WA_ICON = re.compile(r'<a href="[^"]*" class="wa-float".*?</a>', re.S)


def read(name):
    return (ROOT / name).read_text(encoding="utf-8")


def write(name, text):
    (ROOT / name).write_text(text, encoding="utf-8")
    print("wrote", name)


INDEX = read("index.html")


def block(pattern, text=INDEX):
    match = re.search(pattern, text, re.S)
    if not match:
        raise SystemExit("not found in index.html: " + pattern)
    return match.group(0)


def section(sid):
    return block(r'<section id="%s".*?\n</section>' % sid)


def header(current):
    logo = "#hero" if current == "index.html" else "index.html"
    links = []
    for href, label in NAV:
        cur = ' aria-current="page"' if href == current else ""
        links.append('      <a href="%s"%s>%s</a>' % (href, cur, label))
    cur = ' aria-current="page"' if current == "contact.html" else ""
    links.append('      <a href="contact.html" class="nav-contact-btn"%s>Contact</a>' % cur)
    return "\n".join([
        '<header id="site-nav">',
        '  <div class="nav-inner">',
        '    <a href="%s" class="nav-logo">' % logo,
        '      <img src="img/brand/logo-72.png" alt="" width="36" height="36">',
        "      <span>Interior Core</span>",
        "    </a>",
        '    <nav class="nav-links">',
    ] + links + [
        "    </nav>",
        '    <button class="nav-toggle" id="navToggle" aria-label="Open menu" aria-expanded="false">',
        "      <span></span><span></span><span></span>",
        "    </button>",
        "  </div>",
        "</header>",
    ])


def footer(current):
    html = block(r'<footer class="site-footer.*?</footer>')
    explore = "\n".join(
        ['    <nav class="footer-col" aria-label="Footer">', "      <h4>Explore</h4>"]
        + ['      <a href="%s">%s</a>' % item for item in EXPLORE]
        + ["    </nav>"]
    )
    html = re.sub(r'    <nav class="footer-col" aria-label="Footer">.*?</nav>', explore, html, flags=re.S)
    if current != "index.html":
        html = html.replace('href="#hero"', 'href="index.html"').replace('href="#contact"', 'href="contact.html"')
    return html


def wa_float(current):
    href = "#contact" if current == "index.html" else "contact.html"
    html = block(WA_ICON.pattern)
    return re.sub(r'^<a href="[^"]*"', '<a href="%s"' % href, html)


def page_top(html):
    """First section on an inner page: room for the fixed nav, no wave, h1."""
    html = re.sub(r'class="([^"]*?) wave-top"', r'class="\1 page-top"', html, count=1)
    html = html.replace("<h2 class=\"about-heading", "<h1 class=\"about-heading", 1)
    return html.replace("</h2>", "</h1>", 1)


def link_out(html):
    """Same-page #contact links point at the Contact page instead."""
    return html.replace('href="#contact"', 'href="contact.html"')


def cta(heading, text, button="Book a Consultation"):
    return "\n".join([
        '<section class="projects-cta wave-top">',
        '  <h2 class="about-heading">%s</h2>' % heading,
        '  <p class="section-subline">%s</p>' % text,
        '  <a href="contact.html" class="lb-cta">%s</a>' % button,
        "</section>",
    ])


HEAD = """<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{title} — Interior Core</title>
<meta name="description" content="{description}">

<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300..700;1,9..144,300..700&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet">

<meta name="theme-color" content="#faf5ec">
<link rel="icon" href="img/brand/favicon-32.png" type="image/png" sizes="32x32">
<link rel="apple-touch-icon" href="img/brand/apple-touch-icon.png">{extra_head}
<link rel="stylesheet" href="css/style.css?v={version}">
</head>
<body data-solid-nav data-contact-href="contact.html">
"""


def page(name, title, description, body, scripts, extra_head=""):
    parts = [
        HEAD.format(title=title, description=description, extra_head=extra_head, version=VERSION),
        header(name),
        "",
        body,
        "",
        footer(name),
        "",
        "<!-- Floating WhatsApp button (all screen sizes) -->",
        wa_float(name),
        "",
    ]
    parts += ['<script src="js/%s.js?v=%s"></script>' % (s, VERSION) for s in scripts]
    write(name, "\n".join(parts) + "\n</body>\n</html>\n")


LIGHTBOX = block(r'<div class="lightbox" id="lightbox".*?<aside class="lightbox-details" id="lightboxDetails" hidden></aside>\n</div>')
SERVICES = section("services")
PORTFOLIO = section("portfolio")
PRICING = section("pricing")
FAQ = section("faq")
CONTACT = section("contact")

# ----- services.html: services first, a few projects below -----
featured = PORTFOLIO.replace(
    "<!-- Home page shows the 3 featured projects (featured: 1-3 in js/data.js) -->",
    "<!-- Shows the 3 featured projects (featured: 1-3 in js/data.js) -->",
)
page(
    "services.html", "Services",
    "Turnkey home interiors, modular kitchens, false ceilings, 3D design and renovation by Interior Core.",
    "\n\n".join([
        page_top(SERVICES),
        featured,
        cta("Have a space in mind?", "Tell us about your home and we'll suggest the right services for it."),
        LIGHTBOX,
    ]),
    ["config", "data", "lightbox", "portfolio", "main"],
)

# ----- projects.html: all projects first, services below -----
projects = "\n".join([
    '<section id="projects" class="portfolio projects-list page-top">',
    '  <div class="portfolio-header reveal-group">',
    '    <span class="eyebrow reveal-item" style="--d:0">Portfolio</span>',
    '    <h1 class="about-heading reveal-item" style="--d:1">All Our Projects</h1>',
    '    <p class="section-subline reveal-item" style="--d:2">Full homes, bedrooms, living rooms and 1 BHKs across Delhi NCR. Tap any project to see every photo and the details.</p>',
    "  </div>",
    '  <div class="portfolio-filters" id="portfolioFilters" aria-label="Filter projects"></div>',
    '  <div class="portfolio-grid" id="portfolioGrid"></div>',
    "</section>",
])
page(
    "projects.html", "Projects",
    "Homes, bedrooms, living rooms and 1 BHK interiors designed and built by Interior Core across Delhi NCR.",
    "\n\n".join([
        projects,
        SERVICES,
        cta("Like what you see? Let's design yours.", "Share a few details and we'll plan a site visit."),
        LIGHTBOX,
    ]),
    ["config", "data", "lightbox", "portfolio", "main"],
)

# ----- pricing.html: packages, then pricing questions -----
page(
    "pricing.html", "Pricing",
    "Interior Core packages for 1 BHK, 2–3 BHK homes and full renovations, with clear starting prices.",
    "\n\n".join([
        link_out(page_top(PRICING)),
        FAQ,
        cta("Not sure which package fits?", "Tell us about your home and we'll send a quote after a quick chat.", "Get a Free Quote"),
    ]),
    ["config", "pricing", "faq", "main"],
)

# ----- contact.html: the contact section on its own -----
page(
    "contact.html", "Contact",
    "Call, WhatsApp or visit the Interior Core studio in Malviya Nagar, New Delhi.",
    page_top(CONTACT),
    ["config", "contact", "main"],
    extra_head='\n<link rel="preconnect" href="https://www.google.com">\n<link rel="preconnect" href="https://maps.gstatic.com" crossorigin>',
)


# ----- index.html and about.html: shared header, footer, version -----
def refresh(name):
    html = read(name)
    html = re.sub(r'<header id="site-nav">.*?\n</header>', lambda m: header(name), html, count=1, flags=re.S)
    html = re.sub(r'<footer class="site-footer.*?</footer>', lambda m: footer(name), html, count=1, flags=re.S)
    html = re.sub(r'\n<!-- Quick actions.*?-->\n<div class="quick-bar".*?\n</div>', "\n<!-- Floating WhatsApp button (all screen sizes) -->", html, flags=re.S)
    html = re.sub(r'\?v=\w+', "?v=" + VERSION, html)
    if name != "index.html":
        html = html.replace("index.html#contact", "contact.html")
        html = WA_ICON.sub(lambda m: wa_float(name), html)
    write(name, html)


refresh("index.html")
INDEX = read("index.html")
refresh("about.html")
