# Vathek / Vathek — William Beckford (1786–1787)

## Publication and public-domain status
- Beckford wrote *Vathek* in French around 1782. Samuel Henley translated it into English; Henley's English translation was first published in **1786**, before the original French publication (the Lausanne edition is dated **1787**). Do not imply that the first English book is Beckford's original manuscript language.
- This website hosts two historical **public-domain** versions: an English edition of **1849** and Beckford's French text from a publication of **1834**. The original French was published in 1786/1787, but this particular digitized source is **not** an exact scan of that first original edition.
- The site uses one complete tale, not later separately published "Episodes of Vathek" that the 1834 French author's note mentions as additional forthcoming stories. Those episodes are not represented as part of this original complete tale.

## Complete English — browser narrated
- Source: [Project Gutenberg ebook 42401](https://www.gutenberg.org/ebooks/42401) transcribing *Vathek; An Arabian Tale* (London: George Slater, 1849), including the **biographical memoir by William North**, Henley's English translator's preface, complete continuous narrative, and contemporary historical notes.
- Repository source: `GITenberg/VathekAn-Arabian-Tale_42401`, text file `42401-0.txt`.
- Narrative from the second standalone "VATHEK." heading to the "NOTES." section; notes retained after the complete story. Gutenberg distribution headers and license not included.
- Three **editorial reading parts**, not historical book chapters: `public/books/vathek-en-part-1.json`, `-2.json`, `-3.json`. Each has one contiguous section of the unabridged narrative. Part I also preserves the memoir and preface; Part III preserves the notes.
- Word counts (space delimited): Part I **13,076**, Part II **13,134**, Part III **13,436** — total **39,646**.
- English reader: `vathek.html` with locally hosted texts, browser/device narration via `public/js/ophelia-narration.js`, reading/pause/resume, voice choice, settings, bookmarks and part navigation.

## Original French — fully hosted, read-only
- Source: [Project Gutenberg ebook 57832](https://www.gutenberg.org/ebooks/57832), transcribed from *Vathek. Nouvelle édition* (London: Richard Bentley, **1834**), including **William Beckford's author's note** and the French historical notes.
- Repository source: `GITenberg/Vathek_57832`, file `57832-8.txt` (legacy ISO-8859-1 encoded ebook, decoded to Unicode as returned by Github).
- Three editorial reading parts: `public/books/vathek-fr-part-1.json`, `-2.json`, `-3.json`; full narrative preserved in source order. Part I includes the author's note; Part III includes historical notes and *FIN*.
- Words: Part I **8,531**, Part II **12,405**, Part III **13,604** — total **34,540**.
- A manifest `public/books/vathek-fr-manifest.json` verifies part files, section counts and exact word counts.
- French reader: `vathek-original-francais.html`; marked with `lang="fr"` and `translate="no"`; no narrator controls or audio. Bookmarks, text resizing, dark mode, and sequential part navigation remain available.

## Book cover and website discoverability
- `public/art/vathek-historical-cover.svg` is an **original period-inspired cover illustration**, designed with eighteenth-century engraved typography and burgundy gilding. It should never be described as a photograph or facsimile of the genuine 1786 book.
- `index.html` contains a character-and-story-focused synopsis and links to both languages.
- `catalog.html` classifies the English work as Gothic Romance & Eighteenth-Century Fiction.
- `public/js/ophelia-share.js` provides the standard original-language link in the English reader's language companion panel.
- Both pages are included in `sitemap.xml` once each, and the original French is marked as an intentionally non-audio reader in `scripts/audit-reader-format.mjs`.
- Source background: [Christie's on the 1787 first French edition](https://www.christies.com/en/lot/lot-2034229) and [Standard Ebooks' Samuel Henley translation](https://standardebooks.org/ebooks/william-beckford/vathek/samuel-henley).
- Pages and JSON can be checked from repository source; browser/device voice output must still be listened to on the published site.
