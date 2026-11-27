const { chromium } = require("playwright");
const fs = require("node:fs");
const assert = require("node:assert/strict");
const BASE = process.env.ARTISAN_FILTER_URL || "https://artisanmart.site";
const OUT = "filter-responsive-qa";
const WIDTHS = [240,280,320,359,360,380,425,480,559,560,561,650,779,780,1024,1025,1440,1920];
fs.mkdirSync(OUT,{recursive:true});
const checks=[];
async function run(name,fn){
 try {const detail=await fn();checks.push({name,status:"PASS",detail});console.log("PASS | "+name+" | "+detail);}
 catch(e){checks.push({name,status:"FAIL",detail:String(e.message).slice(0,360)});console.error("FAIL | "+name+" | "+e.message);}
}
(async()=>{
 const browser=await chromium.launch({headless:true,args:["--no-sandbox"],...(process.env.ARTISAN_CHROME_PATH?{executablePath:process.env.ARTISAN_CHROME_PATH}:{})});
 const page=await browser.newPage({viewport:{width:1024,height:900},deviceScaleFactor:1});
 const errors=[];page.on("pageerror",e=>errors.push(e.message));
 async function visit(path){
   const resp=await page.goto(BASE+path,{waitUntil:"domcontentloaded",timeout:35000});
   assert(resp&&resp.ok(),"HTTP "+resp?.status()+" for "+path);
   await page.locator(".store-listing").first().waitFor({timeout:15000});
   await page.waitForTimeout(250);
 }
 async function inspect(width){
   await page.setViewportSize({width,height:900});
   await visit("/collection/best-sellers");
   return await page.evaluate(()=>{
     const listing=document.querySelector(".store-listing"),content=listing.querySelector(".store-listing-content");
     const heading=content.firstElementChild,bar=content.querySelector(".store-filter-mobile-toolbar");
     const trigger=bar.querySelector(".store-filter-trigger"),nav=bar.querySelector(".store-quick-navigation");
     const sidebar=listing.querySelector(".store-filters-desktop"),grid=content.querySelector(".store-catalog-grid");
     const rect=el=>el.getBoundingClientRect();
     const style=el=>getComputedStyle(el);
     const links=[...nav.querySelectorAll("a")];
     return {mobile:style(bar).display!=="none",desktop:style(sidebar).display!=="none",
      titleBottom:rect(heading).bottom,barTop:rect(bar).top,barBottom:rect(bar).bottom,gridTop:rect(grid).top,
      triggerVisible:style(trigger).display!=="none",triggerWidth:rect(trigger).width,
      totalLinks:links.length,navWidth:rect(nav).width,navScroll:nav.scrollWidth>nav.clientWidth+1,
      navFits:links.every(a=>rect(a).x>=rect(nav).x-1&&rect(a).right<=rect(nav).right+1&&style(a).whiteSpace==="nowrap"&&a.scrollWidth<=a.clientWidth+1),
      activePresent:links.some(a=>a.textContent.trim()==="Best Sellers"),
      linkLabels:links.map(x=>x.textContent.trim()),
      pageOverflow:document.documentElement.scrollWidth>window.innerWidth+2,
      sortVisible:[...listing.querySelectorAll("select,[role=combobox]")].some(el=>style(el).display!=="none"),
     };
   });
 }
 for(const width of WIDTHS){
  await run("Width "+width+"px",async()=>{
    const s=await inspect(width),mobile=width<1025;
    assert.equal(s.mobile,mobile,"Mobile filter toolbar visibility incorrect");
    assert.equal(s.desktop,!mobile,"Desktop filter sidebar visibility incorrect");
    assert(!s.sortVisible,"Sorting controls still visible");
    if(mobile){
      const cap=width<=359?0:width<=560?2:3;
      assert(s.triggerVisible&&s.triggerWidth>=70,"Filter control not visible");
      assert(Math.abs(s.barTop-s.titleBottom-8)<=0.5,"Heading-to-filter gap must be 8px: "+(s.barTop-s.titleBottom));
      assert(Math.abs(s.gridTop-s.barBottom-12)<=0.5,"Filter-to-products gap must be 12px: "+(s.gridTop-s.barBottom));
      assert(s.totalLinks<=cap,"Quick navigation exceeds maximum for width");
      if(width<=359)assert.equal(s.totalLinks,0,"Links must be absent below 360px");
      assert(!s.navScroll&&s.navFits,"Quick links clipped, scrolling or wrapping");
      assert(!s.activePresent,"Active page appears in quick links");
      const root=page.locator(".store-listing").first(),trigger=root.getByRole("button",{name:"Open filters"});
      const before=await root.locator(".store-catalog-grid").boundingBox();
      await trigger.click();
      const overlay=root.getByRole("dialog",{name:"Product filters"});
      await overlay.waitFor({state:"visible"});
      const after=await root.locator(".store-catalog-grid").boundingBox();
      assert(Math.abs(before.y-after.y)<1,"Overlay shifted underlying products");
      const panel=await overlay.boundingBox();
      assert(panel&&panel.width>0&&panel.x+panel.width<=width+1&&panel.x>=-1,"Overlay clipped: "+JSON.stringify(panel));
      if(width<780){
        assert(panel.x<=1&&panel.x+panel.width>=width-1,"Under-780 panel must span viewport: "+JSON.stringify(panel));
      }else{
        assert(panel.width<=361&&panel.width<width,"780–1024 overlay should preserve compact width");
      }
      const price=overlay.getByRole("button",{name:"Filter by Price"});
      const special=overlay.getByRole("button",{name:"Filter by Special Options"});
      const sub=overlay.getByRole("button",{name:"Filter by Subcategory"});
      for(const control of [price,special,sub])assert.equal(await control.getAttribute("aria-expanded"),"false","Accordion not initially collapsed");
      await price.click();
      assert.equal(await price.getAttribute("aria-expanded"),"true");
      assert.equal(await special.getAttribute("aria-expanded"),"false");
      const options=overlay.getByRole("group",{name:"Filter by Price"}).getByRole("button");
      const available=await options.count();
      let expectedSelectedIndex=0;
      const status=root.locator("p[role=status]").last();
      const initialTotal=Number((await status.innerText()).match(/of\s+(\d+)\s+products/)?.[1]);
      assert(Number.isFinite(initialTotal),"Initial count missing");
      if(available){
        const first=Number((await options.first().innerText()).match(/(\d+)\s*$/)?.[1]);
        await options.first().click();
        assert.equal(await options.first().getAttribute("aria-pressed"),"true");
        await status.getByText(new RegExp("of "+first+" products")).waitFor({timeout:8000}).catch(async()=>{
          assert((await status.innerText()).includes("of "+first+" products"),"Filter not applied immediately");
        });
        if(available>1){
          const second=Number((await options.nth(1).innerText()).match(/(\d+)\s*$/)?.[1]);
          await options.nth(1).click();
          expectedSelectedIndex=1;
          assert.equal(await options.first().getAttribute("aria-pressed"),"false","Single-selection rule violated");
          assert((await status.innerText()).includes("of "+second+" products"),"New selection not applied");
        }
      }
      const closeIcon=overlay.getByRole("button",{name:"Close filters"});
      const closeStyle=await closeIcon.evaluate(el=>({border:getComputedStyle(el).borderTopWidth,background:getComputedStyle(el).backgroundColor,svg:el.querySelector("svg")?.getBoundingClientRect().width}));
      assert.equal(closeStyle.border,"0px","Close X still has a decorative border");
      assert(closeStyle.svg>=17&&closeStyle.svg<=19,"Close X icon is not the intended compact size");
      await closeIcon.click();
      assert.equal(await overlay.count(),0,"Close did not dismiss");
      await trigger.click();
      const reopened=root.getByRole("dialog",{name:"Product filters"});
      await reopened.getByRole("button",{name:"Filter by Price"}).click();
      const retained=reopened.getByRole("group",{name:"Filter by Price"}).getByRole("button");
      if(available)assert.equal(await retained.nth(expectedSelectedIndex).getAttribute("aria-pressed"),"true","Selections lost on close");
      await reopened.getByRole("button",{name:"Clear All"}).click();
      if(available)assert.equal(await retained.first().getAttribute("aria-pressed"),"false","Clear All failed");
      assert((await status.innerText()).includes("of "+initialTotal+" products"),"Clear All did not restore listing");
      // Click above the panel: expanded options can legitimately reach y=850.
      await root.locator(".store-filter-outside").click({position:{x:width-2,y:2},force:true});
      assert.equal(await root.getByRole("dialog",{name:"Product filters"}).count(),0,"Outside click failed");
      if([240,359,360,560,561,779,780,1024].includes(width))await page.screenshot({path:OUT+"/width-"+width+".png",animations:"disabled"});
    }else{
      const sidebar=page.locator(".store-filters-desktop").first();
      for(const title of ["Filter by Price","Filter by Special Options","Filter by Subcategory"]){
       assert.equal(await sidebar.getByRole("heading",{name:title}).count(),1,"Previous desktop filter section missing: "+title);
      }
      assert.equal(await sidebar.locator("select").count(),0,"Desktop sorting still present");
      const opts=sidebar.getByRole("group",{name:"Filter by Price"}).getByRole("button");
      if(await opts.count()){
        await opts.first().click();
        assert.equal(await opts.first().getAttribute("aria-pressed"),"true");
        await sidebar.getByRole("button",{name:"Clear All"}).click();
        assert.equal(await opts.first().getAttribute("aria-pressed"),"false");
      }
      if(width===1440)await page.screenshot({path:OUT+"/desktop-1440.png",animations:"disabled"});
    }
    assert(!s.pageOverflow,"Document has horizontal overflow at "+width+"px");
    return mobile?"Filter row below title; "+s.totalLinks+" fully fitting links; overlay behavior verified":"Original desktop sidebar structure and filter interactions verified";
  });
 }
 await run("Navigation active-page exclusion",async()=>{
    await page.setViewportSize({width:650,height:900});
    await visit("/collection/best-sellers");
    const nav=page.locator(".store-quick-navigation").first();
    assert.equal(await nav.getByRole("link",{name:"Best Sellers"}).count(),0);
    await nav.getByRole("link",{name:"New Items"}).click();
    await page.waitForURL(/\/collection\/new-arrivals/,{timeout:15000});
    assert.equal(await page.locator(".store-quick-navigation").first().getByRole("link",{name:"New Items"}).count(),0);
    return "Actual navigation and automatic active link exclusion";
 });
 for(const p of ["/collection/closeouts","/collection/imports","/category/lighting","/shop-by-price?price=586","/search?q=LED"]){
  await run("Shared listing "+p,async()=>{
   await page.setViewportSize({width:425,height:900});await visit(p);
   assert(await page.locator(".store-filter-trigger").first().isVisible());
   assert(await page.locator(".store-listing-content .store-filter-mobile-toolbar").first().isVisible());
   return "Shared filter row after page heading";
  });
 }
 await run("Homepage unchanged",async()=>{
   await page.goto(BASE+"/",{waitUntil:"domcontentloaded"});
   assert.equal(await page.locator(".store-filter-mobile-toolbar,.store-filters-desktop").count(),0);
   return "No listing filter UI on homepage";
 });
 await run("No JavaScript errors",async()=>{assert.deepEqual(errors,[]);return "none";});
 fs.writeFileSync(OUT+"/results.json",JSON.stringify({url:BASE,checkedAt:new Date().toISOString(),checks},null,2));
 await browser.close();
 process.exitCode=checks.some(x=>x.status==="FAIL")?1:0;
})().catch(e=>{console.error("Fatal QA: "+e.message);process.exitCode=1;});
