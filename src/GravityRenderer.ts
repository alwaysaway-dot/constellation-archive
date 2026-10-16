import * as THREE from 'three';
import {DEPTHS,MOBILE_ANCHORS,DESKTOP_ANCHORS,SIGNAL_COLORS,VOYAGE_SPAN,type SceneState,type ViewMemory} from './gravity-layout';
type Options={host:HTMLElement;canvas:HTMLCanvasElement;mode:'home'|'map';state:()=>SceneState;memory:ViewMemory;fallback:()=>void};
/** Native scrolling, one perspective camera, batched geometry. No post-processing or downloaded textures. */
export function createGravity({host,canvas,mode,state,memory,fallback}:Options){
 const viewport=host.querySelector<HTMLElement>('.gravity-viewport')!;
 const renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:false,powerPreference:'low-power'});
 renderer.setClearColor(0x080b12,0);renderer.outputColorSpace=THREE.SRGBColorSpace;
 const gl=renderer.getContext(),debug=gl.getExtension('WEBGL_debug_renderer_info');
 const gpu=debug?String(gl.getParameter(debug.UNMASKED_RENDERER_WEBGL)):'unavailable';
 const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(42,1,.1,100);camera.position.z=20;
 const geometries:THREE.BufferGeometry[]=[],materials:THREE.Material[]=[];
 const labels=Array.from(host.querySelectorAll<HTMLButtonElement>('[data-signal]')),anchors:THREE.Vector3[]=[];
 const silver=new THREE.Color('#b1c6d6').convertLinearToSRGB(),warm=new THREE.Color('#c3b39e').convertLinearToSRGB(),focusColors=SIGNAL_COLORS.map(c=>new THREE.Color(c).convertLinearToSRGB());
 let width=1,height=1,mobile=false,still=false,disposed=false,visible=true,frame=0,last=0,elapsed=0,draws=0,renderTotal=0;
 let mx=memory.x,my=memory.y,cx=mx,cy=my,progress=0,lockedProgress=0,wasSelected=false,focused=0,quality=1,slow=0,measured=0;
 let drag:{x:number;y:number;mx:number;my:number}|null=null,suppress=false,seed=817;
 let dust:THREE.Points,cores:THREE.Points,coreBase:number[]=[],meteor:THREE.Line,meteorStart=0,nextMeteor=8.5;
 let metrics:{element:HTMLElement;left:number;width:number}[]=[];
 const random=()=>{seed=seed*16807%2147483647;return(seed-1)/2147483646};
 const gaussian=()=>Math.sqrt(-2*Math.log(Math.max(.0001,random())))*Math.cos(random()*Math.PI*2);
 const uniforms={uTime:{value:0},uRatio:{value:1},uFocus:{value:new THREE.Vector3()},uFocusColor:{value:silver.clone()},uFocusWeight:{value:0},uSelect:{value:0},uProgress:{value:0},uAspect:{value:1},uHome:{value:mode==='home'?1:0},uFocusUV:{value:new THREE.Vector2(.5,.5)},uMotion:{value:1}};
 const pointVertex=`attribute float aSize;attribute float aAlpha;attribute float aPhase;attribute vec3 aColor;uniform float uTime;uniform float uRatio;uniform vec3 uFocus;uniform vec3 uFocusColor;uniform float uFocusWeight;uniform float uSelect;uniform float uMotion;varying vec3 vColor;varying float vAlpha;
 void main(){vec3 p=position;float layer=clamp((p.z+14.)/20.,0.,1.);p.x+=sin(uTime*(.045+layer*.05)+aPhase)*.07*layer*uMotion;p.y+=cos(uTime*.06+aPhase)*.035*layer*uMotion;float local=exp(-dot(p.xy-uFocus.xy,p.xy-uFocus.xy)*.65)*uFocusWeight;p.xy+=(p.xy-uFocus.xy)*local*.026;vec4 mv=modelViewMatrix*vec4(p,1.);gl_Position=projectionMatrix*mv;gl_PointSize=clamp(aSize*uRatio*20./-mv.z,.65,38.);vColor=mix(aColor,uFocusColor,local*.65);vAlpha=aAlpha*(.94+.06*sin(uTime*.32+aPhase)*uMotion)*(1.-uSelect*.22+local*uSelect*.35);}`;
 const pointFragment=`varying vec3 vColor;varying float vAlpha;void main(){float r=length(gl_PointCoord-.5)*2.;if(r>1.)discard;gl_FragColor=vec4(vColor,(exp(-r*r*65.)+exp(-r*r*8.)*.19)*vAlpha);}`;
 const dustFragment=`varying vec3 vColor;varying float vAlpha;void main(){float r=length(gl_PointCoord-.5)*2.;if(r>1.)discard;gl_FragColor=vec4(vColor,pow(1.-r,1.5)*vAlpha);}`;
 function pointCloud(p:number[],sizes:number[],alpha:number[],colors:number[],core=false){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));g.setAttribute('aSize',new THREE.Float32BufferAttribute(sizes,1));g.setAttribute('aAlpha',new THREE.Float32BufferAttribute(alpha,1));g.setAttribute('aColor',new THREE.Float32BufferAttribute(colors,3));g.setAttribute('aPhase',new THREE.Float32BufferAttribute(sizes.map(()=>random()*6.28),1));const m=new THREE.ShaderMaterial({uniforms,vertexShader:pointVertex,fragmentShader:core?pointFragment:dustFragment,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending});const object=new THREE.Points(g,m);object.frustumCulled=false;scene.add(object);geometries.push(g);materials.push(m);return object}
 const lineP:number[]=[],lineC:number[]=[],lineA:number[]=[];
 function world(x:number,y:number,z:number){const vh=2*Math.tan(THREE.MathUtils.degToRad(21))*(20-z);return new THREE.Vector3((x-.5)*vh*width/height,(.5-y)*vh,z)}
 function segment(a:THREE.Vector3,b:THREE.Vector3,color:THREE.Color,alpha:number){lineP.push(...a.toArray(),...b.toArray());lineC.push(...color.toArray(),...color.toArray());lineA.push(alpha,alpha)}
 function curve(a:THREE.Vector3,b:THREE.Vector3,c:THREE.Vector3,d:THREE.Vector3,alpha:number,color=silver){const path=new THREE.CubicBezierCurve3(a,b,c,d);let prev=path.getPoint(0);for(let i=1;i<=64;i++){const p=path.getPoint(i/64);segment(prev,p,color,alpha*Math.sin(i/65*Math.PI));prev=p}return path}
 function disposeScene(){scene.clear();geometries.splice(0).forEach(g=>g.dispose());materials.splice(0).forEach(m=>m.dispose());anchors.length=0;lineP.length=0;lineC.length=0;lineA.length=0}
 function fog(){
  const g=new THREE.PlaneGeometry(2,2),m=new THREE.ShaderMaterial({uniforms,vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,.99,1.);}',fragmentShader:`precision mediump float;varying vec2 vUv;uniform float uHome;uniform float uProgress;uniform float uAspect;uniform float uTime;uniform float uMotion;uniform vec2 uFocusUV;uniform vec3 uFocusColor;uniform float uFocusWeight;
  float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+1.),f.x),f.y);}
  void main(){vec2 uv=vec2(vUv.x,1.-vUv.y);vec2 field=vec2(uv.x,uv.y+uProgress*2.35);float flow=uTime*.006*uMotion;float n=noise(field*vec2(8.,5.)+flow)*.6+noise(field*vec2(23.,17.)-flow)*.28+noise(field*vec2(57.,31.))*.12;float route=.5+.19*sin(field.y*4.4);float lane=exp(-pow((uv.x-route)*5.,2.));float home=exp(-pow((uv.x-.76)*3.7,2.)-pow((uv.y-(.72-.24*(uv.x-.7)))*6.,2.));float band=mix(lane,home,uHome);float cloud=smoothstep(.28,.82,n)*band;float local=exp(-dot((uv-uFocusUV)*vec2(uAspect,1.),(uv-uFocusUV)*vec2(uAspect,1.))*38.)*uFocusWeight;vec3 col=mix(vec3(.20,.29,.39),uFocusColor,local*.6);float alpha=cloud*.25+local*noise(field*14.)*.07;alpha*=smoothstep(0.,.12,uv.y)*smoothstep(0.,.12,1.-uv.y);gl_FragColor=vec4(col,alpha);}`,
  transparent:true,depthTest:false,depthWrite:false});const plane=new THREE.Mesh(g,m);plane.frustumCulled=false;plane.renderOrder=-10;scene.add(plane);geometries.push(g);materials.push(m);
 }
 function build(){
  disposeScene();seed=817;metrics=labels.map(button=>{const element=button.querySelector<HTMLElement>('.gravity-label')!;return{element,left:element.offsetLeft,width:element.offsetWidth}});
  const coords=mobile?MOBILE_ANCHORS:DESKTOP_ANCHORS,span=mode==='map'&&!still?VOYAGE_SPAN:1;
  const dp:number[]=[],ds:number[]=[],da:number[]=[],dc:number[]=[];
  const put=(p:THREE.Vector3,size:number,alpha:number,color=silver)=>{dp.push(...p.toArray());ds.push(size);da.push(alpha);dc.push(...color.toArray())};
  const background=mobile?660:1350;
  for(let i=0;i<background;i++){const layer=i%3,z=[-12,-5,3.5][layer]+random()*1.5;let x=random()*1.25-.125,y=random()*span*1.1-.05;
   if(mode==='home'&&x<.57&&y<.5&&random()<.83)continue;
   put(world(x,y,z),(.8+random()*2)*(layer===2?1.25:1),.11+random()*(layer===0?.25:.46));
  }
  const cp:number[]=[],cs:number[]=[],ca:number[]=[],cc:number[]=[];
  if(mode==='home'){
   const path=curve(world(-.12,.96,-1),world(.24,.69,1),world(.67,.89,-2),world(1.03,.42,-1),.26,warm);
   curve(world(.03,.87,-2),world(.38,.44,-3),world(.80,.73,-4),world(1.09,.41,-2),.13);
   const amount=mobile?1900:3700;
   for(let i=0;i<amount;i++){
    const t=clamp(.64+gaussian()*.17,.04,1),p=path.getPoint(t),breadth=.05+Math.exp(-(((t-.7)*5)**2))*.55;
    p.x+=gaussian()*breadth;p.y+=gaussian()*breadth*.48;p.z+=gaussian()*1.1;
    put(p,1+random()*2.5,.20+random()*.52,random()>.92?warm:silver);
   }
   [.42,.61,.78,.89].forEach((t,i)=>{const p=path.getPoint(t);anchors.push(p);cp.push(...p.toArray());cs.push(i===2?28:17);ca.push(.65);cc.push(...silver.toArray())});
  }else{
   coords.forEach(([x,y],i)=>{const p=world(x,y*span,DEPTHS[i]);anchors.push(p);cp.push(...p.toArray());cs.push(25);ca.push(.87);cc.push(...silver.toArray());
    const tail=curve(p.clone().add(new THREE.Vector3(-.55,-1.05,-1.1)),p.clone().add(new THREE.Vector3(.05,-.7,-.7)),p.clone().add(new THREE.Vector3(-.12,-.17,.1)),p,.24);
    for(let j=0;j<(mobile?65:110);j++){const v=tail.getPoint(random());v.x+=gaussian()*.14;v.y+=gaussian()*.12;v.z+=gaussian()*.3;put(v,.8+random()*1.8,.15+random()*.3)}
   });
   const navigation=new THREE.CatmullRomCurve3(anchors.map(p=>p.clone().add(new THREE.Vector3(-.22,.22,-.7))));
   let prev=navigation.getPoint(0);for(let i=1;i<=240;i++){const p=navigation.getPoint(i/240);segment(prev,p,silver,.13);prev=p}
   for(let i=0;i<(mobile?1500:3200);i++){const t=random(),p=navigation.getPoint(t),spread=.12+(.5+.5*Math.sin(t*29))*.55;p.x+=gaussian()*spread;p.y+=gaussian()*.24;p.z+=gaussian()*2.1;put(p,.8+random()*2.3,.13+random()*.38)}
   // Two quiet subsidiary trails, not a relationship grid.
   for(const i of [1,6]){const a=anchors[i],b=anchors[i+1];curve(a,a.clone().lerp(b,.2).add(new THREE.Vector3(-1.3,0,-2)),a.clone().lerp(b,.8).add(new THREE.Vector3(-.8,0,-1)),b,.065)}
  }
  fog();dust=pointCloud(dp,ds,da,dc);cores=pointCloud(cp,cs,ca,cc,true);coreBase=cs;
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(lineP,3));g.setAttribute('aColor',new THREE.Float32BufferAttribute(lineC,3));g.setAttribute('aAlpha',new THREE.Float32BufferAttribute(lineA,1));
  const m=new THREE.ShaderMaterial({uniforms,vertexShader:`attribute vec3 aColor;attribute float aAlpha;uniform vec3 uFocus;uniform vec3 uFocusColor;uniform float uFocusWeight;uniform float uSelect;varying vec3 vColor;varying float vAlpha;void main(){vec3 p=position;float local=exp(-dot(p.xy-uFocus.xy,p.xy-uFocus.xy)*.7)*uFocusWeight;p.x+=sin((p.y-uFocus.y)*2.)*local*.06;vColor=mix(aColor,uFocusColor,local*.7);vAlpha=aAlpha*(1.+local*.6)*(1.-uSelect*.15);gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);}`,fragmentShader:'varying vec3 vColor;varying float vAlpha;void main(){gl_FragColor=vec4(vColor,vAlpha);}',transparent:true,depthWrite:false,blending:THREE.AdditiveBlending});scene.add(new THREE.LineSegments(g,m));geometries.push(g);materials.push(m);
  const mg=new THREE.BufferGeometry(),mp:number[]=[],ma:number[]=[];for(let i=0;i<24;i++){mp.push(i/23*1.7,i/23*.42,0);ma.push((i/23)**2)}mg.setAttribute('position',new THREE.Float32BufferAttribute(mp,3));mg.setAttribute('aAlpha',new THREE.Float32BufferAttribute(ma,1));
  const mm=new THREE.ShaderMaterial({uniforms:{uAlpha:{value:0}},vertexShader:'attribute float aAlpha;varying float vAlpha;void main(){vAlpha=aAlpha;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:'uniform float uAlpha;varying float vAlpha;void main(){gl_FragColor=vec4(.64,.76,.84,vAlpha*uAlpha);}',transparent:true,depthWrite:false,blending:THREE.AdditiveBlending});meteor=new THREE.Line(mg,mm);meteor.visible=false;scene.add(meteor);geometries.push(mg);materials.push(mm);
 }
 const clamp=(v:number,min=0,max=1)=>Math.max(min,Math.min(max,v));
 const logicalScroll=()=>document.body.style.position==='fixed'?-(parseFloat(document.body.style.top)||0):window.scrollY;
 const readProgress=()=>{if(mode!=='map'||still)return 0;const top=host.getBoundingClientRect().top;return clamp(-top/Math.max(1,host.clientHeight-height))};
 function scroll(){if(state().paused)return;progress=readProgress();wake()}
 const projected=new THREE.Vector3(),focusUV=new THREE.Vector3();
 const diagnostic=host as HTMLElement&{gravitySnapshot?:()=>unknown};
 diagnostic.gravitySnapshot=()=>({mode,renderer:'WebGLRenderer',gpu,canvasSize:[canvas.width,canvas.height],cameraType:camera.type,camera:camera.position.toArray(),depths:anchors.map(a=>a.z),projected:anchors.map(a=>{const v=a.clone().project(camera);return[v.x,v.y]}),frames:draws,elapsed,drawCalls:renderer.info.render.calls,particles:dust?.geometry.getAttribute('position').count,renderSubmissionMeanMs:draws?renderTotal/draws:0,quality,pixelRatio:renderer.getPixelRatio(),disposed,visible,paused:state().paused,reduced:still,progress,focused:mode==='map'?focused+1:null,meteorVisible:meteor?.visible,geometries:renderer.info.memory.geometries,programs:renderer.info.programs?.length});
 function draw(now:number){
  frame=0;if(disposed||!visible||document.hidden||state().paused)return;
  const s=state(),interval=mobile?33.33:16.66;if(!s.reduced&&now-last<interval-1){frame=requestAnimationFrame(draw);return}
  const dt=Math.min((now-last)/1000,.06);last=now;if(!s.reduced)elapsed+=dt;
  const start=performance.now();progress=readProgress();
  if(s.selected&&!wasSelected)lockedProgress=progress;wasSelected=!!s.selected;
  const travel=s.selected?lockedProgress:progress;
  cx+=(mx-cx)*(1-Math.exp(-dt*12));cy+=(my-cy)*(1-Math.exp(-dt*12));
  const flight=mode==='home'&&s.advance&&!s.reduced,flightPoint=world(mobile?.67:.77,.67,0);
  camera.position.x+=( (s.reduced?0:flight?flightPoint.x*.72:cx)-camera.position.x)*(flight?.15:1);
  const baseVH=2*Math.tan(THREE.MathUtils.degToRad(21))*20;
  camera.position.y=mode==='map'&&!still?-travel*baseVH*2.35+cy:s.reduced?0:camera.position.y+((flight?flightPoint.y*.7:cy)-camera.position.y)*.15;
  camera.position.z+=((flight?14.8:s.selected&&!s.reduced?20.25:20)-camera.position.z)*.14;camera.updateMatrixWorld();
  uniforms.uTime.value=s.reduced?0:elapsed;uniforms.uMotion.value=s.reduced?0:1;uniforms.uProgress.value=travel;uniforms.uSelect.value+=( (s.selected&&!s.reduced?1:0)-uniforms.uSelect.value)*.2;
  let nearest=0,best=Infinity;const projections:THREE.Vector3[]=[];
  for(let i=0;i<anchors.length;i++){const v=anchors[i].clone().project(camera);projections.push(v);const d=Math.abs(v.y-.1);if(d<best){best=d;nearest=i}}
  const hover=s.hover&&projections[s.hover-1]?.y<.85&&projections[s.hover-1]?.y>-.75?s.hover:null;
  focused=mode==='map'?(s.selected?s.selected-1:hover?hover-1:nearest):2;
  const near=mode==='map'&&anchors[focused];if(near){uniforms.uFocus.value.copy(near);uniforms.uFocusColor.value.lerp(focusColors[focused],s.reduced?1:.13);focusUV.copy(near).project(camera);uniforms.uFocusUV.value.set(focusUV.x*.5+.5,-focusUV.y*.5+.5)}
  uniforms.uFocusWeight.value+=( (near?1:0)-uniforms.uFocusWeight.value)*(s.reduced?1:.12);
  const sizes=cores.geometry.getAttribute('aSize') as THREE.BufferAttribute;
  for(let i=0;i<anchors.length;i++){
   sizes.setX(i,coreBase[i]*(s.selected===i+1?1.35:mode==='map'&&focused===i?1.16:s.playing&&i+1===s.playingId?1.06:1));
   if(mode!=='map'||!labels[i])continue;
   projected.copy(projections[i]);const px=(projected.x*.5+.5)*width,py=(-projected.y*.5+.5)*height;
   labels[i].style.setProperty('--node-x',`${px}px`);labels[i].style.setProperty('--node-y',`${py}px`);
   const distance=Math.abs(py-height*.44)/height,opacity=still?1:clamp(1-distance*.68,.42,1);
   labels[i].style.setProperty('--node-opacity',String(opacity));labels[i].dataset.focused=String(i===focused);
   labels[i].style.pointerEvents=py<16||py>height-32?'none':'';
   const metric=metrics[i],textLeft=px-24+metric.left;metric.element.style.setProperty('--label-shift',`${Math.max(10-textLeft,Math.min(0,width-10-textLeft-metric.width))}px`);
  }
  sizes.needsUpdate=true;
  if(!s.reduced&&elapsed>nextMeteor){meteorStart=elapsed;nextMeteor=elapsed+13+random()*14;meteor.position.copy(world(.86,.12+(mode==='map'?travel*2.35:0),-2))}
  const age=elapsed-meteorStart;meteor.visible=!s.reduced&&meteorStart>0&&age<1.4;
  if(meteor.visible){meteor.position.x-=dt*3.8;meteor.position.y-=dt*.94;(meteor.material as THREE.ShaderMaterial).uniforms.uAlpha.value=Math.sin(age/1.4*Math.PI)*.22}
  renderer.render(scene,camera);draws++;renderTotal+=performance.now()-start;
  if(!s.reduced&&++measured>120){if(dt>.045)slow++;if(measured>240&&slow>75&&quality===1){quality=.75;renderer.setPixelRatio(Math.min(devicePixelRatio,mobile?1.2:1.5)*quality);uniforms.uRatio.value=renderer.getPixelRatio();dust.geometry.setDrawRange(0,Math.floor(dust.geometry.getAttribute('position').count*.72));host.dataset.quality='economy'}}
  host.dataset.focused=String(focused+1);if(draws%15===0||s.reduced){host.dataset.camera=camera.position.toArray().map(v=>v.toFixed(3)).join(',');host.dataset.frames=String(draws);host.dataset.progress=travel.toFixed(3)}
  if(!s.reduced)frame=requestAnimationFrame(draw);
 }
 function wake(){if(frame)cancelAnimationFrame(frame);frame=0;if(!disposed&&visible&&!document.hidden&&!state().paused){if(still!==state().reduced){resize();return}last=performance.now()-34;frame=requestAnimationFrame(draw)}}
 function resize(){const r=viewport.getBoundingClientRect();width=Math.max(1,r.width);height=Math.max(1,r.height);mobile=matchMedia('(max-width:700px)').matches;still=state().reduced;camera.aspect=width/height;camera.updateProjectionMatrix();renderer.setPixelRatio(Math.min(devicePixelRatio,mobile?1.2:1.5)*quality);renderer.setSize(width,height,false);uniforms.uRatio.value=renderer.getPixelRatio();uniforms.uAspect.value=width/height;build();host.dataset.renderer='webgl';progress=readProgress();wake()}
 function move(e:PointerEvent){if(state().reduced||state().selected)return;if(drag){const dx=e.clientX-drag.x,dy=e.clientY-drag.y;if(Math.abs(dx)>9||Math.abs(dy)>9)suppress=true;mx=clamp(drag.mx-dx/width*2,mobile?-.18:-.85,mobile?.18:.85);my=clamp(drag.my+dy/height,-.18,.18);memory.x=mx;memory.y=my}else if(e.pointerType==='mouse'){const r=viewport.getBoundingClientRect();mx=((e.clientX-r.left)/width-.5)*(mode==='home'?.75:.25);my=-((e.clientY-r.top)/height-.5)*.2}}
 function down(e:PointerEvent){if(mode!=='map'||state().reduced||!(e.target as HTMLElement).closest('[data-orbit-handle]'))return;drag={x:e.clientX,y:e.clientY,mx,my};suppress=false;(e.target as HTMLElement).setPointerCapture(e.pointerId)}
 function up(){if(drag){drag=null;setTimeout(()=>{suppress=false},0)}}
 function click(e:MouseEvent){if(suppress){e.preventDefault();e.stopPropagation()}}
 function key(e:KeyboardEvent){if(!(e.target as HTMLElement).closest('[data-orbit-handle]'))return;const dir=e.key==='ArrowLeft'?-1:e.key==='ArrowRight'?1:0;if(dir){e.preventDefault();mx=clamp(mx+dir*.15,mobile?-.18:-.85,mobile?.18:.85);memory.x=mx;wake()}if(e.key==='Home'){mx=0;my=0;memory.x=0;memory.y=0;wake()}}
 function focus(index:number){if(mode!=='map'||still||!anchors[index])return;const v=anchors[index].clone().project(camera),py=(-v.y*.5+.5)*height,screenY=viewport.getBoundingClientRect().top+py;if(screenY>80&&screenY<innerHeight-170)return;const target=clamp(((mobile?MOBILE_ANCHORS:DESKTOP_ANCHORS)[index][1]*VOYAGE_SPAN-.4)*(20-DEPTHS[index])/20/2.35);const top=host.getBoundingClientRect().top+logicalScroll();window.scrollTo({top:top+target*(host.clientHeight-height),behavior:'instant'});progress=readProgress();wake()}
 function lost(e:Event){e.preventDefault();cancelAnimationFrame(frame);host.dataset.renderer='fallback';fallback()}
 const observer=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;wake()},{rootMargin:'60px'});observer.observe(viewport);
 const sizeObserver=new ResizeObserver(resize);sizeObserver.observe(viewport);
 const pointerSurface=mode==='home'?(host.parentElement??host):host;pointerSurface.addEventListener('pointermove',move,{passive:true});host.addEventListener('pointerdown',down);host.addEventListener('pointerup',up);host.addEventListener('pointercancel',up);host.addEventListener('click',click,true);host.addEventListener('keydown',key);window.addEventListener('scroll',scroll,{passive:true});document.addEventListener('visibilitychange',wake);canvas.addEventListener('webglcontextlost',lost);
 resize();return {wake,focus,dispose(){disposed=true;cancelAnimationFrame(frame);observer.disconnect();sizeObserver.disconnect();pointerSurface.removeEventListener('pointermove',move);host.removeEventListener('pointerdown',down);host.removeEventListener('pointerup',up);host.removeEventListener('pointercancel',up);host.removeEventListener('click',click,true);host.removeEventListener('keydown',key);window.removeEventListener('scroll',scroll);document.removeEventListener('visibilitychange',wake);canvas.removeEventListener('webglcontextlost',lost);labels.forEach(label=>{label.style.removeProperty('pointer-events');label.style.removeProperty('--node-opacity');label.style.removeProperty('--node-x');label.style.removeProperty('--node-y');delete label.dataset.focused});disposeScene();renderer.dispose();renderer.forceContextLoss();host.dataset.disposed='true'}};
}
