/**
 * Coffee Wizard — Data layer.
 * ------------------------------------------------------------------
 * Single source of truth for branch / menu / gallery / contact data.
 * The UI never hardcodes products, prices or images; it reads from here.
 * Later this module can be swapped for Supabase fetches without touching
 * any rendering code (app.js only reads these same shapes).
 */

window.CoffeeWizard = (function () {
  "use strict";

  const galleryImages = {
    latte: {
      src: "assets/images/gallery-latte.jpg",
      alt: "Moody artisanal coffee shop interior with a latte in a matte black cup under warm pendant light.",
    },
    art: {
      src: "assets/images/gallery-art.jpg",
      alt: "Barista hands pouring steamed milk to craft latte art in a dimly lit setting.",
    },
    counter: {
      src: "assets/images/gallery-counter.jpg",
      alt: "Wide cinematic view of a sophisticated espresso bar counter with high-end machines.",
    },
  };

  /** Branch → ordered list of gallery image keys (4-up layout preserved). */
  const branchGalleries = {
    alexandria: ["latte", "art", "counter", "counter"],
    mansoura: ["latte", "art", "counter", "counter"],
  };

  const branches = {
    alexandria: {
      id: "alexandria",
      name: "Alexandria",
      locationNote: "Find us near the ancient library, where knowledge meets flavor.",
      phone: "+20 3 486 0000",
      tel: "+2034860000",
      whatsapp: "201003000000",
      mapsUrl: "https://www.google.com/maps/search/?api=1&query=Coffee+Wizard+Alexandria",
      facebook: "https://facebook.com/coffeewizard.alexandria",
      instagram: "https://instagram.com/coffeewizard.alexandria",
      email: "alexandria@coffeewizard.example",
      hours: "Open Daily: 7:00 AM - Midnight",
      galleryKeys: branchGalleries.alexandria,
    },

    mansoura: {
      id: "mansoura",
      name: "Mansoura",
      locationNote: "In the heart of Mansoura, where the Nile meets the perfect pour.",
      phone: "+20 50 220 0000",
      tel: "+20502200000",
      whatsapp: "201005000000",
      mapsUrl: "https://www.google.com/maps/search/?api=1&query=Coffee+Wizard+Mansoura",
      facebook: "https://facebook.com/coffeewizard.mansoura",
      instagram: "https://instagram.com/coffeewizard.mansoura",
      email: "mansoura@coffeewizard.example",
      hours: "Open Daily: 7:00 AM - Midnight",
      galleryKeys: branchGalleries.mansoura,
    },
  };

  const categories = [
    { id: "espresso", name: "Espresso" },
    { id: "brews", name: "Brews" },
  ];

  /**
   * One product entry, reusable across every branch.
   * prices: { <branchId>: <price in EGP> } — never a separate product copy.
   */
  const products = [
    {
      id: "iced-alchemy",
      categoryId: "brews",
      name: "Iced Alchemy",
      tastingNote: "Cold Brew / Amber Notes",
      image: "assets/images/product-iced-alchemy.jpg",
      alt: "A tall glass of dark iced coffee with a single clear ice cube, set on a black concrete table in a moody, dark workshop.",
      prices: { alexandria: 120, mansoura: 120 },
    },
    {
      id: "v60-single-origin",
      categoryId: "brews",
      name: "V60 Single Origin",
      tastingNote: "Ethiopia / Floral",
      image: "assets/images/product-v60.jpg",
      alt: "A matte black V60 pour-over being brewed with a sleek gooseneck kettle over dark wood, high contrast and precise.",
      prices: { alexandria: 95, mansoura: 95 },
    },
  ];

  return {
    branches,
    categories,
    products,
    galleryImages,
    defaultBranch: "alexandria",
    storageKey: "coffee-wizard-branch",
    currency: "EGP",
    pricePrefix: "LE ",
  };
})();
