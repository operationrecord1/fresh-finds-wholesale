import { render, screen, fireEvent, cleanup, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { CartProvider, useCart } from "@/lib/cart";
import { MiniCart } from "@/components/store/MiniCart";
import { PurchasePanel } from "@/components/store/PurchasePanel";
import { getProduct } from "@/data/catalog";
import type { ReactNode } from "react";
vi.mock("@tanstack/react-router", () => ({useNavigate: () => vi.fn(), Link: ({children,to,onClick}: {children:ReactNode;to:string;onClick?:()=>void}) => <a href={to} onClick={onClick}>{children}</a>}));
vi.mock("sonner", () => ({toast:{success:vi.fn()}}));
const KEY = "artisan-mart-cart";
function Harness() {
  const cart = useCart();
  return <><MiniCart/><output data-testid="cart">{JSON.stringify(cart.lines)}|{cart.subtotal}</output>
    <button onClick={() => cart.add("DA883",10,"case")}>Add mirror case</button>
    <button onClick={() => cart.add("DA881",5,"piece")}>Add pink mirror</button>
    <button onClick={() => cart.requestRemove("DA883")}>Remove mirror</button>
    <button onClick={cart.requestClear}>Clear all</button>
  </>;
}
beforeEach(() => sessionStorage.clear());
afterEach(cleanup);
it("merges repeat additions and preserves exact case quantity after reload", async () => {
  const result = render(<CartProvider><Harness/></CartProvider>);
  fireEvent.click(screen.getByText("Add mirror case"));
  fireEvent.click(screen.getByText("Add mirror case"));
  expect(screen.getByTestId("cart")).toHaveTextContent('"pieces":20');
  expect(screen.getByTestId("cart")).toHaveTextContent('|290');
  result.unmount();
  render(<CartProvider><Harness/></CartProvider>);
  await waitFor(() => expect(screen.getByTestId("cart")).toHaveTextContent('"pieces":20'));
});
it("cancel and Escape preserve items; confirm removes only the selected SKU; clear is atomic", () => {
  render(<CartProvider><Harness/></CartProvider>);
  fireEvent.click(screen.getByText("Add mirror case"));
  fireEvent.click(screen.getByText("Add pink mirror"));
  const before = sessionStorage.getItem(KEY);
  fireEvent.click(screen.getByText("Remove mirror"));
  expect(screen.getByRole("alertdialog")).toHaveTextContent("Remove this item?");
  fireEvent.click(screen.getByRole("button",{name:"Cancel"}));
  expect(sessionStorage.getItem(KEY)).toBe(before);
  fireEvent.click(screen.getByText("Clear all"));
  fireEvent.keyDown(screen.getByRole("alertdialog"),{key:"Escape"});
  expect(sessionStorage.getItem(KEY)).toBe(before);
  fireEvent.click(screen.getByText("Remove mirror"));
  fireEvent.click(screen.getByRole("button",{name:"OK"}));
  expect(screen.getByTestId("cart")).not.toHaveTextContent("DA883");
  expect(screen.getByTestId("cart")).toHaveTextContent("DA881");
  fireEvent.click(screen.getByText("Add mirror case"));
  fireEvent.click(screen.getByText("Clear all"));
  fireEvent.click(screen.getByRole("button",{name:"Cancel"}));
  expect(screen.getByTestId("cart")).toHaveTextContent("DA883");
  fireEvent.click(screen.getByText("Clear all"));
  fireEvent.click(screen.getByRole("button",{name:"OK"}));
  expect(screen.getByTestId("cart")).toHaveTextContent("[]|0");
  expect(sessionStorage.getItem(KEY)).toBe("[]");
});
it("opens a touch/keyboard cart preview and shows exact quantities and totals", () => {
  render(<CartProvider><Harness/></CartProvider>);
  fireEvent.click(screen.getByText("Add mirror case"));
  fireEvent.click(screen.getByRole("button",{name:"Shopping cart, 1 products"}));
  const preview = screen.getByRole("region",{name:"Shopping cart preview"});
  expect(preview).toHaveTextContent("Quantity: 10");
  expect(preview).toHaveTextContent("$145.00");
  expect(within(preview).getByRole("button",{name:"Checkout"})).toBeDisabled();
  fireEvent.click(within(preview).getByRole("button",{name:/Remove Black/}));
  expect(screen.getByRole("alertdialog")).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button",{name:"Cancel"}));
  expect(screen.getByTestId("cart")).toHaveTextContent('"pieces":10');
});
it("ignores malformed persisted data without crashing the cart", () => {
  sessionStorage.setItem(KEY,JSON.stringify([null,{sku:"DA883",pieces:-2},{sku:"DA881",pieces:"5"},{sku:"FAKE",pieces:1},{sku:"DA883",pieces:10,mode:"case"}]));
  render(<CartProvider><Harness/></CartProvider>);
  expect(screen.getByTestId("cart")).toHaveTextContent('[{"sku":"DA883","pieces":10,"mode":"case"}]|145');
});
it("reopens a saved ten-piece case without rounding it to a piece lot", async () => {
  sessionStorage.setItem(KEY,JSON.stringify([{sku:"DA883",pieces:10,mode:"case"}]));
  function Edit() {const {lines}=useCart();return lines.length ? <PurchasePanel p={getProduct("DA883")!} initialPieces={10} label="Update Cart"/> : null;}
  render(<CartProvider><Edit/></CartProvider>);
  expect(screen.getByLabelText("Case quantity")).toHaveValue("1");
  fireEvent.click(screen.getByRole("button",{name:"Increase case"}));
  fireEvent.click(screen.getByRole("button",{name:"Decrease case"}));
  expect(screen.getByText(/= \$145.00/)).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button",{name:"Update Cart"}));
  await waitFor(() => expect(JSON.parse(sessionStorage.getItem(KEY)!)[0].pieces).toBe(10));
});
