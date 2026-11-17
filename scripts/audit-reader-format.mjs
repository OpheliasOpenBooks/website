// Repository-side static audit of Ophelia's Open Book reading-page consistency.
// Run from repo root: node scripts/audit-reader-format.mjs
import fs from 'node:fs';
const read=p=>fs.readFileSync(p,'utf8');
const catalog=read('catalog.html'),home=read('index.html');
const hrefs=[...catalog.matchAll(/href:'([^']+\.html)'/g)].map(m=>m[1]).concat([...home.matchAll(/href="([\w-]+\.html)"/g)].map(m=>m[1]));
const paths=[...new Set(hrefs)].filter(p=>!['index.html','catalog.html','reader.html','support.html'].includes(p));
const series=new Set(['the-forsyte-saga.html','outline-of-history.html','leatherstocking-tales.html']);
const readOnly=new Set(['king-james-bible-1611.html']);
const studio=new Set(['pride-and-prejudice.html']);
const special=new Set(['grimms-fairy-tales.html','more-grimm-fairy-tales.html']);
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
