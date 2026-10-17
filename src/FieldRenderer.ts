import * as THREE from 'three';
import {fieldPoint} from './field-shape';
export type FieldState={progress:number;reduced:boolean;paused:boolean};
export function createField(canvas:HTMLCanvasElement,host:HTMLElement,state:()=>FieldState,onFallback:()=>void){
 const renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:true,powerPreference:'low-power'});renderer.setClearColor(0x000000,0);renderer.outputColorSpace=THREE.SRGBColorSpace;
 const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(40,1,.1,80);camera.position.z=15;
 const groups=[new THREE.Group(),new THREE.Group()];groups.forEach(g=>scene.add(g));
 const resources:(THREE.BufferGeometry|THREE.Material)[]=[];let width=1,height=1,mobile=false,raf=0,disposed=false,visible=true,time=0,last=0,frames=0,drawCalls=0;
 const pointer=new THREE.Vector2(-10,-10),target=new THREE.Vector2(-10,-10);
 const uniforms={uTime:{value:0},uMotion:{value:1},uPointer:{value:pointer},uTouch:{value:0}};
 const vertex=`attribute vec2 aField;uniform float uTime;uniform float uMotion;uniform vec2 uPointer;uniform float uTouch;varying vec2 vField;varying float vLight;varying float vResponse;void main(){vField=aField;vec3 p=position;vec4 initial=projectionMatrix*modelViewMatrix*vec4(p,1.);vec2 screen=initial.xy/initial.w;float local=exp(-dot(screen-uPointer,screen-uPointer)*25.);float bend=sin(aField.x*7.+uTime*.18)*sin(aField.y*3.14159)*.025*uMotion;p+=normal*(bend+local*.035*uMotion);gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);vLight=.28+.72*abs(dot(normalize(normalMatrix*normal),normalize(vec3(-.4,.7,1.))));vResponse=local*.12*uMotion;}`;
 const lineVertex=vertex.replace('varying vec2 vField;','attribute float aStrength;varying float vStrength;varying vec2 vField;').replace('vField=aField;','vField=aField;vStrength=aStrength;').replace('vLight=.28', 'gl_Position.z-=.00002*gl_Position.w;vLight=.28');
 const lineFragment=`uniform float uTime;uniform float uMotion;varying float vStrength;varying vec2 vField;varying float vLight;varying float vResponse;void main(){float cycle=mod(uTime,13.);float traveling=clamp((cycle-10.)/1.1,0.,1.);float signal=exp(-pow((vField.x-traveling)*22.,2.))*step(10.,cycle)*(1.-step(11.1,cycle))*pow(max(0.,cos(vField.y*11.)),8.)*.22*uMotion;float fade=.38+.62*sin(vField.x*3.14159);vec3 silver=mix(vec3(.43,.47,.50),vec3(.64,.72,.78),vLight);gl_FragColor=vec4(silver,clamp(vStrength*fade*(.55+.45*vLight)+signal+vResponse*vStrength,0.,.78));}`;
 function clear(){groups.forEach(g=>g.clear());resources.splice(0).forEach(r=>r.dispose())}
 function build(){clear();const segments=180,across=mobile?34:66,halfH=Math.tan(20*Math.PI/180)*15;
  for(let kind=0;kind<2;kind++){const positions:number[]=[],uv:number[]=[],indices:number[]=[];
   for(let j=0;j<=across;j++)for(let i=0;i<=segments;i++){const u=i/segments,v=j/across,[x,y,z]=fieldPoint(kind,u,v,mobile),scale=(15-z)/15;positions.push((x-.5)*halfH*2*camera.aspect*scale,(.5-y)*halfH*2*scale,z);uv.push(u,v);if(j<across&&i<segments){const a=j*(segments+1)+i,b=a+segments+1;indices.push(a,b,a+1,a+1,b,b+1)}}
   const geom=new THREE.BufferGeometry();geom.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geom.setAttribute('aField',new THREE.Float32BufferAttribute(uv,2));geom.setIndex(indices);geom.computeVertexNormals();
   const mat=new THREE.ShaderMaterial({uniforms,vertexShader:vertex,fragmentShader:'varying float vLight;void main(){gl_FragColor=vec4(vec3(.004,.006,.008)+vec3(.008,.010,.012)*vLight,1.);}',side:THREE.DoubleSide,polygonOffset:true,polygonOffsetFactor:1,polygonOffsetUnits:1});groups[kind].add(new THREE.Mesh(geom,mat));resources.push(geom,mat);
   const lp:number[]=[],ln:number[]=[],lu:number[]=[],strength:number[]=[];const normals=geom.getAttribute('normal');const count=mobile?35:67;
   function point(u:number,v:number){const [x,y,z]=fieldPoint(kind,u,v,mobile),scale=(15-z)/15;const ni=Math.round(v*across)*(segments+1)+Math.round(u*segments);return{p:[(x-.5)*halfH*2*camera.aspect*scale,(.5-y)*halfH*2*scale,z],n:[normals.getX(ni),normals.getY(ni),normals.getZ(ni)]}}
   for(let j=0;j<count;j++){const v=j/(count-1);const major=j===0||j===count-1||j===Math.round(count*.6);for(let i=0;i<segments;i++)for(const k of [i,i+1]){const u=k/segments,o=point(u,v);lp.push(...o.p);ln.push(...o.n);lu.push(u,v);strength.push(major?.90:(.34+.12*Math.sin(j*1.7))*(kind===1?.84:1));}}
   const lines=new THREE.BufferGeometry();lines.setAttribute('position',new THREE.Float32BufferAttribute(lp,3));lines.setAttribute('normal',new THREE.Float32BufferAttribute(ln,3));lines.setAttribute('aField',new THREE.Float32BufferAttribute(lu,2));lines.setAttribute('aStrength',new THREE.Float32BufferAttribute(strength,1));const lm=new THREE.ShaderMaterial({uniforms,vertexShader:lineVertex,fragmentShader:lineFragment,transparent:true,depthWrite:false,depthTest:true});const line=new THREE.LineSegments(lines,lm);line.frustumCulled=false;groups[kind].add(line);resources.push(lines,lm);
  }
 }
 function paint(now:number){raf=0;if(disposed||document.hidden||!visible||state().paused)return;const s=state(),dt=Math.max(0,Math.min(.05,(now-last)/1000||0));last=now;if(!s.reduced)time+=dt;uniforms.uTime.value=time;uniforms.uMotion.value=s.reduced?0:1;pointer.lerp(target,Math.min(1,dt*10));const p=s.progress,wide=Math.tan(20*Math.PI/180)*15*camera.aspect*2;
  groups[0].position.set(-p*wide*.92,-p*1.5,p*2);groups[0].rotation.y=-p*.23;groups[1].position.set(p*wide*.73,p*.3,-p*3);groups[1].rotation.y=p*.15;
  renderer.render(scene,camera);frames++;drawCalls=renderer.info.render.calls;host.dataset.renderer='webgl';
  if(!s.reduced&&p<1)raf=requestAnimationFrame(paint);
 }
 function wake(){cancelAnimationFrame(raf);raf=0;last=performance.now();if(!document.hidden&&!disposed&&visible&&!state().paused)raf=requestAnimationFrame(paint)}
 function resize(){const r=host.getBoundingClientRect();width=Math.max(1,r.width);height=Math.max(1,r.height);mobile=width<701;camera.aspect=width/height;camera.updateProjectionMatrix();renderer.setPixelRatio(Math.min(devicePixelRatio,mobile?1.35:1.7));renderer.setSize(width,height,false);build();wake()}
 function move(e:PointerEvent){if(e.pointerType!=='mouse'||state().reduced)return;const r=host.getBoundingClientRect();target.set((e.clientX-r.left)/width*2-1,1-(e.clientY-r.top)/height*2);wake()}
 function leave(){target.set(-10,-10);wake()}
 function loss(e:Event){e.preventDefault();onFallback()}
 const observer=new IntersectionObserver(e=>{visible=e[0].isIntersecting;wake()});observer.observe(host);const size=new ResizeObserver(resize);size.observe(host);host.addEventListener('pointermove',move,{passive:true});host.addEventListener('pointerleave',leave);document.addEventListener('visibilitychange',wake);canvas.addEventListener('webglcontextlost',loss);
 const debug=renderer.getContext().getExtension('WEBGL_debug_renderer_info');
 (host as HTMLElement&{fieldSnapshot?:()=>unknown}).fieldSnapshot=()=>({renderer:'WebGLRenderer',frames,elapsed:time,signalActive:time%13>=10&&time%13<11.1,pointer: pointer.toArray(),drawCalls,progress:state().progress,depths:[groups[0].position.z,groups[1].position.z],lineCount:mobile?70:134,pixelRatio:renderer.getPixelRatio(),gpu:debug?renderer.getContext().getParameter(debug.UNMASKED_RENDERER_WEBGL):'unavailable'});
 resize();return{wake,dispose(){disposed=true;cancelAnimationFrame(raf);observer.disconnect();size.disconnect();host.removeEventListener('pointermove',move);host.removeEventListener('pointerleave',leave);document.removeEventListener('visibilitychange',wake);canvas.removeEventListener('webglcontextlost',loss);clear();renderer.dispose();renderer.forceContextLoss();delete(host as HTMLElement&{fieldSnapshot?:()=>unknown}).fieldSnapshot;}};
}
