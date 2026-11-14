# Sources — *As I Lay Dying* (1930), William Faulkner

## Work and edition

- **Original work:** *As I Lay Dying* by William Faulkner (1897–1962), first published October 1930 by Jonathan Cape & Harrison Smith, New York.
- **Text:** Standard Ebooks transcription based on Faded Page, in 59 narrator-titled sections. The text includes the original dedication **“To Hal Smith”**. It is a transcription of the public-domain novel, not the copyrighted corrections unique to a later critical edition.
- **Text source:** https://standardebooks.org/ebooks/william-faulkner/as-i-lay-dying
- **Source repository:** https://github.com/standardebooks/william-faulkner_as-i-lay-dying
- **Original first-edition reference scan:** https://commons.wikimedia.org/wiki/File:As_I_Lay_Dying_(1930).pdf
- **Original front-cover scan:** https://commons.wikimedia.org/wiki/File:As_I_Lay_Dying_(1930_1st_ed_jacket_cover).jpg

## U.S. public domain

Published in 1930; entered the U.S. public domain January 1, 2026, at the end of the 95-year U.S. term for works published with copyright in 1930. The University of Miami Libraries identifies this specific novel in its 2026 public-domain list: https://guides.library.miami.edu/publicdomainday . Standard Ebooks states that its source is believed to be public domain in the United States and its contributors dedicate their work under CC0. Copyright laws in other countries may differ.

## Preservation and structure

- Preserve **all 59 original narrator-heading monologues**, in their original sequence. Heading names (Darl, Cora, Tull, Cash, and others) must be spoken as names, rather than introducing each section as a conventional numbered chapter.
- Preserve Cash's numbered 13-item carpentry description (section 18).
- Preserve the coffin-outline illustration embedded in Tull's narration (section 20) in its original position in the prose. The SVG is from Standard Ebooks, `src/epub/images/illustration-1.svg`, mirrored locally at `public/art/as-i-lay-dying-coffin.svg`. In text storage the marker `[[COFFIN_DIAGRAM]]` inserts that in-line figure and has an accessible spoken description.
- Keep the title/dedication and the final line ending **“Meet Mrs. Bundren,” he says.**
- The four local, sequential text files are `public/books/as-i-lay-dying-1930-01.json` through `public/books/as-i-lay-dying-1930-04.json`. The reader validates 60 sections (front matter + 59 monologues) and checks that the full text and illustrations are present.
- The catalog blurb is intentionally **literary and story-focused**, not a technical list of chapters, voice features, or ebook statistics.

## Artwork and audio

- Catalog/reader cover: authentic tan 1930 first-edition dust jacket, published by Jonathan Cape & Harrison Smith, designer uncredited; scan hosted by Wikimedia Commons, marked public domain in the U.S. Use an actual scan, never a misleading modern facsimile.
- Reader audio: the shared browser/device voice narration system in `public/js/ophelia-narration.js`, with text-to-speech, voice selection, pacing, bookmarks, progress saving, and share controls. It is not a prerecorded audiobook.
- No other modern illustration has been inserted into the novel.

## Checks

- 59 numbered narrator sections, one dedicated title page, full ending, four text files, coffin figure, and numbered list checked in the repository.
- Static references and catalog integration checked. A live browser/device voice playback verification still needs to be done separately.
