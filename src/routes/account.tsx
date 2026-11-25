import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { artisanSupabase, useArtisanAuth } from "@/lib/artisan-auth";

export const Route = createFileRoute("/account")({
 head:()=>({meta:[{title:"My Account | Artisan Mart"},{name:"description",content:"Review your Artisan Mart customer account."}]}),
 component: Account,
});

type Profile = {first_name:string;last_name:string;phone:string;newsletter_opt_in:boolean};
function Account(){
 const {user,ready,signOut}=useArtisanAuth();
 const navigate=useNavigate();
 const [profile,setProfile]=useState<Profile|null>(null);
 const [message,setMessage]=useState("");
 const [busy,setBusy]=useState(false);
 useEffect(()=>{
  setProfile(null);
  setMessage("");
  if(!user||!artisanSupabase)return;
  let alive=true;
  artisanSupabase.from("artisan_profiles")
   .select("first_name,last_name,phone,newsletter_opt_in")
   .eq("user_id",user.id).single()
   .then(({data,error})=>{
    if(!alive)return;
    if(error)setMessage("Could not load your account details.");
    else setProfile(data as Profile);
   });
  return()=>{alive=false};
 },[user?.id]);
 if(!ready)return <div className="mx-auto max-w-3xl p-8" role="status">Loading your account...</div>;
 if(!user)return <div className="mx-auto max-w-3xl p-8"><h1 className="text-2xl font-bold">My Account</h1><p className="mt-4">Please sign in to view your account.</p><Link to="/login" className="text-primary underline">Sign in</Link></div>;
 const save=async(e:FormEvent<HTMLFormElement>)=>{
  e.preventDefault();
  if(!artisanSupabase||!profile||busy)return;
  setBusy(true);setMessage("");
  const {error}=await artisanSupabase.from("artisan_profiles")
   .update({first_name:profile.first_name,last_name:profile.last_name,phone:profile.phone,
    newsletter_opt_in:profile.newsletter_opt_in})
   .eq("user_id",user.id);
  setMessage(error?"Could not save account details.":"Your account details were saved.");
  setBusy(false);
 };
 return <main className="mx-auto max-w-[920px] px-4 py-8">
  <h1 className="text-3xl font-bold text-title">My Account</h1>
  <p className="mt-2 text-sm text-muted-foreground">Signed in as {user.email}</p>
  <section className="mt-6 rounded-xl border bg-card p-6">
   <h2 className="mb-4 text-xl font-bold">Contact information</h2>
   {!profile?<p role="status">Loading your profile...</p>:
   <form className="grid gap-4" onSubmit={save}>
    <label>First name <input className="mt-1 block w-full rounded border p-2" value={profile.first_name} maxLength={120}
     onChange={e=>setProfile({...profile,first_name:e.target.value})}/></label>
    <label>Last name <input className="mt-1 block w-full rounded border p-2" value={profile.last_name} maxLength={120}
     onChange={e=>setProfile({...profile,last_name:e.target.value})}/></label>
    <label>Phone <input className="mt-1 block w-full rounded border p-2" value={profile.phone} maxLength={40}
     onChange={e=>setProfile({...profile,phone:e.target.value})}/></label>
    <label className="flex items-center gap-2"><input type="checkbox" checked={profile.newsletter_opt_in}
     onChange={e=>setProfile({...profile,newsletter_opt_in:e.target.checked})}/> Subscribe to newsletter</label>
    <button type="submit" disabled={busy} className="w-fit rounded-full bg-primary px-5 py-3 text-primary-foreground">{busy?"Saving...":"Save details"}</button>
   </form>}
  </section>
  {message&&<p className="mt-3" role="status">{message}</p>}
  <button className="mt-6 rounded border px-5 py-3" onClick={()=>signOut().then(()=>navigate({to:"/login"})).catch(()=>setMessage("Could not sign out."))}>Log out</button>
 </main>;
}
