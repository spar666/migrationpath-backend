"""Extract pinned official instrument HTML downloaded locally; no database writes.
Usage: python3 scripts/build-occupation-dataset.py /tmp/csol.html /tmp/rol.html
"""
from html.parser import HTMLParser
from pathlib import Path
import json, re, sys, hashlib
class Tables(HTMLParser):
    def __init__(self): super().__init__(); self.rows=[]; self.row=None; self.cell=None
    def handle_starttag(self,t,a):
        if t=='tr': self.row=[]
        if t in ('td','th'): self.cell=[]
    def handle_data(self,d):
        if self.cell is not None: self.cell.append(d)
    def handle_endtag(self,t):
        if t in ('td','th') and self.cell is not None:
            if self.row is not None: self.row.append(' '.join(' '.join(self.cell).split()))
            self.cell=None
        if t=='tr' and self.row is not None: self.rows.append(self.row); self.row=None
sources=[('CSOL','2025-11-07','https://www.legislation.gov.au/F2024L01620/2025-11-07/2025-11-07/text/original/epub/OEBPS/document_1/document_1.html'),('MLTSSL','2024-12-14','https://www.legislation.gov.au/F2019L01403/2024-12-14/2024-12-14/text/original/epub/OEBPS/document_1/document_1.html')]
data=[]; manifests=[]
for filename,(list_code,date,url) in zip(sys.argv[1:],sources):
    raw=Path(filename).read_bytes(); parser=Tables();parser.feed(raw.decode())
    rows=[r for r in parser.rows if len(r)>=3 and re.fullmatch(r'\d{6}',r[2])]
    assert len(rows)==(456 if list_code=='CSOL' else 650), 'Unexpected instrument structure; review before importing'
    previous=0
    for row in rows:
        if list_code=='MLTSSL' and int(row[0])<previous: list_code='ROL'
        previous=int(row[0]);data.append({'code':row[2],'title':row[1],'list':list_code,'effectiveDate':date,'source':url,'caveatReferences':row[3] if len(row)>3 else ''})
    manifests.append({'source':url,'sha256':hashlib.sha256(raw).hexdigest(),'rows':len(rows)})
assert len(data)==1106
Path('src/database/reference-data/official-occupations.ts').write_text('// Generated from pinned official instruments. Rebuild with scripts/build-occupation-dataset.py.\n// Caveats require RMA review; list membership alone is not eligibility.\nexport const OFFICIAL_OCCUPATIONS = '+json.dumps(data,indent=2)+';\n')
Path('src/database/reference-data/occupation-sources.json').write_text(json.dumps(manifests,indent=2)+'\n')
print(f'Extracted {len(data)} memberships, {len(set(r["code"] for r in data))} distinct occupations')
