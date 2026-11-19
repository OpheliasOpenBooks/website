# Common Sense — Thomas Paine (1776)

## Complete historical edition
- First published anonymously in Philadelphia on **January 10, 1776**, by printer Robert Bell.
- The locally hosted text is **NOT the January first printing**: it reproduces the expanded **W. & T. Bradford printing, Philadelphia, February 14, 1776**, as transcribed in Project Gutenberg #147.
- Full source: https://www.gutenberg.org/ebooks/147 and UTF-8 text https://github.com/GITenberg/Common-Sense_147/blob/master/147-0.txt . The source labels the expanded edition explicitly and credits transcriber John Campbell with modifications by Robert Homa.
- Local text is `public/books/common-sense-paine-bradford-1776.json`, 21,662 words of historical text including section/title material, in eight reader sections: (1) period title-page text, (2) introduction, (3–6) all four arguments, (7) appendix, and (8) address to the people called Quakers, ending with FINIS.
- Retain Bradford-edition historically significant wording and spelling, even if politically or religiously controversial; do not alter or present as current editorial advocacy. Paragraphs were reconstructed from hard-wrapped Gutenberg lines, and Gutenberg distribution boilerplate and transcriber-inserted reaction quotes were excluded.
- This is a public-domain historical transcription, not a photographic facsimile of the Bradford imprint. The transcriber's own note states the version retains historic spelling/capitalization and that the appended historical reactions were added, not part of Paine's work.
- The author wrote the text originally in **English**, so no original-language secondary reader is appropriate.

## Original-era art
- Title-page photograph of a 1776 printing, scanned without alteration and marked Public Domain Mark, via Wikimedia Commons https://commons.wikimedia.org/wiki/File:Commonsense.jpg .
- Image file https://commons.wikimedia.org/wiki/Special:FilePath/Commonsense.jpg .
- The Commons description says scan of the title page of *Common Sense*, original work 1776. It **does not identify the exact edition**: do not assert the image is the Bradford February edition or the January first edition.
- No modern illustrated cover is substituted; the period letterpress document itself is the cover image.

## Integration
- Reading page: `common-sense.html` using a local JSON fetch from `public/books/common-sense-paine-bradford-1776.json`; 87 formatted pages in initial static pagination check.
- Existing English narration from `public/js/ophelia-narration.js`, adjustable voice/speed, text size, bookmarks, resume, night mode, share; no pre-recorded LibriVox.
- Added book card to `index.html` and category **American History & Political Thought** in `catalog.html`, with sitemap link to reader.
- Static checks verify the local data, title, beginning/ending, section count, JavaScript syntax, and navigation pagination. Live browser audio and GitHub Pages deployment must be checked separately.
