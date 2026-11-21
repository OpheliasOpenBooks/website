#!/usr/bin/env python3
"""Import all nine volumes of Jefferson's H. A. Washington edition.
The catalog must remain unpublished until a separate reader check succeeds.
"""
import json,re,urllib.request,pathlib,sys
root=pathlib.Path(__file__).resolve().parents[1]
manifest=json.loads((root/'editorial/presidential-library/jefferson-writings-source-manifest.json').read_text())
assert len(manifest['volumes'])==9
staged={}
for entry in manifest['volumes']:
    n=entry['volume']
    ebook=entry['gutenbergEbook']
    urls=[f'https://www.gutenberg.org/cache/epub/{ebook}/pg{ebook}.txt',
          f'https://www.gutenberg.org/files/{ebook}/{ebook}-0.txt',
          f'https://www.gutenberg.org/ebooks/{ebook}.txt.utf-8']
    raw=None
    for url in urls:
        try:
            req=urllib.request.Request(url,headers={'User-Agent':'Mozilla/5.0 (OpheliasOpenBook archival project)'})
            with urllib.request.urlopen(req,timeout=60) as response:
                candidate=response.read().decode('utf-8-sig')
            if len(candidate)>50000 and re.search(r'THE WRITINGS OF THOMAS JEFFERSON',candidate,re.I):
                raw=candidate
                break
        except Exception as error:
            print(f'Volume {n} source fallback: {error}',file=sys.stderr)
    if raw is None: raise RuntimeError(f'Unable to retrieve and verify volume {n} of nine; no files will be written.')
    raw=raw.replace('\r\n','\n').replace('\r','\n')
    a=re.search(r'\*\*\*\s*START OF (?:THE|THIS) PROJECT GUTENBERG EBOOK[^\n]*\*\*\*',raw,re.I)
    b=re.search(r'\*\*\*\s*END OF (?:THE|THIS) PROJECT GUTENBERG EBOOK',raw,re.I)
    if a is None or b is None or b.start()<=a.end():
        raise RuntimeError(f'Gutenberg boundaries invalid in volume {n}; declining incomplete import')
    body=raw[a.end():b.start()].strip()
    if len(body.split())<12000:raise RuntimeError(f'Insufficient text in volume {n}')
    if not re.search(r'(JEFFERSON|CONTENTS|INDEX)',body,re.I):raise RuntimeError(f'Volume {n} failed title check')
    staged[entry['localFile']]=body+'\n'
# Write only after all 9 source documents pass checks.
for name,body in staged.items():
    destination=root/name
    destination.parent.mkdir(parents=True,exist_ok=True)
    destination.write_text(body,encoding='utf-8')
print('All nine volumes imported:',sum(len(x.split()) for x in staged.values()),'words')

# Trigger initial source validation after the workflow has been registered.
