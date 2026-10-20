import json,subprocess,hashlib
from pathlib import Path
root=Path('outputs/featured-reply');m=json.load(open('work/cloudflare/build-manifest.json'));records=[]
for a in m['assets']:
 if a['path']=='index.html' or a['path'].startswith('assets/'):
  path='/' if a['path']=='index.html' else '/'+a['path']
  b=subprocess.check_output(['curl','-x','http://127.0.0.1:7892','-fsS','--retry','3','--retry-all-errors','--max-time','35','https://alwaysaway-music.liu1773237975.workers.dev'+path]);sha=hashlib.sha256(b).hexdigest();assert sha==a['sha256'],a['path'];records.append({'path':a['path'],'sha256':sha})
(root/'online-bundle-hashes.json').write_text(json.dumps(records,indent=2));print('Exact deployed HTML/CSS/JS match:',len(records))
