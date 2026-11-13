/* Verify the entire five-part public-domain Forsyte Saga collection and readers. */
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const base=path.resolve(__dirname,'..');
const works=[
 {slug:'the-man-of-property',path:'forsyte-man-of-property.txt',title:'The Man of Property',year:1906,words:100000,sections:33,minPages:240,parts:[9,14,9],end:'And in young Jolyon\'s face he slammed the door.'},
 {slug:'indian-summer-of-a-forsyte',path:'forsyte-indian-summer.txt',title:'Indian Summer of a Forsyte',year:1917,words:17000,sections:5,minPages:38,end:'Summer—summer—summer! The soundless footsteps on the grass! 1917'},
 {slug:'in-chancery',path:'forsyte-in-chancery.txt',title:'In Chancery',year:1920,words:85000,sections:43,minPages:200,parts:[14,14,14],end:'By God! this—this thing was his! By God! this—this thing was his!'},
 {slug:'awakening-forsyte',path:'forsyte-awakening.txt',title:'Awakening',year:1920,words:6500,sections:1,minPages:15,end:'he fell into the dreamless sleep, which rounded off his past.'},
 {slug:'to-let',path:'forsyte-to-let.txt',title:'To Let',year:1921,words:80000,sections:35,minPages:190,parts:[12,11,11],end:'the beauty and the loving in the\nworld!'}
];
const catalog=fs.readFileSync(path.join(base,'catalog.html'),'utf8');
const hub=fs.readFileSync(path.join(base,'the-forsyte-saga.html'),'utf8');
assert.ok(catalog.includes("href:'the-forsyte-saga.html'"),'Complete saga in catalog');
assert.match(hub,/three novels and two connecting interludes/i,'Full collection declared');
assert.match(hub,/Gutenberg.*4397/i,'Original source cited');
let grandWords=0;
for(const [i,w] of works.entries()){
 const source=fs.readFileSync(path.join(base,'public/books',w.path),'utf8');
 const reader=fs.readFileSync(path.join(base,w.slug+'.html'),'utf8');
 const wordCount=(source.match(/\S+/g)||[]).length;grandWords+=wordCount;
 assert.ok(wordCount>w.words,w.title+' unabridged manuscript');
 assert.ok(source.trimEnd().endsWith(w.end),w.title+' original ending');
 assert.ok(!source.includes('*** END OF THIS PROJECT GUTENBERG'),w.title+' no license boilerplate');
 assert.ok(reader.includes("fetch('public/books/"+w.path+"')"),w.title+' hosted locally');
 assert.ok(reader.includes('public/js/ophelia-narration.js?v=1.4.0'),w.title+' established narration');
 assert.ok(reader.includes('public/js/ophelia-share.js'),w.title+' established sharing');
 assert.ok(reader.includes("const STORAGE='ophelia-forsyte-"+w.slug+"-v1'"),w.title+' independent saved progress');
 assert.ok(/(?:titlepage[13]|titlpage2)\.jpg/.test(reader)&&/frontis[123]\.jpg/.test(reader),w.title+' historic illustrations');
 assert.ok(reader.includes('1922')&&reader.includes('gutenberg.org/ebooks/4397'),w.title+' historic source attribution');
 assert.ok(reader.includes('href="the-forsyte-saga.html"'),w.title+' collection navigation');
 assert.ok(hub.includes('href="'+w.slug+'.html"'),w.title+' accessible from the saga');
 assert.ok(catalog.includes("href:'"+w.slug+".html'"),w.title+' listed in catalog');
 const script=[...reader.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)].map(x=>x[1]).find(s=>s.includes('function parseText(raw)'));
 assert.ok(script,w.title+' reader source');
 new vm.Script(script,{filename:w.slug+'.html'});
 const env={};
 vm.runInNewContext(script.slice(script.indexOf('function parseText(raw)'),script.indexOf('function stop()')),env);
 const sections=env.parseText(source);
 assert.equal(sections.length,w.sections,w.title+' all named sections');
 const pages=env.paginate(sections);
 assert.ok(pages.length>=w.minPages,w.title+' complete reading pagination');
 assert.equal(pages.at(-1).section,w.sections-1,w.title+' full last page');
 if(w.parts){
  const count=w.parts.reduce((a,b)=>a+b,0);
  assert.equal(sections.length,count+1,w.title+' exact chapter count');
  const partChapters=sections.slice(1).map(s=>s.name);
  assert.ok(partChapters.every(x=>/Part (I|II|III) · Chapter/.test(x)),w.title+' original part/chapter labels');
 }
 if(w.slug==='indian-summer-of-a-forsyte')assert.ok(sections[4].name==='Section 4','Indian Summer all four sections');
 if(w.slug==='to-let')assert.ok(sections.some(s=>s.name.includes('Chapter 9 — GOYA')),'Unusual ninth chapter heading preserved');
 if(w.slug==='awakening-forsyte')assert.ok(pages.length>=15,'Full-length Awakening interlude');
 console.log(w.title+': '+wordCount+' words, '+sections.length+' sections, '+pages.length+' pages, artwork and navigation OK.');
}
assert.ok(grandWords>300000,'Full original three novels and two interludes preserved');
console.log('The Forsyte Saga: all five complete public-domain works, '+grandWords+' words. Catalog and readers validated.');
