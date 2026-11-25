const {chromium}=require("playwright");
const fs=require("node:fs");
const assert=require("node:assert/strict");
const BASE="https://artisanmart.site";
const OUT="auth-production-smoke-results";fs.mkdirSync(OUT,{recursive:true});
const checks=[];const errors=[];
async function check(name,fn){try{let actual=await fn();checks.push({name,status:"PASS",actual});console.log("PASS | "+name+" | "+JSON.stringify(actual).slice(0,220));}catch(e){checks.push({name,status:"FAIL",error:String(e.message).slice(0,400)});console.log("FAIL | "+name+" | "+String(e.message).slice(0,230));}}
(async()=>{
 const browser=await chromium.launch({headless:true,args:["--no-sandbox"]});
 const ctx=await browser.newContext({viewport:{width:1365,height:900},locale:"en-US"});
 const page=await ctx.newPage();
 page.on("pageerror",e=>errors.push(e.message));
 const visit=async route=>{const r=await page.goto(BASE+route,{waitUntil:"domcontentloaded",timeout:23000});assert(r&&r.status()<400,"HTTP "+r?.status());await page.waitForLoadState("networkidle",{timeout:12000}).catch(()=>{});};
 await check("Production Login/Register and original branded form",async()=>{
   await visit("/login");
   await page.locator('input[name=email]').waitFor();
   assert(await page.locator('.account-layout').count());
   await visit("/register");
   for(const field of ["firstName","lastName","phone","email","password","confirmation"])assert(await page.locator('input[name='+field+']').count(),field+" missing");
   return "Login and registration available on production";
 });
 await check("Dedicated Forgot Password form and navigation",async()=>{
   await visit("/forgot-password");
   await page.getByRole("button",{name:/Send Reset Link/i}).waitFor();
   await page.getByRole("link",{name:"Back to Login"}).click();
   await page.waitForURL(/\/login/);
   return "Production recovery form routes to Login";
 });
 await check("Invalid recovery link handled without exposing user account",async()=>{
   await visit("/reset-password");
   await page.getByText(/invalid, expired, or already used/i).waitFor();
   assert(await page.getByRole("link",{name:/Request New Link/i}).count());
   return "No reset form without authorized recovery session";
 });
 await check("Unauthenticated customer cannot reach checkout",async()=>{
   await visit("/checkout");
   await page.waitForURL(/\/login/,{timeout:12000});
   return "Guest redirected to Login";
 });
 await check("Guest cart preserves product count and $500 minimum",async()=>{
   await visit("/product/da883");
   await page.getByRole("radio",{name:/Order By Case/i}).check();
   await page.getByLabel("Case quantity").fill("4");
   await page.locator('button.purchase-submit').click();
   await visit("/cart");
   await page.getByText("40 pieces",{exact:false}).first().waitFor();
   assert((await page.locator(".cart-summary").innerText()).includes("$580.00"));
   await page.getByRole("link",{name:/Proceed to Checkout/i}).click();
   await page.waitForURL(/\/login/);
   const snapshot=await page.evaluate(()=>localStorage.getItem('artisan-mart-pending-checkout-cart'));
   assert(snapshot?.includes("DA883"),"Cart not persisted for intended checkout");
   return "40 pieces/$580, cart preserved after redirect";
 });
 await check("Desktop and mobile branded auth layouts",async()=>{
   let n=0;
   for(const [w,h] of [[1365,900],[390,844]]){
     const c=await browser.newContext({viewport:{width:w,height:h},deviceScaleFactor:1,reducedMotion:"reduce"});
     const p=await c.newPage();
     for(const route of ["login","register","forgot-password","reset-password"]){
       const r=await p.goto(BASE+"/"+route,{waitUntil:"networkidle",timeout:24000});assert(r?.ok());
       await p.locator(".account-layout").waitFor();
       await p.screenshot({path:OUT+"/"+route+"-"+w+".png",animations:"disabled"});
       n++;
     }
     await c.close();
   }
   return n+" screenshots captured";
 });
 await check("No JavaScript page errors",()=>{assert.equal(errors.length,0,errors.slice(0,5).join("; "));return 0;});
 fs.writeFileSync(OUT+"/report.json",JSON.stringify({checks,errors},null,2));
 await ctx.close();await browser.close();
 console.log("TOTAL "+checks.length+" PASS "+checks.filter(x=>x.status==="PASS").length+" FAIL "+checks.filter(x=>x.status==="FAIL").length);
 process.exitCode=checks.some(x=>x.status==="FAIL")?1:0;
})().catch(e=>{console.error("Browser harness failure: "+e.message);process.exitCode=1;});
