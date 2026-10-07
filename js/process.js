/* Process: five interactive steps.
   Desktop — step tabs on a line that fills in gold, the active step's
   details (photo, checklist, what you get) shown below; it auto-advances
   every few seconds while on screen until someone clicks or hovers.
   Phones — a vertical timeline driven by scrolling: as you scroll down,
   each step's content slides out and the gold line moves on to it.
   Arrow keys move between steps. */
(function () {
  "use strict";

  var flow = document.getElementById("processFlow");
  if (!flow) return;

  var items = Array.prototype.slice.call(flow.querySelectorAll(".process-item"));
  var tabs = items.map(function (item) { return item.querySelector(".process-tab"); });
  var fill = flow.querySelector(".process-line-fill");
  var phone = window.matchMedia("(max-width: 900px)");
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var STEP_MS = 5000;
  var current = 0;
  var timer = null;
  var inView = false;
  var stopped = reduceMotion; // a click/tap stops autoplay for good
  var hovering = false;

  function updateLine() {
    if (phone.matches) {
      // vertical: fill from the first step's number to the active one
      var first = items[0].querySelector(".process-num");
      var active = items[current].querySelector(".process-num");
      var h = active.getBoundingClientRect().top - first.getBoundingClientRect().top;
      fill.style.height = Math.max(0, h) + "px";
      fill.style.width = "";
    } else {
      fill.style.width = (current / (items.length - 1)) * 100 + "%";
      fill.style.height = "";
    }
  }

  function setActive(i, focus) {
    current = (i + items.length) % items.length;
    items.forEach(function (item, k) {
      var on = k === current;
      item.classList.toggle("active", on);
      item.classList.toggle("done", k < current);
      tabs[k].setAttribute("aria-selected", String(on));
      tabs[k].tabIndex = on ? 0 : -1;
    });
    if (focus) tabs[current].focus();
    updateLine();
    if (!phone.matches) restartRing();
  }

  /* ----- Phones: scrolling moves the active step and reveals content ----- */
  var scrollTick = false;

  function onScroll() {
    scrollTick = false;
    if (!phone.matches) return;
    var vh = window.innerHeight;
    var active = 0;
    items.forEach(function (item, i) {
      var top = item.getBoundingClientRect().top;
      if (top < vh * 0.82) item.classList.add("shown");
      if (top < vh * 0.45) active = i;
    });
    if (active !== current) setActive(active);
    else updateLine();
  }

  window.addEventListener("scroll", function () {
    if (!scrollTick) {
      scrollTick = true;
      requestAnimationFrame(onScroll);
    }
  }, { passive: true });

  /* ----- Autoplay (desktop only) ----- */
  function restartRing() {
    flow.classList.remove("ticking");
    void flow.offsetWidth; // restart the CSS ring animation
    if (canPlay()) flow.classList.add("ticking");
  }

  function canPlay() {
    return !stopped && inView && !phone.matches;
  }

  function schedule() {
    clearTimeout(timer);
    if (canPlay() && !hovering) {
      timer = setTimeout(function () {
        setActive(current + 1);
        schedule();
      }, STEP_MS);
    }
  }

  function stopAutoplay() {
    stopped = true;
    clearTimeout(timer);
    flow.classList.remove("ticking", "paused");
  }

  flow.addEventListener("mouseenter", function () {
    hovering = true;
    clearTimeout(timer);
    flow.classList.add("paused");
  });

  flow.addEventListener("mouseleave", function () {
    hovering = false;
    flow.classList.remove("paused");
    if (canPlay()) {
      restartRing();
      schedule();
    }
  });

  /* ----- Clicks and keys ----- */
  tabs.forEach(function (tab, i) {
    tab.addEventListener("click", function () {
      stopAutoplay();
      if (phone.matches) {
        // bring the step to the reading line; scrolling makes it active
        var y = items[i].getBoundingClientRect().top + window.scrollY - window.innerHeight * 0.3;
        window.scrollTo({ top: y, behavior: reduceMotion ? "auto" : "smooth" });
        items[i].classList.add("shown");
        setActive(i);
      } else {
        setActive(i);
      }
    });

    tab.addEventListener("keydown", function (e) {
      var next = null;
      if (e.key === "ArrowRight" || e.key === "ArrowDown") next = i + 1;
      else if (e.key === "ArrowLeft" || e.key === "ArrowUp") next = i - 1;
      else if (e.key === "Home") next = 0;
      else if (e.key === "End") next = items.length - 1;
      if (next === null) return;
      e.preventDefault();
      stopAutoplay();
      setActive(next, true);
    });
  });

  /* ----- Entrance animation + autoplay only while on screen ----- */
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (entries) {
      inView = entries[0].isIntersecting;
      if (inView) flow.classList.add("in-view");
      if (inView) {
        restartRing();
        schedule();
      } else {
        clearTimeout(timer);
        flow.classList.remove("ticking");
      }
    }, { threshold: 0, rootMargin: "0px 0px -25% 0px" }).observe(flow);
  } else {
    flow.classList.add("in-view");
  }

  phone.addEventListener("change", function () {
    updateLine();
    restartRing();
    schedule();
    onScroll();
  });
  window.addEventListener("resize", updateLine);

  setActive(0);
  onScroll();
})();
