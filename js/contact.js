/* Contact: studio hours with a live "Open now / Closed" badge (India
   time), Get-directions links, the form's success state, and a package
   picked on the Pricing page pre-filled into the form. Values come from
   js/config.js. */
(function () {
  "use strict";

  var cfg = window.IC_CONFIG || {};

  /* ----- Directions ----- */
  var dest = encodeURIComponent(cfg.address || cfg.mapQuery || "");
  document.querySelectorAll("[data-ic-directions]").forEach(function (a) {
    a.href = "https://www.google.com/maps/dir/?api=1&destination=" + dest;
    a.target = "_blank";
    a.rel = "noopener";
  });

  /* ----- Hours list ----- */
  var list = document.getElementById("studioHours");
  if (list && cfg.hours && cfg.hours.length) {
    list.innerHTML = cfg.hours.map(function (h) {
      return '<li data-label="' + h.label + '"><span>' + h.label + "</span><span>" + h.time + "</span></li>";
    }).join("");
  }

  /* ----- Open now / Closed (India time) ----- */
  var DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  function indiaNow() {
    // current day and hour in Asia/Kolkata, whatever the visitor's timezone
    var parts = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Asia/Kolkata", weekday: "long", hour: "numeric", minute: "numeric", hour12: false
    }).formatToParts(new Date());
    var get = function (type) {
      var p = parts.filter(function (x) { return x.type === type; })[0];
      return p ? p.value : "";
    };
    return { day: DAYS.indexOf(get("weekday")), hour: parseInt(get("hour"), 10) % 24 + parseInt(get("minute"), 10) / 60 };
  }

  function fmt(h) {
    var hr = Math.floor(h);
    var suffix = hr >= 12 ? "PM" : "AM";
    var h12 = hr % 12 || 12;
    var min = Math.round((h - hr) * 60);
    return h12 + (min ? ":" + (min < 10 ? "0" : "") + min : "") + " " + suffix;
  }

  function updateBadge() {
    var badge = document.getElementById("openBadge");
    var hours = cfg.openingHours;
    if (!badge || !hours) return;
    var now;
    try { now = indiaNow(); } catch (e) { return; }
    if (now.day < 0) return;

    var today = hours[now.day];
    var text, open = false;
    if (today && now.hour >= today[0] && now.hour < today[1]) {
      open = true;
      text = "Open now · closes " + fmt(today[1]);
    } else {
      // find the next opening time
      for (var i = 0; i < 7; i++) {
        var d = (now.day + i) % 7;
        var h = hours[d];
        if (!h) continue;
        if (i === 0 && now.hour >= h[0]) continue;
        text = "Closed · opens " + (i === 0 ? "today " : i === 1 ? "tomorrow " : DAYS[d].slice(0, 3) + " ") + fmt(h[0]);
        break;
      }
      text = text || "Closed";
    }
    badge.textContent = text;
    badge.classList.toggle("is-open", open);
    badge.hidden = false;

    // highlight the row that covers today
    if (list) {
      list.querySelectorAll("li").forEach(function (li) {
        var label = li.getAttribute("data-label") || li.textContent;
        var isToday = label.indexOf(DAYS[now.day]) !== -1 ||
          (/Monday\s*(?:-|to)\s*Saturday/.test(label) && now.day >= 1 && now.day <= 6) ||
          (/Monday\s*(?:-|to)\s*Friday/.test(label) && now.day >= 1 && now.day <= 5);
        li.classList.toggle("today", isToday);
      });
    }
  }

  if (document.getElementById("openBadge")) {
    updateBadge();
    setInterval(updateBadge, 60000);
  }

  /* ----- Package from pricing.html (?package=…&property=…&budget=…) ----- */
  var form = document.getElementById("contactForm");
  var params = new URLSearchParams(window.location.search);
  if (form && params.get("package")) {
    ["property", "budget"].forEach(function (field) {
      var value = params.get(field);
      Array.prototype.forEach.call(form.querySelectorAll('input[name="' + field + '"]'), function (r) {
        if (r.value === value) r.checked = true;
      });
    });
    var msg = document.getElementById("cfMessage");
    if (msg && !msg.value) msg.value = "I'm interested in the " + params.get("package") + " package.";
  }

  /* ----- Form success state ----- */
  var again = document.getElementById("formAgain");
  if (form && again) {
    again.addEventListener("click", function () {
      form.reset();
      form.classList.remove("sent");
      var status = document.getElementById("formStatus");
      if (status) status.textContent = "";
      var name = document.getElementById("cfName");
      if (name) name.focus();
    });
  }
})();
