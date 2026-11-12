/* Verify the complete U.S. public-domain Arrowsmith (1925) edition
 * through the actual website reader parser and pagination.
 * Run: node tests/arrowsmith.test.cjs
 */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const book=fs.readFileSync(path.join(root,'public/books/arrowsmith-sinclair-lewis-1925.txt'),'utf8');
const html=fs.readFileSync(path.join(root,'arrowsmith.html'),'utf8');
const scripts=[...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)].map(m=>m[1]);
const js=scripts.find(s=>s.includes('function parseText(raw)'));
assert.ok(js,'Reader must include original chapter parser');
new vm.Script(js,{filename:'arrowsmith.html'});
const start=js.indexOf('function romanToNumber(s)'),end=js.indexOf('function stop()',start);
assert.ok(start>=0&&end>start,'Actual reader parser and paginator must exist');
const context={};
vm.runInNewContext(js.slice(start,end),context);
const sections=context.parseText(book);
const pages=context.paginate(sections);
assert.equal(sections.length,41,'Title matter and all 40 original chapters required');
assert.ok(book.match(/\S+/g).length>160000,'Complete unabridged novel required');
assert.ok(sections[0].paragraphs.join(' ').includes('To Dr. Paul H. DeKruif'),'Original scientific acknowledgment retained');
assert.ok(sections[1].paragraphs.join(' ').includes('The driver of the wagon'),'Authentic opening present');
assert.ok(sections[40].paragraphs.join(' ').includes('Terry Wickett'),'Authentic final chapter present');
assert.equal(sections[40].paragraphs.at(-1),'THE END','Original ending retained');
assert.ok(sections.every(s=>s.paragraphs.length>=8),'No truncated chapters');
assert.ok(pages.length>350,'All original material paginated');
assert.ok(html.includes('OpheliaNarration.speechChunks(text)'),'Shared punctuation-aware text');
assert.ok(html.includes('OpheliaNarration.speakWithPauses(synth,speechQueue'),'Shared timed narration');
assert.ok(html.includes('public/js/ophelia-share.js'),'Literary share UI');
assert.ok(html.includes('ophelia-arrowsmith-lewis-1925-alice-voice-v1'),'Independent local bookmarks and progress');
console.log('Arrowsmith verified: 40 chapters, '+book.match(/\S+/g).length+' words, '+pages.length+' reading pages.');
