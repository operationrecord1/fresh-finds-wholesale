import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import type { ReactNode } from "react";
import { SalesFAQ } from "@/components/store/SalesFAQ";
vi.mock("@tanstack/react-router", () => ({ Link: ({ children, to }: { children: ReactNode; to: string }) => <a href={to}>{children}</a> }));
afterEach(cleanup);
it("answers sales questions using existing cart rules without inventing terms", () => {
  const { container } = render(<SalesFAQ />);
  expect(container.querySelectorAll("details")).toHaveLength(8);
  expect(container).toHaveTextContent("$500.00");
  expect(container).toHaveTextContent("cannot exceed the displayed stock");
  expect(container).toHaveTextContent("CSV");
  expect(container).not.toHaveTextContent("content has not been provided");
  expect(container.querySelector('a[href="/terms-of-sale"]')).toBeInTheDocument();
  expect(container.querySelector('a[href="/contact"]')).toBeInTheDocument();
  expect(screen.getByText("What is the minimum order amount?")).toBeInTheDocument();
});
