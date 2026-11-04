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

export const PRODUCTS: Product[] = [
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
      "imports",
      "new-arrivals",
      "closeouts"
    ],
    "category": "Cosmetics",
    "subcategory": "Cosmetic Mirrors",
    "images": [
      "images/products/da883-1.webp",
      "images/products/da883-2.webp",
      "images/products/da883-3.webp"
    ],
    "description": "The Vanityz LED Vanity Mirror provides bright, adjustable lighting and versatile magnification for everyday makeup application, skincare, grooming, and detailed beauty routines. Designed with LED lights and a dimmer touch sensor, the mirror allows users to hold the touch button to adjust brightness for a customized view. Its tri-fold design features folding side panels for convenient storage and travel, along with two 3X magnified mirrors for precise detailing and a 2X magnified side mirror for closer viewing. The rotating kickstand offers up to 180° tilt, making it easy to adjust the mirror to a comfortable viewing angle. Measuring approximately 9.5\" x 13.5\" when open and 6.9\" x 4.2\" x 11.5\" when closed, its compact design works well on vanities, bathroom counters, dressers, or while traveling. The mirror features an ON/OFF button, LED illumination, dimmable touch control, folding side panels, battery chamber, and operates with 4 AAA batteries (not included). Practical for teens, adults, makeup enthusiasts, beauty professionals, or anyone looking for better visibility while applying cosmetics, styling hair, inserting contact lenses, shaping brows, or completing daily grooming.",
    "upc": "605928020293",
    "specs": {
      "Case Pack Quantity": "10 units",
      "Inner Pack Quantity": "1 units",
      "Case Pack Dimensions": "15.5 \" (L) x13.3 \" (W) x12.4 \"(H)",
      "Case Weight": "16.95 lb",
      "Case Cube": "1.48 cubic feet",
      "Per Piece Weight": "1.695000"
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
      "imports",
      "new-arrivals",
      "closeouts"
    ],
    "category": "Cosmetics",
    "subcategory": "Cosmetic Mirrors",
    "images": [
      "images/products/da881-1.webp",
      "images/products/da881-2.webp",
      "images/products/da881-3.webp"
    ],
    "description": "Bring bright, convenient lighting to any beauty routine with this LED Vanity Mirror with Adjustable Brightness, 180° Tilt, and Storage Tray. Designed for everyday makeup application, skincare, grooming, and getting ready, the mirror features bright LED lights with a dimmable touch sensor that lets you adjust the brightness to suit different rooms and lighting conditions. The 180° tilting design makes it easy to position the mirror at a comfortable viewing angle, while the built-in storage tray measures approximately 6.25\" x 3.25\" and provides a convenient spot for makeup, jewelry, and other small accessories. The mirror measures approximately 6.5\" W x 8.9\" H and features a compact tabletop design that fits easily on vanities, bathroom counters, dressers, and desks. An on/off power button and battery chamber are conveniently located on the back. Powered by 4 AA batteries not included, the cordless design makes it easy to place and use wherever needed. Packaged in a retail-ready color box measuring approximately 6.90\" x 2.35\" x 11.5\".",
    "upc": "605928020163",
    "specs": {
      "Case Pack Quantity": "10 units",
      "Inner Pack Quantity": "1 units",
      "Case Pack Dimensions": "14.3 \" (L) x13.3 \" (W) x12.4 \"(H)",
      "Case Weight": "11.2 lb",
      "Case Cube": "1.36 cubic feet",
      "Per Piece Weight": "1.120000"
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
      "imports",
      "new-arrivals",
      "closeouts"
    ],
    "category": "Apparel",
    "subcategory": "Hats",
    "images": [
      "images/products/av822-1.webp",
      "images/products/av822-2.webp",
      "images/products/av822-3.webp"
    ],
    "description": "Bring nostalgic cartoon energy to any casual look with the Animaniacs Wakko Graphic Black and White Mesh Trucker Hat. The crisp white front panel features a colorful Wakko graphic with bold Animaniacs lettering for a fun throwback style, while the black curved bill and matching mesh back create a classic two-tone trucker look. Breathable mesh panels help keep you cool, and the adjustable snapback closure makes it easy to customize the fit. Perfect for Animaniacs fans, retro cartoon lovers, and anyone who likes playful accessories with a little personality. Comes packaged with an Animaniacs hang tag.",
    "upc": "676092700120",
    "specs": {
      "Case Pack Quantity": "144 units",
      "Inner Pack Quantity": "24 units",
      "Case Pack Dimensions": "16.5 \" (L) x24.2 \" (W) x23.3 \"(H)",
      "Case Weight": "31.000032 lb",
      "Case Cube": "5.38 cubic feet",
      "Per Piece Weight": "0.215278"
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
      "imports",
      "new-arrivals",
      "closeouts"
    ],
    "category": "Apparel",
    "subcategory": "Hats",
    "images": [
      "images/products/av821-1.webp",
      "images/products/av821-2.webp",
      "images/products/av821-3.webp"
    ],
    "description": "Bring back the zany fun of a classic cartoon favorite with the Animaniacs Logo Light Blue Mesh Trucker Hat. Featuring Yakko, Wakko, and Dot popping out from the colorful Animaniacs logo, this playful cap adds instant nostalgic personality to any casual outfit. The light blue front panel and curved bill create a fresh, easygoing look, while white mesh back panels provide breathable comfort for everyday wear. An adjustable snapback closure helps create a comfortable, customizable fit. Perfect for Animaniacs fans, retro cartoon lovers, and anyone who wants a fun statement accessory.",
    "upc": "676092700113",
    "specs": {
      "Case Pack Quantity": "144 units",
      "Inner Pack Quantity": "24 units",
      "Case Pack Dimensions": "16 \" (L) x24.4 \" (W) x23.4 \"(H)",
      "Case Weight": "14.4 lb",
      "Case Cube": "5.29 cubic feet",
      "Per Piece Weight": "0.100000"
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
      "imports",
      "new-arrivals"
    ],
    "category": "Health Care",
    "subcategory": "Pill Boxes & Splitters",
    "images": [
      "images/products/da850-1.webp",
      "images/products/da850-2.webp",
      "images/products/da850-3.webp"
    ],
    "description": "This practical organizer provides a convenient way to separate pills by day while keeping everything neatly stored in one compact case. Featuring a 7-day pill organizer with brightly colored compartments, this set makes it easy to sort and identify daily medications, vitamins, and supplements throughout the week. The colorful compartments help distinguish each day, while the included note card provides a convenient space for recording medication information, reminders, or personal notes. The organizer fits securely inside a black carrying case, helping keep its contents protected and organized during everyday use. The compact, portable design makes this weekly medication organizer ideal for home use, travel, work, vacations, and daily routines. Its convenient carrying case allows users to store their medications discreetly in a purse, backpack, luggage, or bedside drawer. The combination of colorful daily compartments and a dedicated note card makes it a useful accessory for maintaining an organized medication schedule. Comes individually packaged in a printed hanging retail box, featuring a product image that showcases the colorful pill compartments, note card, and black carrying case. The packaging includes a built-in hang tab for convenient peg-hook merchandising and displays the product's organizational features, making it suitable for pharmacies, health and wellness departments, convenience stores, discount retailers, and general merchandise displays.",
    "upc": "731015332526",
    "specs": {
      "Case Pack Quantity": "24 units",
      "Inner Pack Quantity": "12 units",
      "Case Pack Dimensions": "17.1 \" (L) x10.8 \" (W) x11.9 \"(H)",
      "Case Weight": "12 lb",
      "Case Cube": "1.27 cubic feet",
      "Per Piece Weight": "0.500000"
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
      "imports",
      "new-arrivals",
      "closeouts"
    ],
    "category": "Electronics",
    "subcategory": "Cell Phone Accessories",
    "images": [
      "images/products/aw300-1.webp",
      "images/products/aw300-2.webp",
      "images/products/aw300-3.webp"
    ],
    "description": "Stay connected with the Mochic 30W Dual Port USB-A and USB-C Wall Charging Bundle. This convenient set includes a compact 30W wall charger equipped with USB-A and USB-C ports, allowing you to charge two compatible devices from a single wall outlet. Features TruFast charging technology through the USB-C port, delivering up to 4 times faster charging compared to a standard 5W charger when used with compatible devices. Includes a 4-foot USB-A to USB-C charging and syncing cable featuring a durable, tangle-resistant braided exterior and metallic connector housings. The included cable tie makes organization and storage easy. Ideal for charging compatible smartphones, tablets, and other USB-C devices at home, in the office, or while traveling. Features a sleek white finish. Comes packaged in a retail display box with a clear window and hanging loop.",
    "upc": "811725026578",
    "specs": {
      "Case Pack Quantity": "24 units",
      "Inner Pack Quantity": "6 units",
      "Case Pack Dimensions": "8.1 \" (L) x20.9 \" (W) x10 \"(H)",
      "Case Weight": "9.199992 lb",
      "Case Cube": "0.98 cubic feet",
      "Per Piece Weight": "0.383333"
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
      "imports",
      "new-arrivals",
      "closeouts"
    ],
    "category": "Electronics",
    "subcategory": "Cell Phone Accessories",
    "images": [
      "images/products/aw298-1.webp",
      "images/products/aw298-2.webp",
      "images/products/aw298-3.webp"
    ],
    "description": "Keep your devices charged while traveling with the Mochic 30W Dual Port USB-A and USB-C Car Charging Bundle. This convenient set includes a 30W car charger featuring both USB-A and USB-C ports, allowing you to charge two compatible devices from a single vehicle power outlet. Features TruFast charging technology through the USB-C port, delivering up to 4 times faster charging compared to a standard 5W charger when used with compatible devices. Includes a 4-foot USB-A to USB-C charging and syncing cable with a durable, tangle-resistant braided exterior and metallic connector housings. The included cable tie allows for convenient organization and storage. Ideal for charging compatible smartphones, tablets, and other USB-C devices on the go. Features a sleek black finish. Comes packaged in a retail display box with a clear window and hanging loop.",
    "upc": "811725028329",
    "specs": {
      "Case Pack Quantity": "24 units",
      "Inner Pack Quantity": "6 units",
      "Case Pack Dimensions": "8.2 \" (L) x20.8 \" (W) x10 \"(H)",
      "Case Weight": "7.750008 lb",
      "Case Cube": "0.99 cubic feet",
      "Per Piece Weight": "0.322917"
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
      "imports",
      "new-arrivals",
      "closeouts"
    ],
    "category": "Electronics",
    "subcategory": "Cell Phone Accessories",
    "images": [
      "images/products/aw297-1.webp",
      "images/products/aw297-2.webp",
      "images/products/aw297-3.webp"
    ],
    "description": "Stay powered on the road with the Mochic 30W Dual Port USB-A and USB-C Car Charging Bundle. This convenient set includes a 30W car charger with USB-A and USB-C ports, allowing you to charge two compatible devices from a single vehicle power outlet. Features TruFast charging technology through the USB-C port, providing up to 4 times faster charging compared to a standard 5W charger when used with compatible devices. Includes a 4-foot USB-C to USB-C charging and syncing cable with a strong, tangle-resistant braided exterior and metallic connector housings. The included cable tie keeps the cord neatly organized when not in use. Ideal for charging compatible smartphones, tablets, and other USB-C devices while traveling. Features a sleek black finish. Comes packaged in a retail display box with a clear window and hanging loop.",
    "upc": "811725028367",
    "specs": {
      "Case Pack Quantity": "24 units",
      "Inner Pack Quantity": "6 units",
      "Case Pack Dimensions": "8.3 \" (L) x20.7 \" (W) x9.9 \"(H)",
      "Case Weight": "7.699992 lb",
      "Case Cube": "0.98 cubic feet",
      "Per Piece Weight": "0.320833"
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
      "imports",
      "new-arrivals",
      "closeouts"
    ],
    "category": "Electronics",
    "subcategory": "Cell Phone Accessories",
    "images": [
      "images/products/aw296-1.webp",
      "images/products/aw296-2.webp",
      "images/products/aw296-3.webp"
    ],
    "description": "Keep your devices charged while on the road with the Mochic 30W Dual Port USB-A and USB-C Car Charger in Black. Designed for convenient and efficient charging, this compact car charger features both a USB-A port and a USB-C port, allowing you to charge two compatible devices from a single vehicle power outlet. Features TruFast charging technology through the USB-C port, delivering up to 4 times faster charging compared to a standard 5W charger when used with compatible devices. The 30W charging capability makes it ideal for smartphones, tablets, and other USB-powered devices. Its compact, lightweight design fits conveniently into a vehicle's 12V accessory socket without taking up unnecessary space. Features a sleek black finish with metallic contact points. Comes packaged in a retail display box with a clear window and hanging loop.",
    "upc": "811725028343",
    "specs": {
      "Case Pack Quantity": "24 units",
      "Inner Pack Quantity": "6 units",
      "Case Pack Dimensions": "6.8 \" (L) x17.7 \" (W) x9.1 \"(H)",
      "Case Weight": "5.85 lb",
      "Case Cube": "0.63 cubic feet",
      "Per Piece Weight": "0.243750"
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
      "imports",
      "new-arrivals",
      "closeouts"
    ],
    "category": "Electronics",
    "subcategory": "Cell Phone Accessories",
    "images": [
      "images/products/aw295-1.webp",
      "images/products/aw295-2.webp",
      "images/products/aw295-3.webp"
    ],
    "description": "Keep your devices powered with the Mochic 30W Dual Port USB-A and USB-C Wall Charger in White. Designed for convenient and efficient charging, this compact wall adapter features both a USB-A port and a USB-C port, allowing you to charge two compatible devices from a single outlet. Features TruFast charging technology through the USB-C port, delivering up to 4 times faster charging compared to a standard 5W charger when used with compatible devices. The 30W charging capability makes it ideal for smartphones, tablets, and other USB-powered devices. Its lightweight, compact design makes it convenient for use at home, in the office, or while traveling. Features a standard two-prong wall plug and a sleek white finish. Comes packaged in a retail display box with a clear window and hanging loop.",
    "upc": "811725028350",
    "specs": {
      "Case Pack Quantity": "24 units",
      "Inner Pack Quantity": "6 units",
      "Case Pack Dimensions": "7 \" (L) x17.7 \" (W) x9.1 \"(H)",
      "Case Weight": "7.099992 lb",
      "Case Cube": "0.65 cubic feet",
      "Per Piece Weight": "0.295833"
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
      "imports",
      "new-arrivals",
      "closeouts"
    ],
    "category": "Electronics",
    "subcategory": "Cell Phone Accessories",
    "images": [
      "images/products/aw293-1.webp",
      "images/products/aw293-2.webp",
      "images/products/aw293-3.webp"
    ],
    "description": "Power up your devices with the Quantum 10 Foot USB-C to USB-C Braided Charging Cable. Designed for durability and convenience, this cable features a strong braided exterior that helps resist tangling and everyday wear. The extra-long 10-foot length provides added flexibility when charging devices at home, in the office, or while traveling. Equipped with USB-C connectors on both ends, it is compatible with smartphones, tablets, newer MacBook models, and other USB-C devices. Features TruFast charging technology for faster charging when paired with a compatible 20W wall charger. Sleek metallic connector housings provide a modern finish, while the included cable tie keeps the cable neatly organized for storage. Comes packaged in a retail display box with a clear window and hanging tab.",
    "upc": "810012239059",
    "specs": {
      "Case Pack Quantity": "24 units",
      "Inner Pack Quantity": "1 units",
      "Case Pack Dimensions": "9.8 \" (L) x14.6 \" (W) x7.9 \"(H)",
      "Case Weight": "7.699992 lb",
      "Case Cube": "0.65 cubic feet",
      "Per Piece Weight": "0.320833"
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
      "imports",
      "new-arrivals",
      "closeouts"
    ],
    "category": "Electronics",
    "subcategory": "Cell Phone Accessories",
    "images": [
      "images/products/aw284-1.webp",
      "images/products/aw284-2.webp",
      "images/products/aw284-3.webp"
    ],
    "description": "Stay connected with the Mochic 10 Foot USB-A to USB-C Braided Charging Cable. Designed for convenient and reliable charging, this cable features a strong braided exterior that helps prevent tangling and withstand everyday wear. The extra-long 10-foot length provides added flexibility, allowing you to comfortably charge your devices from a distance. Features a USB-A connector on one end and a USB-C connector on the other, making it ideal for compatible smartphones, tablets, and other USB-C devices. Supports fast charging when paired with compatible devices and power adapters. Includes sleek metallic connector housings and a convenient cable tie for easy organization and storage. Comes packaged in a retail display box with a clear window and hanging loop.",
    "upc": "811725020026",
    "specs": {
      "Case Pack Quantity": "24 units",
      "Inner Pack Quantity": "6 units",
      "Case Pack Dimensions": "9.6 \" (L) x15.3 \" (W) x7.2 \"(H)",
      "Case Weight": "7.549992 lb",
      "Case Cube": "0.61 cubic feet",
      "Per Piece Weight": "0.314583"
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
      "imports",
      "new-arrivals",
      "closeouts"
    ],
    "category": "Automotive Supplies",
    "subcategory": "Auto Interior Accessories",
    "images": [
      "images/products/aw004-1.webp",
      "images/products/aw004-2.webp",
      "images/products/aw004-3.webp"
    ],
    "description": "Turn your car’s cup holder into a convenient on-the-go dining and storage station with the Bytech Tech Bits Universal Auto Cup Holder Food Tray. Designed to fit most vehicle cup holders measuring approximately 2.56\"–3.7\" wide, it features secure rubber mounting points to help hold it in place without scratching. The adjustable arm offers multiple positioning options, including 180° angle adjustment and 360° tray rotation, while the built-in phone holder keeps your device upright and within reach. A non-slip silicone tray liner helps keep food and small items from sliding around, making it ideal for meals, snacks, commuting, and road trips. Comes packaged in a retail box.",
    "upc": "805112085835",
    "specs": {
      "Case Pack Quantity": "24 units",
      "Inner Pack Quantity": "4 units",
      "Case Pack Dimensions": "15.7 \" (L) x21 \" (W) x27.3 \"(H)",
      "Case Weight": "24.6 lb",
      "Case Cube": "5.21 cubic feet",
      "Per Piece Weight": "1.025000"
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
      "imports",
      "new-arrivals",
      "closeouts"
    ],
    "category": "Electronics",
    "subcategory": "Cell Phone Accessories",
    "images": [
      "images/products/av014-1.webp",
      "images/products/av014-2.webp",
      "images/products/av014-3.webp"
    ],
    "description": "Keep your phone comfortably in view with the Bytech Universal Flexible Clip-On Smartphone Holder Grip. The sturdy clip-on base attaches securely to tables, desks, counters, and other compatible surfaces, while the flexible gooseneck arm lets you bend and position your phone at the angle that works best for you. The adjustable holder fits most smartphones approximately 2\" to 3.5\" wide, making it great for watching videos, video calls, following recipes, or hands-free browsing. Its compact, versatile design makes it easy to use at home, work, or while traveling. Comes packaged in a retail box with a hanging tab.",
    "upc": "805112049950",
    "specs": {
      "Case Pack Quantity": "40 units",
      "Inner Pack Quantity": "4 units",
      "Case Pack Dimensions": "13 \" (L) x15.3 \" (W) x26.2 \"(H)",
      "Case Weight": "18.15 lb",
      "Case Cube": "3.02 cubic feet",
      "Per Piece Weight": "0.453750"
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
      "imports",
      "new-arrivals",
      "closeouts"
    ],
    "category": "Electronics",
    "subcategory": "Cell Phone Accessories",
    "images": [
      "images/products/av010-1.webp",
      "images/products/av010-2.webp",
      "images/products/av010-3.webp"
    ],
    "description": "Keep your tablet secure, accessible, and perfectly positioned on the road with the Bytech Universal Suction Cup Car Tablet Mount! Designed for convenience and versatility, this adjustable windshield mount transforms your tablet into an easy-to-view navigation and entertainment companion. The powerful suction cup attaches securely to your vehicle's windshield, while the expandable holder accommodates most tablets up to 7 inches wide, including 7- to 10-inch tablets. Featuring a flexible adjustable arm, swivel joint, and 360-degree rotating design, it allows you to customize your viewing angle for optimal visibility in portrait or landscape orientation. The sturdy, adjustable grips help keep your device securely in place while driving, making it ideal for GPS navigation, road trips, and hands-free viewing while parked. Sleek, practical, and easy to install, this universal tablet mount comes packaged in a retail hanging box.",
    "upc": "805112028696",
    "specs": {
      "Case Pack Quantity": "40 units",
      "Inner Pack Quantity": "4 units",
      "Case Pack Dimensions": "18.5 \" (L) x19.6 \" (W) x23.8 \"(H)",
      "Case Weight": "23.5 lb",
      "Case Cube": "4.99 cubic feet",
      "Per Piece Weight": "0.587500"
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
      "imports",
      "new-arrivals",
      "closeouts"
    ],
    "category": "Electronics",
    "subcategory": "Computer & Tablet Accessories",
    "images": [
      "images/products/av006-1.webp",
      "images/products/av006-2.webp",
      "images/products/av006-3.webp"
    ],
    "description": "Stay connected for video calls, virtual meetings, online classes, livestreams, and more with the Bytech 480P PC Webcam with Mic in Black. Designed for laptops and desktop computers, this easy-to-use webcam delivers 480P streaming video with clear, true-color images and features a built-in microphone for convenient audio with sound clarity up to 10 meters. The adjustable 180° rotating clip makes it easy to position on your monitor, while the plug-and-play design offers quick setup. Features USB and 3.5mm connections and is compatible with Windows, Linux, and other operating systems. Comes packaged in a retail box with hanging tab.",
    "upc": "805112067411",
    "specs": {
      "Case Pack Quantity": "40 units",
      "Inner Pack Quantity": "4 units",
      "Case Pack Dimensions": "11.5 \" (L) x17.4 \" (W) x25.6 \"(H)",
      "Case Weight": "16.05 lb",
      "Case Cube": "2.96 cubic feet",
      "Per Piece Weight": "0.401250"
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
      "imports",
      "new-arrivals",
      "closeouts"
    ],
    "category": "Lighting",
    "subcategory": "Lamps & Lighting",
    "images": [
      "images/products/av003-1.webp",
      "images/products/av003-2.webp",
      "images/products/av003-3.webp"
    ],
    "description": "Add a playful pop of shine to any space with the Room 2 Room 7\" Battery Powered Figural Lamp in Assorted Metallic finishes. This compact accent lamp features a quirky sculptural character base with a glossy metallic look, topped with a clear faceted shade that beautifully reflects the light for extra sparkle. Battery-powered for easy cordless placement, it’s perfect for nightstands, desks, shelves, dorm rooms, or anywhere that could use a fun decorative glow. Measures approximately 7\" tall and comes in assorted metallic finishes. Comes packaged with a hang tag.",
    "upc": "731015335589",
    "specs": {
      "Case Pack Quantity": "12 units",
      "Inner Pack Quantity": "1 units",
      "Case Pack Dimensions": "13.6 \" (L) x17.3 \" (W) x8.6 \"(H)",
      "Case Weight": "10.149996 lb",
      "Case Cube": "1.17 cubic feet",
      "Per Piece Weight": "0.845833"
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
      "imports",
      "new-arrivals",
      "closeouts"
    ],
    "category": "Lighting",
    "subcategory": "Lamps & Lighting",
    "images": [
      "images/products/av997-1.webp",
      "images/products/av997-2.webp",
      "images/products/av997-3.webp"
    ],
    "description": "Create a mesmerizing glow with the Bytech Illuminous Iridescent Square LED Lamp. Featuring a clear iridescent cube design with a smaller inner cube, this decorative lamp reflects and refracts the built-in LED light to produce a colorful 3D visual effect that shifts beautifully from different angles. The illuminating multicolor display adds a modern accent to desks, nightstands, shelves, gaming setups, dorm rooms, and more. Battery-operated for easy cordless placement, it can be displayed almost anywhere without needing a nearby outlet. Comes packaged in a clear retail box.",
    "upc": "805112124480",
    "specs": {
      "Case Pack Quantity": "40 units",
      "Inner Pack Quantity": "4 units",
      "Case Pack Dimensions": "13.8 \" (L) x21.3 \" (W) x27.2 \"(H)",
      "Case Weight": "21.1 lb",
      "Case Cube": "4.63 cubic feet",
      "Per Piece Weight": "0.527500"
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
      "imports",
      "new-arrivals",
      "closeouts"
    ],
    "category": "Lighting",
    "subcategory": "Lamps & Lighting",
    "images": [
      "images/products/av996-1.webp",
      "images/products/av996-2.webp",
      "images/products/av996-3.webp"
    ],
    "description": "Light up every shot with the Bytech Multicolor LED Basketball Hoop Light with Remote. Designed to mount around a basketball rim, this vibrant LED strip features four colors and eight lighting modes to add an exciting glow to nighttime games, backyard hoops, and indoor play. Use the included 13-key infrared remote to switch modes, adjust brightness, and control the lights from a distance. The battery-operated design eliminates the need for a nearby outlet, while IPX4 weather resistance helps protect against splashes and outdoor conditions. Easy to install with the included mounting Velcro and cable ties. Includes LED strip cable, remote control, mounting Velcro, 6 cable ties, and user manual. Comes packaged in a retail box with carrying handle.",
    "upc": "805112119028",
    "specs": {
      "Case Pack Quantity": "40 units",
      "Inner Pack Quantity": "4 units",
      "Case Pack Dimensions": "9.4 \" (L) x15.5 \" (W) x33.2 \"(H)",
      "Case Weight": "13.6 lb",
      "Case Cube": "2.80 cubic feet",
      "Per Piece Weight": "0.340000"
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
      "imports",
      "new-arrivals",
      "closeouts"
    ],
    "category": "Electronics",
    "subcategory": "Headphones",
    "images": [
      "images/products/av989-1.webp",
      "images/products/av989-2.webp",
      "images/products/av989-3.webp"
    ],
    "description": "Enjoy clear, comfortable listening with the Bytech DJ Style Wired Headphones in Red. Featuring a bold red-and-black over-ear design with cushioned ear pads and an adjustable headband, these headphones are made for everyday music, videos, gaming, and more. The 40mm drivers deliver stereo sound across a 20Hz–20kHz frequency range, while the 3.5mm stereo plug provides easy wired connectivity with compatible phones, tablets, laptops, and audio devices. A long red cable gives you extra room to move, and the lightweight DJ-style design adds a sporty look. Comes packaged in a retail box with hanging tab.",
    "upc": "805112312917",
    "specs": {
      "Case Pack Quantity": "40 units",
      "Inner Pack Quantity": "4 units",
      "Case Pack Dimensions": "13.3 \" (L) x17.3 \" (W) x29.6 \"(H)",
      "Case Weight": "19.65 lb",
      "Case Cube": "3.94 cubic feet",
      "Per Piece Weight": "0.491250"
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
      "imports",
      "new-arrivals",
      "closeouts"
    ],
    "category": "Lighting",
    "subcategory": "Lamps & Lighting",
    "images": [
      "images/products/aw404-1.webp",
      "images/products/aw404-2.webp",
      "images/products/aw404-3.webp"
    ],
    "description": "Illuminate your workspace with the Stance COB LED Rotating Work Light with Magnetic Base in Assorted Colors. Featuring a powerful 200-lumen COB LED that produces bright white light, this compact work light is perfect for home repairs, automotive maintenance, workshops, garages, and emergency use. The 360-degree pivoting head allows you to direct light exactly where needed, while the adjustable stand provides hands-free convenience. A built-in magnetic base allows easy attachment to metal surfaces for added versatility. Measures approximately 5\" tall x 3.5\" wide x 1.25\" deep. Operates on 4 AAA batteries, which are included, and provides up to 10 hours of runtime. Available in black and yellow. Comes packaged in a retail box with a hanging tab.",
    "upc": "900210621258",
    "specs": {
      "Case Pack Quantity": "48 units",
      "Inner Pack Quantity": "12 units",
      "Case Pack Dimensions": "18 \" (L) x11.2 \" (W) x22.3 \"(H)",
      "Case Weight": "20.000016 lb",
      "Case Cube": "2.60 cubic feet",
      "Per Piece Weight": "0.416667"
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
      "imports",
      "new-arrivals",
      "closeouts"
    ],
    "category": "Kitchen & Dining",
    "subcategory": "Kitchen Tools & Utensils",
    "images": [
      "images/products/aw303-1.webp",
      "images/products/aw303-2.webp",
      "images/products/aw303-3.webp"
    ],
    "description": "Bring a playful safari-inspired touch to your kitchen with the Zooniverse Ceramic Blue Elephant Salt & Pepper Shakers! This adorable two-piece set features a pair of cheerful blue elephants with oversized pink ears, raised trunks, sweet closed-eye expressions, and charming sculpted details. Crafted from glossy ceramic with a smooth finish, these whimsical shakers add a delightful pop of color and personality to any kitchen countertop or dining table. Perfect for everyday seasoning, safari-themed gatherings, or adding a fun decorative accent to your home, this charming set makes a wonderful gift for elephant lovers, animal enthusiasts, and collectors of unique kitchen accessories. Comes packaged in a colorful safari-themed illustrated box, making it ideal for gifting.",
    "upc": "617521650562",
    "specs": {
      "Case Pack Quantity": "48 units",
      "Inner Pack Quantity": "1 units",
      "Case Pack Dimensions": "12.9 \" (L) x20.3 \" (W) x12.1 \"(H)",
      "Case Weight": "23.199984 lb",
      "Case Cube": "1.83 cubic feet",
      "Per Piece Weight": "0.483333"
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
      "imports",
      "new-arrivals",
      "closeouts"
    ],
    "category": "Apparel",
    "subcategory": "Backpacks & Duffel Bags",
    "images": [
      "images/products/aw235-1.webp",
      "images/products/aw235-2.webp",
      "images/products/aw235-3.webp"
    ],
    "description": "Bring prehistoric adventure to school days, travel, and everyday outings with the Universal Studios Jurassic World Nature Takes Over 16\" Backpack. The bold front design features a T. rex surrounded by lush jungle scenery with the phrase \"Nature Takes Over,\" while a contrasting side panel showcases colorful dinosaur and geometric graphics. A spacious zippered main compartment provides room for books, folders, clothing, and other essentials, and dual mesh side pockets keep water bottles or smaller items within easy reach. Finished with adjustable padded shoulder straps, a top carry handle, bright blue trim, and coordinating zipper pulls. Comes packaged with a Jurassic World hang tag.",
    "upc": "840716297925",
    "specs": {
      "Case Pack Quantity": "12 units",
      "Inner Pack Quantity": "1 units",
      "Case Pack Dimensions": "13.9 \" (L) x17.9 \" (W) x8.6 \"(H)",
      "Case Weight": "9.950004 lb",
      "Case Cube": "1.24 cubic feet",
      "Per Piece Weight": "0.829167"
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
      "imports",
      "new-arrivals",
      "closeouts"
    ],
    "category": "Apparel",
    "subcategory": "Socks",
    "images": [
      "images/products/aw258-1.webp",
      "images/products/aw258-2.webp",
      "images/products/aw258-3.webp"
    ],
    "description": "Bring some high-speed fun to everyday outfits with this 6-Pack Sonic the Hedgehog No Show Socks. Inspired by the popular SEGA video game character, this colorful set features six unique designs showcasing Sonic the Hedgehog, his signature blue color, gold rings, and fun graphics. The assortment includes shades of blue, navy, gray, and white with character prints, playful patterns, and bold lettering. Made with soft, stretchy fabric for a comfortable fit, these socks feature a low-cut, no-show design that pairs perfectly with sneakers and casual footwear. Ideal for school, playtime, everyday wear, or gifting to Sonic fans. Fits children's shoe sizes 9-2.5. Comes packaged as a 6-pair set with a branded Sonic the Hedgehog tag.",
    "upc": "086694643433",
    "specs": {
      "Case Pack Quantity": "24 units",
      "Inner Pack Quantity": "2 units",
      "Case Pack Dimensions": "7.3 \" (L) x12 \" (W) x12.3 \"(H)",
      "Case Weight": "4.95 lb",
      "Case Cube": "0.62 cubic feet",
      "Per Piece Weight": "0.206250"
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
      "imports",
      "new-arrivals",
      "closeouts"
    ],
    "category": "Crafts",
    "subcategory": "Do-it-yourself Craft Kits",
    "images": [
      "images/products/aw246-1.webp",
      "images/products/aw246-2.webp",
      "images/products/aw246-3.webp"
    ],
    "description": "Bring the magic of Disney's Encanto to life with the Encanto 2 Piece Paint Your Own Figurine Set! This fun and creative activity kit includes two ready-to-paint figurines featuring an adorable jaguar and a decorative butterfly, each with raised details for easy painting. Kids can express their creativity using the six vibrant paint colors and two included paintbrushes to design their own colorful masterpieces. Once finished, the figurines make charming decorations to proudly display. Perfect for arts and crafts, rainy-day activities, and Disney fans ages 6 and up. Includes 2 figurines, 2 paintbrushes, and 6 paint pots (0.085 fl oz each). Comes packaged in a colorful 9\" x 6\" x 4\" window display box.",
    "upc": "191537132491",
    "specs": {
      "Case Pack Quantity": "12 units",
      "Inner Pack Quantity": "1 units",
      "Case Pack Dimensions": "13.1 \" (L) x19 \" (W) x12.2 \"(H)",
      "Case Weight": "12.75 lb",
      "Case Cube": "1.76 cubic feet",
      "Per Piece Weight": "1.062500"
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
  },
  {
    "sku": "AW256",
    "title": "3 Pack Strawberry Shortcake Mid Crew Ribbed Socks Size 9-11",
    "price": 4.4,
    "originalPrice": 2.2,
    "sourceUrl": "https://www.koleimports.com/3-pack-strawberry-shortcake-mid-crew-ribbed-socks-size-9-11-aw256",
    "sourceCheckedAt": "2026-11-04",
    "stock": 5741,
    "badges": [
      "new",
      "closeout"
    ],
    "collections": [
      "imports",
      "new-arrivals",
      "closeouts"
    ],
    "category": "Apparel",
    "subcategory": "Socks",
    "images": [
      "images/products/aw256-1.webp",
      "images/products/aw256-2.webp",
      "images/products/aw256-3.webp"
    ],
    "description": "Add a sweet and playful touch to your everyday wardrobe with this 3-Pack Strawberry Shortcake Mid Crew Ribbed Socks. Inspired by the beloved Strawberry Shortcake character, this adorable set features three unique designs in cheerful shades of pink, red, and gray. One pair features a gray background with Strawberry Shortcake character graphics, strawberries, and floral accents, while the second pair features a solid pink background with a strawberry graphic. The third pair showcases colorful red, pink, and green stripes with a Strawberry Shortcake character design. Made with soft, stretchy fabric and ribbed cuffs for a comfortable fit, these mid-crew socks are perfect for everyday wear, casual outfits, or gifting to Strawberry Shortcake fans. Fits sock size 9-11. Comes packaged as a 3-pair set with a branded tag.",
    "upc": "086694726280",
    "specs": {
      "Case Pack Quantity": "60 units",
      "Inner Pack Quantity": "6 units",
      "Case Pack Dimensions": "12.4 \" (L) x20.5 \" (W) x9.8 \"(H)",
      "Case Weight": "14.7 lb",
      "Case Cube": "1.44 cubic feet",
      "Per Piece Weight": "0.245000"
    },
    "rules": {
      "lot": 6,
      "moq": 12,
      "caseQty": 60,
      "physicalCase": 60,
      "innerPack": 6
    },
    "californiaWarning": false,
    "californiaWarningText": null,
    "newestRank": 26
  },
  {
    "sku": "AW255",
    "title": "2 Pack Nightmare Before Christmas Mid Crew Ribbed Socks Size 9-11",
    "price": 3.3,
    "originalPrice": 1.65,
    "sourceUrl": "https://www.koleimports.com/2-pack-nightmare-before-christmas-mid-crew-ribbed-socks-size-9-11-aw255",
    "sourceCheckedAt": "2026-11-04",
    "stock": 3377,
    "badges": [
      "new",
      "closeout"
    ],
    "collections": [
      "imports",
      "new-arrivals",
      "closeouts"
    ],
    "category": "Apparel",
    "subcategory": "Socks",
    "images": [
      "images/products/aw255-1.webp",
      "images/products/aw255-2.webp"
    ],
    "description": "Add a touch of spooky charm to your everyday wardrobe with this 2-Pack The Nightmare Before Christmas Mid Crew Ribbed Socks. Inspired by Disney's beloved movie, this set features two colorful designs showcasing fan-favorite characters Jack Skellington and Zero. One pair features a tan background with Jack Skellington graphics, skulls, and decorative circles, while the other features a light blue background with Zero, bats, stars, and playful accents. Made with soft, stretchy fabric and ribbed cuffs for a comfortable fit, these mid-crew socks are perfect for pairing with sneakers, boots, or casual footwear. Ideal for everyday wear, Halloween festivities, or gifting to Nightmare Before Christmas fans. Fits sock size 9-11. Comes packaged as a 2-pair set with a branded tag and plastic hanger.",
    "upc": "086694748404",
    "specs": {
      "Case Pack Quantity": "60 units",
      "Inner Pack Quantity": "6 units",
      "Case Pack Dimensions": "12.1 \" (L) x22.4 \" (W) x7.1 \"(H)",
      "Case Weight": "10.35 lb",
      "Case Cube": "1.11 cubic feet",
      "Per Piece Weight": "0.172500"
    },
    "rules": {
      "lot": 6,
      "moq": 18,
      "caseQty": 60,
      "physicalCase": 60,
      "innerPack": 6
    },
    "californiaWarning": false,
    "californiaWarningText": null,
    "newestRank": 27
  },
  {
    "sku": "AW252",
    "title": "10 Pack Wonder Nation Girls No Show Socks in Space Dye Assorted Colors",
    "price": 6.6,
    "originalPrice": 3.3,
    "sourceUrl": "https://www.koleimports.com/10-pack-wonder-nation-girls-no-show-socks-in-space-dye-assorted-colors-aw252",
    "sourceCheckedAt": "2026-11-04",
    "stock": 2187,
    "badges": [
      "new",
      "closeout"
    ],
    "collections": [
      "imports",
      "new-arrivals",
      "closeouts"
    ],
    "category": "Apparel",
    "subcategory": "Socks",
    "images": [
      "images/products/aw252-1.webp",
      "images/products/aw252-2.webp",
      "images/products/aw252-3.webp"
    ],
    "description": "Keep little feet comfortable and stylish with the Wonder Nation Girls' 10-Pack No Show Socks in Assorted Colors. This convenient set includes 10 pairs of socks in a variety of vibrant colors, including pink, purple, turquoise, yellow, blue, and neutral shades. Featuring a mix of solid colors and space-dye patterns, these socks add a fun touch to everyday outfits. The low-cut, no-show design makes them ideal for wearing with sneakers and casual shoes, while the soft, stretchy fabric provides a comfortable fit for school, playtime, and daily activities. Designed for girls' shoe sizes 10.5-4 (Medium). Machine washable for easy care. Comes packaged in a 10-pair bundle with a branded cardboard hanger for convenient storage and display.",
    "upc": "086694599877",
    "specs": {
      "Case Pack Quantity": "24 units",
      "Inner Pack Quantity": "2 units",
      "Case Pack Dimensions": "12.4 \" (L) x17 \" (W) x8.9 \"(H)",
      "Case Weight": "9.949992 lb",
      "Case Cube": "1.09 cubic feet",
      "Per Piece Weight": "0.414583"
    },
    "rules": {
      "lot": 2,
      "moq": 8,
      "caseQty": 24,
      "physicalCase": 24,
      "innerPack": 2
    },
    "californiaWarning": false,
    "californiaWarningText": null,
    "newestRank": 28
  },
  {
    "sku": "AV439",
    "title": "Hampton Art Crate Decor 4 Pack Ready to Decorate Made with Love Signs",
    "price": 1.3,
    "originalPrice": 0.65,
    "sourceUrl": "https://www.koleimports.com/hampton-art-crate-decor-4-pack-ready-to-decorate-made-with-love-signs-av439",
    "sourceCheckedAt": "2026-11-04",
    "stock": 13259,
    "badges": [
      "new",
      "closeout"
    ],
    "collections": [
      "imports",
      "new-arrivals",
      "closeouts"
    ],
    "category": "Crafts",
    "subcategory": "Craft Embellishments",
    "images": [
      "images/products/av439-1.webp",
      "images/products/av439-2.webp",
      "images/products/av439-3.webp"
    ],
    "description": "Personalize crates, gift boxes, storage bins, party décor, and handmade projects with the Hampton Art Crate Décor Made With Love Sign Set. This 4-piece collection features unfinished wooden designs including “Happy Birthday,” “Thank You,” “With Love xoxo,” and “Congrats!” Each piece is ready to decorate with paint, markers, stain, glitter, embellishments, or other craft materials, making it easy to create a custom look for celebrations, gifts, and home décor. Designs measure up to approximately 6.1\" x 3.57\" and come packaged together in a clear hanging pouch.",
    "upc": "729632300066",
    "specs": {
      "Case Pack Quantity": "24 units",
      "Inner Pack Quantity": "3 units",
      "Case Pack Dimensions": "7.2 \" (L) x9.4 \" (W) x10.9 \"(H)",
      "Case Weight": "4.150008 lb",
      "Case Cube": "0.43 cubic feet",
      "Per Piece Weight": "0.172917"
    },
    "rules": {
      "lot": 3,
      "moq": 36,
      "caseQty": 36,
      "physicalCase": 24,
      "innerPack": 3
    },
    "californiaWarning": false,
    "californiaWarningText": null,
    "newestRank": 29
  },
  {
    "sku": "AV445",
    "title": "Hampton Art 4 Pack 6\" x 4.25\" Crate Decor Wooden Chalkboard Labels",
    "price": 1.3,
    "originalPrice": 0.65,
    "sourceUrl": "https://www.koleimports.com/hampton-art-4-pack-6-x-4-25-crate-decor-wooden-chalkboard-labels-av445",
    "sourceCheckedAt": "2026-11-04",
    "stock": 7740,
    "badges": [
      "new",
      "closeout"
    ],
    "collections": [
      "imports",
      "new-arrivals",
      "closeouts"
    ],
    "category": "Crafts",
    "subcategory": "Craft Paper & Boards",
    "images": [
      "images/products/av445-1.webp",
      "images/products/av445-2.webp",
      "images/products/av445-3.webp"
    ],
    "description": "Add a functional, customizable accent to crates, baskets, storage bins, and DIY décor with Hampton Art Crate Décor Wooden Chalkboard Labels. This 4-piece set features decorative wooden labels with black chalkboard-style surfaces, perfect for adding names, contents, messages, prices, or creative designs to organization and display projects. Each label measures approximately 6\" x 4.25\", offering plenty of space for easy-to-read personalization. Ideal for pantry storage, craft rooms, market displays, gift baskets, farmhouse décor, and home organization, these reusable-style labels bring both practicality and charm to your setup. The set includes 4 wooden chalkboard labels packaged together in a clear hanging pouch.",
    "upc": "729632300219",
    "specs": {
      "Case Pack Quantity": "24 units",
      "Inner Pack Quantity": "3 units",
      "Case Pack Dimensions": "7.2 \" (L) x12.7 \" (W) x6 \"(H)",
      "Case Weight": "4.699992 lb",
      "Case Cube": "0.32 cubic feet",
      "Per Piece Weight": "0.195833"
    },
    "rules": {
      "lot": 3,
      "moq": 36,
      "caseQty": 36,
      "physicalCase": 24,
      "innerPack": 3
    },
    "californiaWarning": false,
    "californiaWarningText": null,
    "newestRank": 30
  },
  {
    "sku": "AV444",
    "title": "Hampton Art 4 Pack 6\" x 4\" Crate Decor Wooden Chalkboard Tags",
    "price": 1.3,
    "originalPrice": 0.65,
    "sourceUrl": "https://www.koleimports.com/hampton-art-4-pack-6-x-4-crate-decor-wooden-chalkboard-tags-av444",
    "sourceCheckedAt": "2026-11-04",
    "stock": 23718,
    "badges": [
      "new",
      "closeout"
    ],
    "collections": [
      "imports",
      "new-arrivals",
      "closeouts"
    ],
    "category": "Crafts",
    "subcategory": "Craft Paper & Boards",
    "images": [
      "images/products/av444-1.webp",
      "images/products/av444-2.webp",
      "images/products/av444-3.webp"
    ],
    "description": "Add functional style and a customizable touch to crates, storage bins, baskets, and DIY projects with Hampton Art Crate Décor Wooden Chalkboard Tags. This 4-piece set features classic tag-shaped wooden pieces finished with black chalkboard-style surfaces and pre-cut hanging holes for easy attachment. Personalize them with names, labels, messages, prices, or decorative designs for home organization, pantry storage, craft rooms, gift baskets, party displays, market setups, and creative décor projects. The set includes 4 wooden chalkboard tags packaged together in a clear hanging pouch for convenient storage and display.",
    "upc": "729632300202",
    "specs": {
      "Case Pack Quantity": "24 units",
      "Inner Pack Quantity": "3 units",
      "Case Pack Dimensions": "7.2 \" (L) x9.8 \" (W) x6.1 \"(H)",
      "Case Weight": "4.2 lb",
      "Case Cube": "0.25 cubic feet",
      "Per Piece Weight": "0.175000"
    },
    "rules": {
      "lot": 3,
      "moq": 36,
      "caseQty": 36,
      "physicalCase": 24,
      "innerPack": 3
    },
    "californiaWarning": false,
    "californiaWarningText": null,
    "newestRank": 31
  },
  {
    "sku": "AV441",
    "title": "Hampton Art Crate Decor 4 Pack Ready to Decorate 9\" Harvest Signs",
    "price": 1.3,
    "originalPrice": 0.65,
    "sourceUrl": "https://www.koleimports.com/hampton-art-crate-decor-4-pack-ready-to-decorate-9-harvest-signs-av441",
    "sourceCheckedAt": "2026-11-04",
    "stock": 10944,
    "badges": [
      "new",
      "closeout"
    ],
    "collections": [
      "imports",
      "new-arrivals",
      "closeouts"
    ],
    "category": "Crafts",
    "subcategory": "Craft Embellishments",
    "images": [
      "images/products/av441-1.webp",
      "images/products/av441-2.webp",
      "images/products/av441-3.webp"
    ],
    "description": "Create warm seasonal accents with the Hampton Art Crate Décor Harvest Sign Set. This 4-piece collection features unfinished wooden designs with harvest-inspired sayings including “Harvest,” “Hand Picked,” “Home Sweet Home,” and “Celebrate.” The pieces are ready to customize with paint, stain, markers, glitter, or other decorative materials, making them ideal for fall crates, baskets, centerpieces, farmhouse décor, and seasonal DIY projects. Designs range in size up to approximately 9\" and come packaged together for convenient crafting and storage.",
    "upc": "729632300103",
    "specs": {
      "Case Pack Quantity": "24 units",
      "Inner Pack Quantity": "3 units",
      "Case Pack Dimensions": "4.8 \" (L) x11.5 \" (W) x12.2 \"(H)",
      "Case Weight": "3.049992 lb",
      "Case Cube": "0.39 cubic feet",
      "Per Piece Weight": "0.127083"
    },
    "rules": {
      "lot": 3,
      "moq": 36,
      "caseQty": 36,
      "physicalCase": 24,
      "innerPack": 3
    },
    "californiaWarning": false,
    "californiaWarningText": null,
    "newestRank": 32
  },
  {
    "sku": "AV440",
    "title": "Hampton Art Crate Decor 4 Pack Ready to Decorate 5\" Home & Garden Signs",
    "price": 1.3,
    "originalPrice": 0.65,
    "sourceUrl": "https://www.koleimports.com/hampton-art-crate-decor-4-pack-ready-to-decorate-5-home-garden-signs-av440",
    "sourceCheckedAt": "2026-11-04",
    "stock": 9107,
    "badges": [
      "new",
      "closeout"
    ],
    "collections": [
      "imports",
      "new-arrivals",
      "closeouts"
    ],
    "category": "Crafts",
    "subcategory": "Craft Embellishments",
    "images": [
      "images/products/av440-1.webp",
      "images/products/av440-2.webp",
      "images/products/av440-3.webp"
    ],
    "description": "Give crates, planters, storage bins, and DIY décor a personalized touch with the Hampton Art Crate Décor Home & Garden Sign Set. This 4-piece collection includes unfinished wooden designs featuring a tool gear, “Toys” star, watering can, and floral motif. Each piece measures approximately 5\" x 5\" and is ready to decorate with paint, stain, markers, glitter, or other craft embellishments. Perfect for garden-themed projects, kids’ storage, home organization, and seasonal décor, the set comes packaged together in a clear hanging pouch for convenient storage and display.",
    "upc": "729632300073",
    "specs": {
      "Case Pack Quantity": "24 units",
      "Inner Pack Quantity": "3 units",
      "Case Pack Dimensions": "7.8 \" (L) x11.1 \" (W) x7.3 \"(H)",
      "Case Weight": "3.199992 lb",
      "Case Cube": "0.37 cubic feet",
      "Per Piece Weight": "0.133333"
    },
    "rules": {
      "lot": 3,
      "moq": 36,
      "caseQty": 36,
      "physicalCase": 24,
      "innerPack": 3
    },
    "californiaWarning": false,
    "californiaWarningText": null,
    "newestRank": 33
  },
  {
    "sku": "AV385",
    "title": "Leisure Arts Essentials 75 Pack 5.75\" Skinny Wood Craft Sticks",
    "price": 1.6,
    "originalPrice": 0.8,
    "sourceUrl": "https://www.koleimports.com/leisure-arts-essentials-75-pack-5-75-skinny-wood-craft-sticks-av385",
    "sourceCheckedAt": "2026-11-04",
    "stock": 1587,
    "badges": [
      "new",
      "closeout"
    ],
    "collections": [
      "imports",
      "new-arrivals",
      "closeouts"
    ],
    "category": "Crafts",
    "subcategory": "Wood Craft Sticks",
    "images": [
      "images/products/av385-1.webp",
      "images/products/av385-2.webp"
    ],
    "description": "Stock up for creative projects with the Leisure Arts Essentials 75 Pack 5.75\" Skinny Wood Craft Sticks, a versatile crafting staple for classrooms, DIY projects, decorations, model making, and more. Each natural wood stick measures approximately 5.75\" long with a slim profile that makes it easy to cut, glue, paint, stain, or decorate for a wide variety of crafts. Great for building miniature structures, signs, frames, school projects, ornaments, and other handmade creations, these wooden craft sticks are useful for both kids and adults. This pack includes 75 skinny wood craft sticks and comes packaged in a clear hanging bag for convenient storage and retail display.",
    "upc": "749075840066",
    "specs": {
      "Case Pack Quantity": "100 units",
      "Inner Pack Quantity": "1 units",
      "Case Pack Dimensions": "11.1 \" (L) x19.5 \" (W) x9.3 \"(H)",
      "Case Weight": "23.65 lb",
      "Case Cube": "1.16 cubic feet",
      "Per Piece Weight": "0.236500"
    },
    "rules": {
      "lot": 30,
      "moq": 30,
      "caseQty": 100,
      "physicalCase": 100,
      "innerPack": 1
    },
    "californiaWarning": false,
    "californiaWarningText": null,
    "newestRank": 34
  },
  {
    "sku": "AW403",
    "title": "Sassi Press On Nails with Adhesive Tabs in Pink Leopard",
    "price": 0.9,
    "originalPrice": 0.45,
    "sourceUrl": "https://www.koleimports.com/sassi-press-on-nails-with-adhesive-tabs-in-pink-leopard-aw403",
    "sourceCheckedAt": "2026-11-04",
    "stock": 2154,
    "badges": [
      "new",
      "closeout"
    ],
    "collections": [
      "imports",
      "new-arrivals",
      "closeouts"
    ],
    "category": "Cosmetics",
    "subcategory": "Nail Sets",
    "images": [
      "images/products/aw403-1.webp",
      "images/products/aw403-2.webp",
      "images/products/aw403-3.webp"
    ],
    "description": "Make a bold fashion statement with Sassi Press On Nails in Pink Leopard. This eye-catching set features 24 reusable press-on nails decorated with a playful leopard print pattern on a soft pink background. The black and golden-yellow animal print accents create a trendy, stylish look that's perfect for expressing your personality. Designed for quick and convenient application, these artificial nails come in assorted sizes to help achieve a comfortable, customized fit. The included adhesive tabs allow for easy application, making it simple to enjoy a salon-inspired manicure at home. Perfect for parties, special occasions, everyday wear, or adding a fun touch to any outfit. Includes 24 press-on nails and adhesive tabs. Comes packaged in a clear plastic retail case with a colorful Sassi branded insert.",
    "upc": "713836021063",
    "specs": {
      "Case Pack Quantity": "360 units",
      "Inner Pack Quantity": "6 units",
      "Case Pack Dimensions": "18.4 \" (L) x23.4 \" (W) x12.3 \"(H)",
      "Case Weight": "22.10004 lb",
      "Case Cube": "3.06 cubic feet",
      "Per Piece Weight": "0.061389"
    },
    "rules": {
      "lot": 6,
      "moq": 54,
      "caseQty": 360,
      "physicalCase": 360,
      "innerPack": 6
    },
    "californiaWarning": false,
    "californiaWarningText": null,
    "newestRank": 35
  },
  {
    "sku": "AW402",
    "title": "Sassi Press On Nails with Adhesive Tabs in Wavy Baby",
    "price": 0.9,
    "originalPrice": 0.45,
    "sourceUrl": "https://www.koleimports.com/sassi-press-on-nails-with-adhesive-tabs-in-wavy-baby-aw402",
    "sourceCheckedAt": "2026-11-04",
    "stock": 1416,
    "badges": [
      "new",
      "closeout"
    ],
    "collections": [
      "imports",
      "new-arrivals",
      "closeouts"
    ],
    "category": "Cosmetics",
    "subcategory": "Nail Sets",
    "images": [
      "images/products/aw402-1.webp",
      "images/products/aw402-2.webp",
      "images/products/aw402-3.webp"
    ],
    "description": "Refresh your manicure with a modern, playful look using Sassi Press On Nails in Wavy Baby. This stylish set features 24 reusable press-on nails with a glossy soft pink base and flowing white wave designs for a trendy, minimalist finish. The delicate curved patterns create a chic, contemporary look that's perfect for casual outings, special occasions, or everyday wear. Designed for quick and convenient application, these artificial nails come in assorted sizes to help achieve a comfortable, customized fit. The included adhesive tabs make it easy to create a salon-inspired manicure without the hassle of traditional nail polish. Includes 24 press-on nails and adhesive tabs. Comes packaged in a clear plastic retail case with a colorful Sassi branded insert.",
    "upc": "713836021056",
    "specs": {
      "Case Pack Quantity": "360 units",
      "Inner Pack Quantity": "6 units",
      "Case Pack Dimensions": "18.5 \" (L) x23.5 \" (W) x12.2 \"(H)",
      "Case Weight": "21.94992 lb",
      "Case Cube": "3.07 cubic feet",
      "Per Piece Weight": "0.060972"
    },
    "rules": {
      "lot": 6,
      "moq": 54,
      "caseQty": 360,
      "physicalCase": 360,
      "innerPack": 6
    },
    "californiaWarning": false,
    "californiaWarningText": null,
    "newestRank": 36
  },
  {
    "sku": "AW400",
    "title": "Sassi Press On Nails with Adhesive Tabs in Starlight",
    "price": 0.9,
    "originalPrice": 0.45,
    "sourceUrl": "https://www.koleimports.com/sassi-press-on-nails-with-adhesive-tabs-in-starlight-aw400",
    "sourceCheckedAt": "2026-11-04",
    "stock": 1728,
    "badges": [
      "new",
      "closeout"
    ],
    "collections": [
      "imports",
      "new-arrivals",
      "closeouts"
    ],
    "category": "Cosmetics",
    "subcategory": "Nail Sets",
    "images": [
      "images/products/aw400-1.webp",
      "images/products/aw400-2.webp",
      "images/products/aw400-3.webp"
    ],
    "description": "Create a dazzling, salon-inspired manicure in minutes with Sassi Press On Nails in Starlight. This beautiful set features 24 reusable press-on nails with a soft nude-pink base and sparkling silver holographic glitter accents that create a glamorous, shimmering finish. Designed for quick and convenient application, these artificial nails provide a stylish manicure without the need for a salon visit. The assortment includes multiple nail sizes to help achieve a comfortable, customized fit, while the included adhesive tabs make application simple and mess-free. Perfect for special occasions, parties, date nights, or everyday glamour. Includes 24 press-on nails and adhesive tabs. Comes packaged in a clear plastic retail case with a colorful Sassi branded insert.",
    "upc": "713836021018",
    "specs": {
      "Case Pack Quantity": "360 units",
      "Inner Pack Quantity": "6 units",
      "Case Pack Dimensions": "18.5 \" (L) x23.3 \" (W) x12.3 \"(H)",
      "Case Weight": "21.80016 lb",
      "Case Cube": "3.07 cubic feet",
      "Per Piece Weight": "0.060556"
    },
    "rules": {
      "lot": 6,
      "moq": 54,
      "caseQty": 360,
      "physicalCase": 360,
      "innerPack": 6
    },
    "californiaWarning": false,
    "californiaWarningText": null,
    "newestRank": 37
  },
  {
    "sku": "AW171",
    "title": "Lesa Michele 5\" x 8\" Multi Compartment Pink Blush Textured Travel Jewelry Organizer with Suede Interior",
    "price": 7.7,
    "originalPrice": 3.85,
    "sourceUrl": "https://www.koleimports.com/lesa-michele-5-x-8-multi-compartment-pink-blush-textured-travel-jewelry-organizer-with-suede-interior-aw171",
    "sourceCheckedAt": "2026-11-04",
    "stock": 844,
    "badges": [
      "new",
      "closeout"
    ],
    "collections": [
      "imports",
      "new-arrivals",
      "closeouts"
    ],
    "category": "Travel Goods",
    "subcategory": "Luggage Accessories",
    "images": [
      "images/products/aw171-1.webp",
      "images/products/aw171-2.webp",
      "images/products/aw171-3.webp"
    ],
    "description": "Give jewelry the storage it deserves with the Lesa Michele 5\" x 8\" Multi Compartment Pink Blush Textured Travel Jewelry Organizer. The soft blush-pink exterior opens to a coordinating suede-lined interior with thoughtfully arranged storage for rings, earrings, bracelets, necklaces, and other treasured accessories. Multiple compartments, cushioned ring rolls, necklace tabs, pockets, and a zippered section help keep pieces organized, protected, and easy to access. Its compact travel-friendly size makes it perfect for vacations, weekend trips, or creating a polished jewelry station at home.",
    "upc": "731015335541",
    "specs": {
      "Case Pack Quantity": "48 units",
      "Inner Pack Quantity": "1 units",
      "Case Pack Dimensions": "21.6 \" (L) x20.1 \" (W) x17.8 \"(H)",
      "Case Weight": "54.15 lb",
      "Case Cube": "4.47 cubic feet",
      "Per Piece Weight": "1.128125"
    },
    "rules": {
      "lot": 7,
      "moq": 7,
      "caseQty": 48,
      "physicalCase": 48,
      "innerPack": 1
    },
    "californiaWarning": false,
    "californiaWarningText": null,
    "newestRank": 38
  },
  {
    "sku": "AW399",
    "title": "Sassi Professional Quality White Emery Block",
    "price": 0.9,
    "originalPrice": 0.45,
    "sourceUrl": "https://www.koleimports.com/sassi-professional-quality-white-emery-block-aw399",
    "sourceCheckedAt": "2026-11-04",
    "stock": 1386,
    "badges": [
      "new",
      "closeout"
    ],
    "collections": [
      "imports",
      "new-arrivals",
      "closeouts"
    ],
    "category": "Cosmetics",
    "subcategory": "Nail Tools",
    "images": [
      "images/products/aw399-1.webp",
      "images/products/aw399-2.webp"
    ],
    "description": "Achieve smooth, beautifully shaped nails with the Sassi Professional Quality White Emery Block. This versatile nail care tool features a four-sided design with 120-grit abrasive surfaces, making it ideal for filing, shaping, and removing ridges from natural and artificial nails. The cushioned block is easy to hold and provides comfortable control for precise nail maintenance. Designed for use on acrylic, gel, and natural nails, this professional-quality emery block is washable, sanitizable, and reusable for convenient nail care. Perfect for at-home manicures, nail salons, and everyday grooming. Comes packaged in a clear plastic blister pack with a branded backing card for convenient retail display.",
    "upc": "713836834236",
    "specs": {
      "Case Pack Quantity": "192 units",
      "Inner Pack Quantity": "48 units",
      "Case Pack Dimensions": "13.1 \" (L) x19.8 \" (W) x17.3 \"(H)",
      "Case Weight": "10.050048 lb",
      "Case Cube": "2.60 cubic feet",
      "Per Piece Weight": "0.052344"
    },
    "rules": {
      "lot": 48,
      "moq": 96,
      "caseQty": 192,
      "physicalCase": 192,
      "innerPack": 48
    },
    "californiaWarning": false,
    "californiaWarningText": null,
    "newestRank": 39
  },
  {
    "sku": "AW169",
    "title": "Lesa Michele 4\" x 9\" Cobalt Blue Textured Travel Jewelry Organizer with Suede Interior",
    "price": 6.6,
    "originalPrice": 3.3,
    "sourceUrl": "https://www.koleimports.com/lesa-michele-4-x-9-cobalt-blue-textured-travel-jewelry-organizer-with-suede-interior-aw169",
    "sourceCheckedAt": "2026-11-04",
    "stock": 869,
    "badges": [
      "new",
      "closeout"
    ],
    "collections": [
      "imports",
      "new-arrivals",
      "closeouts"
    ],
    "category": "Travel Goods",
    "subcategory": "Travel Organization",
    "images": [
      "images/products/aw169-1.webp",
      "images/products/aw169-2.webp",
      "images/products/aw169-3.webp"
    ],
    "description": "Keep jewelry neatly organized and protected at home or on the go with the Lesa Michele Travel Jewelry Organizer. Measuring 4\" x 9\", this stylish case features a vibrant cobalt blue textured exterior, a matching soft suede interior, and elegant gold-tone zipper hardware. The spacious interior includes dedicated compartments for rings, earrings, bracelets, necklaces, watches, and other accessories. Features padded ring rolls, divided storage sections, an earring holder with snap closures, and elasticized pockets to keep smaller pieces organized and secure. A convenient top carrying handle makes it easy to transport, while the zip-around closure keeps contents safely enclosed. Perfect for travel, vacations, or everyday jewelry storage. Comes packaged with a branded hang tag.",
    "upc": "731015335527",
    "specs": {
      "Case Pack Quantity": "36 units",
      "Inner Pack Quantity": "1 units",
      "Case Pack Dimensions": "20.3 \" (L) x15.6 \" (W) x19.1 \"(H)",
      "Case Weight": "33.400008 lb",
      "Case Cube": "3.50 cubic feet",
      "Per Piece Weight": "0.927778"
    },
    "rules": {
      "lot": 8,
      "moq": 8,
      "caseQty": 36,
      "physicalCase": 36,
      "innerPack": 1
    },
    "californiaWarning": false,
    "californiaWarningText": null,
    "newestRank": 40
  },
  {
    "sku": "AW168",
    "title": "Lesa Michele 5\" x 7\" Blue Textured Travel Jewelry Organizer with Suede Interior",
    "price": 5.5,
    "originalPrice": 2.75,
    "sourceUrl": "https://www.koleimports.com/lesa-michele-5-x-7-blue-textured-travel-jewelry-organizer-with-suede-interior-aw168",
    "sourceCheckedAt": "2026-11-04",
    "stock": 811,
    "badges": [
      "new",
      "closeout"
    ],
    "collections": [
      "imports",
      "new-arrivals",
      "closeouts"
    ],
    "category": "Travel Goods",
    "subcategory": "Travel Organization",
    "images": [
      "images/products/aw168-1.webp",
      "images/products/aw168-2.webp",
      "images/products/aw168-3.webp"
    ],
    "description": "Keep favorite jewelry beautifully organized at home or on the go with the Lesa Michele 5\" x 7\" Blue Textured Travel Jewelry Organizer. The soft blue exterior opens to a plush suede-lined interior with dedicated storage for rings, earrings, necklaces, bracelets, and other small accessories. Multiple divided compartments, ring rolls, earring holes, necklace tabs, and a gathered pocket help keep pieces separated and easy to find while reducing tangles and scratches. The compact size makes it perfect for vacations, weekends away, gym bags, or everyday vanity storage, while the snap closure keeps everything neatly contained.",
    "upc": "731015335510",
    "specs": {
      "Case Pack Quantity": "60 units",
      "Inner Pack Quantity": "1 units",
      "Case Pack Dimensions": "25 \" (L) x16.14 \" (W) x14.96 \"(H)",
      "Case Weight": "44.89998 lb",
      "Case Cube": "3.49 cubic feet",
      "Per Piece Weight": "0.748333"
    },
    "rules": {
      "lot": 9,
      "moq": 9,
      "caseQty": 60,
      "physicalCase": 60,
      "innerPack": 1
    },
    "californiaWarning": false,
    "californiaWarningText": null,
    "newestRank": 41
  },
  {
    "sku": "AW225",
    "title": "Tech Solutions 61 LED Cherry Charm String Lights",
    "price": 6.6,
    "originalPrice": 3.3,
    "sourceUrl": "https://www.koleimports.com/tech-solutions-61-led-cherry-charm-string-lights-aw225",
    "sourceCheckedAt": "2026-11-04",
    "stock": 1369,
    "badges": [
      "new",
      "closeout"
    ],
    "collections": [
      "imports",
      "new-arrivals",
      "closeouts"
    ],
    "category": "Lighting",
    "subcategory": "Lamps & Lighting",
    "images": [
      "images/products/aw225-1.webp",
      "images/products/aw225-2.webp",
      "images/products/aw225-3.webp"
    ],
    "description": "Add a playful pop of light to bedrooms, dorms, parties, and cozy spaces with the Tech Solutions 61 LED Cherry Charm String Lights. Featuring 10 hanging strands accented with bright cherry-shaped charms, this decorative light set combines 61 warm white LEDs with a fun, colorful design that instantly adds personality to walls, headboards, shelves, and more. The battery-powered design makes decorating easy without needing a nearby outlet, while the compact 4.4' x 3' layout works well for creating a glowing backdrop or accent display. Requires 3 AA batteries, not included. Comes packaged in a retail box with hanging tab.",
    "upc": "194383080572",
    "specs": {
      "Case Pack Quantity": "24 units",
      "Inner Pack Quantity": "6 units",
      "Case Pack Dimensions": "16.14 \" (L) x11.42 \" (W) x12.99 \"(H)",
      "Case Weight": "14.239992 lb",
      "Case Cube": "1.39 cubic feet",
      "Per Piece Weight": "0.593333"
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
    "newestRank": 42
  },
  {
    "sku": "AW223",
    "title": "Tech Solutions EzReach Front Seat Organizer",
    "price": 4.4,
    "originalPrice": 2.2,
    "sourceUrl": "https://www.koleimports.com/tech-solutions-ezreach-front-seat-organizer-aw223",
    "sourceCheckedAt": "2026-11-04",
    "stock": 1049,
    "badges": [
      "new",
      "closeout"
    ],
    "collections": [
      "imports",
      "new-arrivals",
      "closeouts"
    ],
    "category": "Automotive Supplies",
    "subcategory": "Auto Interior Accessories",
    "images": [
      "images/products/aw223-1.webp",
      "images/products/aw223-2.webp",
      "images/products/aw223-3.webp"
    ],
    "description": "Keep everyday essentials within easy reach with the Tech Solutions EzReach Front Seat Organizer. Designed to fit over the front passenger seat, this slim organizer features multiple mesh storage pockets for items such as a phone, wallet, snacks, and small accessories, plus a zippered lower compartment for added storage. Adjustable straps help secure the organizer in place while allowing for quick installation and removal. Its durable construction is designed to handle regular use while helping reduce clutter inside the vehicle. Great for road trips, commuting, busy professionals, and families. Comes packaged in a box.",
    "upc": "194383080503",
    "specs": {
      "Case Pack Quantity": "48 units",
      "Inner Pack Quantity": "6 units",
      "Case Pack Dimensions": "13.9 \" (L) x22.3 \" (W) x26.7 \"(H)",
      "Case Weight": "17.000016 lb",
      "Case Cube": "4.79 cubic feet",
      "Per Piece Weight": "0.354167"
    },
    "rules": {
      "lot": 6,
      "moq": 12,
      "caseQty": 48,
      "physicalCase": 48,
      "innerPack": 6
    },
    "californiaWarning": false,
    "californiaWarningText": null,
    "newestRank": 43
  },
  {
    "sku": "AW222",
    "title": "Merkury 9\" Motion Integrated LED Volcano Lamp",
    "price": 12.1,
    "originalPrice": 6.05,
    "sourceUrl": "https://www.koleimports.com/merkury-9-motion-integrated-led-volcano-lamp-aw222",
    "sourceCheckedAt": "2026-11-04",
    "stock": 5363,
    "badges": [
      "new",
      "closeout"
    ],
    "collections": [
      "imports",
      "new-arrivals",
      "closeouts"
    ],
    "category": "Lighting",
    "subcategory": "Lamps & Lighting",
    "images": [
      "images/products/aw222-1.webp",
      "images/products/aw222-2.webp",
      "images/products/aw222-3.webp"
    ],
    "description": "Add a mesmerizing display of color and motion to any space with the Merkury 9\" Motion Integrated LED Volcano Lamp. Featuring a clear cylindrical water tank, floating mini red orbs, and a volcano-shaped centerpiece, this decorative lamp creates a captivating visual effect as the orbs move through the water. Multicolor LED lights illuminate the display with vibrant, color-changing effects, making it a fun addition to bedrooms, desks, gaming setups, or living spaces. Features a sleek black base with easy-to-use power and light controls. Measures approximately 9\" tall and 3.25\" wide. USB-powered for convenient use. Includes USB cable, power adapter, mini red orbs, stirring stick, and user manual. Comes packaged in a colorful retail box.",
    "upc": "194383071761",
    "specs": {
      "Case Pack Quantity": "12 units",
      "Inner Pack Quantity": "6 units",
      "Case Pack Dimensions": "12.9 \" (L) x20.5 \" (W) x10.8 \"(H)",
      "Case Weight": "13.550004 lb",
      "Case Cube": "1.65 cubic feet",
      "Per Piece Weight": "1.129167"
    },
    "rules": {
      "lot": 6,
      "moq": 6,
      "caseQty": 12,
      "physicalCase": 12,
      "innerPack": 6
    },
    "californiaWarning": false,
    "californiaWarningText": null,
    "newestRank": 44
  },
  {
    "sku": "AW211",
    "title": "Marvel Black Panther 10\" Action Figure",
    "price": 4.4,
    "originalPrice": 2.2,
    "sourceUrl": "https://www.koleimports.com/marvel-black-panther-10-action-figure-aw211",
    "sourceCheckedAt": "2026-11-04",
    "stock": 12553,
    "badges": [
      "new",
      "closeout"
    ],
    "collections": [
      "imports",
      "new-arrivals",
      "closeouts"
    ],
    "category": "Toys",
    "subcategory": "Action Figures",
    "images": [
      "images/products/aw211-1.webp",
      "images/products/aw211-2.webp",
      "images/products/aw211-3.webp"
    ],
    "description": "Bring the action of Wakanda to playtime with the Marvel Black Panther 10\" Action Figure. Inspired by the iconic Marvel hero, this figure features Black Panther in his signature black suit with detailed sculpting and silver-tone accents for a bold, battle-ready look. The large 10\" size makes it great for imaginative adventures, superhero displays, or adding to a Marvel figure collection. Kids can recreate action-packed scenes and imagine Black Panther protecting Wakanda from danger. Recommended for ages 4 and up. Comes packaged in an open-front Marvel display box.",
    "upc": "630509805112",
    "specs": {
      "Case Pack Quantity": "8 units",
      "Inner Pack Quantity": "1 units",
      "Case Pack Dimensions": "10.4 \" (L) x8.2 \" (W) x10.6 \"(H)",
      "Case Weight": "3.7 lb",
      "Case Cube": "0.52 cubic feet",
      "Per Piece Weight": "0.462500"
    },
    "rules": {
      "lot": 8,
      "moq": 16,
      "caseQty": 16,
      "physicalCase": 8,
      "innerPack": 1
    },
    "californiaWarning": false,
    "californiaWarningText": null,
    "newestRank": 45
  },
  {
    "sku": "AW215",
    "title": "Tybo Tidy 3 Pack Tie-Dye Bottle Pack",
    "price": 2.2,
    "originalPrice": 1.1,
    "sourceUrl": "https://www.koleimports.com/tybo-tidy-3-pack-tie-dye-bottle-pack-aw215",
    "sourceCheckedAt": "2026-11-04",
    "stock": 7589,
    "badges": [
      "new",
      "closeout"
    ],
    "collections": [
      "imports",
      "new-arrivals",
      "closeouts"
    ],
    "category": "Crafts",
    "subcategory": "Do-it-yourself Craft Kits",
    "images": [
      "images/products/aw215-1.webp",
      "images/products/aw215-2.webp",
      "images/products/aw215-3.webp"
    ],
    "description": "Create colorful tie-dye designs at home with the Tybo Tidy 3 Pack Tie-Dye Bottle Pack. This refill set includes 3 easy-squeeze dye bottles along with dye powder in bright colors to help create bold patterns on shirts, accessories, and other compatible fabric projects. Clear gloves and elastic bands are included to help with setup and keep hands cleaner while twisting, tying, and coloring your designs. Great for craft days, parties, and creative projects, this set makes it easy to experiment with classic tie-dye techniques. Includes 3 squeeze bottles, 9 dye powder packets, 1 pair of clear gloves, and 10 elastic bands. Recommended for ages 6 and up. Comes packaged in a retail box.",
    "upc": "818937028932",
    "specs": {
      "Case Pack Quantity": "6 units",
      "Inner Pack Quantity": "1 units",
      "Case Pack Dimensions": "7.6 \" (L) x11.5 \" (W) x12.1 \"(H)",
      "Case Weight": "2.599998 lb",
      "Case Cube": "0.61 cubic feet",
      "Per Piece Weight": "0.433333"
    },
    "rules": {
      "lot": 6,
      "moq": 24,
      "caseQty": 24,
      "physicalCase": 6,
      "innerPack": 1
    },
    "californiaWarning": false,
    "californiaWarningText": null,
    "newestRank": 46
  },
  {
    "sku": "AW174",
    "title": "Tech Solutions 7\" Smiley Infinity LED Box Light",
    "price": 8.3,
    "originalPrice": 4.15,
    "sourceUrl": "https://www.koleimports.com/tech-solutions-7-smiley-infinity-led-box-light-aw174",
    "sourceCheckedAt": "2026-11-04",
    "stock": 193,
    "badges": [
      "new",
      "closeout"
    ],
    "collections": [
      "imports",
      "new-arrivals",
      "closeouts"
    ],
    "category": "Lighting",
    "subcategory": "Lamps & Lighting",
    "images": [
      "images/products/aw174-1.webp",
      "images/products/aw174-2.webp",
      "images/products/aw174-3.webp"
    ],
    "description": "Light up your space with a little extra happiness using the Tech Solutions 7\" Smiley Infinity LED Box Light. Featuring a cheerful smiley face design inside an iridescent mirrored box, this eye-catching accent light creates a colorful infinity effect that appears to repeat deep into the background for a mesmerizing 3D look. Multicolor LEDs cast vibrant rainbow reflections across the clear panels, making it perfect for bedrooms, desks, gaming setups, dorm rooms, shelves, or party décor. The USB-powered design makes setup easy, while the compact 7\" size adds plenty of personality without taking up much space. Measures approximately 7\" x 7\". Comes packaged in a retail box.",
    "upc": "194383080558",
    "specs": {
      "Case Pack Quantity": "12 units",
      "Inner Pack Quantity": "4 units",
      "Case Pack Dimensions": "12.2 \" (L) x8.4 \" (W) x24.3 \"(H)",
      "Case Weight": "13.400004 lb",
      "Case Cube": "1.44 cubic feet",
      "Per Piece Weight": "1.116667"
    },
    "rules": {
      "lot": 4,
      "moq": 8,
      "caseQty": 12,
      "physicalCase": 12,
      "innerPack": 4
    },
    "californiaWarning": true,
    "californiaWarningText": "WARNING: Cancer and Reproductive Harm – www.P65Warnings.ca.gov",
    "newestRank": 47
  },
  {
    "sku": "AW173",
    "title": "Litehuas 6\" RGB Orb Mood Light with Remote",
    "price": 11.0,
    "originalPrice": 5.5,
    "sourceUrl": "https://www.koleimports.com/litehuas-6-rgb-orb-mood-light-with-remote-aw173",
    "sourceCheckedAt": "2026-11-04",
    "stock": 837,
    "badges": [
      "new",
      "closeout"
    ],
    "collections": [
      "imports",
      "new-arrivals",
      "closeouts"
    ],
    "category": "Lighting",
    "subcategory": "Lamps & Lighting",
    "images": [
      "images/products/aw173-1.webp",
      "images/products/aw173-2.webp",
      "images/products/aw173-3.webp"
    ],
    "description": "Set the mood with colorful, customizable lighting using the Litehaus 6\" RGB Orb Mood Light with Remote. This glowing 6\" orb features 16 preset LED colors and four lighting effects—flash, strobe, fade, and smooth—making it easy to create anything from a relaxing bedside glow to vibrant party or gaming-room ambiance. Use the included 24-key remote to control power, choose colors, adjust brightness, and switch lighting modes from a distance. The battery-powered design allows easy cordless placement on nightstands, desks, shelves, or tables. Requires 3 AA batteries, not included. Includes orb light and remote control. Comes packaged in a retail box.",
    "upc": "194383048022",
    "specs": {
      "Case Pack Quantity": "12 units",
      "Inner Pack Quantity": "4 units",
      "Case Pack Dimensions": "20.4 \" (L) x13.9 \" (W) x12.9 \"(H)",
      "Case Weight": "11.450004 lb",
      "Case Cube": "2.12 cubic feet",
      "Per Piece Weight": "0.954167"
    },
    "rules": {
      "lot": 4,
      "moq": 4,
      "caseQty": 12,
      "physicalCase": 12,
      "innerPack": 4
    },
    "californiaWarning": true,
    "californiaWarningText": "WARNING: Cancer and Reproductive Harm – www.P65Warnings.ca.gov",
    "newestRank": 48
  },
  {
    "sku": "AW172",
    "title": "Litehuas USB Powered Infinity Pyramid LED Light",
    "price": 11.0,
    "originalPrice": 5.5,
    "sourceUrl": "https://www.koleimports.com/litehuas-usb-powered-infinity-pyramid-led-light-aw172",
    "sourceCheckedAt": "2026-11-04",
    "stock": 1037,
    "badges": [
      "new",
      "closeout"
    ],
    "collections": [
      "imports",
      "new-arrivals",
      "closeouts"
    ],
    "category": "Lighting",
    "subcategory": "Lamps & Lighting",
    "images": [
      "images/products/aw172-1.webp",
      "images/products/aw172-2.webp",
      "images/products/aw172-3.webp"
    ],
    "description": "Create an eye-catching glow with the Litehaus USB Powered Infinity Pyramid LED Light. Featuring an iridescent acrylic pyramid design with white LEDs and a mesmerizing multicolor infinity effect, this decorative light reflects vibrant shades of blue, pink, purple, green, and more from different angles. Perfect for gaming setups, desks, bedrooms, dorm rooms, shelves, or mood lighting, it adds a futuristic statement piece to any space. The USB-powered design includes an inline on/off switch for easy control. Measures approximately 4.7\" W x 4.7\" L x 7.2\" H. Includes the Infinity Pyramid Light and user manual; USB adapter not included. Comes packaged in a retail box.",
    "upc": "194383047995",
    "specs": {
      "Case Pack Quantity": "12 units",
      "Inner Pack Quantity": "6 units",
      "Case Pack Dimensions": "12.4 \" (L) x18 \" (W) x19.2 \"(H)",
      "Case Weight": "12.050004 lb",
      "Case Cube": "2.48 cubic feet",
      "Per Piece Weight": "1.004167"
    },
    "rules": {
      "lot": 6,
      "moq": 6,
      "caseQty": 12,
      "physicalCase": 12,
      "innerPack": 6
    },
    "californiaWarning": true,
    "californiaWarningText": "WARNING: Cancer and Reproductive Harm – www.P65Warnings.ca.gov",
    "newestRank": 49
  },
  {
    "sku": "AW011",
    "title": "Tech Theory 3-In-1 Charging Stand for Iphone Apple Watch and Airpods 1 2 and Pro in White",
    "price": 3.3,
    "originalPrice": 1.65,
    "sourceUrl": "https://www.koleimports.com/tech-theory-3-in-1-charging-stand-for-iphone-apple-watch-and-airpods-1-2-and-pro-in-white-aw011",
    "sourceCheckedAt": "2026-11-04",
    "stock": 5129,
    "badges": [
      "new",
      "closeout"
    ],
    "collections": [
      "imports",
      "new-arrivals",
      "closeouts"
    ],
    "category": "Electronics",
    "subcategory": "Cell Phone Accessories",
    "images": [
      "images/products/aw011-1.webp",
      "images/products/aw011-2.webp",
      "images/products/aw011-3.webp"
    ],
    "description": "Create a clean, organized charging setup with the Tech Theory 3-In-1 Charging Stand in White. This space-saving stand is designed to hold an iPhone, Apple Watch, and AirPods 1/2/Pro together in one convenient spot, helping keep nightstands, desks, and countertops free from cable clutter. Built-in cord management grooves help guide and secure charging cables, while the anti-scratch, anti-slip, water-resistant silicone surface offers added protection and stability. The crisp white finish gives it a sleek, modern look that blends easily into bedrooms, offices, and workspaces. Stand only; charging cables and devices not included. Comes packaged in a retail box with hanging tab.",
    "upc": "849813039407",
    "specs": {
      "Case Pack Quantity": "48 units",
      "Inner Pack Quantity": "6 units",
      "Case Pack Dimensions": "16.8 \" (L) x16 \" (W) x25 \"(H)",
      "Case Weight": "22.05 lb",
      "Case Cube": "3.89 cubic feet",
      "Per Piece Weight": "0.459375"
    },
    "rules": {
      "lot": 6,
      "moq": 18,
      "caseQty": 48,
      "physicalCase": 48,
      "innerPack": 6
    },
    "californiaWarning": false,
    "californiaWarningText": null,
    "newestRank": 50
  },
  {
    "sku": "DA857",
    "title": "Extendable Flexible Bottle Cleaning Brush",
    "price": 1.9,
    "originalPrice": 0.95,
    "sourceUrl": "https://www.koleimports.com/extendable-flexible-bottle-cleaning-brush-da857",
    "sourceCheckedAt": "2026-11-04",
    "stock": 18689,
    "badges": [
      "new",
      "closeout"
    ],
    "collections": [
      "imports",
      "new-arrivals",
      "closeouts"
    ],
    "category": "Household Supplies",
    "subcategory": "Scrub Brushes",
    "images": [
      "images/products/da857-1.webp",
      "images/products/da857-2.webp",
      "images/products/da857-3.webp"
    ],
    "description": "This Extendable Flexible Bottle Cleaning Brush is a practical everyday kitchen essential designed to make washing dishes, bottles, cups, tumblers, travel mugs, glasses, jars, and other narrow or hard-to-reach containers easier and more efficient. Made from durable PP and PE materials, the flexible brush head bends up to 360° to clean around curves, corners, sides, and bottoms where standard straight brushes may have difficulty reaching. The extendable handle provides extra reach for taller and deeper drinkware, measuring approximately 12.5\" long when compact and extending up to 15.75\". Its long, flexible design is especially useful during everyday dishwashing for scrubbing reusable water bottles, thermoses, coffee tumblers, sports bottles, and other containers that can be difficult to clean thoroughly by hand. The comfortable handle provides a secure grip for better control while washing, and the built-in hanging hole allows for convenient drying and storage between uses. Compact, versatile, and easy to keep near the kitchen sink, this bottle cleaning brush helps make everyday cleanup quicker while reaching areas ordinary dish brushes may miss.",
    "upc": "731015324323",
    "specs": {
      "Case Pack Quantity": "24 units",
      "Inner Pack Quantity": "1 units",
      "Case Pack Dimensions": "15.2 \" (L) x4.4 \" (W) x8 \"(H)",
      "Case Weight": "2.200008 lb",
      "Case Cube": "0.31 cubic feet",
      "Per Piece Weight": "0.091667"
    },
    "rules": {
      "lot": 24,
      "moq": 24,
      "caseQty": 24,
      "physicalCase": 24,
      "innerPack": 1
    },
    "californiaWarning": true,
    "californiaWarningText": "WARNING: Cancer and Reproductive Harm – www.P65Warnings.ca.gov",
    "newestRank": 51
  },
  {
    "sku": "DA856",
    "title": "3 Piece Blackhead and Pimple Remover Tool Kit with Storage Case",
    "price": 2.2,
    "originalPrice": 1.1,
    "sourceUrl": "https://www.koleimports.com/3-piece-blackhead-and-pimple-remover-tool-kit-with-storage-case-da856",
    "sourceCheckedAt": "2026-11-04",
    "stock": 30593,
    "badges": [
      "new",
      "closeout"
    ],
    "collections": [
      "imports",
      "new-arrivals",
      "closeouts"
    ],
    "category": "Cosmetics",
    "subcategory": "Cosmetic Tools & Brushes",
    "images": [
      "images/products/da856-1.webp",
      "images/products/da856-2.webp",
      "images/products/da856-3.webp"
    ],
    "description": "This 4-Piece Blackhead Remover and Blemish Extraction Tool Set is a practical addition to any at-home skincare routine, helping target blackheads, whiteheads, clogged pores, blemishes, ingrown hairs, and excess oil buildup for cleaner, smoother-looking skin. Suitable for both men and women, this versatile skincare tool set is ideal for teens and adults looking to maintain clearer-looking skin and handle everyday blemish care at home. Made from durable stainless steel and PP material, the set includes precision tools designed for different skincare needs, including a slant-tip tweezer for ingrown hairs and fine debris, a flat-ended blemish extractor for clogged pores and whiteheads, and a loop extractor for targeting blackheads around the nose, chin, forehead, cheeks, and other hard-to-reach areas. The precision tips and easy-grip designs provide better control while offering a more hygienic alternative to squeezing or picking with fingers. Compact and easy to keep handy for regular skincare maintenance, touch-ups, or travel, the tools store neatly inside the included protective clear storage case to help keep them clean, organized, and protected between uses. The set comes packaged in an attractive retail-ready PVC box with a hanging tab for convenient display. Packaging measures approximately 3.25\" x 0.75\" x 5.75\".",
    "upc": "731015324316",
    "specs": {
      "Case Pack Quantity": "24 units",
      "Inner Pack Quantity": "1 units",
      "Case Pack Dimensions": "10.2 \" (L) x3.7 \" (W) x8.3 \"(H)",
      "Case Weight": "1.699992 lb",
      "Case Cube": "0.18 cubic feet",
      "Per Piece Weight": "0.070833"
    },
    "rules": {
      "lot": 24,
      "moq": 24,
      "caseQty": 24,
      "physicalCase": 24,
      "innerPack": 1
    },
    "californiaWarning": true,
    "californiaWarningText": "WARNING: Cancer and Reproductive Harm – www.P65Warnings.ca.gov",
    "newestRank": 52
  },
  {
    "sku": "CB641",
    "title": "70\" 5 Volt  Braided Type-C to Type-C Charge and Sync Cable",
    "price": 4.4,
    "originalPrice": 2.2,
    "sourceUrl": "https://www.koleimports.com/70-5-volt-braided-type-c-to-type-c-charge-and-sync-cable-cb641",
    "sourceCheckedAt": "2026-11-04",
    "stock": 4770,
    "badges": [
      "new"
    ],
    "collections": [
      "imports",
      "new-arrivals"
    ],
    "category": "Electronics",
    "subcategory": "Cell Phone Accessories",
    "images": [
      "images/products/cb641-1.webp",
      "images/products/cb641-2.webp",
      "images/products/cb641-3.webp"
    ],
    "description": "Featuring a durable black-and-white braided cord, this USB Type-C cable offers a stylish appearance while helping protect against everyday wear and tangling. The 70-inch length provides added flexibility and reach, making it convenient for charging devices at home, in the office, or while traveling. Its reinforced connector ends offer additional support during frequent plugging and unplugging. The cable supports up to 2.4A charging and is designed for both charging and data synchronization with compatible devices. Its USB-A to USB-C connector configuration makes it suitable for use with many smartphones, tablets, portable electronics, and other USB-C-enabled devices when connected to a compatible USB power source or computer. Whether charging a phone at a desk, connecting a device to a laptop, or keeping electronics powered during travel, this cable provides a convenient everyday charging solution. The USB Type-C Charging & Sync Cable comes individually packaged in a blue printed hanging retail box with a clear front window, allowing shoppers to see the braided cable and connectors inside.",
    "upc": "731015327454",
    "specs": {
      "Case Pack Quantity": "24 units",
      "Inner Pack Quantity": "1 units",
      "Case Pack Dimensions": "11.6 \" (L) x5.8 \" (W) x6 \"(H)",
      "Case Weight": "2.950008 lb",
      "Case Cube": "0.23 cubic feet",
      "Per Piece Weight": "0.122917"
    },
    "rules": {
      "lot": 11,
      "moq": 11,
      "caseQty": 24,
      "physicalCase": 24,
      "innerPack": 1
    },
    "californiaWarning": false,
    "californiaWarningText": null,
    "newestRank": 53
  },
  {
    "sku": "AW242",
    "title": "6 Pack Super Mario Casual Crew Socks in Size 10-13",
    "price": 8.8,
    "originalPrice": 4.4,
    "sourceUrl": "https://www.koleimports.com/6-pack-super-mario-casual-crew-socks-in-size-10-13-aw242",
    "sourceCheckedAt": "2026-11-04",
    "stock": 16348,
    "badges": [
      "new",
      "closeout"
    ],
    "collections": [
      "imports",
      "new-arrivals",
      "closeouts"
    ],
    "category": "Apparel",
    "subcategory": "Socks",
    "images": [
      "images/products/aw242-1.webp",
      "images/products/aw242-2.webp",
      "images/products/aw242-3.webp"
    ],
    "description": "Add colorful gaming style to your everyday essentials with this 6 Pack Super Mario Casual Crew Socks. Each pair features assorted Super Mario-inspired character graphics and bright coordinating colors, making them a fun choice for fans of the classic video game series. The casual crew length pairs easily with a variety of everyday footwear. Includes 6 assorted pairs in size 10-13. Comes packaged together with a Super Mario printed wrap label for retail display.",
    "upc": "86694733059",
    "specs": {
      "Case Pack Quantity": "12 units",
      "Inner Pack Quantity": "1 units",
      "Case Pack Dimensions": "11.7 \" (L) x21.8 \" (W) x6.7 \"(H)",
      "Case Weight": "8.949996 lb",
      "Case Cube": "0.99 cubic feet",
      "Per Piece Weight": "0.745833"
    },
    "rules": {
      "lot": 6,
      "moq": 6,
      "caseQty": 12,
      "physicalCase": 12,
      "innerPack": 1
    },
    "californiaWarning": false,
    "californiaWarningText": null,
    "newestRank": 54
  },
  {
    "sku": "AV725",
    "title": "Modern Style Digital Watch in Assorted Colors",
    "price": 4.4,
    "originalPrice": 2.2,
    "sourceUrl": "https://www.koleimports.com/modern-style-digital-watch-in-assorted-colors-av725",
    "sourceCheckedAt": "2026-11-04",
    "stock": 73343,
    "badges": [
      "new",
      "closeout"
    ],
    "collections": [
      "imports",
      "new-arrivals",
      "closeouts"
    ],
    "category": "Apparel",
    "subcategory": "Jewelry",
    "images": [
      "images/products/av725-1.webp",
      "images/products/av725-2.webp",
      "images/products/av725-3.webp"
    ],
    "description": "Modern Style Digital Watch in Assorted Colors adds a bold, sporty touch to everyday outfits while keeping time easy to check on the go. Featuring a large digital display, easy-access side buttons, and a comfortable adjustable strap, this lightweight watch is made for casual daily wear, school, travel, and active lifestyles. The modern oversized case gives it a statement look, while the digital face offers clear at-a-glance viewing. Available in assorted colors to suit different styles. Comes packaged on a hanging display card, making it ideal for gift shops, accessory sections, and impulse displays.",
    "upc": "731015335398",
    "specs": {
      "Case Pack Quantity": "180 units",
      "Inner Pack Quantity": "30 units",
      "Case Pack Dimensions": "19.3 \" (L) x14 \" (W) x14.3 \"(H)",
      "Case Weight": "17.40006 lb",
      "Case Cube": "2.24 cubic feet",
      "Per Piece Weight": "0.096667"
    },
    "rules": {
      "lot": 30,
      "moq": 30,
      "caseQty": 180,
      "physicalCase": 180,
      "innerPack": 30
    },
    "californiaWarning": false,
    "californiaWarningText": null,
    "newestRank": 55
  },
  {
    "sku": "AV721",
    "title": "Snap'z Mini Black Mini Digital Camera",
    "price": 29.5,
    "originalPrice": 14.75,
    "sourceUrl": "https://www.koleimports.com/snap-z-mini-black-mini-digital-camera-av721",
    "sourceCheckedAt": "2026-11-04",
    "stock": 808,
    "badges": [
      "new",
      "closeout"
    ],
    "collections": [
      "imports",
      "new-arrivals",
      "closeouts"
    ],
    "category": "Electronics",
    "subcategory": "Photography",
    "images": [
      "images/products/av721-1.webp",
      "images/products/av721-2.webp",
      "images/products/av721-3.webp"
    ],
    "description": "Capture photos and videos anywhere with the Snap'z Mini Black Mini Digital Camera. This pocket-size camera features a full-color display, 4x digital zoom, built-in flash, and Full HD video recording to help preserve favorite moments in both photo and video form. The compact design is easy to take along on outings, vacations, parties, and everyday adventures, while the included keychain and wrist strap make carrying it even more convenient. Comes packaged in a hanging blister card.",
    "upc": "810071040597",
    "specs": {
      "Case Pack Quantity": "30 units",
      "Inner Pack Quantity": "5 units",
      "Case Pack Dimensions": "20.2 \" (L) x9.06 \" (W) x13.7 \"(H)",
      "Case Weight": "8.60001 lb",
      "Case Cube": "1.45 cubic feet",
      "Per Piece Weight": "0.286667"
    },
    "rules": {
      "lot": 5,
      "moq": 5,
      "caseQty": 30,
      "physicalCase": 30,
      "innerPack": 5
    },
    "californiaWarning": false,
    "californiaWarningText": null,
    "newestRank": 56
  },
  {
    "sku": "AV718",
    "title": "Zero Statik Splash Pro Water Resistant Bluetooth Speaker in Red White & Blue",
    "price": 19.8,
    "originalPrice": 9.9,
    "sourceUrl": "https://www.koleimports.com/zero-statik-splash-pro-water-resistant-bluetooth-speaker-in-red-white-blue-av718",
    "sourceCheckedAt": "2026-11-04",
    "stock": 525,
    "badges": [
      "new",
      "closeout"
    ],
    "collections": [
      "imports",
      "new-arrivals",
      "closeouts"
    ],
    "category": "Electronics",
    "subcategory": "Portable Audio Players",
    "images": [
      "images/products/av718-1.webp",
      "images/products/av718-2.webp",
      "images/products/av718-3.webp"
    ],
    "description": "Bring bold sound and patriotic style anywhere with the Zero Statik Splash Pro Water Resistant Bluetooth Speaker in Red, White & Blue. Designed for indoor and outdoor adventures, this compact, rugged speaker features IPX4 water resistance to help protect against splashes, making it great for poolside hangs, beach days, backyard parties, and more. Bluetooth 5.3 provides easy wireless connectivity, while powerful speakers deliver clear, room-filling sound. Enjoy up to 7 hours of music playtime, then recharge with the included USB charging cable. The built-in carrying loop makes it easy to grab and go, and the red, white, and blue star-and-stripe design adds a festive touch. Measures approximately 8.5\" x 2.8\". Comes packaged in a hanging retail box.",
    "upc": "810071048128",
    "specs": {
      "Case Pack Quantity": "12 units",
      "Inner Pack Quantity": "3 units",
      "Case Pack Dimensions": "14.9 \" (L) x12 \" (W) x22.9 \"(H)",
      "Case Weight": "24.45 lb",
      "Case Cube": "2.37 cubic feet",
      "Per Piece Weight": "2.037500"
    },
    "rules": {
      "lot": 3,
      "moq": 3,
      "caseQty": 12,
      "physicalCase": 12,
      "innerPack": 3
    },
    "californiaWarning": false,
    "californiaWarningText": null,
    "newestRank": 57
  },
  {
    "sku": "AV717",
    "title": "Zero Statik Sweat & Waterproof True Wireless Bluetooth Sport Earbuds in Red White & Blue",
    "price": 16.5,
    "originalPrice": 8.25,
    "sourceUrl": "https://www.koleimports.com/zero-statik-sweat-waterproof-true-wireless-bluetooth-sport-earbuds-in-red-white-blue-av717",
    "sourceCheckedAt": "2026-11-04",
    "stock": 1799,
    "badges": [
      "new",
      "closeout"
    ],
    "collections": [
      "imports",
      "new-arrivals",
      "closeouts"
    ],
    "category": "Electronics",
    "subcategory": "Headphones",
    "images": [
      "images/products/av717-1.webp",
      "images/products/av717-2.webp",
      "images/products/av717-3.webp"
    ],
    "description": "Take your workouts to the next level with the Zero Statik Sweat & Waterproof True Wireless Bluetooth Sport Earbuds in Red, White & Blue. Designed with flexible over-ear hooks for a secure, customizable fit, these sport-ready earbuds feature IPX5 sweat and water resistance to help keep you moving through intense workouts. Enjoy up to 6 hours of playtime per charge and up to 24 hours total with the protective charging case. Tap-touch controls make it easy to manage music, calls, and volume, while built-in microphones provide crisp phone calls. Noise-isolating ear tips help block outside distractions, and the charging case features an LCD battery level display so you can check power at a glance. Comes packaged in a hanging retail box.",
    "upc": "810071048135",
    "specs": {
      "Case Pack Quantity": "30 units",
      "Inner Pack Quantity": "5 units",
      "Case Pack Dimensions": "12.3 \" (L) x8.9 \" (W) x29.3 \"(H)",
      "Case Weight": "20.1 lb",
      "Case Cube": "1.86 cubic feet",
      "Per Piece Weight": "0.670000"
    },
    "rules": {
      "lot": 5,
      "moq": 5,
      "caseQty": 30,
      "physicalCase": 30,
      "innerPack": 5
    },
    "californiaWarning": false,
    "californiaWarningText": null,
    "newestRank": 58
  },
  {
    "sku": "DA875",
    "title": "Stretchy Sensory Fidget Toys Assorted Styles",
    "price": 3.36,
    "originalPrice": 1.68,
    "sourceUrl": "https://www.koleimports.com/stretchy-sensory-fidget-toys-assorted-styles-da875",
    "sourceCheckedAt": "2026-11-04",
    "stock": 15072,
    "badges": [
      "new",
      "closeout"
    ],
    "collections": [
      "imports",
      "new-arrivals",
      "closeouts"
    ],
    "category": "Toys",
    "subcategory": "Novelties & Magic",
    "images": [
      "images/products/da875-1.webp",
      "images/products/da875-2.webp",
      "images/products/da875-3.webp"
    ],
    "description": "This Stretchy Fruit and Vegetable Fidget Toys offer a fun and satisfying sensory experience with its unique sandy-feel, moldable texture that can be squeezed, squished, pulled, stretched, and reshaped again and again. Measuring approximately 5.25\" to 5.5\" long, each toy can stretch up to 12”, and stays extended once stretched for even more hands-on fidgeting fun. Available in four colorful fruit and vegetable styles with playful character faces, it makes a neat and entertaining fidget toy for kids, teens, and adults. Each toy comes individually packaged on a colorful blister card.",
    "upc": "195464622926",
    "specs": {
      "Case Pack Quantity": "24 units",
      "Inner Pack Quantity": "1 units",
      "Case Pack Dimensions": "13.5 \" (L) x10.2 \" (W) x8.7 \"(H)",
      "Case Weight": "13.099992 lb",
      "Case Cube": "0.69 cubic feet",
      "Per Piece Weight": "0.545833"
    },
    "rules": {
      "lot": 24,
      "moq": 24,
      "caseQty": 24,
      "physicalCase": 24,
      "innerPack": 1
    },
    "californiaWarning": true,
    "californiaWarningText": "WARNING: Cancer and Reproductive Harm – www.P65Warnings.ca.gov",
    "newestRank": 59
  },
  {
    "sku": "AV773",
    "title": "24 Pack Deluxe Full-size Cutlery Dark Blue Knives",
    "price": 1.5,
    "originalPrice": 0.75,
    "sourceUrl": "https://www.koleimports.com/24-pack-deluxe-full-size-cutlery-dark-blue-knives-av773",
    "sourceCheckedAt": "2026-11-04",
    "stock": 2009,
    "badges": [
      "new",
      "closeout"
    ],
    "collections": [
      "imports",
      "new-arrivals",
      "closeouts"
    ],
    "category": "Kitchen & Dining",
    "subcategory": "Flatware",
    "images": [
      "images/products/av773-1.webp",
      "images/products/av773-2.webp"
    ],
    "description": "Make mealtime convenient and colorful with this 24-pack of Sovereign Deluxe Full-Size Dark Blue Plastic Knives. Perfect for birthday parties, picnics, barbecues, holidays, catered events, and everyday gatherings, these disposable knives offer a practical alternative to traditional silverware. The full-size design provides a comfortable grip for enjoying meals, snacks, and desserts. The dark blue color adds a decorative touch to any table setting and coordinates easily with party decorations and tableware. Ideal for entertaining while making cleanup quick and hassle-free. Comes packaged in a clear plastic bag containing 24 knives.",
    "upc": "073954085027",
    "specs": {
      "Case Pack Quantity": "12 units",
      "Inner Pack Quantity": "1 units",
      "Case Pack Dimensions": "8.1 \" (L) x7.5 \" (W) x3.4 \"(H)",
      "Case Weight": "3.3 lb",
      "Case Cube": "0.12 cubic feet",
      "Per Piece Weight": "0.275000"
    },
    "rules": {
      "lot": 12,
      "moq": 36,
      "caseQty": 36,
      "physicalCase": 12,
      "innerPack": 1
    },
    "californiaWarning": false,
    "californiaWarningText": null,
    "newestRank": 60
  },
  {
    "sku": "AV771",
    "title": "24 Pack Deluxe Full-size Cutlery Gold Forks",
    "price": 1.5,
    "originalPrice": 0.75,
    "sourceUrl": "https://www.koleimports.com/24-pack-deluxe-full-size-cutlery-gold-forks-av771",
    "sourceCheckedAt": "2026-11-04",
    "stock": 533,
    "badges": [
      "new",
      "closeout"
    ],
    "collections": [
      "imports",
      "new-arrivals",
      "closeouts"
    ],
    "category": "Kitchen & Dining",
    "subcategory": "Flatware",
    "images": [
      "images/products/av771-1.webp",
      "images/products/av771-2.webp"
    ],
    "description": "Make mealtime convenient and colorful with this 24-pack of Sovereign Deluxe Full-Size Gold Plastic Forks. Perfect for birthday parties, picnics, barbecues, holidays, catered events, and everyday gatherings, these disposable forks offer a practical alternative to traditional silverware. The full-size design provides a comfortable grip for enjoying meals, snacks, and desserts. The gold color adds a decorative touch to any table setting and coordinates easily with party decorations and tableware. Ideal for entertaining while making cleanup quick and hassle-free. Comes packaged in a clear plastic bag containing 24 forks.",
    "upc": "073954084297",
    "specs": {
      "Case Pack Quantity": "12 units",
      "Inner Pack Quantity": "1 units",
      "Case Pack Dimensions": "7.8 \" (L) x7.7 \" (W) x5.9 \"(H)",
      "Case Weight": "3.650004 lb",
      "Case Cube": "0.21 cubic feet",
      "Per Piece Weight": "0.304167"
    },
    "rules": {
      "lot": 12,
      "moq": 36,
      "caseQty": 36,
      "physicalCase": 12,
      "innerPack": 1
    },
    "californiaWarning": false,
    "californiaWarningText": null,
    "newestRank": 61
  },
  {
    "sku": "AV770",
    "title": "24 Pack Deluxe Full-size Cutlery Silver Forks",
    "price": 1.5,
    "originalPrice": 0.75,
    "sourceUrl": "https://www.koleimports.com/24-pack-deluxe-full-size-cutlery-silver-forks-av770",
    "sourceCheckedAt": "2026-11-04",
    "stock": 1229,
    "badges": [
      "new",
      "closeout"
    ],
    "collections": [
      "imports",
      "new-arrivals",
      "closeouts"
    ],
    "category": "Kitchen & Dining",
    "subcategory": "Flatware",
    "images": [
      "images/products/av770-1.webp",
      "images/products/av770-2.webp"
    ],
    "description": "Make mealtime convenient and colorful with this 24-pack of Sovereign Deluxe Full-Size Silver Plastic Forks. Perfect for birthday parties, picnics, barbecues, holidays, catered events, and everyday gatherings, these disposable forks offer a practical alternative to traditional silverware. The full-size design provides a comfortable grip for enjoying meals, snacks, and desserts. The silver color adds a decorative touch to any table setting and coordinates easily with party decorations and tableware. Ideal for entertaining while making cleanup quick and hassle-free. Comes packaged in a clear plastic bag containing 24 forks.",
    "upc": "073954084280",
    "specs": {
      "Case Pack Quantity": "12 units",
      "Inner Pack Quantity": "1 units",
      "Case Pack Dimensions": "8.2 \" (L) x7.6 \" (W) x5.9 \"(H)",
      "Case Weight": "3.999996 lb",
      "Case Cube": "0.21 cubic feet",
      "Per Piece Weight": "0.333333"
    },
    "rules": {
      "lot": 12,
      "moq": 36,
      "caseQty": 36,
      "physicalCase": 12,
      "innerPack": 1
    },
    "californiaWarning": false,
    "californiaWarningText": null,
    "newestRank": 62
  },
  {
    "sku": "AV766",
    "title": "24 Pack Deluxe Full-size Cutlery Dark Blue Forks",
    "price": 1.5,
    "originalPrice": 0.75,
    "sourceUrl": "https://www.koleimports.com/24-pack-deluxe-full-size-cutlery-dark-blue-forks-av766",
    "sourceCheckedAt": "2026-11-04",
    "stock": 833,
    "badges": [
      "new",
      "closeout"
    ],
    "collections": [
      "imports",
      "new-arrivals",
      "closeouts"
    ],
    "category": "Kitchen & Dining",
    "subcategory": "Flatware",
    "images": [
      "images/products/av766-1.webp",
      "images/products/av766-2.webp"
    ],
    "description": "Make mealtime convenient and colorful with this 24-pack of Sovereign Deluxe Full-Size Dark Blue Plastic Forks. Perfect for birthday parties, picnics, barbecues, holidays, catered events, and everyday gatherings, these disposable forks offer a practical alternative to traditional silverware. The full-size design provides a comfortable grip for enjoying meals, snacks, and desserts. The dark blue color adds a decorative touch to any table setting and coordinates easily with party decorations and tableware. Ideal for entertaining while making cleanup quick and hassle-free. Comes packaged in a clear plastic bag containing 24 forks.",
    "upc": "073954084020",
    "specs": {
      "Case Pack Quantity": "12 units",
      "Inner Pack Quantity": "1 units",
      "Case Pack Dimensions": "8 \" (L) x8.1 \" (W) x6.2 \"(H)",
      "Case Weight": "3.999996 lb",
      "Case Cube": "0.23 cubic feet",
      "Per Piece Weight": "0.333333"
    },
    "rules": {
      "lot": 12,
      "moq": 36,
      "caseQty": 36,
      "physicalCase": 12,
      "innerPack": 1
    },
    "californiaWarning": false,
    "californiaWarningText": null,
    "newestRank": 63
  },
  {
    "sku": "AV755",
    "title": "24 Pack Deluxe Full-size Cutlery Black Assorted Set",
    "price": 1.5,
    "originalPrice": 0.75,
    "sourceUrl": "https://www.koleimports.com/24-pack-deluxe-full-size-cutlery-black-assorted-set-av755",
    "sourceCheckedAt": "2026-11-04",
    "stock": 1973,
    "badges": [
      "new",
      "closeout"
    ],
    "collections": [
      "imports",
      "new-arrivals",
      "closeouts"
    ],
    "category": "Kitchen & Dining",
    "subcategory": "Flatware",
    "images": [
      "images/products/av755-1.webp",
      "images/products/av755-2.webp"
    ],
    "description": "Make mealtime convenient and colorful with this 24-pack of Sovereign Deluxe Full-Size Black Plastic Cutlery. Perfect for birthday parties, picnics, barbecues, holidays, catered events, and everyday gatherings, this disposable cutlery set offers a practical alternative to traditional silverware. The full-size design provides a comfortable grip for enjoying meals, snacks, and desserts. The black color adds a decorative touch to any table setting and coordinates easily with party decorations and tableware. Ideal for entertaining while making cleanup quick and hassle-free. Comes packaged in a clear plastic bag containing 24 assorted forks, spoons, and knives.",
    "upc": "073954076117",
    "specs": {
      "Case Pack Quantity": "12 units",
      "Inner Pack Quantity": "1 units",
      "Case Pack Dimensions": "7.9 \" (L) x7.8 \" (W) x6.1 \"(H)",
      "Case Weight": "3.500004 lb",
      "Case Cube": "0.22 cubic feet",
      "Per Piece Weight": "0.291667"
    },
    "rules": {
      "lot": 12,
      "moq": 36,
      "caseQty": 36,
      "physicalCase": 12,
      "innerPack": 1
    },
    "californiaWarning": false,
    "californiaWarningText": null,
    "newestRank": 64
  },
  {
    "sku": "AV738",
    "title": "50 Pack Deluxe Full-Size Cutlery Black Forks",
    "price": 2.2,
    "originalPrice": 1.1,
    "sourceUrl": "https://www.koleimports.com/50-pack-deluxe-full-size-cutlery-black-forks-av738",
    "sourceCheckedAt": "2026-11-04",
    "stock": 425,
    "badges": [
      "new",
      "closeout"
    ],
    "collections": [
      "imports",
      "new-arrivals",
      "closeouts"
    ],
    "category": "Kitchen & Dining",
    "subcategory": "Flatware",
    "images": [
      "images/products/av738-1.webp",
      "images/products/av738-2.webp"
    ],
    "description": "Make serving meals easy and stylish with Sovereign 50 Pack Deluxe Full-Size Cutlery Black Forks! Crafted from sturdy plastic, these full-size disposable forks feature a sleek black finish that adds a polished touch to any table setting. Perfect for birthday parties, weddings, catered events, picnics, office gatherings, and everyday meals, these forks offer a convenient alternative to traditional silverware without the hassle of washing dishes. Each pack includes 50 black forks, providing plenty for larger gatherings and special occasions. Comes packaged in a clear plastic hanging bag for easy storage and retail display.",
    "upc": "073954028116",
    "specs": {
      "Case Pack Quantity": "12 units",
      "Inner Pack Quantity": "1 units",
      "Case Pack Dimensions": "12.2 \" (L) x8 \" (W) x8.8 \"(H)",
      "Case Weight": "8.55 lb",
      "Case Cube": "0.50 cubic feet",
      "Per Piece Weight": "0.712500"
    },
    "rules": {
      "lot": 12,
      "moq": 24,
      "caseQty": 24,
      "physicalCase": 12,
      "innerPack": 1
    },
    "californiaWarning": false,
    "californiaWarningText": null,
    "newestRank": 65
  },
  {
    "sku": "AV731",
    "title": "50 Pack Deluxe Full-Size Cutlery Black Spoons",
    "price": 2.2,
    "originalPrice": 1.1,
    "sourceUrl": "https://www.koleimports.com/50-pack-deluxe-full-size-cutlery-black-spoons-av731",
    "sourceCheckedAt": "2026-11-04",
    "stock": 521,
    "badges": [
      "new",
      "closeout"
    ],
    "collections": [
      "imports",
      "new-arrivals",
      "closeouts"
    ],
    "category": "Kitchen & Dining",
    "subcategory": "Flatware",
    "images": [
      "images/products/av731-1.webp",
      "images/products/av731-2.webp"
    ],
    "description": "Make serving meals easy and stylish with Sovereign 50 Pack Deluxe Full-Size Cutlery Black Spoons! Crafted from sturdy plastic, these full-size disposable spoons feature a sleek black finish that adds a polished touch to any table setting. Perfect for birthday parties, weddings, catered events, picnics, office gatherings, and everyday meals, these spoons offer a convenient alternative to traditional silverware without the hassle of washing dishes. Each pack includes 50 black spoons, providing plenty for larger gatherings and special occasions. Comes packaged in a clear plastic hanging bag for easy storage and retail display.",
    "upc": "073954027119",
    "specs": {
      "Case Pack Quantity": "12 units",
      "Inner Pack Quantity": "1 units",
      "Case Pack Dimensions": "10 \" (L) x8.1 \" (W) x9.4 \"(H)",
      "Case Weight": "6.849996 lb",
      "Case Cube": "0.44 cubic feet",
      "Per Piece Weight": "0.570833"
    },
    "rules": {
      "lot": 12,
      "moq": 24,
      "caseQty": 24,
      "physicalCase": 12,
      "innerPack": 1
    },
    "californiaWarning": false,
    "californiaWarningText": null,
    "newestRank": 66
  },
  {
    "sku": "AW245",
    "title": "6 Pack Toy Story Casual Crew Socks in Size 10-13",
    "price": 8.8,
    "originalPrice": 4.4,
    "sourceUrl": "https://www.koleimports.com/6-pack-toy-story-casual-crew-socks-in-size-10-13-aw245",
    "sourceCheckedAt": "2026-11-04",
    "stock": 695,
    "badges": [
      "new",
      "closeout"
    ],
    "collections": [
      "imports",
      "new-arrivals",
      "closeouts"
    ],
    "category": "Apparel",
    "subcategory": "Socks",
    "images": [
      "images/products/aw245-1.webp",
      "images/products/aw245-2.webp",
      "images/products/aw245-3.webp"
    ],
    "description": "Add fun and colorful style to your everyday wardrobe with this 6 Pack Toy Story Casual Crew Socks set! Featuring designs inspired by Disney Pixar's Toy Story, this assortment includes fan-favorite characters Woody and Buzz Lightyear, along with playful graphics featuring Pizza Planet, the Little Green Aliens, and more. Each pair features vibrant colors and unique character artwork, making them a fun addition to any Toy Story fan's sock collection. The casual crew length provides comfortable coverage for everyday wear, while the assorted designs offer plenty of variety. Perfect for lounging, casual outings, or gifting. Fits men's sock size 10-13. Comes packaged as a 6-pair set with a Toy Story branded paper wrap.",
    "upc": "086694733028",
    "specs": {
      "Case Pack Quantity": "12 units",
      "Inner Pack Quantity": "1 units",
      "Case Pack Dimensions": "6.6 \" (L) x11.2 \" (W) x21.8 \"(H)",
      "Case Weight": "8.55 lb",
      "Case Cube": "0.93 cubic feet",
      "Per Piece Weight": "0.712500"
    },
    "rules": {
      "lot": 6,
      "moq": 6,
      "caseQty": 12,
      "physicalCase": 12,
      "innerPack": 1
    },
    "californiaWarning": false,
    "californiaWarningText": null,
    "newestRank": 67
  },
  {
    "sku": "AW207",
    "title": "Sigalux 6 Pack 60W Equivalent G16.5 E12 Base Dimmable LED Clear Glass Globe Bulbs",
    "price": 5.0,
    "originalPrice": 2.5,
    "sourceUrl": "https://www.koleimports.com/sigalux-6-pack-60w-equivalent-g16-5-e12-base-dimmable-led-clear-glass-globe-bulbs-aw207",
    "sourceCheckedAt": "2026-11-04",
    "stock": 3153,
    "badges": [
      "new",
      "closeout"
    ],
    "collections": [
      "imports",
      "new-arrivals",
      "closeouts"
    ],
    "category": "Lighting",
    "subcategory": "Light Bulbs",
    "images": [
      "images/products/aw207-1.webp",
      "images/products/aw207-2.webp",
      "images/products/aw207-3.webp"
    ],
    "description": "Bring warm, decorative lighting to chandeliers, sconces, and accent fixtures with the Sigalux 6 Pack 60W Equivalent G16.5 LED Globe Bulbs. Each clear glass bulb features visible filament-style LEDs for a classic look while using only 5 watts of energy to produce 500 lumens of soft white light. The dimmable design lets you adjust brightness to create the right atmosphere, and the compact G16.5 globe shape with E12 candelabra base fits a variety of decorative fixtures. Suitable for indoor use or open covered outdoor fixtures and rated for up to 15,000 hours of use. Includes 6 clear glass LED globe bulbs. Comes packaged in a retail box.",
    "upc": "840696185861",
    "specs": {
      "Case Pack Quantity": "8 units",
      "Inner Pack Quantity": "1 units",
      "Case Pack Dimensions": "12.3 \" (L) x8.5 \" (W) x7.8 \"(H)",
      "Case Weight": "2.85 lb",
      "Case Cube": "0.47 cubic feet",
      "Per Piece Weight": "0.356250"
    },
    "rules": {
      "lot": 8,
      "moq": 8,
      "caseQty": 8,
      "physicalCase": 8,
      "innerPack": 1
    },
    "californiaWarning": false,
    "californiaWarningText": null,
    "newestRank": 68
  },
  {
    "sku": "AV979",
    "title": "Hawksbill PS5 Compatible Protective Hard Shell Dual Controller Case",
    "price": 5.5,
    "originalPrice": 2.75,
    "sourceUrl": "https://www.koleimports.com/hawksbill-ps5-compatible-protective-hard-shell-dual-controller-case-av979",
    "sourceCheckedAt": "2026-11-04",
    "stock": 241,
    "badges": [
      "new",
      "closeout"
    ],
    "collections": [
      "imports",
      "new-arrivals",
      "closeouts"
    ],
    "category": "Electronics",
    "subcategory": "Computer & Tablet Accessories",
    "images": [
      "images/products/av979-1.webp",
      "images/products/av979-2.webp",
      "images/products/av979-3.webp"
    ],
    "description": "Keep your gaming accessories organized and protected with the Hawksbill PS5 Compatible Protective Hard Shell Dual Controller Case. Designed to accommodate two PS5 controllers, this durable case features a hard shell exterior to help protect against bumps, scratches, and everyday wear. The spacious interior includes molded compartments to keep controllers neatly positioned, while a zippered mesh pocket provides additional storage for charging cables and small accessories. A secure zipper closure and convenient carrying handle make it easy to transport your controllers wherever you go.",
    "upc": "731015338108",
    "specs": {
      "Case Pack Quantity": "10 units",
      "Inner Pack Quantity": "1 units",
      "Case Pack Dimensions": "16.8 \" (L) x20.7 \" (W) x8.6 \"(H)",
      "Case Weight": "8 lb",
      "Case Cube": "1.73 cubic feet",
      "Per Piece Weight": "0.800000"
    },
    "rules": {
      "lot": 10,
      "moq": 10,
      "caseQty": 10,
      "physicalCase": 10,
      "innerPack": 1
    },
    "californiaWarning": false,
    "californiaWarningText": null,
    "newestRank": 69
  },
  {
    "sku": "AW205",
    "title": "Sigalux 6 Pack 65W Equivalent BR30 E26 Base Dimmable LED Flood Bulbs",
    "price": 9.0,
    "originalPrice": 4.5,
    "sourceUrl": "https://www.koleimports.com/sigalux-6-pack-65w-equivalent-br30-e26-base-dimmable-led-flood-bulbs-aw205",
    "sourceCheckedAt": "2026-11-04",
    "stock": 7185,
    "badges": [
      "new",
      "closeout"
    ],
    "collections": [
      "imports",
      "new-arrivals",
      "closeouts"
    ],
    "category": "Lighting",
    "subcategory": "Light Bulbs",
    "images": [
      "images/products/aw205-1.webp",
      "images/products/aw205-2.webp",
      "images/products/aw205-3.webp"
    ],
    "description": "Brighten indoor spaces with efficient, dependable lighting using the Sigalux 6 Pack 65W Equivalent BR30 LED Flood Bulbs. Each bulb uses just 7.5 watts while delivering 650 lumens of brightness, helping reduce energy use without sacrificing everyday illumination. The dimmable design lets you adjust the light level to suit the room, while the BR30 shape and standard E26 base make these bulbs ideal for recessed can lights, track lighting, and other compatible indoor fixtures. Designed with a soft white light output and rated to last up to 15 times longer than an incandescent bulb. Includes 6 LED flood bulbs. Comes packaged in a retail box.",
    "upc": "840696185397",
    "specs": {
      "Case Pack Quantity": "4 units",
      "Inner Pack Quantity": "1 units",
      "Case Pack Dimensions": "13.9 \" (L) x9.5 \" (W) x10.8 \"(H)",
      "Case Weight": "4.15 lb",
      "Case Cube": "0.83 cubic feet",
      "Per Piece Weight": "1.037500"
    },
    "rules": {
      "lot": 4,
      "moq": 8,
      "caseQty": 8,
      "physicalCase": 4,
      "innerPack": 1
    },
    "californiaWarning": false,
    "californiaWarningText": null,
    "newestRank": 70
  },
  {
    "sku": "AV973",
    "title": "Hawksbill PS5 2 in 1 Console Stand and Dual Charging Station",
    "price": 5.5,
    "originalPrice": 2.75,
    "sourceUrl": "https://www.koleimports.com/hawksbill-ps5-2-in-1-console-stand-and-dual-charging-station-av973",
    "sourceCheckedAt": "2026-11-04",
    "stock": 631,
    "badges": [
      "new",
      "closeout"
    ],
    "collections": [
      "imports",
      "new-arrivals",
      "closeouts"
    ],
    "category": "Electronics",
    "subcategory": "Computer & Tablet Accessories",
    "images": [
      "images/products/av973-1.webp",
      "images/products/av973-2.webp",
      "images/products/av973-3.webp"
    ],
    "description": "Keep your PS5 setup organized and ready to play with the Hawksbill PS5 2-in-1 Console Stand and Dual Charging Station. Designed to support PS5 consoles while simultaneously charging up to two compatible controllers, this space-saving stand helps create a cleaner, more organized gaming area. The dual charging docks provide convenient storage between sessions, while the sturdy base helps keep the console positioned upright. Compatible with PS5 standard, Digital Edition, and PS5 Ultra HD models shown on the packaging. Includes the 2-in-1 console stand and dual charging station plus a USB-A to USB-C power cable. Controllers and console not included. Comes packaged in a retail box with hanging tab.",
    "upc": "850033704020",
    "specs": {
      "Case Pack Quantity": "40 units",
      "Inner Pack Quantity": "1 units",
      "Case Pack Dimensions": "14 \" (L) x19 \" (W) x21.6 \"(H)",
      "Case Weight": "30.5 lb",
      "Case Cube": "3.32 cubic feet",
      "Per Piece Weight": "0.762500"
    },
    "rules": {
      "lot": 9,
      "moq": 9,
      "caseQty": 40,
      "physicalCase": 40,
      "innerPack": 1
    },
    "californiaWarning": false,
    "californiaWarningText": null,
    "newestRank": 71
  },
  {
    "sku": "AV970",
    "title": "Hawksbill Goliath V1 XXL Soft Gaming Mouse Mat",
    "price": 7.7,
    "originalPrice": 3.85,
    "sourceUrl": "https://www.koleimports.com/hawksbill-goliath-v1-xxl-soft-gaming-mouse-mat-av970",
    "sourceCheckedAt": "2026-11-04",
    "stock": 842,
    "badges": [
      "new",
      "closeout"
    ],
    "collections": [
      "imports",
      "new-arrivals",
      "closeouts"
    ],
    "category": "Electronics",
    "subcategory": "Computer & Tablet Accessories",
    "images": [
      "images/products/av970-1.webp",
      "images/products/av970-2.webp",
      "images/products/av970-3.webp"
    ],
    "description": "Upgrade your gaming setup with the Hawksbill Goliath V1 XXL Soft Gaming Mouse Mat, designed to give your keyboard and mouse plenty of room to move. Measuring approximately 35.4\" x 15.75\" x 0.16\" (900 x 400 x 4 mm), this oversized mat features a smooth micro-cloth surface for fast tracking, control, and precision during gaming or everyday computer use. The high-density foam rubber core adds comfort and durability, while the anti-slip rubber base helps keep the mat securely in place during intense gameplay. Finished with stitched edges to help prevent fraying and extend its lifespan, this XXL mat creates a clean, unified surface for your entire setup. Comes packaged in a box.",
    "upc": "850033704136",
    "specs": {
      "Case Pack Quantity": "40 units",
      "Inner Pack Quantity": "1 units",
      "Case Pack Dimensions": "17.9 \" (L) x17.2 \" (W) x27.9 \"(H)",
      "Case Weight": "76.55 lb",
      "Case Cube": "4.97 cubic feet",
      "Per Piece Weight": "1.913750"
    },
    "rules": {
      "lot": 7,
      "moq": 7,
      "caseQty": 40,
      "physicalCase": 40,
      "innerPack": 1
    },
    "californiaWarning": false,
    "californiaWarningText": null,
    "newestRank": 72
  },
  {
    "sku": "AV966",
    "title": "Hawksbill Wireless Gamepad Controller with IOS and Android Compatibility in Black & Red",
    "price": 8.8,
    "originalPrice": 4.4,
    "sourceUrl": "https://www.koleimports.com/hawksbill-wireless-gamepad-controller-with-ios-and-android-compatibility-in-black-red-av966",
    "sourceCheckedAt": "2026-11-04",
    "stock": 557,
    "badges": [
      "new",
      "closeout"
    ],
    "collections": [
      "imports",
      "new-arrivals",
      "closeouts"
    ],
    "category": "Electronics",
    "subcategory": "Cell Phone Accessories",
    "images": [
      "images/products/av966-1.webp",
      "images/products/av966-2.webp",
      "images/products/av966-3.webp"
    ],
    "description": "Take mobile and PC gaming to the next level with the Hawksbill Wireless Gamepad Controller with iOS and Android Compatibility in Black & Red. Designed with dual analog sticks, a directional pad, action buttons, turbo and auto functions, this versatile controller provides responsive control for a variety of games. The adjustable built-in phone holder accommodates approximately 4\" to 6\" devices for comfortable mobile play, while wireless Bluetooth connectivity helps eliminate tangled cords. Compatible with Android 3.0+, iOS 13.0+, Windows 7/8/10, Android TV, and select Steam games. Features a built-in 350mAh rechargeable lithium battery with up to 8 hours of use and approximately 2 hours of charging time. Includes Micro-USB cable and user manual. Comes packaged in a retail box.",
    "upc": "860000351676",
    "specs": {
      "Case Pack Quantity": "40 units",
      "Inner Pack Quantity": "1 units",
      "Case Pack Dimensions": "14.9 \" (L) x10.6 \" (W) x25 \"(H)",
      "Case Weight": "25 lb",
      "Case Cube": "2.28 cubic feet",
      "Per Piece Weight": "0.625000"
    },
    "rules": {
      "lot": 6,
      "moq": 6,
      "caseQty": 40,
      "physicalCase": 40,
      "innerPack": 1
    },
    "californiaWarning": false,
    "californiaWarningText": null,
    "newestRank": 73
  },
  {
    "sku": "AV964",
    "title": "Hawksbill Wireless Gamepad Controller with IOS and Android Compatibility in Black & Green",
    "price": 8.8,
    "originalPrice": 4.4,
    "sourceUrl": "https://www.koleimports.com/hawksbill-wireless-gamepad-controller-with-ios-and-android-compatibility-in-black-green-av964",
    "sourceCheckedAt": "2026-11-04",
    "stock": 741,
    "badges": [
      "new",
      "closeout"
    ],
    "collections": [
      "imports",
      "new-arrivals",
      "closeouts"
    ],
    "category": "Electronics",
    "subcategory": "Cell Phone Accessories",
    "images": [
      "images/products/av964-1.webp",
      "images/products/av964-2.webp",
      "images/products/av964-3.webp"
    ],
    "description": "Take your gaming anywhere with the Hawksbill Wireless Gamepad Controller in Black & Green, built for mobile, tablet, PC, and smart TV gaming. Compatible with iOS 11.0 and above, Android 3.0 and above, Windows 7/8/10, Android TV, and Steam games on Windows, this versatile controller features dual analog sticks, D-pad, ABXY buttons, Turbo and Auto functions, dual vibration mode, and a built-in adjustable phone holder that supports devices approximately 4–6\". Wireless Bluetooth connectivity provides up to approximately 26' range, while the built-in 350mAh rechargeable lithium battery delivers up to 8 hours of playtime. Features LED indicators, ergonomic grips, and wired PC gamepad support. Includes USB cable and user manual. Comes packaged in a box.",
    "upc": "860000351683",
    "specs": {
      "Case Pack Quantity": "40 units",
      "Inner Pack Quantity": "1 units",
      "Case Pack Dimensions": "15.1 \" (L) x10.9 \" (W) x24.9 \"(H)",
      "Case Weight": "30.2 lb",
      "Case Cube": "2.37 cubic feet",
      "Per Piece Weight": "0.755000"
    },
    "rules": {
      "lot": 6,
      "moq": 6,
      "caseQty": 40,
      "physicalCase": 40,
      "innerPack": 1
    },
    "californiaWarning": false,
    "californiaWarningText": null,
    "newestRank": 74
  },
  {
    "sku": "DA865",
    "title": "Dual Side Pet Hair Remover Brush",
    "price": 4.4,
    "originalPrice": 2.2,
    "sourceUrl": "https://www.koleimports.com/dual-side-pet-hair-remover-brush-da865",
    "sourceCheckedAt": "2026-11-04",
    "stock": 12547,
    "badges": [
      "new",
      "closeout"
    ],
    "collections": [
      "imports",
      "new-arrivals",
      "closeouts"
    ],
    "category": "Pet Supplies",
    "subcategory": "Pet Grooming",
    "images": [
      "images/products/da865-1.webp",
      "images/products/da865-2.webp",
      "images/products/da865-3.webp"
    ],
    "description": "This practical cleaning tool helps pet owners maintain a cleaner living space without the hassle of constantly reaching for a vacuum or disposable lint rollers. Featuring a dual-texture cleaning head, this pet hair remover is designed to capture loose dog and cat hair while brushing across fabric surfaces. The 2-in-1 cleaning surface helps lift embedded fur and collect it as you clean, making it useful for refreshing couches, upholstered furniture, pet beds, blankets, and other fabric-covered areas. Its wide rectangular cleaning head provides convenient coverage, while the extendable handle offers additional reach for cleaning larger surfaces and harder-to-access areas. The lightweight, handheld design makes this reusable pet hair removal tool convenient for everyday household cleaning. Whether dealing with seasonal shedding or routine pet hair buildup, the Duke's + Tiny's Pet Hair Remover offers a practical solution for keeping furniture and pet-friendly spaces looking neat and tidy. comes packaged in a printed retail box featuring product images, instructions highlighting its cleaning functions, and a demonstration of the dual-texture cleaning head. The box includes one pet hair remover with a handle extender, providing a convenient, shelf-ready presentation for pet supply stores, household cleaning departments, discount retailers, and general merchandise displays.",
    "upc": "731015333530",
    "specs": {
      "Case Pack Quantity": "24 units",
      "Inner Pack Quantity": "1 units",
      "Case Pack Dimensions": "17.9 \" (L) x8.5 \" (W) x11.5 \"(H)",
      "Case Weight": "6.949992 lb",
      "Case Cube": "1.01 cubic feet",
      "Per Piece Weight": "0.289583"
    },
    "rules": {
      "lot": 11,
      "moq": 11,
      "caseQty": 24,
      "physicalCase": 24,
      "innerPack": 1
    },
    "californiaWarning": true,
    "californiaWarningText": "WARNING: Cancer and Reproductive Harm – www.P65Warnings.ca.gov",
    "newestRank": 75
  },
  {
    "sku": "AW238",
    "title": "21V 30 Piece Cordless Power Drill Set with Carry Case",
    "price": 44.0,
    "originalPrice": 22.0,
    "sourceUrl": "https://www.koleimports.com/21v-30-piece-cordless-power-drill-set-with-carry-case-aw238",
    "sourceCheckedAt": "2026-11-04",
    "stock": 2720,
    "badges": [
      "new",
      "closeout"
    ],
    "collections": [
      "imports",
      "new-arrivals",
      "closeouts"
    ],
    "category": "Tools & Hardware",
    "subcategory": "Drills & Drill Accessories",
    "images": [
      "images/products/aw238-1.webp",
      "images/products/aw238-2.webp",
      "images/products/aw238-3.webp"
    ],
    "description": "Tackle everyday projects with the 21V 30 Piece Cordless Power Drill Set with Carry Case. This rechargeable drill features screwdriver, impact, and drilling functions with a no-load speed up to 2300 RPM for a variety of household tasks. The cordless design offers convenient mobility, while the rechargeable lithium-ion battery provides approximately 40–60 minutes of use with a 3–4 hour charging time. The 30-piece set includes assorted drill bits, screwdriver bits, sockets, an extension, charger, battery, and additional accessories. Everything stores neatly inside the included molded carry case for organized transport and storage. Comes packaged in a carry case with a retail sleeve.",
    "upc": "731015335442",
    "specs": {
      "Case Pack Quantity": "10 units",
      "Inner Pack Quantity": "1 units",
      "Case Pack Dimensions": "11.8 \" (L) x17.5 \" (W) x20.7 \"(H)",
      "Case Weight": "44.15 lb",
      "Case Cube": "2.47 cubic feet",
      "Per Piece Weight": "4.415000"
    },
    "rules": {
      "lot": 2,
      "moq": 2,
      "caseQty": 10,
      "physicalCase": 10,
      "innerPack": 1
    },
    "californiaWarning": false,
    "californiaWarningText": null,
    "newestRank": 76
  },
  {
    "sku": "AW237",
    "title": "G5 Game Box with 3\" LCD Display and Remote Control and TV Connectivity",
    "price": 24.0,
    "originalPrice": 12.0,
    "sourceUrl": "https://www.koleimports.com/g5-game-box-with-3-lcd-display-and-remote-control-and-tv-connectivity-aw237",
    "sourceCheckedAt": "2026-11-04",
    "stock": 1238,
    "badges": [
      "new",
      "closeout"
    ],
    "collections": [
      "imports",
      "new-arrivals",
      "closeouts"
    ],
    "category": "Electronics",
    "subcategory": "Computer Games",
    "images": [
      "images/products/aw237-1.webp",
      "images/products/aw237-2.webp",
      "images/products/aw237-3.webp"
    ],
    "description": "Take classic gaming on the go with the G5 Game Box with 3\" LCD Display, Remote Control, and TV Connectivity. This compact handheld game system features a 3-inch full-color screen, directional controls, game buttons, volume control, and built-in speaker for portable play. Connect it to a TV using the included AV cable for a larger-screen gaming experience, or use the included wired controller for added play options. Its lightweight design makes it easy to carry for travel, car rides, and everyday entertainment. Includes the G5 game system, wired controller, USB power cable, and AV cable. Comes packaged in a box.",
    "upc": "6949211237352",
    "specs": {
      "Case Pack Quantity": "100 units",
      "Inner Pack Quantity": "1 units",
      "Case Pack Dimensions": "11.9 \" (L) x21.2 \" (W) x21.7 \"(H)",
      "Case Weight": "44.2 lb",
      "Case Cube": "3.17 cubic feet",
      "Per Piece Weight": "0.442000"
    },
    "rules": {
      "lot": 2,
      "moq": 2,
      "caseQty": 100,
      "physicalCase": 100,
      "innerPack": 1
    },
    "californiaWarning": false,
    "californiaWarningText": null,
    "newestRank": 77
  },
  {
    "sku": "AW218",
    "title": "Monochromatic Kick Sack Foot Bag in Countertop Display",
    "price": 2.64,
    "originalPrice": 1.32,
    "sourceUrl": "https://www.koleimports.com/monochromatic-kick-sack-foot-bag-in-countertop-display-aw218",
    "sourceCheckedAt": "2026-11-04",
    "stock": 4104,
    "badges": [
      "new",
      "closeout"
    ],
    "collections": [
      "imports",
      "new-arrivals",
      "closeouts"
    ],
    "category": "Toys",
    "subcategory": "Sport Toys",
    "images": [
      "images/products/aw218-1.webp",
      "images/products/aw218-2.webp",
      "images/products/aw218-3.webp"
    ],
    "description": "Practice kicks, tricks, and coordination with the Monochromatic Kick Sack Foot Bag. Each hand-knitted-style foot bag features a soft, textured exterior with coordinating shades blended into a colorful monochromatic design. Compact and easy to carry, it is perfect for solo practice, group games, outdoor play, or keeping handy for quick screen-free entertainment. Assorted color combinations add variety and make each foot bag fun to collect and share. Comes in assorted monochromatic designs packaged in a countertop display.",
    "upc": "820495069203",
    "specs": {
      "Case Pack Quantity": "288 units",
      "Inner Pack Quantity": "24 units",
      "Case Pack Dimensions": "19.1 \" (L) x14.3 \" (W) x11.5 \"(H)",
      "Case Weight": "31.300128 lb",
      "Case Cube": "1.82 cubic feet",
      "Per Piece Weight": "0.108681"
    },
    "rules": {
      "lot": 24,
      "moq": 24,
      "caseQty": 288,
      "physicalCase": 288,
      "innerPack": 24
    },
    "californiaWarning": false,
    "californiaWarningText": null,
    "newestRank": 78
  },
  {
    "sku": "AV872",
    "title": "Barocity Green Reflective Rainbow Hex Pattern Football Size 3",
    "price": 5.5,
    "originalPrice": 2.75,
    "sourceUrl": "https://www.koleimports.com/barocity-green-reflective-rainbow-hex-pattern-football-size-3-av872",
    "sourceCheckedAt": "2026-11-04",
    "stock": 178,
    "badges": [
      "new",
      "closeout"
    ],
    "collections": [
      "imports",
      "new-arrivals",
      "closeouts"
    ],
    "category": "Sporting Goods",
    "subcategory": "Team Sports Equipment",
    "images": [
      "images/products/av872-1.webp",
      "images/products/av872-2.webp",
      "images/products/av872-3.webp"
    ],
    "description": "Bring bold color and standout shine to every game with the Barocity Green Reflective Rainbow Hex Pattern Football Size 3. This pee-wee football features a vibrant green finish with a reflective hexagon pattern that catches rainbow tones in the light for an eye-catching look on the field. Made from high-quality PVC, it offers great durability, softness, and bounce for fun recreational play, while raised laces provide extra fingertip grip for better control when throwing and catching. The water-resistant design makes it suitable for indoor and outdoor use. Measures approximately 8.5\" long x 5\" high with a 16.5\" circumference.",
    "upc": "198100011863",
    "specs": {
      "Case Pack Quantity": "50 units",
      "Inner Pack Quantity": "1 units",
      "Case Pack Dimensions": "7.5 \" (L) x3 \" (W) x31.1 \"(H)",
      "Case Weight": "30.95 lb",
      "Case Cube": "0.40 cubic feet",
      "Per Piece Weight": "0.619000"
    },
    "rules": {
      "lot": 9,
      "moq": 9,
      "caseQty": 50,
      "physicalCase": 50,
      "innerPack": 1
    },
    "californiaWarning": false,
    "californiaWarningText": null,
    "newestRank": 79
  },
  {
    "sku": "AV870",
    "title": "Barocity Classic White & Silver Rainbow Hex Pattern Soccer Ball Size 3",
    "price": 5.5,
    "originalPrice": 2.75,
    "sourceUrl": "https://www.koleimports.com/barocity-classic-white-silver-rainbow-hex-pattern-soccer-ball-size-3-av870",
    "sourceCheckedAt": "2026-11-04",
    "stock": 452,
    "badges": [
      "new",
      "closeout"
    ],
    "collections": [
      "imports",
      "new-arrivals",
      "closeouts"
    ],
    "category": "Sporting Goods",
    "subcategory": "Team Sports Equipment",
    "images": [
      "images/products/av870-1.webp",
      "images/products/av870-2.webp",
      "images/products/av870-3.webp"
    ],
    "description": "Bring classic soccer style together with an eye-catching reflective finish with the Barocity Classic White & Silver Rainbow Hex Pattern Soccer Ball Size 3. Featuring a traditional white and silver paneled design with a rainbow-reflective hexagon pattern, this ball adds standout shine during play. Made from high-quality PVC, it offers durability, softness, and responsive bounce, while the water-resistant construction makes it suitable for indoor or outdoor use. The Size 3 design measures approximately 7\" and is recommended for ages 8 and under, making it a great choice for practice, recreational games, schools, camps, and everyday play.",
    "upc": "707466778978",
    "specs": {
      "Case Pack Quantity": "50 units",
      "Inner Pack Quantity": "1 units",
      "Case Pack Dimensions": "6.5 \" (L) x4.4 \" (W) x30.1 \"(H)",
      "Case Weight": "42.4 lb",
      "Case Cube": "0.50 cubic feet",
      "Per Piece Weight": "0.848000"
    },
    "rules": {
      "lot": 9,
      "moq": 9,
      "caseQty": 50,
      "physicalCase": 50,
      "innerPack": 1
    },
    "californiaWarning": false,
    "californiaWarningText": null,
    "newestRank": 80
  },
  {
    "sku": "AV869",
    "title": "Barocity Multicolor Reflective Rainbow Hex Football Size 6",
    "price": 7.7,
    "originalPrice": 3.85,
    "sourceUrl": "https://www.koleimports.com/barocity-multicolor-reflective-rainbow-hex-football-size-6-av869",
    "sourceCheckedAt": "2026-11-04",
    "stock": 483,
    "badges": [
      "new",
      "closeout"
    ],
    "collections": [
      "imports",
      "new-arrivals",
      "closeouts"
    ],
    "category": "Sporting Goods",
    "subcategory": "Team Sports Equipment",
    "images": [
      "images/products/av869-1.webp",
      "images/products/av869-2.webp",
      "images/products/av869-3.webp"
    ],
    "description": "Stand out during every throw with the Barocity Multicolor Reflective Rainbow Hex Football Size 6. This junior-size football features a bold multicolor reflective finish with a hexagon pattern that catches rainbow tones in the light for an eye-catching look. Made from high-quality PVC, it offers durability, softness, and responsive bounce, while raised laces provide extra fingertip grip for improved control when throwing and catching. The water-resistant design makes it suitable for both indoor and outdoor play. Size 6 Junior measures approximately 10.25\" long x 6\" high with a 20\" circumference.",
    "upc": "707466778848",
    "specs": {
      "Case Pack Quantity": "50 units",
      "Inner Pack Quantity": "1 units",
      "Case Pack Dimensions": "24.8 \" (L) x31 \" (W) x7 \"(H)",
      "Case Weight": "44.25 lb",
      "Case Cube": "3.11 cubic feet",
      "Per Piece Weight": "0.885000"
    },
    "rules": {
      "lot": 7,
      "moq": 7,
      "caseQty": 50,
      "physicalCase": 50,
      "innerPack": 1
    },
    "californiaWarning": false,
    "californiaWarningText": null,
    "newestRank": 81
  },
  {
    "sku": "AV864",
    "title": "Barocity White Reflective Rainbow Hex Pattern Football Size 3",
    "price": 5.5,
    "originalPrice": 2.75,
    "sourceUrl": "https://www.koleimports.com/barocity-white-reflective-rainbow-hex-pattern-football-size-3-av864",
    "sourceCheckedAt": "2026-11-04",
    "stock": 517,
    "badges": [
      "new",
      "closeout"
    ],
    "collections": [
      "imports",
      "new-arrivals",
      "closeouts"
    ],
    "category": "Sporting Goods",
    "subcategory": "Team Sports Equipment",
    "images": [
      "images/products/av864-1.webp",
      "images/products/av864-2.webp",
      "images/products/av864-3.webp"
    ],
    "description": "Add eye-catching shine to every throw with the Barocity White Reflective Rainbow Hex Pattern Football Size 3. Featuring a white finish with a reflective hexagon pattern that catches rainbow tones in the light, this pee-wee football combines standout style with everyday playability. Made from high-quality PVC, it offers durability, softness, and responsive bounce, while raised laces provide extra fingertip grip for throwing and catching. The water-resistant design is suitable for indoor and outdoor play. Measures approximately 8.5\" long x 5\" high with a 16.5\" circumference.",
    "upc": "707466778756",
    "specs": {
      "Case Pack Quantity": "50 units",
      "Inner Pack Quantity": "1 units",
      "Case Pack Dimensions": "7.932 \" (L) x18.6 \" (W) x31.6 \"(H)",
      "Case Weight": "32.6 lb",
      "Case Cube": "2.70 cubic feet",
      "Per Piece Weight": "0.652000"
    },
    "rules": {
      "lot": 9,
      "moq": 9,
      "caseQty": 50,
      "physicalCase": 50,
      "innerPack": 1
    },
    "californiaWarning": false,
    "californiaWarningText": null,
    "newestRank": 82
  },
  {
    "sku": "AV862",
    "title": "Barocity Orange Reflective Rainbow Hex Pattern Size 4 Soccer Ball",
    "price": 6.6,
    "originalPrice": 3.3,
    "sourceUrl": "https://www.koleimports.com/barocity-orange-reflective-rainbow-hex-pattern-size-4-soccer-ball-av862",
    "sourceCheckedAt": "2026-11-04",
    "stock": 90,
    "badges": [
      "new",
      "closeout"
    ],
    "collections": [
      "imports",
      "new-arrivals",
      "closeouts"
    ],
    "category": "Sporting Goods",
    "subcategory": "Team Sports Equipment",
    "images": [
      "images/products/av862-1.webp",
      "images/products/av862-2.webp",
      "images/products/av862-3.webp"
    ],
    "description": "Brighten up the game with the Barocity Orange Reflective Rainbow Hex Pattern Size 4 Soccer Ball. Featuring a bold orange finish with a reflective hexagon pattern that catches rainbow tones in the light, this eye-catching ball is built for both style and play. Measuring approximately 7.5\", the Size 4 design offers a balance of durability, softness, and responsive bounce. Made from high-quality PVC with water-resistant construction, it is suitable for indoor or outdoor use and is a great choice for practice, recreational games, schools, camps, and everyday play.",
    "upc": "707466772556",
    "specs": {
      "Case Pack Quantity": "50 units",
      "Inner Pack Quantity": "1 units",
      "Case Pack Dimensions": "11 \" (L) x16.1 \" (W) x31.2 \"(H)",
      "Case Weight": "38.15 lb",
      "Case Cube": "3.20 cubic feet",
      "Per Piece Weight": "0.763000"
    },
    "rules": {
      "lot": 8,
      "moq": 8,
      "caseQty": 50,
      "physicalCase": 50,
      "innerPack": 1
    },
    "californiaWarning": false,
    "californiaWarningText": null,
    "newestRank": 83
  },
  {
    "sku": "AV855",
    "title": "Barocity Pink Reflective Rainbow Hex Pattern Size 3 Soccer Ball",
    "price": 5.5,
    "originalPrice": 2.75,
    "sourceUrl": "https://www.koleimports.com/barocity-pink-reflective-rainbow-hex-pattern-size-3-soccer-ball-av855",
    "sourceCheckedAt": "2026-11-04",
    "stock": 1416,
    "badges": [
      "new",
      "closeout"
    ],
    "collections": [
      "imports",
      "new-arrivals",
      "closeouts"
    ],
    "category": "Sporting Goods",
    "subcategory": "Team Sports Equipment",
    "images": [
      "images/products/av855-1.webp",
      "images/products/av855-2.webp",
      "images/products/av855-3.webp"
    ],
    "description": "Add a bold pop of color to every kick with the Barocity Pink Reflective Rainbow Hex Pattern Size 3 Soccer Ball. Designed with a vibrant pink finish and eye-catching hexagon pattern with rainbow reflection, this ball stands out on the field while delivering great durability, softness, and bounce. Made from high-quality PVC with a water-resistant construction, it is suitable for indoor and outdoor play. Measuring approximately 7\" x 7\", this Size 3 soccer ball is a fun choice for practice, recreational games, and active play.",
    "upc": "707466772389",
    "specs": {
      "Case Pack Quantity": "50 units",
      "Inner Pack Quantity": "1 units",
      "Case Pack Dimensions": "23.2 \" (L) x8.2 \" (W) x31 \"(H)",
      "Case Weight": "42.2 lb",
      "Case Cube": "3.41 cubic feet",
      "Per Piece Weight": "0.844000"
    },
    "rules": {
      "lot": 9,
      "moq": 9,
      "caseQty": 50,
      "physicalCase": 50,
      "innerPack": 1
    },
    "californiaWarning": false,
    "californiaWarningText": null,
    "newestRank": 84
  },
  {
    "sku": "AV849",
    "title": "Barocity Unicorn Graphic Size 3 Soccer Ball",
    "price": 5.5,
    "originalPrice": 2.75,
    "sourceUrl": "https://www.koleimports.com/barocity-unicorn-graphic-size-3-soccer-ball-av849",
    "sourceCheckedAt": "2026-11-04",
    "stock": 1111,
    "badges": [
      "new",
      "closeout"
    ],
    "collections": [
      "imports",
      "new-arrivals",
      "closeouts"
    ],
    "category": "Sporting Goods",
    "subcategory": "Team Sports Equipment",
    "images": [
      "images/products/av849-1.webp",
      "images/products/av849-2.webp",
      "images/products/av849-3.webp"
    ],
    "description": "Make playtime extra magical with the Barocity Unicorn Graphic Size 3 Soccer Ball, featuring colorful unicorn-inspired graphics and whimsical “Make Your Own Magic” designs across a bright white background. Sized at approximately 7\", this Size 3 ball is great for younger players, casual games, practice, and outdoor fun. Made with TPU material and stitched construction, it is designed for durability, softness, bounce, and water resistance. The vibrant multicolor artwork makes it a fun choice for kids who love unicorns and sports. Suitable for all ages.",
    "upc": "769498046135",
    "specs": {
      "Case Pack Quantity": "50 units",
      "Inner Pack Quantity": "1 units",
      "Case Pack Dimensions": "9 \" (L) x22.7 \" (W) x30.3 \"(H)",
      "Case Weight": "33.85 lb",
      "Case Cube": "3.58 cubic feet",
      "Per Piece Weight": "0.677000"
    },
    "rules": {
      "lot": 9,
      "moq": 9,
      "caseQty": 50,
      "physicalCase": 50,
      "innerPack": 1
    },
    "californiaWarning": false,
    "californiaWarningText": null,
    "newestRank": 85
  },
  {
    "sku": "CB642",
    "title": "6 Piece Microfiber Car Cleaning Kit",
    "price": 17.6,
    "originalPrice": 8.8,
    "sourceUrl": "https://www.koleimports.com/6-piece-microfiber-car-cleaning-kit-cb642",
    "sourceCheckedAt": "2026-11-04",
    "stock": 2346,
    "badges": [
      "new"
    ],
    "collections": [
      "imports",
      "new-arrivals"
    ],
    "category": "Automotive Supplies",
    "subcategory": "Auto Care & Maintenance",
    "images": [
      "images/products/cb642-1.webp",
      "images/products/cb642-2.webp",
      "images/products/cb642-3.webp"
    ],
    "description": "Designed for convenient car washing and detailing, this versatile cleaning set includes essential microfiber accessories for washing, wiping, polishing, and applying wax to vehicle surfaces. kit contains 2 microfiber wash mitts, 2 microfiber wash sponges, and 2 microfiber wax applicator pads, providing a complete assortment of cleaning tools for different stages of automotive care. The microfiber wash mitts feature a textured mesh side for cleaning and a soft microfiber side for polishing, helping remove dirt and grime from vehicle exteriors. The microfiber wash sponges offer additional cleaning coverage for washing larger surfaces, while the round wax applicator pads feature ultra-soft microfiber designed for smooth, even application of wax and polish. The kit features bright assorted colors, including green, yellow, and orange, making the different cleaning accessories easy to identify. The soft microfiber material is suitable for routine car care and helps provide gentle cleaning when used properly with appropriate automotive cleaning products. Whether washing a car, maintaining its exterior finish, or adding a polished appearance, this multipurpose set provides convenient tools for everyday vehicle detailing. The Microfiber Auto Detailing Kit comes packaged in a clear, resealable zippered storage bag with printed product labels, keeping all six accessories organized and visible.",
    "upc": "731015327461",
    "specs": {
      "Case Pack Quantity": "24 units",
      "Inner Pack Quantity": "1 units",
      "Case Pack Dimensions": "21.5 \" (L) x14.4 \" (W) x22.3 \"(H)",
      "Case Weight": "11.200008 lb",
      "Case Cube": "4.00 cubic feet",
      "Per Piece Weight": "0.466667"
    },
    "rules": {
      "lot": 3,
      "moq": 3,
      "caseQty": 24,
      "physicalCase": 24,
      "innerPack": 1
    },
    "californiaWarning": false,
    "californiaWarningText": null,
    "newestRank": 86
  },
  {
    "sku": "CB587",
    "title": "Fishing Hook Game Set with Rod & Sea Animal Catch Toys",
    "price": 2.8,
    "originalPrice": 1.4,
    "sourceUrl": "https://www.koleimports.com/fishing-hook-game-set-with-rod-sea-animal-catch-toys-cb587",
    "sourceCheckedAt": "2026-11-04",
    "stock": 4115,
    "badges": [
      "new"
    ],
    "collections": [
      "imports",
      "new-arrivals"
    ],
    "category": "Toys",
    "subcategory": "Activity Toys",
    "images": [
      "images/products/cb587-1.webp",
      "images/products/cb587-2.webp"
    ],
    "description": "This entertaining fishing toy encourages hands-on play, coordination, and imaginative fun as kids pretend to catch and collect colorful ocean creatures. The set features a blue toy fishing rod with an attached hook, a round fishing net, and four brightly colored sea animal figures, including a red seahorse, green fish, purple starfish, and yellow crab. Each sea creature features a small loop that allows children to practice hooking and lifting their catch. The included fishing net adds another way to collect the sea animals, creating an interactive play experience that helps develop hand-eye coordination, concentration, and fine motor skills. With its vibrant colors and playful underwater theme, this fishing game is ideal for pretend fishing adventures, indoor activities, playdates, party favors, birthday gifts, and everyday entertainment. Children can challenge themselves to catch different sea creatures while exploring imaginative ocean-themed play. The lightweight pieces are easy for little hands to handle, making the set an engaging addition to children's toy collections. The Fishing Hook Game Set comes packaged in a clear molded blister pack attached to a colorful underwater-themed hanging retail card.",
    "upc": "731015323982",
    "specs": {
      "Case Pack Quantity": "144 units",
      "Inner Pack Quantity": "24 units",
      "Case Pack Dimensions": "27 \" (L) x19 \" (W) x26 \"(H)",
      "Case Weight": "27.549936 lb",
      "Case Cube": "7.72 cubic feet",
      "Per Piece Weight": "0.191319"
    },
    "rules": {
      "lot": 24,
      "moq": 24,
      "caseQty": 144,
      "physicalCase": 144,
      "innerPack": 24
    },
    "californiaWarning": true,
    "californiaWarningText": "WARNING: Cancer and Reproductive Harm – www.P65Warnings.ca.gov",
    "newestRank": 87
  },
  {
    "sku": "AW159",
    "title": "OKKO MegaBass V3 LED Bluetooth Speaker",
    "price": 26.4,
    "originalPrice": 13.2,
    "sourceUrl": "https://www.koleimports.com/okko-megabass-v3-led-bluetooth-speaker-aw159",
    "sourceCheckedAt": "2026-11-04",
    "stock": 813,
    "badges": [
      "new",
      "closeout"
    ],
    "collections": [
      "imports",
      "new-arrivals",
      "closeouts"
    ],
    "category": "Electronics",
    "subcategory": "Portable Audio Players",
    "images": [
      "images/products/aw159-1.webp",
      "images/products/aw159-2.webp",
      "images/products/aw159-3.webp"
    ],
    "description": "Bring bold sound and party-ready style anywhere with the OKKO MegaBass V3 LED Bluetooth Speaker. Featuring a rugged black cabinet, large front speaker, integrated LED lighting, and a top-mounted control panel, this portable speaker is built for music, gatherings, garages, patios, and everyday entertainment. Bluetooth connectivity makes it easy to stream audio wirelessly from compatible devices, while the onboard controls provide convenient access to playback and sound adjustments. The built-in carrying handle makes transport easy, and the bold MegaBass design adds extra presence to any setup. Measures approximately 14\" H x 9\" L x 7\" W. Comes packaged in a retail box.",
    "upc": "840372301905",
    "specs": {
      "Case Pack Quantity": "1 units",
      "Inner Pack Quantity": "1 units",
      "Case Pack Dimensions": "10.2 \" (L) x8.5 \" (W) x15.7 \"(H)",
      "Case Weight": "4.3 lb",
      "Case Cube": "0.79 cubic feet",
      "Per Piece Weight": "4.300000"
    },
    "rules": {
      "lot": 1,
      "moq": 2,
      "caseQty": 2,
      "physicalCase": 1,
      "innerPack": 1
    },
    "californiaWarning": false,
    "californiaWarningText": null,
    "newestRank": 88
  },
  {
    "sku": "DA855",
    "title": "2 Pack Silicone Pastry and Basting Brushes in Assorted Colors",
    "price": 1.7,
    "originalPrice": 0.85,
    "sourceUrl": "https://www.koleimports.com/2-pack-silicone-pastry-and-basting-brushes-in-assorted-colors-da855",
    "sourceCheckedAt": "2026-11-04",
    "stock": 9201,
    "badges": [
      "new",
      "closeout"
    ],
    "collections": [
      "imports",
      "new-arrivals",
      "closeouts"
    ],
    "category": "Kitchen & Dining",
    "subcategory": "Kitchen Tools & Utensils",
    "images": [
      "images/products/da855-1.webp",
      "images/products/da855-2.webp",
      "images/products/da855-3.webp"
    ],
    "description": "This 2-piece silicone basting brush set is a versatile kitchen essential designed for grilling, baking, roasting, and everyday cooking. Made with flexible silicone bristles that are heat resistant up to 600°F, these brushes help evenly spread marinades, sauces, melted butter, oils, egg washes, and glazes for delicious results. The set includes two convenient sizes for a variety of tasks, making it easy to baste meats, brush pastries, coat vegetables, or apply barbecue sauce with precision. Durable, reusable, and easy to clean, these brushes are a practical addition to any home kitchen or outdoor grilling setup. The set includes one brush measuring 7.75 inches long with a 1.25-inch bristle width and one brush measuring 6.75 inches long with a 1-inch bristle width. Comes in assorted Blue and Red colors and is packaged on a full-color hanging card measuring 4.5 inches x 8.75 inches for easy retail display.",
    "upc": "731015324309",
    "specs": {
      "Case Pack Quantity": "24 units",
      "Inner Pack Quantity": "1 units",
      "Case Pack Dimensions": "9.5 \" (L) x5.9 \" (W) x9.4 \"(H)",
      "Case Weight": "3.199992 lb",
      "Case Cube": "0.30 cubic feet",
      "Per Piece Weight": "0.133333"
    },
    "rules": {
      "lot": 24,
      "moq": 24,
      "caseQty": 24,
      "physicalCase": 24,
      "innerPack": 1
    },
    "californiaWarning": true,
    "californiaWarningText": "WARNING: Cancer and Reproductive Harm – www.P65Warnings.ca.gov",
    "newestRank": 89
  },
  {
    "sku": "AV843",
    "title": "EiKO LED BR Lamp 8W 650L 3000K 120V E26 Light Bulb",
    "price": 2.8,
    "originalPrice": 1.4,
    "sourceUrl": "https://www.koleimports.com/eiko-led-br-lamp-8w-650l-3000k-120v-e26-light-bulb-av843",
    "sourceCheckedAt": "2026-11-04",
    "stock": 3402,
    "badges": [
      "new",
      "closeout"
    ],
    "collections": [
      "imports",
      "new-arrivals",
      "closeouts"
    ],
    "category": "Lighting",
    "subcategory": "Light Bulbs",
    "images": [
      "images/products/av843-1.webp",
      "images/products/av843-2.webp"
    ],
    "description": "Brighten your space with reliable, energy-efficient lighting using the EiKO LED BR Lamp 8W 650L 3000K 120V E26 Light Bulb. This LED bulb delivers 650 lumens of warm 3000K light while using only 8 watts of power, making it a practical choice for everyday indoor lighting. Designed with a standard E26 medium base, it fits a variety of compatible lamps and fixtures. The BR-style shape helps provide broad illumination, while the long-lasting design offers up to 25,000 hours of use. Operates at 120V. Comes packaged in a retail box.",
    "upc": "031293103765",
    "specs": {
      "Case Pack Quantity": "24 units",
      "Inner Pack Quantity": "1 units",
      "Case Pack Dimensions": "15.8 \" (L) x11.9 \" (W) x11.5 \"(H)",
      "Case Weight": "6.3 lb",
      "Case Cube": "1.25 cubic feet",
      "Per Piece Weight": "0.262500"
    },
    "rules": {
      "lot": 24,
      "moq": 24,
      "caseQty": 24,
      "physicalCase": 24,
      "innerPack": 1
    },
    "californiaWarning": false,
    "californiaWarningText": null,
    "newestRank": 90
  },
  {
    "sku": "AV981",
    "title": "Hawksbill Hard Shell Travel Controller Case in Black & Green",
    "price": 3.3,
    "originalPrice": 1.65,
    "sourceUrl": "https://www.koleimports.com/hawksbill-hard-shell-travel-controller-case-in-black-green-av981",
    "sourceCheckedAt": "2026-11-04",
    "stock": 78,
    "badges": [
      "new",
      "closeout"
    ],
    "collections": [
      "imports",
      "new-arrivals",
      "closeouts"
    ],
    "category": "Electronics",
    "subcategory": "Computer & Tablet Accessories",
    "images": [
      "images/products/av981-1.webp",
      "images/products/av981-2.webp",
      "images/products/av981-3.webp"
    ],
    "description": "Protect your gaming controller during storage and travel with the Hawksbill Hard Shell Travel Controller Case in Black & Green. Designed with a sturdy, molded hard shell exterior, this case helps shield your controller from bumps, scratches, and everyday wear. The soft interior lining provides cushioning, while the built-in mesh pocket keeps small gaming accessories organized. Featuring a textured black exterior with a bright green Hawksbill logo, this case combines functionality with a sleek gaming-inspired design. Complete with a secure zipper closure and comfortable carrying handle for easy portability.",
    "upc": "731015338122",
    "specs": {
      "Case Pack Quantity": "84 units",
      "Inner Pack Quantity": "1 units",
      "Case Pack Dimensions": "21.6 \" (L) x21.8 \" (W) x21.9 \"(H)",
      "Case Weight": "30.800028 lb",
      "Case Cube": "5.97 cubic feet",
      "Per Piece Weight": "0.366667"
    },
    "rules": {
      "lot": 15,
      "moq": 15,
      "caseQty": 84,
      "physicalCase": 84,
      "innerPack": 1
    },
    "californiaWarning": false,
    "californiaWarningText": null,
    "newestRank": 91
  },
  {
    "sku": "AV863",
    "title": "Barocity Orange Reflective Rainbow Hex Pattern Size 5 Soccer Ball",
    "price": 7.7,
    "originalPrice": 3.85,
    "sourceUrl": "https://www.koleimports.com/barocity-orange-reflective-rainbow-hex-pattern-size-5-soccer-ball-av863",
    "sourceCheckedAt": "2026-11-04",
    "stock": 45,
    "badges": [
      "new",
      "closeout"
    ],
    "collections": [
      "imports",
      "new-arrivals",
      "closeouts"
    ],
    "category": "Sporting Goods",
    "subcategory": "Team Sports Equipment",
    "images": [
      "images/products/av863-1.webp",
      "images/products/av863-2.webp",
      "images/products/av863-3.webp"
    ],
    "description": "Get ready to kick off the fun with the Barocity Orange Reflective Rainbow Hex Pattern Size 5 Soccer Ball! Featuring a vibrant orange design with a textured hexagon pattern and rainbow-reflective detailing, this eye-catching soccer ball adds a colorful touch to every game. Made from high-quality PVC material, it offers durability, softness, and a responsive bounce for enjoyable play. The water-resistant construction makes it suitable for both indoor and outdoor use, whether practicing soccer skills, playing recreational matches, or enjoying backyard games. Measuring approximately 8 inches in diameter, this Size 5 soccer ball is a great addition to any soccer enthusiast's sports equipment collection!",
    "upc": "707466772563",
    "specs": {
      "Case Pack Quantity": "50 units",
      "Inner Pack Quantity": "1 units",
      "Case Pack Dimensions": "9.9 \" (L) x17.1 \" (W) x31.7 \"(H)",
      "Case Weight": "39.8 lb",
      "Case Cube": "3.11 cubic feet",
      "Per Piece Weight": "0.796000"
    },
    "rules": {
      "lot": 7,
      "moq": 7,
      "caseQty": 50,
      "physicalCase": 50,
      "innerPack": 1
    },
    "californiaWarning": false,
    "californiaWarningText": null,
    "newestRank": 92
  },
  {
    "sku": "AV011",
    "title": "Bytech Universal Foldable Tablet and Mobile Device Stand in White",
    "price": 2.8,
    "originalPrice": 1.4,
    "sourceUrl": "https://www.koleimports.com/bytech-universal-foldable-tablet-and-mobile-device-stand-in-white-av011",
    "sourceCheckedAt": "2026-11-04",
    "stock": 0,
    "badges": [
      "new",
      "closeout"
    ],
    "collections": [
      "imports",
      "new-arrivals",
      "closeouts"
    ],
    "category": "Electronics",
    "subcategory": "Cell Phone Accessories",
    "images": [
      "images/products/av011-1.webp",
      "images/products/av011-2.webp",
      "images/products/av011-3.webp"
    ],
    "description": "Keep your screen comfortably positioned wherever you go with the Bytech Universal Foldable Tablet and Mobile Device Stand in White. Designed for smartphones, tablets, and gaming devices approximately 4\" to 10\", this versatile stand features an adjustable swivel holder so you can easily find the right viewing angle for videos, gaming, video calls, reading, or browsing. Its lightweight, foldable design collapses down to a compact pocket-friendly size for easy storage and travel, while non-slip anti-skid pads help keep your device and the stand securely in place. Sleek, portable, and easy to use, it is a convenient hands-free solution for home, office, or on the go. Comes packaged in a retail box with a user manual.",
    "upc": "805112059614",
    "specs": {
      "Case Pack Quantity": "40 units",
      "Inner Pack Quantity": "4 units",
      "Case Pack Dimensions": "9.5 \" (L) x14.5 \" (W) x27 \"(H)",
      "Case Weight": "11.55 lb",
      "Case Cube": "2.15 cubic feet",
      "Per Piece Weight": "0.288750"
    },
    "rules": {
      "lot": 4,
      "moq": 16,
      "caseQty": 40,
      "physicalCase": 40,
      "innerPack": 4
    },
    "californiaWarning": true,
    "californiaWarningText": "WARNING: Cancer and Reproductive Harm – www.P65Warnings.ca.gov",
    "newestRank": 93
  },
  {
    "sku": "AV667",
    "title": "LEDeez 3 in 1 LED Projector Dome in PDQ Display",
    "price": 7.92,
    "originalPrice": 3.96,
    "sourceUrl": "https://www.koleimports.com/ledeez-3-in-1-led-projector-dome-in-pdq-display-av667",
    "sourceCheckedAt": "2026-11-04",
    "stock": 0,
    "badges": [
      "new",
      "closeout"
    ],
    "collections": [
      "imports",
      "new-arrivals",
      "closeouts"
    ],
    "category": "Lighting",
    "subcategory": "Lamps & Lighting",
    "images": [
      "images/products/av667-1.webp",
      "images/products/av667-2.webp",
      "images/products/av667-3.webp"
    ],
    "description": "Transform any room into a dazzling light show with the LEDeez 3-in-1 LED Projector Dome! Featuring 8 exciting light modes and 3 interchangeable domes, this versatile projector lets you create the perfect atmosphere for parties, celebrations, bedrooms, and relaxing evenings. Switch between the Disco dome for vibrant red and blue light patterns, the Galaxy dome for colorful stars and moons, or the Light Diffuser dome for a soft, soothing glow. The compact black base features an easy-to-use control button, making it simple to change lighting effects and customize your space. Perfect for adding colorful ambiance to any occasion, this fun and versatile projector makes a great gift for all ages. Each unit comes individually boxed and packaged in a convenient countertop PDQ display for easy retail merchandising.",
    "upc": "888255307903",
    "specs": {
      "Case Pack Quantity": "3 units",
      "Inner Pack Quantity": "3 units",
      "Case Pack Dimensions": "12.9 \" (L) x4.8 \" (W) x6 \"(H)",
      "Case Weight": "2.1 lb",
      "Case Cube": "0.21 cubic feet",
      "Per Piece Weight": "0.700000"
    },
    "rules": {
      "lot": 3,
      "moq": 9,
      "caseQty": 9,
      "physicalCase": 3,
      "innerPack": 3
    },
    "californiaWarning": true,
    "californiaWarningText": "WARNING: Cancer and Reproductive Harm – www.P65Warnings.ca.gov",
    "newestRank": 94
  },
  {
    "sku": "BI578",
    "title": "72 Piece Cubic Zirconia Earring Refill Board",
    "price": 150.48,
    "originalPrice": 75.24,
    "sourceUrl": "https://www.koleimports.com/cubic-zirconia-earrings-refill-bi578",
    "sourceCheckedAt": "2026-11-04",
    "stock": 203,
    "badges": [],
    "collections": [
      "imports"
    ],
    "category": "Apparel",
    "subcategory": "Jewelry",
    "images": [
      "images/products/bi578-1.webp",
      "images/products/bi578-2.webp",
      "images/products/bi578-3.webp"
    ],
    "description": "Is your display getting low in stock?  Here's a 72 piece cubic zirconia board to replenish your sold out stock.  Earring bases include both silver and gold-toned. The panel features an assortment of earring sizes.  Each pair of earrings is carefully packed on a cushioned card and placed inside the display.  Ready to be added to your showstopping display attracting customer's attention.",
    "upc": null,
    "specs": {
      "Case Pack Quantity": "50 units",
      "Inner Pack Quantity": "1 units",
      "Case Pack Dimensions": "12.5 \" (L) x15.9 \" (W) x25.5 \"(H)",
      "Case Weight": "22.75 lb",
      "Case Cube": "2.93 cubic feet",
      "Per Piece Weight": "0.455000"
    },
    "rules": {
      "lot": 1,
      "moq": 1,
      "caseQty": 50,
      "physicalCase": 50,
      "innerPack": 1
    },
    "californiaWarning": false,
    "californiaWarningText": null,
    "newestRank": 95
  },
  {
    "sku": "OL512",
    "title": "Bamboo Utensil Set with Container",
    "price": 6.6,
    "originalPrice": 3.3,
    "sourceUrl": "https://www.koleimports.com/bamboo-utensil-set-with-container-ol512",
    "sourceCheckedAt": "2026-11-04",
    "stock": 3847,
    "badges": [],
    "collections": [
      "imports"
    ],
    "category": "Kitchen & Dining",
    "subcategory": "Best Sellers",
    "images": [
      "images/products/ol512-1.webp",
      "images/products/ol512-2.webp",
      "images/products/ol512-3.webp"
    ],
    "description": "Great for a variety of cooking and serving tasks, this 4-piece Bamboo Utensil Set features solid bamboo utensils in a cylindrical bamboo container with drainage holes. Utensils include: solid turner, slotted turner, solid spoon and slotted spoon.  Utensils measure approximately 12.25\" long.  Comes packaged in a poly bag.",
    "upc": "731015230709",
    "specs": {
      "Case Pack Quantity": "24 units",
      "Inner Pack Quantity": "1 units",
      "Case Pack Dimensions": "14.3 \" (L) x12.2 \" (W) x15.5 \"(H)",
      "Case Weight": "16.450008 lb",
      "Case Cube": "1.56 cubic feet",
      "Per Piece Weight": "0.685417"
    },
    "rules": {
      "lot": 8,
      "moq": 8,
      "caseQty": 24,
      "physicalCase": 24,
      "innerPack": 1
    },
    "californiaWarning": true,
    "californiaWarningText": "WARNING: Cancer and Reproductive Harm – www.P65Warnings.ca.gov",
    "newestRank": 96
  },
  {
    "sku": "AM773",
    "title": "Create Basics Yellow Tie Dye Kit",
    "price": 1.1,
    "originalPrice": 0.55,
    "sourceUrl": "https://www.koleimports.com/create-basics-yellow-tie-dye-kit-am773",
    "sourceCheckedAt": "2026-11-04",
    "stock": 23521,
    "badges": [
      "closeout",
      "reduced"
    ],
    "collections": [
      "imports",
      "closeouts",
      "reduced-price"
    ],
    "category": "Closeouts",
    "subcategory": "Reduced Price",
    "images": [
      "images/products/am773-1.webp",
      "images/products/am773-2.webp",
      "images/products/am773-3.webp"
    ],
    "description": "The Create Basics Yellow Tie Dye Kit is perfect for adding a splash of vibrant color to your wardrobe. Ideal for beginners and experienced DIY enthusiasts alike, this kit includes everything you need to tie-dye up to three projects. It comes with a .11 oz (3.1 g) bottle of high-quality yellow dye, rubber bands, protective gloves, and a project guide to inspire your designs. Simply add water to the dye bottle, shake, and you’re ready to create unique patterns on T-shirts, tote bags, and more. The dye is easy to use, mess-free, and perfect for all ages.",
    "upc": "017754320261",
    "specs": {
      "Case Pack Quantity": "48 units",
      "Inner Pack Quantity": "1 units",
      "Case Pack Dimensions": "21.7 \" (L) x11 \" (W) x8.8 \"(H)",
      "Case Weight": "5.199984 lb",
      "Case Cube": "1.22 cubic feet",
      "Per Piece Weight": "0.108333"
    },
    "rules": {
      "lot": 48,
      "moq": 48,
      "caseQty": 48,
      "physicalCase": 48,
      "innerPack": 1
    },
    "californiaWarning": false,
    "californiaWarningText": null,
    "newestRank": 97
  },
  {
    "sku": "AL981",
    "title": "Winifred and Lily 16\"x12\" Grey and Black Two Tone Rectangular Pet Storage Bin with White Bone Embroidery",
    "price": 6.1,
    "originalPrice": 3.05,
    "sourceUrl": "https://www.koleimports.com/winifred-and-lily-17-x13-grey-and-black-two-tone-rectangular-pet-storage-bin-with-white-bone-embriodery-al981",
    "sourceCheckedAt": "2026-11-04",
    "stock": 4176,
    "badges": [
      "closeout",
      "reduced",
      "hot"
    ],
    "collections": [
      "imports",
      "closeouts",
      "reduced-price",
      "best-sellers"
    ],
    "category": "Closeouts",
    "subcategory": "Reduced Price",
    "images": [
      "images/products/al981-1.webp",
      "images/products/al981-2.webp",
      "images/products/al981-3.webp"
    ],
    "description": "Keep your pet's essentials neat and organized with the  Winifred and Lily 16\"x12\" Grey and Black Two Tone Rectangular Pet Storage Bin with White Bone Embroidery, a stylish and functional solution for every pet owner. Designed to hold a variety of items such as dry treats, leashes, collars, toys, grooming supplies, blankets, and pet outfits, this versatile bin helps keep your space clutter-free. Its collapsible design allows for convenient storage when not in use, making it perfect for small spaces or travel. Each bin comes packaged in a protective plastic bag with a UPC label, and includes a charming branded tag. Ideal for any pet-friendly home, this storage bin combines practical organization with a touch of personality.",
    "upc": "731015329670",
    "specs": {
      "Case Pack Quantity": "12 units",
      "Inner Pack Quantity": "1 units",
      "Case Pack Dimensions": "21.2 \" (L) x13.3 \" (W) x13.8 \"(H)",
      "Case Weight": "9.849996 lb",
      "Case Cube": "2.25 cubic feet",
      "Per Piece Weight": "0.820833"
    },
    "rules": {
      "lot": 8,
      "moq": 8,
      "caseQty": 12,
      "physicalCase": 12,
      "innerPack": 1
    },
    "californiaWarning": false,
    "californiaWarningText": null,
    "newestRank": 98
  },
  {
    "sku": "CA974",
    "title": "7.25\" Durable Dog Chew Toy for Aggressive Chewers",
    "price": 6.1,
    "originalPrice": 3.05,
    "sourceUrl": "https://www.koleimports.com/7-25-durable-dog-chew-toy-for-aggressive-chewers-ca974",
    "sourceCheckedAt": "2026-11-04",
    "stock": 4161,
    "badges": [],
    "collections": [
      "imports"
    ],
    "category": "Pet Supplies",
    "subcategory": "Best Sellers",
    "images": [
      "images/products/ca974-1.webp",
      "images/products/ca974-2.webp",
      "images/products/ca974-3.webp"
    ],
    "description": "Keep your dog's teeth healthy and their energy levels high with our 5.50\" x  7.25\" Durable Dog Chew Toy for Aggressive Chewers. This robust chew toy is specially designed to withstand even the toughest bites, making it an ideal choice for dogs who love to gnaw. Crafted from, non-toxic materials, not only does it provide endless entertainment but also promotes dental health by reducing plaque and tartar buildup. The textured surface of the chew toy offers additional stimulation, making playtime more engaging and satisfying for your canine companion. Suitable for medium to large breeds. Comes packaged with a hanging card. The approximate measurements with packaging are 5.50\" x 8.25\".",
    "upc": "731015310746",
    "specs": {
      "Case Pack Quantity": "24 units",
      "Inner Pack Quantity": "1 units",
      "Case Pack Dimensions": "12.3 \" (L) x16.4 \" (W) x9.6 \"(H)",
      "Case Weight": "12.799992 lb",
      "Case Cube": "1.12 cubic feet",
      "Per Piece Weight": "0.533333"
    },
    "rules": {
      "lot": 8,
      "moq": 8,
      "caseQty": 24,
      "physicalCase": 24,
      "innerPack": 1
    },
    "californiaWarning": true,
    "californiaWarningText": "WARNING: Cancer and Reproductive Harm – www.P65Warnings.ca.gov",
    "newestRank": 99
  },
  {
    "sku": "AJ117",
    "title": "Flexible Solar Colorful LED Light Bulb Branches",
    "price": 9.9,
    "originalPrice": 4.95,
    "sourceUrl": "https://www.koleimports.com/flexible-solar-colorful-led-light-bulb-branches-aj117",
    "sourceCheckedAt": "2026-11-04",
    "stock": 2518,
    "badges": [
      "hot"
    ],
    "collections": [
      "imports",
      "best-sellers"
    ],
    "category": "Lawn & Garden",
    "subcategory": "Best Sellers",
    "images": [
      "images/products/aj117-1.webp",
      "images/products/aj117-2.webp",
      "images/products/aj117-3.webp"
    ],
    "description": "The Solar Colorful LED Light Bulb Branches are the perfect addition to your outdoor decor for a touch of enchanting illumination! Crafted with flexibility, these solar-powered light branches effortlessly elevate your garden or patio ambiance. There are 8 branches with LED tips connected together with a metal garden stake. No need for complicated wiring or electricity – simply place them in a sunny spot and watch as they automatically light up at dusk, casting a mesmerizing ambiance throughout the night. Whether you're hosting a backyard party, creating a cozy nook for relaxation, or accentuating your garden landscape, these colorful light bulb branches are sure to impress Two lighting modes: static and blinking. The branch bundle measures 15\" with an attached solar panel. Includes a lightweight metal garden stake attachment that measures 13.5\" long. This whimsical must-have comes packaged inside a color hanging box.",
    "upc": "731015304615",
    "specs": {
      "Case Pack Quantity": "24 units",
      "Inner Pack Quantity": "1 units",
      "Case Pack Dimensions": "13.8 \" (L) x13.9 \" (W) x17.5 \"(H)",
      "Case Weight": "11.350008 lb",
      "Case Cube": "1.94 cubic feet",
      "Per Piece Weight": "0.472917"
    },
    "rules": {
      "lot": 5,
      "moq": 5,
      "caseQty": 24,
      "physicalCase": 24,
      "innerPack": 1
    },
    "californiaWarning": true,
    "californiaWarningText": "WARNING: Cancer and Reproductive Harm – www.P65Warnings.ca.gov",
    "newestRank": 100
  },
  {
    "sku": "AA641",
    "title": "40 Count Strawberry Incense Sticks",
    "price": 0.7,
    "originalPrice": 0.35,
    "sourceUrl": "https://www.koleimports.com/40-count-strawberry-incense-sticks-aa641",
    "sourceCheckedAt": "2026-11-04",
    "stock": 38709,
    "badges": [
      "closeout",
      "reduced"
    ],
    "collections": [
      "imports",
      "closeouts",
      "reduced-price"
    ],
    "category": "Closeouts",
    "subcategory": "Reduced Price",
    "images": [
      "images/products/aa641-1.webp",
      "images/products/aa641-2.webp"
    ],
    "description": "Indulge in the mystical aromas delivered by this exclusive collection of highly fragranced Strawberry incense sticks. This 40-pack of fruit-inspired scents creates a relaxed and zen atmosphere. Use when meditating, doing yoga, ceremonies, journaling, and spiritual cleansing. The sticks burn smoothly and cleanly while providing a calming ambiance in your home or space.  This set comes packaged inside a hanging box with a peekaboo window.",
    "upc": "818326011910",
    "specs": {
      "Case Pack Quantity": "48 units",
      "Inner Pack Quantity": "6 units",
      "Case Pack Dimensions": "13.3 \" (L) x10.8 \" (W) x5.8 \"(H)",
      "Case Weight": "8.199984 lb",
      "Case Cube": "0.48 cubic feet",
      "Per Piece Weight": "0.170833"
    },
    "rules": {
      "lot": 6,
      "moq": 66,
      "caseQty": 66,
      "physicalCase": 48,
      "innerPack": 6
    },
    "californiaWarning": false,
    "californiaWarningText": null,
    "newestRank": 101
  },
  {
    "sku": "MT500",
    "title": "Multi-Purpose Nylon Rope",
    "price": 3.3,
    "originalPrice": 1.65,
    "sourceUrl": "https://www.koleimports.com/multi-purpose-nylon-rope-mt500",
    "sourceCheckedAt": "2026-11-04",
    "stock": 7479,
    "badges": [
      "hot"
    ],
    "collections": [
      "imports",
      "best-sellers"
    ],
    "category": "Rope",
    "subcategory": "Best Sellers",
    "images": [
      "images/products/mt500-1.webp",
      "images/products/mt500-2.webp"
    ],
    "description": "Great for a variety of uses, this Nylon Rope is made with heavy duty plastic and is lightweight yet rugged. Comes with a convenient plastic hanging holder for easy storage. Rope is 50 feet long and 1/8\" thick.  Comes shrink wrapped.  ,Multi-Purpose Nylon Rope,Lazo De Nylon 50 Pies",
    "upc": "731015131334",
    "specs": {
      "Case Pack Quantity": "144 units",
      "Inner Pack Quantity": "24 units",
      "Case Pack Dimensions": "16.3 \" (L) x12.3 \" (W) x15.1 \"(H)",
      "Case Weight": "22.799952 lb",
      "Case Cube": "1.75 cubic feet",
      "Per Piece Weight": "0.158333"
    },
    "rules": {
      "lot": 24,
      "moq": 24,
      "caseQty": 144,
      "physicalCase": 144,
      "innerPack": 24
    },
    "californiaWarning": true,
    "californiaWarningText": "WARNING: Cancer and Reproductive Harm – www.P65Warnings.ca.gov",
    "newestRank": 102
  },
  {
    "sku": "GT109",
    "title": "Reading Glasses Floor Display",
    "price": 2.64,
    "originalPrice": 1.32,
    "sourceUrl": "https://www.koleimports.com/reading-glasses-floor-display-3-gt109",
    "sourceCheckedAt": "2026-11-04",
    "stock": 11154,
    "badges": [],
    "collections": [
      "imports"
    ],
    "category": "Vision Care",
    "subcategory": "Best Sellers",
    "images": [
      "images/products/gt109-1.webp",
      "images/products/gt109-2.webp",
      "images/products/gt109-3.webp"
    ],
    "description": "Great for travel and everyday use, these Assorted Color Reading Glasses feature a slim, lightweight design for easy wear and portability. Ideal for men or women, these glasses are simple in design and are a quick alternative while waiting for prescriptions to be filled. Glasses include power +1.00. +1.25, +1.50, +1.75, +2.00, +2.25, +2.50, +3.00, and +3.50 They are packaged in a polybag. The floor display comes with 360 pieces.",
    "upc": "843653121483",
    "specs": {
      "Case Pack Quantity": "360 units",
      "Inner Pack Quantity": "360 units",
      "Case Pack Dimensions": "20.52 \" (L) x9.8 \" (W) x25.7 \"(H)",
      "Case Weight": "23.34996 lb",
      "Case Cube": "2.99 cubic feet",
      "Per Piece Weight": "0.064861"
    },
    "rules": {
      "lot": 360,
      "moq": 360,
      "caseQty": 360,
      "physicalCase": 360,
      "innerPack": 360
    },
    "californiaWarning": true,
    "californiaWarningText": "WARNING: Cancer and Reproductive Harm – www.P65Warnings.ca.gov",
    "newestRank": 103
  },
  {
    "sku": "DI613",
    "title": "Rubber Ring with Rope Dog Pull Toy",
    "price": 6.4,
    "originalPrice": 3.2,
    "sourceUrl": "https://www.koleimports.com/rubber-ring-with-rope-dog-pull-toy-di613",
    "sourceCheckedAt": "2026-11-04",
    "stock": 3666,
    "badges": [
      "hot"
    ],
    "collections": [
      "imports",
      "best-sellers"
    ],
    "category": "Pet Supplies",
    "subcategory": "Best Sellers",
    "images": [
      "images/products/di613-1.webp",
      "images/products/di613-2.webp"
    ],
    "description": "Duke's Pet Products Squeaky Dog Pull Toy with Rubber Ring is ideal for fetching, tossing, and gnawing. Great for playing with your pet on a daily. The pull toy features a rubber ring with texture connected to a coiled cotton rope and makes squeaky sounds with pressed on. Measures approximately 17.50\" long. Comes in assorted colors: blue and red. It is packaged to a hanging panel with cable straps.",
    "upc": "731015274079",
    "specs": {
      "Case Pack Quantity": "24 units",
      "Inner Pack Quantity": "12 units",
      "Case Pack Dimensions": "15.7 \" (L) x12.1 \" (W) x14.2 \"(H)",
      "Case Weight": "15.9 lb",
      "Case Cube": "1.56 cubic feet",
      "Per Piece Weight": "0.662500"
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
    "newestRank": 104
  },
  {
    "sku": "GR177",
    "title": "Fleece Paw Print Pet Blanket Countertop Display",
    "price": 4.68,
    "originalPrice": 2.34,
    "sourceUrl": "https://www.koleimports.com/fleece-paw-print-pet-blanket-countertop-display-gr177",
    "sourceCheckedAt": "2026-11-04",
    "stock": 5951,
    "badges": [],
    "collections": [
      "imports"
    ],
    "category": "Pet Supplies",
    "subcategory": "Best Sellers",
    "images": [
      "images/products/gr177-1.webp",
      "images/products/gr177-2.webp",
      "images/products/gr177-3.webp"
    ],
    "description": "Ideal for pet carriers and beds, this ultra-soft Fleece Paw Print Pet Blanket is sure to make your furry friend comfortable anywhere. Attractive design features a soft blanket in a dense weave for extra warmth and comfort with a contrasting paw print and double-stitched edges for durability. Blanket measures approximately 30\" x 21.5\". Comes in assorted colors: beige & brown, black & white and blue & white. Comes packaged with a wrap around. Countertop display comes with 48 pieces.",
    "upc": "731015241934",
    "specs": {
      "Case Pack Quantity": "96 units",
      "Inner Pack Quantity": "48 units",
      "Case Pack Dimensions": "17.9 \" (L) x17.7 \" (W) x22 \"(H)",
      "Case Weight": "20.800032 lb",
      "Case Cube": "4.03 cubic feet",
      "Per Piece Weight": "0.216667"
    },
    "rules": {
      "lot": 48,
      "moq": 48,
      "caseQty": 96,
      "physicalCase": 96,
      "innerPack": 48
    },
    "californiaWarning": true,
    "californiaWarningText": "WARNING: Cancer and Reproductive Harm – www.P65Warnings.ca.gov",
    "newestRank": 105
  },
  {
    "sku": "AL621",
    "title": "Weather Zone 39\" Folding Umbrella with Push Open Button in Assorted Prints",
    "price": 7.7,
    "originalPrice": 3.85,
    "sourceUrl": "https://www.koleimports.com/weather-zone-39-folding-umbrella-with-push-open-button-in-assorted-prints-al621",
    "sourceCheckedAt": "2026-11-04",
    "stock": 2933,
    "badges": [
      "closeout",
      "reduced",
      "hot"
    ],
    "collections": [
      "imports",
      "closeouts",
      "reduced-price",
      "best-sellers"
    ],
    "category": "Closeouts",
    "subcategory": "Reduced Price",
    "images": [
      "images/products/al621-1.webp",
      "images/products/al621-2.webp",
      "images/products/al621-3.webp"
    ],
    "description": "Stay dry in style with the Weather Zone 39\" Folding Umbrella, designed for ultimate convenience and reliable protection from the elements. Packaged with a sleek Weather Zone-branded wrap, this compact yet durable umbrella features a push-button automatic open frame, ensuring quick deployment in sudden downpours. The large arc coverage provides ample protection, while the black PP handle offers a comfortable grip for easy carrying. Available in assorted prints, including stylish patterns and classic solids, this umbrella is both functional and fashionable. Perfect for travel, commuting, or daily use, the Weather Zone Folding Umbrella is a must-have accessory for any rainy day!",
    "upc": "082815013000",
    "specs": {
      "Case Pack Quantity": "24 units",
      "Inner Pack Quantity": "6 units",
      "Case Pack Dimensions": "10.5 \" (L) x15.7 \" (W) x7.2 \"(H)",
      "Case Weight": "13.699992 lb",
      "Case Cube": "0.69 cubic feet",
      "Per Piece Weight": "0.570833"
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
    "newestRank": 106
  },
  {
    "sku": "AN646",
    "title": "Sporn Comfort Dog Harness Size XS Assorted Red and Black",
    "price": 3.0,
    "originalPrice": 1.5,
    "sourceUrl": "https://www.koleimports.com/sporn-comfort-dog-harness-size-xs-assorted-red-and-black-an646",
    "sourceCheckedAt": "2026-11-04",
    "stock": 7408,
    "badges": [
      "closeout"
    ],
    "collections": [
      "imports",
      "closeouts"
    ],
    "category": "Closeouts",
    "subcategory": "Best Sellers",
    "images": [
      "images/products/an646-1.webp",
      "images/products/an646-2.webp",
      "images/products/an646-3.webp"
    ],
    "description": "Ensure your small dog stays secure and cozy with the Sporn Comfort Dog Harness Size XS made for toy and extra petite breeds with neck sizes from 15 to 20 centimeters. This lightweight harness delivers maximum comfort with soft neoprene padding and a breathable mesh chest design that offers both durability and flexibility. Perfect for gentle walks and everyday use the harness reduces strain on your dog’s neck while providing a snug yet nonrestrictive fit. Packaged in a clear clamshell with vibrant red and green accents the retail ready design includes product details a size chart and a photo of a pup wearing the harness. Available in assorted red and black this harness also comes with a lifetime guarantee for added peace of mind.",
    "upc": "708443101246",
    "specs": {
      "Case Pack Quantity": "12 units",
      "Inner Pack Quantity": "3 units",
      "Case Pack Dimensions": "13.4 \" (L) x8.4 \" (W) x6.7 \"(H)",
      "Case Weight": "2.499996 lb",
      "Case Cube": "0.44 cubic feet",
      "Per Piece Weight": "0.208333"
    },
    "rules": {
      "lot": 3,
      "moq": 15,
      "caseQty": 15,
      "physicalCase": 12,
      "innerPack": 3
    },
    "californiaWarning": false,
    "californiaWarningText": null,
    "newestRank": 107
  },
  {
    "sku": "HB198",
    "title": "Therapeutic Gel Beads Neck Wrap",
    "price": 7.7,
    "originalPrice": 3.85,
    "sourceUrl": "https://www.koleimports.com/therapeutic-gel-beads-neck-wrap-hb198",
    "sourceCheckedAt": "2026-11-04",
    "stock": 2841,
    "badges": [],
    "collections": [
      "imports"
    ],
    "category": "Health Care",
    "subcategory": "Best Sellers",
    "images": [
      "images/products/hb198-1.webp",
      "images/products/hb198-2.webp"
    ],
    "description": "Relieve tension in shoulder and neck muscles with this Therapeutic Gel Beads Neck Wrap featuring a flexible, gel bead-filled design with an adjustable strap for a perfect fit.  Wrap can be used for therapeutic hot or cold treatment.  Comes packaged in a hanging box. Box measures approximately 6.25\" x 2.5\" x 6.625\".",
    "upc": "731015249473",
    "specs": {
      "Case Pack Quantity": "12 units",
      "Inner Pack Quantity": "1 units",
      "Case Pack Dimensions": "13.2 \" (L) x10.5 \" (W) x7.9 \"(H)",
      "Case Weight": "9 lb",
      "Case Cube": "0.63 cubic feet",
      "Per Piece Weight": "0.750000"
    },
    "rules": {
      "lot": 7,
      "moq": 7,
      "caseQty": 12,
      "physicalCase": 12,
      "innerPack": 1
    },
    "californiaWarning": true,
    "californiaWarningText": "WARNING: Cancer and Reproductive Harm – www.P65Warnings.ca.gov",
    "newestRank": 108
  },
  {
    "sku": "GH886",
    "title": "Two-Direction Remote Control Race Car with Control",
    "price": 12.1,
    "originalPrice": 6.05,
    "sourceUrl": "https://www.koleimports.com/two-direction-remote-control-race-car-with-control-gh886",
    "sourceCheckedAt": "2026-11-04",
    "stock": 1766,
    "badges": [],
    "collections": [
      "imports"
    ],
    "category": "Toys",
    "subcategory": "Best Sellers",
    "images": [
      "images/products/gh886-1.webp",
      "images/products/gh886-2.webp",
      "images/products/gh886-3.webp"
    ],
    "description": "This Two-Direction Remote Control Race Car with Control will provide hours of fun. Create your own racetracks or challenge friends to offroad races! Set includes 1 red sports car and 1 string wheel remote control with an antenna. Use the handheld remote to move your racecar forward, backward, or stop. Perfect for indoor or outdoor use. Makes a great gift during the holidays or birthdays. Requires 2 AA batteries for the remote and 3 AAA batteries for the car (not included). This interactive set comes inside a shelf box with a clear window measuring approximately 8.625\"x4\"x3.9\".",
    "upc": "731015289349",
    "specs": {
      "Case Pack Quantity": "48 units",
      "Inner Pack Quantity": "24 units",
      "Case Pack Dimensions": "33.6 \" (L) x10 \" (W) x26 \"(H)",
      "Case Weight": "24.099984 lb",
      "Case Cube": "5.06 cubic feet",
      "Per Piece Weight": "0.502083"
    },
    "rules": {
      "lot": 24,
      "moq": 24,
      "caseQty": 48,
      "physicalCase": 48,
      "innerPack": 24
    },
    "californiaWarning": false,
    "californiaWarningText": null,
    "newestRank": 109
  },
  {
    "sku": "DA592",
    "title": "Silicone Kitchen Sink Splash Guard",
    "price": 4.1,
    "originalPrice": 2.05,
    "sourceUrl": "https://www.koleimports.com/16-silicone-kitchen-sink-splash-guard-da592",
    "sourceCheckedAt": "2026-11-04",
    "stock": 5164,
    "badges": [],
    "collections": [
      "imports"
    ],
    "category": "Kitchen & Dining",
    "subcategory": "Best Sellers",
    "images": [
      "images/products/da592-1.webp",
      "images/products/da592-2.webp",
      "images/products/da592-3.webp"
    ],
    "description": "Designed to keep the sink area clean and organized, this silicone splash guard fits snugly around taps to provide a space for storing and drying sink essentials. It drains excess water directly into the sink, preventing moisture buildup on countertops. Made from durable and easy-to-clean silicone, this mat offers a practical solution for maintaining a tidy kitchen or bathroom sink area. The splash guard measures 14.56\" x .31\" x 5.62\" and comes packaged in a hanging card. The approximate measurements with packaging are 5.75\" x 9\".",
    "upc": "731015316083",
    "specs": {
      "Case Pack Quantity": "96 units",
      "Inner Pack Quantity": "24 units",
      "Case Pack Dimensions": "18.4 \" (L) x16.9 \" (W) x12.9 \"(H)",
      "Case Weight": "25.449984 lb",
      "Case Cube": "2.32 cubic feet",
      "Per Piece Weight": "0.265104"
    },
    "rules": {
      "lot": 24,
      "moq": 24,
      "caseQty": 96,
      "physicalCase": 96,
      "innerPack": 24
    },
    "californiaWarning": true,
    "californiaWarningText": "WARNING: Cancer and Reproductive Harm – www.P65Warnings.ca.gov",
    "newestRank": 110
  },
  {
    "sku": "CA883",
    "title": "Battery-Operated Waterfall Fountain with Circular Design Stones Included",
    "price": 13.2,
    "originalPrice": 6.6,
    "sourceUrl": "https://www.koleimports.com/battery-operated-waterfall-fountain-with-circular-design-stones-included-ca883",
    "sourceCheckedAt": "2026-11-04",
    "stock": 1568,
    "badges": [],
    "collections": [
      "imports"
    ],
    "category": "Home Decor",
    "subcategory": "Best Sellers",
    "images": [
      "images/products/ca883-1.webp",
      "images/products/ca883-2.webp"
    ],
    "description": "This fountain features a circular design adorned with natural stones, creating a captivating visual appeal. The soothing sound of cascading water creates a serene atmosphere, making it perfect for relaxation, meditation, or simply adding a touch of tranquility to the home or garden. Powered by batteries, this fountain offers the convenience of cord-free operation, allowing to place it anywhere desired without the hassle of cords or electrical outlets. Simply fill the reservoir with water, switch on the fountain, and watch as the water gracefully flows down the stones, creating a mesmerizing display that soothes the senses. This battery-operated fountain is easy to transport and set up, making it ideal for both indoor and outdoor use. Whether looking to create a peaceful retreat at home or add a touch of Zen to your garden, this fountain is sure to delight your senses and bring a sense of serenity to your surroundings.",
    "upc": "731015306961",
    "specs": {
      "Case Pack Quantity": "24 units",
      "Inner Pack Quantity": "1 units",
      "Case Pack Dimensions": "20 \" (L) x13.7 \" (W) x16.2 \"(H)",
      "Case Weight": "20.449992 lb",
      "Case Cube": "2.57 cubic feet",
      "Per Piece Weight": "0.852083"
    },
    "rules": {
      "lot": 4,
      "moq": 4,
      "caseQty": 24,
      "physicalCase": 24,
      "innerPack": 1
    },
    "californiaWarning": true,
    "californiaWarningText": "WARNING: Cancer and Reproductive Harm – www.P65Warnings.ca.gov",
    "newestRank": 111
  },
  {
    "sku": "CA996",
    "title": "2-in-1 Bean Bag Toss and Ring Toss Desktop Drinking Game",
    "price": 7.7,
    "originalPrice": 3.85,
    "sourceUrl": "https://www.koleimports.com/2-in-1-bean-bag-toss-and-ring-toss-desktop-game-ca996",
    "sourceCheckedAt": "2026-11-04",
    "stock": 2626,
    "badges": [],
    "collections": [
      "imports"
    ],
    "category": "Toys",
    "subcategory": "Games",
    "images": [
      "images/products/ca996-1.webp",
      "images/products/ca996-2.webp",
      "images/products/ca996-3.webp"
    ],
    "description": "Elevate the weekend gatherings with this 2-in-1 Bean Bag Toss and Ring Toss Desktop Drinking Game! This compact and versatile game set features both bean bag and ring toss games, providing hours of entertainment for family and friends. The board measures 6\" x .75” x 11\" and comes in two color teams, Red and Blue, adding an element of friendly competition to your festivities. Complete with 4 bean bags for the cornhole board and 4 toss rings, this game is perfect for indoor or outdoor use. Rings are 6.5” in diameter and the sturdy Bean bags are 1.75” x 1.75”.  Foldable metal stand stands at 3.75” T. Whether hosting a backyard barbecue, picnic, or game night, this 2-in-1 desktop drinking game is sure to be a hit with players of all ages. The game comes in a colored box. The box measures 6” x 1.5” x 11.5”.",
    "upc": "731015311200",
    "specs": {
      "Case Pack Quantity": "24 units",
      "Inner Pack Quantity": "1 units",
      "Case Pack Dimensions": "20 \" (L) x12.4 \" (W) x14.18 \"(H)",
      "Case Weight": "25.900008 lb",
      "Case Cube": "2.04 cubic feet",
      "Per Piece Weight": "1.079167"
    },
    "rules": {
      "lot": 7,
      "moq": 7,
      "caseQty": 24,
      "physicalCase": 24,
      "innerPack": 1
    },
    "californiaWarning": true,
    "californiaWarningText": "WARNING: Cancer and Reproductive Harm – www.P65Warnings.ca.gov",
    "newestRank": 112
  },
  {
    "sku": "OL996",
    "title": "Dog Waste Refill Bags",
    "price": 6.6,
    "originalPrice": 3.3,
    "sourceUrl": "https://www.koleimports.com/dog-waste-refill-bags-ol996",
    "sourceCheckedAt": "2026-11-04",
    "stock": 3136,
    "badges": [],
    "collections": [
      "imports"
    ],
    "category": "Pet Supplies",
    "subcategory": "Best Sellers",
    "images": [
      "images/products/ol996-1.webp",
      "images/products/ol996-2.webp",
      "images/products/ol996-3.webp"
    ],
    "description": "Stock up for the season with these Dog Waste Refill Bags featuring small durable plastic waste bags on convenient little rolls.  Bags fit most dog waste bag dispensers and come in red, green and blue.  Set comes with 12 rolls with 15 bags each for a total of 180 bags.  Comes packaged in a poly bag with a header card.",
    "upc": "731015241392",
    "specs": {
      "Case Pack Quantity": "48 units",
      "Inner Pack Quantity": "24 units",
      "Case Pack Dimensions": "18.9 \" (L) x9.4 \" (W) x10.8 \"(H)",
      "Case Weight": "22.100016 lb",
      "Case Cube": "1.11 cubic feet",
      "Per Piece Weight": "0.460417"
    },
    "rules": {
      "lot": 24,
      "moq": 24,
      "caseQty": 48,
      "physicalCase": 48,
      "innerPack": 24
    },
    "californiaWarning": true,
    "californiaWarningText": "WARNING: Cancer and Reproductive Harm – www.P65Warnings.ca.gov",
    "newestRank": 113
  },
  {
    "sku": "OL930",
    "title": "Mesh Back Support with Massage Pegs",
    "price": 5.5,
    "originalPrice": 2.75,
    "sourceUrl": "https://www.koleimports.com/mesh-back-support-with-massage-pegs-ol930",
    "sourceCheckedAt": "2026-11-04",
    "stock": 3690,
    "badges": [],
    "collections": [
      "imports"
    ],
    "category": "Health Care",
    "subcategory": "Best Sellers",
    "images": [
      "images/products/ol930-1.webp",
      "images/products/ol930-2.webp",
      "images/products/ol930-3.webp"
    ],
    "description": "Ideal for home, office or auto, this Mesh Back Support features a lightweight design with cool, breathable mesh and embedded massage pegs.  Designed to easily attach to any chair, it gently conforms to your body's contours for uniform support.  Comes packaged in a poly bag with a header card.",
    "upc": "731015233458",
    "specs": {
      "Case Pack Quantity": "24 units",
      "Inner Pack Quantity": "1 units",
      "Case Pack Dimensions": "15.5 \" (L) x16.1 \" (W) x11.8 \"(H)",
      "Case Weight": "9.349992 lb",
      "Case Cube": "1.70 cubic feet",
      "Per Piece Weight": "0.389583"
    },
    "rules": {
      "lot": 9,
      "moq": 9,
      "caseQty": 24,
      "physicalCase": 24,
      "innerPack": 1
    },
    "californiaWarning": true,
    "californiaWarningText": "WARNING: Cancer and Reproductive Harm – www.P65Warnings.ca.gov",
    "newestRank": 114
  },
  {
    "sku": "HC499",
    "title": "3 Pack Kitchen Cleaning Brush Kit",
    "price": 8.6,
    "originalPrice": 4.3,
    "sourceUrl": "https://www.koleimports.com/3-pack-cleaning-kit-hc499",
    "sourceCheckedAt": "2026-11-04",
    "stock": 2338,
    "badges": [],
    "collections": [
      "imports"
    ],
    "category": "Household Supplies",
    "subcategory": "Best Sellers",
    "images": [
      "images/products/hc499-1.webp",
      "images/products/hc499-2.webp",
      "images/products/hc499-3.webp"
    ],
    "description": "This versatile 3-in-1 Kitchen Cleaning Brush Set combines a bottle brush, round dish brush, and rectangular brush into one convenient cleaning tool. Designed with a secure click-system, each interchangeable brush head locks easily into the handle, allowing quick transitions between different cleaning tasks. Ideal for bottles, dishes, corners, and flat surfaces, this multi-use set helps tackle a variety of kitchen cleaning needs while saving storage space. The set includes three brush heads and one handle.\r\nPackaged on a peg-ready hanging tie card, this item is well suited for retail display. Includes: 1 handle 3 interchangeable brush heads (round, bottle, rectangular) Brush Specifications: Round Brush Bristle diameter: 2.75\" Plastic base diameter: 2.25\" Bristle area: 2.75\" diameter Overall assembled length: 9\" Bottle Brush Bristle length: 3.25\" Bristle diameter: 3\" Overall assembled length: 12.5\" Rectangular Brush Plastic base (where bristles attach): 1.65\" x 3.5\" Bristle area: 1.75\" x 3.5\" Overall assembled length: 10\" Packaging: Hanging tie card (peg-ready) Overall packaging size: 10.6\" x 1.6\"",
    "upc": "731015283545",
    "specs": {
      "Case Pack Quantity": "12 units",
      "Inner Pack Quantity": "1 units",
      "Case Pack Dimensions": "18.1 \" (L) x10 \" (W) x13.9 \"(H)",
      "Case Weight": "7.2 lb",
      "Case Cube": "1.46 cubic feet",
      "Per Piece Weight": "0.600000"
    },
    "rules": {
      "lot": 6,
      "moq": 6,
      "caseQty": 12,
      "physicalCase": 12,
      "innerPack": 1
    },
    "californiaWarning": true,
    "californiaWarningText": "WARNING: Cancer and Reproductive Harm – www.P65Warnings.ca.gov",
    "newestRank": 115
  },
  {
    "sku": "MT793",
    "title": "27 Piece Ratcheting Screwdriver Bit & Socket Set",
    "price": 11.0,
    "originalPrice": 5.5,
    "sourceUrl": "https://www.koleimports.com/27-piece-ratcheting-screwdriver-bit-socket-set-mt793",
    "sourceCheckedAt": "2026-11-04",
    "stock": 1831,
    "badges": [],
    "collections": [
      "imports"
    ],
    "category": "Tools & Hardware",
    "subcategory": "Best Sellers",
    "images": [
      "images/products/mt793-1.webp",
      "images/products/mt793-2.webp",
      "images/products/mt793-3.webp"
    ],
    "description": "An essential and versatile toolset, this 27-Piece Ratchet Screwdriver Bit and Socket Set is great to have around the house or workshop. The high-grade alloy steel set includes 1 precision screwdriver, 19 screwdriver bits, 6 socket bits, and 1 socket adapter. A must-have for every tool kit, garage or mechanic shop. The bits fit securely into the driver so it stays in place while you work.  The ergonomic grip handles provide increased torque. Comes packaged in a hanging clamshell.",
    "upc": "731015274888",
    "specs": {
      "Case Pack Quantity": "24 units",
      "Inner Pack Quantity": "1 units",
      "Case Pack Dimensions": "12.2 \" (L) x17.9 \" (W) x8.5 \"(H)",
      "Case Weight": "18.949992 lb",
      "Case Cube": "1.07 cubic feet",
      "Per Piece Weight": "0.789583"
    },
    "rules": {
      "lot": 5,
      "moq": 5,
      "caseQty": 24,
      "physicalCase": 24,
      "innerPack": 1
    },
    "californiaWarning": true,
    "californiaWarningText": "WARNING: Cancer and Reproductive Harm – www.P65Warnings.ca.gov",
    "newestRank": 116
  },
  {
    "sku": "CA639",
    "title": "LED Color-Changing Water-Free Aroma Diffuser",
    "price": 8.8,
    "originalPrice": 4.4,
    "sourceUrl": "https://www.koleimports.com/led-color-changing-water-free-aroma-diffuser-ca639",
    "sourceCheckedAt": "2026-11-04",
    "stock": 2270,
    "badges": [],
    "collections": [
      "imports"
    ],
    "category": "Home Decor",
    "subcategory": "Best Sellers",
    "images": [
      "images/products/ca639-1.webp",
      "images/products/ca639-2.webp",
      "images/products/ca639-3.webp"
    ],
    "description": "The LED Color-Changing Water-Free Aroma Diffuser offers a convenient and mess-free way to enjoy aromatherapy. Designed with a compact 4.25\" in dia by 4\" tall frame and powered via USB, this diffuser fits easily in any room or workspace. It uses a water-free system; just apply a few drops of essential oil to the diffuser pad to release long-lasting fragrance.  It comes with three replaceable pads and a USB cable for immediate use. The built-in LED feature transitions between 6 colors, providing a calming and visually appealing display. Ideal for creating a relaxing atmosphere in bedrooms, offices, or small spaces. Each unit comes packaged in a color shelf box. The color box measures 4.5\" x 4.5\" x 4.5\".",
    "upc": "731015306831",
    "specs": {
      "Case Pack Quantity": "24 units",
      "Inner Pack Quantity": "1 units",
      "Case Pack Dimensions": "18.8 \" (L) x14.4 \" (W) x9.9 \"(H)",
      "Case Weight": "10.099992 lb",
      "Case Cube": "1.55 cubic feet",
      "Per Piece Weight": "0.420833"
    },
    "rules": {
      "lot": 6,
      "moq": 6,
      "caseQty": 24,
      "physicalCase": 24,
      "innerPack": 1
    },
    "californiaWarning": true,
    "californiaWarningText": "WARNING: Cancer and Reproductive Harm – www.P65Warnings.ca.gov",
    "newestRank": 117
  },
  {
    "sku": "DA591",
    "title": "8.1\" Silicone Collapsible Air Fryer Basket",
    "price": 6.6,
    "originalPrice": 3.3,
    "sourceUrl": "https://www.koleimports.com/8-1-silicone-collapsible-air-fryer-basket-da591",
    "sourceCheckedAt": "2026-11-04",
    "stock": 3024,
    "badges": [],
    "collections": [
      "imports"
    ],
    "category": "Kitchen & Dining",
    "subcategory": "Best Sellers",
    "images": [
      "images/products/da591-1.webp",
      "images/products/da591-2.webp",
      "images/products/da591-3.webp"
    ],
    "description": "Designed for efficient cooking, this heat-resistant silicone air fryer basket is 2\" deep and collapses for easy storage. Suitable for use in the oven, microwave, instant pot, and refrigerator, it is made from BPA-free, non-toxic silicone and can withstand temperatures up to 400 degrees Fahrenheit. Dishwasher safe for hassle-free cleaning. Comes packaged in a hanging box. The Package measures approximately 8.25\" x .75\" x 9.8\".",
    "upc": "731015316076",
    "specs": {
      "Case Pack Quantity": "48 units",
      "Inner Pack Quantity": "24 units",
      "Case Pack Dimensions": "11.3 \" (L) x17.7 \" (W) x19.6 \"(H)",
      "Case Weight": "19.400016 lb",
      "Case Cube": "2.27 cubic feet",
      "Per Piece Weight": "0.404167"
    },
    "rules": {
      "lot": 24,
      "moq": 24,
      "caseQty": 48,
      "physicalCase": 48,
      "innerPack": 24
    },
    "californiaWarning": true,
    "californiaWarningText": "WARNING: Cancer and Reproductive Harm – www.P65Warnings.ca.gov",
    "newestRank": 118
  },
  {
    "sku": "AG927",
    "title": "PRIMO Airpod Pro Protective Case with Clip in Grey",
    "price": 1.1,
    "originalPrice": 0.55,
    "sourceUrl": "https://www.koleimports.com/primo-airpod-pro-protective-case-with-clip-in-grey-ag927",
    "sourceCheckedAt": "2026-11-04",
    "stock": 18508,
    "badges": [
      "closeout",
      "reduced"
    ],
    "collections": [
      "imports",
      "closeouts",
      "reduced-price"
    ],
    "category": "Closeouts",
    "subcategory": "Reduced Price",
    "images": [
      "images/products/ag927-1.webp",
      "images/products/ag927-2.webp",
      "images/products/ag927-3.webp"
    ],
    "description": "Protect your AirPods Pro in style with the PRIMO Protective Case in Grey, designed to keep your precious earbuds safe from scratches, drops, and everyday wear and tear. Crafted with precision and durability in mind, this sleek case features a clip for convenient attachment to your bag, belt loop, or keys, ensuring your AirPods Pro are always within reach. With its snug fit and precise cutouts, you can access your AirPods Pro charging port and pairing button with ease, while the sleek grey design adds a touch of sophistication to your accessory collection. Say goodbye to worries about damaging your AirPods Pro and hello to peace of mind with the PRIMO Protective Case – the perfect blend of style and protection for your favorite earbuds.",
    "upc": "705954205197",
    "specs": {
      "Case Pack Quantity": "48 units",
      "Inner Pack Quantity": "4 units",
      "Case Pack Dimensions": "11.7 \" (L) x15.8 \" (W) x11.5 \"(H)",
      "Case Weight": "9.15 lb",
      "Case Cube": "1.23 cubic feet",
      "Per Piece Weight": "0.190625"
    },
    "rules": {
      "lot": 4,
      "moq": 40,
      "caseQty": 48,
      "physicalCase": 48,
      "innerPack": 4
    },
    "californiaWarning": false,
    "californiaWarningText": null,
    "newestRank": 119
  },
  {
    "sku": "HF059",
    "title": "Magic Static Duster",
    "price": 2.2,
    "originalPrice": 1.1,
    "sourceUrl": "https://www.koleimports.com/magic-static-duster-hf059",
    "sourceCheckedAt": "2026-11-04",
    "stock": 9035,
    "badges": [],
    "collections": [
      "imports"
    ],
    "category": "Household Supplies",
    "subcategory": "Best Sellers",
    "images": [
      "images/products/hf059-1.webp",
      "images/products/hf059-2.webp"
    ],
    "description": "Great for cleaning hard-to-reach places, this Magic Static Duster makes dusting not only fun but also highly productive. No longer will you need those old-fashioned dusting rags or dusting spray. Simply use the duster for a quick and easy clean. Measures approximately 23 3/4\" long with a 12 1/2\" long dusting area. Comes packaged with a hang tag.,Magic Static Duster,Plumero Grande",
    "upc": "731015013326",
    "specs": {
      "Case Pack Quantity": "144 units",
      "Inner Pack Quantity": "48 units",
      "Case Pack Dimensions": "12.2 \" (L) x9 \" (W) x25.4 \"(H)",
      "Case Weight": "23.699952 lb",
      "Case Cube": "1.61 cubic feet",
      "Per Piece Weight": "0.164583"
    },
    "rules": {
      "lot": 48,
      "moq": 48,
      "caseQty": 144,
      "physicalCase": 144,
      "innerPack": 48
    },
    "californiaWarning": true,
    "californiaWarningText": "WARNING: Cancer and Reproductive Harm – www.P65Warnings.ca.gov",
    "newestRank": 120
  },
  {
    "sku": "AD117",
    "title": "2 Pack Beauty Eyebrow Tweezers with Textured Grip",
    "price": 1.1,
    "originalPrice": 0.55,
    "sourceUrl": "https://www.koleimports.com/2-pack-beauty-eyebrow-tweezers-with-textured-grip-ad117",
    "sourceCheckedAt": "2026-11-04",
    "stock": 18319,
    "badges": [
      "closeout",
      "reduced"
    ],
    "collections": [
      "imports",
      "closeouts",
      "reduced-price"
    ],
    "category": "Closeouts",
    "subcategory": "Reduced Price",
    "images": [
      "images/products/ad117-1.webp",
      "images/products/ad117-2.webp"
    ],
    "description": "Introducing the 2-Pack Beauty Eyebrow Tweezers, essential tools for achieving impeccably groomed brows with ease. Designed for precision and comfort, these tweezers feature a textured grip for enhanced control. Ideal for eyebrow shaping, they also excel in various beauty tasks such as precise hair removal and effortless false eyelash application. With the convenience of a 2-pack, keep one pair at home and take the other on the go. Their compact size and durable construction ensure they're perfect for travel, ensuring you're always prepared to refine your beauty routine. This 2-pack beauty essential comes packaged inside a hanging color card. The hanging color card measures 2.75\" x 6.75\".",
    "upc": "731015302444",
    "specs": {
      "Case Pack Quantity": "288 units",
      "Inner Pack Quantity": "24 units",
      "Case Pack Dimensions": "10.3 \" (L) x11.5 \" (W) x18.1 \"(H)",
      "Case Weight": "16.449984 lb",
      "Case Cube": "1.24 cubic feet",
      "Per Piece Weight": "0.057118"
    },
    "rules": {
      "lot": 24,
      "moq": 48,
      "caseQty": 288,
      "physicalCase": 288,
      "innerPack": 24
    },
    "californiaWarning": true,
    "californiaWarningText": "WARNING: Cancer and Reproductive Harm – www.P65Warnings.ca.gov",
    "newestRank": 121
  },
  {
    "sku": "DI737",
    "title": "Battery-Operated Automatic Pet Nail Grinder File",
    "price": 6.6,
    "originalPrice": 3.3,
    "sourceUrl": "https://www.koleimports.com/battery-operated-automatic-pet-nail-grinder-file-di737",
    "sourceCheckedAt": "2026-11-04",
    "stock": 2952,
    "badges": [],
    "collections": [
      "imports"
    ],
    "category": "Pet Supplies",
    "subcategory": "Best Sellers",
    "images": [
      "images/products/di737-1.webp",
      "images/products/di737-2.webp"
    ],
    "description": "Keep your pet's nails groomed with the Battery-Operated Automatic Pet Nail Grinder File. The filing wheel has fine tooth sandpaper and painlessly grinds their nails down. A perfect and convenient tool to keep your pet's nails groomed to prevent scratches on your floor, carpet, furniture or clothes. Keeping your pet's nails trimmed prevents painful ingrown nails. Includes 3 replaceable filing wheels for plenty of grooming! Uses 2 AA batteries (not included). Great for vets, professional groomers, and home use. Comes packaged in a clear hanging clamshell package.",
    "upc": "731015288991",
    "specs": {
      "Case Pack Quantity": "24 units",
      "Inner Pack Quantity": "12 units",
      "Case Pack Dimensions": "10.5 \" (L) x9.9 \" (W) x12.6 \"(H)",
      "Case Weight": "5.55 lb",
      "Case Cube": "0.76 cubic feet",
      "Per Piece Weight": "0.231250"
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
    "newestRank": 122
  },
  {
    "sku": "AN688",
    "title": "Personna Heavy Duty Carpet Knife with 5 Blades",
    "price": 3.3,
    "originalPrice": 1.65,
    "sourceUrl": "https://www.koleimports.com/personna-heavy-duty-carpet-knife-with-5-blades-an688",
    "sourceCheckedAt": "2026-11-04",
    "stock": 5813,
    "badges": [
      "closeout",
      "reduced"
    ],
    "collections": [
      "imports",
      "closeouts",
      "reduced-price"
    ],
    "category": "Closeouts",
    "subcategory": "Reduced Price",
    "images": [
      "images/products/an688-1.webp",
      "images/products/an688-2.webp",
      "images/products/an688-3.webp"
    ],
    "description": "Take on flooring projects with precision and strength using the Personna Heavy Duty Carpet Knife, complete with 5 replacement blades for long-lasting performance. Designed for professionals and DIYers alike, this ergonomic knife features a durable, contoured metal handle for a secure grip and maximum control when cutting through carpet, linoleum, and other tough materials. The razor-sharp blades are securely fastened for safe, accurate cuts, while the built-in storage compartment keeps extra blades conveniently on hand. Packaged in a clear blister pack with trilingual labeling (English, French, Spanish), the front highlights key features like “Heavy Duty” and includes a diagram for easy blade replacement. Whether you're installing flooring or tackling renovation tasks, the Personna Carpet Knife delivers the reliability and power you need.",
    "upc": "024500614062",
    "specs": {
      "Case Pack Quantity": "36 units",
      "Inner Pack Quantity": "6 units",
      "Case Pack Dimensions": "11.2 \" (L) x12.1 \" (W) x12.5 \"(H)",
      "Case Weight": "7.850016 lb",
      "Case Cube": "0.98 cubic feet",
      "Per Piece Weight": "0.218056"
    },
    "rules": {
      "lot": 6,
      "moq": 18,
      "caseQty": 36,
      "physicalCase": 36,
      "innerPack": 6
    },
    "californiaWarning": false,
    "californiaWarningText": null,
    "newestRank": 123
  },
  {
    "sku": "AJ106",
    "title": "125 Volt 6-Outlet Grounded Wall Adapter",
    "price": 7.7,
    "originalPrice": 3.85,
    "sourceUrl": "https://www.koleimports.com/125-volt-6-outlet-grounded-wall-adapter-aj106",
    "sourceCheckedAt": "2026-11-04",
    "stock": 2486,
    "badges": [],
    "collections": [
      "imports"
    ],
    "category": "Electrical Connectors",
    "subcategory": "Best Sellers",
    "images": [
      "images/products/aj106-1.webp",
      "images/products/aj106-2.webp",
      "images/products/aj106-3.webp"
    ],
    "description": "The 125-volt Grounded Wall Adapter transforms a single electrical outlet into six. Ideal for homes, offices, and workspaces, this adapter provides the versatility to power multiple devices simultaneously.  The compact and streamlined design allows for maximum space utilization. No more struggling with bulky power strips – plug in and enjoy expanded power options without sacrificing valuable space.  Plug it into your existing wall outlet, and you're ready to power up multiple devices instantly. Comes packaged inside a hanging blister card.",
    "upc": "731015304523",
    "specs": {
      "Case Pack Quantity": "72 units",
      "Inner Pack Quantity": "24 units",
      "Case Pack Dimensions": "17.2 \" (L) x12.9 \" (W) x18.2 \"(H)",
      "Case Weight": "21.250008 lb",
      "Case Cube": "2.34 cubic feet",
      "Per Piece Weight": "0.295139"
    },
    "rules": {
      "lot": 24,
      "moq": 24,
      "caseQty": 72,
      "physicalCase": 72,
      "innerPack": 24
    },
    "californiaWarning": true,
    "californiaWarningText": "WARNING: Cancer and Reproductive Harm – www.P65Warnings.ca.gov",
    "newestRank": 124
  },
  {
    "sku": "OL601",
    "title": "Four Paw Pet Bowl Mat",
    "price": 7.7,
    "originalPrice": 3.85,
    "sourceUrl": "https://www.koleimports.com/four-paw-pet-bowl-mat-ol601",
    "sourceCheckedAt": "2026-11-04",
    "stock": 2413,
    "badges": [],
    "collections": [
      "imports"
    ],
    "category": "Pet Supplies",
    "subcategory": "Best Sellers",
    "images": [
      "images/products/ol601-1.webp",
      "images/products/ol601-2.webp"
    ],
    "description": "Eliminate clean-up time by containing your pet's food and water mess with this Four Paw Pet Bowl Mat featuring a cushioned plastic mat in an oval shape with a paw at each corner. Unique surface traps messes - simply shake the mat to clean. Measures approximately 23\" x 17\". Comes packaged with a hanging panel.",
    "upc": "731015240395",
    "specs": {
      "Case Pack Quantity": "24 units",
      "Inner Pack Quantity": "1 units",
      "Case Pack Dimensions": "23.7 \" (L) x16.1 \" (W) x6.6 \"(H)",
      "Case Weight": "26.85 lb",
      "Case Cube": "1.46 cubic feet",
      "Per Piece Weight": "1.118750"
    },
    "rules": {
      "lot": 7,
      "moq": 7,
      "caseQty": 24,
      "physicalCase": 24,
      "innerPack": 1
    },
    "californiaWarning": true,
    "californiaWarningText": "WARNING: Cancer and Reproductive Harm – www.P65Warnings.ca.gov",
    "newestRank": 125
  }
];

export const IMPORTED_NEW_ARRIVALS = PRODUCTS.filter(p => p.collections.includes("new-arrivals"));

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
