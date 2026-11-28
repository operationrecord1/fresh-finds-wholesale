import { act, cleanup, render, renderHook, screen } from "@testing-library/react";
import { StrictMode } from "react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { useDemoCouponFeedback, COUPON_ERROR_DURATION_MS } from "@/hooks/useDemoCouponFeedback";
import { DemoCouponFeedback } from "@/components/store/DemoCouponFeedback";
import { INVALID_COUPON_MESSAGE, DEMO_COUPON_SUCCESS_MESSAGE } from "@/lib/demo-coupon";

beforeEach(() => vi.useFakeTimers());
afterEach(() => { cleanup(); vi.useRealTimers(); vi.restoreAllMocks(); });

it("expires at exactly 20 seconds, including repeated identical invalid results", () => {
  const { result } = renderHook(useDemoCouponFeedback, { wrapper: StrictMode });
  expect(COUPON_ERROR_DURATION_MS).toBe(20_000);
  act(() => { result.current.applyCoupon("INVALID"); });
  expect(result.current.message).toBe(INVALID_COUPON_MESSAGE);
  act(() => vi.advanceTimersByTime(19_999));
  expect(result.current.message).toBe(INVALID_COUPON_MESSAGE);
  act(() => { result.current.applyCoupon("INVALID"); });
  act(() => vi.advanceTimersByTime(19_999));
  expect(result.current.message).toBe(INVALID_COUPON_MESSAGE);
  act(() => vi.advanceTimersByTime(1));
  expect(result.current.message).toBe("");
  expect(vi.getTimerCount()).toBe(0);
});

it("a stale callback cannot clear a successful or newer invalid result", () => {
  const scheduled = vi.spyOn(window, "setTimeout");
  const { result } = renderHook(useDemoCouponFeedback);
  act(() => { result.current.applyCoupon("WRONG"); });
  const oldCallback = scheduled.mock.calls.at(-1)?.[0];
  expect(typeof oldCallback).toBe("function");
  act(() => { result.current.applyCoupon("ARTISAN"); });
  expect(result.current.message).toBe(DEMO_COUPON_SUCCESS_MESSAGE);
  expect(vi.getTimerCount()).toBe(0);
  act(() => { if (typeof oldCallback === "function") oldCallback(); });
  expect(result.current.message).toBe(DEMO_COUPON_SUCCESS_MESSAGE);
  act(() => { result.current.applyCoupon("OTHER"); });
  act(() => { if (typeof oldCallback === "function") oldCallback(); });
  expect(result.current.message).toBe(INVALID_COUPON_MESSAGE);
  act(() => vi.advanceTimersByTime(20_000));
  expect(result.current.message).toBe("");
});

it("cleans up on unmount without affecting a different coupon field", () => {
  const first = renderHook(useDemoCouponFeedback);
  const second = renderHook(useDemoCouponFeedback);
  act(() => { first.result.current.applyCoupon(""); second.result.current.applyCoupon("BAD"); });
  expect(vi.getTimerCount()).toBe(2);
  first.unmount();
  expect(vi.getTimerCount()).toBe(1);
  expect(second.result.current.message).toBe(INVALID_COUPON_MESSAGE);
  second.unmount();
  expect(vi.getTimerCount()).toBe(0);
});

it("uses the same 15px box for empty, error and success feedback", () => {
  const { rerender } = render(<DemoCouponFeedback message="" />);
  const slot = screen.getByTestId("coupon-feedback-slot");
  expect(slot).toHaveClass("box-border", "h-[15px]", "min-h-[15px]", "max-h-[15px]", "py-[2.5px]");
  rerender(<DemoCouponFeedback message={INVALID_COUPON_MESSAGE} />);
  expect(screen.getByRole("alert")).toHaveClass("text-[10px]", "leading-[10px]", "text-red-600");
  expect(screen.getByTestId("coupon-feedback-slot")).toBe(slot);
  rerender(<DemoCouponFeedback message={DEMO_COUPON_SUCCESS_MESSAGE} />);
  expect(screen.getByRole("status")).toHaveTextContent(DEMO_COUPON_SUCCESS_MESSAGE);
  expect(screen.getByTestId("coupon-feedback-slot")).toBe(slot);
});
