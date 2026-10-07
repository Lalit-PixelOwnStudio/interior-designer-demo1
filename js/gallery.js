(function () {
  "use strict";

  var grid = document.getElementById("galleryGrid");
  var clip = document.getElementById("galleryClip") || grid;
  var moreWrap = document.getElementById("galleryMoreWrap");
  var moreBtn = document.getElementById("galleryMore");
  if (!grid || !window.IC_DATA) return;

  var ALL_IMAGES = [];
  window.IC_DATA.PROJECTS.forEach(function (project) {
    project.images.forEach(function (img) {
      ALL_IMAGES.push(img);
    });
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

  // Some tiles span two rows or two columns so the pile looks hand-made.
  function pickSpanClass() {
    var r = Math.random();
    if (window.innerWidth < 768) {
      if (r < 0.18) return "tile-tall";
      if (r < 0.32) return "tile-wide";
      return "";
    }
    if (r < 0.25) return "tile-tall";
    if (r < 0.45) return "tile-wide";
    return "";
  }

  // Same overlapping, tilted "card pile" on every screen.
  var images = shuffle(ALL_IMAGES).slice(0, 30);
  var maxTilt = window.innerWidth < 768 ? 5 : 6;

  images.forEach(function (item, index) {
    var tile = document.createElement("button");
    tile.type = "button";
    var spanClass = pickSpanClass();
    tile.className = "gallery-tile" + (spanClass ? " " + spanClass : "");
    tile.setAttribute("aria-label", "Open photo " + (index + 1));
    tile.style.setProperty("--r", (Math.random() * maxTilt * 2 - maxTilt).toFixed(1) + "deg");
    tile.style.zIndex = String(Math.floor(Math.random() * 20) + 1);

    var img = document.createElement("img");
    img.src = item.small;
    img.alt = "";
    img.loading = "lazy";
    img.decoding = "async";
    tile.appendChild(img);

    var overlay = document.createElement("div");
    overlay.className = "gallery-tile-overlay";
    overlay.innerHTML =
      '<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true">' +
      '<path d="M9 3H4v5M15 3h5v5M9 21H4v-5M15 21h5v-5"/></svg>';
    tile.appendChild(overlay);

    tile.addEventListener("click", function () {
      if (window.ICLightbox) window.ICLightbox.open(images, index);
    });

    grid.appendChild(tile);
  });

  // The pile is cropped with a soft fade; "Show more" opens all of it.
  function updateMore() {
    if (!moreWrap || clip.classList.contains("expanded")) return;
    moreWrap.hidden = grid.scrollHeight <= clip.clientHeight;
  }

  if (moreBtn) {
    moreBtn.addEventListener("click", function () {
      clip.classList.add("expanded");
      moreWrap.hidden = true;
    });
  }

  updateMore();
  window.addEventListener("resize", updateMore);
})();
