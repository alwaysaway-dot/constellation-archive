import * as THREE from 'three';
import {RISE} from './river-handoff';
import {newInput,hitProxy,bindMobiusInput,type MaterialHit} from './mobius-input';
import {galaxyLayout,grains,mobiusPoint,project,depthLight,seeded,TAU,type GalaxyLayout} from './mobius-model';
export type MobiusState={progress:number;reduced:boolean;paused:boolean;velocity:number;velocityAt:number};
/** Three batched draws; immutable attributes, continuous GPU flow, no post-processing. */
export function createMobius(canvas:HTMLCanvasElement,host:HTMLElement,state:()=>MobiusState,onFallback:()=>void){
 const renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:false,powerPreference:'low-power'});renderer.setClearColor(0x030506,0);renderer.outputColorSpace=THREE.SRGBColorSpace;
 const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(35,1,.1,80);camera.position.z=18;
 let disposed=false,ready=false,visible=true,raf=0,last=0,time=0,travel=0,energy=0,frames=0,builds=0,mobile=false,previousWidth=0,previousHeight=0,drawMs=0,hover=0,tilt=0;
 const input=newInput();let layout:GalaxyLayout,proxy:ReturnType<typeof hitProxy>,bounds={left:0,top:0};
 const hoverTarget=new THREE.Vector3(),hoverPoint=new THREE.Vector3(),eventPoint=new THREE.Vector3();
 const materialInto=(out:THREE.Vector3,u:number,v:number)=>out.set((3.15+v*Math.cos(u/2))*Math.cos(u),(3.15+v*Math.cos(u/2))*Math.sin(u),v*Math.sin(u/2));
 const costs=new Float32Array(240);let costIndex=0;
 const uniforms={uTime:{value:0},uTravel:{value:0},uEnergy:{value:0},uProgress:{value:0},uRatio:{value:1},uMatrix:{value:new THREE.Matrix3()},uScale:{value:1},uOffset:{value:new THREE.Vector3()},uReduced:{value:0},uHover:{value:0},uTilt:{value:0},uHoverPoint:{value:hoverPoint},uEventPoint:{value:eventPoint},uEvent:{value:0}};
 const resources:(THREE.BufferGeometry|THREE.Material)[]=[];
 const common=`attribute vec4 aParam;attribute vec3 aStyle;
 uniform float uTime,uTravel,uEnergy,uProgress,uRatio,uScale,uReduced,uHover,uTilt,uEvent;
 uniform mat3 uMatrix;uniform vec3 uOffset,uHoverPoint,uEventPoint;
 varying float vAlpha;varying float vStar;varying vec3 vColor;varying float vDepth;
 vec3 materialPoint(float u,float v){return vec3((3.15+v*cos(u*.5))*cos(u),(3.15+v*cos(u*.5))*sin(u),v*sin(u*.5));}
 vec3 surfaceNormal(float u,float v){float r=3.15+v*cos(u*.5);vec3 du=vec3(-r*sin(u)-v*.5*sin(u*.5)*cos(u),r*cos(u)-v*.5*sin(u*.5)*sin(u),v*.5*cos(u*.5));return normalize(cross(du,vec3(cos(u*.5)*cos(u),cos(u*.5)*sin(u),sin(u*.5))));}
 float localInfluence(vec3 p){return uHover*exp(-dot(p-uHoverPoint,p-uHoverPoint)*2.2)+uEvent*exp(-dot(p-uEventPoint,p-uEventPoint)*3.0);}
 vec3 pose(vec3 p){float c=cos(uTilt),s=sin(uTilt);return vec3(p.x*c+p.z*s,p.y,-p.x*s+p.z*c);}
 vec3 location(float u,float v){
  vec3 m=materialPoint(u,v),p=m+position;float local=localInfluence(m)*(1.-smoothstep(.12,.35,uProgress));
  p+=surfaceNormal(u,v)*local*.07;
  // The original band remains intact; the journey moves the viewport, not its topology.
  return pose(uMatrix*p)*uScale+uOffset;
 }
 void tone(float u,float v,vec3 p){
  vec3 n=normalize(pose(uMatrix*surfaceNormal(u,v)));
  float facing=.65+.35*pow(abs(dot(n,normalize(vec3(-.25,.6,1.)))),.7);
  float near=smoothstep(-3.8,3.8,p.z/uScale);vDepth=near;
  float lit=.70+.45*exp(-pow(abs(sin((u-2.8)*.5))*2.8,2.));
  float age=mod(uTime+7.,14.);float ambient=(1.-uReduced)*(1.-smoothstep(1.8,2.5,age))*step(age,2.5)*.15;
  float signal=exp(-pow(abs(sin((u-age*.8-2.4)*.5))*6.,2.))*(ambient+uEnergy*.5);
  float local=localInfluence(materialPoint(u,v));
  float fold=pow(1.-abs(n.z),4.)*.28;
  vAlpha=2.2*aStyle.y*(lit*facing+fold)*(.50+.50*near)*(1.+signal+local*.85)*(1.+smoothstep(.02,.22,uProgress)*exp(-pow(abs(sin((u-3.2)*.5))*9.,2.))*.48);
  vAlpha*=1.+sin(uTime*.6+aParam.w)*.035*(1.-uReduced);
  vColor=mix(vec3(.40,.50,.62),vec3(.84,.89,.94),near);vStar=aStyle.z;
 }`;
 const vertex=common+`void main(){float u=aParam.x+uTravel*aParam.z;vec3 p=location(u,aParam.y);tone(u,aParam.y,p);vec4 mv=modelViewMatrix*vec4(p,1.);gl_Position=projectionMatrix*mv;gl_PointSize=clamp(aStyle.x*(.75+.45*vDepth)*uRatio*18./-mv.z,.8,7.);}`;
 const fragment=`varying float vAlpha;varying float vStar;varying vec3 vColor;void main(){vec2 p=(gl_PointCoord-.5)*2.;float r=length(p);if(r>1.)discard;float dotShape=exp(-r*r*5.);float rays=(exp(-abs(p.x)*28.)+exp(-abs(p.y)*28.))*pow(max(0.,1.-r),2.)*.22*vStar;float a=clamp(vAlpha*(dotShape+rays),0.,.92);if(a<.018)discard;gl_FragColor=vec4(vColor,a);}`;
 const lineVertex=common+`void main(){float lag=aStyle.x;float lead=aParam.x+uTravel*aParam.z;float drive=min(1.,uEnergy+localInfluence(materialPoint(lead,aParam.y))*.6);float u=lead-lag*(.015+drive*.065);vec3 p=location(u,aParam.y);gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);tone(u,aParam.y,p);vAlpha*=aStyle.z>.5?drive*(1.-lag):1.;}`;
 const lineFragment=`varying float vAlpha;varying vec3 vColor;void main(){gl_FragColor=vec4(vColor,vAlpha);}`;
 function geometry(params:number[],style:number[],offsets:number[]){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(offsets,3));g.setAttribute('aParam',new THREE.Float32BufferAttribute(params,4));g.setAttribute('aStyle',new THREE.Float32BufferAttribute(style,3));resources.push(g);return g}
 function build(){scene.clear();resources.splice(0).forEach(r=>r.dispose());builds++;const gs=grains(mobile?11000:24000),p:number[]=[],s:number[]=[],o:number[]=[];for(const g of gs){p.push(g.u,g.v,g.rate,g.seed);s.push(g.size,g.alpha,g.star?1:0);o.push(...g.offset)}
 const mat=new THREE.ShaderMaterial({uniforms,vertexShader:vertex,fragmentShader:fragment,transparent:true,depthWrite:true,blending:THREE.NormalBlending});resources.push(mat);const pts=new THREE.Points(geometry(p,s,o),mat);pts.frustumCulled=false;scene.add(pts);
 const rand=seeded(2981),lp:number[]=[],ls:number[]=[],lo:number[]=[];
 for(let i=0;i<(mobile?16:40);i++){const u=(i%2?2.3:4.9)+(rand()-.5)*1.1,v=(rand()*2-1)*1.12,len=.12+rand()*.30,rate=.8+rand()*.4;for(let j=0;j<14;j++)for(const k of [j,j+1]){const f=k/14;lp.push(u+f*len,v+Math.sin(f*3.14)*.025,rate,i);ls.push(0,Math.sin(f*Math.PI)*(.10+rand()*.07),0);lo.push(0,0,0)}}
 const lm=new THREE.ShaderMaterial({uniforms,vertexShader:lineVertex,fragmentShader:lineFragment,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending});resources.push(lm);const lines=new THREE.LineSegments(geometry(lp,ls,lo),lm);lines.frustumCulled=false;scene.add(lines);
 const tp:number[]=[],ts:number[]=[],to:number[]=[];for(const g of gs.filter(g=>g.star).slice(0,mobile?18:48))for(let j=0;j<6;j++)for(const k of [j,j+1]){tp.push(g.u,g.v,g.rate,g.seed);ts.push(k/6,.22,1);to.push(...g.offset)}const tails=new THREE.LineSegments(geometry(tp,ts,to),lm);tails.frustumCulled=false;scene.add(tails);
 }
 function paint(now:number){raf=0;const st=state();if(disposed||!ready||document.hidden||!visible||st.paused)return;const interval=mobile?33.33:16.66;if(!st.reduced&&last&&now-last<interval-1){raf=requestAnimationFrame(paint);return}const dt=last?Math.max(0,Math.min(.06,(now-last)/1000)):0;last=now;
 if(!st.reduced){time+=dt;energy+=(Math.min(1,Math.abs(st.velocity)*Math.exp(-(now-st.velocityAt)/220)*.6)-energy)*(1-Math.exp(-dt*5));travel+=dt*(.022+energy*.12)}else energy=0;
 const activeInput=!st.reduced&&st.progress<.35;
 if(!activeInput){input.hover=0;input.tiltTarget=0;input.eventAt=-10000}
 hover+=(input.hover-hover)*(1-Math.exp(-dt*8));tilt+=(input.tiltTarget-tilt)*(1-Math.exp(-dt*4));
 if(st.reduced){hover=0;tilt=0}
 materialInto(hoverTarget,input.u,input.v);hoverPoint.lerp(hoverTarget,1-Math.exp(-dt*12));const eventAge=Math.max(0,(now-input.eventAt)/1000);
 materialInto(eventPoint,input.eventU+eventAge*.8,input.eventV);
 uniforms.uHover.value=hover;uniforms.uTilt.value=tilt;uniforms.uEvent.value=eventAge<2.5?Math.exp(-eventAge*1.6):0;
 uniforms.uTime.value=st.reduced?0:time;uniforms.uTravel.value=st.reduced?0:travel;uniforms.uEnergy.value=energy;uniforms.uProgress.value=st.progress;uniforms.uReduced.value=st.reduced?1:0;
 const begin=performance.now();renderer.render(scene,camera);drawMs=performance.now()-begin;costs[costIndex++%240]=drawMs;frames++;host.dataset.renderer='webgl';if(!st.reduced)raf=requestAnimationFrame(paint);
 }
 function wake(){if(disposed)return;if(document.hidden||!visible||state().paused){input.hover=0;input.tiltTarget=0;input.eventAt=-10000;hover=0;tilt=0;cancelAnimationFrame(raf);raf=0;last=0;return}if(!raf)raf=requestAnimationFrame(paint)}
 function resize(){const r=host.getBoundingClientRect(),w=Math.max(1,r.width),h=Math.max(1,r.height);if(w===previousWidth&&h===previousHeight)return;const wasMobile=mobile;mobile=w<701;camera.aspect=w/h;camera.updateProjectionMatrix();renderer.setPixelRatio(Math.min(devicePixelRatio,mobile?1.2:1.5));renderer.setSize(w,h,false);uniforms.uRatio.value=renderer.getPixelRatio();const l=galaxyLayout(w,h);layout=l;bounds={left:r.left,top:r.top+state().progress*h*RISE};proxy=hitProxy(l);uniforms.uMatrix.value.fromArray(l.matrix);uniforms.uScale.value=l.scale;uniforms.uOffset.value.fromArray(l.offset);if(!builds||wasMobile!==mobile)build();previousWidth=w;previousHeight=h;wake()}
 const pick=(x:number,y:number):MaterialHit|null=>proxy?.(x-bounds.left,y-bounds.top+state().progress*previousHeight*RISE,mobile?25:38)||null;
 const unbind=bindMobiusInput(host,input,pick,()=>!disposed&&!document.hidden&&visible&&!state().paused&&!state().reduced&&state().progress<.28,wake);
 function loss(e:Event){e.preventDefault();onFallback()}
 const observer=new IntersectionObserver(es=>{visible=es[0].isIntersecting;wake()});observer.observe(host);const size=new ResizeObserver(resize);size.observe(host);document.addEventListener('visibilitychange',wake);canvas.addEventListener('webglcontextlost',loss);
 const gl=renderer.getContext(),debug=gl.getExtension('WEBGL_debug_renderer_info');
 (host as HTMLElement&{fieldSnapshot?:()=>unknown}).fieldSnapshot=()=>({renderer:'WebGLRenderer',disposed,cameraType:camera.type,frames,elapsed:time,travel,energy,progress:state().progress,velocity:state().velocity,input:{...input,hoverLevel:hover,tilt,eventLevel:uniforms.uEvent.value,eventPoint:eventPoint.toArray(),hoverPoint:hoverPoint.toArray()},interactionAnchors:layout?[.7,2.8,4.9].map(u=>({u,v:0,screen:project(mobiusPoint(u,0),layout)})):[],drawCalls:renderer.info.render.calls,particles:mobile?11000:24000,pixelRatio:renderer.getPixelRatio(),geometryBuilds:builds,geometryCount:renderer.info.memory.geometries,renderSubmissionMs:drawMs,submissionSamples:Array.from(costs.slice(0,Math.min(costIndex,240))),gpu:debug?gl.getParameter(debug.UNMASKED_RENDERER_WEBGL):'unavailable'});
 resize();renderer.compileAsync(scene,camera).then(()=>{if(!disposed){ready=true;wake()}}).catch(()=>{if(!disposed)onFallback()});return{wake,dispose(){disposed=true;unbind();cancelAnimationFrame(raf);observer.disconnect();size.disconnect();document.removeEventListener('visibilitychange',wake);canvas.removeEventListener('webglcontextlost',loss);resources.forEach(r=>r.dispose());scene.clear();renderer.dispose();renderer.forceContextLoss();delete(host as HTMLElement&{fieldSnapshot?:()=>unknown}).fieldSnapshot}};
}
/** Honest static fallback: the same seeded particle coordinates, projected once on resize. */
export function drawMobiusStill(canvas:HTMLCanvasElement){
 const r=canvas.getBoundingClientRect(),w=r.width,h=r.height;if(!w||!h)return;const d=Math.min(devicePixelRatio,1.5);canvas.width=w*d;canvas.height=h*d;const ctx=canvas.getContext('2d');if(!ctx)return;ctx.scale(d,d);ctx.clearRect(0,0,w,h);
 const l=galaxyLayout(w,h),points=grains(w<701?6500:12000).map(g=>{const p=mobiusPoint(g.u,g.v),s=project(p.map((v,i)=>v+g.offset[i]),l);return{g,s}}).sort((a,b)=>a.s[2]-b.s[2]);
 for(const {g,s} of points){const lit=depthLight(g.u,g.v,s[2],l),alpha=Math.min(.88,g.alpha*lit.alpha*.65),radius=g.size*(.75+.45*lit.near)*.42;ctx.fillStyle=`rgba(${Math.round(125+89*lit.near)},${Math.round(150+77*lit.near)},${Math.round(180+60*lit.near)},${alpha})`;ctx.beginPath();ctx.arc(s[0],s[1],radius,0,TAU);ctx.fill()}
}
