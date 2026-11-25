import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { Checkout } from "@/routes/checkout";

const state=vi.hoisted(()=>({
  user:null as null | {email:string;email_confirmed_at?:string},
  ready:true,subtotal:580, lines:[{sku:"DA883",pieces:40}], navigate:vi.fn(),
}));
vi.mock("@tanstack/react-router",()=>({
  createFileRoute:()=> (config:unknown)=>config,
  Link:({children,to,onClick}:any)=><a href={to} onClick={onClick}>{children}</a>,
  useNavigate:()=>state.navigate,
}));
vi.mock("@/lib/artisan-auth",()=>({useArtisanAuth:()=>({user:state.user,ready:state.ready})}));
vi.mock("@/lib/cart",()=>({useCart:()=>({lines:state.lines,subtotal:state.subtotal})}));
afterEach(()=>{cleanup();localStorage.clear();sessionStorage.clear();vi.clearAllMocks();vi.unstubAllEnvs();});
beforeEach(()=>{
  vi.stubEnv("VITE_ARTISAN_LIVE_CHECKOUT_ENABLED","false");
  vi.stubEnv("VITE_ARTISAN_SANDBOX_CHECKOUT_ENABLED","false");
  state.user=null;state.ready=true;state.subtotal=580;state.lines=[{sku:"DA883",pieces:40}];
});
it("blocks unauthenticated checkout and redirects to login without losing cart",async()=>{
  render(<Checkout/>);
  expect(screen.queryByText("Billing Address")).not.toBeInTheDocument();
  await waitFor(()=>expect(state.navigate).toHaveBeenCalledWith({to:"/login"}));
  expect(localStorage.getItem("artisan-mart-pending-checkout-cart")).toContain("DA883");
});
it("blocks customers who have not verified their email",async()=>{
  state.user={email:"qa@example.invalid"};
  render(<Checkout/>);
  await waitFor(()=>expect(state.navigate).toHaveBeenCalledWith({to:"/login"}));
  expect(screen.queryByText("Payment Method")).not.toBeInTheDocument();
});
it("maintains $500 minimum after authentication",()=>{
  state.user={email:"qa@example.invalid",email_confirmed_at:"2026-11-25T00:00:00Z"};
  state.subtotal=58;
  render(<Checkout/>);
  expect(screen.getByText(/below the \$500 minimum/)).toBeInTheDocument();
  expect(screen.queryByText("Billing Address")).not.toBeInTheDocument();
});
it("shows original address fields and separate shipping information for verified customers",()=>{
  state.user={email:"qa@example.invalid",email_confirmed_at:"2026-11-25T00:00:00Z"};
  render(<Checkout/>);
  expect(screen.getByText("Billing Address")).toBeInTheDocument();
  expect(screen.getByDisplayValue("qa@example.invalid")).toBeInTheDocument();
  expect(screen.getByText("Merchandise subtotal")).toBeInTheDocument();
  expect(screen.getAllByText("$580.00")).toHaveLength(2);
  fireEvent.click(screen.getByLabelText(/Ship to the same address/));
  expect(screen.getByText("Shipping Address")).toBeInTheDocument();
  expect(screen.getByText(/Free shipping on every order/)).toBeInTheDocument();
});
it("displays approved zero shipping, zero eligible-reseller tax and zero fees",()=>{
  state.user={email:"qa@example.invalid",email_confirmed_at:"2026-11-25T00:00:00Z"};
  render(<Checkout/>);
  expect(screen.getByText(/Free shipping on every order/)).toBeInTheDocument();
  expect(screen.getByText(/Sales tax \(eligible resellers\)/)).toBeInTheDocument();
  expect(screen.getByText(/Additional checkout fees/)).toBeInTheDocument();
  expect(screen.getByText(/Total before applicable discounts/)).toBeInTheDocument();
  expect(screen.getAllByText("$580.00")).toHaveLength(2);
});
it("prevents all demonstration card input, order creation and fake purchase success",()=>{
  state.user={email:"qa@example.invalid",email_confirmed_at:"2026-11-25T00:00:00Z"};
  render(<Checkout/>);
  const button=screen.getByRole("button",{name:"Payments temporarily unavailable"});
  expect(button).toBeDisabled();
  expect(screen.queryByLabelText("Card number")).not.toBeInTheDocument();
  expect(screen.queryByText("Thank You for Your Purchase!")).not.toBeInTheDocument();
  expect(screen.getByText(/No order is placed/)).toBeInTheDocument();
});
it("retains correct zero-discount demo coupon feedback",()=>{
  state.user={email:"qa@example.invalid",email_confirmed_at:"2026-11-25T00:00:00Z"};
  render(<Checkout/>);
  const input=screen.getByRole("textbox",{name:"Coupon code"});
  fireEvent.change(input,{target:{value:"invalid"}});
  fireEvent.click(screen.getByRole("button",{name:"Apply"}));
  expect(screen.getByText("Enter a valid coupon code.")).toBeInTheDocument();
  fireEvent.change(input,{target:{value:"ARTISAN"}});
  fireEvent.click(screen.getByRole("button",{name:"Apply"}));
  expect(screen.getByText(/No discount has been applied/)).toBeInTheDocument();
  expect(screen.getAllByText("$580.00")).toHaveLength(2);
});
