import { act, renderHook } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { useIncrementalProducts } from "@/lib/useIncrementalProducts";
afterEach(() => vi.unstubAllGlobals());
it("loads capped batches, resets for new results, and preserves count on ordinary rerenders", () => {
  vi.stubGlobal("IntersectionObserver", undefined);
  const { result, rerender } = renderHook(({key}) => useIncrementalProducts(55, key), {initialProps:{key:"all"}});
  expect(result.current.count).toBe(24);
  act(() => result.current.loadMore());
  expect(result.current.count).toBe(48);
  rerender({key:"all"});
  expect(result.current.count).toBe(48);
  act(() => result.current.loadMore());
  expect(result.current.count).toBe(55);
  expect(result.current.hasMore).toBe(false);
  rerender({key:"filtered"});
  expect(result.current.count).toBe(24);
});
it("does not advertise more products for an empty or short result", () => {
  const {result} = renderHook(() => useIncrementalProducts(7, "short"));
  expect(result.current.count).toBe(7);
  expect(result.current.hasMore).toBe(false);
});
