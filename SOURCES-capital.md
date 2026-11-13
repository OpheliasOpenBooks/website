# Capital: A Critique of Political Economy — Karl Marx

## Library edition and structure
The library contains three separately accessible volumes, preserving the historical English translations, original numbered chapter sequence, prefaces, notes and supplementary matter from the source transcription. No abridged retelling or selected-works edition is substituted.

| Volume | Original publication | Source material | Hosted sections |
| --- | --- | --- | --- |
| I · Production | 1867 (German), 1887 (first English) | Samuel Moore and Edward Aveling, edited by Friedrich Engels | 33 chapters, 7 preface/afterword files, appendix |
| II · Circulation | 1885 (German), 1907 (first English) | Ernest Untermann, edited by Friedrich Engels | 21 chapters, introductory material; source chapter 20 in four original HTML pieces and chapter 21 in two |
| III · Capitalist production as a whole | 1894 (German), early twentieth-century English | Ernest Untermann, edited by Friedrich Engels | 52 chapters, Engels preface and supplement |

## Provenance and rights
The underlying early English translations are in the U.S. public domain. Text was obtained from the public [MARX-EBOOKS repository](https://github.com/MARX-EBOOKS/marx-ebooks.github.io), mirroring the Marxists Internet Archive (MIA) textual transcriptions, with source indexes at:
- https://www.marxists.org/archive/marx/works/1867-c1/
- https://www.marxists.org/archive/marx/works/1885-c2/
- https://www.marxists.org/archive/marx/works/1894-c3/

Transcription, corrections and markup work by MIA contributors are credited on each reading page under Creative Commons Attribution-ShareAlike 2.0 (https://creativecommons.org/licenses/by-sa/2.0/). The local reading-text transformation from these transcriptions follows the same attribution and ShareAlike notice. The historical Karl Marx portrait is by John Jabez Edwin Mayall, public domain: https://commons.wikimedia.org/wiki/File:Karl_Marx_001.jpg.

## Reader implementation
- Pages: `capital-volume-1.html`, `capital-volume-2.html`, and `capital-volume-3.html`.
- Local static text segments: `public/books/capital-volume-{1,2,3}-part-N.json`. Browser loads all segments concurrently on opening each volume, then paginates and verifies the numbered chapters.
- Shared English narration: `public/js/ophelia-narration.js?v=1.2.0`; independent local progress keys per volume; chapter and page menus, bookmarks, auto-turn, text size, reading theme and share control.
- Regression suite: `tests/capital-volumes.test.cjs`, referenced from `.github/workflows/narration-checks.yml`.

## Display considerations
The source is reproduced as linearized text for accessible narration; typographic HTML structure is simplified, and embedded image-only formula graphics in the digital source are not recreated by the text-only converter. Readers seeking exact mathematical typography or diagrams can consult the linked historical facsimiles at the Online Library of Liberty: https://davidmhart.com/liberty/OtherWorks/Marx/Kapital/index.html. This is a presentation limitation, not a deliberate condensation of the textual chapters.

## QA
Verified programmatically: all 106 chapter numbers (33+21+52); 35, 22, and 54 organized reader sections across the volumes; approximately 360k, 217k and 381k words of digitized original prose and notes, respectively. Full live-browser pronunciation and deployment checks remain separate.
