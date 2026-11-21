#!/usr/bin/env python3
"""Import complete 53-section parliamentary manual by Thomas Jefferson.
Source: Project Gutenberg eBook 56578, THE WRITINGS OF THOMAS JEFFERSON,
vol. IX, edited by H. A. Washington (1861); source work first printed 1801.
The 1861 transcription is not represented as a facsimile of the first edition.
No catalog change is made unless all 53 historical sections verify.
"""
from __future__ import annotations
from pathlib import Path
from urllib.request import Request, urlopen
from bs4 import BeautifulSoup, Tag
import re
import time

ROOT=Path(__file__).resolve().parents[1]
PAGE="a-manual-of-parliamentary-practice-jefferson.html"
TEXT=ROOT/"public/texts/jefferson-parliamentary-manual/complete.txt"
COVER=ROOT/"public/art/jefferson-manual-1801-titlepage.svg"
URLS=[
 "https://www.gutenberg.org/files/56578/56578-h/56578-h.htm",
 "https://www.gutenberg.org/cache/epub/56578/pg56578-images.html",
 "https://www.gutenberg.org/cache/epub/56578/pg56578.html",
]
def download():
    for url in URLS:
        for attempt in range(2):
            try:
                request=Request(url, headers={"User-Agent":"OpheliasOpenBook/1.0 (historical public-domain library; reader import)", "Accept":"text/html"})
                with urlopen(request,timeout=75) as response:
                    content=response.read()
                if len(content)<500000:raise ValueError(f"Unusually short source HTML: {len(content)} bytes")
                print("Downloaded:",url,len(content),"bytes",flush=True)
                return BeautifulSoup(content,"html.parser")
            except Exception as exc:
                print("Source unavailable:",url,str(exc),flush=True)
                time.sleep(2)
    raise RuntimeError("Could not retrieve Gutenberg eBook 56578.")
def roman(n):
    values=[(1000,"M"),(900,"CM"),(500,"D"),(400,"CD"),(100,"C"),(90,"XC"),(50,"L"),(40,"XL"),(10,"X"),(9,"IX"),(5,"V"),(4,"IV"),(1,"I")]
    out=""
    for x,digit in values:
        while n>=x:out+=digit;n-=x
    return out
def clean(s):
    s=s.replace("\u00ad","").replace("\u200b","")
    s=re.sub(r"\s+"," ",s)
    s=re.sub(r"(?<!\w)\[\s*\d+\s*\]","",s)
    return s.strip()
def extract():
    soup=download()
    # Constrain the extraction to Book IV, Part IV alone.
    # The other hundreds of pages in Gutenberg's anthology MUST NOT enter our copy.
    for tag in soup.select("script,style,noscript,.pagenum,.pgnum,.footnote,.footnotes,.fnanchor,sup.footnote"):
        tag.decompose()
    nodes=soup.find_all(["h2","h3","h4","h5","h6","p","table"])
    header=lambda x:clean(x.get_text(" ",strip=True)).upper()
    starts=[i for i,tag in enumerate(nodes) if tag.name=="h2" and re.match(r"^PART\s+IV\.$",header(tag))]
    if len(starts)!=1:raise ValueError(f"Expected one main Part IV heading, found {len(starts)}.")
    start=starts[0]
    ends=[i for i in range(start+1,len(nodes)) if nodes[i].name=="h2" and re.match(r"^PART\s+V\.$",header(nodes[i]))]
    if not ends:raise ValueError("Next independent work (Part V) boundary not found.")
    end=ends[0]
    prefaces=[i for i in range(start,end) if nodes[i].name in ("h3","h4") and header(nodes[i])=="PREFACE."]
    if len(prefaces)!=1:raise ValueError("Jefferson's manual preface missing or duplicated.")
    # Distinguish section headings from references in prose, and verify strict
    # sequence: I, II, III, ... LIII (53).
    lines=["A MANUAL OF PARLIAMENTARY PRACTICE.","PREFACE."]
    count=0
    section_words=[]
    for tag in nodes[prefaces[0]+1:end]:
        if tag.name=="table":
            rows=[]
            for tr in tag.find_all("tr"):
                cells=[clean(c.get_text(" ",strip=True)) for c in tr.find_all(["td","th"],recursive=False)]
                if any(cells):rows.append(" — ".join(c for c in cells if c))
            if rows:lines.extend(rows)
            continue
        if tag.find_parent("table"):continue
        value=header(tag) if tag.name.startswith("h") else clean(tag.get_text(" ",strip=True))
        if not value:continue
        match=re.match(r"^SECTION\s+([IVXLCDM]+)\.$",value) if tag.name.startswith("h") else None
        if match:
            count+=1
            if roman(count)!=match.group(1):
                raise ValueError(f"Missing or unordered section: expected {roman(count)}, saw {match.group(1)}")
            lines.append("SECTION "+roman(count)+".")
            section_words.append(0)
        elif tag.name.startswith("h"):
            if re.match(r"^A MANUAL OF PARLIAMENTARY PRACTICE",value):
                continue
            lines.append(value)
        else:
            # Table of contents is excluded because scanning begins at Preface.
            # Printed pagination and Gutenberg-only decorations are omitted.
            if re.match(r"^\d{1,3}$",value):continue
            lines.append(value)
            if section_words:section_words[-1]+=len(value.split())
    if count!=53:raise ValueError(f"Expected 53 numbered sections; found {count}")
    if any(n<20 for n in section_words):raise ValueError(f"One or more sections appear truncated: {section_words}")
    full="\n\n".join(lines)+"\n"
    if len(full.split())<17000:raise ValueError(f"Manual appears incomplete: {len(full.split())} words")
    if "IMPEACHMENT." not in full[-12000:].upper():raise ValueError("Final impeachment section absent")
    if "THE ANAS" in full.upper() or "END OF THE PROJECT GUTENBERG" in full:
        raise ValueError("Unrelated material from the anthology was imported.")
    for n in range(1,54):
        if full.count("\n\nSECTION "+roman(n)+".\n\n")!=1:
            raise ValueError(f"Section {n} missing or duplicated")
    print("VERIFIED:",count,"sections;",len(full.split()),"words; source 1861 historical anthology",flush=True)
    print("Opening:",full[:160].replace("\n"," / "),flush=True)
    print("Closing:",full[-230:].replace("\n"," / "),flush=True)
    return full
def main():
    full=extract()
    # Import only after every source and completeness condition passed.
    if not (ROOT/PAGE).exists() or not COVER.exists():
        raise ValueError("Ophelia reader or title-page artwork not staged.")
    reader=(ROOT/PAGE).read_text(encoding="utf-8")
    for control in ("section","page","voice","speed","size","dark","autoturn","bookmark","settings-toggle","play"):
        if 'id="'+control+'"' not in reader:raise ValueError("Missing shared reader control "+control)
    if "ophelia-narration.js" not in reader:raise ValueError("Standard narration engine missing")
    TEXT.parent.mkdir(parents=True,exist_ok=True)
    TEXT.write_text(full,encoding="utf-8")
    catalog=ROOT/"catalog.html"
    contents=catalog.read_text(encoding="utf-8")
    if PAGE not in contents:
        marker="const catalogOnlyBooks=["
        if contents.count(marker)!=1:raise ValueError("Catalog insertion marker changed.")
        entry="""\n {title:'A Manual of Parliamentary Practice',author:'Thomas Jefferson · 1801 · 1861 historical transcription',href:'a-manual-of-parliamentary-practice-jefferson.html',image:'public/art/jefferson-manual-1801-titlepage.svg',alt:'Period-faithful reconstruction of the 1801 Washington City title page of Jefferson’s parliamentary manual',description:'Jefferson explains fair and orderly legislative proceedings across 53 sections, including debate, petitions, amendments, treaties, and impeachment. The complete manual is narrated in our own reader.',genre:'American History & Political Thought'},\n"""
        catalog.write_text(contents.replace(marker,marker+entry,1),encoding="utf-8")
    sitemap=ROOT/"sitemap.xml"
    xml=sitemap.read_text(encoding="utf-8")
    uri="https://opheliasopenbooks.github.io/website/"+PAGE
    if uri not in xml:
        if xml.count("</urlset>")!=1:raise ValueError("Sitemap closing tag changed.")
        sitemap.write_text(xml.replace("</urlset>","  <url><loc>"+uri+"</loc></url>\n</urlset>"),encoding="utf-8")
    print("Reader and catalog now include the complete 53-section manual.",flush=True)
if __name__=="__main__":main()
