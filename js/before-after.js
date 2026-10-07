(function () {
  "use strict";

  var PAIRS = [
    {
      room: "Bedroom",
      before: "Assets/Before-After Section/before 1.png",
      after: "Assets/Before-After Section/after 1.jpeg",
      desc: "From a bare, functional room to a warm, layered retreat with mirrored accents and ambient lighting.",
      tags: ["Custom Lighting", "Mirror Panelling", "Upholstered Headboard"]
    },
    {
      room: "Kitchen",
      before: "Assets/Before-After Section/before 2.png",
      after: "Assets/Before-After Section/After 2.jpeg",
      desc: "A dated, closed-off kitchen reimagined as a bright, marble-clad space built for both cooking and entertaining.",
      tags: ["Marble Countertops", "Open Layout", "Ambient Task Lighting"]
    },
    {
      room: "Living Room",
      before: "Assets/Before-After Section/before 3.png",
      after: "Assets/Before-After Section/after 3.jpeg",
      desc: "Tired shelving gives way to a considered media wall with sculptural lighting and natural wood tones.",
      tags: ["Media Wall", "Sculptural Lighting", "Natural Wood Tones"]
    },
    {
      room: "Dining Room",
      before: "Assets/Before-After Section/before 4.png",
      after: "Assets/Before-After Section/after 4.jpeg",
      desc: "An ordinary dining corner becomes a sculpted, mirror-panelled space that feels like a private restaurant.",
      tags: ["Mirror Panelling", "Statement Seating", "Ambient Lighting"]
    },
    {
      room: "Bathroom",
      before: "Assets/Before-After Section/before 5.png",
      after: "Assets/Before-After Section/after 5.jpeg",
      desc: "A worn, dim bathroom transformed into a spa-like retreat with warm brass fixtures and backlit mirror.",
      tags: ["Brass Fixtures", "Backlit Mirror", "Spa-Inspired Finishes"]
    }
  ];

  var frame = document.getElementById("baFrame");
  if (!frame) return;

  var beforeImg = document.getElementById("baBefore");
  var afterImg = document.getElementById("baAfter");
  var handle = document.getElementById("baHandle");
  var prevBtn = document.getElementById("baPrev");
  var nextBtn = document.getElementById("baNext");
  var dotsWrap = document.getElementById("baDots");
  var roomNameEl = document.getElementById("baRoomName");
  var roomDescEl = document.getElementById("baRoomDesc");
  var roomTagsEl = document.getElementById("baRoomTags");
  var sliderWrap = document.querySelector(".ba-slider-wrap");
  var errorEl = document.getElementById("baFrameError");

  var failedSrcs = [];
  function resetLoadErrors() {
    failedSrcs = [];
    errorEl.textContent = "";
    errorEl.classList.remove("visible");
  }
  function showLoadError(label, img) {
    failedSrcs.push(label + ": " + img.src);
    errorEl.textContent = "Image failed to load —\n" + failedSrcs.join("\n");
    errorEl.classList.add("visible");
  }
  beforeImg.addEventListener("error", function () { showLoadError("before", beforeImg); });
  afterImg.addEventListener("error", function () { showLoadError("after", afterImg); });

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var currentIndex = 0;
  var isDragging = false;
  var sectionInView = false;

  PAIRS.forEach(function (pair, i) {
    var dot = document.createElement("button");
    dot.className = "ba-dot" + (i === 0 ? " active" : "");
    dot.setAttribute("aria-label", "Show " + pair.room);
    dot.addEventListener("click", function () {
      goToRoom(i);
    });
    dotsWrap.appendChild(dot);
  });

  function setPosition(pct) {
    pct = Math.max(0, Math.min(100, pct));
    frame.style.setProperty("--pos", pct + "%");
    handle.style.left = pct + "%";
  }

  function pctFromClientX(clientX) {
    var rect = frame.getBoundingClientRect();
    return ((clientX - rect.left) / rect.width) * 100;
  }

  function renderRoom(index, animate) {
    var pair = PAIRS[index];

    function applyContent() {
      resetLoadErrors();
      beforeImg.src = pair.before;
      beforeImg.alt = pair.room + " before";
      afterImg.src = pair.after;
      afterImg.alt = pair.room + " after";
      setPosition(50);
      roomNameEl.textContent = pair.room;
      roomDescEl.textContent = pair.desc;
      roomTagsEl.innerHTML = pair.tags
        .map(function (t) { return '<span class="ba-tag">' + t + "</span>"; })
        .join('<span class="ba-tag-dot">&middot;</span>');
    }

    Array.prototype.forEach.call(dotsWrap.children, function (dot, i) {
      dot.classList.toggle("active", i === index);
    });

    if (animate && !reduceMotion) {
      sliderWrap.classList.add("switching");
      document.getElementById("baCaption").classList.add("switching");
      setTimeout(function () {
        applyContent();
        sliderWrap.classList.remove("switching");
        document.getElementById("baCaption").classList.remove("switching");
      }, 250);
    } else {
      applyContent();
    }
  }

  function goToRoom(index) {
    currentIndex = (index + PAIRS.length) % PAIRS.length;
    renderRoom(currentIndex, true);
  }

  prevBtn.addEventListener("click", function () {
    goToRoom(currentIndex - 1);
  });

  nextBtn.addEventListener("click", function () {
    goToRoom(currentIndex + 1);
  });

  function startDrag(clientX) {
    isDragging = true;
    setPosition(pctFromClientX(clientX));
  }

  function moveDrag(clientX) {
    if (!isDragging) return;
    setPosition(pctFromClientX(clientX));
  }

  function endDrag() {
    isDragging = false;
  }

  frame.addEventListener("pointerdown", function (e) {
    frame.setPointerCapture(e.pointerId);
    startDrag(e.clientX);
  });

  frame.addEventListener("pointermove", function (e) {
    moveDrag(e.clientX);
  });

  frame.addEventListener("pointerup", endDrag);
  frame.addEventListener("pointercancel", endDrag);

  if ("IntersectionObserver" in window) {
    var sectionObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          sectionInView = entry.isIntersecting;
        });
      },
      { threshold: 0.2 }
    );
    sectionObserver.observe(document.getElementById("before-after"));
  }

  document.addEventListener("keydown", function (e) {
    if (!sectionInView) return;
    if (e.key === "ArrowLeft") goToRoom(currentIndex - 1);
    if (e.key === "ArrowRight") goToRoom(currentIndex + 1);
  });

  renderRoom(0, false);
})();
