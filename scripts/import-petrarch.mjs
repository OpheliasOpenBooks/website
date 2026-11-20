#!/usr/bin/env node
// Original, public-domain Petrarch texts hosted locally, not linked to an outside reader.
// English: 1859 Bohn edition as reprinted by Bell & Sons in 1879 (Gutenberg #17650).
// Italian: original Canzoniere of 366 poems, digitized from a public-domain source.
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
const ROOT='public/books/petrarch';
const title='The Sonnets, Triumphs, and Other Poems of Petrarch';
const author='Francesco Petrarca';
const englishSources=[
 'https://gutenberg.pglaf.org/cache/epub/17650/pg17650.txt',
 'https://www.gutenberg.org/cache/epub/17650/pg17650.txt',
 'https://raw.githubusercontent.com/GITenberg/The-Sonnets-Triumphs-and-Other-Poems-of-Petrarch_17650/master/17650.txt',
 'https://raw.githubusercontent.com/GITenberg/The-Sonnets-Triumphs-and-Other-Poems-of-Petrarch_17650/master/17650-8.txt'
];
const italianSources=[
 'https://files.libridominiopubblico.it/livros/it/francesco-petrarca/canzoniere.txt'
];
const count=s=>(s.match(/\S+/g)||[]).length;
async function fetchText(urls, verify) {
 let last;
 for(const url of urls){
  try {
   const response=await fetch(url,{headers:{'User-Agent':'OpheliasOpenBook/1.0 (public domain text archiving)'},signal:AbortSignal.timeout(90000)});
   if(!response.ok)throw Error('HTTP '+response.status);
   const bytes=Buffer.from(await response.arrayBuffer());
   if(bytes.length<100000||bytes.length>6000000)throw Error('Unusual source byte size '+bytes.length);
   // Older Gutenberg transcriptions sometimes use Latin-1: decode without deleting accents.
   let text=new TextDecoder('utf-8').decode(bytes);
   if(text.includes('\uFFFD'))text=new TextDecoder('windows-1252').decode(bytes);
   text=text.replace(/^\uFEFF/,'').replace(/\r\n?/g,'\n');
   if(/gutenberg/i.test(url)){
    const start=/\*{3}\s*START OF (?:THE|THIS) PROJECT GUTENBERG EBOOK[^\n]*\*{3}/i.exec(text);
    const end=/\*{3}\s*END OF (?:THE|THIS) PROJECT GUTENBERG EBOOK[^\n]*\*{3}/i.exec(text);
    if(start&&end&&end.index>start.index+120000)text=text.slice(start.index+start[0].length,end.index).trim();
   }
   verify(text);
   console.log('VERIFIED SOURCE',url,'bytes',bytes.length,'words',count(text),'begin',JSON.stringify(text.slice(0,220)),'end',JSON.stringify(text.slice(-220)));
   return {text,url};
  }catch(err){last=err;console.warn('Source inaccessible or incomplete:',url,err.message);}
 }
 throw Error('No complete verified original text available: '+last?.message);
}
function verifyEnglish(text){
 const lead=text.slice(0,30000).toUpperCase();
 if(text.length<430000 || count(text)<75000 || !lead.includes('PETRARCH') || !lead.includes('SONNET'))throw Error('English Petrarch edition failed identity/length test');
 if(!/TRIUMPH OF LOVE/i.test(text)||!/SONNET\s+(?:I|1)[.\s]/i.test(text))throw Error('Petrarch sonnets and Triumphs missing');
}
function verifyItalian(text){
 // Includes the celebrated first and final Rerum vulgarium fragmenta poems.
 if(text.length<135000||count(text)<25000||!/Petrarc/i.test(text.slice(0,25000))||
 !/Voi ch[’']?ascoltate/i.test(text)||!/Vergine bella/i.test(text))throw Error('Unabridged Italian Canzoniere identity/length not verified');
}
function normalize(text,lang){
 let out=text.replace(/\[(?:Pg\.?\s*)?[ivxlcdm\d]+[a-z]?\]/gi,'')
  .replace(/_([^_\n]{1,180})_/g,'$1')
  .replace(/\n{3,}/g,'\n\n').trim();
 // Do not silently delete notes, poems, stanzas, or original lyric lines.
 if(lang==='en')out=out.replace(/\[Illustration(?::[^\]]*)?\]/g,'');
 return out;
}
function heading(p,lang){
 const flat=p.replace(/\s+/g,' ').trim();
 if(flat.length>120||flat.length<3)return null;
 if(lang==='en'){
  if(/^(?:THE )?LIFE OF PETRARCH\.?$/i.test(flat))return 'Life of Petrarch · Thomas Campbell';
  if(/^(PREFACE|INTRODUCTION|ADVERTISEMENT|CONTENTS|INDEX|NOTES|LIST OF PLATES)\.?$/i.test(flat))return flat;
  const m=/^(?:(THE )?(TRIUMPH|SONNET|CANZONE|SESTINA|BALLATA|MADRIGAL|ODE|SONG|CAPITOLO)\s*(?:NO\.\s*)?([IVXLCDM\d]+)?[.:—\s-]*(.*))$/i.exec(flat);
  if(m && flat.length<90)return (m[2].toUpperCase()+ (m[3]?' '+m[3]:'')+ (m[4]?' · '+m[4]:'')).trim();
 }else{
  if(/^(?:IN VITA|IN MORTE|PARTE\s+(?:PRIMA|SECONDA)|Canzoniere|Rerum vulgarium fragmenta)$/i.test(flat))return flat;
  const m=/^(?:(?:POESIA|SONETTO|CANZONE)\s*)?([IVXLCDM]{1,9}|\d{1,3})[.):-]\s*(.*)$/i.exec(flat);
  if(m&&flat.length<100)return 'Poesia '+m[1] +(m[2]?' · '+m[2]:'');
 }
 return null;
}
function divide(text,lang){
 const paragraphs=text.split(/\n[ \t]*\n+/).map(x=>x.trim()).filter(Boolean);
 const parts=[];let current='Front matter',sections=[],words=0;
 function flush(){
  if(!sections.length)return;
  const n=sections.reduce((sum,s)=>sum+count(s.paragraphs.join(' ')),0);
  parts.push({part:parts.length+1,words:n,name:sections.find(s=>/^(SONNET|CANZONE|THE TRIUMPH|TRIUMPH|Poesia)/i.test(s.name))?.name||sections[0].name,sections});
  sections=[];words=0;
 }
 for(let paragraph of paragraphs){
  const sectionName=heading(paragraph,lang);
  if(sectionName)current=sectionName;
  const n=count(paragraph);
  if(words>=3600&&words+n>4900)flush();
  let s=sections.at(-1);
  if(!s||s.name!==current){s={name:current,paragraphs:[]};sections.push(s);}
  s.paragraphs.push(paragraph);words+=n;
 }
 flush();
 const restored=parts.flatMap(p=>p.sections.flatMap(s=>s.paragraphs)).join('\n\n');
 if(restored!==paragraphs.join('\n\n'))throw Error(lang+' full text reconstruction failed');
 const total=count(restored);
 if(parts.length<5|| (lang==='en'&&total<75000) || (lang==='it'&&total<25000))throw Error(lang+' incomplete edition detected');
 return {parts,wordCount:total,sha256:createHash('sha256').update(restored).digest('hex')};
}
function saveEdition(src,lang){
 const out=divide(normalize(src.text,lang),lang);
 const dir=path.join(ROOT,lang);
 fs.mkdirSync(dir,{recursive:true});
 const entries=out.parts.map(p=>{
  const file='part-'+String(p.part).padStart(3,'0')+'.json';
  fs.writeFileSync(path.join(dir,file),JSON.stringify({title:lang==='en'?title:'Il Canzoniere',author,
    language:lang,readOnly:lang==='it',part:p.part,partCount:out.parts.length,sections:p.sections}));
  return {part:p.part,file,name:p.name,sections:p.sections.length,words:p.words};
 });
 const manifest={title:lang==='en'?title:'Il Canzoniere',author,language:lang,readOnly:lang==='it',
  publication:lang==='en'?'Bohn, 1859; Bell & Sons reprint, 1879':'Original Italian poetry, fourteenth century',
  source:src.url,wordCount:out.wordCount,sha256:out.sha256,parts:entries};
 fs.writeFileSync(path.join(dir,'manifest.json'),JSON.stringify(manifest,null,2)+'\n');
 if(entries.reduce((n,p)=>n+p.words,0)!==out.wordCount)throw Error('Part word count mismatch');
 console.log('HOSTED',lang,'parts',entries.length,'words',out.wordCount);
}
async function cover(){
 const src='https://raw.githubusercontent.com/GITenberg/The-Sonnets-Triumphs-and-Other-Poems-of-Petrarch_17650/master/17650-h/images/01.jpg';
 try{
  const r=await fetch(src,{signal:AbortSignal.timeout(30000)});
  if(!r.ok)throw Error('HTTP '+r.status);
  const b=Buffer.from(await r.arrayBuffer());
  if(b.length<10000||b.length>1000000||b[0]!==0xff||b[1]!==0xd8)throw Error('Invalid source illustration');
  fs.mkdirSync('public/art',{recursive:true});
  fs.writeFileSync('public/art/petrarch-1879-engraving.jpg',b);
  console.log('Original 1879 edition engraving saved',b.length);
 }catch(e){console.warn('Historical engraving unavailable, using source fallback:',e.message);}
}
function catalog(){
 let html=fs.readFileSync('index.html','utf8');
 const reader='petrarch-sonnets-triumphs.html';
 if(html.includes('href="'+reader+'"'))return;
 const head='<section class="wrap section" id="books">';
 const position=html.indexOf(head);if(position<0)throw Error('Main library section not found');
 const card='<article class="book"><img src="public/art/petrarch-1879-engraving.jpg" alt="Engraved portrait of Petrarch from the illustrated 1879 Bohn–Bell English edition" width="640" height="340" loading="lazy" style="object-fit:contain;background:#ede7d9" onerror="this.onerror=null;this.src=&quot;public/art/historical-cover-fallback.svg&quot;"><div><span class="pill">New · Italian Renaissance poetry</span><h3>The Sonnets, Triumphs, and Other Poems of Petrarch</h3><div class="eyebrow">Francesco Petrarca · Historic English edition 1859/1879</div><p>The enduring beauty of Petrarch’s lyric poems—from his sonnets to Laura to the triumphant visions of love, fame, and time. Full historic English translations, with his complete Italian Canzoniere in a separate read-only companion.</p><a class="button" href="'+reader+'">Read &amp; Listen &nbsp; →</a></div></article>';
 html=html.slice(0,position+head.length)+'\n'+card+'\n'+html.slice(position+head.length);
 fs.writeFileSync('index.html',html);
 console.log('CATALOG REGISTERED: original English and Italian hosted reader pages');
}
const en=await fetchText(englishSources,verifyEnglish);
const it=await fetchText(italianSources,verifyItalian);
saveEdition(en,'en');saveEdition(it,'it');
await cover();
catalog();
console.log('SUCCESS complete Petrarch edition, with both English and Italian locally hosted');
