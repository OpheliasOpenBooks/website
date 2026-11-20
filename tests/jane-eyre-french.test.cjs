/* Jane Eyre: all four text parts, French language routing, English pacing,
 * and no changes to the printed manuscript or stored page state.
 * Run: node tests/jane-eyre-french.test.cjs
 */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const context={window:{}};
const frenchSource=fs.readFileSync(path.join(root,'public/js/ophelia-jane-french.js'),'utf8');
vm.runInNewContext(frenchSource,context);
const f=context.window.OpheliaJaneFrench;
assert.ok(f&&f.phrases.length>=60,'reviewed source-language expression registry');
const sample='“C’est là ma gouvernante?” said she. “Mais oui, certainement.” “Are they foreigners?”';
const runs=Array.from(f.languageRuns(sample));
assert.equal(runs.map(x=>x.text).join(''),sample,'historical source is unmodified');
assert.equal(runs.length,4,'separate English from both French dialogue lines');
assert.equal(runs[0].lang,'fr-FR');
assert.equal(runs[1].lang,'en');
assert.equal(runs[2].lang,'fr-FR');
assert.equal(runs[3].lang,'en');
const short=f.spokenChunks('The English sentence. “Mais oui, certainement.” She smiled.',s=>[s]);
assert.equal(short.length,3);
assert.equal(short[0].lang,'en');
assert.equal(short[1].lang,'fr-FR');
assert.equal(short[2].lang,'en');
assert.ok(f.spokenChunks('Mdlle. Jeannette',s=>[s])[0].text.includes('Mademoiselle'),'French abbreviation expanded in voice only');
assert.equal(f.languageRuns('Adèle spoke English to Jane.').length,1,
 'avoid disruptive narrator switches for names in English prose');
let frenchPassages=0;
const counts=[];
for(let i=1;i<=4;i++){
 const file='public/books/jane-eyre-standard-0'+i+'.txt';
 const source=fs.readFileSync(path.join(root,file),'utf8').replace(/\u2060/g,'');
 const sections=Array.from(f.languageRuns(source));
 assert.equal(sections.map(x=>x.text).join(''),source,file+' must stay unchanged');
 const french=sections.filter(x=>x.lang==='fr-FR');
 counts.push(french.length);
 frenchPassages+=french.length;
}
assert.ok(frenchPassages>=75,'French quotes and literary phrases across the complete novel');
assert.ok(counts[1]>=50,'French dialogue around Adèle and the page-134 passage is covered');
const html=fs.readFileSync(path.join(root,'jane-eyre.html'),'utf8');
assert.ok(html.includes('ophelia-jane-french.js?v=1.1-voice-match'),'language module loaded in Jane reader');
assert.ok(html.includes('OpheliaJaneFrench.spokenChunks(getText(),speechChunks)'),'language-aware speech segments');
assert.ok(html.includes("u.lang=frenchVoice?.lang||'fr-FR'"),'French utterance locale is set');
assert.ok(html.includes("u.lang=voice?.lang||'en-GB'"),'English narrator remains selected');
assert.ok(html.includes('OpheliaNarration.speakWithPauses(synth,speechQueue'),'same punctuation pacing and word highlighting');
assert.ok(html.includes("const STORAGE='ophelia-jane-eyre-1847-alice-voice-v1'"),'reading positions retained');

// Same-family French voice is preferred without replacing the English voice.
const english={voiceURI:'en',lang:'en-GB',name:'Microsoft English Online (Natural)',localService:false};
const otherFrench={voiceURI:'frlocal',lang:'fr-FR',name:'Local French',localService:true};
const familyFrench={voiceURI:'frms',lang:'fr-FR',name:'Microsoft French Online (Natural)',localService:false};
assert.equal(f.chooseFrenchVoice([english,otherFrench,familyFrench],english,'').voiceURI,'frms');
assert.equal(f.chooseFrenchVoice([english,otherFrench,familyFrench],english,'frlocal').voiceURI,'frlocal');
assert.equal(f.chooseFrenchVoice([english],english,''),null);
assert.equal(f.frenchDelivery(1,1,1).rate,1);
assert.equal(f.frenchDelivery(1,1,1).pitch,1);
assert.equal(f.frenchDelivery(1.2,1.25,.9).rate,1.5);
assert.equal(f.frenchDelivery(1.2,1.25,.9).pitch,.9);
assert.equal(f.frenchDelivery(2,1.35,1.25).rate,2);
assert.ok(html.includes('id="french-voice"'));
assert.ok(html.includes('id="french-tempo"'));
assert.ok(html.includes('id="french-pitch"'));
assert.ok(html.includes('u.rate=frenchDelivery.rate;u.pitch=frenchDelivery.pitch;u.volume=frenchDelivery.volume;'));
assert.ok(html.includes('u.rate=state.speed;u.pitch=1;u.volume=1;'));

console.log('Jane Eyre: '+frenchPassages+' French speech runs recognized across four source parts; English reading preserved.');
