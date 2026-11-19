#!/usr/bin/env python3
"""Import Kant's Critique of Pure Reason and the 1781 German original.

English: Project Gutenberg 4280, Meiklejohn's historic English translation.
German: Project Gutenberg 6342, first German edition of 1781 (Latin-1).
Create small fully hosted reading segments; never drop a source paragraph.
Both readers use the manifest and load only one segment at a time.
"""
from pathlib import Path
import json
import re
import urllib.request

OUT = Path("public/books")
OUT.mkdir(parents=True, exist_ok=True)
ROOT = "https://raw.githubusercontent.com/GITenberg"
TITLE = "The Critique of Pure Reason"
GERMAN_TITLE = "Kritik der reinen Vernunft"
COMMONS = "https://commons.wikimedia.org/wiki/File:Kant-KdrV-1781.png"


def fetch(url, minimum):
    req = urllib.request.Request(url, headers={"User-Agent": "OpheliasOpenBooks/1.0 (public-domain literature import)"})
    with urllib.request.urlopen(req, timeout=120) as response:
        data = response.read()
    if len(data) < minimum:
        raise ValueError("Unexpectedly small source: %s (%d bytes)" % (url, len(data)))
    print("Downloaded %s: %d bytes" % (url, len(data)), flush=True)
    return data


def strip_gutenberg(data, language):
    if language == "en":
        text = data.decode("utf-8-sig")
        begin = re.search(r"(?mi)^THE CRITIQUE OF PURE REASON\s*$", text)
        if not begin:
            raise ValueError("English title text missing")
        # Avoid matching Gutenberg header title by requiring its later standalone appearance.
        if begin.start() < 500:
            begin = re.search(r"(?mi)^THE CRITIQUE OF PURE REASON\s*$", text[500:])
            if not begin:
                raise ValueError("English reading text missing")
            begin_at = begin.start() + 500
        else:
            begin_at = begin.start()
    else:
        # Project Gutenberg's 6342-8.txt uses ISO-8859-1, not UTF-8.
        text = data.decode("latin-1")
        begin = re.search(r"(?mi)^\*{3}\s*START OF (?:THIS|THE) PROJECT GUTENBERG EBOOK[^\n]*$", text)
        if not begin:
            begin = re.search(r"(?mi)^\*{3}\s*START OF THE PROJECT GUTENBERG[^\n]*$", text)
        if not begin:
            raise ValueError("German Project Gutenberg start marker missing")
        begin_at = begin.end()
    text = text.replace("\r\n", "\n").replace("\r", "\n")
    end = re.search(r"(?mi)^\*{3}\s*END OF (?:THIS |THE )?PROJECT GUTENBERG[^\n]*$", text[begin_at:])
    if not end:
        end = re.search(r"(?mi)^End of (?:the )?Project Gutenberg EBook", text[begin_at:])
    if not end:
        raise ValueError("Missing Gutenberg end marker in "+language)
    body = text[begin_at:begin_at+end.start()].strip()
    if len(body) < 1_000_000:
        raise ValueError("The reading body seems abridged: "+language+" "+str(len(body)))
    return body


def split_paragraphs(body):
    blocks = re.split(r"\n[ \t]*\n+", body.strip())
    paragraphs=[]
    for block in blocks:
        lines = [line for line in block.split("\n") if line.strip()]
        if not lines:
            continue
        # Preserve actual source wording and original verses/tables.
        # Ordinary prose lines are joined, not rewritten.
        poetry = len(lines) > 1 and sum(bool(re.match(r"^[ \t]{4,}\S", x)) for x in lines) >= len(lines) * 0.58
        if poetry:
            paragraph = "\n".join(line.strip() for line in lines)
        else:
            paragraph = " ".join(line.strip() for line in lines)
        if paragraph:
            paragraphs.append(paragraph)
    return paragraphs


def short_heading(p):
    cleaned = p.replace("\n", " ").strip()
    if len(cleaned) > 94 or len(cleaned.split()) > 13:
        return None
    if cleaned.upper() == cleaned and re.search(r"[A-ZÄÖÜ]", cleaned):
        return cleaned.title().strip(" .;:-")
    if re.match(r"^(?:SECTION|BOOK|PART|CHAPTER)\s+([IVXLC\d]+)[.:\s]*", cleaned, re.I):
        return cleaned[:76]
    return None


def build(language, ebook, path, source, minimum):
    body = strip_gutenberg(fetch(source, minimum), language)
    paragraphs = split_paragraphs(body)
    total = sum(len(x.split()) for x in paragraphs)
    if total < (150_000 if language == "en" else 125_000):
        raise ValueError("Too few words in "+language+": "+str(total))
    whole = " ".join(paragraphs).lower()
    if language == "en":
        for phrase in ("preface to the first edition", "preface to the second edition",
                       "transcendental aesthetic", "transcendental dialectic"):
            if phrase not in whole:
                raise ValueError("English Kant structure missing "+phrase)
    else:
        if "vernunft" not in whole or "transzendental" not in whole:
            raise ValueError("German Kant structure missing")

    segments, parts, current = [], [], []
    words, recent_heading = 0, ("Original German text · 1781" if language == "de" else "Prefaces and the Critique")
    first_heading = recent_heading

    def flush():
        nonlocal words, current, first_heading
        if current:
            parts.append({"paragraphs":current, "heading": first_heading, "words":words})
            current=[]
            words=0

    for p in paragraphs:
        n=len(p.split())
        heading=short_heading(p)
        # Start new hosted segment at an actual heading near the desired split.
        if current and (words+n > 5900 or (words > 4200 and heading)):
            flush()
        if not current:
            first_heading=heading or recent_heading
        current.append(p)
        words+=n
        if heading:
            recent_heading=heading
    flush()

    # Sanity: paragraph sequence and all words must remain unchanged.
    reconstructed=[p for part in parts for p in part["paragraphs"]]
    if reconstructed != paragraphs or len(parts) < 20 or len(parts) > 75:
        raise ValueError("Kant's text failed paragraph integrity check: "+language+
                         " parts="+str(len(parts)))
    label = "English · Meiklejohn" if language=="en" else "Deutsch · Erstausgabe 1781"
    manifest={
        "title":TITLE if language=="en" else GERMAN_TITLE,
        "author":"Immanuel Kant","language":language,"sourceEbook":ebook,
        "edition": "Meiklejohn's 1855 English translation, including the two editions' prefaces"
                   if language=="en" else "Kant's 1781 first German edition",
        "readOnly":language=="de",
        "partCount":len(parts),"wordCount":total,"parts":[]
    }
    prefix="kant-en" if language=="en" else "kant-de"
    for index, part in enumerate(parts,1):
        filename="%s-part-%02d.json" % (prefix,index)
        name=("Part %d · " % index if language=="en" else "Teil %d · " % index)+part["heading"]
        data={"title":manifest["title"],"author":"Immanuel Kant","language":language,
              "part":index,"readOnly":language=="de","sections":[{"name":name,"paragraphs":part["paragraphs"]}]}
        (OUT/filename).write_text(json.dumps(data,ensure_ascii=False,separators=(",",":"))+"\n",encoding="utf-8")
        manifest["parts"].append({"number":index,"file":filename,"label":name,
                                  "words":part["words"],"sectionCount":1})
    (OUT/(prefix+"-manifest.json")).write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
    print("%s: %d words, %d hosted segments, %d paragraphs" %
          (label,total,len(parts),len(paragraphs)),flush=True)
    return manifest


english=build("en",4280,"4280.txt",
              ROOT+"/The-Critique-of-Pure-Reason_4280/master/4280.txt",1_250_000)
german=build("de",6342,"6342-8.txt",
             ROOT+"/Kritik-der-reinen-Vernunft-Erste-Fassung-1781_6342/master/6342-8.txt",1_200_000)
if english["partCount"]<20 or german["partCount"]<20:
    raise ValueError("One of Kant's two complete hosted texts is incomplete")
print("Successfully prepared complete English and original German editions.", flush=True)
