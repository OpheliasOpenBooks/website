# Sources — *The Age of Innocence* (1920), Edith Wharton

## The work and original edition
- **Work:** Edith Wharton (1862–1937), *The Age of Innocence*, first serialized in *Pictorial Review* (July–October 1920) and then published as a book by **D. Appleton and Company**, New York and London, in **October 1920**.
- The text is in the **U.S. public domain**. Primary independent confirmation: Project Gutenberg eBook **541**, <https://www.gutenberg.org/ebooks/541>, showing “Copyright: Public domain in the USA.”
- Modern clean transcription source: Standard Ebooks, <https://standardebooks.org/ebooks/edith-wharton/the-age-of-innocence>, with complete source files at <https://github.com/standardebooks/edith-wharton_the-age-of-innocence> (`src/epub/text/chapter-1.xhtml` through `chapter-34.xhtml` and part headers). Standard Ebooks adapted Project Gutenberg’s transcription. This is a modern typeset digital transcription of the 1920 novel, **not a facsimile**; some editorial typography may differ from an original 1920 first printing.
- Independent period-bibliography record: Morgan Library & Museum <https://www.themorgan.org/printed-books/99737>, identifying the first 1920 Appleton edition (red cloth, black stamped lettering, published 15 October 1920). First printing was issued with different states of an original pictorial dust jacket.
- Wharton was awarded the Pulitzer Prize for the Novel in **1921**, becoming the first woman to receive the prize; see Christie's historical auction catalog <https://onlineonly.christies.com/s/exceptional-literature-collection-theodore-b-baum-part-two/age-innocence-dust-jacket-397/126708>.

## Authentic historical artwork
- The site uses a **public-domain scan of the original American 1920 first-edition dust-jacket design**, with handwritten-style lettering and a small figure of a woman in a rose-colored dress, rather than a new digital illustration.
- Wikimedia Commons source and historical copyright/license details: <https://commons.wikimedia.org/wiki/File:Age_of_Innocence_(1st_ed_dust_jacket).jpg>.
- Direct original file: <https://upload.wikimedia.org/wikipedia/commons/b/b0/Age_of_Innocence_%281st_ed_dust_jacket%29.jpg> (242 × 366 pixels; a small original historic scan). Do **not** stretch the picture beyond its intrinsic resolution; the reading page limits its visual height and uses object-fit contain.
- Bibliographic corroboration of dust-jacket issue: <https://www.christies.com/en/lot/lot-3918811>, and <https://www.pprize.com/BookDetail.php/The-Age-Innocence>. The scanned file is labeled first-edition jacket, but it is not independently possible from this scan to establish whether a particular physical copy was the first or a later state of the jacket.
- Another public-domain scan is available of a red cloth hardcover: <https://commons.wikimedia.org/wiki/File:Age.Of.Innocence.1920.Cover.jpg>; this is **not** our primary historic dust jacket. Its visible Grosset & Dunlap spine should not be confused with Appleton's first edition.

## Complete story inventory
- **Book I:** original continuous chapters **I–XVIII** (local chapters 1–18).
- **Book II:** original continuous chapters **XIX–XXXIV** (local chapters 19–34).
- The reader has **35 navigation sections** (one site title/edition page plus 34 original novel chapters). The original Book I and Book II division is displayed in the correct position, using the `[[BOOK]]` internal display marker at chapters 1 and 19.
- Original first line of story: “On a January evening of the early seventies, Christine Nilsson was singing in Faust at the Academy of Music in New York.”
- Original ending: “At that, as if it had been the signal he waited for, Newland Archer got up slowly and walked back alone to his hotel.”
- Six complete local JSON files: `public/books/the-age-of-innocence-1920-01.json` through `public/books/the-age-of-innocence-1920-06.json`. They have **34 sequential chapters**, the proper original book division, and about **101,200 whitespace-delimited words**. All original prose is present; do not replace or summarize any section.

## The reader and catalog
- `the-age-of-innocence.html` renders the complete novel, original book headings, inline italics, and the source notes; reuses `public/js/ophelia-narration.js` for browser/device-generated speech with voice selection, pause/resume, speed, automatic page turning, bookmarks and saved progress.
- Library card in `index.html` is imported and sorted alphabetically by `catalog.html`, categorized as **Literary Fiction**, with the saved reading position under `ophelia-the-age-of-innocence-wharton-1920-v1`.
- The literary blurb (not technical copy) is:

> In the glittering drawing rooms of 1870s New York, Newland Archer is promised a comfortable future with May Welland. But the arrival of the independent Countess Ellen Olenska unsettles his orderly world, setting duty against desire in a society where appearances are everything.

- The page checks all 34 sections, both original book headings, minimum text length, and the original ending. Static validation of the reader parser and paginator successfully built **371 reading pages**, and the JavaScript passed syntax checks.
- **Caveat:** Source-level checks do not establish that live GitHub Pages is fully propagated, every device voice plays correctly, or remote Wikimedia artwork loads reliably across browsers; those require an independent live browser/audio test.

This book follows the existing Ophelia’s Open Book policy to publish only complete U.S.-public-domain works with genuine historical artwork, original prose preserved, and warm plot-focused catalog descriptions.
