import { describe, it, expect } from "vitest";
import { CATEGORIES, COLLECTIONS, PRODUCTS } from "@/data/catalog";

// Regression guard: the original store catalog must remain recoverable and
// match the Supabase seed baseline before dynamic loading occurs.
describe("Artisan Mart catalog migration baseline", () => {
 it("preserves all 125 unique SKUs and full purchasing fields", () => {
  expect(PRODUCTS).toHaveLength(125);
  expect(new Set(PRODUCTS.map(p => p.sku)).size).toBe(125);
  for (const p of PRODUCTS) {
   expect(p.sku.length).toBeGreaterThan(0);
   expect(p.title.length).toBeGreaterThan(0);
   expect(p.price === null || p.price >= 0).toBe(true);
   expect(p.stock === null || p.stock >= 0).toBe(true);
   expect(Array.isArray(p.images)).toBe(true);
   expect(Array.isArray(p.badges)).toBe(true);
   expect(Array.isArray(p.collections)).toBe(true);
   expect(typeof p.specs).toBe("object");
   if (p.rules) {
    expect(p.rules.lot).toBeGreaterThan(0);
    expect(p.rules.moq).toBeGreaterThan(0);
    expect(p.rules.caseQty).toBeGreaterThan(0);
   }
  }
 });
 it("retains all 354 image references without duplication", () => {
  const paths = PRODUCTS.flatMap(p => p.images);
  expect(paths).toHaveLength(354);
  expect(new Set(paths).size).toBe(354);
  expect(paths.every(p => p.startsWith("images/products/") && p.endsWith(".webp"))).toBe(true);
 });
 it("preserves the full category and collection list", () => {
  expect(CATEGORIES).toHaveLength(32);
  expect(Object.keys(COLLECTIONS)).toHaveLength(5);
 });
});
