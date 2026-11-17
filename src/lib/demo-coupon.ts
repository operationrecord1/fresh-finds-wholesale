export const DEMO_COUPON_CODE = "ARTISAN";
export const INVALID_COUPON_MESSAGE = "Enter a valid coupon code.";
export const DEMO_COUPON_SUCCESS_MESSAGE = "Coupon code accepted for this demo. No discount has been applied.";
export const isValidDemoCoupon = (code: string): boolean => code === DEMO_COUPON_CODE;
