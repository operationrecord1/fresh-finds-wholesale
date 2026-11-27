import { cleanup, fireEvent, render, screen, act } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { useState } from "react";
import { AddressAutocomplete, addressSuggestions } from "@/components/store/AddressAutocomplete";
const result={country_code:"us",housenumber:"511",street:"Larchwood Avenue",city:"Upper Darby",state_code:"PA",postcode:"19082",formatted:"511 Larchwood Avenue, Upper Darby, PA 19082"};
afterEach(()=>{cleanup();vi.useRealTimers();vi.unstubAllGlobals();});
function Harness({onSelect=vi.fn()}:{onSelect?:(address:unknown)=>void}){const [value,setValue]=useState("");return <AddressAutocomplete name="line1" value={value} inputClass="" apiKey="test-key" onChange={(_,v)=>setValue(v)} onSelect={a=>{setValue(a.line1);onSelect(a);}}/>;}
it("keeps only US street addresses and maps their city, state and ZIP",()=>{expect(addressSuggestions([result,{...result,country_code:"ca"},{...result,housenumber:""},result])).toEqual([{line1:"511 Larchwood Avenue",city:"Upper Darby",state:"PA",postal_code:"19082",label:result.formatted}]);});
it("debounces a US lookup and selects the whole address with the keyboard",async()=>{
 vi.useFakeTimers();const fetcher=vi.fn().mockResolvedValue({ok:true,json:async()=>({results:[result]})});vi.stubGlobal("fetch",fetcher);const selected=vi.fn();render(<Harness onSelect={selected}/>);
 const input=screen.getByRole("combobox");fireEvent.focus(input);fireEvent.change(input,{target:{value:"511 Larchwood"}});
 await act(async()=>{await vi.advanceTimersByTimeAsync(399);});expect(fetcher).not.toHaveBeenCalled();
 await act(async()=>{await vi.advanceTimersByTimeAsync(1);});expect(fetcher.mock.calls[0]?.[0]).toContain("filter=countrycode%3Aus");
 fireEvent.keyDown(input,{key:"ArrowDown"});fireEvent.keyDown(input,{key:"Enter"});expect(selected).toHaveBeenCalledWith(expect.objectContaining({city:"Upper Darby",state:"PA",postal_code:"19082"}));expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
});
it("aborts stale lookups when the field changes or loses focus",async()=>{
 vi.useFakeTimers();let resolve!:(value:unknown)=>void;const fetcher=vi.fn().mockImplementation(()=>new Promise(r=>{resolve=r;}));vi.stubGlobal("fetch",fetcher);render(<Harness/>);const input=screen.getByRole("combobox");fireEvent.focus(input);fireEvent.change(input,{target:{value:"511 Larchwood"}});await act(async()=>{await vi.advanceTimersByTimeAsync(400);});
 fireEvent.change(input,{target:{value:"123 Main"}});expect(fetcher.mock.calls[0]?.[1].signal.aborted).toBe(true);
 await act(async()=>{resolve({ok:true,json:async()=>({results:[result]})});});expect(screen.queryByRole("option")).not.toBeInTheDocument();
 fireEvent.blur(input);await act(async()=>{await vi.advanceTimersByTimeAsync(500);});expect(fetcher).toHaveBeenCalledTimes(1);
});
it("allows manual entry after a provider failure and dismisses with Escape",async()=>{
 vi.useFakeTimers();vi.stubGlobal("fetch",vi.fn().mockRejectedValue(Error("offline")));render(<Harness/>);const input=screen.getByRole("combobox");fireEvent.focus(input);fireEvent.change(input,{target:{value:"123 Main"}});await act(async()=>{await vi.advanceTimersByTimeAsync(400);});expect(screen.getByRole("status")).toHaveTextContent("enter it manually");fireEvent.keyDown(input,{key:"Escape"});expect(input).toHaveValue("123 Main");expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
});
