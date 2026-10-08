/* Project cards. On the home page (#portfolioGrid[data-featured]) only the
   3 featured projects show; on projects.html every project shows with
   category filters. Clicking anywhere on a card opens its photos and
   details in the viewer (js/components/lightbox.js). */
(function () {
  "use strict";

  var grid = document.getElementById("portfolioGrid");
  var filtersEl = document.getElementById("portfolioFilters");
  if (!grid || !window.IC_DATA) return;

  var ALL = window.IC_DATA.PROJECTS.filter(function (p) {
    return p.portfolio !== false;
  });

  var featuredOnly = grid.hasAttribute("data-featured");
  var PROJECTS = featuredOnly
    ? ALL.filter(function (p) { return p.featured; })
        .sort(function (a, b) { return a.featured - b.featured; })
    : ALL;

  var activeFilter = "all";

  var PIN =
    '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    '<path d="M12 22s7-6.2 7-12a7 7 0 0 0-14 0c0 5.8 7 12 7 12Z"/><circle cx="12" cy="10" r="2.5"/></svg>';

  function buildFilters() {
    if (!filtersEl) return;
    var categories = [];
    PROJECTS.forEach(function (p) {
      if (categories.indexOf(p.category) === -1) categories.push(p.category);
    });

    ["all"].concat(categories).forEach(function (cat, i) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "filter-btn" + (i === 0 ? " active" : "");
      btn.setAttribute("data-filter", cat);
      btn.setAttribute("aria-pressed", i === 0 ? "true" : "false");
      btn.textContent = cat === "all" ? "All Projects" : cat;
      filtersEl.appendChild(btn);
    });

    filtersEl.addEventListener("click", function (e) {
      var btn = e.target.closest(".filter-btn");
      if (!btn) return;
      activeFilter = btn.getAttribute("data-filter");
      Array.prototype.forEach.call(filtersEl.querySelectorAll(".filter-btn"), function (b) {
        var on = b === btn;
        b.classList.toggle("active", on);
        b.setAttribute("aria-pressed", String(on));
      });
      // on phones the row scrolls sideways: bring the picked filter into view
      if (filtersEl.scrollWidth > filtersEl.clientWidth) {
        filtersEl.scrollTo({ left: btn.offsetLeft - (filtersEl.clientWidth - btn.offsetWidth) / 2, behavior: "smooth" });
      }
      render();
    });
  }

  function openProject(project) {
    if (window.ICLightbox) window.ICLightbox.open(project.images, 0, project);
  }

  function card(project, index) {
    var el = document.createElement("article");
    el.className = "portfolio-card";
    el.style.setProperty("--d", String(index % 6));
    el.tabIndex = 0;
    el.setAttribute("role", "button");
    el.setAttribute("aria-label", "View photos and details of " + project.title);

    var cover = project.images[0];
    var tagsMarkup = project.tags.map(function (tag) {
      return '<span class="portfolio-tag">' + tag + "</span>";
    }).join("");

    var price = project.price
      ? '<span class="portfolio-card-price"><small>Project value</small>' + project.price + "</span>"
      : '<span class="portfolio-card-price portfolio-card-price-na"><small>Project value</small>On request</span>';

    el.innerHTML =
      '<div class="portfolio-card-image">' +
        '<img src="' + cover.small + '" srcset="' + cover.small + ' 640w, ' + cover.large + ' 1280w" ' +
          'sizes="(max-width: 767px) 100vw, (max-width: 1023px) 50vw, 420px" alt="' + project.title + '" loading="lazy" decoding="async">' +
        '<span class="portfolio-card-overlay">' +
          '<span class="portfolio-card-arrow">' +
            '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><line x1="5" y1="19" x2="19" y2="5"/><polyline points="8 5 19 5 19 16"/></svg>' +
          "</span>" +
        "</span>" +
      "</div>" +
      '<div class="portfolio-card-body">' +
        '<span class="portfolio-card-category">' + project.category + "</span>" +
        '<h3 class="portfolio-card-title">' + project.title + "</h3>" +
        '<div class="portfolio-card-meta">' +
          price +
          (project.location ? '<span class="portfolio-card-location">' + PIN + project.location + "</span>" : "") +
        "</div>" +
        '<p class="portfolio-card-desc">' + project.description + "</p>" +
        '<div class="portfolio-card-tags">' + tagsMarkup + "</div>" +
        '<span class="portfolio-card-btn">View Project' +
          '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>' +
        "</span>" +
      "</div>";

    el.addEventListener("click", function () { openProject(project); });
    el.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openProject(project);
      }
    });
    return el;
  }

  function render() {
    var list = activeFilter === "all"
      ? PROJECTS
      : PROJECTS.filter(function (p) { return p.category === activeFilter; });

    grid.innerHTML = "";
    list.forEach(function (project, index) {
      grid.appendChild(card(project, index));
    });
  }

  buildFilters();
  render();
})();
