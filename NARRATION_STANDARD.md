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
   - `Richard III`, `Louis XVI`, `NASA`, `USA`, `FBI` → preserve customary capitals
   - `Mr. Darcy` and `Dr. Watson` → preserve punctuation
7. Browser speech voices differ. Listen to representative passages in Edge, including dialogue, chapter openings, abbreviations and historic dialect.

## Which books use the shared rule?

- Alice's Adventures in Wonderland — `reader.html`
- Pride and Prejudice — `pride-and-prejudice.html`
- Frankenstein — `frankenstein.html`
- The Adventures of Tom Sawyer — `tom-sawyer.html`
- Adventures of Huckleberry Finn — `huckleberry-finn.html`

A new standalone reader does not inherit this JavaScript automatically unless it uses a reader template with the shared script tag. Keep this dependency in future readers so one update to `ophelia-narration.js` improves all books.

## Preservation

Do not alter the source manuscripts for voice fixes, as capital letters in an original edition may reflect intentional period typography and dialogue emphasis. Spoken-text normalization leaves the on-screen edition intact. Keep the module external and editable; do not paste separate differing versions into individual books.
