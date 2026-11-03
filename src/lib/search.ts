import type { Product } from "@/data/catalog";

const normalize = (value: string) => value.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
export function searchProducts(products: Product[], query: string): Product[] {
  const terms = normalize(query).split(/\s+/).filter(Boolean);
  if (!terms.length) return [];
  return products.filter(product => {
    const text = normalize([product.sku, product.title, product.category, product.subcategory, product.upc].filter(Boolean).join(" "));
    return terms.every(term => text.includes(term));
  }).sort((a, b) => Number(normalize(b.sku) === normalize(query)) - Number(normalize(a.sku) === normalize(query)));
}
