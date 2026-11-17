import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { afterEach, expect, it, vi } from "vitest";
import { act } from "react";
import { PaymentDetails, cardError, isSupportedDemoCardLength, type PaymentDetailsHandle } from "@/components/store/PaymentDetails";
vi.mock("@tanstack/react-router", () => ({Link: ({children,to}: any) => <a href={to}>{children}</a>}));
afterEach(cleanup);
it("validates checksum, expiry boundaries and card-specific security codes", () => {
  const now=new Date(2026,10,6);
  expect(cardError("4242424242424242","11/26","123",now)).toEqual({number:"",expiry:"",cvv:""});
  expect(cardError("4242424242424241","10/26","12",now).number).toBeTruthy();
  expect(cardError("4242424242424242","10/26","123",now).expiry).toBeTruthy();
  expect(cardError("378282246310005","12/39","1234",now).cvv).toBe("");
  expect(cardError("0000000000000000","13/39","123",now).number).toBeTruthy();
});
it("keeps values out of form submission and storage, clears them after validation and on pagehide", () => {
  const ref=createRef<PaymentDetailsHandle>();
  const storage=vi.spyOn(Storage.prototype,"setItem");
  const fetchSpy=vi.spyOn(globalThis,"fetch");
  const {container}=render(<form><PaymentDetails ref={ref} method="card"/></form>);
  act(()=>{expect(ref.current!.validate()).toBe(false)});
  expect(screen.getByText("Enter a valid card number.")).toBeInTheDocument();
  for(const [label,value] of [["Name on card","Test Customer"],["Card number","4242424242424242"],["Expiry date","12/39"],["Security code","123"]]) fireEvent.change(screen.getByLabelText(label),{target:{value}});
  expect(screen.getByLabelText("Card number")).toHaveValue("4242 4242 4242 4242");
  act(()=>{expect(ref.current!.validate()).toBe(true)});
  expect(Array.from(new FormData(container.querySelector("form")!).entries())).toEqual([]);
  expect(storage).not.toHaveBeenCalled();expect(fetchSpy).not.toHaveBeenCalled();
  act(()=>ref.current!.clear());
  expect(screen.getByLabelText("Security code")).toHaveValue("");
  fireEvent.change(screen.getByLabelText("Card number"),{target:{value:"4242424242424242"}});
  fireEvent(window,new Event("pagehide"));
  expect(screen.getByLabelText("Card number")).toHaveValue("");
  vi.restoreAllMocks();
});

it("renders the three local payment logos in reference order before, during and after input", () => {
  const ref = createRef<PaymentDetailsHandle>();
  const { container } = render(<PaymentDetails ref={ref} method="card" />);
  const badges = container.querySelectorAll('[aria-label="Supported card brands"] img');
  expect(badges).toHaveLength(3);
  expect(Array.from(badges).map(img => img.getAttribute("alt"))).toEqual(["Visa", "Mastercard", "American Express"]);
  expect(Array.from(badges).map(img => img.getAttribute("src"))).toEqual([
    expect.stringContaining("images/payment/visa.png"),
    expect.stringContaining("images/payment/mastercard.png"),
    expect.stringContaining("images/payment/amex.png"),
  ]);
  fireEvent.change(screen.getByLabelText("Card number"), { target: { value: "5555555555554444" } });
  expect(screen.getByAltText("Visa")).toBeInTheDocument();
  expect(screen.getByAltText("Mastercard")).toBeInTheDocument();
  expect(screen.getByAltText("American Express")).toBeInTheDocument();
  act(() => ref.current!.clear());
  expect(screen.getByLabelText("Card number")).toHaveValue("");
  expect(container.querySelectorAll('[aria-label="Supported card brands"] img')).toHaveLength(3);
});

it("accepts supported Visa, Mastercard and Amex lengths while preserving the 19-digit input limit", () => {
  const now = new Date(2026, 10, 6);
  for (const [number, cvv] of [
    ["4222222222222", "123"], ["4242424242424242", "123"],
    ["4000000000000000006", "123"], ["5555555555554444", "123"],
    ["2221000000000009", "123"], ["378282246310005", "1234"],
  ]) {
    expect(isSupportedDemoCardLength(number)).toBe(true);
    expect(cardError(number, "12/39", cvv, now).number).toBe("");
  }
  for (const number of ["411111111111111", "555555555555444", "3782822463100050", "6011111111111117"]) {
    expect(isSupportedDemoCardLength(number)).toBe(false);
  }
  render(<PaymentDetails method="card" />);
  fireEvent.change(screen.getByLabelText("Card number"), { target: { value: "40000000000000000061234" } });
  expect(screen.getByLabelText("Card number")).toHaveValue("4000 0000 0000 0000 006");
});
