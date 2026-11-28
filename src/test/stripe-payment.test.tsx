import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { StripePayment, type PaymentBilling } from "@/components/store/StripePayment";
const state=vi.hoisted(()=>({confirm:vi.fn()}));
vi.mock("@stripe/react-stripe-js/checkout",()=>({PaymentElement:()=> <div>Secure fields</div>,useCheckoutElements:()=>({type:"success",checkout:{confirm:state.confirm}})}));
const billing:PaymentBilling={first_name:"Test",last_name:"Buyer",company:"",email:"checkout@example.invalid",phone:"+12025550100",line1:"123 Main St",line2:"Apt 4",city:"Tampa",state:"FL",postal_code:"33602",shipping_first_name:"Other",shipping_last_name:"Recipient",shipping_phone:"+12025550100",shipping_line1:"456 Market St",shipping_line2:"Suite 2",shipping_city:"Philadelphia",shipping_state:"PA",shipping_postal_code:"19106"};
afterEach(()=>{cleanup();vi.clearAllMocks();});
it("confirms with the server return URL and the selected delivery address",async()=>{
 state.confirm.mockResolvedValue({type:"success"});const success=vi.fn();render(<StripePayment billing={billing} same={false} totalCents={58000} onError={vi.fn()} onSuccess={success}/>);
 fireEvent.click(screen.getByRole("button",{name:/Complete purchase/}));await waitFor(()=>expect(success).toHaveBeenCalledOnce());
 const args=state.confirm.mock.calls[0]![0];expect(args).not.toHaveProperty("returnUrl");expect(args).not.toHaveProperty("email");expect(args.redirect).toBe("if_required");expect(args.shippingAddress.address).toMatchObject({line1:"456 Market St",line2:"Suite 2",country:"US"});expect(args.billingAddress.address.line1).toBe("123 Main St");
});
it("keeps a declined payment on checkout and allows retry without claiming success",async()=>{
 state.confirm.mockResolvedValue({type:"error",error:{message:"Your card has insufficient funds."}});const success=vi.fn(),error=vi.fn();render(<StripePayment billing={billing} same totalCents={58000} onError={error} onSuccess={success}/>);
 fireEvent.click(screen.getByRole("button",{name:/Complete purchase/}));await waitFor(()=>expect(error).toHaveBeenCalledWith("Your card has insufficient funds."));expect(success).not.toHaveBeenCalled();expect(screen.getByRole("button",{name:/Complete purchase/})).toBeEnabled();
});
