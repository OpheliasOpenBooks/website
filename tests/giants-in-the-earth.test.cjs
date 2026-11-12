/* Verify the complete 1927 English edition and test the actual site reader's
 * parser and pagination. Run: node tests/giants-in-the-earth.test.cjs
 */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const book=fs.readFileSync(path.join(root,'public/books/giants-in-the-earth-rolvaag-colcord-1927.txt'),'utf8');
const html=fs.readFileSync(path.join(root,'giants-in-the-earth.html'),'utf8');
const js=[...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)].map(m=>m[1]).find(x=>x.includes('const CHAPTERS='));
assert.ok(js,'Full reading page must contain chapter parsing and navigation');
new vm.Script(js,{filename:'giants-in-the-earth.html'});
const start=js.indexOf('const CHAPTERS=');
const end=js.indexOf('function stop()',start);
assert.ok(start>=0&&end>start,'Parser and paginator must be intact');
const sandbox={};
vm.runInNewContext(js.slice(start,end),sandbox);
const parts=sandbox.parseText(book);
const pages=sandbox.paginate(parts);
assert.equal(parts.length,11,'Original front matter and 10 complete chapters');
assert.ok(book.match(/\S+/g).length>165000,'Entire 1927 book is present');
assert.ok(pages.length>380,'All pages can be navigated');
assert.ok(parts[0].paragraphs.join(' ').includes('FOREWORD'),'Author foreword retained');
assert.ok(parts[0].paragraphs.join(' ').includes('INTRODUCTION'),'Translator introduction retained');
assert.ok(parts[0].paragraphs.join(' ').includes('TO THOSE OF MY PEOPLE'),'Original dedication retained');
assert.equal(parts.filter(p=>/Book 1 · Chapter/.test(p.name)).length,6,'Six chapters of Book I');
assert.equal(parts.filter(p=>/Book 2 · Chapter/.test(p.name)).length,4,'Four chapters of Book II');
assert.ok(parts[7].paragraphs.join(' ').includes('FOUNDING THE KINGDOM'),'Book II title preserved');
assert.ok(parts[10].paragraphs.at(-1).includes('THE END'),'Complete authentic ending preserved');
assert.ok(html.includes('OpheliaNarration.speechChunks(text)'),'Common grammatical pronunciation used');
assert.ok(html.includes('OpheliaNarration.speakWithPauses(synth,speechQueue'),'Common sentence pacing used');
assert.ok(html.includes('public/js/ophelia-share.js'),'Literary sharing preserved');
console.log('Giants in the Earth passes: 2 books, 10 original chapters, '+pages.length+' pages.');
