(function () {
  "use strict";

  var grid = document.getElementById("galleryGrid");
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

  // Phones: 12 photos first, then "Show more". Desktop: the full scattered wall.
  var isPhone = window.innerWidth < 768;
  var images = shuffle(ALL_IMAGES).slice(0, 30);
  var initialCount = isPhone ? 12 : images.length;
  var shown = 0;

  var scattered = !isPhone;
  if (scattered) grid.classList.add("scattered");

  function addTile(item, index) {
    var tile = document.createElement("button");
    tile.type = "button";
    var spanClass = pickSpanClass();
    tile.className = "gallery-tile" + (spanClass ? " " + spanClass : "");
    tile.setAttribute("aria-label", "Open photo " + (index + 1));

    if (scattered) {
      var rotate = (Math.random() * 12 - 6).toFixed(1);
      tile.style.setProperty("--r", rotate + "deg");
      tile.style.zIndex = String(Math.floor(Math.random() * 20) + 1);
    }

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
  }

  function showUpTo(count) {
    for (; shown < Math.min(count, images.length); shown++) {
      addTile(images[shown], shown);
    }
    if (moreWrap) moreWrap.hidden = shown >= images.length;
  }

  if (moreBtn) {
    moreBtn.addEventListener("click", function () {
      showUpTo(shown + 12);
    });
  }

  showUpTo(initialCount);
})();
