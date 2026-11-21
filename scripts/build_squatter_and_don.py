#!/usr/bin/env python3
"""Build a locally hosted reading edition from Gutenberg eBook 35538."""
from pathlib import Path
import json, re, urllib.request
URLS=[
 'https://www.gutenberg.org/cache/epub/35538/pg35538.txt',
 'https://www.gutenberg.org/ebooks/35538.txt.utf-8',
 'https://www.gutenberg.org/files/35538/35538-0.txt',
]
raw=None
for url in URLS:
 try:
  req=urllib.request.Request(url,headers={'User-Agent':'OpheliasOpenBook/1.0 (public-domain-library)'})
  with urllib.request.urlopen(req,timeout=45) as r: raw=r.read().decode('utf-8-sig')
  if 'THE SQUATTER AND THE DON' in raw.upper(): break
 except Exception as e:
  print('Source unavailable:',url,e)
if not raw: raise RuntimeError('Could not retrieve complete source; declining to publish an incomplete edition.')
raw=raw.replace('\r\n','\n').replace('\r','\n')
start=re.search(r'\*\*\*\s*START OF (?:THE|THIS) PROJECT GUTENBERG EBOOK[^\n]*\*\*\*',raw,re.I)
end=re.search(r'\*\*\*\s*END OF (?:THE|THIS) PROJECT GUTENBERG EBOOK',raw,re.I)
if not start or not end or end.start()<=start.end(): raise RuntimeError('Gutenberg text delimiters missing')
text=raw[start.end():end.start()].strip()
# Keep the original wording, paragraphs, dedication, preface and chapter headings.
# Remove only digit-only footnote references, not text or chapter headings.
text=re.sub(r'(?<=\w)\[(\d{1,3})\]', '', text)
paragraphs=[re.sub(r'\s*\n\s*',' ',part).strip() for part in re.split(r'\n\s*\n',text)]
paragraphs=[p for p in paragraphs if p]
word_count=sum(len(p.split()) for p in paragraphs)
if word_count<60000: raise RuntimeError(f'Only {word_count} words found; refusing abridged text')
out={'title':'The Squatter and the Don','author':'María Amparo Ruiz de Burton','year':1885,'language':'en','source':'Project Gutenberg eBook #35538; original 1885 text','wordCount':word_count,'paragraphs':paragraphs}
p=Path('public/books/squatter-and-the-don.json');p.parent.mkdir(parents=True,exist_ok=True)
p.write_text(json.dumps(out,ensure_ascii=False,separators=(',',':'))+'\n',encoding='utf-8')
print('Wrote',p,'words:',word_count,'paragraphs:',len(paragraphs))
