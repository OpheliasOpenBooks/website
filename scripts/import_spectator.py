from pathlib import Path
from urllib.request import urlopen
import re,json,hashlib
root=Path(__file__).resolve().parents[1]
folder=root/'public/books/spectator'
folder.mkdir(parents=True,exist_ok=True)
url='https://raw.githubusercontent.com/GITenberg/The-Spectator-Volumes-1-2-and-3With-Translations-and-Index-for-the-Series_12030/master/12030-8.txt'
raw=urlopen(url,timeout=60).read()
assert hashlib.sha1(('blob '+str(len(raw))+'\0').encode()+raw).hexdigest()=='7321a96661798c0d47dc0198300a35efc749374e'
try: text=raw.decode('utf-8-sig')
except UnicodeDecodeError: text=raw.decode('cp1252')
text=text.replace('\r\n','\n').replace('\r','\n')
start=re.search(r'(?im)^\s*\*{3}\s*START OF (?:THIS|THE) PROJECT GUTENBERG EBOOK[^\n]*\*{3}',text)
end=re.search(r'(?im)^\s*\*{3}\s*END OF (?:THIS|THE) PROJECT GUTENBERG EBOOK[^\n]*\*{3}',text)
assert start and end
body=text[start.end():end.start()].strip()
# Issue headings begin a line, with a number followed by the publication date.
pat=r'(?im)^[ \t]*No[.]?[ \t]+(\d{1,3})[.]?[ \t]+[^\n]*\b(?:1711|1712|1714)\b[^\n]*$'
matches=list(re.finditer(pat,body))
print('Heading matches:',len(matches),[(m.group(1),m.group(0)[:100]) for m in matches[:4]],flush=True)
# Select ordered sequence, allowing an occasional intervening quotation.
chosen=[]; expected=1
for m in matches:
    if int(m[1])==expected:
        chosen.append(m);expected+=1
    if expected==636:break
if expected!=636:
    print('First missing issue',expected,'candidate headings around it:',[(m[1],m[0]) for m in matches if abs(int(m[1])-expected)<4],flush=True)
    raise ValueError('Not all 635 numbered issues were identified')
# Keep a separate source transcription containing all editorial variants and notes.
(folder/'source-edition.txt').write_text(body+'\n',encoding='utf-8')
def paragraphs(s):
    out=[]
    for p in re.split(r'\n[ \t]*\n+',s.strip()):
        if re.fullmatch(r'[\s*]+',p):continue
        p=re.sub(r'\[\s*\d+\s*\]','',p)
        p=re.sub(r'(?<!\w)[†‡](?!\w)','',p)
        p=re.sub(r'(?m)^#{1,6}\s+','',p)
        p=re.sub(r'\s+',' ',p).strip()
        if p:out.append(p)
    return out
sections=[]
for i,m in enumerate(chosen):
    chunk=body[m.end():chosen[i+1].start() if i<634 else len(body)].strip()
    # The Morley edition places editorial footnotes after each issue.
    # Preserve them in source-edition.txt, not the narrative queue.
    note=re.search(r'(?im)^\s*\[Footnote\s+\d+\s*:',chunk)
    if note:chunk=chunk[:note.start()]
    if i==634:
        appendix=re.search(r'(?im)^\s*(?:INDEX|ADDITIONAL NOTES AND TRANSLATIONS|END OF THE SPECTATOR)\s*$',chunk)
        if appendix:chunk=chunk[:appendix.start()]
    pp=paragraphs(chunk)
    words=sum(len(p.split()) for p in pp)
    if not 200<=words<=5000:raise ValueError(f'Issue {i+1}: suspicious word count {words}')
    sections.append({'name':'Essay '+str(i+1)+' · '+re.sub(r'^\s*No[.]?\s+\d+[.]?\s*','',m[0],flags=re.I).strip(),'paragraphs':pp})
assert len(sections)==635
# Retain Morley's introduction in the first volume reader, apart from source front matter.
intro=body[:chosen[0].start()]
im=re.search(r'(?im)^\s*INTRODUCTION\s*\.?\s*$',intro)
if im:
    ip=paragraphs(intro[im.end():])
    if ip: introsection=[{'name':'Henry Morley’s introduction','paragraphs':ip}]
    else:introsection=[]
else:introsection=[]
template=(root/'an-essay-upon-projects.html').read_text(encoding='utf-8')
cover='public/art/spectator-1891-titleplate.svg'
ranges=[(1,202),(203,416),(417,635)]
for n,(first,last) in enumerate(ranges,1):
    data=folder/f'volume-{n}.json'
    ss=(introsection if n==1 else [])+sections[first-1:last]
    data.write_text(json.dumps(ss,ensure_ascii=False,separators=(',',':')),encoding='utf-8')
    slug='the-spectator.html' if n==1 else f'the-spectator-volume-{n}.html'
    title=f'The Spectator — Volume {n}'
    nav=' · '.join(f'<a href="{("the-spectator.html" if v==1 else f"the-spectator-volume-{v}.html")}">Volume {v}</a>' for v in (1,2,3))
    h=template
    h=re.sub(r'<title>.*?</title>',f'<title>{title} · Ophelia’s Open Book</title>',h,count=1)
    h=h.replace('an-essay-upon-projects.html',slug)
    h=re.sub(r'<meta property="og:type".*?\n<meta name="description".*?\n',f'<meta property="og:type" content="article"><meta property="og:title" content="{title}"><meta property="og:description" content="The original periodical essays, 1711–1714."><meta property="og:image" content="https://opheliasopenbooks.github.io/website/{cover}">\n<meta name="description" content="Read and listen to {title}, essays {first}–{last}.">\n',h,count=1)
    h=h.replace('Daniel Defoe reader','The Spectator reader')
    h=re.sub(r'<div class="book-heading">[^\n]*',f'<div class="book-heading"><div class="eyebrow">OPHELIA’S OPEN BOOK</div><h1>{title}</h1><p class="byline">Joseph Addison, Richard Steele and contributors · 1711–1714 · Henry Morley edition, 1891</p><p class="fine">Essays {first}–{last} · {nav}</p><p class="fine"><a href="benjamin-franklins-childhood-library.html">Benjamin Franklin’s Childhood Library</a></p></div>',h,count=1)
    h=re.sub(r'<figure id="story-figure".*?</figure>',f'<figure id="story-figure" hidden><img id="opening-art" src="{cover}" alt="Period-inspired title plate for The Spectator" loading="eager"><figcaption>New typographic design inspired by the 1891 edition, not a facsimile.</figcaption></figure>',h,count=1)
    h=re.sub(r'<div class="source">.*?</div>(?=</div></div></div><script)',f'<div class="source">The original periodical essays, 1711–1714, from Henry Morley’s 1891 three-volume edition, <a href="https://www.gutenberg.org/ebooks/12030">Project Gutenberg 12030</a>. All 635 numbered papers are present across the three readers. Editorial variants, notes and supplementary index are preserved in the <a href="public/books/spectator/source-edition.txt">source transcription</a> rather than narrated as part of the essays. Franklin remembered reading a third volume of an earlier edition; the 1891 volume divisions are not necessarily those he knew. Narration uses the browser’s English voice.</div>',h,count=1)
    for a,b in [('ophelia-defoe-essay-upon-projects-1887-v1',f'ophelia-spectator-1891-volume-{n}-v1'),('public/books/defoe-essay-upon-projects-1887.json',f'public/books/spectator/volume-{n}.json'),('Daniel Defoe · 1697','The Spectator · 1711–1714'),('You have finished An Essay upon Projects.',f'You have finished Volume {n}.'),('The essay could not be loaded:','The volume could not be loaded:'),('ophelia-narration.js?v=1.4.27-bunyan','ophelia-narration.js?v=1.4.27-spectator'),('Works &amp; Sections','Essays &amp; Sections'),('Choose a work or section','Choose an essay')]:h=h.replace(a,b)
    assert 'An Essay upon Projects' not in h and 'defoe-essay-upon' not in h
    (root/slug).write_text(h,encoding='utf-8')
    print('Volume',n,len(ss),'sections',flush=True)
(root/cover).write_text('''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 600"><rect width="420" height="600" fill="#e9dfc8"/><rect x="15" y="15" width="390" height="570" fill="none" stroke="#594535" stroke-width="3"/><rect x="23" y="23" width="374" height="554" fill="none" stroke="#96754b"/><g fill="#40372d" text-anchor="middle" font-family="Georgia,serif"><text x="210" y="95" font-size="15" letter-spacing="3">THE PERIODICAL ESSAYS</text><text x="210" y="173" font-size="30">THE</text><text x="210" y="225" font-size="39">SPECTATOR</text><text x="210" y="285" font-size="30">❦</text><text x="210" y="340" font-size="19">JOSEPH ADDISON</text><text x="210" y="375" font-size="19">RICHARD STEELE</text><text x="210" y="425" font-size="17">1711–1714</text><text x="210" y="495" font-size="16">HENRY MORLEY · EDITOR</text><text x="210" y="540" font-size="15">1891 EDITION</text></g></svg>''',encoding='utf-8')
catalog=root/'catalog.html'
c=catalog.read_text(encoding='utf-8')
if 'the-spectator.html' not in c:
    card=" {title:'The Spectator — Complete Essays',author:'Joseph Addison, Richard Steele & contributors · 1711–1714 · Henry Morley edition, 1891',href:'the-spectator.html',image:'public/art/spectator-1891-titleplate.svg',alt:'Period-inspired title plate for The Spectator',description:'Observe the manners, friendships, fashions and follies of eighteenth-century London through the witty and thoughtful essays of Mr. Spectator. Addison, Steele and their contributors explore literature, virtue, education and ordinary social life, inspiring the young Benjamin Franklin to refine his own writing.',genre:'Essays & Philosophy'},"
    c=c.replace('const catalogOnlyBooks=[','const catalogOnlyBooks=[\n'+card,1)
    catalog.write_text(c,encoding='utf-8')
p=root/'benjamin-franklins-childhood-library.html';c=p.read_text(encoding='utf-8')
if 'the-spectator.html' not in c:
    marker='</div><h2>Historical sources and books to recover</h2>'
    assert c.count(marker)==1
    card='<article class="book"><div class="number">Joseph Addison and Richard Steele · 1711–1714</div><h3>The Spectator</h3><p>All 635 original essays on manners, literature, education and moral life. Franklin imitated their prose to teach himself to write; this later three-volume edition has different divisions from his own copy.</p><a class="open" href="the-spectator.html">Read and listen</a></article>'
    p.write_text(c.replace(marker,card+marker,1),encoding='utf-8')
(root/'SOURCES-the-spectator.md').write_text('''# The Spectator
Original papers 1711–1714 by Joseph Addison, Richard Steele and contributors. Henry Morley edition, 1891, public domain in the United States. Source: https://www.gutenberg.org/ebooks/12030 and the GITenberg archival mirror of 12030-8.txt, verified Git blob 7321a96661798c0d47dc0198300a35efc749374e. Issues 1–202, 203–416, 417–635 in three volume readers. All numbered essays are validated in order. Source transcription retains editorial footnotes and ancillary matter; the listening text omits numbered notes and decorative marks. Original period-inspired title plate, not facsimile. Franklin describes a third volume of an earlier edition, not the third volume of Morley's edition.
''',encoding='utf-8')
(folder/'manifest.json').write_text(json.dumps({'issues':635,'ranges':ranges,'source':url,'sha256':hashlib.sha256(raw).hexdigest()},indent=2),encoding='utf-8')
