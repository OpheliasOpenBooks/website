/* Validate complete, unabridged Shakespeare Julius Caesar and illustrated Ophelia reader. */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const text=fs.readFileSync(path.join(root,'public/books/julius-caesar-shakespeare-1522.txt'),'utf8');
const html=fs.readFileSync(path.join(root,'julius-caesar.html'),'utf8');
assert.match(text,/^THE TRAGEDY OF JULIUS CAESAR\n/m,'Shakespeare original title');
assert.match(text,/^Dramatis Personæ$/m,'Complete original character list');
const acts=[...text.matchAll(/^ACT (I|II|III|IV|V)\s*$/gm)];
assert.equal(acts.map(m=>m[1]).join(','),'I,II,III,IV,V','Five original acts in order');
const expected=[3,4,3,3,5];
for(let i=0;i<5;i++){
 const actText=text.slice(acts[i].index+acts[i][0].length,acts[i+1]?.index??text.length);
 const scenes=[...actText.matchAll(/^SCENE\s+(I|II|III|IV|V)\.[^\n]*$/gm)];
 assert.equal(scenes.length,expected[i],'Original scene count in Act '+(i+1));
}
assert.ok((text.match(/\S+/g)||[]).length>20000,'Complete public-domain text');
assert.match(text,/This was the noblest Roman of them all\./,'Original final speech');
assert.match(text,/\[_Exeunt\._\]\s*$/,'Original stage direction ending');
assert.ok(html.includes("fetch('public/books/julius-caesar-shakespeare-1522.txt')"),'Locally hosted text');
assert.ok(html.includes('public/js/ophelia-narration.js?v=1.4.0'),'Shared speech system');
assert.ok(html.includes('public/js/ophelia-share.js'),'Shared illustrated reader widget');
assert.ok(html.includes('Vincenzo_Camuccini_-_La_morte_di_Cesare.jpg'),'Public-domain historical illustration');
assert.ok(html.includes("const STORAGE='ophelia-julius-caesar-shakespeare-v1'"),'Independent saved progress');
const inline=[...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)].map(m=>m[1]).find(s=>s.includes('function parseText(raw)'));
assert.ok(inline,'Reader parser script');
new vm.Script(inline,{filename:'julius-caesar.html'});
const ctx={};
vm.runInNewContext(inline.slice(inline.indexOf('function parseText(raw)'),inline.indexOf('function stop()')),ctx);
const sections=ctx.parseText(text);
assert.equal(sections.length,19,'Character list plus all 18 scenes');
const pages=ctx.paginate(sections);
assert.ok(pages.length>=60,'Complete play is paginated');
assert.equal(pages[0].section,0,'Characters come first');
assert.equal(pages.at(-1).section,18,'Last scene finishes the book');
const catalog=fs.readFileSync(path.join(root,'catalog.html'),'utf8');
assert.ok(catalog.includes("href:'julius-caesar.html'"),'Book listed in catalog');
console.log('Julius Caesar: five acts, 18 complete scenes, '+pages.length+' reader pages.');
