/* Ophelia's Open Book — small, privacy-conscious Cloudflare Worker.
 * Public discussions and private editor reports are distinct at the DB layer.
 * Setup: see CORRESPONDENCE_SETUP.md. No secrets belong in the repo.
 */
const SITE_DEFAULT='https://opheliasopenbooks.github.io';
const encoder=new TextEncoder();
const blockedWords=[
 'fuck','fucking','fucker','motherfucker','shit','shitty','bullshit','cunt',
 'bitch','bastard','asshole','dickhead','pussy','cock','whore',
 'slut','twat','wanker','porn','pornographic','nigger','faggot'
];
const normalize=value=>String(value||'').normalize('NFKC').toLowerCase()
 .replace(/[\u200b-\u200f\u2060\uFEFF]/g,'')
 .replace(/[013457@\$!]/g,ch=>({'0':'o','1':'i','3':'e','4':'a','5':'s','7':'t','@':'a','$':'s','!':'i'}[ch]||ch));
export function screenedText(value){
 const raw=normalize(value);
 const letters=raw.replace(/[^a-z\s]/g,' ').replace(/\s+/g,' ');
 const boundary='(?:^|[^a-z])(?:'+blockedWords.join('|')+')(?:$|[^a-z])';
 const expression=new RegExp(boundary,'i');
 const disguised=raw.replace(/\b(?:[a-z][.\s*_~-]+){2,}[a-z]\b/g,group=>group.replace(/[^a-z]/g,''));
 const offensive=expression.test(letters)||expression.test(disguised);
 const links=/https?:\/\/|www\.|\b\S+@\S+\.[a-z]{2,}\b/i.test(String(value||''));
 const markup=/<\/?\s*(?:script|iframe|img|a|style|svg)\b/i.test(String(value||''));
  return {offensive,links,markup};
}
export function allowedOrigin(origin,siteOrigin=SITE_DEFAULT){
 try{return new URL(origin).origin===new URL(siteOrigin).origin}catch{return false}
}
const response=(obj,status=200,headers={})=>new Response(JSON.stringify(obj),{
 status,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store',...headers}
});
function cors(request,env){
 const origin=request.headers.get('Origin');
 const permitted=origin&&allowedOrigin(origin,env.SITE_ORIGIN||SITE_DEFAULT);
 const headers={'Vary':'Origin','Access-Control-Allow-Methods':'GET,POST,OPTIONS',
  'Access-Control-Allow-Headers':'Content-Type, Authorization',
  'Access-Control-Max-Age':'600'};
 if(permitted)headers['Access-Control-Allow-Origin']=origin;
 return headers;
}
function secretMatches(received,expected){
 if(typeof expected!=='string'||expected.length<24||typeof received!=='string')return false;
 const a=encoder.encode(received),b=encoder.encode(expected);
 let mismatch=a.length^b.length;
 for(let i=0;i<Math.max(a.length,b.length);i++)mismatch|=(a[i]||0)^(b[i]||0);
 return mismatch===0;
}
function authorize(request,env){
 const h=request.headers.get('Authorization')||'';
 return h.startsWith('Bearer ')&&secretMatches(h.slice(7),env.ADMIN_KEY);
}
function clean(value,length){return String(value||'').replace(/[\u0000-\u0008\u000b-\u001f\u007f]/g,'').trim().slice(0,length)}
async function readPayload(request){
 const raw=await request.text();if(raw.length>16000)throw new Error('The letter is too long.');
 try{return JSON.parse(raw)}catch{throw new Error('The letter could not be understood.')}
}
async function turnstileValid(token,request,env){
 if(!env.TURNSTILE_SECRET||!token||typeof token!=='string'||token.length>3000)return false;
 const form=new FormData();form.set('secret',env.TURNSTILE_SECRET);form.set('response',token);
 const ip=request.headers.get('CF-Connecting-IP');if(ip)form.set('remoteip',ip);
 try{
  const res=await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify',{method:'POST',body:form});
  const data=await res.json();
  return data.success===true&&data.hostname===new URL(env.SITE_ORIGIN||SITE_DEFAULT).hostname;
 }catch{return false}
}
async function ipKey(request,env){
 const ip=request.headers.get('CF-Connecting-IP')||'unknown';
 const key=await crypto.subtle.importKey('raw',encoder.encode(env.RATE_SALT),{name:'HMAC',hash:'SHA-256'},false,['sign']);
 const date=new Date().toISOString().slice(0,10);
 const bytes=await crypto.subtle.sign('HMAC',key,encoder.encode(date+'|'+ip));
 return {day:date,key:Array.from(new Uint8Array(bytes)).map(x=>x.toString(16).padStart(2,'0')).join('')};
}
async function withinLimit(request,env,limit){
 const {day,key}=await ipKey(request,env);
 await env.DB.prepare('INSERT INTO daily_limits (day,ip_hash,total) VALUES (?,?,1) ON CONFLICT(day,ip_hash) DO UPDATE SET total=total+1').bind(day,key).run();
 const row=await env.DB.prepare('SELECT total FROM daily_limits WHERE day=? AND ip_hash=?').bind(day,key).first();
 return row&&row.total<=limit;
}
// Public correspondence is immediately visible after automated screening.
// Private messages to the editor are never published and wait in the inbox.
export function publicationStatus(kind){return kind==='public'?'approved':'pending'}
const publicFields='id,name,topic,body,parent_id,created_at,letter_type,quote_text,quote_book,quote_author,source';
async function publicLetters(env){
 const rows=await env.DB.prepare("SELECT "+publicFields+" FROM letters WHERE kind='public' AND status='approved' ORDER BY created_at DESC LIMIT 120").all();
 return response({letters:rows.results||[]},200,{'Cache-Control':'public, max-age=20'});
}
async function submitLetter(request,env){
 const input=await readPayload(request);
 if(typeof input!=='object'||!input||Array.isArray(input))return response({error:'Invalid letter.'},400);
 if(input.website)return response({error:'Your letter could not be accepted.'},400);
 const kind=input.kind==='editor'?'editor':input.kind==='public'?'public':null;
 if(!kind)return response({error:'Choose public correspondence or private editor correspondence.'},400);
 const body=clean(input.body,kind==='editor'?3001:2401);
 const letterType=kind==='public'&&input.letter_type==='quotation'?'quotation':'discussion';
 const quoteText=letterType==='quotation'?clean(input.quote_text,481):'';
 const quoteBook=letterType==='quotation'?clean(input.quote_book,121):'';
 const quoteAuthor=letterType==='quotation'?clean(input.quote_author,91):'';
 if(body.length>(kind==='editor'?3000:2400)||(!body&&letterType!=='quotation')||(body.length>0&&body.length<4))
  return response({error:'Please write a complete letter, up to 2400 characters.'},400);
 if(letterType==='quotation'&&(quoteText.length<8||quoteText.length>480||quoteBook.length<2||quoteBook.length>120||quoteAuthor.length>90))
  return response({error:'Please provide a quotation and book title (maximum 480 characters).'},400);
 const name=clean(input.name||'Anonymous',60),topic=clean(input.topic,90)||(letterType==='quotation'?'A favorite quotation':'');
  const book=kind==='editor'?clean(input.book,120):'';
 const page=kind==='editor'?clean(input.page,70):'';
 let source='';
 if(input.source){
  try{const url=new URL(String(input.source));if(url.origin===SITE_DEFAULT&&url.pathname.startsWith('/website/'))source=url.href.slice(0,350);}
  catch{}
 }
 const parent=kind==='public'?clean(input.parent_id,36):'';
 if(kind==='public'){
  const moderation=screenedText([name,topic,body,quoteText,quoteBook,quoteAuthor].join(' '));
  if(moderation.offensive)return response({error:'Please revise your letter to remove vulgar or offensive language.'},422);
  if(moderation.links||moderation.markup)return response({error:'Please leave web links, contact details, and HTML out of public letters.'},422);
  if(parent){
   const record=await env.DB.prepare("SELECT id,parent_id FROM letters WHERE id=? AND kind='public' AND status='approved'").bind(parent).first();
   if(!record||record.parent_id)return response({error:'Replies must be addressed to a published original letter.'},400);
  }
 }
 if(!await turnstileValid(input.token,request,env))return response({error:'The spam check has expired. Please try again.'},403);
 if(!await withinLimit(request,env,kind==='editor'?5:10))return response({error:'Too many letters today. Please return tomorrow.'},429);
 const id=crypto.randomUUID();
 // Public messages publish automatically after profanity, link, Turnstile and
 // rate-limit checks; editor reports always remain private and pending.
 const newStatus=publicationStatus(kind);
 await env.DB.prepare('INSERT INTO letters (id,kind,status,name,topic,book,page,source,body,parent_id,letter_type,quote_text,quote_book,quote_author) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)')
  .bind(id,kind,newStatus,name||'Anonymous',topic,book,page,source,body,parent||null,letterType,quoteText,quoteBook,quoteAuthor).run();
 return response({accepted:true,status:newStatus},201);
}
async function flagLetter(request,env){
 const input=await readPayload(request);const id=clean(input.id,36);
 if(!/^[a-f0-9-]{36}$/i.test(id))return response({error:'Unknown letter.'},400);
 if(!await turnstileValid(input.token,request,env))return response({error:'Complete the spam check first.'},403);
 if(!await withinLimit(request,env,15))return response({error:'Too many requests today.'},429);
 const record=await env.DB.prepare("SELECT id FROM letters WHERE id=? AND kind='public' AND status='approved'").bind(id).first();
 if(!record)return response({error:'This letter is no longer published.'},404);
 await env.DB.prepare("UPDATE letters SET flags=flags+1,status=CASE WHEN flags+1>=2 THEN 'pending' ELSE status END WHERE id=? AND kind='public'").bind(id).run();
 return response({accepted:true},200);
}
async function adminList(env,view='inbox'){
 // Keep the editor's daily inbox focused on private reports and flagged
 // public notes; ordinary published discussion needs no approval.
 const query=view==='recent'
  ?"SELECT * FROM letters WHERE kind='public' AND status='approved' ORDER BY created_at DESC LIMIT 150"
  :"SELECT * FROM letters WHERE status='pending' ORDER BY CASE WHEN kind='editor' THEN 0 ELSE 1 END, flags DESC, created_at DESC LIMIT 150";
 const rows=await env.DB.prepare(query).all();
 return response({letters:rows.results||[]});
}
async function adminEdit(id,request,env){
 if(!/^[a-f0-9-]{36}$/i.test(id))return response({error:'Unknown letter.'},400);
 const data=await readPayload(request),action=clean(data?.action,20);
 const record=await env.DB.prepare('SELECT kind,status,parent_id FROM letters WHERE id=?').bind(id).first();
 if(!record)return response({error:'This letter was not found.'},404);
 if(action==='delete'){
  // Remove replies to avoid dangling public conversations.
  await env.DB.prepare('DELETE FROM letters WHERE id=? OR parent_id=?').bind(id,id).run();
  return response({success:true});
 }
 const permitted=record.kind==='editor'?['close']:['approve','reject','hide'];
 if(!permitted.includes(action))return response({error:'That action is not permitted for this kind of letter.'},400);
 const next=action==='approve'?'approved':action==='reject'?'rejected':action==='hide'?'pending':'closed';
 if(next==='approved'&&record.parent_id){
  const parent=await env.DB.prepare("SELECT status FROM letters WHERE id=? AND kind='public'").bind(record.parent_id).first();
  if(parent?.status!=='approved')return response({error:'The parent letter must be approved first.'},400);
 }
 await env.DB.prepare('UPDATE letters SET status=?,reviewed_at=CURRENT_TIMESTAMP WHERE id=?').bind(next,id).run();
 if(next!=='approved'&&record.kind==='public'){
  await env.DB.prepare("UPDATE letters SET status='pending' WHERE parent_id=? AND status='approved'").bind(id).run();
 }
 return response({success:true,status:next});
}
export default {
 async fetch(request,env){
  const headers=cors(request,env),url=new URL(request.url);
  const done=(res)=>{
   const h=new Headers(res.headers);for(const [k,v] of Object.entries(headers))h.set(k,v);
   return new Response(res.body,{status:res.status,headers:h});
  };
  try{
   if(request.method==='OPTIONS')return new Response(null,{status:204,headers});
   if(!url.pathname.startsWith('/api/'))return done(response({error:'Not found.'},404));
   if(request.method==='POST'&&!allowedOrigin(request.headers.get('Origin'),env.SITE_ORIGIN||SITE_DEFAULT))
    return done(response({error:'This page may not submit correspondence.'},403));
   if(url.pathname==='/api/health'&&request.method==='GET'){
    if(!env.DB||!env.TURNSTILE_SECRET||!env.ADMIN_KEY||!env.RATE_SALT)
     return done(response({error:'Correspondence service setup is incomplete.'},503));
    await env.DB.prepare('SELECT id FROM letters LIMIT 1').all();
    return done(response({ready:true}));
   }
   if(!env.DB)return done(response({error:'The correspondence desk is not ready.'},503));
   if(url.pathname==='/api/letters'){
    if(request.method==='GET')return done(await publicLetters(env));
    if(request.method==='POST')return done(await submitLetter(request,env));
   }
   if(url.pathname==='/api/flag'&&request.method==='POST')return done(await flagLetter(request,env));
   if(url.pathname.startsWith('/api/admin/')){
    if(!authorize(request,env))return done(response({error:'The editor’s key was not accepted.'},401));
    if(url.pathname==='/api/admin/letters'&&request.method==='GET')return done(await adminList(env,url.searchParams.get('view')||'inbox'));
    const match=url.pathname.match(/^\/api\/admin\/letters\/([a-f0-9-]{36})$/i);
    if(match&&request.method==='POST')return done(await adminEdit(match[1],request,env));
   }
   return done(response({error:'Not found.'},404));
  }catch(error){
   // The client never receives SQL statements, admin keys, or stack traces.
   console.error('Correspondence service error',error?.message||error);
   return done(response({error:'The correspondence service encountered a problem. Please try again later.'},500));
  }
 }
};
