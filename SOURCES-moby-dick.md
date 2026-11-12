# Moby-Dick — source and rights record

## Literary work
- **Author:** Herman Melville (1819–1891).
- **Work:** *Moby-Dick; or, The Whale* (1851), first American edition, with its Epilogue.
- **Source of readable text:** [Standard Ebooks: Moby-Dick](https://standardebooks.org/ebooks/herman-melville/moby-dick), using the publicly available [XHTML chapter transcriptions](https://github.com/standardebooks/herman-melville_moby-dick/tree/master/src/epub/text). This project credits a [Project Gutenberg transcription](https://www.gutenberg.org/ebooks/2701) and page scans.
- **Rights:** Herman Melville’s 1851 novel is public domain in the United States; the Standard Ebooks contributors dedicate their work to the public domain under **CC0 1.0 Universal**. Laws elsewhere may differ. No modern protected edition or modern protected cover image is reproduced.

## Included content
- Original opening sections: **Etymology** and **Extracts (Supplied by a Sub-Sub-Librarian)**.
- **135 chapters**, in their original narrative order from *Loomings* to *The Chase—Third Day*.
- **Epilogue**, which was omitted from the first British edition but included in the first American edition.
- All text has been converted from the Standard Ebooks XHTML into plain paragraphs for the site's original reader. Hyperlinks, HTML tags and incidental publishing metadata have not been reproduced. Historical spelling and source passages are retained; some structural text formatting is simplified for the browser reading and narration experience.

## Reader and files
- Reader: `moby-dick.html`.
- Text: `public/books/moby-dick-frontmatter.json`, `public/books/moby-dick-01.json` through `moby-dick-12.json`, `public/books/moby-dick-epilogue.json`.
- Each JSON section stores chapter number (for chapters), chapter title and the paragraphs of original literary text.
- `moby-dick.html` fetches all 14 local JSON files, verifies both preamble sections, validates exactly 135 ordered chapters, requires the Epilogue, and only then enables reading and listening.
- The browser automatically paginates paragraphs at the existing comfortable reading length; static verification yielded **771 digital pages**.
- Narration: `public/js/ophelia-narration.js?v=1.1.0` (the shared case and Roman-numeral normalizer). Sharing: `public/js/ophelia-share.js`. Reading position is stored locally under `ophelia-moby-dick-melville-1851-alice-voice-v1`.
- Historical book is classified as **Adventure** in the searchable library catalog and appears as book number **25** on the homepage.

## Original illustration for this website
- **Artwork:** *Captain Ahab and the White Whale* — original AI-generated illustration created for Ophelia’s Open Book on November 12, 2026.
- **Image stored in this website’s GitHub repository:** `public/art/moby-dick-original.avif`.
- **Original generated file:** a detailed portrait-format image of Ahab confronting the white whale amid stormy seas. The on-site AVIF is an optimized 360 × 450 version (8,908 bytes) intended for catalog and reader use.
- **Presentation:** catalog art uses `object-fit: contain`; the reader page limits image height to 370px without cropping.
- **Attribution:** do not identify this new artwork as an actual 1851 illustration or historical first-edition title page. It was newly generated for the website.
- **Technical:** The illustration is now hosted locally, so there is no dependency on a third-party Wikimedia thumbnail address.

## Verification
- Verified 138 text sections: Etymology + Extracts + 135 chapters + Epilogue.
- Verified 135 distinct chapter numbers in order (1–135), 209,041 whitespace-delimited words across imported sections, and 2,679 text paragraphs.
- Confirmed first chapter begins “Call me Ishmael,” and the Epilogue ends with Ishmael’s rescue aboard the *Rachel*.
- Verified JavaScript parsing and shared module references. Interactive narration in Microsoft Edge and the production website's deployment have not been independently tested.
