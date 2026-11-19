# Dangerous Liaisons / Les Liaisons dangereuses — Pierre Choderlos de Laclos (1782)

## Work, translation and copyright
- The French epistolary novel *Les Liaisons dangereuses* was first published in 1782 in four historical volumes and comprises **175 letters**.
- Ophelia's English edition uses **Ernest Dowson's 1898 translation**, printed privately in London in two volumes. Dowson died in 1900; the 1898 translation and Laclos's 1782 work are in the **U.S. public domain**.
- Source transcription, English volume I (Letters 1–90): [Project Gutenberg eBook 69891](https://www.gutenberg.org/ebooks/69891); mirror [GITenberg 69891](https://github.com/GITenberg/Les-liaisons-dangereuses-volume-1-of-2-or-letters-collected-in-a-private-society-and-publishe__69891).
- Source transcription, English volume II (Letters 91–175): [Project Gutenberg eBook 69913](https://www.gutenberg.org/ebooks/69913); mirror [GITenberg 69913](https://github.com/GITenberg/Les-liaisons-dangereuses-volume-2-of-2-or-letters-collected-in-a-private-society-and-publishe__69913).
- Original French hosted text: [Project Gutenberg eBook 52006](https://www.gutenberg.org/ebooks/52006), transcribed from the historically published **1913 French edition** (not an exact typographical facsimile of the 1782 first printing); mirror [GITenberg 52006](https://github.com/GITenberg/Les-liaisons-dangereuses-Lettres-recueillies-dans-une-Societe-et-publiees-pour-l-instruction-__52006).
- The French original, 1913 editorial material and Dowson's 1898 translation are in the U.S. public domain. The project does not use newer translations.

## Fully hosted reader structure
- English reader: `dangerous-liaisons.html`; local source `public/books/dangerous-liaisons-en-volume-1.json` (92 sections: 1898 prefatory material, Letters **1–90**, endnotes; approximately **78,623** whitespace-counted words) and `public/books/dangerous-liaisons-en-volume-2.json` (86 sections: Letters **91–175**, endnotes; approximately **72,488** words).
- French read-only reader: `les-liaisons-dangereuses-original-francais.html`; local text `public/books/dangerous-liaisons-fr-volume-1.json` (1913 prefatory material and Letters **1–90**, 91 sections, approximately **71,501** words) and `public/books/dangerous-liaisons-fr-volume-2.json` (Letters **91–175**, 85 sections, approximately **67,080** words); manifest `public/books/dangerous-liaisons-fr-manifest.json`. The French split after Letter 90 is an online navigation convenience and **is not** the historical French edition's original volume break.
- English totals: **175 consecutive letters**, approximately **151,111** words including editorial prefaces and historical footnotes. French totals: **175 consecutive letters**, approximately **138,581** words including introductory writings. These are digitized-word-token estimates, not original-edition bibliographical counts.
- Source formatting is converted to separate paragraphs and wrapped lines rejoined. Plain-text underscore italics markers are stripped; no literary paragraphs or letters are intentionally condensed or paraphrased. Project Gutenberg digital license boilerplate, transcription correction logs, French publisher's unrelated advertising catalogue and 1913 biographical-critical introductory essay are excluded from the novel reader. The original novel's historical prefatory notices and the final editor's remarks remain.
- The English device/browser narration uses `public/js/ophelia-narration.js` and the existing reader's chapter selection, saved reading place, bookmarks, voice choice, speed, and pause/resume; **no recordings or LibriVox**. The French reader is expressly **read-only** with `lang=fr`, `translate=no` and no audio.
- The shared `public/js/ophelia-share.js` registers the original French link beneath the English reader's heading. Both readers and the catalogue card are in the website's sitemap.

## Historically authentic illustration
- Cover image: actual **1782 French first-edition title page** scanned on Wikimedia Commons: [Choderlos de Laclos – Les Liaisons dangereuses, page de titre, 1782](https://commons.wikimedia.org/wiki/File:Choderlos_de_Laclos_-_Les_Liaisons_dangereuses,_page_de_titre,_1782.png), public-domain historical artifact.
- Display URL: `https://commons.wikimedia.org/wiki/Special:FilePath/Choderlos_de_Laclos_-_Les_Liaisons_dangereuses%2C_page_de_titre%2C_1782.png`.
- This historical *French* title page is visually paired with Dowson's English reader. It is never represented as the title page of the English 1898 translation.

## Verification and limitations
- The original Gutenberg headings were checked: English volume I **90 letters**, English volume II **85 letters**, French **175 letters**. Hosted sections preserve the consecutive sequence **1 through 175** in both languages.
- The reader files load text from relative local paths, without fetching a third-party archive at reading time. The catalog discovers the book through the index page's `#books > article.book` entries.
- Static structure and links should be inspected after every further migration; live device narration, voice switching, cover image delivery, and bookmark persistence require a real browser test (preferably Microsoft Edge) and are **not claimed as verified merely by the GitHub commits**.
