# The Confessions / Les Confessions — Jean-Jacques Rousseau (1782–1789)

## Historical work and publishing context
- Rousseau's posthumously published autobiography appeared in two instalments: Books I–VI in 1782 and Books VII–XII in 1789. It comprises **twelve books**, not the Christian autobiography of St. Augustine sharing the English title *Confessions*.
- Both Rousseau's original eighteenth-century French text and the pre-1927 English edition chosen for this website are in the U.S. public domain.

## English — complete, locally hosted, read aloud
- Source: *The Confessions of Jean Jacques Rousseau*, privately printed for Members of the Aldus Society, London, **1903**; the Project Gutenberg transcription does not credit a named translator. It must not be attributed to an invented translator.
- Project Gutenberg complete collection: https://www.gutenberg.org/ebooks/3913
- Per-book source ebooks: https://www.gutenberg.org/ebooks/3901 through https://www.gutenberg.org/ebooks/3912. Corresponding source repositories: `GITenberg/The-Confessions-of-Jean-Jacques-Rousseau---Volume-01_3901` through `GITenberg/The-Confessions-of-Jean-Jacques-Rousseau---Volume-12_3912`, source files `3901.txt`–`3912.txt`.
- Ophelia uses these **individual** book texts and preserves the contemporary S. W. Orson introduction in Part I. Gutenberg headers/footers and Gutenberg distribution boilerplate are excluded.
- Four parts, three books each: `public/books/rousseau-confessions-en-part-{1,2,3,4}.json`.
  - Part I, Books I–III plus introduction: **50,924** whitespace words.
  - Part II, Books IV–VI: **57,170**.
  - Part III, Books VII–IX: **93,263**.
  - Part IV, Books X–XII: **72,333**.
  - **273,690 words total** including the historical introduction.
- English page: `rousseau-confessions.html`. Supports browser/device narration, navigation, auto-turn, local bookmarks and voice choice. The text is hosted in this repository and is not embedded or loaded from Gutenberg at run time.

## Original French — complete, locally hosted and read-only
- Source: **RousseauOnline**, https://www.rousseauonline.ch/about.php, using the French **Du Peyrou–Moultou** historical collection of Rousseau's works published in Geneva **1782–1789**; source acknowledged as requested by the archive.
- Digital source pages:
  - https://www.rousseauonline.ch/Text/volume-10-les-confessions-les-reveries-du-promeneur-solitaire.php
  - https://www.rousseauonline.ch/Text/volume-16-second-supplement-a-la-collection-des-oeuvres-de-jj-rousseau-tome-premier.php
  - https://www.rousseauonline.ch/Text/Section0172.php
- French Books I–VI come from the first source. Books VII–XI come from the second, **with the continuation of Book XI** added from the third; Book XII likewise comes from the third. These changes were made to avoid silently omitting pages at bound volume transitions.
- French data generated with `scripts/build-rousseau-confessions-fr.py` and `.github/workflows/build-rousseau-confessions-fr.yml`; the script validates each book is substantial, checks first and final material, and writes four book groups plus a manifest.
- Hosted files: `public/books/rousseau-confessions-fr-part-{1,2,3,4}.json` and `public/books/rousseau-confessions-fr-manifest.json`.
  - Part I, Books I–III: **48,327** whitespace words.
  - Part II, Books IV–VI: **55,497**.
  - Part III, Books VII–IX: **84,335**.
  - Part IV, Books X–XII: **66,105**.
  - **254,264 French words total**.
- French page: `les-confessions-rousseau-original-francais.html`; `lang=fr`, `translate=no`; read only, **no voice or audio**, with part/book navigation, optional night mode, font size adjustments, saved reading place and bookmark.
- Historical French transcription retains archaic spelling and page/volume header artefacts; it is **not** a scan or typographic facsimile of a particular surviving 1782 book.

## Cover, catalog, discovery, accessibility
- Cover `public/art/rousseau-confessions-historical-cover.svg` is a **new, historically inspired** eighteenth-century-style leather and gilding illustration. It is explicitly NOT described as an original 1782 first-edition cover image.
- The library card in `index.html` gives a brief, warm summary of Rousseau's life-writing; `catalog.html` has the literary genre.
- The shared `public/js/ophelia-share.js` adds the read-only French companion link at the top of the English book reader, maintaining Ophelia's convention that foreign-language originals are not voiced.
- Both reader pages are included in `sitemap.xml`. The read-only page is listed as an intentional exception in `scripts/audit-reader-format.mjs`.
- Important testing distinction: The local JSON data and embedded browser scripts can be validated from the repository, but actual voices need an in-browser listening test, since the spoken voice depends on the listener's device.
