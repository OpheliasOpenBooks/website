#!/usr/bin/env python3
"""Import the complete original 1858 public-domain Tallmadge memoir and publish only if verified."""
from pathlib import Path
from urllib.request import Request, urlopen
import re, json, time

ROOT = Path(__file__).resolve().parents[1]
SOURCE = "https://archive.org/download/memoirofcolbenja00tall/memoirofcolbenja00tall_djvu.txt"
SOURCE_PAGE = "https://www.loc.gov/item/08006924/"
SLUG = "memoir-of-col-benjamin-tallmadge"
READER = ROOT / (SLUG + ".html")
TEXT = ROOT / "public/books" / (SLUG + "-1858-transcription.txt")
DATA = ROOT / "public/books" / (SLUG + ".json")
CATALOG = ROOT / "catalog.html"
SITEMAP = ROOT / "sitemap.xml"
PROVENANCE = ROOT / ("SOURCES-" + SLUG + ".md")

def get_original():
    for attempt in range(4):
        try:
            print("Downloading 1858 historical OCR from original edition:", SOURCE, flush=True)
            req = Request(SOURCE, headers={"User-Agent": "Mozilla/5.0 (noncommercial public-domain archival transcription)"})
            with urlopen(req, timeout=80) as response:
                text = response.read().decode("utf-8", "replace")
            if len(text) < 90000 or len(text.split()) < 14000:
                raise ValueError("Historical source too small or incomplete")
            if "THOMAS" not in text.upper() or "1858" not in text or "PREFACE." not in text:
                raise ValueError("The source does not look like the original 1858 Thomas Holman edition")
            print("Verified source bytes", len(text.encode()), "words", len(text.split()), flush=True)
            return text
        except Exception as exc:
            print("Original source retrieval attempt", attempt + 1, repr(exc), flush=True)
            if attempt == 3:
                raise
            time.sleep(2 + attempt * 3)

def find_title_marker(lines, name, start=0, stop=None):
    pattern = re.compile(r"\s*" + r"\s*".join(re.escape(ch) for ch in name) + r"\.?\s*$", re.I)
    found = [i for i,line in enumerate(lines) if i >= start and (stop is None or i < stop) and pattern.fullmatch(line)]
    return found

def normalize_segment(raw, label):
    raw = raw.replace("\r", "").replace("\u00ad", "").replace("\u200b", "")
    raw = re.sub(r"(?<=\w)-\s*\n\s*(?=[a-z])", "", raw)
    out = []
    dropped = 0
    for line in raw.split("\n"):
        clean = re.sub(r"[ \t]+", " ", line).strip()
        if not clean:
            out.append("")
            continue
        # Scan page numbers and running heads are not part of the work.
        if re.fullmatch(r"(?:[0-9]{1,3}|MEMOIR|PREFACE|TALLMADGE|SKETCH OF COL\. TALLMADGE)\.?", clean, re.I):
            dropped += 1
            continue
        alpha = sum(ch.isalpha() for ch in clean)
        if len(clean) > 7 and alpha / len(clean) < .40:
            dropped += 1
            continue
        if re.fullmatch(r"[\W\d_]{1,30}", clean) and len(clean) > 1:
            dropped += 1
            continue
        out.append(clean)
    # Preserve paragraph breaks, merge wrapped physical lines into continuous prose.
    pieces = re.split(r"\n\s*\n", "\n".join(out))
    paragraphs = []
    for piece in pieces:
        p = re.sub(r"\s*\n\s*", " ", piece).strip()
        p = re.sub(r"\s{2,}", " ", p)
        p = re.sub(r"(?<!\w)[#■●*]+(?=\s|$)", "", p).strip()
        p = re.sub(r"\[\s*\d{1,3}\s*\]", "", p)
        if p and p != "---" and len(p) >= 6:
            paragraphs.append(p)
    # Join isolated OCR lines that are clearly mid-sentence fragments; keep historic paragraphs otherwise.
    joined = []
    for p in paragraphs:
        if joined and len(p) < 60 and joined[-1][-1] not in ".!?;:”'":
            joined[-1] += " " + p
        else:
            joined.append(p)
    print(label, "paragraphs", len(joined), "words", len(" ".join(joined).split()), "dropped non-prose lines", dropped, flush=True)
    return joined

def extract(source):
    lines = source.replace("\r", "").split("\n")
    prefaces = find_title_marker(lines, "PREFACE", stop=min(len(lines), 650))
    if not prefaces:
        raise ValueError("The original 1858 Preface page was not found")
    preface = prefaces[0]
    memoir_headers = find_title_marker(lines, "MEMOIR", preface + 10, stop=min(len(lines), 1000))
    # There should be a stand-alone 'MEMOIR.' heading after the 1858 signed preface.
    if not memoir_headers:
        # The historical 1858 scan OCR turns the decorated MEMOIR heading into
        # separated or corrupted capitals. Locate the beginning of the actual
        # prose instead of requiring machine-perfect typography.
        starts = [i for i, line in enumerate(lines)
                  if preface + 12 < i < min(len(lines), 1050)
                  and re.search(r"subject\s+of\s+this\s+memoir", line, re.I)]
        if not starts:
            print("OCR heading diagnostic:", repr("\\n".join(lines[preface+1:preface+85])), flush=True)
            raise ValueError("Opening of Tallmadge's original memoir not found")
        memoir_start = starts[0]
        print("Recovered memoir opening by original prose, source line", memoir_start, flush=True)
    else:
        memoir_start = memoir_headers[0]
    if memoir_start - preface < 12:
        raise ValueError("Preface appears too short; suspect incorrect source page boundaries")
    signatures = [i for i, l in enumerate(lines) if i > memoir_start + 250
                  and re.fullmatch(r"\s*F[\s.]*A[\s.]*TALLMADGE[\s.]*", l, re.I)]
    # The last signed biographical sketch follows the memoir. It is part of the 1858 publication.
    after = max(signatures) + 1 if signatures else len(lines)
    # Strip the scannner's trailing image/processing artifacts without removing any prose.
    tail = "\n".join(lines[memoiR_start:after]) if False else "\n".join(lines[memoir_start:after])
    pre = normalize_segment("\n".join(lines[preface+1:memoir_start]), "Editor's original 1858 preface")
    memoir = normalize_segment(tail, "Tallmadge memoir + 1858 biographical afterword")
    pre_words = len(" ".join(pre).split())
    main_words = len(" ".join(memoir).split())
    combined = " ".join(memoir).lower()
    terms = ["washington", "arnold", "long island", "british", "revolution", "1780"]
    missing = [term for term in terms if term not in combined]
    print("MAIN FIRST", repr(" ".join(memoir)[:460]), flush=True)
    print("MAIN LAST", repr(" ".join(memoir)[-720:]), flush=True)
    print("Source terms missing", missing, "signature lines", signatures[-4:], flush=True)
    if pre_words < 180 or pre_words > 1500 or not (9000 < main_words < 30000):
        raise ValueError(f"Unexpected work length; preface={pre_words}, memoir={main_words}")
    if missing:
        raise ValueError("OCR is too damaged or incomplete to publish: " + ", ".join(missing))
    if len(memoir) < 35:
        raise ValueError("Paragraph boundaries are not usable")
    if "brookhaven" not in " ".join(memoir[:25]).lower() or "1754" not in " ".join(memoir[:25]):
        raise ValueError("Opening personal history is absent or damaged")
    if "lafayette" not in combined[-6000:] and "lafayet" not in combined[-6000:]:
        raise ValueError("1858 concluding biographical afterword appears missing")
    raw_original = "\n".join(lines[preface:after]).strip()
    return [
        {"name": "Preface · F. A. Tallmadge (1858)", "paragraphs": pre},
        {"name": "Memoir · Benjamin Tallmadge, with 1858 biographical afterword", "paragraphs": memoir}
    ], raw_original

def publish():
    original = get_original()
    parts, transcription = extract(original)
    displayed = sum(len(" ".join(s["paragraphs"]).split()) for s in parts)
    assert displayed > 10000
    reader = READER.read_text(encoding="utf-8")
    for identifier in ("section", "page", "voice", "speed", "size", "dark", "autoturn", "bookmark", "settings-toggle", "play"):
        if ('id="' + identifier + '"') not in reader:
            raise ValueError("Required reader component missing: " + identifier)
    if "ophelia-narration.js" not in reader or (SLUG + ".json") not in reader:
        raise ValueError("Native Ophelia reader or local data loader missing")
    TEXT.parent.mkdir(parents=True, exist_ok=True)
    TEXT.write_text(transcription + "\n", encoding="utf-8")
    DATA.write_text(json.dumps({
        "title": "Memoir of Col. Benjamin Tallmadge",
        "author": "Benjamin Tallmadge",
        "edition": "1858, New York: Thomas Holman, Book and Job Printer",
        "source": "Library of Congress scan and original 1858 Internet Archive OCR, public domain",
        "sections": parts
    }, ensure_ascii=False, separators=(",", ":")) + "\n", encoding="utf-8")
    catalog = CATALOG.read_text(encoding="utf-8")
    filename = SLUG + ".html"
    if filename not in catalog:
        marker = "const catalogOnlyBooks=["
        if catalog.count(marker) != 1:
            raise ValueError("Catalog insertion point changed")
        blurb = ("Benjamin Tallmadge, a trusted cavalry officer and intelligence organizer for George Washington, "
                 "recounts his service in the American Revolution. From campaigns around New York and "
                 "the secret war to Benedict Arnold's betrayal and the fate of John André, his personal account "
                 "reveals the dangers and decisions behind the fight for independence.")
        entry = "\n {title:'Memoir of Col. Benjamin Tallmadge',author:'Benjamin Tallmadge · 1858 · Original memoir with family preface',href:'" + filename + "',image:'public/art/" + SLUG + "-1858-titlepage.svg',alt:'Period-inspired title-page design reflecting the original 1858 Thomas Holman edition',description:'" + blurb + "',genre:'American History & Political Thought'},\n"
        catalog = catalog.replace(marker, marker + entry, 1)
        CATALOG.write_text(catalog, encoding="utf-8")
    sitemap = SITEMAP.read_text(encoding="utf-8")
    url = "https://opheliasopenbooks.github.io/website/" + filename
    if url not in sitemap:
        sitemap = sitemap.replace("</urlset>", "  <url><loc>" + url + "</loc></url>\n</urlset>")
        SITEMAP.write_text(sitemap, encoding="utf-8")
    PROVENANCE.write_text(
        "# Memoir of Col. Benjamin Tallmadge — edition provenance\n\n"
        "- Author: Benjamin Tallmadge (1754–1835); book published posthumously in 1858 by Thomas Holman, New York.\n"
        "- Original library exemplar: " + SOURCE_PAGE + "\n"
        "- IA archival OCR transcription: " + SOURCE + "\n"
        "- Full original 1858 Preface, original autobiographical Memoir, and 1858 family biographical afterword retained; no modern editorial additions.\n"
        "- Local hosted transcription: public/books/" + SLUG + "-1858-transcription.txt.\n"
        "- Local read-aloud content: public/books/" + SLUG + ".json, two sections with " + str(displayed) + " transcribed words.\n"
        "- Reader: " + filename + ", uses original Ophelia narrator, bookmark, saved reading position, chapter selector and settings.\n"
        "- Historic title page art is a clearly labeled period-inspired reconstruction, not an original scanned cover.\n"
        "- Historical scan-based OCR is imperfect; occasional original OCR character errors may remain; no claim of exhaustive proofreading.\n"
        "- This import leaves index.html (homepage) exactly unchanged, adding a catalog-only entry after validation.\n",
        encoding="utf-8"
    )
    print("SUCCESS: complete source validated, book sections", len(parts),
          "words", displayed, "hosted bytes", DATA.stat().st_size, flush=True)

if __name__ == "__main__":
    publish()
