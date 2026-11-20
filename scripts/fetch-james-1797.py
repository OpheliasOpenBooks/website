#!/usr/bin/env python3
"""Fetch the complete public-domain 1797 James the Fatalist, three archival English volumes.
This script is for repository-side provenance and manual editorial review.
It does not publish an audiobook or edit the OCR without a human checking it.
"""
from pathlib import Path
from urllib.parse import quote
from urllib.request import Request, urlopen
from urllib.error import URLError, HTTPError
import hashlib
import json
import re
import time

ITEM = "james-the-fatalist-and-his-master-translated-from-the-french-of-diderot-1797"
BASE = "james the fatalist and his master translated from the french of diderot in three volumes vol {} london printed for g g and j robinson 1797"
DEST = Path("sources/james-the-fatalist-1797")
DEST.mkdir(parents=True, exist_ok=True)
summary = []

def download(name):
    url = "https://archive.org/download/" + ITEM + "/" + quote(name)
    request = Request(url, headers={"User-Agent": "OpheliasOpenBook/1.0 (public domain historical text archival research)"})
    for attempt in range(3):
        try:
            with urlopen(request, timeout=70) as response:
                raw = response.read()
            if len(raw) < 100000 or len(raw) > 2000000:
                raise ValueError("Unexpected OCR size: " + str(len(raw)))
            return raw, url
        except (URLError, HTTPError, TimeoutError, ValueError) as exc:
            print("Attempt",attempt+1,"failed:",str(exc),flush=True)
            if attempt==2: raise
            time.sleep(5)
    raise RuntimeError("Failed archive retrieval")

for num, roman in enumerate(("i","ii","iii"),1):
    name = BASE.format(roman) + "_djvu.txt"
    data, url = download(name)
    text = data.decode("utf-8-sig", errors="replace")
    if len(re.findall(r"\b[A-Za-z]+\b",text))<24000:
        raise ValueError("Volume "+str(num)+" unexpectedly short or not English")
    if "\x00" in text or "<!DOCTYPE" in text[:200]:
        raise ValueError("Volume "+str(num)+" returned corrupt or HTML content")
    target = DEST / f"vol-{num}-raw-ocr.txt"
    target.write_text(text, encoding="utf-8")
    entry = {
        "volume":num, "archiveFile":name, "downloadURL":url,
        "bytes":len(data), "sha256":hashlib.sha256(data).hexdigest(),
        "chars":len(text), "words":len(re.findall(r"\b[A-Za-z]+\b",text)),
        "replacementChars":text.count("\ufffd"),
        "first800":text[:800], "last800":text[-800:],
    }
    summary.append(entry)
    print("Downloaded volume",num,"words",entry["words"],"sha256",entry["sha256"],flush=True)
(DEST/"source-audit.json").write_text(json.dumps(summary,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
print("Complete English source import ready for editorial review (not published).",flush=True)
