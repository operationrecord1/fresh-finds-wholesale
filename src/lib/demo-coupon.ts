export let DEMO_COUPON_CODE = "ARTISAN";
export const INVALID_COUPON_MESSAGE = "Enter a valid coupon code.";
export let DEMO_COUPON_SUCCESS_MESSAGE = "Coupon code accepted for this demo. No discount has been applied.";
export const isValidDemoCoupon = (code: string): boolean => code === DEMO_COUPON_CODE;

/** Called only after the authoritative demo coupon configuration is validated. */
export function configureDemoCoupon(code: string, message: string) {
  if (!/^[A-Z0-9_-]{1,64}$/.test(code) || !message.trim()) throw new Error("Invalid demo coupon configuration.");
  DEMO_COUPON_CODE = code;
  DEMO_COUPON_SUCCESS_MESSAGE = message;
}
