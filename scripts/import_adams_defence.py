#!/usr/bin/env python3
"""Import the complete 1787–88 Defence from the 1851–56 public-domain edited Works.
Run only in an isolated checkout. This script refuses to publish partial texts.
Sources: Online Library of Liberty, John Adams Works, vols 4, 5 and 6.
"""
from __future__ import annotations
import io, json, pathlib, posixpath, re, urllib.parse, urllib.request, zipfile
from xml.etree import ElementTree as ET
from bs4 import BeautifulSoup

ROOT = pathlib.Path(__file__).resolve().parents[1]
OUT = ROOT / "public" / "texts" / "adams-defence"
BASE = "https://oll-resources.s3.us-east-2.amazonaws.com/oll3/store/titles/"
URLS = {
    4: BASE + "2102/adams-the-works-of-john-adams-vol-4.epub",
    5: BASE + "2103/adams-the-works-of-john-adams-vol-5-defence-of-the-constitutions-vols-ii-and-iii.epub",
    6: BASE + "2104/adams-the-works-of-john-adams-vol-6.epub",
}
def compact(s):
    return re.sub(r"\s+", " ", s).strip()
def ordered_blocks(blob):
    with zipfile.ZipFile(io.BytesIO(blob)) as z:
        root = ET.fromstring(z.read("META-INF/container.xml"))
        opfname = next(e.attrib["full-path"] for e in root.iter() if e.tag.endswith("rootfile"))
        basedir = posixpath.dirname(opfname)
        opf = ET.fromstring(z.read(opfname))
        items = {x.attrib.get("id"): x.attrib for x in opf.iter() if x.tag.endswith("item")}
        spine = [x.attrib["idref"] for x in opf.iter() if x.tag.endswith("itemref")]
        sections = []
        for item_id in spine:
            m = items.get(item_id, {})
            if "html" not in m.get("media-type", ""):
                continue
            href = urllib.parse.unquote(m.get("href", "").split("#")[0])
            doc = posixpath.normpath(posixpath.join(basedir, href))
            soup = BeautifulSoup(z.read(doc), "html.parser")
            body = soup.body
            if not body: continue
            for unwanted in body.select("nav, aside, script, style, .footnotes, [epub\\:type='footnotes']"):
                unwanted.decompose()
            for node in body.find_all(re.compile(r"^h[1-6]$|^p$")):
                if node.find_parent(["nav", "aside", "table", "blockquote"]): continue
                for sup in node.find_all("sup"):
                    if len(sup.get_text(" ", strip=True)) < 8: sup.decompose()
                value = compact(node.get_text(" ", strip=True))
                if not value: continue
                sections.append((node.name.startswith("h"), value))
        return sections

def header(s):
    return re.sub(r"[^A-Z0-9 ]+", " ", s.upper()).strip()
def find_heading(seq, predicate, begin=0):
    for i in range(begin, len(seq)):
        is_h, s = seq[i]
        if is_h and predicate(header(s)): return i
    raise ValueError("Required source heading not found; nothing will be published.")
def text(seq):
    return "\n\n".join(s for _, s in seq).strip() + "\n"
def words(s):
    return len(s.split())
def main():
    source = {}
    for v, url in URLS.items():
        print("Downloading public-domain transcription", v, url, flush=True)
        req = urllib.request.Request(url, headers={"User-Agent":"OpheliasOpenBook-PublicDomainImporter/1.0"})
        with urllib.request.urlopen(req, timeout=90) as response:
            blob = response.read()
        if len(blob) < 25000: raise ValueError(f"Source {v} too small")
        source[v] = ordered_blocks(blob)
        print(f"Works volume {v}: {len(source[v])} text blocks", flush=True)
    s4, s5, s6 = [source[k] for k in (4, 5, 6)]
    start1 = find_heading(s4, lambda x: x == "THE DEFENCE")
    start2 = find_heading(s5, lambda x: x.startswith("A DEFENCE OF THE CONSTITUTIONS") and "VOLUME II" in x)
    start3 = find_heading(s5, lambda x: x.startswith("A DEFENCE OF THE CONSTITUTIONS") and "VOLUME III" in x, start2+1)
    cont3 = find_heading(s6, lambda x: x.startswith("A DEFENCE OF THE CONSTITUTIONS"))
    stop3 = find_heading(s6, lambda x: x.startswith("DISCOURSES ON DAVILA"), cont3+1)
    volumes = [
        text(s4[start1:]),
        text(s5[start2:start3]),
        text(s5[start3:]) + "\n" + text(s6[cont3:stop3]),
    ]
    # The EPUBs contain site-imposed page navigation and current-publisher information.
    # Preserve Adams's writings while stripping only this unrelated material.
    boiler = "\n\nLiberty Fund, Inc.\n\n"
    if boiler not in volumes[0] or len(volumes[0]) - volumes[0].index(boiler) > 15000:
        raise ValueError("Volume I OLL footer boundary not found")
    volumes[0] = volumes[0].split(boiler, 1)[0].strip() + "\n"
    duplicate = "\n\nA\n\nDEFENCE\n\nof the\n\nCONSTITUTIONS OF GOVERNMENT"
    boundary = volumes[1].rfind(duplicate)
    if boundary < len(volumes[1]) - 2000:
        raise ValueError("Volume II duplicate Volume III title not found")
    volumes[1] = volumes[1][:boundary].strip() + "\n"
    boundary = volumes[2].find(boiler)
    continuation = "\n\nA DEFENCE OF THE CONSTITUTIONS OF GOVERNMENT OF THE UNITED STATES OF AMERICA.\n\nCHAPTER FIRST."
    restart = volumes[2].find(continuation, boundary)
    if boundary < 400000 or restart < boundary:
        raise ValueError("Volume III OLL boilerplate boundary not found")
    volumes[2] = volumes[2][:boundary].strip() + "\n\n" + volumes[2][restart:].strip() + "\n"
    volumes = [re.sub(r"Edition:\s*current;\s*Page:\s*\[\s*\d+\s*\]", " ", v) for v in volumes]
    volumes = [re.sub(r" {2,}", " ", v) for v in volumes]
    required = [
        ("PRELIMINARY OBSERVATIONS", "SAN MARINO", "CARTHAGE", "CONCLUSION"),
        ("FLORENCE", "MACHIAVEL", "SIENA", "BOLOGNA"),
        ("PISTOIA", "CREMONA", "PADUA", "MARCHAMONT NEDHAM", "OBJECTIONS ANSWERED"),
    ]
    minwords = [35000, 35000, 42000]
    for i, data in enumerate(volumes):
        wc = words(data)
        print(f"Defence vol {i+1}: {wc:,} words")
        if wc < minwords[i]: raise ValueError(f"Vol {i+1} incomplete, {wc} words")
        missing = [m for m in required[i] if m not in data.upper()]
        if missing: raise ValueError(f"Vol {i+1} missing: {missing}")
        if "\ufffd" in data: raise ValueError(f"Vol {i+1} has corrupt text")
    # All verification must succeed BEFORE touching any site files.
    OUT.mkdir(parents=True, exist_ok=True)
    for i, data in enumerate(volumes):
        (OUT / f"volume-{i+1}.txt").write_text(data, encoding="utf-8")
    reader = ROOT / "a-defence-of-the-constitutions-john-adams.html"
    reader.write_text(HTML, encoding="utf-8")
    artpath = ROOT / "public" / "art" / "adams-defence-1787-titlepage.svg"
    artpath.parent.mkdir(parents=True, exist_ok=True)
    artpath.write_text(ART, encoding="utf-8")
    catalog = ROOT / "catalog.html"
    doc = catalog.read_text(encoding="utf-8")
    page = "a-defence-of-the-constitutions-john-adams.html"
    if page not in doc:
        entry = """ {title:'A Defence of the Constitutions of Government of the United States of America',author:'John Adams · 1787–1788 · Complete three-volume work',href:'a-defence-of-the-constitutions-john-adams.html',image:'public/art/adams-defence-1787-titlepage.svg',alt:'Period-faithful reproduction of the original 1787 London title page',description:'John Adams explores historical republics, the division of political authority, and the constitutional safeguards of liberty. The full three-volume work in our own narrated reader.',genre:'American History & Political Thought'},\n"""
        needle = "const catalogOnlyBooks=["
        if doc.count(needle) != 1: raise ValueError("Catalog insertion marker missing")
        doc = doc.replace(needle, needle + "\n" + entry, 1)
        catalog.write_text(doc, encoding="utf-8")
    sitemap = ROOT / "sitemap.xml"
    xml = sitemap.read_text(encoding="utf-8")
    url = "https://opheliasopenbooks.github.io/website/" + page
    if url not in xml:
        assert xml.count("</urlset>") == 1
        xml = xml.replace("</urlset>", f"  <url><loc>{url}</loc></url>\n</urlset>")
        sitemap.write_text(xml, encoding="utf-8")
    print("Validated and staged native reader, all 3 locally hosted volumes, cover, catalog, sitemap.")
HTML = r'''<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>A Defence of the Constitutions · John Adams · Ophelia’s Open Book</title>
<link rel="canonical" href="https://opheliasopenbooks.github.io/website/hard-times.html">
<meta property="og:type" content="article"><meta property="og:title" content="A Defence of the Constitutions · John Adams"><meta property="og:description" content="All three public-domain volumes by John Adams, in our own illustrated and narrated reader."><meta property="og:image" content="https://opheliasopenbooks.github.io/website/public/art/adams-defence-1787-titlepage.svg">
<meta name="description" content="Read and listen to all three complete 1787–1788 volumes of A Defence of the Constitutions by John Adams, hosted inside Ophelia’s Open Book.">
<style>
:root{--paper:#f8f5ed;--ink:#263e35;--green:#364b3e;--muted:#6c736b;--gold:#967039;--line:#dcded3;--white:#fffdf7}
*{box-sizing:border-box}html{scroll-behavior:smooth}body{margin:0;background:var(--paper);color:var(--ink);font:15px/1.6 Arial,sans-serif}button,input,select{font:inherit}button{cursor:pointer;border:0}button:disabled{opacity:.4;cursor:not-allowed}button:focus-visible,select:focus-visible,input:focus-visible,a:focus-visible{outline:3px solid #b7782d;outline-offset:3px}a{color:var(--green)}.home{position:fixed;left:27px;top:170px;border-radius:30px;background:var(--green);color:#fff;text-decoration:none;padding:10px 19px;font:14px Arial,sans-serif;z-index:5;box-shadow:0 2px 7px #263e3514}.home:hover{background:#173b2f}.shell{max-width:1255px;margin:0 auto;padding:24px 25px 60px}.reading-layout{display:grid;grid-template-columns:minmax(0,1fr) 228px;gap:23px;align-items:start}.book{background:var(--white);border:1px solid #e4dac6;border-radius:8px;box-shadow:0 10px 26px #3c432014;overflow:hidden}.book-heading{text-align:center;padding:27px 22px 21px}.eyebrow{font:700 10px/1.5 Arial,sans-serif;letter-spacing:1.5px;color:var(--gold)}.book-heading h1{font:normal clamp(36px,3.6vw,38px)/1.2 Georgia,serif;max-width:700px;margin:10px auto 8px;color:var(--ink)}.byline{font:italic 13px Georgia,serif;margin:0;color:#6c7363}figure{margin:0 22px}figure[hidden]{display:none!important}figure img{display:block;width:100%;height:auto;border-radius:3px}figcaption{font:italic 12px Georgia,serif;text-align:center;color:#867456;margin:10px 0}.content{padding:28px 42px 23px;scroll-margin-top:15px}.chapter-row{display:flex;justify-content:space-between;gap:15px;align-items:center;margin:0 0 18px}.chapter{font:700 10px Arial,sans-serif;letter-spacing:1.7px;color:var(--gold)}#prose{font:var(--text-size,20px)/1.8 Georgia,serif;color:var(--ink)}#prose p{margin:0 0 24px}#prose p.speaking{background:#e8edda;border-radius:4px}.endmark{text-align:center;font:19px Georgia,serif;color:#b09b73;margin:20px 0}.footer-nav{display:flex;align-items:center;justify-content:space-between;border-top:1px solid #eee9df;padding:13px 27px;gap:10px}.footer-nav button{padding:7px 12px;background:#f1f3ed;border-radius:22px;color:var(--green);font-size:12px}.footer-nav span{font:12px Georgia,serif;color:var(--muted)}.reader-controls{position:sticky;top:72px;background:var(--white);border:1px solid var(--line);box-shadow:0 4px 18px #273e3510;border-radius:9px;padding:17px;max-height:calc(100dvh - 85px);overflow-y:auto}.reader-controls label{display:block;font:700 12px Arial,sans-serif;margin:0 0 8px}.reader-controls select{display:block;width:100%;padding:10px 12px;border:1px solid #d7ddcd;background:var(--white);border-radius:5px;color:var(--ink);font:12px Arial,sans-serif}.reader-controls input[type=range]{width:100%;accent-color:#2c5841}.reader-controls .setting-label{margin:14px 0 7px}.progress{height:3px;background:#dce1d2;border-radius:4px;overflow:hidden;margin:15px 0 9px}.progress div{width:0;height:100%;background:#7b957f}#progresslabel{font:11px/1.6 Arial,sans-serif;color:var(--muted);padding:0 0 14px;border-bottom:1px solid var(--line)}.pagecount{text-align:center;font:15px Georgia,serif;margin:17px 0 13px}.transport{display:flex;align-items:center;justify-content:center;gap:6px}.nav-arrow{border-radius:50%;background:#f1f3ed;color:#58735e;width:36px;height:36px;font-size:20px}.play{border-radius:30px;background:var(--green);color:#fff;font:12px Arial,sans-serif;padding:12px 14px;white-space:nowrap;min-width:106px}.quiet{display:block;border:0;background:none;text-align:center;color:var(--green);font:12px Arial,sans-serif;width:100%;padding:10px 4px}.reader-controls .check{display:flex;align-items:center;justify-content:center;gap:8px;font:12px Arial,sans-serif;margin:0 0 8px}.check input{accent-color:var(--green)}#settings-toggle{border-top:1px solid var(--line);border-bottom:1px solid var(--line);padding:13px 2px;margin:12px 0 12px}#reader-options{border-bottom:1px solid var(--line);padding-bottom:15px;margin-bottom:12px}#reader-options[hidden]{display:none}#reader-options .check{margin-top:16px}.bookmarker{border-top:1px solid var(--line);margin-top:12px;padding-top:9px}.hint{font:11px/1.37 Arial,sans-serif;color:var(--muted);text-align:center}.status{font:11px/1.7 Arial,sans-serif;color:#59735a;text-align:center;min-height:20px;margin:12px 0 0}.load{padding:12px;background:#eaf0e6;border-radius:6px;margin:12px 0;font:11px/1.7 Arial,sans-serif}.load input{max-width:100%}.load label{margin-top:9px}.load a{font-size:11px}.hidden{display:none!important}.fine{font:11px/1.37 Arial,sans-serif;color:var(--muted);text-align:center;margin:15px 0 0}.fine a{font-size:11px}.source{max-width:750px;margin:20px auto;text-align:center;color:var(--muted);font:11px/1.6 Arial,sans-serif}.night{--paper:#15201d;--ink:#eeeade;--white:#27352e;--line:#526253;--green:#bdd2c0;--muted:#b4b9ae;--gold:#d4ad70}.night .home,.night .play{background:#346a4d;color:#fff}.night .reader-controls select{background:#27352e;color:#eeeade}.night .nav-arrow,.night .footer-nav button{background:#39473d;color:#f2ead4}.night #prose p.speaking{background:#405341}.night .book{border-color:#49544b}.night .reader-controls{box-shadow:none}.night figcaption{color:#dacaa7}
@media(max-width:1130px){.home{position:static;display:inline-block;margin:12px 0 0 20px}.shell{padding-top:10px}}@media(max-width:780px){.shell{padding:14px 12px 40px}.reading-layout{grid-template-columns:1fr}.reader-controls{grid-row:2;position:static;max-height:none}.content{padding:24px 19px}.book-heading{padding:22px 12px}.book-heading h1{font-size:36px}figure{margin:0 12px}.pagecount{margin:10px 0}#prose{font-size:var(--text-size,20px)}.footer-nav{padding:12px}}
#story-figure{background:#f4edda;border-radius:3px;padding:8px}#story-figure img{max-height:520px;width:100%;object-fit:contain}#story-figure figcaption{margin:10px 0 2px}
#story-figure img{max-height:480px;width:100%;object-fit:contain;background:#f4edda}#story-figure{background:#f4edda;padding:6px;border-radius:3px}
#prose p{white-space:pre-line;margin-bottom:22px;overflow-wrap:break-word}#prose p.speaker{font:700 .73em/1.5 Arial,sans-serif;letter-spacing:.13em;color:var(--gold);margin-bottom:8px}#prose p.stage{font-style:italic;color:var(--muted)}
.vintage-art{max-width:670px;min-height:250px;margin:auto;padding:30px;background:linear-gradient(145deg,#eee5d2,#cfdbc8);border:9px double #b9aa8b;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;color:#304937;text-align:center;font-family:Georgia,serif}.art-title{font-size:clamp(27px,4vw,44px);line-height:1.15}.art-author{font-style:italic;font-size:15px}.ornament{font-size:28px;color:#647a60}#story-figure{max-width:550px;margin:12px auto 30px;text-align:center}#story-figure img{max-height:440px;width:100%;object-fit:contain;background:#eee5d3;border:1px solid #d5c7b3;padding:11px}#prose p{white-space:pre-line;overflow-wrap:break-word}#prose p.roman-section{text-align:center;letter-spacing:2px;font-style:italic;color:#6a4d31}#prose em{font-style:italic}</style>
</head>
<body>
<nav style="max-width:1255px;margin:18px auto 0;padding:0 25px;display:flex;gap:22px;flex-wrap:wrap;font:14px Georgia,serif"><a href="catalog.html">← Browse the library</a><a href="index.html">Ophelia’s home</a></nav>
<div class="shell">
<div class="reading-layout">
<main class="book" aria-label="John Adams Defence of the Constitutions reader">
 <div class="book-heading"><div class="eyebrow">OPHELIA’S OPEN BOOK</div><h1>A Defence of the Constitutions of Government of the United States of America</h1><p class="byline">John Adams · 1787–1788 · The Presidential Library</p><p class="fine">Complete unabridged work · All three volumes · Hosted on Ophelia’s Open Book</p></div>
 <figure id="story-figure" hidden><img id="opening-art" src="public/art/adams-defence-1787-titlepage.svg" alt="Historically inspired typographic reproduction of the 1787 London title page, John Adams’s Defence of the Constitutions" loading="eager"><figcaption>Typographic reproduction based on the original 1787 title page · Not an original scan</figcaption></figure>
 <article class="content" id="content"><div class="chapter-row"><span id="chaptername" class="chapter"></span></div><div id="prose"><p>Preparing the three complete volumes…</p></div><div class="endmark" aria-hidden="true">— ❧ —</div></article>
 <div class="footer-nav"><button type="button" id="prev2" disabled>← Previous page</button><span id="footcount">John Adams · 1787–1788</span><button type="button" id="next2" disabled>Next page →</button></div>
</main>
<aside class="reader-controls" aria-label="Reading and listening controls">
 <label for="volume">Choose a volume</label><select id="volume" aria-label="Choose volume" disabled><option>Preparing volumes…</option></select>
 <label for="section">Chapters and prefaces</label><select id="section" aria-label="Choose chapter or preface" disabled><option>Preparing chapters…</option></select>
 <div class="progress" role="progressbar" aria-label="Reading progress" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><div id="progressbar"></div></div><p id="progresslabel">0% read · Volume 1</p>
 <div id="pagecount" class="pagecount">Page 1</div>
 <div class="transport"><button type="button" class="nav-arrow" id="prev" disabled aria-label="Previous page" title="Previous page">←</button><button type="button" id="play" class="play" disabled>▶ Read aloud</button><button type="button" class="nav-arrow" id="next" disabled aria-label="Next page" title="Next page">→</button></div>
 <button type="button" class="quiet" id="sound" aria-pressed="false">Sound on</button>
 <label class="check"><input id="autoturn" type="checkbox" checked> Auto-turn</label>
 <button type="button" class="quiet" id="settings-toggle" aria-expanded="false" aria-controls="reader-options">Settings</button>
 <div id="reader-options" hidden>
  <label class="setting-label" for="page">Go to page</label><select id="page" aria-label="Choose reading page" disabled><option>—</option></select>
  <label class="setting-label" for="voice">Narrator (device voice)</label><select id="voice"><option value="">Automatic English voice</option></select>
  <label class="setting-label" for="speed">Narration speed <output id="speedview">1×</output></label><input id="speed" type="range" min="0.5" max="2" value="1" step="0.05">
  <label class="setting-label" for="size">Text size <output id="sizeview">20 px</output></label><input id="size" type="range" min="16" max="28" value="20" step="1">
  <label class="check"><input id="dark" type="checkbox"> Evening theme</label>
 </div>
 <div class="bookmarker"><button class="quiet" type="button" id="bookmark">♡ Bookmark page</button><p class="hint" id="bookmarkhint">Your place and bookmark are saved on this device.</p></div>
 <p class="status" id="message" role="status">Checking the complete three-volume edition…</p>
 <div class="load hidden" id="loadbox"><strong>Unable to open the complete work</strong><p>All three volumes must be available before the reader opens. Please refresh the page. No outside reader is required.</p></div></aside>
</div>
<div class="source">John Adams’s <em>A Defence of the Constitutions of Government of the United States of America</em> (first issued 1787–1788), all three volumes. This locally hosted text is based on the public-domain edition in <em>The Works of John Adams</em> (1851–1856), edited by Charles Francis Adams, volumes 4–6, as digitized by the <a href="https://oll.libertyfund.org/" target="_blank" rel="noopener">Online Library of Liberty</a>. Original headings and the editor’s preface are retained. Modern publisher boilerplate and printed-page navigation have been removed. Voice narration uses your browser’s device voices.</div></div></div></div><script src="public/js/ophelia-narration.js?v=1.4.14-pacing-number"></script>
<script>
'use strict';
/* All source is editable. Narration reuses Alice’s grammar-aware sentence segmentation and queued speech strategy. Browser/device voices provide the actual spoken sound. */
const $=id=>document.getElementById(id);
const STORAGE='ophelia-adams-defence-1787-88-standard-v2';
const LEGACY='ophelia-adams-defence-1787-88-v1';
let oldPosition=null;
try{if(!localStorage.getItem(STORAGE))oldPosition=JSON.parse(localStorage.getItem(LEGACY)||'null')}catch{}
let state={page:0, voice:'', speed:1, size:20, night:false, autoTurn:true, bookmark:-1};
try{Object.assign(state,JSON.parse(localStorage.getItem(STORAGE)||'{}'));}catch{}
const save=()=>{try{localStorage.setItem(STORAGE,JSON.stringify(state));}catch{}};
let soundOn=true;
let initialRender=true;
let segments=[],pages=[],voiceList=[],speechToken=0, speaking=false,paused=false, speechQueue=[],speechCursor=0,speechResumeAt=0,pageSpeechDone=false,startTimer=null,utterance=null;
const note=text=>{$('message').textContent=text};
function romanToNumber(s){
 if(/^\d+$/.test(s))return Number(s);
 const v={I:1,V:5,X:10,L:50,C:100,D:500,M:1000};
 let n=0;for(let i=0;i<s.length;i++)n+=(v[s[i]]||0)<(v[s[i+1]]||0)?-v[s[i]]:v[s[i]];
 return n;
}
function parseAdams(volumes){
 if(!Array.isArray(volumes)||volumes.length!==3)throw Error('All three volumes are required.');
 const requiredWords=[130000,120000,150000];
 const headings=[
  ['PREFACE BY THE EDITOR.', 'CHAPTER I.:', 'CHAPTER X.:'],
  ['CHAPTER FIRST.:', 'CHAPTER SIXTH.:'],
  ['CHAPTER SEVENTH.:', 'CHAPTER TENTH.:', 'CHAPTER FIRST.: MARCHAMONT NEDHAM', 'CHAPTER FOURTH.: CONCLUSION.']
 ];
 const sections=[];
 const numbers={FIRST:1,SECOND:2,THIRD:3,FOURTH:4,FIFTH:5,SIXTH:6,SEVENTH:7,EIGHTH:8,NINTH:9,TENTH:10};
 for(let volume=0;volume<3;volume++){
   const raw=volumes[volume].replace(/\r\n?/g,'\n').trim();
   if(raw.split(/\s+/).length<requiredWords[volume]||headings[volume].some(h=>!raw.includes(h))||raw.includes('Liberty Fund, Inc.')||raw.includes('Edition: current; Page:'))throw Error('Volume '+(volume+1)+' failed completeness or editorial checks.');
   const paragraphs=raw.split(/\n\s*\n/).map(p=>p.split('\n').map(s=>s.trim()).join(' ').replace(/\s+/g,' ').trim()).filter(Boolean);
   let section={name:'Volume '+(volume+1)+' · Title and Introduction',volume,paragraphs:[]};
   const push=()=>{if(section.paragraphs.length){sections.push(section)}};
   for(const rawParagraph of paragraphs){
     let paragraph=rawParagraph.replace(/\[\s*\d{1,3}\s*\]/g,'').replace(/(^|\s)[*†‡](?=\s|$)/g,' ').replace(/ {2,}/g,' ').trim();
     if(!paragraph)continue;
     const chapter=paragraph.match(/^CHAPTER\s+([IVXLCDM]+|FIRST|SECOND|THIRD|FOURTH|FIFTH|SIXTH|SEVENTH|EIGHTH|NINTH|TENTH)\.\s*:\s*(.+)$/i);
     const preface=/^(PREFACE(?: BY THE EDITOR)?\.)$/i.test(paragraph);
     const newDivision=volume===2&&/^A DEFENCE OF THE CONSTITUTIONS OF GOVERNMENT OF THE UNITED STATES OF AMERICA\.$/i.test(paragraph);
     if(chapter){
       push();
       const identifier=chapter[1].toUpperCase();
       const number=numbers[identifier]||romanToNumber(identifier);
       const label='Volume '+(volume+1)+' · Chapter '+number+'. '+chapter[2].replace(/\.$/,'');
       section={name:label,volume,paragraphs:[]};
     }else if(preface){
       push();
       section={name:'Volume '+(volume+1)+' · '+(paragraph.includes('EDITOR')?"Editor's Preface":"Preface"),volume,paragraphs:[]};
     }else if(newDivision){
       push();
       section={name:'Volume 3 · Second Division',volume,paragraphs:[]};
     }else{
       section.paragraphs.push(paragraph);
     }
   }
   push();
 }
 if(sections.length<22||sections.some(s=>!s.paragraphs.length)||sections.filter(s=>s.volume===0).length<11||sections.filter(s=>s.volume===1).length<6||sections.filter(s=>s.volume===2).length<8)throw Error('One or more chapters could not be verified.');
 return sections;
}
function paginate(sections){
 const out=[];
 sections.forEach((part,section)=>{
  let current=[],words=0;
  const flush=()=>{if(current.length){out.push({section,sectionName:part.name,volume:part.volume,paragraphs:current});current=[];words=0;}};
  const add=par=>{let n=(par.match(/\S+/g)||[]).length;if(words+n>330&&current.length)flush();current.push(par);words+=n;};
  for(const par of part.paragraphs){
   if((par.match(/\S+/g)||[]).length<=340){add(par);continue;}
   const pieces=par.split(/(?<=[.!?;])\s+(?=[A-Z"'“])/);let temp=[],n=0;
   for(const p of pieces){const m=(p.match(/\S+/g)||[]).length;if(n+m>280&&temp.length){add(temp.join(' '));flush();temp=[];n=0;}temp.push(p);n+=m;}
   if(temp.length)add(temp.join(' '));
  }
  flush();
 });
 return out;
}
function stop(){window.OpheliaNarration?.clearReading?.();
 speechToken++;clearTimeout(startTimer);if('speechSynthesis' in window)window.speechSynthesis.cancel();
 speaking=false;paused=false;speechQueue=[];speechCursor=0;pageSpeechDone=false;utterance=null;updatePlay();
}
function updatePlay(){$('play').textContent=speaking?(paused?'▶ Resume':'Ⅱ Pause'):'▶ Read aloud';}
function getText(){
 const page=pages[state.page];if(!page)return '';
 const first=state.page===0||pages[state.page-1].section!==page.section;
 const intro=first?segments[page.section].name.replace(/\s*[·×]\s*/g,'. ').replace(/\s+/g,' ').trim()+'. ':'';
 const spoken=first&&page.section>0&&page.paragraphs[0]===segments[page.section].heading?page.paragraphs.slice(1):page.paragraphs;
 return intro+spoken.map(p=>/^[IVXLCDM]+$/.test(p.trim())?'Section '+romanToNumber(p.trim())+'.':p.replace(/_([^_]+)_/g,'$1')).join(' ');
}
function pickVoice(){return voiceList.find(v=>v.voiceURI===state.voice)||voiceList.find(v=>/^en-GB/i.test(v.lang))||voiceList.find(v=>/^en/i.test(v.lang))||null;}
// This function is copied from the original Alice reader to preserve its exact
// sentence-boundary, abbreviation, punctuation, and Victorian-clause rules.
function speechChunks(text){
 if(window.OpheliaNarration&&window.OpheliaNarration.speechChunks)return window.OpheliaNarration.speechChunks(text);
 const spokenText=window.OpheliaNarration ? window.OpheliaNarration.normalizeForSpeech(text) : text;
 const clean=spokenText.replace(/\*\s*/g,'').replace(/\s+/g,' ').trim();
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

function finishPage(token){
 if(token!==speechToken)return;
 speaking=false;paused=false;pageSpeechDone=false;speechQueue=[];updatePlay();
 note('Finished page '+(state.page+1)+'.');
 if(state.autoTurn&&state.page<pages.length-1){state.page++;save();render();startSpeech(0);}
 else if(state.page===pages.length-1)note('You have finished all three volumes of John Adams’s Defence.');
}
function startSpeech(startAt=speechResumeAt){
 if(!soundOn){note('Sound is off. Select Sound on before starting narration.');return;}
 if(!pages.length)return;
 if(!('speechSynthesis' in window)){note('This browser has no read-aloud support. Try Chrome or Edge.');return;}
 // Cancel stale events from previous readings, just as in Alice.
 stop();
 const synth=window.speechSynthesis;
 synth.resume();
 const chunks=speechChunks(getText()).slice(startAt);
 speechResumeAt=0;speechCursor=startAt;pageSpeechDone=false;
 if(!chunks.length){note('There is no text to narrate on this page.');return;}
 speaking=true;paused=false;const token=speechToken;
 let started=false,completed=0;
 const voice=pickVoice();
 // Queue all grammatical sentences for this page, as Alice does.
 speechQueue=chunks.map((t,i)=>{
   const u=new SpeechSynthesisUtterance(t);let ended=false;
   u.lang=voice?.lang||'en-GB';if(voice)u.voice=voice;
   u.rate=state.speed;u.volume=1;
   u.onstart=()=>{if(token!==speechToken||!speaking)return;
     started=true;utterance=u;speechCursor=startAt+i;clearTimeout(startTimer);
     note('Reading page '+(state.page+1)+' of '+pages.length+'…');updatePlay();};
   u.onend=()=>{if(token!==speechToken||!speaking||ended)return;
     ended=true;completed++;
     if(completed===chunks.length){clearTimeout(startTimer);pageSpeechDone=true;if(!paused)finishPage(token);}
   };
   u.onerror=e=>{if(token!==speechToken)return;stop();note('Narration stopped ('+(e.error||'speech error')+'). Choose another voice and try again.');};
   return u;
 });
 note('Starting narration…');
 try{if(window.OpheliaNarration&&window.OpheliaNarration.speakWithPauses){window.OpheliaNarration.speakWithPauses(synth,speechQueue,()=>token===speechToken,()=>paused);}else{for(const u of speechQueue){if(token!==speechToken)break;synth.speak(u);}}}
 catch{stop();note('Narration could not start in this browser.');return;}
 if(token===speechToken&&!started)startTimer=setTimeout(()=>{if(token===speechToken&&!started&&!paused){stop();note('No narration started. Choose another English voice in Settings.');}},10000);
 updatePlay();
}
function togglePlay(){
 if(!speaking){startSpeech(speechResumeAt);return;}
 if(!paused){if(!window.OpheliaNarration?.pauseReading?.())speechSynthesis.pause();paused=true;note('Narration paused.');}
 else{paused=false;if(pageSpeechDone){finishPage(speechToken);return;}
   if(!window.OpheliaNarration?.resumeReading?.())speechSynthesis.resume();note('Narration resumed.');}
 updatePlay();
}
function go(p){if(!pages.length)return;stop();speechResumeAt=0;state.page=Math.max(0,Math.min(p,pages.length-1));save();render();}
function goVolume(v){const first=pages.findIndex(p=>p.volume===v);if(first>=0)go(first);}
function render(){if(!pages.length)return;const page=pages[state.page];
 const isFirstRender=initialRender;initialRender=false;
 $('story-figure').hidden=state.page!==0;
 $('volume').value=String(page.volume);
 $('progresslabel').textContent=Math.round((state.page+1)/pages.length*100)+'% read · '+page.sectionName;$('chaptername').textContent=page.sectionName;
 $('prose').replaceChildren(...page.paragraphs.map(p=>{const el=document.createElement('p');const re=/_([^_]+)_/g;let at=0,m;while((m=re.exec(p))){if(m.index>at)el.append(document.createTextNode(p.slice(at,m.index)));const em=document.createElement('em');em.textContent=m[1];el.append(em);at=re.lastIndex;}if(at<p.length)el.append(document.createTextNode(p.slice(at)));if(/^[IVXLCDM]+$/.test(p.trim()))el.classList.add('roman-section');return el}));
 $('pagecount').textContent='Page '+(state.page+1)+' of '+pages.length;$('footcount').textContent=page.sectionName;
 ['prev','prev2'].forEach(id=>$(id).disabled=state.page<=0);['next','next2'].forEach(id=>$(id).disabled=state.page>=pages.length-1);
 $('page').value=String(state.page);$('section').value=String(page.section);$('progressbar').style.width=((state.page+1)/pages.length*100).toFixed(2)+'%';
 document.querySelector('.progress').setAttribute('aria-valuenow',Math.round((state.page+1)/pages.length*100));
 $('bookmark').textContent=state.bookmark===state.page?'♥ Bookmarked':'♡ Bookmark this page';$('bookmarkhint').textContent=state.bookmark>=0?'Saved bookmark: page '+(state.bookmark+1):'No bookmark set';
 if(!isFirstRender)document.querySelector('.book').scrollIntoView({behavior:'instant',block:'start'});
}
function setupBook(raws){
 const parsed=parseAdams(raws),paged=paginate(parsed);
 if(paged.length<900||paged.some(p=>!p.paragraphs.length))throw Error('The complete three-volume reading edition failed pagination checks.');
 segments=parsed;pages=paged;
 $('volume').replaceChildren(...[0,1,2].map(i=>new Option('Volume '+['I','II','III'][i],String(i))));
 $('section').replaceChildren(...segments.map((s,i)=>new Option(s.name,String(i))));
 $('page').replaceChildren(...pages.map((_,i)=>new Option('Page '+(i+1),String(i))));
 ['volume','section','page','play'].forEach(id=>$(id).disabled=false);
 if(oldPosition&&Number.isFinite(Number(oldPosition.v))&&Number.isFinite(Number(oldPosition.p))){
   const volume=Math.min(2,Math.max(0,Number(oldPosition.v)||0));
   const first=pages.findIndex(p=>p.volume===volume),end=pages.findIndex((p,i)=>i>first&&p.volume!==volume);
   const count=(end<0?pages.length:end)-first;
   state.page=Math.max(first,Math.min(first+count-1,first+Math.round((Number(oldPosition.p)||0)*230/330)));
 }
 state.page=Math.max(0,Math.min(state.page,pages.length-1));
 $('loadbox').classList.add('hidden');render();save();
 note('All three complete volumes are ready. Press Read aloud to begin.');
}
function updateVoices(){if(!('speechSynthesis' in window))return;voiceList=speechSynthesis.getVoices();$('voice').replaceChildren(new Option('Automatic English voice',''),...voiceList.filter(v=>/^en/i.test(v.lang)).map(v=>new Option(v.name+' · '+v.lang,v.voiceURI)));$('voice').value=state.voice;}
function applySettings(){$('speed').value=state.speed;$('speedview').value=state.speed+'×';$('size').value=state.size;$('sizeview').value=state.size+' px';$('dark').checked=state.night;$('autoturn').checked=state.autoTurn;document.body.classList.toggle('night',state.night);document.documentElement.style.setProperty('--text-size',state.size+'px');}
['prev','prev2'].forEach(id=>$(id).addEventListener('click',()=>go(state.page-1)));
['next','next2'].forEach(id=>$(id).addEventListener('click',()=>go(state.page+1)));
$('play').onclick=togglePlay;
$('volume').onchange=()=>goVolume(Number($('volume').value));
$('section').onchange=()=>go(pages.findIndex(p=>p.section===Number($('section').value)));
$('page').onchange=()=>go(Number($('page').value));
$('voice').onchange=()=>{stop();speechResumeAt=0;state.voice=$('voice').value;save();note('Voice selected. Press Read aloud to hear this page.');};
$('speed').oninput=()=>{const hadSpeech=speaking,wasPlaying=speaking&&!paused,cursor=speechCursor;state.speed=Number($('speed').value);$('speedview').value=state.speed+'×';save();if(hadSpeech){stop();speechResumeAt=cursor;if(wasPlaying)startSpeech(cursor);else note('Speed changed. Press Read aloud to resume this spoken sentence.');}};
$('size').oninput=()=>{state.size=Number($('size').value);applySettings();save();};
$('dark').onchange=()=>{state.night=$('dark').checked;applySettings();save();};
$('autoturn').onchange=()=>{state.autoTurn=$('autoturn').checked;save();};
$('bookmark').onclick=()=>{state.bookmark=state.bookmark===state.page?-1:state.page;save();render();};
$('bookmarkhint').onclick=()=>{if(state.bookmark>=0)go(state.bookmark)};
$('settings-toggle').onclick=()=>{const show=$('reader-options').hidden;$('reader-options').hidden=!show;$('settings-toggle').setAttribute('aria-expanded',String(show));};
$('sound').onclick=()=>{soundOn=!soundOn;if(!soundOn&&speaking){stop();} $('sound').textContent=soundOn?'Sound on':'Sound off';$('sound').setAttribute('aria-pressed',String(!soundOn));note(soundOn?'Sound is on.':'Sound is off.');};
window.addEventListener('pagehide',stop);if('speechSynthesis' in window){updateVoices();speechSynthesis.addEventListener('voiceschanged',updateVoices)}
applySettings();
(async()=>{
 try{
   const paths=[1,2,3].map(n=>'public/texts/adams-defence/volume-'+n+'.txt');
   const responses=await Promise.all(paths.map(url=>fetch(url,{cache:'no-cache'})));
   if(responses.some(r=>!r.ok))throw Error('A locally hosted volume could not be found.');
   const raws=await Promise.all(responses.map(r=>r.text()));
   setupBook(raws);
 }catch(error){
   $('loadbox').classList.remove('hidden');
   note('The complete John Adams edition could not be opened: '+error.message);
   console.error('Adams volume validation:',error);
 }
})();

</script>
<script defer src="public/js/ophelia-share.js"></script></body></html>'''
ART = r'''<svg xmlns="http://www.w3.org/2000/svg" width="600" height="800" viewBox="0 0 600 800">
<rect width="600" height="800" fill="#e8dbc0"/><rect x="30" y="28" width="540" height="744" fill="#f7f0dc" stroke="#a48d64" stroke-width="3"/>
<g fill="#2c2b25" font-family="Georgia,serif" text-anchor="middle">
<text x="300" y="125" font-size="29" letter-spacing="5">A</text>
<text x="300" y="191" font-size="49" letter-spacing="3">DEFENCE</text>
<text x="300" y="236" font-size="23">OF THE</text>
<text x="300" y="294" font-size="26" letter-spacing="1">CONSTITUTIONS</text>
<text x="300" y="336" font-size="24">OF GOVERNMENT</text>
<text x="300" y="381" font-size="21">OF THE</text>
<text x="300" y="436" font-size="26" letter-spacing="1">UNITED STATES</text>
<text x="300" y="474" font-size="23">OF AMERICA.</text>
<path d="M180 518H420" stroke="#8c7852" stroke-width="2"/>
<text x="300" y="562" font-size="22">BY JOHN ADAMS, LL. D.</text>
<text x="300" y="650" font-size="18">LONDON:</text>
<text x="300" y="685" font-size="17">PRINTED FOR C. DILLY</text>
<text x="300" y="723" font-size="20">M.DCC.LXXXVII.</text></g></svg>'''
if __name__ == "__main__":
    main()
