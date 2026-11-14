# Source record — Crime and Punishment (1866), Fyodor Dostoevsky

## Copyright and editions
- Original Russian novel by Fyodor Dostoevsky (1821–1881), serially published in 1866. First Russian book-form edition: 1867.
- The English reading text is **Constance Garnett's 1914 translation**, in the U.S. public domain; it is not a modern copyrighted translation.
- Translation and U.S. public-domain status independently confirmed by Project Gutenberg eBook 2554: https://www.gutenberg.org/ebooks/2554
- The on-site proofread electronic text comes from Standard Ebooks: https://github.com/standardebooks/fyodor-dostoevsky_crime-and-punishment_constance-garnett
- The source is a carefully proofread modern electronic presentation of the original Garnett translation. Line breaks, some typography, italic presentation and editorial endnotes have been normalized for the site's text and audio controls; it is not a facsimile of a 1914 physical printing.

## Full literary contents
- Six original parts, with **7 + 7 + 6 + 6 + 5 + 8 = 39 chapters**, all present in original sequence.
- Two distinct **Epilogue sections I and II** are included, as are **Constance Garnett's translator's preface** and the three explanatory notes in the Standard Ebooks edition.
- Reading data is split into seven local files, from `public/books/crime-and-punishment-garnett-1914-01.json` through `public/books/crime-and-punishment-garnett-1914-07.json`.
- The main novel and epilogue together contain approximately **204,303 whitespace-delimited words** in the locally hosted transcription. The reader groups this into **771 reading pages**.
- The text begins 'On an exceptionally hot evening early in July a young man came out of the garret in which he lodged ...'.
- The translation ends 'That might be the subject of a new story, but our present story is ended.'
- Source chapter files are under `src/epub/text/chapter-1-1.xhtml` through `src/epub/text/chapter-6-8.xhtml`, plus `preface.xhtml`, `epilogue.xhtml` and `endnotes.xhtml` in the Standard Ebooks repository linked above.

## Original cover provenance
- This is the real **1867 St. Petersburg, original Russian first book-edition cover, volume I**. It is NOT represented as a copy of the Garnett translation.
- Wikimedia Commons file: https://commons.wikimedia.org/wiki/File:Cover_of_the_first_edition_of_Crime_and_Punishment.jpg
- Original image: https://upload.wikimedia.org/wikipedia/commons/c/cd/Cover_of_the_first_edition_of_Crime_and_Punishment.jpg
- Wikimedia source credits the 1867 Bazunov, Prats and Veydenstraukh first Russian book edition; the artwork is identified as public domain.

## Site integration and scope of testing
- Reader HTML: `crime-and-punishment.html`, with device/browser narration, voice and reading-speed choices, page controls, saved progress, bookmarking, readable text-size controls, dark theme, and shared literary share button.
- Home page catalog card: `index.html`; searchable alphabetical catalog category: `Russian Literature`, configured in `catalog.html`.
- Local progress key: `ophelia-crime-and-punishment-garnett-1914-v1`.
- Programmatic checks confirmed 44 reader sections (title, preface, 39 chapters, 2 epilogue parts, notes), ending passage, 771 pages, and passing JavaScript syntax.
- Manual end-to-end browser voice testing, live GitHub Pages deployment and remote image-load testing were not independently performed.