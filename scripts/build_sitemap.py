#!/usr/bin/env python3
"""Generate the public library's sitemap for its GitHub Pages project URL.

Run from anywhere: python3 scripts/build_sitemap.py
Uses standard Python only. No credentials, tracking, or external requests.
"""
from pathlib import Path
from urllib.parse import quote
from xml.sax.saxutils import escape

ROOT = Path(__file__).resolve().parents[1]
BASE = "https://opheliasopenbooks.github.io/website/"
OUTPUT = ROOT / "sitemap.xml"
# These are navigation, offline, generic or private browser-based pages.
EXCLUDED = {"index.html", "reader.html", "offline.html", "my-bookshelf.html"}


def include(path: Path) -> bool:
    if path.name in EXCLUDED or not path.is_file():
        return False
    # Respect an explicit editorial decision not to index an HTML page.
    head = path.read_text(encoding="utf-8", errors="replace")[:16000].lower()
    return not (
        'name="robots" content="noindex' in head
        or "name='robots' content='noindex" in head
    )


def generate() -> tuple[str, int]:
    urls = [BASE]
    for path in sorted(ROOT.glob("*.html")):
        if include(path):
            urls.append(BASE + quote(path.name, safe="-._~"))
    urls = sorted(set(urls))
    lines = ['<?xml version="1.0" encoding="UTF-8"?>',
             '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
    lines.extend(f"  <url><loc>{escape(url)}</loc></url>" for url in urls)
    lines.append("</urlset>")
    return "\n".join(lines) + "\n", len(urls)


def main() -> None:
    content, count = generate()
    old = OUTPUT.read_text(encoding="utf-8") if OUTPUT.exists() else ""
    if old != content:
        OUTPUT.write_text(content, encoding="utf-8")
        print(f"Updated sitemap.xml: {count} pages")
    else:
        print(f"Sitemap up to date: {count} pages")


if __name__ == "__main__":
    main()
