import { useEffect, useState, type FormEvent } from "react";
import { artisanSupabase, useArtisanAuth } from "@/lib/artisan-auth";
import { toE164Phone } from "@/lib/artisan-phone";

type Address={id:string;label:string;first_name:string;last_name:string;company:string|null;line1:string;line2:string|null;city:string;state:string;postal_code:string;country:string;phone:string|null};
const EMPTY={label:"Shipping",first_name:"",last_name:"",company:"",line1:"",line2:"",city:"",state:"",postal_code:"",phone:""};
type Draft=typeof EMPTY;
const fields=[["label","Address Label"],["first_name","First Name"],["last_name","Last Name"],["company","Company (optional)"],["line1","Street Address"],["line2","Apartment / Suite (optional)"],["city","City"],["state","State"],["postal_code","ZIP Code"],["phone","Phone (optional)"]] as const;
export function CustomerAddressBook(){
 const {ready,user}=useArtisanAuth();
 const [addresses,setAddresses]=useState<Address[]>([]);
 const [draft,setDraft]=useState<Draft>(EMPTY);
 const [editing,setEditing]=useState<string|null>(null);
 const [loading,setLoading]=useState(true);
 const [busy,setBusy]=useState(false);
 const [message,setMessage]=useState("");
 const [revision,setRevision]=useState(0);
 useEffect(()=>{
  setAddresses([]);setDraft(EMPTY);setEditing(null);setMessage("");setLoading(true);
  if(!ready)return;
  if(!user?.email_confirmed_at||!artisanSupabase){setLoading(false);return;}
  let active=true;
  Promise.resolve(artisanSupabase.from("artisan_customer_addresses")
   .select("id,label,first_name,last_name,company,line1,line2,city,state,postal_code,country,phone")
   .eq("user_id",user.id).order("created_at",{ascending:false}).limit(30))
   .then(({data,error})=>{
    if(!active)return;
    if(error){setMessage("Could not load saved addresses.");return;}
    setAddresses((data??[]) as Address[]);
   }).catch(()=>{if(active)setMessage("Could not load saved addresses.");})
   .finally(()=>{if(active)setLoading(false);});
  return()=>{active=false;};
 },[ready,user?.id,user?.email_confirmed_at,revision]);
 if(!ready||!user?.email_confirmed_at)return null;
 const edit=(a:Address)=>{
  setEditing(a.id);
  setDraft({label:a.label,first_name:a.first_name,last_name:a.last_name,company:a.company??"",line1:a.line1,line2:a.line2??"",city:a.city,state:a.state,postal_code:a.postal_code,phone:a.phone??""});
  setMessage("");
 };
 const save=async(e:FormEvent<HTMLFormElement>)=>{
  e.preventDefault();
  if(busy||!artisanSupabase||!user)return;
  const compact=Object.fromEntries(Object.entries(draft).map(([k,v])=>[k,v.trim()])) as Draft;
  if(["label","first_name","last_name","line1","city","state","postal_code"].some(k=>!compact[k as keyof Draft])){
   setMessage("Complete all required address fields.");return;
  }
  if(compact.label.length>80||compact.first_name.length>120||compact.last_name.length>120||compact.line1.length>240||compact.city.length>140||compact.state.length>100||compact.postal_code.length>20||compact.company.length>160||compact.line2.length>240){
   setMessage("One or more address fields are too long.");return;
  }
  const phone=compact.phone?toE164Phone(compact.phone):null;
  if(compact.phone&&!phone){setMessage("Enter a valid phone number.");return;}
  setBusy(true);setMessage("");
  const row={...compact,company:compact.company||null,line2:compact.line2||null,phone,country:"US",user_id:user.id};
  try{
   const query=editing?artisanSupabase.from("artisan_customer_addresses").update(row).eq("id",editing).eq("user_id",user.id):
    artisanSupabase.from("artisan_customer_addresses").insert(row);
   const {error}=await query;
   if(error)throw error;
   setDraft(EMPTY);setEditing(null);setRevision(n=>n+1);
   setMessage("Address saved.");
  }catch{setMessage("Couldn't save this address. Please try again.");}
  finally{setBusy(false);}
 };
 const remove=async(id:string)=>{
  if(!artisanSupabase||busy||!user||!window.confirm("Delete this saved address?"))return;
  setBusy(true);setMessage("");
  try{
   const {error}=await artisanSupabase.from("artisan_customer_addresses").delete().eq("id",id).eq("user_id",user.id);
   if(error)throw error;
   setRevision(n=>n+1);setMessage("Address deleted.");
  }catch{setMessage("Couldn't delete this address.");}finally{setBusy(false);}
 };
 return <section className="mt-6 rounded-xl border bg-card p-6" aria-labelledby="addresses-title">
  <h2 id="addresses-title" className="text-xl font-bold">Saved Addresses</h2>
  {loading?<p role="status" className="mt-3 text-sm">Loading saved addresses...</p>:
   <div className="mt-4 grid gap-3 sm:grid-cols-2">{addresses.map(a=>
    <article key={a.id} className="rounded-lg border p-4 text-sm">
     <h3 className="font-semibold">{a.label}</h3>
     <p>{a.first_name} {a.last_name}</p><p>{a.line1}{a.line2?", "+a.line2:""}</p>
     <p>{a.city}, {a.state} {a.postal_code}</p>
     <div className="mt-3 flex gap-2">
      <button type="button" disabled={busy} onClick={()=>edit(a)} className="rounded border px-3 py-2">Edit</button>
      <button type="button" disabled={busy} onClick={()=>void remove(a.id)} className="rounded border px-3 py-2">Delete</button>
     </div>
    </article>)}</div>}
  {!loading&&addresses.length===0&&<p className="mt-3 text-sm text-muted-foreground">No saved addresses yet.</p>}
  <form onSubmit={e=>void save(e)} className="mt-6 space-y-3">
   <h3 className="font-semibold">{editing?"Edit Address":"Add an Address"}</h3>
   <div className="grid gap-3 sm:grid-cols-2">{fields.map(([key,label])=>
    <label key={key} className="block text-sm">{label}
     <input className="mt-1 block w-full rounded border p-2" value={draft[key]} maxLength={key==="line1"||key==="line2"?240:key==="company"?160:key==="city"?140:key==="state"?100:key==="postal_code"?20:key==="label"?80:120}
      onChange={e=>{setDraft(old=>({...old,[key]:e.target.value}));setMessage("");}} required={!["company","line2","phone"].includes(key)} />
    </label>)}</div>
   <p className="text-xs text-muted-foreground">Shipping addresses currently support the United States.</p>
   <div className="flex gap-3">
    <button disabled={busy} type="submit" className="rounded-full bg-primary px-5 py-3 font-semibold text-primary-foreground">{busy?"Saving...":"Save address"}</button>
    {editing&&<button type="button" onClick={()=>{setEditing(null);setDraft(EMPTY);}} className="rounded-full border px-5 py-3">Cancel</button>}
   </div>
  </form>
  {message&&<p role="status" className="mt-3 text-sm">{message}</p>}
 </section>;
}
