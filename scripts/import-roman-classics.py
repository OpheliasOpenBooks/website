#!/usr/bin/env python3
"""Archive complete surviving original-language Suetonius and Tacitus and
public-domain nineteenth-century English translations in local Ophelia readers.
Source: Perseus Digital Library TEI, CC BY-SA 4.0 transcription.
"""
import json, re, pathlib, urllib.request, time, hashlib
import xml.etree.ElementTree as ET

BASE="https://raw.githubusercontent.com/PerseusDL/canonical-latinLit/master/data/"
T="{http://www.tei-c.org/ns/1.0}"
ROOT=pathlib.Path("public/books")
NAMES=["Julius Caesar","Augustus","Tiberius","Caligula","Claudius","Nero","Galba","Otho","Vitellius","Vespasian","Titus","Domitian"]
ANNALS=[1,2,3,4,5,6,11,12,13,14,15,16]
ROMAN={1:"I",2:"II",3:"III",4:"IV",5:"V",6:"VI",11:"XI",12:"XII",13:"XIII",14:"XIV",15:"XV",16:"XVI"}
WC=lambda s:len(s.split())

def get(url,minimum=3000,maximum=4000000):
    last=None
    for attempt in range(4):
        try:
            req=urllib.request.Request(url,headers={"User-Agent":"OpheliaOpenBook/1.0 (public-domain text preservation)"})
            with urllib.request.urlopen(req,timeout=60) as r:
                content=r.read(maximum+1)
            if len(content)<minimum or len(content)>maximum:raise ValueError("Unusual source bytes "+str(len(content)))
            print("FETCHED",url,len(content),flush=True)
            return content
        except Exception as e:
            last=e
            print("RETRY",attempt,url,str(e),flush=True)
            time.sleep(2+attempt*3)
    raise RuntimeError("Source unavailable "+url+": "+str(last))

def text_of(node):
    # Footnote symbols, internal reference anchors, and editorial notes are not narrative.
    import copy
    node=copy.deepcopy(node)
    for child in list(node.iter()):
        if child.tag in (T+"note",T+"pb",T+"milestone",T+"bibl"):
            for parent in node.iter():
                if child in list(parent):
                    idx=list(parent).index(child)
                    if child.tail:
                        if idx: parent[idx-1].tail=(parent[idx-1].tail or "")+child.tail
                        else: parent.text=(parent.text or "")+child.tail
                    parent.remove(child)
                    break
    string="".join(node.itertext())
    string=re.sub(r"\s+"," ",string).strip()
    string=re.sub(r"\s+([,.!?;:])",r"\1",string)
    string=re.sub(r"([(\[“‘])\s+",r"\1",string)
    return string

def paras(node):
    out=[]
    for p in node.iter(T+"p"):
        v=text_of(p)
        if v and WC(v)>1:out.append(v)
    if not out:
        v=text_of(node)
        if WC(v)>3:out=[v]
    return out

def root_xml(url):
    data=get(url)
    try:
        root=ET.fromstring(data)
    except ET.ParseError as e:raise ValueError("Source XML not parseable "+url+" "+str(e))
    copyright_info=" ".join(x.text or "" for x in root.iter(T+"licence"))
    # The repository README licenses every component CC BY-SA 4.0 unless otherwise
    # indicated; older Perseus TEI files omit an inline licence element.
    # See https://github.com/PerseusDL/canonical-latinLit/blob/master/README.md
    if copyright_info and ("Creative Commons" not in copyright_info or "Attribution" not in copyright_info):
        raise ValueError("Non-matching component license: "+url)
    if not copyright_info:print("LICENSE inherited from Perseus repository README: CC BY-SA 4.0",url,flush=True)
    return root

def chapters(root,subtype="chapter"):
    return [x for x in root.iter(T+"div") if x.attrib.get("type")=="textpart" and x.attrib.get("subtype")==subtype]

def make_sections(kind,language):
    results=[]
    if kind=="suetonius":
        for i,name in enumerate(NAMES):
            urn=f"phi1348.abo{i+11:03d}"
            url=f"{BASE}phi1348/abo{i+11:03d}/{urn}.perseus-{'eng2' if language=='en' else 'lat2'}.xml"
            root=root_xml(url)
            divs=chapters(root)
            if len(divs)<15:raise ValueError(f"Incomplete {name} biography: only {len(divs)} chapters")
            volume=[]
            for ch in divs:
                p=paras(ch)
                if p:
                    label=f"{name} · Section {ch.attrib.get('n','?')}" if language=="en" else f"{name} · Caput {ch.attrib.get('n','?')}"
                    volume.append({"name":label,"paragraphs":p})
            if len(volume)<15 or sum(WC(p) for s in volume for p in s["paragraphs"])<1100:
                raise ValueError("Empty or incomplete biography "+name)
            print("BIOGRAPHY",language,name,"chapters",len(volume),"words",sum(WC(p) for s in volume for p in s["paragraphs"]),flush=True)
            results.extend(volume)
    else:
        url=f"{BASE}phi1351/phi005/phi1351.phi005.perseus-{'eng2' if language=='en' else 'lat2'}.xml"
        root=root_xml(url)
        bookdivs=chapters(root,"book")
        booknums=[int(x.attrib.get("n","0")) for x in bookdivs]
        print("ANNALS",language,"books",booknums,flush=True)
        if booknums!=ANNALS:raise ValueError("Mismatch in surviving Tacitus books, found: "+str(booknums))
        for book in bookdivs:
            n=int(book.attrib["n"])
            sub=chapters(book)
            volume=[]
            if sub:
                for ch in sub:
                    p=paras(ch)
                    if p:
                        name=f"Book {ROMAN[n]} · Section {ch.attrib.get('n','?')}" if language=="en" else f"Liber {ROMAN[n]} · Caput {ch.attrib.get('n','?')}"
                        volume.append({"name":name,"paragraphs":p})
            else:
                p=paras(book)
                if p:volume.append({"name":f"{'Book' if language=='en' else 'Liber'} {ROMAN[n]}","paragraphs":p})
            if not volume or sum(WC(p) for s in volume for p in s["paragraphs"])<200:
                raise ValueError("Surviving book "+str(n)+" text unexpectedly missing")
            print("ANNALS BOOK",language,n,"sections",len(volume),"words",sum(WC(p) for s in volume for p in s["paragraphs"]),flush=True)
            results.extend(volume)
    return results

def save(kind,language,sections):
    title="The Twelve Caesars" if kind=="suetonius" else "The Annals"
    author="Suetonius" if kind=="suetonius" else "Tacitus"
    path=ROOT/kind/language
    path.mkdir(parents=True,exist_ok=True)
    words=sum(WC(p) for s in sections for p in s["paragraphs"])
    bound={"suetonius":{"en":35000,"la":27000},"annals":{"en":60000,"la":45000}}[kind][language]
    if words<bound or len(sections)<65:raise ValueError(f"Possibly incomplete {kind}/{language}: {words} words, {len(sections)} sections")
    # Sections, not books, form the page/part choices. Never truncate long sections.
    parts=[];group=[];total=0
    for section in sections:
        length=WC(" ".join(section["paragraphs"]))
        if group and (total+length>4200 or len(group)>=16):
            parts.append(group);group=[];total=0
        group.append(section);total+=length
    if group:parts.append(group)
    metadata=[]
    for i,group in enumerate(parts,1):
        name=group[0]["name"]
        file=f"part-{i:03d}.json"
        d={"title":title,"author":author,"language":language,"readOnly":language=="la","part":i,"partCount":len(parts),"sections":group}
        (path/file).write_text(json.dumps(d,ensure_ascii=False,separators=(",",":")),encoding="utf-8")
        metadata.append({"part":i,"file":file,"name":name,"sections":len(group),"words":sum(WC(p) for s in group for p in s["paragraphs"])})
    if sum(p["words"] for p in metadata)!=words:raise ValueError("Word conservation failed")
    manifest={"title":title,"author":author,"language":language,"readOnly":language=="la",
      "source":"Perseus Digital Library historical TEI transcription, via https://github.com/PerseusDL/canonical-latinLit",
      "transcriptionLicense":"CC BY-SA 4.0",
      "attribution":"Perseus Digital Library, Trustees of Tufts University; 1883 Thomson English translation of Suetonius or nineteenth-century Church/Brodribb English translation of Tacitus; 1906 Latin editions; editorial annotations excluded",
      "original":kind=="suetonius" and "De vita Caesarum" or "Annales",
      "survivingBooks":ANNALS if kind=="annals" else NAMES,
      "englishTranslation":kind=="suetonius" and "Alexander Thomson (1796; 1883 Gebbie edition)" or "Alfred John Church and William Jackson Brodribb (1876)",
      "wordCount":words,"sections":len(sections),"parts":metadata}
    (path/"manifest.json").write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
    print("HOSTED",kind,language,"words",words,"parts",len(parts),"chapters",len(sections),flush=True)
    return manifest

def archive_art(name,urls):
    for url in urls:
        try:
            b=get(url,10000,1500000)
            if b[:2]!=b"\xff\xd8":raise ValueError("not JPEG")
            folder=pathlib.Path("public/art");folder.mkdir(parents=True,exist_ok=True)
            (folder/name).write_bytes(b)
            print("ARCHIVED",name,len(b),hashlib.sha256(b).hexdigest(),flush=True)
            return
        except Exception as e:
            print("ART BACKUP",name,str(e),flush=True)
    raise ValueError("Could not verify original historical artwork: "+name)

def catalog(cards):
    f=pathlib.Path("index.html")
    html=f.read_text(encoding="utf-8")
    marker='<section class="wrap section" id="books">'
    if marker not in html:raise ValueError("Main catalog insertion marker missing")
    inserts=""
    for title,author,file,cover,edition,description in cards:
        if f'href="{file}"' in html:continue
        inserts+=f'\n<article class="book"><img src="public/art/{cover}" alt="Historically documented public-domain frontispiece or title page for {title}" width="640" height="340" loading="lazy" style="object-fit:contain;background:#efe6d5" onerror="this.onerror=null;this.src=&quot;public/art/historical-cover-fallback.svg&quot;"><div><span class="pill">New · Ancient Roman history</span><h3>{title}</h3><div class="eyebrow">{author} · {edition}</div><p>{description}</p><a class="button" href="{file}">Read &amp; Listen &nbsp; →</a></div></article>\n'
    if inserts:
        html=html.replace(marker,marker+inserts,1)
        f.write_text(html,encoding="utf-8")
    print("CATALOG published",len(cards),"works",flush=True)

for work in ("suetonius","annals"):
    for language in ("en","la"):
        save(work,language,make_sections(work,language))
archive_art("suetonius-1883-title-page.jpg",[
    "https://tile.loc.gov/image-services/iiif/public%3Agdcmassbookdig%3Alivesoftwelvecsa00suet%3Alivesoftwelvecsa00suet_0005/full/pct%3A50.0/0/default.jpg"
])
archive_art("tacitus-1598-lipsius-titlepage.jpg",[
    "https://commons.wikimedia.org/wiki/Special:FilePath/Lipsius_manuscript.jpg"
])
catalog([
 ("The Twelve Caesars","Suetonius","the-twelve-caesars-suetonius.html","suetonius-1883-title-page.jpg","Thomson translation · 1796 / 1883",
 "The lives of Julius Caesar, Augustus, Tiberius, Caligula, Claudius, Nero and six more rulers of Rome. Complete surviving biographies, narrated in English, with the original Latin read-only."),
 ("The Annals","Tacitus","the-annals-tacitus.html","tacitus-1598-lipsius-titlepage.jpg","Church &amp; Brodribb translation · 1876",
 "Imperial intrigue and political terror from Tiberius through Nero. All the surviving text (Books I–VI and XI–XVI), with its ancient gaps acknowledged, locally narrated in English and available in Latin."),
])
print("SUCCESS: both complete surviving Roman works, English narration and Latin originals, locally hosted",flush=True)
