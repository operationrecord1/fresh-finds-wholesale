const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const http=require('node:http');
const path=require('node:path');

const widths=[240,280,320,360,380,500,760,900,1024,1025,1200,1360,1361,1449,1450,1599,1600,1799,1800,1920,2000,2500,3000];
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
   return {overflow:document.documentElement.scrollWidth>innerWidth,dots:shown('.store-mobile-menu-toggle'),call:shown('.store-call-button'),imports:shown('.store-nav-imports'),closeouts:shown('.store-nav-closeouts'),search:rect('.store-search'),cart:rect('.store-cart-button'),menu:rect('.store-mobile-menu-toggle'),brand:rect('.store-brand-contact'),account:rect('.store-login-link'),navOverflow:nav?.scrollWidth>nav?.clientWidth+1};
  });
  assert(!d.overflow,`Page overflow at ${width}px`);
  assert(d.search?.width>=100,`Search clipped at ${width}px`);
  assert.equal(d.dots,width<=1360,`Three-dot visibility at ${width}px`);
  assert.equal(d.call,width>=1600,`Phone visibility at ${width}px`);
  if(width<=1360){
   assert(d.brand.right<=d.account.left+1,`Brand/account overlap at ${width}px`);
   assert(Math.abs(d.search.top-d.cart.top)<3&&Math.abs(d.cart.top-d.menu.top)<3,`Compact control row at ${width}px`);
  }else{
   assert(!d.navOverflow,`Navigation overflow at ${width}px`);
   assert.equal(d.closeouts,width>=1600,`Closeouts priority at ${width}px`);
   assert.equal(d.imports,width>=1450,`Imports priority at ${width}px`);
  }
  if([240,360,1024,1360,1361,1450,1600,1800,3000].includes(width))await page.screenshot({path:path.join(out,`header-${width}.png`)});
  results.push({width,status:'PASS'});console.log('PASS header',width);
 }
 await page.setViewportSize({width:240,height:900});await page.goto(base+'/',{waitUntil:'domcontentloaded'});
 await page.getByRole('button',{name:'Browse products menu'}).click();
 await page.locator('#store-mobile-menu').waitFor();
 for(const label of ['Imports','Closeouts','Best Sellers','Reduced Price','New Arrivals','Careers','Contact Us','Join Our Newsletter'])assert(await page.locator('#store-mobile-menu').getByRole('link',{name:label,exact:true}).count(),`${label} missing from compact menu`);
 assert(await page.locator('#store-mobile-menu').getByText('Knowledge Center').count());
 await page.getByRole('button',{name:'Browse products menu'}).click();
 await page.getByRole('textbox',{name:'Search products'}).focus();
 const focus=await page.locator('.store-search input').evaluate(e=>({bg:getComputedStyle(e).backgroundColor,shadow:getComputedStyle(e).boxShadow}));
 assert(focus.shadow.includes('0.09'),`Search focus should use a light black ring: ${focus.shadow}`);
 await page.setViewportSize({width:1361,height:900});await page.getByRole('button',{name:'Categories',exact:true}).click();
 for(const label of ['Imports','Closeouts'])assert(await page.locator('#store-dropdown').getByRole('link',{name:label,exact:true}).count(),`${label} not reachable at 1361px`);
 fs.writeFileSync(path.join(out,'results.json'),JSON.stringify({base,results,menus:'PASS',focus:'PASS'},null,2));
 await browser.close();if(server)server.close();
}
main().catch(error=>{console.error(error);process.exit(1)});
