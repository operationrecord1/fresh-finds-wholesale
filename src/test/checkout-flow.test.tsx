import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { Checkout } from "@/routes/checkout";

vi.mock("@tanstack/react-router", () => ({ createFileRoute: () => (config: unknown) => config, Link: ({ children }: any) => <a>{children}</a> }));
vi.mock("@/lib/cart", () => ({ useCart: () => ({ lines: [{ sku: "DA883", pieces: 40 }], subtotal: 580 }) }));

afterEach(() => { cleanup(); vi.useRealTimers(); vi.restoreAllMocks(); });

function readyCheckout() {
  render(<Checkout />);
  const firstName = screen.getByRole("textbox", { name: "First Name *" });
  const form = firstName.closest("form")!;
  expect(form.checkValidity()).toBe(false);
  for (const input of form.querySelectorAll<HTMLInputElement>("input[required]")) {
    const label = input.closest("label")?.textContent ?? "";
    const value = label.includes("Email") ? "demo@example.com" : label.includes("Telephone") ? "7272255768" : label.includes("Zip") ? "33702" : "Demo";
    fireEvent.change(input, { target: { value } });
  }
  expect(form.checkValidity()).toBe(true);
  return { form, firstName };
}

it("keeps phone and both ZIP inputs numeric-only even for pasted text", () => {
  readyCheckout();
  const phone = screen.getByRole("textbox", { name: "Telephone *" });
  const zip = screen.getByRole("textbox", { name: "Zip *" });
  fireEvent.input(phone, { target: { value: "727abc225-5768" } });
  fireEvent.input(zip, { target: { value: "33x7z02" } });
  expect(phone).toHaveValue("7272255768");
  expect(zip).toHaveValue("33702");
  fireEvent.click(screen.getByLabelText("Ship to the same address"));
  const shippingZip = screen.getAllByRole("textbox", { name: "Zip *" })[1]!;
  fireEvent.input(shippingZip, { target: { value: "1a2b345" } });
  expect(shippingZip).toHaveValue("12345");
});

it("accepts only uppercase ARTISAN without adding a discount and retains a fixed error slot", () => {
  const { form } = readyCheckout();
  const slot = screen.getByTestId("coupon-feedback-slot");
  expect(slot).toHaveClass("h-[15px]");
  expect(screen.getByPlaceholderText("Comments")).toHaveClass("mt-0", "block");
  expect(slot).toHaveClass("py-[2.5px]");
  expect(screen.queryByText("Print")).not.toBeInTheDocument();
  const coupon = screen.getByRole("textbox", { name: "Coupon code" });
  for (const bad of ["artisan", "ARTISAN ", "VIP8", ""]) {
    fireEvent.change(coupon, { target: { value: bad } });
    fireEvent.click(screen.getByRole("button", { name: "Apply" }));
    expect(screen.getByRole("alert")).toHaveTextContent("Enter a valid coupon code.");
    expect(screen.getByRole("alert")).toHaveClass("text-red-600", "text-[10px]", "leading-[10px]");
    expect(screen.getByTestId("coupon-feedback-slot")).toBe(slot);
    expect(form).toHaveTextContent("$580.00");
  }
  fireEvent.change(coupon, { target: { value: "ARTISAN" } });
  fireEvent.click(screen.getByRole("button", { name: "Apply" }));
  expect(screen.getByRole("status")).toHaveTextContent("No discount has been applied.");
  expect(screen.getByTestId("coupon-feedback-slot")).toBe(slot);
  expect(form).toHaveTextContent("$580.00");
});

it.each(["card", "wire"] as const)("shows a demo loading animation and honest confirmation with %s selected", async method => {
  const { form, firstName } = readyCheckout();
  const network = vi.spyOn(globalThis, "fetch");
  if (method === "wire") fireEvent.click(screen.getByRole("radio", { name: /Wire Transfer/ }));
  else for (const [label, value] of [["Name on card", "Demo Customer"], ["Card number", "4242424242424242"], ["Expiry date", "12/39"], ["Security code", "123"]] as const) {
    fireEvent.change(screen.getByLabelText(label), { target: { value } });
  }
  if (method === "card") expect(screen.getByAltText("Visa")).toBeInTheDocument();
  fireEvent.submit(form);
  expect(screen.getByRole("dialog")).toHaveTextContent("Processing your order...");
  expect(form.querySelector<HTMLButtonElement>('button[type="submit"]')).toBeDisabled();
  if (method === "card") expect(screen.getByLabelText("Card number")).toHaveValue("");
  await waitFor(() => expect(screen.getByRole("dialog")).toHaveTextContent("Thank You for Your Purchase!"), { timeout: 4000 });
  expect(screen.getByRole("dialog")).toHaveTextContent("Demo confirmation only. No real order was placed and no payment was processed.");
  expect(network).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole("button", { name: "Return to checkout" }));
  await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  expect(firstName).toHaveValue("Demo");
  expect(screen.getByText("DA883 × 40")).toBeInTheDocument();
  expect(form.querySelector('[autocomplete="cc-number"]')).toBeNull();
});


it("restarts a full 20-second error on every Apply and immediately accepts ARTISAN", () => {
  vi.useFakeTimers();
  readyCheckout();
  const field = screen.getByRole("textbox", { name: "Coupon code" });
  const apply = screen.getByRole("button", { name: "Apply" });
  const slot = screen.getByTestId("coupon-feedback-slot");
  fireEvent.change(field, { target: { value: "invalid" } });
  fireEvent.click(apply);
  expect(screen.getByRole("alert")).toHaveTextContent("Enter a valid coupon code.");
  act(() => vi.advanceTimersByTime(10_000));
  fireEvent.change(field, { target: { value: "another" } });
  expect(screen.getByRole("alert")).toBeInTheDocument();
  fireEvent.click(apply);
  act(() => vi.advanceTimersByTime(19_999));
  expect(screen.getByRole("alert")).toBeInTheDocument();
  act(() => vi.advanceTimersByTime(1));
  expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  expect(screen.getByTestId("coupon-feedback-slot")).toBe(slot);
  fireEvent.click(apply);
  expect(screen.getByRole("alert")).toBeInTheDocument();
  fireEvent.change(field, { target: { value: "ARTISAN" } });
  fireEvent.click(apply);
  expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  expect(screen.getByRole("status")).toHaveTextContent("No discount has been applied.");
  act(() => vi.advanceTimersByTime(20_000));
  expect(screen.getByRole("status")).toHaveTextContent("No discount has been applied.");
  expect(screen.getByTestId("coupon-feedback-slot")).toBe(slot);
});
