/* Verify all twelve original Strickland volume transcriptions remain
 * locally hosted with complete words and correct volume ordering.
 * Source OCR may have historic scanning defects, disclosed on the reader.
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const crypto=require('node:crypto');
const base=path.resolve(__dirname,'../public/books/lives-of-the-queens-of-england');
const manifest=JSON.parse(fs.readFileSync(path.join(base,'manifest.json'),'utf8'));
assert.equal(manifest.title,'Lives of the Queens of England');
assert.equal(manifest.author,'Agnes Strickland');
assert.equal(manifest.originalVolumes.length,12);
assert.ok(manifest.parts.length>=100,'all original volumes need full-length reading sections');
assert.ok(manifest.wordCount>=650000,'historical series appears incomplete');
assert.match(manifest.originalTextType,/OCR/);
let total=0,partIndex=0;
for(const vol of manifest.originalVolumes){
 const volParts=manifest.parts.filter(p=>p.volume===vol.volume);
 assert.ok(volParts.length>=5,'missing volume '+vol.roman);
 assert.equal(volParts.length,vol.parts);
 const content=[];
 let volumeWords=0;
 for(const record of volParts){
  assert.equal(record.part,++partIndex);
  assert.equal(record.source,vol.source);
  const x=JSON.parse(fs.readFileSync(path.join(base,record.file),'utf8'));
  assert.equal(x.title,'Lives of the Queens of England');
  assert.equal(x.author,'Agnes Strickland');
  assert.equal(x.part,record.part);
  assert.equal(x.partCount,manifest.parts.length);
  assert.equal(x.volume,vol.volume);
  assert.equal(x.sections.length,record.sections);
  const paragraphs=x.sections.flatMap(s=>s.paragraphs);
  assert.ok(paragraphs.length>0&&paragraphs.every(p=>typeof p==='string'&&p.trim()));
  const words=(paragraphs.join(' ').match(/\S+/g)||[]).length;
  assert.equal(words,record.words);
  volumeWords+=words;
  content.push(...paragraphs);
 }
 assert.equal(volumeWords,vol.words);
 assert.equal(crypto.createHash('sha256').update(content.join('\n\n')).digest('hex'),vol.sha256,'lossless sourced OCR in volume '+vol.roman);
 total+=volumeWords;
}
assert.equal(total,manifest.wordCount);
assert.equal(partIndex,manifest.parts.length);
const reader=fs.readFileSync(path.resolve(__dirname,'../lives-of-the-queens-of-england.html'),'utf8');
assert.match(reader,/public\/js\/ophelia-narration\.js/);
assert.match(reader,/OpheliaNarration\.speechChunks/);
assert.match(reader,/OpheliaNarration\.speakWithPauses/);
assert.match(reader,/volumeGroups/);
assert.match(reader,/optgroup/);
assert.match(reader,/OCR/);
const inline=reader.match(/<script>\s*([\s\S]*?)<\/script>/);
assert.ok(inline);
new vm.Script(inline[1]);
const home=fs.readFileSync(path.resolve(__dirname,'../index.html'),'utf8');
assert.ok(home.includes('href="lives-of-the-queens-of-england.html"'));
const cover=fs.statSync(path.resolve(__dirname,'../public/art/strickland-queens-1840-cover.jpg'));
assert.ok(cover.size>3500);
console.log('Strickland original series VERIFIED:',manifest.originalVolumes.length,'volumes;',manifest.parts.length,'hosted reading parts;',manifest.wordCount,'source-preserved OCR words.');
