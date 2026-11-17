import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import type { ReactNode } from "react";
import { HeroCarousel } from "@/components/store/HeroCarousel";

vi.mock("@tanstack/react-router", () => ({
  Link: ({ to, params, children, className }: { to: string; params?: { slug: string }; children: ReactNode; className?: string }) =>
    <a href={to.replace("$slug", params?.slug ?? "")} className={className}>{children}</a>,
}));

afterEach(cleanup);
it("sends the Pet Supplies banner to the existing category", () => {
  render(<HeroCarousel />);
  fireEvent.click(screen.getByRole("button", { name: "Banner 2: PET SUPPLIES" }));
  expect(screen.getByRole("link", { name: /SHOP NOW/ })).toHaveAttribute("href", "/category/pet-supplies");
  fireEvent.click(screen.getByRole("button", { name: "Banner 3: HOME ESSENTIALS" }));
  expect(screen.getByRole("link", { name: /SHOP NOW/ })).toHaveAttribute("href", "/collection/best-sellers");
});
