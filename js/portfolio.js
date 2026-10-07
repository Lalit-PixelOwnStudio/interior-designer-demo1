(function () {
  "use strict";

  var grid = document.getElementById("portfolioGrid");
  var filtersEl = document.getElementById("portfolioFilters");
  var revealWrap = document.getElementById("portfolioRevealWrap");
  var viewAllBtn = document.getElementById("portfolioViewAll");
  if (!grid || !window.IC_DATA) return;

  var PROJECTS = window.IC_DATA.PROJECTS.filter(function (p) {
    return p.portfolio !== false;
  });

  var categories = [];
  PROJECTS.forEach(function (p) {
    if (categories.indexOf(p.category) === -1) categories.push(p.category);
  });

  var activeFilter = "all";
  var expanded = false;

  function isMobile() {
    return window.innerWidth < 768;
  }

  function buildFilters() {
    ["all"].concat(categories).forEach(function (cat, i) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "filter-btn" + (i === 0 ? " active" : "");
      btn.setAttribute("data-filter", cat);
      btn.setAttribute("aria-pressed", i === 0 ? "true" : "false");
      btn.textContent = cat === "all" ? "All" : cat;
      filtersEl.appendChild(btn);
    });

    filtersEl.addEventListener("click", function (e) {
      var btn = e.target.closest(".filter-btn");
      if (!btn) return;
      activeFilter = btn.getAttribute("data-filter");
      expanded = false;
      Array.prototype.forEach.call(filtersEl.querySelectorAll(".filter-btn"), function (b) {
        var on = b === btn;
        b.classList.toggle("active", on);
        b.setAttribute("aria-pressed", String(on));
      });
      render();
    });
  }

  function openProject(project) {
    if (window.ICLightbox) {
      window.ICLightbox.open(project.images, 0, { title: project.title, meta: project.meta });
    }
  }

  function card(project, index) {
    var el = document.createElement("article");
    el.className = "portfolio-card";
    el.style.setProperty("--d", String(index % 6));

    var cover = project.images[0];
    var tagsMarkup = project.tags.map(function (tag) {
      return '<span class="portfolio-tag">' + tag + "</span>";
    }).join("");

    el.innerHTML =
      '<button type="button" class="portfolio-card-image" aria-label="View ' + project.title + ' photos">' +
        '<img src="' + cover.small + '" srcset="' + cover.small + ' 640w, ' + cover.large + ' 1280w" ' +
          'sizes="(max-width: 767px) 100vw, (max-width: 1023px) 50vw, 420px" alt="' + project.title + '" loading="lazy" decoding="async">' +
        '<span class="portfolio-card-count">' + project.images.length + ' photos</span>' +
        '<span class="portfolio-card-overlay">' +
          '<span class="portfolio-card-arrow">' +
            '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><line x1="5" y1="19" x2="19" y2="5"/><polyline points="8 5 19 5 19 16"/></svg>' +
          "</span>" +
        "</span>" +
      "</button>" +
      '<div class="portfolio-card-body">' +
        '<span class="portfolio-card-category">' + project.category + "</span>" +
        '<h3 class="portfolio-card-title">' + project.title + "</h3>" +
        '<p class="portfolio-card-meta">' + project.meta + "</p>" +
        '<p class="portfolio-card-desc">' + project.description + "</p>" +
        '<div class="portfolio-card-tags">' + tagsMarkup + "</div>" +
        '<button type="button" class="portfolio-card-btn">View Project' +
          '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>' +
        "</button>" +
      "</div>";

    el.querySelector(".portfolio-card-image").addEventListener("click", function () { openProject(project); });
    el.querySelector(".portfolio-card-btn").addEventListener("click", function () { openProject(project); });
    return el;
  }

  function render() {
    var filtered = activeFilter === "all"
      ? PROJECTS
      : PROJECTS.filter(function (p) { return p.category === activeFilter; });

    var visible = filtered;
    var showButton = false;
    if (isMobile() && !expanded && filtered.length > 3) {
      visible = filtered.slice(0, 3);
      showButton = true;
    }

    grid.innerHTML = "";
    visible.forEach(function (project, index) {
      grid.appendChild(card(project, index));
    });

    revealWrap.style.display = showButton ? "flex" : "none";
  }

  viewAllBtn.addEventListener("click", function () {
    expanded = true;
    render();
  });

  // Re-render only when crossing the phone breakpoint, not on every resize
  // (mobile browsers fire resize when the address bar hides).
  var wasMobile = isMobile();
  window.addEventListener("resize", function () {
    if (isMobile() !== wasMobile) {
      wasMobile = isMobile();
      render();
    }
  });

  buildFilters();
  render();
})();
