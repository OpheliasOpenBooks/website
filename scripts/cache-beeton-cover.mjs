#!/usr/bin/env node
// Cache the public-domain 1861 illustrated title page of Beeton's original
// edition locally, so reader and catalog do not depend on a remote image.
import fs from 'node:fs';
const file='Mrs_Beeton_1861_title_page_full_colour.jpg';
const path='public/art/mrs-beeton-1861-title-page.jpg';
const master='upload.wikimedia.org/wikipedia/commons/4/42/'+file;
const sources=[
 'https://wsrv.nl/?url='+master+'&w=650&output=jpg',
 'https://images.weserv.nl/?url='+master+'&w=650&output=jpg',
 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/42/'+file+'/650px-'+file,
 'https://commons.wikimedia.org/wiki/Special:FilePath/'+file+'?width=650',
 'https://upload.wikimedia.org/wikipedia/commons/4/42/'+file
];
if(fs.existsSync(path)&&fs.statSync(path).size>25000){
 console.log('Historical title page already stored locally.');
 process.exit(0);
}
for(const url of sources){
 try{
  const r=await fetch(url,{headers:{'User-Agent':'OpheliaOpenBook/1.0 (historical public-domain image)'},signal:AbortSignal.timeout(30000)});
  if(!r.ok)throw Error('HTTP '+r.status);
  const b=Buffer.from(await r.arrayBuffer());
  if(b.length<25000||b.length>7000000||b[0]!==255||b[1]!==216)
   throw Error('Response is not a usable historical JPEG');
  fs.mkdirSync('public/art',{recursive:true});
  fs.writeFileSync(path,b);
  console.log('SUCCESS hosted original 1861 title page from',url,'bytes:',b.length);
  process.exit(0);
 }catch(e){console.warn('Cover source retry:',e.message,url);}
}
console.warn('Could not mirror historical illustration yet; reader will use original Wikimedia Commons URL.');
process.exit(0);
