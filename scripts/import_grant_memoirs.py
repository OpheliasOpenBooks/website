#!/usr/bin/env python3
"""Import BOTH public-domain volumes of Personal Memoirs of U. S. Grant.
Original edition: New York, Charles L. Webster & Company, 1885–1886.
Source transcription: Project Gutenberg ebook 4367 and historical mirrors.
Do not publish an incomplete volume, or Gutenberg web navigation/license as book text.
"""
from pathlib import Path
from urllib.request import Request,urlopen
from bs4 import BeautifulSoup
import re,time,hashlib

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/"public/texts/grant-memoirs/complete-1885-1886.txt"
COVER=ROOT/"public/art/grant-memoirs-1885-cover.jpg"
PAGE="personal-memoirs-of-u-s-grant.html"
LOG=ROOT/"scripts/diagnostics/grant-memoirs-import.log"
HTML_SOURCES=[
 "https://louisiana-anthology.org/303_download/texts/grant--memoir/grant--memoir.html",
 "https://raw.githubusercontent.com/GITenberg/Personal-Memoirs-of-U.-S.-Grant-Complete_4367/master/4367-h/4367-h.htm",
 "https://www.gutenberg.org/files/4367/4367-h/4367-h.htm",
 "https://www.gutenberg.org/cache/epub/4367/pg4367-images.html"
]
COVER_SOURCES=[
 "https://louisiana-anthology.org/303_download/texts/grant--memoir/grant--memoir_files/cover.jpg",
 "https://raw.githubusercontent.com/GITenberg/Personal-Memoirs-of-U.-S.-Grant-Complete_4367/master/4367-h/images/cover.jpg",
 "https://www.gutenberg.org/files/4367/4367-h/images/cover.jpg"
]
def info(s):
 print(s,flush=True)
 LOG.parent.mkdir(parents=True,exist_ok=True)
 with LOG.open("a",encoding="utf-8") as log:log.write(s+"\n")
def fetch_urls(urls,min_len=100000,image=False):
 for url in urls:
  for attempt in range(2):
   try:
    req=Request(url,headers={"User-Agent":"OpheliasOpenBook/1.0 (public domain educational library)",
                                "Accept":"image/jpeg,image/png,*/*" if image else "text/html,application/xhtml+xml"})
    with urlopen(req,timeout=90) as r:data=r.read()
    if len(data)<min_len:raise ValueError(f"Unusually short download {len(data)} bytes")
    if image and not data.startswith((b"\xff\xd8\xff",b"\x89PNG")):raise ValueError("Downloaded cover is not an image")
    if not image and not b"PERSONAL MEMOIRS" in data[:250000].upper():raise ValueError("Source HTML does not identify Grant's memoirs")
    info("Verified original cover" if image else "Downloaded historical transcription: "+url+" bytes="+str(len(data)))
    return data,url
   except Exception as e:
    info(f"Source failed (attempt {attempt+1}): {url}: {str(e)[:170]}")
    time.sleep(2)
 raise RuntimeError("No valid historical source could be fetched.")
def roman(num):
 values=[(1000,"M"),(900,"CM"),(500,"D"),(400,"CD"),(100,"C"),(90,"XC"),(50,"L"),(40,"XL"),(10,"X"),(9,"IX"),(5,"V"),(4,"IV"),(1,"I")]
 out=""
 for n,s in values:
  while num>=n:out+=s;num-=n
 return out
def scrub(s):
 s=s.replace("\u00ad","").replace("\u200b","").replace("\ufeff","")
 s=re.sub(r"\[\s*(?:[0-9]{1,4}|[*†‡])\s*\]","",s)
 s=re.sub(r"\s+"," ",s).strip()
 return s
def import_html(blob):
 soup=BeautifulSoup(blob,"html.parser")
 for n in soup.select("script,style,noscript,nav,footer,.pg-boilerplate,.pagenum,.mw-editsection,.navigation"):
  n.decompose()
 root=soup.body or soup
 elements=root.find_all(["h1","h2","h3","h4","h5","h6","p","li","pre","tr"])
 def heading(n):return scrub(n.get_text(" ",strip=True))
 def is_heading(n):return n.name in ("h1","h2","h3","h4","h5","h6")
 heads=[(i,heading(n)) for i,n in enumerate(elements) if is_heading(n)]
 info("First heading list: "+repr(heads[:75])[:7000])
 firsts=[i for i,n in enumerate(elements) if is_heading(n) and re.fullmatch(r"CHAPTER\s+I\.",heading(n),re.I)]
 if len(firsts)!=1:raise ValueError(f"Expected one real Chapter I heading, found {len(firsts)}")
 start=firsts[0]
 prefaces=[i for i,n in enumerate(elements[:start]) if is_heading(n) and heading(n).upper() in ("PREFACE.","PREFACE")]
 if len(prefaces)!=1:raise ValueError("Author's preface missing or duplicated.")
 contents=[i for i,n in enumerate(elements[prefaces[0]+1:start],prefaces[0]+1) if is_heading(n) and heading(n).upper() in ("CONTENTS","CONTENTS.")]
 if not contents:raise ValueError("Original table of contents separator missing.")
 preface_text=[]
 for n in elements[prefaces[0]+1:contents[0]]:
  if n.name in ("p","pre","li") and not n.find_parent(["tr","p","li","pre"]):
   line=scrub(n.get_text(" ",strip=True))
   if line:preface_text.append(line)
 if len(" ".join(preface_text).split())<275 or not any("MOUNT MACGREGOR" in x for x in preface_text):
  raise ValueError("Original Grant preface is incomplete.")
 chapters=[]
 current=None
 appendix=None
 conclusion=None
 volume=1
 last_title=None
 chapter_indices=[]
 skip_license=False
 for index in range(start,len(elements)):
  n=elements[index];t=heading(n)
  if not t:continue
  if "END OF THE PROJECT GUTENBERG" in t.upper() or "END OF THE PROJECT GUTENBERG EBOOK" in t.upper() or "START: FULL LICENSE" in t.upper():break
  if is_heading(n):
   if re.fullmatch(r"VOLUME\s+II\.?",t,re.I):
    if len(chapters)!=39:raise ValueError("Volume I must contain chapters I–XXXIX")
    volume=2;current=None;last_title=None
    continue
   m=re.match(r"^CHAPTER\s+([IVXLCDM]+)\.?\s*$",t,re.I)
   if m:
    number=len(chapters)+1
    if roman(number)!=m.group(1).upper() or (volume==1 and number>39) or (volume==2 and number<=39):
     raise ValueError("Chapter order or volume boundary invalid near "+t+" (#"+str(number)+")")
    current={"number":number,"volume":volume,"title":"","paras":[]}
    chapters.append(current)
    chapter_indices.append(index)
    last_title=None
    continue
   if re.fullmatch(r"CONCLUSION\.?",t,re.I):
    if len(chapters)!=70:raise ValueError("Grant's Conclusion came before the 70th chapter")
    conclusion=[];current=None;continue
   if re.fullmatch(r"APPENDIX\.?",t,re.I):
    if conclusion is None:raise ValueError("Appendix appears before Conclusion")
    appendix=[];current=None;continue
   if n.name in ("h3","h4","h5") and current is not None and not current["paras"] and not current["title"] and len(t)<300:
    current["title"]=t
   elif conclusion is not None and appendix is None:conclusion.append(t)
   elif appendix is not None:appendix.append(t)
   continue
  if n.find_parent(["li","p","pre","tr"]):continue
  if n.name=="tr":
   cells=[scrub(c.get_text(" ",strip=True)) for c in n.find_all(["th","td"],recursive=False)]
   line=" — ".join(c for c in cells if c)
  else:line=t
  if not line:continue
  if current is not None:current["paras"].append(line)
  elif appendix is not None:appendix.append(line)
  elif conclusion is not None:conclusion.append(line)
 if len(chapters)!=70 or volume!=2:
  raise ValueError(f"Only {len(chapters)} of the expected 70 chapters were found.")
 if not conclusion or not appendix:raise ValueError("The memoir's conclusion or appendix was missing.")
 lengths=[len(" ".join(c["paras"]).split()) for c in chapters]
 info("Chapter length range: "+str(min(lengths))+".."+str(max(lengths))+", count: "+str(len(chapters)))
 if min(lengths)<350:raise ValueError("One of Grant's chapters contains insufficient text")
 if len(" ".join(conclusion).split())<450:raise ValueError("Conclusion appears incomplete.")
 if len(" ".join(appendix).split())<250:raise ValueError("Appendix appears incomplete.")
 if not all(c["title"] for c in chapters):
  raise ValueError("One or more original chapter subtitles are missing: "+str([c["number"] for c in chapters if not c["title"]]))
 text=["PERSONAL MEMOIRS OF U. S. GRANT.","ULYSSES S. GRANT.","1885–1886 EDITION.","PREFACE."]+preface_text+["VOLUME I."]
 for c in chapters:
  if c["number"]==40:text.append("VOLUME II.")
  text.append("CHAPTER "+roman(c["number"])+". "+c["title"])
  text.extend(c["paras"])
 text.append("CONCLUSION.")
 text.extend(conclusion)
 text.append("APPENDIX.")
 text.extend(appendix)
 complete="\n\n".join(text).strip()+"\n"
 wc=len(complete.split())
 if not (125000<wc<350000):raise ValueError(f"Unabridged work should be longer; got {wc} words.")
 if "Project Gutenberg License" in complete or "This eBook is for the use" in complete or "CONTENTS" in complete[:3500]:
  raise ValueError("Web/book navigation or license entered transcription")
 if complete.count("\n\nCHAPTER ")!=70 or complete.count("\n\nCONCLUSION.")!=1 or complete.count("\n\nAPPENDIX.")!=1:
  raise ValueError("Chapter/ending integrity check failed.")
 info(f"Verified BOTH historical volumes, 70 chapters, conclusion, appendix: {wc:,} words")
 info("First chapter title: "+chapters[0]["title"]+"; last chapter title: "+chapters[-1]["title"])
 info("Final 150 chars: "+complete[-150:])
 return complete,wc

def publish(text,wc,cover):
 html=(ROOT/PAGE).read_text(encoding="utf-8")
 ids=["volume","section","page","play","voice","speed","size","dark","autoturn","bookmark","settings-toggle"]
 for id in ids:
  if 'id="'+id+'"' not in html:raise ValueError("Expected standard reader control "+id)
 if "ophelia-narration.js" not in html or "complete-1885-1886.txt" not in html:
  raise ValueError("Reader is not connected to local unabridged book.")
 OUT.parent.mkdir(parents=True,exist_ok=True);COVER.parent.mkdir(parents=True,exist_ok=True)
 OUT.write_text(text,encoding="utf-8")
 COVER.write_bytes(cover)
 cat=ROOT/"catalog.html";content=cat.read_text(encoding="utf-8")
 if PAGE not in content:
  marker="const catalogOnlyBooks=["
  if content.count(marker)!=1:raise ValueError("Catalog insertion anchor missing")
  entry="""\n {title:'Personal Memoirs of U. S. Grant',author:'Ulysses S. Grant · 1885–1886 · Complete in two volumes',href:'personal-memoirs-of-u-s-grant.html',image:'public/art/grant-memoirs-1885-cover.jpg',alt:'Original nineteenth-century cover with gilt portrait medallion of Ulysses S. Grant',description:'Grant’s complete original two-volume memoirs, covering his early life, the Mexican–American War and the Civil War. All 70 chapters, preface, conclusion and appendix with our hosted read-and-listen interface.',genre:'American History & Political Thought'},\n"""
  cat.write_text(content.replace(marker,marker+entry,1),encoding="utf-8")
 sitemap=ROOT/"sitemap.xml";xml=sitemap.read_text(encoding="utf-8")
 uri="https://opheliasopenbooks.github.io/website/"+PAGE
 if uri not in xml:
  if xml.count("</urlset>")!=1:raise ValueError("Sitemap XML malformed")
  sitemap.write_text(xml.replace("</urlset>",f"  <url><loc>{uri}</loc></url>\n</urlset>"),encoding="utf-8")
 info(f"Ready for publication: {wc:,} words, complete two-volume Grant reader and original binding image.")
if __name__=="__main__":
 try:
  blob,url=fetch_urls(HTML_SOURCES,min_len=600000)
  book,wc=import_html(blob)
  picture,_=fetch_urls(COVER_SOURCES,min_len=35000,image=True)
  publish(book,wc,picture)
 except Exception as e:
  info("FAILED WITHOUT CATALOG PUBLICATION: "+repr(e))
  raise
