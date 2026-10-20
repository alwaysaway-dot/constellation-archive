import {readFile,writeFile,readdir,stat,copyFile,rm,mkdir} from 'node:fs/promises';
import {resolve,relative,extname} from 'node:path';
import {createHash} from 'node:crypto';
import ts from 'typescript';
const root=resolve(import.meta.dirname,'..'),dist=resolve(root,'dist');
const digest=b=>createHash('sha256').update(b).digest('hex');
const source=await readFile(resolve(root,'src/content.ts'),'utf8');
const js=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText;
const {featuredSongs,otherSongs}=await import('data:text/javascript;base64,'+Buffer.from(js).toString('base64'));
if(featuredSongs.length!==10||otherSongs.length!==25)throw Error('Catalogue count changed; review the publication scope.');
const required=new Set(['index.html','favicon.svg','identity/portrait.png','identity/wechat-qr.png',...featuredSongs.flatMap(s=>[s.art,s.audio]),...otherSongs.map(s=>s.preview)].map(p=>{if(!p||p.includes('..'))throw Error('Invalid resource');return p.replace(/^\//,'')}));
async function files(dir){let found=[];for(const e of await readdir(dir,{withFileTypes:true})){const p=resolve(dir,e.name);found.push(...(e.isDirectory()?await files(p):[p]));}return found;}
// Preserve the source photo; override only the generated deployment copy.
await copyFile(resolve(root,'deploy/assets/artwork/08-official.jpg'),resolve(dist,'artwork/08-official.jpg'));
for(const p of await files(dist)){
 const rel=relative(dist,p);
 if(rel.startsWith('assets/')&&/\.(js|css)$/.test(rel))required.add(rel);
 else if(!required.has(rel))await rm(p); // Vite-generated output only; never touches public/source files.
}
await copyFile(resolve(root,'deploy/_headers'),resolve(dist,'_headers'));required.add('_headers');
const entries=[];
for(const name of [...required].sort()){
 const p=resolve(dist,name),b=await readFile(p),size=(await stat(p)).size;
 if(size>25*1024*1024)throw Error(`Cloudflare limit exceeded: ${name}`);
 if(/\.(js|css|html|svg|json)$/.test(name)&&/\/Users\/|localhost:\d|127\.0\.0\.1|BEGIN (RSA |EC )?PRIVATE KEY|CLOUDFLARE_API_TOKEN\s*[:=]/.test(b.toString()))throw Error(`Private/development reference: ${name}`);
 entries.push({path:name,bytes:size,sha256:digest(b)});
}
const sourceFiles=[...await files(resolve(root,'src')),...await files(resolve(root,'scripts')),...await files(resolve(root,'deploy')), ...['package.json','package-lock.json','wrangler.jsonc','wrangler.field-preview.jsonc','wrangler.mobius-preview.jsonc','wrangler.mobius-v11-preview.jsonc','wrangler.vertical-lane-preview.jsonc','wrangler.river-source-preview.jsonc','wrangler.river-motion-preview.jsonc','wrangler-six-stage.jsonc','wrangler-along-ring.jsonc','wrangler-afterimage.jsonc','wrangler-late-reply.jsonc','index.html','tsconfig.json'].map(p=>resolve(root,p))].sort();
const hashes=[];for(const p of sourceFiles)hashes.push({path:relative(root,p),sha256:digest(await readFile(p))});
const version=digest(JSON.stringify(hashes));
await mkdir(resolve(root,'work/cloudflare'),{recursive:true});
await writeFile(resolve(root,'work/cloudflare/build-manifest.json'),JSON.stringify({builtAt:new Date().toISOString(),sourceVersion:version,sourceFiles:hashes,assets:entries},null,2)+'\n');
console.log(`Deployment package: ${entries.length} files, ${(entries.reduce((s,e)=>s+e.bytes,0)/1048576).toFixed(2)} MiB. Source version: ${version}`);
