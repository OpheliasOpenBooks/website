#!/usr/bin/env node
// Import two complete public-domain animal-care classics to Ophelia's own hosted readers.
// No external ebook is requested when a visitor opens either book page.
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';

const works = [
  {
    slug: 'my-dog-and-i', title: 'My Dog and I', author: 'Harry Woodworth Huntington',
    id: 73034, year: 1897, minWords: 17000,
    fallback: 'https://raw.githubusercontent.com/GITenberg/My-dog-and-I-b-Being-a-concise-treatise-of-the-various-breeds-of-dogs-their-origins-and-uses-__73034/master/73034-0.txt',
    file: 'my-dog-and-i.html',
    cover: 'https://www.gutenberg.org/cache/epub/73034/images/illus002.jpg',
    card: 'A charming 1897 guide to dog breeds and companionship, illustrated with period portraits and revealing how Victorian owners cared for their dogs.'
  },
  {
    slug: 'the-book-of-the-cat', title: 'The Book of the Cat', author: 'Frances Simpson',
    id: 76311, year: 1903, minWords: 40000,
    file: 'the-book-of-the-cat.html',
    cover: 'https://archive.org/services/img/bookofcatsimpson00simprich',
    card: 'An exquisitely illustrated Edwardian encyclopedia of cats, their history, breeds, characters, and place in the home.'
  }
];
const countWords = s => (s.match(/\S+/g) || []).length;
function stripSource(raw) {
  const s = raw.replace(/^\uFEFF/, '').replace(/\r\n?/g, '\n');
  const start = /\*{3}\s*START OF (?:THE|THIS) PROJECT GUTENBERG EBOOK[^\n]*\*{3}/i.exec(s);
  const end = /\*{3}\s*END OF (?:THE|THIS) PROJECT GUTENBERG EBOOK[^\n]*\*{3}/i.exec(s);
  if (!start || !end || end.index <= start.index + 80000) throw new Error('Complete Gutenberg book boundaries not found');
  return s.slice(start.index + start[0].length, end.index).trim();
}
async function getSource(work) {
  const urls = [
    'https://www.gutenberg.org/cache/epub/' + work.id + '/pg' + work.id + '.txt',
    'https://www.gutenberg.org/files/' + work.id + '/' + work.id + '-0.txt',
    'https://gutenberg.pglaf.org/cache/epub/' + work.id + '/pg' + work.id + '.txt',
    ...(work.fallback ? [work.fallback] : [])
  ];
  for (const url of urls) {
    try {
      const response = await fetch(url, {
        headers: { 'User-Agent': 'OpheliasOpenBook/1.0 (historic public-domain text)' },
        signal: AbortSignal.timeout(80000)
      });
      if (!response.ok) throw Error('HTTP ' + response.status);
      const bytes = Buffer.from(await response.arrayBuffer());
      if (bytes.length < work.minWords * 4 || bytes.length > 8000000) throw Error('Unexpected file length ' + bytes.length);
      const text = stripSource(new TextDecoder('utf-8').decode(bytes));
      if (countWords(text) < work.minWords) throw Error('Incomplete text, only ' + countWords(text) + ' words');
      // Historic title pages often split a title over multiple lines and ornaments.
      const lead = text.slice(0, 30000).toUpperCase().replace(/\\s+/g, ' ');
      const title = work.title.toUpperCase();
      if (!lead.includes(title) && !(lead.includes(work.author.toUpperCase()) && lead.includes(work.slug === 'my-dog-and-i' ? 'DOG' : 'BOOK OF THE CAT')))
        throw Error('Wrong title or author in text source');
      console.log('Verified ' + work.title + ': ' + countWords(text) + ' words from ' + url);
      return {text, url};
    } catch (error) { console.warn('Trying next source for ' + work.title + ': ' + error.message); }
  }
  throw Error('Unable to obtain and verify complete public-domain text for ' + work.title);
}
function identifyHeading(p) {
  const s = p.replace(/\s+/g, ' ').trim();
  if (s.length > 115) return null;
  if (/^(PREFACE|INTRODUCTION|DEDICATION|CONTENTS|INDEX|LIST OF ILLUSTRATIONS)\.?$/i.test(s)) return s;
  const m = /^CHAPTER\s+([IVXLCDM]+|\d+)\.?\s*(.*)$/i.exec(s);
  if (m) return 'Chapter ' + m[1] + (m[2] ? ' · ' + m[2] : '');
  if (s.length > 5 && s.length <= 60 && /^[A-Z][A-Z0-9 ,'.—–:-]+$/.test(s) && /[A-Z]{4}/.test(s))
    return s.replace(/[. ]+$/, '');
  return null;
}
function divide(work, raw) {
  const paras = raw.split(/\n\s*\n+/).map(p => p.trim().replace(/\[(?:\d{1,3}|[*†‡])\]/g, '').trim())
    .filter(p => p && !/^\[(?:Illustration|Decoration|Page [^\]]+)\]$/i.test(p));
  if (paras.length < 100) throw Error('Suspiciously few paragraphs');
  const parts = []; let sections = [], current = 'Opening pages', words = 0;
  function flush() {
    if (!sections.length) return;
    const sum = sections.reduce((n,section) => n + countWords(section.paragraphs.join(' ')), 0);
    parts.push({part:parts.length+1, name:sections.find(s => /^Chapter\s/i.test(s.name))?.name || sections[0].name, sections, words:sum});
    sections=[]; words=0;
  }
  for (const p of paras) {
    const heading = identifyHeading(p);
    if (heading) current=heading;
    const n = countWords(p);
    if (words >= 3500 && words+n > 4700) flush();
    let section=sections[sections.length-1];
    if (!section || section.name!==current) {
      section={name:current,paragraphs:[]};
      sections.push(section);
    }
    section.paragraphs.push(p);
    words+=n;
  }
  flush();
  const rebuilt=parts.flatMap(part=>part.sections.flatMap(section=>section.paragraphs)).join('\n\n');
  if (rebuilt!==paras.join('\n\n')) throw Error('Text reconstruction lost material');
  const wordCount = countWords(rebuilt);
  if (wordCount < work.minWords || parts.length < 4) throw Error('Text completeness check failed for ' + work.title);
  return {parts,wordCount,sha256:createHash('sha256').update(rebuilt).digest('hex')};
}
function save(work, source) {
  const parsed = divide(work, source.text);
  const dir = 'public/books/' + work.slug;
  fs.mkdirSync(dir,{recursive:true});
  const entries = parsed.parts.map(part=>{
    const file='part-'+String(part.part).padStart(3,'0')+'.json';
    fs.writeFileSync(path.join(dir,file),JSON.stringify({
      title:work.title, author:work.author, language:'en', readOnly:false,
      part:part.part, partCount:parsed.parts.length, sections:part.sections
    }));
    return {part:part.part,name:part.name,words:part.words,sections:part.sections.length,file};
  });
  const manifest={
    title:work.title,author:work.author,firstPublished:work.year,
    projectGutenberg:'https://www.gutenberg.org/ebooks/'+work.id,source:source.url,
    wordCount:parsed.wordCount,sha256:parsed.sha256,parts:entries
  };
  fs.writeFileSync(path.join(dir,'manifest.json'),JSON.stringify(manifest,null,2)+'\n');
  if (entries.reduce((n,p)=>n+p.words,0)!==parsed.wordCount) throw Error('Parts failed word count validation');
  console.log('Saved complete hosted ' + work.title + ': ' + parsed.parts.length + ' reading parts');
}
function register() {
  const filename='index.html'; let html=fs.readFileSync(filename,'utf-8');
  const marker='<section class="wrap section" id="books">';
  const at=html.indexOf(marker);
  if (at<0) throw Error('Book section missing from homepage');
  const insertion=at+marker.length;
  const cards=works.filter(w=>!html.includes('href="'+w.file+'"')).map(w=>
    '<article class="book"><img src="'+w.cover+'" alt="Historical '+w.year+' edition artwork for '+w.title+'" width="640" height="340" loading="lazy" style="object-fit:contain;background:#f3ebde"><div><span class="pill">New · Historic animal care</span><h3>'+w.title+'</h3><div class="eyebrow">'+w.author+' · '+w.year+'</div><p>'+w.card+'</p><p class="fine">Historical veterinary remedies are not modern medical advice. For sick or injured animals, contact a veterinarian.</p><a class="button" href="'+w.file+'">Read &amp; Listen &nbsp; →</a></div></article>').join('\n');
  if(cards){html=html.slice(0,insertion)+'\n'+cards+'\n'+html.slice(insertion);fs.writeFileSync(filename,html);}
  console.log('Catalogued both hosted historic animal-care titles.');
}
for (const work of works) save(work,await getSource(work));
register();
console.log('SUCCESS: Both complete public-domain texts hosted with locally readable manifests.');
