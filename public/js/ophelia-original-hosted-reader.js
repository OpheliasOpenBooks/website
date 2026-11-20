(()=>{'use strict';
const cfg=window.OPHELIA_ORIGINAL;
if(!cfg||!cfg.file||!cfg.title||!cfg.english)return;
const $=id=>document.getElementById(id);
const key='ophelia-original-reader-v2:'+cfg.file;
let state={page:0,bookmark:-1,font:20,dark:false},pages=[],sections=[];
try{const value=JSON.parse(localStorage.getItem(key)||'null');if(value&&typeof value==='object')Object.assign(state,value)}catch{}
if(!Number.isInteger(state.page)||state.page<0)state.page=0;
if(!Number.isInteger(state.bookmark))state.bookmark=-1;
if(!Number.isFinite(state.font)||state.font<16||state.font>32)state.font=20;
const save=()=>{try{localStorage.setItem(key,JSON.stringify(state))}catch{}};
const count=s=>(s.match(/\S+/g)||[]).length;
function paragraphPages(para,max=330){
 const n=count(para);if(n<=max)return [para];
 const sentences=para.split(/(?<=[.!?;:。！？…])\s+(?=[\p{Lu}«“—(])/u);
 let result=[],buffer='',words=0;
 for(const piece of sentences){let n=count(piece);if(!n)continue;
  if(n>max){if(buffer){result.push(buffer);buffer='';words=0}
   const wordsArr=piece.match(/\S+/g)||[];
   for(let i=0;i<wordsArr.length;i+=max)result.push(wordsArr.slice(i,i+max).join(' '));
   continue;
  }
  if(words+n>max&&buffer){result.push(buffer);buffer='';words=0}
  buffer+=(buffer?' ':'')+piece;words+=n;
 }
 if(buffer)result.push(buffer);
 return result.length?result:[para];
}
function normalize(t){
 return t.replace(/\r\n?/g,'\n').replace(/\uFEFF/g,'').replace(/[\u2060\u200b]/g,'').trim();
}
function decodeSections(raw){
 let content=normalize(raw);
 if(content.length<(cfg.minChars||10000))throw Error('Text is incomplete; original publication not loaded.');
 if(cfg.endPhrase&&!content.includes(cfg.endPhrase))throw Error('The original text ending was not found.');
 const regex=cfg.sectionPattern?new RegExp(cfg.sectionPattern,'gm'):null;
 const matches=regex?[...content.matchAll(regex)]:[];
 let out=[];
 const intro=(matches.length?content.slice(0,matches[0].index):'').trim();
 if(intro&&count(intro)>5)out.push({title:cfg.frontLabel||'Front matter',text:intro});
 if(matches.length>0&&matches.length<700){
  for(let i=0;i<matches.length;i++){
   const m=matches[i];
   const body=content.slice(m.index+m[0].length,matches[i+1]?.index??content.length).trim();
   if(!body)continue;
   out.push({title:m[0].trim().replace(/\s+/g,' ').slice(0,140),text:body});
  }
 }
 if(!out.length)out=[{title:cfg.frontLabel||cfg.title,text:content}];
 return out;
}
function paginate(parts){
 const result=[];
 parts.forEach((sec,section)=>{
  if(cfg.verse){
   const lines=sec.text.split(/\n/).map(x=>x.trimEnd());let chunk=[],lineCount=0;
   const flushVerse=()=>{if(!chunk.length)return;result.push({section,sectionTitle:sec.title,paras:[chunk.join('\n')]});chunk=[];lineCount=0};
   for(const line of lines){chunk.push(line);if(line.trim())lineCount++;if(lineCount>=48)flushVerse()}
   flushVerse();return;
  }
  const blocks=sec.text.split(/\n\s*\n+/).map(b=>b.trim()).filter(Boolean);
  let batch=[],words=0;
  const flush=()=>{if(batch.length){result.push({section,sectionTitle:sec.title,paras:batch});batch=[];words=0}};
  for(const block of blocks){
   const paragraphs=paragraphPages(block);
   for(const par of paragraphs){const n=count(par);
    if(words+n>330&&batch.length)flush();
    batch.push(par);words+=n;
   }
  }
  flush();
 });
 return result;
}
function setAppearance(){
 document.body.classList.toggle('dark',Boolean(state.dark));
 document.documentElement.style.setProperty('--font-size',state.font+'px');
 $('size').value=String(state.font);$('size-label').textContent=String(state.font);
 $('dark').checked=Boolean(state.dark);
}
function render(scroll=false){
 if(!pages.length)return;
 const p=pages[state.page];
 $('section-title').textContent=p.sectionTitle;
 $('prose').replaceChildren(...p.paras.map(t=>{const e=document.createElement('p');e.textContent=t;return e}));
 $('part').value=String(p.section);
 $('counter').textContent=(state.page+1)+' / '+pages.length;
 $('progress').textContent=Math.round((state.page+1)*100/pages.length)+'%';
 $('bar').style.width=((state.page+1)*100/pages.length)+'%';
 for(const id of ['prev','prev2'])$(id).disabled=state.page===0;
 for(const id of ['next','next2'])$(id).disabled=state.page===pages.length-1;
 $('bookmark').textContent=state.bookmark===state.page?'♥':'♡';
 $('jump').disabled=state.bookmark<0||state.bookmark>=pages.length;
 if(scroll)document.querySelector('#book').scrollIntoView({block:'start',behavior:'instant'});
}
function go(n){state.page=Math.max(0,Math.min(pages.length-1,n));save();render(true)}
['prev','prev2'].forEach(id=>$(id).onclick=()=>go(state.page-1));
['next','next2'].forEach(id=>$(id).onclick=()=>go(state.page+1));
$('part').onchange=()=>{const i=pages.findIndex(p=>p.section===Number($('part').value));if(i>=0)go(i)};
$('bookmark').onclick=()=>{state.bookmark=state.page===state.bookmark?-1:state.page;save();render()};
$('jump').onclick=()=>{if(state.bookmark>=0)go(state.bookmark)};
$('size').oninput=()=>{state.font=Number($('size').value);setAppearance();save()};
$('dark').onchange=()=>{state.dark=$('dark').checked;setAppearance();save()};
setAppearance();
(async()=>{
 try{
  const r=await fetch(cfg.file,{cache:'no-store'});
  if(!r.ok)throw Error('Local text file missing: '+r.status);
  const raw=await r.text();
  sections=decodeSections(raw);
  pages=paginate(sections);
  if(pages.length<(cfg.minPages||8))throw Error('This hosted edition is not complete.');
  $('part').replaceChildren(...sections.map((s,i)=>new Option(s.title,i)));
  $('part').disabled=$('bookmark').disabled=false;
  state.page=Math.max(0,Math.min(state.page,pages.length-1));
  render();save();
  $('status').textContent='Complete text stored on Ophelia’s Open Book · Original language · No audio';
 }catch(e){
  $('section-title').textContent='Text unavailable';
  $('prose').textContent='This edition could not be loaded. Please refresh the reader.';
  $('status').textContent=String(e?.message||e);
 }
})();
})();