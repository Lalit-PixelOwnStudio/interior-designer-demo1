/* Loaded in <head>, before the page paints (not part of site.min.js):
   - shows the logo intro once per visit (skipped for reduced motion)
   - marks browsers without cross-page view transitions ("no-vt") so
     js/core/transitions.js can use its fade fallback */
(function (root) {
  try {
    if (!("onpagereveal" in window)) root.classList.add("no-vt");
    if (!sessionStorage.getItem("icIntro") && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
      root.classList.add("ic-intro");
      sessionStorage.setItem("icIntro", "1");
    }
  } catch (e) { /* storage blocked: no intro */ }
})(document.documentElement);
