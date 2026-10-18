import * as THREE from 'three';
import {createLanePoints,clamp,LANE_DEPTH,laneX,type LanePoint} from './vertical-lane-model';
import {SIGNAL_COLORS} from './gravity-layout';
export type LaneState={reduced:boolean;paused:boolean;focus:number;selected:number;playing:number};
/** Native vertical document coordinates are the navigation source of truth.
 * Perspective points retain real depth; the node cores are anchored to the DOM,
 * while only surrounding material receives bounded depth parallax. */
export function createVerticalLane(host:HTMLElement,canvas:HTMLCanvasElement,state:()=>LaneState,fail:()=>void){
 const viewport=host.querySelector<HTMLElement>('.gravity-viewport')!;
 const renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:false,powerPreference:'low-power'});renderer.setClearColor(0x030506,0);
 const gl=renderer.getContext(),ext=gl.getExtension('WEBGL_debug_renderer_info'),gpu=ext?gl.getParameter(ext.UNMASKED_RENDERER_WEBGL):'unknown';
 const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(42,1,.1,80);camera.position.z=20;camera.updateMatrixWorld();
 const colors=SIGNAL_COLORS.map(c=>new THREE.Color(c));
 const uniforms={uScroll:{value:0},uTime:{value:0},uFlow:{value:0},uPixel:{value:1},uSize:{value:new THREE.Vector2()},uRatio:{value:1},uEnergy:{value:0},uFocus:{value:0},uSelected:{value:-1},uSelect:{value:0},uMotion:{value:1},uPointer:{value:new THREE.Vector2()},uColor:{value:new THREE.Color('#a5b8c7')},uAnchors:{value:Array.from({length:10},()=>new THREE.Vector2())}};
 const vertex=`attribute float aSize;attribute float aAlpha;attribute float aKind;attribute float aPhase;attribute float aAnchor;
 uniform float uScroll,uTime,uFlow,uPixel,uRatio,uEnergy,uFocus,uSelected,uSelect,uMotion;uniform vec2 uSize,uPointer,uAnchors[10];
 varying float vAlpha,vKind,vFocus;
 void main(){vec3 p=position;float core=step(2.5,aKind);float layer=clamp((p.z+10.)/15.,0.,1.);float focus=1.-smoothstep(.1,.8,abs(aAnchor-uFocus));float selected=1.-smoothstep(.1,.8,abs(aAnchor-uSelected));
 if(core<.5){float around=1.-step(.5,aKind);p.x+=sin(uTime*(.08+layer*.055)+aPhase)*(1.+layer*2.)*uMotion;p.y+=(aKind>.5?sin(uFlow*.28+aPhase)*3.8:cos(uTime*.06+aPhase)*1.7)*uMotion;
 // Depth-dependent, bounded parallax affects material, never the readable anchors.
 p.x+=(uPointer.x*(1.+layer*5.)+sin(uScroll*.0012+p.z)*layer*5.)*uMotion;
 p.y+=sin(uScroll*.0009+aPhase)*layer*(around*14.+3.)*uMotion;
 if(aAnchor>=0.){vec2 anchor=uAnchors[int(aAnchor)];p.xy=mix(p.xy,anchor,selected*uSelect*.18);}
 }
 float spread=(1.-selected)*uSelect;p.x+=(p.x-uSize.x*.5)*spread*.018*(1.-core);
 float scale=1.-p.z/20.;vec3 world=vec3((p.x-uSize.x*.5)*uPixel*scale,(uSize.y*.5-p.y+uScroll)*uPixel*scale,p.z);
 gl_Position=projectionMatrix*modelViewMatrix*vec4(world,1.);
 float energy=(sin(uTime*.9+aPhase)*.5+.5)*focus*uEnergy;
 gl_PointSize=clamp(aSize*uRatio*(.77+layer*.32)*(1.+focus*.15)*(1.+energy*.1),.65,30.);
 float propagation=pow(max(0.,sin(p.y*.023-uTime*.35)),12.)*focus*.12*uMotion;
 vAlpha=aAlpha*(.74+layer*.34)*(1.+focus*.42+propagation)*(1.-spread*.68);vKind=aKind;vFocus=focus;

 }`;
 const fragment=`varying float vAlpha,vKind,vFocus;uniform vec3 uColor;void main(){vec2 q=gl_PointCoord-.5;float r=length(q)*2.;if(r>1.)discard;float alpha;if(vKind>2.5){alpha=exp(-r*r*40.)+exp(-r*r*10.)*.2;}else{alpha=pow(max(0.,1.-r),1.4);}
 vec3 color=mix(vec3(.64,.72,.80),uColor,vFocus*.32);gl_FragColor=vec4(color,alpha*vAlpha);}`;
 const material=new THREE.ShaderMaterial({uniforms,vertexShader:vertex,fragmentShader:fragment,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending});
 let geometry=new THREE.BufferGeometry(),points=new THREE.Points(geometry,material);points.frustumCulled=false;scene.add(points);
 // Sparse short trails follow the lane's local direction; the buffer is built once.
 const tailUniforms=uniforms,tailGeometry=new THREE.BufferGeometry();
 const tailMaterial=new THREE.ShaderMaterial({uniforms:tailUniforms,vertexShader:`attribute float aEnd;attribute float aSlope;uniform float uScroll,uPixel,uEnergy,uTime,uMotion,uSelect;uniform vec2 uSize;varying float vAlpha;void main(){vec3 p=position;float fade=pow(max(0.,sin(p.y*.017-uTime*.35)),4.);p.xy+=vec2(aSlope,1.)*aEnd*(2.+uEnergy*7.)*uMotion;float scale=1.-p.z/20.;vec3 world=vec3((p.x-uSize.x*.5)*uPixel*scale,(uSize.y*.5-p.y+uScroll)*uPixel*scale,p.z);gl_Position=projectionMatrix*modelViewMatrix*vec4(world,1.);vAlpha=(1.-aEnd)*fade*uEnergy*.22*(1.-uSelect*.5);}`,fragmentShader:'varying float vAlpha;void main(){gl_FragColor=vec4(.65,.74,.82,vAlpha);}',transparent:true,depthWrite:false,blending:THREE.AdditiveBlending});
 const tails=new THREE.LineSegments(tailGeometry,tailMaterial);tails.frustumCulled=false;scene.add(tails);
 let width=0,height=0,origin=0,total=0,scroll=0,velocity=0,lastScroll=0,scrollTime=performance.now(),elapsed=0,flow=0,frame=0,last=0,frames=0,builds=0,disposed=false,visible=true,submission=0;
 const pointer=new THREE.Vector2(),samples:number[]=[];
 const readY=()=>document.body.style.position==='fixed'?-(parseFloat(document.body.style.top)||0):window.scrollY;
 function measure(){const w=viewport.clientWidth,h=viewport.clientHeight;origin=host.getBoundingClientRect().top+readY();if(w===width&&h===height)return;width=w;height=h;const data=createLanePoints(w,h);total=data.layout.total;builds++;
  const positions:number[]=[],sizes:number[]=[],alphas:number[]=[],kinds:number[]=[],phases:number[]=[],anchors:number[]=[],tp:number[]=[],te:number[]=[],ts:number[]=[];let brightIndex=0;
  data.points.forEach(p=>{positions.push(p.x,p.y,p.z);sizes.push(p.size);alphas.push(p.alpha);kinds.push(p.kind);phases.push(p.phase);anchors.push(p.anchor);if(p.kind===2&&brightIndex++%(w<701?4:3)===0){const t=(p.y-data.layout.start)/data.layout.step,slope=(laneX(t+.03,data.layout.xs)-laneX(t-.03,data.layout.xs))*w/(.06*data.layout.step);tp.push(p.x,p.y,p.z,p.x,p.y,p.z);te.push(0,1);ts.push(slope,slope)}});
  geometry.dispose();geometry=new THREE.BufferGeometry();for(const [name,array,size] of [['position',positions,3],['aSize',sizes,1],['aAlpha',alphas,1],['aKind',kinds,1],['aPhase',phases,1],['aAnchor',anchors,1]] as [string,number[],number][]){geometry.setAttribute(name,new THREE.Float32BufferAttribute(array,size))}points.geometry=geometry;
  tailGeometry.setAttribute('position',new THREE.Float32BufferAttribute(tp,3));tailGeometry.setAttribute('aEnd',new THREE.Float32BufferAttribute(te,1));tailGeometry.setAttribute('aSlope',new THREE.Float32BufferAttribute(ts,1));
  data.layout.xs.forEach((x,i)=>uniforms.uAnchors.value[i].set(x*w,data.layout.start+i*data.layout.step));camera.aspect=w/h;camera.updateProjectionMatrix();uniforms.uPixel.value=2*Math.tan(21*Math.PI/180)*20/h;uniforms.uSize.value.set(w,h);renderer.setPixelRatio(Math.min(devicePixelRatio,w<701?1.65:1.5));renderer.setSize(w,h,false);uniforms.uRatio.value=renderer.getPixelRatio();host.dataset.renderer='webgl';
 }
 function draw(now:number){frame=0;if(disposed||document.hidden||!visible||state().paused)return;const s=state(),interval=width<701?1000/30:1000/60;if(!s.reduced&&now-last<interval-1){frame=requestAnimationFrame(draw);return}const dt=Math.min(.06,Math.max(.001,(now-last)/1000));last=now;if(!s.reduced)elapsed+=dt;
  scroll=clamp(readY()-origin,0,Math.max(0,total-height));const decay=Math.exp(-Math.max(0,now-scrollTime)/190);uniforms.uEnergy.value+=((s.reduced?0:Math.min(1,Math.abs(velocity))*decay)-uniforms.uEnergy.value)*(1-Math.exp(-dt*9));
  if(!s.reduced)flow+=dt*(1+uniforms.uEnergy.value*1.6);uniforms.uFlow.value=s.reduced?0:flow;uniforms.uScroll.value=scroll;uniforms.uTime.value=s.reduced?0:elapsed;uniforms.uMotion.value=s.reduced?0:1;uniforms.uFocus.value=s.focus;uniforms.uSelected.value=s.selected;uniforms.uSelect.value+=(Number(s.selected>=0)-uniforms.uSelect.value)*(s.reduced?1:1-Math.exp(-dt*16));uniforms.uColor.value.lerp(colors[s.focus],s.reduced?1:1-Math.exp(-dt*7));uniforms.uPointer.value.lerp(s.reduced?pointer.set(0,0):pointer,1-Math.exp(-dt*8));
  tails.visible=!s.reduced&&uniforms.uEnergy.value>.008;const t=performance.now();renderer.render(scene,camera);submission=performance.now()-t;frames++;samples.push(submission);if(samples.length>240)samples.shift();if(!s.reduced)frame=requestAnimationFrame(draw);
 }
 function wake(){if(disposed)return;if(state().paused||document.hidden||!visible){cancelAnimationFrame(frame);frame=0;return}if(!frame){last=performance.now()-34;frame=requestAnimationFrame(draw)}}
 function onScroll(){const now=performance.now(),y=readY();if(document.body.style.position!=='fixed'){velocity=clamp((y-lastScroll)/Math.max(16,now-scrollTime)/1.3,-1,1);lastScroll=y;scrollTime=now}wake()}
 function resize(){measure();wake()}
 function move(e:PointerEvent){if(e.pointerType!=='mouse'||state().reduced)return;pointer.set(clamp(e.clientX/width-.5,-.5,.5),0);wake()}
 function leave(){pointer.set(0,0);wake()}
 function lost(e:Event){e.preventDefault();fail()}
 const observer=new ResizeObserver(resize);observer.observe(viewport);const intersection=new IntersectionObserver(e=>{visible=e[0].isIntersecting;wake()});intersection.observe(viewport);
 window.addEventListener('scroll',onScroll,{passive:true});window.addEventListener('resize',resize);host.addEventListener('pointermove',move,{passive:true});host.addEventListener('pointerleave',leave);document.addEventListener('visibilitychange',wake);canvas.addEventListener('webglcontextlost',lost);measure();wake();
 const diagnostic=host as HTMLElement&{gravitySnapshot?:()=>unknown};diagnostic.gravitySnapshot=()=>({renderer:'WebGLRenderer',cameraType:camera.type,gpu,frames,elapsed,disposed,visible,paused:state().paused,reduced:state().reduced,focused:state().focus+1,selected:state().selected,progress:scroll/Math.max(1,total-height),scroll,energy:uniforms.uEnergy.value,drawCalls:renderer.info.render.calls,particles:geometry.getAttribute('position').count,depths:LANE_DEPTH,geometryBuilds:builds,geometries:renderer.info.memory.geometries,pixelRatio:renderer.getPixelRatio(),renderSubmissionMs:submission,submissionSamples:samples.slice()});
 return{wake,dispose(){if(disposed)return;disposed=true;cancelAnimationFrame(frame);observer.disconnect();intersection.disconnect();window.removeEventListener('scroll',onScroll);window.removeEventListener('resize',resize);host.removeEventListener('pointermove',move);host.removeEventListener('pointerleave',leave);document.removeEventListener('visibilitychange',wake);canvas.removeEventListener('webglcontextlost',lost);geometry.dispose();tailGeometry.dispose();material.dispose();tailMaterial.dispose();renderer.dispose();renderer.forceContextLoss();host.dataset.disposed='true'}};
}
export function drawLaneStill(canvas:HTMLCanvasElement,host:HTMLElement){
 const width=host.clientWidth,height=host.querySelector<HTMLElement>('.gravity-viewport')!.clientHeight,{layout,points}=createLanePoints(width,height),dpr=Math.min(devicePixelRatio,1.25);canvas.width=Math.round(width*dpr);canvas.height=Math.round(layout.total*dpr);const ctx=canvas.getContext('2d');if(!ctx)return;ctx.scale(dpr,dpr);ctx.clearRect(0,0,width,layout.total);points.sort((a,b)=>a.z-b.z).forEach((p:LanePoint)=>{ctx.fillStyle=`rgba(173,193,210,${p.alpha*(.7+(p.z+10)/35)})`;ctx.beginPath();ctx.arc(p.x,p.y,p.kind===3?2.1:p.size*.45,0,Math.PI*2);ctx.fill();if(p.kind===3){const g=ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,12);g.addColorStop(0,'#b9d5e537');g.addColorStop(1,'#b9d5e500');ctx.fillStyle=g;ctx.fillRect(p.x-12,p.y-12,24,24)}});
}
