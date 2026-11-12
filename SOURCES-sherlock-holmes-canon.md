# Sherlock Holmes complete canon — editorial and publication log

**Collection status:** nine separately accessible volumes on Ophelia's Open Book, covering the four original Sherlock Holmes novels and five story collections. This is the full canonical set of four novels and fifty-six short stories. The site's original `sherlock-holmes-adventures.html` (1892; 12 short stories) is included in the count.

## Edition index
| Year | Original volume | On-site reader | Complete original sections | Transcription |
|---|---|---|---|---|
| 1887 | A Study in Scarlet | `a-study-in-scarlet.html` | Two parts, 14 chapters; transcriber notes preserved | Project Gutenberg #244, `https://www.gutenberg.org/ebooks/244` |
| 1890 | The Sign of the Four | `the-sign-of-four.html` | 12 chapters | Project Gutenberg #2097, `https://www.gutenberg.org/ebooks/2097` |
| 1892 | The Adventures of Sherlock Holmes | `sherlock-holmes-adventures.html` | 12 original stories | Project Gutenberg #1661; GITenberg source |
| 1894 | The Memoirs of Sherlock Holmes | `the-memoirs-of-sherlock-holmes.html` | 11 original stories in first British collection, including The Final Problem | Project Gutenberg #834 |
| 1902 | The Hound of the Baskervilles | `the-hound-of-the-baskervilles.html` | 15 chapters | Project Gutenberg #2852 |
| 1905 | The Return of Sherlock Holmes | `the-return-of-sherlock-holmes.html` | 13 original stories | Project Gutenberg #108 |
| 1915 | The Valley of Fear | `the-valley-of-fear.html` | Part 1 (7 chapters), Part 2 (7 chapters), epilogue | Project Gutenberg #3289 |
| 1917 | His Last Bow | `his-last-bow.html` | Eight-story American arrangement, including The Cardboard Box, and Watson's preface | Standard Ebooks' original XHTML source + complete The Cardboard Box from Project Gutenberg #2344 |
| 1927 | The Case-Book of Sherlock Holmes | `the-case-book-of-sherlock-holmes.html` | Original Conan Doyle preface and 12 stories | Project Gutenberg #69700 |

*Original text is public domain in the United States as of 2026. These are full source works, not modern paraphrases or condensed reworkings. Some older source transcripts retain typographic conventions and editorial endnotes. Rights in other jurisdictions can differ.*

## The Cardboard Box and original publication differences
The first British edition of *The Memoirs of Sherlock Holmes* published eleven stories. Some subsequent or overseas editions included *The Adventure of the Cardboard Box* with *The Memoirs*. The 1917 American volume of *His Last Bow* includes the story. To keep the original source editions distinct, this website uses eleven stories in *The Memoirs* and eight in *His Last Bow*, ensuring that **none of the 56 canonical stories is omitted or counted twice**.

## Cover and illustration credits
All imagery is an existing historical scan, not generated. Original artwork is in the U.S. public domain except where the *digitized photograph* has separate reuse terms:
- *A Study in Scarlet*: [1887 Beeton's Christmas Annual cover](https://commons.wikimedia.org/wiki/File:A_Study_in_Scarlet_from_Beeton%27s_Christmas_Annual_1887.jpg), artwork attributed to D. H. Friston, Beinecke Library/Yale.
- *The Sign of the Four*: [1892 book cover](https://commons.wikimedia.org/wiki/File:The_Sign_of_Four_cover_1892.jpg); creator unknown, U.S. public domain.
- *The Memoirs of Sherlock Holmes*: [1894 London first-edition cover digitization](https://commons.wikimedia.org/wiki/File:The_Memoirs_of_Sherlock_Holmes_(Arthur_Conan_Doyle,_1894).jpg) by Toronto Public Library Special Collections. **The digitization image is CC BY-SA 2.0**, and the reader must credit Toronto Public Library, link the license, and say the image is unmodified (implemented in the reader). Historical underlying artwork is U.S. public domain.
- *The Hound of the Baskervilles*: [Sidney Paget illustration](https://commons.wikimedia.org/wiki/File:Houn-01.jpg), originally published in the early-1900s *Strand*.
- *The Return of Sherlock Holmes*: [1905 first-edition cover](https://commons.wikimedia.org/wiki/File:The_Return_of_Sherlock_Holmes_cover_1905.jpg).
- *The Valley of Fear*: [Arthur I. Keller 1915 first-edition cover](https://commons.wikimedia.org/wiki/File:The_Valley_of_Fear.jpg).
- *His Last Bow*: [first American edition dust jacket, 1917](https://commons.wikimedia.org/wiki/File:His_Last_Bow_front_cover_(first_American_edition).jpg).
- *The Case-Book of Sherlock Holmes*: [1927 American first-edition jacket](https://commons.wikimedia.org/wiki/File:The_Case_Book_of_Sherlock_Holmes_(American_first_edition_dust_jacket).jpg).
- *The Adventures of Sherlock Holmes*: [Sidney Paget illustrated scene from A Case of Identity](https://commons.wikimedia.org/wiki/File:Sidney_Paget_-_A_Case_of_Identity_02.jpg).

## Reader integration and checks
All readers preserve the shared `public/js/ophelia-narration.js` for normalization of Roman numerals and capitalized words on the **speech-only** copy, plus `public/js/ophelia-share.js` for the literary share sheet. Text size, speed, voice selection, book/story navigation, sound controls, page-turning, bookmarking and saved local reading position are offered in the consistent reader UI. Front matter in the 1927 *Case-Book* and 1917 *His Last Bow* is included, and the latter's short original preface is correctly supported by the validator.

Catalog discovery comes from the `index.html` `#books > article.book` entries, with explicit “Mystery & Detective” genre mappings in `catalog.html`.

**Verification performed:** source story/chapter enumeration, basic minimum-word lengths, text-asset existence via GitHub, JavaScript syntax compilation for each reader, shared narration and share script references, catalog entries, and historical image file-page existence.

**Remaining reader acceptance tests:** actual browser loading across devices, narrated TTS pronunciation, image delivery, autoplay/auto-turn behavior, bookmark resume and share-sheet behavior. Do not claim these were manually tested on a user's browser.
