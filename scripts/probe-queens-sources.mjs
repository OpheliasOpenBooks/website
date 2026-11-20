const ids=Array.from({length:12},(_,i)=>'102819'+String(68+i)+'bsb');
async function test(id){
 const ac=new AbortController();const timer=setTimeout(()=>ac.abort(),21000);
 try{
  const u='https://archive.org/metadata/'+id;
  const r=await fetch(u,{signal:ac.signal,headers:{'User-Agent':'OpheliasOpenBook/1.0 (public domain research)'}});
  if(!r.ok)throw Error('metadata HTTP '+r.status);
  const data=await r.json();
  const files=(data.files||[]).filter(f=>/djvu.txt$|full_text|_text.pdf|_ocr|_abbyy|.txt$/i.test(f.name)).map(f=>({name:f.name,size:f.size})).slice(0,8);
  return {id,year:data.metadata?.year,title:data.metadata?.title?.slice(0,140),date:data.metadata?.date,files,valid:!data.is_dark,server:data.d1};
 }catch(e){return {id,error:e.message}}finally{clearTimeout(timer)}
}
const results=await Promise.all(ids.map(test));for(const r of results)console.log(JSON.stringify(r));
const pg='https://www.gutenberg.org/cache/epub/30188/pg30188.txt';
try{const r=await fetch(pg,{signal:AbortSignal.timeout(20000)});console.log('FIFTH QUEEN PG',r.status,r.headers.get('content-length'),(await r.text()).slice(0,140));}catch(e){console.log('FIFTH QUEEN PG failed',e.message);}


console.log('BEGIN IA ADVANCEDSEARCH');
const queries=[
 'title:("Lives of the queens of England") AND creator:(Strickland) AND year:[1839 TO 1906]',
 'identifier:(livesofqueensofe*) AND creator:(Strickland)'
];
for(const q of queries){
 try{
  const u=new URL('https://archive.org/advancedsearch.php');
  u.searchParams.set('q',q);u.searchParams.set('fl[]','identifier');u.searchParams.append('fl[]','title');u.searchParams.append('fl[]','year');u.searchParams.set('rows','150');u.searchParams.set('output','json');
  const r=await fetch(u,{signal:AbortSignal.timeout(25000)});
  if(!r.ok)throw Error('HTTP '+r.status);
  const js=await r.json();
  console.log('IA SEARCH',q,js.response?.numFound);
  for(const x of (js.response?.docs||[]).slice(0,120))console.log('IA RESULT',JSON.stringify(x));
 }catch(e){console.warn('IA QUERY FAILED',q,e.message)}
}
for(const id of ['livesofqueensofe01stri','livesofqueensofe02stri','livesofqueensofe03stri','livesofqueensofe04stri','livesofqueensofe12stri','livesqueensengl18strigoog']){
 try{
  const r=await fetch('https://archive.org/metadata/'+id,{signal:AbortSignal.timeout(12000)});
  const d=await r.json();
  console.log('TARGET',id,JSON.stringify({title:d.metadata?.title,year:d.metadata?.year,date:d.metadata?.date,files:d.files?.filter(f=>/djvu.txt$/.test(f.name)).map(f=>({name:f.name,size:f.size})),source:d.metadata?.source}));
 }catch(e){console.log('TARGET error',id,e.message)}
}


console.log('FIND EARLY FULL 12-VOLUME SERIES');
try {
 const q='title:("Lives of the Queens of England") AND year:[1839 TO 1850]';
 const u=new URL('https://archive.org/advancedsearch.php');
 u.searchParams.set('q',q);u.searchParams.append('fl[]','identifier');u.searchParams.append('fl[]','title');u.searchParams.append('fl[]','year');u.searchParams.set('rows','400');u.searchParams.set('output','json');
 const r=await fetch(u,{signal:AbortSignal.timeout(25000)});
 const d=await r.json();
 console.log('ALL YEARS 1840-50',d.response?.numFound);
 for(const x of d.response?.docs||[]){
  if(/strickland|lives.*queen/i.test(x.title)&&(/Vol\.\s*[IVX]/i.test(x.title)||/102819/i.test(x.identifier)))console.log('EARLY',JSON.stringify(x));
 }
}catch(e){console.log('EARLY ERROR',e.message)}
