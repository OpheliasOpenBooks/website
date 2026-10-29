'use strict';
const $=id=>document.getElementById(id);
const bookData=window.ALICE_BOOK;
const catalog=bookData.chapters.flatMap((chapter,ci)=>chapter.pages.map((page,pi)=>({...page,ci,pi,chapter:chapter.title,art:pi%2===0?`art/alice-${String(ci+1).padStart(2,'0')}-${String(pi+1).padStart(2,'0')}.png`:null})));
catalog[0].art='alice-riverbank.png';
const defaults={title:bookData.title,author:bookData.author,direction:'An elegant, theatrical storyteller with a gentle British inflection. Warm and curious in the narration; quick and anxious for the White Rabbit. Expressive pauses and subtle character changes. Keep every word of the original text.',size:20,speed:1,theme:'paper',art:true,highlight:true,autoTurn:true,page:0,finished:false,cues:[],edits:{},alts:{},voice:''};
const key='ophelia-alice-complete-v1';let state={...defaults};
try{const saved=JSON.parse(localStorage.getItem(key)||'null');if(saved&&typeof saved==='object')for(const k of Object.keys(defaults)){if(typeof saved[k]===typeof defaults[k]&&saved[k]!==null)state[k]=saved[k];}else{const old=JSON.parse(localStorage.getItem('ophelia-studio-v1')||'null');if(old)for(const k of ['size','speed','theme','art','highlight','autoTurn'])if(typeof old[k]===typeof defaults[k])state[k]=old[k];}}catch{}
state.page=Math.min(catalog.length-1,Math.max(0,Math.floor(Number(state.page)||0)));state.size=Math.min(30,Math.max(18,Number(state.size)||20));state.speed=Math.min(2,Math.max(.5,Number(state.speed)||1));if(!['paper','light','night'].includes(state.theme))state.theme='paper';if(!Array.isArray(state.cues))state.cues=[];
let mode='device',playing=false,paused=false,muted=false,voices=[],generation=0,startTimer=null,utterance=null,speechQueue=[],speechCursor=0,speechResumeAt=0,pageSpeechDone=false,audioURL=null,voiceChosen=Boolean(state.voice);
const audio=new Audio();audio.preload='metadata';
const originalText=i=>catalog[i].blocks.map(b=>b.text).join('\n\n');
const pageText=i=>Object.hasOwn(state.edits,i)?state.edits[i]:originalText(i);
const pageBlocks=i=>Object.hasOwn(state.edits,i)?state.edits[i].split(/\n\s*\n/).filter(Boolean).map(text=>({text,kind:text.includes('\n')?'verse':'prose'})):catalog[i].blocks;
function status(text){$('playback-status').textContent=text;$('playback-status').classList.toggle('sr-only',!/could not|unavailable|no narration|did not start|does not support|finished the book/i.test(text));}
function save(){try{localStorage.setItem(key,JSON.stringify(state));$('save-state').textContent='Saved on this browser';}catch{$('save-state').textContent='Browser storage unavailable. Export your project to keep it.';}}
function currentAlt(){return state.alts[state.page]||window.ALICE_ART?.[state.page]||'An original illustration for '+catalog[state.page].chapter+'.';}
function render(){const page=catalog[state.page];$('project-name').textContent=state.title;$('read-title').textContent=state.title;$('read-author').textContent='By '+state.author;$('read-chapter').textContent=(page.ci+1)+' · '+page.chapter;$('chapter-select').value=page.ci;$('page-select').value=state.page;$('chapter').value=page.chapter;$('script').value=pageText(state.page);$('book-title').value=state.title;$('author').value=state.author;$('word-count').textContent=pageText(state.page).trim().split(/\s+/).filter(Boolean).length+' words on this page';$('passage-count').textContent='Page '+(page.pi+1)+' of 4 in chapter';$('editor-page').textContent='Editing page '+(state.page+1)+' of '+catalog.length;
const passage=$('passage');passage.replaceChildren();for(const b of pageBlocks(state.page)){const el=document.createElement(b.kind==='verse'?'pre':'p');el.textContent=b.text;passage.append(el)}passage.style.fontSize=state.size+'px';$('book').dataset.theme=state.theme;$('reader-figure').hidden=!state.art||!page.art;if(page.art){$('reader-art').src=page.art;$('reader-art').alt=currentAlt();$('art-thumbnail').src=page.art;$('art-thumbnail').alt=currentAlt();}$('art-thumbnail').hidden=!page.art;$('art-caption').textContent=page.art?'Original illustration · '+page.chapter:'';$('alt').value=page.art?currentAlt():'';$('alt').disabled=!page.art;$('art-page-note').textContent=page.art?'An original scene for this illustrated page.':'This is a text-only page. Illustrations appear on every other page.';
$('page-label').textContent='Page '+(page.pi+1)+' of 4';$('navigation-page').textContent='Page '+(state.page+1)+' of '+catalog.length;$('previous').disabled=state.page===0;$('next').disabled=state.page===catalog.length-1;$('progress-text').textContent=(state.finished?'Completed':Math.round(state.page/catalog.length*100)+'% read')+' · Chapter '+(page.ci+1)+' of 12';$('book-progress').value=state.finished?catalog.length:state.page;
$('page-dots').replaceChildren();for(let i=page.ci*4;i<page.ci*4+4;i++){const b=document.createElement('button');b.textContent=i+1;b.type='button';b.setAttribute('aria-label','Go to page '+(i+1));b.setAttribute('aria-current',String(i===state.page));b.onclick=()=>go(i);$('page-dots').append(b)}$('size-output').textContent=state.size+' px';$('speed-output').textContent=state.speed+'×';transport();}
function cueValid(){return Boolean(audioURL&&Number.isFinite(audio.duration)&&catalog.every((_,i)=>Number.isFinite(state.cues[i])&&state.cues[i]>=0&&state.cues[i]<audio.duration&&(i===0||state.cues[i]>state.cues[i-1])));}
function turnHelp(){$('auto-turn').checked=state.autoTurn;$('auto-turn-help').textContent=mode==='silent'?'Choose narration in Voice & direction to listen.':mode==='device'?(state.autoTurn?'Continue to the next page and chapter when narration finishes.':'Stop after each page. Use the arrows to continue.'):(cueValid()?'Page turning follows your recording’s timings.':'Set a start time for all 48 pages to synchronize a full-book recording.');}
function transport(){const available=mode==='device'?'speechSynthesis' in window:mode==='file'&&audioURL&&Number.isFinite(audio.duration);$('play').disabled=!available||!pageText(state.page).trim();$('play-label').textContent=playing&&!paused?'Ⅱ Pause':paused?'▶ Resume':mode==='file'?'▶ Play':'▶ Read aloud';$('play').setAttribute('aria-label',playing&&!paused?'Pause narration':paused?'Resume narration':'Play narration');$('sound').textContent=muted?'Sound off':'Sound on';$('sound').setAttribute('aria-pressed',String(muted));$('sound').disabled=mode==='silent';$('passage').classList.toggle('narrating',playing&&!paused&&state.highlight&&!muted);$('preview-mode').textContent=mode==='silent'?'Silent reading':mode==='device'?'Browser narration':'Imported audio';$('narrator-picker').hidden=mode!=='device';$('seek-wrap').hidden=mode!=='file'||!audioURL;turnHelp();}
function stop(reset=false){generation++;clearTimeout(startTimer);if('speechSynthesis' in window)window.speechSynthesis.cancel();audio.pause();if(reset&&audioURL)audio.currentTime=0;playing=false;paused=false;utterance=null;speechQueue=[];speechResumeAt=0;pageSpeechDone=false;transport();}
// Boundaries follow English sentences, not a fixed number of characters.
// Keep the author's punctuation for the voice's own prosody.
function speechChunks(text){
 const clean=text.replace(/\*\s*/g,'').replace(/\s+/g,' ').trim();
 if(!clean)return [];
 // Mask non-terminal periods for segmentation only; slice the untouched source.
 const protectedText=clean
  .replace(/\b(?:Mr|Mrs|Ms|Dr|Prof|Rev|St|Capt|Lt|Col|Gen|Sr|Jr)\./gi,m=>m.replace(/\./g,'\uE000'))
  .replace(/\b(?:[A-Za-z]\.){2,}/g,m=>m.replace(/\./g,'\uE000'))
  .replace(/\b[A-Z]\.(?=\s+(?:[A-Z]\.|[A-Z][a-z]))/g,m=>m.replace('.','\uE000'))
  .replace(/(\d)\.(?=\d)/g,'$1\uE000');
 let segments;
 if(typeof Intl!=='undefined'&&typeof Intl.Segmenter==='function'){
  segments=Array.from(new Intl.Segmenter('en',{granularity:'sentence'}).segment(protectedText),x=>clean.slice(x.index,x.index+x.segment.length).trim());
 }else{
  // Fallback for older browsers: terminal punctuation plus its closing quotes.
  segments=[];let start=0;const ends=/[.!?]+[”’"')\]]*(?:\s+|$)/g;let m;
  while((m=ends.exec(protectedText))){segments.push(clean.slice(start,ends.lastIndex).trim());start=ends.lastIndex;}
  if(start<clean.length)segments.push(clean.slice(start).trim());
 }
 // A quotation followed by “said Alice” is still one spoken sentence.
 // Likewise keep parenthetical continuations and ellipses with their continuation.
 const sentences=[];
 for(const part of segments.filter(Boolean)){
  const previous=sentences.at(-1)||'';
  if(previous&&(/^[a-z,;:—–)\]]/.test(part)||/(?:\.\.\.|…)\s*[”’"']?$/.test(previous)))sentences[sentences.length-1]+=' '+part;
  else sentences.push(part);
 }
 const chunks=[];
 for(const sentence of sentences){
  if(sentence.length<=360){chunks.push(sentence);continue;}
  // Long Victorian sentences may need breaths. Use a clause boundary only;
  // never cut a word, name, unpunctuated phrase, or parenthetical aside in half.
  const cuts=[];let depth=0;
  for(let i=0;i<sentence.length;i++){
   const c=sentence[i];if(c==='('||c==='[')depth++;
   if(c===')'||c===']')depth=Math.max(0,depth-1);
   if(depth)continue;
   const tail=sentence.slice(i+1);
   if(/[;:—–]/.test(c)||c===','&&/^\s+(?:and|but|or|so|yet|for|while|although|which|who|when|where|because|as|if)\b/i.test(tail)){
    let end=i+1;while(/[”’"']/.test(sentence[end]||'')&&end<sentence.length)end++;
    // Require existing whitespace: joining chunks must reproduce the source.
    if(/\s/.test(sentence[end]||''))cuts.push(end);
   }
  }
  let start=0;
  while(sentence.length-start>360){
   const nearby=cuts.filter(c=>c-start>=100&&c-start<=320);
   const cut=nearby.at(-1)||cuts.find(c=>c-start>320);
   if(!cut||sentence.length-cut<40)break;
   chunks.push(sentence.slice(start,cut).trim());start=cut;
  }
  if(sentence.slice(start).trim())chunks.push(sentence.slice(start).trim());
 }
 return chunks;
}
function setNarrationSpeed(value){
 const next=Math.min(2,Math.max(.5,Number(value)||1)),wasPlaying=playing&&!paused,hadSpeech=mode==='device'&&playing,cursor=speechCursor;
 state.speed=next;audio.playbackRate=next;
 if(hadSpeech){stop();speechResumeAt=cursor;}
 $('speed').value=next;render();save();
 if(hadSpeech&&wasPlaying)speak(cursor);
 else if(hadSpeech)status('Speed changed. Press Read aloud to resume this spoken section.');
}
function scrollPage(){if(document.body.classList.contains('reading')){$('book').scrollIntoView({block:'start',behavior:'instant'});}}
function finishPage(){if(state.page===catalog.length-1){state.finished=true;playing=false;paused=false;save();render();status('You’ve finished the book. Thank you for reading with Ophelia.');return}if(state.autoTurn){state.page++;render();timingFields();save();scrollPage();speak()}else{playing=false;paused=false;transport();status('Page finished. Choose Next when you’re ready.');}}
function speak(startAt=0){
 if(muted||!pageText(state.page).trim())return;
 const synth=window.speechSynthesis;
 if(!synth){status('This browser does not support read-aloud. Try another browser or import a recording.');return;}
 generation++;clearTimeout(startTimer);synth.cancel();synth.resume();audio.pause();
 playing=true;paused=false;pageSpeechDone=false;const token=generation;
 const chunks=speechChunks(pageText(state.page)).slice(startAt);speechCursor=startAt;speechResumeAt=0;let started=false,completed=0;
 loadVoices();const voice=voices.find(v=>v.voiceURI===state.voice);
 // Queue the page in advance so the browser can prepare upcoming sentences.
 // Strong references remain until completion/cancel to retain utterance events.
 speechQueue=chunks.map((text,i)=>{
  const u=new SpeechSynthesisUtterance(text);let ended=false;
  u.lang=voice?.lang||'en-GB';if(voice)u.voice=voice;u.rate=state.speed;u.volume=1;
  u.onstart=()=>{if(token!==generation||!playing)return;started=true;utterance=u;speechCursor=startAt+i;clearTimeout(startTimer);status('Reading page '+(state.page+1)+' of '+catalog.length+'.');transport();};
  u.onend=()=>{if(token!==generation||!playing||ended)return;ended=true;completed++;if(completed===chunks.length){clearTimeout(startTimer);speechQueue=[];pageSpeechDone=true;if(!paused)finishPage();}};
  u.onerror=e=>{if(token!==generation)return;stop();status('Narration could not continue ('+e.error+'). Choose another voice in Settings, then press Read aloud to restart this page.');};
  return u;
 });
 status('Starting narration…');
 try{for(const u of speechQueue){if(token!==generation)break;synth.speak(u);}}
 catch{stop();status('Narration could not start. Try another voice in Settings.');return;}
 if(token===generation&&!started)startTimer=setTimeout(()=>{if(token===generation&&!started&&!paused){stop();status('No narration started. Choose another voice in Settings; your device may need an English speech voice installed.');}},10000);
 transport();
}
async function play(){if(mode==='device'&&muted)muted=false;if(playing&&!paused){if(mode==='device')window.speechSynthesis.pause();else audio.pause();paused=true;status('Narration paused.');transport();return}if(paused){paused=false;if(mode==='device'&&pageSpeechDone){finishPage();return;}if(mode==='device')window.speechSynthesis.resume();else{try{await audio.play()}catch{playing=false;status('Playback could not resume. Press Play again.')}}transport();return}if(mode==='device'){speak(speechResumeAt);return}if(mode==='file'&&audioURL){if(cueValid()&&(audio.currentTime<state.cues[state.page]||(state.page+1<catalog.length&&audio.currentTime>=state.cues[state.page+1])||audio.ended))audio.currentTime=state.cues[state.page];audio.muted=muted;audio.playbackRate=state.speed;try{await audio.play();playing=true;paused=false;transport();status('Playing your imported recording.')}catch{status('Audio could not play. Try another supported file.')}}}
function go(index){const resume=playing&&!paused;stop();state.page=Math.max(0,Math.min(catalog.length-1,index));state.finished=false;render();timingFields();save();scrollPage();if(mode==='file'&&cueValid()){audio.currentTime=state.cues[state.page];if(resume)play()}else if(mode==='device'&&resume&&!muted)speak();else status('Page '+(state.page+1)+' of '+catalog.length+'.');}
function loadVoices(){const supported='speechSynthesis' in window;voices=supported?window.speechSynthesis.getVoices():[];const list=$('voice-list');list.replaceChildren();list.add(new Option(supported?'Automatic · browser default':'Read-aloud unavailable',''));for(const v of voices)list.add(new Option(v.name+' · '+v.lang,v.voiceURI));if(state.voice&&!voices.some(v=>v.voiceURI===state.voice))state.voice='';if(!voiceChosen&&!state.voice)state.voice=(voices.find(v=>/^en-GB/.test(v.lang))||voices.find(v=>/^en/.test(v.lang)))?.voiceURI||'';list.value=state.voice;list.disabled=!supported;transport();}
function selectPanel(name){const headings={manuscript:['01','The manuscript','All twelve chapters, in one place.'],voice:['02','Voice & direction','Give the story its character.'],art:['03','The illustrations','Wonder on every other page.'],settings:['04','Reader settings','A comfortable place to read.']};document.querySelectorAll('.panel').forEach(p=>p.hidden=p.id!=='panel-'+name);document.querySelectorAll('.nav-item').forEach(b=>{b.classList.toggle('active',b.dataset.panel===name);if(b.dataset.panel===name)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current')});const h=headings[name];$('step').textContent=h[0];$('panel-title').textContent=h[1];$('panel-subtitle').textContent=h[2];}
document.querySelectorAll('.nav-item').forEach(b=>b.onclick=()=>selectPanel(b.dataset.panel));
for(const c of bookData.chapters)$('chapter-select').add(new Option(c.id+'. '+c.title,c.id-1));for(let i=0;i<catalog.length;i++)$('page-select').add(new Option('Page '+(i+1)+' · Chapter '+(catalog[i].ci+1),i));$('chapter-select').onchange=()=>go(Number($('chapter-select').value)*4);$('page-select').onchange=()=>go(Number($('page-select').value));
for(const [id,k] of [['book-title','title'],['author','author'],['direction','direction']]){$(id).value=state[k];$(id).oninput=()=>{state[k]=$(id).value;render();save()};}
$('script').oninput=()=>{stop();state.edits[state.page]=$('script').value;state.cues=[];$('word-count').textContent=$('script').value.trim().split(/\s+/).filter(Boolean).length+' words on this page';const value=$('script').value;const cursor=$('script').selectionStart;render();$('script').value=value;$('script').setSelectionRange(cursor,cursor);save();};$('alt').oninput=()=>{state.alts[state.page]=$('alt').value;$('reader-art').alt=$('alt').value;save();};$('restore').onclick=()=>{stop();delete state.edits[state.page];state.cues=[];render();save();status('Original text restored for this page.');};
$('theme').value=state.theme;$('theme').onchange=()=>{state.theme=$('theme').value;render();save()};$('size').value=state.size;$('size').oninput=()=>{state.size=Number($('size').value);render();save()};$('speed').value=state.speed;$('speed').oninput=()=>setNarrationSpeed(Number($('speed').value));$('show-art').checked=state.art;$('show-art').onchange=()=>{state.art=$('show-art').checked;render();save()};$('highlight').checked=state.highlight;$('highlight').onchange=()=>{state.highlight=$('highlight').checked;transport();save()};
$('source').value=mode;$('device-controls').hidden=false;$('source').onchange=()=>{stop();mode=$('source').value;$('device-controls').hidden=mode!=='device';$('file-controls').hidden=mode!=='file';loadVoices();transport();status(mode==='silent'?'Read at your own pace.':mode==='device'?'Press Read aloud to hear this page.':'Choose a full-book recording and add page timings to synchronize it.');};$('voice-list').onchange=()=>{stop();state.voice=$('voice-list').value;voiceChosen=true;save();status('Voice changed. Press Read aloud to listen.');};if('speechSynthesis' in window)window.speechSynthesis.addEventListener('voiceschanged',loadVoices);
function timingFields(){const wrap=$('cue-fields');wrap.replaceChildren();const start=catalog[state.page].ci*4;for(let i=start;i<start+4;i++){const row=document.createElement('div');row.className='cue-row';const label=document.createElement('label');label.htmlFor='cue-'+i;label.textContent='Page '+(i+1)+' · seconds';const input=document.createElement('input');input.id='cue-'+i;input.type='number';input.min='0';input.step='0.1';input.value=Number.isFinite(state.cues[i])?state.cues[i]:'';input.oninput=()=>{state.cues[i]=input.value===''?null:Number(input.value);cueMessage();save()};row.append(label,input);wrap.append(row)}cueMessage();}
function cueMessage(){$('cue-status').textContent=cueValid()?'All page timings are in order. Listen through to check their accuracy.':'Showing timings for this chapter. Set all 48 page starts in increasing order for synchronized playback.';turnHelp();}
$('audio-upload').onchange=()=>{const file=$('audio-upload').files[0];if(!file)return;stop();if(audioURL)URL.revokeObjectURL(audioURL);audioURL=URL.createObjectURL(file);audio.src=audioURL;audio.load();state.cues=[];$('file-label').textContent=file.name+' · this browser session only';status('Loading recording…');transport()};audio.addEventListener('loadedmetadata',()=>{if(!Number.isFinite(audio.duration)||audio.duration<=0){status('This audio duration is unavailable. Choose another file.');return}$('duration').textContent=time(audio.duration);$('seek').max=audio.duration;timingFields();transport();status('Audio ready. Press Play to listen.')});audio.addEventListener('error',()=>{playing=false;paused=false;transport();status('This audio file could not load. Choose another recording.')});audio.addEventListener('ended',()=>{playing=false;paused=false;if(cueValid()&&state.page===catalog.length-1){state.finished=true;save();render()}transport();status('The recording has finished.')});
function time(n){n=Number.isFinite(n)?Math.max(0,Math.floor(n)):0;return Math.floor(n/60)+':'+String(n%60).padStart(2,'0')}
function cuePage(){let index=0;state.cues.slice(0,catalog.length).forEach((cue,i)=>{if(cue<=audio.currentTime)index=i});return index}
audio.addEventListener('timeupdate',()=>{$('seek').value=audio.currentTime;$('elapsed').textContent=time(audio.currentTime);if(mode==='file'&&cueValid()){const index=cuePage();if(state.autoTurn&&index!==state.page){state.page=index;render();timingFields();save();scrollPage()}else if(!state.autoTurn&&playing&&!paused&&index>state.page){audio.pause();audio.currentTime=state.cues[state.page+1];playing=false;paused=false;transport();status('Page finished. Choose Next when ready.')}}});$('seek').oninput=()=>{audio.currentTime=Number($('seek').value);if(cueValid()){state.page=cuePage();render();timingFields();save();scrollPage()}};
$('auto-turn').onchange=()=>{state.autoTurn=$('auto-turn').checked;transport();save()};$('reader-options-toggle').onclick=()=>{const open=$('reader-options').hidden;$('reader-options').hidden=!open;$('reader-options-toggle').setAttribute('aria-expanded',String(open))};$('play').onclick=play;$('previous').onclick=()=>go(state.page-1);$('next').onclick=()=>go(state.page+1);$('restart').onclick=()=>go(catalog[state.page].ci*4);$('sound').onclick=()=>{muted=!muted;audio.muted=muted;if(mode==='device'&&muted)stop();transport();status(muted?'Sound is off. Read at your own pace.':'Sound is on. Press Play to listen.')};
function openReader(){document.body.classList.add('reading');$('close-reader').hidden=false;window.scrollTo(0,0)}$('open-reader').onclick=()=>{openReader();$('close-reader').focus()};function closeReader(){document.body.classList.remove('reading');$('close-reader').hidden=true;$('open-reader').focus()}$('close-reader').onclick=closeReader;document.addEventListener('keydown',e=>{if(e.key==='Escape'&&document.body.classList.contains('reading'))closeReader()});
$('export').onclick=()=>{const data={format:'ophelia-studio-project',version:2,book:bookData,...state,narration:{status:'Browser speech; theatrical AI engine not connected'},audioIncluded:false};const url=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='ophelia-alice-complete.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};window.addEventListener('pagehide',()=>stop());render();timingFields();loadVoices();save();status('speechSynthesis' in window?'Press Read aloud to hear this page.':'Read-aloud is unavailable in this browser.');if(new URLSearchParams(location.search).has('read'))openReader();
