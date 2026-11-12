/* Ophelia's Open Book — shared spoken-text preparation.
 * Version 1.1.0. Load before each reader's inline narration code.
 *
 * Normalize only the words sent to speech synthesis: the printed book,
 * headings, pagination, bookmarks and original manuscripts are unchanged.
 * Roman numerals are spoken as numbers in chapter/section/royal contexts,
 * while the ordinary English pronoun "I" remains "I".
 */
(function(root) {
  'use strict';
  const acronyms=new Set([
    'AI','API','ATM','BBC','CEO','CIA','CNN','CPU','DNA','DVD','EU','FBI',
    'FAQ','GPS','HTML','HTTP','HTTPS','ID','ISBN','JPEG','JPG','NASA',
    'NATO','NPR','NYC','OK','PDF','PhD','RNA','SOS','TV','UK','UN',
    'UNESCO','URL','USB','USA','US','UTC','VIP','WHO','WWW','XML'
  ]);
  const commonVowellessWords=new Set(['SH','SHH','SHHH','PST','PSST']);
  const roman=/^(?=[MDCLXVI]+$)M{0,4}(CM|CD|D?C{0,3})(XC|XL|L?X{0,3})(IX|IV|V?I{0,3})$/;
  const capitalizedWord=/\b[A-Z]{2,}(?:['’][A-Z]+)?\b/g;
  const small=['zero','one','two','three','four','five','six','seven','eight','nine',
    'ten','eleven','twelve','thirteen','fourteen','fifteen','sixteen',
    'seventeen','eighteen','nineteen'];
  const tens=['','','twenty','thirty','forty','fifty','sixty','seventy','eighty','ninety'];
  const smallOrdinals=['zeroth','first','second','third','fourth','fifth','sixth',
    'seventh','eighth','ninth','tenth','eleventh','twelfth','thirteenth',
    'fourteenth','fifteenth','sixteenth','seventeenth','eighteenth','nineteenth'];
  const tensOrdinals=['','','twentieth','thirtieth','fortieth','fiftieth',
    'sixtieth','seventieth','eightieth','ninetieth'];
  function romanValue(token){
    if(!roman.test(token))return null;
    const map={I:1,V:5,X:10,L:50,C:100,D:500,M:1000};
    let value=0;
    for(let i=0;i<token.length;i++){
      const n=map[token[i]],next=map[token[i+1]]||0;
      value+=n<next?-n:n;
    }
    return value>0?value:null;
  }
  function cardinal(n){
    if(n<20)return small[n];
    if(n<100)return tens[Math.floor(n/10)]+(n%10?'-'+small[n%10]:'');
    if(n<1000)return small[Math.floor(n/100)]+' hundred'+(n%100?' '+cardinal(n%100):'');
    return cardinal(Math.floor(n/1000))+' thousand'+(n%1000?' '+cardinal(n%1000):'');
  }
  function ordinal(n){
    if(n<20)return smallOrdinals[n];
    if(n<100)return n%10?tens[Math.floor(n/10)]+'-'+smallOrdinals[n%10]:tensOrdinals[Math.floor(n/10)];
    if(n<1000)return n%100?small[Math.floor(n/100)]+' hundred '+ordinal(n%100):small[Math.floor(n/100)]+' hundredth';
    return n%1000?cardinal(Math.floor(n/1000))+' thousand '+ordinal(n%1000):cardinal(Math.floor(n/1000))+' thousandth';
  }
  function cardinalRoman(token){
    const n=romanValue(token);
    return n===null?token:cardinal(n);
  }
  function ordinalRoman(token){
    const n=romanValue(token);
    return n===null?token:'the '+ordinal(n);
  }
  function normalizeForSpeech(value){
    let text=String(value==null?'':value);
    // A label such as "CHAPTER I", "Part II", "Book XXI" or "Section IV".
    // Do not match lowercase "book I": "the book I read" uses a pronoun.
    text=text.replace(/\b((?:CHAPTER|Chapter|BOOK|Book|PART|Part|VOLUME|Volume|VOL\.?|Vol\.?|ACT|Act|SCENE|Scene|SECTION|Section|CANTO|Canto|APPENDIX|Appendix|LETTER|Letter|ARTICLE|Article|PSALM|Psalm)\s+)([MDCLXVI]+)\b/g,
      (whole,prefix,numeral)=>prefix+cardinalRoman(numeral));
    // Wars use cardinal numbers; monarchs' regnal numerals use ordinals.
    text=text.replace(/\b(World War\s+)([MDCLXVI]+)\b/g,
      (whole,prefix,numeral)=>prefix+cardinalRoman(numeral));
    text=text.replace(/\b((?:Henry|Richard|Louis|Edward|Elizabeth|Philip|Charles|George|James|Mary|John|Alfonso|William|Frederick|Pius|Leo|Benedict|Nicholas|Alexander|Victoria)\s+)([MDCLXVI]+)\b/g,
      (whole,prefix,numeral)=>prefix+ordinalRoman(numeral));
    // Numbered headings: "I: ABOUT THIS TRANSLATION" should say "one".
    // Require uppercase heading words after the colon, not "I: I thought…".
    text=text.replace(/\b([MDCLXVI]+)(?=\s*:\s*[A-Z][A-Z\s’'\-]{2,})/g,
      numeral=>cardinalRoman(numeral));
    // Numbered headings with periods, e.g. "IV. THE ADVENTURE".
    text=text.replace(/\b([MDCLXVI]+)(?=\.\s+[A-Z][A-Z\s’'\-]{3,})/g,
      numeral=>cardinalRoman(numeral));
    // Print-era all-cap opening words should not be spelled letter-by-letter.
    return text.replace(capitalizedWord,word=>{
      if(acronyms.has(word)||roman.test(word))return word;
      if(!/[AEIOUY]/.test(word)&&!commonVowellessWords.has(word))return word;
      return word[0]+word.slice(1).toLowerCase();
    });
  }
  root.OpheliaNarration=Object.freeze({version:'1.1.0',normalizeForSpeech});
})(window);
