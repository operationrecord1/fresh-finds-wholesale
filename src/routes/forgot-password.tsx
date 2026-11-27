import { isValidArtisanEmail } from "@/lib/artisan-email";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { ArrowRight } from "lucide-react";
import { artisanSupabase } from "@/lib/artisan-auth";
import "@/components/store/AccountForm.css";

export const Route = createFileRoute("/forgot-password")({
  head:()=>({meta:[{title:"Forgot Password | Artisan Mart"},{name:"description",content:"Securely recover your Artisan Mart account."}]}),
  component: ForgotPassword,
});
function ForgotPassword(){
  const [email,setEmail]=useState("");
  const [busy,setBusy]=useState(false);
  const [complete,setComplete]=useState(false);
  const [error,setError]=useState("");
  const invalidEmail=email.length>0&&!isValidArtisanEmail(email);
  const submit=async(e:FormEvent<HTMLFormElement>)=>{
    e.preventDefault();
    if(busy)return;
    setError("");
    if(invalidEmail||!email.trim()){setError("Enter a valid email address.");return;}
    if(!artisanSupabase){setError("Account recovery is temporarily unavailable.");return;}
    setBusy(true);
    try{
      const {error:result}=await artisanSupabase.auth.resetPasswordForEmail(email.trim().toLowerCase(),{
        redirectTo:window.location.origin+"/reset-password",
      });
      // Never disclose whether an account exists. The auth provider's
      // abuse prevention and request throttling remain authoritative.
      if(result && result.status!==429){
        throw result;
      }
      if(result?.status===429){setError("Too many requests. Please try again later.");return;}
      setComplete(true);
    }catch{
      setError("We couldn't request a reset email. Please try again later.");
    }finally{setBusy(false);}
  };
  return <main className="account-page">
    <div className="account-layout">
      <section className="account-card" aria-labelledby="forgot-title">
        <h1 id="forgot-title">{complete?"Check Your Email":"Forgot Your Password?"}</h1>
        {complete?
          <><p className="account-description" role="status">If an Artisan Mart account exists with the email you provided, you'll receive a secure reset link shortly. Check your spam folder too.</p>
          <Link to="/login" className="account-submit">Back to Login</Link></>:
          <><p className="account-description">Enter the email address associated with your Artisan Mart account.</p>
          <form onSubmit={submit}>
            <label>Email address <span>*</span><input name="email" type="email" autoComplete="email" required maxLength={254} value={email} aria-invalid={invalidEmail} onChange={e=>{setEmail(e.target.value);setError("");}}/>{invalidEmail&&<span role="alert" className="account-field-error">Enter a valid email address.</span>}</label>
            <button className="account-submit" disabled={busy} type="submit">{busy?"Sending...":"Send Reset Link"}<ArrowRight size={18}/></button>
            {error&&<p role="alert" className="account-message">{error}</p>}
          </form></>}
        <div className="account-switch"><Link to="/login">Back to sign in</Link></div>
      </section>
    </div>
  </main>;
}
