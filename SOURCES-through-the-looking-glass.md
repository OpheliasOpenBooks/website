# Through the Looking-Glass, and What Alice Found There — Editorial Sources

**Title:** Lewis Carroll (Charles Lutwidge Dodgson), *Through the Looking-Glass, and What Alice Found There*.

## First-edition history and public-domain status
- Actually issued in **December 1871**, printed with a **1872** Macmillan and Co. London title page (first-edition bibliographical quirk). Confirmed by the [Morgan Library & Museum's copy](https://www.themorgan.org/printed-books/78133), by [Christie's first-edition dating](https://www.christies.com/en/lot/lot-4239430), and [Alice-in-Wonderland.net historical overview](https://www.alice-in-wonderland.net/resources/background/through-the-looking-glass/).
- Original work, both opening and closing verses, chess game and 1871–72 illustrations by Sir John Tenniel are **public domain** in the United States; all first published before 1931.

## Text
- Main public-domain text: [Project Gutenberg ebook 12](https://www.gutenberg.org/ebooks/12); GITenberg mirror [12-0.txt](https://github.com/GITenberg/Through-the-Looking-Glass_12/blob/master/12-0.txt). Original twelve narrative chapters, including *Jabberwocky*, *The Walrus and the Carpenter*, the White Knight's song and the concluding acrostic *A boat beneath a sunny sky*. The Gutenberg text is a modern electronic transcription ('Millennium Fulcrum Edition 1.7'), not a literal photographic transcription of the first issue. Its modern PG license and header were removed from our public-domain excerpt; the literary text retained.
- **Restored** the six-stanza dedicatory verse opening *Child of the pure unclouded brow*, and the first-edition *Dramatis Personæ* and chess moves, absent from the 12-0.txt transcription, from the [Wikisource validated 1872 first-edition transcription](https://en.wikisource.org/wiki/Through_the_Looking-Glass) and its [preface](https://en.wikisource.org/wiki/Through_the_Looking-Glass,_and_What_Alice_Found_There/Preface). This means the current text preserves the original literary contents while using PG's modernized typography. The original printed chess diagram is **not** reconstructed here, and neither the text nor cover should be described as an exact facsimile of first issue. No unauthorized modern translation is used; the book's original language is English.
- Local book: `public/books/through-the-looking-glass-carroll-1871.txt`, approximately 165,198 characters, 29,813 whitespace-delimited words. Navigable reader parts: title, chess preliminaries, prefatory verse, contents, **12 chapters** = 16 sections. Original ending included. English browser-based TTS, shared normalization, bookmarks, saved reading progress, page and chapter navigation, speed, voice, night mode and share control.

## Historical book cover and illustrations
- Historical **1871/1872 first-edition design** confirmed as publisher's red cloth with **triple gilt borders and gilt Red Queen or White Queen vignette**, described by the [Morgan Library](https://www.themorgan.org/printed-books/78133), [Christie's](https://www.christies.com/en/lot/lot-4239430), and [Princeton's Lewis Carroll bibliography](https://static-prod.lib.princeton.edu/scsites/parrish/9-Dodgson.pdf). Our `public/art/through-the-looking-glass-cover.svg` is an **original, newly drawn historically inspired reconstruction**, *not* an archival photograph or exact facsimile; it uses gilt borders, red cloth and a Queen medallion, with more overt titling for legibility in an online catalog.
- John Tenniel's genuine **original period illustrations**, sourced from [Wikimedia Commons collection](https://commons.wikimedia.org/wiki/Category:John_Tenniel%27s_illustrations_of_Through_the_Looking-Glass_and_What_Alice_Found_There); the reader uses their `Special:FilePath` links at the beginnings of selected chapters, no bulk-loading, to minimize reader delays. Sourced assets (chapter numbers correspond to chapter first-page placement):
  1. `Alice and kitten.jpg`
  2. `Tiger-lily.jpg`
  3. `Bread and butterfly.jpg`
  4. `Alice Tweedledum.jpg`
  5. `John Tenniel Alice and the Knitting Sheep.jpeg`
  6. `Alice Humpty Dumpty.jpg`
  7. `Lion and Unicorn.jpg`
  8. `White Knight.jpg`
  9. `Alice crown.jpg`
  10–11. no image; the extremely brief chapters have no matching illustration added just for decoration.
  12. `Black kitten.jpg`
- Note: individual Wikimedia images are hosted remotely; if Wikimedia blocks them, the text and narration continue working and the picture hides. A future local mirror can make the pictures fully resilient to external outages.
- Chapter illustrations appear only at the chapter start; they **must not foreshadow events**, or be misidentified as scenes from another work. The previewed cover is first-edition-*inspired*, never represented as an actual original object.

## Deployment and verification
- Add a catalog card under `#books` of `index.html` linking to `through-the-looking-glass.html`; categorize as fantasy in `catalog.html`; GitHub auto-generates the sitemap. Maintain references to the existing first-book reader `reader.html`.
- Static tests: the text must have all 12 chapter headers in order, the first and last poems, the chess material, and end of the last chapter. Parser must produce 16 reading sections. Actual browser TTS/image rendering depends on visitors' device and must be checked separately.
