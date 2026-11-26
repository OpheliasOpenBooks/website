/* Ophelia's Open Book — shared spoken-text preparation.
 * Version 1.4.27. Load before each reader's inline narration code.
 *
 * Normalize only the words sent to speech synthesis: the printed book,
 * headings, pagination, bookmarks and original manuscripts are unchanged.
 * Roman numerals are spoken as numbers in chapter/section/royal contexts,
 * while the ordinary English pronoun "I" remains "I".
 */
(function(root) {
  'use strict';
  // Book-reader UX: remove the floating Home pill on every book page.
  // The catalog remains reachable through normal site navigation.
  function removeFloatingHome(){
    document.querySelectorAll('a.home').forEach(link=>link.remove());
  }
  removeFloatingHome();
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',removeFloatingHome,{once:true});
  const acronyms=new Set([
    'AI','API','ATM','BBC','CEO','CIA','CNN','CPU','DNA','DVD','EU','FBI',
    'FAQ','GPS','HTML','HTTP','HTTPS','ID','ISBN','JPEG','JPG','NASA',
    'NATO','NPR','NYC','OK','PDF','PhD','RNA','SOS','TV','UK','UN',
    'UNESCO','URL','USB','USA','US','UTC','VIP','WHO','WWW','XML'
  ]);
  const commonVowellessWords=new Set(['SH','SHH','SHHH','PST','PSST']);
  // Internal narration-only cue for Van Helsing's sustained, voiceless hiss.
  // It is never written into the book text or read aloud as letters.
  const HISS_MARKER='\uE320';
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
  // Read pre-decimal British currency aloud. Project Gutenberg sometimes
  // transcribes the printed pound sign as "L" (L1 = £1); s is shillings
  // and d is pence. Never change the displayed historical source.
  function preDecimalMoney(value){
    const unit=(raw,kind)=>{
      const n=Number(raw),spoken=cardinal(n);
      if(kind==='pound')return spoken+(n===1?' pound':' pounds');
      if(kind==='shilling')return spoken+(n===1?' shilling':' shillings');
      return spoken+(n===1?' penny':' pence');
    };
    const combine=(p,s,d)=>{
      const parts=[];
      if(p!==undefined)parts.push(unit(p,'pound'));
      if(s!==undefined)parts.push(unit(s,'shilling'));
      if(d!==undefined)parts.push(unit(d,'penny'));
      return parts.length===3?parts[0]+', '+parts[1]+' and '+parts[2]:
        parts.length===2?parts.join(' and '):parts[0];
    };
    let text=value;
    // "L1 17s. 9d" => "one pound, seventeen shillings and nine pence".
    // Guard against decimal notation and labels such as "L1a".
    text=text.replace(/(?:£|\bL)\s*(\d{1,6})(?:\s+(\d{1,4})s\.?)?(?:\s+(\d{1,3})d\.?)?(?![A-Za-z0-9]|\.\d)/g,
      (whole,p,s,d)=>{
        const phrase=combine(p,s,d);
        return phrase+(whole.endsWith('.')?'.':'');
      });
    // A shilling-and-pence sum without pounds, e.g. "17s. 9d".
    text=text.replace(/\b(\d{1,4})s\.?(?:\s+(\d{1,3})d\.?)?(?![A-Za-z0-9]|\.\d)/g,
      (whole,s,d)=>combine(undefined,s,d)+(whole.endsWith('.')?'.':''));
    text=text.replace(/\b(\d{1,3})d\.?(?![A-Za-z0-9]|\.\d)/g,
      (whole,d)=>combine(undefined,undefined,d)+(whole.endsWith('.')?'.':''));
    return text;
  }

  // Library-wide narration filter (prose, plays, poetry, and scholarly works).
  // Do NOT rewrite the displayed source: strip editorial note references only
  // from the string passed to speech synthesis. Preserve meaningful bracketed
  // stage directions ("[Enter Hamlet]"), verse text, and ordinary numbers.
  function removeFootnoteMarkersForSpeech(value){
    let text=String(value==null?'':value);
    // Every purely numeric bracketed reference, including four-digit or
    // longer markers, ranges, lists and optional labels: [1], [1082],
    // [12, 13], [2–4], [Note 43], [Footnote #157]. The user specifically
    // requests that even bracketed numbers resembling dates not be spoken.
    text=text.replace(/\[\s*(?:(?:footnote|note|fn\.?|ref(?:erence)?\.?)\s*(?:no\.?\s*)?)?#?\s*\d+(?:\s*(?:,|;|[-–—])\s*\d+)*\s*\]/gi,'');
    // Markup-like note cues should be silent; preserve the actual note text
    // when it is provided as an editorial inline annotation.
    text=text.replace(/\[(?:footnote|note)\s+\d+\s*:\s*([^\]\r\n]+)\]/gi,'$1');
    text=text.replace(/\[\s*(?:[*†‡§¶‖⁂]|[*†‡§¶‖⁂]\s*[,;]\s*[*†‡§¶‖⁂])+\s*\]/gu,'');
    text=text.replace(/<sup\b[^>]*>\s*(?:\[?\s*(?:\d+|[*†‡§¶‖⁂])\s*\]?)\s*<\/sup>/gi,'');
    // Common export formats: reference^12, reference^{12}, reference{12},
    // reference[^12], reference(12), reference⁽¹²⁾.
    text=text.replace(/\[\^\s*\d+\s*\]/g,'');
    text=text.replace(/([\p{L}\p{N}.,;:!?'”’)\]])\s*\^\{?\d+\}?(?=\s|[.,;:!?'”’)\]]|$)/gu,'$1');
    text=text.replace(/([\p{L}\p{N}.,;:!?'”’)\]])\{\d+\}(?=\s|[.,;:!?'”’)\]]|$)/gu,'$1');
    text=text.replace(/⁽[⁰¹²³⁴⁵⁶⁷⁸⁹]+⁾/gu,'');
    // Superscript note numbers. Do not alter mathematical m² or x³.
    text=text.replace(/\b([A-Za-z]+)([⁰¹²³⁴⁵⁶⁷⁸⁹]+)(?=\s|[.,;:!?'”’)\]]|$)/gu,
      (whole,word)=>/^(?:m|cm|mm|km|ft|in|yd|mi|x|y|z)$/i.test(word)?whole:word);
    text=text.replace(/([.!?;:,)"'’”])([⁰¹²³⁴⁵⁶⁷⁸⁹]+)(?=\s|[.,;:!?'”’)\]]|$)/gu,'$1');
    text=text.replace(/([A-Za-z]["'’”.,;:!?]?)[ \t]*\(\d+\)(?=\s|[.,;:!?'”’)\]]|$)/g,'$1');
    text=text.replace(/([A-Za-z]["'’”]?[.!?;:,])(\d+)(?=\s|$)/g,'$1');
    // Symbol-only footnote markers (not meaningful dramatic punctuation).
    // Strip dagger/double-dagger, section/paragraph note signs, and asterisks
    // attached to an actual word/punctuation or isolated as ornamentation.
    // Protect mathematical expressions such as "2 * 3".
    text=text.replace(/([\p{L}\p{N}.,;:!?'”’)\]])[†‡‖⁂]+(?=\s|[.,;:!?'”’)\]]|$)/gu,'$1');
    text=text.replace(/([\p{L}.,;:!?'”’)\]])[ \t]*[*†‡‖⁂]+(?=\s|[.,;:!?'”’)\]]|$)/gu,'$1');
    text=text.replace(/(^|\s)[†‡‖⁂]+(?=\s|$)/gu,'$1');
    text=text.replace(/(^|\s)\*+(?=\s|$)/g,(match,leading,offset,all)=>{const before=all.slice(0,offset).trimEnd(),after=all.slice(offset+match.length).trimStart();return /\d$/.test(before)&&/^\d/.test(after)?match:leading;});
    return text.replace(/[ \t]{2,}/g,' ').replace(/[ \t]+(?=[,.!?;:])/g,'').trimEnd();
  }

  function normalizeForSpeech(value){
    let text=removeFootnoteMarkersForSpeech(value);
    // Expand plural military rank without changing the printed text.
    text=text.replace(/\bGens\./gi,'Generals');
    // Keep compound military ranks together in narration.
    text=text.replace(/\b(?:Lieut|Lt)\.\s*Col\./gi,'Lieutenant Colonel');
    // Read the historical courtesy title in full, without changing print.
    text=text.replace(/\bEsq\.(?=\s|[,;:!?\)\]”’"']|$)/gi,'Esquire');
    // Expand historical Latin abbreviation in speech only; retain printed text.
    text=text.replace(/\bviz\.(?:\s*[:,])?/gi,word=>word[0]==='V'?'Namely,':'namely,');
    // Sleepy Hollow: the reader pronounces "Ichabod" as requested ("Eakabod").
    // This changes speech only; Irving's original spelling stays visible.
    // Constrain the cue to this book so other titles are unaffected.
    if(/(?:^|\/)the-legend-of-sleepy-hollow\.html$/i.test(root.location?.pathname||'')){
      text=text.replace(/\bIchabod\b/gi,'Eakabod');
    }

    // Jane Eyre: Brontë spells the creature "Sphynx".
    // Voice-only phonetics: Sphynx => "Sfinx" (including "sphynx-like").
    // Keep original orthography in the book and do not affect other titles.
    if(/(?:^|\/)jane-eyre\.html$/i.test(root.location?.pathname||'')){
      text=text.replace(/\bSphynx\b/gi,word=>word[0]===word[0].toUpperCase()?'Sfinx':'sfinx');
    }

    // Across the library, the address "ma'am" is one syllable, rhyming
    // with "Pam" (/mæm/), not "may-am" or two separate syllables.
    // Only the speech copy changes; preserve straight/curly apostrophes
    // and the author's spelling in the displayed original.
    text=text.replace(/\bma['’]am\b/gi, word=>word[0]==='M'?'Mam':'mam');
    // Huckleberry Finn, Chapter IV, page 25: voice-only guidance for
    // Jim's Southern dialect. Do not alter Twain's displayed original text.
    text=text.replace(/\bYo['’]?\s+ole\s+father\s+doan['’]\s+know\s+yit\s+what\s+he['’]s\s+a-gwyne\s+to\s+do\b/gi,
      'Yo ol father dun know wit what he\'s a gonna to do');
    // Huckleberry Finn, Chapter V (page 28): spoken "git" needs the
    // extended /ee/ vowel requested for this dialect, not short "get".
    // Pap means "get that money to me"; articulate his demand naturally.
    // Limit this to Huck's narration; never rewrite any printed book text.
    if(/(?:^|\/)huckleberry-finn\.html$/i.test(root.location?.pathname||'')){
      text=text.replace(/\bYou git me that money to-morrow\b/gi,
        'You geet that money to me tomorrow');
      text=text.replace(/\bgit\b/gi,
        word=>word[0]==='G'?'Geet':'geet');
    }
    // Huckleberry Finn, Chapter IV, page 25: Jim's hair-ball fortune.
    // Pronounce Twain's Southern dialect in speech only. Limit these
    // phonetic cues to this fortune, not unrelated dialogue or other books.
    text=text.replace(/Dey['’]s\s+two\s+angels\b[\s\S]*?\bOne\s+is\s+rich\s+en\s+t['’]other\s+is\s+po['’]\./gi,
      passage=>passage
        .replace(/\bhoverin['’]?(?=\s|[.,;:!?]|$)/gi,'huverin')
        .replace(/\buv\b/gi,'of')
        .replace(/\ben\b/gi,'and')
        .replace(/\bden\b/gi,'then')
        .replace(/\bde\b/gi,word=>word[0]==='D'?'The':'the')
        .replace(/\bDey['’]s\b/gi,"They's")
        .replace(/\byit\b/gi,'yet')
        .replace(/\bgwyne\b/gi,'gwine'));
    // Spanish literary name: Don Quixote / Don Quijote is pronounced
    // approximately "Don kee-HOH-teh" (Spanish /don kiˈxote/).
    // Speech-only phonetics; printed titles and manuscript remain unchanged.
    text=text.replace(/\bDon[ \t]+(?:Quixote|Quijote)\b/gi,'Don Kee-hoh-teh');
    // Huckleberry Finn, Chapter IV, page 21: the ability to "spell and
    // read and write" uses present-tense /reed/, not past-tense /red/.
    // Spell only the spoken copy "reed"; preserve Twain's printed "read".
    text=text.replace(/\b(could\s+spell\s+and\s+)read(?=\s+and\s+write\b)/gi,
      (_,lead)=>lead+'reed');
    // Huckleberry Finn, Chapter I: "the book winds up" means "concludes".
    // Browser voices sometimes read "winds" like the outdoor breeze.
    // A narration-only long-i spelling forces the sound of "winding up".
    // The original printed words and manuscript remain unchanged.
    text=text.replace(/\b(the book )winds(?= up is this\b)/gi,
      (_,lead)=>lead+'wineds');
    // Dracula XVI: "a keen \"S-s-s-s!\"" is ONE extended sibilant /s/,
    // not four separately pronounced letter names. Keep the printed
    // punctuation and spelling; insert a sound cue only into narration.
    text=text.replace(/\b(a keen)\s+["“]S(?:-s){3,}!["”]/g,
      (_,lead)=>lead+' '+HISS_MARKER);
    // Dracula XVII: pronounce the carter's "Blyme!" as "Blimey!".
    // Speech-only spelling; retain Bram Stoker's printed wording.
    text=text.replace(/\bBlyme!(?=\s|$)/g,'Blimey!');
    // Dracula XVII, the Cockney carter at Carfax: 'ole is "old" with
    // its final d omitted (rhymes with "bowl"), not Spanish "olé".
    // "ohl" is a voice-only, one-syllable cue; never alter the book.
    text=text.replace(/\bole\b(?=\s+(?:chapel|Jerusalem)\b)/gi,
      word=>word[0]===word[0].toUpperCase()?'Ohl':'ohl');
    // Dracula XX: Sam Bloxam's Cockney "'igh 'un" = high one with
    // dropped H, sounded as "eye unn" (two syllables, no added H or W).
    // Spell the spoken second syllable "unn" rather than "un": some
    // browser voices read the two-letter "un" as the initials U N.
    // "unn" is a one-syllable /ʌn/ cue rhyming with "nun".
    // The nearby "'igh steps" drops the H too. Speech only.
    text=text.replace(/['’]igh\s+['’]un\b/gi,'eye unn')
      .replace(/['’]igh\b(?=\s+steps\b)/gi,'eye');
    // Dracula XX: the Cockney word "cussin'." ends with a dropped-G
    // apostrophe immediately before a full stop. Some browsers announce
    // that punctuation as "dot". Keep the period as a sentence pause;
    // omit only the apostrophe in narration, never the printed manuscript.
    text=text.replace(/\bcussin['’](?=\.)/gi,'cussin');
    // Dracula XX: "For a good while we sat and smoked" is a time phrase,
    // not a separate description of "good". A speech-only comma after
    // "while" keeps "for a good while" together as one temporal unit.
    // The published words and punctuation remain exactly Stoker's.
    text=text.replace(/\bFor a good while(?=\s+we sat and smoked\b)/g,
      'For a good while,');
    // Dracula's recurring "Un-Dead" names the undead: one word, not
    // separately spoken letters "U N". Preserve the author's hyphenated
    // spelling in the visible edition; join it ONLY for speech synthesis.
    text=text.replace(/\bun[-\u2010\u2011\u2012\u2013\u2014]dead\b/gi,
      word=>word[0]===word[0].toUpperCase()?'Undead':'undead');
    // An ornamental chapter-title separator is a pause, not multiplication.
    // Normalize for speech only: keep the printed title unchanged.
    text=text.replace(/\b(Chapter|CHAPTER|Book|BOOK|Part|PART|Act|ACT|Scene|SCENE)\s+(\d+|[MDCLXVI]+)\s*[·×]\s*/g, '$1 $2. ');
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
    text=text.replace(capitalizedWord,word=>{
      if(acronyms.has(word)||roman.test(word))return word;
      if(!/[AEIOUY]/.test(word)&&!commonVowellessWords.has(word))return word;
      return word[0]+word.slice(1).toLowerCase();
    });
    // Mina Murray / Mina Harker: pronounced "Meena" (long ee).
    // This change is made ONLY for speech; the displayed edition stays "Mina".
    // It also prepares Mina's for correct possessive pronunciation downstream.
    text=text.replace(/\bMina\b/g,'Meena');
    // "parti" is the French-derived marriage-prospect noun (Dracula V),
    // not the heading "Part I". Its English sound is like "party".
    // Preserve Stoker's original spelling in the visible manuscript.
    text=text.replace(/\bparti\b/gi,word=>word[0]===word[0].toUpperCase()?'Party':'party');
    // Context-sensitive "tear": Lucy's "tear up the letter" means rip
    // (rhymes with bear), not shed a tear (rhymes with deer).
    // Only explicit paper/letter objects trigger this voice-only change.
    text=text.replace(/\btear\b(?=\s+(?:(?:up|apart|open|out)\s+)?(?:(?:the|a|an|my|his|her|our|your|their|this|that|some)\s+)?(?:letter|paper|page|note|document|envelope|photograph|photo|book|sheet|card)s?\b)/gi,
      word=>word[0]===word[0].toUpperCase()?'Tare':'tare');
    // Dracula V, Lucy to Mina: "Men like women, certainly their wives,
    // to be quite as fair as they are" means men WANT women to be fair;
    // "like" is a preference verb, not the comparative "men like women".
    // Add a quiet auxiliary only to the SPOKEN version of this exact clause.
    // Keep Stoker's printed words and all unrelated "like" usages intact.
    text=text.replace(/\bMen like women(?=,\s+certainly their wives,\s+to be quite as fair as they are\b)/g,
      'Men would like women');
    // Dracula IX and elsewhere: "wan" means pale/sickly, not "wane".
    // Some device voices pronounce "wan-looking" as "wun-looking".
    // Use a speech-only approximation to /wɒn/ (UK) /wɑːn/ (US).
    text=text.replace(/\bwan(?=-(?:looking|eyed)\b)/gi,
      word=>word[0]==='W'?'Wahn':'wahn');
    return contextualPronunciations(speechGrammar(preDecimalMoney(text)));
  }

  // Pronunciation-friendly grammar for speech only. Printed book text is unchanged.
  // A regular noun possessive is pronounced like its plural ("art's" => "arts").
  // For sibilant endings, use the equivalent -es sound ("James's" => "Jameses").
  // Never rewrite common contractions such as "it's", "he's" or "there's".
  const contractionBases=new Set([
    'it','he','she','that','what','who','there','here','where','how','let',
    'when','why','this','everything','something','nothing','someone',
    'everyone','anyone','anybody','everybody','somebody','nobody'
  ]);
  function speechGrammar(text){
    // In a saint's name, St. and the French feminine Ste. are abbreviations,
    // not sentence-ending periods. Expand before removing possessive apostrophes.
    // Limit "St." to confirmed names so "St." for Street stays untouched.
    // "Ste." is also a common abbreviation for Suite, so avoid other contexts.
    text=text.replace(/\b(?:St|Ste)\.\s+(?=(?:George|Joseph|Mary|Peter)\b)/g,'Saint ');
    text=text.replace(/\b([A-Za-z]+(?:-[A-Za-z]+)*)['’]s\b/g,(whole,noun)=>{
      if(contractionBases.has(noun.toLowerCase()))return whole;
      return noun+(/(?:s|x|z|ch|sh)$/i.test(noun)?'es':'s');
    });
    // Dracula IX: "marked 'A' on rough diagram" refers to the map's
    // capital-letter label, not the article "a"; say the letter name "ay".
    // Only labels expressly "marked" on a diagram get the spoken expansion.
    text=text.replace(/\bmarked\s+['‘“]([A-Z])['’”](?=\s+on\s+(?:(?:a|an|the|this)\s+)?(?:rough\s+)?diagram\b)/g,
      (_,letter)=>'marked with the letter '+letter);
    // Address and list labels such as "No. 347, Piccadilly" mean
    // "Number 347", never the standalone word "no". Keep the book text.
    text=text.replace(/\bNo\.\s*(?=\d{1,6}\b)/g,'Number ');
    // Honorific abbreviations have unambiguous spoken meanings.
    // Leave other context-dependent abbreviations (e.g. St.) untouched.
    // The English plural title Messrs. (from French messieurs) is spoken
    // 'Messers' (/MES-erz/), not as individual letters or 'Mister'.
    // Include British Messrs without a period; the printed text stays unchanged.
    text=text.replace(/\bMessrs\.?(?=\s+[A-Z])/gi,'Messers');
    // The capitalized title Hon. expands in narration, not in the book.
    text=text.replace(/\bHon\./g,'Honorable');
    const titles={Mr:'Mister',Mrs:'Missus',Ms:'Miz',Dr:'Doctor',
      Prof:'Professor',Rev:'Reverend',Capt:'Captain',Lt:'Lieutenant',
      Col:'Colonel',Gen:'General',Jr:'Junior',Sr:'Senior'};
    text=text.replace(/\b(Mrs|Mr|Ms|Dr|Prof|Rev|Capt|Lt|Col|Gen|Jr|Sr)\./gi,
      (whole,title)=>titles[title[0].toUpperCase()+title.slice(1).toLowerCase()]||whole);
    // Print-era time abbreviations: "8:35 P. M." should be heard as "8:35 PM".
    // Do not send an extra period after M to the speech engine.
    text=text.replace(/\b([AP])\.\s*M\.(?![A-Za-z])/gi,
      (_,letter)=>letter.toUpperCase()+'M');
    // Keep ordinary editorial abbreviations as meaningful words.
    text=text.replace(/\be\.g\./gi,'for example')
      .replace(/\bi\.e\./gi,'that is')
      .replace(/\betc\./gi,'et cetera');
    return text;
  }

  // Apply high-confidence context rules ONLY to the spoken copy.
  // The visual manuscript stays original; ambiguous cases stay untouched.
  function contextualPronunciations(text){
    const bowText=text.replace(/\bbow\b/gi,(word,offset,all)=>{
      const prior=all.slice(Math.max(0,offset-160),offset).toLowerCase();
      const following=all.slice(offset+word.length,offset+word.length+130).toLowerCase();

      // BOW pronounced like "go": an archer's weapon, a ribbon, a musical
      // bow, Bow Street and a curved architectural "bow-window".
      const weaponAfter=/^\s+(?:and\s+(?:an?\s+)?(?:arrow|arrows|quiver)\b|strings?\b|stave\b|wood\b|of\s+yew\b|to\s+(?:shoot|hunt|draw|fire|the\s+(?:target|mark|range))\b|in\s+(?:his|her)\s+hand\b)/.test(following);
      const weaponBefore=/\b(?:archer's|hunters?'|hair|ribbon|satin|silk|velvet|violin|fiddle|cello|musical)\s+$/.test(prior)||
        /\b(?:drew|draw|drawing|strung|aimed|loosed|string|bend|bent)\s+(?:(?:his|her|their|a|the|my|thy)\s+)?$/.test(prior);
      const bowWindow=/^\s*[- ]\s*window\b/.test(following)||
        (/^\s+on\s+it\b/.test(following)&&/\b(?:stone\s+front|house|building)\b/.test(prior));
      const bowInstrument=/^\s+(?:the|a|his|her)\s+(?:violin|cello|strings?|fiddle|instrument)\b/.test(following);
      if(weaponAfter||weaponBefore||bowWindow||bowInstrument||/^\s+street\b/.test(following))return word;

      // BOW pronounced like "cow": a gesture, act of deference or ship's bow.
      // The descriptive nouns below cover Dracula's "with a courteous bow",
      // "with a courtly bow", and "with a grateful bow".
      const gestureAfter=/^\s+(?:to|before|down|low|deeply|respectfully|humbly|in\s+(?:homage|respect)|acceptance|assent|submission)\b/.test(following);
      const gestureBefore=/\b(?:make|makes|made|making|offer|offered|offering|give|gave|given|giving|return|returned|returning|with|after|in|by|from|at)\s+(?:a|an|the)\s+(?:(?:very|most)\s+)?(?:(?:low|deep|slight|little|graceful|respectful|courtly|courteous|grateful|ceremonious|formal|polite|solemn|stiff|quick|humble|profound|mock|elegant)\s+){0,2}$/.test(prior);
      const describedGesture=/\b(?:a|an|the|his|her|their|my|your|our)\s+(?:(?:low|deep|slight|little|graceful|respectful|courtly|courteous|grateful|ceremonious|formal|polite|solemn|stiff|quick|humble|profound|mock|elegant)\s+)$/.test(prior);
      const finalGesture=/\b(?:his|her|their|my|our|your)\s+(?:last|final|farewell)\s+$/.test(prior);
      const promptedGesture=/\b(?:make|makes|made|making|let|saw|see|watched|watch|bid|bade|asked|forced|ordered)\s+(?:me|him|her|us|them|you|one)\s+$/.test(prior);
      const peopleGesture=/\b(?:they|we|you|ye|thou|others|people|men|women|servants|guests|courtiers|all|who|whom)\s+$/.test(prior)&&
        /^\s+(?:and|to|before|down|low)\b/.test(following);
      const verbGesture=/\b(?:must|should|could|would|will|shall|may|might|can|cannot|did|do|does|to|but|please)\s+$/.test(prior);
      const shipBow=/^\s+of\s+(?:the|a|his|her)\s+(?:ship|boat|vessel|barge)\b/.test(following)||
        /\b(?:ship['’]s|boat['’]s|vessel['’]s)\s+$/.test(prior)||
        (/\b(?:deck|hull|stern|mast|masts|sail|sails|ship|boat|vessel|shrouds)\b/.test(prior.slice(-110))&&
          (/^\s+(?:throws?|cuts?|rose|broke|pointed|on|into|through|over|forward)\b/.test(following)||
            /\b(?:from|at|on|in|towards?|by|off)\s+(?:the|a|her|his|its)\s+$/.test(prior)));
      if(gestureAfter||gestureBefore||describedGesture||finalGesture||promptedGesture||peopleGesture||verbGesture||shipBow)
        return word[0]==='B'?'Bough':'bough'; // voice-only /baʊ/
      return word; // Leave other ambiguous contexts to the selected device voice.
    });
    // "Wind" means /waɪnd/ ("kind") when turning a watch or clock.
    // Spoken-only homophone disambiguation: do not alter printed prose.
    const windText=bowText.replace(/\bwinds?\b/gi,(word,offset,all)=>{
      const prior=all.slice(Math.max(0,offset-220),offset);
      const after=all.slice(offset+word.length,offset+word.length+100);
      const timepieceAfter=/^\s+(?:(?:up|back)\s+)?(?:(?:the|a|an|my|his|her|their|our|your|its)\s+)?(?:pocket[- ]?watch|watches|watch|clocks|clock|timepiece|mainspring|music\s+box)\b/i.test(after);
      // "My watch was still unwound ... accustomed to wind it."
      const nearbyTimepiece=/\b(?:pocket[- ]?watch|watches|watch|clocks|clock|timepiece|mainspring|music\s+box)\b/i.test(prior);
      const actionBefore=/\b(?:to|can|could|will|would|shall|should|must|may|might|often|usually|always|regularly|daily|I|he|she|we|they|you)\s+$/i.test(prior);
      const pronounAfter=/^\s+(?:(?:up|back)\s+)?(?:it|them)\b/i.test(after);
      if(timepieceAfter||(nearbyTimepiece&&actionBefore&&pronounAfter)){
        const phonetic=word.toLowerCase()==='winds'?'wineds':'wined';
        return word[0]===word[0].toUpperCase()?phonetic[0].toUpperCase()+phonetic.slice(1):phonetic;
      }
      return word;
    });
    // "Lead" is the heavy metal (rhymes with "bed") in these clear
    // coffin/metal contexts. Say "led" ONLY in speech; keep Stoker's
    // printed words unchanged, and leave verbs like "lead him" alone.
    const leadText=windText
      .replace(/(\bfeet\s+were\s+weighted\s+with\s+)lead\b/gi,(_,prefix)=>prefix+'led')
      .replace(/(\b(?:casing\s+of|through\s+the|rent\s+in\s+the)\s+)lead\b/gi,
        (_,prefix)=>prefix+'led')
      .replace(/\blead\b(?=\s+(?:coffin|casing|lining)\b)/gi,
        word=>word[0]==='L'?'Led':'led');
    // "Wound" (an injury, /wuːnd/) rhymes approximately with "swooned",
    // whereas "wound" as the past tense of "wind" is /waʊnd/.
    // Change clear injury nouns ONLY in the spoken copy; do not rewrite
    // the historical text or past-tense motion verbs ("we wound along").
    const woundText=leadText.replace(/\b((?:(?:my|his|her|its|our|your|their|the|a|an|this|that|these|those|other|tiny|small|little|punctured|open|deep|old|palpitating|terrible)\s+){1,3})(wounds?)\b(?!\s+(?:watch|clock|spring|mechanism|up)\b)/gi,
      (whole,prefix,noun)=>prefix+(noun[0]==='W'?'W':'w')+'oond'+(noun.toLowerCase()==='wounds'?'s':''));
    return woundText.replace(/\bread\b/gi,(word,offset,all)=>{
      const prior=all.slice(Math.max(0,offset-45),offset);
      const after=all.slice(offset+word.length,offset+word.length+75);
      // Perfect-tense "had read" is pronounced "red", not "reed".
      if(/\b(?:has|have|had)\s+$/i.test(prior)||/\b(?:yesterday|last\s+(?:night|week|year)|earlier)\b/i.test(after)&&
        /\b(?:I|he|she|we|they)\s+$/i.test(prior))return word[0]==='R'?'Red':'red';
      return word;
    });
  }

  // Grammar-led speech units: complete sentences when possible; natural
  // breaths at selected clause punctuation for very long Victorian sentences.
  // Do not split within a word, abbreviation, decimal number, or quote tag.
  // Preserve the sentence period when an abbreviation ends a thought.
  // Rendered paragraph boundaries recover endings in readers that join prose
  // with spaces before passing it to the shared narrator.
  function preserveEtcEndings(value){
    let text=String(value||'');
    const ending=/\b[eE][tT][cC]\.([”’"')\]]*)(?=\s*$|\s+(?:[“‘"']\s*)?\p{Lu})/gu;
    text=text.replace(ending,'et cetera.$1');
    if(typeof document!=='undefined'&&typeof document.querySelectorAll==='function'){
      for(const node of document.querySelectorAll('#prose p, #passage p')){
        const p=String(node.textContent||'').replace(/\s+/g,' ').trim();
        if(!/\betc\.[”’"')\]]*$/i.test(p))continue;
        const previous=p.replace(/\betc\.([”’"')\]]*)$/i,'et cetera.$1');
        // Match the complete paragraph, not an unrelated occurrence of etc.
        if(text.includes(p))text=text.replace(p,previous);
      }
    }
    return text;
  }
  const etcSentenceEnd=/\bet cetera\.[”’"')\]]*\s*$/i;
  function speechChunks(value){
    // Gutenberg uses "--" for a typographic em dash. Normalize the punctuation
    // only in narration; never alter the printed manuscript.
    const clean=normalizeForSpeech(preserveEtcEndings(value)).replace(/\*+\s*/g,'')
      .replace(/--+/g,' — ').replace(/\s+/g,' ').trim();
    if(!clean)return [];
    const protectedText=clean
      .replace(/\b(?:Mr|Mrs|Ms|Dr|Prof|Rev|St|Capt|Lt|Col|Gen|Sr|Jr|Messrs)\./gi,m=>m.replace(/\./g,'\uE000'))
      .replace(/\b(?:[A-Za-z]\.){2,}/g,m=>m.replace(/\./g,'\uE000'))
      .replace(/\b[A-Z]\.(?=\s+(?:[A-Z]\.|[A-Z][a-z]))/g,m=>m.replace(/\./g,'\uE000'))
      .replace(/(\d)\.(?=\d)/g,'$1\uE000');
    let pieces=[];
    if(typeof Intl!=='undefined'&&typeof Intl.Segmenter==='function'){
      pieces=Array.from(new Intl.Segmenter('en',{granularity:'sentence'}).segment(protectedText),p=>clean.slice(p.index,p.index+p.segment.length).trim());
    }else{
      let start=0,m;const ends=/[.!?]+[”’"')\]]*(?:\s+|$)/g;
      while((m=ends.exec(protectedText))){pieces.push(clean.slice(start,ends.lastIndex).trim());start=ends.lastIndex;}
      if(start<clean.length)pieces.push(clean.slice(start).trim());
    }
    // Force a speech boundary even when a following paragraph starts lowercase.
    pieces=pieces.flatMap(part=>part.split(/(?<=\bet cetera\.[”’"')\]]*)\s+/i));
    const sentences=[];
    for(const part of pieces.filter(Boolean)){
      const last=sentences.at(-1)||'';
      if(last&&!etcSentenceEnd.test(last)&&(/^[a-z,;:—–)\]]/.test(part)||/(?:\.\.\.|…)\s*[”’"']?$/.test(last)))sentences[sentences.length-1]+=' '+part;
      else sentences.push(part);
    }
    const result=[];
    for(const sentence of sentences){
      const clauses=[];
      const boundary=/[;:—–][”’"']?\s+/g;
      let previous=0,match;
      // A semicolon or colon signals a rhetorical breath even in a
      // moderately short sentence, provided both sides are real clauses.
      while((match=boundary.exec(sentence))){
        const end=match.index+match[0].trimEnd().length;
        if(end-previous>=35&&sentence.length-end>=22){
          clauses.push(sentence.slice(previous,end).trim());
          previous=end;
        }
      }
      clauses.push(sentence.slice(previous).trim());
      for(const clause of clauses.filter(Boolean)){
        let remaining=clause;
        while(remaining.length>340){
          let cut=0;
          const r=/[;:—–,][”’"']?\s+/g;let m;
          while((m=r.exec(remaining))){
            const pos=m.index+m[0].length;
            if(pos>=105&&pos<=310){
              if(m[0].includes(',')&&!/^\s*(?:and|but|or|yet|while|although|which|who|when|where|because|as|if)\b/i.test(remaining.slice(pos)))continue;
              cut=pos;
            }
          }
          if(!cut){
            const i=remaining.lastIndexOf(' ',310);
            if(i>=160)cut=i+1;
          }
          if(!cut)break;
          result.push(remaining.slice(0,cut).trim());remaining=remaining.slice(cut).trimStart();
        }
        if(remaining)result.push(remaining);
      }
    }
    // Treat every em dash, including Gutenberg's --, as a real rhetorical
    // pause even in short sentences; ordinary clause splitting misses these.
    // The dash is an internal cue: speakWithPauses strips it before TTS.
    const phrased=[];
    for(const phrase of result){
      const parts=phrase.split(/\s*—\s*/);
      for(let j=0;j<parts.length;j++){
        const part=parts[j].trim();
        if(part)phrased.push(part+(j<parts.length-1?'—':''));
        else if(j>0&&j<parts.length-1&&phrased.length&&!phrased.at(-1).endsWith('—'))
          phrased[phrased.length-1]+='—';
      }
    }
    // Keep the hiss between the surrounding spoken phrases, so browser
    // voices never receive the repeated letters or the internal marker.
    const withHiss=[];
    for(const phrase of phrased){
      const parts=phrase.split(HISS_MARKER);
      for(let i=0;i<parts.length;i++){
        const spoken=parts[i].trim();
        if(spoken)withHiss.push(spoken);
        if(i<parts.length-1)withHiss.push(HISS_MARKER);
      }
    }
    return withHiss;
  }

  function pauseAfter(text){
    const value=String(text||'').trim();
    if(!value)return 15;
    if(etcSentenceEnd.test(value))return 350;
    // Speech engines already include punctuation intonation and a natural
    // end-of-utterance breath. Avoid stacking a second long scripted pause.
    const clean=value.replace(/[”’"' )\]]+$/,'').trim();
    const words=value.replace(/[.!?]+[”’"']?$/,'').trim().split(/\s+/);
    const heading=words.length>=2&&words.length<=13&&/^[A-Z][^.!?]*\.$/.test(value)&&
      words.filter(w=>/^[A-Z][a-z]+/.test(w)).length>=Math.max(2,words.length-3)&&
      !/[“”"?!]/.test(value);
    if(heading)return 170; // chapter and section headings still get a brief beat
    if(/[?!]$/.test(clean))return 115;
    if(/[.!]$/.test(clean))return 85;
    if(/[;:]$/.test(clean))return 65;
    if(/[—–]$/.test(clean))return 65;
    if(/,$/.test(clean))return 35;
    return 15;
  }
  // Resume marker: exact word when the browser emits word boundaries.
  // The marked-up text is not saved to the manuscript or reading progress.
  let activeReading=null,pausedWordMark=null;
  function clearPausedHighlight(){
    if(pausedWordMark){
      const mark=pausedWordMark;pausedWordMark=null;
      if(mark.parentNode){
        const parent=mark.parentNode;
        parent.replaceChild(document.createTextNode(mark.textContent),mark);
        parent.normalize();
      }
    }
  }
  function wordSpans(value){
    const spans=[],re=/[\p{L}\p{N}]+(?:[’'-][\p{L}\p{N}]+)*/gu;
    for(const m of String(value).matchAll(re))
      spans.push({word:m[0],start:m.index,end:m.index+m[0].length});
    return spans;
  }
  function comparableWord(value){
    const clean=String(value).toLowerCase().replace(/['’]/g,'').replace(/-/g,'');
    const aliases={meena:'mina',meenas:'minas',bough:'bow',party:'parti',tare:'tear',led:'lead',messers:'messrs',honorable:'hon',woond:'wound',woonds:'wounds',wahnlooking:'wanlooking',wahneyed:'waneyed',wined:'wind',
      wineds:'winds',mister:'mr',doctor:'dr',missus:'mrs',miz:'ms',
      one:'1',two:'2',three:'3',four:'4',five:'5',six:'6',
      seven:'7',eight:'8',nine:'9',ten:'10'};
    return aliases[clean]||clean;
  }
  // One historical currency token may expand to several spoken words:
  // L1 -> "one pound"; 17s. -> "seventeen shillings"; 9d -> "nine pence".
  // Give each spoken word the SAME original visual span so a paused reading
  // always highlights the source abbreviation, never an adjacent word.
  function currencyVisualKeys(span,source){
    const token=span.word;
    let amount=null,kind=null;
    let match=/^L(\d{1,6})$/.exec(token);
    if(match){amount=Number(match[1]);kind='pound';}
    else if(source[span.start-1]==='£'&&/^\d{1,6}$/.test(token)&&
      !/^\.\d/.test(source.slice(span.end))){
      amount=Number(token);kind='pound';
    }
    else if((match=/^(\d{1,4})s$/.exec(token))){
      amount=Number(match[1]);kind='shilling';
    }
    else if((match=/^(\d{1,3})d$/.exec(token))){
      amount=Number(match[1]);kind='penny';
    }
    if(kind===null)return null;
    const spoken=cardinal(amount)+' '+
      (kind==='pound'?(amount===1?'pound':'pounds'):
       kind==='shilling'?(amount===1?'shilling':'shillings'):
       amount===1?'penny':'pence');
    return wordSpans(spoken).map(w=>comparableWord(w.word));
  }

  function locateVisualWord(spokenWords,position){
    const body=document.getElementById('prose')||document.getElementById('passage');
    if(!body)return null;
    const title=document.getElementById('chaptername')||document.getElementById('read-chapter');
    const containers=[];
    if(title){
      const titleWords=wordSpans(title.textContent).map(x=>comparableWord(x.word));
      // The heading is visible on every page but usually spoken only on its first page.
      if(titleWords.length&&spokenWords.length&&
        (titleWords[0]===comparableWord(spokenWords[0].word)||
         (titleWords[0]==='chapter'&&comparableWord(spokenWords[0].word)==='chapter')))
        containers.push(title);
    }
    containers.push(body);
    const visible=[];
    for(const container of containers){
      const walker=document.createTreeWalker(container,NodeFilter.SHOW_TEXT);
      let node;
      while((node=walker.nextNode())){
        for(const span of wordSpans(node.textContent)){
          const money=currencyVisualKeys(span,node.textContent);
          if(money)for(const key of money)visible.push({...span,node,key});
          else visible.push({...span,node,key:comparableWord(span.word)});
        }
      }
    }
    if(!visible.length||!spokenWords.length)return null;
    const spoken=spokenWords.map(x=>comparableWord(x.word));
    const target=Math.max(0,Math.min(position,spoken.length-1));
    // Align the spoken-only normalization and the original printed words.
    // A lookahead skips extra heading tokens and abbreviation expansions.
    let i=0,j=0;
    while(i<=target&&j<visible.length){
      // The spoken title "Saint" represents printed "St." or "Ste.".
      const saintTitle=spoken[i]==='saint'&&
        (visible[j].key==='st'||visible[j].key==='ste');
      if(spoken[i]===visible[j].key||saintTitle){
        if(i===target)return visible[j];
        i++;j++;continue;
      }
      let skipVisual=-1,skipSpoken=-1;
      for(let k=1;k<=4&&j+k<visible.length;k++)
        if(spoken[i]===visible[j+k].key){skipVisual=k;break;}
      for(let k=1;k<=4&&i+k<spoken.length;k++)
        if(spoken[i+k]===visible[j].key){skipSpoken=k;break;}
      if(skipVisual>=0&&(skipSpoken<0||skipVisual<=skipSpoken)){j+=skipVisual;continue;}
      if(skipSpoken>=0){i+=skipSpoken;continue;}
      if(i===target)return visible[j];
      i++;j++;
    }
    return visible[Math.min(visible.length-1,Math.max(0,j))];
  }
  function markPausedWord(utterances,index,offset){
    clearPausedHighlight();
    if(typeof document==='undefined'||typeof document.createTreeWalker!=='function')return;
    // The spoken section heading is not printed in the prose; never highlight it.
    if(utterances[index]?.__opheliaChapterIntro)return;
    const spokenWords=[];let selected=0,seen=0;
    for(let i=0;i<utterances.length;i++){
      const words=utterances[i].__opheliaChapterIntro?[]:wordSpans(utterances[i].text.replace(/—\s*$/,''));
      if(i===index){
        const at=words.findIndex(w=>w.start<=offset&&w.end>offset);
        const next=words.findIndex(w=>w.start>=offset);
        selected=seen+(at>=0?at:next>=0?next:Math.max(0,words.length-1));
      }
      spokenWords.push(...words);
      seen+=words.length;
    }
    const target=locateVisualWord(spokenWords,selected);
    if(!target?.node?.parentNode)return;
    const node=target.node,tail=node.splitText(target.end);
    const exact=node.splitText(target.start);
    const mark=document.createElement('mark');
    mark.className='ophelia-paused-word';
    mark.setAttribute('aria-label','Paused at '+exact.textContent);
    mark.textContent=exact.textContent;
    exact.parentNode.replaceChild(mark,exact);
    pausedWordMark=mark;
    if(!document.getElementById('ophelia-paused-word-style')){
      const style=document.createElement('style');
      style.id='ophelia-paused-word-style';
      style.textContent='mark.ophelia-paused-word{background:#ffdf58!important;color:#222!important;border-radius:3px;padding:0 1px;box-shadow:0 0 0 1px #b08e14}';
      document.head.appendChild(style);
    }
  }
  // Queue one sentence/phrase at a time; keep our own word-level cursor.
  // Browser-native pause/resume can restart unpredictably in some OS voices.
  // Announce section headings without inserting them into the manuscript or
  // the reader's paragraph pagination. All standard readers share this queue.
  function openingSectionAnnouncement(utterances){
    if(!utterances?.length||typeof state==='undefined'||
       !Number.isInteger(state?.page))return '';
    // Most books paginate \`pages\`; Alice and Pride and Prejudice use a
    // four-page-per-chapter \`catalog\` in their original studio reader.
    const readings=typeof pages!=='undefined'&&Array.isArray(pages)?pages:
      typeof catalog!=='undefined'&&Array.isArray(catalog)?catalog:null;
    const page=readings?.[state.page];
    if(!page)return '';
    const section=page.section??page.ci;
    if(section===undefined)return '';
    if(state.page>0&&(readings[state.page-1]?.section??readings[state.page-1]?.ci)===section)return '';
    // Restarting in the middle of an utterance should resume the prose, not the heading.
    if(typeof speechCursor!=='undefined'&&speechCursor>0)return '';
    const chapterTitle=String(page.chapter||'').trim();
    const studioHeading=chapterTitle?
      (/^(?:chapter|book|act|part)\b/i.test(chapterTitle)?
        chapterTitle:'Chapter '+(Number(page.ci)+1)+'. '+chapterTitle):'';
    let name=String(page.sectionName||studioHeading||
      document.getElementById('chaptername')?.textContent||'').trim();
    if(!name)return '';
    if(/^explanatory$/i.test(name))name='Explanatory Note';
    if(/^chapter\s+the\s+last$/i.test(name))
      name='Chapter '+page.section+'. The Last';
    if(/^laisse\s+(\d+)\s*·\s*[IVXLCDM]+$/i.test(name))
      name=name.replace(/\s*·\s*[IVXLCDM]+$/i,'');
    name=name.replace(/\b(Chapter|Book|Volume|Part|Act|Scene|Canto|Letter|Section)\s+([IVXLCDM]+)\b/gi,
      (whole,label,numeral)=>{
        const value=romanValue(numeral.toUpperCase());
        return value===null?whole:label+' '+value;
      });
    name=name.replace(/\s*[·•]\s*/g,'. ').replace(/\s+[—–]\s+/g,'. ')
      .replace(/&/g,'and').replace(/\s{2,}/g,' ').replace(/[.!?\s]+$/,'');
    if(name===name.toUpperCase()&&/[A-Z]/.test(name))
      name=name.toLowerCase().replace(/(^|[.!?]\s+)[a-z]/g,m=>m.toUpperCase());
    const announcement=name+'.';
    // Existing per-book chapter intros (e.g. Franklin and Huck) are authoritative.
    if(String(utterances[0].text||'').trim().toLocaleLowerCase()===announcement.toLocaleLowerCase())
      return '';
    if(/(?:^|\/)(?:huckleberry-finn|autobiography-benjamin-franklin)\.html$/i.test(root.location?.pathname||''))
      return '';
    return announcement;
  }
  // Shared word-position control. The slider uses the actual speech queue, so
  // moving it never changes the printed manuscript or page bookmark.
  let wordPositionControl=null;
  function showWordPosition(session,words){
    if(typeof document==='undefined'||typeof document.createElement!=='function'||!document.getElementById)return;
    const playButton=document.getElementById('play')||document.getElementById('read-play');
    if(!playButton||!words.length)return;
    if(!wordPositionControl){
      const wrap=document.createElement('div');
      wrap.id='ophelia-word-position';wrap.style.cssText='margin:12px 0;min-width:0;font:12px/1.4 Arial,sans-serif;color:inherit';
      const label=document.createElement('label');label.htmlFor='ophelia-word-slider';label.textContent='Narration word position';
      const input=document.createElement('input');input.type='range';input.id='ophelia-word-slider';input.min='0';input.step='1';
      input.style.cssText='display:block;width:100%;accent-color:#58735e;margin:7px 0';
      const output=document.createElement('output');output.style.cssText='display:block;overflow-wrap:anywhere';
      wrap.append(label,input,output);
      const group=playButton.closest?.('.transport,.actions,.player-controls,.playback-controls')||playButton.parentElement;
      if(!group?.parentNode)return;
      group.insertAdjacentElement('afterend',wrap);
      wordPositionControl={wrap,input,output};
    }
    const {wrap,input,output}=wordPositionControl;
    wrap.hidden=false;input.disabled=false;input.max=String(words.length-1);
    let dragging=false;
    const display=(i)=>{i=Math.max(0,Math.min(words.length-1,i));output.textContent='Word '+(i+1)+' of '+words.length+' · '+words[i].word;input.setAttribute('aria-valuetext',output.textContent);};
    input.oninput=()=>{dragging=true;display(Number(input.value));session.previewWord(Number(input.value));};
    input.onchange=()=>{dragging=false;session.seekWord(Number(input.value));};
    session.updateWordControl=i=>{if(dragging)return;input.value=String(i);display(i);};
    session.updateWordControl(0);
  }
  function hideWordPosition(){
    if(wordPositionControl){wordPositionControl.wrap.hidden=true;wordPositionControl.input.disabled=true;}
  }
  function speakWithPauses(synth,utterances,isCurrent,isPaused,options={}){
    clearReading();
    if(!utterances||!utterances.length)return null;
    const intro=options.sectionAnnouncement===false?'':openingSectionAnnouncement(utterances);
    if(intro){
      const first=utterances[0];
      // A separate source keeps existing onend/page-turn counts unchanged.
      utterances.unshift({
        text:intro,voice:first.voice,lang:first.lang,rate:first.rate,
        pitch:first.pitch,volume:first.volume,__opheliaChapterIntro:true,
        // Clear the reader's startup timeout while the title is being spoken.
        onstart:e=>first.onstart?.(e)
      });
    }
    let index=0,offset=0,paused=false,disposed=false,serial=0,timer=null;
    const wordPositions=utterances.flatMap((u,i)=>u.__opheliaChapterIntro?[]:wordSpans(String(u.text)).map(w=>({...w,index:i})));
    const completedSources=new Set();
    const currentWord=()=>{let n=wordPositions.findIndex(w=>w.index===index&&w.end>lastBoundary);if(n<0)n=wordPositions.findIndex(w=>w.index>index);return n<0?Math.max(0,wordPositions.length-1):n;};

    let current=null,lastBoundary=0,pendingFinalEtc=null;
    // Unlock Web Audio from the reader's Play gesture, but only on the
    // page containing the hiss. Other books and pages use ordinary TTS.
    let hissContext=null,hissNode=null;
    if(utterances.some(u=>u.text===HISS_MARKER)){
      const AudioCtor=root.AudioContext||root.webkitAudioContext;
      if(AudioCtor){
        try{
          hissContext=new AudioCtor();
          if(hissContext.state==='suspended')
            hissContext.resume().catch(()=>{});
        }catch{hissContext=null;}
      }
    }
    function stopHiss(){
      if(!hissNode)return;
      const node=hissNode;hissNode=null;
      node.onended=null;
      try{node.stop();}catch{}
      try{node.disconnect();}catch{}
    }
    function closeHiss(){
      stopHiss();
      if(hissContext){
        const ctx=hissContext;hissContext=null;
        try{ctx.close().catch(()=>{});}catch{}
      }
    }
    const session={
      previewWord(n){
        const w=wordPositions[n];if(!w||disposed)return;
        markPausedWord(utterances,w.index,w.start);
      },
      seekWord(n){
        const w=wordPositions[n];if(!w||disposed||!isCurrent())return false;
        serial++;
        if(timer!==null){clearTimeout(timer);timer=null;}
        current=null;stopHiss();try{synth.cancel();}catch{}
        pendingFinalEtc=null;index=w.index;offset=w.start;lastBoundary=offset;
        session.updateWordControl?.(n);
        if(paused||isPaused()){markPausedWord(utterances,index,offset);return true;}
        clearPausedHighlight();try{synth.resume();}catch{}
        play();return true;
      },
      pause(){
        if(disposed||paused||!isCurrent())return false;
        paused=true;
        if(timer!==null){clearTimeout(timer);timer=null;}
        if(current){
          offset=lastBoundary;
          serial++;current=null;stopHiss();
          // Intentionally stop TTS and retain the last reported word.
          try{synth.cancel();}catch{}
        }
        markPausedWord(utterances,index,offset);
        session.updateWordControl?.(currentWord());
        return true;
      },
      resume(){
        if(disposed||!paused||!isCurrent())return false;
        paused=false;clearPausedHighlight();
        try{synth.resume();}catch{}
        play();return true;
      },
      clear(){
        disposed=true;serial++;
        if(timer!==null){clearTimeout(timer);timer=null;}
        clearPausedHighlight();closeHiss();
      },
      getPosition(){return {index,offset,paused};}
    };
    activeReading=session;
    showWordPosition(session,wordPositions);
    function play(){
      if(disposed||paused||!isCurrent()||index>=utterances.length)return;
      if(pendingFinalEtc){const event=pendingFinalEtc.event;pendingFinalEtc=null;complete(event,true);return;}
      const source=utterances[index],raw=String(source.text);
      // A sustained sibilant must sound like air escaping, not the names
      // of several letters. High-passed soft noise gives one long /s/.
      // If Web Audio is unavailable, TTS says "hiss" rather than S S S S.
      if(raw===HISS_MARKER&&hissContext?.state==='running'){
        try{
          const ctx=hissContext;
          const duration=Math.max(.8,Math.min(1.5,1.2/(source.rate||1)));
          const buffer=ctx.createBuffer(1,Math.ceil(ctx.sampleRate*duration),ctx.sampleRate);
          const samples=buffer.getChannelData(0);
          for(let i=0;i<samples.length;i++)samples[i]=Math.random()*2-1;
          const noise=ctx.createBufferSource();
          noise.buffer=buffer;
          const highpass=ctx.createBiquadFilter();
          highpass.type='highpass';highpass.frequency.value=3200;
          const volume=ctx.createGain(),now=ctx.currentTime;
          const level=Math.min(.16,Math.max(.06,.14*(source.volume??1)));
          volume.gain.setValueAtTime(0,now);
          volume.gain.linearRampToValueAtTime(level,now+.08);
          volume.gain.setValueAtTime(level,now+duration-.16);
          volume.gain.linearRampToValueAtTime(0,now+duration);
          noise.connect(highpass);highpass.connect(volume);volume.connect(ctx.destination);
          const id=++serial;
          hissNode=noise;current=noise;lastBoundary=0;
          noise.onended=e=>{
            if(id!==serial||disposed||paused)return;
            hissNode=null;complete(e);
          };
          noise.start();
          source.onstart?.({});
          return;
        }catch{stopHiss();}
      }
      const tail=raw.slice(offset);
      const leading=tail.length-tail.trimStart().length;
      const start=offset+leading;
      const spoken=raw===HISS_MARKER?'hiss':tail.trimStart().replace(/—\s*$/,'').trimEnd();
      if(!spoken){complete(null);return;}
      const id=++serial,base=start;
      const VoiceUtterance=root.SpeechSynthesisUtterance;
      const u=VoiceUtterance?new VoiceUtterance(spoken):{text:spoken};
      for(const key of ['voice','lang','rate','pitch','volume'])
        if(source[key]!==undefined)u[key]=source[key];
      // Preserve interrogative intonation on every chosen narrator voice.
      if(/\?[”’"')\]]*\s*$/.test(spoken))
        u.pitch=Math.min(1.15,Math.max(1.11,u.pitch||1));
      // Preserve the original book's narration lifecycle and controls.
      u.onstart=e=>{if(id!==serial||disposed)return;session.updateWordControl?.(currentWord());source.onstart?.(e);};
      u.onboundary=e=>{
        if(id!==serial||disposed||paused)return;
        if(typeof e?.charIndex==='number'&&e.charIndex>=0&&
          (!e.name||e.name==='word')){
          lastBoundary=base+e.charIndex;session.updateWordControl?.(currentWord());
        }
        source.onboundary?.(e);
      };
      u.onend=e=>{if(id!==serial||disposed||paused)return;complete(e);};
      u.onerror=e=>{if(id!==serial||disposed||paused)return;source.onerror?.(e);};
      current=u;lastBoundary=base;
      synth.speak(u);
    }
    function complete(e,afterEtc=false){
      if(disposed||paused)return;
      const original=utterances[index];
      // Delay a page-turn callback too, unless a book already manages it.
      if(!afterEtc&&index===utterances.length-1&&original.__opheliaPauseMs==null&&etcSentenceEnd.test(original.text)){
        current=null;pendingFinalEtc={event:e};timer=setTimeout(()=>{timer=null;play();},350);return;
      }
      current=null;offset=0;index++;
      // A double dash is a short rhetorical beat, not a 430 ms silence.
      const delay=original.__opheliaChapterIntro?110:(original.__opheliaPauseMs??pauseAfter(original.text));
      // A seek may skip or replay sources. Count each callback exactly once;
      // account for skipped sources only when the actual queue reaches its end.
      const done=source=>{if(completedSources.has(source))return;completedSources.add(source);source.onend?.(e||{});};
      if(index>=utterances.length){for(const source of utterances){if(disposed||!isCurrent())break;done(source);}}
      else done(original);
      if(disposed||!isCurrent())return;
      if(index<utterances.length){
        timer=setTimeout(()=>{timer=null;play();},delay);
      }else if(activeReading===session){
        activeReading=null;hideWordPosition();clearPausedHighlight();closeHiss();
      }
    }
    play();
    return session;
  }
  function pauseReading(){
    return activeReading?.pause()===true;
  }
  function resumeReading(){
    return activeReading?.resume()===true;
  }
  function clearReading(){
    const session=activeReading;activeReading=null;
    if(session)session.clear();
    else clearPausedHighlight();
    hideWordPosition();
  }

  // Shared reader preferences across the library, independent of each book's bookmark.
  // Only bind controls actually present on a reading page. Never change the manuscript.
  (function synchronizeReaderPreferences(){
    const preferenceKey='ophelia-library-settings-v1';
    const ids={speed:['speed','reader-speed'],size:['size','reader-size'],voice:['voice','reader-voice'],night:['dark','night'],auto:['autoturn','auto','auto-turn']};
    const element=(key)=>typeof document.getElementById==='function'?ids[key].map(id=>document.getElementById(id)).find(Boolean):null;
    const getStored=()=>{try{return JSON.parse(localStorage.getItem(preferenceKey)||'{}')||{};}catch{return {};}};
    const commit=(key,value)=>{try{const state=getStored();state[key]=value;localStorage.setItem(preferenceKey,JSON.stringify(state));}catch{}};
    const bind=()=>{
      const settings=getStored();
      for(const key of Object.keys(ids)){
        const el=element(key);if(!el||el.dataset.opheliaLibraryBound)return;
        el.dataset.opheliaLibraryBound='true';
        // Restore shared choices only after a book has initialized its own reader.
        if(Object.prototype.hasOwnProperty.call(settings,key)){
          const value=settings[key];
          if(key==='voice'){
            const selectVoice=()=>{if([...el.options].some(o=>o.value===value)&&el.value!==value){el.value=value;el.dispatchEvent(new Event('change',{bubbles:true}));}};
            selectVoice();
            if(root.speechSynthesis)root.speechSynthesis.addEventListener('voiceschanged',selectVoice,{once:true});
          }else if(key==='night'||key==='auto'){
            if(el.checked!==Boolean(value)){el.checked=Boolean(value);el.dispatchEvent(new Event('change',{bubbles:true}));}
          }else if(Number.isFinite(Number(value))){
            const v=Math.max(Number(el.min)||0,Math.min(Number(el.max)||100,Number(value)));
            if(Number(el.value)!==v){el.value=String(v);el.dispatchEvent(new Event('input',{bubbles:true}));}
          }
        }
        const event=(key==='speed'||key==='size')?'input':'change';
        el.addEventListener(event,()=>{
          if(key==='night'||key==='auto')commit(key,el.checked);
          else if(key==='speed'||key==='size')commit(key,Number(el.value));
          else commit(key,el.value);
        });
      }
    };
    // DOMContentLoaded precedes async book-text loading, but follows inline control setup.
    if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bind,{once:true});else bind();
  })();
  root.OpheliaNarration=Object.freeze({version:'1.4.27',normalizeForSpeech,speechChunks,speakWithPauses,pauseAfter,pauseReading,resumeReading,clearReading});
})(window);
