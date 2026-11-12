/* Ophelia's Open Book — shared spoken-text preparation.
 * Version 1.2.0. Load before each reader's inline narration code.
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
    text=text.replace(capitalizedWord,word=>{
      if(acronyms.has(word)||roman.test(word))return word;
      if(!/[AEIOUY]/.test(word)&&!commonVowellessWords.has(word))return word;
      return word[0]+word.slice(1).toLowerCase();
    });
    return contextualPronunciations(text);
  }

  // Apply high-confidence context rules ONLY to the spoken copy.
  // The visual manuscript stays original; ambiguous cases stay untouched.
  function contextualPronunciations(text){
    const bowText=text.replace(/\bbow\b/gi,(word,offset,all)=>{
      const prior=all.slice(Math.max(0,offset-110),offset).toLowerCase();
      const following=all.slice(offset+word.length,offset+word.length+105).toLowerCase();
      // Clearly named archery equipment and hair ribbons remain ordinary "bow".
      if(/^\s+(?:and\s+(?:arrow|quiver)|string|stave|wood|of\s+yew|in\s+(?:his|her)\s+hand)\b/.test(following)||
        /\b(?:hair|ribbon|satin|silk|velvet)\s+$/.test(prior)||
        /^\s+street\b/.test(following))return word;
      const respectAfter=/^\s+(?:to|before|down|low|deeply|respectfully|humbly|in\s+(?:homage|respect))\b/.test(following);
      const respectBefore=/\b(?:make|made|making|offer|offered|offering)\s+(?:a|an|the)\s+(?:(?:low|deep|slight|little|graceful|respectful|courtly)\s+)?$/.test(prior);
      const bowedSubject=/\b(?:they|we|you|ye|thou|others|people|men|women|servants|guests|courtiers|all|who|whom)\s+$/.test(prior)&&
        /^\s+(?:and|to|before|down|low)\b/.test(following);
      const shipBow=/^\s+of\s+(?:the|a|his|her)\s+(?:ship|boat|vessel|barge)\b/.test(following)||
        /\b(?:ship['’]s|boat['’]s|vessel['’]s)\s+$/.test(prior);
      // "his bow to the target" is usually a weapon, not the act of bowing.
      const objectContext=/\b(?:his|her|their|our|thy|my|your|stout|yew|long|strong|good)\s+$/.test(prior);
      const action=(respectAfter&&!objectContext)||respectBefore||bowedSubject||shipBow;
      if(action)return word[0]==='B'?'Bough':'bough'; // spoken-only /baʊ/
      return word; // leave ambiguous cases for the user's selected voice
    });
    return bowText.replace(/\bread\b/gi,(word,offset,all)=>{
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
  function speechChunks(value){
    const clean=normalizeForSpeech(value).replace(/\*\s*/g,'').replace(/\s+/g,' ').trim();
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
    const sentences=[];
    for(const part of pieces.filter(Boolean)){
      const last=sentences.at(-1)||'';
      if(last&&(/^[a-z,;:—–)\]]/.test(part)||/(?:\.\.\.|…)\s*[”’"']?$/.test(last)))sentences[sentences.length-1]+=' '+part;
      else sentences.push(part);
    }
    const result=[];
    for(const sentence of sentences){
      let remaining=sentence;
      while(remaining.length>340){
        let cut=0;
        // Prefer strong punctuation before splitting a long sentence.
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
      // A moderate-length, multi-clause sentence may warrant a semicolon breath.
      if(remaining.length>=175&&/[;—–]\s+/.test(remaining)){
        const split=remaining.match(/^([\s\S]{70,220}?[;—–])\s+([\s\S]{45,})$/);
        if(split){result.push(split[1].trim());remaining=split[2].trim();}
      }
      if(remaining)result.push(remaining);
    }
    return result;
  }

  function pauseAfter(text){
    const value=String(text||'').trim();
    if(!value)return 120;
    const words=value.replace(/[.!?]+[”’"']?$/,'').trim().split(/\s+/);
    const clean=value.replace(/[”’"' )\]]+$/,'').trim();
    const heading=words.length>=2&&words.length<=13&&/^[A-Z][^.!?]*\.$/.test(value)&&
      words.filter(w=>/^[A-Z][a-z]+/.test(w)).length>=Math.max(2,words.length-3)&&
      !/[“”"?!]/.test(value);
    if(heading)return 630;
    if(/[?!]$/.test(clean))return 400;
    if(/[.!]$/.test(clean))return 305;
    if(/[;:]$/.test(clean))return 265;
    if(/[—–]$/.test(clean))return 230;
    if(/,$/.test(clean))return 165;
    return 150;
  }
  // Queue one utterance at a time, rather than starting every sentence
  // back-to-back. Respect manual pause, stop and page changes via callbacks.
  function speakWithPauses(synth,utterances,isCurrent,isPaused){
    if(!utterances||!utterances.length)return;
    let i=0;
    function play(){
      if(!isCurrent()||i>=utterances.length)return;
      if(isPaused&&isPaused()){setTimeout(play,90);return;}
      const u=utterances[i];
      const oldEnd=u.onend;
      u.onend=e=>{
        if(typeof oldEnd==='function')oldEnd(e);
        if(!isCurrent())return;
        i++;
        if(i<utterances.length)setTimeout(play,pauseAfter(u.text));
      };
      synth.speak(u);
    }
    play();
  }

  root.OpheliaNarration=Object.freeze({version:'1.2.0',normalizeForSpeech,speechChunks,speakWithPauses,pauseAfter});
})(window);
