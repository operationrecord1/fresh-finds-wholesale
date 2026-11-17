import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { CartPage } from "@/routes/cart";
import type { ReactNode } from "react";

const actions = vi.hoisted(() => ({ remove: vi.fn(), clear: vi.fn() }));
vi.mock("@tanstack/react-router", () => ({
  createFileRoute: () => (config: unknown) => config,
  Link: ({ children }: { children: ReactNode }) => <a>{children}</a>,
}));
vi.mock("@/lib/cart", () => ({
  useCart: () => ({
    lines: [{ sku: "DA883", pieces: 40 }],
    subtotal: 580,
    requestRemove: actions.remove,
    requestClear: actions.clear,
  }),
}));
vi.mock("@/components/store/ProductCard", () => ({ ProductImage: () => null }));
vi.mock("@/components/store/ExpressOrder", () => ({ ExpressOrder: () => null }));
vi.mock("@/components/store/LazyQuickView", () => ({
  QuickView: ({ p }: { p: { sku: string } | null }) => p ? <output data-testid="cart-edit-open">{p.sku}</output> : null,
}));
afterEach(() => { cleanup(); vi.clearAllMocks(); });

it("retains Change quantity and Remove in their respective side-by-side action columns", () => {
  render(<CartPage />);
  const change = screen.getByRole("button", { name: /Change quantity for/ });
  const remove = screen.getByRole("button", { name: /Remove Black/ });
  expect(change.closest(".cart-quantity")).toBeInTheDocument();
  expect(remove.closest(".cart-line-total")).toBeInTheDocument();
  expect(change.closest(".cart-item")).toBe(remove.closest(".cart-item"));
  fireEvent.click(change);
  expect(screen.getByTestId("cart-edit-open")).toHaveTextContent("DA883");
  fireEvent.click(remove);
  expect(actions.remove).toHaveBeenCalledWith("DA883");
});

it("keeps a fixed-size red 10px promo error with 15px separation, without changing subtotal", () => {
  render(<CartPage />);
  const field = screen.getByRole("textbox", { name: "Promo code" });
  const slot = screen.getByTestId("coupon-feedback-slot");
  expect(slot).toHaveClass("h-[52px]");
  expect((slot.parentElement as HTMLElement).style.marginBlockEnd).toBe("15px");
  expect(slot.parentElement?.nextElementSibling).toBe(screen.getByRole("combobox", { name: "Sales representative" }));
  const apply = screen.getByRole("button", { name: "Apply" });
  for (const code of ["artisan", "ARTISAN ", "VIP8", ""]) {
    fireEvent.change(field, { target: { value: code } });
    fireEvent.click(apply);
    expect(screen.getByRole("alert")).toHaveTextContent("Enter a valid coupon code.");
    expect(screen.getByRole("alert")).toHaveClass("text-red-600", "text-[10px]", "py-[2.5px]");
    expect(screen.getByTestId("coupon-feedback-slot")).toBe(slot);
    expect(screen.getAllByText("$580.00").length).toBeGreaterThan(0);
  }
  fireEvent.change(field, { target: { value: "ARTISAN" } });
  expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  expect(screen.getByTestId("coupon-feedback-slot")).toBe(slot);
  fireEvent.click(apply);
  expect(screen.getByRole("status")).toHaveTextContent("No discount has been applied.");
  expect(screen.getByTestId("coupon-feedback-slot")).toBe(slot);
});
