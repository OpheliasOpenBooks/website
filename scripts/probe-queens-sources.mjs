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
