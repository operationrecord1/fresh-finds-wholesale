const {chromium}=require("playwright");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const BASE="https://artisanmart.site",OUT="artisan-production-auth-smoke";
fs.mkdirSync(OUT,{recursive:true});
const checks=[];
async function run(name,callback){try{const detail=await callback();checks.push({name,status:"PASS",detail});console.log("PASS "+name);}catch(e){checks.push({name,status:"FAIL",detail:String(e.message)});console.error("FAIL "+name+": "+e.message);}}
(async()=>{
 const browser=await chromium.launch({headless:true,args:["--no-sandbox"]});
 const context=await browser.newContext({viewport:{width:1365,height:900},reducedMotion:"reduce"});
 const page=await context.newPage();const errors=[];page.on("pageerror",e=>errors.push(e.message));
 const go=async(path)=>{const r=await page.goto(BASE+path,{waitUntil:"domcontentloaded",timeout:30000});assert(r&&r.ok(),"HTTP "+r?.status());await page.waitForLoadState("networkidle",{timeout:12000}).catch(()=>{});};
 await run("Registration consent enforced without submitting real account",async()=>{
   await go("/register");
   assert(await page.locator('input[name="agreement"]').count(),"Release not yet visible");
   await page.locator('input[name="firstName"]').fill("Artisan");
   await page.locator('input[name="lastName"]').fill("Customer");
   await page.locator('input[name="phone"]').fill("2125550123");
   await page.locator('input[name="email"]').fill("test@example.com");
   await page.locator('input[name="password"]').fill("ExamplePassword!24");
   await page.locator('input[name="confirmation"]').fill("ExamplePassword!24");
   await page.getByRole("button",{name:/Create account/i}).click();
   assert(await page.getByText(/accept the Terms of Sale and Privacy Policy/i).count());
   assert.equal(await page.getByRole("heading",{name:"Check Your Email"}).count(),0);
   await page.locator('input[name="agreement"]').check();
   assert.equal(await page.getByText(/You must agree to/i).count(),0);
   return "Consent required and correction clears error";
 });
 await run("Country-aware phone input and independent password rules",async()=>{
   await go("/register");const phone=page.locator('input[name="phone"]');
   await phone.fill("2125550123");assert.equal(await phone.inputValue(),"+1 (212) 555-0123");
   await phone.fill("+442071838750");assert.notEqual(await phone.getAttribute("aria-invalid"),"true");
   await phone.fill("+8801712345678");assert.notEqual(await phone.getAttribute("aria-invalid"),"true");
   await phone.fill("123");assert.equal(await phone.getAttribute("aria-invalid"),"true");
   const password=page.locator('input[name="password"]');
   await password.fill("weak");assert(await page.locator(".account-rule-unsatisfied").count()>0);
   await password.fill("StrongPassword!24");assert.equal(await page.locator(".account-rule-unsatisfied").count(),0);
   await page.locator('input[name="confirmation"]').fill("different");assert(await page.getByText("Passwords do not match.").count());
   return "US/UK/BD phone, invalid number, password rules and mismatch";
 });
 await run("Forgot Password email validation",async()=>{
   await go("/forgot-password");
   await page.locator('input[name="email"]').fill("not-an-email");
   await page.getByRole("button",{name:/Send Reset Link/i}).click();
   assert(await page.getByText(/Enter a valid email address/i).count());
   await page.locator('input[name="email"]').fill("customer@example.com");
   assert.equal(await page.locator('input[name="email"][aria-invalid="true"]').count(),0);
   return "Malformed rejected, valid syntax accepted without requesting an email";
 });
 await run("Unauthorized checkout login redirect",async()=>{
   await go("/checkout");await page.waitForURL(/\/login/,{timeout:12000});
   return "Protected checkout redirect";
 });
 await run("Mobile auth design",async()=>{
   await page.setViewportSize({width:390,height:844});
   await go("/register");assert.equal(await page.locator(".account-layout").count(),1);
   await page.screenshot({path:OUT+"/register-mobile.png",animations:"disabled"});
   await go("/forgot-password");await page.screenshot({path:OUT+"/forgot-mobile.png",animations:"disabled"});
   return "390px mobile screenshots";
 });
 await run("Anonymous account page does not reveal customer profile",async()=>{
   await page.setViewportSize({width:1365,height:900});
   await go("/account");
   await page.getByText(/Please sign in to view your account/i).waitFor({timeout:10000});
   assert.equal(await page.getByText(/Signed in as/i).count(),0);
   return "Protected account data not shown to logged-out visitor";
 });
 await run("Reset Password without recovery token is rejected",async()=>{
   await go("/reset-password");
   await page.getByText(/recovery link is invalid, expired, or already used/i).waitFor({timeout:10000});
   assert.equal(await page.locator('input[name="password"]').count(),0);
   return "Recovery form unavailable without valid session";
 });
 await run("No client exceptions",async()=>{assert.deepEqual(errors,[]);return "none";});
 fs.writeFileSync(OUT+"/results.json",JSON.stringify({origin:BASE,at:new Date().toISOString(),checks},null,2));
 await browser.close();process.exitCode=checks.some(x=>x.status==="FAIL")?1:0;
})().catch(e=>{console.error(String(e));process.exitCode=1;});
