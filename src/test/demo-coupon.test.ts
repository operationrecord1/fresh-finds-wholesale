import { expect, it } from "vitest";
import { DEMO_COUPON_CODE, INVALID_COUPON_MESSAGE, isValidDemoCoupon } from "@/lib/demo-coupon";

it("allows only the exact uppercase ARTISAN demo coupon", () => {
  expect(DEMO_COUPON_CODE).toBe("ARTISAN");
  expect(INVALID_COUPON_MESSAGE).toBe("Enter a valid coupon code.");
  expect(isValidDemoCoupon("ARTISAN")).toBe(true);
  for (const value of ["", "artisan", "Artisan", "ARTISAN ", " ARTISAN", "VIP8", "OTHER"]) {
    expect(isValidDemoCoupon(value)).toBe(false);
  }
});
