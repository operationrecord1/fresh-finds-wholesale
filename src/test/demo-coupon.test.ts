import { expect, it } from "vitest";
import { DEMO_COUPON_CODE, INVALID_COUPON_MESSAGE, isValidDemoCoupon, couponDiscount } from "@/lib/demo-coupon";

it("applies the ARTISAN five-percent coupon with normalized input", () => {
  expect(DEMO_COUPON_CODE).toBe("ARTISAN");
  expect(INVALID_COUPON_MESSAGE).toBe("Enter a valid coupon code.");
  for(const code of ["ARTISAN","artisan","Artisan"," ARTISAN "])expect(isValidDemoCoupon(code)).toBe(true);
  expect(couponDiscount(580,"artisan")).toBe(29);
  expect(couponDiscount(2276.90,"ARTISAN")).toBe(113.85);
  expect(couponDiscount(500,"OTHER")).toBe(0);
  for (const value of ["", "VIP8", "OTHER"]) {
    expect(isValidDemoCoupon(value)).toBe(false);
  }
});
