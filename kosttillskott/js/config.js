/* Butiksinställningar – ändra här för namn, frakt, betalsätt, rabattkoder och moms. */
window.SHOP = {
  name: "Sundla",
  demo: true, // visar "demobutik"-texter. Sätt till false när riktig betalning är kopplad.
  tagline: "Kosttillskott med koll på innehållet",
  currency: "SEK",
  email: "kundservice@sundla.example",
  phone: "08-123 456 78",
  company: "Sundla AB (demobutik)",
  orgNr: "000000-0000",
  address: "Exempelgatan 1, 123 45 Stockholm",

  // Kosttillskott är livsmedel. Livsmedelsmomsen är tillfälligt sänkt till 6 %
  // (1 april 2026–31 december 2027), annars 12 %. Kontrollera mot Skatteverket.
  vatRate: 0.06,

  freeShippingThreshold: 499,
  subscriptionDiscount: 0.1,
  subscriptionIntervals: [30, 60, 90],
  cutoffHour: 15, // beställ före kl. 15 på vardagar = skickas samma dag
  maxCompare: 4,
  pageSize: 12,

  shipping: [
    { id: "ombud", name: "Hämta hos ombud", carrier: "PostNord", price: 49, freeOver: 499, days: [1, 3], desc: "Välj ombud nära dig. Avisering via sms." },
    { id: "skap", name: "Paketskåp", carrier: "Instabox", price: 39, freeOver: 499, days: [1, 2], desc: "Hämta dygnet runt i ett paketskåp." },
    { id: "hem", name: "Hemleverans kväll", carrier: "Budbee", price: 69, freeOver: 799, days: [1, 2], desc: "Leverans till dörren 17–22. Gratis över 799 kr." },
    { id: "express", name: "Express nästa vardag", carrier: "DHL", price: 129, freeOver: null, days: [1, 1], desc: "Beställ före 15 – hemma nästa vardag före 12." }
  ],

  payments: [
    { id: "kort", name: "Kort", desc: "Visa, Mastercard, American Express" },
    { id: "swish", name: "Swish", desc: "Betala direkt med mobilen" },
    { id: "faktura", name: "Faktura", desc: "Betala inom 30 dagar, utan avgift" },
    { id: "delbetala", name: "Delbetala", desc: "Dela upp på 3 månader räntefritt" }
  ],

  // type: percent | category | freeship. minTotal i kronor (efter kampanjer).
  discountCodes: {
    VALKOMMEN10: { type: "percent", value: 0.1, label: "10 % på hela ordern" },
    SUNDLA20: { type: "percent", value: 0.2, minTotal: 800, label: "20 % vid köp över 800 kr" },
    TRANING15: { type: "category", value: 0.15, categories: ["protein", "traning"], label: "15 % på protein och träning" },
    FRIFRAKT: { type: "freeship", label: "Fri frakt (ej express)" }
  },

  campaigns: {
    "3for2": { label: "3 för 2", desc: "Köp tre vitaminer – betala för två. Billigaste ingår." }
  }
};
