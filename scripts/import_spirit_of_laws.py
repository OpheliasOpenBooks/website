#!/usr/bin/env python3
"""Import the full public-domain 1914 Nugent / Prichard Spirit of Laws transcription.

Constitution Society's complete plain-text rendering is hosted at constitution.org.
The original author published De l'esprit des loix in 1748; the English text here
is the Nugent translation as revised by J. V. Prichard, from the 1914 G. Bell edition.
"""
from pathlib import Path
import urllib.request, re, sys

SOURCES = [
    'https://constitution.org/2-Authors/cm/sol.txt',
    'https://famguardian.org/Publications/SpiritOfLaws/sol.txt',
]
raw = None
for url in SOURCES:
    try:
        request = urllib.request.Request(url, headers={
            'User-Agent':'Mozilla/5.0 (OpheliasOpenBooks; noncommercial public-domain text archival)'
        })
        with urllib.request.urlopen(request, timeout=70) as response:
            data = response.read()
        print('Source:', url, 'bytes:', len(data), flush=True)
        if len(data) < 1_000_000:
            raise ValueError('Source unexpectedly short')
        for encoding in ('utf-8-sig','cp1252','latin-1'):
            try: raw=data.decode(encoding);break
            except UnicodeDecodeError:continue
        if raw is None: raise ValueError('Could not decode source')
        break
    except Exception as exc:
        print('Fetch failed:',url,repr(exc),flush=True)
else:
    raise RuntimeError('Neither historical public-domain text mirror was accessible')

raw=raw.replace('\r\n','\n').replace('\r','\n').strip()+'\n'
# The imported artifact retains original spelling, chapter breaks, footnotes,
# prefatory matter, and source formatting, with no truncation or paraphrase.
lc=raw.casefold()
if 'spirit of laws' not in lc or 'montesquieu' not in lc:
    raise ValueError('Incorrect downloaded work')
if not (re.search(r'BOOK\s+I\b', raw, re.I) and re.search(r'BOOK\s+XXXI\b', raw, re.I)):
    raise ValueError('Source lacks either opening or concluding Book heading')
if len(raw.split())<180000:
    raise ValueError(f'Source contains too few words: {len(raw.split())}')

dest=Path('public/books/spirit-of-laws-montesquieu-nugent-prichard-1914.txt')
dest.parent.mkdir(parents=True, exist_ok=True)
dest.write_text(raw, encoding='utf-8')
print(f'Validated complete text: {len(raw):,} characters / {len(raw.split()):,} words; saved {dest}')
