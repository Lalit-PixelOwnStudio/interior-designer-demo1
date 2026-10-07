/* Google-style review cards.
   Desktop: the cards glide past in an endless row (pauses on hover).
   Phones: a swipeable row. Long reviews get a "Read more" toggle. */
(function () {
  "use strict";

  var marquee = document.getElementById("reviewsMarquee");
  var track = document.getElementById("reviewsTrack");
  if (!marquee || !track) return;

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var desktop = window.matchMedia("(min-width: 769px)");
  var originals = Array.prototype.slice.call(track.children);

  /* ----- Read more ----- */
  function setupReadMore(card) {
    var text = card.querySelector(".g-text");
    var btn = card.querySelector(".g-more");
    if (!text || !btn) return;
    btn.hidden = text.scrollHeight <= text.clientHeight + 2;
    btn.onclick = function () {
      var open = card.classList.toggle("expanded");
      btn.textContent = open ? "Show less" : "Read more";
      marquee.classList.toggle("held", open);
    };
  }

  function refreshReadMore() {
    Array.prototype.forEach.call(track.children, function (card) {
      if (!card.classList.contains("expanded")) setupReadMore(card);
    });
  }

  /* ----- Endless row on desktop: repeat the cards once so the loop is seamless ----- */
  var clones = [];

  function enableLoop() {
    if (clones.length || reduceMotion) return;
    originals.forEach(function (card) {
      var copy = card.cloneNode(true);
      copy.setAttribute("aria-hidden", "true");
      copy.querySelectorAll("button").forEach(function (b) { b.tabIndex = -1; });
      track.appendChild(copy);
      clones.push(copy);
    });
    // keep the speed steady whatever the card count (about 40px per second)
    var distance = track.scrollWidth / 2;
    track.style.setProperty("--marquee-time", Math.max(20, distance / 40) + "s");
    marquee.classList.add("looping");
    refreshReadMore();
  }

  function disableLoop() {
    clones.forEach(function (c) { c.remove(); });
    clones = [];
    marquee.classList.remove("looping");
  }

  function update() {
    if (desktop.matches) enableLoop();
    else disableLoop();
    refreshReadMore();
  }

  desktop.addEventListener("change", update);
  window.addEventListener("load", refreshReadMore);
  update();
})();
