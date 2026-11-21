#!/usr/bin/env python3
"""Import and verify Eva Martin's public-domain translation of The Idiot."""
import json,re,urllib.request,pathlib
SOURCES=['https://www.gutenberg.org/cache/epub/2638/pg2638.txt','https://www.gutenberg.org/files/2638/2638-0.txt','https://www.gutenberg.org/ebooks/2638.txt.utf-8']
raw=None
for src in SOURCES:
 try:
  req=urllib.request.Request(src,headers={'User-Agent':'Mozilla/5.0 (compatible; OpheliasOpenBook/1.0)'})
  with urllib.request.urlopen(req,timeout=35) as resp:
   candidate=resp.read().decode('utf-8-sig')
  if 'THE IDIOT' in candidate[:9000].upper() and len(candidate)>700000: raw=candidate;break
 except Exception as ex: print('Source fallback:',ex)
if not raw: raise RuntimeError('Complete English edition unavailable: refusing to publish partial text')
raw=raw.replace('\r\n','\n').replace('\r','\n')
a=re.search(r'\*\*\*\s*START OF (?:THE|THIS) PROJECT GUTENBERG EBOOK[^\n]*\*\*\*',raw,re.I)
b=re.search(r'\*\*\*\s*END OF (?:THE|THIS) PROJECT GUTENBERG EBOOK',raw,re.I)
if not a or not b or a.end()>=b.start():raise RuntimeError('Book boundaries missing')
novel=raw[a.end():b.start()].strip()
if novel.count('PART ')<3:raise RuntimeError('Missing one or more novel parts')
paras=[re.sub(r'\s*\n\s*',' ',x).strip() for x in re.split(r'\n\s*\n',novel)]
paras=[p for p in paras if p]
words=sum(len(p.split()) for p in paras)
if words<160000:raise RuntimeError(f'Only {words} words parsed: incomplete text')
out={'title':'The Idiot','author':'Fyodor Dostoevsky','translator':'Eva Martin (1915)','language':'en','source':'Project Gutenberg #2638','wordCount':words,'paragraphs':paras}
dest=pathlib.Path('public/books/the-idiot-martin-1915.json')
dest.parent.mkdir(parents=True,exist_ok=True)
dest.write_text(json.dumps(out,ensure_ascii=False,separators=(',',':'))+'\n',encoding='utf-8')
print('Validated complete text:',len(paras),'paragraphs',words,'words',dest)

# Trigger automated source validation after workflow installation.
