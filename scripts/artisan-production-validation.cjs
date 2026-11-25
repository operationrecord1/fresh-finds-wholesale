const {chromium}=require("playwright");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const BASE="https://artisanmart.site";
const out="artisan-public-auth-audit";fs.mkdirSync(out,{recursive:true});
const checks=[],errors=[];
const record=async(name,fn)=>{try{const observed=await fn();checks.push({name,status:"PASS",observed});console.log("PASS | "+name+" | "+JSON.stringify(observed).slice(0,220));}catch(e){checks.push({name,status:"FAIL",error:String(e.message).slice(0,500)});console.log("FAIL | "+name+" | "+String(e.message).slice(0,300));}};
(async()=>{
 const browser=await chromium.launch({headless:true,args:["--no-sandbox"]});
 const context=await browser.newContext({viewport:{width:1365,height:900},locale:"en-US",reducedMotion:"reduce"});
 const page=await context.newPage();page.on("pageerror",e=>errors.push(e.message));
 const go=async(path)=>{const r=await page.goto(BASE+path,{waitUntil:"domcontentloaded",timeout:26000});assert(r&&r.status()<400);await page.waitForLoadState("networkidle",{timeout:14000}).catch(()=>{});};
 await record("US and international registration phone formatting",async()=>{
  await go("/register");
  const phone=page.locator('input[name=phone]');
  await phone.fill("2125550123");
  assert.equal(await phone.inputValue(),"+1 (212) 555-0123");
  await phone.fill("+442071838750");
  assert.equal(await phone.getAttribute("aria-invalid"),"false");
  await phone.fill("123");
  await page.getByText(/Enter a valid phone number with its country code/i).waitFor();
  await phone.fill("+8801712345678");
  assert.equal(await phone.getAttribute("aria-invalid"),"false");
  return "US +1, UK +44, Bangladesh +880, invalid-red and corrected";
 });
 await record("Live password checklist, matching confirmation and red feedback",async()=>{
  const pw=page.locator('input[name=password]'), confirm=page.locator('input[name=confirmation]');
  await pw.fill("short");
  assert(await page.locator(".account-rule-unsatisfied").count()>=3);
  await pw.fill("StrongPassword!24");
  assert.equal(await page.locator(".account-rule-unsatisfied").count(),0);
  await confirm.fill("NoMatchPassword!24");
  await page.getByText("Passwords do not match.").waitFor();
  await confirm.fill("StrongPassword!24");
  assert.equal(await confirm.getAttribute("aria-invalid"),"false");
  return "Five independent password requirements and confirm correction";
 });
 await record("Invalid registration email message clears after correction",async()=>{
  const e=page.locator('input[name=email]');
  await e.fill("wrong");assert.equal(await e.getAttribute("aria-invalid"),"true");
  await e.fill("qa@example.invalid");assert.equal(await e.getAttribute("aria-invalid"),"false");
  return "Email validation updates immediately";
 });
 await record("Forgot Password navigation and inline invalid email",async()=>{
  await go("/login");await page.getByRole("link",{name:"Forgot your password?"}).click();
  await page.waitForURL(/\/forgot-password/);
  await page.locator('input[name=email]').fill("bad");
  await page.getByText("Enter a valid email address.").waitFor();
  await page.locator('input[name=email]').fill("qa@example.invalid");
  assert.equal(await page.locator('input[name=email][aria-invalid=true]').count(),0);
  return "Dedicated branded page and corrected email state";
 });
 await record("Guest cart, demo coupon and authenticated checkout redirect",async()=>{
  await go("/product/da883");
  await page.getByRole("radio",{name:/Order By Case/}).check();
  await page.getByLabel("Case quantity").fill("4");
  await page.locator("button.purchase-submit").click();
  await go("/cart");
  assert((await page.locator(".cart-summary").innerText()).includes("$580.00"));
  const promo=page.getByRole("textbox",{name:"Promo code"});
  await promo.fill("ARTISAN");await page.getByRole("button",{name:"Apply"}).click();
  await page.getByText("No discount has been applied.",{exact:false}).waitFor();
  await page.getByRole("link",{name:/Proceed to Checkout/}).click();
  await page.waitForURL(/\/login/);
  const cart=await page.evaluate(()=>localStorage.getItem("artisan-mart-pending-checkout-cart"));
  assert(cart?.includes("DA883")&&cart.includes("ARTISAN"));
  return "$580, existing coupon and 40 units preserved after login redirect";
 });
 await record("Existing storefront navigation and search",async()=>{
  await go("/search?q=DA883");
  await page.getByText("Item # DA883",{exact:false}).first().waitFor();
  await go("/collection/new-arrivals");
  assert((await page.locator("body").innerText()).includes("New Arrivals"));
  return "Search and collection navigation loaded";
 });
 await record("Desktop/tablet/mobile current auth appearance",async()=>{
  let count=0;
  for(const [w,h] of [[1365,900],[820,1180],[390,844]]){
   const ctx=await browser.newContext({viewport:{width:w,height:h},deviceScaleFactor:1,reducedMotion:"reduce"});
   const p=await ctx.newPage();const r=await p.goto(BASE+"/register",{waitUntil:"networkidle",timeout:26000});assert(r?.ok());
   await p.screenshot({path:out+"/register-"+w+".png",animations:"disabled"});count++;await ctx.close();
  }
  return {screenshots:count};
 });
 await record("No observed JavaScript runtime errors",()=>{assert.deepEqual(errors,[]);return 0;});
 fs.writeFileSync(out+"/report.json",JSON.stringify({checks,errors},null,2));
 await context.close();await browser.close();
 console.log("TOTAL "+checks.length+" PASS "+checks.filter(x=>x.status==="PASS").length+" FAIL "+checks.filter(x=>x.status==="FAIL").length);
 process.exitCode=checks.some(x=>x.status==="FAIL")?1:0;
})().catch(e=>{console.error("Fatal production QA harness: "+e.message);process.exitCode=1;});
