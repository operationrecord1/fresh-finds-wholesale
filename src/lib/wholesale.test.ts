import { describe, it, expect } from "vitest";
import { getProduct } from "@/data/catalog";
import { normalizePieces, stepUp, casesToPieces, lineTotal, meetsMinimum } from "./wholesale";

const r = (sku: string) => getProduct(sku)!.rules!;

describe("wholesale rules from research report", () => {
  it("AW213 defaults to 36 pieces = $28.44", () => {
    expect(normalizePieces(0, r("AW213"))).toBe(36);
    expect(lineTotal(36, 0.79)).toBe(28.44);
  });
  it("AW213 plus goes 36 -> 45 = $35.55", () => {
    expect(stepUp(36, r("AW213"))).toBe(45);
    expect(lineTotal(45, 0.79)).toBe(35.55);
  });
  it("MT500 one case = 144 pieces = $237.60", () => {
    expect(casesToPieces(1, r("MT500"))).toBe(144);
    expect(lineTotal(144, 1.65)).toBe(237.6);
  });
  it("AA636 one case = 66 pieces = $23.10", () => {
    expect(lineTotal(casesToPieces(1, r("AA636")), 0.35)).toBe(23.1);
  });
  it("CB163 one case = 8 pieces = $88.00", () => {
    expect(lineTotal(casesToPieces(1, r("CB163")), 11)).toBe(88);
  });
  it("$500 cart minimum: 35.55 blocked, 504.81 allowed", () => {
    expect(meetsMinimum(35.55)).toBe(false);
    expect(meetsMinimum(lineTotal(639, 0.79))).toBe(true);
  });
});
