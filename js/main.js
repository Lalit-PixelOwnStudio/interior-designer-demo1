(function () {
  "use strict";

  var nav = document.getElementById("site-nav");
  var navToggle = document.getElementById("navToggle");
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function updateNav() {
    if (window.scrollY > 40) {
      nav.classList.add("scrolled");
    } else {
      nav.classList.remove("scrolled");
    }
  }

  var ticking = false;
  function onScroll() {
    if (!ticking) {
      window.requestAnimationFrame(function () {
        updateNav();
        ticking = false;
      });
      ticking = true;
    }
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  updateNav();

  if (navToggle) {
    navToggle.addEventListener("click", function () {
      var expanded = navToggle.getAttribute("aria-expanded") === "true";
      navToggle.setAttribute("aria-expanded", String(!expanded));
      document.querySelector(".nav-links").classList.toggle("open");
    });
  }

  function easeOutExpo(t) {
    return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
  }

  function animateCount(el) {
    var target = parseInt(el.getAttribute("data-target"), 10) || 0;
    var suffix = el.getAttribute("data-suffix") || "";

    if (reduceMotion) {
      el.textContent = target + suffix;
      return;
    }

    var duration = 1800;
    var start = null;

    function step(timestamp) {
      if (start === null) start = timestamp;
      var progress = Math.min((timestamp - start) / duration, 1);
      var value = Math.round(easeOutExpo(progress) * target);
      el.textContent = value + suffix;
      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        el.textContent = target + suffix;
      }
    }

    window.requestAnimationFrame(step);
  }

  var statsGrid = document.querySelector(".stats-grid");
  if (statsGrid) {
    if (reduceMotion || !("IntersectionObserver" in window)) {
      statsGrid.classList.add("in-view");
    } else {
      var gridObserver = new IntersectionObserver(
        function (entries, obs) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              statsGrid.classList.add("in-view");
              obs.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.2 }
      );
      gridObserver.observe(statsGrid);
    }
  }

  var revealGroups = document.querySelectorAll(".reveal-group");
  if (revealGroups.length) {
    if (reduceMotion || !("IntersectionObserver" in window)) {
      revealGroups.forEach(function (el) {
        el.classList.add("in-view");
      });
    } else {
      var revealObserver = new IntersectionObserver(
        function (entries, obs) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add("in-view");
              obs.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.2 }
      );
      revealGroups.forEach(function (el) {
        revealObserver.observe(el);
      });
    }
  }

  var statNumbers = document.querySelectorAll(".stat-number");
  if (statNumbers.length && "IntersectionObserver" in window) {
    var statObserver = new IntersectionObserver(
      function (entries, obs) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            animateCount(entry.target);
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.4 }
    );
    statNumbers.forEach(function (el) {
      statObserver.observe(el);
    });
  } else {
    statNumbers.forEach(function (el) {
      var target = parseInt(el.getAttribute("data-target"), 10) || 0;
      el.textContent = target + (el.getAttribute("data-suffix") || "");
    });
  }
})();
