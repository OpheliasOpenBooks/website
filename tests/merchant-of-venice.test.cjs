/* Full-text and reader regression test for Shakespeare's The Merchant of Venice. */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const text=fs.readFileSync(path.join(root,'public/books/merchant-of-venice-shakespeare-oxford.txt'),'utf8');
const html=fs.readFileSync(path.join(root,'merchant-of-venice.html'),'utf8');
assert.match(text,/^THE MERCHANT OF VENICE\n/m,'Original Shakespeare play title');
assert.match(text,/^DRAMATIS PERSONAE$/m,'Original character list');
const acts=[...text.matchAll(/^ACT (1|2|3|4|V)\.\s*$/gm)];
assert.equal(acts.map(m=>m[1]).join(','),'1,2,3,4,V','Five acts in sequence');
const expected=[3,9,5,2,1];
for(let i=0;i<5;i++){
 const t=text.slice(acts[i].index+acts[i][0].length,acts[i+1]?.index??text.length);
 const scenes=[...t.matchAll(/^SCENE\s+(I|II|[2-9])\.[^\n]*$/gm)];
 assert.equal(scenes.length,expected[i],'Complete scene count in act '+(i+1));
}
assert.ok((text.match(/\S+/g)||[]).length>21500,'Complete unabridged manuscript');
assert.match(text,/So sore as keeping safe Nerissa's ring\./,'Original final speech');
assert.match(text,/\[Exeunt\.\]\s*$/,'Original closing stage direction');
assert.ok(html.includes("fetch('public/books/merchant-of-venice-shakespeare-oxford.txt')"),'Locally hosted play');
assert.ok(html.includes('public/js/ophelia-narration.js?v=1.4.0'),'Shared grammatical narration');
assert.ok(html.includes('public/js/ophelia-share.js'),'Literary share control');
assert.ok(html.includes('Edward_Alcock_-_Portia_and_Shylock'),'Public-domain original artwork circa 1778');
assert.ok(html.includes("const STORAGE='ophelia-merchant-of-venice-shakespeare-v1'"),'Independent bookmark key');
const inline=[...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)].map(m=>m[1]).find(s=>s.includes('function parseText(raw)'));
assert.ok(inline,'Reader parser present');
new vm.Script(inline,{filename:'merchant-of-venice.html'});
const ctx={};vm.runInNewContext(inline.slice(inline.indexOf('function parseText(raw)'),inline.indexOf('function stop()')),ctx);
const sections=ctx.parseText(text);
assert.equal(sections.length,21,'Dramatis personae plus all 20 scenes');
const pages=ctx.paginate(sections);
assert.ok(pages.length>=65,'All scenes paginated');
assert.equal(pages[0].section,0,'Introduction starts first');
assert.equal(pages.at(-1).section,20,'Last scene ends last');
const cat=fs.readFileSync(path.join(root,'catalog.html'),'utf8');
assert.ok(cat.includes("href:'merchant-of-venice.html'"),'Searchable catalog entry');
console.log('The Merchant of Venice: 5 acts, 20 scenes, '+pages.length+' reading pages.');
