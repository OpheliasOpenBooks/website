#!/usr/bin/env python3
"""Host Gibbon's complete 71-chapter history from the public-domain Milman edition.

Sources: Project Gutenberg 731-736, mirrored as text by GITenberg.
The six original printed volumes appeared 1776-1788; this transcription includes
the nineteenth-century editor H. H. Milman's introduction and historical notes.
Work is divided by chapter so a visitor never loads all six large volumes at once.
"""
from __future__ import annotations
from pathlib import Path
from collections import OrderedDict
import json
import re
import urllib.request

ROOT = Path("public/books")
ROOT.mkdir(parents=True, exist_ok=True)
WORK = "The History of the Decline and Fall of the Roman Empire"
ROMANS = "I II III IV V VI VII VIII IX X XI XII XIII XIV XV XVI XVII XVIII XIX XX XXI XXII XXIII XXIV XXV XXVI XXVII XXVIII XXIX XXX XXXI XXXII XXXIII XXXIV XXXV XXXVI XXXVII XXXVIII XXXIX XL XLI XLII XLIII XLIV XLV XLVI XLVII XLVIII XLIX L LI LII LIII LIV LV LVI LVII LVIII LIX LX LXI LXII LXIII LXIV LXV LXVI LXVII LXVIII LXIX LXX LXXI".split()
TO_NUMBER = {label: i + 1 for i, label in enumerate(ROMANS)}
HEAD = re.compile(r"(?mi)^[ \t]*Chapter[ \t]+([IVXLCDM]+)\s*:\s*([^\n]*)")
END = re.compile(r"(?mi)^\s*(?:\*{3}\s*END OF (?:THIS )?PROJECT GUTENBERG|End of (?:the )?Project Gutenberg(?: EBook)?)")

def download(n: int, volume: int) -> str:
    slug = "History-of-the-Decline-and-Fall-of-the-Roman-Empire---Volume-%d_%d" % (volume, n)
    sources = [
        "https://raw.githubusercontent.com/GITenberg/%s/master/%d.txt" % (slug, n),
        "https://www.gutenberg.org/cache/epub/%d/pg%d.txt" % (n, n),
    ]
    errors = []
    for url in sources:
        try:
            request = urllib.request.Request(url, headers={"User-Agent": "OpheliasOpenBooks/1.0 (historical public-domain edition)"})
            with urllib.request.urlopen(request, timeout=90) as response:
                b = response.read()
            if len(b) < 950_000:
                raise ValueError("Unexpectedly small transcription (%d bytes)" % len(b))
            for encoding in ("utf-8-sig", "cp1252", "latin-1"):
                try:
                    text = b.decode(encoding)
                    break
                except UnicodeDecodeError:
                    continue
            print("Volume %d: %d source bytes, %s, %s" % (volume, len(b), encoding, url), flush=True)
            return text.replace("\r\n", "\n").replace("\r", "\n").replace("\ufeff", "")
        except Exception as exc:
            errors.append("%s: %s" % (url, exc))
    raise RuntimeError("Failed to retrieve Gibbon volume %d: %s" % (volume, " ; ".join(errors)))

def paragraphs(text: str) -> list[str]:
    """Remove hard-wraps in a plaintext transcription, not the historical words."""
    blocks = re.split(r"\n[ \t]*\n+", text.strip())
    items = []
    for block in blocks:
        lines = [line.strip() for line in block.split("\n") if line.strip()]
        if not lines:
            continue
        # Preserve indented poetry and tabular entries as separate spoken lines.
        if any(re.match(r"^[ \t]{5,}\S", line) for line in block.split("\n")):
            item = "\n".join(lines)
        else:
            item = " ".join(lines)
        if item.strip():
            items.append(item)
    return items

def get_sections(segment: str, title: str) -> dict:
    pars = paragraphs(segment)
    if not pars:
        raise ValueError("Empty source section: " + title)
    return {"name": title, "paragraphs": pars}

manifest = {
    "title": WORK,
    "author": "Edward Gibbon",
    "source": "Project Gutenberg ebooks 731–736; 1845 H. H. Milman annotated edition",
    "volumes": [],
}
chapter_numbers = []
total_words = 0

for volume, ebook in enumerate(range(731, 737), start=1):
    raw = download(ebook, volume)
    start_marker = re.search(r"(?mi)^HISTORY OF THE DECLINE AND FALL OF THE ROMAN EMPIRE\s*$", raw)
    if not start_marker:
        raise ValueError("Missing original work title in volume %d" % volume)
    raw = raw[start_marker.start():]
    end_marker = END.search(raw)
    if not end_marker:
        raise ValueError("Could not identify Project Gutenberg end matter in volume %d" % volume)
    raw = raw[:end_marker.start()].rstrip()
    matches = list(HEAD.finditer(raw))
    if len(matches) < 25:
        raise ValueError("Too few original chapter subdivisions in volume %d: %d" % (volume, len(matches)))
    chapters = OrderedDict()
    for idx, match in enumerate(matches):
        roman = match.group(1).upper()
        if roman not in TO_NUMBER:
            raise ValueError("Unexpected Gibbon chapter " + roman)
        number = TO_NUMBER[roman]
        heading = match.group(2).strip()
        begin = match.end()
        finish = matches[idx + 1].start() if idx + 1 < len(matches) else len(raw)
        content = raw[begin:finish].strip()
        # In this transcription a long chapter heading sometimes wraps onto
        # the next line; keep its final words and Part number with the heading.
        if not re.search(r"Part[ 	]+[IVXLCDM]+\.\s*$", heading, flags=re.I):
            first_line, separator, remainder = content.partition("\n")
            if separator and re.search(r"Part[ 	]+[IVXLCDM]+\.\s*$", first_line, flags=re.I):
                heading += " " + first_line.strip()
                content = remainder.strip()
        if len(content) < 300:
            raise ValueError("Suspiciously short chapter part %s in volume %d" % (roman, volume))
        clean_heading = re.sub(r"\.?\s*-*\s*Part[ \t]+[IVXLCDM]+\.?\s*$", "", heading, flags=re.I).strip(". -")
        part = re.search(r"Part\s+([IVXLCDM]+)", heading, flags=re.I)
        part_name = "Part " + part.group(1) if part else "Text"
        section_name = "Chapter %d — %s · %s" % (number, clean_heading or "Historical narrative", part_name)
        chapters.setdefault(number, {"heading": clean_heading, "sections": []})
        chapters[number]["sections"].append(get_sections(content, section_name))
    volume_manifest = {"number": volume, "chapters": []}
    if volume == 1:
        preface = raw[:matches[0].start()]
        pre_sections = [get_sections(preface, "Introduction, editorial preface and author's preface")]
        file = "gibbon-v1-ch00.json"
        record = {"title": WORK, "author": "Edward Gibbon", "volume": 1, "chapter": 0, "sections": pre_sections}
        (ROOT / file).write_text(json.dumps(record, ensure_ascii=False, separators=(",", ":")) + "\n", encoding="utf-8")
        volume_manifest["chapters"].append({"number": 0, "label": "Introduction & Prefaces", "file": file, "parts": 1})
    for number, info in chapters.items():
        sections = info["sections"]
        count = sum(len(p.split()) for section in sections for p in section["paragraphs"])
        if count < 1800:
            raise ValueError("Chapter %d is unexpectedly brief (%d words)" % (number, count))
        if len(sections) < 2:
            raise ValueError("Chapter %d has too few original subdivisions" % number)
        total_words += count
        chapter_numbers.append(number)
        file = "gibbon-v%d-ch%02d.json" % (volume, number)
        record = {"title": WORK, "author": "Edward Gibbon", "volume": volume, "chapter": number,
                  "sourceEbook": ebook, "sections": sections}
        (ROOT / file).write_text(json.dumps(record, ensure_ascii=False, separators=(",", ":")) + "\n", encoding="utf-8")
        volume_manifest["chapters"].append({"number": number,
                                            "label": "Chapter %d · %s" % (number, info["heading"]),
                                            "file": file, "parts": len(sections), "words": count})
    manifest["volumes"].append(volume_manifest)
    print("Volume %d: chapters %d–%d, %d parts, %d words" %
          (volume, next(iter(chapters)), next(reversed(chapters)), len(matches),
           sum(sum(len(p.split()) for p in s["paragraphs"]) for c in chapters.values() for s in c["sections"])), flush=True)

if chapter_numbers != list(range(1, 72)):
    raise ValueError("Incomplete or out-of-order Gibbon chapters: " + str(chapter_numbers))
if total_words < 1_200_000:
    raise ValueError("The six volumes seem abridged: %d words" % total_words)
manifest["chapterCount"] = len(chapter_numbers)
manifest["wordCount"] = total_words
manifest_file = ROOT / "gibbon-manifest.json"
manifest_file.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
print("Validated all 71 chapters and %d words across six hosted volumes." % total_words, flush=True)
