# The Great Gatsby (1925): edition, rights, artwork, and reader verification

## Edition and copyright
- **Title:** *The Great Gatsby*
- **Author:** F. Scott Fitzgerald (1896–1940)
- **First publication:** Charles Scribner's Sons, New York, **1925**.
- **Original text:** U.S. public domain since **January 1, 2021** (published in 1925); rights in other jurisdictions can vary. We use the unabridged historic novel, not a copyrighted modern adaptation, commentary, or film tie-in.
- **Text source:** [Project Gutenberg eBook #64317](https://www.gutenberg.org/ebooks/64317), released January 17, 2021 and updated January 26, 2025; this was edited from an earlier Project Gutenberg Australia transcription and processed by Standard Ebooks. Direct GitHub mirror: [GITenberg/The-Great-Gatsby_64317](https://github.com/GITenberg/The-Great-Gatsby_64317/blob/master/64317-0.txt). The Project Gutenberg page specifically labels the text public domain in the USA.
- **Editorial processing:** Removed Gutenberg boilerplate, table-of-contents repetition, and licensing/metadata footer. Preserved all **nine chapters**, the author's original *Once again to Zelda* dedication, the epigraph attributed to **Thomas Parke d’Invilliers**, all paragraphs and the original final sentence. Paragraph line-wrapping was joined for continuous reading; poetic dedication/epigraph line breaks were kept. We have not rewritten or condensed the story. The hosted transcription is not asserted to preserve every original printer's typo of the 1925 first impression.

## Unabridged chapter audit
Original chapters **I–IX** each appear exactly once in the literary text and in original order. Source total chapter word count, based on splitting words at whitespace, approximately **48,131 words**:

| Chapter | Approximate words |
|---|---:|
| I | 5,891 |
| II | 4,279 |
| III | 5,733 |
| IV | 5,455 |
| V | 4,232 |
| VI | 4,035 |
| VII | 8,758 |
| VIII | 4,529 |
| IX | 5,219 |

Last sentence retained from the original: “So we beat on, boats against the current, borne back ceaselessly into the past.”

- Local complete-text JSON: `public/books/the-great-gatsby-1925.json`.
- Complete reader: `the-great-gatsby.html`.
- Reader ensures the original two opening sections plus nine chapters, checks ordered Roman numeral identifiers, chapter word counts and the original literary ending. No partial edition is silently displayed.

## Historic 1925 artwork
- Original first-edition dust jacket by Spanish-born artist **Francis Cugat** (1893–1981), 1925, created for Scribner's.
- [Wikimedia Commons: The Great Gatsby Cover 1925 Retouched.jpg](https://commons.wikimedia.org/wiki/File:The_Great_Gatsby_Cover_1925_Retouched.jpg).
- This specific freely reusable high-resolution image is a **digitally retouched scan** of the historic first-edition jacket: original artwork by Cugat; digital restoration by Wikimedia user Flask. It is **not** an unaltered photograph of a surviving 1925 dust jacket, so the reader and source notes explicitly describe its digital restoration.
- Image is marked U.S. public domain by Wikimedia Commons, but copyright in some other countries may vary. Displayed contained/noncropped, not stretched. Direct image source is `https://commons.wikimedia.org/wiki/Special:FilePath/The_Great_Gatsby_Cover_1925_Retouched.jpg`.

## Reader integration
- The established Ophelia reading and listening design has nine-chapter navigation (plus original dedication and epigraph), readable text formatting, optional automatic page turning, bookmark and saved progress by localStorage, adjustable type and night mode.
- Read-aloud via the browser's installed English voices and `public/js/ophelia-narration.js`, with extra spoken chapter labels “chapter one,” etc., rather than ambiguous standalone Roman numeral readings.
- Literary share panel via `public/js/ophelia-share.js`.
- Catalog card and resume link added to `index.html` (the home bookshelf feeds the searchable catalog), and `catalog.html` explicitly categorizes the new entry as Literary Fiction.
- The full literary text remains free to all visitors; no billing or subscription system is introduced.

## Verification and acceptance testing
- Independently checked the original published U.S. public-domain text and first-edition cover provenance.
- Confirmed all nine chapter text bodies, original dedication/epigraph, the original ending, valid JSON, local file paths and common reader script inclusion.
- JavaScript syntax and GitHub Pages build can be mechanically validated; **manual browser and audio QA remain necessary** for voice quality, timing, image delivery, saved-page restoration and sharing on the user's device. Don't claim voice has been listened to until that test happens.
