#!/usr/bin/env python3
"""Import the complete original 1858 public-domain Tallmadge memoir and publish only if verified."""
from pathlib import Path
from urllib.request import Request, urlopen
import re, json, time, html

ROOT = Path(__file__).resolve().parents[1]
SOURCE = "https://archive.org/stream/memoirofcolonelb027409mbp/memoirofcolonelb027409mbp_djvu.txt"
ORIGINAL_1858 = "https://archive.org/download/memoirofcolbenja00tall/memoirofcolbenja00tall_djvu.txt"
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
            embedded = re.search(r"<pre[^>]*>([\s\S]*?)</pre>", text, re.I)
            if embedded:
                text = html.unescape(embedded.group(1))
            else:
                print("HTML extraction diagnostic", repr(text[:1000]), flush=True)
            if len(text) < 90000 or len(text.split()) < 14000:
                raise ValueError("Historical source too small or incomplete")
            if "THOMAS" not in text.upper() or "1858" not in text or "PREFACE" not in text:
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
        if re.fullmatch(r"(?:[0-9]{1,3}|MEMOIR|MEMOIR OF|COLONEL BENJAMIN TALLMADGE|PREFACE|REMARKS|TALLMADGE|SKETCH OF COL\. TALLMADGE)\.?", clean, re.I):
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
    # The 1904 Gilliss Press facsimile republishes the original 1858 memoir,
    # signed preface and postscript, followed by clearly distinct 1904 notes.
    # Read only the original work, not the newer editorial additions.
    starts = [i for i, line in enumerate(lines)
              if re.search(r"\bHE\s+subject\s+of\s+this\s+memoir\s+was\s+born", line, re.I)]
    if not starts:
        raise ValueError("Opening of the 1858 memoir is missing in the 1904 historical reprint")
    memoir_start = starts[0]
    prefaces = [i for i,line in enumerate(lines[:memoir_start]) if re.fullmatch(r"\s*PREFACE\.?\s*",line,re.I)]
    # Skip duplicate running heads 'PREFACE' between physical pages.
    preface_start = next((i for i in reversed(prefaces) if i < memoir_start - 20), None)
    if preface_start is None:
        raise ValueError("Original family preface missing")
    remarks = [i for i,line in enumerate(lines) if memoir_start+500 < i and re.fullmatch(r"\s*REMARKS\.?\s*",line,re.I)]
    if not remarks:
        raise ValueError("Original family biographical remarks missing")
    remarks_start = remarks[0]
    note_candidates = [i for i,line in enumerate(lines) if i > remarks_start+35 and re.fullmatch(r"\s*NOTES\.?\s*",line,re.I)]
    if not note_candidates:
        raise ValueError("Cannot safely locate the end of 1858 work before 1904 notes")
    after = note_candidates[0]
    signature_lines = [i for i,line in enumerate(lines) if remarks_start < i < after and re.fullmatch(r"\s*F\.\s*A\.\s*TALLMADGE\.?\s*",line,re.I)]
    if not signature_lines:
        raise ValueError("Original 1858 biographical afterword ending not found")
    after = signature_lines[-1]+1
    print("Historical source section lines", preface_start, memoir_start, remarks_start, after, flush=True)
    pre = normalize_segment("\n".join(lines[preface_start+1:memoir_start]), "1858 preface (1904 reprint)")
    main = normalize_segment("\n".join(lines[memoir_start:remarks_start]), "Tallmadge memoir (1904 original-text reprint)")
    post = normalize_segment("\n".join(lines[remarks_start+1:after]), "1858 family biographical remarks")
    if pre:
        pre[0]=re.sub(r"^HE\s+following", "The following", pre[0], flags=re.I)
    if main:
        main[0]=re.sub(r"^HE\s+subject", "The subject", main[0], flags=re.I)
    if post:
        post[0]=re.sub(r"^HE\s+foregoing", "The foregoing", post[0], flags=re.I)
    # Fix demonstrable OCR rendering errors in dates and the original name,
    # never rewrite the author's historical assertions.
    fixes = [
      (r"\b1\s+(?=\d{3}\b)", "1"),
      (r"\bTallmstdge\b", "Tallmadge"),
      (r"\bNew Tork\b", "New York"),
      (r"\b2ist\b", "21st"),
      (r"\bi6th\b", "16th"),
      (r"\bist\b", "1st"),
      (r"\bCoL\b", "Col."),
      (r"\bTheii\b", "Their")
    ]
    for parts in (pre,main,post):
        for i,p in enumerate(parts):
            for pat,val in fixes:
                p=re.sub(pat, val, p, flags=re.I)
            parts[i]=p
    lengths = [len(" ".join(p).split()) for p in (pre,main,post)]
    check = " ".join(main).lower()
    missing=[w for w in ("washington","british","arnold","long island","1780") if w not in check]
    print("Edition section word counts",lengths,"missing",missing,flush=True)
    print("MAIN FIRST",repr(" ".join(main)[:450]),flush=True)
    print("LAST POST",repr(" ".join(post)[-480:]),flush=True)
    if not (180 < lengths[0] < 1500 and 10000 < lengths[1] < 35000 and 300 < lengths[2] < 2500):
        raise ValueError("The original preface, memoir or concluding remarks may be incomplete: "+str(lengths))
    if missing or len(main)<90 or "brookhaven" not in " ".join(main[:3]).lower():
        raise ValueError("Original memoir content completeness failed, missing "+repr(missing))
    if "lafayette" not in " ".join(post).lower():
        raise ValueError("The final 1858 remarks are incomplete")
    return [
       {"name":"Preface · F. A. Tallmadge (1858)", "paragraphs":pre},
       {"name":"Memoir · Benjamin Tallmadge", "paragraphs":main},
       {"name":"Family remarks · F. A. Tallmadge (1858)", "paragraphs":post}
    ], "\n".join(lines[preface_start:after]).strip()

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
        "source": "1904 public-domain Gilliss Press facsimile reprint of Tallmadge’s original 1858 memoir, preface, and afterword",
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
        "- Original 1858 library exemplar: " + SOURCE_PAGE + "\n"
        "- Additional original 1858 scan OCR for comparison: " + ORIGINAL_1858 + "\n"
        "- 1904 IA facsimile reprint OCR transcription: " + SOURCE + "\n"
        "- The complete original 1858 preface, Tallmadge autobiographical memoir and signed family remarks are transcribed from the 1904 public-domain reprint; later 1904 editorial notes excluded.\n"
        "- Local hosted transcription: public/books/" + SLUG + "-1858-transcription.txt.\n"
        "- Local read-aloud content: public/books/" + SLUG + ".json, two sections with " + str(displayed) + " transcribed words.\n"
        "- Reader: " + filename + ", uses original Ophelia narrator, bookmark, saved reading position, chapter selector and settings.\n"
        "- Historic title page art is a clearly labeled period-inspired reconstruction, not an original scanned cover.\n"
        "- The 1904 reprint OCR has some period-type errors; common unambiguous errors are normalized, and further proofreading may still be needed.\n"
        "- This import leaves index.html (homepage) exactly unchanged, adding a catalog-only entry after validation.\n",
        encoding="utf-8"
    )
    print("SUCCESS: complete source validated, book sections", len(parts),
          "words", displayed, "hosted bytes", DATA.stat().st_size, flush=True)

if __name__ == "__main__":
    publish()
