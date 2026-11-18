from pathlib import Path
from bs4 import BeautifulSoup, Tag
from PIL import Image
from io import BytesIO
from urllib.request import Request, urlopen
import json, re, time, urllib.error

def get(url):
    for attempt in range(3):
        try:
            req=Request(url,headers={"User-Agent":"Mozilla/5.0 (compatible; OpheliasOpenBook/1.0; educational historical text archive)"})
            with urlopen(req,timeout=65) as r:
                return r.read()
        except Exception as e:
            print("Download error",url,attempt,type(e).__name__,str(e)[:120],flush=True)
            time.sleep(2*(attempt+1))
    return None

source_urls=[
  "https://www.gutenberg.org/files/27200/27200-h/27200-h.htm",
  "https://readingroo.ms/2/7/2/0/27200/27200-h/27200-h.htm",
  "https://www.gutenberg.org/cache/epub/27200/pg27200-images.html"
]
raw=None; source_url=None
for url in source_urls:
    body=get(url)
    if body and len(body)>300000 and b"SNOW QUEEN" in body.upper() and b"LITTLE MERMAID" in body.upper():
        raw=body; source_url=url;break
assert raw, "Unable to download complete Andersen 27200 anthology"
print("Text source",source_url,len(raw))
soup=BeautifulSoup(raw,"html.parser")
# Gutenberg 27200 HTML uses h3 headings for individual stories.
heads=soup.find_all(["h2","h3"])
def clean(s):return re.sub(r"\s+"," ",s).strip()
def norm(s):return clean(s).casefold()
# Gather all possible heading names and store diagnostic metadata for transparent validation.
allheads=[clean(h.get_text(" ",strip=True)) for h in heads]
Path("public/books").mkdir(parents=True,exist_ok=True)
Path("public/books/andersen-heading-audit.json").write_text(json.dumps(allheads,ensure_ascii=False,indent=2))
start_candidates=[i for i,h in enumerate(heads) if norm(h.get_text(" ",strip=True)) in ("a story by the almshouse window","a story")]
if not start_candidates:
    start_candidates=[i for i,h in enumerate(heads) if "ALMSHOUSE WINDOW" in clean(h.get_text(" ",strip=True)).upper()]
assert start_candidates, "Missing first story title; inspect heading audit"
first=start_candidates[-1]
print("first",first,allheads[first:first+8])
def paginate(paragraphs,cap=340):
    chunks=[]; part=[]; n=0
    for p in paragraphs:
        count=len(p.split())
        if part and n+count>cap:
            chunks.append(part);part=[];n=0
        part.append(p);n+=count
    if part:chunks.append(part)
    return chunks

folder=Path("public/books/andersen-tales-27200")
folder.mkdir(parents=True,exist_ok=True)
stories=[]
for j,h in enumerate(heads[first:],start=first):
    title=clean(h.get_text(" ",strip=True))
    if not title or len(title)>140 or "PROJECT GUTENBERG" in title.upper():continue
    # get paragraphs under this heading up to next h2/h3
    paragraphs=[]
    for el in h.next_elements:
        if not isinstance(el,Tag):continue
        if el.name in ("h1","h2","h3"):break
        if el.name not in ("p","h4","h5"):continue
        txt=clean(el.get_text(" ",strip=True))
        if "End of the Project Gutenberg" in txt:break
        if txt:paragraphs.append(txt)
    words=sum(len(x.split()) for x in paragraphs)
    if words<100:continue
    pages=paginate(paragraphs)
    fname=f"tale-{len(stories)+1:03d}.json"
    (folder/fname).write_text(json.dumps({"title":title.title(),"pages":pages},ensure_ascii=False,separators=(",",":")),encoding="utf-8")
    stories.append({"title":title.title(),"file":fname,"pages":len(pages),"words":words})
names=" ".join(x["title"].lower() for x in stories)
for name in ["the little mermaid","the snow queen","the ugly duckling","the emperor","the fir tree"]:
    assert name in names,(name,"missing",len(stories))
assert len(stories)>=80,("only",len(stories))
assert sum(x["words"] for x in stories)>150000,("not enough words",sum(x["words"] for x in stories))
index={"title":"Fairy Tales of Hans Christian Andersen","author":"Hans Christian Andersen","language":"en","source":"https://www.gutenberg.org/ebooks/27200","source_files_url":source_url,
 "edition":"Complete public-domain English anthology represented by Project Gutenberg eBook 27200; stories preserved in source order",
 "storyCount":len(stories),"wordCount":sum(x["words"] for x in stories),"stories":stories}
Path("public/books/andersen-fairy-tales-27200-index.json").write_text(json.dumps(index,ensure_ascii=False,separators=(",",":")),encoding="utf-8")
print("Parsed",len(stories),"tales",index["wordCount"],"words; first",stories[:4],"last",stories[-3:])
# A genuine public-domain book cover from 1888, not AI-generated.
cover_url="https://upload.wikimedia.org/wikipedia/commons/a/a3/Hans_Andersen%27s_Fairy_Tales_%281888%29_-_cover.jpg"
photo=get(cover_url)
assert photo and len(photo)>20000,"Historical cover unavailable"
picture=Image.open(BytesIO(photo)).convert("RGB")
assert picture.width>600 and picture.height>700
picture.thumbnail((800,1200),Image.Resampling.LANCZOS)
Path("public/art").mkdir(parents=True,exist_ok=True)
picture.save("public/art/hans-andersens-fairy-tales-1888-historical-cover.jpg",quality=85,optimize=True)
print("Historical cover from Wikimedia Commons",picture.size)
