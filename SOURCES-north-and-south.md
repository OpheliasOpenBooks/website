# Sources — *North and South* (1854–1855), Elizabeth Gaskell

## Public-domain literary edition

- **Work:** Elizabeth Cleghorn Gaskell (1810–1865), *North and South*, first serialized in Charles Dickens’s magazine *Household Words* in 1854–1855 and issued in **two volumes by Chapman and Hall, London, 1855**.
- **Complete reader text:** Standard Ebooks <https://standardebooks.org/ebooks/elizabeth-gaskell/north-and-south>, assembled from the transcription at Project Gutenberg. The approved chapter source files are at <https://github.com/standardebooks/elizabeth-gaskell_north-and-south>, in `src/epub/text/chapter-1.xhtml` through `chapter-52.xhtml`.
- **Independent public-domain source:** Project Gutenberg eBook 4276 <https://www.gutenberg.org/ebooks/4276> (U.S. public domain), complete 52-chapter text produced by Chuck Greif and Distributed Proofreaders. The Standard Ebooks presentation itself is CC0-licensed.
- The source text is a cleaned modern digital transcription of the original 1855 book-form narrative; it is **not a scanned facsimile**. Original Victorian prose, narrative chronology, original chapter titles, named characters and the narrative's final exchange have been preserved.

## Historical 1855 illustration

- The reader and public catalog use the **actual 1855 first-edition title page**, volume I, rather than an invented or modern cover. The title page identifies the author as “The author of *Mary Barton*, *Ruth*, *Cranford*, &c.” rather than by her name, typical of the contemporary first edition.
- Image licensing and provenance: Wikimedia Commons <https://commons.wikimedia.org/wiki/File:North_and_South.jpg>, identified as a first-edition Chapman and Hall title page dated 1855, from a historical archive scan and free of known copyright restrictions in the U.S. Original image: <https://upload.wikimedia.org/wikipedia/commons/a/a8/North_and_South.jpg>.
- Independently corroborating scans of both original volumes: <https://commons.wikimedia.org/wiki/File:North_and_south_(IA_northsouth01gask).pdf> and <https://commons.wikimedia.org/wiki/File:North_and_south_(IA_northsouth02gask).pdf>.
- The historical title page is a **real first-edition title page**, not an 1855 dust jacket. Do not substitute modern auction photographs or portray them as freely available illustrations.

## Fidelity, structural checks and delivery

- All **52 original sequential chapters**, including opening epigraphs, are stored in seven local data files: `public/books/north-and-south-1855-01.json` through `public/books/north-and-south-1855-07.json`.
- The 53 reader navigation sections are the website's opening title presentation followed by 52 original chapters.
- The imported edition includes approximately **180,392 whitespace-delimited words**, including the original epigraphs and opening page. Each original epigraph is marked `[[EPIGRAPH]]`, displayed with separate italic verse styling and line breaks, and stripped of that technical marker before text-to-speech playback. Attribution lines are retained with the poem.
- The first narrative paragraph begins **“‘Edith!’ said Margaret, gently, ‘Edith!’”**. The last chapter concludes with Margaret's imitation of Thornton's mother, ending **“‘That woman!’”**.
- The book page at `north-and-south.html` validates all 52 chapters, original epigraph count, minimum complete text length, and the original ending. Its existing pager processed the full text into **680 paginated reader pages** in a source-level check.
- Voice selection, pause/resume, auto-turn, saved position, bookmark, night theme, typography controls, and vintage share presentation use the shared Ophelia narration and interface components; narration is **browser/device-generated text-to-speech**, not a licensed human recording.
- `index.html` carries the plot-focused, two-sentence catalog teaser, while `catalog.html` imports it into the alphabetized catalog under **Literary Fiction** and checks the storage key `ophelia-north-and-south-gaskell-1855-v1`.
- All files and the reader's JavaScript passed GitHub source/integrity checks. The live GitHub Pages deployment, browser/device narration, and third-party image loading have **not** been independently tested.

## Approved catalog teaser

> From the green countryside of southern England to the smoky cotton mills of the North, Margaret Hale discovers a world divided by class, ambition and hardship. When she encounters the proud mill owner John Thornton, her convictions and her heart are both put to the test.

Keep this story-first prose in the catalog; leave edition details and narrator specifications in the book's own source notes.
