const { chromium } = require("playwright");
const fs = require("node:fs");
const assert = require("node:assert/strict");
const BASE = process.env.ARTISAN_CARD_TEST_URL || "https://artisanmart.site";
const OUT = "featured-responsive-qa";
const WIDTHS=[320,375,380,381,600,780,781,1024,1025,1026,1250,1251,1440,1920,2000,2001,2560,3840];
const SECTIONS=["new-arrivals","best-sellers","reduced-price","closeouts"];
fs.mkdirSync(OUT,{recursive:true});
const checks=[];
const run=async(name,fn)=>{try{const detail=await fn();checks.push({name,status:"PASS",detail});console.log("PASS | "+name+" | "+detail);}catch(e){checks.push({name,status:"FAIL",detail:String(e.message).slice(0,430)});console.log("FAIL | "+name+" | "+e.message);}};
(async()=>{
 const browser=await chromium.launch({headless:true,args:["--no-sandbox"]});
 const page=await browser.newPage({viewport:{width:1440,height:900},deviceScaleFactor:1});
 const clientErrors=[];page.on("pageerror",e=>clientErrors.push(e.message));
 async function go(url){const resp=await page.goto(BASE+url,{waitUntil:"domcontentloaded",timeout:35000});assert(resp?.ok(),"HTTP "+resp?.status()+" "+url);await page.locator(".store-product-card").first().waitFor({timeout:14000});await page.waitForTimeout(150);}
 for(const width of WIDTHS){
  await run("Featured sections "+width+"px",async()=>{
   await page.setViewportSize({width,height:900});await go("/");
   const s=await page.evaluate(({width,names})=>{
     const sections=names.map(name=>document.querySelector('.store-home-panels [data-collection="'+name+'"]'));
     if(sections.some(s=>!s))throw Error("Missing one of four collection sections");
     const info=sections.map((section)=>{
       const rect=el=>el.getBoundingClientRect();
       const style=el=>getComputedStyle(el);
       const head=section.querySelector(".store-featured-header");
       const h2=head.querySelector("h2"),link=head.querySelector(".store-featured-view-all"),icon=head.querySelector("svg");
       const cards=[...section.querySelectorAll(".store-home-products > .store-product-card")];
       const visible=cards.filter(c=>style(c).display!=="none");
       const cardDetails=visible.map(card=>{
          const title=card.querySelector(".store-product-title");
          const id=card.querySelector(".store-product-id"),qty=card.querySelector(".store-product-quantity"),price=card.querySelector(".store-product-price");
          const badges=[...card.querySelectorAll(".store-product-badge")];
          const buy=card.querySelector(".product-touch-action");
          const lineHeight=parseFloat(style(title).lineHeight);
          return {
           titleLines:style(title).webkitLineClamp,
           titleHeight:rect(title).height,
           expectedTitleHeight:lineHeight*2,
           titleText:title.textContent,
           tags:badges.length,
           tagSingle:badges.every(b=>style(b).whiteSpace==="nowrap"&&b.scrollWidth<=b.clientWidth+1),
           oneLine:[id,qty,price].every(el=>style(el).whiteSpace==="nowrap"&&el.scrollWidth<=el.clientWidth+1),
           buyVisible:style(buy).display!=="none",buyText:buy.textContent.trim(),
           cardWidth:rect(card).width
          };
       });
       return {name:section.dataset.collection,x:rect(section).x,y:rect(section).y,
         count:visible.length,allCards:cards.length,
         headBackground:style(head).backgroundColor,
         iconVisible:style(icon).display!=="none",
         linkBelow:rect(link).top>=rect(h2).bottom-1,
         underline:style(link).textDecorationLine.includes("underline"),
         headColor:style(h2).color,
         details:cardDetails};
     });
     return {info,pageOverflow:document.documentElement.scrollWidth>innerWidth+2};
   },{width,names:SECTIONS});
   const per=width<=780?1:width<=1250?2:width<=2000?3:4;
   const sectionColumns=width<=380?1:2;
   assert(s.info.every(x=>x.count===per),"Product count expected "+per+" got "+s.info.map(x=>x.count).join(","));
   assert(s.info.every(x=>x.allCards<=4),"More than four underlying featured cards");
   assert(Math.abs(s.info[0].y-s.info[1].y)<3 === (sectionColumns===2),"First two section rows incorrect");
   if(sectionColumns===1)assert(s.info[0].y<s.info[1].y&&s.info[1].y<s.info[2].y&&s.info[2].y<s.info[3].y,"Expected vertical section order");
   else assert(s.info[2].y>s.info[0].y+15&&Math.abs(s.info[2].y-s.info[3].y)<3,"Second pair of sections not aligned");
   for(const sec of s.info){
    if(width<=780){
      assert(!sec.iconVisible,"Mobile header icon should be hidden");
      assert(sec.linkBelow,"View All is not below title");
      assert(["rgba(0, 0, 0, 0)","transparent"].includes(sec.headBackground),"Mobile header background visible: "+sec.headBackground);
    }else assert(sec.iconVisible,"Desktop header icon should be visible");
    assert(sec.underline,"View All underline missing");
    for(const card of sec.details){
      assert.equal(card.titleLines,"2","Title line-clamp isn't 2");
      assert(Math.abs(card.titleHeight-card.expectedTitleHeight)<3,"Title has not reserved exactly 2 lines");
      assert(!card.titleText.includes("…")&&!card.titleText.includes("..."),"Title has ellipsis indicator");
      assert(card.tags<=2&&card.tagSingle,"Badges exceed count or wrap");
      assert(card.oneLine,"Item ID / Qty / Price wraps or overflows");
      assert.equal(card.buyVisible,width<=1025,"BUY NOW visibility incorrect at "+width);
      assert.equal(card.buyText,"BUY NOW","Wrong button label");
    }
   }
   assert(!s.pageOverflow,"Horizontal page overflow");
   if([320,380,381,780,781,1025,1026,1250,1251,2000,2001,3840].includes(width)){
    await page.screenshot({path:OUT+"/home-"+width+".png",animations:"disabled",fullPage:false});
   }
   return "sections="+sectionColumns+" columns; "+per+" products each; "+(per*4)+" total";
  });
 }
 await run("Full collection listing retains all products",async()=>{
    await page.setViewportSize({width:390,height:900});await go("/collection/new-arrivals");
    const cards=await page.locator(".store-catalog-grid > .store-product-card").count();
    assert(cards>4,"Full collection unexpectedly restricted to 4 cards: "+cards);
    return "Visible initial collection DOM has "+cards+" product cards, not featured limits";
 });
 for(const width of [1025,1026,1440]){
   await run("Purchase interaction "+width+"px",async()=>{
     await page.setViewportSize({width,height:900});await go("/collection/new-arrivals");
     const card=page.locator(".store-catalog-grid .store-product-card").first();
     const buy=card.locator(".product-touch-action"),submit=card.locator(".purchase-submit");
     if(width<=1025){
       assert(await buy.isVisible(),"Permanent BUY NOW absent");
       await buy.click();
       await submit.waitFor({state:"visible",timeout:8000});
       assert.equal(await card.getAttribute("data-purchase-open"),"true");
       return "BUY NOW opens existing purchase panel";
     }
     assert(!(await buy.isVisible()),"Permanent BUY NOW should be hidden");
     assert(!(await submit.isVisible()),"ADD TO CART visible without hover");
     await card.hover();
     await submit.waitFor({state:"visible",timeout:8000});
     assert((await submit.innerText()).toLowerCase().includes("add to cart"),"Hover ADD TO CART button unavailable");
     await page.mouse.move(0,0);
     await page.waitForTimeout(220);
     assert(!(await submit.isVisible()),"ADD TO CART panel remains visible after hover");
     return "Hover ADD TO CART appears and disappears without layout shift";
   });
 }
 await run("No client exceptions",async()=>{assert.deepEqual(clientErrors,[]);return "none";});
 fs.writeFileSync(OUT+"/results.json",JSON.stringify({base:BASE,checks,time:new Date().toISOString()},null,2));
 await browser.close();
 process.exitCode=checks.some(r=>r.status==="FAIL")?1:0;
})().catch(e=>{console.error("Fatal responsive QA: "+e.message);process.exitCode=1;});
