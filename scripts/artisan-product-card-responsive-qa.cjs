const { chromium } = require("playwright");
const fs = require("node:fs");
const assert = require("node:assert/strict");
const BASE = process.env.ARTISAN_CARD_TEST_URL || "https://artisanmart.site";
const OUT = "product-card-responsive-qa";
fs.mkdirSync(OUT, {recursive:true});
const results = [];
const check = async (name, fn) => {
  try { const message = await fn(); results.push({name,status:"PASS",detail:message||""});console.log("PASS | "+name+" | "+(message||"")); }
  catch(e){results.push({name,status:"FAIL",detail:String(e.message).slice(0,380)});console.error("FAIL | "+name+" | "+e.message);}
};
(async()=>{
 const browser=await chromium.launch({headless:true,args:["--no-sandbox"]});
 const page=await browser.newPage({viewport:{width:1200,height:900},deviceScaleFactor:1});
 const errors=[];
 page.on("pageerror",e=>errors.push(e.message));
 async function go(path) {
  const res=await page.goto(BASE+path,{waitUntil:"domcontentloaded",timeout:35000});
  assert(res && res.ok(),"HTTP "+res?.status()+" on "+path);
  await page.locator(".store-product-card").first().waitFor({timeout:15000});
  await page.waitForTimeout(400);
 }
 async function inspect(width,path,gridSelector,columns){
  await page.setViewportSize({width,height:900});
  await go(path);
  const data=await page.evaluate(({gridSelector})=>{
   const grid=document.querySelector(gridSelector);
   if(!grid)throw Error("Grid absent: "+gridSelector);
   const cards=[...grid.querySelectorAll(":scope > .store-product-card")].filter(el=>getComputedStyle(el).display!=="none");
   const first=cards[0];
   if(!first)throw Error("No visible product cards");
   const photo=first.querySelector(".store-product-photo");
   const visual=first.querySelector(".store-product-visual");
   const badges=[...first.querySelectorAll(".store-product-badge")];
   const title=first.querySelector(".store-product-title");
   const id=first.querySelector(".store-product-id");
   const quantity=first.querySelector(".store-product-quantity");
   const price=first.querySelector(".store-product-price");
   const button=first.querySelector(".product-touch-action");
   const box=el=>el.getBoundingClientRect();
   return {
    columns:getComputedStyle(grid).gridTemplateColumns.split(" ").filter(Boolean).length,
    buttonShown:getComputedStyle(button).display!=="none",
    buttonLabel:button.textContent.trim(),
    buttonWidth:box(button).width,
    firstCardWidth:box(first).width,
    pageOverflow:document.documentElement.scrollWidth>window.innerWidth+2,
    badgeCount:badges.length,
    badgesSingleLine:badges.every(el=>getComputedStyle(el).whiteSpace==="nowrap"&&el.scrollWidth<=el.clientWidth+1),
    overlay:box(visual).top<=box(badges[0]||photo).top&&box(badges[0]||photo).top<box(visual).bottom,
    imageWidth:box(photo).width, imageHeight:box(photo).height,
    imageFits:getComputedStyle(photo.querySelector("img")).objectFit==="contain",
    titleLines:getComputedStyle(title).webkitLineClamp,
    titleReadable:box(title).height>=30,
    idOneLine:getComputedStyle(id).whiteSpace==="nowrap"&&id.scrollWidth<=id.clientWidth+1,
    quantityOneLine:getComputedStyle(quantity).whiteSpace==="nowrap"&&quantity.scrollWidth<=quantity.clientWidth+1,
    priceOneLine:getComputedStyle(price).whiteSpace==="nowrap"&&price.scrollWidth<=price.clientWidth+1,
    rowCards:cards.length
   };
  },{gridSelector});
  assert.equal(data.columns,columns,"Expected "+columns+" columns, got "+data.columns+" at "+width+"px");
  assert.equal(data.buttonShown,width<1020,"BUY NOW visibility mismatch at "+width);
  assert.equal(data.buttonLabel,"BUY NOW","BUY NOW label");
  assert(data.badgeCount<=2,"Tag count > 2");
  assert(data.badgesSingleLine,"Badge wraps or overflows");
  assert(data.overlay,"Badges do not overlay image");
  assert(data.imageWidth>100&&data.imageHeight>100,"Image area too small");
  assert(data.imageFits,"Image not contained");
  assert(data.titleReadable,"Title compressed");
  assert(data.idOneLine&&data.quantityOneLine&&data.priceOneLine,"Product information wraps");
  assert(!data.pageOverflow,"Horizontal document overflow");
  if(width<1020)assert(data.buttonWidth>=100,"BUY NOW too narrow");
  return width+"px / "+path+" / "+data.columns+" cols / card "+Math.round(data.firstCardWidth)+"px";
 }
 for(const width of [1600,1020,1019,780,779,624,390]){
  const columns=width<780?1:width<=1024?2:3; // Preserve existing homepage 1024px 2-column arrangement.
  await check("Homepage collection grid at "+width+"px",()=>inspect(width,"/",'.store-home-products',columns));
 }
 for(const width of [1200,1020,1019,780,779,390]){
  const columns=width<780?1:width<1020?2:width<=1100?3:4;
  await check("Collection listing grid at "+width+"px",()=>inspect(width,"/collection/new-arrivals",'.store-catalog-grid',columns));
 }
 await check("BUY NOW preserves existing order options popup",async()=>{
  await page.setViewportSize({width:780,height:850});
  await go("/collection/new-arrivals");
  const first=page.locator(".store-catalog-grid .store-product-card").first();
  await first.getByRole("button",{name:"BUY NOW"}).click();
  await first.locator(".product-hover-panel").waitFor({state:"visible",timeout:9000});
  assert.equal(await first.getAttribute("data-purchase-open"),"true");
  return "Original purchase panel opened without changing its ordering controls";
 });
 await check("No client exceptions",async()=>{assert.deepEqual(errors,[]);return "none";});
 fs.writeFileSync(OUT+"/results.json",JSON.stringify({url:BASE,at:new Date().toISOString(),checks:results},null,2));
 await page.screenshot({path:OUT+"/last-viewport.png",animations:"disabled",fullPage:true}).catch(()=>{});
 await browser.close();
 process.exitCode=results.some(r=>r.status==="FAIL")?1:0;
})().catch(e=>{console.error("Fatal "+e.message);process.exitCode=1;});
