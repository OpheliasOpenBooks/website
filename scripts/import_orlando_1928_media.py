#!/usr/bin/env python3
"""Import eight original 1928 Orlando plates and the first-edition index.
The 1928 book is public domain in the United States. Historical plates are from
Standard Ebooks; the first-edition index is transcribed from Wikisource.
"""
from pathlib import Path
from html.parser import HTMLParser
import html
import json
import re
import urllib.parse
import urllib.request

folder=Path("public/books/orlando")
images=folder/"images"
images.mkdir(parents=True,exist_ok=True)
headers={"User-Agent":"OpheliasOpenBook/1.0 (preserving original public-domain Orlando 1928 plates; contact via github.com/OpheliasOpenBooks/website)"}
def load(url):
    req=urllib.request.Request(url,headers=headers)
    with urllib.request.urlopen(req,timeout=60) as response:
        return response.read()

for n in range(1,9):
    uri=f"https://raw.githubusercontent.com/standardebooks/virginia-woolf_orlando/master/src/epub/images/illustration-{n}.jpg"
    data=load(uri)
    if not(data[:2]==b"\xff\xd8" and data[-2:]==b"\xff\xd9" and 200000<=len(data)<=2000000):
        raise ValueError(f"Ill-fitted illustration data for {n}: {len(data)} bytes")
    (images/f"illustration-{n}.jpg").write_bytes(data)
    print("Saved original plate",n,len(data))

class ParaExtractor(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.paragraphs=[]
        self.open_block=None
        self.text=[]
    def handle_starttag(self,tag,attrs):
        if tag in ("p","h2","h3","h4"):
            if self.open_block is None:
                self.open_block=tag
                self.text=[]
        if tag=="br" and self.open_block:self.text.append("\n")
    def handle_data(self,data):
        if self.open_block:self.text.append(data)
    def handle_endtag(self,tag):
        if self.open_block==tag:
            s=re.sub(r"\s+"," ","".join(self.text)).strip()
            if s:self.paragraphs.append((tag,s))
            self.open_block=None
            self.text=[]
# Orlando's original mock-biographical 1928 index is missing from the Standard
# Ebooks reflowable edition. Reincorporate it from the 1928 Harcourt, Brace
# first-edition public-domain transcription at English Wikisource.
params=urllib.parse.urlencode({
 "action":"parse","page":"Orlando:_A_Biography/Index",
 "prop":"text","format":"json","formatversion":"2"
})
payload=json.loads(load("https://en.wikisource.org/w/api.php?"+params))
page=payload.get("parse",{}).get("text","")
if isinstance(page,dict):page=page.get("*","")
parser=ParaExtractor()
parser.feed(page)
paragraphs=parser.paragraphs
# The substantive first-edition index comprises alphabetical letter headings and
# references to 1928 page numbers (which do not map to reflowed screen pages).
index_text="\n".join(s for _,s in paragraphs)
if len(index_text)<1800 or not("Orlando" in index_text and "Wren" in index_text and "Shakespeare" in index_text):
    raise ValueError("Incomplete first-edition index extraction: "+str(len(index_text)))
out=['<?xml version="1.0" encoding="utf-8"?>',
'<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en-GB"><head><title>Original 1928 Index</title></head>',
'<body><section id="index" epub:type="index" xmlns:epub="http://www.idpf.org/2007/ops">',
'<h2>Index — First Edition (1928)</h2>',
'<p>These are the historical page references of the first print edition; they are retained for authenticity and do not refer to the digital reader’s reflowable pages.</p>']
for tag,s in paragraphs:
    esc=html.escape(s,quote=False)
    if re.fullmatch(r"[A-Z]",s):
        out.append("<h3>"+esc+"</h3>")
    else:
        out.append("<p>"+esc+"</p>")
out+=["</section></body></html>"]
document="\n".join(out)+"\n"
import xml.etree.ElementTree as ET
ET.fromstring(document)
(folder/"index.xhtml").write_text(document,encoding="utf-8")
print("Saved the 1928 original index",len(paragraphs),"entries and sections",len(document),"bytes")
