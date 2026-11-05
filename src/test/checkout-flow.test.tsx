import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { Checkout } from "@/routes/checkout";
vi.mock("@tanstack/react-router", () => ({ createFileRoute: () => (config: unknown) => config, Link: ({children}: any) => <a>{children}</a> }));
vi.mock("@/lib/cart", () => ({ useCart: () => ({lines: [{sku: "DA883", pieces: 40}], subtotal: 580}) }));
afterEach(cleanup);
it("offers only the two methods and preserves checkout details after both failure flows", () => {
  render(<Checkout />);
  expect(screen.getAllByRole("radio")).toHaveLength(2);
  const firstName = screen.getByRole("textbox", {name: "First Name *"});
  fireEvent.change(firstName, {target: {value: "Test"}});
  const form = firstName.closest("form")!;
  expect(form.checkValidity()).toBe(false);
  for (const input of form.querySelectorAll<HTMLInputElement>('input[required]')) fireEvent.change(input, {target:{value:input.type === "email" ? "test@example.com" : "Test"}});
  expect(form.checkValidity()).toBe(true);
  for (const method of screen.getAllByRole("radio")) {
    fireEvent.click(method);
    fireEvent.submit(form);
    expect(screen.getByRole("dialog")).toHaveTextContent("Unable to complete payment");
    fireEvent.click(screen.getByRole("button", {name: "Return to checkout"}));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(firstName).toHaveValue("Test");
    expect(screen.getByText("DA883 × 40")).toBeInTheDocument();
  }
  expect(form.querySelector('[autocomplete="cc-number"]')).toBeNull();
});
