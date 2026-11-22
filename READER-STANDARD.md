# Ophelia's Open Book — canonical reading-room standard

**Approved reference:** `les-miserables.html` (the original *Les Misérables* reader).

This is the default specification for **all current narrated books and every future title**. Do not create a new layout or reader implementation without an explicit editorial request.

## Required book-page structure

1. Historic, accurately attributed book cover and book/author heading; original publication date and edition information beneath the title.
2. On **translated works only**, put a discreet **"❦ Read in the Original Language (…)"** panel **directly beneath the book heading**, above the cover/illustration and above the share control. Link to authentic primary-language text, **read-only**, preserving English narration and its controls. The complete original-language text MUST be hosted locally on Ophelia’s website, in a dedicated accessible reading page, with no dependency on an external text website for rendering. External sites may be cited only for provenance, never as the sole reader. Clearly label editions when source and English translation come from different revisions. Keep the original language's title visible and identify its source. If multiple volumes, collapse under an expandable heading. Do not place the only original-language link at the bottom or inside Settings. Do not supply an unverified original-text link. Do not publish a translated title until its complete, locally hosted original-language reader works, unless the editor explicitly approves an exception. Original English works do not need a foreign-language panel.
3. Main reading pane on the left, compact sticky control panel on the right on desktop; single-column adaptive reading view on mobile.
4. Reader panel: work/volume/chapter selectors, reading progress, current page, previous / **Read aloud** / next, sound, **Settings** (collapsed by default), bookmark and saved reading place.
5. Settings: English device narrator, narration speed 0.5–2×, legible text-size control, evening theme, auto-turn. Shared defaults use `ophelia-library-settings-v1` but bookmarks and reading positions remain **per-book**.
6. Natural, context-aware narration through `public/js/ophelia-narration.js`; honor pauses/punctuation, and do not reset the spoken word when pausing/resuming. Do not substitute recordings or LibriVox.
7. Common shares and original-language panels use `public/js/ophelia-share.js` and its `originalLanguageSources` map. Register each new translated work there, after checking the original text's URL, language, and edition. Reuse the standard book reader instead of implementing a competing original-language panel.
8. Use full public-domain texts in the United States and carefully cleared **English translations**. Never publish a work when its U.S. copyright or the translation's copyright is uncertain. Preserve narrative text, original chapter structure, original artwork licensing, and a graceful text-loading error.

## Intentional exceptions

- `the-forsyte-saga.html`, `outline-of-history.html`, `leatherstocking-tales.html`: series landing pages; their volume readers follow the book standard.
- `king-james-bible-1611.html`: historical **read-only** edition; no invented audio control.
- `pride-and-prejudice.html`: existing studio plus its actual reader, retained until separately migrated.
- `grimms-fairy-tales.html` and `more-grimm-fairy-tales.html`: specially indexed fairy-tale collections; they now adopt the key Les Mis reading controls and top original-language panel.

## Release checklist

- Confirm original-language panel is near the **top**, never solely in the footer.
- Check default Settings closed; all controls respond; saved preferences work.
- Test reading, page change, pause/resume, voice changes, and bookmark recovery in Microsoft Edge.
- Verify cover and chapter artwork load and are historically appropriate.
- Verify full text is accessible, including every tale/chapter; avoid third-party text fetches if the source is available locally.
- Inspect a phone-width layout and ensure controls do not obstruct text.
- Audit the catalog's linked pages using `node scripts/audit-reader-format.mjs`.
