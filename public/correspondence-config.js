/* Public Cloudflare connection, linked to the owner's Workers.dev deployment.
 * This file contains ONLY the non-secret Worker URL and public Turnstile sitekey.
 * Secret credentials live exclusively in Cloudflare's encrypted Worker variables.
 * The frontend checks /api/health and blocks submissions until backend is ready.
 */
window.OpheliaCorrespondenceConfig=Object.freeze({
  apiBase:"https://ophelia-correspondence.dmendoza2030.workers.dev",
  turnstileSiteKey:"0x4AAAAAAGKBztkiP8Hiq4SQ"
});
