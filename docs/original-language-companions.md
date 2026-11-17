# Original-language companions · Ophelia’s Open Book

## Library rule

For every work in the catalog that is presented in English translation from another language, offer a clearly labelled **Read in the Original Language** link from its English reading page.

- Preserve English audio, highlighting, bookmarks, and reading progress. This change is navigational only.
- Original-language reading pages maintained by Ophelia’s Open Book are **read-only**, without automated narration; do not add foreign-language text-to-speech without the project owner's explicit approval.
- Prefer the actual complete original text, not a translated edition or a search results page.
- Verify the link and edition identity before publishing. Check U.S. public-domain or permitted use before hosting text.
- Link to an existing Ophelia’s original-language reader when available, otherwise to a reputable external original-language text or facsimile. External sources have their own availability and terms.
- A work published in multiple original volumes must link **all volumes**; do not imply a single volume is complete.
- Preserve the original language and original title in the reader’s link label. State special editorial distinctions where necessary, such as an English novel adapted from two Norwegian books.
- New translated editions must be added to the `originalLanguageSources` map in `public/js/ophelia-share.js` when the English reader is added. The common reader helper renders the antique-styled link beneath the book heading; the book template should include the shared script.

## Existing coverage

The current map covers 23 translated reading pages in eight source-language categories: Ancient Greek, Latin, French, Spanish, Old French, Norwegian, German, and Russian.

Several English books already have **internal** read-only originals:
- The Metamorphosis → `die-verwandlung.html` (German).
- The Phantom of the Opera → `le-fantome-de-lopera-original-francais.html` (French).

Other links lead to verified external editions (Project Gutenberg, Wikisource, Perseus, Project Runeberg, historical scans, or an archive). Note that external availability is maintained by the source provider rather than our website.

Before announcing that a new translated book is ready: verify the English text is complete, the original-language link resolves to the correct work and language, all original volumes are represented, and the read-only/no-foreign-language-audio rule remains intact.
