#!/usr/bin/env python3
"""One-time import of public-domain 1922 Scott Moncrieff Swann's Way."""
import json
import re
import urllib.request
from pathlib import Path

SOURCE='https://raw.githubusercontent.com/GITenberg/Swann-s-Way_7178/master/7178.txt'
OUT=Path('public/books/swanns-way.json')
request=urllib.request.Request(SOURCE,headers={'User-Agent':'OpheliasOpenBook-public-domain-import/1.0'})
with urllib.request.urlopen(request,timeout=75) as response:
    binary=response.read()
if len(binary)<500_000:
    raise ValueError('Truncated external source: %d bytes'%len(binary))
try:source=binary.decode('utf-8-sig')
except UnicodeDecodeError:source=binary.decode('cp1252')
source=source.replace('\r\n','\n').replace('\r','\n')
start=re.search(r'(?im)^\*\*\*\s*START\s+OF\s+.*PROJECT GUTENBERG.*$',source)
end=re.search(r'(?im)^\*\*\*\s*END\s+OF\s+.*PROJECT GUTENBERG.*$',source)
if not(start and end and end.start()>start.end()):
    raise ValueError('Could not locate complete Project Gutenberg text')
body=source[start.end():end.start()]
pattern=re.compile(r'(?m)^[ \t]*(OVERTURE|COMBRAY|SWANN IN LOVE|PLACE-NAMES:\s*THE NAME)[ \t]*$')
all_hits=list(pattern.finditer(body))
opening=[m for m in all_hits if m.group(1)=='OVERTURE' and re.search(
    'For a long time I used to go to bed early',body[m.end():m.end()+1200],re.I)]
if not opening:
    raise ValueError("Could not find the first paragraph after Overture")
heads=[opening[0]]
for title in ('COMBRAY','SWANN IN LOVE','PLACE-NAMES: THE NAME'):
    valid=[m for m in all_hits if m.start()>heads[-1].start() and re.sub(r'\s+',' ',m.group(1))==title]
    if not valid:raise ValueError('Missing section '+title)
    heads.append(valid[0])
sections=[]
for i,m in enumerate(heads):
    part=body[m.end():(heads[i+1].start() if i+1<len(heads) else len(body))]
    pars=[re.sub(r'\s+',' ',p).strip() for p in re.split(r'\n\s*\n+',part.strip())]
    pars=[p for p in pars if p]
    if len(' '.join(pars).split())<500:
        raise ValueError('Incomplete section '+m.group(1))
    name=re.sub(r'\s+',' ',m.group(1)).title().replace('Swann In Love','Swann in Love')
    sections.append({'name':name,'paragraphs':pars})
words=sum(len(' '.join(x['paragraphs']).split()) for x in sections)
if not 140_000<=words<=260_000:
    raise ValueError('Unexpected translation length: %d words'%words)
data={'title':"Swann's Way",'author':'Marcel Proust',
      'original_title':'Du côté de chez Swann','original_year':1913,
      'translator':'C. K. Scott Moncrieff','translation_year':1922,
      'edition':'Complete 1922 English translation of the first volume of In Search of Lost Time, not all seven volumes',
      'source':'https://www.gutenberg.org/ebooks/7178','sections':sections}
OUT.parent.mkdir(parents=True,exist_ok=True)
OUT.write_text(json.dumps(data,ensure_ascii=False),encoding='utf-8')
print('Successfully imported %d sections, %d words (%d bytes)'%(len(sections),words,OUT.stat().st_size))
