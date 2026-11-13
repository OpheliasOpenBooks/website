/* Validate all three locally hosted complete volumes of Karl Marx's Capital.
 * Run: node tests/capital-volumes.test.cjs
 */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const config=[{v:1,parts:4,chapters:33,sections:35,minWords:270000},
{v:2,parts:3,chapters:21,sections:22,minWords:140000},
{v:3,parts:5,chapters:52,sections:54,minWords:220000}];
for(const c of config){
 const html=fs.readFileSync(path.join(root,'capital-volume-'+c.v+'.html'),'utf8');
 assert.ok(html.includes('ophelia-narration.js?v=1.4.0'),'shared speech engine');
 assert.ok(html.includes('public/js/ophelia-share.js'),'literary share control');
 const js=[...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)].map(m=>m[1]).find(s=>s.includes('function parseText(items)'));
 assert.ok(js,'reader script must exist');
 new vm.Script(js,{filename:'capital-volume-'+c.v+'.html'});
 const start=js.indexOf('const EXPECTED_CHAPTERS'),end=js.indexOf('function stop()',start);
 assert.ok(start>=0&&end>start,'original parser must be present');
 const ctx={};vm.runInNewContext(js.slice(start,end),ctx);
 const items=[];
 for(let part=1;part<=c.parts;part++){
  const filename='public/books/capital-volume-'+c.v+'-part-'+part+'.json';
  assert.ok(html.includes("capital-volume-"+c.v+"-part-"),'uses local source sections');
  const entries=JSON.parse(fs.readFileSync(path.join(root,filename),'utf8'));
  assert.ok(entries.length>0);
  items.push(...entries);
 }
 const sections=ctx.parseText(items),pages=ctx.paginate(sections);
 assert.equal(sections.length,c.sections,'all original sections');
 assert.equal(sections.filter(s=>s.chapterNum).length,c.chapters,'every numbered chapter');
 assert.ok(pages.length>220,'complete paginated book');
 const wordCount=sections.reduce((n,s)=>n+s.paragraphs.join(' ').split(/\s+/).length,0);
 assert.ok(wordCount>c.minWords,'complete text word count');
 assert.ok(sections.every(s=>s.paragraphs.length>0),'no empty section');
 if(c.v===1)assert.match(sections.at(-1).name,/Appendix/);
 if(c.v===3)assert.match(sections.at(-1).name,/Supplement/);
 console.log('Capital vol '+c.v+': '+c.chapters+' chapters, '+pages.length+' pages, '+wordCount+' words verified.');
}
