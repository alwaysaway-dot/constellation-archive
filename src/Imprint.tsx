import {useEffect,useRef,useState,type CSSProperties} from 'react';
import {featuredSongs,featuredNumber,type Song} from './content';
import {Icon} from './Icons';
import {SIGNAL_COLORS} from './gravity-layout';
export const imprintColor=(id:number)=>SIGNAL_COLORS[(featuredNumber(id)??1)-1];
export function CoverImage({song,className='',eager=false,sizes='(max-width:700px) 86vw, 50vw'}:{song:Song;className?:string;eager?:boolean;sizes?:string}){
 return <img className={className} width={1200} height={song.id===8?1800:1200} src={song.art} srcSet={`/imprint/${song.id}-480.webp 480w, /imprint/${song.id}-1200.webp 1200w`} sizes={sizes} alt={`${song.title} 正式封面`} loading={eager?'eager':'lazy'} fetchPriority={eager?'high':'auto'} decoding="async"/>;
}
const openingWorks=[featuredSongs[0],featuredSongs[2],featuredSongs[4]];
/** Scroll schedules one paint. Idle, hidden and reduced-motion views have no animation loop. */
export function ImprintHome({reduced,paused,navigate,enter,quickListen}:{reduced:boolean;paused:boolean;navigate:(page:string)=>void;enter:(id:number)=>void;quickListen:()=>void}){
 const host=useRef<HTMLElement>(null),frame=useRef<HTMLDivElement>(null),[current,setCurrent]=useState(0),currentRef=useRef(0);
 useEffect(()=>{
  const root=host.current!,view=frame.current!;let raf=0;
  const draw=()=>{raf=0;if(document.hidden||paused)return;const span=Math.max(1,root.offsetHeight-view.offsetHeight);const progress=reduced?0:Math.max(0,Math.min(1,-root.getBoundingClientRect().top/span));const section=Math.min(2,Math.floor(progress*3)),phase=Math.min(1,progress*3-section);
   if(currentRef.current!==section){currentRef.current=section;setCurrent(section)}
   view.style.setProperty('--exposure',`${section===0?58+phase*40:24+phase*74}%`);view.style.setProperty('--echo',String(reduced?0:.045*Math.sin(phase*Math.PI)));view.style.setProperty('--depth',`${reduced?0:(1-phase)*5}px`);view.dataset.progress=progress.toFixed(3);view.dataset.frame=String(Number(view.dataset.frame||0)+1);
  };
  const request=()=>{if(!raf&&!document.hidden&&!paused)raf=requestAnimationFrame(draw)};
  window.addEventListener('scroll',request,{passive:true});window.addEventListener('resize',request);document.addEventListener('visibilitychange',request);request();
  return()=>{cancelAnimationFrame(raf);window.removeEventListener('scroll',request);window.removeEventListener('resize',request);document.removeEventListener('visibilitychange',request)};
 },[reduced,paused]);
 const song=openingWorks[current];
 return <section ref={host} className={`imprint-home ${reduced?'is-reduced':''}`} aria-label="声音显影">
 <div ref={frame} className="imprint-frame" style={{'--tone':imprintColor(song.id)} as CSSProperties}>
 <div className="imprint-copy"><p className="imprint-kicker">星图档案馆 <span>CONSTELLATION ARCHIVE</span></p><h1>在意图与<br/>偶然之间，<br/><em>让想象成为声音。</em></h1><p className="imprint-description">阿尾的 AI 辅助音乐创作档案。</p><span className="imprint-side-note">SOUND, IN FOCUS.</span></div>
 <div className="imprint-optic">
 <div className="imprint-aperture">{openingWorks.map((s,i)=><div className={`imprint-layer ${i===current?'is-current':''}`} key={s.id} aria-hidden={i!==current}>
 <CoverImage song={s} eager={i===0} className="imprint-latent"/><div className="imprint-exposed" aria-hidden="true"><CoverImage song={s} eager={i===0}/></div><div className="imprint-residue" aria-hidden="true"><CoverImage song={s}/></div>
 </div>)}<i className="imprint-light" aria-hidden="true"/></div>
 <div className="imprint-caption"><span className="imprint-number">{String(featuredNumber(song.id)).padStart(2,'0')}<small>精选作品</small></span><button onClick={()=>enter(song.id)} aria-label={`进入作品 ${song.title}`}><strong>{song.title}</strong><span>{song.subtitle||song.description}</span><Icon/></button></div>
 </div>
 <div className="imprint-actions"><button className="imprint-primary" onClick={()=>navigate('exhibit')}>进入作品展陈 <Icon/></button><button className="imprint-secondary" onClick={()=>navigate('map')}>星图探索 <Icon/></button><button className="imprint-quick" onClick={quickListen} aria-label="快速试听 Leave the Hallway Light On">快速试听 <span>Leave the Hallway Light On</span></button></div>
 <div className="imprint-progress" aria-hidden="true"><span>{reduced?'声音显影':'向下滚动 · 影像渐显'}</span><div>{openingWorks.map((s,i)=><i key={s.id} className={i===current?'active':''}/>)}</div></div>
 </div></section>;
}
export function Exhibition({enter,navigate}:{enter:(id:number)=>void;navigate:(page:string)=>void}){
 return <section className="exhibition"><header className="exhibition-heading"><div><p className="imprint-kicker">精选展陈 <span>SELECTED WORKS</span></p><h1>声音有了<br/><em>可见的形状。</em></h1><p>十首精选作品，以声音相连。</p></div><button className="imprint-secondary" onClick={()=>navigate('map')}>以星图探索 <Icon/></button></header>
 <details className="exhibition-index"><summary>快速定位 <span>十首精选</span><Icon/></summary><ol>{featuredSongs.map((s,i)=><li key={s.id}><a href={`#work/${s.id}`} onClick={e=>{e.preventDefault();const index=e.currentTarget.closest('details');if(index)index.open=false;const target=document.getElementById(`exposure-${s.id}`);target?.scrollIntoView({behavior:'instant',block:'center'});target?.focus({preventScroll:true})}}><span>{String(i+1).padStart(2,'0')}</span>{s.title}</a></li>)}</ol></details>
 <div className="exhibition-grid">{featuredSongs.map((s,i)=><button id={`exposure-${s.id}`} className={`exhibit-work rhythm-${i%4}`} key={s.id} onClick={()=>enter(s.id)} style={{'--tone':imprintColor(s.id)} as CSSProperties} aria-label={`打开 ${s.title}，精选作品`}>
 <div className="exhibit-image"><CoverImage song={s} eager={i<2}/><i aria-hidden="true"/></div><div className="exhibit-caption"><span>{String(i+1).padStart(2,'0')}</span><div><h2>{s.title}</h2><p>{s.subtitle||s.description}</p></div><Icon/></div>
 </button>)}</div><div className="exhibition-end"><span>还有更多声音，等待被听见。</span><button className="imprint-secondary" onClick={()=>navigate('works')}>全部作品 <Icon/></button></div></section>;
}
