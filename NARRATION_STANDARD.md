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
- **High-confidence context-only homographs:** respectful bowing (including
  Dracula’s courteous, courtly and grateful bows) and the front of a vessel
  are voiced with the \`bough\` pronunciation. Archery, ribbon, musical,
  Bow Street and bow-window meanings remain untouched; uncertain cases
  remain voice-dependent. Perfect-tense \`had read\` is voiced as \`red\`.
  Add examples to the regression tests before adding new homographs.
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

## Bow pronunciation refinement (v1.3.1, November 2026)

The single shared narration module now recognizes polite gestures such as
"with a courteous bow", "with a courtly bow", and "with a grateful bow".
Its voice-only substitution rhymes with "cow" and remains consistent across
UK and US voice choices. The printed editions stay exactly as published.
The `dracula.html` reader now uses `?v=1.3.1` to refresh the module immediately;
other readers that reference the same shared file automatically receive the
fix after their browsers refresh/revalidate the script cache.

## Watch and clock pronunciation (v1.3.2, November 2026)

The shared voice-only normalizer distinguishes the mechanical verb *wind*
(/waɪnd/, rhyming with *kind*) from the weather noun *wind* (/wɪnd/).
The line in *Dracula*, Chapter IV, about Jonathan Harker's watch now uses a
homophonic spoken-only substitution (`wined`) to guide device TTS;
a corresponding `wineds` case handles clear clock/watch sentences.
Atmospheric wind and ambiguous contexts stay unchanged. The printed book,
voice options, bookmarks and reading positions remain untouched.

`dracula.html` requests the shared module with `?v=1.3.2` to refresh
the script cache immediately. Other readers using the shared script will
pick up the improvement after their browsers fetch the latest module.
Browser-specific voices cannot guarantee any one phonetic rendering.

## Mina Murray/Harker pronunciation (v1.3.3, November 2026)

The proper name **Mina** is pronounced *Meena*, with a long "ee" sound.
A voice-only substitution in `normalizeForSpeech` changes the name to
`Meena` (including capitalized headings and possessives) before the browser
speech engine reads it. The printed manuscripts still show the correct
historical spelling **Mina**. The `dracula.html` reader requests version
`1.3.3` to refresh the speech script cache. This rule is shared by book readers
that load `public/js/ophelia-narration.js`; selected English voices still
have device-specific synthesis differences.

## Word-level pause/resume with a visible yellow marker (v1.4.0)

Every standalone audiobook reader (including the Alice/Pride reader design and
the line-paced Leaves of Grass reader) now calls the shared
`pauseReading()`, `resumeReading()`, and `clearReading()` methods.

When the browser emits `SpeechSynthesisUtterance.onboundary` word events,
Pause cancels the active utterance and records the start of the current word.
The corresponding word in the **original visible manuscript** is temporarily
wrapped in a yellow `<mark>`; its original spelling is preserved. Resume
removes the marker and speaks again from that word using the same voice,
language, speed and punctuation. Stale cancellation events cannot advance
the reading queue. Navigation and Stop clear the marker. Existing saved
page-progress keys and original manuscripts are unchanged.

**Browser limitation:** some installed/device voices do not provide usable word
boundary events. In those voices, the system uses the start of the current
utterance as a conservative fallback; it cannot truthfully promise exact
word-level resumption for every operating-system voice. Imported audio
recordings in the Alice reader do not expose word timestamps and keep their
existing media pause/resume behavior.

Run `node tests/narration.test.cjs` and
`node tests/library-reader-audit.cjs` after changes. Listen in Edge and
Chrome with representative UK/US narrators before claiming acoustic accuracy.

## Dracula's "parti" (v1.4.1, November 2026)

Lucy Westenra's letter to Mina in Chapter V uses the correctly spelled,
French-derived nineteenth-century noun **parti**, an eligible or desirable
marriage prospect: "He is an excellent parti, being handsome, well off, and
of good birth." Its English pronunciation corresponds to **party**, not
**Part I** (a Roman-numeral heading spoken "part one").

Keep **parti** in the displayed manuscript. The shared voice-only normalizer
supplies "party" to browser text-to-speech. The paused-word alignment maps
spoken "party" back to written "parti" so yellow highlighting marks the correct
visible word. The legitimate "Part I" heading remains spoken "Part one".
Dracula requests v1.4.1 to defeat caching. Other readers use the same shared
module and receive this rule when they refresh the cached narration script.

## Dracula Chapter V, "tear up the letter" (v1.4.2, November 2026)

In Lucy's letter to Mina, "I should tear up the letter" uses the verb
**tear** meaning *rip*, pronounced /tɛər/ (rhyming with **bear**).
The browser was incorrectly using the tear-of-crying pronunciation /tɪər/.
The shared narration normalizer now supplies the spoken-only homophone
**tare** when "tear" precedes a physical paper/letter/book/document object.
It deliberately leaves emotional **tear**, **tears**, and **tear up at**
untouched. The original manuscript remains unmodified.

The yellow paused-word marker aligns spoken **tare** to visible **tear**.
Dracula loads shared narration v1.4.2 immediately; other readers reuse
the same module upon refresh. Acoustic output still varies with browser voices.
