/* Full-screen photo viewer shared by the gallery and the portfolio.
   With a project passed in, a details panel shows its name, price,
   location, description, tags and photo thumbnails beside the photo
   (below it on phones). Swipe on phones, arrow keys / buttons on desktop. */
(function () {
  "use strict";

  var lightbox = document.getElementById("lightbox");
  if (!lightbox) return;

  var stage = document.getElementById("lightboxStage");
  var image = document.getElementById("lightboxImage");
  var counter = document.getElementById("lightboxCounter");
  var details = document.getElementById("lightboxDetails");
  var closeBtn = document.getElementById("lightboxClose");
  var prevBtn = document.getElementById("lightboxPrev");
  var nextBtn = document.getElementById("lightboxNext");

  var media = lightbox.querySelector(".lightbox-media");
  var phoneLayout = window.matchMedia("(max-width: 900px)");

  // Phones, project mode: a swipeable photo strip on top of a scrolling
  // listing (photos, then details), like a property listing page.
  var carousel = document.createElement("div");
  carousel.className = "lb-carousel";
  media.insertBefore(carousel, media.firstChild);

  // "Swipe to see all photos" note; fades away after the first swipe.
  var hint = document.createElement("div");
  hint.className = "lb-swipe-hint";
  hint.setAttribute("aria-hidden", "true");
  hint.innerHTML =
    '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 6 3 12 9 18"/></svg>' +
    "<span>Swipe to see all photos</span>" +
    '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 6 21 12 15 18"/></svg>';
  media.appendChild(hint);

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var contactHref = document.body.getAttribute("data-contact-href") || "#contact";
  var items = [];
  var current = 0;
  var label = "";
  var lastFocus = null;
  var thumbs = [];

  var PIN =
    '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    '<path d="M12 22s7-6.2 7-12a7 7 0 0 0-14 0c0 5.8 7 12 7 12Z"/><circle cx="12" cy="10" r="2.5"/></svg>';

  function preload(item) {
    if (!item) return;
    var im = new Image();
    im.src = item.large;
  }

  function usingCarousel() {
    return lightbox.classList.contains("has-details") && phoneLayout.matches;
  }

  function markActive() {
    counter.textContent = (current + 1) + " / " + items.length;
    thumbs.forEach(function (t, i) {
      t.classList.toggle("active", i === current);
      if (i === current) t.setAttribute("aria-current", "true");
      else t.removeAttribute("aria-current");
    });
  }

  function show(index, smooth) {
    current = (index + items.length) % items.length;
    var item = items[current];
    image.src = item.large;
    image.alt = (label || "Interior Core project") + " — photo " + (current + 1);
    markActive();
    if (usingCarousel()) {
      carousel.scrollTo({ left: current * carousel.clientWidth, behavior: smooth && !reduceMotion ? "smooth" : "auto" });
    }
    preload(items[(current + 1) % items.length]);
    preload(items[(current - 1 + items.length) % items.length]);
  }

  function go(step) {
    if (items.length < 2) return;
    if (reduceMotion) return show(current + step);
    image.classList.add("switching");
    setTimeout(function () {
      show(current + step);
      image.classList.remove("switching");
    }, 160);
  }

  function renderCarousel(project) {
    carousel.innerHTML = "";
    if (!project) return;
    items.forEach(function (item, i) {
      var img = document.createElement("img");
      img.src = item.small;
      img.srcset = item.small + " 640w, " + item.large + " 1280w";
      img.sizes = "100vw";
      img.alt = project.title + " — photo " + (i + 1);
      img.loading = i < 2 ? "eager" : "lazy";
      img.decoding = "async";
      carousel.appendChild(img);
    });
  }

  var scrollTick = false;
  carousel.addEventListener("scroll", function () {
    if (scrollTick) return;
    scrollTick = true;
    requestAnimationFrame(function () {
      scrollTick = false;
      var i = Math.round(carousel.scrollLeft / Math.max(carousel.clientWidth, 1));
      if (i !== current && i >= 0 && i < items.length) {
        current = i;
        markActive();
        hint.classList.add("seen");
      }
    });
  }, { passive: true });

  function renderDetails(project) {
    thumbs = [];
    if (!project) {
      details.hidden = true;
      details.innerHTML = "";
      lightbox.classList.remove("has-details");
      return;
    }

    var tags = (project.tags || []).map(function (t) {
      return '<span class="lb-tag">' + t + "</span>";
    }).join("");

    details.innerHTML =
      (project.category ? '<span class="lb-eyebrow">' + project.category + "</span>" : "") +
      '<h3 class="lb-title">' + project.title + "</h3>" +
      '<div class="lb-meta">' +
        (project.price
          ? '<span class="lb-price"><small>Project value</small>' + project.price + "</span>"
          : '<span class="lb-price lb-price-na"><small>Project value</small>On request</span>') +
        (project.location ? '<span class="lb-location">' + PIN + project.location + "</span>" : "") +
      "</div>" +
      (project.description ? '<p class="lb-desc">' + project.description + "</p>" : "") +
      (tags ? '<div class="lb-tags">' + tags + "</div>" : "") +
      '<div class="lb-thumbs-label">All photos</div>' +
      '<div class="lb-thumbs" id="lbThumbs"></div>' +
      '<a class="lb-cta" href="' + contactHref + '">Get a Quote for a Similar Space</a>';

    var thumbsEl = details.querySelector("#lbThumbs");
    items.forEach(function (item, i) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "lb-thumb";
      b.setAttribute("aria-label", "Show photo " + (i + 1));
      b.innerHTML = '<img src="' + item.small + '" alt="" loading="lazy">';
      b.addEventListener("click", function () {
        if (usingCarousel()) lightbox.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
        show(i, true);
      });
      thumbsEl.appendChild(b);
      thumbs.push(b);
    });

    details.querySelector(".lb-cta").addEventListener("click", function () {
      close();
    });

    details.hidden = false;
    details.scrollTop = 0;
    lightbox.classList.add("has-details");
  }

  // open(photos, startIndex, project?) — project adds the details panel.
  function open(list, index, project) {
    items = list;
    label = (project && project.title) || "";
    lastFocus = document.activeElement;

    var single = items.length < 2;
    prevBtn.hidden = single;
    nextBtn.hidden = single;

    renderDetails(project);
    renderCarousel(project);
    hint.classList.toggle("seen", !project || items.length < 2);
    media.style.opacity = "";
    media.style.transform = "";
    lightbox.classList.add("open");
    lightbox.scrollTop = 0;
    carousel.scrollLeft = 0;
    show(index || 0);
    lightbox.setAttribute("aria-hidden", "false");
    document.body.classList.add("lightbox-open");
    closeBtn.focus({ preventScroll: true });
  }

  function close() {
    lightbox.classList.remove("open");
    lightbox.setAttribute("aria-hidden", "true");
    document.body.classList.remove("lightbox-open");
    if (lastFocus) lastFocus.focus({ preventScroll: true });
  }

  closeBtn.addEventListener("click", close);
  nextBtn.addEventListener("click", function () { go(1); });
  prevBtn.addEventListener("click", function () { go(-1); });

  lightbox.addEventListener("click", function (e) {
    if (e.target === stage || e.target.classList.contains("lightbox-media")) close();
  });

  document.addEventListener("keydown", function (e) {
    if (!lightbox.classList.contains("open")) return;
    if (e.key === "Escape") close();
    if (e.key === "ArrowRight") go(1);
    if (e.key === "ArrowLeft") go(-1);
  });

  // Swipe left/right to change photo, swipe down to close.
  var startX = 0;
  var startY = 0;
  var tracking = false;

  stage.addEventListener("touchstart", function (e) {
    if (e.touches.length !== 1) return;
    tracking = true;
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
  }, { passive: true });

  stage.addEventListener("touchend", function (e) {
    if (!tracking) return;
    tracking = false;
    var dx = e.changedTouches[0].clientX - startX;
    var dy = e.changedTouches[0].clientY - startY;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
      go(dx < 0 ? 1 : -1);
    } else if (dy > 90 && Math.abs(dy) > Math.abs(dx)) {
      close();
    }
  }, { passive: true });

  // Phones: as the listing scrolls up, the photo fades and eases back
  // behind the details card.
  var fadeTick = false;
  lightbox.addEventListener("scroll", function () {
    if (fadeTick || !usingCarousel()) return;
    fadeTick = true;
    requestAnimationFrame(function () {
      fadeTick = false;
      var h = media.offsetHeight || 1;
      var t = Math.min(lightbox.scrollTop / (h * 0.85), 1);
      media.style.opacity = String(1 - t * 0.85);
      media.style.transform = reduceMotion ? "" : "scale(" + (1 + t * 0.06) + ")";
    });
  }, { passive: true });

  window.ICLightbox = { open: open, close: close };
})();
