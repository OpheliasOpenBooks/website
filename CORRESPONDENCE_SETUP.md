# Ophelia’s Open Book — Victorian Correspondence Setup

The public pages are already committed to the GitHub Pages site:
- `correspondence.html`: Victorian public literary messages and replies
- `editor-desk.html`: private corrections and editor reports
- `editors-inbox.html`: password-protected moderator interface
- `public/js/ophelia-correspondence.js`: static browser client
- `public/correspondence-config.js`: **public config** (Worker URL and public Turnstile *sitekey* only)

**Safety rule:** The website will NOT accept messages until the API URL, Turnstile sitekey, and backend have been connected. This prevents lost letters or accidentally public editorial reports. No editor report is ever returned by the public API.

## One-time free-tier Cloudflare setup (requires the site owner's Cloudflare account)

1. Sign in at https://dash.cloudflare.com/ (you can use the free tier). Install Node.js and run these commands on your own computer or in a trusted authenticated Cloudflare terminal:

   ```sh
   npm install --no-save wrangler
   npx wrangler login
   npx wrangler d1 create ophelia-correspondence
   ```

2. Copy the resulting **D1 database ID** into `correspondence-worker/wrangler.jsonc`, replacing the placeholder `REPLACE_WITH_YOUR_D1_DATABASE_ID`. Then, from the repository root:

   ```sh
   npx wrangler d1 execute ophelia-correspondence --remote --file=./correspondence-worker/schema.sql --config ./correspondence-worker/wrangler.jsonc
   ```

3. In Cloudflare Turnstile, create a FREE managed widget for hostname `opheliasopenbooks.github.io`. You receive a public **sitekey** and a private **secret**. The secret must NEVER be in GitHub or a webpage. Turnstile requires server-side Siteverify; this Worker implements that.

4. Add three PRIVATE Worker secrets using commands in the `correspondence-worker` directory. Each prompts locally for the value (do not paste your secrets into a chat):

   ```sh
   cd correspondence-worker
   npx wrangler secret put TURNSTILE_SECRET
   npx wrangler secret put ADMIN_KEY
   npx wrangler secret put RATE_SALT
   ```

   Set `TURNSTILE_SECRET` to the Turnstile secret. Generate a separate random, unguessable `ADMIN_KEY` (at least 32 characters) for the private moderator. Generate a different long random `RATE_SALT`. Save the administrator key securely in your password manager. **Do not use the same value for both.**

5. Deploy from the `correspondence-worker` directory:

   ```sh
   npx wrangler deploy
   ```

   Cloudflare will provide a URL resembling `https://ophelia-correspondence.YOUR-ACCOUNT.workers.dev`. Open `/api/health`; a configured service replies `{"ready":true}`. The `workers.dev` host is a placeholder example, not a verified URL.

6. In the GitHub repo file `public/correspondence-config.js`, enter:
   - `apiBase`: **your actual HTTPS Cloudflare Worker URL**, no trailing slash
   - `turnstileSiteKey`: the **public** Turnstile sitekey

   Commit. GitHub Pages will then make the public and private forms interactive. **Never put `ADMIN_KEY`, `RATE_SALT`, `TURNSTILE_SECRET`, or other secret values in this file.**

7. Test in this order: (a) editorial letter is accepted, (b) it is visible ONLY under `editors-inbox.html` after unlocking with `ADMIN_KEY`, (c) public letter is initially *pending*, (d) approve it in the inbox and confirm it displays on `correspondence.html`, (e) vulgar submission is rejected, and (f) public flagging removes an item after repeated flags until a moderator reviews it.

## Moderation and privacy

- The public board and editor reports use distinct database `kind` values.
- No message is posted publicly without **your approval**. Clear vulgarities are rejected on the server before storage; links, email addresses, and suspected spam are rejected from public letters. This is a practical starter filter, not an exhaustive language-understanding system. Read and approve all new public letters; automated filters cannot recognize every evasion or literary context.
- Editor reports are private; quoted historical language in such reports is permitted, to allow proper proofreading.
- Public replies require an approved parent letter.
- Reports to the editor never require email or a user account. The only identifying information requested is an optional pen name. We do not store raw IP addresses: rate limits use daily HMAC hashes.
- Private inbox login is handled by the Worker. A frontend-only passcode or a hidden URL alone would *not* be secure.
- The site uses `textContent` to render messages, not raw HTML, to protect against script injection.
- Cloudflare’s privacy terms and normal infrastructure logs still apply. Do not ask visitors to include personal details. Protect the admin key as you would a password.
- Archive/close a resolved editor report, and reject/delete inappropriate public messages as needed.

## Development

Run `node tests/correspondence.test.cjs` from the repo root to check message validation. The worker uses native module syntax and Cloudflare D1; deployment/integration require a real Cloudflare account and binding.

This feature has been intentionally designed for zero-cost startup. Cloudflare Workers, D1 and Turnstile offer free tiers subject to provider limits and terms; review those in your dashboard.
