/* Set both values after the free Cloudflare Worker and Turnstile setup.
 * Do not place any Turnstile SECRET, ADMIN_KEY, API key, or password here.
 * The frontend refuses submissions while unconfigured.
 */
window.OpheliaCorrespondenceConfig=Object.freeze({
  apiBase:"",
  turnstileSiteKey:""
});
