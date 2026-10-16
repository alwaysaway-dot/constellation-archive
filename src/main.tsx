import {useEffect,useLayoutEffect,useRef,useState} from 'react';
import {createRoot} from 'react-dom/client';
import {GravityScene} from './GravityScene';
import {NavigationVeil} from './NavigationVeil';
import {useMotionPreference} from './useMotionPreference';
import {Icon} from './Icons';
import {usePlayer,format} from './usePlayer';
import './style.css';
import './refinement.css';
import {songById,featuredNumber} from './content';
import {CataloguePages,SongDetail} from './Pages';
import {Play} from './PlayerControls';
import './system.css';
import './gravity.css';
import './ui-review.css';
import './voyage.css';
const Star=()=> <svg viewBox="0 0 32 32" fill="none" aria-hidden="true"><path d="M16 1v30M1 16h30M6 6l20 20M6 26L26 6" stroke="currentColor" strokeWidth=".7"/><circle cx="16" cy="16" r="5" stroke="currentColor" strokeWidth=".7"/></svg>;
const Arrow=()=> <Icon/>;
function route(){const h=location.hash.slice(1);if(h==='archive')return 'map';if(h==='albums'||h.startsWith('album/')){history.replaceState(null,'','#works');return 'works'}if(['map','works'].includes(h))return h;if(/^work\/[1-9]\d*$/.test(h)&&songById(Number(h.slice(5)))){if(songById(Number(h.slice(5)))!.featured)return h;history.replaceState(null,'','#works');return 'works'}return 'home'}
function App(){
 const [page,setPage]=useState(route),[menuOpen,setMenuOpen]=useState(false),[selected,setSelected]=useState<number|null>(null),[advancing,setAdvancing]=useState(false);
 const {reduced,systemReduced,choose}=useMotionPreference();
 const [homeFallback,setHomeFallback]=useState(false);
 const [lastSignal,setLastSignal]=useState<number|null>(page.startsWith('work/')?Number(page.split('/')[1]):null);
 const orbitMemory=useRef({x:0,y:0}),homeMemory=useRef({x:0,y:0});
 const positionsMemory=useRef<Record<string,number>>({}),returnPage=useRef('map');
 const mapMemory=useRef({id:null as number|null,scroll:0}),pageRef=useRef(page);
 // One audio instance survives navigation; detail visuals sample only while visible.
 const player=usePlayer(),transition=useRef<ReturnType<typeof setTimeout>|null>(null),main=useRef<HTMLElement>(null),initial=useRef(true);
 const active=page.startsWith('work/')?Number(page.split('/')[1]):null;const work=active?songById(active):null;const detail=active===4;const playingWork=songById(player.trackId)!;
 const miniRef=useRef<HTMLElement>(null);
 const miniVisible=player.started&&!player.minimized&&playingWork.featured&&active!==player.trackId;
 useLayoutEffect(()=>{const node=miniRef.current;if(!miniVisible||!node)return;const reserve=()=>{const bottom=parseFloat(getComputedStyle(node).bottom)||0;document.documentElement.style.setProperty('--mini-space',`${node.getBoundingClientRect().height+bottom+20}px`)};const observer=new ResizeObserver(reserve);observer.observe(node);reserve();return()=>{observer.disconnect();document.documentElement.style.removeProperty('--mini-space')}},[miniVisible]);
 const cancelTransition=()=>{if(transition.current){clearTimeout(transition.current);transition.current=null}setSelected(null);setAdvancing(false)};
 const readScroll=()=>document.body.style.position==='fixed'?-(parseFloat(document.body.style.top)||0):window.scrollY;
 const navigate=(to:string)=>{if(to==='map'&&pageRef.current==='home'){mapMemory.current={id:null,scroll:0};orbitMemory.current.x=0;orbitMemory.current.y=0;setLastSignal(null)}positionsMemory.current[pageRef.current]=readScroll();setMenuOpen(false);if(pageRef.current==='map')mapMemory.current.scroll=readScroll();cancelTransition();location.hash=to};
 useEffect(()=>{const change=()=>{if(transition.current){clearTimeout(transition.current);transition.current=null}const next=route();positionsMemory.current[pageRef.current]=readScroll();setMenuOpen(false);if(pageRef.current==='map')mapMemory.current.scroll=readScroll();pageRef.current=next;setPage(next);setSelected(null);setAdvancing(false)};window.addEventListener('hashchange',change);return()=>window.removeEventListener('hashchange',change)},[]);
 useLayoutEffect(()=>{const previous=history.scrollRestoration;history.scrollRestoration='manual';return()=>{history.scrollRestoration=previous}},[]);
 useLayoutEffect(()=>{if(initial.current){initial.current=false;return}if(page==='map'){window.scrollTo({top:mapMemory.current.scroll,behavior:'instant'});const node=document.querySelector<HTMLButtonElement>(`[data-signal="${mapMemory.current.id}"]`);if(node){node.focus({preventScroll:true});return}}else{window.scrollTo({top:positionsMemory.current[page]||0,behavior:'instant'})}main.current?.focus({preventScroll:true})},[page]);
 useEffect(()=>{if(!menuOpen)return;const key=(e:KeyboardEvent)=>{if(e.key==='Escape'){setMenuOpen(false);document.querySelector<HTMLButtonElement>('.menu-toggle')?.focus()}};document.addEventListener('keydown',key);return()=>document.removeEventListener('keydown',key)},[menuOpen]);

 useEffect(()=>{const change=()=>document.documentElement.classList.toggle('page-hidden',document.hidden);document.addEventListener('visibilitychange',change);change();return()=>{document.removeEventListener('visibilitychange',change);document.documentElement.classList.remove('page-hidden')}},[]);
 useEffect(()=>{document.documentElement.dataset.motion=reduced?'reduced':'full';return()=>{delete document.documentElement.dataset.motion}},[reduced]);
 useEffect(()=>{if(!work||reduced)return;const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in-view');observer.unobserve(e.target)}}),{threshold:.12});document.querySelectorAll('.editorial').forEach(el=>observer.observe(el));return()=>observer.disconnect()},[page,reduced]);
 useEffect(()=>()=>{if(transition.current)clearTimeout(transition.current)},[]);
 const enter=(id:number)=>{cancelTransition();if(['map','works'].includes(page))returnPage.current=page;setLastSignal(id);mapMemory.current.id=id;if(page==='map')mapMemory.current.scroll=window.scrollY;
  if(reduced||page!=='map'){navigate('work/'+id);return}
  setSelected(id);transition.current=setTimeout(()=>navigate('work/'+id),260);
 };
 const explore=()=>{if(reduced||homeFallback){navigate('map');return}cancelTransition();setAdvancing(true);transition.current=setTimeout(()=>navigate('map'),680)};
 return <div className={`app ${detail?'warm':''} ${page==='home'?'home-page':''} ${miniVisible?'has-mini-player':''}`}>
 <a className="skip" href="#main" onClick={e=>{e.preventDefault();main.current?.focus()}}>跳至主要内容</a><div className="quiet-space" aria-hidden="true"/><div className="ambient" aria-hidden="true"/>
 <header className="header"><button className="brand" onClick={()=>navigate('home')} aria-label="阿尾 首页"><Star/><span>阿尾<span className="brand-caption">alwaysaway</span></span></button>
 <nav className="desktop-nav" aria-label="主导航">{[['home','首页'],['map','星图档案'],['works','全部作品']].map(([id,label])=><button key={id} aria-current={page===id?'page':undefined} onClick={()=>navigate(id)}>{label}</button>)}</nav>
 <button className="menu-toggle" aria-label="打开导航" aria-haspopup="dialog" aria-expanded={menuOpen} onClick={()=>setMenuOpen(true)}><Icon kind="menu"/></button>
 </header>
 {menuOpen&&<NavigationVeil reduced={reduced} systemReduced={systemReduced} chooseMotion={choose} page={page} close={()=>setMenuOpen(false)} navigate={navigate}/>}
 <main data-page={page} id="main" ref={main} tabIndex={-1} key={page}>
 {page==='home'&&<section className={`hero ${advancing?'is-advancing':''}`}>
 <GravityScene onFallback={setHomeFallback} mode="home" reduced={reduced} paused={menuOpen} selected={null} last={null} playing={player.playing} playingId={player.trackId} advance={advancing} memory={homeMemory.current} enter={enter}/>
 <div className="hero-content"><p className="eyebrow">星图档案馆 <span className="little-line"/> CONSTELLATION ARCHIVE</p><h1>在意图与偶然之间，<br/><em>让想象成为声音。</em></h1><p className="hero-copy">阿尾的 AI 辅助音乐创作档案。</p></div>
 <div className="hero-actions"><button className="orbit-entry" onClick={explore}><span className="entry-ring"><Arrow/></span><span>探索星图</span></button><button className="text-button quick-listen" aria-label="快速试听 Leave the Hallway Light On" onClick={()=>{void player.play(4);navigate('work/4')}}><Play playing={false}/><span>快速试听<small>Leave the Hallway Light On</small></span></button></div>
 <div className="hero-bottom"><span className="mono subtle">SOUND, IN ORBIT.{homeFallback&&<small className="hero-renderer-note">静态星域 · 当前环境未启用 WebGL</small>}</span><span>10 <small>精选作品</small></span></div>
 </section>}
 {page==='map'&&<section className="collection map"><div className="collection-heading"><div><p className="eyebrow">星图档案</p><h1>每一种声音，<br/><em>都有自己的宇宙。</em></h1><p className="subtle">十首精选作品，十种不同的声音表达。</p></div></div>
 <GravityScene mode="map" reduced={reduced} paused={menuOpen} selected={selected} last={lastSignal} playing={player.playing} playingId={player.trackId} memory={orbitMemory.current} enter={enter}/>
 </section>}
 {work&&<SongDetail work={work} player={player} reduced={reduced} navigate={navigate} enter={enter} returnTo={returnPage.current}/>}
 {page==='works'&&<CataloguePages enter={enter} player={player}/>}
 </main>
 {page!=='home'&&<footer className="footer"><span>阿尾 <span className="subtle">alwaysaway</span></span><span className="subtle">星图档案馆 / Constellation Archive</span><span className="mono subtle">SOUND, IN ORBIT.</span></footer>}
 {miniVisible&&<aside ref={miniRef} className="mini-player" aria-label="持续播放控制"><img src={playingWork.art} alt=""/><button className="mini-title" onClick={()=>navigate('work/'+player.trackId)}><span className="mono">{player.playing?'正在播放':'已暂停'} / {featuredNumber(player.trackId)?String(featuredNumber(player.trackId)).padStart(2,'0'):'作品档案'}</span><strong>{playingWork.title}</strong></button><span className="mini-time mono">{format(player.time)} / {format(player.duration)}</span><input aria-label="迷你播放器进度" type="range" min="0" max={player.duration} step="0.1" value={player.time} onChange={e=>player.seek(Number(e.target.value))}/><button className={`mini-play orbit-play ${player.playing?'is-playing':''}`} onClick={()=>player.toggle()} aria-label={player.playing?'暂停':'继续播放'}><Play playing={player.playing}/></button><button className="mini-close" aria-label={player.playing?'暂停并收起播放器':'收起播放器'} title={player.playing?'暂停并收起':'收起播放器'} onClick={()=>{player.minimize();main.current?.focus({preventScroll:true})}}><Icon kind="close"/></button></aside>}
 {player.error&&playingWork.featured&&active!==player.trackId&&<div className="error" role="alert">{player.error}<button onClick={()=>player.play()}>重试播放</button></div>}
 </div>
}
createRoot(document.getElementById('root')!).render(<App/>);
