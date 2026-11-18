# The Brothers Karamazov — textual edition, rights, cover and reader

## Literary work and English text
- Fyodor Dostoevsky, **Братья Карамазовы** (*The Brothers Karamazov*). Serialized in *The Russian Messenger*, 1879–1880; separate book edition appeared in December 1880 with title pages dated 1881. Four parts, twelve books, and an epilogue.
- Translation: **Constance Garnett**, first English-language edition published by William Heinemann, London, in **1912**. The Russian work and Garnett's 1912 English translation are public domain in the United States.
- Digitized English text: [Project Gutenberg #28054](https://www.gutenberg.org/ebooks/28054), also [GITenberg/The-Brothers-Karamazov_28054/28054-0.txt](https://github.com/GITenberg/The-Brothers-Karamazov_28054/blob/master/28054-0.txt). Gutenberg text's transcription presents *The Lowell Press, New York* as the title-page publisher; it is not represented as a first-edition facsimile. Original Gutenberg 2009 transcription credited David Edwards, David King, and the Online Distributed Proofreading Team (as in its Project Gutenberg footer).
- Local text: `public/books/the-brothers-karamazov-garnett-1912.txt`, approximately 1.94 million Unicode characters and 350,762 whitespace-delimited words. Project Gutenberg distribution and licensing footer removed for a clean continuous reading view; source attribution preserved here and on the reader.
- Complete contents preserved: title, translator credit, original table of contents, four parts, **12 books**, **96 narrated chapters** (the 93 chapters of Books I–XII plus three epilogue chapters), concluding `THE END`, and nine translator's footnotes.
- Expected chapters per numbered book: 5, 8, 11, 7, 7, 3, 4, 8, 9, 7, 10, 14. Epilogue: 3. Chapter numbering restarts at the beginning of every book and epilogue, as in the Garnett text. Reader startup validates all original sections and the last footnote.

## Original-language companion
- [Russian Wikisource, **Братья Карамазовы**](https://ru.wikisource.org/wiki/Братья_Карамазовы_(Достоевский)) — complete public-domain original in Russian. The English reading page links directly to it as a **read-only external resource**, without adding Russian text to the English audiobook or generating Russian spoken audio. Keep this language distinction throughout the library.

## Historical period art
- [Wikimedia Commons: *The Brothers Karamazov first edition cover page.JPG*](https://commons.wikimedia.org/wiki/File:The_Brothers_Karamazov_first_edition_cover_page.JPG), an **authentic first-edition Russian title page**, specifically **volume II (Parts III–IV and Epilogue)** of the book edition dated 1881, printed by the Panteleyev brothers in Saint Petersburg. It is a historical title page, **not** an English 1912 dust jacket or fictional painted cover. The cover image was sourced from an eBay archival photograph by Sigedon Ars Memoriae and marked public domain as a faithful reproduction of historic two-dimensional artwork. The historical title page was chosen rather than a later copyrighted illustration.
- Reader and homepage use the verified Commons Special:FilePath address; reader has neutral local fallback should the remote image fail. Historical image is credited where it is displayed.

## Integration
- Reader: `the-brothers-karamazov.html`. English read-aloud with existing `public/js/ophelia-narration.js`, selectable device voices, user bookmarks, saved progress and speed, auto-turn, chapter navigation, sharing, and responsive typography. Title and original twelve-book hierarchy appear in navigation and the spoken chapter lead-in.
- Catalog: `index.html` contains the card discovered by `catalog.html`; catalog map categorizes it as Russian Literature, with matching localStorage progress key.
- The reader's chapter/parser/pagination logic was independently exercised on the entire text: **98 sections including title and footnotes; 1,353 paginated reading pages**. This static check does not guarantee browser audio voice availability or completed GitHub Pages deployment; both require live verification.
