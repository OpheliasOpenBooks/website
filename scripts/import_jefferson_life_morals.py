#!/usr/bin/env python3
"""Import the complete 1902 English transcription of Jefferson's Life and Morals.
The original compilation (ca. 1820) contained Greek, Latin, French and English;
this file intentionally contains the historical 1902 English edition, not a
fictional four-language transcription.
Published source: https://en.wikisource.org/wiki/The_Life_and_Morals_of_Jesus_of_Nazareth
The import is fail-closed: a partial text is not added to Ophelia's catalog.
"""
from pathlib import Path
from urllib.request import Request,urlopen
from bs4 import BeautifulSoup
import re,time

ROOT=Path(__file__).resolve().parents[1]
SOURCE="https://en.wikisource.org/wiki/The_Life_and_Morals_of_Jesus_of_Nazareth"
PAGE="the-life-and-morals-of-jesus-of-nazareth.html"
TEXT=ROOT/"public/texts/jefferson-life-morals/complete-1902-english.txt"
IMAGE="https://tile.loc.gov/storage-services/master/mss/mtj/mtj7/059/0400/0459.jpg"

def fetch():
    for attempt in range(3):
        try:
            req=Request(SOURCE,headers={"User-Agent":"OpheliasOpenBook/1.0 (public-domain educational archive; text verification)","Accept":"text/html,application/xhtml+xml"})
            with urlopen(req,timeout=100) as response:
                blob=response.read()
            if len(blob)<70000:raise ValueError(f"Source too short: {len(blob)} bytes")
            print("Source retrieved:",len(blob),"bytes",flush=True)
            return BeautifulSoup(blob,"html.parser")
        except Exception as exc:
            print("Source request failed:",repr(exc),flush=True)
            time.sleep((attempt+1)*3)
    raise RuntimeError("The proofread historical text source is not available.")

def roman(n):
    numerals=[(50,"L"),(40,"XL"),(10,"X"),(9,"IX"),(5,"V"),(4,"IV"),(1,"I")]
    s=""
    for a,b in numerals:
        while n>=a:s+=b;n-=a
    return s

def clean(s):
    s=s.replace("\u200b","").replace("\ufeff","").replace("\u00ad","")
    s=s.replace("ſ","s").replace("¶","")
    s=re.sub(r"(?<!\w)\[\s*\d{1,3}\s*\]","",s)
    s=re.sub(r"\s+"," ",s).strip()
    # Early editions typeset initial capitals separately; do not leave
    # fictitious two-word starts such as "A nd" in our screen or narration.
    return re.sub(r"^(A) nd\b", "And", s).replace("W hen ","When ").replace("T hen ","Then ").replace("J esus ","Jesus ").replace("H e ","He ").replace("F or ","For ").replace("B ut ","But ")

def get_blocks(soup):
    root=(soup.select_one("#mw-content-text .mw-parser-output")
          or soup.select_one("main .mw-parser-output")
          or soup.select_one(".mw-parser-output"))
    if root is None:raise ValueError("Wikisource main transcribed page was not found.")
    for elem in root.select("script,style,noscript,nav,footer, .mw-editsection, .reflist, .mw-references-wrap, .reference, .pagenum, .ws-pagenum, .ws-noexport, .printfooter, .catlinks, .licensetpl, .licenseContainer, .ws-header, #headerContainer, .metadata, .portal, .sisterproject, .ambox"):
        elem.decompose()
    types=["p","h1","h2","h3","h4","h5","h6","div","li","center","blockquote","td","th","pre"]
    blocks=[]
    for tag in root.find_all(types):
        if tag.find(types):continue
        if tag.find_parent(["table"]) and tag.name not in ("td","th"):continue
        if tag.find_parent(["li"]) and tag.name!="li":continue
        phrase=clean(tag.get_text(" ",strip=True))
        if not phrase or re.fullmatch(r"[\W_]+",phrase):continue
        blocks.append(phrase)
    print("Visible leaf blocks:",len(blocks),flush=True)
    print("First 45 blocks:",repr(blocks[:45])[:6000],flush=True)
    print("Roman candidates:",repr([(i,b,blocks[i+1][:80] if i+1<len(blocks) else '') for i,b in enumerate(blocks) if re.fullmatch(r"[IVXLCDM]+\.",b)][:85])[:12000],flush=True)
    print("Last 12 blocks:",repr(blocks[-12:])[:3500],flush=True)
    return blocks

def extract():
    blocks=get_blocks(fetch())
    # Find the start of Jefferson's narrative by its first known section.
    candidates=[i for i,b in enumerate(blocks) if b in ("I.","I") and
        "JOSEPH AND MARY" in " ".join(blocks[i+1:i+4]).upper()]
    if len(candidates)!=1:
        raise ValueError(f"Expected exactly one opening section with Joseph and Mary, found {candidates}.")
    start=candidates[0]
    front=blocks[:start]
    pref=[i for i,b in enumerate(front) if b.upper()=="PREFACE."]
    table=[i for i,b in enumerate(front) if b.upper()=="A TABLE"]
    syllabus=[i for i,b in enumerate(front) if b.upper().startswith("SYLLABUS OF AN ESTIMATE")]
    if len(pref)!=1 or len(table)!=1 or len(syllabus)!=1 or not(pref[0]<table[0]<syllabus[0]<start):
        raise ValueError(f"The 1902 preface, source table, or supplementary writings are missing: {pref,table,syllabus,start}.")
    intro=[
      ("1902 Editor's Preface",front[pref[0]+1:table[0]]),
      ("Jefferson's Table of Gospel Passages",front[table[0]+1:syllabus[0]]),
      ("Jefferson's Related Writings (1902 Supplement)",front[syllabus[0]:]),
    ]
    for label,ps in intro:
        if len(" ".join(ps).split())<100:
            raise ValueError(f"Introductory source section '{label}' appears incomplete.")
    chapters=[]
    active=None
    for i in range(start,len(blocks)):
        block=blocks[i]
        numeral=re.fullmatch(r"([IVXLCDM]+)\.",block)
        if numeral:
            n=len(chapters)+1
            if active is not None:chapters.append(active)
            n=len(chapters)+1
            if roman(n)!=numeral.group(1):
                raise ValueError(f"Chapter order breaks at {numeral.group(1)}; expected {roman(n)}.")
            if i+1>=len(blocks):raise ValueError("Final chapter heading has no title.")
            title=blocks[i+1]
            if not 5<len(title)<180:raise ValueError("Abnormal section title "+title)
            active={"number":n,"title":title,"paragraphs":[]}
            continue
        if active is None:raise ValueError("Narrative starts without chapter I.")
        if i>start and i-1>=start and re.fullmatch(r"[IVXLCDM]+\.",blocks[i-1]):continue
        if block.startswith("This work was published") or block.startswith("Retrieved from") or block.startswith("Public domain Public domain"):
            break
        if block.startswith("Text is available under the Creative Commons"):
            break
        if block.startswith("Categories:") or block=="Privacy policy":break
        active["paragraphs"].append(block)
    if active:chapters.append(active)
    if len(chapters)!=69 or [c["number"] for c in chapters]!=list(range(1,70)):
        raise ValueError(f"Expected 69 complete narrative sections, found {len(chapters)}.")
    if any(not c["paragraphs"] or len(" ".join(c["paragraphs"]).split())<15 for c in chapters):
        raise ValueError("At least one numbered section has insufficient historical text.")
    last=" ".join(chapters[-1]["paragraphs"])
    if "laid they Jesus" not in last or "sepulchre" not in last or "departed" not in last:
        raise ValueError("The original ending, Jesus's burial, is missing.")
    out=["THE LIFE AND MORALS OF JESUS OF NAZARETH.","1902 ENGLISH EDITION. THOMAS JEFFERSON."]
    for title,ps in intro:
        out.append("EDITORIAL SECTION: "+title)
        out.extend(ps)
    for ch in chapters:
        out.append(f"CHAPTER {roman(ch['number'])}. {ch['title']}")
        out.extend(ch["paragraphs"])
    full="\n\n".join(out).strip()+"\n"
    count=len(full.split())
    if count<14000 or count>60000:raise ValueError(f"Word-count sanity check failed: {count}.")
    for n in range(1,70):
        if not re.search(rf"(?m)^CHAPTER {roman(n)}\. .+$",full):
            raise ValueError(f"Chapter {n} missing.")
    print("COMPLETE EDITION VERIFIED:",len(chapters),"chapters;",count,"words; prefatory and supplementary sections intact.",flush=True)
    print("Book ending:",full[-280:],flush=True)
    return full

def main():
    book=extract()
    page=ROOT/PAGE
    if not page.exists():raise ValueError("Standard reader page not in repository.")
    html=page.read_text(encoding="utf-8")
    for tag in ("section","page","voice","speed","size","dark","autoturn","bookmark","settings-toggle","play"):
        if f'id="{tag}"' not in html:raise ValueError("Required Ophelia control missing: "+tag)
    if "ophelia-narration.js" not in html:raise ValueError("Standard narration engine missing.")
    TEXT.parent.mkdir(parents=True,exist_ok=True)
    TEXT.write_text(book,encoding="utf-8")
    catalog=ROOT/"catalog.html"
    c=catalog.read_text(encoding="utf-8")
    if PAGE not in c:
        anchor="const catalogOnlyBooks=["
        if c.count(anchor)!=1:raise ValueError("Expected one catalog insertion point.")
        card="""\n {title:'The Life and Morals of Jesus of Nazareth',author:'Thomas Jefferson · c. 1820 · 1902 English edition',href:'the-life-and-morals-of-jesus-of-nazareth.html',image:'https://tile.loc.gov/storage-services/master/mss/mtj/mtj7/059/0400/0459.jpg',alt:'Authentic public-domain 1904 Government Printing Office title page preserved by the Library of Congress',description:'Jefferson’s private arrangement of Gospel teachings, in the complete 69-section historical English transcription with editorial material. Read and listen within our own library.',genre:'American History & Political Thought'},\n"""
        catalog.write_text(c.replace(anchor,anchor+card,1),encoding="utf-8")
    sitemap=ROOT/"sitemap.xml"
    xml=sitemap.read_text(encoding="utf-8")
    url="https://opheliasopenbooks.github.io/website/"+PAGE
    if url not in xml:
        if xml.count("</urlset>")!=1:raise ValueError("Sitemap malformed.")
        sitemap.write_text(xml.replace("</urlset>",f"  <url><loc>{url}</loc></url>\n</urlset>"),encoding="utf-8")
    print("Complete 69-section local Jefferson reader is now eligible for publication.",flush=True)

if __name__=="__main__":
    main()
