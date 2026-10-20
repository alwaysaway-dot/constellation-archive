import * as THREE from 'three';
import {mobiusPoint,surfaceNormal,seeded,TAU,type GalaxyLayout} from './mobius-model';
import type {MaterialHit} from './mobius-input';
// Local rollback switch: disabling this leaves the original star field and all routes intact.
export const HABITAT_ENABLED=true;
export const habitatUniforms=()=>({uHabitatCenters:{value:[new THREE.Vector3(),new THREE.Vector3()]},uHabitatGains:{value:new THREE.Vector2()}});
export const habitatMaskGLSL=`
uniform vec3 uHabitatCenters[2];uniform vec2 uHabitatGains;
float habitatSlot(vec2 uv,vec3 center,float gain){
 float d=uv.x-center.x;float v=uv.y;if(mod(abs(floor((d+3.14159265)/6.2831853)),2.)>.5)v=-v;
 d=atan(sin(d),cos(d));
 float width=.81+.12*sin(uv.x*17.+v*4.)+.08*sin(uv.x*31.-v*7.);
 float along=1.-smoothstep(.26,.57,abs(d));
 float across=1.-smoothstep(width*.55,width,abs(v-center.y));
 return gain*along*across;
}
float habitatMask(vec2 uv){if(uHabitatGains.x+uHabitatGains.y<.001)return 0.;return max(habitatSlot(uv,uHabitatCenters[0],uHabitatGains.x),habitatSlot(uv,uHabitatCenters[1],uHabitatGains.y));}
`;
type Shared=ReturnType<typeof habitatUniforms>;
// Immutable, seeded material-space geometry. Only reveal uniforms change during interaction.
type Attrs={p:number[];n:number[];c:number[];r:number[];uv:number[];tier:number[];seed:number[];side:number[]};
const attrs=():Attrs=>({p:[],n:[],c:[],r:[],uv:[],tier:[],seed:[],side:[]});
const vec=(p:number[])=>new THREE.Vector3().fromArray(p);
function relief(u:number,v:number){const p=mobiusPoint(u,v);return .012+.035*(.5+.5*Math.sin(p[0]*13.+Math.sin(p[1]*9.))*Math.cos(p[2]*11.+p[1]*5.))}
function frame(u:number,v:number,side:number){const r=vec(mobiusPoint(u,v)),n=vec(surfaceNormal(u,v)).multiplyScalar(side),x=vec(mobiusPoint(u+.0001,v)).sub(r).normalize(),y=new THREE.Vector3().crossVectors(n,x).normalize();r.addScaledVector(n,relief(u,v));return{r,n,x,y,u,v,side}}
type Frame=ReturnType<typeof frame>;
function point(f:Frame,p:THREE.Vector3){return f.r.clone().addScaledVector(f.x,p.x).addScaledVector(f.y,p.y).addScaledVector(f.n,p.z)}
function triangle(a:Attrs,f:Frame,points:THREE.Vector3[],color:THREE.Color,tier:number,seed:number){const ps=points.map(p=>point(f,p)),n=new THREE.Vector3().crossVectors(ps[1].clone().sub(ps[0]),ps[2].clone().sub(ps[0])).normalize();for(const p of ps){a.p.push(p.x,p.y,p.z);a.n.push(n.x,n.y,n.z);a.c.push(color.r,color.g,color.b);a.r.push(f.r.x,f.r.y,f.r.z);a.uv.push(f.u,f.v);a.tier.push(tier);a.seed.push(seed);a.side.push(f.side)}}
function stem(a:Attrs,f:Frame,start:THREE.Vector3,end:THREE.Vector3,r:number,color:THREE.Color,tier:number,seed:number){const d=end.clone().sub(start).normalize(),x=new THREE.Vector3().crossVectors(d,new THREE.Vector3(.3,1,.2)).normalize(),y=new THREE.Vector3().crossVectors(d,x);for(let i=0;i<4;i++){const t=i/4*TAU,q=(i+1)/4*TAU;const p=start.clone().addScaledVector(x,Math.cos(t)*r).addScaledVector(y,Math.sin(t)*r),p2=start.clone().addScaledVector(x,Math.cos(q)*r).addScaledVector(y,Math.sin(q)*r),p3=end.clone().addScaledVector(x,Math.cos(q)*r*.45).addScaledVector(y,Math.sin(q)*r*.45),p4=end.clone().addScaledVector(x,Math.cos(t)*r*.45).addScaledVector(y,Math.sin(t)*r*.45);triangle(a,f,[p,p2,p3],color,tier,seed);triangle(a,f,[p,p3,p4],color,tier,seed)}}
function leaf(a:Attrs,f:Frame,base:THREE.Vector3,len:number,width:number,az:number,rise:number,color:THREE.Color,tier:number,seed:number){const d=new THREE.Vector3(Math.cos(az),Math.sin(az),rise),s=new THREE.Vector3(-Math.sin(az),Math.cos(az),0);for(let i=0;i<3;i++){const section=(t:number,k:number)=>base.clone().addScaledVector(d,len*t).addScaledVector(s,Math.sin(t*Math.PI)*width*k).add(new THREE.Vector3(0,0,Math.sin(t*Math.PI)*len*(k===0?.20:.08)));const t=i/3,q=(i+1)/3;for(const side of[-1,1]){const shade=color.clone().multiplyScalar(side===1?.90:1.08);triangle(a,f,[section(t,0),section(q,side),section(q,0)],shade,tier,seed);triangle(a,f,[section(t,0),section(t,side),section(q,side)],shade,tier,seed)}}}
function blob(a:Attrs,f:Frame,pos:THREE.Vector3,scale:THREE.Vector3,color:THREE.Color,tier:number,seed:number){const p=(u:number,v:number)=>new THREE.Vector3(Math.sin(v)*Math.cos(u)*scale.x,Math.sin(v)*Math.sin(u)*scale.y,Math.cos(v)*scale.z).add(pos);for(let i=0;i<8;i++)for(let j=0;j<5;j++){const u=i/8*TAU,q=(i+1)/8*TAU,v=j/5*Math.PI,w=(j+1)/5*Math.PI;triangle(a,f,[p(u,v),p(q,v),p(q,w)],color,tier,seed);triangle(a,f,[p(u,v),p(q,w),p(u,w)],color,tier,seed)}}
function geometry(a:Attrs){const g=new THREE.BufferGeometry();for(const [key,data,size]of [['position',a.p,3],['normal',a.n,3],['color',a.c,3],['aRoot',a.r,3],['aUV',a.uv,2],['aTier',a.tier,1],['aSeed',a.seed,1],['aSide',a.side,1]]as const)g.setAttribute(key,new THREE.Float32BufferAttribute(data,size));return g}
function biome(u:number){const scores=[Math.exp(Math.cos(u-3.2)*3.5),Math.exp(Math.cos(u-.2)*3.5),Math.exp(Math.cos(u-1.65)*4.)],sum=scores.reduce((a,b)=>a+b,0);return scores.map(x=>x/sum)}
function buildPlants(){const a=attrs(),rnd=seeded(59417),green=new THREE.Color(),rootColor=new THREE.Color('#493c24');
 // Fixed material-space arrangement, including both faces of the non-orientable strip.
 for(const side of[-1,1]){
 for(let i=0;i<1200;i++){const u=rnd()*TAU,v=(rnd()*2-1)*1.23,[m,b]=biome(u);if(rnd()>.18+m*.8+b*.08)continue;const cluster=.5+.5*Math.sin(u*21+Math.sin(v*14));if(rnd()>cluster*.8+.15)continue;const f=frame(u,v,side);green.setHSL(.19+rnd()*.07,.35+rnd()*.25,.12+rnd()*.13);for(let k=0;k<4;k++){const base=new THREE.Vector3((rnd()-.5)*.05,(rnd()-.5)*.05,.012);leaf(a,f,base,.025+rnd()*.065,.006+rnd()*.009,rnd()*TAU,.3+rnd()*.9,green,0,rnd()*20)}}
 for(let i=0;i<90;i++){const u=rnd()*TAU,v=(rnd()*2-1)*1.2,[m,b]=biome(u),f=frame(u,v,side);if(rnd()>m*.8+.15)continue;const h=.10+rnd()*.12,top=new THREE.Vector3(.025,0,h);stem(a,f,new THREE.Vector3(0,0,.02),top,.004,new THREE.Color('#68803a'),1,i);for(let k=0;k<3;k++)leaf(a,f,top.clone().multiplyScalar(.7+k*.12),.08+rnd()*.07,.025,rnd()*TAU,.15,new THREE.Color('#6a873c'),1,i)}
 for(let i=0;i<24;i++){const u=1.65+(rnd()-.5)*.9,v=(rnd()*2-1)*1.05,f=frame(u,v,side),h=.15+rnd()*.11,top=new THREE.Vector3((rnd()-.5)*.06,0,h);stem(a,f,new THREE.Vector3(0,0,.01),top,.003,new THREE.Color('#626d31'),1,i);for(let k=0;k<3;k++)leaf(a,f,new THREE.Vector3(0,0,.035+k*.025),.08,.025,k*2.3+i,.3,new THREE.Color('#4d692c'),1,i);for(let k=0;k<5;k++)leaf(a,f,top,.07+rnd()*.025,.027,k/5*TAU,.08,new THREE.Color(i%4===0?'#9790c4':'#e2dfc4'),1,i);blob(a,f,top,new THREE.Vector3(.022,.022,.013),new THREE.Color('#bba551'),1,i)}
 for(let i=0;i<16;i++){const u=1.7+(rnd()-.5)*3.1,v=(rnd()*2-1)*1.1,f=frame(u,v,side),az=rnd()*TAU,len=.25+rnd()*.12;for(let k=1;k<9;k++){const t=k/9,base=new THREE.Vector3(Math.cos(az)*len*t,Math.sin(az)*len*t,.025+Math.sin(t*2)*.08);for(const sg of[-1,1])leaf(a,f,base,Math.sin(t*Math.PI)*.09,.013,az+sg*1.0,.1,new THREE.Color('#5e7a35'),1,i)}stem(a,f,new THREE.Vector3(0,0,.02),new THREE.Vector3(Math.cos(az)*len,Math.sin(az)*len,.09),.002,rootColor,0,i)}
 for(let i=0;i<120;i++){const u=rnd()*TAU,v=(rnd()*2-1)*1.18,[,b]=biome(u);if(rnd()>b*.9+.12)continue;const f=frame(u,v,side),r=.025+rnd()*.06;for(let k=0;k<7;k++){const t=k/7*TAU,q=(k+1)/7*TAU;triangle(a,f,[new THREE.Vector3(0,0,.02),new THREE.Vector3(Math.cos(t)*r,Math.sin(t)*r,.009),new THREE.Vector3(Math.cos(q)*r*(.7+rnd()*.6),Math.sin(q)*r,.014)],new THREE.Color('#778071').multiplyScalar(.65+rnd()*.6),0,i)}}
 for(let i=0;i<100;i++){const u=rnd()*TAU,v=(rnd()*2-1)*1.25,f=frame(u,v,side);let start=new THREE.Vector3(0,0,.008);for(let j=0;j<4;j++){const end=start.clone().add(new THREE.Vector3(.04+rnd()*.04,(rnd()-.5)*.04,0));stem(a,f,start,end,.0025,rootColor,0,i);start=end}}
 // One small beetle per face at the same bark location. Mostly stationary.
 const f=frame(.65,.15,side),brown=new THREE.Color('#563223');blob(a,f,new THREE.Vector3(0,0,.055),new THREE.Vector3(.045,.068,.032),brown,2,1);blob(a,f,new THREE.Vector3(0,.067,.045),new THREE.Vector3(.027,.028,.022),new THREE.Color('#262b20'),2,1);
 stem(a,f,new THREE.Vector3(0,-.06,.083),new THREE.Vector3(0,.05,.083),.0015,new THREE.Color('#1c1711'),2,1);
 for(let j=0;j<3;j++)for(const sg of[-1,1]){const x=new THREE.Vector3(sg*.03,j*.035-.03,.04),k=new THREE.Vector3(sg*.075,j*.05-.045,.024);stem(a,f,x,k,.002,new THREE.Color('#39291c'),2,1);stem(a,f,k,k.clone().add(new THREE.Vector3(sg*.02,-.015,-.012)),.0015,rootColor,2,1)}
 }
 return geometry(a);
}
function bandGeometry(terrain=false){const g=new THREE.BufferGeometry(),p:number[]=[],uv:number[]=[],ind:number[]=[];const U=192,V=24;for(const side of(terrain?[-1,1]:[0])){const offset=p.length/3;for(let i=0;i<=U;i++)for(let j=0;j<=V;j++){const u=i/U*TAU,v=(j/V*2-1)*1.32;const q=mobiusPoint(u,v),n=surfaceNormal(u,v);p.push(...q.map((x,k)=>x+n[k]*side*relief(u,v)));uv.push(u,v)}for(let i=0;i<U;i++)for(let j=0;j<V;j++){const k=offset+i*(V+1)+j;ind.push(k,k+V+1,k+1,k+1,k+V+1,k+V+2)}}g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(ind);g.computeVertexNormals();return g}
const noise=`float hash(vec3 p){return fract(sin(dot(p,vec3(12.9898,78.233,37.719)))*43758.5453);}float noise(vec3 p){vec3 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(mix(hash(i),hash(i+vec3(1,0,0)),f.x),mix(hash(i+vec3(0,1,0)),hash(i+vec3(1,1,0)),f.x),f.y),mix(mix(hash(i+vec3(0,0,1)),hash(i+vec3(1,0,1)),f.x),mix(hash(i+vec3(0,1,1)),hash(i+vec3(1,1,1)),f.x),f.y),f.z);}`;
export function createHabitat(scene:THREE.Scene,shared:Shared){
 const group=new THREE.Group();group.matrixAutoUpdate=false;scene.add(group);const band=bandGeometry(true),proxyGeo=bandGeometry(),plants=buildPlants();
 // Textures and shaders are prepared before hover; no network or geometry work in update().
 const extra={...shared,uClock:{value:0},uBark:{value:new THREE.Texture()},uMoss:{value:new THREE.Texture()},uReducedHabitat:{value:0}};
 const textures:THREE.Texture[]=[];const placeholders=[extra.uBark.value,extra.uMoss.value];let disposed=false;const ready=Promise.all(['woodland-bark-v1.jpg','woodland-moss-v1.jpg'].map((file,i)=>new Promise<void>(resolve=>{const texture=new THREE.TextureLoader().load('/materials/'+file,t=>{if(disposed){t.dispose();resolve();return}t.colorSpace=THREE.SRGBColorSpace;t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=4;(i?extra.uMoss:extra.uBark).value=t;resolve()},undefined,()=>resolve());textures.push(texture)}))).then(()=>{});
 const varying=`varying vec2 vUV;varying vec3 vN,vP,vColor;varying float vTier,vSide,vReveal;`;
 const vertex=habitatMaskGLSL+varying+`uniform float uClock,uReducedHabitat;attribute vec3 aRoot;attribute vec2 aUV;attribute float aTier,aSeed,aSide;void main(){vUV=aUV;vTier=aTier;vSide=aSide;vColor=color;vReveal=habitatMask(aUV);vec3 p=position;float rise=aTier>.5?smoothstep(.18,.72,vReveal):smoothstep(0.,.38,vReveal);p=aRoot+(p-aRoot)*mix(.12,1.,rise);float bend=(1.-uReducedHabitat)*sin(uClock*.65+aSeed)*.016*step(.5,aTier)*step(aTier,1.5);p.x+=bend*length(position-aRoot);vN=normalize(normalMatrix*normal);vP=(modelViewMatrix*vec4(p,1.)).xyz;gl_Position=projectionMatrix*vec4(vP,1.);}`;
 const baseVertex=habitatMaskGLSL+varying+`void main(){vUV=uv;vN=normalize(normalMatrix*normal);vP=(modelViewMatrix*vec4(position,1.)).xyz;vColor=vec3(1);vTier=-1.;vSide=0.;vReveal=habitatMask(uv);gl_Position=projectionMatrix*vec4(vP,1.);}`;
 const fragment=habitatMaskGLSL+varying+noise+`uniform sampler2D uBark,uMoss;void main(){
 float reveal=habitatMask(vUV);float m0=habitatSlot(vUV,uHabitatCenters[0],uHabitatGains.x),m1=habitatSlot(vUV,uHabitatCenters[1],uHabitatGains.y);vec3 center=m0>m1?uHabitatCenters[0]:uHabitatCenters[1];float face=center.z;if(mod(abs(floor((vUV.x-center.x+3.14159265)/6.2831853)),2.)>.5)face=-face;
 if(vSide!=0.&&vSide*face<0.)discard;
 float grain=noise(vec3(vUV*vec2(44.,30.),1.));float threshold=vTier>.5?.22+grain*.42:.035+grain*.43;
 float coverage=smoothstep(threshold*.3,.91,reveal);float fleck=hash(floor(vec3(vUV*vec2(780.,310.),2.)));if(coverage<fleck||reveal<.025)discard;
 vec3 n=normalize(vN);if(!gl_FrontFacing)n=-n;
 vec3 col=vColor;float rough=.78;
 if(vTier<0.){vec3 tex=texture2D(uBark,vec2(vUV.y*.8*cos(vUV.x*.5),vUV.x*(12./6.2831853))).rgb;float moss=exp(cos(vUV.x-3.2)*3.5),bark=exp(cos(vUV.x-.2)*3.5),flower=exp(cos(vUV.x-1.65)*4.);float total=moss+bark+flower;moss/=total;bark/=total;flower/=total;float island=noise(vec3(vUV*vec2(12.,9.),3.));float ground=clamp(moss*.97+flower*.70+island*.16-bark*.12,.02,.98);vec3 mossTex=texture2D(uMoss,vec2(vUV.x*(10./6.2831853),vUV.y*.8*cos(vUV.x*.5))).rgb;col=mix(tex*.65,mossTex*.69,ground);float bump=dot(tex,vec3(.3,.5,.2));n=normalize(n+vec3(dFdx(bump),dFdy(bump),0.)*8.);rough=mix(.84,.58,ground);}
 float diffuse=max(0.,dot(n,normalize(vec3(-.35,.65,1.))));float fill=max(0.,dot(n,normalize(vec3(.65,.15,.4))));vec3 view=normalize(-vP);float spec=pow(max(0.,dot(n,normalize(view+normalize(vec3(-.35,.65,1.))))),mix(45.,12.,rough))*.06;
 vec3 lit=col*(.43+diffuse*.95+fill*.25)+vec3(spec);if(vTier>=0.)lit+=col*.12*pow(1.-abs(dot(n,view)),2.);
 gl_FragColor=vec4(lit,1.);
 #include <tonemapping_fragment>
 #include <colorspace_fragment>
 }`;
 const baseMat=new THREE.ShaderMaterial({uniforms:extra,vertexShader:baseVertex,fragmentShader:fragment,side:THREE.DoubleSide,depthWrite:true});
 const plantMat=new THREE.ShaderMaterial({uniforms:extra,vertexShader:vertex,fragmentShader:fragment,side:THREE.DoubleSide,vertexColors:true,depthWrite:true});
 const baseMesh=new THREE.Mesh(band,baseMat),plantMesh=new THREE.Mesh(plants,plantMat);baseMesh.frustumCulled=plantMesh.frustumCulled=false;group.add(baseMesh,plantMesh);const proxyMat=new THREE.MeshBasicMaterial({side:THREE.DoubleSide});const proxyMesh=new THREE.Mesh(proxyGeo,proxyMat);proxyMesh.matrixAutoUpdate=false;
 const ray=new THREE.Raycaster(),ndc=new THREE.Vector2(),matrix=new THREE.Matrix4(),turn=new THREE.Matrix4(),rotation=new THREE.Matrix4(),scaleVec=new THREE.Vector3(),hits:THREE.Intersection[]=[];
 let active=0,hasTarget=false,targetU=0,targetV=0,targetSide=1,lastHit:MaterialHit|null=null;
 const gains=[0,0],targets=[0,0];
 function pose(l:GalaxyLayout,tilt:number){const m=l.matrix;matrix.set(m[0],m[3],m[6],0,m[1],m[4],m[7],0,m[2],m[5],m[8],0,0,0,0,1);rotation.makeRotationY(tilt);turn.multiplyMatrices(rotation,matrix);turn.scale(scaleVec.setScalar(l.scale));turn.setPosition(...l.offset);group.matrix.copy(turn);group.updateMatrixWorld(true);proxyMesh.matrixWorld.copy(group.matrixWorld)}
 function pick(x:number,y:number,w:number,h:number,camera:THREE.Camera):MaterialHit|null{ndc.set(x/w*2-1,1-y/h*2);ray.setFromCamera(ndc,camera);hits.length=0;ray.intersectObject(proxyMesh,false,hits);const hit=hits[0];if(!hit?.uv){lastHit=null;return null}const u=hit.uv.x,v=hit.uv.y;const normal=hit.face!.normal.clone().transformDirection(group.matrixWorld);targetSide=normal.dot(ray.ray.direction)<0?1:-1;lastHit={u,v,x,y,distance:0};return lastHit}
 // Two bounded reveal slots permit a short departure overlap without painting the whole ring.
 function update(dt:number,time:number,hover:boolean,u:number,v:number,progress:number,reduced:boolean){
  extra.uClock.value=time;extra.uReducedHabitat.value=reduced?1:0;if(reduced){reset();return}const allowed=hover&&progress<.025&&!reduced;
  if(allowed){const center=shared.uHabitatCenters.value[active],du=Math.atan2(Math.sin(u-center.x),Math.cos(u-center.x));if(!hasTarget||Math.abs(du)>.19||Math.abs(v-center.y)>.42){const old=active;active=1-active;targets[old]=0;shared.uHabitatCenters.value[active].set(u,v,targetSide);gains[active]=0;}else center.set(u,v,targetSide);targets[active]=1;targetU=u;targetV=v;hasTarget=true}else{targets[0]=targets[1]=0;hasTarget=false}
  for(let i=0;i<2;i++){const speed=targets[i]>gains[i]?5:3.3;gains[i]+=(targets[i]-gains[i])*(1-Math.exp(-dt*speed));if(gains[i]<.006)gains[i]=0}
  const fade=1-THREE.MathUtils.smoothstep(progress,0,.13);shared.uHabitatGains.value.set(gains[0]*fade,gains[1]*fade);group.visible=fade>0&&(gains[0]+gains[1]>.006);
 }
 function reset(){gains[0]=gains[1]=targets[0]=targets[1]=0;hasTarget=false;shared.uHabitatGains.value.set(0,0);group.visible=false}
 return{ready,pose,pick,update,reset,snapshot:()=>({visible:group.visible,gains:[...gains],centers:shared.uHabitatCenters.value.map(c=>c.toArray()),target:[targetU,targetV],hit:lastHit,hitDepths:hits.map(h=>h.distance),plantVertices:plants.getAttribute('position').count,baseTriangles:band.index!.count/3,geometryCount:3,textureLoaded:textures.every(t=>!!t.image)}),dispose(){disposed=true;group.removeFromParent();band.dispose();proxyGeo.dispose();proxyMat.dispose();plants.dispose();baseMat.dispose();plantMat.dispose();textures.forEach(t=>t.dispose());placeholders.forEach(t=>t.dispose())}};
}
