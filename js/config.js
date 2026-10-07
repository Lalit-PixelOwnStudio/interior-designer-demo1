/* ===== Interior Core — contact details =====
   Change these values in ONE place and every Call / WhatsApp / Email link
   on the site updates (header, hero, sticky mobile bar, contact, footer).
   TODO: replace the placeholder numbers below with the real ones before launch. */
window.IC_CONFIG = {
  phoneDisplay: "+91 00000 00000",
  phone: "+910000000000",          // used for tel: links
  whatsapp: "910000000000",        // country code + number, no "+" or spaces
  email: "hello@interiorcore.in",
  address: "Interior Core Studio, Malviya Nagar, New Delhi 110017",
  mapQuery: "Malviya Nagar, New Delhi 110017",

  // Studio hours shown in the Contact section (demo values — change as needed)
  hours: [
    { label: "Monday – Saturday", time: "10:00 AM – 7:00 PM" },
    { label: "Sunday", time: "By appointment" }
  ],
  // Used for the live "Open now / Closed" badge, India time, 24-hour clock.
  // Day numbers: 0 = Sunday … 6 = Saturday. Leave a day out if closed.
  openingHours: { 1: [10, 19], 2: [10, 19], 3: [10, 19], 4: [10, 19], 5: [10, 19], 6: [10, 19] },
  instagram: "#",
  facebook: "#",
  linkedin: "#",
  whatsappGreeting: "Hi Interior Core, I'd like to discuss an interior project."
};
