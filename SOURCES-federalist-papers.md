# The Federalist Papers / The Federalist — Alexander Hamilton, James Madison and John Jay

## Historical work
- A complete collection of **85 essays**, first published in New York newspapers under the joint pseudonym **Publius** between October 1787 and May 1788, arguing in favor of ratification of the proposed U.S. Constitution.
- All three writers are long deceased and the original English essays are in the **U.S. public domain**. English is the original language, so **no parallel original-language reader is needed**.
- The 1788 first book edition was published in two volumes by J. and A. McLean (variously spelled M'Lean). See the [Library of Congress guide to the essays](https://guides.loc.gov/federalist-papers) and [LoC first-edition catalog record](https://www.loc.gov/item/09021562/). The 1788 bound volume contains the essays numbered as they are in this hosted edition.

## Text and completeness
- Source edition: [Standard Ebooks, The Federalist Papers](https://standardebooks.org/ebooks/alexander-hamilton_john-jay_james-madison/the-federalist-papers). Text comes from the repository [standardebooks/alexander-hamilton_john-jay_james-madison_the-federalist-papers](https://github.com/standardebooks/alexander-hamilton_john-jay_james-madison_the-federalist-papers), specifically `src/epub/text/chapter-1.xhtml` to `chapter-85.xhtml`, plus `introduction.xhtml`, `preface.xhtml` and `endnotes.xhtml`.
- Corroborating public-domain text: [Project Gutenberg ebook 1404](https://www.gutenberg.org/ebooks/1404); [Library of Congress complete full text](https://guides.loc.gov/federalist-papers/full-text).
- The historical introduction by **Henry B. Dawson** and the textual preface by **Henry Cabot Lodge (1886)** are retained at the front of the first reader part. The edition's **77 endnotes** are preserved at the end of the fifth part. Original numbered references (1–77) remain in their corresponding essays in brackets, and the notes appear at the end of the collection.
- Each of the **85** essays is a separately selectable section with its original numbered heading, subject subtitle and historical editorial publication byline; each retains the collective signature *Publius*. Author attribution in the byline follows the historical edition; some authorship attributions have been debated by scholars, so they are not presented as original signed bylines.
- The essays are stored in **five editorial reading parts**, **17 essays each**, to keep memory and page rendering manageable. These are modern website divisions for navigation, **not** the two original book volumes of 1788.
- Hosted data:
  - `public/books/federalist-papers-part-1.json`: introduction, historical preface, essays **1–17**; **38,963** words.
  - `public/books/federalist-papers-part-2.json`: essays **18–34**; **33,680** words.
  - `public/books/federalist-papers-part-3.json`: essays **35–51**; **43,561** words.
  - `public/books/federalist-papers-part-4.json`: essays **52–68**; **34,931** words.
  - `public/books/federalist-papers-part-5.json`: essays **69–85**, all **77 endnotes**; **45,471** words.
  - Total **196,606** whitespace-delimited words, including introductions, essay headings and notes; word count is not a claim about an 1788 print edition.
- Manifest: `public/books/federalist-papers-manifest.json` indexes all 85 essays by number, subject and editor-attributed author and maps their five local JSON files. English reader: `federalist-papers.html`, offering normal browsing, chapter selection **and a global jump menu to any numbered essay (1–85)**.

## Historical cover
- The default image is **an actual public-domain 1788 first-edition title page from Volume I** of *The Federalist*, in the **Library of Congress** collection. Wikimedia Commons page: https://commons.wikimedia.org/wiki/File:The_Federalist_(1st_ed,_1788,_vol_I,_title_page).jpg
- Direct original image hosted by Wikimedia Commons: https://upload.wikimedia.org/wikipedia/commons/1/12/The_Federalist_%281st_ed%2C_1788%2C_vol_I%2C_title_page%29.jpg
- If an external archival image temporarily fails, a distinctly **historically inspired** local typographic fallback is loaded from `public/art/federalist-papers-titlepage-fallback.svg`. That illustration is not labelled as an actual 1788 book.
- This is a historical *title page*, not a modern jacket cover, since the collected 1788 printing predates contemporary illustrated book-jacket conventions.

## Reader and catalog
- Reader: `federalist-papers.html` uses the same English narration system as other Ophelia pages, including browser/device voices, pause/resume, auto-turn and bookmarks. Audio is generated rather than prerecorded.
- Direct essay navigation takes readers from any of the five local parts to one of all 85 essays; the part selector and section selector remain available for browsing the contemporary introductions and notes.
- The reader script checks **exactly 17 sequential essays per part**, preserved historical introductions and endnotes, and minimum content word counts. The manifest verifies the 85-number index and source files.
- The home catalog card is in `index.html`, genre is in `catalog.html` as *American Founding & Political Thought*, and the reader URL is in `sitemap.xml`.
- Actual narration sound and GitHub Pages external archival image load should be verified in a live browser; repository checks alone cannot verify browser voices or user-device behavior.
