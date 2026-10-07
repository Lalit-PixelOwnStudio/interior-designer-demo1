/* About page: stats count up, and the journey timeline's gold line fills
   as you scroll while each milestone slides in. */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ----- Stats count-up ----- */
  var stats = document.getElementById("aboutStats");
  if (stats) {
    var nums = stats.querySelectorAll("[data-count]");
    var run = function () {
      nums.forEach(function (el) {
        var to = parseFloat(el.getAttribute("data-to")) || 0;
        if (reduceMotion) { el.textContent = to; return; }
        var start = null;
        var step = function (t) {
          if (start === null) start = t;
          var p = Math.min((t - start) / 1600, 1);
          el.textContent = Math.round((1 - Math.pow(1 - p, 3)) * to);
          if (p < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      });
    };
    if (!reduceMotion) nums.forEach(function (el) { el.textContent = "0"; });
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (entries, obs) {
        if (entries[0].isIntersecting) { run(); obs.disconnect(); }
      }, { threshold: 0.4 }).observe(stats);
    } else {
      run();
    }
  }

  /* ----- Journey timeline ----- */
  var wrap = document.getElementById("journeyWrap");
  var fill = document.getElementById("journeyFill");
  if (!wrap || !fill) return;

  var items = Array.prototype.slice.call(wrap.querySelectorAll(".journey-item"));
  var ticking = false;

  function update() {
    ticking = false;
    var vh = window.innerHeight;
    var rect = wrap.getBoundingClientRect();
    // line fills up to the point 60% down the screen
    var progress = (vh * 0.6 - rect.top) / rect.height;
    fill.style.height = Math.max(0, Math.min(1, progress)) * 100 + "%";
    items.forEach(function (item) {
      var top = item.getBoundingClientRect().top;
      if (top < vh * 0.85) item.classList.add("shown");
      item.classList.toggle("reached", top < vh * 0.6);
    });
  }

  window.addEventListener("scroll", function () {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(update);
    }
  }, { passive: true });
  window.addEventListener("resize", update);
  update();
})();
