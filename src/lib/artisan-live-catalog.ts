import { PRODUCTS, type Product } from "@/data/catalog";

type CatalogRow = {
  sku: string; title: string; price: number | null; original_price: number | null;
  stock: number | null; category: string | null; subcategory: string | null;
  description: string | null; upc: string | null;
  badges: Product["badges"]; collections: Product["collections"];
  images: string[]; specs: Record<string,string>;
  purchase_rules: Product["rules"]; source_record: Product;
};

let inflight: Promise<void> | null = null;
let lastLoaded = 0;

function isValidProduct(row: CatalogRow): boolean {
  return typeof row.sku === "string" && typeof row.title === "string"
    && row.source_record?.sku === row.sku
    && Array.isArray(row.images) && Array.isArray(row.badges)
    && Array.isArray(row.collections) && (row.price === null || (typeof row.price === "number" && row.price >= 0))
    && (row.stock === null || (Number.isSafeInteger(row.stock) && row.stock >= 0));
}

export async function loadAuthoritativeCatalog() {
  // Tests use their explicit 125-record static fixture, never the remote production database.
  if (import.meta.env.MODE === "test" || typeof window === "undefined") return;
  // Avoid excessive free-tier requests during rapid client-side route transitions.
  if (Date.now() - lastLoaded < 5000) return;
  if (inflight) return inflight;

  const api = import.meta.env.VITE_ARTISAN_SUPABASE_URL as string | undefined;
  const key = import.meta.env.VITE_ARTISAN_SUPABASE_PUBLISHABLE_KEY as string | undefined;
  if (!api || !key || !api.startsWith("https://")) {
    throw new Error("Product catalog is unavailable: secure database configuration missing.");
  }

  inflight = (async () => {
    const url = new URL("/rest/v1/artisan_products", api);
    url.searchParams.set("select",
      "sku,title,price,original_price,stock,category,subcategory,description,upc,badges,collections,images,specs,purchase_rules,source_record");
    url.searchParams.set("order", "sku.asc");
    url.searchParams.set("limit", "1000");
    const response = await fetch(url.toString(), {
      headers: { apikey: key, Accept: "application/json" },
      cache: "no-store",
      signal: AbortSignal.timeout(15000),
    });
    if (!response.ok) throw new Error("Product catalog failed to load (" + response.status + ").");
    const rows: unknown = await response.json();
    if (!Array.isArray(rows) || rows.length < 125 ||
        !rows.every((p): p is CatalogRow => p && typeof p === "object" && isValidProduct(p as CatalogRow))) {
      throw new Error("Product catalog failed integrity validation.");
    }
    const seen = new Set<string>();
    const authoritative: Product[] = rows.map((row) => {
      if (seen.has(row.sku)) throw new Error("Duplicate SKU in product database: " + row.sku);
      seen.add(row.sku);
      return {
        ...row.source_record, sku: row.sku, title: row.title, price: row.price,
        originalPrice: row.original_price ?? undefined,
        stock: row.stock, category: row.category, subcategory: row.subcategory,
        description: row.description, upc: row.upc, badges: row.badges,
        collections: row.collections, images: row.images, specs: row.specs,
        rules: row.purchase_rules,
      };
    });
    PRODUCTS.splice(0, PRODUCTS.length, ...authoritative);
    lastLoaded = Date.now();
  })().finally(() => { inflight = null; });
  return inflight;
}
