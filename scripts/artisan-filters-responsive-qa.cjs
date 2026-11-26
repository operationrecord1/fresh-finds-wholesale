const {chromium}=require("playwright");
const fs=require("node:fs");
const assert=require("node:assert/strict");
const BASE=process.env.ARTISAN_FILTER_URL||"https://artisanmart.site";
const OUT="filter-responsive-qa";
fs.mkdirSync(OUT,{recursive:true});
const results=[];
async function check(name,fn){
 try{const detail=await fn();results.push({name,status:"PASS",detail});console.log("PASS | "+name+" | "+detail);}
 catch(e){results.push({name,status:"FAIL",detail:e.message.slice(0,320)});console.error("FAIL | "+name+" | "+e.message);}
}
(async()=>{
 const browser=await chromium.launch({headless:true,args:["--no-sandbox"]});
 const page=await browser.newPage({viewport:{width:1024,height:850},deviceScaleFactor:1});
 const errors=[];page.on("pageerror",e=>errors.push(e.message));
 async function go(path){
   const response=await page.goto(BASE+path,{waitUntil:"domcontentloaded",timeout:35000});
   assert(response?.ok(),"HTTP "+response?.status()+" "+path);
   await page.locator(".store-listing").first().waitFor({timeout:16000});
   await page.waitForTimeout(180);
 }
 const widths=[240,320,380,381,650,780,1024,1025,1440,1920];
 for(const width of widths){
  await check("Responsive filter interface "+width+"px",async()=>{
   await page.setViewportSize({width,height:850});
   await go("/collection/best-sellers");
   const listing=page.locator(".store-listing").first();
   const toolbar=listing.locator(".store-filter-mobile-toolbar");
   const sidebar=listing.locator(".store-filters-desktop");
   const mobile=width<1025;
   assert.equal(await toolbar.isVisible(),mobile,"Incorrect mobile toolbar visibility");
   assert.equal(await sidebar.isVisible(),!mobile,"Incorrect desktop sidebar visibility");
   const sortControls=await listing.getByRole("combobox",{name:/Sort/}).count();
   assert.equal(sortControls,0,"Unapproved sorting control present");
   if(mobile){
     const quick=toolbar.locator(".store-quick-navigation");
     assert(await quick.isVisible(),"Quick navigation not visible");
     assert.equal(await quick.getByRole("link",{name:"Best Sellers"}).count(),0,"Active page included");
     assert.equal(await quick.getByRole("link",{name:"New Items"}).count(),1,"New Items destination absent");
     const before=await listing.locator(".store-catalog-grid").boundingBox();
     const trigger=toolbar.getByRole("button",{name:"Open filters"});
     assert((await trigger.innerText()).trim()==="","Icon button has visible label text");
     await trigger.click();
     const overlay=listing.getByRole("dialog",{name:"Product filters"});
     await overlay.waitFor({state:"visible"});
     const after=await listing.locator(".store-catalog-grid").boundingBox();
     assert(Math.abs(before.y-after.y)<1,"Overlay caused listing vertical layout shift");
     assert.equal(await overlay.getByRole("button",{name:"Filter by Price"}).getAttribute("aria-expanded"),"false");
     assert.equal(await overlay.getByRole("button",{name:"Filter by Special Options"}).getAttribute("aria-expanded"),"false");
     assert.equal(await overlay.getByRole("button",{name:"Filter by Subcategory"}).getAttribute("aria-expanded"),"false");
     const rect=await overlay.boundingBox();
     assert(rect&&rect.x>=-1&&rect.x+rect.width<=width+1,"Panel extends beyond viewport");
     assert(rect.height<=850,"Overlay taller than viewport");
     const clear=overlay.getByRole("button",{name:"Clear All"});
     assert(await clear.isVisible(),"Clear All unavailable");
     await overlay.getByRole("button",{name:"Filter by Price"}).click();
     assert.equal(await overlay.getByRole("button",{name:"Filter by Price"}).getAttribute("aria-expanded"),"true");
     assert.equal(await overlay.getByRole("button",{name:"Filter by Special Options"}).getAttribute("aria-expanded"),"false");
     const opts=overlay.getByRole("group",{name:"Filter by Price"}).getByRole("button");
     if(await opts.count()){
       await opts.first().click();
       assert.equal(await opts.first().getAttribute("aria-pressed"),"true","Selected option not highlighted");
       if(await opts.count()>1){await opts.nth(1).click();assert.equal(await opts.first().getAttribute("aria-pressed"),"false","Same-group choice not exclusive");}
     }
     await overlay.getByRole("button",{name:"Close filters"}).click();
     assert.equal(await overlay.count(),0,"Close button did not dismiss panel");
     await trigger.click();
     const reopened=listing.getByRole("dialog",{name:"Product filters"});
     await reopened.getByRole("button",{name:"Filter by Price"}).click();
     if(await opts.count())assert.equal(await opts.nth(await opts.count()>1?1:0).getAttribute("aria-pressed"),"true","Filter selection reset on reopen");
     await reopened.getByRole("button",{name:"Clear All"}).click();
     if(await opts.count())assert.equal(await opts.first().getAttribute("aria-pressed"),"false","Clear All retained selection");
     await page.locator(".store-filter-outside").click({position:{x:width-2,y:830},force:true});
     assert.equal(await listing.getByRole("dialog",{name:"Product filters"}).count(),0,"Outside click did not close");
     if([240,380,381,650,780,1024].includes(width))await page.screenshot({path:OUT+"/filters-"+width+".png",animations:"disabled"});
   }else{
     const headings=["Filter by Price","Filter by Special Options","Filter by Subcategory"];
     for(const heading of headings)assert.equal(await sidebar.getByRole("button",{name:heading}).count(),1,"Desktop group missing "+heading);
     assert.equal(await sidebar.getByRole("button",{name:"Filter by Price"}).getAttribute("aria-expanded"),"false");
     await sidebar.getByRole("button",{name:"Filter by Price"}).click();
     assert.equal(await sidebar.getByRole("button",{name:"Filter by Price"}).getAttribute("aria-expanded"),"true");
     await sidebar.getByRole("button",{name:"Filter by Special Options"}).click();
     assert.equal(await sidebar.getByRole("button",{name:"Filter by Price"}).getAttribute("aria-expanded"),"false","Multiple open groups");
     if(width===1440)await page.screenshot({path:OUT+"/desktop-1440.png",animations:"disabled"});
   }
   const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>window.innerWidth+2);
   assert(!overflow,"Document horizontal overflow at "+width+"px");
   return mobile?"Mobile overlay, accordion, navigation, filters and no shift":"Desktop sidebar accordion, no sorting";
  });
 }
 await check("Quick navigation changes route and excludes selected collection",async()=>{
   await page.setViewportSize({width:600,height:850});
   await go("/collection/best-sellers");
   const quick=page.locator(".store-listing").first().locator(".store-quick-navigation");
   await quick.getByRole("link",{name:"New Items"}).click();
   await page.waitForURL(/\/collection\/new-arrivals/,{timeout:12000});
   assert.equal(await page.locator(".store-quick-navigation").first().getByRole("link",{name:"New Items"}).count(),0);
   return "Best Sellers to New Arrivals route, new active collection excluded";
 });
 for(const path of ["/collection/imports","/collection/closeouts","/collection/reduced-price","/category/lighting","/shop-by-price?price=586","/search?q=LED"]){
   await check("Shared filter available "+path,async()=>{
     await page.setViewportSize({width:390,height:850});await go(path);
     const listing=page.locator(".store-listing").first();
     assert(await listing.getByRole("button",{name:"Open filters"}).isVisible());
     assert(await listing.locator(".store-quick-navigation").isVisible());
     return "Shared filter controls rendered";
   });
 }
 await check("Homepage has no filters and View All reduced",async()=>{
   await page.setViewportSize({width:1440,height:850});
   await page.goto(BASE+"/",{waitUntil:"domcontentloaded"});
   assert.equal(await page.locator(".store-filter-mobile-toolbar,.store-filters-desktop").count(),0);
   const result=await page.locator(".store-featured-view-all").first().evaluate(el=>({font:parseFloat(getComputedStyle(el).fontSize),color:getComputedStyle(el).color}));
   assert(result.font<16,"View All font size not reduced on desktop");
   return "Homepage untouched except smaller View All font: "+result.font+"px";
 });
 await check("No client-side errors",async()=>{assert.deepEqual(errors,[]);return "none";});
 fs.writeFileSync(OUT+"/results.json",JSON.stringify({base:BASE,checks:results},null,2));
 await browser.close();
 process.exitCode=results.some(x=>x.status==="FAIL")?1:0;
})().catch(e=>{console.error("Fatal "+e.message);process.exitCode=1;});
