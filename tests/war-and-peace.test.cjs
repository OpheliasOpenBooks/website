/* Verify full U.S. public-domain Maude translation of Tolstoy's War and Peace.
 * Run: node tests/war-and-peace.test.cjs
 */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const book=fs.readFileSync(path.join(root,'public/books/war-and-peace-tolstoy-maude-complete.txt'),'utf8');
const html=fs.readFileSync(path.join(root,'war-and-peace.html'),'utf8');
const scripts=[...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)].map(m=>m[1]);
const js=scripts.find(s=>s.includes('function parseText(raw)'));
assert.ok(js,'Reader needs its complete source parser');
new vm.Script(js,{filename:'war-and-peace.html'});
const begin=js.indexOf('function romanToNumber(s)'),end=js.indexOf('function stop()',begin);
assert.ok(begin>=0&&end>begin,'Reader must contain parser and pagination');
const ctx={};
vm.runInNewContext(js.slice(begin,end),ctx);
const sections=ctx.parseText(book);
const pages=ctx.paginate(sections);
const expected=[28,21,19,16,22,26,13,22,23,39,34,16,19,19,20,16,12];
assert.equal(sections.length,366,'Title and all 365 chapters');
assert.ok(book.match(/\S+/g).length>550000,'Complete unabridged translation');
assert.ok(sections[0].paragraphs.join(' ').includes('Louise and Aylmer Maude'),'Full translator credits');
assert.ok(sections[1].paragraphs[0].includes('Well, Prince'),'Original opening');
assert.ok(sections.at(-1).name.startsWith('Second Epilogue · Chapter 12'),'Final epilogue intact');
assert.ok(sections.at(-1).paragraphs.at(-1).endsWith('to recognize a dependence of which we are not conscious.'),'Authentic concluding argument');
assert.ok(pages.length>1400,'Complete large novel is paginated');
let at=1;
for(const [i,n] of expected.entries()){
  const label=i<15?'Book '+['One','Two','Three','Four','Five','Six','Seven','Eight','Nine','Ten','Eleven','Twelve','Thirteen','Fourteen','Fifteen'][i]:i===15?'First Epilogue':'Second Epilogue';
  assert.ok(sections[at].name.startsWith(label),'Book/epilogue section '+i);
  at+=n;
}
assert.equal(at,366,'365 chapters across 17 sections');
assert.ok(html.includes('OpheliaNarration.speechChunks(text)'),'Shared language-aware narration');
assert.ok(html.includes('OpheliaNarration.speakWithPauses(synth,speechQueue'),'Shared speaking pauses');
assert.ok(html.includes('public/js/ophelia-share.js'),'Consistent vintage sharing');
assert.ok(html.includes('ophelia-war-and-peace-tolstoy-maude-full-alice-voice-v1'),'Independent saved progress');
assert.ok(html.includes('1873'),'Historical art credit');
console.log('War and Peace complete: '+sections.length+' entries including title, '+book.match(/\S+/g).length+' words, '+pages.length+' pages.');
