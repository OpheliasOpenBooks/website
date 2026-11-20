#!/usr/bin/env node
/* Full-source, lossless Gutenberg #30188 import. Never publish excerpts. */
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
const root='public/books/the-fifth-queen';
const sources=[
 'https://raw.githubusercontent.com/GITenberg/The-Fifth-Queen--And-How-She-Came-to-Court_30188/master/30188.txt',
 'https://www.gutenberg.org/cache/epub/30188/pg30188.txt'
];
const wc=s=>(s.match(/\S+/g)||[]).length;
async function source(){
 for(const url of sources)try{
  const r=await fetch(url,{signal:AbortSignal.timeout(75000)});
  if(!r.ok)throw Error('HTTP '+r.status);
  const buf=Buffer.from(await r.arrayBuffer());
  if(buf.length<350000||buf.length>1000000)throw Error('Unexpected source bytes '+buf.length);
  const raw=new TextDecoder().decode(buf).replace(/\r\n?/g,'\n');
  const a=/\*{3}\s*START OF (?:THIS|THE) PROJECT GUTENBERG EBOOK[^\n]*\*{3}/i.exec(raw);
  const z=/\*{3}\s*END OF (?:THIS|THE) PROJECT GUTENBERG EBOOK[^\n]*\*{3}/i.exec(raw);
  if(!a||!z||z.index-a.index<300000)throw Error('Gutenberg source end markers missing');
  const body=raw.slice(a.index+a[0].length,z.index);
  const begin=/^\s*THE\s*\n\s*FIFTH QUEEN/mi.exec(body);
  if(!begin)throw Error('Original title page not found');
  const text=body.slice(begin.index).trim();
  if(wc(text)<60000||!text.includes('PART THREE'))throw Error('Novel incomplete');
  console.log('Verified original novel source',url,'characters',text.length,'words',wc(text));
  return {text,url};
 }catch(e){console.warn('Source retry',url,e.message)}
 throw Error('No complete verified transcription available. Nothing added to catalog.');
}
function partition(text){
 const paras=text.split(/\n\s*\n+/).map(p=>p.trim()).filter(Boolean);
 let part='Front Matter',chapter='',sections=[],words=0;
 const groups=[],ch=new Set();
 const flush=()=>{
  if(!sections.length)return;
  groups.push({sections,words:sections.reduce((a,s)=>a+wc(s.paragraphs.join(' ')),0),name:sections.find(s=>s.name.includes('Chapter'))?.name||sections[0].name});
  sections=[];words=0;
 };
 for(const para of paras){
  const clean=para.replace(/\s+/g,' ').trim();
  const partHeading=/^PART (ONE|TWO|THREE)$/i.exec(clean);
  const chapterHeading=/^([IVXLCDM]{1,5})\.?$/i.exec(clean);
  if(partHeading){if(words>850)flush();part='Part '+partHeading[1].toUpperCase();chapter='';}
  else if(chapterHeading&&part!=='Front Matter'){if(words>850)flush();chapter='Chapter '+chapterHeading[1].toUpperCase();ch.add(part+' '+chapter);}
  const title=chapter?part+' · '+chapter:part;
  const count=wc(para);if(words>=4500&&words+count>5400)flush();
  let section=sections.at(-1);
  if(!section||section.name!==title){section={name:title,paragraphs:[]};sections.push(section);}
  section.paragraphs.push(para);words+=count;
 }
 flush();
 const textAgain=groups.flatMap(g=>g.sections.flatMap(s=>s.paragraphs)).join('\n\n');
 if(textAgain!==paras.join('\n\n'))throw Error('Lossless text reconstruction failed');
 if(groups.length<8||groups.length>70||ch.size<12||wc(textAgain)<60000)throw Error('Unexpected chapter or word count: '+groups.length+' parts '+ch.size+' chapters');
 console.log('Verified',groups.length,'parts',ch.size,'chapter headings',wc(textAgain),'words');
 return {groups,words:wc(textAgain),chapters:ch.size,hash:createHash('sha256').update(textAgain).digest('hex')};
}
function output(book,url){
 fs.mkdirSync(root,{recursive:true});
 const parts=book.groups.map((p,i)=>{
  const file='part-'+String(i+1).padStart(3,'0')+'.json';
  fs.writeFileSync(path.join(root,file),JSON.stringify({title:'The Fifth Queen: And How She Came to Court',author:'Ford Madox Ford',language:'en',readOnly:false,part:i+1,partCount:book.groups.length,sections:p.sections}));
  return {part:i+1,name:p.name,words:p.words,sections:p.sections.length,file};
 });
 const manifest={title:'The Fifth Queen: And How She Came to Court',author:'Ford Madox Ford',published:1906,source:url,projectGutenberg:'https://www.gutenberg.org/ebooks/30188',wordCount:book.words,chapterCount:book.chapters,sha256:book.hash,parts};
 fs.writeFileSync(path.join(root,'manifest.json'),JSON.stringify(manifest,null,2)+'\n');
 const total=parts.reduce((s,p)=>s+p.words,0);
 if(total!==book.words)throw Error('Final word audit failed');
 return manifest;
}
async function cover(){
 const filename='FifthQueen-cvr_archive-org_(PD).jpg';
 for(const url of ['https://commons.wikimedia.org/wiki/Special:FilePath/'+filename+'?width=650','https://commons.wikimedia.org/wiki/Special:FilePath/'+filename]){
  try{
   const r=await fetch(url,{signal:AbortSignal.timeout(50000),headers:{'User-Agent':'OpheliasOpenBook/1.0'}});
   if(!r.ok)throw Error('HTTP '+r.status);
   const bytes=Buffer.from(await r.arrayBuffer());
   if(bytes.length<15000||bytes.length>9000000||bytes[0]!==255||bytes[1]!==216)throw Error('Invalid historical JPEG');
   fs.mkdirSync('public/art',{recursive:true});fs.writeFileSync('public/art/the-fifth-queen-1906-cover.jpg',bytes);
   console.log('Original 1906 cover hosted:',bytes.length,'bytes');return;
  }catch(e){console.warn('Historic cover retry:',e.message)}
 }
 console.warn('Local archival cover unavailable; Commons remains the historical-image fallback');
}
function catalog(){
 let page=fs.readFileSync('index.html','utf8'),href='the-fifth-queen.html';
 if(page.includes('href="'+href+'"'))return;
 const a=page.indexOf('<section class="wrap section" id="books">'),b=page.indexOf('</section>',a);
 if(a<0||b<a)throw Error('Home library block not found');
 const card='<article class="book"><img src="public/art/the-fifth-queen-1906-cover.jpg" alt="Authentic 1906 illustrated cover for The Fifth Queen by Ford Madox Ford" width="640" height="340" loading="lazy" style="object-fit:contain;background:#f3ebde" onerror="this.onerror=null;this.src=&quot;https://commons.wikimedia.org/wiki/Special:FilePath/FifthQueen-cvr_archive-org_(PD).jpg&quot;"><div><span class="pill">New · Tudor historical romance</span><h3>The Fifth Queen</h3><div class="eyebrow">Ford Madox Ford · 1906</div><p>Young Katharine Howard enters Henry VIII’s glittering yet dangerous court, where ambition, faith and affection become perilously entwined. Ford’s atmospheric Tudor romance opens a trilogy of political intrigue and the human heart.</p><a class="button" href="'+href+'">Read &amp; Listen &nbsp; →</a></div></article>\n';
 fs.writeFileSync('index.html',page.slice(0,b)+card+page.slice(b));
 console.log('Registered in main catalog (catalog.html derives books from Home).');
}
const src=await source();const book=partition(src.text);const data=output(book,src.url);await cover();catalog();console.log('SUCCESS COMPLETE',data.parts.length,'parts',data.wordCount,'words',data.chapterCount,'chapter headings');
