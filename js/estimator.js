/* Cost estimator (pricing.html): pick a home, the spaces to design and a
   finish level to see an approximate cost range, then send it on WhatsApp.
   DEMO RATES: costs below are in lakh for a Premium finish. Change them to
   match the studio's real pricing. */
(function () {
  "use strict";

  var form = document.getElementById("estForm");
  if (!form) return;

  // size scales open areas, kitchen scales the kitchen, beds counts rooms
  var HOMES = {
    "1bhk": { label: "1 BHK", beds: 1, size: 1, kitchen: 1, days: [40, 50] },
    "2bhk": { label: "2 BHK", beds: 2, size: 1.35, kitchen: 1.15, days: [45, 60] },
    "3bhk": { label: "3 BHK", beds: 3, size: 1.7, kitchen: 1.3, days: [55, 75] },
    "villa": { label: "4 BHK / Villa", beds: 4, size: 2.4, kitchen: 1.5, days: [75, 100] }
  };

  var SPACES = {
    living: { label: "Living & Dining", rate: 2.4, per: "size" },
    kitchen: { label: "Modular Kitchen", rate: 2.6, per: "kitchen" },
    bedrooms: { label: "Bedrooms", rate: 2, per: "beds" },
    wardrobes: { label: "Wardrobes", rate: 1.1, per: "beds" },
    ceiling: { label: "False Ceiling & Lighting", rate: 1.1, per: "size" },
    pooja: { label: "Pooja Unit", rate: 0.7, per: "one" },
    painting: { label: "Painting & Finishing", rate: 0.7, per: "size" },
    civil: { label: "Civil & Renovation", rate: 2.5, per: "size", days: 15 }
  };

  var FINISHES = {
    essential: { label: "Essential", factor: 0.72 },
    premium: { label: "Premium", factor: 1 },
    luxury: { label: "Luxury", factor: 1.55, days: 10 }
  };

  var cfg = window.IC_CONFIG || {};
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var lows = form.parentNode.querySelectorAll('[data-est="low"]');
  var highs = form.parentNode.querySelectorAll('[data-est="high"]');
  var days = document.getElementById("estDays");
  var list = document.getElementById("estBreakdown");
  var wa = document.getElementById("estWhatsApp");
  var shown = { low: 0, high: 0 };
  var anim = null;

  // nearest half lakh: 9, 9.5, 10 …
  function lakh(n) {
    var r = Math.round(n * 2) / 2;
    return r % 1 ? r.toFixed(1) : String(r);
  }

  function calc() {
    var home = HOMES[(form.querySelector('input[name="home"]:checked') || {}).value] || HOMES["2bhk"];
    var finishKey = (form.querySelector('input[name="finish"]:checked') || {}).value || "premium";
    var finish = FINISHES[finishKey];
    var items = [];
    var total = 0;
    var extraDays = finish.days || 0;

    Array.prototype.forEach.call(form.querySelectorAll('input[name="space"]:checked'), function (input) {
      var s = SPACES[input.value];
      if (!s) return;
      var units = s.per === "size" ? home.size : s.per === "kitchen" ? home.kitchen : s.per === "beds" ? home.beds : 1;
      var cost = s.rate * units * finish.factor;
      total += cost;
      extraDays += s.days || 0;
      items.push({ label: s.label + (s.per === "beds" ? " (" + home.beds + ")" : ""), cost: cost });
    });

    return {
      home: home,
      finish: finish,
      items: items,
      low: total * 0.92,
      high: total * 1.12,
      days: [home.days[0] + extraDays, home.days[1] + extraDays]
    };
  }

  function setNumbers(low, high, final) {
    var fmt = final ? lakh : function (n) { return n.toFixed(1); };
    Array.prototype.forEach.call(lows, function (el) { el.textContent = fmt(low); });
    Array.prototype.forEach.call(highs, function (el) { el.textContent = fmt(high); });
  }

  // numbers glide from the old range to the new one
  function tweenTo(low, high) {
    if (anim) cancelAnimationFrame(anim);
    var from = { low: shown.low, high: shown.high };
    shown = { low: low, high: high };
    if (reduceMotion) { setNumbers(low, high, true); return; }
    var start = null;
    function step(t) {
      if (start === null) start = t;
      var p = Math.min((t - start) / 500, 1);
      var e = 1 - Math.pow(1 - p, 3);
      setNumbers(from.low + (low - from.low) * e, from.high + (high - from.high) * e, p === 1);
      if (p < 1) anim = requestAnimationFrame(step);
    }
    anim = requestAnimationFrame(step);
  }

  function render() {
    var r = calc();
    var empty = !r.items.length;
    form.parentNode.classList.toggle("est-empty", empty);

    // bedroom count shown on the Bedrooms and Wardrobes tiles
    form.querySelectorAll("[data-est-beds]").forEach(function (el) {
      el.textContent = "× " + r.home.beds + (r.home.beds === 1 ? " room" : " rooms");
    });

    tweenTo(empty ? 0 : r.low, empty ? 0 : r.high);
    days.textContent = empty ? "Pick at least one space to see an estimate" : "Ready in about " + r.days[0] + " to " + r.days[1] + " days";

    var max = r.items.reduce(function (m, it) { return Math.max(m, it.cost); }, 0);
    list.innerHTML = r.items.map(function (it) {
      return "<li><span>" + it.label + "</span><b>₹" + lakh(it.cost) + " L</b>" +
        '<span class="est-bar"><i style="--w:' + Math.round(it.cost / max * 100) + '%"></i></span></li>';
    }).join("");

    var lines = [
      "Hi Interior Core, I used the cost estimator on your website.",
      "",
      "Home: " + r.home.label,
      "Spaces: " + r.items.map(function (it) { return it.label; }).join(", "),
      "Finish: " + r.finish.label,
      "Estimate: ₹" + lakh(r.low) + " to " + lakh(r.high) + " Lakh",
      "",
      "Please share an exact quote."
    ];
    if (cfg.whatsapp && !empty) {
      wa.href = "https://wa.me/" + cfg.whatsapp + "?text=" + encodeURIComponent(lines.join("\n"));
      wa.target = "_blank";
      wa.rel = "noopener";
    }
  }

  form.addEventListener("change", render);
  render();
})();
