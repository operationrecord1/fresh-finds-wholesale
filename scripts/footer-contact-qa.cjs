const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');

const widths = [240,280,320,340,360,380,381,420,421,480,500,540,541,600,760,761,850,900,901,1024,1100,1180,1280,1440,1600,1920,2000,2200,2500,2560,2800,3000];
const base = process.env.ARTISAN_FOOTER_URL || 'http://127.0.0.1:4174';
const out = 'footer-contact-qa';
fs.mkdirSync(out,{recursive:true});

async function main(){
 let server;
 if(process.env.ARTISAN_QA_SERVE==='1'){
  const dir=path.resolve('dist/client');
  server=http.createServer((req,res)=>{
   let file=path.resolve(dir,'.'+decodeURIComponent(new URL(req.url,base).pathname));
   if(!file.startsWith(dir+path.sep)&&file!==dir){res.writeHead(403);return res.end();}
   if(!fs.existsSync(file)||fs.statSync(file).isDirectory())file=path.join(dir,'index.html');
   res.setHeader('Content-Type',({'.js':'text/javascript','.css':'text/css','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml'})[path.extname(file)]||'text/html');
   fs.createReadStream(file).pipe(res);
  });
  await new Promise(resolve=>server.listen(4174,'127.0.0.1',resolve));
 }
 const browser=await chromium.launch({headless:true});
 const page=await browser.newPage({viewport:{width:1440,height:900}});
 const results=[];
 for(const width of widths){
  await page.setViewportSize({width,height:900});
  await page.goto(base+'/contact',{waitUntil:'domcontentloaded'});
  await page.locator('.contact-page').waitFor();
  const data=await page.evaluate(()=>{
   const rect=s=>document.querySelector(s).getBoundingClientRect();
   const footer=[...document.querySelectorAll('.footer-columns>section')];
   return {viewport:innerWidth,scrollWidth:document.documentElement.scrollWidth,footer:footer.map(e=>({name:e.className,x:e.getBoundingClientRect().x,y:e.getBoundingClientRect().y,w:e.getBoundingClientRect().width})),links:[...document.querySelectorAll('.footer-about-list a')].map(e=>({text:e.textContent,visible:getComputedStyle(e).display!=='none',w:e.getBoundingClientRect().width,scroll:e.scrollWidth})),toggle:document.querySelector('.footer-mobile-links')!==null};
  });
  assert(data.scrollWidth<=width,`Horizontal overflow at ${width}px`);
  assert.deepEqual(data.footer.map(x=>x.name),['footer-about','footer-newsletter','footer-contact']);
  assert.equal(data.toggle,false);
  assert.deepEqual(data.links.map(x=>x.text),['Industries Served','Easy Shipping','Artisan Mart Careers','Artisan Cares','Contact Us']);
  assert(data.links.every(x=>x.visible&&x.scroll<=x.w+1),`Footer link overflow at ${width}px`);
  const [aboutColumn,newsletterColumn,addressColumn]=data.footer;
  if(width<=540)assert(aboutColumn.y<newsletterColumn.y&&newsletterColumn.y<addressColumn.y,`Footer stack order at ${width}px`);
  if(width>540&&width<=900)assert(aboutColumn.y<addressColumn.y&&addressColumn.y===newsletterColumn.y&&addressColumn.x<newsletterColumn.x,`Footer two-column order at ${width}px`);
  if(width>900)assert(addressColumn.x<aboutColumn.x&&aboutColumn.x<newsletterColumn.x,`Footer three-column order at ${width}px`);
  if([240,320,540,541,900,901,1440,3000].includes(width))await page.locator('.artisan-footer').screenshot({path:path.join(out,`footer-${width}.png`)});
  await page.goto(base+'/about-us#industries-served',{waitUntil:'domcontentloaded'});
  await page.locator('.about-page').waitFor();
  const about=await page.evaluate(()=>({scrollWidth:document.documentElement.scrollWidth,ids:['industries-served','easy-shipping','careers','artisan-cares'].map(id=>!!document.getElementById(id)),nav:[...document.querySelectorAll('.about-nav a')].map(x=>x.getBoundingClientRect().toJSON())}));
  assert(about.scrollWidth<=width,`About page overflow at ${width}px`);
  assert(about.ids.every(Boolean),`Missing About section at ${width}px`);
  assert.equal(await page.locator('.about-nav a[href="/contact"]').count(),1);
  assert.equal(await page.locator('.about-nav .about-back').isVisible(),width>760,`About back-to-top visibility at ${width}px`);
  if([240,320,540,760,1440,3000].includes(width))await page.screenshot({path:path.join(out,`about-${width}.png`)});
  for(const route of ['/terms-of-sale','/privacy']){
   await page.goto(base+route,{waitUntil:'domcontentloaded'});
   await page.locator('.terms-page').waitFor();
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`${route} overflow at ${width}px`);
   if([240,540,541,900,901,1440,3000].includes(width))await page.screenshot({path:path.join(out,`${route.slice(1)}-${width}.png`)});
  }
  results.push({width,status:'PASS'});
  console.log('PASS footer, contact and about',width);
 }
 await page.goto(base+'/terms-of-sale',{waitUntil:'domcontentloaded'});
 assert.equal(await page.locator('.terms-conditions>li').nth(2).innerText(),'Online checkout currently accepts credit card payments only.');
 for(const [label,expected] of [['Industries Served','/about-us#industries-served'],['Easy Shipping','/about-us#easy-shipping'],['Artisan Mart Careers','/about-us#careers'],['Artisan Cares','/about-us#artisan-cares'],['Contact Us','/contact']]){
  await page.goto(base+'/contact',{waitUntil:'domcontentloaded'});
  const href=await page.locator('.footer-about-list').getByRole('link',{name:label,exact:true}).getAttribute('href');
  assert.equal(href,expected,`${label} destination`);
 }
 await page.setViewportSize({width:320,height:900});
 await page.goto(base+'/contact',{waitUntil:'domcontentloaded'});
 await page.route('**/api/contact',route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({ok:true,reference:'AM-N-20261127-1234ABCD'})}));
 await page.locator('input[name=name]').fill('Artisan Mart QA');
 await page.locator('input[name=email]').fill('artisanmartllc@gmail.com');
 await page.locator('textarea[name=message]').fill('A contact form test.');
 await page.getByRole('button',{name:'Send message'}).click();
 await page.getByText('Your message has been sent. Keep this reference for your records.').waitFor();
 fs.writeFileSync(path.join(out,'results.json'),JSON.stringify({base,results,form:'PASS'},null,2));
 await browser.close();if(server)server.close();
}
main().catch(error=>{console.error(error);process.exit(1)});
