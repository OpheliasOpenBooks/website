# The Return of the Native — complete, unabridged Hardy edition

## Publication and rights
- **Work:** *The Return of the Native*, Thomas Hardy (1840–1928), first published in *Belgravia* and in three-volume book form in **1878**.
- **Site reader:** `the-return-of-the-native.html`, free to read and listen with the shared Ophelia narration interface.
- **Rights:** The original 1878 literary work and the 1878 map are in the public domain in the United States. Standard Ebooks publishes its transcribed and normalized source files under a CC0 dedication. International copyright laws may vary.
- **Primary edition used:** [Standard Ebooks, The Return of the Native](https://standardebooks.org/ebooks/thomas-hardy/the-return-of-the-native), based on a historical public-domain edition; [CC0 editable source](https://github.com/standardebooks/thomas-hardy_the-return-of-the-native). Comparison source: [Project Gutenberg #122](https://www.gutenberg.org/ebooks/122), [Project Gutenberg #17500](https://www.gutenberg.org/ebooks/17500). The hosted edition preserves the original narrative: it is not a condensed edition, paraphrase or modern-English rewrite.

## Completeness check: all six books and forty-eight chapters
1. Book I: The Three Women — 11 complete chapters.
2. Book II: The Arrival — 8 complete chapters.
3. Book III: The Fascination — 8 complete chapters.
4. Book IV: The Closed Door — 8 complete chapters.
5. Book V: The Discovery — 9 complete chapters.
6. Book VI: Aftercourses — 4 complete chapters.

Total: **48 chapters**, plus the original epigraph, Thomas Hardy's later **1895 preface**, **1912 postscript**, and three editorial endnotes. The postscript and revised editorial notes represent Hardy's later-authorized paratext, and should be identified as such: they were not present in the original 1878 first printing. The six books and chapters are from the complete later public-domain source edition, rather than a claim to be an exact diplomatic transcription of the first 1878 printing.

Six source-data files are hosted locally:
- `public/books/return-of-the-native-book-1.json`
- `public/books/return-of-the-native-book-2.json`
- `public/books/return-of-the-native-book-3.json`
- `public/books/return-of-the-native-book-4.json`
- `public/books/return-of-the-native-book-5.json`
- `public/books/return-of-the-native-book-6.json`

Opening material and endnotes: `public/books/return-of-the-native-frontmatter.json`. Each complete chapter is stored as its source XHTML, retaining historical text and verse; the reader extracts paragraphs at page-render time, with display unaffected by speech normalization. Small editorial footnote-reference links are removed from the read-aloud text but the full notes are presented at the end. The reader checks the exact book/chapter counts before enabling the reading features.

## Historic original illustration
The initial frontispiece is Hardy's authentic **1878 sketch map of the scene of the story**, originally published with the three-volume novel and prepared by **Stanford's Geographical Establishment, London**:
- [Wikimedia Commons verified image](https://commons.wikimedia.org/wiki/File:Return_of_the_Native_-_Sketch_Map_-_Frontispiece_-_1878.png)
- [Original book scan at Internet Archive](https://archive.org/details/returnofnative01hard/page/n11/mode/2up)
- Original cartographic image: public domain in the U.S.; attributed in both the reader and home catalog. The file is linked through Wikimedia Commons Special:FilePath rather than copied or edited. Image size is limited to a proportional, noncropped 370px-high reader frontispiece and a contained image in the catalog.

## Reader functionality
- Shared `public/js/ophelia-narration.js` normalizes Roman numerals and decorative capitals **only for speech**, without changing the printed historic work.
- Shared `public/js/ophelia-share.js` provides the literary share UI.
- Six-book and 48-chapter navigation, automatic page turning, voice and pace control, adjustable type, evening theme, saved reading position, manual bookmark, progress display.
- `index.html` includes the direct book card and resume link; `catalog.html` automatically discovers the book and assigns it to Literary Fiction.

## Verification
- Verified all six source files contain exactly 11, 8, 8, 8, 9 and 4 complete XHTML chapter documents, with the original introduction and endnotes in a separate file.
- Compiled the new reader's inline JavaScript syntax successfully; verified all local file paths and shared script references in the committed code.
- **Manual browser testing is still needed** for playback, image delivery, auto-turn behavior, bookmark restore, and live catalog discovery. Do not claim these were personally listened to until tested.
