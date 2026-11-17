#!/usr/bin/env python3
"""Fetch and archive the complete Project Gutenberg #2610 Hapgood edition."""
from urllib.request import urlopen, Request
from pathlib import Path
sources=["https://www.gutenberg.org/cache/epub/2610/pg2610.txt","https://www.gutenberg.org/files/2610/2610-0.txt","https://raw.githubusercontent.com/GITenberg/Notre-Dame-de-Paris_2610/master/2610-0.txt"]
errors=[]
for url in sources:
 try:
  with urlopen(Request(url,headers={"User-Agent":"OpheliasOpenBook/1.0 (public-domain research)"}),timeout=45) as response: raw=response.read()
  text=raw.decode("utf-8-sig").replace("\r\n","\n")
  if len(text)<600000 or "HAPGOOD" not in text[:12000].upper() or "QUASIMODO" not in text.upper() or "ESMERALDA" not in text.upper(): raise ValueError("Text is incomplete or not the Hapgood edition")
  path=Path("public/books/hunchback-of-notre-dame-hapgood.txt");path.parent.mkdir(exist_ok=True,parents=True);path.write_text(text,encoding="utf-8")
  print(f"Verified source {url}, {len(text)} chars")
  break
 except Exception as e: errors.append(f"{url}: {e}")
else: raise SystemExit("Could not import verified book: "+"; ".join(errors))
