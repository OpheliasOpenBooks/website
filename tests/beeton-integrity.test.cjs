/* Lossless archived text and reader-narration smoke checks for Mrs Beeton.
 * The complete Project Gutenberg body must remain locally hosted, with
 * all 44 historical chapters and matching word count, under 111 parts.
 */
const fs=require('node:fs');
const assert=require('node:assert/strict');
const path=require('node:path');
const crypto=require('node:crypto');
const base=path.join(__dirname,'../public/books/mrs-beeton-household-management');
const m=JSON.parse(fs.readFileSync(path.join(base,'manifest.json'),'utf8'));
assert.equal(m.title,'The Book of Household Management');
assert.equal(m.author,'Isabella Beeton');
assert.equal(m.chapterCount,44);
assert.equal(m.parts.length,111);
assert.ok(m.wordCount>500000);
let all=[],total=0,chapters=new Set();
for(let i=0;i<m.parts.length;i++){
 const meta=m.parts[i],file=path.join(base,meta.file);
 const book=JSON.parse(fs.readFileSync(file,'utf8'));
 assert.equal(book.part,i+1);
 assert.equal(book.partCount,m.parts.length);
 assert.equal(book.language,'en');
 assert.equal(book.readOnly,false);
 assert.equal(book.sections.length,meta.sections);
 const words=book.sections.flatMap(s=>s.paragraphs).join(' ').match(/\S+/g)||[];
 assert.equal(words.length,meta.words);
 total+=words.length;
 for(const sec of book.sections){
  if(sec.name.startsWith('Chapter '))chapters.add(sec.name.split(' ')[1]);
  for(const p of sec.paragraphs)all.push(p);
 }
}
assert.equal(total,m.wordCount);
assert.equal(chapters.size,44);
assert.equal(crypto.createHash('sha256').update(all.join('\n\n')).digest('hex'),m.sha256);
assert.match(all[0],/E-text prepared by/);
assert.match(all[1],/THE BOOK OF HOUSEHOLD MANAGEMENT/);
assert.ok(all.at(-1).includes('husband'));
const reader=fs.readFileSync(path.join(__dirname,'../mrs-beetons-book-of-household-management.html'),'utf8');
const home=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8');
assert.match(reader,/public\/js\/ophelia-narration\.js/);
assert.match(reader,/OpheliaNarration\.speechChunks/);
assert.match(reader,/OpheliaNarration\.speakWithPauses/);
assert.match(reader,/BOOK_PATH=n=>/);
assert.match(reader,/manifest\.json/);
assert.match(reader,/E-text prepared by/);
assert.match(reader,/Footnote markers and illustration labels are omitted only from the spoken text/);
assert.ok(home.includes('href="mrs-beetons-book-of-household-management.html"'));
console.log('Mrs Beeton verified:',m.wordCount,'words across',m.parts.length,'complete hosted reading parts and',chapters.size,'chapters.');
