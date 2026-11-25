import { CATEGORIES, COLLECTIONS, PRICE_BANDS, PRODUCTS, type CollectionSlug, type Product } from "@/data/catalog";
import { configureDemoCoupon } from "@/lib/demo-coupon";

type CatalogRow = {
 sku: string; title: string; price: number | null; original_price: number | null;
 stock: number | null; category: string | null; subcategory: string | null;
 description: string | null; upc: string | null;
 badges: Product["badges"]; collections: Product["collections"];
 images: string[]; specs: Record<string,string>;
 purchase_rules: Product["rules"]; source_record: Product;
};
type CollectionRow = { slug: CollectionSlug; title: string; banner: string; default_sort: string };
type SettingRow = { key: string; value: unknown };
type DemoCoupon = { code: string; message: string };
const originalOrder = new Map(PRODUCTS.map((p, i) => [p.sku, i]));
const initialImages = new Set(PRODUCTS.flatMap(p => p.images));

let inflight: Promise<void> | null = null;
let lastLoaded = 0;

function validateProduct(row: CatalogRow): boolean {
 return typeof row.sku === "string" && typeof row.title === "string"
  && row.source_record?.sku === row.sku
  && Array.isArray(row.images) && Array.isArray(row.badges)
  && Array.isArray(row.collections) && (row.price === null || (typeof row.price === "number" && row.price >= 0))
  && (row.stock === null || (Number.isSafeInteger(row.stock) && row.stock >= 0));
}

export async function loadAuthoritativeCatalog(force = false) {
 // Unit tests retain their source-observed static catalog fixtures, not network dependencies.
 if (import.meta.env.MODE === "test" || typeof window === "undefined") return;
 if (!force && Date.now() - lastLoaded < 5000) return;
 if (inflight) return inflight;

 const api = import.meta.env['VITE_ARTISAN_SUPABASE_URL'] as string | undefined;
 const key = import.meta.env['VITE_ARTISAN_SUPABASE_PUBLISHABLE_KEY'] as string | undefined;
 if (!api || !key || !api.startsWith("https://")) {
  throw new Error("Current product catalog is unavailable: database configuration missing.");
 }
 const read = async (table: string, selection: string, order?: string) => {
  const url = new URL("/rest/v1/" + table, api);
  url.searchParams.set("select", selection);
  if (order) url.searchParams.set("order", order);
  url.searchParams.set("limit", "1000");
  const response = await fetch(url.toString(), {
   headers: { apikey: key, Accept: "application/json" },
   cache: "no-store",
   signal: AbortSignal.timeout(15000),
  });
  if (!response.ok) throw new Error("Store data failed to load (" + table + ", " + response.status + ").");
  return await response.json() as unknown;
 };

 inflight = (async () => {
  const [productRows, categories, collectionRows, settingRows, coupons] = await Promise.all([
   read("artisan_catalog_available","sku,title,price,original_price,stock,category,subcategory,description,upc,badges,collections,images,specs,purchase_rules,source_record","sku.asc"),
   read("artisan_categories","name","name.asc"),
   read("artisan_collections","slug,title,banner,default_sort","slug.asc"),
   read("artisan_shop_settings","key,value","key.asc"),
   read("artisan_coupons","code,message","code.asc"),
  ]);
  if (!Array.isArray(productRows) || productRows.length < originalOrder.size ||
      !productRows.every((r): r is CatalogRow => r && typeof r === "object" && validateProduct(r as CatalogRow))) {
   throw new Error("Product catalog failed integrity validation.");
  }
  const observedSkus = new Set<string>();
  const products: Product[] = productRows.map(row => {
   if (observedSkus.has(row.sku)) throw new Error("Duplicate product SKU: " + row.sku);
   observedSkus.add(row.sku);
   return {
    ...row.source_record, sku: row.sku, title: row.title, price: row.price,
    ...(row.original_price === null ? {} : { originalPrice: row.original_price }),
    stock: row.stock, category: row.category, subcategory: row.subcategory,
    description: row.description, upc: row.upc, badges: row.badges,
    collections: row.collections, images: row.images, specs: row.specs,
    rules: row.purchase_rules,
   };
  });
  for (const sku of originalOrder.keys()) {
   if (!observedSkus.has(sku)) throw new Error("Missing protected baseline SKU: " + sku);
  }
  const observedImages = new Set(products.flatMap(p => p.images));
  for (const img of initialImages) {
   if (!observedImages.has(img)) throw new Error("Missing protected product image: " + img);
  }

  if (!Array.isArray(categories) || categories.length < 32 || !categories.every(c => typeof c.name === "string")) {
   throw new Error("Store categories failed validation.");
  }
  if (!Array.isArray(collectionRows) || collectionRows.length < 5 ||
      !collectionRows.every((c): c is CollectionRow => typeof c.slug === "string" && !!c.title && !!c.banner)) {
   throw new Error("Store collections failed validation.");
  }
  if (!Array.isArray(settingRows) || !settingRows.every((s): s is SettingRow => typeof s.key === "string")) {
   throw new Error("Store settings failed validation.");
  }
  const settings = new Map(settingRows.map(s => [s.key, s.value]));
  if (settings.get("order_minimum_usd") !== 500 || settings.get("currency") !== "USD") {
   throw new Error("Storefront minimum or currency configuration mismatch.");
  }
  const priceBands = settings.get("price_bands") as Array<{id:string;label:string;min:number;max:number|null}>;
  if (!Array.isArray(priceBands) || priceBands.length < 10) throw new Error("Price band configuration missing.");
  if (!Array.isArray(coupons) || coupons.length !== 1 || (coupons[0] as DemoCoupon).code !== "ARTISAN") {
   throw new Error("Demo coupon configuration mismatch.");
  }

  // Apply all state together only after every database response passes validation.
  products.sort((a,b) => (originalOrder.get(a.sku) ?? Number.MAX_SAFE_INTEGER) -
                         (originalOrder.get(b.sku) ?? Number.MAX_SAFE_INTEGER));
  const changed = PRODUCTS.length !== products.length || products.some((p,i) => {
    const previous = PRODUCTS[i];
    return !previous || p.sku !== previous.sku || p.price !== previous.price ||
      p.stock !== previous.stock || p.title !== previous.title ||
      p.description !== previous.description || JSON.stringify(p.images) !== JSON.stringify(previous.images);
  });
  PRODUCTS.splice(0, PRODUCTS.length, ...products);
  CATEGORIES.splice(0, CATEGORIES.length, ...categories.map(c => c.name));
  PRICE_BANDS.splice(0, PRICE_BANDS.length, ...priceBands.map(b => ({
   id:b.id,label:b.label,min:b.min,max:b.max === null ? Infinity : b.max,
  })));
  for (const c of collectionRows) {
   if (c.slug in COLLECTIONS) COLLECTIONS[c.slug] = {
    title:c.title,banner:c.banner,defaultSort:c.default_sort,
   };
  }
  configureDemoCoupon((coupons[0] as DemoCoupon).code, (coupons[0] as DemoCoupon).message);
  const hadPreviousLoad = lastLoaded > 0;
  lastLoaded = Date.now();
  if (changed && hadPreviousLoad) window.dispatchEvent(new Event('artisan-catalog-updated'));
 })().finally(() => { inflight = null; });
 return inflight;
}
