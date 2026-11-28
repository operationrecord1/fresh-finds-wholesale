/** Customer-visible status always comes from the webhook-settled database row. */
export function customerPaymentMessage(status:string,paymentStatus:string):{message:string;confirmed:boolean}{
 if(["confirmed","fulfilling","fulfilled"].includes(status)&&paymentStatus==="paid")
  return {message:"Payment confirmed. Your order has been recorded.",confirmed:true};
 if(paymentStatus==="refunded")
  return {message:"This payment has been refunded. Review your order details in My Account.",confirmed:false};
 if(paymentStatus==="partially_refunded")
  return {message:"This payment was partially refunded. Review your order details in My Account.",confirmed:false};
 if(paymentStatus==="failed")
  return {message:"Payment failed. No paid order was confirmed.",confirmed:false};
 if(paymentStatus==="cancelled"||status==="cancelled"||status==="expired")
  return {message:"Checkout was cancelled. No paid order was confirmed.",confirmed:false};
 return {message:"Payment has not been confirmed yet. Do not pay again until the status is updated.",confirmed:false};
}
