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
assert.equal(n.normalizeForSpeech('He had read the letter.'),
  'He had red the letter.');
assert.equal(n.normalizeForSpeech('CHAPTER VIII'), 'Chapter eight');
assert.equal(n.normalizeForSpeech('I shall read it.'),'I shall read it.');

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
console.log('Narration checks passed. Actual pronunciation remains device-voice dependent.');
