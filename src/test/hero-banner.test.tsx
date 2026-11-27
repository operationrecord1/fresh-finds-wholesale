import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import type { ReactNode } from "react";
import { HeroCarousel } from "@/components/store/HeroCarousel";

vi.mock("@tanstack/react-router", () => ({
  Link: ({ to, params, children, className }: { to: string; params?: { slug: string }; children: ReactNode; className?: string }) =>
    <a href={to.replace("$slug", params?.slug ?? "")} className={className}>{children}</a>,
}));

afterEach(()=>{cleanup();vi.useRealTimers();vi.restoreAllMocks();});
it("sends the Pet Supplies banner to the existing category", () => {
  render(<HeroCarousel />);
  fireEvent.click(screen.getByRole("button", { name: "Banner 2: PET SUPPLIES" }));
  expect(screen.getByRole("link", { name: /SHOP NOW/ })).toHaveAttribute("href", "/category/pet-supplies");
  fireEvent.click(screen.getByRole("button", { name: "Banner 3: HOME ESSENTIALS" }));
  expect(screen.getByRole("link", { name: /SHOP NOW/ })).toHaveAttribute("href", "/collection/best-sellers");
});

it("automatically advances every ten seconds, loops, and removes arrows",()=>{
 vi.useFakeTimers();
 render(<HeroCarousel />);
 const selected=(n:number)=>expect(screen.getByRole("button",{name:new RegExp("^Banner "+n+":")})).toHaveAttribute("aria-pressed","true");
 selected(1);
 expect(screen.queryByRole("button",{name:"Previous banner"})).not.toBeInTheDocument();
 expect(screen.queryByRole("button",{name:"Next banner"})).not.toBeInTheDocument();
 for(const next of [2,3,1,2]){
  act(()=>vi.advanceTimersByTime(9999));
  selected(next===1?3:next-1);
  act(()=>vi.advanceTimersByTime(1));
  selected(next);
 }
});
it("cleans up timers and starts a fresh ten-second period after manual selection",()=>{
 vi.useFakeTimers();
 const {unmount}=render(<HeroCarousel />);
 act(()=>vi.advanceTimersByTime(5000));
 fireEvent.click(screen.getByRole("button",{name:"Banner 2: PET SUPPLIES"}));
 act(()=>vi.advanceTimersByTime(9999));
 expect(screen.getByRole("button",{name:"Banner 2: PET SUPPLIES"})).toHaveAttribute("aria-pressed","true");
 act(()=>vi.advanceTimersByTime(1));
 expect(screen.getByRole("button",{name:"Banner 3: HOME ESSENTIALS"})).toHaveAttribute("aria-pressed","true");
 unmount();
 expect(vi.getTimerCount()).toBe(0);
});
it("pauses while hidden and resumes a full interval without duplicate timers",()=>{
 vi.useFakeTimers();
 let hidden=true;
 const listeners=new Set<()=>void>();
 vi.spyOn(window,"matchMedia").mockImplementation(query=>({get matches(){return hidden;},media:query,onchange:null,addListener:()=>{},removeListener:()=>{},addEventListener:(_type:string,fn:EventListenerOrEventListenerObject)=>listeners.add(fn as ()=>void),removeEventListener:(_type:string,fn:EventListenerOrEventListenerObject)=>listeners.delete(fn as ()=>void),dispatchEvent:()=>true}) as MediaQueryList);
 const change=(next:boolean)=>act(()=>{hidden=next;listeners.forEach(fn=>fn());});
 const selected=(n:number)=>expect(screen.getByRole("button",{name:new RegExp("^Banner "+n+":")})).toHaveAttribute("aria-pressed","true");
 render(<HeroCarousel />);
 act(()=>vi.advanceTimersByTime(30000));selected(1);
 change(false);act(()=>vi.advanceTimersByTime(5000));
 change(true);act(()=>vi.advanceTimersByTime(30000));selected(1);
 change(false);act(()=>vi.advanceTimersByTime(9999));selected(1);
 act(()=>vi.advanceTimersByTime(1));selected(2);
 expect(listeners.size).toBe(1);
});
