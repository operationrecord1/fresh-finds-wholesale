import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { artisanSupabase, useArtisanAuth } from "@/lib/artisan-auth";

export const Route = createFileRoute("/reset-password")({
 head:()=>({meta:[{title:"Reset Password | Artisan Mart"},{name:"description",content:"Set a new password for your Artisan Mart account."}]}),
 component: ResetPassword,
});

function ResetPassword(){
 const {user,ready}=useArtisanAuth();
 const [password,setPassword]=useState("");
 const [confirmation,setConfirmation]=useState("");
 const [busy,setBusy]=useState(false);
 const [message,setMessage]=useState("");
 const save=async(e:FormEvent<HTMLFormElement>)=>{
  e.preventDefault();
  if(password!==confirmation){setMessage("Passwords do not match.");return;}
  if(password.length<8){setMessage("Use at least 8 characters.");return;}
  if(!artisanSupabase||!user){setMessage("Your recovery session is unavailable. Request another reset link.");return;}
  setBusy(true);setMessage("");
  try{
   const {error}=await artisanSupabase.auth.updateUser({password});
   if(error)throw error;
   setPassword("");setConfirmation("");
   setMessage("Password updated. You can continue to your account.");
  }catch(err){setMessage(err instanceof Error?err.message:"Could not update password.");}
  finally{setBusy(false);}
 };
 return <main className="account-page">
  <nav aria-label="Breadcrumb"><Link to="/">Home</Link><span>/</span><span aria-current="page">Reset Password</span></nav>
  <div className="account-layout">
   <aside className="account-welcome"><span className="account-brand">ARTISAN <b>MART</b></span>
    <div className="account-welcome-copy"><span className="account-eyebrow">YOUR WHOLESALE ACCOUNT</span>
     <h1>Secure your account.</h1><p>Use your recovery link to choose a new password.</p></div>
   </aside>
   <section className="account-card">
    <h2>Reset Password</h2>
    {!ready?<p role="status">Verifying your recovery session...</p>:
     !user?<><p className="account-description">Your recovery link is invalid or expired. Request a new link from the login page.</p>
      <Link to="/login" className="account-submit">Return to Login</Link></>:
     <form onSubmit={save}>
      <label>New password <input type="password" autoComplete="new-password" required minLength={8} value={password}
       onChange={e=>setPassword(e.target.value)}/></label>
      <label>Confirm password <input type="password" autoComplete="new-password" required minLength={8} value={confirmation}
       onChange={e=>setConfirmation(e.target.value)}/></label>
      <button className="account-submit" type="submit" disabled={busy}>{busy?"Updating...":"Update password"}</button>
     </form>}
    {message&&<p className="account-message" role="status">{message}</p>}
   </section>
  </div>
 </main>;
}
