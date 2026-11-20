/* ============================================================
   QALB SPICES — SITE CONFIG
   Edit this file to change the brand text, products, prices,
   shipping, payments and contact details. No other file needs
   touching for day-to-day changes.
   ============================================================ */
window.SITE = {

  brand: {
    name: 'Qalb Spices',
    short: 'Qalb',
    arabic: 'قلب',                       // "qalb" = heart
    logo: 'images/logo.png',             // replace this file with the final logo (any size, white or transparent background)
    announcement: 'Whole spices, packed fresh  ·  Free shipping over {freeShipping}'
  },

  /* Shown in the footer only when filled in. Leave '' to hide a line. */
  contact: {
    email: '',
    phone: '',
    whatsapp: '',     // digits only with country code, e.g. 919876543210
    instagram: '',    // full URL
    address: ''
  },

  /* ---------------- shop ---------------- */
  shop: {
    currency: '₹',
    locale: 'en-IN',
    freeShippingOver: 499,      // subtotal that unlocks free shipping
    shippingFlat: 49,           // charged below that

    /* Razorpay Key ID (rzp_test_… or rzp_live_…) turns on real payments.
       Leave '' for DEMO checkout: nothing is charged. */
    razorpayKeyId: '',

    /* URL that receives each finished order as JSON (POST):
       Formspree, Make/Zapier webhook, Netlify/Cloudflare function, Apps Script…
       Leave '' and orders are NOT sent anywhere. */
    orderEndpoint: ''
  },

  /* ---------------- products ----------------
     id      unique, no spaces
     art     illustration used when there is no photo:
             pepper | cardamom | clove | turmeric | chilli | powder
     image   optional photo path, e.g. 'images/turmeric.jpg' (overrides the art)
     tint    background colour behind the illustration / photo
     form    small label on the card
     sizes   pack sizes: g = grams, price = whole number in the currency above
     PRICES BELOW ARE PLACEHOLDERS — replace with real ones.            */
  products: [
    {
      id: 'turmeric',
      name: 'Whole Turmeric',
      form: 'Whole fingers',
      art: 'turmeric', image: '', tint: '#FBE6B5', defaultG: 250,
      blurb: 'Dried turmeric fingers, kept whole so the colour and earthy warmth stay locked in until you grind.',
      use: 'Crush or grind fresh for curries, golden milk and marinades.',
      sizes: [ { g: 100, price: 59 }, { g: 250, price: 129 }, { g: 500, price: 239 }, { g: 1000, price: 449 } ]
    },
    {
      id: 'chilli',
      name: 'Dry Red Chillies',
      form: 'Whole · Dry',
      art: 'chilli', image: '', tint: '#F8D3C8', defaultG: 250,
      blurb: 'Whole dried red chillies with their stems on. Deep colour, clean heat and a smoky finish.',
      use: 'Temper in hot oil for tadkas, chutneys and pickles.',
      sizes: [ { g: 100, price: 59 }, { g: 250, price: 129 }, { g: 500, price: 239 }, { g: 1000, price: 449 } ]
    },
    {
      id: 'pepper',
      name: 'Black Pepper',
      form: 'Whole peppercorns',
      art: 'pepper', image: '', tint: '#EFE4D6', defaultG: 100,
      blurb: 'Bold, aromatic peppercorns with a sharp bite and a warm, woody finish.',
      use: 'Crack fresh over eggs, soups and grills, or grind into masalas.',
      sizes: [ { g: 100, price: 149 }, { g: 250, price: 349 }, { g: 500, price: 649 } ]
    },
    {
      id: 'cardamom',
      name: 'Green Cardamom',
      form: 'Whole pods',
      art: 'cardamom', image: '', tint: '#E4EBCB', defaultG: 50,
      blurb: 'Fragrant green pods packed with sweet, floral, citrusy aroma.',
      use: 'Crush into chai, biryani, kheer and sweets.',
      sizes: [ { g: 50, price: 199 }, { g: 100, price: 379 }, { g: 250, price: 899 } ]
    },
    {
      id: 'clove',
      name: 'Cloves',
      form: 'Whole',
      art: 'clove', image: '', tint: '#EBDACB', defaultG: 50,
      blurb: 'Plump, oil-rich cloves with an intense, sweet-pungent warmth.',
      use: 'Add whole to rice, curries, teas and garam masala.',
      sizes: [ { g: 50, price: 99 }, { g: 100, price: 179 }, { g: 250, price: 429 } ]
    },
    {
      id: 'powder',
      name: 'Red Chilli Powder',
      form: 'Powder',
      art: 'powder', image: '', tint: '#F9D9C7', defaultG: 250,
      blurb: 'Bright red, finely ground chilli powder for colour and everyday heat.',
      use: 'Stir into dals, gravies, rubs and marinades.',
      sizes: [ { g: 100, price: 69 }, { g: 250, price: 149 }, { g: 500, price: 279 } ]
    }
  ]
};
