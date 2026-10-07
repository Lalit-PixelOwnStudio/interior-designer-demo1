/* FAQ: answers slide open and closed smoothly (native <details> just
   snaps), and opening one question closes the one that was open. */
(function () {
  "use strict";

  var list = document.getElementById("faqList");
  if (!list) return;

  var items = Array.prototype.slice.call(list.querySelectorAll(".faq-item"));
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var DURATION = 380;
  var EASE = "cubic-bezier(0.22, 1, 0.36, 1)";

  function animateHeight(el, from, to, done) {
    if (reduceMotion || !el.animate) { done(); return; }
    if (el._anim) el._anim.cancel();
    el.style.overflow = "hidden";
    el._anim = el.animate(
      [{ height: from + "px", opacity: from ? 1 : 0 }, { height: to + "px", opacity: to ? 1 : 0 }],
      { duration: DURATION, easing: EASE }
    );
    el._anim.onfinish = function () {
      el._anim = null;
      el.style.overflow = "";
      done();
    };
  }

  function open(item) {
    var answer = item.querySelector(".faq-answer");
    item.open = true;
    item.classList.add("is-open");
    animateHeight(answer, 0, answer.scrollHeight, function () {});
  }

  function close(item) {
    var answer = item.querySelector(".faq-answer");
    item.classList.remove("is-open");
    animateHeight(answer, answer.offsetHeight, 0, function () {
      item.open = false;
    });
  }

  items.forEach(function (item) {
    var summary = item.querySelector("summary");
    summary.addEventListener("click", function (e) {
      e.preventDefault();
      if (item.classList.contains("is-open")) {
        close(item);
      } else {
        items.forEach(function (other) {
          if (other !== item && other.classList.contains("is-open")) close(other);
        });
        open(item);
      }
    });
  });

  // questions slide in one by one when the list first shows
  if ("IntersectionObserver" in window && !reduceMotion) {
    list.classList.add("faq-animate");
    new IntersectionObserver(function (entries, obs) {
      if (entries[0].isIntersecting) {
        list.classList.add("in-view");
        obs.disconnect();
      }
    }, { threshold: 0, rootMargin: "0px 0px -20% 0px" }).observe(list);
  }
})();
