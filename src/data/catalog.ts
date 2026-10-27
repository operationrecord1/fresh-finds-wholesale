/**
 * Artisan Mart catalog — SOURCE-OBSERVED ONLY.
 * Every value below was read from the Oct 22 2026 research report or the
 * user-supplied reference screenshots. `null` means the value was not
 * observed and must not be guessed. Product photos are NOT included: reuse
 * of the supplier's images has not been authorized. Replace this module with
 * the authorized feed / Firebase source later; keep the Product shape.
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

export const PRODUCTS: Product[] = [
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
