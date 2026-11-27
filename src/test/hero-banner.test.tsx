import { act, cleanup, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import type { ReactNode } from "react";
import { HeroCarousel } from "@/components/store/HeroCarousel";

vi.mock("@tanstack/react-router", () => ({
  Link: ({ to, params, children, className }: { to: string; params?: { slug: string }; children: ReactNode; className?: string }) =>
    <a href={to.replace("$slug", params?.slug ?? "")} className={className}>{children}</a>,
}));

afterEach(cleanup);
it("shows passive banner indicators without manual controls", () => {
  render(<HeroCarousel />);
  expect(screen.queryByRole("button", { name: /banner/i })).not.toBeInTheDocument();
  expect(screen.getByLabelText("Banner 1: Good connections. Better possibilities.")).toHaveAttribute("aria-current", "true");
});

it("rotates all three banners every ten seconds and loops", () => {
  vi.useFakeTimers();
  try {
    render(<HeroCarousel />);
    const current = () => document.querySelector('.merch-dots [aria-current="true"]')?.getAttribute("aria-label");
    expect(current()).toContain("Banner 1:");
    for (const next of [2, 3, 1]) {
      act(() => vi.advanceTimersByTime(9999));
      expect(current()).not.toContain(`Banner ${next}:`);
      act(() => vi.advanceTimersByTime(1));
      expect(current()).toContain(`Banner ${next}:`);
    }
  } finally {
    vi.useRealTimers();
  }
});
