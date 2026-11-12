# Don Quixote — source and rights record

## Work
- **Author:** Miguel de Cervantes Saavedra (1547–1616)
- **Original:** *El ingenioso hidalgo don Quijote de la Mancha*, Part I (1605); *Segunda parte del ingenioso caballero don Quijote de la Mancha*, Part II (1615)
- **Translation:** John Ormsby (1885), public domain in the United States
- **Text and rights source:** [Project Gutenberg #996](https://www.gutenberg.org/ebooks/996), its [Part I edition #5921](https://www.gutenberg.org/ebooks/5921), and [Part II edition #5946](https://www.gutenberg.org/ebooks/5946)
- **GitHub text source:** GITenberg editions of Project Gutenberg files #5903–#5920 (Part I) and #5922–#5945 (Part II).

## Website files
- Reader: `don-quixote.html`
- Text: `public/books/don-quixote-ormsby-1.txt` through `don-quixote-ormsby-4.txt`
- Four local text files cover the translator's preface, the original preliminary verse, prefaces and dedications, and all **52 + 74 = 126 chapters**, in order.
- Local text files omit Project Gutenberg technical headers, repeated table-of-contents listings, and end-of-file legal boilerplate; the literary work is retained. Some distributed Gutenberg "Part" files overlap in their chapter coverage; repeated chapter blocks were omitted.
- The reader parses the original roman-numeral chapter headings and checks the exact 52/74 ordered chapter counts before enabling reading and narration.

## Art
- **Work:** Don Quixote's windmill episode, from Part I, Chapter VIII.
- **Illustrator:** Gustave Doré; printmaker Héliodore Pisan; 1863.
- **Source and license:** [Wikimedia Commons — Don Quijote Illustration by Gustave Dore VII.jpg](https://commons.wikimedia.org/wiki/File:Don_Quijote_Illustration_by_Gustave_Dore_VII.jpg), public-domain work.
- This historical illustration is a contemporary-to-19th-century edition depiction, not an original Cervantes-era engraving.
- On the reader page, the illustration is shown with a constrained image height, preserving a book-like composition.

## Reader compatibility
- Shared speech normalization: `public/js/ophelia-narration.js`.
- Literary sharing menu: `public/js/ophelia-share.js`.
- Local-only reading state key: `ophelia-don-quixote-ormsby-1885-alice-voice-v1`.
- The catalog discovers the reader from the homepage book card and maps it to the **Satire** genre.
- Browser read-aloud, automatic page advance, adjustable text and speed, bookmark, and saved place follow the library reader pattern.

## Verification
- Parsed 132 sections: six preliminary sections and 126 chapters.
- Static pagination produced approximately 1,540 digital reading pages at the default paragraph/word grouping.
- Live browser voice output, remote media availability, and deployment status should be checked after publication.
