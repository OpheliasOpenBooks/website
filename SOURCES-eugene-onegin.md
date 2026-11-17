# Eugene Onegin — editorial and source record

## English read-and-listen edition
- Work: Alexander Pushkin, *Eugene Onegin* (*Евгений Онегин*), a complete eight-canto novel in verse, published serially 1825–1832 and in one volume 1833.
- English text: Henry Spalding, *Eugene Onéguine: A Romance of Russian Life in Verse* (London: Macmillan and Co., 1881), United States public domain. The original edition of the translation uses the historical spelling "Oneguine".
- Source: Project Gutenberg ebook 23997, https://www.gutenberg.org/ebooks/23997 ; archived from the GITenberg repository `GITenberg/Eugene-Oneguine--Onegin---13-A-Romance-of-Russian-Life-in-Verse_23997`, file `23997.txt`.
- Locally stored edition: `public/books/eugene-onegin-1881-spalding.json`.
- Editorial structure: translator's preface and original preliminary material followed by all **eight** cantos. Translator's notes embedded within the original cantos are preserved. Poetic line breaks are retained as explicit newline characters.
- The local JSON was checked for nine nonempty sections, eight correctly ordered cantos, about 38,973 words, and approximately 136 pages in the site's reader pagination. The checks are structural and not a substitute for listening to the complete novel.

## Original Russian (read only)
- Original-language text: `public/books/evgeny-onegin-original-russian.json`.
- Raw source: `makiwara/onegin-verses`, file `evgeny.txt`, at https://github.com/makiwara/onegin-verses/blob/master/evgeny.txt . Only Pushkin's original Russian text was used; **not** the separately hosted modern translation by James E. Falen.
- Eight Russian chapter headings in order plus original opening dedication/epigraph. Approximately 23,837 words, 93 site reader pages, with verse line breaks intact. This transcription does not include all scholarly editorial notes and should not be misrepresented as a critical apparatus or photofacsimile.
- For additional Russian edition comparison and historical publication links: https://ru.wikisource.org/wiki/Евгений_Онегин_(Пушкин).
- Russian reader: `evgeny-onegin-original-russian.html`, text-only without text-to-speech in accordance with library's original-language policy.

## Presentation and catalog
- English reader: `eugene-onegin.html`, using the shared Ophelia narration engine, chapter/stanza navigation, bookmarking, saved place, text-size adjustment, dark mode and literary sharing.
- Cover: `public/art/eugene-onegin-1881-inspired-cover.svg`. This is **newly drawn original SVG art**, inspired by surviving green cloth-and-gold bindings of the 1881 first English edition, **not** a scan or historical facsimile.
- The single English book card is in `index.html`, automatically indexed by `catalog.html` and also accessible from the installable app. The Russian version has no separate catalog card; each edition links to the other.
- No outside audio, LibriVox recording, or modern copyrighted translation was copied.
- The source files and reading HTML were verified in GitHub and chapter/pagination data checked. **Live browser loading, voice playback and installed-app behavior have not been independently tested.**
