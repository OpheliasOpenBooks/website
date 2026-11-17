/* Ophelia's Open Book — private reading ribbons & dedicated personal bookshelf.
   Uses the existing finished-books key: it does not create a second catalog. */
(() => {
'use strict';
if (window.OpheliaReadingShelf) return;
const READING='ophelia-currently-reading-v1';
const FINISHED='ophelia-finished-books-v1';
const SORT='ophelia-bookshelf-sort-v1';
const MAX=300;
const current=location.pathname.split('/').pop()||'index.html';
const allowed=/^[a-z0-9-]+\.html$/;
const fallback='public/art/historical-cover-fallback.svg';
const $=id=>document.getElementById(id);
function items(key){
 try{
  const list=JSON.parse(localStorage.getItem(key)||'[]');
  return Array.isArray(list)?list.filter(x=>x&&allowed.test(x.path)).slice(0,MAX):[];
 }catch{return [];}
}
function save(key,list){
 try{
  localStorage.setItem(key,JSON.stringify(list.slice(0,MAX)));
  document.dispatchEvent(new Event('ophelia-shelf-changed'));
  return true;
 }catch{return false;}
}
const read=()=>items(READING),done=()=>items(FINISHED);
function identify(){
 const h=document.querySelector('.book-heading h1,main.book h1,.reader .intro h1');
 if(!h||!allowed.test(current))return null;
 const image=document.querySelector('.book #opening-art,.book-heading + figure img,.book figure img,.reader .intro img');
 let cover=fallback;
 try{
  const raw=image?.getAttribute('src')||document.querySelector('meta[property="og:image"]')?.content||'';
  const url=new URL(raw,location.href);
  if(url.origin===location.origin&&url.pathname.includes('/public/art/'))
   cover='public/art/'+url.pathname.split('/public/art/')[1];
 }catch{}
 return {path:current,title:h.textContent.trim().slice(0,200),
   byline:(document.querySelector('.book-heading .byline,.reader .intro strong')?.textContent||'').trim().slice(0,220),cover};
}
function pagePosition(){
 const picker=$('page');
 if(picker&&picker.options.length>1&&!picker.disabled)
  return {page:Math.max(1,picker.selectedIndex+1),total:picker.options.length};
 const text=$('pagecount')?.textContent||'';
 const match=text.match(/(?:Page\s*)?(\d+)\s*(?:of|\/)\s*(\d+)/i);
 return match?{page:+match[1],total:+match[2]}:{page:0,total:0};
}
function markReading(book){
 if(!book||!allowed.test(book.path))return false;
 const list=read(),previous=list.find(x=>x.path===book.path),now=new Date().toISOString();
 const p=book.path===current?pagePosition():{page:book.page||0,total:book.total||0};
 const next={...previous,...book,startedAt:previous?.startedAt||now,lastAt:now,
   page:p.page||previous?.page||0,total:p.total||previous?.total||0};
 if(!save(READING,[next,...list.filter(x=>x.path!==book.path)]))return false;
 const completed=done();
 if(completed.some(x=>x.path===book.path))save(FINISHED,completed.filter(x=>x.path!==book.path));
 return true;
}
function markFinished(book){
 if(!book||!allowed.test(book.path))return false;
 const existing=done(),old=existing.find(x=>x.path===book.path);
 const entry={...old,...book,finishedAt:old?.finishedAt||new Date().toISOString()};
 const ok=save(FINISHED,[entry,...existing.filter(x=>x.path!==book.path)]);
 if(ok){const inProgress=read();if(inProgress.some(x=>x.path===book.path))
  save(READING,inProgress.filter(x=>x.path!==book.path));}
 return ok;
}
function remove(key,path){const list=items(key);save(key,list.filter(x=>x.path!==path));}
function customMove(key,path,offset){
 const list=items(key),i=list.findIndex(x=>x.path===path),j=i+offset;
 if(i<0||j<0||j>=list.length)return;
 const [item]=list.splice(i,1);list.splice(j,0,item);save(key,list);
}
function order(){
 try{const v=localStorage.getItem(SORT);return ['recent','oldest','title','custom'].includes(v)?v:'recent'}
 catch{return 'recent'}
}
function sorted(list,mode,type){
 if(mode==='custom')return [...list];
 if(mode==='title')return [...list].sort((a,b)=>String(a.title||'').replace(/^(a|an|the)\s+/i,'').localeCompare(String(b.title||'').replace(/^(a|an|the)\s+/i,''),'en',{sensitivity:'base'}));
 const key=type==='reading'?'startedAt':'finishedAt';
 const stamp=x=>new Date(x[key]||x.lastAt||0).getTime()||0;
 return [...list].sort((a,b)=>mode==='oldest'?stamp(a)-stamp(b):stamp(b)-stamp(a));
}
function addButton(group,label,description,action){
 const b=document.createElement('button');b.type='button';b.textContent=label;
 b.setAttribute('aria-label',description);b.title=description;b.addEventListener('click',action);group.append(b);return b;
}
function volume(book,type,index,list,mode){
 const holder=document.createElement('div');holder.className='shelf-entry';
 const ribbon=document.createElement('span');ribbon.className='ribbon'+(type==='finished'?' is-finished':'');
 ribbon.textContent=type==='reading'?'READING':'FINISHED';
 const anchor=document.createElement('a');anchor.href=book.path;anchor.className='volume';anchor.title='Continue '+book.title;
 const img=document.createElement('img');img.src=book.cover||fallback;img.alt='';img.loading='lazy';
 img.onerror=()=>{img.onerror=null;img.src=fallback;};
 const title=document.createElement('span');title.className='name';title.textContent=book.title||'Untitled';
 anchor.append(img,title);holder.append(ribbon,anchor);
 const progress=document.createElement('span');progress.className='page-mark';
 if(type==='reading'){
  const page=Number(book.page)||0,total=Number(book.total)||0;
  progress.textContent=page>0?'Page '+page+(total>=page?' of '+total:''):'A story in progress';
 }else{
  const dt=book.finishedAt?new Date(book.finishedAt):null;
  progress.textContent=dt&&!Number.isNaN(dt.getTime())?'Finished '+dt.toLocaleDateString(undefined,{month:'short',year:'numeric'}):'Finished with love';
 }
 holder.append(progress);
 const actions=document.createElement('div');actions.className='entry-buttons';
 if(type==='reading'){
  addButton(actions,'✓ Finished','Move '+book.title+' to Finished Books',()=>markFinished(book));
 }else{
  addButton(actions,'↺ Reread','Move '+book.title+' to Currently Reading',()=>markReading(book));
 }
 if(mode==='custom'){
  const key=type==='reading'?READING:FINISHED;
  const left=addButton(actions,'←','Move '+book.title+' left',()=>customMove(key,book.path,-1));
  const right=addButton(actions,'→','Move '+book.title+' right',()=>customMove(key,book.path,1));
  left.disabled=index===0;right.disabled=index===list.length-1;
 }
 addButton(actions,'Remove','Remove '+book.title+' from '+(type==='reading'?'Currently Reading':'Finished Books'),()=>remove(type==='reading'?READING:FINISHED,book.path));
 holder.append(actions);return holder;
}
function renderBookshelf(){
 const sort=$('shelf-sort');if(!sort)return;
 const mode=order();sort.value=mode;
 const hint=$('sort-help');
 if(hint)hint.textContent=mode==='custom'?'Use the small arrows to arrange each shelf your way.':
  mode==='title'?'Your books are now in alphabetical order.':'Change the arrangement whenever you like.';
 for(const [type,records] of [['reading',read()],['finished',done()]]){
  const list=sorted(records,mode,type),parent=$(type+'-books'),empty=$(type+'-empty'),count=$(type+'-count');
  if(!parent)continue;
  count.textContent=records.length+(type==='reading'?(records.length===1?' book in progress':' books in progress'):(records.length===1?' finished book':' finished books'));
  empty.hidden=records.length!==0;
  parent.replaceChildren(...list.map((book,i)=>volume(book,type,i,list,mode)));
 }
}
function initShelfPage(){
 if(current!=='my-bookshelf.html'||!$('shelf-sort'))return;
 $('shelf-sort').value=order();
 $('shelf-sort').addEventListener('change',()=>{
  try{localStorage.setItem(SORT,$('shelf-sort').value)}catch{}
  renderBookshelf();
 });
 document.addEventListener('ophelia-shelf-changed',renderBookshelf);
 window.addEventListener('storage',event=>{if([READING,FINISHED,SORT].includes(event.key))renderBookshelf()});
 renderBookshelf();
}
function initReader(){
 const book=identify();
 if(!book||!$('prose'))return;
 const parent=document.querySelector('.reader-controls,aside.controls,aside.panel');
 if(!parent||parent.querySelector('.ob-reading-ribbon-control'))return;
 const style=document.createElement('style');
 style.textContent='.ob-reading-ribbon-control{margin:15px 0;padding:13px 0;border-top:1px solid #d8d8c7;display:flex;flex-direction:column;gap:8px;text-align:center}.ob-reading-ribbon-control button{background:#f8f1df;color:#2a4538;border:1px solid #bba67e;border-radius:24px;min-height:40px;padding:8px 12px;font:13px Georgia,serif;cursor:pointer}.ob-reading-ribbon-control a{font:13px Georgia,serif;text-decoration:underline;text-underline-offset:3px}.ob-reading-ribbon-control small{font:12px/1.5 Georgia,serif;color:#697463}.night .ob-reading-ribbon-control button{background:#344b3b;color:#f8edcf}.night .ob-reading-ribbon-control small{color:#d2d9cc}';
 document.head.append(style);
 const div=document.createElement('div');div.className='ob-reading-ribbon-control';
 const btn=document.createElement('button');btn.type='button';
 const msg=document.createElement('small');msg.setAttribute('aria-live','polite');msg.textContent='Following several stories? Keep a ribbon for each.';
 const a=document.createElement('a');a.href='my-bookshelf.html';a.textContent='Visit My Bookshelf ❦';
 div.append(btn,msg,a);parent.append(div);
 function updateButton(){
  const isReading=read().some(x=>x.path===book.path);
  btn.textContent=isReading?'✓ On your reading shelf':'♧ Keep on My Bookshelf';
  btn.setAttribute('aria-pressed',String(isReading));
 }
 btn.addEventListener('click',()=>{
  if(read().some(x=>x.path===book.path)){msg.textContent='Already saved. Follow your little ribbon on My Bookshelf.';return}
  msg.textContent=markReading(identify())?'Saved! Look for its ribbon on My Bookshelf.':'This browser could not save the book.';
  updateButton();
 });
 let previousPage=0,previousTotal=0;
 const update=()=>{
  const p=pagePosition();
  if(p.page&&p.total&&(p.page!==previousPage||p.total!==previousTotal)){
    previousPage=p.page;previousTotal=p.total;
    const list=read(),index=list.findIndex(x=>x.path===book.path);
    if(index>=0&&(list[index].page!==p.page||list[index].total!==p.total)){
      list[index]={...list[index],page:p.page,total:p.total,lastAt:new Date().toISOString()};
      save(READING,list);
    }
  }
  updateButton();
 };
 const observer=new MutationObserver(update);
 for(const target of [$('pagecount'),$('progresslabel'),$('page')].filter(Boolean))
  observer.observe(target,{attributes:true,childList:true,characterData:true,subtree:true});
 $('page')?.addEventListener('change',update);
 document.addEventListener('ophelia-shelf-changed',updateButton);
 update();
}
window.OpheliaReadingShelf=Object.freeze({reading:read,finished:done,markReading,markFinished});
function boot(){initReader();initShelfPage()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();