# The Interesting Narrative of the Life of Olaudah Equiano, or Gustavus Vassa, the African (1789)

## Work and source
- Author: **Olaudah Equiano**, also known as **Gustavus Vassa**. The text was originally written in **English**, first published in **London in 1789**, and is public domain in the United States.
- Original full title: *The Interesting Narrative of the Life of Olaudah Equiano, or Gustavus Vassa, the African. Written by Himself.*
- Main full-text source: **Project Gutenberg ebook 15399**, https://www.gutenberg.org/ebooks/15399, text `15399.txt` from the public-domain original.
- Source repository: `GITenberg/The-Interesting-Narrative-of-the-Life-of-Olaudah-Equiano-Or-Gustavus-Vassa-The-AfricanWritten__15399`.
- This reader uses the historic text, not a modern adaptation or a selected passage; chapter subdivisions, original narrative, opening dedication to Parliament, subscribers' list, the author's historical table of contents, the Volume II epigraphs, and the final chapter's original footnotes are preserved. The Project Gutenberg distribution header/footer/license are excluded.
- The underlying historical publication comprised **two original volumes**, with chapters I–VI in Volume I and chapters VII–XII in Volume II. The hosted website divides them into **four** parts with three chapters each to reduce reader load. These are **editorial website divisions**, not misrepresented as the original four volumes.
- `public/books/equiano-interesting-narrative-part-1.json`: historic title page, dedication dated March 24 1789, complete list of subscribers, original contents, chapters **1–3**. **20,851** whitespace words.
- `public/books/equiano-interesting-narrative-part-2.json`: chapters **4–6**. **21,907** words.
- `public/books/equiano-interesting-narrative-part-3.json`: original break/epigraph to Volume II, chapters **7–9**. **18,216** words.
- `public/books/equiano-interesting-narrative-part-4.json`: chapters **10–12**, author's conclusion, final original footnotes, historical ending. **21,560** words.
- Total **82,534** whitespace words including original front matter. All 12 original chapters have original chapter summaries, and the chapter sequence is validated.
- `public/books/equiano-interesting-narrative-manifest.json` enumerates chapters and maps them to the four files; `equiano-interesting-narrative.html` supplies English browser/device narration, voice options, standard pause/resume, local bookmarks, and a direct jump menu to all 12 chapters.

## Cover and historical illustration
- The primary illustrated cover is the **authentic 1789 engraved portrait frontispiece of Equiano** from the **British Library**, credited to **W. Dent and D. Orme**. It is not an invented likeness or a modern portrait.
- Source: https://commons.wikimedia.org/wiki/File:Olaudah_Equiano_-_The_interesting_Narrative_of_the_Life_of_Olaudah_Equiano_(1789),_frontispiece_-_BL.jpg
- Original image: https://upload.wikimedia.org/wikipedia/commons/1/10/Olaudah_Equiano_-_The_interesting_Narrative_of_the_Life_of_Olaudah_Equiano_%281789%29%2C_frontispiece_-_BL.jpg
- The Commons file is licensed **CC0** / public domain and its catalog points to the 1789 British Library copy.
- If the Wikimedia-hosted image is temporarily unavailable, the page displays the original historically **inspired** local typography `public/art/equiano-interesting-narrative-cover-fallback.svg`. The fallback is *not* an authentic 1789 title page.
- Note: Another Library of Congress image labelled frontispiece and title page, LCCN 98501896, is catalogued as **1794**, not 1789. Do not label that later image as a first-edition 1789 source. We explicitly chose the British Library's 1789 portrait instead.

## Library integration
- Catalog card in `index.html`: true historical portrait and short literary synopsis centered on Equiano's own story.
- Literary grouping in `catalog.html`: `Autobiography, Abolition & Eighteenth-Century History`.
- Sitemap: `sitemap.xml` has exactly one entry for `equiano-interesting-narrative.html`.
- The historical edition is **already in English**, so there is no separate foreign-language original to link as for Rousseau or Beckford.
- The usual site-wide disclaimer on historical racial language should apply to this book. Modern book description avoids reusing derogatory vocabulary from the source. The hosted text is preserved in its historical wording, without rewriting Equiano's testimony.
- Browser device narration is not prerecorded; published sound requires a live listening check. GitHub repository checks cannot substitute for in-browser audio QA.
