import json,hashlib,subprocess,tempfile
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor
manifest=json.loads(Path('evidence/baseline/build-manifest.json').read_text())
def check(x):
 with tempfile.TemporaryDirectory() as t:
  p=Path(t)/'asset';u='https://alwaysaway-music.liu1773237975.workers.dev/'+('' if x['path']=='index.html' else x['path'])
  subprocess.run(['curl','-fLsS','--compressed','--retry','2','--max-time','90','-x','http://127.0.0.1:7892',u,'-o',str(p)],check=True,capture_output=True)
  h=hashlib.sha256(p.read_bytes()).hexdigest();assert h==x['sha256'],x['path']
  print('MATCH',x['path'],flush=True);return {'path':x['path'],'sha256':h,'matches':True}
with ThreadPoolExecutor(max_workers=6) as pool:rows=list(pool.map(check,[x for x in manifest['assets'] if x['path']!='_headers']))
Path('evidence/baseline/online-match.json').write_text(json.dumps({'url':'https://alwaysaway-music.liu1773237975.workers.dev/','assets':rows,'passed':True},indent=2))
