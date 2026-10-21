import {useEffect,useLayoutEffect,useRef,useState} from 'react';
import {createRoot} from 'react-dom/client';
import {VerticalStarMap as GravityScene} from './VerticalStarMap';
import {MobiusJourney as Confluence,mapStart} from './MobiusJourney';
import {AboutIdentity} from './AboutIdentity';
import {NavigationVeil} from './NavigationVeil';
import {useMotionPreference} from './useMotionPreference';
import {Icon} from './Icons';
import {usePlayer,format} from './usePlayer';
import './style.css';
import './refinement.css';
import {songById,featuredNumber} from './content';
import {CataloguePages,SongDetail} from './Pages';
import {Play} from './PlayerControls';
import {useMainPlayerVisibility} from './useMainPlayerVisibility';
import {readDetailContext,defaultCatalogue,type DetailContext} from './detail-context';
import './system.css';
import './gravity.css';
import './ui-review.css';
import './voyage.css';
import './confluence.css';
import './mobius.css';
import './vertical-lane.css';
import './river-source.css';
import './six-stage.css';
import './ring-entry.css';
import './featured-exhibition.css';
import './review-round2.css';
const Star=()=> <svg viewBox="0 0 32 32" fill="none" aria-hidden="true"><path d="M16 1v30M1 16h30M6 6l20 20M6 26L26 6" stroke="currentColor" strokeWidth=".7"/><circle cx="16" cy="16" r="5" stroke="currentColor" strokeWidth=".7"/></svg>;

function route(){const h=location.hash.slice(1);if(h==='archive')return 'map';if(h==='albums'||h.startsWith('album/')){history.replaceState(null,'','#works');return 'works'}if(['map','works','about'].includes(h))return h;if(/^work\/[1-9]\d*$/.test(h)&&songById(Number(h.slice(5)))){if(songById(Number(h.slice(5)))!.featured)return h;history.replaceState(null,'','#works');return 'works'}return 'home'}
function App(){
 const [page,setPage]=useState(route),[menuOpen,setMenuOpen]=useState(false),[selected,setSelected]=useState<number|null>(null),[atMap,setAtMap]=useState(false),[catalogueState,setCatalogueState]=useState(defaultCatalogue);
 const {reduced}=useMotionPreference();
 const journey=page==='home'||page==='map';
 const [lastSignal,setLastSignal]=useState<number|null>(page.startsWith('work/')?Number(page.split('/')[1]):null);
 const orbitMemory=useRef({x:0,y:0});
 const positionsMemory=useRef<Record<string,number>>({});
 const detailContext=useRef(readDetailContext(history.state,Number(page.split('/')[1]))),pendingContext=useRef<DetailContext|null>(null),explicitCatalogue=useRef(false);
 const mapMemory=useRef({id:null as number|null,scroll:0}),pageRef=useRef(page);
 // One audio instance survives navigation; detail visuals sample only while visible.
 const player=usePlayer(),transition=useRef<ReturnType<typeof setTimeout>|null>(null),main=useRef<HTMLElement>(null),initial=useRef(true);
 const active=page.startsWith('work/')?Number(page.split('/')[1]):null;const work=active?songById(active):null;const detail=active===4;const playingWork=songById(player.trackId)!;
 useEffect(()=>{document.title=work?`${work.title} — 阿尾｜星图档案馆`:`${page==='works'?'作品档案':page==='about'?'关于阿尾':journey&&atMap?'星图':'阿尾'}｜星图档案馆`},[work,page,journey,atMap]);
 const miniRef=useRef<HTMLElement>(null);
 const mainPlayerVisible=useMainPlayerVisibility(active,miniRef);
 const miniVisible=player.started&&!player.minimized&&playingWork.featured&&(active!==player.trackId||!mainPlayerVisible);
 useLayoutEffect(()=>{const node=miniRef.current;if(!miniVisible||!node)return;const reserve=()=>{const bottom=parseFloat(getComputedStyle(node).bottom)||0;document.documentElement.style.setProperty('--mini-space',`${node.getBoundingClientRect().height+bottom+20}px`)};const observer=new ResizeObserver(reserve);observer.observe(node);reserve();return()=>{observer.disconnect();document.documentElement.style.removeProperty('--mini-space')}},[miniVisible]);
 const cancelTransition=()=>{if(transition.current){clearTimeout(transition.current);transition.current=null}setSelected(null)};
 const readScroll=()=>document.body.style.position==='fixed'?-(parseFloat(document.body.style.top)||0):window.scrollY;
 const navigate=(to:string)=>{
  setMenuOpen(false);cancelTransition();explicitCatalogue.current=to==='other';
  if(to==='other'){setCatalogueState(defaultCatalogue());positionsMemory.current.works=0;to='works'}
  if(journey&&(to==='home'||to==='map')){if(to==='home'){mapMemory.current={id:null,scroll:0};Object.assign(orbitMemory.current,{x:0,y:0});setLastSignal(null);setAtMap(false)}requestAnimationFrame(()=>window.scrollTo({top:to==='home'?0:mapStart(),behavior:'instant'}));return}
  positionsMemory.current[pageRef.current]=readScroll();if(journey)mapMemory.current.scroll=readScroll();location.hash=to;
 };
 useEffect(()=>{const change=()=>{if(transition.current){clearTimeout(transition.current);transition.current=null}const next=route();positionsMemory.current[pageRef.current]=readScroll();setMenuOpen(false);if(['home','map'].includes(pageRef.current))mapMemory.current.scroll=readScroll();
  const from=detailContext.current;
  if(!explicitCatalogue.current&&pageRef.current.startsWith('work/')&&next===from.to){positionsMemory.current[next]=from.scroll;if(next==='works')setCatalogueState({...from.catalogue});else mapMemory.current={id:from.signal,scroll:from.scroll}}
  if(next.startsWith('work/')){const id=Number(next.split('/')[1]);if(pendingContext.current?.id===id){history.replaceState({...history.state,archiveDetail:pendingContext.current},'',location.href)}detailContext.current=readDetailContext(history.state,id)}
  pendingContext.current=null;explicitCatalogue.current=false;pageRef.current=next;setPage(next);setSelected(null)};window.addEventListener('hashchange',change);return()=>window.removeEventListener('hashchange',change)},[]);
 useLayoutEffect(()=>{const previous=history.scrollRestoration;history.scrollRestoration='manual';return()=>{history.scrollRestoration=previous}},[]);
 useLayoutEffect(()=>{if(journey){window.scrollTo({top:page==='home'?0:mapMemory.current.scroll||mapStart(),behavior:'instant'});if(page==='map'&&mapMemory.current.id)document.querySelector<HTMLButtonElement>(`[data-signal="${mapMemory.current.id}"]`)?.focus({preventScroll:true});initial.current=false;return}if(initial.current){initial.current=false;return}window.scrollTo({top:positionsMemory.current[page]||0,behavior:'instant'});main.current?.focus({preventScroll:true})},[page]);
 useEffect(()=>{if(!menuOpen)return;const key=(e:KeyboardEvent)=>{if(e.key==='Escape'){setMenuOpen(false);document.querySelector<HTMLButtonElement>('.menu-toggle')?.focus()}};document.addEventListener('keydown',key);return()=>document.removeEventListener('keydown',key)},[menuOpen]);

 useEffect(()=>{const change=()=>document.documentElement.classList.toggle('page-hidden',document.hidden);document.addEventListener('visibilitychange',change);change();return()=>{document.removeEventListener('visibilitychange',change);document.documentElement.classList.remove('page-hidden')}},[]);
 useEffect(()=>{document.documentElement.dataset.motion=reduced?'reduced':'full';return()=>{delete document.documentElement.dataset.motion}},[reduced]);
 useEffect(()=>{if(!work||reduced||document.querySelector('.featured-exhibition'))return;const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in-view');observer.unobserve(e.target)}}),{threshold:.12});document.querySelectorAll('.editorial').forEach(el=>observer.observe(el));return()=>observer.disconnect()},[page,reduced]);
 useEffect(()=>()=>{if(transition.current)clearTimeout(transition.current)},[]);
 const enter=(id:number,fromNext=false)=>{cancelTransition();if(fromNext)positionsMemory.current['work/'+id]=0;pendingContext.current=journey?{id,to:'map',scroll:readScroll(),signal:id,catalogue:{...catalogueState}}:page==='works'?{id,to:'works',scroll:readScroll(),signal:null,catalogue:{...catalogueState}}:{...detailContext.current,id};setLastSignal(id);mapMemory.current.id=id;if(journey)mapMemory.current.scroll=window.scrollY;
  if(reduced||!journey){navigate('work/'+id);return}
  setSelected(id);transition.current=setTimeout(()=>navigate('work/'+id),260);
 };
 return <div className={`app confluence-edition ${detail?'warm':''} ${journey?'home-page':''} ${miniVisible?'has-mini-player':''}`}>
 <a className="skip" href="#main" onClick={e=>{e.preventDefault();main.current?.focus()}}>跳至主要内容</a><div className="quiet-space" aria-hidden="true"/><div className="ambient" aria-hidden="true"/>
 <header className="header"><button className="brand" onClick={()=>navigate('home')} aria-label="阿尾 首页"><Star/><span>阿尾<span className="brand-caption">alwaysaway</span></span></button>
 <nav className="desktop-nav" aria-label="主导航">{[['map','星图'],['other','其他作品'],['about','关于']].map(([id,label])=><button key={id} aria-current={(id==='map'&&journey&&atMap)||(id==='other'&&page==='works')||(id==='about'&&page==='about')?'page':undefined} onClick={()=>navigate(id)}>{label}</button>)}</nav>
 <button className="menu-toggle" aria-label="打开导航" aria-haspopup="dialog" aria-expanded={menuOpen} onClick={()=>setMenuOpen(true)}><Icon kind="menu"/></button>
 </header>
 {menuOpen&&<NavigationVeil page={journey?(atMap?'map':'home'):page==='works'?'other':page} close={()=>setMenuOpen(false)} navigate={navigate}/>}
 <main data-page={journey?(atMap?'map':'home'):page} id="main" ref={main} tabIndex={-1} key={journey?'journey':page}>
 {journey&&<Confluence reduced={reduced} paused={menuOpen} onPhase={value=>{if(!['','home','map'].includes(location.hash.slice(1)))return;setAtMap(value);const hash=value?'#map':'#home';if(location.hash!==hash)history.replaceState(null,'',hash)}} renderMap={paused=><GravityScene mode="map" reduced={reduced} paused={paused} selected={selected} last={lastSignal} playing={player.playing} playingId={player.trackId} memory={orbitMemory.current} enter={enter}/>}/>}
 {work&&<SongDetail work={work} player={player} reduced={reduced} navigate={navigate} enter={enter} returnTo={detailContext.current.to}/>}
 {page==='about'&&<AboutIdentity/>}
 {page==='works'&&<CataloguePages enter={enter} player={player} state={catalogueState} onChange={setCatalogueState}/>}
 </main>
 {!journey&&<footer className="footer"><span>阿尾 <span className="subtle">alwaysaway</span></span><span className="subtle">星图档案馆 / Constellation Archive</span><button className="footer-about" onClick={()=>navigate('about')}>关于与联系</button></footer>}
 {miniVisible&&<aside ref={miniRef} className="mini-player" aria-label="持续播放控制"><img src={playingWork.art} alt=""/><button className="mini-title" onClick={()=>enter(player.trackId)}><span className="mono">{player.error?'播放失败':player.playing?'正在播放':player.duration>0&&player.time>=player.duration-.1?'播放结束':'已暂停'} / {featuredNumber(player.trackId)?String(featuredNumber(player.trackId)).padStart(2,'0'):'作品档案'}</span><strong>{playingWork.title}</strong></button><span className="mini-time mono">{format(player.time)} / {format(player.duration)}</span><input aria-label="迷你播放器进度" aria-valuetext={`${format(player.time)}，共 ${format(player.duration)}`} type="range" min="0" max={player.duration} step="0.1" value={player.time} disabled={player.duration<=0} onChange={e=>player.seek(Number(e.target.value))}/><button className={`mini-play orbit-play ${player.playing?'is-playing':''}`} onClick={()=>player.toggle()} aria-label={player.playing?'暂停':'继续播放'}><Play playing={player.playing}/></button><button className="mini-close" aria-label={player.playing?'暂停并收起播放器':'收起播放器'} title={player.playing?'暂停并收起':'收起播放器'} onClick={()=>{player.minimize();main.current?.focus({preventScroll:true})}}><Icon kind="close"/></button></aside>}
 {player.error&&playingWork.featured&&active!==player.trackId&&<div className="error" role="alert">{player.error}<button onClick={()=>player.play()}>重试播放</button></div>}
 </div>
}
createRoot(document.getElementById('root')!).render(<App/>);
