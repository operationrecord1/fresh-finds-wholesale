const { chromium } = require("playwright");
const assert = require("node:assert/strict");
const fs=require("node:fs");
const out="homepage-visual-qa";
fs.mkdirSync(out,{recursive:true});
const base = process.env.ARTISAN_BANNER_URL || "https://artisanmart.site";
(async () => {
 const browser = await chromium.launch({headless:true,args:["--no-sandbox"]});
 try {
  const page = await browser.newPage();
  const errors=[]; page.on("pageerror",e=>errors.push(e.message));
  async function spacing(){
   return page.evaluate(()=>{
    const h=document.querySelector(".store-home-title"),p=document.querySelector(".store-home-panels"),sections=[...p.querySelectorAll(":scope > section")],r=e=>e.getBoundingClientRect();
    const columns=Math.abs(r(sections[1]).top-r(sections[0]).top)<1?2:1;
    const first=sections.slice(0,columns),next=sections.slice(columns,columns*2);
    const bottom=Math.max(...first.flatMap(s=>[...s.querySelectorAll(".store-product-card")].filter(e=>r(e).height>0).map(e=>r(e).bottom)));
    const textBounds=el=>{
     const walker=document.createTreeWalker(el,NodeFilter.SHOW_TEXT);
     const rects=[];
     while(walker.nextNode()){
      const node=walker.currentNode;if(!node.textContent.trim())continue;
      const range=document.createRange();range.selectNodeContents(node);
      rects.push(...range.getClientRects());
     }
     return {top:Math.min(...rects.map(x=>x.top)),bottom:Math.max(...rects.map(x=>x.bottom))};
    };
    const headingTop=Math.min(...first.map(s=>textBounds(s.querySelector("h2")).top));
    const nextTop=Math.min(...next.map(s=>textBounds(s.querySelector("h2")).top));
    return {columns,mainGap:headingTop-textBounds(h).bottom,referenceGap:nextTop-bottom,rowGap:getComputedStyle(p).rowGap,headingPaddingBottom:getComputedStyle(h).paddingBottom,headingTail:r(h).bottom-textBounds(h).bottom,gridMargin:getComputedStyle(p).marginTop,heroHeight:r(document.querySelector(".merch-hero")).height};
   });
  }
  async function checkSpacing(width){
   const s=await spacing();
   assert.equal(s.columns,width<=380?1:2,"Existing section columns changed");
   assert(Math.abs(s.mainGap-s.referenceGap)<=2,"Heading gap mismatch at "+width+": "+JSON.stringify(s));
   console.log("SPACING PASS",width,JSON.stringify(s));
  }
  const evidence=[];
  for (const width of [240,280,320,360,379,380,381,425,480,500,501,600,650,700,767,768,779,780,781,1025,1440,1920]) {
   await page.setViewportSize({width,height:900});
   const response=await page.goto(base,{waitUntil:"domcontentloaded"});
   assert(response?.ok(), "Homepage HTTP failure");
   const title=page.locator(".store-home-title"), hero=page.locator(".merch-hero");
   await page.locator(".store-home-panels").waitFor();
   assert.equal(await title.isVisible(),true,"Heading at "+width);
   assert.equal((await title.textContent()).trim(),"Your Premier Source For Wholesale General Merchandise");
   await page.evaluate(()=>document.fonts.ready);
   assert.equal(await hero.isVisible(),width>780,"Banner at "+width);
   const geometry=await page.evaluate(()=>{
    const title=document.querySelector(".store-home-title"),hero=document.querySelector(".merch-hero"),panels=document.querySelector(".store-home-panels");
    const t=title.getBoundingClientRect(),style=getComputedStyle(title); const rows=[...title.querySelectorAll('.store-home-title-line')].map(span=>{const range=document.createRange();range.selectNodeContents(span);return [...range.getClientRects()].map(r=>({top:r.top,bottom:r.bottom,left:r.left,right:r.right,width:r.width}));});
    return {rows,headingLeft:t.left,headingRight:t.right,fontSize:style.fontSize,lineHeight:parseFloat(style.lineHeight),pageOverflow:document.documentElement.scrollWidth-innerWidth,titleHeight:title.getBoundingClientRect().height,heroHeight:hero.getBoundingClientRect().height,panelsTop:panels.getBoundingClientRect().top,containerTop:title.parentElement.getBoundingClientRect().top,heroRight:hero.getBoundingClientRect().right,heroLeft:hero.getBoundingClientRect().left};
   });
   assert(geometry.titleHeight>0,"Heading occupies no space");
   if(width<=500){assert.equal(geometry.rows.length,2);assert(geometry.rows.every(r=>r.length===1),"Each phrase must occupy one line");const [a,b]=geometry.rows.map(r=>r[0]);assert(b.top>a.top+1,"Expected two lines");assert([a,b].every(r=>r.left>=geometry.headingLeft-1&&r.right<=geometry.headingRight+1),"Heading text overflow");assert(Math.abs((b.top-a.top)-geometry.lineHeight)<1,"Unexpected line spacing");}
   assert.equal(await hero.locator(".merch-arrow, .merch-prev, .merch-next, [aria-label='Previous banner'], [aria-label='Next banner']").count(),0,"Manual arrows must be removed");
   if(width<=780){assert.equal(geometry.heroHeight,0);await checkSpacing(width);}
   else {
    assert(geometry.heroLeft>=0&&geometry.heroRight<=width+1,"Banner overflow");
    for(let i=0;i<3;i++){
     await hero.locator(".merch-dots button").nth(i).click();
     assert.equal(await hero.locator(".merch-dots button").nth(i).getAttribute("aria-pressed"),"true");
     assert(await hero.evaluate(el=>Array.from(el.querySelectorAll("img")).every(im=>getComputedStyle(im).objectFit==="contain")),"Image fit changed");
    }
   }
   const capture=await page.screenshot({path:out+"/after-"+width+".jpg",type:"jpeg",quality:78});
   if(width<=780)evidence.push({width,...await spacing()});
   if([240,381,501].includes(width))console.log("VISUAL_AFTER",width,capture.toString("base64"));
   console.log("PASS",width,"heading=true","lines="+geometry.rows.flat().length,"font="+geometry.fontSize,"carousel="+(width>780));
  }
  fs.writeFileSync(out+"/measurements.json",JSON.stringify(evidence,null,2));
  // Capture the current live baseline before merge at matching representative widths.
  if(base.startsWith("http://127.0.0.1")){
   const before=await browser.newPage();
   for(const width of [240,381,501]){
    await before.setViewportSize({width,height:900});
    await before.goto("https://artisanmart.site/",{waitUntil:"domcontentloaded"});
    await before.locator(".store-home-panels").waitFor();
    await before.evaluate(()=>document.fonts.ready);
    const shot=await before.screenshot({path:out+"/before-"+width+".jpg",type:"jpeg",quality:78});
    console.log("VISUAL_BEFORE",width,shot.toString("base64"));
   }
   await before.close();
  }
  // Resize the same document across both layout breakpoints; no reload needed.
  for(const width of [380,381,779,780,781,780,240,425]){
   await page.setViewportSize({width,height:900});
   await page.waitForTimeout(80);
   assert.equal(await page.locator(".merch-hero").isVisible(),width>780);
   if(width<=780)await checkSpacing(width);
  }
  // Real active-page timing: four transitions prove a full cycle plus continuous looping.
  await page.setViewportSize({width:780,height:900});
  await page.goto(base,{waitUntil:"domcontentloaded"});
  const hero=page.locator(".merch-hero"),dots=hero.locator(".merch-dots button");
  await page.waitForTimeout(500);
  assert.equal(await hero.isVisible(),false);
  await page.evaluate(()=>{
   const hero=document.querySelector(".merch-hero");
   window.bannerRotationProbe={start:performance.now(),events:[],initial:hero.querySelector("[aria-pressed=true]").getAttribute("aria-label")};
   let last=window.bannerRotationProbe.initial;
   new MutationObserver(()=>{
    const selected=hero.querySelector("[aria-pressed=true]")?.getAttribute("aria-label");
    if(selected&&selected!==last){last=selected;window.bannerRotationProbe.events.push({label:selected,elapsed:performance.now()-window.bannerRotationProbe.start});}
   }).observe(hero,{subtree:true,attributes:true,attributeFilter:["aria-pressed"]});
  });
  await page.setViewportSize({width:781,height:900});
  await hero.waitFor({state:"visible"});
  await page.waitForTimeout(4000);
  assert.equal(await dots.nth(0).getAttribute("aria-pressed"),"true","First slide skipped");
  await page.setViewportSize({width:1440,height:900});
  await page.waitForFunction(()=>window.bannerRotationProbe.events.length>=4,null,{timeout:45000});
  const trace=await page.evaluate(()=>window.bannerRotationProbe);
  assert.match(trace.initial,/^Banner 1:/);
  assert.deepEqual(trace.events.slice(0,4).map(e=>Number(e.label.match(/^Banner (\d):/)[1])),[2,3,1,2]);
  const elapsed=trace.events.slice(0,4).map(e=>e.elapsed);
  for(let i=0;i<elapsed.length;i++)assert(Math.abs(elapsed[i]-(i?elapsed[i-1]:0)-10000)<850,"Incorrect 10-second duration: "+JSON.stringify(elapsed));
  assert(Math.abs(elapsed[2]-30000)<1500,"Incorrect full cycle duration");
  console.log("ROTATION PASS",JSON.stringify(trace));
  // Hidden interval and reopening are tested with virtual time to avoid wall-clock throttling.
  const timed=await browser.newPage({viewport:{width:780,height:900}});
  await timed.clock.install();
  await timed.goto(base,{waitUntil:"domcontentloaded"});
  const th=timed.locator(".merch-hero"),td=th.locator(".merch-dots button");
  await timed.clock.runFor(1000);
  await timed.clock.fastForward(30000);
  assert.equal(await td.nth(0).getAttribute("aria-pressed"),"true","Hidden carousel should not rotate");
  await timed.setViewportSize({width:781,height:900});
  await timed.clock.runFor(100);
  await timed.clock.runFor(5000);
  await timed.setViewportSize({width:780,height:900});
  await timed.clock.runFor(100);
  await timed.clock.fastForward(30000);
  assert.equal(await td.nth(0).getAttribute("aria-pressed"),"true","Hidden carousel advanced");
  await timed.setViewportSize({width:781,height:900});
  await timed.clock.runFor(100);
  await timed.clock.runFor(9000);
  assert.equal(await td.nth(0).getAttribute("aria-pressed"),"true","Resume advanced too early");
  await timed.clock.runFor(1100);
  assert.equal(await td.nth(1).getAttribute("aria-pressed"),"true","Resume did not advance");
  console.log("RESIZE/TIMER PASS");
  await timed.close();
  assert.deepEqual(errors,[]);
 } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
