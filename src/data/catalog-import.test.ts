import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { PRODUCTS, COLLECTIONS, type CollectionSlug } from "./catalog";
import { collectionProducts } from "../lib/collections";
import { casesToPieces, lineTotal, normalizePieces, validateQuantity } from "../lib/wholesale";
const manifest = JSON.parse(readFileSync(resolve("docs/kole-import-2026-11-04.json"), "utf8")) as {sku:string; imageSources:string[]; sellingPrice:number}[];

describe("authorized 125-product catalog", () => {
  it("contains each supplied SKU once with no old placeholders", () => {
    expect(PRODUCTS).toHaveLength(125);
    expect(PRODUCTS.map(p => p.sku)).toEqual(manifest.map(p => p.sku));
    expect(new Set(PRODUCTS.map(p => p.sku)).size).toBe(125);
    expect(new Set(PRODUCTS.map(p => p.sourceUrl)).size).toBe(125);
  });
  it("uses up to three real gallery assets and doubles the exact supplier price", () => {
    PRODUCTS.forEach((p,index) => {
      expect(p.images.length).toBeGreaterThan(0);
      expect(p.images.length).toBeLessThanOrEqual(3);
      expect(p.images).toHaveLength(manifest[index]!.imageSources.length);
      for (const image of p.images) expect(existsSync(resolve("public", image))).toBe(true);
      expect(p.description!.length).toBeGreaterThan(20);
      expect(p.sourceUrl).toMatch(/^https:\/\/www\.koleimports\.com\//);
      expect(Math.round(p.price! * 100)).toBe(Math.round(p.originalPrice! * 100) * 2);
      expect(p.titleTruncated).not.toBe(true);
      for (const key of ['lot','moq','caseQty'] as const) expect(p.rules![key]).toBeGreaterThan(0);
      const min = normalizePieces(0,p.rules!);
      if (p.stock! >= min) expect(validateQuantity(min, "piece", p.rules!, p.stock)).toBeNull();
    });
  });
  it("gives every main collection at least 51 unique products without falsifying membership", () => {
    for(const slug of Object.keys(COLLECTIONS) as CollectionSlug[]) {
      const {primary,related}=collectionProducts(slug);
      expect(primary.length+related.length).toBeGreaterThanOrEqual(51);
      expect(new Set([...primary,...related].map(p=>p.sku)).size).toBe(primary.length+related.length);
      expect(primary.every(p=>p.collections.includes(slug))).toBe(true);
      expect(related.every(p=>!p.collections.includes(slug))).toBe(true);
    }
  });
  it("calculates mirror piece and case totals using the resale price", () => {
    const p = PRODUCTS.find(p=>p.sku==='DA883')!;
    expect(p.price).toBe(14.5);
    expect(lineTotal(p.rules!.moq, p.price!)).toBe(58);
    expect(lineTotal(casesToPieces(1, p.rules!), p.price!)).toBe(145);
  });
});
