#!/usr/bin/env python3
"""Import the complete surviving 1806 volume of Shecut's Flora Carolinæensis."""
from pathlib import Path
from urllib.request import Request,urlopen
import json,re,time
ROOT=Path(__file__).resolve().parents[1]
SLUG='flora-carolinaeensis-shecut-1806'
SRC='https://archive.org/details/2571053R.nlm.nih.gov'
URLS=[
'https://ia800109.us.archive.org/25/items/2571053R.nlm.nih.gov/2571053R_djvu.txt',
'https://ia600109.us.archive.org/25/items/2571053R.nlm.nih.gov/2571053R_djvu.txt',
'https://dn710604.ca.archive.org/0/items/2571053R.nlm.nih.gov/2571053R_djvu.txt',
'https://dn760003.eu.archive.org/0/items/2571053R.nlm.nih.gov/2571053R_djvu.txt']
READER=ROOT/(SLUG+'.html')
TEXT=ROOT/'public/books'/(SLUG+'-original-ocr.txt')
DATA=ROOT/'public/books'/(SLUG+'.json')
CATALOG=ROOT/'catalog.html'
SITEMAP=ROOT/'sitemap.xml'
PROV=ROOT/('SOURCES-'+SLUG+'.md')
def get_source():
 for idx,url in enumerate(URLS):
  try:
   print('READ ORIGINAL 1806 SCAN OCR',url,flush=True)
   req=Request(url,headers={'User-Agent':'Mozilla/5.0 (noncommercial historical public-domain digital library)'})
   with urlopen(req,timeout=90) as r: raw=r.read(4000000)
   s=raw.decode('utf-8','replace').replace('\r','')
   w=len(s.split())
   print('ORIGINAL OCR VALIDATION',len(raw),'bytes;',w,'words',flush=True)
   if not (1500000<len(raw)<3000000 and 250000<w<400000):raise ValueError('source OCR incomplete')
   if not all(k in s[:12000].upper() for k in ('FLORA CAROLIN','SHECUT','1806')):raise ValueError('not original edition')
   if not ('flower' in s[-25000:].lower() and 'faithful' in s[-25000:].lower()):raise ValueError('final printed poem missing')
   return s,url
  except Exception as e:
   print('SOURCE RETRIEVAL FAILED',idx,str(e)[:320],flush=True)
   time.sleep(1)
 raise RuntimeError('Could not retrieve a verified complete original volume; abort publication')
def clean_ocr(s):
 s=s.replace('\x00','').replace('\u00ad','').replace('\ufeff','')
 s=s.replace('LINN^EAN','LINNÆAN').replace('CAROLIN^EENSIS','CAROLINÆENSIS')
 s=re.sub(r'(?<=[a-zA-Z])¬[ \t]*\n[ \t]*(?=[a-z])','',s)
 s=re.sub(r'(?<=[a-z])-[ \t]*\n[ \t]*(?=[a-z])','',s)
 paragraphs=[]
 for block in re.split(r'\n[ \t]*\n+',s):
  lines=[]
  for line in block.split('\n'):
   line=re.sub(r'[ \t]+',' ',line).strip()
   if not line:continue
   if re.fullmatch(r'[\W\d_]{1,30}',line):continue
   if re.fullmatch(r'(?:\d{1,3}|VOL\.?\s*I\.?)',line,re.I):continue
   if len(line)>5 and sum(ch.isalpha() for ch in line)/len(line)<0.28:continue
   lines.append(line)
  if not lines:continue
  p=' '.join(lines)
  p=re.sub(r'\[\s*\d{1,4}\s*\]','',p)
  p=re.sub(r'\s{2,}',' ',p).strip()
  if len(p)>5:paragraphs.append(p)
 return paragraphs
def split_parts(paragraphs,target=6500):
 groups=[];bucket=[];words=0
 for p in paragraphs:
  n=len(p.split())
  if bucket and words+n>target:
   groups.append(bucket);bucket=[];words=0
  bucket.append(p);words+=n
 if bucket:
  if words<150 and groups:groups[-1].extend(bucket)
  else:groups.append(bucket)
 return [{'name':'Volume I — Reading section %d of %d'%(i+1,len(groups)),'paragraphs':p} for i,p in enumerate(groups)]
def main():
 reader=READER.read_text(encoding='utf-8')
 assert SLUG+'.json' in reader and 'ophelia-narration.js' in reader and 'settings-toggle' in reader
 original,url=get_source()
 paragraphs=clean_ocr(original)
 parts=split_parts(paragraphs)
 words=sum(len(' '.join(s['paragraphs']).split()) for s in parts)
 print('READER OCR COUNTS',len(paragraphs),'paragraphs',len(parts),'reader sections',words,'displayed words',flush=True)
 print('READER FIRST',repr(paragraphs[0][:600]),flush=True)
 print('READER LAST',repr(paragraphs[-1][-600:]),flush=True)
 if not (30<=len(parts)<=90 and 210000<words<370000):raise ValueError('Full published Volume I not verified')
 if not any('CHAPTER' in p.upper() for p in paragraphs):raise ValueError('Original botanical chapters missing')
 if 'faithful' not in ' '.join(paragraphs[-25:]).lower():raise ValueError('Concluding printed poem absent')
 TEXT.parent.mkdir(parents=True,exist_ok=True)
 TEXT.write_text(original.strip()+'\n',encoding='utf-8')
 DATA.write_text(json.dumps({'title':'Flora Carolinæensis; or, A Historical, Medical, and Economical Display of the Vegetable Kingdom','author':'John Linnaeus Edward Whitridge Shecut','edition':'Charleston: John Hoff, 1806. Volume I (all that was published).','source':SRC,'sections':parts},ensure_ascii=False,separators=(',',':'))+'\n',encoding='utf-8')
 if DATA.stat().st_size<1400000 or TEXT.stat().st_size<1500000:raise ValueError('Hosted source files incomplete')
 catalog=CATALOG.read_text(encoding='utf-8')
 fname=SLUG+'.html'
 if "href:'"+fname+"'" not in catalog:
  marker='const catalogOnlyBooks=['
  if catalog.count(marker)!=1:raise ValueError('Cannot safely insert into catalog')
  desc=('Shecut’s ambitious 1806 encyclopedia explains the Linnaean classification system and surveys plants through their structure, cultivation, natural history, economic uses, and historical medicinal applications. The surviving Volume I covers A–Fus; although two volumes were advertised, no second volume was published. Historical medical descriptions are not modern health advice.')
  entry=("{title:'Flora Carolinæensis; or, A Historical, Medical, and Economical Display of the Vegetable Kingdom',"+
   "author:'John Linnaeus Edward Whitridge Shecut · 1806 · Complete published Volume I',"+
   "href:'"+fname+"',image:'public/art/"+SLUG+"-1806-titleplate.svg',"+
   "alt:'Period-inspired title page for Shecut’s 1806 botanical encyclopedia',"+
   "description:'"+desc+"',genre:'Science & Natural History'},\n")
  CATALOG.write_text(catalog.replace(marker,marker+'\n '+entry,1),encoding='utf-8')
 site='https://opheliasopenbooks.github.io/website/'+fname
 sitemap=SITEMAP.read_text(encoding='utf-8')
 if site not in sitemap:SITEMAP.write_text(sitemap.replace('</urlset>','  <url><loc>'+site+'</loc></url>\n</urlset>'),encoding='utf-8')
 PROV.write_text('# Flora Carolinæensis — 1806 botanical work\n\n'
 '- Author: John Linnaeus Edward Whitridge Shecut (1770–1836).\n'
 '- Edition: Charleston: John Hoff, 1806. The title anticipated two volumes; only Volume I appeared. The published alphabetical range is A–Fus (Kew IPNI and Monticello bibliography).\n'
 '- Original digitized scan: '+SRC+' (U.S. National Library of Medicine). Original approximately 579 printed pages, plus preliminaries and colored botanical plates.\n'
 '- Original historical ABBYY OCR: '+url+'. The complete scan-derived text is locally hosted at public/books/'+SLUG+'-original-ocr.txt.\n'
 '- Normalized reading text: public/books/'+SLUG+'.json with '+str(words)+' words in '+str(len(parts))+' navigation sections. Only clear OCR line wraps and scan garbage are lightly normalized; spelling, substance and historical medical assertions remain. OCR has not been comprehensively proofread.\n'
 '- Narration: native Ophelia read-aloud reader, saved progress, voice controls, page navigation, bookmarks.\n'
 '- Cover: period-inspired reconstruction, not the authentic scanned title page. The original plates are visible through the linked source scan.\n'
 '- Historical medical claims are archival, not health guidance.\n'
 '- index.html is unchanged; this is a catalog-only new title.\n',encoding='utf-8')
 print('SUCCESS original complete surviving 1806 volume published in catalog',len(parts),'sections;',words,'words',flush=True)
if __name__=='__main__':main()
