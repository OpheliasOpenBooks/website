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
'.ob-share-button{border:1px solid #8ea691;border-radius:24px;background:#eef1e8;color:#294b3e;padding:9px 17px;font:600 13px Arial,sans-serif;cursor:pointer;min-height:36px}' +
'.ob-share-button:hover,.ob-share-button:focus-visible{background:#dfe8da;outline-offset:3px}' +
'.ob-share-holder{margin:14px auto 0;display:flex;gap:10px;justify-content:center}.ob-share-holder.home-share{margin:0}' +
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
function addPageButton(){
 if(document.querySelector('[data-ophelia-share]'))return;
 const host=document.querySelector('.book-heading')||document.querySelector('.hero .actions')||document.querySelector('#catalog-share-target');
 if(!host)return;
 const holder=document.createElement('div');
 holder.className='ob-share-holder'+(host.matches('.actions')?' home-share':'');
 holder.setAttribute('data-ophelia-share','');
 const button=document.createElement('button');button.type='button';button.className='ob-share-button';
 button.textContent='↗ Share this '+(document.querySelector('.book-heading')?'book':'library');
 button.addEventListener('click',()=>open());holder.appendChild(button);host.appendChild(holder);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',addPageButton);else addPageButton();
})();