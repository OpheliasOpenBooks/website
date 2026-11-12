/* Verify the complete 1929 A. W. Wheen English translation of Remarque's novel.
 * Run: node tests/all-quiet-on-the-western-front.test.cjs
 */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const book=fs.readFileSync(path.join(root,'public/books/all-quiet-on-the-western-front-remarque-wheen-1929.txt'),'utf8');
const html=fs.readFileSync(path.join(root,'all-quiet-on-the-western-front.html'),'utf8');
const scripts=[...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)].map(m=>m[1]);
const js=scripts.find(s=>s.includes('function parseText(raw)'));
assert.ok(js,'Reader must implement complete chapter validation');
new vm.Script(js,{filename:'all-quiet-on-the-western-front.html'});
const start=js.indexOf('function romanToNumber(s)'),end=js.indexOf('function stop()',start);
assert.ok(start>=0&&end>start,'Original reader parser and paginator must exist');
const context={};
vm.runInNewContext(js.slice(start,end),context);
const sections=context.parseText(book);
const pages=context.paginate(sections);
assert.equal(sections.length,13,'Opening matter and exactly 12 chapters');
assert.ok(book.match(/\S+/g).length>62000,'Complete unabridged original translation');
assert.ok(sections[0].paragraphs.join(' ').includes('A. W. WHEEN'),'Original 1929 translator credited');
assert.ok(sections[1].paragraphs.join(' ').includes('We are at rest five miles behind the front'),'Opening intact');
assert.ok(sections[12].paragraphs.join(' ').includes('He fell in October 1918'),'Original ending intact');
assert.ok(sections.every(s=>s.paragraphs.length>=8),'No missing short chapters');
assert.ok(pages.length>150,'Full text paginates');
assert.ok(html.includes('OpheliaNarration.speechChunks(text)'),'Shared sentence-aware narration');
assert.ok(html.includes('OpheliaNarration.speakWithPauses(synth,speechQueue'),'Shared pause queue');
assert.ok(html.includes('public/js/ophelia-share.js'),'Period share widget');
assert.ok(html.includes('ophelia-all-quiet-on-the-western-front-remarque-wheen-1929-alice-voice-v1'),'Independent saved progress');
console.log('All Quiet on the Western Front verified: 12 chapters, '+book.match(/\S+/g).length+' words and '+pages.length+' pages.');
