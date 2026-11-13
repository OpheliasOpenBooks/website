# Kidnapped — provenance and reader verification

- **Work:** Robert Louis Stevenson, *Kidnapped* (1886), public domain in the United States. Project Gutenberg eBook #421: https://www.gutenberg.org/ebooks/421.
- **Hosted complete text:** `public/books/kidnapped-stevenson-1886.txt`; from Project Gutenberg transcription mirrored by GITenberg: https://github.com/GITenberg/Kidnapped_421/blob/master/421-0.txt. Gutenberg distribution boilerplate removed, while the title/subtitle, *Preface to the Biographical Edition* by Mrs. Stevenson, contents, and all 30 chapters are retained. Approximately 81,900 words. The preface is later editorial matter from the transcription, not claimed as part of the first 1886 printing.
- **Validation:** 30 chapter headers in ascending Roman order I–XXX, complete final chapter and historical preface. Reader parser tested on committed text, yielding 31 sections (front matter + 30 chapters) and 305 reading pages.
- **Historical illustration:** `https://commons.wikimedia.org/wiki/File:Kidnapped_cover_(WBHole).jpg`, illustration by William Brassey Hole from a 19th-century edition (Wikimedia Commons catalogues the scan as 1895). Not represented as original first-edition cover art.
- **Reader:** `kidnapped.html`, local text fetch, existing Ophelia grammatical speech system (no prerecorded audio), adjustable voices and speed, bookmarks, resuming position, auto-turn, and ornamental chapter separators normalized for speech only.
- **Catalog:** `index.html` bookshelf entry automatically indexed by `catalog.html`, category Adventure.
- **QA:** JavaScript syntax and complete-text parser verified. Live browser rendering and actual audio on devices have not been independently tested.
