# The History of the Decline and Fall of the Roman Empire — Edward Gibbon

## Rights and edition
- **Author**: Edward Gibbon. The six-volume original English work was published **1776–1788**.
- **English transcription**: Project Gutenberg #731–736, which preserves historical footnotes and the preface and annotations of nineteenth-century editor **H. H. Milman**. The reading text is a later annotated edition, not a facsimile of the original 1776 printing.
- Source ebooks: https://www.gutenberg.org/ebooks/731 through https://www.gutenberg.org/ebooks/736 . GITenberg mirrors provide the downloadable source files. This set is preferred to Gutenberg #890–895 because the latter omits many footnotes from its first five volumes.
- Original English language: no foreign-language original or translation is involved. Text and annotations are in the U.S. public domain.

## Hosted files and chapter audit
- Importer: scripts/import_gibbon.py; automatic import workflow: .github/workflows/import-gibbon.yml.
- Manifest: public/books/gibbon-manifest.json.
- **72 independently hosted files:** 71 chapters and one introductory/prefatory section. Chapter ranges by volume: I 1–15, II 16–26, III 27–38, IV 39–48, V 49–58, VI 59–71.
- First successful import validated **1,568,587 counted words** of chapters, including original prose and embedded footnotes. The count excludes the introductory section and is not presented as Gibbon's own word count.
- The importer checks all 71 chapters are present in consecutive order and verifies substantive lengths and original multiple-part divisions. Source ebook headers and reuse boilerplate are stripped; the original prose, chapter text and annotations are not abridged. Wrapped text lines and split heading subtitles are reconstructed without changing substantive prose.
- Reader: gibbon-decline-and-fall.html, presented in the existing Ophelia reading-room style. Chapter data loads from this site, not from Project Gutenberg at reading time. English speech uses the visitor's browser/device via public/js/ophelia-narration.js; no pre-recorded audiobook audio.
- Catalog: index.html and catalog.html (genre History & Civilization); sitemap.xml includes the reader.

## Historic cover provenance
- Wikimedia Commons image: authentic **1777 third-edition title page**, original copy from the **John Adams Library at Boston Public Library**: https://commons.wikimedia.org/wiki/File:Decline_and_Fall_of_the_Roman_Empire_vol_1_(1777)_(title_page).jpg
- Display image: https://commons.wikimedia.org/wiki/Special:FilePath/Decline_and_Fall_of_the_Roman_Empire_vol_1_%281777%29_%28title_page%29.jpg
- Commons reports the historic image as **public domain**. The title page is 1777; the hosted text follows the later Milman-annotated transcription. The site labels the distinction.

## QA considerations
- Import checks work-level completeness, number of chapters, source file length, and local hosting. Static page checks confirm chapter navigation controls, bookmarks and shared narration scripts are present.
- Live test in Microsoft Edge and mobile after deployment: image loading, volume and chapter picker, read-aloud pause/resume, sharing, auto-turn and saved place. Individual device voices may vary.
