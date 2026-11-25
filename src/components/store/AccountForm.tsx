import { Link, useNavigate } from "@tanstack/react-router";
import { useRef, useState, type FormEvent } from "react";
import { artisanSupabase } from "@/lib/artisan-auth";
import { Eye, EyeOff, LockKeyhole, ArrowRight, UserRound } from "lucide-react";
import "./AccountForm.css";
export function AccountForm({ register = false }: { register?: boolean }) {
 const [visible,setVisible]=useState(false);
 const [message,setMessage]=useState("");
 const [busy,setBusy]=useState(false);
 const formRef=useRef<HTMLFormElement>(null);
 const navigate=useNavigate();

 const submit=async(event:FormEvent<HTMLFormElement>)=>{
  event.preventDefault();
  if(busy)return;
  const form=new FormData(event.currentTarget);
  const email=String(form.get("email")??"").trim().toLowerCase();
  const password=String(form.get("password")??"");
  if(!artisanSupabase){setMessage("Account service is temporarily unavailable.");return;}
  if(register&&password!==String(form.get("confirmation")??"")){
   setMessage("Your passwords do not match. Please check both fields.");return;
  }
  if(password.length<8){setMessage("Please use at least 8 characters for your password.");return;}
  setBusy(true);setMessage("");
  try{
   if(register){
    const {data,error}=await artisanSupabase.auth.signUp({
     email,password,
     options:{
      emailRedirectTo:window.location.origin+"/login",
      data:{
       first_name:String(form.get("firstName")??"").trim(),
       last_name:String(form.get("lastName")??"").trim(),
       phone:String(form.get("phone")??"").trim(),
       newsletter_opt_in:form.get("newsletter")==="on",
      }
     }
    });
    if(error)throw error;
    setMessage(data.session
     ? "Your account is ready. You can now continue to My Account."
     : "If this address can receive registration emails, check your inbox to verify your account.");
    if(data.session)await navigate({to:"/account"});
   }else{
    const {error}=await artisanSupabase.auth.signInWithPassword({email,password});
    if(error){setMessage("Invalid email or password, or your email has not been confirmed.");return;}
    await navigate({to:"/account"});
   }
  }catch(error){
   setMessage(error instanceof Error ? error.message : "Account request failed. Please try again.");
  }finally{setBusy(false);}
 };
 const resetPassword=async()=>{
  const email=(formRef.current?.elements.namedItem("email") as HTMLInputElement|null)?.value.trim();
  if(!email){setMessage("Enter your email address first.");return;}
  if(!artisanSupabase){setMessage("Account service is temporarily unavailable.");return;}
  if(busy)return;
  setBusy(true);
  try{
   const {error}=await artisanSupabase.auth.resetPasswordForEmail(email,{
    redirectTo:window.location.origin+"/reset-password",
   });
   if(error)throw error;
   setMessage("If this email has an account, password recovery instructions will be sent.");
  }catch(error){setMessage(error instanceof Error?error.message:"Password reset request failed.");}
  finally{setBusy(false);}
 };
 return <main className={`account-page ${register?"account-register":""}`}>
  <nav aria-label="Breadcrumb"><Link to="/">Home</Link><span>/</span><span aria-current="page">{register?"Create an account":"Customer login"}</span></nav>
  <div className="account-layout"><aside className="account-welcome"><span className="account-brand">ARTISAN <b>MART</b></span><div className="account-welcome-copy"><span className="account-eyebrow">YOUR WHOLESALE ACCOUNT</span><h1>{register?"Start with an account. Build your next opportunity.":"Welcome back to Artisan Mart."}</h1><p>{register?"Keep your business details in one place and get ready for your wholesale journey.":"Sign in with your email and password to continue to your account."}</p><div className="account-switch"><p>{register?"Already have an account?":"New to Artisan Mart?"}</p><Link to={register?"/login":"/register"}>{register?"Sign in":"Create an account"}<ArrowRight size={17} aria-hidden="true"/></Link></div></div></aside>
  <section className="account-card" aria-labelledby="account-title"><span className="account-icon">{register?<UserRound aria-hidden="true"/>:<LockKeyhole aria-hidden="true"/>}</span><h2 id="account-title">{register?"Create an account":"Customer login"}</h2><p className="account-description">{register?"Enter your details below to get started.":"Enter your account details below."}</p>
   <form ref={formRef} onSubmit={submit} onChange={()=>setMessage("")}>
    {register&&<><fieldset><legend>Personal information</legend><div className="account-name-row"><label>First name <span>*</span><input name="firstName" autoComplete="given-name" required/></label><label>Last name <span>*</span><input name="lastName" autoComplete="family-name" required/></label></div><label>Phone <span>*</span><input name="phone" type="tel" autoComplete="tel" required/></label><label>Sales representative<select name="representative"><option>Web Customer</option></select></label></fieldset><h3 className="account-form-heading">Login information</h3></>}
    <label>Email address <span>*</span><input name="email" type="email" autoComplete="email" required/></label>
    <label>Password <span>*</span><div className="account-password"><input name="password" type={visible?"text":"password"} autoComplete={register?"new-password":"current-password"} required/><button type="button" aria-label={visible?"Hide password":"Show password"} aria-pressed={visible} onClick={()=>setVisible(!visible)}>{visible?<EyeOff size={19}/>:<Eye size={19}/>}</button></div></label>
    {register?<><label>Confirm password <span>*</span><input name="confirmation" type={visible?"text":"password"} autoComplete="new-password" required/></label><label className="account-checkbox"><input name="newsletter" type="checkbox"/>Sign up for our newsletter</label></>:<button type="button" className="account-forgot" onClick={resetPassword}>Forgot your password?</button>}
    <button type="submit" disabled={busy} className="account-submit">{busy?"Please wait...":register?"Create account":"Sign in"}<ArrowRight size={18} aria-hidden="true"/></button>
    {message&&<p role="status" className="account-message">{message}</p>}
   </form>
  </section></div>
 </main>;
}
