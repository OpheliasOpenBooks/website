/* Regression guard: fairy-tale readers must use Jane Eyre's shared
 * punctuation-sensitive speech scheduler, not arbitrary character cuts.
 * Run: node tests/fairy-tale-narration.test.cjs
 */
'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const fairy=['tales-of-mother-goose.html','andersen-fairy-tales.html','grimms-fairy-tales.html','more-grimm-fairy-tales.html'];
for(const name of fairy){
 const src=fs.readFileSync(path.join(root,name),'utf8');
 assert.match(src,/ophelia-narration\.js\?v=1\.4\.\d+/,name+': shared module with cache-busting version');
 assert.match(src,/OpheliaNarration\.speechChunks\(/,name+': punctuation-sensitive segmentation');
 assert.match(src,/OpheliaNarration\.speakWithPauses\(/,name+': sequential pacing scheduler');
 for(const key of ['pauseReading?.()','resumeReading?.()','clearReading?.()'])
  assert.ok(src.includes(key),name+': '+key+' preserves pause position');
 assert.doesNotMatch(src,/current\.length\+word\.length\+1>180/,name+': arbitrary character chunks');
 assert.doesNotMatch(src,/\.onend\s*=\s*next\b/,name+': old immediate speech queue');
 assert.ok(src.includes("('speed').value"),name+': reader rate remains user-controlled');
}
console.log('Fairy-tale readers share Jane Eyre punctuation pacing and word-resume controls.');
