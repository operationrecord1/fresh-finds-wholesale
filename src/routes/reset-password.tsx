import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Eye, EyeOff } from "lucide-react";
import { artisanSupabase, useArtisanAuth } from "@/lib/artisan-auth";
import { validateArtisanPassword } from "@/lib/artisan-password";
import "@/components/store/AccountForm.css";

export const Route = createFileRoute("/reset-password")({
  head:()=>({meta:[{title:"Reset Password | Artisan Mart"},{name:"description",content:"Securely update your Artisan Mart account password."}]}),
  component: ResetPassword,
});
function ResetPassword(){
  const {user,ready,recovery}=useArtisanAuth();
  const [password,setPassword]=useState("");
  const [confirm,setConfirm]=useState("");
  const [visible,setVisible]=useState(false);
  const [busy,setBusy]=useState(false);
  const [done,setDone]=useState(false);
  const [message,setMessage]=useState("");
  const confirmationError=confirm.length>0&&confirm!==password?"Passwords do not match.":null;
  const save=async(e:FormEvent<HTMLFormElement>)=>{
    e.preventDefault();
    if(busy||done)return;
    if(!artisanSupabase||!user||!recovery){setMessage("Recovery session is invalid or expired. Request a fresh link.");return;}
    const error=validateArtisanPassword(password);
    if(error){setMessage(error);return;}
    if(password!==confirm){setMessage("Passwords do not match.");return;}
    setBusy(true);setMessage("");
    try{
      const {error:result}=await artisanSupabase.auth.updateUser({password});
      if(result)throw result;
      setPassword("");setConfirm("");
      // Sign out the recovery session; a new password login is required.
      const {error:logoutError}=await artisanSupabase.auth.signOut({scope:"global"});
      if(logoutError)throw logoutError;
      setDone(true);
    }catch{
      setMessage("We could not update the password. Request another recovery link if yours has expired.");
    }finally{setBusy(false);}
  };
  return <main className="account-page">
    <div className="account-layout">
      <section className="account-card" aria-labelledby="reset-title">
        <h1 id="reset-title">{done?"Password Updated Successfully":"Reset Password"}</h1>
        {done?<><p className="account-description" role="status">Your password has been changed. Sign in with your new password.</p>
            <Link className="account-submit" to="/login">Back to Login</Link></>:
         !ready?<p role="status">Verifying your recovery link...</p>:
         !recovery||!user?
         <><p className="account-description" role="alert">This recovery link is invalid, expired, or already used. Request another secure link.</p>
            <Link className="account-submit" to="/forgot-password">Request New Link</Link></>:
         <form onSubmit={save}>
           <label>New password <span>*</span><div className="account-password"><input name="password" type={visible?"text":"password"} autoComplete="new-password" value={password} onChange={e=>setPassword(e.target.value)} minLength={12} required/>
             <button type="button" onClick={()=>setVisible(!visible)} aria-label={visible?"Hide password":"Show password"}>{visible?<EyeOff size={19}/>:<Eye size={19}/>}</button></div></label>
           <label>Confirm password <span>*</span><input name="confirmation" type={visible?"text":"password"} autoComplete="new-password" value={confirm} onChange={e=>setConfirm(e.target.value)} minLength={12} required aria-invalid={!!confirmationError}/>{confirmationError&&<span className="account-field-error" role="alert">{confirmationError}</span>}</label>
           <button type="submit" className="account-submit" disabled={busy}>{busy?"Updating...":"Update Password"}</button>
           {message&&<p className="account-message" role="alert">{message}</p>}
         </form>}
        <div className="account-switch"><Link to="/login">Back to sign in</Link></div>
      </section>
    </div>
  </main>;
}
