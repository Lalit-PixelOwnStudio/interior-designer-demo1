(function () {
  "use strict";

  // Data pulled directly from each project folder's details.md.
  // cover: no file named cover/hero/best exists in any folder, so the fallback
  // (first image alphabetically) is used — "1.jpeg" in every case.
  var PROJECTS = [
    {
      folder: "project 1",
      cover: "1.jpeg",
      title: "Turnkey Home Renovation — ₹25 Lakh Transformation",
      description: "A complete turnkey interior makeover — from space planning and 3D design to modular furniture, false ceiling, electrical, plumbing, and civil work — delivered end-to-end under one roof by Interior Core Studio, Malviya Nagar.",
      tags: ["Space Planning", "2D & 3D Design", "Modular Furniture", "False Ceiling & Lighting"]
    },
    {
      folder: "Project 2",
      cover: "1.jpeg",
      title: "Theme & Concept-Based Interior Design — ₹20 Lakh Makeover",
      description: "A bedroom-and-living renovation built around a clear design theme — colour palette, materials, and furniture chosen to reflect the homeowner's personality, executed with precision craftsmanship and on-time delivery.",
      tags: ["Theme-Based Design", "Colour & Material Selection", "Custom Furniture", "Renovation"]
    },
    {
      folder: "Project 3",
      cover: "1.jpeg",
      title: "Project Faridabad — Turnkey End-to-End Interior Design",
      description: "A complete turnkey living room transformation — textured feature wall, custom seating, and warm accent lighting — designed and executed end-to-end for a Faridabad home.",
      tags: ["Turnkey Project", "End-to-End Execution", "Living Room Design", "Custom Furniture"]
    },
    {
      folder: "Project 4",
      cover: "1.jpeg",
      title: "Vasant Kunj Project — Turnkey Interior Design",
      description: "A warm, textured bedroom turnkey execution in Vasant Kunj — from design to on-site installation, delivered end-to-end by Interior Core.",
      tags: ["Turnkey Project", "Bedroom Design", "End-to-End Execution", "Ambient Lighting"]
    },
    {
      folder: "Project 5",
      cover: "1.jpeg",
      title: "Renovation Project — ₹35 Lakh Complete Home Interior",
      description: "A full home interior — including a custom pooja unit with backlit deity niches and marble detailing — designed and executed end-to-end, complete with all interior furniture.",
      tags: ["Complete Home Interior", "Pooja Unit Design", "Custom Furniture", "Turnkey Execution"]
    },
    {
      folder: "Project 6",
      cover: "1.jpeg",
      title: "Turnkey Project — ₹20 Lakh Interior Design",
      description: "A complete turnkey interior design project spanning contemporary and modern homes, apartments, hotels, bars, restaurants, offices and stores, executed with precision craftsmanship and on-time delivery.",
      tags: ["Turnkey Project", "Interior Design", "Contemporary & Modern", "Full-Service Execution"]
    }
  ];

  var grid = document.getElementById("portfolioGrid");
  var filtersEl = document.getElementById("portfolioFilters");
  var revealWrap = document.getElementById("portfolioRevealWrap");
  var viewAllBtn = document.getElementById("portfolioViewAll");
  if (!grid) return;

  var categories = [];
  PROJECTS.forEach(function (p) {
    var cat = p.tags[0];
    if (categories.indexOf(cat) === -1) categories.push(cat);
  });

  var activeFilter = "all";
  var expanded = false;

  function isMobile() {
    return window.innerWidth < 768;
  }

  function buildFilters() {
    var allBtn = document.createElement("button");
    allBtn.className = "filter-btn active";
    allBtn.setAttribute("data-filter", "all");
    allBtn.textContent = "All";
    filtersEl.appendChild(allBtn);

    categories.forEach(function (cat) {
      var btn = document.createElement("button");
      btn.className = "filter-btn";
      btn.setAttribute("data-filter", cat);
      btn.textContent = cat;
      filtersEl.appendChild(btn);
    });

    filtersEl.addEventListener("click", function (e) {
      var btn = e.target.closest(".filter-btn");
      if (!btn) return;
      activeFilter = btn.getAttribute("data-filter");
      expanded = false;
      Array.prototype.forEach.call(filtersEl.querySelectorAll(".filter-btn"), function (b) {
        b.classList.toggle("active", b === btn);
      });
      render();
    });
  }

  function cardMarkup(project, index) {
    var card = document.createElement("div");
    card.className = "portfolio-card reveal-item";
    card.style.setProperty("--d", String(index % 6));

    var tagsMarkup = project.tags.map(function (tag) {
      return '<span class="portfolio-tag">' + tag + '</span>';
    }).join("");

    card.innerHTML =
      '<div class="portfolio-card-image">' +
        '<img src="Assets/' + project.folder + '/' + project.cover + '" alt="' + project.title + '" loading="lazy">' +
        '<div class="portfolio-card-overlay">' +
          '<span class="portfolio-card-arrow">' +
            '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8"><line x1="5" y1="19" x2="19" y2="5"/><polyline points="8 5 19 5 19 16"/></svg>' +
          '</span>' +
        '</div>' +
      '</div>' +
      '<div class="portfolio-card-body">' +
        '<span class="portfolio-card-category">' + project.tags[0] + '</span>' +
        '<h3 class="portfolio-card-title">' + project.title + '</h3>' +
        '<p class="portfolio-card-desc">' + project.description + '</p>' +
        '<div class="portfolio-card-tags">' + tagsMarkup + '</div>' +
        '<a href="#" class="portfolio-card-btn">View Project' +
          '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>' +
        '</a>' +
      '</div>';

    return card;
  }

  function render() {
    var filtered = activeFilter === "all"
      ? PROJECTS
      : PROJECTS.filter(function (p) { return p.tags[0] === activeFilter; });

    grid.innerHTML = "";

    var visible = filtered;
    var showButton = false;
    if (isMobile() && !expanded && filtered.length > 3) {
      visible = filtered.slice(0, 3);
      showButton = true;
    }

    visible.forEach(function (project, index) {
      grid.appendChild(cardMarkup(project, index));
    });

    revealWrap.style.display = showButton ? "flex" : "none";
  }

  viewAllBtn.addEventListener("click", function () {
    expanded = true;
    render();
  });

  var resizeTimer = null;
  window.addEventListener("resize", function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(render, 150);
  });

  buildFilters();
  render();
})();
