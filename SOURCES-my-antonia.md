# My Ántonia — original unabridged edition, text and illustration sources

## Work and rights
- Title: *My Ántonia* (1918).
- Author: Willa Sibert Cather (1873–1947).
- Literary genre: American prairie fiction, immigrant experience, memory and friendship.
- Copyright: The original 1918 text and the original W. T. Benda illustrations are public domain in the United States. Outside the United States, regional laws may differ.

## Unabridged text
Main source: Standard Ebooks complete original novel:
https://standardebooks.org/ebooks/willa-cather/my-antonia

The individual, editable, CC0-marked Standard Ebooks source chapters:
https://github.com/standardebooks/willa-cather_my-antonia

Project Gutenberg's 1918 illustrated edition:
https://www.gutenberg.org/ebooks/19810
https://www.gutenberg.org/files/19810/19810-h/19810-h.html

The 1918 novel comprises an introduction and five books, totaling 45 chapters:
1. The Shimerdas — 19 chapters.
2. The Hired Girls — 15 chapters.
3. Lena Lingard — 4 chapters.
4. The Pioneer Woman's Story — 4 chapters.
5. Cuzak's Boys — 3 chapters.

The website also preserves the original title-page epigraph (Virgil), dedication to Carrie and Irene Miner, entire introduction, and the note about the pronunciation of Ántonia from the source edition. All original narrative paragraphs are retained. The Standard Ebooks edition does not supply original illustration placements, so authentic period art is displayed as a separately credited frontispiece.

Six text files are served from this repository:
- `public/books/my-antonia-frontmatter.json` (epigraph, dedication, introduction, editorial note).
- `public/books/my-antonia-book-1.json`
- `public/books/my-antonia-book-2.json`
- `public/books/my-antonia-book-3.json`
- `public/books/my-antonia-book-4.json`
- `public/books/my-antonia-book-5.json`

Each book data file preserves the original XHTML source material at chapter level, rather than summarizing it. The reader uses the browser's XML parser to extract the original paragraphs and render them as paginated prose, removing only inline editorial footnote-link numbers from the spoken text (the editorial note remains available at the end).

## Original illustration
- Artwork used: a 1918 original illustration of Ántonia on the prairie by Władysław Teodor Benda (W. T. Benda), created for *My Ántonia*.
- Hosting source: Project Gutenberg illustrated public-domain transcription:
https://www.gutenberg.org/files/19810/19810-h/images/image09.png
- Full illustrated text, showing original context and credit:
https://www.gutenberg.org/files/19810/19810-h/19810-h.html
- Rights note confirming the 1918 Benda images public domain in the U.S.:
https://www.ibiblio.org/ebooks/Cather/Antonia/Antonia.htm
- The site links to the original historical image, rather than a modern cover or AI reconstruction. Cover frames are proportionally constrained; no cropping of the period illustration is intended.

## Website and narration
- Reader: `my-antonia.html`.
- The book is listed in `index.html` for automatic discovery in `catalog.html`; genre: Literary Fiction.
- Browser/device speech through shared `public/js/ophelia-narration.js`, plus speech settings, paragraph-sensitive sentence breaks, volume/book and chapter selection, page navigation, bookmarks, saved position, optional automatic page turning and literary `public/js/ophelia-share.js` sharing.
- Storage key: `ophelia-my-antonia-cather-1918-alice-voice-v1`.
- The 45 source chapters and source metadata were programmatically verified; a live-browser audio test is still for the website owner to verify.
