import {expect,it} from 'vitest';
import {deliveryLabel,type CustomerOrder} from '@/lib/customer-order';
it('uses the requested three-day estimate only for successful orders',()=>{const order={created_at:'2026-11-25T12:00:00Z',status:'confirmed',payment_status:'paid'} as CustomerOrder;expect(deliveryLabel(order)).toBe('Estimated arrival November 28, 2026');expect(deliveryLabel({...order,payment_status:'unpaid',status:'pending_payment'})).toBe('Awaiting payment');expect(deliveryLabel({...order,estimated_delivery_start:'2026-12-02'})).toBe('Arriving December 2, 2026');});
