/* Ophelia's Open Book — a private, device-local shelf for completed reading. */
(() => {
'use strict';
if(window.OpheliaFinishedShelf)return;
const KEY='ophelia-finished-books-v1', MAX=300;
const allowedPath=/^[a-z0-9-]+\.html$/;
const escapeHTML=s=>String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function readShelf(){
 try{const value=JSON.parse(localStorage.getItem(KEY)||'[]');
   return Array.isArray(value)?value.filter(x=>x&&typeof x.path==='string'&&allowedPath.test(x.path)).slice(0,MAX):[];
 }catch{return [];}
}
function saveShelf(items){try{localStorage.setItem(KEY,JSON.stringify(items.slice(0,MAX)));return true;}catch{return false;}}
const currentPath=location.pathname.split('/').pop()||'index.html';
const coverOf=()=>{
 const image=document.querySelector('.book #opening-art, .book-heading + figure img, .book figure img, .reader .intro img');
 const url=image?.getAttribute('src')||document.querySelector('meta[property="og:image"]')?.content||'';
 try{const u=new URL(url,location.href);
   if(u.origin===location.origin&&u.pathname.includes('/public/art/'))return u.pathname.split('/public/art/')[1]?'public/art/'+u.pathname.split('/public/art/')[1]:'';
 }catch{}
 return 'public/art/historical-cover-fallback.svg';
};
function identify(){
 const h=document.querySelector('.book-heading h1, main.book h1, .reader .intro h1');
 if(!h||!allowedPath.test(currentPath))return null;
 const title=h.textContent.trim();
 const by=document.querySelector('.book-heading .byline, .reader .intro strong')?.textContent.trim()||'';
 return {path:currentPath,title,byline:by,cover:coverOf(),finishedAt:new Date().toISOString()};
}
function record(book){
 if(!book||!allowedPath.test(book.path))return false;
 const existing=readShelf(),same=existing.find(x=>x.path===book.path);
 const result=[{...same,...book,finishedAt:same?.finishedAt||book.finishedAt},...existing.filter(x=>x.path!==book.path)];
 const ok=saveShelf(result);
 if(ok){document.dispatchEvent(new Event('ophelia-shelf-changed'));renderFinishedState();}
 return ok;
}
const isFinished=()=>readShelf().some(x=>x.path===currentPath);
let completionButton,completionNote;
function renderFinishedState(){
 if(!completionButton)return;
 const done=isFinished();
 completionButton.textContent=done?'✓ On your finished shelf':'✓ Mark this book as finished';
 completionButton.setAttribute('aria-pressed',String(done));
 if(completionNote)completionNote.textContent=done?'A lovely achievement! See your book on the Finished Books shelf.':'Finished reading? Save this book to your personal shelf.';
}
function readerControls(){
 const identity=identify();if(!identity||!document.getElementById('prose'))return;
 const parent=document.querySelector('.reader-controls, aside.controls, aside.panel');
 if(!parent)return;
 const holder=document.createElement('div');
 holder.className='ob-finish-control';
 holder.innerHTML='<button type="button" class="ob-finish-button" aria-pressed="false">✓ Mark this book as finished</button><p class="ob-finish-note" aria-live="polite"></p><a class="ob-finish-link" href="catalog.html#finished-books">View my finished shelf</a>';
 parent.appendChild(holder);
 completionButton=holder.querySelector('button');completionNote=holder.querySelector('p');
 completionButton.onclick=()=>{
  if(isFinished()){completionNote.textContent='Already on your shelf. Use the shelf to remove it if needed.';return;}
  if(record(identify()))completionNote.textContent='Added to your finished shelf. Congratulations!';
  else completionNote.textContent='Unable to save on this device. Please allow local site storage.';
 };
 const update=()=>{
  const pages=document.getElementById('page');
  const total=pages?.options?.length||0;
  const last=total>0&&pages.selectedIndex===total-1;
  const next=document.getElementById('next2')||document.getElementById('next');
  holder.hidden=!(last&&next?.disabled===true);
  if(!holder.hidden)renderFinishedState();
 };
 const observed=[document.getElementById('page'),document.getElementById('next2')||document.getElementById('next'),document.getElementById('pagecount'),document.getElementById('progresslabel')].filter(Boolean);
 const observer=new MutationObserver(update);
 observed.forEach(el=>observer.observe(el,{attributes:true,childList:true,characterData:true,subtree:true}));
 document.getElementById('page')?.addEventListener('change',update);
 document.getElementById('next')?.addEventListener('click',()=>requestAnimationFrame(update));
 document.getElementById('prev')?.addEventListener('click',()=>requestAnimationFrame(update));
 // The reader's "You have finished ..." message is only set when its
 // audio queue actually completes the final page, not when a page is opened.
 const msg=document.getElementById('message');
 if(msg)new MutationObserver(()=>{
  if(/you have finished\b/i.test(msg.textContent||'')&&
    document.getElementById('next2')?.disabled&&
    document.getElementById('page')?.selectedIndex===document.getElementById('page')?.options.length-1){
      if(!isFinished())record(identify());
  }
 }).observe(msg,{childList:true,characterData:true,subtree:true});
 update();
}
function renderShelf(root){
 const books=readShelf();
 const container=root.querySelector('.ob-shelf-books');
 const count=root.querySelector('.ob-shelf-count');
 const empty=root.querySelector('.ob-shelf-empty');
 if(count)count.textContent=books.length+' '+(books.length===1?'book':'books')+' finished';
 if(empty)empty.hidden=books.length!==0;
 if(!container)return;
 container.replaceChildren();
 for(const b of books){
  const a=document.createElement('a');
  a.href=b.path;a.className='ob-shelf-volume';a.title='Revisit '+b.title;
  const img=document.createElement('img');img.src=b.cover||'public/art/historical-cover-fallback.svg';img.alt='';
  img.loading='lazy';img.onerror=()=>{img.onerror=null;img.src='public/art/historical-cover-fallback.svg';};
  const label=document.createElement('span');label.textContent=b.title;
  a.append(img,label);
  const holder=document.createElement('div');holder.className='ob-shelf-entry';holder.appendChild(a);
  const remove=document.createElement('button');remove.type='button';remove.className='ob-shelf-remove';remove.textContent='Remove';
  remove.setAttribute('aria-label','Remove '+b.title+' from finished books');
  remove.onclick=()=>{if(saveShelf(readShelf().filter(x=>x.path!==b.path))){document.dispatchEvent(new Event('ophelia-shelf-changed'));renderFinishedState();}};
  holder.appendChild(remove);container.appendChild(holder);
 }
}
function shelfOnPage(){
 if(!['index.html','catalog.html'].includes(currentPath))return;
 const main=document.querySelector('main');if(!main)return;
 const root=document.createElement('section');
 root.id='finished-books';root.className='ob-finished-shelf';
 root.setAttribute('aria-labelledby','ob-shelf-title');
 root.innerHTML='<div class="ob-shelf-inner"><div class="ob-shelf-top"><div><div class="ob-shelf-eyebrow">A little shelf of your own</div><h2 id="ob-shelf-title">My Finished Books</h2><p class="ob-shelf-count">0 books finished</p></div><span class="ob-shelf-ornament" aria-hidden="true">❦</span></div><p class="ob-shelf-empty">Your shelf is waiting for its first finished story. When you finish a book, visit its final page and select “Mark this book as finished.”</p><div class="ob-shelf-books" aria-live="polite"></div><p class="ob-shelf-privacy">Private to this browser and device. Your reading history is not shared with other visitors.</p></div>';
 const hero=main.querySelector('.hero');
 if(hero)hero.insertAdjacentElement('afterend',root);else main.prepend(root);
 const refresh=()=>renderShelf(root);
 document.addEventListener('ophelia-shelf-changed',refresh);
 window.addEventListener('storage',event=>{if(event.key===KEY)refresh();});
 refresh();
}
function style(){
 const node=document.createElement('style');node.textContent=
 '.ob-finished-shelf{margin:20px auto 40px;padding:0 24px;max-width:1200px;scroll-margin-top:22px;color:#294638}.ob-shelf-inner{padding:22px 26px 18px;border:1px solid #c9c5ac;border-radius:10px;background:#f7f2e5;box-shadow:0 7px 22px #263e3510}.ob-shelf-top{display:flex;align-items:center;justify-content:space-between;gap:12px}.ob-shelf-eyebrow{font:700 10px Arial,sans-serif;letter-spacing:2px;text-transform:uppercase;color:#9a7b43}.ob-finished-shelf h2{font:normal 26px Georgia,serif;margin:5px 0}.ob-shelf-count,.ob-shelf-privacy,.ob-shelf-empty{font:13px/1.55 Georgia,serif;color:#6c736b;margin:5px 0 11px}.ob-shelf-ornament{font:35px Georgia,serif;color:#a99058}.ob-shelf-books{display:flex;flex-wrap:wrap;gap:16px}.ob-shelf-entry{width:90px;display:flex;flex-direction:column;align-items:center;gap:5px}.ob-shelf-volume{color:#294638;text-decoration:none;font:12px/1.35 Georgia,serif;text-align:center}.ob-shelf-volume img{height:116px;width:78px;object-fit:contain;display:block;margin:auto auto 6px;filter:drop-shadow(3px 4px 2px #0002)}.ob-shelf-volume span{display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:2;overflow:hidden}.ob-shelf-remove{padding:3px 7px;border:0;background:transparent;color:#6e6b5b;font:11px Arial,sans-serif;text-decoration:underline;cursor:pointer}.ob-finish-control{border-top:1px solid #d8d8c7;margin-top:16px;padding:16px 0;text-align:center}.ob-finish-control[hidden]{display:none}.ob-finish-button{border:1px solid #b7a67e;border-radius:25px;background:#f9f2dd;color:#294638;padding:9px 13px;cursor:pointer;font:13px Georgia,serif;width:100%;min-height:40px}.ob-finish-note{font:12px/1.45 Georgia,serif;margin:8px 0;color:#6d7465}.ob-finish-link{font:12px Georgia,serif;color:#5a6955}.night .ob-finish-button{background:#344936;color:#f3ecd8}.night .ob-finish-note{color:#dae0d2}@media(max-width:600px){.ob-finished-shelf{padding:0 12px}.ob-shelf-inner{padding:18px}.ob-shelf-entry{width:74px}.ob-shelf-volume img{height:102px;width:67px}}';
 document.head.appendChild(node);
}
window.OpheliaFinishedShelf=Object.freeze({all:readShelf,mark:record});
function boot(){style();shelfOnPage();readerControls();}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();