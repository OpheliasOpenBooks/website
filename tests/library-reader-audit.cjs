/* Static audit of the actual speaking readers across Ophelia’s catalog.
 * Excludes read-only primary-language editions, cover pages and music sheets.
 * Run: node tests/library-reader-audit.cjs
 */
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const html=fs.readdirSync(root).filter(file=>file.endsWith('.html'));
const knownExceptions=new Set(['reader.html','pride-and-prejudice.html','leaves-of-grass.html',
  'king-james-bible-1611.html','king-james-bible-1611-prefaces.html',
  'the-sound-and-the-fury.html','to-the-lighthouse.html','the-sun-also-rises.html']);
const documentedReadOnly=new Set(['king-james-bible-1611.html']);
const active=[];
const issues=[];
for(const file of html){
 const src=fs.readFileSync(path.join(root,file),'utf8');
 // Some language companions and non-reader pages link the shared script but
 // do not actually speak. Only check pages with an on-page TTS implementation.
 if(!/\bSpeechSynthesisUtterance\b|\bOpheliaNarration\.speakWithPauses\s*\(/.test(src))continue;
 if(documentedReadOnly.has(file))continue;
 active.push(file);
 if(!/public\/js\/ophelia-narration\.js\?v=1\.4\.\d+(?:[-.][\w-]+)?/.test(src))
  issues.push(file+': no versioned shared narration module');
 if(!src.includes('pauseReading?.()')||!src.includes('resumeReading?.()')||!src.includes('clearReading?.()'))
  issues.push(file+': missing shared word-resume handlers');
 if(!knownExceptions.has(file)&&!src.includes('OpheliaNarration.speechChunks('))
  issues.push(file+': missing shared grammatical sentence segmentation');
 if(!knownExceptions.has(file)&&!src.includes('OpheliaNarration.speakWithPauses('))
  issues.push(file+': missing shared sequential speech scheduler');
}
assert.ok(active.length>=100,'Expected to audit at least 100 speaking books, found '+active.length);
assert.deepEqual(issues,[],issues.join('\n'));
console.log('Audited '+active.length+' speaking reader pages; shared pacing and resumable narration verified in source.');
