import { passwordChecks } from "@/lib/artisan-password";

export function PasswordChecklist({password,id="artisan-password-requirements"}:{password:string;id?:string}) {
 return <div id={id} className="account-password-requirements" aria-live="polite">
  <span className="account-password-requirements-title">Password requirements</span>
  <ul>
   {passwordChecks.map(rule=><li key={rule.id} className={rule.test(password)?"account-rule-satisfied":"account-rule-unsatisfied"}>
     <span aria-hidden="true">{rule.test(password)?"✓":"•"}</span> {rule.label}
   </li>)}
  </ul>
 </div>;
}
