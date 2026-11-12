# War and Peace — Leo Tolstoy (1865–1869), Louise and Aylmer Maude translation

## Public-domain edition
- Original Russian novel by Lev (Leo) Nikolayevich Tolstoy, serialized beginning in 1865 and issued in book form through 1869. U.S. public domain.
- Translation: **Louise and Aylmer Maude**, early 20th century, distributed as a complete U.S. public-domain edition by Project Gutenberg eBook 2600: https://www.gutenberg.org/ebooks/2600.
- Original manuscript via GITenberg: https://github.com/GITenberg/War-and-Peace_2600/blob/master/2600-0.txt. Gutenberg catalogue states public domain in the USA. This is the Maude translation, **not** any modern copyrighted translation.
- Stored locally at `public/books/war-and-peace-tolstoy-maude-complete.txt`. This local text follows the Gutenberg edition and preserves every narrative chapter; modern Gutenberg boilerplate and the generated list of contents were excluded.
- Original title and translator credited. The original novel has fifteen books and two epilogues, preserving the full philosophical ending (the Second Epilogue).

## Verification and chapter structure
- **15 books**, **First Epilogue**, **Second Epilogue** = 17 book-level sections.
- **365 chapters total**, grouped 28, 21, 19, 16, 22, 26, 13, 22, 23, 39, 34, 16, 19, 19, 20, 16 and 12.
- File is approximately **3,201,703 Unicode characters** and **562,494 whitespace-separated words**.
- Chapter parser preserves full Maude prose, paragraph punctuation, diacritics and French dialogue; joins only digitization-imposed hard line breaks to paragraphs.
- The parser rejects missing or out-of-sequence chapters, missing epilogues, a short text, or a missing final paragraph.
- Reader: `war-and-peace.html`, with complete text fetched locally from site.
- Regression: `tests/war-and-peace.test.cjs`, registered in `.github/workflows/narration-checks.yml`.

## Authentic historical art
- The opening image is the **1873 Russian third-edition title page**, not the English translation's cover, from Wikimedia Commons:
  https://commons.wikimedia.org/wiki/File:Tolstoy_-_War_and_Peace_-_third_edition,_1873.png
- Public-domain image, original publisher material; the attribution appears on the reader.
- The catalog and reader use the same historical artwork.

## Book interface and audio
- Keeps Ophelia's existing vintage styling, pagination, chapter menu (all 365 chapters plus introductory title page), bookmarking, saved page, voice, speed, text size, auto-turn, evening theme and the literary share control.
- Shared grammar-aware narration: `public/js/ophelia-narration.js?v=1.2.0` with punctuation pauses and context-only speech adjustments.
- Progress key: `ophelia-war-and-peace-tolstoy-maude-full-alice-voice-v1`; never overrides another book.
- Audio depends on the reader's browser/device voice. An automated text test cannot replace actual pronunciation review.

**Editorial policy:** Only complete public-domain work and translation in the United States. Do not introduce modern copyrighted abridgments or editions.
