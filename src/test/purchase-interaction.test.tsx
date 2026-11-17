import { render, screen, fireEvent, cleanup, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { PurchasePanel } from "@/components/store/PurchasePanel";
import { getProduct } from "@/data/catalog";
const cart = vi.hoisted(() => ({ add: vi.fn(), set: vi.fn(), lines: [] as {sku:string;pieces:number}[] }));
vi.mock("@/lib/cart", () => ({ useCart: () => cart }));
vi.mock("sonner", () => ({ toast: { success: vi.fn() } }));
beforeEach(() => { cart.add.mockClear(); cart.set.mockClear(); cart.lines = []; });
afterEach(cleanup);
it("keeps keyboard input focused, rejects an incomplete lot, and adds a valid order", async () => {
  render(<PurchasePanel p={getProduct("MT500")!}/>);
  const input = screen.getByLabelText("Pieces quantity");
  input.focus();
  fireEvent.change(input, {target:{value:"25"}});
  expect(document.activeElement).toBe(input);
  fireEvent.click(screen.getByRole("button", {name:"Add To Cart"}));
  expect(cart.add).not.toHaveBeenCalled();
  expect(screen.getByRole("alert")).toHaveTextContent("24 or 48");
  fireEvent.change(input, {target:{value:"48"}});
  fireEvent.click(screen.getByRole("button", {name:"Add To Cart"}));
  await waitFor(() => expect(cart.add).toHaveBeenCalledWith("MT500", 48, "piece"));
});
it("converts cases to pieces and preserves the minimum", () => {
  render(<PurchasePanel p={getProduct("MT500")!}/>);
  expect(screen.getByRole("button", {name:"Decrease piece"})).toBeDisabled();
  fireEvent.click(screen.getByLabelText(/Order By Case/));
  expect(screen.getByLabelText("Case quantity")).toHaveValue("1");
  expect(screen.getByText(/475.20/)).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", {name:"Increase case"}));
  expect(screen.getByLabelText("Case quantity")).toHaveValue("2");
});
it("updates instead of adding during cart editing", async () => {
  render(<PurchasePanel p={getProduct("MT500")!} initialPieces={48} label="Update Cart"/>);
  fireEvent.click(screen.getByRole("button", {name:"Increase piece"}));
  fireEvent.click(screen.getByRole("button", {name:"Update Cart"}));
  await waitFor(() => expect(cart.set).toHaveBeenCalledWith("MT500", 72, "piece"));
  expect(cart.add).not.toHaveBeenCalled();
});

it("does not offer Add To Cart for supplier products with zero stock", () => {
  render(<PurchasePanel p={getProduct("AV011")!}/>);
  expect(screen.getByRole("status")).toHaveTextContent("Currently out of stock");
  expect(screen.queryByRole("button", {name:"Add To Cart"})).not.toBeInTheDocument();
});


it("caps typed/pasted quantities and mode switches at stock, including existing cart quantities", () => {
  const product = { ...getProduct("DA883")!, stock: 425, rules: { ...getProduct("DA883")!.rules!, lot: 5, moq: 5, caseQty: 10 } };
  render(<PurchasePanel p={product} />);
  const pieces = screen.getByLabelText("Pieces quantity");
  fireEvent.focus(pieces);
  fireEvent.change(pieces, { target: { value: "999999" } });
  expect(pieces).toHaveValue("425");
  expect(screen.getByRole("button", { name: "Increase piece" })).toBeDisabled();
  fireEvent.click(screen.getByLabelText(/Order By Case/));
  expect(screen.getByLabelText("Case quantity")).toHaveValue("42");
  expect(screen.getByRole("button", { name: "Increase case" })).toBeDisabled();
  fireEvent.change(screen.getByLabelText("Case quantity"), { target: { value: "43" } });
  expect(screen.getByLabelText("Case quantity")).toHaveValue("42");
  cleanup();
  cart.lines = [{ sku: product.sku, pieces: 400 }];
  render(<PurchasePanel p={product} />);
  fireEvent.change(screen.getByLabelText("Pieces quantity"), { target: { value: "425" } });
  expect(screen.getByLabelText("Pieces quantity")).toHaveValue("25");
});
it("uses the full stock cap when editing rather than subtracting the item being edited", () => {
  const product = { ...getProduct("DA883")!, stock: 425, rules: { ...getProduct("DA883")!.rules!, lot: 5, moq: 5, caseQty: 10 } };
  cart.lines = [{ sku: product.sku, pieces: 400 }];
  render(<PurchasePanel p={product} initialPieces={400} label="Update Cart" />);
  fireEvent.click(screen.getByLabelText(/Order By Piece/));
  fireEvent.change(screen.getByLabelText("Pieces quantity"), { target: { value: "426" } });
  expect(screen.getByLabelText("Pieces quantity")).toHaveValue("425");
});
