/* A small, accessible emoji tray for Victorian public correspondence.
 * Inserts only into the visitor's own message draft — no network requests.
 * The historical quotations and stored book text are never changed.
 */
(function(root){
 'use strict';
 function insertedAt(value,start,end,emoji,maxLength){
  const text=String(value||''),symbol=String(emoji||'');
  const begin=Math.max(0,Math.min(text.length,Math.trunc(Number(start)||0)));
  const finish=Math.max(begin,Math.min(text.length,Math.trunc(Number(end)||0)));
  if(!symbol||text.length-(finish-begin)+symbol.length>maxLength)return null;
  return {value:text.slice(0,begin)+symbol+text.slice(finish),caret:begin+symbol.length};
 }
 function install(){
  const input=document.getElementById('letter-message');
  const group=document.querySelector('.emoji-options');
  const status=document.getElementById('emoji-status');
  if(!input||!group)return;
  group.addEventListener('click',event=>{
   const button=event.target.closest?.('button[data-emoji]');
   if(!button||!group.contains(button))return;
   const emoji=button.dataset.emoji;
   const start=input.selectionStart??input.value.length;
   const end=input.selectionEnd??start;
   const result=insertedAt(input.value,start,end,emoji,input.maxLength>=0?input.maxLength:2400);
   if(!result){
    if(status)status.textContent='Your letter has reached the maximum length.';
    input.focus();return;
   }
   input.value=result.value;
   input.focus();
   input.setSelectionRange(result.caret,result.caret);
   input.dispatchEvent(new Event('input',{bubbles:true}));
   if(status)status.textContent=button.title+' added to your letter.';
  });
 }
 root.OpheliaEmoji=Object.freeze({insertedAt});
 if(typeof document!=='undefined'){
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install);
  else install();
 }
})(typeof window==='undefined'?{}:window);
