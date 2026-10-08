/* Stock photos (Pexels / Unsplash) come from other sites. If one fails to
   load, tidy up instead of showing a broken image:
     data-fallback="remove"         remove the image (an icon shows below it)
     data-fallback="remove-parent"  remove the image's wrapper
     data-fallback="no-photo"       remove it and mark the wrapper .no-photo */
(function () {
  "use strict";

  function fallBack(img) {
    var mode = img.getAttribute("data-fallback");
    var parent = img.parentNode;
    if (!parent) return;
    if (mode === "remove-parent") { parent.parentNode && parent.parentNode.removeChild(parent); return; }
    if (mode === "no-photo") parent.classList.add("no-photo");
    parent.removeChild(img);
  }

  // images that already failed before this script ran
  document.querySelectorAll("img[data-fallback]").forEach(function (img) {
    if (img.complete && !img.naturalWidth && img.currentSrc) fallBack(img);
  });

  // and any that fail later (lazy images)
  document.addEventListener("error", function (e) {
    var img = e.target;
    if (img && img.tagName === "IMG" && img.hasAttribute("data-fallback")) fallBack(img);
  }, true);
})();
