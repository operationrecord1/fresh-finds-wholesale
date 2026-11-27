const { chromium } = require("playwright");
const assert = require("node:assert/strict");
const base = process.env.ARTISAN_BANNER_URL || "https://artisanmart.site";
(async () => {
 const browser = await chromium.launch({headless:true,args:["--no-sandbox"]});
 try {
  const page = await browser.newPage();
  const errors=[]; page.on("pageerror",e=>errors.push(e.message));
  for (const width of [240,280,320,360,379,380,381,425,480,500,501,780,781,1025,1440,1920]) {
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
   if(width<=780)assert.equal(geometry.heroHeight,0);
   else {
    assert(geometry.heroLeft>=0&&geometry.heroRight<=width+1,"Banner overflow");
    for(let i=0;i<3;i++){
     await hero.locator(".merch-dots button").nth(i).click();
     assert.equal(await hero.locator(".merch-dots button").nth(i).getAttribute("aria-pressed"),"true");
     assert(await hero.evaluate(el=>Array.from(el.querySelectorAll("img")).every(im=>getComputedStyle(im).objectFit==="contain")),"Image fit changed");
    }
   }
   console.log("PASS",width,"heading=true","lines="+geometry.rows.flat().length,"font="+geometry.fontSize,"carousel="+(width>780));
  }
  assert.deepEqual(errors,[]);
 } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
