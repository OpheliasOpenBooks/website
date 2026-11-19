# Critique of Pure Reason / Kritik der reinen Vernunft — Immanuel Kant

## Public-domain work, English edition and original German
- Immanuel Kant published *Critik der reinen Vernunft* in Riga in **1781** and extensively revised it in **1787**. These are distinct textual editions with significant structural and substantive differences.
- The English hosted reading text is J. M. D. Meiklejohn's **1855 translation**, digitized as **Project Gutenberg eBook #4280** (https://www.gutenberg.org/ebooks/4280). It includes Kant's prefaces to the original 1781 and revised 1787 editions and the remainder of the complete translated work. The work and this historical translation are public domain in the United States.
- The separately hosted **German original** is *Kritik der reinen Vernunft (Erste Fassung 1781)*, public-domain **Project Gutenberg eBook #6342** (https://www.gutenberg.org/ebooks/6342), mirrored by GITenberg. It is an original-language reading-only experience, with no synthesized German audio.
- **These English and German editions are not parallel translations of an identical revision.** The English version is primarily based on the revised 1787 Kant text; the German reader deliberately follows the first 1781 text. The site labels this distinction.
- Source mirrors: https://github.com/GITenberg/The-Critique-of-Pure-Reason_4280 and https://github.com/GITenberg/Kritik-der-reinen-Vernunft-Erste-Fassung-1781_6342 .
- The original German UTF-8 JSON files are converted from the source's ISO-8859-1 text using a checked import process. Modern source transcription metadata is preserved as a textual editorial line if it occurs in the literary body.

## Hosted files and complete-text integrity
- English: `critique-of-pure-reason.html`, generated manifest `public/books/kant-en-manifest.json`, and **41 separately hosted parts** `public/books/kant-en-part-01.json` through `public/books/kant-en-part-41.json`. Imported word count: **208,049 whitespace-delimited words** (including prefaces and source headings).
- German: `kritik-der-reinen-vernunft-original-deutsch.html`, manifest `public/books/kant-de-manifest.json`, and **31 separately hosted parts** `public/books/kant-de-part-01.json` through `public/books/kant-de-part-31.json`. Imported word count: **175,590 whitespace-delimited words**.
- The import script `scripts/import_kant.py` runs through `.github/workflows/import-kant.yml`. It retrieves the public-domain source text, removes Project Gutenberg hosting boilerplate, preserves every paragraph, and validates the complete reconstructed sequence before writing each part.
- Segments are practical navigation subdivisions of the source (not fabricated Kant chapters). The original heading text is retained within the contents.
- Only one segment is loaded into the reader at a time. Each reader has its own bookmarked position. English uses Ophelia's established adjustable reading controls and browser-based narration through `public/js/ophelia-narration.js`, without prerecorded LibriVox material. German intentionally has no read-aloud controls and uses `lang="de"`, `translate="no"`.
- The main home catalog card is in `index.html` and the searchable catalog in `catalog.html` under **Philosophy & Enlightenment**. Both reader URLs are registered in `sitemap.xml`.
- Approximate word counts are derived from digital source tokens; they are not scholarly counts tied to the 1781 page numbers.

## Authentic title-page art
- First-edition **1781 title page** of Kant's original German book, as scanned and preserved on Commons: https://commons.wikimedia.org/wiki/File:Kant-KdrV-1781.png .
- Image on the site: https://commons.wikimedia.org/wiki/Special:FilePath/Kant-KdrV-1781.png .
- Wikimedia Commons identifies the eighteenth-century title page as **public domain**. It is clearly labeled as a title page from the German 1781 edition, **not** as the cover of the 1855 translation.

## QA and deployment
- Manifest and individual files must be cross-checked for 41 English parts, 31 German parts, complete sequential indices, minimum word counts, and preserved source text.
- English reader should load its manifest, validate the correct part and word count, offer browser voice/pause/autoturn, and preserve bookmarks; German reader should expose a read-only local German text with a section picker and its own bookmarks.
- The static reader scripts can be syntax checked without a browser; separately verify live deployment, images, and narration in Edge/Chrome when practical.
