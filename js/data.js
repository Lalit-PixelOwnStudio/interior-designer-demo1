/* ===== Interior Core - site content data =====
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

  // category drives the filter buttons on projects.html.
  // featured: 1-3 picks (in order) the projects shown on the home page.
  // price is optional; portfolio: false keeps a project in the gallery only.
  var PROJECTS = [
    {
      id: "project-1",
      category: "Full Home",
      title: "Turnkey Home Renovation",
      featured: 1,
      price: "₹25 Lakh",
      location: "New Delhi",
      description: "A complete turnkey makeover covering space planning, 3D design, modular furniture, false ceiling, electrical, plumbing and civil work, delivered end-to-end under one roof.",
      tags: ["Space Planning", "2D & 3D Design", "Modular Furniture", "False Ceiling & Lighting"],
      images: photos(1, 10)
    },
    {
      id: "project-2",
      category: "Bedroom & Living",
      title: "Theme & Concept-Based Makeover",
      featured: 3,
      price: "₹20 Lakh",
      location: "New Delhi",
      description: "A bedroom-and-living renovation built around one clear theme: colour palette, materials and furniture chosen to reflect the homeowner's personality.",
      tags: ["Theme-Based Design", "Colour & Materials", "Custom Furniture", "Renovation"],
      images: photos(2, 10)
    },
    {
      id: "project-3",
      category: "Living Room",
      title: "Faridabad Living Room",
      location: "Faridabad",
      description: "A complete living room transformation with a textured feature wall, custom seating and warm accent lighting, designed and executed end-to-end.",
      tags: ["Turnkey Design", "Feature Wall", "Custom Seating", "Accent Lighting"],
      images: photos(3, 9)
    },
    {
      id: "project-4",
      category: "Bedroom & Living",
      title: "Vasant Kunj Bedroom",
      location: "Vasant Kunj",
      description: "A warm, textured bedroom, from design to on-site installation, delivered end-to-end by Interior Core.",
      tags: ["Bedroom Design", "Ambient Lighting", "End-to-End Execution"],
      images: photos(4, 10)
    },
    {
      id: "project-5",
      category: "Full Home",
      title: "Complete Home Interior",
      featured: 2,
      price: "₹35 Lakh",
      location: "New Delhi",
      description: "A full home interior, including a custom pooja unit with backlit deity niches and marble detailing, complete with all interior furniture.",
      tags: ["Complete Home", "Pooja Unit", "Custom Furniture", "Turnkey Execution"],
      images: photos(5, 10)
    },
    {
      id: "project-6",
      category: "Full Home",
      title: "Contemporary Turnkey Home",
      price: "₹20 Lakh",
      location: "New Delhi",
      description: "A contemporary turnkey interior executed with precision craftsmanship and on-time delivery, from layout to final styling.",
      tags: ["Turnkey Project", "Contemporary & Modern", "Full-Service Execution"],
      images: photos(6, 10)
    },
    {
      id: "project-7",
      category: "1 BHK",
      title: "Naraina 1 BHK",
      price: "₹8 Lakh",
      location: "Naraina",
      description: "A complete 1 BHK interior with thoughtfully planned layouts, material and colour selection, and furniture execution.",
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

  /* Case-study pages (project.html?id=…). DEMO CONTENT: clients, reviews,
     areas and timelines are samples for the showcase - replace them with
     the real project details. ba picks a before/after room from BA_ROOMS. */
  var MARBLE = "linear-gradient(135deg, #f6f3ee 0%, #e2dbd0 38%, #f8f6f2 52%, #d6cec1 78%, #f1ede6 100%)";
  var CASE_STUDIES = {
    "project-1": {
      home: "3 BHK apartment", area: "1,450 sq ft", duration: "75 days", year: "2025", ba: 1,
      brief: "A 15-year-old apartment with dark rooms, cramped storage and tired wiring. The family wanted a bright, modern home with space for visiting parents, and they needed to keep living in it while the work happened.",
      approach: [
        "Re-planned the layout to open the kitchen towards the dining area",
        "Rewired the flat and added layered ceiling lighting in every room",
        "Built floor-to-ceiling wardrobes with lofts for seasonal storage",
        "Worked room by room so the family never had to move out"
      ],
      materials: [
        { name: "Acrylic shutters", detail: "High-gloss, kitchen & wardrobes", swatch: "#ece6dc" },
        { name: "Italian marble", detail: "Living & dining floor", swatch: MARBLE },
        { name: "Walnut veneer", detail: "TV wall & doors", swatch: "#6b4a2f" },
        { name: "Hettich fittings", detail: "Soft-close hinges & channels", swatch: "#9b9b9b" },
        { name: "Gypsum ceiling", detail: "Cove & profile lighting", swatch: "#f6f2ea" }
      ],
      timeline: [
        { phase: "Design & 3D", days: 14 },
        { phase: "Civil & electrical", days: 21 },
        { phase: "Carpentry & installation", days: 28 },
        { phase: "Painting & styling", days: 12 }
      ],
      review: { name: "Rohit Mehra", role: "Homeowner, New Delhi", text: "We stayed in the house the whole time and still got it done in under three months. Every room feels twice as big now, and the lighting completely changed how the home feels in the evening." }
    },
    "project-2": {
      home: "Bedroom & living room", area: "650 sq ft", duration: "50 days", year: "2025", ba: 0,
      brief: "The homeowner loves travel and art, but the rooms felt plain and impersonal. She wanted one clear theme that tied the bedroom and living room together and showed off her collection.",
      approach: [
        "Built a warm, earthy palette from the art she already owned",
        "Designed a gallery wall with picture lights in the living room",
        "Custom bed with an upholstered headboard and hidden storage",
        "Matched fabrics, rugs and curtains across both rooms"
      ],
      materials: [
        { name: "Fluted panels", detail: "Living room feature wall", swatch: "#b08b63" },
        { name: "Velvet upholstery", detail: "Headboard & accent chairs", swatch: "#6d4c3d" },
        { name: "Oak veneer", detail: "Side tables & shelves", swatch: "#a57c52" },
        { name: "Brass inlays", detail: "Trims & handles", swatch: "linear-gradient(135deg, #e7c76f, #b8902f)" },
        { name: "Linen drapes", detail: "Floor-length, blackout lined", swatch: "#e7dccb" }
      ],
      timeline: [
        { phase: "Theme & moodboard", days: 7 },
        { phase: "Design & 3D", days: 12 },
        { phase: "Furniture & panelling", days: 23 },
        { phase: "Styling", days: 8 }
      ],
      review: { name: "Ananya Kapoor", role: "Homeowner, New Delhi", text: "They took my random collection of things and made it look intentional. The theme carries from the bedroom to the living room, and guests always ask who designed it." }
    },
    "project-3": {
      home: "Living room", area: "380 sq ft", duration: "30 days", year: "2024", ba: 2,
      brief: "A large but echoing living room with a blank wall where the TV sat. The family wanted a cosy space for evenings together and a statement wall for guests.",
      approach: [
        "Textured feature wall with concealed storage behind the TV",
        "Custom L-shaped seating sized exactly to the room",
        "Warm accent lighting on dimmers for movie nights",
        "Rug and curtains chosen to soften the acoustics"
      ],
      materials: [
        { name: "Textured paint", detail: "Feature wall", swatch: "#c8b49a" },
        { name: "Teak wood", detail: "Media unit & trims", swatch: "#8a5a2b" },
        { name: "Bouclé fabric", detail: "Custom seating", swatch: "#efe8dc" },
        { name: "LED profiles", detail: "Warm 2700K, dimmable", swatch: "linear-gradient(135deg, #fff1c4, #f2c55c)" },
        { name: "Jute rug", detail: "Hand-woven", swatch: "#b89a6a" }
      ],
      timeline: [
        { phase: "Design", days: 6 },
        { phase: "Carpentry", days: 14 },
        { phase: "Lighting & paint", days: 6 },
        { phase: "Styling", days: 4 }
      ],
      review: { name: "Neha Sharma", role: "Homeowner, Faridabad", text: "The feature wall is the first thing everyone notices. The room finally feels like the heart of the house instead of a waiting room." }
    },
    "project-4": {
      home: "Master bedroom", area: "220 sq ft", duration: "25 days", year: "2024",
      brief: "A master bedroom that had turned into a store room: clothes everywhere, harsh tube lights and nowhere to sit. The couple wanted calm, hotel-like comfort.",
      approach: [
        "Wall-to-wall wardrobe with a dresser built into one end",
        "Padded headboard wall with warm reading lights",
        "Cove lighting on dimmers instead of a single tube light",
        "Blackout curtains and a small reading corner by the window"
      ],
      materials: [
        { name: "Matte laminate", detail: "Fingerprint-resistant wardrobes", swatch: "#d9cfc0" },
        { name: "Fabric panels", detail: "Headboard wall", swatch: "#a69580" },
        { name: "Engineered wood", detail: "Bed & side tables", swatch: "#7a5534" },
        { name: "Häfele hardware", detail: "Soft-close drawers", swatch: "#8d8d8d" },
        { name: "Cove lighting", detail: "Warm white, dimmable", swatch: "linear-gradient(135deg, #fff1c4, #f2c55c)" }
      ],
      timeline: [
        { phase: "Design", days: 5 },
        { phase: "Carpentry", days: 12 },
        { phase: "Lighting & paint", days: 5 },
        { phase: "Styling", days: 3 }
      ],
      review: { name: "Karan & Ritika Malhotra", role: "Homeowners, Vasant Kunj", text: "It finally feels like a hotel suite. Everything has a place, and the lighting makes the room so calm at night." }
    },
    "project-5": {
      home: "4 BHK independent floor", area: "2,100 sq ft", duration: "95 days", year: "2025", ba: 3,
      brief: "A new independent floor that needed everything: furniture, kitchen, lighting and the pooja room the family had imagined for years, with marble and backlit niches.",
      approach: [
        "A backlit pooja unit with marble detailing as the home's centrepiece",
        "Furniture for all four bedrooms planned around each person's routine",
        "Modular kitchen with a tall pantry and an appliance garage",
        "One project manager coordinating every trade from start to handover"
      ],
      materials: [
        { name: "Makrana marble", detail: "Pooja unit", swatch: MARBLE },
        { name: "Corian", detail: "Backlit deity niches", swatch: "#f3efe6" },
        { name: "PU-finish shutters", detail: "Kitchen", swatch: "#3b3a36" },
        { name: "Teak veneer", detail: "Doors & wall panels", swatch: "#8a5a2b" },
        { name: "Hettich & Häfele", detail: "All fittings", swatch: "#8d8d8d" }
      ],
      timeline: [
        { phase: "Design & 3D", days: 20 },
        { phase: "Civil & electrical", days: 20 },
        { phase: "Carpentry", days: 35 },
        { phase: "Pooja unit & finishing", days: 12 },
        { phase: "Styling & handover", days: 8 }
      ],
      review: { name: "Suresh Gupta", role: "Homeowner, New Delhi", text: "The pooja unit is exactly what my mother had in mind for years. From the kitchen to the bedrooms, one team handled everything and handed it over on time." }
    },
    "project-6": {
      home: "3 BHK apartment", area: "1,250 sq ft", duration: "65 days", year: "2024", ba: 4,
      brief: "A young couple moving into their first home wanted a clean, contemporary look that would stay easy to maintain with two busy careers and a dog.",
      approach: [
        "A neutral palette with one bold accent colour per room",
        "Scratch-resistant, easy-clean surfaces throughout",
        "Smart lighting scenes controlled from the phone",
        "A work-from-home nook built into the guest room"
      ],
      materials: [
        { name: "Anti-scratch laminate", detail: "Wardrobes & units", swatch: "#cfc8bd" },
        { name: "Quartz", detail: "Kitchen countertop", swatch: "#ece9e4" },
        { name: "Matte black fittings", detail: "Handles & lights", swatch: "#232323" },
        { name: "Vinyl flooring", detail: "Bedrooms, pet-friendly", swatch: "#b49572" },
        { name: "Smart switches", detail: "App-controlled scenes", swatch: "#dcdcdc" }
      ],
      timeline: [
        { phase: "Design", days: 12 },
        { phase: "Civil & electrical", days: 14 },
        { phase: "Carpentry", days: 28 },
        { phase: "Finishing", days: 11 }
      ],
      review: { name: "Aditya & Meera Singh", role: "Homeowners, New Delhi", text: "Exactly the clean look we wanted, and nothing is precious. The dog approves too. They finished a day before the date they promised." }
    },
    "project-7": {
      home: "1 BHK apartment", area: "540 sq ft", duration: "40 days", year: "2025",
      brief: "A compact 1 BHK that had to work as bedroom, office and guest space, all on a tight budget.",
      approach: [
        "Space-saving layouts with storage under every seat and bed",
        "A sliding wardrobe to free up floor space",
        "Light colours and mirrors to make the rooms feel bigger",
        "A fold-down desk for working from home"
      ],
      materials: [
        { name: "Laminate", detail: "Wardrobes & kitchen", swatch: "#e0d6c6" },
        { name: "Mirror panels", detail: "Wardrobe shutters", swatch: "linear-gradient(135deg, #eef3f5, #c3cfd4)" },
        { name: "BWP plywood", detail: "Kitchen carcass", swatch: "#c8a879" },
        { name: "Slim LED panels", detail: "Ceiling lights", swatch: "#f6e7b5" }
      ],
      timeline: [
        { phase: "Design", days: 7 },
        { phase: "Carpentry", days: 22 },
        { phase: "Paint & finishing", days: 8 },
        { phase: "Handover", days: 3 }
      ],
      review: { name: "Pooja Verma", role: "Homeowner, Naraina", text: "I didn't think a 1 BHK could feel this spacious. Every corner has storage and it still looks light and airy." }
    }
  };

  PROJECTS.forEach(function (p) {
    if (CASE_STUDIES[p.id]) p.caseStudy = CASE_STUDIES[p.id];
  });

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
