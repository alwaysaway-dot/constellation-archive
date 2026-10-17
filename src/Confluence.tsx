import {useEffect,useRef,useState,type ReactNode} from 'react';
import {fieldPaths,fieldPoint} from './field-shape';
import type {FieldState} from './FieldRenderer';
import {Icon} from './Icons';
const paths=[fieldPaths(false),fieldPaths(true)];
function edge(kind:number,phone:boolean){const coords=[...Array.from({length:145},(_,i)=>fieldPoint(kind,i/144,0,phone)),...Array.from({length:145},(_,i)=>fieldPoint(kind,1-i/144,1,phone))];return coords.map((p,i)=>`${i?'L':'M'}${p[0]*1000},${p[1]*1000}`).join('')+'Z'}
export function mapStart(){const map=document.querySelector('.confluence-map .gravity-map');return map?map.getBoundingClientRect().top+window.scrollY:0}
export function Confluence({reduced,paused,renderMap,onPhase}:{reduced:boolean;paused:boolean;renderMap:(paused:boolean)=>ReactNode;onPhase:(atMap:boolean)=>void}){
 const root=useRef<HTMLElement>(null),surface=useRef<HTMLDivElement>(null),canvas=useRef<HTMLCanvasElement>(null),runtime=useRef<{wake:()=>void;dispose:()=>void}|null>(null);
 const [fallback,setFallback]=useState(false),[mapActive,setMapActive]=useState(false),[arrived,setArrived]=useState(false);
 const progress=useRef(0),state=useRef<FieldState>({progress:0,reduced,paused}),phase=useRef(onPhase);phase.current=onPhase;state.current={progress:progress.current,reduced,paused:paused||progress.current>=1};
 useEffect(()=>{let live=true;const fail=()=>{if(!live)return;setFallback(true);runtime.current?.dispose();runtime.current=null};import('./FieldRenderer').then(({createField})=>{if(!live)return;try{runtime.current=createField(canvas.current!,surface.current!,()=>state.current,fail)}catch{fail()}}).catch(fail);return()=>{live=false;runtime.current?.dispose();runtime.current=null}},[]);
 useEffect(()=>{runtime.current?.wake()},[reduced,paused]);
 useEffect(()=>{let raf=0;const el=root.current!;const draw=()=>{raf=0;const map=el.querySelector<HTMLElement>('.confluence-map')!,start=mapStart(),local=Math.max(0,-el.getBoundingClientRect().top),span=Math.max(1,start-(el.getBoundingClientRect().top+scrollY));const raw=Math.max(0,Math.min(1,local/span)),p=raw>=.995?1:raw;progress.current=p;state.current={progress:p,reduced,paused:paused||p>=1};el.style.setProperty('--passage',String(p));el.style.setProperty('--lift',`${-Math.max(0,span-local)}px`);el.style.setProperty('--reveal',String(Math.min(1,Math.max(0,(p-.12)/.65))));el.style.setProperty('--copy-alpha',String(Math.max(0,1-p*2.4)));el.dataset.progress=p.toFixed(4);map.dataset.access=p>=.995?'open':'locked';const entry=el.querySelector<HTMLElement>('.confluence-entry')!;entry.inert=p>.85;entry.setAttribute('aria-hidden',String(p>.85));setMapActive(p>.12);setArrived(p>=.995);phase.current(p>=.995);runtime.current?.wake()};const request=()=>{if(!raf)raf=requestAnimationFrame(draw)};window.addEventListener('scroll',request,{passive:true});window.addEventListener('resize',request);request();return()=>{cancelAnimationFrame(raf);window.removeEventListener('scroll',request);window.removeEventListener('resize',request)}},[reduced,paused]);
 return <section className={`confluence-journey ${reduced?'is-reduced':''}`} ref={root} aria-label="声场交汇与星图">
 <div className="confluence-front" aria-hidden={arrived} inert={arrived}>
 <div ref={surface} className="field-surface" data-fallback={fallback}><canvas ref={canvas} aria-hidden="true"/>
 <div className="field-static" aria-hidden="true">{[false,true].map((phone,i)=><svg key={i} className={phone?'field-phone':'field-desktop'} viewBox="0 0 1000 1000" preserveAspectRatio="none">{[0,1].map(kind=><g key={kind} className={`field-sheet-${kind}`}><path d={edge(kind,phone)} fill="#06080a" stroke="none"/>{paths[i][kind].map((d,j)=><path key={j} d={d} fill="none" stroke={j===0?'#b5bec4':'#697681'} strokeWidth={j===0?1.1:.65} opacity={j===0?.65:.45} vectorEffect="non-scaling-stroke"/>)}</g>)}</svg>)}</div>
 </div>
 <div className="confluence-copy"><h1>在意图与偶然之间<br/><em>让想象成为声音</em></h1></div>
 <div className="confluence-entry"><button onClick={()=>window.scrollTo({top:mapStart(),behavior:reduced?'instant':'smooth'})}>进入星图 <Icon/></button><span>十首精选作品</span></div>
 {fallback&&<span className="field-fallback-note">静态曲面</span>}
 </div>
 <div className="confluence-map" aria-hidden={!arrived} inert={!arrived}>{renderMap(paused||!mapActive)}<span className="sr-only">星图档案，十首精选作品</span></div>
 </section>;
}
