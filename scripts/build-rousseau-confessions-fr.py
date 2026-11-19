#!/usr/bin/env python3
"""Prepare a complete locally hosted, read-only edition of Rousseau's French Confessions.
Source: RousseauOnline, Du Peyrou–Moultou Geneva 1782–1789 historical edition.
The French text is public domain; RousseauOnline requests source attribution.
This script runs only when its own file is changed or deliberately dispatched.
"""
from __future__ import annotations
import json
import re
import unicodedata
from pathlib import Path

import requests
from bs4 import BeautifulSoup

BASE = "https://www.rousseauonline.ch/Text/"
SOURCES = {
    "first": BASE + "volume-10-les-confessions-les-reveries-du-promeneur-solitaire.php",
    "second": BASE + "volume-16-second-supplement-a-la-collection-des-oeuvres-de-jj-rousseau-tome-premier.php",
    "final": BASE + "Section0172.php",
}
NAMES = (
    "PREMIER", "SECOND", "TROISIEME", "QUATRIEME", "CINQUIEME",
    "SIXIEME", "SEPTIEME", "HUITIEME", "NEUVIEME", "DIXIEME",
    "ONZIEME", "DOUZIEME",
)
ROMANS = ("I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII")
OUT = Path("public/books")
OUT.mkdir(parents=True, exist_ok=True)

def canon(text: str) -> str:
    text = unicodedata.normalize("NFD", text).upper()
    text = "".join(c for c in text if unicodedata.category(c) != "Mn")
    return re.sub(r"\s+", " ", text).strip()

def fetch(url: str) -> BeautifulSoup:
    resp = requests.get(url, headers={"User-Agent": "Mozilla/5.0 (compatible; OpheliasOpenBook/1.0; public domain archival edition)"}, timeout=55)
    resp.raise_for_status()
    resp.encoding = resp.apparent_encoding or "utf-8"
    if len(resp.content) < 12000:
        raise ValueError(f"Source too small: {url} {len(resp.content)} bytes")
    print(f"Source: {url} ({len(resp.content)} bytes)", flush=True)
    return BeautifulSoup(resp.text, "html.parser")

def section(doc: BeautifulSoup, name: str) -> list[str]:
    heading = next((h for h in doc.find_all(["h3", "h4"])
                    if canon(h.get_text(" ", strip=True)) == canon(name)), None)
    if heading is None:
        titles = [canon(h.get_text(" ", strip=True)) for h in doc.find_all(["h3", "h4"])]
        raise ValueError(f"Missing {name!r}; nearby headings: {titles[:22]}")
    paragraphs: list[str] = []
    for el in heading.find_all_next(["p", "h1", "h2", "h3"]):
        if el.name != "p":
            break
        # Ignore HTML page links [123], which belong to the digitization UI rather than text.
        for a in el.find_all("a"):
            if re.fullmatch(r"\[\d+\]", a.get_text(" ", strip=True)):
                a.decompose()
        text = re.sub(r"\s+", " ", el.get_text(" ", strip=True)).strip()
        if text and not re.fullmatch(r"\[\d+\]", text) and not text.lower().startswith("copyright ©"):
            paragraphs.append(text)
    words = len(" ".join(paragraphs).split())
    print(f"  {name}: {len(paragraphs)} paragraphs, {words} words", flush=True)
    if words < 6000:
        raise ValueError(f"Suspiciously short {name}: only {words} words")
    return paragraphs

def main() -> None:
    sources = {k: fetch(v) for k, v in SOURCES.items()}
    books: list[dict] = []
    for idx, title in enumerate(NAMES, 1):
        document = sources["first"] if idx <= 6 else sources["second"] if idx <= 11 else sources["final"]
        lines = section(document, f"LIVRE {title}")
        if idx == 11:
            # The 1789 edition continues Book XI in the following original bound volume.
            lines.extend(section(sources["final"], "SUITE DU LIVRE ONZIEME"))
        books.append({
            "name": f"Livre {ROMANS[idx-1]}",
            "kind": "book",
            "number": idx,
            "paragraphs": lines,
        })
    all_text = " ".join(" ".join(book["paragraphs"]) for book in books)
    if "Je forme une entreprise" not in all_text or "Ici commence l" not in all_text:
        raise ValueError("Start or closing book is not present")
    if not ("Fin du douzi" in all_text or "Fin du Douzi" in all_text):
        raise ValueError("The work's final book ending is missing")
    parts = []
    for n in range(1, 5):
        subset = books[(n-1)*3:n*3]
        words = len(" ".join(" ".join(book["paragraphs"]) for book in subset).split())
        if len(subset) != 3 or words < 27000:
            raise ValueError(f"Incomplete French part {n}: {words} words")
        name = f"rousseau-confessions-fr-part-{n}.json"
        payload = {
            "title": "Les Confessions",
            "author": "Jean-Jacques Rousseau",
            "language": "fr",
            "volume": n,
            "source": "RousseauOnline, Du Peyrou–Moultou original collection, Geneva 1782–1789",
            "readOnly": True,
            "sections": subset,
        }
        (OUT / name).write_text(json.dumps(payload, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
        parts.append({
            "number": n, "file": name,
            "label": f"Tome {ROMANS[n-1]} · Livres {ROMANS[(n-1)*3]}–{ROMANS[n*3-1]}",
            "words": words, "sectionCount": 3,
        })
        print(f"Saved {name}: {words} words", flush=True)
    manifest = {
        "title": "Les Confessions", "author": "Jean-Jacques Rousseau",
        "language": "fr", "readOnly": True, "partCount": 4,
        "wordCount": sum(p["words"] for p in parts), "parts": parts,
    }
    (OUT / "rousseau-confessions-fr-manifest.json").write_text(
        json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"SUCCESS: all 12 books hosted, {manifest['wordCount']} French words", flush=True)

if __name__ == "__main__":
    main()
