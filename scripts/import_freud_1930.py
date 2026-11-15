#!/usr/bin/env python3
"""One-time import of the original 1930 U.S. public-domain Joan Riviere translation.
Source: Project Gutenberg eBook #78221. Keep all eight numbered chapters and translator note.
Run in GitHub Actions, where outbound access and repository commit credentials are available.
"""
import html
import json
import pathlib
import re
import urllib.request

URL = "https://www.gutenberg.org/cache/epub/78221/pg78221.txt"
request = urllib.request.Request(URL, headers={"User-Agent":"OpheliasOpenBook/1.0 (single public-domain text import)"})
with urllib.request.urlopen(request, timeout=40) as reply:
    data = reply.read().decode("utf-8-sig").replace("\r\n","\n")
start = re.search(r"(?m)^TRANSLATOR’S NOTE\s*$", data)
end = re.search(r"(?m)^  Transcriber’s Notes\s*$", data)
if not start or not end or end.start() < start.end():
    raise RuntimeError("1930 source markers unexpectedly changed; refusing partial import")
core = data[start.start():end.start()]
matches = list(re.finditer(r"(?m)^(I|II|III|IV|V|VI|VII|VIII)\s*$", core))
expected = ["I","II","III","IV","V","VI","VII","VIII"]
if [m.group(1) for m in matches] != expected:
    raise RuntimeError(f"Original eight chapter divisions not found: {[m.group(1) for m in matches]}")
names = ["translator-note"] + [f"chapter-{i}" for i in range(1,9)]
pieces = [core[:matches[0].start()]] + [
    core[m.end():matches[i+1].start() if i < len(matches)-1 else len(core)]
    for i,m in enumerate(matches)
]
if len(pieces) != len(names) or sum(len(x) for x in pieces)<100000:
    raise RuntimeError("Incomplete or mismatched text; refusing import")
folder = pathlib.Path("public/books/civilization-and-its-discontents")
folder.mkdir(parents=True,exist_ok=True)
for i,(name,part) in enumerate(zip(names,pieces)):
    paragraphs=[]
    for p in re.split(r"\n[ \t]*\n+",part.strip()):
        normalized = re.sub(r"[ \t]*\n[ \t]*"," ",p).strip()
        if normalized:
            paragraphs.append(normalized)
    if not paragraphs or (i>0 and len(paragraphs)<5):
        raise RuntimeError("Empty or implausibly short section "+name)
    # Keep page-reference markers and numbered footnotes as text rather than dropping prose.
    label = "Translator’s Note" if i==0 else "Chapter "+expected[i-1]
    content = ('<?xml version="1.0" encoding="utf-8"?>\n'
               '<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en-GB"><head>'
               '<title>'+html.escape(label)+'</title></head><body><section id="'+name+'">'
               +'<h2>'+html.escape(label)+'</h2>'
               +''.join('<p>'+html.escape(p)+'</p>' for p in paragraphs)
               +'</section></body></html>\n')
    # XML parser can parse all source after escaping punctuation.
    import xml.etree.ElementTree as ET
    ET.fromstring(content)
    (folder/(name+".xhtml")).write_text(content,encoding="utf-8")
print(json.dumps({"source":URL,"parts":names,"characters":sum(map(len,pieces))}))
