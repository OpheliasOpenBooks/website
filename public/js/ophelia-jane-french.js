/* Jane Eyre: source-verified French dialogue and literary expressions.
 * Voice routing only; never alter Charlotte Brontë's text, bookmarks,
 * page numbering, selected English narrator, or shared punctuation pacing.
 * Reviewed against the complete four-part locally hosted 1847 novel.
 */
(function(root){
 'use strict';
 const frenchPhrases=[
  "Il faut que je l’essaie!",
  "et à l’instant même!",
  "qu’il y aura là dedans un cadeau pour moi, et peut-être pour vous aussi, mademoiselle. Monsieur a parlé de vous: il m’a demandé le nom de ma gouvernante, et si elle n’était pas une petite personne, assez mince et un peu pâle. J’ai dit qu’oui: car c’est vrai, n’est-ce pas, mademoiselle?",
  "quand il y avait du monde, je le suivais partout, au salon et à leurs chambres; souvent je regardais les femmes de chambre coiffer et habiller les dames, et c’était si amusant: comme cela on apprend.",
  "Est-ce que je ne puis pas prendrie une seule de ces fleurs magnifiques, mademoiselle? Seulement pour completer ma toilette.",
  "Vos doigts tremblent comme la feuille, et vos joues sont rouges: mais, rouges comme des cerises!",
  "N’est-ce pas, monsieur, qu’il y a un cadeau pour Mademoiselle Eyre dans votre petit coffre?",
  "Mais oui, mademoiselle: voilà cinq ou six heures que nous n’avons pas mangé.",
  "et mes souliers? et mes bas? Tenez, je crois que je vais danser!",
  "du reste, il n’y avait pas de fées, et quand même il y en avait:",
  "C’est comme cela que maman faisait, n’est-ce pas, monsieur?",
  "Revenez bientôt, ma bonne amie, ma chère Mdlle. Jeannette,",
  "Monsieur, je vous remercie mille fois de votre bonté;",
  "Qu’avez vous donc? lui dit un de ces rats; parlez!",
  "ami, Monsieur Edouard Fairfax de Rochester,",
  "tiens-toi tranquille, enfant; comprends-tu?",
  "La Ligue des Rats: fable de La Fontaine.",
  "prête à croquer sa petite maman Anglaise",
  "Voilà, Monsieur Rochester, qui revient!",
  "pour me donner une contenance",
  "Mesdames, vous êtes servies!",
  "Elles changent de toilettes,",
  "Est-ce que ma robe va bien?",
  "Qu’avez-vous, mademoiselle?",
  "C’est là ma gouvernante?",
  "Oh ciel! Que c’est beau!",
  "Mais oui, certainement.",
  "Et cela doit signifier,",
  "père noble de théâtre.",
  "Oh, qu’elle y sera mal",
  "J’ai bien faim, moi!",
  "Ma boîte! ma boîte!",
  "Bonjour, mesdames.",
  "Monsieur Rochester",
  "Mademoiselle Eyre",
  "un vrai menteur,",
  "taille d’athlète",
  "Mdlle. Jeannette",
  "peu comfortable",
  "minois chiffoné",
  "Madame Frédéric",
  "contes de fée,",
  "par parenthèse",
  "Madame Pierrot",
  "Madame Fairfax",
  "chiffonnières",
  "porte-cochère",
  "et j’y tiens",
  "Mademoiselle",
  "beauté mâle",
  "tête-à-tête",
  "La Fontaine",
  "toilettes",
  "en règle",
  "protégée",
  "Monsieur",
  "Mesdames",
  "bonsoir",
  "passées",
  "façade",
  "cadeau",
  "Madame",
  "bonne",
  "roué"
];
 // Longest original-language phrases win; do not infer language from Adèle's
 // name in otherwise English passages (that would disrupt every sentence).
 const escapeRegex=value=>value.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
 const expression=new RegExp(
  '(?<![\\p{L}\\p{N}])(?:'+frenchPhrases.map(escapeRegex).join('|')+')(?![\\p{L}\\p{N}])',
  'giu');
 function languageRuns(value){
  const text=String(value||'').replace(/\u2060/g,'');
  let after=0;const runs=[];
  const push=(lang,segment)=>{
   if(!segment)return;
   const prev=runs.at(-1);
   if(prev&&prev.lang===lang)prev.text+=segment;
   else runs.push({text:segment,lang});
  };
  for(const m of text.matchAll(expression)){
   let start=m.index,end=start+m[0].length;
   // Include curly quotes in the original-language utterance where present.
   if(start>after&&/[“‘]/.test(text[start-1]))start--;
   if(end<text.length&&/[”’]/.test(text[end]))end++;
   if(start<after)continue;
   push('en',text.slice(after,start));
   push('fr-FR',text.slice(start,end));
   after=end;
  }
  push('en',text.slice(after));
  return runs;
 }

 // Browser TTS cannot clone voices; match synthesis family when available.
 function chooseFrenchVoice(voices,english,preferredURI){
  const list=Array.from(voices||[]).filter(v=>/^fr(?:-|$)/i.test(v.lang||''));
  if(!list.length)return null;
  const preferred=preferredURI&&list.find(v=>v.voiceURI===preferredURI);
  if(preferred)return preferred;
  const detail=v=>String(v?.name||'').toLowerCase()+' '+String(v?.voiceURI||'').toLowerCase();
  const engine=v=>['microsoft','google','apple','samsung','espeak','mozilla']
    .find(w=>detail(v).includes(w))||'';
  const styles=v=>['natural','neural','enhanced','premium','online','compact']
    .filter(w=>detail(v).includes(w));
  const enEngine=english?engine(english):'',enStyles=english?styles(english):[];
  return list.map((v,i)=>{
   let score=/^fr-fr$/i.test(v.lang)?4:0;
   if(english){
    if(enEngine&&engine(v)===enEngine)score+=16;
    if(typeof english.localService==='boolean'&&v.localService===english.localService)score+=6;
    for(const s of enStyles)if(styles(v).includes(s))score+=5;
    if(v.name===english.name)score+=18;
   }
   return {v,i,score};
  }).sort((a,b)=>b.score-a.score||a.i-b.i)[0].v;
 }
 function frenchDelivery(englishRate,tempo=1,pitch=1){
  const num=(n,def)=>Number.isFinite(Number(n))?Number(n):def;
  const clamp=(n,low,high)=>Math.max(low,Math.min(high,n));
  return {rate:clamp(num(englishRate,1)*clamp(num(tempo,1),.75,1.35),.5,2),
   pitch:clamp(num(pitch,1),.75,1.25),volume:1};
 }
 function spokenChunks(value,grammar){
  if(typeof grammar!=='function')throw new TypeError('Shared narrator required');
  const out=[];
  for(const run of languageRuns(value)){
   // The printed nineteenth-century abbreviation is untouched.
   // Expand only the off-screen French utterance for natural speech.
   const voiced=run.lang==='fr-FR'?run.text.replace(/\bMdlle\./g,'Mademoiselle'):run.text;
   for(const chunk of grammar(voiced)){
    if(/[\p{L}\p{N}]/u.test(chunk))out.push({text:chunk,lang:run.lang});
   }
  }
  return out;
 }
 root.OpheliaJaneFrench=Object.freeze({
  phrases:Object.freeze(frenchPhrases),languageRuns,spokenChunks,chooseFrenchVoice,frenchDelivery
 });
})(window);
