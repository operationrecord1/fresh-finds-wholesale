import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { artisanSupabase, useArtisanAuth } from "@/lib/artisan-auth";
import { formatPhoneInput, cleanPhoneInput, toE164Phone, validatePhoneNumber } from "@/lib/artisan-phone";

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
 const [profileLoading,setProfileLoading]=useState(true);
 const [reloadProfile,setReloadProfile]=useState(0);
 const [submitted,setSubmitted]=useState(false);
 useEffect(()=>{
  setProfile(null);
  setMessage("");
  setProfileLoading(true);
  if(!user||!artisanSupabase){setProfileLoading(false);return;}
  let alive=true;
  artisanSupabase.from("artisan_profiles")
   .select("first_name,last_name,phone,newsletter_opt_in")
   .eq("user_id",user.id).single()
   .then(({data,error})=>{
    if(!alive)return;
    if(error||!data)setMessage("Could not load your account details.");
    else setProfile({...data,phone:formatPhoneInput(data.phone||"")} as Profile);
   }).catch(()=>{
    if(alive)setMessage("Could not load your account details.");
   }).finally(()=>{if(alive)setProfileLoading(false);});
  return()=>{alive=false};
 },[user?.id,reloadProfile]);
 if(!ready)return <div className="mx-auto max-w-3xl p-8" role="status">Loading your account...</div>;
 if(!user)return <div className="mx-auto max-w-3xl p-8"><h1 className="text-2xl font-bold">My Account</h1><p className="mt-4">Please sign in to view your account.</p><Link to="/login" className="text-primary underline">Sign in</Link></div>;
 const save=async(e:FormEvent<HTMLFormElement>)=>{
  e.preventDefault();
  if(!artisanSupabase||!profile||busy)return;
  setSubmitted(true);
  const firstName=profile.first_name.trim();
  const lastName=profile.last_name.trim();
  if(!firstName||!lastName||firstName.length>120||lastName.length>120){
   setMessage("Enter a valid first and last name.");return;
  }
  const standardized=profile.phone.trim()?toE164Phone(profile.phone):"";
  if(standardized===null){setMessage("Enter a valid international phone number.");return;}
  setBusy(true);setMessage("");
  try{
   const {error}=await artisanSupabase.from("artisan_profiles")
    .update({first_name:firstName,last_name:lastName,phone:standardized,
     newsletter_opt_in:profile.newsletter_opt_in})
    .eq("user_id",user.id);
   if(error){setMessage("Could not save account details.");return;}
   setProfile(previous=>previous?{...previous,first_name:firstName,last_name:lastName}:previous);
   window.dispatchEvent(new Event("artisan-customer-profile-updated"));
   setSubmitted(false);
   setMessage("Your account details were saved.");
  }catch{
   setMessage("Could not save account details. Please try again.");
  }finally{
   setBusy(false);
  }
 };
 return <main className="mx-auto max-w-[920px] px-4 py-8">
  <h1 className="text-3xl font-bold text-title">My Account</h1>
  <p className="mt-2 text-sm text-muted-foreground">Signed in as {user.email}</p>
  <section className="mt-6 rounded-xl border bg-card p-6">
   <h2 className="mb-4 text-xl font-bold">Contact information</h2>
   {!profile?(profileLoading?<p role="status">Loading your profile...</p>:
      <div><p role="alert" className="text-sm text-red-700">Could not load your account details.</p><button type="button" className="mt-3 rounded border px-4 py-2" onClick={()=>setReloadProfile(x=>x+1)}>Try again</button></div>):
   <form className="grid gap-4" onSubmit={save} noValidate>
    <label>First name <input className="mt-1 block w-full rounded border p-2" value={profile.first_name} maxLength={120} required aria-invalid={submitted&&!profile.first_name.trim()}
     onChange={e=>{setProfile({...profile,first_name:e.target.value});setMessage("");}}/>{submitted&&!profile.first_name.trim()&&<span role="alert" className="block text-xs font-semibold text-red-700">Enter your first name.</span>}</label>
    <label>Last name <input className="mt-1 block w-full rounded border p-2" value={profile.last_name} maxLength={120} required aria-invalid={submitted&&!profile.last_name.trim()}
     onChange={e=>{setProfile({...profile,last_name:e.target.value});setMessage("");}}/>{submitted&&!profile.last_name.trim()&&<span role="alert" className="block text-xs font-semibold text-red-700">Enter your last name.</span>}</label>
    <label>Phone <input type="tel" inputMode="tel" autoComplete="tel" className="mt-1 block w-full rounded border p-2" value={profile.phone} maxLength={40}
     aria-invalid={!!profile.phone&&!!validatePhoneNumber(profile.phone)} onChange={e=>setProfile({...profile,phone:formatPhoneInput(cleanPhoneInput(e.target.value))})}/>
     {!!profile.phone&&!!validatePhoneNumber(profile.phone)&&<span className="block text-xs font-semibold text-red-700" role="alert">Enter a valid phone number with a country code.</span>}</label>
    <label className="flex items-center gap-2"><input type="checkbox" checked={profile.newsletter_opt_in}
     onChange={e=>setProfile({...profile,newsletter_opt_in:e.target.checked})}/> Subscribe to newsletter</label>
    <button type="submit" disabled={busy} className="w-fit rounded-full bg-primary px-5 py-3 text-primary-foreground">{busy?"Saving...":"Save details"}</button>
   </form>}
  </section>
  {message&&<p className="mt-3" role="status">{message}</p>}
  <button className="mt-6 rounded border px-5 py-3" onClick={()=>signOut().then(()=>navigate({to:"/login"})).catch(()=>setMessage("Could not sign out."))}>Log out</button>
 </main>;
}
