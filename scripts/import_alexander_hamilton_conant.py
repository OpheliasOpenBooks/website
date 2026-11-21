#!/usr/bin/env python3
"""Build a verified full local edition of Charles A. Conant's Alexander Hamilton (1901)."""
import urllib.request, pathlib, re, json
urls=['https://www.gutenberg.org/cache/epub/40591/pg40591.txt','https://www.gutenberg.org/files/40591/40591-0.txt']
raw=None
for url in urls:
 try:
  request=urllib.request.Request(url,headers={'User-Agent':'Mozilla/5.0'})
  with urllib.request.urlopen(request,timeout=45) as response: candidate=response.read().decode('utf-8-sig')
  if 'ALEXANDER HAMILTON' in candidate.upper() and len(candidate)>130000:raw=candidate;break
 except Exception as error:print(url,error)
if raw is None:raise RuntimeError('Complete source unavailable; do not publish an incomplete book')
raw=raw.replace('\r\n','\n').replace('\r','\n')
a=re.search(r'\*\*\*\s*START OF (?:THE|THIS) PROJECT GUTENBERG EBOOK[^\n]*\*\*\*',raw,re.I)
b=re.search(r'\*\*\*\s*END OF (?:THE|THIS) PROJECT GUTENBERG EBOOK',raw,re.I)
if not a or not b or b.start()<=a.end():raise RuntimeError('Gutenberg edition markers missing')
body=raw[a.end():b.start()].strip()
# Retain original chapter headings and punctuation; remove only isolated page labels.
body=re.sub(r'\[Pg\s*\d+\]','',body,flags=re.I)
words=len(body.split())
if words<23000:raise RuntimeError(f'Incomplete source: {words} words')
if not re.search(r'YOUTH AND EARLY SERVICES',body,re.I):raise RuntimeError('First chapter missing')
destination=pathlib.Path('public/books/alexander-hamilton-conant-1901.txt')
destination.parent.mkdir(parents=True,exist_ok=True)
destination.write_text(body+'\n',encoding='utf-8')
print('Complete locally hosted edition verified:',words,'words')
