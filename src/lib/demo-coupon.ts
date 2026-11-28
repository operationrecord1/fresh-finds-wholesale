export const DEMO_COUPON_CODE = "ARTISAN";
export const INVALID_COUPON_MESSAGE = "Enter a valid coupon code.";
export const DEMO_COUPON_SUCCESS_MESSAGE = "ARTISAN applied: 5% off.";
export const isValidDemoCoupon = (code: string): boolean => code.trim().toUpperCase() === DEMO_COUPON_CODE;
export const couponDiscount = (subtotal: number, code: string): number => isValidDemoCoupon(code) ? Math.round(Math.round(subtotal * 100) * 5 / 100) / 100 : 0;
