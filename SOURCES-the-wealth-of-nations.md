# The Wealth of Nations — Adam Smith (1776)

## Public domain, textual edition and completeness
- Adam Smith, *An Inquiry into the Nature and Causes of the Wealth of Nations*, first published in **two volumes** in **1776** by W. Strahan and T. Cadell, London. It contains **five books** with **32 chapters** (11 + 5 + 4 + 9 + 3).
- Original language is **English**; no foreign-language original reader is needed.
- The complete public-domain text hosted in Ophelia’s library follows the Standard Ebooks edition https://standardebooks.org/ebooks/adam-smith/the-wealth-of-nations derived from **Edwin Cannan's 1904 scholarly edition** based on Smith's **fifth and final lifetime edition (1789)**. This is **not** a diplomatic facsimile of the 1776 first edition.
- Standard Ebooks source repository: https://github.com/standardebooks/adam-smith_the-wealth-of-nations . Its LICENSE.md dedicates contributors' editorial additions to **CC0 1.0** and treats the book and its art as U.S. public domain: https://creativecommons.org/publicdomain/zero/1.0/ . Production notes: Cannan's own historical preface to the 1904 print edition is **not** included in this particular Standard Ebooks presentation because it describes print-specific spelling and page numbering. The editor's substantial scholarly Introduction **is** included.
- An alternative public domain transcription of the full work is Project Gutenberg #3300, https://www.gutenberg.org/ebooks/3300 . The actual local reader source is Standard Ebooks' chapter-split, CC0 text, **not** that Gutenberg file.
- Five local books contain these section counts:
  - `public/books/wealth-of-nations-book-1.json`: Cannan editor’s introduction, Smith's Introduction and Plan, Book I heading and 11 complete chapters (**118,798 words** including historical editorial material).
  - `public/books/wealth-of-nations-book-2.json`: Book II heading, Book II introduction, five complete chapters (**41,515 words**).
  - `public/books/wealth-of-nations-book-3.json`: Book III heading and four complete chapters (**16,295 words**).
  - `public/books/wealth-of-nations-book-4.json`: Book IV heading, Book IV introduction and nine complete chapters (**108,019 words**).
  - `public/books/wealth-of-nations-book-5.json`: Book V heading, three complete chapters and **historical appendix**, with its herring and salt tables (**109,434 words**).
- Total **394,061 words** in five hosted book files, inclusive of the editor’s introduction, book headings, all original prose and numeric table contents (text-extraction word counts, not claims about the number of words Smith originally wrote). Each historic table was converted into caption/header/row paragraphs with values separated by vertical bars, preserving the data while making tables readable in the plain-text reader. Structural headings and original text are present; the original XHTML italic and hyperlink formatting are not preserved as markup. No substantive chapters are omitted.
- Note markers originally embedded by the Standard Ebooks editorial project are excluded from narrated paragraphs to avoid disrupting English speech. The complete **1,647 numbered historical footnotes and endnotes**, totalling approximately 39,087 words, are hosted separately at `public/books/wealth-of-nations-cannan-endnotes.json` and served by the searchable, read-only page `the-wealth-of-nations-endnotes.html`. They are the scholarly annotations of Cannan’s 1904 edition, not Adam Smith’s original 1776 prose. Search by number or phrase.
- Narration uses the website’s existing English device speech synthesis, `public/js/ophelia-narration.js`, not pre-recorded LibriVox audio. All five books load as separate local JSON documents to avoid loading several megabytes unnecessarily; per-volume chapter navigation, bookmarks, and resumable reading position are saved in local storage.
- Static validation parsed the five files using the same reader parser and pagination function. Each validated 11, 5, 4, 9, 3 complete chapters respectively and a total of **1,620 reading pages** across the books, with no page exceeding about 330 rendered words. Live browser/audio behavior and GitHub Pages deployment should be verified separately.

## Authentic first-edition title page
- A genuine **1776 London first-edition title page** of Smith's *Wealth of Nations*, rather than a modern designed cover.
- Commons page: https://commons.wikimedia.org/wiki/File:Wealth_of_Nations_title.jpg ; hosted display uses https://commons.wikimedia.org/wiki/Special:FilePath/Wealth_of_Nations_title.jpg .
- Wikimedia Commons identifies the historical original as **public domain (Public Domain Mark)**. The title page is clearly labeled as originating from 1776, whereas the transcribed body follows the later Cannan/Standard Ebooks edition. Do not conflate the two.

## Website integration
- Main reader: `the-wealth-of-nations.html`.
- Scholarly notes: `the-wealth-of-nations-endnotes.html`.
- Home shelf catalog source: `index.html`. Book categorization: **Economics & Political Thought**, registered in `catalog.html`. Both HTML paths registered in `sitemap.xml`.
- Standard Ophelia reader supports English voice choice, speed, next/previous page and book, chapter picker, bookmarks, night theme, share. Local text available without redirects to an external archive.
- If the website displays the first-edition title page, label it distinctly from the Standard Ebooks/Cannan textual source.
