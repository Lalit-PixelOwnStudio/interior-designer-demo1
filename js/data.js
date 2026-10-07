/* ===== Interior Core — site content data =====
   Projects and before/after rooms live here so the portfolio, gallery and
   project viewer all read from one list. Images are generated into img/ by
   scripts/optimize-images.py (each photo has a -640 and a -1280 version). */
(function () {
  "use strict";

  function photos(num, count) {
    var list = [];
    for (var i = 1; i <= count; i++) {
      var base = "img/projects/project-" + num + "/" + (i < 10 ? "0" : "") + i;
      list.push({ small: base + "-640.webp", large: base + "-1280.webp" });
    }
    return list;
  }

  // category drives the portfolio filter buttons.
  // portfolio: false keeps a project in the gallery only (no details yet).
  var PROJECTS = [
    {
      id: "project-1",
      category: "Full Home",
      title: "Turnkey Home Renovation",
      meta: "₹25 Lakh · New Delhi",
      description: "A complete turnkey makeover — space planning and 3D design through modular furniture, false ceiling, electrical, plumbing and civil work — delivered end-to-end under one roof.",
      tags: ["Space Planning", "2D & 3D Design", "Modular Furniture", "False Ceiling & Lighting"],
      images: photos(1, 10)
    },
    {
      id: "project-2",
      category: "Bedroom & Living",
      title: "Theme & Concept-Based Makeover",
      meta: "₹20 Lakh · New Delhi",
      description: "A bedroom-and-living renovation built around one clear theme — colour palette, materials and furniture chosen to reflect the homeowner's personality.",
      tags: ["Theme-Based Design", "Colour & Materials", "Custom Furniture", "Renovation"],
      images: photos(2, 10)
    },
    {
      id: "project-3",
      category: "Living Room",
      title: "Faridabad Living Room",
      meta: "Turnkey · Faridabad",
      description: "A complete living room transformation — textured feature wall, custom seating and warm accent lighting — designed and executed end-to-end.",
      tags: ["Turnkey Design", "Feature Wall", "Custom Seating", "Accent Lighting"],
      images: photos(3, 9)
    },
    {
      id: "project-4",
      category: "Bedroom & Living",
      title: "Vasant Kunj Bedroom",
      meta: "Turnkey · Vasant Kunj",
      description: "A warm, textured bedroom — from design to on-site installation, delivered end-to-end by Interior Core.",
      tags: ["Bedroom Design", "Ambient Lighting", "End-to-End Execution"],
      images: photos(4, 10)
    },
    {
      id: "project-5",
      category: "Full Home",
      title: "Complete Home Interior",
      meta: "₹35 Lakh · New Delhi",
      description: "A full home interior, including a custom pooja unit with backlit deity niches and marble detailing, complete with all interior furniture.",
      tags: ["Complete Home", "Pooja Unit", "Custom Furniture", "Turnkey Execution"],
      images: photos(5, 10)
    },
    {
      id: "project-6",
      category: "Full Home",
      title: "Contemporary Turnkey Home",
      meta: "₹20 Lakh · New Delhi",
      description: "A contemporary turnkey interior executed with precision craftsmanship and on-time delivery, from layout to final styling.",
      tags: ["Turnkey Project", "Contemporary & Modern", "Full-Service Execution"],
      images: photos(6, 10)
    },
    {
      id: "project-7",
      category: "1 BHK",
      title: "Naraina 1 BHK",
      meta: "₹8 Lakh · Naraina",
      description: "A complete 1 BHK interior — thoughtfully planned layouts, material and colour selection, and furniture execution.",
      tags: ["1 BHK Interior", "Space Planning", "Renovation"],
      images: photos(7, 3)
    },
    {
      id: "project-8",
      portfolio: false,
      title: "Interior Core Project",
      images: photos(8, 5)
    }
  ];

  var BA_ROOMS = [
    {
      room: "Bedroom",
      desc: "From a bare, functional room to a warm, layered retreat with mirrored accents and ambient lighting.",
      tags: ["Custom Lighting", "Mirror Panelling", "Upholstered Headboard"]
    },
    {
      room: "Kitchen",
      desc: "A dated, closed-off kitchen reimagined as a bright, marble-clad space built for cooking and entertaining.",
      tags: ["Marble Countertops", "Open Layout", "Task Lighting"]
    },
    {
      room: "Living Room",
      desc: "Tired shelving gives way to a considered media wall with sculptural lighting and natural wood tones.",
      tags: ["Media Wall", "Sculptural Lighting", "Natural Wood"]
    },
    {
      room: "Dining Room",
      desc: "An ordinary dining corner becomes a sculpted, mirror-panelled space that feels like a private restaurant.",
      tags: ["Mirror Panelling", "Statement Seating", "Ambient Lighting"]
    },
    {
      room: "Bathroom",
      desc: "A worn, dim bathroom transformed into a spa-like retreat with warm brass fixtures and a backlit mirror.",
      tags: ["Brass Fixtures", "Backlit Mirror", "Spa Finishes"]
    }
  ].map(function (r, i) {
    var base = "img/before-after/room-" + (i + 1);
    return Object.assign({}, r, {
      before: { small: base + "-before-720.webp", large: base + "-before-1280.webp" },
      after: { small: base + "-after-720.webp", large: base + "-after-1280.webp" }
    });
  });

  window.IC_DATA = { PROJECTS: PROJECTS, BA_ROOMS: BA_ROOMS };
})();
