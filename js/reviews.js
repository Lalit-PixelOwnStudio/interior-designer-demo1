/* Google-style review cards.
   Desktop: the cards glide past in an endless row that keeps moving on
   hover; visitors can also drag it left/right (with a little momentum),
   use the arrow buttons, or swipe sideways on a trackpad.
   Phones: a native swipeable row. Long reviews get a "Read more" toggle. */
(function () {
  "use strict";

  var marquee = document.getElementById("reviewsMarquee");
  var track = document.getElementById("reviewsTrack");
  if (!marquee || !track) return;

  var prevBtn = document.getElementById("reviewsPrev");
  var nextBtn = document.getElementById("reviewsNext");
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var desktop = window.matchMedia("(min-width: 769px)");
  var originals = Array.prototype.slice.call(track.children);

  var SPEED = 40;          // auto-glide, px per second
  var offset = 0;          // how far the row has moved, px
  var momentum = 0;        // px per second left over after a drag
  var nudge = 0;           // px still to travel from an arrow click
  var dragging = false;
  var dragMoved = 0;
  var lastX = 0;
  var lastT = 0;
  var dragVelocity = 0;
  var rafId = null;
  var lastFrame = 0;

  /* ----- Read more ----- */
  function setupReadMore(card) {
    var text = card.querySelector(".g-text");
    var btn = card.querySelector(".g-more");
    if (!text || !btn) return;
    btn.hidden = text.scrollHeight <= text.clientHeight + 2;
    btn.onclick = function (e) {
      if (dragMoved > 6) { e.preventDefault(); return; } // it was a drag, not a click
      var open = card.classList.toggle("expanded");
      btn.textContent = open ? "Show less" : "Read more";
    };
  }

  function refreshReadMore() {
    Array.prototype.forEach.call(track.children, function (card) {
      if (!card.classList.contains("expanded")) setupReadMore(card);
    });
  }

  /* ----- Endless row ----- */
  var clones = [];

  function loopWidth() {
    // width of one full set of cards, including the gap after the last one
    var gap = parseFloat(getComputedStyle(track).columnGap) || 0;
    return (track.scrollWidth + gap) / 2;
  }

  function cardStep() {
    var card = originals[0];
    var gap = parseFloat(getComputedStyle(track).columnGap) || 0;
    return card.getBoundingClientRect().width + gap;
  }

  function render() {
    var w = loopWidth();
    if (w > 0) offset = ((offset % w) + w) % w;
    track.style.transform = "translate3d(" + (-offset) + "px, 0, 0)";
  }

  // the marquee only animates while it's on screen
  var onScreen = true;
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (entries) {
      onScreen = entries[0].isIntersecting;
      if (onScreen && clones.length && !rafId) {
        lastFrame = 0;
        rafId = requestAnimationFrame(frame);
      }
    }, { rootMargin: "100px 0px" }).observe(marquee);
  }

  function frame(t) {
    if (!onScreen) { rafId = null; return; }
    var dt = lastFrame ? Math.min((t - lastFrame) / 1000, 0.05) : 0;
    lastFrame = t;
    if (!dragging) {
      var auto = reduceMotion ? 0 : SPEED;
      // arrow-click nudge eases out over ~0.4s
      var step = nudge * Math.min(dt * 8, 1);
      nudge -= step;
      if (Math.abs(nudge) < 0.5) nudge = 0;
      offset += auto * dt + momentum * dt + step;
      momentum *= Math.pow(0.04, dt); // drag momentum fades out
      if (Math.abs(momentum) < 2) momentum = 0;
      render();
    }
    rafId = requestAnimationFrame(frame);
  }

  function enableLoop() {
    if (clones.length) return;
    originals.forEach(function (card) {
      var copy = card.cloneNode(true);
      copy.setAttribute("aria-hidden", "true");
      copy.querySelectorAll("button").forEach(function (b) { b.tabIndex = -1; });
      track.appendChild(copy);
      clones.push(copy);
    });
    marquee.classList.add("looping");
    refreshReadMore();
    lastFrame = 0;
    rafId = requestAnimationFrame(frame);
  }

  function disableLoop() {
    clones.forEach(function (c) { c.remove(); });
    clones = [];
    marquee.classList.remove("looping");
    if (rafId) cancelAnimationFrame(rafId);
    rafId = null;
    offset = momentum = nudge = 0;
    track.style.transform = "";
  }

  /* ----- Drag with mouse / pen (touch on desktop-size screens too) ----- */
  marquee.addEventListener("pointerdown", function (e) {
    if (!marquee.classList.contains("looping")) return;
    if (e.pointerType === "mouse" && e.button !== 0) return;
    dragging = true;
    dragMoved = 0;
    lastX = e.clientX;
    lastT = performance.now();
    dragVelocity = 0;
    momentum = 0;
    nudge = 0;
  });

  window.addEventListener("pointermove", function (e) {
    if (!dragging) return;
    var now = performance.now();
    var dx = e.clientX - lastX;
    dragMoved += Math.abs(dx);
    // only treat it as a drag once it really moves, so clicks still work
    if (dragMoved > 6) marquee.classList.add("dragging");
    offset -= dx;
    var dt = Math.max(now - lastT, 1) / 1000;
    dragVelocity = -dx / dt;
    lastX = e.clientX;
    lastT = now;
    render();
  });

  function endDrag() {
    if (!dragging) return;
    dragging = false;
    marquee.classList.remove("dragging");
    // carry on with the flick, then settle back to the normal glide
    momentum = Math.max(-2500, Math.min(2500, dragVelocity));
    setTimeout(function () { dragMoved = 0; }, 0);
  }

  window.addEventListener("pointerup", endDrag);
  window.addEventListener("pointercancel", endDrag);

  // stop the browser's own image/text drag from interfering
  marquee.addEventListener("dragstart", function (e) { e.preventDefault(); });

  /* ----- Sideways trackpad scroll ----- */
  marquee.addEventListener("wheel", function (e) {
    if (!marquee.classList.contains("looping")) return;
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
      e.preventDefault();
      offset += e.deltaX;
      render();
    }
  }, { passive: false });

  /* ----- Review photos open in the photo viewer ----- */
  track.addEventListener("click", function (e) {
    var thumb = e.target.closest(".g-photo");
    if (!thumb || dragMoved > 6 || !window.ICLightbox) return;
    var thumbs = Array.prototype.slice.call(thumb.parentNode.querySelectorAll(".g-photo"));
    var list = thumbs.map(function (t) {
      var small = t.querySelector("img").getAttribute("src");
      return { small: small, large: t.getAttribute("data-large") || small };
    });
    window.ICLightbox.open(list, thumbs.indexOf(thumb));
  });

  /* ----- Arrow buttons ----- */
  if (prevBtn) prevBtn.addEventListener("click", function () { nudge -= cardStep(); });
  if (nextBtn) nextBtn.addEventListener("click", function () { nudge += cardStep(); });

  function update() {
    if (desktop.matches) enableLoop();
    else disableLoop();
    refreshReadMore();
  }

  desktop.addEventListener("change", update);
  window.addEventListener("load", refreshReadMore);
  update();
})();
