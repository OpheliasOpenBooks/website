# Source record — Middlemarch: A Study of Provincial Life (1871–1872), George Eliot

## Author, publication, rights
- George Eliot (Mary Ann Evans, 1819–1880), *Middlemarch: A Study of Provincial Life*, was originally published by William Blackwood & Sons in eight separately issued books, starting December 1871 and finishing December 1872.
- The full original work is in the U.S. public domain. It appeared long before 1931 and its author died in 1880.
- Original edition documentation: Christie's catalogue https://www.christies.com/en/lot/lot-6332165 and Project Gutenberg eBook 145 https://www.gutenberg.org/ebooks/145.

## Complete text and structure
- The source for Ophelia's reading edition is the carefully proofread Standard Ebooks public-domain transcription: https://github.com/standardebooks/george-eliot_middlemarch.
- The text is not claimed to be a photographic facsimile of the first printing. It is a clean, corrected, electronic presentation preserving the original structure and complete prose.
- Book I, Miss Brooke: chapters 1–12 (12 chapters). Book II, Old and Young: chapters 13–22 (10). Book III, Waiting for Death: chapters 23–33 (11).
- Book IV, Three Love Problems: chapters 34–42 (9). Book V, The Dead Hand: chapters 43–53 (11). Book VI, The Widow and the Wife: chapters 54–62 (9).
- Book VII, Two Temptations: chapters 63–71 (9). Book VIII, Sunset and Sunrise: chapters 72–86 (15).
- Included in full: the dedication to George Henry Lewes, the Prelude, **all 86 chapters**, each of the **86 chapter epigraphs** (including the names of dialogue speakers in dramatic epigraphs), and the original Finale.
- The nine consecutive local text files are `public/books/middlemarch-eliot-1871-72-01.json` through `public/books/middlemarch-eliot-1871-72-09.json`.
- The original Prelude opens with: 'Who that cares much to know the history of man, and how the mysterious mixture behaves under the varying experiments of Time'.
- The first chapter opens 'Miss Brooke had that kind of beauty which seems to be thrown into relief by poor dress.'
- The final sentence of the novel's Finale closes with 'and rest in unvisited tombs.'
- Approximately 315,800 whitespace-separated words in this locally prepared edition, including all epigraphs, heading materials, dedication, Prelude and Finale. It paginates into **1,205** sequential reading pages in the current reader.

## Historical artwork
- The catalog card and opening reader image show the authentic **1871 first-edition volume I title page**, William Blackwood & Sons, not an invented picture or a modern reprint cover. It is explicitly identified as a **title page** rather than falsely described as the original publisher's illustrated wrappers.
- Public-domain scan: https://commons.wikimedia.org/wiki/File:Middlemarch_1.jpg . Date: 1871, first-edition volume I title page. Original verified Wikimedia image: https://upload.wikimedia.org/wikipedia/commons/2/25/Middlemarch_1.jpg .
- The original 1871–1872 edition appeared in eight green illustrated paper wrappers; the original wrappers can be viewed in auction archives (Bonhams, Christie's) and the New York Public Library's Middlemarch collection. The present on-site image is a public-domain first-edition title page instead.

## Reader features and testing limits
- `middlemarch.html` retains Ophelia's shared narrated reader (`public/js/ophelia-narration.js`), adjustable voice and speed, speech pause/resume, automatic page turning, typography, bookmarks, saved position, evening theme, and literary share control (`public/js/ophelia-share.js`).
- Book division headings and original chapter epigraphs are preserved in the reading display; paragraph narration strips presentational markers and introduces books/chapters naturally.
- `index.html` displays a story-focused library description and historically accurate image. `catalog.html` imports the card and assigns `Literary Fiction` and the saved-reading key `ophelia-middlemarch-eliot-1871-72-v1`.
- Code-level checks verified all 89 reading sections (front matter, Prelude, 86 chapters, Finale), no missing chapter numbers, all eight original books, all 86 epigraphs, and programmatic pagination.
- Live deployment, browser-specific audio voice pronunciation and remote image loading have not been independently tested, and no claim is made that a particular spoken voice sounds perfect.