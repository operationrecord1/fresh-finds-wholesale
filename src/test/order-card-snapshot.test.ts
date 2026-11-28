import {expect,it} from 'vitest';
import {orderCardSnapshot} from '../../supabase/functions/_shared/order-card-snapshot';
const proof={id:'pi_verified',status:'succeeded',currency:'usd',amount_received:58000,latest_charge:{paid:true,payment_intent:'pi_verified',payment_method_details:{card:{brand:'visa',last4:'4242'}}}};
it('stores only verified non-sensitive card metadata',()=>{expect(orderCardSnapshot(proof,58000)).toEqual({payment_card_brand:'visa',payment_card_last4:'4242',payment_card_issuer:null,payment_decline_code:null});});
it('rejects unpaid, wrong-amount and unrelated charge evidence',()=>{for(const invalid of [{...proof,status:'requires_payment_method'},{...proof,amount_received:1},{...proof,latest_charge:{...proof.latest_charge,payment_intent:'pi_other'}}])expect(()=>orderCardSnapshot(invalid,58000)).toThrow('not verified');});
