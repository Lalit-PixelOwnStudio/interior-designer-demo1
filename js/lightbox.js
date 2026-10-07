/* Full-screen photo viewer shared by the gallery and the portfolio
   ("View Project"). Swipe on phones, arrow keys / buttons on desktop. */
(function () {
  "use strict";

  var lightbox = document.getElementById("lightbox");
  if (!lightbox) return;

  var stage = document.getElementById("lightboxStage");
  var image = document.getElementById("lightboxImage");
  var counter = document.getElementById("lightboxCounter");
  var info = document.getElementById("lightboxInfo");
  var closeBtn = document.getElementById("lightboxClose");
  var prevBtn = document.getElementById("lightboxPrev");
  var nextBtn = document.getElementById("lightboxNext");

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var items = [];
  var current = 0;
  var label = "";
  var lastFocus = null;

  function preload(item) {
    if (!item) return;
    var im = new Image();
    im.src = item.large;
  }

  function show(index) {
    current = (index + items.length) % items.length;
    var item = items[current];
    image.src = item.large;
    image.alt = (label || "Interior Core project") + " — photo " + (current + 1);
    counter.textContent = (current + 1) + " / " + items.length;
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

  function open(list, index, details) {
    items = list;
    label = (details && details.title) || "";
    lastFocus = document.activeElement;

    if (details && details.title) {
      info.innerHTML =
        "<h3>" + details.title + "</h3>" +
        (details.meta ? "<p>" + details.meta + "</p>" : "");
      info.hidden = false;
    } else {
      info.innerHTML = "";
      info.hidden = true;
    }

    var single = items.length < 2;
    prevBtn.hidden = single;
    nextBtn.hidden = single;

    show(index || 0);
    lightbox.classList.add("open");
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
    if (e.target === lightbox || e.target === stage) close();
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

  window.ICLightbox = { open: open, close: close };
})();
