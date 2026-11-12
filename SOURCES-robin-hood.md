# The Merry Adventures of Robin Hood — provenance and reader audit

## Edition and copyright
- **Title:** *The Merry Adventures of Robin Hood of Great Renown, in Nottinghamshire*
- **Author and original illustrator:** Howard Pyle (1853–1911).
- **First published:** Charles Scribner's Sons, New York, 1883.
- **Status:** 1883 book text and Pyle's drawings are public domain in the United States. Copyright conditions in other countries may differ.
- **Complete textual source:** Project Gutenberg eBook [10148](https://www.gutenberg.org/ebooks/10148), mirrored from [GITenberg](https://github.com/GITenberg/The-Merry-Adventures-of-Robin-Hood_10148/blob/master/10148.txt).
- **Local authoritative copy:** `public/books/merry-adventures-of-robin-hood-pyle-1883.txt` (589,908 characters; approximately 111,122 words in the cleaned Gutenberg source).
- Project Gutenberg's distribution-license boilerplate and transcriber header are excluded from the on-site literary text; the author's preface, full prologue, chapter text, and epilogue are retained. No retelling, summarization, or abridgment is substituted.

## Structure
The reader `merry-adventures-of-robin-hood.html` exposes 23 navigable sections:
1. Author's Preface & Prologue (includes original contents listing)
2. Twenty-one adventures, starting with “How Robin Hood Came to Be an Outlaw” and ending with “King Richard Comes to Sherwood Forest”
3. Epilogue, ending with Pyle's farewell at Robin Hood's grave.

On load, the client checks for all expected headings in order, verifies the original preface and prologue and at least 105,000 words, and refuses to label an incomplete text as unabridged.

## Original public-domain art
- Original 1883 decorative title page: [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:1883_decorative_title_page.jpg); embedded by its Wikimedia file URL.
- Howard Pyle's engraved frontispiece: [GITenberg 10148 illustrated edition](https://github.com/GITenberg/The-Merry-Adventures-of-Robin-Hood_10148/blob/master/10148-h/images/frontis.jpg); embedded by its raw public image URL.
- Only **selected** original illustrations are included in the site display; this is not a claim to reproduce every historic plate in the 1883 physical edition.

## Site integration
- Reading page: `merry-adventures-of-robin-hood.html`
- Landing-page card: `index.html`
- Dynamically populated alphabetized catalog, genre “Adventure & Folklore”: `catalog.html`
- Reuses `public/js/ophelia-narration.js` and `public/js/ophelia-share.js`, saved page and bookmark state, grammatical sentence segmentation, optional automatic page turns, adjustable reading speed, text size, and night mode.
- Reading key: `ophelia-robin-hood-pyle-1883-alice-voice-v1`.

## Source verification
- [Project Gutenberg book record](https://www.gutenberg.org/ebooks/10148) explicitly identifies the book as public domain in the U.S.
- [The Metropolitan Museum of Art, collection 355792](https://www.metmuseum.org/art/collection/search/355792) verifies the original book was written and illustrated by Pyle and first published in 1883.
- [RISD 1883 Special Collections edition](https://digitalcommons.risd.edu/specialcollections_books_illustration/57/) documents the original illustrated format.
