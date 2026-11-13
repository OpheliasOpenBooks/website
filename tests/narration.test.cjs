/* Regression tests for Ophelia's Open Book shared narration.
 * Run locally with: node tests/narration.test.cjs
 * These tests verify text preparation and scheduling, not a device voice's acoustic output.
 */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');

const timers=[];
const sandbox={
  window:{},
  document:{readyState:'complete',querySelectorAll:()=>[],addEventListener:()=>{}},
  setTimeout(fn,ms){timers.push({fn,ms});return timers.length;},
};
const source=fs.readFileSync(path.join(__dirname,'..','public','js','ophelia-narration.js'),'utf8');
vm.runInNewContext(source,sandbox,{filename:'ophelia-narration.js'});
const n=sandbox.window.OpheliaNarration;
assert.ok(n&&n.speechChunks&&n.speakWithPauses,'shared narrator is available');

// Change spoken text, NEVER the visible historical manuscript.
assert.equal(n.normalizeForSpeech('The others bow and call her Queen Eleanor.'),
  'The others bough and call her Queen Eleanor.');
assert.equal(n.normalizeForSpeech('Please bow to the Queen.'),
  'Please bough to the Queen.');
assert.equal(n.normalizeForSpeech('He made a low bow.'),
  'He made a low bough.');
assert.equal(n.normalizeForSpeech('Robin took his bow to shoot.'),
  'Robin took his bow to shoot.');
assert.equal(n.normalizeForSpeech('Robin drew his bow and arrow.'),
  'Robin drew his bow and arrow.');
// Dracula examples: a courteous/courtly/grateful gesture uses the vowel in "cow".
assert.equal(n.normalizeForSpeech('With a courteous bow, he opened the door.'),
  'With a courteous bough, he opened the door.');
assert.equal(n.normalizeForSpeech('with a courtly bow, he quickly left me.'),
  'with a courtly bough, he quickly left me.');
assert.equal(n.normalizeForSpeech('He took it with a grateful bow, and said hello.'),
  'He took it with a grateful bough, and said hello.');
assert.equal(n.normalizeForSpeech('What could I do but bow acceptance?'),
  'What could I do but bough acceptance?');
assert.equal(n.normalizeForSpeech('His Last Bow'), 'His Last Bough');
assert.equal(n.normalizeForSpeech('On deck, the sailor stood at the bow.'),
  'On deck, the sailor stood at the bough.');
// Other senses must never be accidentally converted.
assert.equal(n.normalizeForSpeech('The musician played with her violin bow.'),
  'The musician played with her violin bow.');
assert.equal(n.normalizeForSpeech('The bow-window overlooked the street.'),
  'The bow-window overlooked the street.');
assert.equal(n.normalizeForSpeech('The shop stood on Bow Street.'),
  'The shop stood on Bow Street.');
assert.equal(n.normalizeForSpeech('A stone front with a bow on it.'),
  'A stone front with a bow on it.');
assert.equal(n.normalizeForSpeech('He had read the letter.'),
  'He had red the letter.');
assert.equal(n.normalizeForSpeech('CHAPTER VIII'), 'Chapter eight');
assert.equal(n.normalizeForSpeech('I shall read it.'),'I shall read it.');

// The mechanical verb "wind" rhymes with "kind"; weather wind does not.
assert.equal(n.normalizeForSpeech('My watch was still unwound, and I am rigorously accustomed to wind it the last thing before going to bed.'),
  'My watch was still unwound, and I am rigorously accustomed to wined it the last thing before going to bed.');
assert.equal(n.normalizeForSpeech('He winds his watch.'), 'He wineds his watch.');
assert.equal(n.normalizeForSpeech('I wind the clock each night.'), 'I wined the clock each night.');
assert.equal(n.normalizeForSpeech('Wind up the pocket-watch.'), 'Wined up the pocket-watch.');
assert.equal(n.normalizeForSpeech('The wind howled through the castle.'), 'The wind howled through the castle.');
assert.equal(n.normalizeForSpeech('The winter winds blew violently.'), 'The winter winds blew violently.');
assert.equal(n.normalizeForSpeech('The road winds through the mountains.'), 'The road winds through the mountains.');
assert.equal(n.normalizeForSpeech('I heard the wind and saw my watch on the table.'),
  'I heard the wind and saw my watch on the table.');

// Dracula name: "Mina" should be spoken with a long "ee" like "Meena".
assert.equal(n.normalizeForSpeech('Mina Murray'), 'Meena Murray');
assert.equal(n.normalizeForSpeech('Dear Mina,'), 'Dear Meena,');
assert.equal(n.normalizeForSpeech('MINA'), 'Meena');
assert.equal(n.normalizeForSpeech("Mina's diary"), 'Meenas diary');
assert.equal(n.normalizeForSpeech('The miners worked in the mine.'),
  'The miners worked in the mine.');
assert.equal(n.speechChunks('Mina was waiting.').join(' '), 'Meena was waiting.');

// Sentence boundaries, honorifics and chapter/title pause handling.
assert.equal(n.speechChunks('Mr. Darcy spoke. Then Elizabeth replied.').length,2);
assert.equal(n.speechChunks('Chapter One. The evening fell.').length,2);
assert.ok(n.pauseAfter('The Merry Adventures of Robin Hood.')>=550);
assert.ok(n.pauseAfter('And then he left.')>=250);
assert.ok(n.pauseAfter('Was he there?')>=300);
assert.ok(n.pauseAfter('He said;')>=200);

// Speech must be started sequentially, with an observable delay.
const heard=[],ended=[];
const synth={speak(u){heard.push(u.text);u.onend?.({});}};
const utterances=[
  {text:'A Chapter Title.',onend:()=>ended.push('title')},
  {text:'He made a low bow.',onend:()=>ended.push('body')},
];
n.speakWithPauses(synth,utterances,()=>true,()=>false);
assert.deepEqual(heard,['A Chapter Title.']);
assert.equal(ended[0],'title');
assert.ok(timers.length&&timers[0].ms>=250);
timers.shift().fn();
assert.deepEqual(heard,['A Chapter Title.','He made a low bow.']);
assert.deepEqual(ended,['title','body']);

// Pause/resume keeps the active word, ignores cancelled utterance events and
// replays only the unfinished portion with the original voice and speed.
const contentEl={children:[],normalize(){for(let i=this.children.length-1;i>0;i--){
  const a=this.children[i-1],b=this.children[i];
  if(a.kind==='text'&&b.kind==='text'){a.textContent+=b.textContent;this.children.splice(i,1);}
}},replaceChild(next,old){const at=this.children.indexOf(old);
  assert.ok(at>=0,'highlight is attached to the visible page');
  this.children.splice(at,1,next);next.parentNode=this;old.parentNode=null;
}};
function textNode(value){
  return {kind:'text',textContent:value,parentNode:null,
    splitText(at){const tail=textNode(this.textContent.slice(at));this.textContent=this.textContent.slice(0,at);
      tail.parentNode=this.parentNode;const items=this.parentNode.children;
      items.splice(items.indexOf(this)+1,0,tail);return tail;}
  };
}
const visibleText=textNode('He spoke to Mina quietly.');
visibleText.parentNode=contentEl;contentEl.children.push(visibleText);
sandbox.NodeFilter={SHOW_TEXT:4};
sandbox.document.getElementById=id=>id==='prose'?contentEl:null;
sandbox.document.createTreeWalker=container=>{
  const nodes=container.children.filter(c=>c.kind==='text');let k=0;
  return {nextNode:()=>nodes[k++]||null};
};
sandbox.document.createElement=tag=>({kind:tag,textContent:'',parentNode:null,
  setAttribute(){}});
sandbox.document.createTextNode=textNode;
sandbox.document.head={appendChild(){}};
let cancels=0;
const spoken=[];
const resumableSynth={
  speak(u){spoken.push(u);},
  cancel(){cancels++;},
  resume(){}
};
let finished=0;
const toRead=[{text:'He spoke to Meena quietly.',lang:'en-GB',rate:1.1,
  onend(){finished++;}}];
n.speakWithPauses(resumableSynth,toRead,()=>true,()=>false);
assert.equal(spoken.length,1);
spoken[0].onboundary({name:'word',charIndex:12});
assert.equal(n.pauseReading(),true);
const yellowMark=contentEl.children.find(x=>x.kind==='mark');
assert.ok(yellowMark,'the paused word is marked in the visible page');
assert.equal(yellowMark.textContent,'Mina','printed spelling stays original');
assert.equal(yellowMark.className,'ophelia-paused-word');
assert.equal(cancels,1,'the browser voice is cancelled at its word boundary');
spoken[0].onend({}); // late browser cancellation must not finish the sentence
assert.equal(finished,0);
assert.equal(n.resumeReading(),true);
assert.equal(contentEl.children.find(x=>x.kind==='mark'),undefined);
assert.equal(contentEl.children.map(x=>x.textContent).join(''),'He spoke to Mina quietly.');
assert.equal(spoken[1].text,'Meena quietly.','resume from tracked word, not sentence start');
assert.equal(spoken[1].rate,1.1,'the chosen reading speed is retained');
assert.equal(spoken[1].lang,'en-GB','the chosen narrator locale is retained');
spoken[1].onend({});
assert.equal(finished,1,'a finished utterance is counted exactly once');
assert.equal(n.pauseReading(),false,'completed speech has no stale pause session');
n.clearReading();

// Keep the question pitch rule, even when playback is restarted mid-sentence.
const questions=[];
n.speakWithPauses({speak:u=>questions.push(u),cancel(){},resume(){}},
  [{text:'Is it safe?',pitch:1}],()=>true,()=>false);
assert.ok(questions[0].pitch>=1.11,'question receives a gentle rising-pitch cue');
n.clearReading();

console.log('Narration checks passed. Actual pronunciation remains device-voice dependent.');
