/* Logo intro and page transitions.
   - The intro (shown once per visit, set up by the inline script in <head>)
     plays by itself in CSS; a tap skips it and it is removed when done.
   - Browsers with cross-page view transitions get a native cross-fade
     (css @view-transition). Others fade the page out here before leaving. */
(function () {
  "use strict";

  var root = document.documentElement;

  /* ----- Intro ----- */
  var intro = document.getElementById("intro");
  if (intro) {
    if (!root.classList.contains("ic-intro")) {
      intro.parentNode.removeChild(intro);
    } else {
      var finish = function () {
        root.classList.remove("ic-intro");
        if (intro.parentNode) intro.parentNode.removeChild(intro);
      };
      intro.addEventListener("animationend", function (e) {
        if (e.target === intro) finish();
      });
      intro.addEventListener("click", function () { intro.classList.add("skip"); });
      setTimeout(finish, 4000); // safety net
    }
  }

  /* ----- Page transitions (fallback for browsers without view transitions) ----- */
  if (!root.classList.contains("no-vt")) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  document.addEventListener("click", function (e) {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    var a = e.target.closest && e.target.closest("a[href]");
    if (!a || a.target === "_blank" || a.hasAttribute("download")) return;
    var url = new URL(a.href, location.href);
    if (url.origin !== location.origin) return;
    // links within this page (only the #hash differs) just scroll
    if (url.pathname === location.pathname && url.search === location.search) return;
    e.preventDefault();
    root.classList.add("page-leave");
    setTimeout(function () { location.href = url.href; }, 260);
  });

  // coming back with the browser's back button restores the faded page
  window.addEventListener("pageshow", function (e) {
    if (e.persisted) root.classList.remove("page-leave");
  });
})();
