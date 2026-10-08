/* Style quiz (projects.html#style-quiz): five picture questions, each
   option leaning Modern, Classic or Minimal. The result shows the style,
   how the answers split, and the projects that match it. */
(function () {
  "use strict";

  var quiz = document.getElementById("quiz");
  if (!quiz) return;

  function photo(p, n) { return "img/projects/project-" + p + "/" + n + "-640.webp"; }
  function swatch(id) { return "img/materials/" + id + ".webp"; }

  var QUESTIONS = [
    {
      q: "Pick the living room you'd love to come home to",
      options: [
        { style: "modern", label: "Sleek & statement", img: photo(6, "07") },
        { style: "classic", label: "Warm & grand", img: photo(8, "03") },
        { style: "minimal", label: "Light & airy", img: photo(2, "02") }
      ]
    },
    {
      q: "Which colour palette feels most like you?",
      options: [
        { style: "modern", label: "Charcoal & Brass", colors: ["#2b2b2b", "#6d6d6d", "#c9a24a", "#efebe4"] },
        { style: "classic", label: "Ivory & Gold", colors: ["#f3ead8", "#c9a24a", "#7a4b2a", "#2f4a3a"] },
        { style: "minimal", label: "Oak & Sage", colors: ["#faf7f1", "#e6dccb", "#c7a77e", "#9aa58f"] }
      ]
    },
    {
      q: "Choose a bedroom to wake up in",
      options: [
        { style: "modern", label: "Backlit & bold", img: photo(6, "01") },
        { style: "classic", label: "Plush & elegant", img: photo(5, "05") },
        { style: "minimal", label: "Soft & simple", img: photo(7, "02") }
      ]
    },
    {
      q: "Which material would you want to touch every day?",
      options: [
        { style: "modern", label: "Black marble", img: swatch("marble-nero-marquina") },
        { style: "classic", label: "Burma teak", img: swatch("veneer-burma-teak") },
        { style: "minimal", label: "Natural oak", img: swatch("veneer-natural-oak") }
      ]
    },
    {
      q: "Pick a statement piece",
      options: [
        { style: "modern", label: "Sculptural lighting", img: photo(4, "01") },
        { style: "classic", label: "A carved pooja unit", img: photo(5, "01") },
        { style: "minimal", label: "A clean, quiet corner", img: photo(4, "04") }
      ]
    }
  ];

  var STYLES = {
    modern: {
      name: "Modern Bold",
      desc: "You love clean lines with a bit of drama: deep tones, statement lighting and surfaces with a sheen. Homes that feel sharp and confident.",
      palette: ["#2b2b2b", "#6d6d6d", "#c9a24a", "#efebe4"],
      projects: ["project-6", "project-1", "project-3"]
    },
    classic: {
      name: "Classic Luxe",
      desc: "You're drawn to warmth and grandeur: rich woods, marble, gold accents and crystal light. Homes that feel timeless and welcoming.",
      palette: ["#f3ead8", "#c9a24a", "#7a4b2a", "#2f4a3a"],
      projects: ["project-5", "project-2", "project-1"]
    },
    minimal: {
      name: "Calm Minimal",
      desc: "You value calm and space: light woods, soft neutrals and nothing that doesn't need to be there. Homes that feel light and easy to live in.",
      palette: ["#faf7f1", "#e6dccb", "#c7a77e", "#9aa58f"],
      projects: ["project-7", "project-4", "project-3"]
    }
  };
  var ORDER = ["modern", "classic", "minimal"];

  var PROJECTS = {};
  ((window.IC_DATA && window.IC_DATA.PROJECTS) || []).forEach(function (p) { PROJECTS[p.id] = p; });
  var cfg = window.IC_CONFIG || {};
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var screens = {};
  quiz.querySelectorAll(".quiz-screen").forEach(function (s) { screens[s.getAttribute("data-screen")] = s; });
  var stepEl = document.getElementById("quizStep");
  var bar = document.getElementById("quizBar");
  var qEl = document.getElementById("quizQ");
  var optionsEl = document.getElementById("quizOptions");
  var answers = [];
  var current = 0;
  var orders = [];

  function show(name) {
    Object.keys(screens).forEach(function (k) { screens[k].classList.toggle("is-active", k === name); });
  }

  // option order is shuffled once per quiz so styles don't sit in the same spot
  function shuffle(n) {
    var a = [];
    for (var i = 0; i < n; i++) a.push(i);
    for (i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function renderQuestion(dir) {
    var item = QUESTIONS[current];
    stepEl.textContent = "Question " + (current + 1) + " of " + QUESTIONS.length;
    bar.style.width = (current / QUESTIONS.length * 100) + "%";
    document.getElementById("quizBack").style.visibility = current ? "visible" : "hidden";
    qEl.textContent = item.q;
    optionsEl.innerHTML = "";
    optionsEl.classList.remove("slide-next", "slide-prev");
    void optionsEl.offsetWidth;
    if (!reduceMotion && dir) optionsEl.classList.add(dir > 0 ? "slide-next" : "slide-prev");

    orders[current].forEach(function (k) {
      var opt = item.options[k];
      var b = document.createElement("button");
      b.type = "button";
      b.className = "quiz-opt" + (opt.colors ? " quiz-opt-palette" : "");
      b.setAttribute("role", "radio");
      b.setAttribute("aria-checked", String(answers[current] === opt.style));
      var visual = opt.colors
        ? '<span class="quiz-swatches">' + opt.colors.map(function (c) { return '<i style="background:' + c + '"></i>'; }).join("") + "</span>"
        : '<span class="quiz-img"><img src="' + opt.img + '" alt="" loading="lazy" decoding="async"></span>';
      b.innerHTML = visual + '<span class="quiz-label">' + opt.label + '</span><span class="quiz-tick" aria-hidden="true"></span>';
      b.addEventListener("click", function () { choose(opt.style, b); });
      optionsEl.appendChild(b);
    });
  }

  function choose(style, btn) {
    answers[current] = style;
    optionsEl.querySelectorAll(".quiz-opt").forEach(function (o) { o.setAttribute("aria-checked", String(o === btn)); });
    optionsEl.classList.add("locked");
    setTimeout(function () {
      optionsEl.classList.remove("locked");
      if (current < QUESTIONS.length - 1) {
        current++;
        renderQuestion(1);
      } else {
        bar.style.width = "100%";
        showResult();
      }
    }, reduceMotion ? 120 : 420);
  }

  function showResult() {
    var counts = { modern: 0, classic: 0, minimal: 0 };
    answers.forEach(function (a) { counts[a]++; });
    // highest count wins; a tie goes to the style picked most recently
    var winner = ORDER.slice().sort(function (a, b) {
      return counts[b] - counts[a] || answers.lastIndexOf(b) - answers.lastIndexOf(a);
    })[0];
    var st = STYLES[winner];

    document.getElementById("quizStyle").textContent = st.name;
    document.getElementById("quizDesc").textContent = st.desc;
    document.getElementById("quizPalette").innerHTML = st.palette.map(function (c) { return '<i style="background:' + c + '"></i>'; }).join("");
    document.getElementById("quizMix").innerHTML = ORDER.map(function (k) {
      var pct = Math.round(counts[k] / answers.length * 100);
      return '<li class="' + (k === winner ? "win" : "") + '"><span>' + STYLES[k].name + "</span><b>" + pct + '%</b><span class="quiz-mix-bar"><i style="--w:' + pct + '%"></i></span></li>';
    }).join("");

    document.getElementById("quizMatches").innerHTML = st.projects.map(function (id) {
      var p = PROJECTS[id];
      if (!p) return "";
      return '<a class="quiz-match" href="project.html?id=' + p.id + '"><img src="' + p.images[0].small + '" alt="" loading="lazy">' +
        "<span><small>" + p.category + "</small><strong>" + p.title + "</strong></span></a>";
    }).join("");

    var lines = [
      "Hi Interior Core, I took the style quiz on your website.",
      "",
      "My style: " + st.name + " (" + ORDER.map(function (k) { return STYLES[k].name + " " + Math.round(counts[k] / answers.length * 100) + "%"; }).join(", ") + ")",
      "",
      "I'd love ideas for my home in this style."
    ];
    var wa = document.getElementById("quizWa");
    if (cfg.whatsapp) {
      wa.href = "https://wa.me/" + cfg.whatsapp + "?text=" + encodeURIComponent(lines.join("\n"));
      wa.target = "_blank";
      wa.rel = "noopener";
    }
    show("result");
    quiz.scrollIntoView({ block: "start", behavior: reduceMotion ? "auto" : "smooth" });
  }

  function start() {
    answers = [];
    current = 0;
    orders = QUESTIONS.map(function (q) { return shuffle(q.options.length); });
    show("questions");
    renderQuestion(0);
    qEl.focus({ preventScroll: true });
  }

  document.getElementById("quizBegin").addEventListener("click", start);
  document.getElementById("quizRetake").addEventListener("click", start);
  document.getElementById("quizBack").addEventListener("click", function () {
    if (current === 0) return;
    current--;
    renderQuestion(-1);
  });
})();
