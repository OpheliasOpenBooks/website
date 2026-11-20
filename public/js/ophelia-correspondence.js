/* Ophelia's correspondence: source-safe public letters and private editor reports.
 * No dummy responses, localStorage submissions, or unsafe HTML rendering.
 */
(function(){
 'use strict';
 const $=id=>document.getElementById(id);
 const cfg=window.OpheliaCorrespondenceConfig||{};
 const base=(cfg.apiBase||'').replace(/\/+$/,'');
 const key=cfg.turnstileSiteKey||'';
 const ready=base.startsWith('https://')&&key.length>=6;
 const mode=document.body.dataset.correspondence;
 let widget=null,replyTo=null,adminKey='',letterFilter='all';
 function status(message,error=false,target='form-status'){
  const el=$(target);if(!el)return;el.textContent=message;el.classList.toggle('error',error);
 }
 function el(tag,cls,text){
  const node=document.createElement(tag);if(cls)node.className=cls;if(text!==undefined)node.textContent=text;return node;
 }
 function configureNotice(){
  const note=$('setup-notice');
  if(note){note.hidden=ready; if(!ready)note.textContent='The correspondence desk is being prepared. Letters cannot be delivered until the secure message service is connected. Please return soon.';}
  if(!ready){document.querySelectorAll('[data-send]').forEach(b=>b.disabled=true);}
 }
 async function req(path,options={}){
  const response=await fetch(base+path,{...options,headers:{'Content-Type':'application/json',...(options.headers||{})}});
  let data;try{data=await response.json()}catch{data={error:'The correspondence service could not be reached.'}}
  if(!response.ok)throw new Error(data.error||'The correspondence service returned an error.');
  return data;
 }
 function loadTurnstile(){
  return new Promise((resolve,reject)=>{
   if(window.turnstile)return resolve();
   const s=document.createElement('script');s.src='https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
   s.async=true;s.onload=()=>resolve();s.onerror=()=>reject(new Error('Spam protection did not load.'));document.head.appendChild(s);
  });
 }
 async function addChallenge(){
  if(!ready)return;
  try{
   await loadTurnstile();
   const parent=$('challenge');
   if(parent)widget=window.turnstile.render(parent,{sitekey:key,theme:'light'});
  }catch(e){status(e.message,true);document.querySelectorAll('[data-send]').forEach(b=>b.disabled=true)}
 }
 function token(){return widget===null?'':window.turnstile.getResponse(widget)}
 function resetChallenge(){if(widget!==null&&window.turnstile)window.turnstile.reset(widget)}
 function issueTime(value){
  if(!value)return '';
  const d=new Date(value);return Number.isNaN(d.getTime())?'':d.toLocaleDateString(undefined,{year:'numeric',month:'long',day:'numeric'});
 }
 function renderReply(letter){
  const article=el('article','entry');
  const header=el('header');header.append(el('strong','',letter.name||'A Reader'));
  const t=el('time','',issueTime(letter.created_at));header.append(t);article.append(header);
  if(letter.letter_type==='quotation'&&letter.quote_text){
   article.classList.add('quotation');
   article.append(el('div','quote-heading','From the commonplace book'));
   article.append(el('blockquote','quote-card',letter.quote_text));
   article.append(el('div','quote-citation','— '+(letter.quote_book||'Unknown book')+(letter.quote_author?' · '+letter.quote_author:'')));
   if(letter.source){
    try{const link=new URL(letter.source);
     if(link.origin===window.location.origin&&link.pathname.startsWith('/website/')){
      const a=el('a','from-book','Open this book in the library');a.href=link.href;article.append(a);
     }
    }catch{}
   }
  }
  if(letter.topic)article.append(el('div','topic',letter.topic));
  if(letter.body)article.append(el('p','',letter.body));
  return article;
 }
 function renderPublic(letters){
  const target=$('letters');if(!target)return;target.replaceChildren();
  const top=letters.filter(x=>!x.parent_id&&(letterFilter==='all'||(x.letter_type||'discussion')===letterFilter));
  if(!top.length){target.append(el('p','empty',letterFilter==='all'?'No letters are on the board yet. The first correspondence will appear here after publication.':'No letters of this kind have been published yet.'));return}
  for(const item of top){
   const article=renderReply(item),actions=el('div');
   const reply=el('button','','Reply to this letter');reply.type='button';
   reply.addEventListener('click',()=>{
    replyTo=item.id;$('reply-to').value=item.id;
    $('reply-indicator').hidden=false;$('reply-indicator').textContent='Replying to '+(item.name||'A Reader')+' · ';
    const cancel=el('button','','Cancel reply');cancel.type='button';
    cancel.addEventListener('click',()=>{replyTo=null;$('reply-to').value='';$('reply-indicator').hidden=true});
    $('reply-indicator').append(cancel);$('letter-message').focus();
    document.getElementById('new-letter').scrollIntoView({behavior:'smooth'});
   });
   actions.append(reply);
   const flag=el('button','','Report comment');flag.type='button';
   flag.addEventListener('click',()=>report(item.id));
   actions.append(flag);article.append(actions);
   const children=letters.filter(x=>x.parent_id===item.id);
   if(children.length){const container=el('div','replies');for(const child of children)container.append(renderReply(child));article.append(container);}
   target.append(article);
  }
 }
 async function loadLetters(){
  if(!ready)return;
  try{const data=await req('/api/letters');renderPublic(data.letters||[])}
  catch(e){status('The letter board is temporarily unavailable: '+e.message,true,'public-status');}
 }
 async function report(id){
  if(!ready)return;
  const proof=token();
  if(!proof){status('Complete the spam check below before reporting a letter.',true);$('new-letter').scrollIntoView({behavior:'smooth'});return}
  if(!window.confirm('Flag this letter for the editor to review?'))return;
  try{await req('/api/flag',{method:'POST',body:JSON.stringify({id,token:proof})});status('Your concern has been sent for review. Thank you.');resetChallenge();await loadLetters();}
  catch(e){status(e.message,true);resetChallenge()}
 }
 function quoteMode(kind){
  const quote=kind==='quotation',region=$('quotation-fields'),body=$('letter-message');
  if(!region||!body)return;
  region.hidden=!quote;$('quote-book').required=quote;$('quote-text').required=quote;
  body.required=!quote;
  $('letter-message-label').textContent=quote?'Your reflection on the passage (optional)':'Your letter';
  body.placeholder=quote?'What makes this passage memorable to you?':'Dear fellow readers, ...';
 }
 function prefillQuote(){
  if(mode!=='public')return;
  const query=new URLSearchParams(window.location.search);
  const passage=query.get('quote')||'',book=query.get('book')||'',author=query.get('author')||'';
  if(passage||query.get('kind')==='quotation'){
   $('letter-type').value='quotation';quoteMode('quotation');
   $('quote-text').value=passage.slice(0,480);
   $('quote-book').value=book.slice(0,120);$('quote-author').value=author.slice(0,90);
   try{const link=new URL(query.get('source')||'');
    if(link.origin===window.location.origin&&link.pathname.startsWith('/website/'))$('quote-source').value=link.href.slice(0,350);
   }catch{}
  }
 }
 function setupQuotationControls(){
  if(mode!=='public')return;
  quoteMode($('letter-type').value);prefillQuote();
  $('letter-type').addEventListener('change',()=>quoteMode($('letter-type').value));
  document.querySelectorAll('[data-share-quote]').forEach(a=>a.addEventListener('click',()=>{
   $('letter-type').value='quotation';quoteMode('quotation');$('quote-book').focus();
  }));
  document.querySelectorAll('[data-letter-filter]').forEach(button=>button.addEventListener('click',()=>{
   letterFilter=button.dataset.letterFilter;
   document.querySelectorAll('[data-letter-filter]').forEach(b=>{
    const active=b===button;b.setAttribute('aria-pressed',String(active));b.classList.toggle('active',active);
   });
   loadLetters();
  }));
 }
 function collect(){
  const form=$('letter-form');
  const body=Object.fromEntries(new FormData(form).entries());
  body.kind=mode==='editor'?'editor':'public';
  body.token=token();
  return body;
 }
 function setBookContext(){
  if(mode!=='editor')return;
  const query=new URLSearchParams(window.location.search);
  for(const [field,param] of [['book','book'],['page','page'],['source','source']]){
   const value=query.get(param);if(value&&$(field))$(field).value=value.slice(0,300);
  }
 }
 async function setupForm(){
  const form=$('letter-form');if(!form)return;
  configureNotice();setBookContext();setupQuotationControls();
  if(mode==='public')await loadLetters();
  if(!ready)return;
  try{await req('/api/health')}catch(e){status('The correspondence service is not ready: '+e.message,true);document.querySelectorAll('[data-send]').forEach(b=>b.disabled=true);return}
  await addChallenge();
  if(widget!==null)form.querySelector('[data-send]').disabled=false;
  form.addEventListener('submit',async event=>{
   event.preventDefault();const send=form.querySelector('[data-send]');if(!send||send.disabled)return;
   const details=collect();if(!details.token){status('Please complete the spam check to send your letter.',true);return}
   send.disabled=true;status('Sealing your letter…');
   try{
    const result=await req('/api/letters',{method:'POST',body:JSON.stringify(details)});
    status(mode==='editor'?'Your private letter has reached the editor’s inbox. Thank you.':
      result.status==='approved'?'Your letter is published! Other readers can see it now.':'Your letter was held for a safety review.');
    form.reset();replyTo=null;if($('reply-indicator'))$('reply-indicator').hidden=true;setBookContext();
    if(mode==='public'){quoteMode('discussion');if($('quote-source'))$('quote-source').value='';}
    if(mode==='public')await loadLetters();
   }catch(e){status(e.message,true)}
   finally{resetChallenge();send.disabled=false}
  });
 }
 function authHeaders(){return {'Authorization':'Bearer '+adminKey}}
 let adminView='inbox';
 async function loadInbox(){
  const data=await req('/api/admin/letters?view='+adminView,{headers:authHeaders()});
  $('moderation').hidden=false;
  const target=$('moderator-list');target.replaceChildren();
  if(!data.letters?.length){target.append(el('p','empty',adminView==='recent'?'There are no published public letters to review.':'There are no private editor reports or reported posts awaiting attention.'));return}
  for(const letter of data.letters){
   const article=renderReply(letter);
   article.prepend(el('p','small','Kind: '+letter.kind+' · Status: '+letter.status+' · Book: '+(letter.book||'—')+' · Page: '+(letter.page||'—')));
   if(letter.source){const a=el('a','small','Original reading page');a.href=letter.source;a.target='_blank';a.rel='noopener noreferrer';article.append(a);}
   const bar=el('div','moderator-actions');
   const actions=letter.kind==='editor'?['close','delete']:(letter.status==='approved'?['hide','delete']:['approve','reject','delete']);
   for(const action of actions){
    const b=el('button','button secondary',action==='approve'?'Restore to board':action==='hide'?'Hide for review':action[0].toUpperCase()+action.slice(1));b.type='button';
    b.addEventListener('click',async()=>{
     if(action==='delete'&&!confirm('Permanently delete this letter?'))return;
     try{await req('/api/admin/letters/'+encodeURIComponent(letter.id),{method:'POST',headers:authHeaders(),body:JSON.stringify({action})});status(action==='approve'?'Letter restored to the public board.':action==='hide'?'Letter hidden for review.':action==='delete'?'Letter deleted.':action==='close'?'Report closed.':'Letter rejected.');await loadInbox();}
     catch(e){status(e.message,true,'admin-status')}
    });bar.append(b);
   }
   article.append(bar);target.append(article);
  }
 }
 function setupAdmin(){
  document.querySelectorAll('[data-admin-view]').forEach(button=>{
   button.addEventListener('click',async()=>{
    if(!adminKey)return;
    adminView=button.dataset.adminView;
    document.querySelectorAll('[data-admin-view]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
    try{await loadInbox()}catch(e){status('Could not load correspondence: '+e.message,true,'admin-status')}
   });
  });
  $('admin-form')?.addEventListener('submit',async event=>{
   event.preventDefault();adminKey=$('admin-key').value.trim();if(!ready){status('Connect the message service before opening the private inbox.',true,'admin-status');return}
   try{await loadInbox();status('Editor’s inbox unlocked.',false,'admin-status');$('admin-key').value='';}
   catch(e){adminKey='';status('Could not open the inbox: '+e.message,true,'admin-status')}
  });
 }
 if(mode==='inbox')setupAdmin();else setupForm();
})();
