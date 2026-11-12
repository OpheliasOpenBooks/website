/* Complete-public-domain-edition and actual-reader audit for Conrad.
 * Run: node tests/heart-of-darkness.test.cjs
 */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const t=fs.readFileSync(path.join(root,'public/books/heart-of-darkness-conrad-1902.txt'),'utf8');
const h=fs.readFileSync(path.join(root,'heart-of-darkness.html'),'utf8');
const js=[...h.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)].map(m=>m[1]).find(s=>s.includes('function parseText(raw)'));
assert.ok(js,'Expected complete reader JavaScript');
new vm.Script(js,{filename:'heart-of-darkness.html'});
const a=js.indexOf('function parseText(raw){'),b=js.indexOf('function stop(){',a);
assert.ok(a>=0&&b>a,'Full section parser and paginator required');
const sandbox={};
vm.runInNewContext(js.slice(a,b),sandbox);
const sections=sandbox.parseText(t);
const pages=sandbox.paginate(sections);
assert.equal(sections.length,4,'Title page and all three original parts');
assert.deepEqual(sections.map(s=>s.name).slice(1).join('|'),'Part I|Part II|Part III');
assert.ok(t.match(/\S+/g).length>37000,'Complete English novella');
assert.ok(sections[1].paragraphs.join(' ').includes('The Nellie, a cruising yawl'));
assert.ok(sections[3].paragraphs.join(' ').includes('The horror! The horror!'));
assert.ok(sections.at(-1).paragraphs.at(-1).endsWith('heart of an immense darkness.'));
assert.ok(pages.length>=100,'Book fully paginated');
assert.ok(h.includes('OpheliaNarration.speechChunks(text)'),'Shared grammatical sentence handling');
assert.ok(h.includes('OpheliaNarration.speakWithPauses(synth,speechQueue'),'Shared deliberate pauses');
assert.ok(h.includes('public/js/ophelia-share.js'),'Literary sharing preserved');
assert.ok(h.includes('ophelia-heart-of-darkness-conrad-1902-alice-voice-v1'),'Independent bookmark/progress');
console.log('Heart of Darkness verified: all 3 parts, '+t.match(/\S+/g).length+' words, '+pages.length+' pages.');
