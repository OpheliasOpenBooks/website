# The Sorrows of Young Werther / Die Leiden des jungen Werther — Goethe (1774)

## Rights and editorial identity
- Johann Wolfgang von Goethe (1749–1832), first published at Leipzig in **1774**, Germany; wholly in the U.S. public domain.
- Original German text is in two books, and the text hosted here is copied from the original-language Project Gutenberg transcriptions **#2407** (Erstes Buch) and **#2408** (Zweites Buch). The source itself identifies its textual edition as **Hamburger Ausgabe, Band 6**. That editorial copy is **not represented as an exact 1774 first-edition transcription**; Goethe's text also has an important 1787 revised version, and the edition notice is kept transparent.
- English translation: **R. D. Boylan**, published long before 1931, Project Gutenberg **#2527**; transcribed edition identifies **Nathen Haskell Dole** as editor. This is **not** the 1774 German original nor a modern copyrighted translation.
- No LibriVox/pre-recorded audio. The English edition alone uses Ophelia's original browser/device speech functions, while German is **read-only** (no speech integration).

## Local texts and verification
- English JSON `public/books/the-sorrows-of-young-werther-boylan-2527.json`. Created from https://github.com/GITenberg/The-Sorrows-of-Young-Werther_2527/blob/master/2527.txt . Has 87 sections: Preface, Book I, Book II, 83 letter/date sections and the Editor to the Reader (including the original conclusion). About 42,297 words including section labels; final narrative text ends “No priest attended.” Original date/order, R. D. Boylan's wording and source paragraph breaks preserved (source hard line-wraps joined).
- German JSON `public/books/die-leiden-des-jungen-werther-original-deutsch.json`, from https://github.com/GITenberg/Die-Leiden-des-jungen-Werther---Band-1_2407/blob/master/2407-8.txt and https://github.com/GITenberg/Die-Leiden-des-jungen-Werther---Band-2_2408/blob/master/2408-8.txt . Has 87 sections: metadata front, first book, second book, 83 dated letters and the final editor's report; approximately 38,536 words including metadata/section labels, ending “Kein Geistlicher hat ihn begleitet.” The original “Junius”/“Julius” dates and original German orthography are retained. Gutenberg distribution boilerplate removed; hard line breaks joined. Very long paragraphs are divided at whitespace for page layout only, without changing word order.
- English source https://www.gutenberg.org/ebooks/2527 ; German books https://www.gutenberg.org/ebooks/2407 and https://www.gutenberg.org/ebooks/2408 .
- The English and German texts are complete works, but should not be assumed to derive from the exact same historical recension without further critical-edition comparison.

## First edition title-page art
- Genuine Leipzig **1774 first-printing** German title pages of Goethe's Die Leiden des jungen Werthers, engraved motif attributed to Adam Friedrich Oeser. Photograph © H.-P. Haack under **CC BY 3.0**, not itself public domain even though the printed work is historic.
- Source https://commons.wikimedia.org/wiki/File:-1-_Die_Leiden_des_jungen_Werthers._Erstdruck.jpg ; image served as https://commons.wikimedia.org/wiki/Special:FilePath/-1-_Die_Leiden_des_jungen_Werthers._Erstdruck.jpg .
- Cite author (photographer), first-printing date, Commons source and license link https://creativecommons.org/licenses/by/3.0/ on both reader pages. The photo is not the binding or cover of the later Boylan English translation.

## Website integration
- English narrated reader: `the-sorrows-of-young-werther.html` · local JSON fetch, shared `public/js/ophelia-narration.js`, complete reader navigation, bookmarks, resume and night mode.
- German read-only reader: `die-leiden-des-jungen-werther-original-deutsch.html` · local JSON fetch, original text without translation or TTS, bookmarks, night mode, font sizing and part/letter navigation. Correct `lang="de"`, `translate="no"`.
- Homepage card in `index.html`, catalog's `originalByPage` pointing to the German **local reader**, genre German Literature & Romanticism, reader page original-language panel in `public/js/ophelia-share.js`, and sitemap.
- Static source and JavaScript verification cannot fully prove live deployment, artwork HTTP response, or device-specific audio.
