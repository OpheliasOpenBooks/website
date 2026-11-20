const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const cleanup=require('../public/js/strickland-text-cleanup.js');
const base=path.resolve(__dirname,'../public/books/lives-of-the-queens-of-england');
const manifest=JSON.parse(fs.readFileSync(path.join(base,'manifest.json'),'utf8'));
const samples=[
 ['<36610716000011',true],
 ['Bayer. Staatsbibliothek',true],
 ['+',true],
 ['NOT TO BE ISSUED OUT OF THE LIBRARY.',true],
 ['MATILDA OF SCOTLAND. 188',true],
 ['188 MATILDA OF SCOTLAND.',true],
 ['PREFACE. xi',true],
 ['ELIZABETH. 3',true],
 ['2 BERENGARIA OF NAVARRE.',true],
 ['VOL. VIII. B',true],
 ['B2',true],
 ['CHAPTER I.',false],
 ['BERENGARIA OF NAVARRE,',false],
 ['It was on a Friday in February.',false]
];
for(const [txt,expected] of samples)assert.equal(cleanup.furniture(txt),expected,txt);
assert.equal(cleanup.tidy('She re- turned to the royal court.'),'She returned to the royal court.');
assert.equal(cleanup.tidy('The glittering rooms | of the palace'),'The glittering rooms of the palace');
const firstMarkers=[
 'PREFACE.','BERENGARIA OF NAVARRE,','PREFACE.','PREFACE.',
 '_KATHARINE PARR,','NOTICE TO THE READER.','ELIZABETH',
 '"HENRIETTA MARIA,','PREFACE.','MARY BEATRICE OF MODENA,','MARY II.','PREFACE.'
];
let rawCount=0,cleanCount=0,removed=0;
for(const info of manifest.parts){
 const item=JSON.parse(fs.readFileSync(path.join(base,info.file),'utf8'));
 const isFirst=manifest.parts.find(x=>x.volume===info.volume).part===info.part;
 const before=item.sections.flatMap(s=>s.paragraphs);
 if(isFirst){
  const expected=firstMarkers[info.volume-1];
  const marker=cleanup.starts[info.volume];
  assert.ok(before.some(p=>marker.test(p.trim().replace(/^[_"'‘’“”\s]+/,'').replace(/["'‘’“”\s]+$/,'').trim())), 'Opening marker present for volume '+info.volume+': '+expected);
 }
 const after=cleanup.cleanedSections(item.sections,item.volume,isFirst);
 assert.ok(after.length>0,'Text not blank: part '+info.part);
 const keep=after.flatMap(x=>x.paragraphs);
 assert.ok(keep.length>0,'No empty reading parts');
 assert.ok(keep.every(p=>!cleanup.furniture(p)), 'All printed scanner artifacts suppressed in part '+info.part);
 const originalWords=(before.join(' ').match(/\S+/g)||[]).length;
 const displayedWords=(keep.join(' ').match(/\S+/g)||[]).length;
 assert.ok(displayedWords>originalWords*.55,'Too much legitimate prose dropped in part '+info.part);
 if(isFirst){
  assert.ok(!keep.slice(0,10).join(' ').includes('Digitized with financial assistance'),'Modern scan credits should be hidden');
  console.log('Volume',info.volume,'begins:',JSON.stringify(keep[0].slice(0,115)));
 }
 rawCount+=originalWords;cleanCount+=displayedWords;
 removed+=before.length-keep.length;
}
assert.equal(manifest.originalVolumes.length,12);
assert.equal(manifest.parts.length,361);
assert.ok(cleanCount>1500000);
const reader=fs.readFileSync(path.resolve(__dirname,'../lives-of-the-queens-of-england.html'),'utf8');
assert.match(reader,/strickland-text-cleanup\.js\?v=1/);
assert.match(reader,/StricklandCleanup\.cleanedSections/);
assert.match(reader,/OpheliaNarration\.speakWithPauses/);
console.log('PASS all',manifest.parts.length,'reading parts across 12 volumes. Words before/after:',rawCount,cleanCount,'paragraphs filtered:',removed);
