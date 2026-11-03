import { describe, expect, it } from "vitest";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { IMPORTED_NEW_ARRIVALS, PRODUCTS } from "./catalog";
import { casesToPieces, lineTotal, validateQuantity } from "../lib/wholesale";

describe("authorized New Arrivals import", () => {
  it("contains the exact 25 requested SKUs, with no legacy arrivals or duplicates", () => {
    const expected = "DA883 DA881 AV822 AV821 DA850 AW300 AW298 AW297 AW296 AW295 AW293 AW284 AW004 AV014 AV010 AV006 AV003 AV997 AV996 AV989 AW404 AW303 AW235 AW258 AW246".split(" ");
    expect(IMPORTED_NEW_ARRIVALS.map(p => p.sku)).toEqual(expected);
    expect(PRODUCTS.filter(p => p.collections.includes("new-arrivals")).map(p => p.sku)).toEqual(expected);
    expect(new Set(PRODUCTS.map(p => p.sku)).size).toBe(PRODUCTS.length);
  });
  it("has three local gallery assets, supplier provenance, descriptions and exact doubled prices", () => {
    for (const p of IMPORTED_NEW_ARRIVALS) {
      expect(p.images).toHaveLength(3);
      for (const image of p.images) expect(existsSync(resolve("public", image))).toBe(true);
      expect(p.description!.length).toBeGreaterThan(100);
      expect(p.sourceUrl).toMatch(/^https:\/\/www\.koleimports\.com\//);
      expect(Math.round(p.price! * 100)).toBe(Math.round(p.originalPrice! * 100) * 2);
      expect(p.titleTruncated).not.toBe(true);
      expect(validateQuantity(p.rules!.moq, "piece", p.rules!, p.stock)).toBeNull();
      expect(validateQuantity(1, "case", p.rules!, p.stock)).toBeNull();
    }
  });
  it("calculates mirror piece and case totals using the resale price", () => {
    const p = IMPORTED_NEW_ARRIVALS[0];
    expect(p.price).toBe(14.5);
    expect(lineTotal(p.rules!.moq, p.price!)).toBe(58);
    expect(lineTotal(casesToPieces(1, p.rules!), p.price!)).toBe(145);
  });
});
