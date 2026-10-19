import {useEffect,useRef,useState,type ReactNode} from 'react';
import type {MobiusState} from './MobiusRenderer';
import {RISE,readJourney,type RiverHost} from './river-handoff';
export function mapStart(){const map=document.querySelector('.confluence-map .gravity-map');return map?map.getBoundingClientRect().top+window.scrollY:0}
export function MobiusJourney({reduced,paused,renderMap,onPhase}:{reduced:boolean;paused:boolean;renderMap:(paused:boolean)=>ReactNode;onPhase:(atMap:boolean)=>void}){
 const root=useRef<HTMLElement>(null),surface=useRef<HTMLDivElement>(null),canvas=useRef<HTMLCanvasElement>(null),still=useRef<HTMLCanvasElement>(null),runtime=useRef<{wake:()=>void;dispose:()=>void}|null>(null);
 const [fallback,setFallback]=useState(false),[mapActive,setMapActive]=useState(false),[arrived,setArrived]=useState(false);
 const state=useRef<MobiusState>({progress:0,reduced,paused,velocity:0,velocityAt:0}),phase=useRef(onPhase);phase.current=onPhase;state.current.reduced=reduced;state.current.paused=paused||state.current.progress>=1;
 useEffect(()=>{let live=true;const fail=()=>{if(!live)return;setFallback(true);runtime.current?.dispose();runtime.current=null};import('./MobiusRenderer').then(({createMobius})=>{if(!live)return;try{runtime.current=createMobius(canvas.current!,surface.current!,()=>state.current,fail)}catch{fail()}}).catch(fail);return()=>{live=false;runtime.current?.dispose();runtime.current=null}},[]);
 // Draw after React commits the visible fallback canvas, including on WebKit.
 useEffect(()=>{if(!fallback)return;let live=true,observer:ResizeObserver|undefined,cleanup:(()=>void)|undefined;import('./MobiusRenderer').then(({drawMobiusStill})=>{if(!live)return;let raf=0;const draw=()=>{raf=0;if(still.current&&surface.current)drawMobiusStill(still.current,readJourney(surface.current).progress,state.current.reduced)};const request=()=>{if(!raf)raf=requestAnimationFrame(draw)};draw();observer=new ResizeObserver(request);observer.observe(still.current!);window.addEventListener('scroll',request,{passive:true});cleanup=()=>{cancelAnimationFrame(raf);window.removeEventListener('scroll',request)}});return()=>{live=false;observer?.disconnect();cleanup?.()}},[fallback]);
 useEffect(()=>{runtime.current?.wake()},[reduced,paused]);
 useEffect(()=>{let raf=0,span=1,origin=0,lastY=scrollY,lastAt=performance.now(),lastP=-1;const el=root.current!,map=el.querySelector<HTMLElement>('.confluence-map')!;
 const measure=()=>{origin=el.getBoundingClientRect().top+scrollY;span=Math.max(1,mapStart()-origin)};
 const draw=()=>{raf=0;const y=document.body.style.position==='fixed'?-(parseFloat(document.body.style.top)||0):scrollY,local=Math.max(0,y-origin),raw=Math.max(0,Math.min(1,local/span)),p=raw>=.995?1:raw;state.current.progress=p;state.current.paused=paused||p>=1;
 (el as RiverHost).riverState={progress:p,span,origin};
 if(p!==lastP){el.style.setProperty('--source-rise',`${-RISE*100}svh`);el.style.setProperty('--passage',String(p));el.style.setProperty('--lift',`${-Math.max(0,span-local)}px`);el.style.setProperty('--reveal',String(Math.min(1,Math.max(0,(p-.43)/.50))));el.style.setProperty('--copy-alpha',String(Math.max(0,1-p*2.2)));el.dataset.progress=p.toFixed(4);map.dataset.access=p===1?'open':'locked';setMapActive(p>.36);setArrived(p===1);phase.current(p===1);lastP=p}runtime.current?.wake()};
 const request=()=>{const now=performance.now(),y=scrollY;if(document.body.style.position!=='fixed'){state.current.velocity=Math.max(-5,Math.min(5,(y-lastY)/Math.max(.016,(now-lastAt)/1000)/innerHeight));state.current.velocityAt=now;lastY=y;lastAt=now}if(!raf)raf=requestAnimationFrame(draw)};
 const resize=()=>{measure();lastP=-1;request()};measure();request();window.addEventListener('scroll',request,{passive:true});window.addEventListener('resize',resize);return()=>{cancelAnimationFrame(raf);window.removeEventListener('scroll',request);window.removeEventListener('resize',resize)}},[reduced,paused]);
 return <section className={`confluence-journey mobius-journey river-journey ring-entry ${reduced?'is-reduced':''}`} ref={root} aria-label="莫比乌斯星系与星图">
 <div className="confluence-front" aria-hidden={arrived} inert={arrived}>
 <div ref={surface} className="field-surface mobius-surface" data-fallback={fallback}><canvas ref={canvas} aria-hidden="true"/><canvas ref={still} className="mobius-static" aria-hidden="true"/></div>
 <div className="confluence-copy"><h1>星图档案馆<small>Constellation Archive</small></h1></div>

 {fallback&&<span className="field-fallback-note">静态星系</span>}
 </div>
 <div className="confluence-map" aria-hidden={!arrived} inert={!arrived}>{renderMap(paused||!mapActive)}<span className="sr-only">星图档案，十首精选作品</span></div>
 </section>;
}
