const {chromium}=require("playwright");
const {randomBytes}=require("node:crypto");
const fs=require("node:fs");
const assert=require("node:assert/strict");
const RUN=process.env.GITHUB_RUN_ID;
const EMAIL="operation.record1+artisan-isolationqa-"+RUN+"@gmail.com";
const PASSWORD="Qa!"+randomBytes(18).toString("base64url")+"9Ab";
const OTHER_USER="c3ef7c52-07c6-46e6-be8c-80ed54c7ff1a";
const BASE="https://artisanmart.site";
const results=[],dir="artisan-isolation-qa";fs.mkdirSync(dir,{recursive:true});
function log(name,ok,detail){results.push({name,status:ok?"PASS":"FAIL",detail});console.log((ok?"PASS":"FAIL")+" | "+name+" | "+detail);}
const delay=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
 const browser=await chromium.launch({headless:true,args:["--no-sandbox"]});
 const ctx=await browser.newContext({viewport:{width:1365,height:900}});
 const page=await ctx.newPage();
 let apiKey="";
 page.on("request",req=>{if(req.url().includes("/rest/v1/artisan_profiles"))apiKey=req.headers().apikey||apiKey;});
 const go=async p=>{const r=await page.goto(BASE+p,{waitUntil:"networkidle",timeout:30000});assert(r?.ok(),"HTTP "+r?.status());};
 try{
  await go("/register");
  await page.locator("input[name=firstName]").fill("Artisan");
  await page.locator("input[name=lastName]").fill("Isolation");
  await page.locator("input[name=phone]").fill("2125550123");
  await page.locator("input[name=email]").fill(EMAIL);
  await page.locator("input[name=password]").fill(PASSWORD);
  await page.locator("input[name=confirmation]").fill(PASSWORD);
  await page.locator('input[name=agreement]').check();
  const pending=page.waitForResponse(x=>x.url().includes("/auth/v1/signup")&&x.request().method()==="POST",{timeout:20000});
  await page.getByRole("button",{name:/Create account/i}).click();
  const signup=await pending,body=await signup.json();
  assert(signup.status()===200&&(body.user?.id||body.id));
  log("Second genuine signup",true,"Supabase Auth created a new user; confirmation required");
  console.log("READY_FOR_SECOND_CONFIRMATION "+EMAIL);
  let loggedIn=false;
  for(let i=0;i<30;i++){
   await delay(9000);
   await go("/login");
   await page.locator("input[name=email]").fill(EMAIL);
   await page.locator("input[name=password]").fill(PASSWORD);
   const response=page.waitForResponse(x=>x.url().includes("/auth/v1/token")&&x.request().method()==="POST",{timeout:12000});
   await page.getByRole("button",{name:/Sign in/i}).click();
   if((await response).status()===200){loggedIn=true;break;}
  }
  log("Verified second customer login",loggedIn,"Genuine password grant after email confirmation");
  if(!loggedIn)throw Error("Email link not confirmed in test period");
  await go("/account");
  await page.getByText(/Signed in as/i).waitFor();
  const session=await page.evaluate(()=>JSON.parse(localStorage.getItem("artisanmart-customer-auth")||"null"));
  assert(session?.access_token&&apiKey,"Authenticated token and public API key required");
  const query=await ctx.request.get("https://gbsyaembvdtadkuldpbe.supabase.co/rest/v1/artisan_profiles?select=user_id&user_id=eq."+OTHER_USER,{headers:{Authorization:"Bearer "+session.access_token,apikey:apiKey}});
  const rows=query.ok()?await query.json():null;
  log("Customer isolation against first QA identity",query.ok()&&Array.isArray(rows)&&rows.length===0,"Other customer's profile invisible under RLS");
  await page.getByLabel("First name").fill("IsolationUpdated");
  await page.getByRole("button",{name:"Save details"}).click();
  await page.getByText(/account details were saved/i).waitFor();
  await page.reload({waitUntil:"networkidle"});
  const observed=await page.getByLabel("First name").inputValue();
  log("Profile update persisted",observed==="IsolationUpdated","Name saved and loaded after refresh");
  await go("/product/da883");
  await page.getByRole("radio",{name:/Order By Case/i}).check();
  await page.getByLabel("Case quantity").fill("4");
  await page.locator("button.purchase-submit").click();
  await go("/cart");
  const cart=(await page.locator(".cart-summary").innerText()).includes("$580.00");
  log("Cart preservation",cart,"$580 wholesale order in authenticated cart");
  await page.getByRole("link",{name:/Proceed to Checkout/i}).click();
  await page.waitForURL(/\/checkout/,{timeout:11000});
  await page.getByText("Billing Address").first().waitFor();
  log("Authenticated checkout routing",true,"Verified customer reached checkout address form");
 }catch(e){log("Second-customer E2E",false,String(e.message).slice(0,250));}
 fs.writeFileSync(dir+"/results.json",JSON.stringify({qaEmail:EMAIL,checks:results},null,2));
 await browser.close();if(results.some(r=>r.status==="FAIL"))process.exitCode=1;
})().catch(e=>{console.error("QA fatal: "+e.message);process.exitCode=1;});
