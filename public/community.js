'use strict';
const $=id=>document.getElementById(id),esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const params=new URLSearchParams(location.search),page=document.body.dataset.page;
let data={books:[],friends:[],posts:[]},activeShelf=params.get('shelf')||'all',activeCategory=params.get('category')||'',toastTimer;
const shelfNames={all:'All books',want:'Want to Read',reading:'Currently Reading',read:'Read',unfinished:'Did Not Finish'};
const wallLink=id=>'home.html?wall='+encodeURIComponent(id);
const readLink=(n=1)=>'studio.html?read=1&page='+Math.max(1,Math.min(48,Number(n)||1));
function toast(message){$('toast').textContent=message;clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('toast').textContent='',6500);}
async function api(body,query=''){const r=await fetch('/api/community'+query,{credentials:'same-origin',...(body?{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)}:{})});const result=await r.json();if(r.status===401&&!body)return {signedIn:false,books:[],friends:[],posts:[]};if(!r.ok)throw new Error(result.error||'Could not connect. Please try again.');return result;}
async function load(){data=await api(null,params.has('wall')?'?wall='+encodeURIComponent(params.get('wall')):'');render();}
function needProfile(){if(data.me)return true;if(!data.signedIn){toast('Sign in to save books and join the reading circle.');$('account-banner').scrollIntoView({behavior:'smooth'});}else $('profile-dialog').showModal();return false;}
function categories(book){try{return JSON.parse(book.categories);}catch{return [];}}
function tagPicker(){const friends=(data.friends||[]).filter(f=>f.status==='accepted');return friends.length?friends.map(f=>`<label><input type="checkbox" name="tag" value="${esc(f.id)}"> @${esc(f.handle)}</label>`).join(''):'<p class="hint">Add a friend to tag them in a post or comment.</p>';}
function tagsHtml(tags){return tags?.length?'<div class="tags">With '+tags.map(t=>`<a href="${wallLink(t.id)}">@${esc(t.handle)}</a>`).join(', ')+'</div>':'';}
function empty(title,note=''){return `<div class="empty"><div class="ornament">❧</div><p>${esc(title)}</p><p class="hint">${esc(note)}</p></div>`;}
function cover(book){return book.id==='alice'?'<img class="book-cover" src="alice-riverbank.png" alt="Alice beside the river">':`<div class="book-cover plain-cover" aria-hidden="true">${esc(book.title.slice(0,1))}</div>`;}
function mini(book){return `<div class="book-mini">${cover(book)}<div><h3>${esc(book.title)}</h3><p>${esc(book.author)}</p><progress value="${Number(book.page)}" max="${Number(book.total)}" aria-label="Reading progress"></progress><p class="hint">Page ${Number(book.page)} of ${Number(book.total)}</p>${book.id==='alice'?`<a class="button" href="${readLink(book.page)}">Continue reading</a>`:''}${data.wall?.id===data.me?.id||page==='my-books'?` <button class="quiet" data-edit-book="${esc(book.id)}">Update progress</button>`:''}</div></div>`;}
function render(){
 const banner=$('account-banner');
 if(!data.signedIn)banner.innerHTML='<div class="notice">Make yourself at home. Sign in to save your books, bookmarks, and conversations. <a class="button" target="_top" href="/signin-with-chatgpt?return_to=%2Fhome.html">Sign in with ChatGPT</a></div>';
 else if(!data.me)banner.innerHTML='<div class="notice">Choose a reader name to create your own bookshelves and wall. <button data-profile>Create reader profile</button></div>';
 else banner.replaceChildren();
 $('profile-link').textContent=data.me?data.me.name:'Your reading life';
 if(page==='home')renderHome();else renderBooks();
}
function shelvesHTML(target){return Object.entries(shelfNames).map(([key,label])=>`<a href="my-books.html?shelf=${key}" ${target==='books'?`data-shelf="${key}"`:''} class="${activeShelf===key&&!activeCategory?'active':''}">${label}<span>${data.books.filter(b=>key==='all'||b.status===key).length}</span></a>`).join('');}
function renderHome(){
 const own=!data.wall||data.wall.id===data.me?.id;
 $('welcome').textContent=data.wall?(own?'Your reading home, '+data.me.name+'.':data.wall.name+'’s reading wall'):'Welcome to your reading home.';
 $('welcome-note').textContent=own?'Good books. Shared discoveries. Your next chapter.':'@'+data.wall.handle+' · A window into their reading life.';
 const reading=own?data.books.filter(b=>b.status==='reading'):data.wallReading.map(b=>({...b,id:b.title==='Alice’s Adventures in Wonderland'?'alice':''}));
 $('currently-reading').innerHTML=reading.length?reading.map(mini).join(''):empty('A new chapter awaits.','Add a book to Currently Reading in My Books.');
 const alice=data.books.find(b=>b.id==='alice');
 let localBookmark;try{localBookmark=Number(localStorage.getItem('ophelia-alice-bookmark'));}catch{}
 const mark=alice?.bookmark||(!data.me&&localBookmark);
 $('home-bookmark').innerHTML=mark?`<h3>Alice’s Adventures in Wonderland</h3><p class="hint">Saved at page ${Number(mark)}${!data.me?' · this device':''}</p><a class="button secondary" href="${readLink(mark)}">Open bookmark →</a>`:'<p class="hint">Save a page with the bookmark button beside your reader’s audio controls.</p>';
 $('home-shelves').innerHTML=shelvesHTML('home');
 $('wall-heading').textContent=own?'Your wall':'Write on '+data.wall.name+'’s wall';
 $('post-form').hidden=Boolean(data.me&&!data.canPost);$('wall-permission').hidden=!data.me||data.canPost;
 $('wall-permission').textContent='Become friends to post on this reader’s wall.';
 $('post-tags').innerHTML=tagPicker();
 $('wall-posts').innerHTML=data.posts.length?data.posts.map(post=>{
  const canComment=data.me&&(post.wall===data.me.id||post.author===data.me.id||data.friends.some(f=>f.id===post.wall&&f.status==='accepted'));
  return `<article class="card"><div class="post-header"><span class="avatar">${esc(post.name.slice(0,1))}</span><div><a href="${wallLink(post.author)}">${esc(post.name)}</a><small>${esc(new Date(post.created).toLocaleString())}${post.author!==post.wall?' · on '+esc(post.wallName)+'’s wall':''}</small></div></div>${post.book?`<div class="post-book">Reading · ${esc(post.book)}</div>`:''}<p class="post-body">${esc(post.body)}</p>${tagsHtml(post.tags)}${data.me&&(post.author===data.me.id||post.wall===data.me.id)?`<button class="quiet hint" data-delete-post="${esc(post.id)}">Remove post</button>`:''}<div class="comments">${post.comments.map(c=>`<div class="comment"><a href="${wallLink(c.author)}"><strong>${esc(c.name)}</strong></a><p>${esc(c.body)}</p>${tagsHtml(c.tags)}${data.me&&(c.author===data.me.id||post.wall===data.me.id)?`<button class="quiet hint" data-delete-comment="${esc(c.id)}">Remove comment</button>`:''}</div>`).join('')}${canComment?`<form class="comment-form" data-post="${esc(post.id)}"><label>Leave a comment<textarea name="body" maxlength="1200" required placeholder="Add to the conversation…"></textarea></label><details><summary class="hint">Tag friends</summary><div class="check-tags">${tagPicker()}</div></details><button class="secondary" style="margin-top:10px">Comment</button></form>`:'<p class="hint">Friends can join the conversation.</p>'}</div></article>`;
 }).join(''):empty(own?'Your wall is a fresh page.':'No reading updates yet.',own?'Share what you’re reading to begin the conversation.':'Visit again for a new chapter.');
 $('friends').innerHTML=data.friends.length?data.friends.map(f=>`<div class="friend"><a href="${wallLink(f.id)}">${esc(f.name)}</a><small>@${esc(f.handle)} · ${f.status==='accepted'?'Friend':f.receiver===data.me.id?'Wants to be your friend':'Request sent'}</small>${f.status==='pending'&&f.receiver===data.me.id?`<button data-friend="${esc(f.id)}" data-decision="accept">Accept</button>`:''}<button class="quiet" data-friend="${esc(f.id)}" data-decision="remove">${f.status==='accepted'?'Remove friend':f.receiver===data.me.id?'Decline':'Cancel request'}</button></div>`).join(''):'<p class="hint">Find a reader by name or handle. Once they accept, you can tag each other and post on each other’s walls.</p>';
}
function renderBooks(){
 $('book-shelves').innerHTML=shelvesHTML('books');const cats=[...new Set(data.books.flatMap(categories))].sort();
 $('category-shelves').innerHTML=cats.length?cats.map(c=>`<a href="my-books.html?category=${encodeURIComponent(c)}" data-category="${esc(c)}" class="${activeCategory===c?'active':''}">${esc(c)}<span>${data.books.filter(b=>categories(b).includes(c)).length}</span></a>`).join(''):'<p class="hint">Add categories while saving a book. They’ll become shelves here.</p>';
 const search=$('book-search').value.toLowerCase(),sort=$('book-sort').value;
 const books=data.books.filter(b=>(activeShelf==='all'||b.status===activeShelf)&&(!activeCategory||categories(b).includes(activeCategory))&&(b.title+' '+b.author).toLowerCase().includes(search)).sort((a,b)=>sort==='updated'?b.updated-a.updated:String(a[sort]).localeCompare(String(b[sort])));
 $('shelf-label').textContent=(activeCategory||shelfNames[activeShelf]||'All books')+' · '+books.length+' '+(books.length===1?'book':'books');
 $('book-list').innerHTML=books.length?books.map(b=>`<article class="card">${mini(b)}<div class="chip">${shelfNames[b.status]}</div>${categories(b).map(c=>`<span class="chip">${esc(c)}</span>`).join('')}${b.id==='alice'&&b.bookmark?`<p><a class="hint" href="${readLink(b.bookmark)}">Bookmark · page ${Number(b.bookmark)} →</a></p>`:''}<p><button class="secondary" data-edit-book="${esc(b.id)}">Edit book & shelves</button> <button class="quiet hint" data-share-book="${esc(b.id)}">Share an update</button></p></article>`).join(''):empty('Room for your next story.','Add Alice or keep track of another book you’re reading.');
}
function editBook(id){if(!needProfile())return;const existing=data.books.find(b=>b.id===id);const b=existing||(id==='alice'?{id:'alice',title:'Alice’s Adventures in Wonderland',author:'Lewis Carroll',status:'reading',categories:'["Classics","Fantasy"]',page:1,total:48}:{id:'',title:'',author:'',status:'want',categories:'[]',page:0,total:1});const f=$('book-form');for(const k of ['id','title','author','status','page','total'])f.elements[k].value=b[k];f.elements.categories.value=categories(b).join(', ');f.elements.title.readOnly=b.id==='alice';f.elements.author.readOnly=b.id==='alice';f.elements.total.readOnly=b.id==='alice';$('book-form-heading').textContent=existing?'Your book & shelves':'Add a book';$('book-dialog').showModal();}
async function submit(form,body,after){const buttons=[...form.querySelectorAll('button')];buttons.forEach(b=>b.disabled=true);try{await api(body);if(after)after();await load();toast('Saved.');}catch(e){toast(e.message);}finally{buttons.forEach(b=>b.disabled=false);}}
document.addEventListener('click',async e=>{
 const el=e.target.closest('button,a');if(!el)return;
 if(el.hasAttribute('data-close')){el.closest('dialog').close();return;}
 if(el.id==='profile-link'||el.hasAttribute('data-profile')){e.preventDefault();if(!data.signedIn){needProfile();return;}$('profile-form').elements.name.value=data.me?.name||'';$('profile-form').elements.handle.value=data.me?.handle||'';$('profile-dialog').showModal();return;}
 if(el.id==='add-book'||el.id==='add-alice'||el.hasAttribute('data-edit-book')){editBook(el.id==='add-alice'?'alice':el.dataset.editBook);return;}
 if(el.hasAttribute('data-shelf')||el.hasAttribute('data-category')){e.preventDefault();activeShelf=el.dataset.shelf||'all';activeCategory=el.dataset.category||'';history.replaceState(null,'','my-books.html?'+(activeCategory?'category='+encodeURIComponent(activeCategory):'shelf='+activeShelf));renderBooks();return;}
 if(el.hasAttribute('data-share-book')){const b=data.books.find(x=>x.id===el.dataset.shareBook);sessionStorage.setItem('ophelia-share-draft',JSON.stringify({book:b.title,body:'I’m '+(b.status==='read'?'finished with':'reading')+' '+b.title+'. '+(b.status==='read'?'':'Page '+b.page+' of '+b.total+'.')}));location.href='home.html';return;}
 const action=el.hasAttribute('data-friend')?'friend':el.hasAttribute('data-delete-post')?'delete-post':el.hasAttribute('data-delete-comment')?'delete-comment':null;
 if(action){if(!needProfile())return;el.disabled=true;try{await api({action,id:el.dataset.friend||el.dataset.deletePost||el.dataset.deleteComment,decision:el.dataset.decision});await load();if($('friend-results'))$('friend-results').replaceChildren();toast(action==='friend'?'Reading circle updated.':'Removed.');}catch(err){toast(err.message);}finally{el.disabled=false;}}
});
$('profile-form').onsubmit=e=>{e.preventDefault();const f=e.target;submit(f,{action:'profile',name:f.elements.name.value,handle:f.elements.handle.value},()=>$('profile-dialog').close());};
$('book-form').onsubmit=e=>{e.preventDefault();const f=e.target,b=Object.fromEntries(new FormData(f));b.categories=b.categories.split(',').map(c=>c.trim()).filter(Boolean);b.page=Number(b.page);b.total=Number(b.total);submit(f,{...b,action:'book'},()=>$('book-dialog').close());};
if(page==='home'){
 $('post-form').onsubmit=e=>{e.preventDefault();if(!needProfile())return;const f=e.target;submit(f,{action:'post',wall:data.wall.id,body:f.elements.body.value,book:f.elements.book.value,tags:[...f.querySelectorAll('[name=tag]:checked')].map(x=>x.value)},()=>f.reset());};
 $('wall-posts').addEventListener('submit',e=>{e.preventDefault();const f=e.target;if(!f.matches('.comment-form'))return;submit(f,{action:'comment',post:f.dataset.post,body:f.elements.body.value,tags:[...f.querySelectorAll('[name=tag]:checked')].map(x=>x.value)});});
 $('friend-search').onsubmit=async e=>{e.preventDefault();if(!needProfile())return;try{const r=await api(null,'?q='+encodeURIComponent(e.target.elements.q.value.replace(/^@/,'')));$('friend-results').innerHTML=r.readers.length?r.readers.map(r=>{const f=data.friends.find(f=>f.id===r.id);return `<div class="friend"><a href="${wallLink(r.id)}">${esc(r.name)}</a><small>@${esc(r.handle)}</small>${f?'<span class="hint">'+(f.status==='accepted'?'Already friends':'Request pending')+'</span>':`<button data-friend="${esc(r.id)}" data-decision="request">Add friend</button>`}</div>`;}).join(''):'<p class="hint">No readers found. Your friend needs a profile and access to this site first.</p>';}catch(err){toast(err.message);}};
}else{$('book-search').oninput=renderBooks;$('book-sort').onchange=renderBooks;}
load().then(()=>{if(page==='home'){try{const d=JSON.parse(sessionStorage.getItem('ophelia-share-draft'));if(d){$('post-body').value=d.body;$('post-book').value=d.book;sessionStorage.removeItem('ophelia-share-draft');$('post-body').focus();}}catch{}}}).catch(e=>{$('account-banner').innerHTML='<div class="notice">Your reading home could not load. <button id="retry-load">Try again</button></div>';$('retry-load').onclick=()=>location.reload();toast(e.message);});
