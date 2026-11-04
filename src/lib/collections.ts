import { PRODUCTS, type CollectionSlug } from "@/data/catalog";

/** Keep factual collection membership separate from complementary recommendations. */
export function collectionProducts(slug: CollectionSlug) {
  const primary = PRODUCTS.filter(p => p.collections.includes(slug));
  const ids = new Set(primary.map(p => p.sku));
  const related = PRODUCTS.filter(p => !ids.has(p.sku)).slice(0, Math.max(0, 51 - primary.length));
  return { primary, related };
}
