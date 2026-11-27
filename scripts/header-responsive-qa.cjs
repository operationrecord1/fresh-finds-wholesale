const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const http=require('node:http');
const path=require('node:path');

const widths=[240,280,320,360,380,499,500,600,759,760,761,900,999,1000,1024,1025,1200,1360,1361,1449,1450,1599,1600,1799,1800,1920,2000,2500,3000];
const base=process.env.ARTISAN_HEADER_URL||'http://127.0.0.1:4184';
const out='header-responsive-qa';fs.mkdirSync(out,{recursive:true});

async function main(){
 let server;
 if(process.env.ARTISAN_QA_SERVE==='1'){
  const dir=path.resolve('dist/client');
  server=http.createServer((req,res)=>{
   let file=path.resolve(dir,'.'+decodeURIComponent(new URL(req.url,base).pathname));
   if(!file.startsWith(dir+path.sep)&&file!==dir){res.writeHead(403);return res.end();}
   if(!fs.existsSync(file)||fs.statSync(file).isDirectory())file=path.join(dir,'index.html');
   res.setHeader('Content-Type',({'.js':'text/javascript','.css':'text/css','.png':'image/png','.svg':'image/svg+xml'})[path.extname(file)]||'text/html');
   fs.createReadStream(file).pipe(res);
  });
  await new Promise(resolve=>server.listen(4184,'127.0.0.1',resolve));
 }
 const browser=await chromium.launch({headless:true});
 const page=await browser.newPage({viewport:{width:1440,height:900}});
 const results=[];
 for(const width of widths){
  await page.setViewportSize({width,height:900});
  await page.goto(base+'/',{waitUntil:'domcontentloaded'});
  await page.locator('.store-header').waitFor();
  const d=await page.evaluate(()=>{
   const shown=s=>{const e=document.querySelector(s);return !!e&&getComputedStyle(e).display!=='none'&&e.getBoundingClientRect().width>0};
   const rect=s=>document.querySelector(s)?.getBoundingClientRect().toJSON();
   const nav=document.querySelector('.store-nav');
   return {overflow:document.documentElement.scrollWidth>innerWidth,dots:shown('.store-mobile-menu-toggle'),minimum:shown('.store-minimum'),newsletter:shown('.store-account-links a[href="/newsletter"]'),careers:shown('.store-utility-links a[href="/careers"]'),contact:shown('.store-utility-links a[href="/contact"]'),knowledge:shown('[data-header-secondary]'),call:shown('.store-call-button'),imports:shown('.store-nav-imports'),closeouts:shown('.store-nav-closeouts'),search:rect('.store-search'),cart:rect('.store-cart-button'),menu:rect('.store-mobile-menu-toggle'),brand:rect('.store-brand-contact'),account:rect('.store-login-link'),utility:rect('.store-utility-links'),accounts:rect('.store-account-links'),navOverflow:nav?.scrollWidth>nav?.clientWidth+1};
  });
  assert(!d.overflow,`Page overflow at ${width}px`);
  assert(d.search?.width>=100,`Search clipped at ${width}px`);
  if(width>=1250)assert(d.search.width>=350,`Search should use available desktop width at ${width}px`);
  if(width>=1920)assert(d.search.width>=650,`Search should expand on wide screens at ${width}px`);
  assert.equal(await page.locator('.store-search input').evaluate(e=>getComputedStyle(e).borderTopLeftRadius),'6px',`Search corner shape at ${width}px`);
  assert.equal(await page.locator('.store-cart-button').getAttribute('href'),'/cart',`Cart navigation at ${width}px`);
  assert.equal(await page.locator('#cart-preview').count(),0,`Cart preview should be absent at ${width}px`);
  assert.equal(d.dots,width<760,`Menu visibility at ${width}px`);
  assert.equal(d.minimum,width>=500,`Minimum badge visibility at ${width}px`);
  assert.equal(d.newsletter,width>=1000,`Newsletter visibility at ${width}px`);
  assert.equal(d.call,width>=1600,`Phone visibility at ${width}px`);
  if(width<760){
   assert(d.menu.left<d.brand.left&&d.brand.left<d.account.left&&d.account.left<d.cart.left,`Compact control order at ${width}px`);
   assert(d.cart.bottom<=d.search.top+1,`Search should be below controls at ${width}px`);
  }else{
   assert(d.careers&&d.contact&&d.knowledge,`Desktop utility links missing at ${width}px`);
   assert(d.account.left<d.cart.left,`Cart should follow account at ${width}px`);
   if(width>=1600)assert(width-d.cart.right<=60,`Cart should align to the right edge at ${width}px`);
   assert(Math.abs(d.search.top-d.accounts.top)<6&&Math.abs(d.search.top-d.cart.top)<6,`Desktop single line at ${width}px`);
   assert(!d.navOverflow,`Navigation overflow at ${width}px`);
   assert.equal(d.closeouts,width>=1600,`Closeouts priority at ${width}px`);
   assert.equal(d.imports,width>=1450,`Imports priority at ${width}px`);
  }
  if([240,360,499,500,759,760,761,1000,1360,1450,1600,3000].includes(width))await page.screenshot({path:path.join(out,`header-${width}.png`)});
  results.push({width,status:'PASS'});console.log('PASS header',width);
 }
 await page.setViewportSize({width:240,height:900});await page.goto(base+'/',{waitUntil:'domcontentloaded'});
 await page.getByRole('button',{name:'Browse products menu'}).click();
 await page.locator('#store-mobile-menu').waitFor();
 assert(await page.locator('.store-mobile-menu-toggle svg.lucide-menu').count(),'Horizontal-line menu icon missing');
 assert.equal(await page.getByRole('link',{name:'Login or register'}).getAttribute('href'),'/login');
 for(const label of ['Imports','Closeouts','Best Sellers','Reduced Price','New Arrivals','Careers','Contact Us','Join Our Newsletter'])assert(await page.locator('#store-mobile-menu').getByRole('link',{name:label,exact:true}).count(),`${label} missing from compact menu`);
 assert(await page.locator('#store-mobile-menu').getByText('Knowledge Center').count());
 await page.getByRole('button',{name:'Browse products menu'}).click();
 await page.getByRole('textbox',{name:'Search products'}).focus();
 const focus=await page.locator('.store-search input').evaluate(e=>({bg:getComputedStyle(e).backgroundColor,shadow:getComputedStyle(e).boxShadow}));
 assert(focus.shadow.includes('0.09'),`Search focus should use a light black ring: ${focus.shadow}`);
 await page.setViewportSize({width:760,height:900});await page.getByRole('button',{name:'Categories',exact:true}).click();
 for(const label of ['Imports','Closeouts'])assert(await page.locator('#store-dropdown').getByRole('link',{name:label,exact:true}).count(),`${label} not reachable at 760px`);
 fs.writeFileSync(path.join(out,'results.json'),JSON.stringify({base,results,menus:'PASS',focus:'PASS'},null,2));
 await browser.close();if(server)server.close();
}
main().catch(error=>{console.error(error);process.exit(1)});
