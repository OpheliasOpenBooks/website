/* Ensures every standalone reading page uses the unified narration code.
 * Run: node tests/library-reader-audit.cjs
 */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const hubs=new Set(['index.html','catalog.html','support.html','leatherstocking-tales.html','the-forsyte-saga.html','outline-of-history.html']);
const verse=new Set(['leaves-of-grass.html']);
const verseReaders=new Set(['king-james-bible-1611.html','king-james-bible-1611-prefaces.html',
  'the-sound-and-the-fury.html','to-the-lighthouse.html','the-sun-also-rises.html']);
const html=fs.readdirSync(root).filter(file=>file.endsWith('.html')&&!hubs.has(file));
assert.ok(html.length>=50,'expected the complete active reader collection');
for(const file of html){
  const code=fs.readFileSync(path.join(root,file),'utf8');
  // Different readers may have separate cache tags as speech rules evolve.
  // Require a versioned shared script, rather than pinning the whole library
  // to an obsolete exact tag after Dracula receives a speech correction.
  assert.ok(/public\/js\/ophelia-narration\.js\?v=1\.4\.\d+(?:[-.][\w-]+)?/.test(code),
    file+' must load the shared narrator with a versioned cache-busting URL');
  assert.ok(code.includes('pauseReading?.()')&&code.includes('resumeReading?.()')&&code.includes('clearReading?.()'),
    file+' must use the shared word-resumable pause controls');
  // Historical Bible readers use the same shared speech engine but their
  // chapter/verse and long-preface queues differ from the novel template.
  if(verseReaders.has(file)){
    assert.ok(code.includes('OpheliaNarration?.speechChunks')||code.includes('OpheliaNarration.speechChunks'),
      file+' must delegate text segmentation to the shared speech grammar engine');
    assert.ok(code.includes('OpheliaNarration.speakWithPauses('),
      file+' must use the shared sequential pause scheduler');
    continue;
  }
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
