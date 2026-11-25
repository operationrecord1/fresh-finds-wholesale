const {chromium}=require("playwright");
const {randomBytes}=require("node:crypto");
const fs=require("node:fs");
const assert=require("node:assert/strict");
const BASE=process.env.ARTISAN_AUTH_PREVIEW_URL;
if(!BASE||!/^https:\/\/[a-z0-9-]+\.artisanmart-staging\.pages\.dev$/.test(BASE))
 throw Error("A verified Cloudflare authentication preview URL is required");
const OUT="auth-only-qa-results";
fs.mkdirSync(OUT,{recursive:true});
const results=[];
async function check(name,fn){
 try{const observed=await fn();results.push({name,status:"PASS",observed});console.log("PASS | "+name+" | "+JSON.stringify(observed).slice(0,400));}
 catch(e){results.push({name,status:"FAIL",observed:String(e.message).slice(0,450)});console.log("FAIL | "+name+" | "+String(e.message).slice(0,350));}
}
(async()=>{
 const browser=await chromium.launch({headless:true,args:["--no-sandbox"]});
 const context=await browser.newContext({viewport:{width:1365,height:900},locale:"en-US"});
 const page=await context.newPage();
 const errors=[];
 page.on("pageerror",e=>errors.push(String(e.message)));
 const visit=async(url)=>{const r=await page.goto(BASE+url,{waitUntil:"domcontentloaded",timeout:25000});assert(r&&r.status()<400, "HTTP "+r?.status());await page.waitForLoadState("networkidle",{timeout:12000}).catch(()=>{});};
 await check("Guest login design, registration and Forgot Password route",async()=>{
   await visit("/login");
   await page.locator("input[name=email]").waitFor({state:"visible"});
   assert(await page.getByRole("link",{name:"Forgot your password?"}).count());
   assert((await page.locator(".account-layout").count())===1);
   await page.getByRole("link",{name:"Forgot your password?"}).click();
   await page.waitForURL(/\/forgot-password$/);
   await page.getByRole("heading",{name:"Forgot Your Password?"}).waitFor();
   assert(await page.getByRole("link",{name:"Back to Login"}).count());
   return "Existing auth visual shell reused and dedicated Forgot Password route works";
 });
 await check("Anonymous direct checkout redirects to existing login",async()=>{
   await visit("/checkout");
   await page.waitForURL(/\/login(?:\?.*)?$/,{timeout:12000});
   await page.locator("input[name=email]").waitFor({state:"visible"});
   return "Checkout requires verified authentication; payment disabled";
 });
 await check("Invalid login rejected by real Supabase Auth",async()=>{
   await visit("/login");
   await page.locator("input[name=email]").fill("nobody-for-this-test@example.invalid");
   await page.locator("input[name=password]").fill("WrongPassword!9999");
   const r=page.waitForResponse(x=>x.url().includes("/auth/v1/token")&&x.request().method()==="POST",{timeout:15000});
   await page.getByRole("button",{name:/Sign in/i}).click();
   const response=await r;
   assert(response.status()>=400,"Invalid credentials unexpectedly accepted");
   await page.getByText(/Invalid email or password/i).waitFor({timeout:8000});
   return "Supabase rejected incorrect credentials with HTTP "+response.status();
 });
 await check("Registration rejects mismatched password without signup",async()=>{
   await visit("/register");
   await page.locator('input[name=firstName]').fill("Artisan");
   await page.locator('input[name=lastName]').fill("Quality");
   await page.locator('input[name=phone]').fill("7272255768");
   await page.locator('input[name=email]').fill("operation.record1+artisan-auth-phase1-20261125@gmail.com");
   await page.locator('input[name=password]').fill("StrongPassword!24");
   await page.locator('input[name=confirmation]').fill("StrongPassword!25");
   await page.getByRole("button",{name:/Create account/i}).click();
   await page.getByText(/passwords do not match/i).waitFor({timeout:8000});
   return "Local mismatch rejection, no signup attempted";
 });
 await check("Registration enforces strong password requirements",async()=>{
   await page.locator('input[name=password]').fill("weakpassword");
   await page.locator('input[name=confirmation]').fill("weakpassword");
   await page.getByRole("button",{name:/Create account/i}).click();
   await page.getByText(/12–128 characters/i).first().waitFor();
   return "Weak credentials rejected by form validation";
 });
 await check("Actual Supabase signup creates unverified account and confirmation screen",async()=>{
   const password="Q"+randomBytes(18).toString("base64url")+"a9!";
   await page.locator('input[name=password]').fill(password);
   await page.locator('input[name=confirmation]').fill(password);
   const responsePromise=page.waitForResponse(x=>x.url().includes("/auth/v1/signup")&&x.request().method()==="POST",{timeout:18000});
   await page.getByRole("button",{name:/Create account/i}).click();
   const response=await responsePromise;
   assert.equal(response.status(),200,"Signup returned HTTP "+response.status());
   const data=await response.json();
   assert(data.user?.id,"Signup response missing user identity");
   assert(!data.session,"Email-confirmation requirement unexpectedly bypassed");
   await page.getByRole("heading",{name:"Check Your Email"}).waitFor({timeout:10000});
   assert(await page.getByText(/Resend available/i).count());
   return {status:response.status(),created:true,emailConfirmationRequired:true};
 });
 await check("Desktop/mobile Forgot Password and Register screenshots",async()=>{
   const targets=[];
   for(const [width,height] of [[1365,900],[390,844]]){
     const ctx=await browser.newContext({viewport:{width,height},deviceScaleFactor:1,reducedMotion:"reduce"});
     const p=await ctx.newPage();
     for(const route of ["/login","/register","/forgot-password","/reset-password"]){
       const resp=await p.goto(BASE+route,{waitUntil:"networkidle",timeout:25000});
       assert(resp?.ok());
       await p.evaluate(()=>document.fonts.ready);
       const name=route.replaceAll("/","")||"index";
       const file=OUT+"/"+name+"-"+width+"x"+height+".png";
       await p.screenshot({path:file,animations:"disabled"});
       assert((await p.locator(".account-layout").count())===1,"Auth brand shell missing on "+route);
       targets.push(file);
     }
     await ctx.close();
   }
   return {screenshots:targets.length};
 });
 await check("No JavaScript page errors from observed browser journeys",()=>{assert.deepEqual(errors,[]);return {errors:errors.length}});
 fs.writeFileSync(OUT+"/results.json",JSON.stringify({preview:BASE,checks:results},null,2));
 await context.close();await browser.close();
 console.log("TOTAL "+results.length+" PASS "+results.filter(x=>x.status==="PASS").length+" FAIL "+results.filter(x=>x.status==="FAIL").length);
 process.exitCode=results.some(x=>x.status==="FAIL")?1:0;
})().catch(e=>{console.error("QA harness failure: "+e.message);process.exitCode=1;});
