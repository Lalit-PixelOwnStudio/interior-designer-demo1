/* Studio visit booking (contact.html#visit): pick one of the next two
   weeks' open days and a time slot inside studio hours (India time, from
   js/config.js), add name and phone, and the booking goes out as a
   WhatsApp message. Afterwards the visitor can add it to their calendar. */
(function () {
  "use strict";

  var form = document.getElementById("visitForm");
  if (!form) return;

  var cfg = window.IC_CONFIG || {};
  var hours = cfg.openingHours || {};
  var daysEl = document.getElementById("visitDays");
  var slotsEl = document.getElementById("visitSlots");
  var summary = document.getElementById("visitSummary");
  var status = document.getElementById("visitStatus");
  var DAY = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  var DAY_LONG = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  var MONTH = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  var MONTH_LONG = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  var VISIT_MINUTES = 45;

  var chosenDay = null;
  var chosenSlot = null;

  // today's date and time in India, whatever the visitor's timezone
  function indiaNow() {
    var parts = {};
    try {
      new Intl.DateTimeFormat("en-GB", {
        timeZone: "Asia/Kolkata", year: "numeric", month: "numeric", day: "numeric",
        hour: "numeric", minute: "numeric", hour12: false
      }).formatToParts(new Date()).forEach(function (p) { parts[p.type] = p.value; });
    } catch (e) {
      var d = new Date();
      parts = { year: d.getFullYear(), month: d.getMonth() + 1, day: d.getDate(), hour: d.getHours(), minute: d.getMinutes() };
    }
    return {
      y: +parts.year, m: +parts.month - 1, d: +parts.day,
      hour: (+parts.hour % 24) + (+parts.minute) / 60
    };
  }

  function fmtTime(h) {
    var hr = Math.floor(h);
    var min = Math.round((h - hr) * 60);
    return (hr % 12 || 12) + ":" + (min < 10 ? "0" : "") + min + " " + (hr >= 12 ? "PM" : "AM");
  }

  // demo: one or two slots a day show as already booked, the same ones on every visit
  function looksBooked(day, slot) {
    var seed = (day.date.getUTCDate() * 31 + day.date.getUTCMonth() * 7 + slot * 13) % 9;
    return seed === 2 || seed === 6;
  }

  var now = indiaNow();
  var days = [];
  for (var i = 0; i < 14; i++) {
    var date = new Date(Date.UTC(now.y, now.m, now.d + i));
    var open = hours[date.getUTCDay()];
    var slots = [];
    if (open) {
      for (var h = open[0]; h + VISIT_MINUTES / 60 <= open[1]; h += 1) {
        // today: only slots at least an hour from now
        if (i === 0 && h < now.hour + 1) continue;
        slots.push(h);
      }
    }
    days.push({ index: i, date: date, slots: slots, open: !!open });
  }

  function dayLabel(day) {
    return day.index === 0 ? "Today" : day.index === 1 ? "Tomorrow" : DAY[day.date.getUTCDay()];
  }

  /* ----- Day chips ----- */
  days.forEach(function (day) {
    var b = document.createElement("button");
    b.type = "button";
    b.className = "visit-day";
    b.setAttribute("role", "radio");
    b.setAttribute("aria-checked", "false");
    var full = !day.slots.length;
    b.disabled = full;
    b.innerHTML =
      "<small>" + dayLabel(day) + "</small>" +
      "<strong>" + day.date.getUTCDate() + "</strong>" +
      "<small>" + (full ? (day.open ? "Full" : "Closed") : MONTH[day.date.getUTCMonth()]) + "</small>";
    b.setAttribute("aria-label", DAY_LONG[day.date.getUTCDay()] + " " + day.date.getUTCDate() + " " + MONTH_LONG[day.date.getUTCMonth()] + (full ? ", not available" : ""));
    b.addEventListener("click", function () { pickDay(day, b); });
    day.button = b;
    daysEl.appendChild(b);
  });

  function pickDay(day, btn) {
    chosenDay = day;
    chosenSlot = null;
    days.forEach(function (d) { if (d.button) d.button.setAttribute("aria-checked", String(d === day)); });
    renderSlots();
    updateSummary();
    if (btn && btn.scrollIntoView && daysEl.scrollWidth > daysEl.clientWidth) {
      daysEl.scrollTo({ left: btn.offsetLeft - daysEl.clientWidth / 2 + btn.offsetWidth / 2, behavior: "smooth" });
    }
  }

  /* ----- Time slots ----- */
  function renderSlots() {
    slotsEl.innerHTML = "";
    chosenDay.slots.forEach(function (h) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "visit-slot";
      b.setAttribute("role", "radio");
      b.setAttribute("aria-checked", "false");
      var booked = looksBooked(chosenDay, h);
      b.disabled = booked;
      b.innerHTML = fmtTime(h) + (booked ? "<small>Booked</small>" : "");
      b.addEventListener("click", function () {
        chosenSlot = h;
        Array.prototype.forEach.call(slotsEl.children, function (c) { c.setAttribute("aria-checked", String(c === b)); });
        updateSummary();
        status.textContent = "";
      });
      slotsEl.appendChild(b);
    });
  }

  function longDate(day) {
    return DAY_LONG[day.date.getUTCDay()] + ", " + day.date.getUTCDate() + " " + MONTH_LONG[day.date.getUTCMonth()];
  }

  function updateSummary() {
    if (!chosenDay) { summary.textContent = ""; return; }
    summary.innerHTML = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="17" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>' +
      "<span>" + longDate(chosenDay) + (chosenSlot !== null ? " · <strong>" + fmtTime(chosenSlot) + "</strong>" : " · pick a time") + "</span>";
  }

  // start on the first day that has free slots
  var first = days.filter(function (d) { return d.slots.length; })[0];
  if (first) pickDay(first);

  /* ----- Calendar file for the booked visit ----- */
  function pad(n) { return (n < 10 ? "0" : "") + n; }

  function icsStamp(date) {
    return date.getUTCFullYear() + pad(date.getUTCMonth() + 1) + pad(date.getUTCDate()) + "T" +
      pad(date.getUTCHours()) + pad(date.getUTCMinutes()) + "00Z";
  }

  function calendarFile(day, h) {
    // India is UTC+5:30
    var start = new Date(day.date.getTime() + (h - 5.5) * 3600000);
    var end = new Date(start.getTime() + VISIT_MINUTES * 60000);
    var place = (cfg.address || "Interior Core Studio").replace(/,/g, "\\,");
    return [
      "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Interior Core//Studio Visit//EN", "BEGIN:VEVENT",
      "UID:" + start.getTime() + "@interiorcore.in",
      "DTSTAMP:" + icsStamp(new Date()),
      "DTSTART:" + icsStamp(start),
      "DTEND:" + icsStamp(end),
      "SUMMARY:Studio visit — Interior Core",
      "LOCATION:" + place,
      "DESCRIPTION:Design consultation at the Interior Core studio. Call " + (cfg.phoneDisplay || "") + " if you need to reschedule.",
      "END:VEVENT", "END:VCALENDAR"
    ].join("\r\n");
  }

  /* ----- Submit → WhatsApp ----- */
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (!chosenDay || chosenSlot === null) {
      status.textContent = "Please pick a day and a time for your visit.";
      slotsEl.classList.remove("visit-shake");
      void slotsEl.offsetWidth;
      slotsEl.classList.add("visit-shake");
      return;
    }
    if (!form.reportValidity()) return;

    var data = new FormData(form);
    var lines = [
      "Hi Interior Core, I'd like to book a studio visit.",
      "",
      "Date: " + longDate(chosenDay),
      "Time: " + fmtTime(chosenSlot),
      "Name: " + data.get("name"),
      "Phone: " + data.get("phone")
    ];
    if (data.get("purpose")) lines.push("To discuss: " + data.get("purpose"));

    window.open("https://wa.me/" + (cfg.whatsapp || "") + "?text=" + encodeURIComponent(lines.join("\n")), "_blank", "noopener");

    document.getElementById("visitDone").textContent =
      "WhatsApp has opened with your booking for " + longDate(chosenDay) + " at " + fmtTime(chosenSlot) + ". Press send and we'll confirm your slot.";
    var ics = document.getElementById("visitIcs");
    try {
      if (ics.href.indexOf("blob:") === 0) URL.revokeObjectURL(ics.href);
      ics.href = URL.createObjectURL(new Blob([calendarFile(chosenDay, chosenSlot)], { type: "text/calendar" }));
    } catch (err) {
      ics.hidden = true;
    }
    status.textContent = "";
    form.classList.add("sent");
    // the success message sits in the middle of the (tall) card
    form.scrollIntoView({ block: "center", behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  });

  document.getElementById("visitAgain").addEventListener("click", function () {
    form.classList.remove("sent");
    if (first) pickDay(first);
  });
})();
