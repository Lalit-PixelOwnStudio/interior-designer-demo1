(function () {
  "use strict";

  var nav = document.getElementById("site-nav");
  var navToggle = document.getElementById("navToggle");
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var hero = document.getElementById("hero");
  var solidNav = document.body.hasAttribute("data-solid-nav");

  function updateNav() {
    // Pages without a dark hero (all inner pages) keep the solid nav.
    nav.classList.toggle("scrolled", solidNav || window.scrollY > 40);
    // The floating WhatsApp button appears once the visitor scrolls past
    // most of the hero (straight away on pages without one).
    var pastHero = hero ? window.scrollY > hero.offsetHeight * 0.6 : true;
    document.body.classList.toggle("show-quick-actions", pastHero);
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

  var navLinks = document.querySelector(".nav-links");

  function setMenu(open) {
    navToggle.setAttribute("aria-expanded", String(open));
    navToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    navLinks.classList.toggle("open", open);
    nav.classList.toggle("menu-open", open);
    document.body.classList.toggle("menu-open", open);
  }

  if (navToggle && navLinks) {
    navToggle.addEventListener("click", function () {
      setMenu(navToggle.getAttribute("aria-expanded") !== "true");
    });

    navLinks.addEventListener("click", function (e) {
      if (e.target.closest("a")) setMenu(false);
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && navLinks.classList.contains("open")) setMenu(false);
    });

    // tapping the dimmed page below the menu closes it
    document.addEventListener("click", function (e) {
      if (navLinks.classList.contains("open") && !nav.contains(e.target)) setMenu(false);
    });

    window.matchMedia("(min-width: 1024px)").addEventListener("change", function (e) {
      if (e.matches) setMenu(false);
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
  /* ===== About collage: light scroll parallax (sets --py from -1 to 1) ===== */
  var collage = document.querySelector(".about-collage");
  if (collage && !reduceMotion) {
    var collageTicking = false;
    var updateCollage = function () {
      collageTicking = false;
      var rect = collage.getBoundingClientRect();
      var vh = window.innerHeight;
      if (rect.bottom < 0 || rect.top > vh) return;
      var progress = (rect.top + rect.height / 2 - vh / 2) / (vh / 2 + rect.height / 2);
      collage.style.setProperty("--py", Math.max(-1, Math.min(1, progress)).toFixed(3));
    };
    window.addEventListener("scroll", function () {
      if (!collageTicking) {
        collageTicking = true;
        window.requestAnimationFrame(updateCollage);
      }
    }, { passive: true });
    updateCollage();
  }

  /* ===== Contact details from js/config.js ===== */
  var cfg = window.IC_CONFIG || {};
  var waBase = "https://wa.me/" + (cfg.whatsapp || "");

  function fill(selector, fn) {
    Array.prototype.forEach.call(document.querySelectorAll(selector), fn);
  }

  fill("[data-ic-tel]", function (el) { el.href = "tel:" + cfg.phone; });
  fill("[data-ic-wa]", function (el) {
    el.href = waBase + "?text=" + encodeURIComponent(cfg.whatsappGreeting || "");
    el.target = "_blank";
    el.rel = "noopener";
  });
  fill("[data-ic-mail]", function (el) { el.href = "mailto:" + cfg.email; });
  fill("[data-ic-text]", function (el) {
    var key = el.getAttribute("data-ic-text");
    if (cfg[key]) el.textContent = cfg[key];
  });
  fill("[data-ic-social]", function (el) {
    var url = cfg[el.getAttribute("data-ic-social")];
    if (url && url !== "#") {
      el.href = url;
      el.target = "_blank";
      el.rel = "noopener";
    }
  });

  var map = document.getElementById("contactMap");
  if (map && cfg.mapQuery) {
    map.setAttribute("data-src", "https://www.google.com/maps?q=" + encodeURIComponent(cfg.mapQuery) + "&output=embed");
    var loadMap = function () {
      if (!map.src) map.src = map.getAttribute("data-src");
    };
    // Start loading the map about two screens before it comes into view,
    // so it's ready when the visitor gets there without slowing the page.
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (entries, obs) {
        if (entries[0].isIntersecting) { loadMap(); obs.disconnect(); }
      }, { rootMargin: "1500px 0px" }).observe(map);
    } else if (document.readyState === "complete") {
      loadMap();
    } else {
      window.addEventListener("load", loadMap);
    }
  }

  var year = document.getElementById("footerYear");
  if (year) year.textContent = String(new Date().getFullYear());

  /* ===== Hero video: smaller file on phones, none on data-saver ===== */
  var video = document.querySelector(".hero-bg");
  if (video) {
    var saveData = navigator.connection && navigator.connection.saveData;
    var wide = window.matchMedia("(min-width: 768px)").matches;
    if (wide) video.poster = "img/hero/poster-1920.webp";
    if (!reduceMotion && !saveData) {
      var play = function () {
        var p = video.play();
        if (p && p.catch) p.catch(function () {});
      };
      // the poster shows first; the video starts once the page itself has
      // loaded, so text and images aren't waiting behind it
      var startVideo = function () {
        var webm = wide && video.canPlayType('video/webm; codecs="vp9"');
        video.src = wide ? (webm ? "img/hero/hero-1080.webm" : "img/hero/hero-1080.mp4") : "img/hero/hero-720.mp4";
        play();
        // no point decoding video nobody can see: pause it once the hero scrolls away
        if ("IntersectionObserver" in window) {
          new IntersectionObserver(function (entries) {
            if (entries[0].isIntersecting) play(); else video.pause();
          }).observe(video);
        }
      };
      if (document.readyState === "complete") startVideo();
      else window.addEventListener("load", startVideo);
    }
  }

  /* ===== Pause looping CSS animations (brand rows, seals) while off screen ===== */
  if ("IntersectionObserver" in window) {
    var loopObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { e.target.classList.toggle("is-off", !e.isIntersecting); });
    }, { rootMargin: "100px 0px" });
    document.querySelectorAll(".brand-rows, .guarantee-grid").forEach(function (el) { loopObserver.observe(el); });
  }

  /* ===== Contact form → WhatsApp message ===== */
  var form = document.getElementById("contactForm");
  if (form) {
    var status = document.getElementById("formStatus");

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!form.reportValidity()) return;

      var data = new FormData(form);
      var lines = [
        "Hi Interior Core, I'd like a consultation.",
        "",
        "Name: " + data.get("name"),
        "Phone: " + data.get("phone")
      ];
      if (data.get("location")) lines.push("Location: " + data.get("location"));
      if (data.get("property")) lines.push("Property: " + data.get("property"));
      if (data.get("budget")) lines.push("Budget: " + data.get("budget"));
      if (data.get("message")) lines.push("", String(data.get("message")));

      window.open(waBase + "?text=" + encodeURIComponent(lines.join("\n")), "_blank", "noopener");
      if (status) status.textContent = "Opening WhatsApp. Just press send and we'll reply shortly.";
      form.classList.add("sent");
    });
  }
})();
