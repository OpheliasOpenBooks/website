# Roman classics — authoritative hosted editions

## The Twelve Caesars (Suetonius)
- First composed in Latin c. AD 121; known as *De vita Caesarum*. Original surviving text comprises twelve biographies, from Julius Caesar through Domitian, and is not a modern historical novel.
- English source: **Alexander Thomson**, first translation 1796, used in the **1883 Gebbie and Co.** edition. This pre-1929 historical translation is public domain in the United States.
- Latin source: the complete surviving Latin text via the **Perseus Digital Library** (PerseusDL/canonical-latinLit, `phi1348.abo011` through `phi1348.abo022`), based on early scholarly editions.
- Both source-language and translation are stored as local JSON parts under `public/books/suetonius/{en,la}/`. English narration, Latin **read only**, with a single catalog card for the English title.
- Art: authentic title page of the 1883 Philadelphia translation, preserved by the U.S. Library of Congress, https://www.loc.gov/item/01010066/. Locally archived as `public/art/suetonius-1883-title-page.jpg`.

## The Annals (Tacitus)
- Original ancient Roman history traditionally spanning 16 books, with extensive *ancient loss*. The surviving portions are **Books I–VI and XI–XVI**. Books VII–X have entirely disappeared; the text is also incomplete in surviving Books V, XI, XVI, and elsewhere. Never label it as a surviving continuous 16-book text or invent the missing events.
- English source: **Alfred John Church and William Jackson Brodribb**, nineteenth-century public-domain translation first published around **1876**.
- Latin source: **Cornelii Taciti Annales**, Charles Dennis Fisher's 1906 Latin edition, as transcribed by Perseus; only the surviving books and passages.
- All surviving original-language Latin and English text are hosted locally at `public/books/annals/{en,la}/`. English uses our established narrated reader; Latin has its own silent reader; both are linked from one catalog title.
- Art: historically genuine frontispiece/title page from Justus Lipsius's **1598 edition of the works of Tacitus**—accurately described as a historical collected-works edition, **not** claimed as the 1876 Church/Brodribb cover. Public-domain image https://commons.wikimedia.org/wiki/File:Lipsius_manuscript.jpg, archived in `public/art/tacitus-1598-lipsius-titlepage.jpg`.

## Public-domain and digital transcription credits
The ancient texts and historical English translations are public domain in the United States. Perseus Digital Library holds digital transcription/editorial data under its repository's **CC BY-SA 4.0** license by default, unless individual files specify otherwise; the import process checks for exceptions and records attribution. Credit: Trustees of Tufts University, Perseus Digital Library, https://github.com/PerseusDL/canonical-latinLit. Reused transcription data are attributed; no modern commentary or copyrighted translation is included.

Original material is strictly reader hosted: source URLs are provenance only, never text-reader dependencies. Source checking fails closed if the expected biographies/books are missing or texts are implausibly small. Reader parts are only navigational divisions and are not abridgments.

## Reader and catalog
- English: `the-twelve-caesars-suetonius.html` and `the-annals-tacitus.html`.
- Read-only originals: `the-twelve-caesars-original-latin.html` and `the-annals-original-latin.html`.
- Original-language links registered in `public/js/ophelia-share.js`, displayed near the top of each English page.
- Only the English titles are listed as books in the public catalog. Historic artwork is locally archived.
