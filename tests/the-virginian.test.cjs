/* Verify the complete unabridged Virginian reader and 36 original chapters. */
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const source=fs.readFileSync(path.join(root,'public/books/the-virginian-owen-wister-1902.txt'),'utf8');
const html=fs.readFileSync(path.join(root,'the-virginian.html'),'utf8');
const script=[...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)].map(m=>m[1]).find(s=>s.includes('function parseText(raw)'));
assert.ok(script,'Reader parser missing');new vm.Script(script);
const start=script.indexOf('function romanToNumber(s)'),end=script.indexOf('function stop()',start);
assert.ok(start>=0&&end>start);
const ctx={};vm.runInNewContext(script.slice(start,end),ctx);
const sections=ctx.parseText(source),pages=ctx.paginate(sections);
assert.equal(sections.length,37);
assert.match(sections[0].paragraphs.join(' '),/TO THE READER/);
assert.match(sections[1].name,/ENTER THE MAN/);
assert.match(sections[36].name,/AT DUNBARTON/);
assert.match(sections[36].paragraphs.join(' '),/Their eldest boy rides the horse/);
assert.ok(pages.length>320,'Full-length unabridged reading pages');
console.log('The Virginian: 36 chapters, complete intro, ending, and pagination verified');
