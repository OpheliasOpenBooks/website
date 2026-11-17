#!/usr/bin/env python3
"""Import Stendhal's public-domain 1916 Samuel translation as a local text file."""
from pathlib import Path
from urllib.request import urlopen, Request
from urllib.error import URLError
import re

URLS = [
 "https://www.gutenberg.org/cache/epub/44747/pg44747.txt",
 "https://raw.githubusercontent.com/GITenberg/The-Red-and-the-BlackA-Chronicle-of-1830_44747/master/44747-0.txt",
 "https://www.gutenberg.org/ebooks/44747.txt.utf-8",
]
out = Path("public/books/the-red-and-the-black-1916.txt")
errors = []
for url in URLS:
 try:
  req=Request(url,headers={"User-Agent":"OpheliasOpenBook/1.0 (public-domain archival import)"})
  with urlopen(req,timeout=45) as r:
   data=r.read()
  text=data.decode("utf-8-sig",errors="replace").replace("\r\n","\n")
  if len(text)<700000: raise ValueError(f"Source too short: {len(text)} chars")
  if "STENDHAL" not in text[:20000].upper() or "JULIEN" not in text.upper():
   raise ValueError("Unexpected novel source")
  if "THE RED AND THE BLACK" not in text[:15000].upper():
   raise ValueError("Missing book title")
  # Check canonical beginning and final material to reject excerpts.
  if "VERRIÈRES" not in text.upper() and "VERRIERES" not in text.upper():
   raise ValueError("Missing opening setting")
  if not re.search(r"\bCHAPTER\s+[IVXLCDM]+\b",text,re.I):
   raise ValueError("Chapter headings not found")
  out.parent.mkdir(parents=True,exist_ok=True)
  out.write_text(text,encoding="utf-8")
  print(f"Imported {len(text):,} characters from {url} into {out}")
  break
 except Exception as exc:
  errors.append(f"{url}: {exc}")
else:
 raise SystemExit("All sources failed:\n"+"\n".join(errors))
