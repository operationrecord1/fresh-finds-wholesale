import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Eye, EyeOff, LockKeyhole } from "lucide-react";
import { artisanSupabase, useArtisanAuth } from "@/lib/artisan-auth";
import { validateArtisanPassword } from "@/lib/artisan-password";
import { PasswordChecklist } from "@/components/store/PasswordChecklist";
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
    <nav aria-label="Breadcrumb"><Link to="/">Home</Link><span>/</span><span aria-current="page">Reset Password</span></nav>
    <div className="account-layout">
      <aside className="account-welcome">
        <span className="account-brand">ARTISAN <b>MART</b></span>
        <div className="account-welcome-copy"><span className="account-eyebrow">YOUR WHOLESALE ACCOUNT</span>
          <h1>Create a new password.</h1><p>Restore secure access to your Artisan Mart account.</p>
          <div className="account-switch"><p>Need a new recovery link?</p><Link to="/forgot-password">Request Reset Link</Link></div>
        </div>
      </aside>
      <section className="account-card" aria-labelledby="reset-title">
        <span className="account-icon"><LockKeyhole aria-hidden="true"/></span>
        <h2 id="reset-title">{done?"Password Updated Successfully":"Reset Password"}</h2>
        {done?<><p className="account-description" role="status">Your password has been changed. Sign in with your new password.</p>
            <Link className="account-submit" to="/login">Back to Login</Link></>:
         !ready?<p role="status">Verifying your recovery link...</p>:
         !recovery||!user?
         <><p className="account-description" role="alert">This recovery link is invalid, expired, or already used. Request another secure link.</p>
            <Link className="account-submit" to="/forgot-password">Request New Link</Link></>:
         <form onSubmit={save}>
           <label>New password <span>*</span><div className="account-password"><input name="password" type={visible?"text":"password"} autoComplete="new-password" value={password} onChange={e=>setPassword(e.target.value)} minLength={12} required aria-describedby="reset-requirements"/>
             <button type="button" onClick={()=>setVisible(!visible)} aria-label={visible?"Hide password":"Show password"}>{visible?<EyeOff size={19}/>:<Eye size={19}/>}</button></div></label>
           <label>Confirm password <span>*</span><input name="confirmation" type={visible?"text":"password"} autoComplete="new-password" value={confirm} onChange={e=>setConfirm(e.target.value)} minLength={12} required aria-invalid={!!confirmationError}/>{confirmationError&&<span className="account-field-error" role="alert">{confirmationError}</span>}</label>
           <PasswordChecklist password={password} id="reset-requirements"/>
           <button type="submit" className="account-submit" disabled={busy}>{busy?"Updating...":"Update Password"}</button>
           {message&&<p className="account-message" role="alert">{message}</p>}
         </form>}
      </section>
    </div>
  </main>;
}
