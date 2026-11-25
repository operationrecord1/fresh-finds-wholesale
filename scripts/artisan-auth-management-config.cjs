#!/usr/bin/env node
/**
 * Artisan Mart Auth configuration via official Supabase Management API.
 * Run only from the controlled GitHub workflow; never log credentials or raw config.
 * VERIFY prints booleans; APPLY updates only the two existing email templates,
 * and configures Brevo SMTP only when two dedicated workflow secrets are present.
 * Actual delivery and password recovery still require separate end-to-end tests.
 */
const fs=require("node:fs");
const path=require("node:path");
const {createHash}=require("node:crypto");

const REF="gbsyaembvdtadkuldpbe";
const MODE=process.env.AUTH_CONFIG_MODE||"verify";
const PAT=process.env.SUPABASE_MANAGEMENT_TOKEN;
const BREVO_LOGIN=process.env.BREVO_SMTP_LOGIN||"";
const BREVO_KEY=process.env.BREVO_SMTP_KEY||"";
const ENDPOINT="https://api.supabase.com/v1/projects/"+REF+"/config/auth";
const SUBJECT_CONFIRM="Welcome to Artisan Mart — Verify Your Email Address";
const SUBJECT_RECOVER="Reset Your Artisan Mart Password";
const FROM="finance@artisanmart.site";
if(!["verify","apply"].includes(MODE))throw Error("Mode must be verify or apply");
if(!PAT)throw Error("Missing SUPABASE_MANAGEMENT_TOKEN GitHub Actions secret. No changes made.");
if(Boolean(BREVO_LOGIN)!==Boolean(BREVO_KEY))throw Error("BREVO_SMTP_LOGIN and BREVO_SMTP_KEY must either both exist or both be absent.");
const local={
  confirm:fs.readFileSync(path.join(__dirname,"..","supabase/email-templates/confirm-signup.html"),"utf8"),
  recover:fs.readFileSync(path.join(__dirname,"..","supabase/email-templates/reset-password.html"),"utf8")
};
for(const [kind,html] of Object.entries(local)){
 if(!html.includes("{{ .ConfirmationURL }}")||!html.includes("<!doctype html>")||html.length<500)
  throw Error("Invalid local "+kind+" HTML template; no changes made");
}
async function request(method,body){
 const res=await fetch(ENDPOINT,{method,headers:{"Authorization":"Bearer "+PAT,"Content-Type":"application/json","Accept":"application/json"},...(body?{body:JSON.stringify(body)}:{})});
 if(!res.ok())throw Error("Supabase Management API "+method+" failed HTTP "+res.status+" (check access permissions and project settings)");
 return await res.json();
}
const digest=s=>createHash("sha256").update(s).digest("hex").slice(0,16);
async function main(){
 const before=await request("GET");
 const config=before?.result||before;
 const existingSMTP=String(config.smtp_host||"").toLowerCase()==="smtp-relay.brevo.com";
 const providedSMTP=Boolean(BREVO_LOGIN&&BREVO_KEY);
 if(MODE==="apply"){
  if(!existingSMTP&&!providedSMTP)throw Error("Custom Brevo SMTP not configured and dedicated SMTP credentials not provided. No templates applied.");
  if(!providedSMTP&&String(config.smtp_admin_email||"").toLowerCase()!==FROM)
   throw Error("Existing SMTP From address does not match finance@artisanmart.site. Fix sender first.");
  const patch={
   mailer_subjects_confirmation:SUBJECT_CONFIRM,
   mailer_subjects_recovery:SUBJECT_RECOVER,
   mailer_templates_confirmation_content:local.confirm,
   mailer_templates_recovery_content:local.recover,
  };
  if(providedSMTP){
    Object.assign(patch,{
      smtp_host:"smtp-relay.brevo.com",
      smtp_port:"587",
      smtp_user:BREVO_LOGIN,
      smtp_pass:BREVO_KEY,
      smtp_admin_email:FROM,
      smtp_sender_name:"Artisan Mart",
      external_email_enabled:true,
      mailer_autoconfirm:false
    });
  }
  await request("PATCH",patch);
 }
 const afterRaw=await request("GET");
 const after=afterRaw?.result||afterRaw;
 const report={
  project:REF,mode:MODE,
  customBrevoHostConfigured:String(after.smtp_host||"").toLowerCase()==="smtp-relay.brevo.com",
  senderAddressMatches:String(after.smtp_admin_email||"").toLowerCase()===FROM,
  senderNameMatches:after.smtp_sender_name==="Artisan Mart",
  emailConfirmationRequired:after.mailer_autoconfirm===false,
  confirmationSubjectMatches:after.mailer_subjects_confirmation===SUBJECT_CONFIRM,
  recoverySubjectMatches:after.mailer_subjects_recovery===SUBJECT_RECOVER,
  confirmationHTMLMatches:after.mailer_templates_confirmation_content===local.confirm,
  recoveryHTMLMatches:after.mailer_templates_recovery_content===local.recover,
  templateFingerprints:{confirmation:digest(local.confirm),recovery:digest(local.recover)},
  siteURLMatches:typeof after.site_url==="string"&&after.site_url.replace(/\/$/,"")==="https://artisanmart.site",
  approvedRedirectsContainRoutes:typeof after.uri_allow_list==="string"&&
   ["https://artisanmart.site/login","https://artisanmart.site/reset-password"].every(x=>after.uri_allow_list.includes(x)),
  deliveryVerified:false,
  fullPasswordRecoveryVerified:false,
 };
 fs.mkdirSync("auth-config-verification",{recursive:true});
 fs.writeFileSync("auth-config-verification/report.json",JSON.stringify(report,null,2));
 console.log("Auth config verification (no credentials or email tokens):",JSON.stringify(report));
 const checks=["customBrevoHostConfigured","senderAddressMatches","senderNameMatches",
  "emailConfirmationRequired","confirmationSubjectMatches","recoverySubjectMatches",
  "confirmationHTMLMatches","recoveryHTMLMatches","siteURLMatches","approvedRedirectsContainRoutes"];
 if(checks.some(k=>report[k]!==true))throw Error("Auth configuration verification incomplete. See sanitized report; user action may be required.");
 console.log("Configuration verified. Separate external inbox / real auth browser tests are mandatory.");
}
main().catch(e=>{console.error(e.message);process.exitCode=1;});
