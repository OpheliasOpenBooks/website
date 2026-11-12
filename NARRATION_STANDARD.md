# Ophelia's Open Books — shared narration standard

All book readers must use the **one shared spoken-text normalization module**:
`public/js/ophelia-narration.js`

## Every new book

1. Use `reader.html` or a later book such as `tom-sawyer.html` as the design and grammar-aware narration template.
2. Load the shared module **before** the reader's inline script:

   ```html
   <script src="public/js/ophelia-narration.js"></script>
   ```

3. In `speechChunks(text)`, prepare the voice-only copy before sentence segmentation:

   ```javascript
   const spokenText = window.OpheliaNarration
     ? window.OpheliaNarration.normalizeForSpeech(text)
     : text;
   const clean = spokenText.replace(/\*\s*/g, '').replace(/\s+/g, ' ').trim();
   ```

4. Leave the book's printed text **unchanged**. Only the spoken version is case-normalized.
5. Preserve Alice's existing grammatical sentence segmentation, punctuation, quote handling, abbreviated honorifics, listening controls, and reading progress.
6. Test with both original capitalized openings and standard proper nouns:
   - `IN this book` → spoken as `In this book`
   - `YOU don't know` → spoken as `You don't know`
   - `WELL, I got up` → spoken as `Well, I got up`
   - `Richard III`, `Louis XVI` → voice-only `Richard the third`, `Louis the sixteenth`
   - `NASA`, `USA`, `FBI` → preserve customary capitals
   - `CHAPTER VIII`, `Part II`, `Book XXI` → voice-only `Chapter eight`, `Part two`, `Book twenty-one`
   - `I: ABOUT THIS TRANSLATION` → voice-only `one: About This Translation`
   - `I opened the book`, `this book I read` → keep `I` as a pronoun
   - `Mr. Darcy` and `Dr. Watson` → preserve punctuation
7. Browser speech voices differ. Listen to representative passages in Edge, including dialogue, chapter openings, abbreviations and historic dialect.
8. For pages needing immediate deployment of a changed shared module, use a versioned reference, such as `public/js/ophelia-narration.js?v=1.1.0` (as in Don Quixote). No local reading keys need changes.

## Narration quality standard (v1.2.0, November 2026)

**All existing standalone prose readers** now reference the versioned shared module
\`public/js/ophelia-narration.js?v=1.2.0\`, delegate to its
\`OpheliaNarration.speechChunks(text)\`, and speak via
\`OpheliaNarration.speakWithPauses(synth, utterances, isCurrent, isPaused)\`.
The original inline implementation remains only as a compatibility fallback.

- **Sentence-level pacing:** an utterance completes before the next begins.
  Approximate silent gaps: title/heading 630 ms, full stop 305 ms,
  question/exclamation 400 ms, colon/semicolon 265 ms, clause dash 230 ms,
  and optional comma breath 165 ms.
- **Sentence construction:** recognize periods, questions, abbreviations such as
  Mr. and Dr., quotations and chapter headings. Long Victorian sentences
  may be broken at actual punctuation, never in the middle of a word.
- **High-confidence context-only homographs:** respectful bowing and the
  forward of a vessel are voiced with the \`bough\` pronunciation; archery
  bows and uncertain contexts remain untouched. Perfect-tense \`had read\`
  is voiced as \`red\`. Add examples to the regression tests before making
  additional changes to homographs.
- **Respect original editions:** only the off-screen copy sent to the
  device TTS is adjusted. Printed prose and poetry, illustrations,
  bookmarks, page positions and selected narrator voices are unaffected.
- **Special cases:** \`leaves-of-grass.html\` retains its separate
  verse/line-paced sequencer and benefits from the new spoken-word
  normalization. \`studio.html\` shares the same prose speech system.
  \`leatherstocking-tales.html\` is a volume navigation page, not a speaking reader.
- **Future books:** use a current standalone reader as a template and retain
  the shared versioned module, delegates, and pause-aware queue. Never
  introduce a fresh all-at-once \`for(... synth.speak(...))\` queue.
- **Regression test:** \`node tests/narration.test.cjs\` checks normalization,
  grammar boundaries, title pauses, and sequential scheduling.

### Important browser limitation

\`SpeechSynthesisUtterance\` depends on installed browser and operating-system
voices. No JavaScript replacement list can reliably understand the semantics
of *every* homograph or control individual phonemes/intonation in a device TTS
voice. These are high-confidence improvements rather than full natural-language
understanding. New ambiguous examples should be reviewed in the original sentence,
with a voice-only override added only when its interpretation is clear. Test
actual audio in Edge/Chrome before declaring pronunciation perfect.


## Roman numeral speech standard (v1.1.0)

- Convert Roman numerals to English number words only in appropriate contexts (chapter, book, part, act, section, volume, numbered headings and wars); use ordinal names for monarchs such as Henry VIII.
- Avoid converting the first-person pronoun `I`, including in `the book I read` or `the part I remember`.
- Do not modify printed manuscript text. All conversion occurs in the existing `normalizeForSpeech` shared module before speech segmentation.
- Test actual browser voices in Edge; automated tests check the exact text sent to TTS, not an individual device's voice pronunciation.

## Which books use the shared rule?

- Alice's Adventures in Wonderland — `reader.html`
- Pride and Prejudice — `pride-and-prejudice.html`
- Frankenstein — `frankenstein.html`
- The Adventures of Tom Sawyer — `tom-sawyer.html`
- Adventures of Huckleberry Finn — `huckleberry-finn.html`
- David Copperfield — `david-copperfield.html`
- Gulliver’s Travels — `gullivers-travels.html`

A new standalone reader does not inherit this JavaScript automatically unless it uses a reader template with the shared script tag. Keep this dependency in future readers so one update to `ophelia-narration.js` improves all books.

## Preservation

Do not alter the source manuscripts for voice fixes, as capital letters in an original edition may reflect intentional period typography and dialogue emphasis. Spoken-text normalization leaves the on-screen edition intact. Keep the module external and editable; do not paste separate differing versions into individual books.
