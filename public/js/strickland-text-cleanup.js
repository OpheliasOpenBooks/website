/* Reader-only cleanup of obvious scan artifacts in the original 1840–48
 * Strickland volumes. Archive part JSON remains unchanged and auditable. */
(function(root){
'use strict';
const starts={
 1:/^PREFACE\.?$/i,2:/^BERENGARIA OF NAVARRE[,.]?$/i,
 3:/^PREFACE\.?$/i,4:/^PREFACE\.?$/i,
 5:/^KATHARINE PARR[,.]?$/i,6:/^NOTICE TO THE READER\.?$/i,
 7:/^ELIZABETH[,.]?$/i,8:/^HENRIETTA MARIA[,.]?$/i,
 9:/^PREFACE\.?$/i,10:/^MARY BEATRICE OF MODENA[,.]?$/i,
 11:/^MARY II\.?$/i,12:/^PREFACE\.?$/i
};
function headingValue(s){return String(s).trim().replace(/^[_"'‘’“”\s]+/,'').replace(/["'‘’“”\s]+$/,'').trim();}
function furniture(text){
 const s=String(text||'').trim().replace(/\s+/g,' ');
 if(!s)return true;
 if(/\b(?:NOT TO BE ISSUED|OUT OF THE LIBRARY|ROYAL ASIATIC SOCIETY|BOMBAY BRANCH|Digitized with financial assistance|Bayer\. Staatsbibliothek)\b/i.test(s))return true;
 if(/^<?\d{7,}>?$/.test(s))return true;
 if(/^[+*=~|<>{}\\\d.,:;\s\-]+$/.test(s))return true;
 if(/^B[2Z][°. ]*$/i.test(s))return true;
 if(/^[_\W]*VOL[.,]?\s*[IVXLCDM¥]+[.,\s]*(?:B\d?)?[.,\s]*$/i.test(s))return true;
 if(/^(?:PREFACE|INTRODUCTION)[.]\s*(?:[ivxlcdm]{1,8}|[0-9]{1,4})[. ]*$/i.test(s))return true;
 // Running headers with printed folio numbers, distinct from real titles.
 if(s.length<100&&/^(?:\d{1,4}\s+)?[A-Z][A-Z0-9 ’'.,\-]{3,80}[.,]\s*(?:\d{1,4}|[ivxlcdm]{1,8})\.?\s*$/.test(s))return true;
 if(s.length<100&&/^\d{1,4}\s+[A-Z][A-Z ’'.,\-]{3,70}[.,]?\s*$/.test(s))return true;
 if(s.length<180&&/^[¹²³*?'0-9]\s*/.test(s)&&s.split(/\s+/).length<23&&/\b(?:ibid|chronique|chronicle|m[eé]moires|annals|volume|history|vol\.|p\.\s*\d|ordericus|godwin|dugdale|paris\.|vitalis|strype)\b/i.test(s))return true;
 if(s.length<9&&/[<>\\{}|~]/.test(s))return true;
 return false;
}
function tidy(text){
 let s=String(text||'').replace(/\uFFFD/g,'').replace(/[\u0000-\u0008\u000b\u000e-\u001f]/g,'');
 s=s.replace(/([A-Za-zÀ-ÖØ-öø-ÿ])-\s+(?=[a-zà-öø-ÿ]{2,}\b)/g,'$1');
 s=s.replace(/[¦|<>\\{}]/g,' ').replace(/_{2,}/g,' ');
 s=s.replace(/^(?:PREFACE|INTRODUCTION)[.]\s*(?:[ivxlcdm]{2,8})\s+(?=[a-z])/i,'');
 s=s.replace(/\bVOL[.,]?\s*[IVXLCDM¥]+[.,]?\s+B[2Z]?\b/gi,'');
 return s.replace(/\s{2,}/g,' ').replace(/^[,;:.~*+\s]+(?=[A-Za-z])/,'').trim();
}
function cleanedSections(sections,volume,firstPart){
 const normalizedStart=starts[Number(volume)];
 if(firstPart&&!normalizedStart)return sections;
 let reached=!firstPart,found=!firstPart;
 const output=[];
 let afterFurniture=false;
 for(const section of sections){
  const paragraphs=[];
  for(const raw of section.paragraphs){
   const original=String(raw).trim();
   if(!reached){
    if(normalizedStart.test(headingValue(original))){reached=true;found=true;}
    else continue;
   }
   if(furniture(original)){afterFurniture=true;continue;}
   const text=tidy(original);
   if(furniture(text)){afterFurniture=true;continue;}
   if(afterFurniture&&paragraphs.length&&!/[.!?…”’"')\]]$/.test(paragraphs[paragraphs.length-1])&&/^[a-zà-ÿ]/.test(text)){
    const i=paragraphs.length-1;
    paragraphs[i]=paragraphs[i].endsWith('-')?paragraphs[i].slice(0,-1)+text:paragraphs[i]+' '+text;
   }else paragraphs.push(text);
   afterFurniture=false;
  }
  if(paragraphs.length)output.push({name:section.name,paragraphs});
 }
 if(firstPart&&!found){
  if(typeof console!=='undefined')console.warn('Strickland volume opening marker not found:',volume);
  return sections.map(s=>({name:s.name,paragraphs:s.paragraphs.map(tidy).filter(Boolean)}));
 }
 return output;
}
const api={cleanedSections,furniture,tidy,starts};
if(typeof module!=='undefined'&&module.exports)module.exports=api;
if(root)root.StricklandCleanup=api;
})(typeof window!=='undefined'?window:typeof globalThis!=='undefined'?globalThis:null);
