import {beforeEach,describe,expect,it} from "vitest";
import {preserveCartForCheckout,loadCheckoutCoupon,loadCheckoutCart,synchronizeCheckoutCart} from "@/lib/artisan-checkout-intent";
const line=[{sku:"DA883",pieces:40,mode:"case" as const}];
beforeEach(()=>{localStorage.clear();sessionStorage.clear();});
describe("Authentication cart and coupon continuity",()=>{
 it("retains existing valid coupon after guest checkout re-snapshots cart",()=>{
  preserveCartForCheckout(line,"ARTISAN");
  preserveCartForCheckout(line,loadCheckoutCoupon());
  expect(loadCheckoutCoupon()).toBe("ARTISAN");
  expect(loadCheckoutCart()).toEqual(line);
 });
 it("never persists unsupported coupon codes or discounts",()=>{
  preserveCartForCheckout(line,"not-valid");
  expect(loadCheckoutCoupon()).toBe("");
 });
 it("updates cart quantities without dropping saved coupon",()=>{
  preserveCartForCheckout(line,"ARTISAN");
  synchronizeCheckoutCart([{sku:"DA883",pieces:80,mode:"case"}]);
  expect(loadCheckoutCoupon()).toBe("ARTISAN");
  expect(loadCheckoutCart()?.[0].pieces).toBe(80);
 });
 it("removes saved coupon and cart when cart is cleared",()=>{
  preserveCartForCheckout(line,"ARTISAN");
  synchronizeCheckoutCart([]);
  expect(loadCheckoutCart()).toBeNull();
  expect(loadCheckoutCoupon()).toBe("");
 });
});
