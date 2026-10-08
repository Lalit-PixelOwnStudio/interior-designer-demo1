/* Material library (materials.html): filterable swatches, a details
   dialog for each one, and a moodboard the visitor can save swatches to
   (kept in this browser) and send to the studio on WhatsApp.
   Swatch images are in img/materials/ (scripts/make-material-swatches.py). */
(function () {
  "use strict";

  var grid = document.getElementById("matGrid");
  if (!grid) return;

  var CATEGORIES = ["Laminates", "Veneers", "Marble & Stone", "Fabrics", "Metals & Accents"];
  var TIERS = ["", "Budget-friendly", "Mid-range", "Premium"];

  // price: 1-3 (₹ to ₹₹₹), durability: 1-5
  var MATERIALS = [
    { id: "laminate-matte-ivory", name: "Matte Ivory", cat: "Laminates", finish: "Super-matte, anti-fingerprint", best: "Wardrobes, kitchen shutters", price: 1, durability: 4, care: "Wipe with a damp cloth", desc: "A warm off-white that keeps rooms bright without the glare of gloss. The super-matte surface hides fingerprints and small scuffs." },
    { id: "laminate-charcoal-suede", name: "Charcoal Suede", cat: "Laminates", finish: "Suede-touch matte", best: "Kitchen base units, TV walls", price: 1, durability: 4, care: "Wipe with a damp cloth", desc: "Deep charcoal with a soft, velvety touch. It grounds a light kitchen and looks sharp with brass or black handles.", project: "project-6" },
    { id: "laminate-sage-matte", name: "Sage Green", cat: "Laminates", finish: "Matte", best: "Kitchens, kids' rooms", price: 1, durability: 4, care: "Wipe with a damp cloth", desc: "A calm, earthy green that pairs beautifully with oak and brass — our most requested colour this year." },
    { id: "laminate-high-gloss-white", name: "High-Gloss White", cat: "Laminates", finish: "Mirror-gloss, acrylic look", best: "Kitchens, compact rooms", price: 2, durability: 3, care: "Microfibre cloth, no abrasives", desc: "Reflects light to make small kitchens feel bigger. Seamless, easy to clean and very modern.", project: "project-1" },
    { id: "laminate-natural-oak", name: "Natural Oak Print", cat: "Laminates", finish: "Textured woodgrain", best: "Wardrobes, bed backs", price: 1, durability: 5, care: "Wipe with a damp cloth", desc: "The warmth of oak with the toughness of laminate. The grain is embossed, so it feels like real wood.", project: "project-7" },
    { id: "veneer-american-walnut", name: "American Walnut", cat: "Veneers", finish: "Natural veneer, matte PU", best: "TV walls, doors, feature panels", price: 3, durability: 3, care: "Dust regularly, avoid direct sun", desc: "Rich chocolate tones with a flowing cathedral grain. Every sheet is unique, so no two walls look the same.", project: "project-1" },
    { id: "veneer-natural-oak", name: "Natural Oak", cat: "Veneers", finish: "Open-pore matte", best: "Shelves, side tables, panelling", price: 2, durability: 3, care: "Dust regularly, wipe spills quickly", desc: "Light, honey-toned oak with a fine straight grain. Clean and Scandinavian, it works with almost any palette.", project: "project-2" },
    { id: "veneer-burma-teak", name: "Burma Teak", cat: "Veneers", finish: "Natural veneer, satin PU", best: "Main doors, pooja units", price: 3, durability: 4, care: "Polish once a year", desc: "The classic Indian favourite — golden-brown teak that deepens beautifully with age.", project: "project-5" },
    { id: "veneer-smoked-oak", name: "Smoked Oak", cat: "Veneers", finish: "Fumed veneer, matte", best: "Wardrobes, wall panelling", price: 3, durability: 3, care: "Dust regularly", desc: "Oak darkened by smoking, giving a soft grey-brown that feels quiet and luxurious." },
    { id: "marble-statuario", name: "Statuario", cat: "Marble & Stone", finish: "Italian marble, polished", best: "Living room floors, feature walls", price: 3, durability: 4, care: "Seal every year, wipe acidic spills", desc: "Bright white with bold grey veining — the marble that instantly makes a room feel grand.", project: "project-1" },
    { id: "marble-calacatta-gold", name: "Calacatta Gold", cat: "Marble & Stone", finish: "Italian marble, honed or polished", best: "Kitchen islands, backsplashes", price: 3, durability: 4, care: "Seal every year, use trivets", desc: "Creamy white with soft grey and gold veins. Our go-to for statement kitchen islands.", project: "project-5" },
    { id: "marble-nero-marquina", name: "Nero Marquina", cat: "Marble & Stone", finish: "Spanish marble, polished", best: "Vanities, accent strips, table tops", price: 3, durability: 4, care: "Seal every year", desc: "Jet-black marble with crisp white veins — dramatic in bathrooms and as inlay strips." },
    { id: "marble-emperador", name: "Emperador Brown", cat: "Marble & Stone", finish: "Spanish marble, polished", best: "Bathroom walls, coffee tables", price: 2, durability: 4, care: "Seal every year", desc: "Warm coffee-brown marble with fine cream veins. Cosy and rich without feeling dark." },
    { id: "stone-terrazzo", name: "Terrazzo", cat: "Marble & Stone", finish: "Cement terrazzo, sealed", best: "Floors, bathroom counters", price: 2, durability: 5, care: "Mop with neutral cleaner", desc: "Playful chips of stone set in a pale base. Nearly indestructible and great for busy floors." },
    { id: "fabric-natural-linen", name: "Natural Linen", cat: "Fabrics", finish: "Washed linen blend", best: "Curtains, cushion covers", price: 1, durability: 3, care: "Machine wash cold", desc: "Relaxed, breathable and softly textured — lets in a gentle glow when used for sheer curtains.", project: "project-2" },
    { id: "fabric-emerald-velvet", name: "Emerald Velvet", cat: "Fabrics", finish: "Performance velvet", best: "Accent chairs, headboards", price: 2, durability: 3, care: "Vacuum, spot clean", desc: "Jewel-toned velvet with a deep sheen. Stain-resistant, so it's practical as well as glamorous.", project: "project-2" },
    { id: "fabric-terracotta-velvet", name: "Terracotta Velvet", cat: "Fabrics", finish: "Performance velvet", best: "Sofas, ottomans", price: 2, durability: 3, care: "Vacuum, spot clean", desc: "A sun-warmed clay colour that brings instant warmth to neutral living rooms." },
    { id: "fabric-ivory-boucle", name: "Ivory Bouclé", cat: "Fabrics", finish: "Looped bouclé", best: "Lounge chairs, sofas", price: 2, durability: 3, care: "Professional clean", desc: "Soft, nubby loops you want to sink into. Adds texture to minimal spaces.", project: "project-3" },
    { id: "fabric-jute", name: "Hand-woven Jute", cat: "Fabrics", finish: "Natural fibre", best: "Rugs, roman blinds", price: 1, durability: 4, care: "Vacuum, keep dry", desc: "Hand-woven, natural and tough. Brings an earthy, grounded feel underfoot.", project: "project-3" },
    { id: "metal-brushed-brass", name: "Brushed Brass", cat: "Metals & Accents", finish: "PVD-coated brass", best: "Handles, trims, inlays", price: 2, durability: 5, care: "Dry cloth only", desc: "Soft-gold brass with a fine brushed texture. The PVD coating keeps it from tarnishing.", project: "project-2" },
    { id: "metal-matte-black", name: "Matte Black Metal", cat: "Metals & Accents", finish: "Powder-coated steel", best: "Profiles, handles, light fittings", price: 1, durability: 5, care: "Damp cloth", desc: "Crisp black lines that frame glass shutters and make modern spaces feel finished.", project: "project-6" },
    { id: "accent-rattan-cane", name: "Rattan Cane", cat: "Metals & Accents", finish: "Natural cane webbing", best: "Wardrobe shutters, bedside units", price: 2, durability: 3, care: "Dust with a soft brush", desc: "Airy woven cane that lets furniture breathe and adds a relaxed, crafted touch." }
  ];

  var byId = {};
  MATERIALS.forEach(function (m) { byId[m.id] = m; });

  var PROJECTS = {};
  ((window.IC_DATA && window.IC_DATA.PROJECTS) || []).forEach(function (p) { PROJECTS[p.id] = p; });

  var cfg = window.IC_CONFIG || {};
  var STORE = "ic-moodboard";
  var saved = [];
  try { saved = JSON.parse(localStorage.getItem(STORE) || "[]").filter(function (id) { return byId[id]; }); } catch (e) { saved = []; }

  function persist() {
    try { localStorage.setItem(STORE, JSON.stringify(saved)); } catch (e) { /* private mode: keep it for this visit */ }
  }

  function img(m) { return "img/materials/" + m.id + ".webp"; }
  function rupees(n) { return "₹₹₹".slice(0, n); }

  var HEART = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" aria-hidden="true"><path d="M12 20.5s-7.5-4.6-9.3-9.2C1.4 7.9 3.6 4.5 7 4.5c2 0 3.3 1.1 5 3 1.7-1.9 3-3 5-3 3.4 0 5.6 3.4 4.3 6.8-1.8 4.6-9.3 9.2-9.3 9.2Z"/></svg>';

  /* ----- Filters ----- */
  var filtersEl = document.getElementById("matFilters");
  var active = "All";
  ["All"].concat(CATEGORIES).forEach(function (cat) {
    var count = cat === "All" ? MATERIALS.length : MATERIALS.filter(function (m) { return m.cat === cat; }).length;
    var b = document.createElement("button");
    b.type = "button";
    b.className = "filter-btn" + (cat === "All" ? " active" : "");
    b.setAttribute("aria-pressed", String(cat === "All"));
    b.innerHTML = cat + " <span>" + count + "</span>";
    b.addEventListener("click", function () {
      active = cat;
      filtersEl.querySelectorAll(".filter-btn").forEach(function (x) {
        x.classList.toggle("active", x === b);
        x.setAttribute("aria-pressed", String(x === b));
      });
      // on phones the row scrolls sideways: bring the picked chip into view
      if (filtersEl.scrollWidth > filtersEl.clientWidth) {
        filtersEl.scrollTo({ left: b.offsetLeft - (filtersEl.clientWidth - b.offsetWidth) / 2, behavior: "smooth" });
      }
      render();
    });
    filtersEl.appendChild(b);
  });

  /* ----- Grid ----- */
  function render() {
    var list = active === "All" ? MATERIALS : MATERIALS.filter(function (m) { return m.cat === active; });
    grid.innerHTML = "";
    list.forEach(function (m, i) {
      var card = document.createElement("article");
      card.className = "mat-card";
      card.setAttribute("data-id", m.id);
      card.style.setProperty("--i", String(i));
      var isSaved = saved.indexOf(m.id) !== -1;
      card.innerHTML =
        '<button type="button" class="mat-open" aria-label="' + m.name + ' — details">' +
          '<span class="mat-swatch"><img src="' + img(m) + '" alt="" loading="lazy" decoding="async"></span>' +
          '<span class="mat-info"><small>' + m.cat + "</small><strong>" + m.name + "</strong><em>" + m.finish + "</em></span>" +
        "</button>" +
        '<span class="mat-price" title="' + TIERS[m.price] + '">' + rupees(m.price) + "</span>" +
        '<button type="button" class="mat-save' + (isSaved ? " saved" : "") + '" aria-pressed="' + isSaved + '" aria-label="Save ' + m.name + ' to moodboard">' + HEART + "</button>";
      card.querySelector(".mat-open").addEventListener("click", function () { openDetails(m); });
      card.querySelector(".mat-save").addEventListener("click", function (e) { toggleSave(m.id, e.currentTarget); });
      grid.appendChild(card);
    });
  }

  /* ----- Moodboard ----- */
  var board = document.getElementById("moodboard");
  var thumbs = document.getElementById("moodboardThumbs");
  var countEl = document.getElementById("moodboardCount");
  var send = document.getElementById("moodboardSend");

  function toggleSave(id, btn) {
    var i = saved.indexOf(id);
    if (i === -1) saved.push(id); else saved.splice(i, 1);
    persist();
    var on = saved.indexOf(id) !== -1;
    var card = grid.querySelector('.mat-card[data-id="' + id + '"] .mat-save');
    if (card) {
      card.classList.toggle("saved", on);
      card.setAttribute("aria-pressed", String(on));
    }
    if (btn) {
      btn.classList.remove("pop");
      void btn.offsetWidth;
      if (on) btn.classList.add("pop");
    }
    renderBoard();
  }

  function renderBoard() {
    board.hidden = !saved.length;
    document.body.classList.toggle("has-moodboard", saved.length > 0);
    if (!saved.length) return;
    thumbs.innerHTML = saved.slice(-5).map(function (id) {
      return '<img src="' + img(byId[id]) + '" alt="" title="' + byId[id].name + '">';
    }).join("");
    countEl.textContent = saved.length + " saved";
    var lines = ["Hi Interior Core, here's my moodboard from your material library:", ""]
      .concat(saved.map(function (id) { var m = byId[id]; return "• " + m.name + " — " + m.finish + " (" + m.cat + ")"; }))
      .concat(["", "I'd like to see these samples at the studio."]);
    send.href = "https://wa.me/" + (cfg.whatsapp || "") + "?text=" + encodeURIComponent(lines.join("\n"));
    send.target = "_blank";
    send.rel = "noopener";
  }

  document.getElementById("moodboardClear").addEventListener("click", function () {
    saved = [];
    persist();
    render();
    renderBoard();
  });

  /* ----- Details dialog ----- */
  var dialog = document.getElementById("matDialog");
  var body = document.getElementById("matDialogBody");

  function dots(n) {
    var out = "";
    for (var i = 1; i <= 5; i++) out += '<i class="' + (i <= n ? "on" : "") + '"></i>';
    return '<span class="mat-dots" aria-label="' + n + ' out of 5">' + out + "</span>";
  }

  function openDetails(m) {
    var project = m.project && PROJECTS[m.project];
    var isSaved = saved.indexOf(m.id) !== -1;
    body.innerHTML =
      '<div class="mat-zoom" style="background-image:url(' + img(m) + ')"><img src="' + img(m) + '" alt="' + m.name + ' swatch"></div>' +
      '<div class="mat-detail">' +
        "<small>" + m.cat + "</small>" +
        '<h2 id="matDialogTitle">' + m.name + "</h2>" +
        "<p>" + m.desc + "</p>" +
        "<dl>" +
          "<div><dt>Finish</dt><dd>" + m.finish + "</dd></div>" +
          "<div><dt>Best for</dt><dd>" + m.best + "</dd></div>" +
          "<div><dt>Price</dt><dd><b class=\"mat-tier\">" + rupees(m.price) + "</b> " + TIERS[m.price] + "</dd></div>" +
          "<div><dt>Durability</dt><dd>" + dots(m.durability) + "</dd></div>" +
          "<div><dt>Care</dt><dd>" + m.care + "</dd></div>" +
        "</dl>" +
        (project ? '<a class="mat-project" href="project.html?id=' + project.id + '"><img src="' + project.images[0].small + '" alt=""><span><small>See it in a project</small><strong>' + project.title + "</strong></span></a>" : "") +
        '<button type="button" class="form-submit mat-save-big' + (isSaved ? " saved" : "") + '">' + HEART + "<span>" + (isSaved ? "Saved to moodboard" : "Save to moodboard") + "</span></button>" +
      "</div>";
    var bigSave = body.querySelector(".mat-save-big");
    bigSave.addEventListener("click", function () {
      toggleSave(m.id);
      var s = saved.indexOf(m.id) !== -1;
      bigSave.classList.toggle("saved", s);
      bigSave.querySelector("span").textContent = s ? "Saved to moodboard" : "Save to moodboard";
    });

    // hover (or drag on phones) to look closer at the texture
    var zoom = body.querySelector(".mat-zoom");
    function look(e) {
      var r = zoom.getBoundingClientRect();
      var p = e.touches ? e.touches[0] : e;
      zoom.style.setProperty("--zx", ((p.clientX - r.left) / r.width * 100) + "%");
      zoom.style.setProperty("--zy", ((p.clientY - r.top) / r.height * 100) + "%");
      zoom.classList.add("zooming");
    }
    zoom.addEventListener("mousemove", look);
    zoom.addEventListener("mouseleave", function () { zoom.classList.remove("zooming"); });
    zoom.addEventListener("touchmove", function (e) { look(e); }, { passive: true });
    zoom.addEventListener("touchend", function () { zoom.classList.remove("zooming"); });

    if (dialog.showModal) dialog.showModal(); else dialog.setAttribute("open", "");
    document.body.classList.add("dialog-open");
  }

  function closeDialog() {
    if (dialog.close) dialog.close(); else dialog.removeAttribute("open");
  }

  dialog.addEventListener("close", function () { document.body.classList.remove("dialog-open"); });
  document.getElementById("matDialogClose").addEventListener("click", closeDialog);
  dialog.addEventListener("click", function (e) { if (e.target === dialog) closeDialog(); });

  render();
  renderBoard();
})();
