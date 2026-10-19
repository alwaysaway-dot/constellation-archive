import json,subprocess,tempfile,hashlib,os
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor
r=Path.cwd();base=os.environ.get('TEST_BASE','https://alwaysaway-music.liu1773237975.workers.dev');manifest=json.loads((r/'work/cloudflare/build-manifest.json').read_text());report={'base':base,'assets':[],'ranges':[],'missing':[]}
def request(path,headers=None,head=False):
 with tempfile.TemporaryDirectory() as td:
  cmd=['curl','-x','http://127.0.0.1:7892','-sS','--retry','2','--max-time','40','-D',td+'/headers','-o',td+'/body']
  if head:cmd+=['-I']
  for k,v in (headers or {}).items():cmd+=['-H',k+': '+v]
  subprocess.run(cmd+[base+path],check=True,capture_output=True)
  raw=Path(td+'/headers').read_text();blocks=[x for x in raw.split('\n\n') if x.startswith('HTTP/')];block=blocks[-1];status=int(block.splitlines()[0].split()[1]);h={}
  for line in block.splitlines()[1:]:
   if ':' in line:k,v=line.split(':',1);h[k.lower()]=v.strip()
  return status,h,Path(td+'/body').read_bytes()
def asset(a):
 status,h,_=request('/' if a['path']=='index.html' else '/'+a['path'],head=True);assert status==200,(a['path'],status)
 if a['path'].endswith('.mp3'):assert h['content-type'].startswith('audio/mpeg')
 if a['path'].startswith('assets/'):assert h.get('cache-control')=='public, max-age=31536000, immutable',h
 return {'path':a['path'],'status':status,'type':h.get('content-type'),'cache':h.get('cache-control')}
with ThreadPoolExecutor(max_workers=5) as pool:report['assets']=list(pool.map(asset,[a for a in manifest['assets'] if a['path']!='_headers']))
def audio(a):
 status,h,body=request('/'+a['path'],{'Range':'bytes=0-1023'});assert status==206,(a['path'],status);assert h['content-range']==f"bytes 0-1023/{a['bytes']}";assert body==(r/'dist'/a['path']).read_bytes()[:1024]
 return {'path':a['path'],'status':status,'contentRange':h['content-range'],'bytesMatch':True}
with ThreadPoolExecutor(max_workers=4) as pool:report['ranges']=list(pool.map(audio,[a for a in manifest['assets'] if a['path'].endswith('.mp3')]))
for p in ['/assets/missing.js','/artwork/missing.png','/audio/missing.mp3','/.env','/work/preview-review/selections.json','/work/preview-review/audio/full-12.mp3','/src/content.ts']:
 status,h,body=request(p);assert status==404,(p,status);assert b'<div id="root"' not in body;report['missing'].append({'path':p,'status':status})
status,h,body=request('/audio/previews/preview-12.mp3',{'Range':'bytes=999999999-'});assert status==416;report['unsatisfiableRange']=status
(r/'outputs/six-stage/online-http.json').write_text(json.dumps(report,indent=2)+'\n');print('Passed:',len(report['assets']),'assets;',len(report['ranges']),'byte ranges;',len(report['missing']),'404 paths; invalid range 416')
