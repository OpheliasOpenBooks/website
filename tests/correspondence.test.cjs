/* Public correspondence: profanity, source safety and authorization regressions.
 * No database calls or external credentials needed for these pure checks.
 */
'use strict';
const assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url');
const path=require('node:path'),fs=require('node:fs');
(async()=>{
 const backend=await import(pathToFileURL(path.resolve(__dirname,'../correspondence-worker/worker.mjs')).href);
 const {screenedText,allowedOrigin}=backend;
 assert.equal(screenedText('A splendid book from Charlotte Brontë.').offensive,false);
 assert.equal(screenedText('Ash Wednesday is a notable poem.').offensive,false);
 assert.equal(screenedText('The narration of Jane Eyre needs attention.').offensive,false);
 assert.equal(screenedText('This is sh!t.').offensive,true);
 assert.equal(screenedText('What the f.u.c.k').offensive,true);
 assert.equal(screenedText('Thank you for your letter.').links,false);
 assert.equal(screenedText('visit https://example.com').links,true);
 assert.equal(screenedText('<script>alert(1)</script>').markup,true);
 assert.equal(allowedOrigin('https://opheliasopenbooks.github.io'),true);
 assert.equal(allowedOrigin('https://opheliasopenbooks.github.io.evil.example'),false);
 assert.equal(allowedOrigin('http://opheliasopenbooks.github.io'),false);
 assert.equal(allowedOrigin('https://untrusted.example'),false);
 const html=fs.readFileSync(path.resolve(__dirname,'../correspondence.html'),'utf8');
 const editor=fs.readFileSync(path.resolve(__dirname,'../editor-desk.html'),'utf8');
 const inbox=fs.readFileSync(path.resolve(__dirname,'../editors-inbox.html'),'utf8');
 const config=fs.readFileSync(path.resolve(__dirname,'../public/correspondence-config.js'),'utf8');
 const frontend=fs.readFileSync(path.resolve(__dirname,'../public/js/ophelia-correspondence.js'),'utf8');
 assert.match(html,/data-correspondence="public"/);
 assert.match(editor,/data-correspondence="editor"/);
 assert.match(inbox,/data-correspondence="inbox"/);
 assert.ok(config.includes('apiBase:""'),'messages stay disabled until backend configured');
 assert.ok(frontend.includes("textContent=text"),'user text rendered safely');
 assert.ok(frontend.includes('[data-send]'),'offline send button disabled');
 assert.ok(editor.includes('name="book"')&&editor.includes('name="page"'));
 assert.ok(!/form action="mailto:/i.test(editor),'editor correspondence never sends email');
 console.log('Correspondence validation and page safety checks passed.');
})().catch(e=>{console.error(e);process.exitCode=1});
