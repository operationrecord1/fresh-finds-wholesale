const { chromium } = require('playwright');
const fs = require('node:fs');
const assert = require('node:assert/strict');
const cp = require('node:child_process');
const origin = 'https://artisanmart.site';
const netlify = 'https://lambent-gnome-721faa.netlify.app';
const out = '/tmp/artisan-results';
fs.mkdirSync(out, { recursive:true });
(async () => {
  let exe; try { exe = cp.execSync('which google-chrome').toString().trim(); } catch {}
  const browser = await chromium.launch({headless:true,...(exe?{executablePath:exe}:{})});
  const results=[];
  try {
    const published = await browser.newPage({viewport:{width:1440,height:1000}});
    const deployment = await published.goto(netlify+'/info/sales?verify=f539472',{waitUntil:'networkidle',timeout:60000});
    assert.equal(deployment.status(),200);
    await published.getByRole('heading',{name:'Sales FAQ',exact:true}).waitFor();
    await published.getByText('What is the minimum order amount?',{exact:true}).waitFor();
    assert.equal(await published.locator('.store-promo').count(),0);
    assert(!(await published.locator('body').innerText()).includes('has not been provided yet'));
    const deploymentEvidence={url:published.url(),httpStatus:deployment.status(),headers:await deployment.allHeaders(),newFAQ:true,promotionRemoved:true,sourceCommit:'f539472066670b00f3f60f196ffb0558944b43fa'};
    fs.writeFileSync(out+'/netlify-published.json',JSON.stringify(deploymentEvidence,null,2));
    await published.screenshot({path:out+'/netlify-faq.png'});
    console.log('NETLIFY_PUBLISHED',JSON.stringify(deploymentEvidence));
    await published.close();
    for(const width of [1440,390,320]) {
      const context=await browser.newContext({viewport:{width,height:1000},deviceScaleFactor:width<500?2:1});
      const page=await context.newPage();
      const errors=[];page.on('pageerror',e=>errors.push(e.message));
      const response=await page.goto(origin+'/?verify=f539472',{waitUntil:'networkidle',timeout:60000});
      assert.equal(response.status(),200);
      await page.getByRole('heading',{name:'Your Premier Source For Wholesale General Merchandise',exact:true}).waitFor();
      assert.equal(await page.locator('.store-promo').count(),0);
      assert(!/VIP8|8% OFF/.test(await page.locator('body').innerText()));
      await page.screenshot({path:out+'/home-'+width+'.png'});
      for(const route of ['about-us','contact','info/sales']) {
        await page.goto(origin+'/'+route+'?verify=f539472',{waitUntil:'networkidle',timeout:60000});
        assert(!(await page.locator('body').innerText()).includes('Artisan Market'));
        assert(!(await page.locator('head').innerHTML()).includes('Artisan Market'));
      }
      await page.getByText('What is the minimum order amount?',{exact:true}).click();
      await page.screenshot({path:out+'/faq-'+width+'.png'});
      assert.equal(await page.locator('details').filter({has:page.getByText('Can I select more than the available quantity?',{exact:true})}).count(),1);
      await page.goto(origin+'/product/da883?verify=f539472',{waitUntil:'networkidle',timeout:60000});
      const field=page.getByLabel('Pieces quantity',{exact:true});
      await field.fill('999999');assert.equal(await field.inputValue(),'780');
      assert(await page.getByRole('button',{name:'Increase piece',exact:true}).isDisabled());
      await page.getByRole('button',{name:'Add To Cart',exact:true}).click();
      await page.waitForFunction(()=>JSON.parse(sessionStorage.getItem('artisan-mart-cart')||'[]')[0]?.pieces===780);
      await field.fill('999999');assert.equal(await field.inputValue(),'0');
      await page.goto(origin+'/cart?verify=f539472',{waitUntil:'networkidle',timeout:60000});
      await page.getByRole('button',{name:/Change quantity for Black LED/}).click();
      const edit=page.getByLabel('Pieces quantity',{exact:true});
      await edit.fill('999999');assert.equal(await edit.inputValue(),'780');
      await page.getByRole('button',{name:'Update Cart',exact:true}).click();
      await page.getByRole('dialog').waitFor({state:'detached'});
      await page.goto(origin+'/checkout?verify=f539472',{waitUntil:'networkidle',timeout:60000});
      await page.getByRole('button',{name:'Place Your Order',exact:true}).waitFor();
      let release;const gate=new Promise(resolve=>{release=resolve});
      await context.route('**/*',async route=>{
        if(new URL(route.request().url()).pathname.endsWith('.js'))await gate;
        return route.continue();
      });
      await page.reload({waitUntil:'commit'});
      await page.waitForTimeout(120);
      const shellText=(await page.locator('body').innerText()).trim();assert.equal(shellText,'');
      release();
      await page.getByRole('button',{name:'Place Your Order',exact:true}).waitFor();
      assert(!(await page.locator('body').innerText()).includes('below the $500'));
      assert.deepEqual(errors,[]);
      results.push({url:origin,width,promotionRemoved:true,brandConsistent:true,salesFAQ:true,stockCap:780,remainingAfterAdd:0,editingCap:780,reloadShellText:shellText,checkoutRestored:true,pageErrors:errors});
      fs.writeFileSync(out+'/live-browser-checks.json',JSON.stringify(results,null,2));
      console.log('LIVE_PASS',JSON.stringify(results.at(-1)));
      await context.close();
    }
  } finally { await browser.close(); }
})().catch(e=>{console.error(e);process.exitCode=1;});
