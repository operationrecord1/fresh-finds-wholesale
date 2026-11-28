const inbox='artisanmartllc@gmail.com';
const origin='https://artisanmart.site';
const json=(body,status=200)=>new Response(JSON.stringify(body),{status,headers:{'Content-Type':'application/json','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
const hash=async s=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s)))).map(x=>x.toString(16).padStart(2,'0')).join('');
export async function newsletter(request,env){
 const url=new URL(request.url);
 if(!env.NEWSLETTER)return json({error:'Subscriptions are temporarily unavailable.'},503);
 if(url.pathname==='/api/newsletter/unsubscribe'){
  const token=url.searchParams.get('token')||'';
  if(!/^[a-f0-9]{64}$/.test(token))return json({error:'Invalid unsubscribe link.'},400);
  const recordKey=await env.NEWSLETTER.get('token:'+await hash(token));
  if(!recordKey)return json({error:'This unsubscribe link is unavailable.'},404);
  if(request.method==='GET')return new Response(`<!doctype html><html lang="en"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Unsubscribe | Artisan Mart</title><main style="max-width:440px;margin:60px auto;padding:20px;font:16px/1.5 Arial;color:#193441"><h1>Unsubscribe</h1><p>Stop receiving Artisan Mart newsletters?</p><form method="post"><button style="padding:12px 20px;background:#147fae;color:white;border:0;border-radius:5px">Unsubscribe</button></form></main></html>`,{headers:{'Content-Type':'text/html;charset=utf-8','Cache-Control':'no-store','Referrer-Policy':'no-referrer','Content-Security-Policy':"default-src 'none'; style-src 'unsafe-inline'; form-action 'self'; frame-ancestors 'none'"}});
  if(request.method!=='POST')return json({error:'Method not allowed'},405);
  const record=await env.NEWSLETTER.get(recordKey,'json');
  if(record)await env.NEWSLETTER.put(recordKey,JSON.stringify({...record,status:'unsubscribed',unsubscribedAt:new Date().toISOString()}));
  return new Response('You have been unsubscribed from Artisan Mart newsletters.',{headers:{'Content-Type':'text/plain;charset=utf-8','Cache-Control':'no-store'}});
 }
 if(request.method!=='POST')return json({error:'Method not allowed'},405);
 if(![origin,'https://www.artisanmart.site'].includes(request.headers.get('Origin')))return json({error:'Invalid origin'},403);
 if(!request.headers.get('Content-Type')?.startsWith('application/json'))return json({error:'JSON required'},415);
 const limit=await env.CONTACT_LIMIT.limit({key:'newsletter:'+(request.headers.get('CF-Connecting-IP')||'unknown')});
 if(!limit.success)return json({error:'Too many requests. Please try again later.'},429);
 try{
  const raw=await request.text();if(raw.length>1200)return json({error:'Request too large'},413);
  const body=JSON.parse(raw);if(body.website)return json({ok:true});
  const email=typeof body.email==='string'?body.email.trim().toLowerCase():'';
  if(email.length>254||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||body.consent!==true)return json({error:'Enter a valid email and agree to receive newsletters.'},400);
  const recordKey='subscriber:'+await hash(email),previous=await env.NEWSLETTER.get(recordKey,'json');
  if(previous?.status==='subscribed'&&previous.notified)return json({ok:true});
  const token=crypto.randomUUID().replaceAll('-','')+crypto.randomUUID().replaceAll('-','');
  const unsubscribeUrl=origin+'/api/newsletter/unsubscribe?token='+token;
  const record={email,status:'subscribed',consentedAt:new Date().toISOString(),source:'newsletter-page',unsubscribeUrl,notified:false};
  await env.NEWSLETTER.put(recordKey,JSON.stringify(record));await env.NEWSLETTER.put('token:'+await hash(token),recordKey);
  try{
   await env.EMAIL.send({to:inbox,from:'inquiries@artisanmart.site',replyTo:email,subject:'[offer@artisanmart.site] New newsletter subscriber',text:`A customer requested Artisan Mart offers and product updates.\nEmail: ${email}\nConsent recorded: ${record.consentedAt}\n\nSubscriber saved in the private newsletter audience. Respect unsubscribe status before sending any campaign.`});
   await env.NEWSLETTER.put(recordKey,JSON.stringify({...record,notified:true}));
  }catch{return json({error:'Your subscription was saved, but notification is pending. Please try again shortly.'},503)}
  return json({ok:true,unsubscribeUrl});
 }catch{return json({error:'Subscription could not be saved. Please try again.'},503)}
}
