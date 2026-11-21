#!/usr/bin/env python3
"""Inspect the public-domain 1898 volume-3 transcription before using it in a reader."""
from pathlib import Path
import re,urllib.request,subprocess
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/"scripts"/"diagnostics"/"monroe-source-audit.txt"
OUT.parent.mkdir(parents=True,exist_ok=True)
base="https://archive.org/download/writingsincludin03monruoft/"
links=[
 base+"writingsincludin03monruoft_djvu.txt",
 base+"writingsincludin03monruoft_full_text.txt",
 "https://archive.org/download/writingsincludin03monruoft/writingsincludin03monruoft.pdf",
]
report=[]
text=""
for url in links:
 try:
  req=urllib.request.Request(url,headers={"User-Agent":"OpheliasOpenBook/1.0 public domain library historical source verification"})
  with urllib.request.urlopen(req,timeout=80) as f: data=f.read()
  report.append(f"Fetched {url} bytes {len(data)}")
  if data.startswith(b"%PDF"):
   Path("/tmp/monroe-writings-v3.pdf").write_bytes(data)
   c=subprocess.run(["pdftotext","-layout","/tmp/monroe-writings-v3.pdf","-"],capture_output=True,text=True,timeout=120)
   text=c.stdout
   report.append("PDF text extraction: "+str(len(text))+" characters, return code "+str(c.returncode))
  else:text=data.decode("utf-8",errors="replace")
  if len(text)>100000:break
 except Exception as e:report.append(f"Failed {url}: {repr(e)}")
report.append(f"TOTAL characters {len(text)} words {len(text.split())}")
matches=list(re.finditer(r"A\s+VIEW\s+OF\s+THE\s+CONDUCT|VIEW\s+OF\s+THE\s+CONDUCT|VIEW\s+OF\s+THE\s+EXECUTIVE",text,flags=re.I))
report.append("All View title occurrence offsets "+str([m.start() for m in matches[-30:]]))
for m in matches[-15:]:
 i=m.start()
 report.append(f"---- OCCURRENCE {i} ----\n{text[max(0,i-350):i+850]}")
appendix=list(re.finditer(r"(?im)^\\s*APPENDIX\\s*$",text))
report.append("Standalone APPENDIX headings "+str([m.start() for m in appendix[-20:]]))
for m in appendix[-14:]:
 i=m.start()
 report.append(f"---- APPENDIX HEADING {i} ----\\n{text[max(0,i-180):i+850]}")
report.append("LAST 165000 CHARS PREVIEW FIRST 5000\\n"+text[-165000:-160000])
report.append("------ FINAL 5000 CHARS OF 1898 VOLUME ------\n"+text[-5000:])
OUT.write_text("\n\n".join(report),encoding="utf-8")
print("\n".join(report[:7]),flush=True)
