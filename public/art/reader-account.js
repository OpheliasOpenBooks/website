'use strict';
(()=>{
 const localKey='ophelia-alice-bookmark';let profile=false,bookmark=null,ready=false,progressTimer,bookmarkBusy=false,lastProgress=-1;
 const speed=$('reader-speed'),output=$('reader-speed-output'),button=$('bookmark-page'),link=$('open-bookmark'),note=$('bookmark-note');
 button.disabled=true;
 const requested=new URLSearchParams(location.search).get('page');if(requested&&/^\d+$/.test(requested)&&Number(requested)>=1&&Number(requested)<=48)go(Number(requested)-1);
 function syncControls(){
  if(![...speed.options].some(o=>Number(o.value)===state.speed)){const option=new Option(state.speed+'×',state.speed);speed.add(option);}
  speed.value=state.speed;output.textContent=state.speed+'×';const marked=bookmark===state.page+1;
  button.textContent=marked?'♥ Page bookmarked':'♡ Bookmark page';button.setAttribute('aria-pressed',String(marked));
  link.hidden=!bookmark;if(bookmark){link.href='studio.html?read=1&page='+bookmark;link.textContent='Open bookmark · page '+bookmark;}
 }
 speed.onchange=()=>{setNarrationSpeed(Number(speed.value));syncControls();};
 $('speed').addEventListener('input',syncControls);
 const send=async body=>{const r=await fetch('/api/community',{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});const d=await r.json();if(!r.ok)throw new Error(d.error||'Could not save.');return d;};
 button.onclick=async()=>{if(bookmarkBusy)return;bookmarkBusy=true;button.disabled=true;const page=state.page+1,remove=bookmark===page;try{if(profile)await send({action:'bookmark',page,remove});else{try{if(remove)localStorage.removeItem(localKey);else localStorage.setItem(localKey,String(page));}catch{throw new Error('Browser storage is unavailable. Sign in to save your bookmark.');}}bookmark=remove?null:page;note.textContent=remove?'Bookmark removed.':profile?'Bookmark saved to My Books.':'Saved on this device. Create a reader profile on Home to save across devices.';syncControls();}catch(e){note.textContent=e.message;}finally{bookmarkBusy=false;button.disabled=false;}};
 function progress(){syncControls();if(!ready||!profile)return;clearTimeout(progressTimer);const page=state.page+1;if(page===lastProgress)return;progressTimer=setTimeout(async()=>{try{await send({action:'progress',page});lastProgress=page;}catch{note.textContent='Your account progress did not save. The current page is still remembered on this device.';}},700);}
 new MutationObserver(progress).observe($('navigation-page'),{childList:true,subtree:true,characterData:true});
 try{const n=Number(localStorage.getItem(localKey));if(n>=1&&n<=48)bookmark=n;}catch{}
 syncControls();
 fetch('/api/community',{credentials:'same-origin'}).then(async r=>{if(!r.ok){if(r.status!==401)note.textContent='Account bookmarks are unavailable. You can save on this device.';return;}const d=await r.json();profile=Boolean(d.me);if(profile){bookmark=d.books.find(b=>b.id==='alice')?.bookmark||null;note.textContent='Bookmarks save to your reader account.';}}).catch(()=>{note.textContent='Offline: bookmarks save on this device.';}).finally(()=>{ready=true;button.disabled=false;syncControls();progress();});
})();
