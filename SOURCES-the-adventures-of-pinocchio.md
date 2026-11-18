# The Adventures of Pinocchio (1883) — complete text and historical illustration

## Literary work and public-domain status
- Carlo Collodi (pen name of Carlo Lorenzini), *Le avventure di Pinocchio. Storia di un burattino*, serialized from 1881 to 1883 in *Giornale per i bambini*. First published as a complete **1883** book in Florence by **Felice Paggi**, with original woodcut illustrations by **Enrico Mazzanti**.
- Original Italian text and early first-edition illustrations are in the public domain in the United States.

## Complete English translation
- Carol Della Chiesa’s public-domain English translation, first published in 1926, via [Project Gutenberg #500](https://www.gutenberg.org/ebooks/500) and [GITenberg/The-Adventures-of-Pinocchio_500/500-0.txt](https://github.com/GITenberg/The-Adventures-of-Pinocchio_500/blob/master/500-0.txt). The underlying translation is public domain in the United States; retain attribution to the translator.
- Local source: `public/books/the-adventures-of-pinocchio-collodi-della-chiesa.txt`. The original Gutenberg editor’s preliminary housekeeping and Gutenberg license/distribution boilerplate are omitted from the reading text. All substantive narrative and original translated chapter summaries remain intact.
- **36 complete chapters**, in sequential order with the original descriptive chapter summaries, around **39,876 whitespace-delimited words** and 213,595 characters. The final chapter preserves the original English ending, in which Pinocchio becomes a real boy.
- Reader: `the-adventures-of-pinocchio.html`, **37 navigable sections** (original title/translator credit plus 36 chapters), **148 paginated reading pages** at the current reading-page size. Chapter checks independently exercised on the full public-domain text.

## Original Italian (read-only)
- [Project Gutenberg #52484, *Le avventure di Pinocchio: Storia di un burattino*](https://www.gutenberg.org/ebooks/52484), Italian-language original. Linked from the English reader as an external **read-only** companion. Italian text is not fed into the English audiobook and no synthetic Italian-language translation or reading is provided.

## Historically accurate illustration
- [Wikimedia Commons: *Pinocchio by Collodi, first edition Paggi 1883.jpg*](https://commons.wikimedia.org/wiki/File:Pinocchio_by_Collodi,_first_edition_Paggi_1883.jpg). Commons identifies this as the authentic **1883 original title page/first page**, with publisher Felice Paggi and Florence imprint. 400×600 px, public domain. This is a title-page scan of the first book edition, **not a claim that it shows the historical cloth binding or a later painted cover**.
- Period authenticity supported by [The Morgan Library & Museum’s 1883 first-edition record](https://www.themorgan.org/printed-books/65296). The picture displayed on the reader and catalog is linked from Commons via `Special:FilePath`; the reading page uses a local neutral placeholder if the remote image does not load.

## Website integration
- Featured catalog/entry: `index.html`; searchable full catalog: `catalog.html`. Catalog category: “Fairy Tales & Folklore”. Matching reader progress key: `ophelia-the-adventures-of-pinocchio-collodi-della-chiesa-v1`. The catalog has an independent fallback entry so a stale homepage fetch does not hide the book.
- Shared reader: `public/js/ophelia-narration.js` for original device/browser speech and highlighted reading, `public/js/ophelia-share.js` for sharing. Responsive controls, voice choices, page navigation, pause/resume, saved reading progress and bookmarks reuse the established framework.
- Text parsing and JavaScript syntax have been verified; actual audio quality, remote image loading and public GitHub Pages deployment still require browser checks.
