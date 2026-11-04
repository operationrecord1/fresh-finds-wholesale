import { describe, it, expect } from "vitest";
import type { PurchaseRules } from "@/data/catalog";
import { normalizePieces, stepUp, casesToPieces, lineTotal, meetsMinimum } from "./wholesale";

// Stable unit fixtures keep arithmetic tests independent of supplier inventory changes.
const fixtures: Record<string, PurchaseRules> = {
 AW213: {lot:9,moq:36,caseQty:36,physicalCase:9,innerPack:1},
 MT500: {lot:24,moq:24,caseQty:144,physicalCase:144,innerPack:24},
 AA636: {lot:6,moq:66,caseQty:66,physicalCase:48,innerPack:6},
 CB163: {lot:3,moq:3,caseQty:8,physicalCase:8,innerPack:1},
};
const r = (sku: string) => fixtures[sku]!;

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

import { validateQuantity } from "./wholesale";
describe("purchase validation", () => {
  it("rejects zero, fractional quantities and incomplete lots without rounding", () => {
    expect(validateQuantity(0, "piece", r("MT500"), 7479)).toBeTruthy();
    expect(validateQuantity(24.5, "piece", r("MT500"), 7479)).toBeTruthy();
    expect(validateQuantity(25, "piece", r("MT500"), 7479)).toContain("24 or 48");
    expect(validateQuantity(24, "piece", r("MT500"), 7479)).toBeNull();
  });
  it("caps orders at the available lot multiple, including the existing cart", () => {
    expect(validateQuantity(999999, "case", r("MT500"), 7479)).toContain("Maximum");
    expect(validateQuantity(48, "piece", r("MT500"), 72, 48)).toContain("24 pieces");
    expect(validateQuantity(24, "piece", r("MT500"), 72, 48)).toBeNull();
  });
  it("allows a full case whose size differs from the piece lot", () => {
    expect(validateQuantity(1, "case", r("CB163"), 1100)).toBeNull();
    expect(validateQuantity(8, "piece", r("CB163"), 1100)).toBeTruthy();
  });
});
