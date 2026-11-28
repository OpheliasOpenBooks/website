/* Ophelia's Open Book — Magazine Library narration and navigation standard (v1.1).
 * All published issues must use the standard book reader controls and
 * public/js/ophelia-narration.js, plus this adapter.
 *
 * For each issue, preserve original pages and mark exact running-head prefixes
 * (including printed folios, duplicate titles and continuation notices) by
 * 1-based original page number. Keep a genuine article title in the body only
 * at its actual opening, even if it occurs midway through a page. Do not
 * guess from capitalization or delete prose. On a page with only a scan,
 * mark the page in scanOnlyPages so narration skips it when auto-turn is on.
 * Render runningHead outside #prose and use spokenText(page) for speech.
 * Never assign section/ci to these page objects: the shared book narrator
 * would otherwise automatically announce original page labels as chapters.
 * Keep originalPage for navigation and scan links. Preserve the source array.
 * For interrupted stories, join incomplete passages at their verified continuation.
 * Record {printedFromPage:{to:printedTargetPage,title:'Article title'}} in issue metadata.
 * Use continuationFor(page, metadata, pages.length) to render a centered Victorian-style
 * link below #prose and above the end ornament. Keep it silent and separate from narration.
 * Preserve ordinary Previous/Next and auto-turn, original folios, and intervening articles.
 * Confirm all links against the original issue and test source and destination pages.
 * Review and approve every issue before unlocking its public catalog entry.
 */
(function(root){
 'use strict';
 function preparePages(source, options={}){
  if(!Array.isArray(source)||!source.length||source.some(t=>typeof t!=='string'))throw Error('Magazine source must be an array of original page texts.');
  const heads=options.runningHeads||{};
  const scanOnly=new Set(options.scanOnlyPages||[]);
  for(const [key,prefix] of Object.entries(heads)){
   const n=Number(key);
   if(!Number.isInteger(n)||n<1||n>source.length||typeof prefix!=='string'||!source[n-1].startsWith(prefix))throw Error('Check the running header on original page '+key+' before publishing.');
  }
  return source.map((text,i)=>{
   const prefix=heads[i+1]||'';
   return {originalPage:i,sectionName:'Original page '+(i+1),runningHead:prefix.trim(),
    scanOnly:scanOnly.has(i+1),paragraphs:text.slice(prefix.length).split(/\n\s*\n+/).filter(Boolean)};
  });
 }
 function spokenText(page){return !page||page.scanOnly?'':page.paragraphs.join(' ');}
 // Editorially reviewed continuation metadata uses printed (one-based) pages.
 // A link is optional navigation only: never skip intervening articles automatically.
 function continuationFor(page, continuations={}, pageCount){
  if(!page)return null;
  const from=page.originalPage+1;
  const item=continuations[from];
  if(!item)return null;
  if(!Number.isInteger(item.to)||item.to<=from||item.to>pageCount||typeof item.title!=='string'||!item.title.trim())throw Error('Check story continuation on original page '+from+'.');
  return {href:'#'+item.to,to:item.to,label:'Continue '+item.title+' on page '+item.to+' →'};
 }
 root.OpheliaMagazineReader=Object.freeze({version:'1.1',preparePages,spokenText,continuationFor});
})(window);
