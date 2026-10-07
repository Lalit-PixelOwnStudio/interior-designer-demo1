/* Case-study page (project.html?id=project-1). Builds the page from the
   project's entry in js/data.js: hero, key facts, brief and approach,
   photo grid, before/after slider, materials, timeline, client review and
   the next project. */
(function () {
  "use strict";

  var root = document.getElementById("caseStudy");
  if (!root || !window.IC_DATA) return;

  var ALL = window.IC_DATA.PROJECTS.filter(function (p) { return p.portfolio !== false; });
  var id = new URLSearchParams(window.location.search).get("id");
  var index = -1;
  ALL.forEach(function (p, i) { if (p.id === id) index = i; });
  if (index === -1) index = 0;
  var project = ALL[index];
  var cs = project.caseStudy || {};
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var PIN = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 22s7-6.2 7-12a7 7 0 0 0-14 0c0 5.8 7 12 7 12Z"/><circle cx="12" cy="10" r="2.5"/></svg>';
  var ARROW = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>';

  function esc(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  function head(eyebrow, title) {
    return '<div class="cs-head reveal-group"><span class="eyebrow reveal-item" style="--d:0">' + eyebrow +
      '</span><h2 class="about-heading reveal-item" style="--d:1">' + title + "</h2></div>";
  }

  document.title = project.title + " — Interior Core";
  var cover = project.images[0];
  var html = [];

  /* ----- Hero ----- */
  html.push(
    '<section class="cs-hero">' +
      '<img class="cs-hero-img" src="' + cover.large + '" alt="" decoding="async">' +
      '<div class="cs-hero-inner">' +
        '<nav class="cs-crumbs" aria-label="Breadcrumb"><a href="projects.html">Projects</a><span aria-hidden="true">/</span><span>' + esc(project.category) + "</span></nav>" +
        '<h1 class="about-heading">' + esc(project.title) + "</h1>" +
        (project.location ? '<p class="cs-hero-loc">' + PIN + esc(project.location) + "</p>" : "") +
      "</div>" +
    "</section>"
  );

  /* ----- Key facts ----- */
  var facts = [
    ["Project value", project.price || "On request"],
    ["Home", cs.home],
    ["Area", cs.area],
    ["Duration", cs.duration],
    ["Completed", cs.year]
  ].filter(function (f) { return f[1]; });
  html.push(
    '<div class="cs-facts"><dl>' +
      facts.map(function (f) {
        return '<div class="cs-fact"><dt>' + f[0] + "</dt><dd>" + esc(f[1]) + "</dd></div>";
      }).join("") +
    "</dl></div>"
  );

  /* ----- Brief + approach ----- */
  if (cs.brief || project.description) {
    html.push(
      '<section class="cs-section cs-story">' +
        '<div class="cs-brief reveal-group">' +
          '<span class="eyebrow reveal-item" style="--d:0">The Brief</span>' +
          '<h2 class="about-heading reveal-item" style="--d:1">What the client needed</h2>' +
          '<p class="reveal-item" style="--d:2">' + esc(cs.brief || project.description) + "</p>" +
          (project.tags ? '<div class="cs-tags reveal-item" style="--d:3">' + project.tags.map(function (t) {
            return '<span class="portfolio-tag">' + esc(t) + "</span>";
          }).join("") + "</div>" : "") +
        "</div>" +
        (cs.approach ? '<div class="cs-approach reveal-group">' +
          '<span class="eyebrow reveal-item" style="--d:0">Our Approach</span>' +
          '<h2 class="about-heading reveal-item" style="--d:1">How we solved it</h2>' +
          '<ol class="cs-steps">' + cs.approach.map(function (a, i) {
            return '<li class="reveal-item" style="--d:' + (i + 2) + '">' + esc(a) + "</li>";
          }).join("") + "</ol>" +
        "</div>" : "") +
      "</section>"
    );
  }

  /* ----- Photos ----- */
  // first photo is large; a few others go double-width so every row fills
  // (4 columns on desktop, 2 on phones)
  var n = project.images.length;
  var wide = [];
  var needWide = (4 - (3 + n) % 4) % 4;
  for (var w = n - 1; w >= 1 && wide.length < needWide; w -= 3) wide.push(w);
  for (w = n - 2; w >= 1 && wide.length < needWide; w--) if (wide.indexOf(w) === -1) wide.push(w);
  var wideOnPhone = (n - 1) % 2 ? n - 1 : -1;
  function photoClass(i) {
    return "cs-photo" + (wide.indexOf(i) !== -1 ? " wide" : "") + (i === wideOnPhone ? " wide-m" : "");
  }

  html.push(
    '<section class="cs-section">' +
      head("Gallery", "Inside the project") +
      '<div class="cs-gallery">' + project.images.map(function (img, i) {
        return '<button type="button" class="' + photoClass(i) + '" data-i="' + i + '" aria-label="Open photo ' + (i + 1) + '">' +
          '<img src="' + img.small + '" srcset="' + img.small + " 640w, " + img.large + ' 1280w" sizes="(max-width: 768px) 50vw, 33vw" alt="' + esc(project.title) + " — photo " + (i + 1) + '" loading="lazy" decoding="async"></button>';
      }).join("") + "</div>" +
    "</section>"
  );

  /* ----- Before / after ----- */
  var ba = typeof cs.ba === "number" ? window.IC_DATA.BA_ROOMS[cs.ba] : null;
  if (ba) {
    html.push(
      '<section class="cs-section">' +
        head("Before &amp; After", "The transformation") +
        '<div class="cs-ba" style="--pos:50%">' +
          '<img src="' + ba.before.large + '" alt="' + esc(ba.room) + ' before" loading="lazy" decoding="async">' +
          '<img class="cs-ba-after" src="' + ba.after.large + '" alt="' + esc(ba.room) + ' after" loading="lazy" decoding="async">' +
          '<span class="cs-ba-tag cs-ba-before">Before</span><span class="cs-ba-tag cs-ba-after-tag">After</span>' +
          '<span class="cs-ba-line" aria-hidden="true"></span>' +
          '<span class="cs-ba-knob" aria-hidden="true"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 6 3 12 9 18"/><polyline points="15 6 21 12 15 18"/></svg></span>' +
          '<input type="range" min="0" max="100" value="50" aria-label="Drag to compare before and after">' +
        "</div>" +
        '<p class="cs-ba-note">Drag the handle to compare.</p>' +
      "</section>"
    );
  }

  /* ----- Materials + timeline ----- */
  if (cs.materials || cs.timeline) {
    var total = (cs.timeline || []).reduce(function (s, t) { return s + t.days; }, 0);
    var start = 0;
    html.push(
      '<section class="cs-band wave-top"><div class="cs-band-inner">' +
        (cs.materials ? '<div class="cs-block">' + head("Materials", "What went into it") +
          '<div class="cs-materials reveal-group">' + cs.materials.map(function (m, i) {
            return '<div class="cs-mat reveal-item" style="--d:' + i + '"><span class="cs-swatch" style="background:' + m.swatch + '"></span>' +
              "<span><strong>" + esc(m.name) + "</strong><small>" + esc(m.detail) + "</small></span></div>";
          }).join("") + "</div></div>" : "") +
        (cs.timeline ? '<div class="cs-block">' + head("Timeline", "From first sketch to handover") +
          '<div class="cs-timeline">' + cs.timeline.map(function (t, i) {
            var row = '<div class="cs-phase"><div class="cs-phase-name"><strong>' + esc(t.phase) + "</strong><small>" + t.days + ' days</small></div>' +
              '<div class="cs-track"><i style="--s:' + (start / total * 100) + "%;--w:" + (t.days / total * 100) + "%;--k:" + i + '"></i></div></div>';
            start += t.days;
            return row;
          }).join("") +
          '<div class="cs-scale"><span>Day 1</span><span>Handover · Day ' + total + "</span></div>" +
          "</div></div>" : "") +
      "</div></section>"
    );
  }

  /* ----- Review ----- */
  if (cs.review) {
    html.push(
      '<section class="cs-review-band wave-top"><div class="cs-section cs-review reveal-group">' +
        '<span class="cs-quote reveal-item" style="--d:0" aria-hidden="true">“</span>' +
        '<blockquote class="reveal-item" style="--d:1"><p>' + esc(cs.review.text) + "</p></blockquote>" +
        '<div class="cs-stars reveal-item" style="--d:2" aria-label="Rated 5 out of 5">★★★★★</div>' +
        '<p class="cs-reviewer reveal-item" style="--d:3"><strong>' + esc(cs.review.name) + "</strong><small>" + esc(cs.review.role) + "</small></p>" +
      "</div></section>"
    );
  }

  /* ----- CTA + next project ----- */
  var next = ALL[(index + 1) % ALL.length];
  html.push(
    '<section class="cs-end wave-top"><div class="cs-end-inner">' +
      '<div class="cs-cta">' +
        '<h2 class="about-heading">Want a home like this?</h2>' +
        '<p class="section-subline">Visit our studio to see materials up close, or get a quick estimate for your home.</p>' +
        '<div class="cs-cta-btns"><a href="contact.html#visit" class="lb-cta">Book a Studio Visit</a>' +
        '<a href="pricing.html#estimator" class="cs-ghost">Estimate My Cost</a></div>' +
      "</div>" +
      '<a class="cs-next" href="project.html?id=' + next.id + '">' +
        '<img src="' + next.images[0].small + '" alt="" loading="lazy" decoding="async">' +
        '<span class="cs-next-text"><small>Next project</small><strong>' + esc(next.title) + "</strong>" +
        (next.location ? "<em>" + esc(next.location) + "</em>" : "") + "</span>" +
        '<span class="cs-next-arrow">' + ARROW + "</span>" +
      "</a>" +
    "</div></section>"
  );

  root.innerHTML = html.join("");

  /* ----- Photo grid opens the viewer ----- */
  root.querySelectorAll(".cs-photo").forEach(function (btn) {
    btn.addEventListener("click", function () {
      if (window.ICLightbox) window.ICLightbox.open(project.images, Number(btn.getAttribute("data-i")));
    });
  });

  /* ----- Before / after: drag anywhere on the photo, or use the keyboard ----- */
  var baEl = root.querySelector(".cs-ba");
  if (baEl) {
    var range = baEl.querySelector("input");
    var setPos = function (v) {
      v = Math.max(0, Math.min(100, v));
      baEl.style.setProperty("--pos", v + "%");
      range.value = String(Math.round(v));
    };
    var fromEvent = function (e) {
      var r = baEl.getBoundingClientRect();
      setPos((e.clientX - r.left) / r.width * 100);
    };
    var dragging = false;
    baEl.addEventListener("pointerdown", function (e) {
      dragging = true;
      baEl.setPointerCapture(e.pointerId);
      fromEvent(e);
    });
    baEl.addEventListener("pointermove", function (e) { if (dragging) fromEvent(e); });
    baEl.addEventListener("pointerup", function () { dragging = false; });
    baEl.addEventListener("pointercancel", function () { dragging = false; });
    range.addEventListener("input", function () { setPos(Number(range.value)); });

    // a gentle nudge the first time it scrolls into view, to show it moves
    if ("IntersectionObserver" in window && !reduceMotion) {
      new IntersectionObserver(function (entries, obs) {
        if (!entries[0].isIntersecting) return;
        obs.disconnect();
        baEl.classList.add("cs-ba-hint");
        setTimeout(function () { baEl.classList.remove("cs-ba-hint"); }, 1600);
      }, { threshold: 0.6 }).observe(baEl);
    }
  }

  /* ----- Timeline bars grow in when seen ----- */
  var timeline = root.querySelector(".cs-timeline");
  if (timeline) {
    if ("IntersectionObserver" in window && !reduceMotion) {
      new IntersectionObserver(function (entries, obs) {
        if (entries[0].isIntersecting) { timeline.classList.add("in-view"); obs.disconnect(); }
      }, { threshold: 0.15 }).observe(timeline);
    } else {
      timeline.classList.add("in-view");
    }
  }
})();
