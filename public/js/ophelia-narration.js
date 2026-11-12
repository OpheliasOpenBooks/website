/* Ophelia's Open Books — shared spoken-text preparation.
 * Version 1.0.0. Include before each reader's inline narration code:
 * <script src="public/js/ophelia-narration.js"></script>
 *
 * Print-era capitalization often marks an opening word ("IN", "WELL",
 * "YOU") in full capitals. Some browser voices spell these as initials.
 * Normalize case only for speech. Never alter the displayed manuscript,
 * chapter labels, bookmarks, voice selection, or punctuation.
 */
(function (root) {
  'use strict';
  const acronyms = new Set([
    'AI','API','ATM','BBC','CEO','CIA','CNN','CPU','DNA','DVD','EU','FBI',
    'FAQ','GPS','HTML','HTTP','HTTPS','ID','ISBN','JPEG','JPG','NASA',
    'NATO','NPR','NYC','OK','PDF','PhD','RNA','SOS','TV','UK','UN',
    'UNESCO','URL','USB','USA','US','UTC','VIP','WHO','WWW','XML'
  ]);
  // Roman numerals should not become ordinary words: Richard III, Louis XVI.
  const roman = /^(?=[MDCLXVI]+$)M{0,4}(CM|CD|D?C{0,3})(XC|XL|L?X{0,3})(IX|IV|V?I{0,3})$/;
  const capitalizedWord = /\b[A-Z]{2,}(?:['’][A-Z]+)?\b/g;
  function normalizeForSpeech(value) {
    return String(value == null ? '' : value).replace(capitalizedWord, word => {
      if (acronyms.has(word) || roman.test(word)) return word;
      // Keep vowel-less initialisms such as BBC intact unless they are
      // recognizable printed words; the real words are listed here.
      const commonVowellessWords = new Set(['SH','SHH','SHHH','PST','PSST']);
      if (!/[AEIOUY]/.test(word) && !commonVowellessWords.has(word)) return word;
      return word[0] + word.slice(1).toLowerCase();
    });
  }
  root.OpheliaNarration = Object.freeze({version:'1.0.0',normalizeForSpeech});
})(window);
