/* Ensures every standalone reading page uses the unified narration code.
 * Run: node tests/library-reader-audit.cjs
 */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const hubs=new Set(['index.html','catalog.html','leatherstocking-tales.html','the-forsyte-saga.html','outline-of-history.html']);
const verse=new Set(['leaves-of-grass.html']);
const html=fs.readdirSync(root).filter(file=>file.endsWith('.html')&&!hubs.has(file));
assert.ok(html.length>=50,'expected the complete active reader collection');
for(const file of html){
  const code=fs.readFileSync(path.join(root,file),'utf8');
  assert.ok(code.includes('public/js/ophelia-narration.js?v=1.4.0'),
    file+' must load the current shared narrator, with a cache-busting version');
  assert.ok(code.includes('pauseReading?.()')&&code.includes('resumeReading?.()')&&code.includes('clearReading?.()'),
    file+' must use the shared word-resumable pause controls');
  if(verse.has(file)){
    assert.ok(code.includes('function narrationScore()'),file+' must preserve poetry-line timing');
    assert.ok(code.includes('speakWithPauses(window.speechSynthesis,[u]'),file+' must track line positions');
  }else{
    assert.ok(code.includes('OpheliaNarration.speechChunks(text)'),
      file+' must delegate sentence segmentation to shared grammar engine');
    assert.ok(code.includes('OpheliaNarration.speakWithPauses(synth,speechQueue'),
      file+' must use the shared sequential pacing scheduler');
  }
}
console.log('All '+html.length+' speaking readers use the shared narration standard.');
