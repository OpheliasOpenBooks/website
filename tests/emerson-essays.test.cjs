'use strict';
/* Verify both complete original Emerson volumes are successfully parsed and
 * paginated by the actual on-site reader code, with no truncated essays.
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.resolve(__dirname,'..');
for(const v of [
 {page:'essays-first-series.html',book:'essays-first-series-emerson-1841.txt',count:12,words:73000,last:'ART'},
 {page:'essays-second-series.html',book:'essays-second-series-emerson-1844.txt',count:9,words:58000,last:'NEW ENGLAND REFORMERS'}
]){
 const html=fs.readFileSync(path.join(root,v.page),'utf8');
 const t=fs.readFileSync(path.join(root,'public/books',v.book),'utf8');
 const scripts=[...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)].map(m=>m[1]);
 const js=scripts.find(x=>x.includes('const ESSAY_NAMES='));
 assert.ok(js,'actual reader script must be present: '+v.page);
 new vm.Script(js,{filename:v.page});
 const from=js.indexOf('const ESSAY_NAMES='),to=js.indexOf('function stop()',from);
 assert.ok(from>=0&&to>from,'parser and paginator must both exist');
 const ctx={};vm.runInNewContext(js.slice(from,to),ctx);
 const sections=ctx.parseText(t),pages=ctx.paginate(sections);
 assert.equal(sections.length,v.count+1,'complete chapters for '+v.page);
 assert.ok(t.split(/\s+/).length>v.words,'complete source word count for '+v.page);
 assert.ok(pages.length>120,'sufficient original pages for '+v.page);
 assert.ok(sections[1].name.startsWith('Essay 1'));
 assert.ok(sections.at(-1).name.toUpperCase().includes(v.last));
 assert.ok(sections.every(p=>p.paragraphs.length>1),'no empty essays');
 const last=sections.at(-1).paragraphs.at(-1);
 assert.ok(last.length>40,'last essay must end with full prose');
 assert.ok(html.includes("OpheliaNarration.speakWithPauses"),'library narration must be shared');
 console.log(v.page+': '+v.count+' complete essays, '+pages.length+' pages verified');
}
