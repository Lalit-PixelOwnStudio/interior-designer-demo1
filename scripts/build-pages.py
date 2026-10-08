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
VERSION = "20261008n"

NAV = [
    ("about.html", "About"),
    ("services.html", "Services"),
    ("projects.html", "Projects"),
    ("pricing.html", "Pricing"),
]

EXPLORE = NAV + [("materials.html", "Materials"), ("contact.html", "Contact"), ("pricing.html#faq", "FAQ")]

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


def partial(name):
    """Sections that only live on inner pages are kept in partials/."""
    return read("partials/%s.html" % name).rstrip("\n")


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


def cta(heading, text, button="Book a Consultation", href="contact.html",
        ghost=("contact.html#visit", "Visit Our Studio")):
    return "\n".join([
        '<section class="projects-cta wave-top">',
        '  <h2 class="about-heading">%s</h2>' % heading,
        '  <p class="section-subline">%s</p>' % text,
        '  <div class="cs-cta-btns">',
        '    <a href="%s" class="lb-cta">%s</a>' % (href, button),
        '    <a href="%s" class="cs-ghost">%s</a>' % ghost,
        "  </div>",
        "</section>",
    ])


# Runs before the page paints: shows the logo intro once per visit, and
# marks browsers without cross-page view transitions for the JS fallback.
HEAD_SCRIPT = (
    '<script>(function(d){try{if(!("onpagereveal" in window))d.classList.add("no-vt");'
    'if(!sessionStorage.getItem("icIntro")&&!matchMedia("(prefers-reduced-motion: reduce)").matches)'
    '{d.classList.add("ic-intro");sessionStorage.setItem("icIntro","1")}}catch(e){}})(document.documentElement)</script>'
)

INTRO = (
    '<div class="intro" id="intro" aria-hidden="true"><div class="intro-inner">'
    '<img class="intro-logo" src="img/brand/logo-192.png" alt="" width="96" height="96">'
    '<span class="intro-word">' + "".join(
        '<i style="--i:%d">%s</i>' % (i, "&nbsp;" if c == " " else c) for i, c in enumerate("INTERIOR CORE")
    ) + "</span>"
    '<span class="intro-line"></span>'
    "<small>Interiors that reflect your style</small>"
    "</div></div>"
)

HEAD = """<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8">{head_first}
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
{head_script}
</head>
<body{body_attrs} data-contact-href="contact.html">
{intro}
"""


def page(name, title, description, body, scripts, extra_head="", nav=None, solid_nav=True, head_first=""):
    parts = [
        HEAD.format(title=title, description=description, extra_head=extra_head, version=VERSION,
                    body_attrs=" data-solid-nav" if solid_nav else "", head_script=HEAD_SCRIPT, intro=INTRO,
                    head_first=head_first),
        header(nav or name),
        "",
        body,
        "",
        footer(name),
        "",
        "<!-- Floating WhatsApp button (all screen sizes) -->",
        wa_float(name),
        "",
    ]
    parts += ['<script src="js/%s.js?v=%s"></script>' % (s, VERSION) for s in ["transitions"] + scripts]
    write(name, "\n".join(parts) + "\n</body>\n</html>\n")


LIGHTBOX = block(r'<div class="lightbox" id="lightbox".*?<aside class="lightbox-details" id="lightboxDetails" hidden></aside>\n</div>')
SERVICES = section("services")
PORTFOLIO = section("portfolio")
PRICING = section("pricing")
FAQ = section("faq")
GUARANTEES = block(r'<!-- DEMO TRUST BADGES.*?\n</section>')
BRANDS = block(r'<!-- Brand logos:.*?\n</section>')
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
        GUARANTEES,
        BRANDS,
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
        partial("quiz"),
        SERVICES,
        cta("Like what you see? Let's design yours.", "Share a few details and we'll plan a site visit."),
        LIGHTBOX,
    ]),
    ["config", "data", "lightbox", "portfolio", "quiz", "main"],
)

# ----- pricing.html: packages, then pricing questions -----
page(
    "pricing.html", "Pricing",
    "Interior Core packages for 1 BHK, 2–3 BHK homes and full renovations, with clear starting prices.",
    "\n\n".join([
        link_out(page_top(PRICING)),
        GUARANTEES,
        partial("estimator"),
        FAQ,
        cta("Not sure which package fits?", "Tell us about your home and we'll send a quote after a quick chat.", "Get a Free Quote"),
    ]),
    ["config", "pricing", "estimator", "faq", "main"],
)

# ----- contact.html: the contact section on its own -----
page(
    "contact.html", "Contact",
    "Call, WhatsApp or visit the Interior Core studio in Malviya Nagar, New Delhi.",
    "\n\n".join([page_top(CONTACT), partial("visit")]),
    ["config", "contact", "visit", "main"],
    extra_head='\n<link rel="preconnect" href="https://www.google.com">\n<link rel="preconnect" href="https://maps.gstatic.com" crossorigin>',
)


# ----- materials.html: swatch library with a moodboard -----
page(
    "materials.html", "Material Library",
    "Laminates, veneers, marble, fabrics and metals used by Interior Core — save the ones you like to a moodboard.",
    "\n\n".join([
        partial("materials"),
        cta("Want to touch these in person?", "Our studio has the real samples — book a visit and bring your moodboard along.",
            "Book a Studio Visit", "contact.html#visit", ("pricing.html#estimator", "Estimate My Cost")),
    ]),
    ["config", "data", "materials", "main"],
    nav="services.html",
)


# ----- 404.html: GitHub Pages / Vercel serve it for any missing address -----
# It can be served from any depth (/site/a/b/c), so a <base> pointing at the
# site root keeps the relative css/js/img paths working.
NOT_FOUND_BASE = (
    '\n<script>(function(){var p=location.pathname,m=p.match(/^\\/interior-designer-demo1\\//);'
    'var b=document.createElement("base");b.href=m?m[0]:"/";document.head.appendChild(b)})()</script>'
)
page(
    "404.html", "Page Not Found",
    "This page doesn't exist — head back to the Interior Core home page.",
    partial("404"),
    ["config", "not-found", "main"],
    head_first=NOT_FOUND_BASE,
    nav="",
)


# ----- project.html: one case-study page, filled in by js/case-study.js -----
page(
    "project.html", "Project",
    "A project by Interior Core: the brief, our approach, photos, materials, timeline and the client's review.",
    "\n\n".join([
        '<main id="caseStudy" class="case-study">\n'
        '  <noscript><section class="cs-section page-top"><h1 class="about-heading">Project</h1>'
        '<p>Please turn on JavaScript to view this project, or <a href="projects.html">see all projects</a>.</p></section></noscript>\n'
        "</main>",
        LIGHTBOX,
    ]),
    ["config", "data", "lightbox", "case-study", "main"],
    nav="projects.html",
    solid_nav=False,
)


# ----- index.html and about.html: shared header, footer, version -----
def refresh(name):
    html = read(name)
    html = re.sub(r'<header id="site-nav">.*?\n</header>', lambda m: header(name), html, count=1, flags=re.S)
    html = re.sub(r'<footer class="site-footer.*?</footer>', lambda m: footer(name), html, count=1, flags=re.S)
    html = re.sub(r'\n<!-- Quick actions.*?-->\n<div class="quick-bar".*?\n</div>', "\n<!-- Floating WhatsApp button (all screen sizes) -->", html, flags=re.S)
    html = re.sub(r'\?v=\w+', "?v=" + VERSION, html)
    if HEAD_SCRIPT not in html:
        html = re.sub(r'<script>\(function\(d\)\{try\{if\(!\("onpagereveal".*?</script>\n', "", html)
        html = html.replace("</head>", HEAD_SCRIPT + "\n</head>", 1)
    if 'id="intro"' not in html:
        html = re.sub(r"(<body[^>]*>\n)", lambda m: m.group(1) + INTRO + "\n", html, count=1)
    if "js/transitions.js" not in html:
        html = html.replace('<script src="js/config.js', '<script src="js/transitions.js?v=%s"></script>\n<script src="js/config.js' % VERSION, 1)
    if name != "index.html":
        html = html.replace("index.html#contact", "contact.html")
        html = WA_ICON.sub(lambda m: wa_float(name), html)
    write(name, html)


refresh("index.html")
INDEX = read("index.html")
refresh("about.html")
