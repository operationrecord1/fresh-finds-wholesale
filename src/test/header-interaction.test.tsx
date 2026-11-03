import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { beforeEach, afterEach, expect, it, vi } from "vitest";
import { SiteHeader } from "@/components/store/SiteHeader";
vi.mock("@tanstack/react-router", () => ({
  Link: ({ children, to, params, search, ...props }: any) => <a href={to} {...props}>{children}</a>,
  useNavigate: () => vi.fn(),
}));
vi.mock("@/lib/cart", () => ({ useCart: () => ({ lines: [] }) }));
beforeEach(() => {
  vi.stubGlobal("ResizeObserver", class { observe() {} disconnect() {} });
  vi.stubGlobal("matchMedia", () => ({ matches: true }));
  Object.defineProperty(document, "fonts", { configurable: true, value: { ready: Promise.resolve() } });
});
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });
function move(target: Element) {
  const event = new Event("pointermove", { bubbles: true });
  Object.defineProperty(event, "pointerType", { value: "mouse" });
  fireEvent(target, event);
}
it("switches repeatedly between disclosures and closes outside their own region", () => {
  render(<SiteHeader />);
  const categories = screen.getByRole("button", { name: "Categories" });
  const price = screen.getByRole("button", { name: "Shop By Price" });
  const knowledge = screen.getByRole("button", { name: "Knowledge Center" });
  for (let i = 0; i < 5; i++) {
    for (const trigger of [categories, price, knowledge]) {
      move(trigger);
      expect(trigger).toHaveAttribute("aria-expanded", "true");
      move(document.querySelector("#store-dropdown")!);
      expect(trigger).toHaveAttribute("aria-expanded", "true");
      move(screen.getByRole("search"));
      expect(trigger).toHaveAttribute("aria-expanded", "false");
    }
    move(categories); move(price);
    expect(categories).toHaveAttribute("aria-expanded", "false");
    expect(price).toHaveAttribute("aria-expanded", "true");
  }
});
it("supports keyboard toggle and Escape dismissal", () => {
  render(<SiteHeader />);
  const trigger = screen.getByRole("button", { name: "Knowledge Center" });
  fireEvent.click(trigger, { detail: 0 });
  expect(trigger).toHaveAttribute("aria-expanded", "true");
  fireEvent.keyDown(document, { key: "Escape" });
  expect(trigger).toHaveAttribute("aria-expanded", "false");
});
