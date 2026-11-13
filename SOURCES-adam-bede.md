# Adam Bede — public-domain source and reader

- Author: George Eliot (Mary Ann Evans), 1859. Original English-language novel.
- Text rights: The original text is public domain in the United States; verified against Project Gutenberg eBook 507: https://www.gutenberg.org/ebooks/507.
- Scope: six books, 55 chapters and epilogue. Reader code checks that chapters I–LV occur sequentially and the epilogue is present, and rejects truncated source files.
- Text source: Project Gutenberg eBook #507, a public-domain English-language transcription. Complete locally hosted text: `public/books/adam-bede-eliot-1859.txt`, downloaded from https://www.gutenberg.org/cache/epub/507/pg507.txt and verified as sequential chapters I–LV, six book divisions and epilogue. Gutenberg distribution boilerplate is removed, not the literary text.
- Historical opening artwork: `public/art/adam-bede-dinah-morris-corbould-1861.jpg`, Edward Henry Corbould, *Dinah Morris Preaching on the Common* (1861), depicting the character from Eliot's novel. Wikimedia Commons public-domain attribution: https://commons.wikimedia.org/wiki/File:Dinah_Morris_preaching_on_the_common_by_Edward_Henry_Corbould.jpg . This is a period painting, not the book's first-edition cover.
- Reader: `adam-bede.html`. Uses `public/js/ophelia-narration.js`, browser speech synthesis, voice/rate controls, auto-turn, saved page, and bookmarks. **No prerecorded third-party audio** is used.
- Catalog: `index.html` bookshelf entry, discovered automatically by `catalog.html`; category Literary Fiction.
- Verification: GitHub import workflow completed successfully; local text checked against current reader parser (55 chapters + epilogue in 57 sections) and scripts passed JavaScript syntax checks. Live browser audio playback has not been tested.
