# Ophelia's Open Book — library catalog and sharing

## How the catalog stays current

- `catalog.html` dynamically reads the public home page (`index.html`) and discovers every direct `#books > article.book` listing.
- When adding a work, add an `<article class="book"> ... </article>` entry inside `<section id="books">`, with a cover `<img>`, title `<h3>`, author `.eyebrow`, summary paragraph, and a relative `<a href="book-slug.html">` link.
- The catalog includes new cards **automatically**. Its search indexes titles, authors, descriptions, and genre. The home page displays only the first three as featured items, while still retaining every catalog record in its HTML.
- If the title is not in `genreByPage` in `catalog.html`, it appears under **Classic Literature**. For a more specific category, add one entry in that map for the new reader path. This is optional.
- The catalog's `Newest additions` ordering uses the homepage card order (latest work added last).
- Do not remove hidden cards from the homepage; the catalog depends on them.
- Without JavaScript, the homepage restores its full bookshelf. The catalog needs JavaScript for its interactive search.

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
