/* Artisan Mart hosting-only browser regression. Isolated GitHub Actions branch.
 * No production edits, checkout uses demo-only wire method and synthetic inputs.
 */
const { chromium } = require('playwright');
const { PNG } = require('pngjs');
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { createHash } = require('node:crypto');

const LIVE = 'https://artisanmart.site';
const WWW = 'https://www.artisanmart.site';
const STAGING = 'https://artisanmart-staging.pages.dev';
const NETLIFY = 'https://6afe35608efb16a25820414c--lambent-gnome-721faa.netlify.app';
const out = path.resolve('hosting-regression-results');
fs.mkdirSync(out, {recursive:true});
const results = [];
const errors = [];
const sha = value => createHash('sha256').update(value).digest('hex');
function record(name, pass, detail) {
  results.push({name, status:pass?'PASS':'FAIL', detail:String(detail||'')});
  console.log((pass?'PASS':'FAIL')+' | '+name+' | '+String(detail||'').slice(0,400));
}
async function check(name, fn) { try { let detail = await fn(); record(name,true,detail||''); } catch(e) {record(name,false,e.stack||e.message);} }
async function ready(page, url) {
  const r = await page.goto(url,{waitUntil:'domcontentloaded',timeout:30000});
  assert(r, 'navigation missing response');
  assert(r.status() < 400, url+' HTTP '+r.status());
  await page.locator('body').waitFor({timeout:12000});
  await page.waitForLoadState('networkidle',{timeout:14000}).catch(()=>{});
  await page.evaluate(async()=>{await document.fonts.ready;});
  return r;
}
async function settle(page){
  await page.evaluate(async()=>{await Promise.all([...document.images].filter(i=>i.getBoundingClientRect().top<innerHeight+400).map(i=>i.complete?null:new Promise(resolve=>{i.addEventListener('load',resolve,{once:true});i.addEventListener('error',resolve,{once:true});setTimeout(resolve,4500)})));});
  await page.waitForTimeout(350);
}
function comparePng(a,b){
  const x=PNG.sync.read(fs.readFileSync(a)), y=PNG.sync.read(fs.readFileSync(b));
  assert.equal(x.width,y.width);assert.equal(x.height,y.height);
  let changed=0,diffSum=0;
  for(let i=0;i<x.data.length;i+=4){
    const v=Math.max(Math.abs(x.data[i]-y.data[i]),Math.abs(x.data[i+1]-y.data[i+1]),Math.abs(x.data[i+2]-y.data[i+2]));
    if(v>24)changed++;
    diffSum+=v;
  }
  return {changed, total:x.width*x.height, ratio:changed/(x.width*x.height), meanDiff:diffSum/(x.width*x.height),shaProduction:sha(fs.readFileSync(a)),shaNetlify:sha(fs.readFileSync(b))};
}
(async () => {
const raw=fs.readFileSync('src/data/catalog.ts','utf8');
const start=raw.indexOf('export const PRODUCTS: Product[] = [');
assert(start>=0,'catalog declaration missing');
const open=raw.indexOf('= [',start)+2;
const end=raw.indexOf('\n];',open);
assert(end>open,'catalog array terminator missing');
const PRODUCTS=JSON.parse(raw.slice(open,end+2));
const assets= [...new Set(PRODUCTS.flatMap(p=>p.images||[]))];
const expectedFiles=fs.readdirSync('public/images/products').filter(x=>x.endsWith('.webp'));
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
const context=await browser.newContext({viewport:{width:1280,height:800},reducedMotion:'reduce',locale:'en-US'});
const page=await context.newPage();
page.on('pageerror',e=>errors.push({type:'js',url:page.url(),message:e.message}));
page.on('response',res=>{if(res.url().startsWith(LIVE)&&res.status()>=400)errors.push({type:'http',url:res.url(),status:res.status()});});
page.on('requestfailed',req=>{if(req.url().startsWith(LIVE)&&!String(req.failure()?.errorText).includes('ERR_ABORTED'))errors.push({type:'network',url:req.url(),reason:req.failure()?.errorText});});

await check('catalog source has exactly 125 unique products',()=>{
  assert.equal(PRODUCTS.length,125);
  assert.equal(new Set(PRODUCTS.map(p=>p.sku)).size,125);
  for(const p of PRODUCTS)assert(p.sku&&p.title&&Array.isArray(p.images));
  return '125 unique SKUs, full parsed catalog data intact';
});
await check('exact local 354 product WebP assets',()=>{
  assert.equal(expectedFiles.length,354);
  assert.equal(assets.length,354);
  for(const x of assets)assert(fs.existsSync(path.join('public',x)),x);
  return '354 unique catalog image paths exist';
});
await check('live and Cloudflare staging homepage navigation',async()=>{
  await ready(page,LIVE+'/');await page.getByText(/Minimum Order Amount/i).first().waitFor();
  await ready(page,STAGING+'/');await page.getByText(/Minimum Order Amount/i).first().waitFor();
  return 'production and Cloudflare staging homepages loaded with the $500 minimum notice';
});
await check('cart add, quantity change, remove and clear',async()=>{
  await page.goto(LIVE+'/product/da883');
  await page.locator('button.purchase-submit').first().click();
  await page.waitForTimeout(200);
  await ready(page,LIVE+'/cart');
  await page.getByText('4 pieces',{exact:false}).first().waitFor();
  assert((await page.locator('.cart-item').count())>=1);
  assert((await page.locator('.cart-item').first().innerText()).includes('$58.00'));
  await page.getByRole('button',{name:/Change quantity for Black LED Vanity Mirror/i}).click();
  const edit=page.getByRole('dialog');
  await edit.waitFor();
  await edit.getByLabel('Pieces quantity').fill('8');
  await edit.locator('button.purchase-submit').click();
  await page.waitForTimeout(300);
  assert((await page.locator('.cart-item').first().innerText()).includes('8 pieces'));
  assert((await page.locator('.cart-item').first().innerText()).includes('$116.00'));
  await page.getByRole('button',{name:/Remove Black LED Vanity Mirror/i}).click();
  await page.getByRole('alertdialog').getByRole('button',{name:'OK'}).click();
  await page.getByText('Your cart is ready for your first find').waitFor();
  await ready(page,LIVE+'/product/da883');
  await page.locator('button.purchase-submit').click();
  await ready(page,LIVE+'/cart');
  await page.getByRole('button',{name:'Clear Cart'}).click();
  await page.getByRole('alertdialog').getByRole('button',{name:'OK'}).click();
  await page.getByText('Your cart is ready for your first find').waitFor();
  return '4 pieces -> $58; 8 pieces -> $116; remove; clear';
});
await check('stock limit enforced in purchase quantity',async()=>{
  await context.clearCookies();
  await page.goto(LIVE+'/product/da883');
  const input=page.getByLabel('Pieces quantity');
  await input.fill('999999');
  const qty=Number(await input.inputValue());
  assert(qty<=780,'quantity exceeded available 780: '+qty);
  return 'entered 999999 and quantity was limited to '+qty;
});
await check('cart valid and invalid coupon behavior',async()=>{
  await ready(page,LIVE+'/cart');
  const promo=page.getByRole('textbox',{name:'Promo code'});
  await promo.fill('artisan');
  await page.getByRole('button',{name:'Apply'}).click();
  await page.getByText('Enter a valid coupon code.').waitFor();
  await promo.fill('ARTISAN');
  await page.getByRole('button',{name:'Apply'}).click();
  await page.getByText('Coupon code accepted for this demo.',{exact:false}).waitFor();
  assert((await page.locator('.cart-summary').innerText()).includes('$0.00'));
  return 'invalid lowercase rejected; ARTISAN accepted with no discount';
});
await check('search, sort, price filter, and clear',async()=>{
  await ready(page,LIVE+'/search?q=DA883');
  await page.getByText('DA883',{exact:false}).first().waitFor({timeout:12000});
  await ready(page,LIVE+'/collection/new-arrivals');
  await page.getByRole('combobox',{name:'Sort'}).selectOption('price-asc');
  await page.getByText('Showing',{exact:false}).last().waitFor();
  const label=page.locator('aside label').filter({hasText:'$10.01 +'}).first();
  assert(await label.count(),'price band filter not found');
  await label.click();
  await page.getByRole('button',{name:'Clear All'}).click();
  return 'DA883 keyword search, sort price ascending, filter and clear';
});
await check('demo login and registration validation',async()=>{
  await ready(page,LIVE+'/login');
  await page.locator('input[name=email]').fill('qa-only@example.invalid');
  await page.locator('input[name=password]').fill('synthetic-only');
  await page.getByRole('button',{name:'Sign in'}).click();
  await page.getByText('Sign-in is not available yet.',{exact:false}).waitFor();
  await ready(page,LIVE+'/register');
  await page.locator('input[name=confirmation]').waitFor({timeout:12000});
  return 'login explicitly remains demo; registration fields render';
});
await check('checkout validation, payment methods, and demo confirmation',async()=>{
  await page.evaluate(()=>sessionStorage.removeItem('artisan-mart-cart'));
  await ready(page,LIVE+'/product/da883');
  await page.getByRole('radio',{name:/Order By Case/}).check();
  await page.getByLabel('Case quantity').fill('4');
  await page.locator('button.purchase-submit').click();
  await ready(page,LIVE+'/cart');
  assert((await page.locator('.cart-summary').innerText()).includes('$580.00'));
  await page.getByRole('link',{name:'Proceed to Checkout'}).click();
  await page.getByText('Billing Address').waitFor();
  const form=page.locator('form').filter({hasText:'Billing Address'}).first();
  assert.equal(await form.evaluate(el=>el.checkValidity()),false);
  for(const input of await form.locator('input[required]').all()){
    const type=await input.getAttribute('type');
    const label=await input.evaluate(el=>el.closest('label')?.textContent||'');
    const value=type==='email'?'qa-only@example.invalid':/Telephone/.test(label)?'7272255768':/Zip/.test(label)?'33702':'Demo';
    await input.fill(value);
  }
  await page.getByRole('checkbox',{name:/Ship to the same address/}).uncheck();
  await page.getByText('Shipping Address').waitFor();
  for(const input of await form.locator('input[required]').all()){
    if(await input.inputValue())continue;
    const label=await input.evaluate(el=>el.closest('label')?.textContent||'');
    await input.fill(/Zip/.test(label)?'33702':'Demo');
  }
  await page.getByRole('button',{name:/Place Your Order/}).click();
  await page.getByText('Enter the name on your card.').waitFor();
  await page.getByRole('radio',{name:/Wire Transfer/}).check();
  await page.getByRole('button',{name:/Place Your Order/}).click();
  await page.getByText('Thank You for Your Purchase!').waitFor({timeout:10000});
  await page.getByText('Demo confirmation only.',{exact:false}).waitFor();
  return 'required form, alternate shipping, invalid card error, wire demo confirmation; no real order/payment';
});
await check('navigation menus and all homepage internal links',async()=>{
  await ready(page,LIVE+'/');
  const links=await page.locator('a[href^="/"]').evaluateAll(nodes=>[...new Set(nodes.map(n=>new URL(n.href).pathname).filter(x=>x.startsWith('/')))]);
  const paths=[...new Set([...links,'/about-us','/terms-of-sale','/privacy','/contact','/register','/login','/cart','/checkout','/express-order','/shop-by-price','/newsletter','/careers'])];
  let failures=[];
  for(const route of paths){
    try{
      const response=await page.goto(LIVE+route,{waitUntil:'domcontentloaded',timeout:16000});
      assert(response && response.status()<400,'HTTP '+response?.status());
      await page.locator('body').waitFor();
      await page.waitForTimeout(250);
      const body=await page.locator('body').innerText();
      assert(!/Product not found\.|Could not load product\.|Page not found\./i.test(body),'broken page content');
    }catch(e){failures.push({route,error:e.message});}
  }
  fs.writeFileSync(path.join(out,'navigation-results.json'),JSON.stringify({tested:paths.length,failures},null,2));
  assert.equal(failures.length,0,JSON.stringify(failures.slice(0,12)));
  return paths.length+' browser navigations successful';
});
await check('125 product pages render title/SKU/price/stock and 354 images load',async()=>{
  let failures=[];
  let cursor=0;
  async function worker(){
    const p=await context.newPage();
    while(cursor<PRODUCTS.length){
      const item=PRODUCTS[cursor++];
      try{
        const r=await p.goto(LIVE+'/product/'+item.sku.toLowerCase(),{waitUntil:'domcontentloaded',timeout:25000});
        assert(r&&r.status()===200,'bad status '+r?.status());
        await p.getByText('Item # '+item.sku,{exact:false}).first().waitFor({timeout:16000});
        const text=await p.locator('body').innerText({timeout:8000});
        assert(text.includes(item.sku),'SKU not present');
        assert(text.replace(/\s+/g,' ').includes(item.title.replace(/\s+/g,' ')),'title not present');
        if(item.price!=null) assert(text.includes('$'+item.price.toFixed(2)),'price mismatch');
        if(item.stock!=null) assert(text.includes(item.stock.toLocaleString('en-US')),'stock mismatch');
        if(item.description)assert(text.includes(item.description.slice(0,35)),'description mismatch');
        if(item.category)assert(text.includes(item.category),'category mismatch');
        if(item.subcategory)assert(text.includes(item.subcategory),'subcategory mismatch');
        if(item.upc)assert(text.includes(item.upc),'UPC mismatch');
        for(const [key,value] of Object.entries(item.specs||{}))assert(text.includes(String(value)),'spec mismatch '+key);
      }catch(e){failures.push({sku:item.sku,error:e.message});}
    }
    await p.close();
  }
  await Promise.all(Array.from({length:4},()=>worker()));
  let brokenImages=[];
  let k=0;
  async function checkImage(){
    while(k<assets.length){
      const img=assets[k++];
      try{
        const res=await context.request.get(LIVE+'/'+img,{timeout:16000});
        if(!res.ok()||!(res.headers()['content-type']||'').includes('image/'))brokenImages.push({img,status:res.status(),type:res.headers()['content-type']});
      }catch(e){brokenImages.push({img,error:e.message});}
    }
  }
  await Promise.all(Array.from({length:5},()=>checkImage()));
  fs.writeFileSync(path.join(out,'catalog-products-results.json'),JSON.stringify({tested:PRODUCTS.length,images:assets.length,failures,brokenImages},null,2));
  assert.equal(failures.length,0,JSON.stringify(failures.slice(0,8)));
  assert.equal(brokenImages.length,0,JSON.stringify(brokenImages.slice(0,8)));
  return '125 product pages verified, 354 image requests verified';
});
await check('production versus staging desktop/mobile screenshots',async()=>{
  const comparisons=[];
  for(const [w,h] of [[1365,900],[390,844]]){
    const pages=[];
    for(const [label,base] of [['production',LIVE],['staging',STAGING]]){
      const ctx=await browser.newContext({viewport:{width:w,height:h},deviceScaleFactor:1,reducedMotion:'reduce',locale:'en-US'});
      const pg=await ctx.newPage();
      await ready(pg,base+'/');await settle(pg);
      const file=path.join(out,label+'-'+w+'x'+h+'.png');
      await pg.screenshot({path:file,animations:'disabled',caret:'hide'});
      pages.push({file,ctx});
    }
    const diff=comparePng(pages[0].file,pages[1].file);
    comparisons.push({width:w,height:h,...diff});
    await Promise.all(pages.map(x=>x.ctx.close()));
    assert(diff.ratio<0.02,'visual significant changed pixels '+JSON.stringify(diff));
  }
  fs.writeFileSync(path.join(out,'visual-comparison.json'),JSON.stringify(comparisons,null,2));
  return JSON.stringify(comparisons.map(c=>({width:c.width,changedRatio:c.ratio,meanDiff:c.meanDiff})));
});
await check('HTTP redirects, www and production HTTPS',async()=>{
  const r=await context.request.get('http://artisanmart.site/',{maxRedirects:0,timeout:15000});
  assert([301,302,307,308].includes(r.status()),'http status '+r.status());
  const www=await context.request.get(WWW+'/',{timeout:20000});
  assert(www.ok(),'www HTTPS status '+www.status());
  assert((await www.text()).includes('Artisan Mart'));
  return 'HTTP '+r.status()+' → '+r.headers().location+'; www HTTPS '+www.status();
});
await check('no same-origin JavaScript errors/failed network requests',()=>{
  assert.equal(errors.length,0,JSON.stringify(errors.slice(0,12)));
  return '0 captured own-origin page errors, failed requests or >=400 responses';
});
fs.writeFileSync(path.join(out,'report.json'),JSON.stringify({date:new Date().toISOString(),live:LIVE,baseline:NETLIFY,tests:results,errors},null,2));
await context.close();await browser.close();
console.log('TOTAL '+results.length+' PASS '+results.filter(x=>x.status==='PASS').length+' FAIL '+results.filter(x=>x.status==='FAIL').length);
process.exitCode=results.some(x=>x.status==='FAIL')?1:0;

})().catch(e=>{console.error('FATAL AUDIT ERROR:',e.stack||e);process.exitCode=1;});
