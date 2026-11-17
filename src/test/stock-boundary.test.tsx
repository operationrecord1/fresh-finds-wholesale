import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { CartProvider, CartReady, useCart } from "@/lib/cart";
import { ExpressOrder } from "@/components/store/ExpressOrder";
vi.mock("sonner", () => ({ toast: { success: vi.fn() } }));
beforeEach(() => sessionStorage.clear());
afterEach(cleanup);
function Harness() {
  const cart = useCart();
  return <><output data-testid="stock-cart">{JSON.stringify(cart.lines)}</output>
    <button onClick={() => { cart.add("DA883", 400); cart.add("DA883", 400); }}>Rapid adds</button>
    <button onClick={() => cart.set("DA883", 784)}>Overstock edit</button>
    <button onClick={() => cart.set("DA883", 780)}>At stock</button>
    <button onClick={() => cart.add("DA883", 4)}>Add more</button>
    <ExpressOrder open /></>;
}
it("guards same-tick adds and cart edits, without changing Remove behavior", () => {
  render(<CartProvider><Harness /></CartProvider>);
  fireEvent.click(screen.getByText("Rapid adds"));
  expect(screen.getByTestId("stock-cart")).toHaveTextContent('"pieces":400');
  fireEvent.click(screen.getByText("Overstock edit"));
  expect(screen.getByTestId("stock-cart")).toHaveTextContent('"pieces":400');
  fireEvent.click(screen.getByText("At stock"));
  fireEvent.click(screen.getByText("Add more"));
  expect(screen.getByTestId("stock-cart")).toHaveTextContent('"pieces":780');
  expect(JSON.parse(sessionStorage.getItem("artisan-mart-cart")!)[0].pieces).toBe(780);
});
it("restores saved carts within stock and keeps the initial server shell empty", async () => {
  expect(renderToString(<CartProvider><CartReady><p>Temporary cart page</p></CartReady></CartProvider>)).toBe("");
  sessionStorage.setItem("artisan-mart-cart", JSON.stringify([{ sku: "DA883", pieces: 999999, mode: "case" }]));
  render(<CartProvider><CartReady><Harness /></CartReady></CartProvider>);
  await waitFor(() => expect(screen.getByTestId("stock-cart")).toHaveTextContent('"pieces":780'));
});
it("checks duplicate Express Order rows and existing quantities against the combined limit", () => {
  render(<CartProvider><Harness /></CartProvider>);
  for (const i of [0, 1]) {
    fireEvent.change(screen.getAllByLabelText("Item #")[i]!, { target: { value: "DA883" } });
    fireEvent.change(screen.getAllByLabelText("Qty")[i]!, { target: { value: "400" } });
  }
  fireEvent.click(screen.getByText("Add To Order"));
  expect(screen.getByTestId("stock-cart")).toHaveTextContent('"pieces":400');
  expect(screen.getByText(/Maximum available/)).toBeInTheDocument();
  fireEvent.click(screen.getByText("Add To Order"));
  expect(screen.getByTestId("stock-cart")).toHaveTextContent('"pieces":400');
});
it("validates CSV duplicates, zero stock and lot-rounded quantities before adding", async () => {
  render(<CartProvider><Harness /></CartProvider>);
  const file = new File(["item #,qty\nDA883,400\nDA883,400\nAV011,5\nDA883,NaN"], "order.csv", { type: "text/csv" });
  Object.defineProperty(file, "text", { value: async () => "item #,qty\nDA883,400\nDA883,400\nAV011,5\nDA883,NaN" });
  fireEvent.change(screen.getByLabelText(/Upload CSV/), { target: { files: [file] } });
  await waitFor(() => expect(screen.getByTestId("stock-cart")).toHaveTextContent('"pieces":400'));
  expect(screen.getByTestId("stock-cart")).not.toHaveTextContent("AV011");
  expect(screen.getByText(/enter a whole quantity greater/)).toBeInTheDocument();
});
