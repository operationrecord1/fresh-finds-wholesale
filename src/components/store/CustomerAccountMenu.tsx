import { Link, useNavigate } from "@tanstack/react-router";
import { ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { artisanSupabase, useArtisanAuth } from "@/lib/artisan-auth";

/** Standalone account menu; all product navigation remains unchanged. */
export function CustomerAccountMenu(){
  const {user,ready,signOut}=useArtisanAuth();
  const navigate=useNavigate();
  const [signingOut,setSigningOut]=useState(false);
  const [open,setOpen]=useState(false);
  const [profileName,setProfileName]=useState("");
  const area=useRef<HTMLDivElement>(null);
  useEffect(()=>{
    setProfileName("");
    setOpen(false);
    if(!user||!artisanSupabase)return;
    let active=true;
    const fetchName=()=>{
      Promise.resolve(artisanSupabase!.from("artisan_profiles").select("first_name,last_name")
       .eq("user_id",user.id).maybeSingle()).then(({data,error})=>{
         if(!active||error||!data)return;
         setProfileName([data.first_name,data.last_name].filter(Boolean).join(" ").trim());
       }).catch(()=>{ /* Retain the known auth identity if profile read fails. */ });
    };
    fetchName();
    window.addEventListener("artisan-customer-profile-updated",fetchName);
    return()=>{active=false;window.removeEventListener("artisan-customer-profile-updated",fetchName);};
  },[user?.id]);
  useEffect(()=>{
    if(!open)return;
    const outside=(e:PointerEvent)=>{if(!area.current?.contains(e.target as Node))setOpen(false);};
    const escape=(e:KeyboardEvent)=>{if(e.key==="Escape")setOpen(false);};
    document.addEventListener("pointerdown",outside);
    document.addEventListener("keydown",escape);
    return()=>{document.removeEventListener("pointerdown",outside);document.removeEventListener("keydown",escape);};
  },[open]);
  if(!ready)return <span role="status" aria-label="Checking account" className="store-login-link">Account</span>;
  if(!user)return <Link to="/login" className="store-login-link"><span className="store-login-desktop">Login Or <br/>Register</span><span className="store-login-mobile">Login</span></Link>;
  const name=profileName||[user.user_metadata?.["first_name"],user.user_metadata?.["last_name"]].filter(Boolean).join(" ").trim()||user.email?.split("@")[0]||"My Account";
  return <div className="relative" ref={area}>
    <button type="button" aria-haspopup="menu" aria-expanded={open} aria-controls="artisan-customer-menu"
      className="store-login-link flex items-center gap-1" onClick={()=>setOpen(v=>!v)}>
      <span className="max-w-[150px] truncate">{name}</span><ChevronDown size={15} aria-hidden="true"/>
    </button>
    {open&&<div id="artisan-customer-menu" role="menu"
      className="absolute right-0 top-full z-50 mt-2 min-w-[170px] rounded-lg border border-border bg-card p-2 shadow-lg">
      <Link role="menuitem" to="/account" onClick={()=>setOpen(false)}
        className="block rounded px-3 py-2 text-sm text-primary hover:bg-muted">My Account</Link>
      <button type="button" role="menuitem"
        className="block w-full rounded px-3 py-2 text-left text-sm text-primary hover:bg-muted"
        disabled={signingOut} aria-busy={signingOut}
        onClick={async()=>{
         if(signingOut)return;
         setSigningOut(true);setOpen(false);
         try{await signOut();await navigate({to:"/login"});}
         catch{toast.error("Could not sign out. Please try again.");}
         finally{setSigningOut(false);}
        }}>Logout</button>
    </div>}
  </div>;
}
