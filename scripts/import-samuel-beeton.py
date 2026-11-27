#!/usr/bin/env python3
"""Import the proofread public-domain edition; register only after validation."""
import re, json, pathlib, urllib.request, html, hashlib
from xml.etree import ElementTree
P=pathlib.Path
slug='brave-british-soldiers-and-the-victoria-cross'
title='Brave British Soldiers and the Victoria Cross'
author='Samuel Orchart Beeton (editor)'
desc='Through portraits of soldiers and their regiments, this Victorian collection explores courage, duty and the meaning of military honour, revealing how nineteenth-century Britain understood the Victoria Cross.'
source='https://www.gutenberg.org/ebooks/65654'
def get(url):
    with urllib.request.urlopen(urllib.request.Request(url,headers={'User-Agent':'OpheliaOpenBook public-domain library'}),timeout=60) as f:
        return f.read()
for url in ['https://www.gutenberg.org/cache/epub/65654/pg65654.txt','https://www.gutenberg.org/ebooks/65654.txt.utf-8','https://www.gutenberg.org/files/65654/65654-0.txt']:
    try:
        raw=get(url).decode('utf-8-sig').replace('\r\n','\n').replace('\r','\n')
        a=re.search(r'^\*{3} START OF (?:THE|THIS) PROJECT GUTENBERG EBOOK.*\*{3}\s*$',raw,re.M)
        z=re.search(r'^\*{3} END OF (?:THE|THIS) PROJECT GUTENBERG EBOOK.*\*{3}\s*$',raw,re.M)
        assert a and z and z.start()-a.end()>400000 and 'VICTORIA CROSS' in raw[a.end():a.end()+15000].upper()
        text=raw[a.end():z.start()].strip()
        break
    except Exception as e:
        print(url,repr(e))
else:
    raise RuntimeError('No complete source; catalog unchanged')
expected='I II III IV V VI VII VIII IX X XI XII XIII XIV XV XVI XVII XVIII XIX XX XXI XXII XXIII XXIV XXV XXVI XXVII XXVIII XXIX XXX'.split()
headings=list(re.finditer(r'(?m)^[ \t]*CHAPTER[ \t]+([IVXLCDM]+)\.?[ \t]*$',text))
assert [m.group(1) for m in headings]==expected, 'Missing or repeated chapter headings'
assert 'A SOLDIER' in text[headings[-1].start():].upper()
assert len(text.split())>65000
sections=[]
bounds=[0]+[m.start() for m in headings]+[len(text)]
for i,(a,b) in enumerate(zip(bounds,bounds[1:])):
    block=text[a:b]
    # Drop bracketed printed folio numbers, not the surrounding text.
    block=re.sub(r'\[(?:\d+|[ivxlcdm]+)\]', '', block)
    paras=[p.strip() for p in re.split(r'\n[ \t]*\n+',block) if p.strip()]
    paras=[re.sub(r'[ \t]*\n[ \t]*',' ',p) for p in paras]
    sections.append({'name':'Title, Preface and Contents' if i==0 else 'Chapter '+str(i),'paragraphs':paras})
assert len(sections)==31 and all(s['paragraphs'] for s in sections)
assert sum(len(' '.join(s['paragraphs']).split()) for s in sections)>65000
book=P('public/books')/(slug+'.json')
book.write_text(json.dumps(sections,ensure_ascii=False),encoding='utf-8')
# Original source retained separately for verification.
(P('public/books')/(slug+'-source.txt')).write_text(text+'\n',encoding='utf-8')
# Prefer original historic cover provided with the edition; never publish an invalid asset.
cover='public/art/'+slug+'-cover.svg'
caption='Period-inspired title plate reconstructed for Ophelia’s Open Book; not an original binding.'
try:
    data=get('https://www.gutenberg.org/cache/epub/65654/images/cover.jpg')
    assert data[:2]==b'\xff\xd8' and len(data)>5000
    cover='public/art/'+slug+'-cover.jpg'
    P(cover).write_bytes(data)
    caption='Historical cover from the digitized public-domain edition.'
except Exception as e:
    print('Historic cover unavailable',repr(e))
    P(cover).write_text('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 850"><rect width="640" height="850" fill="#243e38"/><rect x="28" y="28" width="584" height="794" rx="8" fill="none" stroke="#d3b477" stroke-width="4"/><rect x="43" y="43" width="554" height="764" fill="none" stroke="#d3b477"/><g fill="#f2e1bc" text-anchor="middle" font-family="Georgia,serif"><text x="320" y="170" font-size="24">BEETON’S BOY’S OWN LIBRARY</text><text x="320" y="320" font-size="44">BRAVE BRITISH</text><text x="320" y="380" font-size="44">SOLDIERS</text><text x="320" y="440" font-size="27">AND THE</text><text x="320" y="500" font-size="42">VICTORIA CROSS</text><text x="320" y="660" font-size="27">EDITED BY S. O. BEETON</text><text x="320" y="745" font-size="21">LONDON</text></g></svg>',encoding='utf-8')
# Reuse the existing standard reader, replacing only work-specific material.
template=P('talks-to-teachers-on-psychology.html').read_text(encoding='utf-8')
page=template
start=page.index('<title>'); end=page.index('<style>',start)
page=page[:start]+f'<title>{title} · {author} · Ophelia’s Open Book</title>\n<meta property="og:type" content="book"><meta property="og:title" content="{title}"><meta property="og:description" content="{desc}"><meta property="og:image" content="https://opheliasopenbooks.github.io/website/{cover}"><meta name="description" content="{desc}">'+page[end:]
page=page.replace('Talks to Teachers on Psychology reader',title+' reader')
page=re.sub(r'<div class="book-heading">.*?</div>\s*<figure id="story-figure">',f'<div class="book-heading"><div class="eyebrow">OPHELIA’S OPEN BOOK · HISTORY</div><h1>{title}</h1><p class="byline">{author} · Victorian era</p><p class="fine">Complete edition · 30 chapters</p><p class="fine">{desc}</p><p class="fine">Historical perspectives and language reflect the original era.</p></div>\n <figure id="story-figure">',page,count=1,flags=re.S)
page=re.sub(r'<figure id="story-figure">.*?</figure>',f'<figure id="story-figure"><img id="opening-art" src="{cover}" alt="{title} cover" loading="lazy"><figcaption>{caption}</figcaption></figure>',page,count=1,flags=re.S)
page=page.replace('William James · Complete 1899 work',author+' · Complete edition').replace('Talks and chapters','Chapters').replace('https://www.gutenberg.org/ebooks/16287',source)
page=re.sub(r'<div class="source">.*?</div>',f'<div class="source">Edited by S. O. Beeton. London: Ward, Lock and Tyler; undated Victorian printing. The complete 30-chapter text is locally hosted. <a href="public/books/{slug}-source.txt">Download original transcription</a> · <a href="{source}">Source and original illustrated edition</a>. Historical public-domain work. Browser narration.</div>',page,count=1,flags=re.S)
page=page.replace('ophelia-talks-to-teachers-william-james-1899-v1','ophelia-'+slug+'-v1')
a=page.index('function parseText(raw)');b=page.index('function paginate',a)
page=page[:a]+"""function parseText(raw){
 const sections=JSON.parse(raw);
 if(!Array.isArray(sections)||sections.length!==31||sections.some(s=>!Array.isArray(s.paragraphs)||!s.paragraphs.length))throw Error('Incomplete edition');
 if(sections.reduce((n,s)=>n+s.paragraphs.join(' ').split(/\\s+/).length,0)<65000)throw Error('Incomplete source');
 return sections;
}
"""+page[b:]
page=page.replace('All 18 talks are ready.','All 30 chapters are ready.').replace('Talks to Teachers on Psychology',title).replace('public/books/talks-to-teachers-on-psychology-william-james-1899.txt',str(book))
assert not re.search(r'William James|16287|18 talks|talks-to-teachers|1925',page,re.I)
P(slug+'.html').write_text(page,encoding='utf-8')
P('SOURCES-'+slug+'.md').write_text(f'# {title}\n\nEdited by Samuel Orchart Beeton (1831–1877). London: Ward, Lock and Tyler, undated Victorian printing. The transcribed edition is in the US public domain, verified at {source} (eBook 65654). Its table of contents lists chapters I–XXX. Import requires the exact chapter sequence, front matter and a minimum word count. No abridgment; printed folio markers removed in the reader. Source retained separately. Cover: {caption}\n\nSHA-256 of extracted source: {hashlib.sha256(text.encode()).hexdigest()}\n',encoding='utf-8')
p=P('index.html'); home=p.read_text(encoding='utf-8')
if f'href="{slug}.html"' not in home:
    a=home.index('id="books"'); b=home.index('</section>',a)
    card=f'<article class="book"><img src="{cover}" alt="{title} cover" width="640" height="340" loading="lazy" style="object-fit:contain;background:#f4edda"><div><span class="pill">New · Victorian history</span><h3>{title}</h3><div class="eyebrow">{author} · Victorian era</div><p>{desc}</p><a class="button" href="{slug}.html">Read &amp; Listen &nbsp; →</a></div></article>\n'
    p.write_text(home[:b]+card+home[b:],encoding='utf-8')
print('Verified 30 chapters and',len(text.split()),'words; ready for publication.')
