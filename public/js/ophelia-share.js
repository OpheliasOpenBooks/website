/* Ophelia's Open Book — user-initiated sharing without third-party tracking scripts. */
(() => {
'use strict';
if (window.OpheliaShare) return;
const E = encodeURIComponent;
let dialog, titleNode, urlInput, linksNode, noticeNode, nativeButton;
let current = { title: '', url: '' };
function cleanUrl(input) {
  const url = new URL(input || window.location.href, window.location.href);
  url.hash = ''; url.search = ''; return url.href;
}
function build() {
  if (dialog) return;
  const css = document.createElement('style');
  css.textContent =
/* A quiet engraved bookplate rather than a generic device button. */
'.ob-share-holder{margin:17px auto 0;display:flex;justify-content:center;align-items:center;gap:8px;max-width:100%}.ob-share-holder.home-share{margin:0}' +
'.ob-share-button{appearance:none!important;-webkit-appearance:none!important;display:inline-flex!important;align-items:center;justify-content:center;gap:.7em;min-height:39px;max-width:100%;margin:0;padding:8px 20px!important;border:1px solid #bda77f!important;border-radius:30px!important;background:#f9f4e8!important;color:#405c4e!important;font:italic 15px/1.25 Georgia,Times New Roman,serif!important;letter-spacing:.01em;white-space:normal;box-shadow:inset 0 0 0 2px #fffdf7,0 1px 2px #5f533519;cursor:pointer;transition:background-color .18s,border-color .18s,box-shadow .18s}' +
'.ob-share-button::before,.ob-share-button::after{content:"❦";font:normal 14px/1 Georgia,serif;color:#967039;opacity:.9}' +
'.ob-share-button:hover{background:#f0e6cf!important;border-color:#94783e!important;box-shadow:inset 0 0 0 2px #faf5e9,0 2px 5px #5f533522}' +
'.ob-share-button:focus-visible{outline:3px solid #b7782d!important;outline-offset:4px!important}' +
'@media(prefers-reduced-motion:reduce){.ob-share-button{transition:none}}' +
'.ob-share-dialog{border:1px solid #c6ccbe;border-radius:12px;max-width:520px;width:calc(100vw - 28px);max-height:min(690px,88dvh);overflow-y:auto;padding:26px;color:#253f32;background:#fffcf6;box-shadow:0 15px 60px #1b2a2059;font:14px/1.5 Arial,sans-serif}' +
'.ob-share-dialog::backdrop{background:#15251ac0}.ob-share-dialog h2{font:normal 27px Georgia,serif;color:#263e35;margin:0 34px 7px 0;letter-spacing:normal}' +
'.ob-share-dialog p{margin:5px 0 14px;color:#59665c}.ob-share-dialog .ob-close{position:absolute;right:17px;top:15px;border:0;border-radius:50%;background:#eff0e9;width:35px;height:35px;font-size:23px;cursor:pointer}' +
'.ob-share-dialog .ob-actions{display:flex;flex-wrap:wrap;gap:8px;margin:12px 0}.ob-share-dialog .ob-actions button{background:#294b3e;color:white;border:0;border-radius:5px;padding:11px 14px;font:600 13px Arial,sans-serif;cursor:pointer}' +
'.ob-share-dialog input{display:block;width:100%;border:1px solid #becabb;padding:10px;border-radius:5px;background:white;color:#233e35;font:12px Arial,sans-serif}' +
'.ob-share-links{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:9px;margin:16px 0}.ob-share-links a,.ob-share-links button{display:block;text-align:center;border:1px solid #cfd8ca;border-radius:5px;padding:11px 5px;background:white;color:#294b3e;font:600 12px/1.4 Arial,sans-serif;cursor:pointer;text-decoration:none}' +
'.ob-share-links a:hover,.ob-share-links button:hover{background:#edf1e9}.ob-share-dialog .ob-note{font-size:12px;color:#617267;margin:7px 0 0}' +
'@media(max-width:430px){.ob-share-links{grid-template-columns:repeat(2,minmax(0,1fr))}.ob-share-dialog{padding:18px}}';
  document.head.appendChild(css);
  dialog = document.createElement('dialog');
  dialog.className = 'ob-share-dialog';
  dialog.setAttribute('aria-labelledby', 'ob-share-heading');
  dialog.innerHTML = '<button type="button" class="ob-close" aria-label="Close share options">×</button><h2 id="ob-share-heading">Share Ophelia’s Open Book</h2><p id="ob-share-title"></p><div class="ob-actions"><button type="button" id="ob-device-share">Share with device…</button><button type="button" id="ob-copy-share">Copy link</button></div><label for="ob-share-url">Book or library link</label><input id="ob-share-url" readonly><p class="ob-note" id="ob-share-notice" role="status" aria-live="polite"></p><div class="ob-share-links" aria-label="Share on social media"></div><p class="ob-note">You decide where to share. No social network loads until you select it. Some apps require you to sign in or confirm your post.</p>';
  document.body.appendChild(dialog);
  titleNode = dialog.querySelector('#ob-share-title');
  urlInput = dialog.querySelector('#ob-share-url');
  linksNode = dialog.querySelector('.ob-share-links');
  noticeNode = dialog.querySelector('#ob-share-notice');
  nativeButton = dialog.querySelector('#ob-device-share');
  dialog.querySelector('.ob-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', (ev) => { if (ev.target === dialog) dialog.close(); });
  nativeButton.addEventListener('click', async () => {
    if (!navigator.share) return;
    try { await navigator.share({title:current.title,text:'Enjoy this free classic at Ophelia’s Open Book',url:current.url}); }
    catch (err) { if (err.name !== 'AbortError') noticeNode.textContent = 'Device sharing was unavailable. Choose a service below or copy the link.'; }
  });
  dialog.querySelector('#ob-copy-share').addEventListener('click', async () => {
    let copied = false;
    try { if (navigator.clipboard?.writeText) { await navigator.clipboard.writeText(current.url); copied = true; } } catch {}
    if (!copied) { try { urlInput.focus();urlInput.select();copied = document.execCommand('copy'); } catch {} }
    noticeNode.textContent = copied ? 'Link copied! Ready to paste anywhere.' : 'Select and copy the link above.';
  });
}
function platformLinks(title,url) {
 const text = title + ' · Free to read at Ophelia’s Open Book', words=text+' '+url;
 return [
  ['Facebook','https://www.facebook.com/sharer/sharer.php?u='+E(url)],
  ['X','https://twitter.com/intent/tweet?text='+E(text)+'&url='+E(url)],
  ['Bluesky','https://bsky.app/intent/compose?text='+E(words)],
  ['Threads','https://www.threads.com/intent/post?text='+E(words)],
  ['Pinterest','https://pinterest.com/pin/create/button/?url='+E(url)+'&description='+E(text)],
  ['Reddit','https://www.reddit.com/submit?url='+E(url)+'&title='+E(title)],
  ['LinkedIn','https://www.linkedin.com/sharing/share-offsite/?url='+E(url)],
  ['WhatsApp','https://api.whatsapp.com/send?text='+E(words)],
  ['Telegram','https://t.me/share/url?url='+E(url)+'&text='+E(text)],
  ['Tumblr','https://www.tumblr.com/widgets/share/tool?canonicalUrl='+E(url)+'&title='+E(title)],
  ['Email','mailto:?subject='+E(title+' · Ophelia’s Open Book')+'&body='+E(words)],
  ['Text message','sms:?&body='+E(words)]
 ];
}
function open(info={}) {
 build();
 current={title:info.title||document.querySelector('.book-heading h1, main h1')?.textContent?.trim()||'Ophelia’s Open Book',url:cleanUrl(info.url)};
 titleNode.textContent=current.title;
 urlInput.value=current.url;
 noticeNode.textContent='';
 nativeButton.hidden=typeof navigator.share!=='function';
 linksNode.replaceChildren();
 for (const [name,href] of platformLinks(current.title,current.url)) {
  const a=document.createElement('a');
  a.textContent=name;a.href=href;
  if (!/^(mailto:|sms:)/.test(href)) {a.target='_blank';a.rel='noopener noreferrer';}
  a.setAttribute('aria-label','Share on '+name);linksNode.appendChild(a);
 }
 const mastodon=document.createElement('button');
 mastodon.type='button';mastodon.textContent='Mastodon…';
 mastodon.addEventListener('click',()=>{
  const choice=window.prompt('Enter your Mastodon server (for example, mastodon.social):','mastodon.social');
  if(choice===null)return;
  const host=choice.trim().replace(/^https?:\/\//i,'').replace(/\/.*$/,'');
  if(!/^[a-z0-9.-]+\.[a-z]{2,}$/i.test(host)){noticeNode.textContent='Please enter a valid server such as mastodon.social.';return;}
  window.open('https://'+host+'/share?text='+E(current.title+' '+current.url),'_blank','noopener,noreferrer');
 });
 linksNode.appendChild(mastodon);
 if(typeof dialog.showModal==='function')dialog.showModal();else dialog.setAttribute('open','');
 dialog.querySelector('.ob-close').focus();
}
window.OpheliaShare={open};
/* Quiet way back to the catalogue on every reader: no floating overlays. */
function addLibraryNavigation(){
 const heading=document.querySelector('.book-heading')||document.querySelector('main .intro')||document.querySelector('main > .intro')||document.querySelector('main .book .intro');
 if(!heading||document.querySelector('.ob-library-navigation'))return;
 const controls=document.querySelector('.reader-controls');
 const css=document.createElement('style');
 css.textContent=
 '.ob-library-navigation{display:flex;justify-content:center;align-items:center}' +
 '.ob-library-navigation-side{margin:0 0 13px;padding:0 0 13px;border-bottom:1px solid #e5e5d9}' +
 '.ob-library-navigation-inline{display:none;margin:12px auto 0}' +
 '.ob-library-navigation-inline-visible{margin:12px auto 0}' +
 '.ob-library-link{display:inline-flex;align-items:center;justify-content:center;min-height:34px;padding:7px 13px;border:1px solid #cdbb9b;border-radius:24px;background:#fcf9f1;color:#365345;text-decoration:none;font:italic 13px/1.35 Georgia,\'Times New Roman\',serif;letter-spacing:.01em;transition:background-color .15s,border-color .15s}' +
 '.ob-library-link:hover{background:#f0e7d6;border-color:#9d865d;color:#213d30}' +
 '.ob-library-link:focus-visible{outline:3px solid #b7782d;outline-offset:3px}' +
 '@media(max-width:780px){.ob-library-navigation-side{display:none}.ob-library-navigation-inline{display:flex}}' +
 '@media(prefers-reduced-motion:reduce){.ob-library-link{transition:none}}';
 document.head.appendChild(css);
 function nav(placement){
  const wrapper=document.createElement('nav');
  wrapper.className='ob-library-navigation ob-library-navigation-'+placement;
  wrapper.setAttribute('aria-label','Library navigation');
  const link=document.createElement('a');
  link.href='catalog.html';
  link.className='ob-library-link';
  link.textContent='← Back to Library';
  link.setAttribute('aria-label','Back to the library catalog');
  wrapper.appendChild(link);
  return wrapper;
 }
 if(controls)controls.insertBefore(nav('side'),controls.firstChild);
 heading.appendChild(nav(controls?'inline':'inline-visible'));
}
function addPageButton(){
 if(document.querySelector('[data-ophelia-share]'))return;
 const host=document.querySelector('.book-heading')||document.querySelector('.hero .actions')||document.querySelector('#catalog-share-target');
 if(!host)return;
 // Install the stylesheet before displaying the button, not only when clicked.
 build();
 const holder=document.createElement('div');
 holder.className='ob-share-holder'+(host.matches('.actions')?' home-share':'');
 holder.setAttribute('data-ophelia-share','');
 const button=document.createElement('button');button.type='button';button.className='ob-share-button';
 button.textContent='Share this '+(document.querySelector('.book-heading')?'book':'library');
 button.addEventListener('click',()=>open());holder.appendChild(button);host.appendChild(holder);
}

/* Source-language companions for public-domain translated works.
 * The English reader and its voice remain unchanged. A linked original
 * can be read here when available; otherwise it opens a verified archive.
 * Multi-volume sources list EVERY volume rather than silently truncating.
 */
const originalLanguageSources={
 'bambi.html':{language:'German',original:'Bambi: Eine Lebensgeschichte aus dem Walde',links:[['Original German novel (Projekt Gutenberg)','https://projekt-gutenberg.org/authors/felix-salten/books/bambi/']]},
 // Every foreign-language edition uses this common top-of-page reader panel.
 'the-magic-mountain.html':{language:'German',original:'Der Zauberberg',links:[['Band I (Project Gutenberg)','https://www.gutenberg.org/ebooks/65661'],['Band II (Project Gutenberg)','https://www.gutenberg.org/ebooks/65662']]},
 'siddhartha.html':{language:'German',original:'Siddhartha: Eine indische Dichtung',links:[['German original (Project Gutenberg)','https://www.gutenberg.org/ebooks/2499']]},
 'steppenwolf.html':{language:'German',original:'Der Steppenwolf',links:[['German original (Project Gutenberg)','https://www.gutenberg.org/ebooks/75802']]},
 'grimms-fairy-tales.html':{language:'German',original:'Kinder- und Hausmärchen',links:[['Original German collection (Wikisource)','https://de.wikisource.org/wiki/Kinder-_und_Hausm%C3%A4rchen']]},
 'more-grimm-fairy-tales.html':{language:'German',original:'Kinder- und Hausmärchen',links:[['Original German collection (Wikisource)','https://de.wikisource.org/wiki/Kinder-_und_Hausm%C3%A4rchen']]},
 'iliad.html':{language:'Ancient Greek',original:'Ἰλιάς',links:[['Greek original (Perseus)', 'https://atlas.perseus.tufts.edu/library/urn%3Acts%3AgreekLit%3Atlg0012.tlg001.perseus-grc2/']]},
 'oedipus-rex.html':{language:'Ancient Greek',original:'Οἰδίπους Τύραννος',links:[['Greek original (Perseus)', 'https://atlas.perseus.tufts.edu/library/urn%3Acts%3AgreekLit%3Atlg0011.tlg004.perseus-grc2/']]},
 'aeneid.html':{language:'Latin',original:'Aeneis',links:[['Latin original (Perseus)', 'https://atlas.perseus.tufts.edu/library/urn%3Acts%3AlatinLit%3Aphi0690.phi003.perseus-lat2/']]},
 'cyrano-de-bergerac.html':{language:'French',original:'Cyrano de Bergerac',links:[['Complete French play (Project Gutenberg)', 'https://www.gutenberg.org/ebooks/1256']]},
 'don-quixote.html':{language:'Spanish',original:'Don Quijote de la Mancha',links:[['Complete Spanish novel (Project Gutenberg)', 'https://www.gutenberg.org/ebooks/2000']]},
 'les-miserables.html':{language:'French',original:'Les Misérables',links:[
  ['Tome I — Fantine', 'https://www.gutenberg.org/ebooks/17489'],
  ['Tome II — Cosette', 'https://www.gutenberg.org/ebooks/17493'],
  ['Tome III — Marius', 'https://www.gutenberg.org/ebooks/17494'],
  ['Tome IV — L’idylle rue Plumet', 'https://www.gutenberg.org/ebooks/17518'],
  ['Tome V — Jean Valjean', 'https://www.gutenberg.org/ebooks/17519']
 ]},
 'song-of-roland.html':{language:'Old French',original:'La Chanson de Roland',links:[['Old French manuscript text (Base de français médiéval)', 'https://txm-bfm.huma-num.fr/txm/catalog/roland']]},
 'giants-in-the-earth.html':{language:'Norwegian',original:'I de dage / Riket grundlægges',links:[
  ['I de dage — original volume I (1924)', 'https://runeberg.org/idedage/'],
  ['Riket grundlægges — original volume II (1925)', 'https://runeberg.org/rg1925/']
 ],note:'The English novel combines these two original Norwegian books.'},
 'all-quiet-on-the-western-front.html':{language:'German',original:'Im Westen nichts Neues',links:[['German text — 1929 full-view edition (Google Books)', 'https://books.google.com/books?id=iMjPP47rmQgC&printsec=frontcover']]},
 'war-and-peace.html':{language:'Russian',original:'Война и мир',links:[['Complete Russian original (Wikisource)', 'https://ru.wikisource.org/wiki/Война_и_мир_(Толстой)']],note:'The Russian original also contains passages in French.'},
 'crime-and-punishment.html':{language:'Russian',original:'Преступление и наказание',links:[['Complete Russian original (Wikisource)', 'https://ru.wikisource.org/wiki/Преступление_и_наказание_(Достоевский)']]},
 'anna-karenina.html':{language:'Russian',original:'Анна Каренина',links:[['Complete Russian original (Wikisource)', 'https://ru.wikisource.org/wiki/Анна_Каренина_(Толстой)']]},
 'the-count-of-monte-cristo.html':{language:'French',original:'Le Comte de Monte-Cristo',links:[
  ['Tome I', 'https://www.gutenberg.org/ebooks/17989'],
  ['Tome II', 'https://www.gutenberg.org/ebooks/17990'],
  ['Tome III', 'https://www.gutenberg.org/ebooks/17991'],
  ['Tome IV', 'https://www.gutenberg.org/ebooks/17992']
 ]},
 'swanns-way.html':{language:'French',original:'Du côté de chez Swann',links:[['Complete French original (Project Gutenberg)', 'https://www.gutenberg.org/ebooks/2650']]},
 'the-phantom-of-the-opera.html':{language:'French',original:'Le Fantôme de l’Opéra',links:[['Read the complete French original in Ophelia’s library', 'le-fantome-de-lopera-original-francais.html']]},
 'the-metamorphosis.html':{language:'German',original:'Die Verwandlung',links:[['Read the complete German original in Ophelia’s library', 'die-verwandlung.html']]},
 'civilization-and-its-discontents.html':{language:'German',original:'Das Unbehagen in der Kultur',links:[['Original 1930 German edition — complete scan (Internet Archive)', 'https://archive.org/details/DasUnbehagenInDerKultur/page/n6']]},
 'madame-bovary.html':{language:'French',original:'Madame Bovary',links:[['Complete French original (Project Gutenberg)', 'https://www.gutenberg.org/ebooks/14155']]},
 'the-three-sisters.html':{language:'Russian',original:'Три сестры',links:[['Original Russian play (Wikisource)', 'https://ru.wikisource.org/wiki/Три_сестры_(Чехов)']]},
 'fathers-and-sons.html':{language:'Russian',original:'Отцы и дети',links:[['Complete Russian original (Wikisource)', 'https://ru.wikisource.org/wiki/Отцы_и_дети_(Тургенев)']]},
 'capital-volume-1.html':{language:'German',original:'Das Kapital · Band I',links:[['German volume I — full text (historical archive)', 'https://web.archive.org/web/20160304205417/http://www.mlwerke.de/me/me23/me23_000.htm']]},
 'capital-volume-2.html':{language:'German',original:'Das Kapital · Band II',links:[['German volume II — full text (historical archive)', 'https://web.archive.org/web/20160304171446/http://mlwerke.de/me/me24/me24_000.htm']]},
 'capital-volume-3.html':{language:'German',original:'Das Kapital · Band III',links:[['German volume III — full text (historical archive)', 'https://web.archive.org/web/20160304204126/http://www.mlwerke.de/me/me25/me25_000.htm']]}
};
function addOriginalLanguageLinks(){
 const currentPage=window.location.pathname.split('/').pop().toLowerCase();
 const record=originalLanguageSources[currentPage];
 const heading=document.querySelector('.book-heading');
 if(!record||!heading||document.querySelector('.ob-original-language'))return;
 const style=document.createElement('style');
 style.textContent=
 '.ob-original-language{max-width:790px;margin:17px auto 0;padding:11px 16px;text-align:center;border:1px solid #d9c9ad;background:#faf5e9;color:#53604c;border-radius:5px;font:14px/1.6 Georgia,serif}' +
 '.ob-original-language .ob-original-title{font-style:italic;color:#796447}' +
 '.ob-original-language a{color:#3a5c49;text-decoration:underline;text-underline-offset:3px;overflow-wrap:anywhere}' +
 '.ob-original-language a:focus-visible,.ob-original-language summary:focus-visible{outline:3px solid #b7782d;outline-offset:3px}' +
 '.ob-original-language .ob-original-links{display:flex;flex-wrap:wrap;justify-content:center;gap:7px 17px;margin-top:5px}' +
 '.ob-original-language .ob-original-links a{font-size:13px}' +
 '.ob-original-language summary{cursor:pointer;list-style:revert;font-style:italic}' +
 '.ob-original-language .ob-original-note{display:block;color:#746b5d;font:12px/1.6 Arial,sans-serif;margin-top:6px}' +
 '.night .ob-original-language{background:#2d3b31;color:#f2e9d6;border-color:#80745d}' +
 '.night .ob-original-language a,.night .ob-original-language .ob-original-title{color:#ead0a0}' +
 '.night .ob-original-language .ob-original-note{color:#d1c2ac}';
 document.head.appendChild(style);
 const box=document.createElement('section');
 box.className='ob-original-language';
 box.setAttribute('aria-label','Original-language reading edition');
 const headingText='❦ Read in the Original Language ('+record.language+')';
 function addLinks(parent){
  const links=document.createElement('div');links.className='ob-original-links';
  for(const [label,href] of record.links){
    const a=document.createElement('a');a.href=href;a.textContent=label;
    if(/^https:\/\//.test(href)){a.target='_blank';a.rel='noopener noreferrer'}
    links.appendChild(a);
  }
  parent.appendChild(links);
 }
 if(record.links.length>1){
   const group=document.createElement('details');const summary=document.createElement('summary');
   summary.textContent=headingText;group.appendChild(summary);addLinks(group);box.appendChild(group);
 }else{
   const name=document.createElement('div');name.textContent=headingText;box.appendChild(name);addLinks(box);
 }
 const original=document.createElement('div');original.className='ob-original-title';original.textContent=record.original;box.appendChild(original);
 if(record.note){const n=document.createElement('span');n.className='ob-original-note';n.textContent=record.note;box.appendChild(n)}
 const quiet=document.createElement('span');quiet.className='ob-original-note';
 quiet.textContent='Original-language text is for reading; the English narration on this page remains unchanged.';
 box.appendChild(quiet);
 // Keep the quiet edition link above the share button, underneath the title.
 const share=heading.querySelector('.ob-share-holder');
 if(currentPage==='grimms-fairy-tales.html'&&heading.querySelector('img'))heading.insertBefore(box,heading.querySelector('img'));else if(share)heading.insertBefore(box,share);else heading.appendChild(box);
}

function initializePageButtons(){
  addPageButton();addLibraryNavigation();addOriginalLanguageLinks();
  // Reuse the same reader-side completion detector and personal shelf
  // throughout the library; no accounts or third-party storage required.
  if(!window.OpheliaFinishedShelf&&!document.querySelector('script[data-ophelia-finished-shelf]')){
    const script=document.createElement('script');
    script.src='public/js/ophelia-finished-shelf.js?v=1.0.0';
    script.defer=true;
    script.dataset.opheliaFinishedShelf='true';
    document.head.appendChild(script);
  }
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',initializePageButtons);else initializePageButtons();
})();