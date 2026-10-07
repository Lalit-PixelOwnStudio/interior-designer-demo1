(function () {
  "use strict";

  var PROJECT_FOLDERS = [
    { name: "project 1", count: 10 },
    { name: "Project 2", count: 10 },
    { name: "Project 3", count: 9 },
    { name: "Project 4", count: 10 },
    { name: "Project 5", count: 10 },
    { name: "Project 6", count: 10 }
  ];

  var ALL_IMAGES = [];
  PROJECT_FOLDERS.forEach(function (folder) {
    for (var i = 1; i <= folder.count; i++) {
      ALL_IMAGES.push("Assets/" + folder.name + "/" + i + ".jpeg");
    }
  });

  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = a[i];
      a[i] = a[j];
      a[j] = tmp;
    }
    return a;
  }

  function pickSpanClass() {
    var w = window.innerWidth;
    if (w < 768) return "";
    var r = Math.random();
    if (w < 1024) {
      if (r < 0.12) return "tile-tall";
      if (r < 0.3) return "tile-wide";
      return "";
    }
    if (r < 0.25) return "tile-tall";
    if (r < 0.45) return "tile-wide";
    return "";
  }

  var grid = document.getElementById("galleryGrid");
  if (!grid) return;

  var images = shuffle(ALL_IMAGES).slice(0, 30);
  var scattered = window.innerWidth >= 768;
  if (scattered) grid.classList.add("scattered");

  images.forEach(function (src, index) {
    var tile = document.createElement("div");
    var spanClass = pickSpanClass();
    tile.className = "gallery-tile" + (spanClass ? " " + spanClass : "");
    tile.setAttribute("data-index", String(index));

    if (scattered) {
      var rotate = (Math.random() * 12 - 6).toFixed(1);
      tile.style.setProperty("--r", rotate + "deg");
      tile.style.zIndex = String(Math.floor(Math.random() * 20) + 1);
    }

    var img = document.createElement("img");
    img.src = src;
    img.alt = "Interior Core project photo " + (index + 1);
    img.loading = "lazy";
    tile.appendChild(img);

    var overlay = document.createElement("div");
    overlay.className = "gallery-tile-overlay";
    overlay.innerHTML =
      '<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="1.6">' +
      '<path d="M9 3H4v5M15 3h5v5M9 21H4v-5M15 21h5v-5"/></svg>';
    tile.appendChild(overlay);

    tile.addEventListener("click", function () {
      openLightbox(index);
    });

    grid.appendChild(tile);
  });

  var lightbox = document.getElementById("lightbox");
  var lightboxStage = document.getElementById("lightboxStage");
  var lightboxImage = document.getElementById("lightboxImage");
  var lightboxCounter = document.getElementById("lightboxCounter");
  var lightboxClose = document.getElementById("lightboxClose");
  var lightboxPrev = document.getElementById("lightboxPrev");
  var lightboxNext = document.getElementById("lightboxNext");

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var currentIndex = 0;
  var isOpen = false;
  var previousOverflow = "";

  function preload(src) {
    var im = new Image();
    im.src = src;
  }

  function setImage(index) {
    var src = images[index];
    lightboxImage.src = src;
    lightboxImage.alt = "Interior Core project photo " + (index + 1);
    lightboxCounter.textContent = (index + 1) + " / " + images.length;
    preload(images[(index + 1) % images.length]);
    preload(images[(index - 1 + images.length) % images.length]);
  }

  function goTo(index, animate) {
    currentIndex = index;
    if (animate && !reduceMotion) {
      lightboxImage.classList.add("switching");
      setTimeout(function () {
        setImage(currentIndex);
        lightboxImage.classList.remove("switching");
      }, 180);
    } else {
      setImage(currentIndex);
    }
  }

  function openLightbox(index) {
    isOpen = true;
    currentIndex = index;
    setImage(currentIndex);
    lightbox.classList.add("open");
    lightbox.setAttribute("aria-hidden", "false");
    previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
  }

  function closeLightbox() {
    isOpen = false;
    lightbox.classList.remove("open");
    lightbox.setAttribute("aria-hidden", "true");
    document.body.style.overflow = previousOverflow;
  }

  function showNext() {
    goTo((currentIndex + 1) % images.length, true);
  }

  function showPrev() {
    goTo((currentIndex - 1 + images.length) % images.length, true);
  }

  lightboxClose.addEventListener("click", closeLightbox);
  lightboxNext.addEventListener("click", showNext);
  lightboxPrev.addEventListener("click", showPrev);

  lightbox.addEventListener("click", function (e) {
    if (e.target === lightbox) {
      closeLightbox();
    }
  });

  document.addEventListener("keydown", function (e) {
    if (!isOpen) return;
    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowRight") showNext();
    if (e.key === "ArrowLeft") showPrev();
  });
})();
