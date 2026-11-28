type StripeIntent={id?:string;status?:string;currency?:string;amount_received?:number;livemode?:boolean;latest_charge?:{paid?:boolean;payment_intent?:string;payment_method_details?:{card?:{brand?:string;last4?:string;issuer?:string}}}};
/** Only non-sensitive card metadata from a verified successful Stripe intent. */
export function orderCardSnapshot(intent:StripeIntent,amount:number){
 const charge=intent.latest_charge,card=charge?.payment_method_details?.card;
 if(intent.status!=='succeeded'||intent.currency!=='usd'||intent.amount_received!==amount||!charge?.paid||charge.payment_intent!==intent.id||!card?.last4||!/^\d{4}$/.test(card.last4))throw Error('Card snapshot is not verified');
 return {payment_card_brand:card.brand?.slice(0,30)||null,payment_card_last4:card.last4,payment_card_issuer:typeof card.issuer==='string'?card.issuer.slice(0,140):null,payment_decline_code:null};
}
