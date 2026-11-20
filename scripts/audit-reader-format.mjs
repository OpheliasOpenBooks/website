// Repository-side static audit of Ophelia's Open Book reading-page consistency.
// Run from repo root: node scripts/audit-reader-format.mjs
import fs from 'node:fs';
const read=p=>fs.readFileSync(p,'utf8');
const catalog=read('catalog.html'),home=read('index.html');
const hrefs=[...catalog.matchAll(/href:'([^']+\.html)'/g)].map(m=>m[1]).concat([...home.matchAll(/href="([\w-]+\.html)"/g)].map(m=>m[1]));
// Non-reader navigational pages may be linked on the home page, but they are not books.
const nonReaders=new Set(['index.html','catalog.html','reader.html','support.html','music.html','get-the-app.html','my-bookshelf.html']);
const paths=[...new Set(hrefs)].filter(p=>!nonReaders.has(p));
const series=new Set(['the-forsyte-saga.html','outline-of-history.html','leatherstocking-tales.html']);
// Original-language companion editions intentionally have no audio or narrator controls.
const readOnly=new Set(['king-james-bible-1611.html','du-contrat-social.html','emile-francais.html','kritik-der-reinen-vernunft-original-deutsch.html','les-liaisons-dangereuses-original-francais.html',
  'les-confessions-rousseau-original-francais.html','vathek-original-francais.html']);
const studio=new Set(['pride-and-prejudice.html']);
const special=new Set(['grimms-fairy-tales.html','more-grimm-fairy-tales.html','andersen-fairy-tales.html']);
const legacy=['the-sun-also-rises.html','to-the-lighthouse.html','the-sound-and-the-fury.html'];
let failed=0,standard=0,exception=0;
for(const p of paths){
 if(!fs.existsSync(p)){console.error('MISSING: '+p);failed++;continue;}
 const s=read(p);
 if(series.has(p)||readOnly.has(p)||studio.has(p)){exception++;continue;}
 const needed=special.has(p)||legacy.includes(p)
   ? ['id="settings-toggle"','id="play"','id="voice"','id="speed"','ophelia-narration.js','ophelia-share.js']
   : ['reading-layout','reader-options','settings-toggle','ophelia-narration.js','ophelia-share.js'];
 const absent=needed.filter(token=>!s.includes(token));
 if(absent.length){console.error('NONSTANDARD: '+p+' missing '+absent.join(', '));failed++;}else standard++;
}
console.log('Audited '+paths.length+' linked pages: '+standard+' reader pages, '+exception+' intentional exceptions, '+failed+' issues.');
if(failed)process.exitCode=1;
