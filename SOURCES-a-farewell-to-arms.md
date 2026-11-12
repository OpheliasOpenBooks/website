# A Farewell to Arms — source, 1929 edition, and publication verification

## Bibliographic record
- **Work:** *A Farewell to Arms*, Ernest Hemingway (1899–1961).
- **First published:** Charles Scribner's Sons, New York, **1929**.
- **Reader:** `a-farewell-to-arms.html`.
- **Text source:** [Project Gutenberg eBook #75201](https://www.gutenberg.org/ebooks/75201), first published digitally January 24, 2025. The original-text transcription was prepared by Cindy Beyer and Distributed Proofreaders Canada and is mirrored in GITenberg at [GITenberg/A-farewell-to-arms_75201](https://github.com/GITenberg/A-farewell-to-arms_75201/blob/master/75201-0.txt).
- **Rights (USA):** The novel and 1929 jacket were published in the U.S. in 1929, and entered the U.S. public domain on **January 1, 2025**. Later editions, modern editorial materials, audiobook performances and original recordings may have additional copyrights. For other countries, including jurisdictions with life-plus-70-year rules, Hemingway's text may remain protected until 2032; take appropriate legal precautions before distributing outside the U.S.
- **Editorial treatment:** Preserved the complete literary narrative and original dedication without condensation or paraphrasing. Removed Project Gutenberg markers, ancillary advertising, licensing footer and transcriber notes from the literary presentation. Source line breaks are joined into readable paragraphs. The Project Gutenberg eBook's own notes state that some printer mistakes have been corrected, so do not describe this as a verbatim facsimile of every original 1929 printed typo.

## Completeness
The unabridged novel has **five books and 41 chapters**:
1. Book I — Chapters I–XII (12).
2. Book II — Chapters XIII–XXIV (12).
3. Book III — Chapters XXV–XXXII (8).
4. Book IV — Chapters XXXIII–XXXVII (5).
5. Book V — Chapters XXXVIII–XLI (4).

The original dedication to **G. A. Pfeiffer** is presented as an opening section. The 41 original chapter bodies total approximately **88,472 words** by simple whitespace count, including non-narrative chapter-end label(s). Chapter-title Roman numerals are visible in the reader and speech-normalized by the shared narration library.

Local assets: `public/books/a-farewell-to-arms-frontmatter.json`, plus `public/books/a-farewell-to-arms-book-1.json` through `public/books/a-farewell-to-arms-book-5.json`.

## Authentic 1929 original cover illustration
The displayed artwork is a scan of the **first-edition 1929 jacket** designed by **Cleo Damianakes** (also known as **Cleon**).
- [Wikimedia Commons: A Farewell to Arms (1929) cover.jpg](https://commons.wikimedia.org/wiki/File:A_Farewell_to_Arms_(1929)_cover.jpg)
- Media used via Wikimedia Commons Special:FilePath in the webpage. Original 1929 jacket art is public domain in the United States. Alt text and image caption credit the artist. This is authentic historical art, not a newly generated replacement.

## Reader, audio and catalog
- Familiar full Ophelia reader with five-book and chapter navigation, local saved progress and bookmarks, variable text size, evening theme, optional auto page-turn, pause/resume, rate and device voice controls.
- Uses `public/js/ophelia-narration.js` for speech-only normalization, and `public/js/ophelia-share.js` for the literary share control.
- The homepage `index.html` has a new public-domain literary card and saved-progress button. `catalog.html` discovers the book and categorizes it under Literary Fiction.

## Verification
- Downloaded and parsed original 1929 novel text via GITenberg; verified all 41 Roman-numbered chapter headings, in original order.
- Checked completeness using a chapter-word threshold; total approx. 88K words.
- Verified all six book data files and reader code present in GitHub; chapter validation prevents incomplete texts from loading silently.
- **Manual browser acceptance testing is still required** for image loading, TTS pronunciation, bookmark restoring, and reading-page navigation on the published website. Do not assert actual audio testing when not completed.
