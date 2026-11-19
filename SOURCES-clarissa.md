# Clarissa; or, The History of a Young Lady — Samuel Richardson

## Work and edition

**Original publication:** the seven-volume first edition, issued across 1747–1748 (commonly cited as 1748), by Samuel Richardson. The website presents the **full nine-volume later text** that is available in Project Gutenberg's public-domain transcription, rather than pretending to reproduce the 1748 first printing verbatim.

**Edition:** the transcription is in nine volumes, associated with the **Chapman & Hall 1902 edition** as also identified by Standard Ebooks' editorial bibliographic note (https://standardebooks.org/ebooks/samuel-richardson/clarissa). The individual Project Gutenberg title pages do not themselves specify a printing year, and the manuscript/revision provenance of every letter was not independently checked. Clarissa was revised by its author in different editions.

## Public-domain local text

Volumes are stored in the website repository as individual, locally hosted JSON files, enabling **one-volume-at-a-time loading** instead of downloading more than 5 MB of raw novel text on each visit. Literary text is in English; there is no modern translation and no LibriVox or prerecorded narration.

| Reading volume | Gutenberg eBook | Letter sections | Local file |
|---|---:|---:|---|
| 1 | [#9296](https://www.gutenberg.org/ebooks/9296) | 44 | `public/books/clarissa-richardson-volume-1.json` |
| 2 | [#9798](https://www.gutenberg.org/ebooks/9798) | 48 | `public/books/clarissa-richardson-volume-2.json` |
| 3 | [#9881](https://www.gutenberg.org/ebooks/9881) | 62 | `public/books/clarissa-richardson-volume-3.json` |
| 4 | [#10462](https://www.gutenberg.org/ebooks/10462) | 55 | `public/books/clarissa-richardson-volume-4.json` |
| 5 | [#10799](https://www.gutenberg.org/ebooks/10799) | 36 | `public/books/clarissa-richardson-volume-5.json` |
| 6 | [#11364](https://www.gutenberg.org/ebooks/11364) | 73 | `public/books/clarissa-richardson-volume-6.json` |
| 7 | [#11889](https://www.gutenberg.org/ebooks/11889) | 85 | `public/books/clarissa-richardson-volume-7.json` |
| 8 | [#12180](https://www.gutenberg.org/ebooks/12180) | 71 | `public/books/clarissa-richardson-volume-8.json` |
| 9 | [#12398](https://www.gutenberg.org/ebooks/12398) | 63 | `public/books/clarissa-richardson-volume-9.json` |

The nine local text files include about **935,180 whitespace-separated words**, with **537 individually headed letter sections** in the underlying transcription (plus the preface, principal persons, conclusion, and postscript). Approximate generated page count: **4,636** at the present page size. Every local file passed source signature, section-count, word-length, and in-memory pagination checks.

**Source preservation:** only non-literary Project Gutenberg preambles/terms, source-editor machine notices, and repeated volume tables of contents were omitted from the on-site reading copy; these remain available through the linked original source editions. Mechanical plain-text hard-wrapped lines were joined as paragraphs, and line-end formatting was simplified. Letter wording and printed numbering were retained as transcribed. The first volume contains the original preface and list of principal persons; the ninth contains the conclusion and complete postscript, ending with `FINIS`. No substantive narrative letters were intentionally shortened or adapted.

**Numbering irregularities in the supplied public-domain text:** Volume II prints two consecutive letter headings as `LETTER XVII` and then continues with `LETTER XIX`; Volume IX proceeds from `LETTER LXII` to `LETTER LXIV`. The online reader faithfully preserves the transcribed labels and documents the anomalies, rather than silently renumbering or inventing missing prose. The checks accommodate those two specific anomalies; the original source does not show corresponding numbered headings XVIII and LXIII.

## First-edition artwork

[Wikimedia Commons: Original title page of Clarissa, or, The History of a Young Lady (1748)](https://commons.wikimedia.org/wiki/File:Clarissa,_or,_the_History_of_a_Young_Lady_(title_page).png). Public-domain historical image with 363×546 pixel file dimensions; a scan of the first edition's title page, not a claim that the hosted transcription is the first-edition text. Its specific original holding institution is not clearly documented on Commons. The repository reader and card link to the image with the site's historical cover fallback.

## Reader and catalog

- Reader: `clarissa.html`
- Bookmark and position storage: `ophelia-clarissa-richardson-1748-complete-v1` (`volume` + `page`)
- Shared synthetic speech: `public/js/ophelia-narration.js`, with voice, pace, pause/resume and autoplay controls; no prerecorded audio
- Only one volume is fetched and paginated at a time, reducing memory use and reader freeze risk
- Home/catalog card: `index.html`; automatically discovered by `catalog.html`
- Genre: `Epistolary & Eighteenth-Century Fiction`
- Share script: `public/js/ophelia-share.js`; original first-edition title page
- Sitemap: `sitemap.xml` should include `https://opheliasopenbooks.github.io/website/clarissa.html`

**Validation limitations:** The static JavaScript and all nine JSON volumes can be tested for source integrity and pagination in memory. Deployment success does not itself establish that speech, the cover, or each control has passed an interactive browser playback test.
