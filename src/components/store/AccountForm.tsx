import { isValidArtisanEmail } from "@/lib/artisan-email";
import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { validateArtisanPassword } from "@/lib/artisan-password";
import { PasswordChecklist } from "./PasswordChecklist";
import { cleanPhoneInput, formatPhoneInput, toE164Phone, validatePhoneNumber } from "@/lib/artisan-phone";
import { artisanSupabase, useArtisanAuth } from "@/lib/artisan-auth";
import { consumeCheckoutReturn } from "@/lib/artisan-checkout-intent";
import { Eye, EyeOff, LockKeyhole, ArrowRight, UserRound } from "lucide-react";
import "./AccountForm.css";
export function AccountForm({ register = false }: { register?: boolean }) {
 const [visible,setVisible]=useState(false);
 const [phone,setPhone]=useState("");
 const [password,setPassword]=useState("");
 const [confirmation,setConfirmation]=useState("");
 const [firstName,setFirstName]=useState("");
 const [lastName,setLastName]=useState("");
 const [emailValue,setEmailValue]=useState("");
 const [submitted,setSubmitted]=useState(false);
 const [agreed,setAgreed]=useState(false);
 const emailError=(emailValue.length>0||submitted) && !isValidArtisanEmail(emailValue)?"Enter a valid email address.":null;
 const phoneError=register&&(phone.length>0||submitted)?validatePhoneNumber(phone):null;
 const firstError=register&&(firstName.length>0||submitted)&&(!firstName.trim()||firstName.trim().length>120)?"Enter a valid first name.":null;
 const lastError=register&&(lastName.length>0||submitted)&&(!lastName.trim()||lastName.trim().length>120)?"Enter a valid last name.":null;
 const confirmationError=register&&(confirmation.length>0||submitted)&&confirmation!==password?"Passwords do not match.":null;
 const loginPasswordError=!register&&submitted&&!password?"Enter your password.":null;
 const agreementError=register&&submitted&&!agreed?"You must agree to the Terms of Sale and Privacy Policy.":null;
 const [message,setMessage]=useState("");
 const [busy,setBusy]=useState(false);
 const [verificationEmail,setVerificationEmail]=useState("");
 const [resendBusy,setResendBusy]=useState(false);
 const [resendCooldown,setResendCooldown]=useState(0);
 const [registered,setRegistered]=useState(false);
 useEffect(()=>{if(!resendCooldown)return;const timer=window.setTimeout(()=>setResendCooldown(s=>Math.max(0,s-1)),1000);return()=>window.clearTimeout(timer);},[resendCooldown]);
 const formRef=useRef<HTMLFormElement>(null);
 const navigate=useNavigate();
 const {user,ready}=useArtisanAuth();
 useEffect(()=>{
   if(!register && ready && user?.email_confirmed_at) {
     void navigate({to:consumeCheckoutReturn()?"/checkout":"/account"});
   }
 },[register,ready,user?.id,navigate]);
 useEffect(()=>{
   const params=new URLSearchParams(window.location.search);
   if(params.has("error"))setMessage("The email verification or sign-in link is invalid or expired. Please request a new link.");
 },[]);

 const submit=async(event:FormEvent<HTMLFormElement>)=>{
  event.preventDefault();
  if(busy)return;
  setSubmitted(true);
  const form=new FormData(event.currentTarget);
  const email=String(form.get("email")??"").trim().toLowerCase();
  const password=String(form.get("password")??"");
  if(!artisanSupabase){setMessage("Account service is temporarily unavailable.");return;}
  if(!isValidArtisanEmail(email)) {setMessage("Enter a valid email address.");return;}
  if(register && (!firstName.trim()||!lastName.trim()||!toE164Phone(phone))) {setMessage("Please correct the required fields.");return;}
  if(register&&!agreed){setMessage("Please accept the Terms of Sale and Privacy Policy.");return;}
  if(!register&&!password){setMessage("Enter your password.");return;}
  if(register&&password!==confirmation){
   setMessage("Your passwords do not match. Please check both fields.");return;
  }
  if(register){const validation=validateArtisanPassword(password);if(validation){setMessage(validation);return;}}
  setBusy(true);setMessage("");
  try{
   if(register){
    const {data,error}=await artisanSupabase.auth.signUp({
     email,password,
     options:{
      emailRedirectTo:window.location.origin+"/login",
      data:{
       first_name:firstName.trim(),
       last_name:lastName.trim(),
       phone:toE164Phone(phone),
       newsletter_opt_in:form.get("newsletter")==="on",
       terms_accepted_at:new Date().toISOString(),
      }
     }
    });
    if(error)throw error;
    if(!data.user)throw new Error("We could not create your account. Please try again.");
    if(data.user.identities?.length===0){setMessage("If you already have an account, please sign in or reset your password.");return;}
    setVerificationEmail(email);
    setRegistered(true);
    setResendCooldown(60);
    setMessage(data.session && data.user?.email_confirmed_at
     ? "Your verified account is ready."
     : "Check your inbox to verify your email before signing in. If the email does not arrive, use Resend confirmation.");
    if(data.session && data.user?.email_confirmed_at){
      await navigate({to:consumeCheckoutReturn()?"/checkout":"/account"});
    }
   }else{
    const {error}=await artisanSupabase.auth.signInWithPassword({email,password});
    if(error){
      const unconfirmed=String(error.message).toLowerCase().includes("not confirmed");
      if(unconfirmed){setVerificationEmail(email);setMessage("Please verify your email before signing in. You can request another verification email below.");}
      else setMessage("Invalid email or password. Please check your credentials.");
      return;
    }
    await navigate({to:consumeCheckoutReturn()?"/checkout":"/account"});
   }
  }catch(error){
   setMessage(error instanceof Error && /rate limit|too many requests/i.test(error.message)
     ? "Too many requests. Please try again later."
     : "We couldn\u0027t complete that account request. Please check the information and try again.");
  }finally{setBusy(false);}
 };
 const resendConfirmation=async()=>{
  const email=verificationEmail || (formRef.current?.elements.namedItem("email") as HTMLInputElement|null)?.value.trim().toLowerCase();
  if(!email || !artisanSupabase){setMessage("Enter your email address first.");return;}
  if(resendBusy||resendCooldown>0)return;
  setResendBusy(true);
  try {
    const {error}=await artisanSupabase.auth.resend({
      type:"signup",email,options:{emailRedirectTo:window.location.origin+"/login"},
    });
    if(error)throw error;
    setMessage("If your address needs verification, another confirmation email has been requested.");
    setVerificationEmail(email);
    setResendCooldown(60);
  }catch(err){setMessage(err instanceof Error?err.message:"Could not resend confirmation.");}
  finally{setResendBusy(false);}
 };
 return <main className={`account-page ${register?"account-register":""}`}>
  <nav aria-label="Breadcrumb"><Link to="/">Home</Link><span>/</span><span aria-current="page">{register?"Create an account":"Customer login"}</span></nav>
  <div className="account-layout"><aside className="account-welcome"><span className="account-brand">ARTISAN <b>MART</b></span><div className="account-welcome-copy"><span className="account-eyebrow">YOUR WHOLESALE ACCOUNT</span><h1>{register?"Start with an account. Build your next opportunity.":"Welcome back to Artisan Mart."}</h1><p>{register?"Keep your business details in one place and get ready for your wholesale journey.":"Sign in with your email and password to continue to your account."}</p><div className="account-switch"><p>{register?"Already have an account?":"New to Artisan Mart?"}</p><Link to={register?"/login":"/register"}>{register?"Sign in":"Create an account"}<ArrowRight size={17} aria-hidden="true"/></Link></div></div></aside>
  <section className="account-card" aria-labelledby="account-title"><span className="account-icon">{register?<UserRound aria-hidden="true"/>:<LockKeyhole aria-hidden="true"/>}</span><h2 id="account-title">{register?"Create an account":"Customer login"}</h2><p className="account-description">{register?"Enter your details below to get started.":"Enter your account details below."}</p>
   {registered? <div className="account-verification" role="status"><h3 className="account-form-heading">Check Your Email</h3><p className="account-description">We sent a verification request to <strong>{verificationEmail}</strong>. Follow the secure link to activate your Artisan Mart account. Check spam or junk if necessary.</p><button type="button" disabled={resendBusy||resendCooldown>0} className="account-submit" onClick={resendConfirmation}>{resendBusy?"Sending...":resendCooldown>0?`Resend available in ${resendCooldown}s`:"Resend Verification Email"}</button><Link className="account-switch" to="/login">Back to Login</Link>{message&&<p className="account-message">{message}</p>}</div> : <form ref={formRef} onSubmit={submit} noValidate onChange={()=>setMessage("")}>
    {register&&<><fieldset><legend>Personal information</legend><div className="account-name-row"><label>First name <span>*</span><input name="firstName" autoComplete="given-name" required maxLength={120} value={firstName} aria-invalid={!!firstError} onChange={e=>setFirstName(e.target.value)}/>{firstError&&<span className="account-field-error" role="alert">{firstError}</span>}</label><label>Last name <span>*</span><input name="lastName" autoComplete="family-name" required maxLength={120} value={lastName} aria-invalid={!!lastError} onChange={e=>setLastName(e.target.value)}/>{lastError&&<span className="account-field-error" role="alert">{lastError}</span>}</label></div><label>Phone <span>*</span><input name="phone" type="tel" autoComplete="tel" inputMode="tel" placeholder="+1 (212) 555-0123" required value={phone} aria-invalid={!!phoneError} onChange={e=>setPhone(formatPhoneInput(cleanPhoneInput(e.target.value)))}/>{phoneError&&<span className="account-field-error" role="alert">{phoneError}</span>}</label><label>Sales representative<select name="representative"><option>Web Customer</option></select></label></fieldset><h3 className="account-form-heading">Login information</h3></>}
    <label>Email address <span>*</span><input name="email" type="email" autoComplete="email" required maxLength={254} value={emailValue} aria-invalid={!!emailError} onChange={e=>setEmailValue(e.target.value)}/>{emailError&&<span className="account-field-error" role="alert">{emailError}</span>}</label>
    <label>Password <span>*</span><div className="account-password"><input name="password" type={visible?"text":"password"} autoComplete={register?"new-password":"current-password"} required value={password} onChange={e=>setPassword(e.target.value)} aria-invalid={!!loginPasswordError} aria-describedby={register?"artisan-password-requirements":undefined}/><button type="button" aria-label={visible?"Hide password":"Show password"} aria-pressed={visible} onClick={()=>setVisible(!visible)}>{visible?<EyeOff size={19}/>:<Eye size={19}/>}</button></div>{loginPasswordError&&<span className="account-field-error" role="alert">{loginPasswordError}</span>}</label>
    {register?<><label>Confirm password <span>*</span><input name="confirmation" type={visible?"text":"password"} autoComplete="new-password" required value={confirmation} onChange={e=>setConfirmation(e.target.value)} aria-invalid={!!confirmationError}/>{confirmationError&&<span className="account-field-error" role="alert">{confirmationError}</span>}</label><label className="account-checkbox"><input name="newsletter" type="checkbox"/>Sign up for our newsletter</label><div className="account-agreement"><label className="account-checkbox"><input name="agreement" type="checkbox" required checked={agreed} aria-invalid={!!agreementError} onChange={e=>{setAgreed(e.target.checked);setMessage("");}}/><span>I agree to the <Link to="/terms-of-sale">Terms of Sale</Link> and <Link to="/privacy">Privacy Policy</Link> <span aria-hidden="true">*</span></span></label>{agreementError&&<span className="account-field-error" role="alert">{agreementError}</span>}</div></>:<Link className="account-forgot" to="/forgot-password">Forgot your password?</Link>}
    {register&&<PasswordChecklist password={password}/>}
    <button type="submit" disabled={busy} className="account-submit">{busy?"Please wait...":register?"Create account":"Sign in"}<ArrowRight size={18} aria-hidden="true"/></button>
    {message&&<p role="status" className="account-message">{message}</p>}
    {(verificationEmail && !registered) && <button type="button" className="account-forgot"
       disabled={resendBusy||resendCooldown>0} onClick={resendConfirmation}>{resendBusy?"Sending...":resendCooldown>0?`Resend available in ${resendCooldown}s`:"Resend confirmation email"}</button>}
   </form>}
  </section></div>
 </main>;
}
