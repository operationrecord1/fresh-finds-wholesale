import { useEffect, useId, useRef, useState } from "react";
import { US_STATES } from "@/lib/us-address";

export type AddressSuggestion = { line1:string; city:string; state:string; postal_code:string; label:string };
type Result = {country_code?:string;housenumber?:string;street?:string;address_line1?:string;city?:string;town?:string;village?:string;state_code?:string;postcode?:string;formatted?:string};
export function addressSuggestions(results:Result[]):AddressSuggestion[]{
 return results.filter(r=>r.country_code==="us"&&r.street&&r.housenumber&&US_STATES.includes(r.state_code??"")).map(r=>({
  line1:`${r.housenumber} ${r.street}`,city:r.city||r.town||r.village||"",state:r.state_code!,postal_code:r.postcode||"",
  label:r.formatted||`${r.housenumber} ${r.street}, ${r.city||""}, ${r.state_code} ${r.postcode||""}`,
 })).filter((r,i,all)=>all.findIndex(a=>a.label===r.label)===i);
}

export function AddressAutocomplete({name,value,onChange,onSelect,inputClass,apiKey=import.meta.env["VITE_ARTISAN_GEOAPIFY_KEY"]}:{name:string;value:string;onChange:(name:string,value:string)=>void;onSelect:(address:AddressSuggestion)=>void;inputClass:string;apiKey?:string}){
 const id=useId();
 const [focused,setFocused]=useState(false);
 const [items,setItems]=useState<AddressSuggestion[]>([]);
 const [active,setActive]=useState(-1);
 const [status,setStatus]=useState("");
 const selected=useRef("");
 const dismissed=useRef("");
 const open=focused&&!!apiKey&&(items.length>0||!!status);
 useEffect(()=>{
  setItems([]);setActive(-1);setStatus("");
  const query=value.trim();
  if(!focused||!apiKey||query.length<5||value===selected.current||value===dismissed.current)return;
  const controller=new AbortController();
  const timer=setTimeout(async()=>{
   setStatus("Looking up addresses…");
   try{
    const params=new URLSearchParams({text:query,filter:"countrycode:us",format:"json",lang:"en",limit:"5",apiKey});
    const response=await fetch(`https://api.geoapify.com/v1/geocode/autocomplete?${params}`,{signal:controller.signal});
    if(!response.ok)throw Error("Address lookup unavailable");
    const data=await response.json();
    if(controller.signal.aborted)return;
    const suggestions=addressSuggestions(Array.isArray(data.results)?data.results:[]);
    setItems(suggestions);setStatus(suggestions.length?"":"No matching address. You can enter it manually.");
   }catch{if(!controller.signal.aborted)setStatus("Address suggestions unavailable. You can enter it manually.");}
  },400);
  return()=>{clearTimeout(timer);controller.abort();};
 },[value,focused,apiKey]);
 const choose=(item:AddressSuggestion)=>{selected.current=item.line1;dismissed.current=item.line1;setItems([]);setStatus("");setActive(-1);onSelect(item);};
 return <div className="checkout-address">
  <label htmlFor={id} className="block text-sm font-medium text-foreground">Street address <span className="text-destructive">*</span></label>
  <div className="checkout-address-control">
  <input id={id} name={name} value={value} required maxLength={240} className={inputClass} autoComplete={apiKey?"off":`section-${name.startsWith("shipping_")?"delivery shipping":"billing billing"} address-line1`}
   role="combobox" aria-autocomplete="list" aria-expanded={open} aria-controls={open?`${id}-list`:undefined} aria-activedescendant={open&&active>=0?`${id}-${active}`:undefined}
   onFocus={()=>setFocused(true)} onBlur={()=>{setFocused(false);setItems([]);setStatus("");}}
   onChange={e=>{setFocused(true);dismissed.current="";selected.current="";onChange(name,e.target.value);}}
   onKeyDown={e=>{
    if(e.key==="Escape"){dismissed.current=value;setFocused(false);setItems([]);setStatus("");e.preventDefault();}
    else if(items.length&&(e.key==="ArrowDown"||e.key==="ArrowUp")){e.preventDefault();setActive(i=>e.key==="ArrowDown"?(i+1)%items.length:(i<=0?items.length-1:i-1));}
    else if(open&&active>=0&&e.key==="Enter"){e.preventDefault();const item=items[active];if(item)choose(item);}
   }}/>
  {open&&<div className="checkout-address-menu">
   <ul id={`${id}-list`} role="listbox" aria-label="Suggested US addresses">
    {items.map((item,index)=><li key={item.label} id={`${id}-${index}`} role="option" aria-selected={index===active} onPointerDown={e=>e.preventDefault()} onClick={()=>choose(item)}>{item.label}</li>)}
   </ul>
   {status&&<p role="status">{status}</p>}
  </div>}
  </div>
  {apiKey&&<div className="checkout-address-credit">Address suggestions: <a href="https://www.geoapify.com/" target="_blank" rel="noopener noreferrer">Geoapify</a> · <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a></div>}
 </div>;
}
