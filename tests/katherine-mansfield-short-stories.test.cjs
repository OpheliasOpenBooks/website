/* Validate Mansfield's three complete original public-domain collections.
 * Run: node tests/katherine-mansfield-short-stories.test.cjs
 */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const books=[
 {id:'pension',year:1911,slug:'in-a-german-pension',count:13,minWords:29000},
 {id:'bliss',year:1920,slug:'bliss-and-other-stories',count:14,minWords:65000},
 {id:'garden',year:1922,slug:'the-garden-party-and-other-stories',count:15,minWords:55000}
];
for(const b of books){
 const source=JSON.parse(fs.readFileSync(path.join(root,'public/books/mansfield-'+b.id+'-'+b.year+'.json'),'utf8'));
 const html=fs.readFileSync(path.join(root,'mansfield-'+b.slug+'.html'),'utf8');
 assert.equal(source.length,b.count+1,'Original front matter plus all stories');
 const front=source[0].text;
 if(b.id==='garden'){
  for(let i=1;i<source.length;i++){
   assert.doesNotMatch(source[i].text,/Chapter\s+\d+\.[IVXLCDM]+\./,'No fabricated chapter-and-Roman headings');
   assert.doesNotMatch(source[i].text,new RegExp('^'+i+'\\.\\s+'),'No duplicate numbered story headings');
  }
  assert.ok(html.includes('/^[IVXLCDM]+\\.?$/'),'Reader recognizes period-terminated Roman section headings');
 }
 assert.match(front,/CONTENTS/i,'Original table of contents');
 for(let i=0;i<b.count;i++){
  assert.match(source[i+1].name,new RegExp('^Story '+(i+1)+': '),'Sequential story headings');
  assert.ok(source[i+1].text.length>=400,'Each story must be present');
 }
 const wordCount=source.reduce((sum,s)=>sum+(s.text.match(/\S+/g)||[]).length,0);
 assert.ok(wordCount>b.minWords,'Complete original book word count');
 assert.ok(html.includes('public/js/ophelia-narration.js?v=1.2.0'),'Shared grammatical narration');
 assert.ok(html.includes('public/js/ophelia-share.js'),'Literary share component');
 const inline=[...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)].map(m=>m[1]).find(s=>s.includes('function parseText(raw)'));
 assert.ok(inline,'Reader parser exists');
 new vm.Script(inline,{filename:b.slug+'.html'});
 const start=inline.indexOf('function parseText(raw)'),end=inline.indexOf('function stop()',start);
 assert.ok(end>start,'Parser and pagination found');
 const context={};vm.runInNewContext(inline.slice(start,end),context);
 const sections=context.parseText(JSON.stringify(source));
 const pages=context.paginate(sections);
 assert.equal(sections.length,b.count+1,'All stories exposed to reader');
 assert.ok(pages.length>b.count*4,'Full text paginated, not short excerpts');
 const catalog=fs.readFileSync(path.join(root,'catalog.html'),'utf8');
 assert.ok(catalog.includes('mansfield-'+b.slug+'.html'),'Searchable catalog entry');
 const home=fs.readFileSync(path.join(root,'index.html'),'utf8');
 assert.ok(!home.includes('href="mansfield-'+b.slug+'.html"'),'Homepage unchanged');
 console.log(b.slug+': '+b.count+' stories, '+wordCount+' words, '+pages.length+' reading pages.');
}
