/**
 * Artisan Mart catalog — SOURCE-OBSERVED ONLY.
 * Every value below was read from the Oct 22 2026 research report or the
 * user-supplied reference screenshots and authorized KOLE product imports. `null` means the value was not
 * observed and must not be guessed. User authorized supplier image reuse on
 * 2026-11-04. Imported prices are supplier prices multiplied by two.
 * Replace this module with a live feed later; current stock is a dated snapshot.
 */
export type Badge = "new" | "closeout" | "hot" | "reduced" | "special";
export type CollectionSlug = "new-arrivals" | "best-sellers" | "reduced-price" | "closeouts" | "imports";

export interface PurchaseRules {
  lot: number; // permitted piece-order increment
  moq: number; // minimum piece quantity
  caseQty: number; // pieces per case in the purchase control
  physicalCase: number; // case pack in specifications (may differ!)
  innerPack: number;
}

export interface Product {
  sku: string;
  title: string;
  titleTruncated?: boolean; // reference only showed a clipped title
  originalPrice?: number;
  sourceUrl?: string;
  sourceCheckedAt?: string;
  californiaWarningText?: string | null;
  price: number | null;
  stock: number | null;
  badges: Badge[];
  collections: CollectionSlug[];
  category: string | null;
  subcategory: string | null;
  images: string[]; // empty until authorized media is supplied
  description: string | null;
  upc: string | null;
  specs: Record<string, string>;
  rules: PurchaseRules | null; // null = lot/MOQ not verified, cannot be purchased
  californiaWarning?: boolean;
  newestRank?: number;
}

const p = (x: Partial<Product> & Pick<Product, "sku" | "title">): Product => ({
  price: null, stock: null, badges: [], collections: [], category: null, subcategory: null,
  images: [], description: null, upc: null, specs: {}, rules: null, ...x,
});

const LEGACY_PRODUCTS: Product[] = [
  // Verified PDP examples (report section 8)
  p({ sku: "AW213", title: "Paint-Sation Paint Pod in Assorted Colors", price: 0.79, stock: 2611, badges: ["new", "closeout"], collections: ["new-arrivals", "closeouts"],
      rules: { lot: 9, moq: 36, caseQty: 36, physicalCase: 9, innerPack: 1 }, specs: { "Case Pack": "9", "Inner Pack": "1" } }),
  p({ sku: "MT500", title: "Multi-Purpose Nylon Rope", price: 1.65, stock: 7479, badges: ["hot"], collections: ["best-sellers"], upc: "731015131334", californiaWarning: true,
      rules: { lot: 24, moq: 24, caseQty: 144, physicalCase: 144, innerPack: 24 },
      specs: { "Case Pack": "144", "Inner Pack": "24", "Case Dimensions": "16.3 x 12.3 x 15.1 in", "Case Weight": "22.799952 lb", "Case Cube": "1.75 cu ft", "Weight Per Piece": "0.158333" } }),
  p({ sku: "AA636", title: "40 Count Lavender Incense Sticks", price: 0.35, stock: 100490, badges: ["reduced"], collections: ["closeouts", "reduced-price"],
      rules: { lot: 6, moq: 66, caseQty: 66, physicalCase: 48, innerPack: 6 }, specs: { "Case Pack": "48", "Inner Pack": "6" } }),
  p({ sku: "CB163", title: "Folding Table With Cup Holders and Carry Bag", price: 11.0, stock: 1100, badges: ["hot"], collections: ["best-sellers"], californiaWarning: true,
      rules: { lot: 3, moq: 3, caseQty: 8, physicalCase: 8, innerPack: 1 }, specs: { "Case Pack": "8", "Inner Pack": "1" } }),

  // New Arrivals screenshot (Newest Descending order)
  ...["AW314", "AW313", "AW312", "AW311"].map((sku, i) => p({ sku, title: "Jamie Love I Am Beautiful Mini Childrens Backpack in", titleTruncated: true, price: 4.4,
      stock: [1948, 1944, 1996, 2092][i] ?? null, badges: ["new", "closeout"], collections: ["new-arrivals", "closeouts"], newestRank: 10 + i })),
  p({ sku: "AV955", title: 'Avocatt 10" Brown Hedgehog Plush Toy', price: 3.85, stock: 216, badges: ["new", "closeout"], collections: ["new-arrivals", "closeouts"], newestRank: 14 }),
  p({ sku: "AV949", title: 'Avocatt 10" Blue Rhino Plush Toy', price: 3.85, stock: 408, badges: ["new", "closeout"], collections: ["new-arrivals", "closeouts"], newestRank: 15 }),
  p({ sku: "AV938", title: 'Avocatt 10" Fuzzy Sitting Sloth Plush Toy', price: 3.85, stock: 690, badges: ["new", "closeout"], collections: ["new-arrivals", "closeouts"], newestRank: 16 }),
  p({ sku: "AV927", title: 'Avocatt 10" Yellow Sitting Giraffe Plush Toy', stock: 216, badges: ["new", "closeout"], collections: ["new-arrivals", "closeouts"], newestRank: 17 }),
  p({ sku: "AV921", title: 'Avocatt 9.5" Sitting RaccOon Plush Toy', price: 3.85, stock: 1000, badges: ["new", "closeout"], collections: ["new-arrivals", "closeouts"], newestRank: 18 }),
  p({ sku: "AV915", title: 'Avocatt 9.5" Sitting Dog Plush Toy', stock: 104, badges: ["new", "closeout"], collections: ["new-arrivals", "closeouts"], newestRank: 19 }),
  p({ sku: "AV907", title: 'Avocatt 9" Brown Chicken Plush Toy', stock: 564, badges: ["new", "closeout"], collections: ["new-arrivals", "closeouts"], newestRank: 20 }),
  p({ sku: "AV903", title: 'Avocatt 9" Platypus Plush Toy', stock: 654, badges: ["new", "closeout"], collections: ["new-arrivals", "closeouts"], newestRank: 21 }),
  // Named by the user; no price/stock observed
  p({ sku: "AW400", title: "Sassi Press On Nails with Adhesive Tabs in Starlight", badges: ["new"], collections: ["new-arrivals"], category: "Cosmetics", newestRank: 1 }),
  p({ sku: "AW401", title: "Sassi Press On Nails with Adhesive Tabs in Touch of Gold", badges: ["new"], collections: ["new-arrivals"], category: "Cosmetics", newestRank: 2 }),
  p({ sku: "AW402", title: "Sassi Press On Nails with Adhesive Tabs in Wavy Baby", badges: ["new"], collections: ["new-arrivals"], category: "Cosmetics", newestRank: 0 }),
  p({ sku: "AW399", title: "Sassi Professional Quality White Emery Block", badges: ["new"], collections: ["new-arrivals"], category: "Cosmetics", newestRank: 3 }),

  // Best Sellers screenshot
  p({ sku: "AJ117", title: "Flexible Solar Colorful LED Light Bulb Branches", price: 4.95, stock: 2518, badges: ["hot"], collections: ["best-sellers"] }),
  p({ sku: "OD985", title: "9 LED Bicycle Light Countertop Display", price: 3.85, stock: 3206, badges: ["reduced"], collections: ["best-sellers", "reduced-price"] }),
  p({ sku: "AL981", title: 'Winifred and Lily 16"x12" Grey and Black Two Tone', titleTruncated: true, price: 3.05, stock: 4035, badges: ["reduced"], collections: ["best-sellers", "reduced-price"] }),
  p({ sku: "OS936", title: "Dish Scrub Brush Set", price: 3.3, stock: 3597, badges: ["hot"], collections: ["best-sellers"] }),
  p({ sku: "GA133", title: "Macrame Hanging Cat Hammock Indoor Cat Bed", stock: 711, badges: ["hot"], collections: ["best-sellers"] }),
  p({ sku: "AL621", title: 'Weather Zone 39" Folding Umbrella with Push Open', stock: 3041, badges: ["reduced"], collections: ["best-sellers", "reduced-price"] }),
  p({ sku: "DI613", title: "Rubber Ring with Rope Dog Pull Toy", stock: 3666, badges: ["hot"], collections: ["best-sellers"] }),
  p({ sku: "AH323", title: "Racing Skulls Reflective Stickers", stock: 36577, badges: ["closeout"], collections: ["best-sellers", "closeouts"] }),
  p({ sku: "HB106", title: "Scrub Brush Set", stock: 8253, badges: ["special"], collections: ["best-sellers"] }),
  p({ sku: "GA032", title: '31" x 80" Double Cloth Stripe Small Hammock', stock: 1294, badges: ["hot"], collections: ["best-sellers"] }),

  // Closeouts screenshot
  p({ sku: "AO130", title: "Prime Audio Shine Bluetooth Headphones", price: 4.4, stock: 26210, badges: ["closeout"], collections: ["closeouts"] }),
  p({ sku: "AB843", title: "HYPE Cat Ear LED Headphones with Mic in", titleTruncated: true, price: 3.3, stock: 23582, badges: ["closeout"], collections: ["closeouts"] }),
  p({ sku: "AL297", title: "Warm Knit Kids Hat in Assorted Colors", price: 0.95, stock: 39617, badges: ["closeout"], collections: ["closeouts"] }),
  p({ sku: "AG994", title: "1 Pack Fuzzy Socks in Assorted Designs Size 9-11", price: 0.5, stock: 61036, badges: ["reduced"], collections: ["closeouts", "reduced-price"] }),
  p({ sku: "AK760", title: "Hello Hobby Washable 12 Color Face & Body Paint Set", price: 0.95, stock: 22356, badges: ["reduced"], collections: ["closeouts", "reduced-price"] }),
  p({ sku: "AF901", title: "Hand Fidgetz Spinner in Assorted Colors & Designs in", titleTruncated: true, price: 0.55, stock: 36604, badges: ["closeout"], collections: ["closeouts"] }),
  p({ sku: "AM422", title: "Reusable Shopping Tote Bag in Assorted Fashion Prints", stock: 47629, badges: ["reduced"], collections: ["closeouts", "reduced-price"] }),
  p({ sku: "AA634", title: "40 Count Dragon Blood Incense Sticks", stock: 55839, badges: ["reduced"], collections: ["closeouts", "reduced-price"] }),
  p({ sku: "AJ094", title: '6.25" Splashproof Camouflage Wireless', titleTruncated: true, stock: 3291, badges: ["closeout"], collections: ["closeouts"] }),
  p({ sku: "AH790", title: "40 Count Assorted Scents Incense Sticks", stock: 44412, badges: ["reduced"], collections: ["closeouts", "reduced-price"] }),
  p({ sku: "AJ092", title: '6.25" Wireless Splashproof Portable Speaker with', titleTruncated: true, stock: 3091, badges: ["closeout"], collections: ["closeouts"] }),
];

export const IMPORTED_NEW_ARRIVALS: Product[] = [
  {
    "sku": "DA883",
    "title": "Black LED Vanity Mirror with Adjustable Brightness Folding Panels and Storage Tray",
    "price": 14.5,
    "originalPrice": 7.25,
    "sourceUrl": "https://www.koleimports.com/black-led-vanity-mirror-with-adjustable-brightness-folding-panels-and-storage-tray-da883",
    "sourceCheckedAt": "2026-11-04",
    "stock": 780,
    "badges": [
      "new",
      "closeout"
    ],
    "collections": [
      "new-arrivals",
      "imports",
      "closeouts"
    ],
    "category": "Cosmetics",
    "subcategory": "Cosmetic Mirrors",
    "images": [
      "images/products/da883-1.webp",
      "images/products/da883-2.webp",
      "images/products/da883-3.webp"
    ],
    "description": "The Vanityz LED Vanity Mirror provides bright, adjustable lighting and versatile magnification for everyday makeup application, skincare, grooming, and detailed beauty routines. Designed with LED lights and a dimmer touch sensor, the mirror allows users to hold the touch button to adjust brightness for a customized view. Its tri-fold design features folding side panels for convenient storage and travel, along with two 3X magnified mirrors for precise detailing and a 2X magnified side mirror for closer viewing. The rotating kickstand offers up to 180° tilt, making it easy to adjust the mirror to a comfortable viewing angle. Measuring approximately 9.5\" x 13.5\" when open and 6.9\" x 4.2\" x 11.5\" when closed, its compact design works well on vanities, bathroom counters, dressers, or while traveling. The mirror features an ON/OFF button, LED illumination, dimmable touch control, folding side panels, battery chamber, and operates with 4 AAA batteries (not included). Practical for teens, adults, makeup enthusiasts, beauty professionals, or anyone looking for better visibility while applying cosmetics, styling hair, inserting contact lenses, shaping brows, or completing daily grooming.,Black LED Vanity Mirror with Adjustable Brightness Folding Panels and Storage Tray,",
    "upc": "605928020293",
    "specs": {
      "Case Pack Quantity": "10 units",
      "Inner Pack Quantity": "1 units",
      "Upc Code": "605928020293",
      "Case Pack Dimensions": "15.5 \" (L) x13.3 \" (W) x12.4 \"(H)",
      "Case Weight": "16.95 lb",
      "Case Cube": "1.48 cubic feet",
      "Per Piece Weight": "1.695000",
      "Category": "Cosmetics",
      "Subcategory": "Cosmetic Mirrors"
    },
    "rules": {
      "lot": 4,
      "moq": 4,
      "caseQty": 10,
      "physicalCase": 10,
      "innerPack": 1
    },
    "californiaWarning": true,
    "californiaWarningText": "WARNING: Cancer and Reproductive Harm – www.P65Warnings.ca.gov",
    "newestRank": 1
  },
  {
    "sku": "DA881",
    "title": "Pink LED Vanity Mirror with Adjustable Brightness Tilt Function and Storage Tray",
    "price": 11.0,
    "originalPrice": 5.5,
    "sourceUrl": "https://www.koleimports.com/pink-led-vanity-mirror-with-adjustable-brightness-tilt-function-and-storage-tray-da881",
    "sourceCheckedAt": "2026-11-04",
    "stock": 2000,
    "badges": [
      "new",
      "closeout"
    ],
    "collections": [
      "new-arrivals",
      "imports",
      "closeouts"
    ],
    "category": "Cosmetics",
    "subcategory": "Cosmetic Mirrors",
    "images": [
      "images/products/da881-1.webp",
      "images/products/da881-2.webp",
      "images/products/da881-3.webp"
    ],
    "description": "Bring bright, convenient lighting to any beauty routine with this LED Vanity Mirror with Adjustable Brightness, 180° Tilt, and Storage Tray. Designed for everyday makeup application, skincare, grooming, and getting ready, the mirror features bright LED lights with a dimmable touch sensor that lets you adjust the brightness to suit different rooms and lighting conditions. The 180° tilting design makes it easy to position the mirror at a comfortable viewing angle, while the built-in storage tray measures approximately 6.25\" x 3.25\" and provides a convenient spot for makeup, jewelry, and other small accessories. The mirror measures approximately 6.5\" W x 8.9\" H and features a compact tabletop design that fits easily on vanities, bathroom counters, dressers, and desks. An on/off power button and battery chamber are conveniently located on the back. Powered by 4 AA batteries not included, the cordless design makes it easy to place and use wherever needed. Packaged in a retail-ready color box measuring approximately 6.90\" x 2.35\" x 11.5\".,Pink LED Vanity Mirror with Adjustable Brightness Tilt Function and Storage Tray,",
    "upc": "605928020163",
    "specs": {
      "Case Pack Quantity": "10 units",
      "Inner Pack Quantity": "1 units",
      "Upc Code": "605928020163",
      "Case Pack Dimensions": "14.3 \" (L) x13.3 \" (W) x12.4 \"(H)",
      "Case Weight": "11.2 lb",
      "Case Cube": "1.36 cubic feet",
      "Per Piece Weight": "1.120000",
      "Category": "Cosmetics",
      "Subcategory": "Cosmetic Mirrors"
    },
    "rules": {
      "lot": 5,
      "moq": 5,
      "caseQty": 10,
      "physicalCase": 10,
      "innerPack": 1
    },
    "californiaWarning": true,
    "californiaWarningText": "WARNING: Cancer and Reproductive Harm – www.P65Warnings.ca.gov",
    "newestRank": 2
  },
  {
    "sku": "AV822",
    "title": "Animaniacs Wakko Graphic Black and White Mesh Trucker Hat",
    "price": 3.9,
    "originalPrice": 1.95,
    "sourceUrl": "https://www.koleimports.com/animaniacs-wakko-graphic-black-and-white-mesh-trucker-hat-av822",
    "sourceCheckedAt": "2026-11-04",
    "stock": 403,
    "badges": [
      "new",
      "closeout"
    ],
    "collections": [
      "new-arrivals",
      "imports",
      "closeouts"
    ],
    "category": "Apparel",
    "subcategory": "Hats",
    "images": [
      "images/products/av822-1.webp",
      "images/products/av822-2.webp",
      "images/products/av822-3.webp"
    ],
    "description": "Bring nostalgic cartoon energy to any casual look with the Animaniacs Wakko Graphic Black and White Mesh Trucker Hat. The crisp white front panel features a colorful Wakko graphic with bold Animaniacs lettering for a fun throwback style, while the black curved bill and matching mesh back create a classic two-tone trucker look. Breathable mesh panels help keep you cool, and the adjustable snapback closure makes it easy to customize the fit. Perfect for Animaniacs fans, retro cartoon lovers, and anyone who likes playful accessories with a little personality. Comes packaged with an Animaniacs hang tag.,Animaniacs Wakko Graphic Black and White Mesh Trucker Hat,",
    "upc": "676092700120",
    "specs": {
      "Case Pack Quantity": "144 units",
      "Inner Pack Quantity": "24 units",
      "Upc Code": "676092700120",
      "Case Pack Dimensions": "16.5 \" (L) x24.2 \" (W) x23.3 \"(H)",
      "Case Weight": "31.000032 lb",
      "Case Cube": "5.38 cubic feet",
      "Per Piece Weight": "0.215278",
      "Category": "Apparel",
      "Subcategory": "Hats"
    },
    "rules": {
      "lot": 24,
      "moq": 24,
      "caseQty": 144,
      "physicalCase": 144,
      "innerPack": 24
    },
    "californiaWarning": false,
    "californiaWarningText": null,
    "newestRank": 3
  },
  {
    "sku": "AV821",
    "title": "Animaniacs Logo Light Blue Mesh Trucker Hat",
    "price": 3.9,
    "originalPrice": 1.95,
    "sourceUrl": "https://www.koleimports.com/animaniacs-logo-light-blue-mesh-trucker-hat-av821",
    "sourceCheckedAt": "2026-11-04",
    "stock": 922,
    "badges": [
      "new",
      "closeout"
    ],
    "collections": [
      "new-arrivals",
      "imports",
      "closeouts"
    ],
    "category": "Apparel",
    "subcategory": "Hats",
    "images": [
      "images/products/av821-1.webp",
      "images/products/av821-2.webp",
      "images/products/av821-3.webp"
    ],
    "description": "Bring back the zany fun of a classic cartoon favorite with the Animaniacs Logo Light Blue Mesh Trucker Hat. Featuring Yakko, Wakko, and Dot popping out from the colorful Animaniacs logo, this playful cap adds instant nostalgic personality to any casual outfit. The light blue front panel and curved bill create a fresh, easygoing look, while white mesh back panels provide breathable comfort for everyday wear. An adjustable snapback closure helps create a comfortable, customizable fit. Perfect for Animaniacs fans, retro cartoon lovers, and anyone who wants a fun statement accessory.,Animaniacs Logo Light Blue Mesh Trucker Hat,",
    "upc": "676092700113",
    "specs": {
      "Case Pack Quantity": "144 units",
      "Inner Pack Quantity": "24 units",
      "Upc Code": "676092700113",
      "Case Pack Dimensions": "16 \" (L) x24.4 \" (W) x23.4 \"(H)",
      "Case Weight": "14.4 lb",
      "Case Cube": "5.29 cubic feet",
      "Per Piece Weight": "0.100000",
      "Category": "Apparel",
      "Subcategory": "Hats"
    },
    "rules": {
      "lot": 24,
      "moq": 24,
      "caseQty": 144,
      "physicalCase": 144,
      "innerPack": 24
    },
    "californiaWarning": false,
    "californiaWarningText": null,
    "newestRank": 4
  },
  {
    "sku": "DA850",
    "title": "Weekly Pill Organizer with Note Card in Carry Case",
    "price": 9.9,
    "originalPrice": 4.95,
    "sourceUrl": "https://www.koleimports.com/weekly-pill-organizer-with-note-card-in-carry-case-da850",
    "sourceCheckedAt": "2026-11-04",
    "stock": 6000,
    "badges": [
      "new"
    ],
    "collections": [
      "new-arrivals",
      "imports"
    ],
    "category": "Health Care",
    "subcategory": "Pill Boxes & Splitters",
    "images": [
      "images/products/da850-1.webp",
      "images/products/da850-2.webp",
      "images/products/da850-3.webp"
    ],
    "description": "This practical organizer provides a convenient way to separate pills by day while keeping everything neatly stored in one compact case. Featuring a 7-day pill organizer with brightly colored compartments, this set makes it easy to sort and identify daily medications, vitamins, and supplements throughout the week. The colorful compartments help distinguish each day, while the included note card provides a convenient space for recording medication information, reminders, or personal notes. The organizer fits securely inside a black carrying case, helping keep its contents protected and organized during everyday use. The compact, portable design makes this weekly medication organizer ideal for home use, travel, work, vacations, and daily routines. Its convenient carrying case allows users to store their medications discreetly in a purse, backpack, luggage, or bedside drawer. The combination of colorful daily compartments and a dedicated note card makes it a useful accessory for maintaining an organized medication schedule. Comes individually packaged in a printed hanging retail box, featuring a product image that showcases the colorful pill compartments, note card, and black carrying case. The packaging includes a built-in hang tab for convenient peg-hook merchandising and displays the product's organizational features, making it suitable for pharmacies, health and wellness departments, convenience stores, discount retailers, and general merchandise displays.,Weekly Pill Organizer with Note Card in Carry Case,",
    "upc": "731015332526",
    "specs": {
      "Case Pack Quantity": "24 units",
      "Inner Pack Quantity": "12 units",
      "Upc Code": "731015332526",
      "Case Pack Dimensions": "17.1 \" (L) x10.8 \" (W) x11.9 \"(H)",
      "Case Weight": "12 lb",
      "Case Cube": "1.27 cubic feet",
      "Per Piece Weight": "0.500000",
      "Category": "Health Care",
      "Subcategory": "Pill Boxes & Splitters"
    },
    "rules": {
      "lot": 12,
      "moq": 12,
      "caseQty": 24,
      "physicalCase": 24,
      "innerPack": 12
    },
    "californiaWarning": true,
    "californiaWarningText": "WARNING: Cancer and Reproductive Harm – www.P65Warnings.ca.gov",
    "newestRank": 5
  },
  {
    "sku": "AW300",
    "title": "Mochic 30W Dual Port USB A and USB C Wall Charger in White with 4 Foot USB A to C Cable",
    "price": 7.7,
    "originalPrice": 3.85,
    "sourceUrl": "https://www.koleimports.com/mochic-30w-dual-port-usb-a-and-usb-c-wall-charger-in-white-with-4-foot-usb-a-to-c-cable-aw300",
    "sourceCheckedAt": "2026-11-04",
    "stock": 2992,
    "badges": [
      "new",
      "closeout"
    ],
    "collections": [
      "new-arrivals",
      "imports",
      "closeouts"
    ],
    "category": "Electronics",
    "subcategory": "Cell Phone Accessories",
    "images": [
      "images/products/aw300-1.webp",
      "images/products/aw300-2.webp",
      "images/products/aw300-3.webp"
    ],
    "description": "Stay connected with the Mochic 30W Dual Port USB-A and USB-C Wall Charging Bundle. This convenient set includes a compact 30W wall charger equipped with USB-A and USB-C ports, allowing you to charge two compatible devices from a single wall outlet. Features TruFast charging technology through the USB-C port, delivering up to 4 times faster charging compared to a standard 5W charger when used with compatible devices. Includes a 4-foot USB-A to USB-C charging and syncing cable featuring a durable, tangle-resistant braided exterior and metallic connector housings. The included cable tie makes organization and storage easy. Ideal for charging compatible smartphones, tablets, and other USB-C devices at home, in the office, or while traveling. Features a sleek white finish. Comes packaged in a retail display box with a clear window and hanging loop.,Mochic 30W Dual Port USB A and USB C Wall Charger in White with 4 Foot USB A to C Cable,",
    "upc": "811725026578",
    "specs": {
      "Case Pack Quantity": "24 units",
      "Inner Pack Quantity": "6 units",
      "Upc Code": "811725026578",
      "Case Pack Dimensions": "8.1 \" (L) x20.9 \" (W) x10 \"(H)",
      "Case Weight": "9.199992 lb",
      "Case Cube": "0.98 cubic feet",
      "Per Piece Weight": "0.383333",
      "Category": "Electronics",
      "Subcategory": "Cell Phone Accessories"
    },
    "rules": {
      "lot": 6,
      "moq": 6,
      "caseQty": 24,
      "physicalCase": 24,
      "innerPack": 6
    },
    "californiaWarning": false,
    "californiaWarningText": null,
    "newestRank": 6
  },
  {
    "sku": "AW298",
    "title": "Mochic 30W Dual Port USB A and USB C Car Charger in Black with 4 Foot USB A to C Cable",
    "price": 6.6,
    "originalPrice": 3.3,
    "sourceUrl": "https://www.koleimports.com/mochic-30w-dual-port-usb-a-and-usb-c-car-charger-in-black-with-4-foot-usb-a-to-c-cable-aw298",
    "sourceCheckedAt": "2026-11-04",
    "stock": 1896,
    "badges": [
      "new",
      "closeout"
    ],
    "collections": [
      "new-arrivals",
      "imports",
      "closeouts"
    ],
    "category": "Electronics",
    "subcategory": "Cell Phone Accessories",
    "images": [
      "images/products/aw298-1.webp",
      "images/products/aw298-2.webp",
      "images/products/aw298-3.webp"
    ],
    "description": "Keep your devices charged while traveling with the Mochic 30W Dual Port USB-A and USB-C Car Charging Bundle. This convenient set includes a 30W car charger featuring both USB-A and USB-C ports, allowing you to charge two compatible devices from a single vehicle power outlet. Features TruFast charging technology through the USB-C port, delivering up to 4 times faster charging compared to a standard 5W charger when used with compatible devices. Includes a 4-foot USB-A to USB-C charging and syncing cable with a durable, tangle-resistant braided exterior and metallic connector housings. The included cable tie allows for convenient organization and storage. Ideal for charging compatible smartphones, tablets, and other USB-C devices on the go. Features a sleek black finish. Comes packaged in a retail display box with a clear window and hanging loop.,Mochic 30W Dual Port USB A and USB C Car Charger in Black with 4 Foot USB A to C Cable,",
    "upc": "811725028329",
    "specs": {
      "Case Pack Quantity": "24 units",
      "Inner Pack Quantity": "6 units",
      "Upc Code": "811725028329",
      "Case Pack Dimensions": "8.2 \" (L) x20.8 \" (W) x10 \"(H)",
      "Case Weight": "7.750008 lb",
      "Case Cube": "0.99 cubic feet",
      "Per Piece Weight": "0.322917",
      "Category": "Electronics",
      "Subcategory": "Cell Phone Accessories"
    },
    "rules": {
      "lot": 6,
      "moq": 12,
      "caseQty": 24,
      "physicalCase": 24,
      "innerPack": 6
    },
    "californiaWarning": false,
    "californiaWarningText": null,
    "newestRank": 7
  },
  {
    "sku": "AW297",
    "title": "Mochic 30W Dual Port USB A and USB C Car Charger in Black with 4 Foot USB C to C Cable",
    "price": 7.7,
    "originalPrice": 3.85,
    "sourceUrl": "https://www.koleimports.com/mochic-30w-dual-port-usb-a-and-usb-c-car-charger-in-black-with-4-foot-usb-c-to-c-cable-aw297",
    "sourceCheckedAt": "2026-11-04",
    "stock": 2518,
    "badges": [
      "new",
      "closeout"
    ],
    "collections": [
      "new-arrivals",
      "imports",
      "closeouts"
    ],
    "category": "Electronics",
    "subcategory": "Cell Phone Accessories",
    "images": [
      "images/products/aw297-1.webp",
      "images/products/aw297-2.webp",
      "images/products/aw297-3.webp"
    ],
    "description": "Stay powered on the road with the Mochic 30W Dual Port USB-A and USB-C Car Charging Bundle. This convenient set includes a 30W car charger with USB-A and USB-C ports, allowing you to charge two compatible devices from a single vehicle power outlet. Features TruFast charging technology through the USB-C port, providing up to 4 times faster charging compared to a standard 5W charger when used with compatible devices. Includes a 4-foot USB-C to USB-C charging and syncing cable with a strong, tangle-resistant braided exterior and metallic connector housings. The included cable tie keeps the cord neatly organized when not in use. Ideal for charging compatible smartphones, tablets, and other USB-C devices while traveling. Features a sleek black finish. Comes packaged in a retail display box with a clear window and hanging loop.,Mochic 30W Dual Port USB A and USB C Car Charger in Black with 4 Foot USB C to C Cable,",
    "upc": "811725028367",
    "specs": {
      "Case Pack Quantity": "24 units",
      "Inner Pack Quantity": "6 units",
      "Upc Code": "811725028367",
      "Case Pack Dimensions": "8.3 \" (L) x20.7 \" (W) x9.9 \"(H)",
      "Case Weight": "7.699992 lb",
      "Case Cube": "0.98 cubic feet",
      "Per Piece Weight": "0.320833",
      "Category": "Electronics",
      "Subcategory": "Cell Phone Accessories"
    },
    "rules": {
      "lot": 6,
      "moq": 6,
      "caseQty": 24,
      "physicalCase": 24,
      "innerPack": 6
    },
    "californiaWarning": false,
    "californiaWarningText": null,
    "newestRank": 8
  },
  {
    "sku": "AW296",
    "title": "Mochic 30W Dual Port USB A and USB C Car Charger in Black",
    "price": 3.9,
    "originalPrice": 1.95,
    "sourceUrl": "https://www.koleimports.com/mochic-30w-dual-port-usb-a-and-usb-c-car-charger-in-black-aw296",
    "sourceCheckedAt": "2026-11-04",
    "stock": 3496,
    "badges": [
      "new",
      "closeout"
    ],
    "collections": [
      "new-arrivals",
      "imports",
      "closeouts"
    ],
    "category": "Electronics",
    "subcategory": "Cell Phone Accessories",
    "images": [
      "images/products/aw296-1.webp",
      "images/products/aw296-2.webp",
      "images/products/aw296-3.webp"
    ],
    "description": "Keep your devices charged while on the road with the Mochic 30W Dual Port USB-A and USB-C Car Charger in Black. Designed for convenient and efficient charging, this compact car charger features both a USB-A port and a USB-C port, allowing you to charge two compatible devices from a single vehicle power outlet. Features TruFast charging technology through the USB-C port, delivering up to 4 times faster charging compared to a standard 5W charger when used with compatible devices. The 30W charging capability makes it ideal for smartphones, tablets, and other USB-powered devices. Its compact, lightweight design fits conveniently into a vehicle's 12V accessory socket without taking up unnecessary space. Features a sleek black finish with metallic contact points. Comes packaged in a retail display box with a clear window and hanging loop.,Mochic 30W Dual Port USB A and USB C Car Charger in Black,",
    "upc": "811725028343",
    "specs": {
      "Case Pack Quantity": "24 units",
      "Inner Pack Quantity": "6 units",
      "Upc Code": "811725028343",
      "Case Pack Dimensions": "6.8 \" (L) x17.7 \" (W) x9.1 \"(H)",
      "Case Weight": "5.85 lb",
      "Case Cube": "0.63 cubic feet",
      "Per Piece Weight": "0.243750",
      "Category": "Electronics",
      "Subcategory": "Cell Phone Accessories"
    },
    "rules": {
      "lot": 6,
      "moq": 12,
      "caseQty": 24,
      "physicalCase": 24,
      "innerPack": 6
    },
    "californiaWarning": false,
    "californiaWarningText": null,
    "newestRank": 9
  },
  {
    "sku": "AW295",
    "title": "Mochic 30W Dual Port USB A and USB C Wall Charger in White",
    "price": 5.5,
    "originalPrice": 2.75,
    "sourceUrl": "https://www.koleimports.com/mochic-30w-dual-port-usb-a-and-usb-c-wall-charger-in-white-aw295",
    "sourceCheckedAt": "2026-11-04",
    "stock": 5584,
    "badges": [
      "new",
      "closeout"
    ],
    "collections": [
      "new-arrivals",
      "imports",
      "closeouts"
    ],
    "category": "Electronics",
    "subcategory": "Cell Phone Accessories",
    "images": [
      "images/products/aw295-1.webp",
      "images/products/aw295-2.webp",
      "images/products/aw295-3.webp"
    ],
    "description": "Keep your devices powered with the Mochic 30W Dual Port USB-A and USB-C Wall Charger in White. Designed for convenient and efficient charging, this compact wall adapter features both a USB-A port and a USB-C port, allowing you to charge two compatible devices from a single outlet. Features TruFast charging technology through the USB-C port, delivering up to 4 times faster charging compared to a standard 5W charger when used with compatible devices. The 30W charging capability makes it ideal for smartphones, tablets, and other USB-powered devices. Its lightweight, compact design makes it convenient for use at home, in the office, or while traveling. Features a standard two-prong wall plug and a sleek white finish. Comes packaged in a retail display box with a clear window and hanging loop.,Mochic 30W Dual Port USB A and USB C Wall Charger in White,",
    "upc": "811725028350",
    "specs": {
      "Case Pack Quantity": "24 units",
      "Inner Pack Quantity": "6 units",
      "Upc Code": "811725028350",
      "Case Pack Dimensions": "7 \" (L) x17.7 \" (W) x9.1 \"(H)",
      "Case Weight": "7.099992 lb",
      "Case Cube": "0.65 cubic feet",
      "Per Piece Weight": "0.295833",
      "Category": "Electronics",
      "Subcategory": "Cell Phone Accessories"
    },
    "rules": {
      "lot": 6,
      "moq": 12,
      "caseQty": 24,
      "physicalCase": 24,
      "innerPack": 6
    },
    "californiaWarning": false,
    "californiaWarningText": null,
    "newestRank": 10
  },
  {
    "sku": "AW293",
    "title": "Quantum 10 ft USB-C to USB-C Braided Charging Cable in Black",
    "price": 5.5,
    "originalPrice": 2.75,
    "sourceUrl": "https://www.koleimports.com/quantum-10-ft-usb-c-to-usb-c-braided-charging-cable-in-black-aw293",
    "sourceCheckedAt": "2026-11-04",
    "stock": 9640,
    "badges": [
      "new",
      "closeout"
    ],
    "collections": [
      "new-arrivals",
      "imports",
      "closeouts"
    ],
    "category": "Electronics",
    "subcategory": "Cell Phone Accessories",
    "images": [
      "images/products/aw293-1.webp",
      "images/products/aw293-2.webp",
      "images/products/aw293-3.webp"
    ],
    "description": "Power up your devices with the Quantum 10 Foot USB-C to USB-C Braided Charging Cable. Designed for durability and convenience, this cable features a strong braided exterior that helps resist tangling and everyday wear. The extra-long 10-foot length provides added flexibility when charging devices at home, in the office, or while traveling. Equipped with USB-C connectors on both ends, it is compatible with smartphones, tablets, newer MacBook models, and other USB-C devices. Features TruFast charging technology for faster charging when paired with a compatible 20W wall charger. Sleek metallic connector housings provide a modern finish, while the included cable tie keeps the cable neatly organized for storage. Comes packaged in a retail display box with a clear window and hanging tab.,Quantum 10 ft USB-C to USB-C Braided Charging Cable in Black,",
    "upc": "810012239059",
    "specs": {
      "Case Pack Quantity": "24 units",
      "Inner Pack Quantity": "1 units",
      "Upc Code": "810012239059",
      "Case Pack Dimensions": "9.8 \" (L) x14.6 \" (W) x7.9 \"(H)",
      "Case Weight": "7.699992 lb",
      "Case Cube": "0.65 cubic feet",
      "Per Piece Weight": "0.320833",
      "Category": "Electronics",
      "Subcategory": "Cell Phone Accessories"
    },
    "rules": {
      "lot": 9,
      "moq": 9,
      "caseQty": 24,
      "physicalCase": 24,
      "innerPack": 1
    },
    "californiaWarning": false,
    "californiaWarningText": null,
    "newestRank": 11
  },
  {
    "sku": "AW284",
    "title": "Mochic 10 Foot USB A to USB-C Braided Charging Cable in Pink",
    "price": 3.9,
    "originalPrice": 1.95,
    "sourceUrl": "https://www.koleimports.com/mochic-10-foot-usb-a-to-usb-c-braided-charging-cable-in-pink-aw284",
    "sourceCheckedAt": "2026-11-04",
    "stock": 1192,
    "badges": [
      "new",
      "closeout"
    ],
    "collections": [
      "new-arrivals",
      "imports",
      "closeouts"
    ],
    "category": "Electronics",
    "subcategory": "Cell Phone Accessories",
    "images": [
      "images/products/aw284-1.webp",
      "images/products/aw284-2.webp",
      "images/products/aw284-3.webp"
    ],
    "description": "Stay connected with the Mochic 10 Foot USB-A to USB-C Braided Charging Cable. Designed for convenient and reliable charging, this cable features a strong braided exterior that helps prevent tangling and withstand everyday wear. The extra-long 10-foot length provides added flexibility, allowing you to comfortably charge your devices from a distance. Features a USB-A connector on one end and a USB-C connector on the other, making it ideal for compatible smartphones, tablets, and other USB-C devices. Supports fast charging when paired with compatible devices and power adapters. Includes sleek metallic connector housings and a convenient cable tie for easy organization and storage. Comes packaged in a retail display box with a clear window and hanging loop.,Mochic 10 Foot USB A to USB-C Braided Charging Cable in Pink,",
    "upc": "811725020026",
    "specs": {
      "Case Pack Quantity": "24 units",
      "Inner Pack Quantity": "6 units",
      "Upc Code": "811725020026",
      "Case Pack Dimensions": "9.6 \" (L) x15.3 \" (W) x7.2 \"(H)",
      "Case Weight": "7.549992 lb",
      "Case Cube": "0.61 cubic feet",
      "Per Piece Weight": "0.314583",
      "Category": "Electronics",
      "Subcategory": "Cell Phone Accessories"
    },
    "rules": {
      "lot": 6,
      "moq": 12,
      "caseQty": 24,
      "physicalCase": 24,
      "innerPack": 6
    },
    "californiaWarning": false,
    "californiaWarningText": null,
    "newestRank": 12
  },
  {
    "sku": "AW004",
    "title": "Bytech Tech Bits Universal Auto Cup Holder Food Tray",
    "price": 7.7,
    "originalPrice": 3.85,
    "sourceUrl": "https://www.koleimports.com/bytech-tech-bits-universal-auto-cup-holder-food-tray-aw004",
    "sourceCheckedAt": "2026-11-04",
    "stock": 209,
    "badges": [
      "new",
      "closeout"
    ],
    "collections": [
      "new-arrivals",
      "imports",
      "closeouts"
    ],
    "category": "Automotive Supplies",
    "subcategory": "Auto Interior Accessories",
    "images": [
      "images/products/aw004-1.webp",
      "images/products/aw004-2.webp",
      "images/products/aw004-3.webp"
    ],
    "description": "Turn your car’s cup holder into a convenient on-the-go dining and storage station with the Bytech Tech Bits Universal Auto Cup Holder Food Tray. Designed to fit most vehicle cup holders measuring approximately 2.56\"–3.7\" wide, it features secure rubber mounting points to help hold it in place without scratching. The adjustable arm offers multiple positioning options, including 180° angle adjustment and 360° tray rotation, while the built-in phone holder keeps your device upright and within reach. A non-slip silicone tray liner helps keep food and small items from sliding around, making it ideal for meals, snacks, commuting, and road trips. Comes packaged in a retail box.,Bytech Tech Bits Universal Auto Cup Holder Food Tray,",
    "upc": "805112085835",
    "specs": {
      "Case Pack Quantity": "24 units",
      "Inner Pack Quantity": "4 units",
      "Upc Code": "805112085835",
      "Case Pack Dimensions": "15.7 \" (L) x21 \" (W) x27.3 \"(H)",
      "Case Weight": "24.6 lb",
      "Case Cube": "5.21 cubic feet",
      "Per Piece Weight": "1.025000",
      "Category": "Automotive Supplies",
      "Subcategory": "Auto Interior Accessories"
    },
    "rules": {
      "lot": 4,
      "moq": 8,
      "caseQty": 24,
      "physicalCase": 24,
      "innerPack": 4
    },
    "californiaWarning": true,
    "californiaWarningText": "WARNING: Cancer and Reproductive Harm – www.P65Warnings.ca.gov",
    "newestRank": 13
  },
  {
    "sku": "AV014",
    "title": "Bytech Universal Flexible Clip-On Smartphone Holder Grip",
    "price": 3.9,
    "originalPrice": 1.95,
    "sourceUrl": "https://www.koleimports.com/bytech-universal-flexible-clip-on-smartphone-holder-grip-av014",
    "sourceCheckedAt": "2026-11-04",
    "stock": 169,
    "badges": [
      "new",
      "closeout"
    ],
    "collections": [
      "new-arrivals",
      "imports",
      "closeouts"
    ],
    "category": "Electronics",
    "subcategory": "Cell Phone Accessories",
    "images": [
      "images/products/av014-1.webp",
      "images/products/av014-2.webp",
      "images/products/av014-3.webp"
    ],
    "description": "Keep your phone comfortably in view with the Bytech Universal Flexible Clip-On Smartphone Holder Grip. The sturdy clip-on base attaches securely to tables, desks, counters, and other compatible surfaces, while the flexible gooseneck arm lets you bend and position your phone at the angle that works best for you. The adjustable holder fits most smartphones approximately 2\" to 3.5\" wide, making it great for watching videos, video calls, following recipes, or hands-free browsing. Its compact, versatile design makes it easy to use at home, work, or while traveling. Comes packaged in a retail box with a hanging tab.,Bytech Universal Flexible Clip-On Smartphone Holder Grip,",
    "upc": "805112049950",
    "specs": {
      "Case Pack Quantity": "40 units",
      "Inner Pack Quantity": "4 units",
      "Upc Code": "805112049950",
      "Case Pack Dimensions": "13 \" (L) x15.3 \" (W) x26.2 \"(H)",
      "Case Weight": "18.15 lb",
      "Case Cube": "3.02 cubic feet",
      "Per Piece Weight": "0.453750",
      "Category": "Electronics",
      "Subcategory": "Cell Phone Accessories"
    },
    "rules": {
      "lot": 4,
      "moq": 12,
      "caseQty": 40,
      "physicalCase": 40,
      "innerPack": 4
    },
    "californiaWarning": true,
    "californiaWarningText": "WARNING: Cancer and Reproductive Harm – www.P65Warnings.ca.gov",
    "newestRank": 14
  },
  {
    "sku": "AV010",
    "title": "Bytech Suction Cup Car Tablet Mount",
    "price": 5.5,
    "originalPrice": 2.75,
    "sourceUrl": "https://www.koleimports.com/bytech-suction-cup-car-tablet-mount-av010",
    "sourceCheckedAt": "2026-11-04",
    "stock": 121,
    "badges": [
      "new",
      "closeout"
    ],
    "collections": [
      "new-arrivals",
      "imports",
      "closeouts"
    ],
    "category": "Electronics",
    "subcategory": "Cell Phone Accessories",
    "images": [
      "images/products/av010-1.webp",
      "images/products/av010-2.webp",
      "images/products/av010-3.webp"
    ],
    "description": "Keep your tablet secure, accessible, and perfectly positioned on the road with the Bytech Universal Suction Cup Car Tablet Mount! Designed for convenience and versatility, this adjustable windshield mount transforms your tablet into an easy-to-view navigation and entertainment companion. The powerful suction cup attaches securely to your vehicle's windshield, while the expandable holder accommodates most tablets up to 7 inches wide, including 7- to 10-inch tablets. Featuring a flexible adjustable arm, swivel joint, and 360-degree rotating design, it allows you to customize your viewing angle for optimal visibility in portrait or landscape orientation. The sturdy, adjustable grips help keep your device securely in place while driving, making it ideal for GPS navigation, road trips, and hands-free viewing while parked. Sleek, practical, and easy to install, this universal tablet mount comes packaged in a retail hanging box.,Bytech Suction Cup Car Tablet Mount,",
    "upc": "805112028696",
    "specs": {
      "Case Pack Quantity": "40 units",
      "Inner Pack Quantity": "4 units",
      "Upc Code": "805112028696",
      "Case Pack Dimensions": "18.5 \" (L) x19.6 \" (W) x23.8 \"(H)",
      "Case Weight": "23.5 lb",
      "Case Cube": "4.99 cubic feet",
      "Per Piece Weight": "0.587500",
      "Category": "Electronics",
      "Subcategory": "Cell Phone Accessories"
    },
    "rules": {
      "lot": 4,
      "moq": 8,
      "caseQty": 40,
      "physicalCase": 40,
      "innerPack": 4
    },
    "californiaWarning": true,
    "californiaWarningText": "WARNING: Cancer and Reproductive Harm – www.P65Warnings.ca.gov",
    "newestRank": 15
  },
  {
    "sku": "AV006",
    "title": "Bytech 480P PC Webcam with Mic in Black",
    "price": 8.8,
    "originalPrice": 4.4,
    "sourceUrl": "https://www.koleimports.com/bytech-480p-pc-webcam-with-mic-in-black-av006",
    "sourceCheckedAt": "2026-11-04",
    "stock": 473,
    "badges": [
      "new",
      "closeout"
    ],
    "collections": [
      "new-arrivals",
      "imports",
      "closeouts"
    ],
    "category": "Electronics",
    "subcategory": "Computer & Tablet Accessories",
    "images": [
      "images/products/av006-1.webp",
      "images/products/av006-2.webp",
      "images/products/av006-3.webp"
    ],
    "description": "Stay connected for video calls, virtual meetings, online classes, livestreams, and more with the Bytech 480P PC Webcam with Mic in Black. Designed for laptops and desktop computers, this easy-to-use webcam delivers 480P streaming video with clear, true-color images and features a built-in microphone for convenient audio with sound clarity up to 10 meters. The adjustable 180° rotating clip makes it easy to position on your monitor, while the plug-and-play design offers quick setup. Features USB and 3.5mm connections and is compatible with Windows, Linux, and other operating systems. Comes packaged in a retail box with hanging tab.,Bytech 480P PC Webcam with Mic in Black,",
    "upc": "805112067411",
    "specs": {
      "Case Pack Quantity": "40 units",
      "Inner Pack Quantity": "4 units",
      "Upc Code": "805112067411",
      "Case Pack Dimensions": "11.5 \" (L) x17.4 \" (W) x25.6 \"(H)",
      "Case Weight": "16.05 lb",
      "Case Cube": "2.96 cubic feet",
      "Per Piece Weight": "0.401250",
      "Category": "Electronics",
      "Subcategory": "Computer & Tablet Accessories"
    },
    "rules": {
      "lot": 4,
      "moq": 8,
      "caseQty": 40,
      "physicalCase": 40,
      "innerPack": 4
    },
    "californiaWarning": true,
    "californiaWarningText": "WARNING: Cancer and Reproductive Harm – www.P65Warnings.ca.gov",
    "newestRank": 16
  },
  {
    "sku": "AV003",
    "title": "Room 2 Room 7\" Battery Powered Figural Lamp in Assorted Metallic",
    "price": 4.4,
    "originalPrice": 2.2,
    "sourceUrl": "https://www.koleimports.com/room-2-room-7-battery-powered-figural-lamp-in-assorted-metallic-av003",
    "sourceCheckedAt": "2026-11-04",
    "stock": 9652,
    "badges": [
      "new",
      "closeout"
    ],
    "collections": [
      "new-arrivals",
      "imports",
      "closeouts"
    ],
    "category": "Lighting",
    "subcategory": "Lamps & Lighting",
    "images": [
      "images/products/av003-1.webp",
      "images/products/av003-2.webp",
      "images/products/av003-3.webp"
    ],
    "description": "Add a playful pop of shine to any space with the Room 2 Room 7\" Battery Powered Figural Lamp in Assorted Metallic finishes. This compact accent lamp features a quirky sculptural character base with a glossy metallic look, topped with a clear faceted shade that beautifully reflects the light for extra sparkle. Battery-powered for easy cordless placement, it’s perfect for nightstands, desks, shelves, dorm rooms, or anywhere that could use a fun decorative glow. Measures approximately 7\" tall and comes in assorted metallic finishes. Comes packaged with a hang tag.,Room 2 Room 7\" Battery Powered Figural Lamp in Assorted Metallic,",
    "upc": "731015335589",
    "specs": {
      "Case Pack Quantity": "12 units",
      "Inner Pack Quantity": "1 units",
      "Upc Code": "731015335589",
      "Case Pack Dimensions": "13.6 \" (L) x17.3 \" (W) x8.6 \"(H)",
      "Case Weight": "10.149996 lb",
      "Case Cube": "1.17 cubic feet",
      "Per Piece Weight": "0.845833",
      "Category": "Lighting",
      "Subcategory": "Lamps & Lighting"
    },
    "rules": {
      "lot": 12,
      "moq": 12,
      "caseQty": 12,
      "physicalCase": 12,
      "innerPack": 1
    },
    "californiaWarning": false,
    "californiaWarningText": null,
    "newestRank": 17
  },
  {
    "sku": "AV997",
    "title": "Bytech Illuminous Iridescent Square LED Lamp",
    "price": 6.6,
    "originalPrice": 3.3,
    "sourceUrl": "https://www.koleimports.com/bytech-illuminous-iridescent-square-led-lamp-av997",
    "sourceCheckedAt": "2026-11-04",
    "stock": 301,
    "badges": [
      "new",
      "closeout"
    ],
    "collections": [
      "new-arrivals",
      "imports",
      "closeouts"
    ],
    "category": "Lighting",
    "subcategory": "Lamps & Lighting",
    "images": [
      "images/products/av997-1.webp",
      "images/products/av997-2.webp",
      "images/products/av997-3.webp"
    ],
    "description": "Create a mesmerizing glow with the Bytech Illuminous Iridescent Square LED Lamp. Featuring a clear iridescent cube design with a smaller inner cube, this decorative lamp reflects and refracts the built-in LED light to produce a colorful 3D visual effect that shifts beautifully from different angles. The illuminating multicolor display adds a modern accent to desks, nightstands, shelves, gaming setups, dorm rooms, and more. Battery-operated for easy cordless placement, it can be displayed almost anywhere without needing a nearby outlet. Comes packaged in a clear retail box.,Bytech Illuminous Iridescent Square LED Lamp,",
    "upc": "805112124480",
    "specs": {
      "Case Pack Quantity": "40 units",
      "Inner Pack Quantity": "4 units",
      "Upc Code": "805112124480",
      "Case Pack Dimensions": "13.8 \" (L) x21.3 \" (W) x27.2 \"(H)",
      "Case Weight": "21.1 lb",
      "Case Cube": "4.63 cubic feet",
      "Per Piece Weight": "0.527500",
      "Category": "Lighting",
      "Subcategory": "Lamps & Lighting"
    },
    "rules": {
      "lot": 4,
      "moq": 8,
      "caseQty": 40,
      "physicalCase": 40,
      "innerPack": 4
    },
    "californiaWarning": true,
    "californiaWarningText": "WARNING: Cancer and Reproductive Harm – www.P65Warnings.ca.gov",
    "newestRank": 18
  },
  {
    "sku": "AV996",
    "title": "Bytech Multicolor LED Basketball Hoop Light with Remote",
    "price": 6.6,
    "originalPrice": 3.3,
    "sourceUrl": "https://www.koleimports.com/bytech-multicolor-led-basketball-hoop-light-with-remote-av996",
    "sourceCheckedAt": "2026-11-04",
    "stock": 253,
    "badges": [
      "new",
      "closeout"
    ],
    "collections": [
      "new-arrivals",
      "imports",
      "closeouts"
    ],
    "category": "Lighting",
    "subcategory": "Lamps & Lighting",
    "images": [
      "images/products/av996-1.webp",
      "images/products/av996-2.webp",
      "images/products/av996-3.webp"
    ],
    "description": "Light up every shot with the Bytech Multicolor LED Basketball Hoop Light with Remote. Designed to mount around a basketball rim, this vibrant LED strip features four colors and eight lighting modes to add an exciting glow to nighttime games, backyard hoops, and indoor play. Use the included 13-key infrared remote to switch modes, adjust brightness, and control the lights from a distance. The battery-operated design eliminates the need for a nearby outlet, while IPX4 weather resistance helps protect against splashes and outdoor conditions. Easy to install with the included mounting Velcro and cable ties. Includes LED strip cable, remote control, mounting Velcro, 6 cable ties, and user manual. Comes packaged in a retail box with carrying handle.,Bytech Multicolor LED Basketball Hoop Light with Remote,",
    "upc": "805112119028",
    "specs": {
      "Case Pack Quantity": "40 units",
      "Inner Pack Quantity": "4 units",
      "Upc Code": "805112119028",
      "Case Pack Dimensions": "9.4 \" (L) x15.5 \" (W) x33.2 \"(H)",
      "Case Weight": "13.6 lb",
      "Case Cube": "2.80 cubic feet",
      "Per Piece Weight": "0.340000",
      "Category": "Lighting",
      "Subcategory": "Lamps & Lighting"
    },
    "rules": {
      "lot": 4,
      "moq": 8,
      "caseQty": 40,
      "physicalCase": 40,
      "innerPack": 4
    },
    "californiaWarning": true,
    "californiaWarningText": "WARNING: Cancer and Reproductive Harm – www.P65Warnings.ca.gov",
    "newestRank": 19
  },
  {
    "sku": "AV989",
    "title": "Bytech DJ Style Wired Headphones in Red",
    "price": 4.4,
    "originalPrice": 2.2,
    "sourceUrl": "https://www.koleimports.com/bytech-dj-style-wired-headphones-in-red-av989",
    "sourceCheckedAt": "2026-11-04",
    "stock": 213,
    "badges": [
      "new",
      "closeout"
    ],
    "collections": [
      "new-arrivals",
      "imports",
      "closeouts"
    ],
    "category": "Electronics",
    "subcategory": "Headphones",
    "images": [
      "images/products/av989-1.webp",
      "images/products/av989-2.webp",
      "images/products/av989-3.webp"
    ],
    "description": "Enjoy clear, comfortable listening with the Bytech DJ Style Wired Headphones in Red. Featuring a bold red-and-black over-ear design with cushioned ear pads and an adjustable headband, these headphones are made for everyday music, videos, gaming, and more. The 40mm drivers deliver stereo sound across a 20Hz–20kHz frequency range, while the 3.5mm stereo plug provides easy wired connectivity with compatible phones, tablets, laptops, and audio devices. A long red cable gives you extra room to move, and the lightweight DJ-style design adds a sporty look. Comes packaged in a retail box with hanging tab.,Bytech DJ Style Wired Headphones in Red,",
    "upc": "805112312917",
    "specs": {
      "Case Pack Quantity": "40 units",
      "Inner Pack Quantity": "4 units",
      "Upc Code": "805112312917",
      "Case Pack Dimensions": "13.3 \" (L) x17.3 \" (W) x29.6 \"(H)",
      "Case Weight": "19.65 lb",
      "Case Cube": "3.94 cubic feet",
      "Per Piece Weight": "0.491250",
      "Category": "Electronics",
      "Subcategory": "Headphones"
    },
    "rules": {
      "lot": 4,
      "moq": 12,
      "caseQty": 40,
      "physicalCase": 40,
      "innerPack": 4
    },
    "californiaWarning": true,
    "californiaWarningText": "WARNING: Cancer and Reproductive Harm – www.P65Warnings.ca.gov",
    "newestRank": 20
  },
  {
    "sku": "AW404",
    "title": "Stance COB LED Rotating Work Light with Magnetic Base in Black & Yellow in PDQ Display",
    "price": 5.28,
    "originalPrice": 2.64,
    "sourceUrl": "https://www.koleimports.com/stance-cob-led-rotating-work-light-with-magnetic-base-in-assorted-colors-aw404",
    "sourceCheckedAt": "2026-11-04",
    "stock": 600,
    "badges": [
      "new",
      "closeout"
    ],
    "collections": [
      "new-arrivals",
      "imports",
      "closeouts"
    ],
    "category": "Lighting",
    "subcategory": "Lamps & Lighting",
    "images": [
      "images/products/aw404-1.webp",
      "images/products/aw404-2.webp",
      "images/products/aw404-3.webp"
    ],
    "description": "Illuminate your workspace with the Stance COB LED Rotating Work Light with Magnetic Base in Assorted Colors. Featuring a powerful 200-lumen COB LED that produces bright white light, this compact work light is perfect for home repairs, automotive maintenance, workshops, garages, and emergency use. The 360-degree pivoting head allows you to direct light exactly where needed, while the adjustable stand provides hands-free convenience. A built-in magnetic base allows easy attachment to metal surfaces for added versatility. Measures approximately 5\" tall x 3.5\" wide x 1.25\" deep. Operates on 4 AAA batteries, which are included, and provides up to 10 hours of runtime. Available in black and yellow. Comes packaged in a retail box with a hanging tab.,Stance COB LED Rotating Work Light with Magnetic Base in Black & Yellow in PDQ Display,",
    "upc": "900210621258",
    "specs": {
      "Case Pack Quantity": "48 units",
      "Inner Pack Quantity": "12 units",
      "Upc Code": "900210621258",
      "Case Pack Dimensions": "18 \" (L) x11.2 \" (W) x22.3 \"(H)",
      "Case Weight": "20.000016 lb",
      "Case Cube": "2.60 cubic feet",
      "Per Piece Weight": "0.416667",
      "Category": "Lighting",
      "Subcategory": "Lamps & Lighting"
    },
    "rules": {
      "lot": 12,
      "moq": 12,
      "caseQty": 48,
      "physicalCase": 48,
      "innerPack": 12
    },
    "californiaWarning": false,
    "californiaWarningText": null,
    "newestRank": 21
  },
  {
    "sku": "AW303",
    "title": "Zooniverse Ceramic Blue Elephant Salt & Pepper Shakers",
    "price": 2.7,
    "originalPrice": 1.35,
    "sourceUrl": "https://www.koleimports.com/zooniverse-ceramic-blue-elephant-salt-pepper-shakers-aw303",
    "sourceCheckedAt": "2026-11-04",
    "stock": 667,
    "badges": [
      "new",
      "closeout"
    ],
    "collections": [
      "new-arrivals",
      "imports",
      "closeouts"
    ],
    "category": "Kitchen & Dining",
    "subcategory": "Kitchen Tools & Utensils",
    "images": [
      "images/products/aw303-1.webp",
      "images/products/aw303-2.webp",
      "images/products/aw303-3.webp"
    ],
    "description": "Bring a playful safari-inspired touch to your kitchen with the Zooniverse Ceramic Blue Elephant Salt & Pepper Shakers! This adorable two-piece set features a pair of cheerful blue elephants with oversized pink ears, raised trunks, sweet closed-eye expressions, and charming sculpted details. Crafted from glossy ceramic with a smooth finish, these whimsical shakers add a delightful pop of color and personality to any kitchen countertop or dining table. Perfect for everyday seasoning, safari-themed gatherings, or adding a fun decorative accent to your home, this charming set makes a wonderful gift for elephant lovers, animal enthusiasts, and collectors of unique kitchen accessories. Comes packaged in a colorful safari-themed illustrated box, making it ideal for gifting.,Zooniverse Ceramic Blue Elephant Salt & Pepper Shakers,",
    "upc": "617521650562",
    "specs": {
      "Case Pack Quantity": "48 units",
      "Inner Pack Quantity": "1 units",
      "Upc Code": "617521650562",
      "Case Pack Dimensions": "12.9 \" (L) x20.3 \" (W) x12.1 \"(H)",
      "Case Weight": "23.199984 lb",
      "Case Cube": "1.83 cubic feet",
      "Per Piece Weight": "0.483333",
      "Category": "Kitchen & Dining",
      "Subcategory": "Kitchen Tools & Utensils"
    },
    "rules": {
      "lot": 18,
      "moq": 18,
      "caseQty": 48,
      "physicalCase": 48,
      "innerPack": 1
    },
    "californiaWarning": false,
    "californiaWarningText": null,
    "newestRank": 22
  },
  {
    "sku": "AW235",
    "title": "Universal Studios Jurassic World Nature Takes Over 16\" Backpack",
    "price": 14.3,
    "originalPrice": 7.15,
    "sourceUrl": "https://www.koleimports.com/universal-studios-jurassic-world-nature-takes-over-16-backpack-aw235",
    "sourceCheckedAt": "2026-11-04",
    "stock": 1081,
    "badges": [
      "new",
      "closeout"
    ],
    "collections": [
      "new-arrivals",
      "imports",
      "closeouts"
    ],
    "category": "Apparel",
    "subcategory": "Backpacks & Duffel Bags",
    "images": [
      "images/products/aw235-1.webp",
      "images/products/aw235-2.webp",
      "images/products/aw235-3.webp"
    ],
    "description": "Bring prehistoric adventure to school days, travel, and everyday outings with the Universal Studios Jurassic World Nature Takes Over 16\" Backpack. The bold front design features a T. rex surrounded by lush jungle scenery with the phrase \"Nature Takes Over,\" while a contrasting side panel showcases colorful dinosaur and geometric graphics. A spacious zippered main compartment provides room for books, folders, clothing, and other essentials, and dual mesh side pockets keep water bottles or smaller items within easy reach. Finished with adjustable padded shoulder straps, a top carry handle, bright blue trim, and coordinating zipper pulls. Comes packaged with a Jurassic World hang tag.,Universal Studios Jurassic World Nature Takes Over 16\" Backpack,",
    "upc": "840716297925",
    "specs": {
      "Case Pack Quantity": "12 units",
      "Inner Pack Quantity": "1 units",
      "Upc Code": "840716297925",
      "Case Pack Dimensions": "13.9 \" (L) x17.9 \" (W) x8.6 \"(H)",
      "Case Weight": "9.950004 lb",
      "Case Cube": "1.24 cubic feet",
      "Per Piece Weight": "0.829167",
      "Category": "Apparel",
      "Subcategory": "Backpacks & Duffel Bags"
    },
    "rules": {
      "lot": 4,
      "moq": 4,
      "caseQty": 12,
      "physicalCase": 12,
      "innerPack": 1
    },
    "californiaWarning": false,
    "californiaWarningText": null,
    "newestRank": 23
  },
  {
    "sku": "AW258",
    "title": "6 Pack Sonic the Hedgehog No Show Socks Size 9-2.5",
    "price": 4.2,
    "originalPrice": 2.1,
    "sourceUrl": "https://www.koleimports.com/6-pack-sonic-the-hedgehog-no-show-socks-size-9-11-aw258",
    "sourceCheckedAt": "2026-11-04",
    "stock": 6991,
    "badges": [
      "new",
      "closeout"
    ],
    "collections": [
      "new-arrivals",
      "imports",
      "closeouts"
    ],
    "category": "Apparel",
    "subcategory": "Socks",
    "images": [
      "images/products/aw258-1.webp",
      "images/products/aw258-2.webp",
      "images/products/aw258-3.webp"
    ],
    "description": "Bring some high-speed fun to everyday outfits with this 6-Pack Sonic the Hedgehog No Show Socks. Inspired by the popular SEGA video game character, this colorful set features six unique designs showcasing Sonic the Hedgehog, his signature blue color, gold rings, and fun graphics. The assortment includes shades of blue, navy, gray, and white with character prints, playful patterns, and bold lettering. Made with soft, stretchy fabric for a comfortable fit, these socks feature a low-cut, no-show design that pairs perfectly with sneakers and casual footwear. Ideal for school, playtime, everyday wear, or gifting to Sonic fans. Fits children's shoe sizes 9-2.5. Comes packaged as a 6-pair set with a branded Sonic the Hedgehog tag.,6 Pack Sonic the Hedgehog No Show Socks Size 9-2.5,",
    "upc": "086694643433",
    "specs": {
      "Case Pack Quantity": "24 units",
      "Inner Pack Quantity": "2 units",
      "Upc Code": "086694643433",
      "Case Pack Dimensions": "7.3 \" (L) x12 \" (W) x12.3 \"(H)",
      "Case Weight": "4.95 lb",
      "Case Cube": "0.62 cubic feet",
      "Per Piece Weight": "0.206250",
      "Category": "Apparel",
      "Subcategory": "Socks"
    },
    "rules": {
      "lot": 2,
      "moq": 12,
      "caseQty": 24,
      "physicalCase": 24,
      "innerPack": 2
    },
    "californiaWarning": false,
    "californiaWarningText": null,
    "newestRank": 24
  },
  {
    "sku": "AW246",
    "title": "Encanto 2 Piece Paint Your Own Figurine Set",
    "price": 5.5,
    "originalPrice": 2.75,
    "sourceUrl": "https://www.koleimports.com/encanto-2-piece-paint-your-own-figurine-set-aw246",
    "sourceCheckedAt": "2026-11-04",
    "stock": 2609,
    "badges": [
      "new",
      "closeout"
    ],
    "collections": [
      "new-arrivals",
      "imports",
      "closeouts"
    ],
    "category": "Crafts",
    "subcategory": "Do-it-yourself Craft Kits",
    "images": [
      "images/products/aw246-1.webp",
      "images/products/aw246-2.webp",
      "images/products/aw246-3.webp"
    ],
    "description": "Bring the magic of Disney's Encanto to life with the Encanto 2 Piece Paint Your Own Figurine Set! This fun and creative activity kit includes two ready-to-paint figurines featuring an adorable jaguar and a decorative butterfly, each with raised details for easy painting. Kids can express their creativity using the six vibrant paint colors and two included paintbrushes to design their own colorful masterpieces. Once finished, the figurines make charming decorations to proudly display. Perfect for arts and crafts, rainy-day activities, and Disney fans ages 6 and up. Includes 2 figurines, 2 paintbrushes, and 6 paint pots (0.085 fl oz each). Comes packaged in a colorful 9\" x 6\" x 4\" window display box.,Encanto 2 Piece Paint Your Own Figurine Set,",
    "upc": "191537132491",
    "specs": {
      "Case Pack Quantity": "12 units",
      "Inner Pack Quantity": "1 units",
      "Upc Code": "191537132491",
      "Case Pack Dimensions": "13.1 \" (L) x19 \" (W) x12.2 \"(H)",
      "Case Weight": "12.75 lb",
      "Case Cube": "1.76 cubic feet",
      "Per Piece Weight": "1.062500",
      "Category": "Crafts",
      "Subcategory": "Do-it-yourself Craft Kits"
    },
    "rules": {
      "lot": 12,
      "moq": 12,
      "caseQty": 12,
      "physicalCase": 12,
      "innerPack": 1
    },
    "californiaWarning": false,
    "californiaWarningText": null,
    "newestRank": 25
  }
];

const importedSkus = new Set(IMPORTED_NEW_ARRIVALS.map(product => product.sku));
export const PRODUCTS: Product[] = [...IMPORTED_NEW_ARRIVALS, ...LEGACY_PRODUCTS.filter(product => !importedSkus.has(product.sku)).map(product => ({ ...product, collections: product.collections.filter(collection => collection !== "new-arrivals") }))];

export const CATEGORIES = ["Apparel", "Automotive Supplies", "Barbecue", "Bed & Bath", "Camping", "Candles & Scents", "Christmas", "Cosmetics", "Crafts", "Electronics", "Fashion Accessories", "Gift Wrapping", "Hair Care", "Halloween", "Health Care", "Home Decor", "Household Supplies", "Kitchen & Dining", "Lawn & Garden", "Lighting", "Liquidation", "Party Supplies", "Personal Care", "Pet Supplies", "Reduced Price", "School & Office Supplies", "Sewing & Needlecrafts", "Sporting Goods", "Tools & Hardware", "Toys", "Travel Goods", "Vision Care"];

export const PRICE_BANDS = [
  { id: "577", label: "$0.00 - $0.25", min: 0, max: 0.25 }, { id: "578", label: "$0.26 - $0.50", min: 0.26, max: 0.5 },
  { id: "579", label: "$0.51 - $0.75", min: 0.51, max: 0.75 }, { id: "580", label: "$0.76 - $1.00", min: 0.76, max: 1 },
  { id: "581", label: "$1.01 - $2.00", min: 1.01, max: 2 }, { id: "582", label: "$2.01 - $3.00", min: 2.01, max: 3 },
  { id: "583", label: "$3.01 - $4.00", min: 3.01, max: 4 }, { id: "584", label: "$4.01 - $5.00", min: 4.01, max: 5 },
  { id: "585", label: "$5.01 - $10.00", min: 5.01, max: 10 }, { id: "586", label: "$10.01 +", min: 10.01, max: Infinity },
];

export const COLLECTIONS: Record<CollectionSlug, { title: string; banner: string; defaultSort: string }> = {
  "new-arrivals": { title: "Great New Arrivals", banner: "new", defaultSort: "newest" },
  "best-sellers": { title: "Best Sellers", banner: "best", defaultSort: "position" },
  "reduced-price": { title: "Reduced Price", banner: "reduced", defaultSort: "position" },
  closeouts: { title: "Closeouts", banner: "closeout", defaultSort: "position" },
  imports: { title: "Imports", banner: "imports", defaultSort: "position" },
};

export const slugify = (s: string) => s.toLowerCase().replace(/&/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
export const getProduct = (sku: string) => PRODUCTS.find((x) => x.sku.toLowerCase() === sku.toLowerCase());
