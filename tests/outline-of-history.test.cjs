/* The original 1920 H. G. Wells Outline of History, two full volumes and 210 period images. */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const manifests=JSON.parse(fs.readFileSync(path.join(root,'public/books/outline-of-history-1920-illustrations.json'),'utf8'));
const volumes=[
 {n:1,file:'outline-of-history-wells-1920-volume-1.txt',reader:'outline-of-history-volume-1.html',chapters:31,sections:32,images:127,words:195000,minimumPages:480,start:'I',end:'XXXI'},
 {n:2,file:'outline-of-history-wells-1920-volume-2.txt',reader:'outline-of-history-volume-2.html',chapters:10,sections:14,images:83,words:250000,minimumPages:600,start:'XXXII',end:'XLI'}
];
assert.equal(manifests.volume1.length,127,'127 Volume I original images');
assert.equal(manifests.volume2.length,83,'83 Volume II original images');
assert.equal(manifests.volume1.length+manifests.volume2.length,210,'All 210 illustrations catalogued');
assert.ok(/^https:\/\/www\.gutenberg\.org\/files\/45368\/45368-h\/images\/$/.test(manifests.base_url),'Original Gutenberg source images');
assert.ok([...manifests.volume1,...manifests.volume2].every(s=>/^[\w.-]+_lg\.png$/.test(s)),'Every art file references an original high-resolution plate');
let combinedWordCount=0;
const catalog=fs.readFileSync(path.join(root,'catalog.html'),'utf8');
const hub=fs.readFileSync(path.join(root,'outline-of-history.html'),'utf8');
assert.ok(catalog.includes("href:'outline-of-history.html'"),'Hub listed in library catalog');
assert.ok(hub.includes('href="outline-of-history-volume-1.html"')&&hub.includes('href="outline-of-history-volume-2.html"'),'Both volumes connected in hub');
assert.ok(hub.includes('outdated'),'Historic perspectives acknowledged');
for(const v of volumes){
 const original=fs.readFileSync(path.join(root,'public/books',v.file),'utf8');
 const reader=fs.readFileSync(path.join(root,v.reader),'utf8');
 const wc=(original.match(/\S+/g)||[]).length;combinedWordCount+=wc;
 assert.ok(wc>v.words,'Unabridged Volume '+v.n+' contains all text');
 assert.ok(original.startsWith('THE OUTLINE OF HISTORY\n'),'Original first heading Volume '+v.n);
 assert.equal([...original.matchAll(/\[Illustration(?:\s*:[^\]]*)?\]/g)].length,v.images,'Printed illustration markers Volume '+v.n);
 const headings=[...original.matchAll(/^([IVXLCDM]+)\s*$/gm)];
 assert.equal(headings.length,v.chapters,'Original chapter count Volume '+v.n);
 assert.equal(headings[0][1],v.start,'First Roman-numbered chapter Volume '+v.n);
 assert.equal(headings.at(-1)[1],v.end,'Final Roman-numbered chapter Volume '+v.n);
 assert.ok(reader.includes("fetch('public/books/"+v.file+"')"),'Volume '+v.n+' hosted locally');
 assert.ok(reader.includes("fetch('public/books/outline-of-history-1920-illustrations.json')"),'Volume '+v.n+' original illustration mapping');
 assert.ok(reader.includes('public/js/ophelia-narration.js?v=1.2.0'),'Standard narration Volume '+v.n);
 assert.ok(reader.includes('public/js/ophelia-share.js'),'Period sharing style Volume '+v.n);
 assert.ok(reader.includes("const STORAGE='ophelia-outline-of-history-wells-volume-"+v.n+"-v1'"),'Independent saved reading place Volume '+v.n);
 assert.ok(catalog.includes("href:'"+v.reader+"'"),'Volume '+v.n+' listed in catalog');
 const js=[...reader.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)].map(m=>m[1]).find(s=>s.includes('function parseText(raw)'));
 assert.ok(js,'Inline reader script Volume '+v.n);
 new vm.Script(js,{filename:v.reader});
 const env={};
 vm.runInNewContext(js.slice(js.indexOf('let illustrationCaptions='),js.indexOf('function stop()')),env);
 const sections=env.parseText(original);
 assert.equal(sections.length,v.sections,'Complete chapters and endmatter Volume '+v.n);
 assert.equal(vm.runInNewContext('illustrationCaptions.length',env),v.images,'Each original illustration associated with its passage Volume '+v.n);
 const pages=env.paginate(sections);
 assert.ok(pages.length>=v.minimumPages,'Complete book paginated Volume '+v.n+' ('+pages.length+' pages)');
 assert.equal(pages.at(-1).section,v.sections-1,'Correct final section Volume '+v.n);
 const allPages=pages.flatMap(p=>p.paragraphs);
 const artworks=allPages.filter(p=>/^@@OUTLINE_IMAGE_\d+@@$/.test(p));
 assert.equal(artworks.length,v.images,'All 1920 illustrations appear on reading pages Volume '+v.n);
 assert.equal(new Set(artworks).size,v.images,'No illustration omitted or duplicated Volume '+v.n);
 if(v.n===1){
  assert.match(original,/^INTRODUCTION$/m,'Original introduction');
  assert.ok(sections[1].name.includes('Book 1 · Chapter 1'),'Book I begins with chapter I');
  assert.ok(sections.at(-1).name.includes('Chapter 31'),'First volume ends with chapter XXXI');
 }else{
  assert.deepEqual(sections.slice(-3).map(s=>s.name),['Original Time Charts & Chronology','Original Index & Pronunciation Guide','Footnotes & Editorial Corrections'],'All original end matter');
  assert.ok(sections[1].name.includes('Book 6 · Chapter 32'),'Volume II continues book VI');
  assert.ok(sections[10].name.includes('Book 9 · Chapter 41'),'Volume II ends with book IX');
  assert.match(original,/^FOOTNOTES:$/m,'Original footnotes');
  assert.match(original,/^INDEX$/m,'Original index');
  assert.match(original,/^CHRONOLOGICAL TABLE$/m,'Original chronology');
 }
 console.log('Outline of History Volume '+v.n+': '+v.chapters+' original chapters, '+v.images+' maps/drawings, '+pages.length+' pages, '+wc+' words.');
}
assert.ok(combinedWordCount>460000,'Both volumes contain over 460,000 original words');
console.log('The Outline of History: all 41 chapters, nine books, two volumes, 210 original illustrations and references preserved.');
