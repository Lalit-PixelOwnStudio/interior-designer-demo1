/* Pricing: interactive packages.
   - "I have a…" picker highlights the matching package
   - Prices count up when the section comes into view
   - Desktop: cards tilt toward the cursor with a soft gold glow
   - Phones: swipeable cards with dots, starting on the featured one
   - "Get a Quote" fills the contact form with that package */
(function () {
  "use strict";

  var track = document.getElementById("pricingTrack");
  if (!track) return;

  var cards = Array.prototype.slice.call(track.querySelectorAll(".price-card"));
  var picks = Array.prototype.slice.call(document.querySelectorAll(".price-picker [data-pick]"));
  var dotsEl = document.getElementById("priceDots");
  var phone = window.matchMedia("(max-width: 768px)");
  var canHover = window.matchMedia("(hover: hover)").matches;
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ----- Picker ----- */
  function scrollToCard(i, smooth) {
    if (!phone.matches) return;
    var card = cards[i];
    track.scrollTo({
      left: card.offsetLeft - (track.clientWidth - card.offsetWidth) / 2,
      behavior: smooth && !reduceMotion ? "smooth" : "auto"
    });
  }

  function pick(i, fromUser) {
    picks.forEach(function (b, k) { b.setAttribute("aria-checked", String(k === i)); });
    cards.forEach(function (c, k) {
      c.classList.toggle("picked", k === i);
      c.classList.toggle("dimmed", fromUser && k !== i);
    });
    if (fromUser) scrollToCard(i, true);
  }

  picks.forEach(function (b, i) {
    b.addEventListener("click", function () { pick(i, true); });
    b.addEventListener("keydown", function (e) {
      var next = null;
      if (e.key === "ArrowRight" || e.key === "ArrowDown") next = (i + 1) % picks.length;
      if (e.key === "ArrowLeft" || e.key === "ArrowUp") next = (i - 1 + picks.length) % picks.length;
      if (next === null) return;
      e.preventDefault();
      picks[next].focus();
      pick(next, true);
    });
  });

  /* ----- Count-up prices ----- */
  function countUp() {
    track.querySelectorAll(".price-num").forEach(function (el) {
      var to = parseFloat(el.getAttribute("data-to")) || 0;
      if (reduceMotion) { el.textContent = to; return; }
      var start = null;
      var dur = 1400;
      function step(t) {
        if (start === null) start = t;
        var p = Math.min((t - start) / dur, 1);
        var eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(eased * to);
        if (p < 1) requestAnimationFrame(step);
      }
      el.textContent = "0";
      requestAnimationFrame(step);
    });
  }

  // start from zero so the count-up doesn't flash the final number first
  if (!reduceMotion) {
    track.querySelectorAll(".price-num").forEach(function (el) { el.textContent = "0"; });
  }

  var section = document.getElementById("pricing");
  if ("IntersectionObserver" in window && section) {
    var counted = false;
    new IntersectionObserver(function (entries, obs) {
      if (entries[0].isIntersecting && !counted) {
        counted = true;
        section.classList.add("in-view");
        countUp();
        obs.disconnect();
      }
    }, { threshold: 0, rootMargin: "0px 0px -30% 0px" }).observe(section);
  } else if (section) {
    section.classList.add("in-view");
  }

  /* ----- Tilt + glow on desktop ----- */
  if (canHover && !reduceMotion) {
    cards.forEach(function (card) {
      card.addEventListener("mousemove", function (e) {
        var r = card.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width;
        var y = (e.clientY - r.top) / r.height;
        card.style.setProperty("--mx", x * 100 + "%");
        card.style.setProperty("--my", y * 100 + "%");
        card.style.setProperty("--rx", ((0.5 - y) * 8).toFixed(2) + "deg");
        card.style.setProperty("--ry", ((x - 0.5) * 10).toFixed(2) + "deg");
      });
      card.addEventListener("mouseleave", function () {
        card.style.setProperty("--rx", "0deg");
        card.style.setProperty("--ry", "0deg");
      });
    });
  }

  /* ----- Phone dots ----- */
  var dots = cards.map(function (c, i) {
    var d = document.createElement("span");
    d.addEventListener("click", function () { scrollToCard(i, true); });
    dotsEl.appendChild(d);
    return d;
  });

  function activeOnPhone() {
    var mid = track.scrollLeft + track.clientWidth / 2;
    var best = 0;
    var bestDist = Infinity;
    cards.forEach(function (c, i) {
      var dist = Math.abs(c.offsetLeft + c.offsetWidth / 2 - mid);
      if (dist < bestDist) { bestDist = dist; best = i; }
    });
    return best;
  }

  var tick = false;
  track.addEventListener("scroll", function () {
    if (tick) return;
    tick = true;
    requestAnimationFrame(function () {
      tick = false;
      var i = activeOnPhone();
      dots.forEach(function (d, k) { d.classList.toggle("active", k === i); });
    });
  }, { passive: true });

  /* ----- Get a Quote fills the contact form ----- */
  cards.forEach(function (card) {
    var btn = card.querySelector(".price-btn");
    if (!btn) return;
    btn.addEventListener("click", function () {
      var prop = document.getElementById("cfProperty");
      var budget = document.getElementById("cfBudget");
      var msg = document.getElementById("cfMessage");
      if (prop && card.dataset.property) prop.value = card.dataset.property;
      if (budget && card.dataset.budget) budget.value = card.dataset.budget;
      if (msg && !msg.value) msg.value = "I'm interested in the " + card.dataset.name + " package.";
      var name = document.getElementById("cfName");
      if (name) setTimeout(function () { name.focus({ preventScroll: true }); }, 700);
    });
  });

  pick(1, false);
  // phones start on the featured card
  window.addEventListener("load", function () {
    scrollToCard(1, false);
    dots.forEach(function (d, k) { d.classList.toggle("active", k === 1); });
  });
})();
