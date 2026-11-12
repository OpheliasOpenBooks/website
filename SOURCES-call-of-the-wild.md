# The Call of the Wild — provenance and publication notes

## Work and rights
- **Author:** Jack London (1876–1916).
- **Title:** *The Call of the Wild* (1903).
- **Format:** Full original opening verse (epigraph) and all seven chapters of the novel.
- **United States copyright:** public domain (1903 publication).

## Literary text
- Standard Ebooks: https://standardebooks.org/ebooks/jack-london/the-call-of-the-wild
- Source repository: https://github.com/standardebooks/jack-london_the-call-of-the-wild
- Project Gutenberg text: https://www.gutenberg.org/ebooks/215
- 1903 illustrated edition transcription: https://en.wikisource.org/wiki/The_Call_of_the_Wild_(London)

Standard Ebooks' source contributors dedicate their contributions to the public domain under CC0. The text here is the complete seven-chapter source, with the original opening verse. The chapter headings on our reader use Arabic numbers for accessible, reliable narration, but the underlying prose is preserved.

Source files committed to this repository:
- `public/books/call-of-the-wild-epigraph.xhtml`
- `public/books/call-of-the-wild-chapter-1.xhtml`
- `public/books/call-of-the-wild-chapter-2.xhtml`
- `public/books/call-of-the-wild-chapter-3.xhtml`
- `public/books/call-of-the-wild-chapter-4.xhtml`
- `public/books/call-of-the-wild-chapter-5.xhtml`
- `public/books/call-of-the-wild-chapter-6.xhtml`
- `public/books/call-of-the-wild-chapter-7.xhtml`

## Cover illustration
- **Artist:** Charles Livingston Bull.
- **Title:** *With the Aurora Borealis* (illustration on page 85 of the 1903 edition).
- **Provenance:** The Macmillan Company (1903), Wikimedia Commons.
- Wikimedia Commons file: https://commons.wikimedia.org/wiki/File:The_Call_of_the_Wild_(1903)_p._85_With_the_aurora_borealis.jpg
- **Rights:** Public domain in the United States; the image page notes that status may vary outside the US.
- The book reader and homepage use a Commons-hosted image rather than a modern copyrighted cover.

## Site implementation
- New reader: `call-of-the-wild.html`
- Auto-indexed from the home bookshelf in `index.html` into `catalog.html`
- Genre: Adventure
- Storage key: `ophelia-call-of-the-wild-london-1903-alice-voice-v1`

Uses the standard speech normalizer (`public/js/ophelia-narration.js`), grammatical speech segmentation, automatic page turn, bookmarks, voice selection, saved reading position, accessible chapter navigation and the literary shared sharing button (`public/js/ophelia-share.js`). The book text remains local to our website so it is read from the website rather than a third-party server. No audio recording is distributed; narration is synthesized in the visitor's own browser.
