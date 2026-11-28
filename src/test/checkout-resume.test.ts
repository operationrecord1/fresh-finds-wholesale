import {expect,it} from 'vitest';
import {resumableCheckoutKey} from '@/lib/artisan-checkout-resume';
const payload={billing:{line1:'123 Main St',country:'US'},shipping:{line1:'456 Market St',country:'US'},items:[{sku:'DA883',quantity:40,mode:'piece'}],coupon:null};
const saved={idempotency_key:'existing-key',status:'pending_payment',payment_status:'unpaid',reservation_expires_at:'2099-01-01T00:00:00Z',billing_address:{country:'US',line1:'123 Main St'},shipping_address:payload.shipping,artisan_order_items:payload.items};
it('reuses only an exact unpaid, unexpired cart and address match',()=>{
 expect(resumableCheckoutKey(saved,payload)).toBe('existing-key');
 expect(resumableCheckoutKey(saved,{...payload,items:[{...payload.items[0]!,quantity:80}]})).toBeNull();
 expect(resumableCheckoutKey(saved,{...payload,shipping:{line1:'Other',country:'US'}})).toBeNull();
 expect(resumableCheckoutKey({...saved,payment_status:'paid'},payload)).toBeNull();
 expect(resumableCheckoutKey({...saved,reservation_expires_at:'2000-01-01'},payload)).toBeNull();
 expect(resumableCheckoutKey(saved,{...payload,coupon:'UNKNOWN'})).toBeNull();
});
