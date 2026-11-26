"""Import all three public-domain volumes of George Offor's Bunyan edition."""
from pathlib import Path
from urllib.request import Request, urlopen
import re, json, hashlib, html
root=Path(__file__).resolve().parents[1]
data=root/'public/books/bunyan-works'
data.mkdir(parents=True,exist_ok=True)
sources=[]
volumes=[(6046,'FIRST','Experimental, doctrinal and practical','67ed00de84e946567a894ffce2b1f33bf06fd77d'),(6047,'SECOND','Experimental, doctrinal and practical','88fba54f6ab25e6fa0665a32d5962a0ad723e84e'),(6048,'THIRD','Allegorical, figurative and symbolical','b1c5c23801ebfd6811fa06e93f9c6d91d15f7347')]
def download(n, ebook, sha):
    urls=[f'https://www.gutenberg.org/cache/epub/{ebook}/pg{ebook}.txt',f'https://raw.githubusercontent.com/GITenberg/Works-of-John-Bunyan-Volume-0{n}_{ebook}/master/{ebook}.txt']
    for url in urls:
        try:
            raw=urlopen(Request(url,headers={'User-Agent':'OpheliaOpenBooks public domain text importer'}),timeout=60).read()
            try: decoded=raw.decode('utf-8-sig')
            except UnicodeDecodeError: decoded=raw.decode('cp1252')
            text=decoded.replace('\r\n','\n').replace('\r','\n')
            start=re.search(r'(?im)^\s*\*{3}\s*START OF (?:THE|THIS) PROJECT GUTENBERG EBOOK[^\n]*\*{3}\s*$',text)
            end=re.search(r'(?im)^\s*\*{3}\s*END OF (?:THE|THIS) PROJECT GUTENBERG EBOOK[^\n]*\*{3}',text)
            if not start or not end or end.start()<=start.end():
                raise ValueError('Missing Gutenberg boundaries')
            body=text[start.end():end.start()].strip()
            title=re.search(r'(?im)^\s*THE WORKS OF JOHN BUNYAN\.?\s*$',body)
            if title: body=body[title.start():].strip()
            else: raise ValueError('Missing title')
            if len(body.split())<350000 or not re.search(r'VOLUME\s+'+volumes[n-1][1],body[:10000],re.I) or 'GEORGE OFFOR' not in body[:10000].upper():
                raise ValueError('Incomplete or wrong volume')
            required={1:['GRACE ABOUNDING'],2:["THE SAINTS' KNOWLEDGE"],3:["THE PILGRIM'S PROGRESS","THE HOLY WAR","MR. BADMAN"]}[n]
            normalized=body.upper().replace('’',"'").replace('\n',' ')
            for phrase in required:
                if not re.search(r'\s+'.join(re.escape(x) for x in phrase.split()),normalized):
                    raise ValueError('Missing '+phrase)
            if 'raw.githubusercontent.com' in url:
                actual=hashlib.sha1(('blob '+str(len(raw))+'\0').encode()+raw).hexdigest()
                if actual!=sha: raise ValueError('Mirror blob hash changed')
            return body,url,hashlib.sha256(raw).hexdigest()
        except Exception as exc: print(url,exc,flush=True)
    raise RuntimeError(f'Could not verify complete volume {n}')
def sections_for(body,n):
    sections=[]; current={'name':f'Volume {n} · Opening pages','paragraphs':[]}
    for raw in re.split(r'\n[ \t]*\n+',body):
        p=raw.strip()
        if not p: continue
        # Preserve verse/indented lines where possible, join wrapped prose.
        if len(p.splitlines())>1 and all(len(x.strip())<=65 for x in p.splitlines()) and any(x.startswith('  ') for x in p.splitlines()):
            p='\n'.join(x.rstrip() for x in p.splitlines())
        else: p=re.sub(r'\s+',' ',p)
        p=re.sub(r'\[\s*\d+\s*\]','',p)
        p=re.sub(r'(?<!\w)[*†‡]+(?!\w)','',p)
        p=re.sub(r'(?m)^#{1,6}\s+','',p).strip()
        if not p: continue
        # Use major uppercase source headings for navigation; retain them in the text.
        heading=' '.join(p.split())
        if 12<=len(heading)<=160 and re.search('[A-Z]{3}',heading) and heading==heading.upper() and len(heading.split())>=3 and not re.search(r'^\d|^BY |^EDITED BY|^VOLUME |^WITH AN|^AND A',heading) and not re.search(r'[!?]$',heading):
            if current['paragraphs']:
                sections.append(current)
                current={'name':heading.title(),'heading':p,'paragraphs':[]}
        current['paragraphs'].append(p)
    if current['paragraphs']: sections.append(current)
    assert len(sections)>=10 and sum(len(p.split()) for sec in sections for p in sec['paragraphs'])>=350000
    return sections
# Download and validate all volumes before any publication.
for n,(ebook,roman,topic,sha) in enumerate(volumes,1):
    body,url,digest=download(n,ebook,sha)
    sections=sections_for(body,n)
    (data/f'volume-{n}.json').write_text(json.dumps(sections,ensure_ascii=False,separators=(',',':')),encoding='utf-8')
    (data/f'volume-{n}-source.txt').write_text(body+'\n',encoding='utf-8')
    sources.append({'volume':n,'ebook':ebook,'url':url,'sha256':digest,'words':len(body.split()),'sections':len(sections)})
    print(sources[-1],flush=True)
(data/'manifest.json').write_text(json.dumps(sources,indent=2)+'\n',encoding='utf-8')
template=(root/'discourses-on-davila-john-adams.html').read_text(encoding='utf-8')
cover='public/art/bunyan-collected-works-titleplate.svg'
for n,(_,roman,topic,_) in enumerate(volumes,1):
    slug='works-of-john-bunyan.html' if n==1 else f'works-of-john-bunyan-volume-{n}.html'
    title=f'The Works of John Bunyan — Volume {n}'
    nav=' · '.join(f'<a href="{("works-of-john-bunyan.html" if v==1 else f"works-of-john-bunyan-volume-{v}.html")}">Volume {v}</a>' for v in range(1,4))
    h=template
    h=re.sub(r'<title>.*?</title>',f'<title>{title} · Ophelia’s Open Book</title>',h,count=1)
    h=h.replace('discourses-on-davila-john-adams.html',slug)
    h=re.sub(r'<meta property="og:type".*?\n<meta name="description".*?\n',f'<meta property="og:type" content="article"><meta property="og:title" content="{title}"><meta property="og:description" content="John Bunyan’s collected writings, edited by George Offor."><meta property="og:image" content="https://opheliasopenbooks.github.io/website/{cover}">\n<meta name="description" content="Read and listen to {title}, edited by George Offor.">\n',h,count=1)
    h=h.replace('John Adams Discourses on Davila reader','John Bunyan collected works reader')
    h=re.sub(r'<div class="book-heading">[^\n]*',f'<div class="book-heading"><div class="eyebrow">OPHELIA’S OPEN BOOK</div><h1>{title}</h1><p class="byline">John Bunyan · 1628–1688 · George Offor, editor (1853–1855)</p><p class="fine">{topic}</p><p class="fine">{nav} · <a href="pilgrims-progress.html">The Pilgrim’s Progress (separate reader)</a></p></div>',h,count=1)
    h=re.sub(r'<figure id="story-figure".*?</figure>',f'<figure id="story-figure" hidden><img id="opening-art" src="{cover}" alt="Period-inspired typographic title plate for the collected works" loading="eager"><figcaption>Original period-inspired title plate, not a historical facsimile.</figcaption></figure>',h,count=1)
    for a,b in [('Preparing the complete thirty-one discourses…','Preparing the volume…'),('John Adams · Political essays','John Bunyan · Collected works'),('Preface, Discourses &amp; Notes','Works &amp; Sections'),('Choose a discourse','Choose a work or section'),('Preparing discourses…','Preparing volume…'),('Title &amp; Introduction','Opening pages'),('Checking all 31 discourses…','Checking the complete volume…'),('ophelia-adams-discourses-on-davila-1790-v1',f'ophelia-bunyan-works-volume-{n}-v1'),('You have finished Discourses on Davila.',f'You have finished Volume {n}.'),('All 31 discourses, preface and postscript are ready. Press Read aloud to begin.','The complete volume is ready. Press Read aloud to begin.'),('Complete Discourses on Davila could not be loaded:','The collected works could not be loaded:'),('public/texts/adams-davila/complete.txt',f'public/books/bunyan-works/volume-{n}.json'),('ophelia-narration.js?v=1.4.14-pacing-number','ophelia-narration.js?v=1.4.27-bunyan')]:
        h=h.replace(a,b)
    h=re.sub(r'<div class="source">.*?</div>(?=</div></div></div><script)',f'<div class="source">The collected works of John Bunyan, edited by George Offor. The complete public-domain transcription of Volume {n} is locally hosted from <a href="https://www.gutenberg.org/ebooks/{volumes[n-1][0]}">Project Gutenberg</a>. Original editorial material is retained; distribution boilerplate and inline note markers are omitted from reading. <a href="public/books/bunyan-works/volume-{n}-source.txt">Read the source transcription.</a> Franklin names Bunyan’s works but does not identify all the separate editions he owned. Narration uses your browser’s English voice.</div>',h,count=1)
    a=h.index('function parseText(raw){');b=h.index('function paginate(sections){',a)
    h=h[:a]+"""function parseText(raw){
 const sections=JSON.parse(raw);
 if(!Array.isArray(sections)||sections.length<10||sections.some(s=>!s.name||!Array.isArray(s.paragraphs)||!s.paragraphs.length))throw Error('Incomplete volume data');
 return sections;
}
"""+h[b:]
    h=h.replace("if(paged.length<100||parsed.filter(p=>/^Discourse \\d+$/.test(p.name)).length!==31)throw Error('Expected the complete 31-discourse work.');","if(paged.length<900)throw Error('Expected a complete volume.');")
    # Avoid huge argument spread into a native function; build page options incrementally.
    h=h.replace("$('page').replaceChildren(...pages.map((_,i)=>new Option('Page '+(i+1),String(i))));","const pageOptions=document.createDocumentFragment();pages.forEach((_,i)=>pageOptions.append(new Option('Page '+(i+1),String(i))));$('page').replaceChildren(pageOptions);")
    assert 'Discourses on Davila' not in h and 'adams-davila' not in h and '31-discourse' not in h
    assert all('id="'+x+'"' in h for x in ['section','page','voice','speed','size','dark','autoturn','bookmark','settings-toggle','play'])
    (root/slug).write_text(h,encoding='utf-8')
(root/cover).write_text('''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 600"><rect width="420" height="600" fill="#e9dfc8"/><rect x="15" y="15" width="390" height="570" fill="none" stroke="#594535" stroke-width="3"/><rect x="23" y="23" width="374" height="554" fill="none" stroke="#96754b"/><g fill="#40372d" text-anchor="middle" font-family="Georgia,serif"><text x="210" y="85" font-size="14" letter-spacing="3">THE COLLECTED WRITINGS</text><text x="210" y="145" font-size="25">THE WORKS OF</text><text x="210" y="195" font-size="40">JOHN</text><text x="210" y="245" font-size="40">BUNYAN</text><text x="210" y="300" font-size="32">❦</text><text x="210" y="355" font-size="18">WITH INTRODUCTIONS</text><text x="210" y="385" font-size="18">AND NOTES</text><text x="210" y="448" font-size="17">EDITED BY GEORGE OFFOR</text><text x="210" y="495" font-size="18">THREE VOLUMES</text><text x="210" y="540" font-size="15">1853–1855 EDITION</text></g></svg>''',encoding='utf-8')
catalog=root/'catalog.html'
c=catalog.read_text(encoding='utf-8')
slug='works-of-john-bunyan.html'
if slug not in c:
    card=" {title:'The Works of John Bunyan — Collected Edition',author:'John Bunyan · 1628–1688 · George Offor’s three-volume edition',href:'works-of-john-bunyan.html',image:'public/art/bunyan-collected-works-titleplate.svg',alt:'Period-inspired typographic title plate for Bunyan’s collected works',description:'Benjamin Franklin loved Bunyan’s books as a boy. Explore spiritual autobiography, sermons and religious allegories about conscience, temptation, grace and the journey of faith, including Grace Abounding, The Holy War, The Life and Death of Mr. Badman and The Pilgrim’s Progress.',genre:'Religious Literature'},"
    assert c.count('const catalogOnlyBooks=[')==1
    c=c.replace('const catalogOnlyBooks=[','const catalogOnlyBooks=[\n'+card,1)
    c=c.replace(" 'pilgrims-progress.html':'Religious Allegory',"," 'pilgrims-progress.html':'Religious Allegory',\n 'works-of-john-bunyan.html':'Religious Literature',",1)
    c=c.replace(" 'pilgrims-progress.html':'ophelia-pilgrims-progress-bunyan-both-parts-alice-voice-v1',"," 'pilgrims-progress.html':'ophelia-pilgrims-progress-bunyan-both-parts-alice-voice-v1',\n 'works-of-john-bunyan.html':'ophelia-bunyan-works-volume-1-v1',",1)
    catalog.write_text(c,encoding='utf-8')
(root/'SOURCES-works-of-john-bunyan.md').write_text('''# John Bunyan — collected works
George Offor (1787–1864), editor; three-volume 1853–1855 edition. John Bunyan (1628–1688) and Offor's edition are public domain in the USA. Gutenberg transcriptions: https://www.gutenberg.org/ebooks/6046, https://www.gutenberg.org/ebooks/6047, https://www.gutenberg.org/ebooks/6048. Source URLs, checksums, counts and sections are recorded in the manifest. Original source files retain all volume contents; reader preparation removes distribution boilerplate and numbered inline markers, normalizes wrapped lines, and derives navigation from printed headings. The cover is newly made period-inspired typography, not a scan. Franklin named the Pilgrim's Progress and said he collected Bunyan's works in separate little volumes, without identifying each title or edition. Keep the existing separate Pilgrim's Progress reader. The collected edition is one catalog entry with three linked volume readers and independent bookmarks.
''',encoding='utf-8')
print('All three volumes and catalog ready',flush=True)
