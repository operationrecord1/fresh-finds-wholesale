import { createClient, type User } from "@supabase/supabase-js";
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

const url = import.meta.env.VITE_ARTISAN_SUPABASE_URL as string | undefined;
const key = import.meta.env.VITE_ARTISAN_SUPABASE_PUBLISHABLE_KEY as string | undefined;

// The project URL and publishable key are safe for browsers; the private
// service-role key is NEVER bundled here.
export const artisanSupabase = url && key
 ? createClient(url,key,{
   auth:{
     autoRefreshToken:true,
     persistSession:true,
     detectSessionInUrl:true,
     flowType:"pkce",
     storageKey:"artisanmart-customer-auth",
   },
 })
 : null;

type AuthState = {
 user: User | null;
 ready: boolean;
 recovery: boolean;
 signOut: () => Promise<void>;
};

const Context = createContext<AuthState | null>(null);

export function ArtisanAuthProvider({children}:{children:ReactNode}) {
 const [user,setUser] = useState<User|null>(null);
 const [ready,setReady] = useState(false);
 const [recovery,setRecovery] = useState(false);
 useEffect(()=>{
  if(!artisanSupabase){setReady(true);return;}
  let alive=true;
  const {data:{subscription}}=artisanSupabase.auth.onAuthStateChange((event,session)=>{
   if(!alive)return;
   setUser(session?.user??null);
   if(event==="PASSWORD_RECOVERY")setRecovery(true);
   if(event==="SIGNED_OUT")setRecovery(false);
   setReady(true);
  });
  artisanSupabase.auth.getUser().then(({data,error})=>{
   if(!alive)return;
   if(!error)setUser(data.user??null);
  }).finally(()=>{if(alive)setReady(true);});
  return()=>{alive=false;subscription.unsubscribe();};
 },[]);
 const value=useMemo<AuthState>(()=>({
  user,ready,recovery,
  signOut:async()=>{
   if(!artisanSupabase)throw new Error("Customer authentication is not configured.");
   const {error}=await artisanSupabase.auth.signOut({scope:"global"});
   if(error)throw error;
   setUser(null);
  },
 }),[user,ready,recovery]);
 return <Context.Provider value={value}>{children}</Context.Provider>;
}

export function useArtisanAuth():AuthState {
 const value=useContext(Context);
 if(!value)throw new Error("ArtisanAuthProvider missing");
 return value;
}
