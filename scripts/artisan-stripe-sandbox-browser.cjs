const {chromium}=require("playwright");
const {randomBytes}=require("node:crypto");
const fs=require("node:fs");
const PREVIEW="https://1abfd514.artisanmart-staging.pages.dev";
const QA_EMAIL="operation.record1+artisan-stripesandbox-"+process.env.GITHUB_RUN_ID+"@gmail.com";
const QA_PASSWORD="Qa!"+randomBytes(18).toString("base64url")+"9Ab";
const dir="stripe-test-evidence";
fs.mkdirSync(dir,{recursive:true});
const results=[];
function report(name,status,detail){results.push({name,status,detail});console.log(status+" | "+name+" | "+detail);}
async function visit(page,path){const r=await page.goto(PREVIEW+path,{waitUntil:"domcontentloaded",timeout:30000});if(!r?.ok())throw Error("Preview HTTP "+r?.status());await page.waitForLoadState("networkidle",{timeout:12000}).catch(()=>{});}
(async()=>{
const browser=await chromium.launch({headless:true,args:["--no-sandbox"]});
const context=await browser.newContext({viewport:{width:1366,height:900}});
const page=await context.newPage();
let publicKey="";
page.on("request",req=>{
 if(req.url().includes("/auth/v1/token")&&req.headers().apikey)publicKey=req.headers().apikey;
});
try{
 await visit(page,"/register");
 await page.locator('input[name="firstName"]').fill("Artisan");
 await page.locator('input[name="lastName"]').fill("Sandbox");
 await page.locator('input[name="phone"]').fill("2125550123");
 await page.locator('input[name="email"]').fill(QA_EMAIL);
 await page.locator('input[name="password"]').fill(QA_PASSWORD);
 await page.locator('input[name="confirmation"]').fill(QA_PASSWORD);
 await page.locator('input[name="agreement"]').check();
 const signupPending=page.waitForResponse(r=>r.url().includes("/auth/v1/signup")&&r.request().method()==="POST",{timeout:22000});
 await page.getByRole("button",{name:/Create account/i}).click();
 const signup=await signupPending;
 if(signup.status()!==200)throw Error("Signup HTTP "+signup.status());
 report("New controlled test account","PASS","Supabase signup HTTP 200, email verification required");
 console.log("VERIFY_EMAIL_IN_INBOX "+QA_EMAIL);
 let signedIn=false;
 for(let i=0;i<36;i++){
  await page.waitForTimeout(9000);
  await visit(page,"/login");
  await page.locator('input[name="email"]').fill(QA_EMAIL);
  await page.locator('input[name="password"]').fill(QA_PASSWORD);
  const pending=page.waitForResponse(r=>r.url().includes("/auth/v1/token")&&r.request().method()==="POST",{timeout:16000});
  await page.getByRole("button",{name:/Sign in/i}).click();
  if((await pending).status()===200){signedIn=true;break;}
 }
 if(!signedIn)throw Error("Email verification/login did not complete");
 report("Real verified QA login","PASS","Authenticated preview browser login");
 await visit(page,"/product/da883");
 await page.getByRole("radio",{name:/Order By Case/i}).check();
 await page.getByLabel("Case quantity").fill("4");
 await page.locator("button.purchase-submit").click();
 await visit(page,"/cart");
 if(!(await page.locator(".cart-summary").innerText()).includes("$580.00"))throw Error("Unexpected cart total");
 report("Cart amount","PASS","40 units, $580, verified catalog");
 await visit(page,"/checkout");
 await page.getByText("Billing Address").first().waitFor();
 const billing={first_name:"Artisan",last_name:"Sandbox",phone:"2125550123",line1:"123 Main St",city:"Austin",state:"TX",postal_code:"78701",country:"US"};
 const payload={idempotencyKey:"qa"+randomBytes(24).toString("hex"),items:[{sku:"DA883",mode:"case",quantity:40}],billing,shipping:billing,coupon:"ARTISAN"};
 const result=await page.evaluate(async({key,payload})=>{
  const raw=localStorage.getItem("artisanmart-customer-auth");
  const auth=raw?JSON.parse(raw):null;
  if(!auth?.access_token)return {status:401,error:"Browser session unavailable"};
  const response=await fetch("https://gbsyaembvdtadkuldpbe.supabase.co/functions/v1/artisan-create-checkout-sandbox",{
   method:"POST",headers:{"Content-Type":"application/json",apikey:key,Authorization:"Bearer "+auth.access_token},
   body:JSON.stringify(payload)
  });
  const data=await response.json().catch(()=>({}));
  return {status:response.status,checkout_url:data.checkout_url||null,error:data.error||null};
 },{key:publicKey,payload});
 const valid=result.status===200&&typeof result.checkout_url==="string"&&
  result.checkout_url.startsWith("https://checkout.stripe.com/")&&result.checkout_url.includes("cs_test_");
 report("Real Stripe test Checkout Session",valid?"PASS":"FAIL","HTTP "+result.status+"; test Session="+valid+"; error="+String(result.error||"none"));
 if(!valid)throw Error("Real test-mode Checkout Session not created");
 await page.goto(result.checkout_url,{waitUntil:"domcontentloaded",timeout:35000});
 await page.screenshot({path:dir+"/stripe-test-checkout.png",animations:"disabled"});
 report("Stripe-hosted test Checkout opened","PASS","Test-mode Stripe checkout UI loaded");
}catch(e){report("Full Stripe test flow","FAIL",String(e.message).slice(0,260));}
fs.writeFileSync(dir+"/results.json",JSON.stringify({qaEmail:QA_EMAIL,checks:results},null,2));
await browser.close();
if(results.some(r=>r.status==="FAIL"))process.exitCode=1;
})().catch(e=>{console.error("Fatal QA: "+e.message);process.exitCode=1;});
