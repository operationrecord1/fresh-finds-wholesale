import { describe, expect, it } from "vitest";
import { PRODUCTS } from "@/data/catalog";
import { searchProducts } from "./search";

describe("catalog search", () => {
  it("finds item numbers regardless of case and whitespace", () => {
    expect(searchProducts(PRODUCTS, "  mt500  ")[0]?.sku).toBe("MT500");
  });
  it("matches punctuation and words in any order", () => {
    expect(searchProducts(PRODUCTS, "nylon multi purpose").some(p => p.sku === "MT500")).toBe(true);
  });
  it("searches verified UPCs and categories", () => {
    expect(searchProducts(PRODUCTS, "731015131334")[0]?.sku).toBe("MT500");
    expect(searchProducts(PRODUCTS, "cosmetics").some(p => p.sku === "AW400")).toBe(true);
  });
  it("returns no results for empty or unknown queries", () => {
    for (const q of ["", "   ", "!!!", "zznonexistentproductzz"]) expect(searchProducts(PRODUCTS, q)).toEqual([]);
  });
});
