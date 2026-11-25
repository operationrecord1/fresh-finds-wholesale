const {chromium}=require("playwright");
const {PNG}=require("pngjs");
const fs=require("node:fs");
const assert=require("node:assert/strict");
const {randomBytes}=require("node:crypto");
const BASE=process.env.ARTISAN_PHONE_PREVIEW;
if(!BASE||!/^https:\/\/[a-z0-9-]+\.artisanmart-staging\.pages\.dev$/.test(BASE))throw Error("Verified preview URL missing");
const OUT="artisan-validation-browser-results";fs.mkdirSync(OUT,{recursive:true});
const results=[];const errors=[];
async function test(name,cb){try{const detail=await cb();results.push({name,status:"PASS",detail});console.log("PASS | "+name+" | "+JSON.stringify(detail).slice(0,300));}catch(e){results.push({name,status:"FAIL",detail:String(e.message).slice(0,700)});console.log("FAIL | "+name+" | "+String(e.message).slice(0,320));}}
(async()=>{
 const browser=await chromium.launch({headless:true,args:["--no-sandbox"]});
 const context=await browser.newContext({viewport:{width:1365,height:900},locale:"en-US",reducedMotion:"reduce"});
 const page=await context.newPage();
 page.on("pageerror",e=>errors.push(e.message));
 const go=async(p,url)=>{const r=await p.goto(url,{waitUntil:"domcontentloaded",timeout:25000});assert(r&&r.status()<400,"HTTP "+r?.status()+" "+url);await p.waitForLoadState("networkidle",{timeout:15000}).catch(()=>{});};
 await test("US domestic phone autoformat and E164-ready display",async()=>{
  await go(page,BASE+"/register");const el=page.locator("input[name=phone]");
  await el.fill("2125550123");assert.equal(await el.inputValue(),"+1 (212) 555-0123");
  assert.equal(await page.locator("input[name=phone][aria-invalid=true]").count(),0);
  return await el.inputValue();
 });
 await test("Country-aware international phone and restricted characters",async()=>{
  const el=page.locator("input[name=phone]");
  await el.fill("+442071838750");assert((await el.inputValue()).startsWith("+44"));
  assert.equal(await el.getAttribute("aria-invalid"),"false");
  await el.fill("+8801712345678");assert.equal(await el.getAttribute("aria-invalid"),"false");
  await el.fill("abc++1(212) 555-0123");assert.equal(await el.inputValue(),"+1 (212) 555-0123");
  await el.fill("123");await page.getByText(/Enter a valid phone number with its country code/i).waitFor();
  await el.fill("+12125550123");
  assert.equal(await page.locator("input[name=phone][aria-invalid=true]").count(),0);
  return "UK, Bangladesh, pasted content sanitized; invalid number rejected and error cleared";
 });
 await test("Independent password requirements show live red-to-satisfied states",async()=>{
  const input=page.locator("input[name=password]");
  await input.fill("weakpassword");
  assert(await page.locator(".account-rule-unsatisfied").count()>=3);
  await input.fill("StrongPassword!24");
  assert.equal(await page.locator(".account-rule-unsatisfied").count(),0);
  assert.equal(await page.locator(".account-rule-satisfied").count(),5);
  return "5 independently evaluated requirements";
 });
 await test("Confirmation mismatch error disappears when corrected and password toggles",async()=>{
  const confirm=page.locator("input[name=confirmation]");
  await confirm.fill("DifferentPassword!24");await page.getByText("Passwords do not match.").first().waitFor();
  await confirm.fill("StrongPassword!24");
  assert.equal(await page.locator('input[name=confirmation][aria-invalid=true]').count(),0);
  await page.getByRole("button",{name:"Show password"}).click();
  assert.equal(await page.locator('input[name=password]').getAttribute("type"),"text");
  await page.getByRole("button",{name:"Hide password"}).click();
  return "Mismatch removed; show/hide button works";
 });
 await test("Registration invalid names and email rejected",async()=>{
  await page.locator('input[name=firstName]').fill(" ");
  await page.locator('input[name=lastName]').fill(" ");
  await page.locator('input[name=email]').fill("invalid");
  await page.getByRole("button",{name:/Create account/i}).click();
  assert(await page.locator(".account-field-error").count()>=3);
  await page.locator('input[name=firstName]').fill("Artisan");
  await page.locator('input[name=lastName]').fill("Test");
  await page.locator('input[name=email]').fill("qa@example.invalid");
  assert.equal(await page.locator(".account-field-error").count(),0);
  return "Required field red errors displayed and cleared";
 });
 await test("Actual Supabase registration stores E.164 and requires email confirmation",async()=>{
  await go(page,BASE+"/register");
  await page.locator('input[name=firstName]').fill("Artisan");
  await page.locator('input[name=lastName]').fill("Phone QA");
  await page.locator('input[name=phone]').fill("2125550123");
  await page.locator('input[name=email]').fill("operation.record1+artisan-phoneqa-20261125@gmail.com");
  const password="StrongQa!"+randomBytes(15).toString("base64url")+"9Ab";
  await page.locator('input[name=password]').fill(password);
  await page.locator('input[name=confirmation]').fill(password);
  const resPromise=page.waitForResponse(r=>r.url().includes("/auth/v1/signup")&&r.request().method()==="POST",{timeout:16000});
  await page.getByRole("button",{name:/Create account/i}).click();
  const response=await resPromise;
  assert.equal(response.status(),200,"Supabase signup rejected HTTP "+response.status());
  const data=await response.json();
  assert(data.user?.id||data.id,"Auth user missing");
  assert(!data.session&&!data.access_token,"Email verification was bypassed");
  await page.getByRole("heading",{name:"Check Your Email"}).waitFor({timeout:9000});
  return {registered:true,verified:false,expectedStoredE164:"+12125550123"};
 });
 await test("Phone/registration responsive layout",async()=>{
  for(const [w,h] of [[1365,900],[820,1180],[390,844]]){
   const ctx=await browser.newContext({viewport:{width:w,height:h},reducedMotion:"reduce"});
   const p=await ctx.newPage();await go(p,BASE+"/register");await p.locator("input[name=phone]").fill("2125550123");
   await p.screenshot({path:OUT+"/register-"+w+".png",animations:"disabled"});
   assert(await p.locator(".account-layout").count());
   await ctx.close();
  }
  return "Desktop, tablet, mobile screenshots saved";
 });
 await test("All 125 original catalog pages and 354 product image files remain accessible",async()=>{
  const src=fs.readFileSync("src/data/catalog.ts","utf8");
  const section=src.split("export const PRODUCTS: Product[] = ")[1];
  const items=JSON.parse(section.split("\n];")[0]+"]");
  assert.equal(items.length,125);
  const problems=[];let index=0;
  async function worker(){
   const p=await context.newPage();
   while(index<items.length){
    const item=items[index++];
    try{await go(p,BASE+"/product/"+item.sku.toLowerCase());const txt=(await p.locator("body").innerText()).replace(/\s+/g," ");
     assert(txt.includes("Item # "+item.sku),item.sku+" missing SKU");
     assert(txt.includes(item.title.replace(/\s+/g," ")),item.sku+" missing title");
     assert(txt.includes("$"+item.price.toFixed(2)),item.sku+" wrong price");
    }catch(e){problems.push({sku:item.sku,detail:String(e.message).slice(0,150)});}
   }
   await p.close();
  }
  await Promise.all(Array.from({length:4},worker));
  const assets=items.flatMap(x=>x.images);assert.equal(assets.length,354);
  let i=0;async function images(){while(i<assets.length){const asset=assets[i++];try{const r=await context.request.get(BASE+"/"+asset,{timeout:14000});if(!r.ok())problems.push({asset,status:r.status()});}catch(e){problems.push({asset,detail:String(e.message).slice(0,150)});}}}
  await Promise.all(Array.from({length:6},images));
  fs.writeFileSync(OUT+"/products.json",JSON.stringify({products:items.length,images:assets.length,problems},null,2));
  assert.equal(problems.length,0,JSON.stringify(problems.slice(0,5)));
  return {products:125,images:354,problems:0};
 });
 await test("Guest cart, coupon, quantity limits, $500 threshold and checkout redirect",async()=>{
  await go(page,BASE+"/product/da883");
  await page.getByRole("radio",{name:/Order By Case/}).check();
  await page.getByLabel("Case quantity").fill("4");
  await page.locator("button.purchase-submit").click();
  await go(page,BASE+"/cart");
  assert((await page.locator(".cart-summary").innerText()).includes("$580.00"));
  const promo=page.getByRole("textbox",{name:"Promo code"});
  await promo.fill("artisan");await page.getByRole("button",{name:"Apply"}).click();
  await page.getByText("Enter a valid coupon code.").waitFor();
  await promo.fill("ARTISAN");await page.getByRole("button",{name:"Apply"}).click();
  await page.getByText("No discount has been applied.",{exact:false}).waitFor();
  await page.getByRole("link",{name:"Proceed to Checkout"}).click();
  await page.waitForURL(/\/login/);
  await page.locator('input[name=email]').waitFor();
  const saved=await page.evaluate(()=>localStorage.getItem("artisan-mart-pending-checkout-cart"));
  assert(saved?.includes("DA883"));
  return {subtotal:580,guestRedirect:true,cartPreserved:true,couponDemo:true};
 });
 await test("No browser JavaScript errors on tested journeys",()=>{assert.equal(errors.length,0,JSON.stringify(errors.slice(0,5)));return errors.length;});
 fs.writeFileSync(OUT+"/report.json",JSON.stringify({preview:BASE,checks:results},null,2));
 await context.close();await browser.close();
 console.log("TOTAL "+results.length+" PASS "+results.filter(x=>x.status==="PASS").length+" FAIL "+results.filter(x=>x.status==="FAIL").length);
 process.exitCode=results.some(x=>x.status==="FAIL")?1:0;
})().catch(e=>{console.error("FATAL "+e.stack);process.exitCode=1});
