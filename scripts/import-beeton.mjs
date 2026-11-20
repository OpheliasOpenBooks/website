#!/usr/bin/env node
// Verified, unabridged public-domain import of Isabella Beeton (1861).
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
const OUT='public/books/mrs-beeton-household-management';
const sources=[
 ['https://www.gutenberg.org/files/10136/10136-0.txt','utf-8'],
 ['https://raw.githubusercontent.com/GITenberg/The-Book-of-Household-Management_10136/master/10136-8.txt','latin1']
];
const wordCount=s=>(s.match(/\S+/g)||[]).length;
async function downloadText(){
 for(const [url,encoding] of sources){
  try{
   const r=await fetch(url,{headers:{'User-Agent':'OpheliasOpenBook/1.0 (public domain transcription)'},signal:AbortSignal.timeout(80000)});
   if(!r.ok)throw Error('HTTP '+r.status);
   const buf=Buffer.from(await r.arrayBuffer());
   if(buf.length<2000000||buf.length>7500000)throw Error('Unexpected source bytes '+buf.length);
   const raw=new TextDecoder(encoding).decode(buf).replace(/\r\n?/g,'\n').replace(/^\uFEFF/,'');
   const a=/^\*{3}\s*START OF (?:THE|THIS) PROJECT GUTENBERG EBOOK[^\n]*\*{3}\s*$/im.exec(raw);
   const z=/^\*{3}\s*END OF (?:THE|THIS) PROJECT GUTENBERG EBOOK[^\n]*\*{3}\s*$/im.exec(raw);
   if(!a||!z||z.index<a.index+1000000)throw Error('Gutenberg START/END boundaries missing');
   const text=raw.slice(a.index+a[0].length,z.index).trim();
   if(text.length<1800000||!text.slice(0,20000).toUpperCase().includes('HOUSEHOLD MANAGEMENT'))throw Error('Book identity or length unverified');
   console.log('SOURCE',url,'BYTES',buf.length,'CHARACTERS',text.length);
   return {text,url};
  }catch(e){console.warn('Source retry:',e.message);}
 }
 throw Error('Could not obtain complete verified public-domain source. Catalog unchanged.');
}
function heading(p){
 const s=p.trim(),flat=s.replace(/\s+/g,' ');
 if(/^PREFACE\.?$/i.test(flat))return 'Preface';
 if(/^(?:GENERAL )?CONTENTS\.?$/i.test(flat))return 'Contents';
 if(/^INDEX\.?$/i.test(flat))return 'Index';
 const match=/^CHAPTER\s+([IVXLCDM]{1,8})\.?\s*(?:[-—–:]\s*)?(.{0,90})$/i.exec(flat);
 return match&&flat.length<135?'Chapter '+match[1].toUpperCase()+(match[2]?.trim()?' · '+match[2].trim().replace(/[. ]+$/,''):''):null;
}
function divide(text){
 const paragraphs=text.split(/\n[ \t]*\n+/).map(p=>p.trim()).filter(Boolean);
 const parts=[],chapters=new Set();let current='Front Matter',groups=[],words=0;
 if(paragraphs.length<500||wordCount(text)<200000)throw Error('Historical text unexpectedly short');
 const flush=()=>{
  if(!groups.length)return;
  const n=parts.length+1,amount=groups.reduce((sum,x)=>sum+wordCount(x.paragraphs.join(' ')),0);
  parts.push({part:n,words:amount,sections:groups,name:groups.find(g=>g.name.startsWith('Chapter '))?.name||groups[0].name});
  groups=[];words=0;
 };
 for(const paragraph of paragraphs){
  const title=heading(paragraph);
  if(title){
   if(title.startsWith('Chapter '))chapters.add(title.split(' ')[1]);
   if(words>1600&&title!==current)flush();
   current=title;
  }
  const n=wordCount(paragraph);
  if(words>=4600&&words+n>5400)flush();
  let group=groups.at(-1);
  if(!group||group.name!==current){group={name:current,paragraphs:[]};groups.push(group);}
  group.paragraphs.push(paragraph);words+=n;
 }
 flush();
 const rebuilt=parts.flatMap(p=>p.sections.flatMap(x=>x.paragraphs)).join('\n\n');
 if(rebuilt!==paragraphs.join('\n\n'))throw Error('Lossless reconstruction of complete text failed');
 if(parts.length<35||parts.length>320||chapters.size<30)throw Error('Expected full chapter sequence: '+chapters.size+' chapter markers, '+parts.length+' parts');
 const total=wordCount(rebuilt),hash=createHash('sha256').update(rebuilt).digest('hex');
 console.log('VERIFIED',paragraphs.length,'paragraphs',total,'words',chapters.size,'chapters',parts.length,'parts');
 console.log('START EXCERPT',paragraphs[0].slice(0,160),'END EXCERPT',paragraphs.at(-1).slice(-160));
 return {parts,total,hash,chapters:chapters.size};
}
function createFiles(book,url){
 fs.mkdirSync(OUT,{recursive:true});
 const entries=book.parts.map(part=>{
  const file='part-'+String(part.part).padStart(3,'0')+'.json';
  fs.writeFileSync(path.join(OUT,file),JSON.stringify({
   title:'The Book of Household Management',author:'Isabella Beeton',language:'en',readOnly:false,
   part:part.part,partCount:book.parts.length,sections:part.sections
  }));
  return {part:part.part,name:part.name,words:part.words,sections:part.sections.length,file};
 });
 const manifest={title:'The Book of Household Management',author:'Isabella Beeton',
  firstPublished:1861,projectGutenberg:'https://www.gutenberg.org/ebooks/10136',
  source:url,wordCount:book.total,chapterCount:book.chapters,sha256:book.hash,parts:entries};
 fs.writeFileSync(path.join(OUT,'manifest.json'),JSON.stringify(manifest,null,2)+'\n');
 let total=0;for(const p of entries){
  const d=JSON.parse(fs.readFileSync(path.join(OUT,p.file),'utf8'));
  if(d.partCount!==entries.length||d.sections.length!==p.sections)throw Error('Part validation failed');
  total+=p.words;
 }
 if(total!==book.total)throw Error('Imported words differ from original');
 return manifest;
}
async function downloadCover(){
 try{
  const url='https://upload.wikimedia.org/wikipedia/commons/4/42/Mrs_Beeton_1861_title_page_full_colour.jpg';
  const r=await fetch(url,{signal:AbortSignal.timeout(60000),headers:{'User-Agent':'OpheliasOpenBook/1.0 (historical public-domain title page)'}});
  if(!r.ok)throw Error('HTTP '+r.status);
  const b=Buffer.from(await r.arrayBuffer());
  if(b.length<25000||b.length>8000000||b[0]!==255||b[1]!==216)throw Error('Invalid illustration bytes');
  fs.mkdirSync('public/art',{recursive:true});
  fs.writeFileSync('public/art/mrs-beeton-1861-title-page.jpg',b);
  console.log('COVER hosted',b.length,'bytes');
 }catch(e){console.warn('Cover unavailable locally; original Commons image remains fallback:',e.message);}
}
function register(){
 let html=fs.readFileSync('index.html','utf8');
 const reader='mrs-beetons-book-of-household-management.html';
 if(html.includes('href="'+reader+'"'))return;
 const start=html.indexOf('<section class="wrap section" id="books">');
 const end=html.indexOf('</section>',start);
 if(start<0||end<start)throw Error('Catalog section missing');
 const card='<article class="book"><img src="public/art/mrs-beeton-1861-title-page.jpg" alt="Original 1861 illustrated title page from Isabella Beeton’s Book of Household Management" width="640" height="340" loading="lazy" style="object-fit:contain;background:#f4edda" onerror="this.onerror=null;this.src=&quot;https://commons.wikimedia.org/wiki/Special:FilePath/Mrs_Beeton_1861_title_page_full_colour.jpg&quot;"><div><span class="pill">New · Victorian household history</span><h3>The Book of Household Management</h3><div class="eyebrow">Mrs. Isabella Beeton · 1861</div><p>Step into a Victorian household, where the kitchen bustles with elaborate recipes, dinner parties demand an artful hand, and every domestic task has its own place. Mrs. Beeton’s remarkable guide opens a window onto everyday nineteenth-century life.</p><a class="button" href="'+reader+'">Read &amp; Listen &nbsp; →</a></div></article>\n';
 fs.writeFileSync('index.html',html.slice(0,end)+card+html.slice(end));
 console.log('CATALOG registered Mrs Beeton after complete source validation');
}
const source=await downloadText();
const book=divide(source.text);
createFiles(book,source.url);
await downloadCover();
register();
console.log('SUCCESS: complete household manual ready for site publication.');
