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
 root.innerHTML=`<div class="ob-victorian-case">
  <div class="ob-case-crown" aria-hidden="true"><span class="ob-crown-scroll">❦</span></div>
  <div class="ob-case-body">
   <div class="ob-case-heading">
    <span class="ob-case-flourish" aria-hidden="true">✥</span>
    <div><p class="ob-shelf-eyebrow">A little library of your own</p><h2 id="ob-shelf-title">My Finished Books</h2></div>
    <span class="ob-case-flourish" aria-hidden="true">✥</span>
   </div>
   <div class="ob-shelf-topline"><span class="ob-shelf-count">0 books finished</span><span aria-hidden="true">❧</span></div>
   <div class="ob-case-bay">
    <div class="ob-case-back">
     <p class="ob-shelf-empty">Your first finished story belongs here. At the end of a book, choose “Mark this book as finished” and watch your collection grow.</p>
     <div class="ob-shelf-books" aria-live="polite"></div>
    </div>
    <div class="ob-case-shelf-edge" aria-hidden="true"></div>
   </div>
   <p class="ob-shelf-privacy">Your own private collection · Saved in this browser, on this device</p>
  </div>
  <div class="ob-case-base" aria-hidden="true"><i></i><i></i></div>
 </div>`;
 const hero=main.querySelector('.hero');
 if(hero)hero.insertAdjacentElement('afterend',root);else main.prepend(root);
 const refresh=()=>renderShelf(root);
 document.addEventListener('ophelia-shelf-changed',refresh);
 window.addEventListener('storage',event=>{if(event.key===KEY)refresh();});
 refresh();
}
function style(){
 const node=document.createElement('style');node.dataset.opheliaVictorianShelf='true';node.textContent="/* Victorian miniature walnut bookcase, entirely CSS: no image downloads. */\n.ob-finished-shelf{max-width:1120px;margin:30px auto 45px;padding:0 25px;scroll-margin-top:22px;--ob-wood:#493020;--ob-chestnut:#69452a;--ob-dark:#271a13;--ob-gilt:#c8a56a;--ob-parchment:#efe3c5;color:#e9d6ac}\n.ob-victorian-case{max-width:930px;margin:auto;position:relative;filter:drop-shadow(0 12px 12px #24170c26);isolation:isolate}\n.ob-case-crown{height:48px;margin:0 12px;position:relative;border:1px solid #302016;border-radius:55% 55% 4px 4px/25px 25px 4px 4px;background:radial-gradient(ellipse at 50% 0%,#b1854b 0,#6d4326 42%,#3c261a 100%);box-shadow:inset 0 5px 4px #d4a46a33,inset 0 -7px 2px #1c120d7a,0 5px 0 #362218}\n.ob-case-crown:before{content:\"\";position:absolute;left:-12px;right:-12px;bottom:-10px;height:18px;border-radius:4px;border:1px solid #27180f;background:linear-gradient(#7e5131 0%,#3f291b 48%,#21160f 55%,#71472c 85%,#3a251b);box-shadow:0 3px 2px #160f0b66}\n.ob-crown-scroll{position:absolute;inset:0;display:flex;justify-content:center;align-items:center;font:31px Georgia,serif;color:#d4af73;text-shadow:1px 2px 2px #20130d}\n.ob-case-body{position:relative;margin:0 5px;background:repeating-linear-gradient(90deg,#0000 0 30px,#ffffff09 31px 32px),linear-gradient(90deg,#2c1b12,#67432b 3%,#503321 8%,#68472c 50%,#422b1e 92%,#6b482e 97%,#24170f);border:2px solid #2b1c13;box-shadow:inset 0 0 0 5px #795234,inset 0 0 0 7px #2f2117,0 3px 4px #120c0880;padding:21px 31px 18px}\n.ob-case-heading{display:flex;align-items:center;justify-content:center;text-align:center;gap:26px;padding:7px 16px 8px;background:linear-gradient(90deg,#2d1b14,#4e3020 50%,#2d1b14);border:1px solid #987041;box-shadow:inset 0 0 0 3px #392418;min-height:101px}\n.ob-case-heading h2{font:normal clamp(21px,3.3vw,31px)/1.22 Georgia,serif!important;color:#f2e0b9!important;margin:5px 0 0!important;letter-spacing:.02em;text-shadow:0 1px 2px #0b0807}\n.ob-shelf-eyebrow{color:#c8aa76;font:10px/1.5 Georgia,serif;letter-spacing:2px;text-transform:uppercase;margin:0}\n.ob-case-flourish{color:#c49b5e;font:28px Georgia,serif;opacity:.88}\n.ob-shelf-topline{display:flex;justify-content:space-between;gap:12px;padding:9px 12px 10px;font:italic 12px Georgia,serif;color:#e6d0a5}\n.ob-case-bay{position:relative;padding:0 12px;background:linear-gradient(90deg,#301e14 0%,#745132 2%,#4c3020 4%,#4c3020 96%,#8c6743 98%,#23160f 100%);box-shadow:inset 4px 0 6px #100a08c7,inset -4px 0 6px #100a08c7}\n.ob-case-back{position:relative;min-height:184px;padding:16px 18px 0;display:flex;flex-direction:column;justify-content:flex-end;border:1px solid #251710;background:radial-gradient(ellipse at 50% 45%,#83634180,transparent 72%),repeating-linear-gradient(90deg,#ffffff08 0 1px,#0000 1px 30px),linear-gradient(#463020,#614329 65%,#2a1a13);box-shadow:inset 0 12px 17px #130b0b8f}\n.ob-shelf-empty{max-width:440px;margin:auto auto 40px;text-align:center;color:#ead6aa;font:italic 15px/1.6 Georgia,serif;text-shadow:0 1px #28150c}\n.ob-shelf-empty[hidden]{display:none}\n.ob-shelf-books{display:flex;flex-wrap:wrap;align-items:flex-end;gap:10px 14px;min-height:15px;justify-content:center}\n.ob-shelf-entry{display:flex;flex-direction:column;justify-content:flex-end;align-items:center;gap:5px;max-width:108px;width:clamp(76px,12%,100px);min-height:145px;position:relative;padding-bottom:7px}\n.ob-shelf-volume{display:flex;flex-direction:column;align-items:center;justify-content:flex-end;min-width:0;max-width:100%;color:#f3dfba;text-decoration:none!important;font:11px/1.2 Georgia,serif;text-align:center;transition:transform .22s ease,filter .22s ease;transform-origin:bottom center}\n.ob-shelf-volume img{display:block;width:clamp(60px,7vw,83px);height:116px;object-fit:contain;margin:0 auto 7px;box-shadow:3px 5px 5px #140a09ab,-2px 1px 1px #ffedaf37;border-left:3px solid #b28e58;filter:saturate(.85)}\n.ob-shelf-volume span{display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;max-width:96px;min-height:24px;overflow-wrap:anywhere}\n.ob-shelf-volume:is(:hover,:focus-visible){transform:translateY(-7px) rotate(-1.5deg);filter:brightness(1.13)}\n.ob-shelf-remove{border:0;background:transparent;text-decoration:underline;color:#e2c698;font:10px Arial,sans-serif;cursor:pointer;padding:4px 8px}\n.ob-shelf-remove:is(:hover,:focus-visible){color:#fff3d8}\n.ob-case-shelf-edge{height:26px;position:relative;left:-7px;width:calc(100% + 14px);background:linear-gradient(#9a7048 0%,#55351f 15%,#302015 34%,#885a34 40%,#3a2217 72%,#25170f 100%);border-top:2px solid #ba9863;box-shadow:0 4px 7px #150c0975,inset 0 3px 2px #dbb47a4d}\n.ob-case-shelf-edge:after{content:\"\";position:absolute;inset:8px 20px auto;height:1px;background:linear-gradient(90deg,transparent,#a77d48,transparent)}\n.ob-shelf-privacy{text-align:center;color:#e4ca9a;font:italic 11px/1.5 Georgia,serif;margin:16px 0 4px}\n.ob-case-base{height:22px;position:relative;border-radius:2px 2px 6px 6px;border:1px solid #301d12;background:linear-gradient(#845735 0%,#3a2518 24%,#68432a 46%,#2d1c12 100%);box-shadow:0 5px 5px #1c100b55}\n.ob-case-base i{position:absolute;bottom:-12px;width:55px;height:13px;background:linear-gradient(90deg,#25160f,#67402a,#2f1b13);border-radius:0 0 8px 8px}\n.ob-case-base i:first-child{left:24px}.ob-case-base i:last-child{right:24px}\n.ob-finish-control{border-top:1px solid #d8d8c7;margin-top:16px;padding:16px 0;text-align:center}\n.ob-finish-control[hidden]{display:none}\n.ob-finish-button{border:1px solid #b7a67e;border-radius:25px;background:#f9f2dd;color:#294638;padding:9px 13px;cursor:pointer;font:13px Georgia,serif;width:100%;min-height:40px}\n.ob-finish-note{font:12px/1.45 Georgia,serif;margin:8px 0;color:#6d7465}\n.ob-finish-link{font:12px Georgia,serif;color:#5a6955}\n.night .ob-finish-button{background:#344936;color:#f3ecd8}.night .ob-finish-note{color:#dae0d2}\n@media(max-width:630px){.ob-finished-shelf{padding:0 12px;margin:22px auto 32px}.ob-case-body{padding:17px 15px 16px}.ob-case-heading{gap:10px;min-height:88px}.ob-case-flourish{font-size:17px}.ob-shelf-eyebrow{font-size:9px;letter-spacing:1.2px}.ob-case-bay{padding:0 7px}.ob-case-back{padding:10px 8px 0;min-height:163px}.ob-shelf-entry{width:75px;min-height:133px}.ob-shelf-volume img{height:97px;width:65px}.ob-shelf-books{gap:9px 7px}.ob-shelf-privacy{font-size:10px}}\n@media(prefers-reduced-motion:reduce){.ob-shelf-volume{transition:none}}";
 document.head.appendChild(node);
}
window.OpheliaFinishedShelf=Object.freeze({all:readShelf,mark:record});
function boot(){style();shelfOnPage();readerControls();}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();