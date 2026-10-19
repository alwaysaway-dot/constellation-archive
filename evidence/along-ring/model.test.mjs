import {readFileSync} from 'node:fs';import ts from 'typescript';import test from 'node:test';import assert from 'node:assert/strict';
const urls={};function load(name){if(urls[name])return urls[name];let text=ts.transpileModule(readFileSync(`src/${name}.ts`,'utf8'),{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText;text=text.replace(/from ['"]\.\/([^'"]+)['"]/g,(_,m)=>`from '${load(m)}'`);return urls[name]='data:text/javascript;base64,'+Buffer.from(text).toString('base64')}
const {createLanePoints,laneLayout,focusIndex}=await import(load('vertical-lane-model'));
test('ten ordered anchors with stable title room at desktop and narrow widths',()=>{for(const[w,h]of[[1440,900],[390,844],[360,740],[320,568]]){const l=laneLayout(w,h);assert.equal(l.xs.length,10);assert.ok(l.step>=390);assert.ok(l.total-l.start-9*l.step>=h*.6);for(const x of l.xs)assert.ok(x*w-(w<376?112:120)>=0)}});
test('focus has a stable boundary and reverses after leaving its hysteresis',()=>{const ys=[300,690,1080],h=844;let n=0;for(const d of[-9,8,-5,7,0])n=focusIndex(ys,495-h*.4+d,h,n);assert.equal(n,0);n=focusIndex(ys,525-h*.4,h,n);assert.equal(n,1);assert.equal(focusIndex(ys,465-h*.4,h,n),0)});
test('seeded silhouettes are distinct, finite, under a measured budget, without changing metadata',()=>{for(const[w,h]of[[390,844],[1440,900]]){const a=createLanePoints(w,h),b=createLanePoints(w,h);assert.deepEqual(a,b);assert.ok(a.points.length<(w<701?15000:23000));assert.equal(a.points.filter(p=>p.kind===3).length,11);const bounds=[];for(let n=0;n<10;n++){const ps=a.points.filter(p=>p.anchor===n&&p.kind===4);assert.ok(ps.length>=700);bounds.push([Math.max(...ps.map(p=>p.x))-Math.min(...ps.map(p=>p.x)),Math.max(...ps.map(p=>p.y))-Math.min(...ps.map(p=>p.y))].map(x=>Math.round(x)).join(','))}assert.equal(new Set(bounds).size,10);assert.ok(a.points.every(p=>Object.values(p).flat().every(Number.isFinite)))}});


test('every motif particle carries a stable path coordinate, without adding more particles',()=>{const a=createLanePoints(390,844);for(const p of a.points.filter(p=>p.kind===4)){assert.equal(p.route.length,2);assert.ok(p.route[0]>=0&&p.route[0]<1);assert.ok(Number.isInteger(p.route[1]))}assert.equal(a.points.length,13431)});

const{createPathAtlas,pathPoint,pathRow,PATH_ROWS,PATH_SAMPLES}=await import(load('motif-motion'));
test('small path atlas has finite samples and closed loops join without a jump',()=>{const a=createPathAtlas();assert.equal(a.byteLength,53664);assert.ok(a.every(Number.isFinite));for(const n of[0,4,9])for(const part of[0,1]){const first=pathPoint(n,0,part,part),last=pathPoint(n,1,part,part);assert.ok(first.every((v,k)=>Math.abs(v-last[k])<1e-10))}for(let n=0;n<10;n++)for(let i=0;i<100;i++)assert.ok(pathRow(n,i,i%2)<PATH_ROWS);assert.equal(PATH_SAMPLES,129)});

const {createEntryPlan,entryCamera,laneEntryCamera,entryFrame,projectEntry,entryState,entryPatch}=await import(load('ring-entry'));
const {grains}=await import(load('mobius-model'));
test('both material anchors remain matched through perspective handoff and resize',()=>{
 for(const [w,h] of [[1440,900],[390,844],[360,740],[390,724],[320,568]]){
 const plan=createEntryPlan(w,h),l=laneLayout(w,h),scale=w<701?.9:1.1,f=h/(2*Math.tan(21*Math.PI/180));
 const cores=[0,1].map(i=>{const z=i?1:.5;return[(l.xs[0]*w+i*36*scale-w/2)*(20-z)/f,(h/2-l.start-i*17*scale)*(20-z)/f,z]});
 assert.ok(Math.abs(plan.uv[1])<1.12);let hz=18,mz=Infinity;
 for(let i=0;i<=100;i++) {const p=i/100,home=entryCamera(plan,p),map=laneEntryCamera(plan,p),pair=entryFrame(plan,p);
 assert.ok(home.eye.every(Number.isFinite)&&map.eye.every(Number.isFinite));assert.ok(home.eye[2]<=hz+1e-8);assert.ok(map.eye[2]<=mz+1e-8);hz=home.eye[2];mz=map.eye[2];
 for(const [n,a] of [pair.first,pair.second].entries()){const b=projectEntry(cores[n],map,w,h,42);assert.ok(Math.hypot(a[0]-b[0],a[1]-b[1])<.001,`${w}/${p} core ${n}`)}
 }
 assert.deepEqual(laneEntryCamera(plan,1),{eye:[0,0,20],roll:0});assert.ok(entryCamera(plan,0).eye.every((v,i)=>Math.abs(v-[0,0,18][i])<1e-10));assert.ok(Math.abs(entryCamera(plan,0).roll)<1e-10);
 assert.deepEqual(entryFrame(plan,.48),entryFrame(plan,.48));
 const patch=entryPatch(plan,grains(w<701?11000:24000));assert.ok(patch.length<=2100);assert.ok(patch.every(p=>Object.values(p).flat().every(Number.isFinite)));
 }
});
test('short approach has no dark interval or autonomous progress, with reduced static cameras',()=>{
 const plan=createEntryPlan(390,844);for(let i=0;i<=100;i++){const p=i/100,s=entryState(p);assert.ok(Object.values(s).every(v=>v>=0&&v<=1));assert.deepEqual(entryCamera(plan,p,true),{eye:[0,0,18],roll:0});assert.deepEqual(laneEntryCamera(plan,p,true),{eye:[0,0,20],roll:0});if(p>=.75)assert.equal(s.first,1)}
 assert.equal(entryState(0).first,0);assert.equal(entryState(1).rest,1);assert.equal(entryState(1).takeover,1);
});
