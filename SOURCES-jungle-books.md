# Rudyard Kipling — The Jungle Books: complete editions and historical artwork

## Scope
Ophelia's Open Book hosts **both original published books**, not a shortened children's adaptation or an anthology of Mowgli stories:

1. **The Jungle Book** (1894), all **7 stories + 7 accompanying poems**.
   - Public reader: `the-jungle-book.html`
   - Full local text: `public/books/the-jungle-book-1894.json`
   - Text: [Project Gutenberg eBook 236](https://www.gutenberg.org/ebooks/236); [plain text mirrored by GITenberg](https://github.com/GITenberg/The-Jungle-Book_236/blob/master/236-0.txt)
2. **The Second Jungle Book** (1895), all **8 stories + 8 accompanying poems**.
   - Public reader: `the-second-jungle-book.html`
   - Full local text: `public/books/the-second-jungle-book-1895.json`
   - Text: [Project Gutenberg eBook 1937](https://www.gutenberg.org/ebooks/1937); [plain text mirrored by GITenberg](https://github.com/GITenberg/The-Second-Jungle-Book_1937/blob/master/1937-0.txt)

Both were published in the 1890s and are **public domain in the United States**. Copyright status elsewhere varies by jurisdiction. Text is historic and unabridged; old-fashioned wording and period views have not been modernized or expurgated.

## Contents audit

### The Jungle Book (1894)
Seven prose stories, each followed by its original companion poem:
1. Mowgli’s Brothers — Hunting-Song of the Seeonee Pack
2. Kaa’s Hunting — Road-Song of the Bandar-Log
3. “Tiger! Tiger!” — Mowgli’s Song
4. The White Seal — Lukannon
5. “Rikki-Tikki-Tavi” — Darzee’s Chant
6. Toomai of the Elephants — Shiv and the Grasshopper
7. Her Majesty’s Servants — Parade Song of the Camp Animals

The story name **Her Majesty’s Servants** is used by the Project Gutenberg American-publication transcription; some British original tables of contents list this as **Servants of the Queen**. Both refer to Kipling's same seventh story.

Full prose and poetry approximately **50,747 words** in the local text. The complete reader paginates to **188 pages** under the original 330-word pagination rule.

### The Second Jungle Book (1895)
Eight prose stories, each followed by its original companion poem:
1. How Fear Came — The Law of the Jungle
2. The Miracle of Purun Bhagat — A Song of Kabir
3. Letting in the Jungle — Mowgli’s Song against People
4. The Undertakers — A Ripple Song
5. The King’s Ankus — The Song of the Little Hunter
6. Quiquern — ‘Angutivaun Taina’
7. Red Dog — Chil’s Song
8. The Spring Running — The Outsong

Full prose and poetry approximately **63,624 words** in the local text. The complete reader paginates to **241 pages**. As the bibliography of the book notes, some historical printings omitted a portion of the intended ending of *The King's Ankus*; our selected complete Project Gutenberg source includes the story's full ending and the entire eighth tale and concluding Outsong.

### Preservation rules
- The Project Gutenberg production/rights boilerplate, table-of-contents duplicate headings and trailing `End of Project Gutenberg...` markers are omitted from the literary text; original story and poetry paragraphs and verse stanzas are retained.
- The *opening verses of each story* are preserved, not merely the separate ending songs.
- Poetic line breaks are kept in the local JSON as embedded line breaks (the CSS renders these with `white-space:pre-line`), and no poems are truncated, paraphrased or substituted.
- Poetry is included in the text-to-speech sequence, and separate verse headings appear in navigation.
- The website validates count, order, prose/poem structure and minimum unabridged total word count before enabling audio.

## Authentic historical covers

**The Jungle Book (1894):** authentic original blue-cloth Macmillan cover with decorative gold elephants, motifs designed by **John Lockwood Kipling** (1837–1911), who also supplied original illustrations:
- [Wikimedia Commons File:JunglebookCover.jpg](https://commons.wikimedia.org/wiki/File:JunglebookCover.jpg) (455 × 597 px; verified Commons public-domain designation).
- Direct file via Wikimedia Special:FilePath.
- The distinct first **American** edition by Century Company features a green cover. Ophelia displays the London Macmillan cover instead, with correct attribution.

**The Second Jungle Book (1895):** authentic original blue-cloth Macmillan cover with gold coiled white cobra and ankus, based on illustrations by **John Lockwood Kipling**:
- [Wikimedia Commons File:SecondJungleBookCover1895.jpg](https://commons.wikimedia.org/wiki/File:SecondJungleBookCover1895.jpg) (500 × 668 px; verified Commons public-domain designation).
- Direct file via Wikimedia Special:FilePath.

Illustrations are original historic public-domain artwork, not AI-generated recreations. The files are not copied or retouched in the repository; they are displayed as intact remote images. The cover previews are displayed *contained*, without cropping.

## Reader / site implementation
- Both HTML readers reuse the site’s established narration, speech normalization, pause/resume, voice selection, speed adjustment, optional automatic page turns, saved page position, bookmark, text size, evening theme, and literary share control.
- Direct companion-volume cross-links allow readers to move between books. Each volume has a separate localStorage key so progress is not shared by mistake.
- `index.html` displays both book cards and local saved-progress controls. `catalog.html` assigns both to **Children’s Classics**; the catalog picks up the two new book cards.
- At time of creation, the bookshelf contained 41 works, so adding these two should display **43** works.

## Mechanical checks performed
- Verified all **14** first-volume and **16** second-volume original sections including end poems; exactly 7/8 story sections and matching poem counts, and all sections in original order.
- Verified none of the final Project Gutenberg marker text appears inside the local JSON.
- Evaluated each reader’s `parseText` + `paginate` functions against the complete committed local JSON, yielding 188 / 241 pages with intact final verses.
- Checked JS syntax and shared narration/share scripts in the finished HTML.
- **Not yet manually auditioned in a live browser**, so the reader's voice performance, bookmarking and image loading should still be tested by the site owner.
