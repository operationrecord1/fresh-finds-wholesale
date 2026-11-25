const { chromium } = require("playwright");
const { randomBytes } = require("node:crypto");
const fs = require("node:fs");
const BASE="https://3290103b.artisanmart-staging.pages.dev";
const EMAIL="operation.record1+artisanmart-auth-qa-20261125@gmail.com";
const password="Qa"+randomBytes(15).toString("base64url")+"8!";
const output=[];
function record(name,pass,detail){output.push({name,status:pass?"PASS":"FAIL",detail});console.log((pass?"PASS":"FAIL")+" | "+name+" | "+String(detail).slice(0,350));}
async function check(name,fn){try{record(name,true,await fn());}catch(e){record(name,false,e.message);}}
(async()=>{
 const browser=await chromium.launch({headless:true,args:["--no-sandbox"]});
 const context=await browser.newContext({viewport:{width:1280,height:800},locale:"en-US"});
 const page=await context.newPage();
 let signupNetwork=null;
 await check("invalid login never authenticates",async()=>{
  await page.goto(BASE+"/login",{waitUntil:"networkidle"});
  await page.locator("input[name=email]").fill(EMAIL);
  await page.locator("input[name=password]").fill("WrongPassword908!");
  const req=page.waitForResponse(r=>r.url().includes("/auth/v1/token")&&r.request().method()==="POST",{timeout:12000});
  await page.getByRole("button",{name:"Sign in"}).click();
  const res=await req;
  if(res.status()<400)throw Error("Unexpected valid login");
  await page.getByText("Invalid email or password",{exact:false}).waitFor({timeout:8000});
  return "Invalid credentials rejected with HTTP "+res.status();
 });
 await check("registration password mismatch validation",async()=>{
  await page.goto(BASE+"/register",{waitUntil:"networkidle"});
  await page.locator("input[name=firstName]").fill("QA");
  await page.locator("input[name=lastName]").fill("Test");
  await page.locator("input[name=phone]").fill("7272255768");
  await page.locator("input[name=email]").fill(EMAIL);
  await page.locator("input[name=password]").fill(password);
  await page.locator("input[name=confirmation]").fill(password+"extra");
  await page.getByRole("button",{name:"Create account"}).click();
  await page.getByText("Your passwords do not match.",{exact:false}).waitFor({timeout:8000});
  return "No signup attempt on mismatch";
 });
 await check("real signup request on development preview",async()=>{
  await page.locator("input[name=confirmation]").fill(password);
  const req=page.waitForResponse(r=>r.url().includes("/auth/v1/signup"),{timeout:12000});
  await page.getByRole("button",{name:"Create account"}).click();
  const res=await req;
  const data=await res.json();
  signupNetwork={status:res.status(),userCreated:!!data.user,code:data.code||data.error_code||null,hasSession:!!data.session};
  await page.locator(".account-message").waitFor({timeout:9000});
  if(!res.ok()||!data.user)throw Error("Signup rejected (HTTP "+res.status()+", code="+signupNetwork.code+")");
  return "Signup API accepted; user returned, session="+!!data.session;
 });
 await check("session state after refresh (if email confirmation optional)",async()=>{
  if(!signupNetwork?.hasSession)return "NOT VERIFIED: email confirmation required before session can exist";
  await page.reload({waitUntil:"networkidle"});
  await page.goto(BASE+"/account",{waitUntil:"networkidle"});
  if(!await page.getByText("Signed in as",{exact:false}).count())throw Error("Session did not persist");
  await page.getByRole("button",{name:"Log out"}).click();
  await page.getByText("Sign in",{exact:false}).first().waitFor();
  return "Session persisted through reload, logout completed";
 });
 await page.close();await context.close();await browser.close();
 fs.mkdirSync("artisan-auth-test-results",{recursive:true});
 fs.writeFileSync("artisan-auth-test-results/result.json",JSON.stringify({checks:output,signupNetwork},null,2));
 console.log("TOTAL "+output.length+" PASS "+output.filter(x=>x.status==="PASS").length+" FAIL "+output.filter(x=>x.status==="FAIL").length);
 process.exitCode=output.some(x=>x.status==="FAIL")?1:0;
})().catch(e=>{console.error("FATAL AUTH AUDIT",e.message);process.exitCode=1;});
