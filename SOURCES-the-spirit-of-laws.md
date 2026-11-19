# The Spirit of Laws — Montesquieu

## Work, original language, and rights
- Original work: *De l’esprit des loix*, Geneva: Barrillot & Fils, 1748; author Charles-Louis de Secondat, Baron de La Brède et de Montesquieu (1689–1755).
- English bibliographical title: *The Spirit of Laws* (also called *The Spirit of the Laws*, singular *The Spirit of Law*). Thomas Nugent first translated it into English in **1750**. His 1752 translator's introduction survives in later editions.
- **Text actually hosted:** Nugent's historical English translation, **revised by J. V. Prichard**, as reproduced from G. Bell & Sons' **1914** public-domain edition. This is not a transcript of the 1748 first French edition. Both the text and the 1748 title-page scan are public domain in the United States.
- The French original is separately linked for **read-only** access on [French Wikisource](https://fr.wikisource.org/wiki/De_l%E2%80%99esprit_des_lois); no generated French speech is provided.

## Complete text sources and local files
- Original complete English plain-text transcription: [Constitution Society — The Spirit of Laws](https://constitution.org/2-Authors/cm/sol.htm) and [full-source `sol.txt`](https://constitution.org/2-Authors/cm/sol.txt). Jon Roland rendered the public-domain historical text to HTML and plain text.
- Mirrored local UTF-8 source: `public/books/spirit-of-laws-montesquieu-nugent-prichard-1914.txt` (~1.58 MB). Imported automatically by `scripts/import_spirit_of_laws.py`, with deployment workflow `.github/workflows/import-spirit-of-laws.yml`. The script checks the work identification, both Book I and Book XXXI headings, and minimum length; it does not paraphrase or truncate the source.
- Efficient reader data: **31 separate book files** `public/books/spirit-of-laws-book-01.json` through `public/books/spirit-of-laws-book-31.json`. These were generated directly from the complete local source and retain every numbered chapter, including Book XXVII's single long chapter, with source footnotes after the corresponding book.
- **604 sequential authorial chapter divisions across 31 books**, as validated against the source's headings. Additional front matter is included at the start of Book I: Thomas Nugent's 1752 *The Translator to the Reader* (with notes), Montesquieu's **Preface**, and his **Advertisement**. Historical chapter notes are retained at the end of all 31 books.
- Approximately **261,883 whitespace-separated words** in the locally structured content, including prefaces and notes, and about **1,454 automatically generated reading pages**. The original raw transcription totals roughly 268,429 words, including its lengthy printed table of contents and source bibliographic matter. The repeated table of contents and renderer's own distribution header were omitted from the reading data because the chapter selector provides navigation instead.
- Mechanical line wraps in the source, which inserted a blank line between every printed line, were rejoined into paragraphs without changing the authored prose. Original spellings, footnote numbers, chapter-title text, and references are retained. Some chapter headings occur at the start of a paragraph; the reader additionally speaks the chapter number when starting its first page.

## Historical cover
- [Wikimedia Commons — *De l'Esprit des loix* first edition (1748), Volume I, title page](https://commons.wikimedia.org/wiki/File:Montesquieu,_De_l%27Esprit_des_loix_(1st_ed,_1748,_vol_1,_title_page).jpg).
- The image is a **1,866 × 2,502** pixel photograph of an original 1748 printed title page, uploaded by Sgconlaw and marked public domain on Commons. It is displayed at its proper aspect ratio in both the catalog and the reader, with the website's standard fallback in case the remote image fails to load.
- The cover's French-language title is historically correct for the original work even though the main audio/text uses the historic public-domain English translation.

## Website integration and behavior
- Reader `the-spirit-of-laws.html` — same antique design and shared browser-generated speech normalizer as other books, adjustable text and narrator settings, saved place/bookmark, night mode, pause/resume, automatic page turn, per-book chapter and notes selector, next/previous book navigation, and share button.
- Reader loads **one book at a time**, rather than paginating all 31 books together, to minimize freezes. Previous book is not downloaded unless selected.
- Progress and bookmark key: `ophelia-spirit-of-laws-montesquieu-1748-complete-v1`; saves **book number** (internally named `volume`) and within-book page.
- Homepage/index: `index.html`; automatically discovered in catalog `catalog.html` under **Political Philosophy & Enlightenment**. Search engine URL in `sitemap.xml` is `https://opheliasopenbooks.github.io/website/the-spirit-of-laws.html`.
- A full in-memory parse and pagination check passed for **every one** of the 31 local book files. JavaScript source passed syntax checks. Actual narration voices, cover loading, and live mobile browser functionality require a browser-level test and must not be represented as tested merely because the repository deploys successfully.
