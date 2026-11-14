/* Ophelia's Open Book — shared spoken-text preparation.
 * Version 1.4.4. Load before each reader's inline narration code.
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
    return contextualPronunciations(speechGrammar(text));
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
    text=text.replace(/\b([A-Za-z]+(?:-[A-Za-z]+)*)['’]s\b/g,(whole,noun)=>{
      if(contractionBases.has(noun.toLowerCase()))return whole;
      return noun+(/(?:s|x|z|ch|sh)$/i.test(noun)?'es':'s');
    });
    // Honorific abbreviations have unambiguous spoken meanings.
    // Leave context-dependent abbreviations (e.g. St., No.) untouched.
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
    // Dracula VIII: Mina says her feet felt weighted with the heavy metal
    // "lead" (rhymes with "Ted"), never the verb "lead" (rhymes with "seed").
    // Change only this unmistakable phrase in the speech copy, not the book.
    const leadText=windText.replace(/(\bfeet\s+were\s+weighted\s+with\s+)lead\b/gi,
      (_,prefix)=>prefix+'led');
    return leadText.replace(/\bread\b/gi,(word,offset,all)=>{
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
    // Gutenberg uses "--" for a typographic em dash. Normalize the punctuation
    // only in narration; never alter the printed manuscript.
    const clean=normalizeForSpeech(value).replace(/\*+\s*/g,'')
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
    const sentences=[];
    for(const part of pieces.filter(Boolean)){
      const last=sentences.at(-1)||'';
      if(last&&(/^[a-z,;:—–)\]]/.test(part)||/(?:\.\.\.|…)\s*[”’"']?$/.test(last)))sentences[sentences.length-1]+=' '+part;
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
    return phrased;
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
    const aliases={meena:'mina',meenas:'minas',bough:'bow',party:'parti',tare:'tear',led:'lead',honorable:'hon',wined:'wind',
      wineds:'winds',mister:'mr',doctor:'dr',missus:'mrs',miz:'ms',
      one:'1',two:'2',three:'3',four:'4',five:'5',six:'6',
      seven:'7',eight:'8',nine:'9',ten:'10'};
    return aliases[clean]||clean;
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
        for(const span of wordSpans(node.textContent))
          visible.push({...span,node,key:comparableWord(span.word)});
      }
    }
    if(!visible.length||!spokenWords.length)return null;
    const spoken=spokenWords.map(x=>comparableWord(x.word));
    const target=Math.max(0,Math.min(position,spoken.length-1));
    // Align the spoken-only normalization and the original printed words.
    // A lookahead skips extra heading tokens and abbreviation expansions.
    let i=0,j=0;
    while(i<=target&&j<visible.length){
      if(spoken[i]===visible[j].key){
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
    const spokenWords=[];let selected=0,seen=0;
    for(let i=0;i<utterances.length;i++){
      const words=wordSpans(utterances[i].text.replace(/—\s*$/,''));
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
  function speakWithPauses(synth,utterances,isCurrent,isPaused){
    clearReading();
    if(!utterances||!utterances.length)return null;
    let index=0,offset=0,paused=false,disposed=false,serial=0,timer=null;
    let current=null,lastBoundary=0;
    const session={
      pause(){
        if(disposed||paused||!isCurrent())return false;
        paused=true;
        if(timer!==null){clearTimeout(timer);timer=null;}
        if(current){
          offset=lastBoundary;
          serial++;current=null;
          // Intentionally stop TTS and retain the last reported word.
          try{synth.cancel();}catch{}
        }
        markPausedWord(utterances,index,offset);
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
        clearPausedHighlight();
      },
      getPosition(){return {index,offset,paused};}
    };
    activeReading=session;
    function play(){
      if(disposed||paused||!isCurrent()||index>=utterances.length)return;
      const source=utterances[index],raw=String(source.text);
      const tail=raw.slice(offset);
      const leading=tail.length-tail.trimStart().length;
      const start=offset+leading;
      const spoken=tail.trimStart().replace(/—\s*$/,'').trimEnd();
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
      u.onstart=e=>{if(id!==serial||disposed)return;source.onstart?.(e);};
      u.onboundary=e=>{
        if(id!==serial||disposed||paused)return;
        if(typeof e?.charIndex==='number'&&e.charIndex>=0&&
          (!e.name||e.name==='word')){
          lastBoundary=base+e.charIndex;
        }
        source.onboundary?.(e);
      };
      u.onend=e=>{if(id!==serial||disposed||paused)return;complete(e);};
      u.onerror=e=>{if(id!==serial||disposed||paused)return;source.onerror?.(e);};
      current=u;lastBoundary=base;
      synth.speak(u);
    }
    function complete(e){
      if(disposed||paused)return;
      const original=utterances[index];
      current=null;offset=0;index++;
      const trailingDash=/—\s*$/.test(original.text);
      const delay=trailingDash?Math.max(430,pauseAfter(original.text)):pauseAfter(original.text);
      original.onend?.(e||{});
      if(disposed||!isCurrent())return;
      if(index<utterances.length){
        timer=setTimeout(()=>{timer=null;play();},delay);
      }else if(activeReading===session){
        activeReading=null;
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
  }

  root.OpheliaNarration=Object.freeze({version:'1.4.4',normalizeForSpeech,speechChunks,speakWithPauses,pauseAfter,pauseReading,resumeReading,clearReading});
})(window);
