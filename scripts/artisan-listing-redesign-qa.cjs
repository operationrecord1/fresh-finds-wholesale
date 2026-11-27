const { chromium } = require('playwright');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const assert = require('node:assert/strict');
const OUT = process.env.ARTISAN_QA_OUT || 'listing-redesign-qa';
const BASE = process.env.ARTISAN_LISTING_URL || 'http://127.0.0.1:4173';
const widths = [...new Set([240,280,320,360,379,380,381,382,425,480,499,500,501,600,700,779,780,781,782,850,900,1024,1025,1026,1100,1250,1251,1279,1280,1281,1366,1440,1535,1536,1537,1600,1839,1840,1841,1920,2000,2001,2200,2239,2240,2241,2500,2560,2800,3000])].sort((a,b)=>a-b);
const columns = w => w<=380?1:w<=780?2:w<1280?3:w<1536?4:w<1840?5:w<2240?6:7;
const results = [];
fs.mkdirSync(OUT,{recursive:true});
async function check(name, fn) {
  try {const detail=await fn();results.push({name,status:'PASS',detail});console.log('PASS',name);}
  catch(e){results.push({name,status:'FAIL',detail:e.message});console.error('FAIL',name,e.message);}
}
async function main() {
  let server;
  if(process.env.ARTISAN_QA_SERVE==='1') {
    const dir=path.resolve('dist/client');
    server=http.createServer((req,res)=>{
      let file=path.resolve(dir,'.'+decodeURIComponent(new URL(req.url,BASE).pathname));
      if(!file.startsWith(dir+path.sep)&&file!==dir){res.writeHead(403);return res.end();}
      if(!fs.existsSync(file)||fs.statSync(file).isDirectory())file=path.join(dir,'index.html');
      res.setHeader('Content-Type',({'.js':'text/javascript','.css':'text/css','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml'})[path.extname(file)]||'text/html');
      fs.createReadStream(file).pipe(res);
    });
    await new Promise(r=>server.listen(4173,'127.0.0.1',r));
  }
  const browser=await chromium.launch({headless:true,...(process.env.ARTISAN_CHROME_PATH?{executablePath:process.env.ARTISAN_CHROME_PATH}:{})});
  const page=await browser.newPage({viewport:{width:1440,height:900}});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  async function go(route){await page.goto(BASE+route,{waitUntil:'networkidle'});await page.locator('.store-product-card').first().waitFor();await page.evaluate(()=>document.fonts.ready);await page.mouse.move(0,0);}
  async function metrics(){return page.evaluate(()=>{
    const grid=document.querySelector('.store-catalog-grid');
    const cards=[...grid.children];const first=cards[0];const rect=first.getBoundingClientRect();
    const title=first.querySelector('.store-product-title');const style=getComputedStyle(title);
    const centered=cards.every(card=>{
      const r=card.getBoundingClientRect(),mid=r.x+r.width/2;
      return ['.store-product-id','.store-product-quantity','.store-product-price','.product-touch-action'].every(selector=>{
        const e=card.querySelector(selector),s=getComputedStyle(e),b=e.getBoundingClientRect();
        if(s.display==='none')return selector==='.product-touch-action'&&innerWidth>=1026;
        const range=document.createRange();range.selectNodeContents(e);const ink=range.getBoundingClientRect();
        return Math.abs(b.x+b.width/2-mid)<=1&&Math.abs(ink.x+ink.width/2-mid)<=2&&(selector==='.product-touch-action'?s.justifyContent==='center':s.textAlign==='center');
      });
    });
    const overflow=[...document.querySelectorAll('.store-listing .store-product-id,.store-listing .store-product-quantity,.store-listing .store-product-price')].filter(el=>el.scrollWidth>el.clientWidth+1).map(el=>el.className);
    const titleWithinCard=cards.every(card=>{const c=card.getBoundingClientRect(),t=card.querySelector('.store-product-title').getBoundingClientRect();return t.left>=c.left-1&&t.right<=c.right+1;});
    return {columns:cards.filter(el=>Math.abs(el.getBoundingClientRect().top-rect.top)<1).length,
      tracks:getComputedStyle(grid).gridTemplateColumns.split(' ').length,
      centered,titleAlign:style.textAlign,cardWidth:rect.width,badges:grid.querySelectorAll('.store-product-badge').length,
      titleClamp:style.webkitLineClamp,titleHeight:title.getBoundingClientRect().height,lineHeight:parseFloat(style.lineHeight),
      imageFit:getComputedStyle(first.querySelector('img')).objectFit,
      overflow:document.documentElement.scrollWidth>innerWidth+1,contentOverflow:overflow,titleWithinCard,
      count:document.querySelector('.store-listing [role=status]').textContent.trim(),
      sidebar:getComputedStyle(document.querySelector('.store-filters-desktop')).display,
      rowAligned:cards.filter(el=>Math.abs(el.getBoundingClientRect().top-rect.top)<1).every(el=>Math.abs(el.getBoundingClientRect().height-rect.height)<1)};
  });}
  for(const route of ['/collection/new-arrivals','/category/pet-supplies','/search?q=hat','/shop-by-price?price=%22581%22']){
    await go(route);
    for(const width of widths)await check(`${route} at ${width}px`,async()=>{
      await page.setViewportSize({width,height:900});await page.evaluate(()=>new Promise(requestAnimationFrame));
      const m=await metrics();assert.equal(m.tracks,columns(width));assert.equal(m.centered,true,'Product metadata or action not centered');assert.equal(m.titleAlign,'center');assert.equal(m.badges,0);assert.equal(m.titleClamp,'2');
      assert(m.titleHeight<=m.lineHeight*2+1);assert.equal(m.imageFit,'contain');assert(!m.overflow);assert.deepEqual(m.contentOverflow,[]);assert(m.titleWithinCard);assert(m.rowAligned);
      assert.equal(m.sidebar==='none',width<=1024);
      if(route==='/collection/new-arrivals'&&[240,381,780,1025,1440,1920,3000].includes(width)){
        await page.screenshot({path:path.join(OUT,`listing-${width}.png`)});
      }
      return m;
    });
  }
  // Every current category and collection, including related recommendation lists.
  const source=fs.readFileSync('src/data/catalog.ts','utf8');
  const categories=[...new Set([...source.matchAll(/"category": "([^"]+)"/g)].map(m=>m[1]))];
  const slug=s=>s.toLowerCase().replace(/&/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
  const routes=[...categories.map(c=>'/category/'+slug(c)),...['new-arrivals','best-sellers','reduced-price','closeouts','imports'].map(c=>'/collection/'+c)];
  await page.setViewportSize({width:1440,height:900});
  for(const route of routes)await check('Route '+route,async()=>{await go(route);assert.equal(await page.locator('.store-catalog-grid .store-product-badge').count(),0);return await page.locator('.store-listing [role=status]').allTextContents();});
  await check('Desktop immediate filters and Clear All',async()=>{
    await go('/collection/new-arrivals');const before=await page.locator('.store-listing [role=status]').first().textContent();
    for(const name of ['Filter by Price','Filter by Special Options','Filter by Subcategory']){
      const option=page.getByRole('complementary').getByRole('group',{name,exact:true}).getByRole('button').first();
      const text=await option.textContent();const count=Number(text.match(/\((\d+)\)/)[1]);await option.click();
      await page.waitForFunction(n=>document.querySelector('.store-listing [role=status]').textContent.includes(`of ${n} products`),count);
      await page.getByRole('button',{name:'Clear All',exact:true}).click();assert.equal(await page.locator('.store-listing [role=status]').first().textContent(),before);
    }return before;
  });
  for(const width of [240,381,780,1024])await check('Mobile filter interaction '+width,async()=>{
    await page.setViewportSize({width,height:900});await go('/collection/new-arrivals');await page.getByRole('button',{name:'Open filters',exact:true}).click();
    const dialog=page.getByRole('dialog',{name:'Product filters',exact:true});await dialog.getByRole('button',{name:'Filter by Price',exact:true}).click();
    const option=dialog.locator('.store-filter-option').first();const count=Number(await option.locator('.store-filter-option-count').textContent());await option.click();
    await page.waitForFunction(n=>document.querySelector('.store-listing [role=status]').textContent.includes(`of ${n} products`),count);
    await dialog.getByRole('button',{name:'Clear All',exact:true}).click();await dialog.getByRole('button',{name:'Close filters',exact:true}).click();assert.equal(await dialog.count(),0);
    await page.getByRole('button',{name:'Open filters',exact:true}).click();await page.keyboard.press('Escape');assert.equal(await dialog.count(),0);
  });
  await check('Hover continuity, keyboard access, stable geometry and cart',async()=>{
    await page.setViewportSize({width:1440,height:1000});await go('/collection/new-arrivals');const card=page.locator('.store-catalog-grid .store-product-card').first();
    const boxes=await page.locator('.store-catalog-grid .store-product-card').evaluateAll(es=>es.slice(0,8).map(e=>{const r=e.getBoundingClientRect();return [r.x,r.y,r.width,r.height]}));
    const panel=card.locator('.product-hover-panel');assert(!(await panel.isVisible()));await card.hover();await panel.waitFor({state:'visible'});assert((await metrics()).centered,'Hover changed alignment');
    const add=panel.getByRole('button',{name:'Add To Cart',exact:true});await add.hover();assert(await panel.isVisible());
    const pbox=await panel.boundingBox();assert(pbox.x>=0&&pbox.x+pbox.width<=1440);
    assert.deepEqual(await page.locator('.store-catalog-grid .store-product-card').evaluateAll(es=>es.slice(0,8).map(e=>{const r=e.getBoundingClientRect();return [r.x,r.y,r.width,r.height]})),boxes);
    await panel.getByLabel('Pieces quantity',{exact:true}).fill('8');await add.click();await page.getByRole('button',{name:'Shopping cart, 1 products'}).waitFor();
    await page.mouse.move(0,0);await card.locator('.store-product-photo').press('Tab');await panel.waitFor({state:'visible'});
    await page.goto(BASE+'/cart');await page.getByText('DA883',{exact:false}).first().waitFor();assert((await page.locator('body').textContent()).includes('116.00'));
  });
  await check('Buy Now pointer path and compact quantity controls',async()=>{
    await page.setViewportSize({width:400,height:1200});await go('/collection/new-arrivals');
    const card=page.locator('.store-catalog-grid .store-product-card').first();
    const buy=card.getByRole('button',{name:'BUY NOW',exact:true});
    const panel=card.locator('.product-hover-panel');
    await buy.click();await panel.waitFor({state:'visible'});
    const cardBox=await card.boundingBox(),buttonBox=await buy.boundingBox(),panelBox=await panel.boundingBox();
    await page.mouse.move(cardBox.x+cardBox.width-8,buttonBox.y+buttonBox.height+12,{steps:10});
    assert(await panel.isVisible(),'Panel closed inside card below Buy Now');
    await page.mouse.move(panelBox.x+panelBox.width-12,panelBox.y+60,{steps:10});
    assert(await panel.isVisible(),'Panel closed while moving into purchase controls');
    await page.mouse.move(cardBox.x+cardBox.width/2,buttonBox.y-8,{steps:10});
    assert(!(await panel.isVisible()),'Panel stayed open above Buy Now');
    await buy.click();await panel.waitFor({state:'visible'});
    await page.mouse.move(0,buttonBox.y+buttonBox.height/2);
    assert(!(await panel.isVisible()),'Panel stayed open outside card');
    for(const width of [240,320,400]){
      await page.setViewportSize({width,height:1200});await go('/collection/new-arrivals');
      const item=page.locator('.store-catalog-grid .store-product-card').first();
      await item.getByRole('button',{name:'BUY NOW',exact:true}).click();
      const popup=item.locator('.product-hover-panel');await popup.waitFor({state:'visible'});
      const label=popup.getByText('Piece Quantity',{exact:true});
      const stepper=popup.locator('.purchase-stepper');
      const labelBox=await label.boundingBox(),stepperBox=await stepper.boundingBox();
      assert(labelBox.x+labelBox.width<=stepperBox.x+1||labelBox.y+labelBox.height<=stepperBox.y+1,`Quantity label overlaps stepper at ${width}px`);
      const quantity=popup.getByRole('textbox',{name:'Pieces quantity'});
      await quantity.fill('12');assert.equal(await quantity.inputValue(),'12');
      assert.equal(await quantity.evaluate(e=>getComputedStyle(e).outlineStyle),'none');
    }
  });
  for(const width of [240,320,381,400,500,780,1440])await check('Touch purchasing '+width,async()=>{
    const touch=await browser.newContext({viewport:{width,height:950},hasTouch:true,isMobile:true});const p=await touch.newPage();
    await p.goto(BASE+'/collection/new-arrivals');const card=p.locator('.store-catalog-grid .store-product-card').first();await card.getByRole('button',{name:'BUY NOW',exact:true}).tap();
    const panel=card.locator('.product-hover-panel');await panel.waitFor({state:'visible'});const b=await panel.boundingBox();assert(b.x>=0&&b.x+b.width<=width+1);
    const geometry=await p.evaluate(()=>({viewport:document.documentElement.clientWidth,scrollWidth:document.documentElement.scrollWidth,scrollX,panel:document.querySelector('.store-catalog-grid .product-hover-panel').getBoundingClientRect().toJSON()}));
    assert.equal(geometry.scrollX,0,'Opening purchase panel shifted the page horizontally');
    assert(geometry.scrollWidth<=geometry.viewport,'Purchase panel caused horizontal overflow');
    if(width<=500)assert(Math.abs(geometry.panel.left-(geometry.viewport-geometry.panel.right))<=1,'Small-screen purchase panel is not centered');
    await panel.getByRole('button',{name:'Add To Cart',exact:true}).tap();await p.getByRole('button',{name:'Shopping cart, 1 products'}).waitFor();await touch.close();
  });
  await check('All 94 collection products remain reachable',async()=>{
    await page.setViewportSize({width:1440,height:900});await go('/collection/new-arrivals');
    for(let n=0;n<8;n++){
      await page.locator('.store-catalog-grid[aria-busy="false"]').waitFor();
      if(await page.locator('.store-catalog-grid .store-product-card').count()===94)break;
      await page.getByRole('button',{name:'Load more products',exact:true}).click();
      await page.waitForFunction(()=>document.querySelector('.store-catalog-grid').getAttribute('aria-busy')==='false');
    }
    assert.equal(await page.locator('.store-catalog-grid .store-product-card').count(),94);return '94 products, no pagination';
  });
  for(const width of [240,380,381,500,501,780,781,1024,1025,1440,3000])await check('Homepage preserved '+width,async()=>{
    await page.setViewportSize({width,height:900});await go('/');
    assert.equal(await page.locator('.store-browse-surface').count(),0);
    assert(await page.locator('.store-home-products .store-product-badge').count()>0);
    assert(await page.locator('.store-home-products .store-product-card').evaluateAll(es=>es.every(e=>e.querySelectorAll('.store-product-badge').length<=2)));
    if(process.env.ARTISAN_HOME_BASELINE){
      const baseline=JSON.parse(fs.readFileSync(process.env.ARTISAN_HOME_BASELINE,'utf8'));
      const now=await page.evaluate(()=>['.store-home-title','.merch-hero','.store-home-panels','.store-home-products','.store-home-products .store-product-card','.store-product-title'].map(s=>{const e=document.querySelector(s),c=getComputedStyle(e),b=e.getBoundingClientRect();return{s,x:b.x,y:b.y,w:b.width,h:b.height,font:c.fontSize,columns:c.gridTemplateColumns,display:c.display}}));
      assert.deepEqual(now,baseline[width]);
    }
    if(width===1440)await page.screenshot({path:path.join(OUT,'homepage-1440.png')});
  });
  for(const width of [240,381,780,1025,1440,3000])for(const route of ['/','/collection/new-arrivals','/category/pet-supplies','/search?q=hat','/shop-by-price?price=%22581%22'])await check('Badge-free image preview '+route+' '+width,async()=>{
    await page.setViewportSize({width,height:900});await go(route);
    const cards=page.locator('.store-product-card:visible');
    const card=route==='/'?cards.filter({has:page.locator('.store-product-badge')}).first():cards.first();
    const before=await card.locator('.store-product-badge').count();
    if(route==='/')assert(before>0);else assert.equal(before,0);
    await card.locator('.store-product-photo').click();
    const dialog=page.locator('.product-modal');await dialog.waitFor({state:'visible'});
    assert.equal(await dialog.locator('.store-product-badges,.store-product-badge').count(),0);
    const thumbs=dialog.locator('.product-thumbnails button');
    if(await thumbs.count()>1){await thumbs.nth(1).click();assert.equal(await thumbs.nth(1).getAttribute('aria-pressed'),'true');assert.equal(await dialog.locator('.store-product-badges,.store-product-badge').count(),0);}
    if((route==='/'||route==='/collection/new-arrivals')&&[240,780,1440,3000].includes(width))await page.screenshot({path:path.join(OUT,'preview-'+(route==='/'?'home':'listing')+'-'+width+'.png')});
    const detail=dialog.locator('.product-detail-link');const href=await detail.getAttribute('href');await detail.click();await page.waitForURL('**/product/**');
    await page.locator('.store-product-detail-title').waitFor({state:'visible'});
    await page.locator('.store-home-products,.store-catalog-grid').first().waitFor({state:'detached'});
    assert.equal(await page.locator('.store-product-badges,.store-product-badge').count(),0);
    const next=page.getByRole('button',{name:'Next image',exact:true});if(await next.count()){await next.click();assert.equal(await page.locator('.store-product-badge').count(),0);}
    if(route==='/'&&[240,1440].includes(width))await page.screenshot({path:path.join(OUT,'detail-'+width+'.png')});
    return href;
  });
  await check('No browser exceptions',()=>assert.deepEqual(errors,[]));
  fs.writeFileSync(path.join(OUT,'results.json'),JSON.stringify({base:BASE,widths,results},null,2));
  await browser.close();if(server)server.close();process.exitCode=results.some(r=>r.status==='FAIL')?1:0;
}
main().catch(e=>{console.error(e);process.exit(1)});
