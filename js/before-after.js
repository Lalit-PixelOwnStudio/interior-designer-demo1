/* Before / After slider: room pills, draggable handle (mouse, touch,
   keyboard), caption with arrows, and a one-time sweep to show it moves. */
(function () {
  "use strict";

  var ROOMS = (window.IC_DATA && window.IC_DATA.BA_ROOMS) || [];
  var frame = document.getElementById("baFrame");
  if (!frame || !ROOMS.length) return;

  var section = document.getElementById("before-after");
  var tabsEl = document.getElementById("baTabs");
  var beforeImg = document.getElementById("baBefore");
  var afterImg = document.getElementById("baAfter");
  var handle = document.getElementById("baHandle");
  var caption = document.getElementById("baCaption");
  var countEl = document.getElementById("baCount");
  var nameEl = document.getElementById("baRoomName");
  var descEl = document.getElementById("baRoomDesc");
  var tagsEl = document.getElementById("baRoomTags");
  var prevBtn = document.getElementById("baPrev");
  var nextBtn = document.getElementById("baNext");

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var current = 0;
  var pos = 50;
  var dragging = false;
  var sweepTimer = null;

  function pad(n) {
    return (n < 10 ? "0" : "") + n;
  }

  // Phones get the 720px image, wider frames / retina screens the 1280px one.
  function pick(img) {
    var needed = (frame.clientWidth || window.innerWidth) * (window.devicePixelRatio || 1);
    return needed > 760 ? img.large : img.small;
  }

  function setPosition(pct) {
    pos = Math.max(0, Math.min(100, pct));
    frame.style.setProperty("--pos", pos + "%");
    handle.setAttribute("aria-valuenow", String(Math.round(pos)));
  }

  /* ----- Room pills ----- */
  var tabs = ROOMS.map(function (room, i) {
    var tab = document.createElement("button");
    tab.type = "button";
    tab.className = "ba-tab";
    tab.setAttribute("role", "tab");
    tab.innerHTML = '<img src="' + (room.thumb || room.after.small) + '" alt="" width="40" height="40" loading="lazy" decoding="async">' + room.room;
    tab.addEventListener("click", function () { show(i); });
    tabsEl.appendChild(tab);
    return tab;
  });

  function fillCaption(room, i) {
    countEl.textContent = pad(i + 1) + " / " + pad(ROOMS.length);
    nameEl.textContent = room.room;
    descEl.textContent = room.desc;
    tagsEl.innerHTML = room.tags.map(function (t) {
      return '<span class="ba-tag">' + t + "</span>";
    }).join("");
  }

  function show(i, instant) {
    current = (i + ROOMS.length) % ROOMS.length;
    var room = ROOMS[current];

    tabs.forEach(function (tab, k) {
      var on = k === current;
      tab.setAttribute("aria-selected", String(on));
      if (on && !instant) tab.scrollIntoView({ block: "nearest", inline: "center", behavior: reduceMotion ? "auto" : "smooth" });
    });

    function apply() {
      beforeImg.src = pick(room.before);
      afterImg.src = pick(room.after);
      beforeImg.alt = room.room + " before";
      afterImg.alt = room.room + " after";
      fillCaption(room, current);
      setPosition(50);
    }

    if (instant || reduceMotion) {
      apply();
      return;
    }

    frame.classList.add("switching");
    caption.classList.add("switching");
    setTimeout(function () {
      apply();
      var done = function () {
        frame.classList.remove("switching");
        caption.classList.remove("switching");
      };
      if (afterImg.complete) done(); else afterImg.onload = done;
      setTimeout(done, 600);
    }, 220);
  }

  prevBtn.addEventListener("click", function () { show(current - 1); });
  nextBtn.addEventListener("click", function () { show(current + 1); });

  /* ----- Dragging (pointer events cover mouse, touch and pen) ----- */
  function pctFromX(clientX) {
    var rect = frame.getBoundingClientRect();
    return ((clientX - rect.left) / rect.width) * 100;
  }

  function stopSweep() {
    if (sweepTimer) {
      cancelAnimationFrame(sweepTimer);
      sweepTimer = null;
    }
  }

  frame.addEventListener("pointerdown", function (e) {
    if (e.button !== undefined && e.button !== 0) return;
    stopSweep();
    dragging = true;
    frame.classList.add("dragging", "touched");
    frame.setPointerCapture(e.pointerId);
    setPosition(pctFromX(e.clientX));
  });

  frame.addEventListener("pointermove", function (e) {
    if (dragging) setPosition(pctFromX(e.clientX));
  });

  function endDrag() {
    dragging = false;
    frame.classList.remove("dragging");
  }

  frame.addEventListener("pointerup", endDrag);
  frame.addEventListener("pointercancel", endDrag);

  /* ----- Keyboard on the handle ----- */
  handle.addEventListener("keydown", function (e) {
    var step = e.shiftKey ? 10 : 4;
    if (e.key === "ArrowLeft") setPosition(pos - step);
    else if (e.key === "ArrowRight") setPosition(pos + step);
    else if (e.key === "Home") setPosition(0);
    else if (e.key === "End") setPosition(100);
    else return;
    e.preventDefault();
    stopSweep();
    frame.classList.add("touched");
  });

  /* ----- One-time sweep when the slider first comes into view ----- */
  function sweep() {
    if (reduceMotion || frame.classList.contains("touched")) return;
    var start = null;
    var duration = 2200;
    function step(t) {
      if (start === null) start = t;
      var p = Math.min((t - start) / duration, 1);
      // 50 -> 25 -> 75 -> 50
      setPosition(50 + Math.sin(p * Math.PI * 2) * -25);
      if (p < 1) sweepTimer = requestAnimationFrame(step);
      else sweepTimer = null;
    }
    sweepTimer = requestAnimationFrame(step);
  }

  if ("IntersectionObserver" in window) {
    var seen = new IntersectionObserver(function (entries, obs) {
      if (entries[0].isIntersecting) {
        obs.disconnect();
        setTimeout(sweep, 400);
      }
    }, { threshold: 0.5 });
    seen.observe(frame);
  }

  /* ----- Keyboard arrows switch rooms while the section is on screen ----- */
  var inView = false;
  if ("IntersectionObserver" in window && section) {
    new IntersectionObserver(function (entries) {
      inView = entries[0].isIntersecting;
    }, { threshold: 0.3 }).observe(section);
  }

  document.addEventListener("keydown", function (e) {
    if (!inView || document.body.classList.contains("lightbox-open")) return;
    if (document.activeElement === handle) return;
    var tag = document.activeElement && document.activeElement.tagName;
    if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
    if (e.key === "ArrowLeft") show(current - 1);
    if (e.key === "ArrowRight") show(current + 1);
  });

  show(0, true);
})();
