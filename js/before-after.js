(function () {
  "use strict";

  var PAIRS = (window.IC_DATA && window.IC_DATA.BA_ROOMS) || [];
  if (!PAIRS.length) return;

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

  // Phones get the 720px image, wider frames / retina screens the 1280px one.
  function pick(img) {
    var needed = (frame.clientWidth || window.innerWidth) * (window.devicePixelRatio || 1);
    return needed > 760 ? img.large : img.small;
  }

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
      beforeImg.src = pick(pair.before);
      beforeImg.alt = pair.room + " before";
      afterImg.src = pick(pair.after);
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
