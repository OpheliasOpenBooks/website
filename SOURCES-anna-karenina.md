# Source record — Anna Karenina, Leo Tolstoy

## Literary and copyright provenance
- Original Russian: Leo Tolstoy (1828–1910), Anna Karenina, first serialized 1875–1877, with the complete first book edition published in Moscow by T. Ris in 1878.
- English reading text: Constance Garnett (1861–1946), first published in 1901; this **1901 translation** is public domain in the United States. It is not a modern copyrighted translation.
- Text consulted: https://standardebooks.org/ebooks/leo-tolstoy/anna-karenina/constance-garnett, based on a carefully proofread and normalized version of Garnett's translation and contributed to the public domain by Standard Ebooks (CC0). Its GitHub source is https://github.com/standardebooks/leo-tolstoy_anna-karenina_constance-garnett .
- Alternative: Project Gutenberg eBook 1399 (the same Garnett translation) at https://www.gutenberg.org/ebooks/1399 and the historical Wikisource index https://en.wikisource.org/wiki/Anna_Karenina_(Garnett).
- This is **not** a scan of a physical 1901 publication; it is a proofread electronic text. Textual typography and spacing may differ from nineteenth-century first printings.

## Structure and integrity
- Preserved all eight original parts, containing 34, 35, 32, 23, 33, 32, 31, and 19 chapters respectively — **239 chapters total**.
- The original opening epigraph 'Vengeance is mine; I will repay.' appears on the title/front-matter page.
- There are fifteen consecutive local JSON files: `public/books/anna-karenina-garnett-1901-01.json` through `public/books/anna-karenina-garnett-1901-15.json`. They contain the original 239 chapter prose transcribed in order, without a modern summary or excerpt substituted for the original.
- Chapter 1 begins 'Happy families are all alike; every unhappy family is unhappy in its own way.'
- The last chapter, Part VIII chapter XIX, preserves Levin's complete final reflection ending with 'it has the positive meaning of goodness, which I have the power to put into it.'
- Programmatic inventory of imported text: **349,947 whitespace-separated words**, excluding the modest original-epigraph and edition-heading front matter; this differs slightly from Standard Ebooks' own word count because punctuation, HTML notes and whitespace are normalized for on-site display.
- The reader produces **1,331 pages** at approximately 330 words a page and includes direct navigation across all 239 chapters.

## Historically accurate illustration
- Original **1878 Russian first book edition title page**, volume I, printed in Moscow by T. Ris; this is not a 1901 English book jacket or a modern illustration.
- Verified public-domain original, 1994 × 3200 pixels, at https://commons.wikimedia.org/wiki/File:AnnaKareninaTitle.jpg .
- Image path: https://upload.wikimedia.org/wikipedia/commons/c/c7/AnnaKareninaTitle.jpg . Wikimedia Commons marks it public domain in the United States, noting possible differences in other countries.
- It is labeled accurately as a **first-edition title page** in the reader and the catalog; cropping is avoided by displaying the image with `object-fit:contain`.

## Site integration
- The individual reader lives at `anna-karenina.html` and uses Ophelia's shared narration engine `public/js/ophelia-narration.js`, adjustable voice, narration speed, text size, playback, automatic page-turn, bookmarks, reading position and evening theme.
- The shared literary share control is inherited from `public/js/ophelia-share.js`.
- The home bookshelf entry in `index.html` is imported by `catalog.html`, categorized as **Russian Literature**, with the stored reading-progress key `ophelia-anna-karenina-garnett-1901-v1`.
- Source-level testing confirmed all 239 chapter counts and ordering, all eight part boundaries, beginning and final passages, JavaScript syntax, and page generation. Live GitHub Pages deployment, device narration quality and remote image loading were not independently tested.