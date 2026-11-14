# Sources — *The Moonstone* (1868), Wilkie Collins

## Original work and source edition

- **Work:** Wilkie Collins, *The Moonstone: A Romance* (1868). Originally serialized in *All the Year Round* (UK) and *Harper's Weekly* (US); first London book edition published in three volumes by **Tinsley Brothers, London, 1868**.
- **Primary text:** Standard Ebooks public-domain transcription, at <https://standardebooks.org/ebooks/wilkie-collins/the-moonstone>; source files from <https://github.com/standardebooks/wilkie-collins_the-moonstone>. The Standard Ebooks presentation preserves original prose and the multivoice structure.
- **Independent public-domain verification and complete transcript:** Project Gutenberg eBook 155, <https://www.gutenberg.org/ebooks/155>, which identifies the work as in the U.S. public domain. Gutenberg's edition, credited to John Hamm and David Widger, also provides an independent section inventory.
- **Original British 1868 first-edition image:** title page from volume I, public-domain scan at <https://commons.wikimedia.org/wiki/File:The_Moonstone_1st_ed.jpg> (Internet Archive source `moonstoneromance01coll`). Direct asset: <https://upload.wikimedia.org/wikipedia/commons/2/26/The_Moonstone_1st_ed.jpg>. **This is a title page, not an illustrated book-cover dust jacket.** The original Tinsley Brothers three-volume issue had nineteenth-century binding, and this title page accurately represents the edition.
- **Original period illustration:** William Jewett, *“There she was, all alone, looking out on the quicksand and the sea”*, 11 January **1868**, *Harper's Weekly*, <https://victorianweb.org/art/illustration/jewett/5.html>, image <https://victorianweb.org/art/illustration/jewett/5.jpg>. Do not misrepresent it as an illustration printed in the original London three-volume edition.
- 1868 illustration bibliography and source details: <https://victorianweb.org/art/illustration/jewett/bibliography.html>. The first U.S. Harper's book issue retained the original contemporary wood engravings.
- **Public domain:** Collins died in 1889, and the novel was first published in 1868. The novel and the 1868 scans and wood engravings are public domain in the United States. Third-party photographs of modern physical copies may have their own rights; our cover asset is an original historical scan rather than a modern product photograph.

## Text and narrative inventory

This edition reproduces the story in sequence, preserving its structure rather than conflating narrators:

- **Front matter:** title and author identification (website presentation).
- **Prologue:** *The Storming of Seringapatam (1799)* — four original Roman-numbered subsections.
- **First Period:** *The Loss of the Diamond (1848)* — 23 chapters, in Gabriel Betteredge's narrative.
- **Second Period:** *The Discovery of the Truth (1848–1849)* — eight separately attributed narratives:
  1. First Narrative (Miss Clack): 8 chapters
  2. Second Narrative (Mr. Bruff): 3 chapters
  3. Third Narrative (Franklin Blake): 10 chapters
  4. Fourth Narrative (Ezra Jennings's journal): 1 continuous narrative
  5. Fifth Narrative: 1 continuous narrative
  6. Sixth Narrative (Sergeant Cuff): 1 narrative with five letter subsections, displayed as separate original Roman numeral headings
  7. Seventh Narrative: 1 continuous narrative
  8. Eighth Narrative (Gabriel Betteredge): 1 continuous narrative
- **Epilogue:** *The Finding of the Diamond* — three original statements.
- **Endnotes:** all four notes included at the end. Endnote references in prose are retained as text but have not been manually hyperlinked to the endnotes.

The reader's 58 navigation entries represent the front presentation, four prologue subsections, 23 First Period chapters, 26 Second Period narrative units, three epilogue statements, and one consolidated notes section. This is **not** a claim that Collins originally divided his novel into 58 numbered chapters.

## Technical implementation

- Eight local source data parts, each consecutively named `public/books/the-moonstone-1868-01.json` through `public/books/the-moonstone-1868-08.json`.
- The transcript preserves about **194,600 words**, without rewriting the narrative itself. Inline italics are represented by underscore markers while imported; block quotations, bridgehead descriptions, and internal Roman-numeral headings have separate display markers `[[QUOTE]]`, `[[NOTE]]`, and `[[HEADING]]`, removed from displayed/speech text.
- The reader `the-moonstone.html` uses `public/js/ophelia-narration.js`, speech synthesis from the visitor's browser/device, voice selection, adjustable speed and type size, automatic page turning, saved position, and bookmark/share controls.
- Reader validates presence of all sections and the original ending, including the line **“What will be the next adventures of the Moonstone? Who can tell?”**, and all four notes. It refuses to load a truncated dataset.
- `index.html` supplies the public bookshelf card. `catalog.html` imports it dynamically, sorts alphabetically, categorizes under **Mystery & Suspense**, and reads the browser's saved progress under `ophelia-the-moonstone-collins-1868-v1`.
- The catalog's synopsis is intentionally inviting and plot-focused, following the established literary style, with no promotional technical notes about chapters or audiobook settings.

## Verification notes

- All eight source parts committed and fetched from GitHub.
- Complete source inventory and chronological order checked.
- HTML and inline JavaScript source checked syntactically.
- Real-world GitHub Pages deployment, artwork hotlink loading, and on-device text-to-speech playback still require an independent browser test.
