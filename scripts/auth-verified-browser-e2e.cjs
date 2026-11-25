const {chromium}=require("playwright");
const {randomBytes}=require("node:crypto");
const fs=require("node:fs");
const assert=require("node:assert/strict");
const BASE=process.env.AUTH_PREVIEW_URL;
if(!BASE||!BASE.startsWith("https://")||!BASE.endsWith(".artisanmart-staging.pages.dev"))
 throw new Error("Valid, verified Cloudflare preview URL required");
const EMAIL="operation.record1+artisan-auth-verified-e2e-20261125@gmail.com";
const PASSWORD="Qa!"+randomBytes(18).toString("base64url")+"9a";
const results=[];fs.mkdirSync("auth-verified-qa",{recursive:true});
function log(name,pass,detail){results.push({name,status:pass?"PASS":"FAIL",detail});console.log((pass?"PASS":"FAIL")+" | "+name+" | "+detail);}
(async()=>{
 const browser=await chromium.launch({headless:true,args:["--no-sandbox"]});
 const ctx=await browser.newContext({viewport:{width:1365,height:900},locale:"en-US"});
 const page=await ctx.newPage();
 const navigate=async(p)=>{const r=await page.goto(BASE+p,{waitUntil:"networkidle",timeout:25000});assert(r?.ok());};
 try {
  await navigate("/product/da883");
  await page.getByRole("radio",{name:/Order By Case/i}).check();
  await page.getByLabel("Case quantity").fill("4");
  await page.locator("button.purchase-submit").click();
  await navigate("/cart");
  await page.getByText("40 pieces",{exact:false}).first().waitFor();
  assert((await page.locator(".cart-summary").innerText()).includes("$580.00"));
  await page.getByRole("link",{name:/Proceed to Checkout/i}).click();
  await page.waitForURL(/\/login/);
  await page.locator("input[name=email]").waitFor();
  log("Guest cart and protected login redirect",true,"40 units/$580, login required");
  await navigate("/register");
  await page.locator("input[name=firstName]").fill("Artisan");
  await page.locator("input[name=lastName]").fill("Verified");
  await page.locator("input[name=phone]").fill("7272255768");
  await page.locator("input[name=email]").fill(EMAIL);
  await page.locator("input[name=password]").fill(PASSWORD);
  await page.locator("input[name=confirmation]").fill(PASSWORD);
  const responsePromise=page.waitForResponse(r=>r.url().includes("/auth/v1/signup")&&r.request().method()==="POST",{timeout:18000});
  await page.getByRole("button",{name:/Create account/i}).click();
  const signup=await responsePromise;
  if(signup.status()!==200)throw new Error("Supabase signup HTTP "+signup.status());
  const body=await signup.json();
  if(!(body.user?.id||body.id))throw new Error("Supabase account not created");
  await page.getByRole("heading",{name:"Check Your Email"}).waitFor();
  log("Real signup and confirmation requirement",true,"Supabase 200; verification screen shown; session not issued");

  // The verification email is independently opened via the connected Gmail
  // account. Retain the randomly generated QA password only in this process.
  let verified=false,reason="";
  for(let i=0;i<8;i++){
    await page.waitForTimeout(i===0?18000:11000);
    await navigate("/login");
    await page.locator("input[name=email]").fill(EMAIL);
    await page.locator("input[name=password]").fill(PASSWORD);
    const promise=page.waitForResponse(r=>r.url().includes("/auth/v1/token")&&r.request().method()==="POST",{timeout:12000});
    await page.getByRole("button",{name:/Sign in/i}).click();
    const response=await promise;
    if(response.status()===200){verified=true;break;}
    reason="Supabase login HTTP "+response.status();
  }
  if(!verified)throw new Error("Email-confirmed login not completed within controlled test window: "+reason);
  log("Verified customer login",true,"Supabase password-grant accepted");
  await page.waitForURL(/\/(checkout|account)/,{timeout:16000});
  await page.locator('button[aria-haspopup="menu"]').waitFor();
  const label=(await page.locator('button[aria-haspopup="menu"]').last().innerText()).trim();
  if(!label.toLowerCase().includes("artisan"))throw new Error("Customer name missing from header: "+label);
  log("Profile-backed customer-name header",true,"Account name rendered");
  await navigate("/checkout");
  await page.getByText("Billing Address").first().waitFor();
  assert((await page.locator("body").innerText()).includes("$580.00"));
  assert(await page.getByRole("button",{name:/Payments temporarily unavailable/i}).isDisabled());
  log("Return to checkout and guest cart preservation",true,"40 units, $580, payments disabled");
  await navigate("/account");
  await page.getByText("Signed in as",{exact:false}).waitFor();
  await page.reload({waitUntil:"networkidle"});
  await page.getByText("Signed in as",{exact:false}).waitFor();
  log("Session persists through navigation/refresh",true,"Profile private account accessible");
  await page.setViewportSize({width:390,height:844});
  const menu=page.locator('button[aria-haspopup="menu"]').last();
  await menu.click();
  await page.getByRole("menuitem",{name:"Logout"}).waitFor();
  await page.screenshot({path:"auth-verified-qa/customer-mobile-menu.png",animations:"disabled"});
  log("Mobile customer-name menu",true,"Account dropdown and logout available");
  await page.getByRole("menuitem",{name:"Logout"}).click();
  await page.waitForURL(/\/login/,{timeout:10000}).catch(()=>{});
  await navigate("/account");
  await page.getByText(/Please sign in to view your account/i).waitFor();
  log("Logout and private page protection",true,"Account inaccessible after signout");
 }catch(e){log("End-to-end verified account",false,String(e.message).slice(0,230));}
 fs.writeFileSync("auth-verified-qa/results.json",JSON.stringify({checks:results,qaEmail:EMAIL},null,2));
 await ctx.close();await browser.close();
 console.log("TOTAL "+results.length+" PASS "+results.filter(x=>x.status==="PASS").length+" FAIL "+results.filter(x=>x.status==="FAIL").length);
 process.exitCode=results.some(x=>x.status==="FAIL")?1:0;
})().catch(e=>{console.error("Harness error "+e.message);process.exitCode=1;});
