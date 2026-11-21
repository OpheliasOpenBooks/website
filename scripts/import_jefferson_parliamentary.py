#!/usr/bin/env python3
"""Import complete 53-section parliamentary manual by Thomas Jefferson.
Source: public-domain 1812 second edition, with Jefferson's later additions;
first edition appeared 1801. Never label the 1812 text as an 1801 facsimile.
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
SOURCE_URL="https://constitution.org/1-History/Founders/tj/tj-mpp.htm"
def download():
    request=Request(SOURCE_URL,headers={
       "User-Agent":"OpheliasOpenBook/1.0 (historical public-domain reading library)",
       "Accept":"text/html,application/xhtml+xml"})
    for attempt in range(3):
        try:
            with urlopen(request,timeout=75) as response:blob=response.read()
            if len(blob)<70000:raise ValueError(f"1812 historical text appears too small: {len(blob)} bytes")
            print("Downloaded 1812 second edition, with author's additions:",len(blob),"bytes",flush=True)
            return BeautifulSoup(blob,"html.parser")
        except Exception as exc:
            print("Historical source retrieval failed:",repr(exc),flush=True)
            time.sleep((attempt+1)*3)
    raise RuntimeError("1812 source was not available; no partial edition will be published.")

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
    for node in soup.select("script,style,noscript,iframe,nav,footer, .footnote-ref, .fnanchor"):
        node.decompose()
    # Original 1812 manual starts at its own Preface, after the table of contents,
    # and closes at THE END; the six contemporary notes follow that line.
    nodes=soup.find_all(["h1","h2","h3","h4","h5","h6","p","li","table"])
    upper=lambda x:clean(x.get_text(" ",strip=True)).upper()
    prefaces=[i for i,n in enumerate(nodes) if n.name.startswith("h") and upper(n) in ("PREFACE","PREFACE.")]
    if len(prefaces)!=1:raise ValueError(f"Historical preface heading missing: {len(prefaces)}")
    start=prefaces[0]
    ends=[i for i in range(start+1,len(nodes)) if nodes[i].name.startswith("h") and upper(nodes[i]) in ("THE END","THE END.")]
    if len(ends)!=1:raise ValueError(f"End of second edition ambiguous: {len(ends)}")
    end=ends[0]
    print("DEBUG heading tags:",[(n.name,upper(n)[:95]) for n in nodes[start+1:end] if n.name.startswith("h")][:15],flush=True)
    print("DEBUG short SEC candidates:",[(n.name,clean(n.get_text(" ",strip=True))[:105]) for n in nodes[start+1:end] if len(clean(n.get_text(" ",strip=True)))<140 and re.search(r"\bSEC\.",clean(n.get_text(" ",strip=True)),re.I)][:75],flush=True)
    lines=["A MANUAL OF PARLIAMENTARY PRACTICE.","PREFACE."]
    count=0
    section_words=[]
    for node in nodes[start+1:end]:
        if node.name=="table":
            for tr in node.find_all("tr"):
                cells=[clean(c.get_text(" ",strip=True)) for c in tr.find_all(["th","td"],recursive=False)]
                if any(cells):lines.append(" — ".join(c for c in cells if c))
            continue
        if node.find_parent(["table","li","p"]):continue
        value=clean(node.get_text(" ",strip=True))
        if not value:continue
        match=re.match(r"^SEC\.\s+([IVXLCDM]+)\.$",value,flags=re.I) if node.name.startswith("h") else None
        if match:
            count+=1
            if roman(count)!=match.group(1).upper():
                raise ValueError(f"Missing or out-of-order section: expected {roman(count)}, saw {match.group(1)}")
            lines.append("SECTION "+roman(count)+".")
            section_words.append(0)
        elif node.name.startswith("h"):
            lines.append(value)
        else:
            if value in ("* * *","—","---") or re.fullmatch(r"\d{1,3}",value):continue
            lines.append(value)
            if section_words:section_words[-1]+=len(value.split())
    if count!=53:raise ValueError(f"Expected 53 complete sections; got {count}.")
    if any(n<18 for n in section_words):raise ValueError(f"One or more sections are truncated: {section_words}")
    if not any("IMPEACHMENT" in x for x in lines[-70:]):
        raise ValueError("Final impeachment chapter missing.")
    # Notes printed with the author's 1812 edition belong to the book; put them
    # in a separate section so the user can skip them during ordinary listening.
    # The original note callout symbols are not spoken with running paragraphs.
    footnotes=[]
    started=False
    for node in nodes[end+1:]:
        if node.find_parent(["p","li","table"]):continue
        if node.name.startswith("h"):break
        v=clean(node.get_text(" ",strip=True))
        if not v:continue
        if "Text Version" in v or "Rendered into HTML" in v:break
        if re.match(r"^\d\.\s",v):
            index=int(v[0])
            if index==len(footnotes)+1 and index<=6:
                footnotes.append(v)
                started=True
                continue
        if started and footnotes and not re.fullmatch(r"[\W_]+",v):
            if re.match(r"^[A-Za-z]",v) and len(v)>30:
                footnotes[-1]+=" "+v
        if len(footnotes)==6:
            # Some original notes continue over several paragraphs; preserve
            # their continued prose until publisher footer, but not web ads.
            continue
    if len(footnotes)!=6:
        raise ValueError(f"Expected six historical notes from 1812 edition; found {len(footnotes)}")
    lines.append("NOTES.")
    lines.extend(footnotes)
    full="\n\n".join(lines)+"\n"
    if len(full.split())<16000:
        raise ValueError(f"Manual source incomplete: only {len(full.split())} words")
    if "THE ANAS" in full.upper() or "LSAT" in full.upper() or "TEST KING" in full.upper():
        raise ValueError("Non-manual source content included in text.")
    for n in range(1,54):
        if full.count("\n\nSECTION "+roman(n)+".\n\n")!=1:
            raise ValueError(f"Section {n} missing or duplicated")
    if full.count("\n\nNOTES.\n\n")!=1:raise ValueError("Historical notes missing")
    print(f"VERIFIED: 1812 second edition of 1801 Manual: 53 sections, preface, six historical notes; {len(full.split()):,} words",flush=True)
    print("Opening:",full[:150].replace("\n"," / "),flush=True)
    print("Closing:",full[-150:].replace("\n"," / "),flush=True)
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
        entry="""\n {title:'A Manual of Parliamentary Practice',author:'Thomas Jefferson · 1801 · 1812 second edition',href:'a-manual-of-parliamentary-practice-jefferson.html',image:'public/art/jefferson-manual-1801-titlepage.svg',alt:'Period-faithful reconstruction of the 1801 Washington City title page of Jefferson’s parliamentary manual',description:'Jefferson explains fair and orderly legislative proceedings across 53 sections, including debate, petitions, amendments, treaties, and impeachment. The complete manual is narrated in our own reader.',genre:'American History & Political Thought'},\n"""
        catalog.write_text(contents.replace(marker,marker+entry,1),encoding="utf-8")
    sitemap=ROOT/"sitemap.xml"
    xml=sitemap.read_text(encoding="utf-8")
    uri="https://opheliasopenbooks.github.io/website/"+PAGE
    if uri not in xml:
        if xml.count("</urlset>")!=1:raise ValueError("Sitemap closing tag changed.")
        sitemap.write_text(xml.replace("</urlset>","  <url><loc>"+uri+"</loc></url>\n</urlset>"),encoding="utf-8")
    print("Reader and catalog now include the complete 53-section manual.",flush=True)
if __name__=="__main__":main()
