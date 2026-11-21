#!/usr/bin/env python3
"""Publish Monroe's narrative reprinted in Writings III (1898), not the complete 1797 book."""
from pathlib import Path
from urllib.request import Request,urlopen
import re,time
ROOT=Path(__file__).resolve().parents[1]
SOURCE="https://archive.org/download/writingsincludin03monruoft/writingsincludin03monruoft_djvu.txt"
OUTPUT=ROOT/"public/texts/monroe-executive-1797/narrative-1898-reprint.txt"
READER="a-view-of-the-conduct-of-the-executive-james-monroe.html"
DIAG=ROOT/"scripts/diagnostics/monroe-narrative-import.log"
TITLE="A VIEW OF THE CONDUCT OF THE EXECUTIVE — MONROE’S NARRATIVE (HISTORICAL REPRINT)"
def log(v):
 print(v,flush=True)
 DIAG.parent.mkdir(parents=True,exist_ok=True)
 with DIAG.open("a",encoding="utf-8") as f:f.write(v+"\n")
def download():
 for i in range(4):
  try:
   req=Request(SOURCE,headers={"User-Agent":"OpheliasOpenBook/1.0 (historical public-domain text)"})
   with urlopen(req,timeout=80) as f:blob=f.read()
   if len(blob)<800000:raise ValueError("Historical OCR source is too small")
   t=blob.decode("utf-8",errors="replace")
   log("Historical volume OCR loaded: "+str(len(t))+" characters")
   return t
  except Exception as exc:
   log("Download retry "+str(i+1)+": "+repr(exc)[:180])
   time.sleep((i+1)*3)
 raise RuntimeError("No complete source file could be fetched; do not publish")
def locate(s):
 tail=int(len(s)*.70)
 patterns=[
  r"(?im)^[ \t]*APPENDIX[ \t]+383[ \t]*$",
  r"(?im)^[ \t]*383[ \t]+APPENDIX[ \t]*$",
  r"(?im)^[ \t]*APPENDIX[ \t]*\.?[ \t]*$",
 ]
 groups=[[m.start()+tail for m in re.finditer(regex,s[tail:])] for regex in patterns]
 for i,group in enumerate(groups):
  log("Boundary candidate set "+str(i)+": "+repr(group[:20]))
  for pos in group[:4]:log("CANDIDATE "+str(pos)+" "+repr(s[pos:pos+1100]))
 start_list=groups[0] or groups[1]
 if not start_list:
  start_list=[x for x in groups[2] if int(.77*len(s))<x<int(.92*len(s))]
 if not start_list:raise ValueError("Could not locate the reprint's appendix opening at printed page 383")
 start=start_list[0]
 ends=list(re.finditer(r"END[ \t]+OF[ \t]+VOLUME[ \t]+III\.",s,flags=re.I))
 if len(ends)!=1 or ends[0].start()-start<95000:
  raise ValueError("Missing verified volume ending or bad narrative boundary")
 end=ends[0].start()
 log("Chosen span: "+str(start)+".."+str(end))
 log("OPENING: "+repr(s[start:start+2000]))
 log("ENDING: "+repr(s[end-1300:end]))
 return s[start:end]
def normalize(txt):
 # Remove running scan headers while preserving words and historical assertions.
 lines=[]
 for line in txt.replace("\r","").split("\n"):
  line=line.strip()
  if re.fullmatch(r"(?:APPENDIX\s+\d{3}|\d{3}\s+APPENDIX|\d{3}\s+THE WRITINGS OF(?: JAMES MONROE)?\.?|THE WRITINGS OF(?: JAMES MONROE)?\.?\s+\d{3}|\d{3})",line,flags=re.I):continue
  lines.append(line)
 s="\n".join(lines)
 s=re.sub(r"(?<=\w)-[ \t]*\n[ \t]*(?=[a-z])","",s)
 ps=[re.sub(r"\s+"," ",p).strip() for p in re.split(r"\n\s*\n+",s)]
 ps=[re.sub(r"(?<!\w)[*†‡](?=\s|$)","",p).strip() for p in ps if p.strip() and not re.fullmatch(r"[\W_]+",p)]
 # Printed running heads (odd/even pages) must not interrupt the narrator.
 def header(p):
  x=re.sub(r"\s+"," ",p.strip())
  return (bool(re.fullmatch(r"APPENDIX[\s.0-9rl]*",x,flags=re.I)) or
          bool(re.fullmatch(r"\d{3}\s+THE\s+WRITINGS\s+OF(?:\s+JAMES\s+MONROE)?\.",x,flags=re.I)) or
          bool(re.fullmatch(r"THE\s+WRITINGS\s+OF(?:\s+JAMES\s+MONROE)?\.?\s+\d{3}",x,flags=re.I)) or
          bool(re.fullmatch(r"A VIEW,\s*&C\.",x,flags=re.I)))
 ps=[p for p in ps if not header(p)]
 corrections=[(r"\bofifice\b","office"),(r"\brepubHc\b","republic"),
              (r"\bI7g4\b","1794"),(r"\byames Monroe\b","James Monroe"),
              (r"\bauthetttic\b","authentic")]
 for regex,value in corrections:
  ps=[re.sub(regex,value,p,flags=re.I) for p in ps]
 return ps
def prepare():
 txt=download()
 ps=normalize(locate(txt))
 prose=" ".join(ps).lower()
 words=sum(len(p.split()) for p in ps)
 log("Narrative extraction: "+str(words)+" words in "+str(len(ps))+" paragraphs")
 log("First extracted paragraph: "+repr(ps[0][:1000] if ps else ""))
 log("Final extracted paragraph: "+repr(ps[-1][-900:] if ps else ""))
 if not (11500<words<50000) or len(ps)<35:raise ValueError("Narrative transcription appears incomplete or wrongly bounded")
 if "national honor is in the dust" not in prose and "national honour is in the dust" not in prose:
  raise ValueError("Narrative's verified conclusion absent")
 if "high ground from which we have fallen" not in prose:raise ValueError("Final words missing")
 note=("This is an abridged historical reprint, not the complete 1797 book. "
 "James Monroe's narrative is taken from the Appendix, pp. 383–457, of "
 "The Writings of James Monroe, Volume III (1898), edited by Stanislaus Murray Hamilton. "
 "The original 1797 edition includes diplomatic instructions, correspondence, and "
 "other authentic documents; those additional documents are not included in this reader. "
 "This text originates in nineteenth-century scan OCR; occasional transcription errors may remain.")
 full="\n\n".join([TITLE,"=== EDITORIAL NOTE ===",note,"=== MONROE NARRATIVE ==="]+ps)+"\n"
 return full,words,len(ps)
def publish(text,words,paragraphs):
 html=(ROOT/READER).read_text(encoding="utf-8")
 for id in ("section","page","voice","speed","size","dark","autoturn","bookmark","settings-toggle","play"):
  if 'id="'+id+'"' not in html:raise ValueError("Ophelia standard reader control missing: "+id)
 if "ophelia-narration.js" not in html or "narrative-1898-reprint.txt" not in html:
  raise ValueError("Standard locally hosted narrator not properly wired.")
 OUTPUT.parent.mkdir(parents=True,exist_ok=True)
 OUTPUT.write_text(text,encoding="utf-8")
 catalog=ROOT/"catalog.html"
 c=catalog.read_text(encoding="utf-8")
 if READER not in c:
  marker="const catalogOnlyBooks=["
  if c.count(marker)!=1:raise ValueError("Catalog formatting changed")
  entry="""\n {title:'A View of the Conduct of the Executive — Monroe’s Narrative (Historical Reprint)',author:'James Monroe · 1797 · Abridged 1898 reprint',href:'a-view-of-the-conduct-of-the-executive-james-monroe.html',image:'public/art/monroe-view-executive-1797-titlepage.svg',alt:'Historically inspired title page for Monroe’s 1797 work; not an original scan',description:'Monroe’s diplomatic narrative. ABRIDGED: the original 1797 instructions, correspondence and documentary appendix are not included. Read and listen within Ophelia’s own reader.',genre:'American History & Political Thought'},\n"""
  catalog.write_text(c.replace(marker,marker+entry,1),encoding="utf-8")
 sitemap=ROOT/"sitemap.xml"
 xml=sitemap.read_text(encoding="utf-8")
 url="https://opheliasopenbooks.github.io/website/"+READER
 if url not in xml:
  if xml.count("</urlset>")!=1:raise ValueError("Sitemap closing tag missing")
  sitemap.write_text(xml.replace("</urlset>","  <url><loc>"+url+"</loc></url>\n</urlset>"),encoding="utf-8")
 notes=ROOT/"SOURCES-monroe-view-executive-1797.md"
 content=notes.read_text(encoding="utf-8")
 content=content.replace("**Publication status:** NOT YET PUBLISHED.","**Publication status:** ABRIDGED historical narrative (1898 reprint) published; original complete 1797 edition remains absent.")
 content+="\n\n## Locally hosted abbreviated narrative\nOnly the 1898 reprinted Monroe narrative is hosted, at public/texts/monroe-executive-1797/narrative-1898-reprint.txt, comprising "+str(words)+" OCR-derived words across "+str(paragraphs)+" paragraphs. The complete 1797 diplomatic and document appendix has not been reproduced.\n"
 notes.write_text(content,encoding="utf-8")
 log("PUBLISHED: Labeled abridged Monroe narrative, not complete 1797 documentary book.")
if __name__=="__main__":
 try:
  full,w,n=prepare()
  publish(full,w,n)
 except Exception as e:
  log("ERROR: "+repr(e))
  raise
