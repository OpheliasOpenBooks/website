# The Adventures of Sherlock Holmes (1892) — source and rights

## Edition
- **Work:** *The Adventures of Sherlock Holmes* by Sir Arthur Conan Doyle (1859–1930).
- **Original publication:** Twelve stories published in *The Strand Magazine*, July 1891–June 1892, illustrated by Sidney Paget; collected as a book by George Newnes, 1892.
- **Hosted edition:** Complete, **unabridged twelve-story 1892 collection**, not the whole later Sherlock Holmes series (which also includes earlier novels and subsequent books).
- **Text source:** Project Gutenberg eBook 1661, https://www.gutenberg.org/ebooks/1661 ; GITenberg transcription mirror https://github.com/GITenberg/The-Adventures-of-Sherlock-Holmes_1661/blob/master/1661.txt
- **Rights:** The 1892 Conan Doyle stories and original 1891–1892 Sidney Paget illustrations are public domain in the United States. Project Gutenberg identifies its original text as public-domain source material; different legal regimes may apply elsewhere.
- **Processing:** Removed Project Gutenberg's intro/footer, trademark notice, and licence text when hosting the literary work separately; all narrative text, paragraph breaks, tale titles, and internal Roman-numeral subdivisions are preserved. Wrapped plain-text lines are joined for readable typography. The original words are not modernized, summarized, or abbreviated.

## All twelve stories, original order
1. A Scandal in Bohemia
2. The Red-Headed League
3. A Case of Identity
4. The Boscombe Valley Mystery
5. The Five Orange Pips
6. The Man with the Twisted Lip
7. The Adventure of the Blue Carbuncle
8. The Adventure of the Speckled Band
9. The Adventure of the Engineer's Thumb
10. The Adventure of the Noble Bachelor
11. The Adventure of the Beryl Coronet
12. The Adventure of the Copper Beeches

Source-specific heading check: source labels stories 1–6 as `ADVENTURE I.` through `ADVENTURE VI.`; stories 7–12 have plain `VII.` through `XII.` prefixes. Reader parser supports both, checks that exactly twelve are present, and requires more than 4,000 words in every story. Original internal Roman numerals remain visible; the browser read-aloud substitutes “Section one,” etc., for standalone section headings on the speech-only copy.

## Historic artwork
- **Shown in reader and catalog:** Sidney Paget illustration from *A Case of Identity* (1891), one of the twelve original stories.
- **Original image:** https://commons.wikimedia.org/wiki/File:Sidney_Paget_-_A_Case_of_Identity_02.jpg
- **Media URL:** https://upload.wikimedia.org/wikipedia/commons/1/13/Sidney_Paget_-_A_Case_of_Identity_02.jpg
- **Artist/date:** Sidney Paget, 1891, from original *Strand Magazine* illustrations; U.S. public domain. Image is referenced by source URL rather than locally edited.

## Ophelia reader and catalog
- **Book reader:** `sherlock-holmes-adventures.html`
- **Full text:** `public/books/sherlock-holmes-adventures-1892.txt`
- **Homepage:** `index.html` adds a direct book card and local saved progress text.
- **Catalog:** `catalog.html` discovers homepage cards and categorizes this reader as Mystery & Detective.
- Reader reuses `public/js/ophelia-narration.js` and `public/js/ophelia-share.js`, with chapter/story selection, local page and bookmark persistence, speed, text-size controls, evening theme, pause/resume and optional automatic page turning.

## Verification
- Parsed the source before publication and confirmed all twelve titled stories in order; approximate whitespace-word counts: 8521, 9108, 6980, 9620, 7319, 9207, 7814, 9812, 8289, 8106, 9684, 9950. These counts are informative and include story headings and internal part labels.
- GitHub commits host the original story text and new reader. **Live browser narration, image delivery, sharing, pagination and link checks still need a separate browser-level test**; they must not be described as user-tested until verified.
