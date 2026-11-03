import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Eye, EyeOff, LockKeyhole, ArrowRight, UserRound } from "lucide-react";
import "./AccountForm.css";
export function AccountForm({ register = false }: { register?: boolean }) {
 const [visible,setVisible]=useState(false);
 const [message,setMessage]=useState("");
 return <main className={`account-page ${register?"account-register":""}`}>
  <nav aria-label="Breadcrumb"><Link to="/">Home</Link><span>/</span><span aria-current="page">{register?"Create an account":"Customer login"}</span></nav>
  <div className="account-layout"><aside className="account-welcome"><span className="account-brand">ARTISAN <b>MART</b></span><div className="account-welcome-copy"><span className="account-eyebrow">YOUR WHOLESALE ACCOUNT</span><h1>{register?"Start with an account. Build your next opportunity.":"Welcome back to Artisan Mart."}</h1><p>{register?"Keep your business details in one place and get ready for your wholesale journey.":"Sign in with your email and password to continue to your account."}</p><div className="account-switch"><p>{register?"Already have an account?":"New to Artisan Mart?"}</p><Link to={register?"/login":"/register"}>{register?"Sign in":"Create an account"}<ArrowRight size={17} aria-hidden="true"/></Link></div></div></aside>
  <section className="account-card" aria-labelledby="account-title"><span className="account-icon">{register?<UserRound aria-hidden="true"/>:<LockKeyhole aria-hidden="true"/>}</span><h2 id="account-title">{register?"Create an account":"Customer login"}</h2><p className="account-description">{register?"Enter your details below to get started.":"Enter your account details below."}</p>
   <form onSubmit={e=>{e.preventDefault();const data=new FormData(e.currentTarget);if(register&&data.get("password")!==data.get("confirmation")){setMessage("Your passwords do not match. Please check both fields.");return;}setMessage(register?"Account registration is not available yet. No account has been created.":"Sign-in is not available yet. Please try again once account access is enabled.");}} onChange={()=>setMessage("")}>
    {register&&<><fieldset><legend>Personal information</legend><div className="account-name-row"><label>First name <span>*</span><input name="firstName" autoComplete="given-name" required/></label><label>Last name <span>*</span><input name="lastName" autoComplete="family-name" required/></label></div><label>Phone <span>*</span><input name="phone" type="tel" autoComplete="tel" required/></label><label>Sales representative<select name="representative"><option>Web Customer</option></select></label></fieldset><h3 className="account-form-heading">Login information</h3></>}
    <label>Email address <span>*</span><input name="email" type="email" autoComplete="email" required/></label>
    <label>Password <span>*</span><div className="account-password"><input name="password" type={visible?"text":"password"} autoComplete={register?"new-password":"current-password"} required/><button type="button" aria-label={visible?"Hide password":"Show password"} aria-pressed={visible} onClick={()=>setVisible(!visible)}>{visible?<EyeOff size={19}/>:<Eye size={19}/>}</button></div></label>
    {register?<><label>Confirm password <span>*</span><input name="confirmation" type={visible?"text":"password"} autoComplete="new-password" required/></label><label className="account-checkbox"><input name="newsletter" type="checkbox"/>Sign up for our newsletter</label></>:<button type="button" className="account-forgot" onClick={()=>setMessage("Password reset is not available yet. Account access is still being set up.")}>Forgot your password?</button>}
    <button type="submit" className="account-submit">{register?"Create account":"Sign in"}<ArrowRight size={18} aria-hidden="true"/></button>
    {message&&<p role="status" className="account-message">{message}</p>}
   </form>
  </section></div>
 </main>;
}
