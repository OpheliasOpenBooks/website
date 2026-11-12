/* Verify complete public-domain Vanity Fair (1847–1848) and the real page parser.
 * Run: node tests/vanity-fair.test.cjs
 */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const book=fs.readFileSync(path.join(root,'public/books/vanity-fair-william-makepeace-thackeray-1848.txt'),'utf8');
const html=fs.readFileSync(path.join(root,'vanity-fair.html'),'utf8');
const js=[...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)].map(m=>m[1]).find(s=>s.includes('function parseText(raw)'));
assert.ok(js,'Vanity Fair must include its original reader chapter parser');
new vm.Script(js,{filename:'vanity-fair.html'});
const begin=js.indexOf('function romanToNumber(s)'),end=js.indexOf('function stop()',begin);
assert.ok(begin>=0&&end>begin,'Reader parser and pagination functions must exist');
const context={};
vm.runInNewContext(js.slice(begin,end),context);
const sections=context.parseText(book);
const pages=context.paginate(sections);
assert.equal(sections.length,68,'Introduction plus all 67 numbered chapters');
assert.ok(book.match(/\S+/g).length>300000,'Complete original novel');
assert.ok(sections[0].paragraphs.join(' ').includes('BEFORE THE CURTAIN'),'Original introductory essay');
assert.ok(sections[0].paragraphs.join(' ').includes('LONDON, June 28, 1848'),'Original author date');
assert.ok(sections[1].paragraphs.join(' ').includes("Miss Pinkerton's academy"),'Original opening chapter');
assert.ok(sections[67].paragraphs.join(' ').includes('Vanitas Vanitatum'),'Original ending');
assert.ok(sections.every(s=>s.paragraphs.length>=12),'All chapters have complete content');
assert.ok(pages.length>750,'Novel spans expected number of reading pages');
assert.ok(html.includes('OpheliaNarration.speechChunks(text)'),'Grammar-aware narration');
assert.ok(html.includes('OpheliaNarration.speakWithPauses(synth,speechQueue'),'Shared timed pauses');
assert.ok(html.includes('public/js/ophelia-share.js'),'Elegant sharing');
assert.ok(html.includes('ophelia-vanity-fair-thackeray-1848-alice-voice-v1'),'Independent reading progress');
assert.ok(html.includes('Houghton Library'),'Original drawing credited');
console.log('Vanity Fair verified: '+sections.length+' sections, '+book.match(/\S+/g).length+' words, '+pages.length+' reading pages.');
