# Ophelia's Open Book — library catalog and sharing

## How the catalog stays current

- `catalog.html` dynamically reads the public home page (`index.html`) and discovers every direct `#books > article.book` listing.
- When adding a work, add an `<article class="book"> ... </article>` entry inside `<section id="books">`, with a cover `<img>`, title `<h3>`, author `.eyebrow`, summary paragraph, and a relative `<a href="book-slug.html">` link.
- The catalog includes new cards **automatically**. Its search indexes titles, authors, descriptions, and genre. The home page displays only the first three as featured items, while still retaining every catalog record in its HTML.
- If the title is not in `genreByPage` in `catalog.html`, it appears under **Classic Literature**. For a more specific category, add one entry in that map for the new reader path. This is optional.
- The catalog's `Newest additions` ordering uses the homepage card order (latest work added last).
- Do not remove hidden cards from the homepage; the catalog depends on them.
- Without JavaScript, the homepage restores its full bookshelf. The catalog needs JavaScript for its interactive search.

## Book-description voice

- In the public library catalog and home-page book cards, write a warm, inviting, **story-first** synopsis about the characters, setting, central conflict, atmosphere, and themes. For essays or nonfiction, describe the ideas and questions the work explores.
- Aim for one or two charming, readable sentences that make someone want to open the book, without spoiling the ending. Match the restrained literary tone of the earlier Ophelia’s catalog cards.
- **Do not** clutter promotional summaries with “complete,” “unabridged,” chapter counts, publication/translation metadata, audiobook features, bookmarks, saved progress, artwork credits, or implementation details.
- Preserve verified edition, rights, source, and completeness information in the reader's edition notes and `SOURCES-<title>.md` documentation, rather than in the public-facing story blurb.

## Share buttons

- Include `<script defer src="public/js/ophelia-share.js"></script>` on every book reader. The script automatically inserts a **Share this book** button near `.book-heading`.
- On `index.html` and `catalog.html`, the same shared script offers **Share this library**.
- Inside the catalog, each book card also has a **Share** button that passes that book's individual URL to `window.OpheliaShare.open({title, url})`.
- Sharing options include the browser/device's native share sheet when supported, copy link, Facebook, X, Bluesky, Threads, Pinterest, Reddit, LinkedIn, WhatsApp, Telegram, Tumblr, Mastodon, email and SMS. These options only open share composers and require reader confirmation.
- No tracking SDK or network script is loaded for social media. The browser only contacts a platform after the visitor chooses it.
- The native share sheet requires compatible browsers and HTTPS. Some apps have no supported generic link-sharing endpoint; visitors can copy the link and share it in those apps.

## Don't change the book readers' core behaviors

- Keep the public-domain original book text and reading progress keys unchanged.
- Preserve `public/js/ophelia-narration.js` in new reader templates, as documented in `NARRATION_STANDARD.md`.
- For a new reader, use `pygmalion.html`, `oedipus-rex.html`, or another recently updated book as a template to retain both narration and sharing.

## Verify after every addition

1. Book is visible in `catalog.html` without manual card duplication.
2. Search finds the book by title and author; alphabetical sorting remains correct.
3. Open the book and test its Share button and Copy Link.
4. Read aloud, auto-turn, and bookmarks work; revisiting resumes the correct page.
5. Original source and cover art rights are documented.

## Editorial standard for unabridged books

Every new title added to Ophelia's Open Book must be **the complete, unabridged public-domain work** in the United States, not an excerpt, condensed adaptation, paraphrase, or modernized retelling. Choose the most trustworthy available edition and confirm that the exact translation/edition is also in the public domain before hosting it. Honor original prefaces, forewords, book divisions, chapters, epilogues, and appendices when present.

- Before publishing, independently verify the source's expected number of books, chapters, or named sections. Flag historical variant editions and disclose exactly which is used.
- Credit the original author, title, year of the original publication, translator/editor, translation date, text transcription source, and any differences in historical material.
- Keep Hugo's or any other author's prose intact. Changes to punctuation, transcription errors, clear scanning artifacts, or navigation headings should be minimal and documented in a `SOURCES-<title>.md` file. Do not silently shorten prose, drop chapters, or replace the novel with a summary.
- Prefer authentic historical public-domain illustrations from the edition or period. Credit artist, year, hosting institution, and public-domain evidence; keep original cover images proportionate in the reader and catalog. If no suitable verified artwork exists, explain and use original artwork with a clear description of its provenance.
- Preserve the shared narration normalizer, natural chapter names with spoken Arabic-number labels for Roman-numeral headings, bookmarks, saved position, adjustable speech, and literary sharing.
- Always add a direct home bookshelf entry so the catalog discovers the new book, and verify links after deploying. Do not claim live audio or image testing until actually performed.
- **Existing titles have not been comprehensively audited for unabridged status.** Do not make a blanket completeness claim without checking each one.



## Pink ribbon: editorial approval gate (2026-11-26)

- All newly proposed or unedited works must remain in the editorial queue with status `needs_editing` and a pink **Needs editing** ribbon. The catalog may display title-only notices in its separate Awaiting the Editor’s Review section; these are not reading-library entries.
- Do not publish draft reader HTML, draft text, audio, share links, or assets containing draft prose on the public website or public GitHub repository. A hidden page, unlisted URL, robots rule, or CSS-hidden card is not access control. Keep actual editing copies on the editor’s device or in a genuinely private workspace.
- Do not register a new work in `index.html#books`, the catalog fallback, or sitemap, or enable an auto-publishing importer before the owner explicitly approves the edited edition for public release. Source validation alone does not constitute editorial approval.
- After explicit approval, verify the exact edition, source completeness, narration and book links; then publish and remove its pink ribbon from the queue. Do not remove existing published works without identifying the specific title and obtaining the editor’s direction.
- Beeton queue: `editorial/samuel-beeton-review.json` contains only non-sensitive title/status metadata. All entries are unapproved. The earlier automatic Beeton importer is retired.


## Historical Magazine Library

The separate `magazines.html` catalog is part of the same Ophelia website and app, not a separate app or duplicated book library. Editorial title metadata lives in `editorial/magazine-review.json`. Organize approved periodicals by title, year, volume and issue. Each individual issue or bound volume requires completeness, source and public-domain verification (including artwork) and explicit owner approval before public reading or listening is enabled. Preserve original plates, advertisements and literary contents where available. Unapproved issue text, scans, audio and draft reader files must never be committed to the public repository or deployed to GitHub Pages. A pink ribbon on a periodical title is a notice of preparation, not a claim that its volumes have been acquired. Keep metadata, public notices and private drafts distinct. Do not duplicate periodicals in the main book catalog.
