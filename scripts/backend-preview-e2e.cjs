const { chromium } = require("playwright");
const { PNG } = require("pngjs");
const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");

const BASE = process.env.ARTISAN_PREVIEW_URL;
const LIVE = "https://artisanmart.site";
if(!BASE || !BASE.startsWith("https://") || !BASE.endsWith(".artisanmart-staging.pages.dev"))
  throw new Error("A verified Cloudflare development preview URL is required.");
const dir="artisan-backend-qa-results";
fs.mkdirSync(dir,{recursive:true});
const results=[], errors=[];
const browser=undefined;
const record=(name,status,detail)=>{results.push({name,status,detail});console.log(status+" | "+name+" | "+JSON.stringify(detail).slice(0,500));};
async function verify(name,run){try{record(name,"PASS",await run());}catch(e){record(name,"FAIL",String(e.stack||e.message).slice(0,2800));}}
const start=async()=>{
 const chrome=await chromium.launch({headless:true,args:["--no-sandbox"]});
 const context=await chrome.newContext({viewport:{width:1365,height:900},locale:"en-US",reducedMotion:"reduce"});
 const page=await context.newPage();
 page.on("pageerror",e=>errors.push({kind:"js",message:e.message,url:page.url()}));
 page.on("requestfailed",r=>{
  if(!String(r.failure()?.errorText).includes("ERR_ABORTED"))
   errors.push({kind:"network",url:r.url(),reason:r.failure()?.errorText});
 });
 async function navigate(p,url){
  const response=await p.goto(url,{waitUntil:"domcontentloaded",timeout:30000});
  assert(response&&response.status()<400,url+" HTTP "+response?.status());
  await p.waitForLoadState("networkidle",{timeout:15000}).catch(()=>{});
  await p.locator("body").waitFor();
 }
 await verify("Supabase authoritative REST catalog loads all 125 products",async()=>{
  const responsePromise=page.waitForResponse(r=>r.url().includes("/rest/v1/artisan_catalog_available")&&r.request().method()==="GET",{timeout:22000});
  await navigate(page,BASE+"/");
  const response=await responsePromise;
  assert.equal(response.status(),200);
  const records=await response.json();
  assert.equal(records.length,125);
  assert.equal(new Set(records.map(x=>x.sku)).size,125);
  assert.equal(records.flatMap(x=>x.images).length,354);
  await page.locator("h1.store-home-title").waitFor();
  return {catalogue:125,images:354,skuSample:records.find(x=>x.sku==="DA883")?.sku};
 });
 await verify("Logged-out header design and guest product browsing",async()=>{
  assert(await page.locator(".store-login-link").first().isVisible());
  assert((await page.locator(".store-login-link").first().innerText()).includes("Login"));
  await navigate(page,BASE+"/product/da883");
  await page.getByText("Item # DA883",{exact:false}).first().waitFor();
  assert((await page.locator("body").innerText()).includes("$14.50"));
  return "guest product page, price and login header rendered";
 });
 await verify("Guest cart, quantity/price, coupon and auth-protected checkout",async()=>{
  await page.getByRole("radio",{name:/Order By Case/}).check();
  await page.getByLabel("Case quantity").fill("4");
  await page.locator("button.purchase-submit").click();
  await navigate(page,BASE+"/cart");
  await page.getByText("40 pieces",{exact:false}).first().waitFor();
  assert((await page.locator(".cart-summary").innerText()).includes("$580.00"));
  const promo=page.getByRole("textbox",{name:"Promo code"});
  await promo.fill("artisan");
  await page.getByRole("button",{name:"Apply"}).click();
  await page.getByText("Enter a valid coupon code.").waitFor();
  await promo.fill("ARTISAN");
  await page.getByRole("button",{name:"Apply"}).click();
  await page.getByText("No discount has been applied.",{exact:false}).waitFor();
  await page.getByRole("link",{name:"Proceed to Checkout"}).click();
  await page.waitForURL(/\/login(?:\?.*)?$/,{timeout:12000});
  await page.locator("input[name=email]").waitFor({state:"visible",timeout:12000});
  const saved=await page.evaluate(()=>localStorage.getItem("artisan-mart-pending-checkout-cart"));
  assert(saved?.includes("DA883"),"guest cart snapshot missing");
  return {subtotal:580,loginRedirect:true,snapshot:true};
 });
 await verify("Checkout cart restores in separate verification tab",async()=>{
  const second=await context.newPage();
  await navigate(second,BASE+"/cart");
  await second.getByText("40 pieces",{exact:false}).first().waitFor({timeout:15000});
  assert((await second.locator(".cart-summary").innerText()).includes("$580.00"));
  await second.close();
  return "40 pieces and $580 restored from checkout snapshot";
 });
 await verify("Direct anonymous checkout blocks payment fields and creates no order",async()=>{
  const second=await context.browser().newContext({viewport:{width:1280,height:800}});
  const p=await second.newPage();
  await navigate(p,BASE+"/checkout");
  await p.waitForURL(/\/login(?:\?.*)?$/,{timeout:12000});
  assert.equal(await p.getByLabel("Card number").count(),0);
  assert.equal(await p.getByText("Thank You for Your Purchase!").count(),0);
  await second.close();
  return "unauthenticated direct URL returns login, no payment capture";
 });
 await verify("Product search and category filtering",async()=>{
  await navigate(page,BASE+"/search?q=DA883");
  await page.getByText("Item # DA883",{exact:false}).first().waitFor();
  await navigate(page,BASE+"/collection/new-arrivals");
  await page.getByRole("combobox",{name:"Sort"}).selectOption("price-asc");
  await page.locator("aside label").filter({hasText:"$10.01 +"}).first().click();
  await page.getByRole("button",{name:"Clear All"}).click();
  return "search, price sort, filter and clear worked";
 });
 await verify("All 125 product routes and all 354 image assets load",async()=>{
  const catalog=JSON.parse(fs.readFileSync("src/data/catalog.ts","utf8")
   .split("export const PRODUCTS: Product[] = ")[1].split("\n];")[0]+"]");
  assert.equal(catalog.length,125);
  const problems=[];let cursor=0;
  async function worker(){
   const p=await context.newPage();
   while(cursor<catalog.length){
    const x=catalog[cursor++];
    try{await navigate(p,BASE+"/product/"+x.sku.toLowerCase());
      await p.getByText("Item # "+x.sku,{exact:false}).first().waitFor({timeout:12000});
      const visible=await p.locator("body").innerText();
      assert(visible.includes(x.title.replace(/\s+/g," "))||visible.replace(/\s+/g," ").includes(x.title.replace(/\s+/g," ")));
      assert(visible.includes(x.stock.toLocaleString("en-US")));
      assert(visible.includes("$"+x.price.toFixed(2)));
    }catch(e){problems.push({sku:x.sku,reason:String(e.message).slice(0,120)});}
   }
   await p.close();
  }
  await Promise.all(Array.from({length:4},worker));
  const assets=[...new Set(catalog.flatMap(x=>x.images))];
  let i=0;async function images(){
   while(i<assets.length){const img=assets[i++];
    try{const response=await context.request.get(BASE+"/"+img,{timeout:16000});
     if(!response.ok()||!(response.headers()["content-type"]||"").includes("image/"))problems.push({image:img,status:response.status()});
    }catch(e){problems.push({image:img,reason:String(e.message).slice(0,150)});}
   }
  }
  await Promise.all(Array.from({length:5},images));
  fs.writeFileSync(path.join(dir,"catalog.json"),JSON.stringify({tested:catalog.length,images:assets.length,problems},null,2));
  assert.equal(problems.length,0,JSON.stringify(problems.slice(0,6)));
  return {products:125,images:354,failures:0};
 });
 await verify("Desktop and mobile screenshot parity with unchanged production",async()=>{
  const comparisons=[];
  for(const [w,h] of [[1365,900],[390,844]]){
   const snapshots=[];
   for(const [label,url] of [["preview",BASE],["production",LIVE]]){
    const ctx=await chrome.newContext({viewport:{width:w,height:h},deviceScaleFactor:1,reducedMotion:"reduce",locale:"en-US"});
    const p=await ctx.newPage();
    await navigate(p,url+"/");
    await p.evaluate(()=>document.fonts.ready);
    await p.waitForTimeout(1500);
    const file=path.join(dir,label+"-"+w+"x"+h+".png");
    await p.screenshot({path:file,animations:"disabled"});
    snapshots.push({file,ctx});
   }
   const a=PNG.sync.read(fs.readFileSync(snapshots[0].file));
   const b=PNG.sync.read(fs.readFileSync(snapshots[1].file));
   assert.equal(a.width,b.width);assert.equal(a.height,b.height);
   let changed=0;
   for(let k=0;k<a.data.length;k+=4){
    if(Math.max(Math.abs(a.data[k]-b.data[k]),Math.abs(a.data[k+1]-b.data[k+1]),Math.abs(a.data[k+2]-b.data[k+2]))>24)changed++;
   }
   const ratio=changed/(w*h);comparisons.push({width:w,height:h,changedPixels:changed,ratio});
   await Promise.all(snapshots.map(x=>x.ctx.close()));
   assert(ratio<0.02,"Visual difference beyond 2% threshold "+JSON.stringify(comparisons));
  }
  fs.writeFileSync(path.join(dir,"visual.json"),JSON.stringify(comparisons,null,2));
  return comparisons;
 });
 await verify("Database outage fails closed rather than serving static outdated prices",async()=>{
  const ctx=await chrome.newContext({viewport:{width:1280,height:800}});
  await ctx.route("https://gbsyaembvdtadkuldpbe.supabase.co/rest/v1/**",route=>route.abort());
  const p=await ctx.newPage();
  const response=await p.goto(BASE+"/product/da883",{waitUntil:"domcontentloaded",timeout:25000});
  assert(response?.ok());
  await p.getByText("Product catalog temporarily unavailable").waitFor({timeout:16000});
  assert.equal(await p.getByText("Price: $14.50").count(),0);
  await ctx.close();
  return "explicit unavailable state, no authoritative price on failed connection";
 });
 await verify("No browser JS or unexpected network failures",()=>{
  assert.equal(errors.length,0,JSON.stringify(errors.slice(0,6)));
  return {captured:errors.length};
 });
 fs.writeFileSync(path.join(dir,"results.json"),JSON.stringify({base:BASE,checks:results,errors},null,2));
 await context.close();await chrome.close();
 console.log("SUMMARY PASS "+results.filter(x=>x.status==="PASS").length+" FAIL "+results.filter(x=>x.status==="FAIL").length);
 process.exitCode=results.some(x=>x.status==="FAIL")?1:0;
};
start().catch(error=>{console.error("FATAL QA ERROR",error.stack||error);process.exitCode=1;});
