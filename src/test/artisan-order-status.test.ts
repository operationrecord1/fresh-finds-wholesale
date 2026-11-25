import { describe,expect,it } from "vitest";
import { customerPaymentMessage } from "@/lib/artisan-order-status";
describe("Verified Stripe payment order status display",()=>{
 it("announces payment confirmed only for paid and confirmed rows",()=>{
  expect(customerPaymentMessage("confirmed","paid").confirmed).toBe(true);
  expect(customerPaymentMessage("pending_payment","paid").confirmed).toBe(false);
  expect(customerPaymentMessage("confirmed","unpaid").confirmed).toBe(false);
 });
 it("does not call refunds and failed card payments pending success",()=>{
  expect(customerPaymentMessage("confirmed","refunded").message).toMatch(/refunded/);
  expect(customerPaymentMessage("confirmed","partially_refunded").message).toMatch(/partially refunded/);
  expect(customerPaymentMessage("cancelled","failed").message).toMatch(/failed/);
  expect(customerPaymentMessage("expired","cancelled").message).toMatch(/expired/);
 });
 it("warns against duplicate payment attempts when pending",()=>{
  expect(customerPaymentMessage("pending_payment","unpaid").message).toMatch(/Do not pay again/);
 });
});
