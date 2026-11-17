#!/usr/bin/env python3
"""Archive Victor Hugo's unabridged French Notre-Dame de Paris locally."""
from pathlib import Path
from urllib.request import urlopen,Request
import re
urls=[
 "https://www.gutenberg.org/cache/epub/19657/pg19657.txt",
 "https://www.gutenberg.org/files/19657/19657-8.txt",
 "https://www.gutenberg.org/ebooks/19657.txt.utf-8"
]
errors=[]
for url in urls:
 try:
  with urlopen(Request(url,headers={"User-Agent":"OpheliasOpenBook/1.0 (public-domain French original)"}),timeout=50) as response: raw=response.read()
  text=raw.decode("utf-8-sig").replace("\r\n","\n")
  if len(text)<600000:raise ValueError("Text length unexpectedly short")
  norm=text.upper()
  if "NOTRE-DAME DE PARIS" not in norm[:18000] or "QUASIMODO" not in norm or "ESMERALDA" not in norm:raise ValueError("Not the expected complete French original")
  if "LIVRE PREMIER" not in norm or "LIVRE ONZIÈME" not in norm:raise ValueError("First or eleventh book not found")
  out=Path("public/books/notre-dame-de-paris-original-francais.txt")
  out.parent.mkdir(parents=True,exist_ok=True)
  out.write_text(text,encoding="utf-8")
  print(f"Imported French original {len(text)} chars, source {url}")
  break
 except Exception as exc:errors.append(f"{url}: {exc}")
else:
 raise SystemExit("French source import failed: "+"; ".join(errors))
