import * as THREE from 'three';
import {galaxyLayout} from './mobius-model';
import {motifMotionGLSL,createPathAtlas,pathRow,PATH_ROWS,PATH_SAMPLES} from './motif-motion';
import {createLanePoints,clamp,LANE_DEPTH,laneX,MOTIF_COLORS,type LanePoint} from './vertical-lane-model';
import {sourceFrame,bridgeControls,bezier,smooth,readJourney} from './river-handoff';
export type LaneState={reduced:boolean;paused:boolean;focus:number;selected:number;playing:number};
const readY=()=>document.body.style.position==='fixed'?-(parseFloat(document.body.style.top)||0):window.scrollY;
function journey(host:HTMLElement){return readJourney(host)}
function bridgeSamples(mobile:boolean){let seed=3729;const rnd=()=>{seed=(seed*16807)%2147483647;return(seed-1)/2147483646};return Array.from({length:mobile?1400:2100},(_,i)=>({t:rnd(),offset:(rnd()+rnd()+rnd()-1.5)*(i%5===0?27:6),z:(rnd()-.5)*3,size:1.+rnd()*1.6,alpha:i%5===0?.24:.57+rnd()*.3,part:i%3-1}))}
/** Immutable geometry. Native document positions anchor text; material alone receives depth parallax. */
export function createVerticalLane(host:HTMLElement,canvas:HTMLCanvasElement,state:()=>LaneState,fail:()=>void){
 const viewport=host.querySelector<HTMLElement>('.gravity-viewport')!;
 const renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:false,powerPreference:'low-power'});renderer.setClearColor(0x030506,0);
 const gl=renderer.getContext(),ext=gl.getExtension('WEBGL_debug_renderer_info'),gpu=ext?gl.getParameter(ext.UNMASKED_RENDERER_WEBGL):'unknown';
 const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(42,1,.1,80);camera.position.z=20;camera.updateMatrixWorld();
 const paths=new THREE.DataTexture(createPathAtlas(),PATH_SAMPLES,PATH_ROWS,THREE.RGBAFormat,THREE.FloatType);paths.needsUpdate=true;
 const uniforms={uPaths:{value:paths},uScroll:{value:0},uTime:{value:0},uFlow:{value:0},uPixel:{value:1},uSize:{value:new THREE.Vector2()},uRatio:{value:1},uEnergy:{value:0},uSelected:{value:-1},uSelect:{value:0},uMotion:{value:1},uPointer:{value:new THREE.Vector2()},uPulseY:{value:0},uPulseAt:{value:-20},uBirth:{value:0},uReach:{value:0},uBridge:{value:Array.from({length:4},()=>new THREE.Vector2())},uAnchors:{value:Array.from({length:10},()=>new THREE.Vector2())},uLife:{value:Array(10).fill(0)},uFocus:{value:Array(10).fill(0)},uEcho:{value:Array(10).fill(0)},uColors:{value:MOTIF_COLORS.map(c=>new THREE.Color(c))}};
 const vertex=`attribute float aSize,aAlpha,aKind,aPhase,aAnchor,aPart;attribute vec2 aRoute,aMotion;
 uniform float uScroll,uTime,uFlow,uPixel,uRatio,uEnergy,uSelected,uSelect,uMotion,uBirth,uReach,uPulseY,uPulseAt;
 uniform float uFocus[10],uEcho[10],uLife[10];uniform vec3 uColors[10];uniform vec2 uSize,uPointer,uAnchors[10],uBridge[4];
 varying float vAlpha,vKind;varying vec3 vColor;
${motifMotionGLSL}
 float streamX(float t){float k=clamp(t,0.,9.);int i=int(min(8.,floor(k)));float f=k-float(i);return mix(uAnchors[i].x,uAnchors[i+1].x,f*f*(3.-2.*f));}
 vec2 curve(float t){float a=1.-t;return a*a*a*uBridge[0]+3.*a*a*t*uBridge[1]+3.*a*t*t*uBridge[2]+t*t*t*uBridge[3];}
 void main(){vec3 p=position;
 // Reject invisible material before its shape/transcendental work, not just at rasterization.
 if(aKind<5.5&&abs(p.y-uScroll-uSize.y*.5)>uSize.y*.5+210.){vAlpha=0.;vKind=aKind;vColor=vec3(0.);gl_Position=vec4(2.,2.,2.,1.);gl_PointSize=1.;return;}
float core=1.-step(.1,abs(aKind-3.));float layer=clamp((p.z+10.)/15.,0.,1.);float focus=0.,selected=0.;vColor=vec3(.63,.72,.84);
 if(aAnchor>=0.){focus=uFocus[int(aAnchor)];if((abs(aAnchor-4.)<.1&&aPart>.5)||abs(aAnchor-7.)<.1)focus=uEcho[int(aAnchor)];selected=1.-smoothstep(.1,.8,abs(aAnchor-uSelected));vColor=mix(vec3(.65,.73,.83),uColors[int(aAnchor)],.42+focus*.30);}
 float response=0.,birth=uBirth;
 if(aKind>5.5){float t=p.x;vec2 d=normalize(curve(min(.999,t+.003))-curve(max(.001,t-.003)));vec2 normal=vec2(-d.y,d.x);float width=sin(t*3.14159)*.7+.65;
 p.xy=curve(t)+normal*(p.y*width+aPart*6.+sin(t*13.-uFlow*.25)*2.*uMotion);p.y+=uScroll;
 birth=(1.-smoothstep(uReach-.045,uReach,t))*smoothstep(0.,.08,uReach);
 response=pow(max(0.,sin(t*20.-uFlow*.7)),10.)*.35*uMotion;
 vColor=mix(vec3(.67,.77,.88),vec3(.84,.79,.71),smoothstep(.68,.95,sin(t*14.))*.35);
 }else if(core<.5){
if(aKind>3.5&&aAnchor>=0.){
   vec2 delta=p.xy-uAnchors[int(aAnchor)];float n=aAnchor;
   float scale=uSize.x<701.?.90:1.10;
   float t0=aRoute.x,rate=.034+mod(aRoute.y,9.)*.0017;
   float t=fract(t0+uLife[int(n)]*rate*uMotion);
   vec3 moved=motifPath(aMotion.x,t)-motifPath(aMotion.x,t0);
   p.xy+=moved.xy*scale*aMotion.y;p.z+=moved.z*.55;
   float phase=aPhase+aRoute.y*1.73;
   // Small local thickness changes, not a shared whole-constellation scale pulse.
   p.xy+=vec2(cos(phase),sin(phase*.73))*sin(uLife[int(n)]*.43+phase)*2.2*uMotion;
   p.z+=sin(uLife[int(n)]*.36+phase)*.65*uMotion;
   float endFade=mix(1.,smoothstep(0.,.07,t)*(1.-smoothstep(.93,1.,t)),openPath(n)*uMotion);
   birth*=endFade;
   response=pow(max(0.,sin(uLife[int(n)]*(.65+mod(aRoute.y,5.)*.11)+phase)),8.);
   float distanceToPointer=length(p.xy-vec2(uPointer.x,uPointer.y+uScroll));
   float influence=exp(-distanceToPointer*distanceToPointer/2800.)*focus*uMotion;
   p.xy+=normalize(p.xy-vec2(uPointer.x,uPointer.y+uScroll)+vec2(.1))*influence*3.5;

  }else{
   if(aKind>.5&&aKind<1.5){float stepY=uAnchors[1].y-uAnchors[0].y;float t0=(p.y-uAnchors[0].y)/stepY;float t=t0+sin(uFlow*.22+aPhase)*.085*uMotion;p.x+=streamX(t)-streamX(t0);p.y+=(t-t0)*stepY;}
   p.x+=sin(uTime*(.08+layer*.055)+aPhase)*(1.+layer*2.)*uMotion;p.y+=sin(uFlow*.28+aPhase)*(aKind>.5?3.8:1.7)*uMotion;response=pow(max(0.,sin(p.y*.025-uFlow*.6)),12.)*.35;}
  p.x+=sin(max(0.,uScroll)*.0012+p.z)*layer*3.*uMotion;
  p.y+=sin(max(0.,uScroll)*.0009+aPhase)*layer*(aKind<.5?9.:2.)*uMotion;
  if(aAnchor>=0.)p.xy=mix(p.xy,uAnchors[int(aAnchor)],selected*uSelect*.16);
 }
 float spread=(1.-selected)*uSelect;p.x+=(p.x-uSize.x*.5)*spread*.014*(1.-core);
 layer=clamp((p.z+10.)/15.,0.,1.);float scale=1.-p.z/20.;vec3 world=vec3((p.x-uSize.x*.5)*uPixel*scale,(uSize.y*.5-p.y+uScroll)*uPixel*scale,p.z);
 gl_Position=projectionMatrix*modelViewMatrix*vec4(world,1.);
 gl_PointSize=clamp(aSize*uRatio*(.80+layer*.33)*(1.+focus*.08),.65,26.);
 float pulse=exp(-pow((p.y-uPulseY-(uTime-uPulseAt)*210.)/38.,2.))*(1.-smoothstep(1.2,1.7,uTime-uPulseAt))*uMotion;
 float quiet=1.;if(aAnchor>=0.&&aKind<5.5){vec2 d=p.xy-uAnchors[int(aAnchor)];float inside=(1.-smoothstep(99.,135.,abs(d.x)))*smoothstep(65.,90.,d.y)*(1.-smoothstep(245.,265.,d.y));quiet=1.-inside*.75;}
 vAlpha=aAlpha*(.72+layer*.4)*(1.+focus*.35+response*(.20+focus*.35)*uMotion)*(1.-spread*.72)*birth*quiet*(1.+pulse*.55);
 vKind=aKind;
 }`;
 const fragment=`varying float vAlpha,vKind;varying vec3 vColor;void main(){vec2 q=gl_PointCoord-.5;float r=length(q)*2.;if(r>1.)discard;float alpha=abs(vKind-3.)<.1?exp(-r*r*55.)*1.8+exp(-r*r*11.)*.20:exp(-r*r*3.1);if(alpha*vAlpha<.012)discard;gl_FragColor=vec4(abs(vKind-3.)<.1?vec3(.92,.94,.98):vColor,min(.96,alpha*vAlpha));}`;
 const material=new THREE.ShaderMaterial({uniforms,vertexShader:vertex,fragmentShader:fragment,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending});
 let geometry=new THREE.BufferGeometry();const points=new THREE.Points(geometry,material);points.frustumCulled=false;scene.add(points);
 const lineGeometry=new THREE.BufferGeometry();
 const lineMaterial=new THREE.ShaderMaterial({uniforms,vertexShader:`attribute float aAlpha;uniform float uScroll,uPixel,uMotion,uFlow,uEnergy,uBirth;uniform vec2 uSize;varying float vAlpha;void main(){vec3 p=position;float scale=1.-p.z/20.;gl_Position=projectionMatrix*modelViewMatrix*vec4((p.x-uSize.x*.5)*uPixel*scale,(uSize.y*.5-p.y+uScroll)*uPixel*scale,p.z,1.);vAlpha=aAlpha*(.7+pow(max(0.,sin(p.y*.018-uFlow*.5)),8.)*(.3+uEnergy*.4)*uMotion)*uBirth;}`,fragmentShader:'varying float vAlpha;void main(){gl_FragColor=vec4(.65,.75,.87,vAlpha);}',transparent:true,depthWrite:false,blending:THREE.AdditiveBlending});
 const lines=new THREE.LineSegments(lineGeometry,lineMaterial);lines.frustumCulled=false;scene.add(lines);
 let width=0,height=0,origin=0,total=0,scroll=0,velocity=0,lastScroll=0,scrollTime=performance.now(),elapsed=0,flow=0,frame=0,last=0,frames=0,builds=0,disposed=false,visible=true,submission=0;
 let sourceLayout=galaxyLayout(390,844),source=sourceFrame(390,844,0,sourceLayout),previousFocus=-1,ready=false,warmupMs=0;const pointer=new THREE.Vector2(-1000,-1000),samples:number[]=[];
 function measure(){const w=viewport.clientWidth,h=viewport.clientHeight;origin=host.getBoundingClientRect().top+readY();if(w===width&&h===height)return;width=w;height=h;const data=createLanePoints(w,h);total=data.layout.total;sourceLayout=galaxyLayout(w,h);source=sourceFrame(w,h,0,sourceLayout);builds++;
  const all:LanePoint[]=[...data.points,...bridgeSamples(w<701).map(b=>({x:b.t,y:b.offset,z:b.z,size:b.size,alpha:b.alpha,kind:6,phase:0,anchor:-1,part:b.part}))];
  const attrs:{[key:string]:number[]}={position:[],aSize:[],aAlpha:[],aKind:[],aPhase:[],aAnchor:[],aPart:[],aRoute:[],aMotion:[]};
  for(const p of all){attrs.position.push(p.x,p.y,p.z);attrs.aSize.push(p.size);attrs.aAlpha.push(p.alpha);attrs.aKind.push(p.kind);attrs.aPhase.push(p.phase);attrs.aAnchor.push(p.anchor);attrs.aPart.push(p.part);attrs.aRoute.push(...(p.route||[0,0]));let radius=1;
   if(p.kind===4&&(p.anchor===4||p.anchor===5)){const scale=w<701?.90:1.10,dx=(p.x-data.layout.xs[p.anchor]*w)/scale,dy=(p.y-data.layout.start-p.anchor*data.layout.step)/scale;radius=p.anchor===4?Math.hypot(dx-p.part*31,(dy-p.part*13)/.75):Math.hypot(dx-30,(dy+9)/.68)}
   attrs.aMotion.push(p.kind===4?pathRow(p.anchor,p.route![1],p.part):0,radius)}
  geometry.dispose();geometry=new THREE.BufferGeometry();for(const [name,array]of Object.entries(attrs))geometry.setAttribute(name,new THREE.Float32BufferAttribute(array,name==='position'?3:name==='aRoute'||name==='aMotion'?2:1));points.geometry=geometry;
  // Discontinuous fine filaments trace known material paths, never random point-to-point connections.
  const lp:number[]=[],la:number[]=[];for(let strand=0;strand<3;strand++)for(let j=0;j<900;j++){const t=j/100;if(Math.sin(t*11+strand*2)<.36||t%1<.1||t%1>.44)continue;for(const v of[t,t+.01]){lp.push(laneX(v,data.layout.xs)*w+Math.sin(v*5.8)*12+(strand-1)*9,data.layout.start+v*data.layout.step,-1+strand);la.push(.12*Math.sin((t%1-.1)/.34*Math.PI))}}
  lineGeometry.setAttribute('position',new THREE.Float32BufferAttribute(lp,3));lineGeometry.setAttribute('aAlpha',new THREE.Float32BufferAttribute(la,1));
  data.layout.xs.forEach((x,i)=>uniforms.uAnchors.value[i].set(x*w,data.layout.start+i*data.layout.step));camera.aspect=w/h;camera.updateProjectionMatrix();uniforms.uPixel.value=2*Math.tan(21*Math.PI/180)*20/h;uniforms.uSize.value.set(w,h);renderer.setPixelRatio(Math.min(devicePixelRatio,w<701?1.5:1.5));renderer.setSize(w,h,false);uniforms.uRatio.value=renderer.getPixelRatio();host.dataset.renderer='webgl';
 }
 function draw(now:number){frame=0;if(disposed||!ready||document.hidden||!visible||state().paused)return;const s=state(),interval=1000/60;if(!s.reduced&&now-last<interval-1){frame=requestAnimationFrame(draw);return}const dt=Math.min(.06,Math.max(.001,(now-last)/1000));last=now;if(!s.reduced)elapsed+=dt;
  const j=journey(host);scroll=Math.min(readY()-origin,Math.max(0,total-height));
  source=sourceFrame(width,height,j.progress,sourceLayout);const c=bridgeControls(source,width,height,uniforms.uAnchors.value[0].x,uniforms.uAnchors.value[0].y,j.progress,scroll);c.forEach((v,i)=>uniforms.uBridge.value[i].set(v[0],v[1]));uniforms.uReach.value=smooth(.30,.53,j.progress);uniforms.uBirth.value=smooth(.50,.74,j.progress);
  const decay=Math.exp(-Math.max(0,now-scrollTime)/190);uniforms.uEnergy.value+=((s.reduced?0:Math.min(1,Math.abs(velocity))*decay)-uniforms.uEnergy.value)*(1-Math.exp(-dt*9));
  if(!s.reduced)flow+=dt*(1+uniforms.uEnergy.value*1.6);uniforms.uFlow.value=s.reduced?0:flow;uniforms.uScroll.value=scroll;uniforms.uTime.value=s.reduced?0:elapsed;uniforms.uMotion.value=s.reduced?0:1;
  if(s.focus!==previousFocus){previousFocus=s.focus;uniforms.uPulseAt.value=elapsed;uniforms.uPulseY.value=uniforms.uAnchors.value[s.focus].y}
  for(let i=0;i<10;i++){
   const target=Number(s.focus===i);
   const distance=Math.abs(uniforms.uAnchors.value[i].y-scroll-height*.45);
   if(!s.reduced)uniforms.uLife.value[i]+=dt*(distance<height*.75?(.72+target*.48+uniforms.uEnergy.value*.38):.20);
   uniforms.uFocus.value[i]+=(target-uniforms.uFocus.value[i])*(s.reduced?1:1-Math.exp(-dt*(i===9?14:7)));
   uniforms.uEcho.value[i]+=(target-uniforms.uEcho.value[i])*(s.reduced?1:1-Math.exp(-dt*2.8));
  }
  uniforms.uSelected.value=s.selected;uniforms.uSelect.value+=(Number(s.selected>=0)-uniforms.uSelect.value)*(s.reduced?1:1-Math.exp(-dt*16));uniforms.uPointer.value.lerp(pointer,1-Math.exp(-dt*12));
  const t=performance.now();renderer.render(scene,camera);submission=performance.now()-t;frames++;samples.push(submission);if(samples.length>240)samples.shift();if(!s.reduced)frame=requestAnimationFrame(draw);
 }
 function wake(){if(disposed)return;if(state().paused||document.hidden||!visible){cancelAnimationFrame(frame);frame=0;return}if(!frame){last=performance.now()-34;frame=requestAnimationFrame(draw)}}
 function onScroll(){const now=performance.now(),y=readY();if(document.body.style.position!=='fixed'){velocity=clamp((y-lastScroll)/Math.max(16,now-scrollTime)/1.3,-1,1);lastScroll=y;scrollTime=now}wake()}
 function resize(){measure();wake()}
 function move(e:PointerEvent){if(e.pointerType!=='mouse'||state().reduced)return;pointer.set(e.clientX,e.clientY);wake()}
 function leave(){pointer.set(-1000,-1000);wake()}
 function lost(e:Event){e.preventDefault();fail()}
 const observer=new ResizeObserver(resize);observer.observe(viewport);const intersection=new IntersectionObserver(e=>{visible=e[0].isIntersecting;wake()});intersection.observe(viewport);
 window.addEventListener('scroll',onScroll,{passive:true});window.addEventListener('resize',resize);host.addEventListener('pointermove',move,{passive:true});host.addEventListener('pointerleave',leave);document.addEventListener('visibilitychange',wake);canvas.addEventListener('webglcontextlost',lost);measure();renderer.compileAsync(scene,camera).then(()=>{if(!disposed){
  // Compile alone does not guarantee driver pipeline/buffer readiness. Warm the actual
  // drawing target once with zero opacity before the scroll handoff can expose it.
  const start=performance.now();renderer.render(scene,camera);renderer.clear();warmupMs=performance.now()-start;
  ready=true;wake()
 }}).catch(fail);
 (host as HTMLElement&{gravitySnapshot?:()=>unknown}).gravitySnapshot=()=>({renderer:'WebGLRenderer',ready,warmupMs,pathTextureBytes:paths.image.data!.byteLength,cameraType:camera.type,gpu,frames,elapsed,disposed,visible,paused:state().paused,reduced:state().reduced,focused:state().focus+1,life:[...uniforms.uLife.value],focusLevels:[...uniforms.uFocus.value],echoLevels:[...uniforms.uEcho.value],selected:state().selected,progress:journey(host).progress,bridge:uniforms.uBridge.value.map(v=>v.toArray()),reach:uniforms.uReach.value,birth:uniforms.uBirth.value,scroll,energy:uniforms.uEnergy.value,drawCalls:renderer.info.render.calls,particles:geometry.getAttribute('position').count,depths:LANE_DEPTH,geometryBuilds:builds,pixelRatio:renderer.getPixelRatio(),renderSubmissionMs:submission,submissionSamples:samples.slice()});
 return{wake,dispose(){if(disposed)return;disposed=true;cancelAnimationFrame(frame);observer.disconnect();intersection.disconnect();window.removeEventListener('scroll',onScroll);window.removeEventListener('resize',resize);host.removeEventListener('pointermove',move);host.removeEventListener('pointerleave',leave);document.removeEventListener('visibilitychange',wake);canvas.removeEventListener('webglcontextlost',lost);geometry.dispose();lineGeometry.dispose();material.dispose();lineMaterial.dispose();paths.dispose();renderer.dispose();renderer.forceContextLoss();host.dataset.disposed='true'}};
}
function dot(ctx:CanvasRenderingContext2D,x:number,y:number,r:number,color:string,alpha:number){ctx.globalAlpha=clamp(alpha);ctx.fillStyle=color;ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill()}
export function drawLaneStill(canvas:HTMLCanvasElement,host:HTMLElement){
 const width=host.clientWidth,height=host.querySelector<HTMLElement>('.gravity-viewport')!.clientHeight,{layout,points}=createLanePoints(width,height),dpr=Math.min(devicePixelRatio,1.25);canvas.width=Math.round(width*dpr);canvas.height=Math.round(layout.total*dpr);const ctx=canvas.getContext('2d');if(!ctx)return;ctx.scale(dpr,dpr);
 points.sort((a,b)=>a.z-b.z).forEach(p=>{const anchor=p.anchor,dx=p.x-(layout.xs[anchor]||0)*width,dy=p.y-(layout.start+anchor*layout.step),quiet=anchor>=0&&Math.abs(dx)<125&&dy>75&&dy<245?.25:1;const color=anchor>=0?MOTIF_COLORS[anchor]:'#adc1d2';dot(ctx,p.x,p.y,p.kind===3?2.2:p.size*.48,color,p.alpha*(.8+(p.z+10)/40)*quiet);if(p.kind===3){const g=ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,10);g.addColorStop(0,'#c9dce94a');g.addColorStop(1,'#c9dce900');ctx.globalAlpha=1;ctx.fillStyle=g;ctx.fillRect(p.x-10,p.y-10,20,20)}});
}
export function createBridgeStill(canvas:HTMLCanvasElement,host:HTMLElement){
 let frame=0,disposed=false,w=0,h=0,fitted=galaxyLayout(390,844),source=sourceFrame(390,844),samples=bridgeSamples(true);
 const draw=()=>{frame=0;if(disposed||document.hidden)return;const width=host.clientWidth,height=host.querySelector<HTMLElement>('.gravity-viewport')!.clientHeight;if(width!==w||height!==h){w=width;h=height;fitted=galaxyLayout(w,h);source=sourceFrame(w,h,0,fitted);samples=bridgeSamples(w<701);canvas.width=w;canvas.height=h}const ctx=canvas.getContext('2d');if(!ctx)return;ctx.clearRect(0,0,w,h);const data=createLayout(w,h),j=journey(host),scroll=readY()-(host.getBoundingClientRect().top+readY());source=sourceFrame(w,h,j.progress,fitted);const controls=bridgeControls(source,w,h,data.x,data.y,j.progress,scroll),reach=smooth(.30,.53,j.progress);for(const b of samples){if(b.t>reach)continue;const p=bezier(controls,b.t),q=bezier(controls,Math.min(.999,b.t+.003));const dx=q[0]-p[0],dy=q[1]-p[1],len=Math.hypot(dx,dy)||1,off=b.offset*(Math.sin(b.t*Math.PI)*.7+.65)+b.part*6;dot(ctx,p[0]-dy/len*off,p[1]+dx/len*off,b.size*.48,'#b7c9df',b.alpha*smooth(0,.08,reach)*(1-smooth(reach-.045,reach,b.t)))}};
 function createLayout(width:number,height:number){const l=createLanePointsLayout(width,height);return{x:l.xs[0]*width,y:l.start}}
 const wake=()=>{if(!frame&&!disposed)frame=requestAnimationFrame(draw)};window.addEventListener('scroll',wake,{passive:true});window.addEventListener('resize',wake);document.addEventListener('visibilitychange',wake);wake();return()=>{disposed=true;cancelAnimationFrame(frame);window.removeEventListener('scroll',wake);window.removeEventListener('resize',wake);document.removeEventListener('visibilitychange',wake)};
}
import {laneLayout as createLanePointsLayout} from './vertical-lane-model';
