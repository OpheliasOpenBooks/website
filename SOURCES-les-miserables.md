# Les Misérables — unabridged edition, sources, artwork and quality checks

## Literary work and edition
- **Original author:** Victor Hugo, *Les Misérables* (French original, 1862).
- **English translator:** Isabel F. Hapgood (1887), Thomas Y. Crowell & Co.
- **Edition on Ophelia's Open Book:** the complete, unabridged Hapgood translation, five volumes comprising 48 books and **365 original chapters**.
- **Public domain:** original and 1887 English translation are in the United States public domain.
- No summarization, modern rewording, or selective abridgement of Hugo's narrative was introduced.

### Text sources and provenance
- Primary complete transcription: Project Gutenberg eBook 135: https://www.gutenberg.org/ebooks/135
- Public text mirror used to obtain the complete five-volume transcription: https://github.com/GITenberg/Les-Mis-rables_135
- Comparison and modern editorial resource: Standard Ebooks: https://standardebooks.org/ebooks/victor-hugo/les-miserables/isabel-f-hapgood
- Its source files are on GitHub: https://github.com/standardebooks/victor-hugo_les-miserables_isabel-f-hapgood
- English translation printed in 1887; public-domain origin is distinct from modern theatrical or musical adaptations.

### Volume structure
- `public/books/les-miserables-volume-1.json` — Fantine: 8 books, 70 chapters, plus Hugo's 1862 preface.
- `public/books/les-miserables-volume-2.json` — Cosette: 8 books, 76 chapters.
- `public/books/les-miserables-volume-3.json` — Marius: 8 books, 76 chapters.
- `public/books/les-miserables-volume-4.json` — Saint-Denis: 15 books, 76 chapters.
- `public/books/les-miserables-volume-5.json` — Jean Valjean: 9 books, 67 chapters, plus Hugo's letter to M. Daelli (1862) and the complete historical footnotes found in the source transcription.

The historical source was divided into navigable book/chapter paragraphs; all 365 chapters and the three historical supplements are preserved. Chapter heading numerals are written as ordinary Arabic numerals in the reader's navigation labels so browser read-aloud voices treat them as numbers. The English translation's paragraphs retain their original vocabulary and wording. A small number of headings split across physical lines were rejoined and obvious electronic-image-viewer placeholders (such as the standalone word 'Enlarge' and redundant end-of-volume notices) were omitted. These are not part of the literary narrative. Two chapters have untitled headings in the source and are labeled with their chapter numbers rather than inventing titles.

## Historic cover illustration
- Artist: Émile Bayard (1837–1891), *Young Cosette Sweeping*, 1862 original illustration.
- Source: Paris Musées / Maison de Victor Hugo, via Wikimedia Commons:
  https://commons.wikimedia.org/wiki/File:Cosette-sweeping-les-miserables-emile-bayard-1862.jpg
- Public-domain status: explicitly identified by Wikimedia Commons as public domain in the US, with Public Domain Mark.
- The original drawing is used in the book reader and book-card thumbnail; it is not an AI reconstruction and is shown uncropped using CSS object-fit: contain.

## Reader and catalog
- Reader: `les-miserables.html`.
- Chapter selector: choose one of the five volumes and then a specific book/chapter from that volume; a global page selector and previous/next navigation are also provided.
- Narration: synthesized by device/browser voices via `public/js/ophelia-narration.js`, with the central Roman-numeral and capitalization normalization.
- Progress: saved locally via `ophelia-les-miserables-hugo-hapgood-1887-unabridged-v1`.
- Original literary-style sharing: `public/js/ophelia-share.js`.
- `index.html` contains the full direct book card; `catalog.html` discovers it automatically, categorized as Historical Fiction.
- Original assets and source attribution remain visible to visitors below the reader.
