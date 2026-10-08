/* 404 page: the big "404" is cut out of a project photo, which drifts
   gently as the pointer (or the phone) moves. */
(function () {
  "use strict";

  var code = document.getElementById("nfCode");
  if (!code) return;

  var photos = [
    "img/projects/project-1/01-1280.webp",
    "img/projects/project-3/02-1280.webp",
    "img/projects/project-5/01-1280.webp",
    "img/projects/project-2/09-1280.webp",
    "img/projects/project-6/02-1280.webp"
  ];
  code.style.backgroundImage = "url(" + photos[Math.floor(Math.random() * photos.length)] + ")";

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  function move(x, y) {
    // x, y from -1 to 1
    code.style.setProperty("--px", (50 + x * 18) + "%");
    code.style.setProperty("--py", (50 + y * 18) + "%");
    code.style.setProperty("--rx", (-y * 6) + "deg");
    code.style.setProperty("--ry", (x * 8) + "deg");
  }

  window.addEventListener("mousemove", function (e) {
    move(e.clientX / innerWidth * 2 - 1, e.clientY / innerHeight * 2 - 1);
  });

  window.addEventListener("deviceorientation", function (e) {
    if (e.gamma === null) return;
    move(Math.max(-1, Math.min(1, e.gamma / 30)), Math.max(-1, Math.min(1, (e.beta - 45) / 30)));
  });
})();
