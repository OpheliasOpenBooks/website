#!/usr/bin/env node
/*
 * Agnes and Elisabeth Strickland, Lives of the Queens of England (1840–48).
 * Source: complete original twelve-volume scan set, NOT the later three-volume
 * Rosalie Kaufman abridgement. This is historical OCR; readers are warned of
 * transcription imperfections. No volume is silently omitted.
 */
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
const root='public/books/lives-of-the-queens-of-england';
const scans=[
 ['10281968bsb',1840],
 ['india.history.resource.70493',1841],
 ['india.history.resource.70490',1841],
 ['india.history.resource.70469',1841],
 ['india.history.resource.70491',1842],
 ['india.history.resource.70488',1843],
 ['india.history.resource.70461',1844],
 ['india.history.resource.70463',1845],
 ['india.history.resource.70462',1846],
 ['india.history.resource.70460',1847],
 ['india.history.resource.70464',1847],
 ['india.history.resource.70477',1848]
];
const roman=['I','II','III','IV','V','VI','VII','VIII','IX','X','XI','XII'];
const wc=s=>(s.match(/\S+/g)||[]).length;
const snooze=ms=>new Promise(resolve=>setTimeout(resolve,ms));
async function download(url,n=3){
 let last;
 for(let i=0;i<n;i++){
  try{
   const r=await fetch(url,{headers:{'User-Agent':'OpheliasOpenBook/1.0 (noncommercial historical public-domain transcription)','Accept':'text/plain,application/json,*/*'},signal:AbortSignal.timeout(60000)});
   if(!r.ok)throw Error('HTTP '+r.status+' '+url);
   return r;
  }catch(e){last=e;console.warn('Retrying source',i+1,e.message);if(i<n-1)await snooze(1300*(i+1));}
 }
 throw last;
}
function paragraphs(raw,vol){
 const text=raw.replace(/^\uFEFF/,'').replace(/\r\n?/g,'\n').replace(/\f/g,'\n\n').replace(/\uFFFD/g,'');
 // Original nineteenth-century printed lines are hard-wrapped by OCR.
 // Keep paragraph divisions (blank lines); join only ordinary wrap lines.
 let pieces=text.split(/\n[ \t]*\n+/).map(p=>p.trim()).filter(Boolean);
 // Preserve all OCR content, including original title pages and notes.
 // Remove only empty scanner control artifacts; do not abridge biographies.
 pieces=pieces.map(p=>p.replace(/([a-zA-Z])-\n\s*([a-z])/g,'$1$2').replace(/\n[ \t]*/g,' ').replace(/[ \t]{2,}/g,' ').trim()).filter(Boolean);
 if(pieces.length<250||wc(pieces.join(' '))<48000)throw Error('Volume '+vol+' OCR looks incomplete: '+pieces.length+' paragraphs '+wc(pieces.join(' '))+' words');
 const total=wc(pieces.join(' '));
 return {pieces,total};
}
function createParts(pieces,volume,year,source,partOffset){
 let parts=[],chunk=[],words=0,firstQueen='Original Volume '+roman[volume-1];
 function flush(){
  if(!chunk.length)return;
  const id=partOffset+parts.length+1;
  const label='Volume '+roman[volume-1]+' · Reading part '+(parts.length+1);
  const n=wc(chunk.join(' '));
  parts.push({id,volume,volumePart:parts.length+1,label,year,source,words:n,sections:[{name:label,paragraphs:chunk}]});
  chunk=[];words=0;
 }
 for(const text of pieces){
  const n=wc(text);
  // Long original paragraphs remain intact. Each part is approx 5,500 words.
  if(words>0&&words+n>5800)flush();
  chunk.push(text);words+=n;
 }
 flush();
 const recovered=parts.flatMap(p=>p.sections.flatMap(s=>s.paragraphs));
 if(recovered.length!==pieces.length||recovered.some((x,i)=>x!==pieces[i]))throw Error('Volume '+volume+' text reconstruction failed');
 console.log('Volume '+roman[volume-1]+': '+parts.length+' reading parts, '+wc(recovered.join(' '))+' OCR words; first: '+recovered[0].slice(0,100));
 return parts;
}
async function importAll(){
 let list=[],totalWords=0,volumeMeta=[];
 for(let i=0;i<scans.length;i++){
  const v=i+1,[id,year]=scans[i];
  const md=await (await download('https://archive.org/metadata/'+id)).json();
  const title=String(md.metadata?.title||'');
  if(!/lives\s+of\s+the\s+queens\s+of\s+england/i.test(title))throw Error('Wrong original series in volume '+v+': '+title);
  const printed=String(md.metadata?.date||md.metadata?.year||'');
  if(printed&&!printed.includes(String(year)))throw Error('Unexpected historical date in volume '+v+': '+printed);
  const file=(md.files||[]).find(f=>f.name?.endsWith('_djvu.txt')&&Number(f.size)>400000);
  if(!file)throw Error('Original volume '+v+' has no complete OCR transcription');
  const url='https://archive.org/download/'+encodeURIComponent(id)+'/'+encodeURIComponent(file.name);
  const r=await download(url);
  const bytes=Buffer.from(await r.arrayBuffer());
  if(bytes.length<400000||bytes.length>8000000)throw Error('Scanned volume '+v+' unexpectedly short or long: '+bytes.length);
  const raw=new TextDecoder('utf-8').decode(bytes);
  if(/<!DOCTYPE html>|<html[\s>]/i.test(raw.slice(0,1000)))throw Error('Archive returned an error page, not a book: Volume '+v);
  const original=paragraphs(raw,v);
  const parts=createParts(original.pieces,v,year,url,list.length);
  list.push(...parts);
  totalWords+=original.total;
  volumeMeta.push({volume:v,roman:roman[i],year,archiveId:id,source:url,words:original.total,readableOcr:true,parts:parts.length,
    sha256:createHash('sha256').update(original.pieces.join('\n\n')).digest('hex')});
 }
 if(volumeMeta.length!==12||list.length<100||totalWords<650000)throw Error('All twelve complete biographies must be available: '+list.length+' parts '+totalWords+' OCR words');
 console.log('ALL ORIGINAL VOLUMES VERIFIED',volumeMeta.map(x=>x.roman+':'+x.words).join(', '),'PARTS',list.length,'WORDS',totalWords);
 return {parts:list,volumes:volumeMeta,words:totalWords};
}
function write(book){
 fs.mkdirSync(root,{recursive:true});
 const entries=[];
 for(const p of book.parts){
  const filename='part-'+String(p.id).padStart(3,'0')+'.json';
  const d={title:'Lives of the Queens of England',author:'Agnes Strickland',language:'en',readOnly:false,part:p.id,partCount:book.parts.length,volume:p.volume,sections:p.sections};
  fs.writeFileSync(path.join(root,filename),JSON.stringify(d));
  entries.push({part:p.id,volume:p.volume,name:p.label,words:p.words,sections:p.sections.length,source:p.source,file:filename});
 }
 const manifest={title:'Lives of the Queens of England',author:'Agnes Strickland',additionalAuthor:'Elisabeth Strickland',
  firstPublished:'1840–1848',originalEdition:'Original twelve-volume series, with selected early corrected printings in volumes II–III',
  originalTextType:'Historical scan-derived OCR; individual transcription errors may remain',
  manuscriptStatus:'The twelve original volumes were digitized in full; OCR is not a critically proofread text',
  originalVolumes:book.volumes,wordCount:book.words,parts:entries};
 fs.writeFileSync(path.join(root,'manifest.json'),JSON.stringify(manifest,null,2)+'\n');
 let check=0;
 for(const meta of entries){
  const p=JSON.parse(fs.readFileSync(path.join(root,meta.file),'utf8'));
  if(p.part!==meta.part||p.partCount!==entries.length||p.volume!==meta.volume||p.sections.length!==meta.sections)throw Error('Part file check failed: '+meta.file);
  check+=wc(p.sections.flatMap(s=>s.paragraphs).join(' '));
 }
 if(check!==book.words)throw Error('Full text part count mismatch');
 console.log('ALL 12 VOLUMES WRITTEN',entries.length,'reading parts and',book.words,'words');
}
async function historicalCover(){
 // Archive.org's thumbnail is taken from the genuine 1840 first-volume scan.
 const dest='public/art/strickland-queens-1840-cover.jpg';
 const urls=['https://archive.org/services/img/10281968bsb','https://archive.org/download/10281968bsb/__ia_thumb.jpg'];
 for(const url of urls)try{
  const r=await download(url,2);
  const bytes=Buffer.from(await r.arrayBuffer());
  if(bytes.length<3500||bytes.length>5000000||bytes[0]!==255||bytes[1]!==216)throw Error('Not valid archival JPEG');
  fs.mkdirSync('public/art',{recursive:true});fs.writeFileSync(dest,bytes);
  console.log('Historic 1840 first-volume scan thumbnail cached',bytes.length,'bytes',url);return;
 }catch(e){console.warn('Historic cover source retry',e.message)}
 console.warn('Historical cover remains linked to Internet Archive live first-volume scan');
}
function catalog(){
 let index=fs.readFileSync('index.html','utf8');
 const reader='lives-of-the-queens-of-england.html';
 if(index.includes('href="'+reader+'"'))return;
 const a=index.indexOf('<section class="wrap section" id="books">'),b=index.indexOf('</section>',a);
 if(a<0||b<a)throw Error('Library catalogue section not found');
 const card='<article class="book"><img src="public/art/strickland-queens-1840-cover.jpg" alt="Historical 1840 first-volume scan of Agnes Strickland’s Lives of the Queens of England" width="640" height="340" loading="lazy" style="object-fit:contain;background:#f4edda" onerror="this.onerror=null;this.src=&quot;https://archive.org/services/img/10281968bsb&quot;"><div><span class="pill">New · Royal biographies &amp; Tudor history</span><h3>Lives of the Queens of England</h3><div class="eyebrow">Agnes &amp; Elisabeth Strickland · 1840–1848</div><p>Enter the courts and private chambers of England’s queens, from the Norman conquest through the age of the Stuarts. With Anne Boleyn, Katharine Howard, and a remarkable succession of royal lives, the Stricklands bring the women of England’s history vividly before us.</p><p class="fine">Twelve historical volumes · Complete scan-derived text · OCR imperfections may remain</p><a class="button" href="'+reader+'">Read &amp; Listen &nbsp; →</a></div></article>\n';
 fs.writeFileSync('index.html',index.slice(0,b)+card+index.slice(b));
 console.log('Catalogue registered full original Strickland series.');
}
const volumes=await importAll();
write(volumes);
await historicalCover();
catalog();
console.log('SUCCESS: original twelve-volume Lives of the Queens of England imported and registered.');
